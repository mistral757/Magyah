# Az osztálylétszám, a páratlan mezőny és a betöltés sorrendje (3.9.102)

## 1. A bejelentés

Képernyőkép a saját kliensről, 6. szezon, D1, host:

* a menetrend **32 fordulós** — a 30. a párharc, utána még jön egy 31. és egy
  32. forduló;
* az élő tabellán **csak a két menedzsernek van rendes mérlege** (15-15
  meccs), a CPU-knak 1-2 meccsük és 0 pontjuk;
* és a párharc **nem indítható**, mert a társ kliense nem ér el a 30.
  fordulóig.

## 2. Egy ok, három tünet

A beküldött mentés (`46VWL2`, 6. szezon, host) mérve:

```
fixtures 32 · párharcok 15, 30 · idx 29 · pyr.my 1 · SEASON_OPPS 15
osztálylétszámok  D1:15  D2:15  D3:16  D4:16  D5:16  D6:16   összesen 94
mpTable: 6. szezon, 15. forduló után, 17 sor
```

A **94 helyes**: 6 osztály × 16 hely = 96, ebből kettőt ti foglaltok el. Az
**eloszlás** csúszott el eggyel: a D1-ben **15** világ-csapat áll **14**
helyett, a D2-ben 15 a 16 helyett. Ebből az egyetlen elcsúszásból nő ki mind
a három tünet.

### 2.1 A 32 forduló

15 ellenfél = 30 CPU-meccs, plusz a két párharc → 32 forduló. (A 3.9.101
`fixturesFitToSeason`-je ezt már az építésnél levágja 30-ra, a
`fixturesRepair` pedig a meglévő mentéseket — lásd a 3. pontot, amiért
mégsem hatott.)

### 2.2 „Az ellenfelek pontszámai megszűntek"

A CPU-k egymás elleni meccseit az `aiLeagueSchedule()` osztja ki
körmódszerrel. A mezőny létszáma:

```
n = ellenfelek + te + (közös karrierben) a társad = 15 + 1 + 1 = 17
```

A függvény elején ez a kapu állt:

```js
if(n<4||n%2!==0){ for(let r=0;r<30;r++)out.rounds.push([]); … }
```

**Páratlan létszámnál harminc üres fordulót adott vissza.** A CPU-k tehát
egymással egyáltalán nem játszottak — a tabellában csak az a 2-2 meccsük
maradt, amit a két menedzser ellen játszottak, és mivel mindkettőt elveszí-
tették, 0 ponttal álltak. Pontosan ez látszik a képernyőképen.

A kapu védekezésnek indult (a körmódszer páros létszámot kíván), de rossz
fajta volt: **elnyelte** a hibát, ahelyett hogy kikerülte volna.

A körmódszer szabványos megoldása egy **üres hely**: páratlan létszámnál
felveszünk egy plusz széket, és aki azzal „játszik", az abban a körben pihen.
Az üres hely sosem kap csapatot, a vele alkotott párokat a meglévő szűrő
eldobja. Mérve: 15 ellenféllel most 30 forduló, egyetlen üres forduló nélkül,
186 CPU-párosítással, és minden CPU 24-26 meccset kap.

Az illeszkedés páratlan mezőnynél nem tökéletes (egy-egy CPU meccsszáma
eltérhet a tiédtől) — de egy kicsit pontatlan tabella nagyságrendekkel jobb,
mint egy olyan, amiben a mezőny nem is játszott. Páros mezőnynél semmi nem
változott.

### 2.3 A beragadt közös tabella

A közös tabellát a host **egyszer** számolja ki és teszi el, a 15. és a 30.
forduló után. A 15. fordulós pillanatkép ezzel a hibás naptárral készült,
tehát maga is hibás — és a 30. fordulóig ott ragadt volna a képernyőn.

Mostantól van egy **épség-ellenőrzés** (`mpTableSane`). Nem javítja a
pillanatképet — a közös tabella igazsága a hosté, azt nem írjuk felül
helyben —, hanem **érvénytelennek tekinti**: innentől nincs közös tabella, a
felület a szokásos hiányos-állás jelzéssel a helyi élő tabellát mutatja, ami
a javított naptárral újra helyes számokat ad. A következő kézfogáson a host
amúgy is újat számol.

A küszöb szándékosan durva: csak az ordas esetet fogja meg (a CPU-mezőny
legjobbja sem éri el a menedzserek meccsszámának a felét), és a szezon elején
egyáltalán nem ítélkezik. Ép pillanatképet nem dobhat el.

## 3. És egy saját hiba: a javítás rossz helyen futott

A 3.9.101 `fixturesRepair()`-hívása a betöltésben az `ensureAllAttrs()`
mellett állt — vagyis **az `Object.assign(S,d.S)` előtt**. Ott:

* az `S.fixtures` még a betöltés ELŐTTI állapot (hideg indításnál üres,
  mentésváltásnál az előző karrieré), tehát a javítás **nem a betöltött
  menetrenden dolgozott**;
* és az `MP.activeRoom` sincs még visszaállítva, tehát `h2hRoomActive()`
  hamis — a javítás a párharc-fordulókat **szabálytalannak** látta volna, és
  ki is törölte volna őket.

Vagyis a 3.9.101 menetrend-helyreállítása a gyakorlatban **halott kód** volt,
a rosszabbik esetben pedig kárt okozott volna. A hívás mostantól a bulk
visszatöltés és az MP-állapot után fut, ahol az `S` teljes, a szoba ismert és
a mezőny a helyén van.

