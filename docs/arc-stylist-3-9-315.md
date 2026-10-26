# 🧑✂️🌍 Új frizurák, arcformák, arcvonás-pörgetés és a stylist-mód (3.9.315)

## A kérés

> „tetszene ha lenne mondjuk még ugyanennyi frizura választhatóan, olyan
> frizkókat készíts, amilyenek konkrét legendás vagy mostani top
> játékosoknak is vannak. És arcformákból is legyen még vagy 5 olyan, ami
> erősen eltér ezektől, és még jót tenne neki valami random generátorral
> pörgethető cucc […] az arc forma+orr+szem elhelyezkedés+homlokmagasság+
> archibák együttesen változnak. És ezeket nem lehet külön külön […]
> buherálni, csak ezzel a random generátorral. […] ezt a játékosok alap
> generálásánál is lehetne használnia magának a gépnek […]
> És tök menő lenne, ha lehetne meghívni developereket […] amit ők mentenek
> maguknak globálban, azt a játék visszaolvasva […] mindenkinek […] az lenne
> a globál alapbeállítás […] lehetne ezen egy adott kliensen módosítani, de
> onnantól kezdve az lenne az amire visszaáll, ha az eredetit akarod. […]
> »szutykos stylist vagyok« és akkor minden amit globálra beállítasz,
> automatikusan uploadolódik […], ami aztán naponta egyszer leszoppantódik,
> és beépül a kódba."

## 1. 19 új frizura (összesen 38)

A minták valódi, felismerhető futballfrizurák. A nevük leíró, egyik sem
viseli senki nevét:

| frizura | a minta |
|---|---|
| lófarok | hátul összefogott hosszú haj, oldalt kilóg a copf |
| férfikonty | a fej tetején kötött konty |
| kis copf | rövid haj, a tarkón kis copf (a 90-es évek olasz tízeseinek jegye) |
| félhold | kopaszra nyírt fej, elöl egy háromszögletű hajsziget (a 2002-es vb emlékezetes csatárfrizurája) |
| sörény | óriás göndör sörény a fej körül (a nyolcvanas-kilencvenes évek kolumbiai irányítóinak védjegye) |
| vállig göndör | vállig érő göndör fürtök |
| hosszú göndör | hosszú, hullámzó göndör haj (gyakran fejpánttal) |
| undercut | rövidre nyírt oldal, hátrazselézett tető |
| félirokéz | „faux hawk": középen felállított, tüskés sáv |
| fade göndör tető | felnyírt oldal, göndör tető |
| választott hosszú | középen elválasztott, egyenes hosszú haj |
| dauer | a nyolcvanas évek dauerja, hátul hosszabb |
| lapos tető | „flat-top": egyenesre vágott, magas tető |
| rasztakonty | felkötött raszták, néhány lelógó tinccsel |
| kis afro | kisebb, kerek afro |
| oldalfrufru | oldalra söpört, homlokba hulló frufru |
| vágott minta | felnyírt fej, oldalt beborotvált vonalakkal |
| twist | rövid, csavart tincsek |
| hullámos hátrafésült | hullámos, hátrafésült, a tarkóig érő haj |

**A szerkesztőben** mind a 38 választható. **A pixeles változat** ugyanebből
a rajzból készül.

**Az alapgenerálásban** az új frizurák külön maggal jönnek, így a régi
frizurák sorszáma és választása nem csúszik el:

* a játékosok ~⅔-ánál a régi frizura marad;
* ~⅓-uk kap új frizurát (a haj textúrája szerint súlyozva).

**Kopaszodásnál** a hosszú és nagy volumenű új frizurák maradnak. Az
oldalfrufru, a félirokéz és az undercut a ritkuló hajvonalon rövidre vált,
ahogy a régi frufru is.

## 2. Öt új arcforma (összesen 8)

A régi három (keskeny, átlagos, széles) csak a járomcsont és az állkapocs
szélességét állította. **Az új öt erősen eltér:** a homlok magassága és
szélessége, az áll helye, hegye és szélessége is más.

| forma | jellemző |
|---|---|
| hosszúkás | magas homlok, mélyen ülő hosszú áll |
| kerek | széles, telt arc, rövid kerek áll |
| szögletes | széles, szögletes állkapocs |
| szív alakú | széles homlok és járomcsont, hegyes áll |
| gyémánt | keskeny homlok, széles járomcsont, keskeny áll |

