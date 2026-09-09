# 🙂 Jellem és morál — karizma, kapcsolódás, vérmérséklet (3.9.56)

*(Érintett kód: `KAR_LEVELS` / `KAP_LEVELS` / `VER_LEVELS` · `KARW` / `KAPW` /
`VERW` · `TRAIT_BAND` és a `tr…` kérdések · `karN` / `kapN` / `verN` ·
`moraleImpact` / `moodMarkOf` / `moodMarkAdd` · `captainSuitability` /
`captainBreakdownTxt` · `redRiskOf` / `yellowRiskOf` · `saveMigratePot` /
`traitRescaleObj`. Mérés: `tools/jellem-proba.js`.)*

## 1. Mi változott

| régen | most | fokozat |
|---|---|---|
| vezetői képesség | **karizma** | 5 → **7** |
| együttműködés | **kapcsolódás** | 6 → **9** |
| temperamentum | **vérmérséklet** | 5 → **9** |

```
karizma       töketlen · határozatlan · semleges · határozott · meggyőző ·
              erős vezető · az igazi vezető
kapcsolódás   szorongó · távolságtartó · balhés · nehéz eset · könnyed ·
              jó fej · nyitott · mindenki szereti · egy igazán jó ember
vérmérséklet  földi béke · nyugis · laza · kimért · óvatos · feszült ·
              türelmetlen · hisztis · vandál
```

A kód is átállt: `leadI/coopI/aggroI` → `karI/kapI/verI`, és a `p.lead`,
`p.coop`, `p.aggro` **string-mezők megszűntek**. Azok kettős igazságot
tartottak (két hely ugyanarra a tulajdonságra, és a mentésben duplán utaztak);
a név innentől mindig a listából jön (`karTxt` / `kapTxt` / `verTxt`), tehát
egy átnevezés a régi mentéseket is azonnal helyesen írja ki.

## 2. A veszélyes rész: a hosszabb skála

A kérés így zárult: *„vigyázz! Ahol több tulajdonságszintet soroltam van mint
amennyi régen volt, ott integráld az új szintekhez tartozó változókat a
rendszerbe."* Ez a mondat pontosan a nehézségre mutat rá.

A régi kód **két módon** kötődött a fokozatok SZÁMÁHOZ, és mindkettő némán
tört volna el:

**a) Hard-kódolt küszöbök.** `aggroI>=3` a régi ötös skálán a felső kettőt
jelentette (a keret 32%-a). A kilences skálán ugyanez a `3` már a **kimért**,
vagyis a nyugodt fél — a játék a keret 68%-át tekintette volna forrófejűnek.
Tizenhat ilyen küszöb volt a kódban.

**b) Indexelt súlytömbök.** A piroslap-hajlam egy ÖTELEMŰ tömb volt:

```js
[0.2,0.5,1,2,3][x.p.aggroI]
```

Kilenc fokozaton a hatodiktól kezdve ez `undefined` → `NaN` → **nulla súly**:
a legforróbb fejek egyáltalán nem kaptak volna lapot. Pont a fordítottja
annak, amit a skála mond.

**A megoldás mindkettőre ugyanaz: a fokozatok száma sehol nem szivároghat be
egy képletbe.**

* minden küszöb nevesített sávon megy át (`TRAIT_BAND` + `trKarVezer`,
  `trKapGond`, `trVerForro`, …) — egyetlen helyen áll a nyolc szám;
* minden képlet a **0..1-re normált** értékből dolgozik (`karN`, `kapN`,
  `verN`);
* a lap-hajlam tömb helyett folytonos görbe (`cardRiskFrom`), aminek a
  **végpontjai és a közepe betűre a régiek** (0,2 · 1,0 · 3,0 pirosnál;
  0,35 · 1,0 · 2,4 sárgánál), a köztes fokozatok pedig ugyanazon az
  exponenciális íven ülnek.

## 3. Az egyensúly nem mozdult

A súlyok ÚGY vannak beállítva, hogy a nevesített sávok népessége megegyezzen a
régivel. Mérve, a teljes adatbázison (4626 kártya):

| sáv | régi | most |
|---|---|---|
| karizma — gyenge (töketlen, határozatlan) | 8% | **8,0%** |
| karizma — vezéralkat (meggyőző+) | 26% | **25,9%** |
| kapcsolódás — törött (szorongó, távolságtartó) | 5% | **5,0%** |
| kapcsolódás — negatív fél (… nehéz eset) | 15% | **14,8%** |
| kapcsolódás — jó (jó fej+) | 60% | **59,7%** |
| kapcsolódás — népszerű (nyitott+) | 32% | **32,8%** |
| vérmérséklet — higgadt (… laza) | 32% | **32,2%** |
| vérmérséklet — forró (türelmetlen+) | 32% | **31,4%** |

Vagyis a **felbontás lett finomabb, a keret összetétele nem változott** — egy
futó karrier nehézsége nem ugrik meg a frissítéstől.

