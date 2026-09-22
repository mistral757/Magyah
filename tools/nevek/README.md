# tools/nevek — a magyarított játékosnevek generátora

A kiadott verzió nem valós futballistaneveket mutat, hanem magyaros
átiratokat. A leképezést az `index.html`-beli `HU_NAME_TABLE` tartalmazza,
és **ez a mappa állítja elő.**

## Mikor kell futtatni

**Minden alkalommal, amikor új klub-szezon (új játékosnév) kerül a játékba.**
A táblában nem szereplő név a képernyőn VÁLTOZATLANUL, azaz valós néven
jelenne meg — pontosan az, amit a magyarítás el akar kerülni.

```bash
python3 tools/nevek/build.py      # beolvassa az index.html-t és felül is írja
python3 tools/nevek/kettozes.py   # ugyanaz az ember két néven? (lásd lentebb)
./tools/check.sh                  # utána mindig
```

A szkript magából az `index.html`-ből nyeri ki a neveket, tehát nincs
külön karbantartandó adatfájl.

## A rétegek

- **`manual.py`** — a kézzel írt JÁTÉKOS- és edzőnevek (656 db): a
  felismerhető felső kör, az összes magyar név, az edzők, a scoutok és az
  akadémiai ikonnevek. Új ismert név ide kerül,
  `kanonikus: (teljes magyar név, rövid alak)` alakban.
