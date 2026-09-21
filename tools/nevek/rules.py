# -*- coding: utf-8 -*-
"""Szabálymotor a nem felismerhető nevekre.

A 60 kézi mintából kinyert két szabály:
  1. a vezetéknevet magyar helyesírás szerint FONETIKUSAN írjuk le,
  2. a keresztnevet magyar keresztnévre cseréljük, és MAGYAR SORREND lesz
     (vezetéknév elöl) — így a rövid alak mindig az első szó.

A kiejtés NYELVFÜGGŐ: a „ch" a németben cs, az olaszban k, a franciában s.
Ezért a nemzetiséget is megkapjuk — a DB minden játékosnál tárolja.

KÖVETELMÉNY: a kimenet SOSEM lehet azonos a bemenettel. Egy változatlanul
hagyott név pontosan azt bukná el, amiért az egész átírás készül.
"""
import re, unicodedata

# ── nemzetiség → kiejtési nyelv ─────────────────────────────────────────────
LANG = {
 "Anglia":"en","Skócia":"en","Wales":"en","Írország":"en","Észak-Írország":"en",
 "USA":"en","Egyesült Államok":"en","Ausztrália":"en","Kanada":"en","Jamaica":"en",
 "Spanyolország":"es","Argentína":"es","Uruguay":"es","Mexikó":"es","Chile":"es",
 "Kolumbia":"es","Peru":"es","Paraguay":"es","Ecuador":"es","Venezuela":"es",
 "Bolívia":"es","Costa Rica":"es","Honduras":"es","Kuba":"es",
 "Brazília":"pt","Portugália":"pt","Angola":"pt","Zöld-foki Köztársaság":"pt",
 "Olaszország":"it","Svájc":"de","Németország":"de","Ausztria":"de",
 "Franciaország":"fr","Hollandia":"nl","Suriname":"nl",
 # BELGIUM SZÁNDÉKOSAN NEM „nl" (3.9.113). Az ország kétnyelvű: a névsor
 # nagyjából fele francia ajkú (Gillet, Chevalier), a másik fele flamand.
 # Amíg a nemzetiség az egyetlen fogódzónk, az ERŐS holland szabályokat
 # (g → h, v → f) nem szabad ráengedni — Gillet-ből „Hillet" lenne. A „be"
 # kód ezért ágat nem kap: betűre az marad, ami ma van.
 "Belgium":"be",
 "Lengyelország":"pl","Csehország":"sl","Szlovákia":"sl","Oroszország":"sl",
 "Ukrajna":"sl","Horvátország":"sl","Szerbia":"sl","Bosznia-Hercegovina":"sl",
 "Szlovénia":"sl","Montenegró":"sl","Észak-Macedónia":"sl","Bulgária":"sl",
 "Fehéroroszország":"sl","Törökország":"tr","Görögország":"gr",
 "Svédország":"sc","Norvégia":"sc","Dánia":"sc","Izland":"sc","Finnország":"sc",
 "Magyarország":"hu","Románia":"ro",
 # ── AMI EDDIG KIMARADT (3.9.120) ──────────────────────────────────────────
 # 53 nemzetiség hiányzott a térképből, összesen 292 néven — és a hiányzó
 # bejegyzés nem „semleges": a `lang_of` ilyenkor "en"-t ad, tehát a japán,
 # a szovjet és a nyugat-afrikai nevek mind ANGOL kiejtést kaptak. Amíg az
 # angol ág csak ékezetet tett, ez néma maradt; a 3.9.119 `s$ → sz`-e és az
 # alábbi `j → dzs` viszont már aktívan rontana rajtuk. Ezért ez a blokk a
 # mostani köteg ELSŐ lépése, nem a ráadása.
 #
 # A besorolás a NÉVÍRÁS hagyományát követi, nem a földrajzot: a frankofón
 # Afrika nevei francia helyesírással érkeznek (Drogba, Keïta, Eto'o), az
 # angolofón Afrikáé angollal (Okocha, Essien).
 "Szovjetunió":"sl","Grúzia":"sl","Örményország":"sl","Litvánia":"sl",
 "Lettország":"sl","Szerbia és Montenegró":"sl","Bosznia":"sl",
 "Albánia":"sl","Koszovó":"sl","Észtország":"sc",
 "Japán":"jp",
 # „af" = francia HELYESÍRÁS, de teljes kiejtés (nincs néma szóvég) — lásd
 # a hufy fr/af ágát. A Maghreb és a frankofón Afrika ide tartozik.
 "Elefántcsontpart":"af","Szenegál":"af","Kamerun":"af","Marokkó":"af",
 "Mali":"af","Algéria":"af","Tunézia":"af","Guinea":"af","Kongói DK":"af",
 "Gabon":"af","Burkina Faso":"af","Csád":"af","Togo":"af","Benin":"af",
 "Madagaszkár":"af","Ruanda":"af","Közép-afrikai Köztársaság":"af",
 "Nigéria":"en","Ghána":"en","Dél-Afrika":"en","Kenya":"en","Zambia":"en",
 "Zimbabwe":"en","Gambia":"en","Sierra Leone":"en","Libéria":"en",
 "Namíbia":"en","Új-Zéland":"en","Trinidad és Tobago":"en","Barbados":"en",
 "Egyiptom":"en","Szaúd-Arábia":"en","Omán":"en","Irán":"en","Izrael":"en",
 "Dél-Korea":"en","Laosz":"en",
 "Mozambik":"pt","Bissau-Guinea":"pt",
 "Dominikai Köztársaság":"es","San Marino":"it","Curaçao":"nl",
}

