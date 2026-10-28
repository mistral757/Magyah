# 🎯 Az infópult „Skillek" füle, ⚖️ az egyenlítő-keret felirata (3.9.328)

## 1. A szerzett skillek egy helyen

> „Az info pultba be lehetne tenni a szerzett skilleket, hogy egyben lehessen
> látni és előre gondolkodni, hogy legközelebb melyiket válasszam fejlődni."

**Az infópult új, negyedik füle: 🎯 Skillek.** Karrierben érhető el, amint a
keretben van skill. Addig a fül halvány és nem kattintható, ahogy a többi üres
fül.

**A tartalma, fentről lefelé:**

1. **Összesítés:** hány kész és félkész skill, hány csillag, hány csillag
   épül, és hány játékosnál.
2. **Félkész skillek** („ezeket viheted tovább a következő jutalomnál"):
   * játékos és poszt;
   * a skill neve és a fázis-állása (pl. 1/3);
   * hány fázis hiányzik még;
   * a skill leírása.

   A sorrend: a kezdők elöl, azon belül a készhez legközelebbiek.
3. **Épülő csillagok:** melyik skillen épül csillag, és hol tart (pl. „★★
   épül · 1/3 fázis").
4. **Páros-tippek:** mi hiányzik egy skill teljes hatásához. Például ha a
   keretben van Csukafejes, de nincs Tökéletes beadás, a fül szól, hogy a
   duójuk +8%-ot ad.
5. **Játékosonként:** minden skill egy sorban. A kész skillt ✓ jelzi, a
   félkészt a fázis-állás, arany kerettel, mellette a ★ csillagok. Koppintásra
   a skill leírása megjelenik a lista alatt (mobilon is).

## 2. Az egyenlítő alapáras keretje

> „Megint az előző szezon egyenlítő boostját viszi tovább, négy helyett kettő
> van most felhasználható, a múlt szezonban kettőt használtam fel (50%-os)"

**Hogyan működik a keret (3.9.91 óta):**

* A keret **a nyár nyílásakor** töltődik újra, vagyis a bajnokság
  lezárásakor. A szintenkénti mennyiség: 5, 4, illetve 3 db.
* A nyáron (a **nyári kupán** is) elsütött egyenlítő ezért már a
  **következő idény** keretéből megy.

**A tervezett ok** (a 3.9.91-es leírás szerint): a Boost-központ nyári
eszköz, és egy szezonkezdetkor töltődő keret épp a legfontosabb ablakot
hagyná ki.

**A hiba, ami a félreértést okozta:** a felület nyáron is azt írta, hogy
„ebben az idényben". A játékos joggal hitte, hogy a nyáron elhasznált két
darab még a lezárt idényhez tartozik, aztán az új idény elején csak két
darabot talált.

**Mostantól:**

* **A felirat kimondja, melyik keretből fogy:**
  * idény közben „ebben az idényben";
  * nyáron „a következő idény keretéből (a nyári egyenlítők már abba
    számítanak)".

  Ez négy helyen jelenik meg: a boost-katalógus sorában, a megerősítő
  ablakban, az „elfogytak" ágban és a képesség mérősorában.
* **A keret töltésekor a napló is szól:** „⚖️ Az egyenlítő alapáras keretje
  újratöltődött: 4 db. A nyáron (a nyári kupán is) elsütött egyenlítők már
  ebből, a következő idény keretéből mennek."

A mechanikán ez a verzió nem változtat (lásd a választ: két lehetséges
irány).

## Próba

* `tools/infopult-skillek-3-9-328-proba.js`:
  * a fül elérhetősége;
  * az összesítés, a félkészek, a csillagok és a játékosonkénti lista;
  * a koppintásra megjelenő leírás;
  * a páros-tipp;
  * az egyenlítő-keret napló-sora;
  * nincs oldalhiba.
* `tools/egyenlito-idenykeret-proba.js`: a felirat-ellenőrzés az új szöveghez
  igazítva, és új állítás, hogy nyáron a következő idény keretét, idény
  közben ezt az idényt mondja.
