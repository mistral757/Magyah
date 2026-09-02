# 💾 Biztonsági mentés — kimentés és visszatöltés

*(3.9.03, a kiadási roadmap **F3** lépése. Az érintett kód mind az
`index.html` egyetlen script-blokkjában: a „BIZTONSÁGI MENTÉS" szakasz —
`saveExportEnvelope` / `exportSaveToFile` / `saveImportParse` /
`openSaveImportFlow` —, plusz a `downloadJsonFile`, a `saveGame`
fagyasztó-őre, és három bekötési pont: a „Mentések és tárhely" listája, a
törlés-folyamat és a `#storeImpFile` fájlválasztó.)*

## 0. Egy mondatban

A karrier mostantól **fájlba menthető és fájlból visszatölthető** — ez az
első olyan mentés, ami túléli a telefont.

---

## 1. Miért

Eddig egyetlen „kimentés" létezett: a `.txt` **összegzés**. Az szép emlék —
szezonról szezonra, a keret, a mindenkori statisztika —, de **visszatölteni
nem lehet**. Vagyis:

* telefonváltásnál a karrier ottmaradt a régi készüléken;
* egy „böngészőadatok törlése" véglegesen elvitte;
* egy elrontott vagy megsérült mentéshez nem volt mihez visszanyúlni.

Egy Play-en kiadott játéknál, ahol valaki tíz szezont épít, ez nem
maradhatott így. A roadmap ezért sorolta a **kiadásblokkolók** közé.

---

## 2. A fájl

Egy JSON, **borítékkal**:

```json
{ "magyah":"magyah-mentes", "f":1, "app":"3.9.03",
  "ts":"2026-09-02T…", "kulcs":"30-0-save-v1",
  "cimke":{ "team":"…", "mode":"career", "season":4, "idx":17,
            "room":null, "slot":1 },
  "mentes":{ …a nyers mentés, változatlanul… } }
```

A boríték három dolgot ad, amit a puszta mentés nem:

| | |
|---|---|
| **felismerhető** | egy tetszőleges JSON nem téveszthető össze vele — a `magyah` jelölés dönt |
| **megmutatható** | a visszatöltő ki tudja írni, **mi** van a fájlban, *mielőtt* bármit felülírna |
| **migrálható** | ha egyszer változik a formátum, az `f` megmondja, mivel van dolgunk |

Plusz egy negyedik mező, az `epites` — lásd a 6.1 pontot.

A fájl neve beszédes: `magyah_<csapat>_<N>szezon_<dátum>.json`, szoba-mentésnél
`…_szoba-<KÓD>_…`.

> **BOM nélkül.** A `.txt`-nél a fájl elejére tett bájtsorrend-jel épp azért
> van, hogy a szövegnézők ne rontsák el az ékezeteket. Egy JSON elején viszont
> **árt**: a `JSON.parse` elhasal rajta — vagyis a saját visszatöltőnk sem
> tudná beolvasni, amit kiírt. Ezért van külön `downloadJsonFile`.

---

## 3. Kimentés — hol

**Soronként, a „Mentések és tárhely" listájában** egy `⬇` gomb. A **futó**
mentésre is jár — sőt, arra a legfontosabb; az egyetlen sor, amiről nincs mit
kimenteni, az olvashatatlan mentés.

**A törlés-folyamat első lépésében** is ott áll, a `.txt` összegzés **fölött**:
„💾 Teljes mentés kimentése (.json)". Ez az a képernyő, ahol egy karrier
mindjárt megszűnik — és ez az egyetlen gomb rajta, ami után a döntés
visszafordítható. Ezért az első.

---

## 4. Visszatöltés — három lépés

A törlés-folyamat tükörképe, ugyanazzal a logikával: **előbb megmutatjuk,
aztán megkérdezzük, és csak külön megerősítésre írunk.**

```
fájl kiválasztása
  │
  ├─ 1. MI VAN BENNE?      csapat · szezon · forduló · honnan való · mikor mentetted
  │
  ├─ 2. HOVA KERÜLJÖN?     a három egyjátékos hely, kiírva, hogy melyikben mi van
  │
  └─ 3. MEGERŐSÍTÉS        ha a cél nem üres: piros figyelmeztetés + „előbb mentsd ki"
         │
         └─ írás → ÚJRATÖLTÉS a cél helyre
```

