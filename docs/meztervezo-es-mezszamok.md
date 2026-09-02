# 👕 Meztervező, mezszámok és a mezes pályakép

*(3.9.00. Az érintett kód mind az `index.html` egyetlen script-blokkjában:
`KIT_*` / `jerseySVG` a szerelés, `JNUM_*` / `numsEnsure` / `numSet` a
mezszámok, `kitViewOn` / `kitViewShown` / `kitViewSync` a pályakép harmadik
nézete, `renderIdentityPanel` 4-6. szakasza a szerkesztő, `makeStarNumDemand` /
`starNumTick` a sztár mezszám-követelése.)*

## 0. Egy mondatban

A klub arculata megkapta a **szerelést** (hazai + idegenbeli mez) és a
**mezszámokat**, a felállás-vizualizáció pedig egy harmadik olvasatot: a
Rating-karikák helyett a **mezek, a hátukon a számokkal** — ez a „meccs-immerzió"
mód. Semmi nem kötelező, semmi nem kerül pénzbe, és mindenre marad egy
koppintás vissza a megszokott képhez.

---

## 1. Miért

A címer (3.7.x) megadta a klub **jelvényét**. A klub a pályán viszont nem a
jelvényét viseli, hanem a **mezét** — és a felállás-képernyőn eddig tizenegy
karika állt tizenegy Rating-számmal. Az egy **táblázat**, nem egy csapat. Aki a
kezdőrúgás előtt a felállását nézegeti, nem számoszlopot akar látni.

A mezhez viszont **szám** kell, a számhoz pedig nyilvántartás — és ha már van
nyilvántartás, a „Sztárom a párom" sztárja kaphat egy olyan követelést, amit
**ingyen** lehet teljesíteni, csak épp oda kell figyelni rá.

---

## 2. A szerelés

`S.ident.kit = {home:{…}, away:{…}} | null`. A `null` itt is azt jelenti, hogy
hozzá sem nyúltál: ilyenkor a pályakép az alapértelmezett szerelést rajzolja, a
mérföldkő viszont nem teljesül.

Egy mez hat mezőből áll:

| mező | mit jelent | értékek |
|---|---|---|
| `c1` | alapszín | bármi (20 elemű paletta + szabad színválasztó) |
| `c2` | második szín (a minta színe) | ugyanaz |
| `pat` | a mez mintája | `solid` · `stripes` · `pin` · `hoops` · `halved` · `sash` · `chevron` · `shoulder` · `checker` |
| `sleeve` | az ujj | `same` (mint a mez) · `alt` (ellenszínű) · `cuff` (csíkos ujjvég) |
| `collar` | a gallér | `crew` (kerek) · `v` (V-nyak) · `polo` (ingnyak) |
| `ink` | a szám és a gallér színe | bármi |

**Nincs képfeltöltés** — ugyanaz az indok, mint a címernél: a mentés
`localStorage`-ben él, egy feltöltött PNG megabájtokban mérhető. Így a mez pár
tucat bájt, minden gépen ugyanúgy néz ki, és SVG-ként minden méretben éles.

### Az alapértelmezett szerelés

A **hazai** a két klubszínből épül, a minta a klub NEVÉBŐL sorsolva (ugyanaz a
név mindig ugyanazt adja — a képernyő nem villog). Az **idegenbeli** a bevált
valóságot követi: világos alap, a klub elsődleges színével, ellenszínű ujjal —
így a hazaival sosem keverhető össze, ami az idegenbeli mez egyetlen feladata.

> **Egy elkapott hiba a hash-ben.** Az idegenbeli minta indexe eredetileg
> `(h>>3) % hossz` volt. A hash előjel nélküli 32 bites; az **előjeles**
> eltolás a felső felén negatív számot ad, a `negatív % hossz` pedig nemlétező
> tömbindexet — vagyis minden olyan klubnévnél, aminek a hash-e 2³¹ fölé esik,
> a szerkesztő megnyitása elszállt. `>>>` a helyes eltolás.

### A mezszám kontúrja

A szám vékony, a tintával ELLENTÉTES színű kontúrt kap
(`paint-order="stroke"`). Nem díszítés: egy csíkos vagy sávos mezen a szám
óhatatlanul átmegy a másik szín fölött is (fehér szám a fehér sávon =
olvashatatlan), és pont a pályaképen, 50 pixeles méretben számít a legtöbbet.
Ugyanezt csinálja minden valódi mezszám-nyomat is.

---

## 3. A mezszámok

