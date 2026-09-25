# -*- coding: utf-8 -*-
"""KÉZI réteg — a felismerhető nevek.

Formátum:  kanonikus : (teljes magyar név, rövid alak)

A rövid alak KI VAN ÍRVA, mert a magyarított nevek sorrendje vegyes:
  · „Máldi Pál"  magyaros  → rövid: Máldi   (első szó)
  · „Vén Rúni"   nyugatos  → rövid: Rúni    (utolsó szó)
A kanonikus nemzetiség már nem árulja el, melyik — ezért nem származtatjuk.
"""

MANUAL = {
# ── A) fonetikus világikonok ────────────────────────────────────────────────
"Diego Maradona":      ("Dijégó Méridonna", "Méridonna"),
"Lionel Messi":        ("Lijonel Messzi", "Messzi"),
"Wayne Rooney":        ("Vén Rúni", "Rúni"),
"Zinédine Zidane":     ("Zsindelyes Zalán", "Zsindelyes"),
"Franz Beckenbauer":   ("Francos Bekembójer", "Bekembójer"),
"Johan Cruyff":        ("Krojfi János", "Krojfi"),
"Paolo Maldini":       ("Máldi Pál", "Máldi"),
"Kylian Mbappé":       ("Kilján Bapé", "Bapé"),

# ── B) teljes magyarítás ────────────────────────────────────────────────────
"Cristiano Ronaldo":   ("Ronáldó Krisztián", "Ronáldó Krisztián"),  # lásd Ronaldo
"Michel Platini":      ("Platón Mihály", "Platón"),
"David Beckham":       ("Bekem Dávid", "Bekem"),
"Roberto Baggio":      ("Bádzsó Robika", "Bádzsó"),
"Iker Casillas":       ("Kaszilyás Tamás", "Kaszilyás"),

# ── C) ziziségek ────────────────────────────────────────────────────────────
"Gianluigi Buffon":    ("Dzsidzsi Büfi", "Büfi"),
"Ronaldinho":          ("Ronáldinka", "Ronáldinka"),
"Zlatan Ibrahimović":  ("Ibrányics Zalán", "Ibrányics"),
"Oliver Kahn":         ("Kán Olivér", "Kán"),
"Peter Schmeichel":    ("Sminkel Péter", "Sminkel"),
"Didier Drogba":       ("Didikell Dorka", "Didikell"),

# ── D) magyar ikonok ────────────────────────────────────────────────────────
"Puskás Ferenc":       ("Kalasnyikovos Ferkó", "Kalasnyikovos"),
"Hidegkuti Nándor":    ("Hidegkutyus Nándika", "Hidegkutyus"),
"Grosics Gyula":       ("Gyorsiccs Gyuszika", "Gyorsiccs"),
"Albert Flórián":      ("Florian Albertinho", "Albertinho"),
"Király Gábor":        ("G. King", "G. King"),
"Szoboszlai Dominik":  ("Dominikai Hajdúszoboszló", "Hajdúszoboszló"),

# ── E) szerkezeti fejtörők ──────────────────────────────────────────────────
# A KÉT RONALDO: kifejezett kérés, hogy a RÖVID kiírás mindkettőnél a teljes
# név legyen. A gépi ütközésfeloldó ezt magától nem hozná — „Ronáldó" és
# „Názári" nem ütközik —, ezért itt írjuk ki kézzel.
"Ronaldo":             ("Názári Ronáldó", "Názári Ronáldó"),
"Pelé":                ("Béla", "Béla"),
"Cafu":                ("Kátyu", "Kátyu"),
"Oscar":               ("Uszkár", "Uszkár"),
"Oscar Bernardi":      ("Bernát Uszkár", "Bernát"),
"Sebes Gusztáv":       ("Gyorsasági Guszti", "Gyorsasági"),

# ── G) brazil egyszavasok ───────────────────────────────────────────────────
"Kaká":                ("Kakaóbaba", "Kakaóbaba"),
"Zico":                ("Zakó", "Zakó"),
"Garrincha":           ("Garincsa", "Garincsa"),
"Romário":             ("Román Rió", "Román"),
"Careca":              ("Karateka", "Karateka"),

# ── H) cirill, már magyar átírásban ─────────────────────────────────────────
"Lev Jasin":           ("Levi Jancsi", "Levi"),
"Dmitrij Alenyicsev":  ("Alenyics Dömötör", "Alenyics"),
"Viktor Onopko":       ("Onopkó Viktor", "Onopkó"),

# ── I) diakritikus szláv/török ──────────────────────────────────────────────
# „Dáv Siker" és „Halvány Siker" rövid alakja egyaránt „Siker" volna — az
# ütközésfeloldó ezt elkapja, és mindkettő teljes néven megy ki.
"Pavel Nedvěd":        ("Páva Nedv", "Nedv"),
"Davor Šuker":         ("Dáv Siker", "Siker"),
"Luka Modrić":         ("Lyukas Modrács", "Modrács"),
"Hakan Şükür":         ("Halvány Siker", "Siker"),

# ── J) német összetettek ────────────────────────────────────────────────────
# A két Müller rövid alakja ütközik → mindkettő teljes néven megy ki.
"Bastian Schweinsteiger": ("Kondás Sebestyén", "Kondás"),
"Gerd Müller":         ("Molnár Gerhárd", "Molnár"),
"Thomas Müller":       ("Molnár Tamás", "Molnár"),
"Jürgen Klinsmann":    ("Klinszember György", "Klinszember"),

# ── K) afrikai / arab ───────────────────────────────────────────────────────
# „Szalai Moha" rövid alakja ütközik a magyar Szalai Ádáméval → teljes név.
"Mohamed Salah":       ("Szalai Moha", "Szalai"),
"Samuel Eto'o":        ("Etós Sámuel", "Etós"),
"George Weah":         ("Véha György", "Véha"),

# ── L) rövid angol ──────────────────────────────────────────────────────────
"George Best":         ("Legjobb György", "Legjobb"),
"Denis Law":           ("Denéz Láv", "Láv"),
"Bobby Moore":         ("Bobi Mór", "Mór"),

# ── M) magyar szereplők ─────────────────────────────────────────────────────
"Dzsudzsák Balázs":    ("Blaise Djiudjitsu", "Djiudjitsu"),
"Détári Lajos":        ("Determinált Lali", "Determinált"),
"Böde Dániel":         ("Daniel Boden", "Boden"),

# ── N) edzők ────────────────────────────────────────────────────────────────
"Guttmann Béla":       ("Jóember Béci", "Jóember"),
"Sir Alex Ferguson":   ("Szőr Sándor Ferguszon", "Ferguszon"),
}

