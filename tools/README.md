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


## legendas-magyahok-proba.js — 🇭🇺 a magyar boost kapcsolója

```
node tools/legendas-magyahok-proba.js
```

A 3.9.80-as kapcsoló mérése. A kérés két hatást mondott ki: a magyar játékosok
kezdő Ratingje sávosan emelkedik (80 alatt 81-85 közé, 80-85 közt +4…+8, 85
fölött +3…+6), és a POT-juk padlója 2200 lesz **minden** Rating-alapon.

A próba a sávokat BETŰRE méri, bemenetenként 600 KÜLÖNBÖZŐ névvel — a szórás
névre seedelt folyamból jön, egyetlen név egyetlen számot adna. Külön állítás a
determinizmusra (ugyanaz a név ötvenszer ugyanazt adja: közös karrierben a két
kliensnek bitre egyeznie kell), a Rating-plafonra, és arra, hogy a boost lefelé
sosem visz.

A POT-padlót mind a három alapon ellenőrzi (csúcs, szezon, lutri) EGY valódi
magyar játékoson, bekapcsolva és kikapcsolva egymás mellett — és arra is, hogy a
`peak` sosem marad a megemelt Rating alatt (különben a következő szezonváltás a
kor-görbe mentén visszahúzná).

A KÉSZ KLUB ZÁRJA két állítás: a kapcsoló rejtve van, ÉS a zár akkor sem engedi
be, ha a localStorage-preferencia bekapcsolva áll — egy beragadt érték így sem
szivárog át.

Végül egy VALÓDI karrier-pool, ugyanazzal a seeddel, be- és kikapcsolva: a 134
magyar minimum Ratingje 56 → 81, a minimum POT 210 → 2200, az átlag 75,5 → 88,5
— miközben a mezőny másik 3338 játékosa betűre változatlan. Részletek:
`docs/legendas-magyahok.md`.


## panzer-lap-proba.js — 🃏 a lap épít, nem rombol

```
node tools/panzer-lap-proba.js
```

A 3.9.85-ös fordítás mérése. A bejelentett ellentmondás az volt, hogy a Panzer
egész gazdasága a lapokból él (rettenet-pont, `pz_ycall`, `pz_ycmatch`,
`pz_redwinN`), miközben ugyanaz a lap a másik oldalon a FORMÁT húzta le.

A büntetés három helyen ült, és a próba mind a hármat külön méri: a
csillagtétel (`mstatRate` → `parts.red`), a „minősíthetetlen" ítélet
(`mstatUnratable`, 25. perc előtti piros) és a fegyelmi visszaesés
(`applyDisciplineDip` → `pOvr` −2). A sárga lapnak eddig SEMMILYEN formahatása
nem volt — erre külön állítás van, mert ott a Panzernél nulláról indul egy
pozitív tétel, nem megfordul egy negatív.

A görbe TÜKÖR: hét percen végigmérve a régi tétel mindenütt negatív
(−2,911 … −1,418), az új mindenütt pozitív (+2,139 … +1,112), és a KORAI lap ér
a legtöbbet — ahogy a büntetés is a koraiért volt a legnagyobb. A Fordított
jellem mindkét tételt ugyanazon a lépcsőn feszíti (×1 / ×1,35 / ×1,70 / ×2,10),
és a filozófia MÁSODLAGOS slotban is számít.

Két állítás a határokra: az öngólból eredő fegyelmi visszaesés Panzerrel is
−2 marad (az öngól nem lap), és lap nélkül a két filozófia értékelése betűre
azonos — a fordítás nem szivárog. Részletek: `docs/panzer-lap-epit.md`.

## pvp-parharc-rendszerek-proba.js — ⚔ ami ki volt véve a párharcból

```
node tools/pvp-parharc-rendszerek-proba.js
```

A párharc eredményét egy KÖZÖS, seedelt eseménylista adja — ettől látja a két
játékos bitre ugyanazt a mérkőzést. Ami helyben sorsolódna, az szétvinné a két
képernyőt, ezért volt kikapcsolva a sárga lap (teljesen), és ezért maradt néma
a megfélemlítés, az emberhátrány-csúszka és a hangsúly-csúszkák egésze. A
3.9.86 ezeket viszi be a listába (v3) és a pillanatképbe.

A próba a szintetikus pillanatképeken méri a szimulációt: 400 mérkőzésen a
sárga lapok száma csapatonként 1,24 (a várt `YELLOW_PER_MATCH` 1,2), minden
második sárgához tartozik egy `y2`-es piros (hogy egy RÉGEBBI kliens is
ugyanúgy tízre fogyjon), oldalanként legfeljebb egy kiállítás van, és az
idővonal monoton.

A VÉLETLEN-FOLYAM a szerződés része, ezért külön állítás: 200 magon nulla
eltérés a régi (mezők nélküli) és a semleges értékekkel kitöltött pillanatkép
eseménylistája között — a `rollYellow` egyetlen `R()` hívást sem fogyaszt, ha
nincs `yellowP`.

Külön ág a megfélemlítés (600 magon 1,372 → 0,712 az ellenfél gólátlaga, a
sajátunk érintetlen), az oldalanként saját emberhátrány-tétel, és a
csúszka-szűrők mind a hat fajtája (`minFrom`, `minTo`, `lead`, `red`, `gaMin`,
`gaMax`) külön-külön.

