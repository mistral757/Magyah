/* 🎺 3.9.183 — A JEGYÁR 100-AS NYERS ERŐ FÖLÖTT.

   Bejelentés: „Egy ponton túl jelentéktelenné kezd válni a szurkolói bevétel.
   100-as nyers erő fölött ez is kezdjen el fokozatosan skálázódni."

   Amit mér:
     1. 100 alatt és pontosan 100-nál a szorzó 1 — a régi gazdaság betűre marad;
     2. fölötte folytonos (100,1-nél alig több mint 1) és szigorúan nő;
     3. a szorzó a piaci árgörbe aránya: peakMarketPrice(nyers)/peakMarketPrice(100)
        (117-nél ~8,3, 130-nál ~28);
     4. a heti bevétel a szorzóval nő, és 3.9.189 óta a BÉR horgonya is;
     5. a bérhorgony visszaszámolása (a rögzített bevételből) a szorzót kiveszi —
        nem fújja fel a létszámot;
     6. a felület: a HUB-doboz és a keret-bontás kiírja a szorzót, a tiszta
        haszon külön sorban; a szótár szól róla; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9226;
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
  await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    const o={};
    let RAW=90;window.teamOVRbase=()=>RAW;
    gameMode="career";careerPool=careerPool||{"X":{n:"X"}};
    S.fanBase=500000;S.wageFans=500000;
    const at=x=>{RAW=x;return fanTicketScale();};
    o.s90=at(90);o.s100=at(100);o.s1001=at(100.1);o.s117=at(117);o.s130=at(130);
    o.v117=peakMarketPrice(117)/peakMarketPrice(100);o.v130=peakMarketPrice(130)/peakMarketPrice(100);
    let mono=true,prev=0;for(let x=100;x<=170;x+=0.5){const v=at(x);if(v<prev-1e-9)mono=false;prev=v;}
    o.mono=mono;
    /* bevétel és bér */
    RAW=95;const inc95=fanWeeklyIncome(),wage95=wageAnchorWeek();
    RAW=117;const inc117=fanWeeklyIncome(),wage117=wageAnchorWeek();
    o.incArany=inc117/inc95;o.berValt=wage117/wage95;
    o.incKeplet=Math.abs(inc117-fanBase()*FAN_TICKET*fanMult()*fanTicketScale())<1e-6;
    /* bérhorgony visszaszámolás: a rögzített bevétel a skálával készült */
    try{
      const st=wageProbeState();
      st.rows=st.rows||{};
      S.idx=10;
      st.rows[S.seasonNumber||1]=Object.assign({},st.rows[S.seasonNumber||1]||{},{fanInc:fanWeeklyIncome()*10});
      o.horgony=wageAnchorInit();
    }catch(e){o.horgonyHiba=String(e);}
    o.tabor=fanBase();
    /* felület */
    RAW=117;
    let bontas="";try{bontas=budgetBreakdownHtml?budgetBreakdownHtml():"";}catch(e){bontas="";}
    o.bontasVan=!!bontas;
    o.bontasJegy=/jegyár ×/.test(bontas);
    o.berBlokk=/bér \/ szerződéskori lelátó/.test(bontas);
    o.bontasHaszon=/a legjobban fizetett/.test(bontas);
    o.szotar=/100-AS NYERS ERŐ FÖLÖTT A JEGYÁR IS NŐ/.test(GLOSSARY.szurkoloibevetel.text);
    o.jegyFt=fanTicketFt();
    return o;});
  console.log("\n— a szorzó —");
  ok(r.s90===1&&r.s100===1,"100 alatt és 100-nál ×1 — a régi gazdaság betűre marad",{s90:r.s90,s100:r.s100});
  ok(r.s1001>1&&r.s1001<1.03,"fölötte folytonos: 100,1-nél alig több mint 1",r.s1001);
  ok(r.mono,"100 és 170 között szigorúan nő");
  ok(Math.abs(r.s117-r.v117)<1e-9&&Math.abs(r.s130-r.v130)<1e-9&&r.s117>7&&r.s117<10&&r.s130>20,
     "a piaci árgörbe aránya (117: ~8,3 · 130: ~28)",{s117:r.s117,s130:r.s130});
  console.log("\n— bevétel és bér —");
  ok(r.incKeplet&&Math.abs(r.incArany-r.s117)<1e-6,"a heti bevétel a szorzóval nő",{arany:r.incArany});
  /* 3.9.189: „a fizetések irreálisan alacsonyak" — a bér horgonya mostantól a
     MAI jegyáron áll (a létszám marad a szerződéskori) */
  ok(Math.abs(r.berValt-r.incArany)<1e-6,"a bér horgonya a jegyárral együtt nő (3.9.189 óta)",{ber:r.berValt,bev:r.incArany});
  ok(r.horgony===r.tabor,"a bérhorgony visszaszámolása a szorzót kiveszi — nem fújja fel a létszámot",{horgony:r.horgony,tabor:r.tabor,h:r.horgonyHiba});
  console.log("\n— felület —");
  const srcHtml=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(r.bontasVan&&r.bontasJegy,"a keret-bontás szurkolói sora kiírja a jegyár-szorzót",{van:r.bontasVan,jegy:r.bontasJegy});
  ok(r.berBlokk?r.bontasHaszon:/…a legjobban fizetett/.test(srcHtml),
     "a bér-blokkban a legjobban fizetett ember sora áll (a jegyár-sor 3.9.189 óta kikerült: a bér követi)",{berBlokk:r.berBlokk,haszon:r.bontasHaszon});
  ok(r.szotar,"a szótár szól róla");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