# ═══ MAGYAR SZEREPLŐK — kézzel ═══════════════════════════════════════════════
# Itt nem elég a gépi „Nagy → Nagyi" csavar: ezek a nevek a legismertebbek a
# magyar közönségnek, és élő magyar személyeknél a felismerhetőség a
# legkockázatosabb is. Mindegyik vezetéknév EGY LÉTEZŐ magyar szóra hajlik —
# ez a „Hidegkuti → Hidegkutyus", „Grosics → Gyorsiccs" minta.
HU_MANUAL = {
"Kocsis Sándor":("Aranyfejű Sanyi","Aranyfejű"),
"Bozsik József":("Bozsgó Jocó","Bozsgó"),
"Czibor Zoltán":("Cibere Zoli","Cibere"),
"Szoboszlai":("Szoboszlóka","Szoboszlóka"),
"Lisztes Krisztián":("Lisztlángos Kriszti","Lisztlángos"),
"Mészöly Kálmán":("Meszelő Kálmus","Meszelő"),
"Halmosi Péter":("Halmozó Peti","Halmozó"),
"Koplárovics Béla":("Koplaltatós Béci","Koplaltatós"),
"Dibusz Dénes":("Dibidábusz Dini","Dibidábusz"),
"Bene Ferenc":("Benézős Ferkó","Benézős"),
"Gera Zoltán":("Gerelyes Zoli","Gerelyes"),
"Gulácsi Péter":("Gulyácsi Peti","Gulyácsi"),
"Orbán Willi":("Orbáncfű Vili","Orbáncfű"),
"Mátrai Sándor":("Mátrahegyi Sanyi","Mátrahegyi"),
"Varga Zoltán":("Vargabéles Zoli","Vargabéles"),
"Göröcs János":("Göröngyös Jancsi","Göröngyös"),
"Dunai Antal":("Dunapataki Tóni","Dunapataki"),
"Rudolf Gergely":("Rénszarvas Gergő","Rénszarvas"),
"Szalai Ádám":("Szalonnás Ádi","Szalonnás"),
"Varga Barnabás":("Vargánya Barni","Vargánya"),
"Novák Dezső":("Novemberi Dezsőke","Novemberi"),
"Rákosi Gyula":("Rákollós Gyuszi","Rákollós"),
"Fenyvesi Máté":("Fenyőfás Matyi","Fenyőfás"),
"Lóránt Gyula":("Lóherés Gyuszi","Lóherés"),
"Sallai Roland":("Salátás Roli","Salátás"),
"Czvitkovics Péter":("Cvikkeres Peti","Cvikkeres"),
"Kabát Péter":("Bundás Peti","Bundás"),
"Géczi István":("Gézengúz Pista","Gézengúz"),
"Dalnoki Jenő":("Dalolós Jenci","Dalolós"),
"Szabó József":("Szabásminta Jocó","Szabásminta"),
"Szentmihályi Antal":("Szentmiskolci Tóni","Szentmiskolci"),
"Solymosi Ernő":("Sólyomszemű Ernőke","Sólyomszemű"),
"Fazekas László":("Fazékfülű Laci","Fazékfülű"),
"Tőzsér Dániel":("Tőzsdés Dani","Tőzsdés"),
"Buzánszky Jenő":("Buzogányos Jenci","Buzogányos"),
"Budai László":("Budavári Laci","Budavári"),
"Elek Ákos":("Elemes Ákoska","Elemes"),
"Varga Roland":("Vargabetűs Roli","Vargabetűs"),
"Lovrencsics Gergő":("Lovaglós Gergő","Lovaglós"),
"Sándor Tamás":("Sándorkert Tomi","Sándorkert"),
"Szakály Péter":("Szakállas Peti","Szakállas"),
"Balajcza Szabolcs":("Balatoni Szabi","Balatoni"),
"Sándor György":("Sanyarú Gyuri","Sanyarú"),
"Tököli Attila":("Tökfőzelék Attus","Tökfőzelék"),
"Juhász István":("Juhtúrós Pista","Juhtúrós"),
"Orosz Pál":("Oroszlános Pali","Oroszlános"),
"Lantos Mihály":("Lantpengető Miska","Lantpengető"),
"Garaba Imre":("Garabonciás Imus","Garabonciás"),
"Kovács Kálmán":("Kovácsoltvas Kálmus","Kovácsoltvas"),
"Disztl Péter":("Diszkós Peti","Diszkós"),
"Káposzta Benő":("Savanyúkáposzta Benőke","Savanyúkáposzta"),
"Bodnár László":("Bodzás Laci","Bodzás"),
"Mészáros Norbert":("Mészárszéki Norbi","Mészárszéki"),
"Varga József":("Vargányás Jocó","Vargányás"),
"Dombi Tibor":("Dombtetői Tibi","Dombtetői"),
"Koltai Tamás":("Kolbászos Tomi","Kolbászos"),
"Havasi Sándor":("Havazós Sanyi","Havazós"),
"Gellér Sándor":("Gellérthegyi Sanyi","Gellérthegyi"),
"Zakariás József":("Zakatoló Jocó","Zakatoló"),
"Sallai Sándor":("Salakos Sanyi","Salakos"),
"Esterházy Márton":("Rostélyos Marci","Rostélyos"),
"Noskó Ernő":("Noszogató Ernőke","Noszogató"),
"Zámbó Sándor":("Zümmögő Sanyi","Zümmögő"),
"Dárdai Pál":("Dárdavető Pali","Dárdavető"),
"Vaskó Tamás":("Vasalódeszka Tomi","Vasalódeszka"),
"Tisza Tibor":("Tiszavirág Tibi","Tiszavirág"),
"Polonkai Attila":("Polentás Attus","Polentás"),
"Lipták Zoltán":("Liptói Zoli","Liptói"),
"Karába Ferenc":("Karalábé Ferkó","Karalábé"),
"Palotás Péter":("Palotapincsi Peti","Palotapincsi"),
"Andrusch József":("Andrusztos Jocó","Andrusztos"),
"Nagy Antal":("Nagyotmondó Tóni","Nagyotmondó"),
"Madar Csaba":("Madaras Csabi","Madaras"),
"Disztl László":("Diszkoszos Laci","Diszkoszos"),
"Csuhay József":("Csuhés Jocó","Csuhés"),
"Májer Lajos":("Májas Lali","Májas"),
"Nagy László":("Nagybőgős Laci","Nagybőgős"),
"Nyírő István":("Nyírfás Pista","Nyírfás"),
"Tóth András":("Tótágas Bandi","Tótágas"),
"Dunai Ede":("Dunakanyar Ede","Dunakanyar"),
"Komlósi Ádám":("Komlósör Ádi","Komlósör"),
"Szalai Attila":("Szalmakalap Attus","Szalmakalap"),
"Horváth Gábor":("Horgászós Gabi","Horgászós"),
"Csernyánszki Norbert":("Cserebogár Norbi","Cserebogár"),
"Éger László":("Égerfás Laci","Égerfás"),
"Heffler Tibor":("Hentelő Tibi","Hentelő"),
"Vayer Gábor":("Vajas Gabi","Vajas"),
"Szűcs Lajos":("Szűcsmester Lali","Szűcsmester"),
"Tóth Mihály":("Tótumfaktum Miska","Tótumfaktum"),
"Nagy Ádám":("Nagyharang Ádi","Nagyharang"),
"Gyimesi László":("Gyimesbükki Laci","Gyimesbükki"),
"Dajka László":("Dajkamese Laci","Dajkamese"),
"Pető Zoltán":("Petárdás Zoli","Petárdás"),
"Burcsa Győző":("Burgonyás Győzőke","Burgonyás"),
"Csongrádi Ferenc":("Csengettyűs Ferkó","Csengettyűs"),
"Vadász Imre":("Vadászlesi Imus","Vadászlesi"),
"Novath György":("Nováci Gyuri","Nováci"),
"Ádám Martin":("Ádámcsutka Martinka","Ádámcsutka"),
"Schäfer András":("Sáfrányos Bandi","Sáfrányos"),
"Simek Péter":("Simléderes Peti","Simléderes"),
"Lázár Pál":("Lázmérő Pali","Lázmérő"),
"Sipeki István":("Sipákoló Pista","Sipákoló"),
"Völgyi Dániel":("Völgyzáró Dani","Völgyzáró"),
"Vilezsál Oszkár":("Villanyszerelő Oszi","Villanyszerelő"),
"Csordás Lajos":("Csordapásztor Lali","Csordapásztor"),
"Lang Ádám":("Lángosos Ádi","Lángosos"),
"Kerkez Milos":("Kerekes Milánka","Kerekes"),
"Bodonyi Béla":("Bodzaszörp Béci","Bodzaszörp"),
"Szatmári Csaba":("Szatmáriszilva Csabi","Szatmáriszilva"),
"Végh Tibor":("Végszóra Tibi","Végszóra"),
"Horváth Gábor (1959)":("Horgászbot Gabi","Horgászbot"),
"Nagy Zsolt":("Nagydobos Zsoltika","Nagydobos"),
"Balog Zoltán":("Ballagós Zoli","Ballagós"),
"Gyurcsó Ádám":("Gyurmás Ádi","Gyurmás"),
"Kiss Tamás":("Kiskakas Tomi","Kiskakas"),
"Tóth Alex":("Tótfalusi Sanyika","Tótfalusi"),
"Fiola Attila":("Fiókás Attus","Fiókás"),
"Sikesdi Gábor":("Sikeres Gabi","Sikeres"),
"Vadicska Zsolt":("Vadvirágos Zsoltika","Vadvirágos"),
"Gazdag Dániel":("Gazdagréti Dani","Gazdagréti"),
"Böjte Attila":("Böjtölős Attus","Böjtölős"),
"Juhász Roland":("Juhbőrös Roli","Juhbőrös"),
"Horváth Dezső":("Hortobágyi Dezsőke","Hortobágyi"),
"Böőr Zoltán":("Bőröndös Zoli","Bőröndös"),
"Kövesfalvi István":("Kavicsos Pista","Kavicsos"),
"Bódi Ádám":("Bódító Ádi","Bódító"),
"Bernáth Csaba":("Bernátfülű Csabi","Bernátfülű"),
"Kleinheisler László":("Kishentes Laci","Kishentes"),
"Botka Endre":("Botladozó Bandi","Botladozó"),
"Varga Ádám":("Varázslós Ádi","Varázslós"),
"Ötvös Bence":("Ötvösműves Bencus","Ötvösműves"),
"Hahn János":("Hahotázó Jancsi","Hahotázó"),
"Kádár Tamás":("Kádfürdő Tomi","Kádfürdő"),
"Négo Loïc":("Négyszögletű Lojzi","Négyszögletű"),
"Kovácsik Ádám":("Kovácsműhely Ádi","Kovácsműhely"),
"Komáromi György":("Komáromierőd Gyuri","Komáromierőd"),
"Guzmics Richárd":("Guzsalyos Ricsi","Guzsalyos"),
"Németh Krisztián":("Némajátékos Kriszti","Némajátékos"),
"Dárdai Márton":("Dárdahegy Marci","Dárdahegy"),
"Bolla Bendegúz":("Bolyongó Bendi","Bolyongó"),
"Styles Callum":("Stílusos Kálmus","Stílusos"),
"Windecker József":("Szélkerék Jocó","Szélkerék"),
"Batik Bence":("Batikolt Bencus","Batikolt"),
"Gruber Zsombor":("Gubancos Zsombi","Gubancos"),
"Bárány Donát":("Báránybőrös Doni","Báránybőrös"),
"Stieber Zoltán":("Stiblis Zoli","Stiblis"),
"Priskin Tamás":("Priznices Tomi","Priznices"),
"Bogdán Ádám":("Bogáncsos Ádi","Bogáncsos"),
"Sigér Dávid":("Szigorú Dávid","Szigorú"),
"Varga Kevin":("Vargacipő Kelemen","Vargacipő"),
"Csoboth Kevin":("Csobbanós Kelemen","Csobbanós"),
"Máté Péter":("Mátyásmadár Peti","Mátyásmadár"),
"Kiss Zoltán":("Kiskanál Zoli","Kiskanál"),
"Kinyik Ákos":("Kinyíló Ákoska","Kinyíló"),
"Balogh Balázs":("Balgatag Balus","Balgatag"),
"Papp Kristóf":("Paprikás Kristi","Paprikás"),
"Markek Tamás":("Marokszedő Tomi","Marokszedő"),
"Ferenczi János":("Fergeteges Jancsi","Fergeteges"),
"Pintér Ádám":("Pincérkedő Ádi","Pincérkedő"),
"Korhut Mihály":("Korhelyleves Miska","Korhelyleves"),
"Hangya Szilveszter":("Hangyaboly Szilvi","Hangyaboly"),
"Schön Szabolcs":("Sönteres Szabi","Sönteres"),
"Holender Filip":("Hollandus Fülöp","Hollandus"),
"Tóth Balázs":("Tóparti Balus","Tóparti"),
"Szabó János":("Szabóolló Jancsi","Szabóolló"),
"Osvald Attila":("Ostoros Attus","Ostoros"),
"Szolnoki Roland":("Szélmalom Roli","Szélmalom"),
"Horváth Krisztofer":("Horpadt Kristi","Horpadt"),
"Vas Gábor":("Vasalatos Gabi","Vasalatos"),
"Szécsi Márk":("Szecskavágó Márkó","Szecskavágó"),
"Baranyai Nimród":("Barangoló Nimród","Barangoló"),
"Kusnyír Erik":("Kuszált Erikó","Kuszált"),
}
MANUAL.update(HU_MANUAL)

