# 3.9.213 — 📏 A POT-jutalom és a felállás-árak is skálázódnak

> „Ez a típusú jutalom is legyen skálázva, mert eddig nem volt. Ezen felül a
> felállás vásárlás, saját felállás készítése sem volt skálázva. Legyen
> ugyanúgy, mint a többi (scout fejlesztés, pozíció tanulás stb)."

## 1. A kihívás „+N POT egy játékosra” jutalma

**Eddig:** fixen 1500 × a nehézség szorzója (a képen: közepes, ×1,05 →
1575). Ez a karrier elején egy átlagos POT bő fele volt, de a mezőny
növekedésével semmivé zsugorodott:

| Mezőny | Egy mezőny-szintű játékos POT-ja | Az 1500 aránya |
|---|---|---|
| 85 | ~2 400 | ~64% |
| 150 | ~54 000 | ~3% |
| 400 | ~1 500 000 | ~0,1% |

**Mostantól:** a jutalom a mezőny-szintű POT-tal arányos.

```
jutalom = 1500 × nehézség × max(1, peakToPot(mezőny) ÷ peakToPot(85))
```

* **85-ös mezőnyig betűre a régi szám**, tehát a karrier eleje nem változik.
* Fölötte ugyanakkora arányt ad a mezőny POT-jából, mint a karrier elején:

  | Mezőny | Jutalom (×1) |
  |---|---|
  | 100 | ~4 650 |
  | 150 | ~34 600 |
  | 400 | ~958 000 |

* A kártya 10 000 fölött 3 értékes jegyre kerekít, és ezres tagolással írja ki.
* A kifizetést a kemény POT-plafon fogja, ami 3.9.212 óta szintén a mezőnnyel
  nő. Lefelé sosem visz.

## 2. A felállás-bolt és a saját felállás ára

**Eddig:** fix forint, a klubtól függetlenül.

* „Totális futball” (4-2-4): 75 Mrd.
* Saját felállás: 50 Mrd.

**Mostantól:** ugyanaz a `scaledUpgradePrice` számolja, mint a
scout-fejlesztést, a stábot és a keretbővítést.

* **A referencia-büdzsénél** (20 Mrd éves keret) **pontosan a régi ár**.
* Kisebb klubnál arányosan kevesebb (a fele akkora klubnak fele annyi).
* Nagyobb klubnál a gyöke szerint több (a négyszeres klubnak kétszeres).
* Az **1. idényben −50%, a 2.-ban −33%** (a közös kezdő kedvezmény). Az ár
  mellett ott a jelölése, mint a többi fejlesztésnél.
* A bolti felállás **csapatstílus-kedvezménye** a skálázott árra szorzódik.
  Az „eredetileg” ár is a skálázott alapár.
* A bolt, a tervezőasztal gombja, a megerősítő ablak és a napló mind
  ugyanazt a számot mutatja, amit a vásárlás levon.

## A próba

`tools/skalazas-3-9-213-proba.js` — **21 állítás**, valódi böngészőben.

* a jutalom skálája és a régi érték megőrzése;
* a kártya és a kifizetés;
* a felállás-árak egyezése a scaledUpgradePrice-szal (referencia, kis és
  nagy klub, 1. idény, stílus-kedvezmény);
* a felületi út: bolt, vásárlás, saját felállás, tervezőasztal.
