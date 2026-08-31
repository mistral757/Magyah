# Két csapaterő, egy meccs — és a 6-1

*(3.3.38. Érintett kód: `teamStrength` / `teamOVRbase` / `buildMatchSnapshot` /
`matchLambdas` / `h2hSimulate`, `h2hWireSnapshot`.
3.7.42 — az AKTUÁLIS csapaterő: `MATCH_XI`, `liveXI`, `teamStrengthNow`,
`teamStrengthNote`, `updateStrengthBar`, a `#teamOVRNote` és a bekötések a
`playMatch` kezdőrúgás-, vödör- és lefújás-pontjain. Lásd a 7. szakaszt.
3.8.23 — a meccs-erő a sávon: `#strengthWrap`, `#teamMatchWrap`,
`#teamMatchOVR`, `#teamMatchDelta`, `hiddenMatchBonus`, `GLOSSARY.meccsero`.
Lásd a 8. szakaszt.)*

Ez a dokumentum egy konkrét bejelentésre született: **„magasabb nyers erővel
kaptam ki 6-1-re otthon a párharcon."** A vizsgálat három dolgot talált —
kettőt hibát, egyet a modell természetéből.

## 1. Három szám, nem egy

A „csapaterő" a kódban **három különböző mennyiséget** jelent, és a három nem
összemérhető:

| szám | mi van benne | hol látszik |
|---|---|---|
| `teamOVRbase()` | `játékos.ovr × illeszkedés` — a **nyers csontváz** | büdzsé, generálás, „nagy skalp" könyvelés |
| `teamStrength()` | `posEffectiveRating(poszt) + skill-rating-bónuszok` — **a motor képlete** | a felállásképernyő `#teamOVR`-je, a HUB, a kupa |
| `MS.ovr` (`buildMatchSnapshot`) | a fenti **plusz** morál, kapitány, edzők, aura, csapategyensúly, stílus-bónusz, lendület, forma-dobás | **3.8.23 óta a fejlécsávon is** (⚡ meccs-erő), a piramis-panelen, és belül a szimuláció |

A különbség nem kozmetikai. `teamOVRbase()` a **posztra illeszkedést** egyetlen
durva szorzóval intézi (1 vagy 0,93), miközben a motor az
`posEffectiveRating`-gel dolgozik, ami az **attribútumokból** számol, és a
poszt-ismeret hiányáért akár **−12 Rating** büntetést is ad. Egy rossz poszton
játszó emberen a két szám 10 fölött is eltérhet — ugyanarra a játékosra.

A `MS.ovr` pedig ezen felül visz még egy csomó rejtett tagot: a morál egymaga
**±2,5**, a forma-dobás **±3** (a szerencsés/pechesnek sorsolt emberen), a
csapatforma-malus **−2,2**. Ezek egyike sem látszik semmilyen kijelzett számban.

## 2. Az első hiba: alma a körtéhez

A szezonindító MP-összefoglaló (`announceMpOpponent`) ezt írta ki a társadról:

```
• Kezdő nyers csapaterő: 83.4
```

— vagyis `teamOVRbase()`-t. A **te** csapaterőd viszont a felállásképernyőn és
mindenhol máshol `teamStrength()`. **A két szám két külön skála**, és mivel a
`teamStrength()` a skill-rating-bónuszokat is tartalmazza, a saját számod
rendszeresen magasabb — a társad tehát tartósan gyengébbnek látszott, mint
amilyen.

Ugyanez a hiba a párharc utáni „következő mérkőzés" dobozon is ott volt: a
párharc `fx.o.ovr`-je a nyers skálán állt, a mellette kiírt saját csapaterő meg
a teljesen máson.

**Javítva.** Az összefoglaló mostantól **mindkét számot** kiírja, mindkét
oldalról:

```
• Csapaterő: 87.1 (nyers 83.4)  • a tiéd: 86.2 (nyers 84.9)
```

A párharc pillanatképe pedig **két mezőt** visz: `dispOvr` (a nyers skála, mert
a „nagy skalp" könyvelés abban mér) és az új `shownOvr` (a `teamStrength()`
skálája, a kijelzéshez). A kettőt nem lehetett összevonni: két feladat, két
szám. A kijelzés a már meglévő `fx.o.dispOvr` úton megy, tehát új útvonal nem
kellett hozzá.

