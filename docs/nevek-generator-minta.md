# 🧬 A generátor Danisítása — a két szabály mintája

*(A `docs/nevek-danisitasa.md` §6 két javaslata, kimérve. Ez MINTA: sem a
`rules.py`-t, sem a `build.py`-t nem módosítottam — a beilleszthető kód a lap
alján áll, és a te szavadra vár.)*

## 0. Egy mondatban

A két szabály a **790 gépi nevet** javítja meg a 2696-ból (**29%**) —
és a nagyobbik fele nem trükk, hanem egyetlen hiányzó szótár.

| | mit javít | hány név |
|---|---|---|
| **A — `GIVEN`-bővítés** | a kalapból húzott keresztnév | **723** |
| **B — `-son` → `-fia`** | a patronim vezetéknév | **67** |
| | | **790** |

> **ELŐBB EGY HELYESBÍTÉS.** A guide §6 azt írta a `-son` szabályra, hogy
> *„egy sor, több száz név"*. **Ez az én becslésem volt, és téves:** kimérve
> **67 név**, nem több száz. A súly a másik szabályon van.

---

## 1. A szabály — `GIVEN`-bővítés

### Miért ez a nagyobb tétel

A motor a keresztnevet a `GIVEN` térképből veszi. Ha nincs benne, `pool_given`
**kalapból húz** egy magyar nevet — a hangzáshoz semmi köze. Mérve:

| | |
|---|---|
| kalapból húzott keresztnév ma | **1463** |
| a bővítés után | **715** |
| megmentve | **748 (51%)** |

**És a maradék 715-ből 710 EGYSZERI keresztnév** — vagyis a térkép itt éri el
a természetes plafonját. Ami ezen túl van, azt már nem szótárral, hanem
egyenként kell javítani: az a `manual.py` dolga, nem a `rules.py`-é.

### A módszer a te háromlépcsős sorrended (R3)

| lépcső | mit jelent | hány bejegyzés | példa |
|---|---|---|---|
| 1. van magyar megfelelője | azt használjuk | **187** | `Eusebio → Özséb` · `Emerson → Imre` · `Nacho → Ignác` |
| 2. nincs, de jól hangzik | az eredeti, magyaros írással | **47** | `Diego → Dijégó` · `Nigel → Nájdzsel` · `Aitor → Ájtor` |
| 2/b. FORDÍTÁS | a te „Petit → Pici" vonalad | **5** | `Scott → Skót` · `Mladen → Ifjú` · `Moreno → Barna` |
| 3. csak végül a kalap | de a hangzáshoz ILLŐ | **17** | `Trevor → Töhötöm` · `Horst → Hunor` |

Az arány maga az érv: **a bejegyzések háromnegyedénél LÉTEZIK magyar
megfelelő** — a mai kalap tehát nem szükségszerű, csak hiányzó szótár.

### A négy legszebb találat

| eredeti | ma | javasolt | miért |
|---|---|---|---|
| **Eusebio** | Bertalan | **Özséb** | Eusebius magyar alakja létezik, csak nem volt a térképben |
| **Emerson** | Boldizsár | **Imre** | az Emerson és az Imre ugyanaz a név |
| **Scott** | Menyhért | **Skót** | ő maga a skót — fordítás, a te vonalad |
| **Wolfgang** | Menyhért | **Farkas** | *Wolf* = farkas, és magyar keresztnév is |

### Minta: a 723 érintett közül a 40 legmagasabb Ratingű

| játékos | OVR | ma | javasolt |
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

## 2. A szabály — `-son` → `-fia`

A guide R2 pontja szerint a `-son` = *fia*, és te magad írtad így:
`Denílson → Denifia`, `Ederson → Éderfia`, `Edílson → Édílfia`.

### Amit a nyers szabály elrontott — és mi lett belőle

Az első nekifutás három osztályon bukott meg. Mindegyik JEGYE szabályos,
tehát mindegyik szabállyal is javítható — nem kézzel:

| baj | nyers szabály | javítva | a szabály |
|---|---|---|---|
| a dán `-sen` elvesztette az s-t | `Jensen → Jenfia` | **Jénsfia** | `-sen`-ből csak az `en` esik le |
| az angol egy s-re egyszerűsít | `Ferguson → Férgufia` | **Férgusfia** | ha a tő magánhangzóra végződne, visszakapja az s-t |
| sziszegő torlódás | `Klaassen → Klaasszfia` | **Klaaszfia** | a `ssz` a `-fia` előtt `sz`-re egyszerűsödik |

