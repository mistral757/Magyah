# 3.9.168 — ⚡ gyorsabb HUB, azonnal induló zene

> „Nagyon lassan tölt be a zene. És vannak benne laggok bizonyos események,
> kattintások, különösen is a HUBban játékosra kattintás hatására. Ezekkel nem
> lehetne valamit tenni?"

## A mérés

Chromiumban, **négyszeresen lassított CPU-val**, ami nagyjából egy közepes
telefon. A mérés CPU-profilozással és a böngésző long-task figyelőjével ment,
egy valódi karrier nyitott HUB-jában, szóló zene mellett.

| amit mértünk | előtte | utána |
|---|---|---|
| egy HUB-soron koppintás (a kezelő ideje) | 430–770 ms | 40–135 ms |
| koppintástól a kirajzolt képkockáig | 670–1080 ms | 70–210 ms |
| a koppintás utáni akadások | 5–6 × ~200 ms | 0–1 kisebb |
| teljes mentés koppintásonként | **5** | 0 (egy összevont, üresjáratban) |
| a zene indulásának akadása | 310 ms egyben | 90 + 120 ms, üresjáratba osztva |

## Mi okozta, és mi lett helyette

**1. Egy koppintás = öt mentés.** A HUB minden újrarajzolása mentett. A
lenyitott játékoslap négy `<details>` lenyílója is mentett, a
`toggle`-eseménnyel, ami az újrarajzolt lapon magától elsült. Egy mentés a
teljes játékos-pool csomagolása, JSON és localStorage-írás.

* **Mostantól:** ez a két hely összevont mentést kér (`saveGameSoon`). 700 ms
  csend után, a böngésző üresjáratában EGYSZER ír, a legfrissebb állapottal.
* **Nem vész el semmi:**
  * a lap elhagyásakor (újratöltés, bezárás) azonnal kiíródik;
  * háttérbe kerüléskor szintén;
  * bármely rendes mentés is „elviszi”, mert az úgyis mindent ment.
* A vásárlás, eladás és a többi fontos lépés továbbra is azonnal ment.

**2. A lenyitás a teljes HUB-ot újrarajzolta.**

* **Mostantól:** a koppintás csak a részletpanelt cseréli, pontosan oda,
  ahová a teljes rajzolás is tenné: a koppintott sor alá.
* Ha a gyors út bármiért nem alkalmazható, a régi, teljes rajzolás fut.

**3. A zene lassú indulása.** Két ok volt:

* a feloldás után a zene a következő másodperces ütemig várt: a hangkártya
  indítása aszinkron, és addig „felfüggesztett” állapotot látott. Most az
  indítás után azonnal szól;
* minden zeneindítás és minden stílus-szignál újragenerálta a 2,4 mp-es
  zengető-lecsengést. Ez telefonon meccs közben is akadást okozott.

Most a lecsengés egyszer születik, és a hangulat-buszok a szülő busz
zengetőjét használják. Az első feloldás után üresjáratban előkészül a két
zengető és a futó dal pengetett húrjai is. Az ütemező 0,12 helyett 0,3 mp-re
előre tervez, így egy hosszabb felület-munka alatt sem fogy ki a zene.

**4. Meccs közben minden naplósor kényszerített elrendezést.**

* A sor után a napló aljára görgetés azonnal kiolvasta a magasságot. Egy
  gólnál ez háromszor ment le egymás után: gól-, kommentár- és lelátó-sor.
* **Mostantól:** a görgetés képkockánként egyszer történik; a látvány ugyanaz.

## Próba

`tools/teljesitmeny-proba.js` (port 9202, 11 állítás). Őrzi, hogy:

* HUB-koppintáskor nincs szinkron mentés és teljes újrarajzolás, a
  részletpanel a sor alatt van, és az összevont mentés később egyszer lefut;
* a pagehide kiírja a függő mentést;
* a zengető gyorsítótárazott, és a buszok nem készítenek saját konvolvert;
* öt naplósor egyetlen képkocka-görgetést kér.
