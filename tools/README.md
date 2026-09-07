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
