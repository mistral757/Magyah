# 🎚 Általános nehézségi rendszer — terv az eddigi adatok és mérések alapján

> „Az eddig beérkezett adatok alapján mit látsz körvonalazódni általános
> nehézségi szint állító tervünkkel kapcsolatban? Nem lehetne kipróbálni, hogy
> tervezel egyet az eddigi adatok alapján és további mérésekkel, amiket esetleg
> te tudsz csinálni, és aztán azokat a sávokat tesztelgetjük onnantól kezdve?"

Ez **terv** volt. **3.9.222-ben megvalósult** a piramisban
(`docs/nehezseg-tizfokozat-3-9-222.md`), a következő döntésekkel:

* **tíz fokozat** a hat helyett (homokozótól a semmi esélyig, célrés +6 … −3),
  mindegyik lenyitható a beállításaival;
* a holtsáv 1,5;
* a dinamikus mód egyelőre marad;
* a futó karrierek egy egyszeri **„Átállok”** gombot kapnak, ugyanazokkal a
  lenyitható fokokkal.

A számok forrása:

* **a 8 karrier** a mentés-exportokból (46 idény, `tools/meres/adat/`);
* **2110 valódi meccs** a 3.9.220-as motoron;
* **60 végigjátszott idény** a valódi motoron;
* **idény- és karrier-szimuláció** a valódi motorhoz kalibrált modellel.

A Firebase-be feltöltött mérési naplókhoz nincs hozzáférésem — azokat a
`tools/meres/osszegez.js`-sel te tudod kiolvasni (`--meccsek` a meccsenkénti
táblához).

## 1. Amit az adat mutat

1. **A 3. idénytől szinte mindig cím** (a 8 karrierben 83%). Ezek a karrierek
   még a 3.9.210-es padló előtt futottak.
2. **A siker nem a játékos-értékekből jön, hanem a meccserő bónuszaiból**:
   morál, taktika, összhang, stáb és kapitány. Ezek +23–35-öt adtak a
   XI-átlaghoz. **A nehézséget a meccserő nyelvén kell mérni.**
3. **A pénz elveszti a jelentését** a sztár-eladás után (az éves keret
   580–4200-szorosa). Ez külön kar, itt nem foglalkozom vele.
4. **A másik végletet a mostani karriered mutatja:** D6-os beragadás,
   vereségsorozat a gyengébbek ellen. A közös karrierben a lehúzó spirál a
   társadnál jelentkezett.

## 2. Mérések

### M1 — Egy idény kimenete a rés szerint (3.9.220)

`tools/nehezseg/idenysim.js`, a piramis szabályaival: a bajnok feljut, a 2–3.
osztályozót játszik, a 16. kiesik, a 14–15. osztályozón védekezik; rangadók és
hajrá-rangadók is vannak. A modell a valódi motorhoz kalibrált: az eltérés
átlagosan ~1,6 százalékpont.

| Rés (az idény átlaga) | Pont | Cím | **Feljutás** | Kiesés |
|---|---|---|---|---|
| −3 | 29 | 0% | 0% | 35% |
| −2 | 35 | 0% | 0% | 13% |
| −1 | 42 | 1% | 3% | 2% |
| 0 | 49 | 5% | 16% | 0% |
| +1 | 56 | 18% | 42% | 0% |
| +2 | 62 | 39% | 72% | 0% |
| +3 | 68 | 65% | 90% | 0% |
| +4 | 73 | 83% | 97% | 0% |

**A játszható ablak keskeny: ±3 meccserő fogja át a „kiesés 35%”-tól a
„feljutás 90%”-ig.** Egy pont kb. 25 százalékpont feljutási esélyt ér.

### M2 — A spirál és a sodródás a valódi motoron

`tools/meccsmotor/spiral-valos.js`, 60 idény. Az ellenfél ereje állandó, nincs
vásárlás és nincs boost.

| Rajt-rés | Pont | **A meccserő sodródása az idény alatt** | Morál a végén |
|---|---|---|---|
| −3 | 34 | +3,4 | 73 |
| 0 | 64 | +5,6 | 91 |
| +3 | 81 | +8,2 | 95 |

