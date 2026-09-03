# -*- coding: utf-8 -*-
"""A teljes HU_NAME_TABLE előállítása.

Két réteg:
  KÉZI  — a felismerhető nevek, a manual.py-ban, kézzel írva.
  GÉPI  — minden más, a rules.py szabályaiból, a nemzetiség szerinti kiejtéssel.

Kimenet: table.json + table.js (a beszúrható JS-tábla).
"""
import json, os, re, sys, collections, random
D = os.path.dirname(os.path.abspath(__file__)) + "/"
sys.path.insert(0, D)
from rules import (POOL as POOL_ALL, hufy, given_of, pool_given, lengthen, hu_twist, PARTICLES, strip_dia, LANG,
                   son_stem, son_suffix, SON_LANG)
from manual import MANUAL
from klubok import KLUBOK, LIGAK, ORSZAGOK

# ── az adat kinyerése az index.html-ből ────────────────────────────────────
# Szándékosan itt, és nem előre gyártott data.json-ból: így a szkript akkor is
# helyes marad, ha új klub-szezonok kerülnek a játékba. ÚJ KERET FELVÉTELE UTÁN
# EZT LE KELL FUTTATNI — az új játékosok különben valós néven jelennének meg.
SRC = os.path.join(D, "..", "..", "index.html")
_s = open(SRC, encoding="utf-8").read()
rec = {}
for n, pos, ovr, nat in re.findall(
        r'\{n:"([^"]+)",pos:\[([^\]]*)\],ovr:(\d+),nat:"([^"]*)"', _s):
    r = rec.setdefault(n, {"n": n, "ovr": 0, "cnt": 0, "nat": nat})
    r["ovr"] = max(r["ovr"], int(ovr)); r["cnt"] += 1
coaches = re.findall(r'\{n:"([^"]+)",era:', _s)
names = sorted(rec)
print(f"index.html: {len(names)} játékos, {len(coaches)} edző")
HUN = {n for n, r in rec.items() if r.get("nat") == "Magyarország"}


def hash_seed(s):
    h = 0
    for ch in s:
        h = (h * 131 + ord(ch)) & 0xFFFFFFFF
    return h


def cap(s):
    """A partikulás vezetéknevek egyetlen szóvá olvadnak: van Bommel →
       Vanbommel. Nagy kezdőbetű, a többi kicsi."""
    return (s[:1].upper() + s[1:].lower()) if s else s


def lang_of(n):
    return LANG.get((rec.get(n) or {}).get("nat", ""), "en")


def auto(n):
    """Gépi magyarítás → (teljes, rövid). Mindig MAGYAR sorrend: vezetéknév elöl."""
    lg = lang_of(n)
    parts = [p for p in re.split(r"[\s\-]+", n) if p]

    if len(parts) == 1:
        h = hufy(parts[0], lg)
        if strip_dia(h.lower()) == strip_dia(parts[0].lower()):
            h = lengthen(h)
        return h, h

    # a partikula a vezetéknévhez tapad: van der Sar → Vanderszár
    if strip_dia(parts[0].lower()) in PARTICLES:
        sur = cap("".join(hufy(p, lg) for p in parts))
        if strip_dia(sur.lower()) == strip_dia("".join(parts).lower()):
            sur = lengthen(sur)
        return sur, sur

    cut = len(parts) - 1
    for i in range(1, len(parts) - 1):
        if strip_dia(parts[i].lower()) in PARTICLES:
            cut = i
            break
    first, surw = parts[0], parts[cut:]
    if len(surw) == 1:
        # PATRONIM: a -son = fia (R2). A TŐ UGYANÚGY ÁTMEGY A FONETIKÁN, mint
        # bármely vezetéknév — enélkül nyers angol tő maradna („Johnfi”).
        _st = son_stem(surw[0]) if lg in SON_LANG else None
        if _st:
            _h = hufy(_st, lg)
            if strip_dia(_h.lower()) == strip_dia(_st.lower()):
                _h = lengthen(_h)
            sur = son_suffix(_h[0].upper() + _h[1:])
        else:
            sur = hufy(surw[0], lg)
            if strip_dia(sur.lower()) == strip_dia(surw[0].lower()):
                sur = lengthen(sur)
    else:
        sur = cap("".join(hufy(w, lg) for w in surw))
        if strip_dia(sur.lower()) == strip_dia("".join(surw).lower()):
            sur = lengthen(sur)
    g = given_of(first) or pool_given(n)
    return f"{sur} {g}", sur


def hungarian(n):
    """A DB magyar nevei. A sorrend már jó (VEZETÉKNÉV + Keresztnév); a
       vezetéknevet nyújtjuk meg, a keresztnevet becézzük — ez adja a
       „Gyorsiccs Gyuszika"-féle hangzást."""
    parts = n.split()
    if len(parts) < 2:
        return hu_twist(n), hu_twist(n)
    sur, giv = parts[0], parts[1]
    sur2 = hu_twist(sur)
    return f"{sur2} {becez(giv)}", sur2


