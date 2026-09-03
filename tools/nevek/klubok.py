# -*- coding: utf-8 -*-
"""Magyarított KLUB- és LIGANEVEK.

Formátum:  kanonikus : (magyar név, 3 betűs kód)

A kód az eredményjelzőn jelenik meg, ahol a teljes név nem fér ki. A valós
kódok (RMA, BAR, JUV) ugyanúgy felismerhetők, mint a nevek, ezért azok is
cserélődnek. ÜTKÖZÉST NEM KELL KÉZZEL KERÜLNI: a build.py egyedivé teszi
őket, és kiírja, hol kellett hozzányúlnia.

A VÁLOGATOTTAK NEM ITT VANNAK, hanem lentebb, az ORSZAGOK táblában —
a „klub" nevük országnév, és ugyanaz a tábla adja a játékosok nemzetiségét is.
(Korábban itt az állt, hogy a válogatottak szándékosan kimaradnak, mert az
országnév nem védjegy. Ez a jogi rész IGAZ MARAD: nem kockázat miatt kerültek
be, hanem mert a felület nem lehet félig magyarított — „Magyahohszág" keretében
„Magyarország" nemzetiségű játékosokkal hazudna magáról.)

AMI VISZONT JOGI KÉRDÉS VOLT: a válogatott-keretek szezoncímkéje eddig
kitüntető jelzőt hordozott — „1970 VB · a világbajnok", „1954 VB · Aranycsapat",
„2018 VB · döntős". A NYERS adat változatlan (a mentések azon a néven
hivatkoznak az ellenfélre), a KIÍRÁSBÓL viszont kiesik: marad az ország és az
évszám. Lásd a seasonLabel-t az index.html-ben.

╔══════════════════════════════════════════════════════════════════════════╗
║  EZ A FÁJL AZ EGYETLEN FORRÁS. AZ index.html-BE KÉZZEL ÍRT KLUBNÉV       ║
║  ELVÉSZ.                                                                 ║
║                                                                          ║
║  MEGTÖRTÉNT. A 3.9.01 (b1b7e03) 119 klubnevet írt át — közvetlenül az    ║
║  index.html HU_CLUB_TABLE blokkjában, ide viszont nem. A 3.9.07          ║
║  (b772dd8) újraépítette a táblát ebből a fájlból, és a 119 név NÉMÁN     ║
║  eltűnt. A játékosneveket ugyanaz a commit megmentette a manual.py-ba;   ║
║  a klubnevekre nem gondoltam. A 3.9.24 állította vissza őket ide.        ║
║                                                                          ║
║  A build.py a HU_CLUB_TABLE blokk EGÉSZÉT lecseréli. Ami itt nincs       ║
║  benne, az a következő buildben nem létezik.                             ║
╚══════════════════════════════════════════════════════════════════════════╝

A RÖVIDÍTÉSEK KIEJTVE ÍRÓDNAK: FC → eFCé, SC → eSCé, AC → ÁCsé, BC → BéCé,
SK → eSKá, RB → eRBé, RC → eRrCé, KV → KáVé, CP → CéPé, CA → CéÁ, AS → Ász.
Ez nemcsak vicc: a betűszó az, ami a valódi klubot azonnal felismerhetővé
teszi, a kimondott alak viszont már magyar szó. Ha új klub kerül a listába,
a rövidítését is ejtsd ki — kimaradt darab nem marad benne (mérve).
"""

