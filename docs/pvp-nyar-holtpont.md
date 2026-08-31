# PvP: két különböző kapun vártatok egymásra

*(3.8.28. Érintett kód: `mpBeaconPing` / `mpBeaconNote` / `mpGateName` ·
`mpGateTickRun` · `mpCupTickRun` + `mpCupSolo` · `mpMkTickRun` ·
`hubNextSeasonFlow` + `friendlyCupSettle` + `mpNykResolve` ·
a `h2hWaitCancelBtn` kezelője.)*

> **BEJELENTETT HIBA:** „van egy kis probléma egy PvP karrierrel. Egyikünk
> megnyerte a MK-t, a másik már korábban kiesett, és nem is volt egymás elleni
> meccs. Mindketten indulni akartunk a nyári kupán utána, de csak egyikünket
> engedte be, a másiknak végig azt írta, hogy a másik playerre kell várnia,
> míg amaz már a nyári kupát játszotta. Most mindkettő képernyő stuck. Az
> egyik a nyári kupa csoportköre után, a másik a szezonindításra várva kupa
> nélkül."

**HÁROM külön hiba állt össze egy holtponttá.** Mindhárom bizonyítható a
kódból; a javítás mindháromra külön válasz.

---

## 1. A hazai kupa kapuja EGYETLEN kört pollozott

```js
function mpMkTick(key,myField,oppField,myEntry,done){
  const again=()=>{if(_mpMkBusy)_mpMkPoll=setTimeout(…,2500);};
  return mpTickWrap(()=>mpMkTickRun(…),again,"hazai kupa");}
```

Az `mpTickWrap` az `again()`-t **csak kivétel esetén** hívja meg. A sikeres —
de még eredmény nélküli — kör után az `mpMkTickRun` viszont egyszerűen
**véget ért**, újraütemezés nélkül:

```js
  if(mine&&mate){ … done(fire);return;}}     ← itt volt a függvény vége
```

Ilyenkor `_mpMkBusy=true` és `_mpMkPoll=null` maradt — vagyis a saját
`mpWaitStuck()` definíciónk szerint **„beragadt"**, csak épp nem jött senki,
aki feloldja. Ha a társ bejegyzése egy másodperccel később érkezett meg, ez a
képernyő **soha többé nem mozdult**. Pontosan ez a „végig azt írta, hogy a
másik playerre kell várnia".

A másik két kapu (kupanevezés, általános `mpBothGate`) helyesen újraütemez;
ez az egy maradt ki. **Javítva:** a hiányzó `setTimeout` a helyére került.

## 2. A nyári torna felajánlása LOKÁLIS döntés volt

```js
function friendlyCupOfferable(){
  if(gameMode!=="career"||!careerPool)return false;
  if(euroPending()||euroActive())return false;          ← időzítés-függő
  if((S.friendlyCupSeason||0)===(S.seasonNumber||1))return false;
  if(!(S.finalTable&&S.finalTable.length))return false;
  return true;}
```

A kód saját megjegyzése azt állította, hogy *„a »van-e kupátok« kérdés MÁR
közös […] tehát a felajánlás feltétele is egyszerre igaz vagy hamis a két
gépen."* **Ez nem áll.** Mind a négy feltétel a helyi állapotból jön, és a
nyár útvonala több ponton is elágazik kliensenként:

| ág | mitől függ | eltérhet-e? |
|---|---|---|
| `friendlyCupOfferable` | `euroPending()` / `euroActive()` | **igen** — ha az egyikőtök kupakampánya tovább tart |
| `hubNextSeasonFlow` | `S.euroOptOut`, `mpCupSettled()` | **igen** — az opt-out kliensenkénti |
| `endEuroCampaign` | `cupTierFor().cupWins` | **igen** — a piramisban ez az OSZTÁLYODTÓL függ |

Ha a két gép más ágra fut, az egyik a **nyári kupa** kulcsán vár
(`s<N>nyk`), a másik a **kupanevezés** kulcsán (`s<N>cup`) — és mivel egyikük
sem megy oda, ahol a másik áll, a várakozás **örökre szól**.

