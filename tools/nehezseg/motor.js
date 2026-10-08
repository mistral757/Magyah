/* ⚙️ A MECCSMOTOR MODELLJE (3.9.220) — a nehézségi mérők közös magja.
   A valódi motor magjának hű másolata (lásd tools/meccsmotor/szoras-modell.js), a
   3.9.220-as változatokkal (A: zaj az erőhöz kötve, B: rangadó ⅓, D: rákapcsolás,
   K 0,12), és a VALÓDI motorhoz kalibrálva: a te meccseid különbségéhez +0,75 jön
   (2110 valódi meccs, tools/meccsmotor/szoras-valos.js — a legkisebb négyzetes
   eltérés ennél volt, átlagosan ~1,6 százalékpont). */
"use strict";
function pois(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=Math.random()}while(p>L);return k-1}
const MOODS=[[32,.74,1],[18,.58,.62],[20,.48,1.42],[30,.64,1.14]];
function mood(){let r=Math.random()*100;for(const m of MOODS){r-=m[0];if(r<=0)return m;}return MOODS[0];}
function match(d,o){
  const K=o.K||0.09,lam=x=>Math.max(.15,Math.min(4.5,1.3*Math.exp(K*x)));
  const M=o.rival?mood():null, conv=M?M[1]*(o.convMul??1):0;
  let diff=d,gf=0,ga=0,maxLead=0,sevN=0;
  const L=()=>{let lf=lam(diff),la=lam(-diff);if(M){const m=Math.sqrt(lf*la);lf=Math.max(.15,Math.min(4.5,(lf*(1-conv)+m*conv)*M[2]));la=Math.max(.15,Math.min(4.5,(la*(1-conv)+m*conv)*M[2]));}return [lf,la];};
  let [lf,la]=L();
  const share=()=>o.A?lf/(lf+la):0.5;
  for(let b=1;b<=18;b++){
    const min=b*5;
    if(min===90){const close=Math.abs(gf-ga)<=1;let p=(0.14+(close?0.10:0))*(M?1.8:1);
      for(let i=0;i<3;i++){if(Math.random()>=p)break;if(Math.random()<share())gf++;else ga++;p*=.35;}}
    let mf=1,ma=1;
    if(o.D&&min>60){const fav=diff>0?1:(diff<0?-1:0);const g=(gf-ga)*fav;
      if(fav&&g<=0){const k=1+o.D*Math.min(1,Math.abs(diff)/5);if(fav>0){mf=k;ma=1/k;}else{ma=k;mf=1/k;}}}
    gf+=pois(lf*mf/18);ga+=pois(la*ma/18);
    if(sevN<(M?2:1)&&Math.random()<(M?.26:.10)/18){sevN++;
      const w=[22,18,10,8,17,25,24],t=w.reduce((a,b)=>a+b);let r=Math.random()*t,i=0;for(;i<7;i++){r-=w[i];if(r<=0)break;}
      if(o.A&&i<=3){i=(Math.random()<share())?(i<2?0:2):(i<2?1:3);}
      if(i===0&&Math.random()<.78)gf++;else if(i===1&&Math.random()<.78)ga++;else if(i===2)gf++;else if(i===3)ga++;
      else if(i===6&&Math.random()<.35)gf++;}
    if(Math.random()<0.06*(M?1.6:1)/18){diff-=2.5;[lf,la]=L();}
    if(o.A&&Math.random()<0.06*(M?1.6:1)/18){diff+=2.5;[lf,la]=L();}
    maxLead=Math.max(maxLead,gf-ga);}
  return {gf,ga,cb:maxLead>=1&&gf<ga};}
function stat(d,o,N=150000){let w=0,dr=0,l=0,cb=0;for(let i=0;i<N;i++){const r=match(d,o);if(r.gf>r.ga)w++;else if(r.gf===r.ga)dr++;else l++;if(r.cb)cb++;}
  return {W:100*w/N,D:100*dr/N,L:100*l/N,pts:(3*w+dr)/N,cb:100*cb/N};}

var NEW={K:0.12,A:1,convMul:1/3,D:0.25},DELTA=+process.env.DELTA||0.75,SPREAD=+process.env.SPREAD||2.0,STEP=+process.env.STEP||3.0;
const lam=x=>Math.max(.15,Math.min(4.5,1.3*Math.exp(0.12*x)));
function norm(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function userMatch(d,home,rival){const r=match(d+DELTA+(home?0.9:-0.3),Object.assign({rival},NEW));return [r.gf,r.ga];}
function ketMeccs(d){ // osztályozó: oda-vissza, döntetlen összesítésnél 50-50
  const a=userMatch(d,true,true),b=userMatch(d,false,true);const gf=a[0]+b[0],ga=a[1]+b[1];
  return gf>ga||(gf===ga&&Math.random()<0.5);}
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

module.exports={match,pois,userMatch,ketMeccs,norm,lam,NEW,DELTA,SPREAD,STEP};
