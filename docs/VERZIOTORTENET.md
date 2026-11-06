# Magyah — verziótörténet (a „30–0”-tól 2026-11-05-ig)

*Rekonstrukció a repó 1 039 commitjából (2026-07-27 → 2026-11-05), és a 2.2
előtti időkből megmaradt 26 teljes állapotból (négy verziószám nélküli „30–0”,
majd 0.758.2 → 1.4.09, dátum nélkül). A csillagok (★) a saját értékelésem: mennyire alakította át a játékot,
nem mennyi munka volt benne. Olvasási idő: ~7 perc; az első táblázat magában is
elmond mindent.*

## 1. Egy pillantás

| Verzió | Dátum | Verziók | `index.html` a végén | Mi lett belőle | Súly |
|---|---|---|---|---|---|
| 30–0 (verzió nélkül) | a repó előtt | 4 állapot | 2 800 sor | **A kezdet:** egyszeri NB I-draft „30–0” címmel; 7 → 47 klub-szezon, cserepad, edzők, kémia, átigazolási ablak, családtag-kör, ikonok, jutalom-skillek | ★★★ |
| 0.758.2–0.765.0 | a repó előtt | 4 állapot | 4 000 | **A Karrier mód születése:** HUB, scout, szezonváltás, TSI-görbe, folyamatos fejlődés, ifjúsági akadémia, átigazolási büdzsé; az első verziószám és a mentés | ★★★★★ |
| 0.766–0.810 | a repó előtt | 6 állapot | 5 500 | Fogalomtár, szezonvégi kártyák, szintlépés, a mezőnyhöz kötött igazolás; a végén a PWA első nyoma | ★★★ |
| 0.993–0.995 | a repó előtt | 2 állapot | 6 200 | **Infinity mód**, Rating-plafon, új árazás, ifi-boost, élő eredménytábla, scout-fejlesztés | ★★★ |
| 1.1–1.2.61 | a repó előtt | 8 állapot | 9 300 | Válogatottak (70 → 110 keret), párkémia, kihívások, **attribútum-rendszer**, poszt-tanulás | ★★★ |
| 1.3.00 | a repó előtt | 1 állapot | 10 400 | **Európai kupák és taktika-rendszer** egyetlen lépésben (+58 függvény) | ★★★★ |
| 1.4.09 | a repó előtt | 1 állapot | 11 000 | Kész klubbal indulás, félidényi HUB; a Karrier mód a módválasztó élére kerül | ★★ |
| **2.2** | 07-27 | 1 | 13 700 sor | A repó első commitja: kész játék, service worker, ikonok | — |
| 2.3–2.4 | 07-27 → 07-28 | 25 | 14 200 | Karrier-csiszolás; **a PvP váza (F0–F3): szobák, seedelt folyamok** | ★★★★ |
| **2.5** | 07-28 → 08-04 | 114 | 25 000 | **Párharc a szezonban (15./30. forduló)**, kupa-bővítések, közös Infinity, Run-szint | ★★★★★ |
| 2.6 | 08-04 → 08-09 | 78 | 33 200 | Rating-alap fokozatok, Infinity-finomítás, közös kupa hibák hada | ★★★ |
| 2.7 | 08-09 → 08-10 | 10 | 34 200 | Kiadás-előkészítés, Run-ranglisták | ★★ |
| **3.0** | 08-10 | 13 | 37 800 | **Mérföldkövek + csapatstílusok (a klub filozófiája)** | ★★★★★ |
| 3.1 | 08-10 → 08-13 | 48 | 43 900 | A nagy UI-tisztázás: menü-mód, Infópult, ikonok | ★★★ |
| 3.2 | 08-13 → 08-14 | 3 | 45 000 | Szezon-szerepek, kinyíló Infinity-lépcsők | ★★ |
| 3.3 | 08-14 → 08-17 | 38 | 53 600 | Átigazolási ügynökség, **25 témás tanítóréteg**, globális Run-ranglista | ★★★ |
| 3.4 | 08-18 → 08-19 | 22 | 57 200 | Tiki-Taka (7. stílus), egyszerű dinamikus mód | ★★ |
| **3.5** | 08-19 → 08-22 | 45 | 62 600 | **A hagyományos karrier: a ligapiramis** | ★★★★★ |
| 3.6–3.7 | 08-22 → 08-26 | 50 | 70 100 | Stadion-mód, FA-kupa, a draft visszatér a piramisba | ★★ |
| 3.8 | 08-27 → 09-01 | 38 | 82 000 | Forma, szezonkeret, összhang, büdzsé-érzékeny árak | ★★★ |
| **3.9.00–99** | 09-01 → 09-19 | 100 | 99 700 | Meztervező, PWA, jogtisztaság; PvP-élmény; lépcsők, Jellem, Panzer, Gegenpressing | ★★★★ |
| 3.9.100–221 | 09-20 → 10-07 | 122 | 119 600 | Sztár piac, Hiper Szuper Kupa, **Talizmánok (82 special)**, hang, Pixel-téma, sajtó, scout | ★★★★ |
| **3.9.222–254** | 10-08 → 10-16 | 9 (+24 utólag) | 122 800 | **Tízfokozatú, kétoldalú nehézség** | ★★★★★ |
| 3.9.255–286 | 10-17 → 10-23 | 32 | 128 300 | Talizmán-színek, stadion, **arcképek, esemény-animációk, momentum** | ★★★ |
| 3.9.287–346 | 10-23 → 11-02 | 60 | 134 800 | PvP 2.0 (célrés, hardcore), **Edző menü**, rés-követés, **saját bajnokság** | ★★★★ |
| 3.9.347–368 | 11-02 → 11-05 | 22 | 136 000 | Felzárkóztatás, osztálylépcső, lelátó, a keret kihirdetése | ★★★ |
| **1.0.4.8.03** | 11-05 | — | 136 000 | Új verziószámozás | ★ |
| 1.0.4.9–1.0.4.10 | 11-05 → 11-06 | 4 | 136 000 | Kerethirdetés a párharc előtt; **a verziótörténet beépítve a játékba** (a verziószámra koppintva nyílik) | ★★ |

