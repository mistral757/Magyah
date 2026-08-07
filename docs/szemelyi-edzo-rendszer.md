# SZEMÉLYI EDZŐ RENDSZER — teljes felépítés

**Állapot:** ✅ **Teljes — mind a négy fázis kész** (v2.6.053)

| Fázis | Tartalom | Állapot |
|---|---|---|
| F1 | adatréteg, `skillsEver` könyvelés, Sz-képletek, belépés | ✅ kész (v2.6.049) |
| F2 | stáb-nézet, fókusz-rendszer, slot-bővítés | ✅ kész (v2.6.051) |
| F3 | a hatások bekötése a meglévő motorokba | ✅ kész (v2.6.052) |
| F4 | edzői fejlődés, kiöregedés, Stáb-csarnok, „B" belépési út, súgó | ✅ kész (v2.6.053) |

**Cél:** a 32 év fölötti, kiöregedő játékosoknak legyen második életük — ne csak
eladni vagy elengedni lehessen őket, hanem a klub tudásává átalakítani.

---

## 0. A rendszer egymondatos lényege

A visszavonuló játékos nem tűnik el: **átlép a stábba**, és a pályafutása
számokban rögzített öröksége (kor, meccsszám, gólok, védések, tiszta lapok,
sérülések, személyiség, skillek) határozza meg, **mennyire lesz jó edző és
miben**. Az edzőt aztán rá lehet állítani az egész keretre, egy posztcsoportra,
vagy 1-2 konkrét emberre — és minél szűkebb a fókusz, annál erősebb a hatás.

Ez a rendszer szándékosan **a meglévő motorokba köt be** (edzésrendszer,
attribútum-fejlődés, morál, forma, sérülés, skill-kiosztás), nem mellettük fut.
Egyetlen új meccsmotor-ág sincs benne.

---

## 1. Belépés: hogyan lesz valakiből edző

### 1.1 Jogosultság

```
edzőnek jelölhető(entry) ⟺
     gameMode === "career"
  && entry.age >= 32
  && a játékos a TE keretedben van (slots / BENCH / extraRoster)
  && careerStats[n].matches >= 40      ← legalább ~1 szezonnyi közös múlt
```

A 40 meccses küszöb a lényeg: **nem lehet edzőt vásárolni**. Nem veszel egy
34 éves legendát azért, hogy másnap a stábba tedd — együtt kell töltenetek
legalább egy szezont, hogy a klubod egyáltalán ismerje őt. Ez teszi a rendszert
a *saját* öreg játékosaid megőrzéséről szólóvá, nem egy második transzferpiaccá.

### 1.2 A két belépési út

**A) Bejelentett visszavonulás (a fő út).**
A `maybePlanRetirement()` már ma is előre jelzi a visszavonulást
(`index.html:9153`). Amikor a `retirePlan` szezonja elérkezik és a játékos
ténylegesen távozik (`advanceCareerSeason()`, `index.html:9330` környéke), a
szezonzáró jelentésben megjelenik egy **búcsú-kártya**:

> ⏳ Kovács Bence (37) befejezte a pályafutását — 284 meccs, 96 gól a klubnál.
> *Marad a klubnál?* → **[Bevesszük a stábba]** / [Elbúcsúzunk tőle]

Ha bevesszük, a keret-slotja normálisan felszabadul (a meglévő pótlás-logika
változatlanul lefut), a játékos viszont átkerül a `S.staff` tömbbe.

**B) Edzői állás felajánlása — FIZETŐS (v2.6.054).**
A HUB játékos-lapján 32 év fölött megjelenik egy „🎓 Edzői állás felajánlása"
gomb. A játékos azonnal befejezi a pályafutását, és edző lesz. Ez a tudatos
döntés útja: egy 33 éves, még játszó, de már romló vezérből most csinálsz
**Lélekemelőt**, ahelyett hogy megvárnád a 38-at.

**A KÉT ÚT KÖZTI KÜLÖNBSÉG A PÉNZ.** Az A út ingyen van — már úgyis befejezte,
csak igent mond. A B úton viszont **kártalanítanod kell** a félbehagyott
pályafutásáért: az **igazolási ára 40–60%-át**, és az arány a hátralévő
pályafutással skálázódik, mert minél fiatalabb, annál többet veszel el tőle.

```js
const COACH_OFFER_PCT_MAX=0.60, COACH_OFFER_PCT_MIN=0.40;
function coachOfferPct(age){
  return clamp(0.40, 0.60, 0.60 - (age-32)*0.0333);
}
function coachOfferPrice(entry){ return round(buyPrice(entry) * coachOfferPct(entry.age)); }
```

| Kor | 32 | 33 | 34 | 36 | 38+ |
|---|---|---|---|---|---|
| kártalanítás | 60% | 57% | 53% | 47% | 40% |

Az alap a **`buyPrice`** (amennyiért ma megvennéd), nem a `sellValue`: azt
fizeted, amennyit a piacon ér — nem azt, amennyit te kapnál érte.

**Mérve** ugyanarra a 95-ös csúcsú játékosra, három korban:

| Kor | Rating | igazolási ár | ajánlat |
|---|---|---|---|
| 32 | 93 | 29,9 Mrd Ft | **17,9 Mrd Ft** |
| 35 | 91 | 19,5 Mrd Ft | **9,8 Mrd Ft** |
| 38 | 86 | 9,8 Mrd Ft | **3,9 Mrd Ft** |

Vagyis ugyanaz az ember **4,6-szer drágább 32 évesen, mint 38-an** — a türelem
tehát nemcsak jobb edzőt ad, hanem sokkal olcsóbbat is. Ez az ár a
türelmetlenség ára, és pontosan ettől marad az A út a fő út.

**Miért kell mindkettő:** az A út a jutalom (kitartottál mellette), a B út a
döntés (pénzzel megveszed a maradék szezonjait). A B úthoz **megerősítés
kell**, mert visszafordíthatatlan — és a megerősítő kimondja, hogy kivárással
ingyen, jobb edzőként kaptad volna meg.

### 1.3 Amit a belépéskor lefagyasztunk

Az edző minősége a **belépés pillanatában dől el, véglegesen**. Ekkor készül
egy „pályafutás-lenyomat" (`career fingerprint`), mert a `careerStats` és a
`S.skills` bejegyzései a visszavonulás után elévülnek/törlődnek.

```js
function careerFingerprint(entry){
  const cs = S.careerStats[entry.n] || {};
  return {
    age:      entry.age,
    matches:  cs.matches || 0,
    goals:    cs.g || 0,
    assists:  cs.a || 0,
    saves:    cs.saves || 0,
    cleans:   cs.cs || 0,
    mvp:      cs.mvp || 0,
    inj:      cs.inj || 0,
    reds:     cs.rc || 0,
    leadI:    entry.leadI  != null ? entry.leadI  : 2,
    coopI:    entry.coopI  != null ? entry.coopI  : 2.5,
    aggroI:   entry.aggroI != null ? entry.aggroI : 2,
    attrs:    {...(entry.attrs||{})},
    peak:     entry.peak || entry.startRating || 70,
    pos:      (entry.pos||["KKP"]).slice(),
    /* A SZÜLETÉSI sebesség — a Sprintmester ebből számol növekményt (2.3). */
    sebBase:  entry.sebBase != null ? entry.sebBase : (entry.attrs||{}).seb,
    /* A skill-történet NEM olvasható ki visszamenőleg — külön kell gyűjteni.
       AZONOSÍTÓK, nem darabszám: a hagyaték ezeket adja tovább (6.2.1). */
    skillsEver: (entry.skillsEver || []).slice(),
    /* A ±3 zaj EGYSZER sorsolódik, és a lenyomat része — így a típusválasztóban
       MUTATOTT érték pontosan az, amit a felvétel után kapsz. */
    noise:    Math.round((Math.random()*2-1)*3)
  };
}
```

### 1.4 Új, apró könyvelés, amit MOST kell bevezetni

A skill-edző minősége azon múlik, mely skilljei voltak valaha — és a
hagyaték-mechanika (lásd 6.2b) miatt **nem elég a darabszám: az azonosítók
kellenek**. Ezt ma senki nem tárolja: a `S.skills[név]` csak az **aktuális**
állapot, és a visszavonuláskor elvész.

