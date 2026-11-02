/* 🆙 FELZÁRKÓZTATÁS A PÁRHARC UTÁN (3.9.347).

   KIMONDOTT KÉRÉS: „Minden párharc után, könnyed módban, legyen felajánlva az
   alacsonyabb szinten járó csapatnak, hogy felzárkóztatást kérhessen. Ára: Run
   szint pontok. Módja, sima boostok, 1 teljes Run szint 10 sima boost, azaz
   0.1 Run színtért lehet venni 1 sima boostot ilyenkor."

   Amit mér:
     1. a két gép ugyanazokból a ⚡-okból dönt: pontosan az alacsonyabb kapja,
        egyenlőnél senki; hardcore szobában és szoba nélkül nincs ajánlat;
     2. a vásárlás: N boost → a Run pontosan N×0,1-gyel kevesebb, a Run-
        bontásban ott a sor;
     3. (3.9.354) „Amint eléri az ellenfél parharckori meccs erő +1 ratingot
        az ő meccs ereje, nem vehet többet. Ezért egyszerre max 5-öt vehet. És
        csak olyannak adhatja, aki a párharcban kezdő volt, vagy kezdő akart
        lenni, csak pont el volt tiltva, vagy serulve, vagy csereként be lett
        hozva a meccsre" — egyszerre ≤5, a plafonnál boostonként megáll, csak
        a névsoron lévő kaphat;
     4. a HUB-on a Run-mérő alatt a kártya, a gomb a játékosonkénti
        számlálós ablakot nyitja, és a megerősítés végrehajtja;
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

  console.log("\n— 2–3. vásárlás (3.9.354: max 5, plafon +1, csak a párharc szereplői) —");
  const r2=await p.evaluate(()=>{
    const o={};S.runFelzark=0;
    const R=fullCareerRoster().filter(Boolean);
    const XI=slots.map(sl=>sl&&sl.player&&sl.player.n).filter(Boolean);
    /* aki nem szerepelt: a névsorból kihagyott utolsó kezdő */
    const kivul=XI[XI.length-1];
    o.kivul=kivul;
    /* a ⚡ a próbában boostonként +0,4-et lép — így a plafon mérhető */
    window.__ms=90;const _tms=teamMatchStrength;window.__tms=_tms;teamMatchStrength=()=>window.__ms;
    const _ap=applyPlainBoost;window.__ap=_ap;
    applyPlainBoost=function(e){window.__ms=Math.round((window.__ms+0.4)*100)/100;return _ap.apply(this,arguments);};
    window._felzNevekBe=XI.slice(0,-1);
    _felzNevekMost=XI.slice(0,-1);
    felzAjanl({myMatch:90,oppMatch:91});
    o.nevek=(S.felzark&&S.felzark.nevek||[]).length;o.xi=XI.length;
    o.plafon=felzPlafon();
    o.run0=runBreakdown().total;o.max=felzMax();
    o.jelolt=felzJeloltek().map(x=>x.n);
    o.kivulJelolt=kivul?o.jelolt.indexOf(kivul)>=0:null;
    o.kivulVesz=kivul?felzVesz([{n:kivul,db:1}]):null;
    o.hat=felzVesz([{n:XI[0],db:3},{n:XI[1],db:3}]);
    o.ures=felzVesz([]);
    const e0=careerPool[XI[0]].startRating;
    o.v=felzVesz([{n:XI[0],db:2},{n:XI[1],db:1}]);
    o.e0d=careerPool[XI[0]].startRating-e0;
    o.ms1=window.__ms;o.felz1=S.runFelzark;o.run1=Math.round(runBreakdown().total*1000)/1000;
    o.sor=runBreakdown().rows.some(r=>r.k==="felzark");
    /* 91,2 → +0,4 = 91,6 → +0,4 = 92,0 = a plafon: a 2. után megáll */
    o.v2=felzVesz([{n:XI[2],db:5}]);
    o.ms2=window.__ms;o.felz2=S.runFelzark;o.max2=felzMax();
    o.v3=felzVesz([{n:XI[2],db:1}]);
    o.db=S.felzark.db;
    o.html=felzHtml();
    return o;});
  ok(r2.nevek===r2.xi-1&&r2.nevek>=10,"az ajánlat a párharc szereplőinek névsorát viszi",{nevek:r2.nevek,xi:r2.xi});
  ok(Math.abs(r2.plafon-92)<1e-9,"a plafon a társ párharckori ⚡-a +1",r2.plafon);
  ok(r2.run0===4&&r2.max===5,"4,0 Run mellett is egyszerre legfeljebb 5",{run0:r2.run0,max:r2.max});
  ok(r2.kivul&&r2.kivulJelolt===false&&r2.kivulVesz&&!r2.kivulVesz.ok,"aki nem szerepelt a párharcban, nem kaphat",{kivul:r2.kivul,v:r2.kivulVesz});
  ok(r2.hat&&!r2.hat.ok&&/legfeljebb 5/.test(r2.hat.miert),"6 boost egyszerre elutasítva",r2.hat);
  ok(r2.ures&&!r2.ures.ok,"üres választás elutasítva",r2.ures);
  ok(r2.v.ok&&r2.v.db===3&&Math.abs(r2.felz1-0.3)<1e-9&&Math.abs(r2.run1-3.7)<1e-9,"3 boost → −0,3 Run",r2);
  ok(r2.e0d>0,"a kiválasztott játékos ratingje nőtt",r2.e0d);
  ok(r2.sor,"a Run-bontásban ott a felzárkóztatás sora",r2.sor);
  ok(r2.v2.ok&&r2.v2.db===2&&r2.v2.leallt&&Math.abs(r2.felz2-0.5)<1e-9,"a plafonnál megáll: 5-ből 2 fogyott, csak az került Run-ba",r2.v2);
  ok(r2.max2===0&&r2.v3&&!r2.v3.ok&&r2.db===5,"a plafon után nem vehet többet",{max2:r2.max2,v3:r2.v3,db:r2.db});
  ok(/Felzárkóztál/.test(r2.html)&&!/id="felzBtn"/.test(r2.html),"a kártya jelzi, hogy felzárkózott, gomb nélkül",null);

  const rv=await p.evaluate(()=>{S.runFelzark=0;const a=window.__rb().total;S.runFelzark=0.5;const b=window.__rb().total;S.runFelzark=0;return {a,b};});
  ok(rv.a>0.5&&Math.abs(rv.a-rv.b-0.5)<1e-9,"a valódi Run-számítás pontosan levonja a felzárkóztatás árát",rv);

  console.log("\n— 4. a HUB —");
  const r4=await p.evaluate(()=>{
    const o={};S.runFelzark=0;window.__ms=90;
    _felzNevekMost=window._felzNevekBe.slice();felzAjanl({myMatch:90,oppMatch:95});
    renderRunMeter();
    o.kartya=!!$("felzBox");const b=$("felzBtn");o.gomb=!!b;o.gombTx=b?b.textContent:"";
    if(b)b.click();
    const box=$("hubTacticConfirmBody");
    o.ablak=!$("hubTacticConfirmModal").classList.contains("hide");
    o.sorok=box.querySelectorAll("[data-fz='+']").length;
    const plusz=[...box.querySelectorAll("[data-fz='+']")];
    const n0=plusz[0].getAttribute("data-n"),n1=plusz[1].getAttribute("data-n");
    for(let i=0;i<4;i++)plusz[0].click();
    for(let i=0;i<3;i++)plusz[1].click();   /* 5 fölött nem lép */
    o.tx=$("felzOssz").textContent;
    [...box.querySelectorAll("[data-fz='-']")].find(x=>x.getAttribute("data-n")===n0).click();
    o.tx2=$("felzOssz").textContent;
    const r0a=careerPool[n0].startRating,r1a=careerPool[n1].startRating;
    $("hubTacticConfirmYes").click();
    o.felz=S.runFelzark;o.db=S.felzark.db;o.n0=careerPool[n0].startRating>r0a;o.n1=careerPool[n1].startRating>r1a;
    teamMatchStrength=window.__tms;applyPlainBoost=window.__ap;
    return o;});
  ok(r4.kartya&&r4.gomb&&/legfeljebb 5 boost/.test(r4.gombTx),"a Run-mérő alatt a kártya és a gomb",r4);
  ok(r4.ablak&&r4.sorok===10,"a gomb játékosonkénti számlálós ablakot nyit",r4.sorok);
  ok(/^5 \/ 5 boost — 0,5 Run/.test(r4.tx||"")&&/^4 \/ 5 boost — 0,4 Run/.test(r4.tx2||""),"a számlálók 5-nél megállnak, az összesítő követi",{tx:r4.tx,tx2:r4.tx2});
  ok(Math.abs(r4.felz-0.4)<1e-9&&r4.db===4&&r4.n0&&r4.n1,"a megerősítés a kiválasztottakra osztja ki",r4);

  console.log("\n— 5. lejár a következő bajnokin —");
  await p.evaluate(()=>{S.felzark={sn:S.seasonNumber||1,my:90,op:95,at:Date.now(),db:0,nevek:[]};
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
