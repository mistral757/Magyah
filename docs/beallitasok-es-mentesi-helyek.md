# A beállító képernyő négy oldala, a dinamikus mód két csúszkája, és a három egyjátékos hely

*(3.4.10–3.4.12. Érintett kód: `SETUP_PAGES` / `setupGoto` / `setupPageAlive` /
`renderSetupSteps` / `renderSetupRecap`; `aimCustom` / `aimNearestPreset` /
`titleOddsAt` / `diffUiMode` / `renderAimSlider`; `SP_SLOT_MAX` /
`spSaveKeyFor` / `spSlot` / `spSlotSave` / `spFreeSlot`, és a `mpCtxKey` /
`mpSwitchContext` kontextusváltás.)*

Három, egymástól független változás, közös gyökérrel: a **karrier indítása**
volt a játék legzsúfoltabb és legkevésbé megbocsátó pontja.

---

## 1. A beállító képernyő négy oldala (3.4.10)

### Ami baj volt

A karrier-beállítás **egyetlen, három-négy képernyőnyi görgetés** volt:
felállás, draft-pool, Rating-alap, családtag, mezőnyszint, piramis-kapcsolók,
tempó, sorsolás, vezetés, képességek, újrapörgetés — a lap legalján egyetlen
„Kezdjük" gombbal.

* Aki **először** látta, nem tudta, hol tart és mi jön még.
* Aki **sokadszor**, annak a görgetés volt fárasztó.
* A lap **közepén** ülő döntések rendre elvesztek — élükön a ligapiramis
  kapcsolóival, pedig azok döntik el, milyen kemény lesz az egész karrier.

### Ami lett belőle

Négy oldal, mindegyik **egy kérdésre** felel:

| # | oldal | mi van rajta |
|---|---|---|
| 1 | **A csapatod** | felállás + előnézet, kezdés módja (draft / kész klub), fogalomtár |
| 2 | **A keret** | draft-pool (válogatottak), Rating alapja, családtag, újrapörgetés, vak mód |
| 3 | **A kihívás** | *a piramis:* mezőnyszint, szintkövetés, sorsolás rendje, fejlődési tempó |
| 4 | **Indulás** | vezetés, képességek, **összefoglaló**, „Kezdjük" |

**Ez tiszta megjelenítési munka.** Egyetlen vezérlő sem költözött másik ablakba,
egyetlen azonosító sem változott, és minden korábbi mutat/rejt hívás
(`updateFamilySetupVisibility`, `updateRatingBasisVisibility`,
`renderAutoAimSetup`, a vendég-átnéző zárja) változatlanul ugyanazokra az
elemekre hat.

Ami mégis új:

* **Kattintható lépcső** a lap tetején. Vissza egy koppintás bármelyik már
  látott oldalra; **előre csak a Tovább visz** — egy át nem nézett oldal
  beállításai különben csendben maradnának alapértelmezésen.
* **Üres oldalt átugrunk.** Klasszikus módban a karrier-vezérlők rejtettek, és
  egy csupasz cím + alcím oldal semmit nem érne. A `setupPageAlive` megnézi,
  maradt-e látható tartalom (a címet és az alcímet nem számolva), a `setupStep`
  pedig átlépi az üreset.
* **Összefoglaló az utolsó oldalon.** Az első három oldal döntései egy
  dobozban, soronként koppintva vissza a beállításához. Nem díszítés: az
  indulás visszafordíthatatlan — a Rating-alap, a tempó és a sorsolás a karrier
  indulásakor rögzül —, tehát itt a helye egy utolsó pillantásnak.
* **A fogalomtár lecsukva indul.** Nyitva negyven chip, másfél képernyő:
  referencia-anyag, nem döntés.

A **közös karrier vendég-átnézője** ugyanezt a négy oldalt lapozza végig,
változatlan zárral: a felálláson kívül minden csak olvasható.

---

## 2. A dinamikus mód két csúszkás egyszerű módja (3.4.11)

### Ami baj volt

A mezőny szintjét **három egymásra rakott vezérlő** állította:

1. a csúszka (hol kezdesz),
2. egy kézi / auto kapcsoló,
3. és négy nevesített cél-sáv, `+3 … +5` alakú felirattal.

