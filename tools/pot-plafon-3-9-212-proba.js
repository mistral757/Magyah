/* 📈 3.9.212 — A BOOST NEM VISZI LE A 200 000 FÖLÖTTI POT-OT

   BEJELENTÉS: „boosttal nem lehet 200k fölé vinni a POTot, de hogy vissza is
   ugrik ha boostolod, azt nem gondoltam." (Egy 400 fölötti Ratingű ifi,
   akinek a POT-ja eleve 200 000 fölött állt: a Rating nőtt, a POT 200 000-re
   esett vissza.)

   Amit mér:
     1. A KEMÉNY PLAFON A MEZŐNNYEL NŐ: 111-es mezőnyig pontosan 200 000,
        fölötte max(200 000, peakToPot(mezőny + 100)), monoton;
     2. A HÁROM RÉGI VÁGÓ ÁG — a kihívás-jutalom POT-boostja, a 🌠 Csodagyerek
        talizmán, az Infinity nyitó ×1,5-e — a plafon fölött állót NEM vágja
        le; a jutalom a lágy plafon (9000) fölötti felnőttet sem;
     3. MINDEN BOOST-FAJTA (ifi, öreg, sima, POT, szezonkártya) egy plafon
        fölött álló játékoson: a POT sosem csökken;
     4. A FELHASZNÁLÓ ÚTJA, A FELÜLETEN ÁT: egy 400-as Ratingű, 900 000-es
        POT-ú ifi a 400-as mezőnyben a HUB ifi-boost paneljén → megerősítés →
        a POT NŐ (a boost ajándéka megérkezik), a Rating is;
     5. A 200 000-ES MEZŐNYBELI ÁG: 82-es mezőnyön egy 250 000-es POT-ú ifi
        boostja a POT-ot nem viszi lejjebb (a régi plafon itt is él, de csak
        fölfelé);
     6. AZ IFI POT-JA FELZÁRKÓZIK A RATINGJÉHEZ (3.9.153) magas mezőnyben a
        valódi szintig, nem a 200 000-ig. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9254;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* A DÍSZLET: egy valódi, felállt karrier-keret (a padló-próba útja) */
  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrPickGap=2;pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    phase="hub";S.transferBudget=1e13;
    return {v:APP_VERSION};});
  ok(String(r0.v).localeCompare("3.9.212",undefined,{numeric:true})>=0,"a verzió legalább 3.9.212",r0.v);

  console.log("\n— 1. a kemény plafon a mezőnnyel nő —");
  const r1=await p.evaluate(()=>{
    if(typeof potHardCap!=="function")return {nincs:true};
    const at=t=>{oppTargetRating=t;return potHardCap();};
    const o={c82:at(82),c100:at(100),c111:at(111),c150:at(150),c250:at(250),c400:at(400),pp:peakToPot(500)};
    oppTargetRating=82;return o;});
  ok(r1.c82===200000&&r1.c100===200000&&r1.c111===200000,"111-es mezőnyig pontosan a régi 200 000",r1);
  ok(r1.c150>300000&&r1.c150<400000,"150-es mezőnyön ~350 000",r1.c150);
  ok(r1.c400===r1.pp&&r1.c400>2e6,"400-as mezőnyön peakToPot(500) — ~2,9 millió",r1.c400);
  ok(r1.c111<=r1.c150&&r1.c150<r1.c250&&r1.c250<r1.c400,"monoton nő a mezőnnyel",[r1.c111,r1.c150,r1.c250,r1.c400]);

  console.log("\n— 2. a három régi vágó ág —");
  const r2=await p.evaluate(()=>{
    const o={};
    const ros=fullCareerRoster().filter(Boolean);
    /* a) KIHÍVÁS-JUTALOM POT-BOOST, 82-es mezőny, Infinity nélkül: mindenki
          250 000-en (a 200 000-es plafon fölött) — senki sem eshet vissza */
    oppTargetRating=82;infinityMode=false;
    ros.forEach(pl=>{const e=careerPool[pl.n];Object.assign(e,{age:18,youthBonus:3,pot:250000});});
    applyChallengeReward({kind:"pot",amount:1500});
    const pots=ros.map(pl=>careerPool[pl.n].pot);
    o.jutalom={min:Math.min(...pots),max:Math.max(...pots)};
    /* …és 400-as mezőnyön (plafon ~2,9 millió) a +1500 meg is érkezik */
    oppTargetRating=400;
    applyChallengeReward({kind:"pot",amount:1500});
    const p400=ros.map(pl=>careerPool[pl.n].pot);
    o.jutalom400={min:Math.min(...p400),max:Math.max(...p400)};
    oppTargetRating=82;
    /* b) ugyanez egy 9500-as POT-ú FELNŐTTEL (lágy plafon 9000): nem vágja 9000-re */
    ros.forEach(pl=>{const e=careerPool[pl.n];Object.assign(e,{age:28,youthBonus:0,pot:9500});});
    applyChallengeReward({kind:"pot",amount:1500});
    const p2=ros.map(pl=>careerPool[pl.n].pot);
    o.felnott={min:Math.min(...p2),max:Math.max(...p2),kapott:p2.filter(x=>x===11000).length};
    /* c) CSODAGYEREK: a legfiatalabb kezdő 900 000-en, 82-es mezőnyön */
    ros.forEach(pl=>{const e=careerPool[pl.n];Object.assign(e,{age:28,pot:3000});});
    const kis=slots.find(sl=>sl&&sl.player).player,ek=careerPool[kis.n];
    Object.assign(ek,{age:16,pot:900000});
    const eredeti=window.talSpecV;
    window.talSpecV=(id,side)=>id==="csodagyerek"&&side==="pro"?20:0;
    try{const A=talSpAll();delete A.csoda;}catch(e){}
    talF6bSzezonvaltas();
    window.talSpecV=eredeti;
    o.csoda={n:kis.n,pot:ek.pot};
    /* d) INFINITY NYITÓ ×1,5: 500 000-es POT 150-es mezőnyön (plafon ~350 000) */
    oppTargetRating=150;
    ros.forEach((pl,i)=>{const e=careerPool[pl.n];delete e._infPotBoosted;e.pot=i===0?500000:(i===1?300000:3000);});
    infinityOwnedPotBoost();
    o.inf={nagy:careerPool[ros[0].n].pot,kozep:careerPool[ros[1].n].pot,kis:careerPool[ros[2].n].pot,cap:typeof potHardCap==="function"?potHardCap():200000};
    oppTargetRating=82;
    return o;});
  ok(r2.jutalom.min===250000&&r2.jutalom.max===250000,"jutalom, 82-es mezőny: a 200 000 fölötti 250 000-esek közül senki sem esik vissza (régen: 200 000)",r2.jutalom);
  ok(r2.jutalom400.min===250000&&r2.jutalom400.max===251500,"jutalom, 400-as mezőny: egy ember megkapja a +1500-at",r2.jutalom400);
  ok(r2.felnott.min>=9500&&r2.felnott.kapott===1,"jutalom: a 9500-as felnőttet nem vágja a lágy plafonra, és megkapja a +1500-at",r2.felnott);
  ok(r2.csoda.pot>=900000,"🌠 Csodagyerek: a 900 000-es POT nem esik 200 000-re",r2.csoda);
  ok(r2.inf.nagy===500000&&r2.inf.kozep===r2.inf.cap&&r2.inf.kis===4500,
     "∞ nyitó ×1,5: a plafon fölötti marad, a 300 000-es a plafonig nő, a 3000-es 4500",r2.inf);

  console.log("\n— 3. minden boost-fajta, plafon fölött —");
  const r3=await p.evaluate(()=>{
    const o={};
    oppTargetRating=82;infinityMode=false;
    const mk=(n,age)=>{const e={n,pos:["KK"],age,startRating:400,peak:405,pot:250000,basePot:250000,basePeak:405,
      youthBonus:age<=23?5:0,youthBonusStartAge:age,nat:"Magyarország"};careerPool[n]=e;try{initPlayerAttrs(e);}catch(x){}return e;};
    const fn={youth:e=>applyYouthBoost(e),old:e=>applyOldBoost(e),plain:e=>applyPlainBoost(e),pot:e=>applyPotBoost(e),
      kartya:e=>cardApplyPot(e,"godlike",1)};
    Object.entries(fn).forEach(([k,f])=>{const e=mk("Plafon "+k,k==="old"?33:18);
      try{f(e);o[k]=e.pot;}catch(x){o[k]="hiba: "+x.message;}});
    return o;});
  ok(Object.values(r3).every(v=>typeof v==="number"&&v>=250000),"82-es mezőnyön (plafon 200 000) egyik boost sem viszi lejjebb a 250 000-et",r3);

  console.log("\n— 4. a felhasználó útja: ifi-boost a HUB-ban, 400-as mezőnyön —");
  const r4=await p.evaluate(()=>{
    oppTargetRating=400;infinityMode=true;
    const pl=slots[3].player,e=careerPool[pl.n];
    Object.assign(e,{age:18,startRating:400,peak:405,pot:900000,basePot:900000,basePeak:405,youthBonus:5,youthBonusStartAge:18});
    e.estimatedPOT=e.pot;delete e.potEstMul;
    pl.ovr=400;
    const elotte={pot:e.pot,r:e.startRating};
    openYouthBoostPanel();
    const gomb=[...document.querySelectorAll("#twActions button")].find(x=>x.textContent.includes(shortName(pl.n)));
    if(gomb)gomb.click();
    const igen=document.getElementById("hubTacticConfirmYes");if(igen)igen.click();
    const szoveg=(document.getElementById("twBody")||{}).textContent||"";
    try{csReturnToHub();}catch(x){}
    return {gomb:!!gomb,elotte,utana:{pot:e.pot,r:e.startRating},szoveg:szoveg.slice(0,160),tag:potTag(pl.n),boostT:e.youthBoostT};});
  ok(r4.gomb,"az ifi a jelöltek között van a panelen");
  ok(r4.utana.pot>r4.elotte.pot,"a POT NŐ (nem esik 200 000-re)",r4);
  ok(r4.utana.r>r4.elotte.r,"a Rating is nő",[r4.elotte.r,r4.utana.r]);
  ok(r4.boostT>0&&r4.utana.pot-r4.elotte.pot===r4.boostT,"a boost-könyvelés a tényleges POT-nyereséget írja",r4.boostT);
  ok(/Berobbant/.test(r4.szoveg)&&r4.szoveg.includes(String(r4.utana.pot)),"a visszajelzés a valódi, új POT-ot mutatja",r4.szoveg);

  console.log("\n— 5. 82-es mezőnyön, a régi plafon fölött álló ifi —");
  const r5=await p.evaluate(()=>{
    oppTargetRating=82;infinityMode=false;
    const pl=slots[4].player,e=careerPool[pl.n];
    Object.assign(e,{age:18,startRating:110,peak:115,pot:250000,youthBonus:5,youthBonusStartAge:18});
    const elotte=e.pot;
    openYouthBoostPanel();
    const gomb=[...document.querySelectorAll("#twActions button")].find(x=>x.textContent.includes(shortName(pl.n)));
    if(gomb)gomb.click();
    const igen=document.getElementById("hubTacticConfirmYes");if(igen)igen.click();
    try{csReturnToHub();}catch(x){}
    return {gomb:!!gomb,elotte,utana:e.pot};});
  ok(r5.gomb&&r5.utana===r5.elotte,"a 250 000 marad (fölfelé a plafon fog, lefelé semmi)",r5);

  console.log("\n— 6. az ifi POT-ja felzárkózik a Ratingjéhez —");
  const r6=await p.evaluate(()=>{
    const e={n:"Felzárkózó Ifi",age:18,startRating:400,peak:405,pot:3000};
    oppTargetRating=400;const kap400=youthPotAlign(e),pot400=e.pot;
    const e2={n:"Felzárkózó Ifi 2",age:18,startRating:400,peak:405,pot:3000};
    oppTargetRating=82;youthPotAlign(e2);
    return {pot400,kap400,cel:peakToPot(400),pot82:e2.pot};});
  ok(r6.pot400===r6.cel&&r6.pot400>1e6,"400-as mezőnyben a Ratingje szerinti POT-ig (nem 200 000-ig)",r6);
  ok(r6.pot82===200000,"82-es mezőnyben a régi 200 000 a határ",r6.pot82);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
