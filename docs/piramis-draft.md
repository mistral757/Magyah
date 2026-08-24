# A draft visszatért a hagyományos (piramis) karrierbe

*(3.7.18. Érintett kód: `updatePyrSetupVisibility`, `careerStartGrid` +
`pyrStartNote` markup, `placeBench`, `pyrOpenDivPickFromDraft` (új),
`pyrOpenDivPick`, `pyrConfirmDiv`, `renderPyrDivPick` fejléc, `pyrDivBackBtn`,
`pyrPickFromDraft` (új modulváltozó). A régi, most újra elérhető mechanika:
`pyrDraftPick`, `pyrPoolOffset`, `PYR_DRAFT_PREMIUM` — de lásd lent, ezek MÁR
NEM futnak új karriernél, csak a régi mentések Run-visszajátszásához élnek.)*

## Az előzmény: miért tűnt el a draft (v3.4.18)

A hagyományos (ligapiramis) karrierben eredetileg volt draft: a beállításon
egy csúszkával választottál OSZTÁLYT, utána a draft ehhez a célhoz
**súlyozva** merített (`pyrDraftPick`), és egy fix, mért "szerkezeti
prémiumot" (`PYR_DRAFT_PREMIUM`) vontunk le a pool-eltolásból, mert egy
draftolt tizenegy szerkezetileg erősebb, mint bármelyik klub, amiből
draftoltad.

A v3.4.18 ezt kivezette: **"a súlyozás mellett is szórt maradt a rés" —**
vagyis a draft VÉGÉN kapott keret ereje a célosztályhoz képest
kiszámíthatatlanul ingadozott, miközben a mód egész ígérete az, hogy **TUDD**,
mekkora falat vállaltál. A válasz akkor a sorrend megfordítása volt:
KLUB → OSZTÁLY (a klub ismeretében, felskálázással) — de ez csak a kész
klubos indulásra maradt; a draft útja onnantól nem volt elérhető a
belépőn (a kódja megmaradt mérőeszköznek és Run-visszajátszásnak).

## Ami megváltozott: a felskálázás magát a problémát oldja meg

A 3.5.08-as felskálázható piramis és a rés-alapú Run-mérce pontosan azt a
fajta bizonytalanságot semlegesíti, ami miatt a draftot annak idején
kivezették — csak **utólag**, nem előre. Ha az osztályválasztó a TÉNYLEGES
kereted erejéből dolgozik (ahogy kész klubnál már ma is teszi), a
"kiszámíthatatlan rés" többé nem probléma: nem kell előre eltalálni semmit,
a képernyő pontosan megmutatja, hol állsz — bármilyen erős is lett a
kereted.

**A megoldás ezért nem a régi, súlyozott draft visszahozatala, hanem
ugyanannak a mintának az átvitele a draftra is:**

```
RÉGI (v3.4.13 előtt):  OSZTÁLY (vakon, csúszkával) → SÚLYOZOTT draft → karrier
v3.4.18 (kész klub):                      KLUB (valós) → OSZTÁLY (a klub ismeretében, felskálázva) → karrier
3.7.18 (draft, ÚJ):    DRAFT (kalibrálatlanul, mint egy sima karrierben) → OSZTÁLY (a KÉSZ kereted ismeretében, felskálázva) → karrier
```

A draft ezért **pontosan úgy fut, mint egy nem-piramis karrierben** — nincs
`pyrDraftPick` súlyozás, nincs `PYR_DRAFT_PREMIUM` levonás, a draft-pool a
sima `draftPool()`/`activeSquads()`. (`pyrOn()` a draft alatt hamis — a
piramis világa csak az osztályválasztó megerősítésekor születik meg —, ezért
a `spin()`-ben lévő régi `pyrOn()&&pyrDraftPick(r)` ág magától kimarad,
semmiféle külön kikapcsolás nem kellett hozzá.) A draft VÉGÉN, a KÉSZ
kereteddel nyílik meg ugyanaz az osztályválasztó képernyő (`#scPyrDiv`), amit
eddig csak a kész klubos indulás használt — a te 11+7 fős, valós Ratinges
kereteddel, ugyanazzal a felskálázással.

## A belépő: mindig ott a két lehetőség

A "2. választás" (`#careerStartGrid`: Draft / Kész klub) mostantól MINDIG
látszik career módban, piramis alatt is — nem tűnik el, és nem kényszeríti
`careerStart="club"`-ra. Ami VELE együtt jár:

