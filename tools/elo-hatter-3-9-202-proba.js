/* ✨ 3.9.202 — KÉT HASÁBOS KEZDŐLAP + ÉLŐ HÁTTÉR (SÖTÉT-ARANY MINTA).

   BEJELENTÉS: „A fekvő és PC megjelenés elég gagyi a kezdőképernyőn.
   Mindegyik témánál legyen megoldva, hogy telefonon és PC-n is jó legyen az
   elrendezés fekvő módban. Plusz elkezdhetnél kidolgozni egy olyan
   kapcsolót, amivel mindegyik téma megjelenésébe beépül egy csomó plusz
   elegáns és ízléses animáció. Kezdve a kezdőképernyővel […] egy focipálya
   lenne dőlt szögben felülnézetből, ahol éppen valamilyen edzés […] zajlik.
   […] a HUBon belül a Menü mögött pedig lehetne valami ilyen felülnézetes.
   […] kezdheted azzal, hogy csak az egyik basic (nem pixelated) témához
   csinálsz meg mindent példaképpen."

   Amit mér:
     1. AZ ELRENDEZÉS mind a négy témában: asztalon (1440×900) és fekvő
        telefonon (844×390) két hasáb, egymás mellett; állva (390×844) egy;
        a kezdőlap sehol nem lóg ki oldalra; fekve a témagombok nem
        csúsznak a felső feliratra, a ✨ gomb nem ül rá a témagombokra;
     2. A KAPCSOLÓ: alapból BE; „kevesebb mozgás" rendszer-beállításnál KI,
        hacsak nem kapcsoltad be kifejezetten; a ✨ gomb és a Beállítások
        kapcsolója átállítja, a választás megmarad;
     3. A KEZDŐLAP JELENETE: a Sötét-arany témában él és MOZOG; témaváltáskor
        a téma festékével él tovább (3.9.203); kikapcsolva leáll;
     4. A HUB MENÜJE MÖGÖTT: a menü megnyitásakor a felülnézetes jelenet
        látszik és mozog; a menü bezárásakor eltűnik. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9245;
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

  console.log("\n— 1. AZ ELRENDEZÉS —");
  const elr={};
  for(const tema of ["dark","paper","noir","pixel"])for(const [w,h] of [[1440,900],[844,390],[390,844]]){
    const {p,ctx}=await oldal(b,{w,h,tema});
    elr[tema+"-"+w]=await p.evaluate(()=>{
      const R=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom};};
      const ut=(a,c)=>a&&c&&!(a.r<=c.l||c.r<=a.l||a.b<=c.t||c.b<=a.t);
      const top=R(".heTop"),side=R(".heSide"),e=document.getElementById("mpEntry");
      return {ket:!!(top&&side&&side.l>=top.r-1&&Math.abs(side.t-top.t)<900),
        egy:!!(top&&side&&side.t>=top.b-1),
        kilog:e.scrollWidth-e.clientWidth,
        temaFel:ut(R("#heTheme"),R(".heEyebrow span")),fxTema:ut(R("#heTheme"),R("#heFxBtn")),
        fxProfil:ut(R("#heFxBtn"),R("#mpProfileBtn"))};});
    await ctx.close();}
  const T=["dark","paper","noir","pixel"];
  ok(T.every(t=>elr[t+"-1440"].ket),"asztalon (1440×900) két hasáb egymás mellett, mind a négy témában",T.map(t=>elr[t+"-1440"].ket));
  ok(T.every(t=>elr[t+"-844"].ket),"fekvő telefonon (844×390) is két hasáb",T.map(t=>elr[t+"-844"].ket));
  ok(T.every(t=>elr[t+"-390"].egy),"állva (390×844) egy hasáb: a karrierek és a szakaszok a cím alatt",T.map(t=>elr[t+"-390"].egy));
  ok(Object.values(elr).every(x=>x.kilog<=0),"a kezdőlap sehol nem lóg ki oldalra",Object.fromEntries(Object.entries(elr).map(([k,v])=>[k,v.kilog])));
  ok(T.every(t=>!elr[t+"-844"].temaFel),"fekve a témagombok nem csúsznak a felső feliratra",T.map(t=>elr[t+"-844"].temaFel));
  ok(Object.values(elr).every(x=>!x.fxTema&&!x.fxProfil),"a ✨ gomb nem ül rá a témagombokra és a profilra");

  console.log("\n— 2. A KAPCSOLÓ —");
  {const {p,ctx}=await oldal(b,{w:1440,h:900,tema:"dark"});
   const r=await p.evaluate(async()=>{const ki={};const H=document.documentElement;
     ki.alap=!H.classList.contains("fxAnimOff");ki.live=H.classList.contains("fxLive");
     ki.gomb=document.getElementById("heFxBtn").getAttribute("aria-pressed");
     document.getElementById("heFxBtn").click();
     ki.ki={off:H.classList.contains("fxAnimOff"),live:H.classList.contains("fxLive"),ls:localStorage.getItem("fxAnimOff30_0"),
       gomb:document.getElementById("heFxBtn").getAttribute("aria-pressed"),
       disp:getComputedStyle(document.getElementById("fxHome")).display};
     /* a Beállítások kapcsolója */
     renderThemeModal();const ob=document.getElementById("fxOptBtn");
     ki.opt={van:!!ob,felirat:ob&&ob.querySelector(".fxOptSw").textContent};
     ob.click();const ob2=document.getElementById("fxOptBtn");
     ki.opt2={felirat:ob2&&ob2.querySelector(".fxOptSw").textContent,on:!H.classList.contains("fxAnimOff"),ls:localStorage.getItem("fxAnimOff30_0")};
     return ki;});
   ok(r.alap&&r.live&&r.gomb==="true","alapból BE, a Sötét-arany témában él, a ✨ gomb benyomva",r);
   ok(r.ki.off&&!r.ki.live&&r.ki.ls==="1"&&r.ki.gomb==="false"&&r.ki.disp==="none","a ✨ gombbal KI: a jelenet eltűnik, a választás megmarad",r.ki);
   ok(r.opt.van&&r.opt.felirat==="KI"&&r.opt2.felirat==="BE"&&r.opt2.on&&r.opt2.ls==="0","a Beállítások kapcsolója mutatja és átállítja",{a:r.opt,b:r.opt2});
   await ctx.close();}
  {const {p,ctx}=await oldal(b,{w:1440,h:900,tema:"dark",reduce:true});
   const a=await p.evaluate(()=>document.documentElement.classList.contains("fxAnimOff"));await ctx.close();
   const {p:p2,ctx:c2}=await oldal(b,{w:1440,h:900,tema:"dark",reduce:true,ls:{"fxAnimOff30_0":"0"}});
   const bb=await p2.evaluate(()=>document.documentElement.classList.contains("fxAnimOff"));await c2.close();
   ok(a&&!bb,"„kevesebb mozgás” beállításnál alapból KI — de ha kifejezetten bekapcsoltad, BE",{reduce:a,kifejezetten:bb});}
  {const {p,ctx}=await oldal(b,{w:1440,h:900,tema:"dark",ls:{"fxAnimOff30_0":"1"}});
   const r=await p.evaluate(()=>({off:document.documentElement.classList.contains("fxAnimOff"),live:document.documentElement.classList.contains("fxLive")}));
   ok(r.off&&!r.live,"a KI állás újratöltés után is megmarad (már az első festésnél)",r);await ctx.close();}

  console.log("\n— 3. A KEZDŐLAP JELENETE —");
  {const {p,ctx}=await oldal(b,{w:1440,h:900,tema:"dark"});
   const t1=await p.evaluate(()=>({ball:document.querySelector('#fxHome [data-fx="ball"]').getAttribute("transform"),
     kicker:document.querySelector('#fxHome [data-fx="j0"]').getAttribute("transform"),
     disp:getComputedStyle(document.getElementById("fxHome")).display,n:document.querySelectorAll("#fxHome .fxFig").length,
     kapu:!!document.querySelector("#fxHome .fxPost"),halo:!!document.querySelector("#fxHome .fxNet")}));
   await p.waitForTimeout(900);
   const t2=await p.evaluate(()=>({kicker:document.querySelector('#fxHome [data-fx="j0"]').getAttribute("transform"),raf:!!_fxRaf}));
   ok(t1.disp==="block"&&t1.n>=14&&t1.kapu&&t1.halo,"a Sötét-arany kezdőlapon ott a pálya: kapu hálóval, 14 szereplő",t1);
   ok(t1.kicker!==t2.kicker&&t2.raf,"a jelenet MOZOG (a kocogó egy másodperc alatt odébb ért), a ciklus fut",{a:t1.kicker,b:t2.kicker});
   /* a szabadrúgás koreográfiája: a labda a lövés után a kapu felé száll és emelkedik */
   const fk=await p.evaluate(()=>{fxTick=function(){};const g=document.querySelector('#fxHome [data-fx="ball"]');
     const at=ms=>{fxHomeFrame(_fx,ms);const tr=g.getAttribute("transform").match(/translate\(([-\d.]+),([-\d.]+)\)/);
       return {x:+tr[1],y:+tr[2],cy:+g.querySelector(".fxBall").getAttribute("cy")};};
     return {nyugv:at(800),repul:at(2150),halo:at(3300)};});
   ok(fk.repul.cy<fk.nyugv.cy-20&&fk.repul.x>fk.nyugv.x&&fk.halo.x>fk.repul.x,"szabadrúgás: a labda a lövés után a magasba és a kapu felé száll",fk);
   /* témaváltás (3.9.203 óta minden téma ki van festve): a jelenet él tovább,
      más festékkel; KIKAPCSOLVA viszont a ciklus leáll */
   const r=await p.evaluate(()=>{const fill=()=>getComputedStyle(document.querySelector("#fxHome .fxGrass")).fill;
     const f0=fill();applyTheme("paper");const ki={live:document.documentElement.classList.contains("fxLive"),
     disp:getComputedStyle(document.getElementById("fxHome")).display,mas:fill()!==f0};
     fxSet(false);ki.raf=_fxRaf;ki.disp2=getComputedStyle(document.getElementById("fxHome")).display;fxSet(true);return ki;});
   ok(r.live&&r.disp==="block"&&r.mas&&!r.raf&&r.disp2==="none","témaváltáskor a jelenet él tovább, a téma festékével; kikapcsolva eltűnik, és a ciklus leáll",r);
   await ctx.close();}

  console.log("\n— 4. A HUB MENÜJE MÖGÖTT —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"dark"});
   await p.evaluate(()=>{
     gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
     const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
     showChemistry=()=>{};S.pyr=null;S.idx=0;
     pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
     pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
     renderPyrDivPick();pyrConfirmDiv();
     if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
     slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
     if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
     phase="season";S.seasonNumber=3;S.idx=10;window.saveGame=()=>{};
     document.getElementById("mpEntry").classList.add("hide");
     openHubMidSeason();});
   await p.waitForTimeout(500);
   const r=await p.evaluate(async()=>{const ki={};
     ki.elotte=document.getElementById("fxHub")?getComputedStyle(document.getElementById("fxHub")).display:"nincs";
     hubMenuToggle(true);
     await new Promise(r=>setTimeout(r,700));
     const g=document.querySelector('#fxHub [data-fx="j0"]');
     ki.menu=document.body.classList.contains("inHubMenu");
     ki.disp=getComputedStyle(document.getElementById("fxHub")).display;
     ki.bg=getComputedStyle(document.body).backgroundColor;
     ki.a=g&&g.getAttribute("transform");
     await new Promise(r=>setTimeout(r,800));
     ki.b=g&&g.getAttribute("transform");
     ki.rondo=document.querySelectorAll("#fxHub .fxTop").length;
     hubMenuExit();
     ki.utana=getComputedStyle(document.getElementById("fxHub")).display;
     return ki;});
   ok(r.elotte!=="block"&&r.menu&&r.disp==="block","a ☰ Menü megnyitásakor (és csak akkor) a felülnézetes jelenet látszik",r);
   ok(r.a&&r.b&&r.a!==r.b&&r.rondo>=12,"a menü mögött is MOZOG (rondó, kocogók, passzolók — 12 szereplő)",{a:r.a,b:r.b,n:r.rondo});
   ok(/rgba\(0, 0, 0, 0\)|transparent/.test(r.bg)&&r.utana==="none","menü-módban a lap háttere átlátszó; a menü bezárásakor a jelenet eltűnik",{bg:r.bg,utana:r.utana});
   ok(await p.evaluate(()=>String(APP_VERSION).localeCompare("3.9.202",undefined,{numeric:true})>=0),"verzió legalább 3.9.202");
   await ctx.close();}
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
