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
