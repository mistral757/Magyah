# 🔤 Betűk és tárhely — a kiadási roadmap F1 és F2 lépése

*(3.9.02. Érintett fájlok: `index.html` `<head>`-je és `<style>`-jának teteje,
az `index.html` „A TÁRHELY TARTÓSSÁGA" szakasza, a `sw-1.js`, a `.gitattributes`
és az új `fonts/` könyvtár.)*

## 0. Egy mondatban

A játék többé **egyetlen külső kérést sem indít** a betöltéskor, és a mentéseit
megkéri a böngészőt, hogy **ne dobhassa el magától**.

---

## 1. F1 — a betűk önhosztolása

### Miért

Két baj volt vele.

**Adatvédelem.** A `<head>` két sora minden megnyitáskor a
`fonts.googleapis.com`-ra és a `fonts.gstatic.com`-ra kért be. Ez nem
„elemzés" és nem süti — de egy kérés akkor is elküldi az IP-címet és a
User-Agentet egy harmadik félnek, méghozzá *azelőtt*, hogy a felhasználó
bármihez hozzájárult volna. A német bírói gyakorlat óta (LG München,
2022) ez az a fajta apróság, amivel egy egyébként tiszta kiadás
megbukhat — és a Play Console adatbiztonsági kérdőívében is nyilatkozni
kellene róla.

**Offline.** A service worker eddig is eltette a HTML-t, tehát net nélkül
elindult a játék — csak épp **betűk nélkül**. Az egész tipográfia
(a MAGYAH-felirat, a kártyák, a mezszámok) rendszerbetűre esett vissza.

### Mi lett belőle

Tíz `woff2` fájl a `fonts/` könyvtárban, összesen **280 kB**, és tíz
`@font-face` az `index.html` stíluslapjának tetején.

| család | mire | fájl |
|---|---|---|
| **Archivo** | `--font-body` | változó (wght 100–900) |
| **Archivo Black** | `--font-disp` | statikus 400 |
| **Anton** | `--font-disp` (két téma) | statikus 400 |
| **Oswald** | `--font-body` (egy téma) | változó (wght 400–700) |
| **Cormorant Garamond** | a PvP-fejlécek, a H2H | változó (wght 300–700) |

Mind az öt **SIL Open Font License 1.1** alatt van, tehát az önhosztolás
engedélyezett — a licenc egyetlen feltétele, hogy a jogtulajdonosi sor és a
licencszöveg a betűkkel együtt terjedjen. Ez a **`fonts/OFL.txt`**.

### Három döntés, ami nem magától értetődő

**Miért van `latin-ext` is?** A magyar **ő** és **ű** (U+0150-0151,
U+0170-0171) nem a `latin` szeletben lakik, hanem a `latin-ext`-ben.
Nélküle a böngésző minden ő-t és ű-t egy másik betűből pótolna — ami egy
Anton-feliratban azonnal látszik. Ezért családonként **két** fájl van, és
mind a tíz benne van a service worker listájában: offline sem eshet ki.

**Miért egy fájl fedi le a súlyokat?** Az Archivo, az Oswald és a Cormorant
Garamond **változó betű**: egyetlen fájl hordozza a teljes `wght` tengelyt.
A Google is ugyanazt a fájlt adta vissza mind a három kért súlyra — így
három helyett egy `@font-face` elég, tengely-tartománnyal.

**Miért nem a teljes tengely?** Mert az **megváltoztatná a megjelenést.**
A kódban van 29 darab `font-weight:800` és egy `900` is; eddig ezek a
Google 400/600/700-as arcaira estek, vagyis **700-ra csippentek**. Ha most
`100 900`-at írnánk, ugyanaz a szöveg hirtelen vastagabban jelenne meg.
Ezért a tartomány pontosan az, amit eddig is kértünk: Archivo `400 700`,
Oswald `400 700`, Cormorant `300 400`. **A kiadás nem rajzolhat át
képernyőket.**

### Amit ez NEM old meg

A PvP-ág továbbra is a `gstatic.com`-ról tölti be a Firebase SDK-t
(`import(...)`, két helyen). Ez viszont **más műfaj**: nem a betöltéskor
fut, hanem akkor, amikor a felhasználó maga lép a közös karrier felé — egy
hálózati funkció hálózati kérése. A passzív, minden megnyitáskor lefutó
harmadik felet szüntettük meg.

---

## 2. F2 — tartós tárhely

### Miért

A böngésző tárhelye alapból **„best-effort"**: ha a készüléken elfogy a
hely, a böngésző kérdés nélkül eldobhatja egy oldal adatait. iOS Safariban
van egy külön szabály is — a **nem telepített** oldalak adatai hét hét
használaton kívüliség után törlődnek.

Vagyis egy nyolc szezonos karrier eltűnhet úgy, hogy a felhasználó semmit
nem csinált rosszul. Ez a legnagyobb adatvesztési kockázat, amit egy
kiadás előtt olcsón meg lehet szüntetni: a `navigator.storage.persist()`
megadva a tárhelyet **„persistent"**-té teszi, és onnantól kizárólag a
felhasználó törölheti.