# ── keresztnév-térkép ───────────────────────────────────────────────────────
GIVEN = {
 "david":"Dávid","oliver":"Olivér","peter":"Péter","pete":"Peti","michel":"Mihály",
 "michael":"Mihály","michele":"Mihály","mikael":"Mihály","mihajlo":"Mihály",
 "johan":"János","johannes":"János","jan":"János","john":"János","jean":"János",
 "juan":"János","joão":"János","joao":"János","ivan":"János","giovanni":"János",
 "hans":"János","janos":"János","sean":"János","yanis":"János","yannis":"János",
 "paolo":"Pál","paul":"Pál","pablo":"Pál","pavel":"Pál","pawel":"Pál","paulo":"Pál",
 "pau":"Pál","paulinho":"Palika","pál":"Pál",
 "franz":"Ferenc","francesco":"Ferenc","francisco":"Ferenc","frank":"Ferenc",
 "franco":"Ferenc","francois":"Ferenc","françois":"Ferenc","fran":"Ferkó",
 "cristiano":"Krisztián","christian":"Krisztián","christophe":"Krisztián",
 "christoph":"Krisztián","kristian":"Krisztián","cristian":"Krisztián",
 "chris":"Krisztián","krisztian":"Krisztián",
 "roberto":"Róbert","robert":"Róbert","rob":"Robi","robbie":"Robika","rui":"Rudi",
 "zlatan":"Zalán","zinedine":"Zalán","zinédine":"Zalán","zoltan":"Zoltán",
 "gerd":"Gerhárd","gerhard":"Gerhárd","gerard":"Gellért","gerardo":"Gellért",
 "thomas":"Tamás","tomas":"Tamás","tomáš":"Tamás","tommaso":"Tamás","tom":"Tomi",
 "tomasz":"Tamás","toma":"Tamás","thibaut":"Tibor","tibor":"Tibor",
 "jurgen":"György","jürgen":"György","george":"György","georges":"György",
 "georgios":"György","gheorghe":"György","jorge":"György","giorgio":"György",
 "samuel":"Sámuel","samir":"Samu","sam":"Samu","sami":"Samu",
 "denis":"Dénes","dennis":"Dénes","daniel":"Dániel","danilo":"Dani","dani":"Dani",
 "dmitrij":"Dömötör","dmitri":"Dömötör","viktor":"Viktor","victor":"Viktor",
 "davor":"Dávid","luka":"Lukács","lucas":"Lukács","luca":"Lukács","luc":"Lukács",
 "luis":"Lajos","luís":"Lajos","louis":"Lajos","luigi":"Lajos","lajos":"Lajos",
 "bastian":"Sebestyén","sebastian":"Sebestyén","sébastien":"Sebestyén",
 "mohamed":"Mohács","mohammed":"Mohács","muhammed":"Mohács","mehmet":"Menyhért",
 "lev":"Levente","alex":"Sándor","alexander":"Sándor","alexandre":"Sándor",
 "alessandro":"Sándor","alejandro":"Sándor","aleksandar":"Sándor","sandro":"Sanyi",
 "andrea":"András","andreas":"András","andré":"András","andre":"András",
 "andrés":"András","andres":"András","andrew":"András","andrei":"András",
 "andrej":"András","anders":"András","antonio":"Antal","antoine":"Antal",
 "anton":"Antal","antonin":"Antal","antony":"Antal","anthony":"Antal",
 "andriy":"András","andrij":"András","antónio":"Antal",
 "stefan":"István","stephan":"István","steven":"István","stephen":"István",
 "stefano":"István","steve":"Pista","esteban":"István","étienne":"István",
 "laszlo":"László","ladislav":"László","vladislav":"László",
 "emil":"Emil","emile":"Emil","emmanuel":"Manó","manuel":"Manó","manolo":"Manó",
 "vincent":"Vince","vicente":"Vince","vince":"Vince","enzo":"Vince",
 "marco":"Márk","marc":"Márk","mark":"Márk","marcus":"Márk","markus":"Márk",
 "marko":"Márk","marek":"Márk","marcos":"Márk","mario":"Márió","marius":"Márió",
 "martin":"Márton","martín":"Márton","matteo":"Máté","mathieu":"Máté",
 "matthias":"Máté","mateo":"Máté","matthew":"Máté","mats":"Máté","matej":"Máté",
 "matthijs":"Máté","mattia":"Máté","matthäus":"Máté",
 "gabriel":"Gábor","gabor":"Gábor","gaby":"Gabi","gabriele":"Gábor",
 "adam":"Ádám","adán":"Ádám","aaron":"Áron","aron":"Áron","arno":"Arnold",
 "arnold":"Arnold","albert":"Albert","alberto":"Albert","albin":"Albin",
 "bernard":"Bernát","bernardo":"Bernát","bernd":"Bernát","benjamin":"Benjámin",
 "benedikt":"Benedek","benito":"Benedek","ben":"Bence","bence":"Bence",
 "carlos":"Károly","carles":"Károly","carlo":"Károly","karl":"Károly",
 "charles":"Károly","karel":"Károly","charlie":"Karcsi","carl":"Károly",
 "eric":"Erik","erik":"Erik","erling":"Erik","edward":"Ede","eduardo":"Ede",
 "edouard":"Ede","édouard":"Ede","eddie":"Edu","edu":"Edu","edin":"Ede",
 "filippo":"Fülöp","felipe":"Fülöp","philipp":"Fülöp","philippe":"Fülöp",
 "philip":"Fülöp","phil":"Fülöp","felix":"Félix",
 "giuseppe":"József","josef":"József","josep":"József","jozef":"József",
 "joseph":"József","jose":"József","josé":"József","pepe":"Jocó","pep":"Jocó",
 "henrik":"Henrik","henry":"Henrik","henrique":"Henrik","enrique":"Henrik",
 "hugo":"Hugó","hakan":"Hakni","igor":"Igor","ignacio":"Ignác",
 "jakub":"Jakab","jacob":"Jakab","jack":"Jakab","james":"Jakab","jaime":"Jakab",
 "jonas":"Jónás","jonathan":"Jónás","joel":"Joel","julian":"Gyula","julien":"Gyula",
 "julio":"Gyula","giuliano":"Gyula","juliano":"Gyula","jules":"Gyula",
 "kevin":"Kelemen","kenneth":"Kelemen","klaus":"Kolos","kolo":"Kolos",
 "leonardo":"Lénárd","leon":"Lénárd","leo":"Leó","lionel":"Lénárd",
 "lorenzo":"Lőrinc","laurent":"Lőrinc","lars":"Lőrinc","lauri":"Lőrinc",
 "lukas":"Lukács","łukasz":"Lukács","lukasz":"Lukács",
 "miguel":"Miklós","nicolas":"Miklós","nicolás":"Miklós","niklas":"Miklós",
 "nicola":"Miklós","nicolae":"Miklós","nikola":"Miklós","nils":"Miklós",
 "nikolai":"Miklós","claus":"Miklós","klaas":"Miklós","nemanja":"Nándor",
 "otto":"Ottó","oscar":"Oszkár","óscar":"Oszkár","olof":"Olaf","ole":"Olaf",
 "patrick":"Patrik","patrice":"Patrik","patricio":"Patrik","pierre":"Péter",
 "pietro":"Péter","piotr":"Péter","petr":"Péter","pedro":"Péter","pere":"Péter",
 "raul":"Rudolf","raúl":"Rudolf","rudolf":"Rudolf","ruud":"Rudi","rudi":"Rudi",
 "ricardo":"Rikárd","riccardo":"Rikárd","richard":"Rikárd","ricard":"Rikárd",
 "sergio":"Szergej","sergei":"Szergej","sergej":"Szergej","serge":"Szergej",
 "simon":"Simon","simone":"Simon","szymon":"Simon","sergi":"Szergej",
 "vladimir":"Vladi","vlad":"Vladi","valentin":"Bálint","valentino":"Bálint",
 "walter":"Valter","wayne":"Vendel","william":"Vilmos","willem":"Vilmos",
 "wim":"Vilmos","willy":"Vili","wilfried":"Vilmos","viliam":"Vilmos",
 "zdenek":"Zsolt","zsolt":"Zsolt","zoran":"Zorán","zvonimir":"Zvoni",
 "ivica":"Iván","igors":"Igor","ilie":"Illés","ilija":"Illés",
 "gianluca":"Lukács","gianluigi":"Lajos","gianni":"Jani","gian":"Jani",
 "roman":"Román","romain":"Román","ramón":"Román","ramon":"Román",
 "rafael":"Rafael","rafa":"Rafi","raphael":"Rafael","raphaël":"Rafael",
 "theo":"Tivadar","teodor":"Tivadar","fyodor":"Tivadar","todor":"Tivadar",
 "gregory":"Gergely","grégory":"Gergely","grzegorz":"Gergely","gregor":"Gergely",
 "bruno":"Brunó","boris":"Barnabás","borja":"Barnabás","bojan":"Bojtár",
 "milan":"Milán","miloš":"Milán","milos":"Milán","mirko":"Mirkó",
 "vasil":"Vazul","vasilij":"Vazul","wassili":"Vazul",
}


