# CSAPATÉPÍTÉSI STÍLUSOK — tervezet

**Állapot:** ✅ **Megvalósítva — mind a három fázis kész** (v3.0.05)

> Ez a dokumentum eredetileg TERVNEK készült, és a megvalósítás nagyrészt
> követte. Ahol a kód eltér tőle, azt a 3.1 szakasz sorolja fel — a terv
> szövegét szándékosan nem írtuk át utólag, hogy a döntések nyoma megmaradjon.

Ez a dokumentum a 3.0 nagy rendszerének, a **csapatépítési stílusnak** a
kidolgozott terve. A mérföldkő-rendszer (✅ kész) és a stílus-rendszer (📐 terv)
együtt alkotják a 3.0-t; a mérföldkövek már ma is termelik azt a valutát —
a **csapatstílus-pontot** —, amiből ez a rendszer majd költeni fog.

| Rész | Tartalom | Állapot |
|---|---|---|
| Általános mérföldkövek | 96 karrier-cél, pénz- és stíluspont-jutalommal | ✅ kész |
| Csapatstílus-pont mint valuta | gyűjtés, mérleg, mentés | ✅ kész |
| Stílusválasztás az 1. szezon után | F1 | ✅ kész (v3.0.03) |
| Saját HUB menüpont | F1 | ✅ kész (v3.0.03) |
| Stílus-specifikus mérföldkövek | F2 — 78 db | ✅ kész (v3.0.04) |
| Trait-bolt és a hatások bekötése | F3 — 36 trait | ✅ kész (v3.0.05) |

---

## 0. A rendszer egymondatos lényege

Az **első szezon lezárása után** a klub egyszer választ egy **csapatépítési
stílust** — egy futballfilozófiát —, és onnantól a karrier egy második,
párhuzamos pályán is halad: a stílushoz tartozó **saját mérföldkövein**, amiket
teljesítve **stíluspontokat** kap, amiket **stílus-specifikus traitekre** költ.

A stílus **nem osztálynak**, hanem **iránynak** készül. Nem tiltja meg, hogy
mást csinálj — csak azt jutalmazza, amit vállaltál. Egy Beton védelem-klub
lőhet hat gólt egy meccsen, csak épp abból nem lesz mérföldköve.

---

## 1. Miért kell ez, és mit old meg

A karrier jelenlegi íve **egyirányú**: mindenki ugyanazt a görbét futja be —
erősebb keret, magasabb mezőny, jobb taktika, Infinity. A döntéseid *mennyiségi*
döntések (kit veszek meg, mikor), nem *minőségiek* (milyen csapatot akarok).
Két 100-as csapat között ma nincs érdemi jellembeli különbség.

A stílus ezt a hiányt tölti be. Attól kezdve, hogy választottál:

- **más mérföldköveid vannak** — a Bombázók klubja gólokat gyűjt, a Beton
  védelem tiszta lapokat, a Sztárom a párom egyetlen ember körüli világot épít;
- **más traiteket vehetsz** — a stíluspontod csak a saját stílusod boltjában
  költhető el;
- **más lesz a keretépítés logikája** — mert a traitek azt a keretet
  jutalmazzák, amit a stílus feltételez.

---

## 2. A választás mechanikája

### 2.1 Mikor

**Az első szezon lezárása után**, a szezonjelentés részeként, egyszer.
Miért nem a draftnál? Mert a draft előtt még nem tudod, milyen kereted lett.
Egy szezon leforgatása után viszont már látod, kik a te embereid — a
stílusválasztás így **felismerés**, nem vakon fogadás.

**A szezonjelentés gombja viszi oda (v3.1.25).** A jelentés alatti továbblépő
gomb felirata ilyenkor nem „Irány a pályára →", hanem **„🎯 Mehet a
csapatstílus választás!"**, és a Csapatstílus almenüt nyitja ki teljes
menü-módban — nem a következő idény kihívásait. A HUB többi doboza (és vele a
továbblépő gomb) ilyenkor eltűnik, tehát a döntést nem lehet véletlenül
átugrani. Amint megvan a filozófia, ugyanaz a gomb visszakapja a szokásos
szerepét a szokásos helyén: „Irány a pályára →" → szezon eleji kihívások →
kezdőrúgás.

**A nyitás időzítése.** A „legalább egy lezárt szezon" feltétel a
`seasonClosed` jelzőből dolgozik (a 30. forduló lezárásakor áll be), nem a
szezonszámból: az csak a következő idény indításakor lép, vagyis a verdikt és
a szezonjelentés közti teljes szakaszban még nem engedte volna a választást —
pont ott, ahol a döntés helye van.

### 2.2 Megváltoztatható-e

**Alapszabály: nem.** A stílus a klub identitása, és a mérföldköveinek java
több szezonon átívelő építkezés — egy szabadon váltogatható stílusból „vedd
fel azt, amelyik épp majdnem teljesült" optimalizálás lenne.

**Kivétel, megfontolásra:** egy **egyszeri, drága stílusváltás** (kb. 300
Mrd Ft + az addig meg nem költött stíluspontok elvesztése), hogy egy elrontott
korai döntés ne tegye tönkre a húszszezonos karriert. A megszerzett traitek
elvesznek, a teljesített mérföldkövek megmaradnak a történetben.

### 2.3 Hol él

**Saját HUB-menüpont, a Menüvel EGYENRANGÚ szinten** — nem a Menün belül.
A HUB-ban ma három sáv van (`hubMenuBtn`, `hubInfoBtn`, plus a fej), ide jön a
negyedik: `hubStyleBtn`. Ez tudatos: a stílus nem egy művelet a sok közül,
hanem a karrier második tengelye, és a helyének ezt kell mondania.

A stílus-mérföldkövek **elkülönülnek** az általánosaktól: azok az Infó fülön
maradnak, ezek a saját menüpont alatt élnek, a trait-bolttal együtt.

---

## 3. A hat stílus

Mindegyik ugyanazon a vázon áll:

- **Cél** — egy mondatban, mit jelent ez a klub;
- **Mérföldkövek** — mit mér a rendszer (stíluspontot fizet);
- **Traitek** — mit vehetsz a pontokért, három szinten (I / II / III), az egyre
  drágább és egyre erősebb sorrendben;
- **Illeszkedés** — melyik felállás és taktika a természetes otthona.

A traitek szándékosan **a meglévő motorokba kötnek be** (skill-pörgetés,
attribútum-fejlődés, morál, sérülés, stáb, kártyák, TSI), nem mellettük futnak.
Egyetlen új meccsmotor-ág sincs a tervben.

---

### 3.1 🧱 BETON VÉDELEM

> *„Aki nem kap gólt, az nem veszít."*

**Cél:** a védelem a csapat gerince — a legmagasabb átlagú posztcsoport, a
kapus a klub legjobb embere, a kapitány és az aranylabdás is innen kerül ki.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| A hátsó négy | A védelem Rating-átlaga legyen a legmagasabb posztcsoport a keretben |
| A kapus az első | A kapusod legyen a klub legmagasabb Ratingű játékosa |
| Karszalag hátul | Védő vagy kapus legyen a csapatkapitány (egy teljes szezonon át) |
| A fal | 5 / 10 / 15 tiszta lap egy szezonban |
| Alacsony kapott gól | Kapj 20 / 15 / 10 gólnál kevesebbet egy bajnoki idényben |
| Védő-skillek | 3 / 6 / 10 védekezés-típusú skill a keretben |
| Aranylabdás védő | Nyerje meg az Aranylabdát védő vagy kapus |
| Aranykesztyű | Kapusod nyerje meg a BL Aranykesztyűjét |
| Zsinórban | 5 meccses tisztalap-sorozat |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Edzett szemek** | +40% esély, hogy a skill-pörgetés VÉDŐ-kategóriájú képességet hoz |
| I | **Bástya-műhely** | a védekezést támogató stábtagok (Bástya, Kesztyűs mester) 1,5× tempóval gyűjtenek tapasztalatot |
| II | **Csillagozható pajzs** | megnyílik egy csillagozható védő-skill — a sorsdöntő hős-skillekhez hasonlóan ismételt teljesítménnyel ★-ot gyűjt |
| II | **Az év embere hátul** | szezononként egy védőd TSI-boostot kap |
| III | **A tizenegyedik ember** | ha a kapusod a keret legjobb Ratingű játékosa, az egész védelem +2 Rating |
| III | **Kifulladás** | a 70. perctől az ellenfél gólesélye 12%-kal csökken |

**Illeszkedés:** 5-3-2, 4-5-1, saját 6-3-1 · Park the bus, Gyors kontra

---

### 3.2 ⚽ BOMBÁZÓK

> *„Lőjetek eggyel többet, mint ők."*

**Cél:** a Beton védelem tükörképe, csatárokkal. A támadósor a klub gerince.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| Az éllovas | A támadósor Rating-átlaga legyen a legmagasabb posztcsoport |
| A gólgép | A legmagasabb Ratingű játékosod csatár legyen |
| Karszalag elöl | Csatár legyen a csapatkapitány (egy teljes szezonon át) |
| Gólzápor | 80 / 100 / 120 gól egy bajnoki idényben |
| Egyéni csúcs | Szerezzen egy csatárod 30 / 40 / 50 gólt egy szezonban |
| Csatár-skillek | 3 / 6 / 10 gólszerzés-típusú skill a keretben |
| Aranylabdás csatár | Nyerje meg az Aranylabdát csatár |
| Aranycipő | Csatárod nyerje meg a BL Aranycipőjét |
| Mesterhármas-sorozat | 3 mesterhármas egy idényben |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Befejezés-iskola** | +40% esély CSATÁR-kategóriájú skillre a pörgetésben |
| I | **Gólvágó-műhely** | a Gólvágó-mentor stábtag 1,5× tempóval fejlődik |
| II | **Csillagozható ösztön** | megnyílik egy csillagozható befejező-skill |
| II | **A hajrá embere** | a 75. perctől a csapat gólesélye 12%-kal nő |
| III | **Kettős veszély** | ha két 90+ Ratingű csatár van a kezdőben, mindkettő +2 Gólszerzés |
| III | **Nincs kegyelem** | kétgólos vezetésnél a csapat gólesélye nem esik vissza (ma visszafog) |

**Illeszkedés:** 4-2-4, 3-4-3, saját 3-2-5 · Hosszú labdák, Széljáték

---

### 3.3 ☯️ BÉKE ÉS HARMÓNIA

> *„A csapat több, mint tizenegy ember."*

