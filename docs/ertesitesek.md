# 🔔 Értesítés a társ eszközére — és mit kell hozzá beállítanod

*(3.9.22 · P2b. A kód kész és mérve van; ez a lap a beüzemelés. Amíg a
`PUSH_VAPID_PUBLIC` üres, a funkció **csendben alszik** — a játék pontosan
úgy működik, mint eddig.)*

> **A PUBLIKUS KULCS 3.9.37 ÓTA BENT VAN** (lásd 1.2). Az 1.1 megvolt, az
> **1.3 és az 1.4 viszont még hátravan** — amíg a négy Netlify-környezeti
> változó és a Firebase-szabályok nincsenek kint, a gombok MEGJELENNEK, de a
> bökés a függvényen bukik el („a szerver nincs beállítva").

---

## 0. A pénzkérdés, elöl

**Nem lesz belőle számla, és nem kell bankkártya.**

Az eredeti terv Firebase Cloud Functiont mondott, az pedig **Blaze**-csomagot
(kártyát) kívánt volna. Ehelyett a **szabványos Web Push**-t építettem be:
ugyanazt tudja, VAPID-kulccsal írja alá az üzenetet, és **bármelyik
szerverről** küldhető. Nálunk egy **Netlify-függvényből**, ami a meglévő,
ingyenes csomagban fut.

| tétel | ára |
|---|---|
| a push-szolgáltatás (Google/Mozilla/Apple) | **ingyenes**, nincs is számlázás |
| Netlify-függvény | az ingyenes csomagban (nagyságrendileg **125 000 hívás/hó**) |
| Firebase | változatlan Spark-csomag; a feliratkozás ~1 kB/játékos |

Pár száz játékosnál, ha mindenki naponta párszor bök, az **havi néhány ezer
hívás** — a keret **huszad-ötvened része**. A Netlify aktuális kereteit
érdemes egyszer megnézni (a csomagok változnak), de ez a nagyságrend nem
kérdéses.

---

## 1. Amit be kell állítanod — négy lépés

### 1.1 VAPID-kulcspár készítése

Egyszer kell, és bárhol futtatható, ahol van Node:

```bash
npx web-push generate-vapid-keys
```

Két kulcsot ad: egy **publikusat** és egy **titkosat**.

> **A TITKOS KULCS SOHA NE KERÜLJÖN A REPÓBA.** Az a kulcs írja alá az
> üzenetet; aki megszerzi, a te neveddel küldhet értesítést bárkinek, aki
> feliratkozott. A publikus fele viszont *szándékosan* nyilvános — azzal
> iratkozik fel a böngésző.

### 1.2 A publikus kulcs az `index.html`-be — ✅ KÉSZ (3.9.37)

Ez az egyetlen kapcsoló: amíg üres, az egész funkció alszik, és a gombok meg
sem jelennek. A **publikus** kulcs 3.9.37 óta bent áll:

```js
const PUSH_VAPID_PUBLIC="BE9_5SCX…IjGaNk0";   /* 87 karakter, base64url */
```

A böngésző 65 bájtos, tömörítetlen P-256 pontot vár (`0x04`-gyel kezdődik) —
a `pushKulcsBajtok()` fordítja oda, és erre a kulcsra **mérve** helyes.

> Kulcscsere esetén ide ÉS a Netlify `VAPID_PUBLIC` változójába is az ÚJ kulcs
> kell, egyszerre. Ha a kettő eltér, a feliratkozás létrejön, de az aláírás
> nem illik hozzá, és a push-szolgáltatás visszautasítja.

### 1.3 Négy környezeti változó a Netlifyn

*Site settings → Environment variables:*

| név | érték |
|---|---|
| `VAPID_PUBLIC` | ugyanaz a publikus kulcs, mint az `index.html`-ben |
| `VAPID_PRIVATE` | a **titkos** kulcs |
| `VAPID_SUBJECT` | `mailto:<a te e-mail-címed>` — a push-szolgáltatás ezt kéri, hogy legyen kihez fordulnia |
| `RTDB_URL` | `https://magyahok-default-rtdb.europe-west1.firebasedatabase.app` |

> **HA A DEPLOY EMIATT ELBUKIK.** A publikus kulcs 3.9.37 óta az
> `index.html`-ben áll, és az 1.3 után UGYANAZ az érték ott lesz a Netlify
> `VAPID_PUBLIC` változójában is. A titok-szkenner ALAP ága pontosan ezt
> keresi: egy környezeti változó értékét a build kimenetében — ugyanaz a
> mechanizmus, ami az `AIza…` kulcson egyszer már megállította a deployt,
> csak az a SMART ág volt. Ha a napló a `VAPID_PUBLIC`-ra panaszkodik, a
> javítás egy sor a `netlify.toml` `[build.environment]` szakaszába:
>
> ```toml
> SECRETS_SCAN_OMIT_KEYS = "VAPID_PUBLIC"
> ```
>
> Ez a kulcs NEVÉT veszi ki az alap-szkennelésből (a `..._SMART_DETECTION_
> OMIT_VALUES` a másik ág, az értékek mintázat-alapú keresése — az nem erre
> való). Csak ezt az egy nevet, és **soha ne a `VAPID_PRIVATE`-et**: annak a
> szkennelése az egyetlen háló, ami elkapná, ha a titkos fele valaha
> beleszivárogna a kimenetbe. Előre nem tettük be — a fájl kimondott elve,
> hogy csak bizonyítottan szükséges kivétel kerül bele.

### 1.4 A Firebase-szabályok újbóli közzététele

A `tools/firebase-rules.json` két új mezővel bővült:
`players/$pid/push` és a szoba `nudgeAt` mezője. **Enélkül a feliratkozás
kiírása elszáll** — a játék működik, de a bökés nem.

---

## 2. Mi változik a repóban

| fájl | mi |
|---|---|
| `netlify/functions/nudge.js` | **új** — ez küldi a push-t, ez őrzi a titkos kulcsot |
| `package.json` | **új** — kizárólag a `web-push` függőségért |
| `package-lock.json` | **új** — hogy a telepítés determinisztikus legyen |
| `netlify.toml` | **új** — egyetlen sor: a Firebase `apiKey` kivétele a titok-szkenner heurisztikájából (lásd lent) |
| `sw-1.js` | `push` és `notificationclick` kezelő |
| `index.html` | a kliens-réteg, a két gomb, a fékek |
| `tools/firebase-rules.json` | `push` + `nudgeAt` |

> **A DEPLOY ELHASALT — ÉS AZ OK NEM AZ VOLT, AMIT KÉTSZER IS ÁLLÍTOTTAM.**
>
> A P2b eredetileg tett be egy `netlify.toml`-t, azzal az indoklással, hogy a
> `package.json` „build-lépésnek látszik", ezért egy `[build]` szakasszal
> (`command = ""`, `publish = "."`) ki kell mondani, hogy nincs build. Amikor
> a deploy elbukott, előbb a `publish = "."`-t neveztem meg okként, aztán az
> egész fájlt. **Mindkét diagnózis téves volt**, és mindkettőt nagyobb
> bizonyossággal mondtam ki, mint amennyi mögötte volt:
>
> | commit | a három Netlify-check | idő |
> |---|---|---|
> | a P2b ELŐTT (#35, #36) | ⚪ neutral — nincs mit jelentenie | 8 mp |
> | P2b + P1b (`netlify.toml`-lal) | 🔴 failure | 11 mp |
> | a `[build]` szakasz elvéve | 🔴 failure | 12 mp |
> | a `netlify.toml` teljesen elvéve | 🔴 failure | 13 mp |
>
> **A NAPLÓ SZERINT MI TÖRTÉNT VALÓJÁBAN.** A telepítés hibátlan (Node 24,
> npm 11, 17 csomag, 457 ms), a függvény becsomagolása hibátlan (220 ms).
> Ez állította meg:
>
> ```
> "AIza***" detected as a likely secret:
>   found value at line 83718 in index.html
> ```
>
> A Netlify **titok-szkennere** találta meg a Firebase `apiKey`-t. Ez a
> szkenner csak akkor fut, ha van build — és build csak a `package.json`
> megjelenése óta van. A kulcs évek óta ott volt; a P2b nem tette oda,
> csak **láthatóvá tette a szkenner számára**.
>
> **Az `apiKey` nem titok.** Nyilvános kliens-azonosító; a Firebase
> kifejezetten arra tervezte, hogy a kliens kódjában legyen. A hozzáférést az
> RTDB szabályai döntik el, nem a kulcs ismerete.
>
> **A javítás ezért egyetlen sor**, és szándékosan a legszűkebb, ami
> megoldja: `SECRETS_SCAN_SMART_DETECTION_OMIT_VALUES` erre az EGY értékre.
> Az egész szkennert **nem** kapcsoljuk ki — pont most lett rá a legnagyobb
> szükség: a P2b óta létezik egy valódi titok (`VAPID_PRIVATE`), és a
> szkenner a környezeti változók értékeit is keresi a kimenetben. Ha az a
> kulcs valaha az `index.html`-be szivárogna, ez állítaná meg a deployt.

---

## 3. Hogyan működik — és mit NEM lehet vele csinálni

**A kliens nem küld push-t.** Nem is tud: a titkos kulcs nincs nála. Csak
megkéri a függvényt, és **csak a szobakódot** adja át.

**A célpontot a függvény választja ki**, a szobából. Innen tehát nem lehet
tetszőleges címre üzenetet küldeni — csak annak, aki **veled egy szobában
van**. A szobakód eleve a hozzáférés határa: aki ismeri, az látja a szobát.

**Két fék van, és mindkettő kell.** A kliensé az udvariasság (ne nyomkodd);
a **szerveré a védelem** (ne lehessen nyomkodni). Egy csak-kliensoldali fék
annyit ér, mint egy zárat kirajzolni az ajtóra — a klienst bárki megkerüli.

Mérve, a függvény minden őre:

| eset | válasz |
|---|---|
| GET-tel hívva | 405 |
| nincs ilyen szoba | 404 |
| hibás alakú kód | 400 |
| **a hívó nincs a szobában** | **403** |
| a társ még nem csatlakozott | 404 |
| a társ nem iratkozott fel | 404 |
| két percen belül másodszor | 429 |
| jó eset | 200, és a push elmegy |
| a feliratkozás lejárt | 410 — **és kitakarítja** a szobából |

Az utolsó nem apróság: egy halott feliratkozás különben örökre ott ülne, és
minden bökés csendben elbukna rajta.

---

## 4. Amit a felhasználó lát

A beváró képernyőn, **csak akkor, ha a társ offline** (ezt az F0 jelenléte
tudja — aki ott ül, azt nem kell értesíteni):

* **🔔 Bökd meg a társad** — és ha nem lehet, a gomb megmondja, miért: „a
  társad nem kapcsolta be az értesítést", „várj még 90 mp-et".
* **🔔 Szóljatok, ha rám várnak** — a másik irány. Csak addig látszik, amíg
  nincs engedélyed; utána eltűnik.

**Az engedélyt csak a gomb megnyomásakor kérjük, sosem induláskor.** Egy
azonnali engedélykérés a legbiztosabb módja annak, hogy örökre letiltsák.

A feliratkozás **minden új szobába újra kimegy** — ha egyszer engedélyezted,
nem kell újra. Enélkül egy új szoba úgy indulna, hogy a társad nem tud
megbökni, pedig te engedélyezted.

---

## 5. Korlátok, előre kimondva

**iOS.** A webes push csak **iOS 16.4-től** működik, és **csak ha a játékot a
kezdőképernyőre telepítették**. Böngészőfülből nem. Ez nem a mi hibánk és nem
is javítható — de tudni kell, mert iPhone-os társnál a bökés némán nem érne
célt.

**Android / asztali.** Chrome, Edge, Firefox: működik. TWA-ban (a Play-es
appban) szintén, a Digital Asset Links-szel hitelesített oldal
értesítéseként.

**A bökés nem ébreszti fel a játékot**, csak értesítést ad. A koppintás hozza
elő — és ha már nyitva van valahol, azt az ablakot fókuszálja, nem nyit
újat (két példányban futó játék két helyen írná a mentést).

---

## 5.b A feliratkozás hossza — miért 1200

A böngésző feliratkozása egy JSON (`endpoint` + két kulcs), és a kliens
**1200 karakterre vágva** írja a szobába — pontosan annyira, amennyit a
`tools/firebase-rules.json` `push` mezője enged.

A kettőnek EGYEZNIE kell. 3.9.37-ig a kliens 900-nál vágott, a szabály 1200-at
engedett, és az eltérés néma hibát szült: egy 900 fölötti feliratkozás **csonka
JSON-ként** került a szobába, a függvény `JSON.parse`-ja elszállt rajta, és a
bökés „a társad feliratkozása hibás"-sal bukott — pedig a társ mindent jól
csinált.

| böngésző | a feliratkozás JSON-hossza | 900 | 1200 |
|---|---|---|---|
| Chrome / FCM | 365 | ✅ | ✅ |
| Firefox | 428 | ✅ | ✅ |
| Edge | 475 | ✅ | ✅ |
| Safari/iOS (rövid) | 604 | ✅ | ✅ |
| **Safari/iOS (hosszú)** | **904** | ❌ **némán elbukott** | ✅ |

Épp az iOS-es társnak számít a legtöbbet a bökés — nála a legkevésbé
nyilvánvaló, hogy várnak rá.

> **HA VALAHA EMELNI KELL:** a két számot EGYÜTT kell léptetni (az
> `index.html` `slice(0,1200)`-át és a szabályfájl `push` plafonját), és a
> szabályt újra közzétenni. Az eltérés maga a hiba, nem a konkrét érték.

---

## 6. Ha nem működik — ebben a sorrendben

1. **Üres a `PUSH_VAPID_PUBLIC`?** Akkor a gombok meg sem jelennek. (3.9.37
   óta ki van töltve — ha a gombok mégsem látszanak, nem ez az ok.)
   Ha a kulcs bent van, de a Netlify `VAPID_PUBLIC` változójában MÁSIK kulcs
   áll, a feliratkozás sikerül, a küldés viszont némán elbukik: a két félnek
   ugyanabból a párból kell jönnie.
2. **Kimentek a Firebase-szabályok?** A feliratkozás kiírása enélkül elszáll.
   A beváró képernyő ilyenkor a jelenlét-hibát is kiírja.
3. **Megvan mind a négy környezeti változó a Netlifyn?** Hiányzó kulcsnál a
   függvény 500-zal válaszol, és a gomb alatt megjelenik: „a szerver nincs
   beállítva".
4. **A társ engedélyezte?** A gomb megmondja, ha nem.
5. **iPhone?** Lásd az 5. pontot.

---

## 7. Miért nem működött SEMMI a PvP tempóból (3.9.41)

**A bejelentés.**

> „PvP villám és gyorsított módban ahol élnének a 3 perces tempógyorsítók, ott
> jelenleg nem történik semmi. Az értesítések jelenleg nem működnek. Nem lehet
> megbökni a társat, hiába van bekapcsolva mindkét oldalon. Plusz van ez a
> »társad jelenléte nem ismert (régi szoba)« felirat úgy, hogy ez egy friss
> test-szoba, mindkét oldal online."

Négy tünet, **öt** különálló ok. Egyik sem volt „elméleti" — mind a négy tünet
egy-egy konkrét sort takart.

### 7.1 A számláló elnémult, ha a társ ONLINE volt

```js
function mpDeadlineLeft(startAt,kozos){
  …
  if(mpMateOnline(_mpPresRoom)===true)return null;   // ← „ott van, nem sürgetjük"
```

Jó szándék, rossz következmény. A **tipikus** eset épp az, hogy mindketten a
képernyő előtt ültök — és akkor a Tempós/Villám fokozat **teljesen inert**
volt: nem indult óra, nem jelent meg szám, nem lépett semmi. Aki választotta,
egy nem működő funkciót kapott.

**Mostantól** a jelenlét nem a *számlálót* némítja el, hanem az *automatikus*
lépést finomítja (`mpAutoMehet`): a szám **mindig** kimegy, és ha a társ
tényleg ott dolgozik, a továbblépés gomb marad, nem automatika. Egy néma
határidő rosszabb, mint a semmi.

### 7.2 A tempó némán elveszett a szoba létrehozásakor

```js
try{await F.set(ref,rec);}
catch(e){
  const alap={}; …ki a `tempo` mezőt…    // ← és soha nem szóltunk róla
  await F.set(ref,alap);}
```

Ha a Firebase-ben még a **régi szabályfájl** fut, az nem engedi a `tempo`
mezőt, tehát a szoba **Kényelmes** módban jött létre (`ms: 0`) — a 3 perces
ablak sosem indult el, és semmi nem árulta el, hogy nem is fog.

**Mostantól** külön újrapróbáljuk a `tempo` visszaírását, a hibát megjegyezzük
(`mpNet.tempoErr`), és a beváró képernyő **kiírja**, hogy ez a szoba határidő
nélkül fut, és mi a teendő.

### 7.3 A jelenlét-bejelentkezés egyszer futott le, aztán soha

`mpPresenceArm` a szoba **létrehozásakor** és a **csatlakozáskor** futott, és
korán kilépett, ha ugyanarra a szobára már állt (`_mpPresence.code===code`).
Csakhogy az `online:true` **nem örök**: az `onDisconnect` megbízás a szerveren
ül, és minden szakadásnál `online:false`-ra írja. Szakadás pedig folyton van —
a fül háttérbe megy, a telefon alszik, a wifi vált, a lap újratöltődik. És a
játék maga bíztat a kilépésre („Vissza a kezdőlapra — a szoba megmarad").

Innentől a társad **offline-nak vagy sehogy** látott — és mivel a `push`
feliratkozás is ugyanebben a függvényben megy ki, a **bökés is elnémult**.
Ez a magyarázata a „friss test-szoba, mindkét oldal online, mégis nem ismert"
esetnek.

**Mostantól** a függvénynek két része van, más ütemezéssel:

| rész | mikor |
|---|---|
| a megbízás (`onDisconnect`) | szobánként **egyszer** — drága, és nem avul el |
| a bejelentkezés (`online` + `seenAt`) | **szívverés**, 25 mp-enként, amíg a beváró képernyő nyitva van |
| a `push` feliratkozás | 3 percenként, illetve új szobánál azonnal |

Plusz: a beváró képernyő **megnyitása** azonnali bejelentkezést kér.

### 7.4 A bökés-gomb csak a BIZTOSAN offline társnál jelent meg

```js
if(mpMateOnline(_mpPresRoom)!==false||!pushBeallitva()){w.classList.add("hide");return;}
```

A jelenlét **három** állapotú (`true` / `false` / `null` = nem tudjuk), a kapu
viszont csak az egyiket engedte. A „nem tudjuk" állapotban — épp amit a 7.3
okozott — a gomb **néma** maradt. A felhasználó ebből azt látta, hogy „nem
lehet megbökni a társat, hiába van bekapcsolva mindkét oldalon".

**Mostantól** csak azt rejtjük el, akiről **biztosan** tudjuk, hogy ott ül.
A többinél a gomb megjelenik, és ha valami hiányzik, a `nudgeLehet` **kiírja**,
hogy mi. Egy kiírt ok mindig jobb, mint egy néma gomb.

### 7.5 A „régebbi szoba" három különböző okra ült rá

A `null` állapot szövege mindig ez volt: *„A társad jelenléte nem ismert
(régebbi szoba)."* Csakhogy a `null` háromféle helyzetből jön, és kettő friss
szobában is előfordul:

| helyzet | mit kell tenni |
|---|---|
| a társ **még nem csatlakozott** | várni |
| a **mi** jelzésünk nem megy ki (`presErr`) | a szabályfájlt közzétenni |
| ő csatlakozott, de **tőle** nincs jelzés | régi szoba, vagy az ő gépén a szabályfájl |

Mostantól mind a három **külön** szöveget kap.

## 8. A kért számláló és a túloldali jelzés (3.9.41)

> „Legyen az ilyen kijelzőkön egy számláló is, hogy mennyit kell még várni, a
> másik oldalon pedig … jelzés arra, hogy a másik oldalon elindult a várakozás,
> megy a 180 másodperces számláló."

**A saját oldalad** számlálóját a 7.1 hozta vissza: `⏱ Villám tempó — 2:25
múlva magától továbblép.`

**A túloldal** jelzése a saját játékos-ágadba írt `waitAt` mezőn megy át:

* **hol tároljuk.** A `players/<én>/waitAt`-ban, nem a szoba gyökerében. Két
  oka van: a jelenlét-lekérdezés **úgyis** a `players` ágat hozza le, tehát a
  társad **ingyen** megkapja, egyetlen extra kérés nélkül; és a saját ágamba
  írni jogosultsági kérdés nélkül szabad.
* **szerveridőben** (`mpStamp`), mert a számláló a **túloldalon** fut le — a
  két gép órája között nem lehet eltérés.
* **mikor.** A jelzés a **jelenlét-körből** megy ki, nem a képernyő
  megnyitásakor: abban a pillanatban a szoba még nincs letöltve, tehát a
  **tempóját** sem ismerjük, és a jelzés a Kényelmes alapértékkel menne ki.
* **mit lát a társad.** `⏳ A társad rád vár — Villám tempó, 2:25 van hátra,
  utána a rendszer magától továbblép.`
* **takarítás.** A képernyő zárásakor a mező nullázódik; egy régen otthagyott
  jelzés (egy egész ablaknyival túlcsúszott) magától elnémul.

**Aki nincs a játékban**, azt csak a push éri el — ezért a várakozás indulása
**egyszer** automatikus bökést is küld. A kézi bökés fékjét (`NUDGE_MIN_MS`)
tiszteletben tartja, tehát oda-vissza kapkodásból nem lesz értesítés-zápor, és
ha bármi hiányzik (nincs feliratkozás, nincs engedély), **csendben** kimarad:
egy automatikus értesítés nem kérhet semmit a felhasználótól.

> **A `waitAt` mező ÚJ a szabályfájlban.** A `tools/firebase-rules.json`
> frissített változatát **közzé kell tenni**, különben a jelzés nem megy ki —
> ugyanúgy, ahogy az `online`, a `push` és a `tempo` sem. A 7.2–7.5 pontok
> tünetei mind ebből is fakadhatnak; a játék mostantól ki is mondja, ha ezt
> érzékeli.

**Próba:** `tools/mp-tempo-jelenlet-proba.js` — 16 állítás.
