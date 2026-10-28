/* 🐟 3.9.327 — ÚJ SKILL: CSUKAFEJES (fw_header).

   KÉRÉS: „Csukafejes — megnöveli a sima gólszerzési esélyt enyhébben, mint
   bármelyik másik csatár képesség […] De: szögletből gól esélyt az egész
   csapatra megnöveli, saját szögletből gól fejes esélye a többiekhez képest:
   +50%, és ha van a csapatban tökéletes beadás játékos, akkor együtt a
   gólszerzési esélyük +8%, ha pedig van köztük bármilyen kémia, az is ad rá:
   pár: +15%, passz: +10%, gyilkos: +7%, szárny: +12%. Legyen hozzá special
   animáció, feed kommentár, stb."

   Amit mér:
     1. a skill: csatár, goalw ×1,4 — a legenyhébb a csatár gólszerző-skillek
        közt —, és a sima pörgetésből is jöhet;
     2. a csapat-hatás: a saját gólvárhatóság ×1,03, a szögletgól-arány ×1,3,
        szögletnél ő ×1,5 — skill nélkül mind 1;
     3. a duó: tökéletes beadással +8%, és a kémiák rátesznek (pár +15%,
        passz +10%, gyilkos +7%, szárny +12%); félig megtanult skillnél fele;
     4. valódi meccseken: a meccs-magyarázat néven nevezi (Csukafejes), nincs
        hiba;
     5. a jelenet: CSUKAFEJES! felirat, és a közvetítés-sor jelöli (a gól a
        skill jelenetét kapja);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9327;
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


  console.log("— 1. a skill —");
  const r1=await p.evaluate(()=>{
    const sk=SKILLS.find(s=>s.id==="fw_header");
    const gw=s=>s.type==="goalw"?s.val:(s.combo||[]).filter(c=>c.type==="goalw").map(c=>c.val)[0];
    const csatar=SKILLS.filter(s=>(s.cat==="CSATAR"||s.cat2==="CSATAR")&&s.id!=="fw_header"&&gw(s)>1).map(s=>[s.id,gw(s)]);
    return {van:!!sk,cat:sk&&sk.cat,tip:sk&&sk.type,val:sk&&sk.val,min:Math.min(...csatar.map(x=>x[1])),csatar,
      porget:MAIN_SKILLS.some(s=>s.id==="fw_header")};});
  ok(r1.van&&r1.cat==="CSATAR"&&r1.tip==="goalw"&&r1.val===1.4,"csatár-skill, goalw ×1,4",r1);
  ok(r1.val<r1.min,"a legenyhébb a csatár gólszerző-skillek közt",{val:r1.val,min:r1.min});
  ok(r1.porget,"a sima jutalom-pörgetésből is jöhet",r1.porget);

  console.log("— 2. a csapat-hatás és 3. a duó —");
  const r2=await p.evaluate(()=>{
    const o={};
    const sk=SKILLS.find(s=>s.id==="fw_header"),cr=SKILLS.find(s=>s.id==="mf_cross");
    const pl=slots.filter(s=>s.player).map((s,i)=>({p:s.player,idx:i}));
    const cs=pl.find(a=>/CS|ÁÉ/.test(slots[a.idx].pos))||pl[pl.length-1],bd=pl.find(a=>a!==cs&&!/KP/.test(slots[a.idx].pos));
    const A=cs.p.n,B=bd.p.n;
    S.skills[A]=[];S.skills[B]=[];
    o.nincs=[csukaLamMult(pl,null),csukaSzogletArany(pl,null),csukaSzogletSuly(A),csukaGoalMult(A,pl,null)].join();
    S.skills[A]=[{skill:sk,stagesNeeded:1,stagesCompleted:1}];
    o.van=[csukaLamMult(pl,null),csukaSzogletArany(pl,null),csukaSzogletSuly(A),csukaGoalMult(A,pl,null)].map(x=>Math.round(x*1000)/1000).join();
    o.goalw=multSkillEffect(A,"goalw");o.goalwVart=scaledGoalwVal(1.4);o.flank=scaledGoalwVal(1.55);
    /* piros lapos csukafejes nem számít */
    o.piros=csukaLamMult(pl,new Set([cs.idx]));
    S.skills[B]=[{skill:cr,stagesNeeded:1,stagesCompleted:1}];
    o.duo=Math.round(csukaGoalMult(A,pl,null)*1000)/1000;
    /* kémiák */
    S.chemPairs=S.chemPairs||{};S.chemPairs[chemKey(A,B)]={a:A,b:B,stages:CHEM_PAIR_NEED};
    o.par=Math.round(csukaGoalMult(A,pl,null)*1000)/1000;
    const ps=passChemStore();ps[passChemKey(A,B)]={stages:PASS_CHEM_NEED};
    o.passz=Math.round(csukaGoalMult(A,pl,null)*1000)/1000;
    gpDuoState()[gpDuoKey(A,B)]={built:1,done:1,stages:9};
    o.gyilkos=Math.round(csukaGoalMult(A,pl,null)*1000)/1000;
    szarnyState()[szarnyKey(A,B)]={built:1,done:1};
    o.szarny=Math.round(csukaGoalMult(A,pl,null)*1000)/1000;
    o.kem=csukaKemia(A,B).k.join(", ");
    o.beado=(csukaBeado(A,pl,null)||{}).n===B;
    /* félig megtanult */
    S.skills[A]=[{skill:sk,stagesNeeded:2,stagesCompleted:1}];
    o.fel=[csukaLamMult(pl,null),csukaSzogletSuly(A)].map(x=>Math.round(x*1000)/1000).join();
    S.skills[A]=[{skill:sk,stagesNeeded:1,stagesCompleted:1}];
    window._csA=A;window._csB=B;
    return o;});
  ok(r2.nincs==="1,1,1,1","skill nélkül minden szorzó 1 (a motor bitre a régi)",r2.nincs);
  ok(r2.van==="1.03,1.3,1.5,1"&&Math.abs(r2.goalw-r2.goalwVart)<1e-9&&r2.goalw<r2.flank,"vele: λ ×1,03, szögletarány ×1,3, szögletnél ×1,5, sima a ×1,4 (a globális skálázással is a legkisebb)",r2);
  ok(r2.piros===1,"kiállítva nem hat",r2.piros);
  ok(r2.duo===1.08&&r2.beado,"tökéletes beadással együtt +8%",r2.duo);
  ok(r2.par===1.23&&r2.passz===1.33&&r2.gyilkos===1.4&&r2.szarny===1.52,"a kémiák rátesznek: pár +15%, passz +10%, gyilkos +7%, szárny +12%",r2);
  ok(r2.kem==="párkémia, passzkémia, gyilkos páros, szárny","a kémiák névvel",r2.kem);
  ok(r2.fel==="1.015,1.25","félig megtanult skillnél fele hatás",r2.fel);

  console.log("— 4. valódi meccseken —");
  const r4=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const out=[];const i0=S.idx;S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<20000&&S.idx<i0+4&&S.idx<30;i++){await varj(20);
      const M=S.lastMatch;if(M&&M.mx&&!out.some(x=>x.r===M.round))out.push({r:M.round,tet:M.mx.tet.map(t=>t.k)});}
    S.auto=false;await varj(800);
    const sorok=[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent);
    return {n:out.length,csuka:out.filter(x=>x.tet.indexOf("csuka")>=0).length,nev:MX_NEV.csuka,
      sor:sorok.filter(t=>/🐟/.test(t)).slice(0,3)};});
  ok(r4.n>=3&&r4.csuka===r4.n&&/Csukafejes/.test(r4.nev),"a meccs-magyarázat minden meccsen néven nevezi (Csukafejes)",r4);

  console.log("— 5. a jelenet —");
  const r5=await p.evaluate(()=>{
    const ev={t:"gol",side:"us",p:window._csA,min:30,seq:99,skill:"fw_header",skillP:window._csA};
    const nev=evaSkillSablon(ev);const T=EVA_SABLON[nev];
    const c=evaKontextus(ev);const svg=T.svg(c);let hiba=null;
    try{T.mozgas(()=>({}),c);}catch(e){hiba=String(e);}
    /* a közvetítés-sor jelöli a gólt */
    sbEv("us","goal",window._csA,33);addLine(`33'  SZÖGLET UTÁN, FEJJEL! GÓL! Teszt  1:0`,"m goal");
    addLine(`→ 🐟 CSUKAFEJES! Teszt vetődve fejelt`,"m skillnote",true,{skill:"fw_header",skillP:window._csA});
    const L=mevLista().filter(e=>e.t==="gol");const g=L[L.length-1];
    return {nev,cim:T.cim(c),alcim:T.alcim&&T.alcim(c),ok:/evaLabda/.test(svg)&&/evaLovo/.test(svg)&&/evaKapus/.test(svg),hiba,
      esemeny:g&&g.skill,sablon:g&&evaSkillSablon(g)};});
  ok(r5.nev==="skCsuka"&&r5.cim==="CSUKAFEJES!"&&r5.ok&&!r5.hiba,"a jelenet: CSUKAFEJES! felirattal, szögletzászló, ívelés, vetődés",r5);
  ok(r5.esemeny==="fw_header"&&r5.sablon==="skCsuka","a közvetítés-sor a gólt a Csukafejes jelenetéhez köti",r5);

  console.log("— 6. oldalhibák —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
