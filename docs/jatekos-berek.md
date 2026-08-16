# A játékos-bérek — bevétel-érzékeny fizetés, sztár-felár, plafonok

*(3.3.18. A korábbi működést egyetlen konstans, a `WAGE_SCALE` adta; ez a
dokumentum az azt felváltó rendszert írja le. A bevételi oldalt a
`szurkoloi-gazdasag.md` írja.)*

## 1. Miért kellett

A régi képlet EGY fix szorzóból dolgozott: a bér csak a játékosok Ratingjét
követte. A bevétel viszont lépcsőzetesen ugrik — a liga-sávok szurkolói alapja
12 000 → 30 000 → 50 000 → 150 000 fő —, és a klub nyári kerete is nő. A kettő
nem tudott együtt haladni. Mérve a bér a szurkolói bevétel

| szint | bér / szurkolói bevétel (régi) |
|---|---|
| induló (NB II) | ~50% |
| NB I | ~38% |
| Premier líg | ~13% |
| Infinity | ~12% |

részét vitte el. Vagyis **egy sikeres idény után a bevétel véglegesen elhúzott
a kiadástól**, és a pénznek nem maradt tétje. Ez volt a bejelentett hiba.

## 2. Az új bázis: a bér a bevételből számol

A klub két csatornán keres, és a meccsenkénti keret-bér bázisa **mindkettőre
érzékeny**:

```
bázis = 0,50 × heti szurkolói bevétel
      + 0,25 × (nyári klub-keret ÷ 34)        ← az „edzői fizetés" ága
      + trófeák × (heti szurkolói bevétel ÷ 9)
```

A klub-keret a `seasonBudgetParts().club`, vagyis a csapaterőből, az edzői
fizetésemelésből és a tempóból álló összeg — ha kihívásból fizetésemelést kapsz,
a bér is követi.

## 3. A szétosztás: Rating, a MEZŐNYHÖZ mérten

A bázist a régi exponenciális kulcs osztja szét (`wageKey`, `WAGE_K = 0,040`),
csak mostantól a **mezőny szintjéhez** (`oppTargetRating`) horgonyozva:

```
egység = bázis ÷ (11 × kulcs(mezőnyszint))
egy játékos bére = egység × kulcs(a saját Ratingje)
```

Ebből három dolog következik:

* egy **mezőnyszintű tizenegy pontosan a bázist** viszi el — ez a rendszer
  nyugalmi pontja, minden szinten ugyanaz;
* aki a ligája fölé nő, az arányosan drágább (6 Rating-pont ≈ +27%);
* a **rotációnak ára maradt**: aki pályára lép, azért fizetsz, tehát 14 játékos
  14 bért jelent. Ebbe 3.3.18 óta a **félidőben lecserélt ember is beletartozik**
  — ő eddig sem meccset, sem bért nem kapott, pedig végigjátszott egy félidőt.

## 4. A nagyágyúk felára

Legfeljebb **három top sztár** kap külön felárat, fejenként a meccsenkénti
szurkolói bevétel **1/12-ét**. Top sztár az, akire legalább az egyik igaz:

| feltétel | mérce |
|---|---|
| Rating | a teljes keret átlagánál legalább **6%-kal** magasabb |
| hozam | a saját posztcsoportja átlagának **1,6-szerese** (gól+gólpassz+MVP, kapusnál bravúr+tiszta lap+MVP; legalább 6 meccs után) |
| kártya | a szezonkártyája **GYILKOS vagy magasabb** |

Ha többen is beleférnek, a három hely a rangsor élére kerülőké (Rating-többlet
+ hozam-többlet + kártyaszint egy közös pontszámban). Ha **senki nem emelkedik
ki**, nincs felár — egy egyenletes keretben nincs kit külön megfizetni; ez a
0-3 sáv alsó vége.

A felár csak akkor jelenik meg a számlán, ha az illető ténylegesen pályára lépett.

## 5. A siker béremelést hoz

A bajnoki és kupa-**győzelmekkel** (a döntő és az elődöntő nem számít) beözönlő
új szurkolótábor nem marad ingyen: **minden megnyert trófea után a bázis megkapja
az új költségvetés szurkolói bevételének 1/9-ét**. A legutóbbi idény trófeái
számítanak, tehát a béremelést újra és újra ki kell érdemelni — cserébe a
számítás mindig a MOSTANI (megnőtt) táborból dolgozik.

Két trófea (bajnoki cím + kupa) tehát a lelátó 2/9-ével emeli a bázist.

## 6. A két plafon

A teljes meccs-bér nem lebeghet szabadon:

| állapot | plafon |
|---|---|
| **sikeres** a legutóbbi idény | a szurkolói bevétel **50%-a** |
| nincs meg a siker | a szurkolói bevétel **125%-a** |

Sikeres az idény, ha **bármelyik** teljesült: top 3 bajnoki helyezés · európai
kupa top 4 (elődöntő vagy jobb) · magyar kupa-győzelem.

A plafon **arányosan** húzza vissza minden érintett bérét — a sztár-felárakat is
—, hogy a bontás mindig kiadja a végösszeget. A szándék kimondott: amíg a klub
sikeres, a lelátó kifizeti a bért és marad is belőle; ha kiesel a sikerből, a
felépített bér **túlterheli a rendszert**, de egy ponton (125%) megáll.

Az első idényben nincs mihez mérni, ezért ott a 125%-os plafon él.

## 7. Hol látszik

* **Infópult → Szezon és mérleg:** a kezdő 11 bére meccsre és idényre, a
  sztár-felár, a bér/lelátó arány és a rád vonatkozó plafon.
* **Bérmérő** (ugyanott): szezononként a bevétel, a lelátó része, a kifizetett
  bér, a bér/lelátó arány — a lábjegyzetben pedig a **plafon előtti (nyers) bér**
  és az, mennyit húzott vissza a plafon.
* **Meccsnapló:** minden lefújás után a levonás, a sztár-felárak száma, és ha a
  plafon fogott, az is, mennyivel.

## 8. Hangoló számok

Mind egy helyen, a `JÁTÉKOS-FIZETÉSEK` blokk tetején:

`WAGE_FAN_SHARE` 0,50 · `WAGE_CLUB_SHARE` 0,25 · `WAGE_STAR_DIV` 12 ·
`WAGE_STAR_MAX` 3 · `WAGE_TITLE_DIV` 9 · `WAGE_CAP_OK` 0,50 ·
`WAGE_CAP_FAIL` 1,25 · `WAGE_STAR_RATING_PCT` 0,06 · `WAGE_STAR_CONTRIB` 1,6 ·
`WAGE_STAR_CARD` „killer".

## 9. Nyitott kérdés

A plafon a **szurkolói** bevételhez mér, a bázis viszont a klub keretéből is
merít. Az induló szinteken a klub-keret nagyságrendekkel nagyobb a lelátónál
(84-es mezőnyben ~206 pont/meccs a ~68-cal szemben), ezért ott a plafon szinte
mindig fog, és egy sikeres klub továbbra is felhalmoz. Ez így volt kérve; ha
egyszer az induló szinteken is szorosabb mérleg kell, a plafonnak a TELJES
bevételhez kellene mérnie — az viszont már más szabály, nem hangolás.
