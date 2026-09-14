# A Panzer mérföldkövei (3.9.71)

**Állapot:** ✅ megvalósítva · **Mérés:** `tools/panzer-merfoldko-proba.js` — 22 állítás

---

## 1. A bejelentés

> „a panzernek stílus mérföldkövei sincsenek szinte egyáltalán. 600 pont körül
> gyűjthető, míg a többiek talán 1700 vagy ilyesmi. Legyenek a többihez
> hasonló, jól teljesíthető, sok lépcsős mérföldkövek, amiket fun gyűjteni és
> kiadnak legalább annyit mint a többinél szerezhető pontokban"

## 2. A mérés

A pontos szám **996** volt (nem 600), de a panasz maga helytálló: a Panzer a
mezőny **utolsója**, a legjobbnak a felén.

| stílus | mérföldkő-pont | sor | család |
|---|---|---|---|
| Tiki-Taka | 2055 | 123 | 25 |
| Harmónia | 1868 | 178 | 27 |
| Beton | 1734 | 112 | 25 |
| Villám | 1405 | 149 | 25 |
| Sztár | 1280 | 114 | 25 |
| Bombázók | 1202 | 105 | 26 |
| **Panzer** | **996** | **82** | **21** |

Ugyanaz a hibaosztály, amit a **3.8.39** a Sztárnál javított.

### Mi hiányzott valójában

Nem a fokozatok száma, hanem a **sűrű alapszámláló**. Minden más filozófiának
van egy olyan mércéje, ami **magától, minden meccsen** mozog: gól, gólpassz,
tiszta lap, párkémia. A Panzer legnagyobb tétele a **piros lap** volt —
csakhogy pirosból egy idényben 3–7 esik, tehát a lépcső hónapokig áll egy
helyben. Attól nem „fun gyűjteni".

Márpedig a Panzernek **van** két sűrű számlálója, csak eddig egyik sem volt
megmérve:

1. a **sárga lap** — mérkőzésenként bő egy, egy temperamentumos keretben több
   (a vandál lap-súlya 2,4, a földi békéé 0,35);
2. a saját **rettenet-gazdasága** (3.9.68) — ami eddig ezerszámra termelt
   pontot anélkül, hogy a stílus-tábla tudott volna róla.

## 3. Kilenc új család, +1113 pont

| család | fokozat | pont | mit mér |
|---|---|---|---|
| `pz_ycall` Sárga lapok a klub történetében | 12 | 265 | `stCareerSum("yc")` |
| `pz_dread` Összegyűjtött rettenet | 12 | 265 | `fearState().earned` |
| `pz_long` A Hosszú labdák ismertsége | 10 | 156 | `tacticLevel("hosszu")` |
| `pz_fear` A félelem szint | 9 | 102 | `fearLevel()` |
| `pz_injall` Sérülések a klub történetében | 9 | 102 | `stCareerSum("inj")` |
| `pz_giant` Óriásölések | 9 | 102 | `msT().giantKills` |
| `pz_ycseason` Sárga lapok egy idényben | 6 | 43 | `pzYcSeason()` |
| `pz_redwinN` Győzelmek emberhátrányban | 6 | 43 | `msT().redWins` |
| `pz_ycmatch` Sárga lapok egy mérkőzésen | 3 | 35 | `msT().maxMatchYc` |

Mind **sok lépcsős**, és mind olyat mér, ami a Panzernél **magától történik**:
nem új feladat, hanem a meglévő játék megfizetése.

### Két új számláló kellett hozzá

A sárga lapot eddig két helyen jegyeztük — a `seasonYellows` **idényre**
összegzett, a `careerStats.yc` **emberre**. Egyik sem tudta, hány sárga esett
EGY mérkőzésen, sem hogy melyik volt a legrosszabb idény:

- **`msT().maxMatchYc`** — a mérkőzés végén, a lap-elszámolás blokkjában. Ez
  az egyetlen pont, ahol a meccs saját mérlege még együtt áll.
- **`msT().maxSeasonYc`** — az idényzárásnál, a `maxSeasonReds` mellett.
  Ettől nem esik vissza a sáv idényfordulón, pontosan úgy, ahogy a piros
  lapoknál.

### `pz_redwinN` — miért egy második család

Az „Emberhátrányban is" (`pz_redwin`) a stílus egyik legjellemzőbb pillanata
volt, mégis **egyszer** fizetett. Most kap egy lépcsőt is. Ugyanaz a minta,
amit a `pz_injwin` → `pz_injwin2` páros már használ: az egyfokozatú „első
alkalom" megmarad, mellé jön a számláló.

## 4. Az eredmény — és miért nem billent el

| | előtte | utána |
|---|---|---|
| mérföldkő-pont | 996 (**7/7**) | **2109** (**1/7**) |
| sor | 82 | 158 |
| család | 21 | 30 |

A puszta összeg nem bizonyíték, hogy a gazdaság ép. **A helyes mérce az
income/cost arány**: mennyi pont jön be a képességfa árához képest.

| stílus | a fa ára | mérföldkő-pont | arány |
|---|---|---|---|
| **Panzer** | 1873 | **2109** | **1,13** |
| Tiki-Taka | 1883 | 2055 | 1,09 |
| Beton | 2338 | 1734 | 0,74 |
| Villám | 2024 | 1405 | 0,69 |
| Harmónia | 2841 | 1868 | 0,66 |
| Bombázók | 2149 | 1202 | 0,56 |
| Sztár | 2296 | 1280 | 0,56 |

A Panzer **korábban 0,53-on állt** — a mezőny alján. Most pontosan ott ül,
ahol a Tiki-Taka: a két „karcsú fa, gazdag mérföldkő" filozófia. Nem
kilógó érték, hanem a másik pólus.

### A szintre gyakorolt hatás

A csapatstílus-szint három csatornából jön: **A** a fára költött pont (400),
**B** a teljessé fejlesztett képességek (350), **C** a mérföldkövek (250). A
C csatorna **arány** (`z.c = 250 × got/max`), tehát a nagyobb tábla egy-egy
mérföldkövet hígít. Ez szándékos és nem baj: a megnőtt pont-bevétel az A és a
B csatornát tölti **gyorsabban**, azok pedig együtt a szint 75%-a. Összességében
a Panzer szintje gyorsabban nő, nem lassabban.

## 5. Mit NEM érint

- Régi mentés: a mérföldkövek **származtatottak** (`d.p()` a mostani
  állapotból számol), tehát egy futó Panzer-karrier a következő pásztázáskor
  visszamenőleg megkapja, amit már teljesített. Semmi nem vész el, és semmit
  nem kell újrajátszani.
- A `maxMatchYc` / `maxSeasonYc` viszont **mostantól** gyűlik: egy régi
  karrier ezekből a nullról indul. Ez a helyes — visszamenőleg nem tudjuk,
  melyik mérkőzésen hány lap esett.
- Más filozófia tábláját egyetlen sor sem érinti (a próba külön méri).
- A **nulladik szinten** (3.9.70) a félelem és a rettenet nulla, tehát a
  `pz_dread` és a `pz_fear` ott jogosan áll; a sárga lapos és a sérüléses
  lépcsők viszont már ott is gyűlnek.
