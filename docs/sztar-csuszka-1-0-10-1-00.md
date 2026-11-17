# ⭐ 1.0.10.1.00 — A „Sztárom a párom” csúszkái a meccsre is hatnak

> **JÓVÁHAGYÁS:** az audit ([audit-felulet-mechanika-1-0-9-8.md](audit-felulet-mechanika-1-0-9-8.md))
> D tétele; a felhasználó: „Azok jöhetnek.”

## A gond, mérve

A Sztár öt csúszkája hírnévre, bérre, formára, gólsúlyra, sérülésre és
fejlődésre hatott — a csapat gólvárhatóságára feltétel nélkül semmi. A legjobb
hármasa a 20. szinten **0 ⚡**-et ért, miközben a Betoné 2,5-et, a
Gegenpressingé 0,9-et. Egyetlen gólvárhatóság-tétele volt, az is büntetés
(„ha a sztár nincs a pályán”).

## A szabály — csak az új karrierekben

A csúszkák 2. szerződésében (`S.dialV ≥ 2`, lásd
[csuszka-plafon-1-0-10-0-00.md](csuszka-plafon-1-0-10-0-00.md)) két pólus kap
meccs-hasznot, mindkettő a filozófia lényegéhez kötve — **amíg a sztár a
pályán van**:

| csúszka · pólus | új haszon | a régi ára (változatlan) |
|---|---|---|
| Kiszolgálás ▶ **Minden labda hozzá** | + a csapat gólvárhatósága, a teljes haszon-százalékkal | a többiek gólsúlya; és ha a sztár NINCS a pályán, a gólvárhatóság esik |
| Terhelés-menedzsment ▶ **Végigjátssza** | + a gólvárhatóság a 70. perctől, feleakkora | sérülés-esély, a sztár formaingadozása |

Így a „mindent rá építek” döntésnek tétje van mindkét irányban: vele többet
lősz, nélküle (sérülés, eltiltás, pihentetés) kevesebbet.

## Mérve (a próba kiírja)

A legjobb Sztár-készlet ≈ ⚡-egyenértéke az új szabállyal:

| szint | 1 | 5 | 10 | 15 | 20 |
|---|--:|--:|--:|--:|--:|
| régi | 0 | 0 | 0 | 0 | 0 |
| **új** | 0,11 | 0,28 | 0,49 | 0,68 | **0,87** |

A 20. szinten a saját gólvárhatóság ×1,206 a sztárral, ×0,95 nélküle. Ez a
szerényebb stílusok szintje (Gegenpressing 0,9 · Harmónia 1,0), szándékosan
nem a Betoné: a Sztár csúszkái mellette a hírnévre és a bérre is hatnak.

## Kire vonatkozik

- **Futó karrierek:** semmi nem változik — a `v2` jelű tételeket a `dialEach`
  kihagyja, a panel szövege sem ígéri.
- **Párharc:** a tétel a többi csúszka-tétellel együtt utazik a pillanatképben
  (`h2hWireDial`; a feltétel a kezdőrúgáskor dől el, mint a `starOff`-nál). A
  forma nem változott — egy `{f:1,2055}` tétel, amit a közös szimuláció eddig
  is értett.
- **A plafon** (±40%) erre is vonatkozik.

## Kód és próba

`STYLE_DIALS.sztar` (két `v2` tétel, `pro2` szöveg) · `dialCond("starOn")` ·
a `dialEach` `v2`-szűrője · `dialPoleTxt`.

`node tools/sztar-csuszka-1-0-10-1-00-proba.js` — 9 állítás.
