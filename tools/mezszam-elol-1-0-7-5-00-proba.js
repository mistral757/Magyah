/* 🔢 1.0.7.5.00 — A MEZSZÁM A MEZ ELEJÉN (választható hellyel).
   Amit mér: alapból nincs; bekapcsolva a saját játékoson a választott helyen;
   ütközésnél a jel átköltözik; az ellenfélen nincs; hátulról nem duplázódik;
   az arculat gombjai; a mentés; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9441;
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
  await p.waitForFunction(()=>typeof mezSzamElol==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});


  const r=await p.evaluate(karrier=>{
    try{localStorage.clear();}catch(e){}
    (0,eval)("("+karrier+")")();
    const o={};
    const sajat=slots.find(s=>s.player).player,n=sajat.n;if(!numOf(n))numSet(n,17);o.num=numOf(n);
    const kit=Object.assign({},identKitOrDefault("home"),{jel:"★",jelHely:"mellb"});
    const fig=(jp,tam)=>evaFigura("pf",evaFig(jp,kit,.5,tam),kit,60,90,1);
    identState().animHatul=false;
    mezSzamElolSet(null);o.ki=fig({n},false);
    mezSzamElolSet("mellk");o.be=fig({n},false);
    o.ellenfel=fig({n:"Nem Létező Ellenfél"},false);
    mezSzamElolSet("mellb");o.utk=fig({n},false);
    identState().animHatul=true;mezSzamElolSet("has");o.hatul=fig({n},true);identState().animHatul=false;
    /* az arculat felülete */
    mezSzamElolSet(null);
    try{identOpenPanel();}catch(e){o.nyitHiba=String(e);}
    const box=document.getElementById("identNumElol");
    o.gombok=box?[...box.querySelectorAll("[data-numelol]")].map(b=>b.getAttribute("data-numelol")):null;
    if(box){box.querySelector('[data-numelol="has"]').click();}
    o.gombUtan=mezSzamElol();
    /* a mentés */
    o.mentve=null;try{saveGameNow();const d=loadSavedGame(saveKey());o.mentve=d&&d.S&&d.S.ident&&d.S.ident.numElol;}catch(e){o.mentesHiba=String(e);}
    mezSzamElolSet("rossz-hely");o.rossz=mezSzamElol();
    return o;},String(karrier));
  const van=(svg,k)=>new RegExp(`data-evaszamelol="${k}"`).test(svg);
  console.log("— a mezszám a mez elején —");
  ok(!/data-evaszamelol/.test(r.ki),"kikapcsolva (alap) nincs szám a mez elején");
  ok(van(r.be,"mellk")&&new RegExp(`>${r.num}</text>`).test(r.be),"bekapcsolva a saját játékoson a mell közepén a mezszáma",r.num);
  ok(/data-evajel="mellb"/.test(r.be),"a jel a helyén marad, ha nem ütközik");
  ok(!/data-evaszamelol/.test(r.ellenfel),"az ellenfélen nincs szám elöl");
  ok(van(r.utk,"mellb")&&/data-evajel="mellj"/.test(r.utk),"ugyanarra a helyre: a szám a bal mellen, a jel a jobbra költözik");
  ok(!/data-evaszamelol/.test(r.hatul)&&/data-evaszam="1"/.test(r.hatul),"hátulról a háton a szám, elöl nem duplázódik");
  ok(Array.isArray(r.gombok)&&r.gombok.length===8&&r.gombok[0]===""&&r.gombUtan==="has","az arculatban: „Nem” + hét hely; a gomb beállítja",{g:r.gombok,u:r.gombUtan});
  ok(r.mentve==="has","a mentés megtartja",r);
  ok(r.rossz===null,"ismeretlen hely: kikapcsol",r.rossz);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