**Javítva:** közös karrierben mostantól **mindig belépünk a nyári kapuba**, és
maga a „felajánlható-e" kérdés is ott dől el. A nevezés viszi magával a helyi
választ (`offer`), és a torna csak akkor indul, ha **mindkettőnél
felajánlható ÉS mindketten igent mondtatok**. Így a két kliens sosem állhat
két különböző kulcson. (Régi kliens `offer` mező nélkül: a hiánya igent
jelent, tehát a régi viselkedést kapja.)

## 3. Nem volt kiút — és nem is derült ki, mi történt

A „Mégsem" gomb az `mpBothGate` vázán ülő kapuknál (`nyk`, `pyrpo`) a helyes,
nem-romboló kilépőt hívta. A **két saját kezű kapunál** (kupanevezés, hazai
kupa) viszont nem: ott a kezelő a `prev()`-re esett, ami a **szobából
léptetett ki** — sokkal drasztikusabb annál, mint amit a gomb ígér.

**Javítva:** mindkettő a saját kilépőjét kapja. A hazai kupánál a meglévő
`mpMkGiveUp()`, a kupanevezésnél az új `mpCupSolo()` — ott a **saját
kvalifikációddal** megyünk tovább, ami pontosan az egyjátékos viselkedés,
tehát nem lehet rosszabb annál, mint hogy örökre a kapunál állsz.

---

## A jelzőfény — hogy ez a hibaosztály többé ne tudjon holtpontra futni

Minden közös kapu ugyanazon a mintán működik: felteszem a saját mezőmet, és
pollozom, amíg a társé meg nem jelenik **ugyanazon a kulcson**. Ez addig jó,
amíg a két kliens ugyanoda ér el. A fenti három hiba mind ugyanazt a bajt
okozta — **két különböző kulcs** —, és bármelyik jövőbeli elágazás ugyanezt
tudná.

A **jelzőfény** ezt töri meg. Amíg várok, minden poll-körben kiírom, melyik
kapunál állok, és elolvasom, a társam hol áll:

```js
await mpBk().h2hPut(MP.activeRoom, "s<N>where", myField, {gate, at:Date.now()});
const mate = (await mpBk().h2hGet(MP.activeRoom, "s<N>where"))[oppField];
```

Ha a társam **bizonyíthatóan** egy másik kapunál vár, ide már nem fog
megérkezni — abbahagyom a várakozást, és a helyi tartalékkal megyünk tovább,
egy naplósorral, ami megmondja, mi történt.

**Miért „bizonyíthatóan".** Egy ottfelejtett, régi bejegyzés nem bizonyíték: a
társ már rég továbbmehetett. Csak az számít, ha a jelzése **mozog**, miközben
nézem — az `at` mező minden poll-körben új. Így **nem időbélyeget hasonlítunk**
(a két gép órája eltérhet), hanem **változást**. Négy egymás utáni mozgó,
eltérő olvasat kell (`MP_BEACON_HITS`), tehát egy átmeneti áthaladás nem
téveszt meg.

**Miért nincs téves riasztás a normál sorrendnél.** Minden kapu „mindketten
posztolnak" elven működik: ha a társ már túljutott ezen a kapun, a bejegyzése
**ott van** a csomópontban, tehát a `mine&&mate` ág azonnal old — a jelzőfényig
el sem jutunk.

A jelzőfény mind a három kapuba be van kötve: az általános `mpBothGate`-be, a
kupanevezésbe és a hazai kupa láncába.

## A most beragadt két képernyő

A javítás **visszamenőleg is old**: amint mindkét fél újratölti az oldalt, a
kapuk újra pollozni kezdenek (1. javítás), jelzőfényt írnak, és tíz
másodpercen belül észreveszik, hogy a másik máshol áll — mindkettő továbblép a
saját döntésével. Ha valaki nem akar várni a tíz másodpercet, a **„Mégsem"
gomb** mostantól nem a szobából léptet ki, hanem továbbenged (3. javítás).

