# 🧿 Talizmánok — a kártyarendszer tervezete

**Állapot:** 🟡 **F0–F4a kész (3.9.144)** — a talizmánok születnek, húzhatók,
gyűlnek és látszanak, és **kilenc kategória alaphatása él** (Scout,
Csapatstílus, Taktika, Igazolások, Fejlődés, Stáb, Joker, Morál, Bank). A
megvalósult rész leírása: `docs/talizmanok.md`. Következik az F4b: a Joker
eseménycsomagjainak 16 eseménye az átigazolási pakliban.

**Név:** *Talizmán* — a döntés megszületett (lásd 19. pont). A dokumentum
eredetileg „Sorslap” munkanéven készült; ahol a szövegben **lap** áll, az
innentől a **talizmánt** jelenti, a „pakli” pedig a talizmán-gyűjteményt.

> **A 3.9.141-es döntések** (a felhasználó szavaival): *„Talizmán név jó, 3-ból
> 1, nem vak, minden másban is egyet értek veled. Joker erősíti a negatív
> alacsony eséllyel dolgokat is.”* A 19. pont minden javaslata elfogadva; a
> Joker alaphatása ettől **a jó ÉS a rossz** ritka eseményeket is tolja
> (9.7, 11. pont).

*(Ez TERV-dokumentum, nem leírás. A benne szereplő függvény- és mezőnevek
javaslatok; a meglévő kódra mutató nevek — `dialMul`, `buyDiscountParts`,
`TRANSFER_TYPES`, `msPayout`, `budgetEarn`, `fanWeeklyIncome` stb. — valódiak,
ellenőrizve a 3.9.140-es forráson.)*

---

## 0. Az egymondatos ígéret

> Szezononként három–hat alkalommal **három lefordított lap** közül választasz
> egyet. Mindegyik enyhén erősít egy területet, kétharmaduk ráadásul egy
> **különleges képességet** is hoz, aminek ára van egy MÁSIK területen. Húsz
> lap után a paklid megmondja, **ki vagy te mint menedzser**: a Bankár, a
> Nevelő, a Szerencsejátékos, vagy a Polihisztor.

A roguelite-érzést nem a lap ereje adja, hanem három dolog együtt:

1. **döntés** — melyik hármat látod, abból melyiket viszed, és mit hagysz ott;
2. **identitás** — a pakli iránya látszik, és a lapok egymást erősítik (8. pont);
3. **áldozat** — a jó lapnak ára van, és ezt az árat te választod.

---

## 1. Ami MÁR MEGVAN a kódban — és a lapok erre épülnek

A terv fele arról szól, hogy **nem építünk párhuzamos gépezetet**. A MAGYAH-ban
már most van egy teljes pro-kontra szótár, csak épp máshonnan hívják.

| meglévő | mit tud | a lapoknak mit ad |
|---|---|---|
| **Hangsúly-csúszkák** (`dialMul`, `STYLE_DIALS`) — 20 csatorna, mindegyik **egyetlen** ponton kapaszkodik a motorba (`goalw`, `assistw`, `own`, `opp`, `chance`, `setpiece`, `counter`, `tacticfit`, `dev`, `morale`, `bond`, `inj`, `card`…) | leíróból (`{ch, m, d, szűrők}`) számolt, hibatűrő szorzók | **a meccskártyák és a legtöbb special UGYANEZ a leíró**, csak nem a stílusfából, hanem a pakliból jön. Új motor-kapaszkodó szinte nem kell |
| **Kihívás-jutalmak és -büntetések** (`genReward` / `genPunishment`) — ~30 jutalom, ~20 büntetés, köztük tartósak (`buyDiscount`, `boostDiscount`, `tacticFitUp`, `yellowDown`, `dealEasier`, `trainBoost`, `bondSlow`, `dealHarder`, `salaryCut`…) | kész, tesztelt állapotmezők (`S.buyDiscountChance`, `S.chDealBoost`, …) | a specialok pro és kontra oldalának **harmada** egy már létező jutalom/büntetés tartós, paraméterezett változata |
| **Kedvezmény-rétegek** (`buyDiscountParts` → `BUY_DISC_CAP=0.70`) | forrásonként külön sor, közös padló | a lap-kedvezmény **egy új sor** ebben a listában — nem kerüli meg a padlót |
| **Átigazolási ablakok** (`TW_CP_ROUNDS` 8/15/23 + a nyár = **4 ablak**), esemény-keret (`twEventMax`), esemény-fajták (`TRANSFER_TYPES`) | ablakonkénti keret, súlyozott fajták | a Joker „+1 esemény” és a „Befektetők” új fajta **ide** kerül, egy sorral |
| **Befektető** (Sztárom a párom: `FAME_INV_LEVEL`, heti lelátó 1000–10 000%-a, ledger: `fameInv`) | a pénzmozgás, a hír, a könyvelés | a Joker-befektető **ugyanezt a kifizetést** hívja, csak saját ledger-sorral |
| **Mérföldkő-kifizetés** (`msPayout` → `kind:"cash"` / `sp`) | egyetlen kifizetési pont | a „pénz helyett lap” **itt**, egy elágazással |
| **Könyvelés** (`budgetEarn(amount,cat)`, `LEDGER_CATS`) | minden bevétel EGY kapun megy át | a Bank-lap „+x% minden bevétel” **egy szorzó ezen a kapun** |
| **Heti lelátó** (`fanWeeklyIncome`) | a klub méretéhez mért pénz-mérce | a Bank- és a Joker-összegek **ehhez** mérnek, így megyeiben és BL-ben is ugyanazt jelentik |
| **Fejlődési tempó** (`devTempo()` = euro × tempo × `dialMul("dev")`) | egyetlen szorzó a fejlődés minden ágára | Fejlődés-lap: egy tag a szorzatban |
| **Taktika** (`tacticFit`, `tacticLevelRate`) | illeszkedés, begyakorlás | Taktika-lap: `tacticfit` csatorna + egy szorzó a rátán |
| **Akadémia** (`tryAcademyOpportunity`, 4 fordulónként) · **Scout** (3 jelölt / felderítés) | az ajánlatok ütemezése | Scout-lap: plusz dobás ezeken a kapukon |
| **Stáb** (`COACH_TYPES` 10 típus, `COACH_SLOTS_BASE=3`/`MAX=6`, `COACH_EFFECT_MULT`) | hatás, férőhely, ár | Stáb-lap |
| **Jellem** (karizma 7 · kapcsolódás 9 · vérmérséklet 9 fokozat, `karI/kapI/verI`) · **morál** (`computeMoraleTarget`, `moraleToOvr`) | a skálák és a céltérkép | Morál-lap, jellemhullám |
| **Meccserő-bontás** és az eredményjelző meccserője (3.9.133) | minden tag látszik | a pakli meccs-hatása **saját sort** kap: „🃏 Pakli +0,6” |

**Ami NINCS meg, és új:** a hitel (a kódban nincs kölcsön; a `loan3` a
kölcsönJÁTÉKOS), a ritka események központi jegyzéke (a Jokerhez), és
maga a pakli (adat, húzás, album).

---

## 2. Tizenkét dolog, amire előre érdemes gondolni

### 2.1 A „kártya” szó már foglalt — kétszer is

* **Szezonkártya** (`determineSeasonCards`, ezüst → GODLIKE) — a játékosok
  idény-díja, a kihívás-jutalmak közt „kártya-fejlesztés” is van (`cardUp`);
* **lap** — sárga lap, piros lap; a hangsúly-csúszkák egyik csatornája is
  `card` néven fut.

Ha az új rendszer is „kártya”, a súgóban, a naplóban és a jutalom-szövegekben
három különböző dolog lesz ugyanazon a néven. **Javaslat:** külön név.

| név | mellette | ellene |
|---|---|---|
| **Sorslap** ⭐ | roguelite-hangulat, rövid, a „lap” magyarul természetes | a „lap” a sárga/piros laphoz is jó — de a „sors-” előtag egyértelművé teszi |
| Talizmán | egyedi, a meglévő szótárral nem ütközik | nem húzásra, hanem birtoklásra utal |
| Ereklye | a roguelite-ok (Slay the Spire) szava | komolykodó, nem fociszó |

A terv eredetileg a **Sorslap / pakli / húzás** szavakat használta; a döntés **Talizmán** lett (lásd a fejlécet).

### 2.2 Tizenöt idény alatt 60–80 lap gyűlik — a halmozódást meg kell fogni

3–6 lap/idény × 15 idény. Ha minden lap lineárisan adódik, a 10. idényre
bármelyik kategória alaphatása a többszörösére nő annak, amit „enyhének”
szántunk, és a rendszer a nehézségi görbét is felborítja. **Megoldás
(7. pont):** kategórián belül csökkenő hozam (minden további lap a
0,85-szörösét éri az előzőnek), plusz kategóriánként plafon. A specialok
**nem** csökkennek — azok egyediek, és a duplikátumuk **fúzió** (7.3).

### 2.3 Választás nélkül ez nyerőgép, nem specializáció

A kérés azt mondja, a lap „random jön”, és azt is, hogy „specializáld a
runodat”. A kettő csak akkor fér össze, ha **a kínálat véletlen, a döntés a
tiéd**. **Javaslat:** minden húzás 3 lefordított lap, ebből egyet viszel
(a Slay the Spire-, Hades-, Balatro-minta). Aki nem akar egyiket sem, **passzol**
(6.3) — ez kiskaput is ad, ha egy kontra épp nem fér bele.

### 2.4 A mentés-visszatöltés nem pörgetheti újra a húzást

Roguelite-ban a „töltsd vissza, hátha jobb jön” az egész élményt megöli. A
kódbázisban erre már van minta (`S.lockSeed`, a skill-kalap elő-keverése). **A
húzás tartalma az idény elején ELŐRE ki van dobva és a mentésben ül** —
visszatöltés után ugyanaz a három lap vár.

