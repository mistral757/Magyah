/* 📐 3.9.285 — A HÁROM FEKVŐ NÉZET.

   KÉRÉS: „Telefonon fekvő módban lehessen nézetek között váltani: felül
   eredményjelző, alul feed - mostani. Felül momentum, alul feed, és felül
   eredményjelző, alul momentum."

   Amit mér (valódi karrier, valódi meccs, 844×390-es fekvő telefon):
     1. kezdőrúgás előtt (a momentum-panel még rejtve) nincs kapcsoló, a
        mostani elrendezés él;
     2. meccs közben a kapcsoló kint van, alapból „Tábla + feed": felül a
        tábla, alul a napló, a momentum nem látszik;
     3. egy koppintás: „Momentum + feed" — felül a momentum (a görbe kitölti
        a magasságot, a viewBox a valódi méret, tehát nem torzul), alul a
        napló, a tábla rejtve; összecsukott momentumnál is nyitva;
     4. még egy: „Tábla + momentum" — felül a tábla, alul a momentum, a napló
        nulla magas, a tempó-pirula a helyén;
     5. körbeér, a választás a böngészőben marad;
     6. álló nézetben semmi nem változik (nincs kapcsoló, a momentum a
        helyén);
     7. nincs oldalhiba.
   Használat: node tools/fekvo-nezet-3-9-285-proba.js [kép-mappa] */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9285;
