# Stábpiac — stábtag igazolása az átigazolási időszakban

*(3.8.34. Érintett kód: `staffMarketFloor` / `staffSquadRefSz` / `staffMarketBand`,
`staffPeakFor` / `staffPrice`, `staffMakeFp` / `staffShapeFp` / `staffRealismPass` /
`staffMakeOffer`, `staffMarketKey` / `staffMarketList` / `staffMarketBuy`,
`renderStaffMarketPanel` / `renderStaffMarketBtn`, plus a kiemelt
`peakMarketPrice`. A meglévő, változatlan mechanika: `coachSzFor`,
`COACH_TYPES`, `hireCoach`, `budgetPay`, a fókusz-rendszer és minden edzőhatás.)*

## A kérés

> „Vezessük be, hogy lehessen stábtagot vásárolni átigazolási időszakokban.
> Ugyanott, ahol átigazolási lehetőségek vannak. A stábtagok árai kb a játékosok
> árainak 33%-a legyenek, és a szintjei a játékos saját keretében szereplő
> játékosok potenciálja körül mozogjon… Első szezonban csak max 50-es, min. 35-ös
> stábtagokat lehet venni…, második szezontól 40, 3-tól 50, 4-től 60 stb. a
> minimum stábtag vásárolhatóan."

## Mit ír ez felül, és mit nem

A személyi edző rendszer eredeti doktrínája: **„edzőt nem lehet vásárolni, csak
kinevelni"** (`COACH_MIN_MATCHES` = 40 közös meccs). Ez a doktrína mostantól
**a saját játékosaidra** szól — és ott változatlan: egy 34 éves legendát
továbbra sem lehet igazolni azért, hogy másnap a stábba tedd.

A stábpiacon **külsősök** állnak: szakemberek, akik sosem játszottak nálad. A
saját legendáid útja (a visszavonulás utáni, ingyenes felajánlás) érintetlen, és
továbbra is az a jobb üzlet — annak nincs ára, ennek van.

A meglévő 40 meccses kör mostantól **kettős szerepet** kap: nemcsak azt dönti
el, kiből lehet a te játékosodból edző, hanem azt is, **milyen szintű külsősöket
kínál a piac** (lásd lentebb).

## A belépő

**HUB → 🛒 Átigazolás → 🎓 Stábtag igazolása.** Szándékosan itt, a vásárlás, a
klub-szemle, a képesség-keresés és a piaci esemény mellett — ugyanabból a
büdzséből, ugyanabban az időszakban költesz. A stáb **kezelése** (fókusz,
elküldés, stáb-hely vétele) marad a Csapatépítés alatti „Szakmai stáb" panelen;
a két felület átvezet egymásba.

Elérhetőség: pontosan ugyanaz a kapu, mint a többi átigazolás-fajtánál —
`!twClosedNow() && !preSeasonHubMode`. Szezon közben és a legelső idény előtti
keret-áttekintőben a gomb **láthatóan tiltott**, és megmondja, miért.

## Az ár: a játékos-ár 33%-a

```js
const STAFF_PRICE_PCT=0.33;
staffPrice(sz) = peakMarketPrice(staffPeakFor(sz)) * 0.33
```

A `peakMarketPrice(peak)` **kiemelt** függvény: egy adott szintű játékos vételára
a legértékesebb korban, a szokásos felárral. Két olvasója van — a kupadíjak
mércéje (`topMarketPrice`) és ez. Egy képlet, két hívó: ha a piac átárazódik, a
stáb ára magától követi.

### Miért nem a nyers „Sz = Rating" megfeleltetés

A Szakértelem (20–99) ugyanaz a **nyelv**, mint a Rating, de nem ugyanaz a
**piac**. A játékos-ár a `peakToTsi` négyzetes görbéjén ül, ami 60 alatt teljesen
lapos. Mérve, a nyers megfeleltetéssel:

| Sz | 35 | 40 | 50 | 60 | 70 | 80 | 99 |
|---|--:|--:|--:|--:|--:|--:|--:|
| stábtag ára | 260 M | 268 M | 296 M | 304 M | 796 M | 3,16 Mrd | 19,9 Mrd |

Egy **kezdő stábtag** és egy **elismert szakember** árban alig különbözött volna
— a skála alsó kétharmada egyetlen árba lapult össze.

Ezért a Szakértelem teljes skáláját a piac **élő sávjára** vetítjük: a
legalsó fokozat a piac aljához (peak 60), a maximum a piac **tetejéhez** (ugyanaz
a horgony, amiből a kupadíjak dolgoznak). A szabály egy mondatban:

