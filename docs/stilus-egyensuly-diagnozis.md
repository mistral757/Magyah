# 📊 Miért nem választja senki a Béke és harmóniát meg a Panzert?

**Diagnózis és javaslatok — 3.9.61.** A számok a kódból mértek
(`tools/stilus-edzok-proba.js` fixtúrája és egy 20 000 futásos Monte Carlo a
Panzer kapujára), nem becslések.

---

## 0. A hét stílus egy táblában

| stílus | mérföldkő | megszerezhető pont | a fa ára | **fedezet** | mikor választható |
|---|---|---|---|---|---|
| Tiki-Taka | 123 | 2055 | 1883 | **109%** | 4. karriertől |
| Beton védelem | 112 | 1734 | 2338 | **74%** | azonnal |
| **Béke és harmónia** | **178** | **1868** | **2559** | **73%** | azonnal |
| Hol jön a mennydörgés? | 149 | 1405 | 2024 | **69%** | 2. karriertől |
| **Panzerkampfwagen** | **82** | **996** | **1732** | **58%** | **draft-feltétel** |
| Bombázók | 105 | 1202 | 2149 | **56%** | azonnal |
| Sztárom a párom | 114 | 1280 | 2296 | **56%** | 3. karriertől |

*Fedezet = a stílus ÖSSZES mérföldkövéből megszerezhető pont osztva a teljes fa
árával. 100% alatt a fát elvileg sem lehet kimaxolni — ez szándékos, a
tervdokumentum ki is mondja. A viszonyítás mégis beszédes.*

**A két panasz oka NEM ugyanaz.** Ez a diagnózis lényege: a Panzert a
BELÉPŐ öli meg, a Harmóniát a JÁTÉKMENET.

---

## 1. Panzerkampfwagen — a belépő lehetetlen

### 1.1 Az egyetlen stílus, aminek nem óra a kapuja

Hat stílus kapuja **magától kinyílik**: három azonnal elérhető, három pedig a
2./3./4. karrieredtől (`UNLOCK_STYLE_RUN`). Ezek *várhatók* — tudod, mikor
jönnek, és közben normálisan játszol.

A Panzeré nem ilyen: **a kezdő draftodban legalább 14 negatív jellemvonásnak
kell lennie** (gyenge karizma · a kapcsolódás negatív fele · forró
vérmérséklet). Ez nem óra, hanem **feltétel** — és mérve ez a helyzet:

| a mért keret | átlagos negatív vonás | esély a 14-re |
|---|---|---|
| kezdő 11 | 6,05 | **0,06%** |
| 11 + 4 csere (ez a mérce) | 8,24 | **2,06%** |
| + tartalékok (19 fő) | 10,50 | 14,34% |

Az adatbázisban egy játékosra átlagosan **0,545** negatív vonás jut; mind a
háromból csak a játékosok **0,48%-a** hoz. A 14 tehát **közel kétszerese** a
véletlen várható értékének.

### 1.2 És ha szándékosan gyűjtöd?

Megtehető — a draft sora kiírja a jellemet —, csakhogy az ára ez:

* **feláldozol egy egész karriert** a rosszabb keretért (a forró fejek több
  lapot kapnak, a rossz kapcsolódás lassítja a beilleszkedést és rontja az
  öltözőt, a gyenge karizma elveszi a kapitányodat);
* **és a jutalmat nem is abban a karrierben kapod meg**: a stílust az 1. szezon
  UTÁN választod, addigra viszont a Panzer-kapu már kinyílt — de a keret, amit
  érte összeraktál, épp a legrosszabb keret, amivel Panzert lehetne játszani.

Vagyis a kapu egy **kétkarrieres, önsorsrontó vállalás**, aminek az első fele
nem szórakoztató. Ezért nem választja senki: nem azért, mert a stílus rossz,
hanem mert **a legtöbb játékos soha nem is látja nyitva**.

### 1.3 Ráadásul a legszegényebb fa is

| | Panzer | a hét átlaga |
|---|---|---|
| képesség | **11** | 13,0 |
| szint | **33** | 39,0 |
| mérföldkő | **82** | 123,3 |
| megszerezhető pont | **996** | 1506 |

