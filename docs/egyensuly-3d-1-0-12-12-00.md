# 1.0.12.12.00 — Az Egyensúly-gól 3D-ben

**KIMONDOTT KÉRÉS:**
> „Az egyensúly gólt nem tudnád megcsinálni 3d új animációval? Olyan gagyi így a régivel. Nagyon kilóg"

## Mi volt
- A 3D motor az Egyensúlynál a Phalanx felvezetését játszotta (négy ember egy sorban).
- „Új” módban is a régi, rajzolt libikóka jött utána, mert csak abban élt a libikóka (1.0.12.10.00).

## Mi lett
Saját 3D forgatókönyv (`KAM_FORGATO.egyensuly`), a stadionban:

**A díszlet:**
- egy valódi libikóka a pálya hosszában, alátéttel; a palló tetején és oldalán látszik a fa;
- oldalról nézve (Főkamera) jól látszik a billenés;
- a pallón öt csapattárs, a rajzolt jelenet stábjából, saját arccal; a befejező a kapu felőli végén áll.

**A történet:**
1. A palló kileng, egyre kisebbet, majd vízszintesen megáll.
2. A befejező a kapu felé leugrik.
3. A súlya nélkül a túlsó vég a földre csapódik, a kapu felőli felcsap.
4. A középen pihenő labda felpattan, és ívben a befejező elé száll.
5. A befejező a levegőből fejel; a kimenetel fejes gól a célzott cellába, a háló kidomborodik.

**A kamera:** Főkamera, Magas kamera, Főkamera, végül kapu mögötti.

**A HUD:** a rajzolt jelenet feliratai ugyanúgy kint vannak („⚖️ … MP · TELJES EGYENSÚLY”, „HOPP!”).

„Új” módban az Egyensúly is csak a 3D jelenetet játssza. „Mindkettő” módban utána jön a rajzolt visszajátszás.

## Próba
**`tools/egyensuly-3d-1-0-12-12-00-proba.js`** ellenőrzi:
- a saját forgatókönyvet, az öt csapattársat (nem a befejező klónjait);
- a kilengést, a megnyugvást, a lecsapódást (a túlsó vég a földön, a kapu felőli fent) és a labda felpattanását;
- a gól-kimenetelt;
- hogy „Új” módban csak a 3D vásznon fut;
- hogy a fő szereplő minden vágásban a képen van, és nem pötty;
- hogy nincs oldalhiba.

A `felvezetok-1-0-11-13-00` próba archetípus-listájába bekerült az `egyensuly`.
