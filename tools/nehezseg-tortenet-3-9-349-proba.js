/* 📊 A NEHÉZSÉG TÖRTÉNETE — MÉRVE (3.9.349).

   KIMONDOTT KÉRÉS: „ezen a nehézségi szintes, divíziós felületen legyen egy
   gomb. Az feldob egy ablakot, ahol részletesen ki van fejtve, hogy a karrier
   legelejétől mostanáig hogyan fejlődött a csapat meccsereje, és hogy
   félszezonos, szezonközi, és aztán 5 fordulós ellenőrzések, kapuk után hogyan
   alakult a nehézségi szint az ellenfélnél. Hol mennyi volt a mezőny közepe.
   Ténylegesen!"

   Amit mér:
     1. egy valódi bajnoki sora viszi a kezdőrúgáskori tényleges számokat
        (⚡ a pályán, pálya-eltolás, „mezőny most", osztályközép), és a
        „rés pályán" = motor-különbség − pálya-eltolás;
     2. a létrán ott a gomb, és megnyitja az ablakot;
     3. két idény adatából: idényenként rajt / 5 fordulós blokkok / zárás; a
        blokkokban az átlagok, a rés-követés emelése, a téli felmérés, a
        boost-adósság; a párharc külön sorban, a táblába nem számít;
     4. a „Most" kártya figyelmeztet, ha a pályára lépő ellenfelek tartósan
        eltérnek a panel számától; a karrier-görbe kirajzolódik;
     5. képernyőkép (KEPEK=mappa); nincs oldalhiba;
     6. A HIBA JAVÍTÁSA: idényben a „mezőny most" (és így minden rés-mérés)
        ugyanazt a befagyasztott rejtett erősítést használja, mint a meccs;
        nyáron a mostanit. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9349;
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

  console.log("— 1. valódi meccs: a kezdőrúgás számai —");
  await p.evaluate(()=>{S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    window.__n0=S.fixtureResults.length;playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       for(const id of ["subPanelSkip","halfSubSkip","guideTipOk","talDrawLater","unlockOk","skillOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
       return !S.playing&&S.fixtureResults.length>window.__n0;});
     if(!kesz)await p.waitForTimeout(500);}}
  const r1=await p.evaluate(()=>{const z=meresSzezon();const r=z.m[z.m.length-1];const s=ntSor(r,z.m);return {r,s};});
  ok(typeof r1.r.mo==="number"&&typeof r1.r.vn==="number"&&typeof r1.r.mzMs==="number"&&typeof r1.r.mz==="number","a sor viszi: ⚡ a pályán, pálya-eltolás, „mezőny most\", osztályközép",r1.r);
  ok(Math.abs(r1.s.resPalya-(r1.r.d-r1.r.vn))<1e-9,"rés a pályán = motor-különbség − pálya-eltolás",r1.s);

  console.log("\n— 2–4. az ablak két idény adatából —");
  const r2=await p.evaluate(()=>{
    const o={};
    /* az idénynapló: 1. idény lezárva téli felméréssel, 2. folyamatban rés-követéssel */
    const H=pyrFloorHist();
    H[1]=Object.assign(H[1]||{},{nf:8.1,cel:0.4,utana:1.6,mid:1.2,veg:3.9,dg:2.5,div:4});
    H[2]={g:0.4,want:0.4,nf:8.1,cel:0.9,utana:-0.4,lift:0.6,div:3,
      kov:{rajt:-0.4,dgB:2.0,tur:0.5,emel:[{f:5,amt:1.3},{f:10,amt:0.8}],ad:0.9,adDb:3,g:{5:2.9,10:3.0}}};
    /* a mérési napló */
    const M=meresBiztos();
    const sor=(i,ms,o,d,h,gf,ga,x)=>Object.assign({i,k:"liga",h,gf,ga,oOvr:o-6,oMs:o,ts:ms-6,ms,d,mot:2},x||{});
    M.sz=[{sz:1,kezd:{ms:86.6,mezony:85,oszt:4},veg:{ms:99.2},m:[],boost:[],liga:{hely:1,pont:75},mOssz:{n:0,gy:0,d:0,v:0,gf:0,ga:0}},
          {sz:2,kezd:{ms:104,mezony:96,oszt:3},veg:null,m:[],boost:[{i:3,ad:0.5},{i:7,ad:0.4}],mOssz:{n:0,gy:0,d:0,v:0,gf:0,ga:0}}];
    for(let i=1;i<=30;i++)M.sz[0].m.push(sor(i,87+i*0.3,85.5+i*0.1,2+i*0.05,i%2,2,1));
    M.sz[0].m.push(Object.assign(sor(15,95,93,null,0,1,1),{d:undefined}));   /* régi párharc-sor: d nélkül, ismétlődő forduló */
    for(let i=1;i<=12;i++)M.sz[1].m.push(sor(i,110+i*0.5,104+i*0.4,6.6,i%2,3,0,{mo:111+i*0.5,vn:i%2?0.9:-0.3,mzMs:110+i*0.4,mz:100+i*0.3}));
    M.sz[1].m.push(sor(12,115,116,null,0,1,2,{pd:1}));
    M.sz[1].m.push(Object.assign(sor(12,115,112,1.5,1,2,0),{k:"KK"}));
    S.seasonNumber=2;
    /* a gomb a létrán */
    const lad=$("hubLevelBtn")||document.body;
    try{renderHub();}catch(e){}
    o.gomb=!!$("nehezTortOpen");
    if($("nehezTortOpen"))$("nehezTortOpen").click();else nehezTortNyit();
    const B=$("nehezModalBody");o.nyitva=!!B&&!$("nehezModal").classList.contains("hide");
    const t=B?B.textContent:"";o.t=t.slice(0,200);
    o.idenyek=(t.match(/\d\. idény/g)||[]).length;
    o.blokk1=[...(B.querySelectorAll("table")[1]||{rows:[]}).rows].filter(r=>/^\s*\d+–\d+/.test(r.textContent)).length;
    o.emel=/rés-követés a 5\. után: \+1,3/.test(t)&&/rés-követés a 10\. után: \+0,8/.test(t);
    o.tel=/téli felmérés: a mezőny \+1,2/.test(t);
    o.adossag=/boost-adósság: \+0,5/.test(t)&&/boost-adósság: \+0,4/.test(t);
    o.parharc=/párharc: 12\. ford\. 1–2/.test(t)&&/párharc: 15\. ford\./.test(t);
    o.kupa=/kupa \(1 meccs\)/.test(t);
    o.rajt=/a kezdőrúgás után −0,4/.test(t)&&/rajt-emelése \+0,6/.test(t);
    o.zaras=/záró rés \+3,9/.test(t)&&/rés-változása \+2,5/.test(t);
    o.svg=!!B.querySelector("svg path");
    /* a „Most" kártya: a panel 118, az utolsó 5 ellenfél ~108,6 → figyelmeztet */
    const oM=oppMatchStrength;oppMatchStrength=()=>118;
    nehezTortNyit();o.figy=/⚠ A pályára lépő ellenfelek átlaga/.test($("nehezModalBody").textContent);
    oppMatchStrength=oM;
    /* a 2. idény első blokkja: rés pályán = átlag(d − vn) */
    const rows=M.sz[1].m.filter(r=>r.k==="liga"&&!r.pd&&r.i<=5);
    o.vart=rows.reduce((a,r)=>a+(r.d-r.vn),0)/rows.length;
    o.blokkSor=[...B.querySelectorAll("table")[0].rows].slice(1,2).map(r=>r.textContent)[0];
    return o;});
  ok(r2.gomb,"a létrán ott a gomb",r2.gomb);
  ok(r2.nyitva&&r2.idenyek>=2,"az ablak megnyílik, mindkét idénnyel",r2);
  ok(r2.blokk1===6,"az 1. idény: 6 blokk (a párharc-sor nem számít bele, az esemény külön sor)",r2.blokk1);
  ok(r2.emel&&r2.adossag&&r2.tel,"az események: rés-követés emelései, boost-adósság a saját blokkjában, téli felmérés",r2);
  ok(r2.rajt&&r2.zaras,"rajt és zárás a kalibrálással és a mért változással",r2);
  ok(r2.parharc&&r2.kupa,"párharc és kupa külön sorban",r2);
  ok(r2.svg,"a karrier-görbe kirajzolódik",r2.svg);
  ok(r2.figy,"a „Most” kártya figyelmeztet a tartós eltérésre",r2.figy);
  ok(new RegExp(String(Math.round(r2.vart*10)/10).replace(".",",")).test(r2.blokkSor||""),"a blokk „rés pályán” átlaga a d − pálya átlaga",{vart:r2.vart,sor:r2.blokkSor});
  console.log("\n— 6. a mérés a meccs erősítésével —");
  const r6=await p.evaluate(()=>{
    const o={};const hm=hiddenMatchBonus;
    S.seasonClosed=false;S.oppBuffH=4;hiddenMatchBonus=()=>14;
    o.idenyben=oppMatchStrength()-(oppTargetRating+pyrGrowNow()+nfSajatOff());
    o.meccs=matchHiddenOppBuff()-nfSajatOff();
    o.egyezik=Math.abs(oppMatchStrength()-(oppTargetRating+pyrGrowNow()+matchHiddenOppBuff()))<1e-9;
    S.seasonClosed=true;o.nyaron=oppMatchStrength()-(oppTargetRating+pyrGrowNow()+nfSajatOff());
    o.nyarVart=oppBuffFor(oppTargetRating,14);
    hiddenMatchBonus=hm;S.seasonClosed=false;
    return o;});
  ok(r6.egyezik&&Math.abs(r6.idenyben-r6.meccs)<1e-9,"idényben a „mezőny most” = a meccs ellenfelének erősítése (a befagyasztott értékkel)",r6);
  ok(Math.abs(r6.nyaron-r6.nyarVart)<1e-9&&r6.nyaron>r6.idenyben,"nyáron (tervezéskor) a mostani rejtett bónusz számít",r6);
  if(process.env.KEPEK){
    await p.evaluate(()=>{[...document.querySelectorAll("body *")].forEach(e=>{if(e.id!=="nehezModal"&&!e.closest("#nehezModal")&&getComputedStyle(e).position==="fixed")e.style.display="none";});
      nehezTortNyit();$("nehezModal").style.display="flex";});
    await p.setViewportSize({width:430,height:1400});await p.waitForTimeout(300);
    const el=await p.$("#nehezModal .hubModalCard");if(el)await el.screenshot({path:process.env.KEPEK+"/nehez-tortenet.png"});}
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
