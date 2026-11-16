# 🌘 1.0.9.7.00 — A rejtett csapatstílus a talizmán-menüben

## A kérés

> „A rejtett csapatstílus legyen ugyan rejtett, de a talizmánok felületen ott
> lehessen megnézni, melyik az, és mik lettek eddig feloldva, mik aktívak
> onnan."

## Mi látszik

A **🧿 Talizmánok** menü bal oszlopában, az aktív alaphatások alatt, egy új
blokk jelenik meg: **🌘 Rejtett csapatstílus** (`rejtTalHtml`).

- **Most a legjobb:** melyik nem választott stílus a legjobb rejtett stílus,
  hány mérföldkő-értékkel, és hány mérföldköve teljesült.
- **Mögötte:** a következő legfeljebb három jelölt, az értékükkel. Egy
  mérföldkő után bármelyik átveheti a vezetést.
- **Esélyek:** a négy esély a talizmánodból — stíluspont, I. szintű képesség
  (az idényenkénti plafonnal és az idei számmal), II. szintű ajánlat, meccs
  előtti titkos szerep.
- **Árnyék-mérföldkövek:** az eddig így szerzett csapatstílus-pontok.
- **Feloldott képességek:** stílus, név, szint, idény és állapot:
  - ✅ aktív;
  - ⏸ a stílus élővé vált — ott a saját képességfája szól;
  - ⏸ a talizmánok ki vannak kapcsolva.
- **Titkos megbízatás:** ha a következő meccsre kiosztott, ki kapta és
  milyen szerepet.
- **Élő ajánlat:** a II. szintű ajánlat ára és a „Megnézem” gomb. A gomb
  bezárja a menüt, és megnyitja az ajánlatot; a megerősítő ablak egy rétegen
  van a menüvel, ezért a menü különben takarná.
- **A mérés indulása:** amíg nem indult el, egy sor jelzi, hogy a következő
  meccs után kezdődik.

A blokk csak akkor jelenik meg, ha van Rejtett csapatstílus talizmánod, vagy
már van rejtett állapotod (feloldott képesség, pont, ajánlat).

## Ami nem változott

A rejtett stílus máshol továbbra is név nélkül dolgozik: a naplóban, a HUB-on
és a csapatstílus-menüben. A blokk csak olvas, semmit nem módosít.

## Próba

`tools/rejtett-talizman-1-0-9-7-00-proba.js`:

- rejtett állapot és talizmán nélkül nincs blokk;
- a blokkban ott a legjobb és a mögötte álló stílus, a négy esély, a
  képességek állapottal (aktív / élővé vált) és a pontok;
- a „Megnézem” gomb a menü fölött nyitja meg az ajánlatot;
- a HUB-on a stílus neve nem jelenik meg.
