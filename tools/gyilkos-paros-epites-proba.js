/* 🧲 A GYILKOS PÁROS ÉPÍTÉSE — ÚGY, MINT A PASSZKÉMIA (3.9.138).

   BEJELENTÉS: „Nem igazán lehet jól követni a gegenpressing kémia építését.
   Automatikusan épül? Nekem kell építeni? […] sokkal hatásosabb lenne, ha épp
   úgy épülne, mint a passzkémia, vagy a sima kémia. Hogy felajánlja a
   rendszer és te dönthetsz kik között építed, és minden körnél te építed
   tovább. Jelenleg semmi ilyen nincs."

   Amit mér:
     1. a meccs utáni léptetés NEM indít párt magától (a régi hiba);
     2. a választó: ajánlott pár egy koppintással, két lépéses kézi választás;
        az első fázis elindítja, és a napló kimondja;
     3. a következő felajánlás az épülő párt viszi tovább (chemGoOn), és a
        váltás után a megkezdett fázisok megmaradnak;
     4. 5/5 → KÉSZ: a pressing-szorzó él, ha mindketten pályán vannak, és a
        páros partnerként olvasható;
     5. az összeérés a kész pár közös meccseiből halad, és a végén a sebesség
        kiegyenlítődik (ráadással), kimondva;
     6. egy ember egy páros: a kész pár tagjai nem jelölhetők;
     7. régi mentés: a kész pár kész marad, a némán indult félkész pár fázist
        kap és folytatható;
     8. a JUTALOM-SORBAN tényleg ott a dobás: egy auto-szezon a felajánláson
        át épít párt;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9143;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof showGpDuoBuild==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a gyilkos páros választója létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
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
    phase="season";
    S.style={key:"gegen",chosenSeason:1,traits:{gyilkos_paros:2},ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
    S.gpDuo={};S.gpDuoMig=1;S.gpDuoInProgress=null;
    const naplo=[];const _add=addLine;addLine=(h)=>naplo.push(String(h));
    /* legyen hat jelölhető: a mezőnyjátékosok közül néhány középpályás-posztot kap */
    let pot=0;
    slots.forEach(sl=>{if(!sl.player||sl.pos==="KP")return;
      const e=careerPool[sl.player.n];
      if(!gpDuoEligible(sl.player.n)&&pot<4){e.pos=["TKP"].concat(e.pos.filter(x=>x!=="TKP"));pot++;}});
    const jel=slots.map(s=>s.player&&s.player.n).filter(n=>n&&gpDuoEligible(n));
    ki.jelolhetok=jel.length;
    try{
      /* ---- 1. nincs néma indulás ---- */
      gpDuoTick(new Set(jel));gpDuoTick(new Set(jel));
      ki.nema={parok:Object.keys(S.gpDuo).length};

      /* ---- 2. a választó ---- */
      let visszahivas=0;
      showGpDuoBuild(()=>{visszahivas++;});
      const box=document.getElementById("skillAssignList");
      ki.valaszto={cim:document.getElementById("skillTitle").textContent,
        ajanlott:!!box.querySelector("[data-imm-ajanl]"),
        sorok:box.querySelectorAll(".prow").length};
      /* kézi, két lépésben: az ajánlott helyett a két utolsó jelölhető */
      const [A,B]=[jel[jel.length-1],jel[jel.length-2]];
      gpDuoPickFirst=A;
      gpDuoCommitPair(A,B);
      ki.elso={fazis:gpDuoStages(A,B),epul:S.gpDuoInProgress===gpDuoKey(A,B),
        napló:naplo.some(x=>/Gyilkos páros épül/.test(x)),vissza:visszahivas};

      /* ---- 3. továbbépítés és váltás ---- */
      showGpDuoBuild(()=>{visszahivas++;});
      ki.tovabb={goOn:!!document.getElementById("chemGoOn"),cim:document.getElementById("skillTitle").textContent};
      advanceGpDuoManual();
      ki.tovabb.fazis=gpDuoStages(A,B);
      S.gpDuoInProgress=null;   /* „Mégis másik párost építek" */
      const [C,D2]=[jel[0],jel[1]];
      gpDuoCommitPair(C,D2);
      ki.valtas={regi:gpDuoStages(A,B),uj:gpDuoStages(C,D2),epul:S.gpDuoInProgress===gpDuoKey(C,D2)};
      gpDuoCommitPair(A,B);   /* vissza a régihez: onnan folytatja */
      ki.valtas.folytat=gpDuoStages(A,B);

      /* ---- 4. KÉSZ ---- */
      const eA=careerPool[A],eB=careerPool[B];
      eA.attrs.seb=60;eB.attrs.seb=84;
      while(gpDuoStages(A,B)<GP_DUO_NEED)gpDuoCommitPair(A,B);
      const active=slots.map((sl,idx)=>({p:sl.player,idx}));
      ki.kesz={aktiv:gpDuoIsDone(A,B),partner:gpDuoPartner(A)===B,
        mult:gpDuoTeamMult(active),
        multEgyedul:gpDuoTeamMult(active.filter(x=>x.p.n!==B)),
        napló:naplo.some(x=>/Gyilkos páros kész/.test(x)),epulNincs:S.gpDuoInProgress===null};

      /* ---- 5. összeérés ---- */
      const need=gpDuoRipeNeed();
      for(let i=0;i<need-1;i++)gpDuoTick(new Set([A,B]));
      ki.oszeeres={elotte:!!S.gpDuo[gpDuoKey(A,B)].done,n:S.gpDuo[gpDuoKey(A,B)].n,need};
      gpDuoTick(new Set([A]));   /* egyedül nem számít */
      ki.oszeeres.egyedul=S.gpDuo[gpDuoKey(A,B)].n;
      gpDuoTick(new Set([A,B]));
      ki.oszeeres.utana=!!S.gpDuo[gpDuoKey(A,B)].done;
      ki.oszeeres.seb=[Math.round(eA.attrs.seb),Math.round(eB.attrs.seb)];
      ki.oszeeres.napló=naplo.some(x=>/ÖSSZEÉRT A GYILKOS PÁROS/.test(x));

      /* ---- 6. egy ember egy páros ---- */
      gpDuoPickFirst=null;renderGpDuoPick();
      const html=document.getElementById("skillAssignList").innerHTML;
      ki.egy={pairOk:gpDuoPairOk(A,C),ajanl:(()=>{const aj=gpDuoAjanlPair(false);return aj?[aj.a,aj.b]:null;})(),
        listaban:html.indexOf(esc(shortName(A)))>=0};
      ki.egy.aj_nincsA=!ki.egy.ajanl||(ki.egy.ajanl.indexOf(A)<0&&ki.egy.ajanl.indexOf(B)<0);

      /* ---- 7. régi mentés ---- */
      S.gpDuo={};S.gpDuo[gpDuoKey(jel[2],jel[3])]={n:15,done:1};S.gpDuo[gpDuoKey(jel[4],jel[5]||jel[0])]={n:7};
      S.gpDuoMig=0;
      const Dm=gpDuoState();
      const r1=Dm[gpDuoKey(jel[2],jel[3])],r2=Dm[gpDuoKey(jel[4],jel[5]||jel[0])];
      ki.regi={kesz:{built:r1.built,stages:r1.stages,aktiv:gpDuoActive(r1)},felkesz:{stages:r2.stages,built:!!r2.built}};
    }finally{addLine=_add;}
    return ki;});

  console.log("\n— 1-3. ÉPÍTÉS —");
  ok(t.jelolhetok>=4,"van legalább négy jelölhető (támadó/középpályás)",t.jelolhetok);
  ok(t.nema.parok===0,"a meccs utáni léptetés NEM indít párt magától",t.nema);
  ok(/válassz párost/.test(t.valaszto.cim)&&t.valaszto.ajanlott&&t.valaszto.sorok>=3,"a választó: ajánlott pár + kézi lista",t.valaszto);
  ok(t.elso.fazis===1&&t.elso.epul&&t.elso.napló&&t.elso.vissza===1,"az első fázis elindítja, a napló kimondja, a sor folytatódik",t.elso);
  ok(t.tovabb.goOn&&/2\/5|1\/5/.test(t.tovabb.cim)&&t.tovabb.fazis===2,"a következő felajánlás az épülő párt viszi tovább",t.tovabb);
  ok(t.valtas.regi===2&&t.valtas.uj===1&&t.valtas.epul&&t.valtas.folytat===3,"váltás után a megkezdett fázisok megmaradnak, és folytatható",t.valtas);

  console.log("\n— 4-5. KÉSZ ÉS ÖSSZEÉRÉS —");
  ok(t.kesz.aktiv&&t.kesz.partner&&t.kesz.mult>1&&t.kesz.multEgyedul===1&&t.kesz.napló&&t.kesz.epulNincs,
     "5/5: kész — a pressing-szorzó csak együtt él, partnerként olvasható",t.kesz);
  ok(!t.oszeeres.elotte&&t.oszeeres.n===t.oszeeres.need-1&&t.oszeeres.egyedul===t.oszeeres.need-1,
     "az összeérés csak a közös meccsekből halad",t.oszeeres);
  ok(t.oszeeres.utana&&t.oszeeres.seb[0]===t.oszeeres.seb[1]&&t.oszeeres.seb[0]>=84&&t.oszeeres.napló,
     "összeérés: a sebesség kiegyenlítődik a gyorsabbikra (ráadással), kimondva",t.oszeeres);

  console.log("\n— 6-7. SZABÁLYOK, RÉGI MENTÉS —");
  ok(t.egy.pairOk===false&&t.egy.aj_nincsA&&!t.egy.listaban,"a kész pár tagja nem jelölhető új párba",t.egy);
  ok(t.regi.kesz.built&&t.regi.kesz.stages===5&&t.regi.kesz.aktiv,"régi mentés: a kész pár kész marad",t.regi);
  ok(t.regi.felkesz.stages>=1&&t.regi.felkesz.stages<5&&!t.regi.felkesz.built,"a némán indult félkész pár fázist kap, és folytatható",t.regi);

  /* ---- 8. A JUTALOM-SOR ---- */
  const m=await p.evaluate(async()=>{
    S.gpDuo={};S.gpDuoMig=1;S.gpDuoInProgress=null;
    const _p=gpDuoOfferP;gpDuoOfferP=()=>1;   /* minden elérhető dobás a párosé legyen */
    let hivas=0;const _as=autoStartGpDuo;autoStartGpDuo=function(){hivas++;return _as.apply(this,arguments);};
    const _add=addLine;addLine=()=>{};
    S.auto=true;matchSpeed=20;S.idx=0;buildSeasonFixtures();
    try{
      playMatch();
      for(let i=0;i<500&&S.idx<30&&!Object.keys(S.gpDuo).length;i++)await new Promise(r=>setTimeout(r,60));
    }finally{S.auto=false;gpDuoOfferP=_p;autoStartGpDuo=_as;addLine=_add;}
    const D=S.gpDuo;
    return {meccs:S.idx,hivas,parok:Object.keys(D).map(k=>({k,st:D[k].stages}))};});
  console.log("\n— 8. A JUTALOM-SOR —");
  ok(m.hivas>0&&m.parok.length>0&&m.parok.every(x=>x.st>=1),"egy auto-szezonban a felajánláson át épül pár",m);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
