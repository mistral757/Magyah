# CSAPATSTÍLUSOK — SZÁM SZERINT

**Mérés dátuma:** 2026-08-18 · **Verzió:** 3.4.00 (`index.html`)
**Beállítás:** 100-as nehézségi szint · **Infinity megnyitva** · Alap fejlődési tempó (×1,00)

> A számok nem becslések: az `index.html` `STYLE_MILESTONES` és `STYLE_TRAITS`
> tábláit közvetlenül kiértékelve születtek, lefuttatott `stExtendForInfinity()`
> mellett — vagyis pontosan azt a fát és azt a mérföldkő-listát mutatják, amit
> egy Infinityben járó karrier lát.

---

## 0. Amit a 100-as nehézség és az Infinity ténylegesen csinál

Fontos tisztázni, mert könnyű többet várni tőle, mint amennyit tesz:

| Tényező | Hat a fa árára? | Hat a mérföldkő-pontra? |
|---|---|---|
| **Nehézségi szint (100)** | **Nem.** A `STYLE_TRAIT_PRICE` fix: I. 14/24/38 · II. 26/45/70 · III. 40/68/108. | **Nem.** Az `msSpReward()` csak a tempóból számol. |
| **Fejlődési tempó** | Nem | **Igen** — `msSpReward = val × tempoMult()`. Alap ×1,00 · Komótos ×0,90 · Csiga ×0,75 · Gleccser ×0,60. |
| **Infinity** | Nem | **Igen, ez a nagy szám.** A `stExtendForInfinity()` **342 új fokozatot** nyit a hat stílusban, és ezzel a megszerezhető pontot **5 997-ről 19 340-re** viszi. |

A 100-as nehézség szerepe tehát közvetett: ez az Infinity nyitó küszöbe
(`INFINITY_UNLOCK_RATING`), és innentől számolnak a hosszabbított lépcsők a
200-as Rating-plafonig, 45,5 km/h végsebességig és 210 km/h lövéserőig
(`ST_INF_TOP`). A megvett Infinity-tierek számától ezek **nem** függenek.

---

## 1. A FŐ TÁBLA

| Stílus | Képesség | Szint | **Fa teljes ára** | Mérföldkő (Inf) | **Gyűjthető SP (Inf)** | ebből Inf-hosszabbítás | Fedezet |
|---|--:|--:|--:|--:|--:|--:|--:|
| 🧱 Beton védelem | 13 | 39 | **1 992** | 154 | **4 063** | 2 821 | 204% |
| ⚽ Bombázók | 9 | 27 | **1 364** | 118 | **2 578** | 1 826 | 189% |
| ☯️ Béke és harmónia | 12 | 36 | **2 051** | 186 | **3 302** | 1 961 | 161% |
| ⭐ Sztárom a párom | 11 | 33 | **1 581** | 123 | **2 977** | 2 175 | 188% |
| ⚡ Villámcsapat | 12 | 36 | **1 732** | 239 | **4 331** | 2 926 | 250% |
| 💥 Pánzer | 10 | 30 | **1 440** | 148 | **3 563** | 2 567 | 247% |
| 🌀 Tiki-Taka | 10 | 30 | **1 883** | 189 | **4 560** | 3 001 | 242% |
| **ÖSSZESEN** | **77** | **231** | **12 043** | **1 157** | **25 374** | **17 277** | **211%** |

*Fedezet = a stílus saját mérföldköveiből gyűjthető pont a fa teljes árához mérve.*

**Két kiegészítés a képhez:**

- Az **általános (karrier-)mérföldkövek** további **490 SP**-t adnak, stílustól
  függetlenül (`trófeák` 235 · `piac` 69 · `utánpótlás` 54 · `vagyon` 52 ·
  `fölény` 50 · `ugrás` 30). Ezek a kategória-nyitás **pénzbe** kerül, nem pontba.