# ═══ KÜLFÖLDI FELSŐ KÖR — kézzel ════════════════════════════════════════════
# A felismerhető nevek. A gépi réteg ezeknél is adna eredményt, de a poén
# ezeken a neveken ül — itt éri meg a kézi munka.
FOREIGN_1 = {
# ── Spanyolország ───────────────────────────────────────────────────────────
"Xavi":("Csávi","Csávi"),
"Andrés Iniesta":("Inyencesta Bandi","Inyencesta"),
"Sergio Ramos":("Ramaty Szergej","Ramaty"),
"Carles Puyol":("Pulyka Karcsi","Pulyka"),
"Xabi Alonso":("Alonsó Csabi","Alonsó"),
"Sergio Busquets":("Buszmegálló Szergej","Buszmegálló"),
"Fernando Torres":("Tornyos Nándi","Tornyos"),
"Gerard Piqué":("Pikáns Gellért","Pikáns"),
"Rodri":("Rodeó","Rodeó"),
"David Silva":("Szilvás Dávid","Szilvás"),
"Cesc Fàbregas":("Fabrikás Cseszkó","Fabrikás"),
"David Villa":("Villás Dávid","Villás"),
"Víctor Valdés":("Vályogvető Viktor","Vályogvető"),
"Raúl":("Ravasz Rudolf","Ravasz"),
"Lamine Yamal":("Jamalka Levente","Jamalka"),
"Fernando Hierro":("Vasalt Nándi","Vasalt"),
"Fabián Ruiz":("Ruzsás Fábián","Ruzsás"),
"Pedri":("Pedálos","Pedálos"),
"Jordi Alba":("Albatrosz Gyuri","Albatrosz"),
"Emilio Butragueño":("Butykos Emil","Butykos"),
"Diego Costa":("Kosztos Dijégó","Kosztos"),
"Thiago Alcântara":("Alkantára Tihamér","Alkantára"),
"Dani Carvajal":("Karvalyos Dani","Karvalyos"),
"David Raya":("Rájás Dávid","Rájás"),
"Francisco Gento":("Gyentés Ferkó","Gyentés"),
"Mikel Oyarzabal":("Ojjezabál Miki","Ojjezabál"),
"Luis Suárez Miramontes":("Hegymászó Lajos","Hegymászó"),
"Aymeric Laporte":("Lapátos Imre","Lapátos"),
"Santiago Cañizares":("Kanizsai Szaniszló","Kanizsai"),
"Javi Martínez":("Martonos Jávor","Martonos"),
"Isco":("Iskola","Iskola"),
"Pep Guardiola":("Gárdista Jocó","Gárdista"),
"Fernando Morientes":("Mórickás Nándi","Mórickás"),
"Martín Zubimendi":("Zubbonyos Márton","Zubbonyos"),
"Míchel":("Miskes","Miskes"),
"Fernando Llorente":("Lorántos Nándi","Lorántos"),
"Nico Williams":("Vilmosfi Miklós","Vilmosfi"),
"Andoni Zubizarreta":("Zabszemes Bandi","Zabszemes"),
"Manolo Sanchís":("Sáncos Manó","Sáncos"),
"Rubén Baraja":("Barackos Rubén","Barackos"),
"Mikel Merino":("Merinói Miki","Merinói"),
"Gaizka Mendieta":("Mendikás Gejza","Mendikás"),
"Pedro Rodríguez":("Ródlizó Peti","Ródlizó"),
"Alejandro Grimaldo":("Grimaszos Sándor","Grimaszos"),
"Pepe Reina":("Reineszánsz Jocó","Reineszánsz"),
"Dani Olmo":("Ólmos Dani","Ólmos"),
"Unai Simón":("Simonpuszta Unó","Simonpuszta"),

# ── Olaszország ─────────────────────────────────────────────────────────────
"Alessandro Nesta":("Neszes Sándor","Neszes"),
"Franco Baresi":("Baracklekvár Ferkó","Baracklekvár"),
"Francesco Totti":("Totózó Ferkó","Totózó"),
"Fabio Cannavaro":("Kannás Fábián","Kannás"),
"Andrea Pirlo":("Pirul András","Pirul"),
"Valentino Mazzola":("Mazsolás Bálint","Mazsolás"),
"Marco Verratti":("Veréb Márkó","Veréb"),
"Leonardo Bonucci":("Bonbonos Lénárd","Bonbonos"),
"Gianluca Zambrotta":("Zsemlebrottya Lukács","Zsemlebrottya"),
"Gianluca Vialli":("Viasz Lukács","Viasz"),
"Giorgio Chiellini":("Kelkáposzta Gyuri","Kelkáposzta"),
"Alessandro Del Piero":("Delpékáru Sándor","Delpékáru"),
"Gianluigi Donnarumma":("Dunnarongy Lajos","Dunnarongy"),
"Alessandro Costacurta":("Kosztkurta Sándor","Kosztkurta"),
"Dino Zoff":("Zoffos Dini","Zoffos"),
"Ciro Ferrara":("Fáraós Ciró","Fáraós"),
"Gaetano Scirea":("Sziréna Gedeon","Sziréna"),
"Christian Vieri":("Vérnyomás Kriszti","Vérnyomás"),
"Giacinto Facchetti":("Fakettős Jácint","Fakettős"),
"Gianfranco Zola":("Zsolnai Ferkó","Zsolnai"),
"Gianni Rivera":("Riviéra Jani","Riviéra"),
"Gigi Riva":("Riadó Gigi","Riadó"),
"Sandro Tonali":("Tonhalas Sanyi","Tonhalas"),
"Gennaro Gattuso":("Gatyás Gennaró","Gatyás"),
"Walter Zenga":("Zsenge Valter","Zsenge"),
"Roberto Mancini":("Mancsos Robi","Mancsos"),
"Dino Baggio":("Bádzsós Dini","Bádzsós"),
"Giuseppe Bergomi":("Bergengóc Jocó","Bergengóc"),
"Sandro Mazzola":("Mazsolapuding Sanyi","Mazsolapuding"),
"Guglielmo Gabetto":("Gabonás Vilmos","Gabonás"),
"Angelo Peruzzi":("Perzselő Angyal","Perzselő"),
"Roberto Donadoni":("Adományos Robi","Adományos"),
"Francesco Toldo":("Toldi Ferkó","Toldi"),
"Antonio Conte":("Kontyos Tóni","Kontyos"),
"Roberto Bettega":("Betegágy Robi","Betegágy"),
"Ezio Loik":("Lóikra Ezüst","Lóikra"),
"Marco Tardelli":("Tarhonyás Márkó","Tarhonyás"),
"Nicolò Barella":("Barellás Miklós","Barellás"),
"Carlo Ancelotti":("Ancúgos Karcsi","Ancúgos"),
"Andrea Barzagli":("Barzsulyás András","Barzsulyás"),
"Luca Toni":("Tonhal Lukács","Tonhal"),

# ── Franciaország ───────────────────────────────────────────────────────────
"Thierry Henry":("Hentes Tivadar","Hentes"),
"Lilian Thuram":("Turmixos Lilián","Turmixos"),
"Patrick Vieira":("Vierázó Patrik","Vierázó"),
"Fabien Barthez":("Bárcsak Fábián","Bárcsak"),
"Marcel Desailly":("Deszkás Marcell","Deszkás"),
"Ousmane Dembélé":("Dembőgő Uzsonna","Dembőgő"),
"Laurent Blanc":("Blanketta Lőrinc","Blanketta"),
"Raphaël Varane":("Varangyos Rafi","Varangyos"),
"N'Golo Kanté":("Kandúr Ingó","Kandúr"),
"Eric Cantona":("Kantinos Erik","Kantinos"),
"Karim Benzema":("Benzinkutas Karesz","Benzinkutas"),
"Robert Pirès":("Pirézs Robi","Pirézs"),
"Ludovic Giuly":("Gyulai Lajos","Gyulai"),
"Just Fontaine":("Fontos Jusztin","Fontos"),
"David Trezeguet":("Trézsigetes Dávid","Trézsigetes"),
"Hugo Lloris":("Lóris Hugó","Lóris"),
"Franck Ribéry":("Ribizlis Ferkó","Ribizlis"),
"Johan Micoud":("Mikulás Jani","Mikulás"),
"Antoine Griezmann":("Grízes Antal","Grízes"),
"Raymond Kopa":("Kopasz Rajmund","Kopasz"),
"Jean-Pierre Papin":("Papírzsebkendő Jean","Papírzsebkendő"),
"Didier Deschamps":("Sampon Didi","Sampon"),
"Paul Pogba":("Pogácsa Pali","Pogácsa"),
"Claude Makélélé":("Makrélás Kolos","Makrélás"),
"Youri Djorkaeff":("Gyorskávé Jurij","Gyorskávé"),
"Éric Abidal":("Abroszos Erik","Abroszos"),
"Patrice Evra":("Evrázsiai Patrik","Evrázsiai"),
"Christopher Nkunku":("Kukucskáló Kristóf","Kukucskáló"),
"William Saliba":("Salétromos Vilmos","Salétromos"),
"Bixente Lizarazu":("Lizárgó Bikszád","Lizárgó"),
"Emmanuel Petit":("Petites Manó","Petites"),
"Mike Maignan":("Manyós Miki","Manyós"),
"Sylvain Wiltord":("Viltorlás Szilván","Viltorlás"),
"Dayot Upamecano":("Uppáré Dajka","Uppáré"),
"Nicolas Anelka":("Anyellős Miklós","Anyellős"),
"Blaise Matuidi":("Matyódíszes Balázs","Matyódíszes"),
"Olivier Giroud":("Girhes Olivér","Girhes"),
"Michael Olise":("Olajos Mihály","Olajos"),
"Roger Piantoni":("Piantos Rózsi","Piantos"),
"Basile Boli":("Bolyongós Vazul","Bolyongós"),

# ── Brazília ────────────────────────────────────────────────────────────────
"Neymar":("Nyemár","Nyemár"),
"Roberto Carlos":("Karcsi Robi","Karcsi"),
"Alisson Becker":("Alizés Bekker","Alizés"),
"Dani Alves":("Alvós Dani","Alvós"),
"Marquinhos":("Márkinka","Márkinka"),
"Dida":("Didergő","Didergő"),
"Jairzinho":("Zsírzsinka","Zsírzsinka"),
"Falcão":("Falkán","Falkán"),
"Thiago Silva":("Szilvafa Tihamér","Szilvafa"),
"Sócrates":("Szókratesz","Szókratesz"),
"Ederson":("Ederzsön","Ederzsön"),
"Raí":("Rájönn","Rájönn"),
"Marcelo":("Marcello","Marcello"),
"Júlio César":("Császár Gyula","Császár"),
"Vinícius Júnior":("Viniczius Ifjabb","Viniczius"),
"Rivaldo":("Rivalda","Rivalda"),
"Nílton Santos":("Szantosz Nílus","Szantosz"),
"Didi":("Dídi","Dídi"),
"Lúcio":("Lucskos","Lucskos"),
"Gabriel Magalhães":("Magaláj Gábor","Magaláj"),
"Carlos Alberto Torres":("Torony Karcsi","Torony"),
"Gérson":("Gerzson","Gerzson"),
"Rivelino":("Rivelinka","Rivelinka"),
"Bebeto":("Bébéto","Bébéto"),
"Roberto Firmino":("Firminka Robi","Firminka"),
"Maicon":("Májkon","Májkon"),
"Fernandinho":("Nándorinka","Nándorinka"),
"Aílton":("Ájlton","Ájlton"),
"Tostão":("Tósztán","Tósztán"),
"Toninho Cerezo":("Cseresznyés Tóni","Cseresznyés"),
"José Altafini":("Altatós Jocó","Altatós"),
"Fabinho":("Fabinka","Fabinka"),
"Júnior":("Ifjabbik","Ifjabbik"),
"Juninho Pernambucano":("Perembukó Janika","Perembukó"),
"Thiago Motta":("Mottós Tihamér","Mottós"),
"Mauro Silva":("Szilvamag Mór","Szilvamag"),
"Gilmar":("Gilmár","Gilmár"),
"Coutinho":("Kutyinka","Kutyinka"),
"Dante":("Dantesz","Dantesz"),
"Leandro":("Leánder","Leánder"),
}
MANUAL.update(FOREIGN_1)

FOREIGN_2 = {
# ── Németország ─────────────────────────────────────────────────────────────
"Manuel Neuer":("Nyűgös Manó","Nyűgös"),
"Lothar Matthäus":("Matyó Lotár","Matyó"),
"Karl-Heinz Rummenigge":("Rumosdiós Karcsi","Rumosdiós"),
"İlkay Gündoğan":("Gondűző Ilka","Gondűző"),
"Toni Kroos":("Krózus Tóni","Krózus"),
"Philipp Lahm":("Lámpás Fülöp","Lámpás"),
"Joshua Kimmich":("Kéményseprő Jozsó","Kéményseprő"),
"Sami Khedira":("Kedélyes Samu","Kedélyes"),
"Jérôme Boateng":("Boatengó Jeromos","Boatengó"),
"Matthias Sammer":("Szamóca Máté","Szamóca"),
"Mats Hummels":("Hümmögő Máté","Hümmögő"),
"Mesut Özil":("Őzike Mesüt","Őzike"),
"Jürgen Kohler":("Kohászos György","Kohászos"),
"Sepp Maier":("Májer Zsepp","Májer"),
"Paul Breitner":("Brájtnadrág Pali","Brájtnadrág"),
"Jonathan Tah":("Tahós Jónás","Tahós"),
"Michael Ballack":("Bálákos Mihály","Bálákos"),
"Jens Lehmann":("Lehelet Jenci","Lehelet"),
"Mario Götze":("Gőzős Márió","Gőzős"),
"Jamal Musiala":("Muzsikáló Jámbor","Muzsikáló"),
"Bernd Schuster":("Suszter Bernát","Suszter"),
"Miroslav Klose":("Klozettos Miró","Klozettos"),
"Andreas Möller":("Mélabús András","Mélabús"),
"Berti Vogts":("Fogtő Berci","Fogtő"),
"Jupp Heynckes":("Hejnkes Jupiter","Hejnkes"),
"Horst Hrubesch":("Hordós Horzsolt","Hordós"),
"Andreas Brehme":("Brémai András","Brémai"),
"Serge Gnabry":("Nyavalyás Szergej","Nyavalyás"),
"Rainer Bonhof":("Bonbonudvar Rajnai","Bonbonudvar"),
"Manfred Kaltz":("Kaltuszos Manfréd","Kaltuszos"),
"Felix Magath":("Magadtól Félix","Magadtól"),
"Leroy Sané":("Sanyaró Leró","Sanyaró"),
"Uli Hoeneß":("Hőnyes Ulrik","Hőnyes"),
"Mehmet Scholl":("Sólyás Menyhért","Sólyás"),

# ── Anglia ──────────────────────────────────────────────────────────────────
"Paul Scholes":("Skolasztikus Pali","Skolasztikus"),
"John Terry":("Terelő Jancsi","Terelő"),
"Bobby Charlton":("Csarnokos Bobi","Csarnokos"),
"Frank Lampard":("Lámpaernyő Ferkó","Lámpaernyő"),
"Harry Kane":("Kánaán Harcsa","Kánaán"),
"Paul Gascoigne":("Gázolós Pali","Gázolós"),
"Peter Shilton":("Sültön Peti","Sültön"),
"Steven Gerrard":("Gereblyés Pista","Gereblyés"),
"Chris Waddle":("Vadlúd Kriszti","Vadlúd"),
"Trent Alexander-Arnold":("Sándorarnold Trencsén","Sándorarnold"),
"Ashley Cole":("Kólás Ancsa","Kólás"),
"Rio Ferdinand":("Ferdefalú Rió","Ferdefalú"),
"Jude Bellingham":("Bélszínes Judit","Bélszínes"),
"Alan Shearer":("Sörös Alán","Sörös"),
"Gordon Banks":("Bankos Gordon","Bankos"),
"Gary Lineker":("Lineáris Gari","Lineáris"),
"Bukayo Saka":("Szakadós Bukó","Szakadós"),
"Sol Campbell":("Kampós Salamon","Kampós"),
"Declan Rice":("Rizses Deklan","Rizses"),
"Michael Carrick":("Karikás Mihály","Karikás"),
"Kieran Trippier":("Tripla Kirán","Tripla"),
"Jamie Carragher":("Karagörgő Jakab","Karagörgő"),
"Les Ferdinand":("Ferdeorrú Lesz","Ferdeorrú"),
"Gary Neville":("Nyavalygó Gari","Nyavalygó"),
"Joe Cole":("Kolbászos Jóska","Kolbászosjó"),
"Kyle Walker":("Vasalógép Kálmán","Vasalógép"),
"John Stones":("Sztaniol Jancsi","Sztaniol"),
"Nick Pope":("Pápás Miklós","Pápás"),

# ── Argentína ───────────────────────────────────────────────────────────────
"Alfredo Di Stéfano":("Distefános Alfréd","Distefános"),
"Ángel Di María":("Dimáriás Angyal","Dimáriás"),
"Juan Román Riquelme":("Rikkancs Jancsi","Rikkancs"),
"Roberto Ayala":("Ajakos Robi","Ajakos"),
"Juan Sebastián Verón":("Verőfényes Jancsi","Verőfényes"),
"Sergio Agüero":("Ágyúgolyó Szergej","Ágyúgolyó"),
"Gabriel Batistuta":("Batyus Gábor","Batyus"),
"Javier Mascherano":("Maskarás Jávor","Maskarás"),
"Hernán Crespo":("Krepdesin Hernő","Krepdesin"),
"Alexis Mac Allister":("Makallós Sándor","Makallós"),
"Javier Zanetti":("Zanótos Jávor","Zanótos"),
"Esteban Cambiasso":("Kambiumos Pista","Kambiumos"),
"Paulo Dybala":("Dibalámpa Pali","Dibalámpa"),
"Mauro Icardi":("Ikrás Mór","Ikrás"),
"Fernando Redondo":("Redőnyös Nándi","Redőnyös"),
"Diego Simeone":("Szimatoló Dijégó","Szimatoló"),
"Pablo Aimar":("Ájmár Pali","Ájmár"),
"Ricardo Bochini":("Bocskoros Ricsi","Bocskoros"),
"Lautaro Martínez":("Martonvásár Lantos","Martonvásár"),
"Walter Samuel":("Sámulós Valter","Sámulós"),
"Diego Milito":("Milimétős Dijégó","Milimétős"),
"Carlos Tévez":("Tévedős Karcsi","Tévedős"),
"Nicolás Otamendi":("Otthonmendi Miklós","Otthonmendi"),
"Emiliano Martínez":("Martinkás Emil","Martinkás"),
"Ariel Ortega":("Ortopéd Ariel","Ortopéd"),
"Julián Álvarez":("Alvarézs Gyula","Alvarézs"),
"Javier Saviola":("Savanyó Jávor","Savanyó"),

# ── Portugália ──────────────────────────────────────────────────────────────
"Bernardo Silva":("Szilvásgombóc Bernát","Szilvásgombóc"),
"Deco":("Dekó","Dekó"),
"Pepe":("Pepita","Pepita"),
"Luís Figo":("Fügés Lajos","Fügés"),
"Eusébio":("Özséb","Özséb"),
"Vitinha":("Vitinka","Vitinka"),
"Ricardo Carvalho":("Karvalyfi Ricsi","Karvalyfi"),
"João Cancelo":("Kancsalos Jancsi","Kancsalos"),
"Rui Costa":("Kosztolós Rudi","Kosztolós"),
"Paulo Futre":("Futrinka Pali","Futrinka"),
"Nuno Mendes":("Mendemonda Núnó","Mendemonda"),
"Rúben Dias":("Diászos Rubén","Diászos"),
"Maniche":("Manics","Manics"),
"Fábio Coentrão":("Kenyértrón Fábián","Kenyértrón"),
"João Moutinho":("Mutyinka Jancsi","Mutyinka"),
"Mário Coluna":("Kolumnás Márió","Kolumnás"),
"Fernando Gomes":("Gomolyás Nándi","Gomolyás"),
"Rafael Leão":("Leányka Rafi","Leányka"),
"Vítor Baía":("Bájos Viktor","Bájos"),
"Rui Patrício":("Patrícius Rudi","Patrícius"),

# ── Hollandia ───────────────────────────────────────────────────────────────
# A holland partikulás nevek (van / van der / de) egyetlen szóvá olvadnak,
# ahogy a gépi réteg is csinálja — így a rövid alak egyértelmű marad.
"Virgil van Dijk":("Vándijkos Virgil","Vándijkos"),
"Marco van Basten":("Vánbástya Márkó","Vánbástya"),
"Clarence Seedorf":("Sződörfi Kelemen","Sződörfi"),
"Ruud Gullit":("Gulyásleves Rudi","Gulyásleves"),
"Frank Rijkaard":("Rájkártya Ferkó","Rájkártya"),
"Robin van Persie":("Vánpersely Robi","Vánpersely"),
"Arjen Robben":("Robbanós Árpi","Robbanós"),
"Ruud van Nistelrooy":("Vánnyisztelrúzs Rudi","Vánnyisztelrúzs"),
"Edwin van der Sar":("Vándorsarok Ede","Vándorsarok"),
"Johan Neeskens":("Nyeskens Jancsi","Nyeskens"),
"Rob Rensenbrink":("Renszebrinkó Robi","Renszebrinkó"),
"Ronald Koeman":("Kőműves Roland","Kőműves"),
"Jaap Stam":("Stampedli Jakab","Stampedli"),
"Dennis Bergkamp":("Bergkempingi Dénes","Bergkempingi"),
"Klaas-Jan Huntelaar":("Huncutlár Kolos","Huncutlár"),
"Arie Haan":("Hanyatt Áron","Hanyatt"),
"Edgar Davids":("Dávidos Edgár","Dávidos"),
"Matthijs de Ligt":("Deligeti Máté","Deligeti"),
"Frenkie de Jong":("Dejónapot Ferkó","Dejónapot"),
"Ruud Krol":("Królikus Rudi","Królikus"),
}
MANUAL.update(FOREIGN_2)

