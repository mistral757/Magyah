/* 🎖️ 3.9.195 — PROFILSZINT, STÍLUS-MESTERSÉG, LENYITHATÓ PROFIL.

   BEJELENTÉS: „Már egy ideje bennem van, hogy ezt a profil részt le kéne
   tisztázni. Csomó infó végtelenségig görgetve. Helyette. Minden legyen
   kinyithatos menüpont. És! Legfelül: 1. Legyen egy profil lvl rendszer is,
   ami a karriereken átívelő statokat gyűjti és azokból csinál
   mérföldköveket, és azokból szinteket. […] 2. Lenne egy csapatstílus
   szerepekhez igazodó külön lvl rendszer […] Itt is mérföldköveket
   gyűjthetünk. És itt egy skill fa lenne megnyitható, ami az egyes
   stílusokhoz tartozó könnyítéseket oldana fel. Minden szint +1 nyitás a fán"

   Amit mér:
     1. VISSZAMENŐLEG: egy meglévő karrier-mentés idény-történetéből
        feltöltődik (meccsek, győzelmek, gólok, idények, címek, kupák,
        karrierek, a stílus idényei és mérföldkövei);
     2. A MECCS: a profil és az élő stílus számol, a szerepek (a stílus
        megbízatásai) meccsei és termése is; ugyanaz a meccs kétszer nem;
        az idény és a kupa szintén duplikáció-védett;
     3. A SZINTEK: a mérföldkő-fokozatok XP-je és a szintküszöbök;
     4. A MESTERSÉG-FA: szintenként +1 pont, a rang-kapuk (2 / 5 / 8), pont
        nélkül nincs nyitás;
     5. A HATÁSOK: a képességár kedvezménye, a mérföldkő-prémium, a
        „Második otthon" osztója, a „Rutin" szint-pontja, a választáskori
        hozott tudás (egyszer);
     6. A FELÜLET: a profil feje (szint, rang, XP), minden szekció
        lenyitható, a nyitott állapot megmarad, a 8 stílus kártyája a fával,
        a nyitás gombja működik, az „Örök csúcsok" ugrás kinyitja a
        szekciót; a mentés viszi a karrier-azonosítót; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9239;
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
  await p.waitForFunction(()=>typeof profileLevel==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    tiszta();


    window.saveGame=()=>{};
    const xs=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    const pA=xs[3].n,pB=xs[4].n;
    const friss=()=>{localStorage.removeItem(PROF_KEY);_profCache=null;};
    /* ---- 1. VISSZAMENŐLEG ---- */
    const k2=spSaveKeyFor(3);
    const regiMentes={phase:"season",gameMode:"career",teamName:"Régi FC",careerPool:{},S:{seasonNumber:3,idx:12,W:7,D:3,L:2,GF:20,GA:9,
      seasonHistory:[{season:1,rank:1,w:20,d:5,l:5,gf:60,ga:25},{season:2,rank:3,w:18,d:6,l:6,gf:55,ga:30,euro:{comp:"MK",won:true}}],
      style:{key:"beton",chosenSeason:2,traits:{},ms:{done:{a:1,b:1,c:1},seen:{},t:{}}}}};
    localStorage.setItem(k2,JSON.stringify(regiMentes));
    friss();const P0=profStore();
    ki.mig={meccs:P0.t.meccs,gy:P0.t.gy,gol:P0.t.gol,idenyek:P0.t.idenyek,bajnok:P0.t.bajnok,dobogo:P0.t.dobogo,kupa:P0.t.kupa,kar0:P0.kar0,
      beton:Object.assign({},P0.st.beton||{})};
    localStorage.removeItem(k2);
    /* ---- 2. A MECCS ---- */
    friss();profStore();
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};S.style2=null;
    S.roles={season:S.seasonNumber||1,map:{fal:pA,arok:pB}};
    S.lastMatch={us:"T",them:"E",players:[{n:pA,g:3},{n:pB,a:1},{n:xs[5].n}]};
    /* új karrier: az első forduló, előzmény nélkül */
    const _sn=S.seasonNumber,_sh=S.seasonHistory;S.seasonNumber=1;S.seasonHistory=[];
    S.profCid=null;S.idx=1;
    const a1=profNoteMatch({gf:3,ga:0});
    const a2=profNoteMatch({gf:3,ga:0});
    S.lastMatch={us:"T",them:"E",players:[{n:pA},{n:pB}]};
    S.idx=2;const a3=profNoteMatch({gf:1,ga:2});
    const T=profStore().t,BB=profStyle("beton");
    ki.meccs={a1,a2,a3,meccs:T.meccs,gy:T.gy,vr:T.vr,gol:T.gol,tiszta:T.tiszta,mh:T.mh,
      st:{m:BB.m,w:BB.w,sz:BB.sz,szg:BB.szg},cid:!!S.profCid,cidUj:!profStore().cids[S.profCid].old};
    const s1=profNoteSeason(1),s2=profNoteSeason(1);
    S.seasonNumber=_sn;S.seasonHistory=_sh;
    const c1=profNoteCup(true,"MK"),c2=profNoteCup(true,"MK");
    ki.ideny={s1,s2,c1,c2,idenyek:profStore().t.idenyek,bajnok:profStore().t.bajnok,kupa:profStore().t.kupa,stI:profStyle("beton").i};
    /* ---- 3. A SZINTEK ---- */
    friss();const P=profStore();
    P.t.meccs=100;P.t.gy=40;P.t.gol=100;   /* 4+3+3 fokozat */
    const xp=profXp(),L=profileLevel();
    ki.szint={xp,L,vart:5*4*5+5*3*4+5*3*4,thrOk:xp>=profLvlThr(L)&&xp<profLvlThr(L+1),rang:profileRank(L)};
    /* ---- 4. A MESTERSÉG-FA ---- */
    friss();
    const nincs=masteryOpen("beton","hozott1");
    const sB=profStyle("beton");sB.m=320;sB.w=200;sB.sz=350;sB.szg=200;sB.i=11;   /* 3.9.197: 5+5+4+4+4 fokozat → 150+150+100+100+100=600 XP → 3. szint */
    const ML=masteryLevel("beton"),pt0=masteryPoints("beton");
    const o1=masteryOpen("beton","hozott1"),o2=masteryOpen("beton","fa1");
    const t2=MASTERY_NODES.find(n=>n.id==="fa2");const st2=masteryNodeState("beton",t2);
    const o3=masteryOpen("beton","prem1");
    const o4=masteryOpen("beton","prem2");   /* nincs több pont */
    const t3=MASTERY_NODES.find(n=>n.id==="masodik");const st3=masteryNodeState("beton",t3);
    ki.fa={nincs:nincs.ok,ML,pt0,o1:o1.ok,o2:o2.ok,st2,o3:o3.ok,o4:o4.ok,o4ok:o4.reason,st3,pt:masteryPoints("beton")};
    /* 3.9.197 — A TEMPÓ: egy tipikus 3 idényes, egy kétszer ilyen és egy 10 idényes karrier */
    const tempo=v=>{friss();Object.assign(profStyle("beton"),v);return masteryLevel("beton");};
    ki.tempo=[tempo({m:90,w:50,sz:200,szg:60,i:3,b:1,ms:30,lv:10}),
              tempo({m:180,w:100,sz:400,szg:120,i:6,b:2,ms:60,lv:14}),
              tempo({m:300,w:170,sz:750,szg:200,i:10,b:4,ms:100,lv:18})];
    /* ---- 5. A HATÁSOK ---- */
    friss();const S5=profStyle("beton");S5.m=1000;S5.w=650;S5.sz=1300;S5.szg=800;S5.i=30;S5.b=15;S5.ms=300;S5.lv=20;
    ki.maxL=masteryLevel("beton");
    const tr=styleTraitList("beton")[0];
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};styleViewSet(1);
    const ar0=styleTraitNextPrice(tr,S.style);
    const ms0=styleMsRewardFor(S.style,10);
    ["fa1","prem1","hozott1","fa2","prem2","hozott2","masodik","rutin","hozott3","mester"].forEach(id=>masteryOpen("beton",id));
    const ar1=styleTraitNextPrice(tr,S.style);
    const ms1=styleMsRewardFor(S.style,10);
    const fxB=masteryFx("beton");
    /* másodlagosként */
    S.style={key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};
    S.style2={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};
    const sec=styleMsRewardFor(S.style2,30);
    const secElso=Math.max(1,Math.round(Math.max(1,Math.round(msSpReward(30,true)*(1+fxB.msPrem)))/Math.min(talStyle2MsDiv(),MASTERY_SEC2_DIV)));
    S.style2=null;
    /* hozott tudás: egyszer */
    S.masteryGranted={};const W=msState();const sp0=W.sp||0;
    const g1=masteryStartGrant("beton"),g2=masteryStartGrant("beton");
    ki.hatas={ar0,ar1,arVart:Math.max(1,Math.round(tr.lv[0].price*talStilusArMult()*(1-0.10))),ms0,ms1,fx:fxB,sec,secElso,g1,g2,spNo:(W.sp||0)-sp0};
    /* a valódi választás is jóváír */
    S.style=null;S.style2=null;S.masteryGranted={};
    const _cc=styleCanChoose;window.styleCanChoose=()=>true;
    const sp1=msState().sp||0;const r=chooseStyle("beton",null);const sp2=msState().sp||0;
    window.styleCanChoose=_cc;
    ki.valaszt={ok:r.ok,plusz:sp2-sp1};
    /* ---- 6. A FELÜLET ---- */
    localStorage.removeItem(PROF_OPEN_KEY);
    openProfileModal();
    const body=document.getElementById("profileBody");
    const secs=[...body.querySelectorAll("details.pfSec")].map(d=>({id:d.dataset.sec,open:d.open}));
    ki.ui={fej:!!body.querySelector(".pfHead")&&/profilszint/.test(body.querySelector(".pfHead").textContent),
      secs,sty:body.querySelectorAll("details.pfSty").length,
      fa:body.querySelectorAll("details.pfSty .pfNode").length};
    const d=body.querySelector('details.pfSec[data-sec="helyi"]');d.open=true;d.dispatchEvent(new Event("toggle"));
    renderProfileModal(null);
    ki.ui.megmarad=document.querySelector('#profileBody details.pfSec[data-sec="helyi"]').open;
    /* nyitás gombbal */
    friss();const S6=profStyle("tikitaka");S6.m=320;   /* 3.9.197: 5 fokozat = 150 XP → 1. szint */
    renderProfileModal(null);
    const gomb=document.querySelector('#profileBody button.pfNyit[data-mst="tikitaka"]');
    if(gomb)gomb.click();
    ki.ui.gomb=!!gomb&&!!masteryOpened("tikitaka")[gomb.dataset.node];
    document.getElementById("profileModal").classList.add("hide");
    localStorage.removeItem(PROF_OPEN_KEY);
    openProfileAt("records");
    ki.ui.rekordNyitva=document.querySelector('#profileBody details.pfSec[data-sec="rekord"]').open;
    document.getElementById("profileModal").classList.add("hide");
    ki.mentes=[...document.scripts].some(sc=>/profCid:S\.profCid/.test(sc.textContent));
    friss();
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. VISSZAMENŐLEG —");
  ok(r.mig.meccs===30+30+12&&r.mig.gy===20+18+7&&r.mig.gol===60+55+20,"meccsek, győzelmek, gólok a mentésből (a futó idénnyel)",r.mig);
  ok(r.mig.idenyek===2&&r.mig.bajnok===1&&r.mig.dobogo===2&&r.mig.kupa===1&&r.mig.kar0>=1,"idények, címek, dobogó, kupa, karrier",r.mig);
  ok(r.mig.beton&&r.mig.beton.i===1&&r.mig.beton.m===30+12&&r.mig.beton.ms===3,"a stílus idényei, meccsei és mérföldkövei (a választás idényétől)",r.mig.beton);
  console.log("\n— 2. A MECCS —");
  ok(r.meccs.a1&&!r.meccs.a2&&r.meccs.a3&&r.meccs.meccs===2,"egy meccs egyszer számít (duplikáció-védett)",r.meccs);
  ok(r.meccs.gy===1&&r.meccs.vr===1&&r.meccs.gol===4&&r.meccs.tiszta===1&&r.meccs.mh===1,"győzelem, vereség, gól, kapott gól nélküli meccs, mesterhármas",r.meccs);
  ok(r.meccs.st.m===2&&r.meccs.st.w===1&&r.meccs.st.sz===4&&r.meccs.st.szg===4,"a stílus: meccs, győzelem, a szereplők meccsei és termése",r.meccs.st);
  ok(r.meccs.cid&&r.meccs.cidUj,"a karrier azonosítót kap (új karrier)");
  ok(r.ideny.s1&&!r.ideny.s2&&r.ideny.c1&&!r.ideny.c2&&r.ideny.idenyek===1&&r.ideny.bajnok===1&&r.ideny.kupa===1&&r.ideny.stI===1,"az idény és a kupa is egyszer számít",r.ideny);
  console.log("\n— 3. A SZINTEK —");
  ok(r.szint.xp===r.szint.vart&&r.szint.thrOk&&r.szint.L>=1&&r.szint.rang,"fokozatonként 10·n XP, a szint a küszöbök közt",r.szint);
  console.log("\n— 4. A MESTERSÉG-FA —");
  ok(!r.fa.nincs&&r.fa.ML===3&&r.fa.pt0===3,"pont nélkül nincs nyitás; a 3. szint 3 pontot ad",r.fa);
  ok(r.fa.o1&&r.fa.o2&&r.fa.st2==="nyithato"&&r.fa.o3,"I. rang szabadon, a II. rang 2 nyitás után",r.fa);
  ok(!r.fa.o4&&/szabad/.test(r.fa.o4ok)&&r.fa.st3==="zarva"&&r.fa.pt===0,"elfogyott pont, a III. rang zárva (5-től)",r.fa);
  ok(JSON.stringify(r.tempo)==="[1,2,3]","a tempó (3.9.197): 3 idény ~1., kétszer annyi ~2., 10 idény ~3. mesterségszint",r.tempo);
  console.log("\n— 5. A HATÁSOK —");
  ok(r.maxL===10,"a teljes mérföldkő-tábla a 10. mesterségszint",r.maxL);
  ok(r.hatas.ar1===r.hatas.arVart&&r.hatas.ar1<=r.hatas.ar0,"a képességár −10% (3+3+4, 3.9.197)",r.hatas);
  ok(r.hatas.ms1>=r.hatas.ms0&&Math.abs(r.hatas.fx.msPrem-0.12)<1e-9,"a mérföldkő-prémium +12% (3.9.197)",{ms0:r.hatas.ms0,ms1:r.hatas.ms1,prem:r.hatas.fx.msPrem});
  ok(r.hatas.sec===r.hatas.secElso,"„Második otthon”: másodlagosként a 3-as osztó helyett 2,5",{sec:r.hatas.sec,vart:r.hatas.secElso});
  ok(r.hatas.g1===30&&r.hatas.g2===0&&r.hatas.spNo===30,"hozott tudás: +30 csapatstílus-pont (6+10+14), egyszer",r.hatas);
  ok(r.valaszt.ok&&r.valaszt.plusz===30,"a valódi stílusválasztás jóváírja",r.valaszt);
  console.log("\n— 6. A FELÜLET —");
  ok(r.ui.fej&&r.ui.secs.length>=8&&r.ui.secs[0].id==="szint"&&r.ui.secs[1].id==="mesterseg","legfelül a profilszint és a stílus-mesterség, minden szekció lenyitható",r.ui.secs);
  ok(r.ui.secs.filter(x=>x.open).map(x=>x.id).join(",").indexOf("szint,mesterseg")===0&&!r.ui.secs.find(x=>x.id==="helyi").open,"alapból a két új nyitva, a többi csukva",r.ui.secs);
  ok(r.ui.sty===8&&r.ui.fa===80,"a 8 stílus kártyája, mindegyiken a 10 csomópontos fa",{sty:r.ui.sty,fa:r.ui.fa});
  ok(r.ui.megmarad,"a nyitott állapot megmarad");
  ok(r.ui.gomb,"a Nyitás gomb nyit");
  ok(r.ui.rekordNyitva,"az „Örök csúcsok” ugrás kinyitja a szekciót");
  ok(r.mentes,"a mentés viszi a karrier-azonosítót");
  ok(String(r.verzio).localeCompare("3.9.195",undefined,{numeric:true})>=0,"verzió legalább 3.9.195",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