### 2.5 Párharcban a meccs-hatás a pillanatképbe KELL

Ez ezen a kódbázison már egyszer elsült: a `styleOwnGoalMult()` a helyi
állapotból olvasott, és a párharcban a számoló fél stílusa a társ csapatára is
ráült (a `buildMatchSnapshot` kommentje ma is erről szól). **A meccskártyák és
a meccsre ható specialok számai a `buildMatchSnapshot` sorosítható mezőibe
kerülnek** (`deckOwn`, `deckOpp`, `deckChance`…), a `matchLambdas` onnan
olvas, a helyi pakliból soha.

### 2.6 A kontrának MÁSIK területet kell ütnie — de nem bármelyiket

A kérés: „egy másik területen gyengít valamit”. Ha a kontra véletlenszerű
kategóriát üt, a lap semmit nem mesél. **Javaslat:** minden special
**kézzel írt pár** — a pro és a kontra között történet van („Stadionbővítés:
több szurkoló, de az építkezés idényében gyengébb a hazai pálya”). A
kontra-terület a lapon színnel is látszik (a kontra-sor kis színpöttye a
MÁSIK kategória színe).

### 2.7 A Joker „minden ritka eseménye” jegyzék nélkül nem építhető meg

A kódban több száz `Math.random()<p` van; egy globális szorzó ezeket
válogatás nélkül eltolná (a sérüléseket és a kiállítást is). **Megoldás:** egy
központi jegyzék (`RITKA_ESEMENYEK`, 11. pont) — kulcs, alap-esély, jó/rossz
jelölés, és egyetlen segéd (`ritkaP(kulcs, p)`). A Joker csak a jegyzékben
szereplő eseményeket tolja — **a 3.9.141-es döntés óta a jókat ÉS a rosszakat
is**; a Káosz-elmélet mindkét oldalt tovább erősíti.

### 2.8 A kedvezmények már rétegesek — a lap nem kerülheti meg a padlót

Van stílus-kedvezmény, kihívás-kedvezmény, garantált zseton, boost-kedvezmény,
kezdő-kedvezmény (−50/−33%). A lap-kedvezmény **ugyanabba a listába** kerül
(`buyDiscountParts` új sora, ár-függvényeknél a meglévő szorzó-lánc egy tagja),
és ugyanaz a padló fogja. Enélkül a 10. idényre valami ingyen lenne.

### 2.9 A hitel nem viheti mínuszba a büdzsét

A kód mindenhol azt feltételezi, hogy `S.transferBudget ≥ 0` (a `budgetPay`
ellenőriz). A hitel-törlesztés ezért **nem mehet mínuszba**: ha nincs fedezet,
a hátralék késedelmi kamattal görgetődik, és amíg él, az igazolás zárva
(12. pont). Ez a hitel valódi kockázata — nem egy szám, hanem a mozgástér.

### 2.10 A jellemhullám iránya: a skálák két végén MÁS a „rossz”

A 3.9.88-as Panzer-hiba tanulsága: a kapcsolódásnál a kicsi érték a rossz, a
vérmérsékletnél a NAGY. A hullám irányválasztója ezért nem „fel/le”, hanem
**„jó irány / kemény irány”** tengelyenként, és a `traitFlipRaw(x, rosszFent)`
logikát használja (13. pont).

### 2.11 A mérföldkő → lap csere csak FRISS teljesítésnél

A `msPayout` három úton fizet: friss teljesítés, beragadt jutalom
felszabadulása (`how="held"`), halott kategória (`"top"`). **Csak a friss
teljesítés válthat lapra** — a beragadt jutalom kiváltása egy korábbi döntés
(kategória-nyitás) gyümölcse, azt nem vehetjük el pénzként.

### 2.12 Az első idény: a lap tanítson, ne büntessen

Az első húzás az 1. idény **3–5. fordulójában**, garantáltan: csak átlagos és
ritka, **két Tiszta lap + egy speciális** — hogy az első döntés a „kell-e a
kontra?” kérdésről szóljon, de legyen biztonságos kiút.

---

## 3. A lap anatómiája

```
┌────────────────────────────────────┐   ← KÖRVONAL = erő (ritkaság)
│ 💰 BANK                     ◆◆◆◇  │     bronz · ezüst · arany · holo
│                                    │
│         AZ ARANYTOJÁS              │   ← név (Tiszta lapnál: kategória + rang)
│   „Aki elad, az nem veszít —       │   ← hangulat-idézet, dőlt
│    csak előre kapja meg a jövőt.”  │
│────────────────────────────────────│
│ ALAP  +4,1% minden bevétel         │   ← a kategória alaphatása, a DOBÁS-sal
│       ▰▰▰▰▰▰▰▱▱▱  (3,4–4,6%)       │     (a sávon belüli helye látszik)
│────────────────────────────────────│
│ ✦ +  minden játékos-eladás +12%    │   ← special, pro
│ ✖ −  ● fejlődési tempó −4%         │   ← special, kontra — a ● a MÁSIK
│                                    │     kategória (Fejlődés, türkiz) színe
│────────────────────────────────────│
│ 3. idény · 17. forduló · mérföldkő │   ← honnan jött
│                          #0023     │   ← sorszám a karrierben
└────────────────────────────────────┘
      HÁTTÉR = kategória színe
```

| elem | mit kódol | megjegyzés |
|---|---|---|
| **háttér** | a kategória (10 szín, 9. pont) | a Meccskártyán a tengely ikonja is |
| **körvonal** | a ritkaság = az erő | bronz · ezüst · arany · **holografikus** (lassan futó szivárvány, `prefers-reduced-motion`-nél álló) |
| **drágakövek** ◆◇ | ugyanaz számmal (1–4) | színvak játékosnak is olvasható |
| **dobás-sáv** | a lap ereje a ritkaságán belül | két „arany” lap nem egyforma — ettől van értelme összevetni |
| **kontra-pötty** | melyik területet üti a kontra | a lap egy pillantásra megmondja, mibe kerül |
| **Tiszta lap** | nincs special | a special helyén: „✧ Tiszta lap — erősebb alap (×1,25)” |

---

## 4. Ritkaság és erő

### 4.1 A négy fokozat

| fokozat | körvonal | húzási esély | erő-szorzó (E) | dobás-sáv | special pro : kontra |
|---|---|--:|--:|---|--:|
| **Átlagos** | bronz | 58% | **1,0** | ±15% | **1,0 : 1** |
| **Ritka** | ezüst | 28% | **1,7** | ±15% | 1,3 : 1 |
| **Nagyon ritka** | arany | 11% | **2,7** | ±15% | 1,8 : 1 |
| **Legendás** | holo | 3% | **4,2** | ±15% | **2,5 : 1** |

**Miért nő a pro : kontra arány a ritkasággal?** Ugyanaz az elv, mint a
hangsúly-csúszkáknál (ott az 1. szinten 0,42, a 20.-on 4,1): a mélység fizet. Az
átlagos special **igazi áldozat**, a legendás special **jó üzlet**, aminek
mégis van ára. A kontra abszolút mértéke alig nő (×0,9 → ×1,2), a pro
erősen.

### 4.2 Mekkora egy „E”? — kategóriánként horgonyozva

Minden kategóriának van egy **E-egysége**: az átlagos lap alaphatása. Ez nem
ötletre született, hanem egy meglévő karjára mérve, **nagyjából negyed-ötöd
akkora**, mint egy kihívás-jutalom ugyanazon a területen:

| kategória | 1 E | horgony (meglévő kar) |
|---|---|---|
| Taktika — illeszkedés | +0,8 pp | `tacticFitUp` kihívás-jutalom: 2–7 pp |
| Igazolás — tiszta üzlet | +2,5 pp | `CH_DEAL_SHIFT` = 14 pp (3 tárgyalásra) |
| Bank — minden bevétel | +1,5% | `salaryUp` = +10% szezonkeret |
| Fejlődés — tempó | +2,5% | a tempó-fokozatok közti lépés ~10% |
| Meccs — λ | 0,6–1,2% | 1 OVR ≈ 9% λ (`SIM.K=0,09`) → 1 E ≈ 0,1 OVR |

### 4.3 A dobás látszik

A lap nem „arany, +7%”, hanem „arany, **+7,4%** (6,3–8,5%)”, és a sáv mutatja,
hol áll. Ettől két arany lap összevethető, és a fúzió (7.3) is érthető.

### 4.4 Tiszta lap — a „üres” harmad

A lapok **33%-án nincs special**. Hogy ez ne csalódás legyen, hanem választás:

* a Tiszta lap alaphatása **×1,25** (a dobás-sáv is);
* a lapon a helye nem üres, hanem egy jelvény: **✧ Tiszta lap**;
* stratégiai szerepe van: aki egy szűk, erős irányt épít, és nem akar kontrát,
  az Tiszta lapokat gyűjt — lassabban, de biztonságosan.

### 4.5 Szerencse-számláló (a legendás nem maradhat el örökre)

Egy húzásban 3 lap → idényenként ~12 látott lap → egy legendás megjelenésének
esélye idényenként ~31%. Ez jó ütem, de a szórás nagy: egy karrierben 8 idény
is eltelhet nélküle. **A számláló:** ha **16 húzás** óta nem volt legendás a
kínálatban, a következő húzás egyik lapja biztosan az. A számláló a paklin
látszik („🍀 szerencse: 11/16”) — ez maga is a várakozás része.

---

## 5. Mikor jön lap?

### 5.1 A három forrás

