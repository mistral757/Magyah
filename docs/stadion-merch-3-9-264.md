# 3.9.264 — Stadion + Merch és PR

> A közös karrier társa: „A szurkolói bázis 700k. De gondolom egy meccsen
> nincsenek 700 ezren, nem vesznek annyian jegyet. […] Lehet, hogy kellene
> stadion és bővíthető legyen és legyen fenntartási költsége. És persze legyen
> pozitív a mérleg, de ne ennyire. […] És jó az új szurkolók fizessenek be
> tagdíjat. És ha mindig sok új szurkoló jön, akkor legyen tele a stadion. De
> ha nem jönnek újak és sokszor kikapunk, akkor kevesebben jöjjenek a
> meccsekre."
>
> A projektgazda: „Be kell építeni a stadiont + akkor kellene legyen ennek egy
> párja a merch és PR részleg, akik meg a teljes szurkoló bázissal számolva
> tudnának bevételt generálni. […] első szezontól folyamatosan fejleszthető
> legyen, kb. hasonló income rate legyen belőle mint eddig volt, csak kelljen
> érte dolgozni. […] az itteni árak azért legyenek sokkal lájtosabbak
> eleinte, mint mondjuk egy boost ára. És a max stadion capacity az 120k
> legyen."

## A régi képlet

```
heti bevétel = a TELJES tábor × jegyár × élmény
```

A 700 ezres táborból mind a 700 ezer jegyet vett, minden meccsen. Innen jött
a 83 000 milliárd.

## Az új: három láb

A „jegyár” lent a régi fejenkénti átlag. A régi szabályai (élmény, 100 feletti
nyers erő, a keret árához igazítás) változatlanok.

### 🏟️ Jegy

* **Férőhely:** 12 fokozat, 3 000 → 5 000 → 8 000 → … → **120 000**.
* **Kereslet:** a tábor 25–100%-a.

  ```
  0,30 + 0,40 × forma + 0,30 × lendület
  ```

  * **forma:** az utolsó 5 meccs pontjai (győzelem 3, döntetlen 1);
  * **lendület:** az utolsó 5 meccsen érkezett új szurkolók a tábor 3%-ához
    mérve.

  Sok győzelem és sok új szurkoló esetén a teljes tábor kijönne, tele a
  stadion. Öt vereség után, új szurkoló nélkül csak 30%-a.
* **Nézőszám:** a kereslet és a férőhely kisebbike.
* **Bevétel:** néző × jegyár × 1,6.

### 🛍️ Merch és PR

* **A teljes táborból hoz:** fejenként a jegyár 5% … 45%-a, 0–8. szint.
* **Tagdíj:** minden új szurkoló egyszer fizet, a jegyár 0,5–4,5-szeresét a
  szint szerint.

### 🧹 Fenntartás

Meccsenként a férőhely × jegyár 10%-a. A nagy stadion üresen is pénzbe kerül.

## Kalibráció

A régi lelátó-bevétel = 100%, közepes formánál, fenntartással együtt.

| helyzet | arány |
|---|---|
| induló karrier (8 ezres tábor, 5 ezres stadion, merch 0) | ~99% |
| középkarrier (60 ezres tábor, 35 ezres stadion, merch 4) | ~113% |
| 700 ezres tábor, teljesen kiépítve (120 ezer, merch 8) | ~71% |

Valódi meccseken mérve az 1. idényben a meccsenkénti bruttó 40 a régi 41
helyett, a nettó (fenntartás után) 37.

## Árak

Az ár a fejlesztés hozamához mért: kihasználva nagyjából 1–1,5 idény alatt
térül meg. A kezdő idények kedvezménye (−50% / −33%) itt is jár.

Az 1. idényben:

| tétel | ár | az ifi-boost árához (2 200) |
|---|---|---|
| merch-szint | 100 | ~5% |
| stadion-fokozat | 300 | ~14% |

A karrierrel együtt nőnek, mert a jegyárból és a táborból számolnak.

## Futó karrierek (átállás)

