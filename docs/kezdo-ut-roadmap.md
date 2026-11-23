# 🧭 Kezdő út — a játék érthetővé tétele (roadmap)

**Állapot:** terv, kód nélkül. A fázisok külön-külön szállíthatók; a *Kész*
jelölés a tényleges beépítést jelenti. A 15. fejezet a tőled kért döntéseket
sorolja fel — ezek nélkül az első fázis nem indulhat.

---

## 0. A kérés

> „Itt az idő, hogy elkezdjünk dolgozni a játék érthetővé tételén, és azon, hogy
> mások is tudjanak vele játszani úgy, ahogy én mint fejlesztő tudok. […]
> Lépcsőzetessé tenni a karrier módot: fokozatosan kell bevezetni a játékost
> abba, hogy milyen funkciók vannak. […] A legtöbb játék úgy csinálja, hogy
> mindig ad kis célfeladatokat: lőj X gólt, nyerj X meccset, változtass a
> felálláson, találj új játékost egy helyre. […] A legelső karrier legelső
> szezonjánál mindenképpen, de lehet, hogy minden karriernél; aztán be lehetne
> állítani, hogy nem akarom, a kezdő pillanattól minden bekapcsolva. […] Nagyon
> letisztult felülettel kell találkozzon. Végigvezetjük a drafton […] a
> nehézségi szintből bármit lehessen választani — nem jó, hogy le vannak zárva
> —, csak legyen odaírva, attól függően, mennyire ismered a játékot, melyik
> szintet érdemes választani; a divízióknál is ajánljuk, hol kezdjen. […]
> Megmutatjuk, hogyan kell beállítani a felállást, a taktikát, a megbízásokat
> (középpálya, védők, csatárok), aztán nagyon egyszerű célok: rúgj egy gólt,
> legyen egy meccs kapott gól nélkül. Ha teljesít egyet-kettőt-hármat, kinyílik
> egy új lehetőség: edzésterv, összhangépítés; aztán hangsúly-csúszkák, edzői
> értékelés… Amikor kinyit valamit, képernyőképekkel megmutatjuk, mit kell
> csinálni. […] Az első átigazolási időszak: a pénz, miből van bevétel, mi
> viszi el, a stadion, mikor éri meg eladni, gyors eladás vagy piacra tétel,
> ifik, ifiakadémia […] Az első szezon végére majdnem minden kinyílik; aztán a
> csapatstílusok: melyik mit tud, mi illik a kerethez, a skillfa, a meccserő-
> növelők, a saját pont gyűjtése — nem megmondani, mire érdemes, hanem
> elmondani, mi mire való. […] A legfontosabb: a játék erőforrás-takarékosságra
> épül. Nem szabad elpazarolni az erőforrásokat, csak úgy vásárolgatni,
> boostolgatni. Meg kell tanítani, hogy megfelelő mértékben legyél erősebb az
> ellenfélnél, de ne túlságosan, mert akkor a mezőny utánad lép, és hirtelen
> elfogy az erőforrásod."

---

## 1. Kiindulás — ami MÁR megvan

A játékban sok tanító elem van, csak nincs mögöttük **sorrend** és **cél**.
Az új rendszer ezekre épül, nem melléjük.

| Meglévő rendszer | Mit tud | Hol él | Mi hiányzik belőle |
|---|---|---|---|
| **Fogalomtár** (`GLOSSARY`, 55 tétel) | minden fogalom egy helyen | `showGlossary(key)` | csak akkor ér valamit, ha a játékos tudja, mit keressen |
| **Tipp-buborékok** (`GUIDE_TIPS`, 33 db) | a döntés pillanatában szól, horgonnyal és kiemeléssel | `guideFire(id)` | reaktív: nem vezet sehova, nem ad célt |
| **Tanítóréteg** (`TEACH_TOPICS`, 31 téma, 4 mód: hard / guided / light / off) | 3 szint: tipp, többlépéses vezetés, halk jelzés; rangsor, szundi, „feladás” | `teach*` | csak arról szól, ami MÁR látszik; nem dönti el, mi látsszon |
| **Az edző mint idegenvezető** (3.9.307) | „Az edző szava” kártya a menü fölött: mi nyílt meg (`EK_NYILAS`), egy javaslat | `ek*` | csak kijelzi a nyílást, nem ő okozza |
| **Kalauz** (`KALAUZ`, 10 fejezet) | ÉLŐ képernyőképek (a valódi HUB-elem másolata), számozott jelölők, magyarázat | `KALAUZ`, `sz:` = melyik idényben nyílik | idényhez kötött, nem a játékos haladásához |
| **Lépcsők a csúcs felé** (3.9.46, `docs/lepcsok-roadmap.md`) | karrierek KÖZÖTT nyitja a beállításokat (D1-győzelmek, Run-szint, igazolások) | `unlock*`, `UNLOCK_PRESETS` | a nehézséget zárja (ezt most visszafordítjuk), és nem a karrieren BELÜLI funkciókról szól |
| **Nehézségi fokozatok** (10 fok × 5 belső szint) | kimenet-becslés fokonként (feljutás, cím, kiesés %) | `NF_LEVELS`, `nfFokZart`, `NF_LEPCSO_MAX` | a lépcsőn (az első karrierekben) csak az 1–4. fok választható, az 5.-től a 3. bajnoki cím után; szabad karrierben az 1–6. nyitva, a 7+ a megnyert karrierekkel nyílik; az ajánlás nem a tudásszintről szól |
| **Menedzsment** (1.0.4.14.00) | aktív kihívások, közeli mérföldkövek, igazgatósági elvárás | `hubMgmtBtn` | a kihívások vállalások (jutalom ÉS büntetés) — nem tanítanak |
| **Kihívások** | kezdő / szezon / évszak / sprint / kupa ajánlatok | `challenge*` | ugyanaz: kockázat, nem lecke |
| **Gyors indítás** (3 lap: Nehézség · Egyéb · Kezdés) | rövidített karrier-indítás | `quickShow`, `QK_LAPOK` | a 2. lap még mindig sok döntés egy kezdőnek |

