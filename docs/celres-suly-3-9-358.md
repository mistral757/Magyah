# 3.9.358 — a célrés-ablak kimondja a súlyozást

> „Könnyed módban vagyok. A célrés mértéke közös, de mindenki a saját
> ligájában indul majd. Azaz ha én most -0.1et állítok, akkor a mezőny ereje
> 135.2-re kellene hogy álljon... […] Vagy itt a 126.1 az egy olyan érték,
> amihez majd még hozzájön az ellenfél kiegyenlítő erőnövelése? Ha igen,
> akkor oké, de ne ez legyen már kiírva..."

## Mi történt

**A kiírt ~126,1 a mezőny VÉGSŐ meccs-ereje**, a ⚖ kiegyenlítő erősítéssel
együtt. Erre már nem jön semmi.

**A 135,2 és a 126,1 közti különbséget a súlyozott képlet adja**
(3.9.287 PvP, 3.9.289 egyjátékos). A mezőny nem a mostani ⚡-odhoz áll be,
hanem a tavalyi ZÁRÓ és a mostani INDÍTÓ ⚡ súlyozott átlagához, ahol az
indító 1,25-szörös súlyt kap.

A bejelentett számokkal (a záró ⚡ a képletből visszaszámolva):

| | |
|---|---|
| indító ⚡ | 135,1 |
| tavalyi záró ⚡ | 114,7 |
| súlyozott: (135,1 × 1,25 + 114,7) / 2,25 | 126,0 |
| rajt-cél (célrés −0,1, mért rés-változás −0,1: −0,1 − (−0,1)/2) | −0,05 |
| a mezőny ⚡-a: 126,0 + 0,05 | **126,1** |

* **A nyári fejlődés** +20,4 volt, ennek 44%-a (+9,1) a tiéd marad. Ezért
  indulsz +9,0-val a mezőny fölött.
* **Az 5 fordulós rés-követés** ezt a valódi rajt-rést viszi tovább, nem
  vonja vissza.

## Mi változott

* **A célrés-ablak dobozában** a becslés alatt egy „🧮 Miért nem ~135,2?”
  sor áll, amikor a súlyozás számít. Benne van:
  * a képlet a te számaiddal;
  * a nyári fejlődés, és hogy abból mennyi marad a tiéd;
  * hogy a kiírt szám már a ⚖-tel együtt értendő.
* **Záró ⚡ nélkül** (az első idény, vagy régi szerződésű karrier) a sor nem
  jelenik meg, mert ott a mezőny a mostani ⚡ − célrés.
* **A számítás nem változott.** A doboz eddig is pontosan azt írta ki, amit
  a kezdőrúgás beállít.

## Próba

`tools/celres-suly-3-9-358-proba.js` (4 állítás):
* a bejelentett számokkal a becslés pontosan 126,1;
* a bontás szövege;
* záró ⚡ nélkül 135,2, magyarázat nélkül;
* nincs oldalhiba.
