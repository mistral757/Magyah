/* 🌍 VÁLOGATOTTAK A PIRAMIS MEZŐNYÉBEN (3.9.223)

   KIMONDOTT KÉRÉS: „Ha a draftnál be vannak kapcsolva a nemzeti csapatok,
   akkor ők legyenek itt a potenciális ellenfelek között is."

   Amit mér:
     1. bekapcsolt válogatottakkal a piramis merítése (pyrClubPool) és a
        felépített világ (pyrBuildWorld) is tartalmaz válogatottat;
     2. kikapcsolva egyik sem — betűre a régi;
     3. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9409;
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
  const r=await p.evaluate(()=>{
    const nat=new Set(SQUADS.filter(x=>x.wc).map(x=>x.club));
    const mer=on=>{
      const _w=wcOn;window.wcOn=()=>on;
      const pool=pyrClubPool(mulberry32(7));
      const w=pyrBuildWorld(mulberry32(7));
      window.wcOn=_w;
      const csapatok=[];(w.divs||[]).forEach(d=>(d.teams||[]).forEach(t=>csapatok.push(t.club||clubOfTeamName(t.n))));
      return {poolNat:pool.filter(x=>nat.has(x.club)).length,poolDb:pool.length,
        vilagNat:csapatok.filter(c=>nat.has(c)).length,vilagDb:csapatok.length};};
    return {be:mer(true),ki:mer(false),natDb:nat.size};});
  ok(r.be.poolNat>0&&r.be.vilagNat>=0&&r.be.poolDb>r.ki.poolDb,"bekapcsolva a merítésben válogatottak is vannak",r.be);
  ok(r.be.vilagNat>0,"…és a felépített piramisban is szerepel válogatott",r.be);
  ok(r.ki.poolNat===0&&r.ki.vilagNat===0,"kikapcsolva egyik sincs (betűre a régi)",r.ki);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