(A „Verziók” oszlop a kiadott egyedi verziószámok száma; a commit több: 1 039. A 3.9.223–247 számait utólag, egy commitban pótolták. A „a repó előtt” sorok a megmaradt állapotok száma. A sorrend a verziószámból következik, a négy verzió nélküli állapoté a méretből és a tartalomból; dátumot egyik sem hordoz.)

## 2. A számok

- **101 nap, 1 039 commit.** Ebből 831 hordozott verziószámot.
- **A kód:** 13 700 → 136 000 sor (×10). Az utolsó 65 nap (a 3.9) adta a
  teljes méret 38%-át.
- **Az ősidők:** a legkorábbi megmaradt állapot (a „30–0”) 1 093 soros; a
  0.758.2 3 356, az 1.4.09 10 998, a repó első commitja 13 691, ma 136 000.
  Vagyis a kezdetektől ×124. A beépített keretek száma 7 klub-szezonról
  110-re nőtt.
- **Próbák:** a 3.9 elején még nem volt `tools/*-proba.js`; ma **280** van.
  A leírások (`docs/`) 52-ről 294-re nőttek.
- **Tempó:** a 2.5 (114 verzió) és a 2.6 (78 verzió) együtt kb. 13 nap alatt
  készült el. Ez a játék leggyorsabb szakasza. A 3.9 lassabb, de sokkal
  szélesebb.
- **A commitok jellege a 3.9-ben** (tárgysor szerint, hozzávetőleg): ~47% új
  funkció, ~19% hangolás, ~12% nevek és tartalom, ~11% felület, ~8%
  hibajavítás, ~3% technika.

## 3. A történet

### Ősidők — a „30–0” és a 0.758 → 1.4.09 (a repó előtt) ★★★★
Dátum egyik megmaradt állapotban sincs, ezért itt csak a sorrend és a
tartalom rekonstruálható. A sorrendet a verziószám adja; a négy legkorábbi
állapotnak nincs verziószáma, azokat a méretük és a tartalmuk rendezi sorba.

