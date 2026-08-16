# Felállás-tervezés — kétirányú megbízás és soronkénti szélesség

*(3.3.19. Az érintett kód: `slotRoleOptions` / `buildSlotRoleExtra` a
megbízás-oldalon, `formLineCodes` / `buildCustomForm` / `renderFormBuilder` a
tervezőasztalon.)*

## 1. A bejelentett furcsaság

Egy saját tervezésű **5-4-1**-ben a négy középpályásból négy **szélső** lehetett
(a felállás eleve kettőt a szélre tett, a két belsőt pedig megbízással ki
lehetett küldeni), négy **belső** középpályás viszont sehogy nem jött ki. A
kiosztás egyirányú volt:

| irány | régen | most |
|---|---|---|
| belső hely → szélre | ✅ (a sor két legkülsője) | ✅ |
| szélre tervezett hely → befelé | ❌ | ✅ |
| középhátvéd → szélsővédő | ✅ (csupa KV-s védősornál) | ✅ |
| szélsővédő → középhátvéd | ❌ | ✅ |

Semmi nem indokolta az aszimmetriát: a hely mindkét állásban ugyanabba a
szerep-kategóriába tartozik (`roleInFormation`), tehát a csapat
szerep-összetétele egyik irányban sem változik — csak a poszt-kód, az
illeszkedés és a gól/gólpassz-súly.

## 2. Mi lett belőle

A megbízás **kétirányú**. Minden felállásban:

* a középpálya-sor **szélre tervezett** helye (JSZ/BSZ, ha a felállás nem
  támadóként súlyozza) behúzható VKP/KKP/TKP-ra;
* a **szélsővédő** hely (JV/BV) behúzható középhátvédnek;
* és megmarad a régi irány is: a sor két legkülső belső helye kimehet a szélre,
  a csupa középhátvédes védősor két külsője pedig szélsővédőnek.

A **támadó szélső** (4-3-3, 4-2-3-1, 3-4-3, 4-2-4 elöl álló szélsői) változatlan:
ott a kérdés továbbra is „kint marad vagy árnyékék lesz" — egy támadó szélsőből
középpályást csinálni már alakzat-kérdés, nem megbízás.

**Az ára szimmetrikus, a jutalma nem.** Az alakzat ára (`teamShape`) továbbra is
csak a KIFELÉ mozdulást fizetteti meg — a befelé húzódás ingyen van, de nem is
ad bónuszt. Aki középre tervezett emberrel megy a szélre (vagy fordítva), az a
poszt-idegenséget és a más gól/gólpassz-súlyt fizeti.

A pályakép követi: a befelé húzódó hely pontja beljebb csúszik (a védőé egy
hajszállal mélyebbre is) — ugyanúgy, ahogy a szélsővédői megbízás kifelé tolja.

## 3. A tervezőasztal: soronkénti szélesség

Eddig a **sor létszáma** egyben eldöntötte a poszt-kiosztást is: négyes
középpálya = kötelezően két szélső, hármas támadósor = kötelezően két szélső.
Mostantól soronként megmondod, hogy a sor **széles** legyen-e (két szélső a két
végén) vagy **zárt** (mindenki a belső sávban):

| sor | zárt | széles |
|---|---|---|
| védelem | csupa középhátvéd | JV + középhátvédek + BV |
| középpálya | belső középpályások (VKP/KKP) | JSZ + belsők + BSZ |
| támadósor | csupa középcsatár | JSZ + középcsatár(ok) + BSZ |

Szabály egy van: **háromfős sortól** választható a szélesítés (`LINE_WIDE_MIN`) —
kettőnél a belső sáv teljesen kiürülne. Az alapértelmezés pontosan a korábbi
viselkedés, tehát egy meglévő mentés semmit nem vesz észre.

A panel **poszt-előnézetet** mutat (`KP · JV KV KV KV BV · KKP VKP VKP KKP · CS`),
és ugyanez a sor ott van a fizetés előtti megerősítésben is — 50 milliárdot nem
kell vaktában elkölteni.

**A középpályások felső határa 5 → 6**, vagyis a 3-6-1 is megtervezhető. A régi
korlát részben azért volt ott, mert a `formLineCodes` csak ötös sorig ismerte a
mintát; a függvény mostantól tetszőleges sorhosszra generál (a belső sor közepe
kapja a védekező alapértelmezést).

## 4. Amire figyelni kellett: a szélső kétféle jelentése

Egy saját tervben mostantól **egyszerre lehet széles a középpálya és a
támadósor** (pl. 3-4-3 négyes középpályával kint, és három támadóval, akikből
kettő szélső). A `WINGER_IS_ATTACKING` régi, **felállás-szintű** igaz/hamis
kapcsolója ilyenkor a középpálya szárnyát is támadónak olvasta volna.

Ezért saját felállásnál a bejegyzés mostantól a **támadó szélső helyek
index-listája** (`customAtkWingIdx`), és az `isAttackingWingSlot` ezt olvassa. Az
alap-felállásoknál marad az igaz/hamis, a régi (w nélküli) mentések pedig
pontosan a korábbi eredményt kapják vissza — a slot-sorrend kötött (kapus,
védők, középpálya, támadósor), tehát a támadósor indexei kiszámolhatók.

## 5. Amit szándékosan nem engedünk

* **Ugyanaz az alak kétszer.** A tervező továbbra sem enged olyan d-m-f
  hármast, ami már a kínálatodban van — a szélesség-variáns nem számít új
  alaknak. Nem is kell: a szélességet a megbízás ingyen átállítja.
* **Támadó szélsőből középpályás.** Az a sor átrajzolása volna, nem megbízás.
* **Hét középpályás vagy nulla csatár.** A `CUSTOM_FORM_RULES` alsó-felső
  korlátai maradnak (3-6 védő, 1-6 középpályás, 1-5 csatár, összesen 10).
