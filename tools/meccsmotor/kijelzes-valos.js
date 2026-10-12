/* ⚽ A KIÍRT ⚡ ÉS A MOTOR KÜLÖNBSÉGE — VALÓDI MECCSEKEN (3.9.224, mérés)

   BEJELENTÉS (PvP-társ): „Az miért van, hogy 7 meccsből alig volt olyan, amit
   nyertem annak ellenére, hogy mindig én vagyok az erősebb, és többször 3-4
   egységgel?"
   Ez a mérés NEM tolja el az erőt (szemben a szoras-valos.js-sel): a valódi
   bajnoki menetrend meccseit játssza újra és újra, és minden meccsen
   feljegyzi:
     · a KIÍRT ⚡-párt (az eredményjelző SB.msBase / SB.oppMsBase), és
     · a MOTOR különbségét (matchLambdas: saját ovr + taktika − ellenfél), a
       pálya nélkül;
   majd az eredményt. Ebből két dolog jön ki: (1) a kiírt különbség egyezik-e
   azzal, amivel a motor számol, (2) a KIÍRT különbség szerinti
   győzelem/döntetlen/vereség arány.
   BOOST=<n>: a saját kezdők Ratingje +n (hogy a meccsek az erősebb oldalon
   is mérjenek). N: a meccsek száma. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9283;
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
  const N=+process.env.N||300, BOOST=+process.env.BOOST||0;
  const setup=await p.evaluate(({BOOST,RESET})=>{
    window.__RESET=RESET;
    if(BOOST){S.ratingAdj=S.ratingAdj||{};slots.forEach(sl=>{if(sl.player)S.ratingAdj[sl.player.n]=(S.ratingAdj[sl.player.n]||0)+BOOST;});}
    window.__rec=[];window.__cur=null;window.__i=0;
    const _ml=matchLambdas;
    matchLambdas=function(mine,oppOvr,venue){
      if(!window.__cur){const fx=S.fixtures[S.idx]||{};
        window.__cur={eng:mine.ovr+(mine.tacticEffect||0)-oppOvr,venue,
          big:(()=>{try{return isBigMatchFixture(fx);}catch(e){return null;}})(),
          wc:!!(fx.o&&(fx.o.wc||fx.o.nat)),opp:fx.o&&fx.o.n,i:S.idx,
          /* a diagnózishoz: ki áll a pályán a kezdőrúgáskor, és ki volt a terv */
          mOvr:mine.ovr,tac:mine.tacticEffect||0,
          terv:slots.map(sl=>sl&&sl.player&&sl.player.n).filter(Boolean),
          aktiv:(mine.active||[]).map(a=>a&&a.p&&a.p.n).filter(Boolean),
          hianyzo:Object.keys(S.unavailable||{}).filter(n=>S.unavailable[n]),
          formMalus:S.teamFormMalus||0,chForm:(typeof S.chFormMalus==="number"?S.chFormMalus:null)};}
      const L=_ml(mine,oppOvr,venue);
      /* a motor TÉNYLEGES különbsége a két gólvárhatóságból (a védekező
         skill, a stílus- és a talizmán-szorzók is benne), a pálya nélkül */
      if(window.__cur&&window.__cur.eff==null&&L&&L.lf>0&&L.la>0)
        window.__cur.eff=(Math.log(L.lf)-Math.log(L.la))/(2*SIM.K)-venue;
      return L;};
    const _pm=playMatchMotor;
    window.__fin=function(){
      if(window.__cur&&S.fixtureResults.length>window.__len){
        const r=S.fixtureResults[S.fixtureResults.length-1],c=window.__cur;
        window.__rec.push(Object.assign({},c,{gf:r.gf,ga:r.ga}));window.__i++;}
      window.__cur=null;};
    window.__m0=S.morale;
    playMatchMotor=function(){
      window.__fin();
      if(window.__RESET){S.morale=window.__m0;S.teamFormMalus=0;try{S.momentum=0;}catch(e){}}
      try{const L=lines();if(L&&L.children.length>400)L.innerHTML="";}catch(e){}
      const F=window.__i%Math.min(28,S.fixtures.length);
      S.idx=F;S.fixtureResults.length=Math.min(S.fixtureResults.length,F);
      window.__len=S.fixtureResults.length;
      const out=_pm.apply(this,arguments);
      if(window.__cur){window.__cur.dMy=SB.msBase;window.__cur.dOpp=SB.oppMsBase;}
      return out;};
    S.auto=true;
    return {n:S.fixtures.length,ms:teamMatchStrength(),mezony:(S.fixtures||[]).slice(0,28).map(f=>f.o&&f.o.ovr)};},{BOOST,RESET:process.env.RESET==='1'});
  console.log("setup",JSON.stringify(setup));
  const t0=Date.now();
  await p.evaluate(()=>playMatch());
  let last=-1,stall=0;
  while(true){
    await p.clock.runFor(4000);
    const st=await p.evaluate(()=>({n:window.__rec.length,idx:S.idx,playing:S.playing}));
    if(st.n>=N)break;
    if(st.n===last&&stall>=2&&!st.playing){
      await p.evaluate(()=>{document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));
        try{if(S.utoMeccs){S.utoMeccs=null;}}catch(e){}
        _utoTartas=false;S.auto=true;S.playing=false;try{playMatch();}catch(e){}});}
    if(st.n===last){stall++;if(stall>25){console.log("ELAKADT",JSON.stringify(st));break;}}
    else{stall=0;last=st.n;}}
  const rec=await p.evaluate(()=>window.__rec);
  require("fs").writeFileSync(process.env.OUT||"/dev/null",JSON.stringify(rec));
  const dd=rec.filter(r=>r.dMy!=null&&r.dOpp!=null).map(r=>({...r,disp:r.dMy-r.dOpp}));
  dd.forEach(r=>{if(r.eff!=null)r.eng=r.eff;});
  const elt=dd.map(r=>r.disp-r.eng);
  const avg=a=>a.reduce((s,x)=>s+x,0)/Math.max(1,a.length);
  console.log(`kiírt − motor különbség: átlag ${avg(elt).toFixed(2)}  min ${Math.min(...elt).toFixed(2)}  max ${Math.max(...elt).toFixed(2)}  (n=${dd.length})`);
  const sav=[[-99,-1],[-1,1],[1,2],[2,3],[3,4],[4,5],[5,99]];
  for(const [lo,hi] of sav){const a=dd.filter(r=>r.disp>=lo&&r.disp<hi);if(!a.length)continue;
    const w=a.filter(r=>r.gf>r.ga).length,d=a.filter(r=>r.gf===r.ga).length,l=a.length-w-d;
    console.log(`kiírt ⚡ ${lo}…${hi}: n=${a.length}  Gy ${(100*w/a.length).toFixed(0)}%  D ${(100*d/a.length).toFixed(0)}%  V ${(100*l/a.length).toFixed(0)}%  motor-átlag ${avg(a.map(r=>r.eng)).toFixed(2)}  hazai ${a.filter(r=>r.venue>0).length}`);}
  console.log("idő",Math.round((Date.now()-t0)/1000),"s; hibák",errs.slice(0,3));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
