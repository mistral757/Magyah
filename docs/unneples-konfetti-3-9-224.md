# 🎉 Az ünneplő képernyő: konfetti és témák (3.9.224)

## A bejelentés

> „Bugos a bajnokin, kupában, bármilyen ünneplős kijelzőn a konfetti. De ha
> már itt járunk, kicsit formáljuk olyanná, hogy illjen jobban a témákhoz.
> Pl. A pixelated egyáltalán nincs megcsinálva olyanra."

## A hiba oka

A Pixel téma minden CSS-animációt `steps(6)`-ra kényszerít (a „szaggatott
mozgás"). A konfetti egy 126 vh-s esés volt egyetlen animációban — hat
lépcsőben ez hat **fix** magasság, és mivel a kezdő- és a végpont minden
darabnál ugyanaz, a hat magasság is: a darabok **sorokba álltak**, a 720°-os
forgás pedig 120°-os ugrásokban ferdén torzult.

## Az új konfetti — három réteg

| Réteg | Mozgás |
|---|---|
| `.cf` | az esés (egyenletes) |
| `.cf b` | lengés jobbra-balra (oda-vissza, lassuló fordulóval) |
| `b::before` | a darab maga: térbeli pörgés (`rotate3d`) — élére fordulva elvékonyodik, mint a papír |

## Témánként

| Téma | Konfetti | Kártya |
|---|---|---|
| Sötét-arany | téglalap, szalag, flitter, fénylő fólia — a sorozat színeiben | változatlan (arany alap) |
| Törtfehér | tépett papírfecni (sorsolt szélekkel), papírszalag, lyukasztó-pötty; matt nyomdaszín, lassabb, szélesebb lengés | krém nyomat, Anton plakátbetű, festékszínű keret és cím |
| Noir | ezüst lapok, csillanó szalag és flitter (a fény fel-felvillan rajtuk) | fekete kártya, ezüst keret, Anton, színtelen jelvény és serleg |
| Pixel | 4/8 px-es pixelek, 90°-ot bukfencező pálcák, villogó pixelcsillag — a 16 színű palettából; **minden darab a saját képkocka-számával** (~12 kocka/mp) lép, így nincs közös sor | 4 px-es pixelkeret, kemény vetett árnyék, raszteres háttér, pixelbetűs cím fekete körvonallal |

A sorozat színe minden témában a sorozaté marad, csak lefordítva
(`trophyThemeColors`): Törtfehérben sötétebb festékre, Noirban ezüstre,
Pixelben kézzel választott palettaszínekre (`TROPHY_PIX` — a legközelebbi
szín az aranyból barackot csinálna).

A „szaggatott mozgás" kapcsoló kikapcsolva a pixeldarabok simán hullanak.
Mozgáscsökkentést kérő készüléken a konfetti nem jelenik meg.

## Próba

`node tools/unneples-konfetti-proba.js` — 16 állítás.
