/* 🎯 1.0.11.19.00 — KEZDŐ ÚT, 5. FÁZIS: A STÍLUS-ÖSSZEVETŐ ÉS A STÍLUS LECKÉI
   (docs/kezdo-ut-roadmap.md 7.3 — „Nem mondjuk meg, melyiket válassza.
   Megmutatjuk, mi mire való.")
   Amit mér:
     1. a választó mind a 8 kártyáján ugyanaz a három sor: 💪 mit erősít ·
        🧩 milyen keret illik · 👁 a kereted szemével; ítélet nélkül (nincs
        „ajánlott", nincs szín);
     2. a „kereted szemével" számai a valódi keret számai (függetlenül
        újraszámolva: védősor, a 6 leggyorsabb, forró vérmérséklet);
     3. a Kezdő úton az új „A klub filozófiája" szakasz a „Mérleg" után jön, a
        kártyán a „📖 Mutasd, hogyan" a stílus leckéjét indítja;
     4. a választó megnyitásakor (szezonjelentés) a stílus leckéje magától
        indul — a menedzsment-ablakot megvárja —, a 2. lépés a listát emeli ki;
     5. a választás után: a feladat kipipálva, a „Stíluspont és képességfa"
        lecke indul, mindhárom kiemelése a valódi szakaszra mutat;
     6. a képességfa megnyitása a 2. feladat — a szakasz 2/3-mal lezárul;
     7. Kezdő út nélkül nincs lecke, a három sor viszont ott van;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9281;
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
  /* az első idény végéig, tétlenül */
  const r0=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const ix=KUT_SZAKASZ.findIndex(x=>x.id==="filozofia"),im=KUT_SZAKASZ.findIndex(x=>x.id==="merleg"),ih=KUT_SZAKASZ.findIndex(x=>x.id==="hosszu");
    S.auto=true;S.unavailable={};startRound();
    for(let i=0;i<40000&&S.idx<30;i++)await varj(15);
    S.auto=false;await varj(2000);
    if(phase!=="hubreport"){try{hubShowSeasonReport();}catch(e){}await varj(1200);}
    try{kutErtekel();}catch(e){}
    return {can:styleCanChoose(),sz:S.kut.sz,szid:(KUT_SZAKASZ[S.kut.sz]||{}).id,sorrend:im<ix&&ix<ih};});
  /* a menedzsment-ablak marad nyitva: a leckének meg kell várnia */
  await p.evaluate(()=>{document.querySelectorAll("#unlockCard,#hubTacticConfirmModal,#guideTip").forEach(e=>e.classList.add("hide"));
    for(const id of ["unlockCardOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    kutKartyaRajz();
    window._kartyaGomb=!!document.querySelector('#hubKutKartya [data-kut="lecke:stilus"]');
    openStylePickFromReport();});
  await p.waitForTimeout(1600);
  const r3=await p.evaluate(()=>({mgmt:!!(document.getElementById("mgmtModal")&&!document.getElementById("mgmtModal").classList.contains("hide")),
    lecke:_kutL&&_kutL.id,sav:document.getElementById("kutLecke")&&document.getElementById("kutLecke").classList.contains("var"),gomb:window._kartyaGomb}));
  await p.evaluate(()=>{const mo=document.getElementById("mgmtOk");if(mo&&mo.offsetParent)mo.click();const m=document.getElementById("mgmtModal");if(m)m.classList.add("hide");
    /* utána az Infópult is felugrik (a szezonzáró jelentés) — azt is be kell csukni, a lecke addig vár */
    document.querySelectorAll(".hubModal").forEach(e=>e.classList.add("hide"));});
  await p.waitForTimeout(900);
  const r4=await p.evaluate(()=>({cim:(document.querySelector("#kutLecke .kutLCim")||{}).textContent,sav:document.getElementById("kutLecke").classList.contains("var")}));
  await p.evaluate(()=>document.querySelector('#kutLecke [data-kl="tovabb"]').click());
  await p.waitForTimeout(1300);
  const r4b=await p.evaluate(()=>{const d=document.getElementById("kutLDim"),fr=d.querySelector("b").getBoundingClientRect(),L=document.querySelector("#hubStyleBody .msList").getBoundingClientRect();
    return {cim:(document.querySelector("#kutLecke .kutLCim")||{}).textContent,dim:!d.classList.contains("hide"),keret:Math.abs(fr.left-(L.left-5))<3&&Math.abs(fr.width-(L.width+10))<3,nincs:!!document.querySelector("#kutLecke .kutLNincs")};});
  ok(r0.sorrend&&r0.can&&r0.szid==="filozofia"&&r3.gomb,"3. a „A klub filozófiája” szakasz a „Mérleg” után jön; az idény végén ott tart a Kezdő út, a kártyán „📖 Mutasd, hogyan” → a stílus leckéje",Object.assign({},r0,{gomb:r3.gomb}));
  ok(r3.lecke==="stilus"&&r3.mgmt&&r3.sav&&/A döntés súlya/.test(r4.cim)&&!r4.sav&&/Mind a 8/.test(r4b.cim)&&r4b.dim&&r4b.keret&&!r4b.nincs,
    "4. a választó megnyitásakor a stílus leckéje magától indul, a menedzsment-ablakot kis sávként megvárja; a 2. lépés a kártyák listáját emeli ki",{r3,r4,r4b});
  await p.evaluate(()=>kutLeckeZar());
  /* 1–2. a kártyák */
  const r1=await p.evaluate(()=>{
    const it=[...document.querySelectorAll("#hubStyleBody .msList .msItem")];
    const sor=it.map(e=>({er:e.querySelectorAll(".stProfil").length,szem:!!e.querySelector(".stSzem"),tx:(e.querySelector(".stSzem")||{}).textContent||""}));
    const itelet=sor.some(x=>/ajánl|javasol|legjobb választás|rossz/i.test(x.tx));
    const szin=[...document.querySelectorAll("#hubStyleBody .stSzem")].some(e=>/color/.test(e.getAttribute("style")||""));
    return {db:it.length,mind:sor.every(x=>x.er===2&&x.szem),itelet,szin};});
  ok(r1.db===8&&r1.mind&&!r1.itelet&&!r1.szin,"1. mind a 8 kártyán ugyanaz a három sor (mit erősít · milyen keret illik · a kereted szemével), ítélet és szín nélkül",r1);
  const r2=await p.evaluate(()=>{
    const xi=[];slots.forEach((sl,i)=>{if(sl&&sl.player)xi.push({p:sl.player,r:roleInFormation(sl.pos,form,i)});});
    const avg=a=>a.reduce((s,v)=>s+v,0)/a.length,f=v=>(Math.round(v*10)/10).toFixed(1).replace(".",",");
    const ved=f(avg(xi.filter(x=>x.r==="VEDO").map(x=>x.p.ovr)));
    const seb=f(avg(xi.filter(x=>x.r!=="KAPUS").map(x=>attrsOfPlayer(x.p).seb).sort((a,b)=>b-a).slice(0,6)));
    const ro=fullCareerRoster(),forro=ro.filter(p=>verI(p)>=6).length;
    const tx=k=>{const e=[...document.querySelectorAll("#hubStyleBody .msList .msItem")].find(e=>e.querySelector("button[data-style='"+k+"']"));return e?(e.querySelector(".stSzem")||{}).textContent:"";};
    return {ved,seb,forro,ro:ro.length,beton:tx("beton"),villam:tx("villam"),panzer:tx("panzer")};});
  ok(r2.beton.indexOf("védősor "+r2.ved)>=0&&r2.villam.indexOf(r2.seb)>=0&&r2.panzer.indexOf(r2.forro+"/"+r2.ro)>=0,
    "2. a „kereted szemével” számai a valódi keret számai (függetlenül újraszámolva: védősor, a 6 leggyorsabb, forró vérmérséklet)",r2);
  /* 5–6. a választás után */
  const r5=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const o={ok:chooseStyle("beton").ok};renderStylePanel();await varj(1600);
    o.pipa=!!S.kut.kesz["filozofia:valaszt"];o.lecke=_kutL&&_kutL.id;
    const lep=[];
    for(let i=0;i<3;i++){
      lep.push({c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent,dim:!document.getElementById("kutLDim").classList.contains("hide"),nincs:!!document.querySelector("#kutLecke .kutLNincs")});
      document.querySelector('#kutLecke [data-kl="tovabb"]').click();await varj(900);}
    o.lep=lep;o.utolso=(document.querySelector("#kutLecke .kutLCim")||{}).textContent;kutLeckeZar();
    const sz0=S.kut.sz;
    const tb=document.querySelector('#hubStyleBody [data-stylesec="trait"]');if(tb&&!tb.classList.contains("open"))tb.click();
    o.fa=!!S.kut.kesz["filozofia:fa"];o.lezart=S.kut.sz===sz0+1&&KUT_SZAKASZ[S.kut.sz].id==="hosszu";return o;});
  ok(r5.ok&&r5.pipa&&r5.lecke==="filozofia"&&r5.lep.every(x=>x.dim&&!x.nincs)&&/csapatstílus-pont/.test(r5.lep[0].c)&&/képességfa/.test(r5.lep[1].c)&&/mérföldkövek/.test(r5.lep[2].c)&&/Takarékosan/.test(r5.utolso),
    "5. a választás után a feladat kipipálva, és indul a „Stíluspont és képességfa” lecke: mindhárom kiemelés a valódi szakaszra mutat",r5);
  ok(r5.fa&&r5.lezart,"6. a képességfa megnyitása a 2. feladat — a szakasz 2/3-mal lezárul, jön a „Hosszú táv”",{fa:r5.fa,lezart:r5.lezart});
  /* 7. Kezdő út nélkül */
  const r7=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    kutLeckeZar();S.kut.mind=1;S.style=null;S.kut.lecke={};
    openStylePickFromReport();await varj(1200);
    return {lecke:_kutL&&_kutL.id,sorok:document.querySelectorAll("#hubStyleBody .stSzem").length};});
  ok(!r7.lecke&&r7.sorok===8,"7. Kezdő út nélkül nincs lecke, a három sor viszont minden kártyán ott van",r7);
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
