/* A kémia-építés és a "meccsről meccsre" lánc találkozása.
   Azt méri, hogy a lánc MIT léptetne a kémia-panelen. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8981;
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
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    const A="Diego Maradona", B="Lionel Messi";
    /* A választó a kerettel dolgozik — kicseréljük egy ismert kettőre. */
    const keret=[{n:A,pos:["CS"],age:27},{n:B,pos:["TM"],age:26},{n:"Wayne Rooney",pos:["CS"],age:28}];
    window.currentRoster=()=>keret;
    window.careerPool=Object.fromEntries(keret.map(x=>[x.n,{age:x.age}]));
    /* A lánc legyen bekapcsolva, de a pirula ne induljon el: csak immPending-et
       kérdezzük, nem a hurkot. */
    const k=chemKey(A,B);

    /* ---- 1. FOLYAMATBAN LÉVŐ PÁRKÉMIA ---- */
    S.chemPairs={}; S.chemPairs[k]={a:A,b:B,stages:3,need:5}; S.chemInProgress=k;
    showChemBuild(()=>{});
    out.folyamatban_gombok=immBtns("skillAssignList").map(x=>x.textContent.trim());
    let q=immPending();
    out.folyamatban=q?{id:q.id,mit:q.mit,dont:q.dont,var:q.var,
      gomb:q.gomb?(q.gomb.id||q.gomb.tagName)+" | "+(q.gomb.innerText||"").replace(/\n/g," / ").slice(0,60):null}:null;

    /* ---- 2. NINCS FOLYAMATBAN: A VÁLASZTÓ ---- */
    S.chemInProgress=null;
    showChemBuild(()=>{});
    out.valaszto_gombok=immBtns("skillAssignList").map(x=>x.textContent.trim());
    q=immPending();
    out.valaszto=q?{id:q.id,mit:q.mit,dont:q.dont,var:q.var}:null;

    /* ---- 3. VÁLASZTÓ, ELSŐ EMBER MÁR KIVÁLASZTVA (a "↩ vissza" gomb ága) ---- */
    chemPickFirst=A; renderChemPick();
    out.valaszto2_gombok=immBtns("skillAssignList").map(x=>x.textContent.trim());
    q=immPending();
    out.valaszto2=q?{id:q.id,mit:q.mit,dont:q.dont,var:q.var}:null;
    chemPickFirst=null;

    /* ---- 4. UGYANEZ PASSZKÉMIÁN ---- */
    try{
      const pk=passChemKey(A,B);
      S.passChem={}; S.passChem[pk]={a:A,b:B,stages:2,need:PASS_CHEM_NEED};
      S.passChemInProgress=pk;
      showPassChemBuild(()=>{});
      out.passz_gombok=immBtns("skillAssignList").map(x=>x.textContent.trim());
      const q2=immPending();
      out.passz=q2?{id:q2.id,mit:q2.mit,dont:q2.dont,var:q2.var,
        gomb:q2.gomb?(q2.gomb.id||q2.gomb.tagName):null}:null;
    }catch(e){out.passz="HIBA: "+e.message;}

    /* ---- 5. A FOLYTATÁS TÉNYLEG LÉPTET-E? ---- */
    S.chemPairs={}; S.chemPairs[k]={a:A,b:B,stages:3,need:5}; S.chemInProgress=k;
    let resumed=false;
    showChemBuild(()=>{resumed=true;});
    const qq=immPending();
    if(qq&&qq.gomb)qq.gomb.click();
    out.kattintas_utan={stages:S.chemPairs[k]?S.chemPairs[k].stages:null,
      inProgress:S.chemInProgress===k, panelRejtve:$("scSkill").classList.contains("hide"),
      folytatodott:resumed};
    return out;});

  console.log(JSON.stringify(r,null,1));
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
