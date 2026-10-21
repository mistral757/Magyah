/* ⏱️ 3.9.266 — AZ ÚJ TEMPÓ-SKÁLA (F0) — élő mérés.
   Amit néz:
     1. friss telepítés: 0,25× az alap, ez 2640 ms / 5 perc (a régi 0,125×),
     2. a két csúszka 0,1–3 között áll, és szinkronban marad,
     3. a régi kulcs (v1) átszámolódik ×2-vel: a TEMPÓ betűre a régi
        (0,25 → 0,5 → 1320 ms; 1,5 → 3 → 220 ms; 0,1 → 0,2 → 3300 ms),
     4. az átszámolt érték az új kulcsba kerül, és a v2 nyer, ha mindkettő él,
     5. a végek: 3× = 220 ms (a régi max), 0,1× = 6600 ms,
     6. a párharc fix ütemét nem érinti, oldalhiba nincs.
   Használat: node tools/tempo-skala-3-9-266-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8961'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};

  async function lap(t){
    const p=await b.newPage({viewport:{width:390,height:900}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(t=>{
      try{localStorage.clear();}catch(e){}
      for(const k in t)try{localStorage.setItem(k,String(t[k]));}catch(e){}
    },t||{});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2000);
    return p;}

  {const p=await lap(null);
   out.friss=await p.evaluate(()=>{
     const r=document.getElementById("matchSpeedRange"),e=document.getElementById("euroSpeedRange");
     const o={v:matchSpeed,alap:MATCH_SPEED_DEFAULT,tick:matchSpeedTickMs(),
       felirat:document.getElementById("matchSpeedVal").textContent,
       min:[r.min,e.min],max:[r.max,e.max],h2h:H2H_TICK_MS,
       vege:[matchSpeedTickMs(3),matchSpeedTickMs(0.1),matchSpeedTickMs(1)]};
     setMatchSpeed(2.4);
     o.szinkron=[parseFloat(r.value),parseFloat(e.value),document.getElementById("euroSpeedVal").textContent];
     setMatchSpeed(9);o.tetoVag=matchSpeed;
     setMatchSpeed(0.01);o.aljaVag=matchSpeed;
     o.mentve=localStorage.getItem("harminc_nulla_matchspeed_v2");
     return o;});
   await p.close();}
  out.atszamol=[];
  for(const r of [0.25,1.5,0.1,1]){
    const p=await lap({harminc_nulla_matchspeed_v1:r});
    out.atszamol.push(Object.assign({regi:r},await p.evaluate(()=>({v:matchSpeed,tick:matchSpeedTickMs(),
      v2:localStorage.getItem("harminc_nulla_matchspeed_v2")}))));
    await p.close();}
  {const p=await lap({harminc_nulla_matchspeed_v1:1.5,harminc_nulla_matchspeed_v2:0.4});
   out.v2nyer=await p.evaluate(()=>matchSpeed);
   await p.close();}

  const A=[],ok=(n,f)=>A.push({n,ok:!!f});
  const F=out.friss;
  ok("friss: alap 0,25×, 2640 ms, felirat „0.25×”",F.v===0.25&&F.alap===0.25&&F.tick===2640&&F.felirat==="0.25×");
  ok("csúszkák 0,1–3",F.min.join()==="0.1,0.1"&&F.max.join()==="3,3");
  ok("végek: 3× = 220 ms, 0,1× = 6600 ms, 1× = 660 ms",F.vege.join()==="220,6600,660");
  ok("a két csúszka szinkronban",F.szinkron[0]===2.4&&F.szinkron[1]===2.4&&F.szinkron[2]==="2.4×");
  ok("vágás 3-nál és 0,1-nél",F.tetoVag===3&&F.aljaVag===0.1);
  ok("a beállítás az új kulcsba ment",F.mentve==="0.1");
  const varT={0.25:[0.5,1320],1.5:[3,220],0.1:[0.2,3300],1:[2,330]};
  ok("régi érték ×2, a tempó betűre a régi",out.atszamol.every(x=>x.v===varT[x.regi][0]&&x.tick===varT[x.regi][1]&&x.v2===String(varT[x.regi][0])));
  ok("ha a v2 él, az nyer",out.v2nyer===0.4);
  ok("a párharc fix ütemét nem érinti (3300 ms)",F.h2h===3300);
  ok("nincs oldalhiba",hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  if(hiba.length)console.log("HIBÁK:",hiba.slice(0,5));
  A.forEach(a=>console.log((a.ok?"✔":"✘")+" "+a.n));
  const bukott=A.filter(a=>!a.ok).length;
  console.log(bukott?`\n${bukott} BUKOTT`:"\nMIND RENDBEN");
  await b.close();srv.kill();process.exit(bukott?1:0);
})();
