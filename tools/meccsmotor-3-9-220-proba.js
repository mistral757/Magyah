/* ⚽ 3.9.220 — A MECCSMOTOR: A MECCSERŐ TÖBBET DÖNTSÖN

   KIMONDOTT KÉRÉS: „egy kicsit következetesebbnek kell lennie az
   eredményeknek a meccs erő függvényében" — a döntés: „1–4 mehet […] A mérő
   minden idényben rögzítse a meccsenkénti adatokat is".

   Amit mér:
     1. A KONSTANSOK: K 0,12; a pálya súlya változatlan (0,9 / −0,3);
     2. A JOBB CSAPAT RÁKAPCSOL: favPushMult — csak a 60. perc után, csak ha az
        esélyes nem vezet, ×1,25-ig (5 meccserőnél telik be), mindkét irányban;
     3. RANGADÓ: a közelítés a régi harmada; a 🃏 Vad idény arányosan, a
        Káosz-elmélet teljesen visszahozza;
     4. A DINAMIKUS MÓD SÁVJAI a régi bajnoki esélyt tartják (GAP_KAL): a
        tárolt választás nem változik, a kiírás magyar tizedesvesszős;
     5. AZ ELLENFÉL PIROS LAPJA egy valódi meccsen: naplósor, eredményjelző,
        és a meccserő-különbség +2,5;
     6. A MÉRŐ: minden idényben meccsenkénti sor, motor-nemzedékkel és a
        kezdőrúgás motor-állapotával; a régi (m:null) idény is gyűjt;
     7. a súgó az új számokat mondja; nincs konzolhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9261;
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

  console.log("— 1–2. konstansok, rákapcsolás —");
  const r1=await p.evaluate(()=>{
    const f=(d,m,gf,ga)=>{const x=favPushMult(d,m,gf,ga);return [+x.own.toFixed(4),+x.opp.toFixed(4)];};
    return {v:APP_VERSION,K:SIM.K,H:SIM.HOME,A:SIM.AWAY,
      elotte:f(5,60,0,0),dontetlen:f(5,65,1,1),vezet:f(5,80,2,1),hatrany:f(2.5,90,0,1),tele:f(9,70,0,0),
      ellenEselyes:f(-5,75,1,1),ellenVezet:f(-5,75,0,1),nulla:f(0,80,0,0)};});
  ok(String(r1.v).localeCompare("3.9.220",undefined,{numeric:true})>=0,"a verzió legalább 3.9.220",r1.v);
  ok(r1.K===0.12&&r1.H===0.9&&r1.A===-0.3,"K 0,12; a pálya gólvárhatósága változatlan (0,9 / −0,3)",r1);
  ok(r1.elotte[0]===1&&r1.vezet[0]===1&&r1.nulla[0]===1,"a 60. percig, vezetésnél és egyenlő erőnél nincs rákapcsolás",r1);
  ok(r1.dontetlen[0]===1.25&&r1.dontetlen[1]===0.8&&r1.tele[0]===1.25,"5 meccserőnél (és fölötte) ×1,25 / ÷1,25",r1);
  ok(r1.hatrany[0]===1.125,"2,5 meccserőnél a fele (×1,125)",r1.hatrany);
  ok(r1.ellenEselyes[1]===1.25&&r1.ellenEselyes[0]===0.8&&r1.ellenVezet[1]===1,"ha az ellenfél az esélyes, ő kapcsol rá — ha vezet, ő sem",r1);

  console.log("\n— 3. rangadó és Joker —");
  const r3=await p.evaluate(()=>{
    const o={};const _v=talJokerVad,_s=talSpecLap;
    o.alap=rivalConvMult();
    talJokerVad=()=>1.30;o.vad30=rivalConvMult();
    talJokerVad=()=>1.60;o.vad60=rivalConvMult();
    talJokerVad=()=>1.0;talSpecLap=id=>id==="kaosz"?{}:_s(id);o.kaosz=rivalConvMult();
    talJokerVad=_v;talSpecLap=_s;
    const M={conv:0.74,scale:1};
    const t=rivalLambdas(2,1,M);o.lf=+t.lf.toFixed(4);o.vart=+(2*(1-0.74/3)+Math.SQRT2*(0.74/3)).toFixed(4);
    o.vadSzoveg=(TAL_KAT.find(k=>k.k==="joker").valt.find(v=>v.k==="vad").t(1));
    return o;});
  ok(Math.abs(r3.alap-1/3)<1e-9,"talizmán nélkül a régi közelítés harmada",r3.alap);
  ok(Math.abs(r3.vad30-(1/3+2/3*0.5))<1e-9&&r3.vad60===1,"a Vad idény arányosan hozza vissza (60%-nál teljesen)",r3);
  ok(r3.kaosz===1,"a Káosz-elmélet a teljes régi közelítést hozza vissza",r3.kaosz);
  ok(r3.lf===r3.vart,"a rivalLambdas a szorzott közelítéssel számol",r3);
  ok(/rangadók kiszámíthatatlanabbak/.test(r3.vadSzoveg),"a Vad idény leírása kimondja",r3.vadSzoveg);

  console.log("\n— 4. a dinamikus mód sávjai —");
  const r4=await p.evaluate(()=>{
    const o={};
    const b=AUTO_LEVEL_AIMS.find(a=>a.id==="balanced");
    o.bal=[b.lo,b.hi,b.loKal,b.hiKal];
    const c=aimCustom(5);o.c5=[c.id,c.lo,c.hi,c.loKal,c.hiKal];
    o.kozeli=aimNearestPreset(5).id;
    o.odds=[titleOddsAt(4*GAP_KAL),titleOddsAt(6*GAP_KAL)];
    o.nev=[diffGapName(3*GAP_KAL),diffGapName(2.9*GAP_KAL)];
    o.szam=aimSzam(2.6);
    return o;});
  ok(JSON.stringify(r4.bal)==="[2.6,4.4,3,5]","a Kiegyensúlyozott: kalibrált 3…5 → meccserőben 2,6…4,4",r4.bal);
  ok(r4.c5[0]==="c5"&&r4.c5[2]===4.4&&r4.c5[4]===5,"a csúszka tárolt értéke (c5) nem változik, a sáv átszámolódik",r4.c5);
  ok(r4.kozeli==="balanced","a legközelebbi nevesített sáv a kalibrált egységben keres",r4.kozeli);
  ok(r4.odds[0]===33&&r4.odds[1]===78,"a bajnoki esély a régi pontokra esik (4 → 33%, 6 → 78%)",r4.odds);
  ok(r4.nev[0]==="Kiegyensúlyozott"&&r4.nev[1]!=="Kiegyensúlyozott","a nehézség neve a kalibrált küszöbön vált",r4.nev);
  ok(r4.szam==="+2,6","a kiírás magyar tizedesvesszővel",r4.szam);

  console.log("\n— 5. az ellenfél piros lapja, valódi meccsen —");
  await p.evaluate(()=>{
    window.__d=[];const _ml=matchLambdas;
    matchLambdas=function(){const r=_ml.apply(this,arguments);window.__d.push(r.diff);return r;};
    window.__redp=SIM.REDP;SIM.REDP=18;   /* az első vödörben biztosan jön mindkét lap */
    S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       const m=document.getElementById("mstatModal");
       if(m&&!m.classList.contains("hide"))return true;
       for(const id of ["subPanelSkip","halfSubSkip","guideTipOk","talDrawLater","unlockOk","skillOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
       return !S.playing&&S.fixtureResults.length>0;});
     if(!kesz)await p.waitForTimeout(500);}}
  const r5=await p.evaluate(()=>{
    SIM.REDP=window.__redp;
    const L=[...(lines()?lines().children:[])].map(x=>x.textContent);
    const z=meresLoad()&&meresLoad().sz.find(x=>x.sz===(S.seasonNumber||1));
    const m=z&&z.m&&z.m[z.m.length-1];
    return {sor:L.filter(t=>/Kiállítás az ellenfélnél/.test(t)).length,
      sbPiros:/🟥/.test((document.getElementById("sbEvents")||{}).textContent||""),
      m,szam:z?z.m.length:0};});
  ok(r5.sor===1,"pontosan egy ellenfél-kiállítás a naplóban (meccsenként legfeljebb egy)",r5.sor);
  ok(r5.sbPiros,"az eredményjelzőn is ott a 🟥");
  ok(r5.m&&r5.m.or===1&&r5.m.r>=1&&r5.m.mot===2,"a mérő sora: ellenfél-piros, saját piros, motor 2",r5.m);
  ok(r5.m&&typeof r5.m.d==="number"&&r5.m.lf>0&&r5.m.la>0,"a mérő sora: a kezdőrúgás különbsége és két gólvárhatósága",r5.m);

  console.log("\n— 6. a mérő minden idényben —");
  const r6=await p.evaluate(()=>{
    const o={};
    const r=meresLoad();
    /* egy RÉGI verzióban nyitott 2. idény: m:null */
    r.sz.push({sz:2,kezd:null,veg:null,m:null,mOssz:{n:0,gy:0,d:0,v:0,gf:0,ga:0},erk:[],tav:[]});
    const sn=S.seasonNumber;S.seasonNumber=2;
    meresMeccs(S.fixtures[3],2,1,{d:1.5,lf:1.6,la:1.1,nagy:"riv",r:0,or:0});
    const z2=r.sz.find(x=>x.sz===2);o.regi=z2.m&&z2.m.length;o.sor=z2.m&&z2.m[0];
    /* egy ÚJ idény: már m:[]-mel nyílik */
    S.seasonNumber=3;const z3=meresSzezon();o.uj=Array.isArray(z3.m)&&z3.motor===2;
    S.seasonNumber=sn;
    o.beall=r.beall&&r.beall.motor;
    o.kivonat=meresExportSzoveg().length>100;
    return o;});
  ok(r6.regi===1&&r6.sor.nagy==="riv"&&r6.sor.d===1.5&&!("or" in r6.sor),"a régi (m:null) idény is gyűjt; a nulla lap nem kerül be",r6.sor);
  ok(r6.uj,"az új idény meccslistával és motor-nemzedékkel nyílik",r6.uj);
  ok(r6.beall===2,"a beállítások is viszik a motor-nemzedéket",r6.beall);

  console.log("\n— 7. súgó —");
  const r7=await p.evaluate(()=>{const h=(GLOSSARY.meccsero||{}).text||"";const rv=(GLOSSARY.rivalisok||{}).text||"";
    return {k:/e\^\(0,12/.test(h),palya:/hazai \+0,9/.test(h),rak:/RÁKAPCSOL/.test(h),riv:/Joker/.test(rv)};});
  ok(r7.k&&r7.palya&&r7.rak,"a meccs-erő súgója az új számokat és a rákapcsolást mondja",r7);
  ok(r7.riv,"a rangadó súgója kimondja, hogy a teljes káosz a Jokeré",r7.riv);
  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
