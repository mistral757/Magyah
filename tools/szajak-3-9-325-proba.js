/* 👄 3.9.325 — TÖBBFÉLE SZÁJ A JÁTÉKOS-SZERKESZTŐBEN.

   KÉRÉS: „játékos testreszabásnál legyen több fajta száj. Annyira jellegzetes
   szájak tudnak lenni. Pl. Ronaldinho kapafogai"

   Amit mér:
     1. 12 száj, névvel (a régi öt is nevet kapott), köztük a kapafog;
     2. a szerkesztő mind a 12-t felkínálja, és a választás a rajzon látszik;
     3. minden száj rajzolódik jókedvben, semlegesen és rosszkedvben, a
        jellegzetesek mindhárom hangulatban mások, mint a generáltak; a
        kapafog rosszkedvben is kilóg;
     4. a név szerint generált arcok szája nem változott (csak az első ötből);
     5. a stylist-szabály (FACE_MOD_MEZOK) a 11-es szájat is átengedi;
     6. a pixeles változat is elkészül;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9325;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForTimeout(800);
  const r=await p.evaluate(async()=>{
    const o={};
    o.n=FACE_SZAJ.length;o.kapa=FACE_SZAJ.indexOf("kapafog");
    const sor=fedSorok().find(x=>x.k==="szaj");o.opt=sor.opt.length;o.nevek=sor.opt.map(x=>x.t).slice(0,6);
    const _ft=faceTraits;let ov=null;faceTraits=function(pp){const T=_ft(pp);return ov?Object.assign({},T,ov):T;};
    const jp={n:"Teszt Szájas",age:25,nat:"Brazília"};
    const rajz={};
    for(let i=0;i<FACE_SZAJ.length;i++){ov={szaj:i,szakall:-1};rajz[i]=[.9,0,-.8].map(m=>faceSVG(jp,120,{mood:m,bg:false}));}
    ov=null;faceTraits=_ft;
    o.mindRajzol=Object.values(rajz).every(L=>L.every(x=>x.length>500&&/<\/svg>$/.test(x)));
    const sajat=i=>rajz[i].map(x=>x.replace(/fc\d+/g,""));
    o.kulon=[5,6,7,8,9,10,11].every(i=>[0,1,2,3,4].every(j=>sajat(i).join()!==sajat(j).join()));
    o.kapaRossz=(rajz[5][2].match(/<rect /g)||[]).length>=2;
    /* a generált arcok */
    let max=0;for(let i=0;i<400;i++){const T=faceTraits({n:"Generált "+i,age:24,nat:"Anglia"});max=Math.max(max,T.szaj);}
    o.genMax=max;
    o.mod=FACE_MOD_MEZOK.szaj.join("-");
    o.tisztit=faceModTisztit({szaj:11}).szaj+"/"+faceModTisztit({szaj:20}).szaj;
    /* pixeles */
    const pix=await new Promise(res=>{let kesz=false;try{ov=null;
      const _ft2=faceTraits;faceTraits=function(pp){const T=_ft2(pp);return Object.assign({},T,{szaj:5});};
      const u=facePixUrl({n:"Pixel Kapafog",age:22,nat:"Brazília"},{mood:.9,bg:false},x=>{kesz=true;faceTraits=_ft2;res(x);});
      if(u){faceTraits=_ft2;res(u);}
      setTimeout(()=>{if(!kesz){faceTraits=_ft2;res(null);}},4000);}catch(e){res("hiba:"+e);}});
    o.pix=typeof pix==="string"&&/^data:image|^blob:/.test(pix);
    return o;});
  ok(r.n===12&&r.kapa===5,"12 száj, köztük a kapafog",r);
  ok(r.opt===12&&r.nevek[0]==="kis mosoly"&&r.nevek[5]==="kapafog","a szerkesztő mind a 12-t felkínálja, névvel",r.nevek);
  ok(r.mindRajzol&&r.kulon,"minden száj rajzolódik három hangulatban, a jellegzetesek mások, mint a generáltak",r);
  ok(r.kapaRossz,"a kapafog rosszkedvben is kilóg",r.kapaRossz);
  ok(r.genMax<=4,"a generált arcok szája nem változott (csak az első ötből)",r.genMax);
  ok(r.mod==="0-11"&&r.tisztit==="11/11","a stylist-szabály a 11-est átengedi, a fölötte lévőt levágja",r);
  ok(r.pix,"a pixeles változat is elkészül",r.pix);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