- **`rules.py`** — a szabálymotor mindenki másra. A kiejtés nyelvfüggő (a
  „ch" a németben cs, az olaszban k, a franciában s), ezért a nemzetiség be
  van kötve.
- **`klubok.py`** — a KLUB- és LIGANEVEK, mind kézzel (179 + 29).
  `kanonikus: (magyar név, 3 betűs kód)`. A kód az eredményjelzőn jelenik
  meg; ütközést nem kell kézzel kerülni, a build egyedivé teszi és kiírja,
  hol nyúlt hozzá.

A válogatottak (Anglia, Magyarország…) SZÁNDÉKOSAN kimaradnak: az országnév
nem védjegy, és a magyar 1954-es keretet épp az teszi felismerhetővé, hogy
Magyarország.

## Az ifiakadémia névpoolja — ide a build NEM nyúl

Az `index.html`-beli `HU_ACADEMY_LAST` (75 vezetéknév) és `HU_ACADEMY_FIRST`
(30 keresztnév) a `manual.py` kézi rétegéből KÉZZEL kiválogatott névelemek —
nem a build állítja elő, és nem is fogja felülírni. Az akadémia ezekből, a
sima `REGEN_*` listákkal együtt sorsol (`ACADEMY_LAST` / `ACADEMY_FIRST`), így
a felhozott tehetség neve 4550 helyett 13 775 kombinációból jön.

A NÉVSORT nem vesszük át, csak a névelemeket, újrakeverve: „Kelkáposzta
Tihamér" sehol nem áll a táblában, mégis onnan hangzik. Ahol mégis egybeesne
egy létező magyarított névvel (13 775-ből 34 ilyen kombináció van), a
`huFullNameTaken()` újrasorsoltatja — két különböző játékos a képernyőn nem
állhat azonos néven.

Az ikonok vezetékneve (Kalasnyikovos, Hidegkutyus, Gyorsiccs, Máldi, Krojfi,
Zsindelyes…) SZÁNDÉKOSAN maradt ki: azok az `ACADEMY_ICON_NAMES` saját
kacsintásai, és elmosódna, mikor jön fel tényleg ikonnevű tehetség.

Új névelemet ide, az `index.html`-be kell felvenni — a `build.py` futtatása
után is megmarad.

## Amit a build magától ellenőriz

- egyetlen név sem maradhat változatlan (az elbukná a magyarítás értelmét),
- két KÜLÖNBÖZŐ játékos nem kaphat azonos teljes nevet — a `careerPool`
  névvel kulcsol, összeolvadnának,
- trágár alak szűrése (a fonetika `Fazio`-ból „Faszio"-t csinált).

Ha a build panaszkodik, a javítás helye a `manual.py`.

## A motor tíz szabályhiánya (3.9.113)

A gépi réteg tíz ponton a saját guide-ját (`docs/nevek-danisitasa.md`)
sértette: `ll → lj` nyelvfüggetlenül (124 név), szókezdő spanyol `S-` (69),
`-ez → -essz` (50), `Mc- → Mk-` magánhangzó nélkül (21), `qu → kv`
újlatinul (22), a holland `v`/`g`/`ij` (41), angol `s` + mássalhangzó (18),
olasz magánhangzók közti `s` (15), francia `G` i/e előtt (6). Összesen
**412 név** javult, kézi név **egy sem** változott.

Háromnál a sorrend volt a hiba, nem a szabály — és a kód ezt ki is mondja
(a spanyol `j → h` felülírná az `ll → j`-t; a `w → v` felülírná a holland
`v → f`-et; a `z → sz` kétszer cserélt a `-ez`-ben). **Új nyelvi szabály
írásakor előbb nézd meg, mi fut utána.**

Belgium 3.9.113 óta saját nyelvkód (`be`), ág nélkül: az ország kétnyelvű,
és a flamand `g → h` a francia ajkú neveken (Gillet → „Hillet") rombolna.

**3.9.118–119 — az őrjelek.** A tíz javításból három nem hiányzó szabály
volt, hanem rossz sorrend, és kiderült, hogy ugyanez a séma TIZENHÁROMSZOR
ül a motorban: egy korai lépés beír egy magyar kétjegyű betűt, egy későbbi
belemar. Mostantól az eldöntött kétjegyű betűk egyetlen láthatatlan
karakterként utaznak végig (`S_NY`, `S_ZS`, `S_CS`, `S_LY`, `S_SZ`, `S_C`,
`S_DZS`, `S_SSZ`, `S_CCS`, `S_S`, `S_AO`), és csak a `desent()` bontja
vissza őket.

> **ÚJ NYELVI SZABÁLY ÍRÁSAKOR: ha magyar kétjegyű betűt írsz, őrjelet írj.**
> Nem azért, mert ma elromlana, hanem mert a következő szabály már nem
> tudja, hogy az ott egy döntés volt.

Ezzel együtt bejött a maradék tíz szabály is (angol/skandináv/görög/török
`s`, francia néma szóvégi mássalhangzó, `-ović`, lengyel helyesírás, olasz
`c` e/i előtt és `s` + mássalhangzó, portugál `x`), valamint két új
nyelvkód: `pl` és `gr`. Összesen 421 további gépi név, kézi egy sem.

**3.9.120 — a nyelvtérkép lyukai.** A `LANG`-ból 53 nemzetiség hiányzott,
összesen 292 néven — és a hiányzó bejegyzés NEM semleges: a `lang_of`
ilyenkor `"en"`-t ad. A japán, a szovjet és az egész frankofón Afrika angol
kiejtést kapott. **Új nemzetiség felvételekor a `LANG`-ot is bővítsd.**

Új kódok: `jp` (japán), `pl`, `gr`, és `af` — ez utóbbi a frankofón Afrika
és a Maghreb: francia HELYESÍRÁS, de teljes kiejtés, mert ott a szóvégi
mássalhangzó nem néma (Bennacer → Bennaszer, nem „Bennaszé").

Részletes magyarázat: `docs/nevek-motor-tiz-szabaly.md`.

## kettozes.py — ugyanaz az ember két néven

```bash
python3 tools/nevek/kettozes.py      # kilépési kód 1, ha talált
```

**Új köteg után ezt is futtasd, a build.py mellett.** Az adatbázisban egy valódi
ember több klub-szezonban is szerepel — ez szándékos, és a karrier-regiszter a
NÉVRE kulcsolva fűzi őket egyetlen személlyé. Ha viszont ugyanaz az ember KÉT
kanonikus néven kerül be, a regiszter két külön embernek látja: két POT, két kor,
két karrier, és egyszerre lehet mindkettő a keretedben.

**A build.py ezt nem fogja meg.** Az azt nézi, hogy két különböző kanonikus név
ne kapjon azonos magyar nevet; itt fordítva történik: a két írásmód két
KÜLÖNBÖZŐ magyar nevet kap, tehát a build elégedett. Így került be az adatbázisba
egyszerre `Andrij Sevcsenko` (Milan 2002/03) és `Andriy Shevchenko` (Chelsea
2006/07) — és ugyanígy `Miodrag Belodedici`/`Belodedić`, `Edmílson`/`Édmilson`,
`Alejandro Gómez`/`Papu Gómez`. Mind a négy egy-egy ember volt.

A szkript azonos **születési év + nemzetiség + hangzásra egyező vezetéknév**
hármasra keres (a vezetéknév helyét a nemzetiség dönti: magyar névnél elöl).
Az ismert, valódi névrokonok — ikrek és azonos évjáratú névtársak — a fájl
`NEVROKON` listájában állnak, indoklással. Új ilyet oda kell felvenni, hogy a
szkript tiszta maradjon: egy zajos háló ugyanannyit ér, mint a semmi.

## leak.js — a végponti próba

```bash
node tools/nevek/leak.js
```

Kiüríti a klubleírásokat (azok a kiadott verzióból kimaradnak), végigjátssza
a karriert a draftig, és megnézi, marad-e BÁRMILYEN valós JÁTÉKOS-, KLUB-
vagy LIGANÉV a képernyőn.

Ez találta meg a scout- és az akadémia-neveket (nem a keretekből jönnek,
ezért a táblába sem kerültek volna bele magától), a draft-pörgetés
klubkijelzőjét és a fejléc alcímét, ami valós klubokat sorolt fel.

**A tools/check.sh nem helyettesíti.** Az a szintaxist és a nem létező
globálisokat nézi; egy futásidejű sorrendhibát (TDZ: a `renderHdrSub()` a
`let _huNames` deklarációja ELŐTT hívva megállította az egész betöltést)
csak ez a próba fogott meg.

Szükséges: `npm i playwright` (a böngésző már telepítve van).

## release.py — a KIADÁSI build

```bash
python3 tools/nevek/release.py     # → dist/index.html
```

A megjelenítés magyarított, de a repóbeli `index.html` **tartalmazza** a valós
neveket: kulcsként (`SQUADS n:`, `BIRTH_YEAR`, `HU_NAME_TABLE`, `CLUB_ABBR`), a
klubtörténetekben (`note:`) és 2600+ kódkommentben. Egy „forrás megtekintése"
mindet megmutatja. **A képernyő tiszta, az adat nem az.**

A release-build minden valós nevet átlátszatlan azonosítóra cserél:

```
{n:"Lionel Messi",…}   →  {n:"p1a2b3c4",…}
"Lionel Messi":1987    →  "p1a2b3c4":1987
{club:"Real Madrid CF" →  {club:"c9f8e7d6"
```

A játék ugyanúgy működik: a kulcs kulcs marad, csak nem beszédes. Emellett
kiüríti a klubtörténeteket, eltávolítja a kommenteket, és kikapcsolja a rejtett
névmód-kapcsolót (azonosítókra visszaváltani értelmetlen volna).

A végén ELLENŐRZI magát: ha egyetlen valós név is bent maradt, kiírja hol, és
1-es kóddal áll meg. Az „Aston Villany"-féle téves találatokat kiszűri.

### A két verzió viszonya

| | családi | kiadott |
|---|---|---|
| fájl | `index.html` (a repóban) | `dist/index.html` (generált) |
| nevek az adatban | valósak | azonosítók |
| rejtett kapcsoló | `szutykoskutyus` | nincs |
| névszerkesztő | van | van |

**Két külön termék.** A mentéseik nem cserélhetők (más a kulcstér), és közös
világot sem lehet játszani a kettő között. A `dist/` nincs verziókövetve —
kiadás előtt kell legenerálni.

## A játékos saját névátírásai

Az adatbázis-ablakban („📊" a kezdőlap alján) a **✏️ Nevek átírása** fülön
bárki átírhat bármelyik játékos-, edző- vagy klubnevet. A felülírás
`localStorage`-ban él, a mentésnek nem része, és MINDIG nyer a beépített név
felett. A rövid alakot a rendszer származtatja: magyar sorrendnél az első szó,
egyébként az utolsó.

A kiadott buildben a kulcs az azonosító — ott tehát a nevet **tényleg a
felhasználó írja be**, nem mi szállítjuk hozzá.

## A 37. köteg — négy kiejtési rés, méréssel (3.9.129)

A mérés az **élő `HU_NAME_TABLE`-ön** futott, és négy nyitott szabályt
mutatott meg. Mindegyiknél kevés a találat, ezért a **kézi réteg** az olcsóbb
és biztosabb út — a motorba nyúlni értük több kockázat lenne, mint haszon.

| Rés | Példa | Db |
|-----|-------|----|
| német: két magánhangzó közti `s` = **z** | Kruse → **Krúze** | 5 |
| svájci-francia, németnek nézve | Chapuisat → **Sapüizá** | 1 |
| francia `ai` = **e**, nem „áj" | Vairelles → **Verell** | 3 |
| maghrebi `s` = **sz** (francia helyesírás) | Saihi → **Szájhi** | 1 |

Az `af` (maghrebi/afrikai, francia **helyesírással**) nevek helyesen maradnak
„aj"-osak — ott az `ai` tényleg két hang (Haidara, Zairi). A keresztnevek a
gépi kiosztásból maradnak; csak a vezetéknév változik.

### ⚠️ `table.json` — poros, ne higgy neki

A mappában lévő `tools/nevek/table.json` **2026. szeptember 4-i**, azóta
~1000 néven elavult, és a `build.py` docstringje **tévesen** állítja, hogy ő
írja: a build már közvetlenül az `index.html` `HU_NAME_TABLE`-jét írja felül,
a `table.json`-t nem érinti.

Ez egy valódi csapda: a 37. köteg első mérése ezen a fájlon futott, és **hamis
hibákat** mutatott (`Wiese → Fise`, `McFarland → Mkfarland`) — mindkettő rég
javítva van az élő táblában. **Mérni mindig az `index.html`-ből kell.**