### Mikor kérünk

**Nem az első képfestéskor.** Akkor még nincs mit védeni — és a Firefox
ilyenkor egy kérdést dobna fel egy olyan oldal nevében, amit a felhasználó
még el sem kezdett. Azt jó eséllyel elutasítja, az elutasítás pedig
megmarad: egy rosszkor feltett kérdés **elrontja** a védelmet.

Ezért két pontban kérünk, oldalbetöltésenként legfeljebb egyszer-egyszer:

1. **Az első sikeres mentés után** (`saveGame` vége). Ekkor bizonyíthatóan
   van futó karrier — a kérdés indokolt, és a felhasználó tudja, mire
   mond igent.
2. **Telepítés után** (`appinstalled`). A telepítés a legerősebb jel,
   amit a Chrome heurisztikája ismer: egy korábbi „nem" után itt jó
   eséllyel igent kapunk.

A kérés **sosem áll a mentés útjában**: egy `setTimeout(…,0)` mögött fut,
tehát egy esetleges böngésző-kérdés nem akaszthatja meg az írást.

### Mit jelent a „nem"

Semmit, ami elrontana valamit — a játék pontosan ugyanúgy működik, csak a
mentés kevésbé védett. A Chrome nem is kérdez: heurisztikát futtat
(telepítve van-e az oldal, van-e könyvjelző, mennyit használják), és egy
mai „nem" holnap „igen" lehet. Ezért:

* a **„Mentések és tárhely"** ablak kimondja az állapotot,
* és ha nincs meg, ott van alatta egy **„🔒 Tartós tárhely kérése"** gomb.

Három állapotot ismer a doboz — mindhárom a maga szövegével:

| állapot | mit mond |
|---|---|
| **megvan** | 🔒 *Tartós tárhely* — a böngésző nem dobhatja el magától a mentéseidet. |
| **nincs meg** | ⚠️ *A tárhely eldobható* — + a kérés gombja + hogy a telepítés jellemzően megadja. |
| **nem támogatott** | 🕸 a böngésző nem ismeri — marad az összegzés-letöltés és a telepítés. |

Mellette a **valódi keret** is látszik (`navigator.storage.estimate()`):
`felhasznált / keret`. Ez **más**, mint a fölötte álló „a keret jellemzően
5 MB" — az a `localStorage` saját korlátja, ez pedig az egész origó
tárhelye (cache, IndexedDB is). A doboz ezt ki is írja, hogy a két szám ne
mondjon egymásnak ellent.

### Ami szándékosan nincs benne

* **Nem tárolunk saját „már kértük" jelzőt.** Az élő igazságot mindig a
  `navigator.storage.persisted()` mondja meg — a felhasználó a böngésző
  beállításaiban bármikor visszavonhatja, egy elmentett „igen" pedig
  onnantól hazudna.
* **Nem kérünk minden mentéskor.** Egy oldalbetöltésen belül egyszer; a
  többi a felhasználó gombja.

---

## 3. Amit a service workernek is tudnia kell

A statikus ág **cache-first**: amit egyszer eltett, azt onnantól a
cache-ből adja. Ezért a betűk felvétele mellett a **`CACHE_NAME` is
lépett** (`harminc-nulla-cache-v2` → `v3`) — enélkül a régi telepítések
sosem töltenék le az új fájlokat, és náluk a betűk offline továbbra is
hiányoznának.

> **Szabály, ha egyszer újra hozzányúlunk:** új statikus fájl = új
> `CACHE_NAME`. Ez a `sw-1.js` tetején is ott áll.

### Egy nyitott kérdés a telepítéshez

Az `index.html` a **`/sw.js`**-t regisztrálja, a repóban viszont
**`sw-1.js`** van, és nincs se `_redirects`, se `netlify.toml`, ami a
kettőt összekötné. Vagyis a kiszolgálón a `/sw.js` egy olyan példány,
amit nem ez a repó ad — ha az nem frissül a `sw-1.js`-sel együtt, ez a
változtatás (és minden korábbi cache-név-léptetés) **nem ér el a
felhasználókhoz**. Ezt a kiadás előtt tisztázni kell.

---

## 4. Ellenőrzés

A `tools/check.sh` három kapuja mellett ezt böngészőben mértük
(Chromium, 430 px):

* **nulla külső kérés** a betöltés alatt (korábban kettő: a `googleapis`
  stíluslap és a `gstatic` betűfájlok),
* mind a tíz `woff2` betölt, és mind az öt család **átmegy a
  `document.fonts.check`-en magyar ékezetes szöveggel** (`Őrült ŰRŰ`) —
  tehát a `latin-ext` is a helyén van,
* **hálózat nélkül** (service worker + `setOffline`) újratöltve a tíz
  betű a cache-ből jön, egyetlen kérés sem bukik el, és a tipográfia
  változatlan,
* a tartósság-doboz mindhárom ága (megvan / nincs meg / nem támogatott)
  a megfelelő szöveget és gombot adja, és a gomb megkapott engedély
  esetén átvált a „megvan" állapotra.
