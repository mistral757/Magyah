# 3.9.256 — Boostok, egyenlítő, Iskolateremtő, PvP-kapuk

A felhasználó nyolcpontos listájából hét pont ebben a kiadásban van. A
2. pont (a csapatstílus-rendszer egységesítése) külön dokumentumban áll.

## 1. Iskolateremtő: ha nincs kinek átadni, csillagozás

> „Ha olyan skillt akar átadni, amit nem lehet kinek, mert az a játékos(ok),
> aki(k)nek adhatná, már rendelkezik azzal a skillel, akkor a csillagozást
> indítsa el."

Eddig a sikeres hagyaték-dobás nyomtalanul elveszett, ha nem volt érvényes
tanítvány. Mostantól ilyenkor a mester egy olyan fókuszált tanítványnál indítja
a csillagozást, aki a hagyaték egyik skilljét már kiépítette.

* Ha a képesség csillagozási joga még zárt, ingyen megnyitja, ugyanúgy, mint a
  Villám mesterhármasa.
* Az első csillag-fázist el is indítja.
* A kevesebb csillagú skill élvez elsőbbséget.
* Ez egy hagyaték-egységbe kerül.

## 3. Attribútum-boost: a boostolt pont megmarad

> „Egy 240-es játékosom passz attribútumát boostoltam fel 410-re, és 1 meccsel
> később […] kb. 280."

**Az ok:** a boost a kemény plafonig engedte az attribútumot. Az első meccs
utáni attribútum-lépés (`bumpAttr`) viszont a specializációs sávba vágta
vissza, és a boost tartós edzés-csatornája is ebbe a falba ütközött.

**A javítás:** a boosttal szerzett pontok (`attrBoostPlus`) a saját tengelyükön
a sáv tetejét is kitolják. Ami a kijelzőn megjelent, az marad, és a tartós
edzés is tovább tud építeni. A mező a mentésben is megmarad.

A már elveszett pontokat nem lehet visszaadni, mert a mentésben nincs nyomuk.

## 4. Egyenlítő: amit a felület mutat, abból számol

> „Ez egy régi egyéni csapat, és úgy tűnik, mintha ezt nem tudná kezelni, mert
> Messit 106-nak látja."

Az egyenlítő eddig a nyilvántartás alap-Ratingjéből (`startRating`) számolt. A
játék viszont mindenhol a pályán lévő példány Ratingjét mutatja: az alap plusz
a skillek, díjak, bajnoki kártya és hangolás. Régi karriereknél a kettő 20+
ponttal is elválhat.

Mostantól:

* a célszám a **megjelenített** Ratingekből jön;
* az alap-Rating úgy áll be, hogy egyenlítés után mindenki pontosan a közös
  számon álljon (alap = közös szám − a saját, megmaradó bónuszai);
* a megerősítő és az előnézet is a megjelenített számot írja.

## 5. 🌟 Fénykor, öreg róka −25%, ifi-boost + attribútum

**🌟 Fénykor (új boost):**

* **Kinek:** 24–30 éves játékosnak.
* **Ár:** az ifi-boost 98%-a.
* **Hatás:** a régi öreg róka teljes ereje, +6–12 Rating és +1200–3000 POT (a
  mezőnnyel skálázva), nyugdíj-halasztás nélkül.
* **Próbaidő:** a boost utáni első teljes idény (nyári boostnál a most induló,
  idény közbeninél a következő).
* **Feltétel:** az idény végén a szezonkártyák mércéjével legalább 10 meccs és
  egy ezüst-szintű idény kell. Ezüst-szintű, ha a gól+gólpassz, a meccs embere
  díj, a bravúr vagy a tiszta lap eléri a küszöböt, a tempóval és a
  meccsszámmal vetítve.
* **Ha nem jön össze:** a kapott Rating és POT pontosan levonódik.
* **Jelölés:** 🌟 a keretlistán, a játékoslapon pedig a próbaidő és az
  eredmények.

**🎩 Öreg róka −25%:** a Rating- és a POT-ugrás 75%-ra csökkent
(`OLD_BOOST_NERF`). A katalógus és a panel a valódi sávot írja.

**⚡ Ifi-boost + tengely:** a megerősítőben kiválasztható egy attribútum. Ez
ugyanazt kapja, mint egy 🎯 attribútum-boost, külön ár nélkül:

* azonnali +4–9%;
* tartós edzés-csatorna.

A „nem kérek" is választható.

## 6. Vissza a katalógushoz

Az ifi-, az öreg róka és a Fénykor saját paneljén, valamint a sikeres boost
utáni képernyőn is ott van a **← Vissza a katalógushoz** és a **Még egy …**
gomb.

## 7. 🛒 Tömeges boost (kosár)

> „Kiválasztod melyik, hány darab, és akkor csak nyomogatod. Elosztod, ki
> mennyit kapjon (és milyen attribútummal)."

A Boost-központ tetején új gomb van: **🛒 Tömeges boost**. A menete:

1. **Fajta:** sima, attribútum, POT, összjáték, skill, ifi, Fénykor vagy öreg
   róka.
2. **Darabszám:** 1–30.
3. **Elosztás:** játékosonként +/− gombokkal.
   * Az attribútum-boostnál soronként tengely-választó van.
   * Ugyanaz a játékos több tengelyen is kaphat („+ új tengely").
4. **Megerősítés:** tételes összegzés és várható ár.

A végrehajtás darabonként, ugyanazon az úton fut, mint az egyes boost. Minden
darab a saját pillanatnyi árán megy: az ingyen-zseton, a talizmán-kedvezmények
és az öreg róka játékosonkénti drágulása mind él. Ha a pénz elfogy, a maradék
elmarad, és ezt a záróképernyő meg is mondja.

## 8. PvP: nem várunk ott, ahová a társ úgysem jön

> „Lement a kupasorozat, utána a hamarabb kieső megy nyári kupára. Ott ne
> kelljen várnia a másikra. Vagy: szétválunk, mert nem jut be az egyik a
> BL-be, a másik igen."

A régi jelzőfény csak azt látta, ha a társ egy másik kapunál vár. Ha a társ
közben egy másik kupában meccseket játszott, a kupa belső kapui a türelmi idő
végéig álltak.

**Mostantól mindkét gép kiírja a szobába, hol tart:**

* melyik sorozatban van;
* a nyári program hányadik lépésénél jár;
* szétvált-e a közös ága;
* véget ért-e a programja.

**Ezt minden körben elolvassa:**

* a csoportzárás;
* a kieséses kör;
* a hazai kupa-lánc.

Ha a társ bizonyíthatóan máshol jár, a játék azonnal továbbmegy, szétvált
ággal. Ugyanott tartó társnál és régi kliensnél a régi viselkedés marad: várunk.

A szezonindító kapu (közös nehézség-alku) szándékosan közös marad. Ott a két
gépnek egy számban kell megegyeznie.

## Próba

`tools/boost-javitasok-3-9-256-proba.js`, valódi böngészőben. Mind a hét pontot
méri:

* sáv-tető;
* egyenlítés a megjelenített Ratingre;
* a Fénykor ára, sávja, korhatára, próbaideje (megtartás és pontos levonás);
* az öreg róka 75%-a;
* az ifi tengely-választó;
* a vissza-gombok;
* a kosár (7+2+1 elosztás, pénzkorlát);
* az Iskolateremtő csillagozása;
* a PvP-helyzet öt esete.

A `boost-mezony-3-9-216-proba.js` az öreg róka új (75%-os) sávját várja.
