/* 🤝 3.9.214 — A GYORS INDÍTÁS PVP-SZOBÁBAN: A KÖZÖS KARRIER FAJTÁJA

   KIMONDOTT KÉRÉS: „Az egyszerű kezdés jelenleg nem veszi figyelembe a
   választási lehetőséget dinamikus és hagyományos mód között, amennyiben pvp
   szobát indítasz, annak kell egy külön kapcsoló oda."

   Amit mér:
     1. AZ ALAPBEÁLLÍTÁS: a Beállítások → 🎛️ blokkban saját sora van
        („Közös karrier fajtája"), és a választása a tárba íródik;
     2. A HÁZIGAZDA ÚTJA: a szobát indító házigazda gyors panele a tárolt
        fajtával nyílik (mindkét irányban), a felirata kimondja, hogy
        mindkettőtökre szól; a panelen váltás visszaíródik a tárba;
     3. A PUBLIKÁLÁS: az „Indulás →" a választott fajtát küldi a szoba
        csomagjában (pyr.on);
     4. EGYJÁTÉKOSBAN a kezdőlap gombja dönt, és a gyors panelen váltás sem
        írja felül a közös karrier alapbeállítását. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9256;
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
async function uj(b){
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  return {p,errs};}
/* a házigazda indítása, hálózat nélkül: a szoba-backend csonk */
const HOST=(want)=>{
  if(want!==undefined)kaSet("mpMode",want);
  window._pub=null;
  window.mpBk=()=>({get:async()=>({seed:"PROBA-SEED"}),
    publishStart:async(room,o)=>{window._pub=o;},setReady:async()=>{}});
  MP.activeRoom="PROBA1";MP.role="host";
  $("mpStartBtn").onclick();
  const sel=[...document.querySelectorAll("#qkModeGrid button")].find(x=>x.classList.contains("sel"));
  return {quick:!$("scQuick").classList.contains("hide"),sel:sel&&sel.dataset.qk,pyrWanted,
    lbl:($("qkModeLbl")||{}).textContent||""};};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});

  console.log("— 1. az alapbeállítás —");
  {const {p,errs}=await uj(b);
   const r=await p.evaluate(()=>{
     const o={v:APP_VERSION};
     const host=document.createElement("div");document.body.appendChild(host);
     renderKaSettings(host);
     const sel=host.querySelector('select[data-ka="mpMode"]');
     o.van=!!sel;
     o.opts=sel?[...sel.options].map(x=>x.value):[];
     o.sor=sel?sel.closest(".kaRow").textContent:"";
     if(sel){sel.value="pyr";sel.onchange();}
     o.tar=kaGet("mpMode");
     host.remove();
     return o;});
   ok(String(r.v).localeCompare("3.9.214",undefined,{numeric:true})>=0,"a verzió legalább 3.9.214",r.v);
   ok(r.van&&JSON.stringify(r.opts)==='["dyn","pyr"]',"saját sora van a két fajtával",r.opts);
   ok(/Közös karrier fajtája/.test(r.sor)&&/PvP/.test(r.sor),"a sor megnevezi, és kimondja, hogy PvP-szobára szól",r.sor);
   ok(r.tar==="pyr","a választás a tárba íródik",r.tar);

   console.log("\n— 2–3. a házigazda útja és a publikálás —");
   const h1=await p.evaluate(HOST);   /* a tárban: pyr (az előbb állítottuk) */
   ok(h1.quick&&h1.sel==="pyr"&&h1.pyrWanted===true,"a gyors panel a tárolt fajtával (Hagyományos) nyílik",h1);
   ok(/közös karrier fajtája/i.test(h1.lbl)&&/mindkettőtökre/.test(h1.lbl),"a felirat kimondja, hogy mindkettőtökre szól",h1.lbl);
   const h2=await p.evaluate(()=>{
     document.querySelector('#qkModeGrid button[data-qk="dyn"]').click();
     return {tar:kaGet("mpMode"),pyrWanted};});
   ok(h2.tar==="dyn"&&h2.pyrWanted===false,"a panelen váltás visszaíródik a tárba",h2);
   await p.evaluate(()=>{document.querySelector('#qkModeGrid button[data-qk="pyr"]').click();$("qkGoBtn").click();});
   await p.waitForFunction(()=>!!window._pub,null,{timeout:15000}).catch(()=>{});
   const pub=await p.evaluate(()=>({pyr:window._pub&&window._pub.settings&&window._pub.settings.pyr,tar:kaGet("mpMode")}));
   ok(pub.pyr&&pub.pyr.on===true,"az „Indulás →\" a Hagyományost publikálja a szobába",pub);
   ok(!errs.length,"nincs oldalhiba (1)",errs.slice(0,3));
   await p.context().close();}

  {const {p,errs}=await uj(b);
   const h=await p.evaluate(()=>{kaSet("mpMode","dyn");return null;});void h;
   const r=await p.evaluate(HOST);
   ok(r.quick&&r.sel==="dyn"&&r.pyrWanted===false,"a másik irány: a tárolt Dinamikussal nyílik",r);
   await p.evaluate(()=>{$("qkGoBtn").click();});
   await p.waitForFunction(()=>!!window._pub,null,{timeout:15000}).catch(()=>{});
   const pub=await p.evaluate(()=>window._pub&&window._pub.settings&&window._pub.settings.pyr);
   ok(pub&&pub.on===false,"…és a Dinamikust publikálja",pub);
   ok(!errs.length,"nincs oldalhiba (2)",errs.slice(0,3));
   await p.context().close();}

  console.log("\n— 5. a bejelentett eset: lépcsős játékos előbb egyjátékosban, aztán PvP-szoba —");
  {const {p,errs}=await uj(b);
   const r=await p.evaluate((HOSTsrc)=>{
     const o={};
     o.lepcso=!!unlockPreset();
     /* egyjátékos beállító a kezdő lépcsőn: a lépcső zárolja a módválasztót */
     enterCareerSetupFromHome(true);
     o.spZar=[...document.querySelectorAll("#pyrModeGrid button")].some(x=>x.disabled);
     goHomeScreen();
     /* …majd szobát indít, a tárban a Dinamikus */
     const HOST=eval("("+HOSTsrc+")");
     const h=HOST("dyn");
     o.mp=h;
     o.mpZar=[...document.querySelectorAll("#pyrModeGrid button")].some(x=>x.disabled);
     o.qkZar=[...document.querySelectorAll("#qkModeGrid button")].map(x=>x.disabled);
     document.querySelector('#qkModeGrid button[data-qk="pyr"]').click();
     o.utanPyr=pyrWanted;
     document.querySelector('#qkModeGrid button[data-qk="dyn"]').click();
     o.utanDyn=pyrWanted;
     o.jegyzet=!$("unlockSetupNote").classList.contains("hide");
     return o;},HOST.toString());
   ok(r.lepcso&&r.spZar,"előfeltétel: a kezdő lépcsőn az egyjátékos beállító zárolja a módválasztót",r);
   ok(r.mp.sel==="dyn"&&!r.mpZar&&r.qkZar.every(x=>!x),"a PvP-szobában a lépcső zárai feloldódnak, mindkét gomb választható",r);
   ok(r.utanPyr===true&&r.utanDyn===false,"a gyors panelen a váltás oda-vissza működik",[r.utanPyr,r.utanDyn]);
   ok(!r.jegyzet,"a lépcső jegyzete nem látszik a közös karrierben");
   ok(!errs.length,"nincs oldalhiba (5)",errs.slice(0,3));
   await p.context().close();}

  console.log("\n— 4. egyjátékosban a kezdőlap dönt —");
  {const {p,errs}=await uj(b);
   const r=await p.evaluate(()=>{
     kaSet("gyors",true);kaSet("mpMode","pyr");
     unlockGatesOn=()=>false;   /* a kezdő lépcső a hagyományost írja elő — itt a szabad játékost mérjük */
     enterCareerSetupFromHome(false);
     const sel=[...document.querySelectorAll("#qkModeGrid button")].find(x=>x.classList.contains("sel"));
     const o={sel:sel&&sel.dataset.qk,pyrWanted,lbl:($("qkModeLbl")||{}).textContent};
     document.querySelector('#qkModeGrid button[data-qk="pyr"]').click();
     document.querySelector('#qkModeGrid button[data-qk="dyn"]').click();
     o.tar=kaGet("mpMode");
     return o;});
   ok(r.sel==="dyn"&&r.pyrWanted===false,"a kezdőlap Dinamikus gombja dönt, nem a közös alapbeállítás",r);
   ok(r.lbl==="A karrier fajtája","egyjátékosban a megszokott felirat",r.lbl);
   ok(r.tar==="pyr","az egyjátékos váltás nem írja felül a közös karrier alapbeállítását",r.tar);
   ok(!errs.length,"nincs oldalhiba (3)",errs.slice(0,3));
   await p.context().close();}

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