- **Draft-specifikus oldalak visszatérnek piramisban is**, ha a Draft van
  kiválasztva: a Rating-alap (szezon-alapú vs csúcsforma), az újrapörgetés és
  a családtag-kör — ezeket az `updateRatingBasisVisibility` /
  `updateFamilySetupVisibility` / `updateRerollVisibility` már eddig is
  kizárólag a `careerStart`-ból döntötte el, piramistól függetlenül; csak az
  `updatePyrSetupVisibility` írta felül őket egy vak, piramis-szintű
  tiltással. Ez a felülírás megszűnt.
- **A VB-/EB-győztes válogatottak kapcsoló** (`wcToggleGrid`) piramisban
  MÁS okból volt rejtve: kész klubnál a lista a liga klubjaiból épül
  (`pyrClubPool`), ott a kapcsoló tényleg hatástalan. Draftnál viszont a
  pool ugyanaz a `draftPool()`/`activeSquads()`, amit egy sima karrier is
  használ — ott a kapcsoló újra számít, ezért csak akkor marad rejtve, ha a
  kezdés módja kész klub.
- **A kezdő nehézség csúszkája, az egyszerű/részletes választó, az auto
  szintkövetés** (`#dynSetupWrap`) továbbra is rejtve marad, draft vagy klub
  esetén egyaránt — ezeket az osztályválasztó (a rés-csúszka) váltja ki.

## Az osztályválasztó (`#scPyrDiv`) két bejárata

Ugyanaz a képernyő, két különböző előzménnyel:

- **Kész klubtól** (`pyrOpenDivPick`): a `sq` egy valós `{club,season,
  players}` — a fejléc kiírja a klub nevét és az idényt, a "← Mégis másik
  klubot választok" gomb visszavisz a klublistára.
- **Drafttól** (`pyrOpenDivPickFromDraft`, új): a `sq.players` a
  `slots`+`BENCH`+`extraRoster` háromból áll össze, `sq.club` egy
  tájékoztató felirat ("A drafton összeállított kereted"), `sq.season`
  szándékosan üres — a fejléc ilyenkor kihagyja a zárójeles idényt. A "← Mégis
  másik klubot választok" gomb itt **rejtve marad**: a draft véglegesen
  lezárult (a bench is kész), nincs "másik keret" — a liga és a rés viszont
  a képernyőn belül szabadon állítható, ez adja a mozgásteret.

A megerősítő gomb (`pyrConfirmDiv`) egy `pyrPickFromDraft` jelzőtől függően
ágazik: kész klubnál a régi `startClubCareer(sq)` tölti be a valós kerettet
(változatlan), draftnál ez **kimarad** — a kereted már kész, a `pyrStart`
csak a VILÁGOT és a MARADÉK (még nem draftolt) poolt igazítja hozzá —, és a
folyamat egyenesen a kémia-képernyőre lép tovább, pontosan ott, ahol egy
sima draft is folytatná.

## A Run-szint mellékhatása

A drafttal induló piramis-karrier a `runBreakdown()`-ban a kezdéstől fogva
kap legalább egy valódi, súlyozott sort (**Újrapörgetések**, mert
`R.clubStart` most helyesen `false`) — szemben a kész klubos piramis-
karrierrel, ahol (lásd a 3.7.16-os javítást) az első szezon lezárásáig szó
szerint egyetlen sor sincs. Ez nem volt külön cél, csak természetes
következménye annak, hogy a `runBreakdown()` már eddig is helyesen,
kizárólag `careerStart`-ból döntötte el, mely komponensek érvényesek — nem
kellett hozzányúlni.

## Tesztelés

Playwright-tal, a beállító képernyőn és a teljes indítási láncon:
- career mód + piramis "be" → a `careerStartGrid` látszik, alapértelmezetten
  Draft van kiválasztva; a Rating-alap/újrapörgetés/családtag/VB-EB
  kapcsolók mind látszanak;
- átváltás Kész klubra → ugyanezek a kapcsolók újra eltűnnek (a régi,
  változatlan viselkedés);
- `beginNewGame()` + egy teljes (szintetikus) draft lezárása → a
  `placeBench` utolsó hívása helyesen nyitja meg az osztályválasztót a KÉSZ
  kereted valódi erejével, a "← Mégis másik klubot választok" gomb rejtve;
- "Indulás" megerősítése → `phase` a kémia-képernyőre lép (nem
  `startClubCareer`), `S.pyr` és `oppTargetRating` helyesen áll be, a keret
  változatlan (11 slot, ugyanazok a játékosok), és a Run-bontásban azonnal
  megjelenik az Újrapörgetések sor;
