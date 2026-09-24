# Csupa ék — és a 4-2-4 kinyitása a Bombázóknál (3.9.136)

> „A 4-2-4 kinyitás képességét a bombázók csapatstílushoz tegyük át.
> És legyen egy új képesség a bombázóknál, ami lvl1 lehetővé teszi, hogy 3
> támadóból 2 középcsatár legyen, 4-ből pedig 3, lvl2 3-ból 3 és 4-ből 4, lvl3
> kinyílik az ultra csatár pozíció: 1 csatárod lehet ilyen pozícióban, gólesély
> jelentősen nő neki, de a csapat elleni gólesély is nő, minél magasabb annak a
> játékosnak a védekezési attribútuma (arányaiban a többiekhez képest) annál
> jobban, hiszen kikerül a védelemből az ő száma. Max +10% min. +3%"

## 1. Az „Olcsó totális futball” költözése

A képesség (−20 / −35 / −50% a 4-2-4 felállás árán) a Villámtól a
**Bombázókhoz** került, ugyanazon a II. sávon és áron. A négy támadós alak a
gólzápor filozófiájának saját rendszere.

**A régi mentések:** aki a Villámban már megvette, annak a szintjei ott
hatástalanná válnának. Betöltéskor ezért a `styleTraitMoveMigrate` egyszer
lefut:

- a rá költött csapatstílus-pontot visszatéríti a közös tárcába
  (1. szint 26, 2. szint +45, 3. szint +70);
- a naplóban szól;
- a jelzője a mentés része.

Ha a klub másik filozófiája a Bombázók, ott a képesség újra megvehető.

## 2. Csupa ék (új, III. sáv)

### 1–2. szint: középcsatár a szélen

A támadósor minden középcsatár-hely és minden **támadó** szélső hely. A
középpályás szélsők (4-4-2, 3-5-2) nem tartoznak ide.

A támadó szélső helyek megbízásai közé bekerül a **középcsatár**:

| | 3 támadó (4-3-3, 3-4-3) | 4 támadó (4-2-4) |
|---|---|---|
| képesség nélkül | 1 középcsatár | 2 |
| 1. szint | 2 | 3 |
| 2. szint | 3 | 4 |

- A korlátot a megbízások érvényesítése tartja (`wingCsAccepted`). Ha a
  képesség elvész, a szélső hely magától visszaáll szélsőnek.
- A választó az opciót a korlátnál zárva mutatja, és megmondja, miért.
- A pályaképen a középre húzott szélső beljebb, a kapu elé kerül.
- A hatás maga a poszt: a középcsatár gólsúlya 5,0 a támadó szélső 3,0-ja
  helyett, a szélesség ezen az oldalon elvész.

### 3. szint: ⚡ ULTRA CSATÁR

**Egy** középcsatár-hely kaphatja meg, a választóban egy kapcsolóval. Egy
másik helyen bekapcsolva az előző kikapcsol.

A hely jelzője `S.ultraSlot = {f, i}`, **nem** új posztkód. Az illeszkedés, a
Rating és minden posztos tábla CS marad. Aki cserével a helyére áll, ultraként
játszik tovább.

- **Gólesély:** a gólszerző-választásban a súlya **×1,8** (`ULTRA_GOALW`).
  Mind a négy helyen hat: a meccs rendes góljain, a 90+ perces drámai
  gólokon, és a PvP-pillanatkép két súlyán (a kezdő tizenegy és a
  csereterv beállója).
- **Ára:** az ellenfél gólesélye **+3 … +10%**. A mérce az ő Védekezése a
  pályán lévő többi mezőnyjátékos átlagához mérve:

  | Védekezés-arány | ár |
  |---|---|
  | ≤ 0,5× | +3% |
  | 1,0× | +6,5% |
  | ≥ 1,5× | +10% |

  Minél jobb védekező, annál többet hiányzik hátulról. Egy tipikus csatár (a
  csapat 60–70%-a) +4…+5%, egy visszahúzott védő ultraként a sáv teteje.
- **Hol él az ár:** az alakzat árában (`teamShape` → `shapeOppMult`), ugyanott,
  ahol a szélesítés ára. A motor ebből számol, és a HUB kiírja.
- **Nem enyhíti** a Villám „Szárnyakon kifutva” képessége: ez nem a szélesség
  ára, hanem egy ember védekezéséé.
- **Mikor kapcsol ki:** a 3. szint nélkül, más felállásban, vagy ha a hely nem
  középcsatár (pl. árnyékékre állítottad). A jelző megmarad, egy visszaváltás
  visszahozza.

**Mérve valódi meccseken** (40 + 40 mérkőzés, ugyanaz a csatár):

| | az ő gólaránya |
|---|---|
| ultra nélkül | 17% (19 / 112) |
| ultraként | 29% (38 / 130) |

Ez megfelel a ×1,8-as súlynak (várható ≈ 27%).

## Egy tervezési döntés, amit érdemes tudni

A kérés az ultra csatár **saját** gólesélyéről szól („gólesély jelentősen nő
neki”). Ezért a csapat teljes gólvárhatósága NEM nő, csak az arány tolódik
felé. A csere tehát:

- **nyer:** több gól egy embertől, ami a Bombázók egyéni gólrekord-, mesterhármas-
  és gólkirály-mérföldköveinek jó;
- **fizet:** több kapott gól.

Ha a csapat gólvárhatóságára is kellene egy kis ráadás (pl. +5%), az egy sor.

## Próba

`tools/csupa-ek-proba.js` (26 állítás + egy tájékoztató mérés, ~30 mp):

- a költözés és a visszatérítés;
- a 4-3-3 és a 4-2-4 korlátjai szintenként;
- a visszaállás a képesség nélkül;
- az ultra: szint, gólsúly, a +3 / +10% sáv két vége, az alakzat szorzója, a
  választó;
- **valódi meccsen** a motor csak az ultra helyre ad ×1,8-at.

A gólarányt tájékoztatásként írja ki. 14 meccsnyi mintán ugyanaz a csatár
ultra nélkül 21% és 44% között szórt, erre nem lehet bukó állítást építeni.
