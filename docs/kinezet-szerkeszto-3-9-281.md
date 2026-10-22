# 🎨 Kinézet-szerkesztő és fotóelemző (3.9.281)

> „Építsük be a játékosok profilját szerkesztő felületet, hogy globálisan is,
> és aktuális karrierben is lehessen szerkeszteni a játékosok kinézetét. (A
> globálist a beállításokban lehetne, ahol a játékosok neveit is lehet
> módosítani.) És ha nem túl bonyolult, akkor lehetne ebbe beépíteni egy
> olyan motort, ami egy feltöltött fényképen felismeri az arcot és legenerálja
> az alapján a saját játékoskarakterizálónkkal a kinézetet."

## Két réteg

| réteg | hol szerkeszthető | hol tárolódik | hatóköre |
|---|---|---|---|
| **globális** | Beállítások → 📊 Adatbázis → **🎨 Kinézet** fül (ugyanott, ahol a nevek átírása) | a böngésző (`localStorage`, `faceMod30_0`) — a mentésnek nem része | minden karrier, gyorsmeccs |
| **karrier** | a játékos-adatlap arcképe alatti **🎨** gomb | a mentés (`S.faceMod`) | csak az adott karrier |

A karrier rétege **mezőnként** ül rá a globálisra, az pedig a generált arcra.
Amit nem írsz felül, az a név magjából jön, és a kor továbbra is őszít és
ritkít — hacsak ezt is rögzíted („a kora szerint" / nincs / őszülő / ősz).
Az adatlapról nyitott szerkesztőben a két réteg között váltani is lehet.

A felülírás a `faceTraits` végén hat (`faceModAlkalmaz`), ezért minden arckép
— az adatlap, a pixeles változat, az esemény-jelenetek figurái — ugyanazt
látja. A gyorsítótár kulcsa a felülírás lenyomatát is tartalmazza, mentéskor
pedig ürül.

### A szerkeszthető vonások (16)

Bőrtónus · hajszín · frizura (19 féle) · őszülés · hajvonal · arcszőrzet ·
szemszín · szemforma · szemöldök · orr · száj · arcforma (keskeny / átlagos /
széles) · fejpánt · fülbevaló · szeplő · ragtapasz.

Minden sor léptethető (‹ ›), a felülírt sor arany keretes, a ↺ visszaállítja.
Gombok: **📷 Fotóból**, **🎲 Véletlen** (a bőrtónust és a korfüggő vonásokat
nem bántja), **↺ Eredeti** (a réteg kiürítése), **Mégse**, **Mentés**. Élő
előnézet sima és pixeles változatban.

## Fotóból

A kép **a böngészőben marad**: sehova nem kerül el, és nem is tároljuk —
csak a belőle becsült vonásokat, és azokat is csak a „Átvétel a fotóról" után.

1. **Az arc helye:** a böngésző saját arcfelismerője (`FaceDetector`), ahol
   elérhető; máshol egy bőrszín-alapú kereső (YCbCr-szabály, a bőrszínű
   képpontok sűrűjének befoglaló kerete). A sárga keret húzható, a mérete
   állítható; a két szaggatott vonal a szem és a száj magassága.
2. **A becslés a keretből:**
   * bőrtónus — a két pofa mediánja, a 10 fokú skála legközelebbi foka;
   * haj — a homlok fölötti sáv: ha bőrszínű → kopasz; ha a háttér látszik →
     gépi vágás; különben a színe (az ősz hajat is felismeri), a magassága
     (gépi / rövid / bokor / afro / magas tető), oldalt lelógó haj → hosszú,
     homlokba hulló → frufru;
   * arcszőrzet — az áll, az állkapocs és a felső ajak sötétedése a pofához
     képest (borosta, rövid szakáll, körszakáll, kecskeszakáll, bajusz);
   * szemszín — a két szem legsötétebb képpontjainak árnyalata;
   * arcforma — a keret szélesség/magasság aránya.
3. **Átvétel:** a becsült vonások a vázlatba kerülnek, és onnan mind tovább
   állítható.

Ez becslés, nem arcfelismerés a szó gépi tanulásos értelmében — külső
könyvtár és hálózat nélkül fut, ezért gyors és privát, de egy rossz
megvilágítású vagy oldalról készült fotón tévedhet. Mérve a saját generált
arcainkon (`tools/kinezet-3-9-281-proba.js`, 5. pont): bőrtónus ±1 fokon
belül 6/6, hajszín 5/5, a kopasz kopasz, a hosszú haj hosszú, az afró magas,
arcszőrzet van/nincs 5/6 (a világosszőke szakállat nem látja), a tartalék
arckereső 6/6-szor megtalálja az arcot.

## Javítás: a stadion a mentésben

A szerkesztő karrier-rétegének mentésekor derült ki: a mentés mezőnként
felsorolja az `S` tartalmát, és az `S.stadion` (férőhely, merch-szint, a
kereslet emlékezete, a 3.9.280-as nézőszám-napló) **3.9.264 óta kimaradt**.
Újratöltéskor a `stadionState` a tábor méretéből építette újra — a megvett
bővítések és merch-szintek elvesztek. Most a mentés része
(`tools/stadion-merch-3-9-264-proba.js`, 12. pont: mentés → betöltés →
ugyanaz).