KLUBOK = {
# ── Anglia ──────────────────────────────────────────────────────────────────
"Arsenal FC":("Ágyúgyár eFCé", "ÁGY"),
"Aston Villa":("Asztalon Villany", "AVI"),
"Blackburn Rovers":("Feketénégő Portyázók", "FEK"),
"Bolton Wanderers":        ("Boltos Vándorok", "BLT"),
"Brighton & Hove Albion":("Fényesparti Albiológusok", "FÉN"),
"Burnley FC":("Bürnli eFCé", "BÜR"),
"Charlton Athletic":       ("Csarnoki Atlétika", "CSA"),
"Chelsea FC":("Cselszövő eFCé", "CSE"),
"Coventry City":           ("Koventri Város", "KOV"),
"Crystal Palace":("Kristály Paraszt", "KRI"),
"Derby County":            ("Dörzsölt Megye", "DÖR"),
"Everton FC":("Evezős eFCé", "EVE"),
"Fulham FC":("Fullámos eFCé", "FUL"),
"Ipswich Town":            ("Ipszilon Város", "IPS"),
"Leeds United":("Lidérc Egyesültek", "LID"),
"Leicester City":("Lecsesztek a Városiak", "LEC"),
"Liverpool FC":("Májpocsolya eFCé", "MÁJ"),
"Manchester City":("Mencseszteri Városiak", "MVÁ"),
"Manchester United":("Mencseszteri Egyesültek", "MEG"),
"Middlesbrough FC":("Középvár eFCé", "KÖZ"),
"Newcastle United":("Újvári Egyesültek", "ÚJV"),
"Norwich City":("Melyik Norvégváros", "NOR"),
"Nottingham Forest":("Semmilyensonka Erdő", "ERD"),
"Portsmouth FC":("Kikötőszáj eFCé", "KIK"),
"Queens Park Rangers":     ("Királynéparki Portyázók", "KPP"),
"Sheffield United":("Seffildi Egyesültek", "SEG"),
"Sheffield Wednesday":     ("Seffildi Szerda", "SSZ"),
"Southampton FC":("Délhampton eFCé", "DÉL"),
"Stoke City":("Sztokkos Város", "STO"),
"Tottenham Hotspur":       ("Tottyantó Sarkantyú", "TOT"),
"West Bromwich Albion":    ("Nyugat-Bromvics", "NYB"),
"West Ham United":("Nyugat-Sonkai Egyesültek", "SON"),
"Wigan Athletic":("Vígan Atlétizál", "VIG"),
"Wimbledon FC":("Vimbledoni eFCé", "VIM"),

# ── Skócia ──────────────────────────────────────────────────────────────────
"Celtic FC":("Kelta eFCé", "KFC"),
"Rangers FC":("Portyázók eFCé", "POR"),
"Aberdeen FC":("Aberdíni eFCé", "ABE"),

# ── Spanyolország ───────────────────────────────────────────────────────────
"Real Madrid CF":("Királyi Gárdonyi", "GÁR"),
"FC Barcelona":("Kazincbarszelóna", "KAZ"),   # NEM „BAR": az a valódi klub valódi kódja
"Atlético Madrid":         ("Atlétikus Madrigál", "ATM"),
"Athletic Club":           ("Atlétikus Klub", "ATK"),
"Sevilla FC":("Szevillyai Borbély", "SZB"),
"Valencia CF":("Valensziai Narancs", "VAL"),
"Villarreal CF":           ("Villámreál", "VLR"),
"Real Betis":("Reál Fogadisz", "BET"),
"Real Sociedad":           ("Reál Társaság", "TÁR"),
"Real Zaragoza":           ("Reál Szaragóca", "SZA"),
"RCD Espanyol":            ("Espanyoli Kutyus", "ESP"),
"Celta de Vigo":("Kelta Vigadó", "KEL"),
"Deportivo La Coruña":     ("Sportos Korunya", "KOR"),
"Deportivo Alavés":        ("Sportos Alavés", "ALA"),
"Málaga CF":("Máláhá", "MÁL"),

# ── Olaszország ─────────────────────────────────────────────────────────────
"Juventus FC":("Torinói Szarkák", "JUH"),
"AC Milan":("ÁCsé Milánó", "MIL"),
"Inter Milan":("Milánói Ördögök", "INT"),
"AS Roma":("Ász Rómaiak", "RÓM"),
"SS Lazio":("Laciházi Szolgálat", "LAC"),
"SSC Napoli":("Nápolyi", "NÁP"),
"ACF Fiorentina":          ("Virágos Firenze", "VIR"),
"Atalanta BC":("Asztalonta BéCé", "ATB"),
"Torino FC":               ("Torinói Bikák", "TOR"),
"Bologna FC":("Bonyolai Kifőzde", "BOL"),
"UC Sampdoria":            ("Sampon-Dória", "SAM"),
"Genoa CFC":("Dzsenovai Szalámi", "DZS"),
"Udinese Calcio":          ("Udinei Rúgás", "UDI"),
"Cagliari Calcio":         ("Kagylári Rúgás", "KAG"),
"Catania Calcio":          ("Katániai Rúgás", "KAT"),
"Brescia Calcio":("Brossa Rúgás", "BRE"),
"Chievo Verona":           ("Kiévó Verona", "KIE"),
"Hellas Verona":("Hellász Veronka", "HEL"),
"Parma AC":("Parmezán ÁCsé", "PAR"),
"Palermo":                 ("Palermói Pálma", "PAL"),
"US Foggia":("Foddzsiai Fogas", "FOG"),
"US Sassuolo":             ("Szasszujoló", "SZU"),
"Spezia Calcio":           ("Speciális Rúgás", "SPE"),
"Como 1907":("Komótos 1970", "KOM"),
"AC Monza":("ÁCsé Mondsza", "MNZ"),
"AS Bari":("Ász Barika", "BRI"),

# ── Németország ─────────────────────────────────────────────────────────────
"FC Bayern München":("Bájos Müntyhen", "BÁJ"),
"Borussia Dortmund":       ("Borosüveg Dortmund", "BOR"),
"Borussia Mönchengladbach":("Borosüveg Möntyhengladbakk", "MÖN"),
"FC Schalke 04":("eFCé Sálkés 40", "SÁL"),
"Hamburger SV":("HamburgereS Vé", "HAM"),
"SV Werder Bremen":        ("Verdai Bréma", "BRÉ"),
"VfB Stuttgart":("Stuttgatyó", "STU"),
"Bayer 04 Leverkusen":     ("Bájer Leverkúszó", "LEV"),
"Eintracht Frankfurt":     ("Egyetértés Frankfurt", "FRA"),
"1. FC Köln":("Kölni", "KÖL"),
"1. FC Kaiserslautern":("Császárhangos eFCé", "CSÁ"),
"1. FC Nürnberg":          ("Nürnbergi Perec", "NÜR"),
"1. FC Magdeburg":("Magdavár eFCé", "MAG"),
"1. FC Union Berlin":      ("Berlini Unió", "UNI"),
"1. FSV Mainz 05":("Majnai Csapi", "MAJ"),
"1899 Hoffenheim":("1988 Reménylak", "REM"),
"1. FC Heidenheim":("Hajdanlak eFCé", "HAJ"),
"Hertha BSC":("Bertha HéeSCé", "HER"),
"Hannover 96":("Hannó Veri 69", "HAN"),
"Fortuna Düsseldorf":      ("Szerencse Düsseldorf", "SZR"),
"Karlsruher SC":("Károlyvár eSCé", "KÁR"),
"VfL Bochum":("Bohókás", "BOH"),
"VfL Wolfsburg":("Farkasvár", "FAR"),
"RB Leipzig":("eRBé Lipcsei Peti", "LIP"),
"FC Augsburg":("Ágostonvár eFCé", "ÁGO"),
"SC Freiburg":("Szabadvár eSCé", "SZV"),

# ── Franciaország ───────────────────────────────────────────────────────────
"Paris Saint-Germain":("Párizsi Szent Gyermán", "PSZ"),
"Olympique de Marseille":  ("Marsziliai Olimpia", "MAR"),
"Olympique Lyonnais":      ("Lyoni Olimpia", "LYO"),
"AS Monaco":("Ász Monakó", "MNC"),
"Lille OSC":               ("Lillei Liliom", "LIL"),
"FC Nantes":("Nantesz eFCé", "NNT"),
"Girondins de Bordeaux":   ("Bordói Girondisták", "BOD"),
"AS Saint-Étienne":("Ász Szent Egyén", "EGY"),
"RC Lens":("Lencse eRrCé", "LEN"),
"Stade Rennais":("Renni Stadionbúki", "REN"),
"Stade de Reims":("Reimsi Stadionbúki", "REI"),
"Stade Brestois":("Bresti Stadionbúki", "BRS"),
"OGC Nice":("Nájsz", "NÁJ"),
"Montpellier HSC":("Monpellér", "MPL"),
"RC Strasbourg":("Strasbourgi eRrCé", "STR"),
"FC Metz":("Meccs eFCé", "MTZ"),
"FC Lorient":("Loriáni eFCé", "LOR"),
"FC Sochaux":("Sósó eFCé", "SCX"),
"AJ Auxerre":("Okszerr", "OKS"),
"EA Guingamp":("Gingamp ÍÉ Szportsz", "GIN"),
"Angers SCO":("Anzsé", "ANZ"),
"Toulouse FC":("Tulúzi eFCé", "TUL"),
"Le Havre AC":("Lehavas ÁCsé", "LEH"),
"AS Nancy-Lorraine":("Nenszi-Lorány", "NAN"),
"Nîmes Olympique":         ("Nímesi Olimpia", "NIM"),

# ── Németalföld és Belgium ──────────────────────────────────────────────────
"AFC Ajax":("Ajakok", "AJA"),
"PSV Eindhoven":("PéeSzVé Ejnyehoven", "PSV"),
"Feyenoord Rotterdam":     ("Fenyőnyárd Rotterdam", "FEY"),
"RSC Anderlecht":("Anderlecsó", "AND"),
"Club Brugge KV":("Brűzsi Klubocska", "BRÜ"),
"KV Mechelen":("Mechelni KáVé", "MEC"),

# ── Portugália ──────────────────────────────────────────────────────────────
"SL Benfica":("Benn Fika", "BEN"),
"FC Porto":("Portói eFCé", "PRT"),
"Sporting CP":("Sportoló CéPé", "SPO"),

# ── Törökország és Görögország ──────────────────────────────────────────────
"Galatasaray SK":          ("Galatás Szaráj", "GAL"),
"Fenerbahçe SK":("Fenerbakkcse eSKá", "FEN"),
"Beşiktaş JK":("Besiktás", "BES"),
"Panathinaikos":("Puma Tin Ájkosz", "PAN"),

# ── Kelet-Európa ────────────────────────────────────────────────────────────
"Crvena zvezda":           ("Piros Csillag", "PIR"),
"Steaua București":        ("Bukaresti Csillag", "STE"),
"Legia Warszawa":          ("Varsói Légió", "LÉG"),
"Slovan Bratislava":       ("Pozsonyi Szlovan", "POZ"),
"Dinamo Kijev":            ("Kijevi Dinamó", "KIJ"),
"Dinamo Moszkva":          ("Moszkvai Dinamó", "DIN"),
"Dinamo Tbiliszi":         ("Tbiliszi Dinamó", "TBI"),
"CSZKA Moszkva":           ("Cuszka Moszkva", "CUS"),
"Szpartak Moszkva":        ("Szpártai Moszkva", "SZP"),
"Zenit St. Petersburg":    ("Zenitpont Pétervár", "ZEN"),
"Shakhtar Donetsk":        ("Bányász Donyeck", "BÁN"),

# ── Magyarország ────────────────────────────────────────────────────────────
"Ferencvárosi TC":("eFTéCé", "FER"),
"Újpest FC":               ("Újpesti Lilák", "ÚJP"),
"Újpesti Dózsa":           ("Újpesti Dorozsma", "DOZ"),
"Budapest Honvéd FC":      ("Budapesti Honfoglalók", "HON"),
"Debreceni VSC":("Debreceni Csillagok", "DVS"),
"Győri ETO FC":("Győri Audi Gyár Munkásai", "GYŐ"),
"Paksi FC":                ("Paksi Atomerő", "PAK"),
"Puskás Akadémia FC":      ("Kalasnyikov Akadémia", "KAL"),
"Videoton FC":("Videómagnó eFCé", "VID"),

# ── Amerika, Ázsia, Afrika, Skandinávia ─────────────────────────────────────
"Boca Juniors":("Boka Fiatalok", "BOK"),
"River Plate":             ("Folyótányér", "FOL"),
"CA Independiente":("Független CéÁ", "FÜG"),
"CA Peñarol":("Penyarol CéÁ", "PEN"),
"CR Flamengo":("Flamingó CéeRr7", "FLA"),
"Botafogo FR":("Botosfogó ForRíl", "BOT"),
"Grêmio FBPA":("Brémjó", "GRÉ"),
"Santos FC":("Szántós eFCé", "SZT"),
"São Paulo FC":("Szentpáli eFCé", "SPA"),
"Inter Miami CF":("Bekem Májámi", "MIA"),
"Atlanta United FC":("Atlantai Egyesültek", "ATL"),
"Al Ahly SC":("Haláli eSCé", "AHL"),
"Al Nassr FC":("Alnászer eFCé", "NAS"),
"Kashima Antlers":         ("Kasmír Agancsok", "KAS"),
"IFK Göteborg":("AFK Götebori", "GÖT"),
"FC Basel":("Bázeli eFCé", "BÁZ"),
"RB Salzburg":("Sósvár eRBé", "SÓS"),
}

