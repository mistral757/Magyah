# 3.9.166 — a félidei tervezett csere a FÉLIDŐ-sor után

> „próbáltuk rendezni azt, hogy a 45. percben ütemezett cserék ne a félidő
> előtt jöjjenek be. Ennek eredménye az lett, hogy most 50. percben jönnek be
> azok, akik 45-re vannak ütemezve. Ez így nem jó. Annyi, hogy a félidő feed
> szöveg után legyen, és funkcionálisan is onnantól legyenek ők érvényesen a
> csapat részei a pályán."

## Mi volt a baj

A mérkőzés 18 ötperces vödörben fut. A 3.9.151 a „félidő előtt bekerül”
hibát úgy javította, hogy a szabály a percének lejárta UTÁNI vödör ELEJÉN
sült el: a feltétel `r.min > min−5` lett.

* A 45. perces szabály így a 46–50. vödör elején futott. Pályán
  gyakorlatilag jó helyen volt, de a napló a vödör VÉGÉT írta ki:
  „Csere a 50. percben”.
* Ugyanígy lett a 70. perces cseréből „75. perc”.

## Mostantól

| szabály | mikor fut | a naplóban | pályán |
|---|---|---|---|
| 45. percig | a 45. tick végén, KÖZVETLENÜL a FÉLIDŐ-sor után | „Csere a félidőben” | a 46. perctől |
| később (pl. 70.) | a következő vödör elején | a vödör első perce: „a 71. percben” | a 71. perctől |

* A lecserélt ember játékidő-részesedése ehhez igazodik: félidőben pontosan
  0,5, a vödör elején a vödör előtti percek.
* **Párharcban:**
  * A közös szimuláció a „45. perctől” cserét a 46. percre teszi. Ezek a
    cserék — a sajátod és a társé is — a FÉLIDŐ-sor után jönnek elő, nem az
    50. perc elején.
  * A napló a közös lista percét írja ki.
* A félidei csereszünet (ha be van kapcsolva) a tervezett cserék UTÁN nyílik.
  Így a panel már a maradék cserekeretet mutatja.

## Próba

`tools/felidei-csere-proba.js` (port 9200). Valódi, végigjátszott mérkőzésen
méri:

* a csere sora közvetlenül a FÉLIDŐ-sor után áll;
* a beálló a félidő-sor pillanatában már a pályán van;
* a 70. perces csere „a 71. percben” jön;
* sehol nincs „50. perc”.
