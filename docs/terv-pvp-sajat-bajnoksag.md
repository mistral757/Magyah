# Terv: 🌍 PvP „saját bajnokság" mód — Könnyed (ajánlott) / Hardcore

*Állapot: TERVEZET, döntésre vár. Kód még nem készült.*

## 1. A kiindulás

A két menedzser beszélgetéséből:

> „Vagy mindenki játszana a maga single player karrierjében gyakorlatilag.
> Csak néha játszunk egymás ellen is. Neked 98-as a mezőnyöd, nekem 92-es.
> […] És a 15. és 30. fordulóban egy meccs egymás ellen. Meg a kupa."
>
> „Mert a saját bajnokságon belül mindketten kb. ugyanannyira könnyen
> tudnánk haladni."
>
> „Meg az egész játék így nem felépítve, hogy ezt a szigorú rendszert követi a
> meccserő mentén. Ott ±1 rating aranyat ér. Nemhogy 4-5."

A kérés: a PvP-szoba létrehozásakor (a sebesség és a szigorúság mellett) el
lehessen dönteni:

* **Hardcore:** a mostani, eddigi rend;
* **Könnyed (ajánlott):** az új, saját bajnokságos mód.

## 2. Miért fáj a mostani rend (a diagnózis)

A mostani közös karrier **egyetlen közös világ**:

* **Egy tabella, egy osztály.** A két klub ugyanabban a bajnokságban játszik.
  A páros a jobbik eredménnyel lép fel vagy ki, tehát mindig együtt marad
  (`pyrPairMatchOvr`, a szezonzáró páros-léptetés).
* **Egy mezőny.** A kezdőrúgáskor a mezőny a **két** súlyozott meccs-erő
  átlagához áll be (`pyrFloorKickoff`, közös ág), a két vállalt célrés
  átlagával.
* **Két játékos, egy nehézség.** Ha a két keret 4-5 egységgel elválik, a
  közös mezőny az egyiknek túl könnyű, a másiknak túl nehéz. A nehézségi
  rendszer viszont a meccs-erőre van kihegyezve: egy fokozat célrése ±0,5, a
  holtsáv kicsi. Ebben ±1 is sokat számít.
* **A tűzoltások.** Ezért jött a felzárkóztatás (`mpApplyBalance`,
  `mpCatchPlan`, 3.9.221) és az osztott nehézség (3.9.316). Mindkettő a közös
  mezőny tüneteit kezeli, a gyökerét nem.
* **Sok várakozás.** A közös világ miatt minden szezonindításnál kézfogás kell
  (a világ tengelyei, a célrés, a mezőny), hardcore-ban szakaszonként is.

**A javaslat lényege:** a Könnyed módban **két külön világ** fut. Mindkettő
egyjátékos-szabályokkal, a saját meccs-erőhöz igazított mezőnnyel. A két
menedzser csak a **párharcokban** és a **kupában** találkozik.

## 3. A beállítás a szoba létrehozásakor

### 3.1 A kapcsoló

Új blokk a „⏱ Sebesség" után, a „🛡 PvP szigorúság" előtt:

```
🌍 Bajnokság
  ● Könnyed — saját bajnokság (ajánlott)
    Mindketten a saját bajnokságotokban játszotok, a saját erőtökhöz mért
    mezőnyben, egyjátékos-szabályokkal. A 15. és a 30. forduló után
    párharc egymás ellen, nyáron közös kupa. Kevés várakozás.
  ○ Hardcore — közös bajnokság
    A mostani rend: egy tabella, egy közös mezőny, amely a kettőtök
    meccs-erejéhez áll be. Itt minden egység számít. Minden idényindításnál
    bevárjátok egymást.
```

* **Alapértelmezés:** Könnyed.
* **Régi szobák és mentések:** a mező hiánya „közös"-t jelent, tehát a futó
  karrierek betűre a mai szabályokkal mennek tovább.

### 3.2 A névütközés a szigorúság-kapcsolóval

A meglévő „🛡 PvP szigorúság" kapcsoló **ugyanezt a két szót** használja
(könnyed / hardcore (fejlesztés alatt) = szakaszos közös seed). A két
kapcsoló együtt félreérthető: „Hardcore bajnokság, könnyed szigorúság".

**Javaslat (D1):**

* Az új kapcsoló neve **„🌍 Bajnokság"**, a két lehetőség „Könnyed — saját
  bajnokság" és „Hardcore — közös bajnokság".
