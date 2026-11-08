/* ⚡ 1.0.6.0.01 — AZ ÓRIÁSÖLÉS MECCS-ERŐBŐL, PONTBAN.
   KÉRÉS: „Az óriásölést meccserőből kell számolni ezentúl. És ne százalékos
   legyen, hanem rating pontos. 100as meccs erőig: 2 meccserő pont
   különbségtől, 200ig ez lassan felkúszik 2,5re, 300ig lassan felkúszik
   3-ra, 400ig lassan felkúszik 3,5-re és így tovább."
   Amit mér: a küszöb-görbe; a lefújáskor a kezdőrúgáskori két ⚡ (SB) dönt;
   a papírforma (nyers erő) nem számít; az arány a rettenetnek; a mérföldkő
   pontban ír; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9422;
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
    ki.k=[50,100,150,200,300,400,500].map(m=>[m,giantKuszob(m)]);
    /* a lefújáskori mérés: a két kezdőrúgáskori ⚡ */
    window.SB=window.SB||{};
    SB.msBase=219.9;SB.oppMsBase=223.6;
    ki.a=giantMsGap({o:{ovr:999}},true);       /* a papírforma (ovr) nem számít */
    SB.msBase=219.9;SB.oppMsBase=221.0;
    ki.b=giantMsGap({o:{ovr:50}},true);
    SB.msBase=95;SB.oppMsBase=97.1;
    ki.c=giantMsGap({o:{ovr:0}},true);
    /* mérföldkő: pontban, a küszöbtől */
    gameMode="career";
    try{const T=msT();T.giantKills=0;T.giantMaxMs=0;
      msNoteGiantKill(ki.b);ki.m1=[T.giantKills,T.giantMaxMs];
      msNoteGiantKill(ki.a);ki.m2=[T.giantKills,T.giantMaxMs];}catch(e){ki.mErr=String(e);}
    ki.fb=[talFeketeMult(ki.a.r),talFeketeMult(ki.b.r)];
    return ki;});
  console.log("\n— a küszöb —");
  const K=Object.fromEntries(r.k);
  ok(K[50]===2&&K[100]===2&&K[150]===2.25&&K[200]===2.5&&K[300]===3&&K[400]===3.5&&K[500]===4,"100-ig 2 · 200: 2,5 · 300: 3 · 400: 3,5 · és így tovább (folytonosan)",r.k);
  console.log("\n— a mérés —");
  ok(Math.abs(r.a.gap-3.7)<1e-9&&Math.abs(r.a.need-2.6)<0.01&&r.a.r>=1,"219,9 – 223,6: 3,7-del erősebb ellenfél, a küszöb 2,6 → óriásölés (a papírforma nem számít)",r.a);
  ok(r.b.r<1&&r.b.r>0,"1,1-del erősebb: nem óriásölés, de arányosan fizet (r = többlet ÷ küszöb)",r.b);
  ok(Math.abs(r.c.need-2)<1e-9&&r.c.r>=1,"100 alatt a küszöb 2 (95 – 97,1 → óriásölés)",r.c);
  ok(r.m1&&r.m1[0]===0&&r.m2[0]===1&&r.m2[1]===3.7,"a mérföldkő a küszöbtől számol, és PONTBAN jegyzi a legnagyobbat",{m1:r.m1,m2:r.m2,err:r.mErr});
  ok(r.fb[1]===1,"a Fekete bárány csak óriásölésnél (a küszöb alatt nem)",r.fb);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
