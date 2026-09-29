/* ⚙ 3.9.164 — A BEÁLLÍTÁSOK ÉS A KERETEK A KEZDŐLAPON.

   KIMONDOTT KÉRÉS: „egyedül az új játék indításakor látható két kis
   menüpont ki kéne jöjjön a kezdőlapra. A kis beállítások és a csapatok
   felsorolása, névmódosítás… odaillő stílusban."

   Amit mér:
     1. a kezdőlapon ott a két sor (a karrierutak stílusában);
     2. a ⚙ sor a Beállítások ablakot nyitja, és az a kezdőlap FÖLÖTT van
        (a gombjára koppintva tényleg azt éri el a felhasználó, nem a
        kezdőlapot) — benne a tempó, a téma és a hang;
     3. a 📊 sor a Keretek ablakot nyitja, a névszerkesztő is elérhető
        belőle, és szintén a kezdőlap fölött;
     4. bezáráskor a réteg-emelés lekerül (a játékon belül a régi rend);
     5. a módválasztó régi két gombja változatlanul működik;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9195;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json",
  ".mp3":"audio/mpeg",".ogg":"audio/ogg"};
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(2500);
  const felul=async(sel)=>p.evaluate((sel)=>{
    const el=document.querySelector(sel);if(!el)return false;
    el.scrollIntoView({block:"center"});
    const r=el.getBoundingClientRect();
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return !!hit&&(hit===el||el.contains(hit));},sel);
  const h=await p.evaluate(()=>{
    const s=document.getElementById("heToolSect");
    const home=document.getElementById("mpEntry");
    return {van:!!s,lathato:!!(s&&s.offsetParent),home:!!(home&&getComputedStyle(home).display!=="none"),
      ket:["heSettingsBtn","heSquadsBtn"].every(id=>{const e=document.getElementById(id);return e&&e.classList.contains("heWay");}),
      /* a jelölés folytonos: ha a két út rejtett, ez az „( A )" */
      jel:(()=>{const a=document.getElementById("heWaySect").classList.contains("hide");
        const l=s.querySelector(".heLbl").textContent,n=[...s.querySelectorAll(".heNum")].map(x=>x.textContent).join(",");
        return a?(l==="( A )"&&n==="01,02"):(l==="( B )"&&n==="03,04");})()};});
  console.log("— 1. A KEZDŐLAPON —");
  ok(h.van&&h.lathato&&h.home&&h.ket&&h.jel,"a kezdőlapon ott a „( B ) Beállítások és a világ” két sora, a karrierutak stílusában",h);
  await p.evaluate(()=>document.getElementById("heSettingsBtn").scrollIntoView({block:"center"}));
  await p.click("#heSettingsBtn");await p.waitForTimeout(300);
  const s=await p.evaluate(()=>{const m=document.getElementById("themeModal");
    return {nyitva:!m.classList.contains("hide"),z:getComputedStyle(m).zIndex,
      tempo:!!document.getElementById("ffModalBody").children.length,
      tema:!!document.getElementById("themeModalBody").children.length,
      hang:!!document.getElementById("hangModalBody").children.length};});
  console.log("\n— 2. BEÁLLÍTÁSOK —");
  ok(s.nyitva&&+s.z>400&&s.tempo&&s.tema&&s.hang,"a ⚙ sor a Beállítások ablakot nyitja a kezdőlap fölött — tempó, téma, hang",s);
  ok(await felul("#themeCloseBtn"),"a Bezár gomb tényleg elérhető (nem takarja a kezdőlap)");
  await p.click("#themeCloseBtn");await p.waitForTimeout(200);
  const s2=await p.evaluate(()=>{const m=document.getElementById("themeModal");return {rejtve:m.classList.contains("hide"),emel:m.classList.contains("overHome")};});
  ok(s2.rejtve&&!s2.emel,"bezárva a réteg-emelés is lekerül",s2);
  await p.evaluate(()=>document.getElementById("heSquadsBtn").scrollIntoView({block:"center"}));
  await p.click("#heSquadsBtn");await p.waitForTimeout(300);
  const q=await p.evaluate(()=>{const m=document.getElementById("squadModal");
    return {nyitva:!m.classList.contains("hide"),z:getComputedStyle(m).zIndex,
      sorok:document.getElementById("squadModalBody").textContent.length};});
  console.log("\n— 3. KERETEK ÉS NEVEK —");
  ok(q.nyitva&&+q.z>400&&q.sorok>100,"a 📊 sor a Keretek ablakot nyitja a kezdőlap fölött, tartalommal",q);
  ok(await felul("#squadModeNames"),"a névszerkesztő gombja elérhető");
  await p.click("#squadModeNames");await p.waitForTimeout(300);
  const n=await p.evaluate(()=>({mod:_squadMode,txt:document.getElementById("squadModalBody").textContent.length}));
  ok(n.mod==="nevek"&&n.txt>50,"a névszerkesztő megnyílik a kezdőlapról is",n);
  /* háttérre koppintva is bezárul, és az emelés lekerül */
  await p.evaluate(()=>{const m=document.getElementById("squadModal");m.dispatchEvent(new MouseEvent("click",{bubbles:true}));});
  const q2=await p.evaluate(()=>{const m=document.getElementById("squadModal");return {rejtve:m.classList.contains("hide"),emel:m.classList.contains("overHome")};});
  ok(q2.rejtve&&!q2.emel,"háttérre koppintva bezárul, az emelés lekerül",q2);
  console.log("\n— 4. A MÓDVÁLASZTÓ RÉGI GOMBJAI —");
  const r=await p.evaluate(()=>{
    document.getElementById("homeSettingsBtn").click();
    const m=document.getElementById("themeModal");
    const a={nyitva:!m.classList.contains("hide"),emel:m.classList.contains("overHome")};
    closeHomeModal("themeModal");
    document.getElementById("homeStatsBtn").click();
    const q=document.getElementById("squadModal");
    a.q={nyitva:!q.classList.contains("hide"),emel:q.classList.contains("overHome")};
    closeHomeModal("squadModal");
    return a;});
  ok(r.nyitva&&!r.emel&&r.q.nyitva&&!r.q.emel,"a módválasztó ⚙ és 📊 gombja a régi módon nyit (emelés nélkül)",r);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
