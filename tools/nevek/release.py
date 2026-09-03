# -*- coding: utf-8 -*-
"""KIADÁSI BUILD — a valós nevek eltávolítása a szállított fájlból.

MIÉRT KELL. A megjelenítés magyarított, de a repóbeli index.html TARTALMAZZA a
valós neveket: kulcsként (SQUADS n:, BIRTH_YEAR, HU_NAME_TABLE, CLUB_ABBR), a
klubtörténetekben (note:) és a kódkommentekben. Egy „forrás megtekintése"
mindet megmutatja. A képernyő tiszta, az adat nem az.

MIT CSINÁL. Minden valós nevet ÁTLÁTSZATLAN AZONOSÍTÓRA cserél az egész
fájlban:

    {n:"Lionel Messi",…}                    →  {n:"p1874",…}
    "Lionel Messi":1987                     →  "p1874":1987
    "Lionel Messi":["Lijonel Messzi","Messzi"] → "p1874":["Lijonel Messzi","Messzi"]
    {club:"Real Madrid CF",…}               →  {club:"c118",…}

A játék ettől ugyanúgy működik: a kulcs kulcs marad, csak nem beszédes. A
kiírás továbbra is a HU_NAME_TABLE-ből jön.

Emellett kiüríti a klubtörténeteket, kikapcsolja a rejtett névmód-kapcsolót
(azonosítókra visszaváltani értelmetlen volna), és eltávolítja a kommenteket
— azokban 2600+ helyen szerepel valós név.

MI AZ ÁRA. A kiadott és a családi verzió KÉT KÜLÖN TERMÉK: a mentéseik nem
cserélhetők (más a kulcstér), és közös világot sem lehet játszani a kettő
között. A repóban lévő index.html marad a családi verzió, érintetlenül.

    python3 tools/nevek/release.py        →  dist/index.html
"""
import json, os, re, sys, collections, hashlib

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(D, "..", ".."))
SRC = os.path.join(ROOT, "index.html")
OUTDIR = os.path.join(ROOT, "dist")
OUT = os.path.join(OUTDIR, "index.html")

sys.path.insert(0, D)
from klubok import KLUBOK, LIGAK

s = open(SRC, encoding="utf-8").read()

# ── 1. AZ ÖSSZES VALÓS NÉV ÖSSZEGYŰJTÉSE ───────────────────────────────────
# A HU_NAME_TABLE kulcsai a mérvadók: oda MINDEN személynév bekerült (keret,
# edző, scout, akadémiai ikon). Ha egy név nincs benne, a leak.js elkapja.
tbl_keys = set(re.findall(r'\n "((?:[^"\\]|\\.)+)":\["', s))
squad_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)+)",pos:', s))
coach_names = set(re.findall(r'\{n:"((?:[^"\\]|\\.)+)",era:', s))
birth_names = set(re.findall(r'"((?:[^"\\]|\\.)+)":1[89]\d\d', s))

clubs = set(KLUBOK) | set(re.findall(r'\{club:"((?:[^"\\]|\\.)+)",season:', s))
# A KITALÁLT liganevek maradnak: a piramis saját osztályai a játék saját
# szókincse — nincs mit elrejteni.
#
# AZ „NB I" VISZONT KIKERÜLT INNEN. Eddig itt szerepelt, azzal az indoklással,
# hogy nem valós szervezet neve — ez tévedés volt: az a magyar élvonal valódi
# megnevezése, és a kivétel miatt a KIADOTT fájlban NYERSEN benne maradt (a
# tizenhét magyar klub-szezon `league:` mezőjében). A 3.9.13 a megjelenítést
# már megoldotta (leagueLabel), a kiadási strip viszont átlépett rajta.
#
# A 3.9.28-ban átnevezett osztályok VISZONT idekerültek: a „Magyah Élmezőny",
# „Magyah Másodosztály" és „Magyah Harmadosztály" a játék saját szókincse,
# nem valós liga — enélkül az önellenőrzés valós névként jelentené őket.
KITALALT = {"Válogatott", "kis pénz kis foci",
            "mennyei megyei", "Biszem-baszom másodosztály", "Biszem-baszom premier líg",
            "Magyah Élmezőny", "Magyah Másodosztály", "Magyah Harmadosztály",
            "Egyéb"}
