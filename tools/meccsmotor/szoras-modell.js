#!/usr/bin/env node
/* ⚽ A MECCSMOTOR SZÓRÁSA — MODELL (3.9.219, elemzés)

   A valódi motor magjának hű másolata (index.html):
     · SIM: λ = 1,3·e^(K·d), [0,15; 4,5] sávba vágva; 18 db ötperces Poisson-vödör;
     · 90+ dráma: 14% (+10% legfeljebb egygólos állásnál, rangadón ×1,8),
       további ráadásgól ×0,35, legfeljebb 3; az oldal 50-50 (erőtől független!);
     · különleges esemény: 10%/meccs (rangadón 26%, legfeljebb 2), súlyok
       [11-es nekünk 22, ellenünk 18, öngól nekünk 10, nálunk 8, verekedés 17,
        VAR 25, szabadrúgás 24] — erőtől független;
     · piros lap: CSAK a mi oldalunkon, 6%/meccs (rangadón ×1,6), −2,5 meccserő;
     · rangadó / hajrá-rangadó: a két λ a mértani közepük felé húzódik
       (conv 0,48–0,74), és a szint skálázódik (RIVAL_MOODS).

   VÁLTOZATOK (a hangolási javaslathoz):
     A  — a zaj az erőhöz kötve: a 90+ dráma és a különleges esemény oldala a
          λ-arányból; az ellenfél is kaphat piros lapot (szimmetria);
     B  — a rangadó-közelítés harmadára (convMul=1/3);
     D  — „a jobb csapat rákapcsol": 60' után, ha az esélyes nem vezet, ×1,25-ig;
     K  — a meredekség (alap 0,09).

   HASZNÁLAT:  node tools/meccsmotor/szoras-modell.js        (N=150000/cella)
               VENUE=1 node …   — fele hazai (+1,2), fele idegen (−0,4) */
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

function stat(d,o,N=150000){let w=0,dr=0,l=0,cb=0;for(let i=0;i<N;i++){
    const v=process.env.VENUE?(i%2?1.2:-0.4):0;const r=match(d+v,o);
    if(r.gf>r.ga)w++;else if(r.gf===r.ga)dr++;else l++;if(r.cb)cb++;}
  return {W:100*w/N,D:100*dr/N,L:100*l/N,pts:(3*w+dr)/N,cb:100*cb/N};}
const V=[["MOST",{}],["A",{A:1}],["A+B",{A:1,convMul:1/3}],["A+D",{A:1,D:0.25}],
  ["A+K0.12",{A:1,K:0.12}],["A+B+K0.12",{A:1,convMul:1/3,K:0.12}],["A+B+D+K0.12",{A:1,convMul:1/3,D:0.25,K:0.12}]];
for(const rival of [false,true]){
  console.log(`\n== ${rival?"RANGADÓ / HAJRÁ-RANGADÓ":"NORMÁL MECCS"} — győzelem/döntetlen/vereség % · pont/meccs · fordításos vereség %`);
  for(const [n,o] of V){if(!rival&&o.convMul)continue;
    console.log(n.padEnd(14)+[0,2,3,5,8].map(d=>{const s=stat(d,Object.assign({rival},o));
      return `+${d}: ${s.W.toFixed(0)}/${s.D.toFixed(0)}/${s.L.toFixed(0)} ${s.pts.toFixed(2)} ${s.cb.toFixed(1)}`.padEnd(26);}).join(""));}}