| forrás | mikor | mennyi |
|---|---|---|
| **Ütemezett húzás** | az idény harmadaiban (1–10., 11–20., 21–30. forduló) egy-egy **véletlen** fordulóban, a meccs utáni jutalom-sorban | **3 / idény, garantált** |
| **Mérföldkő** | egy FRISSEN teljesített, pénzt fizető mérföldkő a pénz helyett húzást ad — **p = 25%**, egy kiértékelésből legfeljebb 1, idényenként legfeljebb 2 | az F0 mérése szerint (lásd alább) ~1–2 / idény |
| **Különleges alkalmak** | bajnoki cím · kupagyőzelem · osztályugrás · egy legendás játékos visszavonulása (5.4) | alkalmanként 1 |

**Az F0 mérése (3.9.141):** négy végigjátszott idényben a friss, pénzes
mérföldkövek száma **12 → 5 → 3 → 3** volt. Egy fix 20%-os csere így az első
idényben ~2,4, a harmadikban ~0,6 húzást adott volna — túl nagy szórás. Ezért
lett **25% + idényenként legfeljebb 2 + kiértékelésenként legfeljebb 1** (az
első idény elején négy illeszkedés-mérföldkő egyetlen kiértékelésben
teljesül). Egy valódi végigjátszott idényben: 3 ütemezett + 2 csere.

**A plafon: 6 húzás / idény, mindegy honnan.** Ha a plafon betelt, a mérföldkő
pénzt fizet (ahogy ma), a különleges alkalom pedig **a következő idény első
húzásába** tolódik (nem vész el — ez a trófea joga).

### 5.2 A pénz helyett lap — láthatóan

A hír nem csak annyi, hogy „kaptál egy húzást”:

> 🏁 **MÉRFÖLDKŐ — 50 gól a bajnokságban** · 🃏 a +12 500 helyett **SORSLAP-HÚZÁS**

Tehát látszik, mi volt a tét. A mérföldkő-naplóba (`M.log`) is így kerül, és a
kihagyott pénz az idény-mérlegen egy tájékoztató sorban (nem kiadás, csak
„pakliba ment: 12 500”) — hogy a mérleg nyitó + Σ = záró egyenlősége ne
sérüljön.

### 5.3 A Joker sűrít

A Joker két speciálja nyúl ehhez (9.7): **Kártyaeső** (+1 ütemezett húzás és
+1 plafon) és a húzás helyett több lapot mutató **Kaszinó**. Más semmi nem
lépheti át a 6-os plafont.

### 5.4 Az öröklap — a saját történetedből

Amikor egy nálad **legalább 5 idényt** töltött, 85+ csúcsú játékos
visszavonul, a következő húzás egyik lapja
**róla szóló öröklap** — egyedi, csak ebben a karrierben létező lap, a
posztja szerinti kategóriában:

> 🃏 **KOVÁCS ÁDÁM ÖRÖKSÉGE** *(nagyon ritka, Fejlődés)*
> „Tizenegy idény, 214 gól. A folyosón még mindig az ő mezszáma lóg.”
> ALAP: +6,8% fejlődési tempó
> ✦ + minden **csatár** akadémista induló POT-ja +8%
> ✖ − a 9-es mez egy idényig senkinek nem adható *(a morál-kontra: aki mégis felveszi, −4 morál-jel)*

Ez a rendszer **érzelmi horgonya**: a pakli nem csak statisztika, hanem a
klubod krónikája.

---

## 6. A húzás

### 6.1 A képernyő

1. Három lap **hátlappal** érkezik (a hátlap a klub címere a te színeiddel).
2. Egyenként fordulnak (koppintásra vagy magától); a ritkaság a fordulás
   előtt egy fénycsíkkal jelzi magát: a holo lap **előbb csillan**, mint
   ahogy látszana.
3. A három lap egymás mellett; koppintásra nagyítva olvasható.
4. **Választás**: egyet a pakliba. A másik kettő eltűnik — de a Kártyatárba
   (14.4) „látott” jelöléssel bekerül.

### 6.2 A kínálat összeállítása: „egy ismerős, egy új, egy vad”

Három független ritkaság-dobás, és a kategóriák így:

| hely | kategória |
|---|---|
| 1. lap | a paklid **domináns** kategóriájából (ha még nincs ilyen: véletlen) |
| 2. lap | olyan kategóriából, amiből **0–1** lapod van — felfedezés |
| 3. lap | teljesen véletlen (lehet Meccskártya is) |

Három különböző kategória garantált. Ettől egyszerre lehet **mélyíteni** és
**elágazni**, és a döntés soha nem triviális.

### 6.3 Passz

Ha egyik lap sem kell: **passz** → +2 a szerencse-számlálóra, és a húzás
tizedét érő pénz (a heti lelátó 50%-a). A passz is húzásnak számít a
plafonban. Szándékosan gyenge kárpótlás: a passz vészkijárat, nem stratégia.

### 6.4 Mikor fut le?

**Ahogy megvalósult (3.9.141):** a meccs utáni lánc végén, a jutalom-képesség,
a felfedezés és az akadémiai ajánlat UTÁN, a mérkőzés-értékelő előtt
(`afterAllRewards` → … → `tryAcademyOpportunity` → **`talPostMatch`** →
`mstatAfterMatch`). Így a képernyők nem ütköznek.

A terv eredetileg azt mondta, hogy a húzás nem halasztható. A megvalósítás
ennél engedékenyebb: van **„Később döntök”** gomb, mert a húzás
**végigjátszásnál** úgyis vár (a talizmán döntés, a gép nem hozza meg
helyetted). A várakozó húzás a Talizmánok menüben ugyanazzal a kínálattal
folytatható, és a HUB 🧿 jelzéssel figyelmeztet rá. A kínálat seedelt, ezért a
halasztás nem ad új esélyt.

---

## 7. Halmozódás, fúzió, égetés

### 7.1 Csökkenő hozam kategórián belül

Egy kategória alaphatásait **erősség szerint csökkenő sorrendben** összegezzük:

```
összeg = Σ  E_k × 0,85^k        (k = 0, 1, 2, … a lapok sorrendje)
```

| lapok száma | hatékonyság (az utolsó lapé) | az összeg aránya a lineárishoz |
|--:|--:|--:|
| 1 | 100% | 100% |
| 3 | 72% | 86% |
| 5 | 52% | 74% |
| 8 | 32% | 61% |
| 12 | 17% | 47% |

A paklin minden kategória mellett ott áll a **következő lap hatékonysága**
(„a következő Bank-lap 52%-ot érne”) — tehát a döntés adata, nem rejtett
mechanika. A rezonancia (8.2) épp ezt ellensúlyozza annak, aki tudatosan
specializál.

### 7.2 Kategória-plafonok

| kategória | alaphatás-plafon |
|---|---|
| Scout — +1 jelölt esélye | 100% |
| Stílus — fa- és csillagozás-ár | −30% |
| Stílus — mérföldkő-bevétel | +40% |
| Taktika — illeszkedés | +8 pp |
| Taktika — begyakorlás | +50% |
| Igazolás — tiszta üzlet | +20 pp |
| Fejlődés — tempó | +20% |
| Fejlődés — edzés | +40% |
| Stáb — hatás | +35% |
| Bank — minden bevétel | +15% |
| Meccs — tengelyenként | 10 E, **és a λ-ra összesen ±8%** (≈ ±0,85 OVR) |

### 7.3 Fúzió — ugyanaz a special kétszer

Ha olyan speciált húzol, ami már megvan, a húzás-képernyő felajánlja:
**„Összeolvasztod?”** A két lap egy lappá válik, **eggyel magasabb
ritkasággal** (két arany → holo), az alaphatás a jobbik dobást viszi. Két
legendás → **Mítosz** (ötödik, csak fúzióból elérhető fokozat: E = 6,0, pro :
kontra = 3,5 : 1, sötét-arany körvonal). A Mítosz az egyetlen út a 4,2-es
plafon fölé — egy karrierben jó esetben egy-kettő.

### 7.4 Égetés — a vállalt kontra nem örök börtön

Idényenként **egyszer** elégethetsz egy lapot: a pro és a kontra is megszűnik,
cserébe +3 a szerencse-számlálóra. Az égetés **a nyári ablakban** lehetséges
(akkor van idő újratervezni). Miért kell: ha stílust váltasz, egy korábbi
stílus-kontra értelmetlenül kínozna.

---

## 8. A pakli iránya és a rezonancia

### 8.1 A domináns szín és a menedzser-archetípus

A pakli fejlécének háttere a **domináns kategória** színe (ahol a legtöbb E
van), mellette egy 10 szegmensű színsáv mutatja az eloszlást. A domináns
kategória **címet** ad a menedzsernek:

| domináns | cím | | domináns | cím |
|---|---|---|---|---|
| 🔭 Scout & Akadémia | **A Felfedező** | | 🎓 Stáb | **Az Iskolamester** |
| 🎭 Csapatstílus | **A Filozófus** | | 🃏 Joker | **A Szerencsejátékos** |
| 📋 Taktika | **A Stratéga** | | ❤️ Morál | **A Lélekbúvár** |
| 🤝 Igazolások | **Az Alkusz** | | 💰 Bank | **A Bankár** |
| 🌱 Fejlődés | **A Nevelő** | | ⚽ Meccs | **A Pályaszéli** |

Ha egyik kategória sem éri el a pakli 25%-át: **A Polihisztor** (szivárvány).
A cím látszik a profilban, a szezonzáró jelentésben, és **párharcban az
ellenfél csapatlapján** — a társad látja, milyen menedzserrel játszik.

### 8.2 Rezonancia — a specializáció jutalma

| egy kategóriában | mit kapsz |
|---|---|
| **3 lap** | *Hangolódás:* a kategória csökkenő hozama 0,85 → 0,90 |
| **5 lap** | *Rezonancia-képesség:* a kategória saját, tisztán pozitív képessége nyílik (lásd alább) |
| **7 lap** | *Mesterlap:* a következő húzás egyik lapja garantáltan legendás ebből a kategóriából |

