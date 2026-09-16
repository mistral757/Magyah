# -*- coding: utf-8 -*-
"""KETTŐZÖTT SZEMÉLY — a háló, ami a 29. kötegnél hiányzott.

MI A HIBA, AMIT KERES. Az adatbázisban egy VALÓDI ember több klub-szezonban is
szerepelhet — ez szándékos, és a karrier-regiszter (CAREER_PLAYERS) épp a NÉVRE
kulcsolva fűzi őket egyetlen személlyé. Ha viszont ugyanaz az ember KÉT KÜLÖNBÖZŐ
kanonikus néven kerül be (Andrij Sevcsenko ÉS Andriy Shevchenko), akkor a
regiszter két külön embernek látja: két külön POT-ot, két külön kort, két külön
karriert kap, és egyszerre lehet mindkettő a keretedben.

MIÉRT NEM FOGTA MEG A BUILD. A build.py azt nézi, hogy két KÜLÖNBÖZŐ kanonikus
név ne kapjon AZONOS magyar nevet. Itt fordítva történt: a két írásmód két
KÜLÖNBÖZŐ magyar nevet kapott („Sebcselló Bandi" és „Sebcselló Andris"), tehát a
build elégedett volt. A kettőzés a kanonikus oldalon él, ott is kell keresni.

HOGYAN KERES. Azonos SZÜLETÉSI ÉV + azonos NEMZETISÉG + hangzásra egyező
VEZETÉKNÉV. A vezetéknév helyét a nemzetiség dönti: magyar névnél elöl áll,
máshol hátul. A hangzás-közelítés a leggyakoribb átírási eltéréseket vezeti
egy alakra (sh/s, ch/cs, y/i, w/v, ph/f…).

AZ ISMERT IKERPÁROK KIVÉTELEK. Van, amikor a három egyezés ellenére tényleg két
emberről van szó — ikrek, illetve azonos évben született névrokonok. Ezek itt,
névvel és indoklással állnak; új felvételkor ide kell írni azt is, ami ránézésre
gyanús, de nem az.

    python3 tools/nevek/kettozes.py      # kilépési kód 1, ha talált
"""
import re, io, os, sys, itertools, unicodedata

D = os.path.dirname(os.path.abspath(__file__)) + "/"
SRC = os.path.join(D, "..", "..", "index.html")

# ── ISMERT, VALÓDI NÉVROKONOK ──────────────────────────────────────────────
# (kanonikus név, kanonikus név) — ABC-sorrendben, hogy egyértelmű legyen.
NEVROKON = {
    ("Antonio Filippini", "Emanuele Filippini"):  "ikrek, mindketten a Bresciában",
    ("Frank de Boer", "Ronald de Boer"):          "ikrek, Ajax és Barcelona",
    ("Jozef Čapkovič", "Ján Čapkovič"):           "ikrek, a Slovan 68/69-es kerete",
    ("André Alves", "Dani Alves"):                "két külön brazil, azonos évjárat",
    ("Alberto Moreno", "Gerard Moreno"):          "két külön spanyol, azonos évjárat",
    ("Juhász István", "Nyírő István"):            "két külön magyar, a keresztnév egyezik",
    # Az egynevű-próba (lásd sorrendfuggetlen) hozza fel: mindkettő spanyol,
    # mindkettő 1977-es, mindkettőt Raúlnak hívják — de a Real/Schalke Raúlja
    # Raúl González Blanco, az Espanyolé pedig Raúl Tamudo. Két külön ember.
    ("Raúl", "Raúl Tamudo"):                      "Raúl González és Raúl Tamudo, azonos évjárat",
}

ATIRAS = [("sh","s"),("ch","cs"),("kh","h"),("zh","zs"),("ts","c"),("y","i"),
          ("j","i"),("w","v"),("cz","c"),("sz","s"),("cs","s"),("gy","g"),
          ("ck","k"),("q","k"),("x","ks"),("ph","f"),("th","t"),("ee","i"),
          ("oo","u"),("ou","u"),("aa","a")]


def fold(x):
    x = unicodedata.normalize("NFD", x.lower())
    x = "".join(c for c in x if unicodedata.category(c) != "Mn")
    for a, b in ATIRAS:
        x = x.replace(a, b)
    return re.sub(r"[^a-z]", "", x)


def vezeteknev(nev, nemzet):
    """Magyar névnél elöl, máshol hátul — egyetlen szónál mindegy."""
    r = nev.split()
    if len(r) == 1:
        return r[0]
    return r[0] if nemzet == "Magyarország" else r[-1]