- Infinity **előtt** a hét fa fedezete 51–83% között mozog, átlagosan **67%** —
  vagyis a doksi eredeti ígérete („a fát kimaxolni nem lehet") Infinity előtt
  igaz. Infinity **után** átlagosan 211%: a fa kimaxolható lett, de csak a
  lépcsők tetejét megjárva.
- A **Tiki-Taka** két családja (`tt_chain`, `tt_poss`) ki van véve az
  Infinity-hosszabbításból, mert a tetejüket nem a mezőny szintje szabja meg,
  hanem egy fizikai és egy képesség-korlát (30 elemű passzsor · 150-es
  taktika-plafon). Enélkül a stílus SP-je magasabb volna, a felső fokozatai
  viszont teljesíthetetlenek.

---

## 2. A KÉPESSÉGEK DARABSZÁMA

**77 képesség**, egyenként **3 szint** → **231 megvásárolható szint**.

| Stílus | I. rang | II. rang | III. rang | Össz |
|---|--:|--:|--:|--:|
| Beton védelem | 3 | 6 | 4 | 13 |
| Bombázók | 2 | 4 | 3 | **9** |
| Béke és harmónia | 3 | 4 | 5 | 12 |
| Sztárom a párom | 3 | 5 | 3 | 11 |
| Villámcsapat | 4 | 4 | 4 | 12 |
| Pánzer | 3 | 4 | 3 | 10 |
| Tiki-Taka | 2 | 3 | 5 | 10 |

Ársávok: **I. rang 76 SP** (14+24+38) · **II. rang 141 SP** (26+45+70) ·
**III. rang 216 SP** (40+68+108). Hat kivétel, mind árszorzóval: a Harmónia
**Természetes összhang**ja (212 SP) és **Nincs plafon**ja (324 SP) a
`STYLE_BAL_PRICE_MULT = 1,5`-tel — utóbbi a játék legdrágább egyetlen
képessége —, a Beton **Jöhet a buszsofőr!**-je (270 SP) a
`STYLE_BUS_PRICE_MULT = 1,25`-tel, valamint a Tiki-Taka három saját rendszere —
**Passzkémia**, **Passzrekord**, **Guardiola** (292 SP egyenként) — a
`TT_SYSTEM_PRICE_MULT = 1,35`-tel.

**Egy kedvezmény van az egész fában:** ha a klub edzője eleve **Pep Guardiola**,
a Guardiola-képesség 1. szintje (54 SP) INGYEN jár, a Tiki-Taka választásának
pillanatától. Ilyen klubnál a képesség 238 SP-be kerül, a fa pedig 1 829-be —
a felület mindkét számot a tényleges állapotból írja ki (`guardiolaFreeLevel`).

**A Tiki-Taka a legfelülre súlyozott fa:** tíz képességéből **öt** a III.
sávban áll, mert három közülük nem egy meglévő számot mozdít, hanem egy új
mechanikát ad a játékhoz. Ezért a legkevesebb képességgel is a második
legdrágább fája van (1 883 SP), közvetlenül a Harmónia mögött.

---

## 3. A LEGERŐSEBB HATÁSÚ KÉPESSÉGEK (TOP 3)

### 🥇 1. Megfélemlítés III. — 💥 Pánzer · 216 SP

`redOppGoalMult: 0.10` — piros lap után az ellenfél gólesélye a lefújásig
**−90%**. Nincs a fában még egy ilyen nagyságrendű egyszámos billentés. És nem
véletlen szinergia: a Pánzer másik képessége, a **Vadhajtások III.** *szándékosan
emeli* a saját piroslap-esélyedet **+160%-kal** — vagyis a stílus előállítja
magának a feltételt, amitől a legerősebb. Egy emberhátrányos meccs a Pánzernél
nem katasztrófa, hanem a legjobb üzemmód.

### 🥈 2. Nincs plafon III. — ☯️ Béke és harmónia · 324 SP

`balCap: 2.0` — a csapategyensúly-mérő 100-as plafonja **200-ra** tolódik.
Ez az egyetlen képesség, ami **három csatornán egyszerre** fizet: a
csapaterő-bónusz (alap max +2,00), az ingyen képesség-kvóta és a
`hm_balN` mérföldkőlépcső **együtt** nyílik ki tőle — azaz stíluspontot is
terem. A kód maga jegyzi meg a forrásban: *„Egyetlen megnyitott szint önmagában
92-ről 110-re lökte a mérőt, ami az egész stíluspont-gazdaságot megpörgette."*
Ezért kapott 1,5× árszorzót — a hatását nem vágták vissza, csak megkérték az árát.
Halmozódik az **Egymástól tanulnak III.** (+3 ingyen képesség/szezon) és a
**Nincs gyenge láncszem III.** (+3 csapaterő) képességekkel.

### 🥉 3. A rendszer ő III. — ⭐ Sztárom a párom · 216 SP

`ovrTeam: +5` — ha a sztárod 10 Ratinggel a kezdő 11 átlaga fölött van, a csapat
**+5 csapaterőt** kap. Ez a **legnagyobb egyetlen csapaterő-módosító** a
játékban: a teljes csapategyensúly-jutalom maximuma +2,00, a legerősebb
aura-skill (Motor) +2,0, a telt házas morál nagyjából ugyanennyi. A `+5` a
`teamStrength` képletébe **közvetlenül** ül be (`ovr = sum/11 + … + styleBonus`),
és a bérszámfejtés horgonya szerint a csapaterő minden pontja ~525 pontnyi
keretnek felel meg 90 fölött — vagyis ez a képesség egymaga **~2 600 TSI-nyi
keretet ér**. A **Nélküle nem megy III.** (±4) rátehető: együtt **+9**.

**Dobogó alatt:** Kiosztott szerepek III. (Bombázók, ×3,7 gólsúly) ·
Zárt kapu III. (Beton, −14% ellenfél-gólesély minden meccsen) ·
Mesterhármas-csillag III. (Villám, ingyen csillag-nyitás az egész keretre).

---

## 4. A NÉGY VERDIKT

> ⚠️ **A 4. és az 5. szakasz PRÓZÁJA a 3.3.16-os méréshez készült**, és azóta
> három stílus is bővült (Sztárom a párom 7 → 11 képesség, Villám 11 → 12,
> plusz a hetedik filozófia, a 🌀 Tiki-Taka). Az 1., a 2. és a mellékleti
> táblázat számai FRISSEK (3.4.00); az alábbi indoklások közül a
> „Legkönnyebb" gazdát cserélt (a Sztár 251% → 188% fedezetre esett, az élre a
> Villám és a Pánzer került), a többi verdikt áll.

