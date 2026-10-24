/* 🎽 3.9.293 — CSAPATSZEREPEK ÉS A TAKTIKA CSÚSZKÁI.

   KÉRÉS: „Csapatépítés menün belül legyen egy pont ahol az összes csapat-
   szerepet be lehet állítani. […] Szabadrúgás lövő […] Szöglet rugó […]
   Tizenegyes rúgó […] Bedobás […] Ezek a meccsmotorba is legyenek beépítve,
   és a szorzókat tovább növelje az, ha csillagozott képességek vannak.
   Legyen saját menüpontja a csapatépítésen belül, a taktika alponton belül a
   hangsúly csúszkáknak. […] adjunk hozzá 5 általános csúszkát minden
   taktikához is […] 1==>5, 60==>150 […] arra adjon szorzót a taktika
   illeszkedés is."

   Amit mér:
     1. az alkalmasság képletei (átlag × skill-szorzó; félkész skill fele
        bónusz; csillagonként +20%);
     2. a rúgó: nincs → régi út; automatikus → a legalkalmasabb; kijelölt a
        pályán → ő; kijelölt nincs a pályán → a legalkalmasabb;
     3. VALÓDI meccseken: a tizenegyest / szabadrúgást a kijelölt rúgja, a
        szöglet-sorban ő áll, a bedobás-sor és -esemény megjelenik;
     4. a pillanatkép: a bedobó −(1–5)%-kal húzza az ellenfél gólesélyét;
     5. a bedobás-animáció jelenete hiba nélkül felépül;
     6. a taktika csúszkái: 60→1 … 150→5; a haszon/kár az ismertségből, az
        illeszkedés szoroz; a keret; taktikánként külön állás; a motorban hat;
     7. a két panel: Csapatszerepek (általános + stílus-szerepek), a Taktika
        alatt a Hangsúly-csúszkák (taktika + stílus) — állítható, mentődik;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9293;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    /* a cserepad és a tartalék feltöltése a pool-ból */
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const tobbi=Object.values(careerPool).filter(e=>e&&!kezdo.has(e.n)&&e.pos&&e.pos.length).slice(0,9);
    BENCH_KEYS.forEach((k,i)=>{const e=tobbi[i];if(!e)return;if(!e.attrs)initPlayerAttrs(e);e.age=21;
      BENCH[k]={n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:21};});
    tobbi.slice(BENCH_KEYS.length).forEach(e=>{if(!e.attrs)initPlayerAttrs(e);extraRoster.push({n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:e.age||24});});});
  await p.waitForTimeout(800);


  const kep=process.argv[2];
  console.log("— 1. az alkalmasság —");
  const t1=await p.evaluate(()=>{
    const p0=slots.find(s=>s.player&&s.pos!=="KP").player;const e=careerPool[p0.n];
    e.attrs.gol=90;e.attrs.passz=70;e.attrs.ved=60;
    S.skills[p0.n]=[];
    const o={};
    o.fkAlap=genRoleScore(p0,genRoleDef("fk")).v;            /* (90+70)/2 = 80 */
    const sk=SKILLS.find(x=>x.id==="mf_fk");
    S.skills[p0.n]=[{skill:sk,stagesCompleted:2,stagesNeeded:2}];
    o.fkKesz=genRoleScore(p0,genRoleDef("fk")).v;            /* 80×1,5 = 120 */
    S.skills[p0.n][0].stagesCompleted=1;
    o.fkFel=genRoleScore(p0,genRoleDef("fk")).v;             /* 80×1,25 = 100 */
    S.skills[p0.n][0].stagesCompleted=2;S.skills[p0.n][0].stars=3;
    o.fk3=genRoleScore(p0,genRoleDef("fk")).v;               /* 80×1,8 = 144 */
    S.skills[p0.n]=[{skill:SKILLS.find(x=>x.id==="fw_coolclose"),stagesCompleted:1,stagesNeeded:1},{skill:SKILLS.find(x=>x.id==="fw_clutch"),stagesCompleted:1,stagesNeeded:1}];
    o.pen=genRoleScore(p0,genRoleDef("pen")).v;              /* 90×1,5 (a jobbik) = 135 */
    S.skills[p0.n]=[{skill:SKILLS.find(x=>x.id==="df_calm_buildup"),stagesCompleted:1,stagesNeeded:1}];
    o.thr=genRoleScore(p0,genRoleDef("throw")).v;            /* (60+70)/2×1,5 = 97,5 */
    S.skills[p0.n]=[{skill:SKILLS.find(x=>x.id==="mf_cross"),stagesCompleted:1,stagesNeeded:1}];
    o.cor=genRoleScore(p0,genRoleDef("corner")).v;           /* 70×1,5 = 105 */
    S.skills[p0.n]=[];
    o.q=[genRoleQ(55),genRoleQ(90),genRoleQ(125),genRoleQ(150)];
    return o;});
  const kb=(a,b)=>Math.abs(a-b)<0.01;
  ok(kb(t1.fkAlap,80)&&kb(t1.fkKesz,120)&&kb(t1.fkFel,100)&&kb(t1.fk3,144),"szabadrúgás: (gól+passz)/2 × Szabadrúgás-mester 1,5 (félkész 1,25; 3★ 1,8)",t1);
  ok(kb(t1.pen,135)&&kb(t1.thr,97.5)&&kb(t1.cor,105),"tizenegyes ×1,5 (ICE COLD a COOL fölött) · bedobás (véd+passz)/2 × Nagylabda 1,5 · szöglet passz × tökéletes beadás 1,5",t1);
  ok(kb(t1.q[0],0)&&kb(t1.q[1],0.5)&&kb(t1.q[2],1)&&kb(t1.q[3],1),"a minőség 55→0, 125→1",t1.q);

  console.log("\n— 2. a rúgó —");
  const t2=await p.evaluate(()=>{
    const xi=slots.filter(s=>s.player).map(s=>({p:s.player}));
    const o={};
    S.genRoles={};o.nincs=genRoleTaker("pen",xi,null);
    S.genRoles={pen:"auto"};const a=genRoleTaker("pen",xi,null);
    const best=xi.filter(x=>x.p.pos[0]!=="KP").map(x=>({n:x.p.n,v:genRoleScore(x.p,genRoleDef("pen")).v})).sort((x,y)=>y.v-x.v)[0];
    o.auto=a&&a.n===best.n;
    const mas=xi.find(x=>x.p.n!==best.n&&x.p.pos[0]!=="KP").p.n;
    S.genRoles={pen:mas};o.kijelolt=genRoleTaker("pen",xi,null).n===mas;
    const benchN=Object.values(BENCH).find(Boolean).n;
    S.genRoles={pen:benchN};o.hianyzik=genRoleTaker("pen",xi,null).n===best.n;
    /* a kiállított nem rúg */
    S.genRoles={pen:mas};const mi=xi.findIndex(x=>x.p.n===mas);
    o.kiallitva=genRoleTaker("pen",xi,i=>i!==mi).n!==mas;
    S.genRoles={};
    return o;});
  ok(t2.nincs===null&&t2.auto&&t2.kijelolt&&t2.hianyzik&&t2.kiallitva,"nincs → régi út · automatikus → a legalkalmasabb · kijelölt → ő · ha nincs a pályán / kiállították → a legalkalmasabb",t2);

  console.log("\n— 3. valódi meccseken —");
  /* a különleges esemény ritka (~2% tizenegyes / meccs): a próba KIKÉNYSZERÍTI —
     a választó a hételemű esemény-súlyokra a kért fajtát adja, a gyakoriság
     pedig a talizmán-szorzón át megnő. A rúgó kiválasztása így is a motoré. */
  const fut=(fajta,db)=>p.evaluate(async([fajta,db])=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const xi=slots.filter(s=>s.player&&s.pos!=="KP").map(s=>s.player.n);
    const R={pen:xi[0],fk:xi[1],corner:xi[2],throw:xi[3]};
    S.genRoles=Object.assign({},R);
    const _wi=window.weightedIndex,_tr=window.talRitkaMult;
    if(fajta!=null){
      window.weightedIndex=function(w,r){return (Array.isArray(w)&&w.length===7)?fajta:_wi.apply(this,arguments);};
      window.talRitkaMult=function(){return 30;};}
    const sorok=[];const _al=window.addLine;window.addLine=function(t){sorok.push(String(t));return _al.apply(this,arguments);};
    const spt0={};xi.forEach(n=>{spt0[n]=((S.careerStats[n]||{}).spt)||0;});
    const i0=S.idx;S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<20000&&S.idx<i0+db&&S.idx<30;i++)await varj(20);
    S.auto=false;await varj(1200);
    window.addLine=_al;window.weightedIndex=_wi;window.talRitkaMult=_tr;
    const sn=n=>shortName(n),tx=t=>t.replace(/<[^>]+>/g,"");
    const tiz=sorok.filter(t=>/TIZENEGYES!|Tizenegyes! /.test(t)&&!/ellenünk/.test(t)).map(tx);
    const szr=sorok.filter(t=>/SZABADRÚGÁSGÓL!|Szabadrúgás — /.test(t)).map(tx);
    const spt={};xi.forEach(n=>{spt[n]=(((S.careerStats[n]||{}).spt)||0)-spt0[n];});
    const sptOssz=Object.values(spt).reduce((a,b)=>a+b,0);
    return {meccs:S.idx-i0,R,tiz:tiz.length,tizJo:tiz.filter(t=>t.indexOf(sn(R.pen))>=0).length,
      szr:szr.length,szrJo:szr.filter(t=>t.indexOf(sn(R.fk))>=0).length,
      sptOssz,sptKijelolt:spt[R.corner]+spt[R.throw],sptBedob:spt[R.throw],
      minta:[tiz[0]||"",szr[0]||""].map(x=>x.slice(0,110)),
      mas:tiz.filter(t=>t.indexOf(sn(R.pen))<0).concat(szr.filter(t=>t.indexOf(sn(R.fk))<0)).map(x=>x.slice(0,110)),
      /* ha a kijelölt kiesett (piros, sérülés), a legalkalmasabb veszi át — ez a szabály */
      kiesett:{pen:sorok.map(tx).some(t=>/PIROS|SÉRÜLÉS|mehet le|kiállít/i.test(t)&&t.indexOf(sn(R.pen))>=0),
               fk:sorok.map(tx).some(t=>/PIROS|SÉRÜLÉS|mehet le|kiállít/i.test(t)&&t.indexOf(sn(R.fk))>=0)}};},[fajta,db]);
  const t3a=await fut(0,4);
  ok(t3a.tiz>=3&&(t3a.tiz===t3a.tizJo||(t3a.kiesett.pen&&t3a.tizJo>=1)),"kikényszerített tizenegyesek: a kijelölt rúgta (ha kiesett — piros, sérülés —, a legalkalmasabb vette át)",t3a);
  const t3b=await fut(6,4);
  ok(t3b.szr>=3&&(t3b.szr===t3b.szrJo||(t3b.kiesett.fk&&t3b.szrJo>=1)),"kikényszerített szabadrúgások: a kijelölt rúgta (ha kiesett, a legalkalmasabb vette át)",t3b);
  /* a pontrúgás-helyzet ritka (meccsenként ~0,6), a bedobás ebből 30%:
     amíg nincs elég minta, még egy kör (legfeljebb háromszor) */
  let sptMind=t3a.sptOssz+t3b.sptOssz,sptK=t3a.sptKijelolt+t3b.sptKijelolt,sptB=t3a.sptBedob+t3b.sptBedob,kor=0;
  while(kor<3&&(sptMind<5||sptB<1)){
    const t3c=await fut(null,6);kor++;
    sptMind+=t3c.sptOssz;sptK+=t3c.sptKijelolt;sptB+=t3c.sptBedob;}
  /* ha a kijelölt kiesett (piros, sérülés), a pályán lévő legalkalmasabb veszi
     át — ezért nem követelünk 100%-ot, csak döntő többséget */
  ok(sptMind>=5&&sptK>=0.8*sptMind&&sptB>0,"a pontrúgás-helyzetek (legalább 80%) a kijelölt szöglet-rúgóé vagy a bedobóé, és van bedobás is",{sptMind,sptK,sptB,kor});
  console.log("\n— 4. a pillanatkép —");
  const t4=await p.evaluate(()=>{
    S.genRoles={};const a=buildMatchSnapshot().defMult;
    const xi=slots.filter(s=>s.player&&s.pos!=="KP").map(s=>s.player);
    const e=careerPool[xi[0].n];e.attrs.ved=125;e.attrs.passz=125;S.skills[xi[0].n]=[];
    S.genRoles={throw:xi[0].n};const b=buildMatchSnapshot().defMult;
    e.attrs.ved=55;e.attrs.passz=55;const c=buildMatchSnapshot().defMult;
    S.genRoles={};
    return {a,b,c,arany:b/a,arany2:c/a};});
  ok(Math.abs(t4.arany-0.95)<0.002&&Math.abs(t4.arany2-0.99)<0.002,"a bedobó: csúcs-alkalmasságnál −5%, a legkisebbnél −1% az ellenfél gólesélyén",t4);

  console.log("\n— 5. a bedobás-animáció —");
  const t5=await p.evaluate(()=>{
    const n=slots.find(s=>s.player&&s.pos!=="KP").player.n;
    try{const c=evaKontextus({t:"bedobas",side:"us",p:n,min:33,seq:1});
      const svg=EVA_SABLON.bedobas.svg(c);
      const kat=MEV_TIPUS.bedobas&&EVA_TIPUS_SABLON.bedobas;
      return {ok:svg.length>500&&/evaLovo/.test(svg)&&/evaTars/.test(svg),kat,cim:EVA_SABLON.bedobas.cim(c)};}
    catch(e){return {hiba:String(e)};}});
  ok(t5.ok&&t5.kat==="bedobas"&&/bedobás/i.test(t5.cim),"a bedobás-jelenet felépül (bedobó, társ, kapu), saját eseménytípussal",t5);

  console.log("\n— 6. a taktika csúszkái —");
  const t6=await p.evaluate(()=>{
    const o={};
    o.keret=[59,60,82,82.5,105,127.5,149,150].map(tdMaxFor);
    const k=S.tactics.active||Object.keys(TACTICS)[0];S.tactics.active=k;
    const set=L=>{S.tactics.levels[k]=L;tdMemoClear();return tdMemo();};
    let M=set(60);o.p60={pro:dialProCurve(M.lv),con:dialConCurve(M.lv)};
    M=set(150);o.p150={pro:dialProCurve(M.lv),con:dialConCurve(M.lv),fm:M.fm,fit:M.fit};
    /* az illeszkedés-szorzó: a haszon ×f, a kár ÷f */
    S.tactics.dials={};tdStore()["vonal"]=10;
    const ef=TACTIC_DIALS[0].R.fx;
    o.pro=tdPct(ef[0],10)*100;o.con=tdPct(ef[1],10)*100;
    o.proVart=dialProCurve(20)*M.fm;o.conVart=dialConCurve(20)/M.fm;
    /* a keret: 82-nél 1 */
    S.tactics.dials={};set(82);
    o.elso=tdSet("vonal",5);o.masodik=tdSet("tempo",3);o.nulla=tdSet("vonal",0);o.most=tdSet("tempo",3);
    /* taktikánként külön */
    const k2=Object.keys(TACTICS).find(x=>x!==k);
    o.kulon=!(S.tactics.dials[k2]&&S.tactics.dials[k2].tempo);
    /* a motorban: a Magas védővonal emeli a saját gólesélyt */
    S.tactics.dials={};set(150);
    const m0=dialMul("own",{min:20,gf:0,ga:0});
    tdStore()["vonal"]=10;tdMemoClear();
    const m1=dialMul("own",{min:20,gf:0,ga:0}),o1=dialMul("opp",{min:20,gf:0,ga:0});
    o.own=m1/m0;o.opp=o1;
    /* a Mentalitás csak hátrányban */
    tdStore()["vonal"]=0;tdStore()["mental"]=10;tdMemoClear();
    o.mentHat=dialMul("own",{min:50,gf:0,ga:1});o.mentVezet=dialMul("own",{min:50,gf:1,ga:0});
    S.tactics.dials={};tdMemoClear();
    return o;});
  ok(t6.keret.join()==="0,1,1,2,3,4,4,5","60 → 1, 82,5 → 2, 105 → 3, 127,5 → 4, 150 → 5",t6.keret);
  ok(Math.abs(t6.p60.pro-2.5)<0.01&&Math.abs(t6.p60.con-6)<0.01&&Math.abs(t6.p150.pro-20.55)<0.06&&Math.abs(t6.p150.con-5)<0.01,"a görbe az ismertségből: 60 → +2,5% / −6%, 150 → +20,6% / −5%",t6);
  ok(Math.abs(t6.pro-t6.proVart)<0.01&&Math.abs(t6.con-t6.conVart)<0.01,"az illeszkedés szoroz: haszon ×f, kár ÷f",{pro:t6.pro,con:t6.con,fm:t6.p150.fm,fit:t6.p150.fit});
  ok(t6.elso&&!t6.masodik&&t6.nulla&&t6.most&&t6.kulon,"a keret (82-nél 1 csúszka), nullázás után másik mozdítható; taktikánként külön állás",t6);
  ok(t6.own>1.1&&t6.opp>1.02&&t6.mentHat>1.1&&Math.abs(t6.mentVezet-1)<1e-9,"a motorban hat: Magas védővonal → saját ↑, ellenfél ↑; Mindent bele csak hátrányban",t6);

  console.log("\n— 7. a két panel —");
  const t7=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    try{openHubMidSeason();}catch(e){}
    await varj(300);
    const o={};
    o.gomb=!!document.getElementById("hubRolesBtn");
    document.getElementById("hubRolesBtn").click();await varj(200);
    const B=document.getElementById("hubRolesBody");
    o.sel=B.querySelectorAll("select.genRoleSel").length;
    const n=slots.find(s=>s.player&&s.pos!=="KP").player.n;
    const sel=B.querySelector('select[data-genrole="fk"]');sel.value=n;sel.dispatchEvent(new Event("change"));await varj(150);
    o.fk=genRoleSetting("fk")===n;
    o.stilus=/szezon-szerepek|filozófia választása után/.test(B.textContent);
    document.getElementById("hubTacticsBtn").click();await varj(200);
    o.taktGomb=!!document.getElementById("hubDialOpenBtn");
    document.getElementById("hubDialOpenBtn").click();await varj(200);
    const D=document.getElementById("hubDialBody");
    o.tdCsuszka=D.querySelectorAll("input.tdRange").length;
    o.dialSzoveg=/a taktika csúszkái/.test(D.textContent);
    return o;});
  if(kep){
    /* a meccsek után ottmaradt jelenet és a tipp-buborék ne takarjon */
    const tiszta=()=>p.evaluate(()=>{try{evaLezar();}catch(e){}try{_evaSor.length=0;}catch(e){}
      const ev=document.getElementById("evAnim");if(ev)ev.classList.add("hide");
      const g=document.getElementById("guideTip");if(g)g.classList.add("hide");
      const ab=document.getElementById("absPanel");if(ab)ab.classList.add("hide");
      try{guideOff&&guideOff();}catch(e){}});
    await tiszta();
    /* a bedobás-jelenet */
    await p.evaluate(()=>{const n=slots.find(s=>s.player&&s.pos!=="KP").player.n;
      mevKezd({});_mev.anim=true;evaIdoSzorzo=1;
      evaKer({t:"bedobas",side:"us",p:n,min:33,seq:1,anim:true});});
    await p.waitForTimeout(1500);
    await p.screenshot({path:path.join(kep,"bedobas-animacio.png"),fullPage:false});
    await p.waitForTimeout(1500);await tiszta();await p.evaluate(()=>{try{mevVege();}catch(e){}});await tiszta();
    await p.evaluate(()=>{document.getElementById("hubTacticsPicker").classList.add("hide");document.getElementById("hubDialPicker").classList.add("hide");
      document.getElementById("hubRolesBtn").click();});
    await p.waitForTimeout(400);
    await tiszta();
    await p.evaluate(()=>document.getElementById("hubRolesPicker").scrollIntoView());
    await p.screenshot({path:path.join(kep,"csapatszerepek.png"),fullPage:false});
    await p.evaluate(()=>{const k=S.tactics.active;S.tactics.levels[k]=110;tdMemoClear();
      document.getElementById("hubRolesPicker").classList.add("hide");openHubDialPanel();});
    await p.waitForTimeout(400);
    await p.evaluate(()=>{const sl=document.querySelector('input.tdRange[data-tdial="vonal"]');sl.value="7";sl.dispatchEvent(new Event("change"));});
    await p.waitForTimeout(300);
    await tiszta();await p.evaluate(()=>document.getElementById("hubDialPicker").scrollIntoView());
    await p.screenshot({path:path.join(kep,"taktika-csuszkak.png"),fullPage:false});}
  ok(t7.gomb&&t7.sel===4&&t7.fk&&t7.stilus,"Csapatszerepek: 4 általános szerep, a választás azonnal él, a stílus-szerepek szakasza is ott",t7);
  ok(t7.taktGomb&&t7.tdCsuszka===5&&t7.dialSzoveg,"a Taktika alatt a Hangsúly-csúszkák alpont: az 5 taktika-csúszka",t7);

  console.log("\n— 8. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
