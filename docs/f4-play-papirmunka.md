# 📋 F4 — A Play-papírmunka válaszlapja

*(3.9.10, frissítve **3.9.50**. A kiadási roadmap 3.4 pontja. Ez a lap
**előkészítés**: a Play Console-ba kézzel kell bepötyögni, de a válaszok itt
már megvannak, és a kódból vannak levezetve — nem emlékezetből.)*

> **3.9.50 — KÉT VÁLTOZÁS.** (1) Az **értesítések** (push) a 3.9.22-ben
> érkeztek, ez a lap viszont a 3.9.10-en állt: egy HARMADIK adatkiáramlás
> hiányzott belőle. Pótolva, lásd az 1.3-at és a 2.2-t. (2) Az adatvédelmi
> tájékoztató **három placeholderje kitöltve** — a 4. szakasz már nem
> feladatot ír le, hanem állapotot.

## 0. Egy mondatban

A játék **alapesetben semmit nem küld el**; adat csak akkor mozdul, ha a
felhasználó ranglistára tölt fel, kétjátékos szobát nyit, vagy bekapcsolja az
**értesítéseket**. **Nincs hirdetés, nincs analitika, nincs regisztráció,
nincs vásárlás.**

---

## 1. Az audit — mi hagyja el a készüléket

Nem becslés: a `index.html` átvizsgálásából. **A teljes kódban három külső
hoszt szerepel**, és ebből az egyik nem is hálózati hívás:

| hoszt | mire |
|---|---|
| `gstatic.com` | a Firebase programkönyvtár letöltése (futásidőben, `import`) |
| `…europe-west1.firebasedatabase.app` | az adatbázis (Frankfurt, EU) |
| a saját domain `/.netlify/functions/nudge` | az értesítés-küldő függvény (3.9.22) |
| *(a böngésző push-szolgáltatója)* | a kézbesítés — **nem a mi hívásunk**: a böngésző hívja, a feliratkozás címe dönti el, kit (Google / Mozilla / Apple) |
| `w3.org` | csak az SVG névtér-azonosító — **nem hálózati kérés** |

**Nulla találat** ezekre: `gtag`, Google Analytics, Tag Manager, Sentry,
Mixpanel, Amplitude, AdSense, AdMob, Facebook SDK.

### 1.1 Globális ranglista — választható, bejelentkezéssel

Firebase **anonim** bejelentkezés (`signInAnonymously`). Csak akkor ír, ha van
becenév ÉS a felhasználó megnyomja a feltöltést. A rekord:

| mező | tartalom |
|---|---|
| `nick` | **a felhasználó által írt becenév**, ≤20 karakter |
| `pid` | helyi profilazonosító, ≤24 karakter |
| `infRun`, `infLevel`, `infSeasons` | a futás számai |
| `team`, `mode`, `style`, `titles`, `ballons` | csapatnév és a karrier jellemzői |
| `at` | időbélyeg |
| *(kulcs)* | `<anonim-auth-uid>_<karrier-azonosító>` |

### 1.2 Kétjátékos szoba — választható, bejelentkezés NÉLKÜL

`mp/rooms/<4 karakteres kód>`: kód, játékmód, létrehozás ideje, közös
világ-mag, a résztvevők szerepe és készenléte, és a fordulók eredményei.

### 1.3 Értesítések — választható, engedélyhez kötött *(3.9.22)*

**Ez a harmadik adatkiáramlás, és 3.9.50-ig hiányzott erről a lapról.**

A kétjátékos módban a játékos **megbökheti a társát**, ha rá vár. Ehhez a
böngésző létrehoz egy **push-feliratkozást**, és az kerül a szobába:

| mező | tartalom |
|---|---|
| `endpoint` | a böngészőpéldány egyedi címe a gyártó push-szolgáltatásánál |
| `keys.p256dh`, `keys.auth` | az üzenet titkosításához |

**Négy dolog, ami a Data safety válaszokat eldönti:**

1. **Engedélyhez kötött, és az engedélyt CSAK a gomb megnyomásakor kérjük**
   (`pushSubscribe`) — sosem indításkor. A rendszer-engedély a TWA-ban
   `POST_NOTIFICATIONS`.