## 4. Hol számít a jellem, és mennyit

| rendszer | mit néz | mértéke |
|---|---|---|
| **kapitányválasztás** | karizma | 0 … **+40** — a pontok fele |
| | rutin (kor) | 0 … +12 |
| | összhang | −14 … +14 |
| | kapcsolódás | −7,5 … +7,5 (a negatív fele még −8) |
| | vérmérséklet | 0 … **−8** — csak levon, sosem ad |
| **öltözői események** | mind a három | 17 esemény, ±1…±6 morál |
| **passzkémia** | kapcsolódás mértani középpel, karizma aszimmetrikusan | két forró fej lassabban ér össze |
| **összhang-plafon** | a legrosszabb kapcsolódás + a legforróbb fej | a kötés 40 fölé nem jut |
| **piros lap** | vérmérséklet | a vandál **15×** annyi, mint a földi béke |
| **sárga lap** | vérmérséklet | 0,35 … 2,4 — laposabb, mert sárgát mindenki kap |
| **a lap OKA** | kapcsolódás + vérmérséklet | reklamálás ×4 a negatív kapcsolódásnál, ×0,5 a nyitott fölött |
| **kispadra szorulás** | vérmérséklet, majd karizma | ki robban ki hangosan |
| **beilleszkedés** | kapcsolódás | ×0,3 … ×1,7 a tempón |
| **piaci érték** | vérmérséklet | a forró fej drágább (kockázat) |
| **Panzer-vállalás** | mind a három negatív vége | 14 vonás a kezdő keretben |

A kapitány-bontás a **játékos lapján** is ott van, tételesen — ugyanabból a
képletből (`captainSuitability`), amiből az ajánlás dolgozik, tehát nem tud
elszakadni tőle.

## 5. A morál-smiley

> „legyen minden játékosnál, a név mellett egy kis smiley 10 fokozatú, ami
> jelzi, mennyire van jó hatással az össz csapatmorálra (ez tudjon alakulni
> annak fényében, hogy mik történnek az öltözőben)"

```
😡 😠 🙁 😕 😐 🙂 😊 😄 🤩 😇
```

**Két részből áll, és ez a lényege:**

* a **jellem** adja az alaphelyzetet — `0,55 × kapcsolódás + 0,30 × karizma −
  0,35 × vérmérséklet`, mindhárom a normált skáláról. A kapcsolódás a
  legnagyobb tétel (a hangulat az övé), a vérmérséklet **levon**: egy hisztis
  ember a legjobb kapcsolódás mellett is költség;
* az **öltöző** írja felül — minden személyiség-esemény ráírja a szereplőire
  azt a morál-előjelet, amit maga a csapatnak hozott (`moodMarkAdd`).

Így a smiley **nem egy második, párhuzamos statisztika**: pontosan azt a
történetet mondja el, ami az öltözői naplóban is olvasható. A jegy ±0,8-nál
megáll, tehát egy rossz sorozat nem tudja véglegesen elmérgezni valakinek a
hírét, és egy jó sem tud mindent kimosni.

A jel a **keretlistában**, a **draft-sorokban** és az **átigazolási
jelölteknél** áll a név előtt (a sor elejét pásztázza a szem), a **játékos
lapján** pedig kibontva: hányas a tízből, mit jelent, és merre mozdította az
öltöző.

## 6. Régi mentések

A jellem **nem sorsolódik újra** — átköltözik. A mentés 3.9.56-tól megmondja,
hány fokozatú volt a három tengely (`traitLen`), és a betöltés arányosan
átskálázza az indexeket: a régi „Remek" vezetőből *az igazi vezető*, a
„Kiegyensúlyozott"-ból *óvatos*, a „Bajkeverő"-ből *szorongó*.

Két külön úton kell átvezetni, és a második az, amit könnyű elfelejteni:

1. a mentés **fája** (slots, BENCH, extraRoster, ajánlatok, kirakat, ikonok) —
   ott a mező a nevén van, tehát átnevezés + átskálázás;
2. a **careerPool**, ami **pozicionálisan** tömörített: a nevek sosem kerülnek
   a mentésbe, tehát a régi indexek az ÚJ néven, de a RÉGI skálán érkeznek
   vissza. A bejárás nem éri el őket (számtömbök), ezért a kicsomagolás után
   külön futunk rajtuk végig.

Enélkül egy régi karrier legforróbb feje (`aggroI` 4) az új skálán *óvatos*
lett volna — vagyis a keret legveszélyesebb embere némán megszelídül.

## 7. Ami eltűnt a forrásból

A régi blokk fejléce „SZEMÉLYISÉG (Hattrick-adaptáció)" volt, és a kód egy
külső wiki-hivatkozást is tartalmazott az arányokhoz. Mindkettő törölve — a
skálák, a nevek és az eloszlások mostantól a játék sajátjai.

A `hattricks` mező marad: az a **mesterhármas** (három gól egy meccsen), egy
évszázados futballfogalom, és a felületen is így jelenik meg.