**A legfontosabb felismerés:** a karrier HUB-jában ma **minden funkció az első
perctől látszik** (kb. 45 menüpont: taktika, edzésterv, összhangépítés,
boost-központ, talizmánok, ládák, stadion, scout, akadémia, stáb, szerepek,
csúszkák …). A tanítás mindent elmagyaráz — de egyszerre, és a játékos nem
tudja, mivel kezdje. **A hiányzó láncszem: karrieren BELÜL, célfeladatokkal
nyitni a funkciókat**, és minden nyitáshoz egy rövid, vezetett leckét adni.

---

## 2. Diagnózis — miért nehéz ma elkezdeni

1. **Az első kép zaj.** A beállító 3 lapon ~25 döntést kér; a HUB ~45 gombot mutat.
2. **A zár rossz tengelyen van.** A nehézség zárva (a lépcsőn az 5. foktól a 3. bajnoki címig, utána a 7. foktól a megnyert karrierekig), miközben a HUB-ban minden nyitva. A kérés pont fordítva: **a választás legyen szabad, a funkciók nyíljanak fokozatosan.**
3. **Nincs cél.** A tippek reagálnak, a kihívások kockázatot kínálnak — de semmi nem mondja: „most ezt próbáld ki, aztán jön a következő”.
4. **A legfontosabb szabályt senki nem mondja ki:** a játék **erőforrás-gazdálkodás**. A mezőny követ (célrés, „Lépést tartanak”), a büdzsé szezononként jön, a pazarlás megbosszulja magát. Ma ezt a játékos a saját kárán tanulja meg — vagy sehogy.
5. **Az időzített döntések elszaladnak.** Az edzésterv csak nyáron állítható. Egy kezdő, aki nem tudja, mi az, egy egész idényt veszít — a zár itt kár, nem védelem. *(Tervezési szabály: ami lezárva van, annak az edző ad értelmes alapállást, és a nyitáskor egyszer szabadon állítható — lásd 6.3.)*

---

## 3. Alapelvek

1. **Egy forrás, több nézet.** A kezdő út nem ír új tananyagot ott, ahol már van: a leckék a `KALAUZ` élő képeit, a `GLOSSARY` szövegeit és a `TEACH_TOPICS` lépéssorait használják. Új szöveg csak oda kell, ahol ma nincs.
2. **A választás szabad, a funkció fokozatos.** Nehézség, osztály, kezdés: mind nyitva, ajánlással. A HUB funkciói feladatokkal nyílnak.
3. **Semmi nem ragadhat be.** Minden feladatnak van időkorlátos tartaléka: ha a játékos egy szakaszban N fordulón át nem jut tovább, az edző magától kinyitja a következőt („Úgy látom, ideje továbblépni”). Rossz kerettel is végig kell érni az első idényen.
4. **A zár nem büntetés.** Ami lezárt funkció, az **alapállásban működik** (az edző állítja be), és a nyitáskor a játékos egyszer szabadon átállíthatja — akkor is, ha a szabály egyébként csak nyáron engedné.
5. **Minden nyitás = egy rövid lecke.** 2–4 lépés: élő kép a valódi elemről → „Mutasd” (kiemelés a valódi gombon) → „Csináld” (vár, amíg a játékos megteszi) → egy mondat arról, mit ért el vele.
6. **Elmondjuk, mi mire való — nem azt, mit válassz.** Különösen a csapatstílusoknál és a skillfánál: a lecke a funkciót és a következményt magyarázza; az ajánlás legfeljebb „ehhez a kerethez ez illik, mert…” formájú, mindig indoklással.
7. **A felnőtt játékos a játékosé.** Bármikor: „Mindent kinyitok most”, „Kihagyom a leckét”, „Leckék újra”. Új karriernél a beállítás egyetlen kérdés.
8. **Csak egyjátékos.** Közös karrierben (PvP) a kezdő út néma, mint a lépcsők (`unlockGatesOn`). A két játékosnak ugyanazt kell látnia.
9. **Mérhető.** Minden szakaszhoz próba, és egy „kezdő bot” végigjátszás, ami bizonyítja: az első idény végére minden nyitható, beragadás nélkül.
10. **Rövid.** Egy lecke legfeljebb 4 képernyő; egy leülésben legfeljebb 2 lecke (a `TEACH_STEPS_PER_ROUND` szellemében). A többi vár.

---

## 4. Az új rendszer áttekintése

```
 ┌────────────────────── A. BELÉPÉS ──────────────────────┐
 │ „Mennyire ismered a játékot?”  → Kezdő / Haladó / Profi│
 │ Nehézség: mind a 10 fok nyitva, ajánlással              │
 │ Osztály: ajánlott D3 (és miért)                         │
 │ Draft: vezetett, lépésenként                            │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌──────────────────── B. KEZDŐ ÚT ───────────────────────┐
 │ 9 SZAKASZ, mindegyikben 3–5 FELADAT                     │
 │ teljesítve → NYITÁS (1–3 funkció) → LECKE (élő képpel)   │
 │ lezárt funkció = az edző alapállása (nem kár)            │
 │ tartalék: N forduló után az edző magától továbblép        │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌──────────────────── C. TUDÁSTÁR ───────────────────────┐
 │ Kalauz (élő képek) · Fogalomtár · „Miért?” gombok        │
 │ — a kezdő út után is, bármikor elérhető                  │
 └─────────────────────────────────────────────────────────┘
```

**Profi mód** (a „Mennyire ismered?” kérdés harmadik válasza, vagy a
Beállításokban): minden nyitva az első perctől, a tippek halk jelzésre
váltanak — betűre a mai élmény.

---

## 5. A. Belépés — a letisztult első kép

### 5.1 Az első kérdés: „Mennyire ismered a játékot?”

A karrier-indítás **legelső** képernyője, három nagy kártyával:

| Válasz | Mit állít be | A kezdő út |
|---|---|---|
| 🌱 **Most kezdem** | ajánlott fokozat (lásd 5.2), D3, draft, minden egyéb beállítás az ajánlotton, rejtve | **BE**, teljes leckékkel |
| ⚽ **Játszottam már** | ajánlott fokozat egy fokkal feljebb, a beállítások láthatók | **BE**, rövid leckékkel (csak a „Mutasd”, „Csináld” nélkül), gyorsabb nyitás |
| 🏆 **Ismerem, mindent kérek** | semmit nem állít; minden nyitva | **KI** (Profi mód) |

Az első karrierben az alapértelmezett a „Most kezdem”. Ha a játékos már
végigvitt egy kezdő utat (karriereken átívelő jelző a feloldás-naplóban), a
következő karrierben az alapértelmezett a „Játszottam már”.

### 5.2 Nehézség: mind a 10 fok nyitva, tudásszint szerinti ajánlással

- A `nfFokZart` és a lépcső-zár (`NF_LEPCSO_MAX`) **megszűnik** a nehézségnél.
  - Ami a lépcsőkből marad (tempók, ikonok, stílusok, dinamikus mód), arról a 15. fejezetben döntesz.
- Minden fok kap egy **„kinek ajánlott”** sort a mostani kimenet-becslés (feljutás, cím, kiesés %) mellé.
  - 1–2. fok: „Most ismerkedsz a játékkal — itt megtanulhatod a rendszereket, kevés büntetéssel.”
  - 3–4. fok: „Ismered a focimenedzsereket, vagy már végigvittél egy idényt.” (A 4. ma is az ajánlott.)
  - 5–6. fok: „Érted a mezőny követését és a büdzsé beosztását.”
  - 7–8. fok: „Tudatosan tartod a rést, és tervezel a nyárra.”
  - 9–10. fok: „Kihívást keresel — itt minden döntés számít.”
- A „Mennyire ismered?” válasz előre kijelöli az ajánlott fokot, egy „Ajánlott neked” címkével. A játékos szabadon átválaszthat.
- **Biztonsági háló:** ha egy kezdő az 7+ fokot választja, egy mondatos megerősítés jön („Ez a fok a rendszerek ismeretére épít — biztos?”). Tiltás nincs.

### 5.3 Osztály: ajánlás magyarázattal

- A draft utáni osztályválasztón (`#scPyrDiv`) **D3 az ajánlott** (ez ma is így van, 9. feladat). Mellé jön: „Innen két feljutás a csúcs, a mezőny a draftolt keretedhez van mérve, egy rossz idény nem végzetes.”
- A többi osztály szabadon választható. Mindegyik kap egy sort: D1–D2 „rövid út a csúcsra, kemény mezőny, kevés hibalehetőség”; D4–D6 „hosszú út, sok idény a rendszerek megtanulására”.

### 5.4 A draft vezetése

A mai draft-tippek (`draft:first`, `draft:pot`, `draft:agefit`,
`draft:personality`, `draft:bench`, `draft:chem`) megmaradnak, de a „Most kezdem”
módban **lépéssorrá** válnak:

1. **Az első pörgetés:** kiemelés a pörgetésen → „Ez egy valós klub valós kerete. Válassz EGY játékost egy nyitott posztra.”
2. **Az első választás előtt:** kiemelés egy játékoskártyán → Rating, POT, kor, poszt-illeszkedés, egy-egy mondattal.
   - **„Az edző tippje” jelölő** a nyitott posztra legjobban illő jelöltön (csak „Most kezdem” módban, indoklással: „saját posztja, jó POT”). A választás a játékosé.
3. **Az újrapörgetés:** mikor éri meg, mennyi van.
4. **A cserepad** (mai `draft:bench`).
5. **A kémia** (mai `draft:chem`): egy élő kép a kémia-eredményről, számozott jelölőkkel.
6. **Edző, kapitány, első skill:** a mai lineáris folyam (`coach:pick`, `captain:pick`, `skill:first`), változatlanul.

### 5.5 A beállító képernyő egyszerűsítése

- „Most kezdem” módban a gyors indítás **2. lapja (Egyéb) rejtett**. Helyette egy összefoglaló áll: „Minden más az ajánlott értéken — később a Beállításokban állíthatod.”
- A 3 lap helyett 2: **Nehézség → Kezdés**.

---

## 6. B. A kezdő út — a gerinc

### 6.1 Fogalmak

| Fogalom | Jelentés |
|---|---|
| **Szakasz** | egy fejezet a kezdő úton (9 db). Van címe, rövid célja és egy edzői bevezető mondata. |
| **Feladat** | egy ellenőrizhető tett vagy eredmény („rúgj egy gólt”, „állíts be edzéstervet”). Egy szakaszban 3–5 van; a nyitáshoz **legalább K** kell (pl. 3-ból 2). |
| **Nyitás** | 1–3 HUB-funkció kinyitása, „🔓 Kinyílt” ablakkal. |
| **Lecke** | 2–4 lépéses vezetett bemutató a frissen nyílt funkcióról (élő kép → Mutasd → Csináld → összegzés). |
| **Tartalék** | ha a szakasz N fordulón belül nem teljesül, az edző magától nyit, és a feladatok „bónusz feladatként” maradnak. |

### 6.2 A felület

- **„🧭 Kezdő út” kártya** a HUB tetején, a meglévő „Az edző szava” kártya helyén vagy mellett (egy hang, egy hely):
  - a szakasz neve, a haladás (●●○), a 3–5 feladat pipával, mindegyik mellett „Hogyan?” (a lecke vagy a fogalomtár);
  - alul: „Következő nyitás: 🏋️ Edzésterv, 🤝 Összhangépítés”.
- **A menüben a lezárt funkció nem látszik.** Egyetlen szürke sor jelzi: „🔒 Még 6 funkció vár — a Kezdő út nyitja”. Ez a „letisztult felület”: a ☰ Menü az első idény elején 5–6 gombot mutat 45 helyett.
- **Nyitáskor** „🔓 Kinyílt!” ablak (a mai `unlockShow` formája): ikon, név, egy mondat, és „Mutasd meg” (indítja a leckét) vagy „Később”.
- **Meccs közben** a feladat teljesülése egy halk sor a közvetítésben („✅ Feladat teljesítve: kapott gól nélküli meccs”) — a meccset nem állítja meg.
- **A menedzsment panelen** (`hubMgmtBtn`) a kezdő út a kihívások fölött, saját szakaszként látszik.

