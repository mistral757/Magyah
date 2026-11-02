/* ✂️ A GYÉMÁNT (ROMBUSZ) ARCFORMA KIVÉVE (3.9.351).

   BEJELENTETT HIBA: „A rombusz fejformára nincsenek ráillesztve a hajak. Vagy
   vegyük ki ezt a fejformát, vagy oldjuk meg az illeszkedést. Amelyik
   egyszerűbb."

   Amit mér:
     1. a generált arcok közt nincs gyémánt (homlok 0,6), a többi forma megvan;
     2. egy régi mentés gyémánt beállítása (arcF:7) betűre úgy rajzolódik, mint
        a szív alakú (arcF:6);
     3. a szerkesztő nem kínálja, és a régi beállítást a helyettesén jelöli;
     4. nincs oldalhiba. */
"use strict";
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9351;
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".woff2":"font/woff2"};
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const o={};const homlok={};
    for(let i=0;i<4000;i++){const T=faceTraits({n:"Próba Játékos "+i,nat:"Magyarország",age:20+(i%15),pos:["CS"]});
      const h=Math.round((T.homlok||1)*100)/100;homlok[h]=(homlok[h]||0)+1;}
    o.homlok=homlok;
    const oM=faceModFor;
    const rajz=arcF=>{faceModFor=()=>({arcF});const T=faceTraits({n:"Teszt Elek",nat:"Magyarország",age:25,pos:["CS"]});
      return [T.fejW,T.allW,T.fejTop,T.allY,T.allCsucs,T.allHegy,T.homlok].join("|");};
    o.het=rajz(7);o.hat=rajz(6);
    faceModFor=oM;
    const sor=fedSorok().find(x=>x.k==="arc");
    o.opt=sor.opt.map(x=>x.t);
    o.kod=fedArcKod({arcF:7});
    return o;});
  ok(!r.homlok["0.6"]&&r.homlok["1.1"]>0&&r.homlok["1.05"]>0&&r.homlok["0.95"]>0&&r.homlok["1.02"]>0,"a generált arcok közt nincs gyémánt (homlok 0,6), a többi forma megvan",r.homlok);
  ok(r.het===r.hat,"a régi gyémánt beállítás a szív alakú formával rajzolódik",{het:r.het,hat:r.hat});
  ok(!r.opt.includes("gyémánt")&&r.opt.includes("szív alakú")&&r.opt.length===8,"a szerkesztő nem kínálja",r.opt);
  ok(r.kod===6,"a régi beállítást a helyettesén jelöli",r.kod);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
