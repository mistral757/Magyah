# ⚖️🎁 A motor könnyítése alacsony nehézségen + a jutalom-képernyők magyarázata — 1.0.12.1.00

> KIMONDOTT KÉRÉS (kép a „Kémia-építés — válassz párost!” képernyőről): „Ezen a képernyőn sincs magyarázat, hogy ez micsoda. Plusz most fény derült arra, hogy fontos lenne a meccsmotort is kicsit részrehajlóbbá tenni minél lejjebb vagyunk nehézségi szintben. A mostani meccsmotor 7.1-től legyen az alap. Onnan nem kell nehezíteni. Lefelé viszont könnyíteni kell szépen fokozatosan, hogy a végére már egyértelmű győzelmet jelentsen ha meccserőd magasabb. És kevesebb meccserővel is lehessen akár nyerni meccseket"

**Minor:** egy meglévő rendszer (a nehézség) új irányt kap, és új, látható tanítás jön. A mentés nem változik. A futó karrierekben a 7.1 alatti fokozatokon a következő meccstől érvényes.

## 1. A meccsmotor: 7.1-től változatlan, lefelé fokozatosan könnyebb

- **Mérték:** `motorKonnyitesK()` → `k`.
  - A nehézség belső foka: i = (nf − 1)·5 + (s − 1).
  - 7.1-en és fölötte (i ≥ 30) `k = 0`: a motor **bitre a régi** (a próba 7.1-en, 8.3-on és 10.5-ön ellenőrzi).
  - Lefelé fokonként 1/30-dal nő, 1.1-en `k = 1`.
- **Az átalakítás** a gólvárhatóság számításában, egyszer, mindkét oldalra (`motorKonnyitettD`), a d = meccserő-különbségen:
  - ha te vagy az erősebb: d × (1 + 0,6k), vagyis a fölény egyértelműbb győzelem;
  - ha te vagy a gyengébb: d × (1 − 0,35k), vagyis a hátrány kevésbé dönt;
  - mindkét esetben +1,0k meccserő a te javadra, így kevesebb erővel is lehet nyerni.
- **Nem érvényes:**
  - a párharcban (két ember, `noBias`);
  - a közös karrierben (`MP.active`);
  - a H2H-szobában.

Győzelmi esély (a gólvárhatóságból, Poisson), meccserő-különbség szerint:

| Nehézség | −3 | 0 | +3 | +6 |
|---|---|---|---|---|
| 1.1 | 30% | 44% | 79% | 96% |
| 3.1 | 26% | 42% | 73% | — |
| 5.1 | 22% | 39% | 67% | — |
| **7.1 (alap, változatlan)** | 18% | 37% | 60% | 80% |

## 2. A jutalom-képernyők leckéi (Kezdő út)

A `#scSkill` jutalom-képernyő hat dolgot tud, és egyiknél sem volt magyarázat. Mindegyik az **első** megjelenésekor saját, vezetett leckét kap (`KUT_JUT`, `kutJutLecke`, `KUT_LECKE.jut_*`):

| Lecke | A képernyő címe |
|---|---|
| `jut_kemia` | Kémia-építés |
| `jut_passz` | Passzkémia |
| `jut_gyilkos` | Gyilkos páros |
| `jut_szarny` | Szárny-kémia |
| `jut_fejl` | Fejlesztés — jutalom! |
| `jut_skill` | Jutalom-skill, Örökség, Kihívás teljesítve, Kemény menetelés, Kiegyensúlyozott keret |

A lecke öt lépése:
1. **Mi ez a képernyő?** (a leírásra mutat)
2. **Mire jó?** (a hatás, konkrét példával)
3. **A játék ajánlata:** az AJÁNLOTT sor keretet kap, a lecke megnevezi a párost, és megmondja, mire figyelj.
4. **Válassz!** A villogó ajánlatra koppintva vagy saját választással lép tovább (a sorsolós képernyőn a Sorsolás gomb villog).
5. **Hol látod később?**

További szabályok:
- **Indulás:** a cím változását figyeli (`kutJutFigyelo`). Csak futó Kezdő úton indul, és csak ha nem fut más lecke.
- **Újranézés:** egyszer jön; utána a ☰ Menü → 🧭 Vezetés alatt újranézhető.

## 3. Javítások útközben

- **A menüből indított jutalom vagy felfedezés láthatatlan volt.** Ez az 1.0.11.22.00 óta így volt: a ☰ Menü saját felület (`body.inHubMenu`), és minden más szekciót elrejtett, a `#scSkill`-t és a `#scUnlock`-ot is. Most ablakként jönnek be a menü fölött, ugyanúgy, mint fektetett nézetben.
- **Két tanító lap egymáson.** Egy lecke indulásakor az előtte megjelent guide-tipp és a magától indult lépéssor alatta maradt. Mostantól:
  - a guide-tipp a sor elejére kerül vissza, és a lecke után jön elő;
  - a lépéssor lezáratlanul félreáll, így később újra sorra kerülhet.
- A „Jutalom-skill!” tartalékcímet a lecke kis-/nagybetűtől függetlenül ismeri fel.

## 4. Próbák

- `tools/motor-jutalom-1-0-12-1-00-proba.js`:
  1. a motor 7.1 fölött bitre a régi, lefelé monoton könnyebb;
  2. a párharcban és a közös karrierben nincs könnyítés;
  3. a kémia-lecke öt lépése valódi koppintással, nyitott menü mellett is; a második alkalommal már nem indul; újranézhető;
  4. nincs oldalhiba;
  5. mind a hat cím a saját leckéjét indítja.
- **Igazított próbák:**
  - `kezdo-ut-leckek`: 17 lecke;
  - `tanitas-vezetes`: a leckét a csukott menüs HUB-ról indítja;
  - `eromerleg`: a 7. pont a már 1.0.11.22.00 óta hibás szövegellenőrzés helyett a címet és a célrés-magyarázatot nézi.
- **Zöld még:**
  - a nehézség és a célrés próbái (`nehezseg-3-9-222`, `nehezsegi-letra`, `osztott-nehezseg`, `csucsfok-nehezseg`, `celres-*`, `ideny-rajt`, `szuperliga-kalibracio`);
  - a motor próbái (`meccsmotor-3-9-220`, `stilus-motor`, `parharc-motorszorzo`);
  - a kupa- és talizmán-próbák, `run-cel`, `sajat-bajnoksag`;
  - a Kezdő út összes próbája.
