# 🧬 A generátor Danisítása — a két szabály

*(3.9.09. `tools/nevek/rules.py`: a `GIVEN` bővítése, `son_stem`,
`son_suffix`, `SON_HAT`, `SON_LANG` · `tools/nevek/build.py`: az `auto()`
egyszavas vezetéknév-ága.)*

> **✅ BE VAN ÉPÍTVE ÉS LE VAN FUTTATVA.** Ez a lap már nem javaslat, hanem
> jegyzőkönyv: a `HU_NAME_TABLE` a két szabállyal van legyártva.

## 0. Egy mondatban

A két szabály **791 gépi nevet** javított meg a 2696-ból (**29%**) —
és a nagyobbik fele nem trükk, hanem egyetlen hiányzó szótár.

| | mit javít | hány név |
|---|---|---|
| **A — `GIVEN`-bővítés** | a kalapból húzott keresztnév | **724** |
| **B — patronim `-son`** | a vezetéknév végződése | **67** |
| | | **791** |

> **HELYESBÍTÉS a guide-hoz.** A §6 azt írta a `-son` szabályra, hogy *„egy
> sor, több száz név"*. **Ez az én becslésem volt, és téves:** 67 név.
> A súly a `GIVEN`-bővítésen van.

---

## 1. A szabály — `GIVEN`-bővítés

### Miért ez a nagyobb tétel

A motor a keresztnevet a `GIVEN` térképből veszi. Ha nincs benne, a
`pool_given` **kalapból húz** egy magyar nevet — a hangzáshoz semmi köze.

| | |
|---|---|
| kalapból húzott keresztnév előtte | **1463** |
| utána | **715** |
| megszűnt | **748 (51%)** |

**És a maradék 715-ből 710 EGYSZERI keresztnév** — vagyis a térkép itt éri
el a természetes plafonját. Ami ezen túl van, azt már nem szótárral, hanem
egyenként kell javítani: az a `manual.py` dolga, nem a `rules.py`-é.

### A módszer a háromlépcsős sorrend (guide R3)

| lépcső | mit jelent | hány bejegyzés | példa |
|---|---|---|---|
| 1. van magyar megfelelője | azt használjuk | **187** | `Eusebio → Özséb` · `Emerson → Imre` · `Nacho → Ignác` |
| 2. nincs, de jól hangzik | az eredeti, magyaros írással | **47** | `Diego → Dijégó` · `Nigel → Nájdzsel` · `Aitor → Ájtor` |
| 2/b. FORDÍTÁS | a „Petit → Pici" vonal | **5** | `Scott → Skót` · `Mladen → Ifjú` · `Moreno → Barna` |
| 3. csak végül a kalap | de a hangzáshoz ILLŐ | **16** | `Trevor → Töhötöm` · `Horst → Hunor` |

Az arány maga az érv: **a bejegyzések háromnegyedénél LÉTEZIK magyar
megfelelő** — a régi kalap tehát nem szükségszerű volt, csak hiányzó szótár.

### A négy legszebb találat

| eredeti | előtte | utána | miért |
|---|---|---|---|
| **Eusebio** | Bertalan | **Özséb** | Eusebius magyar alakja létezik, csak nem volt a térképben |
| **Emerson** | Boldizsár | **Imre** | az Emerson és az Imre ugyanaz a név |
| **Scott** | Menyhért | **Skót** | ő maga a skót — fordítás |
| **Wolfgang** | Menyhért | **Farkas** | *Wolf* = farkas, és magyar keresztnév is |

### A 724 érintett közül a 40 legmagasabb Ratingű

