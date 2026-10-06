/* ⚔ 3.9.211 — KÖZÖS KUPA: A KÉT CSAPAT CSAK A DÖNTŐBEN TALÁLKOZHAT.

   BEJELENTÉS: „PvP-ben kupasorozatokban mindig a döntő legyen kijelölve
   közös találkozásnak, hogy ne egymás miatt essenek ki a sorozatból."

   Amit mér:
     1. EZERSZÁMRA, véletlen ágakon (8 és 16 párharc, csoportos és csoport
        nélküli): az első kieséses kör után a két csapat az ág két ellentétes
        felében áll — csak a döntő hozhatja össze őket; minden csapat bent
        marad, egyszer; csoporttárs nem kerül össze;
     2. SZIMMETRIA: a két gépen („én" és „a társ" felcserélve) ugyanaz a fa;
     3. KAPUK: régi klienssel (apart nélkül), a döntőben, kiesett társsal,
        közös kupa nélkül — nem nyúl az ághoz;
     4. A NEVEZÉS viszi a jelzőt, a fejléc kimondja a szabályt. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9253;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1000);
  const r=await p.evaluate(()=>{
    const o={};
    const seed=(()=>{let x=12345;return ()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648;};})();
    /* egy szintetikus közös kupa: n párharc, 2n csapat, csoport-címkékkel */
    const setup=(n,comp,U,M,opts)=>{
      opts=opts||{};
      const teams=[];for(let i=0;i<2*n;i++)teams.push({n:"T"+i,ovr:80,g:Math.floor(i/4)});
      S.seasonNumber=7;
      S.euro={comp,teams,userIdx:U,mateIdx:M,mateOut:opts.out||null,mpSeeded:true,stage:"r16"};
      S.mpCup={season:7,comp,apart:opts.apart!==false};};
    const randTies=(n,grp)=>{
      for(let tries=0;tries<500;tries++){
        const ids=[...Array(2*n).keys()];
        for(let i=ids.length-1;i>0;i--){const j=Math.floor(seed()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
        const t=[];for(let i=0;i<n;i++)t.push({a:ids[2*i],b:ids[2*i+1],legs:[null,null],winner:null});
        if(!grp||t.every(x=>S.euro.teams[x.a].g!==S.euro.teams[x.b].g))return t;}
      return null;};
    const has=(t,x)=>t.a===x||t.b===x;
    const lvlFinal=n=>Math.log2(n);
    let rossz=[],csopRossz=0,hianyzik=0,szimRossz=0,probak=0,egymasEllen=0,egyFel=0;
    for(const [n,comp,round,grp] of [[8,"BL","r16",true],[8,"HSZ","hszpo",false],[8,"HSZ","r16",false],[16,"MK","r32",false],[4,"EL","qf",false]]){
      for(let k=0;k<600;k++){
        const U=Math.floor(seed()*2*n);let M=Math.floor(seed()*2*n);if(M===U)M=(U+1)%(2*n);
        setup(n,comp,U,M);
        const base=randTies(n,grp);if(!base)continue;probak++;
        const t0=base.findIndex(t=>has(t,U)),m0=base.findIndex(t=>has(t,M));
        if(t0===m0)egymasEllen++;else if(Math.floor(t0/(n/2))===Math.floor(m0/(n/2)))egyFel++;
        const t=mpCupKeepApart(round,JSON.parse(JSON.stringify(base)));
        const iu=t.findIndex(x=>has(x,U)),im=t.findIndex(x=>has(x,M));
        const lvl=mpCupMeetLevel(iu,im);
        if(lvl!==lvlFinal(n))rossz.push({n,round,iu,im,lvl});
        const all=t.flatMap(x=>[x.a,x.b]).sort((a,b)=>a-b);
        if(all.length!==2*n||all.some((v,i)=>v!==i))hianyzik++;
        if(grp&&round==="r16"&&t.some(x=>S.euro.teams[x.a].g===S.euro.teams[x.b].g))csopRossz++;
        /* a másik gép: „én" és „a társ" felcserélve */
        setup(n,comp,M,U);
        const t2=mpCupKeepApart(round,JSON.parse(JSON.stringify(base)));
        if(JSON.stringify(t2)!==JSON.stringify(t))szimRossz++;}}
    o.ag={probak,rossz:rossz.slice(0,3),rosszDb:rossz.length,hianyzik,csopRossz,szimRossz,egymasEllen,egyFel};
    /* 3. kapuk */
    const kapu=(fn)=>{setup(8,"BL",0,1);fn();const base=[{a:0,b:1},{a:2,b:3},{a:4,b:5},{a:6,b:7},{a:8,b:9},{a:10,b:11},{a:12,b:13},{a:14,b:15}];
      const t=mpCupKeepApart(S.euro.stage||"r16",JSON.parse(JSON.stringify(base)));return JSON.stringify(t)===JSON.stringify(base);};
    o.regi=kapu(()=>{S.mpCup.apart=false;});
    o.dontoben=(()=>{setup(1,"BL",0,1);const base=[{a:0,b:1}];return JSON.stringify(mpCupKeepApart("final",JSON.parse(JSON.stringify(base))))===JSON.stringify(base);})();
    o.kiesett=kapu(()=>{S.euro.mateOut="qf";});
    o.nincs=kapu(()=>{S.mpCup=null;});
    o.nemSeedelt=kapu(()=>{S.euro.mpSeeded=false;});
    o.mukodik=!kapu(()=>{});
    /* 4. nevezés és fejléc */
    o.nevezes=mpCupEntryExtra().apart;
    setup(8,"BL",0,9);S.euro.ties=null;S.euro.userTie=-1;S.euro.stage="group";S.euro.mateG=null;
    S.mpCup.mateName="Teszt FC";
    o.fej=(mpCupHeadHtml()||"").replace(/<[^>]+>/g,"");
    o.v=APP_VERSION;
    return o;});
  console.log("\n— 1. ezerszámra, véletlen ágakon —");
  ok(r.ag.probak>2500&&r.ag.rosszDb===0,"minden ágban csak a döntő hozhatja össze őket",r.ag);
  ok(r.ag.egymasEllen>20&&r.ag.egyFel>500,"…és a próbák között bőven volt eredetileg egymás elleni és egy félágba eső sorsolás",r.ag);
  ok(r.ag.hianyzik===0&&r.ag.csopRossz===0,"minden csapat egyszer marad bent; csoporttárs nem kerül össze",r.ag);
  console.log("\n— 2. szimmetria —");
  ok(r.ag.szimRossz===0,"a két gépen ugyanaz a fa",r.ag.szimRossz);
  console.log("\n— 3. kapuk —");
  ok(r.mukodik,"közös kupában átrendez");
  ok(r.regi&&r.dontoben&&r.kiesett&&r.nincs&&r.nemSeedelt,"régi kliens, döntő, kiesett társ, nincs közös kupa, nem seedelt ág → nem nyúl hozzá",r);
  console.log("\n— 4. nevezés és fejléc —");
  ok(r.nevezes===1,"a nevezés viszi a jelzőt");
  ok(/csak a döntőben/.test(r.fej),"a fejléc kimondja",r.fej);
  ok(String(r.v).localeCompare("3.9.211",undefined,{numeric:true})>=0,"verzió legalább 3.9.211",r.v);
  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
