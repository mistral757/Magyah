# Idény-mérleg — a büdzsé könyvelése

*(3.3.38. Érintett kód: `LEDGER_CATS` + `ledger*` / `budget*` függvények és a
`ledgerHtml()` panel az index.html-ben. Az őrszem: `tools/ledger-audit.sh`.)*

## 1. Miért kellett

A büdzsé eddig **egyetlen szám** volt. Láttad, mennyi van — de nem azt, hova
ment. A napló soronként kimondta ugyan („−12,4 M Ft: Kovács igazolása"), csak a
naplót két forduló múlva elviszi a görgetés. Arra a kérdésre, hogy *„ebben az
idényben mire ment el a pénzem?"*, nem volt hol válaszolni.

Egy kivétel volt: a **bérmérő**. Az viszont kalibrációs napló (a bér/lelátó
arányt méri), és pontosan EGY tételt tud a bevétellel szembeállítani.

## 2. Az egyetlen szabály

A büdzsé **két kapun** mozoghat:

```js
budgetPay(összeg, kategória[, név])   /* kiadás — visszaadja, amennyi tényleg lement */
budgetEarn(összeg, kategória[, név])  /* bevétel */
budgetSet(érték, kategória)           /* értékadás — a KÜLÖNBSÉGET könyveli */
```

Aki közvetlenül ír az `S.transferBudget`-re, az **láthatatlan pénzt mozgat**: az
egyenleg és a mérleg szétcsúszik, és a hiba nem ott jelentkezik, hanem egy
„nekem nem stimmel" bejelentésben, kiadásokkal később.

A `budgetPay` **sosem visz nulla alá**. Eddig is minden hívási hely vagy előre
ellenőrizte a fedezetet, vagy maga csonkolt — csak háromféle írásmóddal
(`-=`, `Math.max(0,…)`, előellenőrzés). Most egy helyen van, és a visszatérési
érték mondja meg, mennyi ment le tényleg.

## 3. A `name` paraméter: a sztár magától a helyére kerül

A hívási helyeknek **nem kell tudniuk a hírességről semmit** — elég átadni,
kiről szól a tétel:

```js
budgetPay(price, "boost", p.n);        /* ha ő a sztár → boostStar */
budgetEarn(credit, "sale", p.n);       /* ha ő a sztár → saleStar  */
```

A leképezés a `LEDGER_STAR_ALT`-ban él. Új kategóriát ezért nem kell kétszer
felvenni: elég a párt megadni, ha a sztár esetében külön sort érdemel.

## 4. Két védőháló

A `check.sh` egyiket sem kapja el — mindkettő **szintaktikailag hibátlan**, és
mindkettő némán hamis mérleget csinál. Ezért van a `tools/ledger-audit.sh`:

| amit néz | miért |
|---|---|
| **könyveletlen írás** — minden `S.transferBudget=` a fájlban | a mérleg ettől csúszik el |
| **elgépelt kategória** — a hívási helyek kulcsai a `LEDGER_CATS` ellen | `"sceout"` nem hibázik, csak némán az „Egyéb" sorba esik |

A valóban indokolt közvetlen írások (a két kapu maga, a null-védelem, a
betöltés, a karrieren kívüli nullázás) az **`INDOKOLT`** szóval vannak
megjelölve a sorban. Új helyet csak akkor jelölj meg, ha tényleg nem pénzmozgás.

Kipróbálva: a `"scout"` → `"sceout"` elgépelésre a szkript kilistázza a kulcsot
és 1-es kóddal áll le.

### A futó önellenőrzés

A sor a **nyitó egyenleget** is elteszi (`open`), ezért igaz kell legyen, hogy

```
open + Σbevétel − Σkiadás === S.transferBudget
```

A különbség a `drift`. A panel kiírja („⚠️ könyveletlen mozgás"), a 🧪
diagnosztika pedig **forintra pontosan** megmondja, mennyivel csúszott el —
egy „nekem nem stimmel a mérleg" bejelentés így egy sorból megválaszolható.

```
── IDÉNY-MÉRLEG (futó szezon)
  nyitó 41200000 · bevétel +251000 · kiadás −5712 · egyenleg 41445288  ✓ stimmel
  season:120000 · fans:251 · wage:25 · wageStar:687
  ⭐ Kovács Bence · +9800 / −28900 → -19100
```

## 5. A sztár külön serpenyője

„Sztárom a párom" stílusban a sztár **üzleti döntés**: kiugró bért visz, és
reklámmal, befektetővel meg a hírneve hozta tömeggel fizet vissza. A panel ezért
külön blokkban mutatja a nettóját — megérte-e.

| a sztár tétele | honnan |
|---|---|
| `wageStar` — a bére | a `wageBill.stardom`, a plafonon kívül álló rész |
| `fameAd` — reklámszerződések | `fameRevenueTick` |
| `fameInv` — befektető | `fameRevenueTick` |
| `fameFans` — lelátó a hírneve miatt | a heti bevétel `fanBoost/fanBase` része |
| `saleStar`, `boostStar` | ha az eladás/boost épp róla szól |

**Ezek NEM duplikátumok.** A bérből a sztár része **kikerül** a `wage` sorból, a
lelátóból a hírneve hozta rész a `fans` sorból. Minden forint pontosan egy
kategóriában szerepel — különben az összeg hazudna, és a mérleg pont az
összegéért van.

### A két megosztás matematikája

* **Bér.** A levonás `paid = min(egyenleg, due)`, a sztár része
  `paid × (stardom/due)`. Fedezetlen bérnél tehát **arányosan** marad el
  mindkettő, és a két sor összege pontosan a levont összeg.
* **Lelátó.** A heti bevétel egyenesen arányos a táborral
  (`fanBase × jegyár × élmény-szorzó`), ezért a `fanBoost` részaránya pontosan
  kiszámolható. Így a sztár blokkjában ott áll az a bevétel is, amit nem külön
  esemény hozott, hanem a puszta jelenléte.

## 6. Hol látszik

Infópult → **„Szezon és mérleg"** fül, a szezononkénti keret bontása alatt.

A kettő szándékosan **külön doboz**: a fenti előrejelzés („ennyi érkezik, ennyibe
kerül a kezdő 11"), ez pedig a tény („ez történt"). Az egyiket tervezésre
olvasod, a másikat számadásra.

Csak a **nem nulla** tételek kapnak sort, tehát egy csendes idény elején két-három
sor az egész. A korábbi idények egy-egy összegző sort kapnak; a részletezés a
mostani idényé marad, hogy a doboz ne nőjön faliújsággá.

## 7. Hol a sor határa

A szezonszámláló a **nyári ablak után** lép (`startNextCareerSeason`), a nyári
keret viszont már a szezonjelentés elején megérkezik. Az idény sora ezért a rá
következő nyarat is tartalmazza: **a nyári keret és a belőle fizetett igazolások
egy sorban állnak.**

Ez így helyes — a pénz és a belőle vett játékos ugyanoda tartozik —, de kimondani
kell, különben jogos marad a kérdés, hogy „miért van a 3. szezon sorában a 4.-re
vett csatár?". A panel ki is írja, amint van szezonkeret a sorban.

Nem lett volna jobb a keretet a KÖVETKEZŐ sorba tenni: a nyári kiadások akkor is
a mostani sorba mennének (a szezonszám még a régi), tehát a
`open + Σ = egyenleg` egyenlőség elhasadna, és a panel hamisan kiabálna
könyveletlen mozgást.

A sorok **egymáshoz láncolódnak**: az új idény sora azzal az egyenleggel nyílik,
amivel az előző zárt, mert a számláló lépése és az első mozgás között
definíció szerint nincs pénzmozgás.

## 8. Az állapot

```
S.ledger = { v:1, rows:{ "<szezon>":{ season, open, cats:{ "<kategória>":összeg }, nStar } } }
```

Szezononként ~20 szám, tehát a mentésben elhanyagolható. Régi mentésben nincs
`ledger` — ilyenkor **üresen indul**, és a mostani idény sora az első mozgásnál
születik meg, a mostani egyenleggel nyitva. Így a mérleg innentől stimmel, és
nem hazudik visszamenőleg olyan tételeket, amikről nem volt honnan tudnia.

Az `nStar` a soron azért van, hogy a blokk fejléce akkor is tudja, kiről szól, ha
közben más lett a sztár (vagy elment).

## 9. Új kategória felvétele

1. Vedd fel a `LEDGER_CATS`-be: `n` (emberi név), `ic` (emoji), `side` (`+1`
   bevétel / `−1` kiadás), és ha a sztár blokkjába tartozik, `star:1`.
2. A **sorrend a megjelenítés sorrendje** — a nagy tételek elöl.
3. Ha a sztár esetében külön sort érdemel, vedd fel a párját is, és kösd össze a
   `LEDGER_STAR_ALT`-ban.
4. Futtasd a `./tools/check.sh`-t **és** a `./tools/ledger-audit.sh`-t.
