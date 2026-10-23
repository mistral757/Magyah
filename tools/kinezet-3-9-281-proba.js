/* 🎨 3.9.281 — A KINÉZET-SZERKESZTŐ.

   KÉRÉS: „Építsük be a játékosok profilját szerkesztő felületet, hogy
   globálisan is, és aktuális karrierben is lehessen szerkeszteni a játékosok
   kinézetét. (A globálist a beállításokban lehetne, ahol a játékosok neveit
   is lehet módosítani.) És ha nem túl bonyolult, akkor lehetne ebbe
   beépíteni egy olyan motort, ami egy feltöltött fényképen felismeri az
   arcot és legenerálja az alapján a saját játékoskarakterizálónkkal a
   kinézetet."

   Amit mér:
     1. a felülírás rétegei: tisztítás (csak ismert mező, tartományban), a
        globális a böngészőben marad, a karrieré a mentésben, a karrieré
        mezőnként ráül a globálisra, és egy új karrierben nincs;
     2. a kép tényleg változik (a gyorsítótár kulcsa a felülírást is látja),
        a kor-függő vonás „a kora szerint" marad, ha nem rögzíted;
     3. a szerkesztő: megnyílik, a léptetés változtat az előnézeten, az
        „Eredeti" kiürít, a Mégse nem ment, a Mentés a választott rétegbe ír;
     4. a Beállítások → Adatbázis → „🎨 Kinézet" fül: keres, és a globális
        szerkesztőt nyitja;
     5. FOTÓBÓL: a saját generált arcainkat „lefényképezve" (vászonra rajzolva)
        az elemző visszaadja a bőrtónust (±1), a hajszínt, a kopaszságot, a
        szakállat; a tartalék arckereső megtalálja az arcot;
     6. nincs oldalhiba.
   Használat: node tools/kinezet-3-9-281-proba.js [kép-mappa] */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9281;
