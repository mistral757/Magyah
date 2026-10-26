/* 🧪 REGRESSZIÓS FUTTATÓ (3.9.306)

   A tools/ alatt ~235 próba él (`*proba*.js`), mindegyik a saját portján indít
   egy kiszolgálót és egy böngészőt. Eddig nem volt egyetlen parancs, ami
   mindet — vagy egy jól körülírt részüket — lefuttatja és összesíti; a
   „teljes regresszió" kézi ciklus volt, és egy portütközés egy egész kört
   elvitt. Ez a futtató ezt pótolja.

   Használat:
     node tools/futtat.js                    # mind, 3 párhuzamosan
     node tools/futtat.js --uj 15            # a 15 legújabb (a fájlnév verziószáma szerint)
     node tools/futtat.js --minta edzo,kupa  # aminek a nevében benne van (vesszővel: bármelyik)
     node tools/futtat.js -j 4 --ido 400     # 4 párhuzamosan, próbánként 400 mp a plafon
     node tools/futtat.js --check            # előtte a tools/check.sh (szintaxis, globálisok, nevek)
     node tools/futtat.js --lista            # csak kiírja, mit futtatna

   MIKOR BUKIK EGY PRÓBA: nem nulla kilépési kód, VAGY a kimenetben „✗"-gel
   kezdődő sor (néhány régebbi próba hibánál is 0-val lép ki), VAGY lejárt az
   ideje. A teljes kimenet próbánként a naplómappába kerül (alapból
   /tmp/magyah-futtatas-<idő>/, vagy FUTTAT_KI=<mappa>).

   PORTOK: a próba forrásából olvassa ki — `PORT=…`, `listen(…)`, és az
   URL-be égetett `127.0.0.1:…`. Két közös portú próba sosem fut egyszerre —
   a második megvárja az elsőt.

   KÉPERNYŐKÉPEK: a próbák az icons/screenshots/ alá írnak. A futás végén a
   futtató visszaállítja a követett fájlokat (git checkout) és törli azokat
   az ÚJ fájlokat, amik a futás alatt keletkeztek — ami előtte is ott volt,
   ahhoz nem nyúl.

   Kilépési kód: 0 = minden zöld, 1 = volt bukás. */
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process"),os=require("os");
const ROOT=path.resolve(__dirname,"..");
const args=process.argv.slice(2);
const opt=(n,d)=>{const i=args.indexOf(n);return i>=0&&args[i+1]!==undefined?args[i+1]:d;};
const van=n=>args.includes(n);
const J=Math.max(1,parseInt(opt("-j","3"),10)||3);
const IDO=Math.max(30,parseInt(opt("--ido","300"),10)||300)*1000;
const UJ=parseInt(opt("--uj","0"),10)||0;
const MINTA=(opt("--minta","")||"").split(",").map(s=>s.trim()).filter(Boolean);
const KI=process.env.FUTTAT_KI||path.join(os.tmpdir(),"magyah-futtatas-"+new Date().toISOString().replace(/[:.]/g,"-"));

/* a próbák és a verziószámuk (a névből: „…-3-9-306-proba.js" → 3.9.306) */
function verzioKulcs(f){
  const m=f.match(/(\d+)-(\d+)-(\d+)/);
  return m?(+m[1])*1e6+(+m[2])*1e3+(+m[3]):0;}
let probak=fs.readdirSync(path.join(ROOT,"tools")).filter(f=>/proba.*\.js$/.test(f)).sort();
if(MINTA.length)probak=probak.filter(f=>MINTA.some(m=>f.includes(m)));
if(UJ>0)probak=probak.slice().sort((a,b)=>verzioKulcs(b)-verzioKulcs(a)||a.localeCompare(b)).slice(0,UJ);
/* MINDEN port, amit a próba használ: a `PORT=…` (akár `process.env.PORT||9260`
   alakban), a `listen(8952…)`, és az URL-be égetett `127.0.0.1:8977` / `localhost:…`.
   (Az első teljes körben a `PORT=` alak egymagában kevés volt: a régebbi próbák
   egy része csak az URL-ben nevezi meg a portját, és két 8977-es egyszerre futott.) */
