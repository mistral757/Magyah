# ⚖️ A potenciális meccs-erő (3.9.122)

## 1. A kérés

> „A meccs-erő most sok-sok helyen egy fontos szám. Hogy ne lehessen
> befolyásolni túlzottan dolgokat azzal, hogy az aktuális meccs-erődet a
> mérésnél direkt alacsonyra állítod: legyen mindig egy számítás arra, hogy
> az aktuális kerettel mi a maximális meccs-erő, ami explicit összehozható
> (nem csak elméletben, hanem ténylegesen, akkor, ha átszerveznéd a csapatot
> cserékkel, csapatkapitány-váltással, felállás-váltással stb.)… És
> amennyiben ezzel egy min 2,5%-kal jobb meccs-erő összehozható, abban az
> esetben a számított potenciális max meccs-erő és az aktuális nevezési
> meccs-erő számtani közepével kell számolni, és ezt jelezni is kell."

## 2. A rés, amit bezár

A 3.9.112 óta a szuperligák mezőnye a **kezdőrúgáskor** mért meccs-erődhöz
áll be, PvP-ben a kettőtök átlagához. A meccs-erő viszont nem csak a
keretből áll:

| tag | a mérés pillanatában állítható? |
|---|---|
| kezdő tizenegy | **igen** (csere) |
| felállás | **igen** |
| kapitány | **igen** |
| aktív taktika | **igen** (a váltás ingyenes) |
| morál, edző, események | nem |

Vagyis a mérés pillanatában szándékosan rossz tizenegyet kiállítva gyenge
mezőnyt lehetett kérni, majd a rajt után visszarendezni. **A mérőszám ezzel
a szándék mérésévé vált, nem a keretévé.**

## 3. Amit csinál

`msBestConfig()` megkeresi, mi a legjobb meccs-erő, amit a mostani kerettel
**ténylegesen ki lehet állítani**. Négy tengely, mindegyik valódi menedzseri
lépés:

1. **felállás** — a mostani, plusz minden feltölthető alternatíva
2. **cserék** — slotonként a keret legjobb kimaradt embere (2 kör)
3. **kapitány** — a rutinbónusz csak a pályán lévőre jár
4. **taktika** — a szint a begyakorlásból, az illeszkedés a *mostani* XI-ből

Nem teljes optimum (11 kiválasztása kombinatorikusan robbanna), hanem
**helyi keresés** — és pontosan ezért tisztességes: minden köztes állapota
egy ténylegesen felvehető felállás, nem elméleti felső korlát. A próba ezt
külön ellenőrzi (létező felállás, 11 tele, senki kétszer, kapitány a pályán,
ismert taktika).

```js
const MS_POT_MIN_GAIN = 0.025;          // 2,5%
used = gain >= 0.025 ? (now + pot) / 2 : now;
```

### Miért a közép, és nem a maximum

Mert a rossz felállás nem mindig csalás: lehet sérülés-kímélés, fiatal
beépítése, tudatos kockázat. A közép megőrzi a döntés súlyát — rosszabb
keret **továbbra is** könnyebb mezőnyt hoz —, de elveszi a haszon felét, így
a szándékos lebutítás már nem éri meg.

## 4. Ami NEM változik

A kijelzett meccs-erő, a nehézség-tanácsadó, a jelvény, a figyelmeztetések
és maga a **mérkőzés** mind az élő számmal dolgozik tovább. A rendszer
kizárólag a **kalibrációs pillanatokban** kapcsol be:

| hol | mit |
|---|---|
| `pyrAnchorAtKickoff` | a szezonindító mezőny-horgony (SP, és rajta át a szuperliga-kalibráció) |
| `mpStartExchange` | a PvP kézfogás `mstr` mezője — a közös kalibráció ebből dolgozik |

Az ablakot `msRatedBegin()` nyitja és `msRatedEnd()` zárja; a horgony
`finally` ága gondoskodik róla, hogy kivétel esetén is bezáruljon.

## 5. A keresés nem hagy nyomot

A globálisokhoz (`slots`, `form`, `captainIdx`, aktív taktika) hozzá **kell**
nyúlni, mert a meccs-erő minden tagja azokból olvas. Az `msWithRestore`
`finally` ága ezért feltétel nélküli, és a próba kivétellel is teszteli:
felállás, kapitány, taktika, pad és tartalék bitre ugyanaz utána.

## 6. A hiba, amit a mérés kapott el

Az első változat **szűk keretnél némán kikapcsolt.** Az `arrangeSlotsFor`
egy 11 fős, posztokban hiányos keretnél **egyetlen** felállást sem tud
hiánytalanul feltölteni (mérve: mind a nyolc felállás 8–9 slotnál megáll),
és a keresés ilyenkor `null`-t adott — vagyis a lebutítás-védelem pont a
legszűkebb keretnél tűnt el.

A javítás két része:
- **a mostani felállás mindig jelölt**, mert az definíció szerint
  kiállítható (ott áll a pályán);
- a többi felállásnál a maradék helyeket a keret legjobb szabad emberével
  töltjük, ugyanúgy, ahogy az `applyFormationChange` utolsó köre.

## 7. Ami a naplóban látszik

```
⚖️ A nevezési meccs-erő nem a maximum. Most 77,7, a mostani kerettel
   viszont 90,1 is kiállítható (+15,9% — felállás 424, másik kapitány,
   taktika Széljáték, 4 csere a kezdőben). A mezőny ezért a kettő
   számtani közepével (83,9) kalibrálódik.
→  Nem büntetés: a gyengébb felállás továbbra is könnyebb mezőnyt hoz,
   csak a felét. Ha tényleg a legjobbat állítod ki, ez a sor el sem hangzik.
```

Ép kerettel a sor **el sem hangzik** — a próba ezt is méri (nincs hamis
riasztás).

## 8. Futásidő

A teljes keresés **60 ms** (8 felállás + a mostani × 2 kör × 11 slot × 12
jelölt, plusz kapitány és taktika). A horgony hurka negyvenszer olvassa a
meccs-erőt, ezért az eredmény a kalibráció idejére gyorsítótárba kerül — a
keret közben úgysem változik.

## 9. Egy áthatás, amit ki kell mondani

A szuperliga-kalibráció (`docs/szuperliga-kalibracio.md`) mostantól a
**nevezési** rést állítja a vállalt értékre. Lebutított felállásnál az
**élő** rés ezért szándékosan alacsonyabb marad a vállaltnál — pontosan a
különbség felével. A `tools/szuperliga-kalibracio-proba.js` emiatt
ugyanabban az ablakban mér, amiben a horgony dolgozott.

## 10. A próba

`tools/meccsero-potencial-proba.js` — lásd `tools/README.md`.
