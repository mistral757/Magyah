# 🛟 A lefújás utáni lánc nem állhat meg némán (3.9.309)

## A bejelentés

> „A nyári kupában negyeddöntő második meccse után elakadt a guest. Nem
> engedi őt tovább. Nem ad be neki várakozó képernyőt, semmit. Csak ott
> ragadt a meccs végi résznél. […] Host közben az idény indításra vár
> HUBban."

## Amit megvizsgáltam

### 1. A kupa logikája, a felület nélkül

A kupa-motor saját könyvelőjével (`euroFinishUserMatch` +
`euroAfterUserMatch`), a csoportkörtől a döntőig:

* egyjátékos módban;
* PvP-szobában egyedül játszott tornán;
* közös tornán, **két klienssel** a helyi szoba-háttéren:
  * a host a nyolcaddöntőben kiesik, a vendég továbbjut a döntőig;
  * illetve a vendég a negyeddöntőben kiesik.

**Eredmény:** nincs kivétel, a kör-lezárás kézfogása rendben megy, és a
vendég megkapja, hogy a host kiesett.

### 2. A valódi felület, a valódi motorral

A negyeddöntő visszavágója 14 alkalommal, egyjátékos és PvP-szobás
változatban:

* „⚽ Irány a meccs” → 🔍 Felkészülés → ⚽ Kezdőrúgás;
* lefújás → jutalom-skillek → talizmán-húzás → mérleg → a „🏆 Ugrás a kupa
  HUB-ba” gomb.

**Eredmény:** minden futás vagy eljutott a továbblépő gombig, vagy egy
jutalom- vagy húzás-ablakon várt a játékosra. Oldalhiba egy sem volt.

**A pontos ok nálam nem reprodukálódott.** Ami biztos: a lánc **három
helyen** el tudta nyelni a folytatást úgy, hogy semmi nem látszott. Ezeket
zártam le.

## A három védőháló

| hely | eddig | mostantól |
|---|---|---|
| a mérleg-ablak (`mstatShow`) | rajzolási hibánál rejtve maradt, de a lánc csak a bezárásával megy tovább, ezért néma állás lett | kinyílik egy rövid szöveggel, és a „Tovább” viszi a láncot |
| „meccsről meccsre” (`euroHoldStart`) | a kupa léptetése védőháló nélkül futott, hibánál a meccsképernyő maradt | a tartás védőhálóján megy: hibánál a kupa-nézet jön elő |
| a kör lezárása (`mpCupTieSync`) | ha már futott, az újabb hívás némán visszatért: nincs réteg, nincs továbblépés | a várakozó réteg a kiúttal újra előjön |

## Ha mégis beragad

**Az oldal újratöltése** (F5, vagy az app bezárása és újranyitása) a
lefújás utáni kört **pontosan onnan** folytatja (`S.utoMeccs`). A jutalmak
ugyanazok, az eredmény már a tabellában van.

**Ha ez sem segít,** a kezdőlap 🧪 Diagnosztika → 📋 Másolás tartalmát kérem
elküldeni. Ebből kiderül, melyik közös folyamat áll.

## Próba

`tools/vedohalo-3-9-309-proba.js`, hibát erőltetve mindhárom helyen:

* a mérleg-ablak kinyílik, és a bezárása továbbvisz;
* a „meccsről meccsre” léptetési hiba után előjön a kupa-nézet;
* a már futó kör-lezárás újabb hívása a várakozó réteget mutatja;
* nincs oldalhiba.

A kapcsolódó 38 kupa-, PvP- és lánc-próba zöld.