**Cél:** kiegyensúlyozottság minden téren — morál, kémia, skillek, ratingek.
Nincs kiemelkedő ember, és nincs gyenge láncszem sem.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| Egy szinten | A kezdő 11 legjobb és leggyengébb embere közti Rating-különbség legyen 8 / 5 / 3 alatt |
| Összeszokott | 6 / 10 / 15 kész párkémia egyszerre |
| Nyugodt öltöző | A csapatmorál egy egész szezonon át ne essen 60 alá |
| Mindenki tud valamit | A kezdő 11 minden tagjának legyen legalább egy kiépített skillje |
| Négy tengely | Mind a négy csapat-attribútum (Védekezés, Passz, Gólszerzés, Védés) legyen 85 fölött |
| Egyenletes teher | Legyen 14 játékosod 15+ lejátszott meccsel egy idényben |
| A rendszer működik | Érd el a 90%-os taktika-illeszkedést Labdatartással vagy Totális futballal |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Csapatkovács-műhely** | a kémia-építés 1,5× tempóval halad |
| I | **Egyenletes edzés** | az edzésterv „nem edzett" attribútumainak lassulása feleződik |
| II | **Öltözői béke** | a negatív öltözői események esélye −40% |
| II | **Mindenki számít** | minden KÉSZ párkémia +0,3 Ratinget ad a pár mindkét tagjának |
| III | **A gépezet** | ha a kezdő 11 Rating-szórása 3 alatt van, az egész csapat +3 Rating |
| III | **Nincs gyenge láncszem** | a legalacsonyabb Ratingű kezdőd a csapatátlag 90%-ára húzódik fel a meccs idejére |

**Illeszkedés:** 4-4-2, 4-3-3, 4-2-4 · Labdatartás, Totális futball

---

### 3.4 ⭐ SZTÁROM A PÁROM

> *„A világ egy ember körül forog — és ez nem baj."*

**Cél:** egy vagy két kiemelkedő sztár, akiket az egész csapat kiszolgál.
A mérföldkövek azt jutalmazzák, ha valakiből tényleg **legendát** építesz.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| A kiválasztott | Jelölj ki egy sztárt — innentől rá szólnak a mérföldkövek |
| Kiemelkedik | A sztárod legyen 8 / 12 / 15 Ratinggel a csapatátlag fölött |
| A plafon fölött | A sztárod érje el a 95 / 99 / 105 Ratinget |
| Skill-gyűjtő | A sztárodnak legyen 3 / 5 / 8 kiépített skillje |
| A díjak embere | A sztárod nyerjen 2 / 4 / 6 egyéni díjat |
| Aranylabda | A sztárod nyerje meg az Aranylabdát |
| GODLIKE | A sztárod érje el a legmagasabb szezonkártya-szintet |
| Hűség | A sztárod játsszon 150 / 250 meccset a klubnál |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Testőrség** | a sztár sérülés-esélye feleződik |
| I | **A bíró is ember** | a sztár piroslap-esélye feleződik |
| II | **Kiszolgálás** | a sztár gólpassz-esélye +25%, ha a kezdőben van 2 kész kémia-kapcsolata |
| II | **Reflektorfény** | a sztár egyéni díjai kétszeres Rating-bónuszt adnak |
| III | **A rendszer ő** | a sztár Ratingje beleszámít a taktika-illeszkedésbe kétszeres súllyal |
| III | **Nélküle nem megy** | ha a sztár pályán van, az egész csapat +2 Rating; ha nincs, −2 |

**Illeszkedés:** 4-2-3-1, 4-5-1 (árnyékékkel) · bármelyik — a sztár a rendszer

⚠️ **Egyensúly-jegyzet:** ez a stílus tudatosan kockázatos. A III. szintű
„Nélküle nem megy" büntetése épp akkora, mint a jutalma — egy sérülés vagy egy
eltiltás azonnal megfizetteti a filozófia árát. E nélkül a szimmetria nélkül a
stílus dominánsan a legjobb választás lenne.

---

### 3.5 ⚡ HOL JÖN A MENNYDÖRGÉS?

> *„Amit nem érnek utol, azt nem tudják megvédeni."*

**Cél:** a lehető leggyorsabb csapat. Ez az egyetlen stílus, ami a **sebesség**
tengelyt teszi meg fő mércének.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| Villámkezdés | A kezdő 11 Sebesség-átlaga érje el a 85 / 90 / 95 értéket |
| A leggyorsabb ember | Legyen egy 99-es Sebességű játékosod |
| Hangsebesség | Dönts meg egy 36 / 38 / 40 km/h-s klubrekordot |
| Négy szélső | Álljon egyszerre 4 szélső a kezdő 11-ben |
| Kontra-mesterség | Érd el a 90%-os illeszkedést Széljátékkal vagy Gyors kontrával |
| Villámgólok | Szerezz 10 gólt az első 10 percben egy idényben |
| Sebesség-skillek | 3 / 6 sprint-típusú skill a keretben |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Korai plafon-nyitás** | a 99-es sebesség-plafon már Infinity ELŐTT megnyílik (a 0,25× tempó ugyanúgy érvényes) |
| I | **Sprintmester-műhely** | a Sprintmester stábtag 1,5× tempóval fejlődik |
| II | **Gyorsabb izomzat** | a sebesség edzés-osztója 1,5 helyett 1,2 (99 alatt) |
| II | **Szélesebb passzív út** | a passzív sebesség-plafon a születési érték +15%-a helyett +25% |
| II | **Olcsó totális futball** | a 4-2-4 felállás fele áráért megvehető (75 → 37,5 Mrd) |
| III | **Villámkontra** | a Gyors kontra és a Széljáték illeszkedés-bónusza kétszeres |
| III | **Utolérhetetlen** | ha a kezdő 11 Sebesség-átlaga 10-zel meghaladja az ellenfelét, +3 Rating |

**Illeszkedés:** 3-4-3, 4-2-4, saját 3-2-5 · Széljáték, Gyors kontra

---

### 3.6 🛡️ PANZERKAMPFWAGEN

> *„Nem szeretnek minket. Nem is kell."*

**Cél:** kőkemény, összezáró csapat. Sok temperamentumos, lobbanékony,
bajkeverő játékos, akik egymásért harcolnak, és a haragjukat az ellenfélen
vezetik le. A csapatmorál nem hullámzik — mindig ott áll, ahol kell.

**Mérföldkövek**

| Mérföldkő | Mérce |
|---|---|
| A banda | Legyen 4 / 6 / 8 magas temperamentumú (aggroI) játékos a keretben |
| Kemény kéz | Kapj 8 / 12 sárga vagy piros lapot egy idényben — és nyerd meg a bajnokságot ugyanabban |
| Nem törünk meg | A csapatmorál egy egész szezonon át ne essen 70 alá |
| Lövőerő | Dönts meg egy 110 / 120 km/h-s lövéserő-rekordot |
| Bosszú | Nyerj meg egy rangadót piros lap után, emberhátrányban |
| Összezárás | Nyerj meg 3 meccset úgy, hogy sérült emberetek volt |
| Keménység-skillek | 3 / 6 belépős vagy lövőerős skill a keretben |

**Traitek**

| Szint | Trait | Hatás |
|---|---|---|
| I | **Vasfegyelem** | a csapatmorál sosem esik 70 alá |
| I | **Kemény belépők** | +40% esély belépős / lövőerős skillre a pörgetésben |
| II | **Piros után dühösebben** | piros lap után a csapat +5 morál és +2 Rating a meccs végéig |
| II | **A sérült bajtárs** | amíg valaki sérült, a többiek +2 Ratinget kapnak |
| III | **Falka** | minden magas temperamentumú kezdő +0,5 Ratinget ad az egész csapatnak |
| III | **Nem adjuk meg magunkat** | kétgólos hátrányban a csapat gólesélye 25%-kal nő |

**Illeszkedés:** 4-4-2, 5-3-2, saját 6-2-2 · Park the bus, Hosszú labdák

⚠️ **Egyensúly-jegyzet:** a „Vasfegyelem" a morál-rendszer teljes
kikapcsolása lenne — a stílus ára ezért az, hogy a magas temperamentumú
játékosok **több piros lapot és több öltözői konfliktust** hoznak. A trait nem
szünteti meg a bajt, csak a következményét tompítja.

---

## 4. Közös mechanika

### 4.1 A stíluspont

**Már ma is gyűlik** — a mérföldkő-rendszer stíluspont-jutalmai (`S.ms.sp`) ezt
a valutát termelik. Az általános mérföldkövekből összesen **490 pont**
szerezhető meg, hat kategóriára osztva.

**De nem ingyen.** A stíluspontos mérföldkövek **kategóriánként zárva
indulnak**, és pénzért kell megnyitni őket (`MS_STYLE_CATS`). Amíg egy
kategória zárva van, a benne lévő mérföldkövek **nem gyűlnek**. Ez az
ellensúly a rendszerben: a pénzjutalmas mérföldkövek nem tiszta nyereséget
adnak, hanem **befektethető tőkét** — vagy a klubra költöd, vagy a
csapatstílus-fejlődésre.

**A zárás alatti idő (3.1.02-től).** Ami a zárás alatt teljesült, az többé nem
vész el. A megnyitáskor **beragad** (`S.ms.pend`): a jutalom ott áll, és
kifizetésre vár. Kiengedni nem idővel, hanem **munkával** lehet:

