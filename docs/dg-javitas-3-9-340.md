# 🩹 A felfújt 1. idényes rés-változás javítása (3.9.340)

## A bejelentés

> „Na közben itt van az elcsesződött karrierünkben a guest oldal, ami
> esélytelen nehézségen fut, pedig saját célréssel kellett volna."

A mentés: saját bajnokság (Könnyed), 7.5 Mesteri. A közös célrés +0,5 volt,
a 2. idény mégis −5,8-as rajt-réssel indult, ami az esélytelen mezőny.

## Mi derült ki a mentésből

A közös célrés és a társ meccs-ereje **nem** szólt bele. A közös célrés a
két hangolás átlaga, itt +0,5 és −0,5, tehát 0 volt. A kezdőrúgás az
egyjátékos-ágon, a saját súlyozott meccs-erőhöz állította be a mezőnyt.

A −5,8 a rajt-cél képletéből jött:

```
rajt-cél = célrés − (az előző idények mért, idényen belüli rés-változása) / 2
         = 0,5 − 12,7 / 2 = −5,85
```

Ennek oka, hogy a 12,7-es rés-változás **hibás mérés** volt:

| | érték |
|---|---|
| az 1. idény mérés-sorában a rajt-rés | **−5,4** (a kalibrálás előtti, nyers rés) |
| a valódi, kalibrált rajt-rés (`P.gap0`) | **+1,5** |
| a záró rés | +2,9 |
| a téli emelés | +4,4 |
| a mért rés-változás | 2,9 − (−5,4) + 4,4 = **12,7** |
| a helyes rés-változás | 2,9 − 1,5 + 4,4 = **5,8** |

**Hogyan keletkezett a hibás sor.** Az 1. idény mérés-sora (`vallH[1]`)
lustán születik: az első olvasáskor (`pyrFloorHist`). Ha ez a kezdőrúgás
**előtt** történt, a sor a horgony előtti, nyers rajt-rést őrizte. A
kezdőrúgás kalibrálása később felülírta a `P.gap0`-t, de a sort már nem. A 2.
idény rajt-célja így 3,45-tel keményebb lett a helyesnél (−5,8 a ≈−2,4
helyett).

## A javítás

1. **Új karriereknél.** A kezdőrúgás kalibrálása (`pyrAnchorAtKickoff`) a
   már létrejött 1. idényes sort is a kalibrált rajt-résre frissíti.
2. **Futó karriereknél.** A betöltéskor egyszer lefut egy javítás
   (`nfDgJavit`).
   * Ha az 1. idény sora a kalibrálttól eltérő rajt-rést őriz, a sor a
     kalibráltat kapja, és a rés-változás újraszámolódik.
   * Ha a futó idény a hibás becsléssel indult és még tart, a mezőny annyival
     lejjebb kerül, amennyivel a rajt-cél keményebb volt. A pálya szintje
     egész szám, ezért a legközelebbi elérhető résre áll. Egyenlő távolságnál
     a könnyebb oldalra.
   * A futó idény sora és a rés-követés pályája is a helyes becslésre áll.
   * A napló kimondja.
   * Ép karrierhez nem nyúl.

**A bejelentett mentésen** (a játékban betöltve, próbaként):

* a rés-változás +12,7 helyett +5,8;
* a mezőny szintje 104 → 100;
* a jelenlegi rés −3,7 → **+0,3**;
* a 2. idény rajt-rése −5,8 → −1,8.

## Próba

`tools/dg-javitas-3-9-340-proba.js` (9 állítás):

* a kalibrált rajtból számol;
* a futó idény mezőnye lejjebb kerül;
* a sor és a rés-követés a helyes becslésre áll;
* egyszer fut, és naplóz;
* ép karrierhez nem nyúl;
* a kezdőrúgás kalibrálása frissíti a korábban létrejött sort;
* nincs oldalhiba.
