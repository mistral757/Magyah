/* 🆙 FELZÁRKÓZTATÁS A PÁRHARC UTÁN (3.9.347).

   KIMONDOTT KÉRÉS: „Minden párharc után, könnyed módban, legyen felajánlva az
   alacsonyabb szinten járó csapatnak, hogy felzárkóztatást kérhessen. Ára: Run
   szint pontok. Módja, sima boostok, 1 teljes Run szint 10 sima boost, azaz
   0.1 Run színtért lehet venni 1 sima boostot ilyenkor."

   Amit mér:
     1. a két gép ugyanazokból a ⚡-okból dönt: pontosan az alacsonyabb kapja,
        egyenlőnél senki; hardcore szobában és szoba nélkül nincs ajánlat;
     2. a vásárlás: N boost → a Run pontosan N×0,1-gyel kevesebb, a sima boost
        ára 0 (N ingyen-zseton), a Run-bontásban ott a sor;
     3. a Run-pontnál többet nem lehet venni;
     4. a HUB-on a Run-mérő alatt a kártya, a gomb a csúszkás ablakot nyitja,
        és a megerősítés végrehajtja;
     5. egy valódi bajnoki meccs után az ajánlat lejár; nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9347;
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

  await p.evaluate(()=>{window.__hc=false;
    mpSv=()=>true;mpHardcore=()=>window.__hc;mpRoomOn=()=>true;
    /* a Run-nak legyen mit fogyasztania: a próbában a kész szám 4,0 */
    const _rb=runBreakdown;window.__rb=_rb;runBreakdown=function(){const r=_rb.apply(this,arguments);
      const felz=Math.max(0,+S.runFelzark||0);r.total=Math.max(0,4-felz);return r;};});
  console.log("— 1. ki kapja —");
  const r1=await p.evaluate(()=>{
    const o={};
    S.felzark=null;o.alacsony=!!felzAjanl({myMatch:95.04,oppMatch:98.2});
    const a=!!felzAjanl({myMatch:98.2,oppMatch:95.04});o.magas=a;
    o.egyenlo=!!felzAjanl({myMatch:97.01,oppMatch:96.98});
    window.__hc=true;o.hc=!!felzAjanl({myMatch:90,oppMatch:99});window.__hc=false;
    const sv=mpSv;mpSv=()=>false;const hr=h2hRoomActive;h2hRoomActive=()=>false;
    o.szobaNelkul=!!felzAjanl({myMatch:90,oppMatch:99});mpSv=sv;h2hRoomActive=hr;
    return o;});
  ok(r1.alacsony&&!r1.magas,"az alacsonyabb ⚡ kap ajánlatot, a magasabb nem (a két gép tükörképe)",r1);
  ok(!r1.egyenlo,"egyenlő (tizedre kerekítve) ⚡-nál senki",r1.egyenlo);
  ok(!r1.hc&&!r1.szobaNelkul,"hardcore szobában és szoba nélkül nincs ajánlat",r1);

  console.log("\n— 2–3. vásárlás —");
  const r2=await p.evaluate(()=>{
    const o={};S.runFelzark=0;S.chFreeBoost={};
    felzAjanl({myMatch:90,oppMatch:95});
    o.run0=runBreakdown().total;o.max=felzMax();
    o.ar0=boostPriceOf("plain")>0;
    const v=felzVesz(7);o.v=v.ok;
    o.run1=Math.round(runBreakdown().total*1000)/1000;o.zseton=S.chFreeBoost.plain;o.ar1=boostPriceOf("plain");
    o.sor=runBreakdown().rows.some(r=>r.k==="felzark"&&/−0,7 Run-pont · 7 sima boost/.test(r.d));
    o.tul=felzVesz(felzMax()+1).ok;
    return o;});
  ok(r2.run0===4&&r2.max===40,"4,0 Run → legfeljebb 40 boost",r2);
  ok(r2.v&&Math.abs(r2.run1-3.3)<1e-9&&r2.zseton===7,"7 boost → −0,7 Run, 7 ingyen sima boost",r2);
  ok(r2.ar0&&r2.ar1===0,"a sima boost ára a zsetonnal 0",r2);
  ok(!r2.tul,"a Run-pontnál többet nem lehet venni",r2.tul);
  ok(r2.sor,"a Run-bontásban ott a felzárkóztatás sora",r2.sor);

  const rv=await p.evaluate(()=>{S.runFelzark=0;const a=window.__rb().total;S.runFelzark=0.5;const b=window.__rb().total;S.runFelzark=0;return {a,b};});
  ok(rv.a>0.5&&Math.abs(rv.a-rv.b-0.5)<1e-9,"a valódi Run-számítás pontosan levonja a felzárkóztatás árát",rv);

  console.log("\n— 4. a HUB —");
  const r4=await p.evaluate(()=>{
    const o={};S.runFelzark=0;S.chFreeBoost={};felzAjanl({myMatch:90,oppMatch:95});
    renderRunMeter();
    o.kartya=!!$("felzBox");const b=$("felzBtn");o.gomb=!!b;
    if(b)b.click();
    o.ablak=!$("hubTacticConfirmModal").classList.contains("hide")&&!!$("felzDb");
    if($("felzDb")){$("felzDb").value="3";$("felzDb").dispatchEvent(new Event("input"));o.tx=$("felzDbTx").textContent;}
    $("hubTacticConfirmYes").click();
    o.zseton=(S.chFreeBoost||{}).plain||0;o.felz=S.runFelzark;
    return o;});
  ok(r4.kartya&&r4.gomb,"a Run-mérő alatt a kártya és a gomb",r4);
  ok(r4.ablak&&/3 boost — 0,3 Run/.test(r4.tx||""),"a gomb csúszkás ablakot nyit, a felirat követi",r4);
  ok(r4.zseton===3&&Math.abs(r4.felz-0.3)<1e-9,"a megerősítés végrehajtja",r4);

  console.log("\n— 5. lejár a következő bajnokin —");
  await p.evaluate(()=>{S.felzark={sn:S.seasonNumber||1,my:90,op:95,at:Date.now(),db:0};
    S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    window.__n0=S.fixtureResults.length;playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       for(const id of ["subPanelSkip","halfSubSkip","guideTipOk","talDrawLater","unlockOk","skillOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
       return !S.playing&&S.fixtureResults.length>window.__n0;});
     if(!kesz)await p.waitForTimeout(500);}}
  const r5=await p.evaluate(()=>({felz:S.felzark}));
  ok(r5.felz===null,"egy bajnoki után az ajánlat lejárt",r5);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