- regresszió: a kész klubos piramis-flow (scout → klub → osztályválasztó →
  kémia) változatlanul működik, a fejléc a valós klubot és idényt mutatja, a
  "vissza" gomb megmaradt.

Mind a négy forgatókönyv a várt eredményt adta, `tools/check.sh` zöld.

---

# A hiányzó fél: a Draft gomb valóban a draftra visz (3.7.22)

*(Érintett kód: `$("scoutNextBtn").onclick`, `scoutSpinBtn` land-ága,
`renderSetupRecap`, `draftComplete` (új), `saveGame` (`pyrPend` mező),
`applySavedGame`, `resumeUIFromSave`, `pyrSetupWrap` és `renderPyrCapNote`
szövegek.)*

## A tünet

A 3.7.18 visszahozta a Draft / Kész klub választót a hagyományos karrier
belépőjére — **de csak a kapcsolót**. A Draftot választva a folyamat ugyanúgy
a kész csapatválasztóba futott tovább: a scout után a klublista jött, a keretet
nem te draftoltad össze. A kapcsoló tehát látszott, de nem csinált semmit.

## Az ok: EGY ág, ami nem kérdezett rá a kezdés módjára

A `scoutNextBtn` kezelője a piramist EGYETLEN dolognak vette:

```js
if(pyrPending){          /* piramis → klubválasztó, kérdés nélkül */
  $("scClubPick").classList.remove("hide"); … return;}
$("scOpponents")…        /* minden más → ellenféltábla, utána draft */
```

Ez a 3.4.18 óta igaz volt (ott a piramis tényleg csak kész klubbal indult), és
a 3.7.18 a *kimenetet* (`placeBench` → `pyrOpenDivPickFromDraft`) meg a
*belépőt* (a választó láthatóságát) is megcsinálta — csak épp ezt a **bemeneti
elágazást** nem. A draft-ág így soha nem kapott vezérlést.

A javítás pontosan egy kérdés: piramisban is a `careerStart` dönti el, hova
megyünk a scout után.

```
piramis + kész klub :  scout → KLUBVÁLASZTÓ → osztályválasztó → kémia   (változatlan)
piramis + draft     :  scout → DRAFT        → osztályválasztó → kémia   (ÚJ: eddig ide sosem jutott el)
dinamikus + draft   :  scout → ellenféltábla → draft → kémia            (változatlan)
```

Az ellenféltábla-sorsolás a draftos piramis-ágon is kimarad — ugyanazért, amiért
a klubosnál: a mezőnyt az OSZTÁLYOD adja (`pyrOpponents`), és a pörgetés
(`SEASON_OPPS=buildOpponents`) felül is írná. `SEASON_OPPS` a draft alatt üres,
pontosan úgy, ahogy a klubos ágon a klubválasztás alatt.

## A gomb felirata

A `scoutNextBtn` fix „Irány az ellenfél-tábla →" felirata mindkét piramis-ágon
hazudott (ott nincs ellenféltábla). A felirat mostantól a land-ágban dől el:
ellenfél-tábla / klubválasztás / draft.

## A mentés: a függő piramis is állapot (`pyrPend`)

Ez a fix nélkül **adatvesztés** lett volna. Drafttal induló piramis-karrierben
a piramis VILÁGA csak az osztályválasztó megerősítésekor születik meg
(`pyrConfirmDiv`) — a draft egésze alatt a mód csak a `pyrPending`
modulváltozóban létezik. A draft viszont **minden körben ment** (`place`,
`placeBench` → `saveGame`), az `applySavedGame` pedig vakon `pyrPending=false`-ra
állt. Egy újratöltés a draft közepén tehát némán **dinamikus karrierré** tette a
futást: a `placeBench` a végén osztályválasztó nélkül a kémia-képernyőre lépett
volna.

Kész klubos piramisnál ez sosem derülhetett ki, mert ott az ELSŐ mentés már a
kész piramis-világgal (`S.pyr`) születik — a `pyrPending` nullázása ott
szándékos és helyes (egy félbehagyott beállítás ne ragadjon a modulváltozóban).
Ezért nem a nullázás tűnt el, hanem mellé került a mentett szándék:

- `saveGame`: `pyrPend: pyrPending ? {speed:pyrPendingSpeed} : null`
- `applySavedGame`: a modulváltozók továbbra is törlődnek, majd a **betöltött
  állás** saját `pyrPend`-jéből élednek újra.

