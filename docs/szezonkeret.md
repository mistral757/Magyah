# Szezonkeret — a működési keret és a vitrin-prémium

*(3.8.13. Érintett kód az `index.html`-ben: `seasonBudgetParts()`,
`seasonBudgetCore()`, `computeSeasonBudget()`, `clubPrestigePoints()`,
`clubPrestigeShare()`, `budgetTrophyWeight()`, `budgetFieldMult()`, a
`BUDGET_PRESTIGE_*` / `BUDGET_MKT_*` konstansok, az `EURO_COMPS[*].prize`
szorzók, valamint a `budgetBreakBoxHtml()` panel.)*

## 1. A bejelentett hiba

> „A szezon keret nevetséges összeg."

Igaz volt, és **mérhető**. Egy hatodik idényében járó karrier idény-mérlege:

| tétel | összeg |
| --- | --- |
| 🏦 Szezonkeret | **+23 Mrd Ft** |
| 🎺 Lelátó | +163 Mrd Ft |
| 🏆 Kupa-helyezések | **+2 581 Mrd Ft** |
| 📦 Játékos-eladás | +114 Mrd Ft |
| ⭐ Kihívás- és mérföldkő-jutalom | +97 Mrd Ft |

A klub egész éves kerete az idény bevételének **0,8%-a** lett, és a piac tetején
álló játékos árának az **1,4%-a**. Vagyis a klub saját gazdálkodásának nem volt
tétje: minden a kupán múlt, a nyári keret pedig kerekítési hiba volt mellette.

## 2. Az ok szerkezeti volt, nem elírás

A keret a csapaterő **telítődő** görbéjén ült: 90 fölött fix +700 pont
Rating-pontonként. A játékosárak viszont **konvexek** — a csillag-felár
(`starValueMult`) 6000 TSI fölött külön kitevőt kap, mert a világ legjobbjából
nincs másik.

Egy telítődő és egy konvex görbe szükségszerűen szétnyílik. Minél előrébb tart a
karrier, annál kevesebbet ér a keret — és a szétnyílás gyorsul.

A **kupadíjakat** ezért kötöttük már korábban a piac tetejéhez
(`topMarketPrice`). A keret viszont a régi görbén maradt, így a javítás pont a
szakadékot mélyítette: a kupa lett az egyetlen valódi bevétel.

## 3. Az új felépítés: két réteg

### 3.1 Működési keret (`core`)

A klub ismétlődő, hétköznapi bevétele. A régi görbe, **két javítással**:

```
alap = 2600 + ((csapaterő − 60) / 30)² × 10500        (60–90 között, változatlan)
       × 1,045 ^ (csapaterő − 90)                     (90 fölött — ÚJ)
       × mezőny-szorzó                                (ÚJ)
       × INCOME_TRIM (0,75)
```

* **90 fölött százalékosan nő**, nem fix lépcsőben. A régi +700/pont egy 130-as
  csapaterőnél is csak +28 000-et adott — a görbe gyakorlatilag megállt. A
  4,5%/pont ugyanonnan indul (90-nél mindkettő 13 100), de innentől tényleg
  követi a csapaterőt.
* **A mezőny szorzója**: 84 (az Magyar Másodbajnokok teteje) a semleges pont, fölötte
  pontonként +2%, 2,2-szeresnél megáll. Ugyanaz a tizenegy többet forgat az
  Magyar Bajnokokban, mint a megyei bajnokságban. Lefelé nem büntet — az alsóbb osztályok
  kerete betűre a régi marad.

### 3.2 Vitrin-prémium

A **piac tetejének** (`topMarketPrice` — annak a játékosnak a vételára, akinél
drágábbat a mostani piacon nem találnál) egy százaléka. A százalékot a
**megnyert trófeák** nyitják:

```
százalék = 2% + 2% × presztízspont,   26%-nál plafon (≈12 pont)
```

**Presztízspont-táblázat** (a `seasonHistory`-ból, a karrier egészére):

| eredmény | pont |
| --- | --- |
| bajnoki cím | 1,0 |
| bajnoki ezüst | 0,25 |
| BL-győzelem | 1,5 |
| EL-győzelem | 1,0 |
| Fából Készült Serleg-győzelem | 0,6 |
| KL-győzelem | 0,5 |
| Magor Kupája-győzelem | 0,35 |
| elvesztett kupadöntő | a győzelem harmada |

**A trófea súlya a mezőnyhöz mért** (`budgetTrophyWeight`): 70-es szinten 0,25 ·
85-ös (Magyar Bajnokok) szinten 1,0 · 94 fölött 1,6. Ugyanaz a trófea tehát nem ér
ugyanannyit két különböző világban — egy megyei bajnoki cím nem tesz nagyklubbá.

### 3.3 A két szorzó a keret EGÉSZÉRE szól