| kategória | rezonancia-képesség (5 lapnál) |
|---|---|
| 🔭 Scout | minden felderítés egyik jelöltjének POT-ja köd nélkül látszik |
| 🎭 Stílus | a stíluspont-szerzés +5%, a másodlagos stílusé is |
| 📋 Taktika | a taktikaváltás utáni első 3 meccsen nincs illeszkedés-visszaesés |
| 🤝 Igazolások | ablakonként egyszer egy elutasított ajánlat újratárgyalható |
| 🌱 Fejlődés | a szezonkártya POT-ajándéka +10% |
| 🎓 Stáb | a stábtagok Szakértelme idényenként +1 |
| 🃏 Joker | a húzásokon 4 lap közül választasz |
| ❤️ Morál | a morál sosem esik 35 alá |
| 💰 Bank | a hitel-kamat −2 pp, és a Befektetés hozama ×2 → ×2,2 |
| ⚽ Meccs | a legerősebb tengelyed +2 E ingyen (a plafonon belül) |

**Polihisztor-díj:** ha mind a 10 kategóriából van legalább egy lapod, egyszer
egy **szivárványlap** jár: választott kategóriában legendás, special nélkül,
×1,25 alappal.

---

## 9. A tíz kategória

Minden kategóriánál: **szín · az alaphatás két változata** (a lap egyiket
dobja, 50–50) **· kapaszkodási pont · a specialok katalógusa.** A számok az
átlagos lapra (1 E) szólnak; a ritkaság a 4.1 szorzóival nő. A specialok
„min.” oszlopa a legalacsonyabb ritkaság, amelyen a special megjelenhet.

### 9.1 🔭 Scout & Akadémia — **zöld** (#2e7d4f)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Bővebb lista** | egy felderítés 12% eséllyel **4** jelöltet hoz a 3 helyett | a scout-jelölt generálás |
| **Nyitott kapu** | a páratlan négyes fordulókban (`S.idx%4===2`) is 15% eséllyel jön akadémiai ajánlat → ~+1 ajánlat/idény | `tryAcademyOpportunity` |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Ködoszlató** | ritka | egy posztcsoport scout-jelöltjeinek POT-ja köd nélkül látszik (holo: mind) | vételárak +3% *(Igazolások)* |
| **Visszatérő fiúk** | ritka | az akadémiai visszatérés sávja +1 ratinggel feljebb (holo: +3) — a 3.9.134-es évsávokra | az akadémián hagyott fiatalok után idényenként tartásdíj: a heti lelátó 20%-a/fő *(Bank)* |
| **Tehetségvásár** | átlagos | nyaranta +1 ingyen Klub-szemle pörgetés | stábpiac 4 → 3 ajánlat *(Stáb)* |
| **Faluról a nagyvárosba** | nagyon ritka | az akadémiai felfedezettek induló POT-ja +6% | a 24+ évesek fejlődése −4% *(Fejlődés)* |
| **Megfigyelő a lelátón** | átlagos | minden checkpoint-ablakban +1 felderítés | a nyári átigazolási esemény-keret −1 *(Joker)* |
| **Külföldi iroda** | legendás | minden felderítés egyik jelöltje egy osztállyal feljebbről jön (+3 Rating körül) | az ő áruk +10% *(Igazolások)* |

### 9.2 🎭 Csapatstílus — **lila** (#6b3fa0)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Olcsóbb fa** | a stílus-képességek és a csillagozás-jog ára −3% | a trait-ár és a csillagozás-ár függvény |
| **Mérföldkő-prémium** | a mérföldkő-kifizetések (pénz és stíluspont) +4% | `msCashReward` / `msSpReward` |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Egy úr, egy út** | átlagos | az elsődleges stílus minden forrásból +8% stíluspontot kap | taktikaváltás után 5 meccsig −2 pp illeszkedés *(Taktika)* |
| **Két hazát szolgál** | ritka | a másodlagos stílus meccserő-plafonja `STYLE2_OVR_DIV` 2 → 1,6 (holo: 1,3) | fejlődési tempó −3% *(Fejlődés)* |
| **Hangsúly-virtuóz** | nagyon ritka | egyszerre **4** csúszka mozdítható a 3 helyett | minden csúszka kár-oldala +10% *(Meccs)* |
| **Beragadt kincs** | ritka | egy beragadt mérföldkő-jutalom 25%-a azonnal kifizet (holo: 60%) | a mérföldkő-kategóriák nyitási ára +15% *(Bank)* |
| **Szerepjáték** | átlagos | a stílusszerepek (`role` csatorna) ereje +6% | aki kikerül a szerepéből, −4 morál-jel *(Morál)* |
| **A mester jegyzetei** | legendás | a csillagozás-jog ára −20% | a licitek kúpcsúcsa −3 pp *(Igazolások)* |

### 9.3 📋 Taktika — **kék** (#1f5fa8)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Jobb illeszkedés** | +0,8 pp taktika-illeszkedés | `tacticfit` csatorna |
| **Gyorsabb tanulás** | +6% begyakorlási ütem | `tacticLevelRate` szorzója |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Tábla és kréta** | ritka | a második legbegyakorlottabb taktika inaktívan is tanul, 20%-os ütemben (holo: 50%) | a másodlagos edzés −15% *(Fejlődés)* |
| **Kaméleon** | átlagos | +1 ingyen felállásváltás / idény | minden FIZETŐS felállásváltás −3 morál *(Morál)* |
| **Pontrúgás-labor** | átlagos | a pontrúgásból eső gólok aránya +20% (`setpiece`) | a kontra-ablak −2 perc (`counter`) *(Meccs)* |
| **Vasfegyelem** | ritka | sárgalap-esély −10% | az utolsó 15 percben saját λ −3% *(Meccs)* |
| **Gyors tanuló** | nagyon ritka | 72-es szint alatt ×1,3 begyakorlás | a téli ablakban −1 felderítés *(Scout)* |
| **Mesterszint** | legendás | a taktika-plafon (`tacticCeil`) +2 | a stábhatás −5% *(Stáb)* |

### 9.4 🤝 Igazolások — **narancs** (#d9822b)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Tiszta üzlet** | +2,5 pp esély, hogy a tárgyalás nem kér magasabb árat | ugyanaz a pont, ahol a `CH_DEAL_SHIFT` ül |
| **Kedvezmény-szerencse** | 4% eséllyel −25% egy igazolásnál | `buyDiscountParts` új sora |
| *(harmadik, ritkább)* **Licitfelhajtó** | a licit-kúp csúcsa +2 pp | a licit-kúp |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Keményfejű alkusz** | átlagos | elutasított licit után a kúp 1,5× gyorsabban tolódik | minden elutasítás −2 morál a keretben — „hír lett belőle” *(Morál)* |
| **Kapcsolati háló** | ritka | nyaranta +1 képesség-keresés és +1 Sztár-piac futás (ha nyitva) | szezonkeret −3% *(Bank)* |
| **Zsákbamacska** | ritka | ablakonként 1 **vak vétel** −40%-kal: a POT rejtve marad az aláírásig | az akadémia idényenként 1-gyel kevesebb ajánlatot ad *(Scout)* |
| **Hűségprémium** | átlagos | a 3+ idénye nálad lévők kikiáltási ára +10% | az új igazolások első 10 meccsén −1 morál-jel *(Morál)* |
| **Villámzár** | nagyon ritka | a piacra bocsátott játékos első ajánlata 5–15 helyett 3–8 fordulón belül | eladás után 3 meccsig −1 pp illeszkedés *(Taktika)* |
| **Ingyen ember** | legendás | idényenként egy igazolás INGYEN (a `freePlayer` jutalom tartós változata) | stíluspont-szerzés −10% *(Stílus)* |

### 9.5 🌱 Fejlődés — **türkiz** (#1a9c9c)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Gyorsabb érés** | +2,5% fejlődési tempó | `devTempo()` szorzata |
| **Hatékony edzés** | +5% attribútum-fejlődés edzésből | az edzés-szorzó (ahol a `trainBoost` ül) |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Ifjú titánok** | átlagos | a 21 alattiak fejlődése +10% | a 30+ évesek morál-jele −1 („mellőzve érzik magukat”) *(Morál)* |
| **Késői virágzás** | ritka | a 28+ évesek hanyatlása −20% | az akadémia idényenként −1 ajánlat *(Scout)* |
| **Specialista** | átlagos | a fő edzés +15% | a begyakorlás −6% *(Taktika)* |
| **Kemény edzés** | ritka | az edzés +20% | sérülés-esély +10% (`inj`) *(Meccs)* |
| **Vattába csomagolva** | nagyon ritka | sérülés-esély −15% | a taktika-illeszkedés −1 pp *(Taktika)* |
| **Csodagyerek** | legendás | idényenként a legfiatalabb kezdőd POT-ja +10% | a 23 alattiak vételára +10% *(Igazolások)* |

### 9.6 🎓 Stáb — **bronzbarna** (#8a5a2b)

| alap-változat | 1 E | kapaszkodás |
|---|---|---|
| **Jobb szakemberek** | a stábtagok hatása +4% | `COACH_EFFECT_MULT` szorzata |
| **Olcsóbb stáb** | a stábtagok ára −5% | `coachSlotPrice` / stábpiac-ár |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Bővített stáb** | nagyon ritka | +1 stábhely (a `COACH_SLOTS_MAX` is 6 → 7) | stáb-kiadás +12% *(Bank)* |
| **Mentorlánc** | ritka | edzővé válás 32 → 30 év, 2000 → 1400 közös perc | a 30+ játékosok vételára +5% *(Igazolások)* |
| **Lojális stáb** | átlagos | stábtag nem távozhat büntetésből (`staffLeaves`), és 3 évvel később öregszik ki | a scout-fejlesztés ára +10% *(Scout)* |
| **Tapasztalatcsere** | ritka | a stábtagok Szakértelme idényenként +1 extra | edzőváltás után egy idényig −10% begyakorlás *(Taktika)* |
| **Fókuszcsoport** | átlagos | a fókusz-keret 2 → 3 játékos (`COACH_FOCUS_MAX_PLAYERS`) | a fókuszon kívüliek morál-hatása −0,5 *(Morál)* |
| **Pályaedző-legenda** | legendás | minden stábtag egy fokozattal feljebb (`COACH_TIERS`) | stáb-kiadás +25% *(Bank)* |