És egy negyedik, ami nem a szabályból jött: **a tőnek ugyanúgy át kell mennie
a fonetikán**, mint bármely vezetéknévnek. Enélkül `Johnson → Johnfia` lett
volna — nyers angol tővel. Így: **Jóhnfia**.

### Mind a 67

| játékos | ma | javasolt |
|---|---|---|
| Ally Robertson | Róbertson Bertalan | **Róbertfia Alika** |
| Andrew Johnson | Jóhnson András | **Jóhnfia András** |
| Atiba Hutchinson | Hutcsinson Ince | **Hutcsinfia Ince** |
| Ben Watson | Vatson Bence | **Vatfia Bence** |
| Benny Nielsen | Nilsen Kornél | **Nilsfia Kornél** |
| Bo Svensson | Svensszon Töhötöm | **Svénsfia Töhötöm** |
| Brendon Batson | Bátson Aurél | **Bátfia Aurél** |
| Bryan Robson | Róbson Levente | **Róbfia Brián** |
| Callum Wilson | Vilson Dezső | **Vilfia Kálmán** |
| Christian Poulsen | Púlsen Krisztián | **Púlsfia Krisztián** |
| Claus Jensen | Jénsen Miklós | **Jénsfia Miklós** |
| Colin Gibson | Gíbson Tihamér | **Gíbfia Kolos** |
| Conny Torstensson | Torstensszon Ernő | **Tórstensfia Ernő** |
| Dan Corneliusson | Korneliusszon Levente | **Korneliusfia Dani** |
| Daniel Jensen | Jénsen Dániel | **Jénsfia Dániel** |
| Danny Simpson | Símpson Gedeon | **Símpfia Dani** |
| Danny Wilson | Vilson Elemér | **Vilfia Dani** |
| Dave McPherson | Mkferson Zétény | **Mkferfia Dávid** |
| David Hodgson | Hódgson Dávid | **Hódgfia Dávid** |
| David Robertson | Róbertson Dávid | **Róbertfia Dávid** |
| Davy Klaassen | Klaasszen Zalán | **Klaaszfia Dávid** |
| Don Masson | Masszon Sebő | **Másfia Doma** |
| Evan Ferguson | Férguson Gergő | **Férgusfia Gergő** |
| Eyjólfur Sverrisson | Sverrisszon Bertalan | **Svérrisfia Bertalan** |
| Frank Arnesen | Árnesen Ferenc | **Árnesfia Ferenc** |
| Gary Megson | Mégson Farkas | **Mégfia Geri** |
| Glen Johnson | Jóhnson Zétény | **Jóhnfia Zétény** |
| Gudni Bergsson | Bergsszon Kálmán | **Bérgsfia Kálmán** |
| Gustav Isaksen | Ísaksen Lehel | **Ísaksfia Lehel** |
| Gylfi Sigurðsson | Sigurdsszon Lehel | **Sigurdsfia Lehel** |
| Harald Nielsen | Nilsen Bendegúz | **Nilsfia Hárald** |
| Henrik Pedersen | Pédersen Henrik | **Pédersfia Henrik** |
| Hermann Hreiðarsson | Hreidarsszon Salamon | **Hreidarsfia Salamon** |
| Ivan Nielsen | Nilsen János | **Nilsfia János** |
| James Morrison | Mórrison Jakab | **Mórrisfia Jakab** |
| Jean Thissen | Tisszen János | **Tiszfia János** |
| Jerry Carlsson | Karlsszon Menyhért | **Karlsfia Menyhért** |
| Johnny Hansen | Hánsen Gergő | **Hánsfia Jancsi** |
| Jon Dahl Tomasson | Tomasszon Zsigmond | **Tómasfia János** |
| Jonatan Johansson | Johansszon Bálint | **Jóhansfia Bálint** |
| Joris Mathijsen | Matijsen Ábel | **Matijsfia György** |
| Jóhann Berg Guðmundsson | Gudmundsszon Menyhért | **Gudmundsfia Menyhért** |
| Kristoffer Zachariassen | Zacsariasszen Szabolcs | **Zacsariaszfia Szabolcs** |
| Lewis Ferguson | Férguson Mór | **Férgusfia Lajos** |
| Mark Lawrenson | Lavrenson Márk | **Lavrenfia Márk** |
| Martin Laursen | Láursen Márton | **Láursfia Márton** |
| Michael Robinson | Róbinson Mihály | **Róbinfia Mihály** |
| Neil Simpson | Símpson Salamon | **Símpfia Salamon** |
| Nicolai Jørgensen | Jőrgensen Gergő | **Jőrgensfia Gergő** |
| Nicolas Jackson | Jakkson Miklós | **Jakkfia Miklós** |
| Nigel Pearson | Pírson Domonkos | **Pírfia Nájdzsel** |
| Patrik Andersson | Andersszon Gyárfás | **Ándersfia Gyárfás** |
| Paul Robinson | Róbinson Pál | **Róbinfia Pál** |
| Peter Madsen | Mádsen Péter | **Mádsfia Péter** |
| Rasmus Kristensen | Krístensen Benedek | **Krístensfia Benedek** |
| Ronnie Simpson | Símpson Ince | **Símpfia Roni** |
| Ruben Svensson | Svensszon Mór | **Svénsfia Rúben** |
| Scott Carson | Karson Menyhért | **Karfia Skót** |
| Sonny Anderson | Ánderson Zétény | **Ánderfia Soma** |
| Steve Watson | Vatson Pista | **Vatfia Pista** |
| Stig Fredriksson | Fredriksszon Barnabás | **Frédriksfia Barnabás** |
| Terry Gibson | Gíbson Töhötöm | **Gíbfia Tihamér** |
| Thomas Wernerson | Vernerson Tamás | **Vernerfia Tamás** |
| Torbjörn Nilsson | Nilsszon Szabolcs | **Nílsfia Szabolcs** |
| Viv Anderson | Ánderson Aurél | **Ánderfia Aurél** |
| Wim Jansen | Jánsen Vilmos | **Jánsfia Vilmos** |
| Yussuf Poulsen | Púlsen Gergő | **Púlsfia Gergő** |

