/* ⚔ Négy párharc-nap a saját bajnokságban — minden szünet után egy (3.9.338).

   KIMONDOTT KÉRÉS: „ebben a módban jót tenne, ha több ponton lenne
   lehetőség lekövetni, mennyire vagy lemaradva PvP ellenfeledtől. Minden
   szünet után lenne egy meccs: párharcnapból így összesen 4 lenne, nem 2."

   Amit mér: a régi renddel futó idény változatlan; az első kezdőrúgás
   rögzíti a négy napot; a 8., 15., 23., 30. forduló után; saját kulcsok;
   felváltott hazai; felirat; csak a IV. zár; a mérleg; a párharc-lap. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9484;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof svPhRend==="function"&&typeof svPhRendRogzit==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a négy párharc-nap függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}



  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    window.mpSv=()=>true;mpSv=()=>true;
    S.seasonNumber=2;S.idx=0;S.seasonClosed=false;S.svPh=null;
    try{euroActive=()=>false;}catch(e){}
    /* 1. régi idény (nincs rögzített menetrend): a régi két nap, a régi kulcsokkal */
    S.idx=15;ki.regi15={n:svPhEsedekes(),key:h2hKey()};
    S.idx=30;ki.regi30={n:svPhEsedekes(),utolso:svPhUtolso(svPhEsedekes())};
    S.idx=8;ki.regi8=svPhEsedekes();
    /* 2. az idény első kezdőrúgása rögzíti az új rendet */
    S.idx=0;svPhRendRogzit();
    ki.rend=svPhRend(2);
    S.idx=5;S.svPh.r[3]=null;svPhRendRogzit();ki.kozben=!!(S.svPh.r[3]);   /* menet közben nem rögzít */
    /* 3. a négy nap: időpont, kulcs, hazai, felirat */
    const nap=i=>{S.idx=i;const n=svPhEsedekes();
      return {n,key:n?h2hKey():null,hostHazai:n?h2hHostIsSimHome():null,cimke:n?kickBtnLabel():null,utolso:svPhUtolso(n)};};
    ki.n7=nap(7).n;ki.n8=nap(8);ki.n9=nap(9).n;ki.n15=nap(15);ki.n23=nap(23);ki.n30=nap(30);
    /* 4. a lejátszott nap nem jön újra; a mérleg könyvel */
    try{fanWeeklyIncome=()=>0;}catch(e){}
    S.idx=8;svPhRogzit(2,1,"Társ FC");ki.m8=S.svPh.m["2:q1"];ki.ujra8=svPhEsedekes();
    ki.merleg=Object.assign({},S.svPh.merleg);
    S.idx=30;svPhRogzit(0,0,"Társ FC");ki.ujra30=svPhEsedekes();
    /* 5. a párharc-lap mind a négy napot mutatja */
    let lap="";try{lap=svParharcLapHtml();}catch(e){lap="hiba:"+e;}
    ki.lap=/I: <b>2–1<\/b>/.test(lap)&&/II: —/.test(lap)&&/III: —/.test(lap)&&/IV: <b>0–0<\/b>/.test(lap);
    return ki;});
  ok(t.regi15.n===1&&t.regi15.key==="s2svd1"&&t.regi30.n===2&&t.regi30.utolso&&t.regi8===0,
    "a már régi renddel futó idény a régi két nappal és a régi kulcsokkal megy végig",t);
  ok(JSON.stringify(t.rend)==="[8,15,23,30]"&&!t.kozben,"az idény első kezdőrúgása rögzíti a négy napot (menet közben nem)",t.rend);
  ok(t.n7===0&&t.n9===0&&t.n8.n===1&&t.n15.n===2&&t.n23.n===3&&t.n30.n===4,"minden szünet után egy nap: a 8., 15., 23. és 30. forduló után",{n8:t.n8,n15:t.n15,n23:t.n23,n30:t.n30});
  ok(t.n8.key==="s2svq1"&&t.n15.key==="s2svq2"&&t.n23.key==="s2svq3"&&t.n30.key==="s2svq4","az új rend saját szoba-kulcsai (svq1–4)");
  ok(t.n8.hostHazai===true&&t.n15.hostHazai===false&&t.n23.hostHazai===true&&t.n30.hostHazai===false,"hazai: I., III. a házigazda, II., IV. a vendég");
  ok(/PÁRHARC-NAP I\b|párharc-nap I\b/i.test(t.n8.cimke)&&/III/.test(t.n23.cimke)&&/IV/.test(t.n30.cimke),"a gomb kiírja a nap sorszámát",[t.n8.cimke,t.n23.cimke,t.n30.cimke]);
  ok(t.n30.utolso&&!t.n23.utolso,"csak a IV. zárja az idényt");
  ok(t.m8&&t.m8.gf===2&&t.ujra8===0&&t.merleg.w===1&&t.merleg.p===3&&t.ujra30===0,"a lejátszott nap nem jön újra, a mérleg könyvel",t.merleg);
  ok(t.lap,"a párharc-lap mind a négy napot mutatja");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
