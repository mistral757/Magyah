/* ⚽ A MECCSMOTOR SZÓRÁSA — ÉRKEZŐKKEL ÉS NÉLKÜLÜK (3.9.255, elemzés)

   A szoras-valos.js változata egy bejelentett zuhanás kivizsgálásához: „8
   fordulóig 6-2-0, utána kapunk egy nagyon erős balvédőt, és a következő 6
   meccsből 5 vereség 1 döntetlen — úgy, hogy a meccserőm stabilan minden
   meccsen több volt, mint az ellenfélé."

   Ugyanaz a valódi playMatch-lánc és ugyanaz a különbség-rögzítés, mint a
   szoras-valos.js-ben, két kiegészítéssel:
     · ARRIVE=1 — a sorozat előtt egy 94-es balvédő (Védekezés 96, Sebesség 99)
       kerül a BV helyére, három másik érkező a tartalékba, mind a valódi
       markArrived úton;
     · a kezdőrúgáskor rögzíti a két gólvárhatóságot (lf, la), és a végén
       kiírja a tényleges gól / várt gól arányt mindkét oldalra.

   HASZNÁLAT (párhuzamosan, más PORT-tal):
     ARRIVE=0 N=400 DS=1.5 PORT=9281 node tools/meccsmotor/szoras-erkezes.js
     ARRIVE=1 N=400 DS=1.5 PORT=9282 node tools/meccsmotor/szoras-erkezes.js
   Eredmény (3.9.254): érkező nélkül Gy 58,5% / D 23,5% / V 18,0%,
   érkezővel Gy 65,8% / D 19,5% / V 14,8% — az érkezés nem ront. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9271;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi egyjátékos karrier, az 1. idény ELEJÉN ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  const alap=await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    return {idx:S.idx};});

  if(process.env.ARRIVE==="1"){const info=await p.evaluate(()=>{
    const mk=(n,pos,ovr,attrs)=>{const pl={n,ovr,pos:[pos],age:25};careerPool[n]={n,pos:[pos],age:25,startRating:ovr,peak:ovr+2,pot:5000,attrs:Object.assign({},attrs)};return pl;};
    const fac=mk("Teszt Facchetti","BV",94,{ved:96,kapus:55,passz:87,gol:78,seb:99});
    const sl=slots.find(s=>s.pos==="BV")||slots[1];const old=sl.player;sl.player=fac;sl.fit=fitFor(fac,sl);
    try{markArrived(fac,0,false);}catch(e){}
    const others=[mk("Teszt Albi","BSZ",74,{ved:57,kapus:43,passz:70,gol:71,seb:69}),mk("Teszt Carew","CS",73,{ved:53,kapus:42,passz:66,gol:75,seb:82}),mk("Teszt Liviu","KV",77,{ved:79,kapus:43,passz:67,gol:56,seb:66})];
    others.forEach(o=>{try{(S.reserves=S.reserves||[]).push(o);}catch(e){}try{markArrived(o,0,false);}catch(e){}});
    if(old)try{(S.reserves=S.reserves||[]).push(old);}catch(e){}
    try{refreshAll&&refreshAll();}catch(e){}
    return {slot:sl.pos,bondNew:Object.keys(S.bondNew||{}),ms:(()=>{try{return buildMatchSnapshot().ovr;}catch(e){return String(e);}})()};});
   console.log("arrive",JSON.stringify(info));}
  await p.clock.install();
  const N=+process.env.N||200, DIFFS=(process.env.DS||"0,2,3,5").split(",").map(Number), FIXS=(process.env.FIXS||"5,6").split(",").map(Number);
  const setup=await p.evaluate(({N,DIFFS,FIXS,process_MODE})=>{
    window.__plan=[];for(let i=0;i<N;i++)window.__plan.push(DIFFS[i%DIFFS.length]);
    window.__rec=[];window.__cur=null;window.__i=0;
    const _ml=matchLambdas;
    matchLambdas=function(mine,oppOvr,venue){
      if(!window.__cur){const t=window.__plan[window.__i];
        window.__cur={t,delta:(mine.ovr+mine.tacticEffect-t)-oppOvr,venue,
          big:(()=>{try{return isBigMatchFixture(S.fixtures[S.idx]);}catch(e){return null;}})(),morale:S.morale};}
      const L=_ml(mine,oppOvr+window.__cur.delta,venue);if(window.__cur.lf==null){window.__cur.lf=L.lf;window.__cur.la=L.la;}return L;};
    const _pm=playMatchMotor;
    window.__fin=function(){
      if(window.__cur&&S.fixtureResults.length>window.__len){
        const r=S.fixtureResults[S.fixtureResults.length-1],c=window.__cur;
        window.__rec.push({lf:c.lf,la:c.la,t:c.t,v:c.venue,big:c.big,gf:r.gf,ga:r.ga,m:c.morale,fix:c.fix});
        window.__i++;}
      window.__cur=null;};
    playMatchMotor=function(){
      window.__fin();
      try{const L=lines();if(L&&L.children.length>400)L.innerHTML="";}catch(e){}
      const F=window.__FIXS[Math.floor(window.__i/window.__ND)%window.__FIXS.length];
      S.idx=F;S.fixtureResults.length=Math.min(S.fixtureResults.length,F);
      window.__len=S.fixtureResults.length;
      const out=_pm.apply(this,arguments);
      if(window.__cur)window.__cur.fix=F;
      return out;};
    const big=process_MODE==="big";
    const cand=S.fixtures.map((f,i)=>({i,h:!!f.home,b:isBigMatchFixture(f)})).filter(x=>x.i<20&&x.b===big);
    const h=cand.find(x=>x.h),a=cand.find(x=>!x.h);
    window.__FIXS=[h&&h.i,a&&a.i].filter(x=>x!=null);window.__ND=DIFFS.length;FIXS=window.__FIXS;
    S.auto=true;
    return {fixs:FIXS.map(i=>({i,o:S.fixtures[i].o.n,home:S.fixtures[i].home,big:isBigMatchFixture(S.fixtures[i])})),rivals:seasonRivals()};},{N,DIFFS,FIXS,process_MODE:process.env.MODE||"normal"});
  console.log("setup",JSON.stringify(setup));
  const t0=Date.now();
  await p.evaluate(()=>playMatch());
  let last=-1,stall=0;
  while(true){
    await p.clock.runFor(4000);
    const st=await p.evaluate(()=>({n:window.__rec.length,idx:S.idx,playing:S.playing,auto:S.auto}));
    if(st.n>=N)break;
    if(st.n===last&&stall>=2&&!st.playing){
      await p.evaluate(()=>{document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));
        try{if(S.utoMeccs){S.utoMeccs=null;}}catch(e){}
        _utoTartas=false;S.auto=true;S.playing=false;try{playMatch();}catch(e){window.__perr=String(e);}});}
    if(st.n===last){stall++;if(stall>25){console.log("ELAKADT",JSON.stringify(st));
      const dbg=await p.evaluate(()=>({modals:[...document.querySelectorAll(".modal:not(.hide),[id$=Modal]:not(.hide)")].map(x=>x.id).slice(0,8),utom:!!S.utoMeccs}));console.log(JSON.stringify(dbg));break;}}
    else{stall=0;last=st.n;}
  }
  const rec=await p.evaluate(()=>window.__rec);
  require("fs").writeFileSync(process.env.OUT||"/dev/null",JSON.stringify(rec));
  const by={};rec.forEach(r=>{(by[r.t]=by[r.t]||[]).push(r);});
  for(const t of Object.keys(by).sort((a,b)=>a-b)){const a=by[t];const w=a.filter(r=>r.gf>r.ga).length,d=a.filter(r=>r.gf===r.ga).length,l=a.length-w-d;
    console.log(`diff ${t}: n=${a.length}  Gy ${(100*w/a.length).toFixed(1)}%  D ${(100*d/a.length).toFixed(1)}%  V ${(100*l/a.length).toFixed(1)}%  gól/m ${(a.reduce((s,r)=>s+r.gf+r.ga,0)/a.length).toFixed(2)}  H ${a.filter(r=>r.v>0).length} A ${a.filter(r=>r.v<0).length} big ${a.filter(r=>r.big).length}`);}
  {const s=k=>rec.reduce((a,r)=>a+(r[k]||0),0);console.log("gf/Σlf",(s("gf")/s("lf")).toFixed(3),"ga/Σla",(s("ga")/s("la")).toFixed(3));}
  console.log("idő",Math.round((Date.now()-t0)/1000),"s; hibák",errs.slice(0,3));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