def tokenek(nev):
    """A név összes szava, hangzásra hozva (a hárombetűsnél rövidebbek nélkül)."""
    return frozenset(fold(x) for x in nev.split() if len(fold(x)) >= 3)


def sorrendfuggetlen(a, b):
    """KÉT LYUK A POZÍCIÓS ÖSSZEHASONLÍTÁSON — mindkettő élesben derült ki.

    1. FORDÍTOTT NÉVSORREND. Ugyanaz az ember bekerülhet magyar sorrendben is
       („Kerkez Milos", a válogatott keretéből) és nyugatosan is („Miloš
       Kerkez", a klubjáéból). Ilyenkor az egyiknél a vezetéknév az ELSŐ szó, a
       másiknál az UTOLSÓ, tehát a pozíciós próba SOHA nem talál egyezést. A
       31. kötegnél pontosan ez történt: a háló tisztát jelentett, közben két
       Kerkez volt bent.

    2. EGYNEVŰ KONTRA TELJES NÉV. A spanyol és brazil egynevűek („Pedro",
       „Joaquín", „Fran") ugyanannak az embernek a rövid alakjai, mint a teljes
       nevű bejegyzés („Pedro Rodríguez", „Joaquín Sánchez", „Fran González").

    AMIT SZÁNDÉKOSAN NEM NÉZ: a puszta KERESZTNÉV-egyezést. „Paul Gascoigne" és
    „Paul Ince" azonos évjáratú angol — a közös keresztnév nem jelent semmit, és
    ötven ilyen párral a háló használhatatlanná válna."""
    ta, tb = tokenek(a), tokenek(b)
    if not ta or not tb:
        return False
    # (2) egynevű: az EGYETLEN szava megjelenik a másik nevében
    if len(ta) == 1 or len(tb) == 1:
        return bool(ta & tb)
    # (1) fordított sorrend: az egyik ELSŐ szava a másik UTOLSÓ szava
    ea, ua = fold(a.split()[0]), fold(a.split()[-1])
    eb, ub = fold(b.split()[0]), fold(b.split()[-1])
    return (ea == ub and ua == eb)


def main():
    s = io.open(SRC, encoding="utf-8").read()
    i = s.index("const SQUADS=")
    j = s.index("\nconst OPPONENTS=", i)
    nat = {}
    for n, nn in re.findall(
            r'\{n:"([^"]+)",pos:\[[^\]]*\],ovr:\d+,nat:"([^"]*)"', s[i:j]):
        nat[n] = nn
    by = s[s.index("const BIRTH_YEAR={"):s.index("/* Fallback: ismeretlen")]
    birth = {k.replace("\\'", "'"): int(v)
             for k, v in re.findall(r'"((?:[^"\\]|\\.)*)":(\d{4})', by)}

    nevek = [n for n in nat if n in birth]
    csoport = {}
    for n in nevek:
        csoport.setdefault((birth[n], nat[n]), []).append(n)

    talalat = []
    for (ev, orszag), lista in csoport.items():
        if len(lista) < 2:
            continue
        for a, b in itertools.combinations(sorted(lista), 2):
            va, vb = fold(vezeteknev(a, orszag)), fold(vezeteknev(b, orszag))
            egyezik = va == vb or (len(va) >= 5 and len(vb) >= 5
                                   and (va.startswith(vb) or vb.startswith(va)))
            # …és a két SORRENDFÜGGETLEN eset (lásd ott).
            if not egyezik:
                egyezik = sorrendfuggetlen(a, b)
            if egyezik and (a, b) not in NEVROKON:
                talalat.append((ev, orszag, a, b))

    print(f"vizsgált név: {len(nevek)} (van születési éve és klub-kártyája)")
    print(f"ismert névrokon-kivétel: {len(NEVROKON)}")
    if not talalat:
        print("✓ nincs kettőzött személy az adatbázisban")
        return 0
    print(f"\n✗ {len(talalat)} GYANÚS PÁR — ugyanaz az ember két kanonikus néven?\n")
    for ev, o, a, b in sorted(talalat):
        print(f"  {ev}  {o:<16}  {a!r}  ≟  {b!r}")
    print("\nHa tényleg egy ember: EGY kulcsot kell megtartani (a keretekben, a")
    print("BIRTH_YEAR-ben és a manual.py-ban is), majd build.py.")
    print("Ha két külön ember: vedd fel a NEVROKON kivételek közé, indoklással.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
