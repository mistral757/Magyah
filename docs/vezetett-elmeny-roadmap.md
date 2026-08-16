# Vezetett élmény — roadmap a háromszintű tanítóréteghez

*(Tervdokumentum a 3.4–3.5 sorozathoz. Érintett meglévő kód: `GUIDE_TIPS` +
`guideFire`/`guideShowNext` (index.html ~15362–15615), `STAFF_INTRO_STEPS` +
`renderStaffPanel` bevezető-ága (~33972–34229), `renderHubMenuMarks`
(~38425–38448), `GLOSSARY` (~15150–15360), `S.guideOn`/`S.guideSeen`
(~20300–20302, mentés: ~46177, betöltés: ~46612).)*

---

## 0. Egy mondatban

Ma két, egymástól független tanító-mechanizmus van a játékban (a kikapcsolható
guide-buborék és a kötelező stábtag-bevezető), plusz néhány kézzel írt jelvény.
A cél **egy közös témaregisztrátum**, amelyből **három megjelenítési szint**
táplálkozik — vezetett mód, első-alkalom bevezető, halk emlékeztető —, mind a
huszonöt kulcstémára, végig kapcsolhatóan a *hard guide*-tól a *0 guide*-ig.

---

## 1. Ami MA van

### 1.1 A guide-motor (1. szint magja)

Adattábla + kis motor. A hívási helyek egysorosak: `guideFire("draft:first")`.

| tulajdonság | mai állapot |
|---|---|
| bekapcsolás | **csak karrierkezdéskor**, a `#guideGrid` két gombján |
| kikapcsolás | „Ne mutass több tippet" → `S.guideOn=false`, **visszakapcsolni sehol nem lehet** |
| gyakoriság | témánként egyszer karrierenként (`S.guideSeen[id]`) |
| megjelenés | alsó buborék, opcionálisan **horgonyzott**: `guideHi` gyűrű + `#guideDim` négy téglalapos sötétítés |
| tartalom | cím + egy bekezdés + „Részletek" gomb a `GLOSSARY`-ba |
| sorbanállás | `_guideQ`, egyszerre egy buborék, „még N tipp" számláló |
| önvédelem | láthatatlan horgony esetén a tipp **visszakerül** nem-látott állapotba |

**Ez a réteg jó.** A roadmap nem cseréli le — kiterjeszti és beköti a másik két
szint mellé.

### 1.2 A stábtag-bevezető (a 2. szint prototípusa)

`STAFF_INTRO_STEPS` — három lépés, a stáb-panelen **belül** ülő arany doboz,
lépésenként más horgonyt emel ki (`head` → `focus` → `effect`), lépésszámláló
(`1/3`), „Tovább" + „Kihagyom", és a kiemelt részre görget.

A kód kommentje kimondja a szándékot:

> *„SZÁNDÉKOSAN NEM a guide-motoron megy: az kikapcsolható, és a felhasználó
> ilyenkor pont a lényegről maradna le."*

Ez a minta a 2. szint alapja. Amit hozzá kell tenni: **általánosítás** (ma be
van drótozva a stáb-panelbe), és **több lépés + gazdagabb horgonytípusok**.

### 1.3 Proto-jelzések (a 3. szint magja)

Már ma is van „van tennivalód" vizuális nyelv, csak szétszórva és kézzel írva:

| jelzés | hol | mit mond |
|---|---|---|
| `#hubMenuBadge` (`renderHubMenuMarks`) | HUB menü-gomb | 🎁 token · 🎯 stílusdöntés · 🏋️ nincs edzésterv |
| `#hubStyleBadge` | Csapatstílus fejléc | van elkölthető stíluspont |
| `.msBadge` „N új" | mérföldkő-panel, info-FAB | meg nem nézett mérföldkő |
| `#hubInfoFab` arany lélegzés | HUB jobb alsó | ugyanaz, kiemelve |
| `coachFocusBadge` 🎯 | keretlistán | melyik edző figyel erre az emberre |

**Három téma már ma is „nudge-ol", huszonkettő nem.** És egyik sem tudja, hogy a
guide-motor létezik — nincs közös prioritás, nincs cooldown, nincs kikapcsolás.

### 1.4 A fogalomtár

