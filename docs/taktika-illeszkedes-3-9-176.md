# 3.9.176 — A taktika-illeszkedés a saját elvárásodhoz mér, a plafon a nyers erővel nő

## 1. Az illeszkedés új mércéje

> „Itt egy 72-es Széljáték-illeszkedést látunk. Én erre biztosan 100-at
> adnék. A gond: az attribútum-számok egymáshoz mérnek, és így egy nem
> fókuszában lévő attribútum erősödése akkor is lerontja az illeszkedést, ha
> a fókuszált nem gyengül közben."

### Miért nem lehetett a régit megjavítani

A bejelentett keret tengelyei: Véd 243 · Kap 187 · Pas 249 · Gól 258 · Seb 278.

A Széljáték két fő tengelye (Seb 45%, Gól 27%) a keret két legerősebbje, a
régi képlet mégis 72%-ot adott, mert a tengelyeket **egymáshoz** mérte:

* a horgony a Véd + Passz + Gól átlaga volt;
* a Sebességtől ehhez képest a szint alapján ~+30-at várt;
* a 278-as Sebesség így „a várt alatti” lett, a gyenge Védekezés és Védés
  pedig még pluszt is hozott.

Amíg a tengelyek egymáshoz mérnek, bármelyik tengely emelése eltolja a mércét
a többi alatt. Ez matematikai szükségszerűség, nem hangolási kérdés.

### Az új mérce: a játékosaid Ratingjéből várt érték

Az attribútumok a Rating minden mozdulását 1:1-ben követik, a poszt-profil
pedig megadja az alapjukat. Ami e fölött van, az a keret **specializációja**.
Ezt adja:

* az edzésterv;
* az attribútum-boost;
* a skillek;
* a megbízások;
* a felállás.

A számítás menete:

1. **Csak a taktika fő tengelyei számítanak**, vagyis a lapos 20% fölötti
   súlyúak. Például a Széljátéké a Gól és a Sebesség.
2. **Fő tengelyenként** a többlet a Ratingekből várthoz képest:

   | többlet | érték |
   |---|---|
   | 0 | 50% |
   | +10 | ≈ 88% |
   | +20 | ≈ 98% |
   | −10 | ≈ 12% |

3. **Az illeszkedés** ezek súlyozott átlaga. A súly a lapos 20% fölötti
   rész.

### Mit jelent ez a gyakorlatban

* **Egy nem fő tengely nem ront és nem javít.** Egy Védekezés-boost a
  Széljátéknak semleges, a Park the busnak javít.
* **Egy fő tengely emelése mindig javít.** Az edzés, a boost és a skill
  közvetlenül látszik.
* **Magától nem esik vissza.** A Rating fejlődése az elvárást és a tényleges
  értéket együtt viszi.
  * Egyetlen kivétel: normál módban a Sebesség 99-es kemény plafonja levágja
    a betanított többletet. Ezt a motor is levágja, tehát ott a csökkenés
    valós. Infinityben ez a plafon nyitva van.
* **Egy semleges, érintetlen keretnél** minden rendszer 50%.

### A panel

**HUB → Taktikák:**

* **A tengelyeknél** ott áll, mennyit várnánk a Ratingek alapján, és mennyi
  a többlet.
* **A „✓ jól illik” üzenet** csak 85% fölött jelenik meg. Korábban akkor is
  ezt írta, ha az illeszkedés 45% volt, csak egyik fő tengely sem volt
  kifejezetten gyenge.
* **85% alatt a tanács** megnevezi azt a fő tengelyt, amelyiken a legtöbb van
  még, és megmondja, hány százalékpontot hoz rajta +10 pont többlet. Mellé
  odaírja, mivel érhető el: edzésterv, attribútum-boost, skill.
* **A csillagok küszöbe** igazodott az új skálához: ★★★ 80%-tól, ★★ 60%-tól.

## 2. A taktika meccs-hatásának plafonja a nyers erővel nő

> „100-as nyers csapaterő fölött a taktika által adott max meccserőt meg kell
> növelni +5-re, és 10-esével (nyers erő) +1,5-öt növekedhet ez a plafon.
> (Természetesen lefelé is.)"

A plafon: **5 + 0,15 × (nyers erő − 100)**, de sosem a régi 2,1 alá.

| nyers erő | ≤ 81 | 90 | 100 | 110 | 130 | 170 |
|---|---|---|---|---|---|---|
| plafon | 2,1 (régi) | 3,5 | 5,0 | 6,5 | 9,5 | 15,5 |

* **Lefelé is folytonos.** A plafon 10 pontonként 1,5-tel csökken, egészen a
  régi 2,1-ig.
* **A meredekség együtt nő a plafonnal.**
  * A 99-es szint továbbra is a teljes plafont adja, a 85-ös küszöb 0.
  * Az illeszkedés ×0,7 és ×1,3 között skáláz. 100-as nyers erőnél egy 99-es
    rendszer tehát +3,5 … +6,5.
* **A kitolt plafonú rendszerek** (Guardiola, Mourinho) többlete arányosan
  nő.
* **A begyakorlatlanság büntetése** (85 alatt) nem skálázódik: az a gyakorlás
  ára, nem az erőé.
* **Egyetlen függvény számol** (`tacticEffectAt`). Ugyanazt a számot látja a
  motor, a taktika-panel „Meccs-hatás” sora és a felállás-előnézet.

## Próba

`tools/taktika-illeszkedes-3-9-176-proba.js`, 15 állítás:

* semleges keret = 50%;
* monotonitás minden tengelyen, minden rendszerre;
* a bejelentett profil 94% fölött;
* nincs sodródás;
* a plafon értékei;
* a panel;
* nincs oldalhiba.

Az illeszkedést érintő régi próbák mind zöldek maradtak:
egyensúly-3.9.153, hibák-3.9.151, kihívás, meccserő-egyezés, PvP-párharc,
stílus-edzők, talizmán F3/F6a/F6c/F6d/F7.
