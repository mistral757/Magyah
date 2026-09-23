# 🧲 Miért nem volt pontrendszere a Gegenpressingnek (3.9.131)

> „A gegenpressing nem kapott olyan pontrendszert, mint az összes többi
> csapatstílus… Miért maradt ki? Pótoljuk!"

## Nem maradt ki — elveszítette a sorsolást

A Gegenpressing gazdasága (🧲 Nyomás · presszpont · Fojtás, és a 🧪
Laboratórium piaca) a 3.9.105 óta benne van a táblában, a tarifája be is van
kötve (a labdaszerzés, a gól és a tiszta lap fizet). Csak épp **nem futott**.

Az `engKey()` fejléce azt ígérte, hogy „a stílus-slotokból (elsődleges +
másodlagos) az ELSŐT" választja. A kód viszont nem a slotokon, hanem az
**`ENG_DEFS` tábla sorrendjén** ment végig, és az első élő találatnál megállt —
egyszerre pedig csak **egy** motor futott:

```
villam · bombazok · beton · harmonia · tikitaka · gegen
```

A Gegen a tábla **utolsó** sora, tehát minden más motoros stílus mellett
vesztett — **elsődlegesként is**. Mérve, a javítás előtt:

| Elsődleges + másodlagos | Ez futott |
|---|---|
| Gegen + Villám | **Villám** |
| Gegen + Tiki-taka | **Tiki-taka** |
| Tiki-taka + Bombázók | **Bombázók** (a másodlagos!) |
| Gegen + Panzer | Gegen (a Panzernek nincs ilyen motorja) |

A panel pedig csak a futó motor szakaszát rajzolta ki — a Gegen panelje ezért
üres maradt.

## Miért nem elég a sorrendet megjavítani

Ha csak a slot-sorrendre álltunk volna át, egy futó karrierben **a másik
gazdaság kapcsolt volna le** — a már megvett szintjeivel (meccserő) együtt, szó
nélkül. És a másodlagos stílus motorja továbbra sem futott volna, pedig a
3.9.111 kifejezetten szabályozza a sebességét („harmadáron gyűlik") — vagyis a
rendszer maga is számolt vele.

## Ami mostantól van

**Minden élő motoros stílus a saját gazdaságát viszi**: saját állapot, tarifa,
meccsenkénti plafon, mérleg és piac. Az elsődleges teljes, a másodlagos
harmadáron gyűlik.

| | |
|---|---|
| **a meccs** | minden tétel minden élő gazdasághoz eljut, és a SAJÁT tarifája dönt: a labdaszerzés csak a Gegennek fizet, a gól mindkettőnek |
| **a lefújás** | két külön mérleg, két külön plafon, két külön egyenleg |
| **a meccserő** | a két szint hozama összeadódik, de **együtt sem megy +12 fölé** — két gazdaság nem adhat kétszeres meccserőt ugyanazért; ez volt az eredeti „csak egy fut" szabály oka, és ez most is áll |
| **a piacok** | mindkét piac vásárolható; stílusonként egy token és egy egymeccses tétel élhet, a lefújás mindet elfogyasztja |
| **a panel** | mindkét stílus panelje a **saját** szakaszát rajzolja, és a gombjai a nézett stílus egyenlegéből fizetnek |

A Panzer rettenete (+20) ettől független, ahogy eddig is.

**Futó karrier:** semmi nem vész el. Ha eddig a másodlagos stílus gazdasága
futott, az megy tovább (harmadáron, ahogy kellett volna), a megvett szintjei
élnek — és mellé elindul az elsődleges is, nulláról.

## Amit még érdemes tudni

A Gegen legnagyobb bevételi tétele a **labdaszerzés az ellenfél térfelén** —
az viszont csak akkor történik meg, ha a fán megvan a **Nyomásgyakorlás**
(1. szint, a szöveg szerint ez „nyitja a filozófia saját motor-csatornáját").
Addig a presszpont csak gólból (0,2) és tiszta lapból (1,0) jön.

## A próba

`tools/gegen-pontrendszer-proba.js` (9123, 21 állítás): a hiba reprodukciója;
**mind a harminc** rendezett stílus-pár; a Panzer melletti eset; a meccs
tételei stílusonként; a két külön mérleg és plafon; a közös +12-es meccserő-
plafon; a két piac egyszerre; és hogy a Gegen panelje megkapja a szakaszát.
