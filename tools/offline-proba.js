/* F8-PRÓBA, SZIGORÍTOTT.
   A korábbi próba offline-ága nem bizonyított: üres cache-sel is „sikerült"
   a navigáció, ami lehetetlen, ha tényleg a service worker szolgálná ki.
   Ezért itt:
     - a telepítés után BEZÁRJUK a lapot,
     - a szervert LEÁLLÍTJUK (nem csak a böngészőt tesszük offline-ba),
     - és ÚJ lapon próbálunk betölteni.
   Ha így betölt, azt csakis a cache adhatta. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah";
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",
  ".webmanifest":"application/manifest+json",".json":"application/json"};

function serve(port,hianyzo){
  const s=http.createServer((req,rp)=>{
    let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
    if(hianyzo&&req.url===hianyzo){rp.statusCode=404;rp.end();return;}
    const abs=path.join(ROOT,f);
    if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
    rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
    rp.setHeader("cache-control","no-store");
    fs.createReadStream(abs).pipe(rp);});
  return new Promise(r=>s.listen(port,"127.0.0.1",()=>r(s)));
}

async function proba(cimke,port,hianyzo){
  const srv=await serve(port,hianyzo);
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  let p=await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:"load"});
  await p.evaluate(()=>navigator.serviceWorker.ready).catch(()=>{});
  await p.waitForTimeout(2500);
  const db=await p.evaluate(async()=>{
    const n=await caches.keys(); if(!n.length) return 0;
    return (await (await caches.open(n[0])).keys()).length;});
  await p.close();
  await new Promise(r=>srv.close(r));          // A SZERVER MEGSZŰNIK
  p=await ctx.newPage();
  let ok=true,mit="";
  try{ await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:"load",timeout:15000}); }
  catch(e){ ok=false; mit=e.message.split("\n")[0].slice(0,60); }
  let all={};
  if(ok){ await p.waitForTimeout(1500);
    all=await p.evaluate(()=>({ver:typeof APP_VERSION!=="undefined"?APP_VERSION:null,
      nevek:typeof HU_NAME_TABLE!=="undefined"?Object.keys(HU_NAME_TABLE).length:null,
      betu:(()=>{try{return document.fonts.size;}catch(e){return null;}})()})).catch(()=>({}));}
  console.log(`${cimke}`);
  console.log(`   cache: ${db} bejegyzés · szerver LEÁLLÍTVA · betöltés: `
    +(ok?`SIKERÜLT ${JSON.stringify(all)}`:`ELBUKOTT (${mit})`));
  await b.close();
  return {db,ok};
}

(async()=>{
  await proba("A) minden asset elérhető:", 8897, null);
  await proba("B) EGY asset 404 (kick-line.png):", 8898, "/icons/kick-line.png");
})();
