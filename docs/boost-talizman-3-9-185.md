# 3.9.185 — ⚡ Gyakoribb boost-kedvezmény és a Boost talizmán-szín

> „A boost ár csökkentő kihívás jutalom legyen gyakoribb és legyen a mérték
> egy sávon belül random: 10-45 % között. Legyen egy új talizmángyűjtő
> csoport. Ennek kifejezetten a boostok lesz a specialitása. Szerencse alapon
> szerezhet random ingyen boostot, bármely típusból (esély max 50%/szezon és
> max 2 db / szezon), ez az egyik fő képesség, másik, hogy összesen max
> 20%kal csökkentheti az egész boost csomag alapárát, és vannak boostfajtára
> leosztott plusz kedvezmények, amiből szintén meg 20-20%ot gyűjthet össze.
> És növelheti a boost jutalommal díjazó kihívások esélyét max 40%kal."

## 1. A boost-kedvezmény kihívás-jutalom

| | eddig | mostantól |
|---|---|---|
| példány a jutalom-kalapban | 1 (≈3%) | **3** (≈10%) |
| mérték | fix 10% | **10–45%**, a felajánláskor sorsolva |
| halmozás | összeadódik | **szorzódik**: minden újabb jutalom a maradék árból vág le |
| teteje | 50% | **75%** |

* **A kártyán az a szám áll, amit kapsz.** A mérték a felajánláskor dől el,
  és a kifizetés pontosan ezt adja.
* **A szorzódó halmozás:** két 30%-os jutalom együtt 51%, nem 60%.
* **A magasabb tető oka:** nagyobb és gyakoribb jutalom mellett a régi 50%-os
  tetőt két-három darab már elérte volna. A boost-egység 0,10-es árpadlója
  változatlanul áll.
* **A régi ajánlatok:** a már felajánlott, szám nélküli ajánlat a megígért
  10%-ot adja.

## 2. A ⚡ Boost talizmán-szín

**Ez a tizenegyedik szín.**

* Archetípus-cím: **Az Alkimista**.
* Szín: magenta.
* Négy alaphatás, a kérés plafonjaival.

| változat | mit ad | plafon |
|---|---|---|
| **Szerencse-boost** | idényenként két dobás egy-egy ingyen boostért | 50% / dobás |
| **Olcsóbb csomag** | az egész boost-csomag alapára csökken | −20% |
| **Fajta-kedvezmény** | egy fajta ára csökken; a fajta a lapon látszik | −20% fajtánként |
| **Boost-jutalom** | a boost-jutalmú kihívások esélye nő (relatív) | +40% |

Mindegyik ugyanúgy gyűlik, mint a többi színé:

* egy színen belül csökkenő hozam (0,85^k);
* színhűségi szorzó 3, 5 és 8 lapnál;
* Tiszta lapnál ×1,25.

### Szerencse-boost

* **Két dobás idényenként:** egy-egy seedelt fordulóban, az idény első felében
  (3–12.) és a második felében (16–25.).
* **Legfeljebb 2 ingyen boost egy idényben:** a dobás esélye legfeljebb 50%.
  Mérve, 400 idényen, 50%-on: átlag 1,01 ingyen boost idényenként, legfeljebb 2.
* **A nyeremény ingyen-zseton:** egy épp elsüthető fajtára szól. Ugyanaz az út,
  mint a kihívás-jutalomé: a Boost-központban „INGYEN” áll mellette, és a
  vásárláskor fogy el.
* **Seedelt dobás:** a visszatöltés nem dob újra.

### Fajta-kedvezmény

* **A lap egy fajtára szól.** A fajtát a húzáskor dobjuk, és csak olyan lehet,
  ami a karrierben létezik:
  * a skill-boost csak realisztikus skill-módban;
  * az egyenlítő csak a Béke és harmónia képességével.
* **Fajtánként külön gyűlik**, mint a Meccs tengelyei, fajtánként saját
  −20%-os plafonnal.

### Boost-jutalom

* **A boost-jutalmak:** ingyen boost, boost-token, boost-kedvezmény.
* **Kétlépcsős sorsolás:** előbb az dől el, hogy boost-jutalom lesz-e, aztán
  hogy melyik.
* **Pontos a növelés:** a +40% pontosan ×1,4-et jelent. Ha a kalapban 25% a
  boost-jutalmak aránya, akkor 35% lesz (mérve: 35,3%).

### Hogyan adódnak össze a kedvezmények

Mind szorzódnak:

    egység ára = alap × (1 − kihívás) × (1 − kezdő idény) × (1 − csomag-talizmán)   (padló: 0,10)
    fajta ára  = egység × fajta-egység × (1 − fajta-talizmán) × sorrend-speciál

**A Boost-központ kiírja őket:**

* a fejlécben a csomag-kedvezményt;
* a fajta sorában a fajta-kedvezményt és az élő sorrend-kedvezményt.

### A hét speciál

A pro mindegyiknél a boostokról szól. A kontra, ahogy minden színnél, egy
**másik** területet üt.

**Egyik pro sem lépi át a négy alaphatás plafonját.** A kedvezményt adók a
vásárlás sorrendjére szólnak, nem a fajtára vagy a csomagra.

| speciál | min. | pro | kontra |
|---|---|---|---|
| Törzsvásárló | átlagos | az idény első fizetős boostja −20% | vételár +2% |
| Erőcsomag | átlagos | a sima boost Rating- és POT-ugrása +10% | fejlődési tempó −2% |
| Árfigyelő | átlagos | a boost-kedvezmény jutalom sávja +4 pp | morál-cél −1 |
| Célzott tréning | ritka | az attribútum-boost azonnali ugrása +15% | begyakorlás −4% |
| Zsetongyűjtő | ritka | a jutalomként kapott ingyen boost / token 20% eséllyel dupla | szezonkeret −2% |
| Csodaszer | nagyon ritka | az ifi- és az öreg-boost ugrása +8% | stábhatás −3% |
| Mennyiségi kedvezmény | legendás | az idény 3. és minden további fizetős boostja −15% | stíluspont −3% |

* **A sorrend számlálója:** az idény fizetős boostjait a `budgetPay` „boost”
  kapuja számolja. A 0 Ft-os, zsetonos boost nem számít bele.
* **Rezonancia, 5 lapnál — Célzott szerencse:** a szerencse-ingyenboost arra a
  fajtára esik, amelyikre a legnagyobb fajta-kedvezményed szól.

### Ami a régi paklikat érinti

* **A Polihisztor-díj:** mostantól mind a tizenegy színből kell lap hozzá.
* **A kínálat:** a három lapos kínálat (ismerős, új irány, vad) mostantól 11
  színből húz.

## Próba

`tools/boost-talizman-3-9-185-proba.js` — 47 állítás.

A régi talizmán-próbák közül kettő igazodott:

* a katalógus most 11 kategóriát vár;
* a súgó speciál-száma a `TAL_SPEC` hosszából jön.
