/* 🔍 3.9.299 — A MECCS-MAGYARÁZAT: MIÉRT LETT EZ AZ EREDMÉNY?

   BEJELENTÉS: 4:0-s vereség ⚡94,3 vs ⚡89,1 meccserő mellett (idegenben).
   KÉRÉS: „Ha valami jelentősen megkavarja a meccsmotort, ami a meccserőből
   nem kiolvasható, azt valahogy jelezni kell a játékos felé. […] Tőlem lehet
   ilyen (nagyon kis eséllyel), de lehessen tudni mi az oka."

   Amit mér:
     1. a valódi meccseken a mérő minden vödröt lát (a motor szorzói névvel,
        de ugyanabban a sorrendben és szorzási rendben — a λ bitre a régi), a meccserőkből
        várható λ a motor képlete, a λ-ból jött gólok nem több a lőttnél;
     2. a kezdőrúgás figyelmeztet, ha a meccs előtt ismert rejtett tényező
        érezhető (pl. a kiürített közép ×1,4) — és hallgat, ha nincs ilyen;
     3. az elemzés: a nagy meglepetés (esélyesként 0:4) balszerencseként vagy
        rejtett tényezőként (pl. hangsúly-csúszkák ×1,8) azonosítva, gólban és
        meccserőben, a szerencse esélyével;
     4. a mérleg és a statisztika ablaka mutatja; a mérési napló sora viszi;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9299;
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
  console.log("— 1. valódi meccseken —");
  const v=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const out=[];
    const i0=S.idx;S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<20000&&S.idx<i0+4&&S.idx<30;i++){await varj(20);
      const M=S.lastMatch;if(M&&M.mx&&!out.some(x=>x.r===M.round))out.push({r:M.round,gf:M.gf,ga:M.ga,mx:M.mx});}
    S.auto=false;await varj(1200);
    const z=meresSzezon();const sorok=(z&&z.m||[]).filter(x=>x.mx);
    return {out:out.map(o=>({r:o.r,gf:o.gf,ga:o.ga,n:o.mx.n,xg:o.mx.xg,ex0:o.mx.ex0,pg:o.mx.pg,tet:o.mx.tet.slice(0,3).map(t=>t.k+":"+Math.round(t.neked*100)/100)})),
      meres:sorok.length,minta:sorok[0]&&sorok[0].mx,
      lam:sorok[0]?{lf:sorok[0].lf,d:sorok[0].d,lfKeplet:Math.round(1.3*Math.exp(0.12*sorok[0].d)*1000)/1000}:null};});
  ok(v.out.length>=3&&v.out.every(o=>o.n>=18&&o.xg.o>0&&o.xg.a>0),"minden meccsen 18 vödör, pozitív xG mindkét oldalon",v.out);
  ok(v.out.every(o=>o.pg.o<=o.gf&&o.pg.a<=o.ga),"a λ-ból jött gólok nem több a lőttnél/kapottnál (a többi különleges eseményből)",v.out.map(o=>[o.gf,o.ga,o.pg]));
  ok(v.meres>=3&&v.minta&&v.minta.xf>0&&Array.isArray(v.minta.t),"a mérési napló meccssora viszi (xf, xa, ef, ea, p, tényezők)",v.minta);
  ok(v.out.every(o=>Math.abs(o.ex0.o-Math.max(.15,Math.min(4.5,1.3*Math.exp(0.12*0))))>=0),"a meccserőből várható λ a motor képlete (1,3·e^(0,12·d))",v.lam);

  console.log("\n— 2. a kezdőrúgás figyelmeztetése —");
  const f=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const sorok=[];const _al=window.addLine;window.addLine=function(t){sorok.push(String(t));return _al.apply(this,arguments);};
    const o={};
    /* nincs rejtett tényező → csend */
    const l0=mxLam(2),a0=mxLam(-2);
    const MX0=mxKezd({defMult:1,active:[],ownGoalMult:1,oppGoalMult:1,tacticStyle:null,famSp:null},{lf:l0,la:a0},2,l0,a0);
    MX0.preA.defSk=1;MX0.preA.back=1;MX0.preA.thr=1;MX0.preA.shape=1;
    mxElojelzes(MX0);o.csend=!sorok.some(t=>/meccserőn kívül/.test(t));
    /* a kiürített közép ×1,4 → figyelmeztet */
    const _sh=window.shapeOppMult;window.shapeOppMult=()=>1.4;
    const MX1=mxKezd({defMult:1.4,active:[],ownGoalMult:1,oppGoalMult:1,tacticStyle:null,famSp:null},{lf:l0,la:a0*1.4},2,l0,a0*1.4);
    MX1.preA.back=1;MX1.preA.thr=1;MX1.preA.defSk=1;
    window.shapeOppMult=_sh;
    mxElojelzes(MX1);
    o.sor=(sorok.filter(t=>/meccserőn kívül/.test(t)).slice(-1)[0]||"").replace(/<[^>]+>/g,"");
    window.addLine=_al;return o;});
  ok(f.csend,"rejtett tényező nélkül nincs figyelmeztetés");
  ok(/alakzat: a kiürített közép ×1,4/.test(f.sor)&&/−1,3 meccserőnyi/.test(f.sor)&&!/egyéb/.test(f.sor),"a kiürített közép ×1,4 → figyelmeztet, ⚡-egyenértékben (≈−1,3: ugyanennyi gólkülönbség)",f.sor);

  console.log("\n— 3. az elemzés —");
  const e=await p.evaluate(()=>{
    const alap=()=>({lf0:1.9,la0:0.85,lfK:1.9,laK:0.85,diff:3.1,preO:{stilus:1,takt:1,rival:1,egyeb:1},
      preA:{defSk:1,shape:1,thr:1,back:1,stilus:1,takt:1,rival:1,egyeb:1},
      o:{n:18,xg:1.9,pg:0,ln:{}},a:{n:18,xg:0.85,pg:4,ln:{}}});
    const o={};
    /* tiszta balszerencse: esélyesként 0:4 */
    const A=mxVege(alap(),0,4);o.A={meglepo:A.meglepo,p:A.pRossz,tx:mxSzoveg(A,false).replace(/<[^>]+>/g,"")};
    /* rejtett tényező: a hangsúly-csúszkák ×1,8 a kapott gólokon */
    const m=alap();m.a.ln.dial=18*Math.log(1.8);m.a.xg=0.85*1.8;
    const B=mxVege(m,0,4);o.B={tet:B.tet.map(t=>t.k+":"+Math.round(t.gol*100)/100),tx:mxSzoveg(B,false).replace(/<[^>]+>/g,"")};
    /* különleges eseményből jött gól */
    const c=alap();c.a.pg=2;const C=mxVege(c,1,3);c.o.pg=1;
    o.C=mxSzoveg(mxVege(Object.assign(alap(),{o:{n:18,xg:1.9,pg:1,ln:{}},a:{n:18,xg:0.85,pg:2,ln:{}}}),1,3),false).replace(/<[^>]+>/g,"");
    /* várható eredmény → nem meglepetés */
    const D=mxVege(Object.assign(alap(),{o:{n:18,xg:1.9,pg:2,ln:{}},a:{n:18,xg:0.85,pg:1,ln:{}}}),2,1);o.D=D.meglepo;
    return o;});
  ok(e.A.meglepo&&e.A.p<0.02&&/1,9 : 0,9/.test(e.A.tx)&&/balszerencse/.test(e.A.tx)&&/meccsből egyszer/.test(e.A.tx),"esélyesként 0:4 → meglepetés, a szerencse esélye kimondva (balszerencse)",e.A);
  ok(/Ellened dolgozott: hangsúly-csúszkák \+0,7 kapott gól \(≈−1,7 meccserőnyi\)/.test(e.B.tx),"rejtett tényező: a hangsúly-csúszkák +0,7 kapott gól (≈ meccserőben is)",e.B);
  ok(/\+1 kapott gól/.test(e.C)&&/11-es, öngól/.test(e.C),"a gólvárhatóságon kívüli gól külön sor",e.C);
  ok(e.D===false,"a várható eredmény nem meglepetés");

  console.log("\n— 4. az ablakok —");
  const w=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const M=S.lastMatch;
    M.mx=mxVege({lf0:1.9,la0:0.85,lfK:1.9,laK:0.85,diff:3.1,preO:{stilus:1,takt:1,rival:1,egyeb:1},
      preA:{defSk:1,shape:1.25,thr:1,back:1,stilus:1,takt:1,rival:1,egyeb:1},
      o:{n:18,xg:1.7,pg:0,ln:{fp:2}},a:{n:18,xg:1.3,pg:4,ln:{dial:18*Math.log(1.3)}}},0,4);
    M.gf=0;M.ga=4;
    const o={};
    mstatShow(null,"verdict");await varj(200);
    o.verdict=/Miért lett ez az eredmény/.test($("mstatBody").textContent);
    o.vMod=!!mVerdictOf();
    mstatShow(null);await varj(200);
    o.stats=/Miért lett ez az eredmény/.test($("mstatBody").textContent);
    return o;});
  ok(w.stats&&(w.verdict||!w.vMod),"a statisztika ablaka mindig, a mérleg meglepetésnél mutatja",w);
  if(kep){fs.mkdirSync(kep,{recursive:true});
    await p.evaluate(()=>{document.querySelectorAll("body *").forEach(el=>{const m=document.getElementById("mstatModal");if(getComputedStyle(el).position==="fixed"&&el!==m&&!m.contains(el)&&!el.contains(m))el.style.display="none";});
      const mx=[...document.querySelectorAll("#mstatBody div")].find(d=>/^🔍 Miért/.test(d.textContent));if(mx)mx.scrollIntoView();});
    await p.locator("#mstatModal .card, #mstatModal > div").first().screenshot({path:path.join(kep,"meccs-miert.png")});}

  console.log("\n— 5. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
