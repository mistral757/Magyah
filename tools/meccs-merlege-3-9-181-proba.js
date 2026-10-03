/* 🎙 3.9.181 — A MECCS MÉRLEGE: A FEED ALJÁN ÉS SAJÁT ABLAKBAN.

   Bejelentés: „A feed ezen része a meccsek végén legyen mindig a legalul […]
   legyen az, hogy ez ugrik fel, a meccsvégi statisztikák nem, és ezen a
   felugró ablakon van egy külön gomb, ami megnyitja a meccsvégi
   statisztikákat, ha akarod. Ha nem, akkor egyszerűen csak bezárod."

   Egy VALÓDI bajnoki meccs után méri:
     1. a lefújás után a MÉRLEG ugrik fel (cím, mondat, izgalom), nem a
        statisztika; rajta a „📊 Meccsvégi statisztikák" gomb;
     2. a naplóban a mérleg két sora a meccs UTOLSÓ két sora (a jutalmak
        után), és csak egyszer íródik ki;
     3. a gomb ugyanabban az ablakban a statisztikát mutatja; a „Rendben"
        bezár és továbbvisz;
     4. a meccsképernyő statisztika-gombja továbbra is a statisztikát nyitja;
     5. a mérleg mentődik: újratöltés után is megnyitható, és nem íródik ki
        újra; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9224;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi egyjátékos karrier, szezonban, lemezre mentve ---- */
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
    S.idx=4;S.W=3;S.D=1;S.L=0;S.auto=false;
    saveGame();
    return {kulcs:saveKey(),csapat:teamName,idx:S.idx,W:S.W,D:S.D,L:S.L};});
  ok(!!alap.kulcs,"előkészület: valódi karrier, szezonban",alap);
  await p.evaluate(()=>{
    window.__sorok=[];
    const _a=addLine;addLine=function(h){window.__sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};
    S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    playMatch();});
  /* a lánc közbülső ablakait (talizmán-húzás, skill-választás) továbbengedjük */
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       const m=document.getElementById("mstatModal");
       if(m&&!m.classList.contains("hide"))return true;
       /* jutalom-skill kiosztása: az ajánlott (vagy az első) játékos, aztán a gomb */
       const box=document.getElementById("skillAssignList");
       if(box&&box.offsetParent){
         const g=[...box.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled&&/Rendben/.test(x.innerText||""));
         if(g){g.click();return false;}
         const aj=box.querySelector("[data-imm-ajanl]")||box.querySelector(".prow");
         if(aj){aj.click();return false;}}
       /* feloldás-bejelentés (scUnlock): az első gombja visz tovább */
       const ua=document.getElementById("unlockActions");
       if(ua&&ua.offsetParent){
         const g=[...ua.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled);
         if(g){g.click();return false;}}
       for(const id of ["talDrawLater","guideTipOk","skillOfferSkip","unlockOk"]){
         const x=document.getElementById(id);if(x&&x.offsetParent&&!x.disabled){x.click();break;}}
       return false;});
     if(!kesz)await p.waitForTimeout(400);}
   if(!kesz){
     const d=await p.evaluate(()=>({playing:S.playing,idx:S.idx,fed:S.lastMatch&&S.lastMatch.verdict&&S.lastMatch.verdict.fed,
       uto:!!S.utoMeccs,tartas:typeof _utoTartas!=="undefined"?_utoTartas:null,sorok:window.__sorok.slice(-5),
       rendben:[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben/.test(x.innerText||"")).map(x=>x.parentElement&&x.parentElement.id+"/"+(x.closest("[id]")||{}).id),
       vis:[...document.querySelectorAll("[id]")].filter(x=>!x.classList.contains("hide")&&getComputedStyle(x).position==="fixed"&&x.offsetWidth>0).map(x=>x.id),
       gombok:[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&!x.disabled).map(x=>(x.id||"?")+"|"+(x.innerText||"").slice(0,30)).slice(0,25)}));
     throw new Error("a mérleg ablaka nem nyílt meg · "+JSON.stringify(d));}}
  const r1=await p.evaluate(()=>({
    cim:document.getElementById("mstatTitle").textContent,
    test:document.getElementById("mstatBody").textContent,
    gomb:!document.getElementById("mstatStatsBtn").classList.contains("hide"),
    gombSz:document.getElementById("mstatStatsBtn").textContent,
    mind:!document.getElementById("mstatAllBtn").classList.contains("hide"),
    sorok:window.__sorok.slice(),
    v:S.lastMatch&&S.lastMatch.verdict}));
  console.log("\n— 1. a felugró ablak —");
  ok(/a meccs mérlege/.test(r1.cim)&&/🎙/.test(r1.test)&&/Izgalom: \d+\/100/.test(r1.test)&&!/labdabirtoklás/.test(r1.test),
     "a lefújás után a MÉRLEG ugrik fel, nem a statisztika",{cim:r1.cim,test:r1.test.slice(0,160)});
  ok(r1.gomb&&/Meccsvégi statisztikák/.test(r1.gombSz)&&!r1.mind,"rajta a „📊 Meccsvégi statisztikák” gomb",r1.gombSz);
  console.log("\n— 2. a napló —");
  const n=r1.sorok.length;
  ok(n>=2&&/A meccs mérlege:/.test(r1.sorok[n-2])&&/^📊 Izgalom: \d+\/100/.test(r1.sorok[n-1]),
     "a mérleg két sora a meccs UTOLSÓ két sora",r1.sorok.slice(-4));
  ok(r1.sorok.filter(t=>/A meccs mérlege:/.test(t)).length===1,"egyszer íródik ki");
  const vegeIdx=r1.sorok.findIndex(t=>/^VÉGE/.test(t));
  ok(vegeIdx<0||vegeIdx<n-2,"a „VÉGE” sor és a meccs többi sora fölötte áll",{vege:vegeIdx,n});
  console.log("\n— 3. a gomb és a bezárás —");
  const r3=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    document.getElementById("mstatStatsBtn").click();await varj(50);
    const o={nyitva:!document.getElementById("mstatModal").classList.contains("hide"),
      test:document.getElementById("mstatBody").textContent,
      cim:document.getElementById("mstatTitle").textContent,
      gomb:!document.getElementById("mstatStatsBtn").classList.contains("hide")};
    window.__tovabb=0;
    document.getElementById("mstatOk").click();await varj(80);
    o.zarva=document.getElementById("mstatModal").classList.contains("hide");
    o.kick=document.getElementById("kickBtn").disabled===false;
    /* 4. a meccsképernyő gombja: statisztika */
    mstatShow(null);await varj(30);
    o.kezi=document.getElementById("mstatBody").textContent;
    o.keziGomb=!document.getElementById("mstatStatsBtn").classList.contains("hide");
    mstatClose();
    /* újabb flush/rajzolás nem ír ki még egyszer */
    mVerdictFlush();
    o.db=window.__sorok.filter(t=>/A meccs mérlege:/.test(t)).length;
    return o;});
  ok(r3.nyitva&&/labdabirtoklás/.test(r3.test)&&/a mérkőzés/.test(r3.cim)&&!r3.gomb,
     "a gomb UGYANABBAN az ablakban a statisztikát mutatja",{cim:r3.cim});
  ok(r3.zarva&&r3.kick,"a „Rendben” bezár és továbbvisz (a kezdőrúgás gomb szabad)",r3);
  console.log("\n— 4. a meccsképernyő gombja —");
  ok(/labdabirtoklás/.test(r3.kezi)&&!r3.keziGomb,"a statisztika-gomb továbbra is a statisztikát nyitja");
  ok(r3.db===1,"a mérleg akkor sem íródik ki újra, ha a flush még egyszer lefut",r3.db);
  console.log("\n— 5. mentés —");
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>{const x=document.getElementById("heResumeBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForTimeout(1200);
  const r5=await p.evaluate(()=>{
    window.__s2=[];const _a=addLine;addLine=function(h){window.__s2.push(String(h));return _a.apply(this,arguments);};
    const v=S.lastMatch&&S.lastMatch.verdict;
    mstatShow(null,"verdict");
    const o={v:!!(v&&v.txt),fed:!!(v&&v.fed),test:document.getElementById("mstatBody").textContent};
    mstatClose();
    mVerdictFlush();
    o.ujra=window.__s2.filter(t=>/A meccs mérlege/.test(t)).length;
    return o;});
  ok(r5.v&&r5.fed&&/🎙/.test(r5.test),"újratöltés után is megvan, és megnyitható",r5.test.slice(0,120));
  ok(r5.ujra===0,"újratöltés után nem íródik ki újra a naplóba",r5.ujra);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
