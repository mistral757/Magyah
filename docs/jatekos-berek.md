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
| induló (Magyar Másodbajnokok) | ~50% |
| Magyar Bajnokok | ~38% |
| Premier líg | ~13% |
| Infinity | ~12% |

részét vitte el. Vagyis **egy sikeres idény után a bevétel véglegesen elhúzott
a kiadástól**, és a pénznek nem maradt tétje. Ez volt a bejelentett hiba.

## 2. Az új bázis: a bér a bevételből számol

A klub két csatornán keres, és a meccsenkénti keret-bér bázisa **mindkettőre
érzékeny**:

```
bázis = 0,50 × a BÉRHORGONY heti bevétele
      + 0,25 × (a klub MŰKÖDÉSI kerete ÷ 34)  ← az „edzői fizetés" ága
      + trófeák × (a BÉRHORGONY heti bevétele ÷ 9)
```

> **A bérhorgony (v3.5.17)** a szurkolótábor létszáma, ahogy a **szezon elején**
> állt — nem a mai. Lásd a 6.1 szakaszt: ez a szám hajtja a bázist, a
> sztár-felárat ÉS a plafont is.

A klub-keret a `seasonBudgetCore()`, vagyis a nyári keret **működési rétege**:
a csapaterőből, a mezőny szintjéből, az edzői fizetésemelésből és a tempóból
álló összeg — ha kihívásból fizetésemelést kapsz, a bér is követi.

> **Miért a működési réteg, és nem a teljes keret? (v3.8.13)** A nyári keret
> második rétege a **vitrin-prémium** (lásd `docs/szezonkeret.md`): a piac
> tetejének egy százaléka, amit a megnyert trófeák nyitnak. Ha ez is a
> bérbázisban ülne, minden megnyert kupa azonnal vissza is drágulna bérben,
> ráadásul a bázis olyan messze kerülne a lelátótól, hogy a plafon
> (`WAGE_CAP_OK`) tartósan rákulcsolódna — és a Rating-arányos szétosztásnak
> nem maradna tétje. A trófea béremelését külön, mérten a `wageTitleCount` ága
> adja (a képlet harmadik sora).

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

## 6.1 A BÉRHORGONY — a szerződések lassabbak, mint a lelátó (v3.5.17)

**BEJELENTETT HIBA:** „a szurkolótábor azonnal magával rántja a fizetéseket —
így olyan, mintha nem lenne értelme, hogy többen járnak a meccsre."

**Mérve, a bejelentő karrierjében:** egy kihívás-jutalom **+5 410 fővel** emelte
a tábort (12 021 → 17 431), a meccsenkénti lelátó 122 → 176 M Ft-ra nőtt — a
bérszámla viszont **ugyanabban a pillanatban** 152 → 220 M-re, mert a bér minden
száma a MAI lelátóból számolt: a bázis (a lelátó fele), a sztár-felár (1/12) és a
plafon (125%) is. A nettó eredmény **−14 M Ft/meccs** lett: a nagyobb tábor
kevesebbet ért, mint a kisebb.

**A javítás.** A bér a **bérhorgonyhoz** van kötve: a szurkolótábor létszámához,
ahogy a **szezon elején** állt (`S.wageFans`). Menet közben a horgony nem
mozdul — egyik irányba sem —, tehát:

* amit az idény során hozzászerzel, annak a bevétele **teljes egészében a klubé**;
* egy megcsappanó tábor sem rúgja szét azonnal a bérszámlát.

**A szerződések a szezonfordulón tárgyalnak újra**, és akkor is csak a lemaradás
**felét** hozzák be (`WAGE_ANCHOR_CATCH = 0,5`, `wageAnchorSeasonTurn`). Aki
évről évre nő, tartósan nyereséges marad; aki megáll, annál a horgony pár idény
alatt utoléri a lelátót — onnantól a rendszer betűre a régi.

**A plafon is ezen az egy számon áll.** Enélkül a javítás visszafelé sült volna
el: a bázis befagy 210 M-en, a plafon viszont a friss lelátóval 220 M-re nő —
vagyis a plafon *kiengedne*, és a fizetés 152 → **210 M-re ugrana**. Egy
horgony, minden bér-szám alatta.

**MÉRVE a bejelentett esetre** (a valódi kóddal, `élmény ×1,00`):

| | tábor | bérhorgony | lelátó/meccs | plafon | nettó a meccsen |
|---|--:|--:|--:|--:|--:|
| szezon eleje | 12 021 | 12 021 | 120 M | 150 M | **−30 M** |
| a kihívás után, menet közben | 17 431 | 12 021 | 174 M | 150 M | **+24 M** |
| a következő idényben | 17 431 | 14 726 | 174 M | 184 M | −10 M |
| még egy idénnyel később | 17 431 | 16 079 | 174 M | 200 M | −26 M |

A „Sztárom a párom" sztár-bére (`fameWageAnchor`) ugyanezen a horgonyon áll,
a saját hírneve hozta tömegtől megtisztítva — így sem a saját hírneve, sem a
szezon közben szerzett tábor nem drágítja vissza a bérét.

## 7. Hol látszik

* **Infópult → Szezon és mérleg:** a kezdő 11 bére meccsre és idényre, a
  sztár-felár, a bér/lelátó arány és a rád vonatkozó plafon.
* **Bérmérő** (ugyanott): szezononként a bevétel, a lelátó része, a kifizetett
  bér, a bér/lelátó arány — a lábjegyzetben pedig a **plafon előtti (nyers) bér**
  és az, mennyit húzott vissza a plafon.
* **Meccsnapló:** minden lefújás után a levonás, a sztár-felárak száma, és ha a
  plafon fogott, az is, mennyivel — a plafon mostantól kimondja, hogy a
  **szerződéskori** lelátóhoz mér.
* **HUB → Szurkolók doboz:** a bérhorgony létszáma, és élőben az, mennyivel jár
  előrébb a tábor — vagyis mennyi a menet közben szerzett, tiszta haszon.
* **Szezonforduló:** a napló kimondja a szerződés-újratárgyalást (a horgony régi
  és új értékét), hogy a bér emelkedése ne a 3. fordulóban érje meglepetésként a
  menedzsert.

## 8. Hangoló számok

Mind egy helyen, a `JÁTÉKOS-FIZETÉSEK` blokk tetején:

`WAGE_FAN_SHARE` 0,50 · `WAGE_CLUB_SHARE` 0,25 · `WAGE_STAR_DIV` 12 ·
`WAGE_STAR_MAX` 3 · `WAGE_TITLE_DIV` 9 · `WAGE_CAP_OK` 0,50 ·
`WAGE_CAP_FAIL` 1,25 · `WAGE_STAR_RATING_PCT` 0,06 · `WAGE_STAR_CONTRIB` 1,6 ·
`WAGE_STAR_CARD` „killer" · `WAGE_ANCHOR_CATCH` 0,5.

## 9. Nyitott kérdés

A plafon a **szurkolói** bevételhez mér, a bázis viszont a klub keretéből is
merít. Az induló szinteken a klub-keret nagyságrendekkel nagyobb a lelátónál
(84-es mezőnyben ~206 pont/meccs a ~68-cal szemben), ezért ott a plafon szinte
mindig fog, és egy sikeres klub továbbra is felhalmoz. Ez így volt kérve; ha
egyszer az induló szinteken is szorosabb mérleg kell, a plafonnak a TELJES
bevételhez kellene mérnie — az viszont már más szabály, nem hangolás.
