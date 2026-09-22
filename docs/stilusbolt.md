# 🛒 A bontott állapot és a stílusbolt (3.9.127)

## A kérés

> „Tegyük mindegyik csapatstílusnál kidolgozottabbá ezt a részt. Hasonlítson a
> panzerkampfwagenére. Legyen jobban elmagyarázva, milyen tényezők adják ki a
> fő guiding pontszámot (esetünkben a viharszint) — itt ötletem: a top 3
> leggyorsabb sebességattribútumainak összereje az egyik faktor, másik a
> szélsők (védők, középpályások, csatárok) közötti összjáték értékek,
> sebesség skillek és én ezekből számítanám ki valahogy. És lehessen
> mindegyik ilyen stílusnál vásárolni mást is, ne csak csapaterőt. Pl itt a
> villámoknál: sprint mester stábtagnak konkrét tapasztalati szintlépést,
> leglassabb kezdő 11-ben lévő játékosnak extra gyorsítást a sebesség
> edzésre, 1 meccsre szóló sebesség növelő tokent (legolcsóbb), ami egy adott
> posztcsoportban minden játékos sebesség attribútumát 5%-kal növeli egy meccs
> erejéig. Ehhez hasonlóra felépíteni mindegyiket."

Két dolog, és mindkettő ugyanarról szól: **a stílus-szakasz eddig mondott egy
számot, és adott egyetlen gombot.** Most megindokolja a számot, és ad mellé
három rövid döntést.

---

## I. A bontott állapot — négy nevesített tényező

Az állapot (viharszint, gólterhelés, betonszint, harmóniaszint,
passzterhelés, nyomásszint) eddig **egyetlen képlet** volt: a keret tizenegy
legjobbja a stílus tengelyén. Igaz szám, de néma. Mostantól négy tényező adja
össze, és **mind a négy külön sorban, saját magyarázattal látszik a panelen**
— csíkkal, ami mutatja, hol tart a saját plafonján belül.

| # | Tényező | Mit mér | Plafon |
|---|---------|---------|--------|
| 1 | 📐 **Mélység** | a RÉGI képlet, betűre: a keret `men` legjobbja a tengelyen, emberenként `perMan` egység, a `scaleFrom` értéknél nulla | ~330 |
| 2 | 🔺 **Él** | a **három** legjobb ember csúcsa — a 85-ös küszöbtől mérve, emberenként 10 egység | **30** |
| 3 | 🤝 **Összjáték** | a stílus **kulcsposztjain** álló öt legjobb ember egymás közti kötései (`bondOf`), a bevett skálán: `BOND_REF` (55) a nulla, `BOND_SOFT` (88) a maximum | **24** |
| 4 | ✨ **Képességek** | a keret **kész** képességei a stílus tengelyén — a meglévő tengely-térkép (`SKILL_AXIS`) dönti el, mi tartozik hova; a félkész arányosan | **18** |

**Miért marad a mélység a törzs.** A másik három együtt legfeljebb 72 egység,
a mélységé 330 — a kiegészítők tehát a legjobb esetben is a törzs alig ötödét
adják hozzá. Ez szándékos: az állapot ugyanarról szól, mint eddig, csak most
**megindokolja magát**, és ad három új, konkrét fogódzót annak, aki tolni
akarja. A balance nem mozdul el, a magyarázat viszont megjelenik.

### Stílusonként

| Stílus | Tengely | 🔺 Él | 🤝 Kulcsposztok | ✨ Képesség-tengely |
|--------|---------|-------|------------------|---------------------|
| ⚡ Villám | `seb` | a 3 leggyorsabb | **JV · BV · JSZ · BSZ** (a szélsők) | sebesség |
| ⚽ Bombázók | `gol` | a 3 legjobb befejező | CS · JSZ · BSZ · TKP | gól |
| 🧱 Beton | `ved`/`kapus` | a 3 legjobb védekező | KP · JV · BV · KV | védő + kapus |
| ☯️ Harmónia | *(egyenletesség)* | **fordított**: a legjobb és a 11. közti rés szűkülése | *nincs* — a keret gerince | **minden** (`"*"`) |
| 🌀 Tiki-taka | `passz` | a 3 legjobb passzoló | VKP · KKP · TKP | passz |
| 🧲 Gegenpressing | `seb`+`ved` | a 3 legjobb presszelő | VKP · KKP · TKP · JSZ · BSZ | sebesség + védő |

