# ⚖️ A papírforma és 🪜 a nehézségi létra (3.9.130)

Két kérés egy verzióban. Mindkettő ugyanarról szól: **a nehézség számai
mérjenek pontosan, és a választásnak legyen súlya.**

---

## I. A papírforma — a nyers erő és a meccs-erő közepe

> „Ezeknél a méréseknél a meccs erő és a nyers erő számtani közepéhez mérjük
> inkább az ellenfél erejét. És annak megfelelően legyen az óriásölés
> számítása is. És annak a skáláján változtassunk ennek fényében."

### Mi volt a baj

A meccs előtti **⚖️ Csapaterő** sor a nyers csapaterődet (`teamStrength`) tette
az ellenfél mellé, az **óriásölés** pedig a még nyersebb csontváz-erőt
(`teamOVRbase`). A piramis viszont a mezőnyt a **meccs-erődhöz** horgonyozza —
a két szám egyre távolabb került egymástól, ahogy a rejtett bónusz nőtt.

A bejelentett képernyőn: `164,7 — 191,6 · papíron 26,9-del gyengébb vagy`,
miközben a meccs-erő 191 körül állt. **Minden győzelem óriásölés lett**, +18
morállal.

### Mi lett

| | Régen | Most |
|---|---|---|
| **a te számod** | nyers csapaterő (az óriásölésnél a csontváz) | **(nyers csapaterő + meccs-erő) / 2** |
| **mikor mérjük** | a lefújáskor | **a kezdőrúgáskor befagy** |
| **az óriásölés küszöbe** | fix **8 pont** | a papírformád **10%-a** |
| **párharcban a társ** | a csontváz-ereje | a **saját közepe** (kijelzett + meccs-erő) / 2 |

A **meccs előtti sor** most így néz ki:

> ⚖️ Papírforma: **178,2** — **191,6** · papíron 13,4-del gyengébb vagy.
> *A tiéd a nyers csapaterőd (164,7) és a meccs-erőd (191,7) közepe. Óriásölés
> 17,8 ponttal erősebb ellenfél ellen jár (a papírformád 10%-a).*

— és ha az a meccs óriásölés lenne, azt is kimondja.

### A skála: arányos, 80-on bitre a régi

A régi, fix 8 pont egy **80-as** csapatnál 10% volt, egy **190-esnél** 4%. A
karrier során az erő-számok ~2,5-szeresükre nőnek, tehát egy fix küszöb idővel
minden győzelmet óriásöléssé tett. Mostantól **minden százalékban** számol, és
a konstansok a 80-as horgonyra vannak visszaszámolva (ugyanaz az elv, mint a
`TRAIN_SCALE_REF=80`-nál):

| Tétel | Régi (pont) | Új (%) | 80-on |
|---|---|---|---|
| óriásölés küszöbe | 8 | **10%** | ugyanaz |
| morál-jutalom | ×1,3 / pont, max 18 | **×1,04 / %**, max 18 | ugyanaz |
| „kínos eredmény" | −10 pont | **−12,5%** | ugyanaz |
| kínos büntetése | ×0,9 / pont, max 14 | **×0,72 / %**, max 14 | ugyanaz |
| rettenet/stílus-pont aránya | gap / 8 | **% / 10** | ugyanaz |
| mérföldkő-lépcsők | 10/14/18/22/26 pont | **12/17/22/27/32%** | ≈ |

A próba −20 és +20 pont között félpontonként ellenőrzi, hogy **80-on a két
szabály minden döntése azonos**.

### Mérve

Egy valódi karrier elején (piramis, D3, +2-es rés) a régi és az új döntés
azonos. Egy **emulált késői karrierben** (+28 rejtett bónusz, a mezőny a
meccs-erőhöz horgonyozva, ahogy a D0-tól minden szezonban):

| | óriásnak számító ellenfél |
|---|---|
| régi szabály | **15-ből 15** |
| új szabály | **15-ből 0** |

