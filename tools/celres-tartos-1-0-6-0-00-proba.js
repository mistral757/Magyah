/* 🎚 1.0.6.0.00 — A CÉLRÉS-LÁNC TARTÓSAN ÉS A RAJT-CÉL A MINIMUM.
   BEJELENTÉS: „+0.65-ös célrés […] Itt nagyon nagy a kavar. […] A célrést a
   forma nélküli meccserőhöz kell mérni, mert a forma nullázódik szezon végén.
   És a morál is visszaesik. […] Nem jöhet ki a végén ilyen eredmény."
   Amit mér: a tartós meccs-erő (a magas év végi morál és a lendület nem
   számít); az idény vége a záró rést és meccs-erőt tartósan rögzíti; a
   súlyozás csak könnyíthet; a kezdőrúgás a rajt-célig visszaléptet (nem csak
   egyévnyi fékkel); közös karrierben a személyes rajt-igazítás előjele; a
   panel kiírja a célrés és a rajt-cél viszonyát; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9421;
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
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    window.mgmtNyit=()=>false;
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
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    ki.nf=nfOn();
    /* 1. a tartós meccs-erő */
    const ms=()=>{let v;msRatedBegin();try{v=teamMatchStrength();}finally{msRatedEnd();}return v;};
    S.morale=computeMoraleTarget();S.capMod=0;S.eventMod=0;S.teamMomentum=null;
    ki.k0=msTartosKorr();const m0=ms();
    S.morale=98;S.capMod=1;
    ki.k1=msTartosKorr();const m1=ms();
    ki.tartos={m0,m1,t1:m1-ki.k1};
    /* 2. az idény vége tartósan rögzít */
    freezeSeasonHiddenBonus();S.idx=30;const H=pyrFloorHist();const rec=nfIdenyVege();
    ki.vege={zaroMs:H[1].zaroMs,korr:H[1].zaroKorr,m1};
    S.morale=computeMoraleTarget();S.capMod=0;
    /* 3. a súlyozás csak könnyíthet */
    ki.suly={le:mpMsSuly(100,110),fel:mpMsSuly(110,100),nincs:mpMsSuly(100,null)};
    /* 4. a kezdőrúgás: a mezőny jóval erősebb, mint a rajt-cél engedi */
    S.seasonHistory=[{season:1,rank:5,pts:50,w:15,d:5,l:10,gf:40,ga:35,oppRating:oppTargetRating,teamAvg:85}];
    S.seasonClosed=true;phase="hub";
    const up=pyrFloorUpcoming();
    ki.nyar=pyrCelSorHtml(0).replace(/<[^>]+>/g,"");
    const want=pyrFloorWantFor(up);
    {msRatedBegin();try{const kell=(want-9)-levelGap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}finally{msRatedEnd();}}
    msRatedBegin();try{ki.elotte=Math.round(levelGap()*10)/10;}finally{msRatedEnd();}
    S.seasonNumber=up;S.idx=0;S.seasonClosed=false;phase="season";
    const k=pyrFloorKickoff();ki.k={want:k.want,elotte:k.elotte,utana:k.utana,fek:k.fek};
    ki.futo=pyrCelSorHtml(0).replace(/<[^>]+>/g,"");
    ki.naplo=/Rajt-igazítás/.test(document.body.textContent);
    /* 5. közös karrier: a személyes rajt-igazítás csatornája */
    const _h=window.h2hRoomActive,_d=window.h2hIsDuelRound;
    window.h2hRoomActive=()=>true;window.h2hIsDuelRound=()=>false;
    S.pyr.rajtIgaz={sn:S.seasonNumber,off:-3.2,gap:-5,cel:-1.8};delete S.pyr.osztott;
    ki.mpOff=mpOsztottOff();
    window.h2hRoomActive=_h;window.h2hIsDuelRound=_d;delete S.pyr.rajtIgaz;
    ki.soloOff=mpOsztottOff();
    return ki;});
  console.log("\n— a tartós mérés —");
  ok(r.nf,"kétoldalú (tízfokozatú) karrier",r.nf);
  ok(Math.abs(r.k0)<0.05,"alapállapotban nincs korrekció",r.k0);
  ok(r.k1>0.5&&Math.abs(r.tartos.t1-r.tartos.m0)<0.15,"magas év végi morál + kapitány-löket: a tartós érték az alapállapoté",r.tartos);
  ok(Math.abs(r.vege.zaroMs-(r.vege.m1-r.vege.korr))<0.15&&r.vege.korr>0.5,"az idény vége a záró meccs-erőt tartósan rögzíti",r.vege);
  ok(r.suly.le===100&&r.suly.fel<110&&r.suly.fel>=100&&r.suly.nincs===100,"a súlyozás csak könnyíthet (magasabb záró → az indító számít)",r.suly);
  console.log("\n— a kezdőrúgás —");
  ok(r.k.elotte<r.k.want-5&&r.k.utana>=r.k.want-0.16&&r.k.utana<=r.k.want+1.1,"9-cel a rajt-cél alatt → a mezőny a rajt-célig lép vissza (nem keményebb)",r.k);
  ok(r.naplo,"a napló kimondja a rajt-igazítást");
  console.log("\n— közös karrier —");
  ok(r.mpOff===-3.2&&r.soloOff===0,"a személyes rajt-igazítás a saját bajnokikon (közös karrierben), egyjátékosban nincs",{mp:r.mpOff,solo:r.soloOff});
  console.log("\n— a felület —");
  ok(/A kezdőrúgáskor/.test(r.nyar)&&/rajt-célra/.test(r.nyar)&&/idény átlagára/.test(r.nyar),"nyáron: mire áll be a rajt, és miért",r.nyar);
  ok(/Célrés/.test(r.futo)&&/rajt-cél/.test(r.futo),"idény közben: célrés, rajt-cél (és a pálya)",r.futo);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
