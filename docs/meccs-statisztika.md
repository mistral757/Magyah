# Meccsenkénti statisztika és játékos-értékelés

*(3.7.26 — a statisztika-réteg ELSŐ lépcsője; 3.7.27 — a négy befolyás;
3.7.33 — a rövid beállás. Az utóbbihoz: `MSTAT_MIN_MIN`, `MSTAT_OUT_FLOOR`,
`MSTAT_PULL_FLOOR`, `mstatMinutes` / `mstatRated` / `mstatMinW`,
`pstatRatedOf`, a `.msSt0` CSS.
Érintett kód: `mstatCompute`, `mstatRate`, `mstatMods`, `mstatSkillCh`,
`mstatRoleCh`, `mstatFitOf`, `mstatProfileFit`, `mstatAxisZ`, `mstatPois`,
`mstatFin`, `mstatShow` / `mstatRender` / `mstatAfterMatch` / `mstatSyncBtn`,
`MSTAT_STYLE_W`, `MSTAT_STYLE_CH`, `MSTAT_ROLE_CH`, `MSTAT_FIT_ANCHOR`,
`MSTAT_POSS_SHIFT`, `MSTAT_PASS_MULT`, a `#mstatModal` markup és a `.ms*` CSS;
bekötés a `fullTime` végén és az `afterAllRewards` láncban.)*

## Mit tudott eddig a motor a mérkőzésről

Kettő dolgot mondott ki: az **eredményt** és a **meccs emberét**. Minden más —
ki mennyit tett hozzá, milyen volt a mérkőzés képe — a naplóban élt,
elbeszélve és szétszórva. A karrier-statisztika (`careerStats`) gyűjtött ugyan
gólt, gólpasszt, védést és tiszta lapot, de **meccs-szintű összegzés sehol nem
volt**, és a játékosnak nem volt egyetlen száma sem arról, hogyan játszott.

## Az alapelv: a számok nem díszletek

Ez a réteg **nem tesz zajt a végeredmény mellé**. Minden kiírt érték vagy
MÉRT (a szimuláció közben tényleg megtörtént), vagy a mérkőzés SAJÁT
paramétereiből származtatott. Konkrétan:

* a **kapura lövés sosem kevesebb a szerzett gólnál**;
* **az ellenfél védései PONTOSAN a mi kapura lövéseink mínusz a góljaink** — a
  négy szám (lövés/védés × két oldal) tehát egymásból következik, nem külön
  sorsolt, és nem mondhat ellent egymásnak;
* a **saját védéseink sosem kevesebbek a mérkőzésen elhangzott bravúroknál**
  (`saveCount`) — amit a napló kimondott, azt a táblázat nem tagadhatja le;
* a **labdabirtoklás** a Passz-tengelyedből, a taktikád stílusából és az
  erőkülönbségből áll össze.

A sorsolás **seedelt** (`rngFor`), és a kész számok a mentésbe kerülnek
(`S.lastMatch`) — nem a képlet. Egy újratöltés után az ablak ugyanazt mutatja.

## A hat csapat-statisztika

| sor | miből |
|---|---|
| **labdabirtoklás** | 50% + a taktika stílusa (`MSTAT_POSS_SHIFT`, a begyakorlás arányában) + a Passz-tengely z-je + az erőkülönbség; 24–76 közé vágva |
| **passzok** | 430 az 50%-hoz, ±8,4 birtoklási pontonként, × a rendszer szorzója (`MSTAT_PASS_MULT`) |
| **passzpontosság** | 78% + a Passz-tengely z-je + az erőkülönbség + a rendszer íze |
| **kapura lövés** | gól + a másik kapus védései (λ-ból húzva) |
| **labdaszerzés** | aki kevesebbet birtokol, többet véd: 11 + (100−birtoklás)×0,2 + a Védekezés-tengely z-je |
| **védés** | az ELLENFÉL kapura lövései mínusz a góljai, de sosem kevesebb a bravúroknál |

**A taktika akkor is látszik, ha még nem ül tökéletesen.** Az `MS.tacticStyle`
szándékosan csak 85-ös begyakorlástól él (ott a szimulációs szorzókat
kapcsolja); a labdabirtoklásnak viszont a NYERS stílus kell — egy félig
megtanult Labdatartás is birtokol, csak kevésbé. Ezt a `grip` fejezi ki
(a begyakorlás aránya, 0,35 padlóval).

## A játékos-értékelés

**Hét csillag, fél csillag lépésekben.** A **3,5 az „elvégezte a dolgát"** —
innen mozdul föl és le. A bemenetek:

> A **forma-rendszer** a 3.7.28-cal külön lépcsőként megérkezett, és
> szándékosan NEM tétel ebben a listában: a forma a mérkőzés
> TELJESÍTMÉNYÉT szorozza (`buildMatchSnapshot`), tehát az értékelésbe a
> gólokon, gólpasszokon és a keretbeli helyezésen keresztül épül be. Egy
> külön tétel dupla könyvelés volna. Lásd `docs/forma-rendszer.md`.


| tétel | súly | miből |
|---|--:|---|
| **rating a kereten belül** | ±0,9 | a saját kijelzett Ratingje a mai tizenegy átlagához mérve |
| **a csapat éle** | ±0,5 | a keret átlaga az ellenfél erejéhez mérve |
| **fejlődési szakasz** | ±0,4 | az életkor-görbe éves meredeksége (`ratingAtAge`) — a TSI a csúcson (`peak`) keresztül szól bele |
| **taktikához illő attribútumok** | ±0,6 | a saját tengelyei a taktika súlyprofiljához, a lapos 1/5-höz mérve |
| **csapatstílushoz illő attribútumok** | ±0,4 | ugyanez a filozófiád tengelyeivel (`MSTAT_STYLE_W`) |
| **eredményesség** | — | gól (poszt szerint 1,0–2,6), gólpassz 0,7, tiszta lap 0,5–0,8, védés 0,22/db (max 1,4), labdaszerzés 0,10/db (max 0,7), kapott gól a kapusnál −0,25/db az első fölött, meccs embere +0,5 |
| **csapat eredménye** | ±0,25 | tizenegyen nyernek, tizenegyen veszítenek |
| **piros lap** | −2,5 | a legsúlyosabb egyéni tétel |
| **játszott percek** | súly | nem tétel — és **15 perc alatt egyáltalán nincs értékelés**; lásd lent |

### A rövid beállás (3.7.33)

**Bejelentett hiba:** *„a rövid időt játszó játékosok nagyon rossz értékelést
kapnak mindenképp."*

**Miért történt.** A tételek két csoportra oszlanak: az egyik azt méri, **ki** a
játékos és hogyan illik a rendszerbe (rating a kereten belül, poszt-illeszkedés,
taktika, filozófia, a csapat eredménye), a másik azt, **mit csinált**
(eredményesség). Az első csoport a percektől **függetlenül** hatott, a második
viszont a játékidő arányában — `output *= share`. Egy cserejátékos tehát a
teljes strukturális mínuszt megkapta (a padról beálló ember jellemzően gyengébb
a kezdő tizenegy átlagánál: −0,9-ig), a jóváírás oldalán viszont szinte semmit
nem tudott visszaszerezni: **húsz perc alatt szerzett gólja 1,2 helyett 0,27-et
ért.**

**A javítás két lépcsős.**

**1. Tizenöt perc alatt nincs értékelés.** Nem rossz értékelés, hanem
*semmilyen*: a táblázatban `—` áll, és a mérkőzés a forma mércéjébe sem számít
bele. Öt perc nem elég egy ítélethez — se jóhoz, se rosszhoz. Az értékelés
nélküli sorok a lista **végére** kerülnek (a rendezésnek nincs mihez nyúlnia), és
a *három legjobb* közé nem kerülhetnek be.

**2. A küszöb fölött a percek súlya kisebb.** A két percfüggő szorzó padlót kap,
és a súly a **küszöbtől** számít, nem nulláról:

```
w = (percek − 15) / (90 − 15)              w ∈ [0,1]
eredményesség           ×= 0,70 + 0,30·w   (MSTAT_OUT_FLOOR)
az alaptól való eltérés ×= 0,75 + 0,25·w   (MSTAT_PULL_FLOOR)
```

**90 percnél mindkét szorzó pontosan 1,0** — a kezdők értékelése tehát betűre
változatlan. Ez szándékos: a bejelentés a cserékről szólt, és egy ilyen
javításnak nem szabad mellékesen átírnia a kezdő tizenegy értékelését.

#### Mérve

84-es keret, 80-as ellenfél, ugyanaz az ember, ugyanaz a mérkőzés:

| eset | régi | új |
|---|--:|--:|
| kezdő 90', semmi | 4,0 | **4,0** |
| kezdő 90', 1 gól | 5,0 | **5,0** |
| kezdő 90', 2 gól | 6,0 | **6,0** |
| kezdő 90', vereség | 3,5 | **3,5** |
| csere 20', semmi | 4,0 | **4,0** |
| csere 20', **1 gól** | 4,0 | **4,5** |
| csere 20', **2 gól** | 4,0 | **5,0** |
| csere 20', **gól + gólpassz** | 4,0 | **5,0** |
| csere 10', 1 gól | 4,0 | **—** (nincs értékelés) |
| gyenge csere 20', vereség | 3,0 | **3,0** |