> Ez a hiba **nem** befolyásolta a mérkőzés kimenetelét: a szimuláció mindkét
> oldalról a `MS.ovr`-t használja, az pedig szimmetrikus. Csak azt döntötte el,
> hogy MIT hiszel a meccs előtt.

## 3. A második hiba: a stílus-szorzók átszivárogtak

A `matchLambdas` a csapatépítési stílus két gólszorzóját (`ownGoalMult`,
`oppGoalMult`) **globális függvényhívással** olvasta:

```js
let lf=lam(diff)*styleOwnGoalMult(), la=lam(-diff)*mine.defMult*styleOppGoalMult();
```

Ezek a `styleActiveFx()`-ből, vagyis a **helyi játékos** `S.style`-jából
dolgoznak. A CPU-meccsen ez rendben volt (egy oldal gazdag). A párharcban
viszont a szimuláció **mindkét oldalt egy gépen** számolja — tehát a számoló fél
szorzói a társa csapatára is ráültek, a társáéi pedig sehol nem érvényesültek.

Ráadásul a sim-et **bármelyik kliens** kiszámolhatja (`h2hTickRun`), így ugyanaz
a meccs más eredményt adott attól függően, ki ért oda előbb — pont azt a
determinizmust törve, amiért a seedelt véletlen egyáltalán van.

**Javítva.** A két szorzó a `defMult` mellé, a **pillanatképbe** került, és a
`matchLambdas` onnan olvassa. Régi kliens pillanatképében nincs meg a két mező —
ott a helyi függvényre esünk vissza, tehát a mai viselkedés marad.

A tét nem apró: a szorzók a stílus-fán **+15%** támadó- és **−14%** védekező
irányban is elmehetnek, és összeszorzódnak.

## 4. És a harmadik: a Poisson

A gólok `poisson(λ/18)`-cal esnek, tickenként. A λ-görbe:

```
λ = 1.3 · e^(0.09 · erőkülönbség)      [0.15 … 4.5 közé vágva]
```

| erőkülönbség | te lősz | te kapsz |
|---:|---:|---:|
| −6 | 0,76 | 2,23 |
| −3 | 0,99 | 1,70 |
| **0** | **1,30** | **1,30** |
| +3 | 1,70 | 0,99 |
| +6 | 2,23 | 0,76 |

Ebből a **6-1 vagy annál rosszabb** vereség valószínűsége:

| λ te / λ ő | esély | ez kb. |
|---|---:|---|
| 1,6 / 1,4 (te vagy erősebb) | 0,17% | minden 595. meccs |
| 1,5 / 1,5 (egyenlő) | 0,25% | minden 402. meccs |
| 1,3 / 1,8 | 0,65% | minden 154. meccs |
| 1,2 / 2,1 | 1,36% | minden 74. meccs |

**Tehát: egy 6-1 azonos erőnél is bekövetkezik, nagyjából négyszáz meccsenként
egyszer.** Egy hosszú karrierben ez nem kirívó esemény, hanem esedékes. A modell
szándékosan ilyen: egy determinisztikus motorban a jobb csapat mindig nyerne, és
a foci nem így működik.

Amit viszont **nem** szabad, hogy megtörténjen: hogy azt hidd, erősebb voltál,
amikor nem. Ezt javította a 2. és a 3. pont.

## 5. „És ha a 3-4-3 gyengít?" — mérve

A 3.3.20 óta a felállás ALAKJA is tengely-erő (`formShapeAxisShift`): a 4-4-2-höz
mérve a 3-4-3 **−1,3 Védekezés / +0,1 Passz / +1,3 Gólszerzés** eltolást ad. Ez a
legtámadóbb alak a 4-2-4 után — jogos a gyanú, hogy ez „gyengít".

**Nem gyengít.** Ugyanazzal a kerettel végigmérve, az alak hatása a taktika
illeszkedésére −10 … +9 százalékpont, ami a mérkőzésen:

| rendszer | 4-4-2 fit | 3-4-3 fit | különbség | **meccs-hatás** |
|---|---:|---:|---:|---:|
| Gyors kontra | 54% | 44% | −10pp | **−0,09** |
| Labdatartás | 40% | 49% | +9pp | **+0,08** |
| Park the bus | 56% | 48% | −8pp | **−0,07** |
| Széljáték | 49% | 40% | −9pp | **−0,08** |

