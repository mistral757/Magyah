# ⚔ Párharc: a motor a valódi meccserőkkel + párharc-elemzés (1.0.8.0.00)

## A bejelentés

> „Itt valami elcsúszott a párharccal… Nagyon valószínű, hogy nem ezek voltak
> a tényleges meccs erők. De nem lehet rendes meccs utáni elemzést nézni a
> párharcnál. Ezt javítani kell, hogy ellenőrizhető legyen, mi történt
> ténylegesen. És azt is, ami ezt okozhatta…"
> (Utána a nyertes, hazai oldal edzői elemzése is megérkezett.)

**A te képernyőd** (Juventus 📻, vendég):

- ⚡ 276,6, a társ ⚡ 261,3;
- 0:3, a momentum 23–77% a társnak.

**A társ edzői elemzése a meccs előtt** (hazai):

- a saját ⚡-ja 261,3;
- a Juventusé a kihirdetett lapról **⚡260,5**;
- 58% győzelmi esély neki;
- a saját taktika-tétele **+24,9** (Totális futball 99).

## Mi okozta: három hiba

### 1. A motor a két nézetben nem ugyanazt a különbséget látta (fő ok)

A párharc két nézet gólvárhatóságát átlagolja:

- a hazai támadása a vendég védelme ellen;
- a vendég támadása a hazai védelme ellen.

Mindkét nézet a `matchLambdas`-on megy, ami a CPU-meccsre készült, ahol az
ellenfél egyetlen szám. Ezért **mindkét nézet csak a saját taktika-tételét
látta, az ellenfélét nem.**

A λ exponenciális, és 0,15–4,5 közé van vágva. A késői karrier nagy
taktika-tételeinél (+20–25) mindkét oldal a saját nézetében a plafonhoz ért,
és a két átlag összeért.

Ugyanezekkel a számokkal (⚡276,6 vendég, ⚡261,3 hazai) a gólvárhatóság:

| taktika-tételek | régi motor (te : társ) | javított |
|---|---|---|
| 0 / 0 | 4,50 : 0,22 | 4,50 : 0,22 |
| +10 / +10 | 3,35 : 0,46 | 4,50 : 0,22 |
| +25 / +25 | **2,43 : 2,33** | 4,50 : 0,22 |

Vagyis a ⚡ 15 pontos fölényt mutatott, a motor pedig szinte pénzfeldobást
játszott. **Mostantól mindkét nézet az ellenfél teljes erejével (keret +
taktika) számol**, pontosan azzal a különbséggel, amit a két ⚡ mutat.

### 2. A gólszorzók nem utaztak a pillanatképben

A `buildMatchSnapshot` kiszámolja a csapatstílus gól- és kapottgól-szorzóját
(`ownGoalMult`, `oppGoalMult`). A párharc drót-alakja viszont mezőnként épül,
és ez a két mező kimaradt belőle.

Emiatt két eltérés keletkezett:

- **A ⚡** (`snapMatchStrength`) 1-gyel számolt.
- **A szimuláció** (`matchLambdas` tartalék-ága) a **számoló gép saját
  stílusát** tette rá mindkét csapatra.

Mostantól mindkét szorzó utazik. Ahol régi pillanatképben hiányzik, 1-gyel
számol, nem a számoló gépével.

### 3. Ugyanannak a csapatnak két gépen két ⚡-ja volt

- A **kihirdetett csapatlap** és a meccs előtti **edzői elemzés** a helyi
  becslést (`teamMatchStrength`) vitte. Ez volt a 260,5.
- Az **eredményjelző** a pillanatkép képletét használta. Ez volt a 276,6.

Mostantól a lap, az elemzés saját ⚡-ja és az eredményjelző is a pillanatkép
képletéből számol (`h2hWireSnapshot` → `snapMatchStrength`). Ez ugyanaz a
szám, amivel a motor dolgozik.

## Védőháló: a nézőpont a tárolt adatból

A vizsgálat közben előkerült egy valódi rés. Ez a meccs nem ezen múlt: a két
gép ugyanazt a hazai/vendég kiosztást mutatta.

A lejátszó gép a nézőpontot eddig a pillanatnyi szerepéből és a párharc-nap
paritásából számolta újra. Mostantól:

- **A saját rekesz** az, amelyikben a pillanatkép az **én azonosítómmal**
  (`by`) ül. Ha ez nem dönt, a csapatnév, végső esetben a szerep.
- **A lista hazai oldalát a lista maga mondja meg** (`sim.hf`). Régi listán
  a kezdő esemény csapatneve, aztán a góllövők és lapot kapók névsora dönt.
- **Ha a régi képlet mást mondott volna**, a napló kiírja (🔁), és a szerep
  helyreáll.

## Párharc-elemzés a meccs után

A meccs-magyarázó a párharcban eddig ki volt kapcsolva. Mostantól a közös
listából dolgozik, mindkét gépen ugyanazokból a számokból. Megjelenik a
mérlegben (párharcnál mindig), a statisztikában és egy edzői naplósorban.

Ezt mutatja:

- ⚡ a meccserők szerint, és 🧮 amivel a motor ténylegesen számolt (a
  vödrönkénti közös gólvárhatóság összege, félidőnként is);
- a különbség két tételben: a kezdő szorzók és a meccs menete;
- a szerencse;
- **⚔ A párharc ellenőrzése** fül:
  - a két ⚡ összetétele (keret, taktika, stílus, gól- és védekező szorzó);
  - a nézőpont és annak forrása;
  - a névsor-próba: annak a csapatnak a játékosa lőtte-e a gólt,
    amelyiknél áll;
  - a gólok listája.

A sim `mv:2` jele a javított motort jelöli.

## Kockázat

A közös listát az a gép számolja, amelyik előbb ér oda, a többi a tároltat
játssza le. Ha a két gépen még különböző verzió fut, és **ugyanabban a
pillanatban** számolnak, a két lista eltérhet. A fő HTML „network-first”,
így a frissítés az első online betöltéssel mindkét gépre megérkezik.

## Próba

`tools/parharc-nezopont-1-0-8-0-00-proba.js`:

- **Nézőpont:** helyes és rossz szerep; régi lista csapatnévvel és
  névsorral; a valódi `h2hStart` rossz szereppel.
- **Valódi párharc** (`playMatch`): az eredmény a lista szerinti, és
  megjelenik az elemzés, a névsor-próba és a napló sora.
- **Motor:** ⚡276,6 a ⚡261,3 ellen, +25-ös taktikákkal is ≈4,5 : 0,2.
- **Drót:** a gólszorzók utaznak, és a csapatlap ⚡-ja = a pillanatkép ⚡-ja.
- Nincs oldalhiba.