`S.squadNums = {v:1, by:{név→szám}, fix:{név→1}}`.

* `by` — **mindenkinek** van száma, akkor is, ha sosem nyitottad meg a
  szerkesztőt: a kiosztás magától fut.
* `fix` — kézzel beállított-e. A kézi szám **ütközésnél is nyer**, és az
  automatikus kiosztás sosem írja felül.

A szám azért **név → szám** leképezés és nem `p.num` mező, mert a
játékos-objektumok a draftból, az akadémiáról és az átigazolásokról jönnek, és
többféle úton másolódnak — egy `p.num` előbb-utóbb elveszne valamelyik ágon. A
képességek (`S.skills`) és a kártyaszintek is a néven élnek.

### A kiosztás (`numsEnsure`)

Idempotens, olcsó (egy keret ~28 fő), ezért minden rajzolás előtt hívható.

1. **Aki elment, elengedi a számát** — különben a kilencvenkilenc szám néhány
   idény alatt elfogyna a régen eladott játékosok alatt.
2. **Ütközés-bontás.** Előbb a rögzítettek: a kézi szám nyer.
3. **A kezdő 11 a megszokott 1-11-et kapja**, posztonként a hagyomány szerint.
   A sorrend hátulról előre megy (`JNUM_XI_ORDER`), hogy a szűk preferenciájú
   posztok (kapus, hatos, tízes) elébe kerüljenek a tágabbaknak:

   | poszt | preferencia |
   |---|---|
   | KP | 1 |
   | JV | 2, 4, 6 |
   | BV | 3, 5, 11 |
   | KV | 5, 4, 6, 2, 3 |
   | VKP | 6, 4, 8 |
   | KKP | 8, 6, 4 |
   | TKP | 10, 8, 7 |
   | JSZ | 7, 11 |
   | BSZ | 11, 7 |
   | CS | 9, 10 |
   | ÁÉ | 10, 9, 7 |

   Ha mind foglalt, a legkisebb szabad 1-11-es szám jön.
4. **Mindenki más súlyozott sorsolást kap 1-99-ből**, a posztjához illő
   számokkal előre húzva.

### A súlyozás (`jnumWeight`)

| eset | súly |
|---|---|
| a poszt **klasszikus** száma (`hi`) | 14 |
| a poszthoz **hihető** szám (`mid`) | 5 |
| 1-11, egyébként | 1,2 |
| 12-25 | 2,2 |
| 26-45 | 1,2 |
| 46-79 | 0,5 |
| 80-99 | 0,8 |

Padon ülő játékosnál az 1-11 külön **×0,3** — az a tartomány a kezdő tizenegyé;
ha egy hely mégis szabadon marad, a csere elviheti, de csak töredék eséllyel.

A `hi` listák (a kérésben megnevezett számokkal együtt):

| szerep | `hi` |
|---|---|
| **kapus** | 1, 12, 13, 22, 25, 30, 31, 33, 40, 50, 71, 99 |
| **védő** | 2, 3, 4, 5, 6, 15, **30, 31, 32, 33, 66, 69**, 44, 55 |
| **középpályás** | 6, 8, 10, 14, **16, 18, 20, 21, 23, 25, 26, 27, 88** |
| **támadó** | 7, 9, 10, 11, **17, 21, 90, 99**, 19, 29, 45, 70, 77, 91 |

A 46-79 sáv a legritkább, a 80-99 viszont megint kap egy kis felhajtóerőt: a
modern futball „nagy szám" divatja miatt.

### A kézi beállítás — ütközésnél CSERE

Ha a kért szám máshol van, a két játékos **megcseréli** a mezét. Ez az, amit egy
öltözőben is tennének, és így nem kell előbb „felszabadítani" a számot ahhoz,
hogy oda tudd adni. Ha a kérőnek még nem volt száma, a másik újat sorsol.

Üres vagy értelmetlen érték = „add vissza a gépnek": a szám felszabadul, és a
következő kiosztás ad újat.

---

## 4. A pályakép harmadik nézete

`S.ident.kitView` — a **mentés része**, mert a „meccs-immerzió" nem egy
futásidejű pillanat, hanem az, ahogy a felhasználó látni akarja a csapatát; egy
újratöltés nem veheti el tőle.

Meznézetben a korong helyére a **soron következő mérkőzés szerelése** kerül,
közepén a mezszámmal.

