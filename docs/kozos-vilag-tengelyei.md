# A közös világ három tengelye — miért csúszott szét egy 3.7-es közös karrier

*(3.8.37. Érintett kód: `mpWorldAxes` / `mpWorldAxesDiff` / `mpAdoptWorldAxes`,
a `mpStartExchange` rekordja (`w`) és a `mpStartTick` két átvevő ága, a
`mpCupGroupSync` szétcsúszás-üzenete, és a `mpDiagCollect` új „A VILÁG
TENGELYEI" blokkja. A meglévő, változatlan mechanika: `lockMpWorldSettings`,
`gameTempo` / `scheduleMode` / `wcOn`, `pyrAiRate`, `pyrRollover`.)*

## A bejelentés

> „teljesen szét volt csúszva most a PvP hagyományos módú karrierünk. BL
> kieséses szakaszban egyből kaptuk az üzenetet, hogy nem azonos a seed, aztán
> nyári kupában sem kerültünk egybe. aztán hiába együtt voltunk a d3-ban előző
> szezonban, nekem d1-re neki d2-re ajánlotta fel az ugrást… lehet hogy az hogy
> ez a közös karrier már vagy v3.7 óta fut és sok volt azóta a változtatás"

**A megérzés pontos volt.** A három tünetnek egy gyökere van, és tényleg a
karrier kora okozza.

## Három beállítás, ami nem a karrieré, hanem a böngészőé

| tengely | olvasó | hol él |
|---|---|---|
| fejlődési tempó | `gameTempo()` | `localStorage` |
| sorsolás rendje | `scheduleMode()` | `localStorage` |
| VB-válogatottak a mezőnyben | `wcOn()` | `localStorage` |

Egyjátékosban ez helyes: a beállítás a *következő* játékot állítja, és menet
közben is átkapcsolható. **Közös karrierben viszont mind a három
világ-tulajdonság**: ha a két gépen más, a két világ más.

Ezért kaptak zárat — a karrier **indulásakor** rögzülnek a mentésbe
(`lockMpWorldSettings`, `S.careerWc`):

```js
gameTempo()    = mpWorldTempo || gameTempoPref();
scheduleMode() = mpWorldSched || schedulePref();
wcOn()         = (S.careerWc!=null) ? S.careerWc : wcEnabled;
```

## A zár később érkezett, mint a karrier

A zárat a **3.7 után** vezettük be. Egy akkor indult közös karrier mentésében
ezek a mezők **nincsenek benne** — a betöltés `null`-t (illetve hiányzó mezőt)
talál, és **mind a három olvasó visszaesik a saját gép preferenciájára**.

Onnantól a két kliens ugyanabból a seedből, ugyanabból a mentésből, de **más
szabályokkal** futtatja ugyanazt a világot.

## Miért ez visz mindent: a tempó a világ fejlődésén ül

A tempó tizenhárom csatornán hat (`TEMPO_TOUCHES`), és az egyik a
**ligapiramis évenkénti fejlődése**:

```js
function pyrAiRate(div){
  …
  const k=tempoMult();          // ← GAME_TEMPO[gameTempo()].k
  return PYR_PACE*k*share;}
```

**Mérve** (ugyanaz a mentés, ugyanaz a seed, D3):

| a te beállításod | a társadé | a mezőny szezononkénti lépése |
|---|---|--:|
| Alap tempó (k=0,80) | — | 3,6512 |
| — | Gyors fejlődés (k=0,90) | 4,1076 |
| | | **+12,5% eltérés** |

Ez a 12,5% **mind a 96 klubra** hat, minden szezonban. A szezon végére a két
gépen más ratingekkel áll a világ → **más végtabella** → **más fel- és
kiesés**.

Innen a harmadik tünet: az all-in ugrás célja mindig `pyrMyDivId()-1`, tehát
„nekem D1-re, neki D2-re" pontosan azt jelenti, hogy **az egyikőtök feljutott
D3-ból D2-be, a másik nem**. A kiírás helyes volt — a világ nem.