A bejelentett képernyő esete: a papírforma 178,3, az ellenfél 191,6 → **7,4%**,
a küszöb 17,8 pont — **nem** óriásölés. Egy tabella-csúcson álló, jóval
erősebb ellenfél legyőzése viszont továbbra is az.

### A mérföldkő új mezőbe ír

A `giantgap` mérföldkő mostantól **százalékban** mér, és a `giantMaxPct`
mezőbe ír. A régi `giantMax` nyers pontban állt — egy régi mentés 30-asa
százalékként olvasva hamis mérföldköveket teljesítene. A régi mező marad,
érintetlenül; a már megszerzett mérföldkövek megmaradnak.

### Amihez szándékosan nem nyúltam

A kihívások **„nagy skalp"** feltételei továbbra is a csontváz-erőhöz
(`teamOVRbase`) mérnek — a kérés a meccs előtti mérésről és az óriásölésről
szólt. Ha azokat is át akarod állítani, egy sor.

---

## II. A nehézségi létra

> „az ellenfél erejének választásában legyen egy sokkal differenciáltabb sáv,
> ami +6-ról indul, és 6-2 között 0,5, 2 és 0 között 0,1 tizedes lépésekkel
> lehet állítani."

### A lépcsők

```
+6,0  +5,5  +5,0  +4,5  +4,0  +3,5  +3,0  +2,5  +2,0     fél lépcsők
+1,9  +1,8  …  +0,1  0,0                                 tized lépcsők
−0,1  −0,2  …  −1,0  …  −9,0                             tized, egész sávonként nyílnak
```

Minden **tizedben** tárolva (egész szám: 25 = +2,5) — a lebegőpontos számok
összevetése (0,1+0,2 ≠ 0,3) egy kapunál azonnal hibás döntést adna.

### Mi nyitja

| Nyertél… | …megnyílik |
|---|---|
| **+2,5**-ön (alap) | +2,0 és +1,9 |
| **+1,9**-en | +1,8 és +1,7 |
| **+0,2**-n | +0,1 és 0,0 |
| **+0,1**-en | **csak** a 0,0 — a mínusz még nem |
| **0,0**-n | az egész **0 … −1,0** sáv |
| **−1,0**-n | a **−1,0 … −2,0** sáv |
| egy sávon belül (pl. −0,5) | semmi új |
| egy könnyebb fokon | semmi új |

**A győzelem** = a karrier **első élvonalbeli bajnoki címe** — a hagyományos
mód végpontja, ugyanaz, amire a Run ütem-tétele is néz. Egy karrier **egyszer**
nyit (a második cím ugyanazon a fokon született).

**A határ a feloldás-naplóban él** (`30-0-unlock-v1`, `diffFront`), karriereken
átívelően. Ami könnyebb, az mind nyitva — a könnyebbet bármikor lehet
választani.

**A kezdő lépcsők után indul.** Az első három karrier rögzített mezőnnyel
(78/80) megy, ott nincs mit választani; a létra a szabad beállítással kezdődik.

**Betöltéskori pótlás.** Ha a mostani mentésben a cím már megvan (a létra
bevezetése előtt), a győzelem betöltéskor csendben könyvelődik — a régi
preset-rés (`gapWant`) ugyanazon a meccs-erő skálán szól. Aki most 0-n nyert,
annak a mínuszos sáv azonnal nyílik.

### A választó

A hét preset-gomb helyén **egy érték**, lépcsőnként: ◀ ▶, egy csúszka, ami
**pontosan a nyitott fokokon** jár, és az **🎬 alap · +2,5** gomb. A presetek
(Sétagalopp, Kényelmes, … Kegyetlen) megmaradnak **gyorsugrásnak** — a zártak
lakattal. Alul egy sor megmondja, **mi nyílik legközelebb, és mitől**.

A vállalás mostantól **maga a választott szám** (`gapWant = diffT / 10`), nem a
legközelebbi preset — a régi rendszerben a finom csúszka csak a világot tolta
el, a vállalás a hét preset egyikére ugrott.

