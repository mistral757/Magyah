# 🎭 Száz név — a módszer alkalmazva

*(A `docs/nevek-danisitasa.md` guide gyakorlati párja. Mind a száz név
**gépi átírású** ma, és egyikhez sem nyúltál a `bf84bde`-ben.)*

## Hogyan használd

A táblázat alatt van egy **beilleszthető blokk** a `tools/nevek/manual.py`
végére. Utána:

```bash
python3 tools/nevek/build.py     # újragyártja a HU_NAME_TABLE-t
./tools/check.sh                 # szintaxis · globálisok · nyers nevek
```

> **Nyolc sor SZERKESZTÉS, nem új sor.** Az „ifj."-es kettőzés-feloldások
> (`Coutinho`, `Maldini`, `Baggio`, `Best`, `Charlton`, `Kopa`, `Fontaine`,
> `Matthäus`) már benne vannak a `manual.py`-ban — azoknál a MEGLÉVŐ sort
> kell átírni. A blokk ezt külön jelöli.

Az „R" hivatkozások a guide szabályaira mutatnak. A *Rating* oszlop azt
mondja, mennyire fogja a felhasználó látni ezt a nevet.

---

## 0. ELŐBB: mentsük meg a meglévő 240-et

**A `bf84bde` javításai ma védtelenek.** Az a commit kizárólag az
`index.html`-t módosította, a `manual.py`-t nem — a generátor tehát nem tud
róluk, és **a `build.py` egyetlen futása mind a 240-et visszaírja a gépi
alakra**. Mérve: `Aaron Lennon` „Lenyó Áron"-ról visszament „Lénnon
Áron"-ra, és vele a többi 239.

Ez a blokk átemeli őket a `manual.py`-ba (202 új sor, 38 meglévő
felülírása). **Ezt kell először beilleszteni**, még a lenti száz javaslat
előtt — különben az első újragyártás elviszi a munkádat.

