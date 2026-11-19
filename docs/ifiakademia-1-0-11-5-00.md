# 🌱 1.0.11.5.00 — Az ifiakadémia saját szintje, iránya és szakemberei

## A kérés

> „Az ifiakadémiának van már saját alpontja, de itt ne csak az eddig
> jelentkezetteket lehessen beállítani, hanem már 8. fordulótól nyíljon meg a
> lehetőség, hogy az ifiakadémiának beállítsunk különböző célokat, fókuszokat
> […] inkább gyakrabban, vagy inkább magasabb minőségben jelentkezzenek […]
> (ez fokozatosan fejlődjön az ifiakadémia fejlődésével, ami pedig
> ifiakadémia xp-kkal fejlődik majd […]), lehessen állítani, hogy felfogadjunk
> 1, 2, 3 szakembert (ingyen, de a szakemberek ereje és fejlettsége és száma
> attól függjön, mennyire fejlett az ifiakadémia) […] Ezen felül az ifisek
> POT-ját tovább kéne hangolni […] (200 fölött rendszeres, hogy 25k körüli
> POT-tal jönnek egy mezőnybe, ahol mindenki hasonlóan 200-as, de 100k fölötti
> pot van mindenkinek)"

## Hol van

HUB → Csapatépítés → 🌱 Ifiakadémia, a panel tetején. Az 1. idény 8.
fordulója után nyílik (a 2. idénytől mindig nyitva), addig 🔒 és a gyűjtött
XP látszik. Az állapot az `S.ifiAk`-ban él. Régi mentésben üresen jön létre,
és a futó karrier a következő megnyitáskor nyitva találja.

## Az XP és a szint

| forrás | XP |
|---|---|
| ⚽ minden lejátszott meccs | +1 |
| ⚽ új idény rajtja: a csapaterő növekedése az előző rajt óta | pontonként +6 |
| 🌱 felvett ifi (az akadémia tehetsége a keretbe) | +40 |
| 🎽 saját nevelésű a pályán | +2 / meccs (a játszott résszel arányosan) |
| 🎽 … gól / gólpassz / a meccs embere | +3 / +2 / +4 |
| 💰 saját nevelésű eladása | +30, és a vételár a boost-egységhez mérve még legfeljebb +70 (log-skála) |

Küszöbök: 0 · 100 · 250 · 450 · 700 · 1000 · 1400 · 1900 · 2500 · 3200 (10.
szint). Egy idény becsülve ~350–450 XP (nem mért szám), a 10. szint így
nagyjából 8 idény. A szintlépésről naplósor szól.

Szintenként a tehetségek minősége +0,025, a POT +2%.

## A beállítások

**⚖️ Gyakoriság ↔ minőség** (−3 … +3). A tartomány a szinttel nyílik: az
1–3. szinten ±1, a 4–6.-on ±2, a 7.-től ±3.

- **Gyakrabban (k fok):** a két négyes ablak közti fordulóban (4n+2) is
  jöhet tehetség, 30% · k eséllyel. Cserébe a minőség −0,05 · k, a POT
  −6% · k.
- **Jobb minőségben (k fok):** a minőség +0,10 · k, a POT +12% · k.
  Cserébe a rendes ablakban az új felfedezés 20% · k eséllyel kimarad. A
  visszatérő és a ballagó ifi soha nem marad ki.

**🧭 Poszt-fókusz** (a 2. szinttől): az új tehetség 45% + 5% · szint
eséllyel a választott posztcsoportból jön.

**👥 Szakemberek** (ingyen). Az 1. hely az 1. szinten nyílik, a 2. a 4.-en, a
3. a 7.-en. Az erejük e = 0,35 + 0,065 · szint (1. szinten 0,42, 10.-en 1,00),
a panel csillaggal mutatja.

