# 3.9.171 — ⏯ a frissítés folytatás, nem újrakezdés

> „Az a nagy helyzet, hogy frissítgetéssel lehet csalogatni a játékban. Ha
> meccs közben vagy, sőt ha már lefújták, de még nem lépsz tovább, akkor egy
> frissítéssel, kilépéssel újra lehet kezdeni az adott meccset."

## Az ok

A mérkőzés alatt semmi nem került a lemezre. A lefújás után is csak a
jutalom-lánc legvégén történt mentés (`proceedAfterMatch`). Egy frissítés
ezért a kezdőrúgás előtti mentést töltötte vissza, a meccs pedig új
véletlennel indult. Egy rossz eredmény, egy elmaradt jutalom vagy egy
rosszul sikerült sorsolás egy frissítéssel „visszavonható" volt.

## Az elv

**A frissítés nem ad új esélyt.** Ugyanaz a mérkőzés ugyanúgy játszódik le,
bárhányszor töltesz újra. A lefújás után az eredmény már végleges.

## 1. A lefújás végleges

* **A lefújás pillanatában mentés.** A tabella, a statisztika és a kihívások
  már a lefújáskor lekönyvelték a meccset (a `fullTime` szinkron része). Most
  ez azonnal a lemezre is kerül (`mLefujas`).
* **A jutalom-lánc függőben, rögzített sorsolással.** A mentés a láncot is
  tartalmazza (`S.utoMeccs`): a jutalom-okokat és egy seedet.
  * A lánc minden lépése (skill-jutalom, kémia-lépés, felfedezés, akadémia,
    talizmán, mérleg) a seedből levezetett, saját véletlennel fut (`utoLepes`).
  * A lépésből később induló kód is ezt kapja: a lépésben indított időzítő (a
    skill-pörgetés vége, ahol eldől, ki kapja) és a lépésben kötött
    gomb-kezelő (pl. a csillag fázisszáma a jelölt választásakor)
    (`utoVeletlennel`).
  * A levezetés kulcsa a lépés, a függvény szövege és a sorszáma. Ezért egy
    közben más okból induló időzítő (hang, mentés, animáció) nem tolja el a
    többi sorsolását.
* **A lánc alatt a mentés tart.** A lemezen a lefújáskori állapot marad, a
  függő lánccal. A lánc végén (`utoLancVege`) a tartás felold, és a szokásos
  mentés írja ki a jutalmakat. Védőháló: negyedóra után a tartás magától
  enged.
* **Frissítés a lánc közben.** Az eredmény a tabellában marad, a lánc onnan
  folytatódik: *„⏯ A lefújás utáni kör folytatódik"*. Ugyanazok a sorsolások
  jönnek, tehát ugyanaz a jutalom. Ha másképp döntesz egy választásnál, a
  további lépések a saját, rögzített seedjükkel futnak. Nem lehet addig
  frissíteni, amíg egy dobás jól nem sikerül.
* **A lánc közben nem indul új meccs.** A kezdőrúgás hatástalan, amíg a
  függő kör le nem zárult.

## 2. A meccs közbeni frissítés: folytatás

* **Saját véletlen-folyam.** Kezdőrúgáskor a meccs saját, seedelt
  véletlen-folyamot kap. A motor minden időzítője ezzel fut: a vödrök, a
  hosszabbítás és a büntetőpárbaj is.
  * A hang nem vesz el belőle, mert saját véletlene van (`_hangRnd`).
  * A felület sem vesz el belőle.
* **Élő rekord.** Egy kis, mentési helyenkénti rekord (`<mentés-kulcs>::elo`)
  minden vödör után kiírja a seedet és a lement vödrök számát. Kiírja a
  meccs közben a felületen hozott döntéseidet is (csere az élő
  cserepulton vagy a félidei panelen, a buszsofőr behívása), azzal együtt,
  hogy melyik vödör után.
* **Frissítés után:**
  * a betöltés magától indítja a meccset ugyanazzal a seeddel;
  * gyorsítva lepörgeti a megszakításig, a naplózott döntéseket ugyanott
    alkalmazva;
  * onnan élőben megy tovább: *„▶ Élőben folytatódik"*;
  * a visszajátszás néma, és a félidei panel sem nyílik meg újra, hacsak nem
    épp ott szakadt meg.
* **Kezdőrúgás után, az első vödör előtt frissítve:** *„A mérkőzés újraindul
  ugyanazzal a sorsolással"*. A kezdőrúgás pillanatában ugyanis a lemezre
  kerül a meccs előtti állapot.
* **Végigjátszásnál** nincs külön lefújás-mentés (ott a kör vége ment). A
  rekord ezért a lefújáskor „lefújt"-ra vált, és nem törlődik.
  * Egy közbeeső frissítés után a lefújt meccs ugyanazzal az eredménnyel áll
    vissza (*„A lefújt mérkőzés visszaáll"*).
  * Utána a kormány a tiéd: a végigjátszás megáll.
* **A rekord érvényessége.** A rekord a meccs azonosítójához kötött: mód,
  szezon, forduló, kupa- és osztályozó-index (`mMeccsId`).
  * A bajnoki fordulónál a lefújáskor nő az index, így a következő mentés
    után a rekord magától érvényét veszti.
  * A kupánál és az osztályozónál az index csak a lánc után lép. Ott a
    kezdőrúgás veszi fel a fonalat: ugyanaz a meccs ugyanazzal a seeddel
    indul.
  * Új játék vagy a hely törlése a rekordot is törli.
* **A párharc (PvP) kimarad.** Ott az eredményt a két kliens közös, seedelt
  eseménylistája adja, a helyi véletlen nem dönt.

## Határok, őszintén

* **Meccsen kívüli sorsolások.** A draft-pörgetés, a scout-keresés, a
  talizmán-húzás, az akadémia és az átigazolási események még nincsenek
  állapothoz kötve. A következő lépés ezeknek az átnézése, ugyanezzel az
  elvvel.
* **Nem minden kattintás van lefedve.** A jutalom-képernyőkön csak a lépésben
  kötött `onclick` kezelő kap rögzített véletlent. Egy `addEventListener`-rel
  kötött kezelő nem, mert a leiratkozás miatt az nem csomagolható be
  biztonságosan.
* **A mentés hűsége.** A megszakítás nélküli és a frissítés utáni futás akkor
  azonos betűre, ha a betöltött állapot pontosan az, ami a memóriában volt.
  Egy mentésből kimaradó, de a meccserőbe beleszóló mező eltérést okozna.
  * Ilyenkor az eredmény két frissítés között akkor is ugyanaz, tehát nem
    lehet vele csalni.
  * A próba épp egy ilyen esetet fogott meg a saját gyors beállításában: az
    összhang-kötéseket a betöltés veti el. Ezért a mérce is betöltött
    állapotból indul.

## Próba

`tools/frissites-proba.js`, 22 állítás. Valódi karrier, valódi mentés, valódi
újratöltés a kezdőlapon át: mérce megszakítás nélkül; frissítés a kezdőrúgás
után és a 7. vödörnél (a teljes közvetítés soról sorra azonos); frissítés a
lefújás után (két újratöltés, ugyanaz a jutalom); a lépésből induló időzítő
és gomb-kezelő; végigjátszás.

A motorkód szövegét olvasó régi próbák (`felidei-csere`, `hibak-3-9-151`,
`talizman-f4b/f5/f6a/f6d`) mostantól a `playMatchMotor`-t olvassák: a
`playMatch` a vékony, folytatást kezelő burok lett.
