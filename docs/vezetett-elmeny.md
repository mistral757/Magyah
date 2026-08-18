# Vezetett élmény — a tanítóréteg

*(3.3.31. Érintett kód: `TEACH_TOPICS` + `teach*` függvények (index.html), a
`GUIDE_TIPS` tipp-tábla, `STAFF_INTRO_STEPS`. A fejlesztés menete és a
döntések indoklása: `vezetett-elmeny-roadmap.md`.)*

## 1. Miért van

A játék sok rendszerből áll, és eddig egyetlen kapcsoló döntött arról, hogy
kapsz-e hozzá segítséget — a karrier indításakor, **alapértelmezésben
kikapcsolva**. Aki nem nyúlt ahhoz a gombhoz (a kezdők túlnyomó része), az úgy
esett el a teljes tanítástól, hogy nem is tudta, hogy létezik. Ha pedig egyszer
rákoppintott a „Ne mutass több tippet"-re, **visszaút nem volt**.

A tanítóréteg ezt váltja fel: egy témaregisztrátum, három megjelenítési szint,
négy fokozat, és menet közben is állítható.

## 2. A három szint

| szint | mit csinál | mikor |
|---|---|---|
| **1. Tipp** | egy buborék a képernyő alján, „Részletek" gombbal a fogalomtárba | a döntés PILLANATÁBAN, karrierenként egyszer |
| **2. Vezetés** | 2–3 lépéses bevezető, lépésenként más kiemeléssel | az első alkalommal, amikor a téma esedékessé válik |
| **3. Jelzés** | szaggatott arany keret + pötty a sarkán | amíg a tennivaló ott áll, elintézetlenül |

A három szint **egy adatforrásból** dolgozik. Ugyanaz a téma megjelenhet
mindháromban (a Run szintje ilyen), csak az egyikben, vagy — ha „csendes" —
kettőben.

### A vizuális nyelv

* `.guideHi` — **folytonos** arany gyűrű, 1,9 s-os lüktetés. Ezt a **vezetés**
  és a **tipp** használja: „a magyarázat épp ide mutat".
* `.tNudge` — **szaggatott** arany keret, 3 s-os, halványabb lüktetés. Ez a
  **jelzés**: nem magyaráz, emlékeztet, és percekig kint marad.

A kettő szándékosan különbözik, mert egyszerre is kint lehetnek. A villogás
sosem az egyetlen jel: `prefers-reduced-motion` mellett a keret és a pötty
statikus, de látható marad.

## 3. A négy fokozat

| fokozat | tipp | vezetés | jelzés |
|---|---|---|---|
| **Teljes vezetés** (`hard`) | ✅ | ✅ minden témán | ✅ |
| **Tippek és jelzések** (`guided`) | ✅ | csak a `crit` témákon | ✅ |
| **Csak emlékeztetők** (`light`) | — | — | ✅ |
| **Semmi** (`off`) | — | — | — |

Új karriernél a **teljes vezetés** az alapértelmezett. Beállítható a karrier
indításakor (`#guideGrid`) és **menet közben bármikor**: HUB → ☰ Menü →
**🧭 Vezetés**. Ott van a kategóriánkénti és témánkénti finomhangolás is, meg a
„Vezess újra végig".

## 4. Egy téma anatómiája

```js
"train:plan":{
  n:"Edzésterv",           /* emberi név — a beállítólistának és a buboréknak */
  grp:"csapatepites",      /* kategória (csoportos ki/bekapcsoláshoz) */
  scr:"hub",               /* melyik képernyőn él: "hub" | "match" */
  prio:15,                 /* rangsor — KISEBB szám = előrébb */
  mark:"🏋️",               /* emoji a HUB menü-gombjára, ha a horgony rejtve van */
  g:"edzesterv",           /* GLOSSARY-kulcs a „Részletek" gombhoz */
  a:"hubTrainingBtn",      /* horgony: ide kerül a keret és a pötty */
  why:"Nincs beállított…",  /* EGY mondat: miért villog */
  crit:1,                  /* vezetett módban is kap teljes lépéssort */
  quiet:1,                 /* CSENDES: nem rajzol jelzést (a játék már jelez) */
  always:1,                /* light módban is lefut a bevezetője */
  form:"inline",           /* a lépéssor formája: "inline" | "overlay" */
  ready(){…},              /* elérhető-e MÁR a funkció */
  due(){…},                /* van-e MOST tennivaló */
  sig(){…},                /* MEGÚJULÓ téma aláírása — lásd az 5. pontot */
  onEnd(){…},              /* a téma saját zárása */
  steps:[{a,t,x,pre}],     /* a 2. szint lépései */
  tip:{t,x,g}              /* az 1. szint buborékja (a GUIDE_TIPS-ből fűzve) */
}
```

