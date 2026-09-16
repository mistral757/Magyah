# Panzer: a lap épít, nem rombol (3.9.85)

## A bejelentett ellentmondás

> „Azzal is segítsük már a panzerkampfwagent, hogy a kiállítások, sárgalapok
> ellenkező módon hassanak a formára is (és ezt is a fordított jellem képesség
> erősítse). Ne az legyen már, hogy arra hajtunk, hogy folyton sárga és piros
> lap legyen, de ez elcseszi a formánkat full…"

A panasz pontos volt. A Panzer **egész gazdasága a lapokból él**: a rettenet-pont
(`fearNote("yellow")`, `fearNote("red")`), és a stílus mérföldkövei is lapot
kérnek — `pz_ycall` (mindenki kapjon sárgát egy szezonban), `pz_ycmatch` (négy
sárga egy meccsen), `pz_ycseason`, `pz_redwinN` (nyerj emberhátrányban).

Közben viszont **ugyanaz a lap a másik oldalon büntetett**, és a büntetés a
FORMÁBA futott be. A játékos tehát pontosan azért lett rosszabb, amiért a
filozófiája szerint jutalmat kapott.

## Hol ült a büntetés

Három helyen, és mind a három a formába torkollik — a forma fő tápláléka a
legutóbbi 7-8 meccs értékelés-átlaga (`pformRecent`, lásd
[forma-rendszer.md](forma-rendszer.md)):

| # | Hely | Mit csinált |
|---|------|-------------|
| 1 | `mstatRate` → `parts.red` | −1,4 … −3,0 csillag a kiállítás perce szerint |
| 2 | `mstatUnratable` | a 25. perc (`MSTAT_EARLY_RED`) előtti piros lapnál **egyáltalán nem volt értékelés** — a meccs a formából is kiesett |
| 3 | `applyDisciplineDip` → `S.discWatch` | −2 Rating egy-két mérkőzésre (`pOvr`) |

**A sárga lapnak viszont semmilyen formahatása nem volt** — se rossz, se jó.
Nála tehát nincs mit „megfordítani": a Panzernél **nulláról indul egy pozitív
tétel**. Ezt külön kimondjuk, mert a kérés „ellenkező módon"-t mondott, és a
két eset különbözik.

## Mi lett belőle

Panzer-filozófiával (elsődleges **vagy** másodlagos slotban) mind a három hely
előjelet vált, és jön a negyedik, új tétel:

| | Máshol | Panzernél |
|---|---|---|
| piros lap, csillagtétel | −1,4 … −3,0 | **+1,11 … +2,14** |
| korai (25. perc előtti) piros | minősíthetetlen est | **értékelhető marad** |
| fegyelmi következmény | −2 Rating 1-2 meccsre | **+2 Rating 1-2 meccsre** |
| sárga lap | *nincs hatás* | **+0,30 / darab** |

A piros lap görbéje **tükör**: ahogy a büntetés a koraiért volt a legnagyobb
(nyolcvan perc emberhátrány), úgy a hozam is a koraiért a legnagyobb — a
Panzernél éppen az a teljesítmény.

```
percenkénti csillagtétel egy piros lapért
  perc:      5      24      45      80      89
  máshol  −2,911  −2,573  −2,200  −1,578  −1,418
  Panzer  +2,139  +1,907  +1,650  +1,222  +1,112
```

## A Fordított jellem feszíti

Ahogy a kérés kérte, ugyanazon a képességen (`panzer` / `abs_jellem`,
`absTrait` 1-3) — de **külön szorzótáblán**, mert a jellem és a lap két
különböző mérleg, és külön kell hangolhatónak lenniük:

| Fordított jellem | szorzó | piros (45. perc) | sárga / db | fegyelmi lendület |
|---|---|---|---|---|
| nincs megvéve | ×1,00 | +1,65 | +0,30 | +2 |
| 1. szint | ×1,35 | +2,23 | +0,41 | +3 |
| 2. szint | ×1,70 | +2,81 | +0,51 | +3 |
| 3. szint | ×2,10 | +3,47 | +0,63 | +4 |

## Mi NEM fordul meg

* **Az öngólból eredő fegyelmi visszaesés.** Az is ugyanezen az egy
  függvényen (`applyDisciplineDip`) ment be, de az **nem lap** — a saját
  kapuba lőtt labda Panzerrel sem teljesítmény. Ezért kapott a függvény egy
  `lap` paramétert: csak a két kiállítás-ág adja át igazként.
* **Az eltiltás.** A piros lap utáni egy meccs kihagyása változatlan: az
  menetrend kérdése, nem formáé.
* **Minden más filozófia.** A `pzCardsBuild()` kapu Panzer nélkül hamis, tehát
  a rendszer **betűre a régi** — ezt a próba külön méri.

## Hol van a kódban

| Elem | Hol |
|---|---|
| `PZ_CARD_RED` / `PZ_CARD_YEL` / `PZ_CARD_OVR` / `PZ_CARD_LIFT` | a `traitFlip` utáni blokk |
| `pzCardsBuild()` / `pzCardLift()` / `pzDiscBoost()` | ugyanott |
| a csillagtételek | `mstatRate`, a `parts.red` sor alatt |
| a minősíthetetlenség kapuja | `mstatUnratable` |
| a fegyelmi ág | `applyDisciplineDip(name, lap)` a `fullTime`-ban |
| a meccs sárga lapjai a sorban | `_rowOf` → `yc` |

A fegyelmi **lendület** szándékosan a meglévő, mentett `nextMatchOvr`
csatornán megy, nem új mezőben: így a visszaszámlálás, a mentés és a régi
mentések betöltése is változatlan marad. Régi mentésben a sor `yc` mezője
hiányzik — ott nulla, tehát a visszamenőleges viselkedés is változatlan.

## A próba

`node tools/panzer-lap-proba.js` (9017-es port) — 24 állítás: a konstansok, a
lépcső, a másodlagos slot, a tükrözött görbe, a sárga tétel nullától, a
minősíthetetlenség kapuja, a kész értékelés iránya (ez megy a formába), a
fegyelmi ág lap- és öngól-esete, és hogy lap nélkül a két filozófia
értékelése azonos.
