# 🔗 1.0.11.0.00 — A Szinergia ára a két érintett stílus saját pontgyűjtőjéből

*(major — a futó karrierek szabálya is átáll: a KÖVETKEZŐ Szinergia-szint ára
mostantól máshonnan megy. A már megvett szintek megmaradnak.)*

> **KÉRÉS:** „A szinergia gól szintjeit ne csapatstílus pontból, hanem az
> érintett csapatstílusok saját pontgyűjtőjéből lehessen venni. Mindkettőből
> bele kell adni 100-at az első szintért, 200-at a másodikért és 300-at a
> harmadikért. Ha ezt választod maxra fejlesztésnek, akkor a max az 500+500
> saját pont a két érintett csapatstílustól (itt a rettenet, csillagpont,
> villámpont, passz pont, presszó pont, ezekre gondolok).”
>
> Két kérdésre a felhasználó válasza: a „max” = **csúcsfok-jelölés**; a futó
> karrierek már megvett szintjei **megmaradnak**.

## A szabály

| szint | szorzó | ár — a pár MINDKÉT stílusának saját pontgyűjtőjéből |
|---|---|---|
| 1. | ×1 | 100 + 100 |
| 2. | ×1,7 | 200 + 200 |
| 3. | ×2,5 + a pár csavarja | 300 + 300 |
| 👑 4. | ×2,9 | 120 + 120 |
| 👑 5. | ×3,3 | 160 + 160 |
| 👑 6. | ×3,7 | 220 + 220 |

- **Ki fizet:** az ÉLŐ pár két stílusa, mindkettő ugyanannyit, a saját
  pontjából: 🛡️ rettenet pont · ⭐ csillagpont · ⚡ villámpont · 🌀 passzpont ·
  🧲 presszpont · ⚽ gólpont · 🧱 betonpont · ☯️ harmóniapont. Ha az egyik
  oldalon kevés, a vásárlás nem megy, és egyik sem fogy.
- **A csapatstílus-pont** a Szinergiához többé nem kell (és a talizmán
  „Olcsóbb fa” kedvezménye sem vonatkozik rá — az a képességfa ára).
- Az elköltött pont a pontgyűjtő `spent` számlálójába könyvelődik, tehát a
  filozófia-újraválasztás 33%-os visszatérítésébe beleszámít.
- **Párváltás:** a szint a Szinergiáé, megy vele; a következő szintet már az
  ÚJ pár két stílusa fizeti.

## 👑 A „max”: csúcsfok-jelölés — 500 + 500

- **Mikor jelölhető:** a Szinergia a 3. szinten áll, és az élő pár **mindkét**
  stílusa elérte a csúcsfokot (a 20. szint, a nehézséggel lejjebb — ugyanaz a
  kapu, mint a képességeknél), és mindkettőben van még szabad jelölés.
- **Mibe kerül:** a pár mindkét stílusából elvisz **egy-egy** csúcsfok-jelölést
  (stílusonként három van), és **végleges** — párváltás után is.
- **Mit ad:** három további szintet; a lépcső a 3. szint lépésének fele
  (0,8 → 0,4), ahogy a képességek csúcsfokánál: mélyít, nem robbant.
- **Az ára:** 120 · 160 · 220 = **500** mindkét pontgyűjtőből.

*Döntés, amit én hoztam (egy állandó, könnyen fordítható):* a jelölés
mindkét stílus jelöléséből visz el egyet. A kérés azt mondja, a két érintett
stílus adja össze a max árát — ennek a tükre, hogy a jelölés ára is közös. Ha
csak az egyikből (vagy egyikből sem) kellene jelölés, a `szinCsucsJelol` és a
`szinCsucsMiert` két sora változik.

## Futó karrierek

- A csapatstílus-pontból már megvett szint **megmarad**: nincs visszatérítés,
  nincs utólagos levonás.
- A **következő** szint ára az új: pl. egy 2. szinten álló Szinergia 3.
  szintje 300 + 300 a két pontgyűjtőből.
- A mentés formája nem változik: `S.szin.lv` a régi mező; új a `S.szin.csucs`
  jelző és a két stílus `peak.picks` listájában a `szin:csucs` bejegyzés
  (a régi kliens a mezőt nem olvassa, a régi mentésben nincs — az 0).

## A felületen

A Szinergia panel gombja mindkét pontnevet kiírja (`2. szint — ⚡ 200
villámpont + 🛡️ 200 rettenet pont`), alatta **kassza-sor**: melyik oldalon
mennyi van, és ha kevés, mennyi hiányzik. A 3. szinten megjelenik a 👑
csúcsfok-blokk a feltételekkel vagy a jelölő gombbal.
Kép: `docs/kepek/audit-1-0-9-8/szinergia-ar-utana.png`.

## Kód és próba

`SZIN_AR` · `SZIN_AR_CSUCS` · `SZIN_M` (7 elem) · `szinGyujto` · `szinFizetok` ·
`szinAr` · `szinVesz` · `szinCsucs` / `szinMaxLv` · `szinCsucsMiert` /
`szinCsucsJelol` · a panel és a megerősítő ablak.

`node tools/szinergia-ar-1-0-11-0-00-proba.js` — 21 állítás. A régi
`szinergia-1-0-6-3-00-proba.js` ár-állítása az új szabályhoz igazítva (az ár
100, a szintet a pontgyűjtők fizetik); a többi állítása változatlan.

## Amit nem mértem

A pontgyűjtők bevételi üteme stílusonként más (a `tools/meccsmotor/
stilus-pontbevetel.js` méri); azt, hogy a 600 + 600, illetve a csúcsfokkal
1100 + 1100 pont hány idény alatt jön össze az egyes pároknál, ebben a
lépésben nem mértem — az árak a kérés számai.
