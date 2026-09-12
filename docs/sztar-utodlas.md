# Ha a sztár elmegy — a trón és az utódlás (3.9.63)

> „Ha a sztárom el akar menni, akkor a helyére jövő játékos veszi át a sztár
> szerepet vagy senki nem lesz sztár? Vagy újra tudok választani?"

A válasz eddig az volt, hogy **egyik sem** — és ez nem hiányzó funkció volt,
hanem egy néma hiba.

## Mi történt valójában

A `S.style.star` egy **név** volt, amit a filozófia választása beégetett, és
utána soha senki nem írt át. Ha a sztár kikerült a keretből (eladás,
elvágyódás, visszavonulás), a név maradt, a személy nem — és ettől a stílus
**csendben meghalt**:

| rendszer | mi történt a sztár távozása után |
|---|---|
| stílus-mérföldkövek | a sztárra mutató mérések örökre nullán álltak (`msStar()` nem találta a keretben) |
| hírességpont | nem gyűlt tovább — minden forrás a névre szűr |
| híresség-bevételek | reklám, befektető, szurkoló-robbanás: elapadtak |
| sztárhoz kötött képességek | „Nélküle nem megy", „A rendszer ő", „Reflektorfény": sosem teljesültek többé |
| a játék üzenete | **semmi** |

Vagyis egy végleges, egész karriert meghatározó döntés vált használhatatlanná
egyetlen átigazolástól, magyarázat nélkül. A stílus ráadásul **szándékosan** a
legkockázatosabb ebből a szempontból: itt kétszer olyan gyakori az elvágyódás,
és ha jön, 50% eséllyel épp a sztár akar menni.

## Három állapot, nem kettő

1. **Van sztár** — amíg a keretedben van, **nem cserélhető**. A kijelölés
   végleges marad; egy „hangulatból lecserélem" gomb az egész filozófiát
   értelmetlenné tenné.
2. **Üres a trón** — a sztár kikerült a keretből. A stílus nem hal meg, hanem
   **arc nélkül marad**: a híresség-bevételek szünetelnek, a sztárhoz kötött
   képességek alszanak, és a felület **cselekvést kér**.
3. **Utódlás** — bármelyik kerettagodat kinevezheted. A mérföldkövek innentől
   róla szólnak.

## Az ár a távozáskor dől el, nem a kinevezéskor

Ez a rendszer legfontosabb döntése. A büntetés azt érje, ami **tényleg
történt** (elvesztetted a klub arcát), ne azt, hogy utána rendbe teszed a
klubot. Így a várakozás semmit nem spórol — csak a híresség-bevételt viszi,
amíg üres a trón.

**Két kijárat, két ár:**

| hogyan ment el | a hírességpontból marad |
|---|---|
| **nálad vonult vissza** | **85%** — a legenda a klubé maradt |
| eladtad / elengedted | **60%** |

A különbség a hűség jutalma, és egyben a stílus saját drámája: megéri-e
kifékezni egy öregedő legenda pályafutását a klubnál, ahelyett hogy a csúcson
eladnád.

Mellé egy egyszeri **−8 morál** (a klub elvesztette az arcát), amiből az új arc
kinevezése **+4-et visszaad**.

## Ami elévül, és ami megmarad

**Elévül** (ezek egy EMBER követelései voltak): a gólbónusz-alku, a halmozott
béremelés, a sértődés-számláló és a függő mezszám-kérés. Ez a távozás egyetlen
jó híre — az új arc **tiszta szerződéssel** indul.

**Megmarad**: a teljes képességfa, minden már teljesített mérföldkő, és a
hírességpont megmaradó része.

**Átáll**: a többi mérföldkő innentől az **utód** klubnál összeszedett számait
méri (meccs, gól, díj, kártya, összhang). Az elődje gyűjtése nem öröklődik rá
— de ami az utódnak **már megvan nálad**, az beszámít. Ezért érdemes olyat
kinevezni, akinek már van múltja a klubban, nem a tegnap érkezett újoncot.

## Az őr: egy kérdés, hét távozási út

A távozás hét úton történhet (eladás, piaci ajánlat elfogadása, elvágyódás
elengedése, halasztott megtartás bukása, visszavonulás, elengedés, csere). Ezt
a hetet nem külön-külön kezeljük le — egyetlen olcsó kérdés dönt: **benne van-e
még a keretben?**

```js
function starWatch(){ … if(!keret.some(x=>x.n===st.star)) starVacate(); }
```

Két helyről fut: a **HUB újrarajzolásából** (minden átigazolási út ide tér
vissza) és a **szezonváltásból**, közvetlenül a visszavonulások után. Üres
keretre szándékosan nem lő: egy pillanatnyi átmeneti állapot (csere közben)
különben hamis távozást jelentene.

A kijárat fajtáját a `starMarkRetired()` jelöli meg a szezonváltásban — ez köti
össze a visszavonulást a 85%-os ággal.

## Régi mentés: az első őrjárat ingyenes

Ha a betöltés pillanatában már nincs a keretben a sztár, azt **ingyen**
vezetjük át: nincs hírnév-veszteség, nincs morálütés. Nem tudjuk, mikor
történt, és egy régi kárért nem büntetjük meg utólag a játékost — annál is
kevésbé, mert az a kár épp ennek a hibának a következménye volt.

## Ahol a játék most kimondja

- **Eladás megerősítése** (azonnali eladás és piaci ajánlat elfogadása is),
- **elvágyódás-képernyő** — számmal: mennyi hírnév marad,
- **nyugdíj-bejelentés** — itt a jó hír: ha nálatok vonul vissza, 85% marad,
- **a Csapatstílus menü jelvénye** — „dönts!", amíg üres a trón,
- **a stílus-panel** — az üres trón kártyája a hős alatt, és legalul
  „A klub arcai voltak": minden volt sztár, idényekkel, meccsekkel, góllal és a
  hozott hírességponttal.

Egy húsz szezonos karrier így három-négy arcot él meg — a stílus
több-generációssá válik ahelyett, hogy az első eladásnál véget érne.

Mérés: `tools/sztar-utodlas-proba.js` — 28 állítás.
