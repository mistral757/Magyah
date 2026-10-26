# 🧭 Hol férne rá előrelépés a játékra — az animációkon túl (2026-10-26)

> „Az animációk mellett mely területeken férne rá egy előrelépés, fejlesztés a
> játékra? Gyűjtsd ki őket, és kezdjünk velük valamit."

**Miből készült ez a lista:**

* **A mérési napló:** a `meres-adat` ág, 19 karrier, 47 idény, 1614 meccs,
  3.9.206–3.9.297, és a régebbi mentésekből 8 karrier.
* **A betöltés mérése:** valódi böngészőben, CPU-lassítással is.
* **A kód és a próbák átnézése.**

Minden tételnél ott a bizonyíték és az állapot.

---

## 1. ✅ Mindkét gép ugyanazt a verziót futtassa — KÉSZ (3.9.306)

**A baj:**

* A telepített app napokig a régi verzióval ülhet a memóriában.
* A 3.9.298-as hardcore-eset vendége valószínűleg így játszott más
  szabállyal.
* Az eltérés eddig csak a PvP-kézfogásnál derült ki, utólag.

**Megcsinálva:** a játék a kiszolgáló `version.json`-jából látja, ha újabb
verzió van kint. Egy sávval kínálja a mentés + frissítést, és meccs közben nem
tölt újra. Lásd: `docs/uj-verzio-3-9-306.md`.

## 2. ✅ Fejlesztői háló — KÉSZ (3.9.306)

**A baj:**

* ~235 próba volt, de nem volt egyetlen parancs, ami lefuttatja őket.
* A `check.sh` hetek óta piros volt, ezért senki nem vette észre, ha egy új
  hiba is bekerült.

Pontosan ez történt: a `no-undef`-jelzés mögött egy **valódi hiba** bújt meg.
**A párharc-animációk a 3.9.270 óta a gépi ellenfél nevét és erejét
mutatták** a társé helyett.

**Megcsinálva:**

* `tools/futtat.js`: párhuzamos, portütközés nélkül, összesít, takarít;
* a `check.sh` újra zöld;
* a párharc-hiba javítva.

**Az első teljes regresszió** eredménye a lap alján.

## 3. 📦 Letöltési méret és betöltés — JAVASLAT, döntés kell

**Mérve:**

| | méret | gzip | betöltés (CPU×1) | betöltés (CPU×4) |
|---|---|---|---|---|
| a mostani `index.html` | 8,56 MB | 2,98 MB | ~0,67–0,91 s | ~2,9–3,3 s |
| kommentek nélkül | ~6,1 MB | **1,76 MB (−41%)** | ~0,54–0,58 s | ~2,6–2,7 s |
| tömörítve (minify) | ~4,7 MB | 1,50 MB (−50%) | ~0,48–0,58 s | ~2,2–2,4 s |

* **A fő szkript 8,0 MB, ebből 3,25 MB tömbkomment.** A kommentek a
  fejlesztés naplói, a repóban a helyükön vannak, a telefonnak viszont nem
  kellenek.
* **A betöltés idejének nagy része a szkript feldolgozása** (a „program”
  szelet ~0,8 s CPU×1-en). A játék saját indító kódja csak ~0,13 s.
* **A fő nyereség a hálózaton van:** mobilneten 1,2 MB-tal kevesebb
  letöltés minden frissítésnél.

**Miért nem csináltam meg magamtól:** a kiszolgáló most a repó
`index.html`-jét adja ki, build-lépés nélkül. A kommentmentes változathoz a
**Netlify-felületen** kellene egy build-parancsot és egy publikálási mappát
beállítani. Ez a te beállításod.

**A javaslat:**

* egy `tools/telepites/build.js` (esbuild, csak kommenteket vesz ki, nem
  nevez át semmit);
* a Netlify build-parancsa erre mutatna;
* a repó `index.html`-je változatlan maradna, a próbák is azon futnának;
* egy próba pedig összevetné a két változat működését.

## 4. ⚖️ A késői idények túl könnyűek — FIGYELÉS, a 3.9.302 hatását várjuk

**Mérve** (a Firebase-napló, 3.9.206–3.9.297, minden mód):

| idény | meccs | győzelem | gól/meccs (lőtt:kapott) | ⚡-fölény (medián) |
|---|---|---|---|---|
| 1. | 620 | 64% | 2,46 : 1,13 | +3,1 |
| 2. | 446 | 78% | 3,86 : 0,85 | +5,2 |
| 3. | 307 | 86% | 5,24 : 0,83 | +8,7 |
| 4. | 189 | **100%** | 6,94 : 0,36 | +16,4 |
| 5. | 52 | **100%** | 8,60 : 0,17 | +44,3 |

