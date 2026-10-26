/* 🆕 3.9.306 — ÚJ VERZIÓ ÉRHETŐ EL.

   A telepített app napokig a memóriában ülhet a régi verzióval (a 3.9.298-as
   hardcore-eset vendége így játszott más szabállyal). A játék a kiszolgáló
   `version.json`-jából látja, mi van kint, és ha az újabb, egy sávval kínálja
   a mentés + újratöltést.

   Amit mér:
     1. a repó `version.json`-ja egyezik az index.html APP_VERSION-jével
        (ez a háló kapja el, ha egy kiadásnál a léptetés elmarad);
     2. a verzió-összevetés (3.9.306 < 3.9.307 < 3.10.0; egyenlő nem újabb);
     3. újabb kint lévő verzió → sáv a verzióval; ugyanaz vagy régebbi → csend;
     4. „Később" → eltűnik, és erre a verzióra nem jön vissza (egy még
        újabbra igen);
     5. „Frissítés most": futó meccs alatt nem tölt újra, csak szól; egyébként
        ment, majd újratölt;
     6. a service worker a version.json-t átengedi (nem cache-eli): a kint
        lévő érték változását a vezérelt lap is azonnal látja;
     7. az átmenet: a még frissítetlen RÉGI worker alatt is friss (időbélyeg),
        és az új worker aktiváláskor kitakarítja, amit a régi eltett;
     8. 🐞 párharcban az esemény-animáció a TÁRS nevét és erejét veszi — eddig
        egy elérhetetlen helyi konstanst nézett, és a gépi ellenfelet mutatta;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9306;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
let kintV=null;   /* null = a repó saját version.json-ja */
/* a 3.9.305-ös (régi) service worker: cache-first minden nem-HTML kérésre */
const REGI_SW=require("child_process").execSync("git show 6fe1fc9:sw-1.js",{cwd:ROOT}).toString();
let swRegi=false;
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/sw-1.js"&&swRegi){rp.setHeader("content-type","text/javascript");rp.end(REGI_SW);return;}
  if(f==="/version.json"&&kintV){rp.setHeader("content-type","application/json");rp.end(JSON.stringify({v:kintV}));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  /* 1. a repó két verziószáma */
  const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  const appV=(html.match(/const APP_VERSION="([^"]+)"/)||[])[1];
  let fajlV=null;try{fajlV=JSON.parse(fs.readFileSync(path.join(ROOT,"version.json"),"utf8")).v;}catch(e){}
  ok(appV&&fajlV===appV,"version.json = APP_VERSION",{appV,fajlV});
  const sw=fs.readFileSync(path.join(ROOT,"sw-1.js"),"utf8");
  ok(/pathname === "\/version\.json"\) return;/.test(sw),"a service worker kódja átengedi a version.json-t");

  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const errs=[];
  const p=await ctx.newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  /* 2. összevetés */
  const cmp=await p.evaluate(()=>[verzioUjabb("3.9.307","3.9.306"),verzioUjabb("3.10.0","3.9.306"),
    verzioUjabb("3.9.306","3.9.306"),verzioUjabb("3.9.305","3.9.306"),verzioUjabb("4","3.9.306"),verzioUjabb("","3.9.306")]);
  ok(JSON.stringify(cmp)===JSON.stringify([true,true,false,false,true,false]),"verzió-összevetés",cmp);

  /* 3. ugyanaz / régebbi → csend; újabb → sáv */
  const nez=async v=>{kintV=v;return p.evaluate(async()=>{try{localStorage.removeItem("ujvKesobb");}catch(e){}
    const r=await ujVerzioNez(true);const el=document.getElementById("ujvSav");return {r,sav:!!el,tx:el?el.innerText:""};});};
  let s=await nez(appV);ok(!s.sav&&s.r===appV,"ugyanaz a verzió kint → nincs sáv",s);
  s=await nez("3.9.1");ok(!s.sav,"régebbi kint → nincs sáv",s);
  s=await nez("9.9.999");
  ok(s.sav&&/Új verzió érhető el: v9\.9\.999/.test(s.tx)&&s.tx.includes("v"+appV)&&/Frissítés most/.test(s.tx)&&/Később/.test(s.tx),"újabb kint → sáv, mindkét verzióval",s.tx);
  await p.screenshot({path:path.join(ROOT,"icons/screenshots/uj-verzio-sav.png")}).catch(()=>{});
  /* a tízperces fék: kényszer nélkül nem kérdez újra */
  const fek=await p.evaluate(async()=>{const t=_ujvUtolso;await ujVerzioNez(false);return _ujvUtolso===t;});
  ok(fek,"tízpercen belül nem kérdez újra (kényszer nélkül)");

  /* 4. Később */
  const kes=await p.evaluate(async()=>{document.getElementById("ujvKesobb").click();
    const el1=!!document.getElementById("ujvSav");
    await ujVerzioNez(true);const el2=!!document.getElementById("ujvSav");
    return {el1,el2,ls:localStorage.getItem("ujvKesobb")};});
  ok(!kes.el1&&!kes.el2&&kes.ls==="9.9.999","„Később” → eltűnik, erre a verzióra nem jön vissza",kes);
  kintV="9.9.1000";
  const ujabb=await p.evaluate(async()=>{await ujVerzioNez(true);return !!document.getElementById("ujvSav");});
  ok(ujabb,"egy még újabb verzióra a sáv újra megjelenik");

  /* 5. Frissítés most — futó meccs alatt nem tölt újra */
  const meccs=await p.evaluate(()=>{window.__jelzo=1;const volt=S.playing;S.playing=true;
    const r=ujVerzioFrissit();const tx=(document.getElementById("ujvMegj")||{}).innerText||"";S.playing=volt;return {r,tx,jelzo:window.__jelzo};});
  ok(meccs.r===false&&/meccs fut/.test(meccs.tx)&&meccs.jelzo===1,"futó meccs alatt nem tölt újra, csak szól",meccs);
  /* egyébként: előbb ment (a kém a sessionStorage-be jegyzi, mert az újratöltést túléli), aztán újratölt */
  await p.evaluate(()=>{sessionStorage.removeItem("kemMentes");const o=saveGame;
    saveGame=function(){sessionStorage.setItem("kemMentes",String(+(sessionStorage.getItem("kemMentes")||0)+1));return o.apply(this,arguments);};});
  const [nav]=await Promise.all([p.waitForNavigation({waitUntil:"load",timeout:20000}).then(()=>true).catch(()=>false),
    p.evaluate(()=>{setTimeout(()=>ujVerzioFrissit(),50);})]);
  await p.waitForTimeout(1000);
  const utana=await p.evaluate(()=>({jelzo:window.__jelzo||0,ment:+(sessionStorage.getItem("kemMentes")||0)}));
  ok(nav&&utana.jelzo===0&&utana.ment>=1,"„Frissítés most” → előbb ment, aztán újratölt",{nav,utana});

  /* 6. a service worker átengedi */
  const swEr=await p.evaluate(async()=>{
    try{await navigator.serviceWorker.register("/sw-1.js");}catch(e){return {hiba:String(e)};}
    const reg=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),8000))]);
    return {reg:!!reg};});
  await p.reload({waitUntil:"load"});await p.waitForTimeout(800);
  const vez=await p.evaluate(()=>!!navigator.serviceWorker.controller);
  kintV="7.0.1";
  const a1=await p.evaluate(async()=>(await (await fetch("/version.json",{cache:"no-store"})).json()).v);
  kintV="7.0.2";
  const a2=await p.evaluate(async()=>(await (await fetch("/version.json")).json()).v);
  const cache=await p.evaluate(async()=>{const ks=await caches.keys();let db=0;
    for(const k of ks){const c=await caches.open(k);const r=await c.keys();db+=r.filter(x=>/version\.json/.test(x.url)).length;}return db;});
  ok(swEr.reg&&vez&&a1==="7.0.1"&&a2==="7.0.2"&&cache===0,"a service worker alatt is friss a version.json, és nem kerül a cache-be",{swEr,vez,a1,a2,cache});

  /* 7. az átmenet: a RÉGI worker alatt is friss (az időbélyeg miatt), és az új
     worker aktiváláskor kitakarítja, amit a régi eltett */
  const ctx2=await b.newContext({viewport:{width:430,height:900}});
  const q=await ctx2.newPage();
  q.on("pageerror",e=>errs.push(String(e)));
  await q.addInitScript(()=>{window.HANG_TESZT=true;});
  swRegi=true;kintV="3.9.306";
  await q.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await q.evaluate(async()=>{await navigator.serviceWorker.register("/sw-1.js");await navigator.serviceWorker.ready;});
  await q.reload({waitUntil:"load"});await q.waitForTimeout(800);
  const regi=await q.evaluate(async()=>{const vez=!!navigator.serviceWorker.controller;
    await ujVerzioNez(true);const s1=!!document.getElementById("ujvSav");return {vez,s1};});
  kintV="9.1.1";
  const regi2=await q.evaluate(async()=>{await ujVerzioNez(true);const el=document.getElementById("ujvSav");
    let db=0;for(const k of await caches.keys()){const c=await caches.open(k);db+=(await c.keys()).filter(x=>/version\.json/.test(x.url)).length;}
    return {s2:!!el&&/9\.1\.1/.test(el.innerText),db};});
  ok(regi.vez&&!regi.s1&&regi2.s2,"a régi worker alatt is friss a kint lévő verzió (időbélyeg)",{regi,regi2});
  swRegi=false;
  const tak=await q.evaluate(async()=>{
    const reg=await navigator.serviceWorker.getRegistration();
    const valt=new Promise(r=>{navigator.serviceWorker.addEventListener("controllerchange",()=>r(true));setTimeout(()=>r(false),10000);});
    await reg.update();const v=await valt;
    /* a vezérlő már az aktiválás ELEJÉN vált, a takarítás utána fut le — kivárjuk (≤8 mp) */
    const szamol=async()=>{let n=0;for(const k of await caches.keys()){const c=await caches.open(k);n+=(await c.keys()).filter(x=>/version\.json/.test(x.url)).length;}return n;};
    let db=await szamol();for(let i=0;i<40&&db>0;i++){await new Promise(r=>setTimeout(r,200));db=await szamol();}
    return {v,db};});
  ok(regi2.db>0&&tak.v&&tak.db===0,"az új worker aktiváláskor kitakarítja a régi version.json-bejegyzéseket",{elotte:regi2.db,tak});
  await ctx2.close();

  /* 8. 🐞 a párharc-animáció ellenfele (a DUEL a playMatchMotor helyi konstansa volt) */
  const ev=await p.evaluate(()=>{
    const src=String(playMatchMotor);
    const be=/const DUEL=h2hScript;h2hScript=null;\s*_evaDuel=DUEL\|\|null;/.test(src);
    _evaDuel={oppName:"Társ FC",oppOvr:91.5};
    const nev=evaEllenfelNev(),cimke=evaEllenfelCimke(),ero=evaEllenfelEro();
    _evaDuel=null;
    const regiSzoveg=/typeof DUEL/.test(String(evaEllenfelNev)+String(evaEllenfelCimke)+String(evaEllenfelEro));
    return {be,nev,cimke,ero,regiSzoveg};});
  ok(ev.be&&ev.nev==="Társ FC"&&ev.cimke==="Társ FC"&&ev.ero===91.5&&!ev.regiSzoveg,
    "párharcban az animáció a társ nevét és erejét veszi (a kezdőrúgás beírja)",ev);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
