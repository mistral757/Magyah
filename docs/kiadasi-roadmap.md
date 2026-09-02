# Kiadási roadmap — mi kell ahhoz, hogy a Magyah kimenjen a Google Play-re

*(3.9.03, 2026. szeptember. Ez a dokumentum a KIADÁS állapotát írja le, nem egy
rendszert. Három szálon fut: jogtisztaság · mentés-stabilitás · csomagolás.)*

> **Naplózás.**
> **3.9.02** — **F1** (betűk önhosztolása) és **F2** (tartós tárhely) kész:
> `docs/betuk-es-tarhely.md`. Az F2 mellékesen becsukta a 2. szál 5. lyukát is
> (kvóta-mérés). Emellett kiderült, hogy a service worker **soha nem futott**:
> az `index.html` a `/sw.js`-t regisztrálta, a repóban viszont `sw-1.js` van —
> a regisztráció némán elbukott. Javítva (3.9.03), lásd a 3.7 pontot.
> **3.9.03** — **F3** (mentés kimentése és visszatöltése) kész:
> `docs/mentes-kimentes-visszatoltes.md`. **Ezzel a kód kiadható állapotban
> van**; ami hátra van, az a papírmunka és a csomagolás.

> **Előzmény.** Ilyen dokumentum korábban NEM létezett a repóban — végignéztem a
> teljes git-történetet. Ami eddig volt, három külön helyen élt:
> `tools/nevek/README.md` (jogtisztaság), a mentés-doksik
> (`beallitasok-es-mentesi-helyek.md`, `mentes-torles.md`) és
> `docs/telepites-gomb.md` (PWA-telepítés). Ez a lap fogja őket össze, és
> minden állítása a KÓDBÓL van ellenőrizve, nem emlékezetből.

---

## 0. Hol tartunk — egy pillantásra

| szál | állapot | mi van hátra |
|---|---|---|
| **Jogtisztaság** | ✅ **kész** | — (a Google Fonts is megszűnt, 3.9.02) |
| **Mentés-stabilitás** | ✅ **kiadható** | három nem-blokkoló minőségjavítás maradt |
| **Csomagolás (Play)** | ❌ **nulláról** | manifest · TWA · Play Console papírok |

**A KÓD KIADHATÓ ÁLLAPOTBAN VAN.** Mind a három kiadásblokkoló elkészült: a
jogtisztaság (a nevek és a betűk), a tartós tárhely és a mentés
export/importja. Ami hátra van, az **papír és csomagolás**.

**A kritikus út nem a kód, hanem a papír.** A Play Console kötelező mezői
(adatvédelmi tájékoztató, Data safety, IARC) egyetlen sor kódot sem igényelnek,
viszont nélkülük *semmi* nem publikálható — és átfutási idejük van.

---

## 1. Jogtisztaság — kész ✅

### Ami megvan

| réteg | hol | mit csinál |
|---|---|---|
| névtábla-generátor | `tools/nevek/build.py` + `manual.py` (656 kézi) + `rules.py` | a `HU_NAME_TABLE` előállítása |
| klub- és liganevek | `tools/nevek/klubok.py` | 179 klub + 29 liga, kézzel |
| megjelenítési réteg | `fullName` / `shortName` / `teamLabel` / `clubLabel` / `leagueLabel` | a képernyőre csak magyarított név kerül |
| **a háló** | `tools/nev-audit.js` (a `check.sh` 3. ellenőrzése) | elkapja, ha egy kiírás kimarad a rétegből |
| végponti próba | `tools/nevek/leak.js` | végigjátszik a draftig, keres valós nevet |
| **kiadási build** | `tools/nevek/release.py` → `dist/index.html` | a valós neveket az ADATBÓL is kicseréli |

A release-build nem kozmetika: a repóbeli `index.html` **tartalmazza** a valós
neveket kulcsként, a klubtörténetekben és a kommentekben — egy „forrás
megtekintése" mindet megmutatná. A build átlátszatlan, SHA1-alapú
azonosítókra cserél (determinisztikus, tehát két build mentései
kompatibilisek), kiüríti a klubtörténeteket, eltávolítja a kommenteket, és a
végén **ellenőrzi magát**.

**Mérve a jelenlegi kódon (3.9.01):**

```
személynév: 3650 · klub: 193 · liga: 29
lecserélt szövegliterál: 15203 · kiürített klubtörténet: 556
kommentek: 1 916 491 karakterrel rövidebb
fájl: dist/index.html · 3,0 MB (forrás 5,3 MB)
✓ egyetlen valós név sem maradt a kiadott fájlban
```