* **Rövid távú lehúzó spirál nincs:** vereségsorozat után is nő a meccserő,
  csak lassabban (öt meccses ablakokban +0,5 a +1,3-mal szemben).
* **A hógolyó az idény léptékében van:** a jó csapat ~5 meccserővel többet nő
  egy idény alatt, mint a gyenge (morál, forma, fejlődés). A sodródás (+3…+8)
  **nagyobb, mint a teljes játszható ablak**.
* **Következmény:** a csak kezdőrúgáskor mérő nehézség félrevezet. A „+2-es
  vállalás” valójában +3,3…+4,7-es idényátlag, vagyis 62–88% cím. Ez
  magyarázza a „3. idénytől 83% cím” mintát.

### M3 — Karrier-szimuláció: a mostani padló vs a javasolt rendszer

`tools/nehezseg/karriersim.js`, 300 karrier, 12 idény, D6-ról.

* **A modell feltételezései:**
  * a mezőny természetes tempója 6,2 idényenként („Lépést tartanak”);
  * a saját fejlődés a mért sodródás, plusz P a vásárlásból, boostból és
    összhangból.
* **Ez modell:** az irányokat mutatja, nem mért állandókat.

| Befektetés | **Mostani padló (vállalás +2)** | **Javasolt, Kiegyensúlyozott (célrés +2,5)** |
|---|---|---|
| Semmi (P=0) | **73% beragadás**, élvonal nincs | 26% beragadás |
| Közepes (P=3) | élvonal a 9. idényben, 4% beragadás, **42% cím** | 10. idény, 1% beragadás, **25% cím** |
| Erős (P=6) | 7. idény, **89% cím, ebből 47% fölényes** | 8. idény, **47% cím, 9% fölényes** |

* **A mostani padló felül jól fog** (nincs 17 pontos idényátlag), **alul
  semmit**: aki nem költ, beragad. Ugyanez történt veled D6-ban.
* **A javasolt rendszerben a befektetés végig számít** (P=0 és P=6 között 7% és
  47% cím a különbség), de nincs se elszállás, se reménytelen beragadás.

## 3. A terv: kétoldalú padló, az idény ÁTLAGÁRA célozva

### 3.1 A fokozat egy célrés — az idény átlagos meccserő-rése

| Fokozat | Célrés | Feljutás / idény | Cím / idény | Mit ígér |
|---|---|---|---|---|
| 🌴 Sétagalopp | +5 | 99% | 93% | élmény-mód, a sztori a lényeg |
| 🙂 Kényelmes | +3,5 | 95% | 74% | esélyes vagy, ritkán botlasz |
| ⚖️ **Kiegyensúlyozott** (ajánlott) | **+2,5** | **81%** | **51%** | minden második idény cím, a munka dönt |
| 🥊 Kihívás | +1,5 | 57% | 27% | minden feljutásért meg kell küzdeni |
| 🔥 Kemény | +0,5 | 28% | 9% | a felső ház a cél, a feljutás ünnep |
| 💀 Kegyetlen | −1 | 3% | 1% | a túlélés a cél (kiesés ~2%) |

A számok az M1-ből valók. **Ezek a tesztelendő sávok:** a mérő adatai
mutatják majd meg, hol van az igazi helyük.

### 3.2 A szabályozó — négy szabály

1. **A rajt:** a mezőny úgy áll be, hogy a kezdőrúgáskori rés **a célrés mínusz
   a várható sodródás fele** legyen. A sodródás a saját karrieredből
   tanul: a tavalyi idény valódi sodródása, az első idényben a mért +5,6.
   Kiegyensúlyozottnál ez kb. −0,2-es rajtot jelent, ami az idény végére
   +5-be kúszik, átlagban +2,5.
2. **Felül:** ha a rajtkor a rés a rajt-cél fölött van, a mezőny felnő hozzá
   (ez a mostani padló). Télen a célrés +0,5 fölötti rész felét kapja meg a
   mezőny (ez a mostani téli mérés, csak a célréshez igazítva).