Tized-Ratingek. A λ-n ez ×0,995 — a harmadik tizedesben látszik.

### Ami viszont tényleg számít

Mindent OVR-ekvivalensre váltva (mert a λ-ban végül úgyis az áll):

| csatorna | OVR | λ-arány |
|---|---:|---:|
| **Morál** (100 → 0) | −5,00 | ×0,64 |
| **Taktika-szint** (95 → 60) | −4,06 | ×0,69 |
| **Megbízások** — teljesen szétnyitott alak (+29%) | −2,83 | ×0,78 |
| **Piros lap** | −2,50 | ×0,80 |
| Hazai pálya (a párharcban is) | +1,60 | ×1,16 |
| Megbízás: két embert kiküldesz középről (+13%) | −1,36 | ×0,89 |
| Forma-dobás (a pechesnek sorsolt ember) | −0,27 | ×0,98 |
| **A felállás alakja (3-4-3 vs 4-4-2)** | **−0,05** | **×0,995** |

Vagyis a felállás alakja a lista **legkisebb** tétele — harmincad annyi, mint a
begyakorlatlan taktika.

**A 3-4-3 mégis drágább lehet, de nem az alakja miatt:** négy középpályás
szerep-helye van (a 4-4-2-nek kettő), tehát ez az alak *csábít* a szélre
küldésre. Kettő kiküldött középpályás már −1,36, védőkkel együtt −2,83 — és
**ez** a szám az, ami egy 6-1-hez hozzá tud tenni.

### Honnan tudja meg a játékos?

A felállás-választóban a „📊 Mit ad maga az alak?" tábla eddig
attribútumpontban beszélt (−1,3 / +0,1 / +1,3). Pontos, de nem válasz arra,
hogy *mekkora árat fizetek*. Két oszlop került mellé:

* **illeszk.** — mennyi lenne az illeszkedésed ezzel az alakkal, a TE aktív
  rendszereddel és annak a szintjével;
* **az alak ára** — az előbbi hány Rating-pontnyit érne a mérkőzésen, a
  mostanihoz képest.

A tábla **változatlan névsorral** mér, és ezt ki is mondja: a váltás a kezdő 11
összetételét is átrendezi, ami mérve **4-7 százalékpontot** visz a fiten —
nagyobbat, mint maga az alak, csak az már nem a felállás ára, hanem a kereté.
A panel a nagyságrendet is kiírja, hogy senki ne a felállást hibáztassa egy
begyakorlatlan taktika helyett.

## 7. Az AKTUÁLIS csapaterő — a pályán lévő tizenegy (3.7.42)

**A bejelentés:** *„az aktuális csapaterő folyamatosan frissüljön meccs közben
is + meccs elején számítsa bele a kiállítás vagy sérülés miatt behozott
cserejátékost, és úgy mutassa az aktuális csapaterőt."*

### Mi volt a baj

A `teamStrength()` a **felállást** méri: a `slots` tizenegyét. Ez a
felállás-nézeten és a gazdaságban a helyes szám — a pályára viszont nem mindig
az a tizenegy lép ki:

* **Meccs előtt** az eltiltott/sérült kezdőt a hiányzó-panel **pótolja**
  (`S.subs[idx]`). A motor ezt már tudta — a `buildMatchSnapshot` innen építi az
  `active` tömböt —, a **kijelzett szám** viszont továbbra is a hiányzó emberrel
  számolt: a csapaterő azt mutatta, amivel **nem** játszol.
* **Meccs közben** cserélsz, kiállítanak valakit, beáll a buszsofőr — a szám
  viszont a kezdőrúgáskori állapoton ragadt.

### Egy forrás, három állapot

A `liveXI()` mondja meg, ki van **most** a pályán:

| állapot | forrás |
|---|---|
| fut a mérkőzés | a motor saját `active` tömbje (`MATCH_XI`) |
| meccs előtt, kényszerű cserével | `slots` + `S.subs` |
| egyébként | `slots` |

A futó mérkőzés **nem másolatot ad át**, hanem egy függvényt a saját
állapotára — így a kijelző nem tud elavulni: a félidei és a tervezett cserék, a
buszsofőr és a kiállítás mind ugyanabban az `active` tömbben látszanak.

