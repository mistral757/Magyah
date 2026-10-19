/* 🛒🤝 3.9.258 — A BOOST-KOSÁR NEM TÉVESZTHETŐ ÖSSZE A TÖMEG-BOOSTTAL.

   KIMONDOTT KÉRÉS: „Arra vigyázzunk, hogy a béke és harmónia csapatstílus
   tömegboostjával ne legyen összetéveszthető ez az új fajta tömegesen
   vásárolható boost. Nehogy valaki véletlenül vegyen 5 boostot, amikor
   igazából 5 emberre akár elosztani 1 boostot."

   Amit mér (valódi panelek):
     1. a kosár neve „Boost-kosár", és minden lépése kimondja: N külön boost,
        N × ár;
     2. Harmónia-képesség (massBoost) nélkül nincs zavaró figyelmeztetés;
     3. vele a fajta-választó, a darabszám és a megerősítő is figyelmeztet, és
        egy gomb egyenesen a szétosztó útra (Egy vagy Több játékos) visz;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9468;
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
    S.transferBudget=1e9;
    const txt=id=>(document.getElementById(id)||{textContent:""}).textContent.replace(/\s+/g," ");
    const gombok=()=>[...document.querySelectorAll("#twActions button")].map(b=>b.textContent.replace(/\s+/g," "));
    /* ── 1. Tömeg-boost NÉLKÜL (nem Harmónia) ── */
    window.styleFxMax=(k)=>0;
    boostOpenPanel();
    ki.katNelkul=gombok().find(t=>/Boost-kosár/.test(t))||null;
    boostKosarNyit();
    ki.nyitNelkul={cim:txt("twTitle"),test:txt("twBody"),gomb:gombok().some(t=>/EGY boostot osztanék/.test(t))};
    /* ── 2. Tömeg-boosttal (Harmónia-képesség) ── */
    window.styleFxMax=(k)=>k==="massBoost"?1:0;
    boostOpenPanel();
    ki.katVele=gombok().find(t=>/Boost-kosár/.test(t))||null;
    boostKosarNyit();
    ki.nyitVele={test:txt("twBody"),gomb:gombok().some(t=>/EGY boostot osztanék/.test(t))};
    _kosar.kind="plain";boostKosarDarab();
    ki.darab={test:txt("twBody"),gomb:gombok().some(t=>/EGY boostot osztanék/.test(t))};
    /* a gomb a szétosztó útra visz (boostAskCount) */
    const g=[...document.querySelectorAll("#twActions button")].find(b=>/EGY boostot osztanék/.test(b.textContent));
    g.click();
    ki.atvisz={cim:txt("twTitle"),gombok:gombok(),kosar:_kosar};
    /* a megerősítő kimondja: N külön vásárlás */
    const ros=fullCareerRoster().filter(Boolean);
    _kosar={kind:"plain",db:5,sorok:[{n:ros[0].n,db:5}]};
    let html="",title="";
    const _ac=window.askConfirm;window.askConfirm=o=>{html=o.html;title=o.title;};
    boostKosarMegerosit();window.askConfirm=_ac;
    ki.megerosit={title,html:html.replace(/<[^>]+>/g," ").replace(/\s+/g," ")};
    _kosar=null;
    return ki;});

  console.log("=== Tömeg-boost nélkül ===");
  ok(r.katNelkul&&/több KÜLÖN boost/.test(r.katNelkul)&&!/Tömeges boost/.test(r.katNelkul),"a katalógus gombja: „Boost-kosár — több KÜLÖN boost”",r.katNelkul);
  ok(/Boost-kosár/.test(r.nyitNelkul.cim)&&/KÜLÖN, teljes árú boost/.test(r.nyitNelkul.test),"a kosár kimondja: minden darab külön boost",r.nyitNelkul.cim);
  ok(!/Tömeg-boostja/.test(r.nyitNelkul.test)&&!r.nyitNelkul.gomb,"Harmónia-képesség nélkül nincs figyelmeztetés és átváltó gomb");
  console.log("=== Tömeg-boosttal (Béke és harmónia) ===");
  ok(r.katVele&&/Több játékos/.test(r.katVele),"a katalógus gombja megmondja, hol van a szétosztás",r.katVele);
  ok(/Nem ez a Béke és harmónia Tömeg-boostja/.test(r.nyitVele.test)&&r.nyitVele.gomb,"a fajta-választón figyelmeztetés + átváltó gomb");
  ok(/5 külön boost/.test(r.darab.test)&&/5 × /.test(r.darab.test)&&/Tömeg-boostja/.test(r.darab.test)&&r.darab.gomb,"a darabszámnál „5 külön boost = 5 × ár”, figyelmeztetés, gomb",r.darab.test.slice(0,240));
  ok(r.atvisz.kosar===null&&r.atvisz.gombok.some(t=>/EGY boost szétosztva/.test(t)),"az átváltó gomb a szétosztó útra visz (Egy vagy Több játékos)",r.atvisz.gombok);
  ok(/5 KÜLÖN boostot/.test(r.megerosit.title)&&/5 külön vásárlás/.test(r.megerosit.html)&&/Tömeg-boostja/.test(r.megerosit.html),"a megerősítő: „5 KÜLÖN boostot veszel?”, és ott is a figyelmeztetés",r.megerosit);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
