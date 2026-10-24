/* 🛡️ 3.9.295 — A PANZER HÉTKÖZNAPJAI: RETTENET ÉS MÉRFÖLDKŐ.

   KÉRÉS: „A panzer csapatstílus sokkal nehezebben kap csapatstílus
   mérföldköveket és rettenet pontot mint a többi, ezt javítsuk azzal, hogy
   legyenek sokkal hétköznapibb átlagosabb dolgok is, amiért kap mérföldkövet
   és rettenet pontot."

   Amit mér:
     1. a hétköznapi rettenet-tételek (meccs 0,5 · győzelem 1 · nullás meccs 1
        · gól 0,25 · blokk/tisztázás 0,15) a meccs mérlegébe kerülnek, némán,
        az összesítőben látszanak, és a meccs-plafon fog;
     2. az öt új család (győzelmek, győzelmek egy idényben, gólok, nullás
        meccsek, blokkok) a táblán van, a számlálóik a klub adataiból jönnek
        (idény-történet + futó idény, karrier-statisztika); a nullás meccs
        CSAPAT-szintű (nem kapus+védők);
     3. VALÓDI meccseken (Panzer, 6 meccs): minden meccs hoz rettenetet, és
        a hétköznapi tételek a mérlegben szerepelnek;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9296;
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




  console.log("— 1. a hétköznapi tételek —");
  const t1=await p.evaluate(()=>{
    S.style={key:"panzer",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,
      fear:{pts:0,earned:0,spent:0,retteges:0,mods:0}};S.style2=null;
    window.styleLevel=()=>8;try{styleLvlCacheClear();}catch(e){}
    const sor=[];const _al=window.addLine;window.addLine=function(t){sor.push(String(t));return _al.apply(this,arguments);};
    fearMatchStart();
    const a=fearState().earned;
    fearNote("played");fearNote("winAny");fearNote("cs");fearNote("goal",2);fearNote("block",4);
    const sc=dreadScale();
    const kap=fearMatchEnd();
    window.addLine=_al;
    const ossz=sor.filter(t=>/a mérkőzés mérlege/.test(t)).length;
    const bont=sor.find(t=>/felvonulás/.test(t))||"";
    const nemaKozben=sor.filter(t=>/☠️ <b>\+/.test(t)).length;
    return {kap,vart:Math.round((0.5+1+1+0.5+0.6)*sc*100)/100,cap:fearMatchCap(),ossz,bont:bont.replace(/<[^>]+>/g,"").slice(0,200),nemaKozben,sc};});
  ok(Math.abs(t1.kap-Math.min(t1.vart,t1.cap))<0.15,"a tételek: meccs 0,5 + győzelem 1 + nullás 1 + 2 gól 0,5 + 4 blokk 0,6 = 3,6 (a plafon fog)",t1);
  ok(t1.ossz===1&&/győzelem/.test(t1.bont)&&/kapott gól nélkül/.test(t1.bont)&&/blokk és tisztázás/.test(t1.bont)&&t1.nemaKozben===0,"némán gyűlnek, a meccs mérlegében tételesen látszanak",t1);

  console.log("\n— 2. az új családok —");
  const t2=await p.evaluate(()=>{
    const L=STYLE_MILESTONES.panzer;const fam={};L.forEach(d=>{fam[d.fam||d.id]=(fam[d.fam||d.id]||0)+1;});
    const o={fam:["pz_winall","pz_winseason","pz_goalall","pz_csall","pz_wall"].map(f=>fam[f]||0)};
    S.seasonHistory=[{season:1,w:12,gf:40},{season:2,w:15,gf:50}];S.seasonNumber=3;S.W=4;S.GF=9;
    o.wins=pzWinsAll();o.goals=pzGoalsAll();o.wSeason=pzWinsSeason();
    /* a lezárt idény nem számít kétszer */
    S.seasonHistory.push({season:3,w:4,gf:9});o.winsLezart=pzWinsAll();
    S.seasonHistory.pop();
    /* a nullás meccs: csapat-szinten — a kapus tiszta lapjaiból indul */
    S.careerStats=S.careerStats||{};
    const gk=Object.keys(careerPool).find(k=>careerPool[k].pos&&careerPool[k].pos[0]==="KP");
    const vedo=Object.keys(careerPool).find(k=>careerPool[k].pos&&careerPool[k].pos[0]==="KV");
    S.careerStats[gk]=Object.assign(S.careerStats[gk]||{},{cs:7});if(vedo)S.careerStats[vedo]=Object.assign(S.careerStats[vedo]||{},{cs:7});
    delete msT().pzCs;o.cs=pzCsAll();
    o.blk=(()=>{const n=Object.keys(S.careerStats)[0];S.careerStats[n].bl=(S.careerStats[n].bl||0)+5;S.careerStats[n].cl=(S.careerStats[n].cl||0)+3;return pzWallAll()>=8;})();
    return o;});
  ok(t2.fam.join()==="18,6,18,14,18","öt új család a Panzer tábláján (18 / 6 / 18 / 14 / 18 fokozat)",t2.fam);
  ok(t2.wins===31&&t2.goals===99&&t2.wSeason===15&&t2.winsLezart===31,"győzelmek és gólok: idény-történet + futó idény, a lezárt idény nem duplázódik; idény-csúcs 15",t2);
  ok(t2.cs===7&&t2.blk,"a nullás meccs csapat-szintű (a kapus 7 tiszta lapja, a védőé nem adódik hozzá); blokk + tisztázás összeadódik",t2);

  console.log("\n— 3. valódi meccseken —");
  const t3=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.seasonHistory=[];S.seasonNumber=1;delete msT().pzCs;
    S.style.fear={pts:0,earned:0,spent:0,retteges:0,mods:0};
    const merleg=[];const _al=window.addLine;window.addLine=function(t){const x=String(t);if(/a mérkőzés mérlege|felvonulás/.test(x))merleg.push(x.replace(/<[^>]+>/g,""));return _al.apply(this,arguments);};
    const i0=S.idx;S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<20000&&S.idx<i0+6;i++){await varj(20);document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(m=>m.classList.add("hide"));}
    S.auto=false;await varj(1200);window.addLine=_al;
    return {meccs:S.idx-i0,earned:fearState().earned,merleg:merleg.length,felvonulas:merleg.filter(t=>/felvonulás/.test(t)).length,minta:merleg.slice(0,2)};});
  ok(t3.meccs>=6&&t3.felvonulas>=t3.meccs&&t3.earned>=t3.meccs*0.5,"minden meccs hoz rettenetet, a hétköznapi tételek a mérlegben",t3);

  console.log("\n— 4. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
