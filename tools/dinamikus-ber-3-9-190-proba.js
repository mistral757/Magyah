/* 💸 3.9.190 — DINAMIKUS BÉR: A SZÁMLA NEM A PLAFONT TÖLTI KI.

   BEJELENTÉS: „Továbbra is maradjon intelligens, ne csak őrülten töltsük ki
   mindig a max 50% keretet. Tehát legyen dinamikus a dolog!"

   MÉRVE (3.9.189): sikeres idény után a plafon MINDEN keretnél fogott — egy
   ligaszintű, sztár nélküli tizenegy nyers számlája is a lelátó 79–108%-a
   volt, tehát a bér mindig pontosan „a lelátó fele" lett.

   Amit mér (valódi wageContext/wageBill, a kezdő 11 + 3 csere):
     1. A SÁV: egy ligaszintű, friss keret jóval a plafon alatt marad; a
        számla a keret minőségével, a hűséggel, a top sztárokkal és a
        trófeákkal nő; a plafon csak a legdrágább (erős, összeszokott,
        sztáros, trófeás) keretnél fog;
     2. A MINŐSÉG TOMPÍTÁSA: a ligához mért szorzó gyökös, ×0,75 és ×1,6
        között;
     3. SIKER NÉLKÜL a 125%-os plafon nem azt jelenti, hogy a számla oda is
        megy: a ligaszintű keret ott is a lelátó felén belül marad;
     4. A FELÜLET: a keret-bontás kiírja a minőség-szorzót és azt, hogy a
        plafon alatt vagyunk-e; a súgó elmondja, hogy a bér dinamikus;
        nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9233;
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
  await p.waitForFunction(()=>typeof wagePayParts==="function",null,{timeout:15000});

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


    const xiS=slots.filter(sl=>sl&&sl.player);
    const bench=[0,1,2].map(i=>{const n="Csere Teszt "+i;
      if(!careerPool[n])careerPool[n]={n,pos:["KK"],age:25,startRating:80,peak:80,pot:3000};
      return {n,ovr:80,pos:["KK"],age:25};});
    S.wageFans=40000;S.fanBase=40000;
    window.fameStarName=()=>null;
    const meas=o=>{
      const {raw=117,lvl=108,gap=0,stars=0,titles=0,succ=true,ten=0}=o;
      window.teamOVRbase=()=>raw; oppTargetRating=lvl;
      xiS.forEach((sl,i)=>{sl.player.ovr=lvl+gap+((i%5)-2)*2;sl.fit=1;
        const e=careerPool[sl.player.n];if(e){e.startRating=sl.player.ovr;e.peak=sl.player.ovr;e.pot=3000;delete e.paySign;}});
      window.wageSuccessSeason=()=>succ; window.wageTitleCount=()=>titles;
      window.wageStarNames=()=>xiS.slice(0,stars).map(s=>s.player.n);
      S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      xiS.forEach(sl=>{S.seasonMatches[sl.player.n]=10;S.seasonMinutes[sl.player.n]=850;
        S.careerStats[sl.player.n]={g:1,a:1,mvp:0,matches:ten,cs:0,saves:0};});
      bench.forEach(x=>{x.ovr=lvl+gap-4;S.seasonMatches[x.n]=10;S.seasonMinutes[x.n]=250;
        S.careerStats[x.n]={g:0,a:0,mvp:0,matches:ten,cs:0,saves:0};});
      const c=wageContext();
      const b=wageBill(xiS.map(s=>s.player).concat(bench),c);
      return {raw:Math.round(b.raw/c.fanWeek*100),due:Math.round(b.due/c.fanWeek*100),capped:b.capped,q:Math.round(c.q*100)/100,cap:Math.round(c.capShare*100)};};
    ki.liga=meas({});
    ki.liga90=meas({raw:90,lvl:84});
    ki.minoseg=[meas({gap:0}).raw,meas({gap:8}).raw,meas({gap:15}).raw];
    ki.huseg=[meas({gap:8}).raw,meas({gap:8,ten:100}).raw];
    ki.sztar=[meas({gap:8,stars:0}).raw,meas({gap:8,stars:3}).raw];
    ki.trofea=[meas({gap:8,stars:1}).raw,meas({gap:8,stars:1,titles:2}).raw];
    ki.erosNincsTrofea=meas({gap:15,stars:1,ten:0});
    ki.csucs=meas({gap:15,stars:3,titles:2,ten:100});
    ki.qHi=meas({gap:40}).q; ki.qLo=meas({gap:-15}).q; ki.q8=meas({gap:8}).q;
    ki.kudarc=meas({succ:false});
    /* a felület: egy ligaszintű keret a bontásban */
    meas({gap:8,stars:1});
    let bont="";try{bont=budgetBreakdownHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");}catch(e){bont="HIBA "+e;}
    ki.bontas={q:/minősége a ligához ×1,17/.test(bont),alatt:/a plafon alatt/.test(bont),
      sor:(bont.match(/…bér \/ szerződéskori lelátó[^…]*/)||[""])[0]};
    ki.szotar=/NEM A PLAFONT TÖLTI KI/.test(GLOSSARY.fizetesek.text)&&/TOMPÍTVA/.test(GLOSSARY.fizetesek.text);
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. A SÁV —");
  ok(!r.liga.capped&&r.liga.due>=18&&r.liga.due<=35,"ligaszintű, friss keret sikeres idény után: a lelátó ~negyede, jóval a plafon alatt",r.liga);
  ok(!r.liga90.capped&&r.liga90.due<=40,"100 alatti nyers erőnél is a plafon alatt",r.liga90);
  ok(r.minoseg[0]<r.minoseg[1]&&r.minoseg[1]<r.minoseg[2],"a ligához mért minőséggel nő",r.minoseg);
  ok(r.huseg[1]>r.huseg[0],"az összeszokott (hűséges) keret drágább",r.huseg);
  ok(r.sztar[1]>r.sztar[0],"a top sztárok felára növeli",r.sztar);
  ok(r.trofea[1]>r.trofea[0],"a trófeák béremelést hoznak",r.trofea);
  ok(!r.erosNincsTrofea.capped&&r.erosNincsTrofea.due<50,"erős keret trófea nélkül: még a plafon alatt",r.erosNincsTrofea);
  ok(r.csucs.capped&&r.csucs.due===50,"az erős, összeszokott, sztáros, trófeás bajnoknál fog a plafon (50%)",r.csucs);
  console.log("\n— 2. A MINŐSÉG TOMPÍTÁSA —");
  ok(r.qHi===1.6&&r.qLo===0.75&&r.q8>1.1&&r.q8<1.25,"a ligához mért szorzó gyökös, ×0,75–1,6",{hi:r.qHi,lo:r.qLo,q8:r.q8});
  console.log("\n— 3. SIKER NÉLKÜL —");
  ok(r.kudarc.cap===125&&!r.kudarc.capped&&r.kudarc.due<50,"a 125%-os plafon nem húzza fel a számlát",r.kudarc);
  console.log("\n— 4. A FELÜLET —");
  ok(r.bontas.q&&r.bontas.alatt,"a keret-bontás: minőség-szorzó és „a plafon alatt”",r.bontas);
  ok(r.szotar,"a súgó: dinamikus bér, tompított minőség");
  ok(r.verzio==="3.9.190","verzió 3.9.190",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
