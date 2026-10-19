/* 🔔 3.9.260 — GYÁRI ANDROIDOS BÖNGÉSZŐ: A VALÓDI OK ÉS A TEENDŐ.

   BEJELENTETT: „Xiaomi böngészőből telepítve sehogy sem lehet bekapcsolni az
   értesítéseket." A rendszer-beállításban minden értesítés engedélyezve.

   Amit mér (valódi böngésző, a Xiaomi böngésző user-agentjével, az engedély-
   kérés elutasítva — ahogy a bejelentett eszközön):
     1. a feliratkozás hibája nem „letiltottad", hanem kimondja: a Xiaomi
        böngésző nem kézbesít, nyisd meg Chrome-ban, vidd át átviteli kóddal;
     2. a Beállítások értesítés-sora ugyanezt mondja;
     3. a hibaüzenet után megjelenik egy „Megnyitás Chrome-ban” gomb
        (intent://…;package=com.android.chrome), egyszer;
     4. Chrome-os user-agenttel a régi üzenet marad, és nincs gomb;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9260;
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
const UA={
  xiaomi:"Mozilla/5.0 (Linux; U; Android 14; hu-hu; 23090RA98G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.119 Mobile Safari/537.36 XiaoMi/MiuiBrowser/20.29.1031010-gn",
  chrome:"Mozilla/5.0 (Linux; Android 14; 23090RA98G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36"};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const futas=async(ua)=>{
    const p=await (await b.newContext({viewport:{width:400,height:860},userAgent:ua})).newPage();
    const errs=[];p.on("pageerror",e=>errs.push(String(e)));
    await p.addInitScript(()=>{window.HANG_TESZT=true;
      /* a bejelentett eszköz viselkedése: az engedélykérés azonnal elutasítva */
      try{Object.defineProperty(Notification,"permission",{get:()=>"denied"});
          Notification.requestPermission=()=>Promise.resolve("denied");}catch(e){}});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.waitForFunction(()=>typeof pushSubscribe==="function",null,{timeout:15000});
    const r=await p.evaluate(async()=>{
      const ki={};
      ki.oem=pushOemBongeszo();
      const r=await pushSubscribe();ki.sub=r;
      ki.beall=ertesitesEszkozTxt();
      const box=document.createElement("div");const m=document.createElement("div");box.appendChild(m);document.body.appendChild(box);
      pushChromeGomb(m);pushChromeGomb(m);
      const a=box.querySelectorAll("a[data-chrome]");
      ki.gomb={db:a.length,href:a[0]?a[0].getAttribute("href"):null,txt:a[0]?a[0].textContent:null};
      box.remove();
      return ki;});
    r.errs=errs;await p.close();return r;};
  const x=await futas(UA.xiaomi),c=await futas(UA.chrome);
  console.log("=== Xiaomi böngésző ===");
  ok(x.oem==="a Xiaomi böngésző","felismeri a Xiaomi böngészőt",x.oem);
  ok(!x.sub.ok&&/Xiaomi böngésző nem kézbesít/.test(x.sub.miert)&&/Chrome/.test(x.sub.miert)&&/átviteli kóddal/.test(x.sub.miert)&&!/letiltottad/.test(x.sub.miert),
    "a hiba a valódi okot és a teendőt mondja (nem „letiltottad”)",x.sub.miert);
  ok(/Xiaomi böngésző nem kézbesít/.test(x.beall),"a Beállítások sora is ezt mondja",x.beall);
  ok(x.gomb.db===1&&/^intent:\/\/127\.0\.0\.1:\d+\/index\.html#Intent;scheme=https;package=com\.android\.chrome;end$/.test(x.gomb.href),"egy „Megnyitás Chrome-ban” gomb, intent:// címmel",x.gomb);
  console.log("=== Chrome (kontroll) ===");
  ok(c.oem===null,"Chrome-ot nem jelöl gyári böngészőnek");
  ok(!c.sub.ok&&/letiltottad/.test(c.sub.miert),"Chrome-ban a régi (letiltva) üzenet marad",c.sub.miert);
  ok(c.gomb.db===0,"Chrome-ban nincs átirányító gomb");
  ok(x.errs.length===0&&c.errs.length===0,"nincs oldalhiba",x.errs.concat(c.errs).slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
