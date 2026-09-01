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
 "Franciaország":"fr","Belgium":"nl","Hollandia":"nl","Suriname":"nl",
 "Lengyelország":"sl","Csehország":"sl","Szlovákia":"sl","Oroszország":"sl",
 "Ukrajna":"sl","Horvátország":"sl","Szerbia":"sl","Bosznia-Hercegovina":"sl",
 "Szlovénia":"sl","Montenegró":"sl","Észak-Macedónia":"sl","Bulgária":"sl",
 "Fehéroroszország":"sl","Törökország":"tr","Görögország":"gr",
 "Svédország":"sc","Norvégia":"sc","Dánia":"sc","Izland":"sc","Finnország":"sc",
 "Magyarország":"hu","Románia":"ro",
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

PRE = str.maketrans({
 "ć":"cs","č":"cs","ç":"cs","š":"s","ș":"s","ş":"s","ž":"zs","ź":"zs","ż":"zs",
 "ř":"rzs","ñ":"ny","ń":"ny","ø":"ő","å":"ó","æ":"e","ł":"l","đ":"gy","ð":"d",
 "þ":"t","ě":"e","ė":"e","ę":"e","ą":"a","ů":"ú","ı":"i","ğ":"","ý":"i","ÿ":"i",
 "ß":"sz","õ":"ó","ã":"a","â":"á","ê":"é","î":"i","ô":"ó","û":"u","ë":"e","ï":"i",
})

def hufy(w, lang="en"):
    """Egy szó magyaros fonetikus átirata, nyelvfüggő kiejtéssel."""
    if not w:
        return w
    cap = w[0].isupper()
    s = w.lower().translate(PRE)

    # végződések
    s = re.sub(r"(ovi[cć]|ovich|ovics)$", "ics", s)
    s = re.sub(r"(sky|ski)$", "szki", s)
    s = re.sub(r"(escu)$", "eszku", s)
    if lang == "es":
        s = re.sub(r"ez$", "esz", s)

    # ch — a legerősebben nyelvfüggő hang
    if lang in ("it",):
        s = s.replace("chi", "ki").replace("che", "ke").replace("ch", "k")
    elif lang == "fr":
        s = s.replace("ch", "s")
    elif lang == "es":
        s = s.replace("ch", "cs")
    else:
        s = re.sub(r"ch(?=[bcdfgklmnprstvz])", "k", s)   # Chris → Krisz
        s = s.replace("ch", "cs")

    # a baszk/katalán „tx" magyarul cs (Goikoetxea → Goikocsea). Az x→ksz
    # szabály elé kell, különben kiejthetetlen mássalhangzó-torlódás lesz.
    s = s.replace("tx", "cs").replace("tz", "c")
    for a, b in [("sch","s"),("sh","s"),("cz","cs"),("th","t"),("ph","f"),
                 ("ck","kk"),("gh","g"),("qu","kv"),("gn","ny"),("gli","lyi"),
                 ("ee","í"),("oo","ú"),("ou","ú"),("ea","í"),("oa","ó"),
                 ("ai","áj"),("ay","éj"),("ey","i"),("ie","i"),
                 ("ss","ssz"),("ll","ly"),("x","ksz"),("w","v"),("q","k")]:
        s = s.replace(a, b)

    if lang == "de":
        s = s.replace("ei", "áj").replace("eu", "oj").replace("z", "c")
        s = re.sub(r"^s(?=[pt])", "s", s)
        s = re.sub(r"v", "f", s)
    elif lang == "fr":
        s = re.sub(r"j", "zs", s)
        s = re.sub(r"(ault|aud|aut)$", "ó", s)
        s = re.sub(r"er$", "é", s)
    elif lang == "es":
        s = re.sub(r"j", "h", s)
        s = re.sub(r"^h", "", s)
        s = s.replace("z", "sz")
    elif lang == "pt":
        s = re.sub(r"ão$", "án", s)
        s = s.replace("nh", "ny").replace("lh", "ly")
    elif lang == "it":
        s = re.sub(r"ci(?=[aou])", "cs", s)
        s = re.sub(r"gi(?=[aou])", "dzs", s)
        s = s.replace("ge", "dzse").replace("gi", "dzsi")
    elif lang == "tr":
        s = s.replace("c", "dzs")

    # c ejtése (ami eddig megmaradt)
    s = re.sub(r"c(?=[eiéí])", "sz", s)
    s = re.sub(r"c(?![sz])", "k", s)
    # y
    s = re.sub(r"y(?=[aeiouáéíóú])", "j", s)
    s = s.replace("y", "i")
    # néma szóvégi e (angol/francia) — de a 2-3 betűs szavakból nem, mert
    # abból nem marad semmi („Le" → „L")
    if lang in ("en", "fr") and len(s) > 3:
        s = re.sub(r"(?<=[a-zíóúűő])e$", "", s)

    s = fold(s)
    s = re.sub(r"(.)\1{2,}", r"\1\1", s)      # hármas betűzés összevonása
    if not s:
        s = fold(w.lower())
    return s[0].upper() + s[1:] if cap else s


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