# ── LIGÁK ───────────────────────────────────────────────────────────────────
# A piramis saját osztálynevei („kis pénz kis foci", „mennyei megyei",
# „Biszem-baszom…") és az „NB I"/„NB II" már eleve kitaláltak vagy magyarok —
# azok szándékosan nincsenek itt. A „Válogatott" is marad.
LIGAK = {
# A MAGYAR ÉLVONAL. Ez volt az EGYETLEN liga, aminek nem volt megjelenítési
# megfelelője: a leagueLabel("NB I") változatlanul adta vissza, tehát a nyers
# név ment ki a képernyőre — és a release.py sem cserélte le az adatban.
# A névháló ezt elvileg sem foghatta meg: ő azt őrzi, hogy a TÁBLÁBAN lévő
# kanonikus nevek ne szivárogjanak ki; ami a táblában sincs benne, arra nem
# néz rá. Ezért kellett a jelentés kívülről.
"NB I":                   "Magyar Bajnokok",
"Allsvenskan":            "Svéd Nagyliga",
"Austrian Bundesliga":    "Osztrák Ligamix",
"Belgian Pro League":     "Belga Profi Liga",
"Brasileirão":            "Brazil Nagyliga",
"Bundesliga":             "Sörliga",
"DDR-Oberliga":           "NDK Felsőliga",
"Egyptian Premier League": "Egyiptomi Élvonal",
"Ekstraklasa":            "Extraosztály",
"Eredivisie":             "Sajtliga",
"J1 League":              "J1 Napkelte",
"La Liga":                "A Liga",
"Liga I":                 "Román Első Liga",
"Ligue 1":                "Bagett 1",
"MLS":                    "Tengerentúli Liga",
"Premier League":         "Szigetliga",
"Premier Liha":           "Ukrán Élvonal",
"Primeira Liga":          "Portói Első Liga",
"Primera División":       "Első Osztály",
"Russian Premier League": "Orosz Élvonal",
"Saudi Pro League":       "Sivatagi Profi Liga",
"Scottish Premiership":   "Skót Dudaliga",
"Serie A":                "A Sorozat",
"Super League":           "Szuperliga",
"Superliga Srbije":       "Szerb Szuperliga",
"Swiss Super League":     "Svájci Óraliga",
"Süper Lig":              "Török Szuperliga",
"Vysšaja liga":           "Szovjet Felsőliga",
"Československá liga":    "Csehszlovák Liga",
}

