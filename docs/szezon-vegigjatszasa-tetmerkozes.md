# A végigjátszás megáll a bajnoki tétmérkőzés előtt

*(3.8.33. Érintett kód: `autoTitleGate` / `offerTitleDecider` / `autoStop` /
`autoTitleKey` és `kickoffTap` — mind a `$("autoBtn").onclick` mellett —,
a kapu a `startRound()` első sorában, a háló az `afterLeagueRound`
bajnokavató ágában, plusz az `askConfirm` új, opcionális `no` felirata.
A meglévő, változatlan mechanika: `titleSnapshot` / `isTitleDecider`,
`runD1FinaleDue` / `showRunFinale`, `runBoardOnPyrTitle`.)*

## A bejelentett hiba

> „Szezon végigjátszásával futtattam le az utolsó szezonomat hagyományos módban
> d1-ben… A szezon végigjátszása **túlpörgetett a bajnokká avatáson**, nem kaptam
> meg a run értékelő képernyőt, és az új szezonig is hiába futottam végig minden
> meccset kupában stb., nem került fel a listára a run szint, pedig ez lett volna
> az eddigi legjobb.”

## Mi történt valójában

A bajnokavatás (`afterLeagueRound`) **auto módban is** kiírja a trófea-modált —
a szezon viszont **fut tovább alatta**: a meccs-végi lánc hatvan
ezredmásodperccel később már a következő fordulót indítja
(`if(S.auto)setTimeout(startRound,60)`).

A Run-záróképernyő ezért auto módban ki volt zárva:

```js
const _runFin=(!S.auto&&runD1FinaleDue());   /* a régi sor */
```

És ennek megvolt a maga logikája: a `runD1FinaleNow()` **félreteszi a
közvetítés-képernyőt** és a „Tovább →" után visszahozza — egy magától futó
szezon alatt ez két egymásra rétegzett képernyőt adna, a Kezdőrúgás gombbal a
Run-kártya mögött. A gyakorlati következmény viszont az volt, hogy a
**hagyományos karrier legfontosabb pillanata némán elszaladt**: a felhasználó
egy konfettit látott, a mérföldkövet nem.

## A megoldás két rétegű

### 1. Megelőzés — a kért javítás

A végigjátszás **megáll a bajnoki tétmérkőzés ELŐTT**, és felajánlja, hogy te
indítsd el:

```
… 27. forduló ── 28. forduló ──►  🏆 „Bajnoki tétmérkőzés következik”
                                   S.auto = false
                                   ┌── „Rendben, én játszom le” → felkészülés → Kezdőrúgás
                                   └── „Most még nem”            → a képernyőn maradsz
```