A két karrier ilyenkor egy nyárra szétválhat — ezt a naplósor ki is mondja —,
de a **következő szezonindításnál a keretek úgyis újra egymáshoz
hangolódnak**, tehát a közös karrier nem törik el.

---

# Utóirat: a 3.8.28 nem oldotta meg (3.8.30)

> **BEJELENTETT HIBA, a javítás UTÁN:** „nem oldódott meg a PvP dolog. Ebben a
> konkrét esetben még mindig stuck mindkét fél."

**Az én hibám volt: rossz kapukat fedtem le.** A jelzőfényt HÁROM helyre tettem
be (kupanevezés, hazai kupa, `mpBothGate`) — a két fél viszont nem ott állt. A
várakozó réteget (`h2hWaitShow`) **tíz** folyamat használja, és a kettő
közülük épp a kimaradtak:

| a bejelentés szava | a tényleges hurok | volt-e kiútja? |
|---|---|---|
| „a nyári kupa **csoportköre után**" | `mpCupGroupTickRun` — SORSOLÁS | **semmilyen** |
| „a **szezonindításra** várva" | `mpStartTick` — SZEZONINDÍTÁS | időzített, de jelzőfény nélkül |

A csoport-szinkronnak **semmilyen** menedéke nem volt: se időkorlát, se
„egyedül folytatom" gomb. A „✕ Még maradok a HUB-ban" csak elrejtette a
réteget, a figyelő tovább járt, és két másodperc múlva visszahozta — onnan
csak újratöltés vitt ki, és az sem segített, mert a következő rajzolásnál
ugyanoda ért vissza.

## A megoldás: egy szabály, nem újabb tapasz

Minden várakozó folyamat **bejelenti a saját egyedüli kiútját**
(`mpSoloArm(label, fn, gate)`), és a várakozó réteg **huszonöt másodperc
után** magától felkínálja (`mpSoloOffer`). Egy hely, egy szabály — ami ezután
épül, annak is csak egy sort kell hozzátennie.

| hurok | kapu-azonosító | mi a kiút |
|---|---|---|
| SORSOLÁS (csoportkör) | `group` | `mpCupSplitApart` — az ág szétválik, mindketten a saját sorozatotokat viszitek |
| KUPANEVEZÉS | `cup` | `mpCupSolo` — a saját kvalifikációddal |
| HAZAI KUPA | `mk` | `mpMkGiveUp` — a saját eredményeddel |
| KUPAKÖR (kieséses) | `tie` | a társ kiesettnek számít, a helyi ág viszi tovább |
| TABELLA | `table` | a helyben számolt tabellával |
| SZEZONZÁRÁS | `final` | a saját zárásoddal |
| NYÁRI KUPA / OSZTÁLYOZÓ | `nyk` / `pyrpo` | `mpGateGiveUp` — a saját döntéseddel |
| INFINITY | `inf` | vissza a HUB-ba, a befizetésed a szobában marad |
| SZEZONINDÍTÁS | `season` | saját, korábbi kiútja **plusz** a jelzőfény |

**Miért nem azonnal, hanem huszonöt másodperc után.** A kiút nem gomb, hanem
végső menedék: a közös karrier értéke épp az, hogy megvárjátok egymást.
Huszonöt másodperc alatt egy lassú hálózat is befut; ami annál tovább tart, az
már tényleg elakadás.

## És hogy legközelebb ne kelljen találgatni

**Minden várakozó képernyő megnevezi magát.** A réteg alján ott a hurok
azonosítója (`várakozás: group · kupa-csoportkör`), akkor is, ha az a folyamat
nem jelentett be kiutat (`nincs bejelentett kiút`). Az előző javítás pontosan
azért nem talált célba, mert a képernyőről nem derült ki, MELYIK hurokban áll
a két fél — egy képernyőkép ezt most megmondja.

A jelzőfény is bekerült a két kimaradt kapuba (`group`, `season`), tehát ha a
társ egy másik kapunál vár, ott sem kell kivárni a huszonöt másodpercet.
