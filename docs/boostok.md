# Boostok — a hét fajta és a Boost-központ

*(3.8.12; 3.8.13 — a kedvezmények; 3.8.18 — az egység ára a klub éves
bevételéhez kötve, lásd `docs/budzse-arzekeny-arak.md`. Érintett kód:
`BOOST_UNIT_KIND` / `BOOST_KINDS`, `BOOST_UNIT_SEASONS` és a `boost*`
függvények (`boostUnitBase`, `boostDiscountMult`,
`boostUnitPrice`, `boostPriceOf`, `boostKindReady`,
`boostOpenPanel` / `boostPickPlayer` / `boostPickAttr` / `boostConfirm`),
az öt új hatás (`applyPlainBoost`, `applyAttrBoost` + `boostAttrRate`,
`applyTsiBoost`, `applyBondBoost` + `bondBoostMult`, `applySkillBoost` +
`boostSkillWeight` / `boostSkillPick`), a jelölések (`boostTagsOf`,
`boostNote`), a `#hubBoostBtn` gomb, valamint a bekötések: a fejlődési kör
`addA`-ága, a `bondMatchTick` két szorzósora és a `skillRealEarner` /
`skillRealPlan`. A két régi fajta változatlan: `applyYouthBoost`,
`applyOldBoost`.)*

---

## 1. Miért kellett

**Bejelentett kérés:** *„Legyen mostantól kiszélesített a boostolási
lehetőségek tárháza."*

A boost az az út, amin a büdzsé **nem igazolásba** megy, hanem abba, akid már
van. Eddig ebből kettő létezett — az ifi-boost és az öreg csirkefogó —, és
mindkettő **kor-kapuhoz** volt kötve: az egyik akadémistára, a másik 30
fölöttire. A keret zöme, a 24–29 éves törzs, egyáltalán nem volt fejleszthető
pénzzel.

Ráadásul a kettő két külön HUB-gomb volt, és semmi nem mondta ki, hogy
ugyanannak a döntésnek a két esete. A **Boost-központ** ezt teszi
összehasonlíthatóvá: egy képernyő, hét sor, mindegyik mellett az ár és a
hatás egy mondatban.

---

## 2. Az egység — egy szám hangolja az egészet

**Az egység az ifi-boost ára.** A `boostUnitBase()` a mérce — **3.8.18 óta a
klub éves bevételének aránya** (`BOOST_UNIT_SEASONS` × `clubBudgetScale()`:
nagyjából egy idénynyi keret) —, a hét fajta pedig ennek egy **arányát**
fizeti. Az ifi-boost pontosan egy egység, tehát `youthBoostPrice()` =
`boostUnitPrice()`.

*(A 3.8.18 előtti mérce a keret legdrágább emberének vételára volt, egy 18 000
pontos padlóval. A csere indoklása és a mért ártábla:
`docs/budzse-arzekeny-arak.md`.)*

Így minden meglévő hangolás (a klub léptéke, a kedvezmény) magától érvényes
mind a hétre, és **egyetlen szám hangolja az egészet**.

| | fajta | egység | hatás |
|---|---|--:|---|
| 💪 | **Sima boost** | 0,5 | Rating +1–4%, TSI +15–45% (min 400, max 2500) |
| 🎯 | **Attribútum boost** | 0,6 | egy választott tengely +1–3%, **és tartósan edződik** |
| 📈 | **TSI boost** | 0,6 | TSI +33–66% (min 1000, max 10 000) |
| 🤝 | **Összjáték boost** | 0,33 | az összhang-építése +33–66%, tartósan |
| ✨ | **Skill boost** | 0,4 | nagyobb súly a realisztikus képesség-sorsolásban |
| ⚡ | **Ifi-boost** | 1 | változatlan — a legdrágább, mert a legtöbbet adja |
| 🎩 | **Öreg róka** | 0,8 | változatlan hatás, új ár |

**Mérve** (17 600 egységnyi belső ár mellett): 8800 · 10 600 · 10 600 · 5800 ·
7000 · 17 600 · 14 100 — betűre a fenti arányok. Az arányok a 3.8.18-es
árváltozás után is ugyanezek; csak maga az egység lett a klub léptékéhez
kötve.

### 2.1 A kedvezmény — MIND A HÉT fajtára (3.8.13; 3.8.18)