A „tétmérkőzés" **nem új fogalom**: ugyanaz az `isTitleDecider(titleSnapshot())`,
amit a felkészülés-eligazítás (`prepBriefing`) és a kezdőrúgás-gomb felirata
(`kickBtnLabel` → „🏆 BAJNOKI TÉTMECCS — 29. forduló") is használ. Olyan
forduló, amelyben **matematikailag bajnok lehetsz** — döntetlennel, győzelemmel,
vagy győzelem + más eredmények együttállásával. A felajánlás ezt a hármat
meg is nevezi.

A kapu a `startRound()` **első sora**, mert az a forduló egyetlen belépési
pontja — a kezdőrúgás, az auto-lánc és a párharc is arra jön. Auto módon kívül
semmit nem csinál.

**Hol NEM áll meg** (mind kimért feltétel, nem véletlen):

| kizárás | miért |
|---|---|
| `gameMode!=="career"` | a klasszikus 30-0 nem cím körül forog, és nincs mögötte Run |
| `euroActive()` / `pyrPoActive()` / `h2hRoomActive()` | kupa, osztályozó, közös karrier — nem bajnoki forduló |
| nincs `S.fixtures[S.idx]`, vagy `fx.duel`, vagy `S.idx>=30` | ugyanaz a feltétel, mint a `prepApplies`-ban |
| `S._autoTitleAsk===autoTitleKey()` | erre a fordulóra már megvolt a kérdés |

Az utolsó sor a lényeg: enélkül a **gomb megnyomhatatlan** lenne. Aki a
megállás után mégis a gépre bízná ezt a mérkőzést, egyszerűen újra koppint a
**Szezon végigjátszása** gombra — és ugyanezért állítja be a jelzőt maga az
`autoBtn` „igen" ága is: amit magad indítasz innen, azt nem kérdezzük meg
kétszer. Cserébe a végigjátszás kérdése **kimondja**, ha épp tétmérkőzés
következik (arany figyelmeztető sor), és azt is, hogy a gép **megáll magától**
a következő előtt.

A jelző (`S._autoTitleAsk`, alakja `"szezon:idx"`) a **mentés része** — enélkül
egy újratöltés a saját döntésedet felejtené el, és a végigjátszás ugyanannál a
fordulónál állna meg másodszor is. Szezononként nullázódik.

### 2. Háló — a kihirdetés megállítja a gépet

Maradt két út, amin a cím mégis a végigjátszás alatt dőlhet el: te magad adtad
a tétmérkőzést a gépnek, vagy a címet **más eredmények** hozták össze egy olyan
fordulóban, amit a snapshot nem jelölt tétmeccsnek. Ezért a `!S.auto` a
bajnokavatásból is **kikerült**, helyette:

```js
const _runFin=runD1FinaleDue();
if(_runFin){
  S.runFinaleSeason=sn;
  if(autoStop())addLine(`⏸ A végigjátszást megállítottam a bajnokavatásnál …`);}
```

A cím ekkor **már megvan** — a hátralévő fordulókban nincs mit elveszíteni,
tehát a megállásnak nincs ára, és a végigjátszás egy koppintással folytatható.
A trófea-modál bezárása után a Run-záróképernyő ott, akkor megjön, a „Tovább →"
pedig visszahozza a közvetítést, pontosan úgy, ahogy kézi módban.

**Miért nem elég a háló önmagában:** a bajnoki cím az a mérkőzés, amit az ember
MAGA akar lejátszani — nem az, amiről utólag értesül.

## Egy mellékjavítás: az `askConfirm` nem-gombjának is lehet felirata

A megerősítő eddig fixen „Mégse"-t írt a második gombra. Ahol a párbeszéd
**felajánlás** és nem módosítás, ott ez félrevezető: nincs mit visszavonni. Az
`askConfirm` mostantól elfogad egy `no` feliratot (itt: „Most még nem”);
alapértelmezésben változatlanul „Mégse", tehát a többi párbeszéd érintetlen.

## Amit ez NEM old meg

A Run-ranglista bejegyzése a hagyományos módban **az első élvonalbeli
aranyhoz** kötött (`runBoardOnPyrTitle`: `if(list.some(x=>x.id===id))return null`),
és a szám utána csak a **karrier lezárásakor** mozdul, csak felfelé
(`runBoardOnClose`). Ez szándékos, és ez a javítás nem nyúl hozzá — de ha egy
karrierben már volt korábbi D1-es cím, akkor az újabb bajnoki idény önmagában
nem visz fel új sort a listára; a záró Run a karrier lezárásakor kerül fel.

## Tesztelés

Playwright, headless Chromium.

**Valódi végigjátszás** (friss hagyományos karrier → kész klub → Santos FC 1962
→ D2 → alvó mezőny → scout → kémia → edző → kapitány → képesség → szezon):

- a végigjátszás **28 fordulót futott le** magától, majd a **29. forduló előtt
  megállt**: `S.auto` hamis, a gomb felirata „Szezon végigjátszása",
  `S._autoTitleAsk="1:28"`, és a „🏆 Bajnoki tétmérkőzés következik" kártya
  a valódi ellenféllel („São Paulo FC (1992) ellen") és a valódi feltétellel
  („a győzelmed mellé más eredmények is kellenek") nyílt meg;
- **„Rendben, én játszom le"** → felkészülés, a kezdőrúgás-gomb felirata
  „🏆 BAJNOKI TÉTMECCS — 29. forduló";
- a kézzel lejátszott mérkőzés után megjött a **bajnokavatás** (BAJNOKOK!,
  trófea-modál), a végigjátszás pedig kikapcsolva maradt.

**Kapuk** (valódi `startRound` / `askConfirm`, kimért állapoton):

- párharc-forduló, hiányzó menetrend-sor, `S.idx>=30`, futó kupasorozat és
  kikapcsolt auto mellett a kapu **nem áll meg**, `S.auto` érintetlen;
- ugyanazon a fordulón másodszor **nem** áll meg; a **következő** tétmérkőzés
  előtt viszont igen (`key` „6:24" → „6:25");
- a végigjátszás kérdése kiírja a tétmérkőzés-figyelmeztetést, és az „igen"
  elindítja a szezont anélkül, hogy rögtön újra megállna;
- az `askConfirm` nem-gombja a következő, feliratot nem kérő hívásnál
  visszaáll „Mégse"-re.

**A háló** (valódi `afterLeagueRound` → `showChampionScreen` →
`runD1FinaleNow` → `showRunFinale`, D1-es piramis-állapoton):

- `S.auto` igaz mellett a kihirdetés **megállítja** a gépet (gomb felirata
  visszaáll, napló-sor megjelenik), `S.runFinaleSeason` a záruló idényre áll;
- a trófea bezárása után a **Run-záróképernyő** jön („🏆 A CSÚCSON — D1-ES
  BAJNOKI CÍM"), a közvetítés-képernyő félreállt;
- a „Tovább →" bezárja a záróképernyőt és **visszahozza** a közvetítést.

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.
