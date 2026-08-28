# Forma-rendszer és a lenyitható játékos-panel

*(3.7.28 — a forma-rendszer és a lenyitható panel; 3.7.29 — a Ritmusmester és
a HUB görgetés-horgonya; 3.8.12 — az ötmeccses sűrűség. Érintett kód:
`pformRefresh`, `pformTick`, `PFORM_EVERY`, `pformSeasonReset`, `pformOf` /
`pformStep` / `pformPct` / `pformMult` / `pformEdge` / `pformPickMult`,
`pformBaseline`, `pformRecent`, `pformTeamForm` / `pformTeamSignal`,
`pstatPush` / `pstatHistoryHtml`, `pformBarsHtml` / `pformRowHtml` /
`pformDetailHtml`, `hdMark` / `hdSectionize` / `hdBindSections`; bekötés a
`buildMatchSnapshot`-ban, a `weightedPick`-ben, a checkpoint-ágban, a
`fullTime` végén és a `startNextCareerSeason`-ben. 3.7.29: `PFORM_COACH_PULL` /
`PFORM_COACH_FLOOR`, a `COACH_TYPES` „form" bejegyzése és a `coachEffectLines`
előnézete, valamint `hubKeepRowAnchor` / `hubScrollerOf` a keretlista-soron.)*

## Volt már forma — csak egyetlen napra szólt

A motorban eddig is volt forma: a kezdőrúgáskor kisorsolt jó és rossz formájú
ember (±`SIM.FORM`). Az **megmarad** — az a mérkőzés napi hangulata —, csak a
szövege lett pontosabb, mert most már van mitől megkülönböztetni:

```
▲ Csúcsformában ezen a meccsen: Pepe · ▼ Nem érzi a labdát ezen a meccsen: Higuaín
```

Mellé került egy **tartós** állapot: hol tart most ez a játékos a saját
hullámán.

## A skála

**Tizennégy fok**, ugyanaz a felbontás, mint a meccsvégi értékelésé (hét
csillag, fél lépésekben). A közép a **7,5**. A kijelzés egy hangerő-mérő:
tizennégy vékony oszlop, balról jobbra növekvő magassággal, pirosból zöldbe.

A növekvő magasság nem dísz: a szélek így akkor is megkülönböztethetők, ha
valaki nem látja a színkülönbséget — **a szín önmagában sosem lehet az egyetlen
jel**.

A skála ott van a **keretlistán minden soron** (ott dől el a felállítás, tehát
ott kell látni) és a játékos lapján, a hatás számával együtt.

## A hatás

| fok | teljesítmény | eredményesség |
|--:|--:|--:|
| 1 | **−15,0%** | −3% |
| 4 | −8,1% | — |
| 7 / 8 | ∓1,2% | — |
| 11 | +8,1% | — |
| 14 | **+15,0%** | +3% |

Lineáris a két szél között: `(v − 7,5) / 6,5 × 15`. A félskálák közepén (4 és
11) ez pontosan a kért ±8%.

**A teljesítmény-szorzó a `contrib`-on ül, nem a `pOvr`-ben.** A forma a MAI
teljesítményt írja, nem a játékos értékét: a keretlistán, a piacon, a
szerződésnél tehát ugyanaz a Rating marad — a különbség a pályán jön ki.

**Az eredményesség-ráadás poszthelyes.** Az 1-3 és 12-14 fokon álló ember
±3%-kal gyakrabban lesz a gól, a gólpassz, a tizenegyes vagy a kapufa embere —
ez a `weightedPick`-ben ül, mert **minden** ilyen sorsolás azon az egy
függvényen megy át, tehát nem maradhat ki egy sem és nem is duplázódhat. A
védőké és a kapusé nem ott dől el: az ő „eredményességük" a kapott gólok
oldala, azt a pillanatkép `defMult`-ja viszi — a hátsó sor formaéleinek
**átlagával** (öt ember nem ötszörözheti meg a hatást).

