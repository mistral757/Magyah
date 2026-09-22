/* 🧭 A PIAC HORGONYA ÉS A HSZ MEZŐNYE (3.9.125).

   KÉT BEJELENTETT HIBA, mindkettő a 3.9.112–123 köteg mellékhatása:

   1. „Egy 170-es mezőnyben vagyok, és nem talál semmit az attribútum-kereső,
      a sztár-kereső 100 körülieket akar nekem eladni, a scout is beakadt."
      OK: a piramis horgonyai a világ eltolása után `careerBaseRating =
      oppTargetRating`-et írtak. Amíg ez karrierenként EGYSZER futott, helyes
      volt. A 3.9.112 szuperliga-kalibrációja viszont minden idényben
      `P.anchored=false`-ot ír, tehát a horgony MINDEN SZEZONBAN a mostani
      szintre ugrott, a piac emelkedése (`oppTargetRating − careerBaseRating`)
      nullázódott, és a pool a nyers adatbázis szintjén ragadt.

   2. „A meccs-erőm 192 és 178-as mezőnyt csinált nekem, pedig D0-ban 190-eset
      kellett volna." OK: a 3.9.123 a SZEZONINDÍTÓ meccs-erőt tette horgonynak,
      így a kupa egy fél évvel korábbi kerethez méretett.

   Amit mér:
     1. a horgony a karrier indulószintjén marad a szezonfordulón át;
     2. …akkor is, ha tízszer fordul a szezon;
     3. a piac emelkedése (marketPeakShift) tényleg követi a világot;
     4. a le nem igazolt pool a VILÁG szintjén áll, nem a nyers 85–100-on;
     5. a romlott mentés MAGÁTÓL helyreáll az első horgonyzásnál;
     6. a HSZ mezőnye a BELÉPÉSKORI meccs-erőhöz mér (192 → 191 D0-ban);
     7. …és nem a szezonindítóhoz, akkor sem, ha az el van téve;
     8. a lebutítás-védelem a kupa mérésénél is hat. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9091;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const t=await p.evaluate(()=>{
    const ki={};const n1=x=>Math.round(x*10)/10;
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const src=_k[i%_k.length];
       /* ERŐS KERET: a szuperliga-kalibráció a világot a KERETHEZ húzza, tehát
          egy gyenge tizenegynél a világ is gyenge marad, és a piac
          emelkedésének nem is KELLENE nagynak lennie. A bejelentett helyzet
          (170-es világ, 190-es keret) csak erős kerettel áll elő. */
       /* SAJÁT NÉV, hogy a careerPool ne írja felül: a playerStrength a
          poolbeli attribútumokból dolgozik, ha a név szerepel benne — egy
          valódi adatbázis-névvel a beállított ovr nem érvényesülne. */
       const pl={n:"Eros "+i+" "+src.n,ovr:185,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="T";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=80;S.seasonNumber=1;S.seasonHistory=[];
    infinityMode=true;                       /* 100 fölött a plafon nyitva */
    {const lv={};Object.keys(TACTICS).forEach(k=>{lv[k]=90;});S.tactics={levels:lv,active:"totalis"};}
    h2hRoomActive=()=>false;

    /* A Run-mérő a draft lezárásakor elteszi a karrier indulószintjét. */
    S.run=S.run||{};S.run.baseDiff=careerBaseRating;
    ki.indulo=careerBaseRating;
    const poolMax=()=>{let m=0;Object.values(careerPool||{}).forEach(e=>{
      if(drafted.has(e.n))return;const v=Math.round(ratingAtAge(e.peak,e.age));if(v>m)m=v;});return m;};
    ki.poolElotte=poolMax();

    /* A SZUPERLIGA MEGNYITÁSA és egy jócskán elszaladt világ */
    pyrOpenTopDiv(rngFor("piac:proba"));
    S.pyr.my=0;S.pyr.gapWant=2.0;
    oppTargetRating=pyrLevel();

    /* ---- 1. EGY SZEZONFORDULÓ ---- */
    S.seasonNumber=2;S.idx=0;
    pyrSuperKickoff();
    ki.vilag=oppTargetRating;                /* a kalibráció a kerethez húzta */
    ki.horgony1=careerBaseRating;
    ki.shift1=n1(marketPeakShift());
    ki.poolUtana=poolMax();

    /* ---- 2. TÍZ SZEZONFORDULÓ ---- */
    for(let i=3;i<=12;i++){S.seasonNumber=i;S.idx=0;pyrSuperKickoff();}
    ki.horgony10=careerBaseRating;
    ki.shift10=n1(marketPeakShift());
    ki.vilag10=oppTargetRating;
    ki.poolVegen=poolMax();

    /* ---- 5. A ROMLOTT MENTÉS HELYREÁLL ---- */
    careerBaseRating=oppTargetRating;          /* a hiba szimulálása */
    ki.romlottShift=n1(marketPeakShift());
    S.seasonNumber=13;S.idx=0;
    pyrSuperKickoff();
    ki.helyreHorgony=careerBaseRating;
    ki.helyreShift=n1(marketPeakShift());

    /* ---- 6-8. A HSZ MEZŐNYE ---- */
    S.pyr.msKick=100;                          /* SZÁNDÉKOSAN elavult érték */
    S.pyr.above=1;
    let ms=0;try{msRatedBegin();ms=teamMatchStrength();}finally{msRatedEnd();}
    ki.ms=n1(ms);
    ki.hszD0=hszMid();
    S.pyr.above=2;ki.hszD1=hszMid();
    S.pyr.above=3;ki.hszD2=hszMid();
    S.pyr.above=1;
    ki.varhatoD0=Math.round(ms-1);
    ki.nemAzMsKick=(ki.hszD0!==99);            /* 100 + 1 − 2 = 99 volna */

    /* 8. lebutítás: gyengébb tizenegy → a kupa is a KÖZÉPPEL számol */
    {const pool=fullCareerRoster().filter(Boolean);
     const gy=pool.slice().sort((a,b)=>pOvr(a)-pOvr(b));
     slots.forEach((sl,i)=>{const pl=gy[i%gy.length];if(pl){sl.player=pl;sl.fit=fitFor(pl,sl);}});}
    let elo=0;try{elo=teamStrength()+hiddenMatchBonus();}catch(e){}
    ki.butaElo=n1(elo);
    ki.hszButa=hszMid();
    ki.butaVedve=(ki.hszButa>Math.round(elo-1));
    return ki;});

  console.log("\n1-2. A PIAC HORGONYA A SZEZONFORDULÓN ÁT");
  ok(t.horgony1===t.indulo,"egy forduló után is a karrier indulószintjén",
     {indulo:t.indulo,utana:t.horgony1,vilag:t.vilag});
  ok(t.horgony10===t.indulo,"tíz forduló után is",{indulo:t.indulo,utana:t.horgony10});

  console.log("\n3-4. A PIAC TÉNYLEG KÖVETI A VILÁGOT");
  ok(t.shift1>20,"a piac emelkedése nem nullázódott",{shift:t.shift1,vilag:t.vilag});
  ok(t.poolUtana>t.poolElotte+20,"a le nem igazolt pool felzárkózott a világhoz",
     {elotte:t.poolElotte,utana:t.poolUtana,vilag:t.vilag});
  ok(t.poolVegen>=t.vilag10-30,"…és tényleg a világ közelében van, nem a nyers 85–100-on",
     {pool:t.poolVegen,vilag:t.vilag10});

  console.log("\n5. A ROMLOTT MENTÉS MAGÁTÓL HELYREÁLL");
  ok(Math.abs(t.romlottShift)<15,"a romlott állapotban a piac tényleg összeomlik",t.romlottShift);
  ok(t.helyreHorgony===t.indulo,"az első horgonyzás visszateszi az indulószintre",
     {romlott:t.vilag10,helyre:t.helyreHorgony});
  ok(t.helyreShift>20,"…és a piac újra követi a világot",t.helyreShift);

  console.log("\n6-7. A HIPER SZUPER KUPA MEZŐNYE");
  ok(t.nemAzMsKick===true,"NEM az elavult szezonindító értékből számol",
     {msKick:100,hszD0:t.hszD0});
  ok(kozel(t.hszD0,t.varhatoD0,1),"D0: a belépéskori meccs-erő −1",
     {ms:t.ms,hszD0:t.hszD0,varhato:t.varhatoD0});
  ok(t.hszD1===t.hszD0+1&&t.hszD2===t.hszD0+2,"…és osztályonként eggyel feljebb",
     {d0:t.hszD0,d1:t.hszD1,d2:t.hszD2});

  console.log("\n8. A LEBUTÍTÁS-VÉDELEM A KUPÁNÁL IS");
  ok(t.butaVedve===true,"gyenge tizenegynél a kupa a KÖZÉPPEL számol, nem az élővel",
     {elo:t.butaElo,hsz:t.hszButa});

  const zaj=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(zaj.length===0,"nincs konzolhiba",zaj.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
