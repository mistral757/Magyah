# „Elfogyott ebben a nyárban" — pedig hozzá sem nyúltam

*(3.8.17. Érintett kód: `twSummerLooks`, `twSession`, `twAttrBox` /
`twAttrFix` / `twAttrMax` / `twAttrLeft`, `twRefillSummerQuotas` /
`twSummerQuotaCheck`, a `finish()` szezonzáró blokkja, a `renderHub()`
átigazolás-csoportja, `twShowAttrPicker`, valamint a mentés/betöltés
`summerQuotaSeason` mezője.)*

## A tünet

A nyári HUB Átigazolás menüjében a **🎯 Képesség-keresés** és a **🎲
Átigazolási esemény** szürkén, letiltva állt, alattuk a felirattal:

> elfogyott ebben a nyárban (4/4 felhasználva)
> elfogyott ebben a nyárban (2/2 felhasználva)

A bejelentő szerint *„az elmúlt 5 alkalommal, de lehet, hogy 10 átigazolási
idényben sem" kerestem játékost, és az eseményre sem nyomtam rá, már eleve
szürke volt* — vagyis a számláló olyasmit könyvelt el, ami meg sem történt. A
mellettük álló **Vásárlás** és **Klub-szemle** ugyanabban a pillanatban
használható volt.

Ez két külön hiba, ugyanazzal az arccal.

---

## 1. hiba — a képesség-keresés kerete egy nem mentett változóból jött

A nyári keret a `twSession()`-ön keresztül jött, az pedig a `TW`-től függ:

```js
const sess=twSession();
if(!sess)return 0;      // ← ez futott le
```

A `TW` **egy futó átigazolás állapota**, nem játékállás: nem kerül a mentésbe
(függvényeket nem lehet menteni), és a HUB rajzolásakor legfeljebb az ELŐZŐ
művelet nyoma. Tehát `null` volt

* minden **újratöltés** után (a telefonos PWA-nál ez a leggyakoribb eset),
* és a szezonjelentés felől a nyári HUB-ba érkezve is.

Ilyenkor a `twAttrLeft()` **0**-t adott vissza, miközben a `twAttrMax()` a
teljes keretet (4) számolta ki — a HUB pedig pontosan azt írta ki, amit a két
szám mond: *„elfogyott ebben a nyárban (4/4 felhasználva)"*. A gomb kezelője
(`hubAttrSearchBtn.onclick`) ugyanezt a nullát kérdezi, ezért koppintásra sem
történt semmi.

