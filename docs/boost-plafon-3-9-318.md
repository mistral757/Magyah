# 🧮 Boost-plafon, 🎯 folyamatos rés-követés és boost-adósság (3.9.318)

## A kérés

> „a boostok ereje elszabadul 3. Szezontól kezdve, de ugye különösen onnantól
> hogy 150 fölötti játékosaink kezdenek lenni. Főleg az öreg róka boost az ami
> crazy mekkorakat dob a ratingon. 298as játékosból most csinált pl.
> 423-ast […] úgy legyen számolva, hogy ha az adott játékos a kezdőben lenne,
> akkor a boost hatására a kezdő 11 meccsereje max x%-ot és max X rating
> pontot ugorhat általa. […] ha kapásból tud boosttal kezdeni a player, akkor
> egy -1es különbséget is gyorsan +2re tud változtatni."

A terv véleményezése után:

> „sima boost az új verzióban legyen olcsóbb. Kb 33%-kal mint eddig. A 4
> javaslatoddal egyetértek […] egyelőre a rejtett meccserő elszabadulással ne
> foglalkozzunk. […] építsük be a boost mérőt a firebase feltöltős cuccba,
> magába a játékba pedig jó lesz, hogy rendszeresen az idény közben összevetjük
> a várt fejlődést a ténylegessel."

## Az ok (mérés)

A mérés a `meres-adat` ág négy leghosszabb karrierjén, a játék saját
függvényeivel készült.

**Infinity-szabályok.** A piramis 100-as szint fölött bekapcsolja őket:

* a POT-görbe teteje nyitott;
* 55 éves korig nincs öregedés.

**A POT-ugrás.** Az öreg róka POT-ajándéka a mezőny POT-léptékével nő. Ez a
mezőny 2,5-ös hatványa: 150-esnél ×23, 280-asnál ×215, 400-asnál ×640. Az
ajándék a peaken át azonnal ratinggé vált:

| Mezőny | Öreg róka egy mezőny-szintű játékoson |
|---|---|
| 280 | +44 … +93 |
| 400 | +65 … +133 |

Egy 298-as játékos 350-es mezőnyben közepes sorsolással +106-ot kapott.

**Késleltetett ugrás.** A fénykor és a sima boost ugyanezt a következő
idényváltáskor hozta. Egy 24 éves, 373-as játékos fénykorral két idény alatt
+83-mal ment a boost nélküli pályája fölé.

**A célrés.** Legfeljebb +10-es idényen belüli rés-növekedést árazott be. A
3–4. idényekben a valóság +12 … +55 volt. A téli felmérés egyszer lépett (a
15. fordulóban), közös karrierben egyáltalán nem.

**A motor.** Az abszolút különbséget nézi. Egy ratingpont 100-on és 400-on
ugyanannyi nehézséget ér.

## 1. A boost-plafon (minden karrierben, az új boostokra)

**A szabály.** Egy boost a játékos Ratingjét legfeljebb ennyivel emeli:

```
R = 11 × min(1% × a kezdő 11 ereje, 1,5)      de legalább 12
```

Vagyis a kezdő 11 átlaga, ha ő kezdene, legfeljebb **1%-kal és legfeljebb
1,5 ponttal** nő.

| Kezdő 11 | Plafon |
|---|---|
| 110-ig | +12 (a karrier eleje betűre a régi) |
| 130 | +14 |
| 150-től | +16 |

**Ismétlés.** Ugyanazon a játékoson egy idényen belül minden további boost
plafonja **×0,7** (+16 → +11 → +7 …).

**A csúcs (peak) sem ugorhat el:**

| Boost | A csúcs legfeljebb ennyit nő |
|---|---|
| öreg róka, fénykor, egyenlítő | amennyit a Rating |
| sima boost, POT-boost (26 év fölött) | R |
| ifi boost, POT-boost (26 év alatt) | 2R (ott a fejlődés a lényeg) |

Ha a csúcsot vágni kellett, a POT is hozzá igazodik. Különben egy későbbi
POT → peak lépés visszahozná a levágott részt.

**Az egyenlítő kivétel a Rating-plafon alól.** A célszáma a csoport
legjobbja alatt marad: a jelen osztódik szét, nem jön létre új erő, így nem
tud elszállni. A csúcs nála is csak a Ratinggel nő, és a kezdőrúgás utáni
felhúzás adósság.

**A boost-panelek** kiírják a plafont, és a Rating-sávot a plafonig mutatják.

**Példák (a próba esetei):**

| Eset | Régen | Most |
|---|---|---|
| 298-as öreg róka, 350-es mezőny | kb. 404 (+106) | **314** (+16) |
| ugyanő, az idény 2. boostja | — | +11 |
| 287-es fénykor (280-as mezőny) | +25, egy idény múlva 338 | **303** (+16), és ott marad |
| 90-es kezdő 11, ifi boost | +12 | **+12** (nem vágódik) |

## 2. A sima boost harmadával olcsóbb

**Az ára az egység 0,5-e helyett 0,335-e.** Ez az ifi-boost árának
harmadával kevesebb.

## 3. Folyamatos rés-követés és boost-adósság

