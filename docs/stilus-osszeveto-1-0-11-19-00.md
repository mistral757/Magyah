# 1.0.11.19.00 — Kezdő út, 5. fázis: a stílus-összevető és a stílus leckéi

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (7.3, 6.4 „A klub filozófiája”; az állapot a 16. fejezetben).
Előzmény: [eromerleg-1-0-11-18-00.md](eromerleg-1-0-11-18-00.md) (4. fázis, gazdaság).

## Kérés
> […] csapatstílusok, skillfa, stíluspontok — érthetővé tenni. […] Mehet az 5. fázis!

A roadmap elve: **„Nem mondjuk meg, melyiket válassza. Megmutatjuk, mi mire való.”**

## 1. A stílus-összevető (a választó kártyáin)
A választó eddig is egyforma kártyát adott minden filozófiának:
- jelmondat és leírás;
- otthoni felállás és taktika;
- a filozófus-edző;
- a zár feltétele.

Most mind a 8 kártya ugyanazt a **három új sort** kapja:

| Sor | Tartalom |
|---|---|
| 💪 **Mit erősít** | a filozófia iránya egy sorban (a leírásából és a mérföldköveiből) |
| 🧩 **Milyen keret illik** | amire a mérföldkövei és a képességei épülnek |
| 👁 **A kereted szemével** | a MOSTANI kezdőid (a Panzernél a teljes keret) számai azon a mércén, amit az a stílus néz |

**A kereted szemével**, stílusonként:
- 🧱 Beton: a védősor és a kapus átlag-Ratingje, mellette a kezdők átlaga;
- ⚽ Bombázók: a támadósor átlaga, a kezdők átlaga, és a legjobb Gólszerzés elöl;
- ☯️ Harmónia: a kezdők Rating-szórása (minél kisebb, annál egyenletesebb);
- ⭐ Sztár: a legjobb és a második legjobb embered, és a kezdők átlaga;
- ⚡ Villám: a 6 leggyorsabb mezőnyjátékos Sebesség-átlaga (`SPEED_CORE_N`, ugyanaz a mag, amit a sebesség-tengely is néz);
- 🛡️ Panzer: a forró vérmérsékletű játékosok száma a keretben (`TRAIT_BAND.verForro`);
- 🌀 Tiki-Taka: a mezőnyjátékosok Passz-átlaga;
- 🧲 Gegenpressing: a mezőnyjátékosok Sebesség- és Védekezés-átlaga.

**Ítélet nélkül:** nincs szín, nincs „ajánlott”, nincs pontozás. A számok a játékoséi.

A sorok **minden karrierben** látszanak, nem csak a Kezdő úton.

## 2. A stílus két leckéje
| Lecke | Mikor indul | Lépések |
|---|---|---|
| **A klub filozófiája** | a Kezdő úton magától, amikor a szezonjelentés a választóhoz visz (egyszer) | ✅ a döntés súlya (egyszeri, végleges; nem tilt semmit) · 👉 mind a 8 egy kártyán (a lista kiemelve) · ✅ a pontok útja (mérföldkő → pont → képességfa) · ✅ hogyan válassz |
| **Stíluspont és képességfa** | a választás után magától (egyszer) | 👉 a csapatstílus-pont (amit elköltesz, végleges — mint a pénz) · 👉 a képességfa (a hatás-típusok, 3 szint, egyre drágábban) · 👉 a stílus-mérföldkövek · ✅ takarékosan (a fa felénél is kevesebb fér bele egy karrierbe) |

- Mindkét lecke megvárja a szezonzáró ablakokat (menedzsment-célok, Infópult): addig kis sáv.
- A „Mutasd” lépések a stílus-műszerfal valódi szakaszait emelik ki. A lecke-motor ehhez két újdonságot kapott:
  - **CSS-szelektoros célpontot** (`sel`), mert a szakaszoknak nincs azonosítója;
  - **előkészítő lépést** (`pre`), ami kinyitja a stílus-panelt.

## 3. A Kezdő út új szakasza: „A klub filozófiája”
- A „Mérleg” után, a „Hosszú táv” előtt.
- **Feladatok (3-ból 2):**
  - válaszd ki a filozófiát (`set:style`);
  - nézd meg a stílus-képességeket (`view:styletrait`);
  - nézd meg a stílus-mérföldköveket (`view:stylems`).

  A „megnézés” jele a szakasz kinyitásakor vagy a nyitott állapotban (pl. új mérföldkő miatt magától nyitva) is megjön.
- **Tartalék:** a 2. idény 3. fordulója.
- **Nyitás:** nincs. A szakasz a döntést kíséri, nem funkciót nyit.
- A kártyán a „📖 Mutasd, hogyan” a döntés előtt a stílus leckéjét, utána a képességfa leckéjét indítja.

## Próbák
- **`tools/stilus-osszeveto-1-0-11-19-00-proba.js` (új)**, amely ellenőrzi:
  1. hogy mind a 8 kártyán ott a három sor, ítélet és szín nélkül;
  2. hogy a számok a valódi keret számai (függetlenül újraszámolva);
  3. a szakasz helyét és a kártya gombját;
  4. a lecke automatikus indulását és várakozását, és a lista kiemelését;
  5. a választás után a második leckét: mindhárom kiemelés a valódi szakaszra mutat;
  6. hogy a szakasz 2/3-mal lezárul;
  7. hogy Kezdő út nélkül nincs lecke, de a sorok megvannak;
  8. hogy nincs oldalhiba.
- **`kezdo-ut-leckek-1-0-11-17-00`:** frissítve (10 lecke; a kezdő bot az első idény után a filozófia-szakasznál tart).
- **A stílus és a Kezdő út régi próbái:** lásd a commitot.