BECE = {
 "Ferenc":"Ferkó","Gyula":"Gyuszi","Nándor":"Nándika","József":"Jocó","Sándor":"Sanyi",
 "Zoltán":"Zoli","Gábor":"Gabi","Dániel":"Dani","Balázs":"Balus","Lajos":"Lali",
 "István":"Pista","László":"Laci","János":"Jancsi","Péter":"Peti","Attila":"Attus",
 "Tamás":"Tomi","Zsolt":"Zsoltika","Ádám":"Ádi","Krisztián":"Kriszti","Roland":"Roli",
 "Dénes":"Dini","Márton":"Marci","Máté":"Matyi","Bence":"Bencus","Dominik":"Domi",
 "Antal":"Tóni","Béla":"Béci","Kálmán":"Kálmus","Jenő":"Jenci","Dezső":"Dezsőke",
 "Ottó":"Ottóka","Vilmos":"Vili","Endre":"Bandi","András":"Bandi","Mihály":"Miska",
 "Miklós":"Miki","Károly":"Karcsi","Imre":"Imus","Ernő":"Ernőke","Elemér":"Elemérke",
 "Barnabás":"Barni","Gergely":"Gergő","Gergő":"Gergőke","Levente":"Leve","Márk":"Márkó",
 "Norbert":"Norbi","Richárd":"Ricsi","Szabolcs":"Szabi","Ákos":"Ákoska","Áron":"Áronka",
 "Csaba":"Csabi","Erik":"Erikó","Kristóf":"Kristi","Martin":"Martinka","Milán":"Milánka",
 "Patrik":"Patcsi","Tibor":"Tibi","Zsombor":"Zsombi","Bálint":"Bálintka","Botond":"Boti",
}
def becez(g):
    if g in BECE: return BECE[g]
    if g.endswith(("a","e")): return g + "ka"
    return g + "ka"


table, src = {}, {}
for n in names:
    if n in MANUAL:
        table[n], src[n] = MANUAL[n], "kézi"
    elif n in HUN:
        table[n], src[n] = hungarian(n), "magyar"
    else:
        table[n], src[n] = auto(n), "gépi"
# A keretekben NEM szereplő, de a képernyőn megjelenő valós nevek
# (scoutok, akadémiai ikon-kacsintások) — a végponti próba találta meg őket.
for k in MANUAL:
    if k not in table:
        table[k], src[k] = MANUAL[k], "kézi"
EXTRA_KEYS = True

for c in coaches:
    if c in MANUAL:
        table[c], src[c] = MANUAL[c], "kézi"
    elif c not in table:
        table[c] = hungarian(c) if re.match(r"^[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]+ [A-ZÁÉÍÓÖŐÚÜŰ]", c) and " " in c and c.split()[0] not in ("Sir","Pep","José","Marco","Arrigo","Bernd","Johan") else auto(c)
        src[c] = "gépi"

# ── DURVA SZÓ SZŰRŐJE ──────────────────────────────────────────────────────
# A fonetikus szabályok véletlenül trágár alakot is kidobhatnak (Fazio →
# „Faszio"). Ez a szűrő elkapja őket; a találatokat a manual.py CLEAN blokkja
# írja felül kézzel. Ha ez a lista nem üres, a build hangosan szól.
DURVA = ["fasz", "picsa", "kurva", "segg", "geci", "buzi", "köcsög", "pina"]
_durva = [(n, table[n][0]) for n in table
          if any(w in table[n][0].lower() for w in DURVA)]
if _durva:
    print("!! DURVA ALAK, kézi felülírás kell:", _durva)

# ── AZONOS TELJES NÉV FELOLDÁSA ────────────────────────────────────────────
# A DB több névütközést SZÁNDÉKOSAN szétválasztva tárol (Pedro Mendes és
# Pedro Filipe Mendes, Edmílson és Édmilson két külön ember). Ha a magyarítás
# ugyanazt a nevet adná nekik, a szétválasztás elveszne — és a careerPool
# névvel kulcsol, tehát a játékban is összeolvadnának a szemünk előtt.
# Ezért a másodiktól kezdve MÁS keresztnevet kap, aki ütközne.
_seen = {}
for n in sorted(table):
    full, sh = table[n]
    if full not in _seen:
        _seen[full] = n
        continue
    parts = full.split()
    for k in range(1, len(POOL_ALL) + 1):
        g2 = POOL_ALL[(hash_seed(n) + k) % len(POOL_ALL)]
        cand = (" ".join(parts[:-1]) + " " + g2) if len(parts) > 1 else (full + " " + g2)
        if cand not in _seen:
            break
    table[n] = (cand, sh if len(parts) > 1 else cand)
    _seen[cand] = n

# ── ellenőrzések ────────────────────────────────────────────────────────────
same = [n for n in table if table[n][0] == n]
print("összesen:", len(table), dict(collections.Counter(src.values())))
print("VÁLTOZATLANUL MARADT:", len(same), same[:15])

