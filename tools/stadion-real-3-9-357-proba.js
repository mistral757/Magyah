/* 🏟️ REÁLISABB LELÁTÓ: TÖRZSSZURKOLÓK + HIÁNYFELÁR (3.9.357).

   KIMONDOTT KÉRÉS: „reálisabbá kéne tenni. Azért 120ezer néző egy meccsen,
   az a top top csapatok sajátja a legjobb formájuk idejen. Szóval ezt kicsit
   tegyük realisztikusabbá úgy hogy a budzsét nem vágjuk még egyúttal
   túlzottan. Szóval ne a büdzsé hanem a nézőszám, stadion mérete legyen
   kisebb. Lassabb, fokozatosabb. A pénz közben azért jöjjön."

   Amit mér:
     1. a törzsszurkolók görbéje (60 ezerig 60%, fölötte lassul);
     2. a kereslet a törzs 55–100%-a;
     3. a hiányfelár (tábor/törzs)^0,6, legfeljebb 1,8;
     4. a tábor (a gazdaság bázisa) ugyanúgy nő, mint eddig;
     5. a pénz: korán (80–120%) és egy 300 ezres táború, 120 ezres stadionú
        karrierben (80–115%) a meccsenkénti lelátó-bevétel a régihez mérve, a
        néző jóval kevesebb;
     6. a stadion-doboz kiírja a törzset és a felárat; nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9357;
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



  console.log("— 1–3. törzs, kereslet, felár —");
  const r1=await p.evaluate(()=>{const o={};
    o.t50=lelatoTorzs(50000);o.t100=lelatoTorzs(100000);o.t300=lelatoTorzs(300000);o.t700=lelatoTorzs(700000);
    const T=stadionState();const fb=S.fanBase,kf=T.forma.slice(),ku=T.uj.slice();
    S.fanBase=100000;
    T.forma=[3,3,3,3,3];T.uj=[5000,5000,5000,5000,5000];o.max=stadionKeresletArany();
    T.forma=[0,0,0,0,0];T.uj=[0,0,0,0,0];o.min=stadionKeresletArany();
    S.fanBase=50000;o.f50=stadionFelar();S.fanBase=100000;o.f100=stadionFelar();S.fanBase=300000;o.f300=stadionFelar();S.fanBase=700000;o.f700=stadionFelar();
    S.fanBase=fb;T.forma=kf;T.uj=ku;return o;});
  ok(r1.t50===30000&&Math.abs(r1.t100-45300)<300&&Math.abs(r1.t300-74300)<400&&Math.abs(r1.t700-108800)<600,
    "törzs: 50 ezres táborból 30 ezer · 100 → 45 · 300 → 74 · 700 → 109 ezer",r1);
  ok(Math.abs(r1.max-1)<1e-9&&Math.abs(r1.min-0.55)<1e-9,"a kereslet a törzs 55–100%-a",r1);
  ok(Math.abs(r1.f50-1.359)<0.01&&Math.abs(r1.f100-1.611)<0.02&&r1.f300===1.8,"a hiányfelár: 50 ezernél ×1,36 · 100 ezernél ×1,61 · legfeljebb ×1,8",r1);

  console.log("\n— 4. a tábor növekedése változatlan —");
  const r4=await p.evaluate(()=>{const o={};
    const _t1=talFanMult,_t2=talUltrakMult;talFanMult=()=>1;talUltrakMult=()=>1;
    S.fanBase=60000;const tier=fanLeagueBase();
    const b0=S.fanBase;fanMatchTick({win:true,home:true,exc:0});o.d=S.fanBase-b0;o.vart=Math.round(tier*FAN_M_WIN);
    talFanMult=_t1;talUltrakMult=_t2;return o;});
  ok(r4.d===r4.vart,"egy győzelem ugyanannyi szurkolót hoz, mint eddig (a gazdaság bázisa érintetlen)",r4);

  console.log("\n— 5. a pénz —");
  const penz=(fb,kap,merch,forma,uj)=>p.evaluate(([fb,kap,merch,forma,uj])=>{const o={};
    const T=stadionState();const k={fb:S.fanBase,kap:T.kap,m:T.merch,f:T.forma.slice(),u:T.uj.slice()};
    S.fanBase=fb;T.kap=STAD_KAP.indexOf(kap);T.merch=merch;T.forma=forma;T.uj=uj;
    o.uj=fanWeeklyIncome();o.ujNezo=stadionNezo();
    const f=T.forma.reduce((a,b)=>a+b,0)/(3*T.forma.length);
    const m=Math.max(0,Math.min(1,T.uj.reduce((a,b)=>a+b,0)/(S.fanBase*0.03)));
    const regiDem=Math.max(0.25,Math.min(1,0.30+0.40*f+0.30*m));
    o.regiNezo=Math.min(stadionKap(),Math.round(S.fanBase*regiDem));
    o.regi=o.regiNezo*stadionAr()*STAD_JEGY_K+merchBevetel();
    o.arany=Math.round(o.uj/o.regi*1000)/1000;
    S.fanBase=k.fb;T.kap=k.kap;T.merch=k.m;T.forma=k.f;T.uj=k.u;return o;},[fb,kap,merch,forma,uj]);
  const p1=await penz(8000,5000,0,[3,1,3,0,3],[60,60,60,60,60]);
  /* egy pillanatkép: a régi modellben az 5 ezres stadion itt tele volt — az idény-szimuláció ugyanitt ~0,85–0,93-at mér */
  ok(p1.arany>0.8&&p1.arany<=1.2,"korán (8 ezres tábor, 5 ezres stadion): a lelátó pénze a régi 80–120%-a",p1);
  const p2=await penz(300000,120000,4,[3,3,1,3,3],[900,900,900,900,900]);
  ok(p2.ujNezo<p2.regiNezo*0.7&&p2.ujNezo<80000,"nagy tábor (300 ezer) mellett a 120 ezres stadion messze nem telik meg",p2);
  ok(p2.arany>0.8&&p2.arany<=1.15,"…a lelátó pénze közben a régi 80–115%-a",p2);

  console.log("\n— 6. a felület —");
  const r6=await p.evaluate(()=>{const fb=S.fanBase;S.fanBase=300000;let h="";try{h=stadionBoxHtml();}catch(e){h="HIBA "+e;}S.fanBase=fb;return h;});
  ok(/törzsszurkoló/.test(r6)&&/hiányfelár/.test(r6),"a stadion-doboz kiírja a törzset és a hiányfelárat",null);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
