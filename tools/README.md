# tools/ — kód-ellenőrzés

A játék egyetlen `index.html`, benne egy ~33 000 soros inline `<script>`
blokkal. Nincs build-lépés, és ez szándékos: a fájl `file://`-ról is megnyílik,
a deploy egyetlen fájl másolása. Cserébe **nincs semmi, ami fordításkor
elkapná a hibát** — pedig a 33 000 sor EGY globális scope-on osztozik.

Ez a mappa ezt a hiányt pótolja, build-lépés nélkül.

## Használat

```bash
./tools/check.sh
```

Kilépési kód `0` = minden rendben. Érdemes minden érdemi szerkesztés után
lefuttatni, és **kiadás előtt kötelezően**.

## Mit néz meg

**1. Szintaxis** (`node --check`) — hiányzó zárójel, elrontott vessző. Ezt a
böngésző is elkapná, de csak futásidőben, a teljes játék megállásával.

**2. Nem létező globális** (`eslint no-undef`) — **ez a fontosabb.** Egy
elgépelt függvény- vagy változónév (`renderMilestone` a `renderMilestones`
helyett) betöltéskor semmilyen hibát nem ad; csak akkor derül ki, amikor a
felhasználó pont arra a gombra kattint. Egy ilyen hiba hetekig lapulhat a
kódban. Ez az ellenőrzés fordítás-szerű hálót feszít alá.

Kipróbálva: egy szándékosan elgépelt hívásra a szkript pontos sorszámmal
jelez, és 1-es kilépési kóddal áll meg.

**3. Nyers játékos- és klubnév** (`tools/nev-audit.js`) — **jogtisztasági
háló.** Az adatbázisban a nevek KANONIKUSAK (a valós játékos- és klubnevek); a
felületre viszont csak a megjelenítési rétegen át kerülhetnek:

| mi | min át |
|---|---|
| játékosnév | `fullName(...)` · `shortName(...)` |
| klubnév (évszámos alakkal is) | `teamLabel(...)` |
| klubnév évszám nélkül | `clubLabel(...)` |
| liganév | `leagueLabel(...)` |

Egy kimaradt burkolás **nem hiba a kód szemszögéből**: a játék fut, a
szintaxis-ellenőrzés és a no-undef is átengedi — csak épp a valós nevet írja ki.
A szkript ezért a *kiírási helyeket* (`esc(...)` és `${...}`) veti össze egy
kézzel karbantartott **névforrás-listával** (`NEVFORRASOK`): ha egy ismert
névtároló kifejezés burkolás nélkül kerül a képernyőre, jelez, sorszámmal.

Ha a hely NEM kiírás — kulcs, keresés, hálózatra küldött adat —, ott a kanonikus
név a helyes. Ilyenkor egy `/* nev-ok: <indok> */` megjegyzés némítja el, a
soron vagy a fölötte lévő **hat** sor bármelyikén (egy több sorra tördelt
sablon belsejébe nem lehet JS-megjegyzést tenni, a jelölésnek tehát a blokk elé
kell kerülnie). Az indok kötelező: az a bizonyíték, hogy valaki tényleg
megnézte. Ugyanaz az idióma, mint a ledger-audit `INDOKOLT` jelölése.

**Új névtároló mező → új sor a `NEVFORRASOK` listába.** A szkript pontosan
annyit lát, amennyit felsoroltunk neki; ez nem bizonyítás, hanem háló.

Egy kivétel: a **`.name` mezőben hordozott név** szabálya *deny-by-default* —
bármi, ami `.name`-en végződik, gyanús, és a `kiveve` mintában felsorolt
fogalmak (képesség, bolti tétel, stábtag-típus, taktika, piramis-osztály)
esnek ki belőle. A név ugyanis nem mindig `.n`: a jutalom-lánc és a díjak
alkalmi objektumokba pakolják `{name, …}` alakban — a „fejlesztés — jutalom"
választója pont ezért írta ki évekig a valós neveket.

**A DOM-ÍRÁS KÜLÖN VAK FOLT VOLT, és ez is valódi hibán derült ki.** Az edző
sorsolásának kártyája így írta ki a nevet:

```js
$("coachName").textContent = c.n;
```

Se `esc(`, se `${` — a háló tehát **rá sem nézett a sorra**, és az edzők valós
neve hónapokig kint volt a képernyőn. A javítás nem egy minta bővítése, hanem
egy hiányzó **kiírási alak** felvétele: a `textContent` / `innerText` jobb
oldala ugyanúgy képernyő, mint egy sablon.

Ebben a szűk helyzetben minden `.n` és `.name` névgyanús — nem csak a
nevesített minták. Máshol ez nem járható: egy általános `.n` szabály a
sablonos kiírási helyekre **155 találatot** adna, azok túlnyomó része
taktika-, képesség- és osztálynév. Ezért az ág CSAK a behelyettesítés nélküli
DOM-írást nézi (ahol a jobb oldalon van `${` vagy `esc(`, ott a sablonos út
dolgozik, a maga pontos mintáival) — így ma összesen négy ártalmatlan sor
kért `nev-ok:` jelölést.

### A háló másik fele: `tools/nevek/kepernyo-proba.js`

A `nev-audit.js` a KÓDOT nézi. Két dolgot elvileg sem tud megfogni:

1. **Ami nem kiírás, hanem ÁLLAPOT.** Kész klubbal indulva a `teamName`
   *változó maga* kapta meg a klub kanonikus nevét — onnantól hatvan helyről
   íródott ki, mindegyik szabályosan, `esc(teamName)` alakban. A kód
   hibátlan volt; a képernyőn mégis „IFK Göteborg" állt a fejlécen, a
   tabellán, az eredményjelzőn és a meccs-statisztikában is.
2. **Ami csak egy útvonalon jön elő** — egy kártya, egy ablak, egy ág.

Ezért van egy **végponti próba**: saját statikus kiszolgálót indít, Chromiumban
végigjátssza a karrier-indítást (kész klubos ágon) és egy teljes mérkőzést, és
lépésenként megnézi, szerepel-e a képernyő szövegében a `HU_NAME_TABLE` /
`HU_CLUB_TABLE` / `HU_LEAGUE_TABLE` bármelyik **kanonikus** kulcsa. Ha igen,
megmondja, **melyik DOM-elemben** — nem „valahol az oldalon".

```bash
node tools/nevek/kepernyo-proba.js
```

Nem bizonyítás (nem járja be a teljes játékot), hanem próba — de pontosan azt
az osztályt fogja meg, amit a statikus háló nem lát. Playwrightot igényel,
ezért nem része a `check.sh`-nak; **kiadás előtt viszont futtatandó** (lásd a
kiadási ellenőrzőlistát).

> A régi `tools/nevek/leak.js` ugyanezt a célt szolgálta, de egy
> `release-sim.html` nevű fájlt vár, ami nincs a repóban — a képernyő-próba a
> működő utódja.

Külön is futtatható:

```bash
node tools/nev-audit.js
```

## Amit szándékosan NEM néz

Stílust, formázást, `no-unused-vars`-t. A kód saját, tömör formázási nyelvet
beszél, és a hosszú magyarázó kommentárok is annak részei — egy „javítsd meg a
stílust" futtatás több kárt okozna, mint hasznot.

## ledger-audit.sh — az idény-mérleg őrszeme

```bash
./tools/ledger-audit.sh
```

A büdzsé **két kapun** mozoghat (`budgetPay` / `budgetEarn`), különben az
idény-mérleg és az egyenleg szétcsúszik. Ez a szkript két olyan hibát kap el,
amit a `check.sh` nem tud — mindkettő szintaktikailag hibátlan, és mindkettő
NÉMÁN hamis mérleget csinál:

1. **könyveletlen írás** — közvetlen `S.transferBudget=` a kapuk mellett;
2. **elgépelt kategória** — `budgetPay(x,"sceout")` nem hibázik, csak némán az
   „Egyéb" sorba esik.

A valóban indokolt közvetlen írások az `INDOKOLT` szóval vannak megjelölve a
sorban. Részletek: `docs/idenymerleg.md`.

## A globálisok listája

A `eslint.config.mjs`-ben a böngésző-globálisok **kézzel** vannak felsorolva,
nem a `globals` csomagból jönnek: így a repónak nincs npm-függősége, és minden
felvett név tudatos döntés. Ha egy új böngésző-API-t kezdünk használni
(mondjuk `IndexedDB`), azt oda is fel kell venni — különben a `no-undef`
jogosan tiltakozik.

## pyramid-sim.js — a készülő ligapiramis mérője

