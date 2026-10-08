# 3.9.223 — 🎚 A fokozat-csomag (10 × 5) és az új indítás

> „…a fokozatok nem csak a résen alapulnak, hanem minden egyéb beállításon is,
> ami a nehézségre hatással van: milyen tempóban követ az ellenfél, milyen
> tempóban fejlődsz, annak minden setupjával, hogy a skilleket realisztikusan
> kapod-e vagy lazán, hogy a scout melyik verzió stb. […] átalakítottam volna
> az egyszerű indítást arra, hogy 1 nagy nehézség választó oldal (amit
> részletesen ki lehet bontani ha akarsz) és utána minden mást be kell
> állítani, ami nem kifejezetten a nehézséghez tartozik, majd pedig draft/kész
> csapat, majd pedig divízió választó."

> „…legyen mind a 10 fokozatnak 5 belső szintje is […] két nagy fokozat
> között először a célrés lép, aztán a belső öt szint a további faktorokat
> lépteti úgy, hogy azok is szintről szintre mindig egyre nehezebbről
> indulnak. Pl. Lvl 6 általános nehézség fölött már mindig csak realisztikus
> skill legyen, és minimum fejlődési tempó nehézség már a csiga tempó stb.
> […] Számold ki szépen alaposan, legyen részletes és tényleg fokozatos."

> „Új szintek megnyitása. Ha egy nagy nehézségi szint belső 5 közül
> bármelyiken nyersz, az a következő nagy szintet nyitja ki […] Minden
> játékos számára eleve nyitott az első 6 szint. A jelenleg már legalább
> lvl10es profil játékosok számára minden szint nyitva […] csak azokra akik
> ezelőtt az update előtt már játszottak." · „a lépések legyenek a célrés
> tekintetében így: +4től −1-ig, ennek megfelelően kisebb lépésekben, és 5ös
> szint felett már legyenek a belső szintekben is 0.1 tizedes célrés
> lépések"

**A döntések:**

* a zárt elem helyett a legközelebbi nyitott érték jár;
* a fokozat csak a piramisé;
* a régi négyoldalas beállító rejtve megmarad.

## 1. Az új indítás

1. **Nehézség:**
   * A piramisban a tíz fokozat, mindegyik lenyitható, benne az öt belső
     szint.
   * Minden belső szint kiírja:
     * mi lépett;
     * a teljes csomagot;
     * a várható kimenetet;
     * a zárt elemek helyettesítését.
   * Minden fokozatnál lenyitható a „Mit jelent a célrés?” is.
   * Alul az **✏️ Egyéni** blokk: elemenként állítható, a kiinduló szint a
     választásod.
   * Dinamikus módban a nehézségre ható elemek egyenként állíthatók, fokozat
     nélkül.
   * A kezdő lépcsőn (az első 3 bajnoki címig) a lépcső adja a nehézséget,
     mint eddig.
2. **Egyéb beállítások:** ami nem a nehézségé — felállás, Rating alapja,
   családtag, legendás magyahok, újrapörgetés, draft-pool, vezetés.
3. **Kezdés:** draft vagy kész klub, és az összefoglaló. Utána jön a draft
   vagy a klubválasztás, a végén az **osztályválasztó**.
   * Ott a választott csomag összefoglalója áll.
   * A célrés lenyitva még módosítható. A csomag többi eleme a karrier
     indulásakor rögzült.

**Hol él még:**

* A régi négyoldalas beállító a „🧭 Régi részletes beállító” gomb mögött
  változatlan.
* A **Beállítások → 🎛️ Új karrier alapbeállításai** új mezői:
  * **Nehézségi fokozat** (a csomag, 50 szint + Egyéni) — választása az
    elemeket is beírja;
  * **Célrés-fokozat**;
  * **Téli felmérés**.

  Ha egy elemet átírsz, a csomag „Egyéni” lesz.

## 2. A szerkezet

**A célrés +5-től −1-ig** (az 1–4. fokozat a kérésre +1-gyel bővebb: „lvl
4ig azaz haladóig a célrés kicsit bővítve, legalább +1 minden szintre”):

