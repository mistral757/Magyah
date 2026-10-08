#!/usr/bin/env node
/* 🧭 KARRIER-SZIMULÁCIÓ: a mostani padló (3.9.210) vs a javasolt kétoldalú sáv-szabályozó
   (nehézségi terv, 3.9.221). MODELL — az irányokat mutatja, nem mért állandókat.
   · a meccsek: tools/nehezseg/motor.js (a valódi motorhoz kalibrálva);
   · a rés idényen belül a MÉRT sodródással nő: 5,6 + 0,8 × rés (2…10 közé fogva) —
     tools/meccsmotor/spiral-valos.js, 60 végigjátszott idény, vásárlás nélkül;
   · nyáron: a saját meccserő + a sodródás + P (vásárlás/boost/összhang, beállítható);
     a mezőny természetes szintje + F (a piramis tempója, „Lépést tartanak" ≈ 6,2);
     feljutásnál +3 (lépcső), kiesésnél −3.
   HASZNÁLAT: P=3 F=6.2 G0=2 R=300 node tools/nehezseg/karriersim.js */
"use strict";
const {match,pois,userMatch,ketMeccs,norm,lam,NEW,DELTA,SPREAD,STEP}=require("./motor.js");
const drift=g=>Math.max(2,Math.min(10,5.6+0.8*g));
/* a rajt-rés, amiből az idény ÁTLAGA épp a célra jön ki: rajt + sodródás(rajt)/2 = cél
   (a sodródás a RAJT réstől függ — a gyengébb rajt lassabban sodródik) */
function rajtACelhoz(cel){let lo=-15,hi=15;for(let i=0;i<50;i++){const m=(lo+hi)/2;if(m+drift(m)/2<cel)lo=m;else hi=m;}return (lo+hi)/2;}
// egy idény, idényen belül növekvő réssel; tél: a 15. forduló után a szabályozó mozdíthat
function idenyS(g0,tel){ // tel(gNow) → a mezőny emelése a tél után (≥0)
  const n=16,s=[0];for(let i=1;i<n;i++)s.push(norm()*SPREAD);
  const dr=drift(g0);let shift=0;
  const riv=s.map((x,i)=>({i,d:Math.abs(x)})).filter(x=>x.i).sort((a,b)=>a.d-b.d).slice(0,2).map(x=>x.i);
  const opp=[];for(let i=1;i<n;i++){opp.push([i,true]);opp.push([i,false]);}opp.sort(()=>Math.random()-0.5);
  const pts=new Array(n).fill(0),gd=new Array(n).fill(0);
  const ai=[];for(let h=1;h<n;h++)for(let a=1;a<n;a++){if(h===a)continue;const d=s[h]-s[a]+0.9;ai.push([h,a,pois(lam(d)),pois(lam(-d))]);}
  ai.sort(()=>Math.random()-0.5);const per=Math.ceil(ai.length/30);
  for(let r=0;r<30;r++){
    for(const [h,a,x,y] of ai.slice(r*per,(r+1)*per)){gd[h]+=x-y;gd[a]+=y-x;if(x>y)pts[h]+=3;else if(x<y)pts[a]+=3;else{pts[h]++;pts[a]++;}}
    if(r===15&&tel)shift+=tel(g0+dr*0.5-shift);
    const g=g0+dr*(r/30)-shift;
    const [o,home]=opp[r];const hajra=r>=23&&Math.abs(pts[0]-pts[o])<=4;
    const [x,y]=userMatch(g-s[o],home,riv.includes(o)||hajra);
    gd[0]+=x-y;gd[o]+=y-x;if(x>y)pts[0]+=3;else if(x<y)pts[o]+=3;else{pts[0]++;pts[o]++;}}
  const ord=[...Array(n).keys()].sort((p,q)=>pts[q]-pts[p]||gd[q]-gd[p]);const pos=ord.indexOf(0)+1;
  const gEnd=g0+dr-shift;
  let fel=pos===1,le=pos===16;
  if(pos===2||pos===3)fel=ketMeccs(gEnd-(STEP-1.2*SPREAD));
  if(pos===14||pos===15)le=!ketMeccs(gEnd-(-STEP+1.2*SPREAD));
  const margin=pos===1?pts[0]-Math.max(...pts.filter((_,i)=>i)):0;
  return {pos,fel,le,dr,shift,gEnd,margin,gAvg:g0+dr/2-shift/2};}
