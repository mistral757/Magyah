# 3.9.350 — a rés-követés a pályát méri, nem a modellt

> „Ez amit itt példaként kidolgoztál. Ez nem egy olyan esetet ír le éppen,
> amilyet nem szeretnénk? Hogy mást mond az, hogy mennyinek kellene lennie és
> hogy mennyi ténylegesen? Nem lehetne ezt valahogy kiküszöbölni? […] jó lenne
> ha ténylegesen nem fordulna elő ilyen..."

## A képről

A 3.9.349-es képernyőkép a próba **kitalált** adataiból készült. Ezek
szándékosan ellentmondtak egymásnak, hogy látszódjon: a figyelmeztetés
működik.

A kérdés viszont jogos: két forrás tudta szétválasztani azt, amit a HUB
mutat, attól, ami a pályán történik.

1. **A rejtett erősítés.** A 3.9.349 javította: a meccs a befagyasztott, a
   mérés a mostani értékkel számolt.
2. **A tartós forma** (játékosonként ±7,5%). Szándékosan nem része a ⚡-nak,
   mert a nehézség a keretet méri, a motorban viszont hat. Mérve: hat
   játékos forma-eltérésénél a HUB 73,17, a motor 73,85.

Ezen túl minden HUB-modell eltérhet a motortól, ha egy jövőbeli változás
csak az egyikbe kerül be.

## Most

**1. A rés-követés a motor számát méri.** Minden bajnoki kezdőrúgásakor
rögzül, amivel a meccs ténylegesen indult. Ebből számol a fordulónkénti nyers
rés:

```
nyers rés = (a pályára lépő ⚡-od − a tartós forma) − a mezőny „most" száma + a követés saját eltolása
```

* **A mezőny átlagához mér, nem az aznapi ellenfélhez.** A sorsolás
  szerencséje (élcsapat vagy kieső ellen játszol) nem mozgatja a
  nehézséget. Az ellenfelek szórása az átlag körül szándékos.
* **A tartós formát levonja.** Átmeneti, és egy forró széria ne emelje
  tartósan a mezőnyt.
* **A HUB-modell becslése megmarad összevetésnek** (`K.gm`). Ahol nincs
  mért adat (párharc, régi hívó), a modell dönt, ahogy eddig.

Ezért a rés-követés pontosan azt látja, ami a pályán történt. Ha a HUB
kijelzése egyszer mégis elcsúszna, a nehézség akkor is a pályához igazodik.

**2. Önellenőrzés.**

* **A naplóban:** ha egy 5 fordulós ellenőrzésnél a mért és a HUB szerinti
  rés tartósan (legalább 3 fordulón át, átlagosan ≥ 1,0-val) eltér, egy
  „⚠ Mérési eltérés” sor jelenik meg, idényenként egyszer. Ez hibát jelez,
  amit szólni kell.
* **Az ablakban:** a „Most” kártya kimondja, hogy egyezik-e
  („✓ A HUB és a pálya egyezik”, vagy „⚠ Mérési eltérés”). A blokkok
  eseménysorában is ott a jelzés.

**3. Az ablak oszlopai.** Ami egymás mellé került: ennyinek kellene lennie
és ennyi volt.

| Oszlop | Mi |
|---|---|
| ⚡ HUB | a HUB becslése a **kezdőrúgáskor** (eddig a lefújás utáni szám volt, amikor a morál már az eredményre mozdult) |
| ⚡ pályán | a motor száma |
| 📈 forma | a tartós forma |
| ellenfél ⚡ | a ténylegesen pályára lépő ellenfél (az átlag körül szándékosan szór) |
| „mezőny most” | a panel száma |
| **rés HUB** | ⚡ HUB − „mezőny most” |
| **rés mérve** | (⚡ pályán − forma) − „mezőny most”; **ennek egyeznie kell a rés HUB-bal**, és ezzel dolgozik a rés-követés |
| rés aznap | a motor különbsége az aznapi ellenféllel, a pálya-eltolás nélkül |

**Valódi meccsen mérve** (a próba első szakasza): a kezdőrúgáskori HUB-szám
72,8, a motor száma forma nélkül 72,8.

## Próba

`tools/nehezseg-tortenet-3-9-349-proba.js`, bővítve. Új állítások:

* valódi meccsen a HUB és a motor egyezik;
* a mért nyers rés képlete;
* a rés-követés a mért számot jegyzi fel, a modellét összevetésnek;
* mért adat nélkül a modell marad;
* tartós eltérésnél a napló szól;
* az emelés a mért résből dől el;
* az ablak kimondja az egyezést, illetve az eltérést.
