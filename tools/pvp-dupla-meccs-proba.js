/* ⚔ PVP: EGY PÁRHARC, EGY LEJÁTSZÁS (3.9.175).

   BEJELENTETT HIBA: „Amikor elmentem a felállásom, kilépek, visszalépek, és
   elindulna egyből a meccs, akkor néha visszadob meccskezdés előttre és megint
   tudom setupolni a csapatom […] és aztán ha elkezdem a meccset, akkor dupla
   feeddel megy le a meccs. Minden eseményt két különböző módon jelent a
   kommentátor."

   Egy valódi karrier, valódi motorral; a hálózat a helyi backend, a
   Firebase-ág fölé kötve, KÉSLELTETVE (mint egy mobilnet). A párharc 0,1×-es
   tempóját a próba idejére gyorsítjuk (az időzítők 3 mp fölötti késleltetése
   15 ms). Amit mér:
     1. a csere-kör többszöri indítása (a hálózati várakozás közben is) EGY
        folyamatot hagy életben: a motor egyszer indul, egy „felsorakozik" sor,
        egy könyvelt eredmény;
     2. futó párharc mellett sem a kupa Kezdőrúgása, sem a bajnoki, sem egy
        újabb csere-kör nem indít második meccset; a playMatch egy párharc-
        szkripttel sem;
     3. az elköteleződés (S.h2hPending) a meccs ALATT a mentésben marad, és a
        lefújás oldja fel;
     4. a meccs KÖZBEN mentett állapotból visszatérve a párharc azonnal
        folytatódik (nincs Kezdőrúgás, nincs HUB), és ugyanaz az eredmény jön ki;
     5. kupa-párharcba visszatérve a közvetítés-képernyő van elöl, nem a kupa-
        képernyő élesített Kezdőrúgással;
     6. nincs oldalhiba.
   BASE_HTML=<régi index.html> a javítás előtti állapotot méri (ott 1., 2.,
   3., 4. és 5. elbukik). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9216, BASE=process.env.BASE_HTML||null;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=(f==="/index.html"&&BASE)?BASE:path.join(ROOT,f);
  if(!(abs===BASE||abs.startsWith(ROOT))||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404|ERR_|gstatic/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.__sorok=[];});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi karrier, szezonban (a frissites-proba beállítása) ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.auto=false;S.unavailable={};});

  /* ---- a szoba és a késleltetett hálózat; a párharc a 15. forduló ---- */
  const KOD="DUPLA1",KEY="s1r15",MATE="tarsika";
  const halozat=()=>p.evaluate(({KOD,MATE})=>{
    const ME=mpMyId();
    mpNet.mode="fb";mpNet.skew=0;
    const kesik=ms=>new Promise(r=>setTimeout(r,ms));
    ["h2hGet","h2hPut","h2hAll","h2hClaim","get","presence","setRole"].forEach(k=>{
      mpBackendFb[k]=async(...a)=>{await kesik(k==="h2hGet"||k==="get"?350:120);
        return mpBackendLocal[k]?mpBackendLocal[k](...a):null;};});
    /* a gyorsítás: a 3 mp fölötti időzítők (a párharc 0,1×-es tempója) 15 ms */
    if(!window.__gyors){window.__gyors=1;
      const _st=window.setTimeout,_si=window.setInterval;
      window.setTimeout=function(f,ms,...a){return _st.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};
      window.setInterval=function(f,ms,...a){return _si.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};}
    /* a jutalom-lánc nem kell (a lefújás mentése igen) */
    window.__lanc=0;utoLancIndit=function(){window.__lanc++;};
    window.__motor=0;const _pm=playMatchMotor;
    playMatchMotor=function(){window.__motor++;return _pm.apply(this,arguments);};
    const _a=addLine;addLine=function(h){window.__sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};
    return ME;},{KOD,MATE});
  const ME=await halozat();
  await p.evaluate(({KOD,KEY,MATE,ME})=>{
    const ker=(by,nev)=>({by,at:Date.now(),teamName:nev,ovr:80,dispOvr:80,shownOvr:80,
      defMult:1,famSp:1,tacticEffect:1,tacticStyle:"n",chemPairs:0,redP:0.02,
      card:{team:nev,rows:[]},
      players:Array.from({length:11},(_,i)=>({n:nev[0]+i,pos:"KKP",gw:1,aw:1,rw:1}))});
    const szoba={code:KOD,tempo:"tempos",
      players:{[ME]:{role:"host",online:true,seenAt:Date.now()},[MATE]:{role:"guest",online:true,seenAt:Date.now()}},
      h2h:{[KEY]:{guest:ker(MATE,"Társ FC"),openedAt:Date.now()}}};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({[KOD]:szoba}));
    MP.active=true;MP.activeRoom=KOD;MP.role="host";MP.started=true;
    /* a karrier mostantól a szoba helyén él (a zárat a próba állítja át) */
    _saveLock=saveKey();
    S.idx=14;S.subPlanAsked=KEY;S.h2hPending=null;
    try{subPlanState().rules=[];}catch(e){}
    $("scEuro").classList.add("hide");$("scSim").classList.remove("hide");
    window.__sorok.length=0;},{KOD,KEY,MATE,ME});

  /* ---- 1. TÖBBSZÖRI INDÍTÁS, A HÁLÓZATI VÁRAKOZÁS KÖZBEN IS ---- */
  console.log("\n— 1. a csere-kör többszöri indítása —");
  const elotte=await p.evaluate(()=>({W:S.W,D:S.D,L:S.L,duel:h2hIsDuelRound(),key:h2hKey()}));
  ok(elotte.duel&&elotte.key===KEY,"a 15. forduló párharc, a kulcs "+KEY,elotte);
  await p.evaluate(async()=>{
    h2hBeginDuel();
    for(const ms of [120,200,260,400,500]){await new Promise(r=>setTimeout(r,ms));h2hBeginDuel();}});
  await p.waitForFunction(()=>S.playing||window.__motor>0,null,{timeout:30000,polling:20});
  /* ---- 3a. a meccs ALATT a mentés még őrzi az elköteleződést ---- */
  const kozben=await p.evaluate(()=>{let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    return {pend:d&&d.S&&d.S.h2hPending,raw:localStorage.getItem(saveKey())};});
  /* ---- 2. futó párharc mellett semmi nem indít második meccset ---- */
  const masodik=await p.evaluate(async()=>{
    const m0=window.__motor;
    try{document.getElementById("euroKickBtn").onclick();}catch(e){}
    try{kickoffTap();}catch(e){}
    try{await h2hBeginDuel();}catch(e){}
    const sc=h2hScript;h2hScript={sim:{events:[]},round:15,oppName:"X",iAmHome:true};playMatch();
    const szkriptElevult=h2hScript===null;h2hScript=sc;
    await new Promise(r=>setTimeout(r,1500));
    return {plusz:window.__motor-m0,szkriptElevult};});
  ok(masodik.plusz===0,"futó párharc mellett a kupa és a bajnoki Kezdőrúgás, egy újabb csere-kör és a playMatch sem indít második meccset",masodik);
  ok(masodik.szkriptElevult,"a futó meccs mellé érkező párharc-szkript elévül");
  await p.waitForFunction(()=>!S.playing&&S.idx===15,null,{timeout:90000,polling:50});
  await p.waitForTimeout(300);
  const utana=await p.evaluate(()=>{
    const sorok=window.__sorok;
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    return {motor:window.__motor,felsorakozik:sorok.filter(t=>/felsorakozik/.test(t)).length,
      lezarult:sorok.filter(t=>/A párharc lezárult/.test(t)).length,
      W:S.W,D:S.D,L:S.L,idx:S.idx,pend:S.h2hPending,mentettPend:d&&d.S&&d.S.h2hPending,
      eredm:(S.results||[]).slice(-1)[0]||null};});
  const meccsek=(utana.W+utana.D+utana.L)-(elotte.W+elotte.D+elotte.L);
  ok(utana.motor===1,"a motor pontosan EGYSZER indult (hat indítási kísérletből)",utana.motor);
  ok(utana.felsorakozik===1&&utana.lezarult===1,"egy közvetítés: egy „felsorakozik” és egy „lezárult” sor",{f:utana.felsorakozik,l:utana.lezarult});
  ok(meccsek===1&&utana.idx===15,"egy könyvelt eredmény, a forduló egyet lépett",{meccsek,idx:utana.idx});
  /* ---- 3. elköteleződés: a meccs alatt mentve, a lefújás oldja ---- */
  console.log("\n— 3. az elköteleződés a lefújásig —");
  ok(kozben.pend&&kozben.pend.key===KEY,"a meccs ALATT a mentésben ott az elköteleződés",kozben.pend);
  ok(!utana.pend&&!utana.mentettPend,"a lefújás feloldotta (memóriában és a mentésben is)",{pend:utana.pend,mentett:utana.mentettPend});

  /* ---- 4. VISSZATÉRÉS A MECCS KÖZBEN MENTETT ÁLLAPOTBÓL ---- */
  console.log("\n— 4. kilépés a meccs közben, visszatérés —");
  const kulcs=await p.evaluate(()=>saveKey());
  const elsoEredm=await p.evaluate(()=>{const r=(window.__sorok||[]).filter(t=>/A párharc lezárult/.test(t));return r[0]||null;});
  await p.evaluate(({k,raw})=>{localStorage.setItem(k,raw);},{k:kulcs,raw:kozben.raw});
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1500);
  await halozat();
  const vissza=await p.evaluate(({k,KOD})=>{
    const d=JSON.parse(localStorage.getItem(k));
    window.__sorok.length=0;
    loadIntoGame(d,k);
    MP.active=true;MP.activeRoom=KOD;MP.started=true;
    $("mpEntry").classList.add("hide");
    resumeUIFromSave();
    return {forced:typeof _h2hForced!=="undefined"&&_h2hForced,
      kick:$("kickBtn").disabled,hub:$("matchHubBtn").classList.contains("hide"),
      var:!$("h2hWait").classList.contains("hide")||S.playing};},{k:kulcs,KOD});
  ok(vissza.forced&&vissza.kick&&vissza.hub,"visszatérve azonnal a párharc: nincs Kezdőrúgás, nincs HUB",vissza);
  await p.waitForFunction(()=>window.__motor>0,null,{timeout:30000,polling:20});
  await p.waitForFunction(()=>!S.playing&&S.idx===15,null,{timeout:90000,polling:50});
  await p.waitForTimeout(300);
  const vissza2=await p.evaluate(()=>({motor:window.__motor,
    lez:(window.__sorok||[]).filter(t=>/A párharc lezárult/.test(t)),pend:S.h2hPending}));
  ok(vissza2.motor===1&&vissza2.lez.length===1,"a párharc egyszer, elölről játszódik le",{motor:vissza2.motor,n:vissza2.lez.length});
  ok(vissza2.lez[0]===elsoEredm,"ugyanaz az eredmény, mint a megszakítás előtt",{elso:elsoEredm,most:vissza2.lez[0]});
  ok(!vissza2.pend,"a lefújás után nincs függő elköteleződés");

  /* ---- 5. KUPA-PÁRHARC: a közvetítés-képernyő van elöl ---- */
  console.log("\n— 5. kupa-párharcba visszatérve —");
  const kupa=await p.evaluate(()=>{
    const _c=mpCupDuelNow,_b=h2hBeginDuel;
    mpCupDuelNow=()=>true;h2hBeginDuel=()=>{};
    $("scSim").classList.add("hide");$("scEuro").classList.remove("hide");
    h2hResumeForced();
    const o={euro:!$("scEuro").classList.contains("hide"),sim:!$("scSim").classList.contains("hide")};
    mpCupDuelNow=_c;h2hBeginDuel=_b;_h2hForced=false;
    return o;});
  ok(!kupa.euro&&kupa.sim,"a kupa-képernyő (élesített Kezdőrúgással) nem marad elöl — a közvetítés látszik",kupa);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
