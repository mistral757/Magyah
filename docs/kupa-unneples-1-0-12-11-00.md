# 1.0.12.11.00 — Kupa-ünneplés, rögzített ikon-sűrűség, 13 új menüpont-jelenet

## 1. Kupa-ünneplés a döntő után
**KIMONDOTT KÉRÉS (🐞 jegyzet jmww86laydqkd):**
> „Nem volt ünneplés a BL döntő győzelem után. Ez nagyon szomi. Minden kupa végén legyen. És utána legyen a konfettis screen. És csak utána minden szokásos meccs utáni értesítés skillekkel, meccsettekeléssel stb"

**Az új sorrend** egy megnyert kupadöntő után:
1. a lefújás;
2. az **ünneplés-jelenet** (`kupaUnnepIndit`), ~45–60 mp, a jobb felső „Átugrom ⏭” gombbal bármikor átugorható;
3. a **konfettis trófea-képernyő** (`kuTrofeaKepernyo` → `showTrophyScreen`), „Tovább a meccs értékeléséhez →” gombbal;
4. csak ezután a szokásos meccs utáni lánc (`mLefujas`): jutalom-skillek, felfedezés, értékelő ablak.

A kupa lezárásakor (`euroMaybeCelebrate`) a trófea-képernyő nem jön másodszor (`E._unnepElo`). A trófea-húzás változatlanul ott jár.

**A forgatókönyv** a terv 3. fázisa szerint (`docs/kozvetites-unneples-terv.md`):

| # | Felvonás | Mit látsz |
|---|---|---|
| 1 | Lefújás | a kezdő 11 egymásnak rohan és ugrál, konfetti (2. szinttől) |
| 2–4 | A hősök | a döntő embere, a döntő gólszerzője, a kupa gólkirálya, a kapitány — reflektorban, névvel és számokkal (legfeljebb 3) |
| 5 | A szurkolók | a lelátó közelről a klubszínekben, sálak (2+); tifó a címerrel (3+); füst (4+); tűzijáték (5+) |
| 6 | A sor | a pódium a szint díszletével, a játékosok a legfiatalabbtól sorra átveszik az érmet |
| 7 | A trófeaemelés | a kapitány a magasba emeli a serleget, körülötte ugrál a csapat; konfetti, tűzijáték (3+), vaku (6+) |
| 8 | A csapatstílus koreográfiája | Tiki-Taka: passzkör a serleg körül · Harmónia: körtánc · Villám: tiszteletkör · Gegen: sprint a lelátóhoz · Beton: csapatfotó · Panzer: az edző a vállakon · Sztár: a sztár a reflektorban · Bombázók: konfetti-ágyúk |
| 9 | Záró kép | a serleg, „… GYŐZTES”, a lelátó |

**A szint** a sorozat rangja:

| Szint | Sorozat |
|---|---|
| 1 | Nyári Felkészülési Kupa |
| 3 | Magor Kupája |
| 4 | Fából Készült Serleg, KONF |
| 5 | OJK |
| 6 | KK |
| 7 | Hiper Szuper Kupa |

Minden szint hozzáad a díszlethez (asztal → pódium → ív → színpad konfetti-ágyúkkal → reflektortornyok), és a jelenet is hosszabb (×1,0 → ×1,3).

**Kimarad:**
- végigjátszásban;
- közös karrierben, mert ott a két gép menete nem várhat egy helyi jelenetre.

**A hang** csak a lelátóé (`lelatoReag`), a meccs feliratai nélkül. A mentéshez nem nyúl.

**Ami még nincs:** a bajnoki címre ugyanez a jelenet (🐞 jmwvwgbxqhkev) — a függvény általános, kérésre bekötöm.

## 2. Az ikon-sűrűség a karrieré
**KIMONDOTT KÉRÉS (🐞 jegyzet jmww8z554g4aw):**
> „9.5 nehézségen átigazolási eseményben pörgettem egy legendás igazolást. Az elméletileg a 9.5 leírása szerint lehetetlen mert itt 0%ra van állítva ennek az esélye .."