FOREIGN_3 = {
# ── Uruguay ─────────────────────────────────────────────────────────────────
"Luis Suárez":("Subás Lajos","Subás"),
"Federico Valverde":("Válogatós Frigyes","Válogatós"),
"Enzo Francescoli":("Ferencesküllő Vince","Ferencesküllő"),
"Edinson Cavani":("Kaviár Ede","Kaviár"),
"Diego Godín":("Gödény Dijégó","Gödény"),
"Álvaro Recoba":("Rekoba Álmos","Rekoba"),
# ── Skócia ──────────────────────────────────────────────────────────────────
"Kenny Dalglish":("Daliás Kende","Daliás"),
"Jimmy Johnstone":("Jancsikő Gyimi","Jancsikő"),
"Graeme Souness":("Susnyás Gerő","Susnyás"),
"Andrew Robertson":("Robifia Bandi","Robifia"),
"Bobby Murdoch":("Murdéros Bobi","Murdéros"),
"Alan Hansen":("Hanzérozó Alán","Hanzérozó"),
# ── Horvátország ────────────────────────────────────────────────────────────
"Ivan Perišić":("Perecsics Iván","Perecsics"),
"Ivan Rakitić":("Rakétics Iván","Rakétics"),
"Mario Mandžukić":("Mandulics Márió","Mandulics"),
"Marcelo Brozović":("Borzovics Marcell","Borzovics"),
"Robert Prosinečki":("Prószinyecki Robi","Prószinyecki"),
"Alen Bokšić":("Bokszics Alán","Bokszics"),
# ── Belgium ─────────────────────────────────────────────────────────────────
"Thibaut Courtois":("Kurtított Tibor","Kurtított"),
"Kevin De Bruyne":("Debrünyó Kelemen","Debrünyó"),
"Eden Hazard":("Hazárd Ede","Hazárd"),
"Romelu Lukaku":("Lukakukac Román","Lukakukac"),
"Toby Alderweireld":("Aldervilág Tóbiás","Aldervilág"),
# ── Dánia ───────────────────────────────────────────────────────────────────
"Michael Laudrup":("Laudanum Mihály","Laudanum"),
"Allan Simonsen":("Simonyifi Alán","Simonyifi"),
"Christian Eriksen":("Erikfi Kriszti","Erikfi"),
"Preben Elkjær":("Elkér Prebendás","Elkér"),
# ── Kolumbia ────────────────────────────────────────────────────────────────
"James Rodríguez":("Rodrigó Jakab","Rodrigó"),
"Luis Díaz":("Diós Lajos","Diós"),
"Faustino Asprilla":("Aszpirines Fausztin","Aszpirines"),
"Radamel Falcao":("Falkó Radamesz","Falkó"),
# ── Lengyelország ───────────────────────────────────────────────────────────
"Robert Lewandowski":("Levendulás Robi","Levendulás"),
"Wojciech Szczęsny":("Szöszmötölő Vojtek","Szöszmötölő"),
"Piotr Zieliński":("Zöldellő Peti","Zöldellő"),
# ── Norvégia ────────────────────────────────────────────────────────────────
"Erling Haaland":("Hálóföld Erik","Hálóföld"),
"Martin Ødegaard":("Ődöngő Márton","Ődöngő"),
"Ole Gunnar Solskjær":("Napszemüveg Olaf","Napszemüveg"),
# ── Wales ───────────────────────────────────────────────────────────────────
"Gareth Bale":("Bálás Gergő","Bálás"),
"Ryan Giggs":("Gigászi Rajmund","Gigászi"),
"Ian Rush":("Rohanós Ivó","Rohanós"),
# ── Szerbia ─────────────────────────────────────────────────────────────────
"Nemanja Vidić":("Vidámics Nándor","Vidámics"),
"Nemanja Matić":("Matyics Nándor","Matyics"),
"Nemanja Nikolić":("Nikolics Nándor","Nikolics"),
# ── Szovjetunió ─────────────────────────────────────────────────────────────
"Ihor Belanov":("Belánov Igor","Belánov"),
"Oleh Blohin":("Blohács Olaf","Blohács"),
"Olekszandr Zavarov":("Zavaros Sándor","Zavaros"),
# ── és a többiek ────────────────────────────────────────────────────────────
"Hugo Sánchez":("Sáncos Hugó","Sáncoshu"),
"Rafael Márquez":("Márkás Rafi","Márkás"),
"Roy Keane":("Kányás Rezső","Kányás"),
"Denis Irwin":("Irhabundás Dénes","Irhabundás"),
"Khvicha Kvaratskhelia":("Kvargliszelet Kvicsi","Kvargliszelet"),
"Kakha Kaladze":("Kalapos Kaka","Kalapos"),
"Abedi Pelé":("Abédi Béla","Abédi"),
"Michael Essien":("Esszencia Mihály","Esszencia"),
"Alberto Spencer":("Spenótos Albert","Spenótos"),
"Willian Pacho":("Pacsuli Vilmos","Pacsuli"),
"Claudio Bravo":("Bravúros Kolos","Bravúros"),
"Arturo Vidal":("Vidámpark Artúr","Vidámpark"),
"Edin Džeko":("Dzsekós Ede","Dzsekós"),
"Miralem Pjanić":("Pjaniccs Mirkó","Pjaniccs"),
"Achraf Hakimi":("Hakni Ákos","Hakni"),
"Hristo Stoicskov":("Sztoikus Krisztofer","Sztoikus"),
"Sadio Mané":("Manézs Szidónia","Manézs"),
"Andrij Sevcsenko":("Sevróbőr András","Sevróbőr"),
"Victor Osimhen":("Ozsonnás Viktor","Ozsonnás"),
"Josef Martínez":("Martonfi Jocó","Martonfi"),
"Petr Čech":("Csehó Peti","Csehó"),
"David Alaba":("Alabástrom Dávid","Alabástrom"),
"Keylor Navas":("Naválós Kelemen","Naválós"),
"Dejan Savićević":("Szavicsevics Deján","Szavicsevics"),
"Riyad Mahrez":("Mahrezgő Rijád","Mahrezgő"),
"Eiður Guðjohnsen":("Gudujancsi Ejda","Gudujancsi"),
"Jari Litmanen":("Litmanó Jári","Litmanó"),
"Gheorghe Hagi":("Hagymás György","Hagymás"),
"Viktor Gyökeres":("Gyökérzet Viktor","Gyökérzet"),
"Son Heung-min":("Szonhomin","Szonhomin"),
"Shinji Kagawa":("Kagylós Sindzsi","Kagylós"),
"Predrag Mijatović":("Mijatovics Predrág","Mijatovics"),
"Darko Pančev":("Páncélos Darkó","Páncélos"),
"Miguel Almirón":("Almáriom Miklós","Almáriom"),
"Alphonso Davies":("Dávidfi Alfonz","Dávidfi"),
}
MANUAL.update(FOREIGN_3)

# ═══ NEM A KERETEKBŐL JÖVŐ VALÓS NEVEK ══════════════════════════════════════
# Ezeket a végponti próba találta meg: a képernyőn jelennek meg, de nem a
# SQUADS-ból származnak, tehát a keretekből épült táblába nem kerültek bele.
EXTRA = {
# ── SCOUT_NAMES: hét VALÓDI, legendás felfedező (a másik hét már kitalált) ──
"Piet de Visser":("Devizás Petya","Devizás"),
"Bob Bishop":("Püspökös Bob","Püspökös"),
"Geoff Twentyman":("Huszonegyes Gedeon","Huszonegyes"),
"Sven Mislintat":("Mislinkó Szvén","Mislinkó"),
"Steve Walsh":("Valcerozó Pista","Valcerozó"),
"Josep Colomer":("Kolompos Jocó","Kolompos"),
"Malcolm Fidgeon":("Fityegő Malkolm","Fityegő"),

# ── ACADEMY_ICON_NAMES: az akadémia „kacsintásai" ──────────────────────────
# Ezek külön kanonikus kulcsok, jórészt PUSZTA VEZETÉKNÉVVEL — a magyar
# alakjuk szándékosan ugyanaz, mint a teljes nevű párjuké, hogy ugyanaz a
# legenda ugyanúgy hangozzon. Ahol emiatt ütközik a rövid alak, az
# ütközésfeloldó mindkettőt teljes néven írja ki.
"Nyilasi Tibor":("Nyilazó Tibi","Nyilazó"),
"Maradona":("Méridonna","Méridonna"),
"Di Stéfano":("Distefános","Distefános"),
"Kempes":("Kempinges","Kempinges"),
"Passarella":("Paszulyos","Paszulyos"),
"Batistuta":("Batyus","Batyus"),
"Cruyff":("Krojfi","Krojfi"),
"Van Basten":("Vánbástya","Vánbástya"),
"Gullit":("Gulyásleves","Gulyásleves"),
"Rijkaard":("Rájkártya","Rájkártya"),
"Bergkamp":("Bergkempingi","Bergkempingi"),
"Beckenbauer":("Bekembójer","Bekembójer"),
"Müller":("Molnár","Molnár"),
"Matthäus":("Matyó","Matyó"),
"Rummenigge":("Rumosdiós","Rumosdiós"),
"Netzer":("Neccer","Neccer"),
"Platini":("Platón","Platón"),
"Kopa":("Kopasz","Kopasz"),
"Fontaine":("Fontos","Fontos"),
"Papin":("Papírzsebkendő","Papírzsebkendő"),
"Cantona":("Kantinos","Kantinos"),
"Baggio":("Bádzsó","Bádzsó"),
"Rossi":("Rozsdás","Rozsdás"),
"Maldini":("Máldi","Máldi"),
"Baresi":("Baracklekvár","Baracklekvár"),
"Del Piero":("Delpékáru","Delpékáru"),
"Best":("Legjobb","Legjobb"),
"Charlton":("Csarnokos","Csarnokos"),
"Eusébio":("Özséb","Özséb"),
"Yashin":("Jancsi","Jancsi"),
"Weah":("Véha","Véha"),
}
MANUAL.update(EXTRA)

