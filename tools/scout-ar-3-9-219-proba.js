/* 💸 3.9.219 — OLCSÓBB SCOUT-TALÁLAT

   KIMONDOTT KÉRÉS: „A scout találta játékosok alap árát a mostaninak olyan
   33-55%-ára csökkenteném. Jelenleg lehetetlen megvenni őket pl. Első
   szezonban."

   Amit mér:
     1. AZ ÁRENGEDMÉNY: 600 kiszemelt árengedménye (rec.arF) mind 0,33–0,55
        közé esik, nagyjából egyenletesen (átlag ~0,44, mindkét szél lakott);
     2. AZ ÁR: a meghirdetett ár = vételár × régi hányad (65–75%) × arF,
        vagyis a piaci vételár ~21–41%-a; a licit és az ellenajánlat ehhez mér;
     3. RÉGI MENTÉS: az arF nélküli kiszemelt az első árazáskor kap egyet, és
        a régi árhoz szóló ellenajánlata érvényét veszti; a mentésbe kerül;
     4. AZ INGYENES harmad változatlanul ingyenes;
     5. AZ 1. IDÉNY: a kiszemeltek meghirdetett ára a büdzsé mellett —
        tájékoztató szám (a régi árral összevetve);
     6. FELÜLET: a panel és a beállító gombja az új sávot írja. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9260;
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
const SP=process.env.MSP||require("os").tmpdir();
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
    return null;});

  console.log("— 1–2. az árengedmény és az ár —");
  const r=await p.evaluate(()=>{
    const o={};
    scoutRealSet(true);
    const _fr=scoutFreeRoll;scoutFreeRoll=()=>false;
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const fs=[],ar=[];let elter=0;
    for(let i=0;i<600;i++){
      const e=cands[i%cands.length];
      scoutRealState().list=[];
      const rec=scoutRealAdd(e,"teszt",false);
      fs.push(rec.arF);
      const L=scoutRealListPrice(rec),b=buyPrice(e);
      ar.push(L/b);
      if(Math.abs(L-Math.max(1,Math.round(b*rec.frac*rec.arF)))>1)elter++;}
    scoutFreeRoll=_fr;
    o.min=Math.min(...fs);o.max=Math.max(...fs);o.atl=+(fs.reduce((a,b)=>a+b,0)/fs.length).toFixed(3);
    o.also=fs.filter(x=>x<0.36).length;o.felso=fs.filter(x=>x>0.52).length;
    o.arMin=+Math.min(...ar).toFixed(3);o.arMax=+Math.max(...ar).toFixed(3);o.elter=elter;
    /* a licit és az ellenajánlat a meghirdetett árhoz mér */
    scoutRealState().list=[];
    const e=cands.find(x=>!drafted.has(x.n));
    const rec=scoutRealAdd(e,"teszt",false);rec.turelem=9;
    const L=scoutRealListPrice(rec);
    const _w=scoutRealWindowOpen,_t=triangularRoll;
    scoutRealWindowOpen=()=>true;triangularRoll=()=>0.9;
    S.transferBudget=Math.max(S.transferBudget||0,L*3);
    const b0=S.transferBudget;
    o.elutasit=scoutRealBid(rec.n,0.85);
    o.counter=rec.counter;o.counterVart=Math.round(L*0.92);
    o.elfogad=scoutRealBid(rec.n,0,true);
    o.fizetett=b0-S.transferBudget;
    scoutRealWindowOpen=_w;triangularRoll=_t;
    return o;});
  ok(r.min>=0.33&&r.max<=0.55,"az árengedmény 0,33–0,55 között",{min:r.min,max:r.max});
  ok(r.atl>0.42&&r.atl<0.46&&r.also>40&&r.felso>40,"nagyjából egyenletes: átlag ~0,44, mindkét szél lakott",r);
  ok(r.elter===0,"a meghirdetett ár = vételár × régi hányad × árengedmény",r.elter);
  ok(r.arMin>=0.635*0.33-0.002&&r.arMax<=0.765*0.55+0.002,"a piaci vételár ~21–41%-a",{min:r.arMin,max:r.arMax});
  ok(r.elutasit.ok&&!r.elutasit.elfogadva&&r.counter===r.counterVart,"elutasítás után az ellenajánlat az új árhoz mér",r);
  ok(r.elfogad.elfogadva&&r.fizetett===r.counter,"az elfogadott ellenajánlat pontosan annyiba kerül",{fizetett:r.fizetett,counter:r.counter});

  console.log("\n— 3–4. régi mentés, ingyenes harmad —");
  const r3=await p.evaluate(()=>{
    const o={};
    scoutRealState().list=[];
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const rec=scoutRealAdd(cands[0],"teszt",false);
    delete rec.arF;rec.counter=123456;   /* a 3.9.219 előtti mentés kiszemeltje */
    const regi=Math.max(1,Math.round(buyPrice(cands[0])*rec.frac));
    const L=scoutRealListPrice(rec);
    o.arF=rec.arF;o.counter=rec.counter;o.L=L;o.regi=regi;
    o.mentesben=JSON.parse(JSON.stringify(S.scoutWatch)).list[0].arF===rec.arF;
    const f=scoutRealAdd(cands[1],"teszt",true);
    o.free=!!f.free;
    const _w=scoutRealWindowOpen;scoutRealWindowOpen=()=>true;
    const b0=S.transferBudget;o.sign=scoutFreeSign(f.n);o.fizetett=b0-S.transferBudget;
    scoutRealWindowOpen=_w;
    return o;});
  ok(r3.arF>=0.33&&r3.arF<=0.55&&r3.counter===null,"a régi kiszemelt megkapja az árengedményt, a régi ellenajánlat elvész",r3);
  ok(r3.L<r3.regi*0.56&&r3.L>r3.regi*0.32,"…és az ára a régi 33–55%-a",{L:r3.L,regi:r3.regi});
  ok(r3.mentesben,"az árengedmény a mentésbe kerül");
  ok(r3.free&&r3.sign.ok&&r3.fizetett===0,"az ingyenes harmad változatlanul ingyenes",r3.sign);

  console.log("\n— 5. az 1. idény (tájékoztató) —");
  const r5=await p.evaluate(()=>{
    scoutRealState().list=[];
    const budget=Math.round(S.transferBudget||0);
    const _fr=scoutFreeRoll;scoutFreeRoll=()=>false;
    let uj=0,regi=0,n=0;const ujL=[],regiL=[];
    for(let i=0;i<60;i++){
      const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n)&&!scoutRealHas(e.n));
      const e=pickDiscoveryEntry(cands,true);if(!e)continue;
      const rec=scoutRealAdd(e,"teszt",false);
      const L=scoutRealListPrice(rec),R=Math.round(buyPrice(e)*rec.frac);
      ujL.push(L);regiL.push(R);n++;
      scoutRealState().list=[];}
    scoutFreeRoll=_fr;
    const med=a=>a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)];
    return {n,budget,ujMed:med(ujL),regiMed:med(regiL),
      ujBelefer:ujL.filter(x=>x<=budget).length,regiBelefer:regiL.filter(x=>x<=budget).length};});
  console.log(`  ℹ️  1. idény, büdzsé ${r5.budget}: medián meghirdetett ár ${r5.regiMed} → ${r5.ujMed}; `
    +`a büdzséből kifizethető ${r5.regiBelefer}/${r5.n} → ${r5.ujBelefer}/${r5.n}`);
  ok(r5.ujMed<r5.regiMed*0.56&&r5.ujBelefer>=r5.regiBelefer,"az 1. idényben a kiszemeltek jóval olcsóbbak",r5);

  console.log("\n— 6. felület —");
  const r6=await p.evaluate(()=>{
    scoutRealState().list=[];
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    scoutRealAdd(cands[0],"teszt",false);
    renderScoutWatchPanel();
    const txt=$("twBody").textContent;
    const btn=document.querySelector('#scoutRealGrid button[data-sr="on"]');
    return {txt:txt.slice(0,260),sav:/piaci vételár \d+–\d+%-a/.test(txt),
      gomb:btn?btn.textContent:"",regiSzam:/65–75/.test(btn?btn.textContent:"")};});
  ok(r6.sav,"a panel a piaci vételár új sávját írja",r6.txt);
  ok(/21–41%/.test(r6.gomb)&&!r6.regiSzam,"a beállító gombja az új sávot írja",r6.gomb);
  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
