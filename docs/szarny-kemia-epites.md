# ⚡ A szárny-kémia úgy épül, mint minden más kémia · 🧲 a másodlagos meccserő-szint megvehető · ⚖ az ellenfél ereje őszintén (3.9.143)

*(Érintett kód: `SZARNY_NEED` / `SZARNY_OFFER` · `szarnyState` (migráció) ·
`szarnyPairOk` / `szarnyFit` / `szarnySideTaken` / `szarnyAtClub` ·
`szarnyAddStage` / `szarnyAnnounce` / `szarnyAjanlPair` / `autoStartSzarny` ·
`showSzarnyBuild` / `renderSzarnyPick` · `szarnyTick` · a jutalom-sor
`processSkillQueue` · a Villám motor-szakasza · `engSectionBind`. Próbák:
`tools/szarny-kemia-epites-proba.js`, `tools/masodlagos-motor-vasarlas-proba.js`.)*

## 1. A szárny-kémia

> „A szárny kémia ugyanúgy láthatatlanul épül, ráadásul egy első szezonbeli
> páros épül, amit rég lecseréltem, ezért elakadt, de beragadt. Legyen ez is
> olyan, mint minden más kémia építés. Minden mechanikát ültessünk át.”

### Mi volt a baj

A 3.9.107-es szárny **magától** indult: a meccs utáni tick az első két
jelöltet párba állította, és oldalanként **az első pár örökre lefoglalta a
szárnyat**. Ha a pár egyik tagja közben elment vagy a padra került, a pár
sosem ért össze, és mást sem engedett indulni. A képernyőn két, soha be nem
fejeződő „épül” sor maradt.

### Mi lett belőle — pontosan a gyilkos páros (3.9.138) mintája

| | most |
|---|---|
| **indulás** | a meccs utáni jutalom-sorban **felajánlás** (saját dobás, a stílusszint fokozatával nő: ×1 / ×1,25 / ×1,33) |
| **választás** | **te** választasz párt; a rendszer ajánl is egyet (AJÁNLOTT sor, egy koppintás) |
| **építés** | **5 fázis**; minden felajánlásnál a futó párat építed tovább („koppints a továbbépítéshez”) |
| **váltás** | „↩ Mégis másik szárnyat építek” — **a fázisok megmaradnak**, a pár később folytatható |
| **végigjátszás** | a gép lép: a félkész párat építi tovább, vagy az ajánlottat indítja |
| **kész (5/5)** | él a gólesély-bónusz (ha mindketten pályán vannak), és a közös meccsek **összeérést** hoznak: 14 / 11 / 8 meccs után a sebesség fölfelé kiegyenlítődik — ahogy eddig |
| **a belépő** | a szigorú szárny-szabály marad: azonos oldal, védő + szélső, legfeljebb 3 sebesség-eltérés |
| **a hely** | szárnyanként **egy ÉLŐ** kész pár. Ha egy tagja elhagyja a klubot, **a szárny felszabadul** |

### A régi mentés

Egyszer fut (`S.szarnyMig`): a kész pár kész marad. A magától indult félkész
pár a közös meccseiből fázist kap (1–4). **Futó pár nincs**, a folytatás a
te döntésed. A régi, beragadt pár így már nem foglal semmit: a panel
„félbemaradt: X már nincs a klubnál” sorral mutatja.

### A panel

A Villám motor-szakasza a valódi állapotot mondja: `k/2 kész · n épül`, és
páronként: *épül (k/5 fázis) · ⚡ ezt építed*, *kész · összeérés k/11*,
*összeért*, vagy *félbemaradt: … már nincs a klubnál*.

## 2. A másodlagos filozófia meccserő-szintje (Fojtás)

> „nem lehet megvenni továbbra sem a másodlagos meccserő növelőjét. Rányomok
> és nem veszi el a pénzt. Pedig meg van a keret.”

**Az ok:** a motor-szakasz „Megveszem” gombja paraméter nélkül hívta az
`engBuyLevel()`-t, az pedig az **elsődleges** motorra (`engKey`) nézett. A piac
gombjai 3.9.131 óta a **nézett** stílus gazdaságából fizetnek, de a
szintvásárló gomb ebből kimaradt. Másodlagos Gegen mellett a gomb így az
elsődleges motor árát, szintjét és pontkeretét kérdezte, és a válasz némán
„nem” lett. Ha az elsődlegesnek épp volt elég pontja, a gomb **azt**
vette meg.

**A javítás:** a gomb ugyanazt a kulcsot kapja, mint a piac
(`styleViewKey()`). A próba a valódi szakaszt rajzolja ki és a valódi gombot
nyomja meg: a régi kódon pontosan a bejelentett hibát adja vissza (nincs
levonás, és a második esetben a Villám szintje nő).

## 3. ⚖ Az ellenfél meccsereje az eredményjelzőn — őszintén

> „Szerintem az ellenfélhez beírt meccs erő az nem valós. […] Az csak
> ugyanúgy az én meccs erő boostom rátéve az övére, úgy hogy közben valós
> meccserő boostot nem kapnak.”

**Amit a kód valóban csinál:** a bajnokin a motor az ellenfél erejéhez
hozzáadja a **te rejtett meccs-bónuszod felét** (morál, taktika, aura,
kapitány, edző — `matchHiddenOppBuff` → `oppBuffFor`). Ez a 3.5-ös nehézségi
kiegyenlítés: e nélkül egy kiépült keret (+9 rejtett bónusz) ~96%-kal nyerte a
bajnokságot, vele ~89%-kal, a fejletlen keretet pedig nem bünteti. A kiírt
szám tehát nem hazudott a motorról, csak összemosta a két dolgot.

**A döntés:** „Maradjon, de őszintén kiírva.” A motor nem változik. Az
eredményjelzőn az ellenfél ⚡ sora két részre bomlik:

```
⚡138,7 ⚖+8,6
```

* **⚡** — az ellenfél **saját** ereje;
* **⚖** — a nehézségi kiegyenlítés (a felirat elmondja, miből jön).

A motor a kettő **összegével** számol. A két kiírt rész összege pontosan a
kerekített egész: előbb az egészet és a kiegyenlítést kerekítjük, a saját erő
a különbségük. Ha nincs kiegyenlítés (párharc, klasszikus mód, 0 rejtett
bónusz), a sor a régi, egyetlen ⚡ szám marad. A 430 px széles telefonon is
egy sorban fér el. Próba: `tools/nyomas-es-meccsero-proba.js` 5. blokk.
