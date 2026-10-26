# 🧠 Az edzői elemzés minden meccsre újra jár (3.9.314)

## A bejelentés

> „néha az edzői elemzések nem resetelődnek két meccs között"

## Az ok

Az edzői elemzések száma (`S.edzo.elemzes = {key, db}`) egy **meccs-kulcshoz**
kötött: ha a következő meccs kulcsa más, a számláló nullázódik. A kulcs
azonban két helyen nem volt egyedi.

**Osztályozó.** A kulcs `po` volt, ugyanaz mindkét meccsre. Ha az első
meccsre kérted az elemzéseket, a visszavágóra már egy sem járt.

**Kupák.** A kulcs `e` + a meccs indexe volt. Az index viszont 0-ról indul
újra:

* minden szakasz elején (csoportkör → nyolcaddöntő → negyeddöntő…);
* minden selejtezőkör elején;
* a nyár minden kupájának elején.

Ha például a nyolcaddöntő első meccsére kértél elemzést, a visszavágóra nem,
akkor a negyeddöntő első meccse ugyanazt a kulcsot kapta, és a számláló a régi
meccsé maradt. Ezért jött elő csak „néha".

**Most a kulcs:**

* osztályozóban: a meccs indexe és az ellenfél;
* kupában: a sorozat, a szakasz, a selejtezőkör, a meccs indexe és az
  ellenfél.

Ugyanarra a meccsre a mentés-visszatöltés után sem jár újra elemzés.

## Ami közben előkerült: a meccs-visszaállítás azonosítója

Ugyanez az `e` + index állt a meccs-visszaállítás azonosítójában is
(`mMeccsId`, a frissítésbiztos meccsrekord).

**A hiba:** egy kupadöntő (egyetlen meccs, `e0`) és a nyár következő
kupájának első meccse (szintén `e0`, a forduló mindkettőnél 30) ugyanazt az
azonosítót kapta. A kezdőrúgás így a döntő lefújt rekordját találta, és annak
sorsolását pörgette volna le gyorsítva, élő meccs helyett. Közös karrierben,
ahol egy nyáron több kupa jön egymás után, ez reális eset.

**Most az azonosító:** kupában a sorozatot, a szakaszt és a selejtezőkört is
tartalmazza.

**Átmenet a régi formátumról** (`mEloEgyezik`):

* a régi formátumú, **félbe maradt** rekord továbbra is folytatódik, hogy a
  frissítés ne adjon új esélyt egy megszakadt meccsre. Ez kell a beragadt
  guest helyreállításához is;
* a régi formátumú, **lefújt** rekord nem illik semmire, mert épp az ütközött.

## Próba

`tools/edzo-elemzes-kulcs-3-9-314-proba.js`, 9 állítás, valódi karrierben, a valódi kérő ablakon át:

* a kérés lépteti a számlálót, és az elemzés megjelenik;
* az osztályozó visszavágójára újra jár az elemzés;
* újra jár szakaszváltáskor (azonos index, sőt azonos ellenfél-név mellett is),
  selejtezőkör-váltáskor, és a döntő után a következő kupára;
* ugyanarra a meccsre nem jár újra, mentés-visszatöltés után sem;
* a döntő lefújt rekordja nem illik a következő kupa első meccsére; a régi
  formátumú félbe maradt rekord igen;
* nincs oldalhiba.

**Kapcsolódó próbák:**

* a `kupa-meccshez-3-9-304` az új kulcsformát várja;
* a `forditas-kieses-3-9-311` próba a hiányzó-panelt kihagyja. Ugyanazt a
  visszavágót játssza újra és újra, a lapok gyűlnek, és egy eltiltott kezdő
  miatt a panel a játékosra várt volna. Ez a próba hibája volt, nem a játéké.
