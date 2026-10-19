/* 📱 3.9.261 — PvP-ÉRTESÍTÉSEK A BEÁLLÍTÁSOKBÓL, SZOBA NÉLKÜL.

   KIMONDOTT KÉRÉS: „Csináljuk már meg, hogy itt a beállításokban az
   értesítések bekapcs működjön úgy, hogy ne csak itt a várakozó képernyőn
   lehessen bekapcsolni a PvP értesítéseket… legyen egy külön pvp
   értesítések gomb."

   Amit mér (valódi Beállítások-panel; a böngésző push-szolgáltatása
   helyettesítve, mert fej nélküli Chromiumban nincs):
     1. két kapcsoló: Értesítések (fő) és 📱 PvP-értesítések;
     2. a PvP-kapcsoló a VALÓDI állapotot mutatja: feliratkozás nélkül KI;
     3. bekapcsolva — SZOBA NÉLKÜL — engedélyt kér, feliratkozik, BE lesz;
     4. ha épp szobában vagy, a feliratkozás azonnal a szobába is kimegy;
     5. kikapcsolva leiratkozik, a szobából is kikerül, KI lesz;
     6. elutasított engedélynél nem mutat hamis BE-t, és kimondja az okot;
     7. a fő kapcsoló kikapcsolva a PvP-kapcsolót is letiltja;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9261;
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
  const futas=async(engedely)=>{
    const p=await (await b.newContext({viewport:{width:400,height:860}})).newPage();
    const errs=[];p.on("pageerror",e=>errs.push(String(e)));
    await p.addInitScript((eng)=>{window.HANG_TESZT=true;
      let perm="default";
      try{Object.defineProperty(Notification,"permission",{get:()=>perm});
          Notification.requestPermission=()=>{perm=eng;return Promise.resolve(eng);};}catch(e){}
      /* a push-szolgáltatás helyettese: egy feliratkozás, ami le is iratkoztatható */
      window.__sub=null;
      const pm={getSubscription:async()=>window.__sub,
        subscribe:async()=>{window.__sub={endpoint:"https://push.example/x",keys:{p256dh:"a",auth:"b"},
          unsubscribe:async()=>{window.__sub=null;return true;},toJSON(){return {endpoint:this.endpoint,keys:this.keys};}};return window.__sub;}};
      const reg={pushManager:pm};
      try{Object.defineProperty(navigator.serviceWorker,"ready",{get:()=>Promise.resolve(reg)});
          navigator.serviceWorker.getRegistration=async()=>reg;}catch(e){}
      try{if(!("PushManager" in window))window.PushManager=function(){};}catch(e){}},engedely);
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.waitForFunction(()=>typeof ertesitesRender==="function",null,{timeout:15000});
    const r=await p.evaluate(async()=>{
      const ki={};
      try{localStorage.removeItem(PUSH_SUB_KEY);localStorage.removeItem(ERT_KEY);}catch(e){}
      _ertBeall=null;
      const box=document.getElementById("ertModalBody");
      const allas=()=>({pvp:!!(document.getElementById("ertPvpOn")||{}).checked,
        tiltva:!!(document.getElementById("ertPvpOn")||{}).disabled,
        txt:box.textContent.replace(/\s+/g," "),msg:((document.getElementById("ertPvpMsg")||{}).textContent||""),
        chrome:box.querySelectorAll("a[data-chrome]").length});
      const var_=async(ms)=>new Promise(r=>setTimeout(r,ms));
      ertesitesRender();
      ki.kezdet=Object.assign(allas(),{ket:!!document.getElementById("ertOn")&&!!document.getElementById("ertPvpOn")});
      /* SZOBA NÉLKÜL kapcsoljuk be */
      MP.activeRoom=null;
      const pv=document.getElementById("ertPvpOn");pv.checked=true;pv.onchange();
      await var_(600);
      ki.be=Object.assign(allas(),{kulcs:localStorage.getItem(PUSH_SUB_KEY),sub:!!window.__sub});
      /* most egy szobában vagyunk: a feliratkozás oda is kimegy */
      const irasok=[];
      mpNet.mode="fb";mpNet.db={};mpNet.fns={ref:(db,u)=>u,update:async(u,v)=>{irasok.push([u,v]);}};
      MP.activeRoom="TESZT1";
      await ertesitesPvpSet(true);
      ki.szoba=irasok.filter(x=>/TESZT1\/players\//.test(x[0])&&x[1]&&typeof x[1].push==="string").length;
      /* kikapcsolás */
      irasok.length=0;
      ertesitesRender();
      const pv2=document.getElementById("ertPvpOn");pv2.checked=false;pv2.onchange();
      await var_(600);
      ki.ki=Object.assign(allas(),{kulcs:localStorage.getItem(PUSH_SUB_KEY),sub:!!window.__sub,
        torles:irasok.some(x=>x[1]&&x[1].push===null)});
      /* a fő kapcsoló KI → a PvP-kapcsoló tiltva */
      ertesitesBeall().on=false;ertesitesRender();
      ki.foKi=allas();
      ertesitesBeall().on=true;MP.activeRoom=null;mpNet.mode=null;
      return ki;});
    r.errs=errs;await p.close();return r;};
  const g=await futas("granted"),d=await futas("denied");
  console.log("=== engedély megadva ===");
  ok(g.kezdet.ket,"két kapcsoló: Értesítések és 📱 PvP-értesítések");
  ok(!g.kezdet.pvp&&/KI/.test(g.kezdet.txt),"feliratkozás nélkül a PvP-kapcsoló KI (nem hazudik BE-t)",g.kezdet.txt.slice(0,200));
  ok(g.be.pvp&&g.be.kulcs==="1"&&g.be.sub&&/Kész/.test(g.be.msg),"szoba nélkül bekapcsolva: engedély, feliratkozás, BE",g.be);
  ok(/minden közös szobádban/.test(g.be.txt),"a sor kimondja: minden közös szobára érvényes");
  ok(g.szoba>=1,"szobában a feliratkozás azonnal a szobába is kimegy",g.szoba);
  ok(!g.ki.pvp&&g.ki.kulcs===null&&!g.ki.sub&&g.ki.torles,"kikapcsolva leiratkozik, a szobából is kikerül, KI",g.ki);
  ok(g.foKi.tiltva,"a fő kapcsoló KI → a PvP-kapcsoló tiltva");
  console.log("=== engedély elutasítva ===");
  ok(!d.be.pvp&&/Nem sikerült/.test(d.be.msg)&&/letiltottad/.test(d.be.msg),"nem mutat hamis BE-t, kimondja az okot",d.be.msg);
  ok(g.errs.length===0&&d.errs.length===0,"nincs oldalhiba",g.errs.concat(d.errs).slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
