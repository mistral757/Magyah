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

---

# 1.0.11.10.01 — Tabella, szezonzáró, kupa-HUB, szezonkártyák új arccal

## Kérés
> Szezonkártyák · Tabella, szezonzáró értékelő felület, és a kupa HUB már régen nem lett
> fejlesztve kinézetben. Ezeket fejlesszük hozzá a játék stílusához. Legyen látványosabb,
> átláthatóbb, izgalmasabb.

Az adat, a sorrend és a gombok változatlanok. Csak a kép új.

## 📊 Tabella (`renderFinalTable`)
Menet közben, a félidei táblán és a szezonzárón is ez jelenik meg.

- **A fej:** a divízió színe és ikonja, a forduló („14. forduló után” / „végeredmény”), a rangnév és a mezőny ereje.
- **A sorok:**
  - minden csapat előtt a **meze** (a stylist-mez, ha van);
  - a név balra igazítva, teljes szélességben;
  - alatta egy **pontsáv** a listavezetőhöz mérve.
- **A zónák:**
  - a helyezés-jelvény a zóna színében (feljutás / osztályozó / kiesés);
  - a zónák között címkés elválasztó;
  - a **TE** sorod a klubszíneiddel, a társadé lilával.
- **Oszlopok:** a GY-D-V egy oszlopban, a gólkülönbség előjellel és színnel, alatta a lőtt:kapott.

## 🏅 Szezonzáró (verdikt)
- **Hős-kártya:**
  - helyezés-érem (arany/ezüst/bronz/semleges) a klubszínek csíkjával;
  - a minősítés, a csapat és az idény, a divízió-csip;
  - négy csempe: pont, GY-D-V, gólok (különbség), helyezés;
  - **a szezon 30 meccse** egy formacsíkban, alatta a leghosszabb győzelmi és veretlenségi sorozat.
- **Szekciók:** kártyák lettek ikonnal; a góllövő-, gólpassz- és meccsembere-listák sorai a játékos arcképével.
- **Kupa utáni kapu:** a közös karrier ugyanezt a képernyőt használja; ott a hős-kártya elbújik, és a régi szöveg látszik.

## 🏆 Kupa-HUB
- **Szalag a kupa színében:** trófea (SVG, a kupa színével), rövidítés és típus, a név, a szakasz.
- **A menetelés útja:** selejtező → csoport/ligaszakasz → kieséses körök → döntő.
  - A megjártak kitöltve, a mostani világít.
  - A végén 🏆 (győzelem), 🥈 (döntő) vagy ✕ (kiesés).
- **A mezőny-magyarázat** lenyitható dobozba került; a szöveg betűre a régi.
- **Párosítás-kártya:** a két mez egymással szemben, VS, a helyszín, a két ⚡.
- **Táblák:**
  - a csoport-/ligatabella a bajnoki tabella új arcával, a továbbjutó sávok színével;
  - a kieséses párharcok kártyasorokban.
- **A sorozat vége:** keretezett eredménydoboz (győzelem: arany izzás).

## 🃏 Szezonkártyák (`cardResultsHtml`)
- Valódi kártyák rácsban, szint szerint rendezve.
- **A kártya:**
  - a szint színében izzó keret és fejléc;
  - arckép a mezünkben, poszt;
  - a szezon számai csipekben (gól, gólpassz, meccs embere, bravúr, tiszta lap) és a meccsszám;
  - alul a két ajándék: +Rating, +POT.
- A megtartott szint „MEGTARTVA” pecsétet kap.

## Próba
`tools/felulet-1-0-11-10-01-proba.js`. A `hsz-merce-3-9-200` próba a tabella új szerkezetét
számolja. Az ottani 3 régi hiba változatlan, a main-en is fennáll.
