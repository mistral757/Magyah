# 3.9.187 — 🪓 Panzer szerep-erősítő, ⚡ Gegenpressing stábtag-műhely, öt névköteg

> „A névjavaslatok mehetnek. Panzerkampfwagennél nincsen kiosztott szerepek
> erősítő képesség, Gegenpressingnél stábtag erősítő képesség."

## 🪓 Panzerkampfwagen — Kiosztott szerepek (III. rang)

**A szerepek megvoltak, csak a képesség hiányzott.** A három Panzer-szerep
(Mészáros, Vezér, Falka) a 3.9.109 óta él, és a négy szintjük értéke is ott
állt. A fán viszont nem volt meg az a képesség, ami a 0. (alap) szintről
feljebb viszi őket. Most bekerült, ugyanúgy, mint a többi hat stílusnál.

| szint | Mészáros (ellenfél-gólesély · lap/sérülés) | Vezér (kiállítás meccserő-ára) | Falka (emberhátrányban) |
|---|---|---|---|
| alap | −3,5% · ×1,4 | −20% | −4% |
| I. | −5,5% · ×1,7 | −32% | −7% |
| II. | −8% · ×2,1 | −45% | −10% |
| III. | −10,5% · ×2,6 | −58% | −14% |

* **Ugyanazon az úton hat, mint a többi stílusnál:** a `roleLevel` a
  „szerepek” kulcsot olvassa, ezért a három szerep külön bekötés nélkül
  követi a szintet.
* **A szint a szerep saját stílusáé:** másodlagos Panzerként is a Panzer saját
  szintje él, a másik stílus képessége nem emeli.

## ⚡ Gegenpressing — Letámadás-műhely (I. rang)

**A többi stílus „…-műhely” képességének mintájára készült:**

| stílus | műhely | stábtag-típus |
|---|---|---|
| Bombázók | Gólvágó-műhely | Gólvágó-mentor |
| Villám | Sprintmester-műhely | Sprintmester |
| Panzer | Kőkemény iskola | Bástya, Gólvágó-mentor |
| **Gegenpressing** | **Letámadás-műhely** | **Sprintmester, Bástya** |

**Miért ez a két típus:** a letámadás két lába a láb és a szerelés. A
Nyomás-iskola is a gyorsasági és a védekező képességekre szól.

**Mit ad szintenként:**

| szint | tapasztalat-tempó | hatékonyság |
|---|---|---|
| I. | kétszeres | +20% |
| II. | háromszoros | +32% |
| III. | négyszeres | +45% |

* **A mostani stábtagra is hat:** a hatékonyság-növelés azonnal érvényes, nem
  csak a fejlődést gyorsítja.
* **Az élő sor** kiírja, kin fog most, és mennyivel.

**A teljes kép (a próba méri):**

* **Szerep-erősítő:** a Sztárom a páromon kívül mindegyik stílusnak van. A
  Sztár szerepei (Szolgáló, Testőr, Örökös) is képesség nélkül, az alapszinten
  működnek.
* **Stábtag-erősítő műhely:** mind a nyolc stílusnak van.

## 🏷️ Névjavaslatok — öt köteg, 49 név

**Mind kézi rétegbe került** (`tools/nevek/manual.py`):

* 11 a helyén cserélődött, mert már kézi bejegyzés volt;
* 38 új `JAVASLAT_3_9_187` blokkba került, a régi gépi alakkal megjegyzésben.

**Ellenőrzés:**

* a `build.py` újragenerálta a `HU_NAME_TABLE`-t;
* a `kettozes.py` tiszta.

**Rövid névként egyezik, de teljes névként egyedi:**

* Miliméteres Gábor és Miliméteres Dijégó (a Milito testvérek);
* Bástyás Simon és Bástyás Sándor;
* Bábel Márk és Bábel Rájen.

**A kötegek:**

* **3.9.171:** Álomszó Csabi, Mandolás Kostás, Zagyva Teó, Vidámka Márk,
  Miliméteres Gábor, Pálinkás Gyula, Óvárosi Farkas, Dámvadas Dani.
* **3.9.172–173:** Keresztelő Gyula, Szilveszter Mihály, Módos Antal, Hidas
  Vendel, Borbély Fülöp, Kemence Márió, Rámolós Krisztián, Mulató Jenő, Káosz
  Farkas, Pocsolyás Móric.
* **3.9.175:** Ármány Pál, Vaníliás Pál, Gránátos István, Ifjú Erik, Mahagóni
  János, Fürdőszobás Huba, Bástyás Simon, Remete Erik, Dévényi Kelemen,
  Péterfi Erik.
* **3.9.179:** Tudós Kolos, Kacsa Sándor, Parkoló Pál, Odú Miksa, Foltos Márk,
  Táncos Román, Operettes Kristóf, Peres Máté, Bakos András, Halas Márk.
* **3.9.185:** Burgonya Rezső, Medve Geri, Szósz Ferkó, Lazsáló Manó, Bödön
  Bertalan, Augusztus Károly, Bábel Márk, Zsemle Dávid, Vége Nándor, Dörmögő
  Bernát, Álmos András.

## Próba

`tools/szerep-muhely-nevek-3-9-187-proba.js` — 16 állítás.
