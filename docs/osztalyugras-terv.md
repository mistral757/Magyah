# Osztályugrás-terv a nyár elején (3.9.96)

## A kimondott kérés

> „Ha lehetséges a játékos számára következő szezonban a szintugrás
> (hagyományos mód pl. D4ről egyből d2), akkor nyár végén legyen felül egy jól
> látható boxban egy leírás arról, hogy mennyibe kerülne minimum, és mekkora
> lenne a várható szint, amit el kellene majd érni. Hogy lehessen ezzel
> számolni a nyár végi költések szempontjából."

## A hiba időzítési volt

Az all-in osztályugrás (3.8.21) régóta megvan: a nyár legvégén kapsz egy
ajánlatot, amiben pénzért kihagyhatsz egy szintet. Csakhogy az ajánlat a
fel-/kiesés eldőlte **után** jön — vagyis akkor, amikor az átigazolásaid **már
lementek**.

Aki nem tudta előre, hogy létezik, az a nyarat végigköltötte, és az ajánlat egy
üres kasszát ért. A döntés így nem stratégia volt, hanem meglepetés.

## A nehéz rész: előre kell vezetni az osztályt

A piramis fordulója (`pyrSeasonTurn`) a nyár **után** fut. A nyári HUB-ban tehát
a `pyrMyDivId()` még a **mostani** osztályod — az ugrás árát viszont a
**következő** osztályod szabja (`PYR_LEAP_PRICE` a CÉL-osztály szerint).

Innen a kérésben szereplő példa is: a D4-ben bajnokként záró klub a nyáron még
D4-es, a következő idényt már D3-ban kezdi, és az all-in onnan viszi a D2-be —
**„D4-ről egyből D2"**.

A doboz ezért a végtabellából vezeti le a következő osztályt, pontosan azzal a
három szabállyal, amit a `pyrRollover` alkalmaz:

| helyezés (16-os mezőny) | mi lesz belőle |
|---|---|
| 1. | közvetlen feljutás (`PYR_UP`) |
| 2–3. | feljutási osztályozó (`PYR_PO_N`) — **két ág** |
| 4–13. | marad |
| 14–15. | bennmaradási osztályozó — **két ág** |
| 16. | közvetlen kiesés (`PYR_DOWN`) |

Ahol a kimenetel osztályozón múlik, ott a doboz **mindkét ágat kiírja**, a
saját árával és a saját cél-osztályával. Nem tippel a játékos helyett.

## Mit mond a doboz

```
🎲 Osztályugrás — mire tarts félre

D3 · Magyah Élmezőny-ban kezdenél (ha nyersz az osztályozón)
  → az ugrás a D2 · Biszem-baszom másodosztály-ba visz
  minimum 90 Mrd Ft · a D2 mai átlagereje 80,6 (a kereted 69,1 — 11,5 ponttal alatta)

D4 · Magyah Másodosztály-ban kezdenél (ha elbukod)
  → az ugrás a D3 · Magyah Élmezőny-ba visz
  minimum 60 Mrd Ft · a D3 mai átlagereje 78,1 (a kereted 69,1 — 9,0 ponttal alatta)

A büdzséd most 104 Mrd Ft. Ebből 14 Mrd Ft költhető el úgy,
hogy az ugrás (90 Mrd Ft) még beleférjen.
```

Az utolsó mondat a kérés lényege: **mennyit költhetsz el úgy, hogy az ugrás
még beleférjen.** A félretendő összeg a **legdrágább** ág ára — aki minden
kimenetelre készül, ennyit nem adhat ki. Ha nincs meg, a doboz azt írja ki,
mennyi hiányzik.

## Ami szándékosan alsó becslés

A doboz a cél-osztály **mai** átlagerejét mutatja. A világ fejlődése
(`pyrDevelopWorld`) a szezonfordulóban fut le, tehát mire odaérsz, a mezőny
ennél erősebb lesz — ezt a doboz ki is mondja. Egy pontosnak látszó, de
elavuló szám rosszabb volna, mint egy bevallottan alsó becslés.

## Hol áll, és mikor bújik el

A HUB **tetején**, közvetlenül a Run-mérő fölött — mert pont az a dolga, hogy a
költés **előtt** olvasd el.

Elbújik, ha: nem karrier · auto szezon · fut a szezon (`twClosedNow`) · a
legelső idény előtti áttekintő · még nem zárult le a szezon · már van élő
vállalás (`pyrLeapActive`) · vagy nincs megvásárolható ugrás (az élvonalban,
illetve a D5-be, ami nincs az árlistán).

## Mellékhatás: a tizedesvessző

A doboz a `pyrN1`-gyel formáz, tehát magyar tizedesvesszővel. Ugyanez a javítás
lement a **valódi ajánlaton** is (`pyrLeapOffer`), ahol eddig nyers
`toFixed(1)` állt angol ponttal — a két képernyőnek ugyanazt a számot ugyanúgy
kell leírnia.

## Próba

`tools/osztalyugras-terv-proba.js` (9047-es port), 21 állítás. Az első ág
pontosan a kérésben szereplő esetet méri: D4-ben bajnok → a következő idény D3
→ az ugrás a D2-be visz.