**Az ok:** az ikon-sűrűség a böngésző KÖZÖS beállítása volt (localStorage), nem a karrieré. Csendben átírta:
- egy másik karrier beállítója;
- egy könnyebb fokozat kiválasztása;
- vagy a zár-ellenőrzés, amely „Megszokott”-ra esett vissza, ha a „Kikapcsolva” kapuja nem látszott nyitottnak.

A 9.5-ös karrier ezután a teljes eséllyel dobott ikont.

**A javítás:**
- `iconRateNow()` a futó karrierben a mentett fokozat értékét adja (`S.pyr.fok.cfg.icons`, 3.9.223 óta a mentés része). A közös beállítás csak a következő karrier beállítójáé, közös karrierben pedig a házigazdáé szól, mint eddig.
- A meglévő mentések is gyógyulnak: a 9.5-ös karrier fokozata a mentésben „ki”.
- A végigjátszás ikon-dobása eddig fix 16% volt; most ez is a sűrűség-kapcsolón át megy (`scoutIconChance`).
- A gyűjtő-jóváírás (`unlockGiftFromSave`) a karrier értékéből dolgozik.

**Ha a karrier indulásakor a „Kikapcsolva” még zárt volt**, a csomag a legközelebbi nyitott értéket kapta. Ilyenkor a mentett érték „Nagyon ritkán”, és ez szól.

## 3. 13 új menüpont-jelenet (jelenetsáv)
**KIMONDOTT KÉRÉS:**
> „Folytathatod a menüpont animációk projektet"

Ugyanaz a nyelv, mint eddig:
- a MI játékosaink kivágott figurával, a saját mezünkben;
- egy élő szám a felületről;
- rövid mozgás.

| Menüpont | Jelenet |
|---|---|
| 👔 Edző | az edző a táblánál nyilakat rajzol, a játékosunk bólogat |
| 🎭 Szerepek | három játékosunk fölött felpattan a szerep-jelvény |
| ⚡ Meccserő | a mérő feltöltődik (a valódi meccserővel), a játékos megfeszül |
| 🎚️ Csúszkák | keverőpult, a csúszkák fel-le járnak |
| 🛡️ Arculat | a címer, színminták, tükör; a játékos forog |
| 🔭 Scout-fejlesztés | a scout távcsővel, a csillagai sorra kigyúlnak |
| 🧳 Keretbővítés | öltöző, az új szekrény ajtaja kinyílik, a játékos beköltözik |
| 🤝 Összhang-edzés | két játékosunk pacsizik, szívek; a keret összhangja |
| 🔍 Klub-szemle | kerítés mögül jegyzetel egy idegen edzésről |
| 🌟 Sztárpiac | vörös szőnyeg, vakuk |
| 📈 Eladás | ügynök, pénzeszsák, a kirakat létszáma |
| 👁️ Figyelőlista | a távcső látómezeje pásztáz, benne a kiszemelt |
| 🧑‍💼 Stábpiac | állásinterjú: a jelölt aktatáskával érkezik |

## Próbák
**`tools/kupa-unneples-1-0-12-11-00-proba.js`** — valódi nyári kupadöntő a felületről. Ellenőrzi:
- az ünneplés alatt a lánc áll;
- a felvonások jönnek, figurával;
- „Átugrom” után a trófea-képernyő jön, konfettivel;
- „Tovább” után a lánc pontosan egyszer indul;
- a kupa lezárásakor nincs második trófea-képernyő;
- mind a 7 szint hibátlanul felépül, a hossz 46–60 mp;
- az ikon: rögzített „ki” mellett 0 az esély, a közös beállítás ellenére;
- nincs oldalhiba.

**`tools/menupont-jelenetek-1-0-12-11-00-proba.js`** — a 13 jelenetre ellenőrzi:
- mind megjelenik, felirattal;
- nincs benne „undefined” vagy „NaN”;
- mind mozog, és a mi figuráink szerepelnek;
- a valódi menügombok a sajátjukat indítják.
