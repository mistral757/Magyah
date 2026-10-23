/* ⏸ 3.9.290 — FÉLBEHAGYOTT CHECKPOINT: VISSZATÉRÉS ÚJRATÖLTÉS UTÁN.

   BEJELENTETT HIBA (hardcore, első próba): „Bevárjuk egymást 8. fordulónál.
   Én érek oda hamarabb. Kilépek. Visszalépek. És nem az átigazolási ablakhoz
   vitt, hanem a kezdőrúgást ajánlott fel […] ki-be lépegetek menüpontokban.
   És akkor feldobja a kézfogás gombot az irány a szezon gomb helyén. […] a
   visszalépéskor egyből a menübe dobjon […] ha kihívások előtt lépnék ki […]
   akkor is a kihívásokhoz vigyen vissza."

   Amit mér (valódi mentés → friss lap → a betöltő út):
     1. egyjátékos: kihívás-választás közben újratöltve UGYANAZ a lista nyílik,
        az elvállalt megmarad; utána az ablak; ablak közben a HUB;
     2. hardcore: kihívás közben újratöltve a lista; utána a kézfogás vár;
     3. kézfogás közben kilépve a HUB fő gombja a kézfogás (egy gomb, a jelzés
        nem gomb), a kezdőrúgás nem ígér fordulót; újratöltve egyből a HUB, a
        kézfogás újra vár; a társ megérkezésekor nyílik az ablak;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9290;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const errs=[];
  const lap=async()=>{const p=await ctx.newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);return p;};

  /* egy karrier a beállítón át; a mentés VALÓDI (zár a saját helyére) */
  const karrier=(p,role,sqi,szigor)=>p.evaluate(([role,sqi,szigor])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=false;
    pendingWorldSeed="HCSEED02";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[sqi];
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
    phase="season";S.seasonClosed=false;S.seasonNumber=1;S.idx=8;S.playing=false;S.auto=false;
    if(role){MP.active=true;MP.role=role;MP.activeRoom="HCRL";MP.started=true;S.mpSzigor=szigor;S.hc=null;}
    S.tal=null;
    if(role!=="guest")saveLockSet(saveKey());   /* a vendég lapja nem ír (közös a localStorage) */
    ["scHub","scWindow","twPanel"].forEach(id=>$(id).classList.add("hide"));
    $("scSim").classList.remove("hide");
    return {key:saveKey()};},[role,sqi,szigor]);
  /* a 8. forduló lefújása utáni checkpoint — ugyanaz a hívás, amit a fullTime ad */
  const checkpoint=p=>p.evaluate(()=>{
    handleCheckpoint(8,()=>{$("kickBtn").disabled=false;$("kickBtn").textContent=kickBtnLabel();saveGame();});
    return {kartya:[...document.querySelectorAll("#twBody .chCard .chDesc")].map(e=>e.textContent),
      ablak:!$("scWindow").classList.contains("hide"),jel:S.cpFolyamat&&S.cpFolyamat.lepes};});
  const vallal=async(p,i)=>{await p.evaluate(i=>document.querySelectorAll("#twBody button.chTake")[i].click(),i);
    await p.waitForTimeout(100);await p.evaluate(()=>$("hubTacticConfirmYes").click());await p.waitForTimeout(150);};
  /* ÚJRATÖLTÉS: friss lap, a mentés a localStorage-ból, a valódi betöltő úton */
  const ujratolt=async(key,mp)=>{const p=await lap();
    await p.evaluate(([key,mp])=>{unlockGatesOn=()=>false;mpNet.mode="local";window.mpNetInit=async()=>{};
      if(mp){MP.active=true;MP.activeRoom=mp.room;MP.role=mp.role;MP.started=true;}
      const d=JSON.parse(localStorage.getItem(key));
      ["mpEntry"].forEach(id=>{const e=$(id);if(e)e.classList.add("hide");});
      if(!loadIntoGame(d,key))throw new Error("betöltés elszállt");
      if(mp){MP.active=true;MP.activeRoom=mp.room;MP.role=mp.role;MP.started=true;}
      resumeUIFromSave();},[key,mp]);
    await p.waitForTimeout(800);return p;};
  const kep=p=>p.evaluate(()=>{const vis=id=>{const e=$(id);return !!e&&!e.classList.contains("hide");};
    return {hub:vis("scHub"),sim:vis("scSim"),win:vis("scWindow"),var:vis("h2hWait"),
      fo:($("hubNextSeasonBtn")||{}).textContent||"",kick:($("kickBtn")||{}).textContent||"",
      kartya:[...document.querySelectorAll("#twBody .chCard .chDesc")].map(e=>e.textContent),
      vallalt:(S.activeChallenges||[]).length,tw:S.twWindow&&S.twWindow.round,
      jel:S.cpFolyamat&&S.cpFolyamat.lepes,fuggo:S.hc&&S.hc.fuggo&&S.hc.fuggo.pont,
      banner:vis("hcFuggoBtn")?$("hcFuggoBtn").textContent.slice(0,60):"",bannerGomb:vis("hcFuggoBtn")&&$("hcFuggoBtn").tagName==="BUTTON",
      idx:S.idx};});

  console.log("— 1. egyjátékos: kihívás-választás közben újratöltés —");
  const P=await lap();
  const kP=await karrier(P,null,0,null);
  const c1=await checkpoint(P);
  ok(c1.ablak&&c1.kartya.length>=2&&c1.jel==="kihivas","a 8. forduló után a kihívás-ajánlat nyílik, a folyamat mentve",c1);
  await vallal(P,0);
  const elotte=await kep(P);
  const P2=await ujratolt(kP.key,null);
  const u1=await kep(P2);
  ok(u1.win&&!u1.hub&&u1.kartya.join("|")===c1.kartya.slice(1).join("|"),"újratöltés után UGYANAZ a lista nyílik (az elvállalt nélkül), nem a kezdőrúgás",{c1:c1.kartya,u1:u1.kartya});
  ok(u1.vallalt===elotte.vallalt&&u1.vallalt>=1&&u1.idx===8,"az elvállalt kihívás megmaradt, a forduló nem lépett",{elotte:elotte.vallalt,utana:u1.vallalt,idx:u1.idx});
  /* Kész — tovább → az átigazolási ablak a HUB-ban */
  await P2.evaluate(()=>[...document.querySelectorAll("#twActions button")].find(b=>/Kész/.test(b.textContent)).click());
  await P2.waitForTimeout(600);
  const u1b=await kep(P2);
  ok(u1b.tw===8&&u1b.hub&&!u1b.jel,"a „Kész — tovább” után nyílik a 8. forduló utáni ablak, a folyamat-jelző törlődik",u1b);
  /* az ablak közbeni újratöltés továbbra is a HUB-ba visz */
  await P2.evaluate(()=>saveGame());
  const P3=await ujratolt(kP.key,null);
  const u1c=await kep(P3);
  ok(u1c.tw===8&&u1c.hub&&!u1c.sim,"az ablak közben újratöltve: HUB, nyitott ablak",u1c);
  for(const p of [P,P2,P3])await p.close();

  console.log("\n— 2. hardcore: kihívás közben újratöltés, aztán kézfogás —");
  const A=await lap(),B=await lap();
  const kA=await karrier(A,"host",0,"hardcore"),kB=await karrier(B,"guest",1,"hardcore");
  await A.evaluate(()=>{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="HCRL";r.HCRL=rec;mpLSave(r);});
  const c2=await checkpoint(A);
  ok(c2.ablak&&c2.kartya.length>=2,"A: a kihívás-ajánlat nyílik",c2);
  const A2=await ujratolt(kA.key,{room:"HCRL",role:"host"});
  const u2=await kep(A2);
  ok(u2.win&&u2.kartya.join("|")===c2.kartya.join("|")&&u2.idx===8,"A újratöltve: ugyanaz a kihívás-lista, nem a 9. forduló",{c2:c2.kartya,u2:u2.kartya});
  await A.close();
  /* Kész → kézfogás (a társ még nincs ott) */
  await A2.evaluate(()=>[...document.querySelectorAll("#twActions button")].find(b=>/Kész/.test(b.textContent)).click());
  await A2.waitForTimeout(2500);
  const u2b=await kep(A2);
  ok(u2b.var&&u2b.fuggo==="s1:tw8:be"&&!u2b.tw,"a kihívások után a kézfogás vár (függőben mentve)",u2b);

  console.log("\n— 3. a kézfogás alatt kilépés és újratöltés —");
  /* „↩ Később folytatom” → HUB: a fő gomb a kézfogás, a jelzés nem gomb */
  await A2.evaluate(()=>$("h2hWaitCancelBtn").click());await A2.waitForTimeout(500);
  const u3=await kep(A2);
  ok(u3.hub&&/^🛡 Kézfogás a társaddal/.test(u3.fo)&&u3.banner&&!u3.bannerGomb,"kilépés után a HUB fő gombja a kézfogás; a függő jelzés tájékoztat, nem második gomb",u3);
  ok(/kézfogás/i.test(u3.kick),"a kezdőrúgás gombja sem a 9. fordulót ígéri",u3.kick);
  /* menüpontok közt lépegetés: a fő gomb marad a kézfogás */
  const lep=await A2.evaluate(()=>{try{hubMenuToggle(false,true);}catch(e){}renderHub();try{hubMenuToggle(true,true);}catch(e){}renderHub();
    return $("hubNextSeasonBtn").textContent;});
  ok(/^🛡 Kézfogás a társaddal/.test(lep),"menü ki-be: a fő gomb ugyanaz marad",lep);
  await A2.evaluate(()=>saveGame());
  const A3=await ujratolt(kA.key,{room:"HCRL",role:"host"});
  await A2.close();
  const u3b=await kep(A3);
  ok(u3b.hub&&!u3b.sim&&u3b.var&&/^🛡 Kézfogás a társaddal/.test(u3b.fo),"újratöltés: egyből a HUB (menü), és a kézfogás azonnal újra vár — nincs kezdőrúgás",u3b);
  /* a társ megérkezik (ő is a kihívásain át) → nyílik az ablak */
  await checkpoint(B);
  await B.evaluate(()=>[...document.querySelectorAll("#twActions button")].find(b=>/Kész/.test(b.textContent)).click());
  await B.waitForTimeout(3500);await A3.waitForTimeout(2500);
  const u3c=await kep(A3),uB=await kep(B);
  ok(u3c.tw===8&&u3c.hub&&!u3c.var&&!u3c.fuggo&&/Lezárom/.test(u3c.fo),"a társ megérkezett: A-nál nyílik a 8. forduló utáni ablak a HUB-ban",u3c);
  ok(uB.tw===8&&!uB.fuggo,"B-nél is",uB);
  try{fs.mkdirSync(process.argv[2]||"/tmp/k290",{recursive:true});}catch(e){}
  if(process.argv[2]){
    await A3.evaluate(()=>{S.twWindow=null;S.hc.fuggo={pont:"s1:tw15:be",at:Date.now()};S.idx=15;hcHubbaVisz();});
    await A3.waitForTimeout(400);
    await A3.screenshot({path:path.join(process.argv[2],"hc-fuggo-hub.png")});}

  console.log("\n— 4. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
