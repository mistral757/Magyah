# ⚡ Vonzóbb mennydörgés + a szinergia jelenetei (1.0.6.4.00)

## A kérés

> „Készíts animációkat a szinergia gólokhoz. És valamivel tegyük vonzóbbá a
> hol jön a mennydörgés taktikát. Szinte sosem választja azt senki. Az összes
> képessége legyen picit olcsóbb (5%), hatása picit erősebb (10%). És ezzel is
> legyen egy olyan, mint a panzerkampfwagennel […] Plusz legyen egy új
> képessége ennek a stílusnak, ami a sebességben kiemelkedő játékosok piaci
> árát csökkenti 33, 40 és 50%-kal, és ebbe a scout által talált játékosok is
> beleszámítanak."

## 1. −5% ár, +10% hatás

- **Ár:** minden Villám-képesség minden szintje és csúcsfoka ×0,95, egy
  helyen (`VL_AR_MULT`, a csúcsfokok csatolása után).
- **Hatás:** a képességek saját soraiban, hogy a kiírt számok is az újak
  legyenek (az arányos hatásoknál az eltérés ×1,1):

| képesség | régi | új |
|---|---|---|
| Sebességre hangolt sorsolás | ×1,30 / 1,45 / 1,60 | ×1,33 / 1,50 / 1,66 |
| Vérükben a rendszer | +2,5 / 5 / 7,5% | +2,75 / 5,5 / 8,25% |
| Korai plafon-nyitás (passzív út) | +20 / 25% | +22 / 27,5% |
| Sprintmester-műhely | +20 / 32 / 45% | +22 / 35 / 50% |
| Gyorsabb izomzat | 1,35 / 1,25 / 1,15× | 1,335 / 1,225 / 1,115× |
| Utolérhetetlen | +1,5 / 2,5 / 3,5 | +1,65 / 2,75 / 3,85 |
| Villámkontra | +5 / 9 / 13% | +5,5 / 10 / 14,5% |
| Szárnyakon kifutva | −30 / 55 / 80% | −33 / 60 / 88% |
| Sprint-iskola | a csillag-kedvezmény | ×1,1 |
| Kiosztott szerepek | B2B, Legolas, Robben | minden érték 1-től való eltérése ×1,1 (`ROLE_DEFS`) |
| Száguldás | a tiki-taka hozamának 0,5-e | 0,55-e (`akcQk`; a 0,66-os korlát alatt) |
| csúcsfokok | | ugyanígy ×1,1 |

- **Nem skálázható:** a Mesterhármas-csillag fokozatai nem számok, ezek
  maradnak.

## 2. Gyors lábak piaca (új, II. sáv)

−33 / 40 / 50% a sebességben **kiemelkedő** játékosok vételárából. A
„kiemelkedő” a Legolas belépője: 95-ös Sebesség, Infinityben 100.
- **Csúcsfok:** 53 / 56 / 59%.
- **Hol él:** a `styleBuyMultFor`-on át megy, tehát minden vételnél: a
  piacon, a scout kiszemeltjeinél (a meghirdetett ár a `buyPrice`-ból
  számol), az álomigazolásnál és a többinél is.
- **Hol nem:** az eladási árakat nem érinti.
- **Kijelzés:** a kedvezmény-bontás kimondja, hogy „a gyors játékosokra”
  szól.

## 3. Nulladik szintű Villám

A Panzer nulladik szintjének mintájára (`vl0*`).

- **Feltétel:** az 1. idényben **bármikor**, ha a teljes keretben legalább
  4 ember 95-ös vagy jobb Sebességű, vagy legalább 2 ember 99-es. A
  felugró ablak egyszer szól, utána a stíluspanelen áll az ajánlat.
- **A Villám-zár él:** a feloldási létrán a Villám a 2. futástól nyílik. Le
  nem oldott filozófia oldalajtón sem vehető fel, ahogy a Panzernél sem.
- **Indításkor:** a **Korai plafon-nyitás** 1. szintje azonnal, ingyen él
  (megnyílik a 99-es sebesség-plafon), és a stíluspontok gyűlnek. Csak ez az
  egy képesség fejleszthető. A szint 0, a szerepek, a többi képesség, a
  hangolás és a Száguldás még nem él.
- **A döntés végleges.**
- **Az első idény lezárásakor** teljes értékű, a felgyűlt mérföldkövekkel
  (`pz0Graduate` → `vl0Graduate`).
- **Általánosítva:** a nulladik szint egyetlen képessége stílusonként
  (`preAbility`), és a nulladik szinten álló slot szerepei egyik stílusnál
  sem élnek (`roleKeysForStyle`).

## 4. A szinergia jelenetei (`skSzin`)

A jelenet maga a lánc: a pár két stílusának **mozdulata** egymás után, aztán
a gól.
- **Nyolc mozdulat:** 🧲 labdaszerzés · 🛡️ blokkoló fal · 💥 megfélemlítés
  (piros villanás, menekülő ellenfél) · ☯️ levegőben körző labda · 🌀
  cikkcakkos passzsor · ⚡ sprint a szélen · ⭐ a sztár aurás cselezése ·
  🔥 lövés-sorozat.
- **Sorrend:** indító → vivő → befejező, így a 28 pár 28 különböző jelenet.
- **Feliratok:** a cím a pár neve, az alcím a lánc (pl. „🧲 visszaszerez →
  ⚡ elfut”).
- **Szereplők:** a lánc valódi emberei, a gólszerző a befejező.

## Próba

- **Új:** `tools/villam-mennydorges-1-0-6-4-00-proba.js`, 19 állítás.
- **Frissítve:**
  - `esemeny-animacio` (33 skill-jelenet);
  - `stilus-edzok` (a Villám ára ×0,95);
  - `szinergia` (a Megközelíthetetlen a ritkák között; A sztár futópályája
    csavarja 0,15-ös alappal).