### Ami a szabály HATÁRÁN kívül maradt

A `Son Heung-min`-féle nevekre **nem** fut rá: a tőnek legalább három betűt
kell hagynia, és a kelet-ázsiai nevek amúgy is a kézi rétegbe valók (R4).

---

## 3. A beilleszthető kód

> **⚠️ EZ MÉG NINCS BEÉPÍTVE.** A lap eddigi része mérés; ez itt a javaslat.
> Csak akkor illeszd be, ha a fenti mintát jónak látod.

### 3.1 · `tools/nevek/rules.py` — a `GIVEN` térkép végére

A kulcsok már ékezet nélküli kisbetűs alakban vannak, ahogy a `given_of()`
keresi őket.

```python
# ── 1. LÉPCSŐ: VAN MAGYAR MEGFELELŐJE ──────────────────────────────────────
 "abel":"Ábel","adrian":"Adrián","adrien":"Adrián","agustin":"Ágoston",
 "alain":"Alán","alan":"Alán","aldo":"Aladár","aleksandr":"Sándor",
 "alekszej":"Elek","allan":"Alán","ander":"Andor","andoni":"Antal",
 "andy":"Bandi","arkadiusz":"Arkád","armando":"Ármin","arthur":"Artúr",
 "axel":"Ákos","benoit":"Benedek","billy":"Vili","bobby":"Robi",
 "callum":"Kálmán","carsten":"Krisztián","cedric":"Cirjék",
 "cesar":"Császár","christoph":"Kristóf","christopher":"Kristóf",
 "colin":"Kolos","damiano":"Damján","dan":"Dani","daniele":"Dániel",
 "danny":"Dani","dario":"Dárius","dave":"Dávid","davide":"Dávid",
 "davy":"Dávid","dean":"Dénes","demetrio":"Demeter","detlef":"Detre",
 "didier":"Dezső","dieter":"Detre","domagoj":"Domonkos",
 "domenico":"Domonkos","dominique":"Domonkos","eder":"Ede","emerson":"Imre",
 "emre":"Imre","enrico":"Imre","eusebio":"Özséb","ezequiel":"Ezékiel",
 "fabian":"Fábián","fabio":"Fábián","fabio":"Fábián","federico":"Frigyes",
 "fernando":"Nándor","florent":"Flórián","francis":"Ferenc",
 "franck":"Ferkó","frederic":"Frigyes","gabi":"Gabi","gael":"Gál",
 "gelson":"Gellért","giacomo":"Jakab","giancarlo":"Jankó","giulio":"Gyula",
 "glenn":"Kelen","gordon":"Gordián","graeme":"Gerő","greg":"Gergő",
 "guido":"Vid","guilherme":"Vilmos","guillermo":"Vilmos",
 "gustavo":"Gusztáv","hector":"Hektor","heinz":"Henrik","helmut":"Kelemen",
 "herbert":"Herbert","ian":"János","ismael":"Izmael","jacques":"Jakab",
 "jason":"Jázon","javi":"Xavika","javier":"Xavér","jens":"Jenő",
 "jeremie":"Jeremiás","jeremy":"Jeremiás","jerome":"Jeromos","jim":"Jaki",
 "jimmy":"Jaki","jocelyn":"Jácint","joe":"Jocó","johnny":"Jancsi",
 "jon":"János","jorg":"György","joris":"György","josip":"József",
 "jurij":"György","justin":"Jusztin","kamil":"Kamill","karol":"Károly",
 "ken":"Kende","kenny":"Kende","konstantin":"Konstantin",
 "kostas":"Konstantin","kurt":"Konrád","leandro":"Leánder","lewis":"Lajos",
 "lilian":"Lipót","luciano":"Lucián","ludovic":"Lajos","luiz":"Lajos",
 "mamadou":"Mohács","manfred":"Manfréd","marcel":"Marcell",
 "marcelo":"Marcell","mariano":"Marián","massimo":"Miksa","matias":"Mátyás",
 "mauricio":"Móric","maurizio":"Móric","mauro":"Mór","maxence":"Miksa",
 "maxi":"Miksa","maximilian":"Miksa","michał":"Mihály","mick":"Miska",
 "mickael":"Mihály","mike":"Miska","mikel":"Mihály","mitchell":"Mihály",
 "moussa":"Mózes","nacho":"Ignác","nestor":"Nesztor","nick":"Miki",
 "nicky":"Miki","nico":"Miklós","nicolo":"Miklós","niko":"Miklós",
 "norbert":"Norbert","nuno":"Nándor","ola":"Olaf","olaf":"Olaf",
 "oleksandr":"Sándor","paco":"Ferkó","pascal":"Paszkál","pat":"Patrik",
 "piero":"Péter","piet":"Péter","radoslav":"Radó","rainer":"Rajnald",
 "renato":"Renátó","rene":"Renátó","robin":"Robi","roger":"Rezső",
 "romeo":"Romeó","ron":"Roni","ronnie":"Roni","ruben":"Rúben",
 "santiago":"Jakab","sascha":"Sanyi","sebastiano":"Sebestyén",
 "shaun":"János","sonny":"Soma","souleymane":"Salamon",
 "stanislav":"Szaniszló","stephane":"István","sylvain":"Szilveszter",
 "szergej":"Szergej","teddy":"Tivadar","tim":"Timót","timo":"Timót",
 "tobias":"Tóbiás","tommy":"Tomi","tony":"Tóni","uli":"Ulrik",
 "ulrich":"Ulrik","valerij":"Valér","vaszilij":"Vazul","vincenzo":"Vince",
 "vlagyimir":"Vladi","wes":"Vencel","willie":"Vili","wolfgang":"Farkas",
 "yann":"János","yoann":"János","ze":"Jocó","zeljko":"Zsolt",
 "zlatko":"Zalán",
# ── 2. LÉPCSŐ: NINCS, DE MAGYAROS ÍRÁSSAL JÓL HANGZIK ──────────────────────
 "adamo":"Ádám","aitor":"Ájtor","ali":"Áli","ally":"Alika","alvaro":"Álvár",
 "angelo":"Andzseló","angelos":"Angelusz","ashley":"Esli","brad":"Brád",
 "bradley":"Brádli","brian":"Brián","bryan":"Brián","claudio":"Kolos",
 "claudio":"Kolos","corentin":"Korentin","declan":"Dékán","dejan":"Deján",
 "diego":"Dijégó","dusan":"Dusán","fatih":"Fátih","gareth":"Geret",
 "gary":"Geri","geoff":"Dzsef","goncalo":"Gonzaló","gonzalo":"Gonzaló",
 "graham":"Gréhem","harald":"Hárald","jamie":"Dzsémi","jeff":"Dzsef",
 "jeffrey":"Dzsefri","karim":"Kárim","kasper":"Kászper","keith":"Kít",
 "marvin":"Márvin","miroslav":"Miroszláv","nigel":"Nájdzsel","omar":"Omár",
 "pierluigi":"Pelbárt","rachid":"Rásid","rodrigo":"Rodrigó",
 "ronald":"Ronáld","ryan":"Rájen","salvatore":"Szalvátor",
 "stuart":"Sztuart","sultan":"Szultán","sven":"Szvén","timmy":"Timkó",
# ── 2/b. FORDÍTÁS (a „Petit → Pici” vonal) ─────────────────────────────────
 "angel":"Angyal","mladen":"Ifjú","moreno":"Barna","morgan":"Morgó",
 "scott":"Skót",
# ── 3. LÉPCSŐ: KALAP, DE A HANGZÁSHOZ ILLŐ ─────────────────────────────────
 "abdoulay":"Ábel","arouna":"Arnold","darren":"Dorián",
 "don":"Doma","eren":"Örs","garry":"Geri","gokhan":"Gyárfás",
 "holger":"Huba","horst":"Hunor","miodrag":"Mikó","nawaf":"Noé","roy":"Roj",
 "santi":"Szanyi","seydou":"Sebő","terry":"Tihamér","trevor":"Töhötöm",
```