2. **A feliratkozás a SZOBÁBA kerül** (`mp/rooms/<kód>/players/<pid>/push`),
   nem egy központi listára. Aki nincs a szobában, nem fér hozzá. **Kilépéskor
   a szobával együtt törlődik** — ez a törlési út, e-mail nélkül is.
3. **Az üzenet tartalma állandó:** a klub neve, a szobakód és egy mondat.
   Se keret, se mentés, se személyes adat.
4. **`userVisibleOnly: true`** — a böngésző szabálya szerint minden push-ból
   VALÓDI értesítés lesz. Néma, háttérben futó push (amit nyomkövetésre
   lehetne fogni) technikailag sem jöhet létre. Ezt a kérdőívben érdemes
   kimondani.

A küldő a `netlify/functions/nudge.js`: beolvassa a szobát, aláírja és
elküldi az üzenetet, **majd elfelejti** — nincs naplózás és nincs tárolás.
Adatfeldolgozó tehát a Firebase (Google) mellett a **Netlify** is.

### 1.4 Ami csak a készüléken van

A mentések, a keret, a karrier és a beállítások a `localStorage`-ban. **Ez
soha nem hagyja el a készüléket** — a Data safety szempontjából tehát nem
„gyűjtött" adat.

---

## 2. Data safety űrlap — a kitöltendő válaszok

### 2.1 Gyűjtünk vagy megosztunk adatot?

**IGEN.** (Ha „nem"-et jelölnénk, az valótlan volna: a ranglista becenevet és
azonosítót küld fel.)

### 2.2 Adattípusok

| Play-kategória | gyűjtjük? | megosztjuk? | kötelező? | mire |
|---|---|---|---|---|
| **App activity → Other actions** | ✅ | ❌ | **nem** (választható) | ranglista-eredmények, kétjátékos eredmények |
| **App info & performance** | ❌ | ❌ | — | nincs összeomlás-jelentés és nincs diagnosztika |
| **Device or other IDs** | ✅ | ❌ | **nem** | az anonim auth-azonosító, a helyi profilazonosító és a **push-feliratkozás címe** |
| **Personal info → Name** | ⚠️ **döntés kell** | ❌ | **nem** | lásd lent |
| Location, Contacts, Photos, Files, Messages, Calendar, Health, Financial | ❌ | ❌ | — | nem kérjük és nem használjuk |

> **⚠️ AZ EGYETLEN ÉRDEMI DÖNTÉS: a becenév.** Szabadon írható mező, tehát a
> felhasználó **valódi nevet is beleírhat**. Két járható út van:
>
> **(a) Deklaráld „Personal info → Name"-ként.** Óvatos és biztonságos: a Play
> soha nem büntet a túlnyilatkozásért, csak az alulnyilatkozásért.
>
> **(b) Deklaráld csak „User IDs"-ként**, és a felületen tedd egyértelművé,
> hogy a becenév nyilvános és nem lehet valódi név.
>
> **Ajánlás: (a).** Olcsóbb, mint egy utólagos szabálysértési jelzés.

> **A PUSH-FELIRATKOZÁS HOVÁ TARTOZIK.** A Play-nek nincs külön
> „push subscription" kategóriája. Az endpoint egy **böngészőpéldányt**
> azonosít (nem személyt, nem készüléket), tehát a **Device or other IDs**
> a helye — ugyanoda, ahová az anonim azonosító. *Nem* „Personal info", és
> *nem* „App activity": nem viselkedést ír le.
>
> **Amit a kérdőívben érdemes kimondani:** az adat **nem kötelező**
> (a funkció végig kikapcsolható), **nem osztjuk meg** harmadik féllel
> (a push-szolgáltató kézbesítő, nem címzett), és **a felhasználó törölni
> tudja** — a szobából kilépve, e-mail nélkül is.

### 2.3 A többi kérdés

| kérdés | válasz | miért |
|---|---|---|
| Titkosított a továbbítás? | **igen** | a Firebase HTTPS-t használ |
| Kérhet-e a felhasználó törlést? | **igen** | a tájékoztatóban megadott e-mail-címen |
| A gyűjtés kötelező-e? | **nem** | mindkét funkció opcionális |
| Van-e hirdetés? | **nincs** | — |
| Kér-e a felhasználótól rendszer-engedélyt? | **egyet**: értesítés (`POST_NOTIFICATIONS`) | csak a bökés-gomb megnyomásakor, sosem indításkor |
| Küld-e az app értesítést? | **igen, felhasználói kérésre** | kizárólag a kétjátékos módban, a társ bökésére |
| Megfelel-e a Families szabályzatnak? | **nem célzunk gyerekeket** | lásd az IARC-ot |

