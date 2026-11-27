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
