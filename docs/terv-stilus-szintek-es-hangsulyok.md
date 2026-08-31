# Terv: stílus-szintek, hangsúly-csúszkák és a szezon-szerepek a HUB-ban

*(Tervdokumentum — még NINCS implementálva. A számok mérésből és a meglévő
kód-gazdaságból vezetve; a hivatkozott függvények a mai `index.html`-ben élnek.)*

**BEJELENTETT KÉRÉS (két dolog):**

> 1. „A csapatstílushoz kapcsolódó szezon szerepek legyenek látványosabb helyen.
>    A HUB-ban lehessen őket módosítani ugyanúgy, mint a piacra tételt vagy a
>    cseréket. akiket kijelölsz először, azok nevére kerüljön rá a szezon
>    jelecske és lehessen rányomni, amivel odaugrik a szerkesztőbe."
> 2. „találjunk ki csapatstílusonként háromfajta csúszkát, amik a csapatstílus
>    fejlődésével válnának egyre nagyobb hatásúvá… ehhez be kéne vezetni a
>    csapatstílus szinteket is… készítsünk egy saját HUB-szerű menüt a menün
>    belül a csapatstílusnak… minden csapatstílusnak 20 szintje lenne, egyre
>    növekvő xp a szintlépéshez."

---

## 1. Szezon-szerepek a keretlistán

### 1.1 Ami már megvan, és amit másolunk

A HUB keretlistája **két futó ügyet** jelöl ma, és mindkettő pontosan úgy
működik, ahogy a kérés kéri:

| ügy | halmaz | sor-osztály | jelvény | úticél |
|---|---|---|---|---|
| csereterv | `subPlanNames()` | `.rowSub` (kék) | `🔁 csere` | `openSubPlanner()` |
| piac | `saleListingOf(n)` | `.rowSale` (arany) | `📈 piacon` / `📈 licit!` | `renderSaleOffersPanel()` |

A gépezet három darabból áll, és mind a három újrahasznosítható:

* **név-halmaz** — egy `Set`, amit a sor-építő egyszer kiszámol (`_subNames`);
* **sor-osztály + jelvény** — `row.classList.add(...)`, majd egy
  `<span class="rowGo" data-go="…">` a névbe fűzve;
* **egy közös bekötés** — `row.querySelectorAll("[data-go]")`, `stopPropagation`,
  és egy `switch` az úticélra.

Plusz a **mérő-chipek** a `rosterCapHtml()`-ben (`🔁 Cseretervben 4 ›`,
`📈 Piacon 2 · 1 licit vár! ›`).

### 1.2 A harmadik ügy: a szerep

**Új halmaz.** A `subPlanNames()` mintájára:

```js
/* KIK VISELNEK SZEZON-SZEREPET. A kapu a roleStyleActive(): ha a stílusnak
   nincs szerepe (Panzer, Sztár), a jelölés hazudna. */
function roleNamesMap(){
  const out=new Map();               /* név → szerep-kulcs */
  try{
    if(!roleStyleActive())return out;
    const m=roleState().map;
    roleKeysForStyle().forEach(k=>{if(m[k])out.set(m[k],k);});
  }catch(e){}
  return out;}
```

Térkép, nem halmaz — mert a jelvényre **a szerep neve** kerül, nem egy általános
címke. A kérés így szól: „azok nevére kerüljön rá a szezon jelecske", és a
jelecske akkor ér valamit, ha megmondja, MELYIK szerepről van szó.

**Sor-osztály.** `.rowRole`, de a színe nem fix: **a filozófia színe**
(`styleDef().col`). A soron egy inline `--roleCol` változó viszi be:

```js
if(_role){row.classList.add("rowRole");row.style.setProperty("--roleCol",def.col);}
```

```css
.prow.rowRole{background:color-mix(in srgb,var(--roleCol) 22%,var(--bg));
  border-color:color-mix(in srgb,var(--roleCol) 60%,var(--line));
  border-left:4px solid var(--roleCol)}
.prow.rowRole .nm{color:color-mix(in srgb,var(--roleCol) 55%,var(--ink))}
```

Így a Beton kék, a Bombázók rozsda, a Tiki-Taka lila szerep-sorokat kap — a
keretlista ránézésre elmondja, milyen klub vagy. A kék csere és az arany piac
mellé ez a harmadik szín **nem ütközik**: a kettő rendszer-ügy (mindig ugyanaz),
ez pedig identitás.

**Jelvény.** `🔓 Nyitó`, `🧱 Fal`, `🏹 Legolas` — a `ROLE_DEFS[k].ic` és `.n`
párosa, `data-go="role"` úticéllal.

