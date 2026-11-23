---
name: jelenet
description: A Magyah meccsjeleneteinek (esemény-animációk, EVA) és kameráinak szabályai. Akkor használd, ha új jelenetet, skill-/akció-/szinergia-animációt, kameraállást, kameravágást, stadion-elemet vagy ünneplés-jelenetet kell készíteni vagy módosítani az index.html-ben, illetve ha egy jelenet hibáját kell javítani.
---

# Jelenetek és kamerák — munkaszabályok

A játék egyetlen `index.html`. Minden jelenet-kód benne van, a „🎬 ESEMÉNY-ANIMÁCIÓK (3.9.270)”
blokktól (`evaPalya`, `evaFigura`, `EVA_SABLON` …) a lejátszóig (`evaKov`, `evaLezar`). A kamerák a
„🎥 KAMERÁK — 1. FÁZIS (1.0.11.12.00)” blokkban vannak, közvetlenül a lejátszó előtt. A terv és a
következő fázisok: `docs/kozvetites-unneples-terv.md`. A már megépített fázisok: `docs/kamerak-*.md`.

Előbb mindig olvasd el a `CLAUDE.md`-t és a `docs/VERZIOZAS.md`-t (verziószám minden commit előtt).

## 1. A színpad
- **Méret:** `<svg viewBox="0 0 120 120">` (`.evaSzinpad`), STILIZÁLT kép, nem valódi 3D.
- **Kapu-nézet** (`evaPalya("kapu")`): a kapu belseje x 32–88, y 22–40. Ez szélesebb a valósnál, mert a
  4×8-as célrácsnak (`EVA_RACS`) hely kell. A függőleges tengely egyszerre mélység és magasság.
  - Ezért a színpadot **ne döntsd meg 3D-ben**: a kapu „lefekszik”, a mozgás szétesik.
- **Rétegek:** a jelenet a `<g id="evaRendezo"><g id="evaKamera">…</g></g>` csoportban fut.
  - `#evaKamera`: a rázás-effektek csoportja (WAAPI).
  - `#evaRendezo`: a kamera-rendező csoportja (`transform` attribútum, nem WAAPI).
  - A kettőt ne keverd: ugyanazon az elemen a két transzform felülírná egymást.
- **`transform-origin`:** a `.evaSzinpad *` szabály `transform-box:view-box;transform-origin:0 0`.
  Minden CSS-transzform a színpad 0,0 pontjából indul.

## 2. Egy jelenet-sablon (`EVA_SABLON[kulcs]`)
```js
{dur:3000,                    // ms — ennyi után jön a vég (+650 ms kitartás)
 cim:c=>"GÓÓÓL!", alcim:c=>"", // a feliratsáv
 svg:c=>evaPalya("kapu")+evaKapu()+evaFigura("evaLovo",c.loUrl,c.loKit,40,110,1.15)+evaLabda("evaLabda",43,108),
 mozgas:(A,c)=>{A("#evaLovo",[{transform:evaT(40,110)},{transform:evaT(58,86,-8)}],{duration:1350,fill:"forwards"});}}
```
- **Típus → sablon:**
  - `EVA_TIPUS_SABLON`;
  - a skill-jelenetek: `evaSkillSablon(ev)`;
  - az alváltozatok (fejes, tizenegyes …): `evaAltSablon(ev)`.
- **Minden mozgás `A(selector, keyframes, options)`-on megy át.**
  - A lejátszó burkolója szorozza az időt (`evaIdoSzorzo`).
  - Ugyanez ütemezi a HANGOT a mozgásból (`evaHangJel`). A labda megindul → rúgás; a háló mozdul → háló; a cella villan → kesztyű.
  - Új jelenet így magától kap hangot. Saját `el.animate` hívást ne írj.
- **Helyzet:** `evaT(x,y,rot,scale)` → `translate(xpx,ypx) rotate() scale()`. A figurák talppontja a (0,0).
- **Figurák:**
  - `evaFigura(id, fig, kit, x, y, s)`; a `fig` az `evaFig(jp,kit,mood,tamado)`-ból jön (arc + bőrszín + mezszám).
  - A `data-mely="1"` miatt a lejátszó minden képkockán talppont szerint rendezi a takarást (`evaMelysegRendez`).
  - Új figura: ugyanígy, saját egyedi `id`-vel.
- **A kontextus** (`evaKontextus(ev)` → `c`):
  - mezek: `loKit` (támadó), `vedoKit`, `kapusKit`;
  - figurák: `loUrl`, `tarsUrl`, `tarsUrl2`, `vedoUrl`, `vedoUrl2`, `kapusUrl`, `rugoUrl`, és az i-edik védő: `evaVedoN(c,i)` (nem klón);
  - egyéb: a célzott cella (`c.cel`), az eseményből képzett mag (`c.r()`), a saját-e (`c.sajat`).
- **Determinizmus:**
  - a lejátszó és a jelenet NEM húz `Math.random`-ot (próba figyeli);
  - minden változat az esemény magjából jön (`c.r()`, `faceHash(...)`), így ugyanaz az esemény mindig ugyanúgy néz ki.
- **A labda a célzott cellába megy** (`c.cel.x`, `c.cel.y`), és a cella villan. A gól- és védésjelenetekben ez kötelező (próba méri).

## 3. A kamerák (1. fázis)
- **Kapcsoló:**
  - `kamBe()` / `kamAllit(on)` (localStorage `evaKamOff30_0`, alapból BE); `kamAktiv(ev)`;
  - csak a `KAM_LOVES_T` típusoknál (gol, golKapott, kapufa, bravur, vedes, tizenegyes, szabadrugas, loves);
  - párharcban soha (ott az óra nem áll).
