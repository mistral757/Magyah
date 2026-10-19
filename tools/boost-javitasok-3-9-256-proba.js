/* 🛠 BOOSTOK, EGYENLÍTŐ, ISKOLATEREMTŐ, PvP-KAPUK (3.9.256)

   A felhasználó nyolcpontos listájából a 2. (csapatstílus) kivételével:
     1. Iskolateremtő: ha nincs kinek átadni, csillagozást indít;
     3. attribútum-boost: a boostolt pont nem vágódik vissza a sávba;
     4. egyenlítő: a MEGJELENÍTETT Ratingből számol, és mindenki a közös
        számra áll;
     5. 🌟 Fénykor (24–30, 98% ár, próbaidő), öreg róka −25%, ifi-boost +
        választott attribútum;
     6. vissza a katalógushoz az ifi/öreg/fénykor után;
     7. 🛒 tömeges boost (kosár) — elosztás, sorrendben, pénzkorláttal;
     8. PvP: a társ helyzete alapján nem várunk ott, ahová úgysem jön. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9467;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});


  const r=await p.evaluate(async()=>{
    const ki={};
    const ros=fullCareerRoster().filter(Boolean);
    const A=ros[0],B=ros[1],C=ros[2];
    const eA=careerPool[A.n],eB=careerPool[B.n],eC=careerPool[C.n];
    S.transferBudget=1e9;
    /* 3. attribútum-boost */
    {const k="passz";initPlayerAttrs(eA);
     const hi0=attrBandOf(eA,k).hi;
     eA.attrs[k]=hi0;
     for(let i=0;i<6;i++)applyAttrBoost(eA,k);
     const fel=eA.attrs[k];
     bumpAttr(eA,k,1);bumpAttr(eA,k,-1);
     ki.attr={hi0,fel,utana:eA.attrs[k],hi1:attrBandOf(eA,k).hi};}
    /* 4. egyenlítő a megjelenített Ratingből */
    {S.ratingAdj=S.ratingAdj||{};S.ratingAdj[A.n]=20;
     const dA=Math.round(eqRatingOf(eA).disp),dB=Math.round(eqRatingOf(eB).disp);
     const _el=eqEligible;eqEligible=()=>true;
     let res=null;try{res=applyEqualizeBoost([A.n,B.n],1);}finally{eqEligible=_el;}
     const plA=currentRoster().find(x=>x.n===A.n)||extraRoster.find(x=>x.n===A.n);
     const plB=currentRoster().find(x=>x.n===B.n)||extraRoster.find(x=>x.n===B.n);
     ki.eq={dA,dB,cel:res&&res.cel,uA:Math.round(pOvrDisplay(plA)),uB:Math.round(pOvrDisplay(plB)),elotte:res&&res.sorok.map(x=>x.elotte)};
     delete S.ratingAdj[A.n];}
    /* 5. Fénykor, öreg róka, ifi */
    {const _u=boostUnitPrice;boostUnitPrice=()=>1e9;
     try{ki.arany=boostPriceOf("prime")/boostPriceOf("youth");}finally{boostUnitPrice=_u;}
     const pr=primeBoostRanges(),or=oldBoostRanges();
     ki.ranges={pr,or};
     eA.age=27;eB.age=27;eC.age=33;
     ki.jogos=[isPrimeBoostable(eA),isPrimeBoostable(eC),isVeteranBoostable(eC)];
     phase="hub";S.idx=0;S.seasonNumber=2;
     const rA0=eA.startRating,tA0=eA.pot,rB0=eB.startRating,tB0=eB.pot;
     const ra=applyPrimeBoost(eA),rb=applyPrimeBoost(eB);
     ki.prime={ra,rb,dl:eA.primePending[0].dl};
     /* a próbaidő vége: A jó idényt fut, B nem játszik */
     S.seasonMatches=S.seasonMatches||{};S.scorers=S.scorers||{};S.assists=S.assists||{};
     S.seasonMatches[A.n]=20;S.scorers[A.n]=8;S.assists[A.n]=4;
     S.seasonMatches[B.n]=3;S.scorers[B.n]=0;
     S.seasonNumber=3;
     const ev=primeEvaluate();
     ki.primeEv={ev:ev.map(x=>[x.n===A.n?"A":"B",x.ok,x.r,x.t]),
       A:[eA.startRating-rA0,eA.pot-tA0],B:[eB.startRating-rB0,eB.pot-tB0],pendA:(eA.primePending||[]).length};
     ki.ifiSel=(ifiAttrValasztoHtml(eA).match(/<option/g)||[]).length;}
    /* 6. vissza a katalógushoz */
    {boostVisszaGombok("old");ki.vissza=[...document.querySelectorAll("#twActions button")].map(b=>b.textContent);}
    /* 7. kosár */
    {_kosar={kind:"attr",db:10,sorok:[{n:A.n,db:7,a:"passz"},{n:B.n,db:2,a:"ved"},{n:C.n,db:1,a:"gol"}]};
     S.transferBudget=1e12;
     const p0=[eA.attrs.passz,eB.attrs.ved,eC.attrs.gol];
     const o=boostKosarVegrehajt();
     ki.kosar={kesz:o.kesz,elm:o.elmaradt,fel:[eA.attrs.passz-p0[0],eB.attrs.ved-p0[1],eC.attrs.gol-p0[2]],nA:eA.attrBoost&&eA.attrBoost.n};
     _kosar={kind:"plain",db:5,sorok:[{n:A.n,db:5}]};
     S.transferBudget=boostPriceOf("plain")*2+1;
     const o2=boostKosarVegrehajt();
     ki.kosar2={kesz:o2.kesz,elm:o2.elmaradt};
     S.transferBudget=1e12;}
    /* 1. Iskolateremtő: nincs kinek átadni → csillagozás */
    {const sk=SKILLS.find(x=>x&&x.id&&!x.combo)||SKILLS[0];
     S.skills=S.skills||{};S.skills[A.n]=[{skill:sk,stagesNeeded:1,stagesCompleted:1}];
     S.starUnlocked={};
     const c={n:"Mester",type:"skill",fp:{skillsEver:[sk.id]},legacySpent:0,legacyOut:{}};
     const x=legacyStarFallback(c,[sk.id],new Set([A.n]));
     const inst=S.skills[A.n][0];
     ki.isk={x:!!x,nyitva:starUnlocked(sk.id),csillag:skillStars(inst),epul:skillStarBuilding(inst),spent:c.legacySpent};}
    /* 8. PvP: a társ helyzete */
    {const _bk=mpBk,_h=h2hRoomActive;
     window.__pos={guest:{comp:"EL",pi:0}};
     mpBk=()=>({h2hGet:async()=>window.__pos,h2hPut:async()=>{}});
     h2hRoomActive=()=>true;MP.activeRoom="TESZT";MP.role="host";
     const euro0=S.euro;S.euro={comp:"BL"};
     try{
       ki.pvp=[];
       ki.pvp.push(await mpMateElsewhere());                 /* más sorozat */
       window.__pos={guest:{comp:"BL",pi:0}};ki.pvp.push(await mpMateElsewhere());   /* ugyanott → várunk */
       window.__pos={guest:{comp:"BL",pi:0,apart:true}};ki.pvp.push(await mpMateElsewhere());
       window.__pos={guest:{done:true}};ki.pvp.push(await mpMateElsewhere());
       window.__pos={};ki.pvp.push(await mpMateElsewhere());   /* régi kliens → várunk */
     }finally{mpBk=_bk;h2hRoomActive=_h;S.euro=euro0;MP.activeRoom=null;}}
    return ki;});
  console.log("— 3. ATTRIBÚTUM-BOOST —");
  ok(r.attr.fel>r.attr.hi0&&r.attr.utana>=r.attr.fel-1&&r.attr.hi1>=r.attr.fel,"a boostolt pont a sáv fölött is megmarad egy attribútum-lépés után (a sáv teteje vele nő)",r.attr);
  console.log("\n— 4. EGYENLÍTŐ —");
  ok(r.eq.uA===r.eq.cel&&r.eq.uB===r.eq.cel&&r.eq.elotte[0]===r.eq.dA,"a megjelenített Ratingből számol, és utána mindkettő PONTOSAN a közös számon áll",r.eq);
  console.log("\n— 5. FÉNYKOR, ÖREG RÓKA, IFI —");
  ok(Math.abs(r.arany-0.98)<0.02,"a Fénykor ára az ifi-boost 98%-a",r.arany);
  ok(Math.abs(r.ranges.or.rHi/r.ranges.pr.rHi-0.75)<0.1&&Math.abs(r.ranges.or.tHi/r.ranges.pr.tHi-0.75)<0.02,"az öreg róka a régi erő 75%-a, a Fénykoré a teljes",r.ranges);
  ok(r.jogos[0]&&!r.jogos[1]&&r.jogos[2],"a Fénykor 24–30 évesre, az öreg róka 30 fölött",r.jogos);
  ok(r.prime.ra.rBoost>0&&r.prime.dl===2,"nyári Fénykor: a próbaidő a most induló idény",r.prime);
  ok(r.primeEv.ev.length===2&&r.primeEv.A[0]===r.prime.ra.rBoost&&r.primeEv.B[0]===0&&r.primeEv.B[1]===0&&r.primeEv.pendA===0,
    "a jó idény megtartja, a semmilyen idény pontosan a kapott értéket vonja le",r.primeEv);
  ok(r.ifiSel===6,"az ifi-boost megerősítőjében 5 tengely + „nem kérek\"",r.ifiSel);
  console.log("\n— 6. VISSZA —");
  ok(r.vissza.some(t=>/katalógus/.test(t))&&r.vissza.some(t=>/HUB/.test(t)),"a boost utáni képernyőn vissza a katalógushoz",r.vissza);
  console.log("\n— 7. KOSÁR —");
  ok(r.kosar.kesz===10&&r.kosar.elm===0&&r.kosar.fel.every(x=>x>0)&&r.kosar.nA>=7,"7 passz + 2 védekezés + 1 gólszerzés: mind elsül, a tengelyek nőnek",r.kosar);
  ok(r.kosar2.kesz===2&&r.kosar2.elm===3,"ha a pénz elfogy, a maradék elmarad",r.kosar2);
  console.log("\n— 1. ISKOLATEREMTŐ —");
  ok(r.isk.x&&r.isk.nyitva&&(r.isk.csillag>=1||r.isk.epul)&&r.isk.spent===1,"nincs kinek átadni → a csillagozás joga megnyílik, és elindul az első csillag",r.isk);
  console.log("\n— 8. PvP —");
  ok(!!r.pvp[0]&&r.pvp[1]===null&&!!r.pvp[2]&&!!r.pvp[3]&&r.pvp[4]===null,"más sorozat / szétvált / véget ért → nem várunk; ugyanott vagy régi kliens → várunk",r.pvp);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