**A `teamStrength()` maga változatlan.** A büdzsé, a kupamezőny, a párharc
hangolása és a közös kupa nevezése mind belőle dolgozik — azoknak a **felállás**
ereje kell, nem az, hogy a 73. percben épp ki van a pályán.

### A kiállított ember nem eshet ki „ingyen" az átlagból

Ha egyszerűen kihagynánk, a **leggyengébb** ember kiállítása **megemelné** a
csapaterőt — ami nyilván hazugság. A hiányzó helyéért ezért a motor saját
emberhátrány-tételét vonjuk le (`SIM.REDMATCH` = 2,5), pontosan úgy, ahogy a
párharc pillanatképe is teszi (`H.ovr − SIM.REDMATCH`).

**A buszsofőr kimarad az átlagból:** ő nem személy, nincs Ratingje, és a
csapaterőt a motorban sem mozdítja — a busz ára a gólesélyben van, nem itt.

### Mit ír a szám mellé

A jelölés (`teamStrengthNote`) megmondja, **miért** nem a felállás ereje
látszik: `10 emberrel` · `1 kényszercserével` · `busszal`. Ha a pályán pontosan
a betervezett tizenegy van, a jelölés üres.

### Mikor frissül

* **a hiányzó-réteg felépülése után** (`buildMatchSubs`), tehát még a
  kezdőrúgás előtt;
* **minden öt perces vödör végén** — ott már minden gól, csere és lap könyvelve
  van. **Auto módban kimarad:** ott a mérkőzés 18 ms-os ütemben pereg, és senki
  nem nézi a sávot;
* **a csereszünet bezárásakor**, hogy a csere azonnal látszódjon, ne csak a
  következő vödörnél;
* **lefújáskor**, amikor az élő tizenegy elengedi a kijelzőt.

Külön, olcsó frissítő (`updateStrengthBar`) csinálja, nem a teljes
`updateBar()`: a taktika-sáv, az oldalváltó és a pályakép-szinkron ehhez sok
volna tizennyolcszor egy meccsen — és nem is változik közben semmi belőlük.

### Mérés

Tizenegy 80-as játékos (a bal hátvéd 60-as), `SIM.REDMATCH` = 2,5:

| lépés | aktuális erő | felállás | jelölés |
|---|--:|--:|---|
| alap | 78,18 | 78,18 | — |
| kényszercsere (60 → 90) | **80,91** | 78,18 | 1 kényszercserével |
| kezdőrúgás (élő XI) | 78,18 | 78,18 | — |
| csere közben (60 → 95) | **81,36** | 78,18 | — |
| kiállítás | **79,00** | 78,18 | 10 emberrel |
| + buszsofőr | 79,17 | 78,18 | 10 emberrel · busszal |
| lefújás után | 78,18 | 78,18 | — |

A kiállításnál a szám **esik** (81,36 → 79,00), pedig egy átlagos képességű
ember ment le: a 2,5-ös emberhátrány-tétel pontosan ezt biztosítja.

### Ami kimarad, és miért

**Fekvő (stadion) módban a sáv nem látszik** — a `body.stadium>section:not(#scSim)`
szabály az egész pályakép-szekciót elrejti, hogy a mérkőzés teljes képernyőt
kapjon. Az eredményjelzőnek sorozatonként külön hangolt színsémái vannak
(`#sbBoard.comp-*`), ezért oda most nem tettünk új elemet.

**A meccsnapi véletlen kimarad a számból.** A ±`SIM.FORM` (a napi csúcsformájú
és a labdát nem érző ember) és a `pformMult` a szimulációban ott van, a
kijelzőn nem — ugyanaz a döntés, ami a `teamStrength()`-nél is áll: a sáv a
csapat **tartós** erejét mutatja, nem a mai kockadobást.

---

## 6. Mit nézz meg legközelebb

1. **A két számot ugyanabban a skálában** — a szezonindító sor mostantól
   mindkettőt kiírja, mindkét oldalról.
2. **A morált.** ±2,5 Rating-nyi, és sehol nem része a „csapaterőnek".
3. **A poszt-illeszkedést.** Egy nem ismert poszton álló ember a motor szemében
   −12-t is érhet, miközben a nyers szám csak −7%-ot mutat.
4. **A taktika-illeszkedést.** A `tacticEffect` a λ-ban ül, nem a csapaterőben:
   −? … +2,7 Rating-ekvivalens, és a fejlécen csak a SZINT látszik, az
   illeszkedés nem.

