# 📖 Egy Könnyed PvP közös karrier négy idénye — 8.1 Legendás (3.9.342)

> „Most írd le nekem részletesen egy példában demonstrálva, hogyan fut le
> egy könnyed PvP közös karrier jelenleg 8.1 nehézségen. Legyen a két külön
> csapatnak külön útja, erősödése, stb. 4 szezon legyen, mutatva, hogy
> mikor játszanak egymás ellen, hogyan nehezedik szezonon belül a mezőny,
> hogyan mérjük, hogy mennyire kell erősödjön, 5 fordulónként milyen
> méréseink vannak benne, a seed hol hogyan hat stb."

## Hogyan készült

A példa számai **modell-számításból** jönnek. A modell a játék
**saját képleteit és paramétereit** használja; ezeket egy betöltött
játékból olvastam ki (3.9.342):

* a rajt-cél és a súlyozott meccs-erő;
* az emelés és a fék;
* az alap ütem;
* az idény közbeni gyorsulás és a beragadás-őr;
* a téli felmérés, az 5 fordulós rés-követés és a boost-adósság;
* a párharc gólvárhatósága.

**Amit feltételeztem, és nem a játék számol:**

* **A két csapat fejlődési üteme.** A ti mért mediánjaitokból
  (magyah-meres, 3.9.302) indultam ki: idényenként +17 / +25 / +36 / +41%.
* **A helyezések.** A fel- és kiesés véletlen. A játék a 8.1-es fokozatra
  ennyit vár: **feljutás ≈23%, bajnoki cím ≈7%, beragadás ≈36%**, ha a rés
  végig a célrésen jár.

Ahol egy szám példa, és nem képletből jön, azt jelölöm.

---

## 0. A beállítás — amit szoktatok

| | érték | honnan |
|---|---|---|
| Fokozat | **8.1 Legendás** — célrés **+0,4** | NF_LEVELS: 8. fok 0,4; a belső szint a 6. foktól −0,1/szint |
| Ellenfelek tempója | 🏃 Lépést tartanak | a ti mentésetek |
| Tempó (mind a négy tengely) | Normál (×0,80) | a ti mentésetek |
| Ikonok · képességek · scout | teljes · realisztikus · valósághű | a ti mentésetek |
| Tél · holtsáv | normál (tűrés **+0,5**) · **1,75** | a 8.1-es csomag |
| Bajnokság | 🌍 **Könnyed — saját bajnokság** | |
| Kezdés | draft, **D3 · Magyah Élmezőny** | |
| Folyamatos rés-követés és boost-adósság | **be** | új karrierben eleve be van kapcsolva |

> A 8.1-es csomag hivatalos elemei **Gleccser** tempó és **nagyon ritka**
> ikonok. Nálatok ezek zárolva vannak, ezért a legközelebbi nyitott értéket
> kapjátok (Normál, teljes). A hivatalos szint így „✏️ Egyéni ≈ alacsonyabb"
> lesz. **A célrés viszont +0,4 marad**, és a mezőny ehhez igazodik.

**A két csapat a példában:**

| | A — házigazda | B — vendég |
|---|---|---|
| Rajt meccs-erő (⚡) | 87,0 | 86,0 |
| Fejlődés idényenként (rajt → zárás) | +17% · +25% · +36% · +41% (a ti mediánotok) | +12% · +18% · +28% · +33% (lassabb építkezés) |
| Nyári igazolás (zárás → következő rajt) | +4% · +3% · +3% | +2% · +2% · +2% |
| Boostolás a kezdőrúgás után | 2. idény 10. forduló: +2,0 ⚡ a kezdő 11-re | 2. idény 12.: +3,0 · 3. idény 8.: +2,0 |

---

## 1. Indulás: a szoba, a seed, a draft

1. **A szoba.**
   * A házigazda állítja be: tempó, szigorúság, 🌍 Könnyed, fokozat 8.1.
   * Az új **🏟 Kezdő osztály** legördülőben (3.9.342) a D3-at választja.
   * A beállítás-csomag a szobán át megy a vendéghez.
