/* 🤝 A PVP-INDÍTÁS: A NEHÉZSÉGI LÉTRA ÉS A LEGENDÁS MAGYAHOK (3.9.132).

   BEJELENTETT HIBA: „Az új nehézségi szint állító, amit most építettünk
   nagyon aprólékosan, plusz a legendás magyarok kapcsoló: ezek nem
   globálisak. PvP indításában nem voltak ott / nem voltak updatelve."

   Amit mér:
     1. 🇭🇺 a házigazda beállító képernyőjén a kapcsoló LÁTSZIK (eddig a
        `careerStart="draft"` közvetlen beírása mellett az alap `hide`-ban
        maradt);
     2. a vendég átnézőjén ZÁRVA van, és a házigazda döntését mutatja;
     3. 🪜 a közös karrier választója a létrán jár: a csúszka lépcső-indexet
        visz, a gombok egy fokot lépnek, az alap +2,5;
     4. a HÁZIGAZDA a saját nyitott fokaiig állíthat;
     5. a VENDÉG oldalán nincs kapu — a házigazda +1,9-ét nem vágja vissza a
        saját (még +2,5-ös) határára, különben a két világ szétcsúszna;
     6. a közös karrier Run-előnézete az új görbén és tetőn számol;
     7. a közösen megnyert karrier a saját naplót is lépteti;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9125;
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
  try{await p.waitForFunction(()=>typeof pyrMpDiffAllowed==="function"&&typeof diffMpGateT==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a közös karrier létra-függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    const naplo=(o)=>{
      localStorage.removeItem(UNLOCK_KEY);_unlockCache=null;
      const u=unlockState();Object.assign(u,{d1:3},o||{});unlockSave();_unlockCache=null;};
    naplo({diffFront:19});

    /* ---- 1. A HÁZIGAZDA BEÁLLÍTÓ KÉPERNYŐJE — a valódi gomb útja ---- */
    const g=$("magyahToggleGrid");
    g.classList.add("hide");                     /* a friss oldal alapállapota */
    MP.role="host";
    $("mpStartBtn").click();                     /* MP.active=true · careerStart="draft" */
    ki.host={active:MP.active,start:careerStart,rejtve:g.classList.contains("hide"),
      pyrMp:!$("pyrMpWrap").classList.contains("hide")};

    /* ---- 2. A VENDÉG ÁTNÉZŐJE ---- */
    ki.zar={bennVan:MP_GUEST_LOCK_SEL.indexOf("#magyahToggleGrid button")>=0};
    mpGuestReviewLock(true);
    ki.zar.letiltva=[...document.querySelectorAll("#magyahToggleGrid button")].every(x=>x.disabled);
    mpGuestReviewLock(false);
    magyahEnabled=false;renderMagyahGrid();
    const s0=mpCollectSettings();s0.magyahEnabled=true;
    try{mpApplySettings(s0);}catch(e){ki.applyHiba=String(e);}
    ki.zar.mutatja=!!document.querySelector('#magyahToggleGrid button[data-mgy="on"].sel');

    /* ---- 3-4. A VÁLASZTÓ A LÉTRÁN, A HÁZIGAZDA HATÁRÁIG ---- */
    MP.active=true;MP.role="host";
    pyrWanted=true;pyrWantedDiv=5;_pyrMpDetail=true;
    pyrWantedGap=2.5;renderPyrMpAll();
    const L=pyrMpDiffAllowed();
    const r=$("pyrMpGap");
    ki.valaszto={min:Math.min.apply(null,L),db:L.length,max:parseInt(r.max,10),step:r.step,
      ertek:pyrWantedGap,cimke:$("pyrMpGapVal").textContent};
    $("pyrMpGapMinus").click();ki.le1=pyrWantedGap;
    $("pyrMpGapMinus").click();ki.le2=pyrWantedGap;
    $("pyrMpGapMinus").click();ki.le3=pyrWantedGap;       /* a határ: 1,9 */
    $("pyrMpGapPlus").click();ki.fel=pyrWantedGap;
    $("pyrMpGapZero").click();ki.alap=pyrWantedGap;
    pyrWantedGap=1.2;renderPyrMpAll();ki.zartKer=pyrWantedGap;

    /* ---- 5. A VENDÉG: nincs kapu ---- */
    naplo({diffFront:25});                       /* a vendég saját naplója még az alapon */
    MP.role="guest";
    pyrWantedGap=1.9;renderPyrMpAll();
    ki.vendeg={marad:pyrWantedGap,kapu:diffMpGateT()};
    MP.role="host";
    pyrWantedGap=1.9;renderPyrMpAll();
    ki.hostSajat=pyrWantedGap;                   /* a házigazda (25-ös naplóval) nem mehet 1,9-re */

    /* ---- 6. A RUN-ELŐNÉZET ---- */
    naplo({diffFront:-10});
    pyrWantedGap=-1.0;renderPyrMpAll();
    const c1=pyrMpRunCap(6);
    pyrWantedGap=0;renderPyrMpAll();
    const c0=pyrMpRunCap(6);
    ki.run={minusz:c1,nulla:c0,ertek:pyrWantedGap};

    /* ---- 7. A KÖZÖS GYŐZELEM A SAJÁT NAPLÓT LÉPTETI ---- */
    naplo({diffFront:25});
    S.pyr=S.pyr||{};S.pyr.diffT=25;delete S.pyr.fieldWant;
    const R=runInit();delete R.diffWinNoted;
    ki.gyozelem={uj:diffCareerWin(true),front:diffFrontOwn(),gatesOn:unlockGatesOn()};
    MP.active=false;MP.role=null;
    return ki;});

  console.log("\n— 🇭🇺 LEGENDÁS MAGYAHOK —");
  ok(t.host.active&&t.host.start==="draft"&&t.host.rejtve===false,
     "a házigazda beállító képernyőjén a kapcsoló LÁTSZIK",t.host);
  ok(t.zar.bennVan&&t.zar.letiltva,"a vendég átnézőjén ZÁRVA van",t.zar);
  ok(t.zar.mutatja,"…és a házigazda döntését mutatja",t.zar);

  console.log("\n— 🪜 A NEHÉZSÉGI LÉTRA —");
  ok(t.valaszto.min===19&&t.valaszto.step==="1"&&t.valaszto.max===t.valaszto.db-1,
     "a csúszka a lépcsőkön jár, a házigazda nyitott fokaiig (+1,9)",t.valaszto);
  ok(/\+2,5/.test(t.valaszto.cimke),"a címke a fokot mutatja",t.valaszto.cimke);
  ok(kozel(t.le1,2.0,1e-9)&&kozel(t.le2,1.9,1e-9)&&kozel(t.le3,1.9,1e-9),
     "a ◀ fokonként lép (2,5 → 2,0 → 1,9), és a határon megáll",[t.le1,t.le2,t.le3]);
  ok(kozel(t.fel,2.0,1e-9)&&kozel(t.alap,2.5,1e-9),"a ▶ vissza, az 🎬 alap +2,5",[t.fel,t.alap]);
  ok(kozel(t.zartKer,1.9,1e-9),"zárt fokot kérve (1,2) a határra áll",t.zartKer);
  ok(kozel(t.vendeg.marad,1.9,1e-9)&&t.vendeg.kapu===-90,
     "a VENDÉG nem vágja vissza a házigazda +1,9-ét a saját +2,5-ös határára",t.vendeg);
  ok(kozel(t.hostSajat,2.5,1e-9),"…a házigazda viszont a saját határáig állíthat",t.hostSajat);

  console.log("\n— A RUN —");
  /* A többi tényező (fokozat, tempó) is szoroz, tehát a tető nem 200 — a
     helyes állítás az ARÁNY: a −1,0 a 0,0 kétszerese (±1 a kerekítés). */
  ok(t.run.nulla>0&&Math.abs(t.run.minusz-2*t.run.nulla)<=1&&t.run.minusz>100,
     "a közös karrier Run-előnézete az új görbén: a −1,0 a 0,0 KÉTSZERESE, és 100 fölé megy",t.run);
  ok(t.gyozelem.uj.join(",")==="20,19"&&t.gyozelem.front===19&&t.gyozelem.gatesOn===false,
     "a közösen megnyert karrier a SAJÁT naplót is lépteti (+2,0 és +1,9)",t.gyozelem);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
