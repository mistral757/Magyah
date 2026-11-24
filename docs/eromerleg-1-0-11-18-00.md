# 1.0.11.18.00 — Kezdő út, 4. fázis: az erőmérleg és a gazdasági visszatekintő

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (7.1 — „Tartós segítők”; az állapot a 16. fejezetben).
Előzmény: [kezdo-ut-leckek-1-0-11-17-00.md](kezdo-ut-leckek-1-0-11-17-00.md) (3. fázis, a leckék).

## Kérés
> […] a játék erőforrás-takarékosságra épül […] hogyan tanítjuk meg, hogy ne szálljon el a
> mezőny fölé, és maradjon tartaléka. […] Nyomjad!

Az üzenet egy mondatban: *„Annyival légy erősebb a mezőnynél, amennyi a célhoz kell — ha elszállsz,
a mezőny utánad lép, és a pénzed elfogy.”*

## 1. Az erőmérleg (a HUB-on, a büdzsé alatt)
Egy közlekedési lámpa: hol áll a mostani rés a **most elvárt** réshez képest.

| Állapot | Mikor | Mit mond |
|---|---|---|
| 🟢 a célrésben | a rés a most elvárt ± holtsávon belül | „most a tartalék és a fejlődés a dolgod, nem az újabb erő” |
| 🟡 a célrés fölött | a rés a most elvárt + holtsáv fölött | ki veszi el a többletet, és hogy a ráköltött pénz nem jön vissza: „Most ne költs erőre.” |
| 🔴 a célrés alatt | a rés a most elvárt − holtsáv alatt | „az erősítés a célhoz kell: a leggyengébb posztra, és maradjon tartalék” |
| nyár (szín nélkül) | a lezárt idény után, a kezdőrúgás előtt | a kezdőrúgáskor a mezőny a rajt-célra áll be; a nyári fejlesztésnek csak egy része marad |

**A mérce ugyanaz, amivel a nehézség dolgozik:**
- **A most elvárt rés:**
  - a 2. idénytől a rés-követés pályája (`nfKovPalya`);
  - az 1. idényben a rajt-céltól induló út, amelynek az idényátlaga pontosan a célrés: `want + 2·(célrés − want)·forduló/30`.
- **A rés** a követés saját eltolása nélkül (`levelGap() + nfKovOff()`), ahogy a rés-követés is méri.
- **A tűrés** a holtsáv (`nfHoltsav`, alapból 1,5): ezen belül a mezőny a saját ütemével nő.
- **Ki veszi el a többletet (a sárga szövege):**
  - a 2. idénytől a rés-követés, 5 fordulónként;
  - az 1. idényben a téli felmérés, a célrés + a téli tűrés (laza +1,0 · normál +0,5 · szigorú 0) fölötti részt;
  - utána a következő rajt.

**Mikor látszik:**
- csak a ligapiramis nehézségi fokozatainál (`nfOn`); kupasorozat és osztályozó alatt nem;
- a Kezdő úton a „Mérleg” szakasszal nyílik, a Boost-központtal együtt.

A „Erőforrás és a mezőny” lecke 2. lépése most erre a jelzőre mutat (👉 Mutasd).

## 2. A gazdasági visszatekintő (a szezonzáró jelentésben)
**„💰 Gazdasági visszatekintő — a N. idény”**, a főkönyvből (`S.ledger.rows[N].cats`):
- ⚡ **erősítésre** költött pénz, tételesen: igazolások, boostok, poszt-betanítás, felállások, stáb;
- 🏗️ **fejlesztésre:** stadion, merch/PR, scout, ügynökség, keretbővítés;
- 💸 **bér** és 💰 **bevétel**;
- 📊 a meccserőd és a mezőny az idény elején és végén, és a rés változása;
- **a tanulság a zárórés szerint:**
  - 📈 *Elhúztál a mezőnytől* — jövőre elég kevesebbet költeni erőre;
  - 📉 *A mezőny alatt zártál* — az erősítés a célhoz kell;
  - ⚖️ *A célrés körül zártál* — jó egyensúly.
- Egy sor jelzi, hogy a meccserő változása nem csak a költésből jön (fejlődés, forma, morál).

**Az idény pillanatképe (`S.gazd`):**
- az idény nyitó kezdőrúgásakor rögzül a meccserő, a mezőny és az egyenleg (`gazdRajt`, a `startRoundNow` elején);
- minden bajnoki meccs után frissül a záró érték (`gazdMeccsUtan`);
- mentve és betöltve; az új karrier nullázza;
- a nyári költés a következő idény sorába könyvelődik, ezért annak a visszatekintőjében jelenik meg.

## Próbák
- **`tools/eromerleg-1-0-11-18-00-proba.js` (új)**, amely ellenőrzi:
  1. a Kezdő út kapuját;
  2. a zónákat ismert résre: az út az 1. idényben +2 → +4 → +6, a 15. fordulóban +4; zöld, sárga (téli felmérés / rés-követés), piros;
  3. a nyári állapotot;
  4. egy végigjátszott idény pillanatképét és a jelentést;
  5. a főkönyvi bontást és a három tanulságot;
  6. a mentést, a betöltést, a régi mentést és az új karriert;
  7. a lecke lépését;
  8. hogy nincs oldalhiba.
- **A büdzsét, a szezonzárót, a mentést és a főkönyvet érintő régi próbák:** lásd a commitot.
