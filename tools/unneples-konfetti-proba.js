/* 🎉 AZ ÜNNEPLŐ KÉPERNYŐ KONFETTIJE (3.9.224)

   BEJELENTÉS: „Bugos a bajnokin, kupában, bármilyen ünneplős kijelzőn a
   konfetti. […] formáljuk olyanná, hogy illjen jobban a témákhoz. Pl. A
   pixelated egyáltalán nincs megcsinálva olyanra."
   Az ok: a Pixel téma globális steps(6)-ja hat közös magasságra ugrasztotta
   a darabokat — sorba álltak.

   Amit mér:
     1. Pixel: a darabok saját lépésszámmal esnek, magasságuk szétszórt, a
        színek a konzolpalettából, pixelformák, pixelbetűs kártya;
     2. a többi téma formái és betűi (fólia/flitter, ezüst, papírfecni, Anton);
     3. a „szaggatott mozgás" kapcsoló kikapcsolva simán esnek;
     4. nincs oldalhiba. */
const PICO8=["#7e2553","#008751","#ab5236","#5f574f","#c2c3c7","#fff1e8","#ff004d","#ffa300","#ffec27","#00e436","#29adff","#83769c","#ff77a8","#ffccaa"];
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9468;
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
  await p.waitForFunction(()=>typeof championConfetti==="function",null,{timeout:15000});
  const nez=async(th,tr)=>p.evaluate(async([th,tr])=>{
    applyTheme(th);showTrophyScreen({theme:tr,sub:"x",meta:"y"});
    $("championModal").style.zIndex=99999;
    await new Promise(r=>setTimeout(r,2600));
    const db=[...document.querySelectorAll("#champConfetti .cf")];
    const ki={n:db.length,tf:[],y:[],szin:[],forma:{}};
    db.forEach(e=>{
      const cs=getComputedStyle(e);ki.tf.push(cs.animationTimingFunction);
      const r=e.getBoundingClientRect();if(+cs.opacity>0.5&&r.top>0&&r.top<innerHeight)ki.y.push(Math.round(r.top));
      ki.szin.push(e.style.getPropertyValue("--c").trim());
      const f=[...e.classList].filter(c=>c!=="cf").join(" ");ki.forma[f]=(ki.forma[f]||0)+1;});
    const c=$("champCard"),t=$("champTitle");
    ki.acc=c.style.getPropertyValue("--chAcc");ki.font=getComputedStyle(t).fontFamily;
    ki.bor=getComputedStyle(c).borderTopWidth;
    $("championModal").classList.add("hide");
    return ki;},[th,tr]);

  console.log("=== 1. PIXEL: a darabok NEM állnak sorba ===");
  const px=await nez("pixel","LEAGUE");
  const lep=new Set(px.tf);
  ok(!px.tf.some(t=>/^steps\(6(,|\))/.test(t)),"a globális steps(6) nem éri a konfettit",[...lep].slice(0,3));
  ok(lep.size>=Math.min(15,px.n/4),"minden darab a saját lépésszámával esik",lep.size);
  const ySet=new Set(px.y);
  ok(px.y.length>=10&&ySet.size>=px.y.length*0.6,"a látható darabok magassága szétszórt (nincs közös sor)",{lathato:px.y.length,kulonbozo:ySet.size});
  const PAL=new Set(PICO8);
  ok(px.szin.every(c=>PAL.has(c)),"minden szín a konzolpalettából",[...new Set(px.szin)]);
  ok(Object.keys(px.forma).every(f=>/^cf-px/.test(f)),"pixel-formák (négyzet, bukfenc, csillag)",px.forma);
  ok(/Pixelify|Pixszam/.test(px.font)&&px.bor==="4px","pixelbetűs cím, 4 px-es keret",{font:px.font,bor:px.bor});
  ok(px.acc==="#ffa300","a bajnoki arany a palettán",px.acc);

  console.log("=== 2. A TÖBBI TÉMA ===");
  const dk=await nez("dark","LEAGUE");
  ok(dk.n===70&&dk.tf.every(t=>t==="linear"),"Sötét-arany: 70 darab, sima esés",dk.n);
  ok(Object.keys(dk.forma).some(f=>/folia/.test(f))&&Object.keys(dk.forma).some(f=>/kor/.test(f)),"Sötét-arany: fólia és flitter is",dk.forma);
  const nr=await nez("noir","BL");
  ok(nr.szin.every(c=>{const m=/^#(..)(..)(..)$/.exec(c);if(!m)return false;const r=parseInt(m[1],16),g=parseInt(m[2],16),b=parseInt(m[3],16);return Math.abs(r-g)<=2&&Math.abs(g-b)<=5;}),"Noir: csak ezüst-szürke",[...new Set(nr.szin)].slice(0,5));
  ok(nr.n===110,"Noir BL: 110 darab",nr.n);
  ok(/Anton/.test(nr.font),"Noir: Anton plakátbetű",nr.font);
  const pp=await nez("paper","MK");
  ok(Object.keys(pp.forma).some(f=>/fecni/.test(f)),"Törtfehér: tépett papírfecni",pp.forma);
  ok(/Anton/.test(pp.font),"Törtfehér: Anton plakátbetű",pp.font);

  console.log("=== 3. A SZAGGATOTT MOZGÁS KI ===");
  await p.evaluate(()=>document.documentElement.classList.add("pixMoveOff"));
  const pm=await nez("pixel","EL");
  ok(pm.tf.every(t=>t==="linear"),"pixMoveOff: a pixeldarabok simán esnek",[...new Set(pm.tf)]);
  await p.evaluate(()=>document.documentElement.classList.remove("pixMoveOff"));

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