**A tárolás.** A szerkesztő Arcforma sora 8 lépéses; a választás sorszámként
tárolódik (`arcF`). A 3.9.315 előtti mentés (`fejW`/`allW`) továbbra is
működik, és a régi három legközelebbijére olvas.

**A rajz.** A homlok szélessége új paraméter a fej körvonalában. 1-es értéknél
a rajz bitre ugyanaz, mint eddig.

## 3. Az arcvonás-pörgetés

Egy **mag** (`vonas`) együtt sorsolja újra az arc nem szerkeszthető részeit:

* **a fej formája:** a homlok magassága és szélessége, az áll helye, hegye és
  szélessége, a fül; kb. 45%-ban az öt új arctípus egyike, kis szórással;
* **a szem helye:** távolság, magasság, méret;
* **a szemöldök** vastagsága és magassága;
* **az orr** mérete és helye (a típusa szerkeszthető, az marad);
* **archibák:**
  * szemöldök-heg (világos vágás);
  * heg a pofán (öltésnyomokkal) vagy az állon;
  * anyajegy (négy lehetséges helyen);
  * görbe (törött) orr;
  * a két szem enyhe aszimmetriája.

**Külön-külön nem állítható.** A szerkesztőben egy sor van: 🎲 (pörgetés),
a változat jele, ↺ (vissza a név szerintire). A 🎲 Véletlen gomb ezt is
pörgeti.

**Ami szerkeszthető volt, az marad szerkeszthető:**

* frizura, hajszín, bőrtónus, szemszín;
* szemforma, szemöldök-típus, orr-típus, száj;
* arcszőrzet, arcforma;
* a kiegészítők.

A pörgetés ezekhez nem nyúl.

**Az alapgenerálás** is használja. Mag nélkül a NÉV adja a vonásokat
(determinisztikusan, minden gépen ugyanaz), és az új jegyek ritkábban
jönnek:

* arctípus ~22%;
* görbe orr ~10%;
* heg ~10%;
* anyajegy ~16%;
* aszimmetria ~25%.

A pörgetés tágabb tartományban mozog.

**Az edzők kézi portréi** (`EDZO_ARC`) `vonas:-1`-et kapnak, így az új
véletlen jegyek nélkül, változatlanul rajzolódnak.

**Hatás a meglévő arcokra.** A kérés szerint a gép is használja a
generátort, ezért a játékosok egy része **másképp fog kinézni**, mint eddig:

* kb. ⅓-uk új frizurát kap;
* egy részük heget, anyajegyet vagy új arcformát.

A kézzel beállított (globális vagy karrieres) kinézetek nem változnak, és a
közös karrierben mindkét gép ugyanazt látja.

## 4. A stylist-mód és a közös kinézet-lista

### A rétegek, alulról fölfelé

1. a név szerinti, generált arc;
2. **a közös lista (`ARC_ALAP`)**, a stylistok munkája, mindenkinél ugyanaz;
3. a böngésző saját 🌐 globális beállítása;
4. az adott karrieré.

**Az „eredeti" a közös lista.** A szerkesztő Eredeti gombja, a ↺ és a helyi
globális törlése mind oda áll vissza. Helyben bármi felülírható.

### Bekapcsolás

**Hol:** a Profil alján lévő rejtett mezőben, ugyanabban, amelyikbe a névmód
kulcsszava kerül. Ide kell beírni: **`szutykos stylist vagyok`**. A kis- és
nagybetű, valamint a szóközök száma mindegy.

**Mit mutat:** a profil kiírja, hogy a mód él, és van rajta kikapcsoló gomb.

### Működés

