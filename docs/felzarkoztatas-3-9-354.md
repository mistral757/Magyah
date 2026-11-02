# 3.9.354–355 — felzárkóztatás: plafon, ötösével, csak a párharc szereplői

> „Amint eléri az ellenfél parharckori meccs erő +1 ratingot az ő meccs
> ereje, nem vehet többet. Ezért egyszerre max 5-öt vehet. És csak olyannak
> adhatja, aki a párharcban kezdő volt, vagy kezdő akart lenni, csak pont el
> volt tiltva, vagy serulve, vagy csereként be lett hozva a meccsre"

Az alap (ki kapja, ár, lejárat): `docs/felzarkoztatas-3-9-347.md`. Ez a
kiadás három szabályt tesz rá, és a vásárlás módját is megváltoztatja.

## 1. A plafon: a társ párharckori ⚡-a +1

* **A plafon** = a társ ⚡ meccs-ereje a párharcban (`S.felzark.op`, a közös
  pillanatképből) **+1**.
* **A ⚡-od mérése:** a saját, most élő ⚡ meccs-erőd (`teamMatchStrength`),
  ugyanaz a szám, amit a HUB mutat.
* **A vásárlás boostonként mér:** minden egyes boost előtt megnézi, hol tart
  a ⚡-od.
  * Ha elérte a plafont, megáll.
  * A maradék nem fogy el, és Run-pontot sem visz.
  * A napló kiírja: „elérted, a többi nem fogyott”.
* **A plafon elérése után** a kártya ezt mutatja: „✓ Felzárkóztál”. Gomb
  nincs, több boostot nem lehet venni.

## 2. Egyszerre legfeljebb 5

* **Egy vásárlás legfeljebb 5 boost**, akkor is, ha több Run-pontod van
  (`FELZ_EGYSZERRE`).
* **Újra vehetsz**, amíg a plafon alatt vagy, és van Run-pontod. Így a
  plafon közelében kis lépésekben haladsz, és nem lövöd túl.
* **Az ár nem változott:** 1 boost = 0,1 Run-pont.

## 3. Csak a párharc szereplői kaphatják

**A névsort a lefújáskor rögzíti a játék**, csak párharc-meccsen. Benne van:

* **A kezdők, ahogy a felállásban álltak.** Ide tartozik az is, aki kezdő
  akart lenni, de eltiltás vagy sérülés miatt kimaradt: ő a felállásban a
  helyén marad, és a csere csak a meccsre lép helyette.
* **Akit a meccs bármelyik percében lecseréltél.**
* **Aki csereként beállt.**

**A névsor az ajánlattal együtt utazik** (`S.felzark.nevek`, a mentésben is).

**Az ablakban csak ők szerepelnek**, és csak ha ma is a keretben vannak.
Akit közben eladtál, az kiesik.

**Bárki másnak a kérés el van utasítva.**

## 3.9.355 — ötösével, ahányszor akarod, a következő párharcig

> „És miután vett 5öt, vehet újra 5öt, ötösével, ameddig akar a két párharc
> között, amíg ez a feltétel teljesül."

* **Az 5 egy vásárlás korlátja, nem az ajánlaté.** Egy vásárlás után újra
  vehetsz 5-öt, és ezt ahányszor akarod megismételheted.
* **Két feltétel köti:**
  * a ⚡-od még a plafon (a társ párharckori ⚡-a +1) alatt van;
  * van rá Run-pontod.
* **Az ajánlat a következő párharcig él.** A közben lejátszott bajnokik nem
  viszik el (3.9.347–3.9.354-ben még a következő bajnokin lejárt).
* **A következő párharc leváltja:**
  * ha ott megint te vagy az alacsonyabb, új ajánlatot kapsz, új névsorral és
    új plafonnal;
  * ha nem, az ajánlat megszűnik.
* **A 30. forduló utáni párharc ajánlata** a nyáron át él, a következő idény
  első párharcáig.

## A vásárlás új módja

* **A boost közvetlenül, a felzárkóztatás ablakában történik.** Ingyen-zseton
  a Boost-központba már nem kerül, mert ott bárkinek oda lehetne adni, és a
  plafont sem lehetne boostonként mérni.
* **Az ablak:**
  * a párharc szereplői, mindegyik mellett − / + számláló;
  * alul az összesítő, például „4 / 5 boost — 0,4 Run”;
  * a + nem lép 5 fölé, és a még vehető darabszám fölé sem.
* **A boost hatása** ugyanaz, mint a Boost-központ sima boostjáé
  (`applyPlainBoost`): Rating és POT. A boost-adósság szabálya is ugyanúgy
  él.

## Próba

`tools/felzarkoztatas-3-9-347-proba.js` (24 állítás), az új szabályokkal
kiegészítve:

* **Darabszám:** 4,0 Run-nál is legfeljebb 5; a 6 darab el van utasítva.
* **Címzett:** a névsoron kívüli játékos el van utasítva.
* **A plafon:** a ⚡ boostonként 0,4-et lép, és 5-ből 2 után megáll. Csak a
  2 boost kerül Run-ba, és utána nem vehet többet.
* **Az ablak:**
  * a számlálók 5-nél megállnak;
  * a − visszalép;
  * a megerősítés a kiválasztottakra osztja ki.

* **Ismételt vásárlás (3.9.355):**
  * 5, újra 5, majd újra 5 boost, összesen −1,5 Run;
  * egy valódi bajnoki után az ajánlat megvan, és tovább lehet venni;
  * a következő párharc leváltja.

`tools/sajat-bajnoksag-3-9-331-proba.js`: a valódi, két gépes 8. és 15.
forduló utáni párharc után ellenőrzi, hogy a névsor tartalmazza a párharc
teljes felállását, és hogy egyszerre legfeljebb 5 boost vehető.
