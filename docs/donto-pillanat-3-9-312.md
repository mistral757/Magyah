# 🎬📣 A döntő pillanat: gólöröm a hálónál, előtte izgalom (3.9.312)

## A kérés

> „az animációknál amikor gólt lövünk és reagál a közönség hang is és a
> játék gólhoz kapcsolódó megerősítő hangja is, az kb 1 teljes másodperccel a
> gól után jön. Legyen olyan mint a valóságban. Legyen már egy
> izgalomfokozódás a gól előtti pillanatokban, és ahogy hálót ér a labda,
> azonnal játsszuk le a gólöröm hangot."

## Miért késett

A 3.9.310 óta a közvetítés hangjai a jelenet UTÁN jönnek. Így a gól
dallama és a lelátó gólörömje csak a jelenet végén szólalt meg, a háló
megmozdulása után ~0,6–1,2 másodperccel.

## Most

### A döntő pillanat

A jelenet saját hangjegyeiből jön (`evaDontoPont`):

| esemény | döntő pillanat | ami ott szól |
|---|---|---|
| gól | a háló megmozdul | a gól hangja + a lelátó gólörömje |
| kapott gól | a háló megmozdul | a kapott gól hangja + a lelátó csalódott „óó"-ja |
| kapufa | a kapufa felvillan (fémes csendülés) | a kapufa hangja + a lelátó „úú"-ja |
| bravúr / védés | a kesztyű (ha nincs, a vetődés) | a bravúr hangja + a lelátó |

Ugyanabban a milliszekundumban szól, mint a jelenet zöreje; a mért eltérés
0–4 ms. A jelenet utáni közvetítésből ugyanez a hang **elmarad**, hogy ne
szóljon kétszer (`kozvHangKi`). A többi közvetítés-hang és a sorok
változatlanul a jelenet után jönnek.

### Az izgalom

A jelenet elejétől a döntő pillanatig fokozódó tömegzúgás szól
(`evaIzgalom`):

* sávszűrt lelátó-zaj, amelynek hangereje és hangmagassága is emelkedik;
* a döntő pillanatban a gólöröm vagy az „óóó" veszi át;
* lelátó-hang nélkül egy halkabb, szintetizált duzzadás szól.

### Átugrott jelenet

Ha a jelenetet a döntő pillanat előtt átugrod:

* az izgalom 0,15 mp alatt elhal;
* a döntő hang nem szól el;
* a közvetítés gól-hangja a rendes úton, egyszer jön a jelenet után.

### A nyilvántartás

Amit a jelenet a döntő pillanatban már elmondott, azt a közvetítés kiürítése
után elfelejtjük. Egy későbbi, jelenet nélküli gól hangja tehát ismét szól.

### Mi marad a jelenet után

A tizenegyes-, VAR- és egyéb jelenetek kimenete nem egyértelmű a mozgásból,
ezért ott a 3.9.310-es út marad: a közvetítés hangja a jelenet után szól.

## Próba

`tools/donto-pillanat-3-9-312-proba.js`, 13 állítás, a játék saját jelenet-lejátszójával:

* **gól:**
  * a döntő pillanat a háló;
  * a gól hangja a hálóval együtt szól (≤40 ms), a jelenet vége előtt;
  * az izgalom a jelenet elején indul, és pontosan a hálóig tart;
  * a közvetítés nem ismétli a gól hangját, a többi hangja (kapufa) utána jön;
* **kapott gól, kapufa, bravúr:** a saját pillanatukban, egyszer, előttük
  izgalommal;
* **átugrás a háló előtt:** semmi nem szól el, a gól-hang egyszer jön;
* **lejárat:** a nyilvántartás lejár;
* nincs oldalhiba.

Az `animacio-hang-3-9-310` próba a gól hangját már a jelenet részének
számolja (nem a közvetítés-hangok között).
