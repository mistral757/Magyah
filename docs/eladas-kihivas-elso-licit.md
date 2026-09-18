# Az eladós kihívás határideje a legelső licit (3.9.94)

## A bejelentett kérés

> „Az olyan kihívásokról volt szó ahol egy játékosodat el kell adnod.
> Csak azzal a kitétellel, hogy az első adandó alkalommal el kell adja.
> És csak akkor kapja meg a teljesített kihívás jutalmat, amikor már ténylegesen
> eladta. És akkor a határidő ilyenkor nem a 8 meccs, hanem a legelső licit
> pillanata. (Persze ha azonnal eladod, akkor is teljesítve van.)"

## Mi volt eddig, és miért volt rossz

A „gyenge láncszem" kihívás (`replaceWorst`) egy **konkrét** játékosra szól:
add el a keret leggyengébb emberét. A határideje viszont ugyanaz a rövid,
**nyolc meccses** ablak volt, mint minden más rövid vállalásé.

Csakhogy az eladás **nem rajtad múlik**. A licit akkor jön, amikor jön:
az első ajánlatig `SALE_OFFER_MIN_ROUNDS`–`SALE_OFFER_MAX_ROUNDS` forduló telik
el, szezonközben pedig ablakonként egy érkezik (`saleMarketTick`). Nyolc meccs
alatt simán előfordul, hogy **egyetlen ajánlat sem születik** — ilyenkor a
kihívás nem nehéz volt, hanem **teljesíthetetlen**, és az egyetlen kiút az
INGYEN elengedés maradt. Az pedig nem eladás, hanem veszteség.

## Mi lett belőle

A `replaceWorst` sablon új mezőt kap:

```js
deadlineKind:"firstBid"
```

amiből a kihívás-építő `deadline:{kind:"firstBid"}`-ot csinál a szokásos
`{kind:"round",value:S.idx+8}` helyett.

### Az idő múlása nem viszi el

Az `evaluateDueChallenges(kind,value)` csak akkor nyúl egy kihíváshoz, ha
`ch.deadline.kind===kind`. Mivel a `"firstBid"` sem nem `"round"`, sem nem
`"season"`, a lejárat-kiértékelők **soha** nem érintik. A vállalás addig él,
amíg a piac meg nem szólal.

### A határidő maga az ELSŐ licit

A kiváltó esemény a `chSaleRefused(name)`:

* **`saleRejectOffer`** — a nemet mondás. A hívás **megelőzi** a
  `rec.rejects` növelését, hogy a „hányadik licit ez" kérdésre még nulla
  legyen a válasz. Így pontosan az **első** licit visszautasítása bukik,
  a későbbiek már nem bántanak (akkorra a kihívás úgyis lezárult).
* **`askSaleUnlist` → `onYes`** — a piacról levétel, amikor **vár** rá egy
  ajánlat. A megerősítő maga mondja ki, hogy „az is elszáll vele", tehát a
  kihívás szempontjából nem különbözik a nemtől. Licit **nélkül** a levétel
  nem bukás: a határidő maga a licit, az pedig még nem jött meg.

A büntetés a rendes úton megy (`resolveChallenge`), tehát a napló, a könyvelés
és a büntetés-kiosztás mind a helyén marad — csak a kiváltó esemény más.

### A jutalom az ELADÁS pillanatában érkezik

A `challengeEarlyPayable` már eddig is engedte a korai kifizetést az
állapot-kihívásoknál, a `releasePlayer` pedig burkolóban hívja a
`settleEarlyChallenges()`-t minden sikeres távozás után. Ez a két meglévő
darab adja ki a kért viselkedést: abban a pillanatban, ahogy a játékos
elhagyja a klubot, a `chWorstReplaced` teljesülést lát, és a jutalom befolyik.
**Ezért teljesít az azonnali eladás is** („eladás most") — ugyanazon az úton
megy.

Fontos, hogy a sikeres eladás **nem** eshet a bukás-ágba: a
`saleAcceptOffer` belső `saleUnlist`-je nem a megerősítő `onYes`-én megy
keresztül, tehát a `chSaleRefused` sosem fut le rá.

### Amit a felület kiír

| hely | szöveg |
|---|---|
| `challengeDeadlineText` | „az első licitig" (a „még 8 meccs" helyett) |
| `challengePayoutText` | „a jutalom az ELADÁS pillanatában érkezik" |
| a kihívás `rule` szövege | kimondja, hogy nincs meccs-határideje, hogy az első licit visszautasítása bukás, és hogy az azonnali eladás is teljesítés |

## Ami NEM változott

Minden más kihívás határideje meccsszám maradt. Az új ág kizárólag azokra
szól, amiknek `targetName`-ük van — a `replaceWorst` ma az egyetlen ilyen.

## Próba

`tools/eladas-kihivas-proba.js` (9043-as port). Tizenhárom állítás:
a határidő fajtája és a három kiírt szöveg; hogy sem a fordulós, sem a
szezonos lejárat-kiértékelő nem nyúl hozzá; hogy az **első** licit
visszautasítása bukik, a második már nem, és más játékosé sem; hogy a váró
licittel történő levétel ugyanaz a bukás, licit nélkül viszont nem; hogy a
valódi úton (`saleAcceptOffer` → `releasePlayer` → `settleEarlyChallenges`)
lement eladás **teljesítettként** zárja le a vállalást; és hogy a többi
kihívás határideje változatlanul meccsszám.
