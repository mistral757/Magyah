# 1.0.12.18.00 — Navigációs dokk, öltöző a menüben, a jelenetsáv letolja a felületet, vissza a menübe, mérföldkő-csomag

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwzapt9ae3u2)
> „A HUB-ban legyen mindig látványosan elérhető egy gomb, ami visszavisz a szezonhoz. Kicsit sok minden van már a
> HUBban és sokszor van hogy keresem, hol a gomb. Legyen egyértelmű, mire kell kattintsak, hogy visszamenjek.
> Ugyanezt a másik irányba is megcsinálhatnánk. Ne ott alul a többi gombbal legyen az irány a HUB-ba. Ezek a fő
> felületeink. Legyenek egyértelműek és mindig könnyen elérhetők. Az öltözőt pedig át kéne vinni a menübe és
> ahhoz is tanítás kapcsolni. És ahhoz is animációt csinálni."

**Navigációs dokk (`#navDock`).** Alul középen egy nagy, arany gomb.
- **A HUB-on** a fő továbblépő gomb felirata áll rajta: „← Vissza a szezonhoz”, „Irány a pályára →”, „✅ Lezárom az átigazolási időszakot” …
- **A meccsképernyőn** „🏠 HUB” áll rajta.
- **Nem másolja a gombokat, megnyomja őket:** minden felirat, állapot és tiltás az eredeti gombé.
- **Az eredeti HUB-gomb a helyén marad**, mert a leckék oda mutatnak.
- **A meccsképernyő régi HUB-gombja** (a többi gomb között) eltűnik a dokk mögé.
- **Rejtve marad:**
  - lecke és tipp alatt;
  - gépi idényben;
  - fekvő HUB-on, ahol a továbblépő gomb már a bal sáv tetejére tapad.

**Öltöző a menüben.**
- **Helye:** ☰ Menü → a kapitányváltás mellett 🗣️ Öltöző.
- **Animáció:** saját jelenetsáv-animáció (`jsavOltozo`). Szekrénysor a klub színeiben, a padon egy törölközős játékos, két másik beszélget, a buborékban a napló legfrissebb bejegyzése.
- **Tanítás:**
  - a Kezdő út „Nézz be az Öltözőbe” feladata és „Hol?” leckéje a menün át vezet (menü → Öltöző → a napló magyarázata → bezárás);
  - az „új bejegyzés” jelzés a menüpontra mutat.
- **A meccsképernyőn** a gomb rejtve marad (a DOM-ban megvan).

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwzahwiw6lxn)
> „Amíg futnak az egyes menüpontok animációi, addig legyen az egész kezelőfelület annyival lejjebb tolva, amennyit
> felülről elfoglal a kis animáció, különben csak simán zavar a cucc. Legyen Smooth az, amikor lemegy az animáció és
> minden visszatolódik fentre. Vagy amikor a user rákattint az animációra, hogy eltűnjön."

- **Mi tolódik le:** a sáv magassága a `--jsavEltol` változóba kerül. Ennyivel lejjebb kerül:
  - a lap (`body` padding-top, a 14 px-es alap fölé);
  - a menü-ablakok (fixed top, és ennyivel kisebb a legnagyobb magasságuk);
  - a ragadó menüsáv és eredményjelző.
- **Vissza:** amikor a sáv eltűnik (lejárt, vagy rákoppintottál), minden 0,38 mp alatt simán visszacsúszik.

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwzaft1hx47)
> „Most egy csomó dolog visszadob a menüből a HUB-ba. Játékosok leigazolása, átigazolási esemény stb. Valami bug
> van ezzel. Egyszer már megoldottuk."

**Az előzmény:** a jegyzet még a 1.0.12.16.01-en született. Az átigazolási eseményt a 16.02 javította.

**Az új javítás:**
- **A menüpont megnyomásakor** a nyitott fülek is feljegyzésre kerülnek (`_hubMenuCsop`).
- **A `csReturnToHub`** (a vásárlás, a klub-szemle, a képesség-keresés, a sztárpiac és minden más átigazolási út közös kijárata) a menübe visz vissza, nyitott füllel, ugyanoda, ha a menü-mód él. Ez a TW nélküli és a régi TW-t újrahasznosító utakon is működik.

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwzacxt539zx)
> „Kinyitottam egy cspaatilus képességet. Miután rányomtam a megerősítésre, visszadobott a HUB-ba. Nem a menüben,
> nem a csapatstílus almenüben folytatódott. Ez így biztosan probléma"

