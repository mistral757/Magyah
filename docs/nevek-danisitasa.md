# 🎭 A nevek Danisítása — módszertan

*(A `bf84bde` „Nevek Danisítása lvl100" commit 240 kézi javításából
visszafejtve. Az érintett fájlok: `tools/nevek/manual.py` (kézi réteg),
`tools/nevek/rules.py` (szabálymotor), `tools/nevek/build.py` (összefésülés).)*

## 0. Egy mondatban

A gépi átírás **kiejt**; a Danisítás **megszólal** — magyar fülnek, magyar
szájjal, és ahol lehet, egy poénnal.

---

## 1. Mi történt a `bf84bde`-ben

240 nevet írtál át kézzel. Nem véletlenszerűen: a javítások **kilenc
visszatérő szabályba** rendeződnek. Mérve:

| | darab |
|---|---|
| összes javítás | 240 |
| ebből a vezetéknév változott | 233 |
| a keresztnév is változott | 48 |
| …ebből az **eredeti** keresztnévhez tért vissza | 12 |
| „ifj." előtagot kapott (kettőzés-feloldás) | 8 |
| kelet-ázsiai névsorrend-javítás | 5 |
| egynevű (mononim) bejegyzés | 35 |

A többi (kb. 195) **fonetikai vagy poén-javítás** a vezetéknéven.

---

## 2. A kilenc szabály

### R1 — A vezetéknév a NYELV kiejtése szerint, nem betű szerint

A szabálymotor sokszor betűnként ment. A javításaid nyelvenként
következetesek — ez a lista belőlük készült:

| nyelv | amit a motor hibázott | a te javításod |
|---|---|---|
| **holland** | `G` mint g | `G` → **h** (Gakpo → **H**ákpó, Gravenberch → **Hráfenberh**) |
| holland | `v` mint v | `v` → **f** (Van Buyten → **F**anböjten, van Bommel → **F**ánbomlikel) |
| holland | `ui` betű szerint | `ui` → **öj/áj** (Kuyt → K**öj**t, Kluivert → Kl**áj**vert) |
| holland | `ij`, `ei` | → **áj / zs** (Sneijder → Szn**áj**der, de Vrij → Dévri**zs**) |
| holland | `oe` | → **ú** (Koeman → K**ú**man) |
| **olasz** | `gh` mint dzs | `gh` → **g** (Inzaghi → In**dz**agi) |
| olasz | `chi` | → **ki/kje** (Chiesa → **Kie**za) |
| olasz | `s` két magánhangzó közt | → **z** (Camoranesi → Kamorané**z**i, Gilardino → **Zs**ilárdínó) |
| olasz | `gn` | → **ny** (Insigne → Inszi**ny**e) |
| **francia** | `g` i/e előtt | → **zs** (Gignac → **Zs**inyak, Ginola → **Zs**inórka) |
| francia | szóvégi `-t`, `-s` | **néma** (Rabiot → Rábi**jó**) |
| francia | `ll` | → **j** (Lloris → **J**órizs) |
| francia | `gn` | → **ny** (Sagnol → Sza**ny**ol) |
| **portugál** | `-nho` | → **-nyó** (Coutinho → Kuti**nnyó**, Jorginho → Zsordzsi**nnyó**) |
| portugál | `s` szó elején | → **sz** (Adílson → Ádíl**sz**on, Salas → **Sz**álas) |
| **skandináv** | `s` | → **sz** (Sørloth → **Sz**őrló, Isaksson → I**sz**aksszon) |
| skandináv | `lj` | → **j** (Ljungberg → **J**únber) |
| **albán** | `Xh` | → **cs/zs** (Xhaka → **Cs**aka, Shaqiri → **Zs**agiri) |
| **orosz/ukrán** | `ni` | → **nyi** (Lunin → Lú**nyi**n) |
| **szerb/horvát** | `-ović` | **teljes** -ovics (Handanović → Handan**ovics**) |

> **A próba:** mondd ki hangosan. Ha egy magyar ember nem tudja elolvasni
> ránézésre, akkor még nem jó.

### R2 — Ha a név JELENT valamit, fordítsd le

Ez a legerősebb Danisítás. Az idegen név belsejében lévő szó magyarul szólal
meg:

| eredeti | jelentés | a te megoldásod |
|---|---|---|
| Look**man** | *look* = nézd | **Figyelj**mán |
| **Saelemaekers** | *sail maker* = vitorlakészítő | **Szálkészítő** |
| **Anyukov** | — (hangzás) | **Anyukád** |
| **Southgate** | *south gate* = déli kapu | **Délikapu** |
| **Immobile** | *mozdulatlan* | **Immozdulatlan** |
| **Petit** | *kicsi* | **Pici** |
| **Ntim** | *N-team* | **Egycsapat** |
| **Mertesacker** | — (hangzás) | **Méretreszakker** |
| Vágner **Love** | *szerelem* | **Szerelmes** Vágner |
| **Everton** | *ever* = mindig | **Mindig**ton |
| Gift **Orban** | *gift* = ajándék | **Orrban az Ajándék** |
| **Arshavin** | *arse shaving* | **Seggborotváló** |
| **Denílson**, **Ederson**, **Edílson** | *-son* = fia | Deni**fia**, Éder**fia**, Édíl**fia** |

**A `-son` = `-fia` szabály általánosítható**: skandináv `-sson`, angol
`-son`, holland `-sen` mind ugyanaz.

### R3 — A keresztnév sorrendje: megfelelő → eredeti → csak végül a kalap

A motor gyakran véletlen magyar nevet húzott a kalapból (`POOL`). Te
háromlépcsős sorrendet használtál:

1. **Van magyar megfelelője?** Akkor az. `Adamo → Ádám`, `Adrien → Adriján`,
   `Emre → Imre`, `Jesús → Jézus`, `Alexander → Alex`, `Dean → Dénes`,
   `Christoph → Kristóf`, `Enrico → Imre`, `Demetrio → Demeter`.
2. **Nincs, de jól hangzik magyarul?** Akkor az **eredeti**, magyaros
   írásmóddal. `Ademola → Ademóla`, `Kasper → Kászper`, `Gareth → Geret`,
   `Jamie → Dzsémi`, `Kai → Káj`, `Dayot → Dejó`, `Declan → Dékán`.
3. **Csak ha egyik sem:** magyar név a kalapból — de akkor olyan, ami
   *illik* a hangzáshoz.

> A kalapból húzott név a leggyakoribb gyengeség: **1526 névnél** fut ma így,
> mert a keresztnév nem szerepel a `GIVEN` térképben.

### R4 — Kelet-ázsiai és kötőjeles nevek: hol a vezetéknév?

A motor az utolsó szótagot hitte vezetéknévnek. Kelet-Ázsiában a **családnév
áll elöl**:

`Kim Jin-su` → nem „sú", hanem **Kím** · `Park Ji-sung` → **Párk** ·
`Lee Kang-in` → **Lí** · `Kwoun Sun-tae` → **Kvún**

Európai **kötőjeles** vezetéknévnél a kötőjeles egész a vezetéknév, és
mindkét felét kezeljük: `Oxlade-Chamberlain` → **Okszi-Csamberléjn**,
`Calvert-Lewin` → **Kárérte-Levinek**, `Zaïre-Emery` → **Zaj-Imre**.

### R5 — Ugyanaz az ember kétszer: „ifj." + AZONOS vezetéknév

Az adatbázisban 233 egyszavas bejegyzés van, és **38**-nak van teljes nevű párja
(`Cruyff` és `Johan Cruyff`, `Batistuta` és `Gabriel Batistuta`). A rövid
alak **„ifj."** előtagot kap, és **ugyanazt** a vezetéknevet, mint a párja:

`Cruyff → ifj. Krojfi` · `Batistuta → ifj. Bátyuska` ·
`Cantona → ifj. Kántornak Tanult` · `Di Stéfano → ifj. Disztefános`

> Nyolcat elintéztél, **kb. harminc még hátravan** — és néhánynál a két
> alak ma *ellentmond* egymásnak (`Coutinho → Kutyinka`, de
> `Philippe Coutinho → Kutinnyó Fülöp`).

### R6 — Egynevű brazilok: becézés, nem betűzés

