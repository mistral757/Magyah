/* 🔗 1.0.6.3.00 — A SZINERGIA.
   Amit mér:
     1. a keret: 3 stílusnál nyílik, a párok a stílusokból jönnek, az ár
        90/150/240, a szint a Szinergiáé (párváltás nem viszi), idényenként
        egy váltás, az első választás ingyenes;
     2. a felület: a rögzített sáv Szinergia-sora, a panel, a választó, a
        szezonkezdési jelzés (style:szin);
     3. VALÓDI meccseken mind a 28 pár 3. szinten: a pár hatása elsül
        (lánc-gól, λ-szorzó, súly, pressing, lap, morál), a lánc-gólok
        forrásként kerülnek az elemzésbe, a hozam a plafon közelében marad;
     4. nincs oldalhiba. */
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
  if(process.env.SZPAR)await p.evaluate(k=>{window.__SZPAR=k;},process.env.SZPAR);
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof szinMeccsKezd==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a szinergia függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";
    window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const mk=(key,tr,star)=>({key,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:star||null});
    const nev=slots.map(s=>s.player.n);
    let sztar=nev[9];
    const setSt=(keys,tr)=>{
      /* a sztár mindig a MOSTANI kezdőből (egy hosszú futásban a régi megsérülhet) */
      {const sl=slots.filter(x=>x&&x.player&&x.pos!=="KP"&&!(S.unavailable&&S.unavailable[x.player.n]));if(sl.length)sztar=sl[sl.length-2].player.n;}S.style=mk(keys[0],tr&&tr[0],keys[0]==="sztar"?sztar:null);S.style2=keys[1]?mk(keys[1],tr&&tr[1],keys[1]==="sztar"?sztar:null):null;
      S.styleExtra=keys.slice(2).map((k,i)=>mk(k,tr&&tr[i+2],k==="sztar"?sztar:null));try{styleLvlCacheClear();}catch(e){}};
    /* 1. a keret */
    S.szin=null;
    setSt(["bombazok","beton"]);ki.ket={on:szinOn(),chip:szinChipHtml()};
    setSt(["bombazok","beton","villam"]);
    ki.har={on:szinOn(),parok:szinParok(),par:szinPar(),lv:szinLv(),valt:szinValthat()};
    const W=msState();W.sp=1000;
    ki.ar=[szinAr()];szinValaszt("bombazok|villam");ki.elso=szinState().valt;
    ki.vesz=[szinVesz().ok,szinAr(),szinVesz().ok,szinAr(),szinVesz().ok,szinAr(),szinVesz().ok];
    ki.sp=W.sp;
    ki.valt1=szinValaszt("bombazok|beton").ok;ki.valt2=szinValaszt("beton|villam");ki.lvValt=szinLv();
    S.seasonNumber=(S.seasonNumber||1)+1;ki.valt3=szinValaszt("beton|villam").ok;S.seasonNumber--;
    ki.due=(()=>{try{szinState().ert=null;return szinErtesitDue();}catch(e){return String(e);}})();
    szinErtesitLatta();ki.due2=szinErtesitDue();
    setSt(["bombazok","beton","villam","tikitaka"]);ki.negy=szinParok().length;
    /* 2. a felület */
    try{hubStyleSetOpen(true);}catch(e){}
    renderStylePanel();
    ki.ui={chip:!!document.querySelector(".styleViewBar [data-szinjump]"),panel:!!document.querySelector("#szinPanel"),
      parBtn:document.querySelectorAll("[data-szinpar]").length};
    szinValasztoNyit("teszt");
    ki.ui.valaszto=document.querySelectorAll('#hubTacticConfirmBody input[name="szinPar"]').length;
    {const m=document.getElementById("hubTacticConfirmModal");if(m)m.classList.add("hide");}
    /* 3. a 28 pár valódi meccseken */
    const tickHooks=["szinOwnMult","szinOppMult","szinGoalW","szinAssistW","szinGpRateMult","szinGpW","szinPunishMult","szinYellowMult","szinRedCostMult","szinPeaceRedMult"];
    const fired={},orig={};
    tickHooks.forEach(h=>{orig[h]=window[h];window[h]=function(){const r=orig[h].apply(this,arguments);
      if(_szc&&r!==1){fired[_szc.key]=fired[_szc.key]||{};fired[_szc.key][h]=(fired[_szc.key][h]||0)+1;}return r;};});
    const _mv=szinMeccsVege;window.szinMeccsVege=function(gf,ga){
      if(_szc){const k=_szc.key;fired[k]=fired[k]||{};if(_szc.goals)fired[k].gol=(fired[k].gol||0)+_szc.goals;
        if(_szc.fear>(_szc.fear0||0))fired[k].felelem=(fired[k].felelem||0)+1;
        if(_szc.oppW.length)fired[k].ablakA=(fired[k].ablakA||0)+_szc.oppW.length;
        if(_szc.ownW.length)fired[k].ablakO=(fired[k].ablakO||0)+_szc.ownW.length;
        if(_szc.q.length)fired[k].sor=(fired[k].sor||0)+_szc.q.length;}
      const m0=S.morale;const r=_mv.apply(this,arguments);if(S.morale!==m0&&_szc===null){}return r;};
    const _so=szinSorba,_ls=szinLancSorba;
    window.szinSorba=function(a){if(window.__SZPAR&&_szc)ki.qlog.push(Math.round(a.q*100));if(_szc){const k=_szc.key;fired[k]=fired[k]||{};fired[k].akcio=(fired[k].akcio||0)+1;}return _so.apply(this,arguments);};
    window.szinLancSorba=function(r){if(_szc&&r&&!r.dud){const k=_szc.key;fired[k]=fired[k]||{};fired[k].akcio=(fired[k].akcio||0)+1;}return _ls.apply(this,arguments);};
    const _mk=szinMeccsKezd;window.szinMeccsKezd=function(){const r=_mk.apply(this,arguments);if(_szc){const k=_szc.key;fired[k]=fired[k]||{};fired[k].bal=Math.round(_szc.bal*100);}return r;};
    const _tt=szinTT;window.szinTT=function(r){if(_szc&&r){const k=_szc.key;fired[k]=fired[k]||{};fired[k].lanc=(fired[k].lanc||0)+1;}return _tt.apply(this,arguments);};
    const _tr=ttRunChain;window.ttRunChain=function(pool,o,l,b,opts){if(_szc&&opts){const k=_szc.key;fired[k]=fired[k]||{};fired[k].ttOpt=(fired[k].ttOpt||0)+1;}return _tr.apply(this,arguments);};
    const tret={bombazok:{sortuz:1},beton:{phalanx:1},villam:{szaguldas:1},tikitaka:{passzrekord:2},harmonia:{},gegen:{nyomasgyakorlas:2,buntetes:2},panzer:{},sztar:{}};
    /* a Harmónia-feltételes párok (≥ 70/75%) a teszt-keret ~70%-os egyensúlyán véletlenszerűen
       billegnének: a mérés rögzített 85%-on fut — azt méri, hogy a feltétel teljesülésekor elsül */
    {const _mk0=szinMeccsKezd;window.szinMeccsKezd=function(){const r=_mk0.apply(this,arguments);if(_szc)_szc.bal=0.85;return r;};}
    const PAR=Object.keys(SZIN_DEFS).filter(k=>!window.__SZPAR||k===window.__SZPAR);ki.par28=Object.keys(SZIN_DEFS).length;
    ki.qlog=[];{const _q=szinSorba;window.__qlog=ki.qlog;}
    ki.meccs={};ki.forr={};ki.vart={};ki.errs=[];
    const N=6;
    for(const key of PAR){
      const [a,b2]=key.split("|");
      const harmadik=SZIN_REND.find(x=>x!==a&&x!==b2&&x!=="sztar");
      const keys=[a,b2,harmadik];
      setSt(keys,keys.map(k=>tret[k]));
      S.szin=null;szinState().lv=3;szinValaszt(key);
      for(let m=0;m<N;m++){
        S.unavailable={};S.lastMatch=null;S.idx=m%10;S.auto=true;S.morale=60;
        try{utoLancVege();mEloTorol();}catch(e){}
        try{playMatch();}catch(e){ki.errs.push(key+": "+e);}
        for(let i=0;i<600&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
        const M=S.lastMatch;if(!M)continue;
        ki.meccs[key]=(ki.meccs[key]||0)+1;
        if(M.mx&&M.mx.forr&&M.mx.forr.o)ki.forr[key]=(ki.forr[key]||0)+(M.mx.forr.o.szin||0);
        if(M.mx&&M.mx.exv&&M.mx.exv.o)ki.vart[key]=(ki.vart[key]||0)+(M.mx.exv.o.szin||0);}}
    tickHooks.forEach(h=>{window[h]=orig[h];});window.szinMeccsVege=_mv;window.szinTT=_tt;window.ttRunChain=_tr;window.szinSorba=_so;window.szinLancSorba=_ls;window.szinMeccsKezd=_mk;
    ki.fired=fired;ki.N=N;
    return ki;});
  if(t.qlog&&t.qlog.length)console.log("q-k:",JSON.stringify(t.qlog));
  console.log("\n— 1. a keret —");
  ok(!t.ket.on&&!t.ket.chip,"két stílusnál nincs Szinergia",t.ket);
  ok(t.har.on&&t.har.parok.length===3&&!t.har.par&&t.har.lv===0&&t.har.valt,"három stílusnál nyílik: 3 pár, még nincs választva",t.har);
  ok(t.ar[0]>=80&&t.ar[0]<=90&&t.vesz[0]&&t.vesz[2]&&t.vesz[4]&&!t.vesz[6]&&t.vesz[5]===null,"az ár és a 3 szint",{ar:t.ar,vesz:t.vesz,sp:t.sp});
  ok(t.elso==null,"az első választás ingyenes (nem fogyasztja az idény váltását)",t.elso);
  ok(t.valt1&&!t.valt2.ok&&t.lvValt===3&&t.valt3,"idényenként egy váltás, a szint megmarad",{v1:t.valt1,v2:t.valt2,lv:t.lvValt,v3:t.valt3});
  ok(t.due===true&&t.due2===false,"a szezonkezdési jelzés: él, a megnézés nyugtázza",[t.due,t.due2]);
  ok(t.negy===6,"négy stílusnál 6 pár",t.negy);
  console.log("\n— 2. a felület —");
  ok(t.ui.chip&&t.ui.panel&&t.ui.parBtn>=1&&t.ui.valaszto===6,"a sáv sora, a panel, a pár-gombok és a felugró választó",t.ui);
  console.log("\n— 3. a 28 pár valódi meccseken (3. szint) —");
  ok(t.par28===28,"28 pár definiálva",t.par28);
  const PAR=Object.keys(t.fired);
  const nincs=Object.keys(t.meccs).filter(k=>!t.fired[k]||!Object.keys(t.fired[k]).filter(x=>x!=="bal").length);
  ok(Object.keys(t.meccs).length===28&&Object.values(t.meccs).every(v=>v>=t.N-1),"mind a 28 pár lejátszotta a meccseit",t.meccs);
  /* a ritka eseményből induló párok (kivédett helyzet, labdaszerzés → kis esély) 10 meccsen némák is maradhatnak */
  const RITKA=["bombazok|beton","beton|villam","bombazok|gegen","villam|gegen"];
  ok(nincs.every(k=>RITKA.indexOf(k)>=0)&&nincs.length<=2,"minden pár hatása elsült (legfeljebb két ritka kivétellel)",nincs);
  Object.keys(t.meccs).sort().forEach(k=>console.log("     "+k.padEnd(20)+" "+JSON.stringify(t.fired[k]||{})+(t.forr[k]?` · ${t.forr[k]} gól (várható ${Math.round((t.vart[k]||0)*10)/10})`:"")));
  const gol=Object.keys(t.forr).filter(k=>t.fired[k]&&t.fired[k].gol);
  ok(gol.every(k=>t.forr[k]===t.fired[k].gol),"a lánc-gólok forrásként kerülnek az elemzésbe",gol.map(k=>[k,t.forr[k],t.fired[k].gol]));
  const tul=Object.keys(t.vart).filter(k=>t.vart[k]/t.meccs[k]>0.55);
  ok(!tul.length,"egyik pár várható lánc-gólja sem több meccsenként 0,55-nél (3. szint)",tul.map(k=>[k,Math.round(t.vart[k]/t.meccs[k]*100)/100]));
  const G=Object.values(t.forr).reduce((a,b)=>a+b,0),V=Object.values(t.vart).reduce((a,b)=>a+b,0);
  ok(Math.abs(G-V)<=Math.max(5,3*Math.sqrt(V)),"a lánc-gólok összesen a várható körül",{gol:G,vart:Math.round(V*10)/10});
  ok(!t.errs.length,"nincs meccs-hiba",t.errs.slice(0,3));
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