```python
# ── A „Nevek Danisítása lvl100” (bf84bde) MEGŐRZÉSE ───────────────────────
# Ezek a javítások eddig CSAK az index.html-ben éltek: a build.py egy
# futása mind a 240-et visszaírta volna a gépi alakra. Innentől a
# manual.py őrzi őket, tehát újragyártás után is megmaradnak.
MANUAL.update({
  "Aaron Lennon": ("Lenyó Áron", "Lenyó"),
  "Adamo Coulibaly": ("Kúlibali Ádám", "Kúlibali"),
  "Ademola Lookman": ("Figyeljmán Ademóla", "Figyeljmán"),
  "Adriano": ("Ádrijánó", "Ádrijánó"),
  "Adrien Rabiot": ("Rábijó Adriján", "Rábijó"),
  "Adrián": ("Ádriján", "Ádriján"),
  "Adílson": ("Ádílszon", "Ádílszon"),
  "Alberto Gilardino": ("Zsilárdínó Albert", "Zsilárdínó"),
  "Alberto Moreno": ("Morénó Albert", "Morénó"),
  "Aleksandr Anyukov": ("Anyukád Tas", "Anyukád"),
  "Alessandro Bastoni": ("Bástonyi Sándor", "Bástonyi"),
  "Alessio Romagnoli": ("Románjoli Miksa", "Románjoli"),
  "Alex Oxlade-Chamberlain": ("Okszi-Csamberléjn Sándor", "Okszi-Csamberléjn"),
  "Alexander Isak": ("Izsák Alex", "Izsák"),
  "Alexander Sørloth": ("Szőrló Sándor", "Szőrló"),
  "Alexandre Lacazette": ("Lakazetta Sándor", "Lakazetta"),
  "Alexis Saelemaekers": ("Szálkészítő Alex", "Szálkészítő"),
  "Alexis Sánchez": ("Sáncsesző Zalán", "Sáncsesző"),
  "Amir Hadžiahmetović": ("Hadzsiahmetovics Salamon", "Hadzsiahmetovics"),
  "Andreas Isaksson": ("Iszaksszon András", "Iszaksszon"),
  "Andrei Arshavin": ("Seggborotváló András", "Seggborotváló"),
  "Andriy Lunin": ("Lúnyin András", "Lúnyin"),
  "André Schürrle": ("Csürhe András", "Csürhe"),
  "André-Pierre Gignac": ("Zsinyak András", "Zsinyak"),
  "Antonio Di Natale": ("Dínótál E. Antal", "Dínótál"),
  "Artem Dzyuba": ("Dzsuba Zsigmond", "Dzsuba"),
  "Aurélien Tchouaméni": ("Csúaméni Lehel", "Csúaméni"),
  "Batista": ("Bátiszta", "Bátiszta"),
  "Benjamin Pavard": ("Paraván Benjámin", "Paraván"),
  "Bruno Fernandes": ("Brunyáló Ferkó", "Burnyáló"),
  "Bruno Guimarães": ("Gúimarés Brunó", "Gúimarés"),
  "Casemiro": ("Kázijó Mirejó", "Kázijó"),
  "Charles De Ketelaere": ("Detekeláre Károly", "Detekeláre"),
  "Chris Woods": ("Vúdsz Krisztián", "Vúdsz"),
  "Christian Abbiati": ("Albi Átiratás Krisztián", "Albi Átiratás"),
  "Ciro Immobile": ("Immozdulatlan Síró", "Immozdulatlan"),
  "Claudio Marchisio": ("Markízió Kálmán", "Markízió"),
  "Claudio Pizarro": ("Pizzaszaró Lehel", "Pizzaszaró"),
  "Clint Dempsey": ("Dempszi Benedek", "Dempszi"),
  "Cody Gakpo": ("Hákpó Vilmos", "Hákpó"),
  "Daniel Agger": ("Egér Dániel", "Egér"),
  "Daniel Carvalho": ("Karvaly Jó Dániel", "Karvaly Jó"),
  "Daniel Van Buyten": ("Fanböjten Dániel", "Fanböjten"),
  "Daniele De Rossi": ("Derosszígy Dani", "Derosszígy"),
  "Danilo": ("Dani a Ló", "DaniLó"),
  "Danilo D'Ambrosio": ("Dámbrosio Dani", "Dámbrosio"),
  "Danny Rose": ("Rózsa Mór", "Rózsa"),
  "David Ginola": ("Zsinórka Dávid", "Zsinórka"),
  "Davide Zappacosta": ("Cappakoszta Jenő", "Cappakoszta"),
  "Dejan Kulusevski": ("Kuluszevszki Ábel", "Kuluszevszki"),
  "Denílson": ("Denifia", "Denifia"),
  "Derlei": ("Der Lej", "Der Lej"),
  "Diego": ("Dijégó", "Dijégó"),
  "Diego Forlán": ("Fórlány Rezső", "Fórlány"),
  "Diego Tristán": ("Trísztán Ábris", "Trísztán"),
  "Diogo Jota": ("Zsóta Dijégó", "Zsóta"),
  "Dirk Kuyt": ("Köjt Barnabás", "Köjt"),
  "Divock Origi": ("Óriginál Vazul", "Óriginál"),
  "Dominic Calvert-Lewin": ("Kárérte-Levinek Lehel", "Kárérte-Levinek"),
  "Douglas Costa": ("Dugulást Okozta", "Dugulást Okozta"),
  "Eduardo Camavinga": ("Kámávinga Ede", "Kámávinga"),
  "Edílson": ("Édílfia", "Édílfia"),
  "Eliseu": ("Elizeus", "Elizeus"),
  "Emil Forsberg": ("Fórszberg Emil", "Fórszberg"),
  "Emmanuel Adebayor": ("Ajjdebajos Manó", "Ajjdebajos"),
  "Emmanuel Ntim": ("Egycsapat Manó", "Egycsapat"),
  "Emre Can": ("Kan Imre", "Kan"),
  "Enrico Chiesa": ("Kieza Tihamér", "Kieza"),
  "Eric Dier": ("Dajjer Erik", "Dajjer"),
  "Eric Maxim Choupo-Moting": ("Csupa-Mócsing Erik", "Csupa-Mócsing"),
  "Erwin Koeman": ("Kúman Farkas", "Kúman"),
  "Everton": ("Mindigton", "Mindigton"),
  "Ezequiel Lavezzi": ("Lávedzi Benedek", "Lávedzi"),
  "Fabio Grosso": ("Grosszó Máté", "Grosszó"),
  "Fabrizio Miccoli": ("Mikori Rezső", "Mikori"),
  "Federico Bernardeschi": ("Bernát Ezki Vilmos", "Bernát Ezki"),
  "Federico Chiesa": ("Kieza Dezső", "Kieza Dezső"),
  "Filippo Inzaghi": ("Indzagi Fülöp", "Indzagi"),
  "Flávio Conceição": ("Konszészáó Boldizsár", "Konszészáó"),
  "Franco Mastantuono": ("Masztántónó Ferenc", "Masztántónó"),
  "Frank Anguissa": ("Angyiska Ferenc", "Angyiska"),
  "Frank de Boer": ("Debóra Ferenc", "Debóra"),
  "Freddie Ljungberg": ("Júnber Zétény", "Júnber"),
  "Gabi": ("Gabika", "Gabika"),
  "Gabriel Heinze": ("Henceg Gábor", "Henceg"),
  "Gabriel Jesus": ("Jézus Gábor", "Jézus G."),
  "Gabriel Milito": ("Milító Gábor", "Milító"),
  "Gareth Southgate": ("Délikapu Geret", "Délikapu"),
  "Gavi": ("Gagyi", "Gagyi"),
  "Georgi Kinkladze": ("Kintyalaza Ákos", "Kintyalaza"),
  "Gift Orban": ("Orrban az Ajándék", "Órban"),
  "Gilberto Silva": ("Zsilbertó Szilva", "Zs. Szilva"),
  "Gonzalo Higuaín": ("Higany Jenő", "Higany"),
  "Granit Xhaka": ("Csaka Dezső", "Kskhaka"),
  "Guti": ("Hutyi", "Hutyi"),
  "Helton": ("Eltony", "Eltony"),
  "Hiroki Ito": ("Ító Dezső", "Ító"),
  "Hugo Ekitiké": ("Etyityike Hugó", "Etyityike"),
  "Hulk": ("Hulkakolbász", "Hulkakolbász"),
  "Hélder Postiga": ("Postacsiga Jenő", "Postacsiga"),
  "Ian Ferguson": ("Férguszon Pongrác", "Férguszon"),
  "Ibrahim Afellay": ("Afelár Gellért", "Afelár"),
  "Ibrahim Cissé": ("Cici Szabolcs", "Cici"),
  "Ibrahima Konaté": ("Kannaté Pongrác", "Kannaté"),
  "Ibrahima Sissoko": ("Sisszokkó Bertalan", "Sisszokkó"),
  "Idrissa Gueye": ("Géj Rezső", "Géj"),
  "Igor Bogdanović": ("Bogdán Ovis Igor", "Bogdán Ovis"),
  "Jamie Vardy": ("Váradi Dzsémi", "Váradi Dzsé."),
  "Jan Koller": ("Kollár János", "Kollár"),
  "Jan Oblak": ("Ablak János", "Ablak"),
  "Jefferson Farfán": ("Farafán Zsigmond", "Farafán"),
  "Jemerson": ("Dzsémerson", "Dzsémerson"),
  "Jeremie Frimpong": ("Frimpingpong Domonkos", "Frimpingpong"),
  "Jermain Defoe": ("Defó Boldizsár", "Defó"),
  "Jesús Fernández": ("Fernándessz Jézus", "Jézus F."),
  "Jesús Gámez": ("Gámessz Jézus", "Jézus Gám."),
  "Jesús Navas": ("Navász Jézus", "Jézus N."),
  "Jordan Pickford": ("Pikkforduló Gellért", "Pikkforduló"),
  "Jordi Cruyff": ("Krojfi Ernő", "Krojfi E."),
  "Jorginho": ("Zsordzsinnyó", "Zsordzsinnyó"),
  "João Neves": ("Nevezetes János", "Nevezetes"),
  "Juan Cuadrado": ("Kuadrádo János", "Kuadrádo"),
  "Julian Draxler": ("Drakszler Gyula", "Drakszler"),
  "Jürgen Grabowski": ("Ternovszki György", "Ternovszki"),
  "Kai Havertz": ("Haver Káj", "Haverkáj"),
  "Kasper Schmeichel": ("Smájkell Kászper", "Smájkell"),
  "Kim Jin-su": ("Kím Ernő", "Kím"),
  "Kim Min-jae": ("Kím Miksa", "Kím"),
  "Kingsley Coman": ("Királyi Komám", "Királyi"),
  "Kwoun Sun-tae": ("Kvún Kelemen", "Kvún"),
  "Leandro Paredes": ("Párezres Pongrác", "Párezres"),
  "Leandro Trossard": ("Trosszár Benedek", "Trosszár"),
  "Lee Kang-in": ("Lí Ernő", "Lí"),
  "Leon Goretzka": ("Gorecka Lénárd", "Gorecka"),
  "Leonardo Spinazzola": ("Szpínazólá Lénárd", "Szpínazólá"),
  "Lisandro Martínez": ("Lisztanyó Marcinyó", "Lisztanyó Marcinyó"),
  "Lorenzo Insigne": ("Inszinye Lőrinc", "Inszinye"),
  "Lucas Hernández": ("Hernánt Tesz Lukács", "Hernánt Tesz L."),
  "Lukas Podolski": ("Pokolszki Lukács", "Pokolszki"),
  "Manuel Akanji": ("Ákándzsi Manó", "Ákándzsi"),
  "Manuel Locatelli": ("Lyukateli Manó", "Lyukateli"),
  "Marc Cucurella": ("Kukurellya Márk", "Kukurellya"),
  "Marc Overmars": ("Óvermarsz Márk", "Óvermarsz"),
  "Marc-André ter Stegen": ("Ferstéhen Márk", "Ferstéhen"),
  "Marcelo Salas": ("Szálas Domonkos", "Szálas"),
  "Marco Asensio": ("Aszenszijjó Márk", "Aszenszijjó"),
  "Marco Materazzi": ("Anyarazzia Márkó", "Anyarazzia"),
  "Marco Reus": ("Rojsz Márk", "Rojsz"),
  "Marcos Senna": ("Széna Márk", "Széna M."),
  "Mario Balotelli": ("Bálóteli Márió", "Bálóteli"),
  "Mark Hughes": ("Hiúz Márk", "Hiúz"),
  "Mark van Bommel": ("Fánbomlikel Márk", "Fánbomlikel"),
  "Martin Škrtel": ("Skrőte Márton", "Skrőte"),
  "Martín Demichelis": ("Demikellisz Márton", "Demikellisz"),
  "Mathieu Debuchy": ("Debuzi Máté", "Debuzi"),
  "Mauro Camoranesi": ("Kamoranézi Gyárfás", "Kamoranézi"),
  "Michael Owen": ("Óven Mihály", "Óven"),
  "Milan Škriniar": ("Skrinyár Milán", "Skrinyár"),
  "Moisés Caicedo": ("Kájszédó Gyárfás", "Kájszédó"),
  "Nani": ("Nyanyi", "Nyanyi"),
  "Nathan Aké": ("Oké Vajk", "Oké"),
  "Park Ji-sung": ("Párk Pongrác", "Párk"),
  "Patrick Kluivert": ("Klájvert Patrik", "Klájvert"),
  "Patrik Schick": ("Sikk Patrik", "Sikk"),
  "Pedro": ("Pedro Amigo Mio", "Pedro Amigo Mio"),
  "Pedro Porro": ("Pornó Péter", "Pornó"),
  "Per Mertesacker": ("Méretreszakker Szabolcs", "Méretreszakker"),
  "Phil Foden": ("Fóden Filó", "Fóden"),
  "Philippe Coutinho": ("Kutinnyó Fülöp", "Kutinnyó"),
  "Piero Hincapié": ("Hinkanapé Bertalan", "Hinkanapé"),
  "Presnel Kimpembe": ("Kimenne Álmos", "Kimenne"),
  "Raheem Sterling": ("Sztőr Link Dezső", "Sztőr Link"),
  "Renato Sanches": ("Sancsesz Rezső", "Sancsesz R."),
  "Ricardo Quaresma": ("Kvarezsma Rikárd", "Kvarezsma"),
  "Riccardo Ferri": ("Feri Rikárd", "Feri"),
  "Rodrigo De Paul": ("Dészarul Aurél", "Dészarul"),
  "Rodrygo": ("RodríGÓ", "RodríGÓ"),
  "Roque Júnior": ("ifj. Rokve", "ifj. Rokve"),
  "Ryan Gravenberch": ("Hráfenberh Ábris", "Hráfenberh"),
  "Samir Handanović": ("Handanovics Samu", "Handanovics"),
  "Samuel Umtiti": ("Bumm Titi Sámuel", "Bumm Titi"),
  "Sebastian Giovinco": ("Dzsovinkó Sebestyén", "Dzsovinkó"),
  "Simon Kjær": ("Ser Simon", "Ser"),
  "Simone Inzaghi": ("Indzagi Simon", "Indzagi"),
  "Stefan de Vrij": ("Dévrizs István", "Dévrizs"),
  "Steve Bruce Jr.": ("ifj. Brusz Pista", "ifj. Brusz"),
  "Sylvinho": ("Szilvinjóska", "Szilvinjóska"),
  "Sérgio Conceição": ("Konszészáó Szergej", "Konszészáó Sz."),
  "Teun Koopmeiners": ("Kúpásók Ince", "Kúpásók"),
  "Theo Hernández": ("Hernánt Tesz Tivadar", "Hernánt Tesz T."),
  "Thomas Hitzlsperger": ("Hiklispenger Tamás", "Hiklispenger"),
  "Tomáš Rosický": ("Rózsicki Tamás", "Rózsicki"),
  "Vladimír Šmicer": ("Szmájszer Vladi", "Szmájszer"),
  "Vágner Love": ("Szerelmes Vágner", "Szerelmes Vágner"),
  "Warren Zaïre-Emery": ("Zaj-Imre Mór", "Zaj-Imre"),
  "Wesley Sneijder": ("Sznájder Benedek", "Sznájder"),
  "William Gallas": ("Gallyas Vilmos", "Gallyas"),
  "Willy Sagnol": ("Szanyol Vili", "Szanyol"),
  "Xherdan Shaqiri": ("Zserdány Zsagiri", "Zserdány Zsagiri"),
  "Yohan Cabaye": ("Kabáj Tas", "Kabáj"),
  "Ze Roberto": ("iZé Robi", "iZé"),
  "Édmilson": ("Édmílsonka", "Édmílsonka"),
  "Alan Shearer": ("Sír E. A. Lány", "Sírealány"),
  "Alessandro Costacurta": ("Aztakurva Sándor", "Aztakurva"),
  "Alessandro Nesta": ("Nesztea Sándor", "Nesztea"),
  "Alexis Mac Allister": ("Makelliszter Sándor", "Makelliszter"),
  "Alfredo Di Stéfano": ("Disztefános Alfréd", "Distefános"),
  "Alisson Becker": ("Aluszékony Bekker", "Aluszékony"),
  "Andrij Sevcsenko": ("Sebcselló Bandi", "Sebcselló"),
  "Andrés Iniesta": ("Ínyenc Pista Bandi", "Ínyenc Pista"),
  "Batistuta": ("ifj. Bátyuska", "ifj. Bátyuska"),
  "Bebeto": ("Baba-tó", "Baba-tó"),
  "Beckenbauer": ("ifj. Bekembójer", "ifj. Bekembójer"),
  "Bergkamp": ("ifj. Bergkempingi", "ifj. Bergkempingi"),
  "Blaise Matuidi": ("Matyódíszes Blézer", "Matyódíszes"),
  "Cantona": ("ifj. Kántornak Tanult", "ifj. Kántornak"),
  "Cruyff": ("ifj. Krojfi", "ifj. Krojfi"),
  "Dani Olmo": ("Omlós Dani", "Omlós"),
  "David Ospina": ("Osztmivan Dávid", "Osztmivan"),
  "Dayot Upamecano": ("Uppáré Dejó", "Uppáré"),
  "Declan Rice": ("Rizsecske Dékán", "Rizsecske"),
  "Deco": ("Dekázó", "Dekázó"),
  "Di Stéfano": ("ifj. Disztefános", "ifj. Disztefános"),
  "Didi": ("Csöcs", "Csöcs"),
  "Diego Milito": ("Miliméteres Dijégó", "Miliméteres"),
  "Dombi Tibor": ("Bombázó Tibi", "Bombázó"),
  "Ederson": ("Éderfia", "Éderfia"),
  "Emmanuel Petit": ("Pici Manó", "Pici"),
  "Eric Cantona": ("Kántornak Tanult", "Kántornak"),
  "Erling Haaland": ("Hólánc Erik", "Hólánc"),
  "Esteban Cambiasso": ("Kampikasszó Pista", "Kampikasszó"),
  "Falcão": ("Falkajó", "Falkajó"),
  "Federico Valverde": ("Vállvetve Frigyes", "Vállvetve"),
  "Gabriel Batistuta": ("Bátyuska Gábor", "Bátyuska"),
  "Grosics Gyula": ("Gyorsíccs Gyuszika", "Gyorsíccs"),
  "Gullit": ("Zsüli", "Zsüli"),
  "Gulácsi Péter": ("Gula Peti", "Gula"),
  "Hernán Crespo": ("Kreszpó Ernő", "Kreszpó"),
  "Hugo Lloris": ("Jórizs Hugó", "Jórizs"),
  "Ivan Rakitić": ("Rakétácska Iván", "Rakétácska"),
})
```

