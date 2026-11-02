# 3.9.349 — a nehézség története mérve + a rés-mérés hibája

> „Az 5 forudlónkénti fejlődésellenőrző és lekövető rendszer jó lesz
> szerintem, csak jelenleg a gyakorlatba nem teljesen ültetődik át ahogy
> látod. Ellenfél tényleges ereje 114 körül van általában. Ötlet: ez a
> nehézségi szintes, divíziós felület. Ezen legyen egy gomb. Az feldob egy
> ablakot, ahol részletesen ki van fejtve, hogy a karrier legelejétől
> mostanáig hogyan fejlődött a csapat meccsereje, és hogy félszezonos,
> szezonközi, és aztán 5 fordulós ellenőrzések, kapuk után hogyan alakult a
> nehézségi szint az ellenfélnél. Hol mennyi volt a mezőny közepe.
> Ténylegesen!"

## 1. A hiba: a mérés más ellenfelet látott, mint a pálya

**A képeken:**

* a csapatod ⚡ 118,8;
* a panel szerint „a mezőny most” 118,6, vagyis a rés +0,1, egyenrangú;
* a pályán a 10. helyezett ellenfél Ratingje 107,9, rejtett erősítése +6,6,
  együtt ≈ 114,5;
* az idény állása eközben 28-0-0.

**Az ok** a rejtett erősítés két különböző forrása:

| Hol | Melyik rejtett bónuszoddal számolja az ellenfél erősítését |
|---|---|
| a meccs (`matchHiddenOppBuff`) | az idény elején **befagyasztottal** (`seasonHiddenBonus`) |
| a „mezőny most” szám (`oppMatchStrength`), és rajta keresztül **minden** rés-mérés (`levelGap`) | a **mostanival** (`hiddenMatchBonus`) |

A `levelGap` mérései:

* az 5 fordulós rés-követés;
* a téli felmérés;
* a záró rés, és belőle a következő idény rajtja;
* a panel három doboza.

Idény közben nő a morál (a képen 94, eufórikus), az edző, a taktika és az
aura hatása. A mérés úgy látta, hogy ezzel együtt az ellenfél is erősödik. A
pályán viszont nem erősödött, mert ott a befagyasztott érték maradt.

A következmény: a rés-követés ~0 rést mért, és nem emelt, miközben a
valódi rés +4–5 volt. A záró rés is alulmérte a fejlődésedet, ezért a
következő rajt is könnyebb lett a kelleténél.

**A javítás** (`oppBuffHiddenMost`):

* A futó idényben, a befagyasztástól a bajnokság lezárásáig a „mezőny most”
  és minden rés-mérés ugyanazt a befagyasztott erősítést használja, amivel a
  meccs lemegy.
* Nyáron, tervezéskor (fokozat- és célrés-választás) marad a mostani érték,
  ahogy eddig. A következő rajt úgyis ezzel fagyaszt.
* Ugyanígy igazodik a kihívás-ajánlat győzelem-becslése és a hangolás
  sajátereje-számítása.

**Futó karrierben** a következő 5 fordulós ellenőrzés már a valódi rést
látja. Ha a rés a várt pályánál nagyobb, a napló szól, és az ellenfelek a
következő 5 forduló alatt fokozatosan felzárkóznak.

## 2. Az új ablak: „📊 A nehézség története — mérve, a karrier elejétől”

A nehézségi szint / osztály panel alján, a „📈 Hogyan fejlődött a
csapatom?” alatt nyílik.

**Most:**

* a panel szerinti saját ⚡, „mezőny most” és rés;
* mellette az utolsó 5 bajnoki **tényleges** számai: a te ⚡-od a pályán,
  az ellenfelek ⚡-átlaga, a rés a motorban;
* ha ezek tartósan, legalább 1,5-tel eltérnek a panel számától, figyelmeztet.

**Karrier-görbe:** minden bajnoki egy pont, idényhatárokkal.

* a te ⚡-od a pályán;
* a tényleges ellenfél ⚡;
* a panel „mezőny most” száma.

**Idényenként, a legutóbbitól visszafelé:**

* **Rajt:**
  * a te ⚡-od és az osztályközép;
  * a rés a kalibrálás előtt és után;
  * a mezőny rajt-emelése, a fék;
  * a rés-követés pályája (rajt, várt idény-növekedés, tűrés).
* **5 fordulós blokkok** (1–5, 6–10, …, 26–30). Oszlopok:
  * ⚡ a HUB szerint;
  * ⚡ a pályán;
  * ellenfél ⚡;
  * ellenfél Rating;
  * „mezőny most”;
  * rés a HUB szerint;
  * **rés a pályán**;
  * győzelem–döntetlen–vereség.
* **Események a blokk alatt:**
  * a rés-követés emelése, a forduló megjelölésével;
  * a nyers rés és a várt pálya;
  * ⛰ a téli felmérés;
  * 💉 a boost-adósság.
* **Párharc és kupa** külön sorban; a blokkokba nem számítanak.
* **Zárás:**
  * záró rés, az idény mért rés-változása;
  * az összes boost-adósság;
  * a te ⚡-od az idény végén;
  * helyezés, pont.

**A forrás két napló, nem becslés:**

* **a mérési napló meccsenként:** a te ⚡-od, a ténylegesen pályára lépő
  ellenfél ⚡ (Rating + rejtett erősítés + rés-követés + adósság), a motor
  kezdőrúgáskori különbsége;
* **az idénynapló:** a kalibrálás, a téli felmérés, a rés-követés, a
  boost-adósság, a zárás.

**Rés a pályán** = a motor különbsége − a hazai/idegen eltolás.

**3.9.349-től a napló a kezdőrúgáskor rögzíti** (régebbi soroknál az első
érték a motor különbségéből visszaszámolt, a „mezőny most” pedig üres):

* a pályára lépő ⚡-odat (`mo`);
* a pálya-eltolást (`vn`);
* a panel „mezőny most” számát (`mzMs`);
* az osztályközepet a fejlődéssel (`mz`);
* a személyes eltolást (`off`);
* a párharc-sort is külön jelöli (`pd`).

## Próba

`tools/nehezseg-tortenet-3-9-349-proba.js` (14 állítás):

* egy valódi meccs sorának új mezői;
* a gomb, az ablak, a blokkok, az események, a rajt és a zárás;
* a párharc és a kupa;
* a görbe;
* a figyelmeztetés;
* a blokk-átlag;
* **a hiba javítása:** idényben a „mezőny most” = a meccs erősítése, nyáron
  a mostani.
