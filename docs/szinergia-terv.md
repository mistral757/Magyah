# 🔗 Szinergia — terv (jóváhagyásra)

> „A menü tetején szintén legyen rögzítve egy extra csapatstílus képesség, ami
> akkor jelenik meg, ha már legalább 3 stílusod van. Ennek neve: Szinergia.
> 3 szintje lehet ennek is. […] minden 3-as kombóra ki kell dolgozni valami
> igazán különleges hatást, ami csak annak a hármasnak az együttes hatása tud
> elérni."

Ez a dokumentum **terv**: a kód még nem készült el. A jóváhagyásod után
építem meg, a végén a felsorolt kérdésekkel.

---

## 1. A keret

| | |
|---|---|
| **Hol** | A csapatstílus menü tetején, a rögzített stílusjelvény-sor alatt, egy saját kártyán. Csak akkor jelenik meg, ha legalább 3 stílusod van. |
| **Szintek** | 3. A szint a Szinergiáé, nem a hármasé: ha másik hármast választasz, a megvett szint vele megy. |
| **Ár** | A közös csapatstílus-pontból: **90 / 150 / 240** pont (a III. sáv 40/68/108-as árának kb. 2,2-szerese, mert egy egész új mechanikát nyit). |
| **3 stílusnál** | Az egyetlen hármas él, választani nem kell. |
| **4 stílusnál** | A 4. stílus választásakor felugrik a választó: „melyik 3 stílus szinergiája éljen a következő idényben?” (4 lehetőség, mindegyik a saját hatásával). |
| **Idényenként egyszer** | Szezonkezdéskor értesítés: „🔗 Ebben az idényben: 🔥 + 🛡️ + ⚡ — Ellentámadás-ágyú. Megváltoztatod?” Az idényben egyszer lehet váltani. |

## 2. A tervezési elv: hármas lánc + csavar

Minden stílusnak van egy **saját mozdulata**, és egy szinergia ezeket **egyetlen
láncba fűzi**. Ilyen lánc csak a három stílus együttes jelenlétében létezhet:

| | stílus | a mozdulata a láncban | amivel a motor méri |
|---|---|---|---|
| 🧲 | Gegenpressing | **visszaszerez** (indító) | a pressing labdaszerzései |
| 🛡️ | Beton | **kivéd** (indító) | a kivédett ellenfél-helyzetek |
| 💥 | Panzer | **megfélemlít** (indító / feltétel) | a Félelem szint, az ellenfél lapjai |
| ☯️ | Harmónia | **egyensúlyt tart** (feltétel) | a csapategyensúly |
| 🌀 | Tiki-Taka | **járatja** (vivő) | a passzsor (Passz) |
| ⚡ | Villám | **elfut** (vivő) | a sprint (Sebesség) |
| 🔥 | Bombázók | **lő** (befejező) | a gól-képességesek (Gólszerzés) |
| ⭐ | Sztárom a párom | **ő dönt** (bármelyik helyen) | a sztár |

**Minden mérés az 1.0.6.1.02-es mércével megy**: a játékosaink attribútuma a
meccserő-többlettel felskálázva, az ellenfél meccserejéhez mérve.

**A szintek:**
- **1. szint:** a lánc él.
- **2. szint:** a hatás ×1,7.
- **3. szint:** a hatás ×2,5, és megnyílik a hármas **saját csavarja**: egy
  kiegészítő hatás, ami csak ennél a kombinációnál van.

**Az erő plafonja:** egy szinergia teljes hozama a 3. szinten se legyen több
meccsenként **~0,30 gólkülönbségnél**. Ez nagyjából +2,5 meccserőnek felel meg,
egy III. sávú csapaterő-képesség csúcsszintjének. Így a Szinergia érezhető, de
nem írja felül a stílusokat.

**Megjelenés:** minden lánc-gól saját közvetítési sort és rövid jelenetet kap
(az akció-képességek animációs rendszerén), és az edzői elemzésben saját
gólforrásként (🔗) szerepel.

---

## 3. Az 56 hármas

