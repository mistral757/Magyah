# ⚖️ Nagy különbségnél: maradunk / befejezzük / osztott nehézség (3.9.316)

## A kérés

> „Az ilyen eseteknél ahol ennyire jelentős a különbség a két csapat között
> szezonindításkor, ott legyen egy olyan, hogy az indítás pillanatában,
> amikor mindketten rányomtak a gombra, akkor felajánl egy lehetőséget a gép:
> a következő szezont két külön nehézségi szintű mezőnyben játszátok le. Aki
> le van maradva, az a nehézségi szinthez mért legkönnyebb célrést kapja, aki
> pedig előrébb, az a legnehezebbet. Ez egy igazságtalan felosztás, de
> legalább van esély a tényleges kiegyenlítődésre. Szóval ezt akkor dobja be,
> ha a legalább -2 és +2 szintű a különbség a kettő között indításkor. A
> bedobott üzenet 3 lehetőséget adjon: 1. maradunk a mostani erőknél, 2.
> Befejezzük a párharcot itt, győzött az erősebb, 3. Az új lehetőség a
> kiegyenlítődést segítendő. A párharcot ilyenkor is lejátssza a két csapat
> 15. és 30. fordulóban, és ilyenkor is tabella szintjén egy mezőnyben
> játszanak, csak a konkrét nehézségi szintek a másak."

A kiváltó helyzet (képernyőkép): a közös mezőny ~104,3, a te résed −3,8, a
társadé +8,2.

## Mikor jön elő

**A pillanat:** a közös kezdőkapunál (`mpSeasonGate`), amikor **mindkét**
indító rekord fent van, vagyis mindketten rányomtatok az indításra.
Piramis-karrierben, a padlós (célrés) rendszerrel, a 2. idénytől.

**A feltétel:** a két becsült rés egyike **legfeljebb −2**, a másik
**legalább +2**.

**A becslés** a kézfogás számaiból készül:

* a két súlyozott meccs-erő (záró és indító, ×1,25);
* a két vállalt célrés;
* a közös világ mostani szintje.

**Mindkét gép ugyanazt a két számot kapja, csak tükörben.** Ezért mindkettő
pontosan ugyanakkor kérdez, és egyik sem marad egyedül egy kérdésnél.

**Régi társnál nincs kérdés.** Ha a társ kliense még nem ismeri a funkciót
(az indító rekordjában nincs `osztV`), egyik gép sem kérdez, mert a régi
kliens sosem válaszolna, és a kapu beragadna.

## A három lehetőség

**A döntés közös.** Mindkettőtök választása a szobába megy (`s<N>oszt`),
és **csak az egyező választás dönt**. Addig mindketten látjátok a másik
választását, és bármelyikőtök átválthat.

**Újratöltés után** a kapu ugyanide hoz vissza, a választások megmaradnak.
A már eldöntött választás (`S.mpOsztDont`) nem kérdez újra.

### 1. 🤝 Maradunk a mostani erőknél

Semmi nem változik: a közös mezőny marad, ahogy beállt.

### 2. 🏁 Befejezzük a párharcot — győzött az erősebb

A közös hajsza véget ér. **A győztes a nagyobb súlyozott meccs-erejű csapat.**

**Az összegző ablak** mutatja:

* a két meccs-erőt;
* az idényenkénti pontokat;
* a párharcok összesítését.

**Ebben a szobában új közös idény nem indul.** Az „Irány az idény” gomb
ezután az összegzést hozza. A karrier megmarad.

### 3. ⚖️ Osztott nehézség — a kiegyenlítődésért

**A célrés szerepek szerint:**

* **a lemaradó** a fokozata **legkönnyebb** célrését kapja (a fokozat
  célrése +0,5);
* **az elöl álló** a **legnehezebbet** (a fokozat célrése −0,5).

**NEM KÉT VILÁG.** A közös világ ugyanúgy áll be a kezdőrúgáskor, mint
felosztás nélkül: a gépi csapatok ereje, a gépi meccsek, a tabella és a piac
közös marad. Ez a lényeg, mert így a két gép tabellája nem csúszhat szét.

**Hogyan hat:** a SAJÁT bajnoki meccseiden az ellenfél kap egy személyes
eltolást. Ez ugyanazon a csatornán megy, ahol a mért rejtett bónuszod fele is
ül (`matchHiddenOppBuff` / `oppMatchStrength`). Az eltolás pontosan akkora,
hogy a rajt-résed a célod legyen:

```
eltolás = (a súlyozott meccs-erőd − a közös mezőny) − a cél rajt-rése
```

**Amire nem hat:**

* a kupa;
* az osztályozó;
* a **15. és a 30. fordulós párharc**: ott a két kliens közös
  eseménylistája dönt, ahogy eddig.

**Időtartam:** egy idényre szól. A következő kezdőkapunál újra eldől.

**Run és HUB:** az idény JÁTSZOTT célrése a személyes. A Run-szint így a
valódi nehézséget számolja (a lemaradó könnyebb idénye kevesebbet, az elöl
állóé többet ér), és a HUB is ezt mutatja.

**Az idény végi tanulás:** a rés-mérés, amiből a következő idény rajt-célja
tanul, a KÖZÖS mezőnyhöz mér, a személyes eltolást kivonja. Így a felosztás
nem torzítja a világ jövő évi fejlődését.

**A naplóban** a kezdőrúgáskor egy sor írja ki:

* a szerepet;
* az eltolást;
* a rajt-rést;
* hogy a tabella és a két párharc közös marad.

## Mentés

* `S.mpOsztDont` = `{season, c}`: a választott lehetőség.
* `S.mpParharcVege`: a lezárt párharc. Mezői: `season`, a két súlyozott
  meccs-erő, a két becsült rés és a győztes.
* `S.pyr.osztottKell` (a döntés után) és `S.pyr.osztott` (a kezdőrúgás után):
  `{sn, szerep, cel, rajt, gap, off}`.

## Próba

`tools/osztott-nehezseg-3-9-316-proba.js`, 16 állítás, a játék helyi
szoba-hátterén:

**A becslés:**

* tükörszimmetrikus;
* csak −2/+2 fölött kérdez, régi társnál nem.

**A felajánlás:**

* három lehetőséggel jelenik meg;
* eltérő választásnál nem dönt, és kiírja a társét;
* egyezőnél dönt, a döntés a szobába és a mentésbe kerül;
* a lemaradó a legkönnyebb, az elöl álló a legnehezebb célrést kapja;
* a már eldöntött választás nem kérdez újra.

**A kezdőrúgás (osztott nehézség):**

* kiszámolja az eltolást, és vele a rajt-rés pontosan a cél;
* a motor és a kijelzés ugyanannyival változik;
* párharc-fordulóban és kupában nem hat, a következő idényben lejár;
* **a közös világ szintje ugyanaz, mint felosztás nélkül**;
* a játszott célrés a személyes.

**Maradunk / befejezzük:**

* „maradunk”: nincs felosztás;
* „befejezzük”: a társ nyert, a következő idény nem indul, az összegzés
  jön helyette.

**Oldalhiba:** nincs.
