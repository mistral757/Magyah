/* 🏟 A kezdő osztály választója a gyors indításon, közös karrierben (3.9.342).

   KIMONDOTT KÉRÉS: „PvP indítás után ezen a képernyőn kellene, hogy legyen
   egy legördülő menü, amivel ki tudom választani, melyik divízióban akarom
   majd kezdeni a game-et."

   Amit mér: csak közös karrierben, piramisban; D1–D6; a választás a szoba
   mezőjébe kerül; a csomag viszi; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9487;
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
  try{await p.waitForFunction(()=>typeof qkMpDivHtml==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a kezdő osztály választója létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}


  const t=await p.evaluate(async()=>{
    const ki={};
    /* egyjátékosban nincs (ott a draft végén jön az osztályválasztó) */
    MP.active=false;pyrWanted=true;
    ki.sp=qkMpDivHtml()==="";
    /* közös karrier, a házigazda a gyors indításon */
    MP.active=true;MP.started=false;gameMode="career";careerStart="draft";pyrWanted=true;
    pyrModeGridInSetup=true;enterCareerSetup();quickShow();
    _qkLap=2;quickRender();
    const sel=document.querySelector("#qkEgyeb select[data-qkdiv]");
    ki.van=!!sel;ki.db=sel?sel.options.length:0;ki.alap=sel?sel.value:null;
    const gap0=pyrWantedGap;
    sel.value="2";sel.dispatchEvent(new Event("change"));
    ki.div=pyrWantedDiv;ki.csuszka=$("pyrMpDiv")&&$("pyrMpDiv").value;
    ki.ujra=document.querySelector("#qkEgyeb select[data-qkdiv]").value;
    ki.gap={elotte:gap0,utana:pyrWantedGap};
    /* a szobába kerülő csomag ezt viszi */
    let pk=null;try{pk=mpCollectSettings();}catch(e){pk=null;}
    ki.pack=pk&&pk.pyr?pk.pyr.div:"nincs-fv";
    /* dinamikus módban nincs */
    pyrWanted=false;ki.dyn=qkMpDivHtml()==="";pyrWanted=true;
    MP.active=false;
    return ki;});
  ok(t.sp&&t.dyn,"egyjátékosban és dinamikus módban nincs (ott az osztályválasztó dönt)",{sp:t.sp,dyn:t.dyn});
  ok(t.van&&t.db===6,"közös karrierben az Egyéb lapon ott a kezdő osztály választója (D1–D6)",{van:t.van,db:t.db,alap:t.alap});
  ok(t.div===2&&t.csuszka==="2"&&t.ujra==="2","a választás a szoba mezőjébe kerül (a részletes beállító csúszkája is követi)",t);
  ok(t.pack===2,"a szobába küldött csomag a választott osztályt viszi",t.pack);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
