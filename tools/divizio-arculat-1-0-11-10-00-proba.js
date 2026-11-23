/* 🏔 1.0.11.10.00 — A DIVÍZIÓ ARCULATA (ligapiramis)
   KÉRÉS: „melyik divízióban jár a csapatunk, az legyen valahogy látványosan
   benne a kezelőfelületben. Akár egy plusz szín, egy ikon, egy sáv."
   Amit mér: 1. minden osztálynak saját színe/ikonja/rangneve (D6…D1, D0, D−k);
   2. a fejlécben az osztály-csip, a body.divOn a divízió színével; 3. a HUB
   divízió-sávja: ikon, név, rangnév, lépcső (a mostani kiemelve, a Run-cél
   jelölve); 4. osztályváltásra a szín és a sáv követi; 5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9261;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
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
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben, vágjunk/.test(x.textContent)).forEach(x=>x.click());});await p.waitForTimeout(600);
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
  const r=await p.evaluate(()=>{
    const o={};
    o.arc=[6,5,4,3,2,1,0,-1,-2].map(d=>{const A=pyrDivArculat(d);return [d,A.ic,A.r,A.c];});
    o.kul=new Set(o.arc.map(x=>x[3])).size;
    applyHeaderIdentity();renderHub();
    o.chip=($("hdrTeamSub").querySelector(".hdrDivChip")||{}).textContent;
    o.divOn=document.body.classList.contains("divOn");
    o.divC=document.body.style.getPropertyValue("--divC");
    const R=$("hubDivRibbon");
    o.lathato=!R.classList.contains("hide");
    o.nev=(R.querySelector(".dvNev")||{}).textContent;o.rang=(R.querySelector(".dvRang")||{}).textContent;
    o.most=(R.querySelector(".dvLep.most")||{}).textContent;o.cel=(R.querySelector(".dvLep.cel")||{}).textContent;
    o.lep=R.querySelectorAll(".dvLep").length;o.my=pyrMyDivId();o.celId=pyrRunGoalDivId();
    /* osztályváltás */
    const regi=S.pyr.my;S.pyr.my=1;applyHeaderIdentity();renderHub();
    o.d1={chip:($("hdrTeamSub").querySelector(".hdrDivChip")||{}).textContent,c:document.body.style.getPropertyValue("--divC"),
      most:(R.querySelector(".dvLep.most")||{}).textContent,al:(R.querySelector(".dvAl")||{}).textContent};
    S.pyr.my=regi;applyHeaderIdentity();renderHub();
    /* piramis nélkül */
    const P=S.pyr;S.pyr=null;updateOppRatingBadge();renderDivRibbon();
    o.ki={divOn:document.body.classList.contains("divOn"),rejtve:R.classList.contains("hide")};
    S.pyr=P;updateOppRatingBadge();
    return o;});
  ok(r.kul===9&&r.arc[3][1]==="⭐"&&r.arc[5][2]==="Arany"&&r.arc[7][1]==="🌌","1. minden osztálynak saját színe, ikonja, rangneve",r.arc);
  ok(r.chip===`⭐ D${r.my}`&&r.divOn&&r.divC==="#35d07f","2. a fejléc csipje és a body.divOn a divízió színével",{chip:r.chip,divOn:r.divOn,c:r.divC});
  ok(r.lathato&&/Élmezőny|osztály|liga|megyei/i.test(r.nev)&&r.rang==="Smaragd szint"&&r.most===`D${r.my}`&&r.cel===`D${r.celId}`&&r.lep===6,"3. a HUB divízió-sávja: név, rangnév, lépcső, Run-cél",r);
  ok(r.d1.chip==="🏆 D1"&&r.d1.c==="#ffd34d"&&r.d1.most==="D1"&&/csúcson/.test(r.d1.al),"4. osztályváltásra a szín és a sáv követi",r.d1);
  ok(r.ki.divOn===false&&r.ki.rejtve,"4b. piramis nélkül nincs divízió-szín és sáv",r.ki);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
