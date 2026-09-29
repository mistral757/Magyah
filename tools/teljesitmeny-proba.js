/* ⚡ 3.9.168 — TELJESÍTMÉNY: A HUB-KOPPINTÁS ÉS A ZENE INDULÁSA.

   BEJELENTETT HIBA: „Nagyon lassan tölt be a zene. És vannak benne laggok
   bizonyos események, kattintások, különösen is a HUBban játékosra kattintás
   hatására."

   A MÉRÉS (négyszeresen lassított CPU, ≈ közepes telefon):
     · egy HUB-soron koppintás ÖT teljes mentést indított (a renderHub egyet,
       a játékoslap négy lenyílója a toggle-eseményével négyet), és a teljes
       HUB-ot újrarajzolta — koppintásonként 0,4–0,8 mp, utána még öt ~0,2 mp-es
       akadás;
     · minden zeneindítás és minden stílus-szignál újragenerálta a 2,4 mp-es
       zengető-lecsengést; a feloldás után a zene a következő másodperces ütemig
       várt;
     · meccs közben minden naplósor azonnali elrendezést kényszerített ki.

   Amit ez a próba őriz:
     1. HUB-soron koppintás: SZINKRON mentés nincs, a teljes HUB nem rajzolódik
        újra (a részletpanel helyben cserélődik), a panel a koppintott sor alatt
        van; az összevont mentés később EGYSZER lefut;
     2. a függő mentés a lap elhagyásakor (pagehide) azonnal kiíródik;
     3. a zengető-lecsengés egyszer születik (gyorsítótár), a hangulat-busz nem
        készít saját konvolvert;
     4. öt naplósor egy képkockán belül egyetlen görgetést kér, és a napló
        a képkocka után az aljára ér;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9202;
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

  /* ---- 1. HUB-KOPPINTÁS ---- */
  console.log("\n— 1. HUB-SORON KOPPINTÁS —");
  const k=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    let ment=0,rajz=0;const _sg=saveGame,_rh=renderHub;
    saveGame=function(){ment++;return _sg.apply(this,arguments);};
    renderHub=function(){rajz++;return _rh.apply(this,arguments);};
    const r={};
    try{
      const row=document.querySelectorAll("#hubRoster [data-hubkey]")[2];
      const key=row.getAttribute("data-hubkey");
      row.click();
      r.szinkronMentes=ment;r.teljesRajz=rajz;
      const det=document.querySelector("#hubRoster .hubDetail");
      r.panel=!!det;r.helyen=!!det&&det.previousElementSibling===row;
      r.egyPanel=document.querySelectorAll("#hubRoster .hubDetail").length;
      r.lenyilok=det?det.querySelectorAll("details.hdSec").length:0;
      await varj(2600);
      r.kesobbMentes=ment;
      /* becsukás: a panel eltűnik, továbbra sincs teljes rajzolás */
      const row2=[...document.querySelectorAll("#hubRoster [data-hubkey]")].find(x=>x.getAttribute("data-hubkey")===key);
      row2.click();
      r.becsukva=document.querySelectorAll("#hubRoster .hubDetail").length===0;
      r.rajzBecsuk=rajz;
      await varj(2600);
    }finally{saveGame=_sg;renderHub=_rh;}
    return r;});
  ok(k.szinkronMentes===0,"a koppintás pillanatában NINCS mentés (korábban öt volt)",k);
  ok(k.teljesRajz===0&&k.rajzBecsuk===0,"a teljes HUB nem rajzolódik újra — lenyitásnál és becsukásnál sem",k);
  ok(k.panel&&k.helyen&&k.egyPanel===1,"a részletpanel a koppintott sor alatt van, és csak egy",k);
  ok(k.kesobbMentes===1,"az összevont mentés később EGYSZER lefut (a lenyílók toggle-jeivel együtt)",k);
  ok(k.becsukva,"újra koppintva a panel bezárul");

  /* ---- 2. PAGEHIDE ---- */
  console.log("\n— 2. A FÜGGŐ MENTÉS NEM VÉSZ EL —");
  const f=await p.evaluate(()=>{
    let ment=0;const _sg=saveGame;saveGame=function(){ment++;return _sg.apply(this,arguments);};
    try{
      saveGameSoon();const fugg=!!_saveSoonT;
      window.dispatchEvent(new Event("pagehide"));
      return {fugg,ment,utana:!!_saveSoonT};
    }finally{saveGame=_sg;}});
  ok(f.fugg&&f.ment===1&&!f.utana,"a lap elhagyásakor (pagehide) a függő mentés azonnal kiíródik",f);

  /* ---- 3. ZENGETŐ ---- */
  console.log("\n— 3. A ZENGETŐ —");
  await p.mouse.click(5,5);
  const z=await p.evaluate(async()=>{
    hangFelold();await new Promise(r=>setTimeout(r,300));
    const ac=_hangCtx;let konv=0;const _cc=ac.createConvolver.bind(ac);
    ac.createConvolver=function(){konv++;return _cc();};
    try{
      const ir1=hangLagyIR(ac),ir2=hangLagyIR(ac);
      hangLagyRev(_hangBus.zene);hangLagyRev(_hangBus.sfx);
      const k0=konv;
      const F=hangLagyF();
      for(let i=0;i<5;i++){const bz=hangLagyBusz(_hangBus.sfx,F,.1);hangLagy(ac.currentTime+.05,{v:"bell",n:72,dur:.1,vol:.01},bz);}
      return {azonos:ir1===ir2,ujKonvolver:konv-k0,fut:ac.state};
    }finally{delete ac.createConvolver;}});
  ok(z.azonos,"a lecsengés egyszer születik (gyorsítótár)");
  ok(z.ujKonvolver===0,"öt hangulat-busz (öt szignál) egyetlen új konvolvert sem készít — a szülő buszét használják",z);

  /* ---- 4. NAPLÓ-GÖRGETÉS ---- */
  console.log("\n— 4. A NAPLÓ GÖRGETÉSE —");
  const g=await p.evaluate(async()=>{
    hubMidSeasonReturn();
    const L=lines();L.style.maxHeight="120px";L.style.overflowY="auto";
    let kerdes=0;const _raf=window.requestAnimationFrame;
    window.requestAnimationFrame=function(cb){kerdes++;return _raf.call(window,cb);};
    try{for(let i=0;i<5;i++)addLine("próbasor "+i,"m");}finally{window.requestAnimationFrame=_raf;}
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const alja=Math.abs(L.scrollHeight-L.clientHeight-L.scrollTop)<=2;
    L.style.maxHeight="";L.style.overflowY="";
    return {kerdes,alja};});
  ok(g.kerdes===1,"öt naplósor egyetlen képkocka-görgetést kér (nem ötször kényszerít elrendezést)",g);
  ok(g.alja,"a képkocka után a napló az aljára ér");

  console.log("\n— 5. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