**Halmozódás.** Egy ember lehet egyszerre szerepben ÉS a cseretervben ÉS a
piacon. A meglévő `.rowSub.rowSale` gradiens-szabály mintájára a szerep a **bal
élt** viszi (az a legtartósabb ügy: egy egész idényre szól), a csere a hátteret,
a piac a jobb oldalt. Három jelvény egy sorban elfér, mert mind rövid.

**Úticél.** Már létezik — a `teachOpenStylePanel("role")` pontosan ezt csinálja:

```js
function openRolePanel(){
  teachRevealInMenu();                 /* a menü kinyitása */
  styleSecOpenKey("role");             /* a Szezon-szerepek kategória nyitva */
  hubStyleSetOpen(true);               /* a stílus-csoport nyitva */
  renderStylePanel();}                 /* és rajzoljuk */
```

Csak ki kell emelni a tanító-rendszerből egy általános néven, és be kell kötni a
`data-go="role"` ágba.

**Chip a mérőn.** A `rosterCapHtml()` sorai közé:

```
🎽 Szezon-szerep <b>2/3</b> · 1 üres ›     (üres szerepnél rcWarn színnel)
```

### 1.3 Módosítás a HUB-ban, „ugyanúgy, mint a piacra tételt"

Ma a szerep csak a stílus-panel legördülőjéből osztható ki. A piacra bocsátás
viszont **a játékos lenyitott lapjáról** megy (`buildHubDetail`, a posztcsere és
a poszt-tanulás alatt). Ugyanoda kerül a szerep is:

```
🎽 Szezon-szerep
   [ Nyitó ▾ ]   ← csak azok a szerepek, amikre EZ az ember jelölhető
   Jelenleg: Befejező · a szerepet bármikor átírhatod, a következő meccstől él.
```

A legördülő ugyanazt a `roleAssign(key,name)`-t hívja, amit a stílus-panelé — a
`roleEligible(key,p)` szűri a listát, és aki egyetlen szerepre sem jelölhető,
annál a blokk meg sem jelenik. Aki már visel szerepet, annál a „— nincs szerep —"
opció veszi le.

**Miért nincs megerősítő kérdés:** a szerep szezonon belül szabadon átírható, nem
visszafordíthatatlan — ugyanaz az indok, amiért a stílus-panel legördülője sem
kérdez (lásd a `styleBindPanel` megjegyzését).

---

## 2. A csapatstílus-szint (1–20)

### 2.1 Miért kell

Ma a „szint" implicit: hány képességet nyitottál ki. Ez két okból kevés:

* nem méri a **mérföldköveket**, pedig azok a stílus tényleges teljesítménye;
* nem tesz különbséget a **félig** és a **teljesen** kifejlesztett képesség
  között, pedig a kérés szerint épp az utóbbi a legnehezebb és a legértékesebb.

### 2.2 A mért gazdaság — amiből a görbe következik

Mérve a mai `index.html`-ből:

| stílus | elérhető mérföldkő-pont | mérföldkő-sor | képességfa teljes ára | képesség |
|---|--:|--:|--:|--:|
| 🧱 Beton | 1654 | 102 | 1938 | 15 |
| 🌀 Tiki-Taka | 1256 | 94 | 1580 | 10 |
| ⚽ Bombázók | 1123 | 95 | 1872 | 12 |
| 🛡️ Panzer | 953 | 74 | 1440 | 10 |
| ☯️ Harmónia | 828 | 67 | 2088 | 13 |
| ⭐ Sztár | 750 | 56 | 1656 | 11 |
| ⚡ Villám | 628 | 47+ | 1732 | 12 |

A hét szám nagyon eltér — **ezért nem lehet nyers pontból szintet számolni.**
Egy Beton-menedzser másfélszer annyi mérföldkő-pontot lát, mint egy Villám; ha a
szint a nyers pontból jönne, a filozófiaválasztás egyben szint-választás is
volna. A szint ezért **arányt** mér: mennyit hoztál ki abból, amit EZ a stílus
kínál.

### 2.3 A három csatorna — SXP (stílus-tapasztalat), 0–1000

```
SXP = A + B + C

A  MEGNYITOTT SZINTEK      0–400   400 × (a fára elköltött pont / a fa teljes ára)
B  TELJESSÉ FEJLESZTETT     0–350   350 × (Σ tier-súly a 3/3-as képességeken
   KÉPESSÉGEK                            / Σ tier-súly az összesen)      tier-súly: I=1, II=2, III=3
C  MÉRFÖLDKÖVEK             0–250   250 × (szerzett mérföldkő-pont / elérhető)
```

**A súlyozás a kérést követi:** „legnagyobb hatást a képességnyitások, azon belül
is a teljessé fejlesztett képességek adnák, de vinnék előre a mérföldkövek is."
A két képesség-csatorna együtt 750, a mérföldkövek 250 — és a B csatorna azért
külön él, hogy egy 3/3-as képesség **kétszer** fizessen: egyszer az árával az
A-ban, egyszer a teljességével a B-ben.

