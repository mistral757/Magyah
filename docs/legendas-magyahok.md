# 🇭🇺 Legendás magyahok (3.9.80)

## A kérés

> „Legyen egy kapcsoló aminek a lényege: érdemes legyen magyar játékosokkal
> feltölteni a draftodat (kész csapat módban nem lehet bekapcsolni). Neve:
> Legendás magyahok. Funkciója: Minden adatbázisban szereplő magyar játékos kap
> egy boostot az adott instance-ban. A karrier indítás pillanatában minden
> magyar játékos kezdő ratingja kap egy emelést: minden 80 alatti minimum 80
> fölöttire, minden 80-85- közötti kap random +4-8, 85 fölöttiek: +3-6. A POT
> ügyében pedig szintén mindannyian kapnának egy új sávot: min. 2200 legyen
> minden magyar játékos POT-ja minden fajta módban (lutri, rating szezon
> [rating csúcs is, bár annak a rating szezon az alapja])"

## Hol van

A beállító képernyő **2. oldalán** („A keret"), a válogatott-kapcsoló alatt:

```
Szokásos mezőny            🇭🇺 Legendás magyahok
mindenki a saját,          az adattár MINDEN magyar játékosa erősebb
valós erejével             kezdő Ratinggel és legalább 2200-as POT-tal indul
```

**Kész klubbal indulva nem jelenik meg.** A 3. oldal összefoglalójában is csak
draftos indulásnál áll ott a sora.

## Mit csinál

### 1. Kezdő Rating — a karrier indításának pillanatában

| a játékos kártyája | amit kap |
|---|---|
| 80 alatt | **81–85 közé** emelve |
| 80–85 | **+4…+8** |
| 85 fölött | **+3…+6** |

A 80 alatti sáv szándékosan **tartomány**, nem fix 81. Fix padlónál a 79-es
légiós 81 lett volna, a 80-as meg 84–88 — a kapcsoló pont ott büntetett volna,
ahol segíteni akar.

Felfelé a `ratingCap()` zár (normál módban 119, piramisban és Infinityben
korlátlan), lefelé pedig **soha nem visz**: a `Math.max(o, …)` garantálja, hogy
a boost nem tud rontani senkin.

### 2. POT-padló — minden módban

Minden magyar játékos POT-ja legalább **2200**. Ez ≈ **84,3-as fejlődési csúcs**
(`potToPeakOvr`), vagyis nincs az a magyar játékos, akiből ne lehetne kinevelni
egy bajnokcsapatba való embert.

A padló **mind a három Rating-alapon** hat, mert a kérés külön kimondta:

- **csúcs** (`peakBasisFor`) — a szülő módján, a szezon-alapon át;
- **szezon** (`seasonBasisFor`);
- **lutri** (`wildBasisFor`) — itt ér a legtöbbet, mert ez a legnagyobb szórású.

És hat a **kanonikus pool-bejegyzésen** is (`initCareerPlayerPool`) — az
szolgálja ki a piacot, a scoutot és az ügynökséget.

### A csúcs is követi

POT-t vagy Ratinget emelni magában félrevezetés lenne: a kor-görbe
(`ratingAtAge`) a `peak`-ből számol, tehát egy megemelt `startRating` a
következő szezonváltáskor magától visszaesne. Ezért mindkét hatás a `peak`-et is
felhúzza — ugyanaz a `boostLift`-minta, mint a boltban vett boostoknál.

## Amit mértünk

Egy valódi karrier-pool (3472 játékos, ebből 134 magyar), ugyanazzal a seeddel:

| | magyar min. Rating | magyar min. POT | magyar átlag-Rating |
|---|---|---|---|
| kikapcsolva | 56 | 210 | 75,5 |
| **bekapcsolva** | **81** | **2200** | **88,5** |

A mezőny többi része (3338 játékos) **betűre változatlan**: azonos minimum,
azonos átlag. A kapcsoló nem szivárog.

## Három réteg, mint a válogatott-kapcsolónál

| réteg | mi | hol él |
|---|---|---|
| `magyahEnabled` | a globális **preferencia** | `localStorage` — a KÖVETKEZŐ karriert állítja |
| `S.careerMagyah` | a **futó** karrierre rögzített érték | a mentés viszi |
| `magyahOn()` | az olvasó | a kettő közül a helyeset adja |

A zár a `beginNewGame`-ben csattan, a `S.careerWc` mellett:

```js
S.careerMagyah = !!(magyahEnabled && gameMode==="career" && careerStart!=="club");
```

**A kész klub zárja itt van, nem csak a képernyő elrejtésében** — egy beragadt
`localStorage`-érték így sem tud átszivárogni egy kész klubos indulásba. Ez
azért fontos, mert ott a klubválasztó listája az adott keret valós átlagerejét
hirdeti, és abból számol a piramis kezdő rése meg a Run-plafon; egy néma
magyar-boost pont azt a számot hazudná meg.

**Régi mentésben** a mező nem létezik. Ott `false`-ra fagyasztjuk, nem a globális
preferenciára — az a karrier bizonyosan boost nélkül futott, és egy bekapcsolt
kapcsoló visszamenőleg nem emelheti meg az egész piacát.

## Determinizmus és közös karrier

A sávon belüli szórás **nevesített, seedelt folyamból** jön
(`rngFor("magyah:"+név)`), nem `Math.random`-ból: ugyanaz a játékos mindig
ugyanazt az emelést kapja, futástól és sorrendtől függetlenül.

A kapcsoló **világ-tulajdonság**, nem ízlés: utazik a szoba beállításai közt
(`mpCollectSettings` / `mpApplySettings`), szerepel a világ-tengelyek
összevetésében (`mpWorldAxes` → `mgy`), és a házigazda értékét a
`mpAdoptWorldAxes` zárja le mindkét kliensen. Enélkül a két menedzser más
piacról igazolna, és a párharcnak nem volna tétje.

## A próba

`node tools/legendas-magyahok-proba.js` — a sávok betűre, a POT-padló mind a
három alapon, a kikapcsolt állapot érintetlensége, a determinizmus, a kész klub
zárja, és egy valódi karrier-pool élesben.
