/* ♾️ 3.9.259 — A NAGY UGRÁS (INFINITY) NEM VISZI LEJJEBB A STÍLUSSZINTET.

   BEJELENTETT HIBA: „Miután feloldódik a nagy ugrás hagyományos módban, a
   csapatstílus szintje visszaesik. […] De ne essen vissza. Semennyit. Sőt,
   nőnie kéne ilyenkor, hiszen egy csomó új mérföldkő elérhető lesz."

   Amit mér (valódi stílus-tábla, valódi stExtendForInfinity), MIND a nyolc
   stílusnál:
     1. a megnyílás ELŐTTI és UTÁNI szint és SXP pontosan egyezik;
     2. a régi képlettel (arány a teljes, kibővített listán) esett volna —
        vagyis a próba tényleg a bejelentett helyzetet méri;
     3. egy teljesített Infinity-lépcső után az SXP nő;
     4. a fejléc kiírja az Infinity-lépcsők hozamát;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9259;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof stExtendForInfinity==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    window.saveGame=()=>{};
    phase="season";S.seasonNumber=6;
    infinityMode=false;
    const KEYS=STYLES.map(x=>x.key);
    const ellenorzes={};
    /* minden stílushoz: a fa felét megvesszük, a mérföldkövek ~60%-át teljesítjük */
    const allapot={};
    KEYS.forEach(k=>{
      const st={key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
      styleTraitList(k).forEach((t,i)=>{if(i%2===0)st.traits[t.key]=(t.lv||[]).length;});
      (STYLE_MILESTONES[k]||[]).forEach((d,i)=>{if(i%5<3)st.ms.done[d.id]=1;});
      allapot[k]=st;});
    const meres=st=>({sxp:styleSxp(st),lvl:styleLevel(st)});
    KEYS.forEach(k=>{ellenorzes[k]={elotte:meres(allapot[k])};});
    /* A NAGY UGRÁS: az Infinity megnyílik, a lépcsők bővülnek */
    infinityMode=true;
    ki.hozzaadva=stExtendForInfinity();
    try{styleLvlCacheClear();}catch(e){}
    KEYS.forEach(k=>{
      const st=allapot[k],L=STYLE_MILESTONES[k]||[];
      const E=ellenorzes[k];
      E.utana=meres(st);
      E.ujLepcso=L.filter(d=>d.infExt).length;
      /* a RÉGI képlet: arány a teljes (kibővített) listán */
      const Z=styleSxpParts(st);
      const osszMax=Z.ms.max+Z.msExt.max,osszGot=Z.ms.got+Z.msExt.got;
      E.regiC=250*Math.min(1,osszGot/Math.max(1,osszMax));
      E.ujC=Z.c;
      /* egy Infinity-lépcső teljesül */
      const x=L.find(d=>d.infExt);
      if(x){st.ms.done[x.id]=1;E.lepcsoUtan=meres(st);}
      if(k==="beton"){S.style=st;S.style2=null;
        E.fejlec=/Infinity-lépcsők/.test(styleHeroHtml(st,styleByKey(k)));}});
    ki.e=ellenorzes;
    S.style=null;infinityMode=false;
    ki.verzio=APP_VERSION;
    return ki;});
  ok(r.hozzaadva>0,"a megnyílás tényleg új lépcsőket fűz a családokhoz",r.hozzaadva);
  for(const k of Object.keys(r.e)){const E=r.e[k];
    if(!E.ujLepcso){console.log(`  · ${k}: nincs bővülő családja`);continue;}
    ok(E.utana.sxp===E.elotte.sxp&&E.utana.lvl===E.elotte.lvl,`${k}: a megnyíláskor a szint és az SXP pontosan a régi`,E);
    ok(E.regiC<E.ujC,`${k}: a régi képlettel esett volna (C ${Math.round(E.regiC)} < ${Math.round(E.ujC)})`);
    ok(E.lepcsoUtan&&E.lepcsoUtan.sxp>E.utana.sxp,`${k}: egy teljesített új lépcső után nő`,{elotte:E.utana.sxp,utana:E.lepcsoUtan&&E.lepcsoUtan.sxp});}
  ok(r.e.beton.fejlec,"a fejléc kiírja az Infinity-lépcsők hozamát");
  ok(String(r.verzio).localeCompare("3.9.259",undefined,{numeric:true})>=0,"verzió legalább 3.9.259",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
