# 🛡️ A Panzer hétköznapjai: rettenet és mérföldkő (3.9.295)

## A kérés

„A panzer csapatstílus sokkal nehezebben kap csapatstílus mérföldköveket
és rettenet pontot mint a többi, ezt javítsuk azzal, hogy legyenek sokkal
hétköznapibb átlagosabb dolgok is, amiért kap mérföldkövet és rettenet
pontot."

## Mérés a változás előtt

Valódi meccsmotor, draft keret, 1 idény, 28 meccs. Mérőeszköz:
`tools/meccsmotor/stilus-merfoldko-utem.js`.

**Stílus-mérföldkőpont egy idény alatt:**

| stílus | pont |
|---|---:|
| Beton | 100 |
| Panzer | 78 |
| Gegenpressing | 60 |
| Harmónia | 45 |
| Villám | 25 |
| Bombázók | 25 |
| Sztár | 24 |
| Tiki-Taka | 15 |

A Panzer 78 pontjából 28 a keret összetételéből jön (a lobbanékony emberek
száma), nem a játékból. A meccseken szinte csak ritka eseményért fizetett:
piros lap, sérülten nyert meccs, óriásölés, kiállítás.

**Rettenet:** idényenként 54, meccsenként ~1,9.

A régi tarifa szinte csak ritka eseményt fizetett: lap, mesterhármas,
kemény belépő, győzelem erősebb ellen. A meccs-plafon (a félelem szint
10%-a) ezért rendre üresen maradt. 10-es stílus-szinten mérve
(`stilus-pontbevetel.js`) 3,4 jött össze meccsenként a 7,4-es plafonból.

## A változás

### Hétköznapi rettenet-tételek (`DREAD_PTS`)

| tétel | pont |
|---|---:|
| minden meccs („felvonulás”) | 0,5 |
| győzelem | 1 |
| kapott gól nélküli meccs | 1 |
| gólonként | 0,25 |
| blokkonként és tisztázásonként (lövésblokk, gólvonal-mentés, szöglet-tisztázás) | 0,15 |

* Ugyanaz a skála vonatkozik rájuk, mint a régi tételekre: a 100-as
  félelem szint fölött arányosan nőnek. Másodlagos filozófiaként
  harmadáron gyűlnek.
* A meccs-plafon változatlanul fog.
* Némán gyűlnek, nem szakítják meg a közvetítést. A meccs végi rettenet-
  összesítőben tételesen látszanak.

### Öt új, sűrű mérföldkő-család

| család | mit mér | fokozat | pont |
|---|---|---:|---:|
| `pz_winall` | győzelmek a klub történetében (2 → 200) | 18 | 108 |
| `pz_winseason` | győzelmek egy idényben (5 → 25) | 6 | 43 |
| `pz_goalall` | gólok a klub történetében (5 → 600) | 18 | 108 |
| `pz_csall` | kapott gól nélküli meccsek (1 → 55, csapat-szinten) | 14 | 72 |
| `pz_wall` | blokkok és tisztázások (5 → 960) | 18 | 108 |

* Az alsó fokozatok kicsik, egyenként 3 pontot érnek. Egy átlagos idény
  családonként 4–6 fokozatot visz.
* A számlálók a klub meglévő adataiból jönnek (idény-történet, futó idény,
  karrier-statisztika), tehát egy futó karrier az eddigi munkáját is
  azonnal megkapja.
* A kapott gól nélküli meccseknek saját csapat-számlálója van
  (`msT().pzCs`), mert a `careerStats.cs` egy nullás meccsen a kapusnak és
  minden védőnek is jár. Az első olvasáskor a kapusok eddigi tiszta
  lapjaiból indul.

## Mérés a változás után

Ugyanaz a mérés: 1 idény, 28 meccs.

* **Panzer stílus-mérföldkőpont:** 108–177. A hétköznapi családok ebből
  ~50–80 pontot adnak.
* **Rettenet:** idényenként 75–160, a korábbi 54 helyett.
* **10-es szinten, meccsenként:** 4,3 a korábbi 3,4 helyett. A plafon
  8,3 volt; a Villám 4,0-t, a Beton 4,7-et gyűjt.

## Próba

`tools/panzer-hetkoznap-3-9-295-proba.js`.