**Tier-súly a B-ben**, mert egy III. sávú képesség végigfejlesztése (40+68+108 =
216 pont) háromszor annyi, mint egy I. sávúé (76 pont).

**A 1000-es tető nem elérhető véletlenül:** a fa teljes kinyitása 1440–2088
stíluspontot kér, miközben egy stílus mérföldkövei 628–1654-et adnak — a
különbséget az általános mérföldkövek és a kihívás-jutalmak `stylePoints` sora
hozza. A 20. szint ezért **a teljes kiaknázás jutalma**, nem menetrend.

### 2.4 A szintküszöbök

`T(L) = kerekít₅( 1000 × ((L−1)/19)^1,6 )`

| szint | SXP | Δ | | szint | SXP | Δ |
|--:|--:|--:|---|--:|--:|--:|
| 1 | 0 | — | | 11 | 360 | 55 |
| 2 | 10 | 10 | | 12 | 415 | 55 |
| 3 | 25 | 15 | | 13 | 480 | 65 |
| 4 | 50 | 25 | | 14 | 545 | 65 |
| 5 | 85 | 35 | | 15 | 615 | 70 |
| 6 | 120 | 35 | | 16 | 685 | 70 |
| 7 | 160 | 40 | | 17 | 760 | 75 |
| 8 | 200 | 40 | | 18 | 835 | 75 |
| 9 | 250 | 50 | | 19 | 915 | 80 |
| 10 | 305 | 55 | | 20 | 1000 | 85 |

Az 1,6-os kitevő adja a kért „egyre növekvő XP"-t: a 2. szint tíz pont, a 20.
nyolcvanöt. Az első négy szint szándékosan olcsó — a filozófiaválasztás után
azonnal legyen mit látni mozogni.

**Modellezett pályák** (a fára a pont ¾-e megy, a többi csillagozásra):

| kiaknázás | A | B | C | SXP | szint |
|---|--:|--:|--:|--:|--:|
| 30% (2-3 idény) | 120 | 88 | 100 | 308 | **10.** |
| 55% (közép-karrier) | 220 | 175 | 163 | 558 | **14.** |
| 90% (hosszú karrier) | 360 | 315 | 225 | 900 | **18.** |
| 100% | 400 | 350 | 250 | 1000 | **20.** |

### 2.5 Hova kerül az állapotban

Semmi új mentendő adat: mind a három csatorna a MEGLÉVŐ állapotból számolható
(`styleTraitLevel`, `STYLE_TRAIT_PRICE`, `styleMsState().done`, a mérföldkövek
`p` mezője). A szint tehát **származtatott** — `styleLevel()` mindig kiszámolja.

Egy dolgot mégis érdemes menteni: `S.style.lvlSeen` — a legmagasabb szint, amit
a felhasználó már látott. Ebből tudja a panel, mikor kell szintlépést
BEJELENTENI (`addLine` a szezonjelentésen, pötty a menüben).

---

## 3. A stílus-HUB

A mai `styleDashboardHtml()` már csukható kategóriákra bomlik (`styleSecHtml`) —
a kérés a **fejlécet** kéri hozzá: „nagyban ki van írva a mi stílusunk,
jelecskével, színekkel, alatta hogy hányadik szinten járunk vele, alatta néhány
stat, alatta pedig a szokásos lenyitható fülek."

```
┌──────────────────────────────────────────────┐
│ ▌🧱  BETON VÉDELEM                           │  ← a filozófia színe a bal élen
│ ▌   „Aki nem kap gólt, az nem veszít."       │
│ ▌                                            │
│ ▌   ╭───╮   14. SZINT                        │  ← gyűrű: a szinten belüli haladás
│ ▌   │14 │   Bevehetetlen                     │  ← rang-név (lásd 3.2)
│ ▌   ╰───╯   558 / 615 SXP  ·  57 a 15. szintig│
│ ▌   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  ← a szint-sáv     │
│ ├──────────────────────────────────────────┤ │
│ │ 220/400 │ 175/350 │ 163/250 │  ← a három  │ │
│ │ szintek │ teljes  │ mérföld │    csatorna │ │
│ ├──────────────────────────────────────────┤ │
│ │ 412 pont │ 6. szezon │ 3/3 szerep │ 2 csúszka│
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ 🎚 Hangsúlyok                     2/3 húzva ▼│  ← ÚJ kategória
│ 🏛 A klub filozófiája                412 pont ▼│
│ 🧩 Stílus-képességek              18/45 szint ▼│
│ 🎽 Szezon-szerepek        dönts!        2/3 ▲│
│ ⭐ Csillagozás feloldása        3 nyitható ▼│
│ 🏅 Stílus-mérföldkövek              41/102 ▼│
└──────────────────────────────────────────────┘
```