const portok=f=>{
  let src="";try{src=fs.readFileSync(path.join(ROOT,"tools",f),"utf8");}catch(e){return ["egyedi:"+f];}
  const k=new Set();
  for(const re of [/\bPORT\s*=\s*[^;\n]{0,40}?\b(\d{4,5})\b/g,/\.listen\(\s*(\d{4,5})/g,/(?:127\.0\.0\.1|localhost):(\d{4,5})\b/g])
    for(const m of src.matchAll(re))k.add(m[1]);
  return k.size?[...k]:["egyedi:"+f];};
const feladat=probak.map(f=>({f,portok:portok(f)}));

if(van("--lista")){feladat.forEach(x=>console.log(`${x.f}  (port ${x.portok.join(", ")})`));console.log(`\n${feladat.length} próba`);process.exit(0);}
if(!feladat.length){console.error("Nincs futtatandó próba (nézd meg a --minta / --uj szűrőt).");process.exit(1);}

if(van("--check")){
  console.log("— tools/check.sh —");
  const r=cp.spawnSync("bash",[path.join(ROOT,"tools/check.sh")],{cwd:ROOT,encoding:"utf8"});
  process.stdout.write((r.stdout||"").split("\n").slice(-6).join("\n")+"\n");
  if(r.status!==0){console.log("✗ a check.sh bukott — a próbákat így is futtatom.\n");}}

/* a képernyőkép-mappa állapota előtte: mit szabad majd törölni */
const KEPEK=path.join(ROOT,"icons/screenshots");
const elotte=new Set(fs.existsSync(KEPEK)?fs.readdirSync(KEPEK):[]);
fs.mkdirSync(KI,{recursive:true});

const eredmeny=[];
const foglalt=new Set();
let kovetkezo=0,fut=0;
const t0=Date.now();
const mp=ms=>(ms/1000).toFixed(0)+" mp";
function indit(x){
  return new Promise(res=>{
    const kezd=Date.now();
    const naplo=path.join(KI,x.f.replace(/\.js$/,".txt"));
    const out=fs.openSync(naplo,"w");
    const ch=cp.spawn(process.execPath,[path.join(ROOT,"tools",x.f)],{cwd:ROOT,stdio:["ignore",out,out],
      env:Object.assign({},process.env,{MROOT:ROOT})});
    let lejart=false;
    const t=setTimeout(()=>{lejart=true;try{ch.kill("SIGKILL");}catch(e){}},IDO);
    ch.on("exit",kod=>{
      clearTimeout(t);fs.closeSync(out);
      let szoveg="";try{szoveg=fs.readFileSync(naplo,"utf8");}catch(e){}
      const sorok=szoveg.split("\n");
      const jo=sorok.filter(l=>/^\s*✓/.test(l)).length;
      /* a próba záró összegzője („✗ 3 hiba") nem külön állítás — csak a bukás jele */
      const zaro=l=>/^\s*✗\s*\d+\s*(hiba|bukott|sikertelen)/i.test(l);
      const rossz=sorok.filter(l=>/^\s*✗/.test(l)&&!zaro(l));
      const zaroVan=sorok.some(zaro);
      const bukott=lejart||kod!==0||rossz.length>0||zaroVan;
      const r={f:x.f,kod,lejart,jo,rossz:rossz.length,ido:Date.now()-kezd,naplo,
        elso:lejart?["(lejárt az idő)"]:rossz.length?rossz.slice(0,3).map(l=>l.trim().slice(0,220))
          :kod!==0?sorok.filter(Boolean).slice(-3).map(l=>l.trim().slice(0,220)):[]};
      r.bukott=bukott;
      eredmeny.push(r);
      console.log(`${bukott?"✗":"✓"} ${x.f.padEnd(52)} ${String(jo).padStart(3)}✓ ${String(rossz.length).padStart(2)}✗  ${mp(r.ido).padStart(6)}${lejart?"  LEJÁRT":kod!==0&&!rossz.length?"  kilépés "+kod:""}`);
      if(bukott)r.elso.forEach(l=>console.log("      "+l));
      res();});});}
function utemez(){
  return new Promise(kesz=>{
    const lep=()=>{
      if(kovetkezo>=feladat.length&&fut===0){kesz();return;}
      while(fut<J){
        /* a következő olyan feladat, aminek a portja szabad */
        const i=feladat.findIndex((x,k)=>k>=kovetkezo&&!x.indult&&x.portok.every(p=>!foglalt.has(p)));
        if(i<0)break;
        const x=feladat[i];x.indult=true;x.portok.forEach(p=>foglalt.add(p));fut++;
        while(kovetkezo<feladat.length&&feladat[kovetkezo].indult)kovetkezo++;
        indit(x).then(()=>{x.portok.forEach(p=>foglalt.delete(p));fut--;lep();});}};
    lep();});}

(async()=>{
  console.log(`🧪 ${feladat.length} próba · ${J} párhuzamosan · próbánként ≤${mp(IDO)} · napló: ${KI}\n`);
  await utemez();
  /* takarítás: a követett képernyőképek vissza, az újonnan keletkezettek ki */
  try{cp.spawnSync("git",["checkout","--","icons/screenshots/"],{cwd:ROOT});}catch(e){}
  try{if(fs.existsSync(KEPEK)){
    const kovetett=new Set(cp.spawnSync("git",["ls-files","icons/screenshots"],{cwd:ROOT,encoding:"utf8"}).stdout.split("\n").filter(Boolean).map(f=>path.basename(f)));
    fs.readdirSync(KEPEK).forEach(f=>{if(!elotte.has(f)&&!kovetett.has(f))fs.rmSync(path.join(KEPEK,f),{force:true});});}}catch(e){}
  const bukott=eredmeny.filter(r=>r.bukott);
  const ossz=eredmeny.reduce((a,r)=>a+r.jo,0);
  const osszRossz=eredmeny.reduce((a,r)=>a+r.rossz,0);
  const jelentes=[`🧪 MAGYAH regresszió · ${new Date().toISOString()} · ${mp(Date.now()-t0)}`,
    `${eredmeny.length-bukott.length}/${eredmeny.length} próba zöld · ${ossz} teljesült és ${osszRossz} bukott állítás`,""]
    .concat(bukott.length?["BUKOTT:"].concat(bukott.flatMap(r=>[`  ✗ ${r.f}${r.lejart?" (lejárt)":""} — ${r.naplo}`].concat(r.elso.map(l=>"      "+l)))):["✓ minden próba zöld"]);
  fs.writeFileSync(path.join(KI,"OSSZEGZES.txt"),jelentes.join("\n")+"\n");
  console.log("\n"+jelentes.join("\n"));
  process.exit(bukott.length?1:0);
})();
