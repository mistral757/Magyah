# 🔗 Szinergia — terv (jóváhagyásra)

> „A menü tetején szintén legyen rögzítve egy extra csapatstílus képesség, ami
> akkor jelenik meg, ha már legalább 3 stílusod van. Ennek neve: Szinergia.
> 3 szintje lehet ennek is."
>
> Módosítás: „Csak 2 stílusnak legyen szinergiája. A 3 túl bonyolult és túl
> sok variáció. A szinergia ettől függetlenül a harmadik stílustól nyílik meg,
> és a választási lehetőség ugyanúgy lenne."

**Megvalósítva az 1.0.6.3.00-ban** — a részletek és a tervtől való eltérések:
[szinergia-1-0-6-3-00.md](szinergia-1-0-6-3-00.md).

---

## 1. A keret

| | |
|---|---|
| **Hol** | A csapatstílus menü tetején, a rögzített stílusjelvény-sor alatt, saját kártyán. Csak akkor jelenik meg, ha legalább 3 stílusod van. |
| **Mi él** | Mindig **egy pár** szinergiája: két stílus a meglévők közül. |
| **Szintek** | 3. A szint a Szinergiáé, nem a páré: ha másik párt választasz, a megvett szint vele megy. |
| **Ár** | A közös csapatstílus-pontból: **90 / 150 / 240** pont. |
| **A választás** | A 3. stílus felvételekor felugrik a választó: a 3 lehetséges pár közül melyik éljen a következő idényben. A 4. stílus felvételekor ugyanígy, akkor már 6 pár közül. |
| **Idényenként egyszer** | Szezonkezdéskor értesítés: „🔗 Ebben az idényben: 🔥 + ⚡ — Roham. Megváltoztatod?” Idényenként egyszer lehet váltani. |

## 2. A tervezési elv: két mozdulat egy láncban

Minden stílusnak van egy **saját mozdulata**, és a szinergia a pár két
mozdulatát **egyetlen láncba fűzi**. Ilyen lánc csak a két stílus együttes
jelenlétében létezik.

| | stílus | a mozdulata | amivel a motor méri |
|---|---|---|---|
| 🧲 | Gegenpressing | **visszaszerez** | a pressing labdaszerzései |
| 🛡️ | Beton | **kivéd** | a kivédett ellenfél-helyzetek, a busz |
| 💥 | Panzer | **megfélemlít** | a Félelem szint, az ellenfél lapjai |
| ☯️ | Harmónia | **egyensúlyt tart** | a csapategyensúly |
| 🌀 | Tiki-Taka | **járatja** | a passzsor (Passz) |
| ⚡ | Villám | **elfut** | a sprint (Sebesség) |
| 🔥 | Bombázók | **lő** | a gól-képességesek (Gólszerzés) |
| ⭐ | Sztárom a párom | **ő dönt** | a sztár |

**Minden attribútum-mérés az 1.0.6.1.02-es mércével megy**: a játékosaink
attribútuma a meccserő-többlettel felskálázva, az ellenfél meccserejéhez mérve.

**A szintek:**
- **1. szint:** a lánc él (az alábbi számok erre szólnak).
- **2. szint:** a hatás ×1,7.
- **3. szint:** a hatás ×2,5, és megnyílik a pár **saját csavarja**.

**Az erő plafonja:** a 3. szinten meccsenként legfeljebb **~0,30
gólkülönbség**. Ez nagyjából +2,5 meccserőnek felel meg, egy III. sávú
csapaterő-képesség csúcsának.

**Megjelenés:** minden lánc-gól saját közvetítési sort és rövid jelenetet kap
(az akció-képességek animációs rendszerén), az edzői elemzésben pedig saját
gólforrásként (🔗) szerepel.

---

## 3. A 28 pár

Jelölés: 🔥 Bombázók · 🛡️ Beton · ⚡ Villám · 🌀 Tiki-Taka · ☯️ Harmónia ·
🧲 Gegenpressing · 💥 Panzer · ⭐ Sztár.

