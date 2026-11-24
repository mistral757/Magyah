# 🧭 A kezdés újragondolva — 1.0.11.21.00

> KIMONDOTT KÉRÉS: „Nem jó az, ahogyan a játék kezdődik. Legyen sokkal egyszerűbb. Megcsináljuk a draftot. Aztán még a menedzsment feladata nem jön be, majd csak a HUB-ban. Amikor edzőt választunk, ott is kér megerősítést a játék: biztos őt választod, sőt ha kiválasztottad még vissza lehet lépni. Itt az edzőválasztásnál is már legyen egy kis hint […] Villog a menü. Rányom. Villog a Felállás, rányom. Villog az a felállás, amit ajánlunk neki, rányom, vagy kiixeli […] Ugyanez az elv végigmegy a taktikával is. […] Szóval ilyen aprólékosan kell ezt, különben tökre érthetetlen marad."

## 1. A menedzsment-célkitűzések
- Az osztályválasztás megerősítése után **nem** nyílik (`pyrConfirmDiv`).
- Az első HUB-on nyílik (`mgmtHubElso`, a `kutHub` hívja), egyszer. Közös karrierben és párharcban nem.
- A mentés változatlan: továbbra is az `S.mgmtSeen` jelzi, hogy megvolt.

## 2. Az edzőválasztás
- **A 3 felkínált edző egyszer sorsolódik.** A `_coachPicks` tárolja; egy új karrier nullázza. A visszalépés ugyanazt a hármat mutatja, a `rngFor("coaches")`-folyam nem lép tovább.
- **Tipp a kerethez** (`coachKeretErtek`):
  - minden edző mindhárom kedvelt taktikájánál látszik:
    - a mostani keret illeszkedése (`tacticFit`);
    - az indulási meccs-hatás a kezdő szinten (80/76/70), `tacticEffectAt` alapján, OVR-ben;
  - a pontszám: játékerő-bónusz + a legjobb taktika hatása;
  - egy edző kap „💡 ajánlott” jelet; a kezdő taktikák közül is egy.
- **Megerősítés:** az „Őt választom” után „Biztos őt választod?”.
  - „Még nézelődöm” → nincs edző.
  - Ha nem az ajánlottat választja, ezt halkan megemlíti.
- **Visszalépés:**
  - a kezdő taktika képernyőjén: „← Másik edzőt választok”;
  - a végső kártyán: „← Mégis másik edzőt választok”;
  - mindkettő a kapitány kijelöléséig él; a `coachVissza` törli az edzőt és a taktikát.
- **Rating nem látszik** — csak a POT, illeszkedés és meccs-hatás.

## 3. Az első tizenegy — vezetett túra (21 lépés)
Magától indul az első HUB-on (`kutElsoLeckeAuto`). Előtte kivárja a célkitűzések ablakát és a tippeket. A kártyáról és a ☰ Menü → 🧭 Vezetés alól újranézhető.

| # | Lépés | Mit vár |
|---|---|---|
| 1 | A kereted: Kezdő 11 / pad / tartalék, a jobb szélső szám, a piros nyíl | Tovább |
| 2 | Csere két úton (húzás / adatlap) | Tovább |
| 3 | A példa-játékos: rossz poszton áll, vagy van erősebb a helyére (`kutKeretPelda`: a legnagyobb nyereségű csere) | 👆 a villogó sorra |
| 4 | Az attribútumai (öt képesség) | Tovább |
| 5 | „🧭 Poszt, megbízás és POT” fül (ha már nyitva, átugorja) | 👆 |
| 6 | A posztjai: ★ fő poszt, mennyit érne hol | Tovább |
| 7–8 | Posztcsere → a javasolt partner villog a listában | 👆 (vagy Mégse) |
| 9–11 | Megbízás: egy középpályás sora → „Megbízás módosítása” → a legjobb megbízás villog (`kutMegbPelda`) | 👆 |
| 12 | ☰ Menü villog (ha nyitva, átugorja) | 👆 |
| 13 | Felállás villog (a menücsoport magától nyílik) | 👆 |
| 14 | Az ajánlott alak villog — vagy, ha a mostani a legjobb, a Mégse | 👆 |
| 15–16 | ☰ Menü → Taktika | 👆 |
| 17 | Ismertség és illeszkedés | Tovább |
| 18 | Miből áll az illeszkedés (súlyok, zöld tengelyek) | Tovább |
| 19 | A Meccs-hatás (OVR): 60% / 60-as ismertség vs 50% / 80-as ismertség, élő számokkal; tanács: a keretet fejleszd a taktikához, vagy játssz sokat egy rendszerrel | Tovább |
| 20 | A legtöbbet adó taktika Aktiválás gombja villog, vagy a Bezárás | 👆 |
| 21 | Összegzés | Kész |

