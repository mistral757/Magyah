/* 🧲 GEGENPRESSING — A NYOLCADIK FILOZÓFIA (3.9.93).

   Az első stílus, ami nem a LABDÁRÓL szól, hanem arról a pillanatról, amikor
   nincs nálad. Ezért kap saját motor-csatornát: a LABDASZERZÉST AZ ELLENFÉL
   TÉRFELÉN (gpPress*) — ez a csatorna eddig nem létezett, és a stílus egész
   gazdasága erre ül.

   Amit mér:
     1. a regisztráció: a stílus ott van minden táblában (STYLES, edző,
        tengelyek, rangok, feloldás, mstat-súlyok);
     2. a kilenc képesség és a három szerep megvan, és a szintjeik a kimondott
        számokat adják;
     3. a pressing-motor: a várható labdaszerzés szintenként, a szerepek és a
        gyilkos párosok szorzói;
     4. a Büntetés: esély és meccsenkénti plafon, a Lesi Puskás szorzójával;
     5. a „Nem kell nekünk labda" ALKUJA — mindkét fele igaz: a birtoklás
        tényleg lemegy, ÉS az ellenfél gólesélye tényleg felmegy;
     6. a Nyomás! skill: zárolva van, amíg a fán meg nem veszed, és bármely
        poszton megkapható;
     7. a gyilkos páros: kiegyenlítődik a sebesség, együtt fejlődik;
     8. és a legfontosabb: MÁS FILOZÓFIÁBAN egyetlen szám sem mozdul. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9041'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9041/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof gpOn==="function"&&typeof STYLES!=="undefined",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    /* VALÓDI karrier: a szerepek belépői és a gyilkos páros a KERETBŐL
       dolgoznak (msRoster), tehát egy üres világon nem volnának mérhetők. */
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

    /* ---- 1. A REGISZTRÁCIÓ ---- */
    const sd=STYLES.find(x=>x.key==="gegen");
    ki.reg={
      vanStyle:!!sd, nev:sd&&sd.n, ic:sd&&sd.ic,
      edzo:!!(STYLE_COACHES.gegen&&STYLE_COACHES.gegen.name),
      edzoNev:STYLE_COACHES.gegen&&STYLE_COACHES.gegen.name,
      edzoNemzet:STYLE_COACH_NAT[STYLE_COACHES.gegen&&STYLE_COACHES.gegen.name]||null,
      mstatW:!!MSTAT_STYLE_W.gegen,
      mstatWsum:MSTAT_STYLE_W.gegen?+Object.values(MSTAT_STYLE_W.gegen).reduce((a,x)=>a+x,0).toFixed(3):null,
      tengely:!!MSTAT_STYLE_CH.gegen,
      rangok:(STYLE_RANKS.gegen||[]).length,
      feloldas:UNLOCK_STYLE_RUN.gegen||null,
      szerepek:(ROLE_KEYS_OF.gegen||[]).slice(),
      csuszkak:(STYLE_DIALS.gegen||[]).length};

    /* ---- A TEREP: a filozófia bekapcsolva, szintenként állítható ---- */
    const all=(traits)=>{S.style=Object.assign({key:"gegen",traits:{}},{traits:traits||{}});S.style2=null;
      try{roleAttrCacheClear();}catch(e){}
      try{styleLvlCacheClear();}catch(e){}};
    const mind=(lv)=>({nyomasgyakorlas:lv,buntetes:lv,gyilkos_paros:lv,felfutasok:lv,
      kikenyszeritett_hiba:lv,nem_kell_labda:lv,nyomas_skill:lv,sorsolas:lv,
      csillagozhato_nyomas:lv,nyomas_iskola:lv,szerepek:lv});

    /* ---- 2. A KILENC KÉPESSÉG ---- */
    all(mind(3));
    ki.kepessegek=(typeof styleTraitList==="function")
      ?styleTraitList("gegen").map(x=>x.key):null;
    ki.szintek={press:gpPressLv(),punish:gpPunishLv(),duo:gpDuoLv(),
      both:gpBothLv(),err:gpErrLv(),noball:gpNoBallLv(),skill:gpLv("gpSkill")};
    ki.on=gpOn();

    /* ---- 3. A PRESSING-MOTOR ---- */
    ki.press={};
    [0,1,2,3].forEach(lv=>{all({nyomasgyakorlas:lv});
      ki.press["lv"+lv]=+gpPressPerMatch(null,45).toFixed(3);});

    /* ---- 4. A BÜNTETÉS ---- */
    ki.punish={};
    [0,1,2,3].forEach(lv=>{all({buntetes:lv});
      ki.punish["lv"+lv]={p:+gpPunishP(null).toFixed(3),cap:gpPunishCap()};});

    /* ---- 5. AZ ALKU ---- */
    ki.alku={};
    [0,1,2,3].forEach(lv=>{all({nem_kell_labda:lv});
      ki.alku["lv"+lv]={own:+gpNoBallOwnMult().toFixed(3),
        possDrop:gpPossDrop(),opp:+gpNoBallOppMult().toFixed(4)};});
    /* és a KIMONDOTT fx-értékek a képességből (ezek hatnak a motorban) */
    all(mind(3));
    ki.alkuFx=(()=>{
      const t=styleTraitList("gegen").find(x=>x.key==="nem_kell_labda");
      return t?t.lv.map(x=>({own:x.fx.ownGoalMult,opp:x.fx.oppGoalMult})):null;})();

    /* ---- 6. A NYOMÁS! SKILL ---- */
    const sk=SKILLS.find(x=>x.id==="gp_press");
    all({});
    const zarva=!skillDeck().some(x=>x.id==="gp_press");
    all({nyomas_skill:1});
    const nyitva=skillDeck().some(x=>x.id==="gp_press");
    ki.skill={van:!!sk,anyCat:!!(sk&&sk.anyCat),zarva,nyitva,
      paceE:(typeof isPaceSkill==="function")&&isPaceSkill(sk)};

    /* ---- 7a. A HÁROM SZEREP ---- */
    all(mind(3));
    ki.szerepDef={};
    ["iranyito","lesipuskas","mergezett"].forEach(k=>{
      const d=ROLE_DEFS[k];
      ki.szerepDef[k]={van:!!d,style:d&&d.style,gazda:(ROLE_ATTR_OF[k]||{}).v,
        v:d&&d.v.slice()};});
    /* a belépők: a Mérgezett egér CSAK a három leggyorsabbra */
    ki.belepo=(()=>{
      const R=msRoster().filter(x=>x&&x.n);
      if(R.length<5)return null;
      const top=Array.from(roleTopSpeedSet());
      const kivul=R.map(x=>x.n).filter(n=>top.indexOf(n)<0);
      return {topDb:top.length,
        topJo:top.every(n=>roleEligible("mergezett",R.find(x=>x.n===n))),
        kivulRossz:kivul.slice(0,5).every(n=>!roleEligible("mergezett",R.find(x=>x.n===n)))};})();
    /* a származtatott gazdák tényleg számot adnak */
    ki.gazda=(()=>{
      const pl=msRoster().find(x=>x&&x.n);
      if(!pl)return null;
      return {ovrkar:Math.round(roleAttrOf(pl,"ovrkar")),
        sebgol:Math.round(roleAttrOf(pl,"sebgol")),
        seb:Math.round(roleAttrOf(pl,"seb"))};})();

    /* ---- 7b. A GYILKOS PÁROS ---- */
    all(mind(3));
    ki.duo=(()=>{
      S.gpDuo={};
      /* két támadó-középpályás a keretből, eltérő sebességgel */
      const jelolt=msRoster().filter(x=>x&&x.n&&gpDuoEligible(x.n)).slice(0,2);
      if(jelolt.length<2)return {err:"nincs két jelölt"};
      const a=jelolt[0].n,b=jelolt[1].n;
      const ea=careerPool[a],eb=careerPool[b];
      ea.attrs.seb=70;eb.attrs.seb=84;
      const ripe=gpDuoRipeNeed();
      const nevek=new Set([a,b]);
      let lepes=0;
      for(let i=0;i<ripe+3&&!gpDuoIsDone(a,b);i++){gpDuoTick(nevek);lepes++;}
      const parA=gpDuoPartner(a),parB=gpDuoPartner(b);
      return {ripe,lepes,kesz:gpDuoIsDone(a,b),
        sebA:Math.round(ea.attrs.seb),sebB:Math.round(eb.attrs.seb),
        parA:parA===b,parB:parB===a,
        /* a közös fejlődés: ha az EGYIKÜKNÉL van Nyomás!, MINDKETTŐ gyorsul */
        devA:+gpSpeedDevMult(a).toFixed(3),devB:+gpSpeedDevMult(b).toFixed(3),
        teamMult:(()=>{
          const act=[{p:{n:a}},{p:{n:b}}];
          return +gpDuoTeamMult(act).toFixed(3);})(),
        /* ha csak az egyikük van pályán, NEM jár a szorzó */
        felMult:+gpDuoTeamMult([{p:{n:a}}]).toFixed(3)};})();

    /* ---- 8. MÁS FILOZÓFIÁBAN SEMMI ---- */
    const semleges=()=>({press:gpPressPerMatch(null,45),punish:gpPunishP(null),
      cap:gpPunishCap(),own:gpNoBallOwnMult(),poss:gpPossDrop(),
      opp:gpNoBallOppMult(),err:gpErrMult(),back:gpBackUpMult("KV"),
      deck:skillDeck().some(x=>x.id==="gp_press")});
    S.style={key:"panzer",traits:{}};S.style2=null;
    ki.panzer=semleges();
    S.style=null;S.style2=null;
    ki.nincs=semleges();
    return ki;});

  console.log("=== 1. a regisztráció ===");
  const r=t.reg;
  ok(r.vanStyle&&r.nev==="Gegenpressing","a stílus ott van a STYLES-ban",{n:r.nev,ic:r.ic});
  ok(r.edzo&&r.edzoNemzet,"van filozófus-edzője, nemzetiséggel",{e:r.edzoNev,n:r.edzoNemzet});
  ok(r.mstatW&&Math.abs(r.mstatWsum-1)<1e-9,"az attribútum-súlyok 1-re összegződnek",r.mstatWsum);
  ok(r.tengely,"van tengely-eltolása (labdatartás, passz, támadás, védekezés)");
  ok(r.rangok===5,"öt rang-fokozat",r.rangok);
  ok(r.feloldas===5,"az 5. karriertől választható",r.feloldas);
  ok(r.szerepek.length===3,"három szezon-szerep",r.szerepek);
  ok(r.csuszkak===5,"öt hangsúly-csúszka",r.csuszkak);

  console.log("=== 2. a képességfa ===");
  console.log("  "+(t.kepessegek||[]).join(" · "));
  const kell=["nyomasgyakorlas","buntetes","gyilkos_paros","felfutasok",
    "kikenyszeritett_hiba","nem_kell_labda","nyomas_skill","sorsolas",
    "csillagozhato_nyomas","nyomas_iskola","szerepek"];
  ok(kell.every(k=>(t.kepessegek||[]).indexOf(k)>=0),
     "mind a kilenc kért képesség + az általánosak megvannak",
     kell.filter(k=>(t.kepessegek||[]).indexOf(k)<0));
  ok(t.on===true,"a filozófia él, ha be van választva");
  ok(Object.values(t.szintek).every(x=>x===3),"mind a hat csatorna a 3. szinten",t.szintek);

  console.log("=== 3. a pressing-motor ===");
  console.log("  "+Object.keys(t.press).map(k=>`${k}: ${t.press[k]}`).join(" · "));
  ok(t.press.lv0===0,"képesség nélkül nincs pressing",t.press.lv0);
  ok(t.press.lv1===2&&t.press.lv2===2.8&&t.press.lv3===3.6,
     "a várható labdaszerzés 2,0 / 2,8 / 3,6 mérkőzésenként",t.press);

  console.log("=== 4. a büntetés ===");
  console.log("  "+Object.keys(t.punish).map(k=>`${k}: ${t.punish[k].p} / ${t.punish[k].cap}`).join(" · "));
  ok(t.punish.lv0.p===0&&t.punish.lv0.cap===0,"képesség nélkül nincs gól belőle");
  ok(t.punish.lv1.p===0.25&&t.punish.lv1.cap===2
   &&t.punish.lv2.p===0.33&&t.punish.lv2.cap===2
   &&t.punish.lv3.p===0.5 &&t.punish.lv3.cap===3,
     "a kimondott számok: 25%/2 · 33%/2 · 50%/3",t.punish);

  console.log("=== 5. a „nem kell nekünk labda” alkuja ===");
  Object.keys(t.alku).forEach(k=>{const x=t.alku[k];
    console.log(`  ${k}: saját gólesély ×${x.own} · birtoklás −${x.possDrop} pont · ellenfél ×${x.opp}`);});
  ok(t.alku.lv1.own===1.05&&t.alku.lv2.own===1.12&&t.alku.lv3.own===1.2,
     "a saját gólesély +5% / +12% / +20%",[t.alku.lv1.own,t.alku.lv2.own,t.alku.lv3.own]);
  ok(t.alku.lv1.possDrop===20&&t.alku.lv2.possDrop===12&&t.alku.lv3.possDrop===5,
     "a birtoklás ára −20 / −12 / −5 pont",[t.alku.lv1.possDrop,t.alku.lv2.possDrop,t.alku.lv3.possDrop]);
  ok(t.alku.lv1.opp>t.alku.lv2.opp&&t.alku.lv2.opp>t.alku.lv3.opp,
     "a KEVESEBB labda tényleg többet ad az ellenfélnek — és a magasabb szint jobb üzlet",
     [t.alku.lv1.opp,t.alku.lv2.opp,t.alku.lv3.opp]);
  ok(t.alkuFx&&t.alkuFx.every((x,i)=>x.own===[1.05,1.12,1.20][i]&&x.opp>1),
     "a képesség fx-értékei is mindkét oldalt viszik (a motor ezekből dolgozik)",t.alkuFx);

  console.log("=== 6. a Nyomás! skill ===");
  ok(t.skill.van,"a skill létezik");
  ok(t.skill.anyCat,"bármely poszton megkapható (anyCat)");
  ok(t.skill.zarva===true,"a képesség nélkül NINCS a pakliban");
  ok(t.skill.nyitva===true,"a „Nyomás skill” megvétele után bekerül");
  ok(t.skill.paceE,"gyorsasági képességnek számít (a Sebesség-tengelyt tolja)");

  console.log("=== 7a. a három szerep ===");
  ["iranyito","lesipuskas","mergezett"].forEach(k=>{
    const d=t.szerepDef[k];
    ok(d.van&&d.style==="gegen"&&d.gazda,
       `${k}: megvan, a gegené, gazda-attribútuma „${d.gazda}”`,d.v);});
  if(t.belepo){
    ok(t.belepo.topDb===3,"a Mérgezett egérre pontosan HÁRMAN jelölhetők",t.belepo.topDb);
    ok(t.belepo.topJo&&t.belepo.kivulRossz,
       "…és pontosan a leggyorsabbak — más nem",t.belepo);}
  if(t.gazda)
    ok(t.gazda.ovrkar>0&&t.gazda.sebgol>0,
       "a két származtatott gazda (Rating+karizma, sebesség+gól) számot ad",t.gazda);

  console.log("=== 7b. a gyilkos páros ===");
  const d=t.duo;
  if(d.err){ok(false,"a kötés nem volt mérhető",d);}
  else{
    console.log(`  ${d.lepes} közös meccs (az összeérés ${d.ripe}) · sebesség 70/84 → ${d.sebA}/${d.sebB}`);
    ok(d.kesz===true,"a kötés kiépül a közös mérkőzésekből");
    ok(d.lepes<=d.ripe,"pontosan az összeérési idő alatt",{lepes:d.lepes,ripe:d.ripe});
    ok(d.sebA===d.sebB,"a sebességük KIEGYENLÍTŐDIK",[d.sebA,d.sebB]);
    ok(d.sebA>84,"…a jobbik FÖLÉ, az azonnali ráadással",d.sebA);
    ok(d.parA&&d.parB,"egymás párjaként tartja őket nyilván");
    ok(d.teamMult>1,"ha MINDKETTEN pályán vannak, erősödik a pressing",d.teamMult);
    ok(d.felMult===1,"ha csak az egyikük, NEM jár a szorzó",d.felMult);}

  console.log("=== 8. más filozófiában egyetlen szám sem mozdul ===");
  const semleges=(x)=>x.press===0&&x.punish===0&&x.cap===0&&x.own===1&&x.poss===0
    &&x.opp===1&&x.err===1&&x.back===1&&x.deck===false;
  ok(semleges(t.panzer),"Panzerrel minden semleges",t.panzer);
  ok(semleges(t.nincs),"filozófia nélkül is",t.nincs);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
