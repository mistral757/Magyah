# 🧬 A névmotor szabályhiányai (3.9.113 → 3.9.119)

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


---

# II. rész — az őrjelek és a maradék tíz szabály (3.9.118–119)

## 10. A meta-hiba: egy hibaosztály, tizenháromszor

A 3.9.113 tíz javításából **három** nem hiányzó szabály volt, hanem rossz
sorrend. Az utólagos söprés kiderítette, hogy ez nem véletlen: **ugyanaz a
séma tizenháromszor ül a motorban.** Egy korai lépés beír egy magyar
kétjegyű betűt, egy későbbi pedig belemar, mert csak **betűket** lát, nem
**hangokat**.

| a korai lépés | a későbbi lépés | eredmény |
|---|---|---|
| `ez$ → esz` | `z → sz` (es) | Rodríguessz |
| `ß → sz` | `z → c` (de) | Häßler → **Haskler** |
| `ž → zs` | `z → c` (de) | Džemaili → **Dcsemájli** |
| `ñ → ny` | `y → j` | Núñez → **Núnjesz** |
| `gn → ny` | `y → j` | Signori → **Sinjori** |
| `gli → lyi` | `y → j` | Pagliuca → **Paljiuka** |
| `ç → cs` | `c → dzs` (tr) | Selçuk → **Seldzssuk** |
| `ã → a` | `ão$ → án` sosem fut | Militão → **Mílitao** |
| `tz → c` | `c → k` | Großkreutz → **Groszkrojk** |
| `z → c` (de) | `c → k` | Schulz → **Sulk** |
| `ss → ssz` | `z → c` (de) | Sparwasser → **Sparvasscer** |
| `ski$ → szki` | `z → c` (de) | Milewski → **Milevscki** |
| `w → v` | `v → f` (de) | Weiß → **Fájsz** (helyesen Vájsz) |

**Az utolsó öt nem a mérésből jött**: az őrjelek bevezetése *közben* bukkant
elő. Ez a legjobb érv a megoldás mellett — a rendszer a saját hibáit is
előhozta.

### A megoldás nem folt

Az eldöntött kétjegyű betűk mostantól **egyetlen láthatatlan karakterként**
utaznak végig a soron, és csak a legvégén bomlanak vissza:

```python
S_NY, S_ZS, S_CS, S_LY, S_SZ, S_AO, S_C, S_DZS = "\x01" … "\x08"
S_SSZ, S_CCS, S_S                              = "\x09", "\x0a", "\x0b"

def desent(s):                    # a fonetika UTOLSÓ lépése
    for k, v in SENT.items():
        s = s.replace(k, v)
    return s
```

A levezetett szabály, ami a kódban is ott áll:

> **Ha egy csere magyar kétjegyű betűt ír, őrjelet kell írnia.** Nem azért,
> mert ma elromlana, hanem mert a következő nyelvi szabály már nem tudja,
> hogy az ott egy döntés eredménye volt.

### Bizonyíték, hogy az OKOT szünteti meg

A 3.9.116-ban beépített `^s(?!z)` őr (a `Szzapata` foltja) **fölöslegessé
vált** — a `z → sz` most őrjelet ír, azon a csere nem talál `s`-t —, és el is
hagytuk. Egy folt, amit nem megkerültünk, hanem **kidobtunk**.

Három őrjel (`S_SSZ`, `S_CCS`, `S_S`) pedig már a bevezetés *közben* előjött
hibákból született: a hosszú `ssz`/`ccs` első betűjébe (Nilsson → Nilszszon,
Bucci → Bukcsi), illetve a valódi sh hangot jelölő `s`-be (Xeka → Szeka)
martak bele az új nyelvi ágak.

## 11. A maradék tíz szabály (3.9.119)

| # | szabály | mit javít |
|---|---|---|
| A | angol szóvégi `-s` → sz | Péters → **Petersz**, Bírtles → **Birtlesz** |
| B | francia néma szóvégi `-t/-d/-s/-x/-z` | Ámoros → **Amoro**, Zsonket → **Zsonké** |
| C | skandináv `s` → sz | Bástrup → **Basztrup**, Nílsffy → **Nilszffy** |
| D | török `s` → sz, a `ş` marad s | Sivok → **Szivok**, Baştürk → **Bastürk** |
| E | görög `s` → sz | Dómazos → **Domazosz**, Mánolas → **Manolasz** |
| F | `-ović` megtartja az „ov"-ot | Jics → **Jovics**, Csurkics → **Csurkovics** |
| G | lengyel `sz/cz/rz/ch/ni` | Piszcsek → **Piscsek**, Bonik → **Bonyek** |
| H | olasz `c` e/i előtt mindig cs | Manszini → **Mancsini**, Bucszi → **Buccsi** |
| I | olasz `s` + mássalhangzó → sz | Anastazi → **Anasztazi** |
| J | portugál `x` → s | Aleikszo → **Aleiso**, Kszeka → **Seka** |

Két nyelv saját kódot kapott: **lengyel** (`pl`) és **görög** (`gr`) — eddig
a közös szláv kosárban, illetve ág nélkül ültek.

**A lengyel a latin szabályok ELŐTT fut**, mert *helyesírás*, nem fonetika:
az általános `ie → i` különben előbb enné meg a „nie"-t (Boniek → Bonik).
Ugyanez az elv, mint a holland/német `v → f`-nél.

**Az angol `-s` szándékosan egységesen `sz`**, nem zöngésség szerint: a
Francis /s/, a Giles /z/, és a kettőt csak a szó jelentése dönti el — egy
névtáblából nem. Az „sh" viszont **mindig** hibás, tehát a biztos felét
javítjuk: a hangot, nem a zöngésségét.

## 12. Összesítés

A 3.9.117-es állapothoz mérve **421 gépi név** változott, **kézi egy sem**.

| nemzetiség | db | | nemzetiség | db |
|---|---|---|---|---|
| Németország | 72 | | Görögország | 27 |
| Olaszország | 45 | | Brazília | 27 |
| Anglia | 44 | | Lengyelország | 12 |
| Franciaország | 39 | | Szerbia | 12 |
| Dánia | 31 | | Svédország | 10 |

Feloldatlan őrjel a táblában: **0**. Változatlanul maradt név: **0**.
Az ütköző rövid alakok száma 198 → **196**.

## 13. Ami tudva marad hátra

- **Szláv `s` + mássalhangzó**: a Stojkovics még „Shtojkovics"-nak
  olvasódik. Ezért kézi a `Sztojkovics Pongrác` és a `Jugovics Vladi`
  (36. köteg) — a szabály maga még nincs meg.
- **Francia orrhangok**: a Vincent „Vinszent" marad, nem „Vensan". Az
  `-ent/-ant/-in/-on` kezelése külön munka.
- **Német `ä`**: a PRE nem viszi (Matthäus → Mattaus); a németben `e`.
- **Angol `g`/`j` = dzs**: Giles → „Gilesz", nem „Dzsájlz".