**Bejelentett kérés (3.8.13):** *„olcsóbb boost tokenek általában, ne csak az
ifi és öregboost — gyakorlatilag az 1 egység alapárát csökkentsük"*.

A kedvezmény **egy helyen**, a `boostDiscountMult()`-ban ül, és az **egység
alapárát** szorozza — tehát a hét fajta magától követi. (A kihívás-jutalom
eddig is így hatott, csak a szövegei „az ifi- és öreg-boostról" beszéltek; ez
félrevezető volt, és javítva lett.)

| kedvezmény | mérték | forrás |
| --- | --- | --- |
| **kihívás-jutalom** | fokozatonként −10%, plafon −50% | `S.boostDiscount` |

A szorzó 0,10-nél padlózva: egy engedmény sem viheti nullára az árat.

**A kezdő idények −50% / −33%-os ablaka megszűnt (3.8.18).** Pontosan azt a
bajt foltozta, amit az új árképlet a gyökerénél old meg: *„a boost ára a
kereted legdrágább emberéhez van kötve, tehát már az első nyáron a teljes árat
kéri — miközben a klub akkor a legszegényebb"*. A padló (36 Mrd Ft) mellett
viszont a −50% is 17,6 Mrd-ot jelentett egy **7 Mrd-os** éves keret mellett — a
tapasz kisebb volt, mint a lyuk —, a 3. idényre pedig lejárt, amikor a klub
még mindig szegény volt. Az ár most a klub méretéből jön, tehát az 1. idényben
**azért** olcsó a boost, mert a klub kicsi, nem azért, mert kedvezményes hét
van. Egy szabály, ami mindig érvényes, jobb, mint egy határidős kedvezmény,
amiről külön szólni kell.

### Miért százalék, és nem fix pont

A fix bónusz a karrier elején óriási, a végén jelentéktelen — a régi ifi-boost
fix +6–12 Ratingjét pont ezért kell a mezőny szintjével skálázni. Az öt új
fajta **egyenesen arányos** azzal, amijük már van, tehát a karrier egészén
ugyanazt éri.

**A TSI-nél ez önmagában elszaladna** (egy 40 000-es TSI 45%-a 18 000), ezért
ott **abszolút korlátok** fogják közre a százalékot. Mérve: 500-as TSI-nél a
sima boost a 400-as padlót adja, 40 000-esnél a 2500-as tetőt.

---

## 3. A hatások

### 💪 Sima boost

A klasszikus, kiegyensúlyozott fejlesztés, **bárkire** elsüthető. A Rating és
a TSI is nő, és a **peak követi a boostolt Ratinget** — ugyanaz az indok, mint
az ifi-boostnál: enélkül a többlet „peak fölötti" maradna, és a fejlődés
azonnal visszahúzná.

### 🎯 Attribútum boost — a tartós csatorna

Ez a fajta két dolgot csinál, és a második a lényeg:

1. **azonnal** +1–3% a választott tengelyre (a tengely saját plafonjáig —
   `attrCapFor`, a sebességé szűkebb);
2. **tartósan** is épül rajta: meccsenként `TRAIN_SEC_PTS` (0,4) pont.

**Miért a másodlagos edzés üteme, és nem a főé.** A fő sáv a menedzser tudatos
döntése, amiért **máshol fizet** — a többi tengely lassulásával. Ez a boost
MELLÉ jön, ellentétel nélkül; annak a fele a helyes mérték.

A csatorna **ugyanabba a `addA`-ba folyik**, mint az edzésterv: ugyanaz a
kor-görbe, `trainScale` és globális tempó hat rá. Ugyanarra a tengelyre
ismételve **halmozódik** (`n`), másikat választva **átáll** — egy embernek egy
irányba érdemes építeni, és így a döntésnek súlya van.

### 📈 TSI boost

Csak a TSI-t emeli, de nagyot. A Rating nem ugrik tőle: a **hosszú távú
fejlődési pálya** nyílik ki (`peak` a `tsiToPeakOvr`-en át), és vele az
eladási ár is.

### 🤝 Összjáték boost

Az egész csapattal való összeszokása gyorsul: minden kötése 33–66%-kal
gyorsabban épül, tartósan. A szorzó a `bondMatchTick` **mindkét** ágába
bekerül (a meccsen épülő pároknál és az edzéspálya-ágban is).

