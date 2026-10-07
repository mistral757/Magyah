/* 🎁 3.9.217 — INGYEN IGAZOLHATÓ SCOUT-TALÁLAT, CSAK ÁTIGAZOLÁSI IDŐSZAKBAN

   KIMONDOTT KÉRÉS: „A realisztikus scout is találjon úgy játékost, hogy az
   igazolás ingyenes. Azt szintén az átigazolási ablakban lehessen intézni.
   Arány 33%. És ha a klasszikus scout van bekapcsolva, ezentúl a tőle érkező
   játékosokat is csak átigazolási időszakban lehessen leigazolni (ingyen)."

   Amit mér:
     1. VALÓSÁGHŰ SCOUT: 600 felfedezésből ~33% ingyenes; az ingyenesre nincs
        licit (a licit-hívás is az ingyenes igazolásra vezet), a fizetősre
        nincs ingyenes igazolás;
     2. AZ ABLAK: zárt átigazolási időszakban nem igazolható le; nyitottban
        igen — a büdzsé nem mozdul, a keretbe kerül, lekerül a listáról, a
        mérés „scout:" forrással rögzíti; tele keretnél nem megy;
     3. KLASSZIKUS SCOUT: a felfedezés a listára kerül (ingyenes), NEM a
        keretbe; a felfedező képernyő ezt mondja ki; végigjátszásnál képernyő
        nélkül, csak listára;
     4. A FELÜLET: a panel címe „Felfedezett játékosok", az ingyenes kártya
        gombja zárt ablakban tiltott, nyitottban leigazol; a HUB-gomb a
        klasszikus scoutnál is látszik, és számolja az ingyeneseket; az
        újdonság-figyelő ablakonként egyszer szól. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9259;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrPickGap=2;pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="hub";S.seasonNumber=2;S.idx=0;S.transferBudget=5e9;S.auto=false;
    return {v:APP_VERSION,p:typeof SCOUT_REAL_FREE_P!=="undefined"?SCOUT_REAL_FREE_P:null};});
  ok(String(r0.v).localeCompare("3.9.217",undefined,{numeric:true})>=0,"a verzió legalább 3.9.217",r0.v);
  ok(r0.p===0.33,"az arány 33%",r0.p);

  console.log("\n— 1. a valósághű scout —");
  const r1=await p.evaluate(()=>{
    const o={};
    S.scoutReal=true;S.scoutWatch={v:1,list:[]};
    let n=0,f=0;
    for(let i=0;i<600;i++){const rec=scoutRealDiscover("scoutfind");if(rec){n++;if(rec.free)f++;}}
    o.n=n;o.arany=+(f/n).toFixed(3);
    /* egy ingyenes és egy fizetős */
    S.scoutWatch={v:1,list:[]};
    const szabad=()=>Object.values(careerPool).find(x=>!drafted.has(x.n)&&!scoutRealHas(x.n));
    const fr=scoutRealAdd(szabad(),"scoutfind",true),pay=scoutRealAdd(szabad(),"scoutfind",false);
    o.fizetosIngyen=scoutFreeSign(pay.n);
    const _w=scoutRealWindowOpen;scoutRealWindowOpen=()=>true;
    const b0=S.transferBudget,k0=fullCareerRoster().length;
    o.licitIngyenesre=scoutRealBid(fr.n,0.75);   /* a licit az ingyenes igazolásra vezet */
    o.utana={penz:b0-S.transferBudget,keret:fullCareerRoster().length-k0,listan:scoutRealHas(fr.n),bent:extraRoster.some(x=>x.n===fr.n)};
    scoutRealWindowOpen=_w;
    return o;});
  ok(r1.n>=550&&r1.arany>0.27&&r1.arany<0.39,"600 felfedezésből ~33% ingyenes",r1);
  ok(!r1.fizetosIngyen.ok&&/licitálni kell/.test(r1.fizetosIngyen.msg),"a fizetős kiszemelt ingyen nem igazolható",r1.fizetosIngyen);
  ok(r1.licitIngyenesre.ok&&r1.utana.penz===0&&r1.utana.keret===1&&!r1.utana.listan&&r1.utana.bent,
     "az ingyenesre nincs licit: a licit-hívás is ingyen igazol (0 Ft, keretbe, le a listáról)",r1);

  console.log("\n— 2. az ablak és a keret —");
  const r2=await p.evaluate(()=>{
    const o={};
    S.scoutReal=false;S.scoutWatch={v:1,list:[]};
    const szabad=()=>Object.values(careerPool).find(x=>!drafted.has(x.n)&&!scoutRealHas(x.n));
    const rec=scoutRealAdd(szabad(),"hattrick",true);
    const _w=scoutRealWindowOpen;
    scoutRealWindowOpen=()=>false;
    o.zart=scoutFreeSign(rec.n);
    scoutRealWindowOpen=()=>true;
    /* tele keret */
    const _c=rosterCapParts;rosterCapParts=()=>({free:0});
    o.tele=scoutFreeSign(rec.n);
    rosterCapParts=_c;
    const b0=S.transferBudget,erk0=(meresLoad()&&meresSzezon()&&(meresSzezon().erk||[]).length)||0;
    o.nyitott=scoutFreeSign(rec.n);
    const z=meresSzezon(),erk=(z&&z.erk)||[];
    o.meres=erk.length>erk0?erk[erk.length-1].forras:null;
    o.penz=b0-S.transferBudget;
    scoutRealWindowOpen=_w;
    return o;});
  ok(!r2.zart.ok&&/csak átigazolási időszakban/.test(r2.zart.msg),"zárt ablakban nem igazolható le",r2.zart);
  ok(!r2.tele.ok&&/Tele a keret/.test(r2.tele.msg),"tele keretnél nem megy",r2.tele);
  ok(r2.nyitott.ok&&r2.penz===0,"nyitott ablakban ingyen leigazolja",r2);
  ok(r2.meres==="scout:hattrick","a mérés „scout:<ok>” forrással rögzíti",r2.meres);

  console.log("\n— 3. a klasszikus scout —");
  const r3=await p.evaluate(()=>{
    const o={};
    S.scoutReal=false;S.scoutWatch={v:1,list:[]};S.auto=false;
    const k0=fullCareerRoster().length;
    let cb=false;
    processCareerUnlocksB(["bigwin"],()=>{cb=true;});
    const L=scoutRealState().list;
    o.lista=L.length;o.free=!!(L[0]&&L[0].free);o.klassz=!!(L[0]&&L[0].klassz);
    o.keret=fullCareerRoster().length-k0;
    o.kepernyo=!$("scUnlock").classList.contains("hide");
    o.szoveg=($("unlockBody").textContent||"").replace(/\s+/g," ");
    const gomb=$("unlockActions").querySelector("button");if(gomb)gomb.click();
    o.cb=cb;
    /* végigjátszás: képernyő nélkül */
    S.auto=true;$("scUnlock").classList.add("hide");
    let cb2=false;processCareerUnlocksB(["scoutfind"],()=>{cb2=true;});
    o.auto={lista:scoutRealState().list.length,kepernyo:!$("scUnlock").classList.contains("hide"),cb:cb2,keret:fullCareerRoster().length-k0};
    S.auto=false;
    return o;});
  ok(r3.lista===1&&r3.free&&r3.klassz&&r3.keret===0,"a felfedezés a listára kerül ingyenesként, NEM a keretbe",r3);
  ok(r3.kepernyo&&/Felfedezett játékosok/.test(r3.szoveg)&&/Ingyen/.test(r3.szoveg)&&/átigazolási időszakban/.test(r3.szoveg)&&r3.cb,
     "a felfedező képernyő kimondja: listára került, ingyen, átigazolási időszakban",r3.szoveg.slice(0,260));
  ok(r3.auto.lista===2&&!r3.auto.kepernyo&&r3.auto.cb&&r3.auto.keret===0,"végigjátszásnál képernyő nélkül, csak listára",r3.auto);

  console.log("\n— 4. a felület —");
  const r4=await p.evaluate(()=>{
    const o={};
    const _w=scoutRealWindowOpen;
    scoutRealWindowOpen=()=>false;
    renderScoutWatchPanel();
    o.cim=$("twTitle").textContent;
    const g0=document.querySelector("#twBody [data-srfree]");o.zartGomb=g0?g0.disabled:null;
    try{renderHub();}catch(e){}
    const wb=$("hubWatchBtn");o.hubZart={rejtve:wb.classList.contains("hide"),txt:wb.textContent.replace(/\s+/g," ")};
    scoutRealWindowOpen=()=>true;
    try{renderHub();}catch(e){}
    o.hubNyit=wb.textContent.replace(/\s+/g," ");
    /* az újdonság-figyelő */
    const w=UJ_FIGY.find(x=>x.k==="scoutIngyen");
    o.uj=w?{ids:w.ids(),msg:w.msg().t}:null;
    renderScoutWatchPanel();
    const k0=fullCareerRoster().length,b0=S.transferBudget;
    const g1=document.querySelector("#twBody [data-srfree]");o.nyitGomb=g1?g1.disabled:null;
    if(g1)g1.click();
    o.kattUtan={keret:fullCareerRoster().length-k0,penz:b0-S.transferBudget,uzenet:($("twBody").textContent||"").includes("Leigazoltad, ingyen")};
    scoutRealWindowOpen=_w;
    return o;});
  ok(r4.cim==="🔍 Felfedezett játékosok","a klasszikus scoutnál a panel címe „Felfedezett játékosok”",r4.cim);
  ok(r4.zartGomb===true&&r4.nyitGomb===false,"az ingyenes kártya gombja zárt ablakban tiltott, nyitottban él",[r4.zartGomb,r4.nyitGomb]);
  ok(!r4.hubZart.rejtve&&/Felfedezett játékosok/.test(r4.hubZart.txt)&&/ingyenes — átigazolási időszakban/.test(r4.hubZart.txt)&&/ingyen leigazolható — most/.test(r4.hubNyit),
     "a HUB-gomb a klasszikus scoutnál is látszik, és az ingyeneseket számolja",r4);
  ok(r4.uj&&r4.uj.ids.length===1&&/Ingyen leigazolható/.test(r4.uj.msg),"az újdonság-figyelő nyitott ablakban szól (ablakonként egy azonosító)",r4.uj);
  ok(r4.kattUtan.keret===1&&r4.kattUtan.penz===0&&r4.kattUtan.uzenet,"a gomb ingyen leigazol, és visszajelez",r4.kattUtan);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
