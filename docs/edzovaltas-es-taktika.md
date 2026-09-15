# Edzőváltás és a taktika-ismertség (3.9.77)

**Állapot:** ✅ javítva · **Mérés:** `tools/edzovaltas-taktika-proba.js` — 17 állítás

---

## A kérdés

> „Amikor a csapatstílusunk edzőjét megvesszük, akkor ő a saját taktika
> ismertségéről indítja azt a taktikát (és mindegyik másik taktika ismertsége
> is megváltozik), vagy onnan folytatja, ahol az előző edző szintje volt? Ha
> onnan folytatja, akkor rosszul van így."

## A válasz: onnan folytatta

A `styleCoachTakeOver` **csak az edző-objektumot cserélte ki** (`coach=c`), az
`S.tactics.levels`-hez hozzá sem nyúlt. A klub tehát megtartotta az előző
edzővel bedrillezett rendszereket, mintha semmi nem történt volna.

A furcsa az, hogy a kérdés **másik fele mindig helyes volt**: a
karrier-indításnál az `initTacticsForCoach` pontosan azt csinálja, amit a
bejelentő elvár — a választott edző három kedvence 80/76/70, minden más 60.
Csak az **edzőváltás** maradt ki ebből az elvből.

## A javítás

Az új edző a **saját alapértékeiről** indul:

| | |
|---|---|
| a három kedvelt rendszere | **80 / 76 / 70** (`TACTIC_START_LIKED`) |
| minden más | **60** (`TACTIC_START_OTHER`) |

### Az egyetlen kivétel

> „…kivéve ha a main taktikáját (pl Gárdista a labdatartást) már jobban
> ismerte 80-asnál az előző edzővel a csapat."

Ha a csapat a **filozófia saját rendszerét** (azt, amit a képesség kétszeres
tempóval gyakoroltat) már **80 fölött** ismerte, a magasabb szint megmarad. Azt
a tudást épp ezért a filozófiáért építetted, és egy filozófus-edző érkezése
nem törölheti el.

A küszöb a kódban **`TACTIC_START_LIKED[0]`**, nem egy beírt 80-as: a szabály
azt mondja ki, hogy *„jobban ismerte, mint amennyire az ÚJ edző a sajátját
hozza"* — ha az a szám valaha változik, a kivétel vele mozdul.

**A küszöb szigorúan 80 FÖLÖTT van.** Pontosan 80-on nincs mit megvédeni: az
új edző úgyis annyit hozna.

## Egy aszimmetria, ami mérés közben derült ki

A „main taktika" nem mindegyik edzőnél a saját kedvence:

| edző | a filozófia rendszere | hányadik a SAJÁT listáján |
|---|---|---|
| Guardiola | Labdatartás | 1. |
| Mourinho | Park the bus | 1. |
| Csank János | Hosszú labdák | 1. |
| Cruyff | Totális futball | 1. |
| Guttmann Béla | Kontra | 1. |
| Verebes József | Széljáték | 1. |
| **Dárdai Pál** | **Hosszú labdák** | **3.** |

Dárdainál tehát a kivétel és az alapérték szétválik, és ez látványos:

- a **Hosszú labdák** 95-ön **megmarad**, pedig az ő alapja ott csak 70;
- a **Kontra** (az ő *első* kedvence) viszont 99-ről **80-ra** esik vissza.

Ez a szabály egyenes következménye — a kivétel a *filozófia* rendszerét védi,
nem az edző kedvencét. A próba külön ágon méri, hogy a kettő ne csúszhasson
össze.

## Amihez NEM nyúlunk

**A beállított rendszer a menedzseré.** Az edző hozza a maga tudását, de hogy
mit játszotok, azt te döntöd el — egy néma rendszer-váltás a kezdőrúgás előtt
sokkal nagyobb meglepetés volna, mint a szintek mozgása.

Cserébe a napló **kimondja, mi hova került**:

```
🎩 EDZŐVÁLTÁS — MEGJÖTT PEP GUARDIOLA. Régi Edző elköszön a klubtól.
→ … Labdatartás mostantól kétszeres tempóval gyakorlódik be.
→ Az edzések újraindulnak a saját rendszerein: a három kedvelt taktikája
  80/76/70-ről, a többi 60-ról. Az előző edzővel bedrillezett rutin nem
  öröklődik át.
→ Labdatartás viszont MEGMARAD 95-en — azt a tudást épp ezért a filozófiáért
  építetted, 80 fölé.
→ Park the bus 99→60 · Kontra 88→60 · Hosszú labdák 77→60 · Totális 60→76
→ A beállított rendszered (Totális futball) marad — azt te döntöd el, nem az
  edző. Most 76-on áll.
```

A lista a **legnagyobb mozgással kezd**, és négy sor után összevonja a
maradékot: egy hétsoros, teljes felsorolás a napló alján senkit nem érdekel.

## Mit NEM érint

- **Aki már az edző** (pl. a draft óta Guardiolával indultál): ott nincs
  edzőváltás, tehát nincs átrendezés sem — az 1. szint amúgy is ingyen jár.
- A **karrier-indítás** útja betűre változatlan.
- A **taktika-plafonok** (a képesség 2-3. szintje 125-re, majd 150-re viszi a
  filozófia rendszerét) érintetlenek: a szintek mozdulnak, a plafon nem.
- A mentés szerkezete változatlan.
