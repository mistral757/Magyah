# 1.0.11.17.00 — Kezdő út, 3. fázis: a leckék, a Vezetés-kapcsoló, a „kezdő bot”

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (6.4, 7.1, 7.2, 7.4, 8., 10. fejezet; az állapot a 16.-ban).
Előzmény: [kezdo-ut-motor-1-0-11-16-00.md](kezdo-ut-motor-1-0-11-16-00.md) (2. fázis, a motor).

## Kérés
> […] ha valami kinyílik, egy rövid lecke […] képernyőképekkel megmutatjuk, hogy na itt akkor
> ezt kell csinálni. […] Mehet a meló.

## A lecke formája
Minden lecke legfeljebb 4 lépés. A lap a képernyő alján ül, a fejlécében „📖 <cím> · 2/4” áll.

| Lépés | Mit lát a játékos |
|---|---|
| 🖼 **Kép** | a valódi HUB-elem élő másolata a lapon (pl. a büdzsé-sáv) |
| 👉 **Mutasd** | a menü kinyílik a gombnál; a gomb körül arany keret, a többi elsötétül |
| ✋ **Csináld** | „Megcsinálom →”: a lecke kis sávvá húzódik („✋ Várom: …”), és megvárja, amíg a játékos megcsinálja; utána „✅ Kész — szép munka!” |
| ✅ **Összegzés** | egy-két mondat: mit ért el, és mi jön |

- **Biztonság:** a „Csináld” csak visszafordítható műveletet kér: megbízás, edzésterv, csúszka. Pénzt költő vagy végleges döntést a lecke soha nem végeztet el.
- **Nem állja el az utat:**
  - a HUB-on kívül (az edzésterv képernyője, egy felugró ablak) a lecke kis sáv a modális ablakok alatt;
  - a HUB-ra visszatérve teljes lappal folytatódik;
  - „Kihagyom a leckét” bármikor.
- **Nem jelenik meg egyszerre más ablakkal:** amíg egy lecke fut, a nyitás-ablak vár, és a futó lecke nem számít „másik ablaknak” önmaga számára.

## A leckék

| Lecke | Mikor | Lépések |
|---|---|---|
| Az első tizenegy | a Kezdő út kártyáján „📖 Mutasd, hogyan” | felállás (poszt-illeszkedés) · taktika (85-ös szint) · ✋ megbízás egy középpályásnak · összegzés |
| Edzés és összhang | a 2. szakasz nyitásakor | edzésterv · ✋ állíts be edzéstervet · összhangépítés · összegzés |
| Az átigazolás | a 8. forduló utáni nyitáskor | vétel (büdzsé idényenként; a vétel drágább, mint az eladás) · eladás két úton (azonnal ¼ ár / piacon 60–125%) · 🖼 a büdzsé-sáv (halmozott, a bér minden idényben visz) · három szabály |
| A meccs számai | a 3. szakasz nyitásakor | meccserő (1 pont ≈ +13% gólvárhatóság) · az edző elemzése (győzelmi esély, mielőtt költenél) · ✋ próbálj ki egy csúszkát · összegzés |
| A csapat lelke | a 4. szakasz nyitásakor | csapatszerepek · kapitány (jellemre, nem Ratingre) · cserék · presetek |
| Szerencse és kockázat | az 5. szakasz nyitásakor | talizmán (helyzeti képesség) · ládák · kihívás = vállalás (jutalom ÉS büntetés) · mérlegelj |
| Erőforrás és a mezőny (7.1) | a 6. szakasz nyitásakor | 🖼 a pénzed iránya · a célrés és a mezőny-követés · Boost-központ + költés-figyelmeztetés · három szabály |
| Hosszú táv | a 7. szakasz nyitásakor | ifiakadémia · nemzetközi kupa · végigjártad |

- A nyitás-ablak „Mutasd meg →” gombja a nyitó szakasz leckéjét indítja.
- A lejátszott leckéket (`S.kut.lecke`) a Kezdő út kártyáján a „📖 Leckék” gomb sorolja fel.

## Beállítás: ☰ Menü → 🧭 Vezetés → Kezdő út
- **Be / Ki:**
  - kikapcsolva minden funkció azonnal nyitva;
  - visszakapcsolva a még el nem ért funkciók újra rejtve, a már kinyíltak nyitva maradnak.
- **Leckék — bármikor újranézhető:** a már kinyílt funkciók leckéi.
- Karrier Kezdő út nélkül (Ismerem / régi mentés): egy sor mondja, hogy itt minden nyitva.

## Változás a menetrendben
A **„Mérleg”** szakasz tartaléka a 2. idény 1. fordulója helyett a **30. forduló**. Így az első nyáron (az első nagy gazdasági döntésnél) már nyitva van:
- a Boost-központ;
- az Infópult a klub gazdaságával;
- a stáb;
- a scout-célzás;
- a klub fejlesztései.

## A kiemelés
- A sötétítés 0,66-os, és a gomb körül lüktető arany keret jelzi a kiemelést (mozgáscsökkentésnél nem lüktet).
- A keret a görgetést követi.

## Próbák
- **`tools/kezdo-ut-leckek-1-0-11-17-00-proba.js` (új)**, amely ellenőrzi:
  1. a leckék szerkezetét és biztonságát;
  2. az első leckét a kártyáról: kiemelés és keret, Csináld → Kész, a feladat is kipipálva;
  3. hogy a nyitás-ablak a leckét indítja;
  4. a HUB-on kívüli kis sávot (z < 90) és a folytatást;
  5. a Vezetés-kapcsolót és a leckék újranézését;
  6. a **kezdő botot**: egy teljes első idény tétlenül végigjátszva. A 30. fordulóra a 0–5. szakasz lezárul, minden első idényes funkció nyitva, csak az akadémia és a kupa vár;
  7. hogy nincs oldalhiba.
- **A Kezdő út és a Vezetés panel régi próbái:** lásd a commitot.