# ─────────────────────────────────────────────────────────────────────────────
#  ORSZÁGNEVEK
#
#  MIÉRT VAN EZ A TÁBLA. Két helyen látszik országnév: a VÁLOGATOTT-keretek
#  „klub" nevében (Franciaország 1998) és a játékosok nemzetiségénél. A kettő
#  egymás mellett jelenik meg, tehát nem lehet csak az egyiket magyarítani —
#  „Magyahohszág" keretében „Magyarország" nemzetiségű játékosokkal a felület
#  hazudna magáról.
#
#  A MÓDSZER, a megrendelt tizenkettőből visszafejtve:
#    · a „-ország" végződés „-ohszág" lesz (Magyahohszág, Fhansziaohszág),
#    · vagy az ország SAJÁT / angol neve kerül magyar fonetikába
#      (Szpéjn, Ítalí, Horvátszka, Gyermánia, Belgijum),
#    · az „-ia/-a" végű nevek „-ija" alakot kapnak (Anglija, Brazílija).
#
#  AZ ELSŐ TIZENKETTŐ BETŰRE A MEGRENDELT ALAK. A többit ugyanezzel a
#  módszerrel képeztem — azok JAVASLATOK, egy sorban átírhatók.
#
#  AMI NINCS A TÁBLÁBAN, AZ VÁLTOZATLANUL MEGY KI: a réteg egyszerű keresés,
#  nem kényszerít. Új nemzetiség tehát nem tör el semmit.
# ─────────────────────────────────────────────────────────────────────────────

