# 3.9.203 — ✨ Az élő háttér mind a négy témában + a bejelentett hibák

> „Az új témánkban a PC-s és telefonos fekvő menüben rácsúszott az oldalsó
> sáv a HUB-ra. Amúgy minden más szimpi. Egy két ikon bizonyos nézetben
> hajlamos rácsúszni más dologra, amire nem kéne, de egyébként tetszik,
> valamint a csatolt képen a jobb oldali cicázós passzolgatós csapatban
> mindig két ember között megy a labda, a többiek nem szállnak be a
> passzolgatásba. Amúgy minden stílus tetszik. Mehet minden témában
> ugyanez!" (képernyőkép: 2000×1125-ös ablak, fekvő HUB, a bal menüsáv a HUB
> közepére csúszva)

## 1. A fekvő HUB: a bal menüsáv a helyén

**Az ok:** a 3.9.202 a HUB kártyáira üveghatást tett (`backdrop-filter`).
Egy ilyen tulajdonság a kártyát a benne lévő `position:fixed` elemek
viszonyítási dobozává teszi. Fekvő HUB-ban a bal menüsáv (`#hubActions`)
fixed, és a HUB fő kártyájában lakik — így a kártyához igazodott, nem a
képernyőhöz, és rácsúszott a HUB közepére.

**Mérve 1920×1080-on:**

| | bal szél | teteje |
|---|---|---|
| javítás előtt | 536 px | 1238 px |
| javítás után | **0 px** | **109 px** (a fejléc alatt) |

**A szabály mostantól:** a tartalmazó kártyákra soha nem kerül
`backdrop-filter`, csak áttetsző háttér. Az elmosás kizárólag levél-elemeken
él: a menüsorokon és a karrier-chipeken.

## 2. Az egymásra csúszó ikonok

**A kezdőlap felső sávja 23 méreten végigmérve,** mind a négy témában, hosszú
becenévvel („sétagalopp #wu7v · 🥉7”). Három ütközést találtam:

| hol | mi csúszott mire | javítás |
|---|---|---|
| 320–375 px széles álló telefon | a profil-chip a ✨-re (320-on a témagombokra is) | a chip legfeljebb a bal gombsorig ér, a becenév három ponttal rövidül |
| 568×320 (kis fekvő telefon) | a gombsor a felső feliratra | a felirat a gombsor alá kerül |

**Az ellenőrzés után:** 4 téma × 23 méret, egyetlen ütközés sincs.

## 3. A rondó: mind az öt passzol

**A hiba:** a passz-sor felváltva 2, illetve 3 helyet ugrott. Öt helyen ez
mindig ugyanoda vitt vissza, tehát csak ketten passzolgattak.

**Mostantól:**

* a labda a négy társ egyikéhez megy, de **soha nem vissza** annak, akitől
  épp kapta;
* a kör túloldalára hatszoros eséllyel, a szomszédhoz ritkán.

**Mérve 40 passzon:**

* mind az öt játékos kap labdát;
* a passzok ~20%-a megy a szomszédnak;
* 15 különböző passz-irány fordul elő.

**Fekve és asztalon** a HUB-jelenet edzései a valódi szabad sávokba kerülnek
(mérve). Korábban fix arányok voltak, és fekvő HUB-ban a bal oldali kocogók a
menüsáv mögé estek.

## 4. Mind a négy téma

**Ugyanaz a rajz és mozgás, a téma a festéket adja:**

| téma | gyep | mieink · ellenfél · kapus | külön |
|---|---|---|---|
| Sötét-arany | éjszakai mélyzöld | arany · szürke · türkiz | — |
| Törtfehér | nappali zsályazöld, fehér kréta | barnás-arany · palaszürke · zöldeskék | a labdának körvonal (világos gyepen is látszik); világos sötétítés a szöveg mögött |
| Noir | fekete-fehér filmkocka | ezüst · sötétszürke · szürke | — |
| Pixel | PICO-8 zöld | sárga · piros · kék | **lépcsős mozgás** |

**A Pixel lépcsős mozgása:** 10 képkocka/mp, a szereplők 2 px-es rácsra
ugranak. A téma „Szaggatott mozgás” kapcsolóját kikapcsolva sima, mint a
többi témában.

**A ✨ kapcsoló** saját, témahű stílust kapott (`.fxOpt`). Eddig a Pixel
finomhangolóinak osztályát használta, és ezzel a `pixel-tema` próbát is
elrontotta.

## Próba

```bash
node tools/hatter-minden-tema-3-9-203-proba.js
```

A próba **15 állítást** ellenőriz:

* a négy téma festékét és a pixel rácsát;
* a rondót;
* a fekvő HUB menüsávját;
* az ikonok ütközését;
* a kapcsolót.

A 3.9.202-es próba is frissült: témaváltáskor a jelenet a téma festékével
él tovább.