A ⚡ Villám sora **szó szerint a kérés**: top 3 sebesség + a szélsők összjátéka
+ sebesség-skillek.

### ⚠️ Egyik tényező sem függ a felállástól

Mind a négy a **teljes keretből** számol, pontosan úgy, ahogy a mélység eddig
is. Ez nem szépészeti döntés:

* az állapot a **rejtett meccs-erő** tagja (`engOvrBonus` → `hiddenMatchBonus`),
* a **potenciál-kereső** (`msBestConfig`, 3.9.122) pedig felállásokat,
  cseréket, kapitányokat és taktikákat próbálgat ezen a számon.

Ha az állapot a kiállított tizenegytől függne, a kereső önmagát kergetné. És
pontosan ezért helyes a **gyorsítótár** is: `engBaseParts` a keresés idejére
(`_msProbing`) eltárolja a négy tényezőt, mert a kereső a keret *halmazát* nem
mozgatja — a `msWithRestore` az `extraRoster`-t is visszaállítja. A keresésen
kívül nincs gyorsítótár: ott a szám mindig friss.

---

## II. A stílusbolt — három rövid döntés

A szint (Villámcsapás, Gólözön, Bunker…) eddig az **egyetlen** dolog volt,
amire a stíluspont elmehetett, és az is csak meccserőt adott. A gazdaság így
egyetlen hosszú létra volt: gyűjts 150-et, nyomd meg a gombot, várj a
következő stílusszintre.

| Tétel | Ár | Mit csinál |
|-------|----|-----------|
| ⏱️ **Token** | **25** | egy választott **posztcsoport** (kapusok / védők / középpályások / csatárok) minden emberének a stílus tengelye **+5%** — **egyetlen** mérkőzésre |
| 🏃 **Edzés-gyorsítás** | 90 | a kezdő 11 **leggyengébb** embere a tengelyen tartós **+25%** fejlődést kap, fokozatonként, legfeljebb **4** fokozat (= +100%) |
| 🎓 **Stábtag-szintlépés** | 140 | a stílushoz illő típusú stábtagod (⚡ = **Sprintmester**) azonnal kap egy **tapasztalati lépcsőt** |

### 🎓 A stábtag-szintlépés

Nem kerülő út: ugyanaz a `c.xp` mező, ugyanaz a `COACH_XP_PER_STEP` (2) lépcső
és ugyanaz a `coachSzCap` plafon (a belépéskori szint + 12), amit a
**ledolgozott szezon** is ad. Csak most **meg lehet venni az idő egy részét**.
Aki már a plafonján áll, az is a listán van, de a gombja letiltva — a panel
nem hazudik.

Melyik típus melyik stílusé: ⚡ Sprintmester · ⚽ Gólvágó-mentor ·
🧱 Bástya vagy Kesztyűs mester · ☯️ Csapatkovács vagy Lélekemelő ·
🌀 Játékmester · 🧲 Sprintmester vagy Bástya.

### 🏃 Az edzés-gyorsítás

**A célpontot a rendszer választja, nem a menedzser.** Mindig a kezdő tizenegy
leggyengébb embere a stílus tengelyén — a Villámnál a kapust kihagyva (a kapus
sebessége sosem lesz a Villám ügye), a Betonnál viszont bent van, mert ott az
`attrMax` épp őt méri a Védésével. Ez a tétel a **keretet húzza föl**, nem a
sztárt tolja tovább.

A szorzó ugyanabba a **közös fejlődés-csatornába** megy be (`addA`), mint az
edzésterv, a személyi edző, a passzkémia és a Gegenpressing „Nyomás!"-a — és
ugyanaz a szabálya: **csak a pozitív fejlődést szorozza, a büntetést nem.**
A padon is jár: ha a felzárkóztatandó ember kiszorul a kezdőből, pont akkor van
rá a legnagyobb szükség.

Ha a rendszer **új** leggyengébbet talál (mert az előző felzárkózott), a
gyorsítás átkerül rá, és nulláról indul. A tétel mindig a *pillanatnyi*
leggyengébb láncszemről szól.

☯️ A Harmóniánál nincs saját tengely: mindenki a **saját posztja fő tengelyén**
gyorsul (`attrTrainedBy`). Ez a Harmónia egyetlen mondata pénzzé váltva.