2. **A világ-seed.** A szobakódból és a világ-magból jön, a két gépen
   ugyanaz. Ebből épül:
   * mindkét gép **saját piramisa**: 6 osztály, 15 gépi ellenfél, 30
     forduló, a párharc nincs a menetrendben;
   * a **draft-pool** és annak sorrendje (közös);
   * a világ tengelyei (sorsolás, válogatottak, ikonok), ezek a
     házigazdáéi.
3. **A két világ külön él.** Külön a mezőny, a tabella, a fel- és kiesés, a
   piac és a tabellás bajnoki. Közös marad öt dolog:
   * a **célrés-hangolás** (a kettőtök átlaga);
   * a **párharc-napok**;
   * a **nyári kupa-program**;
   * a **seedelt események** sora;
   * a **Run-összevetés**.

---

## 2. Egy idény szerkezete (30 forduló)

```
1 ─ 8 │ ablak (rövid) │ ⚔ I. │ 9 ─ 15 │ ablak (téli) │ ⚔ II. │ 16 ─ 23 │ ablak (rövid) │ ⚔ III. │ 24 ─ 30 │ ⚔ IV. │ nyár: célrés-ablak → kupa → kezdőrúgás
     a szakasz                b szakasz                     c szakasz                    d szakasz
```

* **Az átigazolási ablakok** a 8., a 15. és a 23. forduló után nyílnak. Ezek
  egyben a kihívás-checkpointok: a téli ablakban dupla vételi keret és 2
  esemény van, a rövid ablakokban 1.
* **A ⚔ párharc-napok** minden szünet után jönnek, az ablak után, a
  következő bajnoki előtt (3.9.338). Az I. és a III. nap hazai csapata a
  házigazda, a II. és a IV. napé a vendég. A IV. zárja az idényt. *(A már
  futó, régi idény 2 nappal megy végig.)*
* **A seed-szakaszok** az **a, b, c, d** (lásd a 8. fejezetet).
* **Az 5 fordulós mérés** az 5., 10., 15., 20. és 25. forduló után fut.
* **A nyár menete:**
  1. célrés-ablak, közös;
  2. kupa-nevezés, közös;
  3. a közös nyári program;
  4. kezdőrúgás és a mezőny beállítása.

---

## 3. A nehézség gépezete — a képletek

### 3.1 A kezdőrúgás: hova áll be a mezőny

```
rajt-cél  = célrés − dg / 2
            dg   = az előző 1–2 idény mért, idényen belüli rés-változása (átlag; −6 … +20)
            ha még nincs mérés (1. idény): a modell — rajt + (sodródás(rajt) − ütem)/2 = célrés
W         = (indító ⚡ × 1,25 + tavalyi záró ⚡) / 2,25        ← a súlyozott meccs-erő
a mezőny  = W − rajt-cél
```

* **Ha a mezőnynek feljebb kell kerülnie**, mint ahol magától állna, a
  játék **emeli**.
* **Ha lejjebb kellene,** és a rés a holtsávnál (1,75) mélyebb, akkor
  **fékez**: a mezőny legfeljebb egy éves ütemnyivel kevesebbet nő.
  Gyengülni nem gyengül.
* **A súlyozás következménye.** A nyári fejlesztés ≈44%-a a tiéd marad
  (lásd a 3.9.289-es doksit). Ha nyáron erősödtél, a valódi rajt-rés a
  rajt-célnál ennyivel jobb:

  ```
  (indító − W) = (indító − záró) / 2,25
  ```

### 3.2 Az idény alatt: hogyan nő a mezőny

```
a mezőny a j. forduló után = rajt-mezőny
                           + alap ütem × j/30                      (D3: 5,26 · D2: 5,38 · D1: 5,49 / idény)
                           + gyorsulás (fordulónként E/30, ha a beragadás-őr engedi)
                           + téli emelés (csak az 1. idényben; a fele azonnal, a fele 15 forduló alatt)
                           + rés-követés emelései (a 2. idénytől; mindegyik 5 forduló alatt fut fel)
                           + boost-adósság (a kezdőrúgás utáni boostok kezdő 11-re eső nyereségének fele)
```