…és a `dist/index.html` böngészőben hiba nélkül betöltődik.

### A Google Fonts — megoldva (3.9.02) ✅

Volt egy nyitott apróság: az `index.html` fejléce öt betűcsaládot töltött a
`fonts.googleapis.com`-ról, tehát **minden megnyitáskor** egy harmadik félhez
került a felhasználó IP-címe, hozzájárulás nélkül — és hálózat nélkül a
tipográfia szétesett.

**Elkészült (F1).** Tíz `woff2` fájl a `fonts/` könyvtárban (összesen 280 kB),
tíz `@font-face` a stíluslap tetején, a licenc a `fonts/OFL.txt`-ben, és mind a
tíz fájl a service worker `STATIC_ASSETS`-ében (a `CACHE_NAME` ezért lépett
`v3`-ra). Böngészőben mérve: **nulla külső kérés** a betöltés alatt, és
hálózat nélkül újratöltve mind az öt család a cache-ből jön.

Részletek — köztük, hogy miért kellett a `latin-ext` szelet is (ő, ű), és
miért nem a teljes súlytengelyt kötöttük be: **`docs/betuk-es-tarhely.md`**.

> **Ami marad, más műfaj.** A PvP-ág a Firebase SDK-t a `gstatic.com`-ról
> importálja — de csak akkor, amikor a felhasználó maga lép a közös karrier
> felé. Ez egy hálózati funkció hálózati kérése, nem passzív nyomkövetés.
> A Play adatbiztonsági kérdőívén viszont a **PvP-ág** adatkezelését így is
> le kell írni (lásd 3.4).

---

## 2. Mentés-stabilitás — erős alap, hat lyuk ⚠️

### Ami már megvan (és jó)

A mentési réteg érettebb, mint amilyennek látszik — több éles adatvesztés
tanulságát hordozza:

* **három egyjátékos hely + szobánként külön kulcs** (`spSaveKeyFor`,
  `mpSaveKeyFor`);
* **mentési ZÁR** (`_saveLock`): ha a mentés célja eltér attól, ahonnan a futó
  játék jött, **nem írunk** — inkább vesszen egy forduló, mint egy másik
  karrier;
* **a félbemaradt betöltés mérgez** (`_saveBroken`): egy elszállt
  `applySavedGame` után a `saveGame` egyáltalán nem ír, hogy egy fél-állapot
  ne írhassa felül az épet;
* **kvótahiba nem néma**: `saveWrite` takarít és újrapróbál, és ha úgy sem megy,
  tartós piros sáv (`#saveWarn`) marad kint, amíg egy mentés nem sikerül;
* **`packCareerPool` tömörítés**: egy 4. szezonos karrier mentése 578 kB volt,
  ennek 96%-a a `careerPool` — pozíciós számtömbbé alakítva, a statikus
  regiszterből visszakereshető mezők elhagyásával;
* **„Mentések és tárhely"** lista méretekkel + törlési folyamat, ami előbb
  felkínálja a karrier `.txt` összegzésének letöltését.

### A hat lyukból négy maradt

| # | lyuk | miért számít | méret |
|---|---|---|---|
| ~~**1**~~ | ~~`navigator.storage.persist()` sehol nincs meghívva~~ | ✅ **kész (3.9.02, F2).** Az első sikeres mentés után és telepítéskor kérünk, a „Mentések és tárhely" ablak mutatja az állapotot, és kézzel is újrakérhető. Lásd `docs/betuk-es-tarhely.md`. | — |
| ~~**2**~~ | ~~nincs valódi biztonsági mentés (export/import)~~ | ✅ **kész (3.9.03, F3).** A mentés fájlba menthető és fájlból visszatölthető, boríték-formátummal, helyválasztóval és felülírás-védelemmel. Lásd `docs/mentes-kimentes-visszatoltes.md`. | — |
| **3** | **a séma-verzió írva van, de sosem olvasva** | a `saveGame` `v:1`-et ír, az `applySavedGame` **sosem nézi meg** a `d.v`-t. Egy jövőbeli inkompatibilis változás fél-betöltéshez és `_saveBroken`-hez vezet, világos üzenet nélkül. | **kicsi** |
| **4** | **nincs „előző jó mentés"** | a `setItem` kulcsonként atomi, tehát fél-írás nincs — de ha maga a MENTETT állapot hibás, nincs mihez visszanyúlni. Egy második, eggyel korábbi példány (rolling backup) ezt megfogná. | **kicsi** |
| ~~**5**~~ | ~~a kvótát nem mérjük~~ | ✅ **kész (3.9.02, F2 mellékága).** A „Mentések és tárhely" kiírja a `storage.estimate()` szerinti *felhasznált / keret* párt, és megkülönbözteti a localStorage saját 5 MB-os korlátjától. | — |
| **6** | **localStorage-plafon** | a localStorage saját, ~5 MB-os origin-korlát alatt fut, **függetlenül** attól, mit ígér a `storage.estimate()` (ebben a Chromiumban 919 MB — de az az IndexedDB/Cache kvótája). Három hely + néhány szoba a plafon közelébe visz. Az igazi megoldás IndexedDB, de az nagyobb munka. | **nagy** |

