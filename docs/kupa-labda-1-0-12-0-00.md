# 🏆⚽ Hazai kupa minden helyezéssel, két kupa egy nyáron, meccslabda, animációk az arculatban — 1.0.12.0.00

> KIMONDOTT KÉRÉS: „A klub arculata menüpont alatt lehessen az animációkkal kapcsolatos beállításokat is elérni, plusz legyen itt egy meccslabda kusztomizáló rész is. Lehessen külön a bajnokságra és minden aktuálisan számodra elérhető kupára (mennyei megyeiben csak a NYK, D1-ben FA és BL stb.)
> Erről jut eszembe, a MK mindig legyen NBII, NBI-ben megfelelő helyezés esetén (akkor is ha megnyered az NBIet) ugyanígy FA legyen helyezéstől függetlenul mindig D2 és D1ben. D0-tól csak a HSz"
>
> **Döntések (a játékos válaszai):**
> - az NB I-ben **mindenki** indul az MK-ban;
> - két kupa esetén **előbb a hazai**, utána az európai.

**Major:** a futó karrierek is erre a szabályra állnak át a következő szezonzárástól. A mentés bővül (`S.euroSor`); egy régi mentés üres sorral tölt be.

## 1. A kupaszabályok a ligapiramisban

| Osztály | Hazai kupa | Helyezésből (mellé) |
|---|---|---|
| D0-tól | — | csak a Hiper Szuper Kupa (változatlan) |
| D1 | **Fából Készült Serleg — mindig** | 1–3. KK · 4–5. OJK · 6. KONF |
| D2 | Fából Készült Serleg — mindig (selejtezőtől, változatlan) | — |
| D3 (NB I) | **Magor Kupája — mindig**, a bajnok is | 1. KK · 2. OJK · 3. KONF (selejtezőtől) |
| D4 (NB II) | **Magor Kupája — mindig** (eddig csak az 1–3.) | — |
| D5, D6 | — | — (a nyári felkészülési torna, NYK) |

- **Két kupa:** ha két kupa jut, a szezonzáráskor előbb a hazai kupa indul. Az európai a sorba kerül (`S.euroSor`), a kupa képernyőjének záró gombja kimondja („Tovább: Kupák Kupájának Kupája →”), és utána rögtön az indul.
- **A hazai kupa győzelme, ha még egy sorozat vár:**
  - ha jobb sorozatot ér, mint ami sorban áll, a sor **feljavul** (pl. KONF → KK-selejtező), még ugyanazon a nyáron;
  - különben a győzelem a jövő idényre szóló nevezést adja (`pyrCupWinNote`, a régi szabály).
- **A HUB kupa-gombja** a sort is mutatja: „FA + KK: indulunk”.
- **Változatlan maradt:** a lemondás (a nyár összes kupájára szól), a közös karrier közös programja és a sík mód.

## 2. A meccslabda (🛡️ A klub arculata → 8 · A meccslabda)
- **Versenyenként külön labda:** a bajnokságra és minden kupára, amelyben most indulhatsz (`labdaVersenyek`):

  | Osztály | Fülek |
  |---|---|
  | megyei | Bajnokság · NYK |
  | NB II | Bajnokság · MK |
  | NB I | Bajnokság · MK · KK · OJK · KONF |
  | D2 | Bajnokság · FA · KK |
  | D1 | Bajnokság · FA · KK · OJK · KONF |
  | D0-tól | Bajnokság · HSZ |

  Az idén sorban álló és a futó sorozat is mindig a listán van.
- **Beállítható:** alapszín, minta színe, és hat minta (Klasszikus, Sávos, Csillag, Felezett, Pöttyös, Egyszínű). Előnézettel, „vissza az alapra” gombbal. Minden sorozatnak van saját alaplabdája a színeiben.
- **Tárolás:** `S.ident.labdak` (az arculat része, mentve). **Azonnal érvényes.**
- **A jelenetekben** a futó meccs versenyének labdája gurul (`labdaMostKulcs`: kupameccsen a sorozat, különben a bajnokság). A régi, rajzolt jelenetben `evaLabda`, az új 3D jelenetben `labdaVaszonra`.

## 3. Az animációk (🛡️ A klub arculata → 9 · Az animációk)
Ugyanaz a két kapcsoló, mint a Beállításokban, itt is elérhető:
- a jelenetek be/ki;
- melyik fusson: Új (3D) · Új + régi ismétlés (R) · Régi.

## Próbák
- **Új:** `tools/kupa-labda-1-0-12-0-00-proba.js`. Ezeket méri:
  - a nevezés 8 esetben;
  - két kupa egymás után, a záró gombbal;
  - a KONF → KK-selejtező feljavítás;
  - a mentés;
  - a labda versenyei osztályonként, és a kupa labdája a 2D és a 3D jeleneten;
  - az arculat két új szakasza.
- **Régi próbák:** a kupa-, a szezonzárás- és a jelenet-próbák (lásd a commitot).
