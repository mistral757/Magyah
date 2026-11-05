# Magyah — verziótörténet (2026-07-27 → 2026-11-05)

*Rekonstrukció a repó 1 039 commitjából, a verziószámok és a kód méretének
változásából. A csillagok (★) a saját értékelésem: mennyire alakította át a
játékot, nem mennyi munka volt benne. Olvasási idő: ~6 perc; az első táblázat
magában is elmond mindent.*

## 1. Egy pillantás

| Verzió | Dátum | Verziók | `index.html` a végén | Mi lett belőle | Súly |
|---|---|---|---|---|---|
| **2.2** | 07-27 | 1 | 13 700 sor | A repó első commitja: kész játék, service worker, ikonok | — |
| 2.3–2.4 | 07-27 → 07-28 | 25 | 14 200 | Karrier-csiszolás; **a PvP váza (F0–F3): szobák, seedelt folyamok** | ★★★★ |
| **2.5** | 07-28 → 08-04 | 114 | 25 000 | **Párharc a szezonban (15./30. forduló)**, kupák, Infinity, Run-szint | ★★★★★ |
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

(A „Verziók” oszlop a kiadott egyedi verziószámok száma; a commit több: 1 039. A 3.9.223–247 számait utólag, egy commitban pótolták.)

## 2. A számok

- **101 nap, 1 039 commit.** Ebből 831 hordozott verziószámot.
- **A kód:** 13 700 → 136 000 sor (×10). Az utolsó 65 nap (a 3.9) adta a
  teljes méret 38%-át.
- **Próbák:** a 3.9 elején még nem volt `tools/*-proba.js`; ma **280** van.
  A leírások (`docs/`) 52-ről 294-re nőttek.
- **Tempó:** a 2.5 (114 verzió) és a 2.6 (78 verzió) együtt kb. 13 nap alatt
  készült el. Ez a játék leggyorsabb szakasza. A 3.9 lassabb, de sokkal
  szélesebb.
- **A commitok jellege a 3.9-ben** (tárgysor szerint, hozzávetőleg): ~47% új
  funkció, ~19% hangolás, ~12% nevek és tartalom, ~11% felület, ~8%
  hibajavítás, ~3% technika.

## 3. A történet

### Előtörténet — 2.2 (07-27)
A repó nem a nulláról indul: az első commit már egy működő, 13 700 soros
játék (service worker, ikonok, karrier mód). Hogy mi volt előtte, a repóból
nem rekonstruálható. A verzió 2.2.00. Egyetlen nap alatt 2.3 és 2.4 lett
belőle.

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

Ugyanebben a szakaszban jött a kupák rendszere (Magyar Kupa, selejtező,
közös nyári kupa), az **Infinity** (a végtelen nehézségi lépcső) és a
**Run-szint**, a karrier teljesítményének mérőszáma.

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

- A patch-számok formája nem állt: `2.5.0`, `2.5.04`, `2.5.126`, aztán a
  2.6-ban háromjegyű (`2.6.001`), majd a 3.0-tól kétjegyű (`3.0.00`).
- A 3.9.223-tól a 3.9.247-ig **24 változás verzió nélkül ment ki**, ezeket a
  3.9.247 utólag pótolta.
- A 3.9 maga 345 verzió volt, ami „minor”-nak túl sok: a számozás így nem
  árulta el, mekkorát lépett a játék.
- **11-05:** új rend, `1.0.MAJOR.MINOR.PATCH` (lásd `VERZIOZAS.md`). A
  3.9.368 utólag **1.0.4.8.02**.

## 6. Mire érdemes figyelni

- A 2.2 előtti időszak nem látszik a repóban.
- A „súly” oszlop és a csillagok az én ítéletem, nem mérés.
- A méretek (`index.html` sorai) az adott szakasz utolsó verziójának
  commitjából mért értékek, kerekítve.
- A 3.9 fejezetbeosztása a commit-tárgysorokból készült; a határok
  közelítők.
