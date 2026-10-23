# ⚖️ Súlyozott mezőny és célrés-becslés egyjátékosban (3.9.289)

A 3.9.287-ben a PvP-hez készült két elem egyjátékos karrierekbe is átkerült:
az idénynyitó célrés-ablak becslése és a súlyozott mezőny-képlet.

## Mi került át

**Súlyozott mezőny (csak új karrierek).**

* Az új piramis-karrier a beállításkor `S.pyr.suly=1` jelzést kap.
* Az idény vége (`nfIdenyVege`) rögzíti a záró NEVEZÉSI meccs-erőt
  (`H[sn].zaroMs`), ugyanabban a mérési ablakban, mint a rés.
* A kezdőrúgás (`pyrFloorKickoff`, egyjátékos ág) a rést nem a nyers induló
  meccs-erőből, hanem a súlyozottból számolja:
  `(induló×1,25 + záró)/2,25`. Így a nyári erősödés ≈44%-a a játékosnál marad,
  a többit a mezőny követi.
* A napló kimondja a három számot; az idény sora (`H[sn].suly`) rögzíti őket.

**Becslés a nyári célrés-ablakban (`nfOffer`).**

* A várható mezőny-szint és hogy mi viszi (a természetes szint vagy a célrés).
* Induló / záró / súlyozott meccs-erő, rajt-rés, idény-átlag, feljutás /
  cím / kiesés esélye.
* „Mit jelent a döntésed": 0,1-gyel nehezebb célrés ≈ 0,1-gyel erősebb mezőny.

## Mi nem került át, és miért

* **Futó karrierek:** a nehézségi szerződésük változatlan, `suly` nélkül
  betűre a régi képlettel futnak.
* **Arányos padló:** PvP-specifikus (két ember tempójának összehangolása);
  egyjátékosban a meglévő padló és fék marad.
* **Társ élő adatai, „már elküldött" rekord, régi kliens:** csak két
  játékosnál értelmesek.
* **Időzítés:** egyjátékosban a becslés a szezonforduló után fut, saját
  számokból, nem előrejelzésből.

## Próba

`tools/sp-sulyozott-3-9-289-proba.js`.
