/* 🎯⚔️ 1.0.11.8.00 — KI-KI MECCS A RUN-SZINT RÖGZÍTÉSÉÉRT.
   KÉRÉS: „Ha már abban a ligában vagy, amiben a Run szint rögzítése
   megtörténhet, de nem nyered meg a ligát, csak top 3-ba kerülsz, akkor az
   utolsó meccs után játszhatsz egy ki-ki meccset a szezon győztesével. Ha azt
   megnyered, akkor 1% Run szint levonásért megkapod a Run szint rögzítést."
   Amit mér:
     1. a feltételek: 2–3. hely kell (1. és 4. nem), a Run-cél osztálya
        (alatta nem), még nem rögzített Run; dinamikusan 100-as mezőny;
        idényenként egyszer; a bajnok a végtabella első sora;
     2. az egymeccses összesítés (döntetlen → hosszabbítás) és az idegenbeli
        pálya;
     3. VALÓDI mérkőzés a hagyományos piramisban: győzelem → a Run rögzül
        (pyrGoalSeason), a Run-bontásban a ki-ki sor, a kész szám 1%-kal
        kevesebb; a „Tovább" a lánc folytatása;
     4. VALÓDI mérkőzés dinamikus módban: győzelem → megnyílik az Infinity-
        kapu (infWonAtGate);
     5. vereség: semmi nem rögzül, levonás nincs; a kihagyás is egyszeri;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9247;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof coachAttrPower==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    window.__sg=saveGame;window.saveGame=()=>{};window.saveGameNow=()=>{};
    window.mezKerdesKell=()=>false;
    ki.pyr=pyrOn();
    return ki;});
  /* a lezárt idény beállítása */
  const allit=(mode,rank,field,bajnokOvr)=>p.evaluate(([mode,rank,field,bajnokOvr])=>{
    S.seasonNumber=3;S.idx=30;phase="season";
    S.run=null;runInit();
    if(mode==="pyr"){if(!S.pyr&&window.__pyr)S.pyr=window.__pyr;S.pyr.startDiv=pyrMyDivId()+2;}
    else{window.__pyr=window.__pyr||S.pyr;S.pyr=null;infinityMode=false;}
    S.seasonHistory=(S.seasonHistory||[]).filter(h=>h.season!==3);
    S.seasonHistory.push({season:3,rank,oppRating:field,pts:60,w:18,d:6,l:6});
    SEASON_OPPS=SEASON_OPPS.filter(o=>o.n!=="Bajnok FC");
    SEASON_OPPS.push({n:"Bajnok FC",ovr:bajnokOvr});
    S.finalTable=[{n:"Bajnok FC",pts:70},{n:teamName,you:true,pts:60}];
    S.pyrPo=null;
    const J=runKikiJelolt();
    return J?{mode:J.mode,rank:J.rank,opp:J.opp}:null;},[mode,rank,field,bajnokOvr]);
  const felt={};
  felt.pyr2=await allit("pyr",2,90,20);
  felt.pyr1=await allit("pyr",1,90,20);
  felt.pyr4=await allit("pyr",4,90,20);
  felt.pyrAlatt=await p.evaluate(()=>{S.seasonHistory[S.seasonHistory.length-1].rank=2;S.pyr.startDiv=pyrMyDivId()-1;return runKikiJelolt();});
  felt.pyrRogzitett=await p.evaluate(()=>{S.pyr.startDiv=pyrMyDivId()+2;runInit().pyrGoalSeason=2;const r=runKikiJelolt();runInit().pyrGoalSeason=null;return r;});
  felt.egyszer=await p.evaluate(()=>{runInit().kiki={season:3,played:false};const r=runKikiJelolt();runInit().kiki=null;return r;});
  /* 2. egymeccses összesítés */
  const tie=await p.evaluate(()=>{S.pyrPo={season:3,stage:"play",kiki:true,idx:0,legs:[null,null],iAmCh:true,opp:{n:"Bajnok FC",ovr:20}};
    const o={fx:pyrPoFx(),d:pyrPoTieLevel(1,1),n:pyrPoTieLevel(2,1),lt:pyrPoLiveTie(0,2)};S.pyrPo=null;return o;});
  /* 3. valódi meccs a piramisban */
  const jatsz=async(mode,ovr)=>{
    await allit(mode,2,mode==="pyr"?90:105,ovr);
    await p.evaluate(()=>{window.__tovabb=0;S.auto=true;
      runKikiFlow(()=>{window.__tovabb++;});
      [...document.querySelectorAll("#unlockActions button")].find(b=>/Lejátszom/.test(b.textContent)).click();
      [...document.querySelectorAll("#unlockActions button")].find(b=>/Kezdőrúgás/.test(b.textContent)).click();});
    await p.waitForFunction(()=>S.pyrPo&&S.pyrPo.stage==="done",null,{timeout:240000});
    return p.evaluate(()=>{
      const R=S.run,B=runBreakdown();
      const o={kiki:R.kiki&&{won:R.kiki.won,gf:R.kiki.gf,ga:R.kiki.ga},pyrGoal:R.pyrGoalSeason||null,gate:(()=>{try{return infWonAtGate();}catch(e){return null;}})(),
        sor:(B.rows.find(r=>r.k==="kiki")||{}).d||null,total:B.total,levonas:runKikiLevonas(),
        cim:document.getElementById("unlockTitle").textContent};
      /* a levonás nélküli szám */
      const w=R.kiki.won;R.kiki.won=false;o.totalNelkul=runBreakdown().total;R.kiki.won=w;
      [...document.querySelectorAll("#unlockActions button")].find(b=>/Tovább/.test(b.textContent)).click();
      o.tovabb=window.__tovabb;return o;});};
  const P=await jatsz("pyr",20);
  const D=await jatsz("dyn",20);
  const V=await jatsz("pyr",400);
  const errs2=errs.slice();
  console.log(JSON.stringify({felt,tie,P,D,V}));
  ok(felt.pyr2&&felt.pyr2.mode==="pyr"&&felt.pyr2.opp.n==="Bajnok FC"&&felt.pyr2.opp.ovr===20&&!felt.pyr1&&!felt.pyr4,"1a. a piramisban 2. hely: van ajánlat a bajnok ellen; 1. és 4. helyen nincs",felt);
  ok(!felt.pyrAlatt&&!felt.pyrRogzitett&&!felt.egyszer,"1b. a Run-cél alatti osztályban, rögzített Run-nal, és idényenként másodszor nincs",felt);
  ok(tie.fx.home===false&&tie.fx.kiki&&tie.d===true&&tie.n===false&&tie.lt.lead==="them","2. egy meccs idegenben; döntetlennél hosszabbítás",tie);
  ok(P.kiki&&P.kiki.won&&P.pyrGoal===3&&P.sor&&P.levonas===0.01&&Math.abs(P.total-P.totalNelkul*0.99)<1e-6&&P.tovabb===1,"3. piramis: győzelem → a Run rögzül, ki-ki sor, −1%, a lánc folytatódik",P);
  ok(D.kiki&&D.kiki.won&&D.gate===true&&D.tovabb===1,"4. dinamikus: győzelem → nyitva az Infinity-kapu",D);
  ok(V.kiki&&V.kiki.won===false&&!V.pyrGoal&&V.levonas===0&&V.total===V.totalNelkul&&V.tovabb===1,"5. vereség: nincs rögzítés, nincs levonás, a lánc folytatódik",V);
  ok(!errs2.length,"nincs oldalhiba",errs2.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})();