> ⚠️ Ez a rendszer egyetlen visszamenőleg pótolhatatlan eleme. A könyvelést
> **az összes többi fázis előtt** be kell vezetni, különben minden most futó
> karrier skill-történelme véglegesen elvész.

**Megoldás:** egy sorral bővül minden skill-kiosztási pont
(`renderSkillAssign` `index.html:20894`, `autoAssignSkill` `index.html:20920`,
`clutchAward` `index.html:22231`, a BL-díjaknál `index.html:26456`):

```js
noteSkillEver(p.n, skill.id);
```
```js
/* MONOTON, EGYEDI lista a careerPool-ban: a mentés automatikusan viszi, és a
   skill-vesztés (index.html:13709) sem csökkenti — a VALAHA megszerzett
   skillek halmazát méri. */
function noteSkillEver(name,skillId){
  const e = careerPool && careerPool[name];
  if(!e || !skillId) return;
  if(!e.skillsEver) e.skillsEver = [];
  if(e.skillsEver.indexOf(skillId) < 0) e.skillsEver.push(skillId);
}
```

**Migráció régi mentésre:** ha `skillsEver === undefined`, a betöltéskor
`= (S.skills[n]||[]).map(i=>i.skill.id)` — a jelenleg birtokolt skillek az alsó
becslés. Ami korábban elveszett, az elveszett; ennél többet nem lehet
rekonstruálni.

---

## 2. Az edzői minőség: a Szakértelem (Sz)

Egyetlen szám, **20–99** skálán, ugyanaz a nyelv, mint a játékos-Rating.

```
Sz = clamp(20, 99, ALAP + SZAK)

ALAP = korPont + rutinPont          →  0 … 34   (típustól FÜGGETLEN)
SZAK = típusPont                    →  0 … 55   (típus-specifikus)
+ induló zaj: ±3 (a NÉVBŐL hash-elve — determinisztikus, lásd 2.5)
```

### 2.1 ALAP — ami mindig számít

**korPont** — a tapasztalt, megélt ember többet tud átadni, de van teteje:

```js
function korPont(age){ return Math.max(0, Math.min(14, (age-31)*1.75)); }
// 32 év →  1.75   |  35 év →  7.0   |  39 év → 14.0   |  44 év → 14.0 (plafon)
```

**rutinPont** — a lejátszott meccsek, csökkenő hozammal. A `^0.75` kitevő azért
kell, hogy egy 500 meccses vasember ne legyen kétszer olyan jó edző, mint egy
250 meccses; csak érezhetően jobb.

```js
function rutinPont(matches){ return Math.min(20, 20*Math.pow(Math.min(1,matches/420), 0.75)); }
//  40 meccs → 3.4  |  120 → 7.9  |  250 → 13.4  |  420+ → 20.0
```

*Kalibráció:* egy 19 évesen érkező, 36-ig játszó házi nevelés ≈ 500+ meccs
(30 bajnoki + kupa/EK szezononként) → kimaxolja. Egy 30 évesen vett, 34-ig
játszó igazolás ≈ 140 meccs → 8.7. Ez a különbség szándékos: **a klubhűség
fizet**.

### 2.2 SZAK — a típus-specifikus rész

Minden típusnak van egy **0…1 nyers pontszáma**, amit `×55` skálázunk.
A képletek szándékosan a meglévő adatokból dolgoznak, új mérés nélkül.

Jelölés: `perM(x) = x / max(1, matches)` — meccsenkénti átlag.

| Típus | Nyers pontszám (0…1) |
|---|---|
| **Lélekemelő** (morál) | `0.70·norm(leadI,0,4) + 0.30·norm(peak,60,110)` |
| **Csapatkovács** (kohézió) | `0.75·norm(coopI,0,5) + 0.25·norm(leadI,0,4)` |
| **Ritmusmester** (forma) | `0.50·tempScore(aggroI) + 0.35·norm(perM(mvp),0,BAND_MVP) + 0.15·(1−norm(perM(reds),0,BAND_RED))` |
| **Gyógyító kéz** (sportorvos) | `0.75·(1 − norm(perM(inj),0,BAND_INJ)) + 0.25·norm(matches,0,420)` |
| **Attribútum-mester** | típusonként külön, lásd 2.3 |
| **Iskolateremtő** (skill) | `0.65·norm(skillsEver.length,0,6) + 0.35·norm(perM(mvp),0,BAND_MVP)` |

ahol
```js
const norm=(v,lo,hi)=>Math.max(0,Math.min(1,(v-lo)/(hi-lo)));
/* A temperamentum NEM lineáris: a forma-kezeléshez a KÖZÉP a legjobb
   (Kiegyensúlyozott = aggroI 2). A jámbor nem tud tüzet gyújtani, a
   lobbanékony felégeti az öltözőt. Fordított V. */
const tempScore=a=>1-Math.abs(a-2)/2;   // 0:0.0  1:0.5  2:1.0  3:0.5  4:0.0
```

#### ⚠ A normálási sávokat a motor tényleges rátáiból kell húzni

Az első kalibráció itt melléfogott, és a mérés kapta el. „Kényelmes" kerek
sávokat használt (0.055 a sérülésre, 0.06 a pirosra), amelyek a **valódi ráta
10–17-szeresei** — vagyis gyakorlatilag minden játékos maximumot kapott ezekre
a tagokra, és a típusok közti különbség eltűnt. A Gyógyító kéz mérve **minden
profilon 88-at adott**, sérüléstől függetlenül.

A szabály: **a sáv teteje ≈ a populáció átlagának kétszerese**, hogy az átlagos
pályafutás a skála közepére essen.

| Sáv | Motor-konstans | Átlag / játékos-meccs | Sáv |
|---|---|---|---|
| `BAND_INJ` | sérülés-esély 0.035/meccs, 11 játékosra | 0.00318 | **0…0.0065** |
| `BAND_RED` | `SIM.REDP = 0.06`/meccs, 11 játékosra | 0.00545 | **0…0.011** |
| `BAND_MVP` | meccsenként pontosan 1 a 11-ből | 0.0909 | **0…0.20** |

Ha a motor rátái változnak, **ezeket újra kell húzni** — a kódban külön
konstansblokk jelöli őket.

**A sportorvos képlete a legszebb a felvetésben** — „ha sosem sérült meg, jó
sportorvos lesz" —, de ki kell egészíteni: a `matches` nélkül egy 45 meccset
játszott, soha nem sérült ember 100%-ot kapna. A 25%-os rutin-tag megköveteli,
hogy a sérülésmentesség **hosszú karrieren át** igazolódjon.

**A Ritmusmester temperamentum-súlya 0.50** (nem 0.60): a Kiegyensúlyozott a
leggyakoribb érték (`AGGROW` szerint 36%), tehát önmagában nem lehet elég egy
csúcs-formaedzőhöz — a nagy meccsek (MVP) súlya ezért 0.35.

### 2.3 Attribútum-mesterek — öt alfaj

Az „attribútumedző" nem egy típus, hanem **öt**, egy-egy a meglévő
`ATTR_KEYS`-hez (`ved`, `kapus`, `passz`, `gol`, `seb`). Ez azért helyes, mert
így az edző hatása egyenesen beleírható a már működő `addA(key, ...)` csatornába
(`index.html:8953`) — nulla új mechanika.

Mindegyik nyers pontszáma ugyanaz a kétrészes szerkezet:
**„milyen jó volt benne" (attribútum) + „mit produkált belőle" (statisztika)**.

| Alfaj | Attribútum-tag (60%) | Teljesítmény-tag (40%) |
|---|---|---|
| **Gólvágó-mentor** (`gol`) | `norm(attrs.gol, 55, peak+25)` | `norm(perM(goals), 0, 0.65)` |
| **Játékmester** (`passz`) | `norm(attrs.passz, 55, peak+25)` | `norm(perM(assists), 0, 0.45)` |
| **Bástya** (`ved`) | `norm(attrs.ved, 55, peak+25)` | `norm(perM(cleans), 0, 0.40)` |
| **Kesztyűs mester** (`kapus`) | `norm(attrs.kapus, 55, peak+25)` | `norm(perM(saves), 0, 3.2)` |
| **Sprintmester** (`seb`) | `norm(attrs.seb, 55, 99)` | `norm(attrs.seb − sebBase, 0, 12)` |

