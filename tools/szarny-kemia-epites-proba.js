/* ⚡ A SZÁRNY-KÉMIA ÉPÍTÉSE — mint minden más kémia (3.9.143).

   BEJELENTETT HIBA ÉS KÉRÉS: „A szárny kémia ugyanúgy láthatatlanul épül,
   ráadásul egy első szezonbeli páros épül, amit rég lecseréltem, ezért
   elakadt, de beragadt. Legyen ez is olyan mint minden más kémia építés.
   Minden mechanikát ültessünk át."

   Amit mér:
     1. A RÉGI MENTÉS: a kész pár kész marad, a magától indult félkész pár
        fázist kap a közös meccseiből, és nincs „futó" pár — a folytatás a
        te döntésed;
     2. A BERAGADÁS OKA MEGSZŰNT: a félbemaradt pár (egy tagja már nincs a
        klubnál) nem foglalja a szárnyat, ugyanarra az oldalra új pár indulhat;
     3. A TICK MÁR NEM INDÍT párt;
     4. A FELAJÁNLÁS A VALÓDI MECCS UTÁNI LÁNCBAN: a választó a rendszer
        ajánlatával nyílik; a választás elindítja (1/5); a következő
        felajánlás a futó párat hozza „koppints a továbbépítéshez" sorral; a
        váltás megtartja a fázisokat;
     5. VÉGIGJÁTSZÁSNÁL a gép lép, és a pár elkészül;
     6. A KÉSZ PÁR: a gólesély-szorzó él, a közös meccsek összeérést hoznak, a
        sebesség fölfelé kiegyenlítődik;
     7. A PANEL a valódi állapotot mondja (fázis, kész, félbemaradt, ki nincs
        már a klubnál), és a mentés viszi a futó párt;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9161;
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
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof showSzarnyBuild==="function",null,{timeout:15000});

  const fx=await p.evaluate(()=>{
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
    /* a kerettagok SAJÁT posztja a slot posztja — így a szárny-emberek
       (JV/JSZ, BV/BSZ) tényleg a helyükön állnak, közeli sebességgel */
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:[sl.pos],age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];e.pos=[sl.pos];sl.player.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);
      e.attrs.seb=88+(["JV","BV"].indexOf(sl.pos)>=0?0:2);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=0;
    S.style={key:"villam",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
    window._slReal=styleLevel;window.styleLevel=()=>10;   /* 2. fokozat */
    return {posok:slots.map(s=>s.pos),on:szarnyOn(),tier:szarnyTier()};});
  const kell=["JV","JSZ","BV","BSZ"];
  if(!kell.every(x=>fx.posok.indexOf(x)>=0)){
    console.log("  ⚠️  a fixtúra felállásában nincs meg mind a négy szárny-poszt:",fx.posok.join(","));}

  /* ---- 1-3. MIGRÁCIÓ, FELSZABADULÁS, TICK ---- */
  const m=await p.evaluate(()=>{
    const ki={};
    const nev=pos=>slots.find(s=>s.pos===pos).player.n;
    const JV=nev("JV"),JSZ=nev("JSZ"),BV=nev("BV"),BSZ=nev("BSZ");
    ki.nevek={JV,JSZ,BV,BSZ};
    /* a bejelentés helyzete: egy első idényes pár a jobb oldalon, akinek az
       egyik tagja RÉG ELMENT — és egy kész pár a bal oldalon */
    careerPool["Régi Jobbszélső"]={n:"Régi Jobbszélső",pos:["JSZ"],attrs:{seb:89},age:27};
    S.szarny={};
    S.szarny[szarnyKey(JV,"Régi Jobbszélső")]={n:6};
    S.szarny[szarnyKey(BV,BSZ)]={n:14,done:1};
    S.szarnyMig=0;S.szarnyInProgress="bármi";
    const D=szarnyState();
    const regi=D[szarnyKey(JV,"Régi Jobbszélső")],kesz=D[szarnyKey(BV,BSZ)];
    ki.mig={regi:{st:regi.stages,n:regi.n,built:!!regi.built},kesz:{built:!!kesz.built,st:kesz.stages,done:!!kesz.done},
      fut:S.szarnyInProgress,mig:S.szarnyMig};
    ki.jobbSzabad=!szarnySideTaken("J");
    ki.ujJobb=szarnyPairOk(JV,JSZ);
    ki.balFoglalt=szarnySideTaken("B");
    ki.kesz=szarnyDone();
    /* a kész pár tagja elmegy → a bal szárny felszabadul */
    const _fcr=fullCareerRoster;
    window.fullCareerRoster=()=>_fcr().filter(x=>x&&x.n!==BSZ);
    ki.balSzabadUtana=!szarnySideTaken("B");
    window.fullCareerRoster=_fcr;
    /* a tick nem indít */
    S.szarny={};S.szarnyMig=1;S.szarnyInProgress=null;
    szarnyTick(new Set([JV,JSZ,BV,BSZ]));
    ki.tick=Object.keys(S.szarny).length;
    return ki;});
  console.log("\n— 1-3. MIGRÁCIÓ, FELSZABADULÁS, TICK —");
  ok(m.mig.kesz.built&&m.mig.kesz.st===5&&m.mig.kesz.done,"régi mentés: a kész szárny kész marad",m.mig.kesz);
  ok(m.mig.regi.st>=1&&m.mig.regi.st<5&&!m.mig.regi.built&&m.mig.regi.n===0,"a magától indult félkész pár fázist kap a közös meccseiből",m.mig.regi);
  ok(m.mig.fut===null&&m.mig.mig===1,"migráció után nincs futó pár — a folytatás a te döntésed",m.mig);
  ok(m.jobbSzabad&&m.ujJobb,"A BERAGADÁS OKA: a félbemaradt pár (egy tagja már nincs a klubnál) nem foglalja a jobb szárnyat, új pár indulhat",m);
  ok(m.balFoglalt&&m.kesz===1,"az élő kész pár foglalja a saját oldalát",m);
  ok(m.balSzabadUtana,"…amíg a tagja el nem megy: akkor a szárny felszabadul");
  ok(m.tick===0,"a meccs utáni tick magától nem indít párt",m.tick);

  /* ---- 4. A FELAJÁNLÁS A VALÓDI LÁNCBAN ---- */
  /* EGY VALÓDI MECCS UTÁNI LÁNC, amíg a szárny-képernyő elő nem jön (a
     párkémia 15%-os dobása elviheti az okot — akkor a következő meccs jön).
     A jutalom-okot a „balance" adja: az a sor nem meccsteljesítményből jön,
     tehát minden meccsen ott lehet. */
  const lanc=async()=>p.evaluate(async()=>{
    const ki={meccs:0};
    const _add=addLine;addLine=()=>{};
    const _bst=balanceSkillTick;balanceSkillTick=()=>true;
    const szarnyLathato=()=>{const sk=$("scSkill");return sk&&!sk.classList.contains("hide")&&/Szárny/.test($("skillTitle").textContent);};
    try{
      for(let m=0;m<6&&!szarnyLathato();m++){
        ki.meccs++;
        S.auto=false;matchSpeed=20;S.halftimeSubs=false;S.unavailable={};S.lastMatch=null;
        if(!S.fixtures||!S.fixtures.length)buildSeasonFixtures();
        const idx0=S.idx;
        playMatch();
        for(let i=0;i<400;i++){
          await new Promise(r=>setTimeout(r,50));
          if(szarnyLathato())break;
          const sk=$("scSkill");
          if(sk&&!sk.classList.contains("hide")&&typeof skillResumeCb==="function"){
            const c=skillResumeCb;skillResumeCb=null;sk.classList.add("hide");c();continue;}
          if(!$("scUnlock").classList.contains("hide")){const ub=document.querySelector("#unlockActions button");if(ub)ub.click();continue;}
          if(S.idx>idx0&&!$("mstatModal").classList.contains("hide")){try{mstatClose();}catch(e){}break;}}}
    }finally{addLine=_add;balanceSkillTick=_bst;}
    ki.cim=$("skillTitle").textContent;
    ki.ajanlott=!!document.querySelector("#skillAssignList [data-imm-ajanl]");
    ki.tovabb=!!document.querySelector("#skillAssignList #chemGoOn");
    ki.valtas=[...document.querySelectorAll("#skillAssignList button")].some(x=>/másik szárnyat/.test(x.textContent));
    ki.sorok=document.querySelectorAll("#skillAssignList .prow").length;
    return ki;});
  await p.evaluate(()=>{
    S.szarny={};S.szarnyMig=1;S.szarnyInProgress=null;
    /* minden felajánlás a szárnyé legyen, és a többi kötés ne vigye el */
    window._sop=szarnyOfferP;szarnyOfferP=()=>1;
    window._pco=passChemOn;passChemOn=()=>false;
    window._gpo=gpDuoOn;gpDuoOn=()=>false;
    window._ud=underdogFactor;underdogFactor=()=>0;
    /* a párkémia 15%-os ága se vigye el: a felajánlás-lánc elejét rögzítjük */
    S.firstChemDone=true;});
  const l1=await lanc();
  const v1=await p.evaluate(()=>{
    const ki={};
    const aj=document.querySelector("#skillAssignList [data-imm-ajanl]");
    if(aj)aj.click();
    const k=S.szarnyInProgress;
    ki.fut=k;ki.st=k?szarnyState()[k].stages:0;
    /* a lánc továbbment: a szárny-választó eltűnt (a következő jutalom-ok
       megnyithatja a saját képernyőjét — az már nem a szárnyé) */
    ki.lezar=$("scSkill").classList.contains("hide")||!/válassz szárnyat/.test($("skillTitle").textContent);
    if(!$("scSkill").classList.contains("hide")&&typeof skillResumeCb==="function"){
      const c=skillResumeCb;skillResumeCb=null;$("scSkill").classList.add("hide");c();}
    return ki;});
  console.log("\n— 4. A FELAJÁNLÁS A VALÓDI LÁNCBAN —");
  ok(/Szárny-kémia — válassz szárnyat/.test(l1.cim)&&l1.ajanlott&&l1.sorok>=2,"a meccs után a választó nyílik, a rendszer ajánlatával",l1);
  ok(v1.fut&&v1.st===1&&v1.lezar,"az ajánlott koppintása elindítja a párat (1/5), és a lánc továbbmegy",v1);
  const l2=await lanc();
  const v2=await p.evaluate(()=>{
    const ki={};
    const k=S.szarnyInProgress;
    document.querySelector("#skillAssignList #chemGoOn").click();
    ki.st=szarnyState()[k].stages;
    return ki;});
  ok(/Szárny-kémia \(1\/5 fázis\)/.test(l2.cim)&&l2.tovabb&&l2.valtas,"a következő felajánlás a futó párat hozza, továbbépítés- és váltás-gombbal",l2);
  ok(v2.st===2,"a koppintás a következő fázist építi (2/5)",v2);
  /* váltás: a fázisok megmaradnak */
  const v3=await p.evaluate(async()=>{
    const ki={};
    const k=S.szarnyInProgress;
    showSzarnyBuild(()=>{});
    const btn=[...document.querySelectorAll("#skillAssignList button")].find(x=>/másik szárnyat/.test(x.textContent));
    btn.click();
    await new Promise(r=>setTimeout(r,100));
    const igen=[...document.querySelectorAll("button")].find(x=>/Igen, másikat választok/.test(x.textContent)&&x.offsetParent);
    if(igen)igen.click();
    await new Promise(r=>setTimeout(r,100));
    ki.fut=S.szarnyInProgress;ki.megmaradt=szarnyState()[k].stages;
    ki.valaszto=/válassz szárnyat/.test($("skillTitle").textContent);
    $("scSkill").classList.add("hide");skillResumeCb=null;
    return ki;});
  ok(v3.fut===null&&v3.megmaradt===2&&v3.valaszto,"a váltás a választóba visz, és a félkész pár fázisai megmaradnak",v3);

  /* ---- 5. VÉGIGJÁTSZÁS ---- */
  const a=await p.evaluate(async()=>{
    const ki={};
    S.szarny={};S.szarnyMig=1;S.szarnyInProgress=null;
    const _add=addLine;addLine=()=>{};
    const _atg=autoTitleGate;autoTitleGate=()=>false;
    /* minden meccs után jár jutalom-kör: a szárny a jutalom-sorban épül, és a
       sorsolt jutalom-körökkel 12 fordulóban az 5 fázis csak ÁLTALÁBAN jött
       össze (a próba így véletlenszerűen bukott) */
    const _bst=balanceSkillTick;balanceSkillTick=()=>true;
    try{
      S.auto=true;S.idx=0;buildSeasonFixtures();
      playMatch();
      for(let i=0;i<1500&&S.idx<12;i++)await new Promise(r=>setTimeout(r,50));
    }finally{S.auto=false;addLine=_add;autoTitleGate=_atg;balanceSkillTick=_bst;}
    await new Promise(r=>setTimeout(r,400));
    const D=szarnyState();
    ki.parok=Object.keys(D).map(k=>({st:D[k].stages,built:!!D[k].built}));
    ki.kesz=szarnyDone();ki.idx=S.idx;
    return ki;});
  console.log("\n— 5. VÉGIGJÁTSZÁS —");
  ok(a.kesz>=1&&a.parok.some(x=>x.built&&x.st===5),"végigjátszásnál a gép lép, és a szárny elkészül (5/5)",a);

  /* ---- 6. A KÉSZ PÁR: SZORZÓ ÉS ÖSSZEÉRÉS ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    S.szarny={};S.szarnyMig=1;S.szarnyInProgress=null;
    const nev=pos=>slots.find(s=>s.pos===pos).player.n;
    const JV=nev("JV"),JSZ=nev("JSZ");
    careerPool[JV].attrs.seb=86;careerPool[JSZ].attrs.seb=89;
    const act=ns=>ns.map(n=>({p:{n},bus:0}));
    for(let i=0;i<4;i++)szarnyAddStage(JV,JSZ);
    ki.felkesz=szarnyGoalMult(act([JV,JSZ]),new Set());
    szarnyAddStage(JV,JSZ);
    ki.kesz=szarnyGoalMult(act([JV,JSZ]),new Set());
    ki.egyik=szarnyGoalMult(act([JV]),new Set());
    const need=szarnyRipeNeed();ki.need=need;
    for(let i=0;i<need;i++)szarnyTick(new Set([JV,JSZ]));
    const r=szarnyState()[szarnyKey(JV,JSZ)];
    ki.done=!!r.done;ki.seb=[Math.round(careerPool[JV].attrs.seb),Math.round(careerPool[JSZ].attrs.seb)];
    return ki;});
  console.log("\n— 6. A KÉSZ PÁR —");
  ok(k.felkesz===1&&k.kesz>1&&k.egyik===1,"a gólesély-szorzó csak a KÉSZ párnál és csak mindkettejük pályán létekor él",k);
  ok(k.done&&k.seb[0]===k.seb[1]&&k.seb[0]>=89,`${k.need} közös meccs után összeér, és a sebességük fölfelé kiegyenlítődik`,k);

  /* ---- 7. PANEL ÉS MENTÉS ---- */
  const pm=await p.evaluate(()=>{
    const ki={};
    const nev=pos=>slots.find(s=>s.pos===pos).player.n;
    const BV=nev("BV"),BSZ=nev("BSZ");
    S.szarny[szarnyKey(BV,"Régi Balszélső")]={stages:3,n:0};
    careerPool["Régi Balszélső"]={n:"Régi Balszélső",pos:["BSZ"],attrs:{seb:88},age:28};
    S.szarny[szarnyKey(BV,BSZ)]={stages:2,n:0};S.szarnyInProgress=szarnyKey(BV,BSZ);
    let h="";
    try{h=engSectionHtml("villam");}catch(e){ki.hiba=e.message;}
    const div=document.createElement("div");div.innerHTML=h;ki.txt=div.textContent;
    try{saveGame();}catch(e){}
    let d=null;
    Object.keys(localStorage).forEach(k=>{const v=localStorage.getItem(k);
      if(!d&&v&&v.indexOf('"szarnyInProgress"')>=0&&v.indexOf('"careerPool"')>=0)d=JSON.parse(v);});
    ki.mentes=!!(d&&d.S&&d.S.szarnyInProgress===szarnyKey(BV,BSZ)&&d.S.szarnyMig===1);
    return ki;});
  console.log("\n— 7. PANEL ÉS MENTÉS —");
  ok(/félbemaradt: Régi Balszélső már nincs a klubnál|félbemaradt: .*már nincs a klubnál/.test(pm.txt),"a panel kimondja a félbemaradt párt, és hogy ki nincs már a klubnál",pm.txt);
  ok(/épül \(2\/5 fázis\) · ⚡ ezt építed/.test(pm.txt)&&/összeért/.test(pm.txt),"…a futó pár fázisát, és az összeért párt",pm.txt);
  ok(/5 fázis/.test(pm.txt)&&/felajánlásból épül/.test(pm.txt),"a leírás a felajánlásos építést mondja",pm.txt);
  ok(pm.mentes,"a mentés viszi a futó párt és a migráció jelzőjét");

  await p.evaluate(()=>{szarnyOfferP=window._sop;passChemOn=window._pco;gpDuoOn=window._gpo;underdogFactor=window._ud;styleLevel=window._slReal;});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