### 9.7 🃏 Joker — **fekete, arany szegéllyel** (#222 / #d4af37)

| alap-változat | a ritkaság szerint | kapaszkodás |
|---|---|---|
| **Vad idény** *(3.9.141 döntés: a rosszakat is)* | a jegyzék MINDEN ritka eseménye — a jók ÉS a rosszak — ×1,08 / ×1,14 / ×1,22 / ×1,34 | `ritkaP()` |
| **Mozgalmas piac** | +1 átigazolási esemény: átlagos **1** ablakban (a nyáriban), ritka **a két rövidben**, nagyon ritka **3** ablakban (nyár + két rövid), legendás **mind a 4-ben** | `twEventMax` |

A második változat az egyetlen alaphatás, ami nem E-vel, hanem **lépcsőben**
nő — pontosan a kérés példája szerint. Halmozva ablakonként legfeljebb +2.

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Befektetők** *(a kérés példája)* | legendás | új átigazolási esemény-fajta, **10%-os** súllyal: **befektető** — egy összegben a heti lelátó **1000–3500%-a** | a taktika-illeszkedés 7%-kal lassabban épül *(Taktika)* |
| **Kártyaeső** | nagyon ritka | +1 ütemezett húzás / idény, és a plafon 6 → 7 | a húzásokon nincs Tiszta lap: mindig special + kontra *(a pakli maga)* |
| **Kétélű penge** | ritka | minden új lap pro-dobása a jobbik 2-ből | minden új lap kontra-dobása a rosszabbik 2-ből *(a pakli maga)* |
| **Fekete bárány** | ritka | papírforma alatti győzelemnél (óriásölés) a jutalmak ×1,5 | esélyesként saját λ −2% *(Meccs)* |
| **Kaszinó** | nagyon ritka | minden húzáson 4 lap közül választasz | minden húzás a heti lelátó 50%-ába kerül *(Bank)* |
| **Káosz-elmélet** | legendás | a JÓ ritka események további +50% | …és a ROSSZAK is további +50% (sérülés, kiállítás, öngól, elvágyódás) *(Meccs)* |
| **Szerencse fia** | átlagos | a szerencse-számláló 16 → 10 húzás | az átlagos lapok mindig a sáv aljáról dobnak *(a pakli maga)* |

**A Befektetők részletei.** A meglévő befektető-kifizetést hívja (Sztárom a
párom, `FAME_INV_LEVEL`), de **saját ledger-sorral** („💼 Befektető — lap”),
és független a hírességtől. A kérés sávja (1000–3500%) szándékosan a sztár-
befektető (1000–10 000%) **alja**: a lap bárkinek ad befektetőt, a sztár
nagyobbat. Idényenként legfeljebb egy. A Sztárom a párom stílusban **a kettő
nem adódik össze egy ablakban** — ha a sztár-befektető már jött, a
lap-befektető helyett „Csendes átigazolási időszak” pörög.

### 9.8 ❤️ Morál — **bordó** (#b0304f)

| alap-változat | a ritkaság szerint | kapaszkodás |
|---|---|---|
| **Jó légkör** | a morál célértéke +0,8 / +1,4 / +2,2 / +3,4 pont, és a mélypontról 10%×E-vel gyorsabban tér vissza | `computeMoraleTarget` |
| **Jellemhullám** | 2 / 3 / 5 / 8 jellem-lépés a következő 10 / 12 / 15 / 20 fordulóban (13. pont) | `karI/kapI/verI` |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Öltözői király** | ritka | a kapitány morál-hatása +40% | a kapitány eladási ára −15% — „a klub arca nem eladó” *(Igazolások)* |
| **Hosszú emlékezet** | átlagos | a győzelmi sorozat morál-lökése fele olyan gyorsan kopik | vereség utáni meccsen saját λ −2% *(Meccs)* |
| **Rangadó-láz** | ritka | rangadón +6 morál-lökés és +2% saját λ | rangadó-vereség után 3 meccsig −2% saját λ *(Meccs)* |
| **Családias légkör** | átlagos | az összhang épülése +10% (`bond`) | 3+ idényes játékos eladásakor −6 morál *(Igazolások)* |
| **Vasakarat** *(Panzer-irány)* | nagyon ritka | a kiállítás nem visz morált | sárgalap-esély +8% *(Meccs)* |
| **Lélekbúvár** | legendás | a jellemhullám irányát minden lépésnél újraválaszthatod, és hullámonként +1 lépés | a stábhatás −4% *(Stáb)* |

### 9.9 💰 Bank — **arany** (#c9a227)

| alap-változat | a ritkaság szerint | kapaszkodás |
|---|---|---|
| **Jobb üzletmenet** | minden bevétel +1,5% × E *(kivéve: játékos-eladás, hitel, visszatérítés)* | `budgetEarn` — egyetlen szorzó |
| **Hitelkeret** | megnyitja / fejleszti a hitelt (12. pont) | új |

| special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|
| **Takarékbetét** | átlagos | idényzáráskor a fel nem használt büdzsé 4%-a kamat (plafon: a szezonkeret 10%-a) | vételárak +3% *(Igazolások)* |
| **Szponzori bónusz** | ritka | minden győzelem után +10% heti lelátó | vereség után −1 extra morál — „a szponzor telefonál” *(Morál)* |
| **Stadionbővítés** | nagyon ritka | a szurkolónövekedés +10% (`fanAdd`) | a felvétel idényében a hazai pálya előnye −0,2 *(Meccs)* |
| **Kötvénypiac** | ritka | a Befektetés (kihívás-jutalom) hozama ×2 → ×2,3 | stíluspont-szerzés −5% *(Stílus)* |
| **Bérplafon** | átlagos | a bérek −6% | a morál célértéke −2 *(Morál)* |
| **Aranytojás** | legendás | minden játékos-eladás +12% | fejlődési tempó −4% *(Fejlődés)* |

### 9.10 ⚽ Meccskártyák — **piros** (#c62828), tengely-ikonnal

A Meccskártya **nem egy lap, hanem tíz alfaj**. Mindegyik a saját tengelyén
gyűlik, és a tengelynek **saját szintje** van a pakliban (a szint = a tengely
E-összege a csökkenő hozam után). **Nem nyúl attribútumhoz, taktikához,
semmihez — csak a mérkőzésen tolja azt a tengelyt**, a hangsúly-csúszkák már
meglévő csatornáin.

| tengely | 1 E a meccsen | csatorna |
|---|---|---|
| 🧤 **Kapus** | ellenfél λ −1,2% | `opp` (kapus-szűrővel: csak ha a kezdő kapus a pályán) |
| 🛡️ **Védők** | ellenfél λ −1,0%, a blokk/gólvonal-mentés aránya +5% | `opp` + `chance` |
| 🎩 **Középpályások** | saját λ +0,5%, ellenfél λ −0,5% | `own` + `opp` |
| ⚡ **Csatárok** | saját λ +1,0%, a csatárok gólsúlya +3% | `own` + `goalw` |
| ✋ **Védések** | a bravúr/ziccer-hárítás aránya +6%, ellenfél λ −0,6% | `chance` + `opp` |
| 🧲 **Labdaszerzések** | a labdaszerzés-esemény +8%, a kontra-ablak +1 perc | `counter` + a presszing-kapaszkodó |
| 🔄 **Labdatartás** | birtoklás +1 pp, az ellenfél helyzetszáma −2% | a helyzetszám képlete (`OPPCH_BASE + la·OPPCH_RATE`) |
| 🎯 **Gólpasszok** | a gólpassz-súly a kreatívak felé +4%, a párkémia λ-bónusza +0,5% | `assistw` + `own` |
| ⚽ **Gólok** | saját λ +0,8%, a mesterhármas-esély +3% | `own` + a `hatTrickUp` jutalom mezője |
| 🌀 **Szabadrúgások** | a szabadrúgás a különleges események közt +12% súly, a belövés 35% → +2 pp | `trySpecialEvent` |

**Mérték.** A λ-ra ható tagok **összesen ±8%-nál** megállnak (≈ ±0,85 OVR a
`SIM.K=0,09` mellett). Egy teljesen „meccsre épített” pakli tehát körülbelül
annyit ér, mint egy jó edző `ovrMod`-ja — érezhető, nem borító.

**Látszik a meccserőben.** A meccserő-bontásban saját sor (`🃏 Pakli
+0,6`), OVR-egyenértékben: `ln(λ-szorzó)/0,09`. Ugyanez kerül az
eredményjelző meccserőjébe (3.9.133), tehát a pakli nem rejtett erő.

| special (meccs) | min. | ✦ pro | ✖ kontra |
|---|---|---|---|
| **Hajrá-gépezet** | ritka | a 75. perctől saját λ +6% | a 0–15. percben saját λ −4% |
| **Villámrajt** | ritka | a 0–15. percben saját λ +8% | a 75. perctől ellenfél λ +4% |
| **Hazai erőd** | átlagos | hazai pályán +0,4 OVR-egyenérték | idegenben −0,25 |
| **Kupavadász** | nagyon ritka | kupameccsen saját λ +3% | bajnokin saját λ −1% |
| **Tizenegyes-hóhér** | átlagos | tizenegyes-értékesítés +10 pp | a szabadrúgás-súly −20% |
| **Betonfal** | ritka | ellenfél λ −3% | saját λ −2% |
| **Tíz ember is elég** | legendás | emberhátrányban a büntetés (`redmatch`) −35% | piros lap esélye +10% (`card`) |