### Sorrend és indoklás

**Kiadásblokkoló volt 1 és 2 — mindkettő kész.** Az 1. a 3.9.02-ben (a mentés
már nem lakoltatható ki magától), a 2. a 3.9.03-ban (a mentés kimenthető és
visszatölthető). A megmaradt három komoly minőségjavítás, de nélkülük is ki
lehet adni.

A **3–4** apró és egymást erősíti: együtt egy „mentés-egészség" csomag
(verzió-kapu + rollback), ami egyben tesztelhető. **Az F3 óta olcsóbb is:** a
boríték `f` mezője már egy működő formátum-kapu, a 3. lyuk (a `d.v` sosem
olvasott) ugyanennek a mintának a mentésen belüli párja.

A **6** (IndexedDB) **szándékosan a kiadás UTÁNRA** való. A tömörítés már
megvette a szükséges levegőt; a migráció kockázata most nagyobb, mint a haszna.

---

## 3. Csomagolás — Google Play ❌

### Ami már megvan

* **manifest** (`icons/site.webmanifest`): név, ikonok 72–512-ig,
  `display:"fullscreen"`, `display_override`, `start_url:"/"`;
* **service worker** (`sw-1.js`): a fő HTML *network-first* (új verzió azonnal
  elér), a statikus fájlok *cache-first*;
* **telepítés-gomb** (`#installBtn`) böngészőfüggetlen kézi útmutatóval — lásd
  `docs/telepites-gomb.md`;
* HTTPS-en futó éles cím (Netlify).

Vagyis a **PWA már ma telepíthető**. A Play-re kerüléshez a webet egy
**TWA-burokba** (Trusted Web Activity) kell tenni.

### Ami hiányzik

#### 3.1 Manifest-kiegészítés — *kicsi*

| mező | miért |
|---|---|
| **`purpose:"maskable"` ikon** | mérve: **nulla** `maskable` a manifestben. Enélkül az Android launcher fehér dobozba teszi az ikont. Kell egy külön, biztonságos zónával rajzolt 512-es változat. |
| `id` | a Play és a böngésző ebből azonosítja az appot verziók között |
| `description`, `lang:"hu"`, `dir:"ltr"` | a Bubblewrap/PWABuilder és a Play listázás is kéri |
| `scope:"/"` | enélkül a TWA kiléphet a böngészőbe |
| `categories`, `screenshots` | a Play áruházi lap képei amúgy is kötelezők |

#### 3.2 Digital Asset Links — *kicsi, de kritikus*

`/.well-known/assetlinks.json` az éles domainre, benne a **Play-aláírás
SHA-256 ujjlenyomata**. Enélkül a TWA-ban ott marad a böngésző címsávja —
vagyis nem app-nak látszik, hanem weboldalnak. Ez a leggyakoribb elrontott
lépés.

#### 3.3 A burok — *közepes*

Bubblewrap CLI vagy PWABuilder → aláírt **AAB**. El kell dönteni és rögzíteni:
`applicationId`, `versionCode`/`versionName` viszonya az `APP_VERSION`-höz,
és az aláíró kulcs tárolása (elvesztése = az app többé nem frissíthető).

#### 3.4 Play Console — a papírmunka — *közepes, de átfutási ideje van*