**A „30–0” (4 állapot, 1 093 → 2 824 sor).** A böngészőfül címe „30-0 · NB I
draft 2007–2015”, a fejléc egyszerűen „30–0”. A játék egyetlen szezon: draft
az elejétől, cserepad, edzők, Hattrick-ihletésű személyiség, klubrivalizálás
(kémia), közjátékok, átigazolási ablak évszakváltással. A legkorábbi
állapotban 7 klub-szezon van, kb. 80 játékossal; a másodikban már 36 (kb. 600
játékos) és ellenfél-tábla. A harmadikban jelenik meg a „Magyah Szutykos
Kutyusok a Topligás Kutyaszarvasalók Között” cím, a családtag-kör, az
ikonikus játékosok, a jutalom-skillek és a meccsközi események. A negyedikben
47 klub-szezon és kb. 800 játékos van (a magyar NB I 2007–2015 mellett Real
Madrid, Barca, Bayern, Man City, PSG, Liverpool és társaik: 16 bajnokság, 5
kontinens).

**A Karrier mód születése (0.758.2 → 0.765.0).** A 0.758.2 az első állapot,
amelyben verziószám van (a séma `0.757.X`, az X kiadásonként nő; a kód szerint
„már nem demó, hanem élő, futó projekt”, Netlify). Itt jelenik meg a
módválasztó: **Klasszikus** (egyetlen szezon, draft az elejétől) és **Karrier
mód**, amiről azt írja: „most épül”. A Karrier mód HUB-bal, scouttal és
draft-jelöltekkel, szezonváltással, TSI-vel és fejlődési görbével, valós
személy regiszterrel, és a mentéssel a böngészőbe érkezik. A 0.758.6-ban
jön a folyamatos, meccsenkénti fejlődés és a játékos-nyitások, a 0.758.12-ben
a jutalom-skillek fokozatos kialakulása, a 0.765.0-ban az **ifjúsági
akadémia** és az **átigazolási büdzsé**.

A bemutatkozó szöveg rímekbe szedve állította, hogy „nincs itt UEFA, nincs
itt Bajnokok Ligája cifra fénye”. Az 1.3.00-ban megjöttek az európai kupák.

**Az ív**, a megmaradt állapotok szerint:
- **0.766–0.810:** fogalomtár; ikon-ajánlatok és kapitányváltás; **szezonvégi
  kártyák**, nyári klub-szemle és szintlépés; játékos-adatlap; az igazolási
  szint a mezőnyhöz kötve; a karrier lezárása és letölthető története. A 0.797
  és a 0.810 között jelenik meg a service worker és a manifest, a
  **telepíthető (PWA) játék** első nyoma.
- **0.993–0.995:** az **Infinity mód**, a Rating-plafon, a „vásárlás drága,
  eladás szerény” árazás, az ifi-boost, az élő eredménytábla és perc-óra,
  a scout fejleszthetősége. A verziószám középső tagja itt ugrik 0.810-ről
  0.993-ra, köztes állapot nem maradt.
- **1.1–1.2.61:** ikonok fejlődése; VB- és EB-győztes válogatottak (a
  keretek 76-ról 108-ra), párkémia, **kihívás-rendszer**, az „öreg
  csirkefogó” boost, kapitány-alkalmasság, **attribútum-rendszer**,
  poszt-tanulás.
- **1.3.00:** **európai kupák** (kvalifikáció, kapu, BL egyéni aranydíjak) és a
  **taktika-rendszer**, egyetlen lépésben: +58 függvény, +1 100 sor. Ez a
  legnagyobb ugrás az ősidőkben.
- **1.4.09:** csak-díj skillek, **kész klubbal indulás**, félidényi HUB. A
  módválasztón a Karrier mód kerül előre, a Klasszikus hátra: a „most épül”
  mód lett a játék.

**Értékelés:** a legnagyobb ősi fordulópont a **0.758.2**, a Karrier mód
megszületése. Ez az a mód, amelyre a játék összes későbbi nagy rendszere
épül. A karrier-HUB, a scout, a fejlődési görbe és a kémia mind itt van. Ha az
ősidőket is beleszámítanánk az öt fordulópont közé, ez állna a lista élén. A
további három ősi fordulópont a 0.993 (az Infinity, az első „végtelen”
nehézség), az 1.2.x (az attribútum-alapú játékos) és az 1.3.00 (európai kupák
és taktika). A 2.x elején pedig megszületik a PvP. A névben a „30-0” és az
„NB I” a 3.9.13-ban került ki (jogtisztaság), de a service worker
gyorsítótárának neve ma is `harminc-nulla-cache`.

