# 3.9.175 — PvP dupla meccs, keret-hangolás, kupák ereje, értesítések, Joker

## 1. ⚔ PvP: egy párharc, egy lejátszás

> „Amikor elmentem a felállásom, kilépek, visszalépek, és elindulna egyből a
> meccs, akkor néha visszadob meccskezdés előttre és megint tudom setupolni a
> csapatom […] és aztán ha elkezdem a meccset, akkor dupla feeddel megy le a
> meccs. Minden eseményt két különböző módon jelent a kommentátor."

### Mi történt

A hibának három oka volt, és mind ugyanoda vezetett: egy párharc **két
példányban** futott le, két motorral. A közvetítés így minden eseményt kétszer
mondott be, kétféle szöveggel, és a két motor ugyanabba az eredményjelzőbe és
tabellába írt.

1. **Kupa-párharcba visszatérve rossz képernyő maradt elöl.**
   * A betöltés a kupa-képernyőt nyitotta meg, élesített Kezdőrúgással és
     HUB-gombbal.
   * A párharc közben a háttérben, a rejtett közvetítés-képernyőn indult el.
   * Ez volt a „visszadob meccskezdés előttre”: a csapat újra beállítható
     volt.
   * A kupa Kezdőrúgásának nem volt „meccs fut” zára, ezért egy második
     lejátszást indított.
   * Az oda-vissza vágó mindkét fordulója ezért ment tönkre: mindkettő ezen
     az úton indult.
2. **A beragadás-figyelő a hálózati várakozást is beragadásnak látta.**
   * Egy második indítás ilyenkor újraindította a csere-kört.
   * A régi kör a következő ellenőrzésén tovább élt, mert a „foglalt” jelző
     közben megint igaz lett.
   * Két csere-kör futott, és mindkettő elindította a meccset.
3. **Az elköteleződés már a kezdőrúgáskor törlődött.**
   * Ha a meccs közben léptél ki, visszatérve a Kezdőrúgás és a HUB várt.
   * A keret így átrendezhető volt egy már eldőlt meccs alatt.

### A javítás

* **Egyetlen élő folyamat.**
  * Minden csere-kör saját sorszámot kap.
  * Az új indítás és a kilépés érvényteleníti a régit, ami a következő
    ellenőrzésén csendben leáll.
  * Beragadtnak csak az számít, ami 20 másodperce nem mozdult.
* **Egy párharc, egy lejátszás.**
  * Futó meccs mellé nem indul második: sem a kupa, sem a bajnoki
    Kezdőrúgás, sem egy újabb csere-kör, sem a `playMatch` nem indít.
  * Ugyanaz a párharc egy munkamenetben csak egyszer indul el.
* **A kupa-párharc is a közvetítés-képernyőn folytatódik**, a kupa-képernyő
  nem marad elöl.
* **Az elköteleződés a lefújásig él.** Meccs közben kilépve a visszatérés
  egyenesen a párharcba visz. A meccs elölről, ugyanazzal a közös
  eseménylistával játszódik le, ezért ugyanaz az eredmény jön ki. Nincs
  Kezdőrúgás és nincs HUB.

**Próba:** `tools/pvp-dupla-meccs-proba.js`, 15 állítás. A javítás előtti
kódon elbukik: futó párharc mellé három további motor indult.

## 2. ⚖ PvP keret-hangolás: a nyers erő 3%-a

> „Nem működik a keretek hangolása PvP módban, mert max ±2-re állítottuk.
> Legyen 100-as nyers erejű keretektől max ±3%, és akkor egy 170-es keretnél
> ez ±5,1 is lehet."

* **A névre szóló plafon** a saját keret nyers erejének 3%-a. A nyers erő a
  14 legjobb játékos átlaga, a PvP-hangolás nélkül.
  * Példák: 100 → ±3, 150 → ±4,5, 170 → ±5,1.
* **A plafon a hangolás pillanatában rögzül** (`S.mpTuneCap`), és a mentés
  viszi.
  * A kiolvasás (a játékos kijelzett és meccsen érvényes értékelése) ezt
    használja, nem számol újra.
* **Régi mentésben** az első új hangolásig a régi ±2 marad. Utána a tárolt
  eltolások az új plafonig nőhetnek.
* **A felület** (a napló és a döntés-képernyő) a tényleges plafont írja ki:
  „játékosonként legfeljebb ±5,1, a keret nyers erejének 3%-a”.

## 3. 🏆 A kupák ereje: Nyári Kupa + sorozatsáv

> „Ahogyan most van a nyári kupa ereje számítva, azt kéne alapul venni. […]
> MK +0/−6, FA +1/−5, KL +1/−4, EL +2/−3, BL +2/−2 erősséget kaphat max a NyK
> számítással kapott mezőny erőhöz képest a súlyozás által."

