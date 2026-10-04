# 3.9.189 — 💸 Játékosszintű fizetések, a valódi jegyáron

> „A lelátói díjakat növeltük, de a fizetések irreálisan alacsonyak. Legyenek
> játékosspecifikusan szépen kiszámolva. Tartsuk továbbra is a sztárom a párom
> kivételével minden esetben a sikeres idén utáni max 50% limitet (a lelátó
> árához képest) de legyen szépen kiszámolva, kinek mennyi a fizetése. Legyen
> köze a csapatbeli szerepéhez, a potenciáljához, hogy mennyi ideje van nálunk,
> hogy mennyire sikeres, hogy friss sztárként igazoltuk-e stb."

## 1. Miért volt alacsony a bér

A 3.9.183 óta a lelátó bevétele a **jegyár-szorzóval** (`fanTicketScale`)
nő: 100-as nyers erő fölött meredeken, 117-nél kb. ×8, 125-nél kb. ×14.

A bér horgonya (`wageAnchorWeek`) és a plafon viszont a **régi, szorzó
nélküli** jegyáron számolt. Erős keretnél a bér így a lelátói bevételnek
csak az 1–5%-a lett, és az 50%-os plafon gyakorlatilag soha nem fogott.

**A javítás:**

* a horgony **létszáma** marad a szerződéskori (a szezon közben szerzett
  szurkoló továbbra is a klub tiszta haszna);
* az **ára** viszont a mai jegyár, a szorzóval együtt;
* ugyanígy a sztár hírnév-horgonya (`fameWageAnchor`).

Így a bér és a plafon is a lelátó **valódi** bevételéhez mér. Erős keretnél
a bérszámla ezért nagyot ugrik: a jegyár-szorzóval arányosan.

> **3.9.190:** a bér-bázis és a felárak arányai módosultak. A számla
> mostantól dinamikus, és nem tölti ki mindig a plafont — lásd
> `docs/dinamikus-ber-3-9-190.md`.

## 2. A plafon — változatlan elv

| helyzet | a meccs bérszámlájának felső határa |
|---|---|
| sikeres idény után (top 3, EK-elődöntő vagy MK-győzelem) | a lelátó **50%-a** |
| siker nélkül | a lelátó 125%-a |
| a **„Sztárom a párom”** sztárja | az ő hírnév-alapú bére a plafonon **kívül** áll |

Ha a számla a plafon fölé menne, a plafon **mindenkit arányosan** húz vissza,
tehát a sorrendet és az arányokat a lenti tényezők adják a plafon alatt is.

## 3. Kinek mennyi — a játékos saját szorzója

**A bér = Rating-alap × személyes szorzó (+ top sztár felár).**

* A **Rating-alap** a régi: a ligához mért Rating osztja szét a bázist.
* A **személyes szorzó** hat tényező szorzata, ×0,5 és ×2,5 közé szorítva.

| tényező | mitől függ | hatás |
|---|---|---|
| **szerep** | az idei meccsein átlagosan játszott perc (3 meccstől) | 70' fölött alapember ×1,00 · 35–70' rotációs ×0,85 · alatta csere/joker ×0,70 |
| | idény elején (3 meccs alatt) | a kezdő 11-ben ×1,00, a kereten ×0,85 |
| **kapitány** | a karszalag | ×1,12 |
| **potenciál** | a POT a keret átlagához | 1 + 0,30 × (arány − 1), ×0,85 és ×1,30 között |
| **hűség** | a klubnál lejátszott meccsek | meccsenként +0,25%, legfeljebb +30% (120 meccsnél) |
| **siker** | gól+gólpassz+MVP (kapusnál védés+tiszta lap+MVP) hozama a posztcsoport átlagához (6 meccstől) | az eltérés negyede, −10% és +25% között; GYILKOS vagy jobb szezonkártyával további +10% |
| **friss sztár-igazolás** | akit a keret többi tagjának átlagos piaci vételáránál legalább 1,25-ször többért vettünk | +35% az érkezés idényében, +20% a következőben, +10% a harmadikban, utána semmi |
| **ifi-szerződés** | saját akadémista, amíg ifi-státuszú | ×0,75 |

**A top sztár felára változatlan:** legfeljebb hárman kapják, fejenként a
lelátó 1/12-ét.

**A talizmánok is változatlanul hatnak:** az Ügynökháború és a Bérplafon.

**A sztár-igazolást a könyvelés „buy” kapuja jegyzi fel** (`ledgerNote` →
`wagePayNoteSigning`). Így minden igazolási úton él: piac, scout,
klub-szemle, álomigazolás, draft.

## 4. Hol látszik

* **A játékos adatlapján, a Statzone alatt:**
  * a fizetése egy pályára lépésre;
  * a Rating-alap és a szorzó;
  * a ×1-től eltérő tényezők, mindegyik az okával;
  * ha a kezdő 11 bérszámlája a plafon fölött van, a plafon utáni
    **ténylegesen kifizetett** összeg is.
* **A meccs utáni naplósorban:** a meccs két legjobban fizetett embere, a
  plafon utáni összeggel.
* **A keret-bontásban:** a legjobban fizetett játékos sora. Ez váltja a
  régi „a bér NEM követi a jegyárat” sort.
* **A súgóban** (`fizetesek`):
  * „A JÁTÉKOS SAJÁT SZORZÓJA”;
  * „A LELÁTÓ A VALÓDI JEGYÁRON SZÁMÍT”.

## 5. Próba

`tools/jatekos-fizetes-3-9-189-proba.js` — lásd a `tools/README.md`-t.

**A `tools/jegyar-skala-3-9-183-proba.js` az új szabályt ellenőrzi:**

* a bér horgonya a jegyár-szorzóval nő;
* a bontásban a legjobban fizetett sora áll.
