/* A LÁNC BEÁLLÍTÁSAI (3.9.34) — mind a négy kapcsoló minden ága.

   Amit mér:
     1. az ALAPÉRTÉKEK, és hogy egy régi (immSet nélküli) mentésben is állnak;
     2. AKADÉMIA: melyik gombot jelöli meg a panel a három beállításnál — és
        hogy a ballagásnál a „marad" tényleg az elengedést jelöli;
     3. KÉPESSÉG: az öt beállítás tényleg más embert választ-e (a próbakeretet
        úgy állítjuk össze, hogy a TSI-, a Rating- és a skill-győztes HÁROM
        KÜLÖNBÖZŐ ember legyen — különben a mérés semmit nem bizonyítana);
     4. TÉTMÉRKŐZÉS: megáll-e a lánc, és mennyi ideig áll a felkészülés;
     5. A FELKÉSZÜLÉS HOSSZA: az 5-30 mp-es vágás mindkét irányban. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8969;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    gameMode="career";
    careerPool=careerPool||{};

    /* ---- 1. ALAPÉRTÉKEK RÉGI MENTÉSBŐL ---- */
    S.immSet=null;
    out.alap=JSON.parse(JSON.stringify(immSet()));
    /* Hiányzó MEZŐ pótlása (egy jövőbeli új kapcsoló esete). */
    S.immSet={tet:"auto"};
    out.hianyzo_mezo_potolva=JSON.parse(JSON.stringify(immSet()));
    S.immSet=null;immSet();

    /* ---- 2. AKADÉMIA ---- */
    const akad=(mod,isFinal)=>{
      immSet().ifi=mod;
      const pr={n:"Ifi Dani",pos:["CS"],age:19,ovr:60,estimatedTSI:4000,tsi:4000};
      careerPool["Ifi Dani"]={n:"Ifi Dani",age:19,attrs:{},pos:["CS"],startRating:60,tsi:4000};
      try{showAcademyReveal(pr,()=>{},null,isFinal);}catch(e){return "HIBA: "+e.message;}
      const el=$("unlockActions").querySelector("[data-imm-ajanl]");
      const q=immPending();
      $("scUnlock").classList.add("hide");
      return {jelolt:el?el.textContent.trim().slice(0,34):null,
        mit:el&&el.dataset.immMit,
        lanc_dont:q&&q.dont,lanc_ajanl:!!(q&&q.ajanl)};};
    out.akademia={
      kerdez:akad("kerdez",false),
      felvesz:akad("felvesz",false),
      marad:akad("marad",false),
      marad_ballagaskor:akad("marad",true)};

    /* ---- 3. KÉPESSÉG-KIOSZTÁS ----
       HÁROM KÜLÖNBÖZŐ GYŐZTES: a TSI-é a padon ülő tehetség, a Ratingé a
       kezdő erős ember, a skilleké a harmadik. Ha a három egybeesne, a mérés
       akkor is „működik"-et mutatna, amikor a kapcsoló nem csinál semmit. */
    const keret=[
      {n:"Tehetség Dani",pos:["CS"],ovr:70,age:19,aggroI:2},
      {n:"Erős Dani",    pos:["CS"],ovr:92,age:27,aggroI:2},
      {n:"Skilles Dani", pos:["CS"],ovr:75,age:25,aggroI:2}];
    keret.forEach(x=>{careerPool[x.n]={n:x.n,age:x.age,attrs:{},pos:x.pos,startRating:x.ovr,tsi:0};});
    careerPool["Tehetség Dani"].tsi=30000;
    careerPool["Erős Dani"].tsi=6000;
    careerPool["Skilles Dani"].tsi=9000;
    slots.length=0;
    keret.forEach((x,i)=>slots.push({pos:"CS",player:x}));
    S.skills={"Skilles Dani":[{skill:{id:"x1",cat:"CSATAR",name:"A"},stagesNeeded:3,stagesCompleted:1},
                              {skill:{id:"x2",cat:"CSATAR",name:"B"},stagesNeeded:3,stagesCompleted:1},
                              {skill:{id:"x3",cat:"CSATAR",name:"C"},stagesNeeded:3,stagesCompleted:1}]};
    /* A kiosztás CSAK olyan képességet fogad el, amire van jelölt. */
    let sk=null;
    for(let i=0;i<400&&!sk;i++){const c=drawSkillFromPool();if(c&&eligibleForSkill(c).length>=3)sk=c;}
    out.kepesseg_alap={skill:sk&&sk.name,jeloltek:sk?eligibleForSkill(sk).map(x=>x.n):null,
      ratingek:keret.map(x=>x.n+": "+Math.round(pOvr(x))),
      tsik:keret.map(x=>x.n+": "+careerPool[x.n].tsi)};
    const kiosztas=mod=>{
      immSet().skill=mod;
      if(!sk)return "nincs próbaképesség";
      renderSkillAssign(sk,3,1);
      $("scSkill").classList.remove("hide");$("skillAssignWrap").classList.remove("hide");
      const el=$("skillAssignList").querySelector("[data-imm-ajanl]");
      const q=immPending();
      $("scSkill").classList.add("hide");
      /* A `data-imm-mit` a RÖVID nevet viszi (shortName), és a próbakeretben
         mindhármuké „Dani" — a sor látható neve viszont teljes. */
      const nm=el?(el.querySelector(".nm")||el).textContent.trim().split(/\s{2,}|\n/)[0]:null;
      return {kit:nm,
        lanc_ajanl:!!(q&&q.ajanl),lanc_dont:q&&q.dont,lanc_var:!!(q&&q.var)};};
    out.kepesseg={
      rendszer:kiosztas("rendszer"),
      tsi:kiosztas("tsi"),
      rating:kiosztas("rating"),
      skill:kiosztas("skill"),
      kerdez:kiosztas("kerdez")};

    /* ---- 4. TÉTMÉRKŐZÉS ---- */
    out.tetmeccs=(function(){
      const ki={};
      /* Kényszerített tétmeccs: az immTetMatch-et helyettesítjük, hogy a
         három ág döntését mérjük, ne a tabella-állást. */
      /* MENETREND NÉLKÜL az „nincs következő mérkőzés" kapu ELŐBB üt, és a
         három ág döntése meg sem szólalna. A 3. forduló szándékos: a 8/15/23
         checkpointok külön megállók. */
      S.idx=3;S.auto=false;
      S.fixtures=Array.from({length:30},()=>({o:{n:"Próba FC",ovr:70},home:true}));
      const igazi=window.immTetMatch;
      window.immTetMatch=()=>true;
      ["allj","varj","auto"].forEach(mod=>{
        immSet().tet=mod;
        let why=null;try{why=immLeagueStopWhy();}catch(e){why="HIBA: "+e.message;}
        ki[mod]={megall:!!why,indok:why?String(why).replace(/<[^>]+>/g,""):null,
          /* A „hosszabb várakozás" TÉNYLEG hosszabb-e — és csak tétmeccsen. */
          felkeszules_tetmeccsen:immPrepFor(true),
          felkeszules_hetkoznap:immPrepFor(false)};});
      window.immTetMatch=igazi;
      return ki;})();

    /* ---- 5. A FELKÉSZÜLÉS HOSSZA ---- */
    const prepAt=v=>{immSet().prep=v;return immPrepSec();};
    out.felkeszules={
      hatarok:[IMM_PREP_MIN,IMM_PREP_MAX],
      "5":prepAt(5),"15":prepAt(15),"30":prepAt(30),
      "1 (vágva)":prepAt(1),"999 (vágva)":prepAt(999),
      "hulladék (alapra esik)":prepAt("izé")};
    immSet().prep=15;
    return out;});

  console.log(JSON.stringify(r,null,1));
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