Végül egy VALÓDI, végigjátszott párharc: kézzel írt eseménylistával (két sárga
ugyanannak az embernek, egy harmadik másnak) végigfut a `playMatch`, és a
napló („MÁSODIK SÁRGA", nem a semmiből jött piros), a lapgyűjtés, az eltiltás
és a kiállítás-számláló mind azt mutatja, amit egyjátékosban mutatna.
Részletek: `docs/pvp-parharc-rendszerek.md`.

## panzer-jellem-fordulat-proba.js — 🔄 a jellem-fordítás két vége

```
node tools/panzer-jellem-fordulat-proba.js
```

A 3.9.88-as javítás mérése. A `traitFlip` minden skálán azt hitte, hogy a nagy
érték a jó — csakhogy a két tengely ellentétes: a kapcsolódásnál a 0 a rossz
vég (szorongó), a vérmérsékletnél az 1 (vandál). A vandál így a „jó fej"
embereknek szánt, a szinttel GYENGÜLŐ ágra került, és a Fordított jellem minden
megvett szintje ROSSZABBÁ tette őt az öltözőben (7/10 → 6 → 6 → 5/10).

A második hiba a 0..1-es vágás volt: a képesség +10/+25/+33%-ot ígér az erősödő
ágon, a szélső embereknél viszont a tükör már a skála végén landolt, és a vágás
pontosan azt nyelte el, amit a képesség elad. A folytonos morál-számítás ezért a
vágatlan alakot kapja (`kapER`/`verER`), a sávindexek a vágottat.

A próba a két tengely polaritását a 0. ÉS a 3. szinten külön méri, mert a
szerződés a kettőn más: nulladikon tiszta tükör, maxon a rossz vég túlfut a
skálán, a jó vég pedig visszafordul pozitívba (ezt ígéri a leírás). Külön
állítás a kemény ember monoton javuló létrájára, a jó fej ember
visszafordulására, az öltözői sávokra (a vandál a hiba előtt maxolt fordítás
mellett is „forró" volt), és arra, hogy Betonnal meg filozófia nélkül betűre a
nyers jellemérték jön vissza.

Végül a teljes mezőny (3609 játékos): az átlagos öltözői fokozat a szinttel
monoton nő (4,97 → 5,83 → 6,33 → 6,76), filozófia nélkül pedig 5,97 — a skála
közepén, nem a szélén. Részletek: `docs/panzer-jellem-fordulat.md`.

## merfoldko-kategoria-jutalom-proba.js — 🗺️ egy egész kategória feloldása

```
node tools/merfoldko-kategoria-jutalom-proba.js
```

A 3.9.89-es jutalom mérése. A hosszú és a kupa-kihívások `msUnstick` jutalma
eddig EGYETLEN beragadt fokozatot fizetett ki; mostantól egy egész
mérföldkő-kategóriát old fel.

Két ága van, mert beragadt fokozat csak MÁR NYITOTT kategóriában létezik (a
zárás alatt teljesült fokozat a MEGNYITÁS pillanatában ragad be): ha van még
zárt kategória, azt nyitja meg ingyen, azonnali fizetéssel; ha már minden
nyitva, a legtöbb beragadtat tartó kategória összes beragadt jutalma folyik be.

A próba a mérföldkő-tábla `p()` függvényeit cseréli, hogy pontosan tudja, mi
„kész", és így méri a kategóriaválasztást (a legtöbb kész fokozat, döntetlennél
a drágább), az ingyenességet (a büdzsé nem mozdul), a nulla beragadást, a
második ág célzottságát (a kiválasztott kategória kiürül, a többi érintetlen),
az üres esetet, és hogy a FIZETŐS megnyitás változatlanul beragaszt.

**Egy csapda, ha hasonlót írsz:** a mérföldkövek küszöbe lehet 0 vagy negatív is
(a nehézség-lépcsők miatt), tehát egy „nem kész" csonknak a küszöb ALÁ kell
mennie, nem nullára. Részletek: `docs/merfoldko-kategoria-jutalom.md`.

## rettenet-skala-proba.js — ☠️ a tarifa a félelem szinttel skálázódik

```
node tools/rettenet-skala-proba.js
```

A 3.9.90-es arányosítás mérése. A meccsenkénti PLAFON a félelem szint 10%-a,
tehát a szinttel együtt nőtt — a TARIFA viszont fix volt (sárga 0,5, piros 2,
meccserő-fölény max 5, …). Egy tipikus Panzer-est 11,3 nyers pontot hozott,
akármekkora volt a szint, így a plafon elszakadt tőle: 2000-es félelem szinten
a hozam a plafon 6%-a volt.

A próba a `fearLevel` kötését cseréli (a `dreadScale` ezen át olvas, tehát a
mérés a valódi úton megy), és tételenként méri: a 100-as szintig BETŰRE a régi
számok jönnek vissza, fölötte pontosan szint/100 arányban nőnek — a
meccserő-fölényt is beleértve.

Külön ág arra, hogy a GYŐZELEM ERŐSEBB ELLEN és az ÓRIÁSÖLÉS nem szorzódik
kétszer: azok már eleve a plafonból számolnak, és a próba szerint minden
szinten pontosan a plafont adják.

Végül a teljes kép ugyanazon a tipikus esten, 50-től 2000-es félelem szintig: a
régi arány 226% → 6%-ra omlott, most 100 fölött állandó 113% — vagyis a plafon
ugyanúgy fog, mint eddig a 100-as szinten.
Részletek: `docs/panzer-felelem-es-rettenet.md`.

## egyenlito-idenykeret-proba.js — ⚖️ az alapáras keret idényenként töltődik

```
node tools/egyenlito-idenykeret-proba.js
```

Tesztelői hibajelentés (3.9.91): „a béke és harmónia féle boost ára nem
nullázódik szezonról szezonra". Igaz volt — az `S.eqBoostsUsed` csak nőtt, a
mentés vitte, és sehol nem nullázódott. A szintenkénti 5/4/3 alapáras darab így
nem idényes keret volt, hanem egy egész karrierre szóló, utána az ár véglegesen
duplázódni kezdett.

A próba méri, hogy az idényen BELÜLI létra változatlan (5/4/3 alapáron, majd
×2 ×4 ×8 ×16), hogy a nyár nyílása nulláz, és hogy ez a nyári átigazolási
keretekkel EGY hívásban történik — a töltés helye szándékosan a nyár nyílása,
nem a szezon indulása, mert a boost-központ nyári szerszám.

Külön ág a régi mentések EGYSZERI pótlására: aki a régi szabály alatt több idény
keretét égette el, egyszer visszakapja (`eqSeasonMig` jelző), egy mai mentést
viszont a pótlás nem nyúl meg. A stub ugyanazt a két lépést járja, mint a
`loadGame` (bulk visszatöltés, majd jelző-vizsgálat), és a próba a FORRÁSSORT is
ellenőrzi, hogy a stub ne csúszhasson el a valóditól.

Végül mind az öt felületi ára-sor: kimondják-e, hogy a keret idényenkénti.
Részletek: `docs/harmonia-csoportos-boost.md`.

## sajat-stabtag-proba.js — 🎓 olcsóbb és gyorsabban érő saját nevelés

```
node tools/sajat-stabtag-proba.js
```

A 3.9.92-es buff mérése: a saját játékosból nevelt stábtag ára a teljes skálán
feleannyi (60/40% → 30/20%, a köztes meredekséggel együtt), a Szakértelme pedig
három összeszorzódó szorzóval épül — +50% alap, +25% a saját posztjához tartozó
segédedzői területen, +33% ott, ahol a mezőnyhöz képest tényleg kiemelkedő.

A gyorsítás a NYERS típus-pontszámon megy, nem a kész Szakértelmen: így a
20-99-es skála teteje és a SZAK 55 pontos maximuma a helyén marad. A próba ezt
külön méri (a csúcsprofil 89-en áll, nem 99-en), és a „kiemelkedő" küszöbre is,
hogy a NYERS pontszámot kapja — a szorzott érték átbillentené.

A küszöb típusonként külön, MÉRT szám (a populáció ~85. percentilise, 1500
profilon). Egyetlen közös küszöb nem működne: a Kesztyűs mester legjobb mért
pontszáma 0,638, a Csapatkovács 75. percentilise viszont már 0,625.

A legfontosabb ág a STÁBPIAC: a próba 300 piaci ajánlatra ellenőrzi, hogy a
Szakértelmük BETŰRE a gyorsítás előtti képletet adja (a piac generátora
visszafelé számol a Szakértelemből, egy szorzó ott a célzott sávot borítaná) —
és fordítva, hogy a saját nevelésé tényleg magasabb, különben a próba egy néma
no-opot igazolna.

Végül 900 valódi pályafutás-profil: a legjobb ajánlat átlagos Szakértelme
54,5 → 72,5, a maximum 77 → 86, és senki nem tapad a plafonra.
Részletek: `docs/szemelyi-edzo-rendszer.md`.

## gegenpressing-proba.js — 🧲 a nyolcadik filozófia

```
node tools/gegenpressing-proba.js
```

A 3.9.93-as új csapatstílus teljes mérése. A Gegenpressing az első filozófia,
ami nem a labdáról szól, hanem arról a pillanatról, amikor nincs nálad — ezért
saját motor-csatornát kapott: a LABDASZERZÉST AZ ELLENFÉL TÉRFELÉN. Ez a
csatorna eddig nem létezett (a motor a szerelést a védekezés-szorzóban rejtette
el), és a stílus egész gazdasága erre ül.

A próba először a REGISZTRÁCIÓT járja végig — a stílus minden táblában ott
van-e (STYLES, filozófus-edző nemzetiséggel, mstat-súlyok 1-re összegezve,
tengely-eltolás, öt rang, feloldási szint, három szerep, öt csúszka) —, majd a
kilenc képességet és a szintjeiket a kimondott számokkal (pressing 2,0/2,8/3,6
meccsenként; büntetés 25%/2, 33%/2, 50%/3).

Külön ág a filozófia ALKUJÁRA („Nem kell nekünk labda"): a próba MINDKÉT felét
méri, mert a kérés épp azt mondta ki, hogy a motorból hiányzik a második — a
birtoklás tényleg lemegy, ÉS az ellenfél gólesélye tényleg felmegy tőle
(+10% / +6% / +2,5%), tehát a magasabb szint jobb üzlet.

A saját skill (Nyomás!) zárolt: a próba ellenőrzi, hogy a fán megvett képesség
NÉLKÜL nincs a pakliban, utána viszont bekerül. Ez nem kozmetika — enélkül más
stílusnál is kihúzhatná a sorsolás, és a jutalom némán elveszne.

A gyilkos páros teljes életciklusa: összeérés a közös mérkőzésekből, a
sebesség kiegyenlítődése a jobbik FÖLÉ, a kölcsönös fejlődés-gyorsítás, és hogy
a pressing-szorzó CSAK akkor jár, ha mindketten pályán vannak.

Végül a legfontosabb ág: Panzerrel és filozófia nélkül minden szám semleges —
az új stílus nem szivárog a többibe. Részletek: `docs/gegenpressing.md`.

## osztalyletszam-proba.js — 🧮 egy elcsúszott osztálylétszám, három tünet

```
node tools/osztalyletszam-proba.js
```

A beküldött mentésben a piramis D1-e **15 világ-csapatot tartott 14 helyett**
(a világ összlétszáma, 94, stimmelt — csak az eloszlás csúszott el eggyel).
Ebből az EGY hibából nőtt ki mind a három bejelentett tünet: a menetrend 32
fordulós lett, a tabella-létszám páratlan (15 + te + a társad = 17), és emiatt
az `aiLeagueSchedule` régi `n%2!==0` kapuja **harminc üres fordulót** adott
vissza — tehát „az ellenfelek pontszámai megszűntek", csak a két menedzser
elleni meccseik maradtak.

A próba előbb reprodukálja a páratlan alakot és kimondja, hogy a RÉGI kapu
pontosan ott ütött be, majd méri az üres helyes (bye) körmódszert: 30 forduló,
egyetlen üres forduló nélkül, minden CPU 24-26 meccsel. Páros mezőnnyel semmi
nem változik.

A `pyrDivSizeRepair` mindkét irányban megy (15/15 → 14/16 és 13/17 → 14/16),
az összlétszámot nem változtatja, idempotens, determinisztikus, és
egyjátékosban más a célszám. Külön állítás mondja ki, hogy hiányzó
világ-csapatot **nem találunk ki**, csak szólunk róla.

Egy külön szakasz **állításként köti le az alapszabályt**: egy osztály 16
csapat, egy szezon 30 forduló — közös karrierben 14 CPU + te + a társad, azaz
14×2 + 2 párharc, egyjátékosban 15 CPU + te, azaz 15×2. Ebből az is
következik, hogy ép világban a tabella-létszám páros, tehát a fenti üres hely
sosem lép működésbe: az háló, nem a normál működés.

**A legfontosabb szakasz a hatodik.** Elkap egy VALÓDI mentés-payloadot,
elrontja pontosan úgy, ahogy a beküldött (32 forduló), és `applySavedGame`-mel
betölti. Ez fogta meg, hogy a 3.9.101 menetrend-helyreállítása az
`Object.assign(S,d.S)` ELŐTT futott — vagyis nem a betöltött menetrenden
dolgozott, és `h2hRoomActive()===false` mellett a párharcokat is kitörölte
volna. A régi sorrenddel a menetrend 32 marad, az újjal 30 lesz. Részletek:
`docs/osztalyletszam-es-paratlan-mezony.md`.

## panzer-sztar-szerep-proba.js — 🛡️⭐ a két hiányzó szereptrió

```
node tools/panzer-sztar-szerep-proba.js
```

Öt filozófiának volt szezon-szerepe, kettőnek nem. A Panzer hármasa ugyanarra
az egy mondatra épül („a piros lap minket nem rettent el"), de HÁROM KÜLÖN
csatornán — a próba pont ezt méri: a Mészáros az ellenfél gólesélyét viszi le
és lappal fizet, a Vezér a kiállítás MECCSERŐ-ÁRÁT fogja vissza (és ha őt
magát állítják ki, nem véd), a Falka pedig csak EMBERHÁTRÁNYBAN hat.

A Sztár hármasa az egyetlen a játékban, ahol a hatás NEM a kijelölt emberen
jelenik meg. Ezért a Testőrnél külön állítás méri, hogy a `roleRiskMult`
bővített aláírása visszafelé kompatibilis: kontextus nélkül hívva a régi
viselkedés marad. A Szolgálónál azt, hogy tényleg ELVESZ a viselőjétől (az
egyetlen ilyen szerep), az Örökösnél pedig azt, hogy a tanulás véget ér, ha a
sztár elhagyja a klubot.

Az utolsó szakasz a kihívás-büntetést („3 meccsig nem működnek a szerepek")
futtatja rá mind a hatra. Részletek: `docs/panzer-sztar-szerepek.md`.

## stilus-motor-proba.js — ⚙️ egy motor, hat gazdaság (a nyolcból)

```
node tools/stilus-motor-proba.js
```

A Panzer félelem-rettenetje azért erős, mert KETTÉVÁLASZTJA az ÁLLAPOTOT (a
keretből számol, nem gyűjtöd) és a VALUTÁT (meccsenként gyűlik, az állapot
10%-áig). Ez a motor ugyanezt adja a többi stílusnak — egy táblázat-sorral
stílusonként, nem hat külön rendszerrel.

A próba első két szakasza a KÉT LÉTRA VISZONYÁT méri, mert a kérés lényege ez
volt: a százalék-létra **minden szinten pontosan 0,6-szerese** a Panzerének
(plafon +12 vs +20), miközben az árlétra és a szintküszöb **betűre** a
Panzeré. Ugyanaz a munka, kisebb jutalom.

Utána a Villám gazdasága élőben: a viharszint mint állapot (a 70-es
sebességnél kezdődő skála, a stílusszint négyszeres nagyítása, és hogy egy
gyors ember eladása AZONNAL leviszi), a 10%-os meccskeret, a szint → meccserő
átváltás, majd egy teljes mérkőzés tarifája és könyvelése. Egy szakasz azt
zárja le, hogy Panzernél a motor NÉMA — a két gazdaság nem adódhat össze.

A nyolcadik szakasz a stílus ÁRÁT méri („Nyolcvan perc"): a 70. perc előtt
semmi hatás, utána a saját gólesély pontosan annyival esik, amennyivel az
ellenfélé nő, minden megvett szint a tizedét tünteti el, a 10.-en a hátrány
nulla — és más stílusnál nem is létezik.

A tizenkettedik két kérést mér. Az egyik a FEED SŰRŰSÉGE: a mérce a Panzer
néma halmaza (csak a védekező villanás és a fölény néma), és most a motor is
eszerint hallgat — néma csak az marad, amiből tucatnyi jön egy meccsen (a
Beton villanása, a Gegenpressing labdaszerzése). A gól és a gólpassz
mostantól beszél. Külön állítás nézi, hogy MINDEN tarifa-tételnek van magyar
címkéje, tehát a feed sosem ír kulcsnevet.

A másik a MÁSODLAGOS HARMADOLÁSA: a próba méri, hogy pontosan harmadannyi
gyűlik, hogy a meccsenkénti PLAFON viszont változatlan (nem kevesebb fér
bele, lassabban gyűlik), és hogy ugyanez a RETTENETRE is áll — enélkül a
„Panzer másodlagosnak" lett volna a legjobb választás.

A tizenegyedik szakasz zárja le a sort: Beton, Harmónia, Tiki-taka,
Gegenpressing. Itt már nem az a kérdés, elbírja-e a motor a stílusok
HASONLÓSÁGÁT, hanem hogy elbírja-e a KÜLÖNBSÉGÜKET. Három bázis-alak
(egy tengely · a kettő közül a nagyobbik · a kettő átlaga) és négy
tarifa-nyelv. A legélesebb két állítás: a Betonnál a kapus VÉDÉSE pontosan
annyit ér, mint egy hátvéd védekezése, a Harmóniánál pedig EGY EMBER HÁROM
GÓLJA NULLA PONT — ott nem a gól számít, hanem hogy hányan szerezték. A
Harmónia egyébként az egyetlen stílus, aminek az állapota nem egy tengely
magassága, hanem a keret egyenletessége: egyenletes keret 660, széthúzott 0.

A tizedik szakasz a BOMBÁZÓKÉ — és egyben a motor próbája: a gazdaság ott
EGY táblázatsor, a bázis ugyanaz a szerkezet, csak a GÓLSZERZÉS attribútumon
(a próba külön állítja, hogy a 100-as sebesség ott semmit nem ér). Mellette a
két aláírás-mechanika: A Kilences önmagát gerjesztő gólsúlya a hárommal
záródó plafonnal és a „hajrában hátrányban nem jár" záradékkal, illetve A
rekord kötelez latchelő csapatszorzója és a lefújáskori könyvelés (a csúcs
felmegy, de sosem le).

A kilencedik a SZÁRNY-KÉMIA: a stílusszint három fokozata, a párosítás négy
nemleges esete (más oldal · nem szárny · azonos poszt · és a legfontosabb: ha
a két ember SEBESSÉGE elszakadt egymástól), az összeérés lépésről lépésre, a
fölfelé kiegyenlítődő sebesség, és hogy a gólesély-szorzó csak akkor jár, ha
mindketten a pályán vannak — a kiállított nem számít.
Részletek: `docs/stilus-jelzorendszer-motor.md`.

## pvp-meccsero-proba.js — ⚡ a szám, amiből a párharc tényleg eldől

```
node tools/pvp-meccsero-proba.js
```

A motor a párharcot MINDIG is a meccs-erőből számolta — a felület viszont a
nyers keretet mutatta. A két menedzser tehát nem azon mérte magát, amiből a
mérkőzés eldőlt (a beküldött beszélgetésben 173,3 vs 158,5, miközben a
képernyőn másik számpár állt).

A próba méri, hogy a csapatlap `mstr` mezője PONTOSAN a `teamMatchStrength()`,
hogy a hálózati tisztítás átengedi a 120 fölötti értéket (a meccs-erő simán
170 fölé megy), a hiányzót null-ra teszi és az irreálisat levágja — és hogy az
eredményjelző párharcban mindkét oldalon a meccs-erőt mutatja, villám-jelzéssel.

**A fele az állításoknak arról szól, hol NEM szabad változnia semminek:**
bajnokiban, kupában és régi kliens ellen betűre a régi szám áll — utóbbinál
azért, mert két KÜLÖNBÖZŐ skálájú szám egymás mellett rosszabb volna, mint két
régi. Részletek: `docs/pvp-meccsero.md`.

## parharc-menetrend-proba.js — ⚔ a 22. fordulóban megállt a szezon

```
node tools/parharc-menetrend-proba.js
```

Egy tesztelő képernyőképe: a 22. forduló ellenfele „⚔ A TÁRSAD", az állás
„21/30", és onnan nem lehet továbblépni. Az ok egyetlen sorban állt: a két
párharcot egy nyers `splice(r-1,0,…)` tette a helyére, a `splice` pedig
CSENDBEN A VÉGÉRE CSÚSZTAT, ha az index túllóg a tömbön. Kisebb mezőnnyel a
második párharc nem a 30. fordulóra került — 10 ellenféllel pontosan a
22.-re, és a szezon is 22 fordulós lett a harminc helyett.

A próba először a **régi kódot is lefuttatja** ugyanazokon a mezőnyméreteken,
és kimondja, hogy 10 ellenféllel betűre a bejelentett képet adta — enélkül
nem lehetne megkülönböztetni a javítást egy nem-változástól. Utána az új
illesztést méri: 10/13/14/15/16 ellenféllel **mindig 30 forduló**, a
párharcok **mindig a 15. és a 30.**, lyuk nélkül, és a pótlás
determinisztikus (a két kliens ugyanazt kapja).

A helyreállítás a két VALÓDI alakon megy: a beküldött mentés 32 fordulós
menetrendjén és a tesztelő kliensének 22 fordulós, 22.-en álló párharcot
tartó listáján. Mindkettőnél állítás mondja ki, hogy a **lejátszott
fordulókhoz nem nyúlt** — és hogy az ÉP menetrendhez hozzá sem nyúl.

Végül a szellemmeccs elleni zár (nem indul hamis mérkőzés egy 0-s erejű
helyfoglaló ellen), és a második kérés: a bajnoki képernyő a **társad**
címénél is jár, ha csak ő előz meg — pontosan egyszer, és a saját
könyveléshez (`consecutiveTitles`, `titleWonSeason`) nem nyúlva. Részletek:
`docs/parharc-menetrend.md`.

## sztar-piac-proba.js — ⭐ az átigazolás, ami a saját sávod FÖLÉ mutat

```
node tools/sztar-piac-proba.js
```

A meglévő keresések mind az ALAP SÁVBÓL dolgoznak (`signingBand`), az pedig a
klubbal EGYÜTT nő: bármilyen nagy is leszel, a piac mindig „magadfajtát"
kínál. A sztár piac az egyetlen csatorna, ami ezen túlmutat — ezért áll két
kapu mögött (110 nyers csapaterő + 4★ ügynökség) és ezért csak nyáron.

A próba a **két létrát** méri először, tiszta függvényként: a keresés-szám
huszonöt töréspontját a kérés táblázatával szemben, és a gap-létra három
rögzített pontját a köztes félcsillagokkal. Külön állítás mondja ki, hogy a
gap tényleg FÉLCSILLAGONKÉNT lép, nem folytonosan — 4,2★ és 4,0★ ugyanaz,
4,4★ és 4,5★ ugyanaz, de a kettő nem egyenlő.

Utána karrierben: a két kapu külön-külön és együtt (a 109,9-es csapaterő még
nem elég), a négy „csak nyáron" eset a gomb feliratával együtt, a keret teljes
életciklusa (fogy, nullán megáll, a közbeni fejlesztés nem tünteti el az
elköltött alkalmakat, új nyáron tiszta lap), egy ÉLŐ keresés, és hogy mind a
négy módban — alap, piramis, Infinity, közös karrier — betűre ugyanaz jön ki.

A 8. szakasz (3.9.103) az **üzletkötés-létrát** méri: 4★ → 66%, 10★ → 90%,
30★ → 99%, közte a lineáris szakasz mind a hét foka, a plafon, a padló, és két
szerkezeti tulajdonság — hogy a görbe monoton, és hogy 10★ fölött a lépések
egyre kisebbek („szépen lassan tart a 99% felé"). A 8b. szakasz pedig azt
bizonyítja, hogy a TÁRGYALÁS is ebből dolgozik: a `land()` egyetlen
`Math.random()`-ját rögzítve a próba a négy kimenetel határai köré lő, és
megnézi, hogy mindegyik a helyére esik — plusz hogy a RENDES keresés határai
az ügynökség csillagától függetlenül állnak.

**Amit a próba fogott meg:** a szerepenkénti szűrés először a `BENCH_CATS`
kódlistáiból dolgozott, azok viszont ÁTFEDNEK — a `JSZ`/`BSZ` egyszerre
szerepel a `KOZEPPALYAS` és a `CSATAR` szerepnél. A „középpályás" helyre így
szélső csatár került (`["KAPUS","VEDO","CSATAR","CSATAR"]`). A szűrés azóta a
`getCategoryFor`-on megy, amiből a listasor címkéje is jön: a kiválasztás és a
kiírás egy igazságból dolgozik. Részletek: `docs/sztar-piac.md`.

## masodlagos-sztar-proba.js — ⭐ a sztáros filozófia a MÁSODIK sloton

```
node tools/masodlagos-sztar-proba.js
```

A bejelentés két képességről szólt („se a sztár jóga, se az összhangot javító
képesség… mindkettő nullán áll"), a gyökér viszont **tizenhárom függvényt**
érintett: a 3.9.64-es másodlagos filozófiával megszületett a `starStyle()` —
ami megtalálja a sztáros stílust akármelyik slotban —, de a hívók átvezetése
FÉLBEMARADT. A többi továbbra is az ELSŐDLEGES stílusból olvasott, ott pedig
nincs `.star`, tehát mind nullát adott: az összhang, a kötés-párosok, a bér- és
ár-arány, a karrier-statisztikák, a „nem öregszik", az attribútum-gyorsítás és
a teljes Sztár jóga.

**Nem a szint volt rossz** — az a `styleActiveFx()`-en megy, az pedig mindkét
slotot bejárja. A képesség meg volt véve, csak nem volt mihez alkalmazni.
És a jóga **hatása** is halott volt, nem csak a kijelzése.

**A mérés módja a lényeg:** a próba nem abszolút számokat rögzít — azok a
balansz változásával elavulnának —, hanem azt, hogy UGYANAZ A FILOZÓFIA
UGYANAZT ADJA, akárhol áll. Tizennégy mérő fut le mindkét sloton, és a kettőnek
egyeznie kell. Egy új sztár-mérőt elég felvenni a próba táblázatába, és máris
védve van.

Két őr teszi értelmessé: az egyik azt állítja, hogy az értékek NEM nullák
(különben a „két nulla egyenlő" is zölden átmenne), a másik azt, hogy sztáros
filozófia nélkül viszont tényleg nullák. A javítás előtti kódon a próba
**14 ponton bukik**. Részletek: `docs/masodlagos-sztar.md`.

## imm-kupa-kapcsolo-proba.js — 🎬 a meccsről meccsre kapcsolója a kupában

```
node tools/imm-kupa-kapcsolo-proba.js
```

A bejelentés úgy szólt, hogy a módnak „nincsen látható kapcsológombja
kupasorozatban… jelenleg nem lehet bekapcsolni". **Három hiány volt, nem egy**,
és a harmadik volt a legfontosabb:

1. a megszokott sáv `phase==="season"`-re volt kapuzva — a kupasorozat viszont
   a szezon LEZÁRÁSA után fut, tehát a sáv pont ott tűnt el, ahol a mérkőzések
   a leggyorsabban jönnek egymás után;
2. a kupa HUB-ban (scEuro) egyáltalán nem volt kapcsoló;
3. **és ha valaki mégis bekapcsolta, a lánc nem indult el**: az `immStep`
   hurka mindig a bajnoki ágon zárult, az pedig a kupában azonnal megáll.
   A mód bekapcsolt, a sorozat állt.

A próba mind a hármat méri. A 6. szakasz a lényeg: megnyomja a kapcsolót a
kupa-nézeten, és azt nézi, elindul-e a visszaszámlálás — **és hogy a KUPA-lánc
indul-e el, nem a bajnoki**. Külön állítja azt is, hogy más képernyőről NEM
indít kupa-láncot: a feltétel szándékosan szűk, hogy minden más útvonal
viselkedése betűre a régi maradjon.

Az 1. és 3. szakasz a szétcsúszás ellen mér: hogy a két sáv közös CSS-osztályt
visel, és hogy a kupa-gomb felirata mindig ugyanaz, mint a megszokotté — egy
hívás tartja szinkronban a kettőt. Részletek: `docs/meccsrol-meccsre.md` 9. pont.

## kiallitas-rendszer-proba.js — 🟥 a kiállítás négy ügye

```
node tools/kiallitas-rendszer-proba.js
```

Négy bejelentés, egy tőről: a kiállított percei, a „tízen maradtunk" a
második lapnál is, a hiányzó mérföldkövek, és az ötödik kiállítás szabálya.

**A közös gyökér:** a motor EGYETLEN kiállítást ismert egy mérkőzésen — a
`redIdx` egy szám volt, és a második felülírta az elsőt. Emiatt a 24. percben
kiállított ember a 80.-ban még gólt lőhetett, az eltiltását sem könyvelte el
senki, és azt sem lehetett megmondani, hány kiállítást kaptunk. A javítás
gerince ezért egy kiállítás-HALMAZ, a régi aláírásokat pedig a `redHas`
tartja életben (szám VAGY halmaz).

A próba 1-5. szakasza egységeket mér (percek, értékelés Panzerrel és anélkül,
a magyar létszám-szavak, a `redHas` mindkét alakja, a két új mérföldkő-család).
A **6-7. szakasz viszont valódi mérkőzéseket játszik le** felhúzott
piroslap-eséllyel — a refaktor kockázata a motorban van, nem az egységekben —,
és azt nézi, hogy mind az öt kiállítás el van-e könyvelve, mindegyikük
kap-e eltiltást, a napló létszám-szavai lépésről lépésre fogynak-e, és hogy
az ötödiknél tényleg lefújják-e a meccset 0:3-ra.

A **8. szakasz megméri a balansz árát**: a régi „egy közvetlen piros
meccsenként" kapu eltávolítása valódi változás, tehát nem tippelni kell. Egy
teljes szezon: 30 meccs, 4 kiállítás, 0,133/meccs — a kiállítás ritka maradt,
a kapu csak a farkat fogta le.

**Amit a próba írása fogott meg:** az első kapum `menLeft()>MATCH_MIN_MEN`
volt, vagyis „amíg legalább nyolcan vagyunk" — ez EGY EMBERREL elvétette a
szabályt. Hét emberrel még jár a lap; épp az az ötödik kiállítás, ami után a
mérkőzés véget ér. A gátam mellett az ötödik lap sosem született meg, és a
negyedik kérés néma maradt volna. Két állításom is rossz volt: a percsúly az
ALAP felé húz (tehát egy kiállított embernél FELFELÉ), és a mérföldkő
plafonja nem négy, hanem öt. Részletek: `docs/kiallitas-rendszer.md`.

## osztalyugras-terv-proba.js — 🎲 mire tarts félre a nyáron

```
node tools/osztalyugras-terv-proba.js
```

Az all-in osztályugrás régóta megvan, de a hibája **időzítési** volt: az ajánlat
a nyár legvégén jön, a fel-/kiesés eldőlte után — vagyis akkor, amikor az
átigazolásaid MÁR lementek. Aki nem tudta előre, hogy létezik, az a nyarat
végigköltötte, és az ajánlat egy üres kasszát ért.

A 3.9.96-tól a nyári HUB **tetején** áll egy doboz, ami a költés ELŐTT mondja
meg, mennyibe kerülne és mekkora mezőnyt vállalnál vele.

**A nehéz rész, amit a próba főleg mér:** a piramis fordulója a nyár UTÁN fut,
tehát a nyári HUB-ban a `pyrMyDivId()` még a MOSTANI osztályod — az ugrás árát
viszont a KÖVETKEZŐ osztályod szabja. A doboznak ezért a végtabellából kell
előre vezetnie az osztályt, ugyanazzal a három szabállyal, amit a `pyrRollover`
alkalmaz (közvetlen feljutás · osztályozó · közvetlen kiesés). A próba mind a
négy helyezés-sávot végigjárja, a végtabellát kézzel állítva — a bajnok ága
pontosan a kérésben szereplő **„D4-ről egyből D2"** esetet reprodukálja, az
osztályozós helyezés pedig MINDKÉT ágat kiírja, ár és cél-osztály szerint.

A 6. szakasz a felületet méri: hogy a doboz tényleg a Run-mérő FÖLÖTT áll
(`compareDocumentPosition`), hogy szezon közben, élő vállalásnál és az
élvonalban elbújik, és hogy a mezőnyerő magyar tizedesvesszővel áll — ez
utóbbi külön állítás, mert a valódi ajánlatban eddig angol pont volt.
Részletek: `docs/osztalyugras-terv.md`.

## passzkemia-osszeeres-proba.js — 🌀 a tört attribútum és a meg nem induló közös fejlődés

```
node tools/passzkemia-osszeeres-proba.js
```

Egy bejelentés, három egymásra épülő hiba. A képernyőképen `Passz 112.375`
állt, miközben minden más attribútum kerek egész volt — és a jelentés annyi
volt, hogy „bugos a passzkémiánál az együtt fejlődés… fura állásokon elakad".

A **gyökér**: a specializációs sáv két vége a `trainScale`-lel skálázódik, az
pedig tört (89/80 = 1,1125), tehát a plafon maga is tört lett — 89 − 10 +
30×1,1125 = **112,375** —, és amint egy attribútum nekifeszült, a clamp ráírta
a törtet magára az attribútumra. Onnantól a mentésben is tört ült.

Ebből folyt a **második**: a passzkémia összeérését EGYENLŐSÉG dönti el, egy
tört érték viszont sosem lesz egyenlő a társa egészével. A kötés örökre a
felzárkózás szakaszában ragadt, a két fél pedig átugrálta egymást — minden
meccsen a másik lett a „gyengébb". A közös, gyorsított fejlődés, vagyis a
kötés FELE HASZNA, el sem indult.

A **harmadik** ettől független: a gyengébb fél saját plafonja a társáé alatt is
lehet (egy középvédő Passz-sávja szűkebb, mint egy irányítóé), tehát az
egyenlőség akkor is elérhetetlen volt, ha a számok történetesen egészek.

A próba 18 állítása mind a hármat lefedi. A legbeszédesebb az első: **pontosan
a bejelentett esetet** állítja elő (89-es Ratingű középvédő), és azt méri, hogy
a plafon ma 112, nem 112,375.

**Amit a próba írása tanított:** a `passChemPassCeil` a `msEntry`-n keresztül
néz, a próba pedig azt stubolja — a plafon-mérést tehát MÉG a stub alatt kell
elvégezni, különben `Infinity` jön vissza (és JSON-ban `null`-ként landol egy
állításban, ami emiatt hamisan bukik). Azóta a próba mindkét úton megméri a
plafont, és külön állítja, hogy a kötés ugyanazt a sávot látja, mint a
`bumpAttr`. Részletek: `docs/passzkemia-osszeeres.md`.

## eladas-kihivas-proba.js — 💸 a határidő maga a legelső licit

```
node tools/eladas-kihivas-proba.js
```

A „gyenge láncszem" kihívás (`replaceWorst`) az egyetlen vállalás, ami egy
NÉVRE szól: add el ezt az embert. A határideje mégis ugyanaz a nyolc meccses
ablak volt, mint mindenki másé — csakhogy **eladni nem rajtad múlik**. A licit
akkor jön, amikor jön, szezonközben ablakonként egy; nyolc meccs alatt simán
előfordult, hogy egyetlen ajánlat sem született. Ilyenkor a kihívás nem nehéz
volt, hanem **teljesíthetetlen**, és az egyetlen kiút az INGYEN elengedés
maradt — ami nem eladás, hanem veszteség.

A 3.9.94-től a határidő maga a **legelső licit**. A próba tizenhárom állítása
ezt járja körbe: a `firstBid` határidő-fajta és a három kiírt szöveg; hogy sem
a fordulós, sem a szezonos lejárat-kiértékelő nem nyúl hozzá (az idő múlása
tehát nem viheti el); hogy pontosan az **ELSŐ** licit visszautasítása bukik, a
második már nem, és más játékosé sem érinti; hogy a piacról levétel **váró**
licittel ugyanaz a bukás, licit nélkül viszont nem; és hogy a többi kihívás
határideje változatlanul meccsszám.

**A legfontosabb ág** a sikeres eladásé, mert ott két dolog is elromolhatna:
a jutalomnak az ELADÁS pillanatában kell érkeznie, és a sale belső
piac-levétele **nem** eshet a bukás-ágba. A próba ezért a valódi úton megy
végig (`saleAcceptOffer` → `releasePlayer` → `settleEarlyChallenges`), nem
kézzel tünteti el a játékost.

**Amit a próba írása tanított:** a kezdő tizenegyből eladni csak PÓTLÁSSAL
lehet, ezért az első változat `noreplacement`-tel bukott — és nem a kihívást
mérte, hanem a keret-szabályt. A próba azóta tesz valakit a tartalék-keretbe.
Részletek: `docs/eladas-kihivas-elso-licit.md`.

## szuperliga-kalibracio-proba.js — ⛰ a D0 fölött a nehézség nem szalad el

```bash
node tools/szuperliga-kalibracio-proba.js
```

**A hibaosztály.** A ligapiramis addig önszabályozó, amíg van hova feljebb
menni. A D1 fölött ez elfogy: az új szuperliga ereje a RÉGI tetőhöz van kötve
(`pyrOpenTopDiv`: a legfelső osztály közepe + `PYR_STEP`), nem a te
keretedhez. Egy jól menedzselt karrierben a keret idényenként többet lép, mint
a lépcső — vagyis a hegy csúcsa lesz a legkönnyebb szakasz.

**Amit a próba állít.** 3.9.112 óta a D0 megnyílásától minden idény kalibrált
kezdőrúgással indul: a szezon kezdetének pillanatában a világ oda áll, ahol a
karrier elején vállalt rés újra kijön — magányos karrierben a **te**
meccs-erődhöz, közös karrierben a **kettőtök átlagához** mérve.

Tizenhárom szakasz:

| # | mit igazol |
|---|---|
| 1 | a kapu: D0 alatt a kalibráció nem létezik és nem is mozdít semmit |
| 2 | a vállalt rés befagy (`superWant`), és nem kergeti önmagát a `gap0`-n át |
| 3 | magányos ág: egy −19-re elszaladt világot pontosan a vállalt +2-re állít |
| 4 | idényenként EGYSZER fut (a `superFor` bélyeg) |
| 5 | a **morál** zuhanása elviszi a meccs-erőt → a következő idény újra beáll |
| 6 | a lépcső mezőny-ígérete (`fieldWant`) eltűnik |
| 7 | szintugrási felajánlás nincs többé |
| 8 | hangolási felajánlás sincs (a kalibráció úgyis felülírná) |
| 9 | a páros négy száma: átlagolt meccs-erő és átlagolt rejtett bónusz, régi kliensnél a nyers keretre visszaesve |
| 10 | PvP: a páros átlaga áll a vállalt résre, a mezőny oldalán a `levelGap` tükrével |
| 11 | elmaradt kézfogás (tavalyi bélyeg) → nem találgatunk, a világ érintetlen |
| 12 | a kalibráció nem változtatja meg az osztálylétszámot |
| 13 | **a bekötés**: a `startNextCareerSeason` tényleg hívja, méghozzá a `buildSeasonFixtures()` ELŐTT; a kézfogás tényleg elteszi a páros számait; a két felajánlás kapuja tényleg ismeri a szuperligákat |

Az 5. szakasz a legbeszédesebb: **a morált** mozgatja, nem a keretet. Ha a
horgony a nyers keretre nézne, az a szakasz meg sem moccanna — így viszont
pontosan azt méri, amit a felhasználó kért („meccs erőhöz igazítva").

A 13. szakasz `Function.prototype.toString()`-gel néz rá a hívási pontokra.
A többi szakasz a függvényeket közvetlenül hívja; enélkül egy bekötetlen, de
tökéletesen működő kalibráció is zöldet adna.

Részletes magyarázat: `docs/szuperliga-kalibracio.md`.

## meccsero-potencial-proba.js — ⚖️ a lebutított felállás fele annyit ér

```bash
node tools/meccsero-potencial-proba.js
```

**A rés.** A szuperligák mezőnye a KEZDŐRÚGÁSKOR mért meccs-erőhöz áll be,
PvP-ben a kettőtök átlagához. A meccs-erőt viszont a mérés pillanatában
állítani lehet: csere, felállás, kapitány, taktika. Szándékosan rossz
tizenegyet kiállítva gyenge mezőnyt lehetett kérni, majd visszarendezni.

**Amit a próba állít.** 3.9.122 óta a kalibráció megkeresi, mi a legjobb
meccs-erő, ami a kerettel TÉNYLEGESEN kiállítható; ha az legalább 2,5%-kal
jobb, a mezőny a kettő számtani közepéhez áll be, és a napló kimondja.

Tizenhat állítás, köztük a három legfontosabb:

| # | mit igazol |
|---|---|
| 1 | a keresés NEM hagy nyomot — felállás, kapitány, taktika, pad, keret bitre ugyanaz utána, **kivétel esetén is** |
| 7 | a talált konfiguráció VALÓDI: létező felállás, 11 slot tele, senki kétszer, kapitány a pályán, ismert taktika — nem elméleti felső korlát |
| 4 | a használt szám PONTOSAN a két érték számtani közepe |
| 2 | ép kerettel nincs hamis riasztás (a nyereség a küszöb alatt marad) |
| 6 | `MS_RATED` nélkül a `teamMatchStrength` az ÉLŐ számot adja — a kijelzés, a tanácsadó és a mérkőzés nem változik |

**A próba kapta el a legsúlyosabb hibát:** az első változat szűk keretnél
némán kikapcsolt, mert az `arrangeSlotsFor` egyetlen felállást sem tudott
feltölteni (11 fős kerettel mind a nyolc 8–9 slotnál megállt). Azóta a
MOSTANI felállás mindig jelölt — az definíció szerint kiállítható.

Részletes magyarázat: `docs/meccsero-potencial.md`.

## hiper-szuper-kupa-proba.js — 🟣 a szuperligák saját sorozata

```bash
node tools/hiper-szuper-kupa-proba.js
```

**Egy néma hiba, amit a feature kitakart.** A `PYR_CUPS` kvalifikációs tábla
a D1-ig ért; D0-tól az index negatív lett, a `PYR_CUPS[-1]` undefined, és a
`||` a LEGALSÓ osztály sorát adta vissza — a világ tetején a piramis
legkisebb kupája futott. Nem elírás, hanem hiányzó sor.

**A sorozat.** D0-tól mindenki a Hiper Szuper Kupát játssza, selejtező
nélkül. A mezőnye a SZEZONINDÍTÓ meccs-erődhöz mérve épül (`msKick`), nem az
élőhöz: a kupa a szezon végén fut, és élő méréssel a sorozat önmagát húzná
maga után. D0-n −1, és osztályonként eggyel feljebb.

**A lefolyás** svájci: egy 32-es tabella, nyolc forduló, majd 1–8 egyenesen
a nyolcaddöntőbe, 9–24 rájátszás, 25–32 kiesik. A gépezet három függvényen
át látja a különbséget (`compGroups` / `compGroupSize` / `compSchedule`),
ezért a sorsolás, a forduló-szimuláció és a felület változatlan.

**A menetrend lánc-javítása** külön figyelmet érdemel: a mohó
hazai-pálya-kiosztás 3/4/5-re állt be, és egyszerű páronkénti fordítás sem
vitte 4-re (a túlterhelt és az alulterhelt csapat gyakran nem játszik
egymással). Egy irányított lánc (BFS) a legtöbbtől a legkevesebbig
megoldja: a lánc minden párját megfordítva egy hazai pálya vándorol át, a
közbülsők mérlege változatlan. Mérve: mindenkinek pontosan 4 hazai.

Harminc állítás, köztük a **három út végigjárva** (`euroFinishGroupStage`
mindhárom sávra) és az, hogy a **klasszikus kupa bitre változatlan**.

Részletes magyarázat: `docs/hiper-szuper-kupa.md`.

## piac-horgony-proba.js — 🧭 a scout, a piac és a HSZ mezőnye

```bash
node tools/piac-horgony-proba.js
```

**Bejelentett hiba:** „170-es mezőnyben vagyok, és nem talál semmit az
attribútum-kereső, a sztár-kereső 100 körülieket akar nekem eladni, a scout
is beakadt."

**Az ok.** A piac emelkedése az `oppTargetRating − careerBaseRating`
különbségből él. A piramis horgonyai a világ eltolása után
`careerBaseRating = oppTargetRating`-et írtak — ami KARRIERENKÉNT EGYSZER
futva helyes, de a 3.9.112 szuperliga-kalibrációja minden idényben
`P.anchored=false`-ot ír, tehát a horgony minden szezonban a mostani
szintre ugrott, és a pool a nyers 85–100-on ragadt.

**A hibaosztály már ismert volt**: a betöltés-javító szó szerint ezt írja
le — csakhogy az betöltéskor fut egyszer, a szezonforduló pedig utána
rontotta el újra.

**Az invariáns:** `pyrSetMarketAnchor()` — a horgony soha nem emelkedhet a
karrier indulószintje (`S.run.baseDiff`) fölé. Nem `min()`: kieséskor a
világ a horgony alá eshet, és egy lejjebb húzott horgony felfújná a piacot.

A régi kódon a próba **11 állításon bukik** (horgony 78 → 178, piac-emelkedés
0, pool 108-on ragad 177-es világban). A 6–8. szakasz a HSZ mezőnyét méri:
a BELÉPÉSKORI meccs-erőhöz kell mérnie, nem a szezonindítóhoz — a bejelentés
szerint 192-es kerettel 178-as mezőny jött.

Részletes magyarázat: `docs/piac-horgony-hiba.md`.

## kupa-meccsero-proba.js — 🏆 a kupamezőny nem sodródhat el

```bash
node tools/kupa-meccsero-proba.js     # próba
node tools/kupa-mezony-meres.js       # MÉRŐESZKÖZ (mindig 0-val lép ki)
```

**A hiba.** A kupamezőny `max(nyers, szint) + befagyasztott_rejtett/2 − edge`
alapon épült, tehát a fölényed `edge + rejtett/2` volt. A rejtett bónusz a
karrier során +4-ről +30 fölé nő, így a kupa nehézsége TELJESEN ettől
függött: KK-ban 4,9 → 17,9. A karrier elején fojtogató, a végén séta.

**Az új alapérték levezetve**: `base = 1,2 + 5 = 6,2`, ahol az 5 a
közép-karrier (rejtett ≈ +10) régi hozzáadása. A +10-es ponton a régi és az
új fölény BITRE azonos mind a négy sorozatban — máshol viszont megszűnt a
sodródás.

**Két tanulság a mérőeszközről.** (1) Az első változata kétszer alkalmazta
az `oppDelta`-t, és hamis, hárompontos lépcsőt mutatott — a kód valójában
kiejti (`round(f−d)` majd a hívó `+d`). (2) A lebutítás-próbája a kiszoruló
erős játékosokat a semmibe dobta slot-felülírással; a valódi játékban egy
csere nem TÖRLI a játékost, ezért a tartalékba kell tenni őket.

**Amit a mérés felülírt a terven:** az `euroDominance` NEM válthat
meccs-erőre — a mezőnyszinthez hasonlítja magát, tehát meccs-erőn a
dominancia a rejtett bónusszal együtt nőne, és visszatérne ugyanaz a
sodródás.

Részletes magyarázat: `docs/kupa-meccsero.md`.

## stilusbolt-proba.js — 🛒 a bontott állapot és a hat piac

```bash
node tools/stilusbolt-proba.js
```

**Két rendszer egy próbában.** (1) Az állapot **négy nevesített tényezőből**
áll össze — mélység (a régi képlet, betűre), él (a 3 legjobb csúcsa),
összjáték (a kulcsposztok kötései), képességek (a tengelyre eső skillek).
(2) Minden filozófiának **saját nevű piaca** van, 3-3 termékkel: 🔧 a boksz ·
📈 a gólbörze · 🧰 a szertár · 🍽️ a közös asztal · 🔄 a rondó ·
🧪 a laboratórium.

**A bontás legfontosabb állítása** nem a számok nagysága, hanem hogy **a
felállás felforgatása után mind a négy tényező bitre ugyanaz**. Ezen áll vagy
bukik a keresés gyorsítótára: az állapot a rejtett meccs-erő tagja, a
potenciál-kereső (3.9.122) pedig felállásokat próbálgat rajta — ha az állapot a
kiállított tizenegytől függne, a kereső önmagát kergetné.

**A piac legfontosabb állítása** az, ami a 3.9.127-ben elromlott volt: hogy ez
tényleg **hat piac, nem egy sablon hatszor**. A próba megköveteli, hogy a
tizennyolc azonosító egyedi legyen, és hogy legalább **hétféle hatásfajta**
szerepeljen köztük (ma tíz). Mind a tíznek saját állítása van, és a `tune`
tételeket **a motorban** méri, nem a számlálón: a Rekordkönyv után a
rekord-hajrá tényleg hamarabb armol, a Közös futás után a gyilkos páros érése
tényleg rövidebb.

**Az ár RÖGZÍTETT** (3.9.129), mint a Panzer boltjában. A próba ezt két
állítással őrzi: az állapot-szint negyvenszeres felnagyítása sem mozdítja az
árat, és mind a tizennyolc ár betűre a tábla száma.

**Amit a próbának meg kellett tanulnia.** (1) A `bzRecGoalMult` a `BZ9_TIERS`
kapuja mögött ül (3. csapatstílus-szint), tehát az első mérés „hatástalannak"
látta a Rekordkönyvet, pedig csak zárva volt — a próba azóta felhúzza a
stílusszintet, és külön állítja, hogy a kapu nyitva van. (2) Az ár-kontroll
először ×4-gyel nagyított, és az véletlenszerűen NEM vitte az állapotot az
`ENG_SCALE_FROM` (100) fölé — a „nem mozdul" állítás így néha semmit nem
bizonyított. Most ×40, garantáltan.

Részletes magyarázat: `docs/stilusbolt.md`.

## papirforma-proba.js — ⚖️ a papírforma és az óriásölés skálája

```bash
node tools/papirforma-proba.js
```

**A bejelentett képernyő:** „Csapaterő: 164,7 — 191,6 · papíron 26,9-del
gyengébb vagy" — miközben a meccs-erő 191 körül állt. A mérce mostantól a
nyers csapaterő és a meccs-erő **közepe**, a kezdőrúgáskor befagyasztva, és az
óriásölés küszöbe a papírforma **10%-a** (a régi fix 8 pont 80-as csapatnál).

**A legfontosabb állítás:** 80-on az új szabály **minden döntése bitre a
régi** (−20…+20 pont, félpontonként) — a skála csak fölötte kezd el mást
mondani. **A legbeszédesebb mérés:** egy emulált késői karrierben (+28 rejtett
bónusz, a mezőny a meccs-erőhöz horgonyozva) a régi szabály **15-ből 15**
ellenfelet tett óriássá, az új **egyet sem**.

**Amit a próbának meg kellett tanulnia.** Az első fixture poszt-idegen
tizenegyet állított ki, ahol a kijelzett csapaterő 7-10 ponttal a csontváz-erő
alá esett — és az a régi-új összevetést zajossá tette (az egyik futásban 0/15,
a másikban 8/15). A próba azóta a játék saját kiosztási szabályával
(`arrangeSlotsFor`) állítja fel a keretet.

## nehezsegi-letra-proba.js — 🪜 a nehézségi létra

```bash
node tools/nehezsegi-letra-proba.js
```

+6,0 … +2,0 fél, alatta tized lépcsők; a kezdő határ +2,5; minden megnyert
karrier a nyerés fokától két lépcsőt nyit, 0,0-ig; a 0,0-n aratott győzelem a
mínuszos sávot, onnan egész számonként. A Run-görbe jóval meredekebb (+2,5:
0,89 → 0,65), mínuszban a tető tizedenként +10.

**A nyitás szabályát a próba a kérés SAJÁT PÉLDÁIVAL méri**: 2,5 → 2,0 és 1,9 ·
1,9 → 1,8 és 1,7 · 0,1 → csak 0,0 · 0,0 → a 0…−1 sáv · −1 → −1…−2 — és a két
„semmi új" esetet is (könnyebb fokon, illetve egy sávon belül nyerve).

**Amit a próbának meg kellett tanulnia.** Az első változat azt állította, hogy
a −1,0-s karrier plafonja 100 fölé megy — de a plafon a többi tényezővel
(kezdő osztály, két tempó) SZOROZ, és egy D1-es, lassú mezőnyű karrierben
0,70 marad. A helyes két állítás: a −1,0 **pontosan kétszerese** a 0,0-nak, és
a legnehezebb egyéb beállításokkal **tényleg** 2,0 lesz.

Részletes magyarázat mindkettőhöz: `docs/papirforma-es-nehezsegi-letra.md`.

## gegen-pontrendszer-proba.js — 🧲 minden stílus gazdasága fut

```bash
node tools/gegen-pontrendszer-proba.js
```

**A bejelentés:** „A gegenpressing nem kapott olyan pontrendszert, mint az
összes többi." **Az ok:** az `engKey()` a tábla sorrendjén ment végig (nem a
slotokon), és egyszerre csak egy motor futott — a tábla utolsó sorában álló
Gegen minden más motoros stílus mellett vesztett, elsődlegesként is.

**A próba gerince a harminc pár:** minden motoros stílus minden más motoros
stílus mellett, mindkét sorrendben — mindkét gazdaságnak élnie kell,
slot-sorrendben. Emellett méri, hogy a két gazdaság két külön mérleget,
plafont és egyenleget visz, és hogy a meccserő-hozamuk EGYÜTT sem megy +12
fölé (ez volt az eredeti „csak egy fut" szabály egyetlen jogos oka).

Részletes magyarázat: `docs/gegen-pontrendszer-hiba.md`.

**3.9.137 óta:** a „két szint együtt sem megy +12 fölé” állítás helyett a
próba azt méri, hogy:

- a két szint hozama közös plafon nélkül összeadódik;
- a másodlagos a saját, felezett plafonjáig ad (+6);
- a Panzer plafonja elsődlegesként +20, másodlagosként +10.

Lásd `docs/masodlagos-meccsero-plafon.md`. Egy tanulság: a plafon-ellenőrzés a
fixtúra VÉGÉN fut. Egy új `par(...)` hívás friss stílus-állapotokat hoz létre,
és a közepén elvágta volna a piac-szakasz régi hivatkozásait.

## pvp-beallitas-letra-proba.js — 🤝 a létra és a Legendás magyahok PvP-ben

```bash
node tools/pvp-beallitas-letra-proba.js
```

**A bejelentés:** „ezek nem globálisak. PvP indításában nem voltak ott."
A próba a házigazda VALÓDI gombjával (`#mpStartBtn`) nyitja a beállítást, és
méri, hogy a 🇭🇺 kapcsoló látszik; hogy a vendégnél zárva van és a házigazda
döntését mutatja; hogy a közös választó a létrán jár, a házigazda nyitott
fokaiig.

**A legfontosabb állítás:** a VENDÉG oldalán nincs kapu. Ha a vendég a saját
(még +2,5-ös) határára vágná vissza a házigazda +1,9-ét, a két gép két
különböző világot építene — pontosan az a szétcsúszás, amit a szoba-szinkron
máshol már megszüntetett.

**Amit a próbának (ismét) meg kellett tanulnia:** a Run-előnézet nem 200 a
−1,0-n, mert a fokozat és a tempó is szoroz — a helyes állítás az ARÁNY
(a −1,0 a 0,0 kétszerese). Ugyanez a hiba a 3.9.130-as próbában is előjött.

## nyomas-es-meccsero-proba.js — 🧲 Nyomásgyakorlás, kalap, presszpont, ⚡ meccs-erő

```bash
node tools/nyomas-es-meccsero-proba.js
```

**Hat bejelentés, egy próba (31 állítás):**

1. A „Gyors kontra” és minden VÉDŐ-képesség kiosztható elöl a
   Nyomásgyakorlás 1. szintjén, de csak ott. A Villámbeck Queen zárva marad.
2. A feloldott „Nyomás!” a MÁR MEGKEVERT pakliba is bekerül, egyszer. Zárolva
   kikerül, és a jelzője a mentésben utazik.
3. A „Nyomásra hangolt sorsolás” a hagyományos húzásban is hat
   (600 húzáson 5% → 64%).
4. A labdaszerzés sora kiírja a presszpontot, és a kommentár változatos.
5. Az eredményjelző minden meccsen kiírja mindkét ⚡ meccs-erőt. A CPU-é
   betűre az, amivel a motor számol.
6. **Valódi meccsen** a kiállítás élőben lejjebb viszi a kiírt számot, és egy
   utána jövő csere nem adja vissza az emberhátrányt.
7. A társ arculata fehérlistán megy át: rosszindulatú szín vagy tinta
   kiesik, és a címere a táblán áll.

**A régi kódon** hét állítás bukik. Mindhárom bejelentett hiba visszajön
belőlük:

- a Gyors kontra elöl 0/3;
- a Nyomás! nem kerül a pakliba;
- a hangolt sorsolás 3,7% a hangolatlan 4,2% mellett.

**A valódi meccs trükkje.** A kiállítás és a csere sorrendjét nem lehet
véletlenre bízni:

- a piroslap-esélyt addig tartjuk fent, amíg az első kiállítás meg nem
  történik;
- akkor a `MATCH_CTL.open()` megállítja a meccset;
- a felülírt `openHalftimeSubs` elvégzi a cserét.

A motor belső `diff`-je kívülről nem látszik. Azt, hogy a csere tényleg újra
alkalmazza a kiállítás képletét, a `styleRedOppGoalMult` hívásának
számlálója mutatja meg.

Részletek: `docs/nyomas-es-meccsero.md`.

## akademia-evek-proba.js — 🎓 az akadémiai évek mércéje

```bash
node tools/akademia-evek-proba.js
```

**A terv:** a visszatérő tehetség az akadémián töltött évei szerint a kezdő
11 nyers erejéhez mért sávban jön vissza, a POT dönti el, hol:

| év | sáv |
|---|---|
| 1 | −12…−8 |
| 2 | −8…−5 |
| 3 | −4…−2 |
| 4 | ±1 |

**Mit mér (24 állítás):**

- mind a négy sáv alját (gyenge POT) és tetejét (erős POT);
- a bejelentett esetet (2 év, POT 3025, 77 → most a −8…−5 sávban);
- hogy a szabály padló: aki fölötte jár, marad;
- hogy a mérce a MAI kezdő 11;
- a további utat: öt szezonváltás, sosem esik vissza, a csúcs korlátos;
- a jóslat-dobozt;
- egy valódi `tryAcademyOpportunity`-felajánlást, a képernyővel és a naplóval.

**A tanulság:** a csúcsot nem szabad a kor-görbe inverzéből számolni. Egy
16 évesnél az 58%-os görbe-arány 150+-os csúcsot adna, és a túlteljesítés-
szabály minden nyáron tovább pumpálná. A rés helyes eszköze az ifi-bónusz.
Részletek: `docs/akademiai-evek.md`.

## fejlesztes-arak-proba.js — 💰 a fejlesztések ára

```bash
node tools/fejlesztes-arak-proba.js
```

A kérés: a felállásváltás, a stáb-bővítés, a scout- és az ügynökség-fejlesztés
kövesse a klub büdzséjét, ahogy a poszt-tanulás. Mind az öt kapja meg a boostok
1. / 2. idénybeli −50% / −33%-át.

**Mit mér (33 állítás):**

- a 10 000-es referencia-büdzsénél, a 3. idényben a régi fix ár;
- az arányosságot (×2 és ×0,5 büdzsé);
- a kedvezményt mindkét idényben;
- az ingyenes első felállásváltást;
- a képernyők címkéjét.

**Két tanulság a próba első futásából:**

- A stáb-hely régi ára kerekítetlen volt (30 625), az új 500-ra kerekít. Ezért
  a tűrés ±1%.
- Az ügynökség ára NEM a scout csillagszintjén vett scout-ár kétszerese, hanem
  a SAJÁT szintjén vetté. A „scout ×2” összehasonlítás hamis hibát jelzett.

Részletek: `docs/fejlesztes-arak.md`.

## csupa-ek-proba.js — 🎯 Csupa ék és a 4-2-4 a Bombázóknál

```bash
node tools/csupa-ek-proba.js
```

**Mit mér (26 állítás):**

- **a költözés:** az „Olcsó totális futball” a Bombázók fáján van, a
  Villámban megvett szintek pontja egyszer visszajár;
- **a középcsatár-korlát** szintenként: 4-3-3-ban 1 → 2 → 3, 4-2-4-ben
  2 → 3 → 4, és képesség nélkül visszaáll;
- **az ultra csatár:** csak a 3. szinten él, csak középcsatár-helyen; ×1,8
  gólsúly; +3% / +10% a Védekezés-arány két végén; benne van az alakzat
  szorzójában; a választó felkínálja.

**A valódi-meccs rész tanulsága:** a gólarányra épített állítás 14 meccsen
hamisan bukott. Ugyanaz a csatár ultra nélkül 21% és 44% között szórt. A bukó
állítás ezért determinisztikus: megszámolja, hogy a meccsmotor
gólszerző-választása hányszor kapott ×1,8-at, és hogy csak az ultra helyre-e.
A gólarány (40 + 40 meccs) csak tájékoztató sor.

A gólokat a `recordScorer` burkolásával számolja: a saját gólok egyetlen
csatornája ez. A `S.lastMatch` nem tartalmaz gólszerzőnkénti bontást.

Részletek: `docs/csupa-ek.md`.

## gyilkos-paros-epites-proba.js — 🧲 a gyilkos páros a passzkémia mintájára

```bash
node tools/gyilkos-paros-epites-proba.js
```

**A bejelentés:** a Gegenpressing kötése némán, automatikusan épült, se
választás, se látható haladás. A próba méri:

- hogy a meccs utáni léptetés már nem indít párt;
- a választót: ajánlott pár + kézi, két lépéses választás;
- a továbbépítést és a váltást (a fázisok megmaradnak);
- az 5/5 kész állapotot (a pressing-szorzó csak együtt él);
- a közös meccsekből haladó összeérést a sebesség-kiegyenlítéssel;
- az „egy ember egy páros” szabályt;
- a régi mentés átalakítását;
- **és a jutalom-sort egy valódi auto-szezonban:** a felajánlás útja tényleg
  bekötött.

**Tanulság:** a fixtúrában eredetileg csak három jelölhető állt, és a „másik
pár” észrevétlenül átfedett az elsővel. A próba ezért maga gondoskodik hat
jelöltről.

**Módosult:** a `gegenpressing-proba.js` 7b-szakasza a kötést már nem a
meccsekből építi, hanem fázisokkal. A meccsek csak az összeérést viszik.

## kiadas-proba.js — 🏪 kiadás-előtti ellenőrző

```
node tools/kiadas-proba.js
```

**Nem a játékot méri** (arra ott a 75 böngészős próba), hanem azt, amit a
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