**Mentés:** stylist-módban a 🌐 globális mentés (és az „átmentés a
globálisba") a látszó kinézetet feltölti a Firebase `stylist/<uid>/<kulcs>`
ágára:

* a látszó kinézet a közös lista és a helyi beállítás együtt;
* a feltöltés névtelen azonosítóval megy;
* a kulcs a név lenyomata.

**Kapcsolat nélkül** a feltöltés sorba áll, és a következő indításkor megy
fel.

**Törlés:** a szerkesztőben stylist-módban van egy „🗑 Közös kinézet törlése"
gomb is. Ez egy törlés-bejegyzést tölt fel.

### A napi beépítés

A GitHub Action (`.github/workflows/stylist-szinkron.yml`) naponta 03:53
UTC-kor fut (kézzel is indítható). A `tools/stylist/beepit.js` ugyanazzal a
szolgáltatásfiókkal húzza le az ágat, mint a mérési szinkron.

**Mit vesz át:**

* csak a játékban **létező** kanonikus nevet, és csak akkor, ha a bejegyzés
  kulcsa a névből számolt;
* csak az **ismert mezőket**, a saját tartományukban. A szabály magából az
  `index.html`-ből jön (`FACE_MOD_MEZOK`), tehát mindig a játékkal egyezik;
* nevenként a **legfrissebb** bejegyzést, bárkiét. Az üres bejegyzés törlés.

**Hova írja:** az `index.html` két jelölője közé (`ARC-ALAP:KEZD` …
`ARC-ALAP:VEG`), egy játékos egy sor, név szerint rendezve. Ha változott,
commitolja az alapértelmezett ágra. A HTML network-first, így a következő
betöltéskor mindenkinél él.

**Mi nem kerül a repóba:** a feltöltő azonosítója. Csak a kinézet és a
kanonikus név kerül be, a név pedig amúgy is az `index.html`-ben áll. A
kiadási build a nevet a többi névvel együtt fordítja le.

### Biztonság

A kulcsszó a forrásban olvasható, ugyanúgy, mint a névmódé, tehát bárki
feltölthet. Amit át lehet venni, az kizárólag kinézet-paraméter, ismert
mezőben, tartományon belül, létező játékosra. A legrosszabb eset egy csúnya
arc, ami a következő napi futással (vagy egy revert-tel) javítható. Kód nem
juthat be.

## Egyszeri beállítás (a repó gazdájának)

1. **Firebase-szabályok.** A `tools/firebase-rules.json` új `stylist` ágát
   fel kell tölteni:
   * a Firebase-konzolban: Realtime Database → Rules;
   * a teljes fájl tartalmát be kell másolni → Publish.

   Enélkül a feltöltés elutasítva marad. Addig a játék a sorban tartja, és a
   következő indításkor újrapróbálja.
2. **A titok.** A `FIREBASE_SERVICE_ACCOUNT` ugyanaz, mint a mérési
   szinkroné. Ha az már be van állítva, nincs teendő.
3. **A workflow** csak az alapértelmezett ágon (`main`) fut időzítve. A
   fejlesztési ág beolvasztása után él. Első futás: Actions → „Stylist-lista
   beépítése" → Run workflow.
4. **Ágvédelem.** Ha a `main` ágvédett, a `github-actions[bot]`-nak engedni
   kell a pusht, különben a commit lépés elbukik.

## Próba

`tools/arc-stylist-3-9-315-proba.js`, 28 állítás:

* **Frizurák:** 38 frizura, mind más rajz, sima és vastag (pixeles) változat
  is.
* **Alapgenerálás:** determinisztikus; az új frizurák ~⅓-ban jönnek, az
  archibák és az új formák nem mindenkin.
* **Arcformák:** 8 forma, mind más fej; a régi fejW-s mentés a régi formára
  olvas.
* **Vonás-mag:**
  * más mag más vonásokat ad, ugyanaz a mag ugyanazt;
  * a szerkeszthető jegyek érintetlenek;
  * a pörgetések egy része archibát hoz;
  * az edzők kézi portréja változatlan.
* **Szerkesztő:** 🎲, ↺, az Arcforma sor az új formákra lép, és a Véletlen a
  magot is pörgeti.
* **Közös lista:** ez az alap, a helyi felülírja, és az „eredeti" ez.
* **Stylist-mód:**
  * a kulcsszó bekapcsolja;
  * kapcsolat nélkül a feltöltés sorba áll, kapcsolattal felmegy a
    `stylist/<uid>/<kulcs>` ágra, a szabály formájában;
  * a feltöltött tartalom a mentett kinézet.
* **Napi beépítés** (a valódi szkript egy export-másolaton):
  * a legfrissebb bejegyzés épül be, az ismeretlen név és mező kimarad;
  * újrafuttatva nem változtat;
  * a beépített listával betöltött játék ezt használja;
  * a törlés kiveszi a bejegyzést;
* nincs oldalhiba.

**Kapcsolódó próbák:**

* `kinezet-3-9-281`: a frizura-tartomány 0–37; a szerkesztőben 17 sor van (a
  pörgetésé is); az arcforma `arcF`-ként tárolódik;
* `arckep-3-9-267`: a „minden frizura előfordul" ellenőrzés a teljes
  állományon fut, mert a ritka „fonott" egy 400-as mintából 38 frizura mellett
  kimaradhat.
