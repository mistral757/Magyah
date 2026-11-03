# 3.9.361 — gyorsítás: a koppintás alatti mentés, a stílushatások, a keresés, a jegyár-lánc

> „Egyre gyűlnek az olyan promptok a játékban, amik után jelentősebb 1000ms
> fölötti pingek is vannak. Persze ezek gondolom processing dolgok. De ezeket
> fel kéne kutatni, és valahogyan ki kéne dolgozni a gyorsításukra a
> megoldást. Játékosok megbízásának módosítása, csapatstílus feloldása, stb."
> — „Ha máshol is találsz ilyen jelentősen magas ms időket, ott is kutakodj.
> Hátha találunk valami átfogó egyszerűsítési lehetőséget."

## Hogyan mértem

* **Valósághű állapot:** egy karrier, benne 90 végigjátszott bajnoki meccs.
* **Telefon-közeli sebesség:** Chromium, 4-szeres CPU-lassítással (CDP
  `Emulation.setCPUThrottlingRate`).
* **Eszközök:** CPU-profil (`Profiler`) és a hosszú feladatok figyelése
  (`longtask`).
* **Mit mértem:**
  * a HUB minden menügombját egyenként;
  * a szerepváltást;
  * a HUB-rajzolást;
  * a legjobb-felállás keresést;
  * három lejátszott meccset.

Egy valódi, több idényes karrier mentése ennél nagyobb, ezért a tényleges
számok a telefonodon ennél rosszabbak lehettek. Az arányok viszont ugyanezek.

## Amit találtam és javítottam

| | Előtte | Utána |
|---|---|---|
| Szerepváltás (HUB szerep-panel) a koppintás alatt | 228 ms | **39–53 ms** |
| Célrés-ablak megnyitása | 912 ms | **298 ms** |
| HUB-rajzolás változás után (első) | 803 ms | **486 ms** |
| Legjobb-felállás keresés (minden nevezési mérés) | 691 ms | **375–490 ms** |
| A jegyár keret-ár átlaga (meccsek körül) | 1489 újraszámolás, ~290 ms / számolás | **2 újraszámolás, ~1 ms** |
| A leghosszabb feladat 3 meccs alatt | 698–965 ms | 451–592 ms |

### 1. A koppintás alatt nem ír a mentés

* **A mentés a legnagyobb, minden koppintásra jutó tétel.** Egy mentés
  (`saveGame`: a teljes játékos-pool csomagolása, a JSON és a localStorage-írás)
  ~190–250 ms volt, és a mentés méretével nő.
* **Mostantól a felhasználói eseményből indított mentés** (koppintás,
  választás, gépelés) a 3.9.168 óta meglévő összevont, üresjárati útra kerül
  (`saveGameSoon`). A képernyő azonnal válaszol, a kiírás a következő csendes
  pillanatban történik.
* **Elvesztés ellen:**
  * a lap elhagyása és háttérbe kerülése azonnal kiír;
  * a betöltés, a mentéslista és a diagnosztika előbb kiírja a függő mentést;
  * az újratöltés előtti helyek (🏠, szobaváltás, frissítés) azonnal írnak
    (`saveGameNow`).

### 2. A stílushatás-lista gyorsítótárban

* **A `styleActiveFx` minden csatorna-kérdésnél** (szorzó, összeg, maximum)
  újraépült, egy HUB-rajzolásnál és egy keresésnél több százszor.
* **Mostantól olcsó aláírás alapján tárolódik.** Bármelyik bemenet változik,
  azonnal újraépül:
  * a két filozófia megvett szintjei;
  * a stílusbolt;
  * a kispadon ülő edző;
  * a rejtett stílus;
  * a talizmán-kapcsoló.
* **A legjobb-felállás keresés alatt** az aláírás sem kell, mert ott a stílus
  nem változhat.

### 3. A legjobb-felállás keresés: egy konfiguráció egyszer számol

* **696 kiértékelésből csak 428 volt egyedi.**
* **A keresés idejére memó él** felállás, kapitány, taktika és slotok szerint.
* **Az eredmény betűre ugyanaz.** A próba memóval és memó nélkül is lefuttatja.

### 4. Rejtett hiba a jegyár-láncban

* **A „jegyár a keret árához igazítva” szorzó (3.9.192)** a keret átlagos
  kikiáltási árából számol.
* **A kikiáltási ár a szezonkereten át visszahívta a jegyárat.** Egyetlen
  számolás 523–580 szint mélyre hívta önmagát (1045 + 12 029 hívás), és csak
  egy veremtúlcsordulás állította meg.
* **Az egyelemes tárban két kulcs váltakozott**, ezért 2992 hívásból 1489
  teljes újraszámolás volt.
* **Mostantól:**
  * újrabelépés-őr, amely ugyanazt a fixpontot adja egyetlen szinten;
  * pár elemes tár.
* **Az érték ugyanaz:** egyezik a felületen kiírt kikiáltási árak átlagával.

### 5. Kisebbek

* **Számformázás:** egy `Intl.NumberFormat` példány, nem minden számnál új
  `toLocaleString`. A kimenet betűre a régi.
* **Az edzői kártya lendület-görbéje:** a meccsesemények rajzolása
  képkockánként egyszer.

### 6. Új biztonsági háló a `check.sh`-ban

**Kétszer deklarált függvény eltérő törzzsel.** A munka közben egy új
számformázóm `huSzam` néven csendben felülírta a meglévő, raggal író
`huSzam`-ot. Minden szám „1234567-es” lett volna, és sem a szintaxis-, sem az
eslint-ellenőrzés nem vette észre. A próba elkapta, és most már a `check.sh`
is elkapja.

## Ami még marad (következő lépések)

* **A HUB meleg újrarajzolása 120–240 ms** (4× lassítva). Sok kis tétel adja
  (a tanító panel, a büdzsé, a Run-mérő, a létra, az edzői kártya), nincs egy
  nagy gócpont. Ezt csak a nem látható panelek halasztásával lehetne tovább
  vinni.
* **Maga a mentés a háttérben még mindig 200–250 ms**, a pool csomagolása
  miatt. Ezt egy növekményes (csak a változott játékosokat újracsomagoló)
  mentés hozná le.
* **A meccs utáni jutalom-lánc leghosszabb feladata 450–600 ms.** Ebben a
  meccs utáni mentés és az akadémia/feloldás-lánc van.

## Próba

**`tools/gyorsitas-3-9-361-proba.js`** (10 állítás). Mind azt méri, hogy a
gyorsítás a számokon semmit nem változtat:
* a keresés memóval és anélkül;
* a stílushatás-lista vásárlás után;
* a jegyár-átlag a kiírt árakkal;
* a számformázás;
* a mentés: késleltetve kiíródik, betöltés előtt kiíródik, a `saveGameNow`
  azonnal ír.