> Egy maximális Szakértelmű stábtag annyiba kerül, mint **a piac legdrágább
> játékosának a harmada** — és lefelé arányosan.

Mérve (a mérés karrierjében, ahol a piac teteje peak 96):

| Sz | 35 | 40 | 50 | 60 | 70 | 80 | 90 | 99 |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| = peak | 67 | 69 | 74 | 78 | 83 | 87 | 92 | 96 |
| játékos ára | 1,52 Mrd | 2,11 Mrd | 4,24 Mrd | 7,74 Mrd | 13,1 Mrd | 20,3 Mrd | 30,4 Mrd | 41,2 Mrd |
| **stábtag ára** | **502 M** | **696 M** | **1,40 Mrd** | **2,55 Mrd** | **4,31 Mrd** | **6,69 Mrd** | **10,0 Mrd** | **13,6 Mrd** |

Az arány minden soron pontosan 33%. És mivel a horgony a mezőnnyel együtt
mozog, a stáb ára **magától követi a karriered szintjét**, ugyanúgy, ahogy a
játékosoké.

## A szintek: a padló szezononként lép, a plafon a keretedből jön

```js
STAFF_MARKET_S1     = [35,50];                 /* az 1. idény fix sávja */
STAFF_MARKET_FLOORS = [35,40,50,60,70,80];     /* 1., 2., … idény padlója */
STAFF_MARKET_SPREAD = 8;
```

**A padló** szezononként lép, ahogy a kérés mondja: 35 · 40 · 50 · 60 · 70 · 80.
A „stb." **80-nál megáll**, és ez saját döntés a kérésen belül: 90 fölött már a
`★★★★★⁺ Legenda a kispad mögött` fokozat (87+) kezdődik, azt pedig ne lehessen
pusztán megvenni. Egyetlen szám a `STAFF_MARKET_FLOORS`-ban, ha feljebb kell.

**A plafon** a saját keretedből jön:

```js
staffSquadRefSz() = a nálad ≥40 meccset játszott játékosaid ÁTLAGA abból,
                    hogy ki HÁNYAS stábtag lenne — mindet 32 évesen mérve
plafon            = max(padló+12, ref+8)
```

Miért **32 évesen**: a kor a Szakértelemben külön tag (`coachAgePts`). Enélkül
nem a kereted *minőségét* mérnénk, hanem azt, ki mennyire öreg. A kérés is így
fogalmazott: *„ha a jelenlegi állományban mindenki 32 éves lenne, ki hanyas
stábtag lenne"*. A mérés a valódi karrier-statisztikákból (meccs, gól, védés,
sérülés, személyiség) dolgozik, csak a kort és a zajt egységesíti.

**Miért van padló+12 alsó korlát a plafonra:** egy egyetlen szintre szűkült
piac nem piac. A kereted ezt az alapsávot csak **fölfelé** tágíthatja.

**Az első idényben** még senki nem érte el a 40 meccset, tehát nincs viszonyítási
alap — ott a kérés szerinti fix, szűk sáv áll: **35–50**.

A panel **kiírja, melyik szabály hozta épp a plafont**. Ez nem kozmetika: a
mérés első változata mindig azt állította, hogy „a plafon a keretedből jön",
miközben egy 45-ös keret mellett a 4. idény padlója (60) hozta a 72-t. Egy
felület, ami rossz okot mond, rosszabb, mint amelyik hallgat.

## Kik állnak a piacon

Négy szakember időszakonként, **négy különböző szakmából** (nem négyszer
ugyanaz). A lista az időszakhoz kötött (`staffMarketKey`: a nyár, vagy egy
szezonközi ablak), nevesített véletlen-folyamból sorsolódik, és a **mentés
része** — egy újratöltés nem sorsol újat, tehát a „nem tetszik a kínálat" nem
kerülhető meg egy F5-tel. A következő időszakban magától új lista születik.

### A Szakértelmük nincs „beírva"

Minden ajánlatnak **valódi pályafutás-lenyomata** van, és a Szakértelmét pontosan
az a `coachSzFor` számolja, ami a saját legendáidét. A kártyán látható meccsszám,
gólok és sérülések tényleg azt az Sz-t adják ki — ellenőrizve minden sorsolt
ajánlatra.