| szakember | hatás |
|---|---|
| 📍 Poszt-edző | az új tehetség 60% · e eséllyel pontosan azon a poszton születik; a bent nevelt ilyen posztúak 30% · e-vel gyorsabban fejlődnek |
| 🎯 Képesség-edző | az új tehetség a tengelyen azonnal +(6 + 10 · e)%-ot kap (a boost útján, a tengely plafonjával), a visszatéréskor még a felét |
| ✨ Skill-mester | 35% · e eséllyel a skill posztcsoportjába húzza a tehetséget, és ha oda születik, 12% + 28% · e eséllyel készen hozza a skillt (a felvételkor kapja meg, a kész skillek útján) |
| 💎 Tehetségvadász | minőség +0,15 · e, POT +15% · e, és minden bent nevelt ifi 30% · e-vel gyorsabban fejlődik |

A bent nevelt ifik gyorsítása az `academyMatchStep`-ben ül, ezért a
🔮 előrejelzés is követi.

## Az ifi POT-ja a mezőnyhöz

**Mérve, a régi szabállyal** (200 sorsolás szintenként, Infinity):

| mezőny | medián Rating | medián POT | csúcs | a mezőny szintjének POT-ja |
|---|---|---|---|---|
| 150 | 113 | 24 700 | 125 | 54 500 |
| 200 | 139 | 58 300 | 152 | 164 200 |
| 300 | 188 | 174 200 | 203 | 631 300 |

A bejelentett ~25 000 két úton jött:

- a 150 körül született ifi POT-ja ennyi;
- a visszatéréskor a Rating a kezdő 11 szintjére ugrott, a POT viszont a
  születéskori maradt („a POT-hoz NEM nyúlunk”).

**Az új szabály, a születéskor:**

- Csak akkor hat, ha a mezőny a karrier induló szintje fölé ment
  (`acShift > 0`), vagy Infinityben. A karrier eleje bitre változatlan
  (mérve: 80-as mezőnyben ≤ 5500).
- A POT legalább annyi, amennyi a „mezőny −15 + 22 · t” csúcshoz tartozik
  (×0,95…1,05).
- t egy saját tehetség-dobás (két egyenletes eloszlású szám átlaga) plusz
  az akadémia minőség-módosítójának fele. A keret minőségét azért nem
  használja, mert az a magas szinten mindig 1-re telítődik.

**Az új szabály, a visszatéréskor:** a felhozott ifi POT-ja legalább a
felhozott csúcsához tartozó érték (`peakToPot(peak)`, a kemény plafonig).

**Mérve, az új szabállyal** (medián POT / csúcs):

| mezőny | nyitott, 1. szint | 10. szint + tehetségvadász |
|---|---|---|
| 150 | 48 600 / 146 | 75 200 / 162 |
| 200 | 152 200 / 196 | 223 600 / 218 |
| 300 | 602 300 / 296 | 859 300 / 332 |

## Próba

`tools/ifiakademia-1-0-11-5-00-proba.js`:

- a nyitás (7. forduló 🔒, a 8.-tól és a 2. idénytől nyitva);
- mind az öt XP-forrás, és hogy idegen eladása 0 XP;
- a szintlépés naplósora, a küszöbök, az irány tartománya, a helyek, az erő;
- a POT horgonya 200-on (≥ 75% a mezőnyé), és a változatlan karrier-eleje;
- az irány: kimaradás ~60%, köztes ablak ~90%, a minőség POT-előnye;
- a négy szakember, a kész skill átadása a felvételkor, és hogy 1. szinten
  csak egy hely dolgozik;
- a visszatérő ifi POT-ja;
- a panel kattintásai.

A régi akadémia-, ifi- és talizmán-próbák változatlanul zöldek.

## PvP és hardcore

A párharc közös listáját nem érinti. A közös (hardcore) karrierben az ifi
seedelt, de a két játékos beállításai eltérhetnek. Ez ugyanúgy saját döntés,
mint a scout vagy a keret, ezért az ifi ott is különbözhet.