| játékos | OVR | előtte | utána |
|---|---|---|---|
| Alain Giresse | 85 | Giressz Salamon | **Giressz Alán** |
| Ally McCoist | 85 | Mkkoist Elemér | **Mkkoist Alika** |
| Andy Cole | 85 | Kol Aurél | **Kol Bandi** |
| Billy Bremner | 85 | Brémner Ernő | **Brémner Vili** |
| Billy McNeill | 85 | Mkneili Vazul | **Mkneili Vili** |
| Cláudio Taffarel | 85 | Táffarel Nándor | **Táffarel Kolos** |
| Emerson Ferreira | 85 | Férreira Boldizsár | **Férreira Imre** |
| Geoff Hurst | 85 | Húrst Mór | **Húrst Dzsef** |
| Gordon Strachan | 85 | Stracsan Levente | **Stracsan Gordián** |
| Marcelo Gallardo | 85 | Galjardo Gedeon | **Galjardo Marcell** |
| Vincenzo Montella | 85 | Montelja Bálint | **Montelja Vince** |
| Willie Miller | 85 | Miljer Boldizsár | **Miljer Vili** |
| Armando Picchi | 84 | Pikki Bertalan | **Pikki Ármin** |
| Bradley Barcola | 84 | Barkola Salamon | **Barkola Brádli** |
| Claudio Gentile | 84 | Dzsentile Zétény | **Dzsentile Kolos** |
| Dieter Müller | 84 | Müljer Kelemen | **Müljer Detre** |
| Franck Kessié | 84 | Kesszié Jenő | **Kesszié Ferkó** |
| Gary Pallister | 84 | Paljister Domonkos | **Paljister Geri** |
| Giacomo Bulgarelli | 84 | Bulgarelji Tas | **Bulgarelji Jakab** |
| Helmut Haller | 84 | Haljer Barnabás | **Haljer Kelemen** |
| Johnny Giles | 84 | Gíles Dezső | **Gíles Jancsi** |
| Miodrag Belodedić | 84 | Belodedics Dezső | **Belodedics Mikó** |
| Paco Buyo | 84 | Bujo Ákos | **Bujo Ferkó** |
| Piet Keizer | 84 | Kéizer Ákos | **Kéizer Péter** |
| Romeo Menti | 84 | Ménti Ábris | **Ménti Romeó** |
| Roy Makaay | 84 | Makaéj Lehel | **Makaéj Roj** |
| Roy McFarland | 84 | Mkfarland Dezső | **Mkfarland Roj** |
| Trevor Francis | 84 | Franszis Bertalan | **Franszis Töhötöm** |
| Uli Stein | 84 | Stájn Szabolcs | **Stájn Ulrik** |
| Uli Stielike | 84 | Stilike Farkas | **Stilike Ulrik** |
| Éder Aleixo | 84 | Aleikszo Ábel | **Aleikszo Ede** |
| Éder Militão | 84 | Mílitao Levente | **Mílitao Ede** |
| Aldo Serena | 83 | Sérena Ákos | **Sérena Aladár** |
| Allan Clarke | 83 | Klark Miksa | **Klark Alán** |
| Andy Goram | 83 | Góram Ákos | **Góram Bandi** |
| Daniele Bonera | 83 | Bónera Vilmos | **Bónera Dániel** |
| Dominique Rocheteau | 83 | Rosetíu Zsombor | **Rosetíu Domonkos** |
| Dušan Tadić | 83 | Tadics Vazul | **Tadics Dusán** |
| Eusebio Castigliano | 83 | Kastiljiano Bertalan | **Kastiljiano Özséb** |
| Frédéric Kanouté | 83 | Kanúté Zsombor | **Kanúté Frigyes** |

---

## 2. A szabály — patronim `-son`

A guide R2 pontja szerint a `-son` = *fia*: `Denílson → Denifia`,
`Ederson → Éderfia`, `Edílson → Édílfia`.

### A végződés HÁROM alakja — és miért nem a `-fia`

**BEJELENTETT KÉRÉS:** *„ezek a -fia javítások jók lennének, de mégsem,
legyen helyettük a végződés többségében -fi (50%) / -ffy (33%), és ritkán
csak -fia (16%)"*.

