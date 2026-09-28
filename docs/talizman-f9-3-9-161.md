# 3.9.161 — Talizmánok F9: egyensúly, kapcsoló, súgó, lezárás

A talizmán-rendszer utolsó fázisa.

## ⚖️ Az egyensúly mérése

`tools/talizman-egyensuly-proba.js`: 10 karrier × 10 idény = 100 idény.

* **A kínálat és a választás** a valódi függvényekkel megy: `talKinalat`, `talValaszt`, és a fúziót is összeolvasztja.
* **Idényenként 5 húzás**, ami a plafon közelében van, tehát inkább felülbecsül.
* **Két stratégiát mér:**
  * a specializáló a legritkább lapot viszi, azonos ritkaságnál a domináns színt;
  * a meccsre építő mindig a Meccs lapot viszi, ha van.
* **A meccserő-hozam** a motor saját mércéje: `hiddenMatchBonus()` a paklival és nélküle, plusz a morál-célra ható tagok meccserő-egyenértéke.

| a 10. idényben | specializáló | meccsre építő | a terv korlátja |
|---|---|---|---|
| meccserő-hozam (átlag / max) | +0,51 / +1,08 | +0,73 / +1,09 | ≤ +1,5 |
| bevételi hozam (átlag / max) | +6,5% / +15% | +4,7% / +15% | ≤ +15% |

Mindkét korlát tart, hangolni nem kellett. Amit a mérés még mutat:

* **Előfordulás a tíz specializáló paklin:** színhűség 10/10, morál-jel kontra 8/10, Ingyen ember 2/10, Bővített stáb 3/10.
* **Méret:** átlagosan 47 lap és 8 legendás 10 idény alatt.
* **Mítosz:** 100 idény alatt egy sem született. Ahhoz két legendás lap kell **ugyanazzal a speciállal**. A terv „egy karrierben jó esetben egy-kettőt” írt. Ha ez kevés, a fúzió-esély (`TAL_FUZIO_P`, most 12%) a legendás helyeken emelhető. Ez hangolási döntés, nem hiba.

## 3.9.162 — gyakoribb fúzió, elérhető Mítosz

> „Emeljük a fúzió esélyét."

Két változás:

* **A fúzió-esély 12% → 35%** (`TAL_FUZIO_P`), kínálati helyenként.
* **A legendás gyűjt.** Eddig csak két legendás adott Mítoszt, a legendás ritkasága (3%) miatt ez gyakorlatilag nem jött össze. Mostantól ha egy legendásba egyszer már beolvasztottál egy nem legendás lapot, a következő fúzió (bármilyen ritkaságú lappal) Mítosz. Két legendás továbbra is azonnal Mítosz.

Mérve (10 karrier × 10 idény, specializáló stratégia):

| fúzió-esély | fúzió / 10 idény | Mítosz / 10 idény | meccserő-hozam |
|---|---|---|---|
| 12% (régi szabály) | 2,8 | 0 | +0,51 |
| 25% | 6,0 | 0,5 | +0,58 |
| **35%** | **8,5** | **0,8** | **+0,52** |
| 50% | 11,4 | 1,9 | +0,39 |

A 35% egy 15 idényes karrierben körülbelül egy-két Mítoszt ad, ahogy a terv
írta. Az egyensúly-korlátok továbbra is bőven tartanak.

## 🔘 A kapcsoló

A Talizmánok menü alján két kapcsoló áll.

* **„🧿 Talizmánok: be / ki”** (`S.talOff`).
  * Kikapcsolva a rendszer semleges: nincs húzás, és egyik talizmán sem hat.
  * A gyűjtemény megmarad, visszakapcsolva ugyanott folytatod.
  * A HUB-gomb ilyenkor is kint van („kikapcsolva”), onnan kapcsolható vissza.
* **„⚔ a párharcban is”** (`S.talDuelOff`).
  * Kikapcsolva a SAJÁT pillanatképed talizmán-mezői nem mennek át a társ gépére (`talSnapTisztit`).
  * A társ gépén a hiányzó mező semleges, tehát a meccs a két gépen továbbra is bitre ugyanaz.
  * A társad saját talizmánjait ez nem érinti.

Alapból mindkettő be van kapcsolva.

## A kész részek adósságai

* **Lojális stáb.** A „nem távozhat büntetésből” fele kikerült a lap szövegéből. A játékban nincs olyan büntetés, ami stábtagot visz el, tehát fedezet nélküli ígéret volt. A 3 évvel későbbi kiöregedés marad.
* **Visszavásárlás.** Kész a 3.9.156-ban: a visszavett játékos az eladáskori korával (+ az eltelt idényekkel) jön vissza.
* **Utolsó perces bomba.** A HUB talizmán-gombja mostantól kiírja: „💣 ajánlat vár!”.
* **A talizmán-próbák véletlen-függése.** Az `f6b` Versenyszellem-állítása determinisztikus lett (3.9.158). A régi kispados „rivális-lopás” okozta a ritka bukást.

## 📖 A súgó

A „Talizmánok” bejegyzés utolsó mondata eddig így szólt: „A specialok később
jönnek.” Helyette most ezek állnak benne:

* a speciálok működése, és a menü gombjai: Titkos fegyver, Pénzfeldobás, Tükörvilág, bomba, visszavásárlás, Lélekbúvár, hitel;
* a morál-jel;
* a színhűség, a rezonancia, a Mesterlap és a Polihisztor-díj;
* az égetés, a fúzió és a Mítosz;
* a trófea-húzás, az öröklap és a Kártyatár;
* a kapcsoló.

## Próba

* `tools/talizman-egyensuly-proba.js`: a két korlát.
* `tools/talizman-f9-proba.js`: a kapcsoló, a párharc-tisztítás, a HUB és a súgó.
* A teljes regresszió.