42 bejegyzés (`draft`, `posztfit`, `megbizas`, `kemia`, `taktika`, `edzesterv`,
`tsi`, `scout`, `ugynokseg`, `akademia`, `budzse`, `szezonkartya`, `runszint`,
`cserek`, `skillek`, `kihivasok`, …). **A tananyag java megvan** — a hiány az
időzítés és a kiemelés, nem a szöveg. A tartalomcsomagoknál ezt kell
kihasználni: rövid „miért most" a buborékban, mély magyarázat a fogalomtárból.

### 1.5 Hiánylista a huszonöt témára

A kért témák közül **11-nek van ma valamilyen tippje, 14-nek semmi**, és
mindössze 3 rendelkezik halk jelzéssel:

* **Van L1 tipp:** megbízás/árnyékék, kihívások, skillek, kémia (csak a draft
  utáni elemzés), TSI, Run szint, szezonkártya, poszt-tanulás, mérföldkövek
  (közvetve, az Infópult-tippen át), csapatstílus (csak a menü-tippben egy
  félmondat), scout (csak a TSI-tipp mellékmondatában).
* **Nincs semmi:** felállás módosítása, taktika **átállítása** (csak a
  kezdőválasztásra van tipp), igazolás utáni becserélés, ifi felvétele vagy
  akadémián tartása, edzésterv, csere meccs közben, stílus-kategóriák
  megnyitása, eladás azonnal, eladás piacra bocsátással, keretlétszám
  fejlesztése, ügynökség fejlesztése, pro/kontra a skill-csoportosításban,
  öltöző, menetrend, „a játékos rossz pozícióban van MOST".

---

## 2. A célkép

### 2.1 Egy regisztrátum, három megjelenítés

```js
const TEACH_TOPICS={
  formation:{
    n:"Felállás módosítása",         /* emberi név — a beállítólistának is */
    grp:"csapatepites",              /* kategória-kapcsolóhoz */
    g:"taktika",                     /* GLOSSARY-kulcs a "Részletek"-hez */
    scr:"hub",                       /* melyik képernyőn él (hub|match|market|draft) */
    prio:40,                         /* rangsor, ha több téma esedékes */

    ready(){ … },   /* elérhető-e MÁR a funkció (különben nem tanítunk róla) */
    due(){ … },     /* van-e MOST tennivaló — a 3. szint predikátuma */
    done(){ … },    /* hozzányúlt-e valaha (a nudge elnémításához) */

    tip:{t:"…",x:"…",a:"hubFormationBtn"},                  /* 1. SZINT: buborék */
    steps:[{a:"hubFormationBtn",t:"…",x:"…"},
           {a:"scFormation",t:"…",x:"…"}],                  /* 2. SZINT: vezetett lépéssor */
    nudge:{a:"hubFormationBtn",lbl:"📋",why:"A felállásod nem illik a keretedhez"}   /* 3. SZINT */
  }, …
};
```

Egyetlen rekord tehát mindhárom szintet kiszolgálja. Ahol nincs `steps`, ott a
hard mód a `tip`-et mutatja meg — nincs kötelező tartalom-duplikálás.

### 2.2 A téma életciklusa

```
  ISMERETLEN ──(a funkció elérhetővé válik: ready())──▶ ESEDÉKES
      │                                                     │
      │                                    ┌────────────────┴──────────────┐
      │                                    ▼                               ▼
      │                          hard: STEPS lefut            normál: TIP buborék
      │                                    └────────────────┬──────────────┘
      ▼                                                     ▼
   (0 guide)                                            TANÍTVA ──(done())──▶ LEZÁRT
                                                            │                   │
                                                     due() && !done()      csak akkor szólal
                                                            ▼              meg újra, ha a
                                                        NUDGE (3. szint)   téma visszanyílik
```

Négy szám a mentésben témánként: `st` (0/1/2), `seenAt` (szezon+forduló),
`nudges` (hányszor jelzett már), `mutedAt`.

### 2.3 Módok

| mód | 1. szint — tipp-buborék | 2. szint — vezetett lépéssor | 3. szint — halk jelzés |
|---|---|---|---|
| **Hard guide** | ✅ | ✅ minden témán, magától indul | ✅ |
| **Vezetett** *(≈ mai guide)* | ✅ | csak a sorsdöntő (A-prioritású) témákon | ✅ |
| **Csak emlékeztetők** | — | — | ✅ |
| **0 guide** | — | — | — |

