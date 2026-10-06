# 📈 Az első mérési adatok — 8 karrier mentéséből (2026. október)

> „Ezeket mennyire tudod felhasználni arra, hogy beépítsd az elemzésbe?
> Ameddig adatokat gyűjtünk addig esetleg itt lehetnek ezek :)"

## Mit lehet kinyerni egy mentésből

**A mentés-export elég sokat tud.** A `tools/meres/mentesbol.js` a mérő
naplóformátumára fordítja, így az összegző ugyanúgy kezeli, mint a
játékban gyűjtött naplót.

| Adat | Mentésből | A 3.9.206-os mérőből |
|---|---|---|
| Helyezés, pont, gólok idényenként | ✅ | ✅ |
| Mezőny ereje az idény végén | ✅ | ✅ (elején és végén is) |
| Saját erő | ⚠️ csak a kezdő XI átlaga az idény végén | ✅ csapaterő ÉS meccs-erő, elején és végén |
| Osztály idényenként | ⚠️ becsült (a helyezésekből; közös szobában nem jön ki) | ✅ |
| Főkönyv (bevétel, kiadás kategóriánként) | ✅ | ✅ |
| Eladások | ✅ darab és összeg | ✅ távozók |
| Kezdő keret | ⚠️ nevek, draft-kori érték, POT, kor — attribútumok nélkül | ✅ minden adat |
| Kezdő beállítások | ⚠️ a scout és az ügynökség a mostani | ✅ a rajtkori |
| Meccsenkénti sor, büdzsé-idősor | ❌ | ✅ (1. idény) |
| Érkezők forrása (ifi, scout, vásárlás) | ❌ csak a vásárlásra költött összeg | ✅ |

**Az adatkészlet:** `tools/meres/adat/mentesekbol-2026-10.json` — 8 karrier,
46 lezárt idény, névtelenítve. A nyers mentések nem kerültek a repóba,
mert az nyilvános.

## Az óvatosság

* **Régi verziók:** a nyolc karrier a 3.9.77 és a 3.9.174 közötti
  verziókon futott. Azóta a balansz több ponton változott (például a
  kezdőrúgás-horgony, a felfedezési sáv, a fizetések).
* **Kis minta:** nyolc karrier, és valószínűleg kevés játékostól — a
  játékos tudása is benne van.
* **Ezért ezek IRÁNYOK, nem mért állandók.** A számokat az új mérő
  adataival kell majd ellenőrizni.

## Amit az adat mutat

### 1. A karrier a 3. idénytől szinte mindig bajnoki cím

**A számok:**

* lezárt idény: 46, ebből cím: **32 (70%)**;
* a 3. idénytől: 30 idény, ebből cím: **25 (83%)**;
* az 1. idény helyezései: 2, 13, 3, 1, 1, 4, 5, 5 — itt még van küzdelem.

**A sebesség-beállítás nem harap:**

| Sebesség | Karrier | Lezárt idény | Cím |
|---|---|---|---|
| 💀 Végtelen menet | 3 | 19 | 16 (84%) |
| 🔥 Kegyetlen | 3 | 17 | 9 (53%) |
| ⚔️ Könyörtelen | 1 | 4 | 3 |
| 🚶 Lassan követnek | 1 | 6 | 4 |

A „Végtelen menet” („a mezőny elhúz”) a gyakorlatban a legtöbb címet hozta.
Mindhárom végtelenes karrier újabb verzión (3.9.146, 3.9.174) futott, tehát
ebben a kezdőrúgás-horgony is benne lehet — de a leírt ígérettel
(„meddig bírod”) ez nincs összhangban.

### 2. A siker nem a játékosok értékéből jön

**9 idényben volt a kezdő XI átlaga a mezőnyé alatt vagy azzal egyenlő.**
Ebből **8 végződött címmel**, egyszer 13,8 ponttal a mezőny alatt.

* Példa: XI 167, mezőny 167 → **30 győzelem, 195:13**, „A tökéletes szezon”.
* **Az előnyt a meccs-erő bónuszai adják:** morál, edző, kapitány, taktika,
  stílus, összhang, skillek.
* Ugyanebben a karrierben a 8. idény kezdőrúgásakor:
  * a meccs-erő 202,6;
  * a csapaterő 179,7;
  * a 7. idény végi XI-átlag 167.
* **A bónuszok tehát kb. +23-at adnak a csapaterőhöz, +35-öt a XI-átlaghoz.**

**Következmény az egyszerű nehézségre:**

* a nehézséget a meccs-erő nyelvén kell mérni és tartani, nem a
  játékos-értékekén;
* a 3.9.206-os mérő ezért rögzíti meccsenként a saját és az ellenfél
  meccs-erejét.

### 3. A játékos-értékek gyorsan nőnek

* **A kezdő XI átlaga idényenként átlagosan +12-t nő** (karrierenként 4 és
  18,7 között).
* 85–89-ről **4–8 idény alatt 110–183-ra.**
* A POT ezzel együtt robban (a késői kerettagoknál 100 000 fölött) — és a
  piaci ár a POT-ból számol.

### 4. A pénz elveszti a jelentését

**A szezonkeret** az első idényről az utolsóra **5-szörösére–2872-szeresére**
nő.

**Három sztár-eladás** (a „Sztárom a párom” sztárja, `saleStar`):

| Idény | Eladási ár | Az az évi szezonkeret | Arány |
|---|---|---|---|
| 4. | 513,3 M | 123 255 | **≈ 4200×** |
| 4. | 204,9 M | 352 519 | **≈ 580×** |
| 4. | 0,53 M | 51 912 | ≈ 10× |

**Az első után** a befektetés (jövőre kétszeres hozam, a büdzsé feléig)
256 M-ból 512 M-ot csinált.

**Onnantól a pénz nem korlát.** Egy ilyen eladás után a karrier
gazdasági része véget ér.

## Amit érdemes eldönteni (javaslatok — semmi nincs módosítva)

1. **Sztár-eladás plafonja:**
   * a sztár eladási ára legyen az éves szezonkeret valahányszorosához kötve
     (például legfeljebb 3–5×);
   * vagy a POT-ból számolt piaci ár kapjon felső határt a mezőny szintjéhez
     mérve.
2. **A sebesség és a nehézség ígérete:** a meccs-erő bónuszainak
   idényközi növekedését is be kellene számítani a horgonyba — most a
   rajtkor beállított rés az idény során elolvad.
3. **Az egyszerű nehézség alapja:**
   * a mérendő cél az, hogy a 3. idénytől se legyen 80% fölötti a címarány
     a közepes fokozaton;
   * a kezdő osztály pedig érezhetően számítson (a D6-ról indulók 5–7 idény
     alatt értek fel).

**Ami a mérőből még hiányzik ehhez,** az a meccs-erő bontása
(mennyi jön a morálból, az edzőből, a taktikából, a stílusból). Ez a
következő lépés lehet.
