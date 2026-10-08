#!/usr/bin/env node
/* 📊 IDÉNY-KIMENET A KEZDŐRÚGÁSKORI RÉS SZERINT (nehézségi terv, 3.9.221)
   A piramis szabályaival: 16 csapat, a bajnok feljut, a 2–3. osztályozót játszik
   a fentebbi liga 14–15. helyezettje ellen (oda-vissza), a 16. kiesik, a 14–15.
   osztályozón védekezik; 2 rivális (a hozzád erőben legközelebbiek) és a hajrá-
   rangadók (az utolsó 7 forduló, 4 ponton belül). A rés ÁLLANDÓ az idény alatt.
   HASZNÁLAT: node tools/nehezseg/idenysim.js   (R=2000 GS=-3,0,3 SPREAD=2 STEP=3 DELTA=0.75) */
"use strict";
const {match,pois,userMatch,ketMeccs,norm,lam,NEW,DELTA,SPREAD,STEP}=require("./motor.js");
function idény(g){
  const n=16,s=[g];for(let i=1;i<n;i++)s.push(norm()*SPREAD);
  const riv=s.map((x,i)=>({i,d:Math.abs(x-g)})).filter(x=>x.i).sort((a,b)=>a.d-b.d).slice(0,2).map(x=>x.i);
  // menetrend: 30 forduló, kétszer mindenki ellen; a te meccseid sorrendje véletlen
  const opp=[];for(let i=1;i<n;i++){opp.push([i,true]);opp.push([i,false]);}
  opp.sort(()=>Math.random()-0.5);
  const pts=new Array(n).fill(0),gd=new Array(n).fill(0);
  // AI–AI meccsek fordulónként egyenletesen elosztva: előre lejátsszuk, és fordulónként adagoljuk
  const ai=[];for(let h=1;h<n;h++)for(let a=1;a<n;a++){if(h===a)continue;const d=s[h]-s[a]+0.9;ai.push([h,a,pois(lam(d)),pois(lam(-d))]);}
  ai.sort(()=>Math.random()-0.5);const per=Math.ceil(ai.length/30);
  for(let r=0;r<30;r++){
    for(const [h,a,x,y] of ai.slice(r*per,(r+1)*per)){gd[h]+=x-y;gd[a]+=y-x;if(x>y)pts[h]+=3;else if(x<y)pts[a]+=3;else{pts[h]++;pts[a]++;}}
    const [o,home]=opp[r];
    const hajra=r>=23&&Math.abs(pts[0]-pts[o])<=4;
    const [x,y]=userMatch(g-s[o],home,riv.includes(o)||hajra);
    gd[0]+=x-y;gd[o]+=y-x;if(x>y)pts[0]+=3;else if(x<y)pts[o]+=3;else{pts[0]++;pts[o]++;}}
  const ord=[...Array(n).keys()].sort((p,q)=>pts[q]-pts[p]||gd[q]-gd[p]);const pos=ord.indexOf(0)+1;
  let fel=pos===1,le=pos===16;
  if(pos===2||pos===3)fel=ketMeccs(g-(STEP-1.2*SPREAD));       // a fentebbi liga 14–15. helyezettje ellen
  if(pos===14||pos===15)le=!ketMeccs(g-(-STEP+1.2*SPREAD));    // a lentebbi liga 2–3. helyezettje ellen
  return {pos,pts:pts[0],fel,le};}
const R=+process.env.R||3000;
console.log(`rés | átl.hely | pont | bajnok% | FELJUT% (osztályozóval) | KIESIK% (osztályozóval)   [spread ${SPREAD}, lépcső ${STEP}, δ ${DELTA}]`);
for(const g of (process.env.GS||"-6,-4,-3,-2,-1,0,1,2,3,4,5,6,8").split(",").map(Number)){
  let ps=0,pt=0,ch=0,up=0,dn=0;for(let k=0;k<R;k++){const r=idény(g);ps+=r.pos;pt+=r.pts;if(r.pos===1)ch++;if(r.fel)up++;if(r.le)dn++;}
  console.log(`${String(g).padStart(3)} | ${(ps/R).toFixed(1).padStart(5)} | ${(pt/R).toFixed(0).padStart(3)} | ${(100*ch/R).toFixed(0).padStart(4)} | ${(100*up/R).toFixed(0).padStart(4)} | ${(100*dn/R).toFixed(0).padStart(4)}`);}
