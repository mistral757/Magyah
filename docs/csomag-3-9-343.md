# 3.9.343 — párharc 0,1× · automatikus rés-követés · kész skill-jutalom · kupa-visszaút

## ⚔ A párharc tempója 0,1×

> „PvP párharc sebesség beállítása legyen 0.1x."

**Mi volt eddig.** A párharc a régi skála 0,1×-ével ment: az új skálán ez
0,2×, vagyis 3300 ms egy ötperces vödör.

**Mi van most.** Az új skála **0,1×**-ével megy (`H2H_SEB`). Egy ötperces
vödör 6600 ms, egy meccs körülbelül 2 perc.

Az animációs keret is ehhez a tempóhoz igazodik, nem a meccs-csúszkához:
0,1×-en meccsenként 8 jelenet fér bele.

## 🎯 Az 5 fordulós igazítás magától él a 2. idénytől

> „Minden nehézségben 2. szezontól működnie kell az 5 fordulónkénti igazító
> cuccnak, és ne kelljen külön engedélyezni. PvP-ben is figyeljünk arra,
> hogy mindkét kliensen ez fusson."

**Mi van most.**

* A kezdőrúgás (`nfKovIndit`) a folyamatos rés-követést és a
  boost-adósságot **magától bekapcsolja**:
  * minden fokozaton;
  * egyjátékosban és közös karrierben is;
  * futó karrierben a következő kezdőrúgástól.
* Az 1. idény a téli felméréssel fut, ahogy eddig.
* A nyári célrés-ablak bekapcsoló gombja megszűnt.

**PvP.** A kézfogás minden 3.9.343-as kliensről „kéri" a követést.

* **Közös (Hardcore) bajnokságban** csak akkor indul, ha mindkét gép kéri.
  Ha a társ régi kliens, a napló kimondja, hogy abban az idényben nem él.
* **Saját (Könnyed) bajnokságban** mindkét gép a saját világában futtatja.

## 🎖 A skill-jutalom: kész képesség, a te választásod

> „Skill jutalomnál minden játékmódban teljes skillt kapjunk, és tényleg
> lehessen kiválasztani, ki kapja, és lehessen választani, melyik
> kategóriából."

A skill-kapu (`grantSkillDecide`) minden módban, laza és realisztikus
módban is, így működik:

1. **Választó:** a **🎲 sorsolt képesség** egy koppintással, vagy egy
   **kategória** (Kapus, Védő, Középpályás, Csatár). Csak olyan kategória
   látszik, amelyben van jogosult játékos.
2. **Címzett:** te választod, ki kapja.
3. **Kész képesség:** minden fázisa megvan. Ez az automatikus kiosztásra
   (`autoAssignSkill`) is áll.

**Kivételek:**

* **Az örökség** és **a stábtag átadása** egy konkrét képességet ad. Ott
  csak az embert választod.
* **A kihívás-büntetés célzás-zára** megmarad, mert az egy vállalt büntetés.
* **A régi, félkész képességek folytatása** sem automatikus már: ott is te
  választasz.

A célzott skill (3.9.335) 2. hatása ezzel okafogyottá vált, mert mindig te
választod a címzettet. A panel ezt ki is írja.

## 🩹 Kupameccs: a hiányzó-panelről a HUB-ba és vissza

> „Kupameccsnél ha sérült vagy kiállított van, és arról a képernyőről ugrok
> a HUB-ba, akkor nincs visszaút a meccshez."

**Az ok.** A kupa „Irány a meccs" gombja után a kezdőrúgás a
közvetítés-nézetből indul. A hiányzó-panelről a HUB ezt a nézetet jegyezte
fel. Visszatérve a **bajnoki** kezdőrúgás-gombot élesítette, a kupáét nem.

**A javítás.** A HUB-ba lépés előtt a sorozat saját képernyője áll vissza:

* a kupánál a kupa-nézet;
* az osztályozónál az osztályozó lapja.

A HUB oda tér vissza, és a kezdőrúgás onnan ugyanúgy indul, a hiányzókat
újra felkínálva.

## Próbák

* `tools/skill-jutalom-3-9-343-proba.js` (5 állítás, új).
* `tools/kupa-meccshez-3-9-304-proba.js`, új állítás. A javítás előtti
  kódon elbukik: euro: false, sim: true.
* Igazítva:
  * `celzott-skill-3-9-335` (a 2. hatás helyett: mindig te választasz, 3/3);
  * `boost-plafon-3-9-318` (futó karrierben is magától él, nincs gomb);
  * `tempo-skala-3-9-266` (párharc 6600 ms);
  * `skill-porgetes-uto` (a pörgetés a `showSkillDraw`-é).
