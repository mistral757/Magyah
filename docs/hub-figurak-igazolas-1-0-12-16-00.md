# 1.0.12.16.00 — HUB-figurák: ritkábban, kukucskálva, szundival · játékos a töltőn · az igazolás-jelenet glitche

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy4573jh1ss)
> „Túl sok a kis besétáló játékosok animáció a HUBban. Túl gyakori. Legyen randomabb. Ne mindig 5mp időközönként
> jöjjön. Hanem 7-11 mp, és legyen olyan animáció is, ami csak egy oldalról vagy felülről benézés, mint a régi
> Windows xp varázsló. És legyen az, hogy minden 3. ilyen animációnál az egyik játékos úgy jöjjön be, hogy csak
> bejön és megkérdezi, hogy: "Mester, szólj, ha idegesítünk, és akkor lelépünk egy időre!" Vagy: "Mester, minden
> oké? Ha egy kis magányra vágysz, csak egy szabadba kerül!" És ha erre rákattintasz, akkor be lehet állítani ott
> rögtön hogy mennyi szundi idő legyen ezeknek az animációknak. Ja és a pillanat... Átvezető kijelzőn ezentúl nem
> a kis pixel figura legyen hanem valamelyik játékosunk dekázzon azon mindig."

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy3zuxxc79j)
> „Nagyon menő a legendás igazolás képernyő, de glitchel sajnos. Ezt meg kell javítani, mert amúgy nagyon menő.
> Ez a Style minden igazolásnál legyen ott."

## Mi változott

### Tétlen HUB-figurák (`oe*`)
- **Ritkább, véletlen ütem:** 10 mp tétlenség után indul, a jelenetek között 7–11 mp véletlen szünet (`oeGap`).
- **Kukucskálás (`oeKukucs`), a jelenetek ~30%-a:**
  - **felülről:** a játékos fejjel lefelé lóg be a képernyő tetején, a buborék alatta (`oeFent`, `oeBubLent`);
  - **oldalról:** balról vagy jobbról, megdőlve hajol be.

  Rövid beszólás, aztán visszahúzódik.
- **Minden 3. jelenet a kérdező játékos (`oeKerdes`):**
  - bejön középre, és megkérdezi a két mondat egyikét (a „szabadba” → „szavadba” javítással), a buborékban a „👆 koppints rám…” tipp;
  - rákoppintva a **szundi-választó** (`#oeSzundi`) nyílik: 5 / 15 / 30 perc, 1 óra, „a mai játék végéig”, „kikapcsolom”, vagy „Maradjanak, jó így! 👍”;
  - a választás a naplóba is kerül;
  - a szundi addig tartja távol a figurákat (`oeSzundiz`, localStorage `magyah_oeSzundi30_0`). A „mai játék végéig” a munkamenetre szól, a „kikapcsolom” az eddigi kapcsolót (🛡️ A klub arculata → Animációk) viszi ki.

### „Pillanat…” töltő
- A pixel kisfiú helyett a keret egy véletlen játékosa dekázik (meccsfigura, labda, alatta a neve).
- Karrieren kívül, ahol nincs keret, marad a kisfiú.

### Igazolás-jelenet glitche
**Az ok:**
- A jelenetre koppintva (átugrás) az `ijKesz` osztály MINDEN animációt 0,01 mp-esre állított.
- Ez a végtelen ismétlésű sugárkoszorút és a szikrákat is érintette, így azok másodpercenként tucatszor villództak.

**A javítás:**
- Átugráskor csak a belépő elemek (alak, kártya, fejléc, alsó sáv) ugranak a végállapotba.
- A teaser-kártyák eltűnnek.
- A sugár 18 mp-es forgással, a szikrák a saját tempójukkal mennek tovább.
- A háttérköd `filter:blur(18px)` helyett lágy színátmenet (gyenge telefonon a blur is akadt), a forgó rétegeken `will-change`.

**Minden igazolásnál ott van:** a jelenet már eddig is minden igazolásnál futott (`markArrived` → `igazJelenetSorba`): piac, scout, ingyenes, láda, kihívás-jutalom. Kivétel az ifjúsági akadémiáról felhozott játékos, mert az nem igazolás.

## Próba
`tools/oe-szundi-tolto-1-0-12-16-00-proba.js`:
1. a szünet 7–11 mp;
2. a sorrend J J K J J K…;
3. a kukucskálás felülről és oldalról;
4. kérdés → választó → 15 perc szundi alatt nincs jelenet, a „kikapcsolom” a kapcsolót viszi;
5. a töltőn a mi játékosunk;
6. az átugrás után a sugár 18 s-os és a szikrák 3 s-os ütemmel futnak;
7. nincs oldalhiba.

Lefutott még: `figura-jelenet-1-0-12-8-00`, `kihivas-lada-igazolas-1-0-12-14-00`, `lecke-vegig-1-0-12-15-00`, `tolto-1-0-7-4-00`, `csere-tolto-1-0-9-0-02`.
