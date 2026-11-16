/* 💱 1.0.9.8.02 — A BOOST-KÖZPONT: ELÖL A HÁROM SZÁM, AZ ÁRAZÁS LENYITHATÓ.
   AUDIT (docs/audit-felulet-mechanika-1-0-9-8.md, G tétel): a fejléc egyetlen
   ~250–450 képpontos bekezdés volt, az első boost csak alatta kezdődött.
   Amit mér:
     1. elöl három csempe: az egység ára, az egyenleg, a kedvezmény — a játék
        saját számaival (boostUnitPrice, transferBudget, az alapárhoz mért %);
     2. az árazás magyarázata csukott fülben, a szövege betűre megvan
        (egység, kedvezmény, a kezdő idények ablaka, a klub léptéke);
     3. a fejléc magassága a régi fele alatt, az első boost-gomb feljebb;
     4. mind a hét fajta gombja megvan, a kosár is;
     5. a lenyitott fül újrarajzoláskor nyitva marad;
     6. 430 px-en nincs vízszintes túlcsordulás; nincs oldalhiba.
   KEP=<mappa>: képernyőkép (REGI=1: az előtte-kép, állítások nélkül). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9324;
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
const KEP=process.env.KEP||"",REGI=!!process.env.REGI;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    window.mgmtNyit=()=>false;
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
    S.idx=0;S.auto=false;window.saveGame=()=>{};window.saveGameNow=()=>{};
    openHubMidSeason();document.getElementById("hubBoostBtn").click();});
  await p.waitForTimeout(500);
  const tiszta=async()=>{await p.evaluate(()=>{
    for(const id of ["guideTipOk","tNudgeWhyX","talDrawLater"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}
    [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);
      if(c.position==="fixed"&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});});
    await p.waitForTimeout(250);};
  if(KEP){await tiszta();await p.evaluate(()=>{document.getElementById("twPanel").scrollIntoView();window.scrollBy(0,-10);});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,REGI?"boost-fejlec-elotte.png":"boost-fejlec-utana.png")});}
  if(REGI){console.log("fejléc-magasság (régi):",await p.evaluate(()=>Math.round(document.getElementById("twBody").getBoundingClientRect().height)));await b.close();srv.close();return;}
  const r=await p.evaluate(()=>{
    const ki={};const B=document.getElementById("twBody"),D=document.getElementById("boostArReszl");
    const cs=[...B.querySelectorAll(".msSum")].map(x=>x.innerText.replace(/\s+/g," "));
    ki.cs=cs;const unit=boostUnitPrice(),alap=Math.round(boostUnitBase()/100)*100;
    ki.vart=[fmtFt(unit),fmtFt(S.transferBudget||0),alap>unit?"−"+Math.round((1-unit/alap)*100)+"%":"nincs"];
    ki.csukva=!!D&&!D.open;
    const t=D.textContent;
    ki.szoveg=/egységben/.test(t)&&/ifi-boost ára/.test(t)&&/KLUB ÉVES BEVÉTELÉHEZ/.test(t)&&/Ahogy a klub nő, úgy nő az ár is/.test(t)
      &&(ki.vart[2]==="nincs"||(/Kedvezmény az egység alapárán/.test(t)&&/kezdő idények ablaka/.test(t)));
    ki.kint=/Hétféle fejlesztés/.test(B.innerText)&&/visszavonhatatlan/.test(B.innerText);
    ki.fejMagas=Math.round(B.getBoundingClientRect().height);
    const g=[...document.querySelectorAll("#twActions button")];
    ki.gombok=g.length;ki.kosar=/Boost-kosár/.test(g[0].innerText);
    ki.fajtak=BOOST_KINDS.filter(d=>d.k!=="equal"||eqOn()).every(d=>g.some(x=>x.innerText.indexOf(d.n)>=0));
    ki.elsoBoost=Math.round(g[1].getBoundingClientRect().top-document.getElementById("twPanel").getBoundingClientRect().top);
    D.open=true;boostOpenPanel();
    ki.nyitvaMarad=document.getElementById("boostArReszl").open;
    ki.tul=[...document.querySelectorAll("#twPanel *")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    return ki;});
  ok(r.cs.length===3&&r.cs[0].indexOf(r.vart[0])===0&&r.cs[1].indexOf(r.vart[1])===0&&r.cs[2].indexOf(r.vart[2])===0,"1. három csempe: egység · egyenleg · kedvezmény, a játék számaival",r.cs);
  ok(r.csukva&&r.szoveg,"2. az árazás magyarázata csukott fülben, a szövege megvan");
  ok(r.kint,"2. a „hétféle fejlesztés” és a „visszavonhatatlan” figyelmeztetés kint maradt");
  ok(r.fejMagas<170&&r.elsoBoost<330,"3. a fejléc alacsony, az első boost a panel tetején",{fejlec:r.fejMagas,elsoBoost:r.elsoBoost});
  ok(r.kosar&&r.fajtak&&r.gombok>=8,"4. a kosár és mind a hét fajta gombja megvan",r.gombok);
  ok(r.nyitvaMarad,"5. a lenyitott fül újrarajzoláskor nyitva marad");
  ok(r.tul===0,"6. 430 px: nincs vízszintes túlcsordulás",r.tul);
  ok(errs.length===0,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
