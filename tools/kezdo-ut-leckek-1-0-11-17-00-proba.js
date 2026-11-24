/* 🧭 1.0.11.17.00 — KEZDŐ ÚT, 3. FÁZIS: A LECKÉK + A „KEZDŐ BOT"
   KÉRÉS: „…ha valami kinyílik, egy rövid lecke […] képernyőképekkel megmutatjuk,
   hogy na itt akkor ezt kell csinálni." + docs/kezdo-ut-roadmap.md 6.4, 7.1, 8, 10, 12.
   Amit mér:
     1. minden lecke legfeljebb 4 lépés, a hivatkozott elemek léteznek, minden
        nyitó szakasznak (és a piacnak) van leckéje, a „Csináld" csak
        visszafordítható műveletet kér;
     2. a kártyáról indított első lecke: Mutasd (kiemelés + arany keret) → …
        → Csináld (vár; a jelre „Kész") → Összegzés; a lecke „látott" lesz;
     3. a nyitás-ablak „Mutasd meg →" gombja a szakasz leckéjét indítja;
     4. a HUB-on kívül a lecke kis sávvá húzódik a modális ablakok alá, és a
        HUB-on folytatódik;
     5. ☰ Menü → 🧭 Vezetés: a Kezdő út ki/be kapcsolható, a leckék újranézhetők;
     6. KEZDŐ BOT: egy teljes első idény TÉTLENÜL (végigjátszás, egyetlen
        feladat nélkül) — a 30. fordulóra a 0–5. szakasz mind lezárul, minden
        első idényes funkció kinyílik, csak a 2. idényes (akadémia, kupa) zárt;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9277;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
  /* karrier a HUB-ig (a draft és az osztályválasztó gyors útja) */
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
    window._ajanlat=0;const _sco=showChallengeOffers;window.showChallengeOffers=function(){window._ajanlat++;return _sco.apply(this,arguments);};
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window._saveEredeti=saveGame;window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  /* 1. a leckék szerkezete */
  const r1=await p.evaluate(()=>{
    const BIZTONSAGOS=["view:formation","view:tactics","view:midrole","view:analysis","view:budget","set:training","set:bond","set:dial"];
    const hiba=[];
    Object.keys(KUT_LECKE).forEach(id=>{const L=KUT_LECKE[id];
      if(L.l.length>4)hiba.push(id+": "+L.l.length+" lépés");
      L.l.forEach((st,i)=>{
        if(!["kep","mutasd","csinald","osszeg"].includes(st.t))hiba.push(id+"/"+i+": típus "+st.t);
        if(st.el&&!document.getElementById(st.el))hiba.push(id+"/"+i+": nincs #"+st.el);
        (st.kep||[]).forEach(k=>{if(!document.getElementById(k))hiba.push(id+"/"+i+": nincs kép #"+k);});
        if(st.t==="csinald"&&!BIZTONSAGOS.includes(st.var))hiba.push(id+"/"+i+": nem biztonságos jel "+st.var);
        if(!st.c||!st.x)hiba.push(id+"/"+i+": üres szöveg");});});
    const nyito=KUT_SZAKASZ.filter(sz=>sz.nyit.length).map(sz=>sz.id).filter(id=>!KUT_LECKE[id]);
    if(!KUT_LECKE.piac)nyito.push("piac");
    return {hiba,hianyzo:nyito,db:Object.keys(KUT_LECKE).length};});
  /* 1.0.11.19.00: +2 stílus-lecke (a döntés előtt és után) */
  ok(!r1.hiba.length&&!r1.hianyzo.length&&r1.db===10,"1. 10 lecke, mind ≤ 4 lépés, létező elemekre mutat; minden nyitásnak van leckéje; a „Csináld” csak visszafordítható",r1);
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();
    for(const id of ["guideTipOk","guideTipOff"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  await p.waitForTimeout(400);
  /* 2. az első lecke a kártyáról */
  const r2a=await p.evaluate(()=>{
    const g=document.querySelector('#hubKutKartya [data-kut="lecke:elso11"]');const o={gomb:!!g};
    g.click();o.cim=document.querySelector("#kutLecke .kutLCim").textContent;o.lepes=document.querySelector("#kutLecke .kutLFej").textContent;return o;});
  await p.waitForTimeout(1300);
  const r2b=await p.evaluate(()=>{
    const d=document.getElementById("kutLDim"),fr=d.querySelector("b").getBoundingClientRect(),el=document.getElementById("hubFormationBtn").getBoundingClientRect();
    const o={dim:!d.classList.contains("hide"),keret:Math.abs(fr.top-(el.top-5))<3&&Math.abs(fr.height-(el.height+10))<3};
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();o.c2=document.querySelector("#kutLecke .kutLCim").textContent;
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();o.c3=document.querySelector("#kutLecke .kutLCim").textContent;
    o.csinalGomb=!!document.querySelector('#kutLecke [data-kl="csinald"]');
    document.querySelector('#kutLecke [data-kl="csinald"]').click();
    o.var=document.getElementById("kutLecke").classList.contains("var")&&/Várom/.test(document.getElementById("kutLecke").textContent);
    teachMidRoleMark();
    o.kesz=!!document.querySelector("#kutLecke .kutLKesz");o.pipa=!!S.kut.kesz["elso11:megb"];
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();o.c4=document.querySelector("#kutLecke .kutLCim").textContent;
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();o.zarva=!document.getElementById("kutLecke")&&!_kutL;
    o.latta=!!(S.kut.lecke&&S.kut.lecke.elso11);return o;});
  ok(r2a.gomb&&/A felállás/.test(r2a.cim)&&/1\/4/.test(r2a.lepes)&&r2b.dim&&r2b.keret&&/taktika/i.test(r2b.c2)&&/megbízás/i.test(r2b.c3)&&r2b.csinalGomb&&r2b.var&&r2b.kesz&&r2b.pipa&&/✅/.test(r2b.c4)&&r2b.zarva&&r2b.latta,
    "2. „📖 Mutasd, hogyan”: Mutasd (sötétítés + keret a gombon) → Csináld (vár, a jelre „Kész”, a feladat is kipipálva) → Összegzés; a lecke „látott”",Object.assign({},r2a,r2b));
  /* 3. a nyitás-ablak a leckét indítja */
  await p.evaluate(()=>{kutJel("view:formation");kutJel("view:tactics");kutMeccsUtan(1,0);
    document.getElementById("scHub").classList.remove("hide");S.idx=1;renderHub();});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  await p.waitForTimeout(2500);
  const r3=await p.evaluate(()=>{const o={modal:!document.getElementById("hubTacticConfirmModal").classList.contains("hide"),cim:document.getElementById("hubTacticConfirmTitle").textContent};
    if(o.modal)document.getElementById("hubTacticConfirmYes").click();
    o.lecke=_kutL&&_kutL.id;o.lcim=document.querySelector("#kutLecke .kutLCim")&&document.querySelector("#kutLecke .kutLCim").textContent;return o;});
  ok(r3.modal&&/Kinyíl/.test(r3.cim)&&r3.lecke==="meccsek"&&/edzésterv/i.test(r3.lcim),"3. a „🔓 Kinyíltak” ablak „Mutasd meg →” gombja a szakasz leckéjét indítja (Edzés és összhang)",r3);
  /* 4. a HUB-on kívül: kis sáv a modális ablakok alatt */
  const r4=await p.evaluate(()=>{const o={};
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();
    document.querySelector('#kutLecke [data-kl="csinald"]').click();
    document.getElementById("hubTrainingBtn").click();
    o.hub=!document.getElementById("scHub").classList.contains("hide");return o;});
  await p.waitForTimeout(700);
  const r4b=await p.evaluate(()=>{const box=document.getElementById("kutLecke");const o={sav:box.classList.contains("var"),z:getComputedStyle(box).zIndex,dim:document.getElementById("kutLDim").classList.contains("hide")};
    kutJel("set:training");o.kesz=/Kész/.test(box.textContent);
    /* vissza a HUB-ra */
    document.querySelectorAll("#scHub ~ *").forEach(()=>{});
    ["hubTrainingPicker","scTraining","hubTrainPicker"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
    [...document.querySelectorAll("body > div, #app > div")].forEach(()=>{});
    document.getElementById("scHub").classList.remove("hide");return o;});
  await p.waitForTimeout(800);
  const r4c=await p.evaluate(()=>{const box=document.getElementById("kutLecke");return {sav:box&&box.classList.contains("var"),kesz:!!document.querySelector("#kutLecke .kutLKesz")};});
  ok(!r4.hub&&r4b.sav&&+r4b.z<90&&r4b.dim&&r4b.kesz&&!r4c.sav&&r4c.kesz,"4. a HUB-on kívül a lecke kis sáv a modális ablakok alatt (z < 90), a jelre „Kész”; a HUB-on teljes lappal folytatódik",Object.assign({},r4,r4b,{vissza:r4c}));
  await p.evaluate(()=>kutLeckeZar());
  /* 5. a Vezetés menü */
  const r5=await p.evaluate(()=>{const o={};
    hubMenuToggle(true);const g=document.querySelector('#hubActions .hubGroup[data-acc="teach"]');
    if(g&&g.querySelector(".accBody").classList.contains("hide"))hubAccToggle(g);
    o.panel=!!document.getElementById("kutPanel");o.lista=[...document.querySelectorAll("#kutPanel [data-kutlecke]")].map(b=>b.dataset.kutlecke);
    o.zartElotte=!kutNyitva("boost");
    document.getElementById("kutBeKi").click();o.ki=!!S.kut.mind&&kutNyitva("boost");
    document.getElementById("kutBeKi").click();o.be=!S.kut.mind&&!kutNyitva("boost");
    document.querySelector('#kutPanel [data-kutlecke="elso11"]').click();o.ujra=_kutL&&_kutL.id;kutLeckeZar();
    return o;});
  ok(r5.panel&&r5.lista.includes("elso11")&&r5.lista.includes("meccsek")&&r5.zartElotte&&r5.ki&&r5.be&&r5.ujra==="elso11",
    "5. ☰ Menü → 🧭 Vezetés: a Kezdő út ki- és visszakapcsolható, a leckék innen újranézhetők",r5);
  /* 6. KEZDŐ BOT — egy teljes első idény, tétlenül */
  const r6=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.kut={v:1,tudas:"kezdo",sz:0,kesz:{},nyit:{},uj:[],zs:0,vt:0,mutatott:{}};
    S.seasonNumber=1;S.idx=0;
    const t0=Date.now();
    S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<40000&&S.idx<30;i++)await varj(15);
    S.auto=false;await varj(1500);
    const o={idx:S.idx,ido:Math.round((Date.now()-t0)/1000)};
    kutErtekel();
    o.sz=S.kut.sz;o.cim=KUT_SZAKASZ[S.kut.sz]&&KUT_SZAKASZ[S.kut.sz].id;
    o.nyitva=Object.keys(KUT_FUNKCIO).filter(f=>kutNyitva(f));
    o.zart=Object.keys(KUT_FUNKCIO).filter(f=>!kutNyitva(f));
    o.feladat=Object.keys(S.kut.kesz).length;
    return o;});
  ok(r6.idx>=30&&r6.sz===6&&r6.cim==="filozofia"&&r6.zart.length===2&&r6.zart.includes("akademia")&&r6.zart.includes("euro"),
    "6. KEZDŐ BOT: a tétlenül végigjátszott első idény után a 0–5. szakasz lezárult (a filozófia-szakasz következik), minden első idényes funkció nyitva, csak az akadémia és a kupa vár",r6);
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
