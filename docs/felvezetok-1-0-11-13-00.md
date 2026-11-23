# 1.0.11.13.00 — Felvezető-forgatókönyvek, élő 3D gól + visszajátszás

## Kérés
> Vannak bizonyos gól előtti jelenetek, amik se a passzoló, se a góllövő nem látszik a kijelzőn
> rendesen. A letámadásgól előtt nem jó, hogy ugyanaz az animáció van bekötve másik kameraállásból,
> aminél az egyik csatár megkapja a labdát középen. Itt épp az a lényeg, hogy alapból az ellenfélnél
> van a labda. Dolgozz most azon egy kört, hogy gondold végig az összes eddig meglévő animációt, és
> építs hozzájuk felvezető animációkat […] Minden gól és nem gól animációval is foglalkozz. (Pl. egy
> 16-os vonalánál középre passzoló animáció biztosan nem jó egy tökéletes beadás + csukafejes
> kombináció előtt). Plusz érdekelne, hogy ha a mostani gól animációk végei azok csak replay-ek
> (valamelyik sarokban villogó R jelezné, az animáció a gólöröm után bejátszva) lennének, és az új
> kameraállásainkkal lennének legenerálva, stadionnézetesen ezek az animációk alapból.

Előzmény: [kamerak-1-0-11-12-00.md](kamerak-1-0-11-12-00.md) (1. fázis). Skill: `.claude/skills/jelenet/SKILL.md`.

## Mi volt a baj
- Az 1. fázisban **egyetlen** felvezetés volt (passz középre a 16-os előtt), minden lövés elé ez futott.
- A kamera **fix pont** volt a labdához képest. Ha a szereplők messze álltak egymástól, kilógtak a képből.
- A lapok, szögletek, bedobások, blokkok, sérülések, a VAR, a kidolgozás és a buszparkolás nem kapott felvezetést.

## A megoldás

### 1. Forgatókönyvek archetípusokból
Minden jelenet-sablon (mind az 51) egy **archetípust** kap (`kamArchetipus`). Az archetípus egy
forgatókönyv (`KAM_FORGATO`):
- a szereplők útja méterben (`[t, x, y, forgás, magasság]`);
- a labda útja (íveléssel);
- a vágások (melyik kameranézet, kire fókuszál);
- a hangok (rúgás, háló).

A felvezetés úgy ér véget, ahogy a rajzolt jelenet kezdődik.

| Archetípus | Mire | Mi történik |
|---|---|---|
| passz | sima gól passzal, kapufa, lövés | a társ a szélről a lövőhöz passzol |
| csel | sima gól egyéni, Elastico, Hős, Sorozat, Zolika | a lövő kicselezi a védőt (a védő megfordul) |
| beadás | fejes gól, Szélvész, Beadás-specialista, Királynő, Reptér, Zsákutca, öngól | a szélső végigfut, és beível |
| beadás a szögletzászlótól | **Csukafejes** | a szélső a szögletzászlóig fut, onnan ível |
| tizenegyes | tizenegyes, Szöcske | a lövő a labda mögött, a kapus ugrál, a bíró oldalt |
| szabadrúgás | szabadrúgás, Szabadrúgás-specialista | a rúgó nekifut, **négyfős sorfal** (mind saját arccal), a bíró |
| egyedül | Jéghideg, ziccer-bravúr | kiugratás, a kapus kifut |
| kiugratás | Torghelle, Sebész, Tízes | mélységi passz a védők közé |
| távoli | Ágyú, Szitálós, Potyagól | visszagurítás a 25 méteres lövőnek |
| sortűz / tank / phalanx / száguldás | az akció-képességek | hármas lövőfal, hármas ék, széles front, szélső vágta |
| tiki-taka | Tiki-taka | 5 passz egy érintéssel, a védők futnak |
| egy-kettő | Kémia | fal-passz |
| **letámadás** | letámadás, letámadás-gól | **az ellenfél** védője passzolgat a saját kapuja előtt, a mi csatárunk közbelép |
| **kontra** | Kontra | az ellenfél támad a mi kapunk felé, a mi védőnk becsúszva szerel, hosszú indítás, vágta |
| nagylabda / katapult / vágta | Nagylabda, Katapult, Villám | hosszú ívelés a védelemből / a mi kapusunk kirúgása / sprint |
| szöglet / bedobás | szöglet, Olló, bedobás | a rúgó a zászlónál, a bedobó a vonalon, a tömeg a 16-oson belül |
| busz | buszparkolás | a védekező csapat visszarohan, és falat húz |
| csere | csere | a beálló a felezővonalnál, a bíró mellett |
| szabálytalanság | sárga, piros | a lapot kapó becsúszik, az ellenfél elesik, a **játékvezető** odafut |
| ütközés | sérülés | fejpárbaj, a sérült elesik |
| VAR | VAR | a játékvezető a partvonali monitorhoz siet |
| kidolgozás / védekezés | kidolgozás, blokk | rövid passzok / a védő a lövő elé lép |

