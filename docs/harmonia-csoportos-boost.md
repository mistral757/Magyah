# Egyenlítő és tömeg-boost — a Béke és harmónia két eszköze (3.9.67)

A stílus-diagnózis (`docs/stilus-egyensuly-diagnozis.md`) azt mérte ki, hogy a
filozófia baja **nem a nehézség**, hanem hogy a **céljához nem volt eszköze**:
a kis szórású, egyenletes keret ellen a játék minden más rendszere dolgozik —
az átigazolás, a szezonkártyák, az ifi-boost, az ikonok és a POT-vezérelt
fejlődés mind a szórást növelik.

Ez a két képesség az eszköz. Mindkettő a **boost-központban** él, mert ott dől
el a keret alakja, és mindkettő **posztcsoporton belül** dolgozik.

## A posztcsoport: amit a játékos TUD, nem amit ma játszik

Egy `KV+VKP` ember a védőkkel **és** a középpályásokkal is boostolható, egy
`TKP+ÁÉ` a középpályásokkal és a támadókkal. A **megtanult** poszt is számít —
a `posLearnFinish` az `entry.pos`-ba írja, tehát magától bekerül.

Két játékos akkor boostolható együtt, ha a posztcsoport-halmazuk metszete nem
üres. A kijelölésnél az **elsőnek kijelölt ember a horgony**: tőle számít a kör,
így egy kétlaki játékos nem tud két idegen csoportot egymáshoz kötni.

Aki nem fér bele, az **szürkén ott marad**, nem tűnik el. Egy eltűnő név azt
sugallná, hogy nincs is a keretben; a szürke azt mondja, amit kell: ő igen, de
nem ebbe a csoportba.

## 1. Egyenlítő

2–5 kijelölt játékos Ratingje **egy közös számra** jön:

```
átlag = a kijelöltek átlag-Ratingje
rés   = a legjobb − átlag
cél   = átlag + rés × {33% | 50% | 75%}
```

**A bejelentett példa** (3. szint, 80 és 120): átlag 100, rés 20, 75% = 15 →
**mindkettő 115**. A gyengébb nyer 35-öt, az erősebb veszít 5-öt — a csapat
összesen 30-cal erősebb. Ez a filozófia üzlete: a kiugró ember lead valamennyit
azért, hogy a mezőny felzárkózzon.

### A csúcs nem vész el végleg

Aki **lejjebb** kerül, annak a **POT-jához és a pályafutás-görbéjéhez (peak) nem
nyúlunk**: a jelen osztódik szét, nem a jövő — ő a következő idényekben
visszanő a saját pályájára. Aki **feljebb**, annál a görbe követi az új
Ratinget, ahogy minden más boostnál is (különben a fejlődés azonnal
visszahúzná).

Ez tudatos: így az egyenlítő **ismételhető befektetés**, nem egyszeri lopás a
sztártól — és épp ezért kell neki ár-fék.

### Az ár féke

| szint | a rés | alapáron |
|---|---|---|
| 1 | 33% | 5 db |
| 2 | 50% | 4 db |
| 3 | 75% | 3 db |

Utána **minden további a duplája az előzőnek** (×2, ×4, ×8, ×16…). A magasabb
szint erősebb, de kevesebbszer olcsó — a nyolcadik-tizedik egyenlítő már csak a
nagyon gazdag klubnak fér bele.

## 2. Tömeg-boost

Mostantól minden boost-fajtánál előbb jön a kérdés: **egy vagy több játékos?**
Egynél a megszokott út fut; többnél 2–5 embert jelölsz ki egy posztcsoportból.

A szabály egyetlen mondat:

> a boost annyit ad **összesen**, amennyit a kijelöltek **legjobbjának** adott
> volna — szintenként megszorozva (×1 · ×4/3 · ×5/3) —, és ezt osztjuk szét.

**A bejelentett példa** (sima boost, 3 emberre, a horgonynak +2 Rating és
+1800 POT járna):

| szint | szorzó | fejenként |
|---|---|---|
| 1 | ×1 | +1 Rating (2/3 kerekítve) · +600 POT |
| 2 | ×4/3 | +1 Rating (8/9) · +800 POT |
| 3 | ×5/3 | +1 Rating (10/9) · +1000 POT |

**A Ratingnél kerekítünk, és sosem adunk +1-nél kevesebbet.** Ez tudatosan
nagyvonalú: egy háromfelé osztott +2 Rating így 3-at ad összesen. A filozófia
épp ezt ígéri — a sok kicsi többet ér, mint az egy nagy.

**A horgony a legjobb Ratingű kijelölt** (döntetlennél a nagyobb POT-ú), és a
kártyán ki is van írva. Nem a legjobb POT-ú, nem a legjobb tengelyű: egy
horgony van.

### Melyik fajtával megy

| fajta | tömegben | a szétosztott mérték |
|---|---|---|
| Sima | ✓ | Rating + POT |
| Attribútum | ✓ | a választott tengely pontjai (a tengely mindenkinél ugyanaz) |
| POT | ✓ | POT |
| Összjáték | ✓ | az összhang-szorzó növekménye |
| Skill | ✓ | a sorsolási súly növekménye (törtérték is értelmes) |
| Ifi · Öreg róka | — | saját panel, saját jogosultsági kör |

## Ami a kódban változott

A három érintett boost **terve és végrehajtása szétvált**
(`plainBoostPlan`/`applyPlainDelta`, `potBoostPlan`/`applyPotDelta`,
`attrBoostPlan`, `bondBoostPlan`). A tömeg-boosthoz tudni kell, **mennyit adna**
a boost, mielőtt bárkire elsülne — és a szétosztás után a sorsolás **már nem fut
le**: mindenki pontosan ugyanazt kapja. Az egyszemélyes út betűre ugyanaz
maradt, csak most a tervet kéri el előbb. **Egy igazság, két hívó.**

## Miért II. sávban

A diagnózis szerint a harmónia fája amúgy is a legdrágább a hétből (14
képességből 7 volt III. sávos). Két újabb III. sávos képesség pont azt a bajt
mélyítené, amit orvosolni akarunk — ezért mindkettő **II. sávos**
(26/45/70 pont).

Mérés: `tools/harmonia-boost-proba.js` — 18 állítás, köztük a bejelentés
mindkét számpéldája.