### Az első commit — 2.2 (07-27)
A repó az 1.4.09 után indul, a 2.2.00-val: az első commit már egy működő,
13 700 soros játék (service worker, ikonok, karrier mód). Az 1.4.09 és a
2.2.00 között a 1.4.x vége és a 2.0–2.1 nem maradt meg. Egyetlen nap alatt
2.3 és 2.4 lett belőle.

### A PvP megszületése — 2.3–2.5 (07-27 → 08-04) ★★★★★
A játék legfontosabb szerkezeti döntése **egy napon belül született meg**
(07-28), commitról commitra, „F0”-tól „F4”-ig:

> F0 belépő képernyő · F1 determinizmus: nevesített seed-folyamok · F2
> hálózat és szobák (Firebase) · F3 közös indulás · F4 meccs-pillanatkép,
> kétoldali szimuláció, **a párharc bekötése a szezonba, 15. és 30. forduló**

Értékelés: ez az a döntés, amelyre az egész későbbi játék épül. A seedelt
determinizmus a kulcs: két gép ugyanazt a világot és ugyanazt a meccset
számolja ki. A 3.9-es PvP-fejlesztések (célrés, hardcore seed, saját
bajnokság) mind ezen állnak.

Ugyanebben a szakaszban bővült a kupák rendszere (az európai kupák már az
1.3.00 óta megvoltak; most jött a Magyar Kupa, a selejtező és a közös nyári
kupa), az **Infinity** (a végtelen nehézségi lépcső, a 0.993 óta létezik)
közös karrierre is kiterjedt, és megjött a **Run-szint**, a karrier
teljesítményének mérőszáma.

A hátránya is látszik: a 2.5–2.6 commitjainak nagy része
„nem ragadhat be”, „nem csúszhat szét”, „önmagát gyógyítja”. A PvP-kupa
szinkronja hetekig tartott. Ez a ára az újításnak.

### A játék személyisége — 3.0 (08-10) ★★★★★
A 3.0.00 a mérföldkövek kiadása, a 3.0.03–05 pedig a **csapatépítési
stílusok** (a klub filozófiája, stílus-mérföldkövek, trait-bolt). Ez adta a
játék karakterét: innentől nem csak erősíteni lehet a csapatot, hanem
**valamilyen klubot** építesz. A 3.9-ben ez nyolc filozófiára, saját
boltokra és gazdaságra nőtt.

### Rendrakás és tanítás — 3.1–3.4 (08-10 → 08-19) ★★★
A játék közben megtelt rendszerekkel, ezért jött a tisztítás: menü-mód,
Infópult, 25 témás tanítóréteg (a rendszer megtanítja magát), globális Run-
ranglista. Közben jött az átigazolási ügynökség és a hetedik stílus, a
Tiki-Taka.

### A főmód — 3.5 (08-19 → 08-22) ★★★★★
A **ligapiramis** („hagyományos karrier”): osztályok, feljutás, kiesés,
osztályozó, egy mezőny, amely fordulóról fordulóra erősödik. Ez lett a
játék fő módja, és azóta a legtöbb hangolás erről szól. Három nap alatt 45
verzió készült hozzá.

### Szélesedés — 3.6–3.8 (08-22 → 09-01) ★★★
Stadion-mód fekvő telefonra, FA-kupa, forma ötmeccsenként, szezonkeret,
összhang, büdzsé-érzékeny árak. Ezek a játék „gazdasági és emberi” rétegét
építették.

### A nagy hónap — 3.9 (09-01 → 11-05)
A 3.9 a repó legnagyobb szakasza, 345 verzió. Hat jól elkülöníthető fejezet:

1. **Alapozás (09-01/02, 3.9.00–13).** Meztervező, önhosztolt betűk, PWA,
   mentés ki- és visszatöltése. **Jogtisztaság:** kupanevek, az NB I
   kivezetése, a nyers játékosnevek kigyomlálása. Ez nem látványos, de
   nélküle nem lehet kiadni a játékot.
2. **A játék sűrűsödése (09-02 → 09-24).** Feloldás-lépcsők, Jellem,
   Panzer, Gegenpressing (a 8. filozófia), sztár piac, Hiper Szuper Kupa,
   stílusboltok.
