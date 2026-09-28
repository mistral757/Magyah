# 3.9.163 — Hang és zene

> „Mindent csinálj, amit a folytatásnak írtál, és írj még kis apróságokat a
> meccseseményekhez is. És az lenne az igazán menő, ha a csapatstílusoknak is
> lenne saját dallama… és mindegyiknek jó lenne egy kis saját signal szerű
> rövid verziója."

## Egy régi konzol, kódból

Minden hang a böngésző WebAudio-jában születik: négyszög- és háromszöghullám,
8-bites zaj, egy kis visszhang. **Nincs hangfájl**, a játék mérete nem nőtt, és
offline is szól. A motor a hangpult-minta kódja, beépítve (`hang(id)`).

A böngésző szabálya szerint hang csak az első érintés után szólhat; addig a
motor csendben vár.

## Hangeffektek

| hol | hang |
|---|---|
| minden gomb | halk kattanás |
| kezdőrúgás / félidő / lefújás | sípszó: hosszú / kettő / három |
| lefújás után | győzelem-, döntetlen-, vereség-dallam |
| gól / kapott gól | felfutó fanfár + moraj / ereszkedő dallam |
| sárga / piros lap | két hang / lefelé csúszó hármas |
| sérülés | tompa puffanás |
| kapufa | fémes csengés |
| bravúr, kivédett tizenegyes | suhanás + magas hang |
| megítélt tizenegyes | dobpergés |
| VAR-ellenőrzés | két csipogás és kérdő hang |
| mesterhármas | csillogó futam |
| ajánlatok (kihívás, átigazolás, álomjátékos, ikon, PvP-ellenfél kész) | értesítő hármas |
| talizmán-húzás / legendás a kínálatban / fúzió / égetés | felszálló / csillogó / összeolvadó / sistergő |

A meccs hangjai csak **nézett** meccsen szólnak; végigjátszásnál (`S.auto`)
hallgatnak. A ritkább eseményeket (kapufa, tizenegyes, VAR, mesterhármas) a
napló szövegéből ismeri fel egy szűrő (`HANG_SOR`), mert a motor sok helyen írja
ki őket.

## Zene

Három menüdal, azonos hangszerekkel:

* **Öltözői főcím** (132 BPM), a mintából;
* **Taktikai tábla** (96 BPM), lassabb, háromszöghangú, d-mollban;
* **Meccsnap** (152 BPM), pörgős, futó basszussal.

A zene saját csatornán, saját hangerővel szól. Meccs közben, háttérbe tett
lapnál és stílus-dallam alatt hallgat, utána magától visszajön.

## A csapatstílusok

Mind a nyolc stílusnak saját **dallama** és rövid **szignálja** van, a
karakteréből:

| stílus | dallam |
|---|---|
| 🧱 Beton | nehéz, lassú induló a-mollban |
| ⚽ Bombázók | robbanó C-dúr akkordfutamok, a végén durranás |
| ☯️ Béke és harmónia | lágy, háromszöghangú F-dúr |
| ⭐ Sztárom a párom | fanfár D-dúrban, csillogással |
| ⚡ Villám (Hol jön a mennydörgés?) | száguldó arpeggio, 172 BPM |
| 🛡️ Panzerkampfwagen | mély, fenyegető d-moll, dübörgéssel |
| 🌀 Tiki-Taka | apró, oda-vissza „passzolgató” hangok |
| 🧲 Gegenpressing | lüktető, tolakodó h-moll |

* **A dallam** a stílus-menüben szól. Ha már két filozófiád van, a menü
  megnyitásakor és a ⇄ váltáskor a nézett stílusé hangzik el. A menüzene
  közben elhallgat.
* **A szignál** stílusonként meccsenként egyszer szól, amikor a stílus a pályán
  működésbe lép: a stílus-motor első látható pontja, Panzernél az első
  rettenet, Sztárnál az első hírességpont. Meccsek között is egyszer szólhat,
  odaillő jutalomnál: passzkémia (Tiki-Taka), gyilkos páros (Gegen), szárny-
  duó (Villám), stílus-mérföldkő, képesség-vásárlás. Csak a saját stílusod
  jutalma szól.

## Beállítások

A ⚙ Beállítások ablak új szakasza: **hangok be/ki**, **hangerő**, **zene be/ki**,
**zene-hangereje**, **menüdal** és „▶ Belehallgatok”. A fejléc 🔊 gombja gyors
váltó: minden szól → csak effektek (🔉) → csend (🔇). A beállítás a
böngészőben él (`30-0-hang-v1`), mint a téma, nem a mentésben.

## Próba

* `tools/hang-proba.js`
* A teljes regresszió.
