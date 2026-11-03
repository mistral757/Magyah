# 3.9.363 — a felzárkóztatás a meccs mérlegében

## Bejelentés

> „Egyetlen alkalommal nem kapott még egyetlen játékos sem kiegyenlítési
> lehetőséget párharcnap után. Pedig valaki mindig gyengébb. És soha semmi
> lehetőség... Vagy nagyon el van rejtve, vagy nem működik."

## Vizsgálat

- Élő, kétkliens próbával (saját bajnokság, Könnyed) ellenőrizve: a párharc
  után a kisebb ⚡ meccs-erejű fél megkapja az ajánlatot (`S.felzark`), és a
  HUB-on a Run-mérő alatt a kártya és a gomb megjelenik.
- **1. ok:** a 15. és a 23. forduló utáni párharc-napok el is maradtak (ezt a
  3.9.362 javította, pótlással). Ha nincs párharc, ajánlat sincs.
- **2. ok:** az ajánlat csak a HUB-on, a Run-mérő alatt volt, plusz egy sor a
  naplóban. A meccs utáni felugró mérleg-ablakban semmi nem jelezte, ezért
  könnyű volt nem észrevenni.

## Változás

- `felzAjanl` megjelöli a frissen elkészült mérleget (`V.felz`). Ez a
  mentésbe is bekerül (`S.lastMatch.verdict`).
- `mVerdictFelzHtml(V)`: a mérleg-ablak alján egy „🆙 Felzárkóztatás" kártya
  jelenik meg, a két ⚡ értékkel, a plafonnal és a mostani ⚡-val. A
  „Felzárkóztatást kérek" gomb ugyanazt a kiválasztót nyitja, mint a HUB-on
  (`felzNyit`).
- A kártya csak addig látszik, amíg az ajánlat él (`felzAktiv`). Vásárlás után
  a nyitott mérleg-ablak frissül.
- Az erősebb fél mérlegében nem jelenik meg.

## Próba

`tools/sajat-bajnoksag-3-9-331-proba.js`, a 15. forduló utáni párharc:
- a gyengébb fél mérleg-ablakában ott a kártya és a gomb, a gomb megnyitja a
  kiválasztót, a vásárlás lefut;
- az erősebb fél mérlegében nincs kártya.