> **EGY BEJEGYZÉS FELÜLÍRÁS, NEM BŐVÍTÉS.** A `christoph` ma `Krisztián`;
> a guide R3 pontja szerint viszont `Christoph → Kristóf` (a te példád). A
> fenti blokk ezt **átírja**. Ha nem akarod, vedd ki belőle.

### 3.2 · `tools/nevek/rules.py` — a `-son` szabály

```python
HU_MGH = set("aeiouáéíóöőúüű")
SON_LANG = {"pt", "en", "sc", "nl"}

def son_stem(w):
    """A patronim VEZETÉKNÉV töve, ha az. A -son = fia (R2).

    Három írásmód, három levágás — mindhárom a kiejtésből következik:
      -sson  a birtokos s a TŐHÖZ tartozik   Nilsson  → Nils
      -sen   dán/norvég, az s szintén         Jensen   → Jens
      -son   sima levágás                     Watson   → Wat
    Az angol viszont EGY s-re egyszerűsít, ha a tő s-re végződne: a
    Ferguson tövében ott a Fergus, a Morrisonéban a Morris — ezt onnan
    ismerjük fel, hogy a levágott tő magánhangzóra végződne.
    Rövid tő (3 betű alatt) nem patronim: a Son Heung-min nem valakinek
    a fia, hanem így hívják."""
    lw = w.lower()
    if lw.endswith("sson"):
        st = w[:-3]
    elif lw.endswith("sen"):
        st = w[:-2]
    elif lw.endswith(("son", "zon")):
        st = w[:-3]
        if st and st[-1].lower() in HU_MGH:
            st += "s"
    else:
        return None
    return st if len(st) >= 3 else None


def son_fia(stem_phon):
    """A -fia hozzáragasztása a MÁR FONETIZÁLT tőhöz. A sziszegő véget
       egyszerűsítjük: a „Klaasszfia” kimondhatatlan, a „Klaaszfia” nem."""
    import re as _re
    return _re.sub(r"ssz$", "sz", stem_phon) + "fia"
```

