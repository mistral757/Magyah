# Játékon belüli értesítés a PvP társnak (3.9.73)

**Állapot:** ✅ megvalósítva · **Mérés:** `tools/pvp-ertesites-proba.js` — 22 állítás

---

## 1. A kérés

> „Lehessen játékon belüli értesítést küldeni a PvP társadnak, amikor online.
> Az értesítéshez lehessen 10db smiley közül választani, hogy milyen emojival
> menjen az emlékeztető, hogy rá vársz, miközben ő online. Tehát a játékba
> legyen építve az értesítés, de nézzen úgy ki, mint egy klasszik lebegő
> értesítés, ami felül és sávban beugrik, és lehet rányomni, akkor odaugrik,
> ahol vár a társad, vagy lehet dismisselni, vagy némítani 15 percre"

## 2. Miért új csatorna, és miért nem a meglévő bökés

A P2b-s **bökés** webpush: a telefon rendszerszintű értesítése, amit egy
Netlify-függvény küld a VAPID kulccsal. Az pontosan akkor jó, amikor a társ
**nincs** a játékban — a felülete ezért el is tűnik, ha online
(`mpMateOnline(...) === true`).

Ez a kérés az **ellenkező** eset: a társ ott ül, csak nem téged néz. Ahhoz nem
kell push, és nem is illik: engedélyt kér, kiül a zárképernyőre. Elég egy
üzenet a szobán át.

**A kettő sosem látszik együtt** — ugyanaz a helyzet két oldala:

| a társ állapota | eszköz | felület |
|---|---|---|
| OFFLINE | 🔔 bökés (webpush) | `h2hWaitNudgeWrap` / `mpDecNudgeWrap` |
| **ONLINE** | 💬 **hangulatjel (ez)** | `…PingWrap` |

Ha a rossz eszközt próbálod használni, a felület **kimondja, melyik a jó**:
*„A társad most nincs a játékban — neki a 🔔 bökés megy ki, nem ez."*

## 3. Hol utazik — és miért pont ott

Ez a fontos döntés. A `players/$pid` ág szabálya:

```json
"$other": { ".validate": false }
```

Oda új mezőt tenni **csak úgy lehet, ha a szabályfájl frissített változata ki
is van téve a Firebase konzolban**. Ez a ház visszatérő néma hibája — a
`tempo` és a `waitAt` története is erről szól, és az átviteli kód szabályai
jelen pillanatban *sincsenek* közzétéve.

Ezért a jelzés a **`h2h` ág** alá megy, aminek a szabálya `".validate": true`:

```
mp/rooms/<kód>/h2h/ping/<küldő azonosítója>
  { e:"🍿", t:"Dárdavető FC", g:"a szezonzáró kapunál", at:<ms> }
```

**A funkcióhoz tehát nem kell a konzolban semmit tenni** — a ma élő
szabályokkal is működik. A próba ezt a két szabály-tényt külön is méri, hogy
egy későbbi szabály-átrendezés ne tudja némán elrontani.

A mező a **saját azonosító** alatt van, nem `host`/`guest` alatt: a szerepek
egy ütközés után cserélhetnek, az azonosító nem. A fogadó egyszerűen azt a
bejegyzést nézi, ami nem az övé — ugyanaz az elv, mint a `nudgeTarsAg`-nál.

## 4. A tíz hangulatjel

Mind ugyanazt mondja — *„rád várok"* —, csak más hangon. A felirat a küldő
fülének szól (a gomb címkéje), a jel a társ képernyőjére kerül.

| | | | | |
|---|---|---|---|---|
| 👋 Szia, itt vagyok! | ⏳ Várlak… | ⚽ Kezdjük! | 🔔 Csörgetek egyet | 🙏 Légy szíves! |
| 🐌 Csigatempó… | 🔥 Nyomás! | 🍿 Pattogatok, nézlek | 😴 Mindjárt elalszom | 🏆 Jöhet a meccs! |