Jelölés: 🔥 Bombázók · 🛡️ Beton · ⚡ Villám · 🌀 Tiki-Taka · ☯️ Harmónia ·
🧲 Gegenpressing · 💥 Panzer · ⭐ Sztár. Az alapszámok az 1. szintre szólnak.

### 🔥 Bombázókkal (21)

| # | hármas | név | a lánc (1–2. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 1 | 🔥🛡️⚡ | **Ellentámadás-ágyú** | Minden kivédett ellenfél-helyzet után 8% eséllyel azonnali kontra: a leggyorsabb szélső viszi fel, egy gól-képességes fejezi be. | A kontra-gól után a busz automatikusan beáll 10 percre. |
| 2 | 🔥🛡️🌀 | **Ostromgyűrű** | Ha 60 percig nem kaptunk gólt, a hátralévő passzsorok befejezése „sortűz”: a 3 legjobb Gólszerzés lő egymás után, a befejezés fala −8%. | Egy plusz passzsor a 75. percben. |
| 3 | 🔥🛡️☯️ | **Jéghideg vezetés** | Egygólos vezetésnél a csapat befagyasztja a meccset: ellenfél-gólesély −6%, ha a csapategyensúly ≥ 70%. | A kétgólos vezetésre is kiterjed, és a lefújáskor +3 morál. |
| 4 | 🔥🛡️🧲 | **Csapda** | A beszorított ellenfél labdavesztései pressing-labdaszerzésnek számítanak: +1 büntetés-próba meccsenként, a gól-képességesek fejezik be (csak döntetlennél vagy vezetésnél). | A csapda-gól nem számít bele a Büntetés meccsenkénti plafonjába. |
| 5 | 🔥🛡️💥 | **Ostromzár** | Minden ellenfél-lap után a következő 5 percben egy sortűz-alkalom (meccsenként legfeljebb 1). | A bezárt ellenfél lövései a Félelem szinttel gyengülnek (10 pontonként −1%, legfeljebb −6%). |
| 6 | 🔥🛡️⭐ | **A bunker királya** | Amíg nem kaptunk gólt, a sztár gólsúlya ×1,3. A sztár gólja után 10 percig ellenfél-gólesély −6%. | A sztár gólja után a busz azonnal beáll. |
| 7 | 🔥⚡🌀 | **Pengeváltás** | A passzsor 5. passza után, ha szélső kapja a labdát, a sor száguldásba fordul: a befejezést a Sebesség és a Gólszerzés jobbika méri. | A száguldásba fordult sor befejezője gól-képességes ember is lehet a pályán bárhonnan. |
| 8 | 🔥⚡☯️ | **Lendület** | Minden gólunk után 10 percig a csapat gólesélye +4%, ha a csapategyensúly ≥ 70%. A kiegyensúlyozott csapat nem esik szét a rohamban. | A lendület az ellenfél góljával sem törik meg, csak megáll. |
| 9 | 🔥⚡🧲 | **Villámcsapás** | Minden pressing-labdaszerzés 8% eséllyel azonnali villám-kontrát indít: a leggyorsabb fut, egy gól-képességes fejez be. | A villámcsapás-gól után a pressing következő üteme dupla esélyű. |
| 10 | 🔥⚡💥 | **Rohamhullám** | Félelem ≥ 30 mellett a szélsők Sebessége +3% a meccsen, és a Sortűz egyik alkalma két hullámban lő. | Minden száguldás-gól +2 Félelem pontot ad a meccsen. |
| 11 | 🔥⚡⭐ | **A sztár futópályája** | A két leggyorsabb szélső a sztárnak tálal: a sztár gólpassz-forrása a szélsőkből ×1,25. | Ha a sztár száguldásból lő gólt, +1 Sortűz-alkalom. |
| 12 | 🔥🌀☯️ | **Szimfónia** | Csapategyensúly ≥ 75% mellett a passzsor minden passza +0,5% befejezést ad (a „szétcincált védelem” erősebb). | A passzsor-gól gólszerzőjének képesség-gólja is számít (gólétvágy élesedik). |
| 13 | 🔥🌀🧲 | **Gegen-tiki** | A pressing-labdaszerzés után azonnal rövid passzsor indul (legfeljebb 10 passz), 1 alkalom meccsenként. | Az ebből lett gól képesség-gólnak is számít (gólétvágy). |
| 14 | 🔥🌀💥 | **Megfélemlítő kör** | A Félelem gyengíti a passzsor ellenállását: 10 pontonként −1% (legfeljebb −5%). | A megszakadt passzsor 30%-ban sortűzzel folytatódik. |
| 15 | 🔥🌀⭐ | **A rendező** | Ha a sztár érinti a labdát a sorban, az utána következő 1 passz nem szakadhat meg. | A sztár által indított sor befejezője gól-képességes ember. |
| 16 | 🔥☯️🧲 | **Türelmes vadász** | Kiegyensúlyozott csapatnál (≥ 70%) a hajrában (75+.) a Büntetés esélye +10%. | A Mérgezett egér 70. perc utáni sérülés-veszélye eltűnik. |
| 17 | 🔥☯️💥 | **Hideg düh** | Csapategyensúly ≥ 70% mellett a kiállítás utáni gólesély-büntetés −25%. | Emberhátrányban +1 Sortűz-alkalom. |
| 18 | 🔥☯️⭐ | **Csapatsztár** | A sztár nem nyomja el a többieket: a kiszolgálás ára (a többi gólszerző esélyének csökkenése) −30%. | A csapategyensúly a sztárt is beszámítja, mintha átlagos ember volna. |
| 19 | 🔥🧲💥 | **Vérszag** | Minden pressing-labdaszerzés +2 Félelem pontot ad a meccsen. 30 fölött a Büntetés gól-képességes befejezője ×1,2. | A félelem-pontok fele a következő meccsre is átjön. |
| 20 | 🔥🧲⭐ | **A sztár éhsége** | A sztár pressing-súlya ×2, az ő labdaszerzéséből jövő Büntetés esélye +15%. | A sztár Büntetés-gólja nem számít a plafonba. |
| 21 | 🔥💥⭐ | **Hóhér** | A sztár gólja után az ellenfél félelme +5 a meccsen, és 10 percig az ellenfél gólesélye −5%. | A sztár mesterhármasa után a meccs hátralévő része „lezárva”: ellenfél −12%. |