Az a `±gap` fogalom a HUB-ban tanulható meg (ott a saját meccs-erődhöz mérve
látod) — a **beállító képernyőn viszont még semmit nem jelent**. A kezdő itt
vagy találgatott, vagy hozzá sem nyúlt.

### Ami lett belőle

**Egyszerű mód — ez az új alapértelmezés. Két csúszka:**

1. **Ellenfelek erőssége** — hol kezdesz a ligapiramison *(változatlan)*.
2. **Mennyire szorítson** — mekkora fölényt hagyjon neked a mezőny.

A szintkövetés ilyenkor magától **be van kapcsolva**: a dinamikus mód épp attól
dinamikus. A második csúszka a ±sáv **felső határát** állítja (a sáv szélessége
fix 3), és a feliratában nem gapet ír, hanem azt, amit az jelent: a fokozat
nevét és a **bajnoki esélyt**.

| csúszka | sáv | fokozat |
|---|---|---|
| 2 | −1 … +2 | Kegyetlen |
| 3 | 0 … +3 | Kemény |
| 4 | +1 … +4 | Szigorú |
| 5 | +2 … +5 | Kiegyensúlyozott |
| 6 | +3 … +6 | Magabiztos |
| 7 | +4 … +7 | Kényelmes |
| 8 | +5 … +8 | Megengedő |
| 9 | +6 … +9 | Sétagalopp |

A bajnoki esély a `levelWarnState` fölötti kalibrációból jön (gap 0 → 0%,
+2 → 5%, +4 → 33%, +6 → 78%, +8 → 97%), egyenesekkel összekötve
(`titleOddsAt`). Ez az **egyetlen fordítás** a belső ±gap és a felhasználó
nyelve között.

**Részletes mód:** a régi három vezérlő, változatlanul. A **kézi nehézség csak
itt** érhető el — az nem „egyszerű", hanem egy másik játék.

### Hogyan fér el a kettő egy állapoton

A két mód **ugyanazt az egy állapotot** írja (`S.autoLevel`,
`S.autoLevelAim`), csak más nyelven kérdez. A csúszka választását ugyanaz a
mező viszi, `"c<felső határ>"` alakú azonosítóként (pl. `"c5"`), tehát:

* a **mentés**, az **MP-csomag** és a régi betöltő ág (`|| "balanced"`)
  változatlan maradt — mindegyik sztringet lát, ahogy eddig;
* minden olvasó (HUB, Infópult, szintkövetés) az `autoLevelAim()`-en keresztül
  jut hozzá, tehát **egy helyen** kell értenünk.

A módváltás a legközelebbi megfelelőre kerekít, **holtversenynél a
megengedőbb** felé — hogy oda-vissza lapozva se váljon csendben nehezebbé a
karrier. (A 3-as csúszka-állás épp ilyen: a Kegyetlen és a Szigorú egyforma
messze van tőle.)

A HUB cél-sáv választója **kiírja, ha egyedi sáv van érvényben** — enélkül a
négy nevesített gomb jelöletlenül állt volna, és nem derült volna ki, mi az
aktuális beállítás.

A **nézet-mód** (egyszerű / részletes) `localStorage`-ban él
(`harminc_nulla_diffui_v1`): felület-preferencia, nem játékszabály, a mentésnek
semmi köze hozzá.

---

## 3. Három párhuzamos egyjátékos karrier (3.4.12)

### Ami baj volt

A szobák régóta **külön mentési helyen** élnek, az egyjátékos viszont
**egyetlen** helyen. Aki új karriert akart kipróbálni — más felállás, keményebb
piramis, Gleccser-tempó —, annak törölnie kellett a régit.

### Ami lett belőle

**Három hely.** Mind a kezdőlapról érhető el, csapatnévvel és szezonszámmal
kiírva, ugyanabban a dobozban, ahol a szobák chipjei ülnek.

```
EGYJÁTÉKOS KARRIEREID
🏠 1. hely · Alfa FC          ▶ 5. szezon — folytatható
🏠 2. hely · Beta SC          ▶ 1. szezon — folytatható
+ Új egyjátékos karrier       2/3 hely foglalt
```

Ha mind a három foglalt, ezt kimondjuk, és megnevezzük az egyetlen utat: nyiss
meg egyet, és ott válaszd az „Új játék elölről"-t. **Magunktól soha nem
törlünk valódi mentést.**

### Miért pont három

