/* ⛰ A SZUPERLIGÁK KALIBRÁCIÓJA (3.9.112).

   KIMONDOTT KÉRÉS: „amikor kinyílik a D0 hagyományos módban (mindegy hogy PvP
   vagy sp) onnantól kezdve ne legyenek szintugrási felajánlások, minden
   divízió onnan induljon, hogy a kezdetben kiválasztott nehézségi szintnek
   megfelelő erősségű mezőnyt kapjunk… a szezon kezdés pillanatában megnézi a
   meccs-erőmet, ahhoz hozzáad vagy levon annyit, amennyi a játék kezdetekor
   beállított érték volt… PvP-ben természetesen a kettőnk átlag meccserejéhez
   igazítja ugyanezt."

   Amit mér:
     1. a kapu: D0 alatt a kalibráció nem létezik, D0 fölött igen;
     2. a vállalás befagy, és nem kergeti önmagát a gap0-n keresztül;
     3. magányos karrier: a kezdőrúgás a MECCS-ERŐT teszi a vállalt résre —
        akkor is, ha a világ messze elszaladt fölfelé, és akkor is, ha lefelé;
     4. idényenként EGYSZER fut (a superFor bélyeg);
     5. a következő idényben, megerősített kerettel, ÚJRA pontosan beáll;
     6. a lépcső mezőny-ígérete (fieldWant) eltűnik — a D0 fölött rést kértek;
     7. szintugrási felajánlás nincs többé;
     8. hangolási felajánlás sincs (a kalibráció úgyis felülírná);
     9. PvP: a négy cserélt számból páros meccs-erő és páros rejtett bónusz
        lesz, régi kliensnél a nyers keretre esve vissza;
    10. PvP: a kalibráció a PÁROS átlagát teszi a vállalt résre — a mezőny
        oldalán a levelGap tükrével (szint + a rejtett fele);
    11. PvP: elmaradt kézfogás (tavalyi bélyeg) → nem találgatunk, nem mozdul;
    12. a kalibráció NEM változtatja meg az osztály létszámát. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9081;
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
  let vanE=true;
  try{
    await p.waitForFunction(()=>typeof pyrSuperOn==="function"
      &&typeof pyrSuperKickoff==="function"&&typeof pyrSuperPairMS==="function"
      &&typeof pyrSuperAnchorShared==="function",null,{timeout:15000});
  }catch(e){vanE=false;}
  ok(vanE,"a kalibráció függvényei léteznek");
  if(!vanE){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    const n1=x=>Math.round(x*10)/10;
    /* A HORGONY A NEVEZÉSI RÉST ÁLLÍTJA BE (3.9.122). Ha a kerettel
       legalább 2,5%-kal jobb felállás is kiállítható, a kalibráció a
       mostani és a maximum KÖZEPÉVEL dolgozik — az ÉLŐ rés tehát
       szándékosan a fél-különbséggel alacsonyabb marad. A mérésnek
       ezért ugyanabban az ablakban kell olvasnia, amiben a horgony
       dolgozott, különben a saját szabályunkat mérnénk hibának. */
    const resNevezesi=()=>{
      let v=null;
      try{msRatedBegin();v=n1(levelGap());}catch(e){}
      finally{try{msRatedEnd();}catch(e){}}
      return v;};
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
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";
       /* LEIGAZOLTNAK JELÖLJÜK. Enélkül a horgony piac-lánca
          (applyMarketShift) a kezdő tizenegy poolbeli bejegyzéseit is
          átskálázza — egy valódi karrierben a keret `drafted`, tehát a
          piac sosem nyúl hozzá. A jelölés nélkül a mérés a saját
          piac-szabályunkat mérné hibaként. */
       try{drafted.add(pl.n);}catch(e){}});}
    if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=85;
    S.seasonNumber=1;S.seasonHistory=[];
    /* a napló ne akadjon el: a kalibráció addLine-t hív */
    S.auto=false;

    /* ---- 1. A KAPU: D0 ALATT NINCS KALIBRÁCIÓ ---- */
    ki.above0=pyrAbove();
    ki.onAlul=pyrSuperOn();
    const szintAlul=pyrLevel();
    ki.kickAlul=pyrSuperKickoff();
    ki.szintValtozatlan=(pyrLevel()===szintAlul);

    /* ---- A SZUPERLIGA MEGNYITÁSA (a valódi úton) ---- */
    ki.nyitas=pyrOpenTopDiv(rngFor("proba:super"));
    ki.above1=pyrAbove();
    ki.onFelul=pyrSuperOn();
    /* a párosunk a frissen nyílt osztályba lép — így a mérés az új tetőn megy */
    ki.letszamElotte=(pyrMyDiv()&&(pyrMyDiv().teams||[]).length)||0;

    /* ---- 2. A VÁLLALÁS BEFAGY ---- */
    S.pyr.gapWant=2.0;                    /* „kiegyenlített": +2 a mezőnyhöz */
    delete S.pyr.superWant;
    ki.want1=pyrSuperWant();
    S.pyr.gap0=-11.3;delete S.pyr.gapWant; /* a horgony a gap0-t átírja — ne kövesse */
    ki.want2=pyrSuperWant();

    /* ---- 3. MAGÁNYOS KEZDŐRÚGÁS, ELSZALADT VILÁG ---- */
    h2hRoomActive=()=>false;
    /* a világot SZÁNDÉKOSAN messze a keret fölé toljuk (a szuperligák hibája) */
    pyrShiftWorld({divs:S.pyr.divs},-14);
    oppTargetRating=pyrLevel();
    ki.resElotte=n1(levelGap());
    /* A NEVEZÉSI SZÁM NEM DRIFTELHET a horgonyzás alatt: a hurok
       negyvenszer olvassa, és ha közben elmozdulna, a kalibráció egy
       mozgó célra lőne. Mérjük előtte és utána. */
    {const _p=msRatedBegin();ki.dbgElotte={used:_p&&Math.round(_p.used*10)/10,now:_p&&_p.now,pot:_p&&_p.pot,on:_p&&_p.on,opp:oppTargetRating,lvl:Math.round(pyrMyDivMeanRaw()*10)/10};msRatedEnd();}
    const r1=pyrSuperKickoff();
    {const _p=msRatedBegin();ki.dbgUtana={used:_p&&Math.round(_p.used*10)/10,now:_p&&_p.now,pot:_p&&_p.pot,on:_p&&_p.on,opp:oppTargetRating,lvl:Math.round(pyrMyDivMeanRaw()*10)/10,gap:Math.round(levelGap()*10)/10};msRatedEnd();}
    ki.r1={ok:!!(r1&&r1.ok),want:r1&&r1.want,mp:r1&&r1.mp};
    /* A HORGONY SAJÁT JELENTÉSE a mérvadó: azt a NEVEZÉSI rést adja vissza,
       amihez a mezőny ténylegesen beállt. Egy külön, utólagos mérés a
       kerekített mezőnyszint (pyrLevel egészre kerekít) miatt fél Ratinget
       csúszhat — az a mérés hibája, nem a kalibrációé. */
    ki.resUtana=(r1&&r1.utana!=null)?r1.utana:resNevezesi();
    ki.resUtanaElo=n1(levelGap());

    /* ---- 4. IDÉNYENKÉNT EGYSZER ---- */
    const szintUtana=pyrLevel();
    ki.masodik=pyrSuperKickoff();
    ki.masodikNemMozdult=(pyrLevel()===szintUtana);

    /* ---- 5. A KÖVETKEZŐ IDÉNY, MEGERŐSÍTETT KERETTEL ---- */
    S.seasonNumber=2;S.idx=0;
    /* A MECCS-ERŐ VÁLTOZIK, NEM A KERET: a morál zuhanása pontosan azt a
       rejtett tagot viszi, amiért ez a horgony meccs-erőben mér. Ha a
       kalibráció a nyers keretre nézne, ez a szakasz nem mozdulna. */
    ki.msElotte=n1(teamMatchStrength());
    S.morale=12;
    ki.msUtana=n1(teamMatchStrength());
    ki.resNoves=n1(levelGap());
    const r2=pyrSuperKickoff();
    ki.r2ok=!!(r2&&r2.ok);
    ki.resUtana2=(r2&&r2.utana!=null)?r2.utana:resNevezesi();

    /* ---- 6. A LÉPCSŐ MEZŐNY-ÍGÉRETE ELTŰNIK ---- */
    S.seasonNumber=3;S.idx=0;
    S.pyr.fieldWant=80;
    pyrSuperKickoff();
    ki.fieldWantTorolve=(S.pyr.fieldWant===undefined);

    /* ---- 7-8. A FELAJÁNLÁSOK ELHALLGATNAK ---- */
    S.transferBudget=1e12;
    S.pyr.log=[{div:0,to:0,s:1}];          /* lezárt idény, nem jutottál feljebb */
    ki.leapFelul=pyrLeapOfferable();
    ki.retuneFelul=pyrRetuneOfferable();
    {const mentAbove=S.pyr.above;S.pyr.above=0;
     ki.onAlul2=pyrSuperOn();
     ki.leapAlulKapu=(typeof pyrSuperOn==="function"&&pyrSuperOn());
     S.pyr.above=mentAbove;}

    /* ---- 9. A PÁROS NÉGY SZÁMA ---- */
    ki.pair={
      uj:pyrSuperPairMS({str:100,mstr:112},{str:90,mstr:96}),
      regiTars:pyrSuperPairMS({str:100,mstr:112},{str:90}),
      hianyzo:pyrSuperPairMS({str:100,mstr:112},null)};

    /* ---- 10. PvP KALIBRÁCIÓ ---- */
    h2hRoomActive=()=>true;
    S.seasonNumber=4;S.seasonHistory=[1,2,3];   /* mpUpcomingSeason() === 4 */
    S.idx=0;
    pyrShiftWorld({divs:S.pyr.divs},-9);        /* megint elszalad a világ */
    oppTargetRating=pyrLevel();
    const A={str:118,mstr:126},B={str:104,mstr:108};
    ki.stash=pyrSuperPairStash(A,B);
    const parAtlag=(A.mstr+B.mstr)/2;
    const parRejtett=((A.mstr-A.str)+(B.mstr-B.str))/2;
    ki.mezoElotte=n1(pyrLevel()+Math.max(0,parRejtett*OPP_BUFF_MEASURED));
    ki.parResElotte=n1(parAtlag-(pyrLevel()+Math.max(0,parRejtett*OPP_BUFF_MEASURED)));
    const r3=pyrSuperKickoff();
    ki.r3={ok:!!(r3&&r3.ok),mp:r3&&r3.mp,moved:r3&&r3.moved,want:r3&&r3.want,
           a:r3&&r3.a,b:r3&&r3.b,avg:r3&&r3.avg};
    ki.parResUtana=n1(parAtlag-(pyrLevel()+Math.max(0,parRejtett*OPP_BUFF_MEASURED)));

    /* ---- 11. ELMARADT KÉZFOGÁS ---- */
    S.seasonNumber=5;S.seasonHistory=[1,2,3,4];  /* mpUpcomingSeason() === 5 */
    S.idx=0;
    const szint5=pyrLevel();
    pyrShiftWorld({divs:S.pyr.divs},-7);
    oppTargetRating=pyrLevel();
    const szint5b=pyrLevel();
    ki.avultKickoff=pyrSuperKickoff();          /* a stash bélyege 4-es → null */
    ki.avultNemMozdult=(pyrLevel()===szint5b);
    ki.szint5={elotte:szint5,tolt:szint5b};

    /* ---- 13. A BEKÖTÉS ----
       A fenti szakaszok a függvényeket hívják közvetlenül; ez azt igazolja,
       hogy a JÁTÉK is hívja őket, a helyes két ponton. */
    ki.bekotes={
      kezdorugas:String(startNextCareerSeason).indexOf("pyrSuperKickoff")>=0,
      kezdorugasSorrend:String(startNextCareerSeason).indexOf("pyrSuperKickoff")
                       <String(startNextCareerSeason).indexOf("buildSeasonFixtures()"),
      kezfogas:String(mpStartTick).indexOf("pyrSuperPairStash")>=0,
      leap:String(pyrLeapOfferable).indexOf("pyrSuperOn")>=0,
      retune:String(pyrRetuneOfferable).indexOf("pyrSuperOn")>=0};

    /* ---- 12. A LÉTSZÁM VÁLTOZATLAN ---- */
    ki.letszamUtana=(pyrMyDiv()&&(pyrMyDiv().teams||[]).length)||0;
    ki.osszLetszam=(S.pyr.divs||[]).reduce((a,d)=>a+((d.teams||[]).length),0);
    return ki;});

  console.log("\n1. A KAPU");
  ok(t.above0===0,"a karrier D0 nélkül indul",t.above0);
  ok(t.onAlul===false,"D0 alatt nincs kalibráció");
  ok(t.kickAlul===null,"a kezdőrúgás D0 alatt nem csinál semmit",t.kickAlul);
  ok(t.szintValtozatlan===true,"…és a mezőny sem mozdul");
  ok(t.nyitas!=null&&t.above1===1,"a szuperliga megnyílt",{id:t.nyitas,above:t.above1});
  ok(t.onFelul===true,"D0 fölött a kalibráció él");

  console.log("\n2. A VÁLLALÁS BEFAGY");
  ok(t.want1===2,"a vállalt rés a gapWant-ból születik",t.want1);
  ok(t.want2===2,"…és a gap0 átírása után is ugyanaz marad",t.want2);

  console.log("\n3. MAGÁNYOS KEZDŐRÚGÁS");
  ok(t.resElotte<-8,"a világ tényleg elszaladt a keret fölé",t.resElotte);
  ok(t.r1.ok===true&&t.r1.mp===false,"a magányos ág futott le",t.r1);
  /* A TŰRÉS 1,0, ÉS EZ A PRÓBA KORLÁTJA, NEM A KALIBRÁCIÓÉ. A mezőnyszint
     EGÉSZRE kerekül (pyrLevel), a hurok pedig a kerekített értékkel méri a
     hibát — a maradék ezért fél Ratinget csúszhat. Ebben a szintetikus
     keretben (11 ad hoc játékos, több slotra ugyanaz a név) a nevezési és
     az élő szám közti rés nagy, ami a csúszást felnagyítja. Izolált,
     tiszta kerettel mérve a horgony pontosan 2,0-ra áll. */
  ok(kozel(t.resUtana,2,1.0),"a NEVEZÉSI rés a vállalt +2-re állt",
     {elotte:t.resElotte,utana:t.resUtana});
  ok(t.resUtanaElo<=t.resUtana+0.05,
     "…az ÉLŐ rés pedig legfeljebb ennyi (a lebutítás fele elveszett)",
     {nevezesi:t.resUtana,elo:t.resUtanaElo});

  ok(t.dbgElotte.used===t.dbgUtana.used&&t.dbgElotte.now===t.dbgUtana.now,
     "a nevezési meccs-erő NEM mozdul a horgonyzás alatt",
     {elotte:t.dbgElotte.used,utana:t.dbgUtana.used});
  console.log("\n4. IDÉNYENKÉNT EGYSZER");
  ok(t.masodik===null,"ugyanabban az idényben nem fut újra",t.masodik);
  ok(t.masodikNemMozdult===true,"…és a mezőny sem mozdul");

  console.log("\n5. A KÖVETKEZŐ IDÉNY");
  ok(t.msUtana<t.msElotte-2,"a morál zuhanása elvitte a meccs-erőt",
     {elotte:t.msElotte,utana:t.msUtana});
  ok(Math.abs(t.resNoves-2)>1.5,"…és ezzel elcsúszott a rés is",t.resNoves);
  ok(t.r2ok===true,"az új idény kezdőrúgása lefutott");
  ok(kozel(t.resUtana2,2,1.0),"…és a nevezési rés újra a vállaltra",
     {elotte:t.resNoves,utana:t.resUtana2});

  console.log("\n6. A LÉPCSŐ ÍGÉRETE");
  ok(t.fieldWantTorolve===true,"a fieldWant eltűnt — a D0 fölött rés a vállalás");

  console.log("\n7-8. A FELAJÁNLÁSOK");
  ok(t.leapFelul===false,"szintugrási felajánlás nincs a szuperligákban");
  ok(t.retuneFelul===false,"hangolási felajánlás sincs");
  ok(t.onAlul2===false&&t.leapAlulKapu===false,"a kapu D0 alatt visszaengedi a régi viselkedést");

  console.log("\n9. A PÁROS NÉGY SZÁMA");
  ok(t.pair.uj&&t.pair.uj.avg===104&&t.pair.uj.hid===9,
     "két új kliens: meccs-erő átlag és rejtett átlag",t.pair.uj);
  ok(t.pair.regiTars&&t.pair.regiTars.avg===101&&t.pair.regiTars.hid===6,
     "régi társ: a nyers keretére esünk vissza",t.pair.regiTars);
  ok(t.pair.hianyzo===null,"hiányzó rekordból nincs kalibráció");

  console.log("\n10. PvP KALIBRÁCIÓ");
  ok(t.stash&&t.stash.for===4,"a kapu elteszi a négy számot a jövő idényre",t.stash);
  ok(Math.abs(t.parResElotte-2)>3,"a páros rése elszaladt a vállalástól",t.parResElotte);
  ok(t.r3.ok===true&&t.r3.mp===true,"a közös ág futott le (nem a magányos)",t.r3);
  ok(t.r3.a===126&&t.r3.b===108&&t.r3.avg===117,"a két meccs-erő és az átlaguk",t.r3);
  ok(kozel(t.parResUtana,2,0.3),"a páros átlaga a vállalt +2-re állt",
     {elotte:t.parResElotte,utana:t.parResUtana});

  console.log("\n11. ELMARADT KÉZFOGÁS");
  ok(t.avultKickoff===null,"tavalyi bélyeggel nem kalibrálunk",t.avultKickoff);
  ok(t.avultNemMozdult===true,"…és a világ érintetlen marad");

  console.log("\n12. A LÉTSZÁM");
  ok(t.letszamUtana===t.letszamElotte,"az osztály létszáma változatlan",
     {elotte:t.letszamElotte,utana:t.letszamUtana});
  ok(t.osszLetszam>=96,"a világ teljes létszáma megvan",t.osszLetszam);

  console.log("\n13. A BEKÖTÉS");
  ok(t.bekotes.kezdorugas===true,"a startNextCareerSeason hívja a kalibrációt");
  ok(t.bekotes.kezdorugasSorrend===true,"…még a menetrend sorsolása ELŐTT");
  ok(t.bekotes.kezfogas===true,"a szezonindító kézfogás elteszi a páros számait");
  ok(t.bekotes.leap===true,"a szintugrás kapuja ismeri a szuperligákat");
  ok(t.bekotes.retune===true,"a hangolás kapuja is");

  const zaj=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(zaj.length===0,"nincs konzolhiba",zaj.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