// a karrier: M a saját meccserő a kezdőrúgáskor; Lnat a mezőny természetes szintje (osztályátlag)
function karrier(cfg){
  /* Lprev: ahol a mezőny az előző idény végén állt (fel-/kiesés után a lépcsővel
     eltolva); a természetes szint ebből nő a tempóval. „A világ nem zsugorodik":
     a mezőny megállhat, de az előző idény végi szintje alá nem megy. */
  let div=6,M=80,Lprev=80-cfg.g0-cfg.F,seasons=[];
  for(let sz=1;sz<=cfg.N;sz++){
    const Lnat=Lprev+cfg.F;let L=Lnat;
    const g=M-Lnat;
    // ---- A KEZDŐRÚGÁS ----
    if(sz>=2){
      if(cfg.mod==="padlo"||cfg.mod==="fek")L=Math.max(Lnat,M-cfg.vall);
      if(cfg.mod==="fek"&&g<cfg.vall-cfg.W)L=Math.max(Lprev,M-(cfg.vall-cfg.W));   // ALSÓ FÉK: a mezőny lassabban nő (legfeljebb megáll)
      if(cfg.mod==="ketoldalu"){
        /* A JAVASOLT RENDSZER: a fokozat a célrés (az IDÉNY ÁTLAGA); a rajt a várható
           sodródás felével lejjebb áll; fölötte a mezőny a rajtig felnő, alatta
           (W-nél mélyebben) a mezőny lassabban nő — legfeljebb megáll. */
        const kick=rajtACelhoz(cfg.cel);
        if(g>kick)L=M-kick;
        else if(g<kick-cfg.W)L=Math.max(Lprev,M-(kick-cfg.W));}
      if(cfg.mod==="sav"){
        const cel=cfg.cel-drift(cfg.cel)/2,top=cel+cfg.fel,bot=cel-cfg.le;
        if(g>top)L=M-top;
        else if(g<bot)L=Math.max(Lprev,M-bot);}}
    const g0=M-L;
    // ---- A TÉL ----
    let tel=null;
    if(cfg.mod==="padlo"||cfg.mod==="fek")tel=x=>x>cfg.vall?(x-cfg.vall)/2:0;
    if(cfg.mod==="sav")tel=x=>{const top=cfg.cel+cfg.fel;return x>top?(x-top)/2:0;};
    if(cfg.mod==="ketoldalu")tel=x=>x>cfg.cel+0.5?(x-cfg.cel-0.5)/2:0;   // tél: a cél +0,5 fölötti rész fele
    const r=idenyS(g0,tel);
    seasons.push({sz,div,g0:+g0.toFixed(2),gAvg:r.gAvg,pos:r.pos,fel:r.fel,le:r.le,margin:r.margin});
    // ---- A NYÁR ----
    M+=r.dr+cfg.P;
    Lprev=L+r.shift;
    if(r.fel&&div>0){div--;Lprev+=STEP;}else if(r.le&&div<6){div++;Lprev-=STEP;}
  }
  return seasons;}
const CFG={N:12,P:+(process.env.P||3),F:+(process.env.F||6.2),g0:+(process.env.G0||2)};
const VAR=process.env.REGI?[
  ["nincs szabályozó",{mod:"nincs"}],
  ["mostani padló, vállalás +2",{mod:"padlo",vall:2}],
  ["padló +2 ÉS alsó fék (−1,5 alatt)",{mod:"fek",vall:2,W:1.5}]]:[
  ["mostani padló, vállalás +2",{mod:"padlo",vall:2}],
  ["KÉTOLDALÚ, célrés +1,5 (Kihívás)",{mod:"ketoldalu",cel:1.5,W:1.5}],
  ["KÉTOLDALÚ, célrés +2,5 (Kiegyensúlyozott)",{mod:"ketoldalu",cel:2.5,W:1.5}],
  ["KÉTOLDALÚ, célrés +3,5 (Kényelmes)",{mod:"ketoldalu",cel:3.5,W:1.5}]];
const R=+process.env.R||400;
console.log(`modell: vásárlás/boost P=${CFG.P}/idény · a mezőny tempója F=${CFG.F}/idény · rajt-rés ${CFG.g0} · ${CFG.N} idény · ${R} karrier/sor`);
console.log("változat".padEnd(42)+"élvonal(D0) | beragadás* | cím 3.idénytől | fölényes cím** | idény-átlag rés (szórás)");
for(const [n,v] of VAR){
  let topAt=[],stuck=0,stuckN=0,ch=0,chN=0,dom=0,gs=[];
  for(let k=0;k<R;k++){const S=karrier(Object.assign({},CFG,v));
    const t=S.find(s=>s.div===0);topAt.push(t?t.sz:99);
    let run=0;S.forEach(s=>{stuckN++;if(!s.fel&&s.div>0)run++;else run=0;if(run>=3)stuck++;});
    S.filter(s=>s.sz>=3).forEach(s=>{chN++;if(s.pos===1)ch++;if(s.pos===1&&s.margin>=12)dom++;});
    S.forEach(s=>gs.push(s.gAvg));}
  topAt.sort((a,b)=>a-b);const med=topAt[Math.floor(topAt.length/2)];
  const m=gs.reduce((a,b)=>a+b,0)/gs.length,sd=Math.sqrt(gs.reduce((a,b)=>a+(b-m)**2,0)/gs.length);
  console.log(n.padEnd(42)+`${med>12?"—":med+". idény"}`.padEnd(12)+`| ${(100*stuck/stuckN).toFixed(0).padStart(4)}%     | ${(100*ch/chN).toFixed(0).padStart(4)}%        | ${(100*dom/chN).toFixed(0).padStart(4)}%          | ${m.toFixed(1)} (${sd.toFixed(1)})`);}
console.log("* a 3. egymás utáni feljutás nélküli idénytől minden idény (a D0 előtt) · ** cím legalább 12 pont előnnyel");
