/* ⚖️ 3.9.289 — A SÚLYOZOTT MEZŐNY ÉS A CÉLRÉS-BECSLÉS EGYJÁTÉKOSBAN.

   KÉRÉS: „Ebből a részből [idénynyitó célrés-ablak, súlyozott mezőny], amit
   lehet a single player karrierekre is vezessünk át."

   Amit mér (valódi, kétoldalú piramis-karrier a beállítón át):
     1. az új karrier a súlyozott képlettel fut (S.pyr.suly);
     2. az idény vége rögzíti a záró NEVEZÉSI meccs-erőt;
     3. a kezdőrúgás: a rés a SÚLYOZOTT meccs-erőből áll be a rajt-célra —
        nyári +12 mellett a mezőny ≈ 12/2,25 = 5,3-del gyengébb, mint a régi
        képlettel; a napló kimondja; az idény sora rögzíti a számokat;
     4. a futó (régi) karrier — suly nélkül — betűre a régi;
     5. a nyári célrés-ablak becsléssel: a mezőny várható szintje, az indító,
        a záró, a súlyozott meccs-erő, a rajt-rés, a várható kimenet, és hogy
        mit jelent a döntés; a léptetés újraszámol;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9289;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
const KEP=process.argv[2]||null;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const karrier=()=>p.evaluate(()=>{
    unlockGatesOn=()=>false;pendingWorldSeed="SULY0001";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    return {suly:S.pyr.suly,padlo:S.pyr.padlo};});
  /* a kezdőrúgás egy adott „nyári" helyzetben; vissza: a mezőnyszint és a sor */
  const rugas=(suly)=>p.evaluate((suly)=>{
    const o={};
    const H=pyrFloorHist();
    if(!suly)delete S.pyr.suly;
    S.idx=30;o.vege=nfIdenyVege();o.zaro=H[1].zaroMs;
    let ms=0;msRatedBegin();try{ms=teamMatchStrength();}finally{msRatedEnd();}
    o.msMost=Math.round(ms*10)/10;o.zaroVart=o.msMost;
    /* nyáron +12-t épített: a záró 12-vel kevesebb volt */
    H[1].zaroMs=Math.round((ms-12)*10)/10;
    S.seasonHistory=[{season:1,rank:3,pts:60,w:18,d:6,l:6,gf:50,ga:30,oppRating:oppTargetRating,teamAvg:85}];
    S.seasonNumber=2;S.idx=0;
    o.want=pyrFloorWantFor(2);
    /* a mezőny jóval a rajt-cél alatt: a padló emel */
    {msRatedBegin();try{const kell=(o.want+8)-levelGap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}finally{msRatedEnd();}}
    const h=pyrFloorKickoff();o.h=JSON.parse(JSON.stringify(h));o.szint=pyrLevel();
    msRatedBegin();try{o.gapUtan=Math.round(levelGap()*10)/10;}finally{msRatedEnd();}
    o.naplo=/A mezőny képlete/.test(document.body.textContent);
    return o;},suly);

  console.log("— 1–3. új karrier: súlyozott —");
  const k1=await karrier();
  ok(k1.suly===1&&k1.padlo===2,"az új karrier súlyozott képlettel fut",k1);
  const a=await rugas(true);
  ok(a.zaro===a.zaroVart&&a.zaro>0,"az idény vége rögzíti a záró nevezési meccs-erőt",{zaro:a.zaro,ms:a.msMost});
  ok(a.h.suly&&a.h.suly.w===Math.round(((a.msMost*1.25)+(a.msMost-12))/2.25*10)/10,"a sor: (indító×1,25 + záró)/2,25",a.h.suly);
  ok(Math.abs((a.gapUtan-12/2.25)-a.want)<=1.0,"a SÚLYOZOTT rés áll be a rajt-célra (a valódi rés ≈ +5,3-del nagyobb)",{gapUtan:a.gapUtan,want:a.want});
  ok(a.naplo,"a napló kimondja a képletet");

  console.log("\n— 4. régi szabály (ugyanaz a világ) —");
  await karrier();
  const r=await rugas(false);
  ok(!r.h.suly&&Math.abs(r.gapUtan-r.want)<=1.0,"suly nélkül a régi: az indító rés áll be",{gapUtan:r.gapUtan,want:r.want});
  ok(Math.abs((r.szint-a.szint)-12/2.25)<=1.2,"ugyanazon a világon a régi képlet ≈5,3-del erősebb mezőnyt adott",{regi:r.szint,uj:a.szint});

  console.log("\n— 5. a nyári célrés-ablak becsléssel —");
  await karrier();
  const n=await p.evaluate(async()=>{let o0=false;
    const H=pyrFloorHist();S.idx=30;nfIdenyVege();
    let ms=0;msRatedBegin();try{ms=teamMatchStrength();}finally{msRatedEnd();}
    H[1].zaroMs=Math.round((ms-8)*10)/10;
    S.seasonHistory=[{season:1,rank:3}];S.seasonNumber=1;S.seasonClosed=true;phase="hub";
    /* a mezőny jóval alattad: a célrés (a képlet) a mérvadó, nem a természetes szint */
    pyrShiftWorld({divs:S.pyr.divs},25);oppTargetRating=pyrLevel();
    nfOffer(null,true);
    const t=()=>document.getElementById("unlockBody").textContent;
    /* 3.9.297 — a lényeg: a mezőny várható meccs-ereje, alatta a te meccs-erőd és a rés */
    try{const en0=mpCelresSajat();en0.mz=H[1].zaroMs;const c0=nfCelFor(pyrFloorUpcoming());
      o0=mpCelresBecsles(en0,{ms:en0.ms,mz:en0.mz,hid:en0.hid,rajt:mpCelresRajt(c0)},c0,c0,{elore:false,rel:false}).mi==="keplet";}catch(e){o0=false;}
    const o={keplet:o0,becsles:/várható meccs-ereje/.test(t()),szint:/A te meccs-erőd/.test(t()),sulyozott:/rés/.test(t()),
      kimenet:!/feljutás ~|súlyozott|Mit jelent/.test(t()),dontes:true,zaro:true};
    const m=(/célréssel\s*~([\d,]+)/.exec(t())||[])[1];
    document.getElementById("nfHangMinus").click();
    const m2=(/célréssel\s*~([\d,]+)/.exec(t())||[])[1];
    o.m=m;o.m2=m2;
    try{const en=mpCelresSajat();en.mz=H[1].zaroMs;const c=nfCelFor(pyrFloorUpcoming());o.dbg=mpCelresBecsles(en,{ms:en.ms,mz:en.mz,hid:en.hid,rajt:mpCelresRajt(c)},c,c,{elore:false,rel:false});o.dbg.lvl=pyrLevel();o.dbg.ms=en.ms;}catch(e){o.dbg=String(e);}
    return o;});
  ok(n.becsles&&n.szint&&n.sulyozott&&n.kimenet&&n.dontes&&n.zaro,"a nyári ablak (3.9.297): a mezőny várható meccs-ereje, a te meccs-erőd és a rés — rizsa nélkül",n);
  ok(n.keplet&&n.m&&n.m2&&n.m!==n.m2,"ha a célrés a mérvadó, a léptetés újraszámol (nehezebb célrés → erősebb mezőny)",{elotte:n.m,utana:n.m2,keplet:n.keplet,dbg:n.dbg});
  if(KEP){fs.mkdirSync(KEP,{recursive:true});
    await p.evaluate(()=>document.querySelectorAll("body *").forEach(el=>{if(getComputedStyle(el).position==="fixed"&&!el.contains(document.getElementById("scUnlock")))el.style.display="none";}));
    await p.locator("#scUnlock").screenshot({path:path.join(KEP,"sp-celres.png")});}

  console.log("\n— 6. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