# ── BŐVÍTÉS: a kalapból húzott keresztnév ellen ────────────────────────────
# A motor a keresztnevet innen veszi; ami nincs benne, arra a pool_given
# KALAPBÓL húz egy magyar nevet, aminek a hangzáshoz semmi köze. Mérve ez
# 1463 néven futott — a bővítés ebből 748-at szüntet meg.
# A sorrend a Danisítás-guide R3 pontja: magyar megfelelő → az eredeti
# magyaros írással → és csak végül a kalap, de akkor a hangzáshoz illő.
GIVEN.update({
# 1. VAN MAGYAR MEGFELELŐJE
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
# 2. NINCS, DE MAGYAROS ÍRÁSSAL JÓL HANGZIK
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
# 2/b. FORDÍTÁS (a „Petit → Pici" vonal)
 "angel":"Angyal","mladen":"Ifjú","moreno":"Barna","morgan":"Morgó",
 "scott":"Skót",
# 3. KALAP, DE A HANGZÁSHOZ ILLŐ
 "abdoulay":"Ábel","arouna":"Arnold","darren":"Dorián","don":"Doma",
 "eren":"Örs","garry":"Geri","gokhan":"Gyárfás","holger":"Huba",
 "horst":"Hunor","miodrag":"Mikó","nawaf":"Noé","roy":"Roj",
 "santi":"Szanyi","seydou":"Sebő","terry":"Tihamér","trevor":"Töhötöm",
})

# ── univerzális pool, ha a keresztnév nem szerepel a térképben ───────────────
POOL = ["Ábel","Ábris","Ákos","Álmos","Ambrus","Aurél","Bálint","Barnabás","Bendegúz",
 "Benedek","Bertalan","Boldizsár","Csanád","Csongor","Dezső","Domonkos","Elemér",
 "Ernő","Farkas","Gedeon","Gellért","Gergő","Gyárfás","Huba","Ince","Jenő","Kálmán",
 "Kelemen","Kornél","Levente","Lehel","Lóránt","Máté","Menyhért","Miksa","Mór",
 "Nándor","Ödön","Örs","Pongrác","Rezső","Salamon","Sebő","Szabolcs","Tas","Tihamér",
 "Töhötöm","Vajk","Vazul","Vilmos","Zalán","Zétény","Zsigmond","Zsombor"]

PARTICLES = {"de","da","do","dos","das","van","von","der","den","di","dí","le",
             "la","el","al","bin","ibn","del","della","ter","ten","op","het"}

