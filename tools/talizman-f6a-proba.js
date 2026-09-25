/* 🧿 TALIZMÁNOK F6a — A SPECIALOK: SCOUT, STÍLUS, TAKTIKA (3.9.150).

   KIMONDOTT KÉRÉS: „Folytasd a munkát." (az F6 a terv 18. pontja szerint:
   a special-katalógus kötegekben, kategóriánként; tételenként egy pro- és
   egy kontra-állítás).

   Amit mér:
     0. TALIZMÁN NÉLKÜL minden olvasó a semleges értéket adja, és a valódi
        függvények (ár, keret, osztó, plafon) bitre a régit;
     1. a 24 special mindegyikére egy PRO és egy KONTRA állítás — ahol lehet,
        a VALÓDI hívási helyen (felderítés, vételár, akadémia, szezonközi
        ablak, begyakorlás, stíluspont, mérföldkő, csúszka, licit, morál);
     2. a számok a kártya szövegéből jönnek: a ritkaság skálája és a plafon
        (Ködoszlató legendáson mind a négy csoport, Kaméleon 3+ ritkaságon +2);
     3. a kártya „✦ a special él" jelet kap, a menüben a special sora áll, a
        Titkos fegyver gombja élesít, és az élesített meccs a pillanatképbe
        sül (külön mezőben — a ±8%-os sáv érintetlen);
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9179;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=(e==null?1e-9:e)+1e-12;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talSpecV==="function",null,{timeout:15000});

  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.W=0;S.D=0;S.L=0;S.tal=null;
    S.transferBudget=5e9;S.morale=60;
    if(!scout)scout=generateScout();   /* a felderítés a scout csillagaiból számol */
    if(!S.tactics)S.tactics={active:null,levels:{}};
    if(!S.tactics.active||!TACTICS[S.tactics.active]){S.tactics.active="kontra";S.tactics.levels.kontra=80;}
    addLine=()=>{};saveGame=()=>{};
    /* a heti lelátó a pénzes kontrákhoz: fix szám, hogy a mérés pontos legyen */
    fanWeeklyIncome=()=>1000000;
    /* Egy talizmán a megadott speciállal. A változat szándékosan NEM létező:
       így az alaphatása nem keveredik a mérésbe, csak a special hat. */
    window._lap=(id,rang)=>{
      S.tal=null;const T=talState();
      const sp=TAL_SPEC_BY[id];
      T.lapok=[{kat:sp.k,rang:rang||sp.min,dobas:0.5,spec:id,valt:"_nincs",uid:1}];
      T.seq=1;_talAlapMemo=null;_talSpecMemo=null;return T.lapok[0];};
    window._nincs=()=>{S.tal=null;_talAlapMemo=null;_talSpecMemo=null;};});

  /* ---- 0. SEMLEGES ---- */
  const n0=await p.evaluate(()=>{
    _nincs();
    const e=careerPool[slots[0].player.n];
    return {
      ar:talSpecArMult({_talKulf:true}),kor:talKorDev(33),szemle:talNyariSzemle(),stab:talStabPiacMinusz(),
      ablak:talAblakFeld(15),nyarF:talNyarFeldMinusz(),nyarE:talNyarEsMinusz(),
      sp:talSpSzorzo(false),div2:talStyle2OvrDiv()===STYLE2_OVR_DIV,ms2:talStyle2MsDiv()===STYLE2_MS_DIV,
      dial:talDialMax()===DIAL_ACTIVE_MAX,dialCon:talDialConMult(),szerep:talSzerepMult(),csillag:talCsillagArMult(),
      licit:talLicitCsucsMinusz(),mscat:talMsCatArMult(),mcel:talMoralCelMinusz(),dev:talSpecDevMult(),
      masod:talMasodEdzMult(),kam:talKameleonIngyen(),sarga:talSargaMult(),plafon:talTaktikaPlafon(),
      stabH:talSpecStabMult(),titkos:talTitkosOwn(),fit:talFitSpecPP(),
      csat:["setpiece","counter","own","assistw"].every(ch=>talMeccsCsat(ch,{min:80,pos:"KKP"})===talMeccsCsatAlap(ch,{min:80,pos:"KKP"})),
      disc:buyDiscountParts({n:"x",_talKem:true,pos:["KV"]}).filter(x=>x.k==="talKem").length,
      akad:academyTargetFor(2,90,3000).target,
      snap:!("talTitkos" in buildMatchSnapshot())};});
  console.log("\n— 0. TALIZMÁN NÉLKÜL: SEMLEGES —");
  const semleges=n0.ar===1&&n0.kor===1&&n0.szemle===0&&n0.stab===0&&n0.ablak===0&&n0.nyarF===0&&n0.nyarE===0
    &&n0.sp===1&&n0.div2&&n0.ms2&&n0.dial&&n0.dialCon===1&&n0.szerep===1&&n0.csillag===1&&n0.licit===0
    &&n0.mscat===1&&n0.mcel===0&&n0.dev===1&&n0.masod===1&&n0.kam===0&&n0.sarga===1&&n0.plafon===0
    &&n0.stabH===1&&n0.titkos===0&&n0.fit===0&&n0.csat&&n0.disc===0&&n0.snap;
  ok(semleges,"minden olvasó a semleges értéket adja, a pillanatképben nincs új mező",n0);

  /* ---- 1. 🔭 SCOUT ---- */
  const sc=await p.evaluate(()=>{
    const ki={};
    /* a valódi felderítés (poszt-mód), a teljes lánccal */
    const felderit=(kat)=>{
      TW={category:kat,searchMode:"pos",attemptsLeft:null};
      twScout();return TW.candidates.slice();};
    const kat=BENCH_CATS.find(c=>c.key==="VEDO")?"VEDO":BENCH_CATS[1].key;
    /* KÖDOSZLATÓ — legendáson minden jelölt valódi POT-ja, keret nélkül */
    _lap("kodoszlato",4);
    const c4=felderit(kat);
    ki.kod4=c4.length>0&&c4.every(c=>c._talKod&&c.estimatedPOT===Math.round(careerPool[c.n].pot));
    const L1=_lap("kodoszlato",4);L1.rang=4;
    ki.kodSzoveg=talSpecOldal(TAL_SPEC_BY.kodoszlato,"pro",4,L1);
    L1.rang=2;_talSpecMemo=null;
    ki.kodEgy=TAL_KOD_CSOP.filter(c=>talKodLat(c)).length;
    ki.kodSzoveg2=talSpecOldal(TAL_SPEC_BY.kodoszlato,"pro",2,L1);
    ki.kodCsop=TAL_KOD_NEV[talKodCsop(L1)];
    /* …kontra: +3% minden vételáron */
    const e=Object.values(careerPool).sort((a,b)=>b.startRating-a.startRating)[0];
    _nincs();const ar0=buyPrice(e);_lap("kodoszlato",2);const ar1=buyPrice(e);
    ki.kodAr=ar1/ar0;ki.kodArVart=1+talSpecSzam(TAL_SPEC_BY.kodoszlato,"con",2)/100;
    /* VISSZATÉRŐ FIÚK */
    _nincs();const t0=academyTargetFor(2,90,3000).target;
    _lap("visszatero",2);ki.vissza=academyTargetFor(2,90,3000).target-t0;
    const kept=Object.values(careerPool).slice(-3).map(x=>x.n);
    S.academy=kept.map(n=>({n,leftAge:17,leftRating:60,leftSeason:2,offerSeason:2,times:1}));
    let b0=S.transferBudget;talSpecSzezonvaltas();
    ki.visszaKi=b0-S.transferBudget;ki.visszaVart=3*talSpHetiPct(talSpecV("visszatero","con"));
    S.academy=[];
    /* TEHETSÉGVÁSÁR */
    S.twWindow=null;_nincs();const sp0=csSpinsMax();
    _lap("tehetsegvasar",1);const sp1=csSpinsMax();
    _lap("tehetsegvasar",3);const sp3=csSpinsMax();
    ki.szemle=[sp1-sp0,sp3-sp0];
    const _tc=twClosedNow,_pre=preSeasonHubMode;twClosedNow=()=>false;preSeasonHubMode=false;
    try{S.staffMarket=null;_nincs();const s0=staffMarketList().length;
      S.staffMarket=null;_lap("tehetsegvasar",1);const s1=staffMarketList().length;ki.stab=[s0,s1];}
    finally{twClosedNow=_tc;preSeasonHubMode=_pre;S.staffMarket=null;}
    /* FALURÓL A NAGYVÁROSBA — a valódi akadémiai generátor, rögzített kockával */
    const _r=Math.random;
    const gen=()=>{Math.random=()=>0.3;try{return careerPool[generateAcademyPlayer("KV").n];}finally{Math.random=_r;}};
    _nincs();const g0=gen();_lap("falurol",3);const g1=gen();
    ki.falu={p0:g0.pot,p1:g1.pot,vart:Math.round(g0.pot*(1+talSpecV("falurol","pro")/100)),csucs:g1.peak>=g0.peak};
    /* …kontra: a 24 felettiek pozitív fejlődése −4% (a valódi pad-fejlődésen) */
    const benchDev=(age)=>{
      const pl={n:"Próba Pad",pos:["KV"],ovr:70,age};
      careerPool[pl.n]={n:pl.n,pos:["KV"],age,startRating:70,peak:80,pot:3000,formPoints:0};
      initPlayerAttrs(careerPool[pl.n]);
      const _B=Object.assign({},BENCH),_x=extraRoster.slice();
      Object.keys(BENCH).forEach(k=>{BENCH[k]=null;});BENCH.VEDO=pl;extraRoster.length=0;
      try{processBenchDevelopment();}finally{Object.keys(BENCH).forEach(k=>{BENCH[k]=_B[k]||null;});_x.forEach(x=>extraRoster.push(x));}
      const v=careerPool[pl.n].formPoints;delete careerPool[pl.n];return v;};
    _nincs();const d0=benchDev(30),y0=benchDev(20);
    _lap("falurol",3);const d1=benchDev(30),y1=benchDev(20);
    ki.faluDev={arany:d1/d0,vart:1-talSpecV("falurol","con")/100,fiatal:y1===y0};
    /* MEGFIGYELŐ A LELÁTÓN — a valódi szezonközi ablak */
    const ablak=(round)=>{const _e=twEnterHubWindow;twEnterHubWindow=()=>{};
      try{twOpenCheckpointWindow(round,()=>{});return S.twWindow.max;}finally{twEnterHubWindow=_e;S.twWindow=null;}};
    _nincs();const w0=ablak(8),w15=ablak(15);
    _lap("megfigyelo",1);ki.megf=ablak(8)-w0;
    _nincs();const e0=twSummerEventMax();_lap("megfigyelo",1);ki.megfEs=e0-twSummerEventMax();
    /* KÜLFÖLDI IRODA — a valódi felderítés első jelöltje feljebbről jön */
    _lap("kulfoldi",4);
    const kc=felderit(kat);
    ki.kulfJel=kc.length?kc.map(c=>!!c._talKulf):[];
    let s1=0,s2=0;for(let i=0;i<300;i++){s1+=talKulfoldiCel();s2+=rollSigningTarget();}
    ki.kulfCel={fel:s1/300,alap:s2/300,lepcso:talKulfoldiLepcso()};
    const ek=Object.assign({},e,{_talKulf:true});
    _nincs();const k0=buyPrice(ek);_lap("kulfoldi",4);
    ki.kulfAr={arany:buyPrice(ek)/k0,vart:1+talSpecV("kulfoldi","con")/100,masik:buyPrice(e)/buyPrice(ek)};
    /* ÁLOMGYÁR — az idény első új felfedezettje csodagyerek, a második nem */
    _nincs();const a0=gen();
    _lap("alomgyar",3);const a1=gen(),a2=gen();
    ki.alom={elso:a1.pot,masodik:a2.pot,alap:a0.pot,szezon:talSpAll().alomgyar};
    /* …kontra: a valódi akadémiai képernyő „marad még” gombja */
    const pr=careerPlayerFromPoolEntry(a2);
    let vissza=0;b0=S.transferBudget;
    showAcademyReveal(pr,()=>{vissza++;},null,false,null);
    const gombok=$("unlockActions").querySelectorAll("button");
    gombok[1].click();
    ki.alomKi={ki:b0-S.transferBudget,vart:talSpHetiPct(talSpecV("alomgyar","con")),vissza};
    /* KÉMHÁLÓZAT — a valódi felderítés első jelöltje a kedvezmény-stackben */
    _lap("kemhalozat",2);
    const mc=felderit(kat);
    ki.kem={jel:mc.map(c=>!!c._talKem),
      sor:(buyDiscountParts(mc[0]).find(x=>x.k==="talKem")||{}).pct,vart:talSpecV("kemhalozat","pro")/100};
    const ekm=Object.assign({},e,{_talKem:true});
    ki.kemAr=buyPrice(ekm)/buyPrice(e);
    /* …kontra: 10% eséllyel lebukik */
    S.morale=60;Math.random=()=>0.05;try{talKemLebukas("próba");}finally{Math.random=_r;}
    const m1=S.morale;Math.random=()=>0.5;try{talKemLebukas("próba");}finally{Math.random=_r;}
    ki.kemLe={egy:60-m1,ketto:m1-S.morale,vart:talSpecV("kemhalozat","con")};
    S.morale=60;
    return ki;});
  console.log("\n— 1. 🔭 SCOUT —");
  ok(sc.kod4&&/minden scout-jelölt/.test(sc.kodSzoveg),"Ködoszlató (legendás): a valódi felderítés minden jelöltjének a VALÓDI POT-ja látszik",sc.kodSzoveg);
  ok(sc.kodEgy===1&&sc.kodSzoveg2.indexOf(sc.kodCsop)>=0,"…alatta pontosan EGY posztcsoport, és a kártya meg is nevezi",sc.kodSzoveg2);
  ok(kozel(sc.kodAr,sc.kodArVart,0.002),"…kontra: a vételár +3%",{arany:sc.kodAr,vart:sc.kodArVart});
  ok(sc.vissza===1,"Visszatérő fiúk: az akadémiai visszatérés célja +1 Rating",sc.vissza);
  ok(sc.visszaKi===sc.visszaVart&&sc.visszaKi>0,"…kontra: szezonváltáskor fejenként a heti lelátó 20%-a (3 fiatal)",{ki:sc.visszaKi,vart:sc.visszaVart});
  ok(sc.szemle[0]===1&&sc.szemle[1]===2,"Tehetségvásár: a nyári klub-szemle +1 (3+ ritkaságon +2)",sc.szemle);
  ok(sc.stab[0]-sc.stab[1]===1,"…kontra: a stábpiacon eggyel kevesebb ajánlat",sc.stab);
  ok(sc.falu.p1===sc.falu.vart&&sc.falu.p1>sc.falu.p0&&sc.falu.csucs,"Faluról a nagyvárosba: a valódi akadémiai generátor POT-ja +6% (a csúcs is vele nő)",sc.falu);
  ok(kozel(sc.faluDev.arany,sc.faluDev.vart,1e-9)&&sc.faluDev.fiatal,"…kontra: a 24 év felettiek fejlődése −4% (a valódi pad-fejlődésen); a fiatalokét nem érinti",sc.faluDev);
  ok(sc.megf===1,"Megfigyelő a lelátón: a valódi szezonközi ablakban +1 felderítés",sc.megf);
  ok(sc.megfEs===1,"…kontra: a nyári átigazolási esemény-keret −1",sc.megfEs);
  ok(sc.kulfJel.length>=2&&sc.kulfJel[0]===true&&sc.kulfJel.slice(1).every(x=>!x)&&sc.kulfCel.fel>sc.kulfCel.alap+0.7*sc.kulfCel.lepcso,
     "Külföldi iroda: a valódi felderítés ELSŐ jelöltje egy osztállyal feljebbről jön",{jel:sc.kulfJel,cel:sc.kulfCel});
  ok(kozel(sc.kulfAr.arany,sc.kulfAr.vart,0.002),"…kontra: az ő ára +10%, a többieké nem",sc.kulfAr);
  ok(sc.alom.elso>=5000&&sc.alom.masodik===sc.alom.alap&&sc.alom.szezon===3,"Álomgyár: az idény első felfedezettje csodagyerek (5000+ POT), a második a szokásos",sc.alom);
  ok(sc.alomKi.ki===sc.alomKi.vart&&sc.alomKi.ki>0&&sc.alomKi.vissza===1,"…kontra: a valódi képernyő „marad még” gombja a heti lelátó 30%-ába kerül",sc.alomKi);
  ok(sc.kem.jel[0]===true&&sc.kem.jel.slice(1).every(x=>!x)&&kozel(sc.kem.sor,sc.kem.vart)&&kozel(sc.kemAr,1-sc.kem.vart,0.002),
     "Kémhálózat: a valódi felderítés első jelöltje a kedvezmény-stackben, −10%",sc.kem);
  ok(sc.kemLe.egy===sc.kemLe.vart&&sc.kemLe.ketto===0,"…kontra: lebukáskor −5 morál, különben semmi",sc.kemLe);

  /* ---- 2. 🎭 STÍLUS ---- */
  const st=await p.evaluate(()=>{
    const ki={};
    /* EGY ÚR, EGY ÚT */
    _nincs();const r0=msSpReward(1000);
    _lap("egyur",1);ki.egyur={elso:msSpReward(1000)/r0,masod:msSpReward(1000,true)/r0,tures:1/r0};
    const tk=S.tactics.active;
    _nincs();const f0=tacticFit(tk);
    _lap("egyur",1);talTaktikaValtas();const f1=tacticFit(tk);
    for(let i=0;i<5;i++)talSpecMeccsUtan();
    ki.egyurFit={lyuk:Math.round((f0-f1)*10000)/100,utana:tacticFit(tk)===f0,f0};
    /* KÉT HAZÁT SZOLGÁL */
    _lap("kethaza",2);const d2=talStyle2OvrDiv();_lap("kethaza",4);const d4=talStyle2OvrDiv();
    ki.kethaza=[d2,d4];
    _nincs();const dt0=devTempo();_lap("kethaza",2);ki.kethazaDev=devTempo()/dt0;
    /* HANGSÚLY-VIRTUÓZ — a valódi csúszka-kapu és a kár-oldal */
    _lap("virtuoz",3);ki.virt=talDialMax();
    const ef={m:"con",d:-1};
    _nincs();const c0=dialPct(ef,6,10);_lap("virtuoz",3);ki.virtCon=dialPct(ef,6,10)/c0;
    ki.virtPro=dialPct({m:"pro",d:1},6,10)===(()=>{_nincs();return dialPct({m:"pro",d:1},6,10);})();
    /* BERAGADT KINCS */
    const M=msState();
    const def=MILESTONES.find(d=>d.cat&&d.kind==="sp");
    M.pend={};M.pend[def.id]=true;M.done=M.done||{};delete M.done[def.id];
    _lap("beragadt",2);
    const sp0=M.sp||0;const r1=talBeragadtProbal();const sp1=M.sp;const r2=talBeragadtProbal();
    ki.berag={kap:sp1-sp0,vart:Math.max(1,Math.round(msSpReward(def.val)*talSpecV("beragadt","pro")/100)),egyszer:r1!=null&&r2===null,marad:!!M.pend[def.id]};
    delete M.pend[def.id];
    const cat=MS_STYLE_CATS[0].key;
    _nincs();const cp0=msCatPrice(cat);_lap("beragadt",2);ki.beragAr=msCatPrice(cat)/cp0;
    /* SZEREPJÁTÉK — a valódi szerep-tábla és a valódi kiosztás */
    const _st=S.style;S.style={key:"bombazok"};
    try{
      _nincs();const v0=roleVal("nyito");_lap("szerepjatek",1);const v1=roleVal("nyito");
      ki.szerep={v0,v1,vart:Math.round((1+(v0-1)*(1+talSpecV("szerepjatek","pro")/100))*1000)/1000};
      const n1=slots[1].player.n,n2=slots[2].player.n;
      roleAssign("nyito",n1);const mm0=moodMarkOf(n1);
      roleAssign("nyito",n2);
      ki.szerepKi={le:Math.round((mm0-moodMarkOf(n1))*1000)/1000,vart:Math.round(talSpecV("szerepjatek","con")*MOOD_MARK_PER*1000)/1000};
      delete S.roles;
    }finally{S.style=_st;}
    /* A MESTER JEGYZETEI */
    const sk=(typeof SKILLS!=="undefined"&&SKILLS[0])||null;
    if(sk){_nincs();const s0=starUnlockPrice(sk);_lap("mester",4);ki.mester={arany:starUnlockPrice(sk)/s0,vart:1-talSpecV("mester","pro")/100,tures:1/s0};}
    /* …kontra: a licit-kúp csúcsa (a valódi saleRollOffer-ből kiolvasva) */
    const _tri=triangularRoll,_ask=saleAskPrice;let mode=null;
    triangularRoll=(lo,hi,m)=>{mode=m;return _tri(lo,hi,m);};
    saleAskPrice=()=>1000000;   /* a próba-keret játékosainak nincs piaci ára */
    try{const rec={n:slots[3].player.n,rejects:0};
      _nincs();saleRollOffer(rec);const m0=mode;_lap("mester",4);saleRollOffer(rec);
      ki.licit={le:Math.round((m0-mode)*10000)/10000,vart:talSpecV("mester","con")/100};}
    finally{triangularRoll=_tri;saleAskPrice=_ask;}
    /* FILOZÓFIAI VITA */
    const _s2=S.style2;S.style2={key:"beton"};
    try{_nincs();const q0=styleMsRewardFor(S.style2,90);
      _lap("filozofiaivita",2);const q2=styleMsRewardFor(S.style2,90);
      _lap("filozofiaivita",4);const q4=styleMsRewardFor(S.style2,90);
      ki.filo={q0,q2,q4,vart:[Math.max(1,Math.round(msSpReward(90,true)/3)),Math.round(msSpReward(90,true)/2),msSpReward(90,true)]};}
    finally{S.style2=_s2;}
    _nincs();const mt0=computeMoraleTarget();_lap("filozofiaivita",2);ki.filoMoral=mt0-computeMoraleTarget();
    /* MÉRFÖLDKŐ-LÁZ — öt friss teljesítésből az ötödik dupla */
    _lap("merfoldkolaz",3);
    const sd=MILESTONES.find(d=>d.kind==="sp");
    const _r=Math.random;Math.random=()=>0.99;
    const nyer=[];
    try{for(let i=0;i<5;i++){const a=M.sp||0;msPayout(sd);nyer.push((M.sp||0)-a);}}finally{Math.random=_r;}
    ki.mfl={nyer,egy:msSpReward(sd.val)};
    /* …kontra: ha egy gól hiányzik egy mérföldkőhöz, a gólpassz-súly −10% */
    S.playing=true;_talKtx={derby:false,esely:false,mfKozel:true};
    ki.mflCon=talMeccsCsat("assistw",{pos:"KKP"})/talMeccsCsatAlap("assistw",{pos:"KKP"});
    _talKtx.mfKozel=false;ki.mflConNem=talMeccsCsat("assistw",{pos:"KKP"})===talMeccsCsatAlap("assistw",{pos:"KKP"});
    S.playing=false;_talKtx=null;
    return ki;});
  console.log("\n— 2. 🎭 STÍLUS —");
  ok(kozel(st.egyur.elso,1.08,st.egyur.tures)&&st.egyur.masod===1,"Egy úr, egy út: az elsődleges stílus +8% stíluspont, a másodlagos saját mérföldköve nem",st.egyur);
  ok(st.egyurFit.lyuk===2&&st.egyurFit.utana,"…kontra: taktikaváltás után −2 pp illeszkedés, 5 meccs múlva vége",st.egyurFit);
  ok(st.kethaza[0]===1.6&&st.kethaza[1]===1.3,"Két hazát szolgál: a másodlagos meccserő-osztó 2 → 1,6 (legendáson 1,3)",st.kethaza);
  ok(kozel(st.kethazaDev,0.97),"…kontra: fejlődési tempó −3%",st.kethazaDev);
  ok(st.virt===4,"Hangsúly-virtuóz: 4 csúszka mozdítható a 3 helyett",st.virt);
  ok(kozel(st.virtCon,1.1)&&st.virtPro,"…kontra: a kár-oldal +10%, a haszon-oldal érintetlen",st.virtCon);
  ok(st.berag.kap===st.berag.vart&&st.berag.egyszer&&st.berag.marad,"Beragadt kincs: a beragadt jutalom 25%-a azonnal, talizmánonként egyszer — a jutalom beragadva marad",st.berag);
  ok(kozel(st.beragAr,1.15,0.001),"…kontra: a mérföldkő-kategória nyitási ára +15%",st.beragAr);
  ok(st.szerep.v1===st.szerep.vart&&st.szerep.v1!==st.szerep.v0,"Szerepjáték: a valódi roleVal hatása +6%",st.szerep);
  ok(st.szerepKi.le===st.szerepKi.vart&&st.szerepKi.le>0,"…kontra: akit a valódi kiosztás lecserél, −4 morál-jelet kap",st.szerepKi);
  ok(st.mester&&kozel(st.mester.arany,st.mester.vart,st.mester.tures),"A mester jegyzetei: a csillagozás-jog ára −20%",st.mester);
  ok(kozel(st.licit.le,st.licit.vart,1e-9)&&st.licit.le>0,"…kontra: a valódi licit-kúp csúcsa −3 pp",st.licit);
  ok(st.filo.q0===st.filo.vart[0]&&st.filo.q2===st.filo.vart[1]&&st.filo.q4===st.filo.vart[2],"Filozófiai vita: a másodlagos mérföldkő harmad → fél (legendáson teljes) pont",st.filo);
  ok(st.filoMoral===1,"…kontra: a morál célértéke −1",st.filoMoral);
  ok(st.mfl.nyer.slice(0,4).every(x=>x===st.mfl.egy)&&st.mfl.nyer[4]===2*st.mfl.egy,"Mérföldkő-láz: az 5. friss teljesítés dupla",st.mfl);
  ok(kozel(st.mflCon,0.9)&&st.mflConNem,"…kontra: egy gólnyira a mérföldkőtől a gólpassz-súly −10%, különben nem",st.mflCon);

  /* ---- 3. 📋 TAKTIKA ---- */
  const tk=await p.evaluate(()=>{
    const ki={};
    const k=S.tactics.active;
    const masik=Object.keys(TACTICS).filter(x=>x!==k);
    /* TÁBLA ÉS KRÉTA — a valódi begyakorlás */
    const tan=(lvl)=>{
      S.tactics.levels[k]=lvl;masik.forEach((x,i)=>{S.tactics.levels[x]=60-i;});
      const k2=masik[0],a2=S.tactics.levels[k2];
      tacticTrainAfterMatch(2,0);
      return {d1:S.tactics.levels[k]-lvl,d2:S.tactics.levels[k2]-a2};};
    _nincs();const t0=tan(80);
    _lap("tabla",2);const t1=tan(80);
    ki.tabla={d2:t1.d2,vart:t1.d1*talSpecV("tabla","pro")/100,nelkul:t0.d2};
    ki.tablaCon=talMasodEdzMult();
    ki.tablaHely=String(processBenchDevelopment).indexOf("talMasodEdzMult")>=0;
    /* GYORS TANULÓ */
    _nincs();const g70=tan(70).d1,g80=tan(80).d1;
    _lap("gyorstanulo",3);ki.gyors={alatta:tan(70).d1/g70,felette:tan(80).d1/g80};
    const ablak=(round)=>{const _e=twEnterHubWindow;twEnterHubWindow=()=>{};
      try{twOpenCheckpointWindow(round,()=>{});return S.twWindow.max;}finally{twEnterHubWindow=_e;S.twWindow=null;}};
    _nincs();const w8=ablak(8),w15=ablak(15);
    _lap("gyorstanulo",3);ki.gyorsCon={tel:w15-ablak(15),rovid:w8-ablak(8)};
    /* KAMÉLEON */
    S.formationChangesThisSeason=1;
    _nincs();const fc0=formationChangeCost();
    _lap("kameleon",1);const fc1=formationChangeCost();
    S.formationChangesThisSeason=2;const fc1b=formationChangeCost();
    _lap("kameleon",3);const fc3=formationChangeCost();
    ki.kam={nelkul:fc0,egy:fc1,egyUtan:fc1b,harom:fc3};
    ki.kamCon=String(renderFormationPicker).indexOf('talSpecV("kameleon","con")')>=0;
    S.formationChangesThisSeason=0;
    /* PONTRÚGÁS-LABOR */
    _lap("pontrugas",1);
    ki.pont={sp:talMeccsCsat("setpiece",{}),ct:talMeccsCsat("counter",{}),vartCt:1-talSpecV("pontrugas","con")/COUNTER_WINDOW};
    /* VASFEGYELEM */
    _lap("vasfegyelem",2);
    ki.vas={sarga:talSargaMult(),hely:String(playMatch).indexOf("talSargaMult()")>=0,
      kesoi:talMeccsCsat("own",{min:80}),korai:talMeccsCsat("own",{min:60})};
    /* MESTERSZINT */
    _nincs();const c0=tacticCeil(k),q0=coachQual({sz:60,type:"medic"});
    _lap("mesterszint",4);ki.mester={plafon:tacticCeil(k)-c0,stab:coachQual({sz:60,type:"medic"})/q0,vart:1-talSpecV("mesterszint","con")/100};
    /* TITKOS FEGYVER — a menü gombja élesít, a pillanatképbe sül */
    _lap("titkosfegyver",3);
    talMenuOpen();
    const gomb=$("talHatas").querySelector('[data-tal="titkos"]');
    ki.titkosGomb=!!gomb;
    if(gomb)gomb.click();
    const X=talTitkos();
    const MS=buildMatchSnapshot();
    ki.titkos={elo:X.elo,left:X.left,max:X.max,snap:MS.talTitkos,own:MS.talOwn};
    talSpecMeccsUtan();ki.titkosUtan={elo:talTitkos().elo,snap:"talTitkos" in buildMatchSnapshot()};
    talMenuClose();
    _lap("titkosfegyver",4);talSpAll().titkos=null;ki.titkos4=talTitkos().max;
    S.summerLooks=null;_nincs();const sl0=twSummerLooks().max;
    S.summerLooks=null;_lap("titkosfegyver",3);ki.titkosCon=sl0-twSummerLooks().max;S.summerLooks=null;
    /* ELLENFÉL-ELEMZŐ */
    _nincs();const f0=tacticFit(k);
    _lap("elemzo",2);
    S.playing=true;_talKtx={derby:true,esely:false};const fd=tacticFit(k);
    _talKtx={derby:false,esely:true};const fe=tacticFit(k);
    _talKtx={derby:false,esely:false};const fn=tacticFit(k);
    S.playing=false;_talKtx={derby:true,esely:true};const fk=tacticFit(k);_talKtx=null;
    ki.elemzo={derby:Math.round((fd-f0)*10000)/100,esely:Math.round((fe-f0)*10000)/100,sima:fn===f0,meccsenKivul:fk===f0};
    const b0=S.transferBudget;talSpecMeccsUtan();
    ki.elemzoKi={ki:b0-S.transferBudget,vart:talSpHetiPct(talSpecV("elemzo","con"))};
    return ki;});
  console.log("\n— 3. 📋 TAKTIKA —");
  ok(tk.tabla.d2>0&&kozel(tk.tabla.d2,tk.tabla.vart,1e-9)&&tk.tabla.nelkul===0,"Tábla és kréta: a második legbegyakorlottabb rendszer a valódi begyakorlás 20%-ával tanul",tk.tabla);
  ok(kozel(tk.tablaCon,0.85)&&tk.tablaHely,"…kontra: a másodlagos edzés −15% (a kezdőkön és a padon is)",tk.tablaCon);
  ok(kozel(tk.gyors.alatta,1.3,1e-9)&&kozel(tk.gyors.felette,1,1e-12),"Gyors tanuló: 72 alatt +30% begyakorlás, fölötte változatlan",tk.gyors);
  ok(tk.gyorsCon.tel===1&&tk.gyorsCon.rovid===0,"…kontra: a téli ablakban eggyel kevesebb felderítés (a rövidben nem)",tk.gyorsCon);
  ok(tk.kam.nelkul>0&&tk.kam.egy===0&&tk.kam.egyUtan>0&&tk.kam.harom===0,"Kaméleon: +1 ingyen felállásváltás (3+ ritkaságon +2)",tk.kam);
  ok(tk.kamCon,"…kontra: a fizetős váltás morált visz (a valódi váltás-ágon)");
  ok(kozel(tk.pont.sp,1.2),"Pontrúgás-labor: a pontrúgás súlya +20%",tk.pont);
  ok(kozel(tk.pont.ct,tk.pont.vartCt),"…kontra: a kontra-ablak −2 perc",tk.pont);
  ok(kozel(tk.vas.sarga,0.9)&&tk.vas.hely,"Vasfegyelem: a sárgalap-esély −10% (a valódi motorban)",tk.vas);
  ok(kozel(tk.vas.kesoi,0.97)&&tk.vas.korai===1,"…kontra: a 75. perctől −3% saját gólvárhatóság, előtte semmi",tk.vas);
  ok(tk.mester.plafon===2,"Mesterszint: +2 a taktika-plafonon",tk.mester);
  ok(kozel(tk.mester.stab,tk.mester.vart,1e-9)&&tk.mester.vart<1,"…kontra: a stábhatás −5%",tk.mester);
  ok(tk.titkosGomb&&tk.titkos.elo&&tk.titkos.left===2&&tk.titkos.max===3&&kozel(tk.titkos.snap,1.04),"Titkos fegyver: a menü gombja élesít, a pillanatképbe +4% sül (külön mezőben)",tk.titkos);
  ok(!tk.titkosUtan.elo&&!tk.titkosUtan.snap&&tk.titkos4===4,"…a meccs után elsül; legendáson 4 előhúzás",{utan:tk.titkosUtan,max4:tk.titkos4});
  ok(tk.titkosCon===1,"…kontra: nyáron eggyel kevesebb felderítés",tk.titkosCon);
  ok(tk.elemzo.derby===2&&tk.elemzo.esely===2&&tk.elemzo.sima&&tk.elemzo.meccsenKivul,"Ellenfél-elemző: rangadón és esélytelenként +2 pp illeszkedés, máskor és meccsen kívül semmi",tk.elemzo);
  ok(tk.elemzoKi.ki===tk.elemzoKi.vart&&tk.elemzoKi.ki>0,"…kontra: meccsenként a heti lelátó 3%-a",tk.elemzoKi);

  /* ---- 4. A KÁRTYA ÉS A MENÜ ---- */
  const ui=await p.evaluate(()=>{
    const L=_lap("pontrugas",1);
    const h=talLapHtml(L,{});
    const lista=TAL_SPEC.filter(s=>["scout","stilus","taktika"].indexOf(s.k)>=0);
    talMenuOpen();const menu=$("talHatas").textContent;talMenuClose();
    return {el:/a special él/.test(h),db:lista.length,mind:lista.every(s=>talSpecMukodik(s.id)),
      tobbi:TAL_SPEC.filter(s=>["scout","stilus","taktika"].indexOf(s.k)<0).every(s=>!talSpecMukodik(s.id)),
      menu:/Pontrúgás-labor/.test(menu)};});
  console.log("\n— 4. A KÁRTYA ÉS A MENÜ —");
  ok(ui.el,"a kártya „✦ a special él” jelet kap");
  ok(ui.db===24&&ui.mind&&ui.tobbi,"a három kategória mind a 24 speciálja él, a többi még nem",ui);
  ok(ui.menu,"a menüben a special sora (pro és kontra) áll");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
