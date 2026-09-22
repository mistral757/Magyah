# 🛒 A bontott állapot és a hat piac (3.9.127 · 3.9.128 · 3.9.129)

## A kérés

> „Tegyük mindegyik csapatstílusnál kidolgozottabbá ezt a részt. Hasonlítson a
> panzerkampfwagenére. Legyen jobban elmagyarázva, milyen tényezők adják ki a
> fő guiding pontszámot (esetünkben a viharszint) — itt ötletem: a top 3
> leggyorsabb sebességattribútumainak összereje az egyik faktor, másik a
> szélsők (védők, középpályások, csatárok) közötti összjáték értékek,
> sebesség skillek és én ezekből számítanám ki valahogy. És lehessen
> mindegyik ilyen stílusnál vásárolni mást is, ne csak csapaterőt. Pl itt a
> villámoknál: sprint mester stábtagnak konkrét tapasztalati szintlépést,
> leglassabb kezdő 11-ben lévő játékosnak extra gyorsítást a sebesség
> edzésre, 1 meccsre szóló sebesség növelő tokent (legolcsóbb), ami egy adott
> posztcsoportban minden játékos sebesség attribútumát 5%-kal növeli egy meccs
> erejéig. Ehhez hasonlóra felépíteni mindegyiket."

Két dolog, és mindkettő ugyanarról szól: **a stílus-szakasz eddig mondott egy
számot, és adott egyetlen gombot.** Most megindokolja a számot, és ad mellé
három rövid döntést.

---

## I. A bontott állapot — négy nevesített tényező

Az állapot (viharszint, gólterhelés, betonszint, harmóniaszint,
passzterhelés, nyomásszint) eddig **egyetlen képlet** volt: a keret tizenegy
legjobbja a stílus tengelyén. Igaz szám, de néma. Mostantól négy tényező adja
össze, és **mind a négy külön sorban, saját magyarázattal látszik a panelen**
— csíkkal, ami mutatja, hol tart a saját plafonján belül.

| # | Tényező | Mit mér | Plafon |
|---|---------|---------|--------|
| 1 | 📐 **Mélység** | a RÉGI képlet, betűre: a keret `men` legjobbja a tengelyen, emberenként `perMan` egység, a `scaleFrom` értéknél nulla | ~330 |
| 2 | 🔺 **Él** | a **három** legjobb ember csúcsa — a 85-ös küszöbtől mérve, emberenként 10 egység | **30** |
| 3 | 🤝 **Összjáték** | a stílus **kulcsposztjain** álló öt legjobb ember egymás közti kötései (`bondOf`), a bevett skálán: `BOND_REF` (55) a nulla, `BOND_SOFT` (88) a maximum | **24** |
| 4 | ✨ **Képességek** | a keret **kész** képességei a stílus tengelyén — a meglévő tengely-térkép (`SKILL_AXIS`) dönti el, mi tartozik hova; a félkész arányosan | **18** |

**Miért marad a mélység a törzs.** A másik három együtt legfeljebb 72 egység,
a mélységé 330 — a kiegészítők tehát a legjobb esetben is a törzs alig ötödét
adják hozzá. Ez szándékos: az állapot ugyanarról szól, mint eddig, csak most
**megindokolja magát**, és ad három új, konkrét fogódzót annak, aki tolni
akarja. A balance nem mozdul el, a magyarázat viszont megjelenik.

### Stílusonként

| Stílus | Tengely | 🔺 Él | 🤝 Kulcsposztok | ✨ Képesség-tengely |
|--------|---------|-------|------------------|---------------------|
| ⚡ Villám | `seb` | a 3 leggyorsabb | **JV · BV · JSZ · BSZ** (a szélsők) | sebesség |
| ⚽ Bombázók | `gol` | a 3 legjobb befejező | CS · JSZ · BSZ · TKP | gól |
| 🧱 Beton | `ved`/`kapus` | a 3 legjobb védekező | KP · JV · BV · KV | védő + kapus |
| ☯️ Harmónia | *(egyenletesség)* | **fordított**: a legjobb és a 11. közti rés szűkülése | *nincs* — a keret gerince | **minden** (`"*"`) |
| 🌀 Tiki-taka | `passz` | a 3 legjobb passzoló | VKP · KKP · TKP | passz |
| 🧲 Gegenpressing | `seb`+`ved` | a 3 legjobb presszelő | VKP · KKP · TKP · JSZ · BSZ | sebesség + védő |

A ⚡ Villám sora **szó szerint a kérés**: top 3 sebesség + a szélsők összjátéka
+ sebesség-skillek.

### ⚠️ Egyik tényező sem függ a felállástól

Mind a négy a **teljes keretből** számol, pontosan úgy, ahogy a mélység eddig
is. Ez nem szépészeti döntés:

* az állapot a **rejtett meccs-erő** tagja (`engOvrBonus` → `hiddenMatchBonus`),
* a **potenciál-kereső** (`msBestConfig`, 3.9.122) pedig felállásokat,
  cseréket, kapitányokat és taktikákat próbálgat ezen a számon.

Ha az állapot a kiállított tizenegytől függne, a kereső önmagát kergetné. És
pontosan ezért helyes a **gyorsítótár** is: `engBaseParts` a keresés idejére
(`_msProbing`) eltárolja a négy tényezőt, mert a kereső a keret *halmazát* nem
mozgatja — a `msWithRestore` az `extraRoster`-t is visszaállítja. A keresésen
kívül nincs gyorsítótár: ott a szám mindig friss.

---

## II. A hat piac (3.9.128)

> „Ennél nem azt vártam tőled, hogy egy az egyben valósítsd meg a villám saját
> bolti termékeit… hanem hogy azt és a panzert vásárlási lehetőségeit
> **mintaként véve** dolgozz ki csapatstílusonként **egy-egy speciális
> piacot**, 3-3 termékkel… De így rendkívül egyhangú lenne."

**Igaza volt.** A 3.9.127 egyetlen sablont — stábtag-lépcső · edzés-gyorsítás ·
posztcsoport-token — másolt hatszor, csak más tengellyel. Az nem hat piac,
hanem egy piac hat festéssel.

A **minta** nem a konkrét termék, hanem az **alak**: cím · ár · magyarázat ·
gomb, és egy tétel vagy **emberre** szól, vagy a **klubra**, vagy **egy
mérkőzésre**. Ezt hozza a Panzer rettenet-boltja és a Villám három tétele.

### 🔧 A boksz — ⚡ Villám

*Tempó: emberre, stábra és egyetlen mérkőzésre szabva.* Ez a három tétel a
projektgazda saját kérése, betűre — a többi piac ehhez és a Panzerhez méri
magát.

| | Ár | Mit csinál |
|---|---|---|
| ⏱️ **Gyújtózsinór** | 25 | egy **posztcsoport** sebessége **+5%**, egy mérkőzésre |
| 🏃 **Rajtblokk** | 90 | a kezdő 11 **leglassabb** embere +25%/fokozat sebesség-edzés, max 4 |
| 🎓 **Sprintmester-kurzus** | 140 | egy **Sprintmester** stábtag egy tapasztalati lépcsőt kap |

### 📈 A gólbörze — ⚽ Bombázók

*Semmi védekezés.* Mind a három tétel a stílus **saját gépezetére** köt be —
a klubrekord szívóerejére és a Kilencesre.

| | Ár | Mit csinál |
|---|---|---|
| 🔥 **Étvágy** | 30 | a **csapat gólesélye +7%**, egy mérkőzésre (`ownGoalMult`) |
| 📕 **Rekordkönyv** | 110 | a rekordhajrá alapból **egy gólra** a csúcstól indul — ez **kijjebb tolja** (max 3×, `bzRecGoalMult`) |
| 🔟 **A Kilences étrendje** | 170 | a Kilences gólonkénti lépcsőzése **3 → 4 → 5** (`bz9GoalMult`) |

### 🧰 A szertár — 🧱 Beton

*Nem gólt vesz, hanem nyugalmat.* A **Hidegvér** szándékosan a Panzer „This is
Sparta!"-jának a **pontos tükörképe**: ugyanaz a jellem-tengely, ugyanaz a
vásárlási alak, ellenkező irány. A két filozófia boltja így beszélget egymással.

| | Ár | Mit csinál |
|---|---|---|
| 🌧️ **Vizes pálya** | 30 | az **ellenfél gólesélye −8%**, egy mérkőzésre (`oppGoalMult`) |
| 🧊 **Hidegvér** | 100 | egy játékos **vérmérséklete egy fokozattal HIGGADTABB** felé |
| 🩹 **Éjszakai gyúró** | 180 | **sérülés-esély −10%**, tartósan, max 3×, egymásra szorzódva (`injMult`) |

### 🍽️ A közös asztal — ☯️ Harmónia

*Az egyetlen piac, ahol nem lehet **egy** embert megvenni.* A vacsora két
emberé, a reggeli az egész öltözőé, a felzárkóztatás célpontját pedig a
rendszer választja. A **Felzárkóztatás** közvetlenül azt a rést szűkíti, amit a
Harmónia saját **Kiegyenlítettség**-tényezője mér — a bolt és az állapot
ugyanarról a mondatról szól.

| | Ár | Mit csinál |
|---|---|---|
| ☕ **Csapatreggeli** | 30 | **morál-padló 68**, egy mérkőzésre (`moraleFloor`) |
| 🤝 **Közös vacsora** | 85 | **két** kiválasztott játékos **összhangja +8** (`bondAdd`) |
| ⚖️ **Felzárkóztatás** | 150 | a kezdő 11 **leggyengébbje +1 Rating**, tartósan, max 3× |

