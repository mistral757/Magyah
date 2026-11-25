/* 🎬 1.0.12.11.00 — ÚJABB MENÜPONT-JELENETEK
   KIMONDOTT KÉRÉS: „Folytathatod a menüpont animációk projektet"
   Amit mér: a 13 új jelenet (edző, szerepek, meccserő, csúszkák, arculat,
   scout-fejlesztés, keretbővítés, összhang, klub-szemle, sztárpiac, eladás,
   figyelőlista, stábpiac) mind felépül: van felirata, nincs benne
   „undefined"/„NaN", mozog (WAAPI), és a figurás jelenetekben a mi
   játékosunk áll; a valódi menügombok elindítják a sajátjukat; nincs oldalhiba.
   Használat: node tools/menupont-jelenetek-1-0-12-11-00-proba.js  (KEP=1 → képek) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9612;
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
  const w=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{kutLeckeZar();}catch(e){}
    if(S.kut)S.kut.mind=1;try{guideSkipAll&&0;}catch(e){}openHubMidSeason();
    try{const g=$("guideTip");if(g)g.classList.add("hide");}catch(e){}});
  await w(600);
  const KEPDIR=process.env.KEPDIR||"/tmp/menupont-kepek";if(process.env.KEP)require("fs").mkdirSync(KEPDIR,{recursive:true});
  const JEL=[["edzo","jsavEdzo"],["szerepek","jsavSzerepek"],["meccsero","jsavMeccsero"],["csuszka","jsavCsuszka"],["arculat","jsavArculat"],
    ["scoutfejl","jsavScoutFejl"],["keretbov","jsavKeretBov"],["osszhang","jsavOsszhang"],["klubszemle","jsavKlubSzemle"],["sztarpiac","jsavSztarpiac"],
    ["eladas","jsavEladas"],["figyelo","jsavFigyelo"],["stabpiac","jsavStabpiac"]];
  const eredm={};
  for(const [k,fn] of JEL){
    const r=await p.evaluate(async([k,fn])=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
      _jsavUtolso[k]=0;jsavZar(true);const ok=jsavMutat(k,window[fn]);await w(900);const el=$("jsav");
      if(!el)return {ok,nincs:true};
      const xi=slots.filter(s=>s.player).map(s=>shortName(s.player.n));
      return {ok,szoveg:el.querySelector(".jsBub").textContent.slice(0,90),hibas:/undefined|NaN/.test(el.innerHTML),
        anim:el.getAnimations({subtree:true}).length,kep:el.querySelectorAll(".jsSzin image").length,sajat:xi.some(n=>el.textContent.includes(n))};},[k,fn]);
    eredm[k]=r;
    if(process.env.KEP)await p.screenshot({path:`${KEPDIR}/${k}.png`,clip:{x:0,y:0,width:430,height:220}});}
  ok(Object.values(eredm).every(x=>x.ok&&x.szoveg&&x.szoveg.length>20),"mind a 13 jelenet megjelenik, felirattal",eredm);
  ok(Object.values(eredm).every(x=>!x.hibas),"egyikben sincs „undefined” vagy „NaN”",Object.keys(eredm).filter(k=>eredm[k].hibas));
  ok(Object.values(eredm).every(x=>x.anim>=1),"mind mozog",Object.fromEntries(Object.entries(eredm).map(([k,v])=>[k,v.anim])));
  const fig=["meccsero","csuszka","arculat","keretbov","osszhang","klubszemle","sztarpiac","eladas","edzo","szerepek"];
  ok(fig.every(k=>eredm[k].kep>=1),"a figurás jelenetekben ott a mi játékosunk (kivágott figura)",fig.map(k=>k+":"+eredm[k].kep));
  const gomb=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    for(const [id,k] of [["hubCoachBtn","edzo"],["hubRolesBtn","szerepek"],["hubMeccseroBtn","meccsero"],["hubDialBtn","csuszka"],["hubIdentityBtn","arculat"],["hubBondTrainBtn","osszhang"],["hubStaffMarketBtn","stabpiac"]]){
      Object.keys(_jsavUtolso).forEach(x=>_jsavUtolso[x]=0);jsavZar(true);
      try{openHubMidSeason();}catch(e){}
      const b=$(id);if(!b){o[k]="nincs gomb";continue;}
      /* a korai karrierben néhány gomb zárolt (disabled) — a jelenet bekötését mérjük, nem a zárat */
      b.disabled=false;b.classList.remove("locked","kutZar");
      try{b.click();}catch(e){o[k]="hiba: "+e;continue;}
      await w(250);const el=$("jsav");o[k]=el?el.dataset.k:null;
      document.querySelectorAll(".modal,.hubPicker").forEach(x=>{});
      try{["hubCoachPicker","hubRolesPicker"].forEach(i=>$(i)&&$(i).classList.add("hide"));}catch(e){}
      try{document.querySelectorAll("[id$='Modal']").forEach(m=>m.classList.add("hide"));}catch(e){}}
    jsavZar(true);return o;});
  ok(Object.entries(gomb).every(([k,v])=>v===k),"a valódi menügombok a saját jelenetüket indítják",gomb);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