A próba ezt közvetlenül méri: elkap egy valódi mentés-payloadot, elrontja
pontosan úgy, ahogy a beküldött (32 forduló), majd `applySavedGame`-mel
betölti. A régi sorrenddel a menetrend **32 marad**; az újjal **30 lesz**, a
párharcok a 15. és a 30. fordulón.

## 4. A létszám valódi rendbetétele

`pyrDivSizeRepair()` felülről lefelé halad. Amelyik osztályban **több**
csapat van a kelleténél, onnan a **leggyengébb** lép eggyel lejjebb;
amelyikben **kevesebb**, oda a lenti osztály **legerősebbje** lép föl.
Mindkét döntés egyértelmű (ovr szerinti szélsőérték), tehát ugyanaz a szabály
ugyanabból az állapotból mindkét gépen ugyanazt adja.

A célszám: a saját osztályodban `PYR_TEAMS − 2` közös karrierben és
`PYR_TEAMS − 1` egyedül, a többiben `PYR_TEAMS`.

**Csapatot nem találunk ki és nem dobunk el.** Ha a világ összlétszáma maga
hibás, a legalsó osztály marad rossz, és ezt a napló kimondja — inkább legyen
látható maradék hiba, mint kitalált mezőny.

**Mikor fut:** a piramis szezonfordulóján (ott a világ amúgy is újraépül, és
még semmi nem mutat a mezőnyre), illetve betöltéskor, de **csak ha nincs futó
szezon**. Futó szezonban a menetrend a mezőnyre hivatkozik — azt menet közben
átrendezni többet ártana, mint használna; ott a `fixturesRepair` és az
üres-helyes körmódszer tartja életben a szezont.

**Amit ez nem old meg:** a két kliens világa attól még eltérhet, ha
korábban külön-külön csúszott el (a bejelentett esetben az egyik oldalon 15,
a másikon ~10 ellenfél lett). A helyreállítás mindkét gépet **belsőleg
következetessé** teszi, de a már megtörtént eltérést nem tudja
visszacsinálni. A közös tabellát ettől függetlenül a host számolja, tehát a
megjelenített állás közös marad.

## 5. Mit jelent ez a beakadt szobának

A 3.9.102 betöltésekor:

1. a **társ kliensén** a 22 fordulós menetrend 30 fordulóssá áll helyre, a
   párharcok a 15. és a 30. fordulóra — a 22-29. forduló rendes bajnoki lesz,
   tehát a társ le tudja játszani őket és elér a 30. fordulóig;
2. a **te oldaladon** a 32 fordulós menetrend 30-ra rövidül, a 30. forduló
   marad a párharc;
3. a mezőny egymás elleni meccsei újra lefutnak, tehát az ellenfelek pontjai
   visszajönnek;
4. a beragadt, 15. fordulós közös tabella félrekerül, és a 30. fordulónál a
   host újat számol;
5. az osztálylétszámok a **következő szezonfordulón** állnak helyre — a futó
   szezon közben szándékosan nem nyúlunk hozzájuk.

A hat szezon nem vész el: a helyreállítás a lejátszott fordulókhoz nem nyúl.

## 6. Diagnosztika

A **MENETREND ÉS LÉTSZÁMOK** szakasz kibővült: kiírja a tabella-létszámot és
külön jelzi, ha páratlan, valamint a közös tabella pillanatképének állapotát.

```
  mezőny: SEASON_OPPS 15 · ellenfél a menetrendhez 15 · tabella-létszám 17 ⚠ PÁRATLAN (üres hellyel megy)
  közös tabella: 6. szezon, 15. forduló után · 17 sor · ⚠ HIBÁS (félretéve)
  osztálylétszámok: D1:15⚠(kell 14) · D2:15⚠(kell 16) · D3:16 · D4:16 · D5:16 · D6:16
```

## 7. Az alapszabály, lekötve

**Egy osztály 16 csapat, tehát egy szezon 30 forduló.** Mindkét módban
kijön, és a próba 7. szakasza ezt állításként is rögzíti, hogy egy későbbi
változtatás ne sodorhassa el a két számot egymástól:

| | ülések | menetrend |
|---|---|---|
| közös karrier | 14 CPU + te + a társad = **16** | 14×2 = 28, + 2 párharc (15., 30.) = **30** |
| egyjátékos | 15 CPU + te = **16** | 15×2 = **30** |

Mivel a tabella-létszám mindkét esetben 16, vagyis **páros**, a 2.2 pontban
bevezetett üres hely ép világban **sosem lép működésbe** — az tisztán háló,
nem a normál működés része. Ugyanígy a menetrend-pótlás: ép mezőnnyel nincs
egyetlen pótolt párosítás sem.

## 8. Mérés

`node tools/osztalyletszam-proba.js` — 7 szakasz: a páratlan alak
reprodukciója, az új naptár (és hogy a régi kapu pontosan itt adott üreset),
a `pyrDivSizeRepair` mindkét iránya determinizmussal és idempotenciával, a
hiányzó csapat esete, az `mpTableSane`, a betöltési sorrend valódi
mentés-payloaddal, végül a 7. pont alapszabálya.

Mellette a `tools/parharc-menetrend-proba.js` (3.9.101) méri, hogy a
menetrend 10, 13, 14, 15 és 16 ellenféllel is pontosan 30 forduló marad — a
30 tehát két oldalról van lekötve: a mezőny HELYES létszámából (ez a
szakasz), és arra az esetre is, ha a létszám mégis elcsúszna.
