/* ◈ 1.0.11.1.00 — A REFLEKTOR TÉMA (az ötödik, és az új alapértelmezett).

   KIMONDOTT KÉRÉS: „Tervezz és építs egy új, ötödik megjelenési témát… messze
   áll a meglévő négytől… minden képernyő… WCAG AA kontraszt… a hang- és
   zenetéma, az élő háttér és a böngészősáv színe is illeszkedjen", majd a
   helyesbítés: „az új alapértelmezett téma legyen az új téma."

   Amit mér:
     1. a téma-listák szinkronja: a <head> ID-listája és SZIN-térképe, az
        applyTheme SZIN-térképe és a THEMES ugyanazt az öt témát ismeri, az
        alapértelmezett mindkét helyen a reflektor;
     2. a betűk: a négy szelet létezik és valódi WOFF2, a @font-face rájuk
        mutat, a service worker előre cache-eli őket (a cache-név lépett), a
        licenc-fájl felsorolja; a témában TÉNYLEG betöltődnek, a magyar ő/ű is,
        és a címbetű kövér marad ott is, ahol a szabály 400-as súlyt kér;
     3. a tokenek: minden szövegszín ≥4,5:1 az alapon ÉS a két panelen;
     4. A RÉGI NÉGY TÉMA VÁLTOZATLAN: a változóik bitre a régi értékek;
     5. az első indulás (nincs mentett téma) a Reflektor; a mentett téma
        (theme30_0) tovább él — aki törtfehérben volt, ott marad; ismeretlen
        érték az alapértelmezettre esik; nincs villanás (a téma már a <head>
        szkriptje után, a nagy script előtt áll);
     6. a kezdőlapi választó öt gombja és a ✨ gomb nem fedi egymást, és a
        lap nem lóg ki vízszintesen jobban, mint törtfehérben (álló és fekvő);
     7. a hangzás „auto" módban az „Esti rangadó" hangulat, SAJÁT kottával
        (a három menüdal saját dallam, a kotta ép, négyhangú akkordok; offline
        hangkártyán szólnak, nem torzítanak, a hangerejük a másik három lágy
        hangulatéval 3 dB-en belül); a többi hangulat a közös kottán marad;
        az élő háttér ki van festve, a böngészősáv színe a téma alapja;
     8. a fő képernyők megnyílnak (kezdőlap, beállítások, karrier-indítás,
        szezon, menetrend, kihívások, talizmánok, menedzsment, HUB és menü,
        taktika, meccs és lefújás), és a látható szövegek között nincs a
        témára jellemző kontraszthiba (fehér betű világos kiemelőszínen);
     9. a témaváltás oda-vissza ép marad (mind az öt, kétszer körbe);
    10. nincs oldalhiba;
    11. a saját animációk: ✨ BE mellett a gomb lenyomására gyűrű nyílik, az
        új oldal beúszik, az ablak „reflektorral" nyílik, a menü csoportjai
        beemelkednek, gólnál „alsó harmad" felirat jön, a témára váltva a
        stadion felkapcsol; „kevesebb mozgás" rendszerbeállítás mellett és
        kikapcsolt ✨-tel EGYIK SEM fut. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9611;
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
const sw=fs.readFileSync(path.join(ROOT,"sw-1.js"),"utf8");
const OT=["dark","paper","noir","pixel","reflektor"];

console.log("\n— 1. A TÉMA-LISTÁK SZINKRONJA —");
{
  const fej=(html.match(/var ID=\[([^\]]*)\], ALAP="(\w+)"/)||[]);
  const fejId=fej[1]?fej[1].replace(/"/g,"").split(","):[];
  const temak=[...html.matchAll(/\{id:"(\w+)",label:"[^"]*",desc:/g)].map(m=>m[1]);
  const szin=[...html.matchAll(/SZIN=\{([^}]*)\}/g)].map(m=>m[1]);
  const alap=(html.match(/const DEFAULT_THEME="(\w+)"/)||[])[1];
  ok(JSON.stringify(fejId)===JSON.stringify(temak)&&JSON.stringify(temak)===JSON.stringify(OT),"a <head> ID-listája = a THEMES = az öt téma",{fejId,temak});
  ok(szin.length===2&&szin[0]===szin[1]&&/reflektor:"#06141a"/.test(szin[0]),"a két SZIN-térkép egyforma, a reflektoré #06141a",szin);
  ok(fej[2]===alap&&alap==="reflektor","az alapértelmezett téma mindkét helyen a reflektor",{fej:fej[2],alap});
  ok(new RegExp('\\[data-theme="reflektor"\\]\\{\\s*--bg:#06141a').test(html),"a CSS változó-blokk megvan");
  ok(/FX_THEMES=new Set\(\[[^\]]*"reflektor"/.test(html),"az élő háttér listájában is ott van");
}
console.log("\n— 2. A BETŰK —");
{
  const fajlok=["exo-2-latin","exo-2-latin-ext","exo-2-cim-latin","exo-2-cim-latin-ext"];
  const meret={};
  const van=fajlok.filter(f=>{const a=path.join(ROOT,"fonts",f+".woff2");
    if(!fs.existsSync(a))return false;meret[f]=fs.statSync(a).size;
    return fs.readFileSync(a).slice(0,4).toString()==="wOF2";});
  const ossz=Object.values(meret).reduce((a,b)=>a+b,0);
  ok(van.length===4,"a négy szelet ott van, és valódi WOFF2",meret);
  ok(ossz<110000,"a négy szelet együtt 110 kB alatt",ossz);
  ok(fajlok.every(f=>html.includes(`url(/fonts/${f}.woff2)`)),"a @font-face mind a négyre mutat");
  ok(fajlok.every(f=>sw.includes(`"/fonts/${f}.woff2"`)),"a service worker előre cache-eli őket");
  const v=+(sw.match(/harminc-nulla-cache-v(\d+)/)||[])[1];
  ok(v>=9,"a cache-név lépett (v9 vagy későbbi)",v);
  const ofl=fs.readFileSync(path.join(ROOT,"fonts","OFL.txt"),"utf8");
  ok(/Exo 2 Project Authors/.test(ofl)&&/exo-2-cim-latin/.test(ofl)&&/MÓDOSÍTOTT/.test(ofl),"a licenc-fájl felsorolja, a módosított változatot is jelöli");
  ok(fs.existsSync(path.join(ROOT,"tools","reflektor","betu.py")),"a címbetű gyártó szkriptje a repóban van");
  ok(!/https?:\/\/(fonts\.googleapis|fonts\.gstatic|cdn)/.test(html.slice(0,html.indexOf("</style>"))),"külső betű- vagy CDN-kérés nincs");
}
console.log("\n— 3. A TOKENEK KONTRASZTJA —");
const lum=h=>{h=h.replace("#","");const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const kontr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
{
  const blokk=(html.match(/\[data-theme="reflektor"\]\{\s*(--bg:[\s\S]*?)\n\}/)||[])[1]||"";
  const V={};[...blokk.matchAll(/--([a-z0-9-]+):(#[0-9a-f]{6})/g)].forEach(m=>V[m[1]]=m[2]);
  const rossz=[];let min=99;
  for(const k of ["ink","dim","dim2","grass","gold","gold-dim","red","blue","purple","pos-gk","pos-df","pos-mf","pos-fw"])
    for(const b of ["bg","panel","panel2"]){const c=kontr(V[k],V[b]);min=Math.min(min,c);if(!(c>=4.5))rossz.push(`${k}/${b}: ${c.toFixed(2)}`);}
  ok(rossz.length===0,"mind a 13 szövegszín ≥4,5:1 az alapon és a két panelen (a leggyengébb: "+min.toFixed(2)+":1)",rossz);
  ok(kontr(V["badge-ink"],V.gold)>=7&&kontr(V["badge-ink"],V.grass)>=7,"a sötét jelvény-betű a volt és a zöld kiemelésen ≥7:1",
     {gold:+kontr(V["badge-ink"],V.gold).toFixed(1),grass:+kontr(V["badge-ink"],V.grass).toFixed(1)});
}
/* a régi négy téma befagyott változói (az 1.0.11.0.00 állapota) */
const REGI={
  dark:{"--bg":"#101011","--panel":"#19191b","--panel2":"#202023","--line":"#2b2b2e","--ink":"#eae7e1","--dim":"#8c897f","--dim2":"#5f5d56","--grass":"#4c8f63","--gold":"#c9a233","--red":"#b1504d","--blue":"#4d7fb0","--purple":"#8f7dc2","--turf-a":"#37764a","--radius":"10px","--badge-ink":"#111","--grain":"0","--glow":"0"},
  paper:{"--bg":"#efe9dd","--panel":"#e6dfd0","--panel2":"#dcd4c2","--line":"#c9bfa8","--ink":"#1a1712","--dim":"#5c564a","--dim2":"#847d6d","--grass":"#3d6b4a","--gold":"#7d5a0e","--red":"#a03e34","--blue":"#3a5f85","--purple":"#6a5a9a","--turf-a":"#37764a","--radius":"10px","--badge-ink":"#efe9dd","--grain":"1","--glow":"0"},
  noir:{"--bg":"#0b0b0c","--panel":"#141416","--panel2":"#1c1c1f","--line":"#313136","--ink":"#cbc9c4","--dim":"#8b8985","--dim2":"#5d5b58","--grass":"#b6bcb2","--gold":"#f7f5ee","--red":"#9b8a84","--blue":"#8f9aa4","--purple":"#a098a6","--turf-a":"#3a3a3c","--radius":"10px","--badge-ink":"#0b0b0c","--grain":"1","--glow":"1"},
  pixel:{"--bg":"#1d2b53","--panel":"#16214a","--panel2":"#22315f","--line":"#3b4b86","--ink":"#fff1e8","--dim":"#c2c3c7","--dim2":"#aea8cc","--grass":"#00e436","--gold":"#ffec27","--red":"#ff7088","--blue":"#3fb8ff","--purple":"#ff85b3","--turf-a":"#008751","--radius":"0px","--badge-ink":"#1d2b53","--grain":"1","--glow":"1"}};
