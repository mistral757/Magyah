# Két csúszka és egy gomb — a karrier-beállítások átalakítása

*(Terv. Az alapja: `karrier-beallitasok-audit.md`. A cél: a Run indítása előtt
ne tizenkét kapcsolóval kelljen szembenézni, hanem **kettővel** — a részletek
maradjanak elérhetők, csak ne az útban.)*

---

## 0. A probléma egy mondatban

A beállító képernyő ma **tizenkét vezérlőt** tesz egy görgethető oszlopba, és
mind a tizenkettő ugyanakkora vizuális súlyt kap: a „Rating alapja" három
bekezdésnyi magyarázata pontosan úgy néz ki, mint a „legyen-e családtag".
Aki most ismerkedik a játékkal, nem tudja, melyik döntés miatt lesz *nehéz* a
karrier, és melyik csak ízlés — pedig a tizenkettőből mindössze **hat**
befolyásolja a nehézséget, a maradék hat hangulat.

---

## 1. A megoldás alakja

```
┌─ 1 · Hogyan játszol? ──────────────────────────┐
│                                                │
│  KIHÍVÁS            ●━━━━━━━━━━━━━━━━━         │
│  ⚽ Klasszikus                                  │
│  84-es mezőny · a képességeket te osztod ·      │
│  csúcsformájú kártyák · 1 újrapörgetés          │
│                                                │
│  TEMPÓ              ━━━━●━━━━━━━━━━━━          │
│  🐌 Komótos fejlődés                            │
│  −10% minden fejlődésre — hosszabb karrier      │
│                                                │
│  Run-potenciál ekkor: ~62                       │
│                                                │
│      [ ⚙ Speciális beállítások ]                │
│                                                │
│               [ Tovább → ]                      │
└────────────────────────────────────────────────┘
```

Két csúszka, egy összefoglaló mondat mindkettő alatt, és egy gomb, ami
kinyitja a mai teljes listát. **A mai képernyő nem tűnik el** — a „Speciális"
gomb pontosan azt hozza vissza, ami ma van, ugyanazokkal a vezérlőkkel.

---

## 2. Miért pont ez a két tengely

Az auditból négy független tengely jött ki. Kettő **nehézség**, kettő nem:

| tengely | mit állít | hova kerül |
|---|---|---|
| **Milyen erős a világ** | mezőnyszint, cél-sáv | ➊ KIHÍVÁS csúszka |
| **Mennyire te döntesz** | skill-mód, Rating-alap, újrapörgetés | ➊ KIHÍVÁS csúszka |
| **Milyen gyorsan nősz hozzá** | fejlődési tempó | ➋ TEMPÓ csúszka |
| **Milyen világ / hangulat** | válogatottak, családtag, sorsolás, vezetés, vak mód | ⚙ speciális |

