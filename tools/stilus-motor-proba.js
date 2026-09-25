/* ⚡ A KÖZÖS JELZŐRENDSZER-MOTOR ÉS A VILLÁM GAZDASÁGA (3.9.105).

   KIMONDOTT KÉRÉS: „Mindegyik csapatstílus kapjon egy olyan rendszert, mint a
   panzerkampfwagen a félelem-rettenet-tel. A skálák hasonlók legyenek, viszont
   a reward legyen alacsonyabb. A panzerkampfwagené legyen a legerősebb."
   A projektgazda a „b" utat választotta: a Panzer +20-a MARAD, a többi +12-t kap.

   Amit mér:
     1. a két létra VISZONYA: az új százalék-létra végig pontosan a Panzerének
        a 0,6-szerese, és a plafon is (12 vs 20);
     2. az árlétra és a szintküszöb BETŰRE a Panzeré — ugyanaz a munka;
     3. a viharszint mint ÁLLAPOT: a keret sebességéből számol, a stílusszint
        nagyítja, a gyors ember eladása azonnal leviszi;
     4. a meccsenkénti plafon az állapot 10%-a;
     5. a szint → meccserő átváltás és a +12-es plafon;
     6. az ÉLŐ gazdaság: egy mérkőzés tarifája, a plafon fogása, a könyvelés;
     7. és hogy a motor CSAK a saját stílusánál fut — Panzernél nem szólal meg,
        tehát a két gazdaság nem adódik össze. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9077;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof engLevel==="function"&&typeof engOvrBonus==="function"
    &&typeof ENG_PCT!=="undefined",null,{timeout:30000});

  /* ================= 1-2. A KÉT LÉTRA VISZONYA ================= */
  const letra=await p.evaluate(()=>({
    arany:ENG_PCT.map((v,i)=>RETTEGES_PCT[i]?Math.round(v/RETTEGES_PCT[i]*1000)/1000:null)
      .filter(x=>x!=null),
    engPct:ENG_PCT.slice(),panzerPct:RETTEGES_PCT.slice(),
    capEng:ENG_OVR_CAP,capPanzer:FEAR_OVR_CAP,
    arAzonos:JSON.stringify(ENG_PRICE)===JSON.stringify(RETTEGES_PRICE),
    kuszobAzonos:[1,2,3,5,10].every(n=>engNeedLevel(n)===rettegesNeedLevel(n)),
    maxAzonos:ENG_MAX===RETTEGES_MAX,
    matchPctAzonos:ENG_MATCH_PCT===FEAR_MATCH_PCT}));
  console.log("=== 1. a jutalom pontosan a Panzeré 0,6-szerese ===");
  ok(letra.arany.every(x=>Math.abs(x-0.6)<0.02),
    "MINDEN szinten 0,6 az arány",letra.arany);
  ok(letra.capEng===12&&letra.capPanzer===20,
    "plafon: +12 vs a Panzer +20-a (a b út — a Panzeré marad)",
    {eng:letra.capEng,panzer:letra.capPanzer});
  console.log("=== 2. de a MUNKA ugyanannyi ===");
  ok(letra.arAzonos,"az árlétra betűre a Panzeré");
  ok(letra.kuszobAzonos,"a szintküszöb betűre a Panzeré (4+n)");
  ok(letra.maxAzonos&&letra.matchPctAzonos,
    "10 szint, és meccsenként az állapot 10%-a — mindkettőnél");

  /* ================= 3-7. ÉLŐ KARRIER ================= */
  const t=await p.evaluate(async()=>{
    const ki={};
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
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";buildSeasonFixtures();

    /* A VILLÁM stílus, ismert sebességekkel. */
    S.style={key:"villam",traits:{}};S.style2=null;
    const roster=fullCareerRoster()||[];
    const setSeb=(v)=>{roster.forEach(pl=>{
      const e=careerPool&&careerPool[pl.n];
      if(e){if(!e.attrs)initPlayerAttrs(e);e.attrs.seb=v;}});};

    ki.kulcs=engKey();
    /* --- 3. A VIHARSZINT MINT ÁLLAPOT --- */
    setSeb(70);  ki.seb70=engLevel();
    setSeb(80);  ki.seb80=engLevel();
    setSeb(100); ki.seb100=engLevel();
    ki.roster=roster.length;
    /* A stílusszint nagyít: ugyanaz a keret, más szint */
    const _sl=styleLevel;
    window.styleLevel=()=>1;  ki.lvl1=engLevel();
    window.styleLevel=()=>20; ki.lvl20=engLevel();
    window.styleLevel=_sl;
    /* EGY gyors ember eladása azonnal levisz */
    setSeb(100);
    const elotte=engLevel();
    {const e=careerPool&&careerPool[roster[0].n];if(e)e.attrs.seb=60;}
    ki.eladas={elotte,utana:engLevel()};
    setSeb(95);
    ki.alap=engLevel();
    ki.cap=engMatchCap();
    ki.capArany=Math.round(ki.cap/ki.alap*1000)/1000;

    /* --- 5. A SZINT → MECCSERŐ --- */
    const E=engState();
    const so=[];
    for(let lv=0;lv<=10;lv++){E.lvl=lv;so.push(engOvrBonus());}
    ki.ovrLetra=so;
    E.lvl=0;

    /* --- 6. AZ ÉLŐ GAZDASÁG: egy mérkőzés tarifája --- */
    const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
    engMatchStart();
    _engMin=10;  engGoalNote(roster[0].n);          /* korai gól + gól + villámláb */
    _engMin=70;  engGoalNote(roster[1].n);          /* csak gól (+villámláb) */
    engAssistNote();
    const nyersElott=E.pts;
    engNoteWin(true,3,3,0);                          /* győzelem + háromgólos */
    const kapott=engMatchEnd();
    addLine=_a;
    ki.meccs={kapott,egyenleg:E.pts,cap:ki.cap,
      tetelek:naplo.filter(x=>/villámpont/.test(x)).length,
      osszesito:naplo.some(x=>/VILLÁMPONT — a mérkőzés mérlege/.test(x)),
      korai:naplo.some(x=>/korai gól/.test(x)),
      villamlab:naplo.some(x=>/villámláb/.test(x)),
      harom:naplo.some(x=>/háromgólos/.test(x)),
      nyersElott};
    ki.plafonFogott=kapott<=ki.cap+0.001;

    /* --- A VÁSÁRLÁS --- */
    E.pts=99999;
    const _sl2=styleLevel;window.styleLevel=()=>20;
    ki.vasarlasElott={lvl:engLvl(),ovr:engOvrBonus()};
    ki.vettem=engBuyLevel();
    ki.vasarlasUtan={lvl:engLvl(),ovr:engOvrBonus()};
    window.styleLevel=_sl2;

    /* --- 7. PANZERNÉL NEM SZÓLAL MEG --- */
    S.style={key:"panzer",traits:{}};S.style2=null;
    ki.panzer={kulcs:engKey(),szint:engLevel(),ovr:engOvrBonus()};
    {const n2=[];const _b=addLine;addLine=x=>n2.push(String(x));
     engMatchStart();engGoalNote(roster[0].n);
     ki.panzer.nema=(engMatchEnd()===0)&&!n2.some(x=>/villámpont/.test(x));
     addLine=_b;}
    /* …és a MÁSODLAGOS sloton viszont igen (a stílus-slotok mindkét fele) */
    S.style={key:"panzer",traits:{}};S.style2={key:"villam",traits:{}};
    ki.masodlagos=engKey();
    return ki;});

  console.log("=== 3. a viharszint egy ÁLLAPOT ===");
  ok(t.kulcs==="villam","a Villámnál a motor aktív",{k:t.kulcs});
  ok(t.seb70===0,"70-es sebességnél nulla (ott kezdődik a skála)",{v:t.seb70});
  ok(t.seb80>0&&t.seb100>t.seb80,"és onnan monoton nő",{s80:t.seb80,s100:t.seb100});
  ok(t.lvl20>t.lvl1*1.9,"a stílusszint nagyítja (1. → 20. szint ~négyszeres)",
    {lvl1:t.lvl1,lvl20:t.lvl20});
  ok(t.eladas.utana<t.eladas.elotte,
    "egy gyors ember eladása AZONNAL leviszi",t.eladas);
  console.log("=== 4. a meccsenkénti plafon ===");
  ok(Math.abs(t.capArany-0.1)<0.002,"az állapot 10%-a",
    {allapot:t.alap,cap:t.cap,arany:t.capArany});
  console.log("=== 5. a szint meccserővé válik ===");
  ok(t.ovrLetra[0]===0,"nulladik szinten nincs bónusz");
  ok(t.ovrLetra.every((v,i)=>i===0||v>=t.ovrLetra[i-1]),"monoton nő",t.ovrLetra);
  ok(t.ovrLetra.every(v=>v<=12.0001),"és sosem lépi túl a +12-t",
    {max:Math.max.apply(null,t.ovrLetra)});
  console.log("=== 6. az élő gazdaság ===");
  ok(t.meccs.korai,"a korai gól külön tétel");
  ok(t.meccs.villamlab,"a villámláb gólja külön tétel");
  ok(t.meccs.harom,"a háromgólos győzelem külön tétel");
  ok(t.meccs.osszesito,"a lefújásnál jön az összesítő");
  ok(t.meccs.kapott>0&&t.plafonFogott,
    "a jóváírás pozitív és a plafon fogta",t.meccs);
  ok(t.meccs.egyenleg===t.meccs.kapott,"a klub egyenlege pontosan ennyivel nőtt",
    {egyenleg:t.meccs.egyenleg,kapott:t.meccs.kapott});
  ok(t.vettem===true&&t.vasarlasUtan.lvl===1&&t.vasarlasUtan.ovr>0,
    "a szint megvehető, és azonnal meccserőt ad",
    {elott:t.vasarlasElott,utan:t.vasarlasUtan});
  console.log("=== 7. és CSAK a saját stílusánál fut ===");
  ok(t.panzer.kulcs===null&&t.panzer.szint===0&&t.panzer.ovr===0,
    "Panzernél a motor néma (a két gazdaság nem adódik össze)",t.panzer);
  ok(t.panzer.nema===true,"…és egy mérkőzés sem ír jóvá semmit");
  ok(t.masodlagos==="villam","de MÁSODLAGOS sloton is fut",{k:t.masodlagos});

  /* ================= 8. NYOLCVAN PERC — A SEBESSÉG ÁRA =================
     A Villám eddig tiszta nyereség volt. A fáradás adja az ellenjátékot: a
     70. perctől esik a gólesélyetek és nő az ellenfélé, annál jobban, minél
     magasabb a viharszint — és minden megvett szint a tizedét tünteti el. */
  const fade=await p.evaluate(()=>{
    const ki={};
    S.style={key:"villam",traits:{}};S.style2=null;
    const roster=fullCareerRoster()||[];
    const setSeb=v=>{roster.forEach(pl=>{
      const e=careerPool&&careerPool[pl.n];
      if(e){if(!e.attrs)initPlayerAttrs(e);e.attrs.seb=v;}});};
    const E=engState("villam");
    setSeb(100);E.lvl=0;
    const _sl=styleLevel;window.styleLevel=()=>20;
    ki.szint=engLevel("villam");
    /* A PERC-KAPU */
    ki.percek=[0,30,65,69,70,75,90].map(m=>({m,
      own:Math.round(villamFadeOwn(m)*10000)/10000,
      opp:Math.round(villamFadeOpp(m)*10000)/10000}));
    /* A KIVÁSÁRLÁS: szintenként a tized */
    ki.szintek=[0,1,5,9,10].map(lv=>{E.lvl=lv;
      return {lv,pct:villamFadePct(90)};});
    E.lvl=0;
    /* ALACSONY VIHARSZINTEN nincs hatás */
    setSeb(70);ki.gyenge=villamFadePct(90);
    setSeb(100);
    window.styleLevel=_sl;
    /* MÁS STÍLUSNÁL egyáltalán nem létezik */
    S.style={key:"panzer",traits:{}};
    ki.panzer=villamFadePct(90);
    S.style={key:"villam",traits:{}};
    return ki;});
  console.log("=== 8. Nyolcvan perc — a sebesség ára ===");
  {const k=fade.percek;
   ok(k.filter(x=>x.m<70).every(x=>x.own===1&&x.opp===1),
     "a 70. perc ELŐTT semmi hatás",k.filter(x=>x.m<70));
   ok(k.filter(x=>x.m>=70).every(x=>x.own<1&&x.opp>1),
     "a 70. perctől a saját esély esik, az ellenfélé nő",k.filter(x=>x.m>=70));
   const h=k.find(x=>x.m===90);
   ok(Math.abs((1-h.own)-(h.opp-1))<1e-9,
     "és pontosan ugyanannyival mindkét irányba",{own:h.own,opp:h.opp});}
  ok(fade.szintek[0].pct>0,"szint nélkül van fáradás",fade.szintek[0]);
  {const csokken=fade.szintek.every((x,i)=>i===0||x.pct<=fade.szintek[i-1].pct);
   ok(csokken,"minden megvett szint csökkenti",fade.szintek);}
  ok(fade.szintek[fade.szintek.length-1].pct===0,
    "a 10. szinten a hátrány ELTŰNIK",fade.szintek[fade.szintek.length-1]);
  ok(fade.gyenge===0,"alacsony viharszinten nincs mit fizetni",{pct:fade.gyenge});
  ok(fade.panzer===0,"és más stílusnál nem létezik",{pct:fade.panzer});

  /* ================= 9. SZÁRNY-KÉMIA =================
     A harmadik kötésfajta a passzkémia és a gyilkos páros mellé. Azonos
     oldal, KÜLÖNBÖZŐ poszt (védő + szélső), és a sebességük legfeljebb
     SZARNY_GAP-pel térhet el — utóbbi a lényeg: ez teszi keretépítési
     döntéssé, nem automatikus jutalommá. */
  const sz=await p.evaluate(()=>{
    const ki={};
    S.style={key:"villam",traits:{}};S.style2=null;
    S.szarny={};
    const _sl=styleLevel;
    /* --- A KAPU: stílusszint --- */
    window.styleLevel=()=>1;  ki.lvl1={tier:szarnyTier(),on:szarnyOn()};
    window.styleLevel=()=>3;  ki.lvl3={tier:szarnyTier(),on:szarnyOn()};
    window.styleLevel=()=>8;  ki.lvl8=szarnyTier();
    window.styleLevel=()=>14; ki.lvl14=szarnyTier();
    window.styleLevel=()=>20; ki.lvl20=szarnyTier();

    /* --- A PÁROSÍTÁS SZABÁLYAI --- */
    const mk=(n,pos,seb)=>{careerPool[n]={n,pos:[pos],attrs:{seb},age:26,ovr:90,pot:5000};};
    mk("Jobbhátvéd Jenő","JV",92);
    mk("Jobbszélső József","JSZ",94);   /* azonos oldal, más poszt, 2 eltérés → OK */
    mk("Lassú Lajos","JV",80);          /* azonos oldal, de 14 eltérés → nem */
    mk("Balhátvéd Béla","BV",88);
    mk("Balszélső Bence","BSZ",89);
    mk("Középső Károly","KV",93);       /* nem szárny */
    mk("Másik Szélső","JSZ",93);        /* azonos poszt → nem */
    /* 3.9.143: a szárny csak KLUBNÁL lévő emberekkel él (a félbemaradt pár
       nem foglal szárnyat) — a kitalált emberek a kerethez tartoznak */
    const _fcr=fullCareerRoster;
    const kitalalt=["Jobbhátvéd Jenő","Jobbszélső József","Lassú Lajos","Balhátvéd Béla","Balszélső Bence","Középső Károly","Másik Szélső"];
    window.fullCareerRoster=()=>_fcr().concat(kitalalt.map(n=>({n,pos:careerPool[n].pos})));
    ki.parok={
      jo:szarnyPairOk("Jobbhátvéd Jenő","Jobbszélső József"),
      lassu:szarnyPairOk("Lassú Lajos","Jobbszélső József"),
      masOldal:szarnyPairOk("Jobbhátvéd Jenő","Balszélső Bence"),
      nemSzarny:szarnyPairOk("Középső Károly","Jobbszélső József"),
      azonosPoszt:szarnyPairOk("Másik Szélső","Jobbszélső József"),
      bal:szarnyPairOk("Balhátvéd Béla","Balszélső Bence")};

    /* --- AZ ÉPÜLÉS ÉS AZ ÖSSZEÉRÉS --- */
    window.styleLevel=()=>20;
    const need=szarnyRipeNeed();
    ki.need=need;
    const jatszott=new Set(["Jobbhátvéd Jenő","Jobbszélső József",
      "Balhátvéd Béla","Balszélső Bence","Középső Károly"]);
    const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
    /* 3.9.143: a tick MÁR NEM INDÍT szárnyat — azt a felajánlás és a
       választás teszi, fázisonként (lásd szarny-kemia-epites-proba.js) */
    szarnyTick(jatszott);
    ki.elsoTick={kotesek:Object.keys(S.szarny).length,
      indult:naplo.filter(x=>/Szárny épül/.test(x)).length};
    for(let f=0;f<SZARNY_NEED;f++){
      szarnyAddStage("Jobbhátvéd Jenő","Jobbszélső József");
      szarnyAddStage("Balhátvéd Béla","Balszélső Bence");}
    for(let i=0;i<need+2;i++)szarnyTick(jatszott);
    addLine=_a;
    ki.utana={kesz:szarnyDone(),osszes:Object.keys(S.szarny).length,
      osszeert:naplo.filter(x=>/ÖSSZEÉRT A SZÁRNY/.test(x)).length};
    ki.sebesseg={
      jv:Math.round(careerPool["Jobbhátvéd Jenő"].attrs.seb),
      jsz:Math.round(careerPool["Jobbszélső József"].attrs.seb)};

    /* --- A GÓLESÉLY-SZORZÓ --- */
    const act=nevek=>nevek.map(n=>({p:{n},bus:0}));
    ki.szorzo={
      mindketto:Math.round(szarnyGoalMult(act(["Jobbhátvéd Jenő","Jobbszélső József"]),new Set())*10000)/10000,
      egyik:Math.round(szarnyGoalMult(act(["Jobbhátvéd Jenő"]),new Set())*10000)/10000,
      ketPar:Math.round(szarnyGoalMult(act(["Jobbhátvéd Jenő","Jobbszélső József",
        "Balhátvéd Béla","Balszélső Bence"]),new Set())*10000)/10000,
      kiallitva:Math.round(szarnyGoalMult(act(["Jobbhátvéd Jenő","Jobbszélső József"]),new Set([0]))*10000)/10000};
    /* --- MÁS STÍLUSNÁL SEMMI --- */
    S.style={key:"panzer",traits:{}};
    ki.panzer={on:szarnyOn(),
      szorzo:szarnyGoalMult(act(["Jobbhátvéd Jenő","Jobbszélső József"]),new Set())};
    S.style={key:"villam",traits:{}};
    window.styleLevel=_sl;window.fullCareerRoster=_fcr;
    return ki;});

  console.log("=== 9. szárny-kémia ===");
  const SZARNY_NEED_PROBA=5;
  ok(sz.lvl1.tier===0&&!sz.lvl1.on,"a 3. stílusszint alatt nem létezik",sz.lvl1);
  ok(sz.lvl3.tier===1&&sz.lvl3.on,"a 3.-tól nyílik",sz.lvl3);
  ok(sz.lvl8===2&&sz.lvl14===3&&sz.lvl20===3,"három fokozat, 8-nál és 14-nél lép",
    {l8:sz.lvl8,l14:sz.lvl14,l20:sz.lvl20});
  ok(sz.parok.jo&&sz.parok.bal,"JV+JSZ és BV+BSZ közeli sebességgel: páros",sz.parok);
  ok(!sz.parok.lassu,"…de ha a sebesség elszakad, NEM (ez a keretépítési döntés)");
  ok(!sz.parok.masOldal&&!sz.parok.nemSzarny&&!sz.parok.azonosPoszt,
    "más oldal / nem szárny / azonos poszt: nem páros",sz.parok);
  ok(sz.elsoTick.kotesek===0&&sz.elsoTick.indult===0,
    "3.9.143: a közös meccs magától NEM indít szárnyat (a felajánlás és a választás teszi)",sz.elsoTick);
  ok(sz.utana.kesz===2&&sz.utana.osszeert===2,
    `${SZARNY_NEED_PROBA} fázis után kész, és ${sz.need} közös meccs után mindkettő összeér`,sz.utana);
  ok(sz.sebesseg.jv===sz.sebesseg.jsz&&sz.sebesseg.jv>94,
    "és a sebességük FÖLFELÉ egyenlítődik ki",sz.sebesseg);
  ok(sz.szorzo.mindketto>1&&sz.szorzo.egyik===1,
    "a szorzó csak akkor jár, ha MINDKETTŐ a pályán van",sz.szorzo);
  ok(Math.abs(sz.szorzo.ketPar-sz.szorzo.mindketto*sz.szorzo.mindketto)<1e-6,
    "két kész páros szorzata halmozódik",sz.szorzo);
  ok(sz.szorzo.kiallitva===1,"a kiállított nem számít",{v:sz.szorzo.kiallitva});
  ok(sz.panzer.on===false&&sz.panzer.szorzo===1,
    "más stílusnál nem létezik",sz.panzer);

  /* ================= 10. BOMBÁZÓK: A MOTOR MÁSODIK STÍLUSA =================
     Itt derül ki, ér-e valamit a közös motor: a Bombázók gazdasága EGY
     táblázatsor. A bázis ugyanaz a szerkezet, csak másik attribútumon (gol),
     a tarifa viszont másról szól — a Villámé a MIKOR, a Bombázóké a MENNYI. */
  const bz=await p.evaluate(async()=>{
    const ki={};
    S.style={key:"bombazok",traits:{}};S.style2=null;
    S.bz9=null;S.recGoalsMatch=0;
    const roster=fullCareerRoster()||[];
    const setA=(kulcs,v)=>{roster.forEach(pl=>{
      const e=careerPool&&careerPool[pl.n];
      if(e){if(!e.attrs)initPlayerAttrs(e);e.attrs[kulcs]=v;}});};
    ki.kulcs=engKey();
    /* --- A BÁZIS a GÓLSZERZÉSBŐL, nem a sebességből --- */
    setA("gol",70);setA("seb",100);
    ki.gol70={gol:engLevel("bombazok")};
    setA("gol",95);
    ki.gol95={gol:engLevel("bombazok")};
    const _sl=styleLevel;window.styleLevel=()=>20;
    ki.allapot=engLevel("bombazok");
    /* --- A TARIFA: mesterhármas, gólzápor, klubrekord --- */
    const E=engState("bombazok");E.pts=0;
    const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
    engMatchStart();
    S.recGoalsMatch=3;
    engFullTimeNote({"A":3,"B":1},5);     /* 1 mesterhármas + 5 gól + rekord (3→5) */
    const kap=engMatchEnd();
    addLine=_a;
    ki.tarifa={kap,
      hat:naplo.some(x=>/mesterhármas/.test(x)),
      zapor:naplo.some(x=>/gólzápor/.test(x)),
      rekord:naplo.some(x=>/ÚJ KLUBREKORD/.test(x))};
    /* --- A KILENCES --- */
    window.styleLevel=()=>1;  ki.n9lvl1={tier:bzTier(),nev:bz9Name()};
    window.styleLevel=()=>20;
    /* A KERETBEN nem garantált, hogy van CSATÁR-kategóriás ember (a 9.
       szakasz posztokat is átírt) — ezért itt kijelölünk egyet mindkét
       szerepre. A posztkód a careerPool-ban lakik, onnan olvas a bz9Eligible. */
    careerPool[roster[0].n].pos=["CS"];
    careerPool[roster[1].n].pos=["KV"];
    const csatar=roster[0],vedo=roster[1];
    ki.jelolhet={csatar:bz9Eligible(csatar.n),vedo:bz9Eligible(vedo.n)};
    ki.jelol={csatar:bz9Set(csatar&&csatar.n),vedo:bz9Set(vedo&&vedo.n)};
    bz9Set(csatar&&csatar.n);
    const N=csatar&&csatar.n;
    ki.kilences={
      nullaGol:bz9GoalMult(N,30,1,0,{}),
      egyGol:Math.round(bz9GoalMult(N,30,1,0,{[N]:1})*1000)/1000,
      haromGol:Math.round(bz9GoalMult(N,30,3,0,{[N]:3})*1000)/1000,
      otGol:Math.round(bz9GoalMult(N,30,5,0,{[N]:5})*1000)/1000,
      masik:bz9GoalMult(vedo&&vedo.n,30,1,0,{[vedo&&vedo.n]:2}),
      hajraHatrany:bz9GoalMult(N,75,1,2,{[N]:3}),
      hajraVezetes:Math.round(bz9GoalMult(N,75,2,1,{[N]:3})*1000)/1000};
    /* --- A REKORD KÖTELEZ --- */
    S.recGoalsMatch=4;
    bzRecReset();
    ki.rekord={
      messze:Math.round(bzRecGoalMult(1)*1000)/1000,
      egyre:Math.round(bzRecGoalMult(3)*1000)/1000,
      latch:Math.round(bzRecGoalMult(0)*1000)/1000};   /* latchelt → marad */
    bzRecReset();
    S.recGoalsMatch=1;
    ki.rekordKicsi=bzRecGoalMult(0);                    /* 2 alatti csúcsnál nincs */
    /* --- A LEFÚJÁS KÖNYVELI A CSÚCSOT --- */
    S.recGoalsMatch=3;bzRecFullTime(6);ki.ujRekord=S.recGoalsMatch;
    bzRecFullTime(2);ki.nemEsik=S.recGoalsMatch;
    /* --- MÁS STÍLUSNÁL SEMMI --- */
    S.style={key:"villam",traits:{}};
    bzRecReset();S.recGoalsMatch=4;
    ki.villamnal={rek:bzRecGoalMult(3),nine:bz9Name(),
      kilences:bz9GoalMult(N,30,1,0,{[N]:3})};
    window.styleLevel=_sl;
    S.style={key:"bombazok",traits:{}};
    return ki;});

  console.log("=== 10. Bombázók — a motor második stílusa ===");
  ok(bz.kulcs==="bombazok","a motor a Bombázóknál is aktív",{k:bz.kulcs});
  ok(bz.gol70.gol===0&&bz.gol95.gol>0,
    "a bázis a GÓLSZERZÉSBŐL jön (a 100-as sebesség nem számít)",
    {gol70:bz.gol70,gol95:bz.gol95});
  ok(bz.tarifa.hat&&bz.tarifa.zapor&&bz.tarifa.rekord,
    "mesterhármas · gólzápor · klubrekord — mind külön tétel",bz.tarifa);
  ok(bz.tarifa.kap>0,"és a lefújás jóvá is írja",{kap:bz.tarifa.kap});
  console.log("--- A Kilences ---");
  ok(bz.n9lvl1.tier===0&&bz.n9lvl1.nev===null,"a 3. stílusszint alatt nincs",bz.n9lvl1);
  ok(bz.jelolhet.csatar===true&&bz.jelolhet.vedo===false,
    "a jelölhetőség CSATÁR-kategóriához kötött",bz.jelolhet);
  ok(bz.jelol.csatar===true&&bz.jelol.vedo===false,
    "…és a kijelölés is csak neki megy át",bz.jelol);
  ok(bz.kilences.nullaGol===1,"gól nélkül nincs bónusz");
  ok(bz.kilences.egyGol>1&&bz.kilences.haromGol>bz.kilences.egyGol,
    "és minden gólja emeli a következő esélyét",bz.kilences);
  ok(bz.kilences.otGol===bz.kilences.haromGol,
    "…de legfeljebb háromszor (a plafon fog)",{harom:bz.kilences.haromGol,ot:bz.kilences.otGol});
  ok(bz.kilences.masik===1,"másra nem hat");
  ok(bz.kilences.hajraHatrany===1&&bz.kilences.hajraVezetes>1,
    "a 70. perctől HÁTRÁNYBAN nem jár — frontember, nem megmentő",bz.kilences);
  console.log("--- A rekord kötelez ---");
  ok(bz.rekord.messze===1,"a csúcstól messze nincs bónusz",{v:bz.rekord.messze});
  ok(bz.rekord.egyre>1,"egy gólra tőle felizzik",{v:bz.rekord.egyre});
  ok(bz.rekord.latch===bz.rekord.egyre,"és a mérkőzés végéig marad (latch)",bz.rekord);
  ok(bz.rekordKicsi===1,"2 alatti csúcsnál nincs mit megközelíteni");
  ok(bz.ujRekord===6&&bz.nemEsik===6,"a lefújás felviszi a csúcsot, de nem viszi le",
    {uj:bz.ujRekord,utana:bz.nemEsik});
  ok(bz.villamnal.rek===1&&bz.villamnal.nine===null&&bz.villamnal.kilences===1,
    "más stílusnál egyik sem létezik",bz.villamnal);

  /* ================= 11. A MARADÉK NÉGY STÍLUS =================
     Beton · Harmónia · Tiki-taka · Gegenpressing. Mindegyik EGY táblázatsor —
     de nem ugyanaz a sor: háromféle bázis-alak és négyféle tarifa-nyelv.
     Itt derül ki, elbírja-e a motor a stílusok KÜLÖNBSÉGÉT is, nem csak a
     hasonlóságukat. */
  const negy=await p.evaluate(()=>{
    const ki={};
    ki.kulcsok=Object.keys(ENG_DEFS).sort();
    /* Melyik stílusnak NINCS motorja, és miért? */
    ki.nincs=STYLES.map(x=>x.key).filter(k=>!ENG_DEFS[k]).sort();
    const roster=fullCareerRoster()||[];
    const setA=(o)=>{roster.forEach(pl=>{
      const e=careerPool&&careerPool[pl.n];
      if(e){if(!e.attrs)initPlayerAttrs(e);Object.keys(o).forEach(k=>{e.attrs[k]=o[k];});}});};
    const _sl=styleLevel;window.styleLevel=()=>20;
    const allapot=(kulcs)=>{S.style={key:kulcs,traits:{}};S.style2=null;return engLevel(kulcs);};

    /* --- A HÁROM BÁZIS-ALAK --- */
    setA({ved:0,kapus:95,seb:0,gol:0,passz:0});
    ki.betonKapus=allapot("beton");          /* attrMax: a VÉDÉS is számít */
    setA({ved:95,kapus:0,seb:0,gol:0,passz:0});
    ki.betonVedo=allapot("beton");
    setA({seb:100,ved:70,kapus:0,gol:0,passz:0});
    ki.gegenAtlag=allapot("gegen");          /* attrAvg → mintha 85 lenne */
    setA({seb:85,ved:85,kapus:0,gol:0,passz:0});
    ki.gegenEgyenlo=allapot("gegen");
    setA({passz:95,ved:0,kapus:0,seb:0,gol:0});
    ki.tikiPassz=allapot("tikitaka");
    ki.tikiNemVed=(()=>{setA({passz:0,ved:95,kapus:0,seb:0,gol:0});
      return allapot("tikitaka");})();

    /* --- ☯️ A HARMÓNIA: AZ EGYENLETESSÉG A BÁZIS --- */
    const _po=pOvr;
    const sorrend=roster.map(x=>x.n);
    /* egyenletes keret */
    window.pOvr=(p2)=>{const n=(p2&&p2.n)||p2;return sorrend.indexOf(n)>=0?100:0;};
    ki.harmEgyenletes=allapot("harmonia");
    /* széthúzott keret: fele 120, fele 80 */
    window.pOvr=(p2)=>{const n=(p2&&p2.n)||p2;const i=sorrend.indexOf(n);
      return i<0?0:(i%2===0?120:80);};
    ki.harmSzethuzott=allapot("harmonia");
    window.pOvr=_po;

    /* --- A TARIFÁK --- */
    const teszt=(kulcs,fn)=>{
      S.style={key:kulcs,traits:{}};S.style2=null;
      const E=engState(kulcs);E.pts=0;E.lvl=0;
      const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
      engMatchStart();fn();const kap=engMatchEnd();
      addLine=_a;
      return {kap,naplo:naplo.join(" | ")};};
    setA({ved:95,kapus:95,seb:95,gol:95,passz:95});
    ki.beton={
      tisztaLap:teszt("beton",()=>{engNote("tackle");engNote("tackle");
        engFullTimeNote({A:1},1,0,{});}),
      lezart:teszt("beton",()=>{engFullTimeNote({A:2},2,1,{});}),
      kapottKetto:teszt("beton",()=>{engFullTimeNote({A:1},1,2,{});})};
    ki.harmonia={
      harman:teszt("harmonia",()=>{engFullTimeNote({A:1,B:1,C:1},3,0,{});}),
      negyen:teszt("harmonia",()=>{engFullTimeNote({A:1,B:1,C:1,D:1},4,0,{});}),
      egyedul:teszt("harmonia",()=>{engFullTimeNote({A:3},3,0,{});})};
    ki.tiki={
      csapatjatek:teszt("tikitaka",()=>{engFullTimeNote({A:3},3,0,{X:2,Y:1});}),
      keves:teszt("tikitaka",()=>{engFullTimeNote({A:3},3,0,{X:2});})};
    ki.gegen={
      press:teszt("gegen",()=>{for(let i=0;i<4;i++)engNote("press");
        engFullTimeNote({A:1},1,0,{});})};
    /* --- ÉS TOVÁBBRA IS CSAK EGY MOTOR FUT --- */
    S.style={key:"beton",traits:{}};S.style2={key:"tikitaka",traits:{}};
    ki.egyMotor=engKey();
    S.style={key:"panzer",traits:{}};S.style2=null;
    ki.panzerNincs=engKey();
    window.styleLevel=_sl;
    S.style={key:"villam",traits:{}};
    return ki;});

  console.log("=== 11. a maradék négy stílus ===");
  ok(negy.kulcsok.join()==="beton,bombazok,gegen,harmonia,tikitaka,villam",
    "hat stílusnak van motorja",negy.kulcsok);
  ok(negy.nincs.join()==="panzer,sztar",
    "és pontosan kettőnek nincs — nekik SAJÁT rendszerük van (rettenet / híresség)",
    negy.nincs);
  console.log("--- a három bázis-alak ---");
  ok(negy.betonKapus>0&&negy.betonKapus===negy.betonVedo,
    "🧱 attrMax: a kapus VÉDÉSE ugyanannyit ér, mint a mezőnyjátékos védekezése",
    {kapus:negy.betonKapus,vedo:negy.betonVedo});
  ok(negy.gegenAtlag===negy.gegenEgyenlo,
    "🧲 attrAvg: 100 seb + 70 ved = mintha mindkettő 85 lenne",
    {atlag:negy.gegenAtlag,egyenlo:negy.gegenEgyenlo});
  ok(negy.tikiPassz>0&&negy.tikiNemVed===0,
    "🌀 a Tiki-taka CSAK a passzt nézi",{passz:negy.tikiPassz,ved:negy.tikiNemVed});
  console.log("--- ☯️ a harmónia: az egyenletesség a bázis ---");
  ok(negy.harmEgyenletes>negy.harmSzethuzott,
    "az EGYENLETES keret többet ér, mint a széthúzott — ez az egyetlen ilyen bázis",
    {egyenletes:negy.harmEgyenletes,szethuzott:negy.harmSzethuzott});
  ok(negy.harmSzethuzott===0,
    "…és 20 Rating szórásnál már nulla (12-nél elfogy)",{v:negy.harmSzethuzott});
  console.log("--- a négy tarifa-nyelv ---");
  ok(/TISZTA LAP/.test(negy.beton.tisztaLap.naplo)&&negy.beton.tisztaLap.kap>0,
    "🧱 a tiszta lap a legnagyobb tétel",{kap:negy.beton.tisztaLap.kap});
  ok(/lezárt meccs/.test(negy.beton.lezart.naplo),
    "🧱 …és az egygólos győzelem is fizet");
  ok(negy.beton.kapottKetto.kap===0,
    "🧱 két kapott gólnál semmi",{kap:negy.beton.kapottKetto.kap});
  ok(/három gólszerző/.test(negy.harmonia.harman.naplo),
    "☯️ három gólszerző külön tétel");
  ok(/négy vagy több/.test(negy.harmonia.negyen.naplo)
     &&negy.harmonia.negyen.kap>negy.harmonia.harman.kap,
    "☯️ négy még többet ér",
    {harom:negy.harmonia.harman.kap,negy:negy.harmonia.negyen.kap});
  ok(negy.harmonia.egyedul.kap===0,
    "☯️ …de egy ember három gólja SEMMIT (nem a gól számít, hanem hányan)",
    {kap:negy.harmonia.egyedul.kap});
  ok(/csapatjáték/.test(negy.tiki.csapatjatek.naplo)
     &&!/csapatjáték/.test(negy.tiki.keves.naplo),
    "🌀 a csapatjáték-tétel 3 gólpassztól jár",
    {harom:negy.tiki.csapatjatek.kap,ketto:negy.tiki.keves.kap});
  ok(negy.gegen.press.kap>0,
    "🧲 az elhódított labda tölti a presszpontot",{kap:negy.gegen.press.kap});
  ok(negy.egyMotor==="beton","két motoros stílusból is csak EGY fut",{k:negy.egyMotor});
  ok(negy.panzerNincs===null,"Panzernél továbbra is néma");

  /* ================= 12. A FEED ÉS A MÁSODLAGOS HARMADOLÁS =================
     KIMONDOTT KÉRÉS 1: „ahogyan a rettenetnek vannak meccs közben feedben
     visszajelzései, mi mennyi pontot ért éppen, úgy legyen a többi
     csapatstílusnál is ilyen."
     KIMONDOTT KÉRÉS 2: „harmadoljuk a mértéküket a másodlagos
     csapatstílusnál."

     A mérce mindkettőnél a Panzer: a néma halmaz az övé (csak a tucatnyiszor
     előforduló tétel néma), a harmadolás száma pedig a mérföldköveké
     (STYLE2_MS_DIV). */
  const fd=await p.evaluate(()=>{
    const ki={};
    /* --- A NÉMA HALMAZOK A PANZERÉHEZ MÉRVE --- */
    ki.panzerNema=Object.keys(DREAD_QUIET).sort();
    ki.nemak=Object.keys(ENG_DEFS).map(k=>({k,
      nema:Object.keys(ENG_DEFS[k].quiet||{}).sort().join(",")||"—"}));
    ki.kozosNema=Object.keys(ENG_QUIET_ALL).sort();
    /* Minden tarifa-tételnek van-e CÍMKÉJE? Címke nélkül a feed „goal"-t írna. */
    ki.cimkeHiany=Object.keys(ENG_DEFS).map(k=>({k,
      hiany:Object.keys(ENG_DEFS[k].tariff||{})
        .filter(t=>!(ENG_DEFS[k].label||{})[t])}))
      .filter(x=>x.hiany.length);

    const roster=fullCareerRoster()||[];
    const setA=(o)=>{roster.forEach(pl=>{
      const e=careerPool&&careerPool[pl.n];
      if(e){if(!e.attrs)initPlayerAttrs(e);Object.keys(o).forEach(k=>{e.attrs[k]=o[k];});}});};
    setA({ved:95,kapus:95,seb:95,gol:95,passz:95});
    const _sl=styleLevel;window.styleLevel=()=>20;

    /* --- A GÓL ÉS A GÓLPASSZ MOSTANTÓL BESZÉL --- */
    const meccs=(elsodleges,masodlagos)=>{
      S.style={key:elsodleges,traits:{}};
      S.style2=masodlagos?{key:masodlagos,traits:{}}:null;
      const k=engKey();
      const E=engState(k);E.pts=0;E.lvl=0;
      const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
      engMatchStart();
      _engMin=10;engGoalNote(roster[0].n);
      engAssistNote();
      const kap=engMatchEnd();
      addLine=_a;
      return {k,kap,sorok:naplo.filter(x=>/\+.*<\/b>/.test(x)).length,
        naplo:naplo.join(" | ")};};
    ki.villam=meccs("villam",null);
    ki.tiki=meccs("tikitaka",null);
    ki.harm=meccs("harmonia",null);

    /* --- ÉS UGYANEZ MÁSODLAGOSKÉNT: HARMADÁRON --- */
    ki.villamMasod=meccs("beton","villam");
    ki.arany=Math.round(ki.villam.kap/Math.max(0.0001,ki.villamMasod.kap)*100)/100;
    ki.masodSzolt=/harmadáron gyűlik/.test(ki.villamMasod.naplo);
    ki.elsodlegesNemSzolt=!/harmadáron gyűlik/.test(ki.villam.naplo);
    /* A PLAFON VÁLTOZATLAN — nem az fér kevesebb, hanem lassabban gyűlik. */
    S.style={key:"villam",traits:{}};S.style2=null;
    const capElso=engMatchCap("villam");
    S.style={key:"beton",traits:{}};S.style2={key:"villam",traits:{}};
    ki.cap={elso:capElso,masod:engMatchCap("villam")};

    /* --- ÉS A RETTENET IS --- */
    const dread=(masodlagos)=>{
      S.style=masodlagos?{key:"villam",traits:{}}:{key:"panzer",traits:{}};
      S.style2=masodlagos?{key:"panzer",traits:{}}:null;
      const F=fearState();if(F){F.pts=0;F.retteges=0;}
      const naplo=[];const _a=addLine;addLine=x=>naplo.push(String(x));
      fearMatchStart();fearNote("red");fearNote("yellow");
      const kap=fearMatchEnd();
      addLine=_a;
      return {kap,naplo:naplo.join(" | ")};};
    ki.dreadElso=dread(false);
    ki.dreadMasod=dread(true);
    ki.dreadArany=Math.round(ki.dreadElso.kap/Math.max(0.0001,ki.dreadMasod.kap)*100)/100;
    window.styleLevel=_sl;
    S.style={key:"villam",traits:{}};S.style2=null;
    return ki;});

  console.log("=== 12. a feed sűrűsége ===");
  ok(fd.panzerNema.join()==="gap,tackle",
    "a Panzernél csak a védekező villanás és a fölény néma",fd.panzerNema);
  ok(fd.kozosNema.join()==="gap","a fölény a motorban is néma",fd.kozosNema);
  {const beszedes=fd.nemak.filter(x=>x.nema==="—").map(x=>x.k);
   ok(beszedes.length===4,"négy stílusnál MINDEN tétel megszólal",beszedes);
   const nemaK=fd.nemak.filter(x=>x.nema!=="—");
   ok(nemaK.every(x=>x.nema==="tackle"||x.nema==="press"),
     "és néma csak az marad, amiből tucatnyi jön egy meccsen",nemaK);}
  ok(fd.cimkeHiany.length===0,
    "minden tarifa-tételnek van magyar címkéje (a feed nem ír kulcsnevet)",
    fd.cimkeHiany);
  ok(fd.villam.sorok>=2&&fd.tiki.sorok>=2&&fd.harm.sorok>=2,
    "egy gól + egy gólpassz mostantól mindhárom stílusnál TÖBB feed-sort ad",
    {villam:fd.villam.sorok,tiki:fd.tiki.sorok,harm:fd.harm.sorok});
  ok(/gólpassz/.test(fd.tiki.naplo),"🌀 a gólpassz ki is mondja magát");

  console.log("=== 12b. a másodlagos harmadolása ===");
  ok(Math.abs(fd.arany-3)<0.15,
    "a másodlagos filozófia PONTOSAN harmadannyit gyűjt",
    {elsodleges:fd.villam.kap,masodlagos:fd.villamMasod.kap,arany:fd.arany});
  ok(fd.cap.elso===fd.cap.masod,
    "…de a meccsenkénti PLAFON változatlan (nem kevesebb fér bele, lassabban gyűlik)",
    fd.cap);
  ok(fd.masodSzolt&&fd.elsodlegesNemSzolt,
    "az összesítő kimondja, ha másodlagosként gyűjtesz — és csak akkor");
  ok(Math.abs(fd.dreadArany-3)<0.15,
    "és a RETTENET is harmadáron gyűlik másodlagosként",
    {elsodleges:fd.dreadElso.kap,masodlagos:fd.dreadMasod.kap,arany:fd.dreadArany});
  ok(/harmadáron gyűlik/.test(fd.dreadMasod.naplo),
    "…és ott is kimondja az összesítő");

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
