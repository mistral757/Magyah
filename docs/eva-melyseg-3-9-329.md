# 🎞 Perspektivikus takarás az esemény-animációkban (3.9.329)

## A kérés

> „A tikitaka gólnál nem jól vannak beállítva a játékosok overlapjei. Össze
> vissza fedik egymást. Nem perspektíva szerűen"

## Az ok

Az esemény-animációk figurái a jelenet SVG-jében abban a sorrendben
rajzolódtak, ahogy a sablon felsorolta őket. A takarás így a felsorolástól
függött, nem attól, hogy ki áll elöl. Amíg a figurák a helyükön álltak, ez
nem tűnt fel. Mozgás közben viszont, amikor egy hátul álló figura „lejjebb"
lépett egy elöl állónál, mégis mögötte maradt.

A tiki-takában ez a legfeltűnőbb: négy támadó és két védő passzolgat sűrűn,
egymáshoz közel. Ráadásul a lövő pontosan a középső passzoló mögött, vele egy
vonalban állt, így a két figura szinte teljesen fedte egymást.

## A javítás

### 1. Minden jelenetre: mélység a pillanatnyi talppont szerint

* Minden figura (`evaFigura`) kap egy jelölőt (`data-mely`).
* A lejátszó a jelenet indulásától a lezárásáig **minden képkockán**
  átrendezi a figurákat a pillanatnyi függőleges helyük szerint: ami
  lejjebb áll a képen (közelebb a nézőhöz), az kerül elöl.
* A rendezés csak a figurák egymás közti sorrendjét cseréli. A labda, a
  villanás és a többi díszítés továbbra is a figurák fölött van.
* A futó animációkat nem szakítja meg. Ha a sorrend már jó, a DOM-hoz nem
  nyúl, így nem terheli a gépet.
* A lezáráskor a figyelés leáll.

Ez minden esemény- és skill-jelenetre egyszerre hat, nemcsak a
tiki-takára.

### 2. A tiki-taka új elrendezése

A passzolgató rombusz szét lett nyitva:

| Szerep | Régi hely | Új hely |
|---|---|---|
| bal szélső társ | – | (32, 88) |
| elöl középen | – | (56, 103) |
| jobb oldali passzoló | – | (88, 86) |
| a lövő (hátul, a kapu felé) | a középső mögött | (66, 66) |

* A lövő már nem áll egy vonalban a középső passzolóval (8+ egység eltérés).
* A két védő a rombusz két oldalán üldözi a labdát, és nem lép bele a
  támadók alakjába.

## Próba

`tools/eva-melyseg-3-9-329-proba.js` (6 állítás):

* a rendező a pillanatnyi mélység szerint rendez;
* a labda és a villanás a figurák fölött marad;
* a futó animációk megmaradnak, rendezett állapotban nincs bolygatás;
* a lejátszóban a jelenet alatt végig követ, és leáll;
* a tiki-taka lövője nem áll a középső passzoló mögött;
* nincs oldalhiba.
