# -*- coding: utf-8 -*-
"""NÉVJAVASLAT ELŐTT: a felhasználó saját nevére nem készülhet javaslat (3.9.217)

    python3 tools/nevek/javaslat_ellenor.py "Paolo Maldini" "Rudi Völler" …
    python3 tools/nevek/javaslat_ellenor.py --blokkok

Az első alak a jelölteket nézi: aki a SAJAT_KULCSOK-ban van (a felhasználó maga
írta át), azt KIZÁRJA — a kilépési kód 1, ha volt ilyen. A mostani nevet és a
forrást is kiírja, hogy látszódjon, miért.

A --blokkok a manual.py JAVASLAT_* blokkjait nézi végig: melyik javaslatkör
nyúlt (valaha) a felhasználó saját nevéhez. Ez a múlt feltérképezése — a
build.py a SAJAT réteggel a jövőbeli felülírást amúgy is megakadályozza.
"""
import os, re, sys
D = os.path.dirname(os.path.abspath(__file__)) + "/"
sys.path.insert(0, D)
from sajat import SAJAT_KULCSOK, SAJAT, DONTESRE_VAR


def tabla():
    t = open(os.path.join(D, "..", "..", "index.html"), encoding="utf-8").read()
    i = t.find("const HU_NAME_TABLE={")
    j = t.find("\n};", i)
    return {m.group(1): (m.group(2), m.group(3))
            for m in re.finditer(r'^ ?"([^"]+)":\["([^"]*)","([^"]*)"\]', t[i:j], re.M)}


def blokkok():
    import manual
    hiba = 0
    for nev in sorted(n for n in dir(manual) if n.startswith("JAVASLAT_")):
        b = getattr(manual, nev)
        bele = [k for k in b if k in SAJAT_KULCSOK]
        if bele:
            hiba += len(bele)
            print(f"{nev}: {len(bele)} saját név — " + ", ".join(bele))
    print(f"\n{hiba} javaslat érintett saját nevet." if hiba else "✓ egyik javaslatblokk sem nyúl saját névhez.")
    return 0


def main(argv):
    if "--blokkok" in argv:
        return blokkok()
    T = tabla()
    rossz = 0
    for k in argv:
        if k in SAJAT_KULCSOK:
            rossz += 1
            most = T.get(k, ("?", "?"))[0]
            extra = " · DÖNTÉSRE VÁR (eredetileg: " + DONTESRE_VAR[k][0] + ")" if k in DONTESRE_VAR else ""
            print(f"✗ {k}: SAJÁT NÉV — „{most}” · {SAJAT_KULCSOK[k]}{extra}")
        elif k not in T:
            print(f"? {k}: nincs a névtáblában")
        else:
            print(f"✓ {k}: javasolható (most: „{T[k][0]}”)")
    return 1 if rossz else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
