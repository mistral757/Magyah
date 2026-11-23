# 1.0.11.10.00 — A divízió arculata (ligapiramis)

## Kérés
> A ligapiramis verzióban az, hogy melyik divízióban jár a csapatunk, az legyen valahogy
> látványosan benne a kezelőfelületben. Akár egy plusz szín, egy ikon, egy sáv. De érezd,
> hogy melyik szinten jársz.

## Az osztályok arculata (`pyrDivArculat`)
| Osztály | Ikon | Rangnév | Szín |
|---|---|---|---|
| D6 | 🌾 | Grund | földbarna |
| D5 | 🧱 | Bronz | bronz |
| D4 | 🛡️ | Acél | acélkék |
| D3 | ⭐ | Smaragd | smaragdzöld |
| D2 | 💎 | Zafír | zafírlila |
| D1 | 🏆 | Arany | arany |
| D0 | 👑 | Korona | királyi magenta |
| D−1, D−2, … | 🌌 | Kozmosz k | körbeforgó kozmikus árnyalatok |

Alulról fölfelé egyre nemesebb anyag; a D1 fölött nyíló szuperligák a korona és a kozmosz színeit kapják.

## Hol látszik
- **Fejléc:** a csapatnév alatt az osztály csipje (pl. `⭐ D3`), a fejléc alsó szegélye
  és fénye a divízió színében. Ez minden képernyőn ott van, a meccsen is.
- **HUB, a klub-banner alatt:** a **divízió-sáv**, benne:
  - nagy ikon + `D3`, a rangnév („Smaragd szint”) és az osztály neve;
  - „N osztály a csúcsig” / „A csúcson”, és a Run-cél (🎯), amíg nincs rögzítve;
  - a lépcső: a legalsó osztálytól a legfelsőig, legfeljebb 9 fok, a mostani kiemelve
    és nyíllal jelölve, a már megjárt fokok a saját színükben.
- **Technika:** `body.divOn` és a `--divC`/`--divC2`/`--divInk` változók
  (`pyrDivAlkalmaz`, a fejléc-jelvény minden frissítésekor). Piramis nélkül (dinamikus
  mód, klasszikus) semmi nem változik.

## Próba
`tools/divizio-arculat-1-0-11-10-00-proba.js`