---



## 1. Törött kimenet és rossz névsorrend

A leggyorsabb megtérülés: ezek ma **hibás** nevek, nem csak gyengék.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | Cha Bum-kun | kún Zsombor | **Csá Zsombor** | koreai: a CSALÁDNÉV áll elöl (Cha) — eddig kisbetűs „kún” volt | 83 |
| 2 | Dani Ruiz-Bazán | Baszán Dani | **Rujsz-Bazán Dani** | spanyol kettős vezetéknév; eddig csak a második fele | 82 |
| 3 | Hwang Hee-chan | csan Tas | **Hváng Tas** | ugyanaz: Hwang a családnév — eddig kisbetűs „csan” | 76 |
| 4 | Callum Hudson-Odoi | Ódoi Ábris | **Hadszon-Ódoi Kálmán** | a kötőjeles EGÉSZ a vezetéknév; Callum→Kálmán | 76 |
| 5 | José Pierre-Fanfan | Fánfan József | **Pjer-Fanfán József** | francia kötőjeles, Pierre→Pjer | 76 |
| 6 | Jean-Jacques Odjidja-Ofoe | Ófoe János | **Odzsidzsa-Ofoé János** | kötőjeles vezetéknév, dj→dzs | 76 |
| 7 | James Ward-Prowse | Provs Jakab | **Vord-Prausz Jakab** | kötőjeles vezetéknév, angol kiejtéssel | 75 |
| 8 | Duje Ćaleta-Car | Kar Ábel | **Csaléta-Cár Ábel** | horvát kettős vezetéknév, Ć→cs | 74 |
| 9 | Colin Kâzım-Richards | Ridzssards Szabolcs | **Kázim-Riccsárdz Szabolcs** | eddig „Ridzssards” — négy mássalhangzó egymáson | 74 |
| 10 | Karim Aït-Fana | Fána Kelemen | **Ajt-Fána Kelemen** | kötőjeles vezetéknév, a néma t-vel | 71 |

