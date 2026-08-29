# Büdzsé-érzékeny árak — boost, poszt-tanítás, stílus-kategóriák

*(3.8.18. Érintett kód: `BUDGET_PREMIUM_WEIGHT` / `clubBudgetScale()`,
`BOOST_UNIT_SEASONS` / `boostUnitBase()`, `boostDiscountMult()` (a kezdő
idények kedvezménye megszűnt), `POS_LEARN_SHARE` / `posLearnCost()` /
`posLearnTypicalCost()`, `MS_CAT_PRICE_MULT` / `msCatPrice()`, valamint a
Boost-központ fejléce és a `#hubBoostBtn` felirata.)*

---

## 1. A bejelentés

> „Tegyünk aktuális (átlag) büdzsé-érzékeny szorzókat a boostok alapáraira,
> hogy még reálisabb legyen a megvásárlásuk. Első pár szezonban érnének a
> legtöbbet, de akkor jelenleg irreálisan drágák. […] Ugyanígy lehetne sokkal
> átlag-büdzsé-érzékenyebb a poszt-tanítás ára, ami jelenleg rögzített 20 Mrd
> körül van, valamint a stílusmérföldkövek feloldási árai."

Megadott mérce (hagyományos mód): a vagyon az első három idény végén nagyjából
**20 / 35 / 40 Mrd Ft**, és ebből egy ifi-boost **8 / 14 / 18 Mrd** volna a
helyes ár.

---

## 2. Mi volt a baj — nem a szám, hanem a horgony

A boost-egység a keret **legdrágább emberének vételárához** volt kötve, egy
**18 000 pontos (36 Mrd Ft) padlóval**:

```js
return Math.max(18000,topBuy)*1.5*youthBoostScale()*BOOST_PRICE_MULT;
```

A karrier első négy-öt idényében a legdrágább embered ennél olcsóbb, tehát
**mindig a padló döntött**. Az ifi-boost ára ezért ugyanaz a 35,2 Mrd volt a
3. és a 6. idényben is — miközben a klub éves kerete 17, illetve 45 Mrd. A
kezdő idények −50%/−33%-os kedvezménye ezt foltozta, de 17,6 Mrd egy 7
Mrd-os éves keret mellett még mindig két és félszeres túlár, ráadásul a 3.
idényre lejárt, amikor a klub még mindig szegény volt.

A **poszt-tanítás** fix 5000–10 000 pontos (10–20 Mrd) sávban ült, a játékos
Ratingjéből — és mivel a sáv 100-as Ratingnél betelik, a piramisban és
Infinityben tényleg **rögzített 20 Mrd** volt, örökre.

A **stílus-kategóriák** ára szerkezetileg jó volt (a működési kerethez mérve),
csak a szintje magas: hat kategória ≈ öt idénynyi keret.

---

## 3. A mérce: `clubBudgetScale()`

```js
const BUDGET_PREMIUM_WEIGHT=0.5;
clubBudgetScale() = seasonBudget.core + 0,5 × seasonBudget.premium
```

* a **működési keret** (`core`) a gerinc: a csapaterőből és a mezőnyből jön, és
  magától nő a karrierrel;
* a **presztízs-prémium fele**: ez az, ami „kilő", amikor megjön az első
  kupagyőzelem. A fele, és nem az egésze — a trófea ne drágítsa vissza
  teljesen saját magát, de a fejlesztések ára se maradjon le a valódi
  gazdagságtól.

**Miért nem a halmozott egyenleg (`S.transferBudget`)?** Mert azt a felhasználó
mozgatja: vásárlás után minden fejlesztés olcsóbb, spórolás után drágább lenne
— vagyis a takarékosságot büntetné, és az árat ki lehetne üríteni. Az éves
bevétel a klub **szerkezeti** léptéke: nem manipulálható, és pontosan azt méri,
„mekkora klub vagyok most".

A bér, a mérföldkő-jutalom és a stílus-kategóriák továbbra is **tisztán** a
működési rétegen ülnek — ott a régi szabály (a trófea nem drágít) érvényben
marad.

---

## 4. A három ár

| | képlet | mérték |
|---|---|---|
| ⚡ **boost-egység** (ifi-boost) | `BOOST_UNIT_SEASONS × clubBudgetScale()` | **1,10 idénynyi** lépték |
| 🎯 **poszt-tanítás** | `POS_LEARN_SHARE × clubBudgetScale()` | **0,20–0,40** idénynyi (a Rating dönti el, hol a sávban) |
| 🧩 **stílus-kategória** | `core × pct × MS_CAT_PRICE_MULT × fizetés` | a régi ár **0,55-szerese** |

A poszt-tanítás Rating-függése is **a mezőnyhöz mért** lett
(`(r − (mezőny − 10)) / 40`), nem egy 60–100-as abszolút sáv: így a sáv a
piramis és az Infinity minden szintjén ugyanazt jelenti — a mezőnyöd alatt álló
ember betanítása olcsó, a mezőny fölé nőtt sztáré a sáv teteje.

### A kezdő idények kedvezménye megszűnt