### 🔄 A rondó — 🌀 Tiki-taka

*Minden a passzról, három különböző időtávon.* A token itt szándékosan **más
alakú**, mint a Villámé: **lapos ráadás az egész tizenegyre**, nem százalék egy
posztcsoportra.

| | Ár | Mit csinál |
|---|---|---|
| 🎯 **Ötven passz** | 30 | a csapat **Passz-tengelye +8** (lapos, egész XI), egy mérkőzésre |
| 🔗 **Kettős falazás** | 95 | **két** játékos **passzkémiája egy lépcsőt lép** (`addPassChemPair`) |
| 🧠 **Rondó-tréning** | 160 | a passzkémia **+25%-kal gyakrabban ajánlkozik**, max 3× (`passChemOfferP`) |

### 🧪 A laboratórium — 🧲 Gegenpressing

*Méréssel dolgozik, nem ihlettel.* Mind a három tétel a presszing **saját
motorcsatornáira** köt be — ezeket rajta kívül egyetlen filozófia sem tudja
megvenni.

| | Ár | Mit csinál |
|---|---|---|
| 🫁 **Laktátpuffer** | 30 | **labdaszerzés az ellenfél térfelén +20%**, egy mérkőzésre (`gpPressPerMatch`) |
| 👟 **Közös futás** | 95 | a **gyilkos páros** érése **−3 meccs**, max 3×, négy meccsig (`gpDuoRipeNeed`) |
| 🥅 **Hibakényszer** | 165 | a **kikényszerített hiba +15%**, max 3×, egymásra szorzódva (`gpErrMult`) |

---

### Ami a hat piacban KÖZÖS

**A három árszint.** Mindenhol egy **olcsó, egy mérkőzésre szóló** tétel
(25-30), egy **közepes tartós** (85-110) és egy **drága tartós** (140-180). Így
a hat piac összemérhető marad, pedig teljesen mást árulnak.

**Az árak RÖGZÍTETTEK** (3.9.129) — betűre úgy, ahogy a Panzer
rettenet-boltjában (`DREAD_PRICE_MOD`, `DREAD_PRICE_KAR`, `RETTEGES_PRICE`).

A 3.9.128 első változata a tarifával skálázta őket (`engScaleT`), azzal az
érvvel, hogy a bevétel az állapot-szinttel nő, tehát a fix ár idővel ingyenné
válna. **A projektgazda ezt elutasította:** *„nem jó, hogy scalelnek az árak
itt. Legyenek rögzített árak, akárcsak a panzerkampfwagennél."* És igaza van a
referencia-megvalósításon túl is: a skálázás pont azt a jutalmat vette el,
amiért az ember a filozófiát építi. A Panzernél egy jellem-módosító a
huszadik szinten is ugyanannyiba kerül — csak ott már kevesebb meccs kell
hozzá. **Ez** a fejlődés érzete. A szint (`ENG_PRICE`) ára ugyanígy fix.

**Tizennyolc termék, tíz hatásfajta.** Csak a Villám három tétele ismétlődik
máshol — és az szándékos: az a kérés szó szerinti teljesítése.

| Fajta | Hol | Mit jelent |
|-------|-----|-----------|
| `fx1` | ×4 | egy mérkőzésre szóló hatás a stílus fx-csatornáján |
| `fxN` | ×1 | tartós, halmozódó hatás ugyanott |
| `tune` | ×5 | egyetlen szám a stílus **saját** gépezetében |
| `token` | ×2 | tengely-emelés egy mérkőzésre (százalék **vagy** lapos) |
| `trait` | ×1 | jellem-módosító, a Panzer mintájára |
| `bond` / `passchem` | ×2 | két ember kötése |
| `rating` / `train` / `coach` | ×3 | tartós fejlődés emberre, ill. stábra |

**Egy hely a motorban.** Az `fx1` és az `fxN` tételek **nem kapnak saját
motor-ágat**: beleolvadnak abba a listába, amiből a képességfa hatásai is
jönnek (`styleActiveFx` ← `engShopFx`). Így a motor összes meglévő csatornája
(`ownGoalMult`, `oppGoalMult`, `injMult`, `moraleFloor`, `gpPressMult`)
azonnal használható a boltból is, és a szorzós/összeadódó szabály magától
ugyanaz marad. A `tune` tételek pedig egyetlen sorral hívnak be a stílus saját
függvényébe — a bolt nem párhuzamos rendszer, hanem ugyanannak a gépnek egy
csavarja.

**A gomb sosem hazudik.** Ha egy tétel nem vehető meg, a gomb felirata
megmondja, miért nem (`engShopWhy`) — ugyanaz a minta, mint a szintnél.

