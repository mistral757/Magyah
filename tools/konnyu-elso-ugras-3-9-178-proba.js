/* 🪜 3.9.178 — KÖNNYŰ ELSŐ UGRÁS.

   Kérés: ha a karrier első idénye a D6-ban telt, az első idény utáni nyáron
   a D4-be ugrás ára PONTOSAN a Nyári Felkészülési Kupa indulásakor meglévő
   büdzsé + 1 Mrd Ft (500 pont) — és ezt a játékosnak nem mondjuk el.

   Amit mér (valódi piramis-karrier):
     1. a rögzítés: a kupa felajánlásakor / indulásakor (offerFriendlyCup,
        startEuroCampaign) a büdzsé eltevődik; EGYSZER — egy későbbi,
        nagyobb büdzsé nem írja felül;
     2. az ár: D4-be = alap + 500; a D3/D2/D1 ára változatlan;
     3. a feltételek: nem D6-ban telt első idény → nincs rögzítés, régi ár;
        a 2. idénytől a régi ár;
     4. a valódi ajánlat (pyrLeapOffer) ezt az árat mutatja, és semmi nem
        utal arra, honnan jön („kupa", „+1 Mrd" nem szerepel);
     5. a nyári előrejelző (pyrLeapPlan) is ezt az árat mondja;
     6. a mentés viszi; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9220;
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
    /* a próba kerete erős, a draft magasabb osztályba sorolná — az első
       idényt itt a D6-ba tesszük, mert a szabály erről szól */
    S.pyr.my=6;
    out.pyr=pyrOn();out.div=pyrMyDivId();out.sz=S.seasonNumber||1;
    /* 1. rögzítés a felajánláskor */
    S.pyrLeapEasy=null;S.transferBudget=4321;
    const _sh=document.getElementById("scUnlock");
    try{offerFriendlyCup(()=>{});}catch(e){out.offerHiba=String(e);}
    _sh.classList.add("hide");
    out.rogzit=S.pyrLeapEasy&&S.pyrLeapEasy.budget;
    /* egyszer: egy későbbi, nagyobb büdzsé nem írja felül (kupa-indulás) */
    S.transferBudget=99999;
    const _c=S.euroCurrent;S.euroCurrent=null;
    pyrLeapEasyRecord();
    out.egyszer=S.pyrLeapEasy&&S.pyrLeapEasy.budget;
    S.euroCurrent=_c;
    /* 2. az ár — a nyári állapot: a bajnok D5-be lépett, a szezonszám még 1 */
    S.pyr.my=5;
    out.d4=pyrLeapTargetFrom(5);
    out.d3=pyrLeapTargetFrom(4);out.d2=pyrLeapTargetFrom(3);out.d1=pyrLeapTargetFrom(2);
    /* 4. a valódi ajánlat */
    S.transferBudget=4321+3000;S.pyrLeap=null;S.auto=false;
    let txt="";
    try{pyrLeapOffer(()=>{});txt=document.getElementById("unlockBody").textContent;}catch(e){out.ajHiba=String(e);}
    out.ajanlat={van:/ALL-IN/.test(document.getElementById("unlockTitle").textContent),
      ar:txt.indexOf(fmtFt(4321+500))>=0,
      nemArul:!/kupa|Kupa|\+ ?1 Mrd|felkészülési/.test(txt),
      minimum:(txt.match(/a minimum ([^)]+)\)/)||[])[1]||null};
    _sh.classList.add("hide");
    /* 5. a nyári előrejelző */
    S.pyr.my=6;
    const _ft=S.finalTable;
    S.finalTable=Array.from({length:16},(_,i)=>({you:i===0,n:"x"+i,pts:40-i}));
    let pl=null;try{pl=pyrLeapPlan();}catch(e){out.planHiba=String(e);}
    out.terv=pl?pl.agak.map(a=>({to:a.to,price:a.price})):null;
    S.finalTable=_ft;
    /* 6. mentés */
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    out.mentve=d&&d.S&&d.S.pyrLeapEasy;
    /* 3. feltételek: második idény */
    S.seasonNumber=2;S.pyr.my=5;
    out.masodik=pyrLeapTargetFrom(5);
    S.seasonNumber=1;
    /* nem D6-ban telt első idény */
    S.pyrLeapEasy=null;S.pyr.my=5;S.transferBudget=777;
    pyrLeapEasyRecord();
    out.nemD6=S.pyrLeapEasy;
    out.nemD6ar=pyrLeapTargetFrom(5);
    out.regiAr=PYR_LEAP_PRICE[4];
    return out;});
  console.log("\n— 1. a rögzítés —");
  ok(r.pyr&&r.div===6&&r.sz===1,"a karrier első idénye a D6-ban",{pyr:r.pyr,div:r.div,sz:r.sz});
  ok(r.rogzit===4321,"a kupa felajánlásakor a büdzsé eltevődik",r.rogzit);
  ok(r.egyszer===4321,"egyszer: egy későbbi, nagyobb büdzsé nem írja felül",r.egyszer);
  console.log("\n— 2. az ár —");
  ok(r.d4&&r.d4.to===4&&r.d4.price===4321+500,"a D4-be ugrás ára = a kupa-induláskori büdzsé + 1 Mrd (500 pont)",r.d4);
  ok(r.d3.price===30000&&r.d2.price===45000&&r.d1.price===60000,"a D3/D2/D1 ára változatlan",{d3:r.d3,d2:r.d2,d1:r.d1});
  console.log("\n— 3. feltételek —");
  ok(r.masodik&&r.masodik.price===r.regiAr,"a 2. idénytől a régi ár",r.masodik);
  ok(!r.nemD6&&r.nemD6ar.price===r.regiAr,"nem D6-ban telt első idény: nincs rögzítés, régi ár",{rec:r.nemD6,ar:r.nemD6ar});
  console.log("\n— 4–6. —");
  ok(r.ajanlat.van&&r.ajanlat.ar,"a valódi all-in ajánlat ezt az árat mutatja",r.ajanlat);
  ok(r.ajanlat.nemArul,"…és semmi nem utal arra, honnan jön az ár");
  ok(r.terv&&r.terv.some(a=>a.to===4&&a.price===4321+500),"a nyári előrejelző is ezt az árat mondja",r.terv);
  ok(r.mentve&&r.mentve.budget===4321&&r.mentve.season===1,"a mentés viszi",r.mentve);
  ok(!r.offerHiba&&!r.ajHiba&&!r.planHiba&&errs.length===0,"nincs oldalhiba",{o:r.offerHiba,a:r.ajHiba,p:r.planHiba,e:errs.slice(0,3)});
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
