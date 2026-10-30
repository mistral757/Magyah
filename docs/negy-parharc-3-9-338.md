# ⚔ Négy párharc-nap a saját bajnokságban (3.9.338)

## A kérés

> „Szezonról szezonra folytatódnia kellene annak, ami az elv ebben a
> játékmódban, hogy gyakorlatilag mindenki a maga kis singleplayer játékát
> játssza. […] Lehet, hogy ebben a módban jót tenne, ha több ponton lenne
> lehetőség lekövetni, mennyire vagy lemaradva PvP ellenfeledtől. Minden
> szünet után lenne egy meccs: párharcnapból így összesen 4 lenne, nem 2."

## A menetrend

Minden szünet után egy párharc-nap:

| nap | mikor | hazai |
|---|---|---|
| I. | a 8. forduló (rövid ablak) után | a házigazda |
| II. | a 15. forduló (téli ablak) után | a vendég |
| III. | a 23. forduló (második rövid ablak) után | a házigazda |
| IV. | a 30. forduló (a bajnokság vége) után — ez zárja az idényt | a vendég |

A meccs, a tét és a mérleg ugyanaz, mint eddig:

* közös eseménylista;
* győzelem 3, döntetlen 1 pont;
* párharc-díj;
* morál és taktika-begyakorlás.

A HUB párharc-lapja mind a négy napot mutatja.

## Átállás

* **Rögzítés.** A menetrend az idény **első kezdőrúgásakor** rögzül
  (`S.svPh.r[idény]`).
* **Futó idény.** Ami még a régi, két napos renddel indult (például egy
  most futó 2. idény), az azzal megy végig, a régi kulcsokkal (`svd1/svd2`).
  A következő idény már négy nappal indul.
* **Kulcsok.** Az új rend kulcsai külön vannak: `svq1–4`, illetve
  `"<idény>:q1–4"`. Így a régi és az új adat sosem keveredik.
* **Mindkét gépen frissíteni kell.** A menetrendet mindkét gép a saját
  kezdőrúgásánál rögzíti, ezért **mindketten frissítsetek** az idény előtt.
  * Ha az egyik gépen még a régi verzió fut, az nem áll meg a 8. forduló
    után, a másik pedig hiába vár rá. Ilyenkor a bevárás „Most nem játszom
    le" gombja enged tovább.
  * A verzió-eltérésre a játék figyelmeztet.

## A „5 fordulónkénti ellenőrzés" Könnyed módban

A **folyamatos rés-követés és boost-adósság** (3.9.318) minden **új**
karrierben eleve be van kapcsolva, a Könnyed (saját bajnokságos) módban is.
Ezért nem kaptatok róla ajánlatot: a nyári célrés-ablak csak a régebbi,
nélküle indult karriereknek kínálja fel.

Saját bajnokságban a követés a saját világodban, egyjátékos-szabállyal fut.
Nem kell hozzá a társ beleegyezése, és a párharc-napokat nem érinti.

## Próba

* `tools/negy-parharc-3-9-338-proba.js` (11 állítás):
  * a régi renddel futó idény változatlan;
  * az első kezdőrúgás rögzít, menet közben nem;
  * a négy időpont;
  * a saját kulcsok;
  * a felváltott hazai;
  * a felirat;
  * csak a IV. zár;
  * a mérleg;
  * a párharc-lap.
* `tools/sajat-bajnoksag-3-9-331-proba.js`, új állítások: valódi, két gépen
  lefutó párharc a 8. forduló után. Tükörben ugyanaz az eredmény, utána a
  9. bajnoki jön.

## ⚔ Javítás (3.9.341): az edzői elemzés a párharc-napot elemzi

> „Az edzői elemzés nem a párharcnapot, hanem az utána jövő meccset
> elemezte. Ez nem jó így. Az az elemzés különösen fontos, és ki is
> dolgoztunk rá egy alaposabb rendszert már. Csak be kéne oda kötni."

**Mi volt a hiba.** Az elemzés a soron következő meccset a menetrendből
vette (`edzoKovetkezoMeccs`). A saját bajnokság párharc-napja nem
menetrendi forduló. Amíg esedékes, a menetrend következő sora, vagyis a
következő bajnoki várakozik, ezért az elemzés azt kapta.

**A javítás.** Ha párharc-nap esedékes, az elemzés a párharcot kapja, saját
kulccsal (`svph` + a nap szoba-utótagja). Ez a 30. forduló utáni, utolsó
napra is áll. Az elemzés a már kidolgozott párharc-ágon fut (3.9.305):

* a társ csapatlapjának meccs-ereje, kiegyenlítés nélkül;
* a közös pálya-szabály;
* a társ csapatneve a fejlécben.

A párharc után a következő bajnoki jön, és arra újra jár az elemzés.

**Próba:** `tools/edzo-elemzes-kulcs-3-9-314-proba.js`, két új állítás.
