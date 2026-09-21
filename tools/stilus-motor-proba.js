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

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
