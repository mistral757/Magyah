# 📈 A kupa-mezőny is fejlődik, a bajnoki ütemmel (1.0.9.1.00)

## A kérés

> „A kupasorozat alatt is legyen ellenfél fejlődés ugyanúgy, mint liga
> szezon alatt. Mértéke, tempója ugyanaz legyen, nehézségi szinthez
> igazítva. Vigyázzunk, hogy ne legyen eszement fejlődés azért :)"

## Eddig

- **A bajnokságban** a mezőny fordulónként erősödik (`pyrGrowNow`):
  - az idény alapütemével (`pyrGrowStep`, az osztály és a nehézségi fokozat
    ütemével);
  - a téli emelés rámpájával;
  - a 4. idénytől a mért idény-gyorsulással.
- **A kupa** mezőnye viszont az induláskor befagyott, és a sorozat végéig
  egy tizedet sem nőtt.

## Mostantól

Minden lejátszott kupameccsed után a gépi kupacsapatok ugyanannyit nőnek,
amennyit a bajnoki mezőnyöd egy forduló alatt (`cupGrowStep`):

- **az idény alapüteme** (`pyrGrowStep`): ugyanaz a szám, mint a
  bajnokságban, tehát a nehézségi fokozattal és az osztállyal együtt mozog;
- **plusz az idény-gyorsulás fordulónkénti átlaga** (`nfGyorsAcc` / 30) a
  4. idénytől;
- **a téli emelés rámpája nem számít bele**: az egyszeri, idénybeli lépés,
  nem tempó.

**A fék:** legfeljebb **15 kupameccsnyi** (`CUP_GROW_MAX_MECCS`), vagyis fél
bajnoki idénynyi növekedés. Egy próbakarrierben ez kupameccsenként +0,14,
gyorsuló idényben +0,24, összesen legfeljebb ~+2,1, illetve ~+3,6. A bajnoki
idény alapnövekedése 4–7 pont.

**Kire nem vonatkozik:**

- **A te csapatod** a kupa jóvoltából nem nő.
- **A társad** (közös kupa) sem: az ő ereje az övé.
- **A háttérmeccsek** a gépi csapatok különbségét nézik (`euroLam`). Azok
  egyformán nőnek, így a közös kupa két gépe nem csúszik szét.

**Működés:**

- A számláló: `S.euro.nGrow`, ami a lejátszott kupameccseidet számolja.
- Az átszámítás: `euroOppRefresh`, mindig az érintetlen `ovrBase`-ből
  (idempotens, mint a `pyrOppRefresh`).
- Lefut a kupa-képernyő rajzolásakor és a kezdőrúgás előtt.
- A meccs-párosítás (`fixtures`) az ellenfél friss erejét viszi.

**A kupa-képernyő kiírja** a mezőny mostani ⚡-ját, az induláskorit, a
meccsenkénti ütemet, az eddigi növekedést és a féket. A „különbség a
mezőnyhöz” sor is a friss erővel számol.

## Próba

`tools/kupa-fejlodes-1-0-9-1-00-proba.js`:

- **Az ütem:**
  - kupameccsenként = a bajnoki forduló üteme;
  - a gyorsulás átlaga is benne van;
  - a nehezebb fokozattal gyorsabb.
- **A növekedés:**
  - induláskor 0;
  - N meccs után minden gépi csapat +N×ütem, többszöri frissítéssel sem
    halmoz;
  - a te csapatod nem nő;
  - a fék legfeljebb 15 meccsnyi.
- **Valódi kupameccs után:**
  - a számláló lép;
  - a következő ellenfél erősebb;
  - a képernyő kiírja.
