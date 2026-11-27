#!/usr/bin/env node
/* 📉 KEZDŐ ÚT — AZ ELLENFÉL VISSZAFOGÁSA AZ ELSŐ IDÉNY FELOLDÁSAIIG: A SZÁMÍTÁS (1.0.12.17.00)
   KIMONDOTT KÉRÉS: „Nehézségi szint problémák vannak akkor, ha 5.1 fölött indul egy karrier tanítós üzemmódban,
   mivel nincsenek eszközei a feloldásokig a csapata fejlesztésére. Az alatt nincs igazán gond szerintem. De onnan
   felfelé kicsit az ellenfél fejlődésébe bele kell nyúlni az első szezon feloldásai alatt. Azaz, hogy visszafogni
   az ellenfél fejlődését az egyes feloldásokig különböző százalékokban. Erre kéne számításokat csinálnod és
   nehézségi szintekre scalelve elkészítened a visszafogás mértékét."

   A BEMENET (mind mért):
   1. A TAPASZTALT JÁTÉKOS saját ⚡-ja az 1. idényben, minden eszközzel — a meres-adat ág, 25 lezárt 1. idény
      (3.9.214 … 1.0.11.4.02, fokozat 6.3 … 9.5), a fordulóblokkok mediánja, az 1–3. forduló átlagához:
        4–6.: +0,97 · 7–10.: +1,45 · 11–15.: +2,22 · 16–20.: +3,11 · 21–25.: +4,09 · 26–30.: +6,06
   2. AZ ESZKÖZ NÉLKÜLI JÁTÉKOS ugyanígy — a valódi motor, gépi idény (tools/kut-visszafogas/meres.js), 5.1, D3,
      16 idény, vásárlás és boost nélkül:
        4–6.: +0,72 · 7–10.: +0,88 · 11–15.: +1,16 · 16–20.: +1,29 · 21–25.: +1,30 · 26–30.: +1,80
      (az edzésterv és az összhang korai vagy késői beállítása között az 1. idényben nincs mérhető különbség:
       ±1-en belül, a morál és a forma lengése alatt).
   3. A KÜLÖNBSÉG = a játékos emelői (vásárlás, boost, a többi eszköz és a tudás): 0,25 · 0,57 · 1,06 · 1,82 ·
      2,79 · 4,26 — fordulónkénti üteme blokkonként: 0 · 0,083 · 0,080 · 0,098 · 0,152 · 0,194 · 0,294.
   4. AZ EMELŐK ÖSSZETÉTELE: a boost az 1. idényben átlagosan +1,08-at ad a 25. fordulóig (boostok.csv, 25
      idény) — az emelő ~39%-a; az átigazolás (a 8. fordulótól, a Kezdő úton is ugyanakkor nyílik) ~35%; a
      maradék ~26% a többi eszközé: edzői elemzés és meccserő-bontás (jobb döntés) 8 · csapatszerepek 7 ·
      talizmán 7 · stáb, scout-cél, klub 4.
   5. A MEZŐNY idény közbeni üteme 5.1-en, D3-ban: 0,149 ⚡/forduló (pyrGrowStep, a valódi kódból).

   A KEZDŐ ÚT ZÁRJA (5.0 fölött a Boost már a 2. szakasz végén nyílik — kutSzNyit/nyitNehez):
     A — 1–2. szakasz (az első tizenegy, az első meccsek): MINDEN emelő zárva (az ablak még nem nyílt) → 100%
     B — 3. szakasz (fejlődés): elemzés, szerepek, talizmán, stáb zárva → 26%
     C — 4. szakasz (a csapat lelke): szerepek, talizmán, stáb → 18%
     D — 5. szakasz (szerencse és kockázat): talizmán, stáb → 11%
     E — 6. szakasz (a mérleg): stáb, scout-cél, klub → 4%
   A szakaszok jellemző fordulói (a feladatok a tartalék előtt teljesülnek): A 1–5 · B 6–12 · C 13–19 · D 20–25 · E 26–30.

   A VISSZAFOGÁS EGY SZAKASZBAN = a zárt rész × az emelő üteme ÷ a mezőny üteme (a szakasz fordulóin átlagolva).
   A NEHÉZSÉG SZERINT: k = (3,2 − célrés) ÷ (3,2 − 1,6) — a 4.x „Haladó" célrése (3,2) a kényelmes párna,
   amin a hiány még nem fáj (k = 0, ahogy a kérés mondja: „Az alatt nincs igazán gond"); az 5.1 célrése (1,6)
   az egységnyi (k = 1); a 10.5-é (−1,0) k = 2,63. A végső érték legfeljebb 75%.
   HASZNÁLAT: node tools/kut-visszafogas/szamitas.js */
"use strict";
const EMELO=[[1,3,0],[4,6,0.083],[7,10,0.080],[11,15,0.098],[16,20,0.152],[21,25,0.194],[26,30,0.294]];
const utem=r=>EMELO.find(([a,b])=>r>=a&&r<=b)[2];
const MEZONY=0.149;
const ZART=[1.00,0.26,0.18,0.11,0.04];
const ABLAK=[[1,5],[6,12],[13,19],[20,25],[26,30]];
const alap=ZART.map((z,i)=>{const [a,b]=ABLAK[i];let s=0;for(let r=a;r<=b;r++)s+=utem(r);return z*(s/(b-a+1))/MEZONY;});
/* a szakaszok sorrendjében nem nőhet (egy feloldás után nem lehet nagyobb a visszafogás) */
const sima=alap.map((v,i)=>Math.min(...alap.slice(0,i+1)));
const kerek=sima.map(v=>Math.round(v*100)/100);
if(require.main===module){
console.log("Alap (5.1, k=1):",["A","B","C","D","E"].map((n,i)=>`${n} ${Math.round(alap[i]*100)}% → ${Math.round(kerek[i]*100)}%`).join(" · "));
const CEL={5:1.6,6:1.4,7:0.9,8:0.4,9:-0.1,10:-0.6};
const cel=(nf,s)=>nf<5?3.2:Math.round((CEL[nf]-(nf>=6?0.1*(s-1):0))*100)/100;
console.log("\nfokozat | célrés |   k   |   A   |   B   |   C   |   D   |   E   | az idény alatt visszatartott mezőny-növekedés");
for(const [nf,s] of [[4,5],[5,1],[5,3],[5,5],[6,1],[6,3],[6,5],[7,1],[7,3],[7,5],[8,1],[8,3],[8,5],[9,1],[9,3],[9,5],[10,1],[10,3],[10,5]]){
  const c=cel(nf,s),k=Math.max(0,(3.2-c)/1.6);
  const p=kerek.map(v=>Math.min(0.75,v*k));
  let vissza=0;ABLAK.forEach(([a,b],i)=>{vissza+=p[i]*MEZONY*(b-a+1);});
  console.log(`  ${nf}.${s}   | ${String(c).padStart(5)}  | ${k.toFixed(2)}  |`+p.map(v=>` ${String(Math.round(v*100)).padStart(3)}%  |`).join("")+`  ${vissza.toFixed(2)} ⚡ (a ${(MEZONY*30).toFixed(2)}-ből)`);}
}
module.exports={kerek};
