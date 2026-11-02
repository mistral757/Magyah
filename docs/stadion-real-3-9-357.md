# 3.9.357 — reálisabb lelátó: törzsszurkolók és hiányfelár

> „Te mit gondolsz? Szerintem is úgy van ez, hogy reálisabbá kéne tenni.
> Azért 120ezer néző egy meccsen, az a top top csapatok sajátja a legjobb
> formájuk idejen. Szóval ezt kicsit tegyük realisztikusabbá úgy hogy a
> budzsét nem vágjuk még egyúttal túlzottan. Szóval ne a büdzsé hanem a
> nézőszám, stadion mérete legyen kisebb. Lassabb, fokozatosabb. A pénz
> közben azért jöjjön."

## Mi volt a baj

* **A tábor gyorsan nőtt:** a növekedés a liga-sávból jön, és a piramis
  felskálázott világában már a D4–D3 is a legfelső, 150 000-es sávba esik.
  Ott egy győzelem +900, egy bajnoki cím +75 000 szurkolót hozott.
* **A kereslet a teljes tábor 30–100%-a volt.** Ezért a második idényre egy
  120 ezres stadion is rendre megtelt. A szimulációban a 150 000-es sávban a
  meccsek 97%-a telt házas volt.

## A megoldás: a tábor marad, kevesebben járnak ki

**A tábor** (`fanBase`) maga **érintetlen**: ez a gazdaság, a bér, a merch, a
kihívások és a hírnév közös bázisa. Ha ezt lassítanánk, az egész gazdaság
léptéke együtt zsugorodna, és az átigazolások, a boostok viszonylag
drágulnának.

### Törzsszurkolók

**A táborból azok, akik meccsre járnak** (`lelatoTorzs`):

| A tábor | Ebből törzsszurkoló |
|---|---|
| 8 000 | 4 800 |
| 50 000 | 30 000 |
| 100 000 | 45 000 |
| 300 000 | 74 000 |
| 700 000 | 109 000 |

**A görbe:**
* 60 000-es táborig a tábor 60%-a;
* fölötte egyre lassabban nő: 36 000 × (tábor / 60 000)^0,45.

A 100 ezres lelátó így a top klubok sajátja, és csak fokozatosan érhető el.

### Kereslet

* **A kereslet a törzs 55–100%-a:** 0,55 + 0,30 × forma + 0,15 × lendület.
* **Sok győzelem és sok új szurkoló:** szinte mind jön.
* **Vereségsorozat:** majdnem a fele otthon marad.
* **A nézőszám** a kereslet és a férőhely kisebbike, mint eddig.

### Hiányfelár (a pénz marad)

**A nagy tábor kevés helyért versenyez, ezért a jegy drágább.** A
jegybevétel szorzója: min(1,8; (tábor / törzs)^0,6).

| A tábor | Hiányfelár |
|---|---|
| 50 000 | ×1,36 |
| 100 000 | ×1,61 |
| 300 000 fölött | ×1,8 (a felső határ) |

* **A stadionbővítés ára** a felárral számol, így a megtérülése változatlan.
* **A stadion-doboz** kiírja a törzset, a tábort és a felárat.
* **A súgó és az Infópult** szövege az új szabályt mondja.

## Mérve

**Szimuláció**, 6 idény, négy liga-sáv (12 / 30 / 50 / 150 ezer); a régi =
100%.

| | Régen | Most |
|---|---|---|
| Telt ház (a hazai meccsek aránya) | 150 ezres sávban 97% | 12–18% |
| Átlag néző a 6. idényben, 150 ezres sáv | 120 000 (a 2. idénytől) | ~89 000 |
| Átlag néző a 6. idényben, 50 ezres sáv | 120 000 | ~61 000 |
| A lelátó pénze | 100% | 81–115%, átlag ~93% |

**Egy futó, 300 ezres táború karrier** (120 ezres stadion, 4. merch-szint):
- a néző 120 000-ről **~66 000**-re esik;
- a meccsenkénti lelátó-bevétel a régi **99%-a**.

## Futó karrierek

**Azonnal érvényes**, mert a tábor és a gazdaság nem változik, csak a lelátó.
- A nagy stadion ezentúl ritkán telik meg.
- A fenntartása a régi marad, ezért egy túl nagyra bővített stadion
  enyhén drágább lett.

## Próba

**`tools/stadion-real-3-9-357-proba.js`** (10 állítás):
* a törzs görbéje;
* a kereslet 55–100%;
* a hiányfelár;
* a tábor növekedése változatlan;
* a pénz korán és nagy táborral;
* a stadion-doboz felirata.

**`tools/stadion-merch-3-9-264-proba.js`:** a kereslet két állítása a
törzshöz mér.
