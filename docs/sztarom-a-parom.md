# ⭐ Sztárom a párom — híresség, négy új képesség, sztár-gazdaság

*(3.3.30. A stílus alaprétegét a `csapatepitesi-stilusok.md` írja le; ez a
dokumentum az arra épülő HÍRESSÉG-rendszert, a négy új képességet, a bajnoki
egyéni listákat és a sztár körüli gazdaságot írja.)*

## 0. Egy mondatban

A filozófia eddig a sztár SZÁMAIT mérte (Rating, képesség, díj, meccsszám) —
mostantól a HÍRNEVÉT is méri, és a hírnévből **pénz lesz**: reklám, tömeg,
befektető. Cserébe a sztár bére kiugróan nagy, és a keret-bér plafonja **rá nem
vonatkozik**.

---

## 1. A híresség — három forrás

| Forrás | Mérték |
|---|---|
| **A) Kommentátori megjegyzés** | 1 pont / megjegyzés |
| **B) A meccs embere** | 1-5 pont a sorozat rangja szerint, szorzókkal |
| **C) Egyéni díj** | 1-15 bázis × **a mezőny szintje / 5** |

### A) Kommentátori megjegyzés

**Nem a gól maga.** A gólhoz tartozó *ízesítő* sor ér pontot: a „BOMBAGÓL!", a
„Vakon is megtalálják egymást", a díj-idézet. A motorban ezek a `budgeted`
jelzővel érkező sorok, és a **gólonkénti jegyzet-keret** (`GOAL_NOTE_BUDGET = 3`)
magától gondoskodik a kért felső korlátról: egy gólra legfeljebb három megjegyzés
jut. Ezért nincs külön számláló — *a keret AZ a szabály*.

> **3.3.34 — javítva: a megjegyzések fele nem számított.** A beszámítás eddig
> **a sor SZÖVEGÉBEN kereste a sztár nevét**. Csakhogy a gólhoz fűzött sorok
> java nem mondja ki a nevet — „Gólzsák *(2/3)* — érződött a rutin", a
> taktika- és sebesség-ízek, a kártyaszint-idézetek —, pedig mind az ő
> góljáról szólnak. Ezek némán kiestek.
>
> Mostantól a jegyzet-keretnek **gazdája** van (`goalNoteOwner`): ha a gólt a
> sztár szerezte, **minden** hozzáfűzött megjegyzés számít, akkor is, ha nem
> nevezi meg. A név szerinti egyezés megmaradt második útnak — az viszi tovább
> azt az esetet, amikor MÁS gólja körül esik szó róla (gólpassz, kémia-páros).
>
> **A lépcsőt ez nem mozdítja.** A `tools/fame-sim.js` eleve név-szűrő nélkül,
> gólonként 0-3 megjegyzéssel mérte a tempót (`COMMENT_DIST`, átlag 0,86
> jegyzet/gól) — vagyis a mért ív és a rá épülő mérföldkő-lépcső **mindig is
> ezt a viselkedést feltételezte**. A javítás a kódot hozza a mérés mellé, nem
> a mércét mozgatja.
>
> **És mostantól látszik is.** A kommentár-pontok némán gyűltek: a
> `fameAdd` naplója csak 3 pont fölött szólal meg, egy megjegyzés pedig 1
> pontot ér. Gólonként egy összesítő sor megy ki — *„⭐ Híresség: **+2** pont —
> a góljához fűzött megjegyzések. Összesen 47."* — a jegyzetek után, a
> következő esemény előtt. Megjegyzésenként egy sor szétvágná a közvetítést; a
> keret (3) miatt a szám úgyis kicsi.

