/* 🎻 3.9.167 — A LÁGY HANGZÁS, TÉMÁNKÉNTI HANGULATTAL.

   KIMONDOTT KÉRÉS: „legyen olyan is, ami illik a nem pixelated témánkhoz
   is… immerzív, de azért könnyed, instrumentális témát… ahhoz illő
   alkalmazáshangokkal. És akkor a témaváltó a zenei témát is automatikusan
   váltaná" — „Mehet az A, témánkénti hangulatokkal!"

   Amit mér:
     1. a hangzás AUTOMATIKUSAN követi a színtémát (Pixel → chiptune,
        Sötét-arany → Mozi, Törtfehér → Napos, Noir → Füstös jazz), és kézzel
        rögzíthető (a választás megmarad);
     2. a táblák teljesek: mind a 23 hangeffektnek van lágy párja, mind a
        három menüdalnak lágy változata, a kották épek (egész ütemek); gitár
        (pengetett húr) sehol nincs (3.9.169: „nagyon agresszív");
     3. OFFLINE HANGKÁRTYÁN, hangulatonként: a menüdalok szólnak (nem
        csendesek), nem torzítanak (csúcs < 0,95), nincs NaN; mind a 23
        effekt külön-külön hallható és nem torzít; a nyolc stílus-dallam és
        -szignál szól;
     4. a három hangulat hangereje egymáshoz illik (3 dB-en belül) — a
        témaváltás ne legyen hangerő-ugrás;
     5. a beállító ablakban ott a „Hangzás" választó és a „Most:" sor;
     6. ÉLŐ hangkártyán: a menüzene témaváltáskor azonnal a másik
        hangszerelésre vált, a gól-hang a lágy táblából szól;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9201;
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
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- 1. AUTOMATIKUS ÉS KÉZI VÁLASZTÁS ---- */
  console.log("\n— 1. A HANGZÁS A TÉMÁT KÖVETI —");
  const v=await p.evaluate(()=>{
    const r={alap:hangBeall().csomag,tema:{}};
    for(const t of ["dark","paper","noir","pixel"]){applyTheme(t);r.tema[t]=hangCsomag()+(hangCsomag()==="lagy"?":"+hangHangulat():"");}
    applyTheme("paper");hangBeall().csomag="chip";hangMent();r.kezi_chip=hangCsomag();
    applyTheme("pixel");hangBeall().csomag="lagy";hangMent();r.kezi_lagy=hangCsomag()+":"+hangHangulat();
    r.tarolva=JSON.parse(localStorage.getItem(HANG_KEY)).csomag;
    hangBeall().csomag="auto";hangMent();applyTheme("paper");
    return r;});
  ok(v.alap==="auto","az alapállás: automatikus",v.alap);
  ok(v.tema.dark==="lagy:mozi"&&v.tema.paper==="lagy:napos"&&v.tema.noir==="lagy:jazz"&&v.tema.pixel==="chip",
     "Sötét-arany → Mozi, Törtfehér → Napos, Noir → Füstös jazz, Pixel → chiptune",v.tema);
  ok(v.kezi_chip==="chip"&&v.kezi_lagy==="lagy:mozi"&&v.tarolva==="lagy","kézzel rögzíthető (papíron is chiptune, Pixelen is lágy), és eltárolódik",v);

  /* ---- 2. A TÁBLÁK ---- */
  console.log("\n— 2. A TÁBLÁK —");
  const tb=await p.evaluate(()=>{
    const sfx=Object.keys(HANG_SFX),lagy=Object.keys(HANG_SFX_LAGY);
    const dalok={};
    for(const [k,D] of Object.entries(HANG_DALOK_LAGY)){const L=hangSor(D.lead);
      dalok[k]={utem:L.length/16,rossz:L.filter(x=>x&&!x.tart&&x.n==null).length,ch:D.ch.length,negy:D.ch.every(c=>c.length===4)};}
    /* 3.9.169: a gitár (pengetett húr) kikerült — se hangszer, se húr-motor */
    const gitar=typeof hangKs!=="undefined"||/"pluck"|"bogo"/.test(String(hangLagy)+String(hangLagyLepes))
      ||Object.values(HANG_LAGY_HANGULAT).some(F=>/gitar|bogo|pluck/.test(F.comp+F.bass+F.lead+F.fel));
    return {gitar,sfx:sfx.length,hianyzik:sfx.filter(k=>!HANG_SFX_LAGY[k]),extra:lagy.filter(k=>!HANG_SFX[k]),
      dalKulcs:Object.keys(HANG_DALOK_LAGY).sort().join()===Object.keys(HANG_DALOK_NEV).sort().join(),dalok};});
  ok(tb.sfx===23&&tb.hianyzik.length===0&&tb.extra.length===0,"mind a 23 hangeffektnek van lágy párja",tb);
  ok(tb.gitar===false,"nincs gitár: a pengetett húr (Karplus–Strong) egyik hangulatban sem szól (3.9.169)");
  ok(tb.dalKulcs&&Object.values(tb.dalok).every(d=>Number.isInteger(d.utem)&&d.utem%d.ch===0&&d.rossz===0&&d.negy),
     "mind a három menüdalnak lágy változata; a kotta ép, egész ütemek, négyhangú akkordok",tb.dalok);

  /* ---- 3-4. OFFLINE HANGKÁRTYA ---- */
  console.log("\n— 3-4. OFFLINE HANGKÁRTYÁN —");
  const of=await p.evaluate(async()=>{
    const render=async(secs,fn)=>{
      const sr=22050,off=new OfflineAudioContext(2,Math.ceil(sr*secs),sr);
      const save={c:_hangCtx,b:_hangBus};_hangCtx=off;
      const m=off.createGain(),s=off.createGain(),z=off.createGain();
      s.connect(m);z.connect(m);m.connect(off.destination);_hangBus={master:m,sfx:s,zene:z};
      s.gain.value=.55*.7;z.gain.value=.45*.8;
      try{fn(s,z);}finally{_hangCtx=save.c;_hangBus=save.b;}
      const buf=await off.startRendering();return {L:buf.getChannelData(0),R:buf.getChannelData(1),sr};};
    const stat=(x,a,b)=>{let pk=0,sq=0,nan=0;
      for(let i=a;i<b;i++){const l=x.L[i],r=x.R[i];if(!isFinite(l)||!isFinite(r)){nan++;continue;}
        pk=Math.max(pk,Math.abs(l),Math.abs(r));sq+=l*l;}
      return {pk,rms:Math.sqrt(sq/Math.max(1,b-a)),nan};};
    const out={};
    for(const [tema,nev] of [["dark","mozi"],["paper","napos"],["noir","jazz"]]){
      applyTheme(tema);const F=hangLagyF(),o=out[nev]={dal:{},sfx:{},stilus:0,jel:0,sfxRossz:[]};
      for(const dk of Object.keys(HANG_DALOK_LAGY)){
        const D=HANG_DALOK_LAGY[dk],STEP=60/(D.bpm*F.tempo)/4;
        const x=await render(14,(s,z)=>{const bz=hangLagyBusz(z,F);let t=.05;for(let i=0;t<12;i++){hangLagyLepes(D,i,t,bz,F,STEP);t+=STEP;}});
        const st=stat(x,0,x.L.length);o.dal[dk]={rms:+st.rms.toFixed(4),pk:+st.pk.toFixed(3),nan:st.nan};}
      const kulcs=Object.keys(HANG_SFX_LAGY),SLOT=2.6;
      const x=await render(kulcs.length*SLOT+1,()=>{kulcs.forEach((k,i)=>HANG_SFX_LAGY[k](.05+i*SLOT));});
      kulcs.forEach((k,i)=>{const a=Math.floor(i*SLOT*x.sr),st=stat(x,a,Math.floor(a+SLOT*x.sr));
        o.sfx[k]=+st.pk.toFixed(3);if(st.pk<.005||st.pk>=.95||st.nan)o.sfxRossz.push(k+":"+st.pk.toFixed(3));});
      /* a nyolc stílus-dallam és -szignál */
      let szol=0,jel=0;
      for(const [k,D] of Object.entries(HANG_STILUS)){
        const y=await render(12,(s)=>{hangLagyDallamSzol(D,.05,s);});if(stat(y,0,y.L.length).rms>.005)szol++;
        const w=await render(4,(s)=>{hangLagyJelSzol(D,.05,s);});if(stat(w,0,w.L.length).pk>.01)jel++;}
      o.stilus=szol;o.jel=jel;}
    applyTheme("paper");
    return out;});
  for(const nev of ["mozi","napos","jazz"]){
    const o=of[nev],d=Object.values(o.dal);
    ok(d.every(x=>x.rms>.03&&x.pk<.95&&x.nan===0),`${nev}: mind a három menüdal szól, nem torzít, nincs NaN`,o.dal);
    ok(o.sfxRossz.length===0,`${nev}: mind a 23 effekt külön hallható és nem torzít`,o.sfxRossz.length?o.sfxRossz:undefined);
    ok(o.stilus===8&&o.jel===8,`${nev}: a nyolc stílus-dallam és a nyolc szignál szól`,{dallam:o.stilus,jel:o.jel});}
  const szint=["mozi","napos","jazz"].map(n=>of[n].dal.fo.rms);
  const db=20*Math.log10(Math.max(...szint)/Math.min(...szint));
  ok(db<3,"a három hangulat hangereje 3 dB-en belül (a „fo” dalon mérve)",{rms:szint,dB:+db.toFixed(2)});

  /* ---- 5. A BEÁLLÍTÓ ABLAK ---- */
  console.log("\n— 5. A BEÁLLÍTÓ ABLAK —");
  const ui=await p.evaluate(()=>{
    applyTheme("noir");openSettingsModal(true);
    const sel=document.getElementById("hangCsomag"),most=document.getElementById("hangMost");
    const r={opt:sel?[...sel.options].map(o=>o.value):[],most:most?most.textContent:""};
    applyTheme("pixel");renderThemeModal();r.mostPixel=(document.getElementById("hangMost")||{}).textContent||"";
    closeHomeModal("themeModal");applyTheme("paper");return r;});
  ok(ui.opt.join()==="auto,lagy,chip","a „Hangzás” választó: automatikus / lágy / chiptune",ui.opt);
  ok(/Lágy · Füstös jazz/.test(ui.most)&&/Chiptune/.test(ui.mostPixel),"a „Most:” sor a téma hangulatát mondja (Noir → Füstös jazz, Pixel → Chiptune)",ui);

  /* ---- 6. ÉLŐ HANGKÁRTYA ---- */
  console.log("\n— 6. ÉLŐBEN —");
  await p.mouse.click(5,5);
  const el=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    hangFelold();await varj(300);
    const r={fut:_hangCtx&&_hangCtx.state};
    hangZeneIgazit();await varj(100);r.papir=_hangZene&&_hangZene.kulcs;
    applyTheme("noir");await varj(100);r.noir=_hangZene&&_hangZene.kulcs;
    applyTheme("pixel");await varj(100);r.pixel=_hangZene&&_hangZene.kulcs;
    applyTheme("dark");await varj(100);r.dark=_hangZene&&_hangZene.kulcs;
    /* a gól-hang a lágy táblából */
    let lagyGol=0;const eredeti=HANG_SFX_LAGY.gol;HANG_SFX_LAGY.gol=function(t){lagyGol++;return eredeti(t);};
    hang("gol");HANG_SFX_LAGY.gol=eredeti;r.lagyGol=lagyGol;
    hangZeneAllj();applyTheme("paper");return r;});
  ok(el.fut==="running"&&el.papir==="lagy:napos"&&el.noir==="lagy:jazz"&&el.pixel==="chip"&&el.dark==="lagy:mozi",
     "a menüzene témaváltáskor azonnal a másik hangszerelésre vált",el);
  ok(el.lagyGol===1,"a gól-hang lágy témában a lágy táblából szól",el.lagyGol);

  console.log("\n— 7. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