És ez pontos: a **`-fia` leírás, nem név**. A „Vatfia" megmagyarázza, kicsoda
az illető, de nem hangzik vezetéknévnek. Ugyanez a jelentés a magyar
névanyagban két RÉGI, valódi végződésben él — a polgári **`-fi`** (Győrfi,
Pálfi) és a nemesi **`-ffy`** (Pálffy, Bánffy) —, és ezek adják a hangulatot,
amit a `-fia` csak elmagyaráz.

| végződés | cél | **mért** |
|---|---|---|
| `-fi` | 50% | **32 (48%)** |
| `-ffy` | 33% | **24 (36%)** |
| `-fia` | 16% | **11 (16%)** |

### Két megkötés, ami nem volt a kérésben, de kell

**1. A VÉGZŐDÉS A VEZETÉKNÉVHEZ TARTOZIK, NEM A JÁTÉKOSHOZ.** Két Wilson
ugyanazt a nevet viseli; ha játékosonként sorsolnánk, a `Vilfi` és a
`Vilffy` egymás mellett állna a keretben — az nem stílus volna, hanem
hibának látszó következetlenség. Mérve: **0** olyan vezetéknév van, amelyik
kétféle végződést kapott.

**2. DETERMINISZTIKUS.** A build újrafuttatása nem írhatja át a neveket, és
egy új keret felvétele sem mozdíthatja el a meglévőket. Ugyanaz a tő mindig
ugyanazt a végződést adja — ugyanaz a hash, amit a `pool_given` is használ.

> **AZ ARÁNY CÉL, NEM GARANCIA.** Épp mert determinisztikus, a tényleges
> megoszlás azon múlik, milyen tövek vannak a bázisban. A felbontás ezért
> **ezredes, nem hatodos**: a 3:2:1 hatodos osztás ilyen kis mintán (ma 52
> különböző tő) durván félrehúz. Mérve, ugyanazon a hash-en:
> `h % 6` → **45/42/13** · `h % 1000` → **48/36/16**. A második van beépítve.

### Amit a nyers szabály elrontott — és mi lett belőle

Az első nekifutás három osztályon bukott meg. Mindegyik JEGYE szabályos,
tehát mindegyik szabállyal is javítható — nem kézzel:

| baj | nyers szabály | javítva | a szabály |
|---|---|---|---|
| a dán `-sen` elvesztette az s-t | `Jensen → Jenfi` | **Jénsffy** | a `-sen`-ből csak az `en` esik le |
| az angol egy s-re egyszerűsít | `Ferguson → Férgufi` | **Férgusffy** | ha a tő magánhangzóra végződne, visszakapja az s-t |
| sziszegő torlódás | `Klaassen → Klaasszfi` | **Klaaszfia** | a `ssz` a végződés előtt `sz`-re egyszerűsödik |

És egy negyedik, ami nem a szabályból jött: **a tőnek ugyanúgy át kell mennie
a fonetikán**, mint bármely vezetéknévnek. Enélkül `Johnson → Johnfi` lett
volna — nyers angol tővel. Így: **Jóhnffy**.

### Mind a 67

