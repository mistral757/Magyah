/* Play-listához és a manifest `screenshots` mezőjéhez: valódi képernyőképek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8899, OUT=path.join(ROOT,"icons","screenshots");
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  // 1080×1920 a Play telefonos ajánlása; DPR 2-vel 540×960 CSS-ben
  const ctx=await b.newContext({viewport:{width:540,height:960},deviceScaleFactor:2});
  const p=await ctx.newPage();
  const varj=ms=>p.waitForTimeout(ms);
  /* A tanító buborékok jó dolgok a játékban, de egy áruházi képen csak
     takarnak — a kép előtt mindet elléptetjük. */
  const tisztit=async()=>{
    for(let i=0;i<6;i++){
      const volt=await p.evaluate(()=>{
        let n=0;
        for(const id of ["guideTipOk","tNudgeWhyX"]){
          const b=document.getElementById(id);
          if(b&&b.offsetParent&&!b.disabled){b.click();n++;}}
        for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){
          const e=document.getElementById(id);
          if(e&&!e.classList.contains("hide")){e.classList.add("hide");n++;}}
        return n;});
      if(!volt)break;
      await p.waitForTimeout(250);}
    await p.waitForTimeout(350);};
  const lo=async(nev)=>{await tisztit();
    const f=path.join(OUT,nev+".png");await p.screenshot({path:f});
    console.log("  "+nev+".png");};

  await p.goto(`http://127.0.0.1:${PORT}/`,{waitUntil:"load"});
  await varj(1600);
  await lo("01-cimlap");

  await p.evaluate(()=>{const b=[...document.querySelectorAll("button")]
    .find(e=>e.offsetParent&&/Egyedül játszom/.test(e.innerText));if(b)b.click();});
  await varj(500);
  await p.click("#modeCareerDynBtn").catch(()=>{});
  await varj(700);
  await lo("02-beallitas");

  for(let k=0;k<20;k++){
    const cs=await p.$('button[data-cs="club"]');
    if(cs&&await cs.isVisible()){await cs.click().catch(()=>{});await varj(250);}
    let ment=false;
    for(const s of ["#setupNextBtn","#startBtn"]){
      const e=await p.$(s);
      if(e&&await e.isVisible()){await e.click().catch(()=>{});await varj(300);ment=true;break;}}
    if(!ment)break;}
  await varj(600);

  for(let k=0;k<14;k++){
    if(await p.evaluate(()=>typeof phase!=="undefined"&&phase!=="draft"))break;
    await p.evaluate(()=>{
      const bs=[...document.querySelectorAll("button")].filter(e=>e.offsetParent&&!e.disabled);
      const t=e=>(e.innerText||"").trim();
      const pick=bs.find(e=>/^Ezzel a klubbal indulok/.test(t(e)))
        ||bs.find(e=>/^Sorsolás|^Irány a|^Irány az/.test(t(e)))
        ||bs.find(e=>/\(\d{4}\/\d{2}\)/.test(t(e)));
      if(pick)pick.click();});
    await varj(1000);}
  await varj(800);
  await lo("03-keret");

  for(let k=0;k<40;k++){
    if(await p.evaluate(()=>typeof phase!=="undefined"&&phase==="season"))break;
    await p.evaluate(()=>{
      const bs=[...document.querySelectorAll("button")].filter(e=>e.offsetParent&&!e.disabled);
      if(bs.length)bs[bs.length-1].click();});
    await varj(700);}
  await varj(1000);
  await lo("04-szezon");
  await b.close(); srv.close();
})();
