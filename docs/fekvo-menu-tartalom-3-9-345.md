# 3.9.345 — fekvő telefon és PC: a menü tartalma a középső széles sávban

> „Telefonon, fekvő módban és pc-n minden oldalsó menüsávban szereplő cucc
> úgy jelenjen meg, hogy töltse ki a középső nagy széles részt."

## Mi volt eddig

Fekve (telefonon és PC-n) a HUB két sávból áll: bal oldalon a menü, jobb
oldalon a felállás és a HUB lapja. A menü legtöbb pontja már eddig is a jobb
oszlopba nyílt, például a taktika-, kapitány-, szerep- és edzőválasztó, a
vásárlás vagy az edzésterv. Mérés szerint három fajta tartalom maradt
keskeny:

| Mi | Hol nyílt | Szélesség (1366×768) |
|---|---|---|
| 🎯 Csapatstílus, 🧭 Vezetés (tartalom-csoportok) | **a bal sávban**, a menügombok között | ~270 px |
| 🧿 Talizmánok | a képernyő közepén, a bal sávra is rálógva | 760 px |
| 🧩 Csapat-panel (meccserő, felállás, csere), 🌱 Ifiakadémia | a képernyő közepén | 560 px |
| 📋 Felállás módosítása | a fekvő lap alapszélességén | 520 px |

Közben a középső oszlop ~1040 px széles volt.

## Mi van most

* **Tartalom-csoportok.** A Csapatstílus és a Vezetés törzse a jobb oszlop
  fölött lebeg, annak teljes szélességében, ugyanott, ahol a taktikaválasztó.
  * A cím a bal sávban marad, ez továbbra is ki-be kapcsol.
  * A panel tetején ✕ Bezár gomb is van.
  * Ha a bal sávban másik menüpontot nyitsz, a panel magától becsukódik.
* **Ablakok.** A talizmán-, a csapat-panel-, az ifiakadémia-, az edzői
  elemzés-, a kihívás-, a menetrend- és a HUB-info ablak a jobb oszlopot tölti
  ki. A felső határ 1180 px, ugyanannyi, mint a lapé.
* **Felállásváltó.** A széles lapszélességet kapja.
* **Álló nézet.** Semmi nem változik: a ✕ gomb rejtve marad, a törzs a
  menüben nyílik.

Mérve, 1366×768 (PC) és 844×390 (fekvő telefon):

| | PC | Telefon |
|---|---|---|
| A bal sáv jobb széle | 306 px | 262 px |
| Csapatstílus, talizmán, csapat-panel | 318 px-től 1036 px széles | 274 px-től 558 px széles |
| Felállásváltó | 1060 px | 582 px |

## Próba

`tools/fekvo-menu-tartalom-3-9-345-proba.js`: mindkét fekvő méret, plusz egy
álló kontroll.
