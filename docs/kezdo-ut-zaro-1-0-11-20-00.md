# 1.0.11.20.00 — Kezdő út, 6. fázis: a vége — záró ablak, jelvény, a következő karrier

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (6.4: a 9. szakasz „Kész vagy”; 12. fejezet: a 6. fázis; az állapot a 16. fejezetben).
Előzmény: [stilus-osszeveto-1-0-11-19-00.md](stilus-osszeveto-1-0-11-19-00.md) (5. fázis, stílus).

## Kérés
> Mehet a féz 6

A roadmap 6. fázisa: *záró ablak; jelvény; `kutKesz` a naplóban; a következő karrier alapértelmezése — a második karrier „Játszottam már”-ral indul.*

## 1. A záró ablak — „🎓 Végigjártad a Kezdő utat!”
Akkor jön, amikor az utolsó szakasz („Hosszú táv”) is lezárul — teljesítve vagy a tartalékkal.
- **Sorrend:**
  1. előbb az utolsó nyitás ablaka („🔓 Kinyíltak a menüben!”, akadémia és kupa);
  2. utána, ha nincs más ablak kint és nem fut lecke, a záró ablak;
  3. 1,5 másodpercenként újrapróbál, legfeljebb egy percig, és a HUB minden rajzolásakor újra.
- **Egyszer** jön (`S.kut.zaro`).
- **Tartalma:**
  - **mit tanultál** — szakaszonként egy sor (a szakaszok új `tan` mezője), és a piac:

    | Szakasz | Sor |
    |---|---|
    | Az első tizenegy | felállás, taktika, megbízások — a csapat alapja |
    | Az első meccsek | az edzésterv és az összhangépítés minden meccsen dolgozik |
    | Az átigazolás | vétel, eladás két úton, a bér; a 8. fordulótól |
    | Fejlődés | a meccserő, az edző elemzése és a hangsúly-csúszkák: kis különbség is sokat ér |
    | A csapat lelke | csapatszerepek, kapitány, cserék és presetek |
    | Szerencse és kockázat | talizmán, láda — és a kihívás mint vállalás: jutalom ÉS büntetés |
    | A mérleg | annyi erő, amennyi a célhoz kell; a mezőny utánad lép; mindig maradjon tartalék |
    | A klub filozófiája | a klub filozófiája, a stíluspont és a képességfa |
    | Hosszú táv | ifiakadémia és nemzetközi kupa |

  - hol nézhető vissza: ☰ Menü → 🧭 Vezetés (a leckék), és a Kalauz;
  - a „📖 A leckék listája” gomb, amely a leckék listáját nyitja.

    A gomb a tartalomban ül: a közös megerősítő ablak gombjait nem kötjük át.

## 2. A jelvény
A profil fejlécében, a profilszint alatt: **„🧭 Kezdő út — végigjárva · <dátum>”**. A súgója mondja, hányszor jártad végig.

## 3. `kutKesz` — a játékoshoz kötött feloldás-naplóban
- A befejezéskor az `unlockState()` (localStorage `30-0-unlock-v1`) kap egy `kutKesz:{at,n}` mezőt.
- Ez a napló karrierektől független: egy új karrier vagy egy mentés törlése sem nullázza.

## 4. A következő karrier
- **Átállás a befejezéskor:** a tudásszint „🌱 Most kezdem”-ről (vagy ha még sosem volt kifejezetten beállítva) **„⚽ Játszottam már”**-ra lép.
- **A tudásszint alapértéke** (`kutTudas`) választás nélkül is „Játszottam már”, ha van `kutKesz` (eddig csak a lezárt karrier tette ezt).
- **A következő karrier** így 4. fokozatot, rövid vezetést és 3 lépéses indítót ajánl. A Kezdő út is vele jön, de az alapok már ismertek.
- **A kifejezett „🏆 Ismerem a játékot” nem íródik felül.**
- **„Mindent kinyitok” után** nincs záró ablak és nincs jelvény: az nem végigjárás.

## Javítás: a tudásszint első alkalmazása csak egyjátékosban
Egy régi próba (`tools/pvp-beallitas-letra-proba.js`) mutatta meg, de nem ez okozta. Az 1.0.11.15.00 óta a gyors indító első megnyitásakor a tudásszint alapjai életbe lépnek: a kulcs beíródik, a vezetés módja és az ajánlott fokozat beáll. Ez **közös karrierben** is megtörtént. Két baj lett belőle:
- ha valaki közös karrierrel kezdett, a kulcs beíródott, és az első **egyjátékos** indításnál a „Most kezdem” alapjai már nem léptek életbe;
- a Kezdő út szándékosan csak egyjátékosban dolgozik (a rövid indító is), ez az egy pont kilógott.

Most a `quickShow` ezt a lépést közös karrierben kihagyja.

**A próbában egy szándékos változás is látszott:**
- A dinamikus mód kivétele óta a karrier mindig hagyományos, ezért a közös karrier házigazdája is megkapja az ajánlott fokozatot a szoba alapbeállításaiból (`nfKaBetolt`), ahogy az egyjátékos mindig is megkapta.
- 3.9.224 óta a fokozat vezeti a rés-csúszkát.
- A próba a fokozat nélküli, szabad lépcső-csúszkát méri, ezért most kifejezetten fokozat nélkül áll be (`pyrPickFok=null`, a vendégnél `_mpNfFok=null`).

## Próbák
- **`tools/kezdo-ut-zaro-1-0-11-20-00-proba.js` (új)**, amely ellenőrzi:
  1. a „mit tanultál” sorokat;
  2. a tiszta játékos alapját („Most kezdem”);
  3. a befejezést: `kutKesz`, „Játszottam már”, és hogy a következő karrier ezzel indul;
  4. a sorrendet: előbb az utolsó nyitás, utána a záró ablak, és hogy megvárja a kint lévő tippet;
  5. a leckék gombját, és hogy a záró ablak csak egyszer jön;
  6. a profil jelvényét;
  7. hogy a kifejezett „Ismerem” megmarad (a napló a második végigjárást is számolja);
  8. hogy „Mindent kinyitok” után nincs semmi;
  9. hogy nincs oldalhiba.
- **A Kezdő út, a profil és a feloldás-napló régi próbái:** lásd a commitot.