| # | pár | név | a lánc (1. szint) | 👑 3. szint csavarja |
|---|---|---|---|---|
| 1 | 🔥🛡️ | **Ellentámadás-ágyú** | Minden kivédett ellenfél-helyzet után 6% eséllyel azonnali ellentámadás, amit egy gól-képességes fejez be (a Gólszerzése méri). | A gól után a busz 10 percre automatikusan beáll. |
| 2 | 🔥⚡ | **Roham** | Meccsenként 1 roham: a két leggyorsabb szélső elfut, a 3 legjobb Gólszerzés közül egy lő. A Sebesség és a Gólszerzés átlaga méri. | Ha a roham gól, a meccsen +1 roham jár. |
| 3 | 🔥🌀 | **Ostromgyűrű** | A passzsor végén nem az lő, akinél épp a labda van, hanem a pályán lévő 3 legjobb Gólszerzés jobbika; a befejezés fala −8%. | A megszakadt passzsor 30%-ban lövéssel folytatódik. |
| 4 | 🔥☯️ | **Lendület** | Minden gólunk után 10 percig +4% gólesély, ha a csapategyensúly ≥ 70%. A kiegyensúlyozott csapat nem esik szét a rohamban. | Az ellenfél gólja sem töri meg a lendületet, csak megállítja. |
| 5 | 🔥🧲 | **Csapda** | Minden pressing-labdaszerzés 8% eséllyel azonnali lövést hoz egy gól-képességestől; ez képesség-gólnak számít (a gólétvágy élesedik tőle). | A csapda-gól nem számít bele a Büntetés meccsenkénti plafonjába. |
| 6 | 🔥💥 | **Ostromzár** | Az ellenfél minden lapja után a következő 5 percben egy lövés-sorozat (meccsenként legfeljebb 1). | A Félelem az ellenfél lövéseit is gyengíti: 10 pontonként −1% (legfeljebb −6%). |
| 7 | 🔥⭐ | **Hóhér** | A sztár gólja után az ellenfél félelme +5 a meccsen, és 10 percig az ellenfél gólesélye −5%. | A sztár mesterhármasa után a meccs „lezárva”: ellenfél −12% a lefújásig. |
| 8 | 🛡️⚡ | **Kontra a falról** | Minden kivédett ellenfél-helyzet után 6% eséllyel villámkontra: a leggyorsabb szélső viszi, a Sebessége méri. | A busz ára (a mi gólesélyünk csökkenése) feleződik. |
| 9 | 🛡️🌀 | **Labda-pihentetés** | Vezetésnél minden 8+ passzos sor −3% ellenfél-gólesélyt ad a következő 10 percre: kihúzzuk az időt. | A hatás halmozódik, legfeljebb háromszor. |
| 10 | 🛡️☯️ | **Jéghideg vezetés** | Egygólos vezetésnél ellenfél-gólesély −6%, ha a csapategyensúly ≥ 70%. | Kétgólos vezetésnél is él, és a lefújáskor +3 morál. |
| 11 | 🛡️🧲 | **Fojtás** | Abban a pressing-ütemben, amelyikben labdát szereztünk vissza, az ellenfél gólesélye −3%. | A pressing labdaszerzés-esélyét a Védekezés átlaga is emeli, nem csak a Sebesség. |
| 12 | 🛡️💥 | **Acélfal** | A Félelem szint nem fogy kapott gól miatt, és az ellenfél lövései gyengülnek: 10 pontonként −1% (legfeljebb −5%). | Minden kapott gól nélküli meccs után +2 Félelem pont. |
| 13 | 🛡️⭐ | **A bunker királya** | Amíg nem kaptunk gólt, a sztár gólsúlya ×1,3. | A sztár gólja után a busz azonnal beáll. |
| 14 | ⚡🌀 | **Pengeváltás** | A passzsor 5. passza után, ha szélső kapja a labdát, a sor száguldásba fordul: a befejezést a Sebesség és a Gólszerzés jobbika méri. | A passzsor lépésenkénti Passz-átlagába a Sebesség 25%-a is beszámít. |
| 15 | ⚡☯️ | **Végtelen motor** | Kiegyensúlyozott csapatnál (≥ 70%) a hajrában (75. perctől) a sebesség-képességek hatása ×1,2. | A leglassabb szélső Sebessége a meccsen a csapatátlagra emelkedik. |
| 16 | ⚡🧲 | **Villámcsapás** | Minden pressing-labdaszerzés 8% eséllyel azonnali villámkontrát indít: a leggyorsabb fut, a Sebessége méri. | A villámcsapás-gól után a pressing következő üteme dupla esélyű. |
| 17 | ⚡💥 | **Lavina** | Minden sebesség-alapú gól után +3 Félelem pont a meccsen. Félelem ≥ 30 mellett a szélsők Sebessége +3%. | Győzelem után a Félelem szint +2 extrát kap. |
| 18 | ⚡⭐ | **A sztár futópályája** | A szélsők gólpassz-esélye a sztárnak ×1,25. | Ha a sztár sebesség-alapú gólt lő, a meccsen +1 villámkontra-esély (6%) jár. |
| 19 | 🌀☯️ | **Szimfónia** | Csapategyensúly ≥ 75% mellett a passzsor minden passza +0,5% befejezést ad. | A kiegyensúlyozott csapat sora nem szakadhat meg a 3. passz előtt. |
| 20 | 🌀🧲 | **Labdakör** | A pressing-labdaszerzés után azonnal rövid passzsor indul, 3 passz előnnyel (meccsenként 1). | 2 alkalom meccsenként. |
| 21 | 🌀💥 | **Megfélemlítő kör** | A Félelem gyengíti a passzsor ellenállását: 10 pontonként −1% (legfeljebb −5%). | A megszakadt sorok 25%-a ellenfél-lapot hoz (+Félelem), és a sor újraindul. |
| 22 | 🌀⭐ | **A rendező** | Ha a sztár érinti a labdát a sorban, az utána következő passz nem szakadhat meg; a befejező 50% eséllyel ő. | A befejezés fala −8%, ha a sztár a sorban van. |
| 23 | ☯️🧲 | **Zen-pressing** | Kiegyensúlyozott csapatnál a pressing nem hoz sárga lapot, és a hajrában a Büntetés esélye +10%. | A Mérgezett egér 70. perc utáni sérülés-veszélye eltűnik. |
| 24 | ☯️💥 | **Hideg düh** | Csapategyensúly ≥ 70% mellett a kiállítás utáni gólesély-büntetés −25%. | A Peace on you! piroslap-ára −40%. |
| 25 | ☯️⭐ | **Csapatsztár** | A sztár nem nyomja el a többieket: a kiszolgálás ára (a többi gólszerző esélyének csökkenése) −30%. | A sztár morálja a csapat morál-padlója: senki nem eshet 10 ponttal alá. |
| 26 | 🧲💥 | **Vasmarok** | Minden pressing-labdaszerzés +1 Félelem pont a meccsen. Félelem ≥ 30 mellett a labdaszerzés esélye +6%. | A meccsen szerzett Félelem-pontok fele a következő meccsre is átjön. |
| 27 | 🧲⭐ | **Sztár-roham** | A sztár meccsenként egyszer egyéni pressing-rohamot indít: elveszi a labdát, elfut, lő. A Sebesség és a Gólszerzés átlaga méri. | 2 roham, a második a hajrában; a sztár pressing-súlya ×2. |
| 28 | 💥⭐ | **Megközelíthetetlen** | A sztár ellen kapott ellenfél-lapok 20%-a tizenegyest hoz. | A sztár tizenegyesét a Félelem szint is segíti. |

---

## 4. Nyitott kérdések (a te döntésed)

1. **Az ár:** 90 / 150 / 240 pont rendben van?
2. **Az erő plafonja:** ~0,30 gólkülönbség meccsenként a 3. szinten. Ennyi
   legyen, vagy érezhetőbb?
3. **A választó 3 stílusnál:** a 3. stílus felvételekor már választani kell a 3
   pár közül. Így értetted, vagy 3 stílusnál magától éljen egy pár (például az
   elsődleges és a másodlagos), és csak a 4. stílustól legyen választás?
4. **Módosítások:** melyik pár ötletét cserélnéd vagy írnád át?