**A gyorsulás (3.9.302)** az egész idényre szól:

```
E = mezőnyszint × R(idény) × P(pénz) × T(fokozat) × K(kezdet) − alap ütem
```

* **R(idény)** = 0,09 + 0,085 × idény, vagyis 17,5% · 26% · 34,5% · 43%.
  Ez a ti mért fejlődési görbétek.
* **P(pénz)**: Normál pénz-tempó mellett (0,80/0,45)^0,6 = **1,41**.
* **T(8.1)** = 0,30 + 0,70 × (8,1 − 1,1)/7,4 = **0,962**.
  * A 8.5-ös fokozat pont a mért fejlődésetek (1,00).
  * A 9.1-től fölétek megy (1,10 + 0,25 fokozatonként).
* **K(kezdet)**: az 1. idényben **0** (9.1 alatt), a 2.-ban 0,75, a 3.-tól 1.

**A beragadás-őr.** Abban a fordulóban, amikor a ⚡-előnyöd a célrés (+0,4)
alatt van, **nincs gyorsulás**. A mezőny a jókat követi, a lemaradókat nem
taszítja tovább.

### 3.3 A mérések

| mikor | mit mér | mi történik |
|---|---|---|
| **minden forduló után** | a nyers rés: ⚡ − a mezőny, a követés és az adósság nélkül | feljegyzi (`kov.g[forduló]`); a gyorsulás fordulónként dönt (őr) |
| **az 1. idény 15. fordulója után** — téli felmérés | rés > célrés + tűrés (0,4 + 0,5 = 0,9)? | a különbséggel nő a mezőny (fele most, fele a hátralévő fordulókban) |
| **a 2. idénytől az 5., 10., 15., 20., 25. forduló után** — rés-követés | az utolsó 5 forduló átlagos résének eltérése a **várt pályától** | ami a pálya fölött jár (a már futó emelések és a boost-adósság levonásával), azt az ellenfelek a következő 5 fordulóban fokozatosan behozzák |
| **minden boost után** (a kezdőrúgás után) | a kezdő 11-re eső ⚡-nyereség | a fele boost-adósságként az idény hátralévő bajnokijain az ellenfelekhez kerül |
| **a 30. forduló után** — idényzárás | a záró rés (a követés és az adósság nélkül) | **dg = záró rés − rajt-rés + téli emelés** → ebből jön a következő idény rajt-célja |

**A várt pálya:**

```
pálya(j) = rajt-rés + dgBecslés × j / 30 + tűrés (0,5)
```

* **A dgBecslés** a korábbi idények mért rés-változása. A rendszer azt várja,
  hogy idén ugyanannyit nősz el, ezért a rajtnál ennek a felével
  keményebben indít.
* **Hol kell állnod.** Ha a pálya alatt jársz, nincs emelés. Ha fölötte, az
  ellenfelek behozzák.

---

## 4. A négy idény — A (házigazda)

| idény | osztály | ⚡ rajt → zárás | a mezőny rajt → zárás | rajt-rés | átlagos rés | záró rés | E (gyorsulás) | ebből ténylegesen | őr-szünet | téli / követés / adósság | dg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. | D3 | 87,0 → 101,8 | 86,8 → 96,1 | **+0,17** | **+3,56** | +5,7 | 0 (K=0) | 0 | – | **téli +4,0** | **+9,5** |
| 2. | D2 | 105,9 → 132,3 | 108,4 → 132,6 | **−2,55** | +0,50 | +0,5 | 23,4 | 17,1 | 8 forduló | követés +0,7 · adósság +1,0 | +4,0 |
| 3. | D1 | 136,3 → 185,4 | 137,5 → 185,1 | −1,22 | +0,81 | +0,3 | 59,0 | 41,3 | 9 forduló | követés +0,8 | +2,3 |
| 4. | D1 | 190,9 → 269,2 | 189,6 → 268,8 | +1,30 | +1,12 | +0,4 | 105,3 | 73,7 | 9 forduló | – | −0,9 |

**A kezdőrúgások (A):**

