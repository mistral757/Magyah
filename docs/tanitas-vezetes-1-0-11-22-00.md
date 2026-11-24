# 🧭 A menü saját felületen, tanító célok, új animáció-alap, minden lecke vezetett — 1.0.11.22.00

> KIMONDOTT KÉRÉS: „Nem jó az, amikor a Menü megnyílik a HUB-on belül úgy, hogy nem külön felületen, hanem ugyanazon, ahol a játékosok listája is van. Ez egy bug.
> Nem jó a tanuló fázis második céljának, hogy nyerj egy meccset kapott gól nélkül. Legyen ez: rúgj egy gólt, játssz le 3 meccset. Változtasd meg a meccs tempóját. A következő céloknál is hasonlóan teljesíthető, nem a csapatod erősségén múló dolgok legyenek a célok. Tanító célok legyenek mindig.
> Az animációk alapbeállítása az legyen, hogy csak az új verzió szerinti animációk fussanak le, és legyenek kicsit lassabbak az animációk. És ne legyenek úgy lecsapva a jelenetek végei.
> És azt az elvet, amit most bevezettünk a játék elején a guide módra, azt végig vezessük át a teljes tanításra."

## 1. A menü mindig a saját felületén
A menü-mód (`#scHub.menuMode`) már létezett, de két úton nem azt nyitották:
- **A tanító réteg és a guide-túra** a menüt „beágyazva” nyitotta (`hubMenuToggle(true,true,true)`), a keretlista mellett. Ilyen volt a `teachRevealInMenu` (a „Mutasd meg”, a leckék) és a `guideOpenHubMenu` (a HUB-túra).
  - Mostantól mindkettő menü-módban nyit.
  - A túra HUB-ra horgonyzó tippje előtt a menü bezárul (`guideShowNext`).
- **A ragadó ☰ Menü gomb:** görgetés után az első koppintás csak odagörgetett, és a menü a lap közepén tűnt fel. Mostantól azonnal kinyílik, és a lap tetejére visz.

## 2. Tanító célok
Minden cél megtehető lépés: megnézni, beállítani vagy lejátszani. Az eredményhez kötött célok kikerültek (győzelem, kapott gól nélkül, zsinór, veretlenség, tabella). Egy szakaszhoz minden cél kell.

**Fontos szabály:** egy cél csak a szakasz kezdetén már nyitott (vagy mindig elérhető) funkcióra mutathat, mert a szakasz saját nyitásai a szakasz végén nyílnak.

| Szakasz | Célok |
|---|---|
| Az első tizenegy | felállás · taktika · megbízás (változatlan) |
| Az első meccsek | **rúgj egy gólt · játssz le 3 meccset · változtasd meg a meccs tempóját** (⏩ csúszka vagy ◀ ▶) |
| Fejlődés | edzésterv · összhangépítés · nézd meg egy játékosod 📈 fejlődési görbéjét |
| A csapat lelke | edző elemzése · hangsúly-csúszka · ⚡ meccserő-bontás |
| Szerencse és kockázat | csapatszerepek · kapitány · cseretervek |
| A mérleg | a büdzsé bontása · talizmánok · kihívások (Menedzsment) |
| A klub filozófiája | változatlan |
| Hosszú táv | erőmérleg · Infópult · Boost-központ árai |

- **Új meccs-cél (`meccs3`):** a szakaszban lejátszott meccseket számolja, egy `S.kut.md` objektumban, ami a mentett `S.kut` része.
- **Új jelek:** `set:tempo`, `view:curve`, `view:meccsero`, `view:roles`, `view:captain`, `view:subs`, `view:tal`, `view:mgmt`, `view:eromerleg`, `view:infopult`, `view:boost`.
  - Mindegyik a meglévő kezelőkből jön, egy közös figyelőn át: koppintás, csúszka-változás, `<details>` nyitás.

