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

## Amit a build magától ellenőriz

- egyetlen név sem maradhat változatlan (az elbukná a magyarítás értelmét),
- két KÜLÖNBÖZŐ játékos nem kaphat azonos teljes nevet — a `careerPool`
  névvel kulcsol, összeolvadnának,
- trágár alak szűrése (a fonetika `Fazio`-ból „Faszio"-t csinált).

Ha a build panaszkodik, a javítás helye a `manual.py`.

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