A stadion a mostani táborhoz épül: a legkisebb fokozat, ami a tábor 60%-át
befogadja, legfeljebb 120 ezer. Egy 30 ezer fölötti táború karrier a merch- és
PR-részlegből a 3. szintet kapja alapnak. A 700 ezres táború karrier így a
régi bevétel kb. 40%-áról indul, és fejlesztéssel ~70%-ig viheti fel.

## Felület

* **HUB → Menü → Csapatépítés → „🏟️ Stadion, merch és PR”** kártya. Ez a
  többi fejlesztés (Scout, ügynökség, sajtó; Keretbővítés) mellett ül, saját
  ablakkal. Az alsó sora élőben mutatja:
  * a férőhelyet;
  * a nézőszámot;
  * a merch-szintet;
  * a nettó bevételt meccsenként.

  Az első kiadásban csak az Infópultban volt, és ott nem találták meg.
* **Infópult → Szezon és mérleg:** ugyanaz a doboz a gazdasági kép alatt. Megmutatja:
  * a férőhelyet, a keresletet, a nézőszámot és a telítettséget;
  * hány szurkoló nem fér be;
  * a jegy-, a merch-, a tagdíj- és a fenntartás-összeget;
  * a két fejlesztés gombját az árral.
* **Napló:** „🏟️ 4 692/5 000 néző a lelátón · 🛍️ merch és PR … · tagdíj … ·
  fenntartás …”.
* **Könyvelés:** öt új tétel:
  * Lelátó (jegy);
  * Merch és PR;
  * Tagdíj;
  * Stadionbővítés;
  * Stadion-fenntartás;
  * Merch/PR-fejlesztés.

  A valódi bevétel mérése (3.9.263) ezeket is látja.
* **A „heti lelátó”-hoz mért tételek** (hírnév, talizmánok) mostantól az új
  bruttó bevételhez mérnek.

## 🔔 Emlékeztetők (3.9.265)

> „Értesítéseket és emlékeztetőket is kössük be rá, akárcsak arra, amikor már
> egy ideje nem költöttél boostra, scoutra stb és elérhető árú amúgy a cucc."

Két új vezetés-téma, ugyanazon a gépezeten, mint a keretbővítés és az
ügynökség.

| téma | mikor szól |
|---|---|
| 🏟️ **Stadionbővítés** | a kereslet több mint 5%-kal a férőhely fölött van (kint maradnak a szurkolók), és a büdzsé fedezi a következő fokozatot |
| 🛍️ **Merch és PR fejlesztése** | a büdzsé fedezi a következő szintet |

Hogyan jelez:

* **Pötty:** a „🏟️ Stadion, merch és PR” kártyán. A „Mutasd” kinyitja a
  menüt, és odavisz.
* **Felugró emlékeztető** („Rég nem foglalkoztál vele”): ha a téma 8 fordulója
  esedékes, utána 10 fordulónként.
* **Korlátok:** ugyanazok, mint a többi emlékeztetőnél:
  * fordulónként legfeljebb kettő;
  * szundi (⏳);
  * elnémítás;
  * kategória-kapcsoló;
  * a fő Értesítések kapcsoló.

## Ami nem változott

* **A bér** továbbra is a szerződéskori táborhoz horgonyzott (`wageAnchorWeek`).
  A késői karrierben ezért a bér a lelátó-bevételnek nagyobb része lesz,
  mérve ~12% helyett ~17%. A mérleg pozitív marad.

## Próbák

* `tools/stadion-merch-3-9-264-proba.js` méri:
  * átállás;
  * 120 ezres plafon;
  * kereslet (forma, beáramlás, férőhely-korlát);
  * kalibráció a három helyzetben;
  * korai árak;
  * fejlesztés és könyvelés, zárt kapu;
  * HUB-doboz és gomb.
* A `jegyar-skala-3-9-183` és a `jegyar-keretar-3-9-192` próba a jegyár-láncot
  méri, ezért ott a stadion-réteg ki van kapcsolva.
