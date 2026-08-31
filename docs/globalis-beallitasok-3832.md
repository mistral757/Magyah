# Hat globális beállítás-változtatás (3.8.32)

*(Minden mód, minden karrier. A beállítások továbbra sem a mentés részei —
`localStorage`-on élnek, tehát futó karrierben is átállíthatók.)*

---

## 1. A sorsolás-kapcsoló kivezetve

> „vegyük ki a valósághű sorsolás kapcsolót, nincs értelme."

Igaz volt: a véletlen sorsolás semmit nem adott hozzá — négy hazai egymás után
nem választás, csak zaj —, viszont egy sort foglalt a beállítóban, és a közös
karrierben egy **világ-tulajdonságot**, amit egyeztetni kellett.

A valósághű rend mostantól az egyetlen rend: a `schedulePref()` fixen
`"real"`-t ad. A **sorsolás-építő maga változatlan**, és egy régi, `"random"`-ra
állított böngésző sem kap más világot, mint a többiek.

## 2. A tempó újraosztva — nyolc fokozat

> „ami most a −20% az legyen az alap, legyen két fokozatnyi gyorsítás (a
> mostani alap fokozat a leggyorsabb fejlődés, így a legkönnyebb), és adjunk
> hozzá 2 további nehezítést"

| fokozat | k | az ÚJ alaphoz | a RÉGI alaphoz |
|---|--:|--:|--:|
| Villámfejlődés | 1,00 | +25% | 0% |
| Gyors fejlődés | 0,90 | +13% | −10% |
| **Alap tempó** | **0,80** | **0%** | **−20%** |
| Komótos fejlődés | 0,68 | −15% | −32% |
| Csigatempó | 0,56 | −30% | −44% |
| Gleccser-tempó | 0,45 | −44% | −55% |
| **Jégkorszak** | 0,35 | −56% | −65% |
| **Kőkorszak** | 0,26 | −67% | −74% |

**Mit jelent a futó karriereknek.** A tárolt preferencia kulcsa nem változik:
aki eddig „Alap tempó"-n volt, az továbbra is az alapon marad — csak az alap
lett lassabb. Pontosan ez a kérés: a lassítás mindenkire érvényes, aki nem
választ mást.

A Run-plafon tempó-szorzói (`PYR_RUN_CAP.tempo`) mind a nyolc fokozatra
kiterjednek; az „Alap tempó" 0,88-a változatlan horgony maradt.

## 3. Mire hat a lassítás — egységesítve

> „ellenőrizzük, hogy mire hat a tempó lassítás, legyen egységesítve, hogy
> valóban jól működjön a funkció"

Az ellenőrzés **két kimaradt csatornát** talált, és mindkettő **megkerülő út**
volt — aki lassabb tempót választott, edzés helyett hozhatta vissza ugyanazt:

| kimaradt csatorna | mi volt | mi lett |
|---|---|---|
| **poszt-tanulás és beszokás** | fix 12 (36) meccs | `12 / tempó` — lassabb tempón több meccs |
| **edzői tapasztalat** | meccsenként fix +1 | meccsenként `+tempó` |

A teljes, mostantól **tizenhárom** csatornás lista egy helyen áll a kódban
(`TEMPO_TOUCHES`): játékos-fejlődés · passzív sebesség · taktika-begyakorlás ·
összhang és párkémia · **poszt-tanulás** · **edzői tapasztalat** · akadémia
(minőség és ballagás) · scout-hatékonyság és ikon-esély · skill- és
kémia-türelem · szezonbüdzsé · szezonkártya-küszöbök · mérföldkő-jutalmak ·
európai kupák tempója.

## 4. Az ellenfelek tempókövetése újraszabva

> „most a legújabb fejlesztések után −30% tempó mellett, ha az első szezon
> győztes volt, akkor mindig tudtam 2 szintugrást vállalni, és 4 szezon alatt
> d1 winner voltam. Ez a sok új fejlesztés a jól szervezett csapatot nagyon
> jutalmazza."

**Ami közben történt.** A négy fokozat mérése (docs 5.3) a 3.4-es kód alapján
készült. Azóta bejött a szezonkártya-TSI, a hangsúly-csúszkák, a
kontra/pontrúgás-rendszer, a szerep-attribútumok és az összhang — mind a **jól
szervezett** csapatot jutalmazza, és mind a felhasználó oldalán. A mezőny
ütemén viszont semmi nem változott: a régi „Lépést tartanak" ma annyit ér, mint
korábban a „Lassan követnek".

