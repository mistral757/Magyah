# 3.9.224 — 🟥 A kiállítás reálisabban hat, a saját csapat ritkábban kap pirosat

> A társ: „Ami még szerintem nem realisztikus, az a piros lap esély, és a meccs
> további kimenetele. […] túl gyakori […] és egyáltalán nem ront le."
> A fejlesztő terve: „a rating csökkenést akkor egy kicsit megemeljük
> (tényleg csak kicsit!), a kiállítás utáni szakaszban megnöveljük a random
> események valószínűségét és az ellenfél gólesélyét, különösen a kiállítás
> utáni 30. percről (onnantól már elfárad a csapat), majd pedig a 85.
> perctől. […] minden sárga és piroslap esély kap szerintem egy -10%ot"
> A mérés után: „Mehet, a saját csapat kapjon kevesebb pirosat, annyi még,
> hogy emiatt a panzer lapesélyei jelentősebben növekedjenek a
> képességekkel, mint eddig."

## A szabályok

| | előtte | most |
|---|---|---|
| a kiállítás ára | 2,5 meccserő | **3,0** |
| a tízfős oldal ellen a gólvárhatóság | — | a kiállítás után 30 perccel **+15%**, a 85. perctől **+25%** |
| különleges esemény kiállítás után (11-es, öngól, VAR, verekedés) | ×1 | **×2** |
| minden sárga és piros lap esélye | ×1 | **×0,9** |
| a saját csapat közvetlen pirosa | ×1 | **×0,6** |
| aki már kapott sárgát, a további lap súlya | ×1 | **×0,4** (óvatosabb) |
| Panzer · Vadhajtások (piroslap-esély) | +50 / +100 / +160% | **+100 / +200 / +320%** |

A szabályok a gép elleni meccsen és a párharcban is élnek:

* a pillanatkép a kiállítás árát és a lapok esélyét viszi;
* a `h2hSimulate` a tízfős oldalt fárasztja;
* a sárgás játékos óvatosabb.

A kapcsoló a `KIALL_TERV` (a javaslat: `KIALL_TERV_JAVASLAT`), a saját
csapat szabálya a `SAJAT_PIROS`.

## Mérve — a valódi motoron

A mérő a `tools/meccsmotor/kiallitas-terv.js`. Minden sor
győzelem / döntetlen / vereség százalékot mutat.

### A saját piros túl gyakori volt — miért?

50-50 meccsek, 1200 mérkőzés soronként:

| | saját kiállításos meccs | az ellenfélé | a saját piros forrása / 100 meccs |
|---|---|---|---|
| előtte | **12,4%** | 6,2% | közvetlen ~4–6, **második sárga ~6–7** |
| most | **5,3–6,9%** | 4,8–5,8% | közvetlen ~3, második sárga ~3 |

A lap a lobbanékonyakra koncentrálódik. Aki már kapott egy sárgát,
eddig ugyanakkora eséllyel kapta a másodikat, ezért a saját csapat
kétszer annyi kiállítást kapott, mint az ellenfél.

### Kiállítás a 30. percben

Különbségenként 300–400 meccs.

| ⚡ | előtte | a terv | a terv + a ritkább piros (most) |
|---|---|---|---|
| 0 | 30 / 26 / 44 | 26 / 24 / 50 | 26 / 24 / 50 |
| +3 | 56 / 26 / 19 | 55 / 24 / 21 | 49 / 24 / 27 |
| +5 | 72 / 19 / 9 | 73 / 17 / 10 | 71 / 16 / 13 |

A tízfős csapat a kiállítás után kb. **1,45×** helyett **1,7×** annyi gólt
kap, mint előtte. Ez a valós futballban mért sávban van. A „−8 meccserő”
viszont túlzás volna: egy +5-ös csapat is esélytelenné válna egyetlen
kiállítástól.

### Kiállítás a 60. percben

Különbségenként 300 meccs.

| ⚡ | előtte | a terv |
|---|---|---|
| 0 | 38 / 24 / 38 | 40 / 21 / 39 |
| +3 | 66 / 20 / 14 | 61 / 17 / 22 |
| +5 | 79 / 14 / 7 | 79 / 13 / 8 |

A mérési hiba kb. ±2,5 százalékpont.

## Próba

* `tools/kiallitas-terv-proba.js`: 5 állítás.
* Mérő: `TERV=1 MODE=termeszetes|piros RED=30 DS=0,3,5 N=… node tools/meccsmotor/kiallitas-terv.js`.