| játékos | előtte | utána |
|---|---|---|
| Ally Robertson | Róbertson Bertalan | **Róbertffy Alika** |
| Andrew Johnson | Jóhnson András | **Jóhnffy András** |
| Atiba Hutchinson | Hutcsinson Ince | **Hutcsinfi Ince** |
| Ben Watson | Vatson Bence | **Vatffy Bence** |
| Benny Nielsen | Nilsen Kornél | **Nilsfi Kornél** |
| Bo Svensson | Svensszon Töhötöm | **Svénsffy Töhötöm** |
| Brendon Batson | Bátson Aurél | **Bátfi Aurél** |
| Bryan Robson | Róbson Levente | **Róbfi Brián** |
| Callum Wilson | Vilson Dezső | **Vilffy Kálmán** |
| Christian Poulsen | Púlsen Krisztián | **Púlsffy Krisztián** |
| Claus Jensen | Jénsen Miklós | **Jénsffy Miklós** |
| Colin Gibson | Gíbson Tihamér | **Gíbffy Kolos** |
| Conny Torstensson | Torstensszon Ernő | **Tórstensfi Ernő** |
| Dan Corneliusson | Korneliusszon Levente | **Korneliusfia Dani** |
| Daniel Jensen | Jénsen Dániel | **Jénsffy Dániel** |
| Danny Simpson | Símpson Gedeon | **Símpfi Dani** |
| Danny Wilson | Vilson Elemér | **Vilffy Dani** |
| Dave McPherson | Mkferson Zétény | **Mkferfia Dávid** |
| David Hodgson | Hódgson Dávid | **Hódgfia Dávid** |
| David Robertson | Róbertson Dávid | **Róbertffy Dávid** |
| Davy Klaassen | Klaasszen Zalán | **Klaaszfi Dávid** |
| Don Masson | Masszon Sebő | **Másfia Doma** |
| Evan Ferguson | Férguson Gergő | **Férgusfia Gergő** |
| Eyjólfur Sverrisson | Sverrisszon Bertalan | **Svérrisffy Bertalan** |
| Frank Arnesen | Árnesen Ferenc | **Árnesfi Ferenc** |
| Gary Megson | Mégson Farkas | **Mégfi Geri** |
| Glen Johnson | Jóhnson Zétény | **Jóhnffy Zétény** |
| Gudni Bergsson | Bergsszon Kálmán | **Bérgsffy Kálmán** |
| Gustav Isaksen | Ísaksen Lehel | **Ísaksfia Lehel** |
| Gylfi Sigurðsson | Sigurdsszon Lehel | **Sigurdsfi Lehel** |
| Harald Nielsen | Nilsen Bendegúz | **Nilsfi Hárald** |
| Henrik Pedersen | Pédersen Henrik | **Pédersffy Henrik** |
| Hermann Hreiðarsson | Hreidarsszon Salamon | **Hreidarsfi Salamon** |
| Ivan Nielsen | Nilsen János | **Nilsfi János** |
| James Morrison | Mórrison Jakab | **Mórrisfia Jakab** |
| Jean Thissen | Tisszen János | **Tiszfi János** |
| Jerry Carlsson | Karlsszon Menyhért | **Karlsfi Menyhért** |
| Johnny Hansen | Hánsen Gergő | **Hánsfi Jancsi** |
| Jon Dahl Tomasson | Tomasszon Zsigmond | **Tómasfi János** |
| Jonatan Johansson | Johansszon Bálint | **Jóhansfi Bálint** |
| Joris Mathijsen | Matijsen Ábel | **Matijsfi György** |
| Jóhann Berg Guðmundsson | Gudmundsszon Menyhért | **Gudmundsffy Menyhért** |
| Kristoffer Zachariassen | Zacsariasszen Szabolcs | **Zacsariaszfi Szabolcs** |
| Lewis Ferguson | Férguson Mór | **Férgusfia Lajos** |
| Mark Lawrenson | Lavrenson Márk | **Lavrenfi Márk** |
| Martin Laursen | Láursen Márton | **Láursfia Márton** |
| Michael Robinson | Róbinson Mihály | **Róbinffy Mihály** |
| Neil Simpson | Símpson Salamon | **Símpfi Salamon** |
| Nicolai Jørgensen | Jőrgensen Gergő | **Jőrgensfi Gergő** |
| Nicolas Jackson | Jakkson Miklós | **Jakkfi Miklós** |
| Nigel Pearson | Pírson Domonkos | **Pírfi Nájdzsel** |
| Patrik Andersson | Andersszon Gyárfás | **Ándersfi Gyárfás** |
| Paul Robinson | Róbinson Pál | **Róbinffy Pál** |
| Peter Madsen | Mádsen Péter | **Mádsfi Péter** |
| Rasmus Kristensen | Krístensen Benedek | **Krístensfi Benedek** |
| Ronnie Simpson | Símpson Ince | **Símpfi Roni** |
| Ruben Svensson | Svensszon Mór | **Svénsffy Rúben** |
| Scott Carson | Karson Menyhért | **Karfia Skót** |
| Sonny Anderson | Ánderson Zétény | **Ánderfi Soma** |
| Steve Watson | Vatson Pista | **Vatffy Pista** |
| Stig Fredriksson | Fredriksszon Barnabás | **Frédriksffy Barnabás** |
| Terry Gibson | Gíbson Töhötöm | **Gíbffy Tihamér** |
| Thomas Wernerson | Vernerson Tamás | **Vernerfia Tamás** |
| Torbjörn Nilsson | Nilsszon Szabolcs | **Nílsffy Szabolcs** |
| Viv Anderson | Ánderson Aurél | **Ánderfi Aurél** |
| Wim Jansen | Jánsen Vilmos | **Jánsfi Vilmos** |
| Yussuf Poulsen | Púlsen Gergő | **Púlsffy Gergő** |

