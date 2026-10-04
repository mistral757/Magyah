# 3.9.192 — 🎟️ A jegyár a keret kikiáltási árához igazodik

> „Túl sok pénz folyik be jegyeladásokból. Legyen referencia az, hogy mennyi
> az átlagos kikiáltási ára egy játékosodnak. Nekem pl most 23Mrd körül van.
> Szerintem az a reális, hogy a jegyárak ehhez igazítva kb 12-15Mrd környékén
> legyenek. Persze ez a fizetéseket is lefelé tolja majd. De az eddigi
> számolás mindkettőnél maradjon meg, csak tegyük hozzá ezt a faktort is. Ne
> lehessen túl könnyen pénzt gyűjteni. És természetesen a játék
> tempóbeállításai erre az összegre is legyenek hatással."

## 1. Mérve

A bejelentő meccs utáni naplója:

> Szurkolói bevétel: +52 Mrd 860 M Ft (260 984 fő × 162 032 Ft × ×1,25
> élmény)

**A 162 032 Ft-os jegyár** a 10 000 Ft-os alapár ×16,2-szerese. Ezt a 100
feletti nyers erő görbéje adja (`fanTicketScale`, 3.9.183). Ez a görbe a
piaci **csúcsárat** követi, nem a saját keretünk árát.

## 2. A szabály — egy új szorzó a meglévő jegyárra

**A referencia:**

* a liga **tipikus lelátója** (`fanLeagueBase`; a 110–119-es szinten
  300 000 fő) meccsenként a keret **átlagos kikiáltási árának 55%-át** hozza
  (`FAN_ASK_SHARE`), alap tempón;
* a **referencia-jegyár** = ez ÷ a liga tipikus lelátója.

**A faktor** (`fanAskFactor`) = a referencia-jegyár ÷ a mostani jegyár, két
korláttal:

* **legfeljebb 1:** csak lefelé húz. Ahol a jegyár eleve kicsi (100 alatti
  nyers erő, alsóbb ligák), ott nem emel.
* **legalább 0,02.**

**A tempó** ugyanúgy hat rá, mint a szezonkeretre, az alap tempóhoz mérve:

| tempó | szorzó |
|---|---|
| Villámfejlődés | ×1,25 |
| Gyors fejlődés | ×1,13 |
| **Alap tempó** | **×1,00** |
| Komótos fejlődés | ×0,85 |
| Csigatempó | ×0,70 |
| Gleccser-tempó | ×0,56 |
| Jégkorszak | ×0,44 |
| Kőkorszak | ×0,33 |

**Ami változatlan:**

* **A létszám** változatlanul szoroz: kétszeres tábor kétszeres bevételt hoz.
* **Az élmény-szorzó** is ugyanúgy szoroz.
* **A régi görbe** (`fanTicketScale`) is megmaradt; a valódi jegyár a kettő
  szorzata (`fanTicketMult`).

**A kikiáltási ár átlaga** (`fanSquadAskAvg`) a teljes keretből jön
(`saleAskPrice`, ugyanaz, amit a piacra bocsátás mutat). Gyorsítótárazott a
keret-összetétel és a forduló szerint.

## 3. A bejelentő helyzete, alap tempón

| | eddig | most |
|---|---|---|
| jegyár | 162 032 Ft | **42 167 Ft** (×0,26) |
| szurkolói bevétel / meccs | 52,9 Mrd | **13,8 Mrd** |
| bér / meccs (a képernyőképen 11,3 Mrd) | 11,3 Mrd | **~2,9 Mrd** |

**A bér követi:** a bér-horgony (`wageAnchorWeek`) és a sztár hírnév-horgonya
(`fameWageAnchor`) ugyanazt a jegyár-szorzót olvassa. A bér/lelátó arányok
(3.9.190) és a plafonok változatlanok, csak az alap kisebb.

## 4. Hol látszik

* **A napló** a valódi jegyárat írja („× 42 167 Ft”).
* **A keret-bontás:** „a keret kikiáltási árához igazítva ×0,26”.
* **A szurkolói doboz:** a keret átlagos kikiáltási ára és a faktor.
* **A súgó** (`szurkoloibevetel`): „A JEGYÁR A KERETED ÁRÁHOZ IGAZODIK”.

## 5. Próba

* `tools/jegyar-keretar-3-9-192-proba.js` — lásd a `tools/README.md`-t.
* A 3.9.190-es és 3.9.191-es próba verzió-ellenőrzése mostantól „legalább”
  összevetés.