const REGI_BETU={dark:["Archivo","Archivo Black"],paper:["Oswald","Anton"],noir:["Archivo","Anton"],pixel:["Magyah Pixszam","Magyah Pixszam"]};

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const errs=[];
  const lap=async(tema,meret)=>{
    const ctx=await b.newContext({viewport:meret||{width:430,height:900}});
    /* a „mentett téma": undefined = első indulás, semmi nincs eltéve */
    await ctx.addInitScript(t=>{try{if(!sessionStorage.getItem("__p")){sessionStorage.setItem("__p","1");
      if(t!==null)localStorage.setItem("theme30_0",t);localStorage.setItem("fxAnimOff30_0","1");}}catch(e){}},tema===undefined?null:tema);
    const p=await ctx.newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    return {ctx,p};};
  const URL=`http://127.0.0.1:${PORT}/`;

  console.log("\n— 4. A RÉGI NÉGY TÉMA VÁLTOZATLAN —");
  {
    const {ctx,p}=await lap("paper");
    await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(900);
    const mert=await p.evaluate(async(REGI)=>{
      const ki={};
      for(const t of Object.keys(REGI)){applyTheme(t);await new Promise(r=>setTimeout(r,60));
        const cs=getComputedStyle(document.documentElement);const e={};
        for(const k of Object.keys(REGI[t]))e[k]=cs.getPropertyValue(k).trim();
        e.body=cs.getPropertyValue("--font-body").split(",")[0].replace(/['"]/g,"").trim();
        e.disp=cs.getPropertyValue("--font-disp").split(",")[0].replace(/['"]/g,"").trim();
        ki[t]=e;}
      return ki;},REGI);
    for(const t of Object.keys(REGI)){
      const elter=Object.keys(REGI[t]).filter(k=>mert[t][k]!==REGI[t][k]).map(k=>`${k}: ${mert[t][k]}≠${REGI[t][k]}`);
      ok(elter.length===0&&mert[t].body===REGI_BETU[t][0]&&mert[t].disp===REGI_BETU[t][1],
         `${t}: a ${Object.keys(REGI[t]).length} változó és a két betű a régi`,elter.length?elter:undefined);}
    /* a régi témák forrás-blokkjai bitre egyeznek a befagyott értékekkel — a
       reflektor szabályai mind a saját [data-theme="reflektor"] szelektoruk alatt állnak */
    const forma=html.slice(html.indexOf("A REFLEKTOR TÉMA FORMÁJA"),html.indexOf("</style>"));
    const sorok=forma.split("\n").filter(s=>/\{/.test(s)&&!/^\s*(\/\*|\*)/.test(s)&&!/^\s/.test(s));
    /* megengedett: a téma szelektora, az élő-animáció kapcsolója a témán, a
       saját effekt-elemek (.refRing, #refFx, .refBoot), és a @-szabályok */
    const kilog=sorok.filter(s=>!/^(\[data-theme="reflektor"\]|html\.fxLive\[data-theme="reflektor"\]|\.refRing|#refFx|\.refBoot|body\.evaFut #refFx|@)/.test(s));
    ok(sorok.length>10&&kilog.length===0,`a formablokk mind a(z) ${sorok.length} szabálya a reflektor szelektora vagy a saját effekt-elemei alatt áll`,kilog.slice(0,3));
    await ctx.close();
  }

  console.log("\n— 5. ELSŐ INDULÁS, MENTETT TÉMA, VILLANÁS —");
  {
    /* első indulás: a téma már a <head> szkriptje után áll, a nagy script előtt */
    const {ctx,p}=await lap(undefined);
    await p.addInitScript(()=>{window.__korai=null;
      new MutationObserver((_,o)=>{if(document.body&&window.__korai===null){
        window.__korai={tema:document.documentElement.getAttribute("data-theme"),
          nagyScript:typeof window.applyTheme==="function",
          meta:(document.querySelector('meta[name="theme-color"]')||{}).content};o.disconnect();}})
        .observe(document,{childList:true,subtree:true});});
    await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(900);
    const e=await p.evaluate(()=>({korai:window.__korai,most:document.documentElement.getAttribute("data-theme"),
      mentve:localStorage.getItem("theme30_0"),bg:getComputedStyle(document.body).backgroundColor,
      meta:document.querySelector('meta[name="theme-color"]').content}));
    ok(e.korai&&e.korai.tema==="reflektor"&&e.korai.nagyScript===false,"első indulás: a <body> megjelenésekor már reflektor, a nagy script előtt (nincs villanás)",e.korai);
    ok(e.korai&&e.korai.meta==="#06141a"&&e.meta==="#06141a","a böngészősáv színe már ekkor a témáé",{korai:e.korai&&e.korai.meta,most:e.meta});
    ok(e.most==="reflektor"&&e.mentve==="reflektor"&&e.bg==="rgb(6, 20, 26)","betöltés után is reflektor, és el is menti",e);
    /* a forrás-HTML alapszíne (a meta) is a témáé: a szkript előtt se villanjon más */
    ok(/<meta name="theme-color" content="#06141a">/.test(html),"a <meta theme-color> kiinduló értéke is a téma alapja");
    await ctx.close();
    for(const [mentett,vart] of [["paper","paper"],["dark",null],["noir","noir"],["pixel","pixel"],["bordo","reflektor"],["reflektor","reflektor"]]){
      const {ctx,p}=await lap(mentett);
      await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(700);
      const r=await p.evaluate(()=>({a:document.documentElement.getAttribute("data-theme"),m:localStorage.getItem("theme30_0")}));
      ok(r.a===vart&&r.m===(vart||"dark"),`mentett „${mentett}” → ${vart||"dark (attribútum nélkül)"}`,r);
      /* újratöltés után is */
      await p.reload({waitUntil:"load"});await p.waitForTimeout(500);
      const r2=await p.evaluate(()=>document.documentElement.getAttribute("data-theme"));
      if(r2!==vart)ok(false,`„${mentett}” újratöltés után is megmarad`,r2);
      await ctx.close();}
  }

  console.log("\n— 2b. A BETŰK TÉNYLEG BETÖLTŐDNEK —");
  const {ctx,p}=await lap("reflektor");
  const varj=ms=>p.waitForTimeout(ms);
  const ev=async f=>{try{return await p.evaluate(f);}catch(e){errs.push("evaluate: "+String(e.message).split("\n")[0]);}};
  const kert=[];p.on("request",r=>{if(/\.woff2/.test(r.url()))kert.push(r.url().split("/").pop());});
  await p.goto(URL,{waitUntil:"load"});await varj(1300);
  {
    const f=await ev(async()=>{await document.fonts.ready;
      const t=document.querySelector(".heTitle"),cs=getComputedStyle(t);
      return {body:document.fonts.check("14px 'Exo 2'","Karrier"),bodyExt:document.fonts.check("14px 'Exo 2'","őű"),
        cim:document.fonts.check("40px 'Exo 2 Cim'","Magyah"),cimExt:document.fonts.check("40px 'Exo 2 Cim'","őŰ"),
        cimCsalad:cs.fontFamily.split(",")[0].replace(/['"]/g,""),suly:cs.fontWeight};});
    ok(f.body&&f.bodyExt&&f.cim&&f.cimExt,"a szöveg- és a címbetű betöltve, a magyar ő/ű is",f);
    ok(f.cimCsalad==="Exo 2 Cim"&&kert.some(x=>/exo-2-cim-latin\.woff2/.test(x)),"a főcím a kövér címbetűvel rajzol, pedig a szabálya 400-as súlyt kér",{csalad:f.cimCsalad,suly:f.suly});
    ok(!kert.some(x=>/press-start|pixelify|pixszam|oswald|anton/.test(x)),"a többi téma saját betűi nem töltődnek le fölöslegesen",kert);
  }

  console.log("\n— 6. A KEZDŐLAPI VÁLASZTÓ ÉS A SZÉLESSÉG —");
  {
    const g=await ev(()=>{const bs=[...document.querySelectorAll("#heTheme button")].map(b=>b.getBoundingClientRect());
      const fx=document.getElementById("heFxBtn").getBoundingClientRect(),pr=document.getElementById("mpProfileBtn").getBoundingClientRect();
      const utolso=bs[bs.length-1];
      return {db:bs.length,utolsoJobb:Math.round(utolso.right),fxBal:Math.round(fx.left),fxJobb:Math.round(fx.right),profilBal:Math.round(pr.left),
        aktiv:document.querySelector('#heTheme button[aria-pressed="true"]').getAttribute("aria-label")};});
    ok(g.db===5&&g.aktiv==="Reflektor","öt gomb, az aktív a Reflektor",g);
    ok(g.fxBal>=g.utolsoJobb+4&&g.fxJobb<=g.profilBal-4,"a ✨ gomb az ötödik gomb után áll, és nem ér a Profil-gombhoz",g);
    const szel=async(tema,meret)=>{const {ctx,p}=await lap(tema,meret);await p.goto(URL,{waitUntil:"load"});await p.waitForTimeout(800);
      const r=await p.evaluate(()=>{const v=document.querySelector("#mpEntry .mpView.on")||document.getElementById("mpEntry");
        const fx=document.getElementById("heFxBtn").getBoundingClientRect(),u=[...document.querySelectorAll("#heTheme button")].pop().getBoundingClientRect();
        return {sw:Math.max(document.documentElement.scrollWidth,v.scrollWidth),iw:innerWidth,res:Math.round(fx.left-u.right)};});
      await ctx.close();return r;};
    for(const [nev,m] of [["álló telefon",{width:390,height:844}],["fekvő telefon",{width:844,height:390}],["asztali",{width:1280,height:800}]]){
      const a=await szel("paper",m),r=await szel("reflektor",m);
      ok(r.sw<=a.sw+1&&r.res>=4,`${nev}: nem lóg ki jobban, mint törtfehérben, és a ✨ gomb a helyén`,{paper:a.sw,reflektor:r.sw,ablak:r.iw,res:r.res});}
  }

  console.log("\n— 7. HANG, ÉLŐ HÁTTÉR, BÖNGÉSZŐSÁV —");
  {
    const h=await ev(()=>{const r={};
      r.auto=hangBeall().csomag||"auto";r.csomag=hangCsomag();r.hangulat=hangHangulat();r.kulcs=hangZeneKulcs();
      const F=HANG_LAGY_HANGULAT.este;r.este=F?{nev:F.nev,tema:F.tema,dob:F.dob}:null;
      r.mind=["dark","paper","noir","pixel","reflektor"].map(t=>{applyTheme(t);return t+":"+(hangCsomag()==="lagy"?hangHangulat():"chip");});
      applyTheme("reflektor");
      r.fx=fxThemeReady();r.fxSzin=getComputedStyle(document.documentElement).getPropertyValue("--fxUs").trim();
      r.meta=document.querySelector('meta[name="theme-color"]').content;
      r.conf=typeof confettiColor==="function"?confettiColor("#c9a233","reflektor"):null;
      return r;});
    ok(h.csomag==="lagy"&&h.hangulat==="este"&&h.kulcs==="lagy:este","auto módban lágy hangzás, „este” hangulat",h);
    ok(h.este&&h.este.nev==="Esti rangadó"&&h.este.tema==="Reflektor","a hangulat-tábla sora megvan",h.este);
    ok(JSON.stringify(h.mind)===JSON.stringify(["dark:mozi","paper:napos","noir:jazz","pixel:chip","reflektor:este"]),"a másik négy téma hangja a régi",h.mind);
    ok(h.fx===true&&h.fxSzin==="#d6ff3f","az élő háttér ki van festve (volt mezek)",{fx:h.fx,szin:h.fxSzin});
    ok(h.meta==="#06141a","a böngészősáv színe váltáskor is a témáé",h.meta);
  }


  console.log("\n— 7b. A SAJÁT ZENE —");
  {
    const z=await ev(async()=>{
      const r={};
      const kotta={};
      for(const [k,D] of Object.entries(HANG_DALOK_ESTE)){const L=hangSor(D.lead);
        kotta[k]={utem:L.length/16,rossz:L.filter(x=>x&&!x.tart&&x.n==null).length,ch:D.ch.length,negy:D.ch.every(c=>c.length===4),
          sajat:D.lead!==HANG_DALOK_LAGY[k].lead};}
      r.kotta=kotta;r.kulcsok=Object.keys(HANG_DALOK_ESTE).sort().join()===Object.keys(HANG_DALOK_LAGY).sort().join();
      applyTheme("reflektor");r.este=hangLagyDal("fo",hangLagyF())===HANG_DALOK_ESTE.fo;
      r.tobbi=["dark","paper","noir"].map(t=>{applyTheme(t);return hangLagyDal("fo",hangLagyF())===HANG_DALOK_LAGY.fo;});
      const render=async(secs,fn)=>{const sr=22050,off=new OfflineAudioContext(2,Math.ceil(sr*secs),sr);
        const save={c:_hangCtx,b:_hangBus};_hangCtx=off;
        const m=off.createGain(),s=off.createGain(),zz=off.createGain();s.connect(m);zz.connect(m);m.connect(off.destination);
        _hangBus={master:m,sfx:s,zene:zz};s.gain.value=.55*.7;zz.gain.value=.45*.8;
        try{fn(s,zz);}finally{_hangCtx=save.c;_hangBus=save.b;}
        const buf=await off.startRendering();return {L:buf.getChannelData(0),R:buf.getChannelData(1)};};
      const stat=x=>{let pk=0,sq=0,nan=0;for(let i=0;i<x.L.length;i++){const l=x.L[i],rr=x.R[i];if(!isFinite(l)||!isFinite(rr)){nan++;continue;}
        pk=Math.max(pk,Math.abs(l),Math.abs(rr));sq+=l*l;}return {rms:+Math.sqrt(sq/x.L.length).toFixed(4),pk:+pk.toFixed(3),nan};};
      r.dal={};r.fo={};
      for(const t of ["dark","paper","noir","reflektor"]){applyTheme(t);const F=hangLagyF();
        for(const dk of (t==="reflektor"?Object.keys(HANG_DALOK_ESTE):["fo"])){
          const D=hangLagyDal(dk,F),STEP=60/(D.bpm*F.tempo)/4;
          const x=await render(14,(s,zz)=>{const bz=hangLagyBusz(zz,F);let tt=.05;for(let i=0;tt<12;i++){hangLagyLepes(D,i,tt,bz,F,STEP);tt+=STEP;}});
          const st=stat(x);if(t==="reflektor")r.dal[dk]=st;if(dk==="fo")r.fo[t]=st.rms;}}
      applyTheme("reflektor");
      return r;});
    ok(z.kulcsok&&Object.values(z.kotta).every(d=>Number.isInteger(d.utem)&&d.utem%d.ch===0&&d.rossz===0&&d.negy&&d.sajat),
       "a három menüdal saját dallam; a kotta ép, egész ütemek, négyhangú akkordok",z.kotta);
    ok(z.este===true&&z.tobbi.every(x=>x===true),"a Reflektor a saját kottáját játssza, a másik három lágy hangulat a közöset",{este:z.este,tobbi:z.tobbi});
    ok(Object.values(z.dal).every(x=>x.rms>.03&&x.pk<.95&&x.nan===0),"offline hangkártyán mind a három szól, nem torzít, nincs NaN",z.dal);
    const sz=Object.values(z.fo),db=20*Math.log10(Math.max(...sz)/Math.min(...sz));
    ok(db<3,"a hangereje a másik három lágy hangulatéval 3 dB-en belül (a „fo” dalon)",{rms:z.fo,dB:+db.toFixed(2)});
  }
  /* ---- 8. A FŐ KÉPERNYŐK ---- */
  console.log("\n— 8. A FŐ KÉPERNYŐK —");
  /* a téma SAJÁT hibája: majdnem fehér betű a téma világos kiemelőszínein */
  const MER=()=>{
    const pc=s=>{const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[, /]+/).filter(Boolean).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1];};
    const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
    const cs0=getComputedStyle(document.documentElement);
    const hex=k=>{const h=cs0.getPropertyValue(k).trim().replace("#","");return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(",");};
    const kiem=new Set(["--gold","--grass","--red","--blue","--purple"].map(hex));
    const ki=[];let db=0;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(w.nextNode()){const t=w.currentNode;if(t.nodeValue.trim().length<2)continue;const e=t.parentElement;if(!e)continue;
      const r=e.getBoundingClientRect();if(r.width<2||r.height<2||!e.offsetParent)continue;
      const c=getComputedStyle(e);if(c.visibility==="hidden"||+c.opacity<.5)continue;db++;
      const fg=pc(c.color);if(!fg)continue;
      let n=e,bg=null;while(n&&n.nodeType===1){const cc=getComputedStyle(n);if(cc.backgroundImage!=="none")break;
        const x=pc(cc.backgroundColor);if(x&&x[3]>.85){bg=x;break;}n=n.parentElement;}
      if(!bg||!kiem.has(bg.slice(0,3).join(",")))continue;
      const a=lum(fg),bb=lum(bg),k=(Math.max(a,bb)+.05)/(Math.min(a,bb)+.05);
      if(k<4.5)ki.push(t.nodeValue.trim().slice(0,20)+" "+k.toFixed(1)+" "+(e.className||e.tagName));}
    return {db,ki};};
  const kepernyok=[];
  const mer=async(nev,min)=>{
    for(let i=0;i<5;i++){const v=await ev(()=>{let n=0;
      for(const id of ["guideTipOk","tNudgeWhyX","talDrawLater","tStepsSkip","vezPushX"]){const b=document.getElementById(id);if(b&&b.offsetParent&&!b.disabled){b.click();n++;}}
      for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e&&!e.classList.contains("hide")){e.classList.add("hide");n++;}}
      return n;});if(!v)break;await varj(150);}
    await varj(250);const r=await ev(MER)||{db:0,ki:["mérés-hiba"]};
    const tema=await ev(()=>document.documentElement.getAttribute("data-theme"));
    kepernyok.push(nev);
    ok(r.db>=(min||5)&&r.ki.length===0&&tema==="reflektor",`${nev}: megnyílt (${r.db} látható szöveg), nincs világos betű kiemelőszínen`,r.ki.length?r.ki.slice(0,4):undefined);};
  const zar=()=>ev(()=>{document.querySelectorAll('[id$="Modal"]:not(.hide),.hubModal:not(.hide)').forEach(x=>x.classList.add("hide"));});
  await mer("kezdőlap",20);
  await ev(()=>openSettingsModal(true));await varj(500);await mer("beállítások",20);
  {const t=await ev(()=>{const sor=[...document.querySelectorAll("#themeModalBody>button")];
     return {db:sor.length,aktiv:(sor.find(x=>/ez az aktív/.test(x.innerText))||{innerText:""}).innerText.split("\n")[0],
       pix:!!document.querySelector("#themeModalBody .pixOpts")};});
   ok(t.db===5&&/Reflektor/.test(t.aktiv)&&!t.pix,"a témaválasztó ablakban öt sor, az aktív a Reflektor, Pixel-kapcsolók nincsenek",t);}
  await ev(()=>closeHomeModal("themeModal"));
  await ev(()=>document.getElementById("mpSoloBtn").click());await varj(900);await mer("karrier-indítás",8);
  await p.goto(URL,{waitUntil:"load"});await varj(1100);
  const kh=await ev(async()=>{
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    let h=null;try{startFirstSeason();}catch(e){h=String(e);}
    phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    document.getElementById("mpEntry").classList.add("hide");
    return h;});
  ok(kh===null,"a próbakarrier elindult",kh);
  await varj(900);
  await ev(()=>document.getElementById("scoutSpinBtn").click());await varj(2600);
  await mer("szezon és felállás",30);
  for(const [n,f] of [["menetrend és tabella",()=>document.getElementById("scheduleViewBtn").click()],["kihívások",()=>document.getElementById("challengeViewBtn").click()],
      ["talizmánok",()=>talMenuOpen()],["menedzsment",()=>mgmtPanelOpen()],["boost-központ",()=>boostOpenPanel()],["öltöző",()=>document.getElementById("lockerBtn").click()]]){
    await ev(f);await varj(800);await mer(n);await zar();await varj(150);}
  await ev(()=>openHubMidSeason());await varj(900);await mer("HUB",30);
  await ev(()=>document.getElementById("hubMenuBtn").click());await varj(500);
  await ev(()=>{document.querySelectorAll("#hubActions .hubGroup .accHead").forEach(h=>{const b=h.parentElement.querySelector(".accBody");if(b&&b.classList.contains("hide"))h.click();});});
  await varj(500);await mer("HUB-menü",20);
  await ev(()=>document.getElementById("hubTacticsBtn").click());await varj(1000);await mer("taktika",10);
  /* a meccs */
  await p.goto(URL,{waitUntil:"load"});await varj(1100);
  /* ugyanaz a gyors karrier — a kódot a lapról hívjuk újra */
  await p.evaluate(async()=>{
    gameMode="career";window.mgmtNyit=()=>false;enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();try{startFirstSeason();}catch(e){}
    phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};document.getElementById("mpEntry").classList.add("hide");});
  await varj(900);await ev(()=>document.getElementById("scoutSpinBtn").click());await varj(2600);
  for(let i=0;i<2;i++){await ev(()=>{for(const id of ["guideTipOk","tStepsSkip","vezPushX"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    const k=document.getElementById("kickBtn");if(k&&k.offsetParent)k.click();});await varj(1500);}
  const megy=await ev(()=>!!(S&&S.playing));
  ok(megy,"a meccs elindult");
  try{await p.waitForFunction(()=>{const e=document.getElementById("evaTovabb");return e&&e.offsetParent;},null,{timeout:25000});
    await varj(500);await mer("esemény-animáció",2);await ev(()=>document.getElementById("evaTovabb").click());}catch(e){console.log("  · ezen a meccsen nem jött esemény-animáció az első percekben");}
  await varj(3500);await mer("meccsnézet és közvetítés",20);
  {const t=await ev(()=>{const b=document.getElementById("sbBoard"),c=getComputedStyle(b),e=getComputedStyle(document.getElementById("sbEvents"));
     return {keret:c.borderTopColor,sav:e.backgroundImage.slice(0,60),kupa:/comp-|rival/.test(b.className)};});
   ok(t.kupa||(t.keret==="rgb(61, 104, 120)"&&/rgb\(15, 39, 49\)/.test(t.sav)),"a bajnoki eredményjelző a téma festékében (a kupáké a sajátjában marad)",t);}
  await ev(()=>{const v=document.getElementById("vegereBtn");if(v)v.click();});await varj(4500);await mer("lefújás",10);
  ok(kepernyok.length>=15,`összesen ${kepernyok.length} képernyő megnyitva a témában`);

  console.log("\n— 9. TÉMAVÁLTÁS ODA-VISSZA —");
  {
    const r=await ev(async()=>{const ki=[];const V=["dark","paper","noir","pixel","reflektor"];
      for(let k=0;k<2;k++)for(const t of V){applyTheme(t);await new Promise(r=>setTimeout(r,90));
        ki.push(t+":"+(document.documentElement.getAttribute("data-theme")||"dark")+":"+getComputedStyle(document.documentElement).getPropertyValue("--bg").trim()+":"+localStorage.getItem("theme30_0"));}
      /* a fejléc körbeváltó gombja a reflektor után a sötét-aranyra lép */
      document.getElementById("themeToggle").click();const kov=document.documentElement.getAttribute("data-theme")||"dark";
      applyTheme("reflektor");
      return {ki,kov,gomb:document.getElementById("themeToggle").textContent,pix:document.querySelectorAll("svg.pxIc,.pxIc").length};});
    const vart=["dark:dark:#101011:dark","paper:paper:#efe9dd:paper","noir:noir:#0b0b0c:noir","pixel:pixel:#1d2b53:pixel","reflektor:reflektor:#06141a:reflektor"];
    ok(JSON.stringify(r.ki)===JSON.stringify(vart.concat(vart)),"kétszer körbe: attribútum, alapszín és mentés mindig a helyén",r.ki.filter((x,i)=>x!==vart[i%5]));
    ok(r.kov==="dark"&&r.gomb==="◈","a körbeváltó gomb az ötödik után az elsőre lép, a jele ◈",{kov:r.kov,gomb:r.gomb});
    ok(r.pix===0,"a Pixel téma ikonjai visszacserélődtek (nem maradt sprite a lapon)",r.pix);
  }


  console.log("\n— 11. A SAJÁT ANIMÁCIÓK —");
  {
    const probal=async(opts)=>{
      const ctx2=await b.newContext({viewport:{width:430,height:900},reducedMotion:opts.reduced?"reduce":"no-preference"});
      await ctx2.addInitScript(o=>{try{if(!sessionStorage.getItem("__p")){sessionStorage.setItem("__p","1");
        localStorage.setItem("theme30_0",o.tema);localStorage.setItem("fxAnimOff30_0",o.fx?"0":"1");}}catch(e){}},{tema:opts.tema||"reflektor",fx:opts.fx});
      const q=await ctx2.newPage();q.on("pageerror",e=>errs.push(String(e)));
      await q.goto(URL,{waitUntil:"load"});await q.waitForTimeout(1200);
      const r={};
      const nevek=async()=>q.evaluate(()=>[...new Set(document.getAnimations().map(a=>a.animationName||(a.effect&&a.effect.target&&a.effect.target.className)||"js"))]);
      r.fxLive=await q.evaluate(()=>document.documentElement.classList.contains("fxLive"));
      /* a kezdőlap címe és a fő gomb */
      /* a szabály szerinti animáció (a futó már lecsenghetett a mérésig) */
      r.kezdo=await q.evaluate(()=>{const n=x=>getComputedStyle(x).animationName.split(",").map(v=>v.trim()).filter(v=>v!=="none");
        return {cim:n(document.querySelector(".heTitle")),cta:n(document.querySelector(".heCta"))};});
      /* koppintás-gyűrű */
      const bb=await q.evaluate(()=>{const r=document.getElementById("heSettingsBtn").getBoundingClientRect();return {x:r.left+20,y:r.top+15};});
      await q.mouse.move(bb.x,bb.y);await q.mouse.down();
      r.gyuru=await q.evaluate(()=>document.querySelectorAll(".refRing").length);await q.mouse.up();
      await q.waitForTimeout(600);
      /* ablak: a beállítások */
      r.ablak=await q.evaluate(()=>{openSettingsModal(true);const c=document.querySelector("#themeModal>.card");
        return (c&&c.getAnimations?c.getAnimations():[]).map(a=>a.animationName);});
      await q.waitForTimeout(700);
      r.ablakUtan=await q.evaluate(()=>{const c=document.querySelector("#themeModal>.card"),cs=getComputedStyle(c);
        return {clip:cs.clipPath,filter:cs.filter};});
      await q.evaluate(()=>closeHomeModal("themeModal"));
      /* gól-felirat */
      r.gol=await q.evaluate(()=>{const v=refFx("gol");const e=document.getElementById("refFx");
        return {v,on:!!(e&&e.classList.contains("on")),szoveg:e?e.innerText.replace(/\s+/g," ").trim():""};});
      await q.waitForTimeout(1900);
      r.golUtan=await q.evaluate(()=>{const e=document.getElementById("refFx");return e?e.className:"-";});
      /* témaváltás: el, majd vissza a Reflektorra */
      r.boot=await q.evaluate(async()=>{applyTheme("paper");await new Promise(r=>setTimeout(r,80));applyTheme("reflektor");
        await new Promise(r=>setTimeout(r,120));return document.querySelectorAll(".refBoot").length;});
      await q.waitForTimeout(1800);
      r.bootUtan=await q.evaluate(()=>document.querySelectorAll(".refBoot").length);
      /* vissza a vizsgált témára (Törtfehérnél a váltás-próba a Reflektoron hagyná) */
      await q.evaluate(t=>applyTheme(t),opts.tema||"reflektor");await q.waitForTimeout(200);
      /* karrier: az oldal beúszik, a menü csoportjai beemelkednek */
      await q.evaluate(async()=>{
        gameMode="career";window.mgmtNyit=()=>false;enterCareerSetupFromHome(true);beginNewGame();
        const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
        showChemistry=()=>{};S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
        pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
        if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
        form="433";slotRoles={};S.ultraSlot=null;
        slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
        slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
          if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
          const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
        if(!scout)scout=generateScout();try{startFirstSeason();}catch(e){}
        phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};document.getElementById("mpEntry").classList.add("hide");});
      await q.waitForTimeout(900);
      /* a HUB megnyitásakor a szakasz beúszik, és (a HUB menü-módban nyílik)
         a menü csoportjai beemelkednek */
      const hub=await q.evaluate(()=>{openHubMidSeason();
        return {sz:[...document.querySelectorAll("body>section:not(.hide)")].flatMap(e=>e.getAnimations().map(a=>a.animationName))};});
      await q.waitForTimeout(700);
      /* a menü: ha nyitva van, előbb becsukjuk, aztán a gombbal kinyitjuk */
      await q.evaluate(()=>{for(const id of ["guideTipOk","tStepsSkip","vezPushX"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
        const ha=document.getElementById("hubActions");if(ha&&!ha.classList.contains("hide"))document.getElementById("hubMenuBtn").click();});
      await q.waitForTimeout(300);
      hub.m=await q.evaluate(()=>{document.getElementById("hubMenuBtn").click();const ha=document.getElementById("hubActions");
        return ha.classList.contains("hide")?-1:[...ha.querySelectorAll(":scope>*>.hubGroupTitle,:scope>.hubBackBtn")].flatMap(e=>e.getAnimations().map(a=>a.animationName)).filter(n=>n==="refRise").length;});
      r.oldal=hub.sz;r.menu=Math.max(0,hub.m);
      await ctx2.close();return r;};
    const be=await probal({fx:true});
    ok(be.fxLive&&be.kezdo.cim.includes("refTitle")&&be.kezdo.cta.includes("refGlint"),"✨ BE: a főcím élesedik, a fő gomb csillan",be.kezdo);
    ok(be.gyuru===1,"✨ BE: a gomb lenyomására gyűrű nyílik",be.gyuru);
    ok(be.ablak.includes("refBeam")&&be.ablakUtan.clip==="none"&&be.ablakUtan.filter==="none","✨ BE: az ablak reflektorral nyílik, és utána nem marad rajta vágás vagy szűrő",{an:be.ablak,utan:be.ablakUtan});
    /* a REFLEKTOR-ÉLET egyetlen animációja sem tehet transformot vagy filtert
       olyan elemre, aminek fix pozíciójú leszármazottja lehet (a csoportra, a
       lenyíló törzsre, az ablakra, az oldalra) — lásd a fekvő menü hibáját */
    {const css=html.slice(html.indexOf("REFLEKTOR-ÉLET (1.0.11.1.00)"),html.indexOf("</style>",html.indexOf("REFLEKTOR-ÉLET (1.0.11.1.00)")));
     const kf=n=>(css.match(new RegExp("@keyframes "+n+"\\{[\\s\\S]*?\\}\\}"))||[""])[0];
     const rossz=["refWipe","refBeam","refReveal","refDim"].filter(n=>!kf(n)||/transform|filter/.test(kf(n)));
     ok(rossz.length===0,"az oldal, az ablak és a lenyíló törzs animációja se transformot, se filtert nem használ",rossz);}
    ok(be.gol.v&&be.gol.on&&/GÓÓÓL/.test(be.gol.szoveg)&&be.golUtan==="","✨ BE: gólnál „alsó harmad” felirat, utána eltűnik",{...be.gol,utan:be.golUtan});
    ok(be.boot===1&&be.bootUtan===0,"✨ BE: a témára váltva a stadion felkapcsol, a réteg utána eltűnik",{be:be.boot,utan:be.bootUtan});
    ok(be.oldal.includes("refWipe"),"✨ BE: az új oldal ferde vágással beúszik",be.oldal);
    ok(be.menu>=3,"✨ BE: a menü csoportjai egymás után beemelkednek",be.menu);
    for(const [nev,o] of [["kevesebb mozgás (rendszer), ✨ kézzel BE",{fx:true,reduced:true}],["✨ KI",{fx:false}]]){
      const r=await probal(o);
      const fut=[...r.kezdo.cim,...r.kezdo.cta,...r.ablak,...r.oldal].filter(n=>/^ref/.test(n));
      ok(fut.length===0&&r.gyuru===0&&!r.gol.v&&r.boot===0&&r.menu===0,`${nev}: egyik saját animáció sem fut`,{fut,gyuru:r.gyuru,gol:r.gol.v,boot:r.boot,menu:r.menu});}
    /* a többi témát nem érinti: Törtfehérben ✨ BE mellett sincs refAnim */
    const pr=await probal({fx:true,tema:"paper"});
    ok(pr.gyuru===0&&!pr.gol.v&&[...pr.kezdo.cim,...pr.ablak,...pr.oldal].every(n=>!/^ref/.test(n)),"Törtfehérben (✨ BE) a Reflektor animációi nem futnak",{gyuru:pr.gyuru,gol:pr.gol.v,cim:pr.kezdo.cim,ablak:pr.ablak,oldal:pr.oldal});
  }
  console.log("\n— 10. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
