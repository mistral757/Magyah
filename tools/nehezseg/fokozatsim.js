#!/usr/bin/env node
/* 🎚 FOKOZAT-SZIMULÁCIÓ: a 10 × 5 belső szint (3.9.223) karrier-modellben.
   MODELL — az irányokat és a fokozatosságot mutatja, nem mért állandókat.

   A JÁTÉK PONTOS PARAMÉTEREI (index.html):
     · a mezőny éves üteme: PYR_PACE (7,0) × a játékos-tengely tempó-szorzója ×
       az ellenfél-tempó részaránya az osztályban (PYR_SPEEDS share → top);
     · a tempó-szorzók (GAME_TEMPO k), a kétoldalú szabályozó (rajt-cél a mért
       rés-változásból, felül emelés, télen a célrés +0,5, alul a holtsáv 1,5),
       az alsó fék (legfeljebb egy éves ütemnyi — a mezőny megáll), a téli tűrés
       (laza +1,0 · normál +0,5 · szigorú 0 a célrés fölött);
     · a meccsek: tools/nehezseg/motor.js (a valódi motorhoz kalibrálva).
   BECSLÉSEK (a mérő adatai hangolják — lásd docs/fokozat-csomag-3-9-223.md):
     · a saját idényen belüli sodródás (mért: 5,6 + 0,8 × rés, Alap tempón):
       35% morál/forma (tempófüggetlen), 40% fejlődés (játékos-tengely), 25%
       összhang/begyakorlás (taktika-tengely);
     · a nyári befektetés P (vásárlás, boost, akadémia): P0 × (25% fix + 55% a
       pénz-tengely + 20% az akadémia-tengely szerint);
     · ingyen ikonok: +0,8 meccserő/idény a megszokott sűrűségen, a sűrűség
       szorzójával; valósághű scout: −0,6/idény; realisztikus képesség:
       −0,5/idény.
   HASZNÁLAT: R=300 N=15 P0=3 node tools/nehezseg/fokozatsim.js  (CSV=ki.csv a teljes táblához) */
"use strict";
const fs=require("fs");
const {userMatch,ketMeccs,norm,pois,lam,SPREAD,STEP}=require("./motor.js");
const {nfCsomag}=require("./fokozatok.js");
const GT={turbo:1.00,gyors:0.90,normal:0.80,komotos:0.68,csiga:0.56,gleccser:0.45,jegkorszak:0.35,kokorszak:0.26};
const SP={alvo:[0.58,0.70],lassu:[0.72,0.78],tarto:[0.88,0.98],kegyet:[1.30,1.55],konyortelen:[1.75,2.10],vegtelen:[2.30,2.70]};
const ICON={teljes:1,ritka:0.55,nagyonritka:0.25,ki:0};
const TEL={laza:1.0,normal:0.5,szigoru:0};
const PACE=7.0,HOLT=1.5,TOL=0.15;
const R=+process.env.R||300,N=+process.env.N||15,P0=+(process.env.P0||3);
const share=(spk,div)=>{const [a,b]=SP[spk];const t=Math.max(0,Math.min(1,(6-div)/5));return a+(b-a)*t;};
const drift0=g=>Math.max(2,Math.min(10,5.6+0.8*g));
function fieldPace(c,div){return PACE*GT[c.tempo.jatekos]*share(c.speed,div);}
function ownDrift(c,g){return drift0(g)*(0.35+0.40*GT[c.tempo.jatekos]/0.8+0.25*GT[c.tempo.taktika]/0.8);}
function summerP(c){
  let p=P0*(0.25+0.55*GT[c.tempo.penz]/0.8+0.20*GT[c.tempo.akademia]/0.8);
  p+=0.8*ICON[c.icons];
  if(c.scout==="on")p-=0.6;
  if(c.skill==="real")p-=0.5;
  return p;}
/* rajt-cél: a mért változásból (dg), az első idényben a modellből (bisection) */
function rajtCel(c,div,dg){
  if(dg!=null)return c.cel-dg/2;
  const F=fieldPace(c,div);let lo=-15,hi=15;
  for(let i=0;i<50;i++){const m=(lo+hi)/2;if(m+(ownDrift(c,m)-F)/2<c.cel)lo=m;else hi=m;}
  return (lo+hi)/2;}
function idenyS(g0,dr,F,cel,tt){
  const n=16,s=[0];for(let i=1;i<n;i++)s.push(norm()*SPREAD);
  const riv=s.map((x,i)=>({i,d:Math.abs(x)})).filter(x=>x.i).sort((a,b)=>a.d-b.d).slice(0,2).map(x=>x.i);
  const opp=[];for(let i=1;i<n;i++){opp.push([i,true]);opp.push([i,false]);}opp.sort(()=>Math.random()-0.5);
  const pts=new Array(n).fill(0),gd=new Array(n).fill(0);
  const ai=[];for(let h=1;h<n;h++)for(let a=1;a<n;a++){if(h===a)continue;const d=s[h]-s[a]+0.9;ai.push([h,a,pois(lam(d)),pois(lam(-d))]);}
  ai.sort(()=>Math.random()-0.5);const per=Math.ceil(ai.length/30);
  let tel=0,gSum=0;
  for(let r=0;r<30;r++){
    for(const [h,a,x,y] of ai.slice(r*per,(r+1)*per)){gd[h]+=x-y;gd[a]+=y-x;if(x>y)pts[h]+=3;else if(x<y)pts[a]+=3;else{pts[h]++;pts[a]++;}}
    if(r===15){const gNow=g0+(dr-F)*0.5;if(gNow-(cel+tt)>TOL)tel=gNow-(cel+tt);}
    const sh=r<15?0:tel/2+tel/2*(r-15)/15;
    const g=g0+(dr-F)*(r/30)-sh;gSum+=g;
    const [o,home]=opp[r];const hajra=r>=23&&Math.abs(pts[0]-pts[o])<=4;
    const [x,y]=userMatch(g-s[o],home,riv.includes(o)||hajra);
    gd[0]+=x-y;gd[o]+=y-x;if(x>y)pts[0]+=3;else if(x<y)pts[o]+=3;else{pts[0]++;pts[o]++;}}
  const ord=[...Array(n).keys()].sort((p,q)=>pts[q]-pts[p]||gd[q]-gd[p]);const pos=ord.indexOf(0)+1;
  const gEnd=g0+(dr-F)-tel;
  let fel=pos===1,le=pos===16;
  if(pos===2||pos===3)fel=ketMeccs(gEnd-(STEP-1.2*SPREAD));
  if(pos===14||pos===15)le=!ketMeccs(gEnd-(-STEP+1.2*SPREAD));
  return {pos,fel,le,tel,gEnd,gAvg:gSum/30};}
