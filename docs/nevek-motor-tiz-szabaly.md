# 🧬 A névmotor tíz szabályhiánya (3.9.113)

## 0. Egy mondatban

A gépi réteg tíz ponton a **saját guide-ját** (`docs/nevek-danisitasa.md`)
sértette meg; a javítás **412 nevet** érint a 2942-ből (**14%**), és
**egyetlen kézi nevet sem**.

## 1. Hogyan jött elő

Nem szemre, hanem méréssel: a `HU_NAME_TABLE` gépi felét (a `manual.py`-ban
nem szereplő neveket) végigsöpörtem a guide kilenc szabályán, és
nemzetiségenként számoltam, hol tér el a kimenet attól, amit a guide előír.
Tíz visszatérő minta jött ki — mindegyik **egy** motorsor hibája, nem
egyedi elírás.

## 2. A tíz javítás

| # | mi volt a baj | érintett | példa (előtte → utána) |
|---|---|---|---|
| 1 | **`ll` nyelvfüggetlenül `lj`** | 124 | Montelja → **Montela** · Följer → **Föler** · Galjardo → **Gajardo** |
| 2 | spanyol/portugál **szókezdő `S-`** | 69 | Sántamaría → **Szantamaría** · Súsa → **Szúsa** |
| 3 | spanyol **`-ez` → `-essz`** | 50 | Rodríguessz → **Rodríguesz** · Gómessz → **Gómesz** |
| 4 | angol **`s` + mássalhangzó** | 18 | Húrst → **Hurszt** · Stracsan → **Sztracsan** |
| 5 | **`Mc-`/`Mac-`** magánhangzó nélkül | 21 | Mkneili → **Mekneil** · Mkkoist → **Mekkoiszt** |
| 6 | olasz **magánhangzók közti `s`** | 15 | Mároso → **Marozo** · Kausio → **Kauzio** |
| 7-8 | holland **`v`, `g`, `ij/ei/ui/oe`** | 41 | Vánhanegem → **Fanhanehem** · Kéizer → **Kájzer** |
| 9 | **`qu` → `kv`** újlatin nyelveken | 22 | Zsonkvet → **Zsonket** · Larkvé → **Larké** |
| 10 | francia **`G`** i/e előtt | 6 | Giressz → **Zsiressz** |
| | átfedés (egy név több szabályon) | 46 | Mkkoist → Mekkoiszt (5. + 4.) |

## 3. Amiből tanulni lehet: a sorrend a hiba, nem a szabály

Három javításnál **nem hiányzott** a szabály — rossz helyen állt.

### 3.1 A Rodríguessz: kétszer cserélt `z`

```python
if lang == "es":
    s = re.sub(r"ez$", "esz", s)   # rodríguez → rodríguesz
...
    s = s.replace("z", "sz")       # …és most az ÚJ sz-ben lévő z is
                                   #    → rodrígues + sz = rodríguessz
```

A `z → sz` egymagában helyesen hoz `Rodrígesz`-t — a `Zapata → Szapata`
mindig is bizonyította, hogy a cserével nincs baj. **A javítás a fölösleges
sor törlése volt.**

### 3.2 A Gahardo: a spanyol `j` torokhang

Az első nekifutásom az `ll → j`-t az általános listába tette. Csakhogy az
`es` ág lentebb `j → h`-t cserél (Juan → Huan), tehát a frissen beírt `j`
azonnal `h` lett: **Gallardo → Gahardo**. A franciánál ugyanez a `j → zs`-vel
(**Gillet → Gizset**).

A blokk ezért a **nyelvi ágak UTÁN** áll. Ez a kód így is van kommentelve —
a következő javítás ne essen ugyanebbe.

### 3.3 A Fájnaldum: a holland `w` és `v`

Hollandul a `w` ejtése **v**, a `v`-é viszont **f**. Az általános lista
`w → v`-t cserél, tehát ha a `v → f` utána futna, a **Wijnaldum**ból
`Fájnaldum` lenne. A holland `v → f` ezért a **legelső** lépés, még a
lista előtt; a maradék holland szabály (`g → h`, `ij/ei → áj`, `ui/uy → öj`,
`oe → ú`, `eu → ö`) a nyelvi ágban.

## 4. Két szándékos kihagyás

### Belgium már nem „nl"

