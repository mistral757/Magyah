/* 📜 A VERZIÓTÖRTÉNET A JÁTÉKBAN (1.0.4.10.00).

   KÉRÉS: „az elkészült html oldal legyen beépítve a játékba úgy, hogy azt az
   oldalt nyissa meg a game, ha a verziószámra kattintok a játékon belül.
   Bármelyik site-on."

   Amit mér:
     1. a kezdőlap láblécén a verziószám kattintható, és a teljes képernyős
        réteg a verziotortenet/ oldalt tölti be (28 sor, 26 kazetta);
     2. a fejléc jelvénye is (billentyűvel: Enter), a ✕ és az Esc bezár, a
        fókusz visszatér, az iframe kiürül;
     3. az oldal NEM kér külső szolgáltatót: a betűk a játék saját /fonts/
        szeletei (Press Start 2P, Pixelify Sans);
     4. BÁRMELYIK SITE-ON: más gazdanéven (localhost) és ALÚTVONALON (/sub/)
        is a játék saját helyéből nyílik, és a betűi is onnan jönnek;
     5. önállóan megnyitva a „Vissza a játékhoz" link a játékra mutat, a
        rétegben rejtett; az oldal interakciói élnek (szűrés, kazetta);
     6. a service worker előre cache-eli az oldalt (v8);
     7. nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9370;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const KERES=[];
const srv=http.createServer((req,rp)=>{
  let u=decodeURIComponent(req.url.split("?")[0]);KERES.push(u);
  /* alútvonal: /sub/… ugyanaz a tartalom, mint a gyökér (mint egy alkönyvtárban futó telepítés) */
  if(u.startsWith("/sub/"))u=u.slice(4);
  let f=u==="/"?"/index.html":u;
  let abs=path.join(ROOT,f);
  if(abs.startsWith(ROOT)&&fs.existsSync(abs)&&fs.statSync(abs).isDirectory())abs=path.join(abs,"index.html");
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const lathato=(p,id)=>p.evaluate(i=>{const e=document.getElementById(i);return !!(e&&!e.classList.contains("hide"));},id);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const errs=[],kulso=[];
  const uj=async(host,ut)=>{
    const c=await b.newContext({viewport:{width:430,height:900}});
    const p=await c.newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    await c.route("**/*",r=>{const u=new URL(r.request().url());
      if(!/^(127\.0\.0\.1|localhost)$/.test(u.hostname)){kulso.push(u.hostname);return r.abort();}
      return r.continue();});
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://${host}:${PORT}${ut}`,{waitUntil:"load"});await p.waitForTimeout(1500);
    return {c,p};};

  console.log("— 1. kezdőlap, gyökér —");
  let {c,p}=await uj("127.0.0.1","/index.html");
  const v0=await p.evaluate(()=>({txt:document.getElementById("mpVersion").textContent,role:document.getElementById("mpVersion").getAttribute("role"),
    badge:document.getElementById("versionBadge").getAttribute("role"),app:APP_VERSION}));
  ok(v0.txt==="v"+v0.app&&v0.role==="button"&&v0.badge==="button","a két verziószám-hely kattintható",v0);
  await p.click("#mpVersion");await p.waitForTimeout(1500);
  ok(await lathato(p,"vhOv"),"a láblécen a verziószámra koppintva megnyílik a réteg");
  const fr=p.frames().find(f=>/verziotortenet/.test(f.url()));
  ok(!!fr&&/\/verziotortenet\/$/.test(fr.url()),"az iframe a verziotortenet/ oldalt tölti",fr&&fr.url());
  const t1=fr?await fr.evaluate(()=>({h1:document.querySelector("h1").textContent,sor:document.querySelectorAll("#tb tr").length,
    kaz:document.querySelectorAll("#carts .cart").length,back:getComputedStyle(document.getElementById("back")).display,
    pr:document.fonts.check("12px 'Press Start 2P'"),px:document.fonts.check("18px 'Pixelify Sans'")})):null;
  ok(t1&&/verziótörténet/i.test(t1.h1)&&t1.sor===28&&t1.kaz===26,"az oldal teljes: 28 táblázatsor, 26 megmaradt állapot",t1);
  ok(t1&&t1.back==="none","a rétegben a „Vissza a játékhoz” link rejtett",t1&&t1.back);
  const bet=KERES.filter(u=>/\/fonts\/(press-start|pixelify)/.test(u));
  ok(bet.length>=2&&kulso.length===0,"a betűk a játék saját /fonts/ szeletei, külső kérés nincs",{bet:[...new Set(bet)].slice(0,4),kulso:[...new Set(kulso)]});
  ok(await p.evaluate(()=>document.getElementById("vhKulon").getAttribute("href")==="verziotortenet/"&&document.getElementById("vhKulon").target==="_blank"),"a „Külön lapon” link a relatív oldalra mutat, új lapon");
  await p.keyboard.press("Escape");await p.waitForTimeout(200);
  const z1=await p.evaluate(()=>({hide:document.getElementById("vhOv").classList.contains("hide"),src:document.getElementById("vhFr").getAttribute("src"),
    fokusz:document.activeElement&&document.activeElement.id,ov:document.body.style.overflow}));
  ok(z1.hide&&!z1.src&&z1.fokusz==="mpVersion"&&z1.ov!=="hidden","az Esc bezár: az iframe kiürül, a fókusz visszatér, a görgetés szabad",z1);

  console.log("— 2. fejléc jelvény, billentyűvel —");
  await p.evaluate(()=>{const b=document.getElementById("versionBadge");b.focus();});
  await p.keyboard.press("Enter");await p.waitForTimeout(800);
  ok(await lathato(p,"vhOv"),"a fejléc jelvényén Enterre is megnyílik");
  await p.click("#vhX");await p.waitForTimeout(150);
  ok(!(await lathato(p,"vhOv")),"a ✕ gomb bezárja");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await c.close();

  console.log("— 3. más gazdanéven (localhost) —");
  ({c,p}=await uj("localhost","/index.html"));
  await p.click("#mpVersion");await p.waitForTimeout(1500);
  const fl=p.frames().find(f=>/verziotortenet/.test(f.url()));
  ok(fl&&/^http:\/\/localhost:\d+\/verziotortenet\/$/.test(fl.url())&&await fl.evaluate(()=>document.querySelectorAll("#tb tr").length)===28,"localhost-on is a játék saját helyéről nyílik, és betöltődik",fl&&fl.url());
  await c.close();

  console.log("— 4. alútvonalon (/sub/) —");
  KERES.length=0;
  ({c,p}=await uj("127.0.0.1","/sub/index.html"));
  await p.click("#mpVersion");await p.waitForTimeout(1500);
  const fs_=p.frames().find(f=>/verziotortenet/.test(f.url()));
  ok(fs_&&/\/sub\/verziotortenet\/$/.test(fs_.url()),"alútvonalon a /sub/verziotortenet/ nyílik (relatív út)",fs_&&fs_.url());
  ok(fs_&&await fs_.evaluate(()=>document.querySelectorAll("#tb tr").length)===28,"és be is töltődik");
  const subBet=KERES.filter(u=>/^\/sub\/fonts\/(press-start|pixelify)/.test(u));
  ok(subBet.length>=2,"a betűk az alútvonal alól jönnek (/sub/fonts/…)",[...new Set(subBet)]);
  await c.close();

  console.log("— 5. önálló megnyitás és interakciók —");
  ({c,p}=await uj("127.0.0.1","/verziotortenet/"));
  const so=await p.evaluate(()=>({back:getComputedStyle(document.getElementById("back")).display,href:document.getElementById("back").href,
    tolt:!!document.querySelector("h1")}));
  ok(so.back!=="none"&&/\/$/.test(so.href)&&!/verziotortenet/.test(so.href),"önállóan a „Vissza a játékhoz” link a játék gyökerére mutat",so);
  await p.click('[data-min="5"]');
  ok(await p.evaluate(()=>[...document.querySelectorAll("#tb tr")].filter(r=>!r.classList.contains("hide")).length)>=4,"a szűrés működik");
  await p.click('#carts .cart:nth-child(5)');
  ok(/0\.758\.2/.test(await p.evaluate(()=>document.getElementById("cartout").textContent))&&/Karrier mód/.test(await p.evaluate(()=>document.getElementById("cartout").textContent)),"a kazetta kiírja a 0.758.2 részleteit (a Karrier mód születése)");
  ok(await p.evaluate(()=>/26 megmaradt|26 ŐSI/.test(document.body.textContent)),"az oldal a 26 állapotot említi");
  await c.close();

  console.log("— 6. service worker —");
  const sw=fs.readFileSync(path.join(ROOT,"sw-1.js"),"utf8");
  ok(/cache-v8/.test(sw)&&/"\/verziotortenet\/",/.test(sw),"a cache v8, és a /verziotortenet/ előre cache-elve");
  ok(errs.length===0,"nincs oldalhiba (összesen)",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
