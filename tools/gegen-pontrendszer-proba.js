/* 🧲 A GEGENPRESSING PONTRENDSZERE — ÉS MINDEN MÁSODIK GAZDASÁG (3.9.131).

   BEJELENTETT HIBA: „A gegenpressing nem kapott olyan pontrendszert, mint az
   összes többi csapatstílus… Miért maradt ki? Pótoljuk!"

   AZ OK (mérve, a javítás előtt): az engKey() nem a SLOTOKON, hanem az
   ENG_DEFS tábla sorrendjén ment végig, és egyszerre csak EGY motor futott.
   A Gegen a tábla utolsó sora, tehát minden más motoros stílus mellett
   vesztett — elsődlegesként is:
       gegen + villam   → villam      gegen + tikitaka → tikitaka
       tikitaka + bombazok → bombazok (a MÁSODLAGOS!)

   Amit mér:
     1. a hiba reprodukciója: Gegen elsődleges + Villám másodlagos mellett
        MINDKÉT gazdaság él, a Gegen elöl;
     2. mind a harminc rendezett pár (6 × 5): mindkét stílus gazdasága él;
     3. a Panzer mellett (aminek nincs motorja) a Gegen egyedül fut;
     4. a meccs: a labdaszerzés CSAK a Gegennek fizet, a gól mindkettőnek, a
        másodlagos harmadáron — és a lefújás mindkettőt a SAJÁT plafonjával,
        a SAJÁT egyenlegére könyveli;
     5. a meccserő: a két szint hozama összeadódik, de EGYÜTT sem megy +12
        fölé;
     6. a piacok: mindkét stílus tokenje egyszerre élhet, a lefújás mindkettőt
        elfogyasztja;
     7. a panel: a Gegen és a Villám nézete is a SAJÁT szakaszát rajzolja;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9123;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof engKeys==="function"&&typeof engLive==="function"
      &&typeof engOvrBonusK==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a több-gazdaságos motor függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

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
      if(!e.attrs)initPlayerAttrs(e);
      e.attrs.seb=92;e.attrs.ved=92;e.attrs.gol=92;e.attrs.passz=92;});
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    phase="season";S.idx=0;S.morale=70;
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    const par=(a,c)=>{S.style=mk(a);S.style2=c?mk(c):null;S.styleView=1;};

    /* ---- 1. A HIBA REPRODUKCIÓJA ---- */
    par("gegen","villam");
    ki.repro={keys:engKeys(),elso:engKey(),gegen:engLive("gegen"),villam:engLive("villam")};

    /* ---- 2. MIND A HARMINC PÁR ---- */
    const K=Object.keys(ENG_DEFS),rossz=[];
    K.forEach(a=>K.forEach(c=>{
      if(a===c)return;
      par(a,c);
      const ks=engKeys();
      if(!(ks.length===2&&ks[0]===a&&ks[1]===c))rossz.push(a+"+"+c+"→"+ks.join(","));}));
    ki.parok={db:K.length*(K.length-1),rossz:rossz};

    /* ---- 3. A PANZER MELLETT ---- */
    par("panzer","gegen");
    ki.panzer={keys:engKeys(),fear:fearOn()};

    /* ---- 4. A MECCS ---- */
    par("gegen","villam");
    const Eg=engState("gegen"),Ev=engState("villam");
    Eg.pts=0;Eg.earned=0;Ev.pts=0;Ev.earned=0;
    const naplo=[];const orig=addLine;
    addLine=(h)=>{naplo.push(String(h));};
    try{
      engMatchStart();
      const a0=engAcc("gegen").raw,v0=engAcc("villam").raw;
      engNote("press");
      const a1=engAcc("gegen").raw,v1=engAcc("villam").raw;
      _engMin=30;engGoalNote(slots[10]&&slots[10].player?slots[10].player.n:"x");
      const a2=engAcc("gegen").raw,v2=engAcc("villam").raw;
      ki.meccs={press:{gegen:Math.round((a1-a0)*100)/100,villam:Math.round((v1-v0)*100)/100},
        gol:{gegen:Math.round((a2-a1)*100)/100,villam:Math.round((v2-v1)*100)/100},
        tarifa:{gegenGol:ENG_DEFS.gegen.tariff.goal,villamGol:ENG_DEFS.villam.tariff.goal},
        skala:{g:engScaleT("gegen"),v:engScaleT("villam")},
        secDiv:{g:engSecDiv("gegen"),v:engSecDiv("villam")}};
      engFullTimeNote({},1,0,{});
      const kap=engMatchEnd();
      ki.konyv={kap:kap,gegen:Eg.pts,villam:Ev.pts,
        capG:engMatchCap("gegen"),capV:engMatchCap("villam"),
        merleg:naplo.filter(x=>/a mérkőzés mérlege/.test(x)).length};
    }finally{addLine=orig;}

    /* ---- 5. A MECCSERŐ ---- */
    Eg.lvl=10;Ev.lvl=10;
    ki.meccsero={g:engOvrBonusK("gegen"),v:engOvrBonusK("villam"),ossz:engOvrBonus(),cap:ENG_OVR_CAP,
      capG:engOvrCapK("gegen"),capV:engOvrCapK("villam")};

    Eg.lvl=0;Ev.lvl=0;
    ki.meccsero0={ossz:engOvrBonus()};

    /* ---- 6. A PIACOK ---- */
    Eg.pts=1000;Ev.pts=1000;delete Eg.tok;delete Ev.tok;delete Eg.fx1;delete Ev.fx1;
    const gy=engShopItem("villam","gyujto"),lk=engShopItem("gegen","laktat");
    const r1=engBuyToken("villam",gy,"VEDO"),r2=engBuyFx1("gegen",lk);
    ki.piac={villamToken:!!r1,gegenFx1:!!r2,
      fx:styleFxMul("gpPressMult"),tokenAll:engTokenApply("JV","seb",100)};
    const el=engMatchSpend();
    ki.fogy={db:el.length,keys:el.map(x=>x.k).sort(),utana:[!!engTokenState("villam"),!!engFx1State("gegen")]};

    /* 3.9.137: a másodlagos plafonja a fele — a Panzeré is */
    par("panzer","gegen");ki.plafon={fearElso:fearOvrCap(),gegenMasod:engOvrCapK("gegen")};
    par("gegen","panzer");ki.plafon.fearMasod=fearOvrCap();ki.plafon.gegenElso=engOvrCapK("gegen");
    par("gegen","villam");
    /* ---- 7. A PANEL ---- */
    par("gegen","villam");
    S.styleView=1;
    const hg=engSectionHtml("gegen"),hv=engSectionHtml("villam");
    ki.panel={gegen:hg.indexOf(ENG_DEFS.gegen.stateN)>=0&&hg.indexOf(ENG_DEFS.gegen.shopN)>=0,
      villam:hv.indexOf(ENG_DEFS.villam.stateN)>=0&&hv.indexOf(ENG_DEFS.villam.shopN)>=0,
      dash:(()=>{try{return styleDashboardHtml(S.style,styleByKey("gegen")).indexOf(ENG_DEFS.gegen.ptsN)>=0;}catch(e){return "hiba: "+e.message;}})()};
    return ki;});

  console.log("\n— A HIBA —");
  ok(t.repro.gegen&&t.repro.villam&&t.repro.elso==="gegen",
     "Gegen elsődleges + Villám másodlagos: MINDKÉT gazdaság él, a Gegen elöl",t.repro);
  ok(t.parok.rossz.length===0,`mind a ${t.parok.db} rendezett pár: mindkét gazdaság él, slot-sorrendben`,t.parok.rossz);
  ok(t.panzer.keys.length===1&&t.panzer.keys[0]==="gegen"&&t.panzer.fear===true,
     "a Panzer mellett a Gegen gazdasága és a rettenet együtt fut",t.panzer);

  console.log("\n— A MECCS —");
  ok(t.meccs.press.gegen>0&&t.meccs.press.villam===0,"a labdaszerzés CSAK a Gegennek fizet",t.meccs.press);
  ok(t.meccs.gol.gegen>0&&t.meccs.gol.villam>0,"a gól mindkét gazdaságnak fizet (a saját tarifája szerint)",t.meccs.gol);
  ok(t.meccs.secDiv.g===1&&t.meccs.secDiv.v===3,"a másodlagos (Villám) harmadáron gyűlik",t.meccs.secDiv);
  ok(t.konyv.gegen>0&&t.konyv.villam>0&&t.konyv.merleg===2,
     "a lefújás mindkettőt a SAJÁT egyenlegére könyveli, két külön mérleggel",t.konyv);
  ok(t.konyv.gegen<=t.konyv.capG+1e-9&&t.konyv.villam<=t.konyv.capV+1e-9,
     "…mindkettőt a SAJÁT meccsplafonjával",t.konyv);

  console.log("\n— A MECCSERŐ —");
  /* 3.9.137: a közös +12-es plafon MEGSZŰNT; a másodlagos saját plafonja a fele */
  ok(t.meccsero.capG===12&&t.meccsero.capV===6,"az elsődleges plafonja +12, a másodlagosé +6",t.meccsero);
  ok(t.meccsero.g>0&&t.meccsero.v>0&&t.meccsero.v<=6
     &&kozel(t.meccsero.ossz,t.meccsero.g+t.meccsero.v,0.11),
     "a két szint hozama összeadódik, közös plafon nélkül (a másodlagos a saját +6-jáig)",t.meccsero);
  ok(t.plafon.fearElso===20&&t.plafon.fearMasod===10&&t.plafon.gegenElso===12&&t.plafon.gegenMasod===6,
     "a Panzer plafonja elsődlegesként +20, másodlagosként +10; a Gegené +12 / +6",t.plafon);
  ok(t.meccsero0.ossz===0,"szint nélkül nincs meccserő",t.meccsero0);

  console.log("\n— A PIACOK —");
  ok(t.piac.villamToken&&t.piac.gegenFx1,"a két piac egymástól függetlenül vásárolható",t.piac);
  ok(kozel(t.piac.fx,1.2,1e-9)&&kozel(t.piac.tokenAll,105,1e-9),"…és mindkét tétel hat",t.piac);
  ok(t.fogy.db===2&&t.fogy.utana[0]===false&&t.fogy.utana[1]===false,
     "a lefújás MINDKETTŐT elfogyasztja",t.fogy);

  console.log("\n— A PANEL —");
  ok(t.panel.gegen&&t.panel.villam,"a Gegen és a Villám szakasza is a SAJÁT gazdaságát rajzolja",t.panel);
  ok(t.panel.dash===true,"a Gegen stílus-panelje megkapja a pontrendszer-szakaszt",t.panel.dash);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