```bash
node tools/pyramid-sim.js            # a kalibrációs alapriport
node tools/pyramid-sim.js gaps       # a Rating-különbség hatása egy szezonra
node tools/pyramid-sim.js speeds     # a négy ellenfél-fejlődési fokozat íve
node tools/pyramid-sim.js sweep      # tempó-söprés hangoláshoz
node tools/pyramid-sim.js bands      # mire elég az adatbázis 6 osztályhoz
node tools/pyramid-sim.js world      # a LEGENERÁLT piramis, klubnevekkel
node tools/pyramid-sim.js draft      # mit hoz ki egy súlyozott draft
node tools/pyramid-sim.js league     # a fel-/kiesés élete sok szezonon át
node tools/pyramid-sim.js live       # A TELJES MÓD: fejlődő világ, karrier-ív
```

A `world` parancs **nem másolat**: az `index.html`-ből, a `PYR-BLOKK`
jelölők közül vágja ki a generátort, és azt futtatja — amit kiír, betűre az,
ami a játékban is fut. `seed=…` a világ sorsolásához, `wc=1` a válogatottakkal.

A `live` parancs ugyanígy a valódi kódot futtatja (generátor + fejlődés +
fel-/kiesés), és egy fokozat átlőhető a játék szerkesztése nélkül:

```bash
node tools/pyramid-sim.js live tier=kegyet share=1.30 top=1.55
```

**A JÁTÉKOS-MODELL JAVÍTVA (3.9.38).** A `live` korábban egytagú modellt
futtatott (`PYR_PACE × tempó`), csakhogy a `PYR_PACE` a FEJLŐDÉST méri, a
keret-erőd viszont az igazolásból, az összhangból és a taktikából is nő — és
az a rész a személyes tempótól FÜGGETLEN. A modell ezért kéttagú:

```bash
node tools/pyramid-sim.js live pace=7.0 extra=5.5     # az alapértelmezés
```

Az `extra` egyetlen mért karrierből jön (Csigatempó ×0,56 mellett 9,4/idény
keret-erő-növekedés → 9,4 − 7,0×0,56 = 5,5), ezért felülírható, és a belőle
számolt refTop/refTitle értékek tájékoztató átlagok. A régi, egytagú modell a
legkeményebb fokozatra `refTop: 24`-et jósolt; a valóságban az 5-6. idényre
megvolt az élvonal. Levezetés: `docs/karrier-hagyomanyos-mod.md` 5.3/b.

**Nem a játék része** — tervezési mérőeszköz a `docs/karrier-hagyomanyos-mod.md`
szerinti, együtt fejlődő ligapiramishoz. A bajnoki szimuláció a motor SAJÁT
konstansaival dolgozik (`SIM.K=0.09`, `BASE=1.3`, `HOME/AWAY`), tehát amit
mér, az a valódi játékmenet.

Miért kell: az egész játékmód egyetlen számon áll vagy bukik — azon, hogy az
ellenfelek milyen gyorsan fejlődnek a játékoshoz képest. Megérzésre nem lehet
belőni, mert a gólgörbe exponenciális: a játszható ablak mindössze ±4 Rating.
A `bands` parancs az `index.html` `SQUADS` tömbjét olvassa ki, tehát az
adatbázis bővülésével magától frissül.

Minden paraméter felülírható parancssorból:

```bash
node tools/pyramid-sim.js speeds pace=8 step=2.5 seasons=30 runs=800
```

## szezon-iv-proba.js — a szezonzáró helyezés-grafikon

```bash
node tools/szezon-iv-proba.js
```

A szezonzáró verdikt „A szezon íve" panelje (3.9.37) a `buildLeagueTable(upto)`
PREFIX-tulajdonságára épül: a 7. forduló utáni állásnak a 30. forduló utáni
valódi előzményének kell lennie. A próba ezt méri (determinizmus, a 30. forduló
és a végtabella egyezése, szabályos 1..N rangsor minden fordulóban), plusz a
kiválasztást, a bekötést, a közös karrier néma ágát és a névelőket — és
képernyőképet készít mindhárom témában. Részletek: `docs/szezon-ive.md`.

## kihivas-proba.js — a kihívás-katalógus

```bash
node tools/kihivas-proba.js
```

A 3.9.37-ben átszabott kihívás-típusokat méri: a kivezetettek (`msDone`,
`subGoals`, `tacticLevel`) nem születnek újra, az újak (`msOne`, `subMinutes`,
`subStars`, `defStars`, `tacticMatches`, sávos `renewOld`) igen, értelmes
céllal; a haladás csak a vállalás utáni eseményeket méri; a taktika-jutalom
60→81 és 82→86; rivális nélküli mezőnyben nincs skalp-ajánlat.

A MÁSODIK KÖR a teljes jutalom- és büntetés-készletet méri: mind a 22-t
elsütjük, és megnézzük, hogy a hozzá tartozó ÁLLAPOT tényleg megváltozott-e
(ingyen boost ára 0, tárgyalási sáv, edzés-szorzó, ifi-kapu, ár-padló,
illeszkedés, begyakorlás, sebességplafon, mesterhármas-szorzó, védő-értékelés,
kapus-forma, sárgalap-esély, gyógyítás-zseton, vásárlási kedvezmény —
illetve a szerep-fagy, összhang-lassítás, elidegenedés, skill-zár, edzés-fagy,
tárgyalás-rontás, stílus-képesség és a távozó stábtag). Egy jutalom, ami nem
csinál semmit, rosszabb, mint ha nem létezne. Részletek:
`docs/kihivasok-3937.md`.

## kupa-nev-proba.js — a sorozat rövidítése nem mehet ki a képernyőre

```bash
node tools/kupa-nev-proba.js
```

A 3.9.44-es cserét őrzi: az `EURO_COMPS` **kulcsa** marad `BL` (arra hivatkozik
a mentés, a kvalifikációs tábla, a kupa-kihívás, a Run-mérföldkövek és a
díj-skillek azonosítói), a **kiírás** viszont `KK`, a prózában pedig „kupa".
A lényegi állítás a FORRÁST fésüli át: egyetlen sztring-literálban sem maradhat
önálló `BL` — a kommentek, a puszta kulcs, a CSS-osztálynév és a
`${…BL}` tulajdonság-hivatkozás kivételével. A 3.9.45-től az EL (`OJK`) és a
KL (`KONF`) is benne van — az `EL`/`KL` token ott csak akkor gyanús, ha
sorozat-kód KÖRNYEZETÉBEN áll (szám, szorzó vagy kötőjeles rag követi), mert
nagybetűs kiemelésben a magyar „el" szó ugyanígy néz ki. Így egy jövőbeli új szöveg is
azonnal elbukik, ha visszacsempészné a rövidítést. Részletek:
`docs/ertesitesek.md` 10.

## mp-tempo-jelenlet-proba.js — a PvP tempó, a jelenlét és a bökés

```bash
node tools/mp-tempo-jelenlet-proba.js
```

A 3.9.41-es javításokat méri: a 3 perces ablak számlálója ONLINE társ mellett
is fut (korábban ilyenkor a fokozat teljesen inert volt), az automatika viszont
csak offline társnál sül el; a tempó-mező írása külön újrapróbát kap és a hibát
kimondja; a jelenlét-bejelentkezés szívveréssé vált (korábban szobánként
egyszer futott, az onDisconnect viszont minden szakadásnál offline-ra írt); a
bökés-gomb a „nem tudjuk" állapotban is megjelenik; és a túloldali `waitAt`
jelzésből a társ órája visszaszámol. A szabályfájlt is ellenőrzi.

Emellett a beváró képernyő FEJLÉCÉT is (3.9.42): kupa-párharcban a sorozat és a
kör nevét kell kiírnia (`KUPA · NEGYEDDÖNTŐ · VISSZAVÁGÓ` — sorozat-rövidítés nélkül), nem a bajnoki
fordulószámot — a bajnokság ilyenkor már lezárult, tehát ott „31. FORDULÓ" állt,
egy nem létező forduló. És a KIÚT-GOMB időzítését (3.9.45): a „megyek tovább"
eddig fix 25 mp után jelent meg a választott tempótól függetlenül — a
párharcnál ez a társ előző keretével AZONNAL lejátszotta a mérkőzést. Plusz
a tabella-kiút, ami a feliratával ellentétben nem tette el a helyi tabellát,
ezért a várakozás újraindult. Részletek: `docs/ertesitesek.md` 7-9. és 11.

## mp-kozos-beallitas-proba.js — a közös karrier beállítói

```bash
node tools/mp-kozos-beallitas-proba.js
```

A 3.9.40-es javításokat méri a KÖZÖS karrier beállító képernyőjén: a kezdő
csapaterő csúszkája draftnál eltűnik (nincs klublista, amit szűrne), a mérce
ilyenkor az osztály nyers közepe + a draft-prémium, a vendég zárlistája teljes
(a régi lista a 3.5.19-ben MEGSZŰNT `#pyrBandMin`/`#pyrBandMax`-ot nevezte meg,
a valódi csúszka nyitva maradt), az ikon-sűrűség a negyedik világ-tengely lett
(utazik, rögzül, régi szobát nem ír felül), és a draft-ág közös karrierben nem
nyitja meg az egyjátékos osztályválasztót. Részletek:
`docs/kozos-vilag-tengelyei.md` — „A negyedik tengely és a lyukas zár".

