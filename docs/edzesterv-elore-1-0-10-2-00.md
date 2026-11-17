# 📈 1.0.10.2.00 — Az edzésterv előrejelzése

> Az audit ([audit-felulet-mechanika-1-0-9-8.md](audit-felulet-mechanika-1-0-9-8.md))
> E tétele; a felhasználó: „Azok jöhetnek.”

## A gond

Az Edzésterv választója annyit mondott: „fő edzés +2 pont/meccs, mellék +1”,
és az előnézetben `Gólszerzés ++`. Azt nem, hogy ez **kinek** és **mennyit**
hoz az idény végéig — pedig a hozam játékosonként három-négyszeres különbséget
mutat (kor, szint, sebesség-osztó, stílus-szorzók). Utólag volt mérleg (a
játékos lapján), előre nem.

## Mi változott

A választó alján új blokk: **📈 Várható hozam az idény végéig — még N bajnoki
forduló**.

- A kezdő tizenegy érintett emberei soronként: `Buszmegálló BSZ · Gólszerzés
  +8,3 · Védekezés +4,1` — a fő edzés zölddel, a mellék arannyal, hozam szerint
  rendezve; fölötte az összeg (`összesen ≈ +42,1 attribútum-pont`).
- A kispad és a tartalék lenyitható sorban (ők a saját, lassabb ütemükön).
- 🔒 jelzi, ha valaki a specializációs sáv tetejébe ütközik — ott a terv már
  nem hoz többet, érdemes másra edzeni.
- **Választás közben él:** a vázlatból számol, tehát minden koppintásra
  átrendeződik — össze lehet hasonlítani két tervet rögzítés előtt.
- Idényen kívül a következő idény teljes hosszára szól.

Kép: `docs/kepek/audit-1-0-9-8/edzesterv-elore-utana.png`.

## Hogyan számol — és honnan tudjuk, hogy igaz

A `trainElorePont` a motor edzés-ágának tükre, tételről tételre: az alappont
(2,0 / 1,0), a szint-szorzó (`trainScale`), a kihívás- és talizmán-szorzók, a
sebesség osztója, a kor-görbe, a nehézségi tempó és az 1.0.9.6.00-ás
kompenzáció, az underdog-, sztár-, passzkémia-, örökös-, gegenpressing- és
stílusbolt-szorzók; a kispadon a kispad-ág rövidebb lánca.
A hozam = pont × hátralévő forduló / 15 (`CAREER_DEV_THRESHOLD`), a sáv
tetejéig (`attrBandOf`).

A próba nem a képletet ismétli, hanem **a motort futtatja**: egy végigjátszott
meccs (`processCareerDevelopment`, `processBenchDevelopment`) után az
edzés-mérlegben könyvelt pontot veti össze az előrejelzéssel, a kezdő és a
kispad minden érintett emberére. Az eltérés 0.

## Amit nem tud előre (és ki is mondja)

- a meccs közbeni részidőt (akit lecserélsz, arányosan kevesebbet kap);
- a 15 meccsre szóló kihívás-jutalom lejártát — „a mostani szorzókkal”;
- a meccseken szerzett fejlődést: az ezen FELÜL jár, és a nem edzett
  képességeknél 12%-kal kisebb.

## Amit nem változtat

A motor, az edzésterv mentett formája és a módosítási szabály érintetlen —
ez kijelzés.

`node tools/edzesterv-elore-1-0-10-2-00-proba.js` — 11 állítás.
