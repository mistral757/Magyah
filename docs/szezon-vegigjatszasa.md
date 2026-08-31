# A szezon végigjátszása megerősítést kér

> **3.8.33 óta a végigjátszás magától is megáll** — a bajnoki tétmérkőzés
> előtt, hogy azt te játszhasd le. Lásd
> `docs/szezon-vegigjatszasa-tetmerkozes.md`.

*(3.7.25. Érintett kód: `$("autoBtn").onclick`, `hubTacticConfirmModal`
z-indexe. A meglévő, változatlan mechanika: `askConfirm`, és minden `S.auto`
ág a motorban.)*

## A tünet

A **Szezon végigjátszása** gomb a meccsképernyő gombsorában ül, közvetlenül a
**Kezdőrúgás** ALATT, teljes szélességben. Eddig **egy koppintásra** elindult:

```js
S.auto=true;
$("autoBtn").textContent="Megállítás";
if(!S.playing&&S.idx<30)startRound();
```

Egy elcsúszott ujj tehát azonnal, visszavonhatatlanul lejátszotta a szezon
hátralévő részét — akár harminc fordulót. Mire a felhasználó észbe kapott és
megnyomta a Megállítást, addigra a gép már több fordulónyi döntést hozott meg
helyette. Ami lefutott, azt nem lehet visszacsinálni.

## Miért nem „csak egy gyorsítás"

A végigjátszás nem a tempót állítja: **kiveszi a kezedből a döntéseket**. A
motorban tizenöt körül van azoknak az ágaknak a száma, amit az `S.auto`
átugrik vagy magától old meg. Ezek a lényegesek:

| ág | mi történik auto-módban |
|---|---|
| `autoAssignSkill` | a jutalom-képességeket a gép osztja ki |
| `unavailableStarters` / `openAbsencePanel` | a hiányzók helyére magától áll be pótlás — nincs hiányzó-panel |
| `showHalfSeasonTable` / `twOpenCheckpointWindow` | kimarad a féltávi tabella és az átigazolási ablak (a téli scoutolással együtt) |
| `showCareerUnlockReveal` | az új felfedezések némán a keretbe kerülnek |
| `subHalftimeStopOn` / `halftimeSubsOn` | nincs csereszünet, nincs félidei csere |
| `friendlyCupDecline` | a nyári felkészülési kupára nem nevez |
| `pyrPoPlayable` | **piramisban az osztályozót nem te játszod** — szimuláció dönti el a fel- vagy kiesést |

A `tickMs` is 18 ms lesz (a normál ~330/tempó helyett), tehát a mérkőzések
nézhetetlen sebességgel futnak — de ez a legkisebb baj a fentiek mellett.

## A megoldás

**A bekapcsolás kérdez, a kikapcsolás nem.**

```
koppintás a "Szezon végigjátszása" gombra  ──►  askConfirm  ──►  Igen ──► indul
                                                             └──►  Mégse ──► nem történt semmi
koppintás a "Megállítás" gombra            ──►  azonnal megáll
```

A megállítást senki nem bánja meg, és egy megerősítés ott csak **további
fordulókat játszatna le**, amíg a felhasználó a kérdést olvassa. Ezért az az
ág változatlanul egy koppintás.

A kérdés **kimondja, mi kerül ki a kezedből** — nem általánosságban ijesztget,
hanem felsorolja a fenti táblázat tételeit, és a hátralévő fordulók valódi
számával nyit („A gép **22 fordulót** játszik le…"). Az osztályozó-sor csak
piramis-karrierben jelenik meg (`pyrOn()`), ahol tényleg van mit elveszíteni.

Az „igen" ága védett: ha a kérdés nyitva léte alatt közben elindult a szezon
(`S.auto` már igaz), a visszahívás nem indít újabb fordulót.

## Egy mellékjavítás: a párbeszéd tényleg lemondható

Az `askConfirm` ablaka (`#hubTacticConfirmModal`) `z-index:100`-on állt, és a
markupban ott a szándék: *„a megerősítő kérdés az UTOLSÓ réteg"*. Ezt a szám
mégsem tartotta: a vezetés alsó buborékai magasabbak —

| réteg | z-index |
|---|--:|
| `#guideTip` (tipp-buborék) | 440 |
| `#tNudgeWhy` („miért villog?") | 445 |
| `#tSteps` (lépéssor) | 450 |
| `#mpSubPanel` | 460 |
| **`#hubTacticConfirmModal`** | **100 → 470** |

Egy nyitott tipp-buborék tehát a kérdés kártyájának az ALJÁRA takart —
pontosan a **Mégse** gombra. Egy válaszra váró párbeszédnek lemondhatónak kell
lennie, egy tipp pedig sosem takarhatja el; a modal ezért 470-re került, a
legfelső ismert réteg fölé. (A háttérre koppintás eddig is bezárta, de az nem
felfedezhető kiút.) Ez MINDEN `askConfirm`-ra érvényes, nem csak erre az egyre.

## Tesztelés

Playwright-tal, egy futó bajnoki szezonban:

- **koppintás a gombra** → megnyílik a kérdés, `S.auto` HAMIS marad,
  `S.playing` hamis, `S.idx` nem mozdul, a gomb felirata változatlan;
- **Mégse** → az ablak bezárul, `S.auto` hamis, `S.idx` változatlan;
- **Igen** → `S.auto` igaz, a gomb „Megállítás", és három másodperc alatt hat
  forduló lefutott;
- **Megállítás** → egy koppintás, kérdés nélkül, `S.auto` hamis;
- **piramis-karrier**, a 8. forduló után → a kérdés „Igen, jöhet a **22**
  forduló"-t ír, és megjelenik az osztályozó-sor is;
- **képernyőkép** egy nyitott vezetés-tipp mellett: a **Mégse** gomb a
  buborék FÖLÖTT, teljes egészében látszik és kattintható.

`tools/check.sh` zöld.