leagues = (set(LIGAK) | set(re.findall(r'league:"((?:[^"\\]|\\.)+)"', s))) - KITALALT

persons = (tbl_keys | squad_names | coach_names | birth_names) - clubs - leagues - KITALALT
# A három betűnél rövidebb „nevek" a regexek melléktermékei, nem nevek.
persons = {n for n in persons if len(n) >= 4}
# A HU_NAME_TABLE kulcsai közt klubnév nincs, de a biztonság kedvéért szűrünk.

print(f"személynév: {len(persons)} · klub: {len(clubs)} · liga: {len(leagues)}")

# ── 2. AZONOSÍTÓK ──────────────────────────────────────────────────────────
# Determinisztikus, a névből számolva: két futás ugyanazt adja, tehát a
# kiadott buildek mentései kompatibilisek maradnak egymással.
def ident(prefix, name):
    h = hashlib.sha1(name.encode("utf-8")).hexdigest()[:8]
    return f"{prefix}{h}"

ren = {}
for n in persons:
    ren[n] = ident("p", n)
for c in clubs:
    ren[c] = ident("c", c)
for l in leagues:
    ren[l] = ident("l", l)

# ütközés-ellenőrzés: két KÜLÖNBÖZŐ név nem kaphat azonos azonosítót
back = collections.defaultdict(list)
for k, v in ren.items():
    back[v].append(k)
dup = {v: ks for v, ks in back.items() if len(ks) > 1}
if dup:
    raise SystemExit(f"AZONOSÍTÓ-ÜTKÖZÉS: {dup}")

# ── 3. CSERE A SZÖVEGLITERÁLOKBAN ──────────────────────────────────────────
# Csak IDÉZŐJELES előfordulást cserélünk — a nevek mind string-literálként
# állnak a táblákban. A hosszabb neveket előbb, hogy a rövidebb ne vágja
# ketté („Oscar" ne rontsa el az „Oscar Bernardi"-t).
def esc_js(x):
    return x.replace("\\", "\\\\").replace('"', '\\"')

n_sub = 0
for name in sorted(ren, key=len, reverse=True):
    # Az aposztróf a forrásban helyenként ESCAPE-ELVE áll ("Michel Preud\\'homme"),
    # ezért mindkét alakot próbáljuk — enélkül az a név bent maradna.
    for lit in ('"' + esc_js(name) + '"',
                '"' + esc_js(name).replace("'", "\\'") + '"'):
        if lit in s:
            n_sub += s.count(lit)
            s = s.replace(lit, '"' + ren[name] + '"')
print(f"lecserélt szövegliterál: {n_sub}")

# ── 4. KLUBTÖRTÉNETEK ──────────────────────────────────────────────────────
# A 3.9.04 óta a forrásban SINCS klubleírás (valós emberek nevét sorolták),
# tehát ez ma védőháló: ha valaki mégis visszatesz egyet, a kiadott fájlba ne
# kerüljön bele.
#
# A MINTA SZŰKÍTVE — EZ EGY VALÓDI HIBA JAVÍTÁSA. A régi, csupasz
# `note:"…"` minta MINDEN note mezőt kiürített, nem csak a klubokét: a
# képességszintek és a stábtagok leírásait is („30% esély védekező
# képességre", „kétszeres tempó · +20% hatékonyság"). Mérve: 556 mezőből 237
# ilyen volt — vagyis a kiadott build üres képességleírásokkal ment volna ki,
# és ez azért nem derült ki, mert a dist-et sosem játszotta végig senki. A
# klubrekordot a `col:[…]` előzmény azonosítja: csak ott van színpár.
s, n_note = re.subn(r'(col:\[[^\]]*\]),note:"(?:[^"\\]|\\.)*"', r'\1', s)
print(f"eltávolított klubtörténet: {n_note}")

# ── 5. A REJTETT NÉVMÓD-KAPCSOLÓ ───────────────────────────────────────────
# Azonosítókra visszaváltani értelmetlen volna (p1874-et mutatna), ezért a
# kiadott buildben a mező meg sem jelenik.
s, n_pass = re.subn(r'const HU_NAME_PASS="[^"]*";', 'const HU_NAME_PASS=null;', s)
if n_pass != 1:
    raise SystemExit("nem találom a HU_NAME_PASS konstanst")

