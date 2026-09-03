/* A LIGAPIRAMIS FEJLŐDÉS-MÉRŐJE (3.9.36).

   Amit mér:
     1. a három nyers szám (átlag játékos / keret-átlag / átlagéletkor) tényleg
        a keretből jön-e, és üres keretnél null-t ad-e;
     2. a mérő megszólal-e napló nélkül, egy sorral, és egy teljes karrierrel;
     3. az OSZTÁLYONKÉNTI összegzés — ez a levezetés nyersanyaga: mekkora átlag
        játékos kellett az egyes osztályokban, és mennyi volt az osztályközép;
     4. a másolható szöveg formátuma;
     5. és képernyőkép a panelről, mindhárom témában.
   A napló SZÁNDÉKOSAN kitalált: egy valódi hatosztályos felmászás lejátszása
   órákig tartana, a mérő viszont tisztán a naplóból dolgozik — azt kell
   bizonyítani, hogy a sorokat helyesen olvassa. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8974;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

/* Egy hihető felmászás: D6-ból D1-ig, gyorsuló kerettel. A számok
   SZÁNDÉKOSAN nem a mai lineáris lépcsőt követik — épp azt kell látni, hogy a
   mérő a VALÓSÁGOT mutatja, nem a feltevést. */
const NAPLO=[
  {s:1, div:6,to:6,rank:4, xi:72.0,sq:70.1,age:24.8,my:73.2,mean:71.0,ai:0.9,me:null,net:null},
  {s:2, div:6,to:5,rank:1, xi:75.4,sq:72.6,age:25.1,my:76.8,mean:71.0,ai:1.0,me:3.6,net:2.6},
  {s:3, div:5,to:5,rank:6, xi:77.9,sq:74.0,age:25.6,my:79.1,mean:74.0,ai:1.1,me:2.3,net:1.2},
  {s:4, div:5,to:4,rank:2, xi:80.6,sq:76.2,age:26.0,my:82.0,mean:74.0,ai:1.1,me:2.9,net:1.8},
  {s:5, div:4,to:4,rank:9, xi:82.1,sq:77.4,age:26.4,my:83.4,mean:77.0,ai:1.2,me:1.4,net:0.2},
  {s:6, div:4,to:3,rank:1, xi:85.0,sq:79.8,age:26.1,my:86.6,mean:77.0,ai:1.2,me:3.2,net:2.0},
  {s:7, div:3,to:3,rank:5, xi:87.2,sq:81.0,age:26.5,my:88.7,mean:80.0,ai:1.3,me:2.1,net:0.8},
  {s:8, div:3,to:2,rank:2, xi:90.4,sq:83.6,age:26.8,my:92.0,mean:80.0,ai:1.3,me:3.3,net:2.0},
  {s:9, div:2,to:2,rank:7, xi:92.8,sq:85.1,age:27.2,my:94.3,mean:83.0,ai:1.4,me:2.3,net:0.9},
  {s:10,div:2,to:1,rank:1, xi:97.1,sq:88.0,age:27.0,my:98.9,mean:83.0,ai:1.4,me:4.6,net:3.2},
  {s:11,div:1,to:1,rank:4, xi:100.3,sq:90.2,age:27.3,my:102.1,mean:86.0,ai:1.5,me:3.2,net:1.7},
  {s:12,div:1,to:1,rank:1, xi:105.6,sq:93.4,age:27.1,my:107.4,mean:86.0,ai:1.5,me:5.3,net:3.8}];

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:1000},deviceScaleFactor:2});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(napl=>{
    const out={};
    gameMode="career";
    careerPool=careerPool||{};

    /* ---- 1. A HÁROM NYERS SZÁM ---- */
    slots.length=0;
    out.ures_keret={xi:pyrXiAvg(),sq:pyrSquadAvg(),age:pyrXiAge()};
    const ker=[{n:"A Dani",pos:["CS"],ovr:80,age:24},{n:"B Dani",pos:["KKP"],ovr:90,age:28},
               {n:"C Dani",pos:["KV"],ovr:70,age:32}];
    ker.forEach(x=>{careerPool[x.n]={n:x.n,age:x.age,attrs:{},pos:x.pos,startRating:x.ovr,tsi:5000};});
    ker.forEach(x=>slots.push({pos:x.pos[0],player:x}));
    out.harom_ember={xi:pyrXiAvg(),age:pyrXiAge(),
      varhato_xi:(80+90+70)/3,varhato_kor:(24+28+32)/3};

    /* ---- 2. A MÉRŐ HÁROM ÁLLAPOTA ---- */
    S.pyr={on:true,my:6,startDiv:6,divs:[],log:[],upAmt:0};
    const szoveg=()=>pyrMeterHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
    out.naplo_nelkul=szoveg().slice(0,110);
    S.pyr.log=[napl[0]];
    out.egy_idennyel=szoveg().slice(0,150);

    /* ---- 3. A TELJES FELMÁSZÁS ---- */
    S.pyr.log=napl.slice();S.pyr.my=1;
    out.teljes_fejlec=szoveg().slice(0,240);
    out.osztalyonkent=pyrMeterByDiv().map(e=>
      `D${e.div}: ${e.n} idény · átlag játékos ${e.xiBe} → ${e.xiKi} · osztályközép ${e.mean}`);
    /* A LÉPCSŐ, AMIT A MÉRŐ MOND — ez a kérés lényege. */
    out.lepcso_a_merobol=(function(){
      const bd=pyrMeterByDiv().slice().sort((a,b)=>b.div-a.div);
      const v=bd.map(e=>e.xiKi).filter(x=>x!=null);
      const d=[];for(let i=1;i<v.length;i++)d.push(Math.round((v[i]-v[i-1])*10)/10);
      return {atlag_jatekos_osztalyonkent:v,lepcsok:d,
        mai_vilag_lepcsoje:PYR_STEP,
        vilag_osztalykozepei:bd.map(e=>e.mean)};})();

    /* ---- 4. A MÁSOLHATÓ SZÖVEG ---- */
    const t=pyrMeterText().split("\n");
    out.masolhato={sorok:t.length,fejlec:t[3],elso_adat:t[4],utolso_adat:t[15],
      osztaly_blokk:t.slice(-7)};

    /* ---- 5. a panel megnyitása a képernyőképhez ---- */
    pyrMeterOpen();
    return out;},NAPLO);

  console.log(JSON.stringify(r,null,1));

  for(const t of ["paper","dark","noir"]){
    await p.evaluate(th=>{try{applyTheme(th);}catch(e){}},t);
    await p.waitForTimeout(300);
    await p.screenshot({path:`/tmp/claude-0/-home-user-Magyah/ddc8dcef-432b-5dcc-960b-69c45b81a694/scratchpad/mero-${t}.png`});}
  const tul=await p.evaluate(()=>document.documentElement.scrollWidth>430);
  console.log("vízszintes túlcsordulás:",tul);
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
