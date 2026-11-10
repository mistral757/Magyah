/* ⚡ GYORSÍTÁSOK — EREDMÉNY-AZONOSSÁG (3.9.361).

   KIMONDOTT KÉRÉS: „Egyre gyűlnek az olyan promptok a játékban, amik után
   jelentősebb 1000ms fölötti pingek is vannak […] Játékosok megbízásának
   módosítása, csapatstílus feloldása, stb." — „Ha máshol is találsz ilyen
   jelentősen magas ms időket, ott is kutakodj."

   Amit mér (mind azt, hogy a gyorsítás SEMMIT nem változtat a számokon):
     1. a legjobb-felállás keresés memóval és memó nélkül ugyanazt adja, és a
        keresés után a memó bezárul;
     2. a jegyár keret-ár átlaga nem fut önmagába (régen 500+ szint, veremtúl-
        csordulásig), és egyezik a kiírt kikiáltási árak átlagával;
     2b. a stílushatás-lista a gyorsítótárból ugyanaz, mint újraépítve, és egy
        képesség-vásárlás után AZONNAL az új listát adja;
     3. a számformázás betűre a régi (toLocaleString);
     4. koppintás (change esemény) közben a mentés nem ír azonnal, de rövid
        csend után kiíródik; a saveGameNow azonnal ír; a betöltés előtt a
        függő mentés kiíródik;
     5. nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9361;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi egyjátékos karrier, az 1. idény ELEJÉN ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  const alap=await p.evaluate(()=>{
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
    S.idx=0;S.auto=false;
    return {idx:S.idx};});


  const r=await p.evaluate(async()=>{const o={};
    /* 1. keresés memóval / anélkül */
    msPotInvalidate();const A=msPotential();
    const _k=msRawKulcs;msRawKulcs=()=>{throw 1;};   /* a memó kulcs nélkül nem él */
    msPotInvalidate();const B=msPotential();msRawKulcs=_k;
    o.kereses={a:A&&A.pot,b:B&&B.pot,an:A&&A.now,bn:B&&B.now,form:[A&&A.form,B&&B.form]};
    o.memoZarva=_msRawMemo===null;
    /* 2. stílushatás-lista */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};msState().sp=5000;
    const L0=styleActiveFx().length,E0=styleActiveFxEpit().length;
    const t=styleTraitList("beton")[0];
    const vett=styleBuyTrait(t.key);
    const L1=styleActiveFx().length,E1=styleActiveFxEpit().length;
    o.stilus={L0,E0,L1,E1,ok:vett&&vett.ok,ugyanaz:JSON.stringify(styleActiveFx().map(f=>Object.keys(f)))===JSON.stringify(styleActiveFxEpit().map(f=>Object.keys(f)))};
    /* 2b. a jegyár keret-ár szorzója: nem rekurzál, és a kiírt árak átlaga */
    {let mely=0,max=0;const f=fanSquadAskAvg;fanSquadAskAvg=function(){mely++;if(mely>max)max=mely;try{return f.apply(this,arguments);}finally{mely--;}};
     _fanAskAvgC=null;_fanAskAvgT=null;_saleCoreMemo=null;const v=fanSquadAskAvg();fanSquadAskAvg=f;
     const R=fullCareerRoster().filter(p=>p&&p.n);const a=R.map(p=>{let x=0;try{x=saleAskPrice(p)||0;}catch(e){x=0;}if(!(x>0))try{const e=careerPool[p.n];x=e?(saleAskPrice(e)||0):0;}catch(e){x=0;}return x;}).filter(x=>x>0);
     o.ask={v,ui:a.reduce((s,x)=>s+x,0)/a.length,max};}
    /* 3. formázás */
    o.fmtR=[0,7,1234,1234567,-98765].map(n=>[fmtNum(n),Math.round(n).toLocaleString("hu-HU")]);
    o.fmt=[0,7,1234,1234567,-98765].every(n=>fmtNum(n)===Math.round(n).toLocaleString("hu-HU"))
      &&fmtNum(1234567).replace(/\s/g," ")==="1 234 567";
    /* 4. mentés koppintás közben */
    saveGameNow();
    const kulcs=saveKey();const elotte=localStorage.getItem(kulcs);
    const jel1=900000+Math.floor(Math.random()*90000);S.fanBase=jel1;
    const sel=document.createElement("select");document.body.appendChild(sel);
    sel.onchange=()=>{saveGame();};sel.dispatchEvent(new Event("change"));
    o.koppintasAlatt=localStorage.getItem(kulcs)===elotte;
    o.fugg=!!_saveSoonT;
    await new Promise(r=>setTimeout(r,3500));
    o.utana=(JSON.parse(mzUnpack(localStorage.getItem(kulcs))||"{}").S||{}).fanBase===jel1;
    const jel2=jel1+1;S.fanBase=jel2;
    const sel2=document.createElement("select");document.body.appendChild(sel2);
    sel2.onchange=()=>{saveGame();loadSavedGame(kulcs);};sel2.dispatchEvent(new Event("change"));
    o.betoltesElott=(JSON.parse(mzUnpack(localStorage.getItem(kulcs))||"{}").S||{}).fanBase===jel2;
    const jel3=jel1+2;S.fanBase=jel3;
    sel.onchange=()=>{saveGameNow();};sel.dispatchEvent(new Event("change"));
    o.most=(JSON.parse(mzUnpack(localStorage.getItem(kulcs))||"{}").S||{}).fanBase===jel3;
    return o;});
  ok(r.kereses.a===r.kereses.b&&r.kereses.an===r.kereses.bn&&r.kereses.form[0]===r.kereses.form[1],"a legjobb-felállás keresés memóval és anélkül ugyanazt adja",r.kereses);
  ok(r.memoZarva,"a keresés után a memó bezárul",r.memoZarva);
  ok(r.stilus.L0===r.stilus.E0&&r.stilus.ok&&r.stilus.L1===r.stilus.E1&&r.stilus.L1>r.stilus.L0&&r.stilus.ugyanaz,"a stílushatás-lista a gyorsítótárból ugyanaz, és a vásárlás után azonnal az új",r.stilus);
  ok(r.ask.max<=2&&Math.abs(r.ask.v-r.ask.ui)<1e-6,"a jegyár keret-ár átlaga nem rekurzál (legfeljebb 2 szint), és egyezik a kiírt árak átlagával",r.ask);
  ok(r.fmt,"a számformázás betűre a régi",r.fmtR);
  ok(r.koppintasAlatt&&r.fugg,"koppintás közben a mentés nem ír azonnal (összevont, függő mentés)",{alatt:r.koppintasAlatt,fugg:r.fugg});
  ok(r.utana,"…rövid csend után kiíródik",r.utana);
  ok(r.betoltesElott,"a betöltés előtt a függő mentés kiíródik",r.betoltesElott);
  ok(r.most,"a saveGameNow koppintás közben is azonnal ír",r.most);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