A Panzer minden mutatóban az utolsó. Aki átvergődik a kapun, **a legkevesebb
tartalmat kapja** — ez a kapu és a jutalom teljes ellentmondása.

### 1.4 Javaslatok

**(a) A kapu legyen ELÉRHETŐ ÚT, ne szerencse.** Három lehetőség, a
legerősebbtől:

1. **Tedd meg SZEZON-teljesítménnyé, ne draft-lottóvá.** Pl. „egy idényben 8+
   sárga és 2+ piros lap ÚGY, hogy a felsőházban végeztél" — ezt *játszani*
   kell, nem sorsolni, és pontosan azt a klubot írja le, amiről a stílus szól.
   A jelenlegi draft-számláló megmaradhat MÁSODIK útként.
2. **Vagy legyen `UNLOCK_STYLE_RUN`-os, mint a többi** (pl. 2. karriertől), és
   a draft-feltétel adjon helyette valamit — pl. INGYEN 1. szintet a
   „Vadhajtások" képességre. Így a nehéz feltétel jutalom lesz, nem belépő.
3. **Vagy a mérce legyen a TELJES kezdő keret** (19 fő), ne 15: ott a véletlen
   esélye 14,3%, ami már „megtörténhet velem" tartomány.

**(b) A fa nőjön a többiek szintjére.** +3-4 képesség és +30-40 mérföldkő
kellene. Kézenfekvő, a stílus nyelvén álló irányok:

* **„Kiállítás után"** — emberhátrányban a csapat NEM esik szét: a
  megfélemlítés-mechanika (`😤 MEGFÉLEMLÍTÉS`) már létezik, de csak egy
  képesség; építhető köré egy egész ág (emberhátrányos győzelem, emberhátrányos
  tiszta lap, 10 emberrel szerzett gól).