Az ország kétnyelvű: a névsor nagyjából fele francia ajkú (Gillet,
Chevalier), a másik fele flamand. Amíg a nemzetiség az egyetlen fogódzónk,
az **erős** holland szabályokat nem szabad ráengedni — `Gillet`-ből
„Hillet" lenne. Belgium ezért saját nyelvkódot kapott (`be`), amihez **nem
tartozik ág**: ott betűre az marad, ami eddig volt. A patronim `-sen`
kezelését (`SON_LANG`) viszont megtartotta.

### A német `st` marad „sht"

A 4. pont csak az **angolra** szól. Németül a szó eleji `st`/`sp` tényleg
„sht" (Stefan → Stefán), és a `de` ág ezt külön meg is védi egy
`^s(?=[pt])` sorral.

## 5. Ami NEM volt hiba, bár annak látszott

A mérés közben 199 ütköző rövid alak jött elő (9× `Rodríguessz`, 8×
`Garszía`), és ez elsőre gondnak látszott. **Nem az:** a
`buildHuShortDisambig()` futásidőben végignézi a táblát, és minden ütköző
kulcsnál a **teljes névre** vált (`HU_SHORT_DISAMBIG`). 483 név megy ki így
teljes néven — a képernyőn tehát sosem áll két különböző ember azonos
néven. A `build.py` ugyanezt ki is írja, de csak **jelentésként**, nem
beavatkozásként; a beavatkozás a játékban van.

## 6. Ellenőrzés

```bash
python3 tools/nevek/build.py      # 412 név változott, kézi: 0
python3 tools/nevek/kettozes.py   # ✓ nincs kettőzött személy
node tools/nev-audit.js           # ✓ minden névkiírás a megjelenítési rétegen megy át
node tools/klubnev-proba.js
./tools/check.sh
```

A `build.py` saját őrei is lefutottak: egyetlen név sem maradt változatlanul,
két különböző játékos nem kapott azonos teljes nevet, és a trágárszűrő is
tiszta.

> **Ismert, ELŐZETES hiba:** a `tools/nevmod-boot-proba.js` egy állítása
> (az edzők rövid neve) már a változtatás ELŐTT is bukott — ellenőrizve a
> változtatás előtti `index.html`-en. Nem ehhez a kötegez tartozik.

## 7. A kézi utómunka (3.9.114)

A motorjavítás után a huszonhét legláthatóbb névből **tizenkilenc** már
jó volt; **nyolcat** a felhasználó kézbe vett. Ezek a `manual.py` 33.
kötegében állnak, mert olyan döntések, amiket egy fonetikai szabály sosem
hozna meg:

| kanonikus | motor (3.9.113) | kézi (3.9.114) | miért |
|---|---|---|---|
| Florian Wirtz | Firk Barnabás | **Virc Flóri** | német `W`=v, `tz`=c — és élő sztár |
| Alex McLeish | Mekleis Sándor | **Meklís Sanyi** | a skót `ei` itt hosszú í |
| Gianluca Pagliuca | Paljuka Lukács | **Pali Lyuka Lukács** | a név kínálta a szétvágást |
| Mario Corso | Korso Márió | **Korzózó Márijó** | a „korsó" most szándékos |
| Ezequiel Garay | Garáj Ezékiel | **Garai Ezékiel** | valódi magyar vezetéknév, ugyanaz a hangzás |
| Grégory Coupet | Kúpet Gergely | **Q. P. Gergely** | betűnév: a kú-pé magyarul két betű neve |
| Radja Nainggolan | Nájngolan Dezső | **Ragyás Nyálgollam** | a poén a két szó EGYÜTT |
| Dwight Yorke | Jork Gedeon | **Dwáj Tyork** | a szóhatár elcsúsztatása |

**Két név rövid alakja a TELJES név** (Nainggolan, Yorke): a vicc félbevágva
nincs meg. Ez nem újdonság — a `Ronáldó Krisztián` és a `Názári Ronáldó` is
így áll. A `Pali Lyuka` pedig kétszavas rövid alak, mint a `Kér Kéz`
(Kerkez Milos) és az `Ínyenc Pista` (Iniesta).

Mind a nyolc **egyedi**: egyik rövid alak sem ütközik a tábla többi 3831
nevével, tehát egyik sem esik vissza a `HU_SHORT_DISAMBIG`-on a teljes
névre (azon a kettőn kívül, ahol ezt kifejezetten akartuk).