## 2. Feloldatlan kettőzés — „ifj.” és az egyezés

Ugyanaz az ember kétszer szerepel. Nyolc sor a `manual.py`-ban **szerkesztendő**, nem új.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | Coutinho ✏️ | Kutyinka | **ifj. Kutinnyó** | a teljes nevű párja már „Kutinnyó Fülöp” — eddig „Kutyinka” volt, ellentmondás | 86 |
| 2 | Cesare Maldini | Máldini Vajk | **Máldi Cézár** | ugyanaz a család, ugyanaz a vezetéknév; Cesare→Cézár | 84 |
| 3 | Anderson | Ánderson | **ifj. Anderfia** | a -son = -fia szabály, és a teljes nevű párjaival egyezik | 76 |
| 4 | Maldini ✏️ | Máldi | **ifj. Máldi** | Paolo Maldini = „Máldi Pál”, tehát a legenda is Máldi | — |
| 5 | Baggio ✏️ | Bádzsó | **ifj. Bádzsó** | Roberto Baggio = „Bádzsó Robika” | — |
| 6 | Best ✏️ | Legjobb | **ifj. Legjobb** | George Best párja; a jelentés-fordítás marad | — |
| 7 | Charlton ✏️ | Csarnokos | **ifj. Csarnokos** | Bobby Charlton párja | — |
| 8 | Kopa ✏️ | Kopasz | **ifj. Kopasz** | Raymond Kopa párja | — |
| 9 | Fontaine ✏️ | Fontos | **ifj. Fontos** | Just Fontaine párja | — |
| 10 | Matthäus ✏️ | Matyó | **ifj. Matyó** | Lothar Matthäus párja | — |

