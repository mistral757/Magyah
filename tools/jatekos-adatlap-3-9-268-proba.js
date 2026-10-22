/* 🧑 3.9.268 — A JÁTÉKOS-ADATLAP ABLAKA (F2) — élő mérés egy valódi karrierben.
   Amit néz:
     1. sorra koppintva az ablak nyílik (nem a lenyíló), a fejlécben arckép,
        név, Rating; a törzs a régi lap (szekciókkal); nincs szinkron mentés és
        teljes újrarajzolás,
     2. ‹ › lapozás a keret következő emberére, körbe,
     3. Sima/Pixel váltó a fejlécen,
     4. a renderHub nyitva hagyja és frissíti (pl. egy szerepváltás után),
     5. a posztcsere-választó előtt az ablak bezárul, a választó látszik,
     6. a megerősítő kérdés az ablak FÖLÖTT ül,
     7. a vissza gomb (gameBackStep) és a háttérre koppintás zár,
     8. a Beállításokban kikapcsolva a régi lenyíló jön vissza,
     9. nincs oldalhiba.
   Használat: node tools/jatekos-adatlap-3-9-268-proba.js [kép-mappa] */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9213;
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
  const lap=()=>p.evaluate(()=>{const b=document.getElementById("plSheet");
    return {nyitva:!!b&&!b.classList.contains("hide"),kulcs:b&&b.getAttribute("data-key"),hk:hubExpandedKey,
      idx:(document.getElementById("plSheetIdx")||{}).textContent};});
  console.log("\n— 1. KOPPINTÁS → ABLAK —");
  const k=await p.evaluate(()=>{
    let ment=0,rajz=0;const _sg=saveGame,_rh=renderHub;
    saveGame=function(){ment++;return _sg.apply(this,arguments);};
    renderHub=function(){rajz++;return _rh.apply(this,arguments);};
    const r={};
    try{
      const row=document.querySelectorAll("#hubRoster [data-hubkey]")[2];
      r.key=row.getAttribute("data-hubkey");
      row.click();
      const b=document.getElementById("plSheet");
      r.nyitva=!b.classList.contains("hide");r.kulcs=b.getAttribute("data-key");
      r.inline=document.querySelectorAll("#hubRoster .hubDetail").length;
      r.arc=!!b.querySelector(".plHead img.faceImg");
      r.nev=(b.querySelector("#plSheetName")||{}).textContent||"";
      r.ovr=(b.querySelector(".plOvr b")||{}).textContent||"";
      r.szekcio=b.querySelectorAll("#plSheetBody .hubDetail details.hdSec").length;
      r.gombok=b.querySelectorAll("#plSheetBody .hubDetail button").length;
      r.ment=ment;r.rajz=rajz;
    }finally{saveGame=_sg;renderHub=_rh;}
    return r;});
  ok(k.nyitva&&k.kulcs===k.key,"a koppintott játékos lapja nyílik ablakban",k);
  ok(k.inline===0,"a keretlistában nincs lenyíló",k.inline);
  ok(k.arc&&k.nev.length>2&&+k.ovr>0,"fejléc: arckép, név, Rating",{nev:k.nev,ovr:k.ovr});
  ok(k.szekcio>=3&&k.gombok>=2,"a törzs a régi lap: szekciók és gombok",{szekcio:k.szekcio,gombok:k.gombok});
  ok(k.ment===0&&k.rajz===0,"nincs szinkron mentés, nincs teljes újrarajzolás",{ment:k.ment,rajz:k.rajz});
  const foto=async nev=>{if(!OUT)return;
    await p.evaluate(()=>{for(let i=0;i<6;i++){const x=document.getElementById("guideTipOk");if(x&&x.offsetParent)x.click();}});
    await p.waitForTimeout(450);await p.screenshot({path:OUT+"/"+nev+".png"});};
  await foto("adatlap-sima");

  console.log("\n— 2. LAPOZÁS —");
  const l0=await lap();
  await p.click("#plSheetNext");const l1=await lap();
  await p.click("#plSheetPrev");const l2=await lap();
  const n=await p.evaluate(()=>hubRosterEntries().length);
  for(let i=0;i<n;i++)await p.click("#plSheetNext");
  const l3=await lap();
  ok(l1.nyitva&&l1.kulcs!==l0.kulcs&&l1.hk===l1.kulcs,"› a következő emberre lapoz (és a jelölés követi)",[l0.idx,l1.idx]);
  ok(l2.kulcs===l0.kulcs,"‹ vissza",l2.idx);
  ok(l3.kulcs===l0.kulcs,"körbe ér a keret végén",{n,idx:l3.idx});

  console.log("\n— 3. SIMA / PIXEL —");
  await p.click('#plSheetHead [data-fs="pix"]');await p.waitForTimeout(400);
  const fsv=await p.evaluate(()=>({st:faceStilus(),pix:!!document.querySelector("#plSheetHead img.faceImg.pix"),
    nyom:document.querySelector('#plSheetHead [data-fs="pix"]').getAttribute("aria-pressed")}));
  ok(fsv.st==="pix"&&fsv.pix&&fsv.nyom==="true","a Pixel gomb pixeles arcot ad",fsv);
  await foto("adatlap-pixel");
  if(OUT){await p.evaluate(()=>{try{applyTheme("dark");}catch(e){}});await p.click('#plSheetHead [data-fs="sima"]');await foto("adatlap-sotet");
    await p.evaluate(()=>{try{applyTheme("pixel");}catch(e){}faceStilusSet("auto");plSheetRender(_plSheetLoc);});await foto("adatlap-pixeltema");}
  await p.click('#plSheetHead [data-fs="sima"]');

  console.log("\n— 3b. 🎨 KINÉZET (3.9.281) —");
  await p.click('#plSheetHead [data-fed]');await p.waitForTimeout(300);
  const fed=await p.evaluate(()=>{const m=document.getElementById("fedModal");
    const o={nyitva:!!m&&!m.classList.contains("hide"),reteg:_fed&&_fed.scope,ket:document.querySelectorAll("#fedRetegek [data-fr]").length};
    const n=_fed.nev,src0=document.querySelector("#plSheetHead img.faceImg").src;
    m.querySelector('[data-fk="haj"][data-fd="1"]').click();
    document.getElementById("fedMent").click();
    o.mentve=!!(S.faceMod&&S.faceMod[n])&&!faceModGlobal()[n];
    o.frissult=document.querySelector("#plSheetHead img.faceImg").src!==src0;
    faceModSet("karrier",n,{});o.torolve=!(S.faceMod&&S.faceMod[n]);
    return o;});
  ok(fed.nyitva&&fed.reteg==="karrier"&&fed.ket===2,"az adatlap 🎨 gombja a karrier-szerkesztőt nyitja (globálisra is váltható)",fed);
  ok(fed.mentve&&fed.frissult&&fed.torolve,"a mentés a karrierbe ír (nem a globálisba), az adatlap arca frissül",fed);

  console.log("\n— 4. ÚJRARAJZOLÁS —");
  const r4=await p.evaluate(()=>{const k0=document.getElementById("plSheet").getAttribute("data-key");
    renderHub();const b=document.getElementById("plSheet");
    return {nyitva:!b.classList.contains("hide"),ugyanaz:b.getAttribute("data-key")===k0,
      inline:document.querySelectorAll("#hubRoster .hubDetail").length};});
  ok(r4.nyitva&&r4.ugyanaz&&r4.inline===0,"a renderHub nyitva hagyja és frissíti",r4);

  console.log("\n— 5. VÁLASZTÓ —");
  const r5=await p.evaluate(()=>{
    const b=[...document.querySelectorAll("#plSheetBody button")].find(x=>/Posztcsere/.test(x.textContent));
    if(!b||b.disabled)return {nincs:true};
    b.click();
    return {zarva:document.getElementById("plSheet").classList.contains("hide"),hk:hubExpandedKey,
      valaszto:!document.getElementById("hubPositionPicker").classList.contains("hide")};});
  ok(r5.zarva&&r5.hk===null&&r5.valaszto,"posztcsere: az ablak bezárul, a választó látszik",r5);
  await p.evaluate(()=>{document.getElementById("hubPositionPicker").classList.add("hide");});

  console.log("\n— 6. MEGERŐSÍTÉS AZ ABLAK FÖLÖTT —");
  const r6=await p.evaluate(()=>{
    document.querySelectorAll("#hubRoster [data-hubkey]")[1].click();
    const b=[...document.querySelectorAll("#plSheetBody button")].find(x=>/Piacra bocsátás|Edzői állás|Eladás/.test(x.textContent)&&!/Eladás/.test(x.textContent)||/Eladás/.test(x.textContent));
    b.click();
    const ids=["hubTacticConfirmModal","sellConfirmModal"];
    const m=ids.map(id=>document.getElementById(id)).find(x=>x&&!x.classList.contains("hide"));
    const r={modal:m?m.id:null,z:m?+getComputedStyle(m).zIndex:0,zLap:+getComputedStyle(document.getElementById("plSheet")).zIndex,
      lapNyitva:!document.getElementById("plSheet").classList.contains("hide")};
    if(m){const no=m.querySelector("#hubTacticConfirmNo,#sellConfirmNo");if(no)no.click();}
    r.utana=!document.getElementById("plSheet").classList.contains("hide");
    return r;});
  ok(r6.modal&&r6.z>r6.zLap&&r6.lapNyitva,"a megerősítés az ablak fölött ül",r6);
  ok(r6.utana,"Mégse után az ablak nyitva marad",r6.utana);

  console.log("\n— 7. BEZÁRÁS —");
  const r7=await p.evaluate(()=>{
    const a=gameBackStep();const z1=document.getElementById("plSheet").classList.contains("hide");
    document.querySelectorAll("#hubRoster [data-hubkey]")[0].click();
    const b=document.getElementById("plSheet");b.dispatchEvent(new MouseEvent("click",{bubbles:true}));
    return {vissza:a&&z1,hatter:b.classList.contains("hide"),hk:hubExpandedKey};});
  ok(r7.vissza,"a vissza gomb bezárja",r7);
  ok(r7.hatter&&r7.hk===null,"a háttérre koppintás bezárja",r7);

  console.log("\n— 8. KIKAPCSOLVA: A RÉGI LENYÍLÓ —");
  const r8=await p.evaluate(()=>{
    plSheetSet(false);renderHub();
    const row=document.querySelectorAll("#hubRoster [data-hubkey]")[2];row.click();
    const r={lap:!document.getElementById("plSheet").classList.contains("hide"),
      inline:document.querySelectorAll("#hubRoster .hubDetail").length};
    row.click();plSheetSet(true);
    return r;});
  ok(!r8.lap&&r8.inline===1,"KI állásban a sor alatt nyílik, ablak nélkül",r8);

  console.log("\n— 9. HIBÁK —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