### A `form` két értéke

* **`inline`** — a gazda-panel rajzolja a saját tartalmába
  (`teachStepsInlineHtml` / `teachStepsBindInline`). Így a doboz sosem csúszhat
  el attól, amit magyaráz. A stábtag-bevezető ilyen.
* **`overlay`** — a képernyő aljára ülő lap, horgonnyal és sötétítéssel. Olyan
  témákhoz, amelyeknek az útja képernyőelemek között visz (csapatstílus).

## 5. Mi kerül melyik szintre?

Három szabály dönti el, és mindhármat egy-egy hiba tanította meg:

1. **Ami modális döntés pillanata → TIPP.** Az akadémiai „felhozod vagy hagyod
   érni?" után nem marad tennivaló, amire villogni lehetne.
2. **Ami a képernyőn ottmaradó elintézetlenség → JELZÉS.** Az edzésterv hiánya
   minden meccsen fizet, amíg hozzá nem nyúlsz.
3. **Amit a játék már jelez a maga módján → CSENDES (`quiet`).** A meg nem
   nézett mérföldkövek számát az Infópult ikonja írja ki, aranyban lélegezve;
   egy szaggatott keret ugyanarra csak zaj volna. A csendes téma ott van a
   rangsorban, a beállításokban és a vezetésben — csak nem rajzol.
4. **Ami újra és újra esedékessé válik → MEGÚJULÓ (`sig`).** A hallgatás
   alapesetben „nem": három idény után a téma feladja (`TEACH_GIVEUP`). Ez
   viszont abból indul ki, hogy a tennivaló UGYANAZ maradt. A szezon-szerepek
   minden idényben lejárnak, az el nem költött stíluspont pedig minden új
   ponttal ÚJ ajánlat — itt a tavalyi hallgatás nem a mai kérdésre válaszolt.
   Az ilyen téma `sig()`-et kap: amíg az aláírás nem mozdul, minden a szokásos
   módon megy (halasztás, feladás); ha megváltozik, a téma **tiszta lappal**
   indul. Az elnémítást (`muted`) az aláírás-váltás **nem** töri fel — az
   kifejezett döntés az egész témáról, nem egy alkalomról.

### Ami nem jár le: az időablak

Az el nem költött stíluspont különleges eset: **nem sürget** (holnap is ott
lesz), de **némán gyűlik**, és a boltja a menü két kattintásnyi mélyén van. Egy
ilyet folyamatosan kint tartani zaj, teljesen elhallgatni viszont veszteség.
A `style:spend` ezért **ciklikus**: `teachSpendWindow()` minden hat fordulóból
az első kettőn engedi elő. A fordulószámláló idényenként 30-cal lép, ami a
ciklus egész többszöröse — így minden idény **első fordulója** beleesik az
ablakba, épp amikor a szezon tervezése zajlik. A téma ráadásul csak akkor
esedékes, ha `styleSpendable().items > 0`, vagyis van MOST kifizethető tétel:
a puszta „gyűlik a pont" nem tennivaló.

**Ne írj olyan lépéssort, ami sosem futhat le.** A vezetés csak a HUB-ban indul
magától, tehát a `scr:"match"` témák lépéssora dead code volna. Ott a jelzés
„miért?" buboréka viszi az üzenetet, a `g` mezőn át a fogalomtárba.

## 6. Ami megvédi a felhasználót

| korlát | érték | miért |
|---|---|---|
| egyszerre egy tanítás | 1 | buborék és lépéssor sosem fut együtt |
| jelzés képernyőnként | max 3 | a negyedik már faliújság |
| vezetés szezononként | 6 (hard) / 3 (guided) | egy karrier ne álljon bevezetőkből |
| vezetés fordulónként | 2 | egy leülés ne váljon faliújsággá |
| „Most nem" | 3 forduló | a halasztás valódi halasztás |
| feladás | 3 szezon | amit három éven át átléptek, az már nem emlékeztet |

Ezen felül:

* **A kihagyás jelzés.** Aki egy bevezetőt félbehagy, az most nem tanulni jött —
  a forduló hátralévő részében nem indul újabb.
