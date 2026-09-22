# 🟣 Hiper Szuper Kupa (3.9.123)

## 1. A kérés

> „D0-tól kezdve a kupasorozat egy egyre nehezedő Hiper Szuper Kupa nevű
> sorozat legyen. D0-n a mezőny ereje a kezdő meccs-erő −1, D−1-en 0, D−2-n
> +1 és így tovább. A lefolytatása pedig úgy legyen, mint a mostani BL-é.
> Nagy mezőny, 8 meccs, nagy liga tábla, top 8 egyből tovább, többiek még
> tovább harcolnak a bejutásért, utolsó 8 egyből kiesik."

## 2. Egy néma hiba, amit a kérés kitakart

A `PYR_CUPS` kvalifikációs tábla a **D1-ig ért**. D0-tól az index negatív
lett, a `PYR_CUPS[-1]` `undefined`, és a `||` a **legalsó** osztály sorát
adta vissza:

```js
const c = PYR_CUPS[id-1] || PYR_CUPS[PYR_CUPS.length-1];   // D0 → D6 sora
```

Vagyis a világ tetején, a szuperligákban, eddig a **Magor Kupája** futott —
a piramis legkisebb kupája —, illetve a D6 sorában `entries:[]` áll, tehát
gyakorlatilag semmi. Nem elírás volt, hanem **hiányzó sor**: a szuperligák a
kupa-oldalon nem léteztek.

## 3. A mezőny

```js
hszMid() = msKick + pyrAbove() − 2
```

| osztály | `above` | a mezőny |
|---|---|---|
| D0 | 1 | kezdő meccs-erő **−1** |
| D−1 | 2 | **±0** |
| D−2 | 3 | **+1** |
| D−5 | 6 | **+4** |

A horgony a **szezonindító (nevezési) meccs-erő**, nem az élő. Oka van: a
kupa a szezon **végén** fut, addigra a keret fejlődött, és egy élő méréssel
a sorozat önmagát húzná maga után. A `pyrAnchorAtKickoff` teszi el
(`S.pyr.msKick`), a **nevezési** számot — tehát a 3.9.122 lebutítás-védelme
itt is hat.

## 4. A lefolyás

### Ligaszakasz — egy 32-es tabella, nyolc forduló

Nem nyolc négyes csoport: **egyetlen** 32 soros tabella. A gépezet többi
része három függvényen át látja a különbséget, ezért nem kellett
kettéágaztatni:

```js
compGroups(comp)     // 8  ·  swiss: 1
compGroupSize(comp)  // 4  ·  swiss: 32
compSchedule(comp)   // EURO_SCHEDULE  ·  swiss: hszSchedule()
```

A „csoport" a svájci rendszerben egyetlen, 32 fős csoport — így a sorsolás,
a forduló-szimuláció, a tabella és a felület változtatás nélkül működik.

### A menetrend és a lánc-javítás

A körmérkőzés forgó módszerének (31 forduló) első nyolc fordulója: mindenki
**nyolc különböző** ellenféllel játszik. A menetrend determinisztikus —
közös karrierben a két kliens ugyanazt kapja, sorsolás nélkül.

**A pályaválasztói jog viszont nem állt be magától.** A mohó kiosztás
(mindig az kap hazai pályát, akinek kevesebb van) 3/4/5-re állt be, és az
egyszerű „fordítsuk meg ezt a párt" javítás sem vitte 4-re: a túlterhelt és
az alulterhelt csapat gyakran **nem játszik egymással**.

A megoldás egy **irányított lánc** (BFS) a legtöbb hazaival rendelkezőtől a
legkevesebbig. A lánc minden párját megfordítva egyetlen hazai pálya
vándorol át, a közbülső csapatok mérlege pedig változatlan marad. Mérve:
mindenkinek **pontosan 4 hazai és 4 idegenbeli**.

### A három sáv

| hely | sors |
|---|---|
| **1–8.** | egyenesen a nyolcaddöntőbe |
| **9–24.** | rájátszás a nyolcaddöntőért (oda-visszavágó) |
| **25–32.** | kiesik |

8 + 8 = **16** csapat a nyolcaddöntőre. A 32-es mezőnnyel a számok pontosan
kijönnek — ezért nem kellett a mezőny méretéhez nyúlni.

### A párosítás: a helyezés maga a sorsolás

Nincs kalap és nincs véletlen. A rájátszásban a **9. a 24.-kel**, a 10. a
23.-kal, … a 16. a 17.-kel (a két helyezés összege mindig 33). A
nyolcaddöntőben a tabella élén álló a **leggyengébb** továbbjutót kapja. A
jobb helyezettnél van a **visszavágó**.

Így a ligaszakaszban szerzett hely tényleg ér valamit — és a párosítás
mindkét kliensen azonos, szinkron nélkül.

### A legjobb nyolc útja

Aki 1–8. lett, **kihagyja** a rájátszást — de annak akkor is le kell
futnia, különben nincs nyolc ellenfél a nyolcaddöntőre. A `hszSimPlayoff()`
ugyanazzal a seedelt párharc-motorral viszi, mint a kiesés utáni
háttértornát, tehát közös karrierben is azonos.

## 5. Amit a kérésből MÁSKÉNT csináltam

> „Top 4 már negyeddöntőben, 5-8 nyolcaddöntőben várja a többieket. (Ugye?)"

Ez a rész nem áll össze a saját első mondatoddal — és jelezted is, hogy nem
vagy biztos benne. **A top 8 mind a nyolcaddöntőben vár**, nem négy közülük
a negyeddöntőben. Két okból:

- Ha a top 4 a negyeddöntőben várna, a nyolcaddöntőbe 4 + 8 = 12 csapat
  jutna, ami nem hatványa a kettőnek — az ág nem állna össze.
- A „top 8 egyből tovább, utolsó 8 kiesik, a többi harcol" felosztás
  (az első mondatod) **pontosan** 16-ot ad a nyolcaddöntőre. Az a helyes.

## 6. Közös karrier

A ligaszakaszban nem kerülhettek össze. Mivel egyetlen tabella van, a
„másik csoportba tesszük" megoldás nem járható — a menetrend viszont
determinisztikus, tehát pontosan tudható, ki a te nyolc ellenfeled. Ha a
társ köztük van, egy olyan helyre cseréljük, ami nem. A csere a
**slot-számokból** dolgozik, nem a „ki az én társam" nézőpontból, tehát
mindkét kliensen ugyanaz.

## 7. A díjazás

A HSZ a legnagyobb: `champBoost:5`, `tacticBoost:4`, pénzdíj a KK
**másfélszerese** (`win:1.0`).

## 7/a. A szín

**Lila, végig** (`#a855f7`): a fejléc, az eredményjelző, a kupa-képernyő és
a Champion-kártya gyűrűje is. A győzelmi sorok világosabb árnyalata
(`winCol`) szintén lila (`#d8b4fe`).

Kétszínű gyűrűje **szándékosan nincs**. Az FA azért kapott piros-fehéret,
mert a Magor Kupája is piros, és a 42 pixeles korongon a két árnyalat
ránézésre ugyanaz volt. Lilából viszont **egyetlen** sorozat van, tehát
nincs mit megkülönböztetni — egy arany második sáv csak elvenne a
színből.

## 8. A próba

`tools/hiper-szuper-kupa-proba.js` — 30 állítás, köztük a három út
(1–8 · 9–24 · 25–32) végigjárva, és az, hogy a **klasszikus kupa bitre
változatlan** (8 csoport × 4 csapat, 6 forduló).