# ═══ DURVA SZÓ ELKERÜLÉSE ═══════════════════════════════════════════════════
# A fonetikus szabályokból véletlenül trágár alak jött ki. Ezek kézi
# felülírások; a generátorban emellett állandó szűrő is fut (lásd build.py).
CLEAN = {
"Federico Fazio":("Fáziskésés Frigyes","Fáziskésés"),
"Victor Boniface":("Bonifác Viktor","Bonifác"),
"David Ospina":("Ispán Dávid","Ispán"),
}
MANUAL.update(CLEAN)

# ═══ EDZŐK — kézzel ═════════════════════════════════════════════════════════
# Az edzőt a karrier INDÍTÁSAKOR választod ki, három közül, névvel és
# jellemzéssel — tehát ugyanolyan hangsúlyos név, mint a keret sztárja.
# A gépi réteg itt gyengét adott („Barótika Lali", „Storkk Bernát").
EDZOK = {
"Baróti Lajos":     ("Barátságos Lali", "Barátságos"),
"Verebes József":   ("Verébfészek Jocó", "Verébfészek"),
"Csank János":      ("Csánkos Jancsi", "Csánkos"),
"Egervári Sándor":  ("Egricsillag Sanyi", "Egricsillag"),
"Mezey György":     ("Mezítlábas Gyuri", "Mezítlábas"),
"Bernd Storck":     ("Gólyás Bernát", "Gólyás"),          # Storch = gólya
"José Mourinho":    ("Morgolódó József", "Morgolódó"),
"Arrigo Sacchi":    ("Zsákos Ábris", "Zsákos"),           # sacco = zsák
}
MANUAL.update(EDZOK)


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
  "Edmílson": ("Édmílsonka", "Édmílsonka"),
  "Alan Shearer": ("Sír E. A. Lány", "Sírealány"),
  "Alessandro Costacurta": ("Aztakurva Sándor", "Aztakurva"),
  "Alessandro Nesta": ("Nesztea Sándor", "Nesztea"),
  "Alexis Mac Allister": ("Makelliszter Sándor", "Makelliszter"),
  "Alfredo Di Stéfano": ("Disztefános Alfréd", "Distefános"),
  "Alisson Becker": ("Aluszékony Bekker", "Aluszékony"),
  # EGY EMBER, EGY KULCS (3.9.81): a 29. köteg Chelsea-kártyája is ide
  # mutat. A „Sebcselló Andris" a frissen kapott alak — a korábbi
  # „Sebcselló Bandi" ugyanerre a személyre szólt.
  "Andrij Sevcsenko": ("Sebcselló Andris", "Sebcselló"),
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
  "Anderson": ("ifj. Ánderfi", "ifj. Ánderfi"),
  "Maldini": ("ifj. Máldi", "ifj. Máldi"), # ✏️ meglévő sor átírása
  "Baggio": ("ifj. Bádzsó", "ifj. Bádzsó"), # ✏️ meglévő sor átírása
  "Best": ("ifj. Legjobb", "ifj. Legjobb"), # ✏️ meglévő sor átírása
  "Charlton": ("ifj. Csarnokos", "ifj. Csarnokos"), # ✏️ meglévő sor átírása
  "Kopa": ("ifj. Kopasz", "ifj. Kopasz"), # ✏️ meglévő sor átírása
  "Fontaine": ("ifj. Fontos", "ifj. Fontos"), # ✏️ meglévő sor átírása
  "Matthäus": ("ifj. Matyó", "ifj. Matyó"), # ✏️ meglévő sor átírása
# ── A `-son` / `-sson` / `-sen` = `-fia`
  "John Robertson": ("Róbertffy János", "Róbertffy"),
  "Jordan Henderson": ("Henderffy Jordán", "Henderffy"),
  "Felipe Anderson": ("Ánderfi Fülöp", "Ánderfi"),
  "Henrik Larsson": ("Larszffy Henrik", "Larszffy"),
  "Roland Nilsson": ("Nílsffy Roland", "Nílsffy"),
  "Ronny Johnsen": ("Jánosfi Ronni", "Jánosfi"),
  "Éderson": ("Éderfióka", "Éderfióka"),
  "Dean Henderson": ("Henderffy Dénes", "Henderffy"),
  "Conny Karlsson": ("Károlyfi Konrád", "Károlyfi"),
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


MANUAL.update({
# ═══ A 29. KÖTEG DANISÍTÁSA — kézi nevek a hiányzó csúcsformák kereteihez ═══
# A köteg 40 új nevet hozott (Juventus 97/98, Liverpool 04/05, Chelsea 06/07,
# Inter 08/09, Ajax 86/87, Dortmund 20/21, Manchester City 10/11). Ezek a
# projektgazda kézi átiratai — a szabálymotor gépi alakja helyett.
#
# A RÖVID ALAK a VEZETÉKNÉV, akkor is, ha az több szóból áll („Karvaly Jó
# Dániel" → „Karvaly Jó" mintájára). Ahol a vezetéknévben kezdőbetű is van,
# a rövid alak elhagyja („Dínótál E. Antal" → „Dínótál"), KIVÉVE ha épp a
# kezdőbetű hordozza a poént.

# ── Liverpool 2004/05 — Isztambul ──────────────────────────────────────────
  "Jerzy Dudek":            ("Dudika Dzserzi", "Dudika"),
  "Sami Hyypiä":            ("Hippija Samu", "Hippija"),
  "Steve Finnan":           ("Finnyás Sztivi", "Finnyás"),
  "Djimi Traoré":           ("Trajoré Jim", "Trajoré"),
  "John Arne Riise":        ("Ríííze János", "Ríííze"),
  "Milan Baroš":            ("Balos Milán", "Balos"),
  "Djibril Cissé":          ("Szisszé Dzsibrill", "Szisszé"),
  "Harry Kewell":           ("Kjúúl Bálint", "Kjúúl"),
  # A Josemi EGYNEVŰ — a rövid alak ugyanaz, mint a teljes.
  "Josemi":                 ("Józsimi", "Józsimi"),

# ── Chelsea 2006/07 — Drogba 33 gólos idénye ───────────────────────────────
  "John Obi Mikel":         ("Mikell Obiból János", "Mikell Obiból"),
  # KÖTŐJELES VEZETÉKNÉV: a kötőjeles egész a vezetéknév (R4), tehát a rövid
  # alak is az marad — a gépi „Filjips János" a Wright felét egyszerűen
  # eldobta volna.
  "Shaun Wright-Phillips":  ("Vrájt-Filipszilonos János", "Vrájt-Filipszilonos"),
  "Khalid Boulahrouz":      ("Búlahrúz Bertalan", "Búlahrúz"),

# ── Juventus 1997/98 — Zidane és Inzaghi egy kártyán ───────────────────────
  "Mark Iuliano":           ("Júlianő Márk", "Júlianő"),
  "Alessandro Birindelli":  ("Birindelji Sándor", "Birindelji"),
  "Nicola Amoruso":         ("Ámorűző Miklós", "Ámorűző"),

# ── AFC Ajax 1986/87 — KEK, van Basten 31 góllal ───────────────────────────
  "Stanley Menzo":          ("Mendzó Levente", "Mendzó"),
  "Sonny Silooy":           ("Silúi Soma", "Silúi"),
  "Ronald Spelbos":         ("Spélbos Ronáld", "Spélbos"),
  "Jan Wouters":            ("Vúters János", "Vúters"),
  "Rob Witschge":           ("Vicsge Robi", "Vicsge"),
  # Az aposztróf a vezetéknév része marad (van 't Schip → Fan'csip).
  "John van 't Schip":      ("Fan\'csip János", "Fan\'csip"),
  # R2 — a név JELENT valamit: Bosman = „főnök-ember".
  "John Bosman":            ("Főnökember János", "Főnökember"),

# ── Borussia Dortmund 2020/21 — Haaland 41 gólja ───────────────────────────
  "Roman Bürki":            ("Bürkí Román", "Bürkí"),
  # A poén a kezdőbetűvel EGYÜTT áll össze („viccel az Axel"), ezért a rövid
  # alak itt csak a vezetéknév — az „A. Xszel" a keresztnév.
  "Axel Witsel":            ("Viccel A. Xszel", "Viccel"),
  "Thomas Delaney":         ("Deláni Tamás", "Deláni"),
  "Julian Brandt":          ("Brándt Gyula", "Brándt"),
  "Giovanni Reyna":         ("Rejna János", "Rejna"),
  "Jadon Sancho":           ("Száncsók Dzsédön", "Száncsók"),
  "Thorgan Hazard":         ("Házard Torgyán", "Házard"),

# ── Manchester City 2010/11 — Tévez gólkirályi idénye ──────────────────────
  # R2 — Hart = szív.
  "Joe Hart":               ("Szív Dzsó", "Szív"),
  "Micah Richards":         ("Ricsardsz Miká", "Ricsardsz"),
  # A teljes vezetéknév maga a poén („zabál e tán?"), ezért a rövid alak sem
  # vághatja le a kezdőbetűt — ugyanaz a kivétel, mint az „Albi Átiratás"-nál.
  "Pablo Zabaleta":         ("Zabál E. Tán Pabló", "Zabál E. Tán"),
  "Joleon Lescott":         ("Leszokott Dzsóleon", "Leszokott"),
  "Nigel de Jong":          ("Déjó N. G. Nájdzsel", "Déjó"),
  "Gareth Barry":           ("Barika Geret", "Barika"),
  "James Milner":           ("Mílner Jakab", "Mílner"),

# ── És két régi adós, akinek eddig csak gépi neve volt ─────────────────────
  "Vincent Kompany":        ("Koppány Vince", "Koppány"),
  # NYUGATOS SORREND: itt a keresztnév áll elöl (Jaja = Yaya), tehát a rövid
  # alak az UTOLSÓ tag — a kezdőbetűvel együtt, mert az a poén fele.
  "Yaya Touré":             ("Jaja Túr É.", "Túr É."),
})


MANUAL.update({
# ═══ A 30. KÖTEG DANISÍTÁSA — a hiányzó évtizedek nevei ═══════════════════
# A köteg 66 új nevet hozott (Milan 50/51, Blackpool 52/53, Feyenoord 69/70,
# Dinamo Kijev 74/75, Dánia 1992, Argentína 1978). Ezek a projektgazda kézi
# átiratai; a többi név a szabálymotoré maradt.

# ── Blackpool 1952/53 — a „Matthews-döntő" ─────────────────────────────────
  "Stanley Matthews":       ("Mettyúz Csongor", "Mettyúz"),
  "Stan Mortensen":         ("Mórtensffy Jenő", "Mórtensffy"),

# ── AC Milan 1950/51 — a Gre-No-Li ─────────────────────────────────────────
  # R2 — a név JELENT valamit: a svéd „gren" ág/zöld hangzására.
  "Gunnar Gren":            ("Ződ Gúnár", "Ződ"),
  # NYUGATOS SORREND: itt a keresztnév áll elöl, tehát a rövid alak az UTOLSÓ
  # tag — ugyanaz a szerkezet, mint a „Jaja Túr É."-nél.
  "Gunnar Nordahl":         ("Nórdal Gúnár", "Nórdal"),
  "Nils Liedholm":          ("Lídólm Miklós", "Lídólm"),

# ── Feyenoord 1969/70 — az első holland BEK ────────────────────────────────
  "Coen Moulijn":           ("Múlíjn Kohén", "Múlíjn"),
  "Ove Kindvall":           ("Kindvál Óve", "Kindvál"),

# ── Argentína 1978 VB ──────────────────────────────────────────────────────
  "Mario Kempes":           ("Kempesz Márió", "Kempesz"),
  "Daniel Passarella":      ("Faszerella Dániel", "Faszerella"),
  "Ubaldo Fillol":          ("Filioli Zsombor", "Filioli"),

# ── Dánia 1992 EB ──────────────────────────────────────────────────────────
  "Brian Laudrup":          ("Ládrupp Brián", "Ládrupp"),
})


