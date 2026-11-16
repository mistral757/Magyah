# 📊 1.0.9.8.00 — A hangsúly-összkép

> **KÉRÉS:** „a Taktika menüpont alatt szinte el van rejtve a hangsúly-csúszkák
> (🎚) menüpontja. Benne lassan mindent állítgatsz, de az összeredményt nem
> látod. Ezt mindenképp látványosabbá és jobban követhetővé kell tenni: lássa
> a játékos, hogy a beállításai együtt mit tesznek a csapatával és a meccsel."

Az előzmény és a mérések: [audit-felulet-mechanika-1-0-9-8.md](audit-felulet-mechanika-1-0-9-8.md), A tétel.
Képek: `docs/kepek/audit-1-0-9-8/` (`csuszkak-elotte.png` → `hangsuly-osszkep-utana.png`,
`menu-elotte.png` → `menu-utana.png`, fekvő: `hangsuly-osszkep-fekvo.png`).

## Mi változott a játékos szemével

1. **📊 Összkép a 🎚 panel tetején** — egy blokk arról, amit a taktika és az
   összes filozófia mozdított csúszkái *együtt* tesznek:
   - **a mozdított csúszkák** címkéi, forrással (⚙️ taktika, a stílus ikonja);
   - **a meccs íve**: a saját és az ellenfél gólesélye 18 ötperces oszlopban.
     Zöld, ami neked dolgozik, piros, ami ellened. Ha az állástól is függ
     (pl. „Vezetést megőrizni”, „Mindent bele”), három fül vált:
     *Döntetlennél · Ha vezetsz · Hátrányban*;
   - **≈ ⚡ meccserő-egyenérték** — egyetlen szám a játék fő pénznemében;
   - **ki szerzi a gólt / ki adja a gólpasszt**: a védők, középpályások és
     csatárok részesedése előtte → utána, a kezdő tizenegy valódi súlyaiból,
     és a legnagyobb nyertes és vesztes név szerint;
   - **mellékhatások**: lap, sérülés, pontrúgás-arány, kontra-ablak,
     gegenpressing, busz, emberhátrány, összhang, fejlődés, morál-hatás,
     hírnév, bér, taktika-illeszkedés, szerepek, helyzet-bontás;
   - **feltételhez kötve**: ami az ívben nem ábrázolható (emberhátrányban,
     kapott gólok száma szerint, „ha a gólvágód formán kívül van”…), azzal,
     hogy a kezdő tizenegy szerint *most él-e*.
2. **Húzás közben is él.** A csúszka mozgatása azonnal átrajzolja az
   összképet (eddig csak az elengedés után frissült bármi).
3. **Egysoros sáv**, ami görgetés közben a panel tetején marad:
   `🎚 6 csúszka él   ⚽ +38% · 🥅 +21% · ≈ +0,6 ⚡`.
4. **Közvetlen út:** ☰ Menü → Csapatépítés → **🎚 Hangsúly-csúszkák** kártya,
   a rövid összképpel. A régi út (Taktika → 🎚) megmaradt, a kártyáján ott
   az összkép is.
5. **A ⚙️ Taktika gomb alcímet kapott:** az aktív rendszer, az ismertsége, és
   hogy hány csúszka él.
6. **A kezdőrúgás előtt** a morál-sor alatt: `🎚 Hangsúlyok: 6 csúszka él · …`
   (csak ha él csúszka; a fekvő stadion-nézetben nem, ott a sor egysoros).

## Hogyan számol

Nem új képlet. A `dialOsszMul(csatorna, környezet)` ugyanazt a bejárást
(`dialEach`), szűrőt (`dialMatch`) és szorzót (`dialFactor`) hívja, mint a motor
`dialMul`-ja — a talizmánok csatornái nélkül, mert azok nem a csúszkák hatásai.
A próba a 108 ív-pontot (18 szakasz × 3 állás × 2 oldal) a `dialMul`-lal veti
össze: az eltérés 0.

A **meccserő-egyenérték**: a gólvárhatóság `λ = BASE·e^(K·d)`, tehát egy saját
×a és egy ellenfél ×b szorzó ≈ `(ln a − ln b) / (2K)` meccserő-különbség
(K = `SIM.K`). Becslés — a λ padlója és plafonja nélkül —, ezért „≈”. A valódi
motoron mért megfelelője: az auditban a C tétel táblái.

## Amit NEM változtat

- A motor egyetlen sora sem változott; a csúszkák hatása, kerete, görbéje a régi.
- A mentés formája változatlan (továbbra is csak `S.tactics.dials` és a
  stílus `dials` mezője) — a próba 9. pontja méri.
- A párharc pillanatképe és szimulációja érintetlen.
- Meccs közben az összkép nem nyúl a motor memóihoz (`_dialWhoMemo`, `tdMemo`).

## Kód

`dialOsszkep` · `dialOsszAktiv` · `dialOsszMul` · `dialOsszHtml` ·
`dialOsszSavHtml` · `dialOsszFrissit` · `dialHubFelirat` · a
`renderHubDialPanel` `input` kezelői · CSS: `.dlOssz*`, `.dlIv*`, `.dlResz*`.

## Próba

`node tools/hangsuly-osszkep-1-0-9-8-00-proba.js` — 28 állítás és az összesítő (üres állapot,
motor-egyezés, megoszlás, élő húzás, fülek, a két visszaút, a meccs előtti
sor, 430 px és fekvő nézet, a mentett forma, oldalhiba).
`KEP=<mappa>` megadásával képernyőképet ment.
