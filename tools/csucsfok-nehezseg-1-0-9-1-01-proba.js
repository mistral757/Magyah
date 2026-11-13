/* 👑 1.0.9.1.01 — A CSÚCSFOK A NEHÉZSÉGGEL HAMARABB NYÍLIK.
   KÉRÉS: „A csúcsfok képességet hozzuk hamarabbra: lvl 5.1 nehézségig
   maradjon a 20, aztán fokozatosan a 10.5-re jusson el lvl 12-ig."
   Amit mér:
     1. a küszöb-tábla: 5.1-ig 20 · 5.2-től egyenletesen (monoton) le · 10.5 → 12;
        a 10. fokozat extra szintjein is 12;
     2. a kapu: 8.1-en (15,86) a 15,8-as szint még zárva, a 15,9-es nyitva;
        4.x-en és 5.1-en a 20. szint kell;
     3. a valódi kijelölés (styleMasterPick / a kapu szövege) ugyanezt követi;
     4. a menü kiírja a nehézségfüggő küszöböt; a megnyílásról egyszer szól hír;
     5. a 3. stílus küszöbe (styleXNeed) nem változott;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9413;
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
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof stylePeakNeedFor==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
    const o={};
    /* 1. a tábla */
    o.tabla={};
    for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++)o.tabla[nf+"."+s]=stylePeakNeedFor(nf,s);
    o.extra=[stylePeakNeedFor(10,7),stylePeakNeedFor(10,9)];
    o.x=[styleXNeedFor(5,5),styleXNeedFor(6,1),styleXNeedFor(10,5)];
    /* karrier */
    unlockGatesOn=()=>false;pendingWorldSeed="CSUCS";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    window.saveGame=()=>{};phase="season";
    const sorok=[];addLine=t=>{sorok.push(String(t).replace(/<[^>]+>/g,""));};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=null;S.styleExtra=[];S.styleView=1;
    /* a nehézség és a szint kézben */
    let NF={nf:4,s:1},EFF=15.8,LV=15;
    styleXNfMost=()=>({nf:NF.nf,s:NF.s});
    styleEffLevel=()=>EFF;
    const _sl=styleLevel;styleLevel=st=>(st&&st.key==="beton")?LV:_sl(st);
    try{styleLvlCacheClear();}catch(e){}
    const st=S.style;
    o.k4=styleMasterOk(st);
    NF={nf:5,s:1};o.k51=styleMasterOk(st);
    NF={nf:8,s:1};o.need81=stylePeakNeed();
    EFF=15.8;o.k81a=styleMasterOk(st);
    EFF=15.9;o.k81b=styleMasterOk(st);
    NF={nf:10,s:5};EFF=12.0;LV=12;o.k105=styleMasterOk(st);EFF=11.99;LV=11;o.k105zar=styleMasterOk(st);
    /* 3. a kapu szövege és a kijelölés */
    NF={nf:8,s:1};EFF=15.5;LV=15;
    const t=styleTraitList("beton").find(x=>x.peak);
    o.okZar=styleMasterCanPick(st,t);
    EFF=16.2;LV=16;
    o.okNyit=styleMasterCanPick(st,t);
    /* 4. a menü és a hír */
    EFF=15.5;LV=15;
    const h1=styleTraitsHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    o.menuZar=(h1.match(/Csúcsfok[^.]*\.[^.]*\.[^.]*\.[^.]*\./)||[""])[0];
    EFF=16.2;LV=16;
    const h2=styleTraitsHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    o.menuNyit=/Megnyílt/.test(h2);
    st.lvlSeen=16;st.peakJel=0;
    styleLvlAnnounceIn(st);styleLvlAnnounceIn(st);
    o.hir=sorok.filter(x=>/megnyílt a csúcsfok/.test(x));
    return o;});
  const T=r.tabla;
  ok([1,2,3,4].every(nf=>[1,2,3,4,5].every(s=>T[nf+"."+s]===20))&&T["5.1"]===20,"1. 5.1-ig a 20. szint",{"4.5":T["4.5"],"5.1":T["5.1"]});
  const sor=Object.keys(T).filter(k=>+k.split(".")[0]>=5).map(k=>T[k]);
  ok(sor.every((v,i)=>i===0||v<sor[i-1])&&T["5.2"]<20,"1. 5.2-től fokozatosan (szigorúan csökkenő) lejjebb",sor);
  ok(T["10.5"]===12&&r.extra.every(v=>v===12),"1. a 10.5-ön (és a 10. fokozat extra szintjein) a 12.",{t:T["10.5"],extra:r.extra});
  ok(Math.abs(T["8.1"]-15.86)<0.01,"1. 8.1 → 15,86",T["8.1"]);
  ok(r.k4===false&&r.k51===false,"2. 4.1-en és 5.1-en a 15,8-as szint még nem elég (20 kell)",{k4:r.k4,k51:r.k51});
  ok(r.k81a===false&&r.k81b===true,"2. 8.1-en (15,86): 15,8 zárva, 15,9 nyitva",{need:r.need81,a:r.k81a,b:r.k81b});
  ok(r.k105===true&&r.k105zar===false,"2. 10.5-ön a 12. szint nyit, a 11,99 nem",{a:r.k105,b:r.k105zar});
  ok(/16\. szint|15\. szint 86%/.test(r.okZar)&&r.okNyit==="","3. a kijelölés kapuja: zárva a küszöb szövegével, nyitva üres",{zar:r.okZar,nyit:r.okNyit});
  ok(/8\.1 nehézségen/.test(r.menuZar)&&/15\. szint 86%-ának elérésekor/.test(r.menuZar),"4. a menü a nehézségfüggő küszöböt írja",r.menuZar);
  ok(r.menuNyit,"4. elérve: „Megnyílt”");
  ok(r.hir.length===1,"4. a megnyílásról egyszer szól hír",r.hir);
  ok(r.x[0]===20&&r.x[1]===19.8&&r.x[2]===15,"5. a 3. stílus küszöbe változatlan (5.5 → 20 · 6.1 → 19,8 · 10.5 → 15)",r.x);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