**Nem reprodukálható:** a próbában a menü és a Csapatstílus fül a vásárlás után is nyitva maradt, Kezdő úttal is. Ezért általános védelem került be.
- **Mit csinál:** ha a menüből nyitott megerősítés („Biztosan módosítod?”) után valami kitett a menüből vagy becsukta a fület, a játék 60 ms és 900 ms után visszaállítja: menü, nyitott fülek, ugyanaz a görgetés.
- **Mikor nem nyúl hozzá:**
  - ha meccs indult, vagy másik képernyő vagy ablak nyílt;
  - ha a megerősítés nem a menüből jött.

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwzabcow2vcq)
> „Amikor kinyitsz egy új csapatstílust akkor általában azonnal feloldódik vagy 20-30 mérföldkő. Azokat egy nagy
> csomagban közölje a játék ilyenkor. Lehessen végignézni a kis értesítési ablakban görgetve, de ha nem érdekel,
> lehessen elhajtani egyből."

- **Gyűjtés:** a 250 ms-on belül érkező mérföldkő-értesítések egy pufferbe gyűlnek.
- **Egy darab:** a régi felugró jön.
- **Kettő vagy több:** **egy** csomag-felugró jön.
  - Fejléc: „N mérföldkő teljesítve”.
  - Alatta görgethető lista: ikon, név, jutalom.
  - Egy gomb elhajtja („Szuper, mind megvan”).
  - A „🔕 Ilyet ne mutass” akkor marad rajta, ha mind egy kategóriából jött.

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwza7zdd87hj)
> „A sarokból benéző játékos az idle kijelzőn a téma. Rossz helyen van a kis üzenet buborékja."

- **A helye** a figura valódi helyzetéből számolódik: közvetlenül a feje fölé kerül, felülről benézésnél alá.
- **A farka** a fejre mutat, nem a buborék közepére.
- **A szélessége rögzített,** mert az abszolút elem a helyétől függően szűkült volna.

## Próba
`tools/navdokk-oltozo-1-0-12-18-00-proba.js`: 8/8.
1. dokk mindkét irányba, lecke alatt rejtve;
2. öltöző a menüben, a jelenetsáv, a feladat és a „Hol?”;
3. a felület eltolása és visszaállása;
4. vissza a menübe vásárlásból, TW nélkül is;
5. a megerősítés-védelem (és hogy menün kívül nem nyúl hozzá);
6. a 6-os csomag és az egyes felugró;
7. a három benéző buborék;
8. nincs oldalhiba.

**Lefutott még:**
- `menu-ablak-1-0-12-7-00`, `menu-csukva-1-0-9-1-03`, `menupont-jelenetek-1-0-12-11-00`;
- `figura-jelenet-1-0-12-8-00`, `oe-szundi-tolto-1-0-12-16-00`, `szitalos-menu-korai-1-0-12-16-02`;
- `kezdo-ut-motor-1-0-11-16-00`, `kihivas-lada-igazolas-1-0-12-14-00`, `kut-visszafogas-1-0-12-17-00`;
- `lecke-vegig-1-0-12-15-00` (mind a 31 „Hol?”, az öltözővel együtt).

---

# 1.0.12.18.01 — hét új jegyzet: Szitálós vissza, blokk, öngól, menü-visszatérés, kihívás-gomb, scout-igazolás

## Szitálós: vissza a régire, egy kamerával
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzcbs1lavh0):** „Sőt a szitálós animáció teljesen elcsesződött. Tök jó volt előtte, csak a kamerára kellett volna figyelni, hogy minden esetben olyan szögben legyen véve, amelyikről végig látszik a gól. Állítsd vissza a regire."
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzbyohsfdnp):** „Nagyon lassú lett a labda a szitálós gólnál"