### 🛡️ Betonnal, Bombázók nélkül (15)

| # | hármas | név | a lánc (1–2. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 22 | 🛡️⚡🌀 | **Kontrollált kontra** | A Fal és az Árok labdaszerzései passzsort indítanak, ami a 4. passz után száguldásba vált: a befejezést a Sebesség méri. 1 alkalom meccsenként. | 2 alkalom, és a második a hajrában jön. |
| 23 | 🛡️⚡☯️ | **Hullámtörő** | Az ellenfél gólja utáni 10 percben a mi kontráink esélye +6%. | Kiegyensúlyozott csapatnál a kapott gól morál-ára nullázódik. |
| 24 | 🛡️⚡🧲 | **Magasan zárt fal** | A pressing labdaszerzés-esélyét a Védekezés átlaga is emeli, nem csak a Sebesség. | A pressing ütemeiben az ellenfél gólesélye −4%. |
| 25 | 🛡️⚡💥 | **Acélkerítés** | Félelem ≥ 30 mellett a busz ára (a mi gólesélyünk csökkenése) feleződik. | A busz alatt is fut a kontra: kivédett helyzetenként 6% sprint-gól esély. |
| 26 | 🛡️⚡⭐ | **Testőr-kontra** | Védekezés közben a sztár pihen, kontrában robban: a busz ideje alatt a sztár gólsúlya ×1,5 kontragólokra. | A sztár a busz alatt nem fárad (formája nem esik a meccsen). |
| 27 | 🛡️🌀☯️ | **Labda-pihentetés** | Vezetésnél minden 8+ passzos sor −3% ellenfél-gólesélyt ad a következő 10 percre (kihúzzuk az időt). | A hatás halmozódik, legfeljebb háromszor. |
| 28 | 🛡️🌀🧲 | **Fojtás** | Az ellenfél nem jut ki: minden 15 percben, amikor labdát szereztünk vissza, ellenfél-gólesély −3%. | 3 visszaszerzés után egy plusz „fojtó” passzsor. |
| 29 | 🛡️🌀💥 | **Páncélozott labdabirtoklás** | A szakadt passzsorok 25%-a ellenfél-lapot hoz (+Félelem pont), és a sor újraindul. | Az újraindult sor 3 passz előnnyel kezd. |
| 30 | 🛡️🌀⭐ | **Sztár a sor végén** | Ha a sztár a pályán van, a passzsor befejezője 50% eséllyel ő. | A sztár befejezése elől a fal −10%. |
| 31 | 🛡️☯️🧲 | **Zen-pressing** | Kiegyensúlyozott csapatnál a sikeres pressing-ütem ellenfél-gólesélyt is csökkent: −2% abban az ütemben. | A pressing nem okoz lapot (a durva belépők elmaradnak). |
| 32 | 🛡️☯️💥 | **Nyugodt erő** | A Félelem szint nem fogy kapott gól vagy vereség miatt. | A Peace on you! piroslap-ára −40%. |
| 33 | 🛡️☯️⭐ | **Testőrgyűrű** | A sztár sérülés-esélye −30%. | Ha a sztár hiányzik, a sztár-függés büntetése feleződik. |
| 34 | 🛡️🧲💥 | **Vasmarok** | A pressing-labdaszerzés után a következő ütemben ellenfél-gólesély −4%, és minden visszaszerzés +1 Félelem pont. | Félelem ≥ 50 mellett a visszaszerzés esélye +10%. |
| 35 | 🛡️🧲⭐ | **Sztár-vadászat** | A sztár Büntetés-próbái +1 plafont kapnak a meccsen. | A sztár labdaszerzése után a busz 5 percre beáll. |
| 36 | 🛡️💥⭐ | **Megközelíthetetlen** | A sztár elleni ellenfél-lapok 20%-a tizenegyest hoz. | A sztár 11-esét a Félelem szint is segíti. |

