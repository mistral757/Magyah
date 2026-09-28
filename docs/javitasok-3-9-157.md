# 3.9.157 — A forma a meccs-erő mellett, a párharc-csapatlap és a nyári kupa

Három bejelentés, egy kiadás.

## 1. „Valami számolás ráad a PvP meccsen a meccs-erőre”

> „…miért látja úgy, hogy neki a meccs ereje 148 (130-as nyers erő +18 a meccs
> erőt adó cuccokkal) és az eredményjelzőn az player ellen 156 meccs erő."

**Nem kiegyenlítés, hanem a tartós forma.** A motor (`buildMatchSnapshot`)
minden kezdő hozzájárulását megszorozza a formájával. A forma a keretlista
1–14-es foka, játékosonként ±15%. A hátsó sor formája ezenfelül a kapott
gólokat is tolja. Ez minden meccsen így van, a CPU ellen is.

A két kijelzés eddig különbözött:

* **A HUB ⚡-ja** (`teamMatchStrength`) szándékosan forma nélkül mér. A
  nehézség-kalibráció a keretet méri, nem az ötmeccsenként mozduló formát.
* **A párharc eredményjelzője** a meccs pillanatképéből írja ki a számot, abban
  pedig a forma is benne van.

Mérve, ugyanazon a kereten:

| a kezdő formája | HUB ⚡ | pillanatkép ⚡ |
|---|---|---|
| semleges | 72,48 | 72,5 |
| „szárnyal” (+11,5%) | 72,48 | 80,6 |

A bejelentés +8-a pontosan ez.

**Rejtett hiba volt a CPU-meccsen is.** Ott az eredményjelző forma nélkül
mutatta a ⚡-t, miközben a motor vele számolt.

**A javítás.** A forma saját tételként látszik, ugyanúgy, mint a nehézségi
kiegyenlítés (⚖):

* **az eredményjelzőn:** `⚡148 📈+8,1` — a két rész összege az, amivel a motor
  számol;
* **a csapaterő-sávban:** „📈 forma +8,1 → a meccsen 156”;
* **a súgóban** a Csapaterő és meccs-erő bejegyzés elmagyarázza.

A CPU-meccs ⚡-ja is a formával együtt áll. A kalibráció nem változott.

A számítás (`pformTeamOvr`) a pillanatkép formatagjának tükre, a napi forma
(véletlen) és a mellékhatások nélkül. A próba ellenőrzi, hogy a HUB ⚡ és a forma
összege a pillanatkép ⚡-ja: jó és rossz formánál is.

## 2. A társ játékosai 120-on ragadtak

A társtól érkező csapatlapot a játék megtisztítja, mert ellenőrizetlen adat. A
Ratingek, a csapaterő, a keret-szám és a legerősebb ember plafonja fixen 120
volt, ezért egy kiépült karrierben a társ felállásán minden korong 120-at
mutatott. A meccs-erő plafonja már korábban 400 lett, ezek lemaradtak.
Mostantól mindegyik plafonja 400.

## 3. „3 másodperces computing a nyári kupa nevezése előtt”

A nevezési képernyő három számot kér egymás után: a mezőny közepét, a kiírt
meccs-erőt és a nevezési számot. Mindhárom kalibrációs ablakot nyit, és a
3.9.122-es lebutítás-védelem mindegyikben elölről lefuttatta a „potenciális
meccs-erő" keresését. Ez nagyjából 9 felállás × 2 kör × 11 poszt × 12 jelölt,
mindegyik egy teljes meccs-erő számítás, háromszor ugyanarra a keretre.

**A javítás két része:**

* **Egyszer fut.** A kész eredmény a keret lenyomatával együtt 5 másodpercig
  megmarad. A lenyomat a felállás, a kezdő (Ratinggel), a kapitány, a taktika
  és a szintjei, a morál, a keretlista és a forduló. Ha a következő ablak
  ugyanezt látja, a keresés nem fut újra. Ha bármelyik változik, újra fut.
* **Olcsó előszűrő.** A jelöltek többsége ránézésre esélytelen: más posztra
  való, és többet veszít a slot erejéből, mint amennyit a rejtett tagok
  visszaadhatnának. Egy gyors becslés (a poszt szerinti erő és az aura
  különbsége) kiszűri őket, mielőtt a teljes számítás lefutna. A tartalék 1,5
  meccs-erő.

Mérve a próbakereten: a nevezési lánc 336 ms-ról 17 ms-ra esett. Nyolc
véletlen kereten az előszűrő pontosan ugyanazt a legjobb felállást találja,
kb. 40%-kal kevesebb teljes számítással. Egy kiépült karrierben, ahol a
teljes számítás a drága rész, az előszűrő megtakarítása ennél nagyobb.

## Próba

`tools/javitasok-3-9-157-proba.js` (port 9199, 9 állítás).
