/* 🏃 1.0.5.0.00 — A LEKÖVETETT FEJLŐDÉS A RUN-SZINTBEN (legfeljebb +10%).
   KÉRÉS: „Ne az legyen, hogy ha valaki kb teljesen a mezőnnyel halad, az
   ugyanannyi Run szintet kapjon, mint az, aki minden 5 fordulóban akkorát
   fejlődik, hogy rohannia kell utána az ellenfeleknek. Ennek mértéke
   maximum 10%-nyi plusz Run szintet jelenthessen a teljes karrierre nézve
   […] És akkor a 15. fordulós nagy igazításért nem kell külön járjon Run
   szint emelés."
   Amit mér: emelés nélkül nincs többlet; a többlet arányos és 10%-nál
   megáll; a kész Run-hoz adódik (total = előtte + többlet); a boost-adósság
   nem számít; a karrier átlaga számít; a futó idény vetítve, 10. fordulótól;
   a téli emelés sem a plafont, sem a Mezőny-emelés sort nem mozdítja. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9420;
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
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
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
    window.saveGame=()=>{};
    ki.on=pyrFloorOn();
    const H=pyrFloorHist();
    const alap=(sz,emel,ad)=>({g:2,want:2,div:3,lift:0,mid:0,nat:100,done:true,veg:1,rajtSzint:100,cel:3,
      kov:{v:1,rajt:0,dgB:3,tur:0.5,emel:emel.map((a,k)=>({f:5*(k+1),amt:a})),ad:ad||0,adDb:0,g:{}}});
    const set=(arr)=>{Object.keys(H).forEach(k=>delete H[k]);arr.forEach((x,k)=>{H[k+2]=x;});S.seasonNumber=arr.length+2;S.idx=0;};
    const B=()=>{const b=runBreakdown();const row=b.rows.find(x=>x.k==="kovrun");return {total:b.total,plus:b.kovPlus,row,info:nfKovRunInfo()};};
    set([alap(2,[]),alap(3,[])]);ki.nincs=B();
    set([alap(2,[2,1]),alap(3,[1,1])]);ki.kozep=B();        /* 5 Rating / 2 idény → 2,5%/idény */
    set([alap(2,[5,5,5]),alap(3,[5,5,5])]);ki.sok=B();       /* 15%/idény → telítve */
    set([alap(2,[]),alap(3,[],30)]);ki.adossag=B();          /* csak boost-adósság */
    set([alap(2,[10]),alap(3,[])]);ki.atlag=B();             /* 10% + 0% → 5% átlag */
    /* a futó idény: 9. fordulóig nem számít, utána vetítve */
    set([alap(2,[])]);const fut=alap(3,[3]);fut.veg=null;H[3]=fut;S.seasonNumber=3;
    S.idx=9;ki.fut9=nfKovRunInfo();S.idx=15;ki.fut15=nfKovRunInfo();
    /* a téli emelés: a plafon és a Mezőny-emelés sor */
    set([alap(2,[]),alap(3,[])]);
    const c0=(pyrRunCap()||{}).cap,row0=(pyrFloorRunRow()||{}).s;
    H[2].mid=8;H[3].mid=8;
    const c1=(pyrRunCap()||{}).cap,row1=(pyrFloorRunRow()||{}).s;
    ki.tel={c0,c1,row0,row1,info:nfKovRunInfo()};
    return ki;});
  console.log("\n— a többlet —");
  ok(r.on,"padlós piramis-karrier",r.on);
  ok(r.nincs.plus===0&&r.nincs.row&&/\+0 Run-pont/.test(r.nincs.row.d),"a mezőnnyel haladó: nincs többlet (a sor kiírja)",r.nincs.row&&r.nincs.row.d);
  const elotte=x=>x.total-x.plus;
  ok(Math.abs(r.kozep.info.avg-2.5)<0.01&&Math.abs(r.kozep.plus-elotte(r.kozep)*0.1*0.25)<0.01,"2,5%/idény → a Run 2,5%-a (a 10%-os tető negyede)",{avg:r.kozep.info.avg,plus:r.kozep.plus,elotte:elotte(r.kozep)});
  ok(Math.abs(r.sok.plus-Math.min(100-elotte(r.sok),elotte(r.sok)*0.1))<0.01&&r.sok.info.f===1,"15%/idény → telítve: legfeljebb +10%",{plus:r.sok.plus,elotte:elotte(r.sok)});
  ok(Math.abs(r.sok.total-(elotte(r.sok)+r.sok.plus))<0.01,"a kész Run-szinthez adódik",{t:r.sok.total,e:elotte(r.sok),p:r.sok.plus});
  ok(r.adossag.plus===0,"a boost-adósság nem számít (az a boost ára)",r.adossag.plus);
  ok(Math.abs(r.atlag.info.avg-5)<0.01,"a karrier átlaga számít (10% + 0% → 5%)",r.atlag.info.avg);
  ok(r.fut9&&r.fut9.sor.length===1&&!r.fut9.sor[0].fut&&r.fut15&&r.fut15.sor.length===2&&Math.abs(r.fut15.avg-(0+3/100*100*30/15)/2)<0.01,"a futó idény a 10. fordulótól, vetítve (15. forduló: 3 Rating → 6%/idény, a 0%-kal átlagolva 3%)",{f9:r.fut9&&r.fut9.sor.length,f15:r.fut15&&r.fut15.avg});
  console.log("\n— a téli emelés —");
  ok(Math.abs(r.tel.c0-r.tel.c1)<1e-9,"a 15. fordulós emelés nem mozdítja a Run-plafont",r.tel);
  ok(r.tel.row0===r.tel.row1,"és a Mezőny-emelés sort sem",r.tel);
  ok(r.tel.info&&r.tel.info.avg===0,"és nem is többlet",r.tel.info);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
