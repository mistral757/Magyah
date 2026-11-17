#!/usr/bin/env python3
"""◈ A REFLEKTOR TÉMA CÍMBETŰJE (1.0.11.1.00) — „Exo 2 Cím".

MIÉRT KELL KÜLÖN FÁJL. A játék címbetűi (--font-disp) mindenhol 400-as súllyal
kérik a betűt, mert a többi téma címbetűje (Archivo Black, Anton) eleve kövér,
egyetlen súlyú fájl. A változó súlyú Exo 2 ugyanerre a kérésre a VÉKONY 400-at
adná: a „Magyah" főcím és az eredményjelző számai elvékonyodnának. A felület
több száz szabályát átírni kockázatos volna; helyette a címbetű itt is egy
rögzített súlyú fájl.

MIT CSINÁL. Az Exo 2 valódi KURZÍV változó betűjéből kiveszi a 800-as súlyt
(statikus példány), és arra a jelkészletre szűkíti, amit a játék használ
(latin + a magyar ékezetek + írásjelek, számok, nyilak). Az eredmény két
kis szelet, ugyanazzal a bontással, mint a többi betűnél:
    fonts/exo-2-cim-latin.woff2  ·  fonts/exo-2-cim-latin-ext.woff2

A FORRÁS az @fontsource-variable/exo-2 csomag (npm), SIL OFL 1.1; a licenc
megengedi a módosítást, fenntartott betűnév nincs (lásd fonts/OFL.txt).

Futtatás:
    npm i --prefix /tmp/exo2 @fontsource-variable/exo-2
    pip install fonttools brotli
    python3 tools/reflektor/betu.py /tmp/exo2/node_modules/@fontsource-variable/exo-2/files
"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SULY = 800
GYOKER = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SZELETEK = {
    # ugyanaz a két tartomány, mint az index.html @font-face blokkjaiban
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,"
             "U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
    # a latin-ext szeletből csak a magyar ő/ű kell (és a közép-európai nevek
    # leggyakoribb ékezetei) — a teljes szelet háromszor ekkora volna
    "latin-ext": "U+0100-017F,U+0218-021B,U+2020,U+2113",
}

def main(forras):
    for szelet, tartomany in SZELETEK.items():
        be = os.path.join(forras, f"exo-2-{szelet}-wght-italic.woff2")
        f = TTFont(be)
        f = instancer.instantiateVariableFont(f, {"wght": SULY})
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["kern", "liga", "tnum", "lnum", "pnum", "case"]
        opts.name_IDs = [1, 2, 3, 4, 6, 13, 14]
        opts.notdef_outline = True
        s = subset.Subsetter(opts)
        s.populate(unicodes=subset.parse_unicodes(tartomany))
        s.subset(f)
        ki = os.path.join(GYOKER, "fonts", f"exo-2-cim-{szelet}.woff2")
        f.flavor = "woff2"
        f.save(ki)
        print(f"{os.path.basename(ki):28} {os.path.getsize(ki):6} B  ({len(f.getGlyphOrder())} jel)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