### 6.3 Lezárt funkció = az edző alapállása

| Funkció | Amíg zárva | Nyitáskor |
|---|---|---|
| Edzésterv | az edző javasolt terve fut (a mai `trainEloreHtml` legjobb javaslata) | egyszer szabadon átállítható, idény közben is |
| Összhangépítés | az edző javaslata (a legnagyobb kémia-hiány) | ugyanígy |
| Hangsúly-csúszkák | mind 0 (ez ma is a semleges állapot: „minden szorzó 1”) | — |
| Csapatszerepek | automatikus kiosztás (a legjobb rúgók) | — |
| Kapitány | a draft végén választott | — |
| Félidei cserék | az automatikus csere | — |
| Talizmán-húzás | gyűlik a várakozó húzásokban, nem vész el | a húzások egyben előjönnek |
| Ládák | gyűlnek | ugyanígy |
| Boost-központ | nincs boost (a kedvezményes idényeket a nyitás is kitolja, hogy ne vesszen el) | — |
| Átigazolás | a téli / nyári ablak az első nyitásig az edző kezében: csak a szerződés-lejárat és a sérülés-pótlás fut | a teljes piac |
| Stadion, merch, scout-fejlesztés | nem fejlődik (ma sem fejlődik magától) | — |
| Akadémia | a visszaküldés automatikus „hagyd érni” | — |
| Csapatstílus | ma is csak a 2. idény elején választható → ugyanott nyílik, leckével | — |

**Ezt az 1. fázisban végig kell mérni** (0. fázis audit): melyik funkció
viselkedik rosszul, ha a játékos sosem nyúl hozzá (pl. az edzésterv „nincs
beállítva” állapota ma fejlődés nélküli — ezt kell az edző javaslatára cserélni).

### 6.4 A szakaszok — az első két idény menetrendje

A fordulószámok tájékoztatók; a „tartalék” a beragadás elleni határ.

#### 0. szakasz — „Az első tizenegy” *(az első idény előtti HUB)*
- **Edző:** „Mielőtt kifutunk: állítsuk össze a csapatot.”
- **Nyitva:** Felállás módosítása · Taktika · Megbízás (a játékoslapon) · Következő meccs.
- **Lecke:**
  1. *Felállás:* élő kép a pályarajzról → „Mutasd” a `hubFormationBtn`-en → „Csináld”: válassz alakzatot.
  2. *Taktika:* a 85-ös küszöb, az edző kedvelt rendszerei (a mai `coach:tactic` szöveg).
  3. *Megbízások:* a középpálya (védekező / klasszikus / támadó), a csatár (árnyékék), a védők (ha van) — kinek mi az ideális, a mai `mid:role` és `ev:shadow` szövegekből.
- **Feladatok (mind kell):** ✅ nézd meg a felállást (és ha akarod, válts) · ✅ válassz taktikát · ✅ adj megbízást egy középpályásnak.
- **Tartalék:** nincs (ez maga a belépő); a „Kihagyom” gomb elintézi mindhármat.

#### 1. szakasz — „Az első meccsek” *(1–5. forduló)*
- **Feladatok (3-ból 2):** ⚽ rúgj egy gólt · 🧤 egy meccs kapott gól nélkül · 🏆 nyerj meg egy meccset · 👀 nézd végig egy meccs közvetítését (vagy egy esemény-jelenetet).
- **Nyitás:** 🏋️ Edzésterv · 🤝 Összhangépítés.
- **Lecke:** mi a fő és a mellék edzéscél, mit lassít, mit ad az előrejelzés; mit épít az összhang (a kémia-csoportok).
- **Tartalék:** az 6. forduló után magától.

#### 2. szakasz — „Fejlődés” *(6–12. forduló)*
- **Feladatok (4-ből 3):** állíts be edzéstervet · állíts összhangépítést · nyerj két meccset zsinórban · cserélj le egy idegen poszton játszó embert (vagy tedd a saját posztjára).
- **Nyitás:** ⚡ Meccserő-bontás · 👔 Edző (szint + meccs előtti elemzés) · 🎚 Hangsúly-csúszkák.
- **Lecke:**
  - a meccserő és a csapaterő különbsége (a mai `meccsero` kalauz-fejezet);
  - mit lát az edző a meccsből (gólforrások, gyenge pontok);
  - a csúszkák: egyszerre legfeljebb 3, a hasznuk és a káruk.
- **Tartalék:** a 13. fordulóban.

#### 3. szakasz — „A csapat lelke” *(13–19. forduló)*
- **Feladatok (4-ből 3):** olvasd el az edző meccs előtti elemzését · állíts egy csúszkát · kerülj a tabella felső felébe · szerezz meg egy skillt (vagy fejlessz tovább egyet).
- **Nyitás:** 🎽 Csapatszerepek · 🔁 Kapitányváltás · 🔄 Cserék a meccs alatt · 🧩 Felállás- és csere-presetek.
- **Lecke:** a pontrúgók, a karszalag hatása a morálra, a félidei csere.
- **Tartalék:** a 20. fordulóban.

#### 4. szakasz — „Szerencse és kockázat” *(20–25. forduló)*
- **Feladatok (3-ból 2):** nyerj egy rangadót (vagy egy erősebb ellenfelet) · teljesíts egy meccscélt az igazgatóság megbízásából · 3 meccs vereség nélkül.
- **Nyitás:** 🧿 Talizmánok (a várakozó húzásokkal) · 🎁 Ládák · 🏁 Kihívások (az első ajánlat) · 📋 Menedzsment.
- **Lecke:** a talizmán (nem játékerő, hanem helyzeti képesség) · a láda · a kihívás mint VÁLLALÁS (jutalom ÉS büntetés, a mai `challenge:first` szöveg).
- **Tartalék:** a 26. fordulóban.

