# 1.0.6.1.00 — akció-képességek és hangolások

## Hangolások
- **Gegenpressing — Nyomásgyakorlás és Büntetés:** minden szinten +25% ár
  (`stTrait` szorzó 1,25), a hatás −33% (×0,67): labdaszerzés 2,0/2,8/3,6 →
  1,34/1,88/2,41 meccsenként, a védekező képességek ráadása +33/+66% → +22/+44%,
  a büntetés esélye 25/33/50% → 17/22/34% (a plafon marad: 2/2/3).
- **Tiki-Taka — Passzrekord:** −10% ár (a 1,35-ös rendszer-szorzó ×0,9), +75%
  hatás: a befejezés fala 1,40 → 1,32. Mérve (valódi keret, begyakorolt
  rendszer, 12 000 meccs): azonos szinten 0,37 → 0,65, +5-ön 0,55 → 0,96 gól/meccs
  — pontosan ×1,75 (a két sor plafonja fölött nem nőhet).
- **Tiki-Taka — Övék a középpálya** (új, III. sáv): +1,5 / +2,5 / +3,5
  csapaterő, ha a középpálya a legerősebb sor (a többi filozófia párja; a
  Gegennek szándékosan nincs ilyen).

## Az öt akció-képesség (III. sáv, 1/2/3 alkalom meccsenként)
| filozófia | képesség | tengely (az ellenfél nyers erejéhez) | gólszerző |
|---|---|---|---|
| Bombázók | 🔥 Sortűz | a 4 legjobb Gólszerzés | bárki, a gól-képességűek a fő esélyesek |
| Beton | 🛡️ Phalanx | a 6 legjobb Védekezés | a hat közül bárki |
| Villám | ⚡ Száguldás! A port se szeretem. | a szélsők Sebessége | a középen érkező (Robben berobban szerep 60%) |
| Panzer | 💥 Tankoljunk | a Félelem szint | nincs — a Panzerkampfwagené |
| Harmónia | ☯️ Egyensúly | a csapategyensúly | aki a legjobban kilóg a sorból |

**A mérce:** a tiki-taka (új, 1,32-es falú) próbálkozásonkénti gólesélye az
erőkülönbség függvényében, mérve (`AKC_TT_P`). Egy akció próbálkozásonként
q = ½ × TT_TRIES[szint] × p_TT(szint, eltérés) ÷ szint — vagyis szintenként
pontosan a tiki-taka hozamának fele (a kért 66%-os plafon alatt).

**A motor:** a kezdőrúgáskor ütemeződik (külön vödrökben), a saját percében
fut; a gól a tiki-taka könyvelési útján megy (statisztika, mérföldkövek), az
edzői elemzésben saját forrásként és várható értékkel (a meccs előtt is).
Párharcban nem fut. Meddő alkalomnál a közvetítés is kimondja.

**A jelenetek** (gól esetén): Sortűz — négy ember lő egymás után, a labda a
védőről és a kapusról pattan, a végén bevágja; Phalanx — hat ember vállvetve,
három lépcsőben nyomul, a labda falról falra pattog; Száguldás — a két
szélső felfut és keresztbe adogat, középen befejezés; Tankoljunk — a tank
begördül, hárman a toronyban, két lövés a csőből (léc, majd háló);
Egyensúly — a labda ívben, a levegőben jár, érintés-számláló, a kilógó lő.

Próba: `tools/akcio-kepessegek-1-0-6-1-00-proba.js` (valódi meccsekkel).