## A lezárt draft mint érvényes köztes állapot (`draftComplete`)

A `phase` végig `"draft"` marad, amíg az osztályválasztó meg nem erősít — a
draft VÉGE és a karrier indulása közé tehát belefér egy újratöltés. Két hely
kezelte ezt korábban sérült mentésként:

- `applySavedGame` a `benchCatIndex`-et nullázta, ha az nem mutatott a négy
  általános padhely valamelyikére. A lezárt draftnál viszont éppen a lista
  VÉGÉRE mutat (`=DRAFT_BENCH_CATS.length`), tehát a nullázás egy KÉSZ
  cserepaddal dobta volna vissza a padkörbe.
- `resumeUIFromSave` a `phase==="draft"`-ot mindig a draft-képernyővel
  folytatta — a kész kerettel ez egy pörgethetetlen zsákutca lett volna.

Mindkettő ugyanarra az EGY állításra épül (`draftComplete()`: teli kezdő 11 +
teli négy általános padhely). Ha igaz és a piramis még függőben van, a folytatás
helye az osztályválasztó, pontosan ott, ahol a `placeBench` hagyta.

## Az összefoglaló (`renderSetupRecap`)

Az utolsó beállító-oldal a régi világot írta ki: a **Kezdés** sort piramisban
kihagyta, majd egy fix `"Kész klub kerete · nincs draft"` sorral pótolta — a
Draftot választó felhasználónak szó szerint az ellenkezőjét állítva. Mostantól:

- **Kezdés** — minden karrierben a valódi választás (`Draft` / `Kész klub
  kerete`), piramisban is; a „Draft-nézet" (vak mód) továbbra is csak
  klasszikusban, ahol a `modeGrid` tényleg látszik;
- **Rating alapja** — a draft sajátja, tehát piramisban is megjelenik
  drafttal (pontosan úgy dönt, ahogy az `updateRatingBasisVisibility`);
- **Draft-pool** — kimarad kész klubos PIRAMIS-indulásnál, mert ott a lista a
  liga klubjaiból épül (`pyrClubPool`), a kapcsoló hatástalan és rejtve is van;
- **Kezdő osztály / A rajt nehézsége** — „a draft után dől el", ha drafttal
  indulsz.

## Szövegek

A `pyrSetupWrap` bevezetője („Itt **nincs draft**") és a Run-plafon jegyzete
(„mindhármat a **klubválasztás** után döntöd el") még a 3.4.18-as világot
mondta. Mindkettő a keret összeállításáról beszél, ami mindkét úton igaz.

## Tesztelés

Playwright-tal, valódi kattintásokkal, `http-server`-en:

- **piramis + Draft**: a beállító összefoglaló `Kezdés = Draft`, `Kezdő osztály
  = a draft után dől el`; a scout-gomb felirata „Irány a draft →"; a gomb a
  **draft-képernyőre** visz (`scDraft` látszik, `scClubPick`/`scOpponents` nem),
  `roundInfo` = „1. draftkör / 11";
- **teljes draft lezárása** → az osztályválasztó nyílik meg a 15 fős kész
  kerettel, a „← Mégis másik klubot választok" gomb rejtve; az „Indulás"
  után `phase="chem"`, `pyrOn()` igaz, a kezdő 11 változatlan, a Run-bontásban
  ott a `reroll` sor;
- **újratöltés a draft közepén** (5 betöltött poszt): a folytatás után
  `pyrPending` igaz, a draft-képernyő az 5 poszttal jön vissza;
- **újratöltés az osztályválasztón**: `benchCatIndex` marad 4, a pad tele, és a
  folytatás az osztályválasztót nyitja újra (`pyrPickFromDraft` igaz);
- **regresszió — piramis + kész klub**: a Rating-alap/újrapörgetés/családtag/
  VB-EB kapcsolók rejtve, az összefoglalóban nincs Draft-pool és Rating-alap
  sor, a scout-gomb „Irány a klubválasztás →", a lánc scout → klub →
  osztályválasztó (látható „vissza" gombbal) → kémia;
- **regresszió — dinamikus karrier + draft**: scout → ellenféltábla → draft,
  változatlanul;
- **regresszió — klasszikus**: az összefoglalóban a „Draft-nézet" sor, a
  `modeGrid` látszik.

Minden forgatókönyv a várt eredményt adta, `tools/check.sh` zöld.
