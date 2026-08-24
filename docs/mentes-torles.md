# Mentés törlése — egyetlen, mindenhonnan hívható folyamat

*(3.7.17. Érintett kód: `openSaveDeleteFlow` (+ `#saveDelModal`),
`generateCareerLegacyTextFrom`, a kezdőlap `mpSoloChipHtml` /
`mpDrawRoomChips` sorai (`.mpRoomRow` / `.mpRoomActs`), a `resumeBanner`
`#resumeNoBtn` gombja, a `#storeModal` (`renderStoreModal`) soronkénti
törlés-gombja, és a profil-modal `#profileStoreBtn` gombja.)*

## A probléma

Egy futó **közös (PvP) karriert** eddig nem lehetett egyszerűen lezárni vagy
törölni: a törlés csak a rejtett diagnosztika alatt, egy sima
`confirm()`-mel ment, vagy be kellett tölteni a karriert a HUB-ba, és onnan a
"Lezárom a karriert" gombbal. Egyik sem volt elérhető ott, ahol a döntés
ténylegesen felmerül: a kezdőlapon, a szoba/karrier listájánál.

## A megoldás: mindig két lehetőség

A kezdőlap szoba- és egyjátékos-chipjei eddig egyetlen nagy gombok voltak —
egy koppintás egyenesen betöltötte a karriert. Mostantól minden olyan sor,
ahol tényleg van mit folytatni (van valódi mentés), **két külön gombot**
mutat, mindig ugyanabban a sorrendben:

```
🏠 1. hely · SS Lazio                    ▶ Folytatás   🗑 Adattörlés
   ▶ 3. szezon — folytatható
```

Ugyanez a pár jelenik meg:
- a kezdőlap egyjátékos- és szoba-chipjein (`mpSoloChipHtml`,
  `mpDrawRoomChips` — csak ahol VAN mentés; egy üres, még senki által el nem
  kezdett szoba-lobbynál nincs mit törölni, az egy gombos chip marad),
- a mentés-folytató sávon (`#resumeBanner`: "Folytatom" / "🗑 Adattörlés" —
  a régi "Új játék elölről" gomb ide olvadt bele),
- a "Mentések és tárhely" listán (`#storeModal` — a soronkénti törlés-gomb
  eddig `window.confirm()`-mel ment, mostantól ugyanezt a folyamatot hívja).

## A törlés-folyamat: letöltés → megerősítés → törlés

`openSaveDeleteFlow(key, opts)` egyetlen, mindenhonnan hívható függvény —
egy `#saveDelModal` ablakban két lépésben fut:

1. **Letöltés felkínálása.** "📄 Összegzés letöltése (.txt)" — a
   `generateCareerLegacyText()` (ami az ÉLŐ állapotból dolgozik) új párja,
   `generateCareerLegacyTextFrom(d)`, a MENTETT, nyers JSON-ból építi fel
   ugyanazt az összegzést (szezonról szezonra, jelenlegi felállás,
   mindenkori statisztika) — élő állapot betöltése NÉLKÜL. Ez fontos: a
   kezdőlapon a karrier nincs betöltve, és a szándék pont az, hogy NE is
   aktiválódjon, mielőtt eldől, mi lesz vele.
2. **Külön megerősítés.** Csak egy MÁSODIK, "Igen, véglegesen törlöm"
   gombra törlődik ténylegesen. Közös karriernél előtte a szobát is elhagyja
   (`mpBk().leave(room)`), hogy a társ se ragadjon egy halott karrierben —
   ugyanaz, amit eddig csak a HUB-beli "Lezárom a karriert" tudott.

## `generateCareerLegacyTextFrom(d)` — miért nem az élő verzió újrahasznosítása

A live `generateCareerLegacyText()` a `S`, `slots`, `careerPool` globálisokat
olvassa — ezek a kezdőlapon nincsenek betöltve. A pure változat a mentett
objektumból dolgozik:
- a szezontörténet és a mindenkori statisztika már KÉSZ áll a mentésben
  (`S.seasonHistory`, `S.careerStats`), élő számítás nélkül olvasható;
- a kártyaszint `unpackCareerPool(d.careerPool)`-ból jön — tiszta függvény,
  semmilyen élő állapotot nem néz;
- a Rating a slotokban tárolt NYERS `p.ovr` — a `pOvr()` élő, meccsnapi
  módosítói (forma, kémia, jelvény-bónusz, MP-kiegyenlítés) itt nem
  elérhetők, és nem is kellenek: ez egy búcsúzó pillanatkép, nem egy pontos
  meccsnapi szám.

## Elérés a profilból

A "💾 Mentések és tárhely" ablak (a teljes lista, mérettel és a fenti
törlés-folyamattal minden sornál) eddig csak a rejtett diagnosztikából
nyílt. Most a profil-modalban (a kezdőlap jobb felső sarkából) is van rá
gomb — oda néz az, aki a saját karriereit akarja rendezni, nem csak az, aki
hibát keres.

## Tesztelés

Playwright, headless Chromium, hamis mentésekkel (2 egyjátékos hely + 1
közös szoba):
- kezdőlapi chip-sorok: mindkét gomb megjelenik minden olyan sornál, ahol
  van mentés (`▶ Folytatás` / `🗑 Adattörlés`), a szöveg helyes;
- letöltés: a ténylegesen letöltött .txt tartalma pontosan a várt formátum
  (szezon, felállás, statisztika);
- teljes törlés-folyamat (letöltés → "🗑 Adattörlés" → "Igen, véglegesen
  törlöm") mindhárom belépési ponton: kezdőlapi solo chip, kezdőlapi szoba
  chip (a `mpBk().leave()` hibátlanul elnyeli az offline hálózati hibát),
  `resumeBanner`;
- "Mentések és tárhely" → sor-törlés → ugyanaz a `#saveDelModal` nyílik meg,
  a storeModal (z960) fölött (z970), és a lista frissül a törlés után;
- a profil "💾 Mentések és tárhely" gombja megnyitja a store-modalt.

Mind a nyolc eset a várt eredményt adta, `tools/check.sh` zöld.
