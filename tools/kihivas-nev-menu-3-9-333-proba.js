/* 🔁👆 3.9.333 — A FÉLBEHAGYOTT KIHÍVÁS-AJÁNLAT ÉS A JÁTÉKOS-NÉV MENÜ.

   KÉRÉSEK: 1. „Ha kihívásos képernyőn vagyunk, akkor előfordul, hogy
   frissítés után nem visz oda vissza a gép, azaz konkrétan elveszhet a
   kihívás vállalás lehetősége." 2. „… valamelyik érintett játékos nevére
   rákattintva […] először egy legördülő menü jön, amin két opció: első: őt
   választom, második: ugrás a játékos adatlapjára. És akkor akár ott helyben
   is beugorhat a játékos adatlap."

   Amit mér:
     1. az idénynyitó ajánlat a mentésbe kerül (S.chKinal), betöltéskor
        UGYANAZOKKAL nyílik vissza, a vállalás megmarad, a „Kész" lezárja és
        továbbvisz; a mentés a párharc-nap és a Run-összevetés adatait is viszi;
     2. a skill-választóban a név koppintható; a névre koppintva menü (Őt
        választom / Adatlap); az „Őt választom" a régi választást futtatja;
        az adatlap betekintőként, a döntés fölött nyílik, a HUB
        újrarajzolása nem zárja be; a név melletti koppintás a régi út;
     3. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9333;
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
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(500);

  console.log("\n— 1. a félbehagyott kihívás-ajánlat —");
  const t1=await p.evaluate(async()=>{
    const o={};
    let tovabb=0;
    showChallengeOffers("long",5,()=>{tovabb++;},false,{hubBack:true,kind:"kov"});
    o.van=!!S.chKinal;o.kind=S.chKinal&&S.chKinal.kind;o.db=(S.chKinal&&S.chKinal.ajanlat.length)||0;
    const leirasok=_challengeOffers.map(c=>c.desc);
    /* egyet elvállalunk (megerősítés nélkül, ahogy a gomb onYes ága) */
    const ch=_challengeOffers[0];acceptChallenge(ch);ch._taken=true;saveGame();
    /* a mentés viszi */
    const d=loadSavedGame();o.mentve=!!(d&&d.S&&d.S.chKinal&&d.S.chKinal.ajanlat.length===o.db);
    o.taken=!!(d&&d.S&&d.S.chKinal&&d.S.chKinal.ajanlat[0]._taken);
    S.svPh={v:1,m:{"1:1":{gf:1,ga:0}},merleg:{w:1,d:0,l:0,gf:1,ga:0,p:3}};S.svRun={v:1,r0:{1:2},sajat:{},tars:{},szamolt:{},gyoz:{w:0,d:0,l:0}};saveGame();
    const d2=loadSavedGame();o.svMentve=!!(d2&&d2.S&&d2.S.svPh&&d2.S.svPh.merleg.p===3&&d2.S.svRun);
    /* „frissítés": a memóriabeli lista eltűnik, a betöltés visszahozza */
    _challengeOffers=[];_chOfferCtx=null;$("scWindow").classList.add("hide");
    S.chKinal=JSON.parse(JSON.stringify(d.S.chKinal));
    chKinalFolytatas=()=>()=>{tovabb++;};   /* a folytatás (startNextCareerSeason) helyett számláló */
    o.nyit=chKinalBetolteskor();
    o.lathato=!$("scWindow").classList.contains("hide");
    o.ugyanaz=JSON.stringify(_challengeOffers.map(c=>c.desc))===JSON.stringify(leirasok);
    o.kartya=$("twBody").querySelectorAll(".chCard").length;
    const kesz=[...$("twActions").querySelectorAll("button")].find(b=>/Kész/.test(b.textContent));
    if(kesz)kesz.click();
    await new Promise(r=>setTimeout(r,300));
    o.tovabb=tovabb;o.torolve=S.chKinal==null;
    return o;});
  ok(t1.van&&t1.kind==="kov"&&t1.db>=3&&t1.mentve&&t1.taken,"az idénynyitó ajánlat a mentésbe kerül, a vállalás jelzőjével",t1);
  ok(t1.svMentve,"a mentés a párharc-nap és a Run-összevetés adatait is viszi (3.9.331 hiánya pótolva)",t1.svMentve);
  ok(t1.nyit&&t1.lathato&&t1.ugyanaz&&t1.kartya===t1.db-1,"betöltéskor ugyanazokkal az ajánlatokkal nyílik vissza, az elvállalt kimarad a listából",t1);
  ok(t1.tovabb===1&&t1.torolve,"a „Kész — tovább” lezárja (a mentett ajánlat törlődik) és továbbvisz",t1);

  console.log("\n— 2. a játékos-név menü —");
  const nev=await p.evaluate(()=>{
    ["scWindow","scHub","scSim"].forEach(id=>$(id)&&$(id).classList.add("hide"));
    {const gt=$("guideTip");if(gt)gt.remove();}guideFire=()=>{};
    const sk=$("scSkill");sk.classList.remove("hide");$("skillAssignWrap").classList.remove("hide");
    const box=$("skillAssignList");box.innerHTML="";
    const p0=slots.find(s=>s.player).player;window._valasztva=0;
    const row=document.createElement("div");row.className="prow";row.id="probaSor";
    row.innerHTML=`<span class="pos">CS</span><span class="main"><div class="nm">${esc(fullName(p0.n))}</div><div class="trait">koppints a kiválasztáshoz</div></span>`;
    row.onclick=()=>{window._valasztva++;};
    box.appendChild(row);
    return {n:p0.n,f:fullName(p0.n)};});
  await p.waitForTimeout(300);
  const link=await p.evaluate(()=>{const s=document.querySelector("#probaSor .jatLink");return s?{jat:s.getAttribute("data-jat"),tx:s.textContent}:null;});
  ok(link&&link.jat===nev.n&&link.tx===nev.f,"a skill-választóban a név magától koppintható lesz",link);
  await p.click("#probaSor .jatLink");
  const m1=await p.evaluate(()=>({menu:!!document.querySelector(".jatMenu"),gombok:[...document.querySelectorAll(".jatMenu button")].map(b=>b.textContent),val:window._valasztva}));
  ok(m1.menu&&m1.gombok.length===2&&/Őt választom/.test(m1.gombok[0])&&/adatlap/i.test(m1.gombok[1])&&m1.val===0,"a névre koppintva menü nyílik (Őt választom / Adatlap), a választás még nem fut le",m1);
  await p.click(".jatMenu [data-jm='val']");
  const m2=await p.evaluate(()=>({val:window._valasztva,menu:!!document.querySelector(".jatMenu")}));
  ok(m2.val===1&&!m2.menu,"az „Őt választom” a régi választást futtatja",m2);
  /* 🔒 3.9.339 — idegen játékos (nem a mi keretünk) neve nem lesz link, és
     az adatlapja sem nyílik: a scout POT-korlátját nem kerülheti meg */
  const idegen=await p.evaluate(async()=>{
    const sajat=new Set((hubRosterEntries()||[]).map(x=>x.p&&x.p.n));
    const n=Object.keys(careerPool).find(k=>!sajat.has(k)&&fullName(k).length>=6);
    const row=document.createElement("div");row.className="prow";row.id="probaIdegen";
    row.innerHTML=`<span class="main"><div class="nm">${esc(fullName(n))}</div></span>`;
    row.onclick=()=>{window._idegenKatt=(window._idegenKatt||0)+1;};
    $("skillAssignList").appendChild(row);
    _jatNevek=null;
    await new Promise(r=>setTimeout(r,300));
    const o={link:!!document.querySelector("#probaIdegen .jatLink"),peek:plSheetPeek(n),nyitva:plSheetOpen()};
    return o;});
  ok(!idegen.link&&idegen.peek===false&&!idegen.nyitva,"idegen játékos neve nem koppintható, az adatlapja nem nyílik (a scout POT-korlátja áll)",idegen);
  await p.click("#probaSor .jatLink");await p.click(".jatMenu [data-jm='lap']");
  const m3=await p.evaluate(()=>{const b=$("plSheet");const o={nyitva:plSheetOpen(),peek:b.classList.contains("plPeek"),
    z:getComputedStyle(b).zIndex,nev:($("plSheetHead").textContent||"").slice(0,80),megjegyzes:!!b.querySelector(".plPeekNote"),
    skillLatszik:!$("scSkill").classList.contains("hide")};
    try{renderHub();}catch(e){}o.renderUtan=plSheetOpen();
    const gomb=b.querySelector(".plSheetBody button");o.gombZarva=gomb?getComputedStyle(gomb).pointerEvents==="none":true;
    plSheetClose();o.zarva=!plSheetOpen()&&!b.classList.contains("plPeek");o.val=window._valasztva;return o;});
  ok(m3.nyitva&&m3.peek&&+m3.z>=9000&&m3.megjegyzes&&m3.skillLatszik&&m3.gombZarva,"az adatlap helyben, a döntés fölött nyílik (betekintő: a műveletek zárva)",m3);
  ok(m3.renderUtan&&m3.zarva&&m3.val===1,"a HUB újrarajzolása nem zárja be; bezárva a döntés érintetlenül vár",m3);
  await p.click("#probaSor .trait");
  const m4=await p.evaluate(()=>({val:window._valasztva,menu:!!document.querySelector(".jatMenu")}));
  ok(m4.val===2&&!m4.menu,"a sor többi részén a koppintás a régi út (azonnal választ)",m4);
  const m5=await p.evaluate(()=>{const s=document.querySelector("#probaSor .jatLink");s.click();return {val:window._valasztva,menu:!!document.querySelector(".jatMenu")};});
  ok(m5.val===3&&!m5.menu,"a programból indított kattintás (pl. a meccsről meccsre lánc) a régi úton megy",m5);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