#### 5. szakasz — „A mérleg” *(26–30. forduló, az idény vége)*
- **Feladatok (3-ból 2):** nézd meg a klub gazdaságát (Infópult) · vállalj egy könnyű kihívást · fejezd be az idényt legalább a középmezőnyben.
- **Nyitás:** ℹ️ Infópult · 📈 Run-szint · ⚡ Boost-központ — **itt jön az ERŐFORRÁS-LECKE** (7.1).
- **Tartalék:** az idény végén magától.

#### 6. szakasz — „Az első nyár: a piac” *(az első átigazolási időszak)*
- **Nyitás a szakasz ELEJÉN:** 💰 Vétel · 🔍 Klub-szemle · 📈 Eladás / licitek · 🔭 Megfigyelt játékosok.
- **Lecke-sor (7.2):** a büdzsé, a bevétel és a kiadás, az eladás két útja, a vétel, a bér.
- **Feladatok (4-ből 3):** nézd meg, miből áll a büdzséd · tegyél fel egy játékost a piacra, vagy add el gyorsan · igazolj egy játékost a leggyengébb posztodra · zárd a nyarat a büdzsé legalább 30%-ával tartalékban.
- **Nyitás a végén:** 🏟️ Stadion, merch és PR · 👥 Keretbővítés · 🛰 Scout, ügynökség, sajtó · 🎯 Scout-célzás · 🛡️ A klub arculata.
- **Tartalék:** a 2. idény kezdetekor.

#### 7. szakasz — „A klub filozófiája” *(a 2. idény eleje)*
- **Nyitás:** 🎯 Csapatstílus (ma is ekkor nyílik: `STYLE_MIN_SEASONS`) — a legnagyobb lecke (7.3).
- **Feladatok (3-ból 2):** nézd meg mind a 8 stílus lapját · válassz stílust · költsd el az első stíluspontot · nézd meg a stílus mérföldköveit.
- **Nyitás a végén:** 🏆 Mérföldkövek (Infópult) · 🎽 a stílus-szerepek.
- **Tartalék:** a 2. idény 6. fordulója (a stílusválasztás ettől még a játékosé marad: a tartalék csak a többi nyitást nem tartja vissza).

#### 8. szakasz — „Hosszú táv” *(a 2. idény közepe)*
- **Feladatok (3-ból 2):** küldj vissza vagy hozz fel egy ifit · nézd meg a Run-szinted magyarázatát · szerezz meg egy mérföldkövet.
- **Nyitás:** 🌱 Ifiakadémia · 🎓 Szakmai stáb · 🌍 Nemzetközi kupa (ha elérhető) · 🔗 Szinergia (ha van második stílus).
- **Lecke:** az akadémia (a mai `ev:academy`), a stáb, a kupa.

#### 9. szakasz — „Kész vagy” *(a 2. idény vége)*
- **Mindent kinyit,** ami még zárva maradt. Záró ablak: „Végigjártad a kezdő utat.” Mellette:
  - mit tanultál (a 9 szakasz egy-egy sora);
  - a Kalauz mint tudástár (minden lecke visszanézhető);
  - egy jelvény a profilba.
- A feloldás-naplóban rögzül: `kutKesz` — a következő karrier alapja.

### 6.5 Feladat-típusok (a motor számára)

| Típus | Példa | Honnan tudjuk |
|---|---|---|
| **tett** | állíts be edzéstervet | a meglévő kezelők könyvelése (pl. `S.chTrainFocusChanged`) — hívási pont: egy `kutJel("train:set")` sor |
| **megnézés** | nézd meg a klub gazdaságát | a panel megnyitása (`kutJel("view:economy")`) |
| **meccs-eredmény** | rúgj gólt, kapott gól nélkül, nyerj | a meccs utáni könyvelés (ugyanaz, amiből a kihívások számolnak: `challengeProgress`) |
| **állapot** | a tabella felső felében | a HUB rajzolásakor számolt feltétel (`check()`) |
| **sorozat** | 2 győzelem zsinórban | a forma-lista |

Minden feladatnak kell egy **„Hogyan?”** gomb: a lecke, a kalauz-fejezet vagy a fogalomtár-kulcs.

---

## 7. A négy nehéz téma tananyaga

Ezek nem egy-egy gomb, hanem **gondolkodásmódok** — ezért külön leckesort kapnak.

### 7.1 Erőforrás-takarékosság és a mezőny követése *(5. szakasz — a legfontosabb lecke)*

**Az üzenet egy mondatban:** *„Annyival légy erősebb a mezőnynél, amennyi a
célhoz kell — ha elszállsz, a mezőny utánad lép, és a pénzed elfogy.”*

1. **Kép: a rés.** Az élő HUB-sávon a csapatod ⚡ meccsereje és a mezőny átlaga; köztük a **célrés** sávja (a választott fok `nfCelBeall`-ja). „Itt vagy — ez a sáv az egészséges.”
2. **Kép: mi történik, ha elszállsz.** Egyszerű ábra a mezőny-követésről („Lassan követnek” / „Lépést tartanak”): a te erőd ugrik, a mezőny néhány forduló alatt utánad jön; az előny elolvad, a költés megmaradt.
3. **Kép: a pénz iránya.** A szezononként érkező büdzsé, a bérek, a lelátó (a `hub:budget` és a Klub gazdasága élő képe). „Ami ma megmarad, az jövőre a tiéd.”
4. **Szabály-kártya, három pontban:**
   - erősíts a **gyenge** posztokon, ne a már erőseken;
   - a boost és a vétel akkor éri meg, ha a **célhoz** kell (feljutás, bennmaradás) — nem azért, mert van rá pénz;
   - **mindig maradjon tartalék** a következő nyárra és a sérülésekre.