* **A keret csak a magától indult vezetésre fogy.** Amit te kérsz (edző
  felvétele, „Mutasd meg"), az nem a te idődből megy.
* **A siker elnémít.** Ha a `due()` hamisra fordul, a jelzés eltűnik.
* **A rangsor szabálya: ami LEJÁR, előrébb van, mint ami VÁR.** A felderítés az
  ablakkal együtt elvész; a döntésre váró licit holnap is ott lesz. Csak a
  visszafordíthatatlan döntés (csapatstílus) áll előrébb.
* **A meccs képernyője feszes hely.** Ott a jelzés a felső határ, és az is csak
  a mérkőzés utáni nyugalmi pillanatban frissül.

## 7. Az állapot és a mentés

```
S.teach = {
  ver:1, mode:"hard",
  topics:{ "<kulcs>":{ st, n, lastSeason, muted, snooze, seenN } },
  grpOff:{ "<kategória>":1 },
  stepsSeason, stepsUsed, stepsRound, stepsRoundUsed, stepsHalted,
  intro       /* egyszeri magyarázat jár-e még */
}
```

`st`: 0 = még nem került elő · 1 = tanítva · 2 = lezárt.

### Migráció régi mentésből

A `teachMigrate()` a guide két régi mezőjéből vezeti le a módot, és a leképezés
**tudatosan aszimmetrikus**:

* `guideOn=true` → `guided` — pontosan a mai élmény, eltérés nélkül;
* `guideOn=false` → `light` — a halk jelzés **új dolog**. A „ne mutass több
  tippet" a buborékokra vonatkozott, arra, ami megállítja az embert; a villogó
  keret nem állít meg senkit.

Mivel ezt a fokozatot **mi adtuk** és nem ő választotta, a migrált karrier
`intro:1` jelölést kap: a **legelső villogásnál** magától kinyílik a „miért?"
buborék egy bevezető sorral, ami megmondja, mi ez és hol kapcsolható ki. Pontosan
egyszer.

A `S.guideSeen` bejegyzésekből `st:1` lesz, az `S.staffIntroDone`-ból `st:2`. A
migráció **idempotens**, és egy sérült állapotot használhatóra állít vissza.

## 8. Hibakeresés

A kezdőlap 🧪 kémcső-gombja (`mpDiagBtn`) alatti diagnosztika kiírja a futó
karrier teljes tanítás-állapotát: minden témánál a prioritást, az `st`-t, a
horgony láthatóságát, és **az első okot, ami kizárta** — ugyanabban a
sorrendben, ahogy a `teachDueList` vizsgálja, hogy a dump és a valóság sose
mondjon mást.

```
train:plan [hub/p15] st=1 🏋️ · horgony: rejtve · elnémítva
subs:live  [hub/p45] st=0 🔁 · horgony: rejtve · feladva (3 szezon után)
pos:wrong  [hub/p25] st=0    · horgony: látszik · elhalasztva (2 forduló)
```

„Nálam nem jött elő" és „nálam folyton villog" — mindkettőre ez a válasz.

## 9. Új téma felvétele

1. Vedd fel a `TEACH_TOPICS`-ba a 4. pont mezőivel.
2. `due()` legyen **olcsó** és `try/catch`-elt — a HUB rajzolásakor fut.
3. Ha a horgonya a **csukott menüben** lakik, adj neki `mark`-ot is. Enélkül
   sosem kap keretet, tehát a feladás-számláló sem lép, és örökké jelezne.
4. Ügyelj rá, hogy **két téma ne villogjon ugyanarra**. Ha két téma ugyanabból
   a tényből indul, a `due()`-k osszák szét (lásd `teachMisfit`). Ha viszont két
   *különböző kiutat* kínálnak ugyanarra a szorulásra (eladás vs. keretbővítés),
   az nem ütközés, hanem választék.
5. Ha a tennivaló **idényenként újra előáll** (szezon-szerepek) vagy **új
   ajánlattá válik** (stíluspont), adj neki `sig()`-et — enélkül három idény
   után végleg elhallgat arról, amit minden idényben újra el kell dönteni.
6. **A jelzésnek legyen kiútja.** Ne villogjon olyan tennivalóra, amit a
   felhasználó most nem tud elintézni: a `style:roles` ezért nézi meg a
   jelöltlistát is (a Villám szerepeinek belépője van), a `style:spend` pedig
   azt, hogy van-e KIFIZETHETŐ tétel, nem csak pont.
7. Új globális név mindig `teach` / `TEACH_` előtaggal — egy globális scope van,
   és a `no-undef` az egyetlen háló. Futtasd a `./tools/check.sh`-t.