---

## 8. A meccs-erő a fejlécsávon (3.8.23)

**BEJELENTETT KÉRÉS:** *„A meccs erő jelenleg csak itt van kijelezve szerintem,
pedig egy elég fontos stat. szerintem ott lehetne közvetlenül a nyers csapaterő
mellett mindig, és kéne magyarázat, hogy melyik mit jelent a konkrét meccsek
szimulációjában (persze az nem kell mindenhol ott legyen, csak egy látható
helyen)."*

Igaz volt: a meccs-erő eddig **egyetlen helyen** látszott, a piramis-panel
szintsorában — pont ott, ahová a játékos ritkán néz, és pont akkor nem, amikor
a keretet állítja össze. A szimuláció viszont **kizárólag** ezt a számot
használja; a fejlécen kiírt csapaterő csak az alapja.

### Mi látszik

A `#teamBar` mostantól két számot visz egymás mellett:

```
Csapaterő: 112,0 · ⚡ meccs-erő 115,7 (+3,7)
```

* a **bal** szám a régi `teamStrengthNow()` — a pályán lévő tizenegy értéke, a
  `#teamOVRNote` jelöléseivel együtt (`10 emberrel`, `1 kényszercserével`);
* a **jobb** szám ugyanannak a tizenegynek a **meccs-ereje**:
  `teamStrengthNow() + hiddenMatchBonus()`. Szándékosan nem a
  `teamMatchStrength()` (a *betervezett* XI), hogy a sáv két száma mindig
  ugyanarról a tizenegyről szóljon — meccs közben, kiállítás után is. (A
  rejtett tag java része nem is a tizenegytől függ: morál, edző, taktika,
  összhang, lendület. Az aura- és védekező skillek a betervezett kerettel
  számolnak — meccs közben tized-nagyságrendű eltérés, cserébe a szám pontosan
  az, amit a szimuláció és a nehézség-tanácsadó is lát.);
* zárójelben a **különbség**, előjeles színnel (zöld / piros). Ez maga a
  „menedzsment-hozzáadott érték": morál, edző, kapitány, aura, taktika,
  összhang, lendület.

**Mikor bújik el:** ha `|hiddenMatchBonus()| < 0,05`, a blokk eltűnik — klasszik
módban a rejtett tagok mind nullák, ott a második szám csak zaj volna. A
számokat eltakart állapotban (`revealNums=false`) sem írjuk ki.

**Telefonon** a `#teamBar` `flex-wrap:wrap` lett `2px 10px` réssel: ha a két
szám nem fér ki, tördel, nem tolja szét a fejlécet.

### A magyarázat

A sáv egésze (`#strengthWrap`) kattintható, a végén egy halvány **ⓘ**-vel;
a `GLOSSARY.meccsero` szócikket nyitja. Egy helyen van, ahogy a kérés kérte, de
onnan minden képernyőről elérhető (a glosszárium-modál 3.7-ben a `body` alá
került). A szócikk három dolgot mond el:

1. **mit tartalmaz a csapaterő** — poszt-illeszkedés, kártyaszintek,
   Rating-skillek, −2,5 emberhátrány; és hogy a **piac, a bérek és a büdzsé**
   ezt látja;
2. **mit tesz hozzá a meccs-erő** — morál, edző, kapitányrutin, aura-skillek,
   taktika a gyakorlottságával, összhang, lendület, kihívás- és
   esemény-módosítók, a védekező skillek **fél súllyal** (mert azok csak a
   kapott gólok oldalán hatnak); és mi marad ki: a napi ±3-as forma-dobás, a
   haragok, a fegyelmi figyelmeztetés;
3. **mit csinál ezzel a szimuláció** —
   `diff = saját meccs-erő − ellenfélé + pálya (+1,2 / −0,4)`, a gólvárakozás
   `1,3 × e^(0,09 × diff)`, az ellenfélé a `−diff`-fel; azaz **pontonként
   ~+9% / −9%** gólvárakozás, padló 0,15, plafon 4,5, kiállítás −2,5.

Így a játékos a saját fejlécén látja, hogy a +3,7 nem dísz: az a
`e^(0,09·3,7) ≈ 1,40`-es szorzó a saját góljain, és `0,71` az ellenfélén.