| Fokozat | 1 Homokozó | 2 Kezdő | 3 Simaliba | 4 Haladó | 5 Nehéz | 6 Profi | 7 Mesteri | 8 Legendás | 9 Gyilkos | 10 Semmi esély |
|---|---|---|---|---|---|---|---|---|---|---|
| Célrés | +5,0 | +4,4 | +3,8 | +3,2 | +1,6 | +1,4 … +1,0 | +0,9 … +0,5 | +0,4 … 0,0 | −0,1 … −0,5 | −0,6 … −1,0 |

* **Az 1–4. fokozat határán** 0,6-ot lép a célrés, a 4. → 5. határon 1,6-ot.
  A fokozaton belül állandó.
* **A 6. fokozattól** minden belső szint és minden határ **0,1-et** lép: a
  6.1 +1,4, a 10.5 −1,0. Itt minden belső szinten a célrés **és** egy elem
  is lép (kimondott pontosítás: „a szokásos dolgokon felül az is lép
  kicsiket").
* **A fokozaton belül** a 2–5. belső szint **egy-egy** további elemet léptet
  nehezebbre. A kisebb súlyú jön előbb, például az akadémia-tempó a
  játékos-tempó előtt.
* **Egy elem soha nem lép vissza.** Amit egy fokozat 5. szintje elért, azzal
  indul a következő fokozat 1. szintje is.
* **A kérésed példái:**
  * a 6. fokozattól mindig realisztikus a képesség (az 5.5-ben lép);
  * a 7.-től minden tempó legalább Csiga (a 6.4-ben lép az utolsó).
* **Az ajánlott 4.1** (Haladó, célrés +3,2) a régi alapbeállítás közelében
  van: Lépést tartanak, Alap tempó (az akadémia Komótos), lazán, szokásos
  scout, megszokott ikonok, normál tél.

**Az elemek:**

* a célrés;
* az ellenfelek tempója — a csomagban legfeljebb **Lépést tartanak** (lásd a
  3. fejezetet);
* a négy résztempó (játékosok, pénz, taktika, akadémia);
* az ikon-igazolások;
* a képességek;
* a scout;
* a **téli felmérés tűrése** (új): laza +1,0 · normál +0,5 · szigorú 0 a
  célrés fölött. Télen eddig mindig +0,5 volt.
* a **holtsáv** (új): 1,5 → 1,75 (6.2) → 2,0 (8.5) → 2,25 (10.2). Ennyivel a
  rajt-cél alatt vár meg a világ. A hatása korlátos: legfeljebb 0,25-tel
  mélyebbre csúszhatsz lépésenként, és csak ha lemaradtál. Közös karrierben
  mindig 1,5, mert a két gépen azonosnak kell lennie.

**Nem a csomag része** (kimondott kérés): a Rating alapja, a családtag, a
legendás magyahok és az újrapörgetés.

## 2/b. A fokozatok feloldása

* **Az első 6 fokozat** mindenkinek nyitva.
* **Megnyert karrier** (az első cím a piramis tetején, ugyanaz a pont, ahol a
  régi nehézségi létra is nyitott) **a következő NAGY fokozatot** nyitja,
  mind az öt belső szintjével. Mindegy, melyik belső szinten nyertél, és
  karrierenként egyszer számít. A napló kimondja: „🔓 Megnyílt a 8. fokozat”.
* **A korábbi játékosok:** aki a 3.9.223 első indításakor legalább 10-es
  profilszinten állt, annak minden fokozat nyitva. Ez egyszeri bélyeg
  (`nfMig`, `nfMind`): aki később éri el a 10-es szintet, arra már nem
  vonatkozik.
* **A régi tized-létra** (a rajt-fokok kapuja) a fokozatot már nem zárja. A
  finomhangolás (a régi létra) a saját kapuival megmaradt.
* **Nyáron** nehezíteni csak a feloldott fokozatokig lehet.
* **Közös karrierben** nincs kapu, mint eddig.

## 3. A számítás — `tools/nehezseg/fokozatsim.js`

**Karrier-modell:** 600 karrier × 15 idény, D6-ból, a valódi motorhoz
kalibrált meccsmodellel, mind az 50 belső szintre.

* **A játék pontos paraméterei:**
  * a mezőny üteme (PYR_PACE × a játékos-tempó × az ellenfél-tempó
    részaránya);
  * a tempó-szorzók;
  * a kétoldalú szabályozó: rajt-cél a mért változásból, felül emelés, télen
    a csomag tűrése, alul a holtsáv 1,5 és a fék;
  * a fel- és kiesés.
* **Becslések** (ezeket a mérő adatai hangolják):
  * a saját idényen belüli sodródás megosztása: 35% morál/forma, 40%
    fejlődés, 25% összhang;
  * a nyári befektetés megosztása (pénz, akadémia);
  * az ikonok, a scout és a képesség-mód súlya.
* **Három befektetési profil:** P0 = 1,5 (takarékos), 3 (közepes), 4,5
  (erős).

**A teljes tábla:**

* A feljutás, a cím és a kiesőhely a közepes profil (P0 = 3) nyers adata.
* A kiesőhely a 16. hely vagy egy elveszített osztályozó; D6-ban ez nem jár
  kieséssel.
* A játék a közepes profilt mutatja, monoton simítva
  (`tools/nehezseg/kimenet-js.js`).

| Szint | Célrés | Mi lép | Ellenfelek | Tempó (J / P / T / A) | Ikonok | Képesség | Scout | Tél | Holtsáv | Feljutás | Cím | Kiesőhely | Átl. rés P0 = 1,5 / 3 / 4,5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1.1** Homokozó | +5 | a legkönnyebb | Alvó | Villám / Villám / Villám / Villám | megszokott | lazán | szokásos | laza | 1,5 | 100% | 91% | 0% | 4,9 / 4,9 / 4,9 |
| **1.2** | +5 | tempó: akadémia → Gyors | Alvó | Villám / Villám / Villám / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 100% | 92% | 0% | 4,9 / 4,9 / 4,9 |
| **1.3** | +5 | tempó: taktika → Gyors | Alvó | Villám / Villám / Gyors / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 99% | 91% | 0% | 4,9 / 4,9 / 4,9 |
| **1.4** | +5 | tempó: pénz → Gyors | Alvó | Villám / Gyors / Gyors / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 99% | 91% | 0% | 4,9 / 4,9 / 4,9 |
| **1.5** | +5 | tempó: játékosok → Gyors | Alvó | Gyors / Gyors / Gyors / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 100% | 91% | 0% | 4,9 / 4,9 / 4,9 |
| **2.1** Kezdő | +4,4 | **célrés** | Alvó | Gyors / Gyors / Gyors / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 99% | 86% | 0% | 4,3 / 4,3 / 4,3 |
| **2.2** | +4,4 | ellenfelek → Lassan | Lassan | Gyors / Gyors / Gyors / Gyors | megszokott | lazán | szokásos | laza | 1,5 | 99% | 86% | 0% | 4,3 / 4,3 / 4,3 |
| **2.3** | +4,4 | tempó: akadémia → Alap | Lassan | Gyors / Gyors / Gyors / Alap | megszokott | lazán | szokásos | laza | 1,5 | 99% | 86% | 0% | 4,3 / 4,3 / 4,3 |
| **2.4** | +4,4 | tempó: taktika → Alap | Lassan | Gyors / Gyors / Alap / Alap | megszokott | lazán | szokásos | laza | 1,5 | 99% | 86% | 0% | 4,3 / 4,3 / 4,3 |
| **2.5** | +4,4 | tempó: pénz → Alap | Lassan | Gyors / Alap / Alap / Alap | megszokott | lazán | szokásos | laza | 1,5 | 99% | 87% | 0% | 4,3 / 4,3 / 4,3 |
| **3.1** Simaliba | +3,8 | **célrés** | Lassan | Gyors / Alap / Alap / Alap | megszokott | lazán | szokásos | laza | 1,5 | 97% | 77% | 0% | 3,7 / 3,7 / 3,7 |
| **3.2** | +3,8 | tempó: játékosok → Alap | Lassan | Alap / Alap / Alap / Alap | megszokott | lazán | szokásos | laza | 1,5 | 97% | 78% | 0% | 3,7 / 3,7 / 3,7 |
| **3.3** | +3,8 | ellenfelek → Lépést tart | Lépést tart | Alap / Alap / Alap / Alap | megszokott | lazán | szokásos | laza | 1,5 | 97% | 78% | 0% | 3,7 / 3,7 / 3,7 |
| **3.4** | +3,8 | tél → normál | Lépést tart | Alap / Alap / Alap / Alap | megszokott | lazán | szokásos | normál | 1,5 | 97% | 78% | 0% | 3,7 / 3,7 / 3,7 |
| **3.5** | +3,8 | tempó: akadémia → Komótos | Lépést tart | Alap / Alap / Alap / Komótos | megszokott | lazán | szokásos | normál | 1,5 | 97% | 78% | 0% | 3,7 / 3,7 / 3,7 |
| **4.1** Haladó | +3,2 | **célrés** | Lépést tart | Alap / Alap / Alap / Komótos | megszokott | lazán | szokásos | normál | 1,5 | 93% | 66% | 0% | 3,2 / 3,2 / 3,2 |
| **4.2** | +3,2 | tempó: taktika → Komótos | Lépést tart | Alap / Alap / Komótos / Komótos | megszokott | lazán | szokásos | normál | 1,5 | 92% | 67% | 0% | 3,2 / 3,2 / 3,2 |
| **4.3** | +3,2 | tempó: pénz → Komótos | Lépést tart | Alap / Komótos / Komótos / Komótos | megszokott | lazán | szokásos | normál | 1,5 | 92% | 67% | 0% | 3,2 / 3,2 / 3,2 |
| **4.4** | +3,2 | scout → valósághű | Lépést tart | Alap / Komótos / Komótos / Komótos | megszokott | lazán | valósághű | normál | 1,5 | 92% | 67% | 0% | 3,2 / 3,2 / 3,2 |
| **4.5** | +3,2 | tempó: játékosok → Komótos | Lépést tart | Komótos / Komótos / Komótos / Komótos | megszokott | lazán | valósághű | normál | 1,5 | 93% | 67% | 0% | 3,2 / 3,2 / 3,2 |
| **5.1** Nehéz | +1,6 | **célrés** | Lépést tart | Komótos / Komótos / Komótos / Komótos | megszokott | lazán | valósághű | normál | 1,5 | 61% | 27% | 0% | 1,5 / 1,6 / 1,6 |
| **5.2** | +1,6 | ikonok → ritkábban | Lépést tart | Komótos / Komótos / Komótos / Komótos | ritkábban | lazán | valósághű | normál | 1,5 | 61% | 28% | 0% | 1,3 / 1,6 / 1,6 |
| **5.3** | +1,6 | tempó: akadémia → Csiga | Lépést tart | Komótos / Komótos / Komótos / Csiga | ritkábban | lazán | valósághű | normál | 1,5 | 61% | 28% | 0% | 1,3 / 1,6 / 1,6 |
| **5.4** | +1,6 | tempó: taktika → Csiga | Lépést tart | Komótos / Komótos / Csiga / Csiga | ritkábban | lazán | valósághű | normál | 1,5 | 61% | 28% | 0% | 1,2 / 1,6 / 1,6 |
| **5.5** | +1,6 | képességek → realisztikus | Lépést tart | Komótos / Komótos / Csiga / Csiga | ritkábban | realisztikus | valósághű | normál | 1,5 | 60% | 28% | 0% | 1 / 1,6 / 1,6 |
| **6.1** Professzionális | +1,4 | **célrés** | Lépést tart | Komótos / Komótos / Csiga / Csiga | ritkábban | realisztikus | valósághű | normál | 1,5 | 54% | 24% | 0% | 0,8 / 1,3 / 1,4 |
| **6.2** | +1,3 | holtsáv → 1,75 (+ célrés) | Lépést tart | Komótos / Komótos / Csiga / Csiga | ritkábban | realisztikus | valósághű | normál | 1,75 | 51% | 21% | 0% | 0,6 / 1,2 / 1,3 |
| **6.3** | +1,2 | tempó: pénz → Csiga (+ célrés) | Lépést tart | Komótos / Csiga / Csiga / Csiga | ritkábban | realisztikus | valósághű | normál | 1,75 | 44% | 18% | 0% | 0,3 / 1 / 1,2 |
| **6.4** | +1,1 | tempó: játékosok → Csiga (+ célrés) | Lépést tart | Csiga / Csiga / Csiga / Csiga | ritkábban | realisztikus | valósághű | normál | 1,75 | 44% | 16% | 0% | 0,5 / 1 / 1,1 |
| **6.5** | +1 | tempó: akadémia → Gleccser (+ célrés) | Lépést tart | Csiga / Csiga / Csiga / Gleccser | ritkábban | realisztikus | valósághű | normál | 1,75 | 39% | 15% | 0% | 0,4 / 0,9 / 1 |
| **7.1** Mesteri | +0,9 | **célrés** | Lépést tart | Csiga / Csiga / Csiga / Gleccser | ritkábban | realisztikus | valósághű | normál | 1,75 | 37% | 13% | 0% | 0,3 / 0,8 / 0,9 |
| **7.2** | +0,8 | ikonok → nagyon ritkán (+ célrés) | Lépést tart | Csiga / Csiga / Csiga / Gleccser | nagyon ritkán | realisztikus | valósághű | normál | 1,75 | 32% | 11% | 0% | −0,1 / 0,6 / 0,8 |
| **7.3** | +0,7 | tempó: taktika → Gleccser (+ célrés) | Lépést tart | Csiga / Csiga / Gleccser / Gleccser | nagyon ritkán | realisztikus | valósághű | normál | 1,75 | 29% | 9% | 0% | −0,3 / 0,4 / 0,7 |
| **7.4** | +0,6 | tempó: pénz → Gleccser (+ célrés) | Lépést tart | Csiga / Gleccser / Gleccser / Gleccser | nagyon ritkán | realisztikus | valósághű | normál | 1,75 | 27% | 9% | 0% | −0,4 / 0,3 / 0,6 |
| **7.5** | +0,5 | tempó: játékosok → Gleccser (+ célrés) | Lépést tart | Gleccser / Gleccser / Gleccser / Gleccser | nagyon ritkán | realisztikus | valósághű | normál | 1,75 | 25% | 7% | 0% | −0,3 / 0,3 / 0,5 |
| **8.1** Legendás | +0,4 | **célrés** | Lépést tart | Gleccser / Gleccser / Gleccser / Gleccser | nagyon ritkán | realisztikus | valósághű | normál | 1,75 | 23% | 7% | 0% | −0,4 / 0,2 / 0,4 |
| **8.2** | +0,3 | tél → szigorú (+ célrés) | Lépést tart | Gleccser / Gleccser / Gleccser / Gleccser | nagyon ritkán | realisztikus | valósághű | szigorú | 1,75 | 21% | 6% | 1% | −0,4 / 0,1 / 0,3 |
| **8.3** | +0,2 | tempó: akadémia → Jégkorszak (+ célrés) | Lépést tart | Gleccser / Gleccser / Gleccser / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 1,75 | 19% | 5% | 1% | −0,5 / 0 / 0,2 |
| **8.4** | +0,1 | tempó: taktika → Jégkorszak (+ célrés) | Lépést tart | Gleccser / Gleccser / Jégkorszak / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 1,75 | 16% | 5% | 1% | −0,6 / −0,1 / 0,1 |
| **8.5** | 0 | holtsáv → 2 (+ célrés) | Lépést tart | Gleccser / Gleccser / Jégkorszak / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 2 | 15% | 4% | 1% | −0,7 / −0,2 / 0 |
| **9.1** Gyilkos | −0,1 | **célrés** | Lépést tart | Gleccser / Gleccser / Jégkorszak / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 2 | 13% | 3% | 1% | −0,9 / −0,3 / −0,1 |
| **9.2** | −0,2 | tempó: pénz → Jégkorszak (+ célrés) | Lépést tart | Gleccser / Jégkorszak / Jégkorszak / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 2 | 11% | 2% | 2% | −0,9 / −0,5 / −0,3 |
| **9.3** | −0,3 | tempó: játékosok → Jégkorszak (+ célrés) | Lépést tart | Jégkorszak / Jégkorszak / Jégkorszak / Jégkorszak | nagyon ritkán | realisztikus | valósághű | szigorú | 2 | 11% | 3% | 1% | −0,8 / −0,5 / −0,4 |
| **9.4** | −0,4 | ikonok → ki (+ célrés) | Lépést tart | Jégkorszak / Jégkorszak / Jégkorszak / Jégkorszak | ki | realisztikus | valósághű | szigorú | 2 | 9% | 2% | 2% | −0,9 / −0,6 / −0,5 |
| **9.5** | −0,5 | tempó: akadémia → Kőkorszak (+ célrés) | Lépést tart | Jégkorszak / Jégkorszak / Jégkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2 | 8% | 2% | 2% | −0,9 / −0,7 / −0,6 |
| **10.1** Semmi esély | −0,6 | **célrés** | Lépést tart | Jégkorszak / Jégkorszak / Jégkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2 | 7% | 2% | 3% | −0,9 / −0,8 / −0,7 |
| **10.2** | −0,7 | holtsáv → 2,25 (+ célrés) | Lépést tart | Jégkorszak / Jégkorszak / Jégkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2,25 | 6% | 1% | 3% | −1 / −0,9 / −0,8 |
| **10.3** | −0,8 | tempó: taktika → Kőkorszak (+ célrés) | Lépést tart | Jégkorszak / Jégkorszak / Kőkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2,25 | 5% | 1% | 4% | −1 / −1 / −0,9 |
| **10.4** | −0,9 | tempó: pénz → Kőkorszak (+ célrés) | Lépést tart | Jégkorszak / Kőkorszak / Kőkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2,25 | 4% | 1% | 6% | −1,1 / −1,1 / −1 |
| **10.5** | −1 | tempó: játékosok → Kőkorszak (+ célrés) | Lépést tart | Kőkorszak / Kőkorszak / Kőkorszak / Kőkorszak | ki | realisztikus | valósághű | szigorú | 2,25 | 3% | 1% | 4% | −1,2 / −1,1 / −1 |

### Amit a számítás mutat — őszintén

1. **Most fokozatos.** Közepes befektetésnél (P0 = 3) a feljutás az 1.1-es
   98%-tól a 10.5-ös 3%-ig megy. Az 5. fokozat fölött szintenként 2–6
   százalékpontot lép, sehol nincs ugrás.
2. **Az 1–5. fokozatban a belső szintek a kimenetet nem mozdítják.** A
   kétoldalú szabályozó a rést a célon tartja: ha elhúzol, a mezőny felnő.
   * Ott a belső elemek azt döntik el, **mennyi munkába kerül** tartani a
     célt: kevesebb pénz, lassabb fejlődés, licites scout, ritkább ingyen
     legenda, kevesebb kontroll a képességek felett.
   * Ezt a játékban **érzed**, de a feljutás-százalék nem mutatja.
   * A 6. fokozattól a célrés is lép minden belső szinten, ott a kimenet is
     fokozatosan romlik.
3. **A gyorsabb mezőny kimaradt a csomagból.** Az első számításban a mezőny
   három tempó-lépése (6.2 Kegyetlen, 8.5 Könyörtelen, 10.2 Végtelen)
   mindhárom befektetési profilnál nagy ugrást okozott. Például közepes
   befektetésnél a 6.2-n a feljutás 54% → 26%.
   * **Az ok:** a kétoldalú szabályozó mellett a gyorsabb mezőny a holtsáv
     aljára tol. Ez ≈ −1 rés, vagyis tíz darab 0,1-es célrés-lépés egyszerre.
   * **A helyükön** a holtsáv szélesedik (a célrés mellett). A Kegyetlen és a
     gyorsabbak az **✏️ Egyéni** blokkban választhatók, és a hivatalos szint
     (lásd lent) meg is méri őket.
4. **Nincs összeomlás.** A fék minden fokozaton a választott mezőny teljes
   éves ütemét visszaveheti (a világ megvár). Az első változatban a gyengülő
   fék (fél / nincs) a 9–10. fokozatot −10…−17-es résbe omlasztotta, ezért
   kivettem.
5. **A tempó kettős.** A játékos-tengely a **mezőny** fejlődését is
   lassítja. A pénz, a taktika és az akadémia tengelye viszont csak téged.
   A csomagban ezért lép a pénz és a taktika a játékos-tengely előtt.

## 2/b2. A kezdő lépcső

> „Jelenlegi settingekkel a kezdő játékos a legelső szezonját csak
> hagyományos mód haladó szinten kezdheti. […] Az alatta lévő összes szint
> is választható kell legyen számára."

**A kezdő lépcsőn** (az első 3 bajnoki címig):

* Az **1–4. fokozat** választható, mind a 20 belső szintjével.
* **Az osztályt** továbbra is a lépcső adja (D3).
* **A nehézséget** a választott fokozat célrése adja, nem a lépcső fix
  mezőny-Ratingje (78/80).
* A csomag zárt elemei helyett a legközelebbi nyitott érték jár, mint
  máshol.
* Az 5. fokozattól a lépcső után (3 bajnoki cím) lehet választani.
* **A régi részletes beállító útján** (fokozatválasztás nélkül) a lépcső fix
  mezőnye él, mint eddig.

## 2/c. Extra szintek a Semmi esély fölött (10.6, 10.7 …)

> „…amikor valaki 10. nehézségi szinten megnyeri a gamet (D1 win), akkor
> kinyílik a lehetőség, hogy tovább nehezítse a játékot: 10.6, 10.7 stb,
> amiknek a lényege, hogy a célrés fokozatosan (0.1 tizedenként növelhető),
> egyszerre 2 szint nyílik meg mindig (mint korábban)."

* **Az elemek** a 10.5-ös csomagéi, **csak a célrés lép** tovább 0,1-enként:
  10.6 = −1,1, 10.7 = −1,2, … A felső határ a 10.45 (−5,0).
* **Feloldás:** a 10. fokozat bármelyik szintjén megnyert karrier a **nyert
  szint utáni két szintet** nyitja:
  * 10.1–10.5-ön nyerve: 10.6 és 10.7;
  * 10.7-en nyerve: 10.8 és 10.9;
  * a már nyitottnál könnyebb szinten nyerve nem nyílik új (mint a régi
    létrán).

  A napló kimondja.
* **A beállítón** a 10. fokozat listájában a nyitott extra szintek
  választhatók, a következő kettő lakattal látszik.
* A régi (≥10-es profil) bélyeg a tíz fokozatot nyitja, **az extrákat nem**.
* **A várható kimenet** az extra szinteken a 10.5 mérése, a réssel eltolva
  (jelölve).

## 2/d. A 8/8 beilleszkedés kihívás

> „8/8 beilleszkedés kihívás legyen mindig 8 meccses határidejű"

* **A határidő mindig +8 forduló**, a beilleszkedéshez szükséges 8 saját
  meccs. Eddig a következő checkpointig tartott, ami gyakran rövidebb volt.
* Ha az idényben már nincs 8 meccs hátra, a játék nem ajánlja fel.

## 3/b. A hivatalos szint (egyéni beállításnál)

> „…amikor egyénileg állítasz be sajátos setupot, akkor azt mérje meg hogy
> kb melyik nagyobb szintnek felelne meg és az legyen kijelezve, mint
> hivatalos nehézségi szint."

**A nehézségi pont:**

* a célrés 0,1-enként 1 pont (+4 = 0);
* minden elem minden lépése a könnyűtől 1 pont;
* a mezőny tempója a „Lépést tartanak” fölött lépésenként 10 pont (≈ −1 rés,
  a szimuláció szerint).

**A szabály:**

* A létra 50 szintjének pontja szigorúan nő.
* Az egyéni beállítás **a legközelebbi pontú szint** hivatalos szintjét
  kapja. Egyenlőségnél a nehezebbet.
* **Példa:** a 4.1 Kegyetlen mezőnnyel = 5.1 Nehéz; a 4.1 Alvó mezőnnyel és
  Villám tempóval = 3.1.

**Hol látszik:**

* „✏️ Egyéni — hivatalosan ≈ 5.1 Nehéz” a beállítón, az osztályválasztón és
  az összefoglalóban.
* A karrierben a mostani célréssel számolva.
* **A feloldás is ezt használja:** egy megnyert karrier a hivatalos szint
  utáni nagy fokozatot nyitja.

## 3/c. A kijelzés

> „…a nehézségi szint legyen ott látványosan kiírva, ahol a dinamikus módban
> az aktuális mezőny erő szokott kiírva lenni azzal a színes kerettel."

* **A HUB-on**, a dinamikus mód „Nehézségi szint” gombjának helyén, a
  piramis-létra fölött egy **színes sáv**: „🎚 Nehézségi szint — 6.3
  Professzionális”, alatta a célrés.
* **A szín a fokozaté:** zöld → arany → narancs → piros → bíbor.
* **A fejléc színes jelvénye** is a szinttel kezd („🎚 6.3 Professzionális ·
  D6 · …”), a fokozat színével.

## 3/d. A régi preferenciák védelme

Ha a böngészőben már van tárolt nehézségi preferencia (tempó, résztempók,
ikonok, scout), az új indítás **nem írja felül** az ajánlott csomaggal. Ilyenkor
„Egyéni” marad, a hivatalos szinttel. Ez védi például a futó karrierből
jóváírt ritkább ikonokat. A beginner-lépcső próbája (`lepcsok-proba`) fogta
meg.

## 4. Javítás a 3.9.222-ben (alsó fék)

A mezőny szintje egész számra kerekedik. Az emelésnél jogos a „keményebb
oldalra” kerekítés, a fék viszont ezzel visszacsinálta a saját hatását: a
fék rögzült, de a rés nem mozdult. Ez néha előfordult; a 3.9.222-es próba
szerencsével ment át rajta.

**Mostantól:**

* a fék a holtsáv széléhez **legközelebbi** elérhető résre áll;
* a rögzített nagysága a rés **tényleges** változása.

## 5. A mérő

* **Beállítás-blokk:** `piramis.fok` („4.1”, egyéninél „e4.1”) és
  `piramis.tel`.
* **Idényenként:** a fokozat (`nf`), a célrés és a fék, mint 3.9.222-ben.

## Próba

`tools/fokozat-csomag-3-9-223-proba.js` — 51 állítás:

* **A tábla:**
  * betűre egyezik a szimulációéval;
  * a határon csak a célrés lép, belül pontosan egy elem;
  * nehezebbre lép, soha vissza;
  * a 6. fokozattól realisztikus a képesség, a 7.-től minden tempó legalább
    Csiga;
  * a célrés +5-től −1-ig, az 5. fölött szintenként 0,1;
  * a kimenet monoton.
* **Az új indítás:**
  * a három oldal;
  * friss alapbeállításon a 4.1;
  * a 6.3 minden elemet beállít;
  * egy elem átírása Egyéni, és újranyitva is megmarad.
* **A zárak** és a kezdő lépcső (az 1–4. fokozat választható, csak az
  osztály kötött).
* **A feloldás:**
  * az első 6 fokozat nyitott;
  * egy megnyert karrier a következő NAGY fokozatot nyitja, karrierenként
    egyszer;
  * a régi, legalább 10-es profilnak minden nyitva, az újnak nem;
  * a beállítón a zárt fokozat szintjei tiltva.
* **A 2. és a 3. oldal.**
* **Az osztályválasztó** és a karrier tárolása.
* **A tél** a csomag tűrésével.
* **A 🎛️ blokk.**
* **A hivatalos szint** (minden csomag önmaga; egyéninél a legközelebbi), a
  **HUB-sáv** és a **fejléc**.
* **Az extra szintek** (csak a célrés lép; a nyert szint után kettő nyílik).
* **A 8 meccses beilleszkedés-határidő.**
* **A dinamikus mód** és a **közös karrier** (a csomag a szoba
  rés-csúszkáját is állítja).