Ugyanez a szétcsúszott mezőny adja a másik kettőt is:

- a **kupa „nem azonos a seed"** üzenete a háttérmeccsek ujjlenyomatát
  hasonlítja (`mpCupAiGroupsFingerprint`) — más világ, más háttéreredmények;
- a **nyári sorozatban** azért nem kerültetek egybe, mert a közös sorozatot a
  jobbik kvalifikáció dönti el (`mpResolveCup`), a kvalifikáció pedig a
  végtabellából jön.

**A 3.8.32 élesítette a helyzetet:** ott az „Alap tempó" k-ja 1,00-ról 0,80-ra
változott. Aki azóta sem nyúlt a beállításhoz, az is más szorzót futtat, mint
aki korábban választott magának valamit — és a kulcs neve ugyanaz maradt, tehát
semmi nem jelezte.

## A javítás: utólagos rögzítés a szezonindítási alkunál

A tengelyeket **utólag is lezárjuk**, ott, ahol a két kliens minden idényben
úgyis beszél egymással: a szezonindítási alkunál (`mpStartExchange`). A javaslat
mellé felutazik a három tengely (`w:mpWorldAxes()`), és amikor mindkét rekord
megvan:

- **a házigazda a szoba igazsága** — ő állította be a világot, tehát mindkét
  kliens az ő rekordjából veszi át a hármat;
- mindkettő **a mentésébe zárja** (`mpWorldTempo` / `mpWorldSched` /
  `S.careerWc`), tehát soha többé nem eshet vissza a helyi preferenciára;
- **a rögzítés megelőzi a szint alkuját** — a világ előbb áll össze, csak utána
  dől el a mezőny erőssége.

A **kényszerindítás** ágán (amikor az egyikőtök nem jelentkezik és a másik
egyedül indul) nincs két rekord, tehát a „házigazda dönt" szabályt nem lehet
alkalmazni: ott a tekintély ugyanaz, mint a szintnél — **aki elindult**. A cél
nem az, hogy a házigazdának legyen igaza, hanem hogy a két világ **egy** legyen.

### Az eltérést kimondjuk

Ami eddig némán szétvitte a világot, annak látszania kell. A rögzítés
pillanatában három sor megy a naplóba: hogy a zár most jött létre és miért, hogy
**eddig melyik tengelyen tértetek el** (nevesítve, mindkét oldal értékével), és
hogy **nálad mi változott meg**. Idempotens: egy már rögzített karrierben
egyetlen sort sem ír.

### A kupa-üzenet is a valódi okot mondja

A szétcsúszás-üzenet eddig verziót és mezőny-ujjlenyomatot említett — mindkettő
*következmény*. Mostantól a tengelyek mennek előre, mert **egyedül azok
javíthatók a felhasználó oldaláról**:

> ⚠️ A közös kupa két oldala szétcsúszott. A két gép MÁS VILÁG-BEÁLLÍTÁSOKKAL
> fut: fejlődési tempó (nálad „Alap tempó", nála „Gyors fejlődés"). Ez a
> szétcsúszás oka — a következő szezonindításnál a házigazda beállításai
> mindkettőtöknél rögzülnek.

## Amit a rögzítés NEM tud helyrehozni

**A múltat.** A már lefutott szezonok eltérése bent marad a két mentésben: a
klubratingek, a tabellák és a lezárt fel-/kiesések nem számolhatók újra. A
rögzítés **innentől** tartja együtt a két világot.

**A játékos-poolt.** A pool a karrier indulásakor épül a seedből *és* a
válogatott-kapcsolóból. Ha az a start pillanatában eltért, a két pool azóta is
más — utólag nem rakható helyre. A diagnosztika ezért kiírja a pool méretét és
ujjlenyomatát: két diagnosztika egymás mellé téve egy pillantásból megmondja,
hogy ez a baj fennáll-e.