| fokozat | share (régi → új) | top (régi → új) |
|---|---|---|
| 😴 Alvó mezőny | 0,50 → **0,58** | 0,65 → **0,70** |
| 🚶 Lassan követnek | 0,68 → **0,72** | 0,75 → **0,78** |
| 🏃 Lépést tartanak | 0,76 → **0,80** | 0,82 → **0,86** |
| 🔥 Kegyetlen | 0,83 → **0,84** | 0,91 → **0,92** |
| ⚔️ **Könyörtelen** (új) | — → 0,86 | — → 0,95 |
| 💀 **Végtelen menet** (új) | — → 0,88 | — → 0,98 |

A régi négy **mind feljebb csúszott**: az ajánlott fokozat a régi Kegyetlen
fölé került. A 0,88 az utolsó még játszható share — a 3.4-es mérés a 0,89-et
találta halálspirálnak (a rossz szezon kevesebb pénzt hoz, az kevesebb
fejlődést, az még rosszabb szezont), ezért a két új fokozat a **top-oldalon** és
az **ajánlott rés** elvárásán keményít, nem a share-en:

```
PYR_REC_GAP: … kegyet 0,0 · konyortelen +1,0 · vegtelen +2,0
```

A két új fokozaton az ajánlás már **fölényt** kér — enélkül az ajánlott rajt
eleve zsákutca volna.

## 5. Ikon-igazolások sűrűsége — új kapcsoló

> „legyen új kapcsoló az ikonigazolások sűrűségére. Lehessen csökkenteni
> további nehézség növelés céljából."

| fokozat | szorzó |
|---|--:|
| Megszokott | ×1,00 |
| Ritkább | ×0,55 |
| Nagyon ritka | ×0,25 |
| **Kikapcsolva** | ×0 |

A szorzó a `scoutIconChance()` **egyetlen torkán** ül, tehát mind a két
ikon-útvonalra egyszerre hat. A scout minőségétől és a globális tempótól
független: azok a saját csatornájukon hatnak tovább.

## 6. Az átigazolási esemény-hívó a scouttal nő

> „lehessen fejleszteni az átigazolási esemény hívó cuccot. Fejlődjön együtt a
> scouttal. De ez legyen jelezve valahol. És ennek megfelelően legyen drágább a
> scout fejlesztés és a kezdő scout max 3,5 csillagos lehessen."

**A mérce a scout, nem az ügynökség.** A régi kód az `agencyScoutEquiv()`-et
nézte, és két fix értéket adott (2, illetve 3 tíz csillag fölött) — vagyis a
fejlesztés ezen a csatornán gyakorlatilag nem látszott.

| scout | esemény/nyár (régi → új) |
|---|---|
| 1–4,5★ | 2 → **2** |
| 5–6,5★ | 2 → **3** |
| 7–8,5★ | 2 → **4** |
| 9–9,5★ | 2 → **5** |
| 10★ | 2 → **6** |

**A kezdő scout plafonja 3,5★.** Eddig 5-ig sorsolhatott, és egy 4,5-ös kezdés
fél karriernyi előnyt adott ingyen: pontosabb TSI-becslés, jobb akadémia, több
felderítés, sűrűbb ikon — és mostantól több esemény is. A scout fejleszthető,
tehát ez nem elvesz, hanem a fejlesztést teszi érdemivé.

**A fejlesztés drágább:** `SCOUT_PRICE_MULT` 0,75 → **1,15**.

| csillag | régi ár | új ár |
|---|--:|--:|
| 3,5★ | 12 000 | **18 000** |
| 5★ | 21 500 | **32 500** |
| 7★ | 39 000 | **59 500** |
| 9★ | 75 500 | **116 000** |
| **3,5★-tól 10★-ig, összesen** | **521 500** | **797 500** (+53%) |

**A jelzés** két helyen: a scout sorában (`… · 3 átigazolási esemény/nyár · a
következő fél csillag …`) és a fejlesztő panelen, közvetlenül az ár mellett —
ott dől el a döntés. A panel kimondja a mostani keretet és azt is, hány
csillagnál nyílik a következő.