* A meglévő szigorúság-kapcsoló **csak a közös bajnoksághoz** jelenik meg.
  Saját bajnokságnál nincs értelme, mert a két világ úgyis más, a szakaszos
  seed a piacot és a scoutot nem tudná egyformán tartani. Új neve:
  **„Szakaszos közös seed: ki / be (fejlesztés alatt)"**.
* Így a felületen egyetlen „Hardcore" szó marad, és az a mai rendet jelenti,
  ahogy kérted.

### 3.3 Hol utazik

Ugyanott, ahol a szigorúság (3.9.287 minta):

| hol | mi |
|---|---|
| h2h `cfg` rekesz | `vilag: {v:"sajat"\|"kozos"}`, a létrehozáskor |
| beállítás-csomag | `start.settings.vilag`, a vendég innen veszi át |
| mentés | `S.mpVilag` |
| lobby, vendég-átnéző | „🌍 Bajnokság: …", zárolva a vendégnek (`MP_GUEST_LOCK_SEL`) |
| diagnosztika | a „VILÁG TENGELYEI" blokkban |

Új predikátum: `mpSajatVilag()`. Igaz, ha `h2hRoomActive()` igaz és
`S.mpVilag==="sajat"`.

## 4. Mi közös és mi külön a Könnyed módban

| | Könnyed (saját bajnokság) | Hardcore (közös, mai) |
|---|---|---|
| világ, tabella, osztály | **külön**: mindenkinek a saját piramisa | közös |
| a mezőny ereje | **egyjátékos-szabály**: a saját súlyozott meccs-erőd és a saját célrésed | a két meccs-erő átlaga |
| fel- és kiesés | **külön** (lehettek más osztályban) | páros, együtt |
| nehézségi fokozat | a házigazdáé, mindkettőtöknek ugyanaz (D2) | közös |
| idénynyitó célrés-ablak | a saját (egyjátékos-változat) | közös, élő előnézettel |
| felzárkóztatás, osztott nehézség | **nincs** (nincs közös mezőny, amit kiegyenlíteni kellene) | van |
| a világ tengelyei (tempó, sorsolás, VB, ikon) | **közös** (a házigazdáé, rögzítve) | közös |
| draft | **közös** (ugyanaz a pool, ugyanaz a mag, a rejtett ≤0,75-ös kezdő kiegyenlítés marad) | közös |
| piac, scout, ifi, kihívás, talizmán | külön (egyjátékos) | közös seed / szakaszos seed |
| párharc | a 15. és a 30. forduló után, **külön meccsnap** (5. pont) | a 15. és a 30. **bajnoki** forduló |
| kupa | **közös program, relatív mezőnnyel** (6. pont) | közös |
| kézfogás | csak párharcnál és kupánál | minden idényindításnál (+ szakaszhatárok) |

### Miért ugyanaz a fokozat mindkettőtöknek (D2)

A beszélgetés célja: „mindketten kb. ugyanannyira könnyen tudnánk haladni".
Ugyanaz a fokozat ugyanazt a célrést és ugyanazt a Run-ütemet jelenti, tehát a
két karrier haladása **összemérhető**. A 98-as és a 92-es mezőny így is
eltérhet, mert az a saját keretetekből jön, és pont ez a cél.

*Alternatíva:* mindenki a sajátját választja (a gyengébb játékos könnyebbet).
Ez lehetővé teszi az „előnyadást", de a Run-szintek akkor már nem mérhetők
össze egy az egyben.

### Ugyanaz a játékos mindkét kereten (D3)

Két külön világban **mindkettőtök megveheti ugyanazt a sztárt**. Ez akár a
párharcban is előfordulhat: Messi mindkét oldalon.

**Javaslat:**

* engedjük;
* a párharc-lapon jelöljük: „🪞 tükörjátékos — mindkét keretben ott van";
* a **draft** közös és kizárólagos marad, mint ma.

*Alternatíva:* kizárólagosság a piacon is. Ehhez minden igazolásnál
szinkronizálni kellene, és pont a várakozás tűnne vissza, amit kiveszünk.

## 5. A párharc-nap

### 5.1 Hol van a menetrendben

A saját bajnokság egyjátékos-menetrendű: 16 csapat, 30 forduló, csupa gépi
ellenfél. A párharc **nem bajnoki meccs**, mert a társad klubja nincs a
tabelládban. Ezért **külön meccsnap** lesz:

```
… 14. · 15. forduló · ⚔ PÁRHARC-NAP I · 16. · … · 30. forduló · ⚔ PÁRHARC-NAP II · (szezonzárás, kupa)
```

