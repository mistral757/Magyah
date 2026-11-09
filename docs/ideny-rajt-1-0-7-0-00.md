# 🏁 Az idény-rajt, 2. szerződés (1.0.7.0.00)

## A kérés (röviden)

> „Szeretném ha kompetitív maradna a játék. […] a korábbi verzióban […]
> mindig mínusz célréssel indultunk már a második idénytől […] tudatosítani a
> játékosban, hogy nyáron ne használja el minden erőforrását, tartalékoljon
> […] a nyár végi befektetéseink ne vesszenek el teljesen […] a legelső
> szezonban […] 0 és +1 között legyen még a nehéz fokozatokon is, […] a
> második szezontól […] 0 és −1, majd később akár a −5, −10 irányába […] a
> nehézségi szint határozná meg, hogy mennyire meredeken adjuk hozzá […]
> szezonról szezonra (azon belül is, divízióról divízióra), a játékos […] a
> saját kis célrés csúszkájával […] százalékosan […] a meccserő 2%-ával."

## Mi volt a baj

Az 1.0.6.0.00 óta **a rajt-cél a minimum volt**. Ha a mezőny erősebb volt,
mint amit a célrés engedett, annyit lépett vissza, amennyi kellett. A rajt
így sosem lehetett keményebb a célrésnél, és a 2. idénytől jellemzően
pluszos lett. Ezzel elveszett a kompetitivitás.

## A képlet (egyjátékosban, a 2. idénytől, a kezdőrúgáskor)

```
W      = (a lezárt idény záró + a mostani indító meccs-ereje) / 2
tart   = indító − W, legfeljebb W × 2%        ← a nyári fejlesztés fele, plafonnal
K      = √(W × 205)                           ← a boostok skálája
mezőny = W − C(f) + K·b(f)·r(idény) + K·d(f)·[feljutottál] + W·σ
rajt   = tart + C(f) − K·b(f)·r − K·d(f)·[fel] − W·σ
```

| tag | jelentés | értékek |
|---|---|---|
| `f` | a nehézség-szám (fokozat.belső szint) | 1.1 … 10.5 |
| `C(f)` | rajt-célrés, **az 1. idény rajtja is** | 1.1 → +2,36 · 4.1 → +1,16 · 5.1 → +0,9 · 8.5 → +0,33 · 10.5 → 0 |
| `b(f)` | idény-boost a 3. idényre | 1.1 → 1,6% · 5.1 → 2,5% · 8.5 → 2,8% · 10.5 → 3,2% |
| `r` | az idény üteme | 2. ×0,6 · 3. ×1,0 · 4. ×1,2 · 5.-től ×1,35 |
| `d(f)` | feljutás-boost | 1.1 → 0,8% · 8.5 → 1,2% · 10.5 → 1,3% |
| `σ` | a te csúszkád | −2% … +2%, 0,25%-os lépésben |

**Miért százalék, és miért √W?**
- **Százalék:** a meccs-erő idény közben arányosan nő (mérve: +17% … +41%
  idényenként), ezért a boost is a csapat méretéhez igazodik.
- **√W:** 300–500-as csapatoknál a lineáris % −15 … −20-as rajtot adna. A
  gyökös skálával a késői idények −5 … −10 felé tartanak, ahogy kérted.
- **A csúszka marad lineárisan a meccs-erő ±2%-a**, ahogy kérted.

**A megtartott nyári rész plafonja (2%).** A mérés szerint a késői nyarak
+50 … +100 meccs-erőt is hoznak. A fele-fele súlyozás ilyenkor egymagában
+25 … +50-es előnyt adna, ezért a megtartott rész a W 2%-áig nő.

## Összevetés a mérési adatokkal (`meres-adat` ág, 27 karrier, 63 idény)

- **A nyári változás mediánja a 3. idényben ~+3–4 meccs-erő.** A
  megtartott rész tehát jellemzően ~1,5%, ezzel készült a táblázat.
- **A régi verziókban a mezőny idény közben alig nőtt:** a záró rés
  +20 … +200 volt, a 3. idénytől 70–80% a cím. Ezt azóta az idény közbeni
  mezőny-növekedés (`nfGyors2`) és a rés-követés (`nfKov`) kezeli. **Ezekhez
  nem nyúltunk**, csak a rajt változott.
- **A te példád:** 8.5, 3. idény, feljutás, W = 205, a megtartott rész +5.
  Nálad ez −2-t adott, az új képlet −3,4-et. Jellemző nyárral (+3 megtartva)
  −4,8. A csúszkával −8,9 … −0,7 között állítható, a −6-os „melós, de
  leküzdhető” rajtod tehát a sávban van.

## A jellemző rajtok (a megtartott rész 1,5%; zárójelben a csúszka két vége)

| fok | 2. idény (W 110) | 3. idény (W 205) | 4. idény (W 280) | 5. idény (W 400) |
|---|---|---|---|---|
| 1.1 | +2,6 / fel +1,4 | +2,2 / fel +0,5 | +2,0 / fel 0 | +2,2 / fel −0,1 |
| 5.1 | +0,3 / fel −1,2 | −1,2 / fel −3,2 | −2,1 / fel −4,5 | −2,8 / fel −5,7 |
| 8.5 | −0,5 / fel −2,3 | −2,3 / fel −4,8 (−8,9 … −0,7) | −3,5 / fel −6,4 | −4,5 / fel −7,9 |
| 10.5 | −1,2 / fel −3,2 | −3,5 / fel −6,2 | −5,0 / fel −8,1 | −6,4 / fel −10,1 |

A teljes tábla a próba kimenetében van (`tools/ideny-rajt-1-0-7-0-00-proba.js`).

## A felület

- **Nyári „🏁 Idény-rajt” képernyő** (a régi célrés-hangolás helyén):
  - a várható rajt-rés;
  - a teljes bontás (alap, megtartott rész, célrés, idény-boost,
    feljutás-boost, csúszka);
  - a csúszka;
  - 🧳 *„Tartalékolj!”*: a nyári fejlesztés fele számít, a téli ablakra
    hagyott pénz fordíthat.
- **HUB:** nyáron a várható rajt és a tanács, idény közben a rajt bontása és
  a pálya.
- **Napló a kezdőrúgáskor:** „🏁 Idény-rajt: …” a teljes bontással.

## A Run

- **A fokozat célrésén mér**, mint eddig.
- **A csúszka a régi ±0,5-ös hangolás helyén áll:** +2% (nehezebb) = −0,5
  célrés, tehát Run-többlet.
- **A képlet szerinti világ-eltolás nem „mezőny-emelés”** (nem a te
  elhúzásod), és nem fék.
- **Az idény közbeni elhúzás** a rés-követés Run-többletén át számít, mint
  eddig.

## Ami NEM változott

- **Az idény közben:** a mezőny-növekedés (`nfGyors2`), a rés-követés, a
  boost-adósság.
- **Közös karrierben** (PvP, saját bajnokság) egyelőre a régi szerződés él.
  A két gép kézfogása és a közös világ miatt ehhez külön kör kell. A régi
  próbák (`nehezseg-3-9-222`, `celres-tartos`, `celres-meccsero-3-9-364`,
  `nf-run-hangolas`, `sp-sulyozott-3-9-289`) ezt az ágat mérik tovább.
- **A lépcsős (ligalépcső) 1. idény** a lépcső mezőny-ígéretével fut.