---

## 3. IARC tartalmi besorolás — a kérdőív

A legtöbb kérdésre „nem" a válasz: nincs valósághű erőszak, nincs szexuális
tartalom, nincs drog, nincs valós pénzes szerencsejáték, nincs vásárlás.

> **⚠️ EGY KÉRDÉSRE VISZONT „IGEN" A VÁLASZ, ÉS EZT KI KELL MONDANI.**
>
> **Trágár nyelvezet / vulgáris humor.** A névanyagban vannak **szándékosan
> vaskos** nevek. Mérve a kiadott (`dist/`) fájlban is, tehát a felhasználóhoz
> is eljutnak:
>
> `Aztakurva Sándor` · `Seggborotváló András` · `Pizzaszaró Lehel` ·
> `Dészarul Aurél` · *(határeset:)* `Debuzi Máté`
>
> Ez a kérdőívben **„igen, enyhe trágárság / vulgáris humor"**. Következménye
> jellemzően PEGI 12 / ESRB Teen körüli besorolás — nem baj, csak tudni kell
> előre. **Valótlan „nem" válasz miatt utólag leszedhetik az appot**, ezért ez
> nem az a kérdés, amin spórolni érdemes.
>
> Ha alacsonyabb besorolás a cél, a négy név a `tools/nevek/manual.py`-ban
> egyetlen mozdulattal átírható — de ez a te döntésed, nem az enyém: ezek a te
> szándékos poénjaid.

---

## 4. Az adatvédelmi tájékoztató

Megvan: **`adatvedelem/index.html`**, a kiadás után a
`https://<domain>/adatvedelem/` címen. Önálló lap, külső betű és szkript
nélkül, sötét módot is tud.

**A három mező kitöltve (3.9.50)** — adatkezelő, kapcsolati e-mail, székhely.
A lapon nincs több placeholder; gépi ellenőrzéssel is: **0 találat** a
`[NAGYBETŰS ZÁRÓJELES]` mintára.

**Ami 3.9.50-ben még bekerült:**

* **4.3 — Értesítések**, önálló szakaszként: mi kerül fel, hova, meddig marad,
  hogyan kapcsolható ki;
* **4.4** — a Netlify és a push-szolgáltatók mint adatfeldolgozók, plusz egy
  mondat az EU-n kívüli továbbítás jogalapjáról;
* **7.** — a **jogalap** kimondva mindhárom funkcióra: hozzájárulás
  (GDPR 6. cikk (1) a), bármikor visszavonható;
* **6.** — a feliratkozás megőrzési ideje (a szoba sorsát követi).

Az adatvédelmi tájékoztató URL akkor is kötelező, ha semmit nem gyűjtenénk.

---

## 5. Áruházi lap — ami már megvan

| kell | állapot |
|---|---|
| ikon (512×512) | ✅ `icons/icon-512x512.png` |
| maskable ikon | ✅ 3.9.10 óta |
| telefonos képernyőképek | ✅ négy darab 1080×1920, `icons/screenshots/` |
| rövid és hosszú leírás | ✅ **3.9.50** — `docs/f4b-aruhazi-lap.md`, bemásolható |
| funkciógrafika (1024×500) | ⬜ hiányzik |
| célközönség, kereskedelmi státusz | ⬜ Play Console-ban |

---

## 6. Ami ezután jön

**F6** — `assetlinks.json` + Bubblewrap → aláírt AAB. A roadmap 3.2 és 3.3.

**F7** — a Firebase-szabályok kiadás előtti átnézése, és a **4 karakteres
szobakód** kérdése: ~1,7 millió kombináció végigpróbálható. Ma baráti
funkció; nyilvános kiadásnál felület. Az adatvédelmi tájékoztató ezt
**kimondja** (4.2), de a kimondás nem javítás — a döntés (hosszabb kód,
lejárat, vagy írás-korlátozás) az F7-é.
