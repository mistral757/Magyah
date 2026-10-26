/* 🌞 3.9.301 — IGAZOLÁS A TELJES NYÁRON, LICIT A NYÁRI KUPÁK KÖZBEN.

   KÉRÉS: „Egész nyári időszakban végig, bármelyik meccsek között lehessen
   igazolni. A valóságban is így van. A tieidre is jöhetnek licitek."

   Amit mér:
     1. a nyári kupa közben (lezárt idény, 30. forduló után, a kupából nyitott
        HUB) az átigazolás NYITVA — vásárlás, kirakat, licit-ablak;
     2. futó szezonban (a 8./15./23. ablakon kívül) változatlanul ZÁRVA;
     3. a kirakatba tett játékosra a nyári kupameccsek alatt is jön licit:
        minden kupameccs 2 fordulónyit léptet a várakozáson;
     4. a horog a kupameccs utáni lépésben ül; a HUB fő gombja „Vissza a
        kupához";
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9301;
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
  await p.waitForFunction(()=>typeof saleNyarvegiLicit==="function",null,{timeout:15000});

  /* karrier-fixture: a 30. forduló után, lezárt szezon (a nyár) */
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
      const pl={n:src.n,ovr:src.ovr,pot:Math.max(src.ovr||70,src.pot||0)+3,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    slots.forEach(sl=>{if(sl.player){if(!sl.player.pot)sl.player.pot=(sl.player.ovr||70)+3;if(!sl.player.age)sl.player.age=26;}});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    addLine=()=>{};
    window._nyar=()=>{phase="hubreport";S.seasonClosed=true;S.seasonNumber=2;S.idx=30;
      hubMidSeasonMode=false;if(S.twWindow)S.twWindow=null;};
    window._nevek=()=>slots.filter(sl=>sl.player).map(sl=>sl.player.n);
    window._kitesz=(n,x)=>{const now=saleCareerRound();
      const rec=Object.assign({n,since:now,due:now+12,rejects:0,offer:null,winKey:null,inWindow:0,pending:true},x||{});
      saleMarketState().list.push(rec);return rec;};});

  console.log("— 1–2. a kapu —");
  const k=await p.evaluate(()=>{const o={};
    /* futó szezon, a kupából nem: zárva */
    phase="season";S.seasonClosed=false;S.seasonNumber=2;S.idx=15;S.euro=null;hubMidSeasonMode=true;S.twWindow=null;
    o.szezonban=twClosedNow();
    /* a nyári kupa közben, a kupából nyitott HUB-ban: nyitva */
    _nyar();phase="verdict";S.euro={stage:"group",comp:"EL",idx:0};hubMidSeasonMode=true;
    o.kupaMost=nyariKupaMost();o.kupaban=twClosedNow();o.sale=saleWindowOpen();o.scout=scoutRealWindowOpen();
    /* a kupa nélkül, a sima nyári HUB: nyitva (mint eddig) */
    S.euro=null;hubMidSeasonMode=false;o.nyar=twClosedNow();
    return o;});
  ok(k.szezonban===true,"futó szezonban (ablakon kívül) az átigazolás zárva — mint eddig",k);
  ok(k.kupaMost&&k.kupaban===false&&k.sale&&k.scout,"a nyári kupa közben nyitva: vásárlás, kirakat, scout-licit",k);
  ok(k.nyar===false,"a kupa nélküli nyári HUB-ban is nyitva (változatlan)",k);

  console.log("\n— 3. licit a kupameccsek között —");
  const l=await p.evaluate(()=>{const o={};
    S.saleMarket=null;_nyar();phase="verdict";S.euro={stage:"group",comp:"EL",idx:0};hubMidSeasonMode=true;
    const N=_nevek(),now=saleCareerRound();
    const rec=_kitesz(N[1],{since:now,due:now+5});
    saleMarketTick();o.elotte=!!rec.offer;
    const lep=[];
    for(let i=0;i<4&&!rec.offer;i++){nyarMeccsUtan();lep.push(rec.due-now);}
    o.lep=lep;o.utana=!!rec.offer;o.osszeg=rec.offer&&rec.offer.amount;
    /* kupán kívül a horog nem léptet */
    S.euro=null;const r2=_kitesz(N[2],{since:now,due:now+5});const d0=r2.due;nyarMeccsUtan();o.kivul=r2.due===d0;
    return o;});
  ok(!l.elotte&&l.utana&&l.osszeg>0,"a kirakatba tett játékosra a nyári kupameccsek alatt licit jön",l);
  ok(l.lep[0]===3&&l.lep[1]===1,"minden kupameccs 2 fordulónyit léptet",l.lep);
  ok(l.kivul,"kupán kívül a horog nem léptet",l);

  console.log("\n— 4. a horog és a gomb —");
  const h=await p.evaluate(()=>{const o={};
    o.horog=String(euroAfterUserMatch).indexOf("nyarMeccsUtan()")>0;
    _nyar();phase="verdict";S.euro={stage:"group",comp:"EL",idx:0};hubMidSeasonMode=true;
    try{setHubNextSeasonBtn();}catch(e){}
    o.gomb=($("hubNextSeasonBtn")||{}).textContent||"";
    return o;});
  ok(h.horog,"a kupameccs utáni lépésben ül (euroAfterUserMatch)");
  ok(/Vissza a kupához/.test(h.gomb),"a HUB fő gombja a kupából: „Vissza a kupához”",h.gomb);

  console.log("\n— 5. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
