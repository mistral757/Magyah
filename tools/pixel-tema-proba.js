/* 🕹️ 3.9.165 — A PIXEL TÉMA.

   KIMONDOTT KÉRÉS: „Készíts egy tervet egy 4. téma stílusra, ami megjelenésben
   jobban illene ehhez a zenéhez… Egy klasszik pixelated verzió lenne ez.
   Nyugodtan lehet sarkos, de azért színes, és mindenképp piiiixxxeeel" — majd:
   „Mehet, a javaslataid szerint, a pixel-ikonokkal együtt!"

   Amit mér:
     1. a téma-listák szinkronja: a <head> ID-listája és SZIN-térképe, az
        applyTheme SZIN-térképe és a THEMES ugyanazt a négy témát ismeri;
     2. a betűk: a négy új szelet létezik, a @font-face rájuk mutat, a service
        worker előre cache-eli őket, és a Pixel témában TÉNYLEG betöltődnek —
        a magyar ő/ű is (latin-ext);
     3. a tokenek: minden jelentéshordozó szín ≥4,5:1 kontrasztú az alapon
        ÉS a panelen; a sarkok élesek;
     4. a kapcsolók: a Beállításokban csak Pixel témában látszanak, a CRT-sor
        kikapcsolása a hangulat-réteget tényleg leveszi, és újratöltés után
        is megmarad (a <head> teszi fel, festés előtt);
     5. a pixel-ikonok: a sprite-ok épek (12×12, csak palettaszín); az emoji
        cserélődik, a SZÖVEG VÁLTOZATLAN marad (textContent), az utólag
        beírt sor is cserélődik, más témára váltva minden visszafordul;
     6. az arcade-felirat: gólnál felvillan (a hang-horgon), más témában és a
        kapcsolóval kikapcsolva nem;
     7. a Konami-kód bármelyik témából a Pixelbe hoz;
     8. Pixel témában sem lóg ki a kezdőlap vízszintesen jobban, mint
        törtfehérben;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9197;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json",
  ".mp3":"audio/mpeg",".ogg":"audio/ogg"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};

/* ---- 1-2. FORRÁS-SZINTŰ ELLENŐRZÉSEK ---- */
const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(ROOT,"sw-1.js"),"utf8");
console.log("\n— 1. A TÉMA-LISTÁK SZINKRONJA —");
{
  const fej=(html.match(/var ID=\[([^\]]*)\], ALAP="(\w+)"/)||[]);
  const fejId=fej[1]?fej[1].replace(/"/g,"").split(","):[];
  const temak=[...html.matchAll(/\{id:"(\w+)",label:"[^"]*",desc:/g)].map(m=>m[1]);
  const szin=[...html.matchAll(/SZIN=\{([^}]*)\}/g)].map(m=>m[1]);
  const alap=(html.match(/const DEFAULT_THEME="(\w+)"/)||[])[1];
  ok(JSON.stringify(fejId)===JSON.stringify(temak)&&temak.includes("pixel"),"a <head> ID-listája = a THEMES (benne a pixel)",{fejId,temak});
  ok(szin.length===2&&szin[0]===szin[1]&&/pixel:"#1d2b53"/.test(szin[0]),"a két SZIN-térkép egyforma, a pixelé az éjkék #1d2b53",szin);
  ok(fej[2]===alap&&alap==="paper","az alapértelmezett téma változatlan: törtfehér",{fej:fej[2],alap});
}
console.log("\n— 2. A BETŰK —");
{
  const fajlok=["press-start-2p-latin","press-start-2p-latin-ext","pixelify-sans-latin","pixelify-sans-latin-ext"];
  const van=fajlok.filter(f=>{const a=path.join(ROOT,"fonts",f+".woff2");
    return fs.existsSync(a)&&fs.readFileSync(a).slice(0,4).toString()==="wOF2";});
  ok(van.length===4,"a négy szelet ott van, és valódi WOFF2",van);
  ok(fajlok.every(f=>html.includes(`url(/fonts/${f}.woff2)`)),"a @font-face mind a négyre mutat");
  ok(fajlok.every(f=>sw.includes(`"/fonts/${f}.woff2"`))&&/harminc-nulla-cache-v([6-9]|\d{2,})/.test(sw),
     "a service worker előre cache-eli őket, és a cache-név lépett (v6 vagy későbbi — 3.9.172: v7, a számjegy-betűvel)");
  const ofl=fs.readFileSync(path.join(ROOT,"fonts","OFL.txt"),"utf8");
  ok(/Press Start 2P/.test(ofl)&&/Pixelify Sans/.test(ofl),"a licenc-fájl mindkét családot felsorolja");
}
console.log("\n— 5a. A SPRITE-OK ÉPSÉGE —");
{
  const blokk=html.slice(html.indexOf("const PIX_PAL="),html.indexOf("const _pixSvg="));
  const PIX=new Function(blokk+";return {PIX_PAL,PIX_SPRITES};")();
  const rossz=[];
  for(const [k,g] of Object.entries(PIX.PIX_SPRITES)){
    if(g.length!==12)rossz.push(k+": "+g.length+" sor");
    g.forEach((r,i)=>{if(r.length!==12)rossz.push(k+"/"+i+": "+r.length);
      for(const c of r)if(c!=="."&&!PIX.PIX_PAL[c])rossz.push(k+"/"+i+": "+c);});}
  const n=Object.keys(PIX.PIX_SPRITES).length;
  ok(rossz.length===0&&n>=30,`${n} sprite, mind 12×12, csak palettaszínnel`,rossz.slice(0,5));
}

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  const nyit=async(tema)=>{
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.evaluate(t=>{try{localStorage.setItem("theme30_0",t);}catch(e){}},tema);
    await p.reload({waitUntil:"load"});
    await p.evaluate(()=>document.fonts.ready);
    await p.waitForTimeout(1200);};

  await nyit("pixel");
  /* ---- 2b. A BETŰK TÉNYLEG BETÖLTŐDNEK ---- */
  const bt=await p.evaluate(async()=>{
    await Promise.all([document.fonts.load('16px "Press Start 2P"',"MAGYAH őű"),
                       document.fonts.load('16px "Pixelify Sans"',"Győző őű"),
                       document.fonts.load('700 16px "Pixelify Sans"',"Győző őű")]);
    const betoltve=[...document.fonts].filter(f=>/Press Start|Pixelify/.test(f.family)&&f.status==="loaded")
      .map(f=>f.family.replace(/"/g,"")+" "+f.unicodeRange.slice(0,8));
    return {betoltve,
      ps:document.fonts.check('16px "Press Start 2P"',"őű"),
      px:document.fonts.check('16px "Pixelify Sans"',"őű"),
      body:getComputedStyle(document.body).fontFamily,
      cim:getComputedStyle(document.querySelector(".heTitle")).fontFamily};});
  ok(bt.ps&&bt.px&&bt.betoltve.length>=4,"a Pixel témában mindkét betű betöltődik, latin-ext szelettel együtt (ő/ű)",bt.betoltve);
  ok(/Pixelify Sans/.test(bt.body)&&/Press Start 2P/.test(bt.cim),"a törzs Pixelify Sans, a kezdőlap címe Press Start 2P",{body:bt.body,cim:bt.cim});

  /* ---- 3. TOKENEK: KONTRASZT, ÉLES SAROK ---- */
  console.log("\n— 3. SZÍNEK ÉS FORMA —");
  const k=await p.evaluate(()=>{
    const cs=getComputedStyle(document.documentElement);
    const hex=v=>{v=cs.getPropertyValue(v).trim();const n=parseInt(v.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
    const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);};
      return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
    const kr=(a,b)=>{const A=lum(a),B=lum(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05);};
    const alap=["--bg","--panel","--panel2"],sz=["--ink","--dim","--dim2","--gold","--grass","--red","--blue","--purple"];
    let min=99,hol="";
    for(const a of alap)for(const s of sz){const r=kr(hex(s),hex(a));if(r<min){min=r;hol=s+" / "+a;}}
    const card=document.querySelector(".heWay")||document.querySelector(".card");
    const btn=document.getElementById("mpSoloBtn");
    return {min:Math.round(min*100)/100,hol,
      radCard:getComputedStyle(card).borderTopLeftRadius,radBtn:getComputedStyle(btn).borderTopLeftRadius};});
  ok(k.min>=4.5,"minden jelentéshordozó szín ≥4,5:1 az alapon, a panelen és a panel2-n is",k);
  ok(k.radCard==="0px"&&k.radBtn==="0px","a sarkok élesek (panel, gomb)",{card:k.radCard,btn:k.radBtn});

  /* ---- 4. KAPCSOLÓK ---- */
  console.log("\n— 4. A KAPCSOLÓK —");
  const kp=await p.evaluate(()=>{
    const r={};
    openSettingsModal(true);
    const gombok=[...document.querySelectorAll("#themeModal .pixOpt")];
    r.db=gombok.length;r.mind_be=gombok.every(g=>g.getAttribute("aria-pressed")==="true");
    r.glow_elotte=getComputedStyle(document.body,"::after").opacity;
    gombok.find(g=>g.dataset.cls==="pixCrtOff").click();
    r.glow_utana=getComputedStyle(document.body,"::after").opacity;
    r.osztaly=document.documentElement.classList.contains("pixCrtOff");
    r.tarolva=localStorage.getItem("pixCrtOff30_0");
    r.felirat=[...document.querySelectorAll("#themeModal .pixOpt")].find(g=>g.dataset.cls==="pixCrtOff").textContent.includes("KI");
    return r;});
  ok(kp.db===4&&kp.mind_be,"négy kapcsoló a Beállításokban, alapból mind BE",kp);
  ok(+kp.glow_elotte>0&&+kp.glow_utana===0&&kp.osztaly&&kp.tarolva==="1"&&kp.felirat,
     "a CRT-sorok kikapcsolása a hangulat-réteget tényleg leveszi, és eltárolódik",kp);
  await p.reload({waitUntil:"load"});await p.waitForTimeout(800);
  const ujra=await p.evaluate(()=>({o:document.documentElement.classList.contains("pixCrtOff"),
    g:getComputedStyle(document.body,"::after").opacity}));
  ok(ujra.o&&+ujra.g===0,"újratöltés után is ki marad (a <head> festés előtt felteszi)",ujra);
  const papir=await p.evaluate(()=>{pixOptSet("pixCrtOff",true);applyTheme("paper");openSettingsModal(true);
    const r={db:document.querySelectorAll("#themeModal .pixOpt").length};closeHomeModal("themeModal");applyTheme("pixel");return r;});
  ok(papir.db===0,"más témában a kapcsolók nem látszanak",papir);

  /* ---- 5. PIXEL-IKONOK ---- */
  console.log("\n— 5. PIXEL-IKONOK —");
  const ik=await p.evaluate(async()=>{
    const r={};
    const varj=ms=>new Promise(x=>setTimeout(x,ms));
    const gomb=document.getElementById("homeSettingsBtn");
    r.db=document.querySelectorAll(".pxI").length;
    r.gomb_sprite=!!gomb.querySelector(".pxI svg");
    r.gomb_szoveg=gomb.textContent.trim();
    r.gomb_meret=Math.round(gomb.querySelector(".pxI").getBoundingClientRect().width);
    /* utólag beírt sor — ahogy a napló ír */
    const d=document.createElement("div");d.id="pxProba";
    d.innerHTML="45' ⚽ Gól! és egy 🟨 sárga, meg egy ⚠️ figyelmeztetés";
    document.body.appendChild(d);
    const eredeti=d.textContent;
    await varj(150);
    r.uj_db=d.querySelectorAll(".pxI").length;
    r.uj_szoveg_egyezik=d.textContent===eredeti;
    r.uj_innerText=d.innerText.includes("⚽")&&d.innerText.includes("⚠️");
    /* helyben átírt szöveg (characterData) */
    const t=document.createElement("span");t.textContent="semmi";d.appendChild(t);
    await varj(80);t.firstChild.nodeValue="most 🔥 van";await varj(150);
    r.chardata=!!t.querySelector(".pxI");
    /* témaváltás: vissza kell fordulnia */
    applyTheme("paper");await varj(50);
    r.papir_db=document.querySelectorAll(".pxI").length;
    r.papir_szoveg=d.textContent===eredeti+"most 🔥 van";
    applyTheme("pixel");await varj(80);
    r.vissza_db=document.querySelectorAll(".pxI").length;
    /* a kapcsoló */
    pixOptSet("pixIconOff",false);await varj(50);
    r.kapcs_ki=document.querySelectorAll(".pxI").length;
    pixOptSet("pixIconOff",true);await varj(50);
    r.kapcs_be=document.querySelectorAll(".pxI").length;
    d.remove();
    return r;});
  ok(ik.db>10&&ik.gomb_sprite&&ik.gomb_szoveg==="⚙"&&ik.gomb_meret>=16,
     "betöltéskor az ismert emojik sprite-ra cserélődnek; a gomb szövege változatlan, a mérete a régi",ik);
  ok(ik.uj_db===3&&ik.uj_szoveg_egyezik&&ik.uj_innerText,"az utólag beírt sor is cserélődik (a ⚠️ variációs jellel együtt), a textContent és az innerText azonos marad",ik);
  ok(ik.chardata,"a helyben átírt szöveg is cserélődik");
  ok(ik.papir_db===0&&ik.papir_szoveg&&ik.vissza_db>10,"más témára váltva minden visszafordul, visszaváltva újra cserélődik",ik);
  ok(ik.kapcs_ki===0&&ik.kapcs_be>10,"a Pixel-ikonok kapcsolója ki- és visszakapcsol",ik);

  /* ---- 6. ARCADE-FELIRAT ---- */
  console.log("\n— 6. ARCADE-FELIRAT —");
  const fx=await p.evaluate(()=>{
    const r={};
    hang("gol");
    const el=document.getElementById("pixFx");
    r.gol=!!el&&el.classList.contains("on")&&/GÓÓÓL!/.test(el.textContent);
    r.nemBlokkol=el&&getComputedStyle(el).pointerEvents==="none";
    r.naplo=_hangNaplo[_hangNaplo.length-1]==="gol";      /* a hang-horog maga érintetlen */
    applyTheme("paper");r.papir=pixFx("gol");applyTheme("pixel");
    pixOptSet("pixFxOff",false);r.kapcsKi=pixFx("gyozelem");pixOptSet("pixFxOff",true);
    r.gyoz=pixFx("gyozelem")&&/GYŐZELEM!/.test(document.getElementById("pixFx").textContent);
    return r;});
  ok(fx.gol&&fx.nemBlokkol&&fx.naplo,"gólnál felvillan a GÓÓÓL! (a hang-horgon), és átengedi a koppintást",fx);
  ok(fx.papir===false&&fx.kapcsKi===false&&fx.gyoz,"más témában és kikapcsolva nem jelenik meg; győzelemnél a GYŐZELEM!",fx);

  /* ---- 7. KONAMI ---- */
  console.log("\n— 7. KONAMI-KÓD —");
  await p.evaluate(()=>applyTheme("noir"));
  for(const k of ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"])
    await p.keyboard.press(k);
  await p.waitForTimeout(200);
  const kon=await p.evaluate(()=>({t:document.documentElement.getAttribute("data-theme"),
    fx:(document.getElementById("pixFx")||{}).textContent||""}));
  ok(kon.t==="pixel"&&/30 ÉLET/.test(kon.fx),"a ↑↑↓↓←→←→BA a noirból a Pixelbe hoz, „30 ÉLET” felirattal",kon);

  /* ---- 8. VÍZSZINTES KILÓGÁS ---- */
  console.log("\n— 8. KILÓGÁS —");
  const lo={};
  for(const t of ["paper","pixel"]){
    await nyit(t);
    lo[t]=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);}
  ok(lo.pixel<=lo.paper,"a Pixel témában sem lóg ki a lap jobban, mint törtfehérben",lo);
  await p.screenshot({path:path.join(ROOT,"tools","ikon","kezdo-pixel.png"),fullPage:true});

  console.log("\n— 9. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
