# ⚔🎯 Stílusgólok a párharcban, a gól típusa mindkét oldalon (1.0.9.2.00)

## A kérés

> „Mi is az akadálya annak, hogy legyenek a párharcban is képesség gólok? Az
> nagyon eltérő élmény így, mert mikorra már 3 csapatstílusod van, tökre arra
> építesz, hogy abból van egy csomó gólod. Próbáljuk már meg megoldani. És
> még jobb lenne, ha mindkét oldalon látszana, hogy melyik gól milyen típusú.
> Azaz, hogy skill gól, csapatstílus gól, vagy sima gól."

## Az akadály

A stílusgólok a **saját gépeden** születnek, a saját adataidból:
attribútumok, stílusszint, képességfa, szerepek.

A párharc közös eseménylistáját viszont az a gép számolja, amelyik előbb ér
oda (`h2hSimulate`), és annak nincs meg a másik csapat poolja. Ezért a
párharcban eddig mind ki volt kapcsolva: `TT_PLAN=DUEL?[]…`,
`AKC_PLAN=DUEL?[]…`, a gegen-büntetés `!DUEL`, a gólétvágy `!DUEL`.

## A megoldás

Ugyanaz, mint a gólsúlyoknál (`gw`): **a gazda-gép a saját motorjával előre
kiszámolja a csatornáit**, és a pillanatképpel együtt elküldi (`sty`). A
közös szimuláció csak lejátssza. A pályán-lét, a plafon és a gólétvágy ott
dől el, a közös véletlenből.

**🌀 Tiki-Taka passzrekord, 🎬 az öt akció-képesség.**

- **Az ellenfél kell hozzá:** az eredményük az ellenfél erejétől függ,
  amit a gazda a feltöltéskor még nem ismer.
- **A rács:** a gazda az ellenfél **7 lehetséges erejére** (a saját ⚡-jához
  mért rácson: ×0,80 … ×1,25) lefuttatja a helyi `ttPlanMatch` /
  `akcPlanMatch` + `akcVegrehajt` függvényeket, **ugyanabból a rögzített
  véletlenből**.
- **A választás:** a közös szimuláció a valódi ellenfél ⚡-jához
  legközelebbi rácspontot veszi.

**🧲 A gegenpressing-büntetés** nem függ az ellenféltől:

- a labdaszerzés, a szerző és a büntetés előre kidobva, a helyi képlettel
  (`gpPressPerMatch`, `gpPlayerWeight`, `gpPunishP`);
- a meccsenkénti plafont és a pályán-létet a szimuláció nézi.

**🔥 A Bombázók gólétvágya:**

- **Mikor élesedik:** egy skill-gól után, a következő ötpercben.
- **Hogyan dől el:** a közös véletlenből, meccsenként egyszer, ugyanúgy, mint
  a helyi motorban.

**Ami a szimulációban dől el:**

- Ha a gólszerző közben lejött (csere) vagy kiállították, az alkalom elmarad.
- A Tankoljunk gólja a jelenet első, pályán lévő tagjáé (a párharc
  listájában minden gólnak gólszerző kell).

**A 🔗 szinergia nem kerül át.** A lánca meccs közbeni eseményekre reagál
(`szinTick`: kivédett helyzetek, előző gólok), és ezt előre nem lehet
becsületesen kiszámolni. A különleges események (11-es, öngól, supersub)
sem kerülnek át.

## A gól típusa (mindkét oldalon)

A közös lista minden gólnál viszi a típust:

- **`kind:"stilus"`**, a `src` csatornával (`tt`, `sortuz`, `phalanx`,
  `szaguld`, `tank`, `egyens`, `press`, `bz`);
- **`kind:"skill"`**: a gólszerzőnek kész gólszerző képessége van (ugyanaz
  a mérce, mint a helyi motorban: `goalSkillInst`), a képesség nevével
  (`skn`);
- **`kind:"sima"`**: minden más gól a gólvárhatóságból.

**A naplóban:**

- **Minden gól sorának végén** ott a típus, a társ góljainál is: `· 🎯
  csapatstílus-gól: 🔥 Bombázók — Sortűz`, `· ✨ skill-gól: Gólzsák`, `· ⚽
  sima gól`.
- **A stílusgólnak saját sora is van**, a helyi motor szövegeivel (Sortűz,
  passzsor, letámadás, gólétvágy).
- **A saját stílusgólok** a jelenet-animációt is megkapják.

**A párharc-elemzés** (mérleg, statisztika):

- a gólokat forrásonként bontja;
- a szerencse-számításba a stílus-csatornák **várható** gólja is bekerül (a
  gazda tervéből);
- a gólok listáján is ott a típus.

## Visszafelé

- **Régi kliens pillanatképe** (nincs `sty`): nála nincs stílusgól és nincs
  típus, a gólvárhatóság gólja ugyanúgy jön.
- **A motor jele** `mv:3`.
- **A véletlen-folyamot csak a gólétvágy fogyasztja**, és csak élesedés
  után.

## Próba

`tools/parharc-stilusgol-1-0-9-2-00-proba.js`:

- **A terv a pillanatképben:** 7 rácspont, gegen, gólétvágy, kis méret.
- **Torzítatlan:** 120 pillanatképen a kidobott stílusgólok átlaga a várható
  értéket adja, a gegen a plafonnal.
- **A szimuláció:**
  - négy forrás jelenik meg;
  - a gólszerző mindig a saját csapaté;
  - a sima és a skill-címke helyes;
  - a gegen-plafon tart;
  - ugyanaz a mag bitre ugyanazt adja.
- **Régi társ-pillanatkép:** nincs típus.
- **Valódi párharc:**
  - minden saját gól sorában ott a típus;
  - a stílusgólnak saját sora van;
  - az elemzés forrásonként bont.

## Mellékjavítás — kerethirdetés: a megnézett elemzés már nem „függő”

Ha a társ kerethirdetése a háttérben érkezett meg (`A.fuggo=1`), a ⚔ Kezdőrúgás
előbb kinyitotta az elemzést. Egy versenyhelyzetben azonban a `fuggo` jelző
akkor is fent maradt, ha az elemzést közben már megnézted — így a következő
kezdőrúgás újra az elemzést nyitotta, a párharc nem indult, és a társ örökké
várt. Most a `dkElemzes` megnyitáskor törli a jelzőt: a megnézett elemzés után
a ⚔ Kezdőrúgás mindig indít. (A `kerethirdetes-1-0-4-9-00-proba` ritka, kb.
minden 4–5. futásra jelentkező hibája ez volt.)
