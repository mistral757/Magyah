# CSAPATSTÍLUSOK — SZÁM SZERINT

**Mérés dátuma:** 2026-08-15 · **Verzió:** 3.3.15 (`index.html`)
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
| **Infinity** | Nem | **Igen, ez a nagy szám.** A `stExtendForInfinity()` **318 új fokozatot** nyit a hat stílusban, és ezzel a megszerezhető pontot **5 420-ról 17 245-re** viszi. |

A 100-as nehézség szerepe tehát közvetett: ez az Infinity nyitó küszöbe
(`INFINITY_UNLOCK_RATING`), és innentől számolnak a hosszabbított lépcsők a
200-as Rating-plafonig, 45,5 km/h végsebességig és 210 km/h lövéserőig
(`ST_INF_TOP`). A megvett Infinity-tierek számától ezek **nem** függenek.

---

## 1. A FŐ TÁBLA

| Stílus | Képesség | Szint | **Fa teljes ára** | Mérföldkő (Inf) | **Gyűjthető SP (Inf)** | ebből Inf-hosszabbítás | Fedezet |
|---|--:|--:|--:|--:|--:|--:|--:|
| 🧱 Beton védelem | 9 | 27 | **1 364** | 88 | **1 968** | 1 303 | 144% |
| ⚽ Bombázók | 9 | 27 | **1 364** | 118 | **2 578** | 1 826 | 189% |
| ☯️ Béke és harmónia | 12 | 36 | **2 051** | 186 | **3 302** | 1 961 | 161% |
| ⭐ Sztárom a párom | 7 | 21 | **1 007** | 107 | **2 532** | 1 835 | 251% |
| ⚡ Villámcsapat | 11 | 33 | **1 516** | 136 | **3 302** | 2 333 | 218% |
| 💥 Pánzer | 10 | 30 | **1 440** | 148 | **3 563** | 2 567 | 247% |
| **ÖSSZESEN** | **58** | **174** | **8 742** | **783** | **17 245** | **11 825** | **197%** |

*Fedezet = a stílus saját mérföldköveiből gyűjthető pont a fa teljes árához mérve.*

**Két kiegészítés a képhez:**

- Az **általános (karrier-)mérföldkövek** további **490 SP**-t adnak, stílustól
  függetlenül (`trófeák` 235 · `piac` 69 · `utánpótlás` 54 · `vagyon` 52 ·
  `fölény` 50 · `ugrás` 30). Ezek a kategória-nyitás **pénzbe** kerül, nem pontba.
