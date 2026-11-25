/* 🎬🧍 1.0.12.8.00 — FIGURÁS JELENETEK ÉS A TÉTLEN JÁTÉKOSOK
   KIMONDOTT KÉRÉS: „Az edzős az kicsit furi. Lehetne kidolgozottabb, jobban hasonlítson a meccs minőségre, és
   látszódhat, hogy konkrétan a mi egyik játékosunk van ott. Az infópultnál a karakter háttere ne legyen ott mint
   egy ablak […] Idle állapotban ne a kis dekázó kisfiú jöjjön be, hanem valamelyik játékosunk/játékosaink […]"
   Amit mér:
     1. edzésterv: meccsfigura (kivágott arc-kép) a mi kezdőnk közül, a buborék a nevét mondja; mozog (WAAPI);
     2. infópult: a recepciós háttér nélküli (nincs arc-háttér téglalap);
     3. az új jelenetek (kapitány, taktika, akadémia) megjelennek, a kapitányé a valódi kapitány nevével;
     4. tétlenség: a HUB-on a jelenet a mi játékosainkkal (kivágott figura), a buborékban a nevük;
        érintésre azonnal eltűnik; a pixel téma kisfiúja ilyenkor nem jön; a kapcsoló kikapcsolja;
     + nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9487;
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
  const j=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    const xi=slots.filter(s=>s.player).map(s=>shortName(s.player.n));
    _jsavUtolso.edzes=0;jsavZar(true);jsavMutat("edzes",jsavEdzes);await w(500);
    const e=$("jsav");o.edz={kep:e.querySelectorAll(".jsSzin image").length,nev:xi.some(n=>e.textContent.includes(n)),anim:e.getAnimations({subtree:true}).length};
    const I=jsavInfopult(jsavSzin());o.infoBg=/fill="#2c3442"/.test(I.svg);
    o.uj={};for(const [k,fn] of [["kapitany",jsavKapitany],["taktika",jsavTaktika],["akademia",jsavAkademia]]){_jsavUtolso[k]=0;jsavZar(true);
      const ok=jsavMutat(k,fn);await w(300);const el=$("jsav");o.uj[k]={ok,szoveg:el?el.querySelector(".jsBub").textContent:"",kep:el?el.querySelectorAll(".jsSzin image").length:0};}
    o.kapNev=shortName(slots[captainIdx].player.n);jsavZar(true);return o;});
  ok(j.edz.kep>=2&&j.edz.nev&&j.edz.anim>=3,"1. edzésterv: meccsfigurák, a mi játékosunk nevével, mozgással",j.edz);
  ok(!j.infoBg,"2. infópult: a recepciós háttér nélküli, kivágott");
  ok(Object.values(j.uj).every(x=>x.ok&&x.kep>=1)&&j.uj.kapitany.szoveg.includes(j.kapNev),"3. kapitány, taktika, akadémia jelenet (a kapitány a valódi kapitány)",j.uj);
  const t=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    o.lehet=oeLehet();
    const R=Math.random;Math.random=()=>0.5;const tok=++_oeTok;let hiba=null;oeJelenet(tok).catch(e=>{hiba=String(e);});setTimeout(()=>{Math.random=R;},40);
    await w(3600);
    const el=$("oeIdle");o.el=!!el;o.kep=el?el.querySelectorAll("image").length:0;
    const bub=el?[...el.querySelectorAll(".oeBub.on")].map(b=>b.textContent).join(" "):"";o.bub=bub;
    const nevek=currentRoster().filter(Boolean).map(p=>shortName(p.n));o.nev=nevek.some(n=>bub.includes(n));
    o.bennt=el?(()=>{const r=el.querySelector(".oeBub.on");if(!r)return false;const b=r.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.top>=0;})():false;
    /* a pixel téma kisfiúja nem jön, amíg mi futunk */
    const _p=pxLifeOn;window.pxLifeOn=()=>true;_pxIdleOn=true;pxRunPass();o.kisfiu=!!document.querySelector(".pxRunner");window.pxLifeOn=_p;_pxIdleOn=false;clearTimeout(_pxRunT);
    document.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));await w(500);o.eltunt=!$("oeIdle");o.hiba=hiba;
    jsavAllit(false);o.ki=!oeLehet();jsavAllit(true);
    return o;});
  ok(t.lehet&&t.el&&t.kep>=1&&t.nev,"4. tétlenség: a HUB-on a saját játékosunk kivágott figurával, a buborékban a neve",t);
  ok(t.bennt,"4. a buborék a képernyőn belül marad",t);
  ok(!t.kisfiu,"4. a pixel téma 8 bites kisfiúja ilyenkor nem jön");
  ok(t.eltunt&&t.ki,"4. érintésre azonnal eltűnik; a jelenet-kapcsoló kikapcsolja",t);
  ok(errs.length===0,"nincs oldalhiba",errs);
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