MANUAL.update({
# ═══ A 31. KÖTEG DANISÍTÁSA ═══════════════════════════════════════════════
# A RÖVID ALAK a VEZETÉKNÉV, akkor is, ha két szóból áll (Hám Sík, Járd El,
# Kér Kéz, Pin-Tó) — ugyanaz a szabály, mint a „Karvaly Jó Dániel"-nél.

# ── Liverpool 2026/27 ──────────────────────────────────────────────────────
  "Kostas Tsimikas":        ("Cimikás Konstantin", "Cimikás"),
  # MAGYAR SORRENDŰ NÉV (magyar válogatott): a vezetéknév áll elöl.
  "Kerkez Milos":           ("Kér Kéz Milliós", "Kér Kéz"),
  "Giorgi Mamardashvili":   ("Mamár-Dasvili György", "Mamár-Dasvili"),
  "Ronald Araújo":          ("Áráúzsó Ronáld", "Áráúzsó"),

# ── Napoli 12/13 és 15/16 ──────────────────────────────────────────────────
  "Marek Hamšík":           ("Hám Sík Márk", "Hám Sík"),
  "Kalidou Koulibaly":      ("Kúlibali Kalidú", "Kúlibali"),
  # R2 — a név JELENT valamit: „dries" = szárít.
  "Dries Mertens":          ("Mertensz Megszárít", "Mertensz"),
  "José Callejón":          ("Kaljehón József", "Kaljehón"),

# ── Liverpool 2013/14 ──────────────────────────────────────────────────────
  "Daniel Sturridge":       ("Sztáridzs Dániel", "Sztáridzs"),
  "Simon Mignolet":         ("Minyolé Simon", "Minyolé"),

# ── Tottenham 2010/11 és West Ham 2005/06 ─────────────────────────────────
  "Rafael van der Vaart":   ("Fanderfing Rafael", "Fanderfing"),
  "Nigel Reo-Coker":        ("Rejó-Kokker Nájdzsel", "Rejó-Kokker"),

# ── Newcastle 1993/94 ──────────────────────────────────────────────────────
  "Pavel Srníček":          ("Szrnícsek Pál", "Szrnícsek"),

# ── Anglia 1996 EB ─────────────────────────────────────────────────────────
  "Tony Adams":             ("Ádamosi Tóni", "Ádamosi"),
  "Stuart Pearce":          ("Bírsz Sztyuárt", "Bírsz"),
  # R2 — Seaman = sea man = tengerész/tengerember.
  "David Seaman":           ("Tengerember Dávid", "Tengerember"),
  # R2 — Anderton = an-other-ton → „másik tonhal".
  "Darren Anderton":        ("Másiktonhal Dorián", "Másiktonhal"),

# ── Németország 1974 VB ────────────────────────────────────────────────────
  "Hans-Georg Schwarzenbeck": ("Svarcenbekk János-György", "Svarcenbekk"),
  "Wolfgang Overath":       ("Óverát Farkas", "Óverát"),
  "Bernd Hölzenbein":       ("Hölszenbájn Bernát", "Hölszenbájn"),

# ── Sporting CP 2002/03 ────────────────────────────────────────────────────
  "Mário Jardel":           ("Járd El Márió", "Járd El"),
  "Hugo Viana":             ("Vájáná Hugó", "Vájáná"),
  # A KÉT PINTO. A vezetéknevük SZÁNDÉKOSAN azonos — ők ketten tényleg
  # névrokonok. A rövid alak ezért ütközik, és épp ezért JÓ: az ütközés-feloldó
  # mindkettőt TELJES néven küldi ki, tehát a képernyőn sosem keverhetők össze.
  "João Manuel Pinto":      ("Pin-Tó János", "Pin-Tó"),
  "Ricardo Sá Pinto":       ("Pin-Tó SzaRikárd", "Pin-Tó"),
})


MANUAL.update({
# ═══ A 32. KÖTEG DANISÍTÁSA ═══════════════════════════════════════════════

# ── Barcelona 1951/52 — a Cinc Copes ──────────────────────────────────────
  # MAGYAR SORRENDŰ NÉV: a vezetéknév áll elöl.
  "Kubala László":          ("Q-Balla Lackó", "Q-Balla"),
  "Antoni Ramallets":       ("Rámajetsz Tóni", "Rámajetsz"),
  "Estanislau Basora":      ("Básora Szabolcs", "Básora"),
  "Gustau Biosca":          ("Blocska Gusztáv", "Blocska"),
  "Joan Segarra":           ("Szegárá Jóvan", "Szegárá"),

# ── Tottenham 1998/99 ──────────────────────────────────────────────────────
  # R2 — a név JELENT valamit: walker = gyalogos.
  "Ian Walker":             ("Gyalogos Ájen", "Gyalogos"),
  # R2 — armstrong = erős kar.
  "Chris Armstrong":        ("Erőskarú Krisztián", "Erőskarú"),
  "Colin Calderwood":       ("Kaldervúd Kóli", "Kaldervúd"),

# ── Dortmund 2008/09 ───────────────────────────────────────────────────────
  "Nuri Şahin":             ("Sanyin Núri", "Sanyin"),
  "Roman Weidenfeller":     ("Vájdenfeller Román", "Vájdenfeller"),

# ── Roma 2021/22 ───────────────────────────────────────────────────────────
  "Nicolò Zaniolo":         ("Zanyóló Nick", "Zanyóló"),
  "Tammy Abraham":          ("Ábraham Tomi", "Ábraham"),
  "Henrikh Mkhitaryan":     ("Mikitalján Henrik", "Mikitalján"),
  "Bryan Cristante":        ("Kristály Brájen", "Kristály"),
  "Roger Ibañez":           ("Ibányez Rodzser", "Ibányez"),
  "Sérgio Oliveira":        ("Oli-Vera Szerdzsó", "Oli-Vera"),

# ── Fenerbahçe 2021/22 ─────────────────────────────────────────────────────
  "Altay Bayındır":         ("Baj-Andi Altaj", "Baj-Andi"),
  "Marcel Tisserand":       ("Tisszerán Marcell", "Tisszerán"),
  "Nazım Sangaré":          ("Szanga-Ré Nacika", "Szanga-Ré"),

# ── Zenit 2014/15 ──────────────────────────────────────────────────────────
  # EGYNEVŰ: a rövid alak ugyanaz, mint a teljes.
  "Danny":                  ("Danika", "Danika"),
  "Domenico Criscito":      ("Krisszító Domonkos", "Krisszító"),
  "Nicolás Lombaerts":      ("Lombba-Erc Niki", "Lombba-Erc"),
  "Yuri Lodygin":           ("Lódi-Dzsin Jurika", "Lódi-Dzsin"),
})

# ═══════════════════════════════════════════════════════════════════════════
#  33. KÖR (3.9.87) — A GÉPI NEVEK FELÜLÍRÁSA
#
#  Nem új keret: a MEGLÉVŐ adatbázis olyan nevei, ahol a szabálymotor fonetikus
#  átírást adott, pedig ott ült egy magyar szó. A szabálymotor ezt nem is
#  láthatja — ő hangzást másol, nem jelentést keres. Ez a kör harminckét ilyet
#  vesz kézbe.
#
#  NÉGY ÜTKÖZÉST fel kellett oldani, mert a kért rövid alak MÁR FOGLALT volt.
#  A rövid alak az, amit a napló és a keretlista mutat — két „Fontos" a
#  képernyőn két különböző embert jelentene ugyanazzal a névvel. A poén
#  mindegyiknél megmarad, csak a szó ragozódik egyet.
# ═══════════════════════════════════════════════════════════════════════════
MANUAL.update({

# ── A név JELENT valamit ───────────────────────────────────────────────────
  # kehl → kehely
  "Sebastian Kehl":         ("Kehely Sebestyén", "Kehely"),
  # karembeu → karambol
  "Christian Karembeu":     ("Karambol Krisztián", "Karambol"),
  # candela = gyertya → kandalló
  "Vincent Candela":        ("Kandalló Vince", "Kandalló"),
  # cabrini → kabrió
  "Antonio Cabrini":        ("Kabrió Antal", "Kabrió"),
  # glik → glükóz
  "Kamil Glik":             ("Glükóz Kamill", "Glükóz"),
  # reuter → Rejtő (Jenő)
  "Stefan Reuter":          ("Rejtő István", "Rejtő"),
  # ÜTKÖZÉS FELOLDVA: a „Barátságos" már Baróti Lajosé („Barátságos Lali"),
  # ezért freund = barát → barátkozó.
  "Steffen Freund":         ("Barátkozó István", "Barátkozó"),
  # schwarz → svarcol, és a „bekk" a posztja is volt
  "Georg Schwarzenbeck":    ("Svarcol-Bekk György", "Svarcol-Bekk"),
  # fuchs = róka → fuxos
  "Christian Fuchs":        ("Fuxos Krisztián", "Fuxos"),
  # ranocchia = béka → rántotta
  "Andrea Ranocchia":       ("Rántotta András", "Rántotta"),

# ── Magyar szó a hangzás mögött ────────────────────────────────────────────
  "Neven Subotić":          ("Szubotics Nesztor", "Szubotics"),
  "Álvaro Morata":          ("Morotva Alvár", "Morotva"),
  "Lorenzo Pellegrini":     ("Pellengér Lőrinc", "Pellengér"),
  "Rick Karsdorp":          ("Kardos Richárd", "Kardos"),
  "Joe Gomez":              ("Gombos Jocó", "Gombos"),
  # ÜTKÖZÉS FELOLDVA: a „Fontos" már Just Fontaine-é („Fontos Jusztin").
  "José Fonte":             ("Fontoskodó József", "Fontoskodó"),
  "Fernando Couto":         ("Kutyó Nándor", "Kutyó"),
  "Iván Córdoba":           ("Kordbársony Iván", "Kordbársony"),
  # ÜTKÖZÉS FELOLDVA: a „Matyó" már Lothar Matthäusé („Matyó Lotár").
  "Jérémy Mathieu":         ("Matyóka Jeremiás", "Matyóka"),
  "Teddy Sheringham":       ("Sör-Innám Tivadar", "Sör-Innám"),
  "Paolo Di Canio":         ("Dikánya Pál", "Dikánya"),
  "Sulley Muntari":         ("Munt-Aranyos Szüli", "Munt-Aranyos"),
  "Branislav Ivanović":     ("Iványi Branyiszló", "Iványi"),
  # ÜTKÖZÉS FELOLDVA: a „Subás" már Luis Suárezé („Subás Lajos").
  "Danijel Subašić":        ("Subások Dániel", "Subások"),
  # young = fiatal, és az „ifj." rá is tesz egy lapáttal. A rövid alak VISZI
  # az „ifj."-t, ahogy minden más ilyen sor (lásd „ifj. Brusz", „ifj. Fontos").
  "Ashley Young":           ("ifj. Fiatal Áron", "ifj. Fiatal"),
  # small = kicsi
  "Chris Smalling":         ("Kicsiző Krisztián", "Kicsiző"),
  "Alessio Tacchinardi":    ("Tacskónárdi Elek", "Tacskónárdi"),
  "Corentin Tolisso":       ("Tolató Kornél", "Tolató"),
  "Lionel Scaloni":         ("Skálázó Leó", "Skálázó"),
  "Nwankwo Kanu":           ("Kenu Van Q", "Kenu"),

# ── EGYNEVŰEK: a rövid alak ugyanaz, mint a teljes ─────────────────────────
  "Willian":                ("Villám", "Villám"),
  "Costinha":               ("Kosztinnya", "Kosztinnya"),
})

# ══ 33. KÖTEG — a motorjavítás UTÁN maradt nyolc név (3.9.114) ═════════════
# A 3.9.113 tíz motorszabálya 412 nevet hozott helyre; a huszonhét
# legláthatóbb közül tizenkilencre a felhasználó rábólintott, nyolcat pedig
# kézbe vett. Ezek innentől NEM a szabálymotorból jönnek: a poén (és a
# „Q. P.") olyan döntés, amit egy fonetikai szabály sosem hozna meg.
MANUAL.update({
  # A német W ejtése v, a tz pedig c — a gépi „Firk" hangzásban is,
  # jelentésben is melléfogott, ráadásul ÉLŐ sztárról van szó.
  "Florian Wirtz":          ("Virc Flóri", "Virc"),
  # A motor „Mekleis"-t hozott; a skót „ei" itt hosszú í.
  "Alex McLeish":           ("Meklís Sanyi", "Meklís"),
  # A „gli" = lj szabály technikailag jó volt (Paljuka), de a NÉV kínálta a
  # szétvágást. A kétszavas rövid alak nem újdonság: lásd Kerkez Milos
  # („Kér Kéz Milliós" / „Kér Kéz") és Iniesta („Ínyenc Pista").
  "Gianluca Pagliuca":      ("Pali Lyuka Lukács", "Pali Lyuka"),
  # A gépi „Korso" magyarul „korsó"-nak olvasódott; a Korzózó ugyanazt a
  # szótagot viszi tovább, csak szándékosan.
  "Mario Corso":            ("Korzózó Márijó", "Korzózó"),
  # A spanyol -ay = -áj szabály „Garáj"-t adott volna; a Garai valódi magyar
  # vezetéknév, és ugyanúgy szól.
  "Ezequiel Garay":         ("Garai Ezékiel", "Garai"),
  # Betűnév — a Coupet kiejtése (kú-pé) magyarul két betű neve.
  "Grégory Coupet":         ("Q. P. Gergely", "Q. P."),
  # A RÖVID ALAK IT A TELJES NÉV, mert a poén a két szó EGYÜTT (ahogy a
  # „Ronáldó Krisztián" és a „Názári Ronáldó" sem vágható félbe).
  "Radja Nainggolan":       ("Ragyás Nyálgollam", "Ragyás Nyálgollam"),
  # Ugyanaz: a vicc a szóhatár elcsúsztatása (Dwight Yorke → Dwáj Tyork),
  # tehát félbevágva nincs értelme.
  "Dwight Yorke":           ("Dwáj Tyork", "Dwáj Tyork"),
})

