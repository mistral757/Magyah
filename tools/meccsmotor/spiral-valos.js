/* 🌀 A LEHÚZÓ SPIRÁL MÉRŐJE — A VALÓDI MOTORON (nehézségi terv, 3.9.221)

   Egy valódi 1. idényes karriert végigjátszat (végigjátszás-mód, álóra),
   ÁLLANDÓ ellenfél-erővel: az első kezdőrúgáskor a saját meccserőhöz mérve
   rögzül (saját − G), és onnan nem mozdul. Így ami a meccserődön az idény
   alatt történik, az a TE oldalad mozgása: morál, tartós forma, fejlődés,
   sérülés — vásárlás és boost nélkül.

   Meccsenként rögzíti: a kezdőrúgás meccserejét (MS.ovr + taktika), a morált,
   a tartós forma meccserő-hatását, a különbséget (pályával) és az eredményt.

   HASZNÁLAT:  G=0 N=8 node tools/meccsmotor/spiral-valos.js   (N idény, egymás után)
               OUT=<fájl.json> a nyers sorokhoz; PORT a helyi szerverhez. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9275;
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
  const G=+(process.env.G||0);
  await p.evaluate((G)=>{
    window.__rec=[];window.__cur=null;window.__O=null;
    const _ml=matchLambdas;
    matchLambdas=function(mine,oppOvr,venue){
      if(window.__O==null)window.__O=mine.ovr+mine.tacticEffect-G;
      if(!window.__cur){
        let forma=0;try{forma=pformTeamOvr()||0;}catch(e){}
        window.__cur={ms:+(mine.ovr+mine.tacticEffect).toFixed(2),forma:+forma.toFixed(2),mor:Math.round(S.morale),
          d:+(mine.ovr+mine.tacticEffect-window.__O+venue).toFixed(2),i:S.idx,
          big:(()=>{try{return isBigMatchFixture(S.fixtures[S.idx]);}catch(e){return null;}})()};}
      return _ml(mine,window.__O,venue);};
    const _pm=playMatchMotor;
    playMatchMotor=function(){
      if(window.__cur&&S.fixtureResults.length>window.__len){
        const r=S.fixtureResults[S.fixtureResults.length-1];window.__rec.push(Object.assign({gf:r.gf,ga:r.ga},window.__cur));}
      window.__cur=null;window.__len=S.fixtureResults.length;
      try{const L=lines();if(L&&L.children.length>400)L.innerHTML="";}catch(e){}
      return _pm.apply(this,arguments);};
    window.__len=S.fixtureResults.length;
    S.auto=true;playMatch();},G);
  let last=-1,stall=0;
  while(true){
    await p.clock.runFor(4000);
    const st=await p.evaluate(()=>{
      /* az utolsó meccs a következő kezdőrúgás nélkül is bekerül */
      if(window.__cur&&!S.playing&&S.fixtureResults.length>window.__len){
        const r=S.fixtureResults[S.fixtureResults.length-1];window.__rec.push(Object.assign({gf:r.gf,ga:r.ga},window.__cur));
        window.__cur=null;window.__len=S.fixtureResults.length;}
      return {n:window.__rec.length,playing:S.playing,idx:S.idx};});
    if(st.n>=30)break;
    if(st.n===last&&stall>=2&&!st.playing){
      await p.evaluate(()=>{document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));
        try{if(S.utoMeccs)S.utoMeccs=null;}catch(e){}_utoTartas=false;S.auto=true;S.playing=false;try{playMatch();}catch(e){}});}
    if(st.n===last){stall++;if(stall>30){console.error("ELAKADT",JSON.stringify(st));break;}}else{stall=0;last=st.n;}}
  const rec=await p.evaluate(()=>window.__rec.slice(0,30));
  const pts=rec.reduce((s,r)=>s+(r.gf>r.ga?3:r.gf===r.ga?1:0),0);
  console.log(JSON.stringify({G,n:rec.length,pts,ms0:rec[0]&&rec[0].ms,ms30:rec.length&&rec[rec.length-1].ms,rec}));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
