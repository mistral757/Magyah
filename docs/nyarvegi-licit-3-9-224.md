# 📬 A nyár végi licit-garancia (3.9.224)

## A kérés

> „Nyári kupasorozat után, amikor a nyár végére lépünk, ott mindig érkezzen
> licit azokra, akiket legkésőbb a kupa előtt feltettünk az átigazolási piacra."

## Miért nem jött eddig

Az első licit a kitétel után **5–15 forduló** múlva esedékes. A várakozás a
karrier fordulószámlálóján (`saleCareerRound() = (idény−1)·30 + forduló`)
ketyeg — ez pedig az egész nyár alatt **áll**: a 30. forduló után, a kupán át
egészen az új idény 1. fordulójáig ugyanaz a szám. Aki a szezon végén vagy a
nyáron került a kirakatba, annak a határideje így mindig a **következő idény
közepére** esett, és a nyári átigazolási ablak licit nélkül telt el.

## A megoldás

| Pont | Hol | Mit tesz |
|---|---|---|
| Jelölés | `startEuroCampaign` → `saleKupaJelol()` | a nyári kupasorozat **első** indulásakor a kirakat minden emberét megjelöli (`rec.kupaGar = idény`). Minden nyári sorozat ezen megy át: az európai kupák, a hazai kupa és a Nyári Felkészülési Kupa is. A lánc második indulása (pl. MK → KL) nem jelöl újra; futó szezonban nincs jelölés. |
| Licit | `hubShowSeasonReportBody` → `saleNyarvegiLicit()` | a nyár végén (a kupa **után**, az öregítés után, az új idény **előtt**) a megjelöltek határidejét most-ra húzza; ha ebben a nyárban a licit-körük már elfogyott, egyet visszaad. Az ajánlat azonnal megérkezik (vagy a HUB első rajzolásakor, ha az ablak épp zárva volt), és a nyári ablakban dönthetsz róla. |

Szabályok:

* akinek **már vár** egy ajánlata, annak az marad — az a licit;
* a kupa **közben** (vagy utána) kitett ember nem kap garanciát, rá a szokott
  5–15 fordulós várakozás vonatkozik;
* a jelölés **egyszer** sül el: a szezonjelentés újranyitása nem ad újabbat;
* a licit összege a szokott módon sorsolódik (ügynökség, elutasítások,
  talizmánok, kihívás-zsetonok) — csak az **időpont** garantált, az ár nem;
* kupa nélküli nyáron (a felkészülési kupát kihagytad) nincs „kupa előtt",
  ott a régi ütemezés él.

## Próba

`node tools/nyarvegi-licit-proba.js` — 14 állítás: a jelölés (szezonban nem,
láncban egyszer), a garantált licit (a köv. idény közepére eső határidővel és
elfogyott körökkel is), a már várakozó ajánlat érintetlensége, a kupa közben
kitett ember kizárása, az egyszeriség, a két horog helye, oldalhiba nincs.
