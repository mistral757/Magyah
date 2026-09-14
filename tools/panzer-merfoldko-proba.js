/* 🛡️ A PANZER MÉRFÖLDKÖVEI (3.9.71)

   BEJELENTETT HIBA: „a panzernek stílus mérföldkövei sincsenek szinte
   egyáltalán. […] Legyenek a többihez hasonló, jól teljesíthető, sok lépcsős
   mérföldkövek, amiket fun gyűjteni és kiadnak legalább annyit mint a
   többinél szerezhető pontokban."

   A PRÓBA ELSŐ ÁLLÍTÁSA EZÉRT ÖSSZEHASONLÍTÓ, nem abszolút: a Panzer táblája
   ne egy kézzel beírt számot érjen el, hanem a MEZŐNY legjobbját — így a
   szabály akkor is érvényes marad, ha bármelyik másik filozófia táblája
   változik. A többi ág azt méri, hogy az új számlálók VALÓDIAK: futnak,
   számot adnak, fizetnek, és nem szivárognak át más filozófiába.

   Használat: node tools/panzer-merfoldko-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8947'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8947/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── 1. A TÁBLÁK MÉRLEGE ── */
    const tabla={};
    Object.keys(STYLE_MILESTONES).forEach(k=>{
      const L=STYLE_MILESTONES[k];
      const fam={};L.forEach(d=>{fam[d.fam||("_"+d.id)]=1;});
      tabla[k]={sor:L.length,pont:L.reduce((a,d)=>a+d.val,0),csalad:Object.keys(fam).length};});
    o.tabla=tabla;

    /* ── 2. AZ ÚJ CSALÁDOK ── */
    const ujak=["pz_ycall","pz_ycseason","pz_ycmatch","pz_dread","pz_fear",
                "pz_injall","pz_giant","pz_long","pz_redwinN"];
    o.ujCsalad=ujak.map(f=>{
      const sor=STYLE_MILESTONES.panzer.filter(d=>d.fam===f);
      return {f,n:sor.length,v:sor.reduce((a,d)=>a+d.val,0),
        nev:sor.length?sor[0].famT:null,
        /* NÖVEKVŐ küszöbök és NÖVEKVŐ jutalom — egy lépcsőnek monotonnak kell lennie */
        noKuszob:sor.every((d,i)=>i===0||d.n>sor[i-1].n),
        noErtek:sor.every((d,i)=>i===0||d.val>=sor[i-1].val),
        /* van saját neve a panel összevont sorához */
        vanNev:!!sor[0]&&!!sor[0].famT&&sor[0].famT!==sor[0].t};});

    /* ── 3. A SZÁMLÁLÓK ÉLESBEN ── */
    gameMode="career";phase="hub";
    S.seasonNumber=4;S.idx=10;
    S.careerStats={"A":{yc:40,rc:3,inj:6},"B":{yc:25,rc:1,inj:4}};
    S.seasonYellows={"A":12,"B":7};
    S.ms={done:{},seen:{},sp:0,spEarned:0,cash:0,log:[],t:{},cats:{},missed:{},pend:{}};
    msT().maxMatchYc=5;msT().maxSeasonYc=0;msT().giantKills=9;msT().redWins=3;
    S.style={key:"panzer",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2=null;S.styleView=1;
    /* félelem: egy nyolcfős, nagyon negatív keret */
    careerPool={};
    const roster=[];
    for(let i=0;i<8;i++){const n="Szörny "+i;
      careerPool[n]={n,pos:["KV"],karI:0,kapI:0,verI:VER_LEVELS.length-1};
      roster.push({n,pos:["KV"],ovr:80});}
    window.fullCareerRoster=()=>roster;
    S.style.fear={pts:120,earned:860,spent:740,retteges:2,mods:3};
    S.tactics=S.tactics||{};
    window.tacticLevel=(k)=>k==="hosszu"?97:40;

    o.merok={
      ycAll:stCareerSum("yc"),
      ycSeason:pzYcSeason(),
      ycMatch:msT().maxMatchYc||0,
      dread:pzDreadEarned(),
      fear:pzFearLevel(),
      injAll:stCareerSum("inj"),
      giant:msT().giantKills||0,
      long:pzLongLevel(),
      redWins:msT().redWins||0};

    /* az IDÉNY sárgája nem eshet vissza idényfordulón: a valaha volt legjobb tartja */
    msT().maxSeasonYc=31;S.seasonYellows={};
    o.ycSeasonTart=pzYcSeason();
    S.seasonYellows={"A":12,"B":7};msT().maxSeasonYc=0;

    /* ── 4. FIZETNEK-E ── */
    const elotte=msState().sp||0;
    styleScan();
    const done=styleMsStateIn(S.style).done;
    o.fizet={sp:(msState().sp||0)-elotte,
      teljesitett:Object.keys(done).length,
      /* pontosan azok, amiknek a fenti számokkal teljesülniük KELL */
      van:{ycall:!!done.pz_ycall_15,ycseason:!!done.pz_ycseason_10,
           ycmatch:!!done.pz_ycmatch_4,dread:!!done.pz_dread_700,
           fear:!!done.pz_fear_130,inj:!!done.pz_injall_8,
           giant:!!done.pz_giant_7,long:!!done.pz_long_95,
           redwin:!!done.pz_redwinN_2},
      /* …és azok, amiknek NEM (a következő fokozat) */
      nincs:{ycall:!!done.pz_ycall_80,dread:!!done.pz_dread_1200,
             fear:!!done.pz_fear_190,long:!!done.pz_long_99}};

    /* ── 5. NEM SZIVÁROG ÁT ── */
    o.masStilus=Object.keys(STYLE_MILESTONES).filter(k=>k!=="panzer")
      .some(k=>STYLE_MILESTONES[k].some(d=>/^pz_/.test(d.id)));

    /* ── 6. A MÉRŐK HIBATŰRŐK: üres állapoton is számot adnak ── */
    S.careerStats={};S.seasonYellows=null;S.style=null;
    o.ures={ycAll:stCareerSum("yc"),ycSeason:pzYcSeason(),
      dread:pzDreadEarned(),fear:pzFearLevel(),long:pzLongLevel()};
    return o;});

  console.log("=== a mérleg: a Panzer utolérte a mezőnyt ===");
  const T=r.tabla,tobbi=Object.keys(T).filter(k=>k!=="panzer");
  const max=Math.max(...tobbi.map(k=>T[k].pont));
  const legjobb=tobbi.find(k=>T[k].pont===max);
  console.log("  " + Object.keys(T).sort((a,b)=>T[b].pont-T[a].pont)
    .map(k=>`${k}:${T[k].pont}`).join(" · "));
  ok(`a Panzer táblája eléri a mezőny legjobbját (${legjobb}: ${max})`,
     T.panzer.pont>=max,{panzer:T.panzer.pont,legjobb,max});
  ok("és nem egy-két nagy tétellel, hanem SOK LÉPCSŐVEL: a sorok száma is a mezőny élén",
     T.panzer.sor>=Math.max(...tobbi.map(k=>T[k].sor))
     ||T.panzer.sor>=140,{panzer:T.panzer.sor,tobbi:tobbi.map(k=>T[k].sor)});
  ok("a családok száma is felzárkózott (volt 21)",T.panzer.csalad>=28,T.panzer);

  console.log("\n=== a kilenc új család ===");
  r.ujCsalad.forEach(c=>{
    ok(`${c.f} — ${c.nev} · ${c.n} fokozat · ${c.v} pont`,
       c.n>=3&&c.v>0&&c.noKuszob&&c.noErtek&&c.vanNev,c);});
  ok("együtt legalább 1000 pontot hoznak",
     r.ujCsalad.reduce((a,c)=>a+c.v,0)>=1000,
     {osszeg:r.ujCsalad.reduce((a,c)=>a+c.v,0)});

  console.log("\n=== a számlálók élesben ===");
  ok("a sárga lap három szinten mérődik: karrier, idény, EGY mérkőzés",
     r.merok.ycAll===65&&r.merok.ycSeason===19&&r.merok.ycMatch===5,r.merok);
  ok("az idény sárgája nem esik vissza idényfordulón — a valaha volt legjobb tartja",
     r.ycSeasonTart===31,{tart:r.ycSeasonTart});
  ok("a rettenet-gazdaság két száma a fear-blokkból jön",
     r.merok.dread===860&&r.merok.fear>0,r.merok);
  ok("a sérülés, az óriásölés és a Hosszú labdák is számot ad",
     r.merok.injAll===10&&r.merok.giant===9&&r.merok.long===97,r.merok);

  console.log("\n=== fizetnek-e ===");
  ok("a pásztázás stíluspontot fizet a Panzer új lépcsőiért",
     r.fizet.sp>0&&r.fizet.teljesitett>=9,r.fizet);
  ok("mind a kilenc új család első teljesíthető fokozata befut",
     Object.values(r.fizet.van).every(Boolean),r.fizet.van);
  ok("…és a következő fokozatuk NEM (a lépcső tényleg lépcső)",
     Object.values(r.fizet.nincs).every(v=>v===false),r.fizet.nincs);

  console.log("\n=== a határok ===");
  ok("egyetlen pz_ sor sem szivárgott át másik filozófiába",r.masStilus===false);
  ok("és üres állapoton is számot adnak, nem hibát",
     r.ures.ycAll===0&&r.ures.ycSeason===0&&r.ures.dread===0
     &&r.ures.fear===0&&typeof r.ures.long==="number",r.ures);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