### ⚡ Villámmal, Bombázók és Beton nélkül (10)

| # | hármas | név | a lánc (1–2. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 37 | ⚡🌀☯️ | **Folyó játék** | Kiegyensúlyozott csapatnál a passzsor lépésenkénti Passz-átlagába a Sebesség 25%-a is beszámít. | A folyó sor befejezését a Sebesség is segíti. |
| 38 | ⚡🌀🧲 | **Totális futball** | Pressing-labdaszerzés, passzsor, száguldás: 1 „totális” akció meccsenként, a három tengely (pressing, Passz, Sebesség) átlaga méri. | 2 alkalom, és a befejező bárki lehet (a legjobb Gólszerzés). |
| 39 | ⚡🌀💥 | **Gyorsított páncél** | Félelem ≥ 30 mellett a passzsorok és a kontrák utáni 5 percben ellenfél-gólesély −3%. | A megfélemlített ellenfél nem tud visszazárni: a kontra +5%. |
| 40 | ⚡🌀⭐ | **Sztár-sprint** | A sztár a sorban kétszer is érintheti a labdát. Szélső posztról a befejezését a Sebesség és a Gólszerzés jobbika méri. | A sztár által befejezett sor után +1 Száguldás-alkalom. |
| 41 | ⚡☯️🧲 | **Végtelen motor** | Kiegyensúlyozott csapatnál a hajrában (75+.) a sebesség-skillek ×1,2. | A pressing a hajrában sem fárad (a 70. perc utáni esés elmarad). |
| 42 | ⚡☯️💥 | **Lavina** | Minden sebesség-alapú gól után +3 Félelem pont a meccsen. | Győzelem után a Félelem szint +2 extrát kap. |
| 43 | ⚡☯️⭐ | **Szabad szárnyak** | A sztár mellett a leglassabb szélső Sebessége a csapatátlagra emelkedik a meccsen (nincs gyenge láncszem). | A sztár gólpassza a szélsőknek +15%. |
| 44 | ⚡🧲💥 | **Falkavadászat** | Minden visszaszerzés után 6% eséllyel gyors szélső-kontra. A Falka szerep emberhátrányban is pressingel. | Emberhátrányban a pressing esélye nem csökken. |
| 45 | ⚡🧲⭐ | **Sztár-roham** | A sztár meccsenként 1-szer egyéni pressing-rohamot indít: elveszi, elfut, lő. A sikert a Sebesség és a Gólszerzés átlaga méri. | 2 roham, a második a hajrában. |
| 46 | ⚡💥⭐ | **Páncélvonat** | A Tankoljunk akciónál a sztár is beül, és a gól az övé. Az esély a sztár Sebességével is nő. | +1 Tankoljunk-alkalom, ha a sztár a pályán van. |