A helyválasztó **kiírja, mi van a helyeken** („2. hely — üres", „1. hely —
Kaposvári Rákok · 4. szezon — **felülíródna**"). Felülírni sosem lehet vakon.

Ha a cél mégis foglalt, a megerősítő lépésen ott a **„💾 Előbb mentsd ki, ami
ott van"** gomb: a felülírandó karrier egy koppintással kimenthető, mielőtt
elveszne. Ugyanaz a gondolat, mint a törlésnél.

### Miért újratöltés a végén

Mert a **futó játékot menet közben lecserélni** külön kódút volna — és a
mentés-réteg legdrágább hibái pontosan ilyen „második utakból" születtek
(lásd a mentési zár történetét a `saveGame` fölött). Az indulási út
(`initSaveSystem`) viszont **már tudja**, hogyan kell egy mentésből
megérkezni: zárral, hibakezeléssel, a „Folytatom" gombbal együtt. Ezért a
visszatöltés annyit tesz, hogy **beírja a fájlt a cél helyre**, majd
`mpReloadWithIntent`-tel odaküldi az indulást.

### A fagyasztó

Az írás és az újratöltés között a memóriában **még a régi játék áll**. Ha
ilyenkor bármi menteni akarna — egy időzítő, egy kattintás —, pont az imént
visszatöltött mentést írná felül. Ezért az írás előtt felmegy a
`_saveFrozen`, és a `saveGame` onnantól nem ír sehova. Az igazság már a
lemezen van; a memóriának nincs többé szava.

---

## 5. Amit a visszatöltés SOSEM csinál

**Nem írja át a mentést.** Ami kijött, pontosan az megy vissza — bájtra. Ez
nem kényelmi döntés, hanem a rendszer legfontosabb szabálya: egy
biztonsági mentés, amit a visszatöltő „megjavít", már nem biztonsági
mentés.

Ebből következik a **szoba-mentések** kezelése is. Egy közös karrier mentése
tele van olyan állapottal, amit csak a szoba tesz értelmessé — a
párharc-fordulók, a társ pillanatképe, a szoba azonosítója, a felküldött
keret. Ha ezt egyjátékos helyre engednénk, **át kellene írni** (mint ahogy a
`mpOrphanCareer` teszi élesben, a menetrend átszervezésével együtt) — ez
pedig pont a fenti szabályt sértené, ráadozik egy nyers JSON-on, élő
kontextus nélkül.

Ezért: **a szoba-mentés a saját szobájába kerül vissza.** Nincs helyválasztó,
az ablak megmondja, hogy a kezdőlapon a szoba chipjéről folytatható. Ha a
társ már nincs meg, a megszokott, kipróbált **„🎮 Egyedül folytatom ezt a
karriert"** gomb fordítja egyjátékossá — élő kontextusban, a valódi
`mpOrphanCareer`-rel.

---

## 6. Amit visszautasít, és miért mondja meg

Egy néma „nem jó fájl" után a felhasználó nem tudja, a fájlt rontotta-e el,
vagy rosszat választott. Ezért **minden elutasításnak neve van**:

| eset | mit mond |
|---|---|
| nem JSON | „Ez a fájl nem olvasható JSON-ként. Biztosan a Magyah által kimentett .json fájlt választottad?" |
| idegen JSON | „Ez a fájl nem Magyah-mentés — hiányzik belőle a jelölés. (Az összegzés .txt-t nem lehet visszatölteni, csak a .json mentést.)" |
| újabb formátum | „Ezt a fájlt a játék egy újabb változata írta (formátum N…). Frissítsd a játékot, és próbáld újra." |
| üres mentés | „Ebben a fájlban nincs valódi karrier — üres mentést nem töltünk vissza." (`saveHasGame`) |
| túl nagy fájl | 12 MB fölött el sem olvassuk — egy késői karrier ~250 kB |

Az írás elszállása (tele tárhely) sem néma: a `saveWrite` a szokásos módon
takarít és újrapróbál, és ha úgy sem megy, a visszatöltő **nem tölt újra**,
hanem kiírja, hogy engedj el egy rég nem használt mentést.

### 6.1 A családi és a kiadott verzió mentése nem cserélhető

A kiadási build (`tools/nevek/release.py`) minden valós nevet átlátszatlan
azonosítóra cserél — a nevek viszont a mentés **kulcsai**: a keret, a
karrier-pool, a statisztika, a góllövőlista mind névvel hivatkozik. Egy
családi mentés a kiadott verzióban tehát csupa ismeretlen kulccsal érkezne, és
a karrier fele üresen jönne vissza.

Ezt kevés a README-ben leírni: a visszatöltőnek **fel kell ismernie**.
A boríték `epites` mezője mondja meg, melyik változat írta
(`"csalad"` / `"kiadott"`), és eltérésnél a fájl nevesített üzenettel pattan
le, mielőtt bármit felülírna.

A felismerés **magából az adatból** jön, nem egy build-időben beírt jelzőből:
a kiadott verzióban a névtábla kulcsai `p`+hex alakúak (`buildKind()`). Ez a
forma **verziófüggetlen** — egy fél évvel későbbi családi mentés is
visszatölthető marad, csak a másik termékből való nem. A 3.9.03 előtti
fájlokban nincs `epites`; azokat elfogadjuk, mert ilyen fájl csak a családi
változatból származhat.

---

## 7. Ellenőrzés

Böngészőben (Chromium, 430 px), egy ténylegesen végigjátszott karrieren:

* egy 266 kB-os mentés kimentése → **267 kB-os fájl**, helyes borítékkal és
  címkékkel; a `mentes` mező tartalma azonos a localStorage-ban lévővel;
* mindhárom hibás fájl (nem JSON · idegen JSON · újabb formátum) a **saját
  üzenetével** pattan le, és a visszatöltő ablak **meg sem nyílik**;
* visszatöltés a 2. helyre → újratöltés után `spSlot()===2`, a két hely
  tartalma **bájtra azonos**, a folytató sáv a helyes csapatot írja, és a
  „Folytatom" után a karrier ott áll, ahol abbahagytad;
* foglalt célnál a piros figyelmeztetés megnevezi a veszélyben lévő
  karriert, az „Előbb mentsd ki" letölti, a „Mégsem" pedig visszavisz a
  helyválasztóhoz;
* szoba-mentésnél nincs helyválasztó, az írás a szoba kulcsára megy, és az
  újratöltés után `MP.activeRoom` a szoba, a **mentési zár** pedig a szoba
  kulcsa — vagyis a karrier nem írhat máshova;
* a fagyasztó zár: `_saveFrozen` mellett a `saveGame()` bizonyítottan nem
  ír, feloldás után újra igen;
* a `dist/index.html`-en a `buildKind()` „kiadott"-at ad, a forráson
  „csalad"-ot, és **mindkét irányban** elutasítják a másik változat fájlját —
  miközben a mezőt még nem ismerő, régebbi fájl mindkettőben átmegy.
