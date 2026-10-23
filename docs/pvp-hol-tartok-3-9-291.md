# 📍 „Hol tartok": válasz a társ bökésére (3.9.291)

## A kérés

Ha a társad bökése megjön („… vár rád"), legyen egy gomb, amire
koppintva megkapja, hányadik fordulónál jársz. Így tudja, mennyit kell
még várnia.

## Ahogy működik

* **A bökés sávján** új, kiemelt gomb van: **„📍 Hol tartok"**.
* **A koppintás** a saját állásodat küldi a szoba h2h-ágának
  `pingAllas` rekeszébe, a saját azonosítód alá:
  * idény;
  * lejátszott fordulók;
  * mit csinálsz épp: meccset játszol, forduló előtt állsz, átigazolási
    ablakban vagy, kihívást választasz, kézfogásnál vagy, bevársz, kupában
    vagy, nyári szünetben vagy.
* A sáv és a napló is visszaigazol. A fék 15 másodperc.
* **A váró fél** a következő jelenlét-körben (kb. 8 mp) kapja meg. A
  játék a saját kapujához méri:
  * „Még **2** forduló (az egyiket épp játssza), mire odaér, ahol te
    vársz.";
  * ugyanannál a fordulónál: „már csak az ottani teendőit intézi";
  * előrébb jár: „ő vár rád".
* A számítás idényhatáron át is működik: 30 forduló számít egy
  idénynek.
* A válasz a naplóba is bekerül, kikapcsolt értesítésnél csak oda. A régi
  vagy már látott válasz nem ugrik be újra.

## Csatorna

A h2h ág a Firebase-szabályokban nyitott, ezért nem kell szabálymódosítás.

## Próba

`tools/pvp-hol-tartok-3-9-291-proba.js`.