### Kire vonatkozik

* **Új karrier:** magától indul (`S.pyr.kovetV`).
* **Futó karrier:** a nyári célrés-ablak gombjával kapcsolható be, a
  következő kezdőrúgástól, véglegesen.
* **Közös karrier:** csak akkor indul, ha **mindkét kézfogás-rekord** kéri
  (`kov`). Ha csak az egyik kéri, abban az idényben nem él, és a napló kimondja.

### Követés (a téli felmérés helyett)

**A kezdőrúgás rögzíti a kiindulást:**

* a saját rajt-rést;
* a beárazott idényen belüli növekedést (a mért `dg`, vagy a modell);
* a tél tűrését (laza +1, normál +0,5, szigorú 0).

**Minden bajnoki forduló után** a rendszer elteszi a NYERS rést, a követés és
az adósság nélkül. Az élő meccs-erőből mér (ahogy a rajt-rést is), nem a
nevezési számból: egy mérce a pályához, és nem kell minden forduló után a
legjobb felállást végigkeresni.

**Az 5., 10., 15., 20. és 25. forduló után** az utolsó 5 forduló átlagos
résének eltérését összeveti a **várt pályával**:

```
várt pálya(j) = rajt + beárazott növekedés × j/30 + tűrés
```

**Ha a rés a pálya fölött jár,** a többletet levonja a már beígért
emelésekből és az adósságból. A maradékot a következő 5 fordulóban
fokozatosan (1/5-önként) behozzák az ellenfelek.

### Adósság

**A kezdőrúgás utáni boostra vonatkozik.** A boost kezdő 11-re eső
hatásának (Δ Rating ÷ 11) **fele** azonnal az ellenfeleidhez kerül, az
idény hátralévő bajnokijain.

* **A nyári boost** (a lezárt idény után) nem adósság. Azt a kezdőrúgás méri.
* **A Boost-kosár** egyetlen összegző sort ír a naplóba.

### Hol hat

**A saját bajnoki meccseiden.** Ugyanazon a csatornán, ahol a mért rejtett
bónusz fele és az osztott nehézség eltolása is ül (`nfSajatOff` →
`matchHiddenOppBuff` / `oppMatchStrength`). A motor és a kijelzés ugyanazt
a számot látja.

**A közös világ nem mozdul:** a gépi csapatok, a tabella és a piac
változatlan. A kupát, az osztályozót és a közös karrier két párharcát (15. és
30. forduló) nem érinti.

### Tanulás

* **A záró rés** (és belőle a következő idény rajt-célja) a kompenzáció
  **nélkül** mér.
* **A beárazható növekedés teteje** a követéses szerződésben 10 helyett **20**.
* **A Run-szint:** a követés emelései ugyanúgy nehezítenek, mint a téli
  emelés (legfeljebb +0,5).

## 4. A boost-mérő (a Firebase-feltöltés része)

**Boostonként (a `z.boost` sor):**

* a fajta, a forduló, és hogy nyáron vették-e;
* a poszt és a kor;
* a Rating, a csúcs és a POT előtte és utána;
* a plafon és a levágott rész (Rating, csúcs);
* a kezdő 11 ereje és a rá eső hatás;
* az adósság, az idei ismétlés száma, a mezőnyszám, Infinity-e.

**A követés:**

* minden emelés külön sorban (`z.kovet`);
* az idény összegzése a padló-rekordban (`padlo.kovet`): rajt, várt
  növekedés, tűrés, emelések, adósság és a fordulónkénti nyers rés.

**A beállításokban** a `piramis.kovet` jelöli a szerződést.

**Az összegzőben** (`tools/meres/osszegez.js`):

* idényenként a boostok fajtánként és a rés-követés;
* az új `--boostok boostok.csv` kapcsoló.

**A napi szinkron** (`firebase-lehuz.js`) a `meres-adat` ágra a
`boostok.csv`-t is elkészíti.

## Amit szándékosan nem érint

* **A rejtett meccserő** (stílus, rettegés, taktika, összhang, gólszorzók)
  idényen belüli növekedése. Kérésre külön körben jön, ha a mérés szerint
  kell.
* **Az attribútum-boost.** Egy tengely +4–9%-a a fő poszton a mérés szerint
  egy sima boostnyi Ratinget ad, a plafont nem éri el.
* **A már megkapott boostok.** A futó karrierek meglévő Ratingjei maradnak.

## Próba

`tools/boost-plafon-3-9-318-proba.js`, 36 állítás, egyjátékos piramis-karrier
a valódi függvényeken át:

* a plafon (öreg róka, ismétlés, fénykor, sima, ifi, a karrier eleje), az
  egyenlítő kivétele és a sima boost ára;
* a követés indítása, a téli felmérés kikapcsolása, az adósság (motor és
  kijelzés);
* az 5 fordulós lépés, a rámpa, és hogy a kompenzáció nem duplázódik;
* a kupa és az osztályozó kizárása, a nyers záró rés, a 20-as tető;
* a nyári boost és a kosár;
* a futó karrier bekapcsolása, a közös karrier kézfogása;
* a mérő;
* nincs oldalhiba.
