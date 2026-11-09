# 🔗 Szinergia (1.0.6.3.00)

A terv: [szinergia-terv.md](szinergia-terv.md) (28 pár, jóváhagyva: „Nagyon jók
lettek a tervek. Egyelőre mindegyik tetszik! […] Építsd be").

## A keret

- A 3. csapatstílustól nyílik. Mindig **egy pár** szinergiája él a meglévő
  stílusok közül: 3 stílusnál 3, 4-nél 6 pár közül.
- **3 szint** a közös csapatstílus-pontból: **90 / 150 / 240** (a talizmán
  „Olcsóbb fa” kedvezménye is él). A szint a Szinergiáé, a párváltás nem
  viszi el. Szorzó: ×1 / ×1,7 / ×2,5; a 3. szinten a pár saját csavarja.
- **A választó** felugrik a 3. és a 4. stílus felvételekor, és akkor is, ha
  egy újraválasztással a pár egyik stílusa kiesett. Ezek a választások
  ingyenesek. Ezen felül **idényenként egy váltás** jár.
- **Szezonkezdéskor** naplósor, és a menü jelzése (`style:szin`), ami addig
  áll, amíg az idényben ki nem nyitod a Szinergia panelt.
- **Felület:** a rögzített stílusjelvény-sáv alján a 🔗 Szinergia sora
  (pár, szint), alatta a lenyitható panel: a mostani pár lánca és csavarja,
  a vásárlás, és az összes pár a váltás gombjával.

## A motor

`_szc` a meccs szinergia-állapota (kezdőrúgáskor `szinMeccsKezd`, lefújáskor
`szinMeccsVege`). A horgok:

| horog | hol | mire |
|---|---|---|
| `szinTick` | az ötperces ütem elején | az előző ütem góljai (a sztár gólja, a sebesség-gól), a kivédett ellenfél-helyzetek, a saját labdaszerzés és szabálytalanság, a pár saját passzsora |
| `szinPress` | a pressing-labdaszerzésnél | Csapda, Villámcsapás, Fojtás, Vasmarok, Labdakör |
| `szinTT` | minden passzsornál | Labda-pihentetés, a megszakadt sor csavarjai |
| `szinTTOpts` → `ttRunChain(…, opts)` | a passzsor | befejező, fal, sebesség-váltás, passzonkénti bónusz, védett passzok, ellenállás, sztár |
| `szinOwnMult` / `szinOppMult` | a vödör λ-listája (`_mfOwn` / `_mfOpp`) | az időablakok és a feltételes szorzók; az elemzésben „szin” tényező |
| `szinGoalW` / `szinAssistW` | a gólszerző és a gólpasszadó súlya | A bunker királya, A sztár futópályája |
| `szinGpRateMult`, `szinGpW`, `szinPunishMult`, `szinMouseOff` | a pressing | Fojtás csavarja, Vasmarok, Sztár-roham, Zen-pressing |
| `szinYellowMult`, `szinRedCostMult`, `szinPeaceRedMult` | a lapok | Zen-pressing, Hideg düh |
| a lánc-gólok sora | az akciók után | ugyanaz a könyvelési út, mint az akció-képességeké; forrás: „szin” (🔗) |

**A mérés** az 1.0.6.1.02-es mércével megy: az attribútum a meccserő-többlettel
felskálázva, az ellenfél meccserejéhez (`szinQ`: alap × (1 + eltérés/25),
×0,4…×1,5, × a szint szorzója). A pár saját passzsorának gólja a lánc
minőségéből **és** `0,08 × m` eséllyel jön (`SZIN_LANC_P`).

**Ha a pár egyik rendszere nincs megvéve** (nincs passzrekord, nincs
nyomásgyakorlás), a szinergia maga ad alapot: meccsenként 1 passzsort
(Labda-pihentetésnél kettőt), illetve ~1,2 labdaszerzést.

**Párharcban nem fut.**

## Eltérések a tervtől (a valós rendszerekhez igazítva)

| pár | a terv | a megvalósítás | miért |
|---|---|---|---|
| 🛡️💥 Acélfal | „a Félelem szint nem fogy kapott gól miatt” | csak a lövés-gyengítés | a Félelem szint a keret jelleméből számolódik, kapott góltól nem fogy |
| ☯️⭐ Csapatsztár | „a kiszolgálás ára −30%” · morál-padló: senki nem eshet 10 ponttal alá | +3% gólesély, ha a sztár a pályán van és az egyensúly ≥ 70% · csavar: vereség után legfeljebb −5 morál | a Kiszolgálás nem csökkenti a többiek esélyét; a morál csapatszintű |
| ⚡☯️ Végtelen motor | a sebesség-képességek ×1,2 a 75. perctől · csavar: a leglassabb szélső felzárkózik | +4% gólesély a 75. perctől · csavar: a 60. perctől | egy közös gólesély-szorzó tisztábban mérhető |
| ⚡💥 Lavina | a szélsők Sebessége +3% | +2% gólesély 30 félelem fölött | ugyanaz |
| ☯️🧲 Zen-pressing | a pressing nem hoz sárgát | −30% sárgalap-esély | a sárga a teljes csapatra sorsolódik |
| 🔥💥, 💥⭐ | „az ellenfél lapja” | a megfélemlített ellenfél **szabálytalansága** (a Félelemmel gyakoribb, legfeljebb a duplája) | az ellenfél sárga lapjait a motor nem modellezi |
| 🔥🛡️, 🛡️⚡ | 6% | 3,5% | a mérés szerint egy meccsen több ellenfél-helyzet van, mint becsültem |
| 🔥🧲 Csapda | 8% | 10% | a lövés maga is a Gólszerzésen múlik |
| ⚡⭐ A sztár futópályája | csak gólpassz-súly | + 2% gólesély; csavar: a sztár gólja után 25% eséllyel kontra | a súly önmagában csak átrendezi a gólokat |
| 🛡️🧲 Fojtás | „abban az ütemben” | a labdaszerzés utáni 5 percben | a λ az ütem elején dől el |

**Jelenet:** a lánc-gólok a meglévő jeleneteket használják (Sortűz,
Száguldás, tiki-taka passzsor), saját animáció még nincs.

## Mérve

`tools/szinergia-1-0-6-3-00-proba.js`, 28 pár × 6 valódi meccs a 3. szinten:
- minden pár hatása elsül;
- a lánc-gólok forrásként kerülnek az elemzésbe;
- egyik pár várható lánc-gólja sem több meccsenként 0,55-nél;
- a lánc-gólok összesen a várható körül vannak (14 gól 15,1 várhatóra).

A direkt gólforrású párok a 3. szinten nagyjából 0,1–0,4 gólt hoznak
meccsenként. A λ-párok hatása ennél kisebb, de folyamatos.