### A bázis

A bázis a Nyári Kupa mezőnye: a nevezési meccs-erőd mínusz egy, a motor által
ráadott rejtett előny felét levonva. A pályán ez „magadhoz mért, egy
hajszálnyival könnyebb” mezőny.

### A súlyozás

A súlyozás azt nézi, mennyivel erősebb vagy gyengébb nálad a **vonatkoztatási
mezőny**, ugyanazon a névleges skálán. Ez a különbség, ±6 pont között
lineárisan, jelöli ki a helyet a sorozat sávjában. A vonatkoztatási mezőny:

* a bajnokságod mostani mezőnye, a fordulónkénti fejlődéssel;
* a **KK-nál** a piramis élvonala (D1).

| sorozat | sáv a Nyári Kupához képest | egyenrangú mezőnynél |
|---|---|---|
| Magor Kupája (MK) | −6 … +0 | −3 |
| Fából Készült Serleg (FA) | −5 … +1 | −2 |
| Konföranszié (KL) | −4 … +1 | −1,5 |
| Ojrópai (EL) | −3 … +2 | −0,5 |
| Kupák Kupája (KK/BL) | −2 … +2 | 0 |

* Ha a mezőnyöd **jóval gyengébb** nálad, minden sorozat a sávja **alján** áll.
* Ha **jóval erősebb**, a **tetején**.
* A sorozatok rangsora minden helyzetben megmarad.

### Ami kikerült

A **tempó-horgony** és a KK **D1+2-es padlója** kikerült, mert mindkettő a
sávon túlra vihette volna a mezőnyt. Példa: egy D4-es csapat KK-mezőnye eddig
D1+2 volt (85), most a Nyári Kupa + 2 (76).

### A közös (PvP) kupa

* Ugyanez a szabály, az erősebb keret meccs-erejéből.
* A rejtett bónusz és a fordulónkénti fejlődés kimarad, mert kliensenként
  eltérhet. Így a mezőny a két gépen bitre azonos.
* A vonatkoztatási mezőny a közös horgony (a piramisban az élvonal).

A Hiper Szuper Kupa (D0 és fölötte) és maga a Nyári Kupa változatlan.

## 4. 🔔 Értesítések ki/be — Beállítások

> „A beállítások menübe legyen ott egy értesítések ki-be kapcsolás opció."

**⚙ Beállítások → 🔔 Értesítések**: egy kapcsoló mindhárom csatornára.

| csatorna | bekapcsolva | kikapcsolva |
|---|---|---|
| a vezetés felugró emlékeztetői (3.9.172) | szólnak | nem szólnak |
| a társ jelzése PvP-ben | beúszó sáv | csendben a naplóba kerül („🔕 … jelzett: vár rád”) |
| készülék-értesítés (Web Push) | ha a társad megbök | a készülék leiratkozik, a feliratkozás a szobából is törlődik |

* A beállítás **eszközre szól**, mint a hang.
* Alatta a készülék-értesítés állapota áll, emberi nyelven: bekapcsolva,
  letiltva, ezen a platformon nem elérhető (és mi a teendő).
* A PvP várakozó képernyő „🔔 bekapcsolom” gombja a főkapcsolót is
  visszakapcsolja.
* A Vezetés-panel saját push-kapcsolója megmarad: az csak az emlékeztetőkre
  hat, ez mindenre.

## 5. 🃏 Joker színhűség: az új események esélye

> „A Joker talizmánt halmozónak a set bónusz adja azt is, hogy az átigazolási
> események között egyre nagyobb esélyt kapnak az új események, azon belül is
> a pozitívak."

A Joker színhűség-fokozata (3/5/8 lap) a Joker-csomagokkal bekerült, **új**
átigazolási események súlyát szorozza:

| fokozat | jó új esemény | rossz új esemény |
|---|---|---|
| ◆ (3 lap) | ×1,25 | ×1,10 |
| ◆◆ (5 lap) | ×1,55 | ×1,20 |
| ◆◆◆ (8 lap) | ×2,00 | ×1,35 |

* A sáv régi tételei (csendes ablak, igazolás, elvágyódás) nem változnak. A
  pakli így egyre inkább a saját eseményeidből áll, és egyre inkább a
  jókból.
* A talizmán-hatások listája, a Rezonancia-panel és a fokozat-bejelentés is
  kiírja.
* A szótár talizmán-szócikke is kiegészült.

## Próbák

* `tools/pvp-dupla-meccs-proba.js`: 15 állítás.
* `tools/valtozasok-3-9-175-proba.js`: 25 állítás.
* Az új szabályhoz igazítva: `kupa-meccsero-proba` (a fölény a pályán mérve,
  a sáv alja) és `pyr-szuperliga-proba` (a KK a sávja tetején és alján).
