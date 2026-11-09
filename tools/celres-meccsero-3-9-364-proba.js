/* ⚖ A CÉLRÉS MECCS-ERŐBEN — A KIEGYENLÍTÉS NEM JÖHET RÁ UTÓLAG (3.9.364).

   BEJELENTÉS: „a számolás stimmelt, csakhogy a nyers erőt lőtte be az én
   meccserőmhöz képest -0.5-re. így mire elindult a szezon addigra a
   kiegyenlítő meccserő boost mértékével erősebb lett minden csapat az
   enyémnél, ami ezesetben 16! Rating pontot jelentett."

   Amit mér (egyjátékos piramis, a 2. idény kezdőrúgása; nyáron az extrák
   +20-at nőnek — a tavalyi befagyasztott ⚖ jóval kisebb):
     1. a kezdőrúgás rése = a szezon valódi rése (a befagyasztás után);
     2. az ablak ⚡-mezőnye a valódi ellenfél-⚡ (±0,6, a szint egészre kerekít);
     3. a ⚖ az ablakban a motoré: a rejtett bónusz fele;
     4. az ablak kiírja a bontást: nyers + extrák = ⚡, mindkét oldalon;
     5. nincs oldalhiba. */
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
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9364;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  /* 🏁 1.0.7.0.00 — ez a próba a RÉGI rajt-szerződést méri (a közös karrier ága él vele); az új egyjátékos rajtot a tools/ideny-rajt-1-0-7-0-00-proba.js méri */
  await p.evaluate(()=>{window.nrAktiv=()=>false;});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    unlockGatesOn=()=>false;pendingWorldSeed="KIEG0001";worldSeed=null;
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
    const o={};
    freezeSeasonHiddenBonus();o.h1=S.oppBuffH;
    S.idx=30;nfIdenyVege();
    S.seasonHistory=[{season:1,rank:3,pts:60,w:18,d:6,l:6,gf:50,ga:30,oppRating:oppTargetRating,teamAvg:85}];
    S.seasonClosed=true;phase="hub";
    /* nyáron a rejtett bónusz +20-at nő (edző) */
    coach=Object.assign({},coach,{ovrMod:(coach.ovrMod||0)+20});
    o.hNyar=hiddenMatchBonus();
    const H=pyrFloorHist();delete H[1].zaroMs;
    const sn=pyrFloorUpcoming(),cel=nfCelFor(sn);
    const en=celresSoloSajat(sn);en.mz=null;
    const B=mpCelresBecsles(en,{ms:en.ms,mz:null,hid:en.hid,rajt:mpCelresRajt(cel)},cel,cel,{elore:false,rel:false});
    o.ablak={mezo:B.mezo,szint:B.szint,gE:B.gE,ms:en.ms,hid:en.hid,want:B.want};
    /* kezdőrúgás, mint startNextCareerSeason-ben */
    S.seasonNumber=2;S.idx=0;S.seasonClosed=false;
    const k=pyrFloorKickoff();o.k={want:k.want,utana:k.utana,lift:k.lift};
    freezeSeasonHiddenBonus();o.h2=S.oppBuffH;
    msRatedBegin();try{o.valodiGap=Math.round(levelGap()*10)/10;o.myMs=Math.round(teamMatchStrength()*10)/10;}finally{msRatedEnd();}
    o.oppMs=Math.round(oppMatchStrength()*10)/10;o.lvl=pyrLevel();o.kieg=Math.round(matchHiddenOppBuff()*10)/10;
    o.html=celresLenyegHtml(B,en,null,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    o.B={buff:B.buff,szint:B.szint,mezo:B.mezo};
    return o;});
  ok(r.hNyar-r.h1>15,"a helyzet: nyáron a rejtett bónusz +20-at nőtt a tavalyi befagyasztotthoz képest",{h1:r.h1,most:r.hNyar});
  ok(Math.abs(r.k.utana-r.valodiGap)<=0.1&&Math.abs(r.h2-r.hNyar)<1e-6,"1. a kezdőrúgás rése = a szezon valódi rése (a mostani ⚖-tel kalibrál, nem a tavalyival)",{kick:r.k.utana,valodi:r.valodiGap,h2:r.h2});
  ok(Math.abs(r.ablak.mezo-r.oppMs)<=0.6&&Math.abs(r.ablak.gE-r.valodiGap)<=0.6,"2. az ablak ⚡-mezőnye és rése a szezon valódi számai",{ablak:r.ablak,oppMs:r.oppMs,gap:r.valodiGap});
  ok(Math.abs(r.ablak.hid-Math.round(r.hNyar*10)/10)<0.06&&Math.abs(r.B.buff-r.hNyar/2)<0.06&&Math.abs(r.kieg-r.hNyar/2)<0.06,"3. a ⚖ az ablakban a motoré: a rejtett bónusz fele",{hid:r.ablak.hid,buff:r.B.buff,motor:r.kieg});
  {const sz=x=>String(Math.round(x*10)/10).replace(".",",");
   ok(r.html.includes(`nyers ${sz(r.ablak.ms-r.ablak.hid)}`)&&r.html.includes(`⚡${sz(r.ablak.ms)}`)&&!r.html.includes(`⚖ kiegyenlítés`)&&r.html.includes(`A mezőny: ⚡${sz(r.B.mezo)}`)&&r.html.includes(`⚡${sz(r.B.mezo)}`),
     "4. az ablak bontva írja: nyers + extrák = ⚡ (te); a mezőny a teljes ⚡-val (3.9.367)",r.html.slice(0,500));}
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
