# 1.0.6.0.00 — a célrés-lánc tartósan mér, a rajt-cél a minimum

## A bejelentés
+0,65-ös célrés mellett a rajt-rés −6,4 („Brutális"), a nyári üzenet pedig „a
mezőny 128"-at írt egy 235-ös meccs-erejű mezőnyre. „A célrést a forma nélküli
meccserőhöz kell mérni, mert a forma nullázódik szezon végén. És a morál is
visszaesik. […] Nem jöhet ki a végén ilyen eredmény semmiképp."

## Amit találtunk
1. **A célrés az idény átlagára szól** (ez marad — a felhasználó döntése): a
   rajt-cél = célrés − a mért idénybeli rés-változás fele (legfeljebb 10). A
   +0,65 − 14/2 ≈ −6,4 ebből jött — de ezt semmi nem mondta ki.
2. **A mért változás felfújt volt:** a záró rés és a záró meccs-erő az idény
   végén, a magas morállal, a lendülettel és a kapitány-lökettel készült.
   Nyáron ezek visszaállnak — a „várt elhúzás" így a valósnál nagyobb lett, és
   a súlyozott mezőny (záró + indító) is túl erős csapathoz emelt.
3. **A rajt a rajt-célnál keményebb is maradhatott:** a régi alsó fék csak a
   holtsávon túl, és legfeljebb egyévnyi ütemmel vett vissza.
4. **A nyári üzenet** a nyers Ratinget írta, minden más meccs-erőben beszél.

## A javítás
- **Tartós meccs-erő** (`msTartosKorr`): a nevezési meccs-erő az átmeneti tagok
  (kapitány-löket, esemény, lendület, formaesés) nélkül, a morál az idény
  eleji alapszinten. Ezzel mér az idény vége (záró rés → a tanult változás) és
  a záró meccs-erő (a súlyozott mezőny). A tartós forma a ⚡-ban eleve nincs.
- **A súlyozás csak könnyíthet** (`mpMsSuly` = min(indító, átlag)): a nyári
  fejlesztés fele a tiéd marad, de egy magasabb záró érték nem nehezít.
- **A rajt-cél a minimum** (kétoldalú fokozatokon): egyjátékosban a mezőny
  annyit lép vissza, amennyi kell („🎚 Rajt-igazítás"); közös karrierben a
  közös világ marad, a saját bajnoki meccseiden egy személyes eltolás hozza a
  rést a saját rajt-célodig (`S.pyr.rajtIgaz`, ugyanazon a csatornán, mint az
  osztott nehézség). A világ egész-szintű kerekítése miatt legfeljebb egy
  lépésnyivel könnyebb lehet, keményebb nem.
- **A felület:** a nehézség-panel alatt egy sor — nyáron: mire áll be a rajt
  (a rajt-cél, a célrés, és hogy mennyi van előre beárazva); idény közben: a
  célrés, a rajt-cél és a pálya szerint most elvárt rés. A célrés-ablak
  becslése is a minimum-szabállyal számol. A nyári üzenet meccs-erőben ír, és
  kimondja a rajt-célt.

Próba: `tools/celres-tartos-1-0-6-0-00-proba.js`; igazítva: `nehezseg-3-9-222`
(a régi alsó fék helyett a rajt-célig), `sp-sulyozott-3-9-289` (a záró tartósan).
