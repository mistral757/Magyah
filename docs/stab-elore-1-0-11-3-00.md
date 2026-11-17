# 📈 1.0.11.3.00 — A Szakmai stáb előrejelzése

> **Kérés:** „A scoutoknál is legyen olyan előrejelzési rendszer, mint amit
> mostanában építettünk be az edzéshez. Kire milyen mértékű lesz a hatása a
> szezonban.” — Tisztázva: a **Szakmai stáb** tagjairól van szó (a scout nem
> fejleszt játékost, a POT-becslést és a felfedezést végzi).

Próba: `tools/stab-elore-1-0-11-3-00-proba.js` · Kép: `docs/kepek/stab-elore-1-0-11-3-00/utana.png`.

## A gond

A stábtag kártyája egy általános számot mondott („+0,62 pont/meccs … egy
80-as játékoson”). Azt nem, hogy a fókuszáltak közül **kinek** és **mennyit**
hoz az idény végéig — pedig ez játékosonként sokszoros különbség (kor, szint,
nehézségi tempó, stílus-szorzók, és hogy egyáltalán kezd-e).

## Mi változott

Minden stábtag kártyáján, a hatás-sorok alatt: **📈 Várható hatás az idény
végéig — még N bajnoki forduló** (idényen kívül: a következő idényre).
Típusonként az, ami ott valóban számít:

| Típus | Mit mutat |
|---|---|
| Gólvágó, Játékmester, Bástya, Kesztyűs mester, Sprintmester | a kezdő tizenegy fókuszáltjai soronként (`Csávó BSZ · Gólszerzés +0,5`), összeg; 🔒 a specializációs sáv tetején; ⛔ POT-blokk; a fókuszban lévő, de most nem kezdő emberek lenyitható sorban, „ha végig kezd” értékkel |
| Kispad-mester | a fókuszált, nem kezdő cserék várható perce az idényben, és a belőle jövő Rating- és fő-tengely-lépés (ha nem lépnek pályára) |
| Iskolateremtő | várható hagyaték-átadás (a maradék készlet és az érvényes párok keretén belül) és képesség-fázis; kinek van félkész képessége |
| Ritmusmester | fókuszáltanként: a forma húzása fölfelé, a jó/rossz napi forma esélye |
| Gyógyító kéz | fókuszáltanként: a sérülés-kockázat csökkenése |
| Lélekemelő | csapatmorál és csapat-OVR, minden hátralévő meccsen |
| Csapatkovács | a kezdő tizenegy fókuszált párjai, és mennyivel gyorsabban épül a kötésük |

**A fókusz módosítására azonnal újraszámol** (a panel minden koppintásra
újrarajzolódik), tehát a döntés előtt látszik a következménye. Az inaktív
(második ugyanolyan típusú) stábtag kimondja, hogy nem hat.

## Hogyan számol — és honnan tudjuk, hogy igaz

A `stabElorePont` a motor attribútum-mester ágának tükre
(`processCareerDevelopment`): `COACH_ATTR_PTS × coachPower × trainScale`, majd
a közös `addA`-lánc — kor-görbe, nehézségi tempó, `edzTempoKomp`, underdog,
sztár-, passzkémia-, örökös-, gegenpressing- és stílusbolt-szorzó —, és **az
edzésterv lassítása is**, ha a mester képessége a játékosnál lassított (ez a
motorban a stáb pontjára is hat). A Kispad-mesteré a `padEdzoAd` tükre.

A próba nem a képletet ismétli, hanem **a motort futtatja**: egy végigjátszott
meccs után a stáb-mérlegbe (`stabBy`) könyvelt pontot veti össze az
előrejelzéssel — a kezdő mind a 11 emberén, köztük 9-en, akiknél a
gólszerzést az edzésterv lassítja. Az eltérés 0. A Kispad-mesternél a
könyvelt perc és pont is pontosan egyezik.

## Amit nem tud előre (és ki is mondja)

A meccs közbeni cseréket (részidő), a sérüléseket, a fókusz későbbi
módosítását; a valószínűségi hatásoknál (Iskolateremtő) a várható értéket.
A számok „a mostani kerettel és szorzókkal” értendők.

## Amit nem változtat

A motor, a stáb mentett formája és a fókusz-szabály érintetlen — ez kijelzés.