### 3.3 · `tools/nevek/build.py` — az `auto()` egyszavas vezetéknév-ágán

```python
    first, surw = parts[0], parts[cut:]
    if len(surw) == 1:
        # -son = fia (R2). A TŐ UGYANÚGY ÁTMEGY A FONETIKÁN, mint bármely
        # vezetéknév — enélkül nyers angol maradna („Johnfia”).
        _st = son_stem(surw[0]) if lg in SON_LANG else None
        if _st:
            _h = hufy(_st, lg)
            if strip_dia(_h.lower()) == strip_dia(_st.lower()):
                _h = lengthen(_h)
            sur = son_fia(_h[0].upper() + _h[1:])
        else:
            sur = hufy(surw[0], lg)
            if strip_dia(sur.lower()) == strip_dia(surw[0].lower()):
                sur = lengthen(sur)
    else:
        sur = cap("".join(hufy(w, lg) for w in surw))
        if strip_dia(sur.lower()) == strip_dia("".join(surw).lower()):
            sur = lengthen(sur)
```

Az importsorba `son_stem, son_fia, SON_LANG` is kell.

---

## 4. Mielőtt beépítjük — három dolog

**1. A KÉZI RÉTEG SÉRTHETETLEN.** A 950 `manual.py`-bejegyzés a generátor
fölött áll: a build előbb a `MANUAL`-t nézi. A két szabály tehát **egyetlen
kézi javításodat sem írja felül** — csak a gépi 2696-ot érinti.