# A fejléc alcímének valós nevű változata sem kell.
s = re.sub(r'const HDR_SUB_VALOS="[^"]*";', 'const HDR_SUB_VALOS=HDR_SUB_HU;', s)

# ── 6. KOMMENTEK ───────────────────────────────────────────────────────────
# 2600+ kommentben szerepel valós név. A kommentek eltávolítása
# string-, sablon- és regex-tudatos: egy naiv regex a szövegek belsejét is
# szétvágná (a note-okban és az URL-ekben is van „//").
def strip_comments(js):
    out = []
    i, n = 0, len(js)
    quote = None          # ' " ` vagy None
    depth = 0             # ${ } mélység sablonliterálban
    while i < n:
        c = js[i]
        if quote:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(js[i + 1]); i += 2; continue
            if c == quote:
                quote = None
            i += 1; continue
        if c in "'\"`":
            quote = c; out.append(c); i += 1; continue
        if c == "/" and i + 1 < n and js[i + 1] == "*":
            j = js.find("*/", i + 2)
            j = n if j < 0 else j + 2
            # a sortöréseket megtartjuk, hogy a sorszámok ne csússzanak el
            out.append("\n" * js.count("\n", i, j))
            i = j; continue
        if c == "/" and i + 1 < n and js[i + 1] == "/":
            j = js.find("\n", i)
            i = n if j < 0 else j
            continue
        out.append(c); i += 1
    return "".join(out)

a = s.index("\n<script>\n") + len("\n<script>\n")
b = s.index("\n</script>\n", a)
js = s[a:b]
js2 = strip_comments(js)
print(f"kommentek: {len(js)-len(js2)} karakterrel rövidebb")
s = s[:a] + js2 + s[b:]

# ── 7. ÍRÁS ÉS ELLENŐRZÉS ──────────────────────────────────────────────────
os.makedirs(OUTDIR, exist_ok=True)
open(OUT, "w", encoding="utf-8").write(s)

# ELLENŐRZÉS. A puszta „benne van-e a szövegben" téves találatot ad: a saját
# magyar neveink néha tartalmazzák az eredetit ("Aston Villany" → "Aston
# Villa", "1. FC Kölni" → "1. FC Köln"), és a rövid keresztnevek ("Gabi",
# "Joel") is felbukkannak bennük. Ezért csak azt számítjuk találatnak, ahol a
# név NEM egy magyarított név belsejében áll, és nem azonosítóban.
hun_nevek = set(re.findall(r'\["((?:[^"\\]|\\.)+)","', s))
def valos_talalat(nm):
    for m in re.finditer(re.escape(nm), s):
        koz = s[max(0, m.start() - 80):m.end() + 60]
        # magyarított néven belüli előfordulás → nem szivárgás
        if any(nm in h and h != nm and h in koz for h in hun_nevek):
            continue
        # szó belsejébe ágyazva (azonosító, ragozott magyar név) → nem az.
        # MINDKÉT oldalt nézzük: a „ttBest" a Best-et elöl ragasztja hozzá.
        elott = s[m.start() - 1:m.start()] or " "
        utan = s[m.end():m.end() + 1] or " "
        if re.match(r'[0-9A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű_]', utan) or \
           re.match(r'[0-9A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű_]', elott):
            continue
        return koz.replace("\n", " ")
    return None

maradt = []
for nm in sorted(ren):
    if nm in s:
        k = valos_talalat(nm)
        if k:
            maradt.append((nm, k))
print(f"\nfájl: {os.path.relpath(OUT, ROOT)} · {len(s)/1024/1024:.1f} MB "
      f"(forrás {os.path.getsize(SRC)/1024/1024:.1f} MB)")
if maradt:
    print(f"!! MÉG BENT VAN {len(maradt)} valós név:")
    for nm, k in maradt[:15]:
        print(f"   [{nm}] …{k[:120]}…")
    sys.exit(1)
print("✓ egyetlen valós név sem maradt a kiadott fájlban")