| Cím | Nyertes | A döntő szám |
|---|---|---|
| **Legkidolgozottabb** | ☯️ **Béke és harmónia** | 186 mérföldkő · 2 051 SP fa · hét saját motor-csatorna |
| **Legkönnyebb** | ⚡ **Villámcsapat** | 250% fedezet · 239 fokozat — a legtöbb mérföldkő a mezőnyben |
| **Legsivárabb** | ⚽ **Bombázók** | 9 képesség · 118 mérföldkő · 2 578 SP — mindhárom a legkevesebb |
| **Legmelósabb** | ☯️ **Béke és harmónia** | a legdrágább fa a leglassabb pontcsordogálással (17,8 SP/mérföldkő) |
| **Legfelülre súlyozott** | 🌀 **Tiki-Taka** | tíz képességéből öt a III. sávban · három saját mechanika, 1,35× árszorzóval |

> **A 3.3.16 átrendezte a mezőnyt.** A Beton védelem — a korábbi mérés
> legsivárabb stílusa — négy képességgel és öt mérföldkő-lépcsővel bővült
> (Ötös bástya · Tiszta szerelés, hideg sör · Olcsó a jó védő · Jöhet a
> buszsofőr!, illetve a védekező képességek 13 fokozatos lépcsője, a
> Védekezés-attribútum, a védősor összereje, a karrier-bravúrok és a
> tisztalap-sorozat). Ezzel **88 → 154 mérföldkő**, **1 968 → 4 063 pont**,
> **1 364 → 1 992 SP fa**, és a cím átkerült a tükörképéhez, a Bombázókhoz.

### 4.1 Legkidolgozottabb — ☯️ Béke és harmónia

Szorosabb, mint volt: a Beton bővítése után a Harmónia már nem minden
mutatóban vezet — de ahol számít, ott igen.

- **A legnagyobb fa:** 2 051 SP. A Beton 1 992-je most már közvetlenül mögötte
  áll (sőt képességben és szintben 13/39-cel meg is előzi), a Bombázók és a
  Sztár fája viszont a fele.
- **A legtöbb mérföldkő:** 186 db, és ebből **138 már Infinity előtt** él —
  vagyis nem a hosszabbítótól hízott fel, hanem eleve így írták meg.
- **A legtöbb saját motor-csatorna:** `balEase`, `balSkill`, `balCap`,
  `spreadScoring`, `chemSpeed`, `moraleFloor`, `inheritP` — hét olyan hatásfajta,
  amiből ötöt egyetlen másik stílus sem használ. A többi stílus jórészt a közös
  csatornákat (gólesély, sérülés, piros lap) hangolja.
