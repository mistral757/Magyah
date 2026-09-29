#!/usr/bin/env python3
"""🔢 A PIXEL TÉMA SZÁMJEGY-BETŰJE (3.9.172) — „Magyah Pixszám".

BEJELENTETT HIBA: „A pici 5-ös, 8-as, 3-as és 2-es nagyon összetéveszthető a
pixelated témában. Csak a kicsi számok, de abból azért van bőven."

Az ok: a Pixelify Sans számjegyei kis méretben ugyanarra a sziluettre esnek
(lekerekített tető, középső derék, lekerekített talp) — 10-12 px-en a 2, 3, 5
és 8 egy „S8"-szerű foltot ad.

A megoldás: egy csak számjegyekből álló, 5×7-es rácsra rajzolt betű, ahol a
négy veszélyes jegy SZÁNDÉKOSAN más-más formát kap:
  · 2 — kerek tető, átló, LAPOS TALP;
  · 3 — LAPOS TETŐ, átlós törés, kerek talp (nincs zárt hurok);
  · 5 — LAPOS TETŐ + BAL OLDALI FAL, nyitott has;
  · 8 — két ZÁRT hurok, keskeny derék.
A méretek a Pixelify számjegyeihez igazodnak (tető 631, előtolás 586
egység), tehát a jegyek pontosan a régi helyükre ülnek, a táblázatos
igazítás is marad. Két súly: 400 és 700 (a vastag a képpontokat jobbra
szélesíti — a klasszikus pixel-félkövér).

Futtatás:  python3 tools/pixszam/build.py   → fonts/pixszam-400.woff2, -700.woff2
"""
import os
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

GYOKER = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

JEGYEK = {
 "0": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
 "1": ["..#..", ".##..", "#.#..", "..#..", "..#..", "..#..", "#####"],
 "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
 "3": ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
 "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
 "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
 "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
 "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
 "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
 "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
}
UPM = 1000
TETO = 631                 # a Pixelify számjegyeinek teteje
CELLA = TETO / 7           # ≈ 90 egység egy képpont
ELOTOLAS = 586             # a Pixelify számjegy-előtolása (táblázatos)
BAL = round((ELOTOLAS - 5 * CELLA) / 2)


def rajz(minta, vastag):
    pen = TTGlyphPen(None)
    ext = CELLA * 0.34 if vastag else 0   # a félkövér jobbra hízik
    for r, sor in enumerate(minta):
        y1 = round(TETO - r * CELLA)
        y0 = round(TETO - (r + 1) * CELLA)
        c = 0
        while c < 5:
            if sor[c] != "#":
                c += 1
                continue
            k = c
            while k < 5 and sor[k] == "#":
                k += 1
            x0 = round(BAL + c * CELLA)
            x1 = round(BAL + k * CELLA + ext)
            # óramutatóval megegyező kontúr (TrueType)
            pen.moveTo((x0, y0)); pen.lineTo((x0, y1)); pen.lineTo((x1, y1)); pen.lineTo((x1, y0))
            pen.closePath()
            c = k
    return pen.glyph()


def epit(suly):
    vastag = suly >= 700
    nevek = [".notdef"] + ["d" + j for j in JEGYEK]
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(nevek)
    fb.setupCharacterMap({ord(j): "d" + j for j in JEGYEK})
    glyfok = {".notdef": TTGlyphPen(None).glyph()}
    for j, m in JEGYEK.items():
        glyfok["d" + j] = rajz(m, vastag)
    fb.setupGlyf(glyfok)
    fb.setupHorizontalMetrics({n: (ELOTOLAS if n != ".notdef" else 500, BAL if n != ".notdef" else 0) for n in nevek})
    fb.setupHorizontalHeader(ascent=920, descent=-280)
    csalad = "Magyah Pixszam"
    fb.setupNameTable({"familyName": csalad, "styleName": "Bold" if vastag else "Regular",
                       "copyright": "Magyah — saját rajz, szabadon használható a játékkal"})
    fb.setupOS2(sTypoAscender=920, sTypoDescender=-280, usWinAscent=922, usWinDescent=289,
                usWeightClass=suly, fsSelection=0x20 if vastag else 0x40)
    fb.setupPost()
    fb.font["head"].macStyle = 1 if vastag else 0
    fb.font.flavor = "woff2"
    ki = os.path.join(GYOKER, "fonts", f"pixszam-{suly}.woff2")
    fb.save(ki)
    return ki, os.path.getsize(ki)


if __name__ == "__main__":
    for s in (400, 700):
        print(*epit(s))