A **3., 4., 5. és 6+. gól** saját, hangsúlyos kommentárt kap a motorban
(mesterhármas, „NÉGY GÓL EGY MECCSEN", …) — ezek fejenként **3 pontot** érnek.

### B) A meccs embere

| Sorozat | Bázis |
|---|---|
| bajnoki | 1 |
| bajnoki **rangadó** | 2 |
| Magyar Kupa | 2 |
| Konferencia-liga | 3 |
| Európa-liga | 4 |
| Bajnokok Ligája | 5 |

Szorzók: az **európai kupák kieséses szakaszában ×1,5**, a **döntőben ×4**.
A kettő **nem szorzódik össze** — a döntő is kieséses, tehát a nagyobb szorzó él
(BL-döntő = 5 × 4 = 20 pont, nem 30). A Magyar Kupa kieséses köreire nincs
szorzó: az egész sorozat kieséses, a rangját már a 2-es bázis kifejezi.

### C) Egyéni díj

| Díj | Bázis |
|---|---|
| bajnoki gólkirály / gólpasszkirály / kapus-király | 1 |
| Magyar Kupa ugyanezek | 1 |
| Konferencia-liga | 1,5 |
| Európa-liga | 3 |
| Bajnokok Ligája | 10 |
| **Aranylabda** | 15 |

Mindet **a mezőny szintje / 5** szorozza. Egy 84-es mezőnyön ez ×16,8, egy
120-ason ×24.

> **Kimondott következmény.** Ezzel a szorzóval egy megnyert díj nagyságrenddel
> többet ér, mint egy egész idénynyi kommentár és MVP együtt: a premier ligás
> forgatókönyvben a pontok **82%-a** a díjakból jön. Ez így volt kérve — a díj a
> karrier csúcspontja, nem egy tétel a sok közül. A mérföldkő-lépcső ehhez a
> tempóhoz igazodik.

---

## 2. Mérés — milyen tempóban jönnek a pontok

`tools/fame-sim.js`, 400 szimulált idény forgatókönyvenként. A szimuláció nem
becsül: ugyanazokkal a számokkal játssza le a szezont, amikkel a motor dolgozik
(gólvárhatóság, gólszerző- és gólpassz-súlyok, a meccsember képlete), és a
mezőny AI-csapatai is ugyanígy termelik a saját góllövőlistájukat — a gólkirályi
cím esélye tehát **mért** szám.

| Forgatókönyv | gól | gp | MVP | komment | MVP-pt | díj-pt | **össz/idény** |
|---|---|---|---|---|---|---|---|
| NB II · feltörekvő sztár | 22,5 | 6,0 | 9,4 | 23 | 12,4 | 0,9 | **51** |
| NB I · beérett sztár | 30,2 | 8,1 | 11,8 | 32 | 20,9 | 29,7 | **82** |
| másodosztály · kontinentális | 30,8 | 8,5 | 11,6 | 33 | 22,0 | 175 | **231** |
| premier líg · világklasszis | 33,4 | 8,8 | 12,3 | 37 | 24,5 | 280 | **341** |
| Infinity 120 · legenda | 35,5 | 9,6 | 12,2 | 41 | 24,5 | 455 | **521** |

Kumulálva, egy szinteket lépő karrierben: **1. idény 51 · 3. 154 · 6. 423 ·
8. 1 034 · 10. 1 653 · 13. 2 949 · 16. 4 615 · 20. 6 771**.

A görbe erősen gyorsuló, mert a díjak szint-szorzója fölfelé nyílik.

---

## 3. A mérföldkő-lépcső

A mért ívre épül (`sz_fame` család, kilenc fokozat):

| Fokozat | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| **küszöb** | 50 | 150 | 350 | 750 | 1 500 | 2 500 | 4 000 | 6 000 | 9 000 |
| **stíluspont** | 2 | 2 | 3 | 5 | 8 | 10 | 20 | 20 | 32 |
| *mikor* | 1. idény | 3. | 5. | 7. | 10. | 12. | 15. | 18. | 24+. |

Mellette egy induló mérföldkő (`sz_s_fame`, „Beszélnek róla", 20 pont, 3
stíluspont) — hogy az első idényben is legyen visszajelzés.

**Miért ez a lépcső:** az első fokozat az első idény végére magától megvan, a
középső fokozatok 5-12 idény között jönnek, a legfelső egy Infinitybe nyúló
életmű. A család végig ad visszajelzést — nem fullad ki a 6. szezonban, és nem
is teljesíthetetlen.

---

## 4. Híresség-szintek

Hat fokozat. **Nem adnak játékerőt** — kizárólag a gazdasági eseményeket nyitják.

| Szint | Küszöb | Név | *mikor* |
|---|---|---|---|
| 1 | 0 | 🙂 Helyi kedvenc | azonnal |
| 2 | 120 | 📰 Ismerik a nevét | ~2. idény |
| 3 | 400 | ⭐ Országos sztár | ~6. idény |
| 4 | 1 000 | 🌍 Kontinentális név | ~8. idény |
| 5 | 2 500 | 🌟 Világsztár | ~13. idény |
| 6 | 5 000 | 👑 Élő legenda | ~17. idény |

---

## 5. A négy új képesség

| Képesség | Szint | I | II | III |
|---|---|---|---|---|
| **Boooooost!** | 1 | ifi-boost 25 éves korig | 28-ig | 31-ig |
| **Fejlődés gyorsítás** | 2 | +20% egy választott attribútumra | +33% | +55% |
| **Sztár jóga** | 2 | ±25%-ig tolható | ±50% | ±75% |
| **Nem öregszik!** | 3 | 4 évente kimarad egy év | 3 évente | 2 évente |

### Boooooost!

Az ifi-boost eddig kizárólag akadémistára ment (`youthBonus > 0` **és**
legfeljebb 23 éves) — a kinevelt sztár pont akkor esett ki belőle, amikor a klub
köré épült. A képesség egy emberre kinyitja. **Három** helyen dönt ugyanaz a
predikátum (`canYouthBoost`): a HUB gombjánál, a jelöltlistánál és a
**TSI-plafonnál**. Az utolsó a fontos: a boost ajándéka a TSI-ugrás, és a
felnőtt `TSI_SOFT_CAP` némán elnyelné.

### Fejlődés gyorsítás

Egy attribútumot választasz (a képesség kártyáján, bármikor átírható), és a
sztár abban az egyben gyorsabban fejlődik. A szorzó a **közös attribútum-
csatornára** ül (`addA`), tehát egyszerre hat az edzéstervre, a személyi edzőre,
a képesség-alapú képzésre és a pályán szerzett pontokra. Csak a **pozitív**
fejlődést szorozza; a plafont nem mozdítja.

### Sztár jóga

A sztár gólszerző képességei gólpasszadóvá alakíthatók és fordítva,
**képességenként külön skálán**. A számítás a szorzó **többletét** mozgatja: egy
3,7-es gólesély-szorzó többlete 2,7, és 50%-os eltolásnál ebből 1,35 vándorol át
— a képesség 2,35-ös gólesélyt **és** 2,35-ös gólpassz-esélyt ad. Az összhatás
megmarad, csak más csatornán jön ki: a képesség nem erősít, hanem **átalakít**.
Ezért nincs szintenkénti erő-növekedés sem — a szint kizárólag a mozgásteret
adja.

### Nem öregszik!

N évente egy idényben kimarad az öregedés: a kor nem lép, tehát a kor-görbe sem
húz lefelé, és a fejlődési szorzói is a fiatalabb sávban maradnak. Nem
halhatatlanság — a pályafutást nagyjából **25 / 33 / 50%-kal** nyújtja meg. A
számláló a stílus-állapotban él, és a szezonváltás egyetlen pontján fordul.

---

## 6. A bajnokság egyéni listái

**Ami hiányzott:** a kupasorozatnak a kezdetektől van egész mezőnyre szóló
egyéni statisztikája (ebből lesz az Aranycipő, az Aranypasszok, az
Aranykesztyű) — a bajnokságnak nem volt. „Gólkirály" a bajnokságban nem
létezett.

**Hogyan áll össze.** A tabella AI-vs-AI meccseit a `buildLeagueTable`
szimulálja, seedelt folyamból. A góllövőlista **ráül erre**: az `onSimMatch`
visszahíváson át pontosan azokat az eredményeket kapja meg, amiket a tabella is
könyvel, és csak azt dönti el, **ki** szerezte a gólokat. Ha újraszimulálna, a
két kimutatás elcsúszna egymástól — így viszont soha nem mondhatnak mást
ugyanarról a mérkőzésről. *(Mérve: a mezőny 670 gólja a tabellán, 670 a
listán.)*

Három forrásból épül minden sor: a te elleni valós meccsek, a mezőny egymás
elleni szimulált meccsei, és a saját kereted bajnoki vödrei
(`S.scorers` / `S.assists` / `S.lgCS` — az utolsó új, és **kizárólag** bajnoki
tiszta lapokat gyűjt, csak a kapustól).

**Hol látszik:** Menetrend és tabella → a tabella alatt, három lista.

**A díjak.** A szezon lezárásakor mindhárom lista élén álló játékos díjat kap;
ha a tiéd, tartós képességet is — a **BL-díj harmadát**:

| Díj | Hatás | (BL-párja) |
|---|---|---|
| 🏅 Bajnoki gólkirály | gólesély ×2,67 · +1,7 Rating | (×6 · +5) |
| 🏅 Bajnoki gólpassz-király | gólpassz ×2,67 · +1 Rating · MVP ×1,17 | (×6 · +3 · ×1,5) |
| 🏅 Bajnoki kapus-király | ellenfél gólesélye ×0,94 · +0,83 aura | (×0,82 · +2,5) |

A harmadolás a **többletre** vonatkozik (6,0 → 1 + 5,0/3 = 2,67), az
összeadódóknál magára az értékre. A díj beleszámít az **Aranylabda**
szavazásába (a `ballonAwardsOf` mostantól a bajnoki díjakat is látja), de
**nem** a `goldenAwardCount`-ba: az a BL-díjak halmozódását méri (2. díjtól
tartós +3 Rating és kék karika), és egy harmadértékű hazai díjnak ugyanazt adni
elinflálná a rendszert.

---

## 7. A sztár gazdasága

### 7.1 A bér — a plafonon kívül

A kijelölt sztár bére nem a Rating-kulcsból jön, hanem a **hírnevéből**: a heti
szurkolói bevétel arányában áll, és a híresség növekedésével **25%-ról 400%-ig**
nő (kitevő 0,8 — az első idényekben gyorsan, a tetején lassulva).

| Híresség | 0 | 400 | 1 000 | 2 500 | 5 000+ |
|---|---|---|---|---|---|
| **a heti lelátó %-a** | 25% | 75% | 129% | 240% | 400% |

**A keret-bér plafonja rá nem vonatkozik.** A plafon (sikeres idény után a
lelátó 50%-a) a *többiekre* ül, a sztár fizetése azon **felül** áll — így a
csapatbér a feltételek teljesülése ellenére is túllépheti az 50%-ot, és a
túllépésnek egyetlen, a számlán külön kiírt oka van.

### 7.2 A hírnév pénze

Mindhárom a mérkőzés utáni heti elszámolásban dől el.

| Esemény | Mérték | Idényenként | Kapu |
|---|---|---|---|
| 🎺 **Szurkoló-robbanás** | a törzsközönség 20-250%-a | max 4 | — |
| 📣 **Reklámbevétel** | a heti lelátó 100-700%-a | 2 → 8 | a plafon a híresség-szinttel nyílik |
| 💼 **Befektető** | a heti lelátó 1 000-10 000%-a | max 1 | 3. híresség-szint **és** legalább a 2. idény, mióta ő a sztár |

### 7.3 Az egyetlen eltérés a betű szerinti olvasattól

A robbanás a **szerves** táborhoz mér (a tábor mínusz az, amit a sztár hírneve
már behozott), nem az élőhöz.

**Miért — mérve.** Ha az élő táborhoz mérne („az aktuális szurkolószám
20-250%-a"), idényenként ~3 robbanás egyenként ~135%-kal **önmagát szorozná**:

| idény | 1 | 3 | 5 | 8 | 12 |
|---|---|---|---|---|---|
| tábor (élőhöz mérve) | 114 e | 5,5 M | 522 M | 3 · 10¹² | 9 · 10¹⁷ |
| tábor (szerves alaphoz mérve) | 65 e | 213 e | 416 e | 773 e | 1,28 M |

A gazdaság minden ága a lelátóból számol (bér, plafon, büdzsé), tehát a bal
oszlop néhány idény alatt értelmét vesztené. A jobb oszlopban a hatás így is
óriási — egy robbanás a törzsközönség negyedét–két és félszeresét hozza —, de a
növekedés **lineáris** a robbanások számában, nem exponenciális.

Ez az **egyetlen** pont, ahol a megvalósítás eltér a betű szerinti olvasattól.
Ha mégis a lavina kell: a `fameRevenueTick` robbanás-ágán a `fameOrganicFans()`
helyére `fanBase()` írandó.

### 7.4 A mért mérleg

80 futás átlaga, 34 meccs/idény, 30 000 fős induló tábor, a fenti híresség-ívvel
(pont / mérkőzés-pont; 1 pont = 2 M Ft):

| idény | híresség | szurkoló | bér% | kapubevétel | hírnév-bevétel | sztár bére | mérleg |
|---|---|---|---|---|---|---|---|
| 1 | 51 | 77 e | 35% | 8 938 | 986 | 1 763 | +8 161 |
| 3 | 154 | 183 e | 48% | 24 824 | 5 764 | 2 457 | +28 131 |
| 6 | 423 | 397 e | 77% | 61 535 | 76 784 | 3 927 | +134 392 |
| 10 | 1 653 | 821 e | 180% | 130 540 | 163 055 | 9 164 | +284 431 |
| 15 | 4 050 | 1,44 M | 342% | 235 025 | 318 340 | 17 433 | +535 932 |
| 20 | 6 771 | 2,13 M | 400% | 350 619 | 594 195 | 20 400 | +924 414 |

**Amit ez mutat, és amit érdemes tudni.** A bér százaléka a *szerves* lelátóhoz
mért — ez volt a kérés („ne rántsa magával a szurkolói bevétel a fizetését").
Következmény: ahogy a robbanások felduzzasztják a tábort, a sztár bére a
**tényleges** bevételhez képest egyre kisebb hányad lesz (a 20. idényben a
400% már csak a valós kapubevétel ~6%-a). A „csapatbér az 50% fölé megy miatta"
tehát az **első öt-hat idényben** él igazán — ott a bére a kapubevétel
35-77%-a —, később a hírnév bőven kitermeli önmagát.

Ha az a szándék, hogy a sztár a karrier VÉGÉN is megterhelje a kasszát, egyetlen
sor kell: a `fameWageAnchor()` a `fameOrganicFans()` helyett a `fanBase()`-ből
dolgozzon. Akkor viszont a 7.3 pont figyelmeztetése is visszatér — a robbanás
megint a saját bérét emelné.

---

## 8. Hangoló számok

Mind egy blokkban, a `A HÍRESSÉG — „Sztárom a párom"` szakasz tetején:

`FAME_COMMENT_PT` 1 · `FAME_HAUL_PT` 3 · `FAME_MVP_BASE` {liga 1, rangadó 2,
MK 2, KL 3, EL 4, BL 5} · `FAME_MVP_KO` 1,5 · `FAME_MVP_FINAL` 4 ·
`FAME_AWARD_BASE` {liga 1, MK 1, KL 1,5, EL 3, BL 10, Aranylabda 15} ·
`FAME_DIFF_DIV` 5 · `FAME_LEVELS` 0/120/400/1000/2500/5000 ·
`FAME_SURGE_MAX` 4 · `FAME_SURGE_PCT` 0,20-2,50 · `FAME_AD_PCT` 1,0-7,0 ·
`FAME_AD_MAX` 2/3/4/5/6/8 · `FAME_INV_PCT` 10-100 · `FAME_INV_LEVEL` 2 ·
`FAME_INV_MIN_SEASONS` 2.

A bér oldalán: `WAGE_STARDOM_MIN` 0,25 · `WAGE_STARDOM_MAX` 4,00 ·
`WAGE_STARDOM_FULL` 5000 · `WAGE_STARDOM_POW` 0,8.

---

## 9. Nyitott kérdések

1. **A díj-szorzó léptéke.** A `szint / 5` mellett a díjak adják a pontok
   75-88%-át a 7. idénytől; a kommentár és az MVP ág ekkorra dekorációvá
   halványul. Ha a három forrás egyensúlya a cél, a `FAME_DIFF_DIV` 100-ra
   állítva a díjak részaránya ~31%-ra esik (mérve), és mindhárom ág végig
   számít. Egyetlen konstans.
2. **A sztár bérének horgonya** — lásd 7.4. A jelenlegi választás a kérés betűjét
   követi; az ára, hogy a késői karrierben a 400% már nem terhelő.
3. **A kommentár-arány feltevés.** A szimuláció `COMMENT_DIST` konstansa
   (0 megjegyzés 42%, 1 → 36%, 2 → 16%, 3 → 6%) egy kiépült sztárra van szabva.
   Ez a szimuláció EGYETLEN nem mért bemenete; a valós arány a képességektől,
   párkémiáktól és díjaktól függ.
