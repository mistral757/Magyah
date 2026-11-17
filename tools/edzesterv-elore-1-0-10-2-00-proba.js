/* 📈 1.0.10.2.00 — AZ EDZÉSTERV ELŐREJELZÉSE.
   AUDIT (E tétel): a választó nem mondta meg, kinek és mennyit hoz a terv.
   Amit mér:
     1. üres vázlatnál az előrejelzés felszólít a választásra;
     2. az előrejelzés pont/meccs értéke a kezdő MINDEN érintett emberére
        egyezik azzal, amit a motor egy végigjátszott meccsen ténylegesen
        elkönyvel (processCareerDevelopment → edzés-mérleg);
     3. ugyanez a kispadon ülőkre (processBenchDevelopment);
     4. a kiírt hozam = pont × hátralévő forduló / 15, és a sáv teteje fogja;
     5. a panel választás közben él (a vázlatból), a fő/mellék színnel, a
        kispad lenyitható; 430 px-en nincs túlcsordulás;
     6. a motorhoz nem nyúl: a mentett edzésterv formája változatlan;
     7. nincs oldalhiba.  KEP=<mappa>: képernyőkép. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9328;
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
    });
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const ki={};
    /* 1. üres vázlat */
    S.training=null;S.trainingChangeUsed=false;
    openHubMidSeason();openTrainingPlanner();
    ki.ures=document.getElementById("trainEloBox").innerText;
    /* a terv: fő Gólszerzés (csatár + középpálya), mellék Védekezés (védők) */
    S.training={main:{stat:"gol",groups:["CSATAR","KOZEPPALYAS"]},sec:{stat:"ved",groups:["VEDO","KOZEPPALYAS"]},setSeason:1};
    ki.forma=JSON.stringify(S.training);
    /* legyen kispad is */
    const XI=slots.filter(sl=>sl&&sl.player);
    const padNevek=[];
    try{const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[1];
      Object.keys(BENCH).slice(0,3).forEach((k,i)=>{const src=sq.players[i+3];const pl={n:src.n,ovr:src.ovr,pos:(src.pos||["KKP"]).slice(),age:22+i*4};
        BENCH[k]=pl;careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:pl.age,startRating:pl.ovr,peak:pl.ovr,pot:3000};initPlayerAttrs(careerPool[pl.n]);padNevek.push(pl.n);});}catch(e){ki.padHiba=String(e);}
    const E=trainEloreSzamol(trainingFor);
    ki.fordulo=E.F;ki.db=[E.sorok.filter(x=>!x.pad).length,E.sorok.filter(x=>x.pad).length];
    /* 2. a motor egy végigjátszott meccse */
    const pts=n=>{const e=careerPool[n];const t=trainLogFor(e);return Object.assign({},t.pts);};
    const elotte={};E.sorok.forEach(x=>{elotte[x.n]=pts(x.n);});
    const active=slots.map((sl,i)=>sl&&sl.player?{p:sl.player,idx:i}:null).filter(Boolean);
    try{processCareerDevelopment(active,{},{},-1,-1,-1,new Set(),null,1);}catch(e){ki.motorHiba=String(e);}
    try{processBenchDevelopment();}catch(e){ki.padMotorHiba=String(e);}
    ki.elt=0;ki.eltPad=0;ki.minta=[];
    E.sorok.forEach(x=>{const u=pts(x.n);x.t.forEach(t=>{const mert=u[t.key]-elotte[x.n][t.key];
      const d=Math.abs(mert-t.pt);if(x.pad)ki.eltPad=Math.max(ki.eltPad,d);else ki.elt=Math.max(ki.elt,d);
      if(ki.minta.length<4)ki.minta.push([x.pad?"pad":"kezdő",x.pos,t.key,+t.pt.toFixed(4),+mert.toFixed(4)]);});});
    /* 4. a hozam képlete és a sáv */
    ki.keplet=E.sorok.every(x=>x.t.every(t=>t.fal||Math.abs(t.lep-t.pt*E.F.n/CAREER_DEV_THRESHOLD)<1e-9));
    {const x=E.sorok.find(q=>!q.pad),e=careerPool[x.n],t=x.t[0];const b=attrBandOf(e,t.key);const mento=e.attrs[t.key];
      e.attrs[t.key]=b.hi-1;const E2=trainEloreSzamol(trainingFor);const t2=E2.sorok.find(q=>q.n===x.n).t[0];
      ki.sav=[t2.fal,t2.lep,t.pt*E.F.n/CAREER_DEV_THRESHOLD];e.attrs[t.key]=mento;}
    /* 5. a panel: a vázlatból él */
    S.trainingChangeUsed=false;openTrainingPlanner();
    const B=document.getElementById("trainEloBox");
    ki.panel=B.innerText;ki.sorok=B.querySelectorAll(".trEloSor").length;ki.fo=B.querySelectorAll("b.fo").length;ki.mel=B.querySelectorAll("b.mel").length;
    ki.padLeny=!!B.querySelector("details.trEloPad");
    const elso=B.innerText;
    /* vázlat-változtatás: a mellék edzés posztjai közül kiveszem a védőket */
    trainDraft.sec.groups=["KOZEPPALYAS"];renderTrainingPlanner();
    ki.valtozik=document.getElementById("trainEloBox").innerText!==elso;
    ki.mentettValtozatlan=JSON.stringify(S.training)===ki.forma;
    ki.tul=[...document.querySelectorAll("#twPanel *")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    return ki;});
  ok(/Válassz képességet/.test(r.ures),"1. üres vázlatnál felszólít a választásra");
  ok(r.db[0]>=6&&r.db[1]>=1&&!r.padHiba,"2. a terv a kezdő és a kispad embereit is érinti",r.db);
  console.log("     minta (hol, poszt, képesség, előrejelzett pont/meccs, a motor könyvelése):");r.minta.forEach(m=>console.log("       "+JSON.stringify(m)));
  ok(!r.motorHiba&&r.elt<1e-9,"2. kezdő: az előrejelzés = amit a motor egy meccsen elkönyvel",{elteres:r.elt,hiba:r.motorHiba});
  ok(!r.padMotorHiba&&r.eltPad<1e-9,"3. kispad: az előrejelzés = amit a motor elkönyvel",{elteres:r.eltPad,hiba:r.padMotorHiba});
  ok(r.keplet&&r.fordulo.n===30&&!r.fordulo.kov,"4. hozam = pont × hátralévő forduló / 15 (30 forduló van hátra)",r.fordulo);
  ok(r.sav[0]===true&&Math.abs(r.sav[1]-1)<1e-9&&r.sav[2]>1,"4. a specializációs sáv teteje megfogja (🔒)",r.sav);
  ok(r.sorok>=7&&r.fo>=3&&r.mel>=3&&r.padLeny&&/az idény végéig — még 30 bajnoki forduló/.test(r.panel)&&/összesen ≈/.test(r.panel),"5. a panel: soronként a játékos, fő és mellék külön, a kispad lenyitható",{sorok:r.sorok,fo:r.fo,mellek:r.mel});
  ok(r.valtozik&&r.mentettValtozatlan,"5–6. a vázlat változtatására azonnal újraszámol; a mentett terv érintetlen");
  ok(r.tul===0,"5. 430 px: nincs vízszintes túlcsordulás",r.tul);
  if(KEP){await p.evaluate(()=>{trainDraft.sec.groups=["VEDO","KOZEPPALYAS"];renderTrainingPlanner();
      for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}
      [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);if(c.position==="fixed"&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});
      document.getElementById("trainEloBox").scrollIntoView({block:"start"});window.scrollBy(0,-150);});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,"edzesterv-elore-utana.png")});}
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