**A felállás-ajánlás** (`kutFormAjanlas` / `kutFormErtek`):
- pontosan az `applyFormationChange` útját járja, a keret másolatán;
- a kezdő 11 poszton érvényes Ratingjeinek összegét hasonlítja;
- a szöveg a játékosonkénti átlagos nyereséget mondja ki;
- a próba méri, hogy a váltás után pontosan annyi lett.

## 4. A lecke-motor bővítése
- **Új lépéstípus, `katt`:**
  - a cél villog (`.kutCelVillog`), a lecke a koppintásra magától lép (`kesz`);
  - nincs „Tovább” gomb, csak halk „Átugrom →”.
- **Új lépésmezők:**
  - `cel()`: függvény-célpont;
  - `hol()` + `holAblak`: a lépés saját helye — játékos-lap, felállás- vagy taktika-választó;
  - `ha()`: feltételes lépés;
  - `kihagy()`: már kész, előre lépve átugorja;
  - `vissza()`: a játékos visszalépett, pl. bezárta a menüt — a lecke is visszalép;
  - `menuMarad`, `csoport`: a menü nyitását a játékosra hagyja;
  - a `c`/`x` lehet függvény (élő számok).
- **A lap elhelyezése:** felülre ül, ha a cél a képernyő alsó felén van.
- **Futó lecke alatt** a `guideFire` és a `teachTick` hallgat.
- **A taktika-panel** minden sorában ott a meccs-hatás, nem csak az aktívnál.
- **Jelölők a célpontokhoz:**
  - `data-kut="csere|megbizas"` (adatlap);
  - `data-cserekey` (csere-lista);
  - `data-role` (megbízás);
  - `data-form` (felállás);
  - `data-takt` (taktika).

## 5. Próbák
- **Új próba:** `tools/kezdes-vezetes-1-0-11-21-00-proba.js`. Ezeket méri:
  - nincs célkitűzés a kezdetén;
  - az edző tippje, a megerősítés, a két visszalépés ugyanahhoz a 3 edzőhöz;
  - az első HUB-on előbb a célkitűzés, utána a lecke;
  - a teljes túra végigjárása a villogó elemekre koppintva;
  - a felállás-előrejelzés pontossága;
  - a Kezdő út első szakaszának 3 feladata kipipálva;
  - a 6 taktikasor meccs-hatása;
  - nincs oldalhiba.
- **Frissítve:**
  - `kezdo-ut-leckek-1-0-11-17-00` — az „Első tizenegy” vezetett túra, a 4 lépéses korlát rá nem vonatkozik;
  - `run-cel-1-0-4-13-00` — a célkitűzés az első HUB-on.
- **Változatlanul zöld:** eromerleg, kezdo-ut-motor, kezdo-ut-zaro, kezdo-ut-csiszolas, stilus-osszeveto, menedzsment, kihivas-nev-menu, percbelyeg.
- **Régi hiba:** a `sargalap-proba` a változtatás előtt is ugyanígy bukik („nem sikerült karriert indítani”) — ehhez a munkához nem kapcsolódik.
