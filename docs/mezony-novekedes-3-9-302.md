# 📈 A mezőny idény közbeni erősödése — mért, pénzmag- és fokozat-szintezett görbe (3.9.302)

## A kérés

> „Jelentősen meg kell növelni a divíziók nehézségi szintjén belül az ellenfél
> fejlődési tempóját. 2-3. Szezontól figyelni kell arra, hogy a játékos
> számára elérhető pénzmag mekkora tempójú fejlődést tesz lehetővé. Nem az
> aktuálisban, hanem úgy overall. És aszerint kell beállítani egy szintezős
> szezononkénti erősödést. Hogy legyen izgalom a 4. Szezon után is. […] 8.5-ig
> érjen a teteje annak, amilyen fejlődésre most az eddigi mérések alapján mi
> képesek voltunk. Aztán 9.1-től már jöjjön az, ami fölöttünk jár."

## A mérés

**Forrás:** `magyah-meres-2026-10-25.json`.

| idény | a csapatod ⚡-ja idény közben (medián) | példák |
|---|---|---|
| 1. | +17% | |
| 2. | +25% | Vin +61%, Vajas Kifli +59% |
| 3. | +36% | Solos +42%, Le Mans +48% |
| 4. | +41% (átlag 48%) | Solos 268 → 435, Le Mans 220 → 306 |

**A mezőny eddig.** Idény közben csak az éves alapütemmel (~4–7 pont) és a
3.9.254 szándékosan aláló ráadásával (legfeljebb +10) nőtt. A szezon
mezőnyszintje a kezdéstől a végéig ugyanaz volt. Ezért húzott el egy kiépült
keret, egyetlen öreg-boosttal, a 4. idénytől.

## A szabály

A mezőny idény közbeni **teljes** erősödése:

```
E = szint × R(idény) × P(pénzmag) × T(fokozat) × K(kezdet) − az éves alapütem
```

| tag | érték |
|---|---|
| **R** — a mért görbe | 0,09 + 0,085 × idény, legfeljebb 0,55 (1.: 17,5% · 2.: 26% · 3.: 34,5% · 4.: 43% · 5.: 51,5%) |
| **P** — a pénzmag | a PÉNZ-tempó (a karrier egész gazdasága, nem a pillanatnyi büdzsé) a mért karrierek Gleccser-pénzéhez mérve: (szorzó / 0,45)^0,6 — Gleccser 1,00 · Csiga 1,14 · Komótos 1,28 · Alap 1,41 |
| **T** — a szintezés | a fokozat nf.s alapján: 1.1 → 0,30 … lineárisan … **8.5 → 1,00**; 8.5 és 9.1 között 1,00 → 1,10; **9.1-től 1,10 + 0,25 / fokozat** (10.0 → 1,33, 10.5 → 1,45) |
| **K** — a kezdet | 1. idény 0 (9.1-től 0,5) · 2. idény 0,75 · 3.-tól 1 |

**Hogyan gyűlik.** Az E fordulónként egyenletesen gyűlik (`nfGyorsTick`), és a
mezőny erejébe a `pyrGrowNow` adja hozzá. Így minden ugyanazt a mezőnyt látja:

* a meccs;
* az eredményjelző;
* a létra és a ⚡;
* a nehézség-tanácsadó.

**A beragadás-őr marad.** Abban a fordulóban, amikor a ⚡ előnyöd a fokozatod
célrése alatt van, nincs gyorsulás. A mezőny a jókat követi, nem a
lemaradókat taszítja tovább.

## Visszamérve

A mezőny új növekedése a csapat tényleges idényen belüli növekedéséhez mérve, a
mért idényeken:

| karrier | fokozat | idény | a mezőny új növekedése | a csapat növekedése | arány |
|---|---|---|---|---|---|
| Ráfingó | 8.2 | 3. | +33 | +33 | 1,01 |
| Ráfingó | 8.2 | 4. | +54 | +62 | 0,88 |
| Le Mans | 7.1 | 4. | +78 | +86 | 0,91 |
| Solos | 7.5 | 4. | +85 | +167 | 0,51 |

A medián idényt a mezőny lekíséri, 9.1-től elé is megy. A kiugró idény (Solos
4.) fölött marad mozgástér.

## Futó karrierek

A **futó karrierek** a maguk szerződésén maradnak: az `S.pyr.gyv` jelző nélkül
a 3.9.254 görbe él. Ugyanez az elv érvényes a fokozat-létránál
(`PYR_SPEEDS_V1`). Az új görbe a 3.9.302 után **indított** karrierekre vonatkozik.

## Próba

`tools/mezony-novekedes-3-9-302-proba.js`:

* az új karrier `gyv = 2`;
* a szintezés monoton, a kulcspontokkal;
* 8.5-ön az 1. idény 0, a 4. idény a szint ~40%-a;
* 9.1-től már az 1. idényben is nő, és többet, mint 8.5-ön;
* gyorsabb pénz-tempó → gyorsabb mezőny;
* a régi karrier a régi görbén;
* 30 forduló alatt a teljes E gyűlik, a célrés alatt nem;
* nincs oldalhiba.
