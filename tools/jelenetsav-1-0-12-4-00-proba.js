/* 🎬 1.0.12.4.00 — A FELÜLETI JELENETSÁV + a kezdőlap két útja + a stadion felső sávja
   KIMONDOTT KÉRÉSEK (🐞 jegyzetek jmwv3s4ux705r, jmwv3m7psf3xg, jmwv3iuds7rhq).
   Amit mér:
     1. a kezdőlap: 01 „Egyedül játszom”, 02 „Gyere 1v1!” (ez a párharc-szobát nyitja), a dinamikus rejtve;
     2. a jelenetsáv az infópultnál, az edzéstervnél, a vásárlásnál és a menetrendnél megjelenik,
        a saját jelenetével (arc a pult mögött, élő szöveg); álló nézetben ≤ 33%, fekvőben ≤ 25%;
     3. koppintásra azonnal eltűnik, magától 10 mp után; 90 mp-en belül nem ismétlődik;
     4. a „kikapcsolom” és az Arculat → Animációk kapcsolója kikapcsolja (és vissza);
     5. a stadion-nézetben a felső sáv látszik, a pálya alatta kezdődik;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9461;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  const w=ms=>p.waitForTimeout(ms);
  const SP=process.env.SP||"/tmp";
  /* 1. kezdőlap */
  const k=await p.evaluate(()=>{const ws=[...document.querySelectorAll("#heWaySect .heWay")];
    let hivta=0;const d=document.getElementById("mpDuelBtn");const o=d.onclick;d.onclick=()=>{hivta++;};
    const b=document.getElementById("heWay1v1");const reg=d.click;d.click=()=>{hivta++;};b.click();d.click=reg;d.onclick=o;
    return {cimek:ws.filter(x=>!x.classList.contains("hide")).map(x=>x.querySelector("b").textContent),
      dynRejtve:document.getElementById("heWayDyn").classList.contains("hide"),hivta};});
  ok(k.cimek[0]==="Egyedül játszom"&&k.cimek[1]==="Gyere 1v1!"&&k.cimek.length===2,"kezdőlap: 01 Egyedül játszom · 02 Gyere 1v1!",k);
  ok(k.dynRejtve&&k.hivta===1,"a dinamikus rejtve, a 1v1 a párharc-szobát nyitja",k);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
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
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  const sav=()=>p.evaluate(()=>{const e=document.getElementById("jsav");if(!e)return null;const r=e.getBoundingClientRect();
    return {k:e.dataset.k,h:r.height,top:r.top,vh:innerHeight,szoveg:e.querySelector(".jsBub").textContent,arc:e.querySelectorAll(".jsSzin svg").length,
      kint:e.classList.contains("ki")};});
  const jelenetek=[["info","hubInfoShow('set')"],["edzes","openTrainingPlanner()"],["vasar","$('hubBuyBtn').onclick()"],["menetrend","$('scheduleViewBtn').click()"]];
  for(const [kul,nyit] of jelenetek){
    await p.evaluate(n=>{try{document.querySelectorAll('.modal:not(.hide)').forEach(m=>m.classList.add('hide'));}catch(e){}
      try{closeTrainingPlanner();}catch(e){}try{const tw=document.getElementById('scTransfer');if(tw)tw.classList.add('hide');}catch(e){}
      try{openHubMidSeason();}catch(e){}jsavZar(true);eval(n);},nyit);
    await w(700);
    const s=await sav();
    ok(s&&s.k===kul&&s.arc>=(kul==="menetrend"?0:1)&&s.szoveg.length>20,`${kul}: a sáv megjelent a jelenetével`,s);
    ok(s&&s.h<=s.vh*0.33+1&&s.top===0,`${kul}: álló nézetben fent, ≤ 33% (${s&&Math.round(s.h)} / ${s&&s.vh})`);
    await p.screenshot({path:`${SP}/jsav-${kul}.png`});}
  /* 3. koppintás, ismétlés-gát, 10 mp */
  await p.evaluate(()=>document.querySelector("#jsav .jsBub").click());await w(450);
  ok(!(await sav()),"koppintásra eltűnik");
  const ism=await p.evaluate(()=>jsavMutat("menetrend",jsavMenetrend));
  ok(ism===false,"90 mp-en belül ugyanaz a jelenet nem jön újra");
  await p.evaluate(()=>{_jsavUtolso.info=0;hubInfoShow("set");});await w(400);
  ok(!!(await sav()),"az infópult újra (a gát lejárta után)");
  await w(10200);
  ok(!(await sav()),"magától eltűnik 10 mp után");
  /* fekvő */
  await p.setViewportSize({width:844,height:390});
  await p.evaluate(()=>{_jsavUtolso.edzes=0;closeTrainingPlanner();openTrainingPlanner();});await w(700);
  const f=await sav();
  ok(f&&f.h<=f.vh*0.25+1,`fekvőben ≤ 25% (${f&&Math.round(f.h)} / ${f&&f.vh})`,f);
  await p.screenshot({path:`${SP}/jsav-fekvo.png`});
  /* 4. kikapcsolás */
  const ki=await p.evaluate(async()=>{document.querySelector('#jsav [data-jsav="ki"]').click();await new Promise(r=>setTimeout(r,100));
    _jsavUtolso.info=0;const ujra=jsavMutat("info",jsavInfopult);
    const html=identAnimHtml();jsavAllit(true);_jsavUtolso.vasar=0;const vissza=jsavMutat("vasar",jsavScout);jsavZar(true);
    return {ls:localStorage.getItem("magyah_jsav30_0"),van:!!document.getElementById("jsav"),ujra,kapcs:/data-identjsav="ki"/.test(html),vissza};});
  ok(ki.ujra===false&&ki.kapcs&&ki.vissza===true&&ki.ls==="1","„kikapcsolom” leállít, az Arculat kapcsolója visszakapcsol",ki);
  /* 5. stadion felső sáv */
  const st=await p.evaluate(async()=>{closeTrainingPlanner();document.body.classList.add("stadium");
    const h=document.querySelector("body>header"),cs=getComputedStyle(h),sc=document.getElementById("scSim");
    const r={disp:cs.display,pos:cs.position,hh:h.getBoundingClientRect().height,scTop:getComputedStyle(sc).top};
    document.body.classList.remove("stadium");return r;});
  ok(st.disp==="flex"&&st.pos==="fixed"&&st.hh<=40&&st.scTop==="38px","stadion: a felső sáv látszik, a pálya alatta",st);
  ok(errs.length===0,"nincs oldalhiba",errs);
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