const KEP=process.argv[2]||null;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".png":"image/png",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.removeItem("faceMod30_0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);

  const r=await p.evaluate(()=>{
    const o={};
    const jp={n:"Teszt Elek",nat:"Magyarország",age:24};
    const alap=faceTraits(jp);
    /* 1. tisztítás */
    o.tiszta=faceModTisztit({haj:99,bor:-4,hajSzin:"3",kitalalt:1,fejpant:1,osz:null,fejW:40});
    /* globális */
    const u0=faceSvgUrl(jp,{mood:0});
    faceModSet("global",jp.n,{hajSzin:(alap.hajSzin+3)%9,haj:0,szakall:2});
    const g=faceTraits(jp);
    o.glob={hajSzin:g.hajSzin===(alap.hajSzin+3)%9,haj:g.haj===0,sz:g.szakall===2,
      tarol:!!JSON.parse(localStorage.getItem("faceMod30_0")||"{}")[jp.n],
      kepValt:faceSvgUrl(jp,{mood:0})!==u0,
      korSzerint:g.osz===alap.osz&&g.kopas===alap.kopas};
    /* karrier: ráül a globálisra, mezőnként */
    const fmRegi=S.faceMod;
    S.faceMod={};
    faceModSet("karrier",jp.n,{haj:15});
    const k=faceTraits(jp);
    o.karr={haj:k.haj===15,hajSzinGlob:k.hajSzin===(alap.hajSzin+3)%9,mentve:!!(S.faceMod&&S.faceMod[jp.n])};
    /* egy új karrierben nincs */
    S.faceMod=undefined;
    const n=faceTraits(jp);o.ujKarr={haj:n.haj===0};   /* csak a globális (kopasz) él */
    /* 3. a szerkesztő */
    S.faceMod=fmRegi;
    fedNyit(jp,{csakGlobal:true});
    const m=document.getElementById("fedModal");
    o.ed={nyitva:!m.classList.contains("hide"),sorok:m.querySelectorAll(".fedSor").length,reteg:_fed.scope};
    const src0=document.getElementById("fedKep").src;
    m.querySelector('[data-fk="hajSzin"][data-fd="1"]').click();
    o.ed.lep=document.getElementById("fedKep").src!==src0&&_fed.vazlat.hajSzin===((alap.hajSzin+4)%9);
    m.querySelector('[data-fk="arc"][data-fd="1"]').click();
    o.ed.arc=_fed.vazlat.fejW!=null;
    document.getElementById("fedEredeti").click();
    o.ed.eredeti=Object.keys(_fed.vazlat).length===0;
    m.querySelector('[data-fk="szakall"][data-fd="1"]').click();
    document.getElementById("fedMegse").click();
    o.ed.megse=m.classList.contains("hide")&&faceTraits(jp).szakall===2;
    fedNyit(jp,{csakGlobal:true});
    document.getElementById("fedEredeti").click();
    m.querySelector('[data-fk="szemSzin"][data-fd="1"]').click();
    const vart=_fed.vazlat.szemSzin;
    document.getElementById("fedMent").click();
    const t=faceTraits(jp);
    o.ed.ment=t.szemSzin===vart&&t.haj===alap.haj&&JSON.stringify(faceModGlobal()[jp.n])===JSON.stringify({szemSzin:vart});
    /* minden léptetés körbeér, nem dob hibát */
    fedNyit(jp,{csakGlobal:true});let lephiba=null;
    try{fedSorok().forEach(s=>{for(let i=0;i<s.opt.length+1;i++)fedLep(s.k,1);});fedRajz();}catch(e){lephiba=String(e);}
    o.ed.korbe=!lephiba;o.ed.lephiba=lephiba;
    document.getElementById("fedMegse").click();
    faceModSet("global",jp.n,{});
    o.ed.torles=!faceModGlobal()[jp.n]&&faceTraits(jp).szemSzin===alap.szemSzin;
    /* 4. a Beállítások fül */
    openSquadBrowser(false);
    document.getElementById("squadModeFaces").click();
    const ss=document.getElementById("squadSearch");ss.value="mess";ss.dispatchEvent(new Event("input"));
    const gomb=document.querySelector("#squadModalBody button[data-fmn]");
    o.fül={sorok:document.querySelectorAll("#squadModalBody button[data-fmn]").length,arc:!!document.querySelector("#squadModalBody img.faceImg")};
    if(gomb){gomb.click();o.fül.nyit=!document.getElementById("fedModal").classList.contains("hide")&&_fed.scope==="global"&&!_fed.vanKarrier;
      document.getElementById("fedMegse").click();}
    closeHomeModal("squadModal");
    /* 3b. 3.9.285 — helyben mentés, átmentés a globálisba, ragadós arckép */
    {const gmR=gameMode,cpR=careerPool,fmR=S.faceMod;
     gameMode="career";if(!careerPool)careerPool={};S.faceMod={};
     const jp2={n:"Átment Elek",nat:"Magyarország",age:25};
     faceModSet("global",jp2.n,{haj:0});
     fedNyit(jp2);
     const m=document.getElementById("fedModal");
     const all=()=>document.getElementById("fedAllapot").textContent;
     const x={reteg:_fed.scope,atLatszik:!document.getElementById("fedAtRow").classList.contains("hide"),gombBezar:document.getElementById("fedMegse").textContent};
     m.querySelector('[data-fk="szakall"][data-fd="1"]').click();
     x.piszkos=/Nem mentett/.test(all())&&document.getElementById("fedMegse").textContent==="Mégse";
     const szk=_fed.vazlat.szakall;
     document.getElementById("fedMent").click();
     x.mentNyitva=!m.classList.contains("hide")&&/Elmentve/.test(all())&&document.getElementById("fedMegse").textContent==="Bezárás";
     x.karrMentve=JSON.stringify(S.faceMod[jp2.n])===JSON.stringify({szakall:szk});
     m.querySelector('[data-fk="szemSzin"][data-fd="1"]').click();   /* még nem mentett lépés is átmegy */
     const szem=_fed.vazlat.szemSzin;
     const kepElotte=faceTraits(jp2);
     document.getElementById("fedAtment").click();
     const G=faceModGlobal()[jp2.n]||{};
     x.at=G.haj===0&&G.szakall===szk&&G.szemSzin===szem&&!S.faceMod[jp2.n]&&/Átmentve/.test(all());
     const t2=faceTraits(jp2);
     x.kepUgyanaz=t2.haj===0&&t2.szakall===szk&&t2.szemSzin===szem;
     /* egy új karrierben (üres karrier-réteg) is így néz ki */
     S.faceMod={};const t3=faceTraits(jp2);x.ujKarrierben=t3.szakall===szk&&t3.szemSzin===szem;
     /* a globális rétegben nincs átmentés-gomb */
     fedRetegValt("global");x.globalNincsAt=document.getElementById("fedAtRow").classList.contains("hide");
     /* ragadós arckép: a kép a görgető doboz tetején marad */
     const kep=m.querySelector(".fedKep");x.sticky=getComputedStyle(kep).position==="sticky";
     const gd=m.querySelector(".fedKartya>div[style*=overflow]");gd.scrollTop=gd.scrollHeight;
     const rk=kep.getBoundingClientRect(),rg=gd.getBoundingClientRect();
     x.tetejen=gd.scrollTop>0?Math.abs(rk.top-rg.top)<2:"nem görget";
     document.getElementById("fedMegse").click();
     faceModSet("global",jp2.n,{});
     gameMode=gmR;careerPool=cpR;S.faceMod=fmR;
     o.ment285=x;}
    return o;});
  console.log("=== 1-2. a rétegek ===");
  ok(JSON.stringify(r.tiszta)===JSON.stringify({bor:0,hajSzin:3,haj:18,fejW:29,fejpant:true}),"tisztítás: csak ismert mező, tartományban",r.tiszta);
  ok(Object.values(r.glob).every(Boolean),"globális: a vonás átíródik, a böngészőben tárolva, a kép megváltozik, a kor-függő vonás marad",r.glob);
  ok(Object.values(r.karr).every(Boolean),"karrier: a mentésbe kerül, mezőnként ráül a globálisra",r.karr);
  ok(r.ujKarr.haj,"egy másik karrierben csak a globális él",r.ujKarr);
  console.log("=== 3. a szerkesztő ===");
  ok(r.ed.nyitva&&r.ed.sorok===16&&r.ed.reteg==="global","megnyílik, 16 vonás, beállításokból globális",r.ed);
  ok(r.ed.lep&&r.ed.arc,"a léptetés változtat (az előnézet is), az arcforma is",r.ed);
  ok(r.ed.eredeti&&r.ed.megse,"az „Eredeti” kiürít, a Mégse nem ment",r.ed);
  ok(r.ed.ment&&r.ed.torles,"a Mentés pontosan a vázlatot írja; a törlés visszaadja a generált arcot",r.ed);
  ok(r.ed.korbe,"minden vonás minden értéke körbeléptethető",r.ed.lephiba);
  {const x=r.ment285;
   ok(x.reteg==="karrier"&&x.atLatszik&&x.gombBezar==="Bezárás"&&x.piszkos,"3.9.285: karrierben az átmentés-gomb kint; a nem mentett változás jelezve (Mégse)",x);
   ok(x.mentNyitva&&x.karrMentve,"3.9.285: a Mentés helyben rögzít, az ablak nyitva marad, „Elmentve”",x);
   ok(x.at&&x.kepUgyanaz&&x.ujKarrierben&&x.globalNincsAt,"3.9.285: átmentés a globálisba — a látszó kinézet (a nem mentett lépéssel), a karrier-réteg kiürül, a kép nem változik, új karrierben is él",x);
   ok(x.sticky&&x.tetejen===true,"3.9.285: görgetéskor az arckép a doboz tetején marad",x);}
  console.log("=== 4. a Beállítások fül ===");
  ok(r.fül.sorok>0&&r.fül.arc&&r.fül.nyit,"keres, arcképet mutat, a globális szerkesztőt nyitja",r.fül);

  /* 5. FOTÓBÓL — a saját arcainkon */
  const f=await p.evaluate(async()=>{
    const minta=[
      {n:"Fotó Afro",nat:"Nigéria",age:24,ov:{bor:8,hajSzin:0,haj:10,szakall:-1,osz:0,kopas:0}},
      {n:"Fotó Szőke",nat:"Svédország",age:28,ov:{bor:1,hajSzin:5,haj:2,szakall:1,osz:0,kopas:0}},
      {n:"Fotó Kopasz",nat:"Olaszország",age:33,ov:{bor:3,hajSzin:1,haj:0,szakall:-1,osz:0,kopas:0}},
      {n:"Fotó Hosszú",nat:"Argentína",age:25,ov:{bor:3,hajSzin:1,haj:15,szakall:-1,osz:0,kopas:0}},
      {n:"Fotó Barna",nat:"Spanyolország",age:26,ov:{bor:4,hajSzin:2,haj:2,szakall:-1,osz:0,kopas:0}},
      {n:"Fotó Sötét",nat:"Brazília",age:27,ov:{bor:6,hajSzin:0,haj:1,szakall:0,osz:0,kopas:0}}];
    const out=[];
    for(const m of minta){
      faceModSet("global",m.n,m.ov);
      const T=faceTraits(m);
      const N=300,sc=N/100;
      const url=faceSvgUrl(m,{mood:0,bg:"#6d8fb0"});
      const img=await new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src=url;});
      const c=document.createElement("canvas");c.width=N;c.height=N;const g=c.getContext("2d");g.drawImage(img,0,0,N,N);
      const D=g.getImageData(0,0,N,N).data;
      const hy=T.fejTop+(44-T.fejTop)*0.36;
      const box={x:(50-T.fejW)*sc,y:hy*sc,w:2*T.fejW*sc,h:(T.allCsucs-hy)*sc};
      const E=fotoElemzes(D,N,N,box);
      const K=fotoArcKeres(D,N,N);
      const ix=Math.max(0,Math.min(box.x+box.w,K.x+K.w)-Math.max(box.x,K.x)),iy=Math.max(0,Math.min(box.y+box.h,K.y+K.h)-Math.max(box.y,K.y));
      const iou=(ix*iy)/(box.w*box.h+K.w*K.h-ix*iy);
      out.push({n:m.n,valo:m.ov,becs:{bor:E.ov.bor,hajSzin:E.ov.hajSzin,haj:E.ov.haj,szakall:E.ov.szakall},info:E.info,iou:Math.round(iou*100)/100,mod:K.mod});
      faceModSet("global",m.n,{});}
    return out;});
  console.log("=== 5. fotóból (a saját arcainkon) ===");
  f.forEach(x=>console.log("   ",x.n,"valódi",JSON.stringify(x.valo),"→ becslés",JSON.stringify(x.becs),"iou",x.iou,x.mod,JSON.stringify(x.info).slice(0,160)));
  const borOk=f.filter(x=>Math.abs(x.becs.bor-x.valo.bor)<=1).length;
  ok(borOk>=5,`bőrtónus ±1 fokon belül: ${borOk}/6`);
  const kop=f.find(x=>x.n==="Fotó Kopasz");
  ok(kop&&kop.becs.haj===0,"a kopasz fej kopasz",kop&&kop.becs);
  const hajNemKop=f.filter(x=>x.valo.haj!==0);
  const szinOk=hajNemKop.filter(x=>x.becs.haj===1||Math.abs(x.becs.hajSzin-x.valo.hajSzin)<=1).length;
  ok(szinOk>=4,`hajszín (a skálán ±1): ${szinOk}/${hajNemKop.length}`);
  const hossz=f.find(x=>x.n==="Fotó Hosszú");
  ok(hossz&&hossz.becs.haj===15,"a hosszú haj hosszú",hossz&&hossz.becs);
  const afro=f.find(x=>x.n==="Fotó Afro");
  ok(afro&&[9,10,11,4].indexOf(afro.becs.haj)>=0,"az afró magas haj",afro&&afro.becs);
  const szOk=f.filter(x=>(x.becs.szakall>=0)===(x.valo.szakall>=0)).length;
  ok(szOk>=5,`arcszőrzet van/nincs: ${szOk}/6`);
  const keres=f.filter(x=>x.iou>=0.4).length;
  ok(keres>=4,`a tartalék arckereső megtalálja az arcot (átfedés ≥ 40%): ${keres}/6`,f.map(x=>x.iou));

  if(KEP){
    fs.mkdirSync(KEP,{recursive:true});
    await p.evaluate(()=>{fedNyit({n:"Lionel Messi",nat:"Argentína",age:24},{csakGlobal:true});});
    await p.waitForTimeout(400);
    await p.screenshot({path:path.join(KEP,"kinezet-szerkeszto.png")});
    await p.evaluate(()=>document.getElementById("fedMegse").click());}
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