`Gabi → Gabika` · `Nani → Nyanyi` · `Guti → Hutyi` · `Gavi → Gagyi` ·
`Sylvinho → Szilvinjóska` · `Édmilson → Édmílsonka` · `Deco → Dekázó` ·
`Hulk → Hulkakolbász` · `Bebeto → Baba-tó` · `Danilo → Dani a Ló`

A minta: **magyar fülnek kedves végződés** (-ka, -i, -ó, -nyi), ami *hasonlít*
az eredetire.

### R7 — Amit magyarul nem lehet kimondani, az rossz

A motor néha mássalhangzó-torlódást gyártott: `Kskhaka`, `Skmeicsel`,
`Drakskler`, `Mkbrid`. Ezeket mind feloldottad: `Csaka`, `Smájkell`,
`Drakszler`. **Négy mássalhangzó egymás után: azonnali gyanú.**

### R8 — A puszta ékezet nem válasz

A motor tartaléka (`lengthen()`) megnyújtja az első magánhangzót, ha a
fonetika nem változtatott semmit: `Konko → Kónko`, `Balbo → Bálbo`,
`Rami → Rámi`. Ez **elírásnak látszik, nem névnek** — és ma **1127 névnél**
ez az egyetlen „átírás".

### R9 — Magyar játékosnál gyengéd csavar, a VALÓDI néven

`Grosics → Gyorsíccs` · `Gulácsi → Gula` · `Dombi → Bombázó`. A poén a
meglévő magyar névre épül, nem cseréli le.

---

## 3. Két dolog, ami tiltott

**Véletlen trágárság.** A `7b7ea2a` commit épp ezt gyomlálta ki. Figyelj:
`Sarti → Szarti`, `Sarabia → Szarabia`, `Bastrup → Basztrup` — a fonetika
magától belefut. **Szándékos** poén viszont megengedett (`Costacurta →
Aztakurva`, `Pizarro → Pizzaszaró`, `De Paul → Dészarul`) — a különbség az,
hogy azt valaki eldöntötte.

**A kimenet sosem lehet azonos a bemenettel.** Ez a `rules.py` szerződése, és
az egész átírás értelme. `Bruno Mora → Móra` határeset: magyar név lett
belőle, de a betűk ugyanazok.

---

## 4. Hol tart most az adatbázis — mérve

3646 névből **656 kézi** (`manual.py`), 240-et te javítottál (ebből 38 a
kézi rétegben is benne van). Marad **2788 tisztán gépi név**, amihez senki
nem nyúlt. Bennük:

| gyengeség | darab | mit jelent |
|---|---|---|
| **csak ékezetet kapott** (R8) | **1127** | a fonetika nem csinált semmit |
| **kalapból húzott keresztnév** (R3) | **1526** | nincs `GIVEN`-térképezés |
| **4+ mássalhangzó** (R7) | **95** | magyarul kimondhatatlan |
| **rossz elem a vezetéknév** (R4) | **26** | kötőjeles / kelet-ázsiai |
| **kisbetűvel kezdődik** | **2** | törött kimenet (`kún Zsombor`, `csan Tas`) |
| **feloldatlan kettőzés** (R5) | **30** | 38 mononimnak van teljes nevű párja, 8 rendezve |

---

## 5. Hogyan dolgozz

**Hol.** A javítás helye a `tools/nevek/manual.py` — ott egy sor felülír
mindent. A `rules.py`-t csak akkor bántsd, ha egy **egész nyelv** kiejtése
rossz (az több száz nevet mozdít egyszerre).

```python
"Radja Nainggolan":  ("Nájngolán Dezső", "Nájngolán"),
#  kanonikus          teljes magyar alak   rövid alak (= az ELSŐ szó)
```

**Utána.** `python3 tools/nevek/build.py` — ez **közvetlenül átírja az
`index.html` HU_NAME_TABLE-jét** (nem csak a `table.json`-t, ahogy a szkript
fejléce állítja). Majd `./tools/check.sh`. A rövid alak KI VAN ÍRVA, mert a
sorrend vegyes lehet (magyaros: `Máldi Pál` → `Máldi`; nyugatos: `Vén Rúni`
→ `Rúni`).

