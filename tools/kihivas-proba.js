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
      const n=`Teszt Játékos ${i+1}`;
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
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  született típusok ("+r.tipusok.length+"):\n   ",r.tipusok.join(" "));
  console.log("\n  az új típusok céljai:");
  Object.keys(r.uj).forEach(k=>console.log(`    ${k.padEnd(14)} ${String(r.uj[k].n).padStart(4)} db · cél ${r.uj[k].lo}…${r.uj[k].hi}`));
  console.log(`\n  msOne jelöltek (közepes): ${r.ms.jeloltek}`);
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,4));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
