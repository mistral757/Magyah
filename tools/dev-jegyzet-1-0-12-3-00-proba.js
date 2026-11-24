/* 🐞 1.0.12.3.00 — FEJLESZTŐI JEGYZETEK
   KIMONDOTT KÉRÉS: „ha a szokásos helyen lent a profil alján beírom: »szutykos fejlesztő vagyok«,
   akkor felkerül a fenti sávba minden létező képernyőn egy bug jel […] Készít magának egy feljegyzést
   arról, hogy melyik felületen lett megnyomva […] kis jegyzet toolt […] típus […] jegyzetfüzetkébe
   […] felnyomnánk firebase-n keresztül a repóba"
   Amit mér:
     1. a kulcsszó (ékezettel és anélkül is) a profil rejtett mezőjében bekapcsolja a módot;
     2. a 🐞 gomb minden képernyőn látszik és felül van (HUB, panel, meccsképernyő, felugró ablak fölött);
     3. a gomb a megnyomás pillanatában rögzíti a helyet (a nyitott panel címével), a jegyzet-ablak
        típuslistája csoportos, a szöveg kötelező; a mentés a helyi sorba kerül (hálózat nélkül
        „sorban"), a gombon számláló;
     4. a lehúzó szkript (tools/devjegyzet/lehuz.js --fajl) a jegyzetből JEGYZETEK.md-t és
        jegyzetek.json-t készít a hellyel, típussal és a szöveggel;
     5. a mód kikapcsolható, a gomb eltűnik;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9455;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
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
  const {execFileSync}=require("child_process");
  const lathato=async()=>p.evaluate(()=>{const b=document.getElementById("devBugBtn");if(!b)return false;const r=b.getBoundingClientRect();
    const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!(e&&(e===b||b.contains(e)));});
  const r1=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.kut.lecke=Object.assign(S.kut.lecke||{},{elso11:1});try{kutLeckeZar();}catch(e){}
    renderProfileModal();const i=$("huNamePass");i.value="Szutykos FEJLESZTO vagyok";i.dispatchEvent(new Event("input"));await w(200);
    return {on:devOn(),gomb:!!$("devBugBtn"),ki:!!$("devKi")};});
  ok(r1.on&&r1.gomb&&r1.ki,"1. a kulcsszó (ékezet nélkül is) bekapcsolja a fejlesztői módot, a profilban kikapcsoló gomb",r1);
  const hol={};
  await p.evaluate(()=>{$("scHub").classList.remove("hide");renderHub();});await p.waitForTimeout(300);hol.hub=await lathato();
  await p.evaluate(()=>{S.trainingChangeUsed=false;openTrainingPlanner();});await p.waitForTimeout(400);hol.panel=await lathato();
  await p.evaluate(()=>{askConfirm({title:"Próba-ablak",html:"x"});});await p.waitForTimeout(200);hol.ablak=await lathato();
  await p.evaluate(()=>{$("hubTacticConfirmNo").click();});
  ok(hol.hub&&hol.panel&&hol.ablak,"2. a 🐞 gomb a HUB-on, egy panelen és egy felugró ablak fölött is látható és koppintható",hol);
  const r3=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    $("devBugBtn").click();await w(200);
    const m=$("devJegyzetModal"),o={nyitva:!!(m&&!m.classList.contains("hide")),hely:(m.querySelector(".djHely")||{}).textContent||"",
      csoport:m.querySelectorAll("#djTipus optgroup").length,opciok:m.querySelectorAll("#djTipus option").length};
    m.querySelector('[data-dj="kuld"]').click();await w(100);o.uresTilt=devjSor().length===0&&/Írj/.test($("djUzenet").textContent);
    $("djTipus").value="tanit-takar";m.querySelector('[data-prio="magas"]').click();
    $("djSzoveg").value="A lecke lapja takarja az Edzésterv rögzítése gombot.";
    m.querySelector('[data-dj="kuld"]').click();await w(2500);
    const s=devjSor();o.db=s.length;o.j=s[0]&&{tipus:s[0].tipus,tipusNev:s[0].tipusNev,prio:s[0].prio,fo:s[0].hely.fo,panel:s[0].hely.panel,leiras:s[0].hely.leiras,fent:!!s[0].fent};
    o.szamlalo=$("devBugBtn").dataset.n;o.export={devjegyzet:{"tesztUid":{[s[0].id]:{v:1,at:s[0].at,app:s[0].app,d:JSON.stringify(s[0])}}}};
    return o;});
  ok(r3.nyitva&&/Edzésterv/.test(r3.hely)&&r3.csoport===2&&r3.opciok>=30&&r3.uresTilt&&r3.db===1&&r3.j.tipus==="tanit-takar"&&r3.j.prio==="magas"
     &&r3.j.fo.includes("scWindow")&&/Edzésterv/.test(r3.j.panel||"")&&!r3.j.fent&&r3.szamlalo==="1",
    "3. a hely a koppintáskor rögzül (a panel címével), csoportos típuslista, kötelező szöveg, helyi sor (hálózat nélkül „sorban”), számláló a gombon",
    Object.assign({},r3,{export:undefined}));
  const SP=require("os").tmpdir()+"/devj-proba-"+process.pid;fs.mkdirSync(SP,{recursive:true});
  fs.writeFileSync(SP+"/export.json",JSON.stringify(r3.export));
  let r4={};try{execFileSync(process.execPath,[path.join(ROOT,"tools/devjegyzet/lehuz.js"),"--fajl",SP+"/export.json","--ki",SP+"/ki"],{encoding:"utf8"});
    const md=fs.readFileSync(SP+"/ki/JEGYZETEK.md","utf8"),js=JSON.parse(fs.readFileSync(SP+"/ki/jegyzetek.json","utf8"));
    r4={md:/takarja az Edzésterv/.test(md)&&/Edzésterv/.test(md)&&/sürgős/.test(md)&&/scWindow/.test(md),db:js.db,szerzo:/^u_/.test(js.jegyzetek[0].szerzo)};}
  catch(e){r4={hiba:String(e.message).slice(0,200)};}
  ok(r4.md&&r4.db===1&&r4.szerzo,"4. a lehúzó szkript JEGYZETEK.md-t és jegyzetek.json-t készít (hely, típus, fontosság, szöveg, szerzői kivonat)",r4);
  const r5=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));$("devJegyzetModal").classList.add("hide");
    closeTrainingPlanner();renderProfileModal();$("devKi").click();await w(100);return {on:devOn(),gomb:!!$("devBugBtn")};});
  ok(!r5.on&&!r5.gomb,"5. a mód kikapcsolható, a gomb eltűnik",r5);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
