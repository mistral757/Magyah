# A Panzer nulladik szintje (3.9.70)

**Állapot:** ✅ megvalósítva · **Mérés:** `tools/panzer-nulladik-proba.js` — 23 állítás

*(Érintett kód: `PZ0_NEED`, `pz0BadTraits`, `pz0StartSquad`, `pz0NoteStart`,
`stylePre`/`styleLive`/`styleHasLive`/`styleKeyLive`, `pz0CanOffer`, `pz0Start`,
`pz0Graduate`, `pz0Tick`, `pz0WhatHtml`/`pz0OfferHtml`/`pz0OfferCardHtml`/
`pz0BannerHtml`/`pz0AskBox` — és hét ponton egy-egy „nulladik szinten nem" ág.)*

---

## 1. A kérés

> „ha draft után (vagy a választott kész csapatnál random) 12+ negatív
> tulajdonság van a csapatban (vezetői képesség nem számít), akkor azonnal, a
> legelső szezon előtt felajánlja, hogy elindítod-e 0-s szinten a
> Panzerkampfwagent, ami annyit tud, hogy elkezdi gyűjteni a stíluspontokat és
> a tulajdonságok morál hatása inverz lesz, és azt az egy csapatstílus
> képességet már ekkor lehet fejleszteni, ha akarja. **Semmi mást**"

## 2. Miért pont a Panzeren segít ez

A Panzer az egyetlen filozófia, amelynek az **alapanyaga a kezdő keret**:
nehéz emberek, lapok, sérülések. Csakhogy filozófiát csak az **első lezárt
idény után** lehet felvenni — vagyis pont azt az idényt kell végigszenvedni
nélküle, amelyikben a keret a legnehezebb. Aki nehéz kerettel indult, az az
első szezonban a hátrányt kapta meg és a jutalmat nem.

A nulladik szint ezt a lyukat tömi be: aki **látja**, milyen kerettel indul,
azonnal felvállalhatja.

## 3. Mit tud, és mit nem

A kérés „semmi mást"-ja itt szó szerint értendő, és ez a rendszer nehéz fele:
egy felvett filozófia a játékban eddig **mindig** teljes erővel hatott. A
nulladik szint az egyetlen kivétel, tehát minden csatornát külön kellett
elnémítani.

| | nulladik szint | teljes értékű |
|---|---|---|
| csapatstílus-pont gyűlik | ✅ | ✅ |
| a jellem HATÁSA megfordul (`panzerAbsOn`) | ✅ | ✅ |
| **Fordított jellem** képesség | ✅ | ✅ |
| a képességfa többi eleme | ❌ | ✅ |
| hangolás-csúszkák | ❌ | ✅ |
| félelem szint és rettenet | ❌ | ✅ |
| meccs-ujjlenyomat (`MSTAT_STYLE_*`) | ❌ | ✅ |
| a barátságos torna Panzer-szabálya | ❌ | ✅ |
| a filozófia **szintje** | mindig **0** | 1–20 |

### Két kérdés, ami eddig egy volt

A megvalósítás magja egy fogalmi kettéválasztás — ugyanaz a mintázat, ami a
3.9.64-es másodlagos stílusnál is:

- **„Megvan-e a klubnál ez a filozófia?"** → `styleHasKey("panzer")`. Ez a
  nulladik szinten is **igaz** — a jellem megfordítása ezen múlik.
- **„HAT-e teljes erővel?"** → `styleHasLive("panzer")` / `styleLive(st)`. Ez a
  nulladik szinten **hamis** — minden más ezen múlik.

### A hét néma csatorna

1. **`styleLevel(st)` → 0**, ha `st.pre`. Egyetlen szám, és vele elnémul a
   hangolás ereje, a félelem skálája, a rang és a második filozófia
   szint-útja is.
2. **`styleActiveFx()`** a `pre` slotból CSAK a `abs_jellem` hatását veszi ki.
   A szűrő itt van, nem csak a vásárlásnál — különben a **filozófus-edző
   ingyen járó szintje** (`styleTraitLevelIn`) oldalajtón hozna be egy
   másikat, ha történetesen Dárdai Pál ül a kispadon.
3. **`dialListIn(st)` → `[]`**, ezzel a kezelőfelület és a `dialEach` is
   egyszerre néma.
4. **`styleBuyTrait`** minden mást elutasít, kimondva, mikor nyílik meg.
5. **`fearOn()`** hamis — se félelem szint, se rettenet-pont.
6. **`mstatMods` / `ctx.styleKey`** kihagyja a `pre` slotot: a csapat még nem
   játszik másképp, tehát az ujjlenyomat sem hazudhat.
7. **`friendlyRiskMult`** — ez **hátrány** (a Panzernél a barátságos tornán is
   teljes a sérülés-kockázat), és a nulladik szint azt sem osztja ki korán.

> A piros lap **szövege** viszont Panzeres marad. A szabály, amit követtünk:
> ami **számot** változtat, az néma; ami **hangot ad**, az a felvállalt
> filozófiáé. A klub a nulladik szinten is Panzer.

## 4. Mi az ára

A nulladik szint **nem ingyen előny, hanem korai elköteleződés.** Aki igent
mond, lemond arról, hogy az első idény végén — a keretét már ismerve — másik
filozófiát válasszon. A választás itt is végleges: `styleCanChoose()` onnantól
hamis, mert `styleState()` már létezik.

## 5. Az első idény lezárásakor

`pz0Graduate()` pontosan ott kapcsol, ahol a többiek választanak
(`styleSeasonsClosed() >= STYLE_MIN_SEASONS`). A `pre` jelző eltűnik, és

> **a nulladik szinten gyűjtött munka EGYSZERRE lép életbe.**

Az SXP ugyanis **származtatott**, nem tárolt (`styleSxpParts`): a mérföldkövek
a `pre` alatt is bekerültek a `done` naplóba, csak a szint nem mutatta őket.
A lezárás pillanatában a klub nem az 1., hanem akár az 5-6. szinten áll — ez a
korai vállalás jutalma. A `lvlSeen`-t magunk állítjuk be, mert ez nem
„szintlépés": egy saját, pontosabb mondat szól róla a naplóban.

Két torok hívja, mindkettő tétlen, ha már megtörtént: a HUB őre (`pz0Tick`) és
a stíluspanel rajzolása.

## 6. A számláló — és miben tér el a feloldásétól

A kérés kimondottan kiveszi a vezetői képességet, tehát ez **nem** ugyanaz a
számláló, mint a Panzer feloldásáé (`unlockBadTraits`, 14-es küszöb):

| | feloldás (`unlockBadTraits`) | nulladik szint (`pz0BadTraits`) |
|---|---|---|
| karizma: gyenge | **számít** | **nem számít** |
| kapcsolódás: negatív fél | számít | számít |
| vérmérséklet: forró fej | számít | számít |
| fejenkénti plafon | 3 | **2** |
| küszöb | 14 | **12** |

Mindkettő a keret **összetételét** méri, ezért a nyers (nem a hatás-oldali)
kérdéseket használja: a megfordítás után is ugyanaz a keret.

### A mért népesség: 15 ember, mindkét kezdésmódnál

A kezdő 11 + a **négy draft-cserehely** (`DRAFT_BENCH_CATS`). Ez nem
pedantéria:

- egy **kész klub** 20–28 fővel indul, egy **draftolt** tizenöttel — ugyanaz a
  12-es küszöb az egyiken triviális volna, a másikon kemény;
- a cserepad **hét** helye sem jó mérce: a draft csak négyet tölt fel, a
  klub-kitöltés mind a hetet.

Egy szabály, két kezdésmód, ugyanaz a nevező: 15 ember, fejenként legfeljebb
2 vonás — **30 a plafon**, a 12 valódi vállalás.

### A mérés pillanata: a kémia-képernyő

Ide **mindkét** kezdésmód beér (a draft a cserepad lezárása után, a kész klub
a keret összeállítása után), és a keret ekkor még érintetlen — egy igazolás
után ez a szám már nem létezik.

> **Mellékesen javult egy régi vakfolt.** A Panzer feloldását (`unlockNoteDraft`)
> eddig egyetlen helyről hívtuk: a **draft** cserepadjának lezárásából. Vagyis
> **kész klubbal indulva a Panzer feloldása elérhetetlen volt**, pedig a
> feltétele („a kezdő kereted tele van nehéz emberekkel") ott pontosan ugyanúgy
> értelmes. A hívás most a kémia-képernyőről is lefut; tétlen, ha a feloldás
> már megtörtént, tehát a draftos úton semmi nem változik.

## 7. Az ajánlat kapuja és a felület

`pz0CanOffer()` öt dolgot néz: karrier, nincs még filozófia, megvan a 12
vonás, **az 1. idény legelső fordulója előtt** (`seasonNumber===1 && idx===0`),
és a Panzer **fel van oldva** — egy zárt filozófiát oldalajtón sem lehet
felvenni.

A felület a 3.9.69-es kapu-kártyák nyelvét követi:

- a **felugró ablak** (`askConfirm`) egyszer szól, a legelső HUB-rajzoláskor;
- a **döntés helye** viszont a stíluspanel: ott a gomb ott marad, amíg az
  ajánlat él — közvetlenül az alatt a figyelmeztetés alatt, ami épp az
  ellenkezőjét mondja („a választás az első teljes szezon lezárása után nyílik
  meg"). A nulladik szint az egyetlen kivétel, ezért ott a helye.
- a menü **jelvénye** „dönts!"-re vált, az alcím pedig kimondja:
  *„🛡️ indulhatsz nulladik szintű Panzerrel"*.
- amíg a klub a nulladik szinten áll, a panel tetején **sáv** mondja meg, mi
  működik és mi nem — különben a fél képességfa és az üres hangolás hibának
  látszana.

## 8. Mentés

- `S.pz0Offer = {db, asked}` — a mért vonásszám és hogy megkérdeztük-e már.
- A `pre` jelző magában az `S.style` objektumban utazik, amit a mentés
  egészben visz.
- Régi mentésben egyik sincs: ott `pz0CanOffer()` hamis (nincs `pz0Offer`), és
  egyetlen `pre` filozófia sem létezik — a régi karrierek betűre változatlanok.
