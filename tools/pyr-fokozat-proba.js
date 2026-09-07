/* A FOKOZAT-LÉTRA ÚJRASZABÁSA ÉS A FUTÓ KARRIEREK VÉDELME (3.9.38).

   Két dolgot mér, és a második a fontosabb:

     1. AZ ÚJ LÉTRA a kért alakú: az alsó két fok változatlan, a `tarto` a
        RÉGI legkeményebb értékeit kapta (0,88/0,98), fölötte pedig meredeken
        nyílik (1,30 → 1,75 → 2,30). A `share` és a `top` fokozatonként nő,
        és a felső három share 1 FÖLÖTT van — ott a mezőny a te FEJLŐDÉSEDNÉL
        is gyorsabb.

     2. A FUTÓ KARRIEREK NEM MOZDULNAK. Bejelentett kérés: „a futó
        karrierekhez ne nyúljunk." Egy `sv` jelző nélküli mentés (= minden
        3.9.38 előtt indult karrier) a RÉGI táblát kapja, és a pyrAiRate
        BETŰRE a régi ütemet adja. Egy `sv:2`-es karrier az újat.
        Ez nem elmélet: a szimulátor elsőre pont ezért mérte a régi számokat.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8977;
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
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={},KEYS=["alvo","lassu","tarto","kegyet","konyortelen","vegtelen"];
    gameMode="career";
    out.uj=KEYS.map(k=>[PYR_SPEEDS[k].share,PYR_SPEEDS[k].top]);
    out.regi=KEYS.map(k=>[PYR_SPEEDS_V1[k].share,PYR_SPEEDS_V1[k].top]);
    /* a nevek nem változtak — a mentésekben a KULCS él, de a kijelzés a név */
    out.nevek_azonosak=KEYS.every(k=>PYR_SPEEDS[k].n===PYR_SPEEDS_V1[k].n);
    /* 1. AZ ÚJ LÉTRA ALAKJA */
    out.also_ketto_valtozatlan=["alvo","lassu"].every(k=>
      PYR_SPEEDS[k].share===PYR_SPEEDS_V1[k].share&&PYR_SPEEDS[k].top===PYR_SPEEDS_V1[k].top);
    out.tarto_a_regi_legkemenyebb=
      PYR_SPEEDS.tarto.share===PYR_SPEEDS_V1.vegtelen.share&&
      PYR_SPEEDS.tarto.top  ===PYR_SPEEDS_V1.vegtelen.top;
    out.szigoruan_no=KEYS.every((k,i)=>i===0||
      (PYR_SPEEDS[k].share>PYR_SPEEDS[KEYS[i-1]].share&&PYR_SPEEDS[k].top>PYR_SPEEDS[KEYS[i-1]].top));
    out.top_a_share_folott=KEYS.every(k=>PYR_SPEEDS[k].top>PYR_SPEEDS[k].share);
    out.felso_harom_1_folott=["kegyet","konyortelen","vegtelen"].every(k=>PYR_SPEEDS[k].share>1);
    /* a közép fölött MEREDEKEBB a lépcső, mint alatta */
    const lep=KEYS.slice(1).map((k,i)=>Math.round((PYR_SPEEDS[k].share-PYR_SPEEDS[KEYS[i]].share)*1000)/1000);
    out.lepcsok=lep;
    out.folotte_meredekebb=Math.min(lep[2],lep[3],lep[4])>Math.max(lep[0],lep[1]);

    /* 2. A VERZIÓKAPU — ugyanaz a fokozat, két karrier */
    const mk=mean=>({teams:Array.from({length:15},(_,i)=>(
      {n:`K${mean}-${i}`,ovr:mean+(i-7)*0.4,raw:mean})),mean,lo:mean-3,hi:mean+3});
    const vilag=()=>[105,102,99,96,93,90].map(mk);
    const rate=(key,sv)=>{
      S.pyr={on:true,my:4,aiSpeed:key,divs:vilag()};
      if(sv!=null)S.pyr.sv=sv;
      return [1,4,6].map(d=>Math.round(pyrAiRate(d)*1000)/1000);};
    out.kapu={};
    KEYS.forEach(k=>{out.kapu[k]={regi:rate(k,null),uj:rate(k,2)};});
    /* a régi (sv nélküli) mentés BETŰRE a V1 ütemét kapja */
    /* A pyrAiRate a SAJÁT tempódat is beszorozza (`PYR_PACE × tempoMult() ×
       share`) — a várt értékbe ez is kell, különben a próba a tempó-szorzót
       mérné hibának. Épp ez a szorzó az, amiért egy lassított személyes tempó
       a mezőnyt is megfelezi, téged viszont alig fékez. */
    const tm=(typeof tempoMult==="function")?tempoMult():1;
    const varhato=(T,key,d)=>{
      const t=(6-d)/(6-1);
      return Math.round(PYR_PACE*tm*(T[key].share+(T[key].top-T[key].share)*t)*1000)/1000;};
    out.regi_mentes_regi_utem=KEYS.every(k=>
      [1,4,6].every((d,i)=>Math.abs(out.kapu[k].regi[i]-varhato(PYR_SPEEDS_V1,k,d))<1e-6));
    out.uj_karrier_uj_utem=KEYS.every(k=>
      [1,4,6].every((d,i)=>Math.abs(out.kapu[k].uj[i]-varhato(PYR_SPEEDS,k,d))<1e-6));
    /* és a kettő tényleg KÜLÖNBÖZIK ott, ahol a tábla is */
    out.el_is_ter=["tarto","kegyet","konyortelen","vegtelen"].every(k=>
      Math.abs(out.kapu[k].regi[0]-out.kapu[k].uj[0])>0.5);
    out.also_ketto_ugyanaz=["alvo","lassu"].every(k=>
      Math.abs(out.kapu[k].regi[0]-out.kapu[k].uj[0])<1e-6);
    /* ismeretlen kulcs → tarto, mindkét létrán (nem dob) */
    S.pyr={on:true,my:4,aiSpeed:"nincs-ilyen",divs:vilag(),sv:2};
    out.ismeretlen_kulcs=(pyrSpeedKey()==="tarto"&&pyrSpeedDef("nincs-ilyen").share===PYR_SPEEDS.tarto.share);
    /* karrier nélkül (osztályválasztó) az ÚJ létra a helyes */
    S.pyr=null;
    out.karrier_nelkul_uj=(pyrSpeedTable()===PYR_SPEEDS);
    return out;});

  const T=[
    ["az alsó két fokozat változatlan",r.also_ketto_valtozatlan===true],
    ["a 'Lépést tartanak' a RÉGI legkeményebb (0,88/0,98)",r.tarto_a_regi_legkemenyebb===true],
    ["a létra szigorúan növekvő (share és top is)",r.szigoruan_no===true],
    ["minden fokozaton top > share (az élvonal keményebb)",r.top_a_share_folott===true],
    ["a felső három share 1 FÖLÖTT van",r.felso_harom_1_folott===true],
    ["a közép fölött meredekebb a lépcső",r.folotte_meredekebb===true],
    ["a fokozatnevek nem változtak",r.nevek_azonosak===true],
    ["FUTÓ KARRIER (sv nélkül): betűre a RÉGI ütem",r.regi_mentes_regi_utem===true],
    ["ÚJ KARRIER (sv:2): az ÚJ ütem",r.uj_karrier_uj_utem===true],
    ["…és a kettő tényleg eltér a felső négy fokon",r.el_is_ter===true],
    ["…az alsó kettőn viszont azonos",r.also_ketto_ugyanaz===true],
    ["ismeretlen kulcs → 'tarto', nem hiba",r.ismeretlen_kulcs===true],
    ["karrier nélkül az ÚJ létra szól (osztályválasztó)",r.karrier_nelkul_uj===true],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  új létra   :",JSON.stringify(r.uj));
  console.log("  régi létra :",JSON.stringify(r.regi));
  console.log("  share-lépcsők:",JSON.stringify(r.lepcsok));
  console.log("  AI-ütem D1/D4/D6, régi vs új:");
  Object.keys(r.kapu).forEach(k=>console.log(`    ${k.padEnd(12)} régi ${JSON.stringify(r.kapu[k].regi)}  új ${JSON.stringify(r.kapu[k].uj)}`));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
