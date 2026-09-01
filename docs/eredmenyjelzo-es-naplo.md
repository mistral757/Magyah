# Az eredményjelző és a napló nem csúszhat egymásra

*(3.8.36. Érintett kód: `sbSyncFeedToBoard`, `sbBoardFlowTop`,
`sbKeepBoardInPlace`, a `#sbWrap`-re állított `ResizeObserver`, a
`sbRenderEvents` záró hívása, és a `#sbEvents` `max-height`-je. A meglévő,
változatlan mechanika: `sbSizeFeed`, `sbLockView`, `stadiumSync`, és a
stadion-mód teljes CSS-blokkja.)*

## A tünet

> „el van csúszva az eredményjelző és a feed. nem tudom minden meccsen így
> van-e, de többször előfordult már"

A retró eredményjelző **rátakart a közvetítés-napló tetejére**: a legfelső
napló-sorok félig eltűntek a tábla alsó pereme mögött, a tempó-csúszka és a
gombsor pedig lecsúszott a képernyő aljáról.

## Miért csak „többször", és nem mindig

A napló magasságát a `sbSizeFeed` **inline** méri rá, és **egyszer**: a
kezdőrúgáskor (`sbLockView`). A mérés pontos — a tábla tetejétől a kártya
aljáig minden férjen bele a képernyőbe.

Csakhogy **a tábla menet közben nő**. A gólkrónika minden ÚJ gólszerzővel egy
sorral hosszabb lesz, egy mesterhármas percei pedig több sorba tördelődnek
(`58', 86', 90+8,` / `90+10`). A mérés viszont nem futott újra.

Ezért függött a hiba a **gólok számától**: egy 1:0 után észre sem venni, egy
0:8 után — a bejelentett meccsen — már kiabál.

## Mérve

430×932-es telefonon, a bejelentett meccs krónikájával (nyolc gól, öt
gólszerző):

| | kezdőrúgáskor | nyolc gól után |
|---|--:|--:|
| a tábla magassága | 185 px | **253 px** |
| a naplóra kimért hely | 591 px | **591 px** (változatlan) |
| túlgörgetés | 0 | **68 px** |
| látható átfedés | 0 | **42 px** |

## A javítás két fele

### 1. A napló helye követi a tábla méretét

Két hívó, **egy** mérés — a magasság-őr miatt a második hívás no-op, tehát nem
tud kétszer dolgozni:

- **a gólkrónika újrarajzolása** (`sbRenderEvents`) — azonnali, és nem függ
  semmilyen böngésző-támogatástól;
- **egy `ResizeObserver` a táblán** — ez fogja el mindazt, amit a krónika nem:
  a tördelő csapatneveket, a párharc-összesítő sorát, a betűtípus késői
  betöltését és minden jövőbeli táblasort.

```js
let _sbWrapH=-1;
function sbSyncFeedToBoard(){
  …
  const h=Math.round(wrap.getBoundingClientRect().height);
  if(!(h>0)||Math.abs(h-_sbWrapH)<1)return;   /* nincs valódi változás */
  sbSizeFeed();
  …
  _sbWrapH=Math.round(wrap.getBoundingClientRect().height);   /* a mérés UTÁNI */
}
```

A magasság-őr egyben a **végtelen kör** ellen is véd: a mérés a naplót állítja,
nem a táblát, tehát a következő hívás kilép. A feljegyzett érték szándékosan a
mérés **utáni** magasság: a `sbSizeFeed` az elrendezésen is igazít
(`sbApplyLiveLayout`), tehát a tábla maga is mozdulhat egy hajszálnyit.

### 2. A görgetés is elcsúszik — és ez volt a nagyobbik fele

Az újramérés **önmagában kevés volt**. Amikor a tábla megnő, a böngésző
görgetés-horgonya lejjebb tolja a lapot, hogy a tartalom a helyén maradjon — a
napló viszont közvetlenül utána ugyanannyival **összemegy**, és a lap ott marad
**túlgörgetve**. A tábla `position:sticky; top:0`, tehát kitapadva ül a képernyő
tetején, és rátakar a naplóra.

Mérve: az 1. javítás után a napló helye már helyesen szűkült (591 → 523 px), és
a kártya befért — az átfedés mégis megmaradt 42 px-en, mert a lap 68 px-szel
lejjebb állt.

Élő mérkőzés alatt a helyes állapot az, amit a kezdőrúgás beállít: a tábla a
**saját helyén**, alatta a teljes napló, görgetés nélkül. Ezért ha a tábla
kitapadt, visszaállunk a folyambeli helyére — **ugrás nélkül**, nem animálva:
ez nem navigáció, hanem az elrendezés helyretétele, és két gyors gólnál az
animációk egymásra futnának.

A tábla folyambeli helyét ugyanaz a `sbBoardFlowTop` méri, amit a kezdőrúgás is
használ (a mérés idejére kivesszük a tapadást, különben kitapadva mindig 0-t
mérnénk) — a képlet a `sbLockView`-ból emelve, hogy egy helyen éljen.

**Az első mérés kimarad a görgetés-igazításból:** ott a `sbLockView` saját,
három ütemű görgetése viszi a nézetet, és azt nem szabad félbevágni.

### Védőháló: a krónika nem eheti meg a képernyőt

A napló követése nem végtelen: a `sbSizeFeed` 140 px-nél megáll. Egy
gólzáporban a krónika enélkül átlépné ezt a határt, és **ugyanaz a csúszás
jönne vissza, csak később**. A `#sbEvents` ezért álló nézetben a képernyő
ötödénél megáll (`max-height:20vh; overflow:auto`), és onnan magában görget —
ugyanaz az elv, ami a stadion-módban már eddig is állt (ott 38%, mert ott a
tábla a főszereplő). A 20vh a szokásos telefonon 10-12 krónika-sor.

## Tesztelés

Playwright, headless Chromium, **valódi karrieren**, 430×932-es nézetben — a
mérés a tábla és a napló valódi geometriájából dolgozik (a kártya túllógása a
képernyőn, és a kitapadt tábla átfedése a napló tetején):

| eset | 3.8.35 | 3.8.36 |
|---|---|---|
| kezdőrúgás, gól nélkül | ✓ | ✓ |
| **nyolc gól, öt gólszerző** (a bejelentett meccs) | ✗ 42 px átfedés | ✓ 0 px · a napló 591→523 px · a görgetés nem mozdul |
| **húsz gól** | — | ✓ 0 px · a tábla 343 px-nél megáll, a napló 432 px |
| lefújás után (a gombsor visszajön) | — | ✓ 0 px · a napló újraméretezve |
| **fekvő (stadion) mód** | — | ✓ érintetlen: a krónika 38%, `overflow:hidden`, a napló inline magassága törölve, a CSS osztja a helyet |

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.