# ══ 34. KÖTEG — VÉDŐBLOKK: a jóváhagyott tizenkilenc (3.9.115) ═════════════
# EZ A BLOKK NEM VÁLTOZTAT SEMMIT. Betűre azt rögzíti, amit a 3.9.113
# szabálymotorja MA is ad — a felhasználó ezt a tizenkilenc nevet nézte át és
# hagyta jóvá.
#
# MIÉRT KELL MÉGIS. Pontosan ez a hibaosztály esett meg a `bf84bde`-vel: 240
# kézi javítás élt a gépi rétegen, és egy motorfrissítés némán elmozdította
# volna őket — utólag kellett védőblokkal megmenteni (lásd
# docs/nevek-danisitasa-minta.md §0). Egy jóváhagyott név innentől DÖNTÉS,
# nem a szabályok mellékterméke: ha holnap finomodik az olasz `ci` vagy a
# holland `g`, ezek a sorok akkor is állnak.
#
# ÚJ MOTORSZABÁLY ÍRÁSAKOR tehát ezek a nevek NEM fognak javulni maguktól —
# ha egy szabály miatt itt is változtatni kell, ezt a blokkot kell átírni.
MANUAL.update({
  "Geoff Hurst":            ("Hurszt Dzsef", "Hurszt"),
  "Billy McNeill":          ("Mekneil Vili", "Mekneil"),
  "Ally McCoist":           ("Mekkoiszt Alika", "Mekkoiszt"),
  # A felhasználó ezt így hagyta jóvá. A motor szerint az olasz `ci`
  # mássalhangzó előtt is „csi" volna (Bacsigalúpó) — a döntés az övé.
  "Valerio Bacigalupo":     ("Baszigalupo Gergő", "Baszigalupo"),
  "Robert Jonquet":         ("Zsonket Róbert", "Zsonket"),
  "Zbigniew Boniek":        ("Bonik Barnabás", "Bonik"),
  "Siniša Mihajlović":      ("Mihajlics Pongrác", "Mihajlics"),
  "Miodrag Belodedici":     ("Belodediszi Mikó", "Belodediszi"),
  "Éder Militão":           ("Mílitao Ede", "Mílitao"),
  "Francisco Sá":           ("Szá Ferenc", "Szá"),
  "Emerson Ferreira":       ("Férreira Imre", "Férreira"),
  "Wim van Hanegem":        ("Fanhanehem Vilmos", "Fanhanehem"),
  "Hans van Breukelen":     ("Fanbrökelen János", "Fanbrökelen"),
  "Piet Keizer":            ("Kájzer Péter", "Kájzer"),
  "Rudi Völler":            ("Föler Rudi", "Föler"),
  "Willie Miller":          ("Miler Vili", "Miler"),
  "Vincenzo Montella":      ("Montela Vince", "Montela"),
  "Virgilio Maroso":        ("Marozo Máté", "Marozo"),
  "Andy Cole":              ("Kol Bandi", "Kol"),
})

# ══ 35. KÖTEG — a második adag kézbe vett neve (3.9.117) ═══════════════════
# A 3.9.116 utáni mérés harminc gépi nevet tett a felhasználó elé; ebből
# tizenhetet írt át. A javítások fele PONTOSAN az, amit a még be nem épített
# motorszabályok is adnának (Snájder, Sulc, Nyúnyez, Sinyóri, Zágorakisz,
# Manolász, Pítörsz) — a másik fele viszont poén, amit szabály sosem hozna.
MANUAL.update({
  # ── AMIT EGY SZABÁLY IS MEGADNA (de itt már döntés) ──────────────────────
  # A német ß = ssz. A motor „Haskler"-t adott: a PRE ß → „sz"-t ír, a német
  # ág `z → c`-je pedig belemart — ugyanaz a sorrend-csapda, mint a
  # Rodríguessz-nél.
  "Thomas Häßler":          ("Hesszler Tamás", "Hesszler"),
  # A `sch` sosem jutott el a saját szabályáig: a ch-blokk hamarabb fut.
  "Bernd Schneider":        ("Snájder Bernát", "Snájder"),
  "Christian Schulz":       ("Sulc Krisztián", "Sulc"),
  # A PRE `ñ → ny`-t ír, az y-szabály pedig nj-vé vágja (Núnjesz, Sinjori).
  "Darwin Núñez":           ("Nyúnyez Kelemen", "Nyúnyez"),
  "Giuseppe Signori":       ("Sinyóri József", "Sinyóri"),
  # A görög nevek MIND -s-re végződnek, és a magyar „s" a sh hangot jelöli.
  "Theodoros Zagorakis":    ("Zágorakisz Teó", "Zágorakisz"),
  "Kostas Manolas":         ("Manolász Kostás", "Manolász"),
  # Angol szóvégi -s, ugyanez.
  "Martin Peters":          ("Pítörsz Márton", "Pítörsz"),
  # A skandináv s is sz — a „-son = fia" poén (ffy) megmarad fölötte.
  "Torbjörn Nilsson":       ("Nílszffy Szabolcs", "Nílszffy"),
  # A holland „aa" hosszú á; az általános `ay → éj` itt félrement.
  "Roy Makaay":             ("Makáj Roj", "Makáj"),
  # ── A -ović: visszakerül a kiesett „ov" ──────────────────────────────────
  # A motor `ovi[cć]$ → ics` szabálya a TŐBŐL is levágott: a Jovićból „Jics"
  # maradt, három betű.
  "Luka Jović":             ("Jovics Lukács", "Jovics"),
  "Dejan Stanković":        ("Sztankovics Deján", "Sztankovics"),
  # ── POÉN: amit szabály sosem hozna ───────────────────────────────────────
  "Harald Schumacher":      ("Sumákoló Herold", "Sumákoló"),
  "Jack Grealish":          ("Girhes Jakab", "Girhes"),
  # Kétszavas rövid alak, mint a „Kér Kéz" (Kerkez) és a „Pali Lyuka".
  "Pablo Ibáñez":           ("Ibán Yessz Pál", "Ibán Yessz"),
  "Pietro Anastasi":        ("Ananász Tázi Péter", "Ananász Tázi"),
  # A keresztnév a becenévből: Mimis → Mimi.
  "Mimis Domazos":          ("Dómazos Mimi", "Dómazos"),
})

# ══ 36. KÖTEG — a -ović párja (3.9.119) ═══════════════════════════════════
# A 3.9.118 motorszabálya visszaadta a kiesett „ov"-ot (Jugics → Jugovics),
# a szerb szókezdő „st" viszont továbbra is magyar „s" (sht) marad: a
# Stojkovics „Shtojkovics"-nak olvasódik. A szláv `s + mássalhangzó → sz`
# szabály még nincs a motorban, ezért ez a kettő kézi — a felhasználó
# kifejezetten így kérte.
MANUAL.update({
  "Vladimir Jugović":       ("Jugovics Vladi", "Jugovics"),
  "Dragan Stojković":       ("Sztojkovics Pongrác", "Sztojkovics"),
})

# ══ 37. KÖTEG — négy kiejtési rés, méréssel megtalálva (3.9.129) ═══════════
# A mérés az ÉLŐ HU_NAME_TABLE-ön futott (nem a poros table.json-on), és négy
# nyitott szabályt mutatott meg. Mindegyiknél kevés a találat, ezért a kézi
# réteg az olcsóbb és biztosabb út — a motorba nyúlni értük több kockázat
# lenne, mint haszon.
#
#   1. NÉMET: két magánhangzó közti `s` = z (Kruse → Krúze). Öt név.
#   2. SVÁJCI-FRANCIA, németnek nézve: a Chapuisat nem német, hanem francia
#      kiejtésű — a nemzetiség szerinti nyelvválasztás itt egyszerűen téved.
#   3. FRANCIA `ai` = e, nem „áj" (Vairelles → Verell). Három név. Az `af`
#      (maghrebi/afrikai, francia HELYESÍRÁSSAL) nevek helyesen maradnak
#      „aj"-osak — ott az `ai` tényleg két hang.
#   4. MAGHREBI `s` = sz: a Saihi francia helyesírású, tehát az `S` nem „s".
#
# A KERESZTNEVEK a gépi kiosztásból maradnak — csak a vezetéknév változik.
MANUAL.update({
  # ── 1. német: magánhangzók közti s = z ───────────────────────────────────
  "Max Kruse":              ("Krúze Ákos", "Krúze"),
  "Tim Wiese":              ("Víze Timót", "Víze"),
  "Robin Gosens":           ("Gózensz Robi", "Gózensz"),
  "Kay Voser":              ("Fószer Gyárfás", "Fószer"),
  "Franz Hasil":            ("Házil Ferenc", "Házil"),
  # ── 2. svájci-francia, nem német ─────────────────────────────────────────
  "Stéphane Chapuisat":     ("Sapüizá István", "Sapüizá"),
  # ── 3. francia ai = e ────────────────────────────────────────────────────
  "Tony Vairelles":         ("Verell Tóni", "Verell"),
  "Pierre Laigle":          ("Legöl Péter", "Legöl"),
  "Flavien Tait":           ("Té Zétény", "Té"),
  # ── 4. maghrebi: a francia helyesírás s-e = sz ───────────────────────────
  "Jamel Saihi":            ("Szájhi Csongor", "Szájhi"),
})


