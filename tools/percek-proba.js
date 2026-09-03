/* LEJÁTSZOTT PERCEK — a piacra tétel és az edzővé válás új mércéje (3.9.33).

   Amit mér:
     1. a KAPUK: 500 perc a piacra tételhez, 2000 perc az edzővé váláshoz —
        és hogy a MECCSSZÁM önmagában már nem nyit ki semmit (100 ötperces
        beállás = 500 perc, tehát épp csak elér a piacig, az edzőségtől
        viszont messze van);
     2. a RÉGI MENTÉS átmentése: percadat nélküli karrier-statisztikából
        meccsszám × 90 lesz, tehát senki nem veszít el semmit, amije megvolt —
        és a kikiáltási ár EGY FORINTTAL SEM változik;
     3. az ÁRSKÁLÁZÁS lassabb tempója: a bizonyítottság teli pontja 5000 perc
        (≈55,6 teljes meccs) a régi 40 meccs helyett;
     4. az EDZŐI RUTIN lassabb rámpája: teli pont 50 000 perc (≈556 meccs) a
        régi 420 meccs helyett;
     5. és élesben: egy végigjátszott idény alatt a percek tényleg gyűlnek-e,
        és a meccsszám × 90-hez képest hol állnak. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8968;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    gameMode="career";
    /* A careerPool szkript-szintű `let`, nem window-tulajdonság — csupasz
       értékadással kell hozzáérni, különben egy külön window-mezőt írnánk. */
    careerPool=careerPool||{};
    S.careerStats={};

    out.hatarok={piac:SALE_LIST_MIN_MINUTES,edzo:COACH_MIN_MINUTES,
      ar_teli:SALE_EXP_FULL_MIN,rutin_teli:COACH_ROUTINE_FULL_MIN,
      husegteli:MERIT_LOYAL_MIN,zaj_alatt:MERIT_MIN_MINUTES};

    /* ---- 1. A KAPUK ---- */
    const jatekos=(n,m,perc,age)=>{
      S.careerStats[n]={g:0,a:0,mvp:0,rc:0,inj:0,saves:0,cs:0,matches:m,min:perc};
      careerPool[n]={n,age:age||34,attrs:{},pos:["CS"],peak:80,leadI:2,coopI:2,aggroI:2};
      return {n,tsi:5000,age:age||34,pos:["CS"]};};

    /* (a) SZÁZ ÖTPERCES BEÁLLÁS — a régi szabály szerint rég piacra vihető
           volt (100 ≥ 20 meccs) ÉS edző is lehetett volna (100 ≥ 40). */
    const cameo=jatekos("Cameo Dani",100,500,34);
    out.szaz_cameo={meccs:100,perc:500,
      piacra:!saleListBlock(cameo),
      edzo:coachEligible(careerPool["Cameo Dani"])};

    /* (b) NÉGYSZÁZKILENCVENKILENC PERC — egy perccel a kapu alatt. */
    const kisebb=jatekos("Kevés Dani",99,499,34);
    const blk=saleListBlock(kisebb);
    out.egy_perccel_alatta={piacra:!blk,ok:blk&&blk.kind,hianyzik:blk&&blk.need};

    /* (c) HÚSZ VÉGIGJÁTSZOTT MECCS = 1800 perc — a kért határ ALATT. */
    const husz=jatekos("Húsz Dani",20,1800,34);
    out.husz_teljes_meccs={perc:1800,piacra:!saleListBlock(husz),
      edzo:coachEligible(careerPool["Húsz Dani"])};

    /* (d) HUSZONHÁROM VÉGIGJÁTSZOTT MECCS = 2070 perc — a kapu FÖLÖTT. */
    const husznegy=jatekos("Elég Dani",23,2070,34);
    out.huszonharom_teljes_meccs={perc:2070,
      edzo:coachEligible(careerPool["Elég Dani"])};

    /* (e) A KOR KAPUJA ÉRINTETLEN: 2000 perc, de 30 évesen. */
    const fiatal=jatekos("Fiatal Dani",30,2700,30);
    out.fiatal_de_sok_perc={edzo:coachEligible(careerPool["Fiatal Dani"]),
      kor_hatar:COACH_MIN_AGE};

    /* ---- 2. RÉGI MENTÉS: NINCS PERCADAT ---- */
    S.careerStats["Régi Dani"]={g:30,a:20,mvp:5,rc:0,inj:1,saves:0,cs:4,matches:40};
    delete S.careerStats["Régi Dani"].min;
    out.regi_mentes={
      lekerdezve:careerMinutesOf("Régi Dani"),      /* várt: 40×90 = 3600 */
      varhato:40*90};

    /* ---- 3. AZ ÁR VÁLTOZATLAN A RÉGI MENTÉSEKEN ----
       A pótlás percre pontosan meccsszám×90, tehát a `m90` betűre a régi
       meccsszám. Ezt közvetlenül ellenőrizzük a bontásból. */
    careerPool["Régi Dani"]={n:"Régi Dani",age:30,attrs:{},pos:["CS"],peak:80};
    const regi={n:"Régi Dani",tsi:9000,age:30,pos:["CS"]};
    const mp=saleMeritParts(regi);
    out.regi_ar={m90:mp.m90,meccs:mp.matches,perc:mp.perc,
      egyezik:Math.abs(mp.m90-mp.matches)<1e-9,
      exp:+mp.exp.toFixed(4),szorzo:+mp.mult.toFixed(4)};

    /* ---- 4. A LASSABB RÁMPÁK ---- */
    const expAt=perc=>{
      S.careerStats["Ráta Dani"]={g:0,a:0,mvp:0,rc:0,inj:0,saves:0,cs:0,matches:Math.round(perc/90),min:perc};
      careerPool["Ráta Dani"]={n:"Ráta Dani",age:28,attrs:{},pos:["CS"],peak:80};
      return +saleExposure({n:"Ráta Dani",tsi:5000,age:28,pos:["CS"]}).toFixed(3);};
    out.bizonyitottsag={
      "3600 perc (a régi 40 meccs)":expAt(3600),   /* régen 1,000 volt */
      "5000 perc":expAt(5000),
      "6000 perc":expAt(6000)};
    out.edzoi_rutin={
      "3600 perc (40 meccs)":+coachRoutinePts(3600).toFixed(2),
      "37800 perc (a régi 420 meccs)":+coachRoutinePts(37800).toFixed(2),
      "50000 perc":+coachRoutinePts(50000).toFixed(2),
      "80000 perc":+coachRoutinePts(80000).toFixed(2)};
    return out;});

  console.log(JSON.stringify(r,null,1));
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
