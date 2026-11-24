# 1.0.11.15.00 — Kezdő út, 1. fázis: a belépés; a dinamikus mód kivéve; költés-figyelmeztetés

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (5. fejezet; a döntések a 15.-ben).

## Kérés
> A kérdéseidre mindre az a válaszom, hogy hol sejted, milyen irányba akarom én ezt tolni.
> Egyelőre a dinamikus módot vegyük ki a választható játékmódok közül. Nagyon rég nem fejlesztettük.
> Amikor játékot indítasz nem is kell utána semmi felület, egybol a hagyományos módon belüli első
> kijelző jöhet. Ezen kívül fontos, hogy az eddigi funkciókból semmit ne vegyünk el, de azokat képesek
> legyünk meghaladni, megtölteni, érthetőbbé tenni. Már az első idényben is végig legyen átigazolási
> lehetőség a 8. fordulótól kezdve. Költés figyelmeztetés minden módban legyen. Amint túl kevés
> tartalékod marad, vagy éppen túl magasra nősz a mezőny fölé (várható győzelmi esély a következő
> ellenfél ellen meghaladja a 85%-ot). […] kezdjük el építeni.

## 1. A dinamikus mód kivéve, egyenes út a hagyományos karrierbe
- **Rejtve:** a kezdőlap „Dinamikus karrier” útja (`#heWayDyn`), a módválasztó gombja (`#modeCareerDynBtn`), a gyors indító mód-sora (`#qkModeGrid`), a beállító `#pyrModeGrid` dinamikus gombja és a közös karrier „fajta” alapbeállítása.
  - A kód a helyén marad, mint a klasszikus módnál: a régi dinamikus mentések betölthetők.
- **„Karrier indítása”** (és minden új karrier) mindig a hagyományos karrier indítójára visz: `heNewCareer` → „pyr”, `enterCareerSetup` → `pyrWanted=true` (a közös karrier vendégét kivéve).
- **Javított hiba:** a mód beváltása (`heModeConsume`) eddig két esetben elveszett, és a módválasztó maradt kint:
  - a kezdőlap-réteg aszinkron tűnik el, a beváltás pedig még előtte futott le, és közben eldobta a kulcsot;
  - ugyanarra a karrierhelyre lépve nincs újratöltés, így a beváltás meg sem hívódott.
  
  Most a beváltás megvárja a réteget (legfeljebb ~4 s), és a helyben maradó ágon is lefut.

## 2. A belépés (Kezdő út, 1. fázis)
- **„Mennyire ismered a játékot?”** a gyors indító tetején:

  | Válasz | Ajánlott fokozat | Vezetés | Indító |
  |---|---|---|---|
  | 🌱 Most kezdem | 2. Kezdő | teljes | 2 lépés (Nehézség → Kezdés), az Egyéb lap kimarad |
  | ⚽ Játszottam már | 4. Haladó | rövid | 3 lépés |
  | 🏆 Ismerem, mindent kérek | nem írja felül | halk jelzések | 3 lépés |

  - A válasz a játékosé (`magyah_tudas_v1`), karrierek közt megmarad.
  - Az alapérték a „Most kezdem”, kivéve annak, akinek már van lezárt karrierje: neki a „Játszottam már”.
  - Az első alkalommal a vezetés módja és (ha még nincs elmentett választás) az ajánlott fokozat is életbe lép.
- **Mind a 10 nehézségi fokozat nyitva** (`nfNyitottMax` → 10, `NF_LEPCSO_MAX` = 10). Eddig a lépcsőn az 1–4., azon túl az 1–6. fokozat volt választható.
  - Minden fokozatnál egy **„👤 kinek ajánlott”** sor áll (`NF_KINEK`), az ajánlottnál pedig „ajánlott neked” (a tudásszint szerint).
  - A régi szabály a naplóban tovább könyvel, csak nem zár. A 10.6+ extra szintek a saját szabályuk szerint nyílnak.
- **Biztonsági háló:** „Most kezdem” és a 7. vagy nehezebb fokozat esetén az Indulás egy mondatos megerősítést kér. Tiltás nincs.
- **Osztály-tanács** (`kutDivTanacs`) minden nyitott osztálynál. A D3-nál: „Első karrierhez ajánlott: innen két feljutás a csúcs…”.
  - A kezdő lépcsőn (ahol a D3 kötött) a tanács a kimondás mellett áll. Az osztály-kapuk megmaradnak.
- **Az edző tippje a drafton** („Most kezdem” módban):
  - a választható jelöltek közül az kapja, aki a saját posztjára kerülhet, és most a legtöbbet adja (Rating);
  - indoklással: „a POT-ját a felmérés mutatja meg”;
  - csak jelölés.
- **A draft első két tippje** (`draft:first`, `draft:pot`) horgonyt kapott: a jelöltlistát, illetve a POT-útmutatót emeli ki.

## 3. Átigazolás az első idényben a 8. fordulótól
Nem kellett hozzá kód: a 8., 15. és 23. forduló utáni átigazolási időszak (`CHECKPOINTS`) az első idényben is lefut. A Kezdő út menetrendje ehhez igazodik: a piac a 8. fordulónál nyílik, és onnan nyitva marad (roadmap, 15. fejezet, 7. pont).

## 4. Költés-figyelmeztetés — minden módban
- **Két feltétel:**
  1. **Kevés tartalék:** a költés után maradó összeg a küszöb alá esik. A küszöb a nagyobbik:
     - az idényes működési keret 25%-a (`seasonBudgetCore`);
     - öt meccs bére (a kezdő tizenegy `wageBill`-je).
  2. **Túl erős:** a következő bajnoki ellenfél ellen a győzelmi esély már most 85% fölött van.
     - A szám ugyanaz, amit az edző meccs előtti elemzése mutat (`edzoElemzesSzamol().gy`).
     - Csak erősítő költésnél szól: vétel, boost, poszt-tanulás.
     - Az üzenet: a további erő a meccsen alig fordít, a mezőny viszont utánad lép.
- **Hol jelenik meg:**
  - **a megerősítő ablakokban** (`askConfirm` új `koltes` mezője):
    - vétel (az aláírás előtti képernyő);
    - minden boost (egyes, kosár, ifi, fénykor, vén róka, egyenlítő);
    - poszt-tanulás;
    - stáb-szerződtetés;
  - **a közvetlen gombok előtt** (stadionbővítés, merch): `koltesKerdez` — csak akkor kérdez, ha van mit mondani;
  - **a HUB büdzsé-sávján** állandó jelzésként (`koltesHubHtml`).
- **Nem tilt:** a döntés a játékosé.

## Próba
`tools/kezdo-ut-belepes-1-0-11-15-00-proba.js` — 7 állítás:
1. egyenes út a hagyományos karrierbe, a dinamikus mód sehol nem választható;
2. a tudásszint hatásai (fokozat, vezetés, lépésszám), mind a 10 fokozat nyitva „kinek ajánlott” sorral;
3. a 7+ megerősítés;
4. az edző tippje csak kezdőnek;
5. az osztály-tanács (a lépcsőn és szabad választásnál);
6. a költés-figyelmeztetés mindkét feltétele, a HUB-jelzés, a megerősítő ablak, a stadion-kérdés, és hogy bőségnél és gyengébb csapatnál hallgat;
7. nincs oldalhiba.
