/* 📈🔭 3.9.206 — KARRIER-MÉRŐ ÉS VALÓSÁGHŰ SCOUT.

   BEJELENTÉS: „Jó lenne beépíteni a játékba egy merő rendszert, ami minden
   megkezdett karrierről részletes mérési adatokat készít úgy hogy az
   kivonatolható legyen. […] legyen egy kapcsoló, ami realisztikusabbá teszi
   a scout találatait […]"

   Amit mér:
     1. A VALÓDI LÁNCON: az első kezdőrúgáskor rögzül a kezdő keret minden
        játékosa minden adattal és a beállítások; a meccs után a meccs-sor;
     2. ÉRKEZŐK forrás szerint (ifi, vásárlás, scout), az 1. idényben teljes
        adattal;
     3. IDÉNYZÁRÁS: helyezés, végső erő, a főkönyv bevétel/kiadás bontásban,
        távozók;
     4. A 2. IDÉNYTŐL TÖMÖR: nincs meccsenkénti részlet, az érkező tömör;
     5. VALÓSÁGHŰ SCOUT: lejjebb ülő sáv, a lista (nem a keret), 65–75%-os
        ár, zárt ablak, büdzsé, a kúszó csúcs, ellenajánlat, türelem → végleges
        nem, ablakonként három licit, legfeljebb 8 a listán, az ügynökség;
     6. MENTÉS: a lista, a kapcsoló és a napló-azonosító túléli;
     7. FELÜLET: HUB-gomb, panel, beállítások; kikapcsolt feltöltés = csend;
     8. KIVONAT: érvényes JSON, és a tools/meres/osszegez.js lefut rajta. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9248;
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
    return {idx:S.idx,sn:S.seasonNumber,van:!!meresLoad(),on:meresOn(),real:scoutRealOn()};});
  ok(alap.idx===0&&alap.sn===1&&alap.on&&!alap.van&&!alap.real,"előkészület: karrier az 1. idény elején, napló még nincs, valósághű scout ki",alap);

  /* ---- 1. AZ ELSŐ KEZDŐRÚGÁS ÉS AZ ELSŐ MECCS — a valódi láncon ---- */
  console.log("\n— 1. kezdőrúgás és meccs (valódi lánc) —");
  await p.evaluate(()=>{S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       const m=document.getElementById("mstatModal");
       if(m&&!m.classList.contains("hide"))return true;
       const box=document.getElementById("skillAssignList");
       if(box&&box.offsetParent){
         const g=[...box.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled&&/Rendben/.test(x.innerText||""));
         if(g){g.click();return false;}
         const aj=box.querySelector("[data-imm-ajanl]")||box.querySelector(".prow");
         if(aj){aj.click();return false;}}
       const ua=document.getElementById("unlockActions");
       if(ua&&ua.offsetParent){
         const g=[...ua.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled);
         if(g){g.click();return false;}}
       for(const id of ["talDrawLater","guideTipOk","skillOfferSkip","unlockOk"]){
         const x=document.getElementById(id);if(x&&x.offsetParent&&!x.disabled){x.click();break;}}
       return false;});
     if(!kesz)await p.waitForTimeout(400);}
   ok(kesz,"a meccs végigment (a mérleg ablaka megnyílt)");}
  const r1=await p.evaluate(()=>{
    const r=meresLoad();const z=r&&r.sz[0];const k0=(r&&r.keret0)||[];
    const x=k0[0]||{};
    return {id:r&&r.id,idSeed:!!(r&&r.id&&r.id.indexOf("_")>0),sMeres:S.meresId,
      k0:k0.length,k0Idx:r&&r.keret0Idx,hol:[...new Set(k0.map(p=>p.hol))],
      teljes:k0.every(p=>p.attrs&&typeof p.ovr==="number"&&p.pos&&p.pos.length&&p.pot!=null&&p.age!=null),
      attrN:x.attrs?Object.keys(x.attrs).length:0,minta:x,
      beall:r&&r.beall,kezd:z&&z.kezd,m:z&&z.m,bi:z&&z.budzseIdo,mOssz:z&&z.mOssz,keretKezd:z&&z.keretKezd&&z.keretKezd.length,
      teamOk:Math.abs(((z&&z.kezd&&z.kezd.ts)||0)-0)>0};});
  ok(r1.id&&r1.idSeed&&r1.sMeres===r1.id,"a napló azonosítója a seed + az első mérés ideje, és a mentésben él (S.meresId)",{id:r1.id});
  ok(r1.k0>=11&&r1.k0Idx===0&&r1.hol.includes("xi"),"a kezdő keret a kezdőrúgáskor rögzült (kezdő XI + pad + tartalék)",{n:r1.k0,hol:r1.hol});
  ok(r1.teljes&&r1.attrN>=5,"a kezdő keret MINDEN játékosa minden adattal (poszt, kor, OVR, POT, attribútumok)",{attrN:r1.attrN,minta:r1.minta});
  const B=r1.beall||{};
  ok(B.app&&B.mod&&B.piramis&&B.piramis.oszt!=null&&B.scout&&B.scout.csillag!=null&&B.ugynokseg!=null&&B.budzse!=null&&B.felallas&&B.tempo!=null,
     "a beállítások: mód, piramis (osztály, sebesség, rés), scout, ügynökség, büdzsé, felállás, tempó",B);
  ok(B.scoutValosag===false,"a beállításokban a valósághű scout állása is ott van");
  ok(r1.kezd&&typeof r1.kezd.ts==="number"&&typeof r1.kezd.ms==="number"&&r1.kezd.budzse!=null&&r1.keretKezd>=11,
     "az idény KEZDŐ állapota: csapaterő, meccs-erő, büdzsé, keret",r1.kezd);
  ok(Array.isArray(r1.m)&&r1.m.length===1&&typeof r1.m[0].gf==="number"&&typeof r1.m[0].ga==="number"&&r1.m[0].k==="liga"&&typeof r1.m[0].oOvr==="number"&&typeof r1.m[0].ms==="number",
     "a meccs rögzült: eredmény, ellenfél ereje, a saját két erő, büdzsé",r1.m);
  ok(r1.bi&&r1.bi.length===1&&r1.mOssz.n===1,"a büdzsé idősora és az összesítő is lépett",{bi:r1.bi,ossz:r1.mOssz});
  /* a lánc vége: a mérleg ablakát bezárjuk, hogy a jutalom-lánc mentés-tartása feloldódjon */
  await p.evaluate(()=>{const x=document.getElementById("mstatOk");if(x)x.click();});
  {const t0=Date.now();while(Date.now()-t0<20000){
    const kesz=await p.evaluate(()=>{
      for(const id of ["talDrawLater","guideTipOk","skillOfferSkip","unlockOk","mstatOk"]){
        const x=document.getElementById(id);if(x&&x.offsetParent&&!x.disabled){x.click();return false;}}
      return !S.utoMeccs;});
    if(kesz)break;await p.waitForTimeout(300);}}

  /* ---- 2. ÉRKEZŐK, forrás szerint ---- */
  console.log("\n— 2. érkezők —");
  const r2=await p.evaluate(()=>{
    S.auto=true;
    const szabad=()=>Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const e1=szabad()[0],p1=careerPlayerFromPoolEntry(e1);drafted.add(p1.n);extraRoster.push(p1);markArrived(p1,0,true);
    const e2=szabad()[0],p2=careerPlayerFromPoolEntry(e2);drafted.add(p2.n);extraRoster.push(p2);markArrived(p2,3000000);
    const elotte=fullCareerRoster().length;
    let cbOk=false;processCareerUnlocksB([Object.keys(CAREER_UNLOCK_REASON_TXT)[0]],()=>{cbOk=true;});
    /* 3.9.217: a klasszikus felfedezés a listára kerül (ingyenes), és az
       átigazolási időszakban leigazolva érkezik — a mérés AKKOR rögzíti */
    const lista=scoutRealState().list,rec=lista[lista.length-1];
    const _w=scoutRealWindowOpen;scoutRealWindowOpen=()=>true;
    try{if(rec&&rec.free)scoutFreeSign(rec.n);}finally{scoutRealWindowOpen=_w;}
    const z=meresLoad().sz[0];
    const ki=x=>({n:x.n,forras:x.forras,ar:x.ar||0,attrs:!!x.attrs,pot:x.pot});
    return {ifi:ki(z.erk.find(x=>x.n===p1.n)||{}),vett:ki(z.erk.find(x=>x.n===p2.n)||{}),
      mind:z.erk.map(ki),cbOk,utana:fullCareerRoster().length,elotte};});
  const f=r2.mind.map(x=>x.forras);
  ok(r2.ifi.forras==="ifi"&&r2.vett.forras==="vasarlas"&&r2.vett.ar===3000000,"az akadémiai érkező „ifi”, a vásárolt „vasarlas” az árával",[r2.ifi,r2.vett]);
  ok(r2.mind.every(x=>x.attrs&&x.pot!=null),"az 1. idényben az érkezők is MINDEN adattal");
  ok(r2.cbOk&&r2.utana===r2.elotte+1&&/^scout:/.test(f[f.length-1]||""),"a scout felfedezése „scout:<ok>” forrással rögzül",{f,elotte:r2.elotte,utana:r2.utana});

  /* ---- 3. AZ IDÉNY ZÁRÁSA ---- */
  console.log("\n— 3. idényzárás —");
  const r3=await p.evaluate(()=>{
    const horgok={kezd:playMatch.toString().includes("meresSzezonKezd"),zar:advanceCareerSeason.toString().includes("meresSzezonZar"),
      erk:markArrived.toString().includes("meresErkezo")};
    meresLiga({rank:3,pts:41,w:12,d:5,l:5,gf:33,ga:21,oppRating:71.2,teamAvg:72.44});
    S.transferBudget+=500;budgetPay(100,"buy","Teszt Elek");
    const z0=meresLoad().sz[0];z0.keretKezd.push("Nincs Senki");
    meresSzezonZar();
    const z=meresLoad().sz[0];
    const kiOldal=Object.keys(z.penz&&z.penz.ki||{}).every(k=>LEDGER_CATS[k]&&LEDGER_CATS[k].side<0);
    const beOldal=Object.keys(z.penz&&z.penz.be||{}).every(k=>!LEDGER_CATS[k]||LEDGER_CATS[k].side>0);
    return {horgok,liga:z.liga,veg:z.veg,penz:z.penz,kiOldal,beOldal,tav:z.tav,budzse:Math.round(S.transferBudget)};});
  ok(r3.horgok.kezd&&r3.horgok.zar&&r3.horgok.erk,"a horgok a helyükön: playMatch, advanceCareerSeason, markArrived",r3.horgok);
  ok(r3.liga&&r3.liga.hely===3&&r3.liga.pont===41&&r3.liga.gf===33&&r3.liga.atlag===72.4,"a bajnoki helyezés, pont, gólok, mezőny rögzült",r3.liga);
  ok(r3.veg&&typeof r3.veg.ts==="number"&&r3.veg.budzse===r3.budzse,"az idény VÉGI állapota: erő és büdzsé",r3.veg);
  ok(r3.penz&&r3.penz.ki&&r3.penz.ki.buy>=100&&r3.kiOldal&&r3.beOldal&&r3.penz.zar===r3.budzse,
     "a főkönyv bevételre és kiadásra bontva (a kategória oldala szerint), záró egyenleggel",r3.penz);
  ok(r3.tav.includes("Nincs Senki"),"a távozók a kezdő keret és a mostani különbségéből",r3.tav);

  /* ---- 4. A 2. IDÉNY: TÖMÖR ---- */
  console.log("\n— 4. a 2. idény —");
  const r4=await p.evaluate(()=>{
    S.seasonNumber=2;S.idx=0;
    meresSzezonKezd();
    meresMeccs({o:{ovr:70.4},home:true},2,1);
    meresMeccs({o:{ovr:73},home:false},0,0);
    const sz=()=>Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const e=sz()[0],pl=careerPlayerFromPoolEntry(e);drafted.add(pl.n);extraRoster.push(pl);markArrived(pl,1500000);
    const r=meresLoad(),z=r.sz.find(x=>x.sz===2);
    return {n:r.sz.length,kezd:z.kezd,m:z.m,bi:z.budzseIdo,ossz:z.mOssz,erk:z.erk,k0:r.keret0.length};});
  ok(r4.n===2&&r4.kezd&&typeof r4.kezd.ts==="number","a 2. idény kezdő ereje rögzült",r4.kezd);
  ok(r4.m===null&&r4.bi===null&&r4.ossz.n===2&&r4.ossz.gy===1&&r4.ossz.d===1&&r4.ossz.gf===2,
     "a 2. idénytől nincs meccsenkénti részlet, csak összesítő",r4.ossz);
  ok(r4.erk.length===1&&r4.erk[0].forras==="vasarlas"&&!r4.erk[0].attrs&&r4.erk[0].ovr!=null,"az érkező tömör (attribútumok nélkül), de forrással",r4.erk[0]);

  /* ---- 5. A VALÓSÁGHŰ SCOUT ---- */
  console.log("\n— 5. valósághű scout —");
  const r5=await p.evaluate(()=>{
    const o={};
    scoutRealSet(true);
    o.on=scoutRealOn();o.sOn=S.scoutReal;o.ls=localStorage.getItem("scoutReal30_0");
    /* a sáv lejjebb ül */
    scout={name:"Teszt Elek",stars:3};
    const d0=discoveryBand(),d1=discoveryBand(true);
    o.sav={hi0:+d0.hi.toFixed(2),hi1:+d1.hi.toFixed(2),mode0:+d0.mode.toFixed(2),mode1:+d1.mode.toFixed(2)};
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const atl=real=>{let s=0;for(let i=0;i<400;i++)s+=pickDiscoveryEntry(cands,real).startRating;return s/400;};
    o.atl={norm:+atl(false).toFixed(2),real:+atl(true).toFixed(2)};
    /* a felfedezés: listára, nem keretbe */
    const elotte=fullCareerRoster().length,lista0=scoutRealState().list.length,megf0=(meresLoad().sz[1].megf||[]).length;
    /* 3.9.217: a licit-méréshez fizetős találat kell (az ingyenes harmadot a
       scout-ingyen-3-9-217-proba méri) */
    const _fr=scoutFreeRoll;scoutFreeRoll=()=>false;
    let cbOk=false;try{processCareerUnlocksB([Object.keys(CAREER_UNLOCK_REASON_TXT)[0]],()=>{cbOk=true;});}finally{scoutFreeRoll=_fr;}
    o.felf={cbOk,keret:fullCareerRoster().length-elotte,lista:scoutRealState().list.length-lista0,megf:(meresLoad().sz[1].megf||[]).length-megf0};
    const rec=scoutRealState().list[scoutRealState().list.length-1];
    o.rec=Object.assign({},rec);
    const e=careerPool[rec.n];
    o.arany=+(scoutRealListPrice(rec)/buyPrice(e)).toFixed(3);
    /* zárt ablak */
    const _w=scoutRealWindowOpen;scoutRealWindowOpen=()=>false;
    o.zart=scoutRealBid(rec.n,1.0);
    scoutRealWindowOpen=()=>true;
    /* fogadókészség-csúcs: elutasítás után 5%-kal lejjebb */
    o.mode0=+scoutRealMode(rec).toFixed(3);
    S.transferBudget=0;o.penzNincs=scoutRealBid(rec.n,1.0);
    S.transferBudget=5e9;
    const _t=triangularRoll;
    triangularRoll=()=>1.0;
    const tur0=rec.turelem;
    o.kozeli=scoutRealBid(rec.n,0.95);
    o.utana={rejects:rec.rejects,tur:tur0-rec.turelem,counter:rec.counter,L:scoutRealListPrice(rec),mode1:+scoutRealMode(rec).toFixed(3)};
    /* az ellenajánlat elfogadása */
    const b0=S.transferBudget,keret0=fullCareerRoster().length;
    o.ellen=scoutRealBid(rec.n,0,true);
    o.ellenUtan={fizetett:b0-S.transferBudget,counter:o.utana.counter,bent:drafted.has(rec.n)&&extraRoster.some(x=>x.n===rec.n),
      keret:fullCareerRoster().length-keret0,listan:scoutRealHas(rec.n)};
    const erk=meresLoad().sz[1].erk;o.forras=erk[erk.length-1].forras;
    /* elfogadott magas licit */
    const e2=Object.values(careerPool).find(x=>!drafted.has(x.n)&&!scoutRealHas(x.n));
    const rec2=scoutRealAdd(e2,"teszt");triangularRoll=()=>0.9;
    o.magas=scoutRealBid(rec2.n,0.95);
    /* türelem: a nagyon alacsony licit kettőt fogyaszt, aztán végleg nem */
    const e3=Object.values(careerPool).find(x=>!drafted.has(x.n)&&!scoutRealHas(x.n));
    const rec3=scoutRealAdd(e3,"teszt");triangularRoll=_t;
    const t3=rec3.turelem;let kor=0,utolso=null;
    while(!rec3.lost&&kor<10){rec3.wk="regi";utolso=scoutRealBid(rec3.n,0.5);kor++;}
    o.turelem={kezdo:t3,kor,lost:rec3.lost,utolso,ujra:scoutRealBid(rec3.n,1.1)};
    /* ablakonként három */
    const e4=Object.values(careerPool).find(x=>!drafted.has(x.n)&&!scoutRealHas(x.n));
    const rec4=scoutRealAdd(e4,"teszt");rec4.turelem=99;triangularRoll=()=>1.1;
    const h=[];for(let i=0;i<4;i++)h.push(scoutRealBid(rec4.n,0.9).ok);
    o.harom=h;
    triangularRoll=_t;scoutRealWindowOpen=_w;
    /* legfeljebb 8 a listán */
    for(let i=0;i<12;i++){const x=Object.values(careerPool).find(y=>!drafted.has(y.n)&&!scoutRealHas(y.n));scoutRealAdd(x,"teszt");}
    o.max=scoutRealState().list.filter(x=>!x.lost).length;
    /* az ügynökség: jobb ügynökség → alacsonyabb ár, lejjebb a csúcs */
    const A=agencyState(),lv=A.lvl||0;
    A.lvl=0;const q1=[scoutRealAgQ(),scoutRealMode({rejects:0})];
    A.lvl=18;const q10=[scoutRealAgQ(),scoutRealMode({rejects:0})];A.lvl=lv;
    o.ugyn={q1,q10,s1:agencyStars()};
    return o;});
  ok(r5.on&&r5.sOn===true&&r5.ls==="1","a kapcsoló: a futó karrierre és a következőre is",{on:r5.on,s:r5.sOn,ls:r5.ls});
  ok(r5.sav.hi1<r5.sav.hi0&&r5.sav.mode1<r5.sav.mode0,"a felfedezési sáv lejjebb ül (felső határ és csúcs)",r5.sav);
  ok(r5.atl.real<r5.atl.norm,"átlagban gyengébbet talál — az erős ritkább",r5.atl);
  ok(r5.felf.cbOk&&r5.felf.keret===0&&r5.felf.lista===1&&r5.felf.megf===1,"a felfedezett a Megfigyelt listára kerül, NEM a keretbe (és a mérő is látja)",r5.felf);
  ok(r5.arany>=0.635&&r5.arany<=0.765,"a meghirdetett ár a piaci vételár 65–75%-a",{arany:r5.arany,frac:r5.rec.frac});
  ok(r5.rec.turelem>=3&&r5.rec.turelem<=6&&r5.rec.rejects===0,"a türelem 3–5 (+1 jó ügynökséggel)",r5.rec);
  ok(!r5.zart.ok&&/átigazolási időszakban/.test(r5.zart.msg),"zárt ablakban nem lehet licitálni",r5.zart);
  ok(!r5.penzNincs.ok&&/büdzsé/.test(r5.penzNincs.msg),"büdzsé nélkül nem lehet",r5.penzNincs);
  ok(r5.mode0>=0.85&&r5.mode0<=1.0,"a túloldal csúcsa 100% alatt (1★-nál 100, jobb ügynökséggel lejjebb)",r5.mode0);
  ok(r5.kozeli.ok&&!r5.kozeli.elfogadva&&r5.utana.rejects===1&&r5.utana.tur===1&&r5.utana.counter===Math.round(r5.utana.L*1.02),
     "a közeli licit elutasítva → egy türelem, és ELLENAJÁNLAT jön",{k:r5.kozeli,u:r5.utana});
  ok(Math.abs(r5.utana.mode1-(r5.mode0-0.05))<0.002,"elutasítás után a csúcs 5%-kal lejjebb kúszik",{m0:r5.mode0,m1:r5.utana.mode1});
  ok(r5.ellen.ok&&r5.ellen.elfogadva&&r5.ellenUtan.fizetett===r5.ellenUtan.counter&&r5.ellenUtan.bent&&r5.ellenUtan.keret===1&&!r5.ellenUtan.listan,
     "az ellenajánlat elfogadása: fizet, a keretbe kerül, lekerül a listáról",r5.ellenUtan);
  ok(r5.forras==="megfigyelt","a mérő „megfigyelt” forrással rögzíti",r5.forras);
  ok(r5.magas.ok&&r5.magas.elfogadva,"a fogadókészség fölötti licitet elfogadják",r5.magas);
  ok(r5.turelem.lost&&r5.turelem.kor>=2&&r5.turelem.kor<=3&&r5.turelem.utolso.vege&&/végleg/.test(r5.turelem.utolso.msg)&&!r5.turelem.ujra.ok&&/Végleg/.test(r5.turelem.ujra.msg),
     "a nagyon alacsony licit kettőt fogyaszt; ha elfogy a türelem, VÉGLEG nemet mondanak",r5.turelem);
  ok(r5.harom.join()==="true,true,true,false","ablakonként legfeljebb három licit",r5.harom);
  ok(r5.max===8,"legfeljebb 8 megfigyelt",r5.max);
  ok(r5.ugyn.q1[0]===0&&r5.ugyn.q10[0]===1&&r5.ugyn.q1[1]===1&&r5.ugyn.q10[1]<r5.ugyn.q1[1],"az ügynökség számít: 1★ → 75%-os ár, 100%-os csúcs; 10★ → 65%, lejjebb",r5.ugyn);

  /* ---- 6. MENTÉS ---- */
  console.log("\n— 6. mentés —");
  const r6=await p.evaluate(()=>{
    window.__lsw=null;const _s=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===saveKey())window.__lsw=v;return _s.apply(this,arguments);};
    try{saveGame();}finally{Storage.prototype.setItem=_s;}
    let d=null;try{d=JSON.parse(window.__lsw);}catch(e){}
    if(!d)return {nincs:true,len:(window.__lsw||"").length};
    const lista=S.scoutWatch.list.length,id=S.meresId;
    S.scoutWatch={v:1,list:[]};S.scoutReal=null;S.meresId=null;
    applySavedGame(d);
    return {lista,vissza:S.scoutWatch.list.length,real:S.scoutReal,id,idVissza:S.meresId};});
  ok(!r6.nincs&&r6.vissza===r6.lista&&r6.lista>0&&r6.real===true&&r6.idVissza===r6.id,"a lista, a kapcsoló és a napló-azonosító túléli a mentést",r6);

  /* ---- 7. FELÜLET ---- */
  console.log("\n— 7. felület —");
  const r7=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    try{hubMidSeasonReturn();}catch(e){}try{renderHub();}catch(e){}
    const wb=document.getElementById("hubWatchBtn");
    const o={hub:!!wb&&!wb.classList.contains("hide"),ds:document.getElementById("hubWatchDs").textContent};
    wb.click();await varj(100);
    o.panel=!document.getElementById("twPanel").classList.contains("hide");
    o.cim=document.getElementById("twTitle").textContent;
    o.kartya=document.querySelectorAll("#twBody [data-srdel]").length;
    o.licitGomb=document.querySelectorAll("#twBody [data-srbid]").length;
    o.vissza=[...document.querySelectorAll("#twActions button")].map(b=>b.textContent);
    return o;});
  ok(r7.hub&&/\d/.test(r7.ds),"a HUB-on ott a 🔭 Megfigyelt játékosok gomb, létszámmal",r7);
  ok(r7.panel&&/Megfigyelt/.test(r7.cim)&&r7.kartya>=7&&r7.licitGomb===r7.kartya*4&&r7.vissza.some(t=>/HUB/.test(t)),"a panel: kártyánként négy licit-gomb és törlés, vissza a HUB-ba",r7);
  /* a képernyőképhez: a közben felugrott (itt nem vizsgált) rögzített rétegek félre */
  const takar=keep=>p.evaluate(keep=>{document.querySelectorAll("body *").forEach(x=>{
    if(x.closest(keep)||x.querySelector(keep))return;
    const cs=getComputedStyle(x);if(cs.position==="fixed"&&x.offsetWidth>0)x.style.visibility="hidden";});},keep);
  await takar("#scWindow");
  await p.evaluate(()=>document.getElementById("scWindow").scrollIntoView());
  await p.waitForTimeout(400);
  await p.screenshot({path:path.join(SP,"megfigyelt-panel.png")});
  const r8=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    document.getElementById("themeModal").classList.remove("hide");renderThemeModal();await varj(80);
    const q=s=>document.querySelector(s);
    const o={sr:q("#scoutRealBtn")&&q("#scoutRealBtn").getAttribute("aria-pressed"),
      gombok:["#meresLetoltBtn","#meresMasolBtn","#meresFelBtn","#meresAutoBtn"].map(s=>!!q(s)),
      auto:q("#meresAutoBtn")&&q("#meresAutoBtn").getAttribute("aria-pressed")};
    q("#scoutRealBtn").click();await varj(60);
    o.sr2=q("#scoutRealBtn").getAttribute("aria-pressed");o.on2=scoutRealOn();
    q("#scoutRealBtn").click();await varj(60);o.on3=scoutRealOn();
    q("#meresAutoBtn").click();await varj(60);o.fel=meresFelOn();q("#meresAutoBtn").click();await varj(60);o.fel2=meresFelOn();
    o.kiFel=await meresFeltolt(false);
    return o;});
  ok(r8.sr==="true"&&r8.sr2==="false"&&!r8.on2&&r8.on3,"a beállításokban a 🔭 kapcsoló oda-vissza működik",r8);
  ok(r8.gombok.every(Boolean)&&r8.auto==="false","a 📈 Mérési napló blokk: letöltés, másolás, feltöltés, automatikus feltöltés (alapból KI)",r8.gombok);
  ok(r8.fel===true&&r8.fel2===false&&r8.kiFel.ok===false&&r8.kiFel.ok_==="ki","kikapcsolt feltöltésnél idényzáráskor SEMMI nem megy ki",r8.kiFel);
  await takar("#themeModal");
  await p.evaluate(()=>{const x=document.getElementById("scoutRealBtn");if(x)x.scrollIntoView({block:"start"});});
  await p.waitForTimeout(300);
  await p.screenshot({path:path.join(SP,"meres-beallitas.png")});
  await p.evaluate(()=>document.getElementById("themeModal").classList.add("hide"));

  /* ---- 8. KIVONAT ÉS ÖSSZEGZŐ ---- */
  console.log("\n— 8. kivonat —");
  const ex=await p.evaluate(()=>meresExportSzoveg());
  let J=null;try{J=JSON.parse(ex);}catch(e){}
  ok(J&&J.forras==="magyah-meres"&&Array.isArray(J.karrierek)&&J.karrierek.some(k=>k.keret0&&k.sz.length===2),"a letöltés érvényes JSON, benne a karrier mindkét idénye",{len:ex.length});
  const fj=path.join(SP,"meres-proba.json"),fc=path.join(SP,"meres-proba.csv");
  fs.writeFileSync(fj,ex);
  const cp=require("child_process");
  let out="";try{out=cp.execFileSync("node",[path.join(ROOT,"tools/meres/osszegez.js"),fj,"--csv",fc],{encoding:"utf8"});}catch(e){out="HIBA "+e.message;}
  const csv=fs.existsSync(fc)?fs.readFileSync(fc,"utf8").trim().split("\n"):[];
  ok(!/HIBA/.test(out)&&/1\./.test(out)&&csv.length===3,"az összegző lefut: összefoglaló + idényenként egy CSV-sor",{sorok:csv.length,fej:(csv[0]||"").slice(0,200)});
  console.log(out.split("\n").slice(0,30).map(s=>"      "+s).join("\n"));

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