**A pár szorzója a kettő közül a NAGYOBB** (`bondBoostMult`), nem a
szorzatuk: a boost azt ígéri, hogy *ez az ember* szokik össze gyorsabban a
csapattal — két boostolt ember egymással nem lehet négyszer gyorsabb.

**Ismételhető, de van teteje** (3,0×): enélkül öt boost után a kötései egy
meccs alatt érnének be, és a 88-as puha tető is értelmét vesztené.

### ✨ Skill boost

**Realisztikus skill-módban** két helyen ül rá a sorsolásra, és a kettő
együtt adja ki a bejelentés két felét:

* `skillRealEarner()` — a **kiérdemlők** súlyozott sorsolásában a boostolt
  ember súlya nő. A súly **szorzó**, nem felülírás: aki nem érdemelte ki
  (`w = 0`), azt a boost sem hozza be a sorsolásba.
* `skillRealPlan()` — a „magától megy" ágon a boostolt ember **címzett** lesz
  (`boostSkillPick`), és onnantól a merítés az Ő posztcsoportjából húz
  (`skillRealDrawFor`).

Az esély a boostok súlyából telítődik, de **sosem éri el a 100%-ot** (max 70%):
a keret többi tagja nem eshet ki teljesen a sorsolásból.

**Laza módban nem csinál semmit, ezért ott nem is vásárolható** — a katalógus
kiírja a sorát, de kimondja, miért nem elérhető. Egy no-op fejlesztést eladni
rosszabb, mint el sem kínálni.

---

## 4. A Boost-központ — három lépés

```
fajta  →  játékos  →  megerősítés
```

Az **ifi- és az öreg-boost a saját, megszokott panelére ugrik** (`go()`): ott
van a jelöltszűrés, az ismételt boost drágulása és a nyugdíj-kitolás. Nem
duplikáljuk a logikájukat — **két helyen élő szabályból előbb-utóbb két
különböző szabály lesz.**

Az attribútum-boost kap egy **negyedik lépést** (melyik tengely), és a panel
kiírja, hol fut már boost annál a játékosnál.

**A HUB gombja karrierben mindig kint van**, mert az öt új fajta a teljes
keretre nyitva áll — nincs olyan állapot, amiben egyik se sülhetne el. A
feliratban a **legolcsóbb** fajta ára áll: az mondja meg, hogy egyáltalán van-e
mit kezdeni a mai egyenleggel.

---

## 5. A nyom megmarad

Mind a hét fajta **visszavonhatatlan**, ismételhető, és a hatás a
`careerPool`-bejegyzésben él — tehát a mentés magától viszi.

A **tény** is látszik: a játékos lapján (`boostNote`) és a jelöltlistán
(`boostTagsOf`) ott áll, mit és hányszor kapott. Ugyanaz az elv, amiért az
ifi-boostnak is van könyvelése: a hatás beépül a Ratingbe és a TSI-be, de a
tény enélkül nyomtalanul eltűnne — pedig ezekre a büdzsé ment el.

```
💪 Sima boost — összesen +1 Rating és +1710 TSI
🎯 Attribútum boost — Passz, tartósan +0,4 pont/meccs
📈 TSI boost — összesen +3915 TSI
🤝 Összjáték boost — az összhangja 1,37× ütemben épül
✨ Skill boost — csak realisztikus skill-módban dolgozik
```

---

## 6. Mérés

| amit néztünk | eredmény |
|---|---|
| árak az egységhez mérve | 0,5 · 0,6 · 0,6 · 0,33 · 0,4 · 1 · 0,8 — betűre |
| sima boost egy 80-as / 6000 TSI-s emberen (20 sorsolás) | Rating +1…3, TSI +1333…2500 |
| sima boost korlátai | 500-as TSI → +400 (padló) · 40 000-es → +2500 (tető) |
| TSI boost korlátai | 1000 → +1000 (padló) · 60 000 → +10 000 (tető) |
| attribútum boost halmozása | 84 → 85 → 87, ütem 0,4 → 0,8 pont/meccs |
| attribútum boost átállítása | az új tengely ütemet kap, a régié nullára esik |
| összjáték boost ismételve | 1,47 → 2,05 → 2,81 → **3,0** (tető) |
| skill boost ismételve | 2 → 3 → **4** (tető) |
| teljes vásárlási út a HUB-ból | katalógus → jelölt → tengely → megerősítés → hatás, oldalhiba nélkül |