És a lényeg egy sorban — a padról beálló, posztidegen, gyengébb ember egy
vereségben:

| | 20 perc | 90 perc |
|---|--:|--:|
| régi | 3,0 | 3,0 |
| új | **3,0** | **3,0** |

…vagyis a **percek már semmit nem vesznek el**: ami marad, az tisztán az, hogy
gyengébb a keret átlagánál, rossz poszton játszott, és a csapat kikapott —
pontosan ugyanaz, amit egy kezdőként is kapna.

### A forma mércéje csak az értékelt meccseket látja

A 15 percnél rövidebb beállás bekerül a meccs-történetbe (a percek, a gólok és a
gólpasszok a történet részei), de **`st` nélkül** — a forma alapvonala
(`pformBaseline`) és a periódus-átlaga (`pformRecent`) csak az értékelt
mérkőzéseket számolja (`pstatRatedOf`). Így egy tíz perces csere se jó, se rossz
formajelet nem hordoz. Régebbi mentésekben minden bejegyzésnek van `st`-je,
tehát a szűrő ott mindent átenged: a viselkedés visszamenőleg változatlan.

### Miért kettéválik a Rating-tétel

Az első változat egyetlen tételben mérte a játékost a mai ellenfélhez — és a
mérőn azonnal látszott a hiba: egy 88-as keret egy 78-as mezőny ellen
**tizenegy azonos, +1,0-s ráadást** kapott. A tétel tehát nem a játékosról
szólt, hanem az ellenfélről, és a tizenegy értékelése összecsúszott (4,5–6,5
egy sávban). Kettéválasztva a nagyobbik rész a **kereten belüli helyezés** (ki
a legjobb ember a pályán, ki a leggyengébb láncszem — ez adja a valódi
szórást), a kisebbik a csapat és az ellenfél szintkülönbsége.

Mérve, ugyanazon a kereten, négy mérkőzésen: a szórás **3,5–7,0** lett a
korábbi 4,5–6,5 helyett.

### Miért a lapos súlyhoz mérünk

A `mstatProfileFit` a csapat-szintű `tacticFitParts` mintájára pontoz: a
tengely-súly helyett a **lapos 1/5-höz mért többletsúly** szoroz. Mivel
Σ(w−1/5)=0, a játékos saját átlaga kiesik — a pontszám tisztán arról szól,
hogy a **rendszer arra épít-e, amiben ő jó**, nem arról, hogy jó-e általában
(azt a Rating-tétel méri). Ugyanaz az érv, mint ott, ugyanazzal a
levezetéssel.

### A „Sztárom a párom" nem tengely

A `MSTAT_STYLE_W` a hét filozófia tengely-súlyait tartalmazza, ugyanabban az
alakban, mint a `TACTICS` `attrProfile`-jai. A `sztar` szándékosan `null`: az a
filozófia nem egy tengelyre épül, hanem egy **emberre** — ott a kijelölt sztár
(`S.style.star`) kapja a ráadást.

### Az egyénileg kisorsolt statok

A **labdaszerzések** csapatszinten születnek, majd a kereten oszlanak szét:
súlyozva a Védekezés-attribútummal, a poszttal (hátul több, elöl kevesebb) és
a **játékidővel**. A maradék az utolsó emberhez kerül, tehát az egyéni számok
összege **pontosan** a csapat száma. A **védés** a kapusé — egy mezőnyjátékos
„védése" nem ugyanaz a fogalom.

## Az ablak

A lefújás után nyílik ki, és a bezárása viszi tovább a folyamatot.

**A lánc VÉGÉN áll, nem a lefújás pillanatában.** A jutalom-skill, a
felfedezés és az akadémia SAJÁT KÉPERNYŐT nyit — egy ablak azok fölött csak
elfedné őket. A sorrend így az, ami a mérkőzés után természetes: előbb a
jutalmak, végül a mérleg.

**Auto-módban nem nyílik ki** (a szezon végigjátszása nem állhat meg), de a
táblázat akkor is elkészül és mentődik. A meccsképernyő **📊 A meccs
statisztikája** gombja bármikor visszanyitja — ez a gomb csak akkor látszik, ha
van mit mutatni.

**A z-indexe 465**, nem a modálisok szokásos 60-as sávja: ez az ablak *kapuzza*
a folyamatot, tehát a vezetés alsó buborékai (440/445/450) nem takarhatják el
az OK gombot. Ugyanaz az érv, amiért a megerősítő kérdés 470-en ül.

