# Az akadémiai évek mércéje (3.9.134)

## A terv

> „…az ifiseket megéri majd az akadémián hagyni, mert 1 év után a meghívásos
> lehetőség pillanatában lévő kezdő 11 nyers erő −8…−12 rating, 2 év után
> −8…−5, 3 év után −4…−2, 4 év után pedig −1/+1 rating az, amivel felhozható,
> és közben a POT is fejlődik. […] mindig a felajánláskor vizsgáljuk meg,
> hogy milyen a POT, és mennyi az aktuális nyers ereje a kezdő 11-nek."

## Ami eddig történt

A terv nem volt megépítve. A visszatérő tehetség csak a szokásos akadémiai
görbét járta:

- meccsenként ~0,5 Rating-pont, a kor-görbe mentén;
- a kereted erejétől teljesen függetlenül.

A bejelentett esetben (piramis) egy két éve bent hagyott, 64-es fiú **77-tel**
jött vissza, miközben a legjobb 11 átlaga **100,7** volt. Az akadémián
hagyásnak így nem volt tétje.

## A szabály

A szabály minden **visszatérő** felajánlásnál és a **ballagásnál** lefut
(`academyReturnLift`).

**Mérce:** a kezdő 11 nyers ereje, a `teamStrength()`, vagyis a felállásképernyő
„Csapaterő” száma. A felajánlás pillanatában mérjük, mert a csapat közben
fejlődik.

**Sáv** az akadémián töltött évek szerint (kor − a visszaküldéskori kor):

| év | sáv a kezdő 11-hez |
|---|---|
| 1 | −12 … −8 |
| 2 | −8 … −5 |
| 3 | −4 … −2 |
| 4+ | −1 … +1 |

**Hely a sávon belül:** a POT dönti el. A viszonyítás az a POT, amelynek a
görbéje épp a kezdő 11 szintjéig ér (`peakToPot(mérce)`):

- ennek 40%-a alatt a fiú a sáv aljára kerül;
- 100%-a fölött a sáv tetejére;
- közte egyenes arányban.

**Csak felfelé:** aki a természetes fejlődésével már a cél fölött jár, az
marad. A szabály padló, nem plafon.

## A felhozott fiú további útja

A kézenfekvő megoldás, a csúcs kiszámolása a kor-görbe inverzéből, **hibás**:

- a görbe egy 16 évest a csúcsa 58%-ára tesz, tehát egy 90-re felhozott
  16 éves 155-ös csúcsot kapna;
- a szezonváltás túlteljesítés-szabálya (a különbség 30%-a a csúcsba épül)
  ezt minden nyáron tovább pumpálná.

Ehelyett két dolog történik:

- **Ifi-bónusz:** a görbe és a cél közti rés ifi-bónusz lesz (`youthBonus`,
  26 éves korig kifut). A szezonváltás ezzel már számol, így nincs
  túlteljesítés és nincs pumpa.
- **Korlátos csúcs:** a cél fölé annyival nő, amennyi a 26 éves korig
  hátralévő évekre évente **0,8** (gyenge POT) … **2,0** (erős POT) pont.

**Mérve** (2 év, 19 évesen felhozva, öt szezonváltás):

| | felhozva | öt nyár után | csúcs |
|---|---|---|---|
| gyenge POT | 82 | 87 | 88 |
| erős POT | 85 | 97 | 99 |

A Rating egyik esetben sem esik a felhozott szint alá.

## A képernyő

**A felajánlásban** egy sor mondja ki a szabályt:

> 📐 2 év az akadémián → a kezdő 11-ed nyers erejéhez (90,3) mérve −8…−5 a
> sáv; a tehetsége a sáv tetejére teszi: 84. Az akadémia 77-ről 84-re hozta
> fel.

**A napló** egy sorban rögzíti.

**A „🔮 Ha az akadémián hagyod” doboz:**

- ugyanehhez a mércéhez mér;
- a következő szezonok soraiba a következő évek sávját is beleszámolja;
- kimondja, hogy a mérce a mai kezdő 11: ha a csapatod erősödik, a cél is
  vele nő.

## Egy tudatos csere

A 3.9.52 a jóslat mércéjéül szándékosan a **legjobb 11** átlagát választotta,
mert a kezdő 11 pillanatnyilag gyengébb lehet (sérülés, forgatás). A terv
kimondottan a kezdő 11 nyers erejét nevezi meg, ezért a mérce most az. A
legjobb 11 csak tartalék, ha nincs felállás.

Ha egy felajánlás pillanatában sérülés gyengíti a kezdőt, a cél is lejjebb
kerül. A különbség kicsi, és a szabály így azt méri, amivel a fiúnak ténylegesen
versenyeznie kell.

## Próba

`tools/akademia-evek-proba.js` (24 állítás), benne egy **valódi** felajánlás a
`tryAcademyOpportunity` útján. Módosult a `tools/ifi-elorejelzes-proba.js`:
a mérce a kezdő 11, és a fokozatok neve „kezdő 11”.