## pyr-szuperliga-proba.js — a piramis fölfelé is nő (D0, D−1, D−2 …)

```bash
node tools/pyr-szuperliga-proba.js
```

A 3.9.39-es **szuperligákat** méri: a legfelső osztály megnyerése új osztályt
nyit fölötte, a végtelenbe. A legfontosabb állítás az AZONOSÍTÓK sértetlensége
— a D1 marad D1, csak az indexek csúsznak (`idx = id − 1 + above`) —, mert
ezen áll a naplód, a fejlődés-mérőd és a kezdő osztályod visszamenőleges
érvényessége. Emellett: a kapu, az új osztály szintje és a meglévő lépcső
érintetlensége, a mezőny épsége, a feljutás a szokásos úton, az ütem levágása
a szuperligákban, a régi mentések változatlansága, és a **BL padlója**
(D1 + 2, amíg nem vagy az élvonalban). Ez a próba fogott meg egy valódi hibát:
a `pyrMyDivId()` `||`-os alapértelmezése a D0-t hamisnak látta, és a feljutó
játékost a legalsó osztályba tette. Részletek:
`docs/karrier-hagyomanyos-mod.md` 13.

## pyr-fokozat-proba.js — az ellenfél-tempó létrája és a futó karrierek védelme

```bash
node tools/pyr-fokozat-proba.js
```

A 3.9.38-as **újraszabott fokozat-létrát** méri (az alsó két fok változatlan, a
`tarto` a régi legkeményebb 0,88/0,98, fölötte 1,30 → 1,75 → 2,30), és — ami
fontosabb — a **verziókaput**: egy `sv` jelző nélküli mentés (minden 3.9.38
előtt indult karrier) betűre a RÉGI ütemet kapja, egy `sv:2`-es az újat. Ez nem
elmélet: a `pyramid-sim.js` elsőre pont ezért mérte a régi számokat. Részletek:
`docs/karrier-hagyomanyos-mod.md` 5.3/b.

## pyr-hangolas-proba.js — a hangolás (a beragadás mentőöve)

```bash
node tools/pyr-hangolas-proba.js
```

A 3.9.38-as **hangolást** méri: a kaput (csak beragadás után, csak ha lefelé
visz), a mércét (a meccs-erő és a keret-erő számtani közepe — két futás, morál
20 és 95, hogy lássuk: a rejtett bónusz KIESIK), a hatást (mind a hat osztály
együtt mozdul, a lépcső nem csúszik szét, a kereted érintetlen) és az árat
(szorzós: 90 → 81 → 72,9). Fontos fixtúra-részlet: a kezdő 11-et be kell tenni
a `drafted`-be, különben a piac-eltolás a saját keretedet is átskálázza — a
valódi játékban minden leigazolt játékos bekerül. Részletek:
`docs/rajt-nehezseg.md` 6. fejezet.

## lepcsok-proba.js — 🪜 Lépcsők a csúcs felé (a feloldás-rendszer)

```
node tools/lepcsok-proba.js
```

