# Panzer: a jellem-fordítás két vége (3.9.88)

## A bejelentett hiba

> „Panzerkampfwagen, fordított jellem maxnál egy ilyen ember toposan pozitív
> kéne legyen az öltözőben. Legkeményebb vérmérséklet, majdnem a legdurvább
> kapcsolati tulajdonság. Valami nem jól van bekötve, ha csak 5ös… Jól van a
> skála megcsinálva?"

A képernyőképen látott ember: **karizma semleges · kapcsolódás nehéz eset ·
vérmérséklet vandál**, Panzer-filozófia, Fordított jellem **3/3**. Az öltözői
hatása **5/10 — „semleges az öltözőben"**.

A panasz jogos volt, és két külön hibát takart.

## 1. hiba — a két tengely ELLENTÉTES végén van a „rossz"

A `traitFlip` minden skálán azt hitte, hogy a **nagy** érték a jó. Csakhogy:

| tengely | 0 | 1 |
|---|---|---|
| kapcsolódás | szorongó — **rossz** | egy igazán jó ember — jó |
| vérmérséklet | földi béke — jó | vandál — **rossz** |

A vandál (nyers 1) így a *„pozitívból lett negatív"* ágra került — arra,
amelyik a **jó fej** embereknek szól, és amelyik a képesség szintjével
**gyengül**. Az eredmény a képesség ígéretének pontos fordítottja:

```
a képernyőkép embere, a hiba ELŐTT
  Panzer, képesség nélkül   7/10  „jó hatással van a csapatra"
  Fordított jellem 1/3      6/10
  Fordított jellem 2/3      6/10
  Fordított jellem 3/3      5/10  „semleges az öltözőben"   ← a képernyőkép
```

**A képesség minden megvett szintje rontott rajta.** A legszélsőbb Panzer-ember
(szorongó + igazi vezető + vandál) ugyanígy 10/10 → 10 → 9 → **9**.

Két további, észre nem vett következménye volt:

* **az öltözői események táblája** (`trVerForroE` / `trVerHiggE`) maxolt
  fordítás mellett is **„forró"** sávba sorolta a vandált — vagyis a negatív
  vérmérséklet-események továbbra is rá sültek el;
* a **kapitány-alkalmasság** levont tőle `vérmérséklet −4`-et (ez látszik is a
  képernyőképen), pedig a fordítás szerint nem járna neki.

A tükör mostantól **mindkét tengelyt a saját rossz végétől** méri
(`traitFlipRaw(x, rosszFent)`).

## 2. hiba — a 0..1-es vágás elnyelte a képességet

A Fordított jellem **„+10% / +25% / +33%"**-ot ígér az erősödő ágon. A szélső
embereknél viszont a tükör már a skála végén landolt, és a vágás pontosan azt
nyelte el, amit a képesség elad:

```
traitFlip(0) — a szorongó ember, kapcsolódás
  lv0  1,000      lv1  1,000      lv2  1,000      lv3  1,000
```

Vagyis **épp azoknál, akikért a képesség van, a gain nulla volt.**

A folytonos morál-számítás (`moraleTraitBase`) ezért mostantól a **vágatlan**
alakot kapja (`kapER` / `verER`); ami sávindexet olvas (`kapIE` / `verIE`),
az továbbra is a vágottat, hogy a `KAP_LEVELS` / `VER_LEVELS` indexelés
biztonságos maradjon.

## Az eredmény

```
a képernyőkép embere, a javítás UTÁN
  filozófia nélkül / Beton   3/10  „többet ront, mint javít"
  Panzer, képesség nélkül    7/10  „jó hatással van a csapatra"
  Fordított jellem 1/3       7/10
  Fordított jellem 2/3       8/10  „az öltöző motorja"
  Fordított jellem 3/3       8/10  „az öltöző motorja"
```

A kapitány-sorából eltűnt a `vérmérséklet −4`, és az öltözői események
táblájában minden szinten a **higgadt** sávba esik.

A „jó fej, higgadt" ember a másik irányba mozog, pontosan úgy, ahogy a
képesség leírása ígéri — 1/10 → 4 → 5 → **7/10**: a csökkentés a 2. szinttől
100% fölé megy, tehát a hatása **visszafordul pozitívba, szerényebben**.

## A skála egésze

A teljes mezőnyön (3609 játékos) az átlagos öltözői fokozat:

| | átlag (1-10) |
|---|---|
| filozófia nélkül | 5,97 |
| Panzer, képesség nélkül | 4,97 |
| Fordított jellem 1/3 | 5,83 |
| Fordított jellem 2/3 | 6,33 |
| Fordított jellem 3/3 | 6,76 |

A skála maga rendben van: filozófia nélkül szép haranggörbe a közepén ül, a
két szélén 0,4% és 0,3% — nem tapad a széleire.

**Egy dolgot érdemes tudni:** a Panzer a képesség NÉLKÜL a mezőny átlagánál
*rosszabb* öltözőt ad (4,97 az 5,97 ellen). Ez nem hiba, hanem a filozófia
természete: a tükör a kapcsolódás-tengelyen egy pozitívba húzó mezőnyt fordít
meg (a keretek 60%-a a „jó" sávban van, és csak 5% a „törött"-ben). A
Fordított jellem 1. szintje már visszahozza az átlag fölé. Ha ez nem a kívánt
belépő-élmény, az a `PANZER_ABS_CUT` nulladik elemének kérdése — egy szám.

## A leírások, amik elavultak

A javítás mellett öt Panzer-szöveg már nem a mai rendszert írta le:

| hol | mi volt elavult |
|---|---|
| **Vasfegyelem** | „A keménység ára megmarad: a lapokat továbbra is összeszeditek." — a 3.9.85 óta a lap épít, nem büntet |
| **Vadhajtások** (+ a fölötte lévő komment) | „a készlet EGYETLEN képessége, ami tudatosan ROSSZABBÁ teszi a csapat helyzetét" — a piros lap fele ez már nem igaz, a sérülésé igen |
| **Megfélemlítés** (komment) | „Az emberhátrány minden más következménye megmarad" — a forma- és Rating-oldali következmény a 3.9.85-tel megfordult; és a szorzó a 3.9.86-ig a párharcban néma volt |
| **Kemény kéz** (`pz_reds`) | „a keménységnek ára van" |
| **Fordított jellem** | **sehol nem mondta, hogy ez a képesség hajtja a lap-rendszert.** A `PZ_CARD_LIFT` az ő szintjét olvassa (×1,35 / ×1,70 / ×2,10), a játékos viszont ezt sehol nem láthatta. Most a leírásban és az élő mérősorban is ott van. |

A Fordított jellem leírása ezen felül most kimondja, hogy a két tengely más
végén van a „rossz" — épp az, amiben a hiba is ült.

## A próba

`node tools/panzer-jellem-fordulat-proba.js` (9027-es port) — 22 állítás: a két
tengely polaritása a 0. és a 3. szinten külön, a kemény ember monoton javuló
létrája, a jó fej ember visszafordulása, a vágatlan alak továbbfutása, az
öltözői sávok, a szivárgásmentesség (Beton és filozófia nélkül betűre a nyers
jellemérték), és a teljes mezőny monoton skálája.
