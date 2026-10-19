# 3.9.257 — A csapatstílus-rendszer egységesítése (felfelé)

> „Van egy-két következetlenség a csapatstílus-szerepeknél. Ellenőrizd, hogy a
> rendszer mindegyik stílusnál ugyanúgy működjön. […] A csapatstílusok saját
> belső pontrendszere, amit idővel meccserővé lehet alakítani, túlságosan le
> lett lassítva. […] Nézd át az egész csapatstílus-rendszert, hogy legyen
> következetes, egyenletes az egyes stílusok működése. És semmiképp ne nehezíts
> rajtuk. Ha kiegyenlítesz, akkor felfelé."

Ez a 3.9.256-os nyolcpontos lista 2. pontja.

## 1. Mit mutatott az átnézés

| | Panzer | Villám, Bombázók, Beton, Harmónia, Tiki-taka, Gegen | Sztár |
|---|---|---|---|
| állapot → valuta → meccserő-szint | ✔ (félelem → rettenet → Rettegés) | ✔ (közös motor) | **✘ nem volt** (a híresség csak pénzt hoz) |
| az állapot négy tényezőből (3.9.127) | **✘ csak a jellem** | ✔ | — |
| szerep-attribútum („az EMBER is számít”) | ✔ | ✔, **a Tiki-takánál ✘** | ✔ |
| árlétra a 10. szintig | 13 870 | 13 870 | — |
| meccserő-plafon | +20 (fix) | +12 (fix) | — |

**A lassúság oka (mérve):** `tools/meccsmotor/stilus-pontbevetel.js`, valódi
meccsmotor, draft keret, +1,5-ös fölény.

* Egy meccs ennyit hozott: Panzer 1,7–2,4 · Villám 3,8 · Beton 5,9 ·
  Harmónia 7,8 · Tiki-taka 5,5 · Gegen 2,7 · Bombázók 1,0 (gyenge
  gólszerzésű keretnél).
* Ez idényenként nagyjából 70–300 pont.
* A régi árlétra a 10. szintig 13 870 pontba került, vagyis több tucat
  idénybe.
* A 3.9.139-es ív után az n. szint a plafon n/10-ét engedi. Így a 4–5.
  szint, ahová egy karrier eljutott, csak +4,8–6 meccserőt adott.
* A plafon fix volt: egy 350-es mezőnyben a +12 a csapaterő 3%-a.

## 2. Mi változott

Minden változás felfelé hat, és mind a nyolc stílusnál ugyanúgy.

### 2.1 Árlétra: ~5,5-ödére

| szint | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| ár most | 40 | 60 | 90 | 130 | 180 | 240 | 310 | 390 | 480 | 580 |
| összesen most | 40 | 100 | 190 | 320 | 500 | 740 | 1 050 | 1 440 | 1 920 | **2 500** |
| összesen régen | 150 | 410 | 830 | 1 470 | 2 390 | 3 670 | 5 370 | 7 570 | 10 370 | **13 870** |

A motor és a Panzer mostantól ugyanazt a táblát olvassa
(`ENG_PRICE = RETTEGES_PRICE`), így a kettő nem csúszhat szét.

### 2.2 Kapu: két szinttel lejjebb

Az n. szinthez (2+n). csapatstílus-szint kell. Régen 4+n volt: az első szint a
3., a tizedik a 12. stílusszinten nyílik.

### 2.3 Meccserő: nő a mezőnnyel

A plafon, az ív és a nyers hozam is a mezőny/100-zal szorzódik
(`styleFieldScale`). Ugyanez a szabály, mint a boostok Rating-ugrásánál.

| mezőny | szorzó | motor plafon | Panzer plafon |
|---|---|---|---|
| ≤ 100 | ×1 (betűre a régi szám) | +12 | +20 |
| 200 | ×2 | +24 | +40 |
| 350 | ×3,5 | +42 | +70 |

A 15. stílusszinttől nyíló tető és a másodlagos filozófia feles plafonja is
ugyanígy skálázódik. A panel kiírja a szorzót.

### 2.4 Panzer: megkapta a négy tényezőt

A félelem szint mostantól ugyanabból a négy tételből áll, mint a többi
stílus állapota, ugyanazokkal a tetőkkel:

