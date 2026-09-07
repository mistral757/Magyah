# 📈 A fejlődés-mérő (3.9.36)

Kimondott kérés:

> „Divíziók fejlődési tempója nem egy lineáris függvény. Inkább ilyesmi az
> átlag játékos fejlődés: 80 ⇒ 85 ⇒ 92 ⇒ 105 ⇒ 125.
> Kéne belerakni egy mérőt a gamebe, ami megmutatja hogyan fejlődött a csapatom
> egy karrierben míg elértem a d1 wint, hogy lehessen ebből levezetni egy
> kifinomultabb fejlődést a divízióknak"

---

## 1. Az adat már gyűlt, csak nem látszott

A ligapiramis szezonfordulója minden idényben ír egy sort (`S.pyr.log`), és a
sor eddig is tartalmazta a meccs-erődet, az osztály közepét és a mezőny lépését.
**Egyetlen felülete a böngésző-konzol volt** (`pyrDumpState`, a kód saját szavai
szerint „a konzolhoz, a fejlesztéshez").

A mérő tehát nem új könyvelés, hanem a meglévőnek a **képernyője** — plusz három
szám, ami hiányzott belőle.

## 2. A három új szám, és miért pont ez a három

A meglévő `my` a **meccs-erő**: benne van a morál, az edző, a taktika, az aura
és a kapitány is. Egy divízió-lépcső levezetéséhez ez **túl sok** — azok a tagok
idényről idényre ingadoznak, és nem a keret fejlődéséről szólnak.

```
xi   — a kezdő tizenegy ÁTLAG JÁTÉKOSA   (pyrXiAvg)
sq   — a TELJES keret átlaga             (pyrSquadAvg)
age  — a kezdő tizenegy átlagéletkora    (pyrXiAge)
```

Mind a három a **keretről** szól, nem a mérkőzésről. A `xi` és a `sq`
különbsége is beszédes: ha a tizenegy nő, a keret meg nem, akkor a mélység marad
el. Üres keretnél (fejlesztői teszt, félbemaradt betöltés) mindhárom `null` — a
hiányzó adat jobb, mint a hamis.

## 3. Mit mutat

A HUB osztály-kijelzőjén (a „hegy" alatt) egy gomb: **📈 Hogyan fejlődött a
csapatom?**

* **Fejléc** — honnan indultál, hol tartasz, mennyit nőtt az átlag játékosod,
  és melyik idényben nyerted meg az élvonalat.
* **Görbe** — az átlag játékosod és az osztály közepe idényről idényre;
  arany pont a feljutás, piros a kiesés. Kézzel rajzolt SVG: egy vonalgrafikonért
  nem éri meg könyvtárat behúzni, és így a téma-tokenekkel megy.
* **Osztályonként** — *ez a levezetés nyersanyaga*: hány idényt töltöttél ott,
  mekkora volt az átlag játékosod odaérkezéskor és távozáskor, és mennyi volt az
  osztály közepe.
* **Idényről idényre** — a teljes napló, a nettó fejlődéssel.
* **📋 Számok másolása** — tabulátorral tagolt szöveg, táblázatkezelőbe
  illeszthető. Ha nincs vágólap-engedély, a panel aljára írja ki kijelölhetően:
  a számokat ki kell tudni venni a játékból, ez a kérés lényege.

Az élvonal megnyerésekor a szezonforduló elbeszélése külön kimondja, hogy a
mérő teljes lett, és hol nézhető meg.

## 4. Amit a mai világ mond, és amit a mérő mondani fog

A piramis világa **ma lineáris**:

```
PYR_TOPMEAN = 86      az élvonal közepe
PYR_STEP    = 3,0     MINDEN osztály közt ugyanannyi

D6 71  ·  D5 74  ·  D4 77  ·  D3 80  ·  D2 83  ·  D1 86
```

A kérésben szereplő alak ezzel szemben **gyorsuló**: 80 → 85 → 92 → 105 → 125,
vagyis +5, +7, +13, +20.

**Két dolgot érdemes kimondani, mielőtt bárki átírja a lépcsőt:**

1. **A 125 nincs miből.** A piramis osztályait **valós klubkeretek** töltik meg,
   a valós erejük szerint rangsorolva, és a `PYR_TOPMEAN = 86` pont a
   legerősebb valós kerethez (~88) van horgonyozva. Egy 125-ös élvonal-közepet a
   mai klubkészlet nem tud kiállítani — ahhoz a világot egészében kellene
   feljebb tolni (`upAmt`, ma ±15-re zárva), vagy a horgonyt elengedni.
2. **A mérő pont ezt a kérdést dönti el.** Nem azt kell megtippelni, milyen a
   görbe, hanem megnézni, mekkora átlag játékossal jutottál fel az egyes
   osztályokból. Az „osztályonként" táblázat sorozata **közvetlenül**
   összevethető a fenti hat számmal.

Ezért a lépcső **ebben a verzióban nem változott**: előbb az adat, aztán a
döntés. A mérő az adat.

## 5. Mérve

`tools/pyr-mero-proba.js` — kitalált, de hihető felmászással (D6 → D1, 12 idény),
mert egy valódi hatosztályos mászás lejátszása órákig tartana, a mérő pedig
tisztán a naplóból dolgozik: azt kell bizonyítani, hogy a sorokat helyesen
olvassa.

| | eredmény |
|---|---|
| üres keret | mindhárom szám `null` |
| három ember (80 · 90 · 70, 24 · 28 · 32 év) | átlag játékos **80,0**, átlagkor **28,0** |
| napló nélkül | „Még nincs lezárt idényed…" |
| egy idénnyel | megszólal, osztály-blokkal |
| teljes felmászás | „A D6-ból indultál, most a D1-ben állsz — 12 lezárt idény. Az átlag játékosod 72,0 → 105,6 (+33,6). 🏆 Az élvonalat a 12. idényben nyerted meg." |
| másolható szöveg | 24 sor, fejléccel és osztály-blokkal |
| vízszintes túlcsordulás | nincs |
| mindhárom téma | képernyőképpel ellenőrizve |

**A levezetés, ahogy a mérő adja** (a próba naplójából):

```
átlag játékos osztályonként:  75,4 · 80,6 · 85,0 · 90,4 · 97,1 · 105,6
a lépcsők ebből:              +5,2 · +4,4 · +5,4 · +6,7 · +8,5
a mai világ lépcsője:         +3,0 · +3,0 · +3,0 · +3,0 · +3,0
```

Ez a két sor egymás alatt — pontosan az az összevetés, amiért a mérő készült.

## 6. Egy hiba, amit a próba fogott meg, a gate nem

A panel gombjait először **betöltéskor** kötöttem be
(`$("pyrMeterClose").onclick=…`). A pyramis-szakasz a szkript ~12 950. sorában
áll, a `$` segédfüggvény viszont jóval lentebb `const` — a hívás tehát **TDZ-vel
dobott, és azzal az egész játék megállt**: a `gameMode` létre sem jött.

`node --check` és az eslint `no-undef` **nem fogja meg**: a szintaxis helyes, és
sorrendet egyik sem lát. A böngészőben futó próba fogta meg, első indításra.
A kötés ezért a panel nyitásához költözött (`pyrMeterBind`, idempotens).

*(Ugyanez a csapda a fájlban már kétszer elsült — `diffTierLabel` → `leagueLabel`,
`heInit` → `THEMES`. Ez a harmadik.)*

---

## 7. A rejtett bónusz és az osztályugrás (3.9.38)

Két lelet három lejátszott karrier adatából — mindkettő a mérőt tette
használhatatlanná pont arra, amiért készült.

### 7.1 A `meccs_ero` oszlop hazudott

A napló `my` mezője a **`teamStrength()`**, ami *szándékosan* csak a keretet
méri: a morált, az edzőt, a taktikát, az aurát, a kapitányt és az **összhangot**
kihagyja. A mérő lábjegyzete és a másolható szöveg fejléce mégis
**„meccs-erő"-nek** nevezte.

Ez pont azt a mennyiséget címkézte félre, amiről a levezetés szól. Egy mért
D1-es keretnél:

| | |
|---|---|
| meccs-erőd | 142,4 |
| mezőny meccs-ereje | 127,9 = osztályközép 120,0 + **0,5 × rejtett** |
| → **rejtett bónusz** | **15,8** |
| nyers keret-erőd | 126,6 |
| nyers előny | +6,6 |
| **valódi rés** | **+14,6** |

A rejtett tag **15,8 pont — több mint öt osztálylépcsőnyi (5 × 3,0)**, és a
mezőny ebből fixen csak a felét kapja vissza (`OPP_BUFF_MEASURED = 0,5`; a
piramisban a fix tag kimarad). Ezt eddig **kézzel kellett visszafejteni** a
képernyőn látható három számból.

Mostantól a napló soronként tárolja (`h`), és a másolható szöveg három külön
oszlopban adja: `keret_ero` · `rejtett` · `meccs_ero`. A nettó is kettévált:
`netto_keret` (a régi, változatlan) és `netto_meccs` — **ez az, amit a
lábjegyzet eddig ígért, de nem mért.**

### 7.2 Az osztályugrás némán kihagyott egy fokot

Az **osztályugrás** (`PYR_LEAP`) pénzért visz fel egy osztályt. Két mért
karrierben ez kétszer is megtörtént, és a mérő „osztályonként" táblájából
emiatt hiányzott a **D4** és a **D2** — miközben a tábla fölött ott áll, hogy
*„ez a sorozat mondja meg, milyen a valódi lépcső."*

Egy hiányzó fok ott **hibának látszik**, nem vásárlásnak.

Mostantól:

* a `pyrLeapCommit` feljegyzi az ugrást (`S.pyr.leaps`), a napló sora pedig
  **🎲**-t kap;
* a tábla fölött egy mondat kimondja, melyik fok maradt ki és miért.

> **A kimaradó fok MÉRT, nem feltételezett.** Az ugrás a `from` osztályból visz
> a `to`-ba, tehát a kimaradó fok a `from` — oda a feljutás már betett, csak épp
> egy percet sem játszottál ott. **De nem mindig marad ki:** ha korábban már
> töltöttél ott egy idényt, az osztály ott áll a táblában, és nincs mit
> magyarázni. Az első változat vakon a `from−1`-et írta ki; a próba
> képernyőképén azonnal látszott, hogy rossz osztályt nevez meg.

### 7.3 Amit a három karrier mond a mezőnyről

A `nettó` (mennyivel nőtt gyorsabban a keret-erőd, mint a mezőnyöd) két
független karrieren betűre ugyanazt a mintát adja:

| karrier | 2. idény | 3. | 4. | 5. |
|---|---|---|---|---|
| 1. | +3,9 | +2,1 | **+11,5** | |
| 2. | +3,7 | +1,8 | **+11,3** | +5,7 |
| 3. (💀 Végtelen menet) | | | | **+5,7** |

A harmadik a **legkeményebb** fokozaton futott (💀 Végtelen menet,
Csigatempó ×0,56): a mezőny 3,7-et lépett, a játékos 9,4-et. A fokozat
szimulált mediánja `refTop: 24` — a valóságban az **5-6. idényre** ért az
élvonalba.

**Miért**: a `pyrAiRate` a `PYR_PACE`-ből (7,0, „a játékos mért üteme") számol,
de az a szám a **fejlődést** méri. A valódi növekedés ennek a **2,4–2,7-szerese**,
mert három csatorna adódik hozzá, amiről a mezőny semmit nem tud: az
**igazolás** (a vitrin-prémium a trófeákkal ugrik), az **összhang** és a
**taktika**. Ráadásul a `pyrAiRate` a **te tempódat** is beszorozza — így egy
lassított személyes tempó a mezőnyt megfelezi, téged viszont alig fékez.