# ══ 36. KÖTEG — minden eddigi, jóváhagyott javaslat (3.9.147) ═══════════════
# A felhasználó: „Minden névjavaslatod jó. Elfogadom az összes eddigit."
# Öt csoport: a legutóbbi kör, a kiejtési körök, a Hiúz-kör, és az angol
# „a" hang szerinti átírás (a korábban 64-esnek becsült csomag, szemenként
# átnézve: a szándékos magyarosító szójátékok — Vatffy, Lavrenfi, Karfia,
# Pírfi — és a nem angol eredetű vezetéknevek — Lallana, Zamora, Tarkowski,
# Salako, Cremaschi — kimaradtak). A keresztnév a gépi kiosztásból marad.
MANUAL.update({
  # ── A mostani kör (3.9.146 utáni javaslatok) ──
  "Oliver Kahn": ("Kánya Olivér", "Kánya"),  # Kán Olivér
  "Xavi": ("Csávó", "Csávó"),  # Csávi
  "Pavel Nedvěd": ("Páva Nedves", "Nedves"),  # Páva Nedv
  "Kevin Gameiro": ("Gémeskút Kelemen", "Gémeskút"),  # Gámeiro Kelemen
  "Aldo Serena": ("Szerény Aladár", "Szerény"),  # Sérena Aladár
  "Peter Dobing": ("Dobogó Péter", "Dobogó"),  # Dóbing Péter
  "Marcel Halstenberg": ("Halsütő Marcell", "Halsütő"),  # Hálstenberg Marcell
  "Renaud Ripart": ("Ripacs Salamon", "Ripacs"),  # Rípart Salamon
  "André Pinto": ("Pinty András", "Pinty"),  # Pínto András
  "Bruno Ecuele Manga": ("Mangó Brunó", "Mangó"),  # Mánga Brunó
  # ── Kiejtés: Dabrowski, Trochowski, Moulijn, van Duijnhoven ──
  "Christoph Dabrowski": ("Dabrovszki Kristóf", "Dabrovszki"),  # Dobrovszki Kristóf
  "Piotr Trochowski": ("Trohovszki Péter", "Trohovszki"),  # Trocsovszki Péter
  "Coen Moulijn": ("Múlejn Kohén", "Múlejn"),  # Múlíjn Kohén
  "Rein van Duijnhoven": ("Fandöjnhofen Zétény", "Fandöjnhofen"),  # Fandöjjnhofen Zétény
  # ── Névrokonok egységesítése és kiejtés (Hőnyes-kör) ──
  "Dieter Hoeneß": ("Hőnyes Detre", "Hőnyes"),  # Hoenesz Detre
  "Jaime Magalhães": ("Magaláj Jakab", "Magaláj"),  # Magalyaes Jakab
  "Ludo Coeck": ("Kukk Vajk", "Kukk"),  # Koekk Vajk
  "Paul Jaeckel": ("Jekkel Pál", "Jekkel"),  # Jaekkel Pál
  "Markel Susaeta": ("Szuszaeta Bertalan", "Szuszaeta"),  # Szusaeta Bertalan
  "Daler Kuzyaev": ("Kuzjajev Boldizsár", "Kuzjajev"),  # Kuzjaev Boldizsár
  # ── Hiúz-kör: névrokonok és holland/baszk/angol kiejtés ──
  "Aaron Hughes": ("Hiúz Áron", "Hiúz"),  # Hugesz Áron
  "John Hughes": ("Hiúz János", "Hiúz"),  # Hugesz János
  "Ken McNaught": ("Meknót Kende", "Meknót"),  # Meknaugt Kende
  "Christian Synaeghel": ("Színágel Krisztián", "Színágel"),  # Sinaezsel Krisztián
  "Paul Verhaegh": ("Ferhách Pál", "Ferhách"),  # Ferhaeh Pál
  "Andoni Goikoetxea": ("Gojkoecsea Antal", "Gojkoecsea"),  # Goikoecsí Antal
  "Leo Clijsters": ("Klejszters Leó", "Klejszters"),  # Klijsters Leó
  "Dean Huijsen": ("Höjszen Dénes", "Höjszen"),  # Uihsen Dénes
  "Jan-Arie van der Heijden": ("Fanderhejden János", "Fanderhejden"),  # Fanderheájden János
  "Piet Romeijn": ("Romejn Péter", "Romejn"),  # Romeájn Péter
  # ── Angol „a”: /æ/ és hangsúlytalan /ə/ → e, /ɑː/ → á, /ɔː/ → ó, /eɪ/ → éj ──
  "Andy Goram": ("Górem Bandi", "Górem"),  # Góram Bandi
  "Gordon Strachan": ("Sztrahen Gordián", "Sztrahen"),  # Sztracsan Gordián
  "John Wark": ("Vók János", "Vók"),  # Vark János
  "Laurie Cunningham": ("Kanningem Kálmán", "Kanningem"),  # Kunningam Kálmán
  "Ronnie Whelan": ("Vílen Roni", "Vílen"),  # Velan Roni
  "David Platt": ("Plett Dávid", "Plett"),  # Plátt Dávid
  "Jack Butland": ("Batlend Jakab", "Batlend"),  # Bútland Jakab
  "Gordon Cowans": ("Kauensz Gordián", "Kauensz"),  # Kovansz Gordián
  "Alan Durban": ("Dörben Alán", "Dörben"),  # Dörban Alán
  "Alan Kernaghan": ("Körnehen Alán", "Körnehen"),  # Kernagan Alán
  "Alan Pardew": ("Párdjú Alán", "Párdjú"),  # Pardev Alán
  "Allan Clarke": ("Klárk Alán", "Klárk"),  # Klark Alán
  "John Clark": ("Klárk János", "Klárk"),  # Klark János
  "Lee Clark": ("Klárk Kelemen", "Klárk"),  # Klark Kelemen
  "Anton Ferdinand": ("Fördinend Antal", "Fördinend"),  # Férdinand Antal
  "Ashley Barnes": ("Bárnsz Esli", "Bárnsz"),  # Barnesz Esli
  "Harvey Barnes": ("Bárnsz Dezső", "Bárnsz"),  # Barnesz Dezső
  "Ashley Williams": ("Viljemsz Esli", "Viljemsz"),  # Viliamsz Esli
  "Gary Williams": ("Viljemsz Geri", "Viljemsz"),  # Viliamsz Geri
  "Ben Davies": ("Déjvisz Bence", "Déjvisz"),  # Davisz Bence
  "Kevin Davies": ("Déjvisz Kelemen", "Déjvisz"),  # Davisz Kelemen
  "Tom Davies": ("Déjvisz Tomi", "Déjvisz"),  # Davisz Tomi
  "Sean Davis": ("Déjvisz János", "Déjvisz"),  # Davisz János
  "Steven Davis": ("Déjvisz István", "Déjvisz"),  # Davisz István
  "Billy Sharp": ("Sárp Vili", "Sárp"),  # Sarp Vili
  "Lee Sharpe": ("Sárp Benedek", "Sárp"),  # Sarp Benedek
  "Callum McManaman": ("Mekmenemen Kálmán", "Mekmenemen"),  # Mekmanaman Kálmán
  "Steve McManaman": ("Mekmenemen Pista", "Mekmenemen"),  # Mekmanaman Pista
  "Carlton Palmer": ("Pámer Ince", "Pámer"),  # Pálmer Ince
  "Charlie Gallagher": ("Geleher Karcsi", "Geleher"),  # Galager Karcsi
  "Chris Basham": ("Besem Krisztián", "Besem"),  # Basam Krisztián
  "Danny Drinkwater": ("Drinkvótör Dani", "Drinkvótör"),  # Drinkvater Dani
  "Danny Gabbidon": ("Gebiden Dani", "Gebiden"),  # Gábbidon Dani
  "Dave Beasant": ("Bízent Dávid", "Bízent"),  # Bísant Dávid
  "Dave Thomas": ("Tomesz Dávid", "Tomesz"),  # Tomasz Dávid
  "Geoff Thomas": ("Tomesz Dzsef", "Tomesz"),  # Tomasz Dzsef
  "Mitchell Thomas": ("Tomesz Mihály", "Tomesz"),  # Tomasz Mihály
  "David Batty": ("Betti Dávid", "Betti"),  # Batti Dávid
  "David Harvey": ("Hárvi Dávid", "Hárvi"),  # Harvi Dávid
  "David James": ("Dzséjmsz Dávid", "Dzséjmsz"),  # Dzsamesz Dávid
  "David Needham": ("Nídem Dávid", "Nídem"),  # Nídham Dávid
  "David Sadler": ("Szedler Dávid", "Szedler"),  # Sádler Dávid
  "Dean Ashton": ("Esten Dénes", "Esten"),  # Aston Dénes
  "Derek Statham": ("Sztéjtem Ödön", "Sztéjtem"),  # Sztatam Ödön
  "Eric Black": ("Blekk Erik", "Blekk"),  # Blakk Erik
  "Eric Gates": ("Géjtsz Erik", "Géjtsz"),  # Gatesz Erik
  "Gary Cahill": ("Kéjhil Geri", "Kéjhil"),  # Kahil Geri
  "Gary Caldwell": ("Kóldvel Geri", "Kóldvel"),  # Kaldvel Geri
  "Gary Mabbutt": ("Mebet Geri", "Mebet"),  # Mábbutt Geri
  "Gary Pallister": ("Pelisztör Geri", "Pelisztör"),  # Paliszter Geri
  "Gary Shaw": ("Só Geri", "Só"),  # Sav Geri
  "George Eastham": ("Ísztem György", "Ísztem"),  # Ísztam György
  "Gerry Francis": ("Fránszisz Aurél", "Fránszisz"),  # Franszisz Aurél
  "Trevor Francis": ("Fránszisz Töhötöm", "Fránszisz"),  # Franszisz Töhötöm
  "Graeme Le Saux": ("Löszó Gerő", "Löszó"),  # Lesauksz Gerő
  "Ian Durrant": ("Darent János", "Darent"),  # Dörrant János
  "Ian Gillard": ("Gilárd János", "Gilárd"),  # Gilard János
  "Jackie Marsh": ("Márs Csanád", "Márs"),  # Mars Csanád
  "Jamaal Lascelles": ("Leszelsz Csanád", "Leszelsz"),  # Lasszelesz Csanád
  "James McCarthy": ("Mekárti Jakab", "Mekárti"),  # Mekkarti Jakab
  "Jim Standen": ("Sztenden Jaki", "Sztenden"),  # Sztanden Jaki
  "Jimmy Ryan": ("Rájen Jaki", "Rájen"),  # Rjan Jaki
  "Joe Allen": ("Elen Jocó", "Elen"),  # Alen Jocó
  "Malcolm Allen": ("Elen Boldizsár", "Elen"),  # Alen Boldizsár
  "Paul Allen": ("Elen Pál", "Elen"),  # Alen Pál
  "Joe Jordan": ("Dzsórden Jocó", "Dzsórden"),  # Dzsordan Jocó
  "John Aston": ("Eszten János", "Eszten"),  # Aszton János
  "John Egan": ("Ígen János", "Ígen"),  # Égan János
  "John Fallon": ("Felen János", "Felen"),  # Falon János
  "John Fashanu": ("Fesenú János", "Fesenú"),  # Fasanu János
  "John Lundstram": ("Landsztrem János", "Landsztrem"),  # Lundsztram János
  "John Mahoney": ("Máheni János", "Máheni"),  # Mahoni János
  "John McMaster": ("Mekmásztör János", "Mekmásztör"),  # Mekmaszter János
  "John Sheridan": ("Seriden János", "Seriden"),  # Seridan János
  "Jon Flanagan": ("Flenegen János", "Flenegen"),  # Flánagan János
  "Kevin Nolan": ("Nólen Kelemen", "Nólen"),  # Nólan Kelemen
  "Kevin O'Callaghan": ("O'kelehen Kelemen", "O'kelehen"),  # O'kalagan Kelemen
  "Lee Cattermole": ("Kettermól Vazul", "Kettermól"),  # Kattermól Vazul
  "Len Cantello": ("Kentelló Gedeon", "Kentelló"),  # Kantelo Gedeon
  "Lloyd McGrath": ("Mekgrá Bertalan", "Mekgrá"),  # Mekgrat Bertalan
  "Marc Albrighton": ("Ólbrájten Márk", "Ólbrájten"),  # Albrájton Márk
  "Mark Atkins": ("Etkinsz Márk", "Etkinsz"),  # Atkinsz Márk
  "Mark Hateley": ("Héjtli Márk", "Héjtli"),  # Hateli Márk
  "Marlon Harewood": ("Hérvúd Elemér", "Hérvúd"),  # Harevúd Elemér
  "Matt Holland": ("Holend Zsigmond", "Holend"),  # Holand Zsigmond
  "Mike Bernard": ("Börnerd Miska", "Börnerd"),  # Bérnard Miska
  "Owen Hargreaves": ("Hárgrívsz Huba", "Hárgrívsz"),  # Hargrívesz Huba
  "Pat Crerand": ("Krerend Patrik", "Krerend"),  # Krerand Patrik
  "Paul Bracewell": ("Bréjszvel Pál", "Bréjszvel"),  # Braszevel Pál
  "Paul Lambert": ("Lembert Pál", "Lembert"),  # Lámbert Pál
  "Paul Madeley": ("Méjdli Pál", "Méjdli"),  # Madeli Pál
  "Paul Stewart": ("Sztjúert Pál", "Sztjúert"),  # Sztevart Pál
  "Paul Walsh": ("Vóls Pál", "Vóls"),  # Vals Pál
  "Paul Warhurst": ("Vóhörszt Pál", "Vóhörszt"),  # Varhörszt Pál
  "Peter Brabrook": ("Bréjbrúk Péter", "Bréjbrúk"),  # Brabrúk Péter
  "Phil Jagielka": ("Dzsegelka Fülöp", "Dzsegelka"),  # Dzsagilka Fülöp
  "Phil Parkes": ("Párksz Fülöp", "Párksz"),  # Parkesz Fülöp
  "Ray Parlour": ("Párlör Vajk", "Párlör"),  # Parlúr Vajk
  "Rob Newman": ("Nyúmen Robi", "Nyúmen"),  # Nevman Robi
  "Robbie Brady": ("Bréjdi Robika", "Bréjdi"),  # Bradi Robika
  "Roy McFarland": ("Mekfárlend Roj", "Mekfárlend"),  # Mekfarland Roj
  "Russell Osman": ("Ozmen Nándor", "Ozmen"),  # Oszman Nándor
  "Ryan Bertrand": ("Börtrend Rájen", "Börtrend"),  # Bértrand Rájen
  "Ryan Shawcross": ("Sókrossz Rájen", "Sókrossz"),  # Savkrossz Rájen
  "Ryan Yates": ("Jéjtsz Rájen", "Jéjtsz"),  # Jatesz Rájen
  "Scott Sellars": ("Szelersz Skót", "Szelersz"),  # Selarsz Skót
  "Seamus Coleman": ("Kólmen Pongrác", "Kólmen"),  # Koleman Pongrác
  "Sean Haslegrave": ("Héjzelgréjv János", "Héjzelgréjv"),  # Haszlegréjv János
  "Sean Longstaff": ("Longsztáf János", "Longsztáf"),  # Longsztaff János
  "Shaun Maloney": ("Melóni János", "Melóni"),  # Maloni János
  "Solly March": ("Márcs Ince", "Márcs"),  # Marcs Ince
  "Stephen Carr": ("Kár István", "Kár"),  # Karr István
  "Stephen Ward": ("Vód István", "Vód"),  # Vard István
  "Steve Lomas": ("Lómesz Pista", "Lómesz"),  # Lomasz Pista
  "Steve McCall": ("Mekól Pista", "Mekól"),  # Mekkal Pista
  "Stuart McCall": ("Mekól Sztuart", "Mekól"),  # Mekkal Sztuart
  "Stevie Chalmers": ("Csámersz Tihamér", "Csámersz"),  # Csalmersz Tihamér
  "Stuart Parnaby": ("Párnebi Sztuart", "Párnebi"),  # Parnabi Sztuart
  "Terry Phelan": ("Fílen Tihamér", "Fílen"),  # Felan Tihamér
  "Terry Yorath": ("Jóret Tihamér", "Jóret"),  # Jorat Tihamér
  "Theo Walcott": ("Vólket Tivadar", "Vólket"),  # Valkott Tivadar
  "Timmy Chandler": ("Csendler Timkó", "Csendler"),  # Csandler Timkó
  "Tommy Garrett": ("Geret Tomi", "Geret"),  # Gárrett Tomi
  "Vinny Samways": ("Szemvéjsz Boldizsár", "Szemvéjsz"),  # Samvéjsz Boldizsár
  "Warren Barton": ("Bárten Kelemen", "Bárten"),  # Bárton Kelemen
  "Willie Wallace": ("Volisz Vili", "Volisz"),  # Valéjsz Vili
  "Conor Bradley": ("Bredli Töhötöm", "Bredli"),  # Bradli Töhötöm
  "Allan Evans": ("Evensz Alán", "Evensz"),  # Evansz Alán
  "Jonny Evans": ("Evensz Tihamér", "Evensz"),  # Evansz Tihamér
  "Bertie Auld": ("Óld Ábris", "Óld"),  # Áuld Ábris
  "Drake Callender": ("Kelender Mór", "Kelender"),  # Kalender Mór
})
