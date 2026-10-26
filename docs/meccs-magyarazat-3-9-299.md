# 🔍 A meccs-magyarazat — miért lett ez az eredmény? (3.9.299)

## A bejelentés

**A meccs:** FÜG – ÁCsé Milánó **4:0**, idegenben.

| | meccs-erő | mellette |
|---|---|---|
| mi | ⚡94,3 | 📈−0,4 |
| az ellenfél | ⚡89,1 | ⚖+1,4 |

> „Mi lehet az oka egy ilyen jelentős vereségnek ilyen jelentős meccserő
> fölény mellett? […] Ha valami jelentősen megkavarja a meccsmotort, ami a
> meccserőből nem kiolvasható, azt valahogy jelezni kell a játékos felé.
> […] Tőlem lehet ilyen (nagyon kis eséllyel), de lehessen tudni mi az oka."

## Amit a mérés mondott

**A motor szerint esélyesek voltatok.**

* A motor különbsége: 93,9 − 90,5 − 0,3 (idegenben) ≈ **+3,1**.
* Ebből a gólvárhatóság nagyjából **1,9 : 0,9**.
* A 0:4 erre a modellre kb. **1:400** esélyű.

**A karrier első 8 meccse** (a mérési fájlból): 23 kapott gól a kezdőrúgáskori
λ-k szerinti 12,4 helyett, 12 lőtt a 9,6 helyett.

**A többi karrier:** a tényleges gólok jellemzően 10–40%-kal a kezdőrúgáskori
λ fölött vannak. A ⚡ tehát nem a teljes kép. A motor a kezdőrúgáskor és
ötpercenként egy tucat szorzót tesz rá, és ezek eddig némák voltak:

* **a kezdőrúgáskor:**
  * védekező képességek;
  * a kiürített közép ára;
  * a kijelölt bedobó;
  * a hátsó sor formája;
  * a csapatstílus;
  * a taktika-stílus;
  * a rangadó-hangulat;
  * a talizmánok, az összhang és a család;
* **ötpercenként:**
  * rákapcsolás;
  * hajrá-képesség;
  * buszsofőr;
  * stílus-szerepek;
  * szárnyjáték;
  * villám-fáradás;
  * gólétvágy;
  * hangsúly-csúszkák;
  * időzített talizmánok;
  * szurkolótábor;
  * a kiállítás utáni fáradás;
  * a csere és a kiállítás miatti erőváltozás;
* **a gólvárhatóságon kívülről:** 11-es, öngól, VAR, pontrúgás-skill.

## A megoldás

### 1. A mérő (MX)

A mérő a motor szorzóit **ugyanabban a sorrendben** számolja ki, csak névvel
jegyzi fel őket. A kiértékelés és a szorzás is balról jobbra megy, ezért a λ
bitre a régi.

* **A kezdőrúgáskor** (`mxKezd`): a meccserőkből várható λ (`1,3·e^(0,12·d)`)
  és a meccs előtt ismert rejtett szorzók, mindkét oldalon.
* **Vödrönként** (`mxVodor`): a 18 ötperces vödör szorzói és a tényleges λ.
* **A lefújáskor** (`mxVege`):
  * a várható és a tényleges xG;
  * a tényezők hatása gólban;
  * a gólvárhatóságon kívülről jött gólok;
  * a szerencse esélye.

### 2. A meccserő-egyenérték

Minden tényezőnél az a ⚡-eltérés, ami **ugyanennyi gólkülönbséget** okozna.
A ⚡ mindkét oldal λ-ját mozgatja, egy rejtett szorzó csak az egyikét, ezért
az egyenérték:

```
gól-hatás / (K · (xG_mi + xG_ők))
```

Példa: ×1,8 a kapott gólokon, 0,85-ös alap mellett → +0,7 kapott gól ≈
**−1,7 meccserőnyi**.

### 3. A kezdőrúgás figyelmeztet

Ha a meccs előtt ismert rejtett tényezők legalább **~1 meccserőnyit**
dolgoznak ellened, egy sor kimondja. Példa:

> ⚠️ A meccserőn kívül ezen a meccsen: alakzat: a kiürített közép ×1,4 — ez
> nagyjából −1,3 meccserőnyi a ⚡-hoz képest.

### 4. A lefújás után

* **Meglepetésnél** a naplóba egy „🔍 Miért lett 0:4?” sor kerül. Meglepetés:
  * esélyesként vereség;
  * vagy legalább 2,5 góllal a várt gólkülönbség alatt;
  * vagy esélytelenként győzelem, illetve 3 góllal a várt fölött.
* **A mérleg ablaka** meglepetésnél, **a statisztika ablaka** mindig mutatja a
  teljes magyarázatot:
  * mit ígértek a meccserők, és mennyivel számolt ténylegesen a motor;
  * mi dolgozott ellened és mi neked: tényezőnként gólban és ⚡-egyenértékben;
  * hány gól jött a gólvárhatóságon kívülről;
  * **a szerencse része**: ilyen vagy rosszabb eredmény ezekkel az esélyekkel
    hány meccsből egyszer jön ki, és hogy a rejtett tényezők rontottak-e,
    vagy ez döntően balszerencse.

### 5. A mérési napló

A meccssor `mx` mezője:

| mező | jelentés |
|---|---|
| `xf`, `xa` | tényleges xG |
| `ef`, `ea` | a ⚡-ből várható xG |
| `pf`, `pa` | a λ-ból jött gólok |
| `p` | a szerencse esélye |
| `t` | a 4 legnagyobb tényező |

Ebből a következő mérési fájlok megmondják, melyik rejtett tényező rúg ki
rendszeresen.

## Próba

`tools/meccs-magyarazat-3-9-299-proba.js`:

* **valódi meccseken:**
  * 18 vödör, pozitív xG;
  * a λ-ból jött gól nem több a lőttnél;
  * a mérési sor viszi;
* **a kezdőrúgás figyelmeztetése:**
  * csend, ha nincs rejtett tényező;
  * a kiürített közép ×1,4 → −1,3;
* **az elemzés:**
  * esélyesként 0:4 = balszerencse;
  * hangsúly-csúszkák ×1,8 = +0,7 kapott gól, ≈−1,7;
  * a gólvárhatóságon kívüli gól;
  * a várt eredmény nem meglepetés;
* **az ablakok;**
* **nincs oldalhiba.**

## 3.9.303

A magyarázat mindhárom megszólalása (figyelmeztetés, naplósor, mérleg/statisztika blokk) az **edzőé** lett: az ő nevével és arcképével szól, és az Edző menü „Amit csinál” blokkjában is ott van. Lásd `docs/edzo-3-9-300.md`.
