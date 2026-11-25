# 1.0.12.9.00 — Kaszinós pörgető, egységes ablakok, menüpont-jelenetek és 7 fejlesztői jegyzet

## A kért munka

### 🎰 Átigazolási esemény: kaszinós pörgető
KIMONDOTT KÉRÉS: „Az átigazolási esemény pörgető legyen sokkal menőbb, egy menő kis kaszinó feeling
legyen hozzá. Fent a jelenet, az egyik játékosod bemegy a kaszinóba és egy gépnél rárántja a karra.
Legyen menő!"

- A pörgetés helyén egy neonos kaszinó-jelenet (SVG): villogó izzósor, „CASINO" neon, félkarú rabló.
- Egy játékosod (a kezdő 11-ből, a saját arcával és meződben) besétál, a gép elé áll, és lerántja a kart.
- A tárcsák pörögnek, majd egyenként állnak meg; a harmadik kicsit később áll meg.
- A három egyforma szimbólum az esemény fajtáját mutatja:

  | Szimbólum | Esemény |
  |---|---|
  | 👑 | ikon |
  | ⭐ | álomigazolás |
  | ✈️ | elvágyódás |
  | 💰 | sztár-követelés |
  | 🧿 | talizmán-esemény |
  | 🎲 | egyéb fordulat |
  | 💥 | meghiúsult |

- Utána jön a JACKPOT-felirat, érmék és szikrák, és a játékos ugrál; a chiptune-hangok új hangok.
- Az eredmény és a Tovább gomb csak a tárcsák megállása után jelenik meg, a jelenet alatt.
- A döntés ugyanaz: a `land()` változatlanul fut, ugyanazzal a véletlennel.
- A gépi végigjátszás (`S.auto`) és a böngésző-automata (`navigator.webdriver`, kivéve `KASZINO_TESZT`) a régi, gyors pörgetést kapja.
- Kód: `kasIndit`, `kasSvg`, `kasMegallit`, `_kasJel` (a `twStartPhase2` előtt).

### 🪟 A Csapatépítés minden alpontja egy ablakstílusban
KIMONDOTT KÉRÉS: „A csapatépítés menün belül minden alpontnak ugyanolyan, átlátszó stílusú ablaka legyen,
mint amilyenek a legújabbaknak vannak (pl. Edző)."

- Ezek a saját modálisukkal nyíló alpontok menüből nyitva ugyanazt az ablakot kapják, mint a többi aloldal:
  - 🧿 Talizmánok;
  - 📦 Ládák;
  - ⚡ Meccserő / felállás-sablonok;
  - 🌱 Ifiakadémia;
  - 🔄 Félidei cserék.
- Az ablak felülre igazított, áttetsző háttér mögött ott a menü, és arany a szegélye.
- A tetején a ragadós „← Vissza a menübe ✕" sáv a modális saját bezáró gombját nyomja meg, és a menü marad.

### 🎬 Új menüpont-jelenetek (jelenetsáv)
Hét új jelenet, mindegyikben a saját játékosaink figurái láthatók:

| Menüpont | Jelenet |
|---|---|
| 🧩 Felállás | négy játékos besprintel a helyére, a táblán a felállás rajza |
| 🧿 Talizmánok | izzó kabala, körülötte keringő lapok, a paklid és a címed |
| ⚡ Boost | labor, villámok, a játékos felugrik; a legolcsóbb boost ára |
| 🏟️ Stadion | daru építi a lelátót, a játékos integet; a befogadóképesség és a nézőszám |
| 🎓 Stáb | a stábtag jegyzetel, a játékos nyújt |
| 📋 Menedzsment | az elnök az asztalnál, a játékos behozza a szerződést; a futó kihívások |
| 📦 Ládák | a láda felnyílik, fény és érmék; a ládák és az érmék száma |

## A 7 jegyzet (u_fd5811b0d243, a fejlesztő telefonja)

| Jegyzet | Mi készült |
|---|---|
| 🔥 jmww2se9aggzv — talizmán-fúzió | Az azonos célú alaphatás egy sorban marad, a kisebbik +15%-kal. A más célú beolvasztott alaphatás külön sorban, a saját célján él tovább, ×1,15 erővel; ez a `O.fuzAlap`, „szellem-lap". A lépcsős és csomag-változatok egy ritkasággal feljebb kerülnek. A lap saját alapja legalább ×1,15. A special közös, a ritkaság-ugrással erősödik. A lapon „🧬 +" sor mutatja a beolvasztott hatást. |
| ↳ ugyanitt talált hiba | A húzáskor választott célzott lap (Fajta-kedvezmény, Gyorsabb fejlődés, Izgalom-boost, Több hely) elvesztette a célját, ezért az alaphatása nem hatott. Javítva; a régi mentés cél nélküli lapjai determinisztikus célt kapnak (`talCelJavit`). |
| jmww2opzrhlmr | A „MK + KK indulunk" gomb kikerült a menüből. A lemondás a bajnokság végén egy „🏆 Indulunk / Kihagyjuk" kérdésben él tovább (`hubEuroKerdes`). |
| jmww2kr7q4iob | A filozófia-lecke 5 lépés: pontok, szezon-szerepek, képességfa + ajánlott első képesség élő számokkal, mérföldkövek, takarékosság. A „Hosszú táv" 3/3 feladat, utána két új szakasz jön, mindkettő leckével: „A kupák" és „A szezon vége". A korán lezárult Kezdő út a 3. idényig egyszer újranyílik. |
| jmww2fclmac9b | A sztár kijelölése azonnal a megerősítő ablakot nyitja. |
| jmww2cbx128tj | A stílus-döntés alatt (`kutStilusDontes`) a HUB-ra horgonyzó tippek, például a Run szint, és a nyitás-ünnep várnak. A döntés után visszajönnek. A „Hol?" a választóig vezet, és a választás kipipálja. |
| jmww27ib4jnn1 | A lap a bíró felemelt kezében van (2D: `evaBiro(x,y,lapSzin)`; 3D: felkar, alkar, kéz). A háló rombusz-szövésű, gólnál kidomborodik a labda helyén, csillapodó rezgéssel. A 3D-ben oldalháló és sűrű rács. |
| jmww25gtm70ib | PC-n és fekvőben 16:9 a jelenet: a viewBox kitágul, a pálya és a villanások a szélekig érnek, a 3D vászon is szélesvásznú (`evaSzeles`, `evaSzelesit`). |

## Próbák
- `tools/jegyzetek-1-0-12-9-00-proba.js` — minden pont.
- `tools/talizman-fuzio-ket-alap-1-0-12-9-00-proba.js` — a fúzió és a célzott lapok.
- Igazítva:
  - `kezdo-ut-motor`, `kezdo-ut-leckek` (22 lecke);
  - `stilus-osszeveto` (a szerepek lépése);
  - `kezdo-ut-zaro` (az út a 3. idény elején ér véget; a 4. pont már előtte is bukott);
  - `boost-talizman-3-9-185` (100-ra kerekített ár);
  - `talizman-fuzio-3-9-344` (gombszöveg).
