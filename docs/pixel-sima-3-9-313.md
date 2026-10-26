# 🎞 Pixel témában is sima mozgás a meccsen (3.9.313)

## A bejelentés

> „Pixelated módban az animációk nagyon szaggatnak. Legyenek ugyanolyan szép
> smooth animációk, mint a többi témával. Jelenleg a pixelated stílust ezért
> kapcsoltam ki, mert nézhetetlenek az animációk."

## Mérés

Egy góljelenet első 1,5 másodpercét mértük, a böngésző minden képkockáján:

| | képkocka-idő (medián) | 50 ms-nál hosszabb képkocka | a labda külön helyzetei |
|---|---|---|---|
| Sötét téma | 16,7 ms | 0 | 33 |
| Pixel téma (előtte) | 16,7 ms | 0 | **7** |
| Pixel téma (utána) | 16,7 ms | 0 | 33 |

A böngésző mindkét témában egyenletes 60 képkockát rajzolt, tehát **nem
teljesítmény-gond volt**. A szaggatást a szándékos lépcső okozta:

* a Pixel témában minden jelenet-mozgás `steps(8)`-cal futott, a felirat
  `steps(6)`-tal;
* a téma globális CSS-szabálya a meccs-képernyő minden animációját és
  átmenetét is lépcsőzte (`steps(6)` / `steps(3)`).

## A javítás

**Az esemény-jelenet:** minden témában ugyanazzal a sima időzítéssel fut.

**A meccs-képernyő (`#scSim`) és a jelenet (`#evAnim`):** kikerült a globális
lépcső-szabály alól. A kivétel `:where()`-ben áll, így nem emeli a szabály
súlyát. Ez azért kellett, mert az első változat az ünneplő konfetti saját
lépés-szabályát is felülírta; a konfetti-próba ezt elkapta.

**Ami marad:**

* **A Pixel téma kinézete:** a pixeles arcok, a szögletes színpad és a
  pixeles színek.
* **A menük lépcsős mozgása:** ez a téma jellege. A Beállításokban a
  „Szaggatott mozgás" kapcsolóval ez is kikapcsolható.

## Próba

`tools/pixel-sima-3-9-313-proba.js`, 8 állítás, a játék saját jelenet-lejátszójával:

* Pixel témában a labda annyi helyzetben látszik, mint a sötétben;
* a képkocka-idő egyenletes;
* a jelenet egyetlen animációja sem lépcsős;
* a pixeles arc marad;
* a meccs-képernyőn és a jelenetben a CSS sem lépcsőz;
* a menükben a lépcső marad, és a kapcsolóval kikapcsol;
* nincs oldalhiba.

**Javítás nélkül (3.9.312)** a próba piros: a labda 7 helyzetben látszik,
a jelenetben 7 lépcsős animáció fut, és a meccs-képernyőn is `steps(6)` jár.