| idény | dg-átlag | rajt-cél = 0,4 − dg/2 | W (súlyozott) | a mezőny | magától | emelés |
|---|---|---|---|---|---|---|
| 1. | — (modell) | **+0,17** | 87,0 | 86,8 | — | a horgony |
| 2. | 9,5 | **−4,36** | 104,1 (indító 105,9, záró 101,8) | 108,4 | 99,1 | **+9,3** |
| 3. | 6,8 | −2,98 | 134,5 | 137,5 | 116,8 | **+20,7** |
| 4. | 3,1 | −1,17 | 188,5 | 189,6 | 143,0 | **+46,6** |

**A 2. idény rajtja.** A rajt-cél −4,36, a valódi rajt-rés mégis −2,55. A
különbség (+1,8) a nyári igazolás 44%-a a súlyozás miatt:
(105,9 − 101,8) / 2,25.

**Az 5 fordulós mérések (A, 2. idény):**

| forduló | élő rés | pálya | az 5 forduló átlaga a pálya fölött | már futó (követés + adósság) | új emelés |
|---|---|---|---|---|---|
| 5. | +0,96 | −0,46 | +0,66 | 0 | **+0,7** |
| 10. | −0,33 | +1,13 | +0,71 | 1,7 (benne a 10. fordulós boost adóssága) | 0 |
| 15. | +0,85 | +2,71 | +0,46 | 1,7 | 0 |
| 20. | +0,47 | +4,30 | −1,35 | 1,7 | 0 |
| 25. | +0,87 | +5,89 | −2,69 | 1,7 | 0 |

**Mit mutat ez?** A 2. idénytől a **gyorsulás és a beragadás-őr** viszi a
nehézséget.

* A mezőny fordulónként E/30-cal nő (2. idény ≈0,78, 3. ≈1,97, 4. ≈3,5),
  amíg a résed a célrés (+0,4) fölött van.
* Ha alá esel, a gyorsulás megáll, és a fejlődésed visszahúz.

A rés így a célrés körül ingázik: az idény átlaga +0,5 … +1,1. A
rés-követés csak az idény elején szól bele, mert a pálya a dgBecsléssel
gyorsan elhúz fölötte.

---

## 5. A négy idény — B (vendég)

| idény | osztály | ⚡ rajt → zárás | a mezőny rajt → zárás | rajt-rés | átlagos rés | záró rés | E | ebből | őr-szünet | téli / követés / adósság | dg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. | D3 | 86,0 → 96,3 | 85,8 → 92,9 | +0,17 | +2,09 | +3,4 | 0 | 0 | 1 | **téli +1,8** | +5,1 |
| 2. | D3 | 98,2 → 115,9 | 99,5 → 115,6 | −1,27 | +0,26 | +0,3 | 21,1 | 9,1 | **17 forduló** | követés +0,2 · adósság +1,5 | +3,3 |
| 3. | D2 | 118,2 → 151,4 | 118,9 → 152,3 | −0,65 | +0,39 | +0,7 | 50,4 | 26,9 | 14 | követés +0,2 · adósság +1,0 | +0,9 |
| 4. | D2 | 154,4 → 205,3 | 153,7 → 206,9 | +0,72 | +0,62 | +1,3 | 84,4 | 47,8 | 13 | – | −2,3 |

**B a lassabb építkező.** A beragadás-őr nála a 2. idényben 17 fordulón át
tartja vissza a gyorsulást. A mezőny így az ő tempójához igazodik, nem
taszítja le. A boost-adóssága (+1,5, majd +1,0) az idény hátralévő részére
erősíti az ellenfeleit.

**A kezdőrúgások (B):** rajt-cél 2. idény −2,13 (dg 5,1) · 3. −1,68 · 4.
−0,63. Az emelés +6,6 · +11,1 · +29,4.

---

## 6. ⚔ Mikor játszanak egymás ellen — és mi a tét

Ebben a példában minden idény 4 napos (új karrier). A párharc **a két
abszolút ⚡-t** veti össze, a közös eseménylistából. A momentum és a
statisztika is közös (3.9.336). Pálya: hazai +0,9, idegen −0,3, és
**1 ⚡ ≈ +13% gólvárhatóság**.