- **Visszaállt a régi** (1.0.12.16.02 előtti) tempó: nincs +1100 ms, a repülés a régi `fR+0,27`. A labda régi „tánca” is visszajött (oldalra kitérés és lebegés).
- **A kamera** az átvételtől a végéig **egyetlen, vágás nélküli kapu mögötti felvétel**. A kapu az első fókusz, így a labda végig a kapu felé repül a képen: a lövő nem takar, a kapu nem fordul ki.

## Blokk: a védő nem ugrál, nem megy át a lövőn
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzb62fh55ir):** „A blokk animációnál valami fura dolog történik a védővel. Javítsuk"

- **Az ok:**
  - a rátörés (kontra, csel, passz …) a védőt T(.44)-re a lövő **mögé** tette;
  - a blokk viszont T(.40)-től a lövő **elé**;
  - a pálya időrendje felborult, a védő ide-oda ugrált, és átment a lövőn.
- **Általános javítás:** a 3D kimenetelben egy szereplő új terve **felülírja** a saját későbbi pontjait, így minden út időrendben marad. A próba mind a tíz jelenetfajtán méri.
- **Blokknál** a védő eleve a lövő és a kapu közé zár (3,4 m-rel a lövő elé), onnan vetődik a lövés elé (a blokk pontja a lövéstől 3,1 m).

## Öngól: saját 3D jelenet
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzaygxr5228):** „Öngólnak nincs megcsinálva az animációja"

- **Eddig** a beadás után a *csatár* fejelt be, mintha sima gól lett volna.
- **Most a jelenet menete:**
  - a beadásra a **védő** érkezik elsőként, és tisztázni akar;
  - felugrik, de a labda a fejéről a saját kapujába csúszik;
  - a csatár egy lépéssel lekési, a kapus rossz irányba indul;
  - a végén a védő a fejét fogja (ingatja magát).
- **Az utolsó vágás** a kapu mögül a védőt, a labdát és a kapust mutatja.
- **Ellenünk szerzett öngólnál** a vétkes a **mi** játékosunk: a mi mezünkben, a védő helyén. Eddig az ellenfél csatáraként, az ő mezében jelent meg. A 2D jelenet (`evOngol`) ugyanígy.

## Menü: a vissza-gesztus sem dob ki a HUB-ra
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzbup3z7nvf):** „Továbbra is van egy csomó menün belüli almenupont, amit ha megnyitok, és utána bezárok, akkor utána nem a menü legutóbbi pontjához kerülök vissza, hanem bumm, vissza a HUB-ba, kezdheted elölről..."

**Mérés:** a menü mind a 28 alpontját végigkattintottuk, két mélységben (az alpontokon belüli gombokkal együtt). A gombos bezárás mindenhol a menübe tért vissza. A hiba a **telefon vissza-gesztusánál** volt (`gameBackStep`):
- **Hiányzó rétegek:** a Ládák, a Meccserő-bontás / Presetek, az Ifiakadémia, valamint a Menedzsment, a Hangsúly, az Edző és a Csapatszerepek választója nem szerepelt a vissza-rétegek között. A gesztus ezért nyitva hagyta az ablakot, és helyette a **menü fülét** csukta be: a lap elugrott, a menüpont eltűnt.
- **Felirat:** a „← Vissza a menübe” nyíllal kezdődik, ezért nem illett a vissza-feliratra. A gesztus így a „Vissza a HUB-ba” gombot kereste.
- **Klub arculata:** itt a gesztus a „Vissza a névből sorsolt párra” gombot nyomta meg, vagyis visszaállította a klubszíneket.

**Javítás:**
- a hiányzó ablakok bekerültek a rétegek közé;
- a menüből nyílt aloldalon a gesztus a „Vissza a menübe” gombot nyomja;
- a vissza-felirat elfogadja a nyilat, de a „Visszaállítás…” és a „Vissza a névből…” nem számít visszalépésnek;
- egy listán nem szereplő, de nyitott HUB-aloldal vagy párbeszéd-ablak a fül becsukása előtt a saját visszalépő gombjával zárul. Így egy később felvett ablak sem esik ki.

## Kihívások gomb teljes szélességben
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzbrugjb7rm):** „Eltüntettük az öltöző gombot a kihívás gomb mellől de nem húztuk ki a kihívás gombot teljes szélességre. Gagyi"

`#lockerBtn.hide+#challengeViewBtn{grid-column:1/-1}`