ORSZAGOK = {
# ── a megrendelt tizenkettő ─────────────────────────────────────────────────
"Anglia":            "Anglija",
"Brazília":          "Brazílija",
"Horvátország":      "Horvátszka",
"Lengyelország":     "Ledzselohszág",
"Németország":       "Gyermánia",
"Franciaország":     "Fhansziaohszág",
"Hollandia":         "Hólándia",
"Argentína":         "Ahgentyína",
"Magyarország":      "Magyahohszág",
"Spanyolország":     "Szpéjn",
"Belgium":           "Belgijum",
"Olaszország":       "Ítalí",
# ── a többi válogatott ──────────────────────────────────────────────────────
"Görögország":       "Gölögohszág",
"Portugália":        "Pohtugál",
# ── Európa ──────────────────────────────────────────────────────────────────
"Skócia":            "Szkótföld",
"Wales":             "Vélsz",
"Írország":          "Íhohszág",
"Észak-Írország":    "Észak-Íhohszág",
"Szerbia":           "Szehbija",
"Oroszország":       "Ruszkija",
"Szovjetunió":       "Szovjetunijó",
"Törökország":       "Töhökohszág",
"Dánia":             "Dánija",
"Svédország":        "Svédohszág",
"Norvégia":          "Nohvégija",
"Finnország":        "Finnohszág",
"Izland":            "Íszland",
"Svájc":             "Svájcolda",
"Ausztria":          "Ausztriják",
"Csehország":        "Csehohszág",
"Csehszlovákia":     "Csehszlovákija",
"Szlovákia":         "Szlovákija",
"Szlovénia":         "Szlovénija",
"Románia":           "Hománija",
"Bulgária":          "Bulgáhija",
"Ukrajna":           "Ukhajna",
"Fehéroroszország":  "Fehéhoroszohszág",
"Lettország":        "Lettohszág",
"Litvánia":          "Litvánija",
"Észtország":        "Észtohszág",
"Grúzia":            "Gruzija",
"Albánia":           "Albánija",
"Koszovó":           "Koszovóh",
"Montenegró":        "Monteneghó",
"Bosznia-Hercegovina":"Bosznia-Hehcegovina",
"Bosznia":           "Bosznija",
"Észak-Macedónia":   "Észak-Macedónija",
"Szerbia és Montenegró":"Szehbija és Monteneghó",
"San Marino":        "Szan Mahinó",
"Izrael":            "Izháel",
# ── Amerika ─────────────────────────────────────────────────────────────────
"Uruguay":           "Uhugváj",
"Kolumbia":          "Kolumbija",
"Chile":             "Csilé",
"Paraguay":          "Paragváj",
"Peru":              "Pehu",
"Ecuador":           "Ekvadoh",
"Venezuela":         "Venezuéla",
"Bolívia":           "Bolívija",
"Mexikó":            "Mehikó",
"Egyesült Államok":  "Egyesült Álmok",
"USA":               "Úeszá",
"Kanada":            "Kanadaj",
"Costa Rica":        "Koszta Hika",
"Honduras":          "Hondurász",
"Jamaica":           "Dzsamajka",
"Trinidad és Tobago":"Thinidad és Tobágó",
"Dominikai Köztársaság":"Dominikai Köztáhsaság",
"Curaçao":           "Kuhaszaó",
"Suriname":          "Szuhinam",
# ── Afrika ──────────────────────────────────────────────────────────────────
"Nigéria":           "Nizsérija",
"Elefántcsontpart":  "Elefántcsontpaht",
"Marokkó":           "Mahokkó",
"Szenegál":          "Szenegáhl",
"Kamerun":           "Kamehun",
"Ghána":             "Gáná",
"Egyiptom":          "Egyiptum",
"Mali":              "Máli",
"Algéria":           "Alzsérija",
"Dél-Afrika":        "Dél-Afhika",
"Tunézia":           "Tunézija",
"Guinea":            "Ginea",
"Bissau-Guinea":     "Bisszau-Ginea",
"Kongói DK":         "Kongóh",
"Burkina Faso":      "Buhkina Faszó",
"Mozambik":          "Mozambikk",
"Gabon":             "Gabbon",
"Kenya":             "Kenyah",
"Gambia":            "Gambija",
"Angola":            "Angóla",
"Zambia":            "Zambija",
"Közép-afrikai Köztársaság":"Közép-afhikai Köztáhsaság",
"Ruanda":            "Huanda",
"Sierra Leone":      "Sziehha Leone",
"Zimbabwe":          "Zimbabve",
"Libéria":           "Libéhija",
"Namíbia":           "Namíbija",
"Csád":              "Csádd",
"Togo":              "Tógó",
"Zöld-foki Köztársaság":"Zöld-foki Köztáhsaság",
"Benin":             "Benyin",
"Madagaszkár":       "Madagaszkáh",
# ── Ázsia és Óceánia ────────────────────────────────────────────────────────
"Japán":             "Nyippon",
"Dél-Korea":         "Dél-Koheja",
"Szaúd-Arábia":      "Szaúd-Ahábia",
"Irán":              "Ihán",
"Omán":              "Ohmán",
"Ausztrália":        "Ausztrálija",
"Új-Zéland":         "Új-Zéhland",
"Laosz":             "Laohsz",
"Barbados":          "Bahbadosz",
}