**Tartós segítők** (nem csak a leckében):
- **Erőmérleg-jelző** a HUB-sávon (zöld = a célrésben vagy, sárga = fölötte, „a mezőny követni fog”, piros = alatta).
- **Költés-figyelmeztetés** „Most kezdem” módban: ha egy vétel vagy boost a büdzsé 40%-ánál többet visz, egy mondatos megerősítés jön (a tartalékkal és a résre gyakorolt hatással).
- **Az idény utáni gazdasági visszatekintő:** mennyit költöttél, mennyi lett belőle meccserő, hogyan reagált a mezőny.

### 7.2 Az átigazolási időszak és a gazdaság *(6. szakasz)*

Leckék (mindegyik 2–3 lépés, élő képpel):
1. **Bevétel:** lelátó (stadion, nézőszám), merch, szurkolók, díjak, eladások, híresség (a mai `ev:fame`: nem játékerő, hanem pénz).
2. **Kiadás:** bérek, vétel, boost, fejlesztések (stadion, scout, ügynökség, keretbővítés).
3. **Eladás — két út** (a mai `sale:routes` téma):
   - gyors eladás: azonnal, olcsóbban;
   - piacra tétel: licitek jönnek, drágábban, de idő kell;
   - kölcsön.
   - Mikor éri meg eladni: öregedő játékos, kispados, magas bér.
4. **Vétel:** scout, POT-felderítés, a poszt-illeszkedés, a bér hosszú távon.
5. **Ifik:** ifi-igazolás, az akadémia előzetese (a 8. szakaszban nyílik).
6. **A gyors és a lassú haladás:** gyors haladás = sok költés, gyors erősödés, gyors mezőny-követés; lassú haladás = tartalék, fejlődő fiatalok, stabil rés (a 7.1 visszautalása).

### 7.3 Csapatstílusok, skillfa, stíluspontok *(7. szakasz)*

**Nem mondjuk meg, melyiket válassza. Megmutatjuk, mi mire való.**
1. **A döntés súlya:** egyszeri és végleges (a mai `style:choose` lépései).
2. **Stílus-összevető:** mind a 8 stílus egy-egy kártyán, egyforma szerkezetben:
   - mit erősít (gólforrás, meccserő, gazdaság, utánpótlás);
   - milyen keret illik hozzá (gyors, magas, sok fiatal, egy sztár…);
   - a mérföldkövei, és mi nyílik velük.
3. **„A kereted szemével”:** a mostani keret 3–4 mutatója a stílusok igényei mellett (pl. „a gyorsaságod: 88 — a Villámnak ez kell”), ítélet nélkül.
4. **A skillfa:** a kategóriák szerepe, mindegyik egy mondattal:
   - **gólszerző képességek** — több gól, a gólforrások;
   - **meccserő-növelők** — az erő, amivel a meccs megy;
   - **gazdasági és piaci ágak**;
   - **akciók**, csapatszerepek.
   - Hozzá: mi a különbség a meccserő-növelő és a gólszerző között a meccsmotorban (a mai edzői elemzés gólforrás-bontásából).
5. **A stíluspont:** honnan jön (mérföldkövek, saját pont-gyűjtés), és hogy **ugyanaz a takarékossági szabály** érvényes rá, mint a pénzre: az elköltött pont végleges.

### 7.4 A meccs: meccserő és a befolyásoló tényezők *(2. szakasz)*

- A meccserő-bontás élő képe:
  - morál, kémia, taktika-szint, poszt-illeszkedés, edző, hazai pálya, csúszkák;
  - mindegyiknél: „ezt te így befolyásolod”.
- Az edző elemzése: mit lát a meccsből, és hogyan olvasd (gólforrások, gyenge pontok).
- „Egy pont meccserő ≈ +13% gólvárhatóság” (a mai kalauz-szöveg) — **ez a 7.1 alapja**: azért nem kell sokkal több erő, mert kis különbség is sokat ér.

---

## 8. A lecke formája — „biztonságos képernyőképek”

A kérés: *„képernyőképekkel megmutatjuk, hogy na itt akkor ezt kell csinálni.”*
Ez ma már félig megvan: a **Kalauz élő képei** a valódi HUB-elem másolatai,
számozott jelölőkkel. A lecke négyféle lépésből áll:

| Lépés | Mit lát a játékos | Meglévő alap |
|---|---|---|
| 🖼 **Kép** | a valódi elem élő másolata, jelölőkkel, alatta a magyarázat | `KALAUZ` `kep:` |
| 👉 **Mutasd** | a valódi gomb kiemelve, a többi sötét; a buborék elmondja, mi ez | `teachDimRects`, `guideAnchorEl` |
| ✋ **Csináld** | ugyanaz, de a lecke **vár**, amíg a játékos megnyomja vagy beállítja; utána „Kész!” | ÚJ: a lépés `var:"kutJel-azonosító"` mezővel |
| ✅ **Összegzés** | egy mondat arról, mit ért el vele, és hol találja legközelebb | ÚJ |

**Biztonság:** a „Csináld” lépések csak visszafordítható műveleteket kérnek
(felállás, taktika, megbízás, edzésterv nyitáskori átállítása). Pénzt költő
vagy végleges döntést (vétel, eladás, stílus) a lecke **soha** nem végeztet el:
ott csak „Mutasd” van, a döntés a játékos külön lépése.

---

## 9. Jutalmak

A feladatok elsődleges jutalma **a nyitás**. Másodlagos jutalom akkor, ha a
gazdasági egyensúlyt nem borítja: egy kicsi, mindenkinek egyforma ajándék
szakaszonként (pl. egy talizmán-húzás, egy kis láda), vagy semmi. **Pénzt és
meccserőt nem javaslok** — az a 7.1 leckével menne szembe, és a Profi módban
indulóhoz képest előnyt adna. *(Döntés: 15. fejezet, 3. pont.)*

---

## 10. Beállítások és kilépők

| Hol | Mi |
|---|---|
| Karrier-indítás | „Mennyire ismered a játékot?” (5.1) |
| Beállítások → 🧭 Vezetés | Kezdő út: **Be / Ki (minden nyitva)** · „Leckék újra” · a mai tanító módok (hard / guided / light / off) |
| A Kezdő út kártya | „Mindent kinyitok most” (megerősítéssel) · „Kihagyom ezt a leckét” |
| Kalauz | minden már nyitott lecke visszanézhető |