## Scout-felfedezett leigazolása: igazolás-jelenet
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzc2q8fjsm8):** „A scout felfedezettek leigazolásakor is legyen az a menő animáció amivel megkapjuk a játékost (kártyával mindennel)"

- A felfedezett játékos ingyenes leigazolása (`scoutFreeSign`) nem a `markArrived`-on megy át, mert az a vásárlás könyvelését is vinné. Ezért a jelenetet itt külön kérjük: `igazJelenetSorba(p,{forras:"🔍 Felfedezett játékos — ingyen"})`.
- A jutalom-felfedezés (`unlockRandomPlayer`) saját felugrót kap, oda nem kell.

## Próba
`tools/jegyzetek-1-0-12-18-01-proba.js`: 8/8.
1. minden szereplő útja időrendben halad;
2. blokk: a védő a lövő előtt, ≥ 0,8 m;
3. öngól nekünk;
4. öngól ellenünk;
5. Kihívások gomb;
6. scout-igazolás jelenet;
7. a menü 21 alpontja, gombbal és vissza-gesztussal felváltva;
8. nincs oldalhiba.

A `szitalos-menu-korai-1-0-12-16-02` próba 1. pontja az új (régi) Szitálóst méri: egy kapu mögötti felvétel, a labda 0,25–0,7 mp-ig repül.

---

# 1.0.12.18.02 — hat új jegyzet: menü (dokk, védőháló, napló), büdzsé, kupa-kihívás, Száguldás, szöglet-gól

## Menü: dokk menü-módban rejtve, védőháló, napló
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwzf2h7v8ypc):** „Csapatépítés menüponton belül ha megnyitom a cuccokat, és utána bezárom, majdnem mind visszadob a HUBba továbbra is. Nem ezt kéne! 10x alkalommal javítjuk. Bezárom és ott találom magam, ahol megnyitottam az imént azt az almenupotnot. Edző esetében pl. menü, csapatépítés. Ahol meg lehet nyitni azt az almenut. Nagyon idegesítő"
**KIMONDOTT KÉRÉS (🐞 jegyzet jmx03zjtt3oqf):** „Klub arculata menupontbol akár mentéssel, akár x-szel lélek ki, a HUBba dob, nem a menübe vissza. Stadionnál pedig csak az x-szel ugrik a HUBba a menü helyett"

**Mérés.** A menü minden alpontját végigpróbáltuk, minden bezáró gombbal (✕, Bezárás, Mentés, Mégse, Vissza a menübe), a következő feltételek mellett:
- telefon-emulációval, valódi koppintással;
- a Kezdő út „zárás” szakaszában;
- valódi mentéssel (`saveGame`).

Mindegyik a menübe tért vissza. Egy valódi hibát találtunk: a navigációs dokk („← Vissza a szezonhoz”) menü-módban is látszott, és rálógott a menülista alsó pontjaira. Valódi koppintással a dokkot találta el, és kivitt a menüből.

**Javítás:**
- **Dokk:** menü-módban nincs navigációs dokk; a menünek megvannak a saját kijáratai.
- **Védőháló:** ha a menüt nem a felhasználó hagyta el, hanem a HUB egy pillanatra eltűnt (a menü-állapot ezért elfelejtődött), és 6 mp-en belül a HUB-ra érkezünk vissza, a menü visszaáll a nyitott füllel és a görgetéssel együtt. A saját kilépés (menü becsukása, „Vissza a HUB-ba”) után nem áll vissza.
- **Napló:** minden menü-elhagyás (kilépés, becsukás, „elhagy:<látható képernyők>”, visszaállítás) a hívó függvénnyel együtt a 🐞 jegyzet helyébe kerül (`hely.menuNaplo`, az utolsó 8). Ha a kidobás ezek után is előjön, a következő jegyzetből pontosan látszik, ki tette.

## Büdzsé: nem csúszik el a kijelző
**KIMONDOTT KÉRÉS (🐞 jegyzet jmx04ehoy8cip):** „Ha a büdzsé részt lenyitjuk, akkor elcsúszik az egész kijelző, mert túlfutón vannak szövegrészek. Javítsuk."

