# 3.9.348 — kész képesség és saját választás: csak a kihívás-jutalomnál

> „A jutalom skilleket most módosítottuk, de félreértettél. Csak a
> kihívásjutalom skilleknél kértem ezt. Nem az összesnél. Így teljesen
> értelmetlen a teljes realisztikus skill cucc... Szóval a kihívások végén
> kell úgy kapjuk a skillt, ahogyan most minden skillnél megcsináltad."

## A hiba

A 3.9.343 a kész képességet és a kategória- meg címzett-választást
minden skill-jutalomra kiterjesztette. Ezzel a realisztikus skill-mód
gyakorlatilag megszűnt:

* a meccs utáni jutalomnál sem a gép döntött;
* a fejlesztés-jutalomnál sem a gép döntött;
* a karrier-indító sorsolásnál sem a gép döntött;
* minden képesség kész volt.

## Most

| Jutalom | Készültség | Ki dönt |
|---|---|---|
| **🏆 Kihívás-jutalom** (a kihívás végén sorba tett skill) | **kész** (minden fázis) | **te**, minden módban: előbb a kategória (vagy a sorsolt képesség), aztán az ember |
| Meccs utáni új képesség | a 3.9.343 előtti (1/N fázis) | laza módban te; realisztikusban a gép (`skillRealPlan`), a célzott skill 2. hatásával |
| Fejlesztés-jutalom (folytatás) | — | realisztikusban újra a gép a saját arányával (`skillRealAutoUpgrade`) |
| Karrier-indító, örökség, stábtag átadása | a megadott készültség | ahogy a 3.9.343 előtt |

**A kihívás-büntetés célzás-zára (`chSkillPickLock`)** továbbra is mindenre
él: ilyenkor a kihívás-jutalom képessége is kész, de a címzettet a gép
sorsolja.

**Végigjátszásnál (auto)** a kihívás-jutalom is kész képességként megy ki.

A célzott skill leírása is visszakapta a realisztikus módra vonatkozó 2.
hatást.

## Próbák

* `skill-jutalom-3-9-343`: a kihívás-jutalomra igazítva. Új állítások:
  * a meccs-jutalom realisztikusban a gépé, és 1/3-ról indul;
  * a kihívás skillje „challenge” okkal kerül a sorba.
* `celzott-skill-3-9-335`: a 2. hatás állításai visszaálltak. A kihívás-
  jutalomnál a „mindig te választasz, kész képesség” állítás megmaradt.