- **Ugyanazon a sávon egy új fokozat.** Egy lépcsős mérföldkő-családnál (pl.
  „Vagyon", kilenc küszöbbel) az számít, sikerül-e a megnyitás UTÁN egy új
  fokozatot elérni. Amint sikerül, az új fokozat **és alatta minden beragadt
  fokozat** jutalma egyszerre folyik be (`msReleaseAfter`).
- **Kimaxolt sáv.** Ahol a megnyitáskor már nincs mit elérni (rég teljesült
  önálló mérföldkő, vagy egy család mind a kilenc fokozatával), ott új fokozat
  sosem lesz — az ilyen sávot a kategória **bármely másik** teljesítése
  kiengedi, teljes értéken.
- **Az egyetlen veszteség.** Ha a megnyitás pillanatában a kategórián belül
  **minden** sáv kimaxolt, semmi nem tudná kiengedni a jutalmat. Ilyenkor a
  megnyitás azonnal fizet, de sávonként csak a **legmagasabb fokozatért**; a
  többi fokozat pont nélkül zárul (`msSweepDead`, `S.ms.missed`).

A 3.1.02 előtti mentések „lemaradt" bejegyzései a betöltéskor átkerülnek a
beragadt állapotba (`msMigrateMissed`), és ahol a történetből látszik, hogy a
feltétel azóta teljesült, ott azonnal ki is fizetődnek.

Az árazás a jutalmakkal azonos idiómát követi (a mindenkori éves büdzsé
százaléka), **szorozva az edzői fizetéssel** (`msCatSalaryMult` =
`1 + S.salaryMod`, padlózva 0,5-nél). A fizetésemelés tehát kétszer számít: a
büdzsében is, meg a program árában is — ez a fenti engedmény (a beragadt
jutalom kiengedhető) ellensúlya. Az alábbi szorzók a fizetésemelés nélküli
alapesetre vonatkoznak:

| Kategória | Ár | Mérföldkő | Stíluspont |
|---|---|---|---|
| Vagyon | 0,5× éves keret | 6 | 52 |
| Transzferpiac | 0,7× | 12 | 69 |
| Utánpótlás és stáb | 0,7× | 7 | 54 |
| Trófeák | 1,0× | 16 | 235 |
| Bajnoki fölény | 0,9× | 5 | 50 |
| A nagy ugrás | 1,2× | 2 | 30 |
| **összesen** | **5,0×** | **48** | **490** |

A **Trófeák** kategória a 3.1.09-ben nőtt meg (74 → 235): oda került a bajnoki
cím és a BL-győzelem NEHÉZSÉGI LÉPCSŐJE. A mérce a mezőnyszint mínusz a nyers
csapaterőd (`teamOVRbase`), öt fokozattal: −2 · 0 · +2 · +5 · +10. Ugyanaz a
trófea így nagyon mást ér attól függően, milyen mezőnyben szerezted meg — és a
BL végig magasabban fizet, mint a bajnokság.

Mérve: a pénzjutalmas mérföldkövek összesen **9,22× éves keretet** hoznak be,
tehát mind a hat kategória megnyitása a mérföldkő-kereset **54%-át** viszi el.
Meghatározó tétel, de nem kizárólagos: marad pénz a klubra is.

Javasolt trait-árazás: **I. szint 8-12 pont · II. szint 20-30 · III. szint
50-70**. Így egy karrier alatt a hat traitből reálisan **három-négy** szerezhető
meg — a stíluson belül is döntést kell hozni, nem lehet mindent kimaxolni.

### 4.1b A stíluspont mérlege (3.1.03)

A stílus SAJÁT mérföldkövei (`STYLE_MILESTONES`) a második, jóval bővebb
forrás. A 3.1.03-ig stílusonként 119-172 pontot adtak — a kiadás ezt
**628-697**-re emelte, mert a KIADÁSI oldal ennél nagyságrenddel nagyobb:

| Tétel | Pont |
|---|---|
| Általános mérföldkövek (kategóriák megnyitása után) | 490 |
| A választott stílus saját mérföldkövei | 628-697 |
| **bevétel egy karrier alatt** | **~1120-1190** |
| Egy stílus TELJES trait-fája (7 trait × 3 szint) | 1007 |
| Csillagozási jogok (képességenként 25-60 pont) | ezen felül |

Vagyis a teljes bevételből épphogy kijönne a trait-fa — ha a csillagozásra
egyetlen pontot sem költenél. A döntés így valódi marad.

**A fenti számok az ALAP tempóra érvényesek.** A 3.1.11-től a csapatstílus-pont
is a globális fejlődési tempó alatt van (`msSpReward`): Komótoson ×0,90,
Csigán ×0,75, Gleccseren ×0,60 — a kiírt szám mindenhol a tényleges. A
pénzjutalom eddig is követte a tempót, csak közvetve, a szezonos büdzsén
keresztül. Így a lassított karrier a stílus-fát is arányosan lassabban építi;
a trait-árak nem változnak, tehát a vállalás valódi.

A hat stílus lépcsői ugyanazt a négy értékgörbét használják (`ST_L9`, `ST_L6`,
`ST_L3`, `ST_CARD`, `ST_PEAK`), hogy a lépték stílusfüggetlen legyen: egy
karrier-hosszú számláló 102 pont, egy mérés-lépcső 43, egy idényen belüli
bravúr 35, a szezonkártya-lépcső (Gyilkos → Vadista szandál → GODLIKE) 64, a
csúcs-lépcső pedig 265 — az utóbbi tetején a fokozatok már-már elérhetetlenek,
és onnantól minden új rekord ugyanazt a teljes (32 pontos) jutalmat fizeti.
Az Aranylabda és a GODLIKE-kártya egyaránt **32 pont**: a karrier két egyéni
csúcsa azonos súlyú.

### 4.2 Mit NEM csinál a rendszer

- **Nem tilt.** Egyetlen stílus sem zár ki felállást, taktikát vagy igazolást.
- **Nem büntet azért, amit nem csinálsz.** Aki Beton védelmet választ és mégis
  támad, nem kap malust — csak nem kap stíluspontot sem.
- **Nem ad új meccsmotort.** Minden trait a meglévő rendszerekbe köt be.
- **Nem kötelező.** A stílusválasztás kihagyható; a karrier a mai ívén fut
  tovább, és az általános mérföldkövek stíluspontjai megmaradnak arra az
  esetre, ha később mégis választanál.

### 4.3 Adatmodell (javaslat)

```js
S.style = {
  key: "beton",            // a választott stílus
  chosenSeason: 2,         // mikor választottad
  traits: {                // megvett traitek
    edzettSzemek: true
  },
  ms: { done:{}, seen:{}, t:{} },   // a stílus SAJÁT mérföldkövei
  star: "Kovács Bence"     // csak a "Sztárom a párom" stílusnál
};
```

A stílus-mérföldkövek a meglévő `MILESTONES` táblával **azonos szerkezetűek**
(`id / grp / t / d / kind / val / p / n`), csak külön tömbben élnek, és a
kiértékelőjük ugyanaz a `msScan`-minta: állapotból mérünk, ahol lehet, és csak
ott tartunk nyomkövetőt, ahol az esemény utólag visszakereshetetlen.

### 3.1 Eltérések a tervtől (a megvalósításban)

A fenti stílus-leírások a TERVET tükrözik. A kód néhány ponton eltér, mindig
ugyanazért: olyan mércét kerestünk, ami a MEGLÉVŐ motorokból olvasható, és nem
igényel új szimulációs ágat.

* **A mérföldkövek száma stílusonként 11–15**, nem pontosan a tervezett lista.
  Ahol egy tervezett mérce nem volt megbízhatóan mérhető (pl. „gólok az első 10
  percben"), ott helyette olyan került be, ami a motorból tisztán kiolvasható.
* **Minden képességnek HÁROM SZINTJE van** (a terv egylépcsős traiteket írt le).
  A szintek egyre drágábbak és egyre erősebbek; az ársávot a képesség „rangja"
  adja: I. sáv 14/24/38 · II. sáv 26/45/70 · III. sáv 40/68/108 pont. Egy
  stílus teljes fája **1007 pont** (a Béke és harmónia a négy
  egyensúly-képességgel 1975, a Panzerkampfwagen a Megfélemlítéssel 1223), ami
  tudatosan több, mint amennyi egy
  karrierbe belefér — a stíluson belül is dönteni kell, nem lehet kimaxolni.
  A felület minden képességnél kiírja, mit ad MOST és mit adna a KÖVETKEZŐ
  szint, hogy a vásárlás ne találgatás legyen.
* **A traitek hatása 12 csatornán fut** (csapaterő, támadó és védekező gólráta,
  piroslap-, sérülés-esély, morál-padló, edzői tapasztalat, skill-sorsolás,
  kémia-tempó, sebesség-plafon és edzés-osztó, passzív sebesség-plafon, bolti
  ár). Minden trait ezekbe köt be — egyetlen új meccsmotor-ág sincs.
* **A CSILLAGOZÁS JOGA képességenként vásárolható** (3.0.09). Alapból egyetlen
  képesség sem csillagozható; a jogot csapatstílus-pontból kell megnyitni
  (25-60 pont, a képesség erejéhez igazodva), és a megnyitás a KÉPESSÉGRE szól,
  nem a játékosra. Ehhez mind a hat stílus kapott egy hetedik képességet, ami a
  SAJÁT területén olcsóbbá teszi a feloldást: a fókuszált stílusok 15/25/33%-ot
  egy szűk körre, a Béke és harmónia 10/17/22%-ot MINDENRE (szélesség mélység
  helyett), a Sztárom a párom pedig a kijelölt sztár posztkategóriájára — az a
  kedvezmény menet közben követi, kire építetted a klubot.
* **Egy csillag maga is 2-4 fázisból épül fel** (3.1.04). A jog megnyitása után
  a csillag nem egy kattintás: ugyanúgy `rollStagesNeeded()` dönti el, hány
  fázisból áll, mint a képességnél — és a szám akkor sorsolódik ki, **amikor
  elindítod**, nem előbb. Az állapot az instance-en él (`starNeed` / `starDone`),
  a mentés része, és a félkész csillag semmit nem ér, amíg össze nem áll
  (`skillPower` csak a KÉSZ csillagokkal szoroz). Egy megkezdett csillag
  ugyanúgy „félbehagyott munka", mint egy félkész képesség, ezért mindig ott a
  jutalom-sor jelöltjei között — a `SKILL_STAR_OFFER` ritkítás csak ÚJ csillag
  elkezdésére vonatkozik.
* **A „csillagozható" traitek kimaradtak a trait-listából** — de az akadály
  azóta elhárult. Az F3 idején a csillag-rendszer még kizárólag a két
  sorsdöntő hős-skillé volt, ezért egy „csillagozható védő-skill" trait önálló
  skill-ágat igényelt volna. A **3.0.06 óta a csillagozás általános**: minden
  kiépült képesség csillagozható, és a stílus-traiteknek van rá kész
  csatornájuk (`starOffer`, a csillag-felajánlás esélyét emeli). Egy ilyen
  trait felvétele mostantól egyetlen sor. A jelenlegi hat trait stílusonként
  változatlan — a bővítés külön döntés.
* **A „Sztárom a párom" III. traitje a tervezett szimmetriával került be:** ha a
  sztár a kezdőben van, +3 csapaterő; ha nincs, −3. Ez az egyetlen trait a
  játékban, ami büntetni is tud — tudatosan, mert e nélkül a stílus dominánsan
  a legjobb választás lenne.
* **A Panzerkampfwagen „Vasfegyelme" nem kapcsolja ki a morál-rendszert**, csak
  padlót tesz alá (60, a II. szinttel 70). A romlás megtörténik, csak nem tud
  mélyre vinni.
* **A Béke és harmónia négy EGYENSÚLY-KÉPESSÉGET kapott (3.1.26).** A stílus
  mérőszáma a CSAPATEGYENSÚLY, a képességei mégis alig nyúltak hozzá: a
  filozófia mérte magát, de nem fizette meg — a Sztárom a párom fájához képest
  érezhetően gyengébb volt. Mind a négy a MEGLÉVŐ egyensúly-motorba köt be
  (`teamBalance`, `balanceSkillQuota`), új szimulációs ág nélkül:

  | Szint | Képesség | Hatás (I / II / III) |
  |---|---|---|
  | II | **Természetes összhang** | a mérő feltételei 15% / 25% / 30%-kal könnyítve: a teljes ponthoz kevesebb effektív gól/gólpassz-adó (7,5 → 6,5 / 5,9 / 5,6) és kevesebb skill-birtokos (6,25 → 5,5 / 4,9 / 4,7) is elég, a kezdő 11 szórás-tűrése pedig 0,18-ról 0,21 / 0,24 / 0,26-ra tágul |
  | III | **Egymástól tanulnak** | a csapategyensúlyból járó ingyen képességek szezonos kvótája +1 / +2 / +3. A kapu marad: ha az alap nem jár (65 alatti összegyensúly), ez sem nyit kaput |
  | III | **Nincs plafon** | a mérő 100-as plafonja 125 / 150 / 200-ra tolódik: a részpontok a cél FÖLÖTT is számítanak tovább, és velük nő a csapaterő-bónusz (max +2 → +2,5 / +3 / +4) és a kvóta sávtáblája is (100 fölött minden további 20 pont +1 képesség) |
  | III | **Add tovább!** | az ELADOTT vagy a STÁBBA felvett játékosod továbbadja a képességeit — skillenként külön sorsolás 20% / 30% / 50%-kal, a címzettet te választod ki |

  Két megvalósítási döntés érdemel külön szót:

  * **A rating-rész fejtere a KERETBŐL jön.** A kezdő 11-nél a nulla szórás a
    matematikai határ — ott a 100% fölé nincs hova menni. A 100 fölötti sávban
    ezért a TELJES keret egyenletessége viszi tovább a rating-részt, két
    kapun át: a kezdő 11-nek előbb 80% fölé kell érnie (a kapu ott nulláról
    nyílik, tehát a mérő sehol nem ugrik meg), és onnan a keret szórása
    szabja meg, mennyi jár. A kitolt plafon így nem ajándék, hanem cél.
  * **Az örökség a MEGLÉVŐ jutalom-soron megy** (`S.pendingRewardSkills`),
    ezért a mentés része, és ugyanaz a választó-képernyő osztja ki, mint a
    kihívás-jutalmakat. A képesség azzal a KÉSZÜLTSÉGGEL érkezik meg, ahogy a
    távozónál állt (egy kész 4/4 teljes erővel, egy félkész félkészen) — a
    csillagozás viszont nem száll át, az a kiépítés jutalma. A sorsolás a két
    közös belépési ponton fut (`releasePlayer` eladáskor, `hireCoach` a stábba
    lépéskor), tehát minden út lefedve; az Iskolateremtő évekig csepegtető
    hagyatékától független, egyszeri hatás.

  A stílus fája ezzel 1007-ről **1975 pontra** nőtt — vagyis a választási
  kényszer nem csökkent, hanem nőtt: még kevesebb fér belőle egy karrierbe.

* **A mérő és az árak utánhangolása (3.1.27).** Az első játékmenet kimutatta,
  hogy a mérő két legnagyobb súlyú része alapjáraton is túl könnyen
  kimaxolódott, a két mérő-mozdító képesség pedig alulárazott volt: egyetlen
  megnyitott szint a könnyítésből és egy a plafonból 92-ről 110-re lökte a
  csapategyensúlyt, ami mérföldkő- és vele stíluspont-lavinát indított.

  * **A célszámok 25%-kal feljebb.** Effektív gól/gólpassz-adó a teljes
    ponthoz: 6 → **7,5**; effektív skill-birtokos: 5 → **6,25**. A 45%+30%
    súlyú teher- és skill-rész így nem áll be magától 100%-ra, és a
    csapategyensúly nem szűkül a rating-eloszlásra. A stílus könnyítése
    változatlan arányokkal dolgozik — csak most van min könnyíteni.
  * **A két mérő-mozdító képesség ára másfélszeres.** „Természetes összhang"
    39/68/105, „Nincs plafon" 60/102/162 pont (`STYLE_BAL_PRICE_MULT`). Nem a
    hatásukat vágtuk vissza — a filozófia LEGYEN erős —, csak megkérjük az
    árát: ezek nem egy szeletet erősítenek, hanem magát a MÉRCÉT mozdítják, és
    a csapategyensúly nemcsak csapaterőt ad, hanem ingyen képességeket és
    mérföldköveket (azaz újabb stíluspontot) is. Az ársávot nem emeltük — a
    rang a hatás jellegét mondja meg, nem az árát —, a szorzó egy új,
    képességenkénti paraméter (`stTrait(...,mult)`).
  * **A csapategyensúly mérföldkő-lépcsője a 200-as plafonhoz igazodik.** A
    régi tábla 60-nál indult és 99-nél állt meg, vagyis a kitolt mérő nehezebb
    fele jutalom nélkül maradt. Az új skála **75-nél indul és 200-ig visz**,
    tizenöt fokozattal: 75→2 · 80→3 · 85→4 · 90→6 · 95→9 · **100→12** ·
    110→15 · 120→18 · 130→21 · 140→24 · **150→28** · 160→30 · **175→32** ·
    185→38 · **200→48** stíluspont (összesen 290). A görbe a tetején
    szándékosan meredek: a 175 fölötti két fokozat egy egész karrier célja, és
    csak kitolt plafonnal, közel tökéletes teher-, skill- ÉS keret-eloszlással
    érhető el. A 100 fölötti fokozatok leírása ki is mondja, hogy a „Nincs
    plafon" nélkül elérhetetlenek.

* **A Panzerkampfwagen két személyiség-lépcsőt és a Megfélemlítést kapta
  (3.1.33).** A stílus mérföldkövei eddig EREDMÉNYT mértek (piros lap, sérült
  emberrel nyert meccs, lövéserő-rekord), a filozófia lényegét — hogy MILYEN
  EMBEREKET gyűjtesz — nem. Ez a két lépcső ezt pótolja. Kemény tulajdonságnak
  négy személyiség-fokozat számít, KÉT külön tengelyről: a társas
  tulajdonságból a **bajkeverő** (coopI 0) és az **öntörvényű** (1), a
  temperamentumból a **temperamentumos** (aggroI 3) és a **lobbanékony** (4).
  Mivel két tengelyről jönnek, egy ember kettőt is adhat — a bajkeverő
  lobbanékony a stílus őstípusa. Ugyanez a két tengely a játék MINDEN más
  rendszerében büntetés (a `captainSuitability` levonja, a piroslap-súly
  egyenesen az aggroI-ból jön); a Panzer az egyetlen filozófia, ahol érték.

  | Lépcső | Mérce | Fokozatok |
  |---|---|---|
  | **Az összes keményfiú** | hány kemény tulajdonság fordult meg a klubodnál (`stToughCareer`) | 5→2 · 10→3 · 15→5 · 20→8 · 25→10 · 30→14 · 50→22 · 100→32 pont |
  | **A kőkemény vezető** | a csapatkapitány vezetői fokozata + kemény vonásai (`stCaptainHardRank`) | Megfelelő+1→3 · Megfelelő+2→5 · Jó+1→8 · Jó+2→12 · Remek+1→16 · Remek+2→24 pont |

  Két megvalósítási döntés érdemel külön szót:

  * **A keményfiú-számláló a klub TÖRTÉNETÉT nézi, nem a pillanatnyi keretet.**
    A keret 48 főnél elfogy (`ROSTER_EXPAND_MAX`), egy ember legfeljebb kettőt
    ad — vagyis egy pillanatkép-számláló abszolút plafonja 96 lenne, és ahhoz
    MINDEN játékosnak egyszerre kellene bajkeverőnek/öntörvényűnek ÉS
    temperamentumosnak/lobbanékonynak lennie. A 100-as fokozat így halott
    tartalom volna. A számláló ezért névre menő regiszterben gyűjt
    (`S.toughSeen`): mindenki pontosan egyszer számít, az eladás nem vesz el
    belőle, a visszavásárlás nem ad hozzá újra. A felvétel öngyógyító — a
    keretet minden méréskor végigolvassuk —, ezért egyetlen érkezési utat sem
    kell külön bekötni, és a jövőbeliek is maguktól beleesnek.
  * **A kapitány-lépcső EGYETLEN monoton rangszámon áll**, nem hat külön
    feltételen: `(vezetői fokozat − 2) × 2 + kemény vonások`. Ettől a fokozatok
    átugorhatók és minden alattuk lévő magától feloldódik — aki rögtön a
    tökéletes embert találja meg (Remek vezető két kemény vonással), mind a
    hatot egyszerre kapja meg.

  **A Megfélemlítés (III. sáv, 40/68/108 pont)** a stílus első képessége, ami a
  PIROS LAPRA fizet: a kiállítástól a lefújásig az ellenfél gólesélye
  50% / 75% / 90%-kal esik (`redOppGoalMult` csatorna, a meglévő
  emberhátrány-újraszámoláson). A hatás azért lehet ekkora, mert a kapuja szűk:
  csak abban a mérkőzésben él, amelyikben tényleg kiállítottak valakit
  (alaphelyzetben ~6% meccsenként, rangadón több), és azt nem lehet előidézni.
  Az emberhátrány minden más következménye megmarad — tízen maradtok, a saját
  gólesélyetek ugyanúgy esik, a kiállított ember nem lő gólt és nem oszt
  gólpasszt. A közvetítés a kiállítás sora után külön kimondja, hogy a
  képesség dolgozik: egy némán ható szorzó használhatatlan visszajelzés.

* **A Panzerkampfwagen kockázat-köre, két lépcső és a stílusok hangja
  (3.1.36).** A filozófia eddig csak ELVISELTE a piros lapot és a sérülést; a
  3.1.33 Megfélemlítése után viszont már fizet is értük. Ez a kör most bezárul:

  | Szint | Képesség | Hatás (I / II / III) |
  |---|---|---|
  | I | **Vadhajtások** | a csapat piroslap-esélye +50% / +100% / +160%, a sérülés-esélye +30% / +60% / +100% |
  | II | **Fájhat, de játszik** | akit egy mérkőzésen kiállítottak vagy lesérült, 25% / 40% / 60% eséllyel MÉGIS pályára léphet a következő fordulóban |

  A Vadhajtások a készlet egyetlen képessége, ami tudatosan ROSSZABBÁ teszi a
  csapat helyzetét — máshol tiszta büntetés volna, itt nyersanyag: a
  `pz_redall`, a `pz_redseason` és a `pz_injwin` lépcsők ebből élnek, a
  Megfélemlítés pedig egyenesen a kiállításból. Ezért áll az I. ársávban:
  önmagában nem ad erőt, csak a fa többi ágának ad munkát. A Fájhat, de
  játszik a párja, és a dobás az INCIDENS pillanatában dől el (a meccs végi
  könyvelésben), tehát rögtön tudod, számíthatsz-e rá.

  **Új képesség a készletben: „Torghelle Sanyitól tanultam tisztán szerelni"**
  (VÉDŐ). Az első skill, ami tudatosan kockázatot vesz: −7,5% ellenfél-gólesély,
  cserébe a birtokosa jóval nagyobb eséllyel kapja a kiállítást (`discipline`
  1,9×) és nagyobb eséllyel ő sérül meg (új `injrisk` csatorna, 1,8×). Mindkét
  ár a SAJÁT fejére száll: a csapat piroslap- és sérülés-ESÉLYÉT nem emeli,
  csak azon belül tolja rá a valószínűséget — a csapatszintű emelés a
  Vadhajtások dolga.

  **Két új lépcső**, mindkettő kilenc fokozattal (1/2/3/5/10/15/20/30/50, a
  szokásos `ST_L9` görbén):

  * **Bajtársak** — kész (5/5) párkémia KÉT kemény ember között. Karrier-
    számláló (`S.buddySeen`, a páros kulcsára), nem pillanatkép: a párkémiák a
    keret méretével elfogynak, és a távozóval a kötés is törlődik
    (`pruneChemistry`) — egy pillanatkép-számláló néhány tucatnál megállna.
  * **Kőkemény belépő** — a három szerelés-képesség (Labda vót spori!,
    Sepregető, Torghelle-iskola) kommentár-pillanatait gyűjti. Ezek saját,
    sűrűbb közvetítés-csatornát kaptak (16 szövegváltozat), mert az általános
    skill-íz meccsenkénti EGY helyén ötven sor évtizedekbe telne.

  **És végre megszólal a filozófia.** A hat stílus eddig néma volt a
  közvetítésben: mértük, fizettük, képességeket adtunk hozzá, de a kommentátor
  egy szóval sem árulta el, hogy ez a csapat MÁS. Mindegyik kapott saját
  szövegeket (`STYLE_MATCH_LINES`), meccsenként egyszer, gólmentes percben —
  tisztán ízesítés, egyetlen számot sem mozdít. Ugyanígy megszólal a két
  sorsdöntő képesség is a saját pillanatában: a „Fogd meg a söröm!" a
  bravúrnál, „A győzelemnek csekély az esélye. Mire várunk még?" pedig a késői
  vagy fordító gólnál.

* **A Villám (Hol jön a mennydörgés?) megkapta a saját termését és két
  képességet (3.1.43).** A stílus eddig ÁLLAPOTOT mért — sebesség-átlag,
  klubrekordok, hány gyors embered van —, azt viszont nem, hogy a sebesség mit
  HOZOTT. Három új lépcső ezt pótolja, és két képesség fizeti meg a filozófia
  két természetes fájdalmát.

  | Lépcső | Mérce | Fokozatok |
  |---|---|---|
  | **Gólok sebességgel** | gól olyan embertől, akinek van gyorsasági képessége (`S.paceGoals`, karrier-számláló) | 10 · 20 · 30 · 50 · 100 · 200 |
  | **Sebességgólok egy meccsen** | ugyanez EGY mérkőzésen belül, csapatszinten (`msT().paceHaulMax`) | 1 … 10 |
  | **Megtanult szélső posztok** | befejezett poszt-tanulás JV / BV / JSZ / BSZ kódra (`S.wingPosLearned`) | 1 … 10 |

  A sebesség-gól jelölése a gól KÖZÖS csatornáján megy (a gólblokkban, a
  `recordScorer` mellett), ezért minden gól-ág — szabadrúgás, tizenegyes,
  csere-gól, hajrá — magától beleesik.

  | Szint | Képesség | Hatás (I / II / III) |
  |---|---|---|
  | II | **Szárnyakon kifutva** | az alakzat ára (a kiürített közép miatt megemelt ellenfél-gólesély) −30% / −55% / −80% |
  | III | **Mesterhármas-csillag** | a mesterhármas INGYEN megnyitja a gólszerző egyik kiépült képességének csillagozását, az egész keretre |

  A **Szárnyakon kifutva** a 3.1.41-ben bevezetett alakzat-árat enyhíti. Nem
  kapcsolja ki: a stílus vállalja a kockázatot, csak olcsóbban — a Villám
  lényege a szélesség, tehát épp azt ne fizettesse meg vele a játék, amiért a
  filozófiát választotta. (Maxra húzott 3-5-2-nél +29% → +6%.)

  A **Mesterhármas-csillag** a karrier legnagyobb stíluspont-nyelőjére, a
  csillagozás jogára nyit MÁSIK utat: a pályán kell kiérdemelni. A szintek
  külön mozgatják a két felét — I. szinten csak a SEBESSÉG-képes ember
  mesterhármasa nyit (és rögtön indul is az első csillag), II. szinten
  bármelyik mesterhármas nyit, III. szinten bármelyik nyit ÉS azonnal indul. A
  kiválasztásnál a sebesség-képesség mindig elsőbbséget élvez: a stílus a saját
  területét fizeti meg.

* **A Villám sorsolás-torzítása (3.1.44).** A Villám volt az egyetlen stílus,
  amelynek nem volt képessége a képesség-SORSOLÁS eltolására. A hiánynak
  szerkezeti oka volt: a többi stílus a `skillCat` csatornán szűr, vagyis
  POSZTKATEGÓRIÁRA (VEDO, KAPUS, CSATAR) — a sebesség-képességek viszont nem
  egy kategóriában ülnek, hanem szétszórva (VEDO, KOZEPPALYAS, CSATAR), a közös
  nevezőjük a HATÁS, nem a poszt. Ezért a Villám saját csatornát kapott
  (`skillPace`), ami az `isPaceSkill`-lel szűr.

  | Szint | Képesség | Hatás (I / II / III) |
  |---|---|---|
  | I | **Sebességre hangolt sorsolás** | 30% / 45% / 60% esély, hogy a húzás sebesség-alapú képességet hoz fel |

  **A taktikai sebesség-torzítással NEM adódik össze, hanem a NAGYOBB él.** A
  `paceSkillBias()` (széljáték / gyors kontra, 0,5 fölötti illeszkedésnél)
  önmagában 75%-ig visz; ha a kettő összeadódna, a jól begyakorlott
  sebesség-taktika + megvett képesség gyakorlatilag determinisztikussá tenné a
  sorsolást, és a keret minden más képességtől elzárulna. Így viszont a
  képesség pont annak ér a legtöbbet, aki NEM sebesség-taktikát játszik: a
  szélessége máshonnan jön, a fejlődése mégis a stílus felé húz.

  A hatás ÖNMAGÁT KORLÁTOZZA: a poolban ma három sebesség-képesség van, ezért
  III. szinten az első három húzás ~61-64%-ban sebességes, utána a részesedés
  magától visszaesik (5. húzás 30%, 8. húzás 5%) — a torzítás nem tudja
  újratölteni, amit már kihúzott. Alapérték (képesség nélkül) 11%.

* **Vérükben a rendszer (3.1.44).** A stílus két saját rendszere — Széljáték,
  Gyors kontra — egyszerre kap gyorsítást a MEGISMERÉSRE (a meccsenkénti
  begyakorlás) és az ILLESZKEDÉSRE.

  | Szint | Képesség | Hatás (I / II / III) |
  |---|---|---|
  | I | **Vérükben a rendszer** | a Széljáték és a Gyors kontra begyakorlása és illeszkedése +2,5% / +5% / +7,5% |

  Az illeszkedés-bónusz a `tacticFit()`-ben, a fit EGYETLEN forrásában ül, és
  nem a hívási helyeken. Ez fontos: a fit-et hat különböző rendszer olvassa
  (meccs-hatás, begyakorlás, a sebesség-sorsolás kapuja, a taktika-panel, a
  tanács-sorok) — ha csak egy részük tudna a bónuszról, a panel megint mást
  állítana, mint a motor (pontosan az a hiba, ami a 4.3-as bekezdésben már
  egyszer előjött a fit-magyarázatnál). Emiatt a panel is átállt: a kiírt
  százalék már nem újraszámolt képletből jön, hanem magából a `tacticFit`-ből,
  és a sor végén ⚡-jelöléssel ki is írja a bónuszt.

  **A két fél egymásba ér, és ez szándékos.** Az illeszkedés a `fitMult`-on át a
  begyakorlás sebességét is emeli, tehát a képesség kétszer fog: mérve (80-ról
  induló Széljáték, 30 meccs szolid győzelmekkel) egy szezon haladása +2,73 →
  +2,96, vagyis a III. szint nettó ~9%-kal gyorsabb megismerés — a nyers +7,5%
  fölött. A képesség ígérete pont ez: a két dolog EGYSZERRE mozdul.

  A fit szorzós, nem összeadós, és 100%-nál plafonos. Így a képesség annak ér a
  legtöbbet, akinek a kerete már valamennyire illik a rendszerhez — nulla
  illeszkedést nem varázsol elő.

* **A műszerfal nyitható-csukható (3.1.45).** A panel négy fő kategóriája — *A
  klub filozófiája*, *Stílus-képességek*, *Csillagozás feloldása*,
  *Stílus-mérföldkövek* — külön nyitható. Mérve: a kiépült műszerfal HTML-je
  22 441 karakterre nőtt (8-9 képesség három-három szinttel, a csillagozás-bolt
  és 76 mérföldkő), vagyis aki a mérföldköveit akarta megnézni, annak előbb
  végig kellett görgetnie az egész képességfát. Csukott állapotban ugyanez
  1 720 karakter: a menü egy képernyőre fér.

  A megoldás a már meglévő `.msGrp` csoportfejlécet használja, amit az Infópult
  mérföldkő-listája is — a menü nem beszél két nyelvet. **A zárt kategória nem
  renderelődik**, de a fejlécén ott a számláló (6/33 szint, 0/76 mérföldkő,
  hány csillagozás nyitható) és a mérföldköveknél az „új" jelvény, tehát a
  becsukás nem rejt el információt, csak részletet. A mérföldkő-kategória
  magától nyitva indul, ha van megnézetlen teljesülés.

  Az állapot NEM megy a mentésbe (felületi állapot), de a munkameneten belül
  megmarad — a panel vásárláskor és mérföldkő-teljesüléskor újrarajzol, és
  bosszantó volna, ha minden kattintás visszacsukná. A nyitás/csukás megőrzi a
  görgetést: a megnyomott fejléc a képernyőn a helyén marad.

* **Szezon-szerepek — Bombázók, Beton és Villám (3.2.00 / 3.3.39).** Három
  filozófia kap egy döntést, amit a többi nem: **minden idényben három embert
  jelöl ki három feladatra**. A szerep nem képesség és nem poszt — csak a mérkőzés egy
  adott SZAKASZÁBAN él, ettől lesz taktikai döntés, nem puszta számnövelés.

  | Stílus | Szerep | Mikor él | Mit csinál |
  |---|---|---|---|
  | ⚽ | **Nyitó** | amíg 0:0 | gólsúly ×1,25 → ×3,7 |
  | ⚽ | **Befejező** | 60. perctől, 1-2 gólos vezetésnél | gólsúly ×1,25 → ×3,7 |
  | ⚽ | **Tálaló** | végig | gólpassz-súly ×1,2 → ×3,6, és külön ×1,15 → ×2,0, ha épp a Nyitónak vagy a Befejezőnek tálal |
  | 🧱 | **Fal** | 75. perctől, amíg pályán van | ellenfél-gólesély −2,5% → −10% |
  | 🧱 | **Árok** | az első 25 percben, amíg az ellenfél még nem szerzett gólt | ellenfél-gólesély −3% → −11% |
  | 🧱 | **Kereszttűz** | 35-60. perc, amíg pályán van | ellenfél-gólesély −2,5% → −10%; cserébe piros/sérülés-súlya ×1,15 → ×1,75, és enyhe gólpassz-előnye van |
  | ⚡ | **Box-to-box** | végig, amíg pályán van | gólpassz-súly ×1,015 → ×1,07 · ellenfél-gólesély −1% → −4% · **+1 / +1,25 / +1,5 pont** taktikai illeszkedés 85 / 90 / 95 sebesség fölött |
  | ⚡ | **Legolas** | végig, amíg pályán van | a **CSAPAT** gólesélye +1,5% → **+5%** · a sajátja gólban ÉS gólpasszban +2,5% → +9% |
  | ⚡ | **Robben berobban** | végig, amíg pályán van | a saját gólsúlya ×1,035 → **×1,15** · a csapaté +1,5% → +7% |

  **A VILLÁM MÁSKÉPP MŰKÖDIK, és ez szándékos.** A másik két stílus szerepei a
  meccs egy SZAKASZÁRA szólnak (a hajrára, az első 25 percre); a Villámé addig
  él, amíg az EMBER a pályán van — mert ez a stílus nem egy időablakot ural,
  hanem egy embert enged el. Cserébe szigorú a **belépő**:

  | szerep | kire jelölhető |
  |---|---|
  | Box-to-box | védő vagy középpályás (a szélső is az — `ROLE_CATS`) |
  | Legolas | **95-ös sebesség fölött**, Infinityben **100+** |
  | Robben | ismeri a **középcsatár** posztot (másodlagosan vagy tanultan), és **90+** a sebessége |

  A Legolas belépője a játék egyik legmagasabb attribútum-küszöbe, és
  Infinityben feljebb csúszik: ott a teljes mezőny feljebb tolódik, tehát a 95
  már nem kiemelkedő. Egy szám, két világ.

  **A csapatszintű szorzók szerényebbek az egyéni súlyoknál.** Egy egyéni
  gólsúly EGY ember esélyét tolja a tizenegyen belül; a Legolas és a Robben
  csapat-szorzója viszont az egész gólvárhatóságot emeli — ugyanaz a szám ott
  nagyságrenddel többet ér. A kettő együtt, 3. szinten, mindkettőjükkel a
  pályán: **×1,12 a csapat gólesélyén**.

  A **Box-to-box illeszkedés-bónusza** az egyetlen szerep-hatás, ami nem a
  képesség szintjétől függ, hanem a JÁTÉKOS SEBESSÉGÉTŐL. A logika: egy
  box-to-box csak akkor tudja tényleg összekötni a két tizenhatost, ha van
  hozzá lába — a képesség a gólpasszt és a védekezést emeli, ezt a láb. A
  bónusz a KERETBEN lévő emberre jár (nem a pályán): az illeszkedés a meccs
  ELŐTT dől el, ott még nincs „pálya".

  **Egy képesség emeli mind a hármat**, stílusonként egy („Kiosztott
  szerepek", III. sáv). A szerepek képesség NÉLKÜL is hatnak, csak aprón; a
  3. szinten mindegyik nagyjából egy klasszikus erős skill szintjén áll
  (Gólzsák ×3,7 gólsúly, Sebészi passz ×4 gólpassz-súly, Betonfal −10%
  ellenfél-gólesély). A szakaszosság miatt a CSÚCSSZORZÓ lehet nagyobb, mint
  egy egész meccsen ható skillé — a nettó hatás így jön ki hasonlóra.

  A Kereszttűz kockázata KÉT szinten hat: a súlyszorzó azt dönti el, KI kapja
  a lapot vagy a sérülést (ő), a csapat ÖSSZ-esélyét pedig a többletsúly
  tizenegyed része emeli (3. szinten +6,8%) — egy ember a tizenegyből, ennyi a
  becsületes szám.

  A kiosztás a szezonhoz kötődik: `roleState()` a szezonszám elmozdulásánál
  üres táblát ad, tehát nem „felejt", hanem lejár. Egy ember egyszerre egy
  szerepet visel.

  **HATÁR: a szerepek a párharcban NEM hatnak.** A H2H szimuláció mindkét
  oldalt egyetlen, sorosított pillanatképből számolja (`h2hSimulate`), és abba
  a szerep-szorzók nem utaznak — ahogy a `roleGoalMult` sem szerepel a drótra
  fűzött gólsúlyokban. Ez a rendszer indulása óta így van, mind a három
  stílusnál; nem a Villámmal keletkezett. Kiterjeszteni a `defMult` mintájára
  lehetne (a pillanatképbe rakva), de az önálló döntés.

* **Nulla a tábla — Beton (3.2.00).** A kihívás-rendszer a stílus nyelvén
  szólal meg: gyakrabban jön kapott gól nélküli kihívás (35/50/65% eséllyel),
  KÖNNYEBB céllal és NAGYOBB jutalomért. Szándékosan ellentmondásos párosítás —
  aki így épít csapatot, annak a tiszta lap nem bravúr, hanem a napi munkája.

  A könnyítés a KALIBRÁCIÓ teljesítési arányán megy (`_chCleanEase`), nem a
  kész célt vágja vissza utólag. Ez azért fontos, mert a kihívás leírása a
  célszámot beleírja a szövegbe: ha utólag nyírnánk, a panel mást állítana,
  mint a feltétel. Mérve (jó védelmű keret, 30 forduló): a nehéz „X meccs
  kapott gól nélkül" 13-ról 9-re, a „legfeljebb X kapott gól" 26-ról 31-re
  könnyül. A jutalom egyszerűen egy-két nehézségi sávval feljebbről sorsolódik;
  a BÜNTETÉS a valódi sávon marad.

* **Gólzápor-ünnep és izgalom-mérföldkövek — Bombázók (3.2.00).** A szurkolói
  bevétel három lába közül az egyik az IZGALOM (20% súly), és az izgalom-mutató
  alapból a FESZÜLTSÉGET méri. A Bombázók szurkolója viszont nem feszültségért
  jár ki, hanem gólokért. A képesség két küszöböt jutalmaz: 5+ gólnál +20/+35/+50
  izgalom, 10+ gólnál padló 80/90/100.

  **Következmény, amit vállalunk:** a 3. szinten egy átlagos ötgólos meccs
  (~54) is 100-ra fut, tehát a felső sáv gyakorlatilag telítődik. Ez a kért
  viselkedés — a stílus szurkolója így éli meg —, de érdemes tudni, hogy
  ilyenkor az izgalom-mutató a Bombázóknál már nem különbözteti meg az ötgólos
  meccset a tízgólostól.

  Mellé két új lépcső, mert a stílus minden addigi mérföldköve gólt vagy
  gólpasszt számolt, a MŰSORT egyik sem: `bz_fest` (gólzáporok — mindkét oldal
  góljai együtt, 5+) és `bz_memo` (emlékezetes mérkőzések, ≥85 izgalom).
  Mindkettő karrier-számláló.

* **Az Infinity kinyitja a stílus-lépcsőket (3.2.00).** A stílus-mérföldkövek a
  100-as mezőny idejéből valók. Infinityben a mezőny 200 felé megy, ott a teljes
  fa egy-két idény alatt kimerül, és a filozófia attól kezdve NEM FIZET SEMMIT.
  (Ugyanez a hiba jött elő a `hm_balN`-nél, csak ott kézzel írtuk át.)

  Mostantól minden alkalmas család **hat új fokozattal folytatódik**
  (`stExtendForInfinity`, 294 új fokozat a hat stíluson): a Rating-jellegű
  mércéknél egyenletesen a 200-as plafonig, a számlálóknál a mostani tetejük
  1,8-szereséig. A szövegeket ugyanaz a `tFn`/`dFn` írja, ami az eredetieket.
  A jutalom minden fokozaton nő, de **laposodó görbén**: +35%, +25%, +18%,
  +12%, +8%, +5% a család addigi tetejéhez képest.

  **Nem hosszabbítjuk** a fordított mércéjű családokat (ott „felfelé" a
  könnyebbség iránya volna), a rangsor-lépcsőket (szezonkártya: a GODLIKE
  fölött nincs szint) és a lépés-számlálókat (kapitányi fokozatok). A
  hosszabbítás idempotens, és a betöltéskor is lefut — a `STYLE_MILESTONES` a
  lap betöltésekor épül, amikor még nem tudjuk, hogy a mentett karrier
  Infinityben jár-e.

* **A Villám sorsolás-képessége szorzóvá vált (3.2.00).** A „Sebességre hangolt
  sorsolás" eddig saját, önálló esélyt adott (30/45/60%), és a taktikáéval a
  nagyobb élt — ettől a képesség taktikától függetlenül ugyanazt adta, jól
  begyakorolt széljátéknál pedig egyáltalán nem is látszott (a taktika 75%-a
  mindig nagyobb volt).

  Mostantól a MEGLÉVŐ esélyt szorozza. A számolás a tényleges esélyen megy, nem
  a torzításon: `p0 = torzítás + (1−torzítás) × a pool nyers pace-aránya`,
  `p1 = min(0,85, p0 × (1+szint))`, és ebből fejtjük vissza a szükséges
  torzítást. Mérve (6000 húzás szintenként): sebesség-taktika nélkül 11% →
  12/15/17%, részben begyakorolt széljátéknál 38% → 47/54/58%.

  A 0,85-ös MENNYEZET nem a képesség ellen szól: egy tökéletesen begyakorolt
  széljátéknál (78% × 1,6) 100%-ra futna, és onnantól a keret semmi mást nem
  tanulna.

* **A pakli nem fogy ki többé (3.2.01).** A képesség-panel azt írta, hogy „a
  poolban most nincs sebesség-képesség — nincs mit szorozni". Nem hiba volt,
  hanem a pakli szerkezete: a `S.skillPool` egyetlen, teljes, megkevert pakli,
  amiből húzunk, és csak akkor keverünk újat, amikor TELJESEN elfogy. Egy skill
  tehát egy körön belül pontosan egyszer jöhet elő — a három sebesség-képesség
  kihúzása után ~35 húzáson át egy sem volt a paklidban. Egy karrierben ez több
  szezon, és pont a rájuk épülő stílust bénította meg.

  A skill nem fogyóeszköz: az `eligibleForSkill` amúgy is kizárja azt, aki már
  bírja, tehát ugyanazt a képességet nyugodtan megkaphatja egy MÁSIK játékos.
  Két javítás:
  1. a pakli **utántöltődik**, ha 12 alá csökken (friss, kevert pakli kerül mögé),
  2. a **célzott** húzások (sebesség-, gól-, kategória-torzítás) ha nem
     találnak, egy friss példányt vesznek a teljes készletből.

  A második lépés fontos: az első próbálkozásom egy egész paklit fűzött mögé,
  és mivel a sebesség-ág gyakran sül el, de paklinként csak három
  sebesség-képesség van, a pool 600 húzás alatt **3877 elemre hízott**. Egy
  példány kell, nem egy pakli. Mérve a javítás után: a pool 12 és 47 között
  marad, erős sebesség-torzításnál a húzások 47,5%-a sebesség-képesség és a
  leghosszabb szünet 10 húzás; torzítás nélkül 200 húzásból 37 különböző skill,
  a leggyakoribb 6-szor — természetes ismétlődés.

* **A műszerek plafonja Infinityben kitolódik (3.2.01).** A végsebesség- és
  lövéserő-mérés a VALÓS futball határaihoz volt kalibrálva (38,5 km/h, 165
  km/h). Infinityben viszont már nem valós játékosok vannak: a mezőny 200-ig
  tolható, a műszer viszont ott ragadt, és egy idő után mindenki ugyanazt a
  plafonszámot mérte — a rekordot nem lehetett többé megdönteni.

  A sáv mostantól a mezőnnyel együtt nő, arányosan (a teljes, 200-as mezőnyön
  éri el a maximumot): **végsebesség 38,5 → 45,5 km/h**, **lövéserő 165 → 210
  km/h**.

  **A görbe alsó fele sosem mozdul.** Az első próbálkozásom a horgonyt tolta el
  (99 → 99 + mezőnytöbblet), és ettől ugyanaz a 99-es játékos LASSABBAT futott,
  ahogy a mezőny fejlődött — a műszer nem mondhat ilyet. Ezért szakaszos: 99-ig
  betűre a régi képlet, fölötte lineárisan a kitolt plafonig. Mérve: egy
  99-es sebességű ember 37,6-37,7 km/h-t fut a mezőny minden szintjén.

  **Ehhez tartozik egy 3.2.00-s hibám javítása:** a km/h-ban mérő
  mérföldkő-családok (`vl_rec` végsebesség-rekord, `pz_shot`/`pz_shotmax`
  lövéserő-rekord) is a „Rating-jellegű" listára kerültek, tehát a 200-as
  szintig hosszabbodtak volna — egy 200 km/h-s VÉGSEBESSÉG viszont nem legendás,
  hanem értelmetlen. Mostantól minden ilyen családnak saját tetője van
  (`ST_INF_TOP`), a műszerek valódi, kitolt plafonjához igazítva: a
  végsebesség-lépcső 38 → 45 km/h-ig, a lövéserő 164 → 210 km/h-ig nyílik.

* **Színes paletta és szivárvány — a Béke és harmónia négy új lépcsője
  (3.3.08).** A stílus eddig azt mérte, hányan találtak be egy IDÉNY alatt
  (`hm_scorersN`) és hányan szálltak be a klub történetében (`hm_contrib`). Ami
  hiányzott: az EGY MÉRKŐZÉSEN belüli megosztás — az a kép, amikor egy meccsen
  három-négy különböző ember nevét írja a jegyzőkönyv. Ez a filozófia
  legtisztább pillanata, és eddig nyomtalanul elszállt.

  | család | esemény | küszöbök | Infinity |
  |---|---|---|---|
  | `hm_paletteN` | **pontosan 3** gólszerző egy meccsen | 1·2·3·5·7·10·15·20·30·50·100 | +50-esével (150…400) |
  | `hm_rainbowN` | **4 vagy több** gólszerző egy meccsen | 1-10 egyesével, 20-ig kettesével, 50-ig ötösével, 100-ig tízesével | +10-esével (110…160) |
  | `hm_aPaletteN` | **pontosan 3** gólpasszadó egy meccsen | ugyanaz, mint a paletta | ugyanaz |
  | `hm_aRainbowN` | **4 vagy több** gólpasszadó egy meccsen | ugyanaz, mint a szivárvány | ugyanaz |

  **A két fokozat kizárja egymást** (`msNoteMatch`): egy meccs pontosan egy
  vödörbe esik, tehát a szivárvány nem tölti „ingyen" a palettát is — mindkét
  sor a saját eseményét számolja. A számlálás a mérkőzés lefújásakor történik
  (`mScore`/`mAssist` kulcsai), mert a `careerStats` csak összegez: utólag
  visszakereshetetlen, hány KÜLÖNBÖZŐ ember talált be egy adott meccsen. A
  gyűjtés stílustól függetlenül fut, tehát a később választott filozófia is
  megkapja a már lejátszott meccseket.

  **Pontérték:** paletta 65, szivárvány 204, a két passz-lépcső ugyanennyi —
  a stílus táblája 663 → 1201 pontra nőtt (52 → 126 fokozat). Ezzel a Béke és
  harmónia lett a legbőkezűbb tábla, ami szándékos: a fája a legdrágább is
  (a négy egyensúly-képességgel jóval 1007 pont fölött), miközben eddig a
  legszegényebb táblával állt. Kimaxolni továbbra sem lehet.

  **A fázis-csík ezért tördelődik** (`.msPhase{flex-wrap:wrap}`): 26 (Infinity
  után 32) szem egy sorban kilógna a kártyából, és vízszintes görgetést okozna
  a telefonon. A rövid családok képe változatlan.

* **A közös mű — ahányan beszálltak EGY mérkőzésen (`hm_contribM`, 3.3.15).**
  A paletta és a szivárvány a gólszerzőket és a gólpasszadókat KÜLÖN nézi, a
  `hm_contrib` pedig a klub egész történetét összegzi. Ami hiányzott: az
  egyetlen mérkőzésen belüli TELJES megosztás — hány KÜLÖNBÖZŐ ember írta be
  magát a jegyzőkönyvbe góllal **vagy** gólpasszal. Ez a filozófia legtisztább
  kérdése: meddig lehet elmenni abban, hogy egy győzelmet sokan csináljanak?

  | | |
  |---|---|
  | mérce | `msT().contribMax` — **csúcs**, nem darabszám |
  | forrás | `mScore` és `mAssist` kulcsainak UNIÓJA a lefújásnál (`msNoteMatch`) |
  | küszöbök | 3·4·5·6·7·8·9·10·11·12·13·14 (12 fokozat) |
  | pontérték | 1·1·2·3·5·7·9·12·16·21·27·36 — összesen **140** |
  | Infinity | **nincs** hosszabbítás (`ST_INF_SKIP`) |

  **Miért csúcs és nem számláló.** A paletta azt jutalmazza, hogy sokszor jön
  össze; ez azt, hogy meddig jutottál el EGYSZER. A 12. embert nem többször
  kell összehozni, hanem egyszer — és utána már a 13. a cél. Aki gólt IS és
  gólpasszt IS adott ugyanazon a meccsen, **egyszer** számít: emberek, nem
  tételek.

  **A lépcső számtana.** Egy gól legfeljebb KÉT nevet ír be (a szerzőt és a
  tálalót), tehát az N. fokozathoz durván N/2 gól kell úgy, hogy minden gólnál
  más-más pár szerepeljen. 3-6 = jó napok; 7-10 = gólzápor megosztott
  befejezéssel (itt dolgozik érted az „Osztott dicsőség" trait); 11 = a teljes
  kezdő tizenegy, a kapussal együtt; 12-14 = **csak cserékkel**.

  **A tető 14, és ez nem önkényes.** Egy mérkőzésen ennyi ember tud egyáltalán
  pályára lépni: 11 kezdő + `HALFTIME_SUB_MAX` (3) csere. A meccs előtti
  kényszerpótlás (sérült/eltiltott helyett beálló) nem ad plusz embert — ő már
  a kezdő tizenegy része. A 14 tehát szó szerint azt jelenti, hogy mindenki
  beírta magát, aki csak a pályán járt. Efölött nincs mit kérni, ezért a
  család ki van véve az Infinity-hosszabbításból: egy 15-ös fokozat nem nehéz
  volna, hanem teljesíthetetlen. Ha a cserelimit valaha nő, a lépcső teteje is
  nőhet vele — a küszöbtömb (`ST_UNITY_TH`) egyetlen sor.

  **A 12 fölötti sáv a „Cserék a meccs alatt" kapcsolót kéri** (HUB → Csapat-
  építés): kikapcsolt cseréknél a kezdő tizenegy a plafon, tehát a 11 az utolsó
  elérhető fokozat. A leírás a 12. fokozattól ezt ki is mondja.

* **Osztott dicsőség — olcsó képesség a Béke és harmóniának (3.3.10).** A
  stílus mérőszáma és a mérföldkövei is arról szólnak, hogy SOKAN szálljanak be
  a termelésbe (különböző gólszerzők egy idényben, akik valaha betaláltak a
  klubnál, és a színes paletta / szivárvány lépcsők). A meccsmotor viszont
  ezzel szemben dolgozott: a gólszerző és a gólpasszadó sorsolásának súlya a
  Ratinggel nő, tehát a legjobb emberek elviszik a termés nagy részét.

  Az új, **1. szintű (olcsó: 14/24/38 pont)** trait a súlyok eloszlását
  lapítja: minden jelölt súlya **15 / 25 / 50%-ban** közelít a mezőny átlagához
  (`styleSpreadWeights`, a `weightedPick` új `spreadSkip` paraméterén át). Öt
  sorsolás kapja meg: büntetőrúgó, rendes gól, 90+ dráma-gól, hosszabbítás-gól
  és gólpassz.

  Mérve egy tipikus kezdő 11-en (kapus, 4 védő, 4 közép, 2 csatár), a két
  csatár együttes gólrészesedése: **52,5% → 47,6% (15%) → 44,3% (25%) → 36,2%
  (50%)**; a védőké fejenként 1,9% → 6%.

  **Amihez nem nyúl:** hogy ESIK-E gól. A sorsolás csak azt dönti el, KI
  szerzi — a gólok számát a meccsmotor gólrátája adja (ugyanez a megkülönböztetés
  áll a `GOALW_SCALE` megjegyzésében is). Ezért lehet a legolcsóbb ársávban: nem
  erősít, csak szétteríti a termést.

  **A kapus kimarad.** Az első változat a teljes mezőnyt lapította, és mérve a
  3. szinten a csapat góljainak ~5%-át adta volna a kapusnak (a `GOALW.KP` 0,02,
  tehát az átlagra keverés őt emelte a legtöbbet) — idényenként négy-öt
  kapusgól. A kapus súlya ezért érintetlen marad, és az átlagba sem számít bele.
  A nulla súly (kiállított játékos) szintén nulla marad.

### 3.2 A Beton védelem bővítése (3.3.16)

A stílusok mérlegét számba véve a Beton védelem minden mennyiségi mutatóban
utolsó volt: **88 mérföldkő** (a Harmónia 186-jának a fele), **8 mérföldkő-
család**, **1968 gyűjthető pont** — 45%-kal kevesebb, mint a Pánzeré —, és
**144% fedezet**, a legszűkebb az egész játékban. Két szerkezeti oka volt, és
mindkettő valós: a fordított mércéjű „kapott gól" család Infinityben nem
hosszabbodik (ott „felfelé" a könnyebbség iránya volna), a védekezésből pedig
eleve kevesebb dolgot lehet megszámolni, mint a támadásból — a tiszta lap
meccsenként egy bináris esemény, a gól és a piros lap halmozódik.

A bővítés **négy képességgel és öt mérföldkő-lépcsővel** válaszol erre.

**Az új képességek**

| Rang | Képesség | Hatás (I / II / III) |
|---|---|---|
| I | **Ötös bástya** | ha a felállásban legalább ÖT védő áll: −2,5% / −5% / −7,5% ellenfél-gólesély |
| II | **Tiszta szerelés, hideg sör** | a „Fogd meg a söröm!" a szerelésekért is jár: 10 / 7 / 5 tiszta szerelés egy idényben |
| II | **Olcsó a jó védő** | −25% / −33% / −40% a védők vételárából |
| III | **Jöhet a buszsofőr!** | Park the bus mellett a csereszünetben behívható; ellenfél −33% / −50% / −66%, saját −50% / −33% / −25% |

Az **Ötös bástya** az első képesség, ami nem a keretről, hanem a
FELÁLLÁSRÓL szól. A feltételt maga a szorzó méri (függvény-értékű `fx`, lásd
`styleFxMul`), tehát felállás-váltáskor magától ki-be kapcsol. Ezért kellett a
szorzós csatornát is megnyitni a függvény-értékek előtt — eddig csak az
összeadódó csatorna (`styleFxAdd`) tudott feltételes hatást.

A **Tiszta szerelés, hideg sör** a „Fogd meg a söröm!" MÁSODIK útja. Az elsőt
(sorsdöntő mérkőzés) a `clutchSettle` intézi; ez a napi műhelymunkát fizeti
meg. A számláló a kiosztáskor levonódik, nem nullázódik: aki egy idényben
kétszer összegyűjti a küszöböt, kétszer lép a képességgel — ugyanaz a szabály,
mint a hőstettnél.

A **buszsofőr** a fa csúcsa, és az egyetlen képesség, amit menet közben kell
bevetni. Ára egy cserelehetőség és egy középpályás, aki lejön érte. A képesség
íve nem az, hogy egyre jobban véded, hanem hogy **egyre kevesebbet fizetsz érte
elöl**: a saját gólesélyed vesztesége 50%-ról 25%-ra csökken a szintekkel.

**A buszsofőr nem személy** — és ez a motorban is szó szerint így van. Az
`a.bus` jelző egyetlen szabályt mond ki, amiből minden más következik: sosem
jelölt a gól-, gólpassz-, tizenegyes- és kapufa-sorsolásban (a `weightedPick`
egyetlen pontján), nem kaphat lapot és nem sérülhet meg, nem nő a meccsszáma,
nem kerül a karrier-statisztikába, nem lesz a meccs embere, nem fejlődik és nem
kap bért. A **csapaterő sem változik tőle**: a busz nem a keretedet erősíti,
hanem a mérkőzést zárja be. A két szorzó a gólsorsolásnál ül, nem a
λ-képletben — ugyanott, ahol a szezon-szerepeké —, mert a hatás a mérkőzés
hátralévő részére szól, nem az egészre.

**Az új mérföldkövek**

| Család | Lépcső | Mit mér |
|---|---|---|
| **Védekező képességek** (átírva) | 1 / 3 / 5 / 7 / 10 / 12 / 15 / 17 / 20 / 25 / 30 / 40 / 50 | a keret védő- és kapus-képességei |
| **A legjobb védőd Védekezése** | 85 / 90 / 95 / 100 / 105 / 110 / 115 | a keret bármelyik védőjének attribútuma |
| **A védősor össz Védekezése** | 400 / 450 / 500 / 550 / 600 / 650 / 700 | a kezdő 11 hátsó sora együtt |
| **Bravúrok a klub történetében** | 25 / 60 / 120 / 200 / 300 / 450 / 650 / 900 / 1200 | a kapusok életműve |
| **Tisztalap-sorozat** | 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 15 | egymást követő nullák |

A régi három fokozatos „védekező képességek" (3/6/10) egy-két idény alatt
kifutott, és utána a stílus legsajátabb gyűjtése nem fizetett többet semmit —
ezért lett belőle tizenhárom fokozat, az ELSŐ képességtől az ötvenedikig.

A két attribútum-lépcső szándékosan **két külön utat** ír le: aki hatalmas
egyéniséget nevel, az elsőt viszi; aki mély, egyenletes védősort épít — vagy
egyszerűen öten áll hátul —, a másodikat. A Védekezés-attribútum a Rating
skáláján fut, tehát Infinityben ugyanoda tart: kétszázig (`ST_INF_TOP`).

**A mérleg utána** (100-as nehézségi szint, Infinity, alap tempó):

| | előtte | utána |
|---|--:|--:|
| Képesség / szint | 9 / 27 | **13 / 39** |
| A fa teljes ára | 1 364 | **1 992** |
| Mérföldkő-fokozat | 88 | **154** |
| Gyűjthető stíluspont | 1 968 | **4 063** |
| Fedezet | 144% | **204%** |

A Beton ezzel a legtöbbet termelő stílus lett (4 063 pont), a fája pedig a
második legnagyobb a Harmónia 2 051-e mögött. A „legsivárabb" cím átkerült a
**Bombázókhoz** (9 képesség, 118 mérföldkő, 2 578 pont) — az a stílus a Beton
tükörképe, tehát ugyanez a bővítés ott is elvégezhető, csatárokra fordítva.

### 3.3 Párharc-cseretervező (3.3.17)

A párharcban eddig **nem lehetett cserélni**, és jó okkal: a mérkőzés eredményét
a két keretből előre kiszámolt **közös eseménylista** adja, tehát egy menet
közbeni döntés csak úgy TŰNNE, mintha hatna. A csereszünet ezért a párharc-
fordulókban ki volt kapcsolva — a keret mélysége viszont a karrier egyik fő
építőiránya, és pont a két legnagyobb tétű meccsen esett ki a képből.

**A megoldás: a cseréket előre tervezed meg, feltételekhez kötve.** A terv a
pillanatképpel EGYÜTT megy fel a szobába, és onnantól a **szimuláció maga hajtja
végre** — vagyis a csere ott van a közös listában, mindkét kliens ugyanazt
számolja, és a csere tényleg számít.

**Három változó szabályonként**

| # | Változó | Értékek |
|---|---|---|
| 1 | hányadik perctől | 5-től 85-ig, ötösével (a mérkőzés is öt perces vödrökben pereg) |
| 2 | milyen az állás | bármilyen · vezetünk · vereségre állunk · döntetlen · 2+ góllal vezetünk · 2+ góllal vereségre állunk · kiállítottak egy játékosunkat |
| 3 | ki helyére ki | a kezdő 11 bármelyik tagja ← a cserepad bármelyik tagja (Beton védelemnél középpályás helyére a **buszsofőr** is) |

**A SORREND A RANGSOR.** A szimuláció felülről lefelé halad: ha egyszerre több
szabály is érvényes volna, a listában előrébb álló lép életbe, és a hármas
cserekeret is fentről lefelé fogy el — az alsó szabályok akkor egyszerűen nem
jutnak szóhoz. A tervezőben nyilakkal átrendezhető a sorrend.

**Amit a csere ténylegesen mozdít a szimulációban**

* **ki lőhet gólt** — a beálló ember gól- és gólpassz-súlya (`gw`/`aw`) az adott
  helyre kiszámolva utazik fel, tehát a gólszerző-sorsolás onnantól vele számol;
* **a csapaterő** — a `doSub` képlete szerint (a különbség tizenegyede), és a
  λ-k újraszámolódnak;
* **a buszsofőr két szorzója** — a saját gólesélyed vissza, az ellenfélé le.
  Ez az egyetlen csere, ami a MÁSIK oldal λ-ját is mozdítja.

**A lejátszás ugyanezt futtatja le a saját tizenegyeden**, a közös lista
csere-eseményeiből, a rendes csere útján (`doSub`) — így a könyvelés
(meccsszám, karrier-statisztika, fejlődés, a meccs embere) pontosan azt követi,
ami a pályán történt. A lecserélt ember a lejátszott perceiért fejlődik.

**A piros lap is a közös listába költözött.** Eddig mindkét kliens SAJÁT kockát
dobott rá: láthatatlan, de valódi ellentmondás volt (ugyanazon a mérkőzésen a
két gépen más-más ember kapta a lapot). Ez egyben az egyetlen módja annak, hogy
a „ha kiállították egy játékosunkat" feltétel értelmezhető legyen — a
szimulációnak TUDNIA kell róla. **A valószínűség és a súlyozás betűre a régi**
(`mpWireRedWeights`), csak a dobás HELYE változott; a lejátszás ilyenkor nem dob
saját lapot. A közös lista `v:2` jelzője mondja meg, hogy a lista vezeti-e a
lapot — régi (verzió nélküli) listánál minden marad a régiben.

**Visszafelé kompatibilitás.** Ha a pillanatképben nincs `redP` (régi kliens), a
szimuláció NEM fogyaszt véletlent a lapra, tehát a seedelt folyam betűre a régi
marad. A csereterv hiánya ugyanígy: terv nélkül a lista pontosan az, ami eddig
volt.

**Hol nyílik meg.** A kezdőrúgás előtt, minden hálózati lépés előtt — a terv a
pillanatkép része, tehát ha a keret egyszer felment, már nem tudna beleférni.
Egyetlen kérdéssel indul („akarsz cserét?"), és csak igenre nyílik meg a
szerkesztő, az első opcióval eleve nyitva. A döntés — a „nem" is — a mentés
része, tehát egy újratöltés nem kérdezi meg újra; a keret visszahívása viszont
eldobja a tervet, mert az átrendezett keretre épülő szabályok elavulnak.

### 4.4 Nyitott kérdések

1. **Stílusváltás** — legyen-e egyáltalán, és ha igen, milyen áron? (2.2)
2. **A sztár kijelölése** — véglegesen egy emberre szól, vagy a sztár eladása
   után átruházható? Ha átruházható, mi történik az addigi mérföldkövekkel?
3. **Több klub, egy stílus** — a stílus a KARRIERHEZ vagy a klubhoz tartozik?
   (Ma a karrier egy klub, tehát ez csak akkor kérdés, ha valaha lesz
   klubváltás.)
4. **Multiplayer** — közös karrierben a két fél külön stílust választ, vagy a
   szoba egy stílusra fut? A traitek egy része (pl. „Vasfegyelem") párharcban
   érzékenyen érintheti az egyensúlyt.
5. **A Béke és harmónia III. traitje** („A gépezet") a szórásra épül — ez a
   metrika ma sehol nincs kiszámolva; új segédfüggvény kell hozzá.