- **Az ok:**
  - a sor értéke (`b`) nem törhetett (`white-space:nowrap`);
  - a címke (`span`) nem zsugorodhatott a leghosszabb szava alá (flex `min-width:auto`);
  - egy hosszú érték (pl. „142% (a plafon fölött — plafon 125%)”) vagy egy hosszú forrás-sor ezért kitolta a sort.
- **Mérve 375 px-en:** a lap 649 px-re szélesedett.
- **Most:**
  - a címke zsugorodik és tördel;
  - a hosszú érték is tördelhető (jobbra zárva, legfeljebb a sor 64%-a);
  - a doboz soha nem szélesebb a helyénél (375 → 375).

## Kupa-kihívás: azonnal, nem egy fordulóval később
**KIMONDOTT KÉRÉS (🐞 jegyzet jmx03uqmkjva9):** „1 fordulóval később kapjuk meg a kupában a jutalmat bizonyos kihívásokért. Pl. 10 gólos különbséggel kellett nyerni egy párharcot"

- **Az ok:**
  - a kihívásokat a **lefújás** értékeli (`chAfterMatchBook`);
  - a párharc összesítése (`k:"tie"`) viszont csak utána, a kupa-nézetre lépéskor kerül a naplóba;
  - a következő kiértékelés így csak a következő meccs után jött.
- **Most** a párharc lezárásakor és a csoportkör végén azonnal lefut a beváltás (`settleEarlyChallenges`).

## Száguldás: széles totál
**KIMONDOTT KÉRÉS (🐞 jegyzet jmx03szue53hq):** „Száguldás gólnál nem igazán látszik, mi történik. Legyen távolabbi kamerával véve az egész, hogy látsszanak a játékosok a szélén, akik adogatnak"

- **Az ok:** a két szélső 50 m-re van egymástól, a 22 m-es kivágás eddig kiejtette őket.
- **Most** a vágás saját irányt (`V.d`) és saját legnagyobb távolságot (`V.tav`) kaphat. A Száguldás nyitó felvétele egy magas, oldalról vett totál (legfeljebb 70 m-ről): mindkét szélső, a két átadás és a középen rohanó befejező is a képen van. A lövés előtt egy közelebbi, mögüli kép jön.

## Beadásos fejes vs. szöglet-gól
**KIMONDOTT KÉRÉS (🐞 jegyzet jmx0447hddba4):** „Van az a gol, amikor elhúz a szélén a játékos, aztán beadja és valaki közepén befejeli. Ez tök szuper, de A feed kommentár ezeknél mindig szögletet közvetít. Legyen az, hogy az ilyen gólok felé maradjon meg animáció szintén ugyanilyen, csak A feed legyen hozzaigazitva, azaz legyen az mondva, hogy valaki a szélén elhúzott, beadta és befejelte egy másik, a másik felében az eseteknek pedig maradjon A feed szöveg, és az animációt kell megcsinálni a szögletre (ami már meg van, csak eddig abból csak olyan volt, amikor felszabadított a védő)"

- **A fejes gólok fele:** „<beadó> ELHÚZOTT A SZÉLEN, BEADTA — FEJJEL! GÓL!”.
  - A sorból `alt:"fejes"` lesz, ami a szélen elhúzós beadás-jelenetet kapja.
  - Ha a gólpasszt a kijelölt szögletrúgó adja, mindig a szöglet-változat jön.
- **A másik fele:** „SZÖGLET UTÁN, FEJJEL! GÓL!”.
  - A sorból `alt:"szogletfej"` lesz, ami a **szöglet-felvezetést** kapja: rúgó a zászlónál, beívelés, fejes a hálóba. Eddig ebből csak a tisztázás létezett.
  - A 2D jelenet ugyanúgy fejes marad.
- **A statisztika** (szöglet-gólok száma) nem változik.

## Próba
`tools/jegyzetek-1-0-12-18-02-proba.js`: 8/8.
1. dokk a menüben / a HUB-on;
2. védőháló (és a saját kilépés után nem áll vissza);
3. menü-napló a 🐞 helyben;
4. büdzsé 375 px-en, hosszú sorral;
5. a kupa-kihívás azonnal (`tie` → beváltás, +8);
6. Száguldás totál;
7. a két fejes-sor és a két jelenet;
8. nincs oldalhiba.
