# 3.9.177 — 🌱 Az Ifiakadémia menüpont

> „A csapatépítés menüben legyen egy ifiakadémia menüpont, ami alatt meg
> lehet nézni az eddig ifiakadémiára visszaküldött ifiseidet pozícióval,
> potenciállal, jelenlegi ratinggel, esetleg plusz információk is lehetnek
> róluk, hogy milyen a jellemük eddig […] ahogy szépen derülnek ki a dolgok
> róluk, úgy azokat lehessen ott követni, lehessen látni, hogy kábé kiket
> várhatsz majd, mennyi idő múlva fognak megjelenni."

## Hol

**HUB → 🏗️ Csapatépítés → 🌱 Ifiakadémia.**

A kártya felirata mindig a mai állapotot mondja, például: „2 tehetség bent ·
1 ballag” vagy „3 tehetség bent · legesélyesebb: Kovács”.

## Mi látszik egy visszaküldött tehetségről

* **Név, poszt, kor.**
* **Rating**, és mennyit nőtt a visszaküldés óta.
* **POT:** eleinte a scout becslése (~), később a pontos érték.
* **A visszaküldés adatai:**
  * melyik idényben, hány évesen, milyen Ratinggel ment vissza;
  * hányadszor maradt bent;
  * hány akadémiai meccsen figyelte már az akadémia.
* **A jelleme:** vérmérséklet, kapcsolódás, karizma. Ami még nem derült ki,
  az lakattal áll ott, és azt is látod, hány meccs múlva derül ki.
* **⏳ Mikor várható:** lásd lent.
* **„Ha most jelentkezne”:** ezzel a Ratinggel érkezne. Mellette, hogy ez
  hogyan viszonyul a kezdő 11-edhez („még messze”, „kezdő 11-es szint”…).
* **🔮 Előrejelzés idényenként:** ugyanaz a doboz, amit a bemutatkozáskor is
  látsz. Lenyitható.

Az elöl álló a hamarabb várható: a ballagó, aztán az idén legesélyesebb.

## Fokozatosan derül ki

Az akadémia meccsről meccsre figyeli a tehetségeit, és a tudás ezzel gyűlik:

| akadémiai meccs | mi derül ki |
|---|---|
| 0 | poszt, kor, Rating, becsült POT (~) |
| 8 | **vérmérséklet**: az edzésen hamar kiderül, ki mennyire forr |
| 16 | **kapcsolódás**: hogyan illeszkedik a többiek közé |
| 24 | **karizma**: a vezetői oldal mutatkozik meg a legkésőbb |
| 45 (másfél idény) | a **pontos POT** |

Amikor valami kiderül, a napló egy sorban szól, például: „🌱 Akadémia:
kiderült Kovács Bence vérmérséklete — HUB → Csapatépítés → 🌱 Ifiakadémia.”
Végigjátszásnál a napló hallgat, a panelen viszont ott van.

Régi mentésben az akadémiai meccsek száma az eltöltött idényekből indul:
idényenként 30.

## Mikor várható

A becslés ugyanazokból a szabályokból számol, amik a játékban ténylegesen
futnak:

* **21 évesen: garantált.** Lejárt az akadémiai ideje, és a következő
  akadémiai ablakban jön az utolsó, „most vagy soha” ajánlat.
* **Idényenként legfeljebb egyszer jelentkezhet.** Ha idén már jelentkezett,
  vagy idén mutatkozott be, leghamarabb a következő idényben jön.
* **Egyébként az idei esély.** Ezt az adja meg, hány akadémiai ablak van még
  hátra (minden 4. forduló), és milyen eséllyel tér vissza valaki a mentettek
  közül. Ez az esély a jelentkezhetők számával nő (legfeljebb 65%),
  egyenletesen oszlik meg köztük, és a játéktempó is szoroz rajta.
* **A ballagás ideje** („legkésőbb N idény múlva”) mindig ott áll mellette.
* **Ha az akadémia be van fagyva** (kihívás-büntetés), azt is kiírja.

## A panel csak számol

A „ha most jelentkezne” Rating ugyanaz a szabály, ami a visszatéréskor lefut
(a kezdő 11-ed nyers erejéhez és az akadémián töltött évekhez mér). A panel
viszont **semmit nem módosít**: a Rating, a csúcs és a POT változatlan marad,
akárhányszor nyitod meg.

## Próba

`tools/ifiakademia-3-9-177-proba.js`, 21 állítás:

* a menüpont és az üres állapot;
* az adatok;
* a négy kiderülési lépcső és a naplósorok;
* a várható visszatérés mindhárom ága;
* a panel semmit nem módosít;
* a sorrend, a régi mentés és a mentés;
* a kártya felirata és a szótár.