### A Run: jóval nagyobb súly

> „legyen jóval nagyobb jelentősége ennek a választott nehézségnek a végleges
> Run szintben."

| Fok | Régi szorzó | **Új szorzó** |
|---|---|---|
| +6,0 | 0,63 | **0,30** |
| +2,5 | 0,89 | **0,65** |
| +2,0 | 0,93 | **0,70** |
| +1,0 | 1,00 | **0,85** |
| 0,0 | 1,00 | **1,00** |

A régi görbe ±1,0-es holtsávval indult: a „nyugis" +2,5 és az „izzadós" 0
között **11%** volt. Az új görbén **35%**. A 0 és +2 között tizedenként 0,015 —
ott dől el a karrier —, fölötte 0,010.

### Mínuszban a tető nő

> „minden 0,1 lépés +10-et nyit a Run szint tetején. Azaz ott 110, 120, 130,
> 140 vagy akár lvl 200 is lehet a Run szint, ha sikerül nyerni a végén."

| Fok | Szorzó | A Run teteje |
|---|---|---|
| −0,1 | ×1,1 | **110** |
| −0,5 | ×1,5 | **150** |
| −1,0 | ×2,0 | **200** |
| −2,0 | ×3,0 | **300** |

A szorzó a **plafont** szorozza (Run = plafon × teljesítmény), tehát nem
ajándék: a tető csak akkor érhető el, ha a futás is hibátlan, és a többi
tényező (kezdő osztály, ellenfél-tempó, saját tempó) is a maximumon van.

### Ami nem változott

* **Futó karrierek Run-szintje nem mozdul.** Az új görbe csak ott él, ahol a
  karrier már az új választóval indult (`S.pyr.diffT`); a régiek a régi, mért
  réssel (`gap0`) és a régi görbén maradnak.
* **Közös karrier (PvP)** változatlan: ott a nehézséget a két menedzser alkuja
  adja, nincs kapu, a saját fél lépcsős vezérlője és a régi Run-görbe marad.
  (A mínuszos tető-emelés ott nem jár — kapu nélkül bárki −8-at választhatna.)

---

## III. Mi hol lakik

| Fogalom | Hol |
|---|---|
| a papírforma | `paperRefNow` · `paperRefKickoff` · `paperRef` · `paperOppOf` |
| a százalékos hátrány | `giantPct` · `giantPctOf` · `giantNeedPts` · `MS_GIANT_PCT` · `GIANT_REF` |
| a lépcsők | `diffSteps` · `diffSnapT` · `diffTxt` · `DIFF_DEFAULT_T` · `DIFF_FLOOR_T` |
| a határ és a nyitás | `diffFront` · `diffOpenT` · `diffNoteWin` · `diffCareerWin` · `diffCareerT` |
| a Run | `diffRunFactor` · `diffRunTop` · `pyrRunCap` (`top`) · `runBreakdown` (`top`) |
| a választó | `pyrDiffAllowed` · `pyrDiffSetT` · `pyrDiffStep` · `renderPyrDiffPick` · `pyrGapClamp` |

## IV. A próbák

* `tools/papirforma-proba.js` (9113) — 16 állítás: a mérce a közép és befagy;
  80-on bitre a régi szabály; párharcban almát almával; a késői karrierben a
  régi szabály 15/15, az új 0/15 óriást talál; a mérföldkő az új mezőbe ír.
* `tools/nehezsegi-letra-proba.js` (9115) — 32 állítás: a lépcsők; a friss
  profil határa; a nyitás szabálya **szó szerint a kérés példáival**; a
  választó nem enged zárt fokot; a megerősítés a finom számot teszi el; egy
  karrier egyszer nyit; a régi mentés pótlása; a Run-görbe és a tető.
* `tools/rettenet-meccs-proba.js` átállítva százalékra (a 2/4/8 pontos
  jelenetek 2,5/5/10%-ként — 80-on pontosan ugyanaz a három pont).