function karrier(c){
  let div=6,M=80,Lnat=null,dgs=[],out=[],fekOssz=0;
  for(let sz=1;sz<=N;sz++){
    const want=rajtCel(c,div,dgs.length?dgs.slice(-2).reduce((a,b)=>a+b,0)/Math.min(2,dgs.length):null);
    let L;
    if(sz===1)L=M-want;                         /* a horgony a rajt-célra áll */
    else{
      const g=M-Lnat;
      if(g-want>TOL)L=M-want;                   /* felül: a mezőny felnő */
      else if(g<want-HOLT-TOL){                 /* alul: az alsó fék */
        const cap=fieldPace(c,div);
        L=Math.max(Lnat-cap,M-(want-HOLT));fekOssz+=Lnat-L;}
      else L=Lnat;}
    const g0=M-L,F=fieldPace(c,div),dr=ownDrift(c,g0);
    const r=idenyS(g0,dr,F,c.cel,TEL[c.tel]);
    dgs.push(r.gEnd-g0+r.tel);
    out.push({sz,div,g0,gAvg:r.gAvg,pos:r.pos,fel:r.fel,le:r.le});
    /* nyár: a saját erő nő (sodródás + befektetés), a mezőny az idény végén áll */
    M+=dr+summerP(c);Lnat=L+F+r.tel;
    if(r.fel&&div>1){div--;Lnat+=STEP;}else if(r.le&&div<6){div++;Lnat-=STEP;}
    else if(r.fel&&div===1&&r.pos===1){/* élvonalbeli cím: marad */}}
  return {out,fekOssz};}
const rows=[];
console.log(`modell: P0=${P0} · ${N} idény · ${R} karrier/sor · D6-ból`);
console.log("fok    célrés ellenfél     tempó (J/P/T/A)                 ikon     képes. scout tél    | átl.rés | feljut% | bajn% | kies% | beragad% | élvonal | D1-cím%");
for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++){
  const c=nfCsomag(nf,s);
  let gs=0,gn=0,fel=0,feln=0,le=0,stuck=0,stN=0,top=[],ch=0,chN=0,baj=0;
  for(let k=0;k<R;k++){
    const {out}=karrier(c);let run=0;
    const t=out.find(x=>x.div===1);top.push(t?t.sz:99);
    out.forEach(x=>{gs+=x.gAvg;gn++;
      if(x.div>1){feln++;if(x.fel)fel++;stN++;if(!x.fel)run++;else run=0;if(run>=3)stuck++;}
      if(x.le)le++;if(x.pos===1)baj++;
      if(x.div===1){chN++;if(x.pos===1)ch++;}});}
  top.sort((a,b)=>a-b);const med=top[Math.floor(top.length/2)];
  const row={fok:`${nf}.${s}`,cel:c.cel,speed:c.speed,tempo:`${c.tempo.jatekos}/${c.tempo.penz}/${c.tempo.taktika}/${c.tempo.akademia}`,
    icons:c.icons,skill:c.skill,scout:c.scout,tel:c.tel,gAvg:gs/gn,fel:feln?100*fel/feln:NaN,kies:100*le/gn,
    stuck:stN?100*stuck/stN:0,bajnok:100*baj/gn,top:med>N?null:med,cim:chN?100*ch/chN:NaN};
  rows.push(row);
  const f=(x,d)=>isFinite(x)?x.toFixed(d):"—";
  console.log(`${row.fok.padEnd(6)} ${String(c.cel).padStart(5)}  ${c.speed.padEnd(12)} ${row.tempo.padEnd(31)} ${c.icons.padEnd(8)} ${c.skill.padEnd(6)} ${c.scout.padEnd(5)} ${c.tel.padEnd(7)}| ${f(row.gAvg,1).padStart(6)} | ${f(row.fel,0).padStart(6)}  | ${f(row.bajnok,0).padStart(4)}  | ${f(row.kies,0).padStart(4)}  | ${f(row.stuck,0).padStart(6)}   | ${(row.top?row.top+".":"—").padStart(4)}    | ${f(row.cim,0).padStart(5)}`);}
if(process.env.CSV){const h=Object.keys(rows[0]);
  fs.writeFileSync(process.env.CSV,h.join(";")+"\n"+rows.map(r=>h.map(k=>typeof r[k]==="number"?r[k].toFixed(2):r[k]).join(";")).join("\n")+"\n");}
