# 3.9.359–360 — súlyozott mezőny: fele-fele, a nyárzáró értékelés utáni záróval

> **3.9.360 — javítás:** „A nyárzáró értékelés az nem akkor van, ahová most
> tetted. Az akkor van, amikor lement minden kupa, és megkapják a szezon
> kártyákat a játékosok..." A mérés ezért a szezonkártyák, a
> Fénykor-próbaidő és a kihívásból járó kártya-fejlesztés UTÁN fut
> (3.9.359-ben még az öregítés után, a kártyák ELŐTT). Ha egy futó karrier a
> 3.9.359-cel már átment egy szezonjelentésen, az idei záró a kártyák előtti
> érték marad (utólag nem mérhető vissza), a következő idénytől helyes. A
> rekord `v:2` jelzi az új mérési pontot.

> „Minden módban állítsuk át a súlyozást úgy, hogy a súly egyik fele a
> nyárzáró értékelés utáni meccs erő, másik fele az új szezon indításkori
> meccs erő."

## Mi változott

| | Eddig (3.9.287 / 3.9.289) | Mostantól |
|---|---|---|
| A képlet | (indító × 1,25 + záró) / 2,25 | (indító + záró) / 2 |
| A záró ⚡ mérése | a 30. fordulónál, a kupák és az évforduló előtt | a nyárzáró értékelés után: minden kupa lement, a játékosok megkapták a szezonkártyákat (az öregedés és az éves fejlődés is lefutott), az igazolások előtt |
| A nyári fejlesztésből megmarad | ≈44% | a fele |

* **Minden módban** érvényes: egyjátékosban, közös karrierben és saját
  bajnokságban, a futó karrierekben is.
* **A mérés** idényenként egyszer történik (`nfZaroUtanRogzit`). A jelentés
  újranyitása nem méri újra.
* **A mentés** tárolja (`S.zaroUtan`).
* **Egyjátékosban** a kezdőrúgás a `vallH[idény].zaroMs`-t olvassa, ezt írja
  felül a mérés. A régi, 30. fordulós érték `zaro30` néven megmarad.
* **Közös karrierben** a saját záró érték (`mpSajatZaro`) is ez. Mindkét gép a
  sajátját küldi, így a két szám közös marad.
* **A célrés-ablak** 🧮 sora, a kezdőrúgás naplója és a képlet szövegei a
  fele-fele súlyt írják.

## Egy példa (a 3.9.358-as bejelentés számaival)

**A bemenet:** indító 135,1, záró 114,7, célrés −0,1.

| | Eddig | Mostantól |
|---|---|---|
| Súlyozott ⚡ | 126,0 | 124,9 |
| A mezőny ⚡-a | 126,1 | ~125,0 |
| A rajt-rés | +9,0 | +10,1 |

**Még egy hatás:** mivel a záró most az évforduló után mérődik, a kupákat és
az éves fejlődést (öregedés, fejlődés) is magában foglalja. Ami ezután a
nyáron jön (igazolások, boostok), annak a fele a tiéd.

## Próbák

* **`tools/suly-fele-3-9-359-proba.js`** (7 állítás):
  * a fele-fele képlet;
  * a mérés az `advanceCareerSeason` után fut;
  * felülírja a 30. fordulós zárót, idényenként egyszer;
  * a közös karrier saját záró értéke is ez;
  * a mentés.
* **A korábbi próbák** (`pvp-szigor-3-9-287`, `sp-sulyozott-3-9-289`,
  `celres-suly-3-9-358`) a fele-fele súlyhoz igazítva.
* **A 3.9.358-as 🧮 magyarázósor** kivétel a „rizsa nélküli” nyári ablak
  ellenőrzése alól, mert azt kifejezetten kérted.
