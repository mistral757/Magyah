# CSAPATÉPÍTÉSI STÍLUSOK — tervezet

**Állapot:** 📐 **Terv — kód még nincs hozzá** (v3.0 előkészítés)

Ez a dokumentum a 3.0 nagy rendszerének, a **csapatépítési stílusnak** a
kidolgozott terve. A mérföldkő-rendszer (✅ kész) és a stílus-rendszer (📐 terv)
együtt alkotják a 3.0-t; a mérföldkövek már ma is termelik azt a valutát —
a **csapatstílus-pontot** —, amiből ez a rendszer majd költeni fog.

| Rész | Tartalom | Állapot |
|---|---|---|
| Általános mérföldkövek | 96 karrier-cél, pénz- és stíluspont-jutalommal | ✅ kész |
| Csapatstílus-pont mint valuta | gyűjtés, mérleg, mentés | ✅ kész |
| Stílusválasztás az 1. szezon után | — | 📐 terv (ez a dokumentum) |
| Stílus-specifikus mérföldkövek | — | 📐 terv |
| Trait-bolt stíluspontért | — | 📐 terv |
| Saját HUB menüpont | — | 📐 terv |

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
a valutát termelik. Az általános mérföldkövekből összesen **329 pont**
szerezhető meg, hat kategóriára osztva.

**De nem ingyen.** A stíluspontos mérföldkövek **kategóriánként zárva
indulnak**, és pénzért kell megnyitni őket (`MS_STYLE_CATS`). Amíg egy
kategória zárva van, a benne lévő mérföldkövek **nem gyűlnek**; ami közben
teljesül, az a megnyitáskor „lemaradt"-ként, **pont nélkül** zárul le. Ez az
ellensúly a rendszerben: a pénzjutalmas mérföldkövek nem tiszta nyereséget
adnak, hanem **befektethető tőkét** — vagy a klubra költöd, vagy a
csapatstílus-fejlődésre.

Az árazás a jutalmakkal azonos idiómát követi (a mindenkori éves büdzsé
százaléka), így a klub növekedésével együtt mozog:

| Kategória | Ár | Mérföldkő | Stíluspont |
|---|---|---|---|
| Vagyon | 0,5× éves keret | 6 | 52 |
| Transzferpiac | 0,7× | 12 | 69 |
| Utánpótlás és stáb | 0,7× | 7 | 54 |
| Trófeák | 1,0× | 6 | 74 |
| Bajnoki fölény | 0,9× | 5 | 50 |
| A nagy ugrás | 1,2× | 2 | 30 |
| **összesen** | **5,0×** | **38** | **329** |

Mérve: a pénzjutalmas mérföldkövek összesen **9,22× éves keretet** hoznak be,
tehát mind a hat kategória megnyitása a mérföldkő-kereset **54%-át** viszi el.
Meghatározó tétel, de nem kizárólagos: marad pénz a klubra is.

Javasolt trait-árazás: **I. szint 8-12 pont · II. szint 20-30 · III. szint
50-70**. Így egy karrier alatt a hat traitből reálisan **három-négy** szerezhető
meg — a stíluson belül is döntést kell hozni, nem lehet mindent kimaxolni.

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
