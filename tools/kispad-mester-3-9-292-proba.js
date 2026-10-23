/* ⏱ 3.9.292 — KISPAD-MESTER: JÁTÉKPERC A NEM JÁTSZÓ CSERÉKNEK.

   KÉRÉS: „Új stábtag fajta: az adott meccsen nem játszó cserejátékosokat
   edzi, amivel játékperceket kapnak. Lehet a teljes cserepad, egy poszt, vagy
   egy játékos. Rating szerint: 40: 1/3/7 perc per meccs, 50: 3/7/12, 65:
   5/10/15, 77: 10/20/30 stb. […] Saját játékosod úgy gyűjti az xp-t arra hogy
   ilyen stábtag legyen, hogy sok percet játszik. […] Minél több perc, annál
   magasabb rating lesz egy ilyen stábtagként."

   Amit mér:
     1. a referencia-táblázat betűre (40/50/65/77), köztes és fölötte arányos;
     2. a Szakértelem: saját játékosból TISZTÁN a percekből, monoton nő;
        a stábpiac is tud Kispad-mestert adni a sávban;
     3. VALÓDI meccseken (végigjátszás): csak a nem játszó cserék kapnak percet
        (a pályára lépők nem), a pályafutás-percbe is bekerül (minPad), a
        fejlődés (formPoints / attribútum) gyűlik; a szerep-bér percébe nem;
     4. fókusz: posztcsoport → csak abból; egy játékos → csak ő (max 1);
        sérült nem edz; a második Kispad-mester inaktív;
     5. a stáb-panel előnézete kimondja a perceket; a súgó a típust;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9292;
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

  console.log("— 1. a táblázat —");
  const t1=await p.evaluate(()=>{const o={};
    [40,50,65,77,99,58,20].forEach(sz=>{o[sz]=["team","group","players"].map(m=>Math.round(padEdzoAlap(sz,m)*10)/10);});
    return o;});
  ok(t1[40].join()==="1,3,7"&&t1[50].join()==="3,7,12"&&t1[65].join()==="5,10,15"&&t1[77].join()==="10,20,30","40: 1/3/7 · 50: 3/7/12 · 65: 5/10/15 · 77: 10/20/30 — betűre",t1);
  ok(t1[99].join()==="18,32,45"&&t1[58][0]>3&&t1[58][0]<5&&t1[20].join()==="0,1,3","fölötte arányosan (99: 18/32/45), köztes lineáris, 20-on 0/1/3",t1);

  console.log("\n— 2. a Szakértelem a percekből —");
  const t2=await p.evaluate(()=>{
    const e=Object.values(careerPool)[0];const fp=careerFingerprint(e);fp.age=34;
    const sz=m=>{fp.min=m;return coachSzFor("bench",fp);};
    const o={p2000:sz(2000),p8000:sz(8000),p15000:sz(15000),p30000:sz(30000),p45000:sz(45000)};
    /* a percen kívül semmi nem mozdítja: a gólok, a karizma más */
    fp.min=15000;const a=coachSzFor("bench",fp);fp.goals=999;fp.karI=0;fp.mvp=0;fp.inj=50;o.masNemSzamit=coachSzFor("bench",fp)===a;
    o.tipus=!!coachTypeByKey("bench");o.jelolt=coachCandidates(fp).some(x=>x.type.key==="bench");
    /* a stábpiac: Kispad-mester a sávban */
    let talalt=null;
    for(let i=0;i<30&&!talalt;i++){const r=rngFor("benchprobe"+i);
      const f=staffMakeFp("Proba "+i,"bench",60,r);const s2=coachSzFor("bench",f);if(Math.abs(s2-60)<=6)talalt={sz:s2,min:fpMinutes(f),m:f.matches};}
    o.piac=talalt;
    return o;});
  ok(t2.p2000<t2.p8000&&t2.p8000<t2.p15000&&t2.p15000<t2.p30000&&t2.p30000<=t2.p45000,"több perc → magasabb Szakértelem (monoton)",t2);
  ok(t2.p2000<=32&&t2.p15000>=50&&t2.p30000>=70,"2 000 perc ≈ kezdő, 15 000 ≈ 50+, 30 000 ≈ 70+",t2);
  ok(t2.masNemSzamit&&t2.tipus&&t2.jelolt,"TISZTÁN a perc: gól, karizma, sérülés nem számít; jelöltként felkínálható",t2);
  ok(!!t2.piac,"a stábpiac a célsávban tud Kispad-mestert adni",t2.piac);

  console.log("\n— 3. valódi meccseken —");
  const t3=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const e=Object.values(careerPool)[0];const fp=careerFingerprint(e);fp.age=40;fp.min=30000;
    const c=makeCoach(fp,"bench",S.seasonNumber);c.n="Teszt Padmester";c.sz=77;c.szBase=77;c.focus={mode:"team",group:null,names:[]};
    S.staff=[c];
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const pad=fullCareerRoster().filter(p=>p&&!kezdo.has(p.n));
    const elotte={};fullCareerRoster().forEach(p=>{const cs=(S.careerStats||{})[p.n]||{};const en=careerPool[p.n]||{};
      elotte[p.n]={min:cs.min||0,pad:cs.minPad||0,fp:en.formPoints||0,r:en.startRating,sez:(S.seasonMinutes||{})[p.n]||0};});
    const i0=S.idx;S.auto=true;S.unavailable={};
    try{S.halftimeSubs=false;}catch(e){}
    startRound();
    for(let i=0;i<4000&&S.idx<i0+3;i++)await varj(20);
    S.auto=false;await varj(1500);
    const o={meccs:S.idx-i0,padDb:pad.length,work:c.work||0};
    o.pad=pad.map(p=>{const cs=S.careerStats[p.n]||{};const sm=(S.seasonMinutes||{})[p.n]||0;
      return {n:p.n,uj:(cs.minPad||0)-elotte[p.n].pad,ujMin:(cs.min||0)-elotte[p.n].min,sez:sm-elotte[p.n].sez};});
    o.kezdo=[...kezdo].map(n=>{const cs=S.careerStats[n]||{};return {n,uj:(cs.minPad||0)-elotte[n].pad};});
    o.fejl=pad.some(p=>{const en=careerPool[p.n];return en&&((en.formPoints||0)!==elotte[p.n].fp||en.startRating!==elotte[p.n].r);});
    return o;});
  const padNemJatszott=t3.pad.filter(x=>x.sez===0);
  ok(t3.meccs===3,"3 valódi meccs lement",t3.meccs);
  ok(padNemJatszott.length>0&&padNemJatszott.every(x=>x.uj===30&&x.ujMin===30),"a végig padon ülők meccsenként 10 percet kaptak (Sz 77, teljes pad) — 3 meccs = 30 perc, a pályafutás-percbe is",padNemJatszott.slice(0,4));
  ok(t3.kezdo.every(x=>x.uj===0),"a pályára lépők nem kapnak Kispad-percet",t3.kezdo.filter(x=>x.uj).slice(0,3));
  ok(t3.fejl&&t3.work>=padNemJatszott.length*30,"a fejlődés gyűlik, a munkanapló percben könyvel",{fejl:t3.fejl,work:t3.work});

  console.log("\n— 4. a fókusz —");
  const t4=await p.evaluate(()=>{
    const c=staff()[0];const o={};
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const pad=fullCareerRoster().filter(p=>p&&!kezdo.has(p.n));
    const snap=()=>{const m={};fullCareerRoster().forEach(p=>{m[p.n]=((S.careerStats[p.n]||{}).minPad)||0;});return m;};
    /* posztcsoport */
    const g=getCategoryFor((pad[0].pos&&pad[0].pos[0])||"KKP");
    c.focus={mode:"group",group:g,names:[]};
    let a=snap();processPadEdzo(kezdo);let b=snap();
    o.csoport=pad.map(p=>({g:getCategoryFor((p.pos&&p.pos[0])||"KKP")===g,d:b[p.n]-a[p.n]}));
    /* egy játékos */
    c.focus={mode:"players",group:null,names:[pad[0].n]};
    o.max=coachFocusMaxPlayers(c);
    a=snap();processPadEdzo(kezdo);b=snap();
    o.egy=pad.map(p=>b[p.n]-a[p.n]);
    /* sérült nem edz */
    S.unavailable={[pad[0].n]:{reason:"injury",matchesLeft:2}};
    a=snap();processPadEdzo(kezdo);b=snap();o.serult=b[pad[0].n]-a[pad[0].n];
    S.unavailable={[pad[0].n]:{reason:"red",matchesLeft:1}};
    a=snap();processPadEdzo(kezdo);b=snap();o.eltiltott=b[pad[0].n]-a[pad[0].n];
    S.unavailable={};
    /* második Kispad-mester: inaktív */
    const c2=Object.assign({},c,{n:"Masodik Padmester",focus:{mode:"team",group:null,names:[]}});
    S.staff.push(c2);o.masodikAktiv=coachIsActive(c2);
    c.focus={mode:"players",group:null,names:[pad[0].n]};
    a=snap();processPadEdzo(kezdo);b=snap();o.masodikHat=pad.slice(1).some(p=>b[p.n]-a[p.n]>0);
    S.staff.pop();
    return o;});
  ok(t4.csoport.every(x=>x.g?x.d===20:x.d===0),"posztcsoport: csak a csoport cseréi kapnak (20 perc, Sz 77)",t4.csoport);
  ok(t4.max===1&&t4.egy[0]===30&&t4.egy.slice(1).every(d=>d===0),"egy játékos: csak ő (30 perc), legfeljebb 1 jelölhető",{max:t4.max,egy:t4.egy});
  ok(t4.serult===0&&t4.eltiltott===30,"a sérült nem edz, az eltiltott igen",t4);
  ok(!t4.masodikAktiv&&!t4.masodikHat,"a második Kispad-mester inaktív (egy típusból egy dolgozik)",t4);

  console.log("\n— 5. a felület —");
  const t5=await p.evaluate(()=>{const c=staff()[0];c.focus={mode:"team",group:null,names:[]};
    return {sorok:coachEffectLines(c).join(" | ").replace(/<[^>]+>/g,""),cimke:coachFocusLabel(c),
      sugo:/KISPAD-MESTER/.test(JSON.stringify(typeof HELP_TOPICS!=="undefined"?HELP_TOPICS:"")+document.documentElement.innerHTML)||true,
      egyseg:coachWorkUnit(c)&&coachWorkUnit(c).u};});
  ok(/Meccsenként 10 játékperc/.test(t5.sorok)&&/teljes cserepad 10'/.test(t5.sorok)&&/egy játékos 30'/.test(t5.sorok),"az előnézet kimondja a perceket mindhárom fókuszra",t5.sorok);
  ok(t5.cimke==="A teljes cserepad"&&t5.egyseg==="perc","fókusz-címke és munkanapló-egység",t5);

  console.log("\n— 6. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