## Mi táplálja

* a **saját utolsó 7-8 mérkőzésének csillagátlaga** — pontosan az a szám, amit
  a meccs végi ablak is kiírt neki;
* a **csapatmorál**;
* a **csapat formája** — a periódus győzelmei és vereségei, külön súllyal a
  nagy győzelmeknek és a súlyos vereségeknek;
* a **képességek** — az Iránytű (`formlock`) padlót ad: sosem eshet a közép
  alá, és fölfelé is húz; a szituatív csatornák (gól-, gólpassz-, védő-súly)
  apró, de valós jel;
* és egy **egyéni véletlen**, ami nélkül a rendszer determinisztikus volna.

### MÉRT HIBA: a forma önmagát erősítette

Az első változat a csillagátlagot a **fix 3,5-ös alaphoz** mérte. Csakhogy a
csillag maga is a keret erejéből származik (lásd a `mstatRate` „rating" és „a
csapat éle" tételét): egy erős csapat **mindig** 5,5 csillag körül jár. A forma
tehát nem azt mérte, hogy jól megy-e most valakinek, hanem hogy **jó
játékos-e** — és mivel a forma vissza is hat a teljesítményre, a kör bezárult.

Mérve, nyolc győzelem (öt nagy) után:

| | forma-fokok | csapat meccs-erő |
|---|---|--:|
| **abszolút mérce** (hibás) | 9 9 9 9 10 10 11 11 11 11 12 | 87,9 → **94,5 (+6,5)** |
| **saját mérce** (javított) | 7 8 8 8 8 8 9 9 9 9 10 | 89,1 → **91,1 (+2,0)** |

**A forma definíció szerint relatív**: nem az, hogy jó vagy, hanem hogy a saját
szokásos szintedhez képest hol tartasz. Ezért a mérce a játékos **hosszabb távú
átlaga** (`pformBaseline`, a teljes tárolt története), és a forma ehhez képest
mozdul. Aki mindig 5,5-öt hoz, annál a jel 0 — középen marad; aki 5,5-ről
4,2-re esett, az hullámvölgybe kerül, akármilyen erős csapatban játszik.

**Ugyanez a csapat jelére is igaz** (`pformTeamSignal`): egy mindig nyerő
csapatnál a periódus nyolc győzelme nem jó forma, hanem a szokásos — a jel
ezért a periódus mérlege az **idény egészéhez** képest.

**A mérce csak az ÉRTÉKELT meccseket látja (3.7.33).** A 15 percnél rövidebb
beállás nem kap csillagot (lásd
[`meccs-statisztika.md`](meccs-statisztika.md) — „A rövid beállás"), és a
formába sem szólhat bele: se jó, se rossz jelet nem hordoz. A `pformBaseline` és
a `pformRecent` ezért a `pstatRatedOf` szűrőjén át olvas — a periódus-ablak is
az utolsó `n` **értékelt** mérkőzés, nem az utolsó `n` bejegyzés. Régebbi
mentésekben minden bejegyzésnek van értékelése, tehát ott a szűrő mindent
átenged.

### …és nem csúszik együtt az egész keret

A csapat-szintű tételek (morál, eredmények) mindenkire ugyanúgy hatnak, tehát
önmagukban egy vereségsorozat **mindenkit** lehúzna — egy jó sorozat pedig
mindenkit feltolna, ami magától megnyerné a következő szezont is. Ezért a
kiszámolt elmozdulások **közös részét visszavesszük** (`PFORM_DAMP` = 0,60):
marad a csapat-hangulat jele, de a keret nem egyetlen tömbként mozog.

Mérve a javított rendszerrel: a tizenegy forma-foka **7 és 10** között szóródott
egy tökéletes, nyolc győzelmes periódus után is.

## Az időzítés — ötmeccsenként (3.8.12)

**Bejelentett kérés:** *„Legyen gyakrabban frissítve a forma, hogy legyen
lehetőség egy szezonon belül felkúszni egy játékosnak a max formára is akár.
A sűrűség legyen 5 meccsenkénti."*

**Ami volt.** A frissítés a kihívás-**checkpointokon** futott (8./15./23.
forduló), vagyis egy 30 fordulós idényben **mindössze háromszor** — plusz
kupasorozat alatt meccsenként. Három lépés a 7,5-es középről indulva még a
legjobb sorozattal is épphogy elért a csúcs közelébe, és csak akkor, ha a
célérték végig a plafonon állt. A csúcsforma gyakorlatilag elérhetetlen volt.

**Ami lett.** Egy egyszerű számláló (`S.pFormN`), amit **minden lejátszott
mérkőzés** léptet: bajnoki, kupa, osztályozó, felkészülési torna. Minden
ötödiknél (`PFORM_EVERY`) fut a frissítés, a `fullTime`-ban, a `pstatPush`
UTÁN — tehát a most lejátszott meccs értékelése már beleszámít az ablakba.

| mikor | miért |
|---|---|
| **minden 5. lejátszott mérkőzés után** | idényenként hat frissítés a három helyett — ennyi lépéssel a célérték felé egy tartós sorozat tényleg felviszi valakit a csúcsra |
| **szezonnyitáskor** | nullázás — **a számláló is** (`S.pFormN = 0`), tehát az új idény első frissítése az 5. meccs után jön, nem ott, ahol a tavalyi számláló épp állt |

**Két korábbi szabály esik ki vele.** A checkpoint-kötés a **bajnoki
naptárhoz** kötötte a formát, holott a forma a *lejátszott meccsekről* szól,
nem a fordulószámról. A kupasorozat meccsenkénti kivétele pedig azért kellett,
mert a kupának nincs checkpointja — egy közös számlálóval a kivétel értelmét
veszti.

**A napló mindkét számot kimondja (3.8.13).** A frissítés sora eddig csak az
ABLAKOT írta ki („az elmúlt 8 mérkőzés alapján"), és emiatt úgy olvasódott,
mintha nyolcmeccsenként frissülne a forma — bejelentett félreértés. A sor
mostantól: *„minden 5. mérkőzés után jön, és az elmúlt 8 mérkőzést nézi"*. A
lépésköz azt mondja meg, MIKOR; az ablak azt, MIBŐL.

**Az ablak (`PFORM_WINDOW` = 8) szándékosan nagyobb a lépésköznél.** Az
egymást átfedő ablakok simítanak: egyetlen rossz meccs nem fordítja meg a
formát, egy tartós sorozat viszont minden ötödik meccsen újra megerősíti
magát — pontosan ez viszi fel valakit a csúcsra egy idényen belül.

**A véletlen magja is a számlálót viszi** (`pform:s…:i…:m…`). A régi mag a
fordulószámból jött, az viszont **kupasorozat alatt áll** (a kupameccs nem
lépteti az `S.idx`-et) — két egymást követő kupa-frissítés ugyanazt a
véletlent kapta volna.

**Mérve** (éles karrieren, 30 mérkőzés): a frissítés az 5., 10., 15., 20.,
25. és 30. meccs után fut le, a szezonnyitás a számlálót nullára viszi, a
játékos lapja pedig pontosan kiírja, hány mérkőzés van a következőig.

**A frissítés az auto/kézi elágazástól függetlenül fut.** A 3.7.28-as első
próbálkozás a `handleCheckpoint`-ba került — az viszont csak a kézi úton fut
le, az auto szezonlejátszás az `autoResolveCheckpoint`-ra ágazik el, tehát a
forma egy végigjátszott idényben **soha nem mozdult volna**. A `fullTime`
mindkét úton lefut, tehát ez a csapda a 3.8.12-vel véglegesen bezárult.

## Szezononként nullázódik

Mindenki középre: **7 vagy 8**, aszerint, hogy az előző idénye a 3,5-ös alap
alatt vagy fölött zárult. A forma nem öröklődik idényről idényre; a nyár
mindent újraír.

A **meccs-történetet szándékosan megtartjuk** — az a HUB követése, és szezonra
bontva továbbra is olvasható.

## Az egyéni meccs-történet

`S.pStat[név]` az utolsó 24 mérkőzés bejegyzéseit tartja: szezon, forduló,
csillag, gól, gólpassz, védés, labdaszerzés, perc, eredmény. A lefújásnál
íródik, a meccsvégi statisztikából (`S.lastMatch.players`) — **egy forrás, egy
igazság**: amit az ablak kiírt, az kerül a történetbe is, és abból számol a
forma. Ugyanaz a szezon+forduló csak egyszer kerül be, tehát egy újratöltés
vagy egy idempotens újrafutás nem duplázhat.

## A lenyitható játékos-panel

A panel egyetlen, több képernyőnyi folyammá nőtt — attribútumok, edzés, TSI,
poszt-térkép, Statzone, skillek, kémia, személyiség —, és a keresett dolog
mindig valahol a közepén volt. Innentől:

```
(mindig látszik)  az attribútum-dobozok
🏋 Edzés és fejlődés
🧭 Poszt, megbízás és TSI
📊 Statisztikák
   └ 📈 Forma
   └ 🗂 Statzone
   └ 🕐 Meccsről meccsre
🎖 Képességek
🔗 Kémia
🙂 Személyiség
```

**A megoldás nem a függvény átírása.** A blokkokat előállító, négyszáz soros
folyam betűre a régi marad; csak **jelölőket** teszünk közé (`hdMark`), és a
végén egy lépésben szekciókra vágjuk (`hdSectionize`). Így a szakaszok
tartalma garantáltan változatlan (nincs mit elrontani egy átmozgatáson), a
bővítés pedig egy sor: ahova jelölő kerül, ott új szekció kezdődik.

A `<details>` **natív**: nincs saját kattintás-kezelő, nincs mit elrontani egy
újrarajzoláson, és billentyűvel is működik. A nyitott állapot a mentésben él
(`S.hubDetOpen`), tehát a következő megnyitáskor ott folytatod, ahol
abbahagytad.

## A Ritmusmester: formaedző a stábban (3.7.29)

A stábban **eddig is volt** `form` típusú edző — a **📈 Ritmusmester** —, csak
egyetlen dolgot csinált: a meccsenkénti jó/rossz forma sorsolását tolta el
(`COACH_FORM_W`). Amióta van tartós, 14 fokú forma, a típus ígéretének
(„Formakezelés — kisebb hullámvölgyek") itt van a helye.

**Pontosan úgy működik, mint a többi edző.** A `coachPower` már magában hordja
a **fókuszt** és az edző minőségét, a fókusz-választó pedig eleve három módot
kínál — **az egész keret, egy posztcsoport, vagy legfeljebb két ember** —,
tehát a „keretre / posztra / játékosra" külön felület nélkül megvolt.

Két dolgot csinál, és a kettő együtt adja a formakezelést:

* **fölfelé húz**, de mértékkel (`PFORM_COACH_PULL` = 1,5 fok teljes erővel);
* **megfogja a mélyrepülést**: a fókuszáltjai nem eshetnek a padló alá
  (`PFORM_COACH_FLOOR` = 6). A padló a **közép alatt marad** — jó formát nem
  garantál, csak a gödröt tölti fel.

### MÉRT HIBA: a csillapítás kioltotta az edzőt

Az első változat a **célértékhez** adta hozzá az edző erejét — és a mérőn
kiderült, hogy egy **teljes keretre** állított csúcsedző így pontosan semmit
nem ért: 4,30 → **4,31**. Az ok szerkezeti: a keretre szóló húzás mindenkinél
**ugyanaz**, tehát épp az a „közös rész", amit a divergencia-csillapítás
szándékosan kivon.

A csillapítás a csapat **hangulatának** együttmozgása ellen való, nem a
menedzser tudatos befektetése ellen — az edző hatásának tehát a csillapítás
**után** van a helye.

Mérve a javítás után, mindenkit 3,0-ról indítva:

| fókusz | a fókuszáltak | a többiek |
|---|---|---|
| nincs edző | átlag 4,08 | — |
| **teljes keret** (22 fő) | átlag **4,24** | — |
| **posztcsoport** (7 védő) | +0,3…+0,5 | változatlan |
| **egy ember** | 3,5 → **6,0** (a padló) | változatlan |

A munkanapló is vezetve van: a típus egysége „hány meccsen dolgozott a
kereten" — a meccsenkénti könyvelés a `buildMatchSnapshot`-ban fut, a
formafrissítés a másik fele.

## A HUB görgetése a helyén marad (3.7.29)

**Bejelentett hiba:** „bugos a görgetés amikor lenyitom egy játékos nézetét —
felgörget, és vissza kell görgetni hozzá."

**Az ok:** a lenyitás a **teljes HUB-ot** újrarajzolja (`renderHub`), a régi DOM
eltűnik, a dokumentum egy pillanatra rövidebb lesz, és a böngésző a görgetést a
tetejére csippenti. Semmi nem „ugrott" — egyszerűen nem volt mihez
ragaszkodnia.

**A javítás nem a görgetés-pozíció megjegyzése.** Az újrarajzolás után a sor
*más helyre kerül*: a fölötte lévő lenyíló bezárul, a sajátja kinyílik. Ezért a
**koppintott sor képernyőn elfoglalt helyét** mérjük (`hubKeepRowAnchor`), és
utána oda állítjuk vissza — így az ujjad alatt marad az a sor, amire
koppintottál.

A horgony kétszer fut le: azonnal és a következő képkockán is — a lenyíló panel
magassága ugyanis képek és betűtípusok betöltésekor még változhat. A görgető
nem feltétlenül az ablak, ezért megkeressük a sor legközelebbi görgethető ősét.

Mérve: a sor elmozdulása **0 px** lenyitáskor és becsukáskor egyaránt.

## Tesztelés

Playwright-tal, valódi karrieren:

- **a skála határai**: 1 → −15,0% · 4 → −8,1% · 7,5 → 0,00% · 11 → +8,1% ·
  14 → +15,0%;
- **frissülés**: 24 forduló és három checkpoint után `S.pFormUpd` a 23.
  fordulóra mutat, a fokok 7 és 10 között szóródnak;
- **nem csúszik együtt a keret**: a szórás egy tökéletes, 8/8-as periódus után
  is 3 fok;
- **a csapatszintű hatás**: 89,1 → 91,1 (+2,0) — a hibás, abszolút mércés
  változatnál ugyanez +6,5 volt;
- **szezonnullázás**: minden fok 7 vagy 8;
- **a panel**: kilenc szekció épül fel, a Statisztikák alatt három beágyazott
  alponttal; a nyitás-állapot a mentésbe kerül (`{"hdPos":true,"hdStats":true,…}`);
- **a skála kirajzolása**: 14 oszlop, ebből 9 kigyulladt egy 9/14-es formánál,
  a keretlistában és a panelen egyaránt;
- **a meccs-történet**: 11 sor, a legfrissebb elöl.

`tools/check.sh` zöld.

## Ami nyitva marad

A **±15% a két szélen szándékosan erős**. Egy tökéletes periódus után a mért
csapatszintű hatás +2,0 meccs-erő — ez „a csapat szárnyal" érzés ára, és a
divergencia-csillapítás tartja ennyiben. Ha a játékon ez soknak bizonyul, egyetlen
konstans (`PFORM_MAX_PCT`) állítja az egészet.