A meglévő tanító módokhoz így igazodik: a Kezdő út a **nyitásokat és a
feladatokat** adja; a hard / guided / light / off továbbra is azt szabályozza,
**mennyit beszél** a játék. A „Most kezdem” = Kezdő út + hard; a „Játszottam
már” = Kezdő út + guided; a Profi = nincs Kezdő út + light.

---

## 11. Technikai felépítés

### 11.1 Adat
- **`S.kut`** (a karrier mentésében): `{v:1, mod:"kezdo"|"halado"|"ki", szakasz, kesz:{feladatId:1}, nyitva:{funkcioId:1}, lecke:{id:1}, tartalek:{szakasz:fordulo}}`.
  - **A mentés mezőlistás:** a `S.kut`-ot a mentés listájába ÉS a betöltésbe is fel kell venni (CLAUDE-szabály).
- **Feloldás-napló** (karriereken át, `30-0-unlock-v1`): `kutKesz` (végigvitt kezdő út), `kutDb` (hány karrier indult kezdő úttal).
- **Adattábla:** `KUT_SZAKASZ=[{id, cim, edzo, nyitE:[...], nyitV:[...], feladatok:[{id, t, tip, kell, jel|check, hogyan}], kell:K, tartalek:{fordulo}}]` és `KUT_FUNKCIO={id:{gomb:"hubTrainingBtn", nev, ic, alap(){…}, lecke:"…"}}`.

### 11.2 A kapu
- **`kutNyitva(id)`** — EGY függvény. A hívók:
  - a `hubRefreshMenu` (rejti a gombot, és számolja a „🔒 még N funkció” sort);
  - a `TEACH_TOPICS[*].ready()` (lezárt funkcióról nincs jelzés);
  - az `EK_NYILAS` (az edző a valódi nyitást jelenti be);
  - a `KALAUZ` fejezetei (`sz:` helyett vagy mellett a szakasz).
- **Közös karrierben, Profi módban és régi mentésben mindig `true`.** Régi mentésben nincs `S.kut` → minden nyitva, **semmi nem változik**.
- A kapu **mindig a meglévő feltételek UTÁN** fut (pl. a csapatstílus a `styleCanChoose` szerint, a talizmán a `talOn` szerint): csak szűkíthet, sosem nyit ki olyat, ami egyébként zárva volna.

### 11.3 A jelek
- **`kutJel(id)`** — egysoros hívás a meglévő kezelőkben, mintájára a `guideFire`-nek (pl. az edzésterv rögzítésénél, a felállás-váltásnál, a panelek megnyitásakor).
- A meccs-eredmény feladatok a meccs utáni könyvelésből jönnek (ugyanonnan, ahonnan a kihívások: egy közös `kutMeccsUtan(stat)`).
- Az állapot-feladatok a HUB rajzolásakor értékelődnek.

### 11.4 A nehézség és az osztály
- A `nfFokZart` a karrier-indításon nem zár; a lépcső-presetek (`UNLOCK_PRESETS`) a nehézséget már nem kötik.
- A fokonkénti „kinek ajánlott” szöveg az `NF_LEVELS` új mezője (`kinek`).

### 11.5 Ami NEM változik
- A meccsmotor, a gazdaság, a mezőny-követés — semmi. A kezdő út csak **láthatóság, sorrend és szöveg**.
- A mai tippek, témák, kalauz-fejezetek szövege: a kezdő út hivatkozik rájuk, nem írja át őket.

---

## 12. Fázisok

| Fázis | Tartalom | Verzió (javaslat) | Próba |
|---|---|---|---|
| **0 · Audit** | minden funkció „ha sosem nyúlsz hozzá” viselkedése; az edző-alapállások listája (6.3); a meglévő tipp-, téma- és kalauz-szövegek leképezése a szakaszokra | patch (docs) | — |
| **1 · Belépés** | „Mennyire ismered?”; mind a 10 nehézségi fok nyitva, „kinek ajánlott” sorral; osztály-ajánlás szöveggel; a gyors indítás 2 lapra; a draft lépéssora és az „Az edző tippje” jelölő | minor | `kut-belepes-proba`: a nehézségek választhatók, az ajánlás a válasz szerint jelölődik, a draft-lépések sorban jönnek |
| **2 · A motor** | `S.kut` (mentés + betöltés), `kutNyitva`, `kutJel`, a menü rejtése és a „🔒 még N” sor, a Kezdő út kártya, a nyitás-ablak, a tartalék, a „Mindent kinyitok”, régi mentés = minden nyitva, PvP néma | minor | `kut-motor-proba`: mentés–betöltés, a kapu minden hívónál, a tartalék nyit, a régi mentés változatlan, PvP-ben semmi |
| **3 · Az első idény** | a 0–5. szakasz feladatai, nyitásai, leckéi; az edző-alapállások (edzésterv, összhang); a nyitáskori egyszeri átállítás | patch-ek a 2. fázis minorján belül | **„kezdő bot” végigjátszás**: egy idény feladat-követéssel ÉS teljes tétlenséggel is, minden nyitásnak meg kell történnie a 30. fordulóig |
| **4 · Gazdaság** | a 7.1 leckéi; az erőmérleg-jelző; a költés-figyelmeztetés; az idény utáni gazdasági visszatekintő; a 6. szakasz (piac) | minor | a figyelmeztetés küszöbe; a jelző színei a célréshez képest |
| **5 · Stílus** | a 7. szakasz: stílus-összevető, „a kereted szemével”, a skillfa-lecke, a stíluspont | minor | mind a 8 stílus kártyája ugyanazzal a szerkezettel; az összevető nem ajánl ítélettel |
| **6 · Hosszú táv** | 8–9. szakasz; záró ablak; jelvény; `kutKesz` a naplóban; a következő karrier alapértelmezése | patch | a második karrier „Játszottam már”-ral indul |
| **7 · Csiszolás** | nyelvi kör; a leckék hossza (≤ 4 lépés); a telefonos elrendezés; pixel téma; valódi kezdők próbajátéka (13. fejezet) | patch-ek | — |