### ⏱️ A token

**Hol hat.** Egyetlen helyen: a csapat tengelyeit számoló
`teamAttrStrengths()`-ben, a játékos attribútum-értékén. Onnan megy tovább a
taktika-illeszkedésre, a mérkőzésre, és — mivel a `tacticEffect` a rejtett
meccs-erő tagja — a **kijelzett meccserődbe** is.

**Amit NEM csinál:** nem írja át a `careerPool` attribútumait. Egy mentés vagy
egy félbehagyott mérkőzés így sosem rögzítheti a megemelt értéket.

**Elfogy.** A lefújásnál (`engMatchEnd`), feltétel nélkül — akkor is, ha a
mérkőzésen egy pont sem gyűlt, és akkor is, ha a posztcsoportból senki nem
játszott. **A tétel a nevezésre szól, nem a percekre**, különben át lehetne
vinni a hatást a következő meccsre. Egyszerre **egy** token él.

☯️ A Harmónia tokenje itt is más: mindenki a **saját** posztja fő tengelyén kap
+5%-ot, nem egy közösön.

### Az árak a tarifával együtt nőnek

`engShopPrice = ár × engScaleT()` — ugyanaz az érv, ami a tarifánál (3.9.111):
a bevétel az állapot-szinttel nő, tehát a **fix** ár idővel ingyenné válna. Így
a három tétel a karrier végén is pontosan annyi **meccsnyi munkába** kerül,
mint az elején.

**A szint (`ENG_PRICE`) ára viszont fix marad.** Az a *hosszú* létra, és annak
épp az a dolga, hogy a karrier előrehaladtával könnyebb legyen. A bolt a
*rövid* döntés; a kettő szándékosan másképp viselkedik.

---

## III. Mi hol lakik

| Fogalom | Hol |
|---------|-----|
| a négy tényező | `engBaseParts` · `engTrunkRaw` · `engElRaw` · `engChemRaw` · `engSkillRaw` |
| a Harmónia fordított éle | `harmoniaEngEl` |
| a keret tengelyértékei | `engAxisRows` · `engAxisVal` |
| a gyorsítótár | `_engPartsCache` · `engPartsCacheClear` (a `msWithRestore` nyitja/zárja) |
| a bolt árai | `ENG_SHOP_PRICE` · `engShopPrice` · `engPay` |
| 🎓 | `engCoachList` · `engBuyCoach` |
| 🏃 | `engTrainKeyFor` · `engTrainTarget` · `engTrainWhy` · `engBuyTrain` · **`engTrainMult`** |
| ⏱️ | `ENG_TOKEN_GROUPS` · `engBuyToken` · `engTokenWhy` · **`engTokenMult`** · `engTokenSpend` |
| a panel | `engPartRow` · `engShopHtml` · `engSectionHtml` · `engSectionBind` |
| a stílus-táblázat új mezői | `ENG_DEFS[*].elN/chemN/skillN/chemPos/skillAxis/skillNeed/partD/buy` |

**A mentés magától viszi:** minden új adat (`E.tb`, `E.tok`) a stílus-állapot
`eng` rekeszében lakik, az pedig a `S.style` / `S.style2` része — ugyanott,
ahol eddig a pont és a szint.

---

## IV. A próba

`tools/stilusbolt-proba.js` (9101-es port, 38 állítás). A legfontosabbak:

* a négy tényező **összege betűre az `engBaseRaw`**, és a mélység betűre a régi
  képlet (külön újraszámolva);
* az él a 85-ös küszöbtől mér, és emberenként/összesen tetőzött;
* az összjáték **csak** a stílus kulcsposztjain álló embereket nézi;
* a képesség-tétel a tengely-térképet követi — **idegen tengely skilljei nem
  számítanak**;
* **a felállás felforgatása után mind a négy szám bitre ugyanaz** (ezen áll
  vagy bukik a gyorsítótár helyessége);
* a stábtag-vétel pontosan egy lépcsőt ad, rossz típusra nem fizet, a plafont
  tartja;
* az edzés-gyorsítás a kezdő 11 leglassabb emberét találja meg (a kapust
  kihagyva), és a szorzó **csak rá, csak a saját tengelyén** él;
* a token a választott csoportot emeli, mást nem, más tengelyt nem, tényleg
  átjön a csapat tengelyére, és a lefújás elfogyasztja — **egyszer**.