| kötelező | állapot | megjegyzés |
|---|---|---|
| **adatvédelmi tájékoztató URL** | ❌ **nincs** | mérve: nulla találat „adatvédel/privacy"-re a kódban és a doksikban. Akkor is kötelező, ha semmit nem gyűjtünk — és itt **gyűjtünk valamit** (lásd lent). |
| **Data safety űrlap** | ❌ nincs | a PvP a Firebase RTDB-be küld: szobakód, keret-pillanatkép, eredmények. Ezt deklarálni kell. |
| **IARC tartalmi besorolás** | ❌ nincs | kérdőív, gyors |
| célközönség, kereskedelmi státusz, áruházi lap | ❌ nincs | screenshotok, ikon, leírás |

#### 3.5 Firebase — átnézés kiadás előtt — *kicsi*

A `tools/firebase-rules.json` szigorúnak látszik (gyökéren `.read/.write:false`,
csak 4 karakteres szobakód alatt írható, mezőnkénti `.validate`), **de a
repóbeli fájl nem bizonyítja, hogy ki is van adva** — a konzolban ellenőrizni
kell.

Két érdemi kérdés marad:

* **A 4 karakteres szobakód kitalálható.** ~1,7 millió kombináció: aki
  végigpróbálja, bármelyik szoba adatát olvashatja és írhatja. Ma ez egy
  baráti funkció, egy nyilvános kiadásnál viszont már felület. Megfontolandó:
  hosszabb kód, lejárat, vagy írás-korlátozás.
* Az `apiKey` a kliensben van — **ez rendben van**, nyilvános azonosító, a
  hozzáférést a szabályok döntik el (a kód kommentje ezt helyesen mondja).

#### 3.6 Offline első betöltés — *kicsi*

A service worker a `"/"`-t cache-eli, de az `index.html` **nincs** a
`STATIC_ASSETS`-ben, tehát az első betöltéshez net kell. TWA-nál ez ugyanígy
igaz. Ha a cél „telepítés után net nélkül is indul", az `index.html`-t
install-időben elő kell cache-elni — a *network-first* stratégia emellett
változatlanul maradhat.

#### 3.7 A service worker soha nem futott — megoldva (3.9.03) ✅

Az `index.html` a **`/sw.js`**-t regisztrálta, a repóban viszont **`sw-1.js`**
van, és nincs se `_redirects`, se `netlify.toml`, ami a kettőt összekötné (a
teljes git-történetben egyetlen `sw.js` sem szerepelt). A `register()` tehát
404-be futott, a `.catch(()=>{})` pedig elnyelte: **a service worker
soha nem regisztrálódott.**

Ennek visszamenőleg is jelentése van: az offline mód eddig nem működött, és
minden korábbi `CACHE_NAME`-léptetés hatástalan volt — nem volt mit léptetni.
(Ahol a doksik „régi telepítések cache-elt manifestjéről" írnak, ott a
következtetés helyes volt, csak a feltétele nem teljesült.)

**A javítás:** a regisztráció igazodik a fájlhoz (`/sw-1.js`). A név marad —
a doksik és a kód kommentjei erre hivatkoznak, és egy átnevezés csak
felesleges mozgás lenne. **Az első éles feltöltés után ezt ellenőrizni kell**
(alkalmazás → service workerek): mostantól tényleg fut, tehát a
cache-first statikus ág is tényleg dolgozik.

---

## 4. A javasolt sorrend

```
┌─ MOST ─────────────────────────────────────────────────────────────┐
│ F1  Betűk önhosztolása          ✅ KÉSZ (3.9.02)                    │
│ F2  storage.persist()           ✅ KÉSZ (3.9.02)                    │
│ F3  Mentés export/import        ✅ KÉSZ (3.9.03)                    │
└────────────────────────────────────────────────────────────────────┘
              │  ← ITT MÁR KIADHATÓ ÁLLAPOTBAN VAN A KÓD  ◀ ITT TARTUNK
┌─ PAPÍR (párhuzamosan indítható) ───────────────────────────────────┐
│ F4  Adatvédelmi tájékoztató + Data safety + IARC   ◀ EZ A KÖVETKEZŐ │
└────────────────────────────────────────────────────────────────────┘
┌─ CSOMAGOLÁS ───────────────────────────────────────────────────────┐
│ F5  Manifest-kiegészítés + maskable ikon                           │
│ F6  assetlinks.json + Bubblewrap → aláírt AAB                      │
│ F7  Firebase-szabályok ellenőrzése + szobakód-döntés               │
│ F8  SW: index.html precache                                        │
└────────────────────────────────────────────────────────────────────┘
┌─ KIADÁS ───────────────────────────────────────────────────────────┐
│ F9  release.py → dist/ → deploy → belső teszt sáv → éles           │
└────────────────────────────────────────────────────────────────────┘
┌─ UTÁNA ────────────────────────────────────────────────────────────┐
│ F10 Mentés-egészség (verzió-kapu, rollback)                        │
│ F11 IndexedDB-migráció                                             │
└────────────────────────────────────────────────────────────────────┘
```

