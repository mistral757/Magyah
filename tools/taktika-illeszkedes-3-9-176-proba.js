/* ⚙ 3.9.176 — A TAKTIKA-ILLESZKEDÉS A SAJÁT ELVÁRÁSODHOZ MÉR + A PLAFON NŐ.

   Amit mér (valódi karrier, valódi keret):
     1. a várt tengely (a Ratingekből) ott van a teamAttrStrengths-ben, és egy
        érintetlen keretnél (attribútum = a várt) minden rendszer ~50%;
     2. MONOTON: egy NEM fókusz-tengely emelése (a bejelentett eset: Védekezés-
        boost a Széljátéknál) egyetlen rendszer illeszkedését sem rontja; egy
        fókusz-tengely emelése az adott rendszert javítja;
     3. a bejelentett profil (a Széljáték két fő tengelye, Seb és Gól a keret
        legerősebbje, +15-ös többlettel) ~95% fölött van;
     4. NEM SODRÓDIK: a Rating emelkedése (syncAttrsToRating) nem mozdítja az
        illeszkedést;
     5. a taktika-plafon: 100-as nyers erőnél +5, 110 → +6,5, 170 → +15,5,
        90 → +3,5, alacsony nyers erőnél a régi 2,1; a 99-es szint a teljes
        plafont adja, 85 → 0, a büntetés (85 alatt) nem skálázódik;
     6. a panel: a tengelyeknél ott a várt érték és a többlet; a tanács a
        valódi számból dönt (85% alatt megnevezi a fő tengelyt és a +10 pont
        hozamát, fölötte „jól illik”);
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9218;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:24};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:24,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.auto=false;});
  await p.waitForTimeout(400);

  const r=await p.evaluate(()=>{
    const out={};
    const K=Object.keys(TACTICS);
    const E=()=>slots.filter(s=>s.player).map(s=>careerPool[s.player.n]);
    /* a fit tisztán, a bónuszok (stílus, kihívás, talizmán, csúszka) nélkül */
    S.chTacticFitPP=0;
    const fits=()=>{const o={};K.forEach(k=>{o[k]=+(tacticFitParts(k).reduce((z,q)=>z+q.d,0)*TACTIC_FIT_C+0.5).toFixed(4);});return o;};
    /* minden attribútum PONTOSAN a várt értéken: semleges keret */
    E().forEach(e=>{ATTR_KEYS.forEach(k=>{e.attrs[k]=attrExpectedOfPlayer({n:e.n},k);});});
    const A0=teamAttrStrengths();
    out.vanExp=!!A0._exp&&ATTR_KEYS.every(k=>typeof A0._exp[k]==="number");
    out.semleges=fits();
    out.semTobblet=ATTR_KEYS.map(k=>+(A0[k]-A0._exp[k]).toFixed(2));
    /* 2. a NEM fókusz-tengely emelése (Védekezés +12 mindenkinek) */
    const f0=fits();
    E().forEach(e=>{e.attrs.ved+=12;});
    const f1=fits();
    out.vedUtan={szeljatek:f1.szeljatek,elotte:f0.szeljatek};
    out.romlott=K.filter(k=>f1[k]<f0[k]-1e-9);
    out.javult=K.filter(k=>f1[k]>f0[k]+1e-9);
    out.vedFokusz=K.filter(k=>TACTICS[k].attrProfile.ved>ATTR_FLAT_W);
    E().forEach(e=>{e.attrs.ved-=12;});
    /* a monotonitás minden tengelyen, minden rendszerre: +6 lépés */
    out.monoton=[];
    ATTR_KEYS.forEach(ax=>{
      const a=fits();E().forEach(e=>{e.attrs[ax]+=6;});const c=fits();E().forEach(e=>{e.attrs[ax]-=6;});
      K.forEach(k=>{const fok=TACTICS[k].attrProfile[ax]>ATTR_FLAT_W;
        if(c[k]<a[k]-1e-9)out.monoton.push(`${k}:${ax} romlott`);
        if(fok&&!(c[k]>a[k]))out.monoton.push(`${k}:${ax} fókusz, mégsem javult`);
        if(!fok&&Math.abs(c[k]-a[k])>1e-9)out.monoton.push(`${k}:${ax} nem fókusz, mégis mozdult`);});});
    /* 3. a bejelentett profil: Seb és Gól +15 többlet, a többi semleges */
    E().forEach(e=>{e.attrs.seb+=15;e.attrs.gol+=15;});
    out.bejelentett=fits().szeljatek;
    out.bejelentettKontra=fits().kontra;
    /* 4. nem sodródik: mindenki Ratingje +8, az attribútumok 1:1 követik */
    /* Nyitott sebesség-plafonnal (Infinity): normál módban a 99-es kemény
       plafon a betanított sebesség-többletet fizikailag levágja — az a
       motorban is levágódik, tehát ott a csökkenés valós, nem mérési hiba. */
    const _inf=infinityMode;infinityMode=true;
    const s0=fits();
    E().forEach(e=>{e._attrAnchor=e.startRating;e.startRating+=8;syncAttrsToRating(e);});
    slots.forEach(sl=>{if(sl.player)sl.player.ovr+=8;});
    const s1=fits();
    out.sodrodas=K.map(k=>+(s1[k]-s0[k]).toFixed(3));
    infinityMode=_inf;
    /* 5. a plafon a nyers erővel */
    const _t=teamOVRbase;
    const capAt=raw=>{teamOVRbase=()=>raw;const v=TACTIC_EFFECT_CAP_BASE*tacticEffectScale();teamOVRbase=_t;return +v.toFixed(3);};
    out.cap={r60:capAt(60),r90:capAt(90),r100:capAt(100),r110:capAt(110),r170:capAt(170)};
    teamOVRbase=()=>100;
    const k0=K.find(k=>tacticCeil(k)===TACTIC_MAX)||K[0];
    out.hatas={l99:+tacticEffectAt(k0,99,1).toFixed(3),
      l99fit0:+tacticEffectAt(k0,99,0).toFixed(3),l85:+tacticEffectAt(k0,85,0.5).toFixed(3),
      l75:+tacticEffectAt(k0,75,0.5).toFixed(3)};
    teamOVRbase=()=>60;out.hatas.l75regi=+tacticEffectAt(k0,75,0.5).toFixed(3);
    teamOVRbase=_t;
    /* 6. a panel */
    S.tactics.active="szeljatek";S.tactics.levels.szeljatek=95;
    renderHubTacticsPanel();
    const hint=document.getElementById("hubTacticsHint").textContent;
    const body=document.getElementById("hubTacticsBody").textContent;
    out.panelVart=/A Ratingekből várt/.test(hint)&&/többlet/.test(hint);
    out.panelJol=/jól illik ehhez a rendszerhez/.test(body);
    /* gyenge fókusz: a seb/gol többlet vissza, és −8 */
    E().forEach(e=>{e.attrs.seb-=23;e.attrs.gol-=23;});
    renderHubTacticsPanel();
    const body2=document.getElementById("hubTacticsBody").textContent;
    out.fitGyenge=fits().szeljatek;
    out.panelTanacs=/Jobb illeszkedés: a rendszer fő tengelye/.test(body2)&&/\+10 pont/.test(body2)&&/százalékpont/.test(body2);
    out.panelNincsHamisJol=!/jól illik ehhez a rendszerhez/.test(body2.split("Széljáték")[1]||"");
    return out;});

  console.log("\n— 1. a várt tengely, semleges keret —");
  ok(r.vanExp,"a teamAttrStrengths kiadja a Ratingekből várt tengelyt (_exp)");
  ok(Object.values(r.semleges).every(v=>Math.abs(v-0.5)<0.02),"attribútum = várt → minden rendszer 50%",r.semleges);
  console.log("\n— 2. monoton —");
  ok(r.romlott.length===0,"a Védekezés +12 egyetlen rendszer illeszkedését sem rontja (a bejelentett eset)",{romlott:r.romlott,szeljatek:r.vedUtan});
  ok(JSON.stringify(r.javult.sort())===JSON.stringify(r.vedFokusz.sort()),"…és pontosan azokat javítja, amelyek a Védekezésre építenek",{javult:r.javult,fokusz:r.vedFokusz});
  ok(r.monoton.length===0,"minden tengelyen, minden rendszerre: fókusz-emelés javít, más tengely nem mozdít",r.monoton.slice(0,6));
  console.log("\n— 3. a bejelentett profil —");
  ok(r.bejelentett>=0.94,"Seb és Gól +15 többlettel a Széljáték 94% fölött",r.bejelentett);
  console.log("\n— 4. nem sodródik —");
  ok(r.sodrodas.every(v=>Math.abs(v)<0.005),"a Rating +8 (az attribútumok 1:1 követik) nem mozdítja az illeszkedést (nyitott sebesség-plafon mellett)",r.sodrodas);
  console.log("\n— 5. a plafon —");
  ok(r.cap.r100===5&&r.cap.r110===6.5&&r.cap.r170===15.5&&r.cap.r90===3.5&&r.cap.r60===2.1,
    "100 → +5 · 110 → +6,5 · 170 → +15,5 · 90 → +3,5 · alacsony nyers erőnél a régi 2,1",r.cap);
  ok(Math.abs(r.hatas.l99-6.5)<0.01&&Math.abs(r.hatas.l99fit0-3.5)<0.01&&r.hatas.l85===0,
    "100-as nyers erőnél a 99-es szint a teljes plafont adja (×0,7…×1,3 az illeszkedéssel), 85 → 0",r.hatas);
  ok(r.hatas.l75===r.hatas.l75regi&&r.hatas.l75<0,"a büntetés (85 alatt) nem skálázódik a nyers erővel",r.hatas);
  console.log("\n— 6. a panel —");
  ok(r.panelVart,"a tengelyeknél ott a Ratingekből várt érték és a többlet");
  ok(r.panelJol,"magas illeszkedésnél (fő tengelyek +15) „jól illik”");
  ok(r.fitGyenge<0.5&&r.panelTanacs&&r.panelNincsHamisJol,"gyenge fő tengelynél nincs hamis „jól illik”: megnevezi a fő tengelyt és a +10 pont hozamát",{fit:r.fitGyenge});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