3. **Alul — ez az új:** ha a rajtkor a rés több mint 1,5-tel a rajt-cél alatt
   van, **a mezőny abban az idényben lassabban nő, legfeljebb megáll.**
   * A világ nem zsugorodik: a mezőny az előző idény végi szintje alá soha nem
     megy. A fel- és kiesés lépcsője megmarad.
   * Ez nem ajándék, hanem azt jelenti, hogy a világ megvár.
4. **A holtsáv (1,5 pont) a munkáé.** A rajt-cél és alatta 1,5 között a mezőny
   a természetes tempójával nő. Hogy ebben a sávban hol állsz — és így milyen
   eséllyel jutsz fel —, azt a vásárlásaid, boostjaid, taktikád és összhangod
   döntik el.

### 3.3 Hol él

* **Piramis:** a vállalás helyére lép. A célrés idényenként állítható, ahogy a
  vállalás: könnyíteni bármikor lehet, nehezíteni sikeres idény után.
* **Dinamikus mód:** a szintkövetés cél-sávja ugyanerre a célrésre áll.
  * **Gyanú, amit a mérőnek igazolnia kell:** a dinamikus mód is a
    szezonhatáron mér, tehát ott is a sodródás felével kényelmesebb, mint amit
    a felirat ígér.
* **Közös karrier:** a két célrés és a két meccserő átlaga, ahogy a padlónál
  ma. A befektetés-arányos hangolás (3.9.221) változatlanul fut mellette.

### 3.4 Amit nem old meg

* **A pénz-robbanást** (sztár-eladás) — az külön kar (a 2026-10-es elemzés
  1. javaslata).
* **A meccs-szintű szerencsét** — azt a 3.9.220 kezelte.

## 4. Tesztterv — így teszteljük a sávokat

1. **Bevezetés:** az új rendszer CSAK az új karrierekre él (a futó karrierek a
   saját szerződésükkel mennek végig). A beállítón a fokozat a hat célrés.
2. **A mérő rögzíti** (a 3.9.220 óta meccsenként minden idényben):
   * a célrést, a rajt-célt és a tényleges rajt-rést;
   * a téli korrekciót és az alsó fék működését (mennyit fogott vissza);
   * az idény valódi átlagos rését: a meccsenkénti `ms − oMs`-ből;
   * a helyezést, a fel- és kiesést.
3. **A siker mércéje fokozatonként** (≥ 10 lezárt idény után):
   * az idény valódi átlagos rése a célrés ±0,75-ös sávjában;
   * a feljutási és címarány a 3.1-es táblázat ±15 százalékpontos sávjában;
   * a beragadás (3+ feljutás nélküli idény a D0 előtt) Kiegyensúlyozotton
     5% alatt;
   * fölényes cím (12+ pont előnnyel) Kiegyensúlyozotton 15% alatt.
4. **Hangolás az adatokból:** a mérő kivonatát
   (`node tools/meres/osszegez.js <napló> --meccsek m.csv`) idényenként
   összevetjük a táblázattal, és a három számot igazítjuk: a célréseket, a
   holtsáv szélességét (1,5) és a sodródás-becslést.

## Döntési pontok a bevezetés előtt

1. **A hat fokozat és a célréseik** jók kiindulásnak?
2. **A holtsáv: 1,5?** Keskenyebb sáv erősebb védelmet ad alul, de kevesebb
   teret hagy a munkának.
3. **A dinamikus mód** egyszerre jöjjön, vagy előbb csak a piramis (ahol a
   gond jelentkezett)?
4. **A futó karrierek:** maradjanak a régi szabályon (ahogy eddig minden
   nehézségi váltásnál), vagy kapjanak egy egyszeri „átállok” gombot?

## A mérők

| Mérő | Mit mér |
|---|---|
| `tools/nehezseg/idenysim.js` | egy idény kimenete a rés szerint |
| `tools/nehezseg/karriersim.js` | karrier-szimuláció: padló, alsó fék, kétoldalú; `P`, `F`, `G0`, `REGI=1` a régi változatokhoz |
| `tools/nehezseg/motor.js` | a közös meccsmodell, a valódi motorhoz kalibrálva (+0,75) |
| `tools/meccsmotor/spiral-valos.js` | sodródás és spirál a valódi motoron |
| `tools/meccsmotor/spiral-elemez.js` | a spirál-mérés kiértékelése |
