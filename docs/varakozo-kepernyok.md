# A várakozó képernyők rendbetétele (3.9.75)

**Állapot:** ✅ megvalósítva · **Mérés:** `tools/varakozo-kepernyo-proba.js` — 18 állítás

---

## A bejelentés

> 1. „Tempós tempó. Gagyi. Nevezzük át a tempót sebességre."
> 2. „A társad nem érhető el - A 2. Szezon 15. Forduló keretével játszom le ==>
>    személyváltás mondat közben."
> 3. „Vissza a kezdőlapra - a szoba megmarad ==> kiegészítés a végére: »a
>    kereted MENTVE«."
> 4. „Sok az apró betűs rész. Tegyük be mindet egy infó gomb mögé. […]
>    Ezeket az elveket alkalmazd az összes ilyen töltőképernyőre, ha lehet."

---

## 1. A tempóból sebesség lett

A panasz pontos volt: a **„Tempós tempó"** egy szó, önmagával magyarázva.

| régi | új |
|---|---|
| Kényelmes tempó | **Laza sebesség** |
| Tempós tempó | **Tempós sebesség** |
| Villám tempó | **Villám sebesség** |

A kiírt alak egyetlen helyen születik (`mpTempoLabel`), tehát a felület
**egyszer** mondja ki a szót, nem kétszer.

**A KULCSOK változatlanok** (`nyugodt` / `tempos` / `villam`). Ezeket a szobák
tárolják a Firebase-ben: egy átnevezés a futó szobákat törné el, és a két
kliens két különböző határidővel járna — pont az a kettéválás, amit az egész
rendszer kerül.

> **Amit szándékosan NEM neveztünk át:** a *meccs lejátszási tempóját* (Alap
> tempó · Csigatempó · Gleccser-tempó) és a *fejlődési tempót* (`devTempo`).
> Azok más fogalmak, és a „sebesség" ott félrevezetne.

## 2. A lágy kiút egy nézőpontból beszél

A régi felirat fél mondatban **személyt váltott**:

> ~~A társad nem elérhető — a 2. szezon 15. forduló keretével **játszom le**~~

Az első fele a felhasználóhoz szól, a második a program nevében. Az új:

> A társad nem elérhető — **játszd le a társad** 2. szezon 15. **fordulójában
> rögzített** keretével

Megállapítás + felszólítás, végig ugyanabból a nézőpontból — és pontosabb is:
kimondja, hogy az a keret **rögzített**, nem a társ mai csapata.

## 3. A kezdőlap-gomb kimondja, mi marad meg

> Vissza a kezdőlapra — a szoba megmarad**, a kereted MENTVE**

Ez a megnyugtatás eddig az **apró betűs részben** állt — pont ott, ahonnan a
4. pont miatt most kikerült. A gombon a helye: ott dől el, mer-e kilépni a
felhasználó.

**Feltételes.** Ha még nincs felküldött kereted, a gomb nem ígér mentést —
egy hazug megnyugtatás rosszabb, mint a semmi.

## 4. Az apró betűs rész egy gomb mögé került

A várakozó képernyő mostantól **egy mondat**: mi történik és mire várunk.
Minden más — a szerep, a két rekesz állapota, a kilépés következményei, a
diagnosztika — az **ℹ️ Részletek** gomb mögött ül.

```
h2hWaitShow(round, msg, mine, opp, what, info)
                                          ^^^^  ← ÚJ
```

- **Üres infó = nincs gomb.** Egy örökké ott álló, üres „Részletek" pontosan
  az a zaj volna, amit ez a változtatás megszüntet.
- **A nyitva-hagyott állapot a felhasználóé.** A várakozó képernyők
  2,5 másodpercenként újrarajzolódnak; egy az orra előtt becsukódó doboz
  rosszabb volna, mint a régi apró betű. A `_h2hInfoOpen` ezért túléli az
  újrarajzolást.
- **A körönként újrarajzoló hívók** (`mpBothGate`, `mpMkTickRun`) a MEGLÉVŐ
  törzset adják vissza (`h2hWaitInfoNow()`), így a tartalom nem vész el.
- Infó nélküli képernyőre lépve a nyitva-állapot is elhal.

### Mind a nyolc képernyőn

A kérés „az összes ilyen töltőképernyőre" szólt. Az apró betűs rész **nyolc**
helyen élt, és mind a nyolc átkerült:

| képernyő | mi került az infó mögé |
|---|---|
| párharc | szerep · a két rekesz · a mentés következményei |
| kupanevezés | a te kvalifikációd |
| sorsolás | miért kell megvárni a másik csoportot |
| kupakör | miért kell megvárni egymást + diagnosztika |
| szezonindítás | a te javaslatod |
| tabella | mikor jelenik meg az állás |
| Infinity (vállalás) | mi történik a vállalásoddal |
| Infinity (hiányzó büdzsé) | mennyi hiányzik még |

A próba **forrás-szinten** méri, hogy egyetlen `h2hWaitShow`-hívásban se
maradjon `<small>` — így egy később hozzáadott képernyő sem csúszhat vissza a
régi mintába.

## 5. Egy hiba, amit a képernyőkép mutatott meg

Az új infó-doboz első változata **téma-változókat** használt
(`color:var(--dim2)`, `border:… var(--line)`, `<b style="color:var(--ink)">`).

Csakhogy ez a réteg **mindig sötét**, függetlenül a témától:

```css
#h2hWait{ … background:rgba(20,18,15,.95) }
.h2hBox{ … color:#f3f2f2 }
```

Világos témában (`[data-theme="paper"]`) az `--ink` **#1a1712** — majdnem
fekete —, vagyis a kiemelt szöveg **eltűnt volna** a sötét dobozon. A
környező feliratok pontosan ezért használnak kézzel írt színeket (`#b9b4ab`,
`#8fae7f`); az új doboz most ugyanazt teszi.

A próba mindkét témában megméri a tényleges színeket, és külön állítja, hogy a
doboz stílusában **egyetlen téma-változó sincs**.