* **„Sérült bajtárs"** — a stílus leírása ígéri („a sérült bajtárs csak még
  jobban összekovácsolja a keretet"), a fában viszont egyetlen képesség
  („Fájhat, de játszik") képviseli. Egy sérülés-esemény, ami MORÁLT AD, nem
  elvesz, valódi identitás volna.
* **„Az ellenfél fél tőletek"** — a vérmérséklet-rendszer most már 9 fokú:
  a forró keret adhatna mérhető FÉLELEM-hatást az ellenfél gólesélyére, a lapok
  árával együtt. Ez a stílus egyetlen olyan mechanikája lenne, ami máshol nincs
  (mint a Tiki-Takánál a passzkémia).

**(c) A profitot a KOCKÁZAT fizesse.** A Panzer ma ugyanazt a pénzt kapja, mint
bárki más, miközben többet is veszít (eltiltások, lapok). Két olcsó gyógyszer:

* **lap-prémium**: a szurkolói bevétel nőjön a keménységgel (a `dramaAvg`
  már méri az izgalmat — a lapok is izgalom);
* **olcsóbb „rossz jellemű" játékosok**: a piaci érték most FELÁRAT tesz a
  forró fejre (`v+=verN(e)*12`). A Panzernek ez fordítva kellene: neki azok az
  emberek az alapanyaga, tehát nála legyen kedvezmény. Ez egyszerre profit és
  identitás.

---

## 2. Béke és harmónia — a stílus a JÁTÉK ELLEN dolgozik

### 2.1 A kapuja rendben van

Azonnal elérhető, **178 mérföldköve van (a legtöbb)**, és a pontbevétele
(1868) is a második legjobb. Ha a kapu volna a baj, ez a stílus népszerű
lenne. Nem az — tehát máshol kell keresni.

### 2.2 A fa a legdrágább, és a felső sávba szorult

| | Harmónia | a hét átlaga |
|---|---|---|
| a fa ára | **2559** | 2140 |
| ebből III. sávos képesség | **7 / 14 (50%)** | 4,9 / 13,0 (38%) |
| feltételes csapaterő-szint | **6** | 3,4 |

A fa **fele a legdrágább sávban** áll. Az első vásárlásig tehát hosszabb az út,
és a korai szintek kevesebbet adnak — pedig a stílusélményt épp az első
néhány vásárlás alapozná meg.

### 2.3 …de az igazi baj a struktúra

**A Harmónia AZT jutalmazza, amit a játék minden más rendszere ELRONT.**

A mérföldkövei a **szórást** mérik (minél kisebb, annál jobb), a párkémiákat és
a négy tengely EGYÜTTES szintjét. Közben viszont:

| rendszer | mit csinál a szórással |
|---|---|
| átigazolás | egy jobb játékos ELTOLJA fölfelé |
| szezonkártya | a legjobb emberedet emeli tovább |
| ifi-boost | egyetlen fiatalt robbant be |
| ikon-igazolás | a keret fölé tesz valakit |
| akadémia | egyenetlen ütemben termel |
| POT-alapú fejlődés | a nagyobb POT gyorsabban nő |

Vagyis **minden jó dolog, ami a klubbal történik, rontja a Harmóniádat.** A
játékos ösztöne (szerezz jobb embert) és a stílus jutalma (ne legyen kiugró
ember) szemben áll. Ez nem nehézség, hanem **belső ellentmondás** — és a
játékosok ezt megérzik, még ha nem is tudják megfogalmazni.

A többi stílusnál nincs ilyen: a Bombázók gólt akar, és a jobb csatár több gólt
lő; a Beton tiszta lapot, és a jobb védő több tiszta lapot hoz. Csak a
Harmóniánál fordul szembe a fejlődés a céllal.

### 2.4 Javaslatok

**(a) A mérce ne a SZÓRÁS legyen, hanem a PADLÓ.** Egyetlen elvi csere, ami
feloldja az ellentmondást: ne azt kérdezzük, „mennyire egyenletes a kereted",
hanem azt, **„milyen erős a leggyengébb embered"**. Így:

* egy sztár igazolása többé nem BÜNTETÉS, csak nem is segít;
* a fejlődés iránya megegyezik a stílus céljával (mindenkit húzz fel);
* és megmarad az identitás: „nincs gyenge láncszem" — ez amúgy is a fa egyik
  képességének a NEVE.

A meglévő szórás-mérföldköveket nem kell eldobni, de a **fő** lépcső legyen a
padló (pl. „a 18. legjobb embered Ratingje", „a kezdő 11 leggyengébbje", „a
teljes keret minimuma").

**(b) A profit legyen a MÉLYSÉG.** A Harmónia egyetlen valódi versenyelőnye a
keret mélysége — ezt viszont ma semmi nem fizeti ki. Három kézenfekvő csatorna:

* **kevesebb rotációs veszteség**: a Harmónia-klubnál a cserejátékos ne essen
  vissza (ma minden csere gyengít);
* **sűrű menetrend**: kupa + bajnokság együtt fárasztó — a Harmónia klubja
  bírja jobban (fáradás-ellenállás);
* **fizetési kedvezmény**: az egyenletes keret olcsóbb bérrel jár (nincs
  sztárfizetés) — ez ma nem így van, pedig magától adódna.

**(c) Legyen egy SAJÁT MECHANIKÁJA, mint a Tiki-Takának a passzkémia.**
A Harmónia ma is a legtöbb mérföldkővel bír, de mind MEGLÉVŐ számokat mér.
Kézenfekvő saját rendszer: **a „mindenki játszik" rotációs erő** — ha egy
idényben minden keret-tagod elér egy játékperc-küszöböt, a csapat kap egy
tartós, halmozódó bónuszt. Ez pontosan a stílus filozófiája, sehol máshol
nincs, és a padló-mércével együtt egy koherens egészet ad.

---

## 3. Egy mondatban

**A Panzert nem választják, mert legtöbbször nem is látják nyitva** (2%-os
véletlen, vagy egy önsorsrontó karrier az ára) — **és aki mégis, a
legszegényebb fát kapja.** A **Harmóniát látják, de nem éri meg**, mert a
legdrágább fáért olyan célt kér, amit a játék összes többi rendszere aktívan
ront.