const KEP=process.argv[2]||null;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".png":"image/png",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.removeItem("fekvoNezet30_0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();});
  await p.waitForTimeout(1500);

  const allapot=()=>p.evaluate(()=>{
    const bc=document.body.classList,$=id=>document.getElementById(id);
    const lat=el=>!!el&&getComputedStyle(el).display!=="none"&&el.getBoundingClientRect().height>0;
    const r=el=>{const x=el.getBoundingClientRect();return {top:Math.round(x.top),bottom:Math.round(x.bottom),h:Math.round(x.height)};};
    const L=$("ekLend");const vb=(L.getAttribute("viewBox")||"").split(" ").map(Number);
    return {stadium:bc.contains("stadium"),van:bc.contains("fkVan"),mf:bc.contains("fkMF"),tm:bc.contains("fkTM"),
      gomb:lat($("fkNezBtn")),gombTx:($("fkNezTx")||{}).textContent,
      tabla:lat($("sbWrap")),tablaR:r($("sbWrap")),ek:lat($("elokep")),ekR:r($("elokep")),
      naplo:lat($("ttLines")),naploR:r($("ttLines")),ttxtH:Math.round($("ttxt").getBoundingClientRect().height),
      gorbeH:Math.round(L.getBoundingClientRect().height),vbH:vb[3]||0,ekTest:lat($("ekTest")),
      tempo:lat($("speedRow")),tar:(()=>{try{return localStorage.getItem("fekvoNezet30_0");}catch(e){return null;}})()};});

  /* 1. kezdőrúgás előtt, fekve */
  await p.evaluate(()=>{document.querySelectorAll("#guideTip,.guideTip").forEach(x=>x.remove());
    $("scHub").classList.add("hide");$("scSim").classList.remove("hide");});
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(600);
  const a0=await allapot();
  const ekRejtve=await p.evaluate(()=>document.getElementById("elokep").classList.contains("hide"));
  console.log("— 1. KEZDŐRÚGÁS ELŐTT —");
  ok(a0.stadium&&ekRejtve&&!a0.van&&!a0.gomb&&!a0.mf&&!a0.tm,"a momentum még rejtve: nincs kapcsoló, a mostani elrendezés",a0);

  /* 2. meccs közben */
  await p.evaluate(()=>{try{localStorage.setItem(MEV_ANIM_KEY,"1");}catch(e){}S.auto=false;matchSpeed=0.25;playMatch();});
  await p.waitForTimeout(6000);
  const a1=await allapot();
  console.log("— 2. TÁBLA + FEED (alap) —");
  ok(a1.van&&a1.gomb&&a1.gombTx==="Tábla + feed"&&a1.tabla&&a1.naplo&&!a1.ek&&a1.tablaR.bottom<=a1.naploR.top+2,"a kapcsoló kint; felül a tábla, alul a napló, a momentum nem látszik",a1);
  if(KEP){fs.mkdirSync(KEP,{recursive:true});await p.screenshot({path:path.join(KEP,"fekvo-tf.png")});}

  /* 3. momentum + feed (összecsukott momentummal is) */
  await p.evaluate(()=>{try{localStorage.setItem(EK_KEY,"1");ekCsukAllit();}catch(e){}document.getElementById("fkNezBtn").click();});
  await p.waitForTimeout(700);
  const a2=await allapot();
  console.log("— 3. MOMENTUM + FEED —");
  ok(a2.mf&&a2.gombTx==="Momentum + feed"&&!a2.tabla&&a2.ek&&a2.naplo&&a2.ekR.top<5&&a2.ekR.bottom<=a2.naploR.top+2,"felül a momentum, alul a napló, a tábla rejtve",a2);
  ok(a2.ekTest&&a2.gorbeH>=120&&Math.abs(a2.vbH-a2.gorbeH)<=2,"a görbe kitölti a magasságot, nem torzul (összecsukva mentett panelnél is nyitva)",{gorbeH:a2.gorbeH,vbH:a2.vbH,ekTest:a2.ekTest});
  if(KEP)await p.screenshot({path:path.join(KEP,"fekvo-mf.png")});

  /* 4. tábla + momentum */
  await p.evaluate(()=>document.getElementById("fkNezBtn").click());
  await p.waitForTimeout(700);
  const a3=await allapot();
  console.log("— 4. TÁBLA + MOMENTUM —");
  ok(a3.tm&&a3.gombTx==="Tábla + momentum"&&a3.tabla&&a3.ek&&a3.tablaR.bottom<=a3.ekR.top+2&&a3.ttxtH===0&&a3.tempo,"felül a tábla, alul a momentum, a napló nulla magas, a tempó a helyén",a3);
  ok(Math.abs(a3.vbH-a3.gorbeH)<=2&&a3.gorbeH>=40,"a görbe az új magassághoz igazodik",{gorbeH:a3.gorbeH,vbH:a3.vbH});
  if(KEP)await p.screenshot({path:path.join(KEP,"fekvo-tm.png")});

  /* 5. körbeér, tárolva */
  await p.evaluate(()=>document.getElementById("fkNezBtn").click());
  await p.waitForTimeout(500);
  const a4=await allapot();
  console.log("— 5. KÖRBE —");
  ok(!a4.mf&&!a4.tm&&a4.gombTx==="Tábla + feed"&&a4.tar==="tf"&&a3.tar==="tm"&&a2.tar==="mf","körbeér; a választás a böngészőben",[a2.tar,a3.tar,a4.tar]);

  /* 6. álló nézet: a „momentum + feed" választással se változzon semmi */
  await p.evaluate(()=>fekvoNezetBeallit("mf"));
  await p.setViewportSize({width:430,height:900});await p.waitForTimeout(800);
  const a5=await allapot();
  console.log("— 6. ÁLLÓ NÉZET —");
  ok(!a5.stadium&&!a5.van&&!a5.mf&&!a5.gomb&&a5.ek&&a5.tabla&&a5.tar==="mf","állva nincs kapcsoló, a tábla és a momentum a helyén (a választás megmarad fektetésre)",a5);
  await p.setViewportSize({width:844,height:390});await p.waitForTimeout(800);
  const a6=await allapot();
  ok(a6.mf&&!a6.tabla&&a6.ek,"visszafektetve a választott nézet jön",a6);
  await p.evaluate(()=>{try{localStorage.removeItem(EK_KEY);localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}});

  console.log("— 7. HIBÁK —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