A két nehézség-tengely azért **nem** olvad egybe, mert merőlegesek: a mezőny
ereje azt mondja meg, *mekkora a fal*, a tempó azt, *milyen gyorsan mászol*.
Ezt a kód kommentje is kimondja (~18072: *„az a mezőny erejét mondja meg, ez
azt, milyen gyorsan nősz hozzá"*), és a Run-mérő is külön díjazza őket.

A „mennyire te döntesz" azért kerül a kihívás-csúszkára, és nem harmadikra,
mert **mindhárom alkotója monoton**: a realisztikus skill-mód, a szezon-alapú
Rating és a kevesebb újrapörgetés kivétel nélkül nehezít, és a Run-mérő is
így pontozza őket (0,25 / 0,25 / 0,333 súllyal, mind „vállalás"-ként).

---

## 3. A KIHÍVÁS csúszka öt foka

| # | név | mezőny | auto cél-sáv | Rating-alap | skill-mód | reroll | Run-potenciál* |
|---|---|---|---|---|---|---|---|
| 1 | 🌤️ **Szabadnap** | 78 | Megengedő (+5…+8) | csúcsforma | laza | 3 | ~40 |
| 2 | ⚽ **Klasszikus** *(ajánlott)* | 84 | Kiegyensúlyozott (+3…+5) | csúcsforma | laza | 1 | ~55 |
| 3 | 🔥 **Kemény** | 88 | Szigorú (+1…+4) | szezon-alap | realisztikus | 1 | ~70 |
| 4 | 💀 **Kegyetlen** | 92 | Kegyetlen (−1…+2) | szezon-alap | realisztikus | 0 | ~82 |
| 5 | ☠️ **Önsanyargató** | 96 | Kegyetlen (−1…+2) | kártyánkénti lutri | realisztikus | 0 | ~90 |

\* a `runBreakdown` súlyaiból számolt *elérhető felső határ*, nem ígéret.
Érdemes kiírni: ez az egyetlen szám, ami a két csúszkát összeköti a
játék saját mércéjével, és azonnal érthetővé teszi, hogy a nehezebb
beállítás **nem büntetés, hanem több pont**.

A csúszka **nem folytonos**, hanem öt kattanó pozíció. Ha a felhasználó a
speciálisban bármit elmozdít, ami nem illik egyik fokhoz sem, a csúszka
**„Egyedi" állapotba** kerül (jelölés nélkül, a mezőny számával kiírva) —
nem ugrik vissza egyik előre csomagolt fokra sem.

## 4. A TEMPÓ csúszka négy foka

Ez betűre a mai `GAME_TEMPO` — nem kell hozzá új fogalom, csak új helyre kerül:

| # | név | szorzó | mondat |
|---|---|---|---|
| 1 | ⚡ Alap tempó | ×1,00 | „a megszokott ütem" |
| 2 | 🐌 Komótos | ×0,90 | „−10% mindenre, ami előre visz" |
| 3 | 🐢 Csigatempó | ×0,75 | „−25% — minden Rating megszenvedett" |
| 4 | 🧊 Gleccser | ×0,60 | „−40% — a leghosszabb karrier" |

---

## 5. Mi marad a ⚙ Speciálisban

Változatlanul, a mai sorrendben és a mai magyarázatokkal:

* felállás *(különben is külön oldal, lásd 7.)*
* válogatott keretek be/ki
* családtag + névkészlet
* sorsolás rendje
* vezetés (négy fok)
* vak mód *(karrieren kívül)*
* **és a kihívás/tempó minden alkotóeleme külön-külön** — a mezőny csúszkája,
  az auto szintkövetés és a cél-sáv, a Rating-alap, a skill-mód, az
  újrapörgetés, a fejlődési tempó.

Vagyis a speciális **nem egy szűkebb halmaz**, hanem a mai képernyő teljes
egészében. Aki ma tudja, mit akar, semmit nem veszít.

---

## 6. Amit ELŐBB javítani kell

A csomagolt profilok bevezetése három mai hibát felnagyítana, ezért ezek
sorrendben előre kerülnek (részletek az auditban):

1. **`wcEnabled` a mentésbe** — különben egy profil „bekapcsolta a
   válogatottakat", és egy újratöltés némán visszavonja.
2. **A reroll-sor kizárása kész klubnál** — a „Kegyetlen" profil 0
   újrapörgetést állítana be, ami kész klubnál ingyen 100 pont.
3. **A három hazug 🔒** — egy profil épp azt ígéri, hogy egy csomagban rögzíti
   a világot; ha közben három tétel szabadon állítható, az ígéret hamis.
4. **A kezdésmód-váltás ne törölje a csúszka értékét** — a profil beállít 92-t,
   a felhasználó megnézi a „kész klub" opciót, és 80-nal tér vissza.

---

## 7. Az új oldalsor (a teljes belépési út)

A mai egyoldalas, hosszan görgetett képernyő helyett **négy rövid oldal**.
Az itt szereplő „hagyományos / dinamikus" választás az új játékmódot vezeti be
(lásd `karrier-hagyomanyos-mod.md`).

| oldal | egyjátékos | közös karrier |
|---|---|---|
| **1 · Milyen karriert?** | 🏆 Hagyományos (ligapiramis) / ♾️ Dinamikus (a mai) | csak dinamikus — a piramis egyelőre SP |
| **2 · Honnan indulsz?** | 🎲 Draft / 🏟️ Kész klub | ua. (a házigazda dönt) |
| **3 · Hogyan játszol?** | *dinamikus:* a két csúszka + ⚙ · *hagyományos:* osztály + saját tempó + ellenfél-tempó | ua. |
| **4 · A csapatod** | felállás (+ újrapörgetés, ha draft) | felállás (a vendégé is a sajátja) |

Két megjegyzés a névadáshoz:

* A **„hagyományos" = az ÚJ mód** elsőre visszás (az új dolgot hívjuk
  hagyományosnak), de védhető: a *futball-karrier* hagyományos formája a
  ligapiramis. Ha zavarna, a „🏆 Ligakarrier" / „♾️ Végtelen karrier" pár
  ugyanezt mondja félreértés nélkül.
* A 4. oldal a mai `#scFormation` maradéka; a 3. oldal az új felület. A
  `beginNewGame` belépési pontja **nem változik** — a négy oldal ugyanazokat a
  modulszintű változókat tölti fel, mint ma az egy oldal.