A **három legjobb** kiemelten látszik; a `▼ A teljes keret értékelése` gomb
nyitja ki a többit. **Csak a saját keretünk** — az ellenfél egyéni
teljesítménye nem a mi tudásunk.

**A tettek sora szöveggel megy**, nem tömörített emoji+szám párral. Az első
változat `⚽2 · 🛡3` alakot írt, és a mérőn látszott a baj: a pajzs és a kesztyű
emoji készülékenként más glifára esik vissza, a mellé tapadó szám pedig
összeolvad velük.

## Tesztelés

Playwright-tal, valódi mérkőzéseken (Real Madrid 2011/12 kerettel):

- **konzisztencia minden meccsen**: kapura lövés ≥ gól mindkét oldalon; az
  ellenfél védései = a mi lövéseink − a mi góljaink; a mi védéseink = az ő
  lövéseik − az ő góljaik; a birtoklás két oszlopa 100; az egyéni
  labdaszerzések összege = a csapat száma;
- **nagyságrendek** négy mérkőzésen: birtoklás 58–66%, passz 499–586 / 307–373,
  pontosság 78,5–79,8 / 74,0–76,1, kapura lövés 4–13, labdaszerzés 16–19 / 21–25;
- **értékelések**: mind 0,5 lépésben, mind 0 és 7 között, a szórás 3,5–7,0;
- **auto mód**: hat forduló megállás nélkül lefutott, az ablak nem nyílt ki, a
  táblázat elkészült, és a 📊 gomb utólag megnyitja;
- **újratöltés**: a mentésből ugyanaz a táblázat és ugyanazok az értékelések
  jönnek vissza, a gombról megnyitva;
- **a bezárás után a folyamat nem akad el**: a Kezdőrúgás gomb újra él.

`tools/check.sh` zöld.

## A négy befolyás (3.7.27)

Az első lépcső a statokat a mérkőzés **számaiból** vezette le (λ,
erőkülönbség, tengelyek). Ez helyes volt, de hiányos: a játékban négy olyan
rendszer él, ami a pályán mindent eldönt, a statisztikán mégsem látszott.

| befolyás | honnan |
|---|---|
| **csapatstílus** | `MSTAT_STYLE_CH` — a hét filozófia a birtoklás/passz/támadás/védés csatornákon |
| **képességek** | a motor saját HATÁSTÍPUSAI: `assistw` → passz, `goalw` → támadás, `defense` → védés |
| **szezon-szerepek** | `MSTAT_ROLE_CH` — a tizenöt megbízatás ugyanezeken a csatornákon, a szerep-képesség szintjével nőve |
| **poszt- és megbízás-illeszkedés** | `attrPosFit` személyenként, és a tizenegy súlyozott átlaga (`MSTAT_FIT_ANCHOR` = 0,85 a semleges pont) |

**Egy helyről, mind a kettőre.** A négy hatás egyszerre kell a csapat-statokhoz
(egy passzos keret többet birtokol) és az egyéni értékeléshez (a Sebészi passz
birtokosa más meccset játszik). Ha két helyen számolnánk, a kettő előbb-utóbb
szétcsúszna — ezért **egy** függvény adja mindkettőt (`mstatMods`), és a
visszatérő objektum viszi a csapat-szintű összegeket ÉS a személyenkénti
bontást.

**Nem skill-azonosítókra hivatkozunk, hanem hatástípusokra.** Így minden új
képesség magától bekerül, és a statisztika sosem csúszhat el a valódi
mechanikától. A `defense` szorzó (1 alatti = jó), ezért ott a jel az `1−mult`.

**A semleges alap 0.** Egy képesség és szerep nélküli, poszthű tizenegy
mindhárom csatornán nullát ad — a mai balance tehát betűre változatlan marad, a
hatás csak ott jelenik meg, ahol tényleg van mire hivatkozni.

### A skillek KÉT úton érkeznek — és ez szándékos

A `SKILL_AXIS` már eddig is a csapat-tengelyekbe vezette a képességeket
(`defense`→ved, `assistw`→passz, `goalw`→gól), a tengelyek pedig a
`mstatAxisZ`-n át a statokba. Az új csatorna **ezen felül** hat. A kettő nem
duplázás, mert mást mér: a tengely a keret **egyensúlyát** (mennyire passzos
csapat ez a többihez képest), a csatorna a mérkőzést alakító képességek
**sűrűségét**. Ezért látszik a mérőn az is, hogy hat védő-képesség **rontja** a
passzpontosságot: a védekezésre szakosodott keret relatíve kevesebbet passzol.

