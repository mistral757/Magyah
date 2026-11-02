# 3.9.346 — a sima gól jelenete: védők, csatár-mozdulat, passz

> „Az animációkban sima góloknál is legyenek védők, lövés előtti csatár
> mozdulatok, ha van gólpasszadó, akkor passz is."

## Mi volt eddig

A sima gól (nem fejes, nem tizenegyes, nem szabadrúgás és nem skill-gól)
három figurából állt: lövő, labda, kapus. A lövő egyetlen lépéssel rúgott,
védő nem volt a képen, és a gólpasszadó sem jelent meg, akkor sem, ha a
közvetítés sora megnevezte.

## Mi van most

**Két védő minden sima gólnál.**

* Saját gólnál az ellenfél mezében állnak.
* Kapott gólnál a mi hátsó sorunk két játékosa áll ott, a 3.9.337-es
  szabály szerint (`evaSajatStab` → `_stabV`, 1 helyett 2 fő).

**Ha van gólpasszadó:**

1. A passzoló a jobb szélről a tizenhatos elé játssza a labdát (≈ 450 ms).
2. A csatár ráfut, és levéti a labdát (≈ 1000 ms).
3. Egy igazító lépés, a hátralendülés, majd a lövés (1350 ms).
4. A közelebbi védő későn csúszik be a lövés elé, a másik a befutót követi.
5. Saját gólnál a passzoló maga a gólpasszadó, mert a sor zárójeles neve a
   jelenet első társa (3.9.337).

**Ha nincs gólpasszadó:**

1. A csatár labdát vezet.
2. Cselt mutat balra; a közelebbi védő beveszi, és megtántorodik.
3. Jobbra elhúz, és lő (1350 ms).

**Mindkét esetben:**

* A kapus előbb helyezkedik, és csak a lövés után vetődik.
* A háló a lövés után 550 ms-mal mozdul (1900 ms).
* A villanás és a gólhang a hálóhoz igazodik.

**Hang.** A lövés külön labda-mozgás. Ezért a jelenet hangja két rúgást hall
(a passzt és a lövést), a levételnél egy érintést, a végén a hálót.

**Mikor van passz?**

* Saját gólnál a sor zárójeles gólpasszadója dönt (`GÓL! Messi (Xavi)`).
* Az ellenfél gólsora nem nevez gólpasszadót. Ott az eseményből képzett,
  rögzített mag dönt: nagyjából minden második kapott gól előtt van passz, és
  ugyanaz a gól mindig ugyanúgy néz ki.

**A jelenet hossza.** 2300 helyett 3000 ms. A fejes, a tizenegyes és a
szabadrúgás mozgása változatlan, náluk csak a kitartás lett hosszabb.

## Próbák

* Új: `tools/sima-gol-3-9-346-proba.js`. A `KEPEK=mappa` változóval képkockákat
  is ment.
* Igazítva: `statisztak-3-9-337` (a kapott gólnál a védő-stáb 1 → 2 fő, az első
  továbbra is a hátsó sorból).
* Igazítva: `animacio-hang-3-9-310` (egy hang többször is szólhat egy
  jeleneten belül; a legközelebbi azonos tervezett hanghoz mér).
