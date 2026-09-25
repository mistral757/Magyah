/* 🎫 A HAZAI KUPA → KÖVETKEZŐ SOROZAT LÁNC SZÖVEGEI (3.9.147).

   BEJELENTETT HIBA: „fából készült serleget megnyertem. Kiírta, hogy ez még
   nem vége, mert a magor kupájának megnyerésével neveztem a konföranszié
   lígbe. Aztán indult a kupák kupájának kupája... Szóval itt zavar van."

   AZ OK: a lánc maga helyes volt (D1/D2: FA → BL-selejtező), de az ünneplő
   képernyő megjegyzése és gombja, a kupaképernyő záró gombja és a közös
   karrier üzenetei a régi, sík módú MK → KL láncra voltak bedrótozva.

   Amit mér — a VALÓDI ünneplő képernyőt (euroMaybeCelebrate → showTrophyScreen)
   és a valódi láncot (cupChainNext), háromféle osztály-szabállyal:
     1. D1/D2: az FA győzelme után a szöveg és a gomb a Kupák Kupájának
        Kupáját mondja (selejtezővel), a Magor Kupáját és a Konföranszié Líget
        nem;
     2. D3: MK → Kupák Kupájának Kupája (selejtezővel);
     3. sík mód (80-84-es sáv): MK → Konföranszié Líg (selejtező nélkül);
     4. ha a lánc már elsült, nincs láncszöveg, a gomb „Ünneplés vége";
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9173;
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
  await p.waitForFunction(()=>typeof euroMaybeCelebrate==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    gameMode="career";
    const ki={};
    const _cup=cupTierFor,_show=showTrophyScreen;
    let utolso=null;
    showTrophyScreen=o=>{utolso=o;};
    const eset=(tier,comp)=>{
      cupTierFor=()=>tier;
      S.mkToKLDone=false;
      S.euro={comp,result:"win",stage:"done",path:[]};
      utolso=null;
      euroMaybeCelebrate();
      const o=utolso||{};
      return {note:String(o.note||"").replace(/<[^>]+>/g,""),btn:o.btn||"",
        lanc:cupChainNext(),zaro:euroMkChainPending()?cupChainGomb():"Tovább a szezonzárásra"};};
    try{
      ki.d1=eset({cupWins:{comp:"FA",gives:"BL",qual:true}},"FA");
      ki.d3=eset({cupWins:{comp:"MK",gives:"BL",qual:true}},"MK");
      ki.sik=eset({mkWinsKL:true},"MK");
      /* a lánc már elsült ebben a szezonban */
      cupTierFor=()=>({cupWins:{comp:"FA",gives:"BL",qual:true}});
      S.mkToKLDone=true;S.euro={comp:"FA",result:"win",stage:"done",path:[]};
      utolso=null;euroMaybeCelebrate();
      ki.kesz={note:(utolso&&utolso.note)||"",btn:utolso&&utolso.btn};
    }finally{cupTierFor=_cup;showTrophyScreen=_show;}
    return ki;});
  console.log("\n— A LÁNC SZÖVEGE —");
  ok(/Fából Készült Serleg megnyerésével/.test(r.d1.note)&&/Kupák Kupájának Kupája sorozatban, a selejtezőtől/.test(r.d1.note)
     &&!/Magor|Konföranszié/.test(r.d1.note),"D1/D2: az FA győzelme után a Kupák Kupájának Kupája — a Magor Kupáját és a Konföranszié Líget nem mondja",r.d1.note);
  ok(r.d1.btn==="Kezdhetjük: Kupák Kupájának Kupája →"&&r.d1.zaro===r.d1.btn&&r.d1.lanc&&r.d1.lanc.gives==="BL",
     "…és az ünneplő képernyő gombja, a záró gomb és maga a lánc ugyanazt mondja",{btn:r.d1.btn,zaro:r.d1.zaro,lanc:r.d1.lanc});
  ok(/Magor Kupája megnyerésével/.test(r.d3.note)&&/Kupák Kupájának Kupája sorozatban, a selejtezőtől/.test(r.d3.note),"D3: MK → Kupák Kupájának Kupája, selejtezővel",r.d3.note);
  ok(/Magor Kupája megnyerésével/.test(r.sik.note)&&/Konföranszié Líg sorozatban —/.test(r.sik.note)&&!/selejtező/.test(r.sik.note)
     &&r.sik.btn==="Kezdhetjük: Konföranszié Líg →","sík mód: MK → Konföranszié Líg, selejtező nélkül",r.sik);
  ok(r.kesz.note===""&&r.kesz.btn==="Ünneplés vége →","ha a lánc már elsült, nincs láncszöveg",r.kesz);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