### Az egyéni értékelés három új tétele

* **képességek** (0 … +0,5) — **csak a szituatív csatornák**. A `rating` típusú
  skillek (Szitálós, Aranycipő) már az 1. tételben benne vannak a
  `pOvrDisplay`-en keresztül; itt újra beszámítani dupla könyvelés volna.
* **szezon-szerep** (0 … +0,3) — a megbízatás felelősség, amit a pályán vitt.
* **poszt-illeszkedés** (−0,5 … +0,15) és **megbízás** (±0,15) — az elsődleges
  posztján játszó ember természetesen mozog, a posztidegen végig kapkod. A
  `brief` külön azt méri, hogy a **megbízás** (a felállás alapkódjának
  felülírása) épp neki kedvez-e: a `defPos` a formáció alapértelmezett kódja
  azon a helyen, a `pos` a ténylegesen érvényes — a kettő különbsége maga a
  megbízás.

### A hatások ki is vannak írva

Nem elég, hogy a számok mögött ott a négy rendszer — **látni is kell**,
különben a felhasználó csak annyit tapasztal, hogy „valamiért többet
birtokoltunk". Az ablakban egy sáv sorolja fel a filozófiát, a pályán lévő
szerepeket és az összesített poszt-illeszkedést:

```
🌀 Tiki-Taka · 🧭 Stabil kezdés · 👁️ Lát a pályán · ✨ Aurafarmer · poszt-illeszkedés 75%
```

### Mérve — A/B, ugyanazon a kereten és ugyanazzal a seeddel

Alap (nincs stílus, képesség, szerep; poszthű keret): birtoklás **50%** ·
passz **440** · pontosság **77,4%** · labdaszerzés **23** · illeszkedés **89%**.

| befolyás | birtoklás | passz | pontosság | szerzés | λ-szorzók |
|---|--:|--:|--:|--:|--|
| 🌀 Tiki-Taka | **+8** | +68 | +1,7 | −2 | — |
| 🧱 Beton védelem | **−6** | −52 | −0,3 | **+3** | — |
| ⚽ Bombázók | −2 | −18 | 0 | 0 | **kAtk 1,10** |
| 6× Sebészi passz | **+7** | +60 | **+8,5** | −3 | — |
| 6× Betonfal | −2 | −18 | −2,9 | **+4** | kGk 1,11 |
| 5× Gólzsák | −2 | −18 | −2,9 | −2 | **kAtk 1,13** |
| kapus K9 - Kutyareflex | −1 | −9 | −0,7 | +1 | **kGk 1,11** |
| Tiki-Taka + 3 szerep | **+9** | +77 | +3,5 | −3 | — |
| négy ember idegen poszton | −2 | −18 | −1,4 | −2 | illeszkedés **89% → 60%** |

A **kapura lövés és a védés** oszlopa egyetlen mérkőzésen nem mozdul, mert a
Poisson egész számot ad — a hatás a **λ-szorzókban** (`kAtk`, `kGk`) látszik, és
sok mérkőzésen ezek mozgatják a két oszlopot. A két szorzó a mentett
objektumban is ott van, hogy mérhető és visszakereshető legyen.

Egy teljes, valódi mérkőzésen mind a négy befolyással együtt: birtoklás **63%**,
passz **545/308**, pontosság **83,6/75,4%**, és a magyarázó sáv kiírta
mindhárom forrást. A konzisztencia-állítások (lövés ≥ gól, a védés-oszlopok
egymásból, a birtoklás 100, az egyéni labdaszerzések összege = a csapat száma)
mind teljesültek.

### Egy megkeményítés, amit a mérés hozott

A teszt először hibás alakú skill-példányt gyártott
(`{stage,need}` a valódi `{stagesNeeded,stagesCompleted}` helyett), és a motor
effektus-számolói **NaN**-t adtak vissza. Egy NaN innen továbbterjedne a
labdabirtoklásba, a passzpontosságba és minden értékelésbe. A csatornák ezért
egy explicit `mstatFin` szűrőn mennek át: **a statisztika sosem mondhat
„NaN%"-ot**, akkor sem, ha egy régi mentés vagy egy félbemaradt fázis-könyvelés
sérült példányt hagyott hátra.

## Ami a következő lépcsőkre marad

* a **forma-rendszer** (a felhasználó külön kérte, hogy ez most maradjon ki) —
  ha megvan, egy új tétel lesz a `mstatRate` bontásában, semmi mást nem kell
  hozzányúlni;
* a meccsenkénti statok **halmozása** szezon- és karrier-szintre;
* az ellenfél egyéni statjai (ma szándékosan nincsenek).
