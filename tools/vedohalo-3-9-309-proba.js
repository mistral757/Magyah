/* 🛟 3.9.309 — A LEFÚJÁS UTÁNI LÁNC NEM ÁLLHAT MEG NÉMÁN.

   BEJELENTÉS: „a nyári kupában negyeddöntő második meccse után elakadt a
   guest. Nem engedi őt tovább. Nem ad be neki várakozó képernyőt, semmit."

   Három hely, ahol a folytatás nyom nélkül elveszhetett — mindhármat hibát
   erőltetve mérjük:
     1. a mérleg-ablak (mstatShow): ha a rajzolása hibára fut, az ablak eddig
        rejtve maradt, a lánc pedig csak a bezárásával megy tovább → most
        kinyílik, és a „Tovább" viszi a láncot;
     2. a „meccsről meccsre" ág (euroHoldStart): a kupa léptetése eddig
        védőháló nélkül futott → hibánál most is a kupa-nézet jön elő;
     3. a kör lezárása (mpCupTieSync): ha már futott, az újabb hívás eddig
        némán visszatért → most a várakozó réteg (kiúttal) újra előjön;
     4. nincs oldalhiba (a szándékosan dobott hibákon kívül). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9309;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",".woff2":"font/woff2",".png":"image/png"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];
  p.on("pageerror",e=>{if(!/SZANDÉKOS/.test(String(e)))errs.push(String(e));});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);

  const r1=await p.evaluate(()=>{
    S.lastMatch=S.lastMatch||{gf:1,ga:0,players:[]};
    const regi=mstatRender;mstatRender=()=>{throw new Error("SZANDÉKOS — rajzolási hiba");};
    let hivott=0;
    try{mstatShow(()=>{hivott++;},"stats");}catch(e){return {dobott:String(e)};}
    mstatRender=regi;
    const lat=!$("mstatModal").classList.contains("hide");
    const tx=$("mstatBody").innerText;
    $("mstatOk").click();
    return {lat,tx,hivott,zarva:$("mstatModal").classList.contains("hide")};});
  ok(r1.lat&&/Tovább/.test(r1.tx||""),"a mérleg-ablak rajzolási hibánál is kinyílik",r1);
  ok(r1.hivott===1&&r1.zarva,"…és a bezárása továbbviszi a láncot",r1);

  const r2=await p.evaluate(()=>{
    const regiImm=immOn,regiE=euroAfterUserMatch,regiS=showEuroScreen;
    let mutat=0;
    immOn=()=>true;euroAfterUserMatch=()=>{throw new Error("SZANDÉKOS — léptetési hiba");};
    showEuroScreen=()=>{mutat++;};
    let dobott=null;try{euroHoldStart();}catch(e){dobott=String(e);}
    immOn=regiImm;euroAfterUserMatch=regiE;showEuroScreen=regiS;
    return {dobott,mutat};});
  ok(!r2.dobott&&r2.mutat===1,"„meccsről meccsre”: a léptetési hiba nem akasztja meg — a kupa-nézet előjön",r2);

  const r3=await p.evaluate(async()=>{
    gameMode="career";MP.active=true;MP.role="guest";MP.activeRoom="VH";
    S.seasonNumber=2;S.mpCup={season:2,comp:"NYK"};
    S.euro={comp:"NYK",stage:"qf",idx:2,mateIdx:5,mateOut:null,userIdx:0,userTie:0,
      ties:[{a:0,b:1,legs:[[1,0],[1,0]],winner:0},{a:5,b:6,legs:[[0,0],[0,0]],winner:5}],teams:[]};
    _mpTieBusy=true;_mpTiePoll=setTimeout(()=>{},60000);
    h2hWaitHide();
    let dobott=null;try{await mpCupTieSync("qf",()=>{});}catch(e){dobott=String(e);}
    const w=$("h2hWait"),lat=!!(w&&!w.classList.contains("hide"));
    mpCupTieAbort();
    return {dobott,lat};});
  ok(!r3.dobott&&r3.lat,"a már futó kör-lezárás újabb hívása a várakozó réteget mutatja (nem néma)",r3);

  ok(errs.length===0,"nincs (nem szándékos) oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