## 3. Animációk
- **Alap: Új** (csak a teljes 3D jelenet). A Mindkettő csak kifejezett választásra él (`evaKamMod30_0` = `"both"`), a Régi a kapcsolóval érhető el.
- **25%-kal lassabb** (`KAM_LASSU` = 1,25). Nem a hossz nyúlik, hanem a jelenet órája lassul. A kép a régi idővonalon fut, így a lap, a villanás és a háló remegése is arányos marad. Kifelé (a vég, a hangok, a felirat) a valódi hossz megy.
- **Nincs levágott vég** (`evaLezarLagy`): Új módban a jelenet utolsó képe kitart (`KAM_KITART_MS` = 800 ms), majd elhalványul (`KAM_HALVANY_MS` = 450 ms). A „Tovább” koppintás továbbra is azonnal zár.

## 4. Minden lecke vezetett
Ugyanaz a minta, mint „Az első tizenegy”-ben:
1. villog a ☰ Menü — vagy egy nyitott al-panelen a „← Vissza a menübe” gomb, egy teljes képernyős panelen annak visszalépő gombja;
2. villog a menüpont;
3. a megnyílt panelen a lényeges elemre mutat, élő példával a saját keretből;
4. kipróbáltatja;
5. összegzés.

| Lecke | Lépések |
|---|---|
| Edzés, összhang és a meccs | Edzésterv (fő/mellék, +2 pont/meccs, 💡 a taktikád fő tengelye és mennyit hoz +10 pont rajta) → beállítás → Összhangépítés (sávok ×1,8/×1,3) → beállítás → összegzés + a következő feladatok |
| Az átigazolás | Vétel → a scout jelöltjei (Rating vs POT példa, 💡 a kereted leggyengébb posztja) → eladás két úton → három szabály |
| A meccs számai | Meccserő-bontás (élő: csapaterő → meccserő) → bezárás → Edző → elemzés (megerősítés) → győzelmi esély → Csúszkák → kipróbálás |
| A csapat lelke | Csapatszerepek (élő: hány nincs kijelölve) → Kapitány (meccserő-hatás) → cserék és presetek |
| Szerencse és kockázat | Talizmánok → Ládák (esélyek) → Menedzsment (kihívás: jutalom ÉS büntetés, példával) |
| Erőforrás és a mezőny | Büdzsé-sáv (élő: tartalék rendben / kevés) → erőmérleg (élő szöveggel) → Boost-központ (ár, kedvezmény) → három szabály |
| Hosszú táv | Ifiakadémia → kupa → vége |

**A motor bővítése:**
- `kutMenuLepes` / `kutGombLepes`.
- `kutMenuNyitva`: a menülista tényleg látszik-e (nyitott al-panelnél nem).
- `kutKattolt`: a koppintott gomb nem nyitott semmit (pl. zárt átigazolási ablak) — a panelre mutató lépések átugrólnak.
- Egy lépés átugrik, ha a helye (`hol`) nem teljesül.
- Az összegzés bárhol olvasható.
- Modális panelen a lecke és a kiemelés a panel fölé kerül (`.modalon`, z 489/492).
- `kutLeckeJel` gyűjti a futó lecke jeleit (`kutLJ`).

## Próbák
- **Új:** `tools/tanitas-vezetes-1-0-11-22-00-proba.js`. Ezeket méri:
  - a menü három úton is a saját felületén nyílik;
  - nincs eredményhez kötött cél, és nincs zárt funkcióra mutató cél;
  - a 2. szakasz három vereséggel is teljesül;
  - animáció: az alap az Új, ×1,25, a vége kitart és elhalványul;
  - 6 lecke végigjárható a villogó elemekre koppintva;
  - nincs oldalhiba.
- **Frissítve:**
  - `kezdo-ut-motor` (a 2. szakasz új céljai);
  - `kezdo-ut-leckek` (vezetett leckék, a dinamikus panelgombok, a sáv-mód a menü-lépésnél);
  - `eromerleg` (a lecke szövege függvény lehet);
  - `kamerak` (a Mindkettőt kifejezetten beállítja);
  - `jelenet3d` (a felirat-mintavétel a lassítással).
- **Zöld:** kezdes-vezetes, kezdo-ut-zaro, kezdo-ut-csiszolas, stilus-osszeveto, felvezetok, és a 12 régi jelenetpróba.
