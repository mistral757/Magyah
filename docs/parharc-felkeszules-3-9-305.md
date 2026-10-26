# ⚔ Párharc-felkészülés és részletes ellenfél-elemzés (3.9.305)

## A kérés

> „Legyen felkészülés a PvP egymás elleni meccsei előtt is. És ott is legyen
> lehetőség elemzést kérni az edzőtől. És itt az ellenfél elemzés legyen
> részletesebb."

## A felkészülés

A párharc kezdőrúgás-gombja (bajnoki és kupa-párharcnál is) két lépésben megy,
mint minden más meccsen:

1. **🔍 Felkészülés — ⚔ párharc, 15. forduló.** A párharc még **nem**
   indul. A két gép kicseréli a **friss csapatlapját** a szoba csatornáján
   (`dp:<párharc-kulcs>`). A napló kimondja:
   * kivel játszol;
   * honnan van a lap;
   * a két ⚡-t, a felállást, a taktikát;
   * a legerősebb emberét.
2. **⚔ PÁRHARC.** Innen a megszokott út fut tovább: a cseretervező, majd a
   közös szimuláció.

**Ha a társ gépe még nem tette fel a lapját,** a legutóbbi párharc befagyasztott
lapja vagy a szezon eleji lap a forrás, és a napló ezt is kimondja. Az edzői
elemzés kérésekor a csere újra lefut, így ott már a friss lap szerepel, ha
közben megérkezett.

**A csapatlap bővítése** (`ext`, a régi kliens nem olvassa; a fogadó oldal
hosszra és sávra vágja):

* csapatstílus;
* tartós forma (📈);
* morál;
* a csúcsformában és a mélyponton lévő emberek;
* a figyelemre méltó skillek (gól, gólpassz, védekezés, aura, Rating);
* a kiürített közép ára.

## Az edzői elemzés párharcban

* **Az esélyek** a társ **⚡ meccs-erejével** számolnak, ⚖ nélkül (a társ nem
  kap rejtett kiegyenlítést). A pálya a közös szimuláció szabálya szerint
  alakul: hazai, idegen vagy semleges.
* **A részletes ellenfél-blokk** („⚔ A párharc ellenfele”) pont nélkül is jár:
  * **a forrás:** friss lap, a legutóbbi párharc lapja vagy a szezon eleji lap;
  * **a két csapat egymás mellett:**
    * ⚡ meccs-erő, kezdő tizenegy, keret (top 14);
    * felállás, taktika (és hogy hat-e már);
    * csapatstílus, tartós forma, morál, kapitány;
    * menedzser-archetípus;
  * **az ő legerősebb három és leggyengébb két embere,** posztal és
    erővel;
  * **csúcsformában és mélyponton** lévő embere;
  * **a skilljei,** amikre figyelni kell;
  * ha nála **kiürített a közép,** az is;
  * **a sorok párharca:**
    * a támadósorod az ő védelme ellen;
    * a középpályád az övé ellen;
    * a védelmed az ő támadói ellen;
  * **egymás ellen eddig:** az utolsó párharcok eredménye és a mérleg.
* **Az 🕵️ Az ellenfél irány pontjai** ezt mélyítik:
  * 1 pont: az ő teljes kezdő tizenegye;
  * 2 pont: több skill;
  * 3 pont: „ahol a meccs eldőlhet” — a leggyengébb sorod ellene.

## Próba

`tools/parharc-felkeszules-3-9-305-proba.js`, két lap a játék helyi
szoba-hátterén:

* a gomb előbb „Felkészülés”;
* a felkészülés nem indít párharcot, és kicseréli a friss lapot (a bővítéssel);
* a második koppintás a párharc;
* az elemzés a társ ⚡-jával, ⚖ nélkül, a részletes ellenfél-blokkal;
* a tisztító;
* nincs oldalhiba.
