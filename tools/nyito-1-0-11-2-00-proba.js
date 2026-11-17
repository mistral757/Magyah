/* 🎬 1.0.11.2.00 — A NYITÓKÉPERNYŐ, MIND AZ ÖT TÉMÁBAN MÁS.

   KIMONDOTT KÉRÉS: „Készíts egy nyitó (splash) töltőképernyőt, amely a játék
   megnyitásakor jön be, a kezdőlap előtt … Mind az 5 témában más … Ne lassítsd
   a betöltést … Visszatérő megnyitásnál legyen visszafogott … A „kevesebb
   mozgás" beállításnál mozgás nélkül jelenjen meg."

   Amit mér:
     1. forrás: a nyitó a <body> legelső eleme, a blokk 100 kB alatt, külső
        kérést nem indít; a nagy szkript a mentés betöltése UTÁN jelez; a
        <head> a téma címbetűjét előre kéri, és mind az öt fájl létezik;
     2. mind az öt témában: a nyitó már a <body> megjelenésekor ott van, a JÓ
        témában (villanás nélkül); az öt képernyő szerkezete különböző;
        betöltés után eltűnik, kikerül a DOM-ból, és a kezdőlap Karrier-gombja
        koppintható; álló és fekvő nézetben sem lóg ki a tartalma;
     3. az első indulás (nincs mentett téma) a Reflektoré, teljes hosszal;
        a második már rövidített (0,5 mp-es minimum);
     4. „kevesebb mozgás": a nyitón egyetlen animáció sem fut, és átmenet
        nélkül tűnik el;
     5. koppintásra azonnal eltűnik, és a koppintás NEM jut át a kezdőlapra;
     6. ha a „kész" jelzés nem jönne, legkésőbb 6 mp után magától eltűnik;
     7. nem nyit hangkártyát (kattintás nélkül semmi nem szólhat);
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9613;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json",".json":"application/json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const TEMAK=["reflektor","dark","paper","noir","pixel"];
const GYOKER={reflektor:"nyR",dark:"nyD",paper:"nyP",noir:"nyN",pixel:"nyX"};

console.log("\n— 1. A FORRÁS —");
{
  const a=html.indexOf("<!-- ═══════════ 🎬 A NYITÓKÉPERNYŐ"),v=html.indexOf("</script>",a)+9;
  const blokk=html.slice(a,v);
  ok(a>0&&/^<body>\s*$/.test(html.slice(html.lastIndexOf("<body>",a),a)),"a nyitó a <body> legelső eleme");
  ok(Buffer.byteLength(blokk)<100000,"a blokk 100 kB alatt (mind az öt képernyő együtt)",Buffer.byteLength(blokk));
  ok(!/https?:\/\//.test(blokk.replace(/http:\/\/www\.w3\.org\/2000\/svg/g,"")),"külső kérést nem indít (az SVG-névtéren kívül nincs URL)");
  const ki=html.indexOf("window.nyitoKesz();",v),men=html.indexOf("initSaveSystem();",v);
  ok(ki>men&&men>0,"a „kész” jelzés a mentés betöltése (initSaveSystem) után jön");
  ok(/setTimeout\(function\(\)\{eltunik\("biztonsag"\);\},6000\)/.test(blokk),"van 6 mp-es biztonsági idő");
  const betu=(html.match(/var BETU=\{([^}]*)\}/)||[])[1]||"";
  const fajlok=[...betu.matchAll(/(\w+):"([\w-]+)"/g)];
  ok(fajlok.length===5&&fajlok.every(m=>TEMAK.includes(m[1])&&fs.existsSync(path.join(ROOT,"fonts",m[2]+".woff2"))),
     "a <head> mind az öt téma címbetűjét előre kérheti, és a fájlok léteznek",fajlok.map(m=>m[1]+":"+m[2]));
}

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const errs=[];
  const URL=`http://127.0.0.1:${PORT}/`;
  /* o.tema: mentett téma (null = első indulás) · o.latta: volt már nyitó · o.blokk: a „kész" jelzés letiltva */
  const lap=async(o,meret,reduced)=>{
    const ctx=await b.newContext({viewport:meret||{width:430,height:900},reducedMotion:reduced?"reduce":"no-preference"});
    await ctx.addInitScript(o=>{
      if(!sessionStorage.getItem("__p")){sessionStorage.setItem("__p","1");
        if(o.tema)localStorage.setItem("theme30_0",o.tema);
        if(o.latta)localStorage.setItem("nyitoLatta30_0","1");}
      /* a hangkártya-nyitás számlálója */
      window.__ac=0;for(const k of ["AudioContext","webkitAudioContext"]){const C=window[k];if(!C)continue;
        window[k]=function(...a){window.__ac++;return new C(...a);};window[k].prototype=C.prototype;}
      if(o.blokk)Object.defineProperty(window,"nyitoKesz",{configurable:true,get(){return function(){};},set(){}});
      /* a nyitó a <body> megjelenésekor */
      window.__korai=null;
      new MutationObserver((_,ob)=>{const n=document.getElementById("nyito");
        if(n&&n.className&&window.__korai===null){window.__korai={cls:n.className,tema:document.documentElement.getAttribute("data-theme"),
          nagy:typeof window.applyTheme==="function"};ob.disconnect();}}).observe(document,{childList:true,subtree:true,attributes:true});
    },o);
    const p=await ctx.newPage();p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    return {ctx,p};};
  const hasznalhato=p=>p.evaluate(()=>{const b=document.getElementById("mpSoloBtn");const r=b.getBoundingClientRect();
    const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e&&(e===b||b.contains(e));});

  console.log("\n— 2. MIND AZ ÖT TÉMÁBAN —");
  const html5={};
  for(const t of TEMAK){
    const {ctx,p}=await lap({tema:t});
    await p.goto(URL,{waitUntil:"load"});
    const r=await p.evaluate(()=>{const n=document.getElementById("nyito");return {korai:window.__korai,
      gyoker:n&&n.firstElementChild?n.firstElementChild.className:null,html:n?n.innerHTML:""};});
    html5[t]=r.html;
    ok(r.korai&&r.korai.cls.split(" ")[0]==="ny-"+(t)&&r.korai.tema===(t==="dark"?null:t)&&!r.korai.nagy&&r.gyoker==="nyK "+GYOKER[t],
       `${t}: a nyitó már a <body> megjelenésekor ott van, a jó témában, a nagy szkript előtt`,{korai:r.korai,gyoker:r.gyoker});
    await p.waitForFunction(()=>!document.getElementById("nyito"),null,{timeout:4000}).catch(()=>{});
    const v=await p.evaluate(()=>({van:!!document.getElementById("nyito"),N:window.NYITO,ac:window.__ac}));
    const h=await hasznalhato(p);
    ok(!v.van&&v.N.mod==="kesz"&&v.N.ki>=v.N.min-30&&v.N.ki<=Math.max(v.N.kesz,v.N.min)+60&&h,
       `${t}: betöltés után eltűnik (a jelzéskor, de nem a ${v.N.min} ms-os minimum előtt), a Karrier-gomb koppintható`,{N:v.N,hasznalhato:h});
    ok(v.ac===0,`${t}: nem nyitott hangkártyát`,v.ac);
    await ctx.close();}
  {const k=Object.values(html5);const egyedi=new Set(k).size;
   ok(egyedi===5&&k.every(x=>x.length>200),"az öt képernyő szerkezete mind különböző",k.map(x=>x.length));}

  console.log("\n— 2b. ÁLLÓ ÉS FEKVŐ: NEM LÓG KI —");
  for(const [nev,m] of [["álló 360",{width:360,height:740}],["álló 430",{width:430,height:900}],["fekvő 844×390",{width:844,height:390}],["asztali",{width:1280,height:800}]]){
    const rossz={};
    for(const t of TEMAK){
      const {ctx,p}=await lap({tema:t,blokk:true},m);
      await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(1300);
      const r=await p.evaluate(()=>{const n=document.getElementById("nyito");if(!n)return ["nincs nyitó"];
        const o=[];n.querySelectorAll(".sav b,.cim,.tx,.lap,.belyeg,.doboz,.eredm,.al,.ld").forEach(e=>{const r=e.getBoundingClientRect();
          if(r.width&&(r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1))o.push(e.className+" "+Math.round(r.left)+","+Math.round(r.top)+"→"+Math.round(r.right)+","+Math.round(r.bottom));});
        return o;});
      if(r.length)rossz[t]=r;
      await ctx.close();}
    ok(Object.keys(rossz).length===0,`${nev}: egyik téma nyitójának tartalma sem lóg ki`,rossz);}

  console.log("\n— 3. ELSŐ ÉS VISSZATÉRŐ INDULÁS —");
  {
    const ctx=await b.newContext({viewport:{width:430,height:900}});
    const p=await ctx.newPage();p.on("pageerror",e=>errs.push(String(e)));
    await p.goto(URL,{waitUntil:"load"});
    const e1=await p.evaluate(()=>({N:window.NYITO,t:document.documentElement.getAttribute("data-theme")}));
    ok(e1.t==="reflektor"&&e1.N.tema==="reflektor"&&!e1.N.rovid&&e1.N.min===1200,"első indulás (nincs mentett téma): a Reflektor nyitója, teljes hosszal",e1);
    await p.waitForTimeout(1500);
    await p.reload({waitUntil:"load"});
    const e2=await p.evaluate(()=>({N:window.NYITO,cls:(document.getElementById("nyito")||{}).className||"(már eltűnt)"}));
    ok(e2.N.rovid&&e2.N.min===500,"második indulás: rövidített, 0,5 mp-es minimum",e2);
    await ctx.close();
  }

  console.log("\n— 4. KEVESEBB MOZGÁS —");
  for(const t of ["reflektor","noir","pixel"]){
    const {ctx,p}=await lap({tema:t,blokk:true},null,true);
    await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(250);
    const r=await p.evaluate(()=>{const n=document.getElementById("nyito");
      const an=document.getAnimations().filter(a=>{const x=a.effect&&a.effect.target;return x&&n&&(n===x||n.contains(x));});
      return {cls:n&&n.className,an:an.length,min:window.NYITO.min,szam:(document.getElementById("nyRszam")||{}).textContent||null};});
    ok(/csend/.test(r.cls)&&r.an===0&&r.min===600&&(t!=="reflektor"||r.szam==="30"),`${t}: álló kép, egyetlen animáció sem fut (a kész állapot látszik)`,r);
    await p.evaluate(()=>document.getElementById("nyito").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true})));
    const el=await p.evaluate(()=>!!document.getElementById("nyito"));
    await p.waitForTimeout(50);
    const el2=await p.evaluate(()=>!!document.getElementById("nyito"));
    ok(!el2,`${t}: átmenet nélkül tűnik el`,{rogton:el,utana:el2});
    await ctx.close();}

  console.log("\n— 5. KOPPINTÁS —");
  {
    const {ctx,p}=await lap({tema:"reflektor",blokk:true});
    await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(500);
    const hol=await p.evaluate(()=>{const r=document.getElementById("mpSoloBtn").getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
    /* a Karrier-gomb első koppintása az #unlockWelcome üdvözlő ablakot nyitja */
    const nyitva=()=>p.evaluate(()=>{const w=document.getElementById("unlockWelcome");
      return !!w&&!w.classList.contains("hide")&&getComputedStyle(w).display!=="none";});
    const elotte=await nyitva();
    await p.mouse.click(hol.x,hol.y);
    await p.waitForTimeout(700);
    const r=await p.evaluate(()=>({N:window.NYITO,van:!!document.getElementById("nyito"),
      otthon:!document.getElementById("mpEntry").classList.contains("hide")}));
    r.ablak=await nyitva();
    ok(r.N.mod==="koppintas"&&!r.van,"a koppintás azonnal eltünteti",r.N);
    ok(!elotte&&!r.ablak&&r.otthon,"a koppintás nem jutott át a Karrier-gombra (az üdvözlő ablak nem nyílt meg)",{elotte,utana:r.ablak});
    ok(await hasznalhato(p),"utána a Karrier-gomb koppintható");
    /* ellenpróba: a gomb valódi koppintása IGENIS nyit valamit — különben a
       fenti „nem jutott át" semmit sem bizonyítana */
    await p.mouse.click(hol.x,hol.y);await p.waitForTimeout(700);
    const u=await nyitva();
    ok(u===true,"ellenpróba: a nyitó NÉLKÜL ugyanez a koppintás megnyitja az üdvözlő ablakot",u);
    await ctx.close();
  }

  console.log("\n— 5b. AZ ELSŐ KOPPINTÁS A NYITÓ UTÁN (✨ BE, Reflektor) —");
  {
    /* a Reflektor „új oldal beúszik" animációja a betöltéskor látható nézetet
       nem érintheti: a vágása elnyelné a koppintást (így volt egy korábbi
       változatban: az első koppintás indította el) */
    const {ctx,p}=await lap({tema:"reflektor"});
    await ctx.addInitScript(()=>{try{localStorage.setItem("fxAnimOff30_0","0");}catch(e){}});
    await p.goto(URL,{waitUntil:"load"});
    await p.waitForFunction(()=>!document.getElementById("nyito"),null,{timeout:4000}).catch(()=>{});
    const fx=await p.evaluate(()=>document.documentElement.classList.contains("fxLive"));
    const hol=await p.evaluate(()=>{const r=document.getElementById("mpSoloBtn").getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
    await p.mouse.click(hol.x,hol.y);await p.waitForTimeout(600);
    const r=await p.evaluate(()=>{const w=document.getElementById("unlockWelcome");
      return {nyilt:!!w&&!w.classList.contains("hide")&&getComputedStyle(w).display!=="none",
        wipe:document.getAnimations().filter(a=>a.animationName==="refWipe").length};});
    ok(fx&&r.nyilt,"✨ BE mellett a nyitó utáni ELSŐ koppintás a Karrier-gombon célba ér",{fx,...r});
    await ctx.close();
  }

  console.log("\n— 6. BIZTONSÁGI IDŐ —");
  {
    const {ctx,p}=await lap({tema:"pixel",blokk:true});
    await p.goto(URL,{waitUntil:"load"});
    await p.waitForTimeout(2500);
    const k=await p.evaluate(()=>!!document.getElementById("nyito"));
    await p.waitForFunction(()=>!document.getElementById("nyito"),null,{timeout:6000}).catch(()=>{});
    const r=await p.evaluate(()=>({van:!!document.getElementById("nyito"),N:window.NYITO}));
    ok(k&&!r.van&&r.N.mod==="biztonsag"&&r.N.ki>=5900&&r.N.ki<6600,"a „kész” jelzés nélkül 6 mp után magától eltűnik",{kozben:k,N:r.N});
    await ctx.close();
  }

  console.log("\n— 8. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
