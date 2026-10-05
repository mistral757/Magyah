/* 🕹️ 3.9.204 — A PIXEL TÉMA SAJÁT ÉLETE.

   BEJELENTÉS: „A pixelated témának lehetnének saját animációi, amik
   gombonyomáskor, játékosnézet megnyitáskor, új oldal betöltésekor, és idle
   állapotban is futnának. Szerintem tök menő lenne, ha élettel teli lenne az
   egész."

   Amit mér:
     1. INDULÁS: Pixelben képcső-bekapcsolás (két fél-lap + fényvonal), ami
        magától eltűnik, és nem fog meg kattintást;
     2. GOMBNYOMÁS: pixelszikrák az ujj alól (tíz darab), egyszerre legfeljebb
        három sorozat, és el is tűnnek;
     3. JÁTÉKOSNÉZET ÉS ÚJ OLDAL: a lenyíló adatlap és az ablakok képcső-
        animációt, a megjelenő szakaszok kirajzolódó animációt kapnak —
        transform nélkül (a fixed menüsáv miatt);
     4. TÉTLENSÉG: a 8 bites focista megjelenik, halad, dekázáskor a labda a
        feje fölé pattog; bármilyen érintésre eltűnik;
     3b. GÖRGETÉS (3.9.205): a kirajzolódás után nem marad vágás a nézeten —
        a képernyőn túllógó tartalom görgetéssel elérhető;
     5. A KAPU: más témában és kikapcsolt ✨ mellett semmi nem fut; a
        „Szaggatott mozgás" kikapcsolásával sima a mozgás. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9247;
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
const errs=[];
async function oldal(b,{w,h,tema,ls,reduce}){
  const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:reduce?"reduce":"no-preference"});
  const p=await ctx.newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(([tema,ls])=>{window.HANG_TESZT=true;
    try{if(tema)localStorage.setItem("theme30_0",tema);Object.entries(ls||{}).forEach(([k,v])=>localStorage.setItem(k,v));}catch(e){}},[tema,ls||{}]);
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForFunction(()=>typeof fxSync==="function",null,{timeout:15000});
  await p.waitForTimeout(400);
  return {p,ctx};}
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});

  console.log("\n— 1. INDULÁS —");
  {const ctx=await b.newContext({viewport:{width:430,height:900}});const p=await ctx.newPage();
   p.on("pageerror",e=>errs.push(String(e)));
   await p.addInitScript(()=>{localStorage.setItem("theme30_0","pixel");window.HANG_TESZT=true;});
   await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
   await p.waitForTimeout(150);
   const a=await p.evaluate(()=>{const o=document.querySelector(".pxBoot");return o?{n:o.children.length,pe:getComputedStyle(o).pointerEvents}:null;});
   await p.waitForTimeout(1600);
   const bb=await p.evaluate(()=>!!document.querySelector(".pxBoot"));
   ok(a&&a.n===3&&a.pe==="none","induláskor képcső-bekapcsolás: két fél-lap és a fényvonal, kattintást nem fog meg",a);
   ok(!bb,"…és magától eltűnik");
   await ctx.close();}

  console.log("\n— 2. GOMBNYOMÁS —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"pixel"});
   await p.waitForTimeout(1500);
   const r=await p.evaluate(async()=>{const btn=document.getElementById("mpSoloBtn"),rc=btn.getBoundingClientRect();
     const ev=()=>btn.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,clientX:rc.left+20,clientY:rc.top+10}));
     ev();const egy=document.querySelectorAll(".pxSparkBox").length,db=document.querySelector(".pxSparkBox").children.length;
     ev();ev();ev();ev();const sok=document.querySelectorAll(".pxSparkBox").length;
     await new Promise(r=>setTimeout(r,1100));
     return {egy,db,sok,utana:document.querySelectorAll(".pxSparkBox").length};});
   ok(r.egy===1&&r.db===10,"egy gombnyomás: tíz pixelszikra",r);
   ok(r.sok<=3,"egyszerre legfeljebb három sorozat (gyors nyomkodásnál sem árad el)",r.sok);
   ok(r.utana===0,"a szikrák el is tűnnek",r.utana);
   await ctx.close();}

  console.log("\n— 3. JÁTÉKOSNÉZET ÉS ÚJ OLDAL —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"pixel"});
   const r=await p.evaluate(()=>{
     const d=document.createElement("div");d.className="hubDetail";d.textContent="x";document.body.appendChild(d);
     const sec=document.createElement("section");sec.className="card";sec.textContent="y";document.body.appendChild(sec);
     const tm=document.getElementById("themeModal");tm.classList.remove("hide");
     const cs=e=>getComputedStyle(e);
     const ki={det:cs(d).animationName,sec:cs(sec).animationName,secTr:cs(sec).transform,modal:cs(tm.querySelector(".card")).animationName};
     tm.classList.add("hide");applyTheme("dark");
     ki.detSotet=cs(d).animationName;ki.secSotet=cs(sec).animationName;
     d.remove();sec.remove();applyTheme("pixel");return ki;});
   ok(r.det==="pxPowerOn"&&r.modal==="pxPowerOn","a lenyíló játékos-adatlap és az ablakok képcső-animációval nyílnak",r);
   ok(r.sec==="pxWipe"&&r.secTr==="none","a megjelenő szakasz kirajzolódik — transform nélkül (a fixed menüsáv miatt)",{a:r.sec,t:r.secTr});
   ok(r.detSotet==="none"&&r.secSotet==="none","más témában ezek nem futnak",{d:r.detSotet,s:r.secSotet});
   await ctx.close();}

  console.log("\n— 3b. GÖRGETÉS (3.9.205) —");
  /* BEJELENTVE: „Telefonos fekvő nézetben nem működik a görgetés … csak a
     pixelated verzióban" — a kirajzolódó animáció végállapota (clip-path)
     a nézeten maradt, és levágta a képernyőn túllógó tartalmat */
  for(const [w,h] of [[844,390],[390,844]]){
    const {p,ctx}=await oldal(b,{w,h,tema:"pixel"});await p.waitForTimeout(2400);
    const r=await p.evaluate(async()=>{const e=document.getElementById("mpEntry");e.scrollTop=e.scrollHeight;
      await new Promise(r=>setTimeout(r,300));
      const foot=document.querySelector(".heFoot").getBoundingClientRect();
      const el=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-5,foot.top+20));
      return {clip:getComputedStyle(document.getElementById("mpViewHome")).clipPath,lab:!!(el&&el.closest&&el.closest(".heFoot"))};});
    ok(r.clip==="none"&&r.lab,`${w}×${h}: a kirajzolódás után nem marad vágás — a lap alja görgetéssel elérhető és kattintható`,r);
    await ctx.close();}

  console.log("\n— 4. TÉTLENSÉG —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"pixel"});
   await p.waitForTimeout(800);
   const r=await p.evaluate(async()=>{const ki={};
     ki.idozito=!!_pxIdleT;
     _pxRunN=0;pxIdleStart();
     const x=()=>{const e=document.querySelector(".pxRunner");return e?Math.round(e.getBoundingClientRect().left):null;};
     await new Promise(r=>setTimeout(r,700));ki.x1=x();
     await new Promise(r=>setTimeout(r,900));ki.x2=x();
     ki.keret=document.querySelector(".pxRunner .pxRunBody").children.length;
     /* dekázás: a második kör megáll középen, a labda a feje fölé pattog */
     pxIdleReset();await new Promise(r=>setTimeout(r,450));
     _pxRunN=1;pxIdleStart();
     let fent=false;const t0=Date.now();
     while(Date.now()-t0<6000){await new Promise(r=>setTimeout(r,60));
       const run=document.querySelector(".pxRunner");if(!run)continue;
       const bl=run.querySelector(".pxBall").getBoundingClientRect(),hd=run.querySelector(".pxRunBody").getBoundingClientRect();
       if(bl.bottom<hd.top+2){fent=true;break;}}
     ki.fent=fent;
     document.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));
     await new Promise(r=>setTimeout(r,500));
     ki.eltunt=!document.querySelector(".pxRunner");
     return ki;});
   ok(r.idozito,"a tétlenség-időzítő betöltéskor él");
   ok(r.x1!=null&&r.x2!=null&&r.x2>r.x1&&r.keret===2,"a 8 bites focista megjelenik és halad (két futó képkocka)",r);
   ok(r.fent,"dekázáskor a labda a feje fölé pattog",r.fent);
   ok(r.eltunt,"bármilyen érintésre eltűnik",r.eltunt);
   await ctx.close();}

  console.log("\n— 5. A KAPU —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"dark"});
   const r=await p.evaluate(()=>{const btn=document.getElementById("mpSoloBtn");
     btn.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,clientX:50,clientY:50}));
     const sotet=document.querySelectorAll(".pxSparkBox").length;
     applyTheme("pixel");document.querySelectorAll(".pxBoot").forEach(e=>e.remove());fxSet(false);
     btn.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true,clientX:50,clientY:50}));
     pxBoot();
     const ki2={szikra:document.querySelectorAll(".pxSparkBox").length,boot:!!document.querySelector(".pxBoot"),fut:(pxIdleStart(),!!document.querySelector(".pxRunner"))};
     fxSet(true);pxIdleReset();
     const e1=pxEase(5);pixOptSet("pixMoveOff",false);const e2=pxEase(5);pixOptSet("pixMoveOff",true);
     return {sotet,ki2,e1,e2,v:APP_VERSION};});
   ok(r.sotet===0,"a Sötét témában nincs pixelszikra",r.sotet);
   ok(r.ki2.szikra===0&&!r.ki2.boot&&!r.ki2.fut,"kikapcsolt ✨ mellett a Pixelben sincs szikra, bekapcsolás, futó",r.ki2);
   ok(r.e1==="steps(5)"&&r.e2==="ease-out","lépcsős mozgás — a „Szaggatott mozgás” kikapcsolásával sima",{e1:r.e1,e2:r.e2});
   ok(String(r.v).localeCompare("3.9.204",undefined,{numeric:true})>=0,"verzió legalább 3.9.204",r.v);
   await ctx.close();}
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
