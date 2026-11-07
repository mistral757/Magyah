/* ☯ 1.0.4.15.04 — A GÉPEZET FELTÉTELE SZÁZALÉKOS, SZINTENKÉNT TÁGUL.
   KÉRÉS: „A gépezet képesség aktiválási feltétele legyen százalékos, mert
   különben teljesen teljesíthetetlen. A képesség szintjeivel a százalék
   elvárás is bővüljön: 5% ==> 8 ==> 12%."
   Amit mér: a különbség a kezdő 11 átlagához mér; a határ 5/8/12%; a
   kártya a szinthez tartozó határt írja ki; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9416;
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
    const _x=stXI,_e=stEffOvr;
    const xi=v=>{window.stXI=()=>v.map(o=>({o}));window.stEffOvr=x=>x.o;};
    const T=STYLE_TRAITS.harmonia.find(t=>t.key==="gepezet_mukodik");
    const f=lv=>T.lv[lv-1].fx.ovrTeam();
    /* átlag 200: 10 ember 200-on, egy 200−d-n (d: a különbség) */
    const set=d=>{const a=Array(10).fill(200+d/11);a.push(200+d/11-d);xi(a);};
    set(9);ki.p9=Math.round(stXISpreadPct()*100)/100;ki.l1_9=f(1);
    set(11);ki.l1_11=f(1);ki.l2_11=f(2);
    set(17);ki.l2_17=f(2);ki.l3_17=f(3);
    set(25);ki.l3_25=f(3);
    ki.cond1=T.cond(1);ki.cond3=T.cond(3);ki.cond0=T.cond(0);
    xi([200,190]);ki.ures=f(3);ki.uresTxt=T.cond(1);
    window.stXI=_x;window.stEffOvr=_e;
    ki.d=T.d;ki.notes=T.lv.map(l=>l.note);
    return ki;});
  console.log("\n— a feltétel —");
  ok(Math.abs(r.p9-4.5)<0.01,"a különbség az átlag százalékában (9 pont / 200 = 4,5%)",r.p9);
  ok(r.l1_9===1.5&&r.l1_11===0,"1. szint: 5% alatt él (4,5% igen, 5,5% nem)",[r.l1_9,r.l1_11]);
  ok(r.l2_11===2.5&&r.l2_17===0,"2. szint: 8% alatt él (5,5% igen, 8,5% nem)",[r.l2_11,r.l2_17]);
  ok(r.l3_17===3.5&&r.l3_25===0,"3. szint: 12% alatt él (8,5% igen, 12,5% nem)",[r.l3_17,r.l3_25]);
  ok(r.ures===0&&/nincs feltöltve/.test(r.uresTxt),"hiányos kezdő 11: nem él, és kimondja",r.uresTxt);
  console.log("\n— a kártya —");
  ok(/5% alatt kell/.test(r.cond1)&&/12% alatt kell/.test(r.cond3)&&/5% alatt kell/.test(r.cond0),"a feltétel-sor a szint határát írja (meg nem vett: az 1. szinté)",[r.cond1,r.cond3]);
  ok(/5%-a alatt/.test(r.d)&&/8%/.test(r.d)&&/12%/.test(r.d),"a leírás a százalékokat mondja",r.d);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