| idény | nap | forduló után | A ⚡ | B ⚡ | hazai | különbség | xG | A győz · döntetlen · B győz |
|---|---|---|---|---|---|---|---|---|
| 1. | I. | 8. | 90,9 | 88,7 | A | +3,1 | 1,89 : 0,90 | 61% · 22% · 17% |
| 1. | II. | 15. | 94,4 | 91,1 | B | +3,0 | 1,85 : 0,91 | 60% · 22% · 18% |
| 1. | III. | 23. | 98,3 | 93,9 | A | +5,4 | 2,47 : 0,68 | 77% · 15% · 8% |
| 1. | IV. | 30. | 101,8 | 96,3 | B | +5,2 | 2,43 : 0,70 | 76% · 16% · 9% |
| 2. | I.–IV. | | 112,9 → 132,3 | 102,9 → 115,9 | | +10,9 → +16,1 | 4,5 : 0,35 → 0,19 | ≈97% · 2% · 0,5% |
| 3. | I.–IV. | | 149 → 185 | 127 → 151 | | +23 → +34 | 4,5 : 0,15 | 98% · 2% · 0,2% |
| 4. | I.–IV. | | 212 → 269 | 168 → 205 | | +45 → +64 | 4,5 : 0,15 | 98% · 2% · 0,2% |

**A párharc-nap tétje:**

* 3 / 1 / 0 pont a ⚔ párharc-mérlegbe;
* párharc-díj: győzelemért a heti lelátó ×1,5, döntetlenért ×0,75;
* morál és taktika-begyakorlás.

> ⚠️ **Tanulság (1).** Saját bajnokságban a két világ külön nő. A gyorsabban
> fejlődő csapat világa nagyobb, és a gyorsulás a mezőnyszinttel arányos,
> ezért **az abszolút ⚡-ok szétnyílnak**. A párharc a 2. idénytől
> gyakorlatilag eldőlt (97–98%), pedig **mindkét csapat a saját mezőnyéhez
> mérve ugyanott áll** (+0,3 … +1,3 rés).
>
> **Javaslat:** a párharc a kupához hasonlóan **relatív** legyen. A
> különbség az lenne, hogy ki mennyire van a saját mezőnye fölött
> (A rés − B rés + pálya), nem a két abszolút ⚡. A cél a Könnyed mód elve:
> mindenki a maga játékát játssza, a párharc azt méri, ki játssza jobban.
> Ez egy döntés, nem hiba: szólj, ha bekössem.

---

## 7. 🏆 Feljutás, kupa, díjak

**A példa útja** (a helyezések példák, nem képletből jönnek):

| idény | A | B |
|---|---|---|
| 1. | D3 **bajnok** (átlagos rés +3,6) → D2 | D3 3. → osztályozó, kiesik a párharcból → marad |
| 2. | D2 2. → osztályozón feljut → D1 | D3 **bajnok** → D2 |
| 3. | D1 középmezőny | D2 3. → osztályozón elbukik |
| 4. | D1 3. | D2 **bajnok** → D1 |

**A kupa-jogosultság** (PYR_CUPS):

* **D1:** KK top 3 · OJK top 5 · KONF 6. · a többi FA;
* **D2:** FA, 4 selejtezőkörrel; az FA-győzelem KK-indulást ér;
* **D3:** KK (selejtező) 1. · OJK 2. · KONF 3. · a többi MK;
* **D4:** MK top 3;
* **D5–D6:** csak a nyári felkészülési kupa.

**A közös nyári program.** A nevezésnél a **jobbik kvalifikáció visz**, tehát
az 1. idény után **mindketten a KK selejtezőjébe** mentek, A jogán.

* Ha valaki a selejtezőben kiesik, az OJK-ba csúszik.
* **Csak a döntőben** találkozhattok, mert a táblán ellentétes ágakba
  kerültök.
* **A mezőny relatív.** Mindkét gép a saját horgonyára építi a mezőnyt. A
  gépi csapatok, a kalapok és a csoportok a két gépen ugyanazok, csak a
  saját skálátokon.

**A díj (3.9.342)** a saját világ piac-tetejének (`topMarketPrice`)
szorzója:

