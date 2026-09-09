# ⭐ A csúcs-alap — rating, TSI és életkor (3.9.54)

*(Érintett kód: `CAREER_BEST_CARD` / `careerBestCardFor` · `peakAgeEmpiric` /
`peakAgeDraw` · `seasonBasisFor` (`opts.peakCard`) · `peakBasisFor` ·
`PEAK_TSI_BONUS` · `commitSeasonBasis`. Mérés: `tools/csucs-alap-proba.js`.)*

## 1. Az elv, kimondva és ellenőrizve

> „minden játékos, aki több instantban is benne van az adatbázisban, kap egy
> életkor-TSI kombót mindegyik instantban (akárcsak a rating a szezonban
> módban, ami gyakorlatilag ennek a módnak az alapja), és bármelyik
> instantjában nyitod ki azt a játékost tartalmazó csapatot, választod ki azt a
> játékost, te azt az instantját fogod megkapni, amelyik az összes instant közül
> a legerősebb volt ennél a generálásnál"

**Így van, és a próba mind a három állítást külön méri** a 586 többkártyás
játékoson:

| állítás | mérés |
|---|---|
| bármelyik klubból ugyanaz az ember jön ki | 0 eltérés |
| és mindig a LEGJOBB kártyája | 0 kivétel |
| ami egyben a LEGERŐSEBB instantja is | 0 kivétel |

A harmadik sor azért külön állítás, mert a kód nem úgy dolgozik, ahogy a
megfogalmazás sugallja: **nem** generálja le mind a hány instantot, hogy aztán
a legerősebbet válassza, hanem a legmagasabb kártya-Ratingű megjelenést veszi
(`CAREER_BEST_CARD`) és azon futtatja végig a szezon-alapot. A kettő
**egyenértékű**, mert a kártyánként változó egyetlen bemenet a kártya
Ratingje, és a TSI abban monoton — de ez nem magától értetődő, ezért a próba a
játékos MINDEN kártyájára lefuttatja a számolást, és összeveti.

Két pontosítás az elvhez:

* **a válogatott-kártya** csak akkor számít bele, ha a VB be van kapcsolva
  (különben a játékos-lapon ott állna egy származás, ami sehol máshol nem
  jelenik meg);
* **a 30 fölötti kort visszahúzzuk.** Akinek a csúcsidénye későn jött, az a
  Ratinggel összeférő sáv alsó felébe kerül. A Rating nem változik: a
  csúcsforma marad csúcsforma, csak fiatalabb példányban. Enélkül a mód a
  legendákat rendszeresen a hanyatló ág elején adná át.

## 2. Amit a mérés talált: az életkor egyharmada találgatás volt

A kérés második fele így szólt:

> „mindenképpen a rating a szezonban legyen az alapja ennek a módnak, tehát a
> teljes adatbázisra a ténylegesen legenerált, beillesztett születési évekből
> számított életkorok és ratingok alapján számítsunk TSI-t és életkort"

A szezon-alap tényleg a szülő mód, és a születési év tényleg felülír mindent —
**de nem a teljes adatbázisra**, mert az adat maga nem teljes:

| | játékos | arány |
|---|---|---|
| **ismert** születési év → a kor VALÓS | 2240 | 65% |
| **nincs** születési év → a kor becsült | 1199 | 35% |

A 1199-ből **1190-nek egyetlen évből van kártyája**, tehát még a
„kártya éve − csúcsidény éve" ág sem tud rajtuk segíteni. (A csúcs-alapon az az
ág amúgy is szerkezetileg halott: a legjobb kártya *definíció szerint* a
referencia-idény, tehát az évkülönbség mindig nulla.)

**Mennyire volt jó a régi becslés?** Ez megmérhető: lefuttattuk arra a 2240-re,
ahol tudjuk az igazságot.

| | régi harang |
|---|---|
| átlagos hiba | **3,4 év** |
| medián / felső tized | 3 / 7 |
| **torzítás** | **+2,0 év — rendszeresen ÖREGEBBNEK mondta** |
| a „Ratinggel összeférő sáv" befogta-e a valós kort | csak **54%**-ban |

**Miért torzított.** A sáv alja az a legfiatalabb kor, ahol a kor-görbe még
kiadja a kártya Ratingjét. Egy *csúcskártyán* a Rating majdnem egyenlő a
csúccsal, tehát a sáv a 26-30-as platóra szorul — miközben a valóságban a
játékosok **31%-a 24 éves vagy fiatalabb** volt a legjobb idényében.

Ez a +2 év pontosan az a fajta hiba, ami a „rating-TSI-életkor hármast"
kellemetlenné teszi: a kártya jó, a TSI rendben, de az ember két évvel közelebb
van a hanyatláshoz, mint kellene.

## 3. A javítás: a becslés a VALÓS korokból tanul

A 2240 ismert eset nem csak ellenőrzésre jó — **ez maga a legjobb elérhető
adat** arra a kérdésre, hogy hány éves valaki a csúcsidényében. A
`peakAgeEmpiric()` ezért posztonként elteszi a valós csúcskorok rendezett
listáját, és az ismeretlen játékos ebből húz, nevesített seedelt folyammal.

**Miért posztonként, és miért nem Rating szerint.** Mérve:

| kártya Rating | 74-77 | 78-81 | 82-85 | 86-89 | 90+ |
|---|---|---|---|---|---|
| valós csúcskor átlaga | 25,7 | 26,3 | 26,7 | 27,2 | 27,0 |

