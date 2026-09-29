# 3.9.173 — 🎮 a talizmán-képességek láthatóan, felül, nagyban

> „A talizmánok szezon közben aktiválható funkciói legyenek sokkal láthatóbb
> helyen. Most nagyon el vannak dugva. A talizmánoknál felül legyenek nagyban
> külön a te képességeid, amiket tudsz használni."

## Mi volt a baj

Minden, amit a talizmánjaid szezon közben a kezedbe adnak, az „⚡ Aktív
alaphatások” hosszú listájában állt, harminc számsor között, egy-egy sor
végén apró gombként:
* a Titkos fegyver előhúzása, a Pénzfeldobás, a Tükörvilág;
* a jellemhullám iránya és a Lélekbúvár irányváltása;
* a hitel felvétele és előtörlesztése;
* a bomba-ajánlat, a visszavásárlás, a Polihisztor-díj és a szponzor-felbontás.

A meccsképernyőn pedig semmi nem emlékeztetett rájuk.

## Mostantól

### 1. „🎮 A te képességeid” — a Talizmánok menü tetején

Egy külön, arany keretes blokk a menü legtetején, az alaphatások fölött.
Minden képesség saját nagy kártyát kap:
* nagy ikon és név;
* az állapota: hány maradt idén, élesítve, elhasználva, miért nem most;
* egy mondat arról, mit ad (a talizmán saját pro-szövege);
* nagy gomb, ami azonnal cselekszik.

**A sorrend:** amit most használhatsz, az világít (arany keret, fény) és elöl
áll. Ami már élesítve van, zöld keretet kap, és hátrébb kerül. A szponzor
felbontása halkan, a végén áll.

**Ami ide kerül:**

| kártya | mikor |
|---|---|
| 🧿 Talizmán-húzás | ha húzás vár (a régi sárga gomb helyett) |
| 🗝️ Titkos fegyver | idényenként 3–4 meccsre, élesítés a következő meccsre |
| 🪙 Pénzfeldobás | idényenként 5–7 dobás, a következő meccsre |
| 🪞 Tükörvilág | karrierenként egyszer |
| 🌊 Jellemhullám | ha irányra vár |
| 🧠 Lélekbúvár | a futó hullám iránya átállítható |
| 💣 Utolsó perces bomba | ha él az ajánlat |
| ↩️ Visszavásárlás | nyitott átigazolási időszakban |
| 🌈 Polihisztor-díj | ha mind a tíz szín megvan (szélesen, tíz kategóriagombbal) |
| 🏦 Hitelkeret / futó hitel | felvétel vagy előtörlesztés |
| 🔥 Égetés | a nyári ablakban, idényenként egyszer (a gyűjteményhez visz) |
| 🎽 Szponzor | felbontás kötbérrel |

Ha még nincs ilyen képességed, a blokk akkor is ott van, és elmondja, mi fog
ide kerülni.

### 2. Az alaphatások listája csak az állapotot mondja

A gombok a kártyákra költöztek. A lista sorában csak ennyi áll: „⬆ fent, a
Képességeid között”. Így egy művelet egy helyen él, nincs két gomb ugyanarra.
Az égetés gombjai a gyűjtemény lapjain maradnak.

### 3. Gyorssáv a meccsképernyőn, a kezdőrúgás fölött

„🎮 Talizmán-képességeid a következő meccsre”: a következő meccsre ható
képességek (Titkos fegyver, Pénzfeldobás) egy-egy csipként.
* Ami használható, arany keretet kap; ami élesítve van, zöldet, „✓ élesítve”
  felirattal.
* Koppintásra a Talizmánok menü a kártyánál nyílik, és a kártya felvillan.
* Meccs közben és végigjátszásnál nincs sáv.

### 4. A HUB Talizmánok-gombja jelez

A felirat kiírja: „🎮 N képesség használható”. Ha húzás, bomba-ajánlat vagy
használható képesség vár, a gomb arany fénnyel világít.

## Egy kezelő, egy igazság

A kártyák ugyanazokat a műveleteket hívják (`data-tal`), mint eddig a lista
gombjai: a megerősítések (Tükörvilág, égetés), a mentés és az újrarajzolás
mind a régi úton megy. Új csak a „huzas” (húzás-ablak) és az „egetNyit”
(a gyűjtemény fülre lép).

## Próba

`tools/talizman-kepesseg-proba.js`, 15 állítás, valódi karrierben, valódi
menüvel:
* a blokk helye és a kártyák;
* a gomb hatása és az állapotváltás;
* a lista gombmentessége;
* a gyorssáv (helye, csipjei, a menübe ugrás, a végigjátszás);
* a HUB-gomb;
* az üres állapot.

## Menet közben: a teljes regresszió (132 próba) igazításai

A teljes regresszió a 3.9.171–173 változásai után először futott végig. A
régi `nevmod-boot` hibán kívül minden zöld, miután a próbák az új szabályokhoz
igazodtak. **A játék viselkedésén egyik igazítás sem változtat, csak a próbák
követik a játék új, szándékos szabályait.**

* **A lefújás utáni kör függőben tartja a kezdőrúgást (3.9.171).** Négy próba
  indított új meccset úgy, hogy az előző meccs jutalom-körét félbehagyta vagy
  végig sem vitte. A játékban ez nem fordulhat elő (a kezdőrúgás-gomb tiltva
  van), a próbában igen. Ezek most lezárják a kört, ahogy a játékos is
  végigkattintaná. Mivel a próbák újrahasznosítják a fordulószámot, a lefújt
  meccs élő rekordját is törlik, különben ugyanaz a meccs állna vissza:
  * `csupa-ek-proba`;
  * `kiallitas-rendszer-proba`;
  * `szarny-kemia-epites-proba` (két helyen).
* **A lánc lépései a rögzített sorsolás burkában futnak (3.9.171).** A
  `kenyelem-3-9-152-proba` forrás-mintája mostantól a burkolt alakot is
  elfogadja.
* **A hangtábla 24 effektet vár**, a kihívás-szignállal (3.9.172):
  `hangtema-proba`.
* **A service worker cache-neve v7** lett, a számjegy-betű miatt (3.9.172):
  `pixel-tema-proba` (v6 vagy későbbi).
* **A talizmán-gombok a „Képességeid” kártyáin vannak** (3.9.173). A próbák a
  gombokat a teljes menüben keresik, nem csak az alaphatások listájában, a
  várakozó húzásnál pedig a kártyát is elfogadják:
  * `talizman-proba`;
  * `talizman-f4a-proba`, `talizman-f4c-proba`;
  * `talizman-f6a-proba`, `talizman-f6c-proba`.
