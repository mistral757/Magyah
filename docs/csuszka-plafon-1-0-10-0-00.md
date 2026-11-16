# 🎚 1.0.10.0.00 — A csúszkák 2. szerződése: plafon a halmozáson

*(major — a szabály csak az ÚJ karrierekre áll át, a futók kifejezetten a
régin maradnak: `S.dialV`.)*

> **JÓVÁHAGYÁS:** az audit ([audit-felulet-mechanika-1-0-9-8.md](audit-felulet-mechanika-1-0-9-8.md))
> C tétele javaslatként írta le; a felhasználó válasza: „Amiket javasoltál
> fentebb, azokból a felső 3 az, ami mechanikai dolgokat is érint. Azok jöhetnek.”

## A gond, mérve

A taktika öt és a (legfeljebb négy) filozófia három-három csúszkája ugyanarra
a két szorzóra szorzódik össze: a saját és az ellenfél gólvárhatóságára. Egy
forrás a tetején 1,6–3,2 ⚡-et ér, a teljes halmaz ≈ 10–11-et — a nehézség
játszható ablaka viszont ±3–4 ⚡, és a szabályozó a csúszkákat nem látja.

## A szabály

**Az összes csúszka együttes hatása a saját és az ellenfél gólvárhatóságára
±40%-ban megáll** (a szorzó 0,60 és 1,40 közé áll, percenként és állásonként).

- Egyetlen kimaxolt forrás ebbe nagyjából belefér (Beton 20. szint: ellenfél
  ×0,63; taktika 99-es ismertséggel, átlagos illeszkedéssel: ×0,62). A plafon
  a HALMOZÁST fogja meg, nem a mélyre menést.
- Mindkét irányba fog: a csúszkák együttes KÁRA sem lehet 40%-nál nagyobb.
- A legnagyobb elérhető ≈ ⚡-egyenérték így (ln 1,4 − ln 0,6)/(2K) = **3,5**.
- A többi csatorna (gólsúly, gólpassz, lap, sérülés, kontra-ablak, fejlődés,
  hírnév…) **nem változik** — a plafonon álló játékosnak ezért megéri a többi
  csúszkát ezekre fordítani. Az Összkép ezt ki is mondja.

## Kire vonatkozik

| | |
|---|---|
| **új karrier** | él (`S.dialV = 2`, a `startFirstSeason` állítja, a mentés viszi) |
| **futó karrier** | NEM él — a mentésben nincs jelző, betöltéskor `S.dialV = 0`, a szorzó betűre a régi nyers szorzat |
| **párharc** | NEM él — a közös szimuláció a pillanatképpel utazó nyers tételekből számol (`h2hWireDial`), ahhoz ez a verzió nem nyúlt; a tételek a jelzőtől függetlenek (a próba méri) |

## Mérés a valódi motoron

`CFG=halmozva DIALV=0|2 N=600 DS=0 node tools/meccsmotor/hangsuly-valos.js`
— taktika 99 négy kihúzott csúszkával ÉS Beton 20. szint három kihúzott
csúszkával, rögzített 0 meccserő-különbség, 600 meccs:

| | Gy / D / V | pont/meccs | lőtt | kapott | ellenfél-szorzó |
|---|---|--:|--:|--:|---|
| csúszkák középen (viszonyítás, az auditból) | 51–55 / 22–23 / 23–26 | 1,75–1,88 | 1,8–1,9 | 1,20 | ×1 |
| halmozva, **régi szabály** | 75,0 / 16,7 / 8,3 | **2,417** | 2,15 | **0,50** | ×0,40–0,53 |
| halmozva, **plafonnal** | 68,7 / 19,7 / 11,7 | **2,257** | 2,17 | **0,72** | ×0,60 |

Két forrásnál a plafon a többletet kb. egynegyedével fogja vissza (+0,6 →
+0,44 pont/meccs). A lényeg a folytatás: a régi szabályon a harmadik és
negyedik filozófia csúszkái tovább szorozták volna (analitikusan ≈ 10–11 ⚡-ig),
a plafonnal ez a szám itt megáll.

## A felületen

Az Összkép „A meccs íve” alatt új sor: `🎚 A csúszkák együtt legfeljebb
±40%-ot mozdíthatnak a gólesélyen. Most a plafon alatt vagy.` — ha fog:
`🔒 … most végig a plafonon vagy: ami efölött van, nem ad többet.` A régi
karrierekben a sor nem jelenik meg (ott nincs plafon).

## Kód és próba

`DIAL_SAV` · `dialV2` · `dialSav` · a `dialMul` egy sora · `dialOsszNyers` /
`dialOsszMul` · `S.dialV` (alapállapot, mentés, betöltés, `startFirstSeason`).

`node tools/csuszka-plafon-1-0-10-0-00-proba.js` — 13 állítás: a jelző útja
(új karrier, mentés, régi mentés), a régi szabály bitre, az új vágás, a
plafon alatti beállítás bitre azonos, a többi csatorna érintetlen, a panel,
a párharc-tételek függetlensége.

## Amit érdemes tudni

- A plafon értéke (`DIAL_SAV = 0,40`) egyetlen állandó; ha a mérés később
  mást kíván, egy helyen állítható.
- Ha a futó karrierekre is kellene (pl. önkéntes átállás, mint a tízfokozatú
  nehézségnél), az külön döntés: ma semmi nem állítja át őket.
