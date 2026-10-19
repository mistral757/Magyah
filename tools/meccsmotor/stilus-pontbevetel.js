/* 🎚 A STÍLUS-GAZDASÁG PONTBEVÉTELE VALÓDI MECCSEKEN (3.9.257, mérés)

   KIMONDOTT KÉRÉS: „A csapatstílusok saját belső pontrendszere, amit idővel
   meccserővé lehet alakítani, túlságosan le lett lassítva."

   A szoras-erkezes.js valódi playMatch-lánca, egy kiválasztott stílussal:
   meccsenként rögzíti a jóváírt pontot (engMatchEnd / fearMatchEnd), a nyers
   tételt és a meccsenkénti plafont. Ebből jön, hány meccs/idény kell egy
   Villámcsapás-, Rettegés-, … szinthez.

   HASZNÁLAT (párhuzamosan, más PORT-tal):
     STY=villam LVL=10 N=40 DS=1.5 PORT=9301 node tools/meccsmotor/stilus-pontbevetel.js
   STY: villam · bombazok · beton · harmonia · tikitaka · gegen · panzer · sztar
   Eredmény (3.9.257, 1. idény, draft keret, +1,5-ös fölény): Villám 3,8 · Bombázók 1,0 ·
   Beton 5,9 · Harmónia 7,8 · Tiki-taka 5,5 · Gegenpressing 2,7 · Panzer 1,7–2,4 ·
   Sztár 3,3 pont/meccs. */
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

  const STY=process.env.STY||"villam",LVL=+process.env.LVL||10;
  const info=await p.evaluate(({STY,LVL})=>{
    S.style={key:STY,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    if(STY==="sztar"){let bp=null,bo=-1;slots.forEach(sl=>{if(!sl||!sl.player||sl.pos==="KP")return;const o=pOvr(sl.player)||0;if(o>bo){bo=o;bp=sl.player.n;}});S.style.star=bp;}
    if(STY==="panzer")S.style.fear={pts:0,earned:0,spent:0,retteges:0,mods:0};
    S.style2=null;
    window.styleLevel=()=>LVL;
    window.__inc=[];
    const _e=engMatchEnd;engMatchEnd=function(){const L=engKeys().map(k=>({k,lv:engLevel(k),cap:engMatchCap(k),raw:Math.round((engAcc(k).raw+engAcc(k).gap)*10)/10}));const r=_e.apply(this,arguments);if(STY!=="panzer")window.__inc.push({r,L});return r;};
    const _f=fearMatchEnd;fearMatchEnd=function(){const lv=fearLevel(),cap=fearMatchCap();const r=_f.apply(this,arguments);if(STY==="panzer")window.__inc.push({r,L:[{k:"panzer",lv,cap}]});return r;};
    return {keys:engKeys(),eng:STY==="panzer"?fearLevel():engLevel(STY),parts:STY==="panzer"?null:engBaseParts(STY).map(p=>[p.id,p.v])};},{STY,LVL});
  console.log("style",JSON.stringify(info));
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
  const rec=await p.evaluate(()=>window.__rec);const inc=await p.evaluate(()=>window.__inc);{const n=inc.length,s=inc.reduce((a,x)=>a+(x.r||0),0),raw=inc.reduce((a,x)=>a+((x.L[0]||{}).raw||0),0);console.log("INC",process.env.STY,"n",n,"átlag/meccs",(s/n).toFixed(2),"nyers/meccs",(raw/n).toFixed(2),"plafon",JSON.stringify(inc[0]&&inc[0].L));}
  require("fs").writeFileSync(process.env.OUT||"/dev/null",JSON.stringify(rec));
  const by={};rec.forEach(r=>{(by[r.t]=by[r.t]||[]).push(r);});
  for(const t of Object.keys(by).sort((a,b)=>a-b)){const a=by[t];const w=a.filter(r=>r.gf>r.ga).length,d=a.filter(r=>r.gf===r.ga).length,l=a.length-w-d;
    console.log(`diff ${t}: n=${a.length}  Gy ${(100*w/a.length).toFixed(1)}%  D ${(100*d/a.length).toFixed(1)}%  V ${(100*l/a.length).toFixed(1)}%  gól/m ${(a.reduce((s,r)=>s+r.gf+r.ga,0)/a.length).toFixed(2)}  H ${a.filter(r=>r.v>0).length} A ${a.filter(r=>r.v<0).length} big ${a.filter(r=>r.big).length}`);}
  {const s=k=>rec.reduce((a,r)=>a+(r[k]||0),0);console.log("gf/Σlf",(s("gf")/s("lf")).toFixed(3),"ga/Σla",(s("ga")/s("la")).toFixed(3));}
  console.log("idő",Math.round((Date.now()-t0)/1000),"s; hibák",errs.slice(0,3));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
