# 3.9.364 — a célrés meccs-erőben: a kiegyenlítés nem jöhet rá utólag

## Bejelentés

> „A célrés belövésnél minden esetben a meccs erő legyen kiírva az ellenfél
> erejénél is. Amiben nem csak a csapatok nyers ereje, hanem a játékos
> csapatának meccserő extráihoz tartozó meccserő kiegyenlítő értéke is benne
> van. […] a számolás stimmelt, csakhogy a nyers erőt lőtte be az én
> meccserőmhöz képest -0.5-re. így mire elindult a szezon addigra a
> kiegyenlítő meccserő boost mértékével erősebb lett minden csapat az
> enyémnél, ami ezesetben 16! Rating pontot jelentett."

## Az ok

A motor minden bajnoki ellenfélre ráteszi a ⚖ kiegyenlítést. Ez a rejtett
meccs-bónuszod (taktika, stílus, morál, edző, aura, talizmán…) fele, és az
idény elején befagyasztják (`S.oppBuffH`).

- **Nyáron** (amikor `seasonClosed` igaz) a célrés-ablak a mostani bónuszoddal
  számolt. Ezért stimmelt az ablak.
- **A kezdőrúgás** (`pyrFloorKickoff`) a `startNextCareerSeason`-ben már a
  feloldott idényben fut. Ott az `oppBuffHiddenMost` a **tavalyi**, egy éve
  befagyasztott értéket adta, és a mostanit csak a kalibráció **után**
  fagyasztotta be.

Ha nyáron az extráid nőttek, a mezőnyt a régi, kisebb ⚖-vel lőtte be a
célrésre. A szezon első meccsén a különbség fele mindenkire rákerült.

Reprodukálva: a rejtett bónusz nyáron 3,2-ről 23,2-re nőtt. A kezdőrúgás
+5,4-es rést mért, a szezon valódi rése viszont −4,6 lett. Ez 10 meccs-erő
különbség, ugyanaz a jelenség, mint a bejelentésben.

## Javítás

- A kalibráció előtt rögzül a mostani ⚖, két helyen: a
  `startNextCareerSeason`-ben a kezdőrúgás előtt (ez a régi szuperliga-ágat
  is lefedi), és a `pyrFloorKickoff` egyjátékos/saját bajnokság ágában. A
  rés így ugyanazzal a kiegyenlítéssel mér, amivel az idény megy. A
  folyamatos rés-követés rajtja (`nfKovIndit`) is ezt látja.
- Az ablak egyjátékos és saját bajnokság módban (`celresSoloSajat`) a ⚖-t
  pontosan a motor képletéből veszi (`hiddenMatchBonus()` fele). Eddig a
  ⚡ − csapaterő közelítésből jött.
- **Bontás az ablakban** (`celresBontasHtml`), mindkét oldal meccs-erőben:
  - Te: nyers X + meccs-extra Y = ⚡
  - A mezőny: nyers A + ⚖ kiegyenlítés B (az extráid fele) = ⚡
- A rés a két ⚡ különbsége. A fő szám a mezőny ⚡-ja, és utólag semmi nem
  jön rá.
- A legjobb-felállás keresés gyorsítótárának kulcsába (`msPotSig`) az edző
  is bekerült. Edzőcsere után így nem marad 5 mp-ig a régi ⚡.

## Közös (h2h) karrier

Ott a kalibráció a kézfogás két rekordjából fut, nem a befagyasztásból. Erre
a hiba nem hatott.

## Próba

`tools/celres-meccsero-3-9-364-proba.js`:
1. a kezdőrúgás rése megegyezik a szezon valódi résével;
2. az ablak ⚡-mezőnye a valódi ellenfél-⚡ (±0,6; a mezőnyszint egészre
   kerekít);
3. a ⚖ az ablakban a motoré;
4. a bontás kiírva;
5. nincs oldalhiba.