*(Meccskártyánál a kontra a meccs egy MÁSIK tengelyét vagy ablakát üti — ez
is „másik terület”, és itt ez a természetes.)*

---

### 9.11 A második hullám — 20 új special (3.9.142)

> *„Szuperek a példák, légy egy kicsit még kreatívabb. Mármint a mostaniak
> maradhatnak, de adhatsz meg bele izgalmat. […] a pro mindig illik a
> kártyához, de a contra lehet más témájú.”*

Az első hullám speciáljai jórészt egy-egy szám eltolásai. Ezek **történetek,
döntések és kockázatok**. A kontra sokszor egészen más világból jön: a szülők
ügyvédje, az adóhivatal, a sajtó címlapja, a lelátó zaja. A pötty ilyenkor azt
a játékrendszert mutatja, amelyiket a kontra valójában üti.

| kategória | special | min. | ✦ pro | ✖ kontra (terület) |
|---|---|---|---|---|
| 🔭 | **Álomgyár** | nagyon ritka | idényenként egyszer egy „csodagyerek”: induló POT 5000 fölött (holo: 6000) | minden elutasított akadémista után a heti lelátó 30%-a — a szülők ügyvédet fogadnak *(Bank)* |
| 🔭 | **Kémhálózat** | ritka | minden felderítés első jelöltje 10%-kal olcsóbb — tudjuk a fájdalomküszöbét | ablakonként 10% eséllyel lebukik: −5 morál, és a sajtó címlapján vagy *(Morál)* |
| 🎭 | **Filozófiai vita** | ritka | a másodlagos stílus a mérföldköveiből fél / kétharmad / teljes pontot kap a harmad helyett | a morál célértéke −1 — az öltöző nem tudja, kinek higgyen *(Morál)* |
| 🎭 | **Mérföldkő-láz** | nagyon ritka | minden 5. (holo: 4.) mérföldkő dupla jutalmat fizet | ha egy gól hiányzik egy mérföldkőhöz, a gólpassz-súly −10% — mindenki maga akarja *(Meccs)* |
| 📋 | **Titkos fegyver** | nagyon ritka | idényenként 3 (holo: 4) meccsen előhúzható: aznap +4% saját gólvárhatóság | a titkolózás ára: nyáron 1-gyel kevesebb felderítés *(Scout)* |
| 📋 | **Ellenfél-elemző** | ritka | rangadón és esélytelenként +2 pp illeszkedés | az elemzőstáb bére: meccsenként a heti lelátó 3%-a *(Bank)* |
| 🤝 | **Utolsó perces bomba** | nagyon ritka | minden ablak zárásakor 30% eséllyel sztár-ajánlat −30%-os áron | az így érkező −3 morállal kezd — az öltöző irigy *(Morál)* |
| 🤝 | **Visszavásárlási záradék** | ritka | az eladottakat két idényen belül az eladási ár 80%-áért visszavásárolhatod | minden eladás −5% — a záradéknak ára van *(Bank)* |
| 🌱 | **Második tavasz** | legendás | idényenként egy 30 feletti játékos Ratingje +3 | a stábtagok Szakértelme idényenként −1 — minden figyelem az öregeké *(Stáb)* |
| 🌱 | **Versenyszellem** | ritka | posztonként a két legjobb fejlődése +12%, ha egymás riválisai | a padon ülő rivális morál-jele −1 *(Morál)* |
| 🎓 | **A nagy öreg** | nagyon ritka | a legidősebb stábtag idényenként átad egy képességet egy fiatalnak | ragaszkodik a régi rendszerhez: új taktika begyakorlása −10% *(Taktika)* |
| 🎓 | **Nemzetközi konferencia** | ritka | idényenként egy stábtag +3 Szakértelem | idényenként a heti lelátó 60%-a — a repülőjegy nem olcsó *(Bank)* |
| 🃏 | **Pénzfeldobás** | ritka | idényenként 5 (nagyon ritkától 7) meccs előtt érmét dobhatsz: fej → +4% gólvárhatóság | írás → −3%, és két írás egymás után −2 morál *(Morál)* |
| 🃏 | **Tükörvilág** | legendás | karrierenként egyszer: egy idényre minden kontrád PRO-ként hat | a következő idényben minden pro fele erővel *(a talizmánok maguk)* |
| ❤️ | **Bulinegyed** | ritka | 3+ győzelmes sorozatnál +2 morál-cél | a buli utáni edzés −10% a következő meccsig *(Fejlődés)* |
| ❤️ | **A pszichológus** | nagyon ritka | a morál sosem esik 30 (holo: 40) alá | elfoglal egy stábhelyet — a kanapénak is kell a hely *(Stáb)* |
| 💰 | **Tőzsdei bevezetés** | legendás | idényzáráskor a helyezés szerint −5% … +20% hozam a büdzsére | a részvényesek figyelnek: minden vereség −1 extra morál *(Morál)* |
| 💰 | **Szurkolói kötvény** | ritka | most azonnal a heti lelátó 500%-a | két idényen át vereség után −2 morál — a kötvényesek elvárnak *(Morál)* |
| ⚽ | **A 12. játékos** | nagyon ritka | hazai meccsen +2% gólvárhatóság, és az ellenfél piroslap-esélye +20% | a jegyárengedmény ára: a hazai lelátó-bevétel −8% *(Bank)* |
| ⚽ | **Az utolsó szó** | ritka | a 85. perctől, döntetlen állásnál +10% gólvárhatóság | ha ezután mégis kikapsz, −3 morál *(Morál)* |

### 9.12 📦 A Joker eseménycsomagjai (3.9.142 — a katalógusban; hatás: F4)

> *„új események, amik bekerülhetnek az átigazolási esemény pakliban […]
> Ezek csomagokban jönnek amikor ilyen talizmánt választasz, tehát mindig van
> benne 2 új jó és egy új rossz.”*

**A mechanika.** Új Joker alaphatás-változat, az **Eseménycsomag**. A lap
kidobásakor két jó és egy rossz esemény kerül rá a tárból. Kizárólag olyanok,
amelyek még **nincsenek** a paklidban, és nincsenek a kínálat másik lapján
sem. A csomag tartalma **a lapon látszik**, tehát tudod, mit engedsz be a
piacra. Választás után a három esemény a `TRANSFER_TYPES` mellé kerül, a
ritkaság szerinti súllyal (×1 / ×1,3 / ×1,6 / ×2). Egy esemény csak egyszer
kerülhet a paklidba, és ha a tár kifogy, a csomag kisebb.

**A tár: 9 jó, 7 rossz.** Az első öt a kérésből való, a többi kiegészítés.

| | esemény | mi történik (F4-ben) |
|---|---|---|
| ✦ | ⏳ **Az ifjúság forrása** | a klublegenda (a legmagasabb értékelésű 32 feletti, legalább 500 perccel nálad) **10 évet fiatalodik**: az életkora −10, a csúcsa marad, és a hanyatlási görbéje újraindul |
| ✦ | 🏛️ **Igazgatósági ülés** | lásd alább |
| ✦ | 🎽 **Mezszponzor** | lásd alább |
| ✦ | 🌟 **Sztárvilág** | a Sztárom a párom **összes eseménye** a klub arcára (a legmagasabb értékelésű kerettag), akkor is, ha nem ez a stílusod: szurkoló-robbanás, reklámszerződés, befektető — **és a követelések is** (gólbónusz, béremelés, mezszám). A híresség-pont a meglévő gépezeten gyűlik |
| ✦ | 🔁 **A tékozló fiú** | egy korábban eladott játékosod haza akar jönni, az eladási ára feléért |
| ✦ | ⛰️ **Edzőtábor az Alpokban** | a keret összhangja ugrik (a `bondcamp` kétszerese), és 5 meccsen át jobb a forma |
| ✦ | 🚪 **Nyílt nap** | egy környékbeli 16 éves besétál: ingyen, és nagyobb POT-tal, mint bárki az akadémián |
| ✦ | ✈️ **Nyári túra Ázsiában** | a heti lelátó 400–900%-a és +5% szurkoló — cserébe az első két meccsen −3% gólvárhatóság (fáradtság) |
| ✦ | 🎩 **Egy legenda kopogtat** | egy visszavonult világklasszis stábtagnak jelentkezik, fél áron (a stábpiac legjobb szintjén) |
| ✖ | 🥂 **Hírnév-mámor** | egy 21 alatti, nagy POT-ú játékos lecsúszik: 10 meccsen át −30% fejlődés, nagyobb forma-szórás, −1 morál-jel. **Kigyógyítható**: ha 3 meccsre a padra ülteted, magához tér |
| ✖ | 📸 **Öltözői botrány** | −8 morál, és egy elégedetlen kerettag eladását kéri (elvágyódás-szerű döntés) |
| ✖ | 🧲 **Rivális csábítás** | egy riválisod a legjobb emberedet csábítja: megtartási díj (a kikiáltási ár 15%-a), vagy elmegy a kikiáltási áron |
| ✖ | 🧾 **Adóellenőrzés** | a büdzsé 4–10%-a bírság (az ügynökség csillaga csökkenti) |
| ✖ | 💼 **Ügynökháború** | egy ügynök +50% bért követel a védencének; ha nem kapja meg, a játékos 10 meccsen át elégedetlen (−2 morál-jel) |
| ✖ | 🩹 **Balszerencsés edzés** | a legjobb embered edzésen sérül meg, 2–5 meccsre |
| ✖ | 🔒 **Pályazár** | két hazai meccs zárt kapuk mögött: nincs hazai előny, és nincs lelátó-bevétel |

#### 🏛️ Igazgatósági ülés — a tulajdonosok megbízása

Egy idényre szóló megbízás, **legfeljebb 3 elvárással**, ebből a hét fajtából:

| elvárás | a mérce | hogyan kalibrálunk |
|---|---|---|
| **kupasorozat** | legalább egy adott kör (pl. elődöntő) | a mezőny- és a keret-erőből, ahogy a kupa-kihívásoknál |
| **bajnoki helyezés** | legalább X. hely | a kihívás-rendszer 300 idényes mérésével, a te erőviszonyodra |
| **szurkolótábor** | +Y% a tábor az idény végére | a mostani tábor és a ligasáv szerint |
| **büdzsé** | idényvégi egyenleg legalább Z | a szezonkeret arányában |
| **morál** | az idény átlaga legalább M | a mostani morál-célérték alapján |
| **gólszám** | legalább G bajnoki gól | a gólvárhatóságodból |
| **izgalom** | legalább I átlagos izgalom | az izgalom-mutatóból |

**A teljesítés szintje** elvárásonként: ⭐ *kiváló* (a cél 120%-a), ✓
*teljesítve*, ✗ *elbukva*. A jutalom elvárásonként a szezonkeret 4 / 8%-a
(teljesítve / kiváló), a büntetés a 5%-a. Ha mindhárom teljesül: **„a
tulajdonosok bizalma”**, +10% szezonkeret a következő idényben. Ha mindhárom
elbukik: **bizalmi szavazás**, −10% szezonkeret és −10 morál. A megbízás a
HUB-ban a kihívások mellett látszik, élő állással.

#### 🎽 Mezszponzor — a klub arculata eladó

Három ajánlat közül választasz, és mindegyik a **meglévő arculat-szerkesztőn**
(címer, klubszínek) keresztül jelenik meg:

| ajánlat | mit kér | mit fizet |
|---|---|---|
| **Logó a címerben** | egy adott emoji a címereden (pl. 🍺, 🛞, 📱) | hetente a heti lelátó 6–12%-a |
| **Szponzorszín** | a mez egyik színe a szponzoré | ablakonként egy összegben a heti lelátó 150–300%-a |
| **Stadionnév** | a stadion a szponzor nevét viseli (a mostani név zárójelben marad) | idényenként egyszer a heti lelátó 800–1500%-a |

A szerződés 1–3 idényre szól. **Korai felbontás** esetén a hátralévő összeg
fele a kötbér. A szurkolók ízlése is számít: a „tradicionális” klubokon
(régi, sok trófea) a szponzor idényenként −1–3% szurkolót visz.

---

## 10. A számok egy pillantásra — egy lap élete

**Példa: „Az Aranytojás” (legendás Bank, special-lel, dobás: sáv 72%)**

```
alap:    1,5% × 4,2 × (0,85 + 0,72 × 0,30) = +6,7% minden bevétel
         (ha ez a 3. Bank-lapod: × 0,85² → +4,8%)
special: + minden eladás +12%   /   − fejlődési tempó −4%
         pro : kontra ≈ 2,5 : 1  (a 4.1 táblázat szerint)
```

---

## 11. A ritka események jegyzéke (a Joker gerince)

Egyetlen tábla, egyetlen segéd:

```js
const RITKA_ESEMENYEK={
  /* kulcs:        alap-esély/súly helye                      jó? */
  szabadrugas:   {hol:"trySpecialEvent · free_kick_goal (24)",   jo:1},
  ongol_javunkra:{hol:"trySpecialEvent · owngoal_for (10)",      jo:1},
  var_javunkra:  {hol:"trySpecialEvent · var_overturn (25)",     jo:1},
  mesterharmas:  {hol:"hatTrick-esély",                          jo:1},
  alomigazolas:  {hol:"TRANSFER_TYPES · dream (3)",              jo:1},
  akademiai:     {hol:"TRANSFER_TYPES · youth (3)",              jo:1},
  csapatepites:  {hol:"TRANSFER_TYPES · bondcamp (2)",           jo:1},
  befekteto:     {hol:"sztár-befektető",                         jo:1},
  szurkolorobbanas:{hol:"sztár-szurkolórobbanás",                jo:1},
  mezleveszes:   {hol:"mezLeveszes (25% a hajrában)",            jo:1},  // a játékosok szerint vicces, nem jó — lásd F0
  /* a Joker alaphatása ezeket is tolja (3.9.141 döntés), a Káosz-elmélet még jobban: */
  tizenegyes_ellenunk:{hol:"penalty_against (18)",               jo:0},
  ongol_ellenunk:{hol:"owngoal_against (8)",                     jo:0},
  verekedes:     {hol:"fight (17)",                              jo:0},
  elvagyodas:    {hol:"TRANSFER_TYPES · leave",                  jo:0}};
function ritkaP(kulcs,p){ /* p × (1 + jokerSzorzó), de legfeljebb p × 2 és 0,5 */ }
```

**Elv:** csak az kerül a jegyzékbe, ami **tényleg ritka** (≤10% alkalmanként,
vagy egy súlyozott pörgetés kis súlyú tétele), és **egyetlen** ponton
dobódik. A súlyozott pörgetéseknél (különleges esemény, átigazolási fajta) a
szorzó a SÚLYT emeli, tehát a többi tétel aránya csökken — a pörgetések
száma nem nő. F0-ban leltárba vesszük az összes jelöltet; ami nem fér bele a
két szabályba, kimarad.

---

## 12. Bank: a hitel

A kódban ma nincs hitel. A Bank-lap „Hitelkeret” változata nyitja meg.

| legjobb Hitelkeret-lap | keret (a szezonkeret %-a) | kamat | futamidő |
|---|--:|--:|--:|
| átlagos | 15% | 20% | 15 forduló |
| ritka | 25% | 15% | 15 forduló |
| nagyon ritka | 35% | 10% | 20 forduló |
| legendás | 50% | 6% | 30 forduló |
| *minden további Hitelkeret-lap* | *+1 lépcső, az 5. lépcső: 60% · 5%* | | |

**Szabályok:**

* felvenni **átigazolási ablakban** lehet (ott van mire költeni);
* egyszerre **egy** hitel; új csak a régi visszafizetése után;
* a törlesztés **minden lejátszott meccs után**, egyenlő részletben, a bérrel
  együtt — ugyanazon a heti ritmuson, mint a lelátó (a 3.3.09-es szurkolói
  gazdaság ritmusa);
* előtörlesztés bármikor, díj nélkül;
* **ha a büdzsé nem fedezi a részletet:** a hiány +2%/forduló késedelmi
  kamattal görgetődik, és amíg van hátralék, **minden vásárlás zárva**
  (igazolás, boost, stáb). Mínusz büdzsé nincs (2.9). *Megvalósítás
  (3.9.144): minden bejövő pénz előbb a hátralékot viszi — így a büdzsé a
  hátralék végéig nullán áll, és ez maga a zár;*
* könyvelés: három új ledger-sor — `loanIn` („🏦 Hitel-folyósítás”, bevétel),
  `loanPay` („🏦 Hiteltörlesztés”), `loanInt` („🏦 Kamat”). Az idény-mérleg
  így kimondja, mennyibe került a pénz.

**Miért érdekes:** a hitel a **roguelite „most vagy soha” döntése** — a nyár
végén ott az álomjátékos, 30%-kal több kell. A kamat az ára, a zárolt piac a
kockázata.

---

## 13. Morál: a jellemhullám

Amikor felveszed a lapot, **választasz**:

| tengely | „jó irány” | „kemény irány” (Panzer-irány) |
|---|---|---|
| karizma | ↑ az igazi vezető felé | — *(a karizmának nincs „kemény” vége)* |
| kapcsolódás | ↑ „egy igazán jó ember” felé | ↓ a „nehéz eset” felé — Panzerben a Fordított jellemmel ez ERŐ |
| vérmérséklet | ↓ a „földi béke” felé | ↑ a „vandál” felé — Panzerben ugyanígy |

**A hullám:** a lap ritkasága szerinti számú lépés (2 / 3 / 5 / 8), a következő
10 / 12 / 15 / 20 forduló **véletlen** pontjain. Minden lépés egy véletlen
kerettagot mozdít egy fokozattal a választott irányba (egy ember egy
hullámban legfeljebb 2-t). Aki már a skála végén áll, azt kihagyja.

> 🌊 **Jellemhullám** — *Szabó Bence* kapcsolódása: **balhés → nehéz eset**

**Buktató (2.10):** a „jó” és a „rossz” vég tengelyenként más, és Panzerben a
Fordított jellem ezt tükrözi. A hullám irány-logikája a `traitFlipRaw(x,
rosszFent)` szabályt követi, és egy próba méri, hogy a „kemény irány”
Panzerben a Fordított jellemmel **javít** az öltözői hatáson, Panzer nélkül
**ront** rajta.

---

## 14. A menüpont: 🃏 Pakli

A HUB-ban saját gomb, jelvénnyel a meg nem nézett húzásokra.

### 14.1 Fejléc

```
┌──────────────────────────────────────────────────────┐
│  💰 A BANKÁR                              23 lap     │  ← a domináns szín háttere
│  ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱  (10 színszegmens)          │  ← az eloszlás
│  idén: 2/3 húzás (plafon 6) · a következő: 21–30. f. │  ← csak a SÁV, nem a forduló
│  🍀 szerencse 11/16 · 🔥 égetés: 1 elérhető (nyáron) │
└──────────────────────────────────────────────────────┘
```

### 14.2 Fül: Gyűjtemény

Rács, kategóriánként csoportosítva, szűrő színre és ritkaságra. Koppintásra a
nagy lap (3. pont). Az elégetett lapok halványan, áthúzva maradnak — a run
története.

### 14.3 Fül: Összhatás

Kategóriánként:

```
💰 Bank · 6 lap · hatékonyság: a következő lap 44%-ot ér
   alap:   +11,2% minden bevétel  ▰▰▰▰▰▰▰▱▱▱  (plafon 15%)
   hitel:  nagyon ritka keret — 35% · 10% · 20 forduló
   ✦ Aranytojás: minden eladás +12%
   ✦ Bérplafon: bérek −6%
   ✖ fejlődési tempó −4%   ✖ morál-cél −2
```

