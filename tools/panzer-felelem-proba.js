/* ☠️ PANZER: FORDÍTOTT JELLEM, FÉLELEM ÉS RETTENET (3.9.68)
   + az egyenlítő 250 perces belépője

   A Panzer eddig a legkevésbé választott filozófia volt (a diagnózis szerint a
   belépője egy 2,06%-os draft-lottó, a jutalma a legszegényebb fa). Ez a három
   rendszer fordítja meg: a jellem HATÁSA megfordul, a negatív keret FÉLELEM
   SZINTET termel, a félelem pedig RETTENET PONTOT, amiből a keret még
   ijesztőbbé tehető — önmagát hajtó kör.

   A PRÓBA A SZÁMTANT ÉS A HATÁRT MÉRI: a fordítás két ágát szintenként, a
   félelem szint két tényezőjét (keret + stílus-szint), a meccsenkénti plafont,
   a rettenet-tételeket, a Rettegés százalékát és a +20-as sapkát — és azt,
   hogy MÁS filozófiában egyik sem létezik.

   Használat: node tools/panzer-felelem-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8934'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8934/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";
    S.seasonNumber=6;S.careerStats={};
    careerPool={};
    /* A díszlet: egy „szörnyeteg", egy „jó fej" és egy semleges. */
    const mk=(n,kar,kap,ver,min)=>{
      careerPool[n]={n,pos:["KV"],nat:"Magyarország",startRating:80,peak:80,pot:3000,age:26,
        karI:kar,kapI:kap,verI:ver};
      S.careerStats[n]={matches:9,min:min,g:0,a:0};
      return careerPool[n];};
    const szorny=mk("Szörny Sándor",0,0,VER_LEVELS.length-1,900);       /* minden negatív */
    const jofej =mk("Jófej József",KAR_LEVELS.length-1,KAP_LEVELS.length-1,0,900);
    const semmi =mk("Semleges Samu",3,4,4,900);
    const ujonc =mk("Újonc Ubul",3,4,4,120);                            /* 120 perc */
    window.fullCareerRoster=()=>Object.keys(careerPool).map(n=>({n,pos:["KV"],ovr:80}));
    window.currentRoster=()=>[];window.extraRoster=[];

    /* ── 1. A FORDÍTÁS ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2=null;S.styleView=1;
    o.nemPanzer={szorny:Math.round(kapE(szorny)*100)/100,jofej:Math.round(kapE(jofej)*100)/100,
      morSzorny:Math.round(moraleTraitBase(szorny)*100)/100,
      morJofej:Math.round(moraleTraitBase(jofej)*100)/100};
    S.style={key:"panzer",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    const mer=()=>({sz:Math.round(kapE(szorny)*1000)/1000,jo:Math.round(kapE(jofej)*1000)/1000,
      verSz:Math.round(verE(szorny)*1000)/1000});
    o.alap=mer();
    const szintek=[];
    [1,2,3].forEach(lv=>{S.style.traits.abs_jellem=lv;szintek.push(Object.assign({lv},mer()));});
    o.kepesseg=szintek;
    delete S.style.traits.abs_jellem;
    /* a karizma NEM fordul */
    o.karizma={szorny:Math.round(karN(szorny)*1000)/1000,jofej:Math.round(karN(jofej)*1000)/1000};
    /* és a lapkockázat sem */
    o.lap={szorny:Math.round(redRiskOf(szorny)*100)/100,jofej:Math.round(redRiskOf(jofej)*100)/100};

    /* ── 2. A FÉLELEM SZINT ── */
    o.felelem={};
    o.felelem.bazis=Math.round(fearBase()*10)/10;
    /* a stílus szintje nagyítja: 1. szinten fele, 20.-on kétszerese */
    const eredetiLevel=window.styleLevel;
    window.styleLevel=()=>1;  o.felelem.lvl1=fearLevel();
    window.styleLevel=()=>20; o.felelem.lvl20=fearLevel();
    window.styleLevel=()=>10; o.felelem.lvl10=fearLevel();
    o.felelem.cap10=fearMatchCap();
    /* aki eladja a szörnyet, annak esik */
    const ment=careerPool["Szörny Sándor"];
    delete careerPool["Szörny Sándor"];
    o.felelem.szornyNelkul=fearLevel();
    careerPool["Szörny Sándor"]=ment;

    /* ── 3. A RETTENET PONTOK ── */
    /* A TÉTELEK MÉRÉSÉHEZ a plafont félretesszük — külön ágon mérjük, hogy fog. */
    const eredetiCap=window.fearMatchCap;
    window.fearMatchCap=()=>999;
    fearMatchStart();
    fearNote("yellow");fearNote("yellow");   /* 1,0 */
    fearNote("red");                         /* 2,0 */
    fearNote("hat");                         /* 1,0 */
    fearNote("hard");                        /* 0,5 */
    for(let i=0;i<5;i++)fearNote("tackle");  /* 0,5 */
    const F=fearState();F.pts=0;
    const kap1=fearMatchEnd();               /* 5,0 — plafon nélkül */
    window.fearMatchCap=eredetiCap;
    o.rettenet={egyMeccs:kap1,pts:F.pts,cap:fearMatchCap()};
    /* a plafon tényleg fog: egy irreálisan erőszakos meccs se ad többet */
    F.pts=0;
    fearMatchStart();
    for(let i=0;i<50;i++)fearNote("red");
    const kap2=fearMatchEnd();
    o.rettenet.plafon={kapott:kap2,cap:fearMatchCap()};

    /* ── 4. A RETTEGÉS ── */
    F.pts=100000;F.retteges=0;
    o.retteges={};
    o.retteges.zartAzElso=rettegesNextWhy();      /* 10. szinten már nem szint a gát */
    window.styleLevel=()=>4;
    o.retteges.negyediken=rettegesNextWhy();
    window.styleLevel=()=>5;
    o.retteges.otodiken=rettegesNextWhy();
    /* vegyük meg mind a tízet, ha a szint engedi */
    const ivek=[];
    for(let i=1;i<=RETTEGES_MAX;i++){
      window.styleLevel=()=>rettegesNeedLevel(i);
      if(rettegesNextWhy())break;
      dreadSpend(rettegesNextPrice());
      F.retteges=i;
      ivek.push({lv:i,pct:Math.round((RETTEGES_PCT[i])*1000)/10,ovr:fearOvrBonus()});}
    o.retteges.ivek=ivek;
    /* a plafon: 14-es stílusszintig +20, onnan szintenként +4 → 20-on +44 (3.9.139) */
    const eredetiBase=window.fearBase;
    window.fearBase=()=>100000;
    window.styleLevel=()=>14;
    o.retteges.plafon14=fearOvrBonus();
    window.styleLevel=()=>20;
    o.retteges.plafon=fearOvrBonus();
    window.fearBase=eredetiBase;
    window.styleLevel=eredetiLevel;

    /* ── 5. A BOLT ── */
    F.pts=1000;
    const v0=verI(semmi),k0=kapI(semmi),r0=karI(semmi);
    const a=dreadModApply("Semleges Samu","ver");
    const bb=dreadModApply("Semleges Samu","kap");
    const c=dreadModApply("Semleges Samu","kar");
    o.bolt={ver:{elotte:v0,utana:verI(semmi),ok:a&&a.ok},
      kap:{elotte:k0,utana:kapI(semmi),ok:bb&&bb.ok},
      kar:{elotte:r0,utana:karI(semmi),ok:c&&c.ok},
      koltseg:1000-F.pts};
    /* a szélén álló embert nem lehet tovább tolni */
    o.bolt.szel=dreadModApply("Szörny Sándor","ver");

    /* ── 6. AZ EGYENLÍTŐ 250 PERCES BELÉPŐJE ── */
    o.perc={
      regi:eqEligible("Semleges Samu"),
      ujonc:eqEligible("Újonc Ubul"),
      indok:eqWhyNot("Újonc Ubul"),
      /* és a végrehajtás is szűr: két régi + egy újonc → csak a kettő megy át */
      vegrehajtas:(()=>{
        S.style2={key:"harmonia",chosenSeason:1,traits:{egyenlito:3},ms:{done:{},seen:{},t:{}},star:null};
        careerPool["Semleges Samu"].startRating=80;
        careerPool["Jófej József"].startRating=120;
        careerPool["Újonc Ubul"].startRating=200;   /* a felhúzó */
        const res=applyEqualizeBoost(["Semleges Samu","Jófej József","Újonc Ubul"],3);
        return res?{cel:res.cel,db:res.sorok.length}:null;})()};

    /* ── 7. MÁS FILOZÓFIÁBAN NINCS SEMMI ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2=null;
    o.nelkul={fear:fearOn(),szint:fearLevel(),ovr:fearOvrBonus(),abs:panzerAbsOn(),
      allapot:!!fearState()};
    return o;});

  console.log("=== a jellem fordítása ===");
  ok("más filozófiában semmi nem változik",
     r.nemPanzer.szorny===0&&r.nemPanzer.jofej===1&&r.nemPanzer.morSzorny<0&&r.nemPanzer.morJofej>0,
     r.nemPanzer);
  ok("Panzernél ALAPBÓL megfordul: a szörnyeteg lesz a jó hatás",
     r.alap.sz===1&&r.alap.jo===0,r.alap);
  ok("a forró vérmérséklet is megfordul (a hatás-oldalon nyugodttá válik)",
     r.alap.verSz===0,r.alap);
  {const K=r.kepesseg;
   ok("1. szint: a fordított pozitív +10%, a fordított negatív −75%",
      K[0].sz===1&&Math.abs(K[0].jo-(0.5-0.5*0.25))<0.002,K[0]);
   ok("2. szint: −110% → a „jó fej” hatása ÁTFORDUL pozitívba",
      K[1].jo>0.5&&Math.abs(K[1].jo-(0.5+0.5*0.10))<0.002,K[1]);
   ok("3. szint: −150% → még inkább pozitívba",
      Math.abs(K[2].jo-(0.5+0.5*0.50))<0.002,K[2]);}
  ok("a KARIZMA nem fordul meg (a kérés kimondottan kiveszi)",
     r.karizma.szorny===0&&r.karizma.jofej===1,r.karizma);
  ok("és a LAPKOCKÁZAT sem — a Panzer épp abból él",
     r.lap.szorny>r.lap.jofej,r.lap);

  console.log("\n=== a félelem szint ===");
  ok("a bázis a keret negatív jellemeiből számol",r.felelem.bazis>0,r.felelem.bazis);
  ok("a csapatstílus-szint nagyítja fel: 1. szinten fele, 20.-on kétszerese",
     Math.abs(r.felelem.lvl1-r.felelem.bazis*0.5)<1
     &&Math.abs(r.felelem.lvl20-r.felelem.bazis*2)<1,r.felelem);
  ok("a meccsenkénti plafon a szint 10%-a",
     Math.abs(r.felelem.cap10-r.felelem.lvl10*0.1)<0.2,r.felelem);
  ok("aki eladja a szörnyeteget, annak AZONNAL esik a félelme",
     r.felelem.szornyNelkul<r.felelem.lvl10,r.felelem);

  console.log("\n=== a rettenet pontok ===");
  ok("a tételek a kimondott súlyokkal gyűlnek (2 sárga + piros + mesterhármas + belépő + 5 villanás = 5,0)",
     r.rettenet.egyMeccs===5,r.rettenet);
  ok("a meccsenkénti plafon tényleg fog",
     r.rettenet.plafon.kapott===r.rettenet.plafon.cap,r.rettenet.plafon);

  console.log("\n=== a Rettegés ===");
  ok("az 1. szint a 4. csapatstílus-szinten még zárva, az 5.-en nyílik",
     /csapatst/.test(r.retteges.negyediken)&&r.retteges.otodiken==="",
     {negyedik:r.retteges.negyediken,otodik:r.retteges.otodiken});
  ok("mind a 10 szint megvehető, és a százalék nő",
     r.retteges.ivek.length===10&&r.retteges.ivek[9].pct===15
     &&r.retteges.ivek[0].pct===2,r.retteges.ivek);
  ok("a meccserő 14-es stílusszintig +20-nál áll meg, a 20.-on +44-nél (3.9.139)",
     r.retteges.plafon14===20&&r.retteges.plafon===44,{L14:r.retteges.plafon14,L20:r.retteges.plafon});

  console.log("\n=== a bolt ===");
  ok("This is Sparta! egy fokozattal durvítja a vérmérsékletet",
     r.bolt.ver.ok===true&&r.bolt.ver.utana===r.bolt.ver.elotte+1,r.bolt.ver);
  ok("Senkit se szerettem! egy fokozattal zárkózottabbá tesz",
     r.bolt.kap.ok===true&&r.bolt.kap.utana===r.bolt.kap.elotte-1,r.bolt.kap);
  ok("Háború istene egy fokozattal emeli a karizmát, KÉTSZER annyiért",
     r.bolt.kar.ok===true&&r.bolt.kar.utana===r.bolt.kar.elotte+1
     &&r.bolt.koltseg===40+40+80,r.bolt);
  ok("aki a skála szélén áll, azt nem lehet tovább tolni",
     r.bolt.szel&&r.bolt.szel.ok===false,r.bolt.szel);

  console.log("\n=== az egyenlítő 250 perces belépője ===");
  ok("a régi játékos beleszámít, a friss igazolás nem",
     r.perc.regi===true&&r.perc.ujonc===false,r.perc);
  ok("és kimondja, mennyi hiányzik",/120\/250 perc/.test(r.perc.indok),r.perc.indok);
  /* A 200-as Ubul nélkül: átlag 100, rés 20, 75% = 115. HA beszámítana, az
     átlag 133 lenne, a cél 183 — a különbség maga a bizonyíték. */
  ok("a végrehajtás kiszűri a 250 perc alattit — a felhúzó nem emeli a célt",
     r.perc.vegrehajtas&&r.perc.vegrehajtas.db===2&&r.perc.vegrehajtas.cel===115,
     r.perc.vegrehajtas);

  console.log("\n=== más filozófiában ===");
  ok("a félelem, a rettenet és a fordítás mind hallgat",
     r.nelkul.fear===false&&r.nelkul.szint===0&&r.nelkul.ovr===0
     &&r.nelkul.abs===false&&r.nelkul.allapot===false,r.nelkul);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
