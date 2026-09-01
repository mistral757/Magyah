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
soron vagy a fölötte lévő három sor bármelyikén. Az indok kötelező: az a
bizonyíték, hogy valaki tényleg megnézte. Ugyanaz az idióma, mint a
ledger-audit `INDOKOLT` jelölése.

**Új névtároló mező → új sor a `NEVFORRASOK` listába.** A szkript pontosan
annyit lát, amennyit felsoroltunk neki; ez nem bizonyítás, hanem háló.

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
node tools/pyramid-sim.js live tier=kegyet share=0.84 top=0.92
```

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
