/* ▶ 3.9.180 — NINCS KÖZTES „Mentett meccs található" SÁV.

   Bejelentés: „Single player mentés betöltésénél van ez a köztes oldal. Erre
   nincs szükség. Kivehető, törölhető."

   A választás a kezdőlapon már megtörtént (Folytatás / a hely chipje), tehát
   a mentés EGYENESEN töltődik be. Amit mér (valódi karrier, valódi mentés,
   valódi újratöltés):
     1. a sáv eltűnt: se az elem, se a gombjai, se a felirata nincs a lapon;
     2. HIDEG INDULÁS: a kezdőlap van elöl, a játék még NINCS betöltve, és a
        módválasztó sem villan elő alatta;
     3. „Mentett meccs folytatása" (ugyanarra a helyre, újratöltés nélkül):
        egyenesen a karrierbe tölt — ugyanaz a csapat, forduló, mérleg;
     4. SZÁNDÉKKAL érkezve (a hely-chip / kontextusváltás újratöltése): az
        indulás maga tölt be, a kezdőlap nem jön elő;
     5. közben TÖRÖLT mentés: a Folytatás nem tölt be egy eldobott karriert —
        a módválasztó jön;
     6. ELSZÁLLÓ betöltés: a ragadós hibasáv a kezdőlapon, a mentés a helyén;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9222;
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
  const mentesNyers=await p.evaluate(k=>localStorage.getItem(k),alap.kulcs);
  ok(!!mentesNyers&&alap.idx===4,"előkészület: valódi karrier, mentés a lemezen",{kulcs:alap.kulcs,csapat:alap.csapat});

  const allapot=()=>p.evaluate(()=>({
    sav:!!document.getElementById("resumeBanner")||!!document.getElementById("resumeYesBtn")||!!document.getElementById("resumeNoBtn"),
    felirat:/Mentett meccs található/i.test(document.body.innerText),
    kezdolap:!document.getElementById("mpEntry").classList.contains("hide"),
    modvalaszto:!document.getElementById("scModeSelect").classList.contains("hide"),
    bent:hasLiveGame(),csapat:teamName,idx:S.idx,W:S.W,D:S.D,L:S.L,phase}));

  /* ---- 1-2. HIDEG INDULÁS ---- */
  console.log("\n— hideg indulás —");
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1200);
  const hideg=await allapot();
  ok(!hideg.sav,"a köztes sáv elemei nincsenek a lapon");
  ok(hideg.kezdolap&&!hideg.bent,"a kezdőlap van elöl, a játék még nincs betöltve",hideg);
  ok(!hideg.modvalaszto,"a módválasztó sem áll a kezdőlap alatt");

  /* ---- 3. Folytatás ugyanarra a helyre ---- */
  console.log("\n— Mentett meccs folytatása —");
  let navigalt=false;const fig=()=>{navigalt=true;};p.on("framenavigated",fig);
  await p.evaluate(()=>document.getElementById("heResumeBtn").click());await p.waitForTimeout(1200);
  p.off("framenavigated",fig);
  const folyt=await allapot();
  ok(!navigalt,"újratöltés nélkül megy");
  ok(!folyt.kezdolap&&folyt.bent&&folyt.csapat===alap.csapat&&folyt.idx===alap.idx&&folyt.W===3&&folyt.D===1,
    "egyenesen a karrierbe tölt — ugyanaz a csapat, forduló, mérleg",folyt);
  ok(!folyt.felirat&&!folyt.modvalaszto,"se köztes felirat, se módválasztó",folyt);

  /* ---- 4. szándékkal érkezve (kontextusváltás újratöltése) ---- */
  console.log("\n— szándékkal érkezve —");
  await p.evaluate(()=>{sessionStorage.setItem(MP_BOOT_KEY,JSON.stringify({solo:true,slot:spSlot()}));});
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1500);
  const szand=await allapot();
  ok(!szand.kezdolap&&szand.bent&&szand.csapat===alap.csapat&&szand.idx===alap.idx&&!szand.felirat,
    "az indulás maga tölt be, a kezdőlap és a köztes sáv nem jön elő",szand);

  /* ---- 5. közben törölt mentés ---- */
  console.log("\n— közben törölt mentés —");
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1200);
  const torolt=await p.evaluate(k=>{
    localStorage.removeItem(k);
    mpSwitchContext({solo:true,slot:spSlot()});
    return {bent:hasLiveGame(),modvalaszto:!document.getElementById("scModeSelect").classList.contains("hide"),
      kezdolap:!document.getElementById("mpEntry").classList.contains("hide")};},alap.kulcs);
  ok(!torolt.bent&&torolt.modvalaszto&&!torolt.kezdolap,"eldobott karriert nem tölt be — a módválasztó jön",torolt);

  /* ---- 6. elszálló betöltés ---- */
  console.log("\n— elszálló betöltés —");
  await p.evaluate(([k,v])=>localStorage.setItem(k,v),[alap.kulcs,mentesNyers]);
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1200);
  const hibas=await p.evaluate(k=>{
    loadIntoGame=function(){return false;};
    document.getElementById("heResumeBtn").click();
    return {kezdolap:!document.getElementById("mpEntry").classList.contains("hide"),
      hibasav:/Nem sikerült betölteni/.test(document.getElementById("mpEntry").innerText),
      mentesMegvan:!!localStorage.getItem(k),bent:hasLiveGame()};},alap.kulcs);
  ok(hibas.kezdolap&&hibas.hibasav&&hibas.mentesMegvan&&!hibas.bent,"a hibasáv a kezdőlapon, a mentés a helyén",hibas);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
