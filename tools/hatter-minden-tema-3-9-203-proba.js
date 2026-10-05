/* ✨ 3.9.203 — AZ ÉLŐ HÁTTÉR MIND A NÉGY TÉMÁBAN + A BEJELENTETT HIBÁK.

   BEJELENTÉS (képernyőképpel: 2000×1125-ös ablak, fekvő HUB, a bal menüsáv a
   HUB közepén): „Az új témánkban a PC-s és telefonos fekvő menüben rácsúszott
   az oldalsó sáv a HUB-ra. […] Egy két ikon bizonyos nézetben hajlamos
   rácsúszni más dologra, amire nem kéne […] a jobb oldali cicázós
   passzolgatós csapatban mindig két ember között megy a labda, a többiek nem
   szállnak be a passzolgatásba. […] Mehet minden témában ugyanez!"

   Amit mér:
     1. MIND A NÉGY TÉMA: a kezdőlapon él a jelenet, mindegyik a saját
        festékével (más gyep, más mez); a Pixelben lépcsős (2 px-es rács),
        a „Szaggatott mozgás" kikapcsolásával sima;
     2. A RONDÓ: 40 passzból mind az öt játékos kap labdát; a passzok
        többsége átível a körön, és senki nem passzol vissza annak, akitől
        kapta;
     3. A FEKVŐ HUB: 1920×1080-on a bal menüsáv a képernyő bal szélén áll, a
        fejléc alatt — a tartalmazó kártyákon nincs backdrop-filter;
     4. AZ IKONOK: hosszú becenévvel sem csúszik egymásra a profil, a
        témagombok, a ✨ és a felső felirat (320, 360, 568×320);
     5. A KAPCSOLÓ saját osztályon (nem .pixOpt). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9246;
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

  console.log("\n— 1. MIND A NÉGY TÉMA —");
  const festek={};
  for(const tema of ["dark","paper","noir","pixel"]){
    const {p,ctx}=await oldal(b,{w:1440,h:900,tema});
    festek[tema]=await p.evaluate(async()=>{
      const g=document.querySelector("#fxHome .fxGrass"),k=document.querySelector('#fxHome [data-fx="kick"] .fxKit');
      await new Promise(r=>setTimeout(r,450));
      const tr=[...document.querySelectorAll('#fxHome [data-fx]')].map(x=>x.getAttribute("transform")||"");
      const szamok=tr.join(" ").match(/-?\d+(\.\d+)?/g).map(Number);
      return {live:document.documentElement.classList.contains("fxLive"),disp:getComputedStyle(document.getElementById("fxHome")).display,
        gyep:getComputedStyle(g).fill,mez:getComputedStyle(k).fill,racs:szamok.every(v=>Number.isInteger(v)&&v%2===0)};});
    if(tema==="pixel"){
      festek.pixelSima=await p.evaluate(async()=>{pixOptSet("pixMoveOff",false);await new Promise(r=>setTimeout(r,450));
        const tr=[...document.querySelectorAll('#fxHome [data-fx]')].map(x=>x.getAttribute("transform")||"").join(" ");
        return /\d\.\d/.test(tr);});}
    await ctx.close();}
  const T=["dark","paper","noir","pixel"];
  ok(T.every(t=>festek[t].live&&festek[t].disp==="block"),"mind a négy témában él a kezdőlap jelenete",T.map(t=>festek[t].disp));
  ok(new Set(T.map(t=>festek[t].gyep)).size===4&&new Set(T.map(t=>festek[t].mez)).size===4,"mindegyik a saját festékével: négy különböző gyep és mez",T.map(t=>[festek[t].gyep,festek[t].mez]));
  ok(festek.pixel.racs&&!festek.dark.racs,"a Pixelben a szereplők 2 px-es rácsra ugranak (lépcsős mozgás), a Sötétben nem");
  ok(festek.pixelSima===true,"a Pixel „Szaggatott mozgás” kapcsolóját kikapcsolva sima a mozgás",festek.pixelSima);

  console.log("\n— 2. A RONDÓ —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"dark"});
   const r=await p.evaluate(()=>{fxTick=function(){};const F=fxBuildHub();F.lay={C:[300,420],co:[420,540],jog:[[90,140],[510,140],[510,300],[90,300]],q0:[150,700],q1:[440,800]};
     const pos=g=>{const m=g.getAttribute("transform").match(/translate\(([-\d.]+),([-\d.]+)\)/);return [+m[1],+m[2]];};
     const kapta=[],szomszed=[];let elozo=null;
     for(let k=0;k<40;k++){fxHubFrame(F,(k*0.9+0.001)*1000);
       const bp=pos(F.el.rball);let best=-1,bd=1e9;
       for(let i=0;i<5;i++){const q=pos(F.el["r"+i]);const d=Math.hypot(q[0]-bp[0],q[1]-bp[1]);if(d<bd){bd=d;best=i;}}
       kapta.push(best);if(elozo!=null)szomszed.push(Math.min((best-elozo+5)%5,(elozo-best+5)%5)===1);elozo=best;}
     let vissza=0;for(let i=2;i<kapta.length;i++)if(kapta[i]===kapta[i-2])vissza++;
     const nem2=new Set();for(let i=1;i<kapta.length;i++)nem2.add(kapta[i-1]+">"+kapta[i]);
     return {mintak:nem2.size,kapta,kulonbozo:new Set(kapta).size,szomszed:szomszed.filter(Boolean).length,vissza};});
   ok(r.kulonbozo===5,"40 passzból mind az öt játékos kap labdát (eddig csak kettő)",{kapta:r.kapta.join("")});
   ok(r.szomszed<=12,"a passzok kevesebb mint harmada megy a szomszédnak — a többség átível a körön",r.szomszed);
   ok(r.vissza===0,"senki nem passzol vissza annak, akitől épp kapta",r.vissza);
   ok(r.mintak>=10,"a sor változatos: legalább tíz különböző passz-irány (nem egy kötött kör)",r.mintak);
   await ctx.close();}

  console.log("\n— 3. A FEKVŐ HUB —");
  {const {p,ctx}=await oldal(b,{w:1920,h:1080,tema:"dark"});
   const r=await p.evaluate(async()=>{
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
     openHubMidSeason();
     HUBLAND_BLOCKERS.forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
     applyHubLand();
     await new Promise(r=>setTimeout(r,1800));
     const a=document.getElementById("hubActions").getBoundingClientRect();
     const kart=[...document.querySelectorAll("#scHub>.card,body>section.card")].filter(e=>e.getBoundingClientRect().width>0);
     return {land:document.body.classList.contains("hubLand"),fxHubOn:document.body.classList.contains("fxHubOn"),
       disp:getComputedStyle(document.getElementById("fxHub")).display,bal:Math.round(a.left),fent:Math.round(a.top),
       szuro:kart.map(e=>getComputedStyle(e).backdropFilter).filter(v=>v&&v!=="none")};});
   ok(r.land&&r.fxHubOn&&r.disp==="block","fekvő HUB-ban a jelenet a HUB háttere",r);
   ok(r.bal===0&&r.fent>0&&r.fent<200,"a bal menüsáv a képernyő bal szélén áll, a fejléc alatt (nem csúszik a HUB-ra)",{bal:r.bal,fent:r.fent});
   ok(r.szuro.length===0,"a tartalmazó kártyákon nincs backdrop-filter",r.szuro);
   await ctx.close();}

  console.log("\n— 4. AZ IKONOK —");
  {const utk={};
   for(const [w,h] of [[320,640],[360,740],[375,812],[568,320]])for(const tema of ["dark","pixel"]){
     const {p,ctx}=await oldal(b,{w,h,tema});await p.waitForTimeout(1900);
     utk[tema+"-"+w]=await p.evaluate(()=>{
       document.getElementById("mpProfileNick").textContent="sétagalopp";document.getElementById("mpProfileId").textContent="#wu7v · 🥉7";
       const R=s=>{const r=document.querySelector(s).getBoundingClientRect();return {s,l:r.left,r:r.right,t:r.top,b:r.bottom};};
       const el=["#heTheme","#heFxBtn","#mpProfileBtn",".heEyebrow span"].map(R),out=[];
       for(let i=0;i<el.length;i++)for(let j=i+1;j<el.length;j++){const a=el[i],c=el[j];
         if(!(a.r<=c.l+0.5||c.r<=a.l+0.5||a.b<=c.t+0.5||c.b<=a.t+0.5))out.push(a.s+"×"+c.s);}
       return out;});
     await ctx.close();}
   ok(Object.values(utk).every(x=>!x.length),"hosszú becenévvel sem csúszik egymásra a profil, a témagombok, a ✨ és a felirat",utk);}

  console.log("\n— 5. A KAPCSOLÓ —");
  {const {p,ctx}=await oldal(b,{w:430,h:900,tema:"dark"});
   const r=await p.evaluate(()=>{renderThemeModal();return {fx:document.querySelectorAll("#themeModal .fxOpt,.fxOpt").length,pix:document.querySelectorAll(".pixOpt").length,
     v:APP_VERSION};});
   ok(r.fx>=1&&r.pix===0,"a ✨ kapcsoló saját osztályon (.fxOpt), a Pixel finomhangolói nem jelennek meg más témában",r);
   ok(String(r.v).localeCompare("3.9.203",undefined,{numeric:true})>=0,"verzió legalább 3.9.203",r.v);
   await ctx.close();}
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