Mellette **témánkénti** és **kategóriánkénti** felülbírálat („a piacról ne
taníts, a csapatépítésről igen"), és a mai „Ne mutass több tippet" megmarad
gyorskapcsolónak — csak mostantól **vissza is kapcsolható**.

### 2.4 Mentés-kompatibilitás

Új ág: `S.teach = {mode, topics:{}, grpOff:{}, ver:1}`. A régi mezők maradnak,
és **migrálódnak**:

* `S.guideOn===true` → `mode:"vezetett"`, `S.guideOn===false` → `mode:"light"`
  (nem `off`! a halk jelzés új érték, senki nem mondott rá nemet — de az első
  megjelenésekor egy egyszeri „ezt itt kapcsolod ki" sáv jár hozzá),
* `S.guideSeen[id]` → a megfelelő téma `st:1`,
* `S.staffIntroDone` → `teach.topics.staff.st=2`.

A `saveGame`/`loadGame` két sora (`guideOn`, `guideSeen` mellé `teach`), és egy
`teachMigrate()` a betöltés végén.

---

## 3. A huszonöt téma katalógusa

Rangsor: **A** = döntés-elvesztő (végleges vagy lejáró, ezt nem szabad
elmulasztani), **B** = ingyenes javítás (bármikor visszavonható, tiszta
nyereség), **C** = optimalizálás.

| # | téma | mikor esedékes (`due`) | horgony | ma | prio |
|---|---|---|---|---|---|
| 1 | Játékos rossz pozícióban | kezdő 11-ben van illeszkedés-hátrányos ember | `hubRoster` + a sor | L1 részben | **A** |
| 2 | Megbízás módosítása | középpályás megbízása alapon áll 3+ meccs óta | `hubMidRolePicker` | L1 ✅ | B |
| 3 | Felállás módosítása | a keret alakja eltér a tengely-erőktől | `hubFormationBtn` | — | B |
| 4 | Taktika módosítása | taktika-illeszkedés a keret alatt / 85 alatti szint | `hubTacticsBtn` | L1 csak kezdéskor | B |
| 5 | Igazolás utáni becserélés | új igazolt jobb, mint a kezdő 11 azonos posztosa | `hubRoster` | — | **A** |
| 6 | Ifi felvétele vagy akadémián tartása | akadémista-döntés áll | az ajánlat-panel | — | **A** |
| 7 | Edzésterv beállítása | `trainingChangeAllowed()` && nincs beállítva | `hubTrainingBtn` | L3 🏋️ ✅ | **A** |
| 8 | Csere meccs közben | 60. perc, vesztésre állunk, van cserekeret | meccsnézet csere-gomb | — | B |
| 9 | Csapatstílus beállítása | `styleCanChoose()` | `hubStyleBtn` | L3 🎯 ✅ | **A** |
| 10 | Kihívások jelentősége | van felajánlott, el nem vállalt kihívás | `hubChallengePanel` | L1 ✅ | B |
| 11 | Mérföldkövek gyűjtése | van meg nem nézett mérföldkő | `hubInfoFab` | L3 ✅ | C |
| 12 | Stílus-kategóriák megnyitása | van elkölthető stíluspont, zárt kategória | `hubStyleBody` | — | B |
| 13 | Eladás azonnal | felesleges kerettag, tele a keret | játékoslap | — | C |
| 14 | Eladás piacra bocsátással | 20+ meccses eladható ember (`SALE_LIST_MIN_MATCHES`) | játékoslap | — | B |
| 15 | Keretlétszám fejlesztése | tele a keret ÉS van rá pénz | `hubRosterExpandBtn` | — | B |
| 16 | Scout | maradt felderítés az ablakban | `hubBuyBtn` | L1 mellékmondat | B |
| 17 | Ügynökség fejlesztése | van pénz a következő fél csillagra | `hubScoutUpgradeBtn` | — | C |
| 18 | Skillek | első skill megszerzése; félbemaradt fázisok | játékoslap | L1 ✅ | B |
| 19 | Kémia építése | induló párkémia (`chemPairs`) | keretlista | L1 részben | B |
| 20 | Pro/kontra a skill-csoportosításban | 3+ azonos kategóriájú skill egy emberen | játékoslap | — | C |
| 21 | TSI jelentősége | első felderítetlen TSI | 👁 jel | L1 ✅ | B |
| 22 | Run szint | első lezárt szezon | `hubRunMeter` | L1 ✅ | C |
| 23 | Szezonkártyák szerzése | valaki kártya-küszöb közelében | keretlista | L1 ✅ | C |
| 24 | Öltöző | új bejegyzés a `lockerLog`-ban | `lockerBtn` | — | B |
| 25 | Menetrend a szezonban | rangadó (⚔️) 3 fordulón belül | menetrend-gomb | — | C |

---

## 4. Fázisok

### F0 — Alapozás *(nincs látható változás)*

* `S.teach` ág + `teachMigrate()` + a `saveGame`/`loadGame` két sora.
* `teachMode()`, `teachTopicOn(key)`, `teachState(key)` olvasók.
* **Kész, ha:** régi mentés betöltve pontosan a mai viselkedést adja, és a
  `./tools/check.sh` tiszta.
* **Méret:** ~120 sor. **Kockázat:** alacsony.

### F1 — A regisztrátum és a mai tippek átköltöztetése

* `TEACH_TOPICS` felvétele, a 29 mai `GUIDE_TIPS` bejegyzés **átemelése** bele
  (`tip:` mezőként), a `GUIDE_TIPS` konstans megtartása vékony aliasként, hogy
  a 24 `guideFire(...)` előfordulás érintetlen maradjon.
* `guideFire(id)` → belül `teachFire(id,"tip")`.
* **Kész, ha:** végigjátszható egy szezon, és **egyetlen tipp sem tűnik el, nem
  duplázódik, nem cserél sorrendet**.
* **Méret:** ~200 sor mozgatás. **Kockázat:** közepes — ez a legkényesebb
  lépés, mert viselkedés-azonosnak kell lennie. Külön commit, semmi tartalmi
  változtatás vele.

### F2 — A 3. szint: halk jelzések

* Új CSS: `.tNudge` (arany **szaggatott** keret + 3 s-os lassú lélegzés —
  szándékosan más, mint a `.guideHi` folytonos gyűrűje), `.tNudgeDot` (pötty a
  gombsarokban), `.tNudgeRow` (keretlista-sor jelölése).
* `teachScanNudges(screen)` — végigfut a képernyőhöz tartozó témákon, a `due()`
  predikátumokkal, és **legfeljebb 3** jelzést tesz ki, prioritás szerint.
* A meglévő `renderHubMenuMarks` jelvényei **beolvadnak**: a 🎁/🎯/🏋️ ugyanezen
  a motoron át kerül ki, nem külön ágon.
* **Új:** koppintásra egy egysoros „miért villog?" fülecske (`why`), és benne
  „Mutasd meg" (elviszi a művelethez) + „Most nem" (cooldown) + „Ne jelezd".
* `prefers-reduced-motion` esetén nincs animáció, csak statikus keret.
* **Kész, ha:** a 3 meglévő jelvény az új motoron megy, viselkedés-azonosan.
* **Méret:** ~300 sor. **Kockázat:** közepes (teljesítmény — lásd 6.2).

### F3 — A 2. szint: vezetett lépéssor

* `STAFF_INTRO_STEPS` általánosítása `teachRunSteps(key)`-jé: lépésszámláló,
  „Tovább" / „Kihagyom" / „Ne vezess többé", horgony-kiemelés, görgetés.
* **Két megjelenési forma**, témánként választva:
  * *inline* (a stábtag mai módja) — ha a téma egy panelen belül él,
  * *overlay* (a guide-buborék horgonyzott formája) — ha a lépések képernyők
    között visznek.
* A stáb-bevezető **átáll erre**, és a saját ága törlődik (nettó
  kódcsökkenés).
* Hard módban a lépéssor a téma esedékessé válásakor **magától indul**; vezetett
  módban csak a nudge „Mutasd meg" gombjáról.
* **Kész, ha:** a stábtag-bevezető pixelre a mait adja, de már a közös motoron.
* **Méret:** ~350 sor, ebből ~80 törlés. **Kockázat:** közepes.

### F4 — Beállítóképernyő

* A `#guideGrid` kétgombos választója **négygombosra** nő (hard / vezetett /
  csak emlékeztetők / semmi), rövid magyarázattal.
* **Új: futó karrierben is állítható** — a `#themeModal` beállítóablakba egy
  „Vezetés" szekció: mód + kategória-kapcsolók + „Elfelejtett témák
  visszaállítása" + egy lista a 25 témáról (állapot: ismeretlen / tanítva /
  lezárt, egyenkénti ki-be).
* **Ez pótol egy mai hiányt:** ma a „Ne mutass több tippet" **végleges** — nincs
  visszaút.
* **Kész, ha:** minden mód menet közben váltható, és azonnal hat.
* **Méret:** ~250 sor. **Kockázat:** alacsony.

### F5 — Tartalomcsomagok

Négy hullám, hullámonként egy kiadás. Csomagonként: `due()` predikátum,
buborékszöveg, 2–4 lépéses vezetés, nudge-felirat, `GLOSSARY`-kötés.

| csomag | témák | megjegyzés |
|---|---|---|
| **A — csapatépítés** | 1, 2, 3, 4, 7, 8, 9, 24 | a legnagyobb hatás: itt dől el a meccs |
| **B — piac** | 5, 13, 14, 15, 16, 17, 6 | a `due()`-k itt a legdrágábbak, cache kell |
| **C — hosszú táv** | 18, 19, 20, 21, 22, 23 | java már megvan L1-en, `steps` és `nudge` hiányzik |
| **D — meta** | 10, 11, 12, 25 | részben megvan, kiegészítés |

* **Kész, ha:** csomagonként végigjátszott 2 szezon, és minden téma legalább
  egyszer előjött a maga helyén, egyik sem félrehorgonyozva.
* **Méret:** csomagonként ~400–600 sor (zömmel szöveg).

### F6 — A karmester finomhangolása

* Prioritás, cooldown, telítettség-védelem (6.1).
* Szezononkénti „tanító-költségvetés": hard módban is legfeljebb N lépéssor egy
  szezonban, a többi átcsúszik.
* Ha egy téma **kétszer jelzett és nem történt semmi**, a harmadiknál elhallgat,
  és a beállításokban „elnémítva" jelöléssel jelenik meg.

### F7 — Az első futás

* Új játékosnál a **hard mód az alapértelmezett** (ma a „Tippek nélkül" a
  kiválasztott gomb!), a kezdőképernyőn egy mondatos magyarázattal.
* A már-karrierrel-rendelkezőknél marad, ami eddig volt.
* Egy „Vezess újra végig" gomb a beállításokban, ami az egész regisztrátumot
  visszaállítja ismeretlenre.

### F8 — QA, diagnosztika, dokumentáció

* `teachDebug()` a diagnosztika-ablakba: mind a 25 téma állapota, `ready`/`due`
  pillanatnyi értéke, mikor jelzett utoljára — és kényszerített indítás.
* A `docs/` bővítése egy `vezetett-elmeny.md` rendszerleírással (ez a doksi a
  *terv*, az lesz a *leírás*).

### F9 — Opcionális ráépülés

* „Menedzseri jogosítvány": haladás-kijelző (`14/25 téma megtanulva`), és
  mérföldkő-kötés — a tanulás maga is gyűjthető legyen.

---

## 5. Verzióterv

| verzió | tartalom |
|---|---|
| **3.4.0** | F0 + F1 + F2 — motor és halk jelzések, tartalom nélkül |
| **3.4.1** | F3 + F4 — vezetett lépéssor és a beállítóképernyő |
| **3.4.2** | F5/A — csapatépítés |
| **3.4.3** | F5/B — piac |
| **3.4.4** | F5/C — hosszú táv |
| **3.4.5** | F5/D — meta |
| **3.5.0** | F6 + F7 + F8 — karmester, alapértelmezés, dokumentáció |

---

## 6. Szabálykönyv — hogy segítség maradjon, ne zaklatás

### 6.1 Anti-zaklatás

1. **Egyszerre egy** buborék vagy lépéssor. (Ez ma is így van, `_guideQ`.)
2. **Legfeljebb 3** halk jelzés egy képernyőn, prioritás szerint vágva.
3. **Tiltott időszak:** meccs közben nincs lépéssor és nincs buborék (kivéve a
   8. téma, a meccs közbeni csere — az *ott* a helye); modális folyamat
   (draft-pörgetés, tárgyalás, sorsolás) közben semmi.
4. **Cooldown:** ugyanaz a téma legkorábban 3 forduló múlva jelez újra.
5. **A siker elnémít:** `done()` → a nudge végleg elhallgat.
6. **A „Most nem" számít:** két elutasítás után a téma magától elnémul.
7. **A hard mód se börtön:** minden lépéssoron ott a „Kihagyom", és a legelső
   lépéssor alján egy „Ez sok nekem — állítsd halkabbra" gomb, ami egyenesen a
   beállításba visz.

### 6.2 Teljesítmény

A `renderHub()` gyakran fut, és a `due()` predikátumok között lesz drága
(keret-végigjárás, illeszkedés-számolás, ár-becslés). Ezért:

* a `due()`-k eredménye **kulcsolva cache-elődik** (`szezon:forduló:téma`), és
  csak akkor számol újra, ha a kulcs változott vagy a keret módosult,
* a drága predikátumok `scr` szerint szűrve futnak — a piaci témák a HUB
  keretlistájánál meg sem szólalnak,
* mindegyik `try/catch`-ben, ahogy a mai `styleCanChoose()`-hívás is: **egy
  hibás predikátum nem viheti el a HUB rajzolását.**

### 6.3 A 48 000 soros egyfájlos kód

* Minden új globális `teach` / `TEACH_` prefixszel — egy globális scope van, és
  a `no-undef` az egyetlen háló.
* **Minden fázis után `./tools/check.sh`**, kiadás előtt kötelezően.
* Fázisonként külön commit; az F1 (átköltöztetés) semmilyen tartalmi
  változtatást nem visz magával, hogy egy regresszió egyértelműen
  visszavezethető legyen.

### 6.4 Akadálymentesség

A villogás a 3. szint fő eszköze, de nem lehet kizárólagos: minden nudge
**kap egy statikus jelet is** (pötty vagy keret), a `prefers-reduced-motion`
pedig kikapcsolja az animációt. A mai `guideHiPulse` 1,9 s-os; a nudge
szándékosan lassabb (3 s) és halványabb, hogy a két réteg megkülönböztethető
legyen.

---

## 7. Tesztlista

* [ ] Régi mentés (3.3.22) betöltése — a mai viselkedés változatlan.
* [ ] `guideOn:true` karrier → `mode:"vezetett"`, a látott tippek nem jönnek elő újra.
* [ ] `guideOn:false` karrier → `mode:"light"`, egyszeri magyarázó sáv az első nudge-nál.
* [ ] Mind a négy mód végigjátszva egy fél szezonon.
* [ ] Hard mód: minden esedékes téma lefut, egyik sem félrehorgonyozva.
* [ ] Lépéssor közben képernyőváltás → a kiemelés eltűnik, a téma visszakerül esedékesbe.
* [ ] Meccs közben nem ugrik fel semmi (a 8. témán kívül).
* [ ] „Ne jelezd" → a téma némán marad, újratöltés után is.
* [ ] „Vezess újra végig" → mind a 25 visszaáll.
* [ ] `./tools/check.sh` tiszta minden fázis után.
* [ ] `file://`-ról megnyitva is működik (nincs build-lépés — ez a repo alapelve).

---

## 8. Nyitott kérdések — ezekre döntés kell

1. **Alapértelmezés.** A hard mód legyen az alapértelmezett új játékosnak?
   (Javaslat: **igen**, de az első képernyőn egy mondatban kimondva, hogy
   bármikor halkítható. Ma a „Tippek nélkül" az alapértelmezett — ez a
   legnagyobb egyetlen oka annak, hogy a játék magára hagyottnak érződik.)
2. **Futó karrierek.** A meglévő karrierek kapják-e meg visszamenőleg a 3.
   szintet? (Javaslat: **igen, `light` módon** — a halk jelzés nem tolakodó, és
   pont a régi játékos tudja hasznosítani.)
3. **A lépéssor formája.** Legyen-e overlay (képernyőt átvevő) változat, vagy
   maradjon minden inline, a stábtag mintájára? (Javaslat: **inline az alap**,
   overlay csak ott, ahol a lépések képernyőt váltanak.)
4. **Mennyi az „egy szezonnyi tanítás"?** Hard módban is kell felső korlát,
   különben az első szezon 25 lépéssorból áll. (Javaslat: **szezononként 6**,
   prioritás szerint.)
5. **A meccs közbeni csere** tanítása megállítsa-e a mérkőzést első alkalommal?
   (Javaslat: **igen, egyszer** — a félidei megállásnál, ahol amúgy is áll a
   játék.)