**A bizonyíték, hogy ez kimaradás, nem szándék:** a *nyitott szezonközi
ablakra* ez a hiba MÁR JAVÍTVA volt (a függvény fölötti régi megjegyzés szó
szerint leírja: *„újratöltés után (TW===null) nullát adott, és a gomb TILTVA
maradt"*) — a javítás csak a nyári ágra nem terjedt ki. Innen a
kiszámíthatatlanság is: ha ELŐBB a Vásárlásba léptél be, a `TW` felállt, és
onnantól a gomb ugyanabban a nyárban működött.

**A javítás.** A keret egy dobozból jön, ami nem a `TW`-től függ:

```js
function twAttrBox(){
  if(twWindowOpen()){ … return twAttrFix(S.twWindow); }   // az ablaké
  return twAttrFix(twSummerLooks());                       // a nyáré
}
function twAttrMax(){return twAttrBox().attrMax||0;}
function twAttrLeft(){return Math.max(0,twAttrBox().attrLeft||0);}
```

Pontosan az a kettéválasztás, amit a klub-szemle már így csinált
(`csSpinsMax` / `csSpinsLeft`). A **levonás** (`twShowAttrPicker`) is erre a
dobozra megy, tehát a kiírás és a fogyasztás nem tud két külön keretről
beszélni. Ráadás: ha a keret közben NŐ (ügynökség-fejlesztés, kihívás-jutalom),
az *elhasznált* alkalmak száma a fix pont, és a maradék abból számolódik újra —
a fejlesztés nem tünteti el a már elköltött kereteket, és nem is ad vissza
belőlük.

---

## 2. hiba — a nyári keret a nyár VÉGÉN töltődött, nem az elején

A nyári számlálók (`S.twEventUsed`, `S.clubScoutSpinsUsed`) egyetlen helyen
nullázódtak: a `startNextCareerSeason()`-ben — vagyis annak a nyárnak a
**végén**, amelyikre vonatkoztak.

Így bármi, ami a nyár ELŐTT hozzájuk nyúlt, ott ült a nyár első
pillanatában is, és a HUB azt írta ki, amit talált. Két ilyen út volt:

| honnan | mi történt |
|---|---|
| a legelső idény előtti keret-áttekintő (`openPreSeasonHub`) | ott a klub-szemle szándékosan elérhető — az első nyár már fogyasztott kerettel indult |
| szezonközi zsákutcák (lásd a `twClosedNow()` fölötti leírást) | ahol a HUB nem tudott a futó szezonról, ott a NYÁRI keretből lehetett pörgetni, és a szám a szezon végéig ott maradt |

Egy elszámolt szezon tehát egy **teljes nyarat** vitt magával — pontosan azt,
amit a bejelentés leír: *„volt még keresésem, eseményem is, de azt jelezte,
hogy el lett használva"*.

**A javítás.** A keret akkor töltődik, **amikor a nyár nyílik**: a szezon
lezárásakor (`finish()`, a `!S.seasonClosed` kapun belül, tehát szezononként
pontosan egyszer):

```js
function twRefillSummerQuotas(){
  S.twEventUsed=0;
  S.clubScoutSpinsUsed=0;
  S.summerLooks=null;
  S.summerQuotaSeason=S.seasonNumber||1;   // stempli: erre a nyárra töltöttünk
}
```

A stempli teszi a műveletet idempotenssé: a nyáron belül újratöltés, ki-be
lépkedés, bármi — a keret nem töltődik újra. (A mentésben is ott van, különben
minden újratöltés ingyen keretet adna.)

### A már elromlott mentések

Akinek a mentése MÁR benne áll egy ilyen nyárban, annál a szezonzárás
pillanata elmúlt. Ezért a HUB rajzolásakor fut egy kapu:

```js
function twSummerQuotaCheck(){
  if((S.summerQuotaSeason||0)===(S.seasonNumber||1))return;   // már kapott
  if(twWindowOpen()||twClosedNow()||preSeasonHubMode)return;  // nem nyár van
  twRefillSummerQuotas();
}
```

Régi mentésben nincs stempli (0), tehát a **következő nyári HUB-nyitáskor
egyszer, csendben helyreáll** a keret. Utána a stempli miatt már nem nyúl
hozzá.

A `startNextCareerSeason()` nullázása megmarad: az onnantól nem a nyár
töltése, hanem takarítás — ami a nyáron elfogyott, azt a most kezdődő idény ne
cipelje magával.

---

## Amit szándékosan NEM változtat

* **A szezonközi ablak kvótája marad a sajátja** (`twCpExtraQuota`: 1-3 a
  scout csillagai szerint) — a nyári képlet nem szivárog bele.
* **A keretek mérete változatlan:** nyáron 2-8 képesség-keresés, 2 esemény
  (10★ ügynökségtől 3), klub-szemle a scout csillagai szerint.
* **A megerősítők változatlanok** (lásd `docs/megerositesek.md`): egy koppintás
  továbbra sem költhet el egy alkalmat kérdés nélkül.

## Önjavítás

A `twAttrFix()` ugyanazt teszi a képesség-keresés számlálójával, amit a
`twSessionFix()` a felderítésével: ha a maradék hiányzik, negatív, vagy
nagyobb a keretnél (egy korábbi hiba nyoma), a keret tiszta lappal áll vissza.
Idempotens — a javítás után a feltétel hamis.
