/* 🛡️ A STÍLUS-MÉRFÖLDKÖVEK ÜTEME VALÓDI MECCSEKEN (3.9.295, mérés)

   KÉRÉS: „A panzer csapatstílus sokkal nehezebben kap csapatstílus
   mérföldköveket és rettenet pontot, mint a többi."

   Egy valódi egyjátékos karrier (draft keret, pad, tartalék), a választott
   stílussal, N végigjátszott meccs. A végén: a stílus saját táblájából
   mennyi pont TELJESÜLNE (a lépcsők mai állása), hány család mozdult, és a
   rettenet / stílus-pont bevétele.

   HASZNÁLAT: STY=panzer N=28 LVL=5 PORT=9501 node tools/meccsmotor/stilus-merfoldko-utem.js */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9295;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    /* a cserepad és a tartalék feltöltése a pool-ból */
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const tobbi=Object.values(careerPool).filter(e=>e&&!kezdo.has(e.n)&&e.pos&&e.pos.length).slice(0,9);
    BENCH_KEYS.forEach((k,i)=>{const e=tobbi[i];if(!e)return;if(!e.attrs)initPlayerAttrs(e);e.age=21;
      BENCH[k]={n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:21};});
    tobbi.slice(BENCH_KEYS.length).forEach(e=>{if(!e.attrs)initPlayerAttrs(e);extraRoster.push({n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:e.age||24});});});
  await p.waitForTimeout(800);



  const STY=process.env.STY||"panzer",N=+process.env.N||28,LVL=+process.env.LVL||5;
  await p.evaluate(({STY,LVL})=>{
    S.style={key:STY,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    if(STY==="sztar"){let bp=null,bo=-1;slots.forEach(sl=>{if(!sl||!sl.player||sl.pos==="KP")return;const o=pOvr(sl.player)||0;if(o>bo){bo=o;bp=sl.player.n;}});S.style.star=bp;}
    if(STY==="panzer")S.style.fear={pts:0,earned:0,spent:0,retteges:0,mods:0};
    S.style2=null;window.styleLevel=()=>LVL;try{styleLvlCacheClear();}catch(e){}},{STY,LVL});
  const t0=Date.now();
  const r=await p.evaluate(async({N})=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const i0=S.idx;S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<60000&&S.idx<i0+N&&S.idx<29;i++){await varj(20);
      document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));}
    S.auto=false;await varj(1500);
    const meres=k=>{
      const L=STYLE_MILESTONES[k]||[];let pont=0,db=0,csal=new Set(),ossz=0;
      L.forEach(d=>{ossz+=d.val||0;let v=0;try{v=d.p()||0;}catch(e){v=0;}
        const ok=d.inv?(v<=d.n&&v>0):(v>=d.n);
        if(ok){pont+=d.val||0;db++;csal.add(d.fam||d.id);}});
      return {pont,db,csal:csal.size,ossz,sor:L.length};};
    const o={meccs:S.idx-i0,sajat:meres(S.style.key)};
    try{o.rettenet=S.style.fear?Math.round((S.style.fear.earned||0)*10)/10:null;}catch(e){}
    try{const k=S.style.key;if(typeof engState==="function"&&engDef(k))o.eng=Math.round(((engState(k)||{}).earned||(engState(k)||{}).pts||0)*10)/10;}catch(e){}
    /* a teljesült családok listája (mi hozta a pontot) */
    const L=STYLE_MILESTONES[S.style.key]||[];const fam={};
    L.forEach(d=>{let v=0;try{v=d.p()||0;}catch(e){}const ok=d.inv?(v<=d.n&&v>0):(v>=d.n);if(ok){const f=d.fam||d.id;fam[f]=(fam[f]||0)+(d.val||0);}});
    o.mi=fam;
    return o;},{N});
  console.log("UTEM",STY,JSON.stringify(r),"idő",Math.round((Date.now()-t0)/1000)+"s","hibák",errs.length);
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