**2. A FUTÓ KARRIEREKBEN ÁTNEVEZŐDNEK A JÁTÉKOSOK.** A mentés a KANONIKUS
néven kulcsol, a megjelenítés pedig a `HU_NAME_TABLE`-ből olvas — a mentés
tehát **nem törik el**, de akinek eddig `Kol Aurél` volt a neve, az a
frissítés után `Kol Bandi` lesz, karrier közben. Ez nem hiba, hanem
következmény; jó tudni előre.

**3. A `build.py` KÖZVETLENÜL AZ `index.html`-T ÍRJA.** Nincs külön kapcsoló:
a futtatás azonnal él. Ezért áll ez a lap mérésként, beépítés nélkül.

---

## 5. Mit NEM old meg

* **A maradék 715 kalapos nevet.** Azok egyszeri keresztnevek — szótárral nem,
  csak egyenként javíthatók.
* **A `Mk`-kezdetet.** `McCoist → Mkkoist`, `McPherson → Mkferfia`: a `Mc`/`Mac`
  előtagot a motor ma nem ismeri. Ez egy HARMADIK szabály volna, és a mérés
  szerint megérné — de nem ez a két szabály dolga.
* **Az 1127 csak-ékezetes nevet.** Azoknál a fonetika lefutott, csak keveset
  változtatott; az a `hufy` finomítása, nem szótárkérdés.

---

## 6. A mérés hitelesítése — a javaslat le is futott

A fenti számok nem becslések: a javasolt `rules.py`-t és `build.py`-t
**homokozóban lefuttattam** az `index.html` egy másolatán, és összevetettem a
mostani táblával.

| | |
|---|---|
| a tábla mérete | 3646 → **3646** (nem vész el és nem születik név) |
| a jóslat | 790 név változna |
| a VALÓS build | **791** név változott |
| a 790-ből eltérő kimenet | **0** |
| **sérült kézi (`MANUAL`) bejegyzés** | **0** |

### A 791. név — és miért jó hír

`Kevin Müller: Müljer Bendegúz → Müljer Kelemen`. Ezt a mérés nem jósolta meg,
mert nem futtatja az **ütközés-feloldót** — azt az ágat, ami azonos teljes
névnél a másodiktól más keresztnevet oszt. Öt Müller van a bázisban:

| | ma | javasolt |
|---|---|---|
| Dieter Müller | Müljer **Kelemen** | Müljer Detre |
| Heinz Müller | Müljer Ambrus | Müljer Henrik |
| **Kevin Müller** | Müljer **Bendegúz** | Müljer **Kelemen** |
| Manfred Müller | Müljer Álmos | Müljer Manfréd |
| Patrick Müller | Müljer Patrik | Müljer Patrik |

A `Kevin` **ma is** `Kelemen` a `GIVEN`-ben — csakhogy a nevet elhappolta
előle `Dieter`, aki kalapból húzta. Amint `Dieter` megkapja a sajátját
(`Detre`), a `Kelemen` visszakerül a jogos gazdájához, és `Kevin` nem szorul
többé pótnévre.

**Ez a szabály másodlagos nyeresége:** minden kalapból húzott név, ami
megszűnik, felszabadít egy nevet valakinek, akihez tényleg tartozik.