A −50% / −33% pontosan azt a bajt foltozta, amit az új horgony a gyökerénél
old meg. Az 1. idényben mostantól **azért** olcsó a boost, mert a klub kicsi,
nem azért, mert kedvezményes hét van — és ez a 3. idényben sem „jár le". A
**kihívás-jutalom** kedvezménye (fokozatonként −10%, plafon −50%) változatlanul
él: az kiérdemelt, nem időszakos.

---

## 5. Mérve

A számok a **valódi függvényekkel** készültek (a képletek kivágva az
`index.html`-ből, a levelek — csapaterő, mezőny, szurkolótábor, vitrin —
forgatókönyvből). Minden érték Mrd Ft.

### Hagyományos mód (piramis), D6-ból indulva, idényenként feljutással

| idény | csapaterő | működési keret | prémium | **lépték** | ifi-boost régi → **új** | poszt-tanítás régi → **új** | stíluskat. (0,7) régi → **új** |
|---|---|---|---|---|---|---|---|
| 1. | 73 | 6,9 | 0,8 | 7,3 | 17,6 → **8,0** | 15,0 → **2,0** | 4,8 → **2,6** |
| 2. | 80 | 10,9 | 1,5 | 11,7 | 23,5 → **12,8** | 16,0 → **3,6** | 7,6 → **4,2** |
| 3. | 87 | 16,7 | 2,8 | 18,1 | 35,1 → **19,8** | 18,0 → **5,8** | 11,7 → **6,4** |
| 4. | 94 | 23,4 | 5,6 | 26,2 | 35,1 → **28,8** | 20,0 → **9,0** | 16,4 → **9,0** |
| 6. | 108 | 45,1 | 26,8 | 58,5 | 35,1 → **64,4** | 20,0 → **22,6** | 31,6 → **17,4** |
| 8. | 122 | 93,2 | 126,1 | 156,3 | 35,1 → **171,8** | 20,0 → **62,6** | 65,3 → **35,9** |

**A kért görbe:** 8 / 14 / 18 → **a mért: 8,0 / 12,8 / 19,8.** A 6. idényben
lép be a vitrin (bajnoki címek + EL-győzelem): onnantól a lépték a prémium
felén keresztül követi a kilövő büdzsét — pontosan az a pont, amit a
bejelentés kért.

### Dinamikus mód, 84-es mezőnyről, gyors csúcsra járatással

| idény | csapaterő | működési keret | prémium | **lépték** | ifi-boost régi → **új** | poszt-tanítás régi → **új** |
|---|---|---|---|---|---|---|
| 1. | 84 | 14,0 | 0,8 | 14,4 | 17,6 → **15,8** | 17,0 → **4,0** |
| 2. | 92 | 23,2 | 2,8 | 24,6 | 23,5 → **27,0** | 19,0 → **7,2** |
| 3. | 100 | 37,2 | 16,8 | 45,6 | 35,1 → **50,2** | 20,0 → **13,6** |
| 4. | 110 | 65,4 | 88,0 | 109,4 | 36,2 → **120,4** | 20,0 → **34,0** |
| 6. | 126 | 161,0 | 613,6 | 467,8 | 41,4 → **514,6** | 20,0 → **147,4** |

**A mód nem kap külön táblát, és nem is kell neki.** Dinamikusban a klub
gyorsabban gazdagszik (a 3-4. idényre Infinity + BL), és az ár ugyanezzel a
tempóval nő — az arány (egy boost ≈ egy idénynyi keret) mindkét módban azonos.
A régi képlet épp fordítva viselkedett: ott az ár a 6. idényben is 41 Mrd volt,
miközben a klub évi 775 Mrd-ot forgatott — vagyis a boost ingyenessé vált.

### Egy állandó, ami korábban nem volt az

**ifi-boost ÷ a piac tetején álló játékos ára** — ugyanaz a mérés, mindkét
módban:

| | 1. | 2. | 3. | 4. | 6. | 8. idény |
|---|---|---|---|---|---|---|
| hagyományos, **régi** | 0,43 | 0,39 | 0,38 | 0,25 | 0,12 | 0,06 |
| hagyományos, **új** | 0,19 | 0,21 | 0,22 | 0,21 | 0,21 | 0,28 |
| dinamikus, **régi** | 0,42 | 0,32 | 0,18 | 0,07 | 0,02 | — |
| dinamikus, **új** | 0,38 | 0,37 | 0,26 | 0,23 | 0,22 | — |

A régi képletnél az arány a karrier alatt **0,43-ról 0,02-re zuhant**: a boost
a végén gyakorlatilag ingyen volt, az elején viszont megfizethetetlen. Az új
horgony ugyanazt jelenti a karrier egészén: **egy nagy igazolás ötöde-negyede.**

---

## 6. Amit szándékosan NEM változtat

* **A hatások** — a hét boost ereje, a poszt-tanulás 12/36 meccses tempója, a
  mérföldkövek stíluspontjai — betűre a régiek. Ez árazási változás.
* **A boost-fajták egymáshoz mért ára** (`BOOST_UNIT_KIND`: 0,33-tól 1-ig)
  változatlan; csak maga az egység mércéje új.
* **A stílus-kategóriák egymáshoz mért ára** (`pct`: 0,5–1,2) változatlan — a
  rangsor jó volt, csak a szint volt magas.
* **A bér, a kupadíjak, a mérföldkő-jutalmak** nem mozdultak.