A korlát nem ízlés kérdése, hanem a `localStorage` kvótája. Mérve (lásd a
`packCareerPool` fölötti feljegyzést): egy 4. szezonjában járó karrier **nyersen
578 kB**, ennek 96%-a a `careerPool`; a tömörítés után egy késői karrier a
**150–250 kB** sávban van. A szokásos kvóta **5 MB**, és ezen **osztozik**:

* minden szoba-mentés (szintén 150–250 kB, és a szoba bezárása a mentést
  szándékosan meghagyja),
* a profil, a Run-ranglista és a beállítás-kulcsok.

Három egyjátékos hely a legrosszabb esetben ~750 kB — bőven a kvóta alatt marad
akkor is, ha mellette több szoba fut. **Négy-öt hellyel a tartalék elfogyna**, és
a tele tárhely tünete a lehető legrosszabb: a `setItem` némán elszáll, a játék
„menteni látszik", és egy újratöltés **egy egész szezonnal** ugrik vissza.
Inkább legyen három hely, ami mindig ment.

**Szerveroldalon ez semmit nem mozdít.** Az egyjátékos karrier teljes egészében
a böngészőben él, hálózat nélkül; a Firebase-t kizárólag a kétjátékos ág tölti
be (`mpNetInit`), és annak a szoba-korlátain semmi nem változott.

### A kulcsok visszafelé kompatibilisek

| hely | kulcs |
|---|---|
| 1. | `30-0-save-v1` — **a régi kulcs, változatlanul** |
| 2. | `30-0-save-v1-s2` |
| 3. | `30-0-save-v1-s3` |

Minden meglévő mentés pontosan ott van, ahol volt, és ugyanúgy betöltődik. A
2–3. hely a régi kulcs utótagos változata, így a diagnosztika prefix-szűrője
(`indexOf(SAVE_KEY)===0`) is elkapja mindet.

### A váltás útja — és miért nem másképp

A hely váltása **kizárólag újratöltéssel** történik, ugyanazon a csatornán
(`mpSwitchContext` → `mpReloadWithIntent`), amit a szoba-váltás is használ. A
teljes játékállapot több száz globálisban ül; ezeket egyenként visszaállítani
törékeny lenne, és egyetlen kifelejtett globális néma keveredést okozna két
karrier között. A váltás **előtt mentünk**, tehát semmi nem vész el.

Egy apró, de életbevágó részlet: a **kontextus-kulcs megnevezi a helyet is**
(`solo:2`). Enélkül a három hely közti váltás `"solo" → "solo"` lenne, a
`mpSwitchContext` azonosnak látná a kettőt, és **nem töltene újra** — a
felhasználó ugyanabban a karrierben maradt volna, miközben a mentés célja már a
másik helyre mutat. Pontosan ez az a hibaosztály, ami ellen a mentési zár véd;
itt a gyökerénél zárjuk le.

### Kísérő javítás: a kezdőlap üres maradt szoba nélkül

Az `mpBoot`-ban egy csupasz `return` állt arra az esetre, ha nincs se meghívó,
se jegyzett szoba — így aki **sosem járt kétjátékos szobában**, annak a
kezdőlapja üres maradt: az egyjátékos karrierjének chipje sem jelent meg, pedig
a mentése ott volt. Amíg egyetlen hely létezett, ez csak kényelmetlenség volt
(az „Egyedül játszom" gomb odavitt); három hellyel viszont ez lenne az
**egyetlen út** a 2. és 3. helyre. A rajzoláshoz nem kell hálózat: a mentések
helyben vannak.

### Tárhely-előrejelzés

A mentés elszállása eddig csak **utólag** derült ki (piros sáv az első
sikertelen írásnál). Több párhuzamos karrierrel a betelés reálisabb, ezért
előre szólunk: a keret **70%-a fölött** (`STORAGE_WARN_BYTES`) a kezdőlap
kiírja, mennyi fogy, és megnevezi a takarítás helyét — a HUB menüjének
**Mentések és tárhely** ablakát. Ez csak tájékoztat; magunktól továbbra sem
törlünk semmit.

Ugyanez az ablak és a 🧪 diagnosztika mostantól **megnevezi a helyet**
(„🏠 Egyjátékos karrier · 2. hely"), különben a törlés-gomb találgatás lenne.
