/* 🧲 NYOMÁSGYAKORLÁS, NYOMÁS! A KALAPBAN, PRESSZPONT ÉLŐBEN, ⚡ MECCS-ERŐ AZ
   EREDMÉNYJELZŐN, A TÁRS CÍMERE (3.9.133).

   BEJELENTETT HIBÁK / KÉRÉSEK:
     · „Már bekapcsolt állapot mellett kaptam egy gyors kontra védő képességet.
       Nem lehetett adni csak védőnek."
     · „Vajon a nyomás skill már benn van a kalapban, ha kinyitottam? Még nem
       kaptam meg 1 szezon alatt…"
     · „A nyomáspontokat nem írja ki a feed +ként real time közvetítésben…
       Kicsit lehetne több fajta kommentátori szöveg."
     · „PvP-ben jó lenne látni az ellenfelünk címerét is… és a stadionja nevét."
     · „…minden meccsnél a meccs erő látszódjon az eredményjelzőn is, és
       frissüljön cserékkor, kiállításkor real time."

   Amit mér:
     1. a VÉDŐ-kategória MINDEN képessége (a „Gyors kontra" is) kiosztható
        középpályásnak / csatárnak a Nyomásgyakorlás 1. szintjén — és csak
        akkor; a kimondottan hátvédhez kötött „Villámbeck Queen" nem;
     2. a feloldott „Nyomás!" a MÁR MEGKEVERT pakliba is bekerül, egyszer;
        a zárolt kikerül; a jelző a mentésben utazik;
     3. a „Nyomásra hangolt sorsolás" a hagyományos húzásban is hat;
     4. a labdaszerzés sora kiírja a presszpontot, és a kommentár változatos;
     5. az eredményjelző minden meccsen kiírja mindkét meccs-erőt, a CPU-é
        pontosan az, amivel a motor számol;
     6. VALÓDI MECCSEN a kiállítás élőben lejjebb viszi a kiírt meccs-erőt, és
        egy utána jövő csere NEM adja vissza az emberhátrányt;
     7. a társ arculata fehérlistán megy át (rosszindulatú érték kiesik), és a
        címere megjelenik az eredményjelzőn;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9127;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof eligibleForSkill==="function"&&typeof sbPaintTeams==="function",
    null,{timeout:15000});

  const t=await p.evaluate(()=>{
    const ki={};
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
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    slots.forEach(sl=>{
      if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26};
      const e=careerPool[sl.player.n];
      if(!e.pos)e.pos=sl.player.pos.slice();
      if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    phase="season";S.idx=0;S.morale=70;
    const mk=(k,tr)=>({key:k,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});
    const sk=id=>SKILLS.find(x=>x.id===id);
    const cat=pl=>getCategoryFor(pl.pos[0]);

    /* ---- 1. KIOSZTÁS ---- */
    const kozep=slots.map(s=>s.player).filter(pl=>pl&&cat(pl)==="KOZEPPALYAS"),
          csatar=slots.map(s=>s.player).filter(pl=>pl&&cat(pl)==="CSATAR");
    const elore=[...kozep,...csatar].map(pl=>pl.n);
    const jog=id=>eligibleForSkill(sk(id)).map(pl=>pl.n);
    const elol=id=>jog(id).filter(n=>elore.includes(n)).length;
    S.skills={};
    S.style=mk("gegen",{});S.style2=null;
    ki.kiosztas={elore:elore.length,nelkul:{launch:elol("df_launch"),wall:elol("df_wall")}};
    S.style=mk("gegen",{nyomasgyakorlas:1});
    ki.kiosztas.lv=gpPressLv();
    ki.kiosztas.vele={launch:elol("df_launch"),wall:elol("df_wall"),cannon:elol("df_cannon"),
      queen:elol("sp_queen")};
    ki.kiosztas.vedo={launch:gpIsDefSkill(sk("df_launch")),kane:gpIsDefSkill(sk("fw_kanestyle")),
      motor:gpIsDefSkill(sk("mf_engine"))};

    /* ---- 2. A KALAP ---- */
    S.style=mk("gegen",{nyomasgyakorlas:1});   /* a Nyomás skill MÉG NINCS megvéve */
    S.skillPool=weightedShuffleSkills();S.lockSeed={};
    ki.kalap={zart:S.skillPool.filter(x=>x.id===GP_SKILL_ID).length};
    S.style=mk("gegen",{nyomasgyakorlas:1,nyomas_skill:1});
    ki.kalap.nyitva=gpSkillOn();
    const hossz0=S.skillPool.length;
    poolSyncLocked();
    ki.kalap.utana=S.skillPool.filter(x=>x.id===GP_SKILL_ID).length;
    ki.kalap.hosszNo=S.skillPool.length-hossz0;
    /* kihúzzák — a következő szinkron NEM teszi vissza */
    S.skillPool=S.skillPool.filter(x=>x.id!==GP_SKILL_ID);
    poolSyncLocked();
    ki.kalap.ujra=S.skillPool.filter(x=>x.id===GP_SKILL_ID).length;
    /* a filozófia lekerül: a zárolt kikerül, a jelző törlődik */
    S.skillPool.splice(3,0,sk(GP_SKILL_ID));
    S.style=mk("villam",{});
    poolSyncLocked();
    ki.kalap.lezarva={db:S.skillPool.filter(x=>x.id===GP_SKILL_ID).length,jelzo:!!S.lockSeed[GP_SKILL_ID]};
    /* a mentés viszi a jelzőt */
    S.style=mk("gegen",{nyomasgyakorlas:1,nyomas_skill:1});
    poolSyncLocked();
    let mentve=null;try{
      const _ls=localStorage.getItem.bind(localStorage);
      saveGame();
      const kulcsok=Object.keys(localStorage);
      kulcsok.forEach(k=>{try{const d=JSON.parse(_ls(k));if(d&&d.S&&d.S.lockSeed)mentve=d.S.lockSeed;}catch(e){}});
    }catch(e){mentve="hiba: "+e.message;}
    ki.kalap.mentes=mentve;

    /* ---- 3. A HANGOLT SORSOLÁS ---- */
    const huz=(tr)=>{
      S.style=mk("gegen",tr);
      let n=0;const N=600;
      for(let i=0;i<N;i++){
        S.skillPool=weightedShuffleSkills();S.lockSeed={};
        const x=drawSkillFromPoolRaw();
        if(x&&(x.id==="mf_engine"||x.id===GP_SKILL_ID))n++;}
      return Math.round(n/N*1000)/1000;};
    ki.sorsolas={alap:huz({nyomasgyakorlas:1,nyomas_skill:1}),
      hangolt:huz({nyomasgyakorlas:1,nyomas_skill:1,sorsolas:3})};

    /* ---- 4. A LABDASZERZÉS SORA ---- */
    S.style=mk("gegen",{nyomasgyakorlas:1});S.style2=null;
    engMatchStart();
    const r=engNote("press");
    ki.feed={res:r,tag:engInlineTag(r,"press"),
      win:GP_PRESS_WIN_TXT.length,winHead:GP_PRESS_WIN_HEAD.length,
      goal:GP_PRESS_GOAL_TXT.length,goalHead:GP_PRESS_GOAL_HEAD.length,
      mintaNev:GP_PRESS_WIN_TXT.every(f=>f("XY").indexOf("XY")>=0)&&GP_PRESS_GOAL_TXT.every(f=>f("XY").indexOf("XY")>=0),
      kulonbozo:new Set(GP_PRESS_WIN_TXT.map(f=>f("XY"))).size};
    /* egy nem-néma tétel NEM kap címkét (azt az engNoteK maga írja ki) */
    ki.feed.golTag=engInlineTag({gegen:0.2},"goal");

    /* ---- 5. AZ EREDMÉNYJELZŐ ---- */
    buildSeasonFixtures();
    const fx=S.fixtures[0];
    sbShowPreview(fx);
    const tx=id=>{const e=document.querySelector("#"+id+" .sbMs");return e?e.textContent:null;};
    const me=fx.home?"sbHomeName":"sbAwayName",them=fx.home?"sbAwayName":"sbHomeName";
    const szam=s=>s==null?null:parseFloat(String(s).replace("⚡","").replace(",","."));
    ki.tabla={en:szam(tx(me)),o:szam(tx(them)),
      varEn:Math.round(teamMatchStrength()*10)/10,
      varO:Math.round((fx.o.ovr+matchHiddenOppBuff())*10)/10,
      ovrSor:!!document.querySelector("#"+them+" .sbOvr")};
    sbSetMyMs(-2.5);
    ki.tabla.elo=szam(tx(me));
    return ki;});

  console.log("\n— 1. NYOMÁSGYAKORLÁS: A VÉDŐ-KÉPESSÉGEK ELÖL —");
  ok(t.kiosztas.elore>0,"van középpályás/csatár a fixture-ben",t.kiosztas.elore);
  ok(t.kiosztas.nelkul.launch===0&&t.kiosztas.nelkul.wall===0,
     "Nyomásgyakorlás nélkül a VÉDŐ-képességek elöl zárva",t.kiosztas.nelkul);
  ok(t.kiosztas.lv===1,"a Nyomásgyakorlás 1. szintje él",t.kiosztas.lv);
  ok(t.kiosztas.vele.launch===t.kiosztas.elore,
     "a „Gyors kontra” (VÉDŐ, gólpassz-hatású) MINDEN középpályásnak és csatárnak kiosztható",t.kiosztas.vele);
  ok(t.kiosztas.vele.wall===t.kiosztas.elore&&t.kiosztas.vele.cannon===t.kiosztas.elore,
     "…ahogy a Betonfal és az Ágyúgolyó is",t.kiosztas.vele);
  ok(t.kiosztas.vele.queen===0,"a kimondottan hátvédhez kötött Villámbeck Queen zárva marad",t.kiosztas.vele);
  ok(t.kiosztas.vedo.launch&&t.kiosztas.vedo.kane&&!t.kiosztas.vedo.motor,
     "egy definíció: VÉDŐ-kategória VAGY védekező hatás",t.kiosztas.vedo);

  console.log("\n— 2. A „NYOMÁS!” A KALAPBAN —");
  ok(t.kalap.zart===0,"zárolva nincs a pakliban",t.kalap);
  ok(t.kalap.nyitva&&t.kalap.utana===1&&t.kalap.hosszNo===1,
     "a feloldás után a MÁR MEGKEVERT pakliba EGY példány kerül",t.kalap);
  ok(t.kalap.ujra===0,"kihúzás után nem töltődik vissza (nem lesz gyakoribb a többinél)",t.kalap);
  ok(t.kalap.lezarva.db===0&&t.kalap.lezarva.jelzo===false,
     "ha a filozófia lekerül, a zárolt példány kikerül, a jelző törlődik",t.kalap.lezarva);
  ok(t.kalap.mentes&&t.kalap.mentes.gp_press===true,"a jelző a mentésben utazik",t.kalap.mentes);

  console.log("\n— 3. A HANGOLT SORSOLÁS A HAGYOMÁNYOS HÚZÁSBAN —");
  ok(t.sorsolas.hangolt>=t.sorsolas.alap+0.35,
     "a „Nyomásra hangolt sorsolás” 3. szintje a Motor/Nyomás! felé tol (≈ +60 pp)",t.sorsolas);

  console.log("\n— 4. A PRESSZPONT A SORBAN —");
  ok(t.feed.res&&t.feed.res.gegen>0,"az engNote visszaadja a tételt",t.feed.res);
  ok(/\+\d/.test(t.feed.tag)&&t.feed.tag.indexOf("presszpont")>=0,"a labdaszerzés sora kiírja: +… presszpont",t.feed.tag);
  ok(t.feed.golTag==="","a nem-néma tétel nem kap dupla címkét",t.feed.golTag);
  ok(t.feed.win>=12&&t.feed.goal>=10&&t.feed.winHead>=5&&t.feed.goalHead>=5&&t.feed.mintaNev
     &&t.feed.kulonbozo===t.feed.win,"több kommentár-változat, mind a névvel",t.feed);

  console.log("\n— 5. AZ EREDMÉNYJELZŐ —");
  ok(kozel(t.tabla.en,t.tabla.varEn,0.051),"a saját ⚡ meccs-erő a táblán",t.tabla);
  ok(kozel(t.tabla.o,t.tabla.varO,0.051),"a CPU ⚡ meccs-ereje = ovr + a motor rejtett erősítése",t.tabla);
  ok(t.tabla.ovrSor,"a csapaterő sora is megmarad",t.tabla.ovrSor);
  ok(kozel(t.tabla.elo,Math.round((t.tabla.varEn-2.5)*10)/10,0.051),"az élő frissítés átírja a számot",t.tabla);

  /* ---- 6. VALÓDI MECCS: KIÁLLÍTÁS ÉS UTÁNA CSERE ---- */
  const m=await p.evaluate(async()=>{
    const ki={};
    S.auto=false;matchSpeed=20;S.halftimeSubs=true;
    S.style={key:"villam",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
    const hivas=[];
    const _set=sbSetMyMs;
    const _redp=SIM.REDP;
    let csereKesz=false,utanaRed=0;
    const _srom=styleRedOppGoalMult;
    let redMultHivas=0;
    styleRedOppGoalMult=function(){redMultHivas++;return _srom.apply(this,arguments);};
    const _oh=openHalftimeSubs;
    openHalftimeSubs=function(ctx,cb){
      const k=ctx.active.findIndex((a,i)=>!ctx.redIdx().has(i)&&slots[a.idx]&&slots[a.idx].pos!=="KP");
      const inP={n:"Próba Csere",ovr:60,pos:["KKP"],age:25};
      const r0=redMultHivas;
      ctx.doSub(k,inP);
      utanaRed=redMultHivas-r0;
      csereKesz=true;
      cb();};
    sbSetMyMs=function(d){
      hivas.push(Math.round(d*100)/100);
      if(hivas.length===1&&d<0){
        SIM.REDP=_redp;             /* egy kiállítás elég */
        setTimeout(()=>{try{MATCH_CTL&&MATCH_CTL.open();}catch(e){ki.openHiba=e.message;}},0);}
      return _set.apply(this,arguments);};
    const _add=addLine;addLine=()=>{};
    try{
      SIM.REDP=40;
      S.unavailable={};S.lastMatch=null;
      playMatch();
      for(let i=0;i<160&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,60));
    }finally{
      SIM.REDP=_redp;sbSetMyMs=_set;openHalftimeSubs=_oh;styleRedOppGoalMult=_srom;addLine=_add;}
    ki.hivas=hivas;ki.csere=csereKesz;ki.utanaRed=utanaRed;ki.vege=!!S.lastMatch;
    ki.redKoltseg=Math.round(dialRedMatch()*100)/100;
    return ki;});
  console.log("\n— 6. VALÓDI MECCS —");
  ok(m.vege,"a meccs lement",m.vege);
  ok(m.hivas.length>=2&&m.hivas[0]<0,"a kiállítás ÉLŐBEN lejjebb viszi a kiírt meccs-erőt",m.hivas);
  ok(m.csere,"a kiállítás után csere történt",m);
  const utolso=m.hivas[1];
  ok(typeof utolso==="number"&&utolso<=m.hivas[0]+Math.abs(m.hivas[0])*0.9&&utolso<0,
     "a csere után a kiírt szám továbbra is tartalmazza az emberhátrányt",{kiall:m.hivas[0],csere:utolso});
  ok(m.utanaRed>=1,"…és a motor is: a csere a kiállítás képletét újra alkalmazza",m.utanaRed);

  /* ---- 7. A TÁRS ARCULATA ---- */
  const a=await p.evaluate(()=>{
    const ki={};
    ki.jo=mpCleanIdent({crest:{shape:CREST_SHAPES[1].k,div:"solid",sym:"star",mono:"AB",ink:"#ffffff"},
      colors:["#112233","hsl(120 50% 40%)"],stadium:"Üllői út <b>"});
    ki.rossz=mpCleanIdent({crest:{shape:"x",div:"solid",sym:"star",ink:"#fff"},
      colors:['red" onload="alert(1)',"#000"],stadium:""});
    ki.rosszTinta=mpCleanIdent({crest:{shape:CREST_SHAPES[0].k,div:"solid",sym:"star",ink:'#fff"/><script>'},
      colors:["#111","#222"],stadium:"X"});
    ki.drot=(()=>{const w=h2hWireSnapshot();return !!(w&&w.ident&&w.ident.colors);})();
    /* a táblán: párharc-fixture a társ címerével */
    const fx={o:{n:"Társ FC",ovr:80,dispOvr:82,matchOvr:85,ident:ki.jo},home:true,duel:true};
    sbPaintTeams(fx);
    const el=document.getElementById("sbAwayName");
    ki.tabla={cimer:!!(el&&el.querySelector(".sbCrest svg")),ms:el&&el.querySelector(".sbMs")?el.querySelector(".sbMs").textContent:null};
    return ki;});
  console.log("\n— 7. A TÁRS ARCULATA —");
  ok(a.jo&&a.jo.crest&&a.jo.colors&&a.jo.stadium==="Üllői út b","érvényes arculat átmegy, a stadionnév jelölésmentes",a.jo);
  ok(a.rossz===null,"rosszindulatú szín / ismeretlen forma: kiesik",a.rossz);
  ok(a.rosszTinta&&a.rosszTinta.crest===null&&a.rosszTinta.stadium==="X","rossz tinta: a címer kiesik, a név marad",a.rosszTinta);
  ok(a.drot,"a pillanatkép viszi a saját arculatot",a.drot);
  ok(a.tabla.cimer&&a.tabla.ms==="⚡85,0","párharcban a társ címere és ⚡ meccs-ereje a táblán",a.tabla);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
