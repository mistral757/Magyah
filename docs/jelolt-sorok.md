# Jelölt-sorok — egy koppintás nem dönt

*(3.7.12. Érintett kód: `makeCandRow` / `candRevealBtn` és a `.candDet` /
`.candBtn` / `.candHead` CSS-blokk az `index.html`-ben. Használói:
`twScoutShow` (scout-jelöltek), `showCsSquad` (klub-szemle), `renderSquad`
(draft). A megerősítő ár-képernyő változatlanul a `twConfirmBuy`.)*

## 1. Ami volt: két döntés, egy koppintásnyira

Három lista dolgozott ugyanazzal a mintával — a scout jelöltjei, a klub-szemle
kerete és a draft —, és mindháromban ugyanaz volt a szerkezet:

```
  ┌──────────────────────────────────────────────┐
  │ [BV]  Juan Bernat                        👁  │  ← a sor: TÁRGYALÁS
  │       25 év                                  │  ← a 👁: FELMÉRÉS
  └──────────────────────────────────────────────┘
```

A sor koppintása **azonnal** az ajánlatot indította. A felmérés (a TSI
megnézése) pedig egy ~20 px-es `👁` jelen lógott a sor **jobb szélén**, közvetlenül
a nagyobb tét mellett.

**A két tét nem szimmetrikus.** A felmérés ingyen van — csak a scout
megtekintési keretéből fogy, és a keret amúgy is elveszik a kör végén. A
tárgyalás viszont végleges: egy körben jellemzően **egyetlen** igazolás fér
bele, a klub-szemlén pedig egy játékossal **egyszer** tárgyalsz (utána
`csRefused`). Egy elcsúszott ujj nem felmért, hanem döntött.

A `👁` ráadásul **néma** volt: ha elfogyott a keret, a koppintásra nem történt
semmi — nem derült ki, hogy szabály állt az útba, csak hogy „nem működik".

## 2. Ami lett: a sor kinyit, a gombok döntenek

```
  ┌──────────────────────────────────────────────┐
  │ [BV]  Juan Bernat                         ?  │  ← koppintás = KINYIT
  │       25 év                                  │
  ├──────────────────────────────────────────────┤
  │  👁 Felmérés — nézzük meg a TSI-jét          │
  │     ingyen · a scoutod még 2 jelöltet enged  │
  ├──────────────────────────────────────────────┤
  │  📝 Átigazolási ajánlat                      │  → ár-képernyő,
  │     a következő képernyőn az ár              │    ott dől el
  └──────────────────────────────────────────────┘
```

* **A sor koppintása csak kinyit.** Semmit nem költ, semmit nem dönt el.
* **A két lehetőség egyforma alakú:** teljes szélességű gomb, felirattal és
  magyarázó sorral. Nem lehet az egyiket a másik helyett megnyomni.
* **A jobb szélen már csak szám áll** (`~1320` vagy `?`), nem gomb — a `👁`
  eltűnt onnan.
* **Két megerősítés van a tárgyalás előtt**, nulla helyett: a lenyitás, majd a
  `twConfirmBuy` ár-képernyője („Tárgyalás megkezdése" / „Mégsem").
* **Egyszerre egy sor áll nyitva** — egy 17 fős draft-listán különben kusza
  lenne.

## 3. A felmérés gombja kimondja magát

A `candRevealBtn` három állapota — a régi néma `👁` helyett:

| Állapot | Felirat |
|---|---|
| még nem mérted fel | `👁 Felmérés — nézzük meg a TSI-jét` · *ingyen · a scoutod még N jelöltet enged megnézni* |
| már felmérted | `👁 Felmérve — TSI ~1320` · *a scoutod becslése erről a játékosról* (tiltva) |
| elfogyott a keret | `👁 Felmérés` · *elfogyott a scoutod megtekintési kerete* (tiltva) |

**A doboz a kinyitáskor épül újra** (`buildDet` / `buildDetBody`): a felmérési
keret közben változhatott egy másik soron, és a gombnak a MOSTANI állapotot kell
mondania, nem a lista rajzolásakorit.

## 4. Amit még ez hozott

* **A draftban minden sor kinyitható**, nem csak a választhatók. A felmérés
  attól még értelmes, hogy valakit épp nem tudsz betenni (nincs hozzá szabad
  poszt, vagy már nálad van) — a régi `👁` is ott ült minden soron. A választás
  gombja viszont csak ott jelenik meg, ahol tényleg van mit választani.
  Klasszikus módban nincs felmérés, tehát ott a nem választható sor nem is
  nyílik.
* **A klub-szemlén a felmérés átér az ár-képernyőre.** Korábban a
  `showCsSquad` csak a `revealedNames` halmazba tett bele, a `twConfirmBuy`
  viszont a `cand._tsiRevealed` jelzőt olvassa — így a megnézett TSI épp a
  döntés pillanatában tűnt el. Most a jelző is felkerül.

## 5. Amit szándékosan NEM csináltunk

* **Nem tettünk harmadik megerősítést a felmérésre.** Az ingyen van, és a
  keret a kör végén amúgy is elveszik — ott a gyorsaság a helyes, nem az
  óvatosság.
* **Nem nyúltunk a keretek nagyságához.** A megtekintési keret továbbra is a
  scout csillagaiból jön (`computeRevealBudget`), a tárgyalásoké az
  ügynökségéből — csak most látszik, hol tartanak.