## A diagnosztika új blokkja

A 🧪 gomb jelentése egy új szakasszal bővült — ez az, amit egy „szétcsúszott a
karrierünk" bejelentésnél a két gépről egymás mellé kell tenni:

```
── A VILÁG TENGELYEI (közös karrier)
  fejlődési tempó: csiga (Csigatempó · k=0.56) — RÖGZÍTVE
  sorsolás: real — RÖGZÍTVE
  VB-válogatottak: benne — RÖGZÍTVE
  Rating-alap: season
  ikonráta (csak a saját scoutod): teljes · ×1
  világ-seed: EVERDVAA
  játékos-pool: 3446 név · ujjlenyomat 11k63vi
  szoba: TEST · szerep: guest
```

A **RÖGZÍTVE / ⚠ HELYI** jelölés a lényeg: az utóbbi azt mondja, hogy az a
tengely még mindig a böngésző preferenciájából jön.

Az **ikonráta** szándékosan nem világ-tengely: csak a saját scoutolásod esélyét
szorozza (`scoutIconChance`), a világ determinizmusát nem viszi szét — ezért nem
is vesszük át a házigazdáétól. Közös karrierben viszont *méltányossági* kérdés
(sűrűbben találsz-e legendát, mint a társad), ezért a diagnosztikában ott a
helye. Ugyanezért marad ki a szétcsúszás-üzenet okai közül: egy hamis ok
rosszabb, mint egy hiányzó megjegyzés.

A **Rating-alap** is csak jelentés: az a POOL építésekor dől el, tehát utólag
nem „állítható át". (Betöltéskor amúgy determinisztikus: a mentésből jön, és
hiányzó mezőnél mindkét gépen ugyanaz az alapértelmezés — tehát ez a tengely
magától nem tud szétcsúszni.)

## Tesztelés

Playwright, headless Chromium, **valódi hagyományos karrieren**, szintetikus
közös szobával — a mentés pontosan abba az állapotba állítva, amit egy 3.7-ben
indult közös karrier betöltése hagy maga után (`mpWorldTempo=null`,
`mpWorldSched=null`, `S.careerWc=null`):

1. **A szétcsúszás mérve.** Ugyanaz a mentés, ugyanaz a seed: „Alap tempó"
   mellett a mezőny lépése 3,6512, „Gyors fejlődés" mellett 4,1076 —
   **+12,5%**, minden szezonban, mind a 96 klubra.
2. **A tengely-összehasonlítás** két azonos csomagra 0 eltérést ad, két
   különbözőre pontosan a két eltérő tengelyt nevezi meg.
3. **A szezonindítási alku** (a házigazda „Csigatempó"-n, válogatottakkal):
   a vendégnél `tempo: normal → csiga`, `wc: kihagyva → benne`, a mezőny lépése
   **3,6512 → 2,5558**, és mind a három tengely `RÖGZÍTVE` lett.
4. **A napló** kiírja, hogy a zár most jött létre, mi volt az eltérés, és mi
   változott meg — a valódi értékekkel.
5. **Idempotencia:** egy már rögzített karrierben a második hívás egyetlen sort
   sem ír, és nem mozdít semmit.
6. **A diagnosztika** blokkja a fenti formában áll elő, a RÖGZÍTVE/HELYI
   jelölésekkel és a pool-ujjlenyomattal.

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.

## Amit a két játékosnak tenni kell

Semmit. A következő **szezonindításnál** a zár magától létrejön, és a napló
megmondja, mi volt az eltérés. Ha a rögzítés előtt szeretnétek ellenőrizni,
hogy fennáll-e a baj: mindketten nyissátok meg a 🧪 diagnosztikát a kezdőlapon,
és hasonlítsátok össze **A VILÁG TENGELYEI** blokkot.
