# Mérés: hat meccses zuhanás egy erős érkező után (3.9.254 → 3.9.255)

> „8. fordulóig 6-2-0, utána kapunk egy nagyon erős balvédőt, és a következő
> 6 meccsből 5 vereség 1 döntetlen. Úgy, hogy a meccserőm stabilan minden
> meccsen több volt, mint az ellenfélé. Az új fejlődési enginnel, D3-ban…
> Valami itt nagyon elcsúszott szerintem. Mérj."

A karrier: közös szoba, hagyományos mód, 3.9.254, 1. idény, D3, csiga tempó,
nemzeti csapatok bekapcsolva. A 8. forduló után négy érkező jött, köztük egy
94-es balvédő.

## 1. Mit mutat a karrier saját mérése

| forduló | eredmény | meccserő − ellenfél | a motor különbsége (d) | várt saját gól | várt kapott gól |
|---|---|---|---|---|---|
| 9 | 0–2 V | +0,7 | +4,34 | 2,52 | 0,81 |
| 10 | 2–3 V | +0,1 | −2,29 | 1,14 | 1,80 |
| 11 | 1–2 V | +1,8 | +2,80 | 2,09 | 0,98 |
| 12 | 0–1 V | +1,8 | +2,29 | 1,97 | 1,04 |
| 13 | 1–1 D | +1,2 | +1,39 | 1,77 | 1,16 |
| 14 | 1–5 V | −1,9 | −0,94 | 1,34 | 1,53 |

* A hat meccsen a motor 10,8 saját és 7,3 kapott gólt várt. A valóság 5 és 14
  lett.
* A mért győzelem–döntetlen–vereség görbe alapján a hat meccs várható
  pontszáma ≈ 10,5. Ennyire rossz (≤ 1 pont) sorozat esélye ≈ 0,05%, nagyjából
  1 : 2000 egy **előre kiválasztott** hat meccses szakaszra.
* A „4. idénytől gyorsuló mezőny” (3.9.254) az 1. idényben nem él, tehát nem
  ez okozta.

## 2. A motor nem romlott el

**Regresszió-mérés** (`tools/meccsmotor/szoras-valos.js`, 3.9.254, 600 valódi
meccs, a különbség rögzítve, fele hazai):

| különbség | Gy / D / V most | Gy / D / V a 10-14-i alapmérésben |
|---|---|---|
| 0 | 52,5 / 24,0 / 23,5 | 39 / 29 / 32 |
| +1,5 | 65,5 / 17,0 / 17,5 | 57 / 27 / 16 |
| +3 | 72,5 / 16,5 / 11,0 | 74 / 16 / 10 |

Ugyanazon a különbségen a motor ma nem ad kevesebb győzelmet, mint az
alapmérésben.

**Az érkezés hatása** (`tools/meccsmotor/szoras-erkezes.js`, +1,5-ös
különbség, 2 × 400 meccs):

| | Gy / D / V | tényleges / várt gól (saját · kapott) |
|---|---|---|
| érkező nélkül | 58,5 / 23,5 / 18,0 | 1,17 · 1,20 |
| egy 94-es balvédővel + 3 érkezővel | 65,8 / 19,5 / 14,8 | 1,12 · 1,01 |

Az érkezés a valódi `markArrived` úton történt. Nem ront, sőt a
kezdőrúgás utáni szakaszban (cserék, hajrá) még javít is.

**Minden rögzített karrier összevetése** (≈ 700 bajnoki meccs, 3.9.214 –
3.9.254): a karrierenkénti tényleges pont és a d-vödrökből várt pont
mindenhol együtt mozog (pl. 303 ↔ 304, 334 ↔ 327, 155 ↔ 166). Egyedül
ennek a karriernek az utolsó hat meccse lóg ki (1 pont a várt ≈ 10,5 helyett).

## 3. Átnézett meccs közbeni utak

Hibát egyikben sem találtunk.

* **Csere.** A pillanatképből újraszámol (`matchLambdas`). A kiállítás ára és
  a rangadó-hangolás újra ráül. Egy csere legfeljebb a két ember különbségének
  tizenegyedét viszi el.
* **Kiállítás-terv.** +15% / +25% a tízfős oldal ellen, csak a kiállítás után.
* **Rákapcsolás.** A 60. perctől csak az esélyest segíti.
* **Szárny- és szerep-szorzók.** Mind ≥ 1 a saját oldalon.
* **Hangsúly-csúszkák és talizmán-sávok.** ±8–15%-ba vágva.

A kezdőrúgáskor naplózott különbség (`d`) már tartalmazza a rejtett
ellenfél-erősítést, a pályát és a taktikát. A mezőny ereje tehát nem
„kerülhette meg” a naplót.

## 4. A mentés visszajátszása

A karrier mentésével a 9–14. forduló mind a hat meccsét 150-szer lejátszottuk
a valódi motoron (`tools/meccsmotor/mentes-visszajatszas.js`), minden meccs
előtt a mentés pontos állapotából.

| ellenfél | pálya | d | Gy / D / V visszajátszva | Gy / D / V a kezdőrúgáskori gólvárhatóságból |
|---|---|---|---|---|
| Sampdoria | otthon | +2,0 | 47 / 27 / 27 (200-as ismétléssel: 59 / 21 / 21) | 53 / 24 / 23 |
| São Paulo | idegenben | −1,7 | 22 / 22 / 56 | 26 / 24 / 50 |
| Napoli | otthon | +1,5 | 45 / 24 / 31 | 49 / 24 / 26 |
| PSV | idegenben | +1,3 | 55 / 24 / 21 | 48 / 25 / 28 |
| Marseille | otthon | +1,5 | 47 / 26 / 27 | 49 / 24 / 26 |
| Porto | idegenben | −1,7 | 23 / 27 / 50 | 26 / 24 / 50 |

* **A hat meccs várható pontszáma 8,7.** A kezdőrúgáskori gólvárhatóságból
  9,0 jön ki, tehát a meccs közbeni rész nem visz el semmit.
* **≤ 1 pont esélye ebből az állapotból ≈ 0,75%** (1 : 130).
* **A felállás alatti szám többet mutatott, mint ami a pályára ért.**
  * A taktika (labdatartás) −0,41 meccserőt adott.
  * Az összhang −1,5 volt: a négy érkező beilleszkedik.
  * A morál 40,8 volt, ez −0,46.
  * Az alakzat ára +5% az ellenfél gólesélyére.
  * Két nehéz idegenbeli meccsen (São Paulo, Porto) a motor szerinti
    különbség −1,7: ott a csapat volt az esélytelenebb.
* **A Vad idény talizmán (+6,8%) nem számít.** Lappal és lap nélkül
  ugyanaz jött ki (59 / 21 / 21 és 63 / 17 / 21, 200–200 meccs). Az első
  150-es futás 47%-a szórás volt.

## 5. Következtetés

Motorhibát nem találtunk.

* A mért motor ugyanazon a különbségen ugyanúgy, vagy jobban teljesít, mint
  korábban.
* Az erős érkező nem ront.
* A többi karrier pontosan hozza a várt pontot.

A mentés visszajátszása (4. pont) ezt megerősíti. A csapat saját
állapotából a hat meccs kb. 8,7 pontot ér. Az 1 pont rossz sorozat (kb.
1 : 130), de nem motorhiba.

A különbség oka kettős:

* a „meccserő > ellenfél" kijelzés nem tartalmazza a pályát, a negatív
  taktika-tételt és a beilleszkedés miatti összhang-levonást;
* a két idegenbeli meccsen ténylegesen az ellenfél volt az esélyes.
