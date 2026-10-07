# 3.9.218 — 🎛️ Az új karrier alapbeállításai legfelül, nyitva — a scout ide költözött

> „A scout beállítást be kéne tenni az új karrier beállítások mögé. Oda való.
> Ezek a beállítások pedig legyenek legfelül és alap járaton mindig nyitva,
> hogy jól látsszanak!"

## Mi változott

| | Eddig | Most |
|---|---|---|
| 🎛️ Új karrier alapbeállításai | a Beállítások alján, becsukva | a Beállítások **legtetején**, **alapból nyitva** |
| 🔭 Scout | külön kapcsoló a Beállításokban (a futó karriert is váltotta) | a 🎛️ blokk **„Scout” sora**, rövid leírással |
| A blokk legördülői világos témában | olvashatatlanok (nem létező színváltozó) | a téma panel- és szövegszínét használják |

* **A „Scout” sor** két értéke: szokásos (felfedezés, mindig ingyen) és
  valósághű (licittel, minden 3. ingyen) — mindkettő csak átigazolási
  időszakban igazol. A sor az **új karrier alapját** írja (ugyanazt a tárolt
  preferenciát, amit a karrier-beállító „A keret” oldala is használ).
* **Becsukható:** ha becsukod, a munkamenetben csukva marad (a Beállítások
  újranyitásakor is); az oldal újratöltése után megint nyitva indul.

## Fontos következmény

A scout most már **karrierindító beállítás**, mint a többi a blokkban: a
**futó karrier scout-módja menet közben nem váltható** a Beállításokból. A
karrier indulásakor (`beginNewGame`) rögzül; a következő új karrier az itt
választottal indul. Közös karrierben továbbra is a házigazdáé él.

## Mérés

* `tools/scout-beallito-3-9-207-proba.js` — 3. szakasz: a különálló kapcsoló
  helyett a 🎛️ blokk sora; legfelül és nyitva; a tárba ír, a futó karrier nem
  változik; becsukva marad a munkamenetben. 4. szakasz: közös karrierben a
  Beállítások nem váltják a futó scout-módot.
* `tools/meres-scout-3-9-206-proba.js` — r8: nincs `#scoutRealBtn`, a sor
  megvan, a blokk nyitva, a váltás csak a tárat írja.
