/* 🧮 3.9.318 — A BOOST-PLAFON, A FOLYAMATOS RÉS-KÖVETÉS ÉS A BOOST-ADÓSSÁG.

   KÉRÉS: „a boostok ereje elszabadul 3. Szezontól kezdve […] Főleg az öreg
   róka boost […] 298as játékosból most csinált pl. 423-ast […] a kezdő 11
   meccsereje max x%-ot és max X rating pontot ugorhat általa […] ha kapásból
   tud boosttal kezdeni a player, akkor egy -1es különbséget is gyorsan +2re
   tud változtatni" · „sima boost az új verzióban legyen olcsóbb. Kb 33%-kal"
   · „építsük be a boost mérőt a firebase feltöltős cuccba, magába a játékba
   pedig jó lesz, hogy rendszeresen az idény közben összevetjük a várt
   fejlődést a ténylegessel."

   Egy lap, egyjátékos piramis-karrier (a kétoldalú, tízfokozatú szabállyal),
   a játék valódi függvényein át. Amit mér:
     1. a plafon: Infinity-ben, 350-es mezőnyben az öreg róka egy 298-ason
        legfeljebb +16 (a kezdő 11-re +1,5); a csúcs nem ugrik el, a POT hozzá
        igazodik; a következő idényváltáskor sincs utólagos ugrás (fénykor);
     2. a karrier eleje változatlan: 90-es kezdő 11-nél a plafon 12, az ifi
        boost sávja nem vágódik;
     3. ugyanazon a játékoson az idény 2. boostjának plafonja ×0,7; az
        egyenlítő kivétel (a célszám a csoport legjobbja alatt marad);
     4. a sima boost ára az egység 0,335-e (−33%);
     5. a kezdőrúgás az új karrierben elindítja a követést (rajt, várt
        növekedés, tűrés); a téli felmérés ilyenkor nem fut;
     6. a kezdőrúgás utáni boost fele (Δ ÷ 11 ÷ 2) azonnal az ellenfelekhez
        kerül — a motor és a kijelzés ugyanannyit lát; a nyári boost nem
        adósság; a Boost-kosár egy összegző sort ír;
     7. a követés 5 fordulónként: ami az utolsó 5 forduló átlagában a várt
        pálya fölött jár, azt 5 forduló alatt fokozatosan behozza; a
        kompenzációt nem emeli meg kétszer; kupában és osztályozóban nem hat;
     8. a záró rés a követés és az adósság NÉLKÜL mér; a beárazható
        növekedés teteje 20;
     9. futó (régi szerződésű) karrierben magától nem él; a nyári ablak
        gombjával bekapcsolható, és a következő kezdőrúgástól él;
    10. közös karrierben csak akkor, ha mindkét kézfogás-rekord kéri;
    11. a mérő naplózza a boostokat és a követést (a feltöltés ezt viszi);
    12. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9318;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  /* egyjátékos piramis-karrier, új szerződéssel */
  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[1];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){try{window._nlog.push(String(t));}catch(e){}return al.apply(this,arguments);};
    return {padlo:S.pyr&&S.pyr.padlo,kovetV:S.pyr&&S.pyr.kovetV,nf:nfOn()};});
  ok(r0.padlo===2&&r0.kovetV===1&&r0.nf,"az új karrier a követéses szerződéssel indul (kovetV)",r0);

  console.log("— 1–4. a boost-plafon —");
  const r1=await p.evaluate(()=>{
    const o={};
    const keep={ts:teamStrength,inf:infinityMode,opp:oppTargetRating,rnd:Math.random};
    infinityMode=true;oppTargetRating=350;window.teamStrength=teamStrength=()=>260;
    Math.random=()=>0.5;
    const mk=(n,age,r)=>{const e={n,pos:["KKP"],age,startRating:r,peak:r,pot:peakToPot(r)};e.basePeak=e.peak;e.basePot=e.pot;careerPool[n]=e;return e;};
    S.seasonNumber=3;
    o.capAlap=boostCapAlap();
    /* a 298-as öreg róka (a bejelentés esete) */
    const a=mk("Teszt Öreg",33,298);
    const ra=applyOldBoost(a);
    o.old={r:a.startRating,dr:ra.rBoost,peak:Math.round(a.peak*10)/10,pot:a.pot,potPeak:Math.round(potToPeakOvr(a.pot)*10)/10};
    /* ugyanazon az emberen a 2. boost ugyanabban az idényben */
    const r2=applyOldBoost(a);o.old2=r2.rBoost;o.cap2=Math.floor(o.capAlap*0.7);
    /* fénykor: a következő idényváltáskor sincs utólagos ugrás */
    const pr=mk("Teszt Fénykor",27,287),pr0=mk("Teszt Alap",27,287);
    const rp=applyPrimeBoost(pr);o.prime={dr:rp.rBoost,r:pr.startRating};
    careerAgeStepCore(pr,false);careerAgeStepCore(pr0,false);
    o.prime.tov=pr.startRating;o.prime.alapTov=pr0.startRating;
    /* sima boost egy 401-esen: a csúcs legfeljebb a plafonnyit */
    const pl=mk("Teszt Sima",26,401);const rs=applyPlainBoost(pl);
    o.plain={dr:rs.rBoost,peakLift:Math.round((pl.peak-401)*10)/10};
    careerAgeStepCore(pl,false);o.plain.tov=pl.startRating;
    /* ifi: a csúcs legfeljebb 2× plafon */
    const y=mk("Teszt Ifi",18,183);y.peak=200;y.pot=peakToPot(200);y.basePeak=200;y.basePot=y.pot;
    const ry=applyYouthBoost(y);o.youth={dr:ry.rBoost,peakLift:Math.round((y.peak-200)*10)/10};
    /* egyenlítő: a felhúzás is a plafonig */
    o.capEq=boostCapR(mk("Teszt Eq",28,200));
    /* a karrier eleje: 90-es kezdő 11, 90-es mezőny, nem Infinity */
    infinityMode=false;oppTargetRating=90;window.teamStrength=teamStrength=()=>90;
    o.capKicsi=boostCapAlap();
    Math.random=()=>1;
    const k=mk("Teszt Kezdő",18,70);k.peak=90;k.pot=peakToPot(90);k.basePeak=90;k.basePot=k.pot;
    const rk=applyYouthBoost(k);o.kezdo={dr:rk.rBoost,want:Math.round(YOUTH_BOOST_RATING[1]*youthBoostScaleFx("youth"))};
    /* ár */
    o.plainAr=boostPriceOf("plain");o.unit=boostUnitPrice();o.kind=BOOST_UNIT_KIND.plain;
    infinityMode=keep.inf;oppTargetRating=keep.opp;window.teamStrength=teamStrength=keep.ts;Math.random=keep.rnd;
    ["Teszt Öreg","Teszt Fénykor","Teszt Alap","Teszt Sima","Teszt Ifi","Teszt Eq","Teszt Kezdő"].forEach(n=>delete careerPool[n]);
    return o;});
  ok(r1.capAlap===16,"a plafon 260-as kezdő 11-nél 11 × min(1% × 260, 1,5) = 16",r1.capAlap);
  ok(r1.old.r===314&&r1.old.dr===16,"a 298-as öreg róka 350-es mezőnyben: 314 (+16) — a régi képlet ~+106-ot adott",r1.old);
  ok(r1.old.peak<=314.01&&r1.old.potPeak<=314.6,"a csúcs nem ugrik el, és a POT a csúcshoz igazodik",r1.old);
  ok(r1.old2===r1.cap2&&r1.cap2===11,"az idény 2. boostja ugyanazon a játékoson ×0,7-es plafonnal (+11)",{dr:r1.old2,cap:r1.cap2});
  ok(r1.prime.dr<=16&&r1.prime.tov<=r1.prime.r&&r1.prime.tov-r1.prime.alapTov<=16,"fénykor: legfeljebb +16, és az idényváltáskor sincs utólagos ugrás",r1.prime);
  ok(r1.plain.peakLift<=16.01&&r1.plain.tov-401<=16,"sima boost: a csúcs és a későbbi Rating legfeljebb a plafonnyit nő",r1.plain);
  ok(r1.youth.dr<=16&&r1.youth.peakLift<=32.01,"ifi boost: azonnal a plafonig, a csúcs legfeljebb a kétszereséig",r1.youth);
  ok(r1.capKicsi===12&&r1.kezdo.dr===r1.kezdo.want,"a karrier eleje változatlan: 90-es kezdő 11-nél a plafon 12, az ifi sáv nem vágódik",{cap:r1.capKicsi,k:r1.kezdo});
  ok(r1.kind===0.335&&Math.abs(r1.plainAr/r1.unit-0.335)<0.01,"a sima boost ára az egység 0,335-e (−33%)",{ar:r1.plainAr,egyseg:r1.unit});

  const rEq=await p.evaluate(()=>{
    const keep={ts:teamStrength,inf:infinityMode,opp:oppTargetRating};
    infinityMode=true;oppTargetRating=300;window.teamStrength=teamStrength=()=>260;
    const names=[];
    [["Eq A",300],["Eq B",300],["Eq C",200]].forEach(([n,r])=>{careerPool[n]={n,pos:["KKP"],age:28,startRating:r,peak:r,pot:peakToPot(r),basePeak:r,basePot:peakToPot(r)};names.push(n);});
    const eqE=window.eqEligible;window.eqEligible=eqEligible=()=>true;
    let res=null;try{res=applyEqualizeBoost(names,3);}catch(e){res={hiba:String(e)};}
    window.eqEligible=eqEligible=eqE;
    const c=careerPool["Eq C"].startRating;
    names.forEach(n=>delete careerPool[n]);
    infinityMode=keep.inf;oppTargetRating=keep.opp;window.teamStrength=teamStrength=keep.ts;
    return {c,res:res&&res.sorok};});
  ok(rEq.c>216&&rEq.c<=300&&rEq.res.every(x=>x.utana===rEq.res[0].utana),"egyenlítő: a plafon alóli kivétel — a célszám a csoport legjobbja alatt marad, mindenki a közös számon",rEq);

  console.log("— 5–8. a követés és az adósság —");
  const r5=await p.evaluate(()=>{
    const o={};
    S.seasonNumber=3;S.idx=0;
    const H=pyrFloorHist();delete H[3];
    /* a saját meccs-erőt a próba vezérli: a fordulóval nő */
    window._ms=null;const tms=teamMatchStrength;
    window.teamMatchStrength=teamMatchStrength=function(){return window._ms!=null?window._ms:tms();};
    let kick=null;try{kick=pyrFloorKickoff();}catch(e){o.hiba=String(e);}
    const r=H[3];o.kov=r&&r.kov?{rajt:r.kov.rajt,dgB:r.kov.dgB,tur:r.kov.tur}:null;
    /* a téli felmérés ilyenkor nem fut */
    o.tel=pyrFloorMid();
    o.ms0=Math.round(teamMatchStrength()*10)/10;
    window._ms=o.ms0;
    o.gap0=Math.round(levelGap()*100)/100;
    /* boost a kezdőrúgás után → adósság */
    const keep={ts:teamStrength};window.teamStrength=teamStrength=()=>200;
    const n=slots[0].player.n,e=careerPool[n];
    const b0=matchHiddenOppBuff(),m0=oppMatchStrength();
    window._nlog=[];
    const res=applyPlainDelta(e,{r:11,t:0});
    o.ad=r.kov.ad;o.dr=res.rBoost;
    /* a személyes csatorna nélkül ugyanaz a két szám (a boost a rejtett tagokat is mozdíthatja) */
    const so=nfSajatOff;const b1=matchHiddenOppBuff(),m1=oppMatchStrength();
    window.nfSajatOff=nfSajatOff=()=>0;const b2=matchHiddenOppBuff(),m2=oppMatchStrength();window.nfSajatOff=nfSajatOff=so;
    o.buffKul=Math.round((b1-b2)*100)/100;o.msKul=Math.round((m1-m2)*100)/100;
    o.naplo=window._nlog.some(t=>/Boost-adósság/.test(t));
    window.teamStrength=teamStrength=keep.ts;
    /* fordulók: a meccs-erő a várt pályánál gyorsabban nő (+1/forduló) */
    const K=r.kov;o.lepesek=[];
    for(let i=1;i<=30;i++){
      S.idx=i;window._ms=o.ms0+i*1.0;
      const x=nfKovForduloUtan();
      if(x&&x.kell)o.lepesek.push([i,x.kell]);
      if(i===5){o.off5=nfKovOff();S.idx=5;}
      if(i===10){o.off10=nfKovOff();}}
    o.emel=K.emel.slice();
    /* a rámpa: az emelés utáni első meccsen 1/5, 5 meccs után teljes (csak az első emelés él még) */
    const E0=K.emel[0]||{f:5,amt:0},emK=K.emel;K.emel=[E0];
    S.idx=E0.f;const off5a=nfKovOff();S.idx=E0.f+4;const off9=nfKovOff();K.emel=emK;
    o.ramp={off5a,off9,amt5:E0.amt,ad:K.ad};
    /* a 30. forduló végén: a kompenzált rés a várt pálya közelében (sem alatta, sem messze fölötte) */
    S.idx=30;const nyers30=K.g[30],palya30=nfKovPalya(K,30);
    o.vegTobblet={nyers:Math.round((nyers30-palya30)*10)/10,komp:Math.round((nyers30-nfKovOffNyers(r)-palya30)*10)/10};
    /* kupában és osztályozóban 0 */
    S.idx=12;const e0=S.euro;S.euro={stage:"group",comp:"EL",target:90};o.kupa=nfKovOff();S.euro=e0;
    const po0=S.pyrPo;S.pyrPo={stage:"play"};o.po=nfKovOff();S.pyrPo=po0;
    /* az idény vége: a záró rés a kompenzáció NÉLKÜL */
    S.idx=30;
    const offVeg=nfKovOff();
    let gVeg=null;{const _r=msRatedBegin();try{gVeg=levelGap();}finally{msRatedEnd();}}
    const rec=nfIdenyVege();
    o.veg=rec&&rec.veg;o.vart=Math.round((gVeg+offVeg)*10)/10;o.dg=rec&&rec.dg;
    o.dgMax=(function(){const H2=pyrFloorHist();H2[1]={dg:50};H2[2]={dg:45};const v=nfMertValtozas();delete H2[1];delete H2[2];return v;})();
    window.teamMatchStrength=teamMatchStrength=tms;window._ms=null;
    return o;});
  ok(r5.kov&&typeof r5.kov.rajt==="number"&&typeof r5.kov.dgB==="number"&&r5.kov.tur===0.5,"a kezdőrúgás elindítja a követést (rajt-rés, várt növekedés, tűrés)",r5.kov);
  ok(r5.tel===null,"a téli felmérés ilyenkor nem fut (a követés váltja)",r5.tel);
  ok(Math.abs(r5.ad-0.5*r5.dr/11)<0.01&&r5.naplo,"a kezdőrúgás utáni boost fele (Δ ÷ 11 ÷ 2) adósság, és a napló kimondja",{ad:r5.ad,dr:r5.dr});
  ok(r5.buffKul===Math.round(r5.ad*100)/100&&r5.msKul===Math.round(r5.ad*100)/100,"a saját bajnokin az ellenfél pontosan ennyivel erősebb (motor és kijelzés)",{buff:r5.buffKul,ms:r5.msKul});
  ok(r5.lepesek.length>=3&&r5.lepesek.every(x=>x[0]%5===0),"a követés 5 fordulónként lép, ha a rés a várt pálya fölött jár",r5.lepesek);
  ok(Math.abs(r5.ramp.off5a-(r5.ramp.ad+r5.ramp.amt5/5))<0.02&&Math.abs(r5.ramp.off9-(r5.ramp.ad+r5.ramp.amt5))<0.02,"az emelés 5 forduló alatt fokozatosan ér be (1/5 … teljes)",r5.ramp);
  ok(r5.vegTobblet.komp<r5.vegTobblet.nyers/2&&r5.vegTobblet.komp>-1,"a 30. fordulóra a kompenzált rés a várt pálya közelében — a többletet egyszer hozza be, nem kétszer",{t:r5.vegTobblet,emel:r5.emel});
  ok(r5.kupa===0&&r5.po===0,"kupában és osztályozóban nem hat",{kupa:r5.kupa,po:r5.po});
  ok(r5.veg===r5.vart&&typeof r5.dg==="number","a záró rés a követés és az adósság nélkül mér (ebből tanul a következő idény)",{veg:r5.veg,vart:r5.vart,dg:r5.dg});
  ok(r5.dgMax===20,"a követéses szerződésben a beárazható idényen belüli növekedés teteje 20",r5.dgMax);

  const r6=await p.evaluate(()=>{
    const o={};
    /* nyári boost (az idény lezárt) → nincs adósság */
    const r=pyrFloorHist()[3];const ad0=r.kov.ad;
    const n=slots[1].player.n,e=careerPool[n];applyPlainDelta(e,{r:5,t:0});
    o.nyar=r.kov.ad===ad0;
    /* Boost-kosár: egy összegző sor */
    S.seasonNumber=4;S.idx=0;const H=pyrFloorHist();delete H[4];
    try{pyrFloorKickoff();}catch(x){o.hiba=String(x);}
    S.transferBudget=1e12;
    window._nlog=[];
    _kosar={kind:"plain",db:3,sorok:[{n:slots[2].player.n,db:3}]};
    boostKosarVegrehajt();
    o.kosarSorok=window._nlog.filter(t=>/Boost-adósság/.test(t)).length;
    o.kosarAd=H[4].kov.ad;
    return o;});
  ok(r6.nyar,"a lezárt idény utáni (nyári) boost nem adósság",r6);
  ok(r6.kosarSorok===1&&r6.kosarAd>0,"a Boost-kosár egyetlen összegző adósság-sort ír",r6);

  console.log("— 9–10. futó karrier, közös karrier —");
  const r9=await p.evaluate(async()=>{
    const o={};
    const P=S.pyr;delete P.kovetV;delete P.kovetKer;
    S.seasonNumber=5;S.idx=0;const H=pyrFloorHist();delete H[5];
    pyrFloorKickoff();o.regi=!H[5].kov;
    /* a téli felmérés a régi szerződésben fut */
    o.telFut=pyrFloorMid()!==null;
    /* a nyári ablak gombja */
    S.seasonClosed=true;S.idx=30;
    nfOffer(()=>{},false);
    await new Promise(r=>setTimeout(r,200));
    const btn=document.querySelector("#nfKovBtn");o.gomb=!!btn;
    if(btn)btn.click();
    o.ker=!!P.kovetKer;
    const btn2=document.querySelector("#nfKovBtn");o.gombSzoveg=btn2&&btn2.textContent;
    $("scUnlock").classList.add("hide");
    S.seasonNumber=6;S.idx=0;delete H[6];
    window._nlog=[];
    pyrFloorKickoff();o.bekapcs=!!(H[6].kov&&P.kovetV===1&&!P.kovetKer);
    o.naplo=window._nlog.some(t=>/Bekapcsolva: folyamatos rés-követés/.test(t));
    /* közös karrier: a kézfogás */
    const A={mstr:110,str:108,vall:0.4,mz:109,mzV:1,osztV:1,kov:1,season:7},B=Object.assign({},A,{kov:1}),C=Object.assign({},A,{kov:0});
    const p1=pyrSuperPairStash(A,B);o.par1=!!(p1&&p1.kov);
    const p2=pyrSuperPairStash(A,C);o.par2=!!(p2&&p2.kov);
    /* mp, a társ nem kéri: ebben az idényben nem él, és a napló kimondja */
    window._nlog=[];
    const rec={dgBecsles:5};nfKovIndit(rec,7,true,{kov:false});
    o.mpNem=!rec.kov&&window._nlog.some(t=>/nem él/.test(t));
    const rec2={dgBecsles:5};nfKovIndit(rec2,7,true,{kov:true});o.mpIgen=!!rec2.kov;
    return o;});
  ok(r9.regi&&r9.telFut,"futó (régi szerződésű) karrierben magától nem él, a téli felmérés marad",r9);
  ok(r9.gomb&&r9.ker&&/Bekapcsolva/.test(r9.gombSzoveg||""),"a nyári célrés-ablakban bekapcsolható",{gomb:r9.gomb,ker:r9.ker,sz:r9.gombSzoveg});
  ok(r9.bekapcs&&r9.naplo,"a következő kezdőrúgástól él (végleges), és a napló kimondja",{b:r9.bekapcs,n:r9.naplo});
  ok(r9.par1&&!r9.par2,"közös karrierben a kézfogás csak akkor indítja, ha mindkét rekord kéri",{p1:r9.par1,p2:r9.par2});
  ok(r9.mpNem&&r9.mpIgen,"ha a társ nem kéri, abban az idényben nem él (napló), ha igen, elindul",{nem:r9.mpNem,igen:r9.mpIgen});

  console.log("— 11. a mérő —");
  const r11=await p.evaluate(()=>{
    const z=meresSzezon();const all=(meresLoad()||{}).sz||[];
    const boosts=[].concat(...all.map(x=>x.boost||[]));
    const kov=[].concat(...all.map(x=>x.kovet||[]));
    S.seasonNumber=3;const z3=meresSzezon();z3.veg=null;meresSzezonZar();
    return {db:boosts.length,minta:boosts.find(x=>x.k==="old")||boosts[0],kov:kov.length,padlo:z3.padlo&&z3.padlo.kovet?{rajt:z3.padlo.kovet.rajt,emel:z3.padlo.kovet.emel.length,ad:z3.padlo.kovet.ad}:null,
      beall:(meresBeall().piramis||{}).kovet};});
  ok(r11.db>=5&&r11.minta&&typeof r11.minta.cap==="number"&&"levR" in r11.minta&&"dXi" in r11.minta,"a mérő minden boostot naplóz (fajta, előtte/utána, plafon, levágott rész, kezdő 11-re eső hatás)",r11.minta);
  ok(r11.kov>=3&&r11.padlo&&r11.padlo.emel>=3,"a mérő a követés lépéseit és az idény összegzését is viszi",{kov:r11.kov,padlo:r11.padlo});
  ok(r11.beall===1,"a beállításokban a követéses szerződés jelölve",r11.beall);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
