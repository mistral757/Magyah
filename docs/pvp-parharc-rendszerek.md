# PvP: ami eddig ki volt véve a párharcból (3.9.86)

## A bejelentett kérés

> „PvP-ben az egymás elleni meccsekre legyen jobban kidolgozva a már működő
> rendszerekből az, ami innen jelenleg ki van véve: bizonyos csapatstílus
> képességek, sárga lapok, stb."

## Miért volt bármi kivéve

A párharc **nem külön meccsképernyő**: ugyanaz a `playMatch` futtatja, mint
minden más fordulót — csak a gólok jönnek szkriptből a véletlen helyett. A
szkript egy **közös, seedelt eseménylista** (`h2hSimulate`), és ettől látja a
két játékos bitre ugyanazt a mérkőzést.

Ebből következik a szabály: **ami helyben sorsolódna, az szétvinné a két
képernyőt.** Ezért volt kikapcsolva a párharcban a tizenegyes, a supersub, a
90+ dráma — és teljesen a **sárga lap**. A piros lapnál ugyanez a gond állt
fenn, és a **v2**-es lista már megoldotta: a súlyok és az esély a
pillanatképpel utaznak, a *dobás* pedig a közös szimulációba költözik.

Ez a kör ugyanezt csinálja a maradékkal. A lista verziója **v3**.

## 1. Sárga lap

| | eddig | most |
|---|---|---|
| a lap | nincs | a közös listában (`type:"yellow"`) |
| a súly | — | `yw` a pillanatképben (`mpWireYellowWeights`) |
| az esély | — | `yellowP` a pillanatképben |
| a második sárga | — | kiállítás, a szimuláció mondja ki |

A súly képlete **betűre** a `playMatch`-beli `_yw`: vérmérséklet-alapú
lap-hajlam (`yellowRiskOf`), a fegyelem-skillek szorzója, a szezon-szerep
kockázata. A padon ülő és az eltiltott ember súlya nulla. A pirossal szemben
**nincs** `clutchWallFactor` — a helyi ág sem használja.

**A második sárga kiállítás, és ezt a szimuláció dönti el**, nem a lejátszás:
az emberhátrány a közös gólrátába is beleszól, tehát nem hagyható a
kliensekre. Ilyenkor a lista **mindkét** eseményt viszi — a sárgát *és* a
pirosat (`y2:true`) —, mert egy régebbi kliens a sárga eseményt nem ismeri, a
pirosat viszont igen: így ő is ugyanúgy tízre fogy, csak a lap útját nem
látja.

**Egy kiállítás csapatonként.** A motor egyetlen `redIdx`-et ismer, tehát a
második sárgából született piros nem fér el egy meglévő mellé. Ha az oldal már
tízre fogyott, a sárga sem dördül el többé.

A lefújás utáni könyvelés változatlan úton fut: a lapgyűjtés (3 bajnoki /
2 kupa), az eltiltás, a `seasonYellows`, a karrier-statisztika, a Panzer
`maxMatchYc` mérföldköve és a rettenet-pont (`fearNote("yellow")`) mind
ugyanaz, mint egyjátékosban.

## 2. Megfélemlítés

A `redOppGoalMult` (Panzer) a párharcban **néma volt**: a naplósor megjelent
(„az ellenfél gólesélye X%-kal zuhan a lefújásig"), de a közös lista gólrátáján
semmi nem változott — a helyi `la` újraszámolása a párharcban semmit nem
jelent, mert a gólok a listából jönnek.

Most a pillanatkép viszi (`redOppMult`), és a `recalc()` a **másik** oldal
λ-jára teszi: akit kiállítottak, annak az ellenfele lő kevesebbet. Mérve
(600 mag, mindig kiállított hazai): az ellenfél gólátlaga 1,372 → 0,712 egy
0,5-ös szorzóval, miközben a saját gólrátánk nem mozdul.

## 3. Az emberhátrány tétele oldalanként

A szimuláció eddig fix `SIM.REDMATCH`-csal büntetett. A „tízzel is támadunk"
csúszka (`redmatch` csatorna) ezt enyhíti — a párharcban viszont nem ért
semmit. Most a pillanatkép viszi (`redMatch`), és **oldalanként a sajátja**:
a te csúszkád a te büntetésedet enyhíti, nem a társadét.

## 4. Hangsúly-csúszkák

A csúszkák ([hangsuly-csuszkak.md](hangsuly-csuszkak.md)) a párharcban
egyáltalán nem hatottak. A megoldás csatornánként más, mert a **szűrőik**
mások:

| csatorna | a szűrői | hogyan utazik |
|---|---|---|
| `goalw` / `assistw` | csupa játékos-statikus (poszt, kategória, képesség, életkor, „a legjobb"/„a sztár") | a kezdőrúgáskor kiszámolva, **beleszorozva** a drótra fűzött `gw`/`aw`-be |
| `card` | feltétel nélküli | egy szám, a `redP`-be és a `yellowP`-be |
| `redmatch` | feltétel nélküli | egy szám (`redMatch`, lásd fent) |
| `own` / `opp` | meccs közbeni (perc, vezetés, kapott gól, emberhátrány) | a `roles` mintája: a **kiértékelt szorzó** és a **nyers szűrők** utaznak (`h2hWireDial`), a feltételt a szimuláció dönti el (`h2hDialMul`) |

A `cond` feltételek közül három a kezdő tizenegy ténye (`coldStriker`,
`starOff`, `condOff`) — azokat a pillanatkép építésekor értékeljük ki. A
negyedik (`afterInjury`) meccs közbeni sérülésre vár; **az a jelzés a mai
motorban is csak a lefújás után áll elő** (`_dialInjured` a `fullTime`-ban),
tehát a párharc sem veszít vele semmit. Ez a megfigyelés a meglévő
egyjátékos-motorra is áll — nem ez a kör hozta, és nem is ez javítja.

Az `own` és az `opp` **más oldalé**, épp úgy, mint a helyi motorban: a támadó
fél `own` csúszkája a saját gólrátáját mozdítja, a védekező félé (`opp`) pedig
azt, amennyit kap.

## 5. Osztott dicsőség

A `spreadScoring` (a gól- és gólpassz-sorsolás lapítása) a helyi motorban a
`weightedPick`-en ül — a párharc viszont a pillanatkép kész súlyaiból dolgozik,
oda nem ért el. Most a `h2hWireSnapshot` lapítja a `gw`/`aw` tömböt, a **kapust
kihagyva**, pontosan úgy, ahogy a helyi `spreadSkipGK`.

## A véletlen-folyam a szerződés része

A szimuláció fölötti komment kimondja: *„ha valaha új véletlen-fogyasztó kerül
ide, azt a lista végére kell tenni, különben a régi mentések eredménye
elcsúszna."* Ezért a `rollYellow` **azonnal visszalép**, ha a pillanatképben
nincs `yellowP` — egyetlen `R()` hívás sem történik. Ugyanígy semleges a
`redOppMult`, a `redMatch` és a `dials` hiánya.

Mérve: 200 magon **nulla** eltérés a régi (mezők nélküli) és a semleges
értékekkel kitöltött pillanatkép eseménylistája között.

## A próba

`node tools/pvp-parharc-rendszerek-proba.js` (9019-es port) — 36 állítás,
köztük egy **valódi, végigjátszott párharc**: kézzel írt eseménylistával
(két sárga ugyanannak az embernek, egy harmadik másnak) végigfut a
`playMatch`, és a napló, a lapgyűjtés, az eltiltás és a kiállítás-számláló
mind azt mutatja, amit egyjátékosban mutatna.
