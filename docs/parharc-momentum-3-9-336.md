# 📊 A párharc momentum-görbéje a közös meccsből (3.9.336)

## A bejelentés

A párharc után ezt írtad: „Nálad is így nézett ki a momentum-görbe?
Mármint fordítva ehhez képest." A társad válasza: „Nem, az enyémen főleg
nálam volt a momentum. Kb. ugyanezt láttam, csak úgy, hogy végig nálam a
momentum."

Mindketten a saját fölényeteket láttátok. Ugyanannak a meccsnek a két
képernyőn tükörképnek kell lennie.

## Az ok

Párharcban a gólokat, a cseréket és a lapokat a közös eseménylista adja, és
ez a két gépen azonos volt. Három dolog viszont a helyi számolásból jött:

* a momentum-görbe;
* a gólon kívüli helyzetek (lövés, védés, blokk, szöglet);
* a birtoklás.

Ezek a helyi `diff`/`lf`/`la` értékekből dolgoztak. Ez a számolás a te teljes
meccs-pillanatképedet (morál, edző, aura, kapitány, stílus) a társ **nyers
keret-erejével** vetette össze. Ráadásul hozzáadta a gépi ellenfeleknek szóló
rejtett erősítést is. Így mindkét gépen a saját csapat jött ki erősebbnek.

A görbe trendje párharcban ezért a helyi erőkülönbségből jött, a kilengéseit
pedig a helyben sorsolt helyzetek adták. Mindkettő a saját oldalra húzott.

## A javítás

**A közös szimuláció feljegyzi a gólvárhatóságot** (`sim.lamB`). Mind a 18
ötperces vödörben elmenti a két csapat gólvárhatóságát (λ). Pontosan azt a
számot, amiből a gólokat sorsolja, benne a cserékkel, a kiállítással, a
rákapcsolással és a szerepekkel. Véletlent nem fogyaszt, tehát az
eseménylista változatlan.

**A lejátszás ebből számol.** Párharcban vödrönként ez a közös λ áll a helyi
`lf`/`la`/`diff` helyén, a saját nézőpontodból. Ebből számol:

* a momentum-görbe trendje;
* a gólon kívüli helyzetek;
* a meccsvégi statisztika.

A két gép így ugyanabból a két számból dolgozik, csak tükörben.

**Tartalék.** Ha egy régi kliens írta a listát, vagy a szerver eldobta a
mezőt, a lejátszó gép a két pillanatképből ugyanazzal a maggal újraszámolja.
Csak akkor veszi át az eredményt, ha az ugyanarra a végeredményre jut. Ha ez
sem megy, a meccsvégi közös λ-t (`sim.lam`) használja.

## Ami továbbra is gépenként más

* **A helyzetek darabszáma:** a két gép külön sorsolja, de mostantól azonos
  esélyekkel. A tendencia tehát egyezik, a pontos szám nem.
* **A birtoklás alapvonalában a saját taktika:** a társ taktikáját a gép nem
  ismeri. Ez kis súlyú tag, a görbe irányát már nem fordítja meg.

## Próba

`tools/sajat-bajnoksag-3-9-331-proba.js`, új állítás: egy valódi, két gépen
lefutó párharc után a két momentum-görbe vödrönkénti λ-aránya pontosan
tükörkép (a + b = 1). A javítás előtt párharcban nem volt közös λ, ezért az
állítás bukott volna.
