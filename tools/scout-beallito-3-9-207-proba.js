/* 🔭 3.9.207 — A VALÓSÁGHŰ SCOUT AZ ÚJ KARRIER BEÁLLÍTÓJÁN.

   BEJELENTÉS: „a realisztikus scout mód az ne csak a beállításokban legyen,
   hanem az új játék indításánál a kapcsolók között is."

   Amit mér:
     1. A BEÁLLÍTÓ: karrierben látszik (draft és kész klub), karrieren kívül
        nem; a kattintás a preferenciát írja; az összefoglalóban ott a sora;
     2. AZ INDULÁS: a beginNewGame rögzíti a karrierre (S.scoutReal), és
        utána a preferencia már nem írja át a futó karriert;
     3. A BEÁLLÍTÁSOK kapcsolója ugyanazt a preferenciát állítja, és a
        beállító választója követi;
     4. KÖZÖS KARRIER: a csomagban utazik; a vendégnél a házigazda értéke él,
        a saját tárolt preferenciája érintetlen; a vendég átnézőjén zárolt;
        menet közben a Beállításokban nem állítható;
     5. a szkript betölt (nincs TDZ), nincs konzolhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9249;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>typeof scoutRealWanted==="boolean"&&typeof renderScoutRealGrid==="function"&&APP_VERSION==="3.9.207"),"a szkript betölt, a kapcsoló állapota él (nincs TDZ)");

  console.log("\n— 1. a beállító —");
  const r1=await p.evaluate(()=>{
    const vis=()=>!document.getElementById("scoutRealGrid").classList.contains("hide");
    const o={};
    gameMode="classic";try{enterCareerSetupFromHome(false);}catch(e){}
    gameMode="classic";updateScoutRealVisibility();o.klasszikus=vis();
    gameMode="career";enterCareerSetupFromHome(true);o.karrier=vis();
    try{setCareerStart("club");}catch(e){} o.klub=vis();
    try{setCareerStart("draft");}catch(e){}
    o.selKi=document.querySelector('#scoutRealGrid button[data-sr="off"]').classList.contains("sel");
    document.querySelector('#scoutRealGrid button[data-sr="on"]').click();
    o.ls=localStorage.getItem("scoutReal30_0");o.w=scoutRealWanted;
    o.selBe=document.querySelector('#scoutRealGrid button[data-sr="on"]').classList.contains("sel");
    renderSetupRecap();
    o.recap=[...document.querySelectorAll("#setupRecap .setupRecapRow")].map(x=>x.textContent).filter(t=>/Scout/.test(t));
    o.oldal=document.getElementById("scoutRealGrid").closest(".setupPage").id;
    return o;});
  ok(!r1.klasszikus&&r1.karrier&&r1.klub,"karrierben látszik (drafttal és kész klubbal is), karrieren kívül nem",r1);
  ok(r1.oldal==="setupPg2","„A keret” oldalon áll, a többi keret-kapcsoló mellett",r1.oldal);
  ok(r1.selKi&&r1.selBe&&r1.ls==="1"&&r1.w===true,"a kattintás a preferenciát írja, a jelölés követi");
  ok(r1.recap.length===1&&/Valósághű/.test(r1.recap[0]),"az összefoglalóban ott a sora",r1.recap);

  console.log("\n— 2. az indulás —");
  const r2=await p.evaluate(()=>{
    beginNewGame();
    const a=S.scoutReal;
    localStorage.setItem("scoutReal30_0","0");
    return {a,on:scoutRealOn(),mezoBe:S.scoutReal};});
  ok(r2.a===true&&r2.on===true&&r2.mezoBe===true,"a beginNewGame a karrierre rögzíti, a tárolt preferencia már nem írja át",r2);

  console.log("\n— 3. a Beállítások kapcsolója —");
  const r3=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    document.getElementById("themeModal").classList.remove("hide");renderThemeModal();await varj(50);
    const btn=document.getElementById("scoutRealBtn");
    const o={elotte:btn.getAttribute("aria-pressed"),tiltva:btn.disabled};
    btn.click();await varj(50);
    o.utana=document.getElementById("scoutRealBtn").getAttribute("aria-pressed");
    o.S=S.scoutReal;o.w=scoutRealWanted;o.ls=localStorage.getItem("scoutReal30_0");
    o.rács=document.querySelector('#scoutRealGrid button[data-sr="off"]').classList.contains("sel");
    document.getElementById("themeModal").classList.add("hide");
    return o;});
  ok(r3.elotte==="true"&&!r3.tiltva&&r3.utana==="false"&&r3.S===false&&r3.w===false&&r3.ls==="0"&&r3.rács,
     "a futó karrier, a preferencia és a beállító választója együtt vált",r3);

  console.log("\n— 4. közös karrier —");
  const r4=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const o={};
    scoutRealWanted=true;
    o.csomag=mpCollectSettings().scoutReal;
    /* vendég: a saját tárolt preferenciája KI, a házigazdáé BE */
    localStorage.setItem("scoutReal30_0","0");scoutRealWanted=false;
    const s=mpCollectSettings();s.scoutReal=true;
    mpApplySettings(s);
    o.w=scoutRealWanted;o.ls=localStorage.getItem("scoutReal30_0");
    o.sel=document.querySelector('#scoutRealGrid button[data-sr="on"]').classList.contains("sel");
    /* régi szoba: nincs mező → KI */
    const s2=mpCollectSettings();delete s2.scoutReal;mpApplySettings(s2);o.regi=scoutRealWanted;
    mpApplySettings(s);
    mpGuestReviewLock(true);
    o.zar=[...document.querySelectorAll("#scoutRealGrid button")].every(b=>b.disabled);
    mpGuestReviewLock(false);
    o.lista=MP_GUEST_LOCK_SEL.includes("#scoutRealGrid");
    /* menet közben, közös karrierben: a Beállítások kapcsolója zárolt */
    const mpA=MP.active,cp=careerPool;MP.active=true;if(!careerPool)careerPool={};
    document.getElementById("themeModal").classList.remove("hide");renderThemeModal();await varj(50);
    const btn=document.getElementById("scoutRealBtn");
    o.mpTiltva=btn.disabled;const elotte=scoutRealOn();btn.click();await varj(50);o.mpValtozatlan=scoutRealOn()===elotte;
    o.mpSzoveg=/házigazda/.test(btn.parentElement.textContent);
    MP.active=mpA;careerPool=cp;document.getElementById("themeModal").classList.add("hide");
    return o;});
  ok(r4.csomag===true,"a házigazda csomagjában utazik");
  ok(r4.w===true&&r4.ls==="0"&&r4.sel,"a vendégnél a házigazda értéke él, a saját tárolt preferenciája érintetlen",r4);
  ok(r4.regi===false,"régi szobában (nincs mező) KI");
  ok(r4.zar&&r4.lista,"a vendég átnézőjén zárolt");
  ok(r4.mpTiltva&&r4.mpValtozatlan&&r4.mpSzoveg,"közös karrierben menet közben a Beállításokban nem állítható, és ki is írja, miért",r4);

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