A **három csatorna-mérő** a fejlécben azért fontos, mert ez mondja meg, HOL
lehet még előrelépni: aki 380/400-on áll a szinteknél, de 90/350-en a
teljességnél, az tudja, hogy szét van szórva a fája.

### 3.2 Rang-nevek (20 szint, stílusonként saját szótár)

A puszta szám hideg. Minden filozófia kap húsz saját fokozatot, öt sávban
(1-4 / 5-8 / 9-12 / 13-16 / 17-20). Példa a Betonnál: *Alapozás → Kőműves →
Bástya → Bevehetetlen → A Fal*. A Bombázóknál: *Céllövölde → Gólvágó →
Ágyúpark → Gólzápor → Kilőtt hálók*. (A teljes szótár az implementációval jön;
a rendszer szempontjából egy `STYLE_RANKS[key] = [20 név]` tömb.)

---

## 4. A hangsúly-csúszkák

### 4.1 Az alaki döntés: kétvégű csúszka

A kérés példája két PÓLUST nevez meg („távoli bombák **vs.** ziccerig játszott
helyzetek"), a százalék-leírás viszont egy pro-t és egy con-t. A kettő egyben
áll meg: **minden csúszka kétvégű, középen kikapcsolva.**

```
        ziccerig játszva  ◀────────●────────▶  távoli bombák
                        −100%     0     +100%
```

* **középen (0)** — semmi nem történik, ez az alapállapot;
* **valamelyik vég felé húzva** — az adott pólus **PRO** hatása arányosan
  bekapcsol, és VELE EGYÜTT ugyanannak a pólusnak a **CON** hatása is;
* a két vég nem szimmetrikus tükörkép: külön pro-ja és külön con-ja van.

Így a csúszka tényleg „hangsúlyeltolás", nem egy be/ki kapcsoló.

**Lépésköz:** 10%, mint a hagyományos módú osztályugrás csúszkájánál
(`PYR_LEAP_STEP`) — ott már bevált, és a hüvelykujj is megtalálja.

### 4.2 A hatás nagysága: PRO(L) és CON(L)

```
PRO(L) = 2,5 + 0,95 × (L−1)                       [%]
CON(L) = −0,0634 × (L−1)² + 1,152 × (L−1) + 6     [%]
```

| szint | PRO | CON | arány | | szint | PRO | CON | arány |
|--:|--:|--:|--:|---|--:|--:|--:|--:|
| 1 | 2,5 | 6,0 | 0,42 | | 11 | 12,0 | 11,2 | 1,07 |
| 2 | 3,5 | 7,1 | 0,49 | | 12 | 13,0 | 11,0 | 1,18 |
| 3 | 4,4 | 8,1 | 0,54 | | 13 | 13,9 | 10,7 | 1,30 |
| 4 | 5,4 | 8,9 | 0,61 | | 14 | 14,9 | 10,3 | 1,45 |
| 5 | 6,3 | 9,6 | 0,66 | | 15 | 15,8 | 9,7 | 1,63 |
| 6 | 7,3 | 10,2 | 0,72 | | 16 | 16,8 | 9,0 | 1,87 |
| 7 | 8,2 | 10,6 | 0,77 | | 17 | 17,7 | 8,2 | 2,16 |
| 8 | 9,1 | 11,0 | 0,83 | | 18 | 18,7 | 7,3 | 2,56 |
| 9 | 10,1 | 11,2 | 0,90 | | 19 | 19,6 | 6,2 | 3,16 |
| 10 | 11,0 | 11,2 | **0,98** | | 20 | 20,6 | 5,0 | 4,12 |

Ez pontosan a kért ív:

* **induláskor 2,5% pro / 6% con** — a csúszka ilyenkor **rossz üzlet**, és ezt
  a panel ki is mondja. Ha mégis kihúzod, az szándékos áldozat egy konkrét
  meccsért, nem optimalizálás;
* a negatív **egyre lassabban nő** (a másodfokú tag mínusz), csúcsa a **10-11.
  szint** környékén 11,2%;
* onnantól **csökken**, a 20. szinten 5,0% — miközben a pozitív töretlenül nő.
  A 10-11. szint a **fordulópont**: ott éri utol a haszon a kárt. Innen kezd
  igazán megérni a filozófiában mélyre menni;
* a 20. szinten a csúszka **négyszeres** hasznot ad a káráért — de addigra a
  teljes fát ki kellett nyitni.

### 4.3 A csúszka-állás beszámítása

`t` = a kihúzás mértéke, 0…1 (10%-os lépcsőkben).

```
tényleges PRO = PRO(L) × t
tényleges CON = CON(L) × t^1,25
```

A CON kitevője **szándékosan 1,25**: félig kihúzva a haszon fele jár, a kár
viszont csak a 42%-a. Enélkül a „félig kihúzom" mindig szigorúan rosszabb volna,
mint a „kihúzom vagy nem" — vagyis a csúszka valójában kétállású kapcsoló lenne
tíz fokozat álruhájában. Így viszont a **mértéktartás önálló stratégia**.

### 4.4 A keret — hány csúszkához nyúlhatsz

**A TESZT-KÖR SZABÁLYA (a felhasználó döntése):**

> *„egyelőre a csúszkák, amíg teszteljük a működésüket, legyenek úgy, hogy mind
> az 5 be van építve, és egyszerre 3-nál nyúlhatsz bele, 2-t 0-n kell hagyj."*

Vagyis: **stílusonként mind az ÖT csúszka beépül** (a három javasolt és a két
tartalék is), és **egyszerre legfeljebb HÁROM** állhat nullától eltérő
állásban — kettőt középen kell hagyni. Így mind a harmincöt ötlet
kipróbálható, de egy meccsen továbbra is csak három hangsúly él.

A panel a szabályt kimondja (`3/3 használatban — előbb tegyél egy csúszkát
középre`), és a negyedik csúszka nem mozdul, amíg egy másik nullára nem áll.

**Ami emiatt EGYELŐRE kimarad:** az eredetileg tervezett 150%-os
hangsúly-keret. A kettő ugyanazt a célt szolgálja (a csúszka legyen
átcsoportosítás, ne gyarapítás), és két korlát egymás mellett feleslegesen
bonyolult. A „3-ból 3" egyszerűbb és teszteléshez alkalmasabb; ha a mérés
később azt mutatja, hogy három teljesen kihúzott csúszka túl sok, a 150%-os
keret bármikor MELLÉ tehető.

### 4.5 Mikor állítható

Szabadon, a HUB-ban, két meccs között — mint a csereterv. Mérkőzés közben zárol.
Nincs megerősítő kérdés és nincs költsége: a con-oldal MAGA a költség.

### 4.6 Hol kapaszkodik a motorba

Egyetlen új szorzó-forrás, a szerep-szorzók mintájára:

```js
dialGoalMult(name,pos,min,gf,ga)   /* a gólszerző súlyozásba, a roleGoalMult mellé */
dialAssistMult(name,pos)           /* a gólpassz-súlyozásba */
dialOwnGoalMult(min,gf,ga)         /* a csapat gólvárhatóságába (lf szorzója)  */
dialOppGoalMult(min,gf,ga)         /* az ellenfél gólvárhatóságába (la szorzója) */
dialChanceMult(kind)               /* az oppChance helyzet-bontás esélyeire */
dialMiscPct(channel)               /* lapok, sérülés, forma, összhang, fejlődés… */
```

Mind a hat 1-et (illetve 0-t) ad vissza, ha nincs stílus, nincs szint, vagy a
csúszka középen áll — vagyis a motor feltétel nélkül szorozhat velük, pont úgy,
ahogy ma a `roleGoalMult`-tal teszi.

**Amihez NEM nyúlunk:** a gólok SZÁMÁT eldöntő Poisson-t a csúszkák csak a
`dialOwnGoalMult` / `dialOppGoalMult` csatornán át érintik, és ott is a
`SIM`-plafon (4,5) és -padló (0,15) fog. A helyzet-bontás (`oppChance`) és a
pontrúgás-arány súlyozási kérdés — ott a gólok száma változatlan marad, csak az,
hogy KI szerzi. Ugyanaz az elv, ami a 3.8.20 és a 3.8.22 körnél is állt.

---

## 5. A csúszkák — stílusonként 3 + 2 tartalék

Mindegyiknél: **a két pólus**, a pólus PRO-ja, a pólus CON-ja, és a
kapaszkodási pont.

**A teszt-körben mind az öt beépül** (lásd 4.4) — a „javasolt" és a „tartalék"
jelölés innentől csak azt mondja meg, melyik hármat szántuk a stílus
alaphangsúlyainak.

### ⚽ Bombázók

**1. Lőtávolság** — *„Ziccerig játszva ◀ ▶ Távoli bombák"* (a te ötleted)
* ▶ **Távoli bombák** · PRO: a KKP/TKP/VKP gólsúlya +PRO%; a lövéserő-skilles
  (Tüzérség) emberek külön +PRO%. CON: a CS/ÁÉ gólsúlya −CON%.
* ◀ **Ziccerig játszva** · PRO: a CS/ÁÉ gólsúlya +PRO%, a mesterhármas-hajsza
  (`bzChase`) szorzója +PRO%. CON: a KKP/TKP gólsúlya −CON%, **és befagy a
  rendszer**: ha a legtöbb gólos csatárod formája ≤4/14, a csapat
  gólvárhatósága −CON% az egész meccsre.
* Kapaszkodás: `GOALW` súlyozás + `dialOwnGoalMult`.

**2. Ritmus** — *„Korai roham ◀ ▶ Hajrá-gyilkos"*
* ◀ PRO: az első 30 percben a csapat gólvárhatósága +PRO%. CON: a 70. perctől −CON%.
* ▶ PRO: a 70. perctől +PRO%, és a **Befejező** szerep szorzója +PRO%. CON: az
  első 30 percben −CON%.

**3. Kockázat** — *„Vezetést megőrizni ◀ ▶ Mindenki előre"*
* ▶ PRO: a saját gólvárhatóság +PRO% végig. CON: az ellenfélé +CON% végig.
* ◀ PRO: vezetésnél az ellenfél gólvárhatósága −PRO%. CON: vezetésnél a saját
  gólvárhatóság −CON% (beülés).

*Tartalék A. **Pontrúgás-műhely*** — „Nyílt játék ◀ ▶ Beadás": a
`SETPIECE_GOAL_SHARE` +PRO% és a belső védők pontrúgás-súlya +PRO%, cserébe a
nyílt játékbeli gólsúly −CON%. (A gólok száma nem változik — csak az útja.)

*Tartalék B. **Egy ember ◀ ▶ Az egész sor*** — a csúcscsatár gólsúlya +PRO% a
többi támadó −CON%-ja árán; a másik végén minden támadó +PRO%/2-t kap, de a
mesterhármas-esély −CON%.

### 🧱 Beton védelem

**1. Védelmi vonal** — *„Mélyen tömörülve ◀ ▶ Magasan letámadva"*
* ▶ PRO: a szerelés/blokk-helyzetek (`oppChance`) esélye +PRO%, a kontraindítás
  esélye +PRO%. CON: az ellenfél gólvárhatósága +CON% (a hátunk mögé indított labda).
* ◀ PRO: az ellenfél gólvárhatósága −PRO%. CON: a saját gólvárhatóság −CON%, és
  a kontra-kredit esélye −CON%.

**2. Kapus-utasítás** — *„Vonalon marad ◀ ▶ Kifutó kapus"*
* ◀ PRO: bravúr-esély +PRO%, tiszta lap esélye +PRO%/2. CON: a védők
  tisztázás-eseményei −CON% (kevesebb védő-értékelés, kevesebb szezonkártya-pont).
* ▶ PRO: a védők tisztázás/blokk-eseményei +PRO%, kontraindítás +PRO%. CON:
  bravúr-esély −CON%, és a szöglet-tisztázás sikertelensége +CON%.

**3. Belépő keménysége** — *„Tiszta szerelés ◀ ▶ Keményen odalép"*
* ◀ PRO: lap- és sérülés-esély −PRO%. CON: az ellenfél gólvárhatósága +CON%.
* ▶ PRO: az ellenfél gólvárhatósága −PRO%, a **Kereszttűz** szerep szorzója +PRO%.
  CON: piros lap és sérülés esélye +CON%.

*Tartalék A. **A tábla ◀ ▶ Az összesítés*** — 0:0-nál az ellenfél gólesélye
−PRO% (a tiszta lapért hajtva), de az első kapott gól után +CON%; a másik vég
egyenletes: a tisztalap-esély −CON%, viszont a nagy vereség esélye −PRO%.

*Tartalék B. **Busz-adag*** — a buszsofőr hatása +PRO%, cserébe a saját
gólvárhatóság −CON% és a szurkolói hangulat −CON%.

### ☯️ Béke és harmónia

**1. Terhelés** — *„Rotáció ◀ ▶ Állandó tizenegy"*
* ◀ PRO: a formaingadozás (`PFORM_MAX_MOVE`) −PRO%, sérülés-esély −PRO%.
  CON: az összhang épülése −CON%.
* ▶ PRO: az összhang-építés +PRO%, a taktika-begyakorlás +PRO%. CON:
  sérülés-esély +CON%, és a fáradtság-alapú formaesés +CON%.

**2. Dicsőség** — *„Osztott dicsőség ◀ ▶ Hagyd a legjobbat"*
* ◀ PRO: a gól- és gólpassz-súly a keret felé egyenlítődik (a leggyengébbek
  +PRO%), és a csapatmorál +PRO%. CON: a legjobb ember súlya −CON%.
* ▶ PRO: a legjobb ember gól- és gólpassz-súlya +PRO%. CON: a csapatmorál
  −CON%, és a szórás-alapú mérföldkövek nehezebbek.

**3. Fegyelem** — *„Béke ◀ ▶ Kiállunk magunkért"*
* ◀ PRO: lapok −PRO%, morál +PRO%. CON: az ellenfél gólvárhatósága +CON%.
* ▶ PRO: a **Peace on you!** szerep szorzói +PRO%, az ellenfél gólvárhatósága
  −PRO%. CON: a piros lap esélye +CON%.

*Tartalék A. **Edzés-hangsúly*** — minden tengely +PRO%-kal gyorsabban épül,
cserébe a FŐ tengely −CON%-kal lassabban (a szélesség ára a mélység).

*Tartalék B. **Öltöző ◀ ▶ Verseny a helyekért*** — morál +PRO% / a kispadosok
fejlődése −CON%, illetve mindenki fejlődése +PRO% / a morál −CON%.

### ⭐ Sztárom a párom

**1. Kiszolgálás** — *„Ő az utolsó passz ◀ ▶ Minden labda hozzá"*
* ▶ PRO: a sztár gólsúlya +PRO%. CON: a többiek gólsúlya −CON%, és ha a sztár
  NINCS a pályán, a csapat gólvárhatósága −CON%.
* ◀ PRO: a sztár gólpassz-súlya +PRO%, a társak gólsúlya +PRO%/2. CON: a sztár
  saját gólsúlya −CON% (kevesebb Aranycipő-esély).

**2. Reflektorfény** — *„Védett sztár ◀ ▶ Média-gépezet"*
* ▶ PRO: hírességpont +PRO%, szurkolói bevétel +PRO%. CON: a sztár bére +CON%,
  és a formaingadozása +CON%.
* ◀ PRO: a sztár formaingadozása −PRO%, sérülés-esélye −PRO%. CON: hírességpont −CON%.

**3. Terhelés-menedzsment** — *„Pihentetjük ◀ ▶ Végigjátssza"*
* ▶ PRO: a sztár meccsértékelése +PRO%, fejlődése +PRO%. CON: sérülés-esély
  +CON%, sűrű programban forma −CON%.
* ◀ PRO: sérülés-esély −PRO%. CON: hírességpont és a róla szóló mérföldkövek
  haladása −CON%.

*Tartalék A. **Testőrség adagolása*** — a sztárt ért durva belépők hatása
−PRO%, cserébe a testőr lapjai +CON%.

*Tartalék B. **Utódnevelés*** — a második legjobb fiatal fejlődése +PRO%, a
sztáré −CON%.

### ⚡ Hol jön a mennydörgés?

**1. Tempó** — *„Robbanás szakaszokban ◀ ▶ Végig teljes gázzal"*
* ▶ PRO: gólvárhatóság +PRO% az első 60 percben. CON: a 75. perctől −CON%, és a
  sérülés-esély +CON%.
* ◀ PRO: a 60. perctől +PRO% (frissen tartva). CON: az első félidőben −CON%.

**2. Sáv** — *„Középen átvágva ◀ ▶ Szélen kifutva"*
* ▶ PRO: a JSZ/BSZ gól- és gólpassz-súlya +PRO%, a szélső-felállások
  illeszkedése +PRO pp. CON: a CS/KKP gólsúlya −CON%.
* ◀ PRO: a CS/TKP gólsúlya +PRO%, a **Robben** szerep szorzója +PRO%. CON: a
  szélsők súlya −CON%.

**3. Kontra** — *„Felépített támadás ◀ ▶ Villámkontra"*
* ▶ PRO: a kontra-ablak (`COUNTER_WINDOW`) +1 perc és a kontragól esélye +PRO%.
  CON: az ellenfél gólvárhatósága +CON%.
* ◀ PRO: az ellenfél gólvárhatósága −PRO%. CON: a saját gólvárhatóság −CON%.

*Tartalék A. **Sprint-adag*** — a sebesség-mérés (klubrekord) esélye +PRO%,
cserébe az izomsérülés esélye +CON%.

*Tartalék B. **Fiatal lábak*** — a 23 alattiak gólsúlya és fejlődése +PRO%, a 28
fölöttiek meccsértékelése −CON%.

### 🛡️ Panzerkampfwagen

**1. Agresszió** — *„Higgadtan ◀ ▶ Elszabadulva"*
* ◀ PRO: lapok −PRO%, eltiltás-esély −PRO%. CON: a Megfélemlítés és az
  összezárás hatása −CON%.
* ▶ PRO: az ellenfél gólvárhatósága −PRO%, a szerelés-események +PRO%. CON:
  piros lap +CON%, sérülés +CON%.

**2. Bajtársiasság** — *„Fej lehajtva ◀ ▶ Sérültért bosszú"*
* ▶ PRO: egy saját sérülés után a csapat gólvárhatósága +PRO% a lefújásig. CON:
  onnantól a lapok +CON%.
* ◀ PRO: sérülés után a védekezés +PRO% (összezárnak). CON: a saját
  gólvárhatóság −CON%.

**3. Emberhátrány** — *„Bunker ◀ ▶ Tízzel is támadunk"*
* ▶ PRO: kiállítás után a `SIM.REDMATCH`-büntetés −PRO%-kal enyhül. CON:
  emberhátrányban az ellenfél gólvárhatósága +CON%.
* ◀ PRO: emberhátrányban az ellenfél gólvárhatósága −PRO%. CON: a saját
  gólvárhatóság −CON%.

*Tartalék A. **Lövéserő-kultusz*** — a lövéserő-klubrekord esélye +PRO%,
cserébe a pontosság (gólvárhatóság) −CON%.

*Tartalék B. **Kőkemény iskola*** — az akadémisták keménység-fejlődése +PRO%, a
technikás tengelyeké (Passz) −CON%.

### 🌀 Tiki-Taka

**1. Passzsor** — *„Rövid, biztos ◀ ▶ Hosszú, kijátszós"*
* ◀ PRO: kevesebb labdavesztés — az ellenfél gólvárhatósága −PRO%. CON: a
  tiki-taka gól esélye −CON%.
* ▶ PRO: a tiki-taka gól esélye +PRO%, a passzsor hossza +PRO% (passzrekord).
  CON: az ellenfél gólvárhatósága +CON%.

**2. Karmester** — *„Mindenki passzol ◀ ▶ Egy irányító"*
* ▶ PRO: a **Lát a pályán** szorzója +PRO%, a legjobb passzolód gólpassz-súlya
  +PRO%. CON: ha ő nincs a pályán, a csapat gólvárhatósága −CON%.
* ◀ PRO: minden középpályás gólpassz-súlya +PRO%/2, a passzkémia +PRO%-kal
  gyorsabban épül. CON: a karmester súlya −CON%.

**3. Letámadás** — *„Kicsaljuk őket ◀ ▶ Megfojtjuk a meccset"*
* ▶ PRO: az ellenfél gólvárhatósága −PRO% az első félidőben. CON: a 70. perctől
  +CON% (elfáradnak).
* ◀ PRO: a kontra- és tiki-taka gól esélye +PRO%. CON: az ellenfél
  gólvárhatósága +CON% végig.

*Tartalék A. **Labdatartás-fok*** — a Labdatartás taktika illeszkedése +PRO pp,
cserébe minden más taktikáé −CON pp.

*Tartalék B. **Passzkémia-fókusz*** — a passzkémia kétszer gyorsabban épül
(+PRO%), az általános összhang viszont −CON%-kal lassabban.

---

## 6. Mit érint a kódban — sorrendben

| kör | mit | hol |
|---|---|---|
| **1.** | `styleLevel()`, `styleSxp()`, `STYLE_LEVEL_T`, `STYLE_RANKS` | a `styleTraitLevel` / `styleMsState` mellé |
| **2.** | a stílus-HUB fejléce (`styleHeroHtml`) | `styleDashboardHtml` elejére |
| **3.** | szerep-jelvények: `roleNamesMap`, `.rowRole`, `openRolePanel`, chip | `hubRosterEntries` sor-építő + `rosterCapHtml` |
| **4.** | szerep-kiosztás a játékos lapján | `buildHubDetail` |
| **5.** | `STYLE_DIALS` (7×**5**), `dialState()`, a `🎚 Hangsúlyok` kategória, a „3-ból 3" kapu | új blokk a `ROLE_DEFS` mintájára |
| **6.** | a hat `dial*` szorzó bekötése | `playMatch` gólsúlyozás, `matchLambdas`, `oppChance` |
| **7.** | mentés: `S.style.dials`, `S.style.lvlSeen` | `saveGame` + `applySavedGame` |
| **8.** | glosszárium + `docs/csapatstilus-szintek.md` | — |

**Az 1-4. kör önmagában is kiadható** (szint + fejléc + szerep-jelvények), a
csúszkák nélkül — a szint ugyanis attól még értelmes szám, hogy még nem hajt
semmit. Ez a javasolt vágás.

> **ÁLLAPOT (3.8.26): az 1-4. kör KÉSZ és kiadva** — `styleLevel` / `styleSxpParts`
> / `STYLE_RANKS`, a `styleHeroHtml` fejléc, a `.rowRole` szerep-jelvények a
> keretlistán és a szerep-kiosztás a játékos lapján. Részletek:
> `docs/csapatstilus-szintek.md`. Az 5-7. kör (a csúszkák) a következő.
