# 3.9.352 — könnyed PvP: a párharc nem kerül a bajnoki ponttáblára

> „PvP könnyed módban a párharc meccseit is pontszámmá alakítja és felveszi a
> 30 fordulós idény ponttáblájára. Így konkrétan 12 ponttal többet lehet
> szerezni, mint egy tökéletes szezont futó csapat. […] A pontszámításba csak
> a 30 CPU ellen játszott meccs számítson ebben a módban. A hardcoreban
> természetesen a 2 egymás elleni meccs számítson továbbra is a szezon pontjai
> közé. Ott úgy jön ki a 30 meccs."

## A hiba

A lefújáskor minden olyan meccs a bajnoki mérlegbe ment, ami nem kupa- és
nem osztályozó-meccs. Ide került a saját bajnokság négy párharc-napja is:

* győzelem / döntetlen / vereség;
* rúgott és kapott gól;
* pont;
* a fordulók listája.

Ezek a napok a 30 CPU-forduló **fölött** jönnek. Így 34 meccsből gyűlt a
pont, egy tökéletes idényben 102 pont 90 helyett.

## Most

**Saját bajnokság (könnyed).** A párharc-nap nem kerül a bajnoki mérlegbe;
csak a 30 CPU elleni forduló számít. A párharc a saját mérlegébe megy, a
párharc-lapra, ahogy eddig is.

**Közös bajnokság (hardcore).** Változatlan: a két párharc a 30 forduló része,
és a bajnoki pontok közé számít.

**Futó karrierek.** Betöltéskor egy egyszeri javítás kiveszi a mérlegből a
már beszámolt párharc-napokat. Ez a futó idény győzelmeit, döntetlenjeit,
vereségeit, góljait, pontjait és fordulósorát érinti. A napló egy sorban
jelzi. A javítás idempotens: a javított kód ilyen sort már nem ír, így
másodszorra nem vesz el semmit. A már lezárt idények tabellája és
idénytörténete nem változik.

## Próba

`tools/sajat-bajnoksag-3-9-331-proba.js`, bővítve. Két kliens valódi
párharc-napján:

* a bajnoki mérleg egyik gépen sem mozdul;
* a régi, beszámolt sor a javítással kikerül, és másodszorra nem vesz el
  semmit;
* közös bajnokságban (hardcore) a párharc továbbra is számít.