---

## 13. Mérés — honnan tudjuk, hogy működik

1. **Automatikus végigjátszás** (Playwright, a mai próbák mintájára):
   - „engedelmes” bot: a feladatokat teljesíti → a szakaszok sorban nyílnak;
   - „tétlen” bot: semmihez nem nyúl → a tartalékok nyitnak, az idény végigér, nincs hiba;
   - „rossz csapat” bot: gyenge draft → a meccs-feladatok helyett a tartalék visz tovább.
2. **Számlálók a próbában:** hány képernyő, hány lecke-lépés, hány perc „olvasás” jut egy idényre (cél: az első idényben összesen ≤ 25 lecke-lépés).
3. **Valódi kezdők próbajátéka** (te szervezed, 2–3 ember, aki még nem látta a játékot). Megfigyelési lista:
   - Hol akadt el? Mit kérdezett?
   - Mit hagyott ki?
   - Elolvasta-e a leckét, vagy csak lapozott?
   - Az első nyáron mire költött, és miért?
   - A 2. idény elején el tudta-e mondani: mi a célrés, és miért nem szabad elszállni?
4. **Visszajelzés-gomb** a leckék végén (👍 / 👎, helyben gyűjtve): melyik lecke érthetetlen.

---

## 14. Kockázatok

| Kockázat | Védelem |
|---|---|
| A lezárt funkció **kárt** okoz (pl. edzésterv nélkül nincs fejlődés) | 6.3: edző-alapállás + egyszeri átállítás nyitáskor; a 0. fázis ezt méri ki |
| **Beragadás** (soha nem nyer meccset) | minden szakasznak tartalék-fordulója van; a „tétlen” bot bizonyítja |
| A leckék **soknak** hatnak | ≤ 4 lépés; ≤ 2 lecke leülésenként; „Kihagyom”; „Játszottam már” mód rövid leckékkel |
| A meglévő **kihívás- és mérföldkő-rendszer** összekeveredik a feladatokkal | a feladatoknak nincs büntetése, más a színük és a helyük (Kezdő út kártya); a menedzsmentben külön szakasz |
| **Régi mentések** felborulnak | `S.kut` nélkül minden nyitva; próba |
| **PvP** eltérést okoz a két játékos között | `unlockGatesOn()`-hoz kötve néma |
| A **lépcsők** (3.9.46) és a kezdő út **kettős zárat** ad | a 15. fejezet 1. döntése tisztázza: a beállítás-zárak maradnak-e, és melyek |
| A tananyag **elavul** a játék változásával | a leckék élő képeket és a GLOSSARY szövegeit használják; a skill (`.claude/skills/`) kapjon egy „ha új funkciót adsz, add a Kezdő útba is” szabályt |

---

## 15. Döntések (rögzítve: 1.0.11.15.00)

A válasz: *„A kérdéseidre mindre az a válaszom, hogy hol sejted, milyen irányba
akarom én ezt tolni."* Kiegészítve:
- *„Egyelőre a dinamikus módot vegyük ki a választható játékmódok közül. […] Amikor játékot indítasz nem is kell utána semmi felület, egyből a hagyományos módon belüli első kijelző jöhet."*
- *„Fontos, hogy az eddigi funkciókból semmit ne vegyünk el, de azokat képesek legyünk meghaladni, megtölteni, érthetőbbé tenni."*
- *„Már az első idényben is végig legyen átigazolási lehetőség a 8. fordulótól kezdve."*
- *„Költés figyelmeztetés minden módban legyen. Amint túl kevés tartalékod marad, vagy éppen túl magasra nősz a mezőny fölé (várható győzelmi esély a következő ellenfél ellen meghaladja a 85%-ot)."*

| # | Kérdés | Döntés |
|---|---|---|
| 1 | A lépcsők sorsa | **(b)**: a nehézség szabad (mind a 10 fokozat), a többi lépcső-kapu marad (tempók, ikonok, a stílus-kapuk, a lépcső kötött D3-a) — „semmit ne vegyünk el”. |
| 2 | A „Mennyire ismered?” | Így marad: Most kezdem / Játszottam már / Ismerem, mindent kérek. Az alap a „Most kezdem”; aki már lezárt karriert, annak a „Játszottam már”. A választás a játékosé (localStorage), karrierek közt megmarad. |
| 3 | Jutalom | **(a)**: csak a nyitás. |
| 4 | Az edző tippje a drafton | **Kell** — „Most kezdem” módban, indoklással, csak jelölés. |
| 5 | A tartalékok hossza | A 6.4 számai. |
| 6 | Költés-figyelmeztetés | **Minden módban**, két feltétellel: (a) kevés tartalék marad, (b) 85% fölötti győzelmi esély a következő ellenfél ellen (erősítő költésnél). Részletek: `docs/kezdo-ut-belepes-1-0-11-15-00.md`. |
| 7 | Vétel az első idényben | **A 8. fordulótól végig.** Az első idényben is megvan a 8., 15. és 23. forduló utáni átigazolási időszak; a Kezdő út a piacot a 8. fordulónál nyitja, és onnan nyitva marad (a 6.4 menetrendjében a piac az „Első nyár” helyett a 2. szakaszba kerül, a nyár a gazdaság-leckéké marad). |
| 8 | A dinamikus mód | **Kivéve a választható módok közül** (a kódja marad, a régi mentések betölthetők). A Kezdő út csak a hagyományos karrierre készül. |

## 16. Állapot

| Fázis | Állapot |
|---|---|
| 1 · Belépés | ✅ **Kész: 1.0.11.15.00** — tudásszint-kérdés, mind a 10 fokozat nyitva „kinek ajánlott” sorral, kezdőnek 2 lépéses indító és megerősítés 7+ fokozatnál, osztály-tanács, az edző tippje és horgonyzott draft-tippek; a dinamikus mód kivéve; költés-figyelmeztetés. |
| 0 · Audit, 2–7 | következik |
