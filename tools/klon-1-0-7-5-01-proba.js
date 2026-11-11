/* 🧍 1.0.7.5.01 — NINCS KLÓN A JELENETEKBEN.
   BEJELENTETT HIBA: „Vannak animációk, amiknél az ellenfél védőiből van
   letéve 3-4 klón." Amit mér: minden jelenet (esemény-típus mindkét oldalról,
   gól-fajta, skill, akció, mind a 28 szinergia-pár) kirajzolva — egyetlen
   jelenetben sem ismétlődik ugyanaz az arc két figurán. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9443;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
let HTMLSRC=null;   /* a 6. lépésben a beépített másolatot szolgáljuk ki */
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/index.html"&&HTMLSRC){rp.setHeader("content-type",TYPES[".html"]);rp.end(HTMLSRC);return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
const karrier=()=>{
  window.mgmtNyit=()=>false;
  gameMode="career";
  enterCareerSetupFromHome(true);
  beginNewGame();
  const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
  showChemistry=()=>{};
  S.pyr=null;S.idx=0;
  pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
  pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
  renderPyrDivPick();pyrConfirmDiv();
  if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
  slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
    const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
  if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
  phase="season";S.seasonClosed=false;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  let p=await ctx.newPage();
  const errs=[];const figyel=pg=>{pg.on("pageerror",e=>errs.push(String(e)));
    pg.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});};
  figyel(p);
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof evaVedoN==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});


  const r=await p.evaluate(karrier=>{
    try{localStorage.clear();}catch(e){}
    (0,eval)("("+karrier+")")();
    const nev=slots.filter(s=>s.player).map(s=>s.player.n);
    const esetek=[];
    const add=(T,ev,cimke)=>{if(EVA_SABLON[T])esetek.push({T,ev,cimke});};
    Object.entries(EVA_TIPUS_SABLON).forEach(([t,T])=>{["us","them"].forEach(side=>add(T,{t,side,p:side==="us"?nev[9]:"Ellenfél Elek",min:30,seq:1},t+"/"+side));});
    Object.entries(EVA_ALT_SABLON||{}).forEach(([alt,T])=>add(T,{t:"gol",side:"us",p:nev[9],alt,min:40,seq:2},"alt:"+alt));
    Object.entries(EVA_SKILL_SABLON).forEach(([sk,T])=>{
      if(T==="skSzin"){Object.keys(SZIN_DEFS).forEach(par=>add(T,{t:"gol",side:"us",p:nev[9],skill:"szin",skillN:3,min:50,seq:3,akc:{k:"szin",par,crew:nev.slice(3,8),sc:nev[9]}},"szin:"+par));return;}
      const akc=/^akc_/.test(sk)?{k:sk.slice(4),crew:nev.slice(2,9),sc:nev[9],mp:90}:null;
      add(T,{t:"gol",side:"us",p:nev[9],skill:sk,skillN:9,min:50,seq:3,...(akc?{akc}:{})},"skill:"+sk);});
    const klon=[],hibas=[];let jelenet=0;
    esetek.forEach(e=>{
      let svg="";try{const c=evaKontextus(e.ev);svg=EVA_SABLON[e.T].svg(c);}catch(x){hibas.push(e.cimke+": "+x.message);return;}
      jelenet++;
      const hrefs=[...svg.matchAll(/<image href="([^"]+)"/g)].map(m=>m[1]);
      const db={};hrefs.forEach(h=>{db[h]=(db[h]||0)+1;});
      const max=Math.max(0,...Object.values(db));
      if(max>1){const ids=[...svg.matchAll(/<g id="([^"]+)" data-mely="1"[\s\S]*?<image href="([^"]+)"/g)].map(m=>[m[1],m[2]]);const dup=Object.keys(db).filter(h=>db[h]>1);klon.push({T:e.T,eset:e.cimke,max,fig:hrefs.length,kik:ids.filter(x=>dup.includes(x[1])).map(x=>x[0])});}});
    return {jelenet,klon,hibas:hibas.slice(0,5)};},String(karrier));
  console.log("— a jelenetek arcai —");
  const sablonok=[...new Set(r.klon.map(x=>x.T))];
  ok(r.jelenet>60,`${r.jelenet} jelenet kirajzolva (minden típus, gól-fajta, skill, akció és mind a 28 szinergia-pár)`,r.hibas);
  ok(!r.klon.length,"egyik jelenetben sincs klón: minden figura más arcot kap",{sablonok,elso:r.klon.slice(0,6)});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