Szándékosan nincs köztük sértő: egy közös karrier két embere közt a bökés
ugratás, nem fegyver. A listán kívüli jel nem megy ki — az elsőre esik vissza
(`mpPingEmojiOk`).

**Mind a tíz látszik.** Az első változat vízszintesen görgethető sor volt;
390 pixelen hét fért ki, a maradék három görgetés-jelzés nélkül lógott kint.
Egy rejtett választás elveszett választás, ezért a sor **tördelődik**.

## 5. A sáv

Klasszikus, **felül beugró** értesítés — ugyanaz a nyelv, amit a telefon
értesítései beszélnek, hogy ne kelljen megtanulni:

- `position:fixed`, a biztonságos sáv alatt (`env(safe-area-inset-top)`),
  különben bevágásos telefonon az óra alá csúszna;
- **becsúszik**, nem ugrik: a beúszáshoz két képkocka kell (előbb a DOM-ba a
  kezdő állapottal, csak utána az osztály), különben a böngésző összevonja a
  kettőt;
- `z-index:482` — a lebegő pirula fölött, de a tanító-rétegek alatt: egy
  értesítés soha nem takarhat el egy futó bevezetőt;
- rövid rezgés, ahol van rá mód;
- 12 másodperc után magától eltűnik.

### A három művelet

| | mit tesz |
|---|---|
| **a sáv törzse** | odavisz, ahol a társ vár |
| **✕** | bezárja |
| **🔕** | **15 percre elnémít** — és ez túléli az újratöltést (`localStorage`) |

### Az ugrás három lépcsője — és a harmadik őszinte

1. nyitva a beváró réteg → oda görget;
2. látszik a `mpDecPres` / `mpVerdictSec` → oda görget;
3. **se ez, se az** (futó mérkőzés, draft, átigazolási ablak) → **nem ránt ki
   semmiből**, hanem a sáv átírja magát:
   *„Előbb fejezd be, amit most csinálsz — utána a HUB-ban vár a döntés."*

Egy futó meccsből kirántani a felhasználót több kárt okozna, mint amennyit az
ugrás ér.

## 6. A fékek

| | |
|---|---|
| két küldés közt | **45 mp** (`MP_PING_MIN_MS`) |
| ennél régebbi jelzés nem ugrik be | **3 perc** (`MP_PING_FRESH_MS`) |
| a némítás hossza | **15 perc** (`MP_PING_MUTE_MS`) |
| a sáv magától eltűnik | 12 mp |

A saját jelzés sosem ugrik be, és ugyanaz a jelzés csak egyszer. A régi
jelzést a fogadó **elnyeli** (a „láttam" küszöböt előre tolja), nem mutatja.

Mivel a frissesség-ablak a küszöb és nem a betöltés pillanata, egy perce
küldött bökés átjön egy F5-ön is — az még érvényes —, a tegnapi nem.

## 7. A költség

A fogadás **egy apró olvasás** a jelenlét-körben (`mp/rooms/<kód>/h2h/ping`),
nem a teljes szoba. A `presence()` szándékosan csak a `players` ágat hozza le
(F0), ezért kell külön — de ez néhány bájt, és csak akkor fut, ha van élő
szoba.

## 8. A határa — kimondva

A jelenlét-kör (és vele a fogadás) **akkor jár, amikor a beváró réteg nyitva
van, vagy a szezonzáró kapu doboza látszik** — pontosan azok az állapotok,
amikben a játékos „ONLINE"-nak számít. A csatorna hatóköre tehát **betűre
ugyanaz, mint az online-fogalomé**, ahogy a kérés is szólt („amikor online").

Aki kilépett a HUB-ba és ott mászkál, az a PvP-felület szerint sem online — őt
továbbra is a 🔔 bökés éri el. Ezen lehetne tágítani (állandó szívverés minden
közös karrierben), de az megváltoztatná, mit jelent az „ONLINE" az egész
PvP-felületen, és állandó hálózati forgalommal járna — az már külön döntés.
