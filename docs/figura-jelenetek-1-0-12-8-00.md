# 🎬🧍 Figurás jelenetek és a tétlen játékosok — 1.0.12.8.00

**KIMONDOTT KÉRÉS:**
> „Animációkat, amiket készítettél eddig a menüpontokhoz folytathatod, ezek eddig jók. Az edzős az kicsit furi.
> Lehetne kidolgozottabb, jobban hasonlítson a meccs minőségre, és látszódhat, hogy konkrétan a mi egyik
> játékosunk van ott. Az infópultnál a karakter háttere ne legyen ott mint egy ablak, hanem legyen background
> nélküli, kivágott forma.
> Ötlet: Idle állapotban ne a kis dekázó kisfiú jöjjön be, hanem valamelyik játékosunk/játékosaink, ugyanígy
> background nélkül, azaz kivágott figuraként. Lehet olyan, hogy a játékosunk dekázik, labdát vezet, elrúgja a
> labdát a képernyő egyik oldalától a másikig. Csak megáll közepén és mond valamit nekünk (Mester! A következő
> meccsen remélem kezdő leszek! stb.) vagy egy társával együtt tűnik fel, és a köztük lévő kapcsolatnak
> megfelelően, vagy a tulajdonságaiktól függően, vagy az öltözőbeli legutóbbi események fényében lemegy köztük
> valamilyen interakció."

## A figura: ugyanaz, mint a meccsjeleneteké
A jelenetsáv (1.0.12.4.00) szereplői eddig portrék voltak, négyzetes háttérrel. Mostantól a meccsjelenetek figuráit használják (`jsavFigura` → `evaFig` + `evaFigura`):
- a játékos saját arca, kivágva (`bg:false`);
- mezes test a klub aktuális mezében (`kitForNow`), mezszámmal;
- a talpánál árnyék.

Az edző és a stábtagok melegítőben jelennek meg (sötét alap a klub színével). A mozgás WAAPI, a jelenet saját `anim` horgából indul (`jsavMutat` → `J.anim(el)`), ugyanúgy, mint a meccsjeleneteknél.

## A jelenetsáv jelenetei

| Felület | Jelenet |
|---|---|
| 🏢 Infópult | A recepciós **kivágott mellkép**, háttér nélkül, a pult mögött (fehér ing, a klub színe). |
| 🏋️ Edzésterv | **Újraírva.** Edzőpálya a klub lelátójával, bójasor, kapu. A **mi kezdőink egyike** labdával szlalomozik a bóják között: billeg, a labda gurul és forog. Ha van edzésterv, a fő edzés csoportjából választ játékost. Az edző sípol. A buborék a játékos nevét mondja. |
| 🛒 Vásárlás | A scout kivágott mellképe. |
| 📅 Menetrend | Változatlan. |
| 👑 Kapitányváltás | **Új.** Esti stadion, vakuk. **A valódi kapitány** középen, sárga karszalaggal, mellette két társ. A buborékban a neve és a meccserő-hatása. |
| 📋 Taktika | **Új.** Öltöző, taktikai tábla a **mostani felállással** (a sorok pöttyei lüktetnek, mozgó nyíl). Mellette az edző. A buborékban az aktív rendszer, az ismertsége és az illeszkedése. |
| 🌱 Ifiakadémia | **Új.** A keret **legfiatalabbja** dekázik az akadémia pályáján, a korával. |

## A tétlen játékosok (öltözői élet)
**Mikor jön?** Karrierben, a HUB-on, ha 20 másodpercig semmihez nem nyúlsz. Minden témában fut; a pixel témában karrierben ez váltja a 8 bites kisfiút. Két jelenet között 12 mp a szünet.

**Mikor tűnik el?** Bármilyen érintésre, billentyűre vagy görgetésre azonnal.

**Mikor nem indul?**
- ha a jelenet-kapcsoló ki van kapcsolva;
- csökkentett mozgásnál;
- nyitott tipp, felugró ablak, adatlap vagy lecke alatt;
- meccs közben.

A képernyő alján a mi játékosaink jelennek meg, kivágott meccsfigurával.

| Jelenet | Mi történik |
|---|---|
| **Egyedül szól** | Labdát vezetve beér középre, megáll, és mond valamit. Utána átrúgja a labdát a túloldalra, és utánafut. |
| **Dekázik** | Főleg a 21 év alattiak: négyszer felrúgja a labdát, közben szól hozzánk, aztán átrúgja a labdát. |
| **Páros** | Két kezdő jön szemből, és a köztük lévő összhang és a vérmérsékletük szerint alakul a jelenet (lásd lent). |

**Mit mondanak?** A játékos helyzete, jelleme és a legutóbbi események szerint:
- **cserepad:** „Mester! A következő meccsen remélem, kezdő leszek!”;
- **kapitány:** „Mester, a srácok készen állnak. A következő meccset megnyerjük!”;
- **gólszerző a legutóbbi meccsen:** „Láttad a gólomat, Mester?”;
- **győzelmi vagy nyeretlenségi sorozat:** a sorozatról szól;
- **fiatal:** „Mester, figyelje, mit gyakoroltam!”;
- **32 év fölött:** „A lábam még bírja…”;
- **forró vérmérséklet:** „…nem fogom vissza magam!”;
- **vezéregyéniség:** „…mindenki tűzben ég.”

**A páros jelenet:**
- **Összeszokottak** (összhang ≥ 47): passzolgatnak, összepacsiznak (✋), és együtt futnak le.
- **Összevesznek:** véletlenszerűen, ha idegenek (összhang < 15) vagy ha forró vérmérsékletű van köztük (összhang < 30). „Megint nem passzoltál vissza!” / „Mert lesen álltál! 🙄”, aztán két irányba mennek el.
- **Beszélgetnek:** minden más esetben. Új pár: „Majd a pályán összeszokunk!”; ismerősök: a tabella, a következő ellenfél.

**A kapcsoló:** a felületi jelenetek kapcsolója (a sáv „kikapcsolom” gombja, illetve 🛡️ A klub arculata → Animációk). A felirata most ezt is mondja.

## Próba
- **Új:** `tools/figura-jelenet-1-0-12-8-00-proba.js`, 8 ellenőrzés:
  - az edzés-jelenet meccsfigurákkal, a mi játékosunk nevével, mozgással;
  - a recepciós háttér nélkül;
  - a kapitány, taktika és akadémia jelenet (a valódi kapitány nevével);
  - a tétlen jelenet a saját játékosunkkal, a buborék a képernyőn belül;
  - a pixel kisfiú ilyenkor nem jön;
  - érintésre eltűnik, a kapcsoló kikapcsolja;
  - nincs oldalhiba.
- **Igazítva:** `jelenetsav-1-0-12-4-00` (a figura `<image>` is számít).
- **Lefutott:** `pixel-elet-3-9-204`, `tolto-1-0-7-4-00` és `csere-tolto-1-0-9-0-02` is.
