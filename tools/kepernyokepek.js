/* Play-listához és a manifest `screenshots` mezőjéhez: valódi képernyőképek.
   node tools/kepernyokepek.js → icons/screenshots/01…04.png (1080×1920)

   1.0.11.2.01: ÁTÍRVA. A régi változat az „Egyedül játszom" feliratú gombot
   kereste, ami a 3.9-es kezdőlappal megszűnt — onnantól mind a négy kép a
   kezdőlap lett, a manifest képei pedig a 3.9.09-es állapotot mutatták.
   Most a karrier a próbák gyors útján indul (ugyanaz, mint a
   tools/*-proba.js-ekben), a képek az alapértelmezett témában készülnek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8899, OUT=path.join(ROOT,"icons","screenshots");
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  // 1080×1920 a Play telefonos ajánlása; DPR 2-vel 540×960 CSS-ben
  const ctx=await b.newContext({viewport:{width:540,height:960},deviceScaleFactor:2});
  /* az élő háttér maradjon (az a kezdőlap része), a nyitóképernyőt már
     „látta" a böngésző — a kép a kész kezdőlapot mutassa */
  await ctx.addInitScript(()=>{try{localStorage.setItem("nyitoLatta30_0","1");}catch(e){}});
  const p=await ctx.newPage();
  const hibak=[];p.on("pageerror",e=>hibak.push(e.message));
  const varj=ms=>p.waitForTimeout(ms);
  /* A tanító buborékok jó dolgok a játékban, de egy áruházi képen csak
     takarnak — a kép előtt mindet elléptetjük. */
  const tisztit=async()=>{
    for(let i=0;i<6;i++){
      const volt=await p.evaluate(()=>{
        let n=0;
        for(const id of ["guideTipOk","tNudgeWhyX","talDrawLater","tStepsSkip","vezPushX"]){
          const b=document.getElementById(id);
          if(b&&b.offsetParent&&!b.disabled){b.click();n++;}}
        for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){
          const e=document.getElementById(id);
          if(e&&!e.classList.contains("hide")){e.classList.add("hide");n++;}}
        return n;});
      if(!volt)break;
      await p.waitForTimeout(250);}
    await p.waitForTimeout(350);};
  const lo=async(nev)=>{await tisztit();
    const f=path.join(OUT,nev+".png");await p.screenshot({path:f});
    console.log("  "+nev+".png");};

  /* 1. A kezdőlap */
  await p.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:"load"});
  await varj(2600);
  await lo("01-cimlap");

  /* 2. A karrier indítása: a Karrier-gomb az üdvözlő ablakot nyitja */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());
  await varj(1100);
  await lo("02-beallitas");

  /* 3–4. Gyors karrier (a próbák útja), a felállás és egy élő meccs */
  await p.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:"load"});await varj(1400);
  await p.evaluate(()=>{
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    startFirstSeason();phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    document.getElementById("mpEntry").classList.add("hide");});
  await varj(900);await tisztit();
  await p.evaluate(()=>document.getElementById("scoutSpinBtn").click());await varj(2600);await tisztit();
  /* 3. a HUB: a keret, a run-szint, a kémia — a karrier „központja" */
  await p.evaluate(()=>{openHubMidSeason();window.scrollTo(0,0);});
  await varj(900);await tisztit();
  await p.evaluate(()=>{const m=document.getElementById("hubActions");if(m&&!m.classList.contains("hide"))document.getElementById("hubMenuBtn").click();window.scrollTo(0,0);});
  await varj(600);
  await lo("03-keret");
  await p.evaluate(()=>{try{hubMidSeasonReturn();}catch(e){}});await varj(800);await tisztit();

  for(let i=0;i<2;i++){await p.evaluate(()=>{const k=document.getElementById("kickBtn");if(k&&k.offsetParent)k.click();});
    await varj(1500);await tisztit();}
  /* az esemény-animáció („Megfogja!") átléptetése, aztán a meccs halad */
  for(let i=0;i<6;i++){await p.evaluate(()=>{const t=document.getElementById("evaTovabb");if(t&&t.offsetParent)t.click();});await varj(1200);}
  /* 4. a futó meccs: az eredményjelző és a közvetítés */
  await varj(4000);
  await p.evaluate(()=>{const t=document.getElementById("evaTovabb");if(t&&t.offsetParent)t.click();
    const w=document.getElementById("sbWrap");if(w){w.scrollIntoView();window.scrollBy(0,-10);}});
  await varj(700);
  await lo("04-szezon");
  await b.close(); srv.close();
  if(hibak.length)console.log("⚠ oldalhiba: "+hibak.slice(0,3).join(" | "));
})();