| poszt | BSZ | JSZ | TKP | BV | KKP | CS | VKP | JV | KV | KP |
|---|---|---|---|---|---|---|---|---|---|---|
| valós csúcskor átlaga | 25,3 | 25,5 | 25,6 | 25,9 | 26,2 | 26,4 | 26,6 | 26,6 | 26,8 | **28,3** |

A Rating szerinti bontás **zaj** (1,5 év az egész tartományon), a poszt szerinti
**jel** (3 év). A vékony posztokat (30 minta alatt) az összesített listára
ejtjük vissza.

**A sávra itt szándékosan nem vágunk rá.** Ugyanaz az indok, amiért az ismert
születési évet sem engedjük át rajta: ha az adat és a görbe ellentmond, a görbe
téved. A kilógást a `youthBonus` kezeli — pontosan úgy, ahogy a 18 éves Messi
82-es kártyáján.

**Az eredmény** (a becsült és a valós korok eloszlása egymás mellett):

| | db | átlag | p10 | medián | p90 |
|---|---|---|---|---|---|
| **valós** (ismert születési év) | 2240 | 26,12 | 22 | 26 | 30 |
| **becsült** (nincs születési év) | 1199 | 26,18 | 22 | 26 | 30 |

A torzítás **+2,0 évről 0,06-ra** csökkent, és a két eloszlás a mediánban és
mindkét szélső tizedben egyezik.

**Önkarbantartó:** a tábla a `BIRTH_YEAR`-ból épül. Minden új születési év,
amit valaha beírunk, egyszerre javítja a saját játékosát ÉS a becslést
mindenki másra.

## 4. A 15%-os TSI-rátét

> „csaljunk kicsit ebben a módban és toljuk feljebb egy 15%-kal a várható
> kiosztott TSI-t a teljes adatbázisra"

`PEAK_TSI_BONUS = 1.15`, a **kész** TSI-re — nem a sorsolás közepére. Így a
várható érték pontosan 15%-kal nő, az eloszlás alakja pedig változatlan marad.
Ez azért számít, mert a csúcs-alapon a játékosok háromnegyedénél nem is sorsolás
dönt: ott a TSI a kártya Ratingjéből számolt **padló** (`peakToTsi(peak)`),
amire a rátét ugyanúgy ráül.

**A csúcs is követi** (`peak = max(peak, tsiToPeakOvr(tsi))`). TSI-t emelni
magában félrevezetés lenne: a scout 👁 nagyobb számot mutatna, a játékos viszont
ugyanoda nőne fel. A mérés szerint a rátét a 3439-ből **3432-nél** tényleg
emelte a csúcsot is.

Mérve, a teljes adatbázison:

| | előtte | utána |
|---|---|---|
| TSI átlag | 1588 | **1823** (×1,150) |
| medián | 1420 | 1630 |
| p90 | 2680 | 3250 |
| p99 | 4570 | 5260 |
| maximum | 6770 | **8300** |
| 4000 fölött | 67 | **118** |
| 6000 fölött | 4 | **16** |
| 7000 fölött | 0 | **4** |

A Rating **nem változik** (0 eltérés a teljes adatbázison): a kártya
csúcsformája marad a csúcsforma, a rátét a *tehetségben* jelenik meg.

### 4.1 Egy határ, amit ki kell mondani

A `tsiToPeakOvr` normál módban **96-nál telítődik** (5650-es TSI fölött a csúcs
már nem nő). A legjobbaknál a 15% ezért csak a TSI-számban, a scout becslésében
és az árban látszik, a fejlődési plafonban nem. Ez 24 játékost érint (akik a
csúcs 96-on állnak). Infinityben nincs telítődés, ott a csúcs is együtt megy.

### 4.2 A lutrival még mindig nem egyezik — és ez itt van kimondva

A rátét indoklása az volt, hogy „így születhetnek olyan őrülten erős játékosok
is, mint amilyenek jelenleg csak a lutri módban születnek néha". A 15% ezt
**részben** hozza:

| | csúcs-alap (15%-kal) | lutri |
|---|---|---|
| p99 | 5260 | 7770 |
| maximum | 8300 | 21450 |
| 6000 fölött | 16 | 114 |
| 8000 fölött | 1 | 40 |

Az ok szerkezeti, nem hangolási: a lutri **log-sávot** használ
(`TSI_SPREAD.wild.log = 3,2`, arányban szimmetrikus szorzó), a csúcs-alap
pedig a szűk `ref` sávot (`half = 0,30`), amit épp azért szűkítettünk, hogy a
mód ígérete („a kártya csúcsformája tényleg megvalósul") teljesüljön. Egy
15%-os eltolás a *középpontot* mozgatja, a *farkat* nem.

Ha a cél tényleg a lutri-szerű szörnyetegek, az a `TSI_SPREAD.ref` szórásán
múlik, nem a szorzón — és az a mód másik ígéretével áll szemben. Ez tudatos
döntési pont, nem elfelejtett munka.

## 5. Amit ez NEM érint

* **a szezon-alap és a lutri** — a `peakCard` kapcsoló nélkül a `seasonBasisFor`
  betűre a régi; a próba a teljes adatbázis mind a 4181 klub-kártyájára méri,
  hogy a TSI ott változatlan;
* **az átigazolási piac, a scout ajánlatai, az ikonok és az akadémia** — azok a
  karrier további részében ugyanúgy a kanonikus pool-ból dolgoznak. A fokozat
  egy INDULÁSI PILLANATKÉP, nem a világ szabálya;
* **a régi mentések** — a pool a karrier indításakor generálódik és a mentésben
  él; egy futó karrier értékei nem mozdulnak.