3. **Talizmánok (09-25 → 09-28).** Négy nap alatt 82 special, égetés,
   fúzió, rezonancia. A legnagyobb egyben szállított rendszer a repóban.
4. **Hang, megjelenés, gazdaság (09-28 → 10-07).** Chiptune zene, Pixel-
   téma, sajtó és helyi lapok, játékosszintű fizetések, scout.
5. **Tízfokozatú nehézség (10-08 → 10-16) ★★★★★.** A nehézség egész
   logikája kétoldalúvá vált (a mezőny követ, ha elhúzol; megáll, ha
   lemaradsz). Futó karrierekre átállással. Ettől kezdve épült minden
   nehézség-réteg: célrés, súlyozott mezőny, rés-követés, osztálylépcső.
6. **Mérés, PvP 2.0, Edző, saját bajnokság (10-17 → 11-05).** A fejlesztés
   mérésvezérelt lett (karrier-mérő, Firebase-feltöltés, a `meres-adat` ág).
   Jött az Edző menü és a meccs-magyarázat, a hardcore PvP, az osztott
   nehézség, a **saját bajnokság** (Könnyed PvP, 10-29) és a keret
   kihirdetése.

## 4. Saját értékelésem

**Az öt fordulópont**, fontossági sorrendben:

1. **A PvP váza (2.4.07–2.5.0, 07-28).** Az egész architektúra erre épül.
2. **A ligapiramis (3.5.00, 08-19).** Ez lett a főmód.
3. **A csapatstílusok (3.0.03, 08-10).** Ez adott identitást.
4. **A tízfokozatú nehézség (3.9.222, 10-08).** A játék „szerződése” itt
   változott utoljára alapvetően. Ezért lett a 4.0 az új számozásban.
5. **A saját bajnokság (3.9.331, 10-29).** A PvP-t „barátokkal is
   játszhatóvá” tette, külön világokkal.

**Ami látványosabb volt, mint fontos:** az arcképek, az esemény-animációk
és a Pixel-téma. Szépek, de a játék működését nem változtatták.

**Ami fontosabb volt, mint látványos:** a determinizmus (F1), a
jogtisztaság (3.9.13), a mentés kimenthetősége (3.9.03), a mérés és a
regressziós próbák (a 3.9.306-os futtató óta). Ezek tartják egyben a
játékot.

**Egy minta:** minden nagy funkciót hibajavítás-hullám követ, főleg a PvP-
szinkronban. A rendszer sebessége és a hibák száma összefügg. A 3.9
második felében ezt a próbák és a mérés kezdték ellensúlyozni.

## 5. A számozás története (érdekesség)

- Az első négy ősi állapotnak nincs verziószáma. A séma a 0.758.2-vel
  indul: `0.757.X` (az X minden kiadással nő), az 1.4.09 kódja már `1.2.XX`-et
  ír. A középső tag 0.810-ről 0.993-ra ugrott.
- A patch-számok formája nem állt: `2.5.0`, `2.5.04`, `2.5.126`, aztán a
  2.6-ban háromjegyű (`2.6.001`), majd a 3.0-tól kétjegyű (`3.0.00`).
- A 3.9.223-tól a 3.9.247-ig **24 változás verzió nélkül ment ki**, ezeket a
  3.9.247 utólag pótolta.
- A 3.9 maga 345 verzió volt, ami „minor”-nak túl sok: a számozás így nem
  árulta el, mekkorát lépett a játék.
- **11-05:** új rend, `1.0.MAJOR.MINOR.PATCH` (lásd `VERZIOZAS.md`). A
  3.9.368 utólag **1.0.4.8.02**.

## 6. Mire érdemes figyelni

- A 2.2 előtti időszak 26 megmaradt állapotból van rekonstruálva. Dátumot
  nem hordoznak, a sorrend a verziószámból következik (a négy verzió nélküli
  állapoté a méretből és a tartalomból), és hézagok vannak köztük (a „30–0”
  és a 0.758.2 között, 0.810 → 0.993, 1.1.12 előtt, 1.4.09 → 2.2.00).
- A „súly” oszlop és a csillagok az én ítéletem, nem mérés.
- A méretek (`index.html` sorai) az adott szakasz utolsó verziójának
  commitjából mért értékek, kerekítve.
- A 3.9 fejezetbeosztása a commit-tárgysorokból készült; a határok
  közelítők.
