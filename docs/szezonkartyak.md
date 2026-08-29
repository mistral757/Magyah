# Szezonkártyák — mit ad egy kiemelkedő idény

*(3.8.21 — a TSI-ajándék és a szint megtartása. Érintett kód: `CARD_BUMP`,
`CARD_TSI` / `CARD_TSI_REPEAT` / `cardApplyTsi`, `CARD_CS`, `CARD_SV`,
`determineSeasonCards`, `cardResultsHtml`, `cardSeasonStats` /
`cardMatchMult`.)*

---

## 1. Mi ez

A szezonkártya a **kiemelkedő idény** jutalma: nyolc fokozat (ezüst → GODLIKE),
és minden fokozat **tartós** — egy megszerzett szint sosem vész el. A küszöböket
négy úton lehet elérni, hogy minden poszt kapjon esélyt:

| út | mire jó |
|---|---|
| gól + gólpassz (`combo`) | támadók, középpályások |
| meccs embere (`mvp`) | akit a motor a legjobbnak ítél |
| bravúr (`CARD_SV`) | kapusok |
| tiszta lap (`CARD_CS`) | kapusok és **védők** |

A küszöbök **meccsre vetítve** mérnek (`cardMatchMult`), tehát egy fél idényt
kihagyó ember sem esélytelen, és a sokat játszó sem kap ingyen kártyát.

---

## 2. Mit ad egy fokozat (3.8.21)

**Két dolgot, és a kettő szándékosan más természetű:**

| | mit mozdít |
|---|---|
| **Rating-bónusz** (`CARD_BUMP`: 1–8) | a MOSTANI erőt — azonnal jobb játékos |
| **TSI-ajándék** (`CARD_TSI`) | a HOSSZÚ TÁVÚ pályát — a peak a `tsiToPeakOvr`-en át követi, és vele az eladási ár is |

**Bejelentett kérés:** *„A szezonkártyák adjanak TSI boostot is — ezüst 5-7% ⇒
Gyilkos 25-33, Vadista 50-75, GODLIKE 90-125% TSI. A köztesek is kapjanak ezen
az íven."*

| fokozat | Rating | **TSI-ajándék** |
|---|--:|--:|
| ezüst | +1 | **5–7%** |
| arany | +1 | 8–11% |
| gyémánt | +2 | 12–16% |
| csillag | +3 | 16–21% |
| mítoszi | +4 | 20–26% |
| **Gyilkos** | +5 | **25–33%** |
| **Vadista szandál** | +6 | **50–75%** |
| **GODLIKE** | +8 | **90–125%** |

A felső két fokozat szándékosan szakad el a többitől: azok idényenként
**egy-egy** embernek járnak.

A mechanika betűre ugyanaz, mint a megvásárolható TSI-boosté (`applyTsiBoost`):
a **Rating nem ugrik** a TSI-től, csak a fejlődési pálya nyílik ki, és az
ajándékot kizárólag az abszolút mennyezet fogja (`boostGiftTsi`).

**Mérve** (a valódi `cardApplyTsi`-vel, 4000-es TSI-nél):

| fokozat | TSI-nyereség | a peak ezzel |
|---|--:|---|
| ezüst | +200…+280 | 91,2 → 91,9…92,1 |
| gyémánt | +480…+640 | 91,2 → 92,7…93,2 |
| Gyilkos | +1000…+1320 | 91,2 → 94,2…95,1 |
| GODLIKE | +3601…+5000 | 91,2 → 96,0 (a görbe teteje) |

*(A `tsiToPeakOvr` normál módban 96-nál telítődik — a plafon fölött az ajándék a
piaci értékben és az eladási árban jelenik meg, a fejlődési pálya viszont már
nem tud tovább nyílni. Infinityben a telítődés feloldódik. Ugyanez áll a
megvásárolt TSI-boostra is.)*

---

## 3. A szint MEGTARTÁSA is ér valamit (3.8.21)

**Bejelentett kérés:** *„Ha egy idény után nem fejlődik a szezonkártya, de
ugyanazt a szintet megüti a játékos, akkor a megfelelő TSI boost felét kapja
meg. Ha alacsonyabb színvonalú idénye van, mint a kártyája, akkor nem kap
semmit."*

Ez tölti be a rendszer legnagyobb lyukát: eddig egy GODLIKE kártyás ember
következő, ugyanolyan zseniális idénye **pontosan semmit** nem hozott — a
kártya a csúcson állt, tehát a szezonja nyom nélkül múlt el.

| az idény szintje a kártyához képest | mi jár |
|---|---|
| **magasabb** | a kártya lép + teljes Rating-bónusz + **teljes** TSI-ajándék |
| **ugyanaz** | a kártya marad, Rating-bónusz nincs, **fél** TSI-ajándék (`CARD_TSI_REPEAT`) |
| **alacsonyabb** | semmi — a kártya viszont megmarad |

A kártya tehát **cím**, nem évente újraosztott jelvény: elveszíteni nem lehet,
de megtartani is munka. Mérve, 4000-es TSI-nél: egy megismételt GODLIKE-idény
+2427 TSI-t hoz (60,7%), egy megismételt Gyilkos +610-et (15,3%).

**Egy szándékos következmény:** a felső fokozatok idényenkénti egy-egy helye
akkor is elfogy, ha a jelöltje már azon a szinten áll (a `godlikeGiven` /
`vandalGiven` jelző ott is bebillen). Ez így helyes: **ő** teljesítette a
GODLIKE-idényt, tehát az adott idény GODLIKE-ja az övé — csak épp kártya
helyett a fél TSI-ajándékot kapja érte.

---

## 4. Amit a szezonzáró jelentés kiír

A „Szezon kártyák" doboz mostantól **mindkét ajándékot** kimondja
(`+2 Rating · +640 TSI`), és a megtartott szintnek saját mondata van:
*„Megtartotta a szintjét — a kártyája marad, a fejlődési pályája viszont tovább
nyílt."* Enélkül a fél ajándék néma maradna, és a felhasználó azt látná, hogy
a kiemelkedő idénye nem ért semmit.
