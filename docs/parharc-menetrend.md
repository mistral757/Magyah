# A párharc-forduló elcsúszása — és a társ címének ünnepe (3.9.101)

## 1. A bejelentés

Egy tesztelő képernyőképe: a **22. forduló** előkészítő képernyőjén az
ellenfél „**⚔ A TÁRSAD**", az állás „21/30 · GY 20 · D 0 · V 1 · 60 pont ·
101:7" — és a kliens megállt. A tesztelő szavai: *„Többször frissítettem,
hogy hátha megjavul."*

## 2. Mi történt valójában

A közös karrier szezonjában két párharc van, a **15.** és a **30.**
fordulóban (`H2H_ROUNDS`). A menetrend így épült:

```js
H2H_ROUNDS.forEach(r=>S.fixtures.splice(r-1,0,{duel:true,…}));
```

Az `Array.prototype.splice` **csendben a tömb végére csúsztatja** a
beszúrást, ha a kezdőindex túllóg a tömbön. Ez akkor számít, ha a mezőny
nem pont akkora, amekkorának lennie kéne. Mérve:

| ellenfél | forduló | párharcok |
|---|---|---|
| 10 | **22** | 15, **22** |
| 13 | 28 | 15, 28 |
| 14 | 30 | 15, 30 ✓ |
| 15 | 32 | 15, 30 |
| 16 | 34 | 15, 30 |

A **10 ellenfeles sor pontosan a bejelentett kép**: 22 fordulós szezon,
párharc a 22. fordulón.

Innen kétféleképpen akadt el a játék:

* a `h2hIsDuelRound()` a **fordulószámból** dönt (15 vagy 30), tehát a 22.
  fordulón nem párharcot indított volna, hanem rendes bajnokit egy **0-s
  erejű, „⚔ A társad" nevű helyfoglaló** ellen — biztos nagy győzelem és
  hamis sor a tabellában;
* a 22. forduló után pedig **elfogyott a menetrend**: a 23–30. fordulóhoz
  nem tartozott mérkőzés, tehát nem volt mit elindítani.

### Miért csúszhat el a mezőny

A beküldött mentés (`30-0-save-mp-…`, 6. szezon) szerint a piramis **D1-e 15
világ-csapatot tartott 14 helyett**, a **D2 pedig 15-öt 16 helyett** — a
világ összlétszáma (94) stimmelt, az **eloszlás** nem. A páros ugyanis KÉT
helyet foglal a saját osztályában (14 világ-csapat + ti ketten = 16), és a
fel-/lejutáskor ezt a második ülést egy külön csere költözteti (`spare2`).
Ha ez a csere valaha kimarad — régi mentés, félbeszakadt szezonforduló —, a
létszám elmozdul, és **onnantól a menetrend is rossz hosszú lesz**.

## 3. A javítás

A menetrend **innentől nem bízik a mezőny méretében.**

### 3.1 `fixturesFitToSeason(list, rnd)`

Egy helyen dől el, hány forduló a szezon és hol állnak a párharcok:

1. a párharcok helye foglalt → a CPU-meccsekből `SEASON_ROUNDS − párharcok`
   fér a szezonba;
2. **túl hosszú** mezőny → a fölösleg lemarad (eddig is lemaradt, csak a
   lista végéről és némán);
3. **túl rövid** → a hiányzó fordulókat ismételt párosításokkal töltjük fel,
   és a napló ezt **ki is mondja**. A pótlás a szezonhoz kötött, seedelt
   folyamból dolgozik, tehát a két kliens ugyanazt kapja;
4. a párharcok növekvő sorrendben, **mindig érvényes indexre** kerülnek be.

Az eredmény **mindig pontosan 30 forduló**, a párharcok **mindig a 15. és a
30.** — 10, 13, 14, 15 és 16 ellenféllel egyaránt (mérve).

### 3.2 `fixturesRepair()` — a már elromlott mentések

A fenti a jövőt védi; ez a meglévő mentéseket menti meg. Betöltéskor fut
(az `ensureAllAttrs()` után), és két bajt ismer föl:

* a menetrend nem `SEASON_ROUNDS` hosszú;
* párharc-helyfoglaló áll olyan fordulón, ami nem párharc-forduló (vagy
  hiányzik onnan, ahol kellene).

**A lejátszott fordulókhoz nem nyúl.** Csak az `S.idx`-től kezdődő farkat
illeszti újra, a párharcokat pedig csak azokra a fordulókra teszi vissza,
amik még előttünk vannak. A napló elmondja, mit talált.

Mérve a két valódi alakon:

* **32 fordulós mentés** (a beküldött mentés), 29. forduló után → 30
  forduló, párharcok 15/30, az első 29 forduló **betűre változatlan**;
* **22 fordulós mentés** a 22. fordulón álló párharccal (a tesztelő
  kliense), 21. forduló után → 30 forduló, párharcok 15/30, a 22. fordulón
  mostantól **rendes bajnoki** áll, az első 21 forduló változatlan.

Ép menetrendhez **hozzá sem nyúl** (0 talált baj, bájtra azonos lista).

### 3.3 A szellemmeccs elleni zár

