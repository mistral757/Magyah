/* 🗺️ 3.9.272 — ÉLŐ MECCSKÉP (F5) — élő mérés valódi meccsen.
   Amit néz:
     1. az első kezdőrúgásig rejtve; utána látszik, 11+11 pötty és a labda;
     2. meccs közben a labda mozog, a lendület-oszlopok és a fölény frissül;
     3. a lefújás után az idővonalon annyi gól-jel van, ahány gól esett;
     4. az ellenfél kiállítottja halvány lesz;
     5. összecsukható, és az állapot megmarad;
     6. nem húz véletlent; nincs oldalhiba.
   Használat: node tools/elo-meccskep-3-9-272-proba.js [kép-mappa] */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9216;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  /* egy valódi egyjátékos karrier (mentési zárral), szezonban, nyitott HUB-bal */
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
  await p.waitForTimeout(1500);   /* a nyitáskori összevont mentés is lefusson */


  const OUT=process.argv[2]||null;
  console.log("\n— 1. KEZDŐRÚGÁS ELŐTT ÉS UTÁN —");
  const elotte=await p.evaluate(()=>document.getElementById("elokep").classList.contains("hide"));
  ok(elotte,"az első kezdőrúgásig rejtve");
  /* a meccs indul, a mintavétel KÍVÜLRŐL megy (a kép is meccs közben készül:
     a lefújás után a játék másik képernyőre lép) */
  const m=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    window._ekTm=matchSpeedTickMs;matchSpeedTickMs=()=>220;window._ekSeb=matchSpeed;matchSpeed=0.5;
    try{utoLancVege();mEloTorol();}catch(e){}
    S.auto=false;S.lastMatch=null;playMatch();
    await varj(300);
    const el=document.getElementById("elokep");
    return {lathato:!el.classList.contains("hide"),mi:document.querySelectorAll("#ekMi .ekP").length,
      ok:document.querySelectorAll("#ekOk .ekP").length,labda:!!document.getElementById("ekLabda")};});
  const labdak=new Set();let mintak=0;
  for(let i=0;i<300;i++){
    await p.waitForTimeout(250);
    const r=await p.evaluate(()=>({v:!!S.lastMatch,l:document.getElementById("ekLabda").style.transform,
      oszlop:document.querySelectorAll("#ekLend rect[height]").length,fol:document.getElementById("ekBirTx").textContent}));
    if(r.v)break;
    labdak.add(r.l);mintak++;
    if(mintak===14){m.kozben={oszlop:r.oszlop,fol:r.fol};
      if(OUT){await p.evaluate(()=>{for(const id of ["guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
          /* a próbában a HUB áll elöl — a felvételhez a meccsképernyő jön előre */
          try{document.getElementById("scHub").classList.add("hide");document.getElementById("scSim").classList.remove("hide");}catch(e){}
          document.getElementById("elokep").scrollIntoView({block:"start"});});
        await p.waitForTimeout(400);const h=await p.$("#elokep");const bb=h&&await h.boundingBox();
        if(bb)await p.screenshot({path:OUT+"/elokep.png",clip:{x:0,y:Math.max(0,bb.y-150),width:430,height:Math.min(900,bb.height+420)}});}}}
  m.labdak=labdak.size;m.mintak=mintak;
  await p.waitForTimeout(400);
  Object.assign(m,await p.evaluate(()=>{matchSpeedTickMs=window._ekTm;matchSpeed=window._ekSeb;
    return {gf:S.lastMatch&&S.lastMatch.gf,ga:S.lastMatch&&S.lastMatch.ga,
      goljel:[...document.querySelectorAll("#ekLend text")].filter(t=>t.textContent==="⚽").length};}));
  ok(m.lathato&&m.mi===11&&m.ok===11&&m.labda,"a kezdőrúgás után: látszik, 11+11 pötty, labda",m);
  console.log("\n— 2. MECCS KÖZBEN —");
  ok(m.labdak>=4,"a labda mozog (különböző helyek)",{helyek:m.labdak,minta:m.mintak});
  ok(m.kozben&&m.kozben.oszlop>=1&&/%/.test(m.kozben.fol),"lendület-oszlopok és fölény",m.kozben);
  console.log("\n— 3. GÓL-JELEK —");
  ok(m.goljel===m.gf+m.ga,"annyi gól-jel, ahány gól",{jel:m.goljel,eredmeny:`${m.gf}:${m.ga}`});
  console.log("\n— 4. KIÁLLÍTÁS —");
  const k=await p.evaluate(()=>{const a=document.querySelectorAll("#ekOk .ekKi").length;
    ekEsemeny({t:"piros",side:"them",min:50,seq:999});
    return {elotte:a,utana:document.querySelectorAll("#ekOk .ekKi").length};});
  ok(k.utana===k.elotte+1,"az ellenfél kiállítottja halvány",k);

  console.log("\n— 5. ÖSSZECSUKÁS —");
  const c=await p.evaluate(()=>{const b=document.getElementById("ekCsuk");b.click();
    const r={rejtve:document.getElementById("ekTest").classList.contains("hide"),tarolva:localStorage.getItem(EK_KEY),aria:b.getAttribute("aria-expanded")};
    ekKezd();r.megmarad=document.getElementById("ekTest").classList.contains("hide");
    b.click();r.nyitva=!document.getElementById("ekTest").classList.contains("hide");return r;});
  ok(c.rejtve&&c.tarolva==="1"&&c.aria==="false","összecsukva, eltárolva",c);
  ok(c.megmarad&&c.nyitva,"a következő meccsen is csukva marad, és újra kinyitható",c);

  console.log("\n— 6. —");
  const v=await p.evaluate(()=>[ekKezd,ekEsemeny,ekLeptet,ekSajat,ekRajzSav,ekVel].some(f=>/Math\.random/.test(String(f))));
  ok(!v,"nem húz véletlent");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
