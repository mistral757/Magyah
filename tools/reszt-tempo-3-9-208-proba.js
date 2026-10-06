/* ⏱️ 3.9.208 — A NÉGY RÉSZTEMPÓ.

   BEJELENTÉS: „Külön kapcsoló a fejlődési tempón belül a következőkre:
   a) játékosok fejlődése, b) bevételek és kiadások, c) taktikai fejlődés,
   d) ifiakadémia."

   Amit mér:
     1. ALAPBÓL mind a négy a fő tempót követi — betűre a régi játék;
     2. A CSATORNÁK: tengelyenként a saját szorzó hat (fejlődés, edző és
        mezőny → játékos; büdzsé és lelátó → pénz; begyakorlás, összhang,
        poszt-tanulás, stíluspont → taktika; tehetség, ajánlat, akadémiai
        fejlődés → akadémia), és a másik tengely nem mozdítja;
     3. A FIZETÉSEK nem lassulnak a pénz-tempóval;
     4. A RUN: a karrier rögzíti a négy tengelyt, a „legkönnyebb használt"
        szabály tengelyenként él, a plafon a súlyozott tényező; régi
        karrierben (nincs térkép) a régi, egyetlen tempó;
     5. A FELÜLET: lenyitható, négy választó, a zárt fokozat nem választható,
        az összefoglaló „Egyéni"; a betöltéskor is kirajzolódik;
     6. KÖZÖS KARRIER: a csomagban utazik, a rögzítés a szobáé, régi szobában
        a fő tempó él mind a négyen, a mentés viszi, az eltérést kimondja, a
        vendégnél zárolt. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9250;
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
const kozel=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.removeItem("harminc_nulla_tempo_ax_v1");localStorage.setItem("harminc_nulla_tempo_v1","normal");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  console.log("\n— 0. betöltés —");
  const r0=await p.evaluate(()=>({v:APP_VERSION,sorok:document.querySelectorAll("#tempoAxRows select[data-tax]").length,
    sum:document.getElementById("tempoAxSum").textContent}));
  ok(String(r0.v).localeCompare("3.9.208",undefined,{numeric:true})>=0&&r0.sorok===4,"a betöltéskor kirajzolódik a négy választó (nincs TDZ-csapda)",r0);

  /* karrier, piramissal — a csatornák méréséhez */
  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    /* a lassítások zárját feloldjuk — itt a csatornákat mérjük, nem a kaput */
    Object.keys(GAME_TEMPO).forEach(k=>{try{unlockGift("tempo",k);}catch(e){}});
    renderTempoGrid();});

  console.log("\n— 1. alapból a fő tempó —");
  const r1=await p.evaluate(()=>({map:tempoAxMap(),m:TEMPO_AX_IDS.map(a=>tempoMultAx(a)),fo:tempoMult(),
    f:tempoRunFactor(),regi:PYR_RUN_CAP.tempo.normal,custom:tempoAxCustom()}));
  ok(Object.values(r1.map).every(v=>v==="normal")&&r1.m.every(v=>v===r1.fo)&&!r1.custom,"mind a négy tengely a fő tempót követi",r1);
  ok(kozel(r1.f,r1.regi),"a Run-tényező betűre a régi érték (Σ súly = 1)",{f:r1.f,regi:r1.regi});

  console.log("\n— 2. a csatornák —");
  const r2=await p.evaluate(()=>{
    const meres=()=>({
      dev:devTempo(),devT:devTempo("taktika"),devA:devTempo("akademia"),
      ai:pyrAiRate(pyrMyDivId()),cards:tempoMult(),skill:skillPityMatches(),
      budget:seasonBudgetParts().tempoMult,fan:fanAskTempo(),
      chem:chemPityMatches(),sp:msSpReward(1000),
      pos:posLearnMatchesNeeded(Object.values(careerPool)[0]),
      akadQ:tempoMultAx("akademia")});
    const o={alap:meres()};
    const egy=(ax,k)=>{TEMPO_AX_IDS.forEach(a=>setTempoAx(a,null));setTempoAx(ax,k);return meres();};
    o.jatekos=egy("jatekos","csiga");
    o.penz=egy("penz","csiga");
    o.taktika=egy("taktika","csiga");
    o.akademia=egy("akademia","csiga");
    TEMPO_AX_IDS.forEach(a=>setTempoAx(a,null));
    return o;});
  const A=r2.alap,k=0.56/0.80;
  ok(kozel(r2.jatekos.dev/A.dev,k,1e-3)&&r2.jatekos.ai<A.ai&&r2.jatekos.skill>A.skill&&r2.jatekos.budget===A.budget&&r2.jatekos.devT===A.devT,
     "JÁTÉKOS: fejlődés, mezőny-ütem, skill-türelem — a pénz és a taktika nem mozdul",{alap:A,j:r2.jatekos});
  ok(kozel(r2.penz.budget,0.56)&&kozel(r2.penz.fan/A.fan,k,1e-3)&&r2.penz.dev===A.dev&&r2.penz.ai===A.ai&&r2.penz.chem===A.chem,
     "PÉNZ: szezonkeret és lelátó — a fejlődés és a mezőny nem mozdul",r2.penz);
  ok(kozel(r2.taktika.devT/A.devT,k,1e-3)&&r2.taktika.chem>A.chem&&r2.taktika.sp<A.sp&&r2.taktika.pos>=A.pos&&r2.taktika.dev===A.dev&&r2.taktika.budget===A.budget,
     "TAKTIKA: begyakorlás/összhang, párkémia-türelem, stíluspont, poszt-tanulás — a többi nem mozdul",r2.taktika);
  ok(kozel(r2.akademia.devA/A.devA,k,1e-3)&&kozel(r2.akademia.akadQ,0.56)&&r2.akademia.dev===A.dev&&r2.akademia.budget===A.budget,
     "AKADÉMIA: akadémiai fejlődés, tehetség-minőség és ajánlat-sűrűség — a többi nem mozdul",r2.akademia);

  console.log("\n— 3. a fizetések —");
  const r3=await p.evaluate(()=>{
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    const ber=()=>Math.round(wageBill(xi).raw*1000)/1000;
    const keret=()=>Math.round(seasonBudgetParts().total);
    const a=ber(),ka=keret();setTempoAx("penz","kokorszak");const b2=ber(),kb=keret();setTempoAx("penz",null);
    /* ha MIND a négy lassul (fő tempó), a bér a régi módon követi — betűre a régi játék */
    setGameTempo("kokorszak");const c=ber();setGameTempo("normal");
    return {a,b:b2,c,ka,kb};});
  ok(r3.a>0&&r3.a===r3.b&&r3.kb<r3.ka,"a fizetések nem lassulnak a pénz-tempóval — a szezonkeret igen (szűkebb költségvetés)",r3);
  ok(r3.c<r3.a,"ha a fő tempó lassul (mind a négy együtt), a bér a régi módon követi",r3);

  console.log("\n— 4. a Run —");
  const r4=await p.evaluate(()=>{
    setTempoAx("jatekos","gleccser");setTempoAx("penz","csiga");
    S.run=null;runInit();runCaptureStart();const R=S.run;
    const elso=Object.assign({},R.tempoAx);
    /* menet közben könnyít a pénzen, nehezít az akadémián: a könnyebbet tartjuk, a nehezebbet nem */
    setTempoAx("penz","normal");setTempoAx("akademia","kokorszak");runTempoSync();
    const utana=Object.assign({},R.tempoAx);
    const cap=pyrRunCap();
    const sor=(cap.parts||[]).find(x=>/Saját tempó/.test(x.n));
    const vart=TEMPO_AXES.reduce((a,t)=>a+t.w*PYR_RUN_CAP.tempo[utana[t.id]],0);
    /* régi karrier: nincs tengely-térkép */
    const regi=JSON.parse(JSON.stringify(R));delete regi.tempoAx;regi.tempo="csiga";S.run=regi;
    const sorRegi=(pyrRunCap().parts||[]).find(x=>/Saját tempó/.test(x.n));
    S.run=R;TEMPO_AX_IDS.forEach(a=>setTempoAx(a,null));
    return {elso,utana,sor,vart,sorRegi,regiV:PYR_RUN_CAP.tempo.csiga,dynW:runTempoRowW(R)};});
  ok(r4.elso.jatekos==="gleccser"&&r4.elso.penz==="csiga"&&r4.elso.taktika==="normal","a karrier indulásakor rögzül a négy tengely",r4.elso);
  ok(r4.utana.penz==="normal"&&r4.utana.akademia==="normal","tengelyenként a legkönnyebb használt fokozat számít (könnyítés le, nehezítés nem fel)",r4.utana);
  ok(r4.sor&&kozel(r4.sor.v,r4.vart)&&/Egyéni/.test(r4.sor.n),"a piramis plafonjában a súlyozott tényező, „Egyéni” felirattal",r4.sor);
  ok(r4.sorRegi&&kozel(r4.sorRegi.v,r4.regiV)&&/Csigatempó/.test(r4.sorRegi.n),"régi karrierben a régi, egyetlen tempó — betűre",r4.sorRegi);
  ok(r4.dynW>0,"dinamikus módban a tempó-sor súlya a tengelyekből jön",r4.dynW);

  console.log("\n— 5. a felület —");
  const r5=await p.evaluate(()=>{
    const o={};
    try{unlockStateReset&&0;}catch(e){}
    renderTempoAxUi();
    o.zarva=document.getElementById("tempoAxBody").classList.contains("hide");
    document.getElementById("tempoAxToggle").click();
    o.nyitva=!document.getElementById("tempoAxBody").classList.contains("hide");
    const sel=document.querySelector('#tempoAxRows select[data-tax="penz"]');
    sel.value="komotos";sel.dispatchEvent(new Event("change"));
    o.pref=tempoAxOwn("penz");
    o.sum=document.getElementById("tempoAxSum").textContent;
    renderSetupRecap();
    o.recap=[...document.querySelectorAll("#setupRecap .setupRecapRow")].map(x=>x.textContent).find(t=>/tempó/i.test(t));
    /* a fő tempó váltása: a követő tengelyek feliratai követik */
    document.querySelector('#tempoGrid button[data-tempo="gyors"]').click();
    o.koveto=document.querySelector('#tempoAxRows select[data-tax="taktika"] option[value=""]').textContent;
    o.taktika=tempoMultAx("taktika");
    document.querySelector('#tempoGrid button[data-tempo="normal"]').click();
    setTempoAx("penz",null);renderTempoAxUi();
    return o;});
  ok(r5.nyitva,"lenyitható",r5);
  ok(r5.pref==="komotos"&&/Egyéni/.test(r5.sum)&&/Pénz: Komótos/.test(r5.sum),"a választás tárolódik, az összegzés „Egyéni”",r5.sum);
  ok(r5.recap&&/Egyéni/.test(r5.recap),"az összefoglalóban is",r5.recap);
  ok(/Gyors fejlődés/.test(r5.koveto)&&kozel(r5.taktika,0.90),"a követő tengely a fő tempóval együtt mozog",{f:r5.koveto,k:r5.taktika});
  /* a zárt fokozat */
  const r5b=await p.evaluate(()=>{
    const _ok=unlockTempoOk,_why=unlockTempoWhy;
    unlockTempoOk=k=>k!=="kokorszak";unlockTempoWhy=k=>k==="kokorszak"?"🔒 zárva":null;
    setTempoAx("akademia","kokorszak");renderTempoAxUi();
    const o={le:document.querySelector('#tempoAxRows select[data-tax="akademia"] option[value="kokorszak"]').disabled,
      vissza:tempoAxOwn("akademia")};
    unlockTempoOk=_ok;unlockTempoWhy=_why;renderTempoAxUi();return o;});
  ok(r5b.le&&r5b.vissza===null,"a zárt fokozat nem választható, a tárolt zárt fokozat a fő tempóra esik vissza",r5b);

  console.log("\n— 6. közös karrier —");
  const r6=await p.evaluate(()=>{
    const o={};
    setTempoAx("taktika","csiga");
    o.csomag=mpCollectSettings().tempoAx;
    const mpA=MP.active;MP.active=true;
    _pendingMpWorld={tempo:"normal",sched:"real",tempoAx:{jatekos:"komotos",penz:"normal",taktika:"gleccser",akademia:"normal"}};
    lockMpWorldSettings();
    o.vilag=tempoAxMap();o.helyi=tempoAxOwn("taktika");
    _pendingMpWorld={tempo:"komotos",sched:"real"};
    lockMpWorldSettings();
    o.regi=tempoAxMap();
    _pendingMpWorld={tempo:"normal",sched:"real",tempoAx:{jatekos:"komotos",penz:"normal",taktika:"gleccser",akademia:"normal"}};
    lockMpWorldSettings();
    /* mentés → betöltés */
    const ax=mpWorldTempoAx;mpWorldTempoAx=null;
    o.tisztit=tempoAxClean({jatekos:"x"})===null&&tempoAxClean(ax)!==null;
    mpWorldTempoAx=tempoAxClean(JSON.parse(JSON.stringify(ax)));
    o.vissza=tempoAxMap().taktika;
    /* az eltérés kimondva */
    const a=mpWorldAxes(),b2=JSON.parse(JSON.stringify(a));b2.tempoAx.penz="csiga";
    o.diff=mpWorldAxesDiff(a,b2).map(d=>d.k);
    /* a házigazda tengelyeinek átvétele */
    mpAdoptWorldAxes(b2,b2);o.atvett=tempoAxMap().penz;
    o.lista=MP_GUEST_LOCK_SEL.includes("#tempoAxWrap select");
    MP.active=mpA;lockMpWorldSettings();
    o.utana=tempoAxMap().taktika;
    setTempoAx("taktika",null);
    return o;});
  ok(r6.csomag&&r6.csomag.taktika==="csiga","a házigazda csomagjában utazik",r6.csomag);
  ok(r6.vilag.taktika==="gleccser"&&r6.vilag.jatekos==="komotos"&&r6.helyi==="csiga","a szoba térképe él, a saját tárolt preferencia érintetlen",r6);
  ok(Object.values(r6.regi).every(v=>v==="komotos"),"régi szobában (nincs térkép) mind a négy a szoba fő tempója",r6.regi);
  ok(r6.tisztit&&r6.vissza==="gleccser","a mentés viszi (érvénytelen térkép null)",r6);
  ok(r6.diff.includes("tempoAx")&&r6.atvett==="csiga","az eltérést kimondja, a házigazdáét átveszi",r6);
  ok(r6.lista&&r6.utana==="csiga","a vendégnél zárolt; a közös karrier után a saját preferencia él újra",r6);

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
