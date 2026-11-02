/* 💰 Kupa-díj fordulónként (3.9.342).

   BEJELENTETT ARÁNYTALANSÁG: „EL-be estem ki a BL selejtezőn. Azt megnyertem.
   Kaptam 70 Mrd-ot. A társam bejutott BL-be, negyeddöntőben kiesett, alig
   kapott valamicskét. Ezt balancolni kell."

   Amit mér: KK negyeddöntő > OJK győzelem; a KK csoportköre is fizet; a
   selejtező és a felkészülési kupa nem; minden sorozat monoton; a sorozatok
   sorrendje; a valódi zárás (euroCampaignEndNow) így fizet. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9488;
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
  try{await p.waitForFunction(()=>typeof cupPrizeMult==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a fordulónkénti kupa-díj létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}


  const t=await p.evaluate(()=>{
    const ki={};
    const m=(c,k,o)=>Math.round(cupPrizeMult(c,k,o)*1000)/1000;
    ki.blQf=m("BL",null,"qf");ki.elWin=m("EL","win");ki.blGroup=m("BL",null,"group");ki.elQf=m("EL",null,"qf");
    ki.qual=m("BL",null,"qual");ki.nyk=m("NYK","win");
    /* monoton minden sorozatban */
    const sor={eu:["group","r16","qf","sf","final"],mk:["mk1","mk2","mk3","mk4","final"],hsz:["group","hszpo","r16","qf","sf","final"]};
    ki.monoton=true;
    [["BL","eu"],["EL","eu"],["KL","eu"],["FA","mk"],["MK","mk"],["HSZ","hsz"]].forEach(([c,g])=>{
      const v=sor[g].map(o=>cupPrizeMult(c,null,o)).concat([cupPrizeMult(c,"win")]);
      for(let i=1;i<v.length;i++)if(v[i]<v[i-1])ki.monoton=false;});
    /* sorozatok egymáshoz: a magasabb sorozat győzelme többet ér */
    ki.lepcso=m("HSZ","win")>m("BL","win")&&m("BL","win")>m("EL","win")&&m("EL","win")>m("KL","win");
    /* a valódi zárás: a bejelentett két eset */
    const zar=(comp,kind,outAt)=>{
      S.euro={comp,stage:"x",outAt,teams:[],fixtures:[],idx:0,groups:[]};
      let kapott=0;const _b=budgetEarn;budgetEarn=(v)=>{kapott+=v;return v;};
      try{euroCampaignEndNow(kind);}catch(e){}
      budgetEarn=_b;
      return {prize:S.euro?S.euro.prize:null,kapott};};
    const top=topMarketPrice();ki.top=top;
    ki.el=zar("EL","win",null);
    ki.bl=zar("BL","out","qf");
    S.euro=null;
    return ki;});
  ok(t.blQf>t.elWin,"a KK/BL negyeddöntő többet ér, mint az OJK/EL megnyerése",{blQf:t.blQf,elWin:t.elWin});
  ok(t.blGroup>0&&Math.abs(t.blGroup-t.elQf)<0.05,"a KK csoportköre is fizet, nagyjából az OJK negyeddöntőjével rokon",{blGroup:t.blGroup,elQf:t.elQf});
  ok(t.qual===0&&t.nyk===0,"a selejtezőben kiesés és a felkészülési kupa nem fizet");
  ok(t.monoton,"minden sorozatban a későbbi kör sosem ér kevesebbet");
  ok(t.lepcso,"a sorozatok sorrendje áll: HSZ > KK > OJK > KONF győzelem");
  ok(t.el.prize>0&&t.bl.prize>t.el.prize&&t.el.prize===t.el.kapott,"a valódi zárás: a KK negyeddöntős díja nagyobb, mint az OJK-győztesé (és a keretbe kerül)",{el:t.el,bl:t.bl,top:t.top});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
