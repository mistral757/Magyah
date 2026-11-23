# 1.0.11.11.00 — Szezonkártyák: kártyapont, díjak, −25%-os küszöbök

## Kérés
> bele kéne számítani sokkal inkább a teljesítményeket, egyéni díjakat, és a skálán legalább
> 25%ot könnyíteni kellene a szezonkártyák megszerzéséhez. Jelenleg irreálisan magas
> teljesítmény kell a gyilkos fölötti szintekhez. Gyakorlatilag egyedül az ultra erős sztár
> képes elérni ilyet.

## Ami volt
Négy külön mérce volt: gól+gólpassz, meccs embere, bravúr és tiszta lap. A kártyához az
egyiknek egyedül kellett átlépnie a küszöböt. A gólok a keretben egy-két emberre
összpontosulnak, így a Gyilkos fölé csak a sztár jutott. A meccs-osztályzatok és az egyéni
díjak sehol nem számítottak.

## Ami lett: a kártyapont (KP)
Egy közös szám, gól+gólpassz-egységben. Három részből áll.

1. **Teljesítmény** — meccsre vetítve, a tempó-szorzóval, ahogy eddig is.

   | Tétel | Pont |
   |---|---|
   | gól | 1 |
   | gólpassz | 0,85 |
   | meccs embere | 1 |
   | bravúr | 0,15 |
   | tiszta lap, kapus | 1,2 |
   | tiszta lap, hátsó sor | 0,8 |

2. **Meccs-osztályzatok** (a meccs utáni értékelés, `pStat`) — minden meccs pontot ér a fokozata szerint:

   | Fokozat | Pont |
   |---|---|
   | kiemelkedő | +0,5 |
   | rendkívüli | +1 |
   | fergeteges | +1,6 |
   | tökéletes | +2,2 |
   | felfoghatatlan | +3 |

   Ezt is meccsre vetítjük. Ez látja a középpályás, a védő és a kapus munkáját is.

3. **Egyéni díjak és címek** — egyszeri pontok, nem vetítve:

   | Díj | Pont |
   |---|---|
   | Aranylabda | +12 |
   | bajnoki gólkirály / gólpassz-király / kapuskirály | +7 |
   | kupa egyéni arany-díja | +6 |
   | bajnoki cím, kupagyőzelem (aki legalább 10 meccset játszott) | +3 / +3 |

### Küszöbök (a régi gól+gólpassz-sor 75%-a)
| ezüst | arany | gyémánt | Stellar | Mítikus | Gyilkos | Vadista szandál | GODLIKE |
|---|---|---|---|---|---|---|---|
| 3 | 7,5 | 13,5 | 19 | 24 | 30 | 39 | 51 |

- **A régi egy-mércés utak megmaradnak**, szintén −25%-kal: meccs embere, bravúr és tiszta lap. Így senkinek nem lett nehezebb.
- **A kvóták változatlanok:**
  - GODLIKE, Vadista szandál, Gyilkos és Mítikus: idényenként 1-1;
  - Stellar: 2;
  - gyémánt: a legjobb három gyémánt alatti játékosnak 13,5-től, bárkinek 19-től.
- **A rangsor** (ki kapja a kvótás szinteket) a kártyapont szerint megy.

### Megjelenés
- **A kártyán:** az egyéni díjak arany csipként, alatta a kártyapont és az osztályzatokból jött része.
- **A Fénykor próbaideje** („ezüst-szintű idény”) ugyanezt a mércét használja.
- **Az Infópult** súgója az új szabályt írja le.

## Próba
`tools/kartyapont-1-0-11-11-00-proba.js` — küszöbök, egy csatár és egy osztályzat-erős középpályás,
díjak, kvóták, és egy valódi, végigjátszott idény régi → új eloszlása.

Egy mérés a próbacsapattal:
- a kapus Mítikusról Vadista szandálra lépett;
- két játékos ezüstről, illetve semmiről aranyra;
- senki nem kapott rosszabbat.