* **Időzítés:** a „15. és 30. fordulóban egy meccs" a 15. és a 30. forduló
  **után** kerül sorra. A bajnokság így teljes marad, mindkét világban
  30 forduló.
* **Meccsmotor:** a mai, közös eseménylistás párharc (`h2hSimulate`, a
  pillanatkép), változatlanul. Ez már ma is két gépen, bitre egyezően fut.
* **Erő:** a **valódi meccs-erők** csapnak össze, nincs kiegyenlítés. Ez a
  verseny lényege: ki épített jobbat (D4).
* **Fáradtság, sérülés, lap:** kupameccsként számít (a lapgyűjtés a kupáé,
  nem a bajnokié). Az eltiltás a bajnokira nem csúszik át.
* **Csereszünet:** a mai párharc-szabály marad (a 3.9.x „nincs csereszünet").

### 5.2 Mi a tét, ha nem bajnoki pont

* **Párharc-mérleg:** győzelem 3, döntetlen 1, vereség 0. A karrier egészére
  gyűlik, a HUB-on és a párharc-lapon látszik (pl. „⚔ 5–2–3, 17 pont").
* **Párharc-díj:** a győztes a **saját** heti lelátó-bevételének kb.
  1,5-szeresét kapja, a döntetlen a felét. A saját bevételhez mérjük, így a
  98-as és a 92-es világ pénze nem keveredik.
* **Morál:** ugyanaz a lökés, mint egy rangadón.
* **Run-szint:** nem hat rá. A Run a saját bajnokságod mércéje, maradjon
  tiszta.

### 5.3 Várakozás

* **Az egyetlen kötelező megálló** a párharc-nap. Aki előbb ér a 15.
  forduló végére, az ott vár. Addig az átigazolási ablak, a HUB és minden más
  szabad.
* A mai eszközök mind működnek:
  * a bökés és a „📍 Hol tartok";
  * a sebesség („Villám": 3 perc után a társ legutóbbi keretével lejátssza).
* **Különböző idényben** nem lehet párharc. Ha az egyik már a következő
  idényben járna, a 15. fordulónál megáll. Ez természetes határ, mert a
  kupa úgyis bevár.

## 6. A közös kupa két külön világból

**Ami ma is működik és marad:** a közös nyári program (`mpResolveProgram`).

* A jobbik kvalifikáció viszi a másikat is.
* A hazai szuperkupa (HSZ) jár annak, aki jogosult rá, és viszi a társát.
* A két fél csak a döntőben találkozhat (3.9.211).
* A kvalifikáció `cupEntryFor(helyezés, osztály)`, tehát akkor is működik,
  ha más osztályban végeztetek. Ez a saját bajnokságnál új helyzet, de a
  képlet már kezeli.

**A gond:** a kupa mezőnye a saját világhoz van horgonyozva (`euroMidRating`:
az élvonal szintje). Két külön világban ez **két különböző szám**. Ha a gépi
csapatok ereje a két gépen más, a gépi meccsek eredménye is más, és a
csoportok szétcsúsznak (a mai `mpCupAiGroupsFingerprint`-hiba).

**A megoldás: relatív kupamezőny.**

* A kupa minden gépi csapata **eltolásként** jön létre a közös kupa-seedből
  (`mpCupRng`). Az eltolás a horgonyhoz képest értendő.
* Minden gép a **saját** horgonyára teszi rá. A te világodban a csapat
  „horgony + eltolás", a társadéban ugyanez a társad horgonyával.
* **A gépi meccsek:** a gép–gép meccs eredménye csak a két erő
  **különbségétől** függ (`euroLam(d)`). A különbség a két gépen azonos, tehát
  ugyanazzal a seeddel bitre ugyanaz az eredmény. A csoportok nem csúsznak
  szét.
* **A te meccseid** a gépi csapatok ellen a saját horgonyodhoz mért
  mezőnyben mennek, ugyanúgy, mint egyjátékosban.
* **A társad eredményei** szinkronnal jönnek, mint ma
  (`euroResolveRoundAfterSync`, `mpCupAdoptMateRows`).
* **A döntő egymás ellen** a párharc-motorral, a valódi meccs-erőkkel megy.

A relatív horgony **csak saját bajnokságnál** él. A közös bajnokság kupája
betűre a mai marad.

## 7. Ki nyer? A mérleg két külön világban

Közös tabella nélkül három, egymás mellé tehető mérce marad. Mindegyik már
létezik:

1. **⚔ Párharc-mérleg:** a két párharc-nap és a kupadöntő pontjai.
2. **📈 Run-szint:** a saját bajnokság haladásának nehézség-arányos mércéje.
   Ugyanaz a fokozat mellett összemérhető.
3. **🏆 Trófeák és osztály:** bajnoki cím, feljutás, kupák.

**A párharc-lap** (a HUB-on, a mai csapatlap helyén) egymás mellé teszi:

* a két meccs-erőt;
* a két mezőnyt (pl. „98-as mezőny, D2" és „92-es mezőny, D3");
* a Run-szinteket;
* a tabella-helyezéseket;
* a párharc-mérleget.

**A szezonzáró kapu** („folytatjátok?") marad, a felzárkóztatás nélkül. A
végső ítélet a párharc-mérleg, egyenlőségnél a Run-szint (D5).

## 8. A megvalósítás menete

Minden fázis önmagában próbálható, és egy közös bajnokságos (Hardcore)
karriert egyik sem érinthet.

| fázis | tartalom |
|---|---|
| **F1 — kapcsoló és csatorna** | a „🌍 Bajnokság" blokk; `cfg`, `start.settings`, `S.mpVilag`; `mpSajatVilag()`; lobby, vendég-zár, diagnosztika; a szigorúság-blokk csak közösnél |
| **F2 — két külön világ** | a karrier indulásakor mindkét gépen egyjátékos-világ épül: közös seed, közös draft, a társ klubja nélkül. A kezdőrúgás a `pyrFloorKickoff` egyjátékos-ágát futtatja. Kimarad: a szezonindítási alku mezőny-része, a páros-léptetés, a felzárkóztatás, az osztott nehézség. A világ tengelyei egyszer, az induláskor rögzülnek. |
| **F3 — párharc-nap** | menetrend: a két extra meccsnap a 15. és a 30. után. Az indító kapu, a mai párharc-motor bekötése, a mérleg, a díj, a morál, a fáradtság és a lapok kupa-szabálya. Bökés, „Hol tartok" és Villám a meccsnapon. |
| **F4 — kupa relatív mezőnnyel** | eltolás-alapú kupamezőny, saját horgony, a gépi meccsek a különbségből; a program, a szinkron, a döntő. Ujjlenyomat-próba: a két gép csoportjai egyeznek. |
| **F5 — párharc-lap és ítélet** | HUB-lap, szezonzáró kapu, összesítés, napló, Kalauz-fejezet, súgó |
| **F6 — próbák és doksi** | két kliens a helyi szoba-háttéren (ahogy az osztott nehézség próbája). Egy teljes idény mindkét oldalon: a két világ szétválik, a párharc és a kupa egyezik. A Hardcore regressziója változatlan. |

**A kockázat** a kód sok olyan helye, amely ma azt feltételezi, hogy
„közös karrier = közös világ": `h2hRoomActive()` kb. 100 helyen, `MP.active`
kb. 250 helyen. Az F2 első lépése ezeknek a végigjárása és
háromfelé sorolása:

* marad (szoba, jelenlét, párharc, kupa);
* saját világnál kikapcsol (mezőny-alku, páros-léptetés, felzárkóztatás,
  osztott nehézség, szakaszos seed);
* saját világnál módosul (menetrend, kupa-horgony).

## 9. Döntési pontok (a javaslatom félkövérrel)

| # | kérdés | javaslat | alternatíva |
|---|---|---|---|
| D1 | A két kapcsoló neve | **„🌍 Bajnokság: Könnyed / Hardcore"; a mai szigorúság „Szakaszos közös seed" néven, csak közösnél** | két független kapcsoló a mai nevekkel |
| D2 | Nehézségi fokozat | **a házigazdáé, közös** | mindenki a sajátját |
| D3 | Ugyanaz a játékos mindkét keretben | **engedjük (🪞 jelöléssel), a draft kizárólagos** | kizárólagos piac is |
| D4 | Erő a párharcban | **valódi meccs-erők** | enyhe hendikep a gyengébbnek |
| D5 | A végső ítélet | **párharc-mérleg, egyenlőségnél Run-szint** | Run-szint elsődlegesen |
| D6 | A párharc helye | **külön meccsnap a 15. és a 30. forduló után** | (nincs jó alternatíva: a társ klubja nincs a tabelládban) |
| D7 | A párharc-díj | **a saját heti lelátó-bevétel ×1,5 (győzelem), ×0,75 (döntetlen)** | csak presztízs, pénz nélkül |
| D8 | Futó közös karrier átállítása | **nem lehet** (a világ már közös, nem bontható ketté) | — |