- **A legfinomabb lépcsőzés:** a paletta/szivárvány négy családja 17–32 fokozatos,
  1 SP-s belépőkkel — sehol máshol nincs ilyen sűrű felbontás.

*Második:* 🧱 Beton védelem — a bővítés után **13 képesség / 39 szint** (a
legtöbb), 12 mérföldkő-család és 154 fokozat; a fája viszont 59 ponttal olcsóbb,
és a mérföldköveinek 61%-a Infinity-hosszabbítás, nem eredeti tervezés.

### 4.2 Legkönnyebb — ⭐ Sztárom a párom

- **A legolcsóbb fa:** 1 007 SP, és a legkevesebb képesség (7).
- **A legjobb fedezet:** 251% — a stílus saját mérföldköveinek **40%-a** elég a
  teljes fához. (A legszűkebb most a Harmónia: 62%.)
- **A legkevesebb teljesítendő mérföldkő:** ha a legértékesebbek felől haladsz,
  **22 mérföldkő** kifizeti az egész fát. (Harmónia: 48.)
- **A legmagasabb hozam fokozatonként:** 23,7 SP/mérföldkő, és mindössze
  9 olyan fokozat van, ami 3 SP-nél kevesebbet ad.
- **És a lényeg:** a 10 családból 8 **ugyanazt az egy embert** méri (Rating,
  képességek, díjak, hűség, mesterhármas, gólpassz, kártya, gólzápor). Egy
  játékos felnevelése egyszerre nyolc lépcsőn tol felfelé — nincs még egy stílus,
  ahol egyetlen döntés ennyi sávot mozdítana.

**Az ára:** a Nélküle nem megy III. **−4 csapaterő**, ha a sztár nincs a kezdőben.
A stílus olcsó, de törékeny.

### 4.3 Legsivárabb — ⚽ Bombázók

A cím a 3.3.16-ban gazdát cserélt: a Beton bővítése után a Bombázók maradt a
legszűkebb tábla — és pontosan ugyanazokból az okokból, amiket a Beton most
kinőtt.

- **9 képesség / 27 szint** — a Sztárral holtversenyben a legkevesebb, és a fája
  (1 364 SP) a második legolcsóbb.
- **118 mérföldkő** — csak a Sztáré (107) kevesebb.
- **2 578 SP** — a legkevesebb megszerezhető pont; a Beton mostani 4 063-jának
  63%-a.
- **A befejező képességek lépcsője 3 fokozat** (3/6/10), ugyanaz a rövid
  `bz_skill`, ami a Betonnál a szűkösség fő oka volt — ott már 13 fokozat.

A Bombázók a Beton tükörképe, tehát ugyanaz a bővítés itt is elvégezhető,
csatárokra fordítva: hosszú képesség-lépcső, a Gólszerzés-attribútum és a
támadósor összereje, karrier-szintű gólszámláló, gólos sorozat.

*Második:* ⭐ Sztárom a párom — a **legvékonyabb fa** (7 képesség, 21 szint), de
mérföldkőben gazdag, tehát a sivárság nála csak a bolt oldalán jelenik meg.

### 4.4 Legmelósabb — ☯️ Béke és harmónia

Ugyanaz a stílus, ami a legkidolgozottabb — és pontosan ezért:

- **A legdrágább fa:** 2 051 SP, benne a játék egyetlen 324 SP-s képességével.
- **A legtöbb teljesítendő fokozat:** 48 mérföldkő a legjobb esetben is (a
  legértékesebbek felől), és **163**, ha alulról építkezel.
- **A legalacsonyabb hozam:** 17,8 SP/mérföldkő — 27%-kal rosszabb, mint a
  Villámé (24,3). **43 fokozat** fizet 3 SP-nél kevesebbet: ez a stílus aprópénzben számol.
- **A leghosszabb lépcsők:** a szivárvány-családok **32 fokozatosak**, tetejükön
  160 olyan mérkőzéssel, ahol 4+ különböző ember talál be; a paletta-családok
  **400** háromgólszerzős meccset kérnek. Ezek több teljes karrier-hosszú
  számlálók.
- **Ráadásul a mércék többsége „egyszerre igaz" típusú** (szórás, tengelyek,
  effektív hozzájárulók száma), amit nem lehet egyetlen jó igazolással megvenni —
  az egész keretet kell hozzá karbantartani.