- **Sorrend egy eseménynél:**
  1. nyitó vágás (`kamFelvetel(…,"elo")`, `KAM_ELO_MS`) a `.evaKamVaszon` vásznon (a színpad rejtve);
  2. a jelenet, benne a rendező (`kamRendezoIndit`): követő közeli (a labdán) ↔ totál vágás, a felvétel-lista az esemény magjából (`kamRendezoTerv`);
  3. gólnál reakció-vágás (`"uto"`, `KAM_UTO_MS`): a tomboló tábor ugrál, füst a klubszínekben;
  4. `evaLezar`.

  Egy esemény = EGY `_evaFut` objektum (a nyitó vágásét folytatja a jelenet; a próbák számolják).
- **3D világ:**
  - méterben, 105×68-as pálya, a támadás mindig a +x kapu felé;
  - `kamKamera(c,t,fov,W,H)`, `kamVet`;
  - közelsík-vágás: `kamVagSokszog` / `kamVagSzakasz`. Pályán álló kamera mögé lógó sokszöget soha ne dobj el egészben, vágd.
- **Kameraállások:** `KAM_ALLAS` (fo, kapu, mogul, reak); mindegyik `pos(L,u)` a labdához/főszereplőhöz (L) és az időhöz (u, 0..1).
  - Új állás: új kulcs + `pos`, és a választó listába (`kamFelvetel`: `["fo","kapu","mogul"]`).
- **A stadion az adatokból** (`kamStadionAdat`):
  - méret és nézők: `stadionKap()`, `stadionNezo()`;
  - színek: hazai/vendég `teamColors()` / `evaEllenfelKit`, a szektor a hazai-idegen szerint;
  - esti meccs: `fixtureKick`, a kupa mindig esti;
  - reklámtáblák: a kupa vagy a divízió színe (`pyrDivArculat`).
  - Lelátó: `kamLelatoEpit` (1–3 szint a befogadóképességtől, a nézők a telítettség szerint).
- **FEELING-SZABÁLY (kimondott kérés):** minden kameraállás a jelenetek hangulatát hozza.
  - **A figurák UGYANAZOK:** `kamFigKep(fig,kit)` az `evaFigura` SVG-jét alakítja képpé (arc, mez, szám). Ne rajzolj helyette saját alakot (csak tartalékként, amíg a kép betöltődik).
  - **Méret:** a figurák „nagyfejű” arányúak (`KAM_FIG_M` = 3,6 m), hogy az arcok minden szögből látsszanak. Messzi totál, ahol a figurák pöttyök, csak hangulat-képnek jó, főszereplős felvételnek nem.
  - **Pixel-téma:** kis felbontású vászon (×0,42), felnagyítva, `image-rendering:pixelated`.

## 4. Próbák
- **Minta:** a `tools/kamerak-1-0-11-12-00-proba.js` (karrier-indítás, `mevKezd({})`, `_mev.anim=true`, `evaKer(ev)`, mintavétel `setTimeout`-tal).
  - A mintavételező akkor is ütemezzen újra, ha az elem még nincs meg.
- **A jelenet saját időzítését mérő próbák** (hang-időpontok, animációszám rögtön az `evaKer` után) a kamerát kikapcsolva futnak: `addInitScript`-ben `localStorage.setItem("evaKamOff30_0","1")`.
  - Példa: `donto-pillanat-3-9-312`, `pixel-sima-3-9-313`.
- **A régi jelenetpróbák mindig fussanak le:**
  - `esemeny-animacio-3-9-270`, `eva-melyseg-3-9-329`, `sima-gol-3-9-346`, `animacio-hang-3-9-310`;
  - `donto-pillanat-3-9-312`, `pixel-sima-3-9-313`, `akcio-kepessegek-1-0-6-1-00`, `statisztak-3-9-337`;
  - `klon-1-0-7-5-01`, `csukafejes-3-9-327`, `mez-jel-esemeny-3-9-321`, `villam-mennydorges-1-0-6-4-00`.
  - Ha egy bukik, előbb nézd meg `git stash` mellett is (volt-e már előtte).
- **Szemrevételezés:** Playwright-képek több időpontban (nyitó vágás ~600 ms, jelenet ~1700 ms, reakció a vége előtt). Pixel-témában is (`applyTheme("pixel")`).
- **Teljesítmény:** CDP `Emulation.setCPUThrottlingRate` 4× (gyenge telefon). A képkocka/s mérése `requestAnimationFrame`-mel. A cél: a felvételek alatt ≥ 30 kép/s.

## 5. Általános játékszabályok, amelyekbe a jelenetek ütköznek
- **Mentés:** új `S.*` mezőt a mentés mezőlistájába ÉS a betöltésbe is fel kell venni (a mentés mezőlistás, nem automatikus). A jelenetek elvileg nem mentenek.
- **`./tools/check.sh`:** lint, ismeretlen globálisok. Böngésző-globált `window.`-val érj el (pl. `new window.DOMMatrix`).
- **Kommentek:** magyarul, a blokk elején a „KIMONDOTT KÉRÉS” idézettel és a verziószámmal (`🎥 1.0.11.12.00`).
- **Docs:** minden kisebb (minor) vagy nagyobb (major) lépéshez `docs/<téma>-<verzió>.md` és egy sor a `docs/VERZIOZAS.md`-be.