**A 3. idénytől a játék eldőlt.** A meccserő-fölény idényenként nagyjából
duplázódik, a 4. idénytől nincs vereség.

**Ezt célozta a 3.9.302** (a mezőny idény közbeni erősödése, 2. szerződés).
Csak új karrierekre hat, ezért a fenti adatban még nincs benne.

**Következő lépés:**

* ha lesz 3.9.302 utáni, legalább 3 idényes karrier a naplóban, ugyanez a
  táblázat a `gyv=2` karrierekre;
* ha a 3–4. idényben még mindig 90% fölött van a győzelem, a T(fok) görbe
  felső része emelendő.

## 5. 💰 A pénz idényenként egy-két nagyságrendet ugrik — VIZSGÁLANDÓ

**Mérve:** a bevétel mediánja idényenként

| idény | medián bevétel | szorzó az előző idényhez |
|---|---|---|
| 1. | ~11,7 e | — |
| 2. | ~86 e | ×10,7 |
| 3. | ~22 M | ×170 |
| 4. | ~482 M | ×45 |

* **Ez részben szándékos:** az árak a büdzséhez skálázódnak
  (`budgetPriceScale`, 20 Mrd fölött a gyöke szerint).
* **A kérdés tehát nem a nyers szám**, hanem a vásárlóerő: hány mezőnyszintű
  játékos ára a büdzsé.

**Következő lépés:** egy normalizált mérőszám a naplóba (büdzsé / a
mezőnyszint ára), és idényenként kirajzolni. Ha ez is robban, akkor van
valódi pénzbaj.

## 6. 🧭 Átláthatóság és belépés — ÖTLET

**A baj:** a játékban nagyon sok rendszer van: stílus, talizmánok, stáb,
akadémia, scout, edző, hangsúlyok, csapatszerepek, piramis, kupák, PvP.

A 3.9.303 óta az **edző a játék hangja** a meccs körül. Ez a minta
kiterjeszthető:

* **„Mi nyílt meg?”:** idény elején az edző egy rövid listában mondja, mi új
  és mi a következő lépés;
* **„Mit csináljak most?”:** a HUB tetején az edző egyetlen javaslata (pl.
  „3 posztod gyenge, nézd meg a scoutot”).

## 7. ♿ Hozzáférhetőség — FELMÉRENDŐ

**Még nem mértem.** Érdemes lenne:

* a betűméretet egy beállítással nagyíthatóvá tenni;
* a kontrasztot témánként megmérni;
* a gombokra címkét tenni (`aria-label`) a képernyőolvasóknak.

---

## Az első teljes regresszió (3.9.306)

`node tools/futtat.js -j 4 --ido 420`, 234 próba, 712 mp:

**227/234 zöld · 4432 teljesült és 11 bukott állítás.**

| próba | ok | mi lett vele |
|---|---|---|
| `kommentar-ikon` | **valódi lemaradás:** a 3.9.293-as hosszú bedobás két kommentárja nem kapott típusjelet | javítva: 🚩 pontrúgás |
| `talizman-f5` | a forrásminta nem ismerte a 3.9.293-as szabadrúgó-szorzót | a minta frissítve (a talizmán a helyén volt) |
| `nevmod-boot` | pontosan 7 filozófus-edzőt várt, azóta 8 van | ≥7 |
| `akademia-ablak` | seed nélküli statisztika, a tűrés csak ~2,7σ volt (~5% vakriasztás) | ±60% ≈ 3,5σ |
| `jelzesek-3-9-172` | fix 2,8 mp várakozás, terhelt gépen kevés (önmagában 3/3 zöld) | legfeljebb 6 mp-ig lesi |
| `szezon-iv` | **a futtató hibája:** a régi próbák egy része a portját csak az URL-ben nevezi meg, és két 8977-es egyszerre futott | a futtató most minden portalakot felismer |
| `sargalap` | a 3.9.33-as mérőszkript a régi, klubválasztós indítási úton kattint | **elavult, nem javítva**; ha kell a sárgalap-mérés, az új indítási útra kell átírni |

**Az újrafuttatás után: 8/9 zöld.** Egyedül a `sargalap` maradt piros. A
párharc-animáció hibáját (1. pont) a `check.sh` fogta meg, nem a próbák.
