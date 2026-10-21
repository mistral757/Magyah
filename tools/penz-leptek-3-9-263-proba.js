/* 💰 3.9.263 — A PÉNZ A 3–4. IDÉNY UTÁN IS JÓZAN MARAD.

   KÉRÉS: „A mérési adatainkat is böngészd. És próbálj valamit kidolgozni,
   amivel 3-4. szezon után is még reasonable lesz az anyagi oldala a
   játéknak." (A társ: „Kb 120 ifi boost fér bele … egyszer csak valahol
   tízszeres sebességgel kezd el ömleni a pénz.")

   Amit mér (valódi függvények, valódi karrier-keret, a könyvelésbe írt
   idény-sorokkal):
     1. a karrier elején (kevés bevétel) a lépték, a boost-egység, a poszt-
        betanítás és a kihívás-tét pontosan a működési kerethez mér, ahogy
        eddig;
     2. nagy valódi bevételnél a lépték a bevétel fele: az eladás, a hitel, a
        visszatérítés és a PvP-felzárkóztatás nem számít bele; az előző és a
        mostani idény nagyobbika dönt;
     3. egy idény valódi bevétele így legfeljebb ~1,8 ifi-boostot fizet;
     4. a kihívás pénz-tétje NEM függ az egyenlegtől (a régi képlet kamatos
        kamat volt), és a saját jutalom-bevétele nem emeli (nem gerjeszti
        önmagát);
     5. a katalógus kiírja, hogy most a valódi bevétel dönt;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9263;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    window.saveGame=()=>{};
    S.transferBudget=5000;
    const cbs=Math.round(clubBudgetScale());
    S.seasonNumber=2;
    const sor=(sn,cats)=>{if(!S.ledger||S.ledger.v!==LEDGER_V)S.ledger={v:LEDGER_V,rows:{}};S.ledger.rows[sn]={open:0,cats:Object.assign({},cats)};};
    const meres=()=>({valos:penzEvesValos(),lep:Math.round(penzLeptek()),unitBase:Math.round(boostUnitBase()),
      ch:Math.round(challengeMoneyScale(challengeContext())),pos:posLearnTypicalCost(),bps:budgetPriceScale()});
    /* 1. a karrier eleje: kevés bevétel */
    sor(1,{season:Math.round(cbs*0.9),fans:Math.round(cbs*0.3),reward:Math.round(cbs*0.2),sale:Math.round(cbs*3)});sor(2,{});
    ki.eleje=meres();ki.cbs=cbs;
    /* 2. nagy valódi bevétel: az előző idény sokszorosa a keretnek */
    const BIG=cbs*1000;
    sor(1,{fans:BIG,prize:BIG*0.5,reward:BIG*0.5,sale:BIG*20,saleStar:BIG*5,loanIn:BIG*9,refund:BIG,mpCatch:BIG});
    sor(2,{fans:BIG*0.3});
    ki.nagy=meres();ki.BIG=BIG;
    /* a mostani idény átveszi, ha már nagyobb */
    sor(2,{fans:BIG*3,reward:BIG});
    ki.atvesz=meres();
    /* 4. a kihívás-tét nem függ az egyenlegtől */
    S.transferBudget=0;const ch0=Math.round(challengeMoneyScale(challengeContext()));
    S.transferBudget=BIG*100;const ch1=Math.round(challengeMoneyScale(challengeContext()));
    ki.chEgyenleg={ch0,ch1};
    /* és a saját jutalom-bevétele nem emeli */
    sor(1,{fans:BIG});sor(2,{});const chA=Math.round(challengeMoneyScale(challengeContext()));
    sor(1,{fans:BIG,reward:BIG*50});const chB=Math.round(challengeMoneyScale(challengeContext()));
    ki.chJutalom={chA,chB,unitA:null};
    /* 5. a katalógus */
    sor(1,{fans:BIG});
    try{boostOpenPanel();ki.kat=(document.getElementById("twBody")||{}).textContent||"";}catch(e){ki.kat="hiba: "+e.message;}
    ki.verzio=APP_VERSION;
    return ki;});
  const kozel=(a,b,t)=>Math.abs(a-b)<=Math.max(1,Math.abs(b)*(t||0.01));
  console.log("=== 1. a karrier eleje ===");
  ok(r.eleje.lep===r.cbs,"kevés bevételnél a lépték a működési keret (a régi)",r.eleje);
  ok(kozel(r.eleje.unitBase,1.1*r.cbs),"a boost-egység a régi 1,1 × keret",{unit:r.eleje.unitBase,cbs:r.cbs});
  ok(kozel(r.eleje.ch,0.85*r.cbs),"a kihívás-tét a keretből (≈ a régi 85-ös mezőnyben)",{ch:r.eleje.ch});
  console.log("=== 2. nagy valódi bevétel ===");
  ok(r.nagy.valos===r.BIG*2,"a valódi bevétel: lelátó + kupa + jutalom — eladás, hitel, visszatérítés, felzárkóztatás nélkül",{valos:r.nagy.valos,vart:r.BIG*2});
  ok(r.nagy.lep===r.BIG,"a lépték a valódi bevétel fele",{lep:r.nagy.lep});
  ok(kozel(r.nagy.unitBase,1.1*r.BIG),"a boost-egység ehhez mér",r.nagy.unitBase);
  ok(r.nagy.valos/r.nagy.unitBase<=1.85,"egy idény valódi bevétele legfeljebb ~1,8 ifi-boostot fizet",Math.round(r.nagy.valos/r.nagy.unitBase*100)/100);
  ok(r.nagy.pos>r.eleje.pos*100&&r.nagy.bps>r.eleje.bps,"a poszt-betanítás és a fix fejlesztési árak is követik",{pos:[r.eleje.pos,r.nagy.pos],bps:[r.eleje.bps,r.nagy.bps]});
  ok(r.atvesz.valos===r.BIG*4,"ha a mostani idény már nagyobb, az dönt",r.atvesz.valos);
  console.log("=== 4. a kihívás-tét ===");
  ok(r.chEgyenleg.ch0===r.chEgyenleg.ch1,"az egyenleg (0 vagy százszoros) nem változtat rajta — nincs kamatos kamat",r.chEgyenleg);
  ok(r.chJutalom.chA===r.chJutalom.chB,"a saját jutalom-bevétele nem emeli (nem gerjeszti önmagát)",r.chJutalom);
  console.log("=== 5. a katalógus ===");
  ok(/valódi bevétel/.test(r.kat)&&/most a valódi bevétel dönt/.test(r.kat),"a katalógus kiírja, hogy most a valódi bevétel dönt",r.kat.slice(0,300));
  ok(String(r.verzio).localeCompare("3.9.263",undefined,{numeric:true})>=0,"verzió legalább 3.9.263",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