def strip_dia(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")

# nem magyar ékezet → alap betű, a magyar ékezetek megmaradnak
KEEP = set("áéíóöőúüűÁÉÍÓÖŐÚÜŰ")
def fold(s):
    return "".join(c if c in KEEP else strip_dia(c) for c in s)

# ══ ŐRJELEK: A KÉTJEGYŰ BETŰ EGY BETŰ (3.9.118) ════════════════════════════
# A MEGISMÉTLŐDŐ HIBA. A motorban ötször fordult elő ugyanaz: egy KORAI lépés
# beír egy magyar kétjegyű betűt, egy KÉSŐBBI pedig annak az egyik felébe mar
# bele, mert csak betűket lát, nem hangokat.
#
#   ez$ → esz    utána  z → sz (spanyol)   →  Rodríguessz   (3.9.113-ban javítva)
#   ß  → sz      utána  z → c  (német)     →  Häßler → Haskler, Weiß → Fájsk
#   ž  → zs      utána  z → c  (német)     →  Džemaili → Dcsemájli
#   ñ  → ny      utána  y → j              →  Núñez → Núnjesz
#   gn → ny      utána  y → j              →  Burgnich → Burnjik, Signori → Sinjori
#   gli→ lyi     utána  y → j              →  Pagliuca → Paljiuka
#   ç  → cs      utána  c → dzs (török)    →  Selçuk → Seldzssuk
#   ã  → a       ezért  ão$ → án SOSEM fut →  Militão → Mílitao
#   tz → c       utána  c → k              →  Großkreutz → Groszkrojk
#   z  → c (de)  utána  c → k              →  Schulz → Sulk
#   w  → v       utána  v → f  (német)     →  Weiß → Fájsz (helyesen Vájsz)
#   ss → ssz     utána  z → c  (német)     →  Sparwasser → Sparvasscer
#   ski$→ szki   utána  z → c  (német)     →  Milewski → Milevscki
#
# AZ UTOLSÓ HÁROM A LEGBESZÉDESEBB: ezeket már az őrjelek BEVEZETÉSE KÖZBEN
# találtam meg — vagyis a rendszer a saját hibáit is előhozta. Az egybetűs
# `c`-nek is kell őrjel, mert a `c → k` szabály nem tudja, hogy az a c egy
# MÁSIK szabály döntése volt; a német v/w pedig ugyanaz a csere-sorrend,
# amit a holland ágnál már egyszer megoldottunk.
#
# A SZABÁLY, AMIT EBBŐL LEVEZETÜNK: ha egy csere MAGYAR KÉTJEGYŰ BETŰT ír
# (ny, zs, cs, ly, sz, c, dzs), őrjelet kell írnia. Nem azért, mert ma
# elromlana, hanem mert a következő nyelvi szabály már nem tudja, hogy az
# ott egy döntés eredménye volt.
#
# A FOLTOZÁS NEM MEGOLDÁS: minden új nyelvi szabály újra megnyitná. Ezért a
# már ELDÖNTÖTT kétjegyű betűk mostantól EGYETLEN, láthatatlan karakterként
# utaznak végig a soron, és csak a legvégén bomlanak vissza. Ami őrjel, azon
# egyetlen későbbi csere sem fog — a hatodik ilyen hiba nem tud megszületni.
S_NY, S_ZS, S_CS, S_LY, S_SZ, S_AO, S_C, S_DZS = ("\x01", "\x02", "\x03", "\x04",
                                                  "\x05", "\x06", "\x07", "\x08")
# A HOSSZÚ ALAKOK ÉS A VÉDETT s KÜLÖN ŐRJEL (3.9.119). A hosszú sz magyarul
# „ssz", a hosszú cs „ccs" — vagyis az ELSŐ betűjük egy sima s, illetve c,
# amibe a nyelvi ágak belemarnak (Nilsson → Nilszszon, Bucci → Bukcsi).
# Az S_S pedig az az `s`, ami TÉNYLEG az sh hangot jelöli (sch, sh, török ş,
# portugál x) — enélkül a „szókezdő s → sz" szabályok ezt is átírnák.
# UGYANEZÉRT KAPOTT ŐRJELET A `ch → cs` IS: az új angol „szóvégi s → sz"
# szabály a Ziyech cs-jébe mart bele (Zijecs → Zijeksz), mert a c-t egy
# külön szabály k-vá tette, miután az s-t elvitték mellőle. A tanulság
# ugyanaz, harmadszor: ami kétjegyű betűt ír, őrjelet írjon.
# S_J: EGYBETŰS, MÉGIS ŐRJEL (3.9.120). Az `ai → áj`, `ay → éj` által ÍRT
# j-t az új angol `j → dzs` szabály elvitte: Gray → Gréj → „Grédzs".
# Nem a betű HOSSZA számít tehát, hanem hogy DÖNTÉS eredménye-e.
S_SSZ, S_CCS, S_S, S_J = "\x09", "\x0a", "\x0b", "\x0c"
SENT = {S_NY: "ny", S_ZS: "zs", S_CS: "cs", S_LY: "ly", S_SZ: "sz",
        S_AO: "án", S_C: "c", S_DZS: "dzs",
        S_SSZ: "ssz", S_CCS: "ccs", S_S: "s", S_J: "j"}

def desent(s):
    """Az őrjelek feloldása — a fonetika UTOLSÓ lépése."""
    for k, v in SENT.items():
        s = s.replace(k, v)
    return s

PRE = str.maketrans({
 "ć":S_CS,"č":S_CS,"ç":S_CS,"š":S_S,"ș":S_S,"ş":S_S,"ž":S_ZS,"ź":S_ZS,"ż":S_ZS,
 "ř":"r"+S_ZS,"ñ":S_NY,"ń":S_NY,"ø":"ő","å":"ó","æ":"e","ł":"l","đ":"gy","ð":"d",
 "þ":"t","ě":"e","ė":"e","ę":"e","ą":"a","ů":"ú","ı":"i","ğ":"","ý":"i","ÿ":"i",
 "ß":S_SZ,"õ":"ó","ã":"a","ä":"e","â":"á","ê":"é","î":"i","ô":"ó","û":"u","ë":"e","ï":"i",
})

def hufy(w, lang="en"):
    """Egy szó magyaros fonetikus átirata, nyelvfüggő kiejtéssel."""
    if not w:
        return w
    # ── A Mc- ÉS Mac- ELŐTAG (3.9.113) ─────────────────────────────────────
    # A motor a `c`-t `k`-ra írta, magánhangzó nélkül: McNeill → Mkneili,
    # McCoist → Mkkoist, McFarland → Mkfarland. Ez nem stílus, hanem
    # KIMONDHATATLAN — a magyar szótag nem kezdődhet `mk`-val.
    # A gael előtag jelentése „fia", ejtése /mək/ ~ /mæk/, magyar fülnek a
    # McDonald's óta „mek": innen a Mek- (Mc) és Mak- (Mac). A tövet külön
    # írjuk át, hogy a saját nyelvének szabályai vonatkozzanak rá.
    _mc = re.match(r"^M(a?)c([A-Z])", w)
    if _mc:
        _pre = "Mak" if _mc.group(1) else "Mek"
        _rest = hufy(w[2 + len(_mc.group(1)):], lang)
        return _pre + _rest.lower()
    cap = w[0].isupper()
    _lw = w.lower()
    # A PORTUGÁL -ão MÉG A PRE ELŐTT (3.9.118). A PRE a hullámot lekoptatja
    # (`ã → a`), ezért a lenti `ão$ → án` szabály SOSEM talált semmit —
    # a Militãóból „Mílitao" lett, nem „Militán".
    if lang == "pt":
        _lw = re.sub(r"ão", S_AO, _lw)
    s = _lw.translate(PRE)

    # ── A HOLLAND ÉS NÉMET v MÁR ITT f LESZ (3.9.113 · 3.9.118) ────────────
    # A sorrend miatt áll ilyen korán: lentebb az általános lista `w → v`-t
    # cserél, és ha a `v → f` UTÁNA futna, a Wijnaldumból Fájnaldum lenne.
    # Mindkét nyelvben a w ejtése v, a v-é viszont f — a kettőt tehát el kell
    # választani, mielőtt egybeolvadnak. Lásd van Bommel → Fánbommel.
    # A NÉMET 3.9.118 ÓTA VAN ITT: addig a de-ág a `w → v` UTÁN cserélt
    # v → f-et, és ezért lett a Weißből „Fájsz" (helyesen Vájsz), a
    # Wagnerből „Fágner". Ugyanaz a csere-sorrend, csak egy nyelvvel odébb.
    if lang in ("nl", "de"):
        s = s.replace("v", "f")
    if lang == "pl":
        # ── LENGYEL HELYESÍRÁS (3.9.119) ──────────────────────────────────
        # Eddig a közös szláv kosárban ült. Ez ITT áll, a latin szabályok
        # ELŐTT, mert HELYESÍRÁS, nem fonetika: az általános `ie → i`
        # különben előbb megenné a „nie"-t (Boniek → Bonik, helyesen Bonyek).
        #   sz → s   cz → cs   rz → zs   ch → h   ni+mgh → ny
        # A SORREND: az `sz` a `cz`/`rz` előtt, különben a „szcz"
        # (Piszczek) kettévágódna. A `ł → l`, `ś/ź/ż`, `ą/ę` a PRE dolga.
        s = s.replace("sz", S_S).replace("cz", S_CS).replace("rz", S_ZS)
        s = s.replace("ch", "h")
        s = re.sub(r"ni(?=[aeou])", S_NY, s)

    # végződések
    # ── A -ović MEGTARTJA AZ „ov"-OT (3.9.118) ─────────────────────────────
    # Volt itt egy `-ović → -ics`, ami magyaros vezetéknevet csinált az
    # apanévből (Ivanović → Ivanics). Rövid tövön viszont végzetes: a
    # Jovićból „Jics" lett, HÁROM betű. A felhasználó döntése a teljes alak
    # (Jovics, Sztojkovics), és így a három írásmód is egyformán viselkedik —
    # eddig a „-ovich" és a „-ović" MÁS eredményt adott.
    s = re.sub(r"ovi(?:c|ch|cs|" + S_CS + r")$", "ovi" + S_CS, s)
    s = re.sub(r"(sky|ski)$", S_SZ + "ki", s)
    s = re.sub(r"(escu)$", "e" + S_SZ + "ku", s)
    # A SPANYOL -ez NEM KAP KÜLÖN SZABÁLYT (3.9.113). Volt itt egy
    # `ez$ → esz`, és pont az rontotta el: lentebb az `es` ág amúgy is
    # elvégzi a `z → sz` cserét, ami a MOST beírt `sz`-ből `ssz`-t csinált —
    # innen jött a Rodríguessz, Gómessz, Fernándessz (51 név). A `z → sz`
    # egymagában helyesen hoz Rodrígeszt és Gómeszt, a Zapata → Szapata pedig
    # mindig is bizonyította, hogy a cserével nincs baj.

    # ── A sch SOSEM JUTOTT EL A SAJÁT SZABÁLYÁIG (3.9.118) ─────────────────
    # A `sch → s` az általános listában állt, az viszont a ch-blokk UTÁN fut:
    # mire odaért, a ch már k vagy cs lett (Schneider → Sknájder, Schulz →
    # Scsulk, Schumacher → Scsumacser). Ezért került ELŐRE.
    # OLASZUL KIVÉTEL: ott a `sch` = sk (Schiavone → Skiavone), és ezt a
    # ch-blokk `chi → ki` ága adja helyesen — tehát olaszul nem nyúlunk hozzá.
    if lang != "it":
        s = s.replace("sch", S_S)
    s = s.replace("sh", S_S)

    # A „gn" CSAK AZ ÚJLATIN NYELVEKBEN ny (3.9.118). Az általános listában
    # állt, ezért a németre is lefutott: a Wagnerből „Vanyer" lett (azelőtt
    # „Vanjer"), az Illgnerből „Ilnyer". Németül, angolul, hollandul a gn
    # egyszerűen g+n. Olaszul (Insigne) és franciául (Sagnol) viszont ny —
    # a guide R1 sora is így mondja.
    if lang in ("it", "fr", "af"):
        s = s.replace("gn", S_NY)

    # AZ OLASZ „gli" EGYETLEN HANG (3.9.118): a Pagliuca „pa-lyú-ka", nem
    # „pa-lyi-uka". Magánhangzó előtt tehát nem marad utána i.
    s = re.sub(r"gli(?=[aeiouáéíóú])", S_LY, s)
    s = s.replace("gli", S_LY + "i")

    # ch — a legerősebben nyelvfüggő hang
    if lang in ("it",):
        s = s.replace("chi", "ki").replace("che", "ke").replace("ch", "k")
    elif lang in ("fr", "af"):
        s = s.replace("ch", S_S)
    elif lang == "es":
        s = s.replace("ch", S_CS)
    else:
        s = re.sub(r"ch(?=[bcdfgklmnprstvz])", "k", s)   # Chris → Krisz
        s = s.replace("ch", S_CS)

    # a baszk/katalán „tx" magyarul cs (Goikoetxea → Goikocsea). Az x→ksz
    # szabály elé kell, különben kiejthetetlen mássalhangzó-torlódás lesz.
    s = s.replace("tx", S_CS).replace("tz", S_C)

    # ── A qu NYELVFÜGGŐ (3.9.113) ──────────────────────────────────────────
    # Volt az általános listában egy `qu → kv`, ami az újlatin nyelveken
    # hibás: a francia és a spanyol qu egyetlen k hang (Jacquet → Zsaké,
    # Quique → Kike), nem kv. Az olaszban és az angolban viszont TÉNYLEG kv
    # (quattro, queen), tehát ott marad.
    s = s.replace("qu", "k" if lang in ("fr", "af", "es", "pt") else "kv")
    for a, b in [("cz",S_CS),("th","t"),("ph","f"),
                 ("ck","kk"),("gh","g"),
                 ("ee","í"),("oo","ú"),("ou","ú"),("ea","í"),("oa","ó"),
                 ("ai","á"+S_J),("ay","é"+S_J),("ey","i"),("ie","i"),
                 ("ss",S_SSZ),("x","k"+S_SZ),("w","v"),("q","k")]:
        s = s.replace(a, b)


    if lang == "en":
        # ── AZ ANGOL s MÁSSALHANGZÓ ELŐTT SZ (3.9.113) ─────────────────────
        # A magyar „s" a sh hangot jelöli: a Húrst eddig „Húrsht"-nak, a
        # Stracsan „Shtrachan"-nak olvasódott. Angolul ez a hang /s/.
        # A NÉMET SZÁNDÉKOSAN KIMARAD: ott a szó eleji st/sp TÉNYLEG „sht"
        # (Stefan), és a lenti de-ág ezt külön meg is védi.
        s = re.sub(r"s(?=[ptkmnlw])", S_SZ, s)
        # ── ANGOL SZÓVÉGI -s (3.9.119) ─────────────────────────────────────
        # Szintén nem sh: a Petersz, a Hurszt. EGYSÉGESEN sz, nem z: az
        # angol szóvégi -s hol /s/, hol /z/ (Francis vs. Giles), és a kettőt
        # csak a szó jelentése dönti el — egy névtáblából nem. Az „sh"
        # viszont MINDIG hibás, tehát a biztos felét javítjuk: a hangot,
        # nem a zöngésségét.
        s = re.sub(r"s$", S_SZ, s)
        # ── AZ ANGOL J MINDIG dzs (3.9.120) ────────────────────────────────
        # Jones → Dzsonesz, Johnston → Dzsonszton. A többi nagy nyelv j-je
        # már rég a helyén volt (francia zs, spanyol h, most japán dzs) — az
        # angol maradt ki, és épp az a leggyakoribb.
        # A `g` e/i előtt SZÁNDÉKOSAN kimarad: angolul kiszámíthatatlan
        # (Gerrard dzs, de Gibson és Gemmill kemény g), és egy névtáblából
        # nem dönthető el. Inkább marad hibátlanul semleges.
        s = s.replace("j", S_DZS)
    elif lang == "de":
        s = s.replace("ei", "áj").replace("eu", "oj").replace("z", S_C)
        s = re.sub(r"^s(?=[pt])", "s", s)
    elif lang in ("fr", "af"):
        # ── FRANCIA HELYESÍRÁS, KÉT KIEJTÉSSEL (3.9.120) ───────────────────
        # A frankofón Afrika és a Maghreb nevei FRANCIA HELYESÍRÁSSAL
        # érkeznek, de nem franciául ejtik őket: ott a szóvégi mássalhangzó
        # NEM néma, és az `-er` sem `-é`. Az első nekifutásom egyszerűen
        # "fr"-be tette őket, és ez azonnal meg is látszott:
        #   Bennacer → „Bennaszé"  (helyesen Bennaszer)
        #   Naybet   → „Nézsbé"    (helyesen Nájbet)
        #   Ziyech   → „Zijé"      (helyesen Zijes)
        # Ezért az „af" kód: ugyanaz a HELYESÍRÁS (ch = s, j = zs, g e/i
        # előtt zs, qu = k, ou = ú), de a néma végződések nélkül.
        s = re.sub(r"j", "zs", s)
        # A FRANCIA G i/e/y ELŐTT ZS (3.9.113) — Gignac → Zsinyak,
        # Giresse → Zsiressz. A `gn → ny` és a `gh → g` már lefutott
        # fölötte, a `gu` (Guivarc'h) pedig nem érintett: ott u áll a g után.
        s = re.sub(r"g(?=[eiéíy])", "zs", s)
        s = re.sub(r"(ault|aud|aut)$", "ó", s)
        if lang == "fr":
            s = re.sub(r"er$", "é", s)
        # ── A NÉMA SZÓVÉGI MÁSSALHANGZÓ (3.9.119) ──────────────────────────
        # A guide R1 sora: „francia szóvégi -t, -s néma" (Rabiot → Rábijó).
        # Ugyanez a -d, -x, -z. NEM néma az -r (Giresse melletti Lemar), a
        # -c, az -l és az -f, ezért azokhoz nem nyúlunk. Rövid szót nem
        # csonkítunk (Le, Sax), és magánhangzó kell elé, különben a
        # mássalhangzó-torlódás marad (Vincent → Vinszan, nem Vinsz).
        if lang == "fr" and len(s) > 3:
            # ELŐBB az „e + néma mássalhangzó", ami é-vé olvad (Jonquet →
            # Zsonké). Enélkül a lenti néma-e szabály a puszta e-t is
            # levágná, és „Zsonk" maradna.
            s = re.sub(r"e[tdsxz]$", "é", s)
            s = re.sub(r"(?<=[aiouáíóú])[tdsxz]$", "", s)
            # ORRHANG UTÁN IS NÉMA (3.9.120): a Vincent „Vinszen", a
            # Le Normand „Lenorman", a Martins „Martin". A magánhangzó
            # ORRHANGÚSÁGÁT nem próbáljuk visszaadni (az „en" marad „en",
            # nem lesz „an"): az már a szó ismeretét kívánná, a néma
            # végződés viszont kivétel nélküli szabály.
            s = re.sub(r"(?<=n)[tds]$", "", s)
    elif lang == "es":
        s = re.sub(r"j", "h", s)
        s = re.sub(r"^h", "", s)
        s = s.replace("z", S_SZ)
        # A SZÓKEZDŐ S SPANYOLUL SZ (3.9.113). A magyar „s" a sh hangot
        # jelöli, tehát a Santamaría eddig „Shantamaria"-ként olvasódott.
        # A `z → sz` UTÁN áll, különben a frissen beírt sz z-jét is
        # újracserélné (ugyanaz a csapda, ami a Rodríguessz-t okozta).
        # …ÉS 3.9.116-BAN MÉG EGY ŐR KELLETT IDE: a Zapata a `z → sz` után
        # már „szapata", aminek az eleje `s`, tehát a szabály RÁ IS lefutott
        # („Szzapata", 6 név). 3.9.118 ÓTA AZ ŐR FÖLÖSLEGES: a `z → sz`
        # őrjelet ír, azon pedig ez a csere már nem talál `s`-t. Ez a
        # legtisztább bizonyíték rá, hogy az őrjelek nem egy foltot
        # váltottak ki, hanem a folt OKÁT.
        s = re.sub(r"^s", S_SZ, s)
    elif lang == "pt":
        s = re.sub(r"ão$", "án", s)
        s = s.replace("nh", S_NY).replace("lh", S_LY)
        # A PORTUGÁL x NEM ksz, hanem s (3.9.119): Aleixo → Aleisu,
        # Xeka → Seka. Az általános lista `x → ksz`-e fut fölötte, ezért
        # azt kell visszabontani.
        s = s.replace("k" + S_SZ, S_S)
        s = re.sub(r"^s", S_SZ, s)        # Sousa → Szúza, Salas → Szálas
    elif lang == "it":
        s = re.sub(r"ci(?=[aou])", S_CS, s)
        s = re.sub(r"gi(?=[aou])", S_DZS, s)
        s = s.replace("ge", S_DZS + "e").replace("gi", S_DZS + "i")
        # ── AZ OLASZ c e/i ELŐTT MINDIG cs (3.9.119) ───────────────────────
        # A `ci(?=[aou])` ág csak a magánhangzós esetet fogta; mássalhangzó
        # előtt és szóvégen a lenti általános `c(?=[eiéí]) → sz` vitte el:
        # Mancini → Manszini, Bucci → Bucszi, Radice → Radisze.
        s = re.sub(r"cc(?=[eiéí])", S_CCS, s)
        s = re.sub(r"c(?=[eiéí])", S_CS, s)
        # ── OLASZ s + MÁSSALHANGZÓ (3.9.119) ───────────────────────────────
        # Ugyanaz, mint az angolnál: a magyar „s" a sh hangot jelöli, az
        # olasz st/sp/sc viszont szt/szp/szk (Anastasi, Castigliano).
        s = re.sub(r"s(?=[ptk])", S_SZ, s)
        # MAGÁNHANGZÓK KÖZT AZ OLASZ s ZÖNGÉS (3.9.113): Maroso → Marozo,
        # Baresi → Barezi, Ambrosini → Ambrozini. A kettőzött ss-t nem
        # érinti (az fölötte már ssz lett), és ez a helyes: a Cassano
        # tényleg Kasszánó.
        s = re.sub(r"(?<=[aeiouáéíóúöőüű])s(?=[aeiouáéíóúöőüű])", "z", s)
    elif lang == "nl":
        # ── A HOLLAND MAGÁNHANGZÓ-PÁROK ÉS A TORKOS G (3.9.113) ────────────
        # A guide R1 sora: ui → öj, ij/ei → áj, oe → ú, g → h.
        # A g-nél egy kivétel kell: az „ng" egyetlen orrhang (Jongbloed),
        # ott a g nem torokhang, tehát marad.
        s = s.replace("oe", "ú").replace("ui", "öj").replace("uy", "öj").replace("eu", "ö")
        s = s.replace("ij", "áj").replace("ei", "áj")
        s = re.sub(r"(?<!n)g", "h", s)
    elif lang == "tr":
        # ── TÖRÖK (3.9.119) ────────────────────────────────────────────────
        # A `c` dzs (Kahveci → Kahvedzsi) — ez eddig is megvolt. Ami hiányzott:
        # a `ş` PRE-ben `s` lesz, ami magyarul épp a helyes sh hang, DE a
        # sima `s` törökül sz (Baştürk → Bastürk, helyesen Bastürk marad,
        # viszont Sivok → Szivok). A `ğ` néma, az `ı` i — ezeket a PRE viszi.
        s = s.replace("c", S_DZS)
        s = s.replace("s", S_SZ)
    elif lang == "sc":
        # ── SKANDINÁV (3.9.119) ────────────────────────────────────────────
        # A guide R1 sora: „skandináv `s` → sz" (Sørloth → Szőrló, Isaksson →
        # Iszaksszon). Ág eddig nem volt hozzá, csak a patronim -son/-sen
        # kezelése — a hang maga végig magyar „s" (sh) maradt: Bastrup,
        # Hisén, Nilsen.
        s = s.replace("s", S_SZ)
    elif lang == "gr":
        # ── GÖRÖG (3.9.119) ────────────────────────────────────────────────
        # A görögben nincs sh hang: minden `s` sz. És mivel a görög
        # vezetéknevek DÖNTŐ TÖBBSÉGE -s-re végződik (-akis, -idis, -as,
        # -os), ág híján gyakorlatilag MIND rosszul olvasódott:
        # Dómazos, Zágorakis, Mánolas.
        s = s.replace("s", S_SZ)
        s = s.replace("b", "v").replace("d", "d")
    elif lang == "pl":
        pass          # a lengyel helyesírás a latin szabályok ELŐTT futott
    elif lang == "sl":
        # ── SZLÁV s + MÁSSALHANGZÓ (3.9.120) ──────────────────────────────
        # A szláv `s` /s/, vagyis magyarul sz — a Stojković „Shtojkovics"-nak
        # olvasódott. CSAK mássalhangzó előtt cseréljük, és ennek oka van: a
        # szovjet nevek az adatbázisban MÁR magyar átírásban állnak
        # („Csiszlenko"), ott egy általános `s → sz` a `cs`-be marna bele.
        # Mássalhangzó előtt ilyen ütközés nincs — a „cs" után mindig
        # magánhangzó vagy szóvég áll.
        # A `cs`/`zs` ELŐTAG KIZÁRVA: a Kežman az adatbázisban „Kezsman",
        # és ott az s a zs MÁSODIK betűje — a csere „Kezszman"-t csinált
        # belőle. Ugyanaz a kétjegyű-betű-hiba, csak most a FORRÁS
        # helyesírásában, ahol őrjel nem véd meg.
        s = re.sub(r"(?<![cz])s(?=[ptkmnlvr])", S_SZ, s)
    elif lang == "jp":
        # ── JAPÁN (3.9.120) ───────────────────────────────────────────────
        # A romaji betűnként olvasandó, de nem angolul: `s` = sz (Morisawa →
        # Moriszava), `j` = dzs (Kenji → Kendzsi), `ts` = c (Matsui →
        # Macui). Az `sh` = s és a `ch` = cs már fönt eldőlt (őrjellel), a
        # `y → j` és a `w → v` az általános listából jön.
        s = s.replace("ts", S_C).replace("j", S_DZS).replace("s", S_SZ)

    # ── A KETTŐZÖTT L NYELVFÜGGŐ (3.9.113) ─────────────────────────────────
    # Volt a fenti listában egy `ll → ly`, ami a lenti y-szabályon át `lj`-vé
    # vált — nyelvtől függetlenül. Ez 125 néven szólt bele, és a többségén
    # HIBÁS: a Montella nem Montelja, a Völler nem Följer, a Miller nem
    # Miljer. Az `lj` hang csak a délszláv nevekben van otthon, ott viszont
    # nem `ll`-ből jön (Ljungberg), tehát itt nincs mit megvédeni.
    #   spanyol      ll = j     Gallardo → Gajardo, Gordillo → Gordijo
    #   francia      ill = ij   Gillet → Zsijé;  minden más ll = l
    #   mindenki más ll = l     Montela, Föler, Miler, Zagalo
    # A NYELVI ÁGAK UTÁN ÁLL, SZÁNDÉKOSAN: a spanyol ág `j → h`-t cserél
    # (Juan → Huan), tehát egy korábban beírt `j` Gahardóvá romlana. A
    # francia ág `j → zs`-je ugyanígy Gizset csinálna a Gijet-ből.
    if lang == "es":
        s = s.replace("ll", "j")
    elif lang == "fr":
        s = s.replace("ill", "ij").replace("ll", "l")
    else:
        s = s.replace("ll", "l")

    # c ejtése (ami eddig megmaradt)
    s = re.sub(r"c(?=[eiéí])", S_SZ, s)
    s = re.sub(r"c(?![sz])", "k", s)
    # y
    s = re.sub(r"y(?=[aeiouáéíóú])", "j", s)
    s = s.replace("y", "i")
    # néma szóvégi e (angol/francia) — de a 2-3 betűs szavakból nem, mert
    # abból nem marad semmi („Le" → „L")
    if lang in ("en", "fr", "af") and len(s) > 3:
        # AZ ŐRJELEK IS BETŰK: a visszatekintésnek látnia kell őket, különben
        # a „Giresse" (gires+⟨sz⟩+e) néma e-je bennmarad — Zsiressze.
        s = re.sub(r"(?<=[a-zíóúűő\x01-\x0c])e$", "", s)

    # AZ ŐRJELEK ITT BOMLANAK VISSZA — minden csere után, semmi nem fog rajtuk.
    s = desent(s)
    s = fold(s)
    s = re.sub(r"(.)\1{2,}", r"\1\1", s)      # hármas betűzés összevonása
    if not s:
        s = fold(w.lower())
    return s[0].upper() + s[1:] if cap else s


# ── PATRONIM VEZETÉKNÉV: a -son = „fia" ─────────────────────────────────────
# A Danisítás-guide R2 pontja: a Denílson, Ederson, Edílson végén a -son
# annyit tesz, „fia". Ugyanez a skandináv -sson, az angol -son és a
# dán/holland -sen.
HU_MGH = set("aeiouáéíóöőúüű")
SON_LANG = {"pt", "en", "sc", "nl", "be"}

def son_stem(w):
    """A patronim vezetéknév TÖVE, ha az — különben None.

    Három írásmód, három levágás, mindhárom a kiejtésből következik:
      -sson   a birtokos s a TŐHÖZ tartozik    Nilsson → Nils
      -sen    dán/norvég/holland, az s szintén  Jensen  → Jens
      -son    sima levágás                      Watson  → Wat

    Az angol viszont EGY s-re egyszerűsít, ha a tő maga is s-re végződne: a
    Ferguson tövében ott a Fergus, a Morrisonéban a Morris. Ezt onnan
    ismerjük fel, hogy a levágott tő magánhangzóra végződne.

    A RÖVID TŐ NEM PATRONIM: a „Son Heung-min" nem valakinek a fia, hanem
    így hívják — ezért kell legalább három betűnek maradnia."""
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


# A VÉGZŐDÉS HÁROM ALAKJA, ÉS MIÉRT NEM EGY.
# A „-fia" leírás, nem név: a Vatfia magyarázat, nem vezetéknév. A magyar
# névanyagban ugyanez a jelentés két RÉGI, valódi vezetéknév-végződésben él
# — a polgári -fi (Győrfi, Pálfi) és a nemesi -ffy (Pálffy, Bánffy) —, és
# ezek adják a hangulatot, amit a -fia csak elmagyaráz.
# A CÉLARÁNY 50 / 33 / 16 — a -fi a fő alak, a -ffy a második, a -fia ritka.
# EZREDES a felbontás, nem hatodos: a hatodos osztás ilyen kis mintán (ma 52
# különböző tő) durván félrehúz. Mérve, ugyanezen a hash-en:
#     h % 6    → 45 / 42 / 13   (a -ffy elszalad)
#     h % 1000 → 48 / 36 / 16   (ez van beépítve)
# A pontos arány tehát CÉL, nem garancia: a végződés determinisztikus, ezért
# a tényleges megoszlás azon múlik, épp milyen tövek vannak a bázisban.
SON_HAT = ((500, "fi"), (833, "ffy"), (1000, "fia"))

def son_suffix(stem_phon):
    """A végződés a TŐBŐL sorsolódik, nem a játékosból — és determinisztikusan.

    Miért a tőből: két Wilson ugyanazt a vezetéknevet viseli, tehát ugyanazt
    a végződést is kell kapniuk. Ha játékosonként sorsolnánk, a Vilfi és a
    Vilffy egymás mellett állna a keretben, és az nem stílus volna, hanem
    hibának látszó következetlenség. (Mérve: 0 olyan vezetéknév van, amelyik
    kétféle végződést kap.)

    Miért determinisztikusan: a build újrafuttatása nem írhatja át a
    neveket, és egy ÚJ KERET felvétele sem mozdíthatja el a meglévőket.
    Ugyanaz a tő mindig ugyanazt a végződést adja — ez ugyanaz a hash, amit
    a pool_given is használ."""
    h = 0
    for ch in stem_phon:
        h = (h * 131 + ord(ch)) & 0xFFFFFFFF
    h %= 1000
    veg = next(v for hat, v in SON_HAT if h < hat)
    s = re.sub(r"ssz$", "sz", stem_phon)      # Klaasszfi → Klaaszfi
    if veg.startswith("f") and s.lower().endswith("f"):
        s = s[:-1]                            # Graff + ffy → Graffy, nem Grafffy
    return s + veg


def lengthen(s):
    """Ha a fonetika semmit nem változtatott: nyújtsuk meg az ELSŐ magánhangzót.
       Ez adja a „Méridonna"-féle hangzást, és garantálja, hogy a kimenet
       különbözzön a valós névtől."""
    m = {"a":"á","e":"é","i":"í","o":"ó","u":"ú","A":"Á","E":"É","I":"Í","O":"Ó","U":"Ú"}
    for i, c in enumerate(s):
        if c in m:
            return s[:i] + m[c] + s[i+1:]
    return s + "ka"


def given_of(first):
    k = strip_dia(first.lower())
    if k in GIVEN:
        return GIVEN[k]
    if first.lower() in GIVEN:
        return GIVEN[first.lower()]
    return None


HU_DIGRAPH_END = ("gy", "ly", "ny", "ty", "sz", "zs", "cs", "dz")

def hu_twist(sur):
    """Magyar VEZETÉKNÉV játékos elcsavarása.

    Az ékezet-nyújtás itt nem működik: a „Nágy" nem poén, hanem elírásnak
    látszik. Helyette olyan végződést kap, amitől MÁSIK, de hihető magyar
    vezetéknév lesz — „Nagy" → „Nagyi", „Varga" → „Vargi", „Fazekas" →
    „Fazekasi". A magyar játékosok a legkockázatosabb csoport, náluk fontos,
    hogy a név tényleg más legyen, ne csak másképp ékezett."""
    s = sur
    low = s.lower()
    if low.endswith("y") and not low.endswith(HU_DIGRAPH_END):
        return s[:-1] + "i"                 # Buzánszky → Buzánszki
    if low.endswith("i"):
        return s + "ka"                     # Szalai → Szalaika
    if low.endswith(("a", "e")):
        return s[:-1] + "i"                 # Varga → Vargi
    if low.endswith(("o", "ó", "ő", "u", "ú", "ü", "ű", "á", "é")):
        return s + "ka"                     # Pető → Petőka
    return s + "i"                          # Nagy → Nagyi


def pool_given(seed):
    h = 0
    for ch in seed:
        h = (h * 131 + ord(ch)) & 0xFFFFFFFF
    return POOL[h % len(POOL)]