### 🌀 Tiki-Takával (6)

| # | hármas | név | a lánc (1–2. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 47 | 🌀☯️🧲 | **Labdakör** | A pressing-visszaszerzés utáni passzsor +3 passz előnnyel indul. | Kiegyensúlyozott csapatnál a sor nem szakadhat meg a 3. passz előtt. |
| 48 | 🌀☯️💥 | **Fegyelmezett erő** | Minden ellenfél-lap +1 passzsor-próba (meccsenként legfeljebb 1). | A Panzer saját lapjai nem törik meg a passzsor tempóját. |
| 49 | 🌀☯️⭐ | **Karmester-sztár** | A sztár a Lát a pályán szerepet is viselheti, szerep-hely nélkül. | A passzsor fala −8%, ha a sztár a sorban van. |
| 50 | 🌀🧲💥 | **Kalapács és üllő** | Félelem ≥ 30 mellett a pressing labdaszerzés-esélye +6%. | A visszaszerzett labdából passzsor indul (1 alkalom). |
| 51 | 🌀🧲⭐ | **Sztár-gépezet** | A sztár által indított passzsor első 2 lépése védett. | A sztár pressing-labdaszerzése után passzsor indul. |
| 52 | 🌀💥⭐ | **Szuverén** | A sztár elleni ellenfél-lapok passzsort indítanak. | Az ilyen sor befejezője a sztár. |

### Harmónia, Gegen, Panzer, Sztár (4)

| # | hármas | név | a lánc (1–2. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 53 | ☯️🧲💥 | **Hideg fej, forró láb** | Kiegyensúlyozott csapatnál a pressing nem hoz sárgát. A pressingből +1 Félelem pont visszaszerzésenként. | A sárga lapok nem halmozódnak pirossá. |
| 54 | ☯️🧲⭐ | **Közös ügy** | A sztár is pressingel (a súlya egy átlagos emberé), és ettől a csapategyensúly +5 pont. | A sztár labdaszerzése után a csapat gólesélye +5% 5 percig. |
| 55 | ☯️💥⭐ | **A kapitány árnyéka** | A sztár morálja a csapat morál-padlója: senki nem eshet 10 ponttal alá. | Vereség után a sztár morálja nem esik. |
| 56 | 🧲💥⭐ | **Ragadozó** | A sztár a Mérgezett egér szerep hatását is megkapja, szerep-hely nélkül. | A sztár labdaszerzése +3 Félelem pont. |

---

## 4. Nyitott kérdések (a te döntésed)

1. **Az ár:** 90 / 150 / 240 pont rendben van, vagy olcsóbb vagy drágább legyen?
2. **Az erő plafonja:** ~0,30 gólkülönbség meccsenként a 3. szinten. Ennyi
   legyen, vagy érezhetőbb?
3. **A megvalósítás sorrendje:** az 56 hatás egyszerre nagy csomag. Azt
   javaslom, hogy az első kiadásban jöjjön a keret és a 35 nem-sztáros hármas,
   a második kiadásban a 21 sztáros. A sztáros hármasoknál a sztár sok
   meglévő rendszerébe kell bekötni.
4. **Melyik hármast változtatnád** vagy cserélnéd le: a lista bármelyik sora
   átírható, mielőtt kódba kerül.
