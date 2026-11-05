# 3.9.367 — a CPU-ellenfél meccs-ereje egy számmal

## Kérés

> „Szüntessük meg a CPU ellenfelek meccserejének kijelzésénél a kiegyenlítő
> + értéket, és már eleve a teljes SUM meccs erő legyen ott mindig
> megjelenítve. Ez a kiegyenlítő már régen nem tölt be olyan szerepet. Ott
> van ugyan, de a lényeg úgyis az lesz, hogy a meccserők igazodnak
> egymáshoz. Szóval az ellenfélnél nem kell a dupla kijelzés. A saját
> számunk és a PvP párharcban a másik játékos ereje lehet így kijelezve."

## Változás

A CPU-ellenfélnél mindenhol a teljes ⚡ áll (a csapat ereje és a ⚖ együtt),
külön ⚖ tag nélkül:

- **Eredményjelző:** „⚡156,8”, a korábbi „⚡143,8 ⚖+13,0” helyett.
- **Edzői elemzés:** a fejlécben nincs „(benne ⚖ +x)”. Az ellenfél-szekció a
  teljes ⚡-t írja; eddig tévesen a csapaterőt írta ⚡ jellel, mellette a ⚖-t.
- **Kupa, a következő meccs:** nincs „(saját X ⚖+Y)”.
- **Kupa, a sorozat mezőnye:** „A sorozat mezőnye: ⚡X”. A külön „Nehézségi
  kiegyenlítés” sor megszűnt.
- **Célrés-ablak:** „A mezőny: ⚡X — a teljes meccs-erő, amivel ellened
  kiáll”.

Ami marad:
- **A saját oldal bontása:** az eredményjelzőn a 📈 tartós forma, a
  célrés-ablakban a „nyers + meccs-extra = ⚡”.
- **A párharc ellenfele:** a társ ⚡-ja és a csapatlapja, ahogy eddig.

A motor nem változott. A ⚖ ugyanúgy rákerül a CPU-ellenfélre, csak nem
írjuk ki külön.

## Próba

A régi elvárásokat az új kijelzéshez igazítottuk:
- `tools/nyomas-es-meccsero-proba.js` — a CPU sorában a teljes ⚡, nincs
  `.sbKieg`;
- `tools/hsz-merce-3-9-200-proba.js` — a HSZ és a BL mezőnye ⚡-val, ⚖ sor
  nélkül; a következő meccs bontás nélkül;
- `tools/celres-meccsero-3-9-364-proba.js` — a mezőny egy számmal.