### Ami a szabály HATÁRÁN kívül maradt

A `Son Heung-min`-féle nevekre **nem** fut rá: a tőnek legalább három betűt
kell hagynia, és a kelet-ázsiai nevek amúgy is a kézi rétegbe valók (R4).

---

## 3. Amit a beépítés NEM tett

**A KÉZI RÉTEG SÉRTETLEN.** A 950 `manual.py`-bejegyzés a generátor fölött
áll: a build előbb a `MANUAL`-t nézi. Mérve a valódi build után: **0 sérült
kézi bejegyzés**, és a tábla mérete változatlan (3646).

**A FUTÓ KARRIEREKBEN ÁTNEVEZŐDNEK A JÁTÉKOSOK.** A mentés a KANONIKUS néven
kulcsol, a megjelenítés a `HU_NAME_TABLE`-ből olvas — a mentés tehát **nem
törik el**, de akinek eddig `Kol Aurél` volt a neve, az `Kol Bandi` lett,
karrier közben. Ez nem hiba, hanem következmény.

---

## 4. A 791. név — az ütközés-feloldó ajándéka

`Kevin Müller: Müljer Bendegúz → Müljer Kelemen`. Ezt a szabályok maguktól
nem magyarázzák: az **ütközés-feloldó** hozta, ami azonos teljes névnél a
másodiktól más keresztnevet oszt. Öt Müller van a bázisban:

| | előtte | utána |
|---|---|---|
| Dieter Müller | Müljer **Kelemen** | Müljer Detre |
| Heinz Müller | Müljer Ambrus | Müljer Henrik |
| **Kevin Müller** | Müljer **Bendegúz** | Müljer **Kelemen** |
| Manfred Müller | Müljer Álmos | Müljer Manfréd |
| Patrick Müller | Müljer Patrik | Müljer Patrik |

A `Kevin` **eddig is** `Kelemen` volt a `GIVEN`-ben — csakhogy a nevet
elhappolta előle `Dieter`, aki kalapból húzta. Amint `Dieter` megkapta a
sajátját (`Detre`), a `Kelemen` visszakerült a jogos gazdájához.

**Ez a szabály másodlagos nyeresége:** minden megszűnő kalapos név
felszabadít egy nevet valakinek, akihez tényleg tartozik.

---

## 5. Mit NEM old meg

* **A maradék 715 kalapos nevet.** Azok egyszeri keresztnevek — szótárral
  nem, csak egyenként javíthatók.
* **A `Mk`-kezdetet.** `McCoist → Mkkoist`, `McPherson → Mkferfia`: a
  `Mc`/`Mac` előtagot a motor ma sem ismeri. Ez egy HARMADIK szabály volna.
* **Az 1127 csak-ékezetes nevet.** Azoknál a fonetika lefutott, csak keveset
  változtatott; az a `hufy` finomítása, nem szótárkérdés.
