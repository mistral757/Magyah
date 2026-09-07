/* A SOROZAT RÖVIDÍTÉSE NEM MEHET KI A KÉPERNYŐRE (3.9.44).

   Bejelentett kérés: „nem használjuk már a BL rövidítést (jogi okokból) …
   menjenek a cserék és ebbe vonjuk bele az egyéni díjakat is: BL gólkirály,
   gólpassz király stb."

   Amit mér:
     1. A KULCS MARAD. Az EURO_COMPS `BL` kulcsa változatlan — arra hivatkozik
        a mentés, a kvalifikációs tábla (CUP_TIERS), a kupa-kihívás és a Run
        mérföldkövei. Átnevezve minden futó karrier kupája elveszne.
     2. A KIÍRÁS CSERÉLŐDÖTT. A `short` mostantól „KK" (Kupák Kupája) — a játék
        saját nevéből, két betű, mint a többi sorozaté, és sorrendben sem
        téveszt meg.
     3. EGYETLEN SZTRING-LITERÁLBAN SEM MARAD önálló „BL". Ez a lényegi
        ellenőrzés, és szándékosan a FORRÁST fésüli át, nem egy képernyőt: a
        kiírások szét vannak szórva (skill-leírások, kommentár-sorok, súgók,
        mérföldkövek, Run-bontás), egy képernyőkép sosem fogná meg mindet.
        A kommentek KIMARADNAK — ott a tervezési indoklás joggal nevezi néven
        a valódi sorozatot.
*/
"use strict";
const fs=require("fs"),path=require("path"),http=require("http");
const ROOT="/home/user/Magyah", PORT=8969;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");

/* ---- 3. A FORRÁS ÁTFÉSÜLÉSE ---- */
function sztringek(src){
  const out=[];let i=0,line=1;const n=src.length;
  while(i<n){
    const c=src[i];
    if(c==="\n"){line++;i++;continue;}
    if(c==="/"&&src[i+1]==="*"){const e=src.indexOf("*/",i+2);
      line+=(src.slice(i,e+2).match(/\n/g)||[]).length;i=e+2;continue;}
    if(c==="/"&&src[i+1]==="/"){const e=src.indexOf("\n",i);i=(e<0?n:e);continue;}
    if(c==='"'||c==="'"||c==="`"){
      const q=c;let j=i+1,buf="";
      while(j<n){
        if(src[j]==="\\"){buf+=src[j+1];j+=2;continue;}
        if(src[j]===q)break;
        if(src[j]==="\n"&&q!=="`")break;
        buf+=src[j];j++;}
      const st=line;line+=(src.slice(i,j).match(/\n/g)||[]).length;
      out.push({line:st,s:buf});i=j+1;continue;}
    i++;}
  return out;}

const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const gyanus=sztringek(src).filter(x=>{
  if(!/\bBL\b/.test(x.s))return false;
  if(x.s.trim()==="BL")return false;             /* a KULCS maga — kell */
  if(/champ-BL/.test(x.s))return false;          /* CSS-osztálynév */
  /* `${…BL}` alakú TULAJDONSÁG-hivatkozás, nem kiírt szöveg */
  const marad=x.s.replace(/\$\{[^}]*\bBL\b[^}]*\}/g,"").replace(/[A-Za-z_$][\w$]*\.BL\b/g,"");
  return /\bBL\b/.test(marad);});

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
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1300);

  const r=await p.evaluate(()=>{
    const o={};
    /* 1. a KULCS és a hozzá tartozó gépezet érintetlen */
    o.kulcs_marad=!!EURO_COMPS.BL;
    o.tabla_kulcsa=CUP_TIERS.some(t=>(t.entries||[]).some(e=>e.comp==="BL"));
    o.run_kulcsok=["bl_win","bl_boot","bl_pass","bl_glove"].every(k=>!!RUN_MILESTONES[k]);
    /* 2. a KIÍRÁS */
    o.short=EURO_COMPS.BL.short;
    o.teljes_nev=EURO_COMPS.BL.n;
    o.tobbi_short=["EL","KL","MK"].map(k=>EURO_COMPS[k].short);
    o.egyediek=(new Set(Object.keys(EURO_COMPS).map(k=>EURO_COMPS[k].short))).size
      ===Object.keys(EURO_COMPS).length;
    /* 3. az EGYÉNI DÍJAK leírásai */
    const sk=id=>{const x=SKILLS.find(y=>y.id===id);return x?x.desc:"";};
    o.dijak={boot:sk("bl_golden_boot"),pass:sk("bl_golden_passes"),glove:sk("bl_golden_gloves"),
             lg:sk("lg_golden_boot")};
    o.dijak_tisztak=Object.values(o.dijak).every(d=>d&&!/\bBL\b/.test(d))
      &&/^A kupa gólkirályának/.test(o.dijak.boot)
      &&/^A kupa gólpassz-királyának/.test(o.dijak.pass)
      &&/^A kupa kapus-királyának/.test(o.dijak.glove);
    /* a díj-skillek AZONOSÍTÓI változatlanok — a mentés azokat viszi */
    o.dij_idk=["bl_golden_boot","bl_golden_passes","bl_golden_gloves"]
      .every(id=>SKILLS.some(x=>x.id===id)&&AWARD_ONLY_SKILL_IDS.has(id));
    /* 4. a Run-mérföldkövek kiírt nevei */
    o.run_nevek=["bl_win","bl_boot","bl_pass","bl_glove"].map(k=>RUN_MILESTONES[k].n);
    o.run_nevek_tisztak=o.run_nevek.every(n=>!/\bBL\b/.test(n));
    return o;});

  const T=[
    ["a BL KULCS és a gépezete érintetlen (mentés-kompatibilitás)",
      r.kulcs_marad===true&&r.tabla_kulcsa===true&&r.run_kulcsok===true],
    ["a díj-skillek azonosítói is változatlanok",r.dij_idk===true],
    ["a rövidítés mostantól KK (Kupák Kupája)",r.short==="KK"],
    ["a teljes név változatlan",r.teljes_nev==="Kupák Kupájának Kupája"],
    ["a négy sorozat rövidítése továbbra is egyedi",r.egyediek===true],
    ["az egyéni díjak leírásában nincs BL",r.dijak_tisztak===true],
    ["a Run-mérföldkövek kiírt nevében sincs",r.run_nevek_tisztak===true],
    ["EGYETLEN sztring-literálban sem maradt önálló BL",gyanus.length===0],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  rövidítések:",r.short,"·",JSON.stringify(r.tobbi_short));
  console.log("  díjak:",JSON.stringify(r.dijak.boot.slice(0,46)),"…");
  console.log("  Run-nevek:",JSON.stringify(r.run_nevek));
  if(gyanus.length){
    console.log("\n  MARADT BL A KIÍRÁSBAN:");
    gyanus.slice(0,10).forEach(x=>console.log(`    ${x.line}: ${x.s.replace(/\s+/g," ").slice(0,110)}`));}
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
