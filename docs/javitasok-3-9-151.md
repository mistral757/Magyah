# 3.9.151 — bejelentett hibák és kérések, egy kötegben

Egy hosszabb lista első köre. Ezek a tételek most készültek el; a többi
(egyensúly, ranglista, csereterv-scenariók, fejlődési görbe, fekvő mód,
értesítések, F6b) a következő kötegekben jön.

## ⚡ Párharc: a társ meccs-ereje élőben

> „Továbbra is rosszul van kiírva az ellenfél meccsereje PvPben az egymás
> elleni meccsen. Nem annyi, amennyi ténylegesen."

A közös szimuláció a társ cseréjét (±erő) és kiállítását (−emberhátrány)
beszámítja a gólrátába. A kijelzés viszont csak a SAJÁT oldaladat
követte: a társ ⚡-je a kezdőrúgás száma maradt a lefújásig.

* **Mostantól a csere-esemény viszi az erő-változást** (`dOvr`). A
  véletlen-folyamot nem érinti, a lista többi része betűre ugyanaz.
* **A lejátszás a társ eseményeit is átadja az eredményjelzőnek.** Ezt az új
  `sbSetOppMs` végzi. A kiállításnál a társ saját emberhátrány-tétele vonódik
  le (a pillanatképéből).

## ⏱ A tervezett csere a szabály percének lejárta után

> „Rosszul van timingolva a félidei csere. Még félidő előtt bekerül a
> feedbe."

A motor ötperces vödrökben számol, és a tick elején a `min` már a most
következő vödör VÉGÉRE mutat. A „45. perctől” szabály így a 41–45. vödör
elején futott le, a félidő-sor előtt, és ez mindkét motorban így volt (a helyi
és a párharc közös szimulációja).

**Mostantól a szabály akkor hajtódik végre, amikor a perce lejárt**, vagyis a
következő vödör elején:

* a 45-ös a szünet UTÁN, a 46. percben;
* a 70-es a 71. percben.

## 🌱 Az „Akadémiai tehetség” átigazolási esemény: 18–22 évesek

> „Ratingja oké, életkora botrány. Legyen 18-22 közötti életkoruk."

A húzás eddig a teljes piacból jött, kor-szűrő nélkül. Mostantól 18–22
évesek közül jön, ebben a sorrendben:

1. előbb a poszton;
2. aztán a posztcsoportban;
3. csak ha ott sincs senki, a régi, kor nélküli út.

## 💰 A fejlesztések ára: a referencia fölött a gyöke szerint

> „A scout fejlesztése és már frissen scalelősre állított dolgok ára crazy
> magas lett... Tized annyi kéne legyen. Keretbővítés nem lett meg
> scalelősre állítva."

A 3.9.135 óta a felállásváltás, a stábhely, a scout és az ügynökség ára a
klub éves bevételével **egyenesen** arányos volt. A bevétel viszont a
mezőnnyel együtt nő, és egy scout-csillag nem ér százszor többet attól, hogy
a világ felskálázódott.

* **A referencia alatt** (20 Mrd éves keret) marad az arányos szabály, a
  karrier eleje betűre ugyanaz.
* **Fölötte a gyöke szerint nő:** négyszeres bevételnél kétszeres, százszoros
  bevételnél tízszeres ár, vagyis a régi tizede.
* **A keretbővítés is ezen a kapun megy,** a kezdő kedvezménnyel együtt.
* **A poszt-tanulás és a boostok nem változnak.** Ezek eleve a büdzsé
  *részei*, tehát arányosak maradnak.

## 🎯 Kihívások

**Kivonva** („Rossz kihívás: sebesség plafon nyitás, adj el játékosokat X
árban”):

* **A sebességplafon-nyitás jutalom.** Infinityben a plafon eleve nyitva van,
  máshol is csak a 99-es határon álló emberen érne valamit.
* **Az „Adj el játékosokat X értékben” vállalás.** A saját kereted
  szétárulására ösztönzött, és a célszáma fix volt.

A már elvállalt vagy megígért példányok a régi szabállyal futnak le.

**Új jutalmak** („Talizmán is legyen kihívás jutalom, és az egyenlítő boost
is, és csapatstílus kémia lépések”). Mindhárom csak akkor jön, ha van mire
hatnia:

* **🧿 talizmán-húzás.** Sorba áll, és a következő meccs után 3 közül
  választasz. A 6-os plafon fölött is jár, mert kiérdemelt, nem ütemezett.
* **⚖️ ingyen egyenlítő boost.** Csak egyenlítős stílusnál jön. Közben
  előkerült, hogy az egyenlítő ingyen-zsetonja eddig nem fogyott el (az ár
  0-ra esett, a zseton maradt). Most a végrehajtáskor fogy, és nem viszi az
  idény alapáras darabjait.
* **🧲 +2 fázis a félkész csapatstílus-kémiának.** Ez a gyilkos páros vagy a
  szárny. Ugyanazon az úton lép, mint a választó (`…AddStage`), tehát a
  bejelentés és a kész állapot is ugyanaz.

## 📊 Kiírások

* **Morál:** a HUB morálsora a meccserőt is mondja (`⚡ +1,5 meccserő`), a
  motor képletével (`moraleToOvr`, a csúszkával együtt).
* **Kapitány:** a kapitányválasztó minden sora, a jelenlegi kapitány sora és
  a kezdő kapitányválasztás is kiírja, mennyi meccserőt ad. Két részből áll:
  * **morálon át** — a kezdő morál célértékén keresztül;
  * **rutin** — a pályán, a pillanatképben.

  A mérce a kapitány nélküli csapat.
* **Honnan jött:** a játékoslapon (HUB) a származási klub és idény áll. A
  bélyeg az érkezéskor kerül fel, és onnantól nem változik:
  * draft: a felkínáló klub és idény;
  * klub-start: a klubod;
  * akadémista: a saját akadémia;
  * minden más igazolás: az utolsó klubja a világ kereteiből.

  Régi mentésben ugyanebből a forrásból számolódik.
* **Hiper Szuper Kupa:** neon-lila eredményjelző lassan járó fénycsíkkal.
  Csökkentett mozgásnál a csík áll.

## A próba

`node tools/hibak-3-9-151-proba.js` (9185-ös port), 16 állítás. A
`fejlesztes-arak-proba` az új árszabályt méri (a referencián a régi ár;
alatta arányos; fölötte a gyöke; a keretbővítés is).