Az edzői fizetésemelés/megsapkázás (`S.salaryMod`) és a fejlődési tempó
(`tempoMult`) mindkét rétegre ráül. Így a HUB bontásának sorai — alap +
vitrin-prémium + fizetés + tempó — pontosan a végösszeget adják ki.

## 4. Miért nem ül az EGÉSZ keret a piacon?

Mert a két görbe a karrier **elején épp fordítva** áll: ott a működési keret a
piac tetejének ~35%-a. Egy tisztán piac-arányos keret (mondjuk 15%) a kezdő
karriert a felére vágná. A működési réteg megőrzi az induló egyensúlyt, a
prémium pedig csak ott lép be, ahol a piac tényleg elszaladt — és csak
eredményért.

Mért értékek (normál mód, majd Infinity/piramis):

| helyzet | piac teteje | RÉGI keret | ÚJ keret | keret / piac (régi → új) |
| --- | --- | --- | --- | --- |
| start: mezőny 84, csapat 84, 0 trófea | 21 045 | 6 990 | **7 411** | 33% → 35% |
| 4. idény: mezőny 89, csapat 92, 2 cím + 1 KL | 41 959 | 10 875 | **15 243** | 26% → 36% |
| elit: mezőny 100, csapat 105, plafonon | 183 431 | 17 700 | **72 791** | 10% → 40% |
| mezőny 110, csapat 112, **0 trófea** | 552 028 | 21 375 | **50 372** | 3,9% → 9,1% |
| mezőny 116, csapat 116, 3 cím + 3 BL | 972 304 | 23 475 | **303 405** | 2,4% → 31% |
| mezőny 130, csapat 132, plafonon | 3 211 375 | 31 875 | **954 774** | 1,0% → 30% |

A két utolsó előtti sor a lényeg: **ugyanazon a szinten** a trófea nélküli klub
9%-on, a kiépített vitrinű 31%-on áll. A keret aránya tehát nem a szintből jön,
hanem az eredményekből — a régi rendszerben viszont mindenki egyformán
elszegényedett, akárhány kupát nyert.

## 5. A kupadíjak felezése

A vitrin-prémium önmagában nem lett volna elég: a régi kupapénz mellett az új
keret is eltörpült volna. A pénzdíjak mércéje maradt a piac teteje, de **minden
szorzó a felére csökkent**:

| sorozat | régi | új |
| --- | --- | --- |
| Kupák Kupájának Kupája | 1,5× | **0,75×** |
| Ojrópai Klubcsapatok Bajnoki Kupája | 1,0× | **0,5×** |
| Konföranszié Líg | 0,5× | **0,25×** |
| Fából Készült Serleg | 0,35× | **0,175×** |
| Magor Kupája | 0,25× | **0,125×** |

Az ezüstérem továbbra is a győzelem fele, az elődöntő a negyede; a Nyári
Felkészülési Kupa változatlanul nem fizet.

A kupa így a **legnagyobb egyszeri** bevétel marad (egy BL-győzelem nagyjából
két-három szezonnyi keret), de már nem helyettesíti az egész gazdaságot.

## 6. Mi ül a MŰKÖDÉSI kereten, és mi a teljesen?

Ez a rész a legkönnyebben elrontható, ezért ki van mondva:

| rendszer | mércéje |
| --- | --- |
| igazolások, HUB-fejlesztések (a tényleges pénz) | a **teljes** keret (`total`) |
| játékos-bérek `WAGE_CLUB_SHARE` ága | **működési** (`seasonBudgetCore()`) |
| mérföldkő-pénzjutalom (`msCashReward`) | **működési** |
| stílus-kategóriák ára (`msCatPrice`) | **működési** |

**Miért.** Ezeknek a százalékai a klub *hétköznapi* léptékéhez vannak hangolva, a
vitrin-prémium viszont a trófeák jutalma. Ha a prémium is átfolyna rajtuk, egy
megnyert bajnokság **háromszor** fizetne: egyszer a kupapénzben, egyszer a
keretben, egyszer pedig mind a 125 mérföldkő jutalmában — a bér pedig annyira
elszakadna a lelátótól, hogy a plafon (`WAGE_CAP_OK`) tartósan rákulcsolódna, és
a Rating-arányos szétosztásnak nem maradna tétje.

A trófea béremelését továbbra is a `wageTitleCount` ága adja, külön és mérten.

## 7. Amit a felhasználó lát

A HUB büdzsé-chipjére koppintva a bontásban új sor jelent meg:

```
🏆 Vitrin-prémium (7,20 presztízspont → a piac tetejének 16,4%-a)   +14 006 M Ft
```

Mindig kint van, akkor is, ha nulla trófeánál épp a 2%-os minimumon áll: ez a
keret növekedésének az egyetlen igazi kapcsolója, tehát látszania kell, hány
trófeát ér a mostani százalék. A csapaterő sora mellett pedig ott a mezőny
szorzója is, ha nem 1,00.