A `peak+25` felső határ azért kell, mert az attribútum-plafon a Ratinghez
kötött (`attrHardCap()`, `index.html:8480`) — Infinity módban egy 130-as
játékos `gol` attribútuma 155 is lehet, és egy fix 99-es normálás mindenkit
kimaxolna.

**A Sprintmester teljesítmény-tagja NEM a meccsszám** — az már az ALAP-ban
(`rutinPont`) is benne van, és a duplázás mérve **minden más típus elé tolta**
ezt az egyet: bármely hosszú pályafutású, tisztességesen gyors játékosból
automatikusan csúcs-sprintedző lett. Helyette a **sebesség növekménye** dönt:
a passzív csatorna a születési értéket csak +15%-ig viszi
(`SPEED_PASSIVE_CAP_PCT`), azon túl **kizárólag célzott edzéssel** lehet
haladni. Aki tehát 12+ pontot tett hozzá, az tényleg dolgozott érte — és
pontosan ezt a tudást tudja átadni. Ehhez a lenyomatnak a **születési
sebességet** (`sebBase`) is őriznie kell.

**Poszt-kapu:** egy kapus nem lehet Gólvágó-mentor. A jelölhető alfajokat a
poszt szűri:

```js
const ATTR_COACH_GATE = {
  gol:   ["CS","ÁÉ","JSZ","BSZ","TKP"],
  passz: ["VKP","KKP","TKP","JSZ","BSZ","ÁÉ"],
  ved:   ["JV","BV","KV","VKP"],
  kapus: ["KP"],
  seb:   null   /* bárki — a sebesség posztfüggetlen */
};
```
A `seb` szándékosan nyitott: a sebesség az egyetlen attribútum, aminek nincs
Rating-hatása (`index.html:8422`), tehát bármely poszton lehetett valaki gyors.

### 2.4 Több típusra is alkalmas? Igen — de választani kell