> **HIBA, AMIT EZ JAVÍT (3.9.04).** A pályakép sokáig MINDIG a hazai mezt adta
> a csapatra — vagyis az idegenbeli szerelés, amit külön meg lehet tervezni,
> soha nem került ki a pályára. (A sáv felirata is kőbe vésve „a hazai
> szerelés"-t mondta.) Márpedig épp ez a mód lelke: a meccsek között azt látni,
> ahogy a csapat a következő mérkőzésre öltözik.
>
> A választ egyetlen függvény adja (`kitAwayNow`), és a KÉP meg a FELIRAT is
> ugyanonnan kérdezi — így a kettő nem csúszhat szét. Három menetrendet ismer,
> a `playMatch` sorrendjében: osztályozó → kupa → bajnokság; mindhárom
> ugyanabban az alakban hordozza a `home` mezőt. Menetrend nélkül (draft,
> szezonon kívül, klasszikus mód) a hazai az alapértelmezés: a pálya a csapat
> otthona.
>
> A forduló-index a LEFÚJÁSIG a futó meccsre mutat (az `S.idx++` csak a
> `fullTime` legvégén jön), ezért ugyanez az egy lekérdezés szolgálja a
> felkészülést, a mérkőzést és a két meccs közti nézelődést. A váltás
> pillanata az `updateStanding` — az minden fordulóváltásnál lefut, sorozattól
> függetlenül —, és csak akkor rajzol újra, ha a meznézet tényleg áll.

| ami lekerül | miért |
|---|---|
| kártyaszint gyűrűje | a RATING nyelvét beszéli |
| Aranylabda-arany, díj-karika | ugyanaz |
| poszt-színű keret | ugyanaz |
| képesség-jelvény (★) | ugyanaz |

| ami marad | miért |
|---|---|
| kapitányi szalag | a mez része |
| sérülés/eltiltás jelvény | **figyelmeztetés**, nem díszítés — a felállás összerakásához akkor is kell |
| a névcímke | a szám önmagában nem mondja meg, ki az |

Az **üres hely** változatlanul a poszt-kódos korong: oda nincs kire mezt adni.

### Három nézet, egy kapu

A pályakép lehet **ratingos karika**, **összhangtérkép** vagy **mez** — de a
felhasználó sosem kerülhet olyan állapotba, amiből nem tudja, hogyan jut vissza
a megszokott képhez. Ezért:

| állapot | mez-kapcsoló | összhang-kapcsoló | párharc-oldalváltó |
|---|---|---|---|
| sima (ratingos karikák) | **látszik** | látszik | látszik |
| összhangtérkép áll | rejtve | látszik | látszik |
| párharc-ellenfél áll | rejtve | rejtve¹ | látszik |
| **meznézet áll** | **látszik** (vissza a ratingekhez) | **rejtve** | **rejtve** |

¹ a párharc-nézet a saját pályaképet rejti el, ott az összhangtérképnek amúgy
sincs mit mutatnia.

Vagyis: a meznézetbe **csak a sima képből** lehet belépni, és onnan **csak oda**
lehet visszatérni — nem az összhangtérképre és nem az ellenfél pályaképére. A
megfigyelés nem vész el: egy koppintás a mezek kikapcsolása, és mindkét váltó
azonnal ott van.

A kapcsoló **két helyen** ugyanaz: a pályakép alatt (`#kitViewBar`) és az
arculat-szerkesztő 6. szakaszában.

---

## 5. A szerkesztő

HUB → Csapatépítés → 🛡️ **A klub arculata**. A képernyő hat szakaszra nőtt:

| # | szakasz | piszkozat? |
|---|---|---|
| 1 | A klub két színe | ✅ |
| 2 | A címer | ✅ |
| 3 | A stadion neve | ✅ |
| 4 | **A szerelés** | ✅ |
| 5 | **Mezszámok** | ❌ **azonnal érvényes** |
| 6 | **Mit mutasson a pályakép** | ❌ **azonnal érvényes** |

A **szétválasztás tudatos**. A szerelés arculat-adat, tehát a címerrel együtt
piszkozaton él: a „Mégsem" tényleg mégsem. A **mezszám** viszont a **keret**
adata — a sztár követelése is rá mutat, és a határideje egy mérkőzés —, egy
piszkozatban ragadt szám némán bukhatna négy heti bért. A **nézetkapcsoló**
pedig nézet: egy előnézetnek szánt kapcsoló, amit menteni kell, nem kapcsoló.

A **teljes alaphelyzet** gomb a szerelést és a nézetet is törli, a **mezszámokat
nem** — azoknak saját újraosztó gombjuk van az 5. szakaszban.

### Mérföldkő

Új, ötödik arculat-fokozat: **👕 Saját szerelés** (`ident_kit`, 4 stíluspont).

A **✨ Teljes arculat** szándékosan a régi hármat kéri (szín · címer ·
stadionnév): a szerelés önálló fokozatot kapott, nem emelte visszamenőleg a
küszöböt egy már teljesített mérföldkövön. Aki a szerelést is megcsinálja, öt
fokozatot visz haza.

---

## 6. A sztár mezszám-követelése („Sztárom a párom")

A stílus eddig **két** követelést ismert: gólonkénti bónusz és béremelés.
Mindkettő **pénzt kér pénzért**, és mindkettő visszautasítható — morál- és
elvágyódás-áron.

A harmadik más: a sztár egy **konkrét mezszámot** kér (`STAR_NUM_WISH`: 7, 9,
10, 11, 17, 21, 23, 99, 8, 5, 70, 88, 30), mert a mostanival nincs megelégedve.
Ez az egyetlen kérése, amit **ingyen** lehet teljesíteni — a szám két koppintás
a szerkesztő 5. pontjában, és ha máshol van, a két játékos megcseréli a mezét.

**A határidő a KÖVETKEZŐ MÉRKŐZÉS.** Ha a kezdőrúgásig nem az övé a szám, a
lefújás után a klub magától kifizeti neki **négy heti bérét**
(`STAR_NUM_WEEKS = 4`, a mai meccs-bérből számolva) — a szezonmérleg
sztár-blokkjában külön soron (`numStar`).

A képernyő ezért **nem** „aláírom / nemet mondok":

| gomb | mi történik |
|---|---|
| 👕 **Odaadom neki a N-est** | most, azonnal, ingyen — a szám cserél gazdát |
| 🕒 **Majd meggondolom** | a követelés élesedik, és a következő meccs után fizet, ha addig nem teljesül |

A halasztás **nem sértődés**: morált nem visz, az elvágyódást nem emeli. Csak
ketyeg. Ez legitim választás is lehet — lehet, hogy a kért szám a kedvenc
nyolcasodé, és inkább fizetsz.

**Auto módban** (végigjátszott szezon) a gép mindig igent mond, ahogy a másik
két követelésnél is. Mezszámnál ez egyben a legjobb kimenet: a szám azonnal a
sztáré lesz, tehát a klubnak nem kerül semmibe — a „majd meggondolom" ág épp
azt kockáztatná, amit a gép nem tud menedzselni: egy határidőt.

A követelés **egyszeri**: mindhárom kimenetnél (teljesült · fizettél · a sztár
közben elment) törlődik. Amíg egy kérés függőben van, újat nem kér.

A **sorsolás súlyai** a három ág között: gólbónusz (csak egyszer az egész
karrierben) · béremelés · mezszám ×2. Mérve ~49% mezszám, ~27% béremelés, ~23%
gólbónusz — a mezszám a leggyakoribb, mert ez az, ami a stílust **figyelem**-adó
játékká teszi, nem csak drágává.

---

## 7. Hangoló számok

`IDENT_MS_SP.kit` 4 (stíluspont) · `JNUM_MIN` 1 · `JNUM_MAX` 99 ·
`STAR_NUM_WEEKS` 4 · `STAR_NUM_WISH` 13 elem · `STAR_DEMAND_W` 0,10
(változatlan: a mezszám a meglévő követelés-sávon osztozik, nem tolja ki a
többi eseményt).

A `jnumWeight` sávos alapsúlyai és a `JNUM_FAV` listák egy helyen állnak — ez a
rendszer első hangolási pontja.

---

## 8. Amit szándékosan NEM csinál

* **A mez nem hat semmire a pályán.** Nincs se csapaterő-, se morál-, se
  kémia-vonzata: önkifejezés, nem gazdasági döntés — ugyanaz a szabály, mint a
  címernél.
* **A meccsközvetítés nem használja a számot.** A napló továbbra is néven szólít
  mindenkit; a szám a pályaképé és a szerkesztőé.
* **Az ellenfél pályaképe (párharc) nem kap mezt.** Az egy befagyasztott
  megfigyelés a társad kereteéről — a te szerelésed ott hazugság volna, az övét
  pedig nem ismerjük.
* **Klasszikus (30-0) módban nincs se mez, se szám.** Ott az arculat-szerkesztő
  sem létezik, tehát a mez mindig az alapértelmezett volna — egy kapcsoló, ami
  semmit nem kapcsol.
