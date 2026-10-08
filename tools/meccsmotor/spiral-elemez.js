/* 🌀 A spirál-mérés kiértékelése: node tools/meccsmotor/spiral-elemez.js  (a mappában: spiral/*.jsonl — a spiral-valos.js kimenetei, soronként egy idény) */
const fs=require("fs");
const runs=[];for(const f of fs.readdirSync("spiral").filter(f=>f.endsWith(".jsonl")))for(const l of fs.readFileSync("spiral/"+f,"utf8").split("\n")){if(!l.trim())continue;try{const o=JSON.parse(l);if(o.rec&&o.rec.length>=25)runs.push(o);}catch(e){}}
const pt=r=>r.gf>r.ga?3:r.gf===r.ga?1:0;
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN, sd=a=>{const m=avg(a);return Math.sqrt(avg(a.map(x=>(x-m)**2)));};
console.log("futás:",runs.length);
for(const G of [-3,0,3]){
  const R=runs.filter(r=>r.G===G);if(!R.length)continue;
  const drift=R.map(r=>r.rec[r.rec.length-1].ms-r.rec[0].ms), pts=R.map(r=>r.rec.reduce((s,x)=>s+pt(x),0));
  const mor0=avg(R.map(r=>r.rec[0].mor)),mor1=avg(R.map(r=>r.rec[r.rec.length-1].mor));
  const fo1=avg(R.map(r=>r.rec[r.rec.length-1].forma));
  console.log(`\nRÉS ${G>0?"+":""}${G}: ${R.length} idény · pont ${avg(pts).toFixed(1)} (szórás ${sd(pts).toFixed(1)}, min ${Math.min(...pts)}, max ${Math.max(...pts)})`);
  console.log(`  meccserő-sodródás az idény alatt: átlag ${avg(drift).toFixed(2)} · szórás ${sd(drift).toFixed(2)} · min ${Math.min(...drift).toFixed(1)} · max ${Math.max(...drift).toFixed(1)}`);
  console.log(`  morál ${mor0.toFixed(0)} → ${mor1.toFixed(0)} · tartós forma a végén ${fo1>=0?"+":""}${fo1.toFixed(2)} meccserő`);
  /* a spirál: az első 15 meccs pontja és a 15→30 sodródás összefüggése */
  const xs=R.map(r=>r.rec.slice(0,15).reduce((s,x)=>s+pt(x),0)), ys=R.map(r=>r.rec[r.rec.length-1].ms-r.rec[14].ms);
  const mx=avg(xs),my=avg(ys);const cov=avg(xs.map((x,i)=>(x-mx)*(ys[i]-my)));const b=cov/avg(xs.map(x=>(x-mx)**2));
  const kor=cov/(sd(xs)*sd(ys));
  console.log(`  spirál: az első félidény +1 pontja → a második félidőben ${b>=0?"+":""}${b.toFixed(3)} meccserő (korreláció ${kor.toFixed(2)})`);}
/* összesítve: a meccserő 5 meccses változása az előző 5 meccs pontjai szerint */
const X=[],Y=[];
runs.forEach(r=>{for(let i=5;i+5<r.rec.length;i+=5){X.push(r.rec.slice(i-5,i).reduce((s,x)=>s+pt(x),0));Y.push(r.rec[i+5-1].ms-r.rec[i-1].ms);}});
const mx=avg(X),my=avg(Y);const b=avg(X.map((x,i)=>(x-mx)*(Y[i]-my)))/avg(X.map(x=>(x-mx)**2));
console.log(`\nÖSSZESEN (${X.length} ötmeccses ablak): az előző 5 meccs +1 pontja → a következő 5 meccsen ${b>=0?"+":""}${b.toFixed(3)} meccserő · tengely: 0 pont → ${(my+b*(0-mx)).toFixed(2)}, 15 pont → ${(my+b*(15-mx)).toFixed(2)}`);
const by={};X.forEach((x,i)=>{const k=x<=4?"0–4":x<=8?"5–8":x<=11?"9–11":"12–15";(by[k]=by[k]||[]).push(Y[i]);});
for(const k of ["0–4","5–8","9–11","12–15"])if(by[k])console.log(`  előző 5 meccs ${k} pont: utána ${avg(by[k])>=0?"+":""}${avg(by[k]).toFixed(2)} meccserő (n=${by[k].length})`);