**Ami egy mérkőzésre szólt, elfogy** a lefújásnál (`engMatchSpend`), feltétel
nélkül: akkor is, ha a mérkőzésen egy pont sem gyűlt, és akkor is, ha a
posztcsoportból senki nem játszott. A tétel a **nevezésre** szól, nem a
percekre — különben át lehetne vinni a hatást a következő meccsre. Egyszerre
**egy** egymeccses tétel él.

## III. Mi hol lakik

| Fogalom | Hol |
|---------|-----|
| a négy tényező | `engBaseParts` · `engTrunkRaw` · `engElRaw` · `engChemRaw` · `engSkillRaw` |
| a Harmónia fordított éle | `harmoniaEngEl` |
| a keret tengelyértékei | `engAxisRows` · `engAxisVal` |
| a gyorsítótár | `_engPartsCache` · `engPartsCacheClear` (a `msWithRestore` nyitja/zárja) |
| a hat piac táblája | `ENG_DEFS[*].shopN / shopIc / shopD / shop[]` |
| ár, fizetés, számláló | `engShopPrice` · `engPay` · `engBought` · `engBump` |
| a közös kapu | `engShopWhy` · `engShopPicks` · `engShopBuy` |
| `fx1` / `fxN` | **`engShopFx`** → `styleActiveFx` |
| `tune` | **`engTune`** ← `bzRecGoalMult` · `bz9GoalMult` · `passChemOfferP` · `gpDuoRipeNeed` · `gpErrMult` |
| `token` | `engTokenState` · **`engTokenApply`** (← `teamAttrStrengths`) · `engBuyToken` |
| `trait` | `engTraitApply` · `engTraitEnd` |
| `bond` / `passchem` | `engBuyPair` |
| `rating` | `engRatingTarget` · `engBuyRating` |
| `train` | `engTrainKeyFor` · `engTrainTarget` · **`engTrainMult`** (← `addA`) · `engBuyTrain` |
| `coach` | `engCoachList` · `engBuyCoach` |
| a lejárat | `engMatchSpend` (← `engMatchEnd`) |
| a panel | `engPartRow` · `engShopHtml` · `engShopStateTxt` · `engShopPickHtml` · `engSectionBind` |

**A mentés magától viszi:** minden új adat (`E.buy`, `E.tb`, `E.tok`, `E.fx1`)
a stílus-állapot `eng` rekeszében lakik, az pedig a `S.style` / `S.style2`
része — ugyanott, ahol eddig a pont és a szint.

---

## IV. A próba

`tools/stilusbolt-proba.js` (9101-es port, 32 állítás). Három blokkban:

**A) A bontott állapot.** A négy tényező **összege betűre az `engBaseRaw`**, a
mélység betűre a régi képlet (külön újraszámolva), az él a 85-ös küszöbtől mér
és tetőzik, az összjáték csak a kulcsposztokról válogat, a képesség-tétel a
tengely-térképet követi (idegen tengely **nem** számít), a Harmónia éle
fordított — és **a felállás felforgatása után mind a négy szám bitre ugyanaz**
(ezen áll vagy bukik a gyorsítótár helyessége).

**B) Hogy tényleg hat piac, nem egy sablon hatszor.** Mind a hatnak **saját
nevű** piaca van 3-3 termékkel, a tizennyolc azonosító **egyedi**, legalább
**hétféle hatásfajta** szerepel köztük (ma tíz), stílusonként pontosan **egy**
egymeccses tétel van és az a legolcsóbb, az árak a tarifával nőnek, a szint ára
fix.

**C) A tíz hatásfajta, egyenként.** Minden termékfajtának saját állítása van:
az `fx1`-ek tényleg megjelennek a stílus fx-listáján és a lefújás elfogyasztja
őket (egyszerre csak egy él, utána újra vehető); az `fxN` halmozódik és a
max-nál megáll; mind az öt `tune` a **motorban** is mérhető (a rekord-hajrá
tényleg hamarabb armol, a páros érése tényleg rövidül…); a `trait` a **Panzer
tükörképe** és a pályán lévő példány is követi; a `bond`, a `passchem` és a
`rating` a helyes célponton hat, tetőzve; a Villám tokenje **százalék egy
posztcsoportra**, a Tiki-takáé **lapos ráadás az egész tizenegyre** — a próba
mindkét alakot külön méri.

**Amit a próbának meg kellett tanulnia.** A `bzRecGoalMult` a `BZ9_TIERS`
kapuja mögött ül (3. csapatstílus-szint), tehát az első mérés „hatástalannak"
látta a Rekordkönyvet, pedig csak zárva volt. A próba azóta felhúzza a
stílusszintet a méréshez, és külön állítja, hogy a kapu nyitva van — enélkül
egy valódi elromlás is átcsúszna rajta.
