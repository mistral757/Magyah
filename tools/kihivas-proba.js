/* A KIHÍVÁS-KATALÓGUS ÁTSZABÁSA (3.9.37) — próba.

   Amit mér:
     1. A KIVEZETETT típusok (msDone, subGoals, tacticLevel) ÚJ ajánlatban
        soha nem jelennek meg — de a challengeRawValue még kiértékeli őket,
        mert a futó mentésekben ott állhatnak elvállalva.
     2. Az ÚJ típusok tényleg megszületnek, és a céljuk értelmes sávban van.
     3. A haladás-számítás mindegyiknél a VÁLLALÁS UTÁNI eseményeket méri.
     4. A `msOne` csak KÖZELI (a nehézséghez tartozó sáv fölötti) mérföldkövet
        ajánl fel, és sosem olyat, ami már megvan vagy beragadt.
     5. A `renewOld` sávja tényleg sorsolt, és a haladás a sávhoz igazodik.
     6. A `tacticMatches` jutalma: 60 → 81, de 80 → 86 (a 81 ott visszalépés).
     7. A skalp-fedezet kapuja: szűk sorsolásnál nincs ajánlat.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8978;
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
    const out={};
    gameMode="career";teamName="Pipacs FC";
    S.seasonNumber=1;S.transferBudget=50000;
    careerPool={};
    SEASON_OPPS=buildOpponents(15,80);
    buildSeasonFixtures();
    _aiSchedCache=null;liveTableInvalidate();
    /* egy hihető kezdő 11 — a kihívás-kontextus ebből dolgozik */
    const POS=["KP","JV","BV","BV","KV","VKP","KKP","TKP","JSZ","BSZ","CS"];
    slots.length=0;
    POS.forEach((pos,i)=>{
      const n=`Teszt Jatekos ${i+1}`;
      const pl={n,pos:[pos],ovr:80,age:26,tsi:9000,nat:"Magyarország"};
      careerPool[n]={n,pos:[pos],ovr:80,age:26,tsi:9000,peak:82,nat:"Magyarország",conf:0};
      slots.push({pos,player:pl,fit:1});});
    S.idx=0;S.fixtureResults=[];

    /* ---- 1-2. MI SZÜLETIK ÉS MI NEM ---- */
    const tipus={};
    for(let i=0;i<1400;i++){
      const sc=i%2?"short":"long";
      let o=null;try{o=buildChallengeOffer(sc,challengeContext());}catch(e){}
      if(!o)continue;
      const k=o.type;
      const e=tipus[k]=tipus[k]||{n:0,lo:Infinity,hi:-Infinity,scope:{}};
      e.n++;e.scope[o.scope||sc]=1;
      if(typeof o.target==="number"){e.lo=Math.min(e.lo,o.target);e.hi=Math.max(e.hi,o.target);}}
    out.tipusok=Object.keys(tipus).sort();
    out.kivezetett=["msDone","subGoals","tacticLevel"].filter(t=>tipus[t]);
    out.uj={};["msOne","subMinutes","subStars","defStars","tacticMatches","renewOld"]
      .forEach(t=>{if(tipus[t])out.uj[t]={n:tipus[t].n,lo:tipus[t].lo,hi:tipus[t].hi};});

    /* ---- 3. HALADÁS: CSAK A VÁLLALÁS UTÁN ---- */
    S.chSeasonSubMinutes=500;S.chSeasonSubStars=4;S.chSeasonDefStars=9;
    const mk=(t,extra)=>Object.assign({type:t,target:3,startProgress:challengeRawValue({type:t})},extra||{});
    const cSub=mk("subMinutes");cSub.target=200;
    const cStar=mk("subStars");
    const cDef=mk("defStars");
    S.chSeasonSubMinutes+=250;S.chSeasonSubStars+=3;S.chSeasonDefStars+=5;
    out.delta={subMinutes:challengeProgress(cSub),subStars:challengeProgress(cStar),defStars:challengeProgress(cDef)};

    /* ---- 4. msOne: csak közeli, sosem kész/beragadt ---- */
    const M=msState();
    const near=chNearMilestones("medium");
    out.ms={jeloltek:near.length,
      mind_kozeli:near.every(x=>x.pct>=CH_MS_NEAR.medium&&x.pct<1),
      keszet_nem_kinal:near.every(x=>!(M.done&&M.done[x.d.id])),
      beragadtat_nem_kinal:near.every(x=>!(M.pend&&M.pend[x.d.id])),
      nehez_tagabb:chNearMilestones("hard").length>=near.length,
      konnyu_szukebb:chNearMilestones("easy").length<=near.length};
    if(near.length){
      const d=near[0].d;
      const ch={type:"msOne",target:1,msId:d.id,startProgress:0};
      out.ms.nulla_amig_nincs=challengeProgress(ch)===0;
      M.done=M.done||{};M.done[d.id]={season:1};
      out.ms.egy_ha_megvan=challengeProgress(ch)===1;
      delete M.done[d.id];}

    /* ---- 5. renewOld: sorsolt sáv, sávhoz igazodó haladás ---- */
    const sav=new Set();
    for(let i=0;i<300;i++){
      let o=null;try{o=buildChallengeOffer("short",challengeContext());}catch(e){}
      if(o&&o.type==="renewOld")sav.add(o.sellAge+"/"+o.buyAge);}
    out.renew={savok:sav.size};
    S.chSoldAges=[35];S.chBoughtAges=[19];                 /* vállalás ELŐTTI üzletek */
    const ro={type:"renewOld",target:1,sellAge:30,buyAge:26,
      startSold:S.chSoldAges.length,startBought:S.chBoughtAges.length};
    out.renew.elotte_nem_szamit=challengeRawValue(ro)===0;
    S.chSoldAges.push(28);S.chBoughtAges.push(27);          /* a sávon KÍVÜL */
    out.renew.savon_kivul_nem=challengeRawValue(ro)===0;
    S.chSoldAges.push(31);S.chBoughtAges.push(25);          /* a sávon BELÜL */
    out.renew.savon_belul_igen=challengeRawValue(ro)===1;

    /* ---- 6. tacticFamiliar: 60 → 81, de 80 → 86 ---- */
    S.tactics={levels:{},active:"kontra"};
    Object.keys(TACTICS).forEach(k=>{S.tactics.levels[k]=60;});
    S.chTacticMatches={labdatartas:15};
    applyChallengeReward({kind:"tacticFamiliar",excludeTactic:"kontra"});
    out.taktika={alacsonyrol:S.tactics.levels.labdatartas};
    S.tactics.levels.labdatartas=82;
    applyChallengeReward({kind:"tacticFamiliar",excludeTactic:"kontra"});
    out.taktika.magasrol=S.tactics.levels.labdatartas;
    /* az aktív taktika sosem kaphatja meg */
    S.chTacticMatches={kontra:30};
    const sz=applyChallengeReward({kind:"tacticFamiliar",excludeTactic:"kontra"});
    out.taktika.aktivat_nem=(S.tactics.levels.kontra===60);

    /* ================= 3.9.37: A TELJES JUTALOM- ÉS BÜNTETÉS-KÉSZLET =================
       A LÉNYEG: egy jutalom, ami nem csinál semmit, ROSSZABB, mint ha nem
       létezne — a játékos kipipálja, és nem érti, miért nem változott semmi.
       Ezért MINDEGYIKET elsütjük, és megnézzük, hogy a hozzá tartozó ÁLLAPOT
       tényleg megváltozott-e. */
    S.chFreeBoost={};S.chDealBoost=0;S.chDealMalus=0;S.chTrainBoost=0;
    S.chYouthSell=null;S.chBidFloor90=0;S.chTacticFitPP=0;S.chSpeedOpen=null;
    S.chHatUp=null;S.chDefRating=null;S.chYellowCut=0;S.chHealTokens=0;
    S.chRoleFreeze=0;S.chBondSlow=0;S.chSkillPickLock=0;S.chTrainSecFreeze=0;
    S.chBuyDiscountNext=0;
    S.tactics={levels:{},active:"kontra"};Object.keys(TACTICS).forEach(k=>{S.tactics.levels[k]=60;});
    const hat=(kind,extra)=>String(applyChallengeReward(Object.assign({kind},extra||{}))||"");
    const hatP=(kind,extra)=>String(applyChallengePunishment(Object.assign({kind},extra||{}))||"");
    out.jut={};out.bunt={};
    hat("freeBoost",{boost:"plain"});
    out.jut.ingyenBoost=(chFreeBoostLeft("plain")===1&&boostPriceOf("plain")===0);
    hat("dealEasier");             out.jut.uzletKonnyebb=(S.chDealBoost===CH_DEAL_TRIES);
    hat("trainBoost");             out.jut.edzesBoost=(S.chTrainBoost===CH_TRAIN_BOOST_M);
    hat("youthSellable");          out.jut.ifiElado=!!S.chYouthSell&&chYouthSellMin(S.chYouthSell)===CH_YOUTH_SELL_MIN;
    hat("askFloor");               out.jut.arPadlo=(S.chBidFloor90===CH_ASK_FLOOR_N);
    hat("tacticFitUp",{amount:5}); out.jut.illeszkedes=(S.chTacticFitPP===5);
    hat("tacticLevelUp");          out.jut.begyakorlas=(S.tactics.levels.kontra===61);
    hat("speedCapOpen");           out.jut.sebPlafon=!!S.chSpeedOpen&&speedCap(S.chSpeedOpen)===attrHardCap()&&speedCap("senki")!==attrHardCap();
    hat("hatTrickUp",{amount:5});  out.jut.mesterharmas=!!S.chHatUp&&chHatMult(S.chHatUp.n,{[S.chHatUp.n]:2})>1&&chHatMult(S.chHatUp.n,{[S.chHatUp.n]:1})===1;
    hat("defRatingUp",{amount:40});out.jut.vedoErtekeles=!!S.chDefRating&&S.chDefRating.left===CH_DEFRATING_M;
    {const kp=chPickKeeper(),e=kp&&careerPool[kp.n],f0=e?(e.formPoints||0):null;
     hat("gkFormUp",{amount:3});
     out.jut.kapusForma=!!(e&&(e.formPoints||0)===f0+3);}
    hat("yellowDown",{amount:20}); out.jut.sargalap=(Math.abs(S.chYellowCut-0.20)<1e-9);
    hat("healInjury");             out.jut.gyogyitas=(S.chHealTokens===1);
    hat("buyDiscountNext");        out.jut.vasarlasKedvezmeny=(S.chBuyDiscountNext===1);
    hatP("roleFreeze");    out.bunt.szerepFagy=(S.chRoleFreeze===CH_ROLE_FREEZE_M&&roleStyleActive()===false);
    hatP("bondSlow");      out.bunt.osszhangLassu=(S.chBondSlow===CH_BOND_SLOW_M);
    hatP("skillPickLock"); out.bunt.skillZar=(S.chSkillPickLock===(skillRealOn()?CH_SKILLLOCK_REAL:CH_SKILLLOCK_LAZA));
    hatP("trainSecFreeze");out.bunt.masodlagosFagy=chTrainSecFrozen();
    hatP("dealHarder");    out.bunt.uzletNehezebb=(S.chDealMalus===CH_DEAL_TRIES_DOWN);
    /* --- A HÁROM „VALAMIT ELVESZÍTESZ" BÜNTETÉS: külön felállás kell hozzá --- */
    {const st=styleState&&styleState();
     if(st){st.traits=st.traits||{};
       const kulcs=Object.keys(st.traits)[0]||"_proba";
       st.traits[kulcs]=2;
       hatP("loseStylePerk");
       out.bunt.stilusKepesseg=((st.traits[kulcs]||0)===1);}
     else{
       /* Stílus nélkül a büntetésnek NINCS mit elvennie — és ezt is ki kell
          mondania, nem némán elszállnia. */
       out.bunt.stilusKepesseg=/elmarad/.test(hatP("loseStylePerk"));}}
    {const L=staff();
     L.length=0;
     L.push({n:"Gyenge Edzo",type:"medic",sz:20,fp:{n:"Gyenge Edzo"}});
     L.push({n:"Eros Edzo",type:"medic",sz:80,fp:{n:"Eros Edzo"}});
     hatP("staffLeaves");
     out.bunt.stabTavozik=(L.length===1&&L[0].n==="Eros Edzo");}
    {const a1=slots[0].player.n,b1=slots[1].player.n;
     S.bondsSeeded=true;
     bondSet(a1,b1,40);
     const elotteB=bondRaw(a1,b1);
     const uz=hatP("bondSplit");
     const utanaB=bondRaw(a1,b1);
     out.bunt.elidegenedes=(Math.round(elotteB-utanaB)===CH_BOND_SPLIT);
     out.bunt.elidegenedesUzenet=/összhang/.test(uz);}
    const elotte={r:S.chRoleFreeze,b:S.chBondSlow,s:S.chSkillPickLock,t:S.chTrainBoost,
                  d:S.chDefRating?S.chDefRating.left:0};
    chModifierTick();
    out.tick={szerep:S.chRoleFreeze===elotte.r-1,bond:S.chBondSlow===elotte.b-1,
      skill:S.chSkillPickLock===elotte.s-1,edzes:S.chTrainBoost===elotte.t-1,
      vedo:(S.chDefRating?S.chDefRating.left:0)===elotte.d-1};
    const cel=slots[3].player.n;
    S.unavailable=S.unavailable||{};S.replacementChoice=S.replacementChoice||{};
    S.chHealTokens=1;S.unavailable[cel]={reason:"injury",matchesLeft:3};
    out.gyogy={kinalja:chCanHeal(cel)};
    chHealInjury(cel);
    out.gyogy.meggyogyult=!S.unavailable[cel]&&S.chHealTokens===0;
    S.chHealTokens=1;S.unavailable[cel]={reason:"red",matchesLeft:1};
    out.gyogy.eltiltastNem=!chCanHeal(cel);
    delete S.unavailable[cel];S.chHealTokens=0;

    /* ---- A 3.9.37-es ÚJ KIHÍVÁSOK MEGSZÜLETNEK-E ---- */
    S.lockerLog=[{s:1,pos:false,who:["Teszt Jatekos 5"]},{s:1,pos:false,who:["Teszt Jatekos 5"]}];
    S.bondNew={"Teszt Jatekos 7":{m:3}};
    S.trainingChangeUsed=false;S.bondTrainChangeUsed=false;
    /* Két OLCSÓ tartalék: az „árusítsd ki a keret alját" kihívás legalább
       kettőnél ajánlja fel magát (egyetlen emberért nem tét). */
    [["Teszt Ifi",18,900],["Teszt Selejt",19,850]].forEach(([n,age,tsi])=>{
      careerPool[n]={n,pos:["CS"],ovr:64,age,tsi,peak:70,nat:"Magyarorszag",conf:0};
      extraRoster.push({n,pos:["CS"],ovr:64,age,tsi,nat:"Magyarorszag"});});
    out.olcsoTartalek=chCheapReserves();
    const uj={};
    for(let i=0;i<1600;i++){
      const sc=i%2?"short":"long";
      let o=null;try{o=buildChallengeOffer(sc,challengeContext());}catch(e){}
      if(o)uj[o.type]=(uj[o.type]||0)+1;}
    out.ujKihivasok={};
    ["tensionOut","youthListed","bondBoostNew","staffFromPlayer","trainFocus",
     "integrationDone","staffBought","looksSpent","cheapReservesOut"]
      .forEach(t=>{out.ujKihivasok[t]=uj[t]||0;});

    /* ---- 7. SKALP-FEDEZET ---- */
    const my=teamOVRbase();
    const gyenge=f=>{if(f&&f.o)f.o.ovr=my-20;};
    S.fixtures.forEach(gyenge);
    let skalp=0;
    for(let i=0;i<400;i++){
      let o=null;try{o=buildChallengeOffer("short",challengeContext());}catch(e){}
      if(o&&o.type==="bigScalps")skalp++;}
    out.skalp_gyenge_mezonyben=skalp;
    return out;});

  const CH_SUBMIN_CAP_JS=1000;
  const T=[
    ["a kivezetett típusok NEM születnek újra",r.kivezetett.length===0],
    ["mind a hat új típus megszületik",Object.keys(r.uj).length===6],
    ["csereperc-cél a sávban (45…1000, a szezon-plafonnal)",!!r.uj.subMinutes&&r.uj.subMinutes.lo>=45&&r.uj.subMinutes.hi<=CH_SUBMIN_CAP_JS],
    ["csere-csillag cél 1…3",!!r.uj.subStars&&r.uj.subStars.lo>=1&&r.uj.subStars.hi<=3],
    ["védő-csillag cél a saját ütemedből (4…60)",!!r.uj.defStars&&r.uj.defStars.lo>=4&&r.uj.defStars.hi<=60],
    ["a haladás csak a vállalás UTÁNI eseményeket méri",
      r.delta.subMinutes===250&&r.delta.subStars===3&&r.delta.defStars===5],
    ["msOne: minden jelölt a sávban van, kész/beragadt sosem",
      r.ms.mind_kozeli&&r.ms.keszet_nem_kinal&&r.ms.beragadtat_nem_kinal],
    ["msOne: a nehéz sáv tágabb, a könnyű szűkebb",r.ms.nehez_tagabb&&r.ms.konnyu_szukebb],
    ["msOne haladása 0 → 1 a mérföldkővel",r.ms.nulla_amig_nincs===true&&r.ms.egy_ha_megvan===true],
    ["renewOld: több különböző sáv születik",r.renew.savok>=4],
    ["renewOld: a vállalás előtti üzlet nem számít",r.renew.elotte_nem_szamit===true],
    ["renewOld: a sávon kívüli kor nem számít",r.renew.savon_kivul_nem===true],
    ["renewOld: a sávon belüli mindkét lépés teljesít",r.renew.savon_belul_igen===true],
    ["taktika-jutalom: 60 → 81",r.taktika.alacsonyrol===81],
    ["taktika-jutalom: 82 → 86 (a 81 visszalépés volna)",r.taktika.magasrol===86],
    ["taktika-jutalom: a vállaláskori taktikát sosem emeli",r.taktika.aktivat_nem===true],
    ["skalp: rivális nélküli mezőnyben nincs ajánlat",r.skalp_gyenge_mezonyben===0],
    ...Object.keys(r.jut).map(k=>["jutalom hat: "+k,r.jut[k]===true]),
    ...Object.keys(r.bunt).map(k=>["büntetés hat: "+k,r.bunt[k]===true]),
    ["a meccsenként fogyó számlálók fogynak",Object.values(r.tick).every(Boolean)],
    ["gyógyítás: felajánlja, gyógyít, eltiltásra nem",
      r.gyogy.kinalja&&r.gyogy.meggyogyult&&r.gyogy.eltiltastNem],
    ["mind a kilenc új kihívás megszületik",Object.values(r.ujKihivasok).every(n=>n>0)],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  született típusok ("+r.tipusok.length+"):\n   ",r.tipusok.join(" "));
  console.log("\n  az új típusok céljai:");
  Object.keys(r.uj).forEach(k=>console.log(`    ${k.padEnd(14)} ${String(r.uj[k].n).padStart(4)} db · cél ${r.uj[k].lo}…${r.uj[k].hi}`));
  console.log(`\n  msOne jelöltek (közepes): ${r.ms.jeloltek}`);
  console.log(`  olcsó tartalék a próbakeretben: ${r.olcsoTartalek}`);
  console.log("\n  az új kihívások előfordulása 1600 sorsolásból:");
  Object.keys(r.ujKihivasok).forEach(k=>console.log(`    ${k.padEnd(18)} ${r.ujKihivasok[k]}`));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,4));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
