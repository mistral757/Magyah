/* ⭐ SZTÁR PIAC (3.9.100).

   KIMONDOTT KÉRÉS: „Globálisan minden módban PvP, single, dinamikus,
   hagyományos. Minden. Ha a csapaterőd eléri a nyers 110-et, és az átigazolási
   ügynökség eléri a 4 csillagot, akkor megnyílik egy új átigazolás típus:
   sztár piac. Itt az alap skálától 20%-kal jobb játékosokat lehet igazolni.
   Minden keresés 4 játékost dob fel: 1 kapus, 1 védő, 1 középpályás, 1 csatár.
   Az átigazolási ügynökség fejlődésével nő az ilyen keresések száma. Ez csak
   nyáron van nyitva. 4-5 csillag: 1 ilyen keresés, 5,5-6: 2, 6,5-7: 3,
   7,5-8: 4, 8,5-10: 5, 10,5-13: 6, 13,5-16: 7, 16,5-20: 8 és innentől kezdve
   5ösével kapunk +1et. Az ügynökség fejlődése növeli a gapet, amivel jobb
   játékost találsz: 4csillagnál 15-25%, és fél csillagonkent lépünk a
   fejlődésben, 10csillagnál: 30-40, 20 csillagnál: 50-60%."

   MIÉRT KELL EGYÁLTALÁN. A többi keresés az ALAP SÁVBÓL dolgozik
   (signingBand), az pedig a klubbal EGYÜTT nő: bármilyen nagy is leszel, a
   piac mindig „magadfajtát" kínál. A sztár piac az egyetlen csatorna, ami a
   saját sávod FÖLÉ mutat.

   Amit mér:
     1. a keresés-létra MINDEN töréspontja, a kérés táblázatával szemben;
     2. a gap-létra három rögzített pontja, a köztes félcsillagok, és hogy
        tényleg félcsillagonként lép (nem folytonosan);
     3. a két kapu KÜLÖN-KÜLÖN és EGYÜTT;
     4. hogy CSAK nyáron nyitva;
     5. a nyári keret: fogy, nem megy mínuszba, a fejlesztés nem tünteti el az
        elköltött alkalmakat, és a következő nyárra újratöltődik;
     6. az ÉLŐ keresés: négy találat, négy KÜLÖNBÖZŐ poszt, és tényleg jobbak
        az alap sávnál;
     7. és hogy MINDEN módban ugyanaz — piramis, Infinity, közös karrier. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9063;
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
  await p.waitForFunction(()=>typeof starMarketRuns==="function"
    &&typeof starMarketGap==="function"&&typeof starMarketWhy==="function",
    null,{timeout:30000});

  /* ---- 1-2. A KÉT LÉTRA (tiszta függvény, nem kell hozzá karrier) ---- */
  const letra=await p.evaluate(()=>{
    const ki={};
    /* A kérés táblázata, betűre. A próba MINDEN sáv mindkét szélét megnézi. */
    ki.runs=[[4,1],[4.5,1],[5,1],[5.5,2],[6,2],[6.5,3],[7,3],[7.5,4],[8,4],
             [8.5,5],[9,5],[10,5],[10.5,6],[13,6],[13.5,7],[16,7],[16.5,8],[20,8],
             /* innentől ötösével */
             [20.5,9],[25,9],[25.5,10],[30,10],[30.5,11],[35,11],[35.5,12]]
      .map(([s,v])=>({s,vart:v,kapott:starMarketRuns(s)}));
    ki.runsAlatt=[[3.5,0],[1,0],[0,0]].map(([s,v])=>({s,vart:v,kapott:starMarketRuns(s)}));
    const g=s=>{const x=starMarketGap(s);return [Math.round(x.lo*1000)/10,Math.round(x.hi*1000)/10];};
    ki.gap={
      s4:g(4),s10:g(10),s20:g(20),
      s7:g(7),          /* félúton 4 és 10 között → 22,5-32,5 */
      s15:g(15),        /* félúton 10 és 20 között → 40-50 */
      s4_5:g(4.5),      /* egy félcsillagnyi lépés a nyitástól */
      s30:g(30),        /* a tetőn túl: a 10→20 meredekség folytatódik */
      alatta:g(2)};     /* a padló a nyitó négy csillag */
    /* FÉLCSILLAGONKÉNT LÉP: 4,2 és 4,4 ugyanoda kerekedik (4,0 ill. 4,5). */
    ki.lepcso={_4_2:g(4.2),_4_0:g(4.0),_4_4:g(4.4),_4_5:g(4.5)};
    return ki;});

  console.log("=== 1. hány keresés egy nyáron ===");
  {const rossz=letra.runs.filter(r=>r.kapott!==r.vart);
   ok(rossz.length===0,`mind a ${letra.runs.length} töréspont a kérés táblázatát adja`,
      rossz.length?rossz:undefined);}
  ok(letra.runsAlatt.every(r=>r.kapott===0),
     "négy csillag ALATT nincs keresés",letra.runsAlatt);

  console.log("=== 2. a gap-létra ===");
  ok(JSON.stringify(letra.gap.s4)==="[15,25]","4★ → 15-25%",letra.gap.s4);
  ok(JSON.stringify(letra.gap.s10)==="[30,40]","10★ → 30-40%",letra.gap.s10);
  ok(JSON.stringify(letra.gap.s20)==="[50,60]","20★ → 50-60%",letra.gap.s20);
  ok(JSON.stringify(letra.gap.s7)==="[22.5,32.5]",
     "…és a köztes érték lineáris: 7★ → 22,5-32,5%",letra.gap.s7);
  ok(JSON.stringify(letra.gap.s15)==="[40,50]","15★ → 40-50%",letra.gap.s15);
  ok(JSON.stringify(letra.gap.alatta)==="[15,25]",
     "négy csillag alatt a padló a nyitó érték",letra.gap.alatta);
  ok(letra.gap.s30[0]>letra.gap.s20[0],
     "húsz fölött tovább nő (a felső szakasz meredekségével)",letra.gap.s30);
  ok(JSON.stringify(letra.lepcso._4_2)===JSON.stringify(letra.lepcso._4_0)
     &&JSON.stringify(letra.lepcso._4_4)===JSON.stringify(letra.lepcso._4_5)
     &&JSON.stringify(letra.lepcso._4_0)!==JSON.stringify(letra.lepcso._4_5),
     "FÉLCSILLAGONKÉNT lép, nem folytonosan",letra.lepcso);

  /* ---- 3-7. KARRIERBEN ---- */
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
    addLine=()=>{};saveGame=()=>{};
    /* A SCOUT a POT-felmérési keretet adja (computeRevealBudget) — a
       pyramis-bootstrap nem sorsol egyet, a valódi karrierben viszont mindig
       van. Enélkül a próba a saját hiányos állapotát mérné. */
    if(!scout)scout=generateScout();

    /* A KAPU KÉT FELE, KÜLÖN-KÜLÖN. A csapaterőt a felállásból számolja a
       teamStrength, ezért függvényt cserélünk — a kapu ebből olvas. */
    let OVR=80, STARS=1;
    teamStrength=()=>OVR;
    agencyStars=()=>STARS;
    const allap=()=>({nyitva:starMarketUnlocked(),miert:starMarketWhy()});
    ki.kapu={};
    OVR=80;STARS=1;   ki.kapu.semmi=allap();
    OVR=120;STARS=1;  ki.kapu.csakOvr=allap();
    OVR=80;STARS=6;   ki.kapu.csakCsillag=allap();
    OVR=109.9;STARS=6;ki.kapu.hajszal=allap();
    OVR=110;STARS=4;  ki.kapu.eppen=allap();
    OVR=130;STARS=8;  ki.kapu.boven=allap();

    /* ---- 4. CSAK NYÁRON ---- */
    OVR=130;STARS=6;
    const gomb=()=>{const b=document.getElementById("hubStarMarketBtn");
      renderHub();
      return {tiltva:!!b.disabled,felirat:(b.querySelector("small")||{}).textContent||""};};
    S.seasonClosed=true;hubMidSeasonMode=false;preSeasonHubMode=false;
    seasonInProgress=()=>false;S.twWindow=null;
    ki.nyaron=gomb();
    seasonInProgress=()=>true;              /* fut a szezon */
    ki.szezonKozben=gomb();
    seasonInProgress=()=>false;
    S.twWindow={round:8,label:"Rövid átigazolási időszak"};
    ki.ablakban=gomb();                     /* szezonközi ablak — az sem */
    S.twWindow=null;
    preSeasonHubMode=true;ki.elsoElott=gomb();preSeasonHubMode=false;
    /* és a zárt kapu felirata */
    OVR=80;ki.zartKapu=gomb();OVR=130;

    /* ---- 5. A NYÁRI KERET ---- */
    STARS=6;                                /* 5,5-6 → 2 keresés */
    S.summerLooks=null;S.seasonNumber=1;
    ki.keret={max:starMarketMax(),left0:starMarketLeft()};
    starMarketSpend();
    ki.keret.left1=starMarketLeft();
    starMarketSpend();
    ki.keret.left2=starMarketLeft();
    ki.keret.tulkoltes=starMarketSpend();   /* nullán már nem fogy */
    ki.keret.left3=starMarketLeft();
    /* KÖZBEN FEJLESZTÜNK: az ELKÖLTÖTT alkalom a fix pont */
    STARS=7;                                /* 6,5-7 → 3 keresés */
    ki.keret.fejlesztesUtan={max:starMarketMax(),left:starMarketLeft()};
    /* ÚJ NYÁR: tiszta lappal */
    S.seasonNumber=2;S.summerLooks=null;
    ki.keret.ujNyar={max:starMarketMax(),left:starMarketLeft()};

    /* ---- 6. AZ ÉLŐ KERESÉS ---- */
    STARS=20;                               /* nagy gap, hogy mérhető legyen */
    S.transferBudget=1e12;                  /* az ár ne szűrjön */
    const sav=signingBand();
    TW={cycle:1,category:null,candidates:[],retries:0,maxCycles:1,
        label:"Sztár piac",isHubPurchase:true,searchMode:"star",searchAttr:null};
    twScout();
    const c=(TW.candidates||[]).map(x=>({n:x.n,pos:x.pos.slice(),
      ovr:(careerPool[x.n]&&careerPool[x.n].startRating)||x.ovr}));
    const szerep=n=>{try{return getCategoryFor(careerPool[n].pos[0]);}catch(e){return "?";}};
    ki.kereses={db:c.length,
      szerepek:c.map(x=>szerep(x.n)),
      kulonbozo:new Set(c.map(x=>szerep(x.n))).size,
      savHi:Math.round(sav.hi),
      ovrs:c.map(x=>Math.round(x.ovr)),
      savFolott:c.filter(x=>x.ovr>sav.hi).length};
    /* ÖSSZEHASONLÍTÁS: ugyanaz a keret, RENDES poszt-keresés — a sztár piac
       találatai legyenek magasabbak. Ez az egyetlen állítás, ami tényleg azt
       méri, hogy a rendszer a SÁV FÖLÉ mutat. */
    const rendes=[];
    for(let i=0;i<40;i++)rendes.push(rollSigningTarget());
    ki.kereses.rendesAtlag=Math.round(rendes.reduce((a,x)=>a+x,0)/rendes.length);
    ki.kereses.sztarAtlag=c.length?Math.round(c.reduce((a,x)=>a+x.ovr,0)/c.length):0;

    /* ---- 7. MINDEN MÓDBAN UGYANAZ ---- */
    OVR=130;STARS=12;
    const mod=()=>({nyitva:starMarketUnlocked(),runs:starMarketRuns(),
      gap:[Math.round(starMarketGap().lo*100),Math.round(starMarketGap().hi*100)]});
    ki.modok={};
    S.pyr=null;infinityMode=false;
    ki.modok.alap=mod();
    S.pyr={on:true,my:3,divs:[],above:0};
    ki.modok.piramis=mod();
    S.pyr=null;infinityMode=true;
    ki.modok.infinity=mod();
    infinityMode=false;
    h2hRoomActive=()=>true;
    ki.modok.kozos=mod();
    h2hRoomActive=()=>false;
    return ki;});

  console.log("=== 3. a két kapu ===");
  ok(t.kapu.semmi.nyitva===false&&/csapaterő/.test(t.kapu.semmi.miert),
     "semmi sincs meg → a CSAPATERŐT kéri először",t.kapu.semmi);
  ok(t.kapu.csakOvr.nyitva===false&&/ügynökség/.test(t.kapu.csakOvr.miert),
     "csak a csapaterő van meg → az ügynökséget kéri",t.kapu.csakOvr);
  ok(t.kapu.csakCsillag.nyitva===false&&/csapaterő/.test(t.kapu.csakCsillag.miert),
     "csak a csillag van meg → a csapaterőt kéri",t.kapu.csakCsillag);
  ok(t.kapu.hajszal.nyitva===false,"109,9 csapaterő még nem elég",t.kapu.hajszal);
  ok(t.kapu.eppen.nyitva===true&&t.kapu.eppen.miert==="",
     "pontosan 110 és pontosan 4★ → NYITVA",t.kapu.eppen);
  ok(t.kapu.boven.nyitva===true,"fölötte is nyitva",t.kapu.boven);

  console.log("=== 4. csak nyáron ===");
  ok(t.nyaron.tiltva===false&&/maradt/.test(t.nyaron.felirat),
     "nyáron elérhető, és kiírja a keretet",t.nyaron);
  ok(t.szezonKozben.tiltva===true&&/nyáron/.test(t.szezonKozben.felirat),
     "futó szezonban tiltva",t.szezonKozben);
  ok(t.ablakban.tiltva===true&&/szezonközi/.test(t.ablakban.felirat),
     "szezonközi ablakban is tiltva — ez a nyár piaca",t.ablakban);
  ok(t.elsoElott.tiltva===true,"az első szezon előtt sem",t.elsoElott);
  ok(t.zartKapu.tiltva===true&&/csapaterő/.test(t.zartKapu.felirat),
     "zárt kapunál a felirat megmondja, MI hiányzik",t.zartKapu);

  console.log("=== 5. a nyári keret ===");
  ok(t.keret.max===2&&t.keret.left0===2,"6★ → 2 keresés",t.keret);
  ok(t.keret.left1===1&&t.keret.left2===0,"fogy",t.keret);
  ok(t.keret.tulkoltes===false&&t.keret.left3===0,"nullán nem megy mínuszba",t.keret);
  ok(t.keret.fejlesztesUtan.max===3&&t.keret.fejlesztesUtan.left===1,
     "közbeni fejlesztés: a max nő, az ELKÖLTÖTT kettő megmarad",t.keret.fejlesztesUtan);
  ok(t.keret.ujNyar.left===t.keret.ujNyar.max&&t.keret.ujNyar.max===3,
     "új nyáron tiszta lap",t.keret.ujNyar);

  console.log("=== 6. az élő keresés ===");
  ok(t.kereses.db===4,"négy találat",t.kereses.db);
  ok(t.kereses.kulonbozo===4,
     "…négy KÜLÖNBÖZŐ poszton: kapus · védő · középpályás · csatár",t.kereses.szerepek);
  ok(t.kereses.sztarAtlag>t.kereses.rendesAtlag,
     "a találatok átlaga a RENDES keresés célértéke fölött van",
     {sztar:t.kereses.sztarAtlag,rendes:t.kereses.rendesAtlag,savHi:t.kereses.savHi});
  ok(t.kereses.savFolott>=1,
     "…és legalább egyikük az alap sáv TETEJE fölött",t.kereses);

  console.log("=== 7. minden módban ugyanaz ===");
  {const a=JSON.stringify(t.modok.alap);
   ok(["piramis","infinity","kozos"].every(k=>JSON.stringify(t.modok[k])===a),
      "piramis · Infinity · közös karrier — betűre ugyanaz",t.modok);
   ok(t.modok.alap.nyitva===true&&t.modok.alap.runs>0,
      "…és nem úgy, hogy mindenhol zárva van",t.modok.alap);}

  console.log("=== hibák a konzolon ===");
  ok(errs.length===0,"nincs futásidejű hiba",errs.slice(0,2));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