| tényező | Panzer | tető |
|---|---|---|
| 📐 A keret jelleme | a régi bázis, betűre | — |
| 🔺 A legfélelmetesebb három | a három legijesztőbb ember, fejenként ≤ 10 | 30 |
| 🤝 A falka összetartása | az öt legfélelmetesebb ember kötései | 24 |
| ✨ Kőkemény képességek | a keret kész védő-képességei | 18 |

A félelem szint így sosem kisebb a réginél. A panel ugyanúgy bontja ki, mint
a motoros stílusoké.

### 2.5 Tiki-taka: az ember is számít

A három szerep megkapta azt a szerep-attribútum szorzót, ami a többi stílus
szerepeinél már megvolt. A kártyán ugyanaz az „Az EMBER is számít” sor áll.

* **Stabil kezdés:** Passz (mindkét hatása).
* **Lát a pályán:** Passz. A darabszám (hány társ passzát váltja ki) nem
  szorzódik.
* **Aurafarmer:** a Gól és a Passz átlaga („Jegyzőkönyv-erő”).

**A padló ×1.** A Tiki-taka szerepei eddig szorzó nélkül, vagyis ×1-en
álltak. Egy kiugró passzoló most ×1,45-ig erősíti őket, egy gyengébb viszont
nem viheti a régi szám alá. Ez a „semmiképp ne nehezíts” kérés miatt van így.

### 2.6 Sztár: saját meccserő-gazdaság

A Sztár volt az egyetlen filozófia, aminek nem volt meccserővé váltható
pontrendszere. A híresség marad, ami volt: pénzt, tömeget, eseményeket ad.
Mellé került a közös motor:

* **Állapot (ragyogás):** négy tényező.
  * 📐 **Kiemelkedés:** mennyivel áll a sztár a tíz legjobb társa fölött
    (10%-nál teljes), plusz a híresség szintje.
  * 🔺 **A sztár csúcsa:** a három legjobb attribútuma 85 fölött.
  * 🤝 **A kiszolgálók:** a sztár kötései a négy legjobb társával.
  * ✨ **A sztár képességei:** a saját kész képességei, négynél a maximum.
* **Valuta (csillagpont):**
  * a sztár gólja: 1,2;
  * a sztár gólpassza: 0,8;
  * bármely gól: 0,3;
  * a sztár a lefújáskor a pályán áll: 1,0.

  Mérve 3,3 pont/meccs, a Villám és a Gegen sávjában.
* **Szint (Reflektorfény):** ugyanaz a létra, ár, kapu és +12-es (skálázott)
  plafon, mint a többi motoros stílusnál.
* **Bolt (🚪 Az öltöző):**
  * 🔦 **Reflektorfény:** egy meccs, gólesély +6%, 30 pont.
  * 🍷 **Vacsora a sztárral:** két ember összhangja +8, 85 pont.
  * 🏋️ **Méltó társ:** a kezdő leggyengébbje edzés-gyorsítást kap, 120 pont.

## 3. Ami szándékosan maradt

* **A Panzer erősebb.** A Panzer +20-a a többiek +12-je ellen marad
  (3.9.105, a projektgazda „b” döntése): ez a filozófia ára ott, és a
  jutalma itt.
* **Box-to-box.** A Villám sebesség-alapú illeszkedés-bónusza a szerep saját
  mechanikája. A Tiki-taka Látnokának és a Gegen Irányítójának megvan a saját
  taktika-illeszkedés hatása.
* **A százalék-létrák (`ENG_PCT`, `RETTEGES_PCT`) nem változtak.** A 3.9.139-es
  mérés szerint egy középkarrieres keret állapota 300 fölött van, ott az ív
  dönt, nem a százalék.

## 4. Próbák

* `tools/stilus-letra-3-9-257-proba.js` (valódi böngészőben) méri:
  * az árlétrát és a kaput;
  * a mezőny-skálát (85 / 100 / 350, motor és Panzer);
  * a Panzer bontását (a mélység a régi bázis, a szint ≥ a régi);
  * a Tiki-taka szorzóit és a ×1-es padlót;
  * a Sztár motorját (tényezők, tarifa, „pályán” tétel, szintvétel, panel);
  * az oldalhibákat.
* `tools/meccsmotor/stilus-pontbevetel.js` a pontbevételt méri valódi
  meccseken, stílusonként.
* A `stilus-motor-proba.js` és a `panzer-felelem-proba.js` az új számokat
  várja: hét motoros stílus, négy tényezős félelem, 2+n kapu.
