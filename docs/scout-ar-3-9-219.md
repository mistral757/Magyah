# 3.9.219 — 💸 Olcsóbb scout-találat

> „A scout találta játékosok alap árát a mostaninak olyan 33-55%-ára
> csökkenteném. Jelenleg lehetetlen megvenni őket pl. Első szezonban."

## Az ár

| | Eddig | Most |
|---|---|---|
| Meghirdetett ár | a piaci vételár 65–75%-a (1★ ügynökség → 75%, 10★ → 65%) | **ennek 33–55%-a**, vagyis a piaci vételár nagyjából **21–41%-a** |

* **Az árengedmény játékosonként sorsolódik** a kiszemeléskor (`rec.arF`,
  egyenletesen 0,33 és 0,55 között), és a mentésben vele marad — ugyanaz a
  játékos nem lesz újranyitáskor más árú.
* **Az ügynökség szerepe megmaradt:** a jobb ügynökség továbbra is lejjebb
  viszi a kiinduló hányadot (75% → 65%), erre ül rá az árengedmény. A panel
  az aktuális ügynökséghez tartozó sávot írja ki (1★-nál 25–41%).
* **A tárgyalás változatlan:** a licit-kúp (68–118%), a türelem, az
  elutasítások utáni engedékenység és az ellenajánlat mind a meghirdetett
  árhoz mér — csak a kiinduló ár lett alacsonyabb.
* **Az ingyenes harmad** (3.9.217) és a szokásos scout felfedezettjei
  változatlanul ingyenesek.

## Régi mentés

A 3.9.219 előtt kiszemelt, még fizetős játékosok az első árazáskor kapják meg
a saját árengedményüket. Ha volt függő ellenajánlatuk, az érvényét veszti
(még a régi, magasabb árhoz szólt) — a következő licit már az új árból indul.

## Mérés

`tools/scout-ar-3-9-219-proba.js` — 600 kiszemelt árengedménye 0,33–0,55
között (átlag ~0,44); az ár képlete; ellenajánlat és elfogadás az új árral;
régi mentés; az ingyenes harmad; felület. Tájékoztató szám a próba 1. idényes
karrierjéből: a medián meghirdetett ár nagyjából a felére–harmadára esik.
A `tools/meres-scout-3-9-206-proba.js` árarány-ellenőrzése az új sávot várja.