- Infinity **előtt** a hat fa fedezete 49–69% között mozgott, átlagosan **62%** —
  vagyis a doksi eredeti ígérete („a fát kimaxolni nem lehet") Infinity előtt
  igaz. Infinity **után** átlagosan 197%: a fa kimaxolható lett, de csak a
  lépcsők tetejét megjárva.

---

## 2. A KÉPESSÉGEK DARABSZÁMA

**58 képesség**, egyenként **3 szint** → **174 megvásárolható szint**.

| Stílus | I. rang | II. rang | III. rang | Össz |
|---|--:|--:|--:|--:|
| Beton védelem | 2 | 4 | 3 | 9 |
| Bombázók | 2 | 4 | 3 | 9 |
| Béke és harmónia | 3 | 4 | 5 | 12 |
| Sztárom a párom | 2 | 3 | 2 | **7** |
| Villámcsapat | 4 | 4 | 3 | 11 |
| Pánzer | 3 | 4 | 3 | 10 |

Ársávok: **I. rang 76 SP** (14+24+38) · **II. rang 141 SP** (26+45+70) ·
**III. rang 216 SP** (40+68+108). Két kivétel, mindkettő a Harmóniában, a
`STYLE_BAL_PRICE_MULT = 1,5` árszorzóval: **Természetes összhang 212 SP** és
**Nincs plafon 324 SP** — utóbbi a játék legdrágább egyetlen képessége.

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

| Cím | Nyertes | A döntő szám |
|---|---|---|
| **Legkidolgozottabb** | ☯️ **Béke és harmónia** | 12 képesség · 36 szint · 2 051 SP fa · 186 mérföldkő |
| **Legkönnyebb** | ⭐ **Sztárom a párom** | 251% fedezet · 1 007 SP fa · 22 mérföldkő fedezi az egészet |
| **Legsivárabb** | 🧱 **Beton védelem** | 88 mérföldkő · 8 család · 1 968 SP — mindhárom a legkevesebb |
| **Legmelósabb** | ☯️ **Béke és harmónia** | a legdrágább fa a leglassabb pontcsordogálással (17,8 SP/mérföldkő) |

### 4.1 Legkidolgozottabb — ☯️ Béke és harmónia

Egyszerre nyeri a mennyiséget és a mélységet:

- **A legnagyobb fa:** 12 képesség, 36 szint, 2 051 SP — 50%-kal drágább, mint
  a Beton vagy a Bombázók fája.
- **A legtöbb mérföldkő:** 186 db, és ebből **138 már Infinity előtt** él —
  vagyis nem a hosszabbítótól hízott fel, hanem eleve így írták meg.
- **A legtöbb saját motor-csatorna:** `balEase`, `balSkill`, `balCap`,
  `spreadScoring`, `chemSpeed`, `moraleFloor`, `inheritP` — hét olyan hatásfajta,
  amiből ötöt egyetlen másik stílus sem használ. A többi stílus jórészt a közös
  csatornákat (gólesély, sérülés, piros lap) hangolja.
- **A legfinomabb lépcsőzés:** a paletta/szivárvány négy családja 17–32 fokozatos,
  1 SP-s belépőkkel — sehol máshol nincs ilyen sűrű felbontás.

*Második:* 💥 Pánzer — 13 mérföldkő-család (a legtöbb) és 148 fokozat, de a fája
csak 10 képesség.

### 4.2 Legkönnyebb — ⭐ Sztárom a párom

- **A legolcsóbb fa:** 1 007 SP, és a legkevesebb képesség (7).
- **A legjobb fedezet:** 251% — a stílus saját mérföldköveinek **40%-a** elég a
  teljes fához. (Beton: 69%.)
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

### 4.3 Legsivárabb — 🧱 Beton védelem

Minden mennyiségi mutatóban utolsó:

- **88 mérföldkő** — a legkevesebb (a Harmónia 186-jának 47%-a).
- **8 mérföldkő-család** — a legkevesebb (Pánzer: 13).
- **1 968 SP** — a legkevesebb megszerezhető pont, 45%-kal kevesebb, mint a Pánzeré.
- **144% fedezet** — a legszűkebb az egész játékban.

Két szerkezeti oka van, és mindkettő szándékos:

1. **A fordított mércéjű családok nem hosszabbodnak.** A „Kapott gólok egy
   idényben" 3 fokozat marad (`inv` jelző, `stExtendForInfinity` kihagyja) —
   „felfelé" ott a könnyebbség iránya volna. A Beton kulcsmércéje tehát az
   Infinityben nem termel többet.
2. **A védekezés természeténél fogva kevesebb dolgot lehet megszámolni.** A
   tiszta lap egy bináris esemény meccsenként; a gól, a gólpassz, a piros lap, a
   sebességgól mind halmozódik meccsen belül is.

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

*Szűkebb, de kisebb léptékű:* 🧱 Beton — arányaiban tőle kér a legtöbbet a fa
(a megszerezhető pontjai **69%-a**, szemben a Sztár 40%-ával), csak abszolút
értékben kevesebb munkáról van szó.

---

## 5. MELLÉKLET — a fedezeti sorrend egyben

| # | Stílus | Fa ára | Gyűjthető SP | Fedezet | A fa a pontok hány %-át viszi |
|---|---|--:|--:|--:|--:|
| 1 | ⭐ Sztárom a párom | 1 007 | 2 532 | 251% | 40% |
| 2 | 💥 Pánzer | 1 440 | 3 563 | 247% | 40% |
| 3 | ⚡ Villámcsapat | 1 516 | 3 302 | 218% | 46% |
| 4 | ⚽ Bombázók | 1 364 | 2 578 | 189% | 53% |
| 5 | ☯️ Béke és harmónia | 2 051 | 3 302 | 161% | 62% |
| 6 | 🧱 Beton védelem | 1 364 | 1 968 | 144% | 69% |

**A legnagyobb egyetlen pontforrás stílusonként** (egy mérföldkő-család teljes
kifizetése): Beton „A bevehetetlen idény" **605** · Bombázók „A gólrekord-idény"
**605** · Harmónia „Szivárvány" **544** (×2 család) · Sztár „Gólzápor egy
meccsen" **605** · Villám „A repülő kezdő 11" **605** · Pánzer „Az ágyúgolyó" **605**.