## 3. A `-son` / `-sson` / `-sen` = `-fia`

A te Denílson→Denifia szabályod, általánosítva.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | John Robertson | Róbertson János | **Róbertfia János** | -son = fia; a Robert magyarul is Róbert | 85 |
| 2 | Jordan Henderson | Hénderson Gergő | **Henderfia Jordán** | -son = fia | 84 |
| 3 | Felipe Anderson | Ánderson Fülöp | **Anderfia Fülöp** | -son = fia, és egyezik a mononim párjával | 82 |
| 4 | Henrik Larsson | Larsszon Henrik | **Larszfia Henrik** | svéd -sson; eddig „Larsszon” — torlódás | 82 |
| 5 | Roland Nilsson | Nilsszon Kornél | **Nilszfia Roland** | ugyanaz a torlódás feloldva | 82 |
| 6 | Ronny Johnsen | Jóhnsen Vajk | **Jánosfia Ronni** | norvég -sen = fia, John = János | 82 |
| 7 | Éderson | Édérson | **Éderfióka** | a másik Ederson már „Éderfia” — ez a névrokona | 82 |
| 8 | Dean Henderson | Hénderson Gellért | **Henderfia Dénes** | ugyanaz a vezetéknév; Dean→Dénes | 81 |
| 9 | Conny Karlsson | Karlsszon Sebő | **Károlyfia Konrád** | Karl = Károly, -sson = fia; Conny→Konrád | 77 |

## 4. Jelentés-fordítás

