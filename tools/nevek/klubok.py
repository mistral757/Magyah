# -*- coding: utf-8 -*-
"""Magyarított KLUB- és LIGANEVEK.

Formátum:  kanonikus : (magyar név, 3 betűs kód)

A kód az eredményjelzőn jelenik meg, ahol a teljes név nem fér ki. A valós
kódok (RMA, BAR, JUV) ugyanúgy felismerhetők, mint a nevek, ezért azok is
cserélődnek. ÜTKÖZÉST NEM KELL KÉZZEL KERÜLNI: a build.py egyedivé teszi
őket, és kiírja, hol kellett hozzányúlnia.

A VÁLOGATOTTAK SZÁNDÉKOSAN KIMARADNAK. Az „Anglia" vagy a „Magyarország"
országnév, nem védjegy — a szövetségek jelzései (a címer, a becenevek) a
kockázat, azok viszont nincsenek a játékban. Ezeket bántani csak rontana a
játékon: a magyar 1954-es keret attól ismerhető fel, hogy Magyarország.
"""

KLUBOK = {
# ── Anglia ──────────────────────────────────────────────────────────────────
"Arsenal FC":              ("Ágyúgyár FC", "ÁGY"),
"Aston Villa":             ("Aston Villany", "AVI"),
"Blackburn Rovers":        ("Feketevár Portyázók", "FEK"),
"Bolton Wanderers":        ("Boltos Vándorok", "BLT"),
"Brighton & Hove Albion":  ("Fényesparti Albion", "FÉN"),
"Burnley FC":              ("Bürnli FC", "BÜR"),
"Charlton Athletic":       ("Csarnoki Atlétika", "CSA"),
"Chelsea FC":              ("Cselszövő FC", "CSE"),
"Coventry City":           ("Koventri Város", "KOV"),
"Crystal Palace":          ("Kristálypalota", "KRI"),
"Derby County":            ("Dörzsölt Megye", "DÖR"),
"Everton FC":              ("Evezős FC", "EVE"),
"Fulham FC":               ("Fullámos FC", "FUL"),
"Ipswich Town":            ("Ipszilon Város", "IPS"),
"Leeds United":            ("Lidérc Egyesült", "LID"),
"Leicester City":          ("Lecsós Város", "LEC"),
"Liverpool FC":            ("Lővérpocsolya FC", "LŐV"),
"Manchester City":         ("Mancsvári Város", "MVÁ"),
"Manchester United":       ("Mancsvári Egyesült", "MEG"),
"Middlesbrough FC":        ("Középvár FC", "KÖZ"),
"Newcastle United":        ("Újvár Egyesült", "ÚJV"),
"Norwich City":            ("Norvégváros", "NOR"),
"Nottingham Forest":       ("Nottingi Erdő", "ERD"),
"Portsmouth FC":           ("Kikötőszáj FC", "KIK"),
"Queens Park Rangers":     ("Királynéparki Portyázók", "KPP"),
"Sheffield United":        ("Seffildi Egyesült", "SEG"),
"Sheffield Wednesday":     ("Seffildi Szerda", "SSZ"),
"Southampton FC":          ("Délhampton FC", "DÉL"),
"Stoke City":              ("Stokkos Város", "STO"),
"Tottenham Hotspur":       ("Tottyantó Sarkantyú", "TOT"),
"West Bromwich Albion":    ("Nyugat-Bromvics", "NYB"),
"West Ham United":         ("Nyugat-Sonka Egyesült", "SON"),
"Wigan Athletic":          ("Vigan Atlétika", "VIG"),
"Wimbledon FC":            ("Vimbledoni FC", "VIM"),

# ── Skócia ──────────────────────────────────────────────────────────────────
"Celtic FC":               ("Keltiszi FC", "KTI"),
"Rangers FC":              ("Portyázók FC", "POR"),
"Aberdeen FC":             ("Aberdíni FC", "ABE"),

# ── Spanyolország ───────────────────────────────────────────────────────────
"Real Madrid CF":          ("Reál Madrigál", "RMG"),
"FC Barcelona":            ("Bárcsakelóna", "BÁR"),
"Atlético Madrid":         ("Atlétikus Madrigál", "ATM"),
"Athletic Club":           ("Atlétikus Klub", "ATK"),
"Sevilla FC":              ("Szevillai Borbély", "SZB"),
"Valencia CF":             ("Valenciai Narancs", "VAL"),
"Villarreal CF":           ("Villámreál", "VLR"),
"Real Betis":              ("Reál Bétisz", "BET"),
"Real Sociedad":           ("Reál Társaság", "TÁR"),
"Real Zaragoza":           ("Reál Szaragóca", "SZA"),
"RCD Espanyol":            ("Espanyoli Kutyus", "ESP"),
"Celta de Vigo":           ("Kelta Vigó", "KEL"),
"Deportivo La Coruña":     ("Sportos Korunya", "KOR"),
"Deportivo Alavés":        ("Sportos Alavés", "ALA"),
"Málaga CF":               ("Málagai Málna", "MÁL"),

# ── Olaszország ─────────────────────────────────────────────────────────────
"Juventus FC":             ("Juharfa Tusa", "JUH"),
"AC Milan":                ("AC Milánkó", "MIL"),
"Inter Milan":             ("Inter Milánka", "INT"),
"AS Roma":                 ("AS Rómaiak", "RÓM"),
"SS Lazio":                ("SS Laciházi", "LAC"),
"SSC Napoli":              ("SSC Nápolyi", "NÁP"),
"ACF Fiorentina":          ("Virágos Firenze", "VIR"),
"Atalanta BC":             ("Atalanta Bekecs", "ATB"),
"Torino FC":               ("Torinói Bikák", "TOR"),
"Bologna FC":              ("Bolognai Szósz", "BOL"),
"UC Sampdoria":            ("Sampon-Dória", "SAM"),
"Genoa CFC":               ("Genovai Szalámi", "GEN"),
"Udinese Calcio":          ("Udinei Rúgás", "UDI"),
"Cagliari Calcio":         ("Kagylári Rúgás", "KAG"),
"Catania Calcio":          ("Katániai Rúgás", "KAT"),
"Brescia Calcio":          ("Bresciai Rúgás", "BRE"),
"Chievo Verona":           ("Kiévó Verona", "KIE"),
"Hellas Verona":           ("Hellász Verona", "HEL"),
"Parma AC":                ("Parmezán AC", "PAR"),
"Palermo":                 ("Palermói Pálma", "PAL"),
"US Foggia":               ("Foggiai Fogas", "FOG"),
"US Sassuolo":             ("Szasszujoló", "SZU"),
"Spezia Calcio":           ("Speciális Rúgás", "SPE"),
"Como 1907":               ("Komótos 1907", "KOM"),
"AC Monza":                ("AC Mónusz", "MNZ"),
"AS Bari":                 ("AS Barika", "BRI"),

# ── Németország ─────────────────────────────────────────────────────────────
"FC Bayern München":       ("Bájos Müncsi", "BÁJ"),
"Borussia Dortmund":       ("Borosüveg Dortmund", "BOR"),
"Borussia Mönchengladbach": ("Borosüveg Möncsengladbach", "MÖN"),
"FC Schalke 04":           ("Sálkés 04", "SÁL"),
"Hamburger SV":            ("Hamburgeres SV", "HAM"),
"SV Werder Bremen":        ("Verdai Bréma", "BRÉ"),
"VfB Stuttgart":           ("VfB Stuttgatyó", "STU"),
"Bayer 04 Leverkusen":     ("Bájer Leverkúszó", "LEV"),
"Eintracht Frankfurt":     ("Egyetértés Frankfurt", "FRA"),
"1. FC Köln":              ("1. FC Kölni", "KÖL"),
"1. FC Kaiserslautern":    ("Császárhangos FC", "CSÁ"),
"1. FC Nürnberg":          ("Nürnbergi Perec", "NÜR"),
"1. FC Magdeburg":         ("Magdavár FC", "MAG"),
"1. FC Union Berlin":      ("Berlini Unió", "UNI"),
"1. FSV Mainz 05":         ("Majnai 05", "MAJ"),
"1899 Hoffenheim":         ("1899 Reménylak", "REM"),
"1. FC Heidenheim":        ("Hajdanlak FC", "HAJ"),
"Hertha BSC":              ("Hertelendi BSC", "HER"),
"Hannover 96":             ("Hannoveri 96", "HAN"),
"Fortuna Düsseldorf":      ("Szerencse Düsseldorf", "SZR"),
"Karlsruher SC":           ("Károlyvár SC", "KÁR"),
"VfL Bochum":              ("VfL Bohókás", "BOH"),
"VfL Wolfsburg":           ("Farkasvár VfL", "FAR"),
"RB Leipzig":              ("RB Lipcse", "LIP"),
"FC Augsburg":             ("Ágostonvár FC", "ÁGO"),
"SC Freiburg":             ("Szabadvár SC", "SZV"),

# ── Franciaország ───────────────────────────────────────────────────────────
"Paris Saint-Germain":     ("Párizsi Szent German", "PSZ"),
"Olympique de Marseille":  ("Marsziliai Olimpia", "MAR"),
"Olympique Lyonnais":      ("Lyoni Olimpia", "LYO"),
"AS Monaco":               ("AS Monakó", "MNC"),
"Lille OSC":               ("Lillei Liliom", "LIL"),
"FC Nantes":               ("Nantesz FC", "NNT"),
"Girondins de Bordeaux":   ("Bordói Girondisták", "BOD"),
"AS Saint-Étienne":        ("Szent István AS", "SZI"),
"RC Lens":                 ("Lencse RC", "LEN"),
"Stade Rennais":           ("Rennes-i Stadion", "REN"),
"Stade de Reims":          ("Reimsi Stadion", "REI"),
"Stade Brestois":          ("Bresti Stadion", "BRS"),
"OGC Nice":                ("Nizzai OGC", "NIZ"),
"Montpellier HSC":         ("Monpellér HSC", "MPL"),
"RC Strasbourg":           ("Strasbourgi RC", "STR"),
"FC Metz":                 ("Meccs FC", "MTZ"),
"FC Lorient":              ("Loriáni FC", "LOR"),
"FC Sochaux":              ("Sósó FC", "SCX"),
"AJ Auxerre":              ("Okszerre AJ", "OKS"),
"EA Guingamp":             ("Gingamp EA", "GIN"),
"Angers SCO":              ("Anzsé SCO", "ANZ"),
"Toulouse FC":             ("Tuluzi FC", "TUL"),
"Le Havre AC":             ("Lehavas AC", "LEH"),
"AS Nancy-Lorraine":       ("Nancy-Lotaringia", "NAN"),
"Nîmes Olympique":         ("Nímesi Olimpia", "NIM"),

# ── Németalföld és Belgium ──────────────────────────────────────────────────
"AFC Ajax":                ("AFC Ajakos", "AJA"),
"PSV Eindhoven":           ("PSV Ejnyehoven", "PSV"),
"Feyenoord Rotterdam":     ("Fenyőnyárd Rotterdam", "FEY"),
"RSC Anderlecht":          ("Anderlecsó RSC", "AND"),
"Club Brugge KV":          ("Brüggei Klub", "BRÜ"),
"KV Mechelen":             ("Mechelni KV", "MEC"),

# ── Portugália ──────────────────────────────────────────────────────────────
"SL Benfica":              ("SL Benfika", "BEN"),
"FC Porto":                ("Portói FC", "PRT"),
"Sporting CP":             ("Sportoló CP", "SPO"),

# ── Törökország és Görögország ──────────────────────────────────────────────
"Galatasaray SK":          ("Galatás Szaráj", "GAL"),
"Fenerbahçe SK":           ("Fenerbahcse SK", "FEN"),
"Beşiktaş JK":             ("Besiktás JK", "BES"),
"Panathinaikos":           ("Panatinaikosz", "PAN"),

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
"Ferencvárosi TC":         ("Ferencvárosi Tekergők", "FER"),
"Újpest FC":               ("Újpesti Lilák", "ÚJP"),
"Újpesti Dózsa":           ("Újpesti Dorozsma", "DOZ"),
"Budapest Honvéd FC":      ("Budapesti Honfoglalók", "HON"),
"Debreceni VSC":           ("Debreceni Vasgyúró", "DVS"),
"Győri ETO FC":            ("Győri Kekszgyár", "GYŐ"),
"Paksi FC":                ("Paksi Atomerő", "PAK"),
"Puskás Akadémia FC":      ("Kalasnyikov Akadémia", "KAL"),
"Videoton FC":             ("Videómagnó FC", "VID"),

# ── Amerika, Ázsia, Afrika, Skandinávia ─────────────────────────────────────
"Boca Juniors":            ("Boka Juniorok", "BOK"),
"River Plate":             ("Folyótányér", "FOL"),
"CA Independiente":        ("Független CA", "FÜG"),
"CA Peñarol":              ("Penyarol CA", "PEN"),
"CR Flamengo":             ("Flamingó CR", "FLA"),
"Botafogo FR":             ("Botosfogó FR", "BOT"),
"Grêmio FBPA":             ("Grémió FBPA", "GRÉ"),
"Santos FC":               ("Szentesi FC", "SZT"),
"São Paulo FC":            ("Szentpáli FC", "SPA"),
"Inter Miami CF":          ("Inter Miámi", "MIA"),
"Atlanta United FC":       ("Atlantai Egyesült", "ATL"),
"Al Ahly SC":              ("Al Ahli SC", "AHL"),
"Al Nassr FC":             ("Al Nasszr FC", "NAS"),
"Kashima Antlers":         ("Kasmír Agancsok", "KAS"),
"IFK Göteborg":            ("IFK Götebori", "GÖT"),
"FC Basel":                ("Bázeli FC", "BÁZ"),
"RB Salzburg":             ("Sósvár RB", "SÓS"),
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
"Major League Soccer":    "Tengerentúli Nagyliga",
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
