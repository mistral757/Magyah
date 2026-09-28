# 3.9.158 — Talizmánok F6d: a Meccs speciáljai

> „Okés mehet az f6d"

A kilenc meccs-special él, ezzel a katalógus mind a 82 speciálja. Ezek a
mérkőzésen hatnak, ezért ez volt a legkényesebb köteg. A párharcban a két gép
csak akkor játssza le bitre ugyanazt a meccset, ha minden szám a meccs
pillanatképében utazik, és mindkét motor ugyanazzal a képlettel olvassa.

## A speciálok

| speciál | pro | kontra | hol hat |
|---|---|---|---|
| Hajrá-gépezet | a 75. perctől +6% saját λ | a 0–15. percben −4% | időablak |
| Villámrajt | a 0–15. percben +8% | a 75. perctől az ellenfélnek +4% | időablak |
| Hazai erőd | hazai pályán +0,4 meccserő | idegenben −0,25 | a pálya |
| Kupavadász | kupameccsen +3% | bajnokin −1% | egész meccs |
| Tizenegyes-hóhér | +10 pp tizenegyes-értékesítés | a szabadrúgás súlya −20% | különleges események |
| Betonfal | az ellenfél −3% | saját −2% | egész meccs |
| Tíz ember is elég | az emberhátrány tétele −35% | piroslap-esély +10% | a lapok |
| A 12. játékos | hazai pályán +2%, a vendég piroslap-esélye +20% | a hazai lelátó-bevétel −8% | a pálya, a lapok |
| Az utolsó szó | a 85. perctől döntetlennél +10% | ha a 85. percben döntetlen volt és kikapsz, −3 morál | időablak |

## Az időfüggő gólvárhatóság

A két motor 5 perces vödrökben játszik: a CPU-meccs a `playMatch`-ben, a
párharc a `h2hSimulate`-ben. A vödör a (perc−4 … perc) szakasz.

* „a 0–15. perc": az 5., 10. és 15. vödör;
* „a 75. perctől": a 80., 85. és 90. vödör;
* „a 85. perctől döntetlennél": a 90. vödör, ha az állás egyenlő.

A pillanatkép `talIdo` mezője négy szorzót visz:

| kulcs | mikor | kinek |
|---|---|---|
| `e15` | a 0–15. percben | saját |
| `k75` | a 75. perctől | saját |
| `o75` | a 75. perctől | az ellenfélnek |
| `d85` | a 85. perctől, döntetlennél | saját |

A két motor **ugyanazt a két olvasót** hívja: `talIdoOwn(pillanatkép, perc,
lőtt, kapott)` és `talIdoOpp(az ellenfél pillanatképe, perc)`. Hiányzó mező
(régi kliens) = 1, és akkor a szorzat bitre a régi. A szorzók ±15%-ba vágva.

## A többi új mező

* `talSpOwnM` / `talSpOpp`: a Kupavadász és a Betonfal feltétel nélküli
  szorzója (saját, illetve ellenfél λ).
* `talHomeM` / `talAway`: a Hazai erőd meccserő-eltolása. A matchLambdas a
  pálya szerint adja hozzá a különbséghez. A Stadionbővítés `talHome`-jával
  együtt ±1 meccserőbe vágva.
* `talHomeOwn`: A 12. játékos saját +2%-a, csak hazai pályán.
* `talOppRed`: A 12. játékos lapja. A `h2hSimulate` a **vendég** oldal
  piroslap-esélyét emeli vele, ha a hazai pillanatképben ott van, és nem
  semleges a pálya. A véletlen-fogyasztás változatlan, csak a küszöb mozdul.
  CPU-meccsen az ellenfélnek nincs piros lapja, ott csak a +2% hat.

**Tíz ember is elég.** A `dialRedMatch`-en át hat: a CPU-meccs kiállítása és a
párharc pillanatképének `redMatch`-e is ezt olvassa. A piroslap-esély a CPU
`_pRed`-jén és a pillanatkép `redP`-jén.

**Tizenegyes-hóhér.** A különleges meccs-események ágán hat. A párharcban
nincs különleges esemény, ott nem hat.

**Hazai erőd.** A meccs előtti papírforma-sor kimondja: „🏰 A Hazai erőd ma
+0,4 meccserőt ad a motorban".

**A 12. játékos kontrája.** A valódi heti lelátó-tickben hat (`fanMatchTick`),
csak hazai meccsen. Ugyanitt a Stadionbővítés (F6c) is hat most már: a heti
szurkolónövekedés is +10%. Eddig csak az eseményekből jövő növekedésre
hatott.

## A meccserő-tükör

A feltétel nélküli tagok (Kupavadász, Betonfal) és az időablakok vödör-súlyú
átlaga (3 vödör a 18-ból) bekerült a helyi meccserőbe (`talMeccsOvr`) és a
pillanatképébe (`snapMatchStrength`) is. Kimarad a döntetlen-függő (d85), az
esélyes-függő (Fekete bárány) és a pálya-függő tag: azok nem a keret
erejéről szólnak.

## Próba

`tools/talizman-f6d-proba.js` (port 9197, 19 állítás):

* a kilenc speciál pro- és kontra-állítása;
* a párharc-determinizmus öt magon, mindkét oldalon;
* a vödrönkénti λ, a poisson-hívásokon elkapva: a hazai λ a 0–15. percben
  ×(1,08·0,96), a 75. perctől ×1,06, a vendégé ×1,04;
* a meccserő-tükör.

Két régi próba igazodott:

* `talizman-f5-proba`: a szabadrúgás-súly forrás-mintája elfogadja a Hóhér
  szorzóját;
* `talizman-f6c-proba`: a „Meccs még nem" állítás mostantól „a Meccs is él".
