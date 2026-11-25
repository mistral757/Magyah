/* 📐 1.0.9.8.01 — A TAKTIKA-PANEL: ELÖL AZ ÁLLAPOT, A MAGYARÁZAT LENYITHATÓ.
   AUDIT (docs/audit-felulet-mechanika-1-0-9-8.md, B tétel): a panel első
   ~560 képpontja magyarázat volt, a hat választható rendszer csak utána jött.
   Amit mér:
     1. aktív rendszer nélkül a fejléc kimondja; az öt tengely csempéje látszik;
     2. a magyarázat egy csukott fülben — a szövege BETŰRE megvan (semmi nem
        veszett el), és lenyitva látszik;
     3. az első rendszer-kártya a régi ~900 px helyett 520 px-en belül kezdődik;
     4. aktiválás után a fejléc az aktív rendszert, az ismertséget és az
        illeszkedést mutatja — a panel saját számaival egyezően;
     5. a lenyitott fül újrarajzoláskor nyitva marad;
     6. 430 px-en nincs vízszintes túlcsordulás; nincs oldalhiba.
   KEP=<mappa>: képernyőkép. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9322;
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
    S.tactics.active=null;openHubMidSeason();document.getElementById("hubTacticsBtn").click();});
  await p.waitForTimeout(400);
  const tiszta=async()=>{await p.evaluate(()=>{
    for(const id of ["guideTipOk","tNudgeWhyX","talDrawLater"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}
    [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);
        if(c.position==="fixed"&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor)){e.style.display="none";return;}
      if(c.position==="fixed"&&e.offsetWidth>300&&e.offsetHeight>300&&(/rgba\(0, 0, 0, 0\.[3-9]/.test(c.backgroundColor)||/rgba\(0, 0, 0, 0\.[3-9]/.test(c.boxShadow)))e.style.display="none";
      /* a tanító réteg reflektora: kis elem, óriási árnyékkal sötétít */
      if(/\d{4,}px/.test(c.boxShadow)){e.style.boxShadow="none";}});});
    await p.waitForTimeout(250);};
  if(KEP){await tiszta();await p.evaluate(()=>{document.getElementById("hubTacticsPicker").scrollIntoView();window.scrollBy(0,-70);});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,REGI?"taktika-fejlec-elotte.png":"taktika-fejlec-utana.png")});}
  if(REGI){await b.close();srv.close();return;}
  const r=await p.evaluate(()=>{
    const ki={};const H=document.getElementById("hubTacticsHint"),P=document.getElementById("hubTacticsPicker");
    const D=document.getElementById("hubTacticsReszl");
    ki.nincs=/Nincs aktív rendszer/.test(H.innerText);
    ki.teng=[...H.querySelectorAll(".tkTeng span")].map(x=>x.innerText.replace(/\s+/g," "));
    ki.csukva=!!D&&!D.open;
    const t=D.textContent;
    ki.szoveg=/Minden tengely a pályán lévő játékosok attribútumaiból áll össze/.test(t)&&/A Ratingekből várt/.test(t)
      &&/Minden taktika MÁS tengelyekre épül/.test(t)&&/85-ös szinttől ad előnyt/.test(t)&&/Váltani bármikor lehet/.test(t)
      &&ATTR_KEYS.every(k=>t.indexOf(ATTR_LABELS[k]+":")>=0);
    /* a csukott <details> tartalma: a böngésző verziójától függően 0 magas
       VAGY content-visibility:hidden — mindkettőt elfogadjuk */
    {const B=D.querySelector(".mxFulB");
     ki.rejtve=B.getBoundingClientRect().height===0||(typeof B.checkVisibility==="function"&&!B.checkVisibility({contentVisibilityAuto:true,checkVisibilityCSS:true}));
     ki.rejtveDbg=[D.open,B.getBoundingClientRect().height];}
    const elso=document.querySelector("#hubTacticsBody .hubCard,#hubTacticsBody>*");
    /* 🐞 1.0.12.5.00 — a 🎚 kártya kikerült a taktika-panelből (a csúszkák a menü saját pontján) */
    ki.csuszkaKartya=document.getElementById("hubDialOpenBtn")?999:0;
    const kartyak=[...document.querySelectorAll("#hubTacticsBody>*")].filter(e=>e.id!=="hubDialOpenBtn");
    ki.elsoRendszer=kartyak[0].getBoundingClientRect().top-P.getBoundingClientRect().top;
    /* aktiválás */
    const A=teamAttrStrengths();
    const k=Object.keys(TACTICS).slice().sort((a,b)=>tacticFit(b,A)-tacticFit(a,A))[0];
    S.tactics.active=k;S.tactics.levels[k]=88;renderHubTacticsPanel();
    const sums=[...document.querySelectorAll("#hubTacticsHint .msSum")].map(x=>x.innerText.replace(/\s+/g," "));
    ki.sums=sums;ki.vart=[TACTICS[k].n,String(Math.round(tacticLevel(k))),Math.round(tacticFit(k,A)*100)+"%"];
    /* nyitva marad */
    document.getElementById("hubTacticsReszl").open=true;renderHubTacticsPanel();
    ki.nyitvaMarad=document.getElementById("hubTacticsReszl").open&&document.querySelector("#hubTacticsReszl .mxFulB").getBoundingClientRect().height>100;
    ki.tul=[...P.querySelectorAll("*")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    return ki;});
  ok(r.nincs,"1. aktív rendszer nélkül a fejléc kimondja");
  ok(r.teng.length===5&&r.teng.every(x=>/^(Véd|Kap|Pas|Gól|Seb) \d+$/.test(x)),"1. az öt tengely csempéje elöl látszik",r.teng);
  ok(r.csukva&&r.rejtve,"2. a magyarázat csukott fülben van",r.rejtveDbg);
  ok(r.szoveg,"2. a fül szövege betűre megvan (öt tengely, várt érték, illeszkedés, 85-ös szint)");
  ok(r.elsoRendszer<520&&r.csuszkaKartya===0,"3. az első rendszer a panel tetején (🎚 kártya nincs — 1.0.12.5.00)",{csuszka:Math.round(r.csuszkaKartya),elsoRendszer:Math.round(r.elsoRendszer)});
  ok(r.sums.length===3&&r.sums[0].indexOf(r.vart[0])>=0&&r.sums[1].indexOf(r.vart[1])===0&&r.sums[2].indexOf(r.vart[2])===0,"4. aktiválás után: rendszer · ismertség · illeszkedés",r.sums);
  ok(r.nyitvaMarad,"5. a lenyitott fül újrarajzoláskor nyitva marad");
  ok(r.tul===0,"6. 430 px: nincs vízszintes túlcsordulás",r.tul);
  ok(errs.length===0,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