Belépéskor a rendszer **kiszámolja mind a 10 típusra** a leendő Sz-t, és
felkínálja a legjobb 3-at (plusz a teljes listát „több lehetőség" alatt).
**Egy edző egy típus** — a választás végleges.

Ez a rendszer legfontosabb döntési pontja: egy 38 éves, Remek vezetői
képességű, 300 meccses, 120 gólos csatár lehet **Lélekemelő 71** vagy
**Gólvágó-mentor 68** — de nem mindkettő. Így ugyanaz a játékos két különböző
karrierben két különböző klubot épít.

### 2.5 A ±3 zaj determinisztikus

A zaj **a személy tulajdonsága, nem a pillanaté**: a játékos nevéből hash-elve
áll elő (`coachNoiseFor`), ugyanazzal az elvvel, mint a `chBuyDiscountHits` —
csak a szezont *nem* vesszük bele, mert az edzői adottság nem változhat évről
évre.

> **Hiba, amit ez javított:** a zaj eredetileg a lenyomat készítésekor
> sorsolódott `Math.random`-mal. A visszavonulási úton ez még jó volt (a
> lenyomat egyszer születik), de az „edzői állás felajánlása" gomb **minden
> újrarajzoláskor friss lenyomatot** készít az előnézethez — mérve ugyanaz a
> játékos hol ★★★★☆-ot, hol ★★★★★-ot mutatott, és a felvétel után megint
> mást kaptál volna. Mérve a javítás után: 50 egymás utáni számítás **ugyanazt
> az Sz-t** adja, nyolc különböző név zaja pedig 0/−1/2/−2/1/−3/0/2 — tehát
> stabil és mégis szór.

### 2.6 Sz → csillagok (kijelzés)

A számot a felhasználó **csillagban** látja, a scout mintájára
(`scoutStarsLabel`, `index.html:23235`), de a tooltip mutatja a nyers Sz-t.

| Sz | Csillag | Címke |
|---|---|---|
| 20–34 | ★☆☆☆☆ | Kezdő stábtag |
| 35–47 | ★★☆☆☆ | Megbízható segéd |
| 48–60 | ★★★☆☆ | Elismert szakember |
| 61–73 | ★★★★☆ | Mestere a szakmának |
| 74–86 | ★★★★★ | Iskolateremtő tekintély |
| 87–99 | ★★★★★⁺ | Legenda a kispad mögött |

---

## 3. Az edző fejlődése és elmúlása

Az edző nem statikus tárgy — különben a rendszer egyszeri döntés lenne.

### 3.1 Edzői tapasztalat

```js
/* szezononként, ha az edzőnek volt aktív fókusza */
coach.xp += 1;
/* minden 2. szezon után +1 Sz, csökkenő ütemben, a saját plafonjáig */
coachCap(coach) = Math.min(99, coach.szBase + 12);
```

Egy 55-tel induló edző 24 szezon alatt kúszik 67-ig. Lassú, de érezhető: a
**stáb is épül**, nem csak a keret. Aki 15 szezonja ugyanannál a klubnál
dolgozik, az másképp néz ki, mint az újonc.

**Mérve (v2.6.053):** egy Sz 70-nel belépő edző a 2. szezonban 71, a 8.-ban 74,
a 16.-ban 78, a **24.-ben eléri a 82-es plafont** (`szBase+12`), utána már nem
nő. Az **inaktív** edző (akit a halmozási korlát leültetett) 10 szezon alatt
**0 tapasztalatot** gyűjt — plusz ok arra, hogy ne halmozz azonos típusúakat.

### 3.2 Kiöregedés

```js
COACH_RETIRE_FROM = 66;
coachRetireChance(age) = age < 66 ? 0 : Math.min(0.9, (age-66)*0.18);
```

A 66 azért van ilyen magasan, hogy egy 34 évesen belépő edző **~30 szezonig**
maradhasson — vagyis egy normál karrier alatt gyakorlatilag végig. A rendszer
nem arról szól, hogy edzőket cserélgess; arról, hogy a legendáid ott maradjanak.

**Mérve (400 lefutás):** 34 évesen belépve **34,7 szezon**, átlagosan 68,7
évesen távozik. 40 évesen belépve 28,6 szezon.
Infinity módban a `INFINITY_RETIRE_AGE` logikájához igazodva a küszöb `+20`.

Kiöregedéskor **búcsú-sor a naplóban**, és a slot felszabadul. A visszavonult
edző bekerül a `S.staffHall`-ba (klubtörténeti lista) — ez tiszta hangulat,
nulla játékhatás, de pont ez adja meg a rendszer súlyát.

---

## 4. Slotok és bővítés

```js
const COACH_SLOTS_BASE = 3;
const COACH_SLOTS_MAX  = 6;

/* 20 Mrd Ft = 10 000 pont (HUF_PER_POINT = 2e6, index.html:7557) */
function coachSlotPrice(cur){       // cur = a JELENLEGI slotszám
  const step = cur - COACH_SLOTS_BASE;          // 0,1,2
  return Math.round(10000 * Math.pow(1.75, step));
}
// 3→4 : 10 000 pt =  20 Mrd Ft
// 4→5 : 17 500 pt =  35 Mrd Ft
// 5→6 : 30 625 pt = 61,25 Mrd Ft
// összesen: 58 125 pt = 116,25 Mrd Ft
```

**Miért 1.75-ös szorzó:** a keretbővítés lineáris (`rosterExpandPrice`,
`index.html:23277`), a scout-fejlesztés is szelíd. Az edzőslot viszont
*multiplikatív* erőt ad (a 6. edző ugyanolyan erős, mint az 1.), ezért kell
szuperlineáris ár. A teljes kiépítés ~116 Mrd Ft ≈ 2,5 topjátékos ára — ez a
helyes nagyságrend egy olyan beruházáshoz, ami a teljes keretre évtizedekig hat.

A gomb a HUB „Klub" csoportjába kerül, a Scout fejlesztése és a Keretbővítés
mellé (`index.html:2074-2075`), ugyanazzal a `hubCard` szerkezettel.

---

## 5. A fókusz-rendszer — a rendszer szíve

### 5.1 A figyelem-büdzsé elve

Minden edzőnek **fix, 100 egységnyi figyelme** van. Ezt osztja szét azok között,
akikre rá van állítva. Aki kevesebb emberrel foglalkozik, az mindenkire többet
tud fordítani.

```js
const FOCUS_BUDGET = 100;

function focusShare(coach, playerCount){
  if(!playerCount) return 0;
  /* NEM lineáris osztás: a ^0.72 kitevő azt jelenti, hogy a szűkítés
     megéri, de nem abszurd mértékben. Tiszta 1/n mellett az 1 fős fókusz
     22x erősebb lenne a 22 fősnél — az minden más beállítást értelmetlenné
     tenne. A ^0.72 mellett a szorzó 9.6x: erős, de a csapat-szintű fókusz
     is életképes stratégia marad. */
  return FOCUS_BUDGET / Math.pow(playerCount, 0.72);
}
```

| Fókusz | Érintett | Fejenkénti figyelem | Összesített |
|---|---|---|---|
| Egész keret | 22 | 10.4 | 229 |
| Posztcsoport (védők) | 6 | 27.6 | 166 |
| Posztcsoport (csatárok) | 3 | 44.6 | 134 |
| Játékos-páros | 2 | 60.7 | 121 |
| Egyetlen játékos | 1 | 100.0 | 100 |

Az „összesített" oszlop mutatja a tényleges kompromisszumot: a széles fókusz
**több össz-értéket** termel, a szűk fókusz **koncentráltabbat**. Egy fiatal
szupertehetséget felnevelni → 1 fős fókusz. A teljes keret morálját megtartani
→ egész keret. Nincs domináns stratégia — pontosan ez volt a cél.

### 5.2 A négy fókusz-mód

```js
coach.focus = {
  mode: "team" | "group" | "players",
  group: "KAPUS" | "VEDO" | "KOZEPPALYAS" | "CSATAR",   // mode==="group"
  names: ["Kovács Bence", "Nagy Áron"]                   // mode==="players", max 2
};
```

A `group` kulcsok szándékosan **azonosak a `TRAIN_GROUPS`-éval**
(`index.html:8783`), így a `getCategoryFor(pos)` segédfüggvény változtatás
nélkül használható.

**Szabályok:**
- A `players` mód **legfeljebb 2 nevet** fogad (a felvetés szerint „ember vagy
  ember páros").
- Ugyanaz a játékos **több edzőtől is kaphat** figyelmet (egy tehetségre
  rátehetsz Gólvágó-mentort ÉS Sprintmestert) — de lásd a 6.6 halmozási
  korlátot.
- Fókuszt váltani **ugyanaz a szabály szerint lehet, mint edzéstervet**:
  ciklusonként egyszer, a HUB „Ugrás a nyár végére" újítja
  (`trainingChangeAllowed`, `index.html:8830`). Így az edző-beállítás valódi
  döntés, nem meccsről meccsre optimalizálható csúszka.
  **Megvalósítás: EDZŐNKÉNT egy módosítás** (`coach.focusUsed`), nem a teljes
  stábra összesen egy. Hat edzővel a globális korlát gyakorlatilag befagyasztaná
  a stábot; a cél az volt, hogy ne lehessen meccsről meccsre optimalizálni, nem
  az, hogy a nyári újratervezés lehetetlen legyen.
- **A csoport- és játékos-kijelölés finomhangolása szabadon megy** a módváltáson
  belül (melyik posztcsoport, mely két ember) — a ciklus-korlát a MÓD váltására
  szól. Enélkül egy elgépelt kijelölés egy egész szezonra beragadna.
- A `players` módban megnevezett játékos **visszavonulásakor / eladásakor** a
  fókusz automatikusan `team`-re esik vissza, naplósorral.

### 5.3 A hatás-erősség képlete

Minden típus egyetlen, közös **hatás-együtthatót** kap:

```js
function coachPower(coach, playerName){
  const n = focusTargets(coach).length;
  const share = focusShare(coach, n) / 100;        // 0.10 … 1.00
  const q     = (coach.sz - 20) / 79;              // 0.00 … 1.00
  return share * (0.35 + 0.65*q);                  // 0.035 … 1.00
}
```

A `0.35 + 0.65·q` azt jelenti: **még a leggyengébb edző is ad valamit**
(a teljes hatás 35%-a), de a legjobb közel háromszor annyit. Ez fontos, mert
egy 22-es Sz-ű stábtag különben szemét lenne, és a rendszer csak akkor indulna
be, ha véletlenül jó statisztikájú legendád van.

---

## 6. Mit csinálnak a típusok — konkrét bekötési pontok

Minden hatás **meglévő függvénybe** kerül. Alább a pontos helyek.

### 6.1 Attribútum-mester → `index.html:8953` (`addA`)

A legegyszerűbb és legtisztább bekötés. A per-meccs fejlődésmotorban, közvetlenül
az edzésterv-pontok után:

```js
/* SZEMÉLYI EDZŐ: az attribútum-mesterek pontjai ugyanabba a csatornába
   folynak, mint az edzésterv — tehát a kor-görbe, az underdog-szorzó, a
   tempó és az edzés-lassítás MIND ugyanúgy hat rájuk. Nincs külön szabály. */
coachesFor("attr", p.n).forEach(c=>{
  addA(c.attrKey, COACH_ATTR_PTS * coachPower(c, p.n) * share, false);
});
```

```js
const COACH_ATTR_PTS = 0.55;   // a fő edzés 0.8-ához mérve (index.html:8768)
```

**Kalibráció.** Egy ★★★★ (Sz 68) Gólvágó-mentor egyetlen csatárra állítva:
`coachPower = 1.00 × (0.35+0.65·0.61) = 0.746` → `0.55 × 0.746 = 0.41 pt/meccs`.
30 meccs alatt 12.3 pont = **0.82 attribútum-lépés/szezon** (a küszöb 15,
`CAREER_DEV_THRESHOLD`). Ugyanez a teljes keretre: `0.104 × 0.746 = 0.043 pt`,
azaz 1.3 pt/szezon fejenként — észrevehetetlen egyénileg, de 22 emberen
összeadva ér valamit.

Ez tudatosan **a fő edzésterv alatti** nagyságrend (az 0.8 → 1.6 lépés/szezon).
Az edzésterv marad a csapat-szintű eszköz; a személyi edző a **célzott** eszköz.

**FONTOS korlát:** az edző **nem emeli** az `ATTR_SPEC_CEIL`-t
(`index.html:8580`). A specializációs sáv (`base + profil ± 30/12`) kemény
plafon marad, különben a rendszer az egész attribútum-egyensúlyt szétverné.
Az edző azt gyorsítja, ahogy a plafonhoz érsz — nem magát a plafont mozdítja.

### 6.2 Iskolateremtő (skill) → `index.html:20894`, `20920`, `13441`

Ez a leggazdagabb típus: **négy** csatornán hat, és egyedül neki van saját,
kimerülő erőforrása.

**a) Kiosztási súly.** Az `autoAssignSkill` ma a potenciál szerint súlyoz.
A fókuszált játékos súlya megszorzódik:

```js
weight *= 1 + 1.8 * coachPower(skillCoach, p.n);
```
Egy ★★★★ Iskolateremtő 1 emberre állítva ~2.3x eséllyel viszi rá a következő
skillt. Ez **nem garancia** — a skill továbbra is a meccsen dől el.

**b) A HAGYATÉK — a saját skilljeit adja tovább.** Lásd 6.2.1, külön alfejezet.

**c) Szakaszolt skillek gyorsítása.** A `stagesNeeded`/`stagesCompleted`
rendszerben (`index.html:20895`) a fókuszált játékos szakaszai gyorsabban
telnek:

```js
if(Math.random() < 0.45 * coachPower(c, name)) inst.stagesCompleted += 1;  // +1 bónusz lépcső
```

**d) Skill-vesztés elleni védelem.** A `index.html:13709` büntető-esemény
(véletlen skill elvesztése) a fókuszált játékosnál `coachPower`-rel arányosan
elhárul — max 60%-ban. Ez adja a „mentorált játékos" érzetet.

---

### 6.2.1 A Hagyaték: „amit én tudtam, azt tanítom"

Az Iskolateremtő nem általános skilleket oszt, hanem **a sajátjait**. Az
`fp.skillsEver` lista az öröksége: amit a pályán megtanult, azt tudja átadni.
Ez az egész rendszer érzelmi csúcspontja — a „Gólzsák" nem egy absztrakt jutalom
lesz, hanem *Kovács Bence gólzsákja*, amit ő maga adott tovább a 19 éves
tehetségnek.

#### A kompromisszum

Két, egymással ellentétesen mozgó mennyiség — ez adja a harmóniát:

```js
const LEGACY_RATE0 = 0.10;      /* alap-esély meccsenként */

/* ÜTEM: milyen sűrűn ad át egy skillt. A szűk fókusz gyorsabb. */
function legacyRate(coach){
  const n = focusTargets(coach).length;
  const q = (coach.sz - 20) / 79;
  return LEGACY_RATE0 * (0.35 + 0.65*q) * Math.pow(n, -0.35);
}

/* KÉSZLET: hány átadásra futja összesen. A széles fókusz többre. */
function legacyBudget(coach){
  const L = (coach.fp.skillsEver || []).length;
  const n = focusTargets(coach).length;
  return Math.ceil(L * Math.pow(n, 0.45));
}

/* Ami még hátravan. A SPENT átvihető — a budget nem. Lásd alább. */
function legacyLeft(coach){
  return Math.max(0, legacyBudget(coach) - (coach.legacySpent||0));
}
```

A `-0.35` és a `+0.45` kitevő együtt azt adja, hogy a **kitartás** ≈ `n^0.80`
szerint nő. Egy ★★★★ (Sz 68) Iskolateremtő, 4 skilles hagyatékkal, 30 meccses
szezonban:

| Fókusz | n | Átadás/szezon | Készlet | Kitart |
|---|---|---|---|---|
| Egy tehetség | 1 | 2.23 | 4 | **1,8 szezon** |
| Csatárok | 3 | 1.52 | 7 | **4,6 szezon** |
| Védők | 6 | 1.19 | 9 | **7,5 szezon** |
| Egész keret | 22 | 0.76 | 17 | **22,4 szezon** |

*(Számolt értékek, nem becslés — a képletek önálló újrapéldányán mérve.)*

Ez pontosan a kért viselkedés: a célzott tanítás **két szezon alatt négy
skillt zúdít egyetlen kiválasztottra**, aztán a mester kiürül; a szétosztott
tanítás **több mint húsz szezonon át tizenhét skillt** csordogál a keretbe.
Egyik sem jobb — más a játékstílus mögöttük.

#### Harmonikus eloszlás

A készlet **közös**, nem skillenkénti — így megy át egy skill több emberre.
Hogy ne fajuljon „ugyanaz a skill tizenhatszor"-rá, két szabály tartja egyben:

```js
/* 1) SKILLENKÉNTI PLAFON: a készletet egyenletesen kell elosztani a
      hagyaték skilljei között, felfelé kerekítve — így marad „harmonikus". */
const perSkillCap = Math.ceil(legacyBudget(coach) / L);
//  n=1  → ceil(4/4)  = 1  → mindegyik skill pontosan egyszer
//  n=22 → ceil(17/4) = 5  → mindegyik skill legfeljebb ötször

/* 2) A LEGKEVESEBBET ÁTADOTT ELŐNYE: a sorsolás a ritkábban átadott skillt
      súlyozza, nem uniform. */
weight(skillId) = 1 / (1 + 2*handedOut[skillId]);
```

A célpont kiválasztása:
- **`players` mód (1-2 fő):** a megnevezett játékos kapja. Determinisztikus —
  ez a „célzott tanítás".
- **`group` / `team` mód:** véletlen a fókuszcsoportból, a meglévő
  `playerPotential()` szerint súlyozva (`index.html:12611`) — vagyis a
  tehetségesebb fiatal nagyobb eséllyel kapja. Ez a felhasználó által vállalt
  „rábízzuk a randomra".

Minden átadás előtt lefut a **meglévő két szűrő**, változtatás nélkül:
- `eligibleForSkill(skill)` (`index.html:20855`) — poszt-alkalmasság
- a „már megvan" ellenőrzés (`index.html:20862`)

#### A készlet nem az egyetlen korlát

Mérve: egy **csupa csatár-skillt** hozó mester a teljes keretre állítva 17-es
készlettel is csak **16 átadásig** jut — négy csatárod van, mindegyik megkaphatja
mind a négy skillt, és ott a pool kifogy. Ugyanez **vegyes hagyatékkal** szintén
16 átadás, de **16 különböző játékosnak**. A készlet ilyenkor sosem fogy el, a
dobások eredménytelenül futnak — ami nem hiba, de a becslést hazuggá tenné.

Ezért a panel **kiírja az érvényes párok számát**, és a „kitart N szezonig"
becslés `min(készlet, érvényes párok)`-ból számol.

Ha nincs érvényes (skill, játékos) pár, az esemény **elmarad, és nem fogyaszt
készletet**. Ez fontos: egy kapus-hagyatékú Iskolateremtő a csatárokra állítva
nem üríti ki magát a semmibe, csak nem csinál semmit — a felhasználó pedig a
UI-ban látja, hogy 0 érvényes párja van.

#### A fókuszváltás nem exploit

Ha a készletet felvételkor rögzítenénk, a nyerő stratégia ez lenne: állítsd
keretre (készlet 16), majd válts egy emberre, és zúdítsd rá mind a 16-ot.

**Megoldás:** a készlet **mindig az AKTUÁLIS fókuszból számolódik újra**, és
csak az elköltött darabszám (`legacySpent`) marad meg:

```js
legacyLeft = max(0, legacyBudget(jelenlegi fókusz) - legacySpent)
```

- Keret (16) → elköltött 6 → váltás egy emberre: `max(0, 4-6) = 0`. **A
  hagyaték elfogyott.** A szűk fókusz nem bír el annyit.
- Egy ember (4) → elköltött 3 → váltás keretre: `16-3 = 13`. Ez megengedett és
  szép: a gyors indítás után szélesre nyitod a tanítást. Nem exploit, mert a
  fókuszváltás amúgy is ciklusonként egyszer engedélyezett (5.2).

A UI-nak ezt **a váltás előtt** ki kell írnia — a hagyaték-számláló ott van a
fókuszgombok mellett, és élőben mutatja, mi lesz a váltás után:

```
Hagyaték: ●●●●●●●●●●●○○○○○○  11 / 17 hátra
⚠ Egy játékosra váltva a készlet 4-re szűkül — a 6 elköltött után 0 marad.
```

#### Kimerülés után

A hagyaték elfogyása **nem teszi haszontalanná** az edzőt: az a), c) és d)
csatorna (kiosztási súly, szakasz-gyorsítás, vesztés-védelem) tovább működik.
A kártyáján megjelenik a `🕯 A hagyaték elfogyott — a mester már csak nevel`
sor. Így az Iskolateremtő két életszakaszra bomlik, ami önmagában is szép ív.

#### Naplósor

```
🎓 HAGYATÉK — Kovács Bence átadta a „Gólzsák" képességet Nagy Áronnak.
   „Ezt tőle tanultam." (a mester hagyatékából még 3 átadás van hátra)
```

### 6.3 Lélekemelő (morál) → `index.html:14054` (`computeMoraleTarget`)

A `t = 50 + CHEM.total*1.2 + squadScore*7 + coach.moraleBase + ...` sorba
bejön egy új tag:

```js
+ moraleCoachBonus()
```

ahol
```js
function moraleCoachBonus(){
  let b = 0;
  staff().forEach(c=>{ if(c.type==="morale") b += 9 * coachTeamScope(c); });
  return Math.min(14, b);
}
```

#### ⚠ A csapat-szintű hatások NEM a `coachPower`-ből jönnek

A második hiba, amit a mérés kapott el. Az eredeti terv itt
`coachPower(c, t[0]) * Math.min(1, n/3)`-at írt — ez **kétszer büntetett**:
a `coachPower` a `focusShare` miatt 22-vel osztott a teljes keretnél, a
`min(1, n/3)` tag pedig a szűk fókuszt büntette. Mérve: egy csúcs-Lélekemelő a
teljes keretre állítva **+0,8 morált** adott a szándékolt +7 helyett — a típus
gyakorlatilag nem működött.

A per-fős hatásoknál (attribútum-fejlődés, sérülés-jelöltválasztás) a figyelem
elosztása helyes: egy emberrel foglalkozva többet adsz neki. A **csapat-szintű
mennyiségek** (csapatmorál, öltözői kémia, a csapat alap sérülés-esélye) viszont
egyetlen számok — ott a fejenkénti osztásnak nincs értelme. Ezért külön
mérőszámuk van:

```js
/* MINŐSÉG × LEFEDETTSÉG — nem per-fő osztás. */
function coachTeamScope(c){
  const t = focusTargets(c);            if(!t.length) return 0;
  const q = (c.sz - 20) / 79;
  const cover = Math.min(1, t.length / Math.max(11, rosterSize()));
  return (0.35 + 0.65*q) * cover;
}
```

Így a széles fókusz a teljes hatást hozza, a szűk arányosan keveset — a szándék
szerint, dupla büntetés nélkül. **Mérve:** teljes keretre állított
csúcs-Lélekemelő **+7,7 morál**, egy fős fókusszal **+0,3**.

A `×9` és a 14-es plafon a meglévő nagyságrendekhez igazodik: a `clubBonus`
+10, a `hodaBonus` +14, egy `coach.moraleBase` −3…+6. Az edző tehát **erős, de
nem uralkodó** hatás. A `moraleToOvr` áttétele miatt (`index.html:14063`)
+14 morál ≈ **+0.7 csapat-OVR minden meccsen** — pont a helyes súly.

A `Math.min(1, t.length/3)` tag azért kell, hogy a morál-edzőt **ne érje meg
1 emberre állítani**: a csapatmorál csapat-jellegű dolog. 1 fős fókusszal a
szorzó 0.33, tehát a koncentrálás itt *veszteséges* — ez tudatos
típus-karakterizálás, nem hiba.

### 6.4 Csapatkovács (kohézió) → `index.html:11917` (`computeChemistry`)

A morál-edző alfaja, ahogy a felvetés mondja („együttműködéssel kapcsolatépítő
a morálon belül"), de **más csatornán hat**: a kémián, nem a morálon.

```js
CHEM.total += chemCoachBonus();     // max +6, coachTeamScope alapon
```

> **Elvetve az implementáció során:** a terv eredetileg azt is ígérte, hogy a
> `pruneChemistry` által elvesztett `goodPairs`-ek fele megmarad. A kódot
> elolvasva ez értelmetlen: a `pruneChemistry` pontosan azokat a párokat törli,
> ahol az egyik játékos **már nincs a klubnál** — megtartani őket azt jelentené,
> hogy a keret kémiája egy távozott emberrel számol. A Csapatkovácsnak marad a
> valódi, mérhető hatása: **+5,4 kémia** teljes keretre, csúcsedzővel.

A kémia `×1.2` szorzóval megy a morálba (`index.html:14054`), tehát +6 kémia
≈ +7.2 morál — **kevesebb, mint a Lélekemelő**, viszont a kémia **tartós**
(nem szezononként újraszámolt nulláról), és a `goodPairs` védelme miatt átível
a keretváltozásokon. Más játékstílust jutalmaz: a Lélekemelő a gyorsan cserélt
keretet menti, a Csapatkovács a hosszan együtt tartott keretet hizlalja.

### 6.5 Ritmusmester (forma) → `index.html:18040`

A meccs elején sorsolt jó/rossz formájú játékos kiválasztásába nyúl bele:

```js
/* Jó forma: a fókuszált játékosok súlya nő. */
goodWeight[i] *= 1 + 1.5*coachPower(c, name);
/* Rossz forma: a fókuszált játékosok súlya csökken — de sosem nullára. */
badWeight[i]  *= Math.max(0.25, 1 - 1.5*coachPower(c, name));
```

**Miért nem nullázható:** a `formlock` skill (Iránytű, `index.html` SKILLS)
már ma is létező, ritka jutalom, ami *garantálja* a rossz forma hiányát. Ha az
edző ugyanezt adná, a skill értéktelenné válna. Az edző **valószínűséget tol**,
a skill **garantál** — a két réteg megmarad.

Másodlagos hatás: a `S.moraleSum` mintavételnél a Ritmusmester **csillapítja a
morál-ingadozást** szezon közben (a `moraleTarget` felé húzás sebessége
`1 + 0.5·coachPower`-rel nő). Ez a „formaedző" igazi karaktere: nem magasabb
csúcs, hanem **kisebb hullámvölgy**.

### 6.6 Gyógyító kéz (sportorvos) → `index.html:19098` + `addOrExtendUnavailable`

Két hatás:

**a) Sérülés-esély csökkentés.** A `Math.random() < 0.035 + ...` sorban a
súlyozott jelöltválasztásnál (`cardInjuryMult`) a fókuszált játékos súlya
csökken:

```js
w[i] *= Math.max(0.35, 1 - 0.65*coachPower(c, active[i].p.n));
```
Csapat-fókusszal ez az **össz-sérülésszámot** nem csökkenti (a 0.035 alap-esély
változatlan), csak eloszlatja. Ezért kell egy második, valódi hatás:

**b) Lábadozás-rövidítés.** Az `addOrExtendUnavailable(name, dur, "injury")`
hívás előtt:

```js
if(reason==="injury"){
  const heal = medicPowerFor(playerName);           // 0 … 1
  if(heal > 0 && Math.random() < heal) dur = Math.max(1, dur-1);
  if(heal > 0.75 && Math.random() < heal-0.75) dur = Math.max(1, dur-1);
}
```
A sérülés alaphossza 2–4 forduló (`index.html:19101`), tehát egy csúcs-sportorvos
átlagosan **~1.2 fordulóval rövidít** — a kulcsjátékosod 4 meccs helyett 2-t
hagy ki. Ez a leginkább *érezhető* hatás az egész rendszerben, ezért van
szándékosan szigorú képlet mögötte (2.2: nehéz jó sportorvost szerezni).

**c) Csapat-fókuszú globális ág.** Ha a Gyógyító kéz `team` módban van, az
alap-sérülésesély is csökken:
```js
const injBase = 0.035 * (1 - 0.30*teamMedicPower());   // max −30%, azaz 0.0245
```

### 6.7 Összefoglaló tábla

| Típus | Belső kulcs | Fő csatorna | Bekötési pont |
|---|---|---|---|
| Gólvágó-mentor | `attr:gol` | `ap.gol` | `index.html:8953` |
| Játékmester | `attr:passz` | `ap.passz` | `index.html:8953` |
| Bástya | `attr:ved` | `ap.ved` | `index.html:8953` |
| Kesztyűs mester | `attr:kapus` | `ap.kapus` | `index.html:8953` |
| Sprintmester | `attr:seb` | `ap.seb` | `index.html:8953` |
| Iskolateremtő | `skill` | skill-súly, szakaszok | `index.html:20894`, `13709` |
| Lélekemelő | `morale` | `moraleTarget` | `index.html:14054` |
| Csapatkovács | `chem` | `CHEM.total`, `goodPairs` | `index.html:11917`, `14602` |
| Ritmusmester | `form` | forma-sorsolás, morál-csillapítás | `index.html:18040` |
| Gyógyító kéz | `medic` | sérülés-súly, lábadozás | `index.html:19098` |

### 6.8 Halmozási korlát

Ugyanabból a **belső kulcsból egyszerre csak egy** edző lehet aktív. Nem
rakhatsz be három Gólvágó-mentort. Enélkül a 6 slot triviálisan
„3× ugyanaz a legerősebb típus" lenne, és a rendszerből eltűnne a
portfólió-építés. A UI a második azonos típusú jelöltnél figyelmeztet, de a
felvétel **megengedett** — csak inaktívan ül a stábban, amíg a másikat el nem
küldöd. (Így nem vész el egy legenda azért, mert rossz sorrendben vonult vissza.)

---

## 7. Adatszerkezet és mentés

### 7.1 Új állapotmezők

```js
S.staff        = [];    /* aktív edzők, max S.coachSlots */
S.coachSlots   = 3;
S.staffHall    = [];    /* kiöregedett edzők — csak emlék, nulla játékhatás */
S.coachFocusChangeUsed = false;
S.pendingCoachOffer = null;  /* a szezonzáró búcsú-kártya vár rá */
```

### 7.2 Egy edző rekordja

```js
{
  n:       "Kovács Bence",
  type:    "attr:gol",         // lásd 6.7
  attrKey: "gol",              // csak attr:* típusnál
  sz:      68,                 // AKTUÁLIS szakértelem
  szBase:  61,                 // belépéskori — a fejlődési plafon alapja (szBase+12)
  age:     37,
  xp:      6,                  // ledolgozott szezonok
  since:   12,                 // melyik szezonban lépett be
  fp:      { /* careerFingerprint — a kártyán mutatjuk, és ebből számol az Sz */ },
  focus:   { mode:"players", group:null, names:["Nagy Áron"] },

  /* --- csak Iskolateremtőnél (6.2.1) --- */
  legacySpent: 0,              // hány skillt adott már át összesen
  legacyOut:  { fw_poacher:2 } // skillenkénti darabszám (a perSkillCap és a
                               // súlyozott sorsolás alapja)
}
```