A szinergia-gól (`skSzin`) a pár első stílusa szerint választ: gegen → letámadás, villám → kontra,
tiki-taka / harmónia → tiki-taka, bombázók → távoli, sztár → csel, panzer → phalanx, beton → busz.

### 2. Automatikus képkivágás
- A kamera most egy **nézet-irány** és egy látószög (`KAM_NEZET`): főkamera, szemközti lelátó, a támadók mögül, kapu mögötti, magas kamera, oldalvonali.
- A távolságot és a célpontot minden képkockán a **képkivágás** számolja (`kamKivagas`, felezéses keresés). A fókusz-szereplők (talp és fej), illetve a labda a kép belső részében maradnak.
- A fókusz **prioritás szerinti** lista. Ha mindenki csak 22 méternél messzebbről férne be (ott a figurák pöttyök), a lista végéről ejt. A passzoló és a góllövő így mindig nagy marad.
- A kamera vágáson belül lágyan követ, és lassan úszik (élő hatás). A lencse elé kerülő figura elhalványul.
- A szereplők elfordulnak (becsúszás, esés, vetődés) és ugranak (fejes).

### 3. Élő + ismétlés mód
A Beállításokban a 🎥 Kameravágások gomb háromállású: **Felvezetés** (alap) → **Élő + ismétlés** → **Ki**.

Élő + ismétlés módban, gólnál:
1. A felvezetés élőben folytatódik 3D-ben (`kamBefejezes`):
   - lövés, vagy fejesnél felugrás a labdára (Torghelle-nél emelés);
   - a labda **ugyanabba a cellába** megy, ahová a rajzolt jelenet is lő;
   - a kapus vetődik (a mag dönti el, jó vagy rossz irányba);
   - rúgás- és hálóhang, a háló megremeg, a gólt szerző tábor felugrik.
   - A felirat közben: „● ÉLŐ · <kameraállás>”.
2. Gólöröm: a tomboló lelátó (reakció-vágás).
3. A megszokott rajzolt jelenet **visszajátszásként**, a jobb felső sarokban villogó **R · VISSZAJÁTSZÁS** jelzéssel. Utána nincs második gólöröm.

Nem gól eseménynél a mód ugyanúgy fut, mint a Felvezetés.

## Determinizmus
A mag (`kamMag`) dönti el az archetípus-változatot, a tükrözést (melyik szélen), a kapus irányát és
a záró kameraállást. Ugyanaz az esemény mindig ugyanúgy néz ki.

## Próbák
- `tools/felvezetok-1-0-11-13-00-proba.js` (új), amely ellenőrzi:
  - mind az 51 sablon létező archetípust kap;
  - a letámadásnál a labda az ellenfélnél kezd;
  - a csukafejes beadása a szögletzászlótól indul;
  - a kontra a saját térfelünkről indul;
  - a lapnál van becsúszás és játékvezető, a szabadrúgásnál négyfős sorfal;
  - mérőhoroggal: minden felvezetés minden vágásában a fő szereplő a képen van, és legalább 11%-os (1358 képkocka, a legkisebb 16,6%);
  - a determinizmus;
  - az élő + ismétlés sorrendje (vászon → R-es színpad → vége, egy `_evaFut`);
  - az élő labda a kapuba megy, hálóhanggal;
  - nem gólnál nincs R;
  - a háromállású kapcsoló.
- `tools/kamerak-1-0-11-12-00-proba.js`: frissítve. A napló formája `elo:<archetípus>` / `uto:reakcio`, és a lapnak is van felvezetése.
- A régi jelenetpróbák (12 db) mind átmennek.
- Teljesítmény 4×-es CPU-lassítással:
  - az első 0,5 s 16–21 kép/s (a figuraképek dekódolása, mint eddig);
  - utána 37–50 kép/s.