A legerősebb Danisítás: a névben lévő szó magyarul szólal meg.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | Cristian Romero | Rómero Krisztián | **Rozmaring Krisztián** | romero spanyolul rozmaring | 85 |
| 2 | Márcio Amoroso | Ámoroso Boldizsár | **Szerelmes Márció** | amoroso = szerelmes (mint a Vágner Love-nál) | 85 |
| 3 | Mario Rigamonti | Rígamonti Márió | **Rigóhegyi Márió** | riga~rigó, monti = hegyek | 85 |
| 4 | Rabah Madjer | Mádjer Lóránt | **Madzsar Lóránt** | a Madjer kiejtve „madzsar” — vagyis magyar | 85 |
| 5 | Anatolij Demjanenko | Démjanenko Máté | **Demjénenko Anatol** | Demjén — magyar fülnek azonnal ismerős | 85 |
| 6 | Andreas Köpke | Köpké András | **Köpködő András** | a Köpke magyar fülnek köp | 85 |
| 7 | Aleksandr Mostovoi | Móstovoi Zsombor | **Hídvégi Sándor** | most = híd; és valódi magyar vezetéknév lesz belőle | 84 |
| 8 | Gerard Moreno | Móreno Gellért | **Morénó Gellért** | az Alberto Morenónál már „Morénó” — egy vezetéknév, egy alak | 84 |
| 9 | José Águas | Ágúas József | **Vizes József** | águas portugálul vizek | 84 |
| 10 | Heinz Flohe | Flóhe Csanád | **Bolhás Heinc** | Floh németül bolha | 84 |
| 11 | Michel Preud'homme | Préud'homme Mihály | **Derékember Mihály** | prud'homme = derék ember; és eltűnik az aposztróf | 84 |
| 12 | Alex Sandro | Sándro Sándor | **Sándró Elek** | eddig „Sándro Sándor” volt — kétszer ugyanaz; Alex→Elek | 84 |
| 13 | Ferran Torres | Tórres Zsombor | **Tornyos Ferrán** | ugyanaz a vezetéknév, ugyanaz az alak | 83 |
| 14 | Norman Hunter | Húnter Szabolcs | **Vadász Norman** | hunter = vadász | 83 |
| 15 | Thomas Lemar | Lémar Tamás | **Tengeri Tamás** | la mer = a tenger | 83 |
| 16 | Arda Turan | Túran Bálint | **Turáni Árpád** | a Turan magyar fülnek kész szó; Arda→Árpád | 83 |
| 17 | Attilio Lombardo | Lómbardo Gellért | **Lombos Attila** | lombard~lomb; Attilio→Attila | 83 |
| 18 | Frans Thijssen | Tijsszen Máté | **Tejszínes Ferenc** | Thijssen~tejszín; eddig „Tijsszen” — torlódás | 83 |
| 19 | Johnny Rep | Rép Vilmos | **Répa Jancsi** | rep~répa; Johnny→Jancsi | 83 |
| 20 | Herbert Prohaska | Próhaska Ödön | **Prohászka Herbert** | valódi magyar vezetéknév lesz belőle | 83 |
| 21 | Patrice Loko | Lóko Patrik | **Lökött Patrik** | loco = őrült | 83 |
| 22 | Gennagyij Guszarov | Gúszarov Álmos | **Huszárov Gennagyij** | guszar = huszár | 83 |
| 23 | Volodimir Bezszonov | Bézszonov Tihamér | **Álmatlanov Vladimir** | bez son = álom nélkül | 83 |
| 24 | Peter Beardsley | Bírdsli Péter | **Szakállasi Peti** | beard = szakáll | 83 |
| 25 | Mathieu Valbuena | Válbuena Máté | **Jóvölgyi Máté** | val buena = jó völgy | 82 |
| 26 | Miguel Ángel Nadal | Nádal Miklós | **Karácsonyi Miklós** | nadal katalánul karácsony; Miguel→Miklós | 82 |
| 27 | Pau Torres | Tórres Pál | **Tornyos Pál** | torres = tornyok; Pau→Pál | 82 |
| 28 | Paul Mariner | Máriner Pál | **Tengerész Pál** | mariner = tengerész | 82 |
| 29 | Cyrille Regis | Régis Ábel | **Királyi Cirill** | regis latinul királyi; Cyrille→Cirill | 82 |
| 30 | Danny Blind | Blínd Tihamér | **Vakond Dani** | blind = vak, és a „Dani” bele is fér a szóba | 82 |
| 31 | Stephan Lichtsteiner | Liktstájner István | **Fénykövi István** | Licht+Stein = fény+kő; eddig „Liktstájner” — torlódás | 82 |
| 32 | Jonas Hofmann | Hófmann Jónás | **Udvarember Jónás** | Hof+mann = udvari ember | 82 |
| 33 | Karl-Heinz Körbel | Körbél Károly | **Kosaras Károly** | Korb = kosár | 82 |
| 34 | Brede Hangeland | Hángeland Zsigmond | **Hangaföld Brede** | land = föld; a keresztnév marad eredeti | 82 |
| 35 | Valerij Karpin | Kárpin Gellért | **Pontyos Valér** | karp = ponty; Valerij→Valér | 82 |
| 36 | Arda Güler | Gülér Vazul | **Nevető Árpád** | güler törökül nevet | 82 |
| 37 | Costa Pereira | Péreira Lehel | **Körtefa Kósta** | pereira portugálul körtefa | 82 |
| 38 | Ricardo Pavoni | Pávoni Rikárd | **Pávás Rikárd** | pavone = páva | 82 |
| 39 | Mauro Ramos | Rámos Rezső | **Ágas Mór** | ramos = ágas; Mauro→Mór | 82 |
| 40 | Leonardo Astrada | Ástrada Lénárd | **Csillagos Lénárd** | astra = csillag | 82 |
| 41 | Edmond Tapsoba | Tápsoba Domonkos | **Tapsoló Ödön** | a Tapsoba kész magyar szó; Edmond→Ödön | 82 |
| 42 | Bruce Grobbelaar | Gróbbelaar Ince | **Görbelábú Brúszi** | Grobbelaar~görbe láb — és tényleg arról volt híres | 82 |
| 43 | Diego Fuser | Fúser Ödön | **Fuseráló Dijégó** | a fuser kész magyar szó; Diego→Dijégó (ahogy nálad) | 82 |
| 44 | Mark Viduka | Víduka Márk | **Vidulka Márk** | a Viduka kész magyar szót rejt | 82 |
| 45 | Fikayo Tomori | Tómori Gedeon | **Tomori Fikajó** | a Tomori már valódi magyar név — a keresztnév marad eredeti | 82 |
| 46 | David Raum | Ráum Dávid | **Térfi Dávid** | Raum = tér | 81 |
| 47 | Darijo Srna | Srná Gergő | **Őzike Darijó** | srna horvátul őz | 81 |
| 48 | Aleksandar Kolarov | Kólarov Sándor | **Bognárov Sándor** | kolar = bognár, kerékgyártó | 81 |
| 49 | Bülent Korkmaz | Kórkmaz Farkas | **Nemfél Bülent** | korkmaz = nem fél | 81 |
| 50 | Christian Lopez | López Krisztián | **Lopézó Krisztián** | a Lopez magyar fülnek lop | 81 |

## 5. Nyelvhelyes fonetika és torlódás-oldás

