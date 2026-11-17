# ⚡ 1.0.11.4.01 — A Reflektor animációi simábbak

> **Bejelentés:** „Vannak kis laggok az új téma megjelenés saját menü
> animációiban. Nem teljesen sima.”

## A mérés

Chrome-nyomkövetés, 4× lassított CPU (≈ telefon), a HUB-menü nyitása, egy
csoport lenyitása és egy ablak megnyitása. A fő szál képkockái egyenletesek
voltak (17 ms) — a szaggatás a **festés és raszterizálás** oldalán volt:

| Művelet (✨ BE) | raszter | festés | stílus | a böngésző jelzése |
|---|---|---|---|---|
| menü nyitása | 133 ms (✨ KI: 36) | 63 ms (7) | 70 ms (13) | `clip-path` animáció nem futhat a GPU-n |
| csoport lenyitása | 64 ms | 46 ms | 35 ms | `clip-path` nem futhat a GPU-n |
| ablak nyitása | 238 ms (✨ KI: 141) | 384 ms (349) | — | `clip-path`, `box-shadow` nem futhat a GPU-n |

## Az okok

1. A **ferde vágás** (`clip-path`) nem futhat a GPU-n: minden képkockában újra
   kellett festeni az egész elemet. Ráadásul a menü nyitása a **felállás-pályát**
   (`#scPitch`, 402×587 px) is ki-be kapcsolja, tehát minden menünyitás egy
   teljes pálya-újrafestést indított.
2. A **lenyitott menücsoport** (1433 px magas) beúszása ugyanígy `clip-path` volt.
3. Az **ablak** fénykör-effektje `clip-path` + `box-shadow` volt, az ablak teljes
   tartalmán.
4. Menü-módban a csoport-címsorok **üveg-elmosást** (`backdrop-filter: blur`)
   kapnak, alattuk az élő háttér képkockánként mozog — a beemelkedő címsorok
   így hat elmosást mozgattak.
5. Kisebb tétel: a nyitóképernyő „első nézet” figyelője a teljes munkamenet
   alatt minden osztályváltozásra átkereste a dokumentumot.

## A javítás

Minden saját belépő animáció **csak `opacity`-t, `transform`-ot vagy `filter`-t**
animál — ezeket a böngésző a GPU-n, a fő száltól függetlenül futtatja:

- **új oldal:** áttűnés (a felállás-pálya kimarad, azt a menü kapcsolgatja);
- **lenyitott csoport:** áttűnés;
- **ablak:** a háttér elsötétül, a lap áttűnik, a reflektor-fény egy **külön
  rétegen** (a háttér `::after`-je) söpör végig — csak eltolódik és elhalványul;
- **menü-címsorok** a Reflektorban: sűrűbb, áttetsző panel elmosás nélkül (a
  többi téma érintetlen); a beemelkedés rövidebb (8 px);
- **a kezdőlap címe:** a betűköz-animáció (képkockánként új elrendezés)
  helyett vízszintes nyújtás;
- lenyomáskor nincs `filter: brightness` (csak az összehúzódás);
- a figyelő tömbben tartja a jelölt elemeket, és a kezdőlap elhagyásakor leáll.

## Utána

| Művelet (✨ BE) | raszter | festés | stílus | nem GPU-s animáció |
|---|---|---|---|---|
| menü nyitása | 52 ms | 38–53 ms | 53–55 ms | nincs |
| csoport lenyitása | 31 ms | 35 ms | 30 ms | nincs |
| ablak nyitása | 155 ms | 288 ms (✨ KI: 313) | — | nincs |

A menü maradék többlete nagyrészt az élő háttéré (✨), ami minden témában fut
(Törtfehérben ugyanitt 46 ms JavaScript, Pixelben 75 ms). A lenyitott csoportnál
az eldobott képkockák aránya ötszörös méréssel 25% → 10%. A fej nélküli,
szoftveres rajzolás képkocka-aránya ±5%-on belül zajos, ezért a menünél és az
ablaknál a munkamennyiség a megbízható jel, nem az arány.

## Próba

`tools/reflektor-tema-1-0-11-1-00-proba.js` új pontja: mind a nyolc saját
belépő animáció csak GPU-n futtatható tulajdonságot animál (a fő gomb
csillanása, `refGlint`, egy kis gombon a háttér-pozíciót — ez a dokumentált
kivétel). A régi változat ezen megbukott volna.