**Miért ez a sorrend.** A papírmunka (F4) az egyetlen szál, aminek külső
átfutási ideje van, ezért a lehető legkorábban indul, párhuzamosan a kóddal. A
csomagolás (F5–F8) csak akkor éri meg, ha a kód már kiadható — különben
kétszer kell AAB-t építeni. Az F10–F11 pedig szándékosan a kiadás után van: a
mostani réteg elég jó ahhoz, hogy éles felhasználókat kiszolgáljon, és a
migráció kockázata most nagyobb, mint a haszna.

---

## 5. A kiadási ellenőrzőlista (F9)

Ezt kell végigfuttatni **minden** Play-re szánt buildnél:

```bash
./tools/check.sh                   # szintaxis · globálisok · nyers nevek
./tools/ledger-audit.sh            # a büdzsé könyvelése
node tools/nevek/leak.js           # végponti névpróba (draftig végigjátszva)
python3 tools/nevek/release.py     # → dist/index.html, önellenőrzéssel
```

> **A `dist/` nem elég önmagában.** A `release.py` csak az `index.html`-t
> írja ki; a kiszolgálóra mellé kell a **`fonts/`**, az **`icons/`** és a
> service worker is. Ha a `fonts/` lemarad, a kiadott build tipográfiája
> csendben rendszerbetűre esik vissza — hibaüzenet nélkül.

…majd kézzel:

- [ ] a `dist/index.html` böngészőben betöltődik, hibaüzenet nélkül;
- [ ] a `dist`-en **nincs külső hálózati kérés** a betöltés alatt (a betűk a
      `/fonts`-ból jönnek), és a magyar ő/ű a helyes betűvel rajzolódik;
- [ ] a service worker **tényleg regisztrál** (böngésző → alkalmazás → service
      workerek), és a cache neve a mostani `CACHE_NAME`;
- [ ] egy karrier **kimentése és visszatöltése** működik a `dist`-en is;
- [ ] egy karrier a draftig végigjátszható a `dist`-en;
- [ ] a `dist` mentése betöltődik és folytatható;
- [ ] a telepített (TWA) példányban nincs böngésző-címsáv (= az assetlinks jó);
- [ ] repülőgép módban a játék elindul és játszható;
- [ ] `APP_VERSION` ↔ `versionName` egyezik, `versionCode` nőtt.

---

## 6. Amit szándékosan NEM csinálunk a kiadáshoz

* **Nem költözünk IndexedDB-re.** A tömörítés megvette a szükséges levegőt; a
  migráció kockázata most nagyobb, mint a haszna. (F11, kiadás után.)
* **Nem építünk fiókrendszert.** Nincs bejelentkezés, tehát nem kell
  fiók-törlési URL, és a Data safety is sokkal egyszerűbb marad.
* **Nem viszünk natív kódot a burokba.** A TWA a webet tölti — így a
  tartalomfrissítés a deploy, nem egy Play-frissítés; a Play-en csak a burok
  megy át.
* **Nem szedjük ki a családi (nem strippelt) verziót a repóból.** Az a
  fejlesztés forrása; a kiadott termék a `dist/`, ami nincs verziókövetve.

---

## 7. Nyitott kérdések — ezekre döntés kell

1. **A szobakód hossza.** Marad a 4 karakteres (kényelmes, de kitalálható),
   vagy hosszabb lesz a nyilvános kiadásra? Ez érinti a meglévő szobákat.
2. **Célpiac.** Csak magyar (`lang:"hu"`), vagy nyitunk? A magyarított nevek
   és az egész hangvétel magyar — ez a listázást és a besorolást is eldönti.
3. **Ingyenes vagy fizetős.** A Data safety és a kereskedelmi státusz ettől
   függ, és a Play-fiók regisztrációs díja amúgy is előfeltétel.
4. **Az aláíró kulcs tárolása.** Play App Signing (a Google őrzi) vagy saját
   kulcs? Az elvesztett saját kulccsal az app többé nem frissíthető.