> ### ⚠️ A LEGFONTOSABB: a kézi javítás CSAK a `manual.py`-ban él túl
>
> A `bf84bde` commit **kizárólag az `index.html`-t** módosította — a
> `manual.py`-t nem. A generátor tehát nem tud a 240 javításodról, és
> **a `build.py` egyetlen futása mindet visszaírja a gépi alakra.**
>
> Mérve: `manual.py` visszaállítása után egy `build.py` futás
> `Aaron Lennon`-t „Lenyó Áron"-ról visszavitte „Lénnon Áron"-ra, és vele
> együtt a többi 239-et is.
>
> A 240 javítás tehát **ma védtelen**. Az első teendő nem új nevek írása,
> hanem a meglévők átemelése a `manual.py`-ba — a kész blokk a minta-lap
> elején van.

**Egy futás sok mindent mozdít.** A `build.py` a teljes táblát újragyártja,
és az ütköző rövid alakokat is újraszámolja — egy tízsoros `manual.py`
kiegészítés is több száz soros diffet adhat az `index.html`-ben. Ez nem
hiba, de a diffet emiatt nem érdemes soronként átnézni: a `manual.py`
változása az igazi tartalom.

**Milyen sorrendben.** A leggyorsabb megtérülés:

1. a **törött** kimenetek (2 db) és a **kötőjeles/kelet-ázsiai** hibák (26),
2. a **feloldatlan kettőzések** (30) — ezek *ellentmondásokat* is
   megszüntetnek,
3. a **4+ mássalhangzós** nevek (95),
4. a **legmagasabb Ratingű** „csak-ékezetes" nevek — azokat látja a
   felhasználó a legtöbbször.

**Mennyit.** Nem kell mind a 2788. A játékos a keretében látott 30-40 nevet
olvassa sokat, plusz a mezőny csillagait. A Rating szerinti sorrend ezt
közelíti a legjobban.

---

## 6. A gépi réteg is javítható — két olcsó lépés

**A `GIVEN` térkép bővítése** a legnagyobb hatású: minden új bejegyzés
egyszerre több tucat nevet ment meg a kalaptól. Hiányzik például:
`Abdou`, `Adnan`, `Achille` (→ Akhilleusz), `Aitor`, `Arda` (→ Árpád),
`Bülent`, `Corentin`, `Dado`, `Darijo`, `Fikayo`, `Hidetoshi`, `Kaoru`,
`Mamadou`, `Mahamadou`, `Néstor` (→ Nesztor), `Torbjörn`.

**A patronim `-son` szabály** a `rules.py`-ban, nyelvenként: `pt`/`en`/`sc`/`nl`.

> **✅ 3.9.09 — MINDKETTŐ BE VAN ÉPÍTVE.** Ez a szakasz innentől előzmény, nem
> tennivaló: a `GIVEN` 616 bejegyzésre bővült, a `son_stem`/`son_suffix` pedig
> a `rules.py`-ban áll. A két szabály együtt **791 gépi nevet** javított meg.
>
> **HELYESBÍTÉS.** Ez a pont eredetileg azt írta a `-son` szabályra, hogy
> *„egy sor, több száz név"*. **Ez becslés volt, és téves:** kimérve **67
> név**. A súly a `GIVEN`-bővítésen van (724 név), nem a `-son`-on.
>
> **ÉS A VÉGZŐDÉS NEM `-fia` LETT.** *„a -fia javítások jók lennének, de
> mégsem"* — a `-fia` leírás, nem név. Helyette a két valódi magyar
> vezetéknév-végződés: **`-fi`** (Győrfi, Pálfi) 48%, **`-ffy`** (Pálffy,
> Bánffy) 36%, és ritkán `-fia` 16%.
>
> A pontos mérés: `docs/nevek-generator-minta.md`.

---

## 7. A két minta

**`docs/nevek-danisitasa-minta.md`** — száz konkrét KÉZI javaslat, ezzel a
módszerrel, olyan nevekre, amikhez nem nyúltál. *(3.9.07 óta beépítve.)*

**`docs/nevek-generator-minta.md`** — a két GENERÁTOR-szabály jegyzőkönyve:
mit javított a 2696 gépi névből (791-et, 29%). *(3.9.09 óta beépítve.)*
