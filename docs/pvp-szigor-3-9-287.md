# 🛡 PvP: idénynyitó célrés, súlyozott mezőny, szigorúság (3.9.287)

> „Két dolog a pvp kiegyenlítésének célzatával: […] 1. … az irány az idény
> gomb megnyomásakor külön dobja fel: válasszon milyen célrést kíván a
> következő szezonra, és legyen ott egy becsült eredmény […] 2. … a célrés
> ezentúl a szezonzáráskori […] meccserő és az új szezon indításkori meccserő
> átlagával számol, úgy, hogy az indításkori súlya x1,25 […] 4. … PvP
> szigorúság: »könnyed«/»hardcore (fejlesztés alatt)«"

## 1. Az idénynyitó célrés-ablak

A 2. idénytől az **„Irány az idény"** a közös szezonindító kapu ELŐTT egy
ablakot nyit (mindkét játékosnál, külön):

* **a célrés választása:** a fokozat-rendszerben a fokozat célrése ±0,5, a
  régi padló-rendszerben a vállalás;
* **🔮 becsült idény:**
  * a mezőny várható szintje, és hogy most mi adja:
    * a képlet;
    * a természetes szint;
    * az arányos padló;
    * az alsó fék;
  * a saját indító, záró és súlyozott meccs-erőd;
  * a rajt-rés, az idényátlag, és ebből a fokozat-tábla szerinti feljutás,
    cím és kiesés;
  * ugyanez a **társadra**;
* **„Mit jelent a döntésed"**: a mezőny a két célrés átlagához áll be, tehát
  a te 0,1-ed ~0,05 a közös mezőnyben.

**Élő adat.** Amíg az ablak nyitva van, a két gép egy előnézetet cserél (a
h2h `s<N>pre` rekeszében). Az előnézet tartalma:

* az indító és a záró nevezési meccs-erő;
* a rejtett tag;
* a célrés;
* a rajt-cél.

A becslés így a társ **pillanatnyi** választásával számol, és ezt ki is írja
(„● élő adat"). Ha a társ még nem nyitotta meg az ablakot, a legutóbbi záró
meccs-erejéből becsül, és ezt is jelzi.

**Lezárás.**

* **„Rendben — indul az idény":** a választott célréssel megy a kapura.
* **„Még maradok a HUB-ban":** nem indít semmit.
* Ha a saját indító rekordod már fent van (a kapu egyszer elküldte), az
  ablak nem nyílik újra, mert a változtatás már nem jutna el a társhoz.

## 2. A súlyozott mezőny

A kezdőrúgás padlója (`pyrFloorKickoff`, közös ág) eddig a **két indító**
meccs-erő átlagából állt be a két rajt-cél átlagára. Mostantól oldalanként a
**záró és az indító súlyozott átlaga** számít:

```
W = (indító × 1,25 + záró) / 2,25
mezőny = átlag(W) − átlag(rajt-cél)        — ha ez a padló fölött van
```

A kérés példája:
* a súlyozott érték (107·1,25 + 100)/2,25 = 103,89;
* +1-es célrésnél 102,89.

**A hatás.** A nyári fejlesztés 1,25/2,25 része (≈56%) lesz ellenfél-erő,
**≈44% a tiéd marad**. Eddig a teljes nyári fejlődés átalakult, ezért nem
érte meg nyár végén építeni.

* **A záró érték** a szezonzáró csomagban utazik (`stats.matchStrN`). Ez
  **nevezési** szám, ugyanazzal a lebutítás-védelemmel, mint az indításkori,
  így a szezon végi kipihentetés nem nyomhatja le a mezőnyt.
* **A kézfogás rekordja** viszi a lezárt idény záró értékét (`mz`, `mzV:1`).
* **Csak ha mindkét rekord hozza.** Egy régi verziójú társnál mindkét gép a
  régi képletet futtatja, így a két világ nem válik szét.

### Az arányos padló (a „számított fejlődés" finomítása)

A mérések a `meres-adat` ágról származnak (14 karrier, 36 idény):

* **a saját meccs-erő arányosan nő:** az idény alatt medián +21%, a szinttől
  függetlenül;
* **a mezőny természetes üteme abszolút:** ~6–7 Rating idényenként.

85 körül a kettő együtt mozog, 200 fölött a természetes padló gyakorlatilag
eltűnik. A PvP-padló ezért:

```
padló = tavalyi rajtszint × (1 + ütem / 85)
```

* 85-ön ez betűre a régi, fölötte a szinttel nő.
* Csak azonos osztályban él (fel- és kiesésnél az osztály szintje a mérce).
* A fék zónájában (a holtsáv alatt) sem él: akkor a világ megvár.

## 4. A szigorúság

**A választás.** A szoba létrehozásakor, a sebesség után:

* **Könnyed:** mint eddig, plusz az 1–2. pont;
* **Hardcore (fejlesztés alatt):** szakaszos közös seed és kézfogás minden
  szakaszhatáron (lásd: `docs/pvp-hardcore-3-9-288.md`). A felület kimondja,
  hogy ez meghosszabbítja a játékidőt.

**Hol utazik.**

* A szoba alaprekordjába új mező nem írható (a Firebase-szabály elutasítja).
* A **h2h `cfg` rekeszébe** kerül a létrehozáskor. A lobby és egy újratöltött
  házigazda innen olvassa.
* A **beállítás-csomagba** (`start.settings.szigor`) kerül az induláskor. A
  vendég innen veszi át.
* A karrierben az `S.mpSzigor` hordozza, ez mentődik is.

**Ahol a vendég látja:**

* a lobbyban („🛡 PvP szigorúság: …");
* a világ-átnézőben.

## Próba

`tools/pvp-szigor-3-9-287-proba.js`:

* a képlet és a tükörszimmetria, a régi társ;
* a záró nevezési érték a csomagban és a kézfogásban;
* a kezdőrúgás egy valódi, kétoldalú piramis-karrieren: a súlyozott átlag, a
  44%, a napló;
* az arányos padló, más osztályban kikapcsolva;
* a szigorúság: a csomag, az átvétel, a kapcsoló, az `mpHardcore()`;
* az idénynyitó ablak: az élő előnézet, a közzététel, a léptetés, a
  „Rendben" és a „Még maradok", a már elküldött rekord, egyjátékosban nincs.