Amit magyarul nem lehet kimondani, az rossz.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | Josko Gvardiol | Gvárdiol Kálmán | **Gvardijol Jóska** | horvát; Joško→Jóska, pontos megfelelő | 85 |
| 2 | Enrico Albertosi | Álbertosi Levente | **Albertósi Imre** | olasz; Enrico→Imre (mint nálad az Emre→Imre) | 85 |
| 3 | Demetrio Albertini | Álbertini Lóránt | **Albertíni Demeter** | Demetrio→Demeter | 84 |
| 4 | Giovanni Trapattoni | Trápattoni János | **Trappoló János** | a trappol kész magyar szó | 84 |
| 5 | Rafael Martín Vázquez | Vászkvessz Rafael | **Vászkez Rafael** | spanyol; eddig „Vászkvessz” — torlódás | 84 |
| 6 | Angelo Domenghini | Domendzsini Kornél | **Domengini Angyal** | olasz gh = g; Angelo→Angyal (mint a Jesús→Jézus) | 83 |
| 7 | Andrej Kancselszkisz | Káncselszkisz András | **Kancsalszki András** | eddig öt mássalhangzó egymáson; a kancsal magyar szó | 83 |
| 8 | Uğurcan Çakır | Dzssakir Benedek | **Csakír Ugur** | török Ç = cs; eddig „Dzssakir” — törött | 82 |
| 9 | Joe McBride | Mkbrid Sebő | **Mekbrájd Jóska** | eddig „Mkbrid” — kimondhatatlan; Joe→Jóska | 82 |
| 10 | Dieter Eilts | Ájlts Kornél | **Ájlc Detre** | német ei = áj; Dieter→Detre | 79 |
| 11 | Christoph Dabrowski | Dabrofskki Krisztián | **Dobrovszki Kristóf** | lengyel w = v; Christoph→Kristóf | 76 |
| 12 | Bilal Başaçıkoğlu | Basadzssikolu Barnabás | **Basacsikoglu Bilál** | török; eddig „Basadzssikolu” | 73 |

## 6. Egynevű brazilok és becézés

Magyar fülnek kedves végződés, ami hasonlít az eredetire.

| # | eredeti | most | **javaslat** | miért | Rating |
|---|---|---|---|---|---|
| 1 | Grafite | Gráfite | **Grafitceruza** | grafite = grafit — a Hulk→Hulkakolbász mintájára | 84 |
| 2 | Kiko | Kíko | **Kicsi** | a Gavi→Gagyi mintájára: hasonlít, és magyar szó | 84 |
| 3 | Edmundo | Édmundo | **Ödönmundó** | Edmund→Ödön | 83 |
| 4 | Germano | Gérmano | **Germán Manó** | germano = germán; a Manó a te Emmanuel-megoldásod | 83 |
| 5 | Alemão | Álemao | **Németke** | alemão portugálul német | 82 |
| 6 | Ronaldão | Rónaldao | **Nagyronáldó** | a -ão nagyító képző: a nagy Ronaldo | 82 |
| 7 | Gervinho | Gérvinho | **Zservinyó** | portugál -inho = -nyó (mint a Kutinnyónál) | 82 |
| 8 | Joelinton | Jóelinton | **Zsoelintonka** | brazil J = zs, plusz becézés | 82 |
| 9 | Piazza | Píazza | **Piactér** | piazza olaszul piactér | 82 |
---

## A beilleszthető blokk

