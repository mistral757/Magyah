# 3.9.216 — 📈 A boostok POT-ja és a „+2 Rating” jutalom a mezőnnyel nő

> „a boostokat is igazítsd a mezőnyhöz"

## Ami eddig volt

A **Rating-ugrás** a mezőnnyel nőtt (`youthBoostScale` = mezőny/100), és ez
helyes is, mert a Rating lineáris. A **POT** viszont nem lineáris: a POT ↔ csúcs
görbén egy 150-es mezőny-szintű játékos POT-ja ~54 000, egy 400-asé
~1,5 millió. Ezért a régi lépték a POT-ugrást semmivé zsugorította:

| 400-as mezőny, 900 000-es ifi | régen | most |
|---|---|---|
| Ifi-boost POT | ~4 000–10 000 (0,6%) | ~640 000–1 600 000 |
| POT-boost | legfeljebb 10 000 | 639 000–6,4 millió (a kemény plafonig) |
| Sima boost POT | legfeljebb 2 500 | 256 000–1,6 millió |
| Kártya-fejlesztés jutalom | +2 Rating | +8 Rating |

## A szabály

**POT-ajándékok:** a szorzó `peakToPot(mezőny) ÷ peakToPot(85)`, legalább 1.
Ugyanez a mérce szolgál ki a kihívás POT-jutalmát is (3.9.213), és egy közös
függvényen (`potFieldScaleAt`) fut.

| Mezőny | Szorzó |
|---|---|
| ≤ 85 | 1 — **betűre a régi** |
| 100 | ~×3,1 |
| 150 | ~×23 |
| 400 | ~×640 |

**Hat rá:**

* az ifi-boost POT-sávja (1000–2500 × szorzó);
* az öreg-boost POT-sávja (1200–3000 × szorzó);
* a sima boost abszolút korlátai (400–2500 × szorzó);
* a POT-boost abszolút korlátai (1000–10 000 × szorzó).

A sima és a POT-boost **százalékos** része amúgy is a játékos saját POT-jával
arányos, ez nem változott. A 🧿 Csodaszer szorzója továbbra is rájön.

**A felső határ** a kemény POT-plafon (`potHardCap`), ami 3.9.212 óta szintén a
mezőnnyel nő. Egy ajándék lefelé sosem visz.

**A Rating-ugrás nem változott.** Ugyanúgy mezőny/100, mert az lineáris.

## A kártya-fejlesztés jutalom

A „+2 Rating” mostantól az ifi-boost Rating-léptékével nő (mezőny/100,
legalább 1):

| Mezőny | Jutalom |
|---|---|
| ≤ 100 | +2 |
| 150 | +3 |
| 400 | +8 |

**Az összeg a felajánláskor rögzül.** A kártya azt írja, amit ad, és a
szezonkártyák utánra halasztott kifizetés is pontosan azt adja
(`S.pendingCardUpR`, a mentéssel utazik). Egy régi mentés összeg nélküli függő
fejlesztése +2 marad.

## A felület

A valódi, skálázott sávot írja ki:

* az ifi-boost panelje;
* az öreg-boost panelje;
* a Boost-központ sima és POT-boost leírása;
* a kihívás-kártya.

## A próba

`tools/boost-mezony-3-9-216-proba.js` — **23 állítás**, valódi böngészőben.

* 85-ös mezőnyig minden a régi;
* fölötte a szorzó, az egy mérce, a mért POT-ugrások;
* a változatlan Rating-lépték;
* a panelek szövege;
* a kártya-fejlesztés azonnal, halasztva és régi mentésből.