A motor két forrásból tudja, párharc-e a forduló: a **fordulószámból**
(`h2hIsDuelRound`) és a **menetrendből** (`fx.duel`). A `startRoundNow()`
mostantól összeveti a kettőt, és ha szétcsúsztak:

1. megpróbálja **helyreállítani** (`fixturesRepair`);
2. ha sikerült, **nem indítja el magától** a meccset — az ellenfeled közben
   más lett, mint amit a kezdőrúgás előtt láttál. A gomb felirata frissül, a
   napló elmondja, mi történt, és te döntöd el, mikor fújsz kezdést;
3. ha nem sikerült, **megáll és szól** — hamis eredmény nem kerül a
   tabellába.

### 3.4 Diagnosztika

A `mpDiagCollect()` új szakasza (**MENETREND ÉS LÉTSZÁMOK**) egy
képernyőképből megmutatja azt, amiért ezt a hibát eddig mentést kérve
kellett kinyomozni:

```
── MENETREND ÉS LÉTSZÁMOK
  menetrend: 30 forduló (kell: 30) · most a 22. · párharcok: 15, 30 (kell: 15, 30)
  mezőny: SEASON_OPPS 15 · ellenfél a menetrendhez 15
  piramis: D1 · fölötte nyitva 0 · tartalék: van / van
  osztálylétszámok: D1:16 · D2:16 · D3:16 · D4:16 · D5:16 · D6:16
  világ összesen: 96 csapat
```

A saját osztályod mellett ⚠ jelenik meg, ha a létszám nem a várt
(`PYR_TEAMS − 2` közös karrierben, `PYR_TEAMS − 1` egyedül, a többiben
`PYR_TEAMS`).

**Amit ez a kiadás NEM javít:** magát az osztálylétszám-elcsúszást. A
menetrend mostantól független tőle, tehát a játék akkor is végigjátszható,
ha a létszám elmozdult — de a drift oka (a `spare2` költöztetése) külön
vizsgálat, és a diagnosztika most már kimondja, ha fennáll.

## 4. „A társad címe is ünnep"

KIMONDOTT KÉRÉS: *„PvP-ben D1-ben ha vagy, akkor ne csak akkor kapd meg a
győztes kijelzőt, ha megnyered a D1-et, hanem akkor is, ha csak a társad
előz meg, azaz úgy leszel 2. Hogy a társad az 1."*

A közös karrier egy **szoba** teljesítménye. Ha az aranyat a társad viszi,
és közvetlenül mögötte te állsz, a bajnokságot ketten uraltátok.

**Mikor jön elő:** közös karrierben, a szezonzáráskor, ha a végtabellán a
társad az **1.**, te pedig a **2.** vagy. A „csak a társad előz meg" betű
szerint azt jelenti, hogy a fölötted álló egyetlen csapat a társad — ha
bárki más befért közétek, ez a képernyő nem jön.

**Mi látszik:** ugyanaz a trófea-képernyő, más szöveggel. Felütés: *A SZOBA
ARANYA*. A cím: *MEGCSINÁLTÁTOK!* Alatta mindkét klub neve és mindkettőtök
pontszáma. A napló is kimondja.

**Amihez NEM nyúl — és ez szándékos:** a saját könyveléshez. A
`consecutiveTitles`, a `titleWonSeason`, a `msNoteTitleGap`, a
`runNotePyrTitle`, a Run-záróképernyő, a bajnoki morállökés és a trófea mind
a **te első helyedhez** marad kötve. A társad címe **nem** írja föl a te
karrier-rekordjaidat, és nem emeli a te öltöződ hangulatát sem — a te
csapatod második lett. Ez a képernyő elismerés, nem könyvelés.

**Ismétlés ellen:** az `S.mpMateTitleSeason` jelző szezonra szól (ugyanaz az
elv, mint a `titleWonSeason`-nél), és a mentés része — egy újratöltés nem
indítja újra a konfettit.

## 5. Mérés

`node tools/parharc-menetrend-proba.js` — 9 szakasz:

1. az illesztés szobában: 10/13/14/15/16 ellenféllel **mindig 30 forduló**,
   párharcok 15/30, lyuk nélkül;
2. szoba nélkül: 30 forduló, párharc sehol; üres mezőnyből nem találunk ki
   meccseket; a pótlás determinisztikus;
3. hogy a **régi**, nyers `splice` ugyanezeken elhasalt — és 10 ellenféllel
   pontosan a bejelentett képet adta (22 forduló, párharc a 22.-en);
4. `fixturesRepair` a 32 fordulós mentésen;
5. `fixturesRepair` a 22 fordulós mentésen, és hogy az ÉP menetrendhez hozzá
   sem nyúl;
6. a szellemmeccs elleni zár: nem indul hamis mérkőzés, a forduló helyreáll,
   a napló szól; helyreállíthatatlan menetrendnél megáll;
7. `mateFinalRank` és a társ-bajnokavatás képernyője;
8. az éles ág: a szezonzárás a társ címénél is ünnepel, pontosan egyszer, és
   a saját könyveléshez nem nyúl;
9. a három nemleges eset: te 3. vagy, nem a társ az 1., nincs szoba.
