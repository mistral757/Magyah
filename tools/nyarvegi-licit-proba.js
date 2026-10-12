/* 📬 A NYÁR VÉGI LICIT-GARANCIA (3.9.224)

   KÉRÉS: „Nyári kupasorozat után, amikor a nyár végére lépünk, ott mindig
   érkezzen licit azokra, akiket legkésőbb a kupa előtt feltettünk az
   átigazolási piacra."

   Amit mér:
     1. a kupa ELSŐ indulása megjelöli a kirakatot; a lánc (MK→KL) második
        indulása nem jelöl újra; futó szezonban nincs jelölés;
     2. a nyár végén a megjelölt ember azonnal licitet kap — akkor is, ha a
        határideje a következő idény közepére esett, és akkor is, ha ebben a
        nyárban a licit-köre már elfogyott;
     3. a kupa KÖZBEN kitett ember nem kap garanciát (a szokott várakozás);
     4. akinek már vár egy ajánlata, annak az marad (nincs csere);
     5. a jelölés egyszer sül el (a jelentés újranyitása nem ad újabbat);
     6. a két horog a helyén van: startEuroCampaign és a szezonjelentés
        (az öregítés után);
     7. nincs oldalhiba. */
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

  /* ---- 1–5. A GARANCIA ---- */
  const r=await p.evaluate(()=>{
    const ki={};
    S.saleMarket=null;S.saleKupaJel=null;
    const N=_nevek();
    /* futó szezonban nincs jelölés */
    phase="season";S.seasonClosed=false;S.seasonNumber=2;S.idx=27;
    const a0=_kitesz(N[0]);
    ki.szezonbanJel=saleKupaJelol();
    ki.szezonbanRec=a0.kupaGar==null;
    S.saleMarket=null;
    /* a nyár: két ember a kupa előtt (az egyik a szezon végén, határideje a
       következő idény közepén; a másiknál ebben a nyárban elfogytak a körök) */
    _nyar();
    const nowNyar=saleCareerRound();
    const a=_kitesz(N[0],{since:nowNyar-2,due:nowNyar+13});
    const c=_kitesz(N[2],{rejects:2,winKey:saleWindowKey(),inWindow:SALE_SUMMER_ROUNDS,due:nowNyar});
    const d=_kitesz(N[3]);d.offer={amount:12345,base:10000,buy:0,now:0,ch:null,round:nowNyar,season:2,seq:1};
    /* a szokott tick ilyenkor semmit nem ad nekik */
    saleMarketTick();
    ki.elotteNincs=!a.offer&&!c.offer;
    /* a kupa indul: jelölés */
    ki.jel1=saleKupaJelol();
    /* a kupa KÖZBEN kitett ember és a lánc második indulása */
    const k=_kitesz(N[4]);
    ki.jel2=saleKupaJelol();
    ki.kozbenJeltelen=k.kupaGar==null;
    /* a nyár vége */
    ki.db=saleNyarvegiLicit();
    ki.aLicit=!!a.offer;ki.cLicit=!!c.offer;
    ki.dMarad=d.offer&&d.offer.amount===12345;
    ki.kNincs=!k.offer;
    ki.aSav=a.offer?Math.round(a.offer.amount/a.offer.base*100):null;
    /* egyszer sül el: a jelentés újranyitása nem ad újabbat */
    a.offer=null;c.offer=null;
    ki.db2=saleNyarvegiLicit();
    ki.ujraNincs=!a.offer&&!c.offer;
    return ki;});
  ok(r.szezonbanJel===0&&r.szezonbanRec,"futó szezonban a kupa-horog nem jelöl",r.szezonbanJel);
  ok(r.elotteNincs,"a nyáron álló számláló miatt a szokott tick nem ad licitet (a hiba oka)");
  ok(r.jel1===3,"a kupa első indulása a teljes kirakatot jelöli",r.jel1);
  ok(r.jel2===0&&r.kozbenJeltelen,"a lánc második indulása nem jelöl; a kupa közben kitett ember jelöletlen",r.jel2);
  ok(r.aLicit,"a kupa előtt kitett ember a nyár végén licitet kap (határidő a köv. idény közepén)",r.aSav+"%");
  ok(r.cLicit,"akkor is, ha ebben a nyárban elfogytak a licit-körei");
  ok(r.dMarad,"akinek már vár egy ajánlata, annak az marad");
  ok(r.kNincs,"a kupa közben kitett ember nem kap garanciát");
  ok(r.db===2,"pontosan két garantált licit",r.db);
  ok(r.db2===0&&r.ujraNincs,"a jelölés egyszer sül el (a jelentés újranyitása nem ad újabbat)",r.db2);

  /* ---- 6. A HORGOK ---- */
  const h=await p.evaluate(()=>{
    const se=String(startEuroCampaign),hr=String(hubShowSeasonReportBody);
    const iJ=se.indexOf("saleKupaJelol()"),iG=se.indexOf("guideFire(\"ev:euro\")"),iN=se.indexOf("hubShowSeasonReport();return;");
    const iA=hr.indexOf("advanceCareerSeason()"),iL=hr.indexOf("saleNyarvegiLicit()");
    return {kupa:iJ>iG&&iG>iN&&iN>0,jelentes:iL>iA&&iA>0,nyk:String(friendlyCupStart).indexOf("startEuroCampaign()")>0};});
  ok(h.kupa,"startEuroCampaign: a jelölés a valódi kampány-indulásnál (nem a 'nincs sorozat' ágon)");
  ok(h.nyk,"a Nyári Felkészülési Kupa is a startEuroCampaign-en indul");
  ok(h.jelentes,"a szezonjelentés: a licit az öregítés UTÁN");

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