Alul egy **nettó mérleg** területenként (Fejlődés: +7,5% − 4% = +3,5%) — mert
a kontrák más kategóriák alatt ülnek, és enélkül nem lehetne látni, hogy egy
terület összességében hol áll.

### 14.4 Fül: Kártyatár (a karriereken átívelő gyűjtemény)

Minden valaha **látott** special (akkor is, ha nem választottad) bekerül:
10 kategória × specialok, felfedezve / felvéve / fuzionálva jelöléssel, és a
legnagyobb dobás, amit valaha láttál. A `localStorage`-ban él (ahol a profil
— `30-0-profile-v1` — és az örök csúcsok), tehát egy új karrier **nem** nullázza. Ez a
meta-haladás: „már csak a Káosz-elmélet hiányzik”.

### 14.5 Fül: Rezonancia

A 3/5/7-es küszöbök állása kategóriánként, és a Polihisztor-díj (10/10).

---

## 15. Adatszerkezet és mentés

```js
S.pakli={
  v:1,
  seq:23,                                   // karrier-sorszám a lapoknak
  lapok:[{uid:23, kat:"bank", al:null,      // al: a meccskártya tengelye
          rang:4, dobas:0.72, valt:"bevetel",// melyik alap-változat
          spec:"aranytojas"|null, fuzio:0,
          forras:"ms"|"utem"|"trofea"|"orok", szezon:3, fordulo:17,
          eget:0}],
  utem:{szezon:3, fordulok:[4,13,24], kesz:[4,13],
        kinalat:{13:[…3 előre kidobott lap…]}},   // 2.4 — visszatöltésálló
  hasznalt:2, plafon:6,
  szerencse:{leg:11},
  eget:{szezon:3,db:0},
  hullam:{tengely:"kap",irany:"kemeny",hatra:3,fordulok:[…]}|null,
  hitel:{fok:3, osszeg:18000, reszlet:1080, hatra:9, hatralek:0}|null,
  orokJelolt:null};
```

* **A kínálat az idény elején ki van dobva** (2.4), a mérföldkő-csere dobása
  pedig a mérföldkő-azonosítóból és az idényből seedelt — visszatöltés után
  is ugyanaz.
* A Kártyatár a `localStorage`-ban, a profil mellett: `{latott:{spec:1}, felvett:{spec:1},
  maxDobas:{spec:0.93}}`.
* Régi mentés: `S.pakli` hiányzik → üres pakli, a következő idény elején
  indul az ütemező (az éppen futó idényben nem kap senki visszamenőleg).

---

## 16. Párharc és közös karrier

* Mindkét félnek **saját paklija** van; a húzások helyiek.
* A meccsre ható számok **a pillanatképben** utaznak (2.5):
  `deck:{own, opp, chance, setpiece, counter, fk, pen, redmatch, card,
  hazai, idegen}` — csupa szám, a régi kliens hiánya = semleges.
* A társad csapatlapján (`mpTeamCard`) látszik a **menedzser-archetípusod**
  és a domináns szín — az identitás a párharc része.
* **Beállítás** a karrier-beállításokban: „Talizmánok: be / ki”, és külön „a
  párharcban is”. Alapból mindkettő **be** (egyenlő esély mindkét félnek).

---

## 17. Egyensúly — mit ér egy pakli?

Durva becslés egy átlagos karrierre (~4 húzás/idény, a döntések ésszerűek):

| idény | lapok | ebből special | tipikus erő-kép |
|--:|--:|--:|---|
| 1 | 3–4 | 2 | egy kategória +1–2 E, egy special |
| 3 | 11 | 7 | a domináns kategória 3 lap (Hangolódás), 1 ritka+ special |
| 5 | 19 | 12 | 5 lap egy kategóriában → rezonancia-képesség; ~1–2 legendás |
| 10 | 38 | 25 | két erős irány, 7-es Mesterlap, 1 fúzió |
| 15 | 55 | 37 | a plafonok közelében; a Polihisztor-díj reális |

**Korlátok, amik a görbét fogják:**

1. kategóriánként csökkenő hozam + plafon (7.1–7.2);
2. a meccs-λ összesen ±8%;
3. a kedvezmények a meglévő padlók alatt (2.8);
4. a kontra nem csökken a gyűjtéssel — **a specialok ára a pakli növekedésével
   halmozódik**, tehát a 30. lapnál már számít, mit veszel fel;
5. az F9-ben 100 szezonos szimulációval mérjük: a pakli átlagos
   meccserő-hozama a 10. idényben ne haladja meg a **+1,5 OVR**-t, a bevételé
   a **+15%**-ot.

---

## 18. Ütemterv

| fázis | tartalom | próba |
|---|---|---|
| **F0** ✅ | Leltár és mérés: a pénzes mérföldkövek száma idényenként (12 → 5 → 3 → 3) → a csere-szabály; a ritka-esemény jelöltek helye (`docs/talizmanok.md`) | a mérés a `talizman-proba.js` valódi idényében él tovább |
| **F1** ✅ | Adatmodell, generátor (ritkaság, dobás, special-sorsolás, Tiszta talizmán), seedelt kínálat, mentés, migráció — **hatás nélkül** | `talizman-proba.js` 1–3., 7. blokk |
| **F2** ✅ | Ütemező (3 húzás, harmadokban), mérföldkő-csere, plafon; a húzás-ablak (fordulás, 3-ból 1, passz, később); a Talizmánok menü (irány, sáv, gyűjtemény); HUB-gomb és jelzés | `talizman-proba.js` 4–6., 8. blokk |
| **F3** ✅ | Alaphatások 1–6: Scout, Stílus, Taktika, Igazolás, Fejlődés, Stáb — a csökkenő hozammal és a plafonnal (a 7.1–7.2 ide előrehozva); a 2. hullám 20 speciálja és a Joker eseménycsomagja a katalógusban | `talizman-f3-proba.js`: hatás nélkül BITRE a régi, talizmánnal a várt eltolás, valódi tárgyalás és licit |
| **F4a** ✅ | Joker (Vad idény: a ritka események szorzója a meccsen és a piacon; Mozgalmas piac), Morál (jó légkör + jellemhullám irányválasztóval), Bank (bevétel-szorzó + **hitel** + három ledger-sor); a „zár” a hátralék behajtásával valósul meg (12. pont) | `talizman-f4a-proba.js`: a hitel-életciklus (felvétel → törlesztés → hátralék → behajtás → előtörlesztés → zár); a hullám a valódi húzás-ablakból |
| **F4b** | A Joker eseménycsomagjainak 16 eseménye az átigazolási pakliban (9.12): kézi és automatikus ablakban is | eseményenként egy állítás; az igazgatósági ülés idényvégi értékelése |
| **F5** | Meccskártyák: tíz tengely, pillanatkép-mezők, meccserő-sor, eredményjelző | **párharc-determinizmus**: ugyanaz a meccs mindkét gépen ugyanaz |
| **F6** | A special-katalógus (~60 tétel) kötegekben, kategóriánként | tételenként egy pro- és egy kontra-állítás |
| **F7** | Összhatás fül, csökkenő hozam, rezonancia, fúzió, égetés, archetípus-cím | a csökkenő hozam táblája (7.1) betűre |
| **F8** | Kártyatár (`localStorage`), öröklap, trófea-húzás, új mérföldkő-sáv („Pakli”: lapok száma, legendások, rezonanciák) | |
| **F9** | Egyensúly-mérés (100 szezon), hangolás, súgó-bejegyzés, doksi, teljes regresszió | a 17. pont két korlátja |

A **F1–F2 önmagában is játszható**: lapok jönnek, gyűlnek, látszanak — csak
még nem hatnak. Ott már kiderül, jó-e a *ritmus*, mielőtt a számokon
dolgoznánk.

---

## 19. Döntések — ✅ mind elfogadva (3.9.141)

A felhasználó a Talizmán nevet választotta, a 3-ból 1 húzást, és „minden
másban” egyetértett a javaslattal. Egy kiegészítés: **a Joker a negatív, kis
eséllyel bekövetkező eseményeket is erősíti** (9.7). A 9. kérdés (a
mérföldkő-csere) az F0 mérése alapján: 25%, idényenként legfeljebb 2.

| # | kérdés | a döntés |
|--:|---|---|
| 1 | **Név:** Sorslap / Talizmán / maradjon „kártya”? | **Talizmán** |
| 2 | **3-ból 1**, vagy vak húzás (egy lap, el kell fogadni)? | **3-ból 1** (2.3) — e nélkül nincs specializáció |
| 3 | A Tiszta lap kapjon **×1,25**-ös alapot? | igen (4.4) |
| 4 | A 6-os plafonba a trófea- és öröklap is beleszámít? | igen, de ami kiszorul, a következő idény elejére tolódik (5.1) |
| 5 | **Passz** és **égetés** legyen? | mindkettő, szűken (6.3, 7.4) |
| 6 | **Rezonancia / fúzió / Mítosz** egyből, vagy egy későbbi körben? | a rezonancia egyből (az adja a specializáció értelmét), a fúzió a F7-ben |
| 7 | **Hitel**: a hátraléknál a teljes piac záródjon, vagy csak az igazolás? | a teljes vásárlás (igazolás + boost + stáb) — különben nincs igazi kockázat |
| 8 | **Párharcban** alapból be? | be, kikapcsolható |
| 9 | A mérföldkő-csere **p=20%** jó irány, vagy inkább „idényenként legfeljebb 2 csere”? | p=20%, de F0-ban mérjük, és ha túl sok, fix plafonnal |
| 10 | A Joker **Káosz-elmélete** (a rossz ritka események is nőnek) belefér? | igen — ez a Szerencsejátékos archetípus igazi arca |
