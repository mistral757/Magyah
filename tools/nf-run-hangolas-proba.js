/* 🎚 A RUN ÉS A HANGOLÁS A TÍZFOKOZATÚ RENDSZERBEN (3.9.223)

   KIMONDOTT KÉRÉSEK: „A 100 fölötti Run szint pontszám csak a 10.5 szint
   megnyerése után nyíljon meg" · „Két szezon között hangolni lehet célrést, de
   nehézségi szintet nem lehet változtatni" · „A célrés hangolás hatással van a
   Run szintre de 10.5 nehézségi szint alatt minden 100ason belül" · „A
   felszezonos hangolás szuper, azt tartsuk meg, szintén legyen hatással a Run
   szintre."

   Amit mér:
     1. a fokozat két idény között nem változik; a célrés ±0,5-ig hangolható,
        és a hangolás az idény célrésébe kerül — a hivatalos szint marad;
     2. a nehezebb célrés emeli a Run nehézség-tényezőjét, a könnyebb csökkenti;
     3. a téli felmérés: a szigorú tél nehezebb, mint a laza; a télen ténylegesen
        felnőtt mezőny nehezebb idénynek számít;
     4. a Run teteje 100 a 10.5 alatt — a legnehezebb hangolással is;
        extra szinten (10.6+) szintenként +10-zel fölé mehet;
     5. az extra szinteket csak a 10.5-ön (vagy fölötte) nyert karrier nyitja;
     6. nincs oldalhiba. */
"use strict";


const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9407;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();
    document.querySelector("#pyrDiffList [data-nfpick='6']").click();
    pyrConfirmDiv();
    o.on=nfOn();o.nf=S.pyr.nf;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    S.run=null;runInit();try{runCaptureStart();}catch(e){}
    const H=pyrFloorHist();
    /* két lejátszott idény a 6. fokozaton, hangolás nélkül */
    const alap=nfCelK(6);o.alap=alap;
    H[1]={nf:6,celAlap:alap,hang:0,cel:alap,done:true,g:alap,want:alap};
    H[2]={nf:6,celAlap:alap,hang:0,cel:alap,done:true,g:alap,want:alap};
    S.seasonHistory=[{season:1,rank:1},{season:2,rank:1}];S.seasonNumber=2;
    /* 1. a fokozat rögzített, a célrés hangolható */
    S.pyr.nfNext=10;o.szint=nfLevelFor(3);
    o.hiv0=nfKarrierHivatalos();
    S.pyr.nfHangNext=-0.3;o.cel3=nfCelFor(3);
    /* a hangolás az idény célrésébe megy — a hivatalos szint az alapból számol */
    H[2].hang=-0.3;H[2].cel=alap-0.3;o.hiv=nfKarrierHivatalos();H[2].hang=0;H[2].cel=alap;
    delete S.pyr.nfHangNext;
    /* 2. a Run nehézség-tényezője a hangolással */
    const cap=()=>pyrRunCap();
    S.pyr.tel="normal";
    o.c0=cap();
    H[2].hang=-0.5;H[2].cel=alap-0.5;o.cNehez=cap();
    H[2].hang=0.5;H[2].cel=alap+0.5;o.cKonnyu=cap();
    H[2].hang=0;H[2].cel=alap;
    /* 3. a tél */
    S.pyr.tel="szigoru";o.cSzig=cap();
    S.pyr.tel="laza";o.cLaza=cap();
    S.pyr.tel="normal";
    H[2].mid=2;o.cMid=cap();delete H[2].mid;
    /* 4. a tető: 10.5 alatt 100 — a legnehezebb fokozattal is */
    o.top6=cap().top;
    H[1].cel=H[2].cel=nfCel(10,5)-0.5;H[1].nf=H[2].nf=10;
    S.pyr.nf=10;S.pyr.nf0=10;
    const _b=nfBelso;window.nfBelso=()=>5;
    o.top105=cap().top;
    window.nfBelso=()=>7;H[1].cel=H[2].cel=nfCel(10,7);
    {const _hv=nfKarrierHivatalos;window.nfKarrierHivatalos=()=>({nf:10,s:7,regi:false});
     o.hiv107=nfKarrierHivatalos();o.top107=cap().top;
     window.nfKarrierHivatalos=()=>({nf:10,s:5,regi:false});o.top105b=cap().top;
     window.nfKarrierHivatalos=_hv;}
    window.nfBelso=_b;
    /* 5. az extra szintek nyitása — a feoldás-kapuk élnek */
    unlockGatesOn=()=>true;
    const u=nfNyitasAllapot();
    const _h=nfKarrierHivatalos;
    window.nfKarrierHivatalos=()=>({nf:10,s:3,regi:false});
    u.nfExt=5;delete S.run.nfWinNoted;nfCareerWin(true);o.ext103=nfNyitasAllapot().nfExt||5;
    window.nfKarrierHivatalos=()=>({nf:10,s:5,regi:false});
    u.nfExt=5;delete S.run.nfWinNoted;nfCareerWin(true);o.ext105=nfNyitasAllapot().nfExt;
    window.nfKarrierHivatalos=_h;
    return {o,f:x=>x};});
  const o=r.o;
  ok(o.on&&o.nf===6,"a karrier a 6. fokozaton, kétoldalú módban",{on:o.on,nf:o.nf});
  ok(o.szint===6&&Math.abs(o.cel3-(o.alap-0.3))<1e-9&&o.hiv&&o.hiv0&&o.hiv.nf===o.hiv0.nf&&o.hiv.s===o.hiv0.s,"a fokozat nem változik (a régi választás nem hat); a hangolás a célrésbe megy, a hivatalos szint marad",{szint:o.szint,cel3:o.cel3,hiv0:o.hiv0,hiv:o.hiv});
  ok(o.cNehez.cap>o.c0.cap&&o.cKonnyu.cap<o.c0.cap,`a hangolás hat a Run-ra: nehezebb ${o.cNehez.cap.toFixed(3)} > alap ${o.c0.cap.toFixed(3)} > könnyebb ${o.cKonnyu.cap.toFixed(3)}`,{n:o.cNehez.cap,a:o.c0.cap,k:o.cKonnyu.cap});
  ok(o.cSzig.cap>o.cLaza.cap,`a téli tűrés hat: szigorú ${o.cSzig.cap.toFixed(3)} > laza ${o.cLaza.cap.toFixed(3)}`,{sz:o.cSzig.cap,l:o.cLaza.cap});
  ok(o.cMid.cap>o.c0.cap,`a télen felnőtt mezőny nehezebb idény: ${o.cMid.cap.toFixed(3)} > ${o.c0.cap.toFixed(3)}`,{m:o.cMid.cap,a:o.c0.cap});
  ok(o.top6===100&&o.top105===100,"10.5 alatt (és a 10.5-ön a legnehezebb hangolással is) a Run teteje 100",{top6:o.top6,top105:o.top105});
  ok(o.top107===120&&o.top105b===100,`extra szinten fokozatosan nyílik: 10.7 → ${o.top107}, a 10.5-ön 100`,{top107:o.top107,top105:o.top105b});
  ok(o.ext103===5&&o.ext105===7,"az extra szinteket csak a 10.5-ön nyert karrier nyitja (10.3 → nincs, 10.5 → 10.6 és 10.7)",{e103:o.ext103,e105:o.ext105});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
