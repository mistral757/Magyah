/* 👶📋🧑‍🎨 1.0.11.9.00 — IFJ. ARCÖRÖKLÉS, ARC MÁSOLÁSA, AZ ELLENFÉL JÁTÉKOSAI (stylist)

   KÉRÉS: „Szutykos stylist: lehessen arra rányomni, hogy ezúttal a játékosokat
   is be akarom állítani · Arc másolás meglévő játékosról · Ifj. verziók eleve
   kapják meg azt az arcot."

   Amit mér:
     1. az ifj. párok: Baggio → Roberto Baggio, Cantona → Eric Cantona,
        Di Stéfano → Alfredo Di Stéfano; a több jelöltes (Anderson) és a pár
        nélküli (Ashley Young) nem örököl;
     2. az ifj. változat arca azonos korban a párjáéval egyezik (a vonások);
        a pár beállított kinézete (globális) az ifj. változatra is átmegy;
     3. a „minta" (másolt arc): a vonások a forrásé, a saját beállítás rákerül;
        a kör (A→B→A) nem akasztja meg;
     4. a szerkesztő 📋 gombja: keresés, választás → a vázlat mintája, a kép a
        forrásé, a mentés a globálisba írja;
     5. a mez-ablakban stylist-módban „Ezúttal a játékosokat is beállítom" →
        az ellenfél kerete arcképekkel; a 🎨 a szerkesztőt nyitja; a „Kész"
        továbbenged;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9248;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.clear();}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{window.saveGame=()=>{};window.stylistSorKuld=async()=>({ok:true,db:0});});

  const r1=await p.evaluate(()=>{const M=faceIfjTerkep();
    return {Baggio:M["Baggio"],Cantona:M["Cantona"],Di:M["Di Stéfano"],Anderson:M["Anderson"]||null,Young:M["Ashley Young"]||null,db:Object.keys(M).length};});
  ok(r1.Baggio==="Roberto Baggio"&&r1.Cantona==="Eric Cantona"&&r1.Di==="Alfredo Di Stéfano","1a. az ifj. párok a megjelenített név szerint",r1);
  ok(!r1.Anderson&&!r1.Young,"1b. több jelölt vagy pár nélkül nincs öröklés",r1);

  const r2=await p.evaluate(()=>{
    const tisz=T=>{const o={};for(const k of Object.keys(T))if(k!=="sajat"&&k!=="mod")o[k]=T[k];return JSON.stringify(o);};
    const a=faceTraits({n:"Baggio",nat:"Olaszország",age:24}),b=faceTraits({n:"Roberto Baggio",nat:"Olaszország",age:24});
    const egyezik=tisz(a)===tisz(b);
    faceModSet("global","Roberto Baggio",{haj:5,hajSzin:7,szakall:2});
    const a2=faceTraits({n:"Baggio",nat:"Olaszország",age:24});
    const orokolt=a2.haj===5&&a2.hajSzin===7&&a2.szakall===2;
    const fiatal=faceTraits({n:"Baggio",nat:"Olaszország",age:19});
    faceModSet("global","Roberto Baggio",{});
    return {egyezik,orokolt,svg:faceSVG({n:"Baggio",nat:"Olaszország",age:24},64).indexOf("Baggio arcképe")>=0,kor:fiatal.age};});
  ok(r2.egyezik,"2a. az ifj. változat arca azonos korban a párjáé",r2);
  ok(r2.orokolt&&r2.svg&&r2.kor===19,"2b. a pár beállított kinézete is átmegy; a kor és a felirat a sajátja",r2);

  const r3=await p.evaluate(()=>{
    const tisz=T=>{const o={};for(const k of Object.keys(T))if(!["sajat","mod","minta"].includes(k))o[k]=T[k];return JSON.stringify(o);};
    const nev="Gulácsi Péter",src="Puskás Ferenc";
    faceModSet("global",nev,{minta:src});
    const a=faceTraits({n:nev,nat:"Magyarország",age:30}),b=faceTraits({n:src,nat:"Magyarország",age:30});
    const egyezik=tisz(a)===tisz(b);
    faceModSet("global",nev,{minta:src,szakall:4});
    const c=faceTraits({n:nev,nat:"Magyarország",age:30});
    const rakerul=c.szakall===4&&c.haj===b.haj;
    faceModSet("global","Lionel Messi",{minta:"Neymar"});faceModSet("global","Neymar",{minta:"Lionel Messi"});
    let kor=false;try{faceTraits({n:"Neymar",nat:"Brazília",age:25});faceSVG({n:"Lionel Messi",nat:"Argentína",age:25},48);kor=true;}catch(e){kor=String(e);}
    faceModSet("global","Lionel Messi",{});faceModSet("global","Neymar",{});faceModSet("global",nev,{});
    return {egyezik,rakerul,kor,tisztit:faceModTisztit({minta:"  <b>x</b> ",haj:3})};});
  ok(r3.egyezik,"3a. a másolt arc vonásai a forrásé",r3);
  ok(r3.rakerul&&r3.kor===true,"3b. a saját beállítás rákerül; a kör nem akaszt meg",r3);

  const r4=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    fedNyit({n:"Gulácsi Péter",nat:"Magyarország",age:30},{csakGlobal:true});await w(200);
    document.getElementById("fedMasolBtn").click();await w(100);
    const q=document.getElementById("fedMasolQ");q.value="Puskás F";q.dispatchEvent(new Event("input"));await w(200);
    const gombok=[...document.querySelectorAll("[data-fmasol]")].map(x=>x.getAttribute("data-fmasol"));
    const g=document.querySelector('[data-fmasol="Puskás Ferenc"]');if(g)g.click();await w(200);
    const al=document.getElementById("fedAl").textContent;
    const vazlat=JSON.stringify(_fed&&_fed.vazlat);
    document.getElementById("fedMent").click();await w(200);
    const G=faceModGlobal()["Gulácsi Péter"];
    fedBezar();faceModSet("global","Gulácsi Péter",{});
    return {gombok:gombok.slice(0,4),al:al.slice(-140),vazlat,G};});
  ok(r4.gombok.includes("Puskás Ferenc")&&/másolva/.test(r4.al)&&/Puskás/.test(r4.vazlat),"4a. 📋 keresés, választás → a vázlat mintája, az ablak kiírja",r4);
  ok(r4.G&&r4.G.minta==="Puskás Ferenc","4b. a mentés a globálisba írja a mintát",r4.G);

  const r5=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    stylistSet(true);
    const sq=SQUADS.find(x=>x.club&&x.season&&x.players&&x.players.length>=15);
    const nyers=`${sq.club} (${sq.season})`;
    window.mezEllenfelNev=()=>nyers;
    let tovabb=0;mezAblak(()=>{tovabb++;});await w(150);
    const gomb=[...document.querySelectorAll("#mezGombok button")].find(x=>/játékosokat is/.test(x.textContent));
    if(gomb)gomb.click();await w(250);
    const sorok=document.querySelectorAll("#mezTorzs [data-mezjat]").length;
    const kepek=document.querySelectorAll("#mezTorzs img.faceImg").length;
    const cim=document.getElementById("mezCim").textContent;
    const elso=document.querySelector("#mezTorzs [data-mezjat]");const en=elso&&elso.getAttribute("data-mezjat");
    if(elso)elso.click();await w(200);
    const fedNyitva1=fedNyitva(),fedCim=document.getElementById("fedCim").textContent;
    fedBezar();await w(150);
    const megvan=document.querySelectorAll("#mezTorzs [data-mezjat]").length;
    const kesz=[...document.querySelectorAll("#mezGombok button")].find(x=>/Kész/.test(x.textContent));
    if(kesz)kesz.click();await w(100);
    stylistSet(false);
    return {gomb:!!gomb,sorok,kepek,keret:sq.players.length,cim,fedNyitva1,fedCim,en,megvan,tovabb,
      rejtve:document.getElementById("mezModal").classList.contains("hide")};});
  ok(r5.gomb&&r5.sorok===r5.keret&&r5.kepek===r5.keret&&/játékosai/.test(r5.cim),"5a. a gomb az ellenfél teljes keretét nyitja, arcképekkel",r5);
  ok(r5.fedNyitva1&&r5.megvan===r5.keret,"5b. a 🎨 a szerkesztőt nyitja; bezárás után a lista frissül",r5);
  ok(r5.tovabb===1&&r5.rejtve,"5c. a „Kész” továbbenged (indulhat a meccs)",r5);

  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
