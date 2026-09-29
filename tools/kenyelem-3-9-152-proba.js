/* 🧰 3.9.152 — CSERETERVEK, FEJLŐDÉSI GÖRBE, FEKVŐ TALIZMÁN, ÉRTESÍTÉS, RANGLISTA.

   A felhasználó listájából (idézve):
     · „Menthető csere tervek, amiben akármennyi csere scenario lehet
       egyszerre" és „Csere ki bekapcsolása anélkül hogy az aktuális
       cserebeállítások eltűnnének"
     · „Legyen egy fejlődés követő görbéje minden játékosnak amit meg lehet
       nézni a saját adatlapján a HUBban"
     · „Telefonos fekvő módban nem látszanak jól a talizmánok"
     · „Nem minden platformon lehet bekapcsolni az értesítést"
     · „Legyen aktuális havi ranglista a karrier Run szinteknél globálban.
       Minden Run eredmény, ami 09.08. előtti, legyen levéve a mindenkori
       globál ranglistáról, csak a hely ranglistán maradjon meg"

   Amit mér:
     1. CSERETERVEK: mentés névvel (akárhány), betöltés MÁSOLATKÉNT,
        felülírás, törlés; a kikapcsolás és a párharc „nem cserélek" gombja a
        tervet MEGTARTJA (a párharcnál csak arra a meccsre marad ki a drótról);
     2. FEJLŐDÉSI GÖRBE: a valódi meccs utáni lánc pontot ír, csak változáskor;
        a tömb korlátos; a távozók görbéje idényenként törlődik; a valódi
        játékoslapon ott az SVG;
     3. FEKVŐ TELEFON: a talizmán-menü két oszlop, a gyűjtemény vízszintes
        polc; a húzás három lapja egymás mellett;
     4. ÉRTESÍTÉS: iPhone-on (Safari-lap) és beépített böngészőben a valódi
        pushSubscribe a teendőt mondja; a régi, callback-es engedélykérés is
        átmegy;
     5. RANGLISTA: a határnap előtti futás nem megy fel; a mindenkori lista
        nem mutatja; a havi fül az e havi elérést; az `ach` mező felmegy, és a
        régi szabályfájl elutasításánál a feltöltés visszaesik a régi alakra;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9189;
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
const karrier=()=>{
  gameMode="career";
  enterCareerSetupFromHome(true);
  beginNewGame();
  const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
  showChemistry=()=>{};
  S.pyr=null;S.idx=0;
  pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
  pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
  renderPyrDivPick();pyrConfirmDiv();
  if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
  slots.forEach((sl,i)=>{
    if(sl.player)return;
    const src=sq.players[i%sq.players.length];
    const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
    sl.player=pl;sl.fit=fitFor(pl,sl);});
  slots.forEach(sl=>{if(!sl.player)return;
    if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr+6,pot:3000};
    const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
  if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
  phase="season";S.seasonNumber=3;S.idx=5;S.transferBudget=5e9;
  addLine=()=>{};saveGame=()=>{};};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const errs=[];
  const oldal=async(ctxOpts)=>{
    const p=await (await b.newContext(Object.assign({viewport:{width:430,height:900}},ctxOpts||{}))).newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/firebase|gstatic|Failed to load resource/i.test(m.text()))errs.push(m.text());});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.waitForTimeout(1200);
    await p.waitForFunction(()=>typeof subPlanSaveAs==="function",null,{timeout:15000});
    return p;};
  const p=await oldal();
  await p.evaluate(karrier);

  /* ---- 1. CSERETERVEK ---- */
  const c=await p.evaluate(()=>{
    const ki={};
    S.subPlan=null;S.halftimeSubs=true;
    const P=subPlanState();
    P.rules=[mpSubNewRule()];P.rules[0].min=60;
    const a=subPlanSaveAs("Vezetünk");
    P.rules=[mpSubNewRule(),mpSubNewRule()];P.rules[0].min=46;P.rules[1].min=70;S.subHalftimeStop=false;
    const b2=subPlanSaveAs("Hátrányban");
    for(let i=0;i<6;i++)subPlanSaveAs("Tartalék "+i);
    ki.db=subPlanPlans().length;
    subPlanLoad(a);
    ki.betolt={n:P.rules.length,min:P.rules[0].min,aktiv:P.aktiv===a,stop:S.subHalftimeStop};
    /* másolat: a futó terv szerkesztése nem rontja a mentettet */
    P.rules[0].min=80;
    ki.masolat=subPlanPlans().find(x=>x.id===a).rules[0].min===60;
    subPlanOverwrite(a);
    ki.felulir=subPlanPlans().find(x=>x.id===a).rules[0].min===80;
    subPlanLoad(b2);ki.b2={n:P.rules.length,stop:S.subHalftimeStop};
    subPlanDelete(a);ki.torol=!subPlanPlans().some(x=>x.id===a);
    /* a tervező felülete: a mentett tervek blokkja és a gombok */
    openSubPlanner({duel:false});
    ki.felulet=!!document.querySelector("#mpSubBody [data-subplan]")&&!!$("mpsPlanSave");
    /* a kikapcsolás a tervet megtartja */
    const n0=P.rules.length;
    $("mpSubNoBtn").click();
    ki.ki={be:S.halftimeSubs,maradt:subPlanRules().length===n0,tervek:subPlanPlans().length};
    renderHalftimeSubsBtn();ki.hubSzoveg=$("hubHalftimeSubsDs").textContent;
    /* párharc: a „nem cserélek" csak erre a meccsre veszi le a drótról */
    S.halftimeSubs=true;
    const _k=h2hKey;h2hKey=()=>"proba-kulcs";
    try{
      openSubPlanner({duel:true,key:"proba-kulcs"});
      $("mpSubNoBtn").click();
      ki.parharc={maradt:subPlanRules().length===n0,skip:S.subPlanSkip,
        kihagyva:subPlanSkipped(),drot:h2hWireSnapshot().plan.length};
      h2hKey=()=>"masik-kulcs";
      ki.masikMeccs={kihagyva:subPlanSkipped(),drot:h2hWireSnapshot().plan.length,
        ervenyes:subPlanRules().filter(mpSubRuleValid).length};
    }finally{h2hKey=_k;}
    return ki;});
  console.log("\n— 1. CSERETERVEK —");
  ok(c.db===8,"akárhány terv menthető (itt 8)",c.db);
  ok(c.betolt.n===1&&c.betolt.min===60&&c.betolt.aktiv&&c.masolat&&c.felulir,"a betöltés MÁSOLAT — a szerkesztés nem rontja a mentettet; a felülírás visszaírja",c);
  ok(c.b2.n===2&&c.b2.stop===false&&c.torol,"a félidei megállás is a terv része; a törlés működik",c.b2);
  ok(c.felulet,"a tervezőben ott a mentett tervek blokkja és a mentés gombja");
  ok(c.ki.be===false&&c.ki.maradt&&c.ki.tervek===7&&/megvan|visszajön/.test(c.hubSzoveg),"a kikapcsolás a tervet és a mentetteket MEGTARTJA — a HUB ki is mondja",c.ki);
  ok(c.parharc.maradt&&c.parharc.skip==="proba-kulcs"&&c.parharc.kihagyva&&c.parharc.drot===0
     &&!c.masikMeccs.kihagyva&&c.masikMeccs.drot===c.masikMeccs.ervenyes,
     "párharcban a „nem cserélek” csak arra a meccsre veszi le a tervet — a következőn újra fut",{p:c.parharc,masik:c.masikMeccs});

  /* ---- 2. FEJLŐDÉSI GÖRBE ---- */
  const g=await p.evaluate(()=>{
    const ki={};
    const pl=slots[4].player,e=careerPool[pl.n];
    delete e.dh;S.dhPrune=null;
    S.idx=5;devHistTick();
    const h0=(e.dh||[]).length;
    devHistTick();ki.nemDuplaz=(e.dh||[]).length===h0;
    e.startRating+=2;S.idx=6;devHistTick();
    ki.pont=e.dh[e.dh.length-1];
    ki.h=(e.dh||[]).length;
    /* korlát */
    for(let i=0;i<400;i++){e.startRating+=(i%2?1:-1);S.idx=7+i;devHistTick();}
    ki.korlat=e.dh.length<=DEV_HIST_MAX&&e.dh[0][2]!=null;
    /* a távozó görbéje az idényváltás után törlődik */
    const kint=Object.values(careerPool).find(x=>x&&!slots.some(s=>s.player&&s.player.n===x.n));
    kint.dh=[[1,0,70]];
    S.seasonNumber=4;S.idx=1;devHistTick();
    ki.torolt=!kint.dh;
    /* a valódi játékoslap */
    const d=buildHubDetail({type:"slot",idx:4,p:pl});
    ki.svg=!!d.querySelector("svg polyline")&&/Kezdet/.test(d.textContent);
    return ki;});
  /* az afterAllRewards belső függvény — a forrásból nézzük */
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  console.log("\n— 2. FEJLŐDÉSI GÖRBE —");
  ok(g.nemDuplaz&&g.pont[0]===3&&g.pont[1]===6&&g.h>=2,"pont csak változáskor kerül a görbére (idény, forduló, Rating)",g.pont);
  ok(g.korlat,"a tömb korlátos, a legelső pont megmarad");
  ok(g.torolt,"a távozó játékos görbéje az idényváltáskor törlődik (a mentés mérete)");
  /* 3.9.171: a lánc lépései a rögzített sorsolás burkában (utoLepes) futnak */
  ok(/tryAcademyOpportunity\(\(\)=>(?:utoLepes\(\(\)=>)?\{\s*try\{devHistTick\(\);\}catch\(e\)\{\}\s*talPostMatch/.test(src),"a valódi meccs utáni lánc minden meccs után hívja");
  ok(g.svg,"a valódi játékoslapon ott a görbe (SVG)");

  /* ---- 3. FEKVŐ TELEFON ---- */
  const pl=await oldal({viewport:{width:844,height:390}});
  const f=await pl.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    phase="season";S.seasonNumber=3;S.tal=null;const T=talState();
    T.lapok=["scout","stilus","taktika","meccs","bank","joker"].map((k,i)=>{const L=talUjLap(rngFor("f"+i),k,1+(i%4),{spec:true});L.uid=i+1;return L;});
    T.seq=6;_talAlapMemo=null;
    talMenuOpen();
    const gr=getComputedStyle($("talGrid")),bd=getComputedStyle(document.querySelector("#talModal .talMenuBody"));
    const lapok=[...document.querySelectorAll("#talGrid .talCard")].map(x=>x.getBoundingClientRect());
    const ki={flow:gr.gridAutoFlow,oszlop:bd.gridTemplateColumns.split(" ").length,
      egySor:lapok.length>1&&lapok.every(r=>Math.abs(r.top-lapok[0].top)<2),
      belefer:lapok.every(r=>r.height<=390)};
    talMenuClose();
    T.varo=[{id:"x",forras:"utem",n:1,szezon:3,fordulo:4}];talDrawOpen(()=>{});
    const h=[...document.querySelectorAll("#talDrawCards .talCard")].map(x=>x.getBoundingClientRect());
    ki.huzas=h.length===3&&h.every(r=>Math.abs(r.top-h[0].top)<2);
    return ki;});
  console.log("\n— 3. FEKVŐ TELEFON —");
  ok(f.oszlop===2&&/column/.test(f.flow)&&f.egySor&&f.belefer,"a talizmán-menü két oszlop, a gyűjtemény vízszintes polc, a lapok beférnek",f);
  ok(f.huzas,"a húzás három lapja egymás mellett");

  /* ---- 4. ÉRTESÍTÉS ---- */
  const iph=await oldal({userAgent:"Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"});
  const i1=await iph.evaluate(async()=>(await pushSubscribe()).miert);
  const msg=await oldal({userAgent:"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 [FBAN/MessengerForAndroid;FBAV/450.0]"});
  const m1=await msg.evaluate(async()=>(await pushSubscribe()).miert);
  const leg=await p.evaluate(async()=>{
    const _r=Notification.requestPermission;
    /* a régi Safari: callback, nincs Promise */
    Notification.requestPermission=function(cb){setTimeout(()=>cb("granted"),10);return undefined;};
    try{return await pushKerEngedely();}finally{Notification.requestPermission=_r;}});
  console.log("\n— 4. ÉRTESÍTÉS —");
  ok(/Főképernyőhöz/.test(i1||""),"iPhone Safari-lapon: a teendő (Főképernyőhöz adás)",i1);
  ok(/beépített böngész/.test(m1||""),"beépített böngészőben (Messenger): nyisd meg a rendes böngészőben",m1);
  ok(leg==="granted","a régi, callback-es engedélykérés is átmegy",leg);

  /* ---- 5. RANGLISTA ---- */
  const r=await p.evaluate(async()=>{
    const ki={};
    profileNick=()=>"Proba";
    const most=Date.now(),hoEleje=lbHonapEleje(most);
    const sor=(k,inf,ach)=>({_k:"x_"+k,v:1,nick:"N"+k,pid:"pid"+k,infRun:inf,infLevel:100,infSeasons:5,ach,at:ach,mode:"dyn"});
    const ehavi=Math.max(hoEleje,LB_CUTOFF)+3600000;          /* ebben a hónapban, a határnap után */
    const rows=[sor(1,90,LB_CUTOFF-86400000),sor(2,80,ehavi),sor(3,70,LB_CUTOFF+86400000*2)];
    _lbTab="all";const all=lbBoardHtml(rows);
    _lbTab="month";const mon=lbBoardHtml(rows);
    _lbTab="all";
    ki.all={n1:all.indexOf("N1")>=0,n2:all.indexOf("N2")>=0,n3:all.indexOf("N3")>=0};
    ki.mon={n1:mon.indexOf("N1")>=0,n2:mon.indexOf("N2")>=0,
      n3ok:(mon.indexOf("N3")>=0)===(LB_CUTOFF+86400000*2>=hoEleje)};
    ki.fulek=/data-lbtab="month"/.test(all);
    /* a feltöltés: a régi futás nem megy fel; az új `ach`-csal; régi szabálynál visszaesik */
    const irasok=[];
    lbNet.mode="on";lbNet.uid="uid1";lbNet.db={};
    let elutasit=true;
    lbNet.fns={ref:(db,p)=>p,set:async(ref,rec)=>{irasok.push(Object.assign({},rec));
      if(elutasit&&rec.ach!=null){const e=new Error("PERMISSION_DENIED: Permission denied");throw e;}}};
    const regi=await lbUploadRow({id:"a",run:50,infRun:50,infLevel:100,at:LB_CUTOFF-5000,team:"T"});
    ki.regi=regi;
    const uj=await lbUploadRow({id:"b",run:60,infRun:60,infLevel:100,at:most-60000,team:"T"});
    ki.uj={ok:uj.ok,db:irasok.length,elso:irasok[0]&&irasok[0].ach,masodik:irasok[1]&&("ach" in irasok[1])};
    elutasit=false;irasok.length=0;
    const uj2=await lbUploadRow({id:"c",run:61,infRun:61,infLevel:100,at:most-60000,team:"T"});
    ki.uj2={ok:uj2.ok,db:irasok.length,ach:irasok[0]&&irasok[0].ach};
    return ki;});
  console.log("\n— 5. RANGLISTA —");
  ok(!r.all.n1&&r.all.n2&&r.all.n3&&r.fulek,"a mindenkori listán a 09.08. előtti futás nem látszik; két fül van",r.all);
  ok(!r.mon.n1&&r.mon.n2&&r.mon.n3ok,"a havi fül az e havi (határnap utáni) elérést mutatja",r.mon);
  ok(r.regi.ok===false&&/09\.08/.test(r.regi.reason),"a határnap előtti futás fel sem megy — a helyi listán marad",r.regi);
  ok(r.uj.ok&&r.uj.db===2&&r.uj.elso>0&&r.uj.masodik===false,"az `ach` felmegy; a régi szabályfájl elutasításánál a régi alakkal újraír",r.uj);
  ok(r.uj2.ok&&r.uj2.db===1&&r.uj2.ach>0,"az új szabályfájllal egyetlen írás, `ach`-csal",r.uj2);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
