/* 🔬 3.9.298 — A HARDCORE SEED-MÉRŐ ÉS A SZIGORÚSÁG GYÓGYÍTÁSA.

   BEJELENTÉS (ÁCsé Milánó, hardcore, 1. idény 8. forduló): a házigazda scoutja
   két ingyenes + egy találatot hozott, a vendégé egyetlen fizetőset; a 7.
   heti kihívások is mások. A világ-seedből utólag kiszámolva a házigazda
   betűre a közös scout-tervet kapta — a vendég gépén nem futott a hardcore.
   KÉRÉS: „építsünk be külön mérőt a hardcore PvP módba külön, hogy lássuk, a
   seed hogyan teljesít. Tehát mérjünk mindent, amit a seeddel állítunk."

   KÉT LAP, EGY BÖNGÉSZŐBEN, a játék helyi szoba-hátterén (mint a 3.9.288).
   Amit mér:
     1. az alap-jelzés: a hardcore és a könnyed gép összeveti az
        ujjlenyomatát, és MINDKETTŐ kimondja az eltérést (szigorúság);
     2. a gyógyítás: a szoba csomagja hardcore → a könnyed karrier
        hardcore-rá áll, a napló kimondja; ép karriert, könnyed szobát nem bánt;
     3. a húzás-napló: kihívás, scout-terv, felfedezés, talizmán, skill-sor,
        ifi — a két gépen ugyanaz a kivonat-sor, olvasható részlettel;
        könnyedben nem naplóz;
     4. a kézfogás: a két gép a szakasz részletes naplóját is kicseréli, a
        mérő mindkét oldalt eltárolja;
     5. a panel: az Infópult „PvP szigorúság" sora és a 🔬 Seed-mérő gomb;
        a panel az alapot, a kézfogást (=/≠ sorokkal) és a naplót mutatja;
     6. a mérési napló: a beállításokban a közös karrier azonosítói, a
        letöltésben a seed-napló;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9298;
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
  const A=await lap(),B=await lap();
  /* a két karrier: ugyanaz a világ-seed, más keret; hardcore közös szoba */
  const karrier=(p,role,sqi,szigor)=>p.evaluate(([role,sqi,szigor])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=false;
    pendingWorldSeed="HCSEED01";worldSeed=null;
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
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;S.seasonNumber=1;S.idx=0;
    /* a közös szoba és a szigorúság a felállás után */
    MP.active=true;MP.role=role;MP.activeRoom="HCPR";S.mpSzigor=szigor;S.tal=null;S.hc=null;
    return {seed:worldSeed,szigor:S.mpSzigor,hc:mpHardcore(),keret:slots.map(s=>s.player&&s.player.n).filter(Boolean).slice(0,3)};},[role,sqi,szigor]);
  const KEP=process.argv[2]||null;
  const kA=await karrier(A,"host",0,"hardcore"),kB=await karrier(B,"guest",1,"konnyed");
  await A.evaluate(()=>{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="HCPR";r.HCPR=rec;mpLSave(r);});
  console.log("— 0. két karrier: A hardcore, B (a hibás vendég) könnyed —");
  ok(kA.hc&&!kB.hc&&kA.seed===kB.seed,"ugyanaz a világ, A hardcore, B nem",{kA,kB});

  console.log("\n— 1. az alap-jelzés —");
  const jel=p=>p.evaluate(async()=>{const t=await hcmJelez("próba");const M=hcmAllapot();
    return {tars:t?t.szigor:null,figy:(M.figy||[]).map(f=>f.k),
      sor:[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).filter(x=>/Seed-mérő/.test(x)).slice(-1)[0]||""};});
  const j1=await jel(A);
  ok(j1.tars===null&&!j1.figy.length,"az első gépnél még nincs társ-jelzés — nincs figyelmeztetés",j1);
  const j2=await jel(B),j3=await jel(A);
  ok(j2.tars==="hardcore"&&/szigorúság/.test(j2.sor)&&/Hardcore/.test(j2.sor),"B kimondja: a társ gépén hardcore, nálad könnyed",j2.sor);
  ok(j3.tars==="konnyed"&&/szigorúság/.test(j3.sor),"A is kimondja (nálad Hardcore, nála Könnyed)",j3.sor);
  const j4=await A.evaluate(async()=>{await hcmJelez("újra");return hcmAllapot().figy.length;});
  ok(j4===1,"ugyanaz az eltérés egyszer kerül a naplóba",j4);

  console.log("\n— 2. a gyógyítás —");
  const gy=await B.evaluate(()=>{const o={};
    o.konnyedSzoba=mpSzigorGyogyit({szigor:"konnyed"});
    o.elso=mpSzigorGyogyit({szigor:"hardcore"});o.szigor=S.mpSzigor;o.hc=mpHardcore();
    o.masodik=mpSzigorGyogyit({szigor:"hardcore"});
    o.sor=[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).filter(x=>/hardcore helyreállt/.test(x)).length;
    return o;});
  ok(!gy.konnyedSzoba&&gy.elso&&gy.szigor==="hardcore"&&gy.hc&&!gy.masodik&&gy.sor===1,"a szoba csomagja szerint hardcore-ra áll, egyszer, a napló kimondja; könnyed szobát nem bánt",gy);
  const j5=await B.evaluate(async()=>{const n=hcmAllapot().figy.length;await hcmJelez("gyógyulás után");return {elotte:n,utana:hcmAllapot().figy.length,tars:hcmAllapot().tars.szigor};});
  ok(j5.utana===j5.elotte&&j5.tars==="hardcore","gyógyulás után nincs új eltérés",j5);

  console.log("\n— 3. a húzás-napló —");
  const huz=p=>p.evaluate(()=>{
    S.idx=3;S.seasonNumber=1;
    const _r=window.renderChallengeOffers;window.renderChallengeOffers=()=>{};
    showChallengeOffers("short",3,()=>{},false,{});
    window.renderChallengeOffers=_r;
    ["scHub","scWindow","twPanel"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
    for(let i=0;i<3;i++)hcFelfedez(()=>scoutClassicDiscover("hattrick"));
    talKinalat("p1");
    S.skillPool=[];try{nextSkillFromPool&&0;}catch(e){}
    {const _u=weightedShuffleSkills(hcSkillToltRng());S.skillPool=_u;hcNyom("skillsor",_u.slice(0,3).map(x=>x.id).join(","),_u.slice(0,6).map(x=>x.n||x.id).join(", "));}
    const L=hcmAllapot().log.filter(x=>x.sz==="s1:a");
    const by={};L.forEach(x=>{(by[x.f]=by[x.f]||[]).push(x.e);});
    return {by,minta:L.slice(0,8).map(x=>x.f+" · "+(x.r||x.e))};});
  const hA=await huz(A),hB=await huz(B);
  const fajok=["kih:short","terv","felfedez","tal","skillsor"];
  ok(fajok.every(f=>hA.by[f]&&hA.by[f].length),"minden fajta naplózódik (kihívás, scout-terv, felfedezés, talizmán, skill-sor)",Object.keys(hA.by));
  ok(["terv","felfedez","tal","skillsor","kih:short"].every(f=>JSON.stringify(hA.by[f])===JSON.stringify(hB.by[f])),"a két gépen ugyanaz a kivonat-sor (más kerettel is)",{A:hA.by,B:hB.by});
  ok(hA.minta.some(t=>/felfedez · terv/.test(t))&&hA.minta.some(t=>/terv · \d találat/.test(t)),"olvasható részlet: a terv célereje és a tényleges játékos",hA.minta);
  const kon=await A.evaluate(()=>{const n=hcmAllapot().log.length;S.mpSzigor="konnyed";hcmRog("proba","x");hcNyom("proba","y");const m=hcmAllapot().log.length;S.mpSzigor="hardcore";return {n,m};});
  ok(kon.n===kon.m,"könnyed módban nem naplóz",kon);

  console.log("\n— 4. a kézfogás —");
  await A.evaluate(()=>{S.idx=8;window._hcKesz=0;hcKezfogas("s1:tw8:be",()=>{window._hcKesz++;});});
  await A.waitForTimeout(1500);
  await B.evaluate(()=>{S.idx=8;window._hcKesz=0;hcKezfogas("s1:tw8:be",()=>{window._hcKesz++;});});
  await B.waitForTimeout(3000);await A.waitForTimeout(2500);
  const kz=p=>p.evaluate(()=>{const M=hcmAllapot();const k=M.kez[M.kez.length-1]||{};
    return {kesz:window._hcKesz,pont:k.pont,egyezik:k.egyezik,elter:k.elter,en:(k.enLog||[]).length,tars:(k.tarsLog||[]).length,tarsAlap:k.tarsAlap&&k.tarsAlap.szigor};});
  const zA=await kz(A),zB=await kz(B);
  ok(zA.kesz===1&&zB.kesz===1&&zA.pont==="s1:tw8:be"&&zA.en>0&&zA.tars>0&&zB.en>0&&zB.tars>0,"a kézfogás mindkét oldal részletes naplóját eltárolja",{zA,zB});
  ok(zA.egyezik>0&&zA.tarsAlap==="hardcore","az egyeztetés a mérőben is: egyező húzások, a társ alapja",zA);

  console.log("\n— 5. a panel —");
  const pn=await A.evaluate(async()=>{
    try{hubInfoShow("set");}catch(e){}
    await new Promise(r=>setTimeout(r,300));
    const sorTx=[...document.querySelectorAll("#careerSetupBox .csRow")].map(r=>r.textContent).find(t=>/PvP szigorúság/.test(t))||"";
    const gomb=document.querySelector("#careerSetupBox [data-hcm-open]");
    if(gomb)gomb.click();
    await new Promise(r=>setTimeout(r,500));
    const m=document.getElementById("hcmModal");
    return {sorTx,gomb:!!gomb,nyitva:!!m&&!m.classList.contains("hide"),tx:m?m.textContent:"",
      egyenlo:[...document.querySelectorAll("#hcmBody td")].filter(t=>t.textContent==="=").length};});
  ok(/Hardcore/.test(pn.sorTx)&&pn.gomb,"az Infópultban: „PvP szigorúság: Hardcore” és a 🔬 Seed-mérő gomb",pn.sorTx.slice(0,120));
  ok(pn.nyitva&&/Az alap/.test(pn.tx)&&/Kézfogások \(1\)/.test(pn.tx)&&/Seedelt húzásaid/.test(pn.tx),"a gomb megnyitja a panelt: alap, kézfogások, napló",pn.tx.slice(0,200));
  ok(/Eltérés: szigorúság|✓ A két gép alapja egyezik/.test(pn.tx),"a panel kimondja az alap egyezését / eltérését",(pn.tx.match(/(⚠️ Eltérés[^.]*|✓ A két gép[^)]*)/)||[])[0]);
  ok(pn.egyenlo>0,"a kézfogás összevetése soronként (=)",pn.egyenlo);
  if(KEP){fs.mkdirSync(KEP,{recursive:true});
    await A.evaluate(()=>{document.querySelectorAll("#hcmBody details").forEach(d=>d.open=true);
      document.querySelectorAll("body *").forEach(el=>{const m=document.getElementById("hcmModal");if(getComputedStyle(el).position==="fixed"&&el!==m&&!m.contains(el)&&!el.contains(m))el.style.display="none";});});
    await A.locator("#hcmModal .card").screenshot({path:path.join(KEP,"seed-mero.png")});}
  await A.evaluate(()=>{hcmZar();hubInfoHide();});

  console.log("\n— 6. a mérési napló —");
  const mn=await A.evaluate(()=>{const b=meresBeall();meresBiztos().beall=b;meresSave();
    const ex=JSON.parse(meresExportSzoveg());const k=ex.karrierek.find(x=>x.seed&&x.seed.log&&x.seed.log.length);
    return {mp:b.mp,van:!!k,log:k?k.seed.log.length:0,kez:k?k.seed.kez.length:0};});
  ok(mn.mp&&mn.mp.szerep==="host"&&mn.mp.szoba==="HCPR"&&mn.mp.szigor==="hardcore"&&mn.mp.seed,"a beállításokban a közös karrier azonosítói",mn.mp);
  ok(mn.van&&mn.log>0&&mn.kez===1,"a letöltés viszi a seed-naplót",mn);

  console.log("\n— 7. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