A Harmónia a bővítés után **arányaiban is** a legszűkebb: a fája a
megszerezhető pontjainak **62%-át** viszi el, szemben a Sztár és a Pánzer
40%-ával. A második legszűkebb a Bombázók (53%), a Beton a bővítéssel 69%-ról
**49%-ra** enyhült.

---

## 5. MELLÉKLET — a fedezeti sorrend egyben

| # | Stílus | Fa ára | Gyűjthető SP | Fedezet | A fa a pontok hány %-át viszi |
|---|---|--:|--:|--:|--:|
| 1 | ⚡ Villámcsapat | 1 732 | 4 331 | 250% | 40% |
| 2 | 💥 Pánzer | 1 440 | 3 563 | 247% | 40% |
| 3 | 🌀 Tiki-Taka | 1 883 | 4 560 | 242% | 41% |
| 4 | 🧱 Beton védelem | 1 992 | 4 063 | 204% | 49% |
| 5 | ⚽ Bombázók | 1 364 | 2 578 | 189% | 53% |
| 6 | ⭐ Sztárom a párom | 1 581 | 2 977 | 188% | 53% |
| 7 | ☯️ Béke és harmónia | 2 051 | 3 302 | 161% | 62% |

**A legnagyobb egyetlen pontforrás stílusonként** (egy mérföldkő-család teljes
kifizetése): Beton „A bevehetetlen idény" **605** · Bombázók „A gólrekord-idény"
**605** · Harmónia „Szivárvány" **544** (×2 család) · Sztár „Gólzápor egy
meccsen" **605** · Villám „A repülő kezdő 11" **605** · Pánzer „Az ágyúgolyó" **605**.

---

## 6. A BETON VÉDELEM ÚJ TARTALMA (3.3.16)

**Négy képesség**

| Rang | Képesség | Ár | Hatás (I / II / III) |
|---|---|--:|---|
| I | Ötös bástya | 76 | ha legalább ÖT védő áll a felállásban: −2,5% / −5% / −7,5% ellenfél-gólesély |
| II | Tiszta szerelés, hideg sör | 141 | a „Fogd meg a söröm!" a szerelésekért is jár: 10 / 7 / 5 tiszta szerelés egy idényben |
| II | Olcsó a jó védő | 141 | −25% / −33% / −40% a védők vételárából |
| III | Jöhet a buszsofőr! | **270** | Park the bus mellett a csereszünetben behívható: ellenfél −33% / −50% / −66%, saját −50% / −33% / −25% |

Az **Ötös bástya** az első képesség a játékban, ami nem a keretről, hanem a
**felállásról** szól — ehhez a szorzós hatás-csatorna (`styleFxMul`) is
megnyílt a függvény-értékek előtt, hogy a feltételt maga a szorzó mérhesse.

A **buszsofőr** ára egy cserelehetőség és egy középpályás; az íve nem az, hogy
egyre jobban véd, hanem hogy **egyre kevesebbet fizetsz érte elöl**. És nem
személy: nem szerez gólt, nem kap lapot, nem sérül, nem fejlődik, és egyetlen
statisztikába sem kerül bele.

**Öt mérföldkő-lépcső**

| Család | Fokozat (Inf) | Pont | Lépcső |
|---|--:|--:|---|
| Védekező képességek *(átírva)* | 19 | 521 | 1 → 3 → 5 → 7 → 10 → 12 → 15 → 17 → 20 → 25 → 30 → 40 → 50 → … |
| A legjobb védőd Védekezése | 13 | 439 | 85 → 90 → 95 → 100 → 105 → 110 → 115 → … → 200 |
| A védősor össz Védekezése | 13 | 392 | 400 → 450 → 500 → 550 → 600 → 650 → 700 → … → 1 260 |
| Bravúrok a klub történetében | 15 | 442 | 25 → 60 → 120 → 200 → 300 → 450 → 650 → 900 → 1 200 → … |
| Tisztalap-sorozat | 15 | 442 | 2 → 3 → 4 → 5 → 6 → 8 → 10 → 12 → 15 → … |

A régi „védekező képességek" három fokozata (3/6/10) egy-két idény alatt
kifutott; az új lépcső az első képességtől az ötvenedikig végigkíséri a
karriert. A két attribútum-lépcső szándékosan két külön utat ír le: aki egyetlen
hatalmas védőt nevel, az elsőt viszi, aki mély — vagy egyszerűen ötös —
védősort épít, a másodikat.