| eredmény | szorzó |
|---|---|
| KK csoportkör | 0,09 |
| KK nyolcaddöntő | 0,19 |
| **KK negyeddöntő** | **0,315** |
| KK elődöntő | 0,435 |
| KK győzelem | 0,75 |
| OJK negyeddöntő | 0,118 |
| **OJK győzelem** | **0,28** |
| KONF győzelem | 0,12 |
| FA győzelem | 0,12 |

> **Tanulság (2):** a díj a **saját piac tetejéhez** mér. A nagyobb világban
> járó csapat (A) ugyanazért az eredményért több forintot kap. Ez arányos,
> mert neki minden drágább, de a két szám nem összevethető.

---

## 8. 🎲 A seed — hol, hogyan hat

**Mindkét gépen ugyanaz** a világ-seedből:

* a draft-pool és a sorrendje;
* a világ felépítése és a tengelyei;
* a párharc meccse: `h2hduel:<szoba>:<kulcs>`, közös eseménylistával;
* a kupa-sorsolás és a gépi kupameccsek.

**Szakaszos, súlyozott seed** (3.9.331, `hcSeed`). Minden seedelt húzás saját
folyamból jön:

```
hc | <idény>:<szakasz> | <fajta> | <hányadik húzás>
```

* A szakaszok: `a` (1–8.), `tw8`, `b` (9–15.), `tw15`, `c` (16–23.), `tw23`,
  `d` (24–30.), `nyar`, `kupa`.
* A fajták:
  * átigazolási esemény;
  * scout-felderítés, klub-szemle, képesség-keresés;
  * ifi;
  * kihívás;
  * talizmán;
  * skill-sor;
  * a szakasz scout-terve.

**Ugyanaz a véletlen, a saját skáládon.** A két gépen az n-edik húzás
ugyanaz a véletlen. Az erőt hordozó érték viszont a **saját mezőnyszintedhez**
mér. Példa a 2. idény `b` szakaszából, az 1. átigazolási eseményre:

* mindkettőtöknél „legenda érkezik", ugyanaz az ember, ugyanazzal a
  mezőnyhöz mért eltolással (+10);
* A világában (a mezőny ≈108) **118-as**, B-ében (≈99,5) **109,5-ös**
  Ratinggel.

**Aki többet húz,** az ugyanabból a sorból húz tovább. Ilyen például a jobb
scout vagy egy plusz esemény. Az eltérés így a seedhez képest mérhető.

**Ami nem seedelt, és gépenként a sajátja:**

* a meccsek (a sajátodé);
* a napi forma;
* a sorsolt gólok;
* a gólon kívüli helyzetek darabszáma.

---

## 9. Összefoglaló tanulságok

1. **Az 1. idény a legérzékenyebb.** 8.1-en az 1. idényben **nincs
   gyorsulás** (K = 0, ez csak a 9.1-es fokozattól 0,5). A jó csapat ezért
   elhúz: A rése 3,6 lett a célrés 0,4 helyett. A téli felmérés a 15.
   fordulós többletet hozza be, a második félidényét már nem. A mért dg (+9,5) miatt a 2. idény rajt-célja **−4,36**,
   ez kemény rajt. Pontosan ezt éltétek meg, egy mérési hibával
   felnagyítva (3.9.340).
   * **Lehetséges finomítás:** az 1. idényben K = 0,5 már 8.1-től, vagy az
     1. idény dg-jének felezése a rajt-célban.
2. **A 2. idénytől a rendszer a célrésen tart.** A gyorsulás és a
   beragadás-őr együtt a résedet +0,3 … +1,3 között tartja. A rés-követés
   ritkán szól. Ki erős, ki gyenge: a mezőny mindkettőhöz alkalmazkodik.
3. **A párharc abszolút ⚡-tal** a 2. idénytől eldőlt (lásd a 6. fejezetet).
   Relatív párharccal a Könnyed mód elve ott is érvényesülne.
4. **A kupa és a seed relatív.** Ugyanaz a véletlen, a saját skálátokon. A
   kupa-díj a saját piacotokhoz mér.
