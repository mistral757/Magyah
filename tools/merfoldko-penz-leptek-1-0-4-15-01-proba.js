/* 💰 1.0.4.15.01 — A PÉNZES MÉRFÖLDKŐ-JUTALOM A FEJLESZTÉSEK LÉPTÉKÉVEL NŐ.

   BEJELENTÉS: „A pénzes mérföldkő jutalmak nem scalelődnek felfelé."
   Amit mér:
     1. a karrier elején (kevés bevétel) a jutalom lényegében a régi;
     2. nagy valódi bevételnél a jutalom a penzLeptek(true)-vel nő: a boost-
        egységhez mért aránya ugyanaz, mint a karrier elején;
     3. a saját jutalom-bevétel nem emeli (nem gerjeszti önmagát);
     4. a kategória-nyitás ára (msAvgCashReward) ugyanarra a mércére ül;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9415;
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
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    window.saveGame=()=>{};
    const core=seasonBudgetCore(),cbs=clubBudgetScale();
    S.seasonNumber=2;
    const sor=(sn,cats)=>{if(!S.ledger||S.ledger.v!==LEDGER_V)S.ledger={v:LEDGER_V,rows:{}};S.ledger.rows[sn]={open:0,cats:Object.assign({},cats)};};
    const regi=pct=>{const pp=Math.max(MS_PCT_MIN,Math.min(MS_PCT_MAX,pct));return Math.max(1,Math.round(core*pp*MS_CASH_TRIM*msEarlyScale(pp)*talMsPremium()));};
    const m=()=>({ms10:msCashReward(0.10),ms30:msCashReward(0.30),unit:boostUnitBase(),lepJ:penzLeptek(true),cat:msAvgCashReward()});
    sor(1,{season:Math.round(cbs*0.9)});sor(2,{});
    ki.eleje=m();ki.regi10=regi(0.10);ki.regi30=regi(0.30);ki.core=core;ki.cbs=cbs;
    const BIG=cbs*1000;
    sor(1,{fans:BIG,prize:BIG*0.5});sor(2,{});
    ki.nagy=m();
    sor(1,{fans:BIG,prize:BIG*0.5,reward:BIG*50});sor(2,{});
    ki.jutalommal=m();
    sor(1,{fans:BIG,prize:BIG*0.5,reward:BIG*50,investRet:BIG*40,talKamat:BIG*9,talTozsde:BIG*9,talEsemeny:BIG*9});sor(2,{});
    ki.szarmmal=m();ki.szarm=penzSzarmLeptek();
    ki.budzseCel=TAL_IGAZG_FAJTA.budzse.cel();
    return ki;});
  const E=r.eleje,N=r.nagy;
  console.log("\n— 1. a karrier eleje —");
  ok(Math.abs(E.ms10-r.regi10)<=Math.max(2,r.regi10*(r.cbs/r.core-1)+1)&&E.ms10>=r.regi10,"a jutalom a régi körül (a lépték a működési keret és a prémium fele)",{uj:E.ms10,regi:r.regi10,core:Math.round(r.core),cbs:Math.round(r.cbs)});
  console.log("\n— 2. nagy valódi bevétel —");
  ok(N.ms10>E.ms10*100,"a jutalom a bevétellel együtt nő (×100 fölött)",{eleje:E.ms10,nagy:N.ms10});
  const ar=x=>x.ms10/x.unit;
  ok(Math.abs(ar(N)/ar(E)-1)<0.05,"a boost-egységhez mért arány ugyanaz",{eleje:ar(E),nagy:ar(N)});
  ok(N.ms30>N.ms10,"a nagyobb fokozat többet ad",[N.ms10,N.ms30]);
  console.log("\n— 3. nem gerjeszti önmagát —");
  ok(r.jutalommal.ms10===N.ms10,"a jutalom-bevétel nem emeli",[N.ms10,r.jutalommal.ms10]);
  ok(r.szarmmal.ms10===N.ms10,"a befektetés hozama, a kamat, a tőzsde és a talizmán-esemény sem (1.0.4.15.02)",[N.ms10,r.szarmmal.ms10]);
  ok(Math.abs(r.budzseCel-Math.round(r.szarm*0.25))<=1,"az igazgatóság büdzsé-célja ugyanerre a mércére ül",{cel:r.budzseCel,merce:Math.round(r.szarm)});
  console.log("\n— 4. a kategória-nyitás ára —");
  ok(Math.abs(N.cat/E.cat-N.lepJ/E.lepJ)<0.01*(N.lepJ/E.lepJ),"ugyanazzal a mércével mozog",{eleje:Math.round(E.cat),nagy:Math.round(N.cat)});
  console.log("\n— 5. oldalhiba —");
  ok(!errs.length,"nincs",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
