# ⚔⚙️ 1.0.9.2.01 — A motor-szorzók a párharc közös gólvárhatóságában

## A kérés

> „Ami fontos, hogy ne csak animáció, meg közös esemény szinten, hanem
> meccsmotor, gólvárhatóság, stb szinten is érvényesüljenek ezek. Ahogyan a park
> the bus védekező profilja is, főleg amikor bejön a buszsofőr. Az is
> látszódjon, hogy mikor jön be, és legyen tényleges motorbeli hatása, amiről
> mindkét oldal egységes tudomást szerezzen."

## Mi hiányzott

A helyi meccsen a gólvárhatóság vödrönként egy szorzósoron megy át
(`_mfOwn` / `_mfOpp` a `playMatchMotor`-ban). A párharcban ez a sor üres
(DUEL → null), mert a közös lista dönt, és a közös szimuláció (`h2hSimulate`)
a sornak csak egy részét ismerte. Ezt már kezelte: a taktika és a stílus gól-
és védekező szorzói, a szerepek, a csúszkák, a talizmán, a kiállítás, a
rákapcsolás és a buszsofőr két alapszorzója. **Nem** ismerte viszont ezeket:

| szorzó | helyi képlet | mikor hat |
|---|---|---|
| 🦸 hajrá-képesség | `clutchAttackMult` | 2. félidő, legalább 2 gólos hátrány |
| 🪽 Szárnyak | `szarnyGoalMult` | a kész páros mindkét tagja a pályán van |
| ⚡ Villám-fáradás | `villamFadeOwn` / `villamFadeOpp` | a hajrá (saját −, ellenfél +) |
| 📈 Gólbörze rekord-hajrá | `bzRecGoalMult` | a klubrekord közelében, onnantól végig |
| 🎯 csukafejes | `csukaLamMult` | a pályán lévő legerősebb csukafejes |
| 🔗 szinergia | `szinOwnMult` / `szinOppMult` | az állandó (nem eseményhez kötött) tagok |
| 🚌 „busz” csúszka | `busDial` | a buszsofőr két szorzóján |

## A megoldás

**A profil (`lm`)** a gazda gépén áll össze, a pillanatképpel együtt
(`h2hLmProfil`), csupa számból és névből:

- a Villám szorzói vödrönként (`vo`, `vp`);
- a hajrá-képesség ereje játékosonként (`cl`);
- a kész Szárnyak-párosok (`sz`);
- a rekord és a küszöbe (`br`);
- a csukafejesek (`cs`);
- a szinergia pár, szint, egyensúly, sztár és félelem (`sn`).

A tervezett cserével beálló emberek is benne vannak. A buszsofőr-szabály a
csúszka értékét is viszi (`bd`).

**A közös szimuláció** a saját menet közbeni állapotával értékeli ki a profilt
(`lmOwn` / `lmOpp`): a perc, az állás, és hogy ki van a pályán (csere, piros
lap). A képletek betűre a helyiek. Véletlent nem fogyaszt; régi
pillanatképnél nincs `lm`, és akkor minden szorzó 1.

**A könyvelés** vödrönként a végső λ-ból számol: `L·(1−1/m)` adja, mennyi
várható gól jött az adott szorzótól. A szám a gazdája oldalán áll, `p:`
előtaggal, ha az ellenfél λ-ját mozdította. A sim `lm` mezője
(`{home:{x,busMin,bo,bp}, away:…}`) a szobában tárolt listával együtt
utazik. A listát az a gép számolja ki, amelyik előbb ér oda, a másik ugyanazt
kapja — tehát a két oldal **ugyanazt** a számot látja. Motorverzió: `mv:4`.

## A buszsofőr mindkét oldalon

- **A sajátod:** a behívás sora a közös lista percével jelenik meg, és a két
  kész szorzóval (`bo`, `bp`), azzal a megjegyzéssel, hogy „a társad is ezt
  látja”. A lejátszás **nem utasíthatja vissza**: eddig, ha a helyi
  középpályás- vagy taktika-ellenőrzés nem egyezett, a sor elmaradt, a közös
  szimuláció viszont már a busszal számolt.
- **A társé:** eddig a te képernyődön egy szót sem szólt, csak a gólesélyed
  zuhant csendben. Most ugyanaz a jelenet jelenik meg (🚌 animáció, az ő
  mezében), a perccel és a két számmal: „A ti gólesélyetek X%-kal zuhan — az
  övék Y%-kal esik vissza”.
- **Az elemzés** („⚔ A párharc ellenőrzése”) új blokkja a „Motor-szorzók a
  közös gólvárhatóságban”. Oldalanként és szorzónként mutatja, hány várható
  gólt mozdított a saját és az ellenfél oldalán, a buszsofőrnél a perccel és a
  két szorzóval együtt.

## Ami továbbra sem fut a párharcban

- A szinergia **eseményekhez kötött** jelenetei és ablakai (`szinTick`): ezek
  a helyi meccs saját sorsolásai.
- A különleges események (11-es, öngól…).

## Próba

`tools/parharc-motorszorzo-1-0-9-2-01-proba.js`:

- **A profil hatása a λ-n:**
  - Villám ×0,8 / ×1,25, előjeles könyveléssel;
  - Szárnyak ×1,06, csak ha mindkét tag a pályán van;
  - a hajrá-képesség csak nagy hátrányban hat.
- **A buszsofőr:**
  - a behívás előtt nincs hatás;
  - a behívás vödrétől ×0,34 / ×0,75;
  - a csúszka betűre a `busDial` szerint számol;
  - a könyvelés helyes.
- **Régi pillanatkép:** nincs hatás.
- **Determinizmus:** ugyanaz a mag ugyanazt a listát adja.
- **Valódi párharc:**
  - a saját és a társ buszsofőrje is kiíródik a két számmal;
  - az elemzés blokkja mindkettőt mutatja.
