/* ✋ 3.9.319 — KÉSZ CSAPAT: RÁKÉRDEZÉS A VÁLASZTÁSKOR.

   KÉRÉS: „Kész csapatos módban legyen egy rákérdezés hogy biztosan ezt a
   csapatot választod amikor a kész csapatot ki akarod választani ez globális
   beállítás legyen mindegy hogy pvp vagy single player"

   Amit mér (a valódi klublistán, a valódi gombokkal):
     1. egyjátékosban a betekintő „Ezzel a klubbal indulok" gombja nem indít
        azonnal: megerősítő ablak jön, a klub nevével;
     2. „Még nézelődöm" → nem indul semmi, a lista marad;
     3. „Igen" → indul a kész klubos karrier;
     4. hagyományos karrierben ugyanígy, az „Igen” az osztályválasztóhoz visz;
     5. közös karrierben (a szoba adta az osztályt) is rákérdez, az „Igen"
        után indul;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9319;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  const kor=(mod)=>p.evaluate(async(mod)=>{
    const o={};
    window._ind=[];
    startClubCareer=function(sq){window._ind.push(["klub",sq.club]);};
    pyrOpenDivPick=function(sq){window._ind.push(["oszt",sq.club]);};
    pyrConfirmDiv=function(){window._ind.push(["mp",pyrPickSq&&pyrPickSq.club]);};
    pyrPending=mod!=="egy";pyrPendingDiv=mod==="mp"?4:null;pyrPendingBand=null;
    if(mod!=="mp"){pyrPendingSpeed=pyrWantedSpeed;}
    renderClubPickList("");
    const fo=document.querySelector("#clubPickList button");fo.click();
    await new Promise(r=>setTimeout(r,150));
    const go=document.querySelector("#clubPickList [data-clubgo]");
    o.gomb=go&&go.textContent;
    go.click();
    const modal=$("hubTacticConfirmModal");
    o.ablak=!modal.classList.contains("hide");o.cim=$("hubTacticConfirmTitle").textContent;
    o.szoveg=$("hubTacticConfirmBody").textContent;o.igen=$("hubTacticConfirmYes").textContent;o.nem=$("hubTacticConfirmNo").textContent;
    o.elotte=window._ind.length;
    $("hubTacticConfirmNo").click();
    o.megseUtan=window._ind.length;o.zarva=modal.classList.contains("hide");
    go.click();$("hubTacticConfirmYes").click();
    o.ind=window._ind.slice();
    o.klub=fo.textContent;
    pyrPending=false;pyrPendingDiv=null;
    return o;},mod);
  const r1=await kor("egy");
  ok(r1.ablak&&/Biztosan ezt a csapatot választod/.test(r1.cim)&&r1.elotte===0,"egyjátékos: a gomb nem indít azonnal — megerősítő ablak jön",{cim:r1.cim,gomb:r1.gomb});
  ok(r1.ablak&&r1.klub.includes(r1.szoveg.split(" (")[0].trim().slice(0,6)),"az ablakban a választott klub neve áll",r1.szoveg.slice(0,120));
  ok(r1.megseUtan===0&&r1.zarva&&/nézelődöm/.test(r1.nem),"„Még nézelődöm”: nem indul semmi, az ablak bezárul",{n:r1.megseUtan,nem:r1.nem});
  ok(r1.ind.length===1&&r1.ind[0][0]==="klub","„Igen”: indul a kész klubos karrier",r1.ind);
  const r2=await kor("hagy");
  ok(r2.ablak&&r2.elotte===0&&r2.ind.length===1&&r2.ind[0][0]==="oszt"&&/tovább/i.test(r2.igen),"hagyományos karrier: rákérdez, az „Igen” az osztályválasztóhoz visz",{ind:r2.ind,igen:r2.igen});
  const r3=await kor("mp");
  ok(r3.ablak&&r3.elotte===0&&r3.ind.length===1&&r3.ind[0][0]==="mp"&&/egyből indul az idény/.test(r3.szoveg),"közös karrier: ugyanúgy rákérdez, az „Igen” után indul",{ind:r3.ind,sz:r3.szoveg.slice(-80)});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
