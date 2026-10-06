# 3.9.205 — 🕹️ A Pixel kezdőlapja újra görgethető

> „Telefonos fekvő nézetben nem működik a görgetés. Olyan mintha egy teljes
> layert (amin az infók és gombok vannak) akarnék felhúzni. Pedig ott alul
> vannak még bőven megnyitható szobák, és ott lennének még további
> menüpontok is. […] Ja és ez csak a pixelated verzióban van"

## Az ok

**A 3.9.204 Pixel-élete** a megjelenő nézeteket egy „kirajzolódó”
animációval hozza be (`pxWipe`, `clip-path`). Az animáció `both` kitöltéssel
futott, tehát a végállapota — `clip-path: inset(0)` — a nézeten MARADT.

**Miért vágott le tartalmat:** a kezdőlap nézete pontosan képernyőnyi magas,
a tartalma (a karrierek, a szobák, a szakaszok, a lábléc) túllóg rajta. A
megmaradt vágás a doboz aljánál levágta a túllógó részt:

* görgetéskor a tartalom elmozdult, de a doboz alatti rész láthatatlan és
  kattinthatatlan maradt;
* ezért érződött úgy, mintha egy egész réteget húznál fel.

**Hol jött elő:** mérve minden méreten (fekvő és álló telefon, asztal), de
csak Pixelben, mert az animáció csak ott fut.

**Ugyanez a hiba** a képcső-animációban (`pxPowerOn`: játékos-adatlap,
ablakok) is benne volt.

## A javítás

**Mindkét animáció `backwards` kitöltéssel fut:** a kezdőállapotot tartja
(nincs villanás az indulás előtt), a végén viszont semmilyen vágás nem marad
az elemen.

## Próba

A `tools/pixel-elet-3-9-204-proba.js` új szakasza (3b) két méreten
(844×390, 390×844) méri:

* a kirajzolódás után nincs vágás a nézeten;
* görgetés után a lap alja (a lábléc) látszik és kattintható.

A próba most **19 állítást** ellenőriz.