Élő böngészőben méri az egyjátékos feloldás-rendszert, `localStorage`-ba
írt naplóval (`30-0-unlock-v1`): a három kezdő lépcső **presetjét** (mind a
tizenkét beállítást lépcsőnként), a beállító képernyő **zárait** (mi tiltott és
mi nem — a felállás például MINDIG a játékosé), az **üdvözlő ablakot** (csak
egyszer jön, és a karrier csak utána indul), a kezdőlap kapuit (a lépcsőn nincs
útválasztó; a dinamikus karrier az 5. címig zárva), a **feloldás-ablakok**
sorrendjét, valamint a gyűjtő számlálókat (ikon, nemzeti válogatott, képesség)
és a Run-ból származtatott fokozat-/tempó-/stílus-kapukat. A 2. fázisból: az
egyes választások **kapuit** (Rating a szezonban, kártyánként lutri, kész klub —
mikor nyílnak, és visszakapják-e az eredeti feliratukat), valamint az
osztályválasztó **mélység-zárait** (D4/D5/D6, az ajánlással és a megerősítéssel
együtt). A 3. fázisból: a Run-szint szerinti ellenfél-fokozat- és
tempó-kapukat a felületen, a csapatstílusok kapuit, a Panzer
jellemvonás-számlálását, és a **„már kinyitottad" jóváírást** (amit használtál,
az a Run-küszöb alatt is a tiéd marad; amit nem, az zárva). A 4-5. fázisból: a
gyűjtő kapukat (ikon-sűrűség, nemzeti válogatottak, realisztikus képesség-mód —
a feliratuk a saját állásukat mondja: „még 6 hiányzik (14/20)"), és a **haladás
panelt**, ahol külön állítás mondja ki, hogy a panel minden sora UGYANAZT
válaszolja, amit a felület kapui.

A 6. fázisból: a lépcső osztály- és mezőnyszint-döntését (a `#scPyrDiv`
képernyőn egyetlen választó sem maradhat), a „legalább kettő" rejtési küszöböt
minden rácsra, és egy **végigvitt** állítást, ami a `beginNewGame` +
`pyrConfirmDiv` teljes útján ellenőrzi, mit kap ténylegesen a karrier.

Külön szakasz méri, hogy a rendszer **PvP-re semmilyen hatással nincs**: a napló
szándékosan üres (0 cím, 0 Run) — egyjátékosban minden zárva volna —, és a próba
végigmegy a rácsokon, a kapukon, az osztályválasztón és a beállító képernyőn,
majd azt is, hogy a feloldás-ablak nem ugrik fel, de a számláló gyűlik, és a
félretett ablak a kezdőlapon jön elő.

**Portütközés:** a próba a 8961-es porton szerver; ha egy korábbi futás
összeomlott, a `python3 -m http.server` folyamat ottragadhat, és a következő
futás `EADDRINUSE`-szal áll meg. Ilyenkor `pkill -f "http.server"`.

**Fixtúra-buktató, amibe már belefutottunk:** a `careerPool` modul-szintű
`let`, tehát a `page.evaluate`-ben **bare** névvel kell írni — a
`window.careerPool=…` egy MÁSIK objektumot hoz létre, és a próba csendben
nullát mér. Ugyanígy a Run-ranglista **nyers tömb**, nem `{v,list}`.

Részletek: `docs/lepcsok-roadmap.md`.

## boost-kedvezmeny-proba.js — ⚡ a kezdő idények boost-ablaka

```
node tools/boost-kedvezmeny-proba.js
```

Méri a kedvezmény mértékét idényenként (1. −50%, 2. −33%, 3.-tól semmi), hogy
mind a hét boostfajta árát arányosan viszi-e le (az egység alapárán ül), hogy a
két kedvezmény **szorzódik** és nem megy a 0,10-es padló alá, a napló-bejelentés
két pontját (idényenként egyszer), a HUB-gomb és a Boost-központ feliratát, a ⚡
jelzést a HUB-on, a lépéssor **élő** számait, és hogy közös karrierben ugyanúgy
él — ez nem feloldás-rendszer.

**Két fixtúra-buktató:** a jelzés-motor csak bekapcsolt vezetéssel szól
(`teachSetMode("hard")`) ÉS csak a drafton kívül (`phase="hub"`), a boost-árak
pedig a klub éves bevételéből jönnek — egy üres vázlat-karrierben az a padlón
áll, és ott a 100 Ft-os kerekítés elnyomná az arányokat.

## arculat-proba.js — 🛡️ az arculat láthatósága és a meccs alaptempója

```
node tools/arculat-proba.js
```

Két dolgot mér. Egy: a közvetítés **alap-tempója 0,25×** friss telepítésen (a
csúszkák, a felirat és a tényleges ütem is), de a **már beállított érték
túléli** — a kapcsoló csak az alapértelmezést mozdítja el, senki beállítását nem
írja felül. Kettő: az **arculat** eljut-e oda, ahol látszik — a címer-SVG kapja-e
meg a fényt, a mélységet és a belső keretet (és a `flat:true` elhagyja-e mind a
hármat, változatlan formával), a klub-banner viseli-e a nevet, a stadiont és a
két klubszínt, ott van-e a HUB tetején és a bajnokavatás képernyőjén, és hogy az
eredményjelzőn **csak a te oldaladon** áll jelvény — oldalcsere után is (a
`sbFitTeams` gyorsítója különben odaragasztaná, mert a kulcsa nem tud az
oldalról).

## grafika/render.js — 🎨 a Play áruházi grafikái

```
node tools/grafika/render.js
```

A Play **funkciógrafikája** (1024×500) az egyetlen kötelező grafikai elem,
amit nem lehet a játékból kifényképezni. Ez a szkript **előállítja**: a
`tools/grafika/feature-graphic.html` a játék saját betűivel (`/fonts`), saját
színeivel és saját ikonjával rajzolja meg, a render pedig pontos
pixelméretben menti (`deviceScaleFactor:1` — a Play nem retinát vár).

**Miért kódból, és nem egy grafikai eszközből:** így a kép a játék arculatát
követi. Ha a színek vagy a betűk változnak, a kép egy paranccsal
újragenerálható — nem avul el egy külső eszközben ottfelejtett fájlként.

**Egy buktató:** a `font-display:block` miatt a szöveg addig láthatatlan, amíg
a woff2 meg nem érkezik, ezért a render megvárja a `document.fonts.ready`-t.
Enélkül üres képet kapnál.

## ifi-elorejelzes-proba.js — 🔮 az ifi felajánlásába épített kilátás

```
node tools/ifi-elorejelzes-proba.js
```

Azt méri, amit egy ifi felajánlásakor a játékos LÁT: hány szezonra előre
mutatja meg a game a fiatal várható ratingjét és POT-jét, mihez méri, és
hogy ugyanaz a srác nem kopogtat-e be kétszer egy szezonban.

**A legfontosabb állítása** az, hogy az előrejelzés és a valóság UGYANAZT a
számtant futtatja. Az `academyMatchStep()` és a `careerAgeStepCore()` azért
külön függvény, hogy a jóslás ne egy második, párhuzamos képlet legyen: a
próba lejátszik egy szezont élesben, előrejelez egy szezont, és a kettőnek
kor–rating–POT hármasban egyeznie kell. Ha valaki holnap a fejlődési görbén
igazít, de csak az egyik helyen, ez a sor pirosodik ki.

**A mérce a LEGJOBB 11**, nem a felállított kezdő tizenegy — és nem a keret
átlaga. A próba direkt olyan keretet állít, ahol a kettő eltér (a legjobb 11
átlaga 85.7, a pályára küldött tizenegyé 70), és megnézi, melyik szám kerül
a fejlécbe. Ez azért fontos, mert a felajánlás pillanatában egy taktikai
kísérlet vagy egy sérüléshullám nem torzíthatja el azt, amihez a fiatalt
hasonlítod.

**Az egy szezon = egy ajánlat** szabályt a `rec.offerSeason` bélyeg tartja: a
próba ugyanabban a szezonban sokszor kéri a visszatérőt, és azt várja, hogy a
már felajánlott név ne jöjjön elő újra; a szezonváltás után viszont igen.
A ballagás (`ACADEMY_GRADUATE_AGE`) ettől függetlenül garantált marad.

**Amit a jóslás szándékosan NEM tartalmaz:** kupameccseket, boostot és
szerencsét. A POT-ugrás a valóságban dobókocka (`ACADEMY_POT_CHANCE`), az
előrejelzésben a várható értéke — így a szám determinisztikus, és inkább
alálő, mint ígérget. A felajánlás alján ezért áll ott, hogy ez nem ígéret.

## lepcso-mezony-proba.js — 🪜 a lépcső rögzített mezőnye

```
node tools/lepcso-mezony-proba.js
```

Egyetlen kérdést mér, öt kereterővel: a lépcső **ott hagyja-e a mezőnyt**,
ahol ígérte. A bejelentés szerint nem hagyta ott — „2. lépcső: rögzített
80-as mezőny… amint indítok, felveszi a tempót velem a koma, és feljön
84-esre, mert én 85-ös csapatot építettem".

**A mérőfej trükkje:** a kezdőrúgás horgonya a `teamMatchStrength()`-et
olvassa, ezért a kereterőt egyetlen számmal állítjuk be (78, 82, 85, 88, 92),
és minden méréshez **friss világ** épül a rendes úton (`beginNewGame` →
`renderPyrDivPick` → `pyrConfirmDiv`). Így a próba nem a képernyőt nézi,
hanem azt, mi történik a világgal.

**A legfontosabb sora nem a javítás, hanem ami VÁLTOZATLAN.** A szabad
karrierben a mezőnynek KÖTELESSÉGE követni a keretedet — ott a rést vállalod,
és a horgony épp azt váltja be. A próba ezért külön ágon méri a 3 címmel
induló, szabad karriert, és azt várja, hogy ott a 78→78, 85→85, 92→92 sor
kijöjjön. Egy „javítás", ami ezt is kilapítja, itt bukik el.

A harmadik ág a közös karrier: ott a kezdőrúgás horgonya az első sorában
kiszáll (a `pyrAnchorShared` dolgozik helyette), tehát a mezőny mozdulatlan.

Mellékesen azt is méri, hogy a **rés a kereteddel nő** (`gap0`: −2 → +12) —
ez a javítás másik fele. A fölényt te építed; a Run-plafon pedig továbbra is
valódi rést mér, csak a kezdőrúgáskor mértet. Részletek:
`docs/rajt-nehezseg.md` 7. fejezet.

## csucs-alap-proba.js — ⭐ a rating–POT–életkor hármas a csúcs-alapon

```
node tools/csucs-alap-proba.js
```

A **teljes adatbázison** mér (3439 játékos, 4626 kártya, 319 klub), nem
mintán — a kérés is a teljes adatbázisra szólt.

**Az első három állítás magát az ELVET őrzi:** egy seedhez pontosan egy Messzi
tartozik, bármelyik klubból nyitod ki; az az ember a LEGJOBB kártyája; és az
egyben a LEGERŐSEBB instantja is. A harmadik azért külön sor, mert a kód nem
generálja le mind a hány instantot, hogy aztán a legerősebbet válassza — a
legmagasabb kártya-Ratingű megjelenést veszi. A kettő egyenértékű (a POT a
kártya Ratingjében monoton), de ez nem magától értetődő, ezért a próba a
játékos **minden** kártyájára lefuttatja a számolást és összeveti.

**A legérdekesebb állítás viszont a korokról szól.** Az adatbázis 65%-ánál
ismerjük a születési évet, 35%-ánál nem — ott a kor becslés. A próba a két
csoport kor-eloszlását **egymáshoz** méri: a torzítás 0,5 évnél kisebb kell
legyen, és a mediánnak meg a két szélső tizednek egyeznie kell. Ez fogta meg a
régi becslés hibáját is: az a 2240 ismert eseten +2,0 évvel öregebbnek mondta a
játékosokat a valóságnál, mert a „Ratinggel összeférő sáv" egy csúcskártyán a
26-30-as platóra szorul, miközben a valós csúcskorok 31%-a 24 év alatt van.

A 15%-os POT-rátétet is a teljes adatbázison ellenőrzi (arány 1,150 ± 0,005),
és külön azt, hogy **a csúcs is követi** a megemelt POT-t — enélkül a scout
nagyobb számot mutatna, a játékos viszont ugyanoda nőne fel. A Ratingnek
eközben egyetlen játékosnál sem szabad elmozdulnia.

Két regressziós ág zárja: a szezon-alap mind a 4181 klub-kártyáján változatlan
POT-t ad, és kétszer hívva minden bitre ugyanaz. Részletek: `docs/csucs-alap.md`.

**Egy fixtúra-buktató, amibe elsőre beleestem:** a `cardBasisOn()` a
`gameMode`-ot is nézi. `gameMode="career"` nélkül a `careerDraftPlayer` a
kanonikus pool-bejegyzést adja vissza, és a próba a semmit méri — zölden.

## jellem-proba.js — 🙂 a három jellemtengely és a morál-smiley

```
node tools/jellem-proba.js
```

25 állítás. A karizma (7 fokozat), a kapcsolódás (9) és a vérmérséklet (9)
átállása után azt méri, amit a kérés utolsó mondata kért: *„ahol több
tulajdonságszintet soroltam mint amennyi régen volt, ott integráld az új
szintekhez tartozó változókat a rendszerbe."*

**A két legfontosabb sora arról szól, ami NÉMÁN tört volna el.** A régi kód
két módon kötődött a fokozatok SZÁMÁHOZ: hard-kódolt küszöbökkel
(`aggroI>=3` az ötös skálán a felső kettő volt, a kilencesen már a nyugodt
felet is elkapná) és ÖTELEMŰ súlytömbökkel (`[0.2,0.5,1,2,3][aggroI]` — a
hatodik fokozattól `undefined` → `NaN` → nulla súly, vagyis a legforróbb fejek
egyáltalán nem kapnának piros lapot). A próba ezért külön állítja, hogy
**minden fokozatra véges, pozitív, monoton növő** a lap-súly, és hogy a
**végpontok meg a közép betűre a régiek** (0,2 · 1,0 · 3,0).

**A sávok népessége is állítás, nyolc sorban.** A skála finomabb lett, de a
keret összetétele nem változhat: a próba a teljes adatbázison méri, hogy a
„vezéralkat", a „forró fej" és a többi hat sáv aránya ±3 ponton belül maradt
a régihez képest. Enélkül a felbontás növelése csendben nehézséget állított
volna.

Emellett: a kapitány-pontszám monoton a karizmában és a forró vérmérséklet
**csak levon**; mind a 10 smiley-fokozat elérhető a jellemből, és az öltözői
események tényleg mozdítják (de ±0,8-nál megállnak); mind a 17 öltözői
esemény kiválasztható a megfelelő kerettel; a régi mentés szélsőségei
szélsőségek maradnak; és sehol nem maradt `leadI`/`coopI`/`aggroI` mező.
Részletek: `docs/jellem-es-moral.md`.

## kommentar-ikon-proba.js — 💬 a közvetítés típusjelei

```
node tools/kommentar-ikon-proba.js
```

A napló szürke sorai kis ikont kapnak a perc után (🧤 védés · 🛡️ blokk ·
🥅 kapufa · ↗️ mellé · 🚩 pontrúgás · 👟 kidolgozás · ⚪ tizenegyes ·
📺 VAR · 💢 összecsapás · 🎯 lövés). Az ikon **nem a hívási helyeken**
születik, hanem egy besoroló függvényben, a kész sor szövegéből — különben a
következő új kommentár-mondat némán ikon nélkül maradna.

**Ennek az ára, hogy a próbának a FORRÁSBÓL kell dolgoznia.** Két helyről
szedi össze a sablonokat: a `pickTxt([...])` tömbökből (a közvetítés zöme) és
a perc-bélyeggel induló, `m ev` osztályú `addLine`-hívásokból (az egyedi
pillanatok), majd mindegyiket átfuttatja az élő besorolón. Ha valaki holnap ír
egy új mondatot, és az egyik mintára sem illik, ez a sor pirosodik ki.

**Három hibát fogott meg már az első futáson**, és mindhárom néma lett volna:

* a *„BRAVÚR! … tolja **szögletre**"* sor pontrúgás-jelet kapott, pedig az
  kapusvédés — a szöglet csak a következménye. Innen a szabály: a besorolásban
  a **kimenetel erősebb, mint az eredet**;
* a saját `↗️` jelünk (U+2197, a NYILAK blokkból) kicsúszott a kézzel írt
  emoji-tartományból, ezért egy kétszer feldolgozott sor **két ikont** kapott.
  A tartomány helyére `\p{Extended_Pictographic}` került, az idempotencia-fék
  pedig magát a jelölőt nézi, nem a szöveget;
* az „összecsapás" kategória üresen maradt — nem a kategória volt fölösleges,
  hanem a merítés hiányos: az a sor nincs `pickTxt`-ben. Ettől lett a
  forrás-bejárás kétágú.

Emellett azt is állítja, amihez **nem** szabad nyúlni: a perc-bélyeg nélküli
sorok (szezon-összegzők, piramis-jegyzetek — ugyanaz az `ev` osztály, de nem
események), a saját hangulatjellel induló sorok (🌀 tiki-taka, 🔥 a padról), és
a hangsúlyos osztályok (gól, lap, élet), amiknek már van saját jelük.

## szezonzaras-lezaras-proba.js — 🏆 a szezonzárás kapuja

```
node tools/szezonzaras-lezaras-proba.js
```

A közös karrier szezonzárásánál a határidő után **nincs továbblépés** — csak
egyetlen dolog nyílik ki: lezárhatod a párharcot azzal, hogy te nyertél, mert a
társad nem ért ide időben.

**Miért kell rá külön próba.** A nyolc várakozó kapu EGY rétegen osztozik
(`mpSoloArm`/`mpSoloOffer`), és a kiútjuk lágy: a saját eredményemmel megyek
tovább, a társad karrierje sértetlen. A szezonzárásé most már nem lágy — a te
oldaladon LEZÁRJA a közös karriert. Egy ilyen kivételt könnyű elrontani a közös
rétegen, ezért a próba **mindkettőt** méri: hogy a szezonzárás kapuja sosem lép
magától (Villám módban sem) és megerősítést kér, ÉS hogy a többi kapu
továbbra is automatikus és továbblépést kínál.

A lezárás útját végigviszi: a győzelem könyvelve a szezonra szólóan, a közös
karrier leválik (`h2hRoomActive()` hamis lesz, tehát a `finish()` nem áll meg
újra ezen a kapun), a szezonzárás folytatódik a jelentés felé, és a mentés
viszi. Részletek: `docs/kozos-karrier-szezonzaras.md`.

## szezonzaras-or-proba.js — ⛔🏆 a szezonzárás őre és a két kupa

```
node tools/szezonzaras-or-proba.js
```

17 állítás, két bejelentett hibára — ugyanaz a rendszer sérült mindkettőben.

**Az őr.** A szezon 8. fordulójánál egy ottragadt `hubreport` fázis a HUB
gombjának az „Irány a pályára →" szerepet adta, és az a szezon KÖZEPÉN
indított új idényt (öregedés, fel-/kiesés, kihívás-bukás). Ezt egyszer már
javítottuk — a `hubNextSeasonFlow()` elején —, csakhogy a gomb HÁROM kezelőt
kaphat, és a zár csak az egyiken ült. A próba ezért mind a három romboló
műveletet (`hubShowSeasonReport`, `beginNextSeasonWithChallenges`,
`startEuroCampaign` üres ága) külön futtatja le a 8. fordulónál, és azt méri,
hogy a szezonszám és a fordulószám **egyáltalán nem mozdul** — plusz hogy a
beragadt fázis meggyógyul, és lezárt szezonban mind a három átenged.

**A két kupa.** Az „Fából készült Kupa után jöjjön a BL" két külön okból nem
működött: a lánc `pyrOn()`-nál azonnal visszafordult (a piramis viszont pont
az a mód, ahol az FA létezik), a tartalék-út pedig — a „következő idényre
szóló" nevezés — a következő szezon `finish()`-ében némán felülíródott a
bajnoki helyezésből járó indulással, MIELŐTT a kupa lejátszódott volna. A
próba mind a négy osztályra és a sík módra megnézi, mit ad a lánc, és külön
méri, hogy a kiharcolt BL túléli a gyengébb helyezést. Részletek:
`docs/szezonzaras-or-es-ket-kupa.md`.

## felderites-kihivas-proba.js — 🔍 „használd fel minden felderítésedet"

```
node tools/felderites-kihivas-proba.js
```

12 állítás egyetlen kihívásra, mert a hibája egy egész típuscsalád
besorolásáról szólt. A `looksSpent` az ÁLLAPOT-kihívások között ült
(`CH_STATE_TYPES`) — azok a mostani helyzetet kérdezik. Csakhogy az
„elfogyott a felderítési keret" nem tartós állapot, hanem pillanatnyi
esemény, amit a következő ablak feltöltése visszacsinál; a besorolástól
viszont se reteszt nem kapott, se korán nem lehetett kifizetni, tehát
KIZÁRÓLAG a határidőnél dőlt el — amikorra a keret újratelt, és elbukott.

**A próba magja nem az, hogy „egyszer igaz volt-e"**, hanem pontosan a
bejelentett sorrend, lépésről lépésre: elfogy a keret → teljesül → AZONNAL
lezár (kikerül az aktív listából, jutalommal) → a keret újratelik → és a
lezárt kihívás teljesített MARAD. Külön ág méri, hogy egy elszállt keresés
visszatérítése a jelet is leveszi — különben egy hibába futott felderítés
„teljesítené" a kihívást. Részletek: `docs/kihivasok-3937.md`.

## stilus-edzok-proba.js — 🎩 filozófus-edző mind a hét stílushoz

```
node tools/stilus-edzok-proba.js
```

10 állítás arról, hogy a tikitaka Guardiolája és a beton Mourinhója után a
többi öt stílus is kap egy **funkcióban azonos** edzővásárlós képességet. A
két kézzel írt `stTrait`-blokk helyére egy tábla (`STYLE_COACHES`) és egy
generátor került — pont az, amit a kód saját 3.7.37-es megjegyzése
előrejelzett —, így a hét sor nem tud szétcsúszni egymástól.

**A próba azt méri, ami egy generátornál elcsúszhat**: mind a hét sor III.
szintű, ára ugyanaz a `[54, 92, 146]`, a taktikaplafon `99 → 99 → 125 → 150`,
az edzőtempó 1. szinttől `1× → 2×`, és az ingyenes szint mind a hétnél
működik. A legfontosabb állítás a **keresztszennyeződés**: csak a `hosszu`
taktikát osztja meg két stílus (bombázók + panzer), és egy Panzer 3. szint
KIZÁRÓLAG a `hosszu`-t viszi 150-re — a `labdatartas` és a `busz` 99 marad.

## kapu-ertesites-proba.js — 🔔 „szólok neki, hogy rá várok"

```
node tools/kapu-ertesites-proba.js
```

22 állítás a szezonzáró döntés-kapujáról, ahol a bejelentés szerint „nincsen
lehetőség arra hogy értesítsük az ellenfelünket arról hogy várakozunk". A
bökés megvolt a játékban — csak a beváró réteghez volt szegezve KÉT ponton: a
gombja abban a rétegben ül, a jelenlét-kör pedig kizárólag addig futott, amíg
az a réteg nyitva volt.

**A próba magja ezért nem a gomb, hanem a KÖR**: zárt beváró réteg mellett is
fut-e a jelenlét, amíg a kapu nyitva (e nélkül a bökésnek a szoba példánya
sincs meg, amiből a társ feliratkozását kiolvasná), és leáll-e, amint a kapu
lezárult. Mellette a doboz mind a négy állapota: az automata jelzés kapunként
csak egyszer megy ki, a fék ideje alatt a gomb nem él és a doboz kimondja,
hogy már szóltunk, az ONLINE társat nem bökjük meg, a feliratkozás nélkülinél
pedig a gomb LÁTSZIK, és megmondja az okot. Külön ág méri a másik oldalt: aki
még nem döntött, látja, hogy rá várnak — de egy régen ottfelejtett jelzés nem
várakozás. Részletek: `docs/kozos-karrier-szezonzaras.md`.

## sztar-utodlas-proba.js — ⭐ ha a sztár elmegy: a trón és az utódlás

```
node tools/sztar-utodlas-proba.js
```

28 állítás a „Sztárom a párom" legdrágább kérdéséről: mi történik, ha a
kijelölt sztár kikerül a keretből. Eddig a válasz az volt, hogy **semmi** — a
név be volt égetve, a szerep pedig némán meghalt vele: a mérföldkövek nullán
álltak, a hírességpont nem gyűlt tovább, a sztárhoz kötött képességek sosem
teljesültek, és a játék egy szót sem szólt róla.

**A próba magja ezért nem a gomb, hanem a néma halál**: kiderül-e a hiány (az
őr minden távozási úton lecsap), áll-e a stílus a hiány alatt (a fa és a
teljesített mérföldkövek megmaradnak), és átveszi-e az utód a szerepet. Külön
ág méri, hogy az ár a TÁVOZÁSKOR dől el, nem a kinevezéskor (60% marad eladás,
85% visszavonulás után), hogy a személyhez szólt alkuk mind elévülnek, hogy a
sztár a keretben LÉVE nem cserélhető, és hogy egy régi mentésben talált hiányzó
sztár átvezetése ingyenes — egy régi kárért nem büntetünk utólag. Részletek:
`docs/sztar-utodlas.md`.

## masodlagos-stilus-proba.js — 🎯 a második filozófia

```
node tools/masodlagos-stilus-proba.js
```

30 állítás a MÁSODIK csapatstílusról. Ez a ház
legveszélyesebb változtatása: a rendszer eddig egyetlen függvénnyel
(`styleState`) válaszolt három különböző kérdésre — mi hat a pályán, melyiket
nézem, és melyik stílusé ez az adat. Egy stílusnál a három egybeesett; kettőnél
szétválik, és minden hívási hely eldöntheti magát rosszul.

**A próba ezért a hármat KÜLÖN méri**: a hatások unióját (mindkét fa képességei
élnek, de a két tár nem keveredik — a `szerepek` kulcs négy filozófiában is
szerepel), a nézet függetlenségét a játékmenettől (a váltás nem mozdít sem a
hatás-listán, sem a hat szezon-szerepen), és az adat gazdáját (a sztár, a
híresség és az alkuk akkor is működnek, ha a sztáros filozófia a MÁSODLAGOS).
Külön ág méri a nehezítést: a másodlagos mérföldköve harmadannyit fizet — a
tempó-szorzó UTÁN, 1 pontos padlóval —, és hogy a pásztázás mindkét táblát
futtatja, egy közös tárcába.

**A kapu (3.9.69) külön ág.** A választás két úton nyílik, és amelyik előbb ér
oda, az nyit: a 3. idény 15. fordulója után, VAGY amint az elsődleges filozófia
eléri a 6. szintet. A próba idény/forduló párokon lépked
(`[[2,10],[3,0],[3,14],[3,15],[3,29],[4,0]]`), és külön méri a szint-utat: 4-en
és 5-ön zárva, 6-on és 7-en nyitva — még a 2. idényben is. Zárt kapunál nem a
„nem" a mérce, hanem hogy a mondat KIMONDJA, mi hiányzik. A két feloldás-kártya
(🏛 elsődleges, 🎯 másodlagos) is itt mérődik: felugrik, és másodszorra már nem.
Részletek: `docs/masodlagos-stilus.md`.

## atviteli-kod-proba.js — ☁ mentés másik eszközre, fiók nélkül

```
node tools/atviteli-kod-proba.js
```

22 állítás az átviteli kódról: a mentés egy 8 karakteres kód alá kerül fel, és
a másik eszközön ugyanazzal a kóddal jön le — e-mail, jelszó és regisztráció
nélkül.

**A próba magja: a felhő NEM KAP KÜLÖN JOGOT.** A lehozott mentés pontosan
abba a kérdező folyamatba fut (`openSaveImportFlow`), amelyik a fájlból
visszatöltöttet fogadja — kóddal sem lehet némán felülírni egy sokszezonos
karriert. Mellette a kód ábécéje (a próba találta meg, hogy az `L` még benne
állt, pedig a hibaüzenet már kizárta), a gzip oda-vissza bitre, a hálózat
nélküli ág kimondott hibája, és két olyan állítás, ami a KLIENST a
SZABÁLYFÁJLLAL veti össze: a méretplafon ugyanaz a két oldalon, és a 24 órás
lejáratot az adatbázis-szabály tartja be, nem a kliens. Részletek:
`docs/atviteli-kod.md`.

## nevmod-boot-proba.js — 🧨 a névmód nem törheti el a betöltést

```
node tools/nevmod-boot-proba.js
```

13 állítás, és egyik sem a névmódról szól: a BETÖLTÉSRŐL. A bejelentés szerint
a profil aljára beírt kulcsszó után „befagy a játék, és onnantól nem működik az
app" — és ez igaz volt, a 3.9.61 óta.

**A ok egy TDZ-hiba**: a `careerPool` modul-szintű `let`, a `natOfName` viszont
föntebb olvasná, és a `typeof` NEM véd a temporal dead zone ellen (ott dob,
nem „undefined"-ot ad). A 3.9.61 filozófus-edző generátora modul-szinten hív
`shortName()`-et: magyarított módban a név a táblából jön és a hívás sosem jut
odáig, valós nevekre viszont lefut — és attól a sortól a fájl hátralévő hatezer
sora nem fut le.

**A próba magja ezért nem a „nincs hiba"**, hanem hogy a fájl VÉGÉN álló
függvények is léteznek — ez az egyetlen jel, ami elárulja, hogy a script
végigfutott. Mindhárom állapotot felhúzza (magyarított, valós, beállítás
nélkül), méri a hét edző rövid nevét (magyar névsorrendnél az ELSŐ szó), és
külön ágon a váltás pillanatát ÉS az újratöltést utána. Részletek:
`docs/nevmod-tdz-hiba.md`.

## harmonia-boost-proba.js — ⚖️🤝 az egyenlítő és a tömeg-boost

```
node tools/harmonia-boost-proba.js
```

18 állítás a Béke és harmónia két új, csoportos boostjáról — és a próba a
SZÁMTANT méri, a bejelentés saját példáival: az egyenlítő 3. szintjén 80 és 120
mindkettője 115 lesz, a tömeg-boost pedig egy +2 Rating / +1800 POT-os tervet 3
emberre így oszt szét: ×1 → +1/+600, ×4/3 → +1/+800, ×5/3 → +1/+1000.

**A három kényes pont külön ágon**: (1) a posztcsoport — a kétlaki (KV+VKP)
ember mindkét körbe befér, a védő és a középpályás viszont nem boostolható
együtt, és a MEGTANULT poszt is számít; (2) az egyenlítő aszimmetriája — aki
feljebb kerül, annál a pályafutás-görbe követi, aki lejjebb, annak a görbéje és
a POT-ja érintetlen marad; (3) az ár féke — szintenként 5/4/3 megy alapáron,
utána a szorzó 2, 4, 8, 16. Plusz: képesség nélkül egyik sem létezik, és a
tömeg-boost az ifire, az öregre és magára az egyenlítőre sosem megy.
Részletek: `docs/harmonia-csoportos-boost.md`.

## panzer-felelem-proba.js — ☠️ fordított jellem, félelem, rettenet

```
node tools/panzer-felelem-proba.js
```

22 állítás a Panzer három új rendszeréről (és az egyenlítő 250 perces
belépőjéről). A filozófia eddig a legkevésbé választott volt; ez a három adja
meg neki a saját gazdaságát.

**A próba a számtant és a HATÁRT méri.** A fordítás két ágát szintenként (a „jó
fej" ember hatás-oldali értéke 0,375 → 0,55 → 0,75, vagyis a 2. szinttől
átfordul pozitívba), és külön azt, ami NEM fordul: a karizmát és a
lapkockázatot. A félelem szint két tényezőjét (a keret negatív jellemei × a
stílus-szint 0,5-től 2,0-ig), a meccsenkénti 10%-os plafont — és hogy aki
eladja a szörnyeteget, annak azonnal esik. A rettenet-tételeket egyenként, a
plafont külön ágon. A Rettegés tíz szintjét, a csapatstílus-szint kapuját (az
1. szint a 4.-en még zárva, az 5.-en nyílik) és a +20-as sapkát, ami akkor is
fog, ha a félelem szint elszáll. Részletek: `docs/panzer-felelem-es-rettenet.md`.

## panzer-nulladik-proba.js — 🛡️ a nulladik szint

```
node tools/panzer-nulladik-proba.js
```

23 állítás a Panzer NULLADIK szintjéről: aki 12+ negatív személyiségvonással
(a vezetői képességet nem számolva) indul, már a legelső szezon előtt
felvállalhatja a filozófiát — de csak három dolgot kap belőle.

**A próba gerince a TAGADÁS.** Egy felvett filozófia a játékban eddig MINDIG
teljes erővel hatott; a nulladik szint az egyetlen kivétel, tehát minden
csatornát külön kell megmérni, hogy tényleg néma-e: a szintet (0 marad), a
hangolást, a képességfát (csak a Fordított jellem vehető), a filozófus-edző
INGYEN járó szintjét (ez a legkönnyebben átcsúszó ág — a szűrő ezért nem a
vásárlásnál van, hanem a hatásoknál), a félelmet, a meccs-ujjlenyomatot és a
barátságos torna Panzer-szabályát, ami HÁTRÁNY: azt sem szabad korán
kiosztani.

A másik fele az idényzárás: ott a felgyűlt mérföldköveknek EGYSZERRE kell
életbe lépniük — a próba azt méri, hogy a klub nem az 1. szintről indul. A
számláló külön ág: a vezetői képesség itt NEM számít, szemben a Panzer
feloldásának 14-es számlálójával — a kettőt a próba egymás mellett méri.
Részletek: `docs/panzer-nulladik-szint.md`.

## panzer-merfoldko-proba.js — 🛡️ a tábla felzárkózása

```
node tools/panzer-merfoldko-proba.js
```

22 állítás a Panzer mérföldkő-tábláját ért 3.9.71-es bővítésről: kilenc új
család, +1113 pont, 996-ról **2109**-re — a mezőny utolsójából az elsője.

**Az első állítás szándékosan ÖSSZEHASONLÍTÓ, nem abszolút.** Nem azt méri,
hogy a Panzer elér-e egy kézzel beírt számot, hanem hogy eléri-e a mezőny
mindenkori legjobbját — így a szabály akkor is érvényes marad, ha bármelyik
másik filozófia táblája változik. Mellette azt is nézi, hogy a pont nem egy-két
nagy tételből jön, hanem SOK LÉPCSŐBŐL (a sorok és a családok száma is).

A többi ág az új számlálókat méri élesben: a sárga lap három szintjét
(karrier · idény · EGY mérkőzés — az utolsó kettőhöz új nyomkövető kellett),
a rettenet-gazdaság két számát, a sérülést, az óriásölést és a Hosszú labdák
ismertségét. Külön ág, hogy az idény sárgája nem esik vissza idényfordulón,
hogy a lépcső tényleg lépcső (az első fokozat befut, a következő nem), hogy a
mérők üres állapoton is számot adnak és nem hibát, és hogy egyetlen `pz_` sor
sem szivárgott át másik filozófiába. Részletek: `docs/panzer-merfoldkovek.md`.

## nyari-kupa-solo-proba.js — 🟠 a nyári torna kiútja PvP-ben

```
node tools/nyari-kupa-solo-proba.js
```

17 állítás arról a 3.9.72-es javításról, ahol a közös döntések kapujának
kiútja HAZUDOTT: a gomb azt írta, „a saját döntésemmel megyek tovább", a
nyári torna viszont `solo:false` tartalékkal hívta — vagyis a kiút mindig a
NEM-et hajtotta végre, akkor is, ha az imént mondtál igent.

**A próba előbb a RÉGI hibát játssza újra** (igen + kiút → elindul-e a
torna), és ellenőrizhetően meg is fogja: a javítás előtti kódon `kampany:0` és
`tovabb:1` jön ki — betűre az, amit a bejelentő látott („a nyár végére ugrott,
semmi kupa").

A másik fele azt méri, ami miatt a féloldalas torna eddig tilos volt: hogy az
egyedül lejátszott torna NEM billenti át a kupa utáni kapu jelzőjét, tehát a
két kliens ugyanazon a döntési rekeszen marad (`s3decision`, nem
`s3decisioncup`). Külön ág a későn érkező társ (ő sem marad ki, de közös
mezőnyt már nem kap), a két indulásmód különbsége, hogy a NEM-ág és az
egyjátékos út változatlan, és hogy egy „nem" továbbra is kizárja a közös
tornát. Részletek: `docs/nyari-kupa-solo.md`.

## pvp-ertesites-proba.js — 💬 játékon belüli értesítés a társnak

```
node tools/pvp-ertesites-proba.js
```

22 állítás a 3.9.73-as csatornáról: ha a társad ONLINE, tíz hangulatjel közül
eggyel szólhatsz neki, és nála felül beugrik egy klasszikus lebegő értesítés.

**Két oldalt mér külön.** A küldőnél a tíz jelet, a kaput (csak online
társnál, saját fékkel) és azt, hogy a csík a 🔔 bökés ELLENKEZŐ esetében
jelenik meg — a kettő sosem látszik együtt. A fogadónál a sáv beugrását (felül,
fixen, becsúszva), a három műveletet (ugrás · bezárás · 15 perces némítás,
ami túléli az újratöltést), és hogy sem a saját, sem a régi, sem a már látott
jelzés nem ugrik be.

**Külön ág a CSATORNA, és ez a legfontosabb állítása.** A jelzés a `h2h` ág
alá megy, nem a `players/$pid` alá: az utóbbi szabálya `$other:false`, tehát
oda új mezőt írni csak frissített, KÖZZÉTETT szabályfájllal lehetne — a ház
visszatérő néma hibája. A próba a `tools/firebase-rules.json`-ből ellenőrzi,
hogy a választott út a MA élő szabályokkal is járható, tehát egy későbbi
szabály-átrendezés nem tudja némán elrontani. Részletek:
`docs/pvp-jatekbeli-ertesites.md`.

## rettenet-meccs-proba.js — ☠️ győzelem erősebb ellen + a meccs mérlege

```
node tools/rettenet-meccs-proba.js
```

15 állítás a 3.9.74-es tételről: a nyers erőben erősebb csapat legyőzése is
rettenetet fizet, a klasszikus óriásölésnél pedig a MECCSEN KAPHATÓ TELJES
pontot.

**A gerince a „mindegy, milyen eseményekre kapott még pontot" állítás**:
óriásölésnél a meccs pontosan a plafont fizeti — üresen is, és tizenkét
eseménnyel is. A skála másik vége ugyanilyen fontos: vereségnél, döntetlennél
és gyengébb ellenfélnél NULLA.

Külön ág a feed: minden HANGOS tétel saját sort kap közvetlenül az esemény
után, a néma tételek (védekező villanás, kezdőrúgáskori fölény) viszont nem —
azokból tucatnyi van meccsenként —, és a meccs végi összesítő az egyetlen
hely, ahol a mérleg teljes (tételes bontás + a plafon szerepe mindkét
irányban).

**És egy ág a BETÖLTÉSRŐL.** A tétel küszöbe az óriásölésé (`MS_GIANT_GAP`),
ami a fájlban negyvenezer sorral lejjebb születik meg: egy modul-szintű
`const` ott a saját TDZ-jébe futna, és megállítaná a teljes script
betöltését — se a `node --check`, se a no-undef nem látja. A próba méri, hogy
a küszöb hoistolódó függvényen át jön, és egyezik a `MS_GIANT_GAP`-pal.
Részletek: `docs/panzer-felelem-es-rettenet.md`.

## varakozo-kepernyo-proba.js — ⏳ a várakozó képernyők nyelve

```
node tools/varakozo-kepernyo-proba.js
```

18 állítás a 3.9.75-ös rendbetételről: a PvP „tempó" sebességgé lett (Laza ·
Tempós · Villám), a lágy kiút felirata nem vált személyt mondat közben, a
kezdőlap-gomb kimondja, hogy a keret MENTVE, és az apró betűs rész egy
ℹ️ Részletek gomb mögé került.

**A legfontosabb állítása FORRÁS-SZINTŰ**: egyetlen `h2hWaitShow`-hívásban se
maradjon `<small>`. A DOM-ból ezt nem lehet megmérni (mind a huszonöt hívás
más folyamat mélyén ül), a forrásból viszont igen — így egy később hozzáadott
képernyő sem csúszhat vissza a régi mintába.

**A színekre külön ág van, és valódi hibát fogott meg.** Az infó-doboz első
változata téma-változókat használt, csakhogy ez a réteg MINDIG sötét
(`#h2hWait` háttere `rgba(20,18,15,.95)`): világos témában az `--ink` majdnem
fekete, vagyis a kiemelt szöveg eltűnt volna. A próba mindkét témában megméri
a tényleges színeket, és állítja, hogy a doboz stílusában egyetlen
téma-változó sincs.

A fokozat-nevekre a mérce az ÖNÁLLÓ „tempó" szó: a „Tempós sebesség" jó, a
„Tempós tempó" nem — a próba regexe ezt a kettőt megkülönbözteti. Részletek:
`docs/varakozo-kepernyok.md`.

## boost-kozpont-proba.js — ⚡ minden boost egy helyen

```
node tools/boost-kozpont-proba.js
```

17 állítás a 3.9.76-os egyesítésről: az ifi- és az öreg-boost saját HUB-gombja
és a „Kihívás-jutalmak" almenü megszűnt, mindkettő a Boost-központ egy-egy
sora lett, és a kihívás-jutalom ott, a katalógus árában látszik (INGYEN).

**A legfontosabb ága a RÉGI HIBÁT méri.** Két külön „ingyen boost" jutalom
létezett: a fajtánkénti (`chFreeBoost`) hatott a katalógus árára, az általános
(`boostTokens`) viszont NEM — annak saját menüpontja és saját képernyője volt,
ahol ingyen ment, miközben a Boost-központ ugyanazt teljes áron kínálta.
Ugyanaz a jutalom két úton, két árral. A próba mindkét zsetont megméri, és azt
is, hogy a szűkebb (fajtánkénti) fogy előbb.

**Külön állítás az ifi-boost árára**, mert az egy önálló hiba volt: a
`youthBoostPrice()` a nyers egységárat adta, megkerülve a `boostPriceOf`-ot —
így a fajtánkénti zseton a katalógusban 0 Ft-ot mutatott, az ifi-panel viszont
teljes árat kért. A próba állítja, hogy a két szám mostantól egyezik.

A többi ág: a menüből eltűnt elemek hiánya, hogy a katalógus sora a saját
paneljét nyitja (azoknak saját jelölt-logikájuk van), hogy a fizetős sorok
továbbra is árat mutatnak, és hogy az „ingyen igazolás" zseton a vételi úton
magától vált be — menü-gomb nélkül is. Részletek:
`docs/boost-kozpont-egyesites.md`.

## edzovaltas-taktika-proba.js — 🎩 az új edző a saját ismertségéről indul

```
node tools/edzovaltas-taktika-proba.js
```

17 állítás a 3.9.77-es javításról. A bejelentés KÉRDÉS volt („a saját
ismertségéről indítja, vagy onnan folytatja, ahol az előző edző szintje
volt?"), és a válasz az lett, hogy ONNAN FOLYTATTA: a `styleCoachTakeOver`
csak az edző-objektumot cserélte, az `S.tactics.levels`-hez hozzá sem nyúlt.
A karrier-INDÍTÁSNÁL ugyanez mindig helyes volt (`initTacticsForCoach`) — az
edzőVÁLTÁS maradt ki az elvből.

**A próba mind a hét filozófus-edzőt végigméri**, és ezzel egy aszimmetriát is
kimond: a „main taktika" HATNÁL a saját első kedvencük, DÁRDAINÁL viszont a
HARMADIK. Nála a kivétel és az alapérték szétválik — a Hosszú labdák 95-ön
megmarad (pedig az ő alapja ott 70), a Kontra viszont 99-ről 80-ra esik. A
kettő nem csúszhat össze, ezért külön ág méri.

Külön állítás a küszöbre: az SZIGORÚAN 80 FÖLÖTT véd (pontosan 80-on nincs mit
megvédeni, az új edző úgyis annyit hozna), és a kódban `TACTIC_START_LIKED[0]`,
nem beírt szám. Végül: a BEÁLLÍTOTT rendszerhez nem nyúlunk (az a menedzser
döntése), aki már az edző, ott nincs átrendezés, és a karrier-indítás útja
betűre változatlan. Részletek: `docs/edzovaltas-es-taktika.md`.




## percbelyeg-proba.js — ⏱ egy esemény, egy perc

```
node tools/percbelyeg-proba.js
```

A 3.9.78 mérése. A bejelentés kettős volt: „5-tel osztható percekben vannak
nagyobb eséllyel az események", és „ugyanabban a percben több esemény is tud
lenni, ami a legrosszabb, hogy több gól is". Ugyanaz a sor okozta mindkettőt.

A próba ELŐSZÖR ÚJRAÉPÍTI A RÉGI SZABÁLYT, és a kettőt egymás mellett méri
4000 vödrön — nem emlékezetből hasonlítunk. A régi `gmin` minden hívásnál új
percet foglalt egy ötperces vödörből, majd a vödör tetejére csonkolt: három
hívásnál 50,2% lett 5-tel osztható (a véletlen szintje 20%), és a vödrök
50,5%-ában ismétlődött egy perc. Az új kódnál ugyanez 23,6% és **0%**.

Amit még mér: hogy a `gmin` MÁR NEM FOGYASZT (húsz hívás egy vödrön belül
ugyanazt adja — ettől nem csúszik szét a naplósor és a mérföldkő-előtag), hogy
utána az ESEMÉNY percét adja vissza, hogy öt esemény öt külön, növekvő percet
kap, hogy az idő SOHA nem lép visszafelé, és hogy a 90 fölötti ág érintetlen
(a „90+N" továbbra is a ráadás saját eloszlásából jön).

A végén ÉLES MÉRÉS: kész klubbal indít egy ligapiramis-karriert, végigjátszatja
a 30 fordulót, és a naplóból olvassa vissza a percbélyegeket. Egy idényen
17,4% lett 5-tel osztható (a vödör ötödik perce a LEGRITKÁBB, nem a
leggyakoribb), és nulla olyan meccs volt, ahol két gól ugyanabba a percbe
esett. Részletek: `docs/percbelyeg.md`.


## kiadas-proba.js — 🏪 kiadás-előtti ellenőrző

```
node tools/kiadas-proba.js
```

**Nem a játékot méri** (arra ott az 59 böngészős próba), hanem azt, amit a
Google Play **elutasít, ha hiányzik**: az adatvédelmi tájékoztató teljességét
(nincs kitöltetlen placeholder, van adatkezelő, e-mail, székhely, jogalap,
felügyeleti hatóság), a manifestet és minden hivatkozott képét, a service
worker előcache-listáját, az assetlinks.json alakját, és az áruházi szövegek
karakterplafonjait. Böngésző nem kell hozzá.

**A leghasznosabb állítása** az, ami a kódot és a papírt ÖSSZEKÖTI: kigyűjti
az `index.html`-ben szereplő külső hosztokat, és megnézi, mindegyik szerepel-e
a tájékoztatóban. Pontosan ez a hibaosztály maradt észrevétlenül a 3.9.22-től
a 3.9.50-ig: a push-értesítések új adatkiáramlást hoztak, a tájékoztató viszont
a 3.9.13-on állt — és ez csak a Play-elutasításnál derült volna ki, hetekkel
később.

**Egy tanulság az első futásból:** a keresést a **kommentek nélküli** kódon
kell futtatni. A kód tele van olyan magyarázatokkal, amik épp azt írják le,
miért NEM hívunk már egy szolgáltatást („korábban a fonts.googleapis.com
töltötte be…") — a nyers szövegkeresés ezekre is rátalált, és a MEGOLDOTT
problémát jelentette hibaként.

Az **assetlinks-ujjlenyomat** szándékosan csak ⚠️ figyelmeztetés, nem bukás:
az érték a Play Console-ból, az első AAB-feltöltés UTÁN derül ki.

## firebase-rules.json — az adatbázis szabályai

A Realtime Database (`magyahok`) teljes szabályfája, érvényes JSON-ként. A
Firebase konzolban a **Realtime Database → Rules** mezőbe illesztendő, majd
Publish.

**A fájl a TELJES fát felülírja** — ezért van benne a `/mp` ág (a „Gyere 1v1!"
szobái) is, nem csak a `/lb` (globális ranglista). Ha csak az egyik részt
illesztenéd be, a másik ág azonnal elnémul.

Mit véd: a gyökér zárva, az `/mp` csak 4 karakteres szobakódra nyílik
(bejelentkezés nélkül, ahogy az MP-kód dolgozik), a `/lb` pedig bárkinek
olvasható, de **kizárólag a saját bejegyzését** írhatja mindenki, séma- és
tartomány-ellenőrzéssel. Részletes magyarázat: `docs/profil-es-ranglista.md`.