**Hogyan találunk rá egy célszintre.** A típus pontszáma egyetlen, **monoton**
„erősség"-csúszkából áll elő: minden bemenete a csúszkával együtt nő. A kívánt
nyers pontszámhoz így **felezéssel** megtalálható a csúszka állása — mind a tíz
típushoz, külön inverz képletek nélkül. Ami a csúszkán kívül van (kor, meccsszám,
poszt), az a sorsolásból jön; ha egy célszint így nem érhető el, a hívó
újrasorsol (legfeljebb 40-szer), és a sávhoz legközelebbit tartja meg.

### A hihetőségi pászta

A csúszka **minden** statisztikát egyszerre húz — a felezésnek monoton bemenetek
kellenek. Ez viszont képtelen kártyákat szült: mérve egy **jobbhátvéd
Sprintmester 107 meccsen 48 gólt** „szerzett". A szám semmilyen szerepet nem
játszott a Szakértelmében, de ott állt a kártyán.

Ezért a formázás után a `staffRealismPass` újraírja mindazt, amit a **választott
típus nem olvas**, a poszt szerint — a gól- és gólpassz-rátát a motor saját
súlyaiból (`GOALW`/`ASSTW`), a védéseket csak kapusnak, az attribútumokat az
`ATTR_PROFILE`-ból. A típus pontszáma bitre ugyanaz marad (csak a saját
bemeneteit olvassa), tehát a Szakértelem sem mozdul — a kártya viszont hihetővé
válik: a kapus véd és nem lő gólt, a védőnek tiszta lapjai vannak, a csatárnak
góljai.

### A nevek kitaláltak

A valós adatbázis **minden** neve egyben egy megvehető játékos is (a `careerPool`
névvel kulcsol) — egy ütköző név két különböző embert olvasztana össze. A
generált nevet a `staffNameFree` kapu ellenőrzi a pool, a stáb, a Stáb-csarnok, a
döntésre váró felajánlások és a futó piac ellen.

## A vásárlás

Egy szabad **stáb-hely** és fedezet kell hozzá. Az összeg a `budgetPay(…,"staff")`
kapun megy (a meglévő „Stáb" könyvelési kategória), az edző a `hireCoach`-on
keresztül lép be — ugyanaz az út, mint a saját legendáidnál, tehát a
mérföldkövek, a napló és a halmozási korlát változatlanul működik. Alapból az
egész keretre figyel; a fókuszát a Szakmai stáb panelen állítod.

A kártya **figyelmeztet**, ha már van ilyen szakmájú edződ: egy típusból
egyszerre csak egy aktív, a másik inaktívan ülne a stábban.

A `hired:true` mező jelöli a külsőst — ma csak nyilvántartás, de a
megkülönböztetés innentől megvan, ha valaha számítani kell rá.

## Tesztelés

Playwright, headless Chromium, **valódi karrieren** (friss hagyományos karrier →
kész klub → Santos FC 1962 → alvó mezőny → scout → kémia → edző → kapitány →
képesség → szezon):

- **Az árak** minden mért szinten pontosan a játékos-ár **33%-a** (a fenti
  táblázat mérés, nem becslés).
- **A sáv szezononként**: 1. idény 35–50 · 2. 40–52 · 3. 50–62 · 4. 60–72 ·
  5. 70–82 · 6. és 7. 80–92 (a padló ott áll meg).
- **A keret-viszonyítás**: a keret felének adott 120+ meccses múlttal a
  `staffSquadRefSz` 46-ot adott, a panel pedig helyesen azt írta ki, hogy a
  plafont ilyenkor **a padló** hozza, nem a keret.
- **Minden sorsolt ajánlat Szakértelme megegyezik** a lenyomatából visszaszámolt
  értékkel (28 ajánlat, hét idényen át, egyetlen eltérés nélkül).
- **A hihetőségi pászta után**: a kapusoknak védésük van és nincs góljuk, a
  védőknek tiszta lapjuk, a támadóknak góljuk — a poszthoz mérten.
- **Vásárlás**: 40 000 pontos büdzséből egy 3 Mrd 378 M Ft-os Sz 65 Ritmusmester
  → büdzsé 38 311, stáb 1/3, a lista 4-ről 3-ra fogyott, a napló kiírta az
  „ÚJ A STÁBBAN" sort, az edző `active`, a `szBase` és a `since` helyes.
- **Stabilitás**: a lista ugyanaz marad egy mentés-visszatöltés után, és
  **változik**, ha új időszak jön.
- **Zárt időszak**: `staffMarketOpen()` hamis, a lista üres, a HUB-gomb tiltott
  és kiírja az okát („csak nyitott átigazolási időszakban").
- **Képernyőkép** világos és sötét témában: a panel a szomszédos átigazolási
  felületekkel egy nyelvet beszél.

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.
