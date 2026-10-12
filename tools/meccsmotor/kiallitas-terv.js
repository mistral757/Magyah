/* 🟥 A KIÁLLÍTÁS-TERV MÉRÉSE — A VALÓDI MOTORON (3.9.224)

   A FEJLESZTŐ JAVASLATA (KIALL_TERV_JAVASLAT): a kiállítás ára 2,5 → 3,0
   meccserő; a tízfős oldal ellen a kiállítás utáni 30. perctől +15%, a 85.
   perctől +25% gólvárhatóság; kiállítás után a különleges esemény ×2; minden
   lap esélye −10%.
   HASZNÁLAT:
     TERV=0|1 MODE=termeszetes N=600           node tools/meccsmotor/kiallitas-terv.js
     TERV=0|1 MODE=piros RED=30 DS=0,3,5 N=600 node tools/meccsmotor/kiallitas-terv.js
   A „termeszetes" mód 0-s különbséggel játszik, kényszer nélkül: lapok,
   kiállítások, eredmény. A „piros" mód a RED. percben kiállítja a saját
   csapat egy emberét (az ellenfél ilyenkor nem kap pirosat), a kért
   különbséggel; a meccsek fele hazai, fele idegen. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9291;
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

  await p.clock.install();
  const N=+process.env.N||300, MODE=process.env.MODE||"termeszetes", TERV=process.env.TERV==="1", RED=+process.env.RED||30;
  const DIFFS=MODE==="piros"?(process.env.DS||"0,3,5").split(",").map(Number):[0];
  const setup=await p.evaluate(({N,DIFFS,TERV,MODE,RED})=>{
    KIALL_TERV=TERV?Object.assign({},KIALL_TERV_JAVASLAT):null;
    window.__plan=[];for(let i=0;i<N;i++)window.__plan.push(DIFFS[i%DIFFS.length]);
    window.__rec=[];window.__cur=null;window.__i=0;
    const _ml=matchLambdas;
    matchLambdas=function(mine,oppOvr,venue){
      if(!window.__cur){const t=window.__plan[window.__i];
        window.__cur={t,delta:(mine.ovr+mine.tacticEffect-t)-oppOvr,venue,yus:0,rus:0,rthem:0};}
      return _ml(mine,oppOvr+window.__cur.delta,venue);};
    const _sb=sbEv;
    let _utolsoSor="";
    const _al=addLine;
    addLine=function(t){_utolsoSor=String(t||"");return _al.apply(this,arguments);};
    sbEv=function(side,kind){
      const c=window.__cur;
      if(c){if(side==="us"&&kind==="yellow")c.yus++;
        if(side==="us"&&kind==="red"){c.rus++;
          const f=/MÁSODIK SÁRGA/.test(_utolsoSor)?"2sarga":/mez|MEZ/.test(_utolsoSor)?"mez":/verek|VEREK|dulak|DULAK/.test(_utolsoSor)?"verekedes":"kozvetlen";
          (c.rf=c.rf||[]).push(f);}
        if(side==="them"&&kind==="red")c.rthem++;}
      return _sb.apply(this,arguments);};
    const _pm=playMatchMotor;
    window.__fin=function(){
      if(window.__cur&&S.fixtureResults.length>window.__len){
        const r=S.fixtureResults[S.fixtureResults.length-1],c=window.__cur;
        const log=(typeof clutchLog!=="undefined"?clutchLog:[]).map(x=>({s:x.side,m:x.min}));
        window.__rec.push({t:c.t,v:c.venue,gf:r.gf,ga:r.ga,yus:c.yus,rus:c.rus,rthem:c.rthem,rf:c.rf||[],log});
        window.__i++;}
      window.__cur=null;};
    playMatchMotor=function(){
      window.__fin();
      try{const L=lines();if(L&&L.children.length>400)L.innerHTML="";}catch(e){}
      S.morale=60;S.teamFormMalus=0;S.unavailable={};S.subs={};
      const F=window.__FIXS[Math.floor(window.__i/window.__ND)%window.__FIXS.length];
      S.idx=F;S.fixtureResults.length=Math.min(S.fixtureResults.length,F);
      window.__len=S.fixtureResults.length;
      MERES_PIROS=MODE==="piros"?{min:RED,nincsEll:true}:null;
      return _pm.apply(this,arguments);};
    const cand=S.fixtures.map((f,i)=>({i,h:!!f.home,b:isBigMatchFixture(f)})).filter(x=>x.i<20&&!x.b);
    const h=cand.find(x=>x.h),a=cand.find(x=>!x.h);
    window.__FIXS=[h&&h.i,a&&a.i].filter(x=>x!=null);window.__ND=DIFFS.length;
    S.auto=true;
    return {fixs:window.__FIXS,terv:KIALL_TERV};},{N,DIFFS,TERV,MODE,RED});
  console.log("setup",JSON.stringify(setup));
  const t0=Date.now();
  await p.evaluate(()=>playMatch());
  let last=-1,stall=0;
  while(true){
    await p.clock.runFor(4000);
    const st=await p.evaluate(()=>({n:window.__rec.length,playing:S.playing}));
    if(st.n>=N)break;
    if(st.n===last&&stall>=2&&!st.playing){
      await p.evaluate(()=>{document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));
        try{if(S.utoMeccs){S.utoMeccs=null;}}catch(e){}
        _utoTartas=false;S.auto=true;S.playing=false;try{playMatch();}catch(e){}});}
    if(st.n===last){stall++;if(stall>25){console.log("ELAKADT",JSON.stringify(st));break;}}
    else{stall=0;last=st.n;}}
  const rec=await p.evaluate(()=>window.__rec);
  require("fs").writeFileSync(process.env.OUT||"/dev/null",JSON.stringify(rec));
  const pc=(a,f)=>(100*a.filter(f).length/Math.max(1,a.length)).toFixed(1);
  const avg=(a,f)=>(a.reduce((s,r)=>s+f(r),0)/Math.max(1,a.length)).toFixed(2);
  console.log(`TERV=${TERV?"be":"ki"} MODE=${MODE}${MODE==="piros"?" RED="+RED:""}`);
  for(const t of [...new Set(rec.map(r=>r.t))].sort((a,b)=>a-b)){
    const a=rec.filter(r=>r.t===t);
    const utana=r=>r.log.filter(x=>x.s==="them"&&x.m>RED).length, utanaMi=r=>r.log.filter(x=>x.s==="us"&&x.m>RED).length;
    const vege=r=>r.log.filter(x=>x.s==="them"&&x.m>85).length;
    console.log(`⚡ ${t>=0?"+":""}${t}: n=${a.length}  Gy ${pc(a,r=>r.gf>r.ga)}%  D ${pc(a,r=>r.gf===r.ga)}%  V ${pc(a,r=>r.gf<r.ga)}%`
      +`  lőtt ${avg(a,r=>r.gf)} kapott ${avg(a,r=>r.ga)}`
      +(MODE==="piros"?`  · a ${RED}. perc után: lőtt ${avg(a,utanaMi)} kapott ${avg(a,utana)} (ebből 85' után ${avg(a,vege)})`
        :`  · sárga/meccs ${avg(a,r=>r.yus)}  saját piros ${pc(a,r=>r.rus>0)}%  ellenfél piros ${pc(a,r=>r.rthem>0)}%`
          +`  · saját piros forrása / 100 meccs: ${["kozvetlen","2sarga","verekedes","mez"].map(k=>k+" "+(100*a.reduce((s2,r)=>s2+r.rf.filter(x=>x===k).length,0)/a.length).toFixed(1)).join(", ")}`));}
  console.log("idő",Math.round((Date.now()-t0)/1000),"s; hibák",errs.slice(0,3));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