short = collections.Counter(v[1] for v in table.values())
coll = {s: c for s, c in short.items() if c > 1}
print("ütköző rövid alak:", len(coll), "→ ennyi név megy ki teljes néven:",
      sum(c for c in coll.values()))

# ── beírás az index.html-be ────────────────────────────────────────────────
def _js(x):
    return '"' + x.replace("\\", "\\\\").replace('"', '\\"') + '"'

_tbl = "\n".join(f" {_js(k)}:[{_js(table[k][0])},{_js(table[k][1])}]," for k in sorted(table))
_html = open(SRC, encoding="utf-8").read()
_pat = re.compile(r"(const HU_NAME_TABLE=\{\n).*?(\n\};)", re.S)
if not _pat.search(_html):
    raise SystemExit("nem találom a HU_NAME_TABLE blokkot az index.html-ben")
open(SRC, "w", encoding="utf-8").write(
    _pat.sub(lambda m: m.group(1) + _tbl + m.group(2), _html, count=1))
print(f"index.html frissítve — {len(table)} név a HU_NAME_TABLE-ben")

# ── KLUB- ÉS LIGANEVEK ─────────────────────────────────────────────────────
# A hárombetűs kódot EGYEDIVÉ tesszük: két klub azonos kódja az
# eredményjelzőn megkülönböztethetetlen lenne. Kézzel nem kell rá figyelni,
# de a build kiírja, hol kellett hozzányúlnia.
_ab, _klub = {}, {}
for _c in sorted(KLUBOK):
    _nev, _kod = KLUBOK[_c]
    if _kod in _ab:
        _alap = _kod
        for _i in range(2, 40):
            _uj = (_kod[:2] + str(_i)) if _i < 10 else (_kod[:1] + str(_i))
            if _uj not in _ab:
                _kod = _uj
                break
        print(f"   kód-ütközés: {_c} {_alap} -> {_kod} (foglalta: {_ab[_alap]})")
    _ab[_kod] = _c
    _klub[_c] = (_nev, _kod)

_dupn = collections.Counter(v[0] for v in _klub.values())
_dupn = {k: c for k, c in _dupn.items() if c > 1}
if _dupn:
    print("!! AZONOS KLUBNÉV két klubon:", _dupn)

_html = open(SRC, encoding="utf-8").read()
for _mark, _rows in (
    ("HU_CLUB_TABLE",
     "\n".join(f" {_js(k)}:[{_js(_klub[k][0])},{_js(_klub[k][1])}]," for k in sorted(_klub))),
    ("HU_LEAGUE_TABLE",
     "\n".join(f" {_js(k)}:{_js(LIGAK[k])}," for k in sorted(LIGAK))),
    # ORSZÁGNEVEK: a válogatott-keretek „klub" neve ÉS a játékosok
    # nemzetisége ugyanabból a táblából megy ki — a kettő egymás mellett
    # látszik, tehát nem lehet csak az egyiket magyarítani.
    ("HU_NAT_TABLE",
     "\n".join(f" {_js(k)}:{_js(ORSZAGOK[k])}," for k in sorted(ORSZAGOK))),
):
    _p = re.compile(r"(const " + _mark + r"=\{\n).*?(\n\};)", re.S)
    _m = _p.search(_html)
    if not _m:
        raise SystemExit("nem találom a " + _mark + " blokkot")
    # ── ŐR: NE NYELJEN LE FÉL FÁJLT ────────────────────────────────────────
    # A minta `.*?`-vel keres a KÖVETKEZŐ "\n};"-ig. Ha a blokk ÜRESEN áll
    # ("const X={\n};"), a nyitó újsort már a csoport elvitte, tehát a keresés
    # ÁTFUT a fájl következő "};" soráig — és a csere mindent kitöröl közte.
    # MEGTÖRTÉNT: egy üres HU_NAT_TABLE helyőrzőtől 16 452 sor tűnt el az
    # index.html-ből. A hiba némán ment volna tovább (a szintaxis is helyes
    # maradt), ezért itt áll meg.
    _sorok = _m.group(0).count("\n")
    if _sorok > max(4000, len(_rows.split("\n")) * 3 + 50):
        raise SystemExit(f"{_mark}: a talált blokk {_sorok} sor — ez túl sok, "
                         f"a helyőrző valószínűleg ÜRES. Tegyél bele egy sort.")
    _html = _p.sub(lambda m: m.group(1) + _rows + m.group(2), _html, count=1)
open(SRC, "w", encoding="utf-8").write(_html)
print(f"klub: {len(_klub)} · liga: {len(LIGAK)} · ország: {len(ORSZAGOK)}")

random.seed(11)
for cimke, db in (("gépi", 20), ("kézi", 10)):
    pool = [n for n in names if src.get(n) == cimke]
    if not pool:
        continue
    print(f"\n— {cimke} minta —")
    for n in random.sample(pool, min(db, len(pool))):
        print(f"  {n:30s} → {table[n][0]}")