**Miért marad benne az `fp`:** a stábkártyán meg akarjuk mutatni, *miért* jó ez
az edző („284 meccs · 96 gól · 2 sérülés"). Ez a rendszer érzelmi hozadéka —
a szám mögött ott a közös múlt. Mérete elhanyagolható (~20 mező × max 6 edző).

### 7.3 Mentés

A `saveGame` S-blokkjába (`index.html:27643` környéke) egy sor:

```js
staff:S.staff, coachSlots:S.coachSlots, staffHall:S.staffHall,
coachFocusChangeUsed:S.coachFocusChangeUsed, pendingCoachOffer:S.pendingCoachOffer,
```

A betöltésnél (`index.html:27922` környéke) migrációval:
```js
S.staff      = d.S.staff || [];
S.coachSlots = d.S.coachSlots || COACH_SLOTS_BASE;
S.staffHall  = d.S.staffHall || [];
/* skillsEverCount visszamenőleges pótlása */
Object.values(careerPool).forEach(e=>{
  if(e.skillsEverCount===undefined) e.skillsEverCount=(S.skills[e.n]||[]).length;
});
```

**Méret-hatás:** 6 edző × ~350 bájt ≈ 2 KB. A `localStorage` 5 MB-os
korlátja (`index.html:1892`) szempontjából elhanyagolható.

**Új játék törlése:** a `S.staff`/`S.staffHall`/`S.coachSlots` bekerül a
`index.html:11069` teljes állapot-törlésbe.

**Multiplayer:** a stáb tisztán **egyjátékos-oldali** állapot — nem szinkronizált,
nem determinizmus-érzékeny (a hatásai a saját meccsmotor-példányodban futnak).
A `mpSaveKeyFor()` mentésbe ugyanúgy belefér, külön kezelés nélkül.

---

## 8. Felület

### 8.1 Belépő

HUB → ☰ Menü → **Klub** csoport → új `hubCard`:

```html
<button id="hubStaffBtn" class="hubCard">
  <span class="ic">🎓</span>
  <span class="tx">
    <span class="tt">Szakmai stáb</span>
    <span class="ds">Személyi edzők — a visszavonult legendáid tudása</span>
  </span>
</button>
```
Badge-dzsel, ha van üres slot ÉS van jelölhető 32+ játékosod, vagy ha
`pendingCoachOffer` vár.

### 8.2 A stáb-nézet

A `scWindow` panelt használja (mint a scout-fejlesztés, `index.html:23231`),
így nulla új képernyő-infrastruktúra kell.

```
╭──────────────────────────────────────────────╮
│  🎓 SZAKMAI STÁB                    3 / 3    │
│  ┌────────────────────────────────────────┐  │
│  │ 🎯 KOVÁCS BENCE           ★★★★☆  Sz 68 │  │
│  │    Gólvágó-mentor · 37 év · 6. szezonja│  │
│  │    284 meccs · 96 gól · 2 sérülés      │  │
│  │  ──────────────────────────────────────│  │
│  │    Fókusz:  [ Keret ][ Poszt ][●Ember ]│  │
│  │             ▸ Nagy Áron (19, CS)       │  │
│  │    Hatás:   +0.41 gólszerzés-pont/meccs│  │
│  │             ≈ 0,8 lépés/szezon          │  │
│  └────────────────────────────────────────┘  │
│  ... további 2 edző ...                      │
│                                               │
│  ➕ Slot bővítés  3 → 4        20 Mrd Ft     │
│  🕯 Stáb-csarnok (4 korábbi edző)            │
╰──────────────────────────────────────────────╯
```

**A „Hatás" sor kötelező.** Ez a rendszer legfontosabb UI-eleme: minden
beállításnál **kiírjuk a konkrét, számolt hatást**, ugyanúgy, ahogy a
kapitány-előrejelzés (`moraleTargetIfCaptain`, `index.html:14067`) és az
edzés-mérleg (`trainBalanceHtml`, `index.html:8804`) teszi. A felhasználónak
nem szabad találgatnia, mit ér egy fókuszváltás — a fókusz-választó gombok
**élőben újraszámolják** a sort, még kattintás előtt.

### 8.3 A típusválasztó (belépéskor)

```
╭──────────────────────────────────────────────╮
│  KOVÁCS BENCE BEFEJEZTE A PÁLYAFUTÁSÁT       │
│  37 év · 284 meccs · 96 gól · 41 gólpassz    │
│  Remek vezető · Népszerű · Kiegyensúlyozott  │
│  2 sérülés · 3 skill valaha                  │
│                                               │
│  Milyen edző legyen belőle?                  │
│  ┌──────────────────────────────────────┐    │
│  │ ★★★★☆ 71  Lélekemelő                 │    │
│  │   Remek vezetői képessége a teljes    │    │
│  │   öltözőt emelné.                     │    │
│  ├──────────────────────────────────────┤    │
│  │ ★★★★☆ 68  Gólvágó-mentor             │    │
│  ├──────────────────────────────────────┤    │
│  │ ★★★☆☆ 55  Csapatkovács               │    │
│  └──────────────────────────────────────┘    │
│  ▾ További 4 lehetőség                       │
│                                               │
│  [ Bevesszük a stábba ]  [ Elbúcsúzunk ]     │
╰──────────────────────────────────────────────╯
```

Az indoklás-mondat generált, a legerősebb bemeneti tagból (pl. `leadI` 4 →
„Remek vezetői képessége…"). Ez teszi olvashatóvá a képletet anélkül, hogy
számokat kellene magyarázni.

### 8.4 A felvétel utáni bevezető (v2.6.056)

**A probléma:** a felvétel után a felhasználó visszakerült a HUB-ba, az új edző
pedig egy menü mélyén ült, **alapértelmezett fókusszal**. Könnyű volt szem elől
téveszteni, hogy egyáltalán be kell állítani — a rendszer legfontosabb döntése
maradt érintetlenül.

**Megoldás, két rétegben:**

1. **Minden felvételnél**: a megerősítés után azonnal megnyílik a stáb-panel, és
   a képernyő az új edző kártyájára görget.
2. **Az ELSŐ edzőnél** (karrierenként egyszer, `S.staffIntroDone`): egy
   háromlépéses, kiemeléssel vezetett bevezető fut le a kártyán:

   | Lépés | Kiemelve | Miről szól |
   |---|---|---|
   | 1/3 | a fejléc (`staffHead`) | mi az a Szakértelem, honnan jön, hogy nőhet |
   | 2/3 | a fókuszgombok (`staffFocusRow`) | a három mód, a szűk/széles kompromisszum, és hogy a morál/kémia-edzőt ne szűkítsd |
   | 3/3 | a hatás-sorok (`staffEffect`) | hogy a szám élőben újraszámol, és a ciklus-korlát |

**Miért nem a guide-motoron megy:** a guide kikapcsolható („Ne mutass több
tippet"), és a felhasználó ilyenkor pont a lényegről maradna le. Ez a bevezető
a beállító felület **részeként**, a kártyán belül jelenik meg — így nem takarja
el azt, amit épp magyaráz, nem csúszhat el a tartalomtól, és a `guideHi`
kiemelő gyűrűt használva mégis ugyanaz a vizuális nyelv. Bármelyik lépésnél
kihagyható, és utána a felvétel már csak odagörget.

### 8.5 Játékos-panel jelölés

A HUB keret-listáján a fókuszált játékos neve mellé egy apró jelvény kerül
(`🎯` + az edző típus-ikonja), a meglévő `statusbadge` mintájára
(`index.html:12175`). Így a keretet nézve is látod, kire megy a figyelem.

---

## 9. Balansz-védőhálók

Ezeket implementációkor **méréssel** kell igazolni (a repo `simulateChallenge`
mintája szerint, `index.html:12845`), de a tervezett korlátok:

1. **Az edző nem tud plafont mozdítani.** Sem `ATTR_SPEC_CEIL`, sem
   `ratingCap()`, sem `SPEED_MAX`, sem a passzív sebesség-plafon
   (`speedPassiveCeil`). Csak a plafonig vezető utat rövidíti.
2. **Nem termel Ratinget közvetlenül.** Az attribútum-mesterek az `attrPoints`
   csatornába írnak, ami a specializációt mozgatja — a Rating-horgony
   (`syncAttrsToRating`) érintetlen. Így az edzőrendszer **nem inflálja** a
   csapaterőt, csak a profilt élesíti.
3. **Kor-görbe alá van rendelve.** Az `addA` már alkalmazza az
   `ageScaleAttr`-t (`index.html:8564`) — 30 év fölött `×0.4`. Tehát a
   személyi edző **a fiatalokon hat igazán**, az öregeken alig. Ez zárja a
   kört: az öreg játékosból lett edző a fiatalokat neveli.
4. **A morál-hatás plafonos** (max +14) és a kémia-hatás is (max +6).
5. **Egy típus egyszerre egy aktív edző** (6.8).
6. **Fókuszváltás ciklusonként egyszer** (5.2).
7. **Nincs edző-piac.** A 40 meccses együtt-töltött küszöb (1.1) miatt az
   edzőminőség nem vásárolható, csak kinevelhető.

### 9.1 Amit mérni kell implementáció után

| Mérés | Elvárás | **Mért (v2.6.052)** |
|---|---|---|
| 1 fős fókuszú attr-mester szezonhozama | 0,7–1,0 attr-lépés | **0,86** ✅ |
| ...ugyanő teljes keretre, fejenként | — | 0,09 |
| Lélekemelő + Csapatkovács együtt, csapat-OVR | — | **+0,7 OVR** |
| Lélekemelő teljes keretre / 1 főre | — | +7,7 / +0,3 morál |
| Lábadozás ★★★★ sportorvossal (fókuszált játékos) | −20…−30% | **−25%** ✅ |
| ...közel maximális (Sz 86) sportorvossal | — | −33% |
| Alap sérülés-esély teljes keretre állított sportorvossal | max −30% | **−27%** ✅ |
| Hagyaték: 1 fős fókusz | 1,5–2,5 szezon | **4 skill / 1,8 szezon** ✅ |
| Hagyaték: keret-fókusz | 15–25 szezon | **16 skill / 23,4 szezon** ✅ |
| Hagyaték: hány külön játékos kap (vegyes / csatár-hagyaték) | — | 16 / 4 |
| VÉDŐHÁLÓ: az edző át tudja-e lökni a spec. plafont | soha | **nem** ✅ |

### A „teljes stáb +1,5…+2,5 OVR" elvárás HIBÁS VOLT

Ezt a saját tervem mondta ki, és **ellentmond a saját 2. védőhálójának**. A
balansz-szabály szerint az edzők *„nem termelnek Ratinget közvetlenül… nem
inflálják a csapaterőt, csak a profilt élesítik"* — az attribútum-mesterek
szándékosan a specializációs csatornába írnak, nem a Rating-horgonyba. Vagyis a
tíz típusból **csak kettő mozdítja egyáltalán a csapat-OVR-t**: a Lélekemelő és
a Csapatkovács, mindkettő plafonos.

A maximum tehát matematikailag adott:
`moraleToOvr(50 + 14 + 6×1,2) = **+1,06 OVR**` — ennél többet a teljes stáb
sem tud, és nem is szabad tudnia.

**Mérve, hat csúcsedzővel, mind a teljes keretre állítva:** +7,7 morál és
+5,4 kémia → **+0,7 csapat-OVR**, plusz −27% alap sérülés-esély. A többi hatás
(attribútum-specializáció, forma-stabilitás, skillek, hagyaték) **nem OVR-ben
jelentkezik**, hanem szezonokon át halmozódva a keret profilját és
rendelkezésre állását formálja — ezért nincs is egyetlen számba sűrítve.

| A teljes stáb hatása | Mért |
|---|---|
| közvetlen csapat-OVR (morál + kémia) | **+0,7** (elméleti max +1,06) |
| alap sérülés-esély | **−27%** |
| jó forma súlya a célzott játékoson | ×2,20 |
| attribútum-lépés/szezon a célzott játékoson | 0,86 |

Ha a teljes stáb hatása +4 OVR fölé megy, a `COACH_ATTR_PTS` és a
`moraleCoachBonus` szorzóit kell visszavenni — a slot-árat **nem**, mert az a
progresszió tempóját szabja, nem a végállapot erejét.

---

## 10. Implementációs sorrend

Négy, egymásra épülő, önmagában is szállítható fázis.

**F1 — Adatréteg és belépés** (nincs játékhatás, mérhető, kockázatmentes)
- `skillsEver` könyvelés + migráció (1.4) — **ez a sürgős elem**, minden nap
  késés véglegesen elveszett skill-történelem
- `careerFingerprint()`, az Sz-képletek mind a 10 típusra (2. fejezet)
- `S.staff` / `S.coachSlots` / `S.staffHall` + mentés-betöltés (7.)
- Búcsú-kártya a szezonzáró jelentésben, típusválasztóval (8.3)
- A hagyaték-mezők (`legacySpent`, `legacyOut`) létrejönnek, de még üresen
  állnak — a mechanika F3-ban kapcsol be
- **Ellenőrizhető:** edzőt lehet felvenni, a stáb megmarad újratöltés után,
  de még semmit nem csinál.

**F2 — Stáb-nézet és fókusz** (UI, még mindig nulla játékhatás)
- HUB-gomb, `scWindow`-alapú stáb-panel (8.2)
- Fókusz-választó, `focusShare` élő hatás-előnézettel
- Slot-bővítés vásárlás (4.)
- **Ellenőrizhető:** minden beállítható és látható, a „Hatás" sor helyes
  számot mutat.

**F3 — A hatások bekötése** (itt lesz játék belőle)
- Attribútum-mesterek (6.1) — ez a legkisebb kockázatú, kezdjük ezzel
- Gyógyító kéz (6.6), Ritmusmester (6.5)
- Lélekemelő (6.3), Csapatkovács (6.4)
- Iskolateremtő (6.2) — ez a legösszetettebb, jöjjön utoljára
- **Ellenőrizhető:** a 9.1 mérőtábla minden sora sávon belül.

**F4 — Élettartam és hangulat**
- Edzői XP és fejlődés (3.1), kiöregedés (3.2), Stáb-csarnok
- Naplósorok, jelvények a keret-listán (8.4), Fogalomtár-bejegyzés
  (`index.html:10277`), Guide-mód szöveg (`index.html:10330`)

---

## 11. Nyitott döntések

Ezekre az implementáció előtt kell válasz — mindegyiknél megjelölve az
ajánlásom.

1. **MÉG NYITOTT — legyen-e az edzőnek szezonális fizetése?**
   *Ajánlás: igen, de szelíden* — `Sz × 40 pont/szezon` (egy ★★★★ edző ≈ 2,7
   Mrd Ft/szezon), levonva a `computeSeasonBudget`-ből. Ez ad súlyt a
   6 slotos kiépítésnek: nemcsak megvenni kell, fenntartani is. **Külön
   konstanssal kapcsolható ki** (`COACH_SALARY_PER_SZ = 0`), ha méréskor
   kiderül, hogy csak nyűg.

2. ~~**Elküldhető-e egy edző?**~~ **ELDÖNTVE (F2): igen**, megerősítéssel, és a
   Stáb-csarnokba kerül.

3. ~~**Az „Öreg csirkefogó" boost ütközik-e?**~~ **ELDÖNTVE: nem, kiegészíti.**
   A boosttal tovább játszik → több meccs és magasabb kor → **jobb edző lesz
   belőle**. Külön kód nem kellett hozzá: a `rutinPont` és a `korPont` magától
   jutalmazza.

4. **A családtag** (`p.family`) lehet-e edző? **Egyelőre NEM**  <!-- még nyitott --> — a „B" út
   gombja kizárja (`!p.family`), ahogy az eladás is. Nyitva hagytam: a
   +5 Sz bónuszos változat bármikor bekapcsolható, de egy visszafordíthatatlan
   döntést a családtagon nem akartam megkérdezés nélkül élesíteni.

5. **Klasszikus (nem karrier) módban** legyen-e? *Ajánlás: nem.* A
   `careerStats.matches` ott sosem nő (`index.html:18379`), tehát a teljes
   Sz-képlet értelmezhetetlen. A rendszer karrier-módra való.