```python
# ── DANISÍTÁS: száz gépi név kézi javítása ─────────────────────────────────
# A ✏️-vel jelöltek MÁR LÉTEZŐ sorok a MANUAL-ban: azokat át kell írni,
# nem hozzáadni. A többi új sor, a MANUAL végére mehet.
MANUAL.update({
# ── Törött kimenet és rossz névsorrend
  "Cha Bum-kun": ("Csá Zsombor", "Csá"),
  "Dani Ruiz-Bazán": ("Rujsz-Bazán Dani", "Rujsz-Bazán"),
  "Hwang Hee-chan": ("Hváng Tas", "Hváng"),
  "Callum Hudson-Odoi": ("Hadszon-Ódoi Kálmán", "Hadszon-Ódoi"),
  "José Pierre-Fanfan": ("Pjer-Fanfán József", "Pjer-Fanfán"),
  "Jean-Jacques Odjidja-Ofoe": ("Odzsidzsa-Ofoé János", "Odzsidzsa-Ofoé"),
  "James Ward-Prowse": ("Vord-Prausz Jakab", "Vord-Prausz"),
  "Duje Ćaleta-Car": ("Csaléta-Cár Ábel", "Csaléta-Cár"),
  "Colin Kâzım-Richards": ("Kázim-Riccsárdz Szabolcs", "Kázim-Riccsárdz"),
  "Karim Aït-Fana": ("Ajt-Fána Kelemen", "Ajt-Fána"),
# ── Feloldatlan kettőzés — „ifj.” és az egyezés
  "Coutinho": ("ifj. Kutinnyó", "ifj. Kutinnyó"), # ✏️ meglévő sor átírása
  "Cesare Maldini": ("Máldi Cézár", "Máldi"),
  "Anderson": ("ifj. Anderfia", "ifj. Anderfia"),
  "Maldini": ("ifj. Máldi", "ifj. Máldi"), # ✏️ meglévő sor átírása
  "Baggio": ("ifj. Bádzsó", "ifj. Bádzsó"), # ✏️ meglévő sor átírása
  "Best": ("ifj. Legjobb", "ifj. Legjobb"), # ✏️ meglévő sor átírása
  "Charlton": ("ifj. Csarnokos", "ifj. Csarnokos"), # ✏️ meglévő sor átírása
  "Kopa": ("ifj. Kopasz", "ifj. Kopasz"), # ✏️ meglévő sor átírása
  "Fontaine": ("ifj. Fontos", "ifj. Fontos"), # ✏️ meglévő sor átírása
  "Matthäus": ("ifj. Matyó", "ifj. Matyó"), # ✏️ meglévő sor átírása
# ── A `-son` / `-sson` / `-sen` = `-fia`
  "John Robertson": ("Róbertfia János", "Róbertfia"),
  "Jordan Henderson": ("Henderfia Jordán", "Henderfia"),
  "Felipe Anderson": ("Anderfia Fülöp", "Anderfia"),
  "Henrik Larsson": ("Larszfia Henrik", "Larszfia"),
  "Roland Nilsson": ("Nilszfia Roland", "Nilszfia"),
  "Ronny Johnsen": ("Jánosfia Ronni", "Jánosfia"),
  "Éderson": ("Éderfióka", "Éderfióka"),
  "Dean Henderson": ("Henderfia Dénes", "Henderfia"),
  "Conny Karlsson": ("Károlyfia Konrád", "Károlyfia"),
# ── Jelentés-fordítás
  "Cristian Romero": ("Rozmaring Krisztián", "Rozmaring"),
  "Márcio Amoroso": ("Szerelmes Márció", "Szerelmes"),
  "Mario Rigamonti": ("Rigóhegyi Márió", "Rigóhegyi"),
  "Rabah Madjer": ("Madzsar Lóránt", "Madzsar"),
  "Anatolij Demjanenko": ("Demjénenko Anatol", "Demjénenko"),
  "Andreas Köpke": ("Köpködő András", "Köpködő"),
  "Aleksandr Mostovoi": ("Hídvégi Sándor", "Hídvégi"),
  "Gerard Moreno": ("Morénó Gellért", "Morénó"),
  "José Águas": ("Vizes József", "Vizes"),
  "Heinz Flohe": ("Bolhás Heinc", "Bolhás"),
  "Michel Preud'homme": ("Derékember Mihály", "Derékember"),
  "Alex Sandro": ("Sándró Elek", "Sándró"),
  "Ferran Torres": ("Tornyos Ferrán", "Tornyos"),
  "Norman Hunter": ("Vadász Norman", "Vadász"),
  "Thomas Lemar": ("Tengeri Tamás", "Tengeri"),
  "Arda Turan": ("Turáni Árpád", "Turáni"),
  "Attilio Lombardo": ("Lombos Attila", "Lombos"),
  "Frans Thijssen": ("Tejszínes Ferenc", "Tejszínes"),
  "Johnny Rep": ("Répa Jancsi", "Répa"),
  "Herbert Prohaska": ("Prohászka Herbert", "Prohászka"),
  "Patrice Loko": ("Lökött Patrik", "Lökött"),
  "Gennagyij Guszarov": ("Huszárov Gennagyij", "Huszárov"),
  "Volodimir Bezszonov": ("Álmatlanov Vladimir", "Álmatlanov"),
  "Peter Beardsley": ("Szakállasi Peti", "Szakállasi"),
  "Mathieu Valbuena": ("Jóvölgyi Máté", "Jóvölgyi"),
  "Miguel Ángel Nadal": ("Karácsonyi Miklós", "Karácsonyi"),
  "Pau Torres": ("Tornyos Pál", "Tornyos"),
  "Paul Mariner": ("Tengerész Pál", "Tengerész"),
  "Cyrille Regis": ("Királyi Cirill", "Királyi"),
  "Danny Blind": ("Vakond Dani", "Vakond"),
  "Stephan Lichtsteiner": ("Fénykövi István", "Fénykövi"),
  "Jonas Hofmann": ("Udvarember Jónás", "Udvarember"),
  "Karl-Heinz Körbel": ("Kosaras Károly", "Kosaras"),
  "Brede Hangeland": ("Hangaföld Brede", "Hangaföld"),
  "Valerij Karpin": ("Pontyos Valér", "Pontyos"),
  "Arda Güler": ("Nevető Árpád", "Nevető"),
  "Costa Pereira": ("Körtefa Kósta", "Körtefa"),
  "Ricardo Pavoni": ("Pávás Rikárd", "Pávás"),
  "Mauro Ramos": ("Ágas Mór", "Ágas"),
  "Leonardo Astrada": ("Csillagos Lénárd", "Csillagos"),
  "Edmond Tapsoba": ("Tapsoló Ödön", "Tapsoló"),
  "Bruce Grobbelaar": ("Görbelábú Brúszi", "Görbelábú"),
  "Diego Fuser": ("Fuseráló Dijégó", "Fuseráló"),
  "Mark Viduka": ("Vidulka Márk", "Vidulka"),
  "Fikayo Tomori": ("Tomori Fikajó", "Tomori"),
  "David Raum": ("Térfi Dávid", "Térfi"),
  "Darijo Srna": ("Őzike Darijó", "Őzike"),
  "Aleksandar Kolarov": ("Bognárov Sándor", "Bognárov"),
  "Bülent Korkmaz": ("Nemfél Bülent", "Nemfél"),
  "Christian Lopez": ("Lopézó Krisztián", "Lopézó"),
# ── Nyelvhelyes fonetika és torlódás-oldás
  "Josko Gvardiol": ("Gvardijol Jóska", "Gvardijol"),
  "Enrico Albertosi": ("Albertósi Imre", "Albertósi"),
  "Demetrio Albertini": ("Albertíni Demeter", "Albertíni"),
  "Giovanni Trapattoni": ("Trappoló János", "Trappoló"),
  "Rafael Martín Vázquez": ("Vászkez Rafael", "Vászkez"),
  "Angelo Domenghini": ("Domengini Angyal", "Domengini"),
  "Andrej Kancselszkisz": ("Kancsalszki András", "Kancsalszki"),
  "Uğurcan Çakır": ("Csakír Ugur", "Csakír"),
  "Joe McBride": ("Mekbrájd Jóska", "Mekbrájd"),
  "Dieter Eilts": ("Ájlc Detre", "Ájlc"),
  "Christoph Dabrowski": ("Dobrovszki Kristóf", "Dobrovszki"),
  "Bilal Başaçıkoğlu": ("Basacsikoglu Bilál", "Basacsikoglu"),
# ── Egynevű brazilok és becézés
  "Grafite": ("Grafitceruza", "Grafitceruza"),
  "Kiko": ("Kicsi", "Kicsi"),
  "Edmundo": ("Ödönmundó", "Ödönmundó"),
  "Germano": ("Germán Manó", "Germán Manó"),
  "Alemão": ("Németke", "Németke"),
  "Ronaldão": ("Nagyronáldó", "Nagyronáldó"),
  "Gervinho": ("Zservinyó", "Zservinyó"),
  "Joelinton": ("Zsoelintonka", "Zsoelintonka"),
  "Piazza": ("Piactér", "Piactér"),
})
```
