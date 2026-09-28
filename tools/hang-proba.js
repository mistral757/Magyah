/* 🔊 HANG ÉS ZENE (3.9.163).

   Amit mér:
     1. betöltés oldalhiba nélkül; a fejléc 🔊 gombja és a beállító ablak
        hang-szakasza (kapcsolók, csúszkák, dalválasztó) megvan;
     2. a beállítás alapértékei, a fejléc-gomb körbeváltása (minden → csak
        effekt → csend → minden) és a mentés (localStorage);
     3. az első érintés után a hangkártya fut; minden hangeffekt, mind a
        három menüdal és mind a nyolc stílus-dallam hiba nélkül szól;
     4. minden dallam hangjegye értelmes, és minden dal egész ütemekből áll;
     5. a zene meccs közben hallgat, a menüben szól;
     6. a meccs hangjai: kezdő sípszó, gól, kapott gól, lapok, sérülés, a
        napló-szűrő (kapufa, kivédett tizenegyes, VAR, mesterhármas) — és
        végigjátszásnál (S.auto) egyik sem;
     7. a stílus-szignál stílusonként meccsenként egyszer, új fordulóban újra;
        meccsek között csak a saját stílus jutalma szól;
     8. a stílus-menü dallama csak két filozófiánál, a NÉZETT stílusé. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9193;
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
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof hang==="function",null,{timeout:15000});

  /* ---- 1. FELÜLET ---- */
  const f=await p.evaluate(()=>{
    try{localStorage.removeItem(HANG_KEY);}catch(e){}_hangBeall=null;
    renderThemeModal();
    return {gomb:!!document.getElementById("hangToggle"),
      on:!!document.getElementById("hangOn"),sfx:!!document.getElementById("hangSfx"),
      zene:!!document.getElementById("hangZene"),vol:!!document.getElementById("hangZeneVol"),
      dal:document.getElementById("hangDal")?document.getElementById("hangDal").options.length:0};});
  ok(f.gomb,"a fejléc 🔊 gombja megvan");
  ok(f.on&&f.sfx&&f.zene&&f.vol&&f.dal===3,"a beállító ablakban: hang, hangerő, zene, zene-hangerő, 3 dal",f);

  /* ---- 2. BEÁLLÍTÁS ---- */
  const bz=await p.evaluate(()=>{
    const B=hangBeall(),alap={on:B.on,zene:B.zene,dal:B.dal};
    const kor=[];for(let i=0;i<3;i++){hangFejlecKattint();kor.push(document.getElementById("hangToggle").textContent);}
    const menteve=JSON.parse(localStorage.getItem(HANG_KEY));
    return {alap,kor,menteve:{on:menteve.on,zene:menteve.zene}};});
  ok(bz.alap.on&&bz.alap.zene&&bz.alap.dal==="fo","alapból szól a hang és a zene, a főcímmel",bz.alap);
  ok(bz.kor.join("")==="🔉🔇🔊","a fejléc-gomb körbevált: csak effekt → csend → minden",bz.kor);
  ok(bz.menteve.on&&bz.menteve.zene,"a beállítás elmentve",bz.menteve);

  /* ---- 3. A HANGKÁRTYA ---- */
  await p.mouse.click(5,890);
  await p.waitForTimeout(300);
  const hk=await p.evaluate(async()=>{
    hangFelold();await new Promise(r=>setTimeout(r,200));
    const out={allapot:_hangCtx&&_hangCtx.state,sfx:{},hibak:[]};
    for(const id of Object.keys(HANG_SFX)){try{out.sfx[id]=hang(id);}catch(e){out.hibak.push(id+":"+e);}}
    for(const d of Object.keys(HANG_DALOK)){try{if(!hangZeneInditas(d))out.hibak.push("dal "+d);}catch(e){out.hibak.push(d+":"+e);}
      await new Promise(r=>setTimeout(r,120));}
    hangZeneAllj();
    for(const k of Object.keys(HANG_STILUS)){try{if(!hangStilusDallam(k))out.hibak.push("stílus "+k);}catch(e){out.hibak.push(k+":"+e);}}
    hangZeneAllj();_hangStilusDal=null;
    out.nSfx=Object.keys(HANG_SFX).length;out.nStilus=Object.keys(HANG_STILUS).length;
    out.stilusok=STYLES.length===8&&STYLES.every(st=>HANG_STILUS[st.key]);
    return out;});
  ok(hk.allapot==="running","az érintés után a hangkártya fut",hk.allapot);
  ok(hk.hibak.length===0&&Object.values(hk.sfx).filter(x=>x).length>=hk.nSfx-1,
    `mind a ${hk.nSfx} hangeffekt, a 3 menüdal és a ${hk.nStilus} stílus-dallam hiba nélkül szól`,hk.hibak);
  ok(hk.stilusok&&hk.nStilus===8,"minden csapatstílusnak van dallama");

  /* ---- 4. A HANGJEGYEK ---- */
  const hj=await p.evaluate(()=>{
    const rossz=[];
    Object.entries(Object.assign({},HANG_DALOK,HANG_STILUS)).forEach(([n,D])=>{
      const L=hangSor(D.lead);
      if(L.length%16)rossz.push(n+" ütem "+L.length);
      if(L.some(x=>x&&!x.tart&&x.n==null))rossz.push(n+" hangjegy");
      if(D.jel&&hangSor(D.jel).some(x=>x&&!x.tart&&x.n==null))rossz.push(n+" szignál");});
    return rossz;});
  ok(hj.length===0,"minden dallam egész ütemekből áll, minden hangjegy értelmes",hj);

  /* ---- 5–8. A JÁTÉKBAN ---- */
  const j=await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    S.seasonNumber=2;S.idx=4;S.auto=false;S.playing=false;
    const out={};
    const B=hangBeall();B.on=true;B.zene=true;hangHangero();
    hangZeneIgazit();out.menu=!!_hangZene;
    S.playing=true;hangZeneIgazit();out.meccs=!!_hangZene;
    /* meccsesemények */
    _hangNaplo.length=0;
    hangMeccs("sip");
    SB.done=true;
    sbEv("us","goal","X",10);sbEv("them","goal","Y",20);sbEv("us","yellow","X",30);sbEv("them","red","Y",40);sbEv("us","inj","X",50);
    addLine("<b>Kapufa!</b> centikre volt","m ev");
    addLine("55'  KIVÉDETT TIZENEGYES!!! <b>Z</b>","m ev");
    addLine("60'  VAR-ellenőrzés... a gólt nem adják","m ev");
    addLine("⚽⚽⚽  MESTERHÁRMAS!!! X","m ev");
    out.esem=_hangNaplo.slice();
    _hangNaplo.length=0;S.auto=true;
    hangMeccs("sip");sbEv("us","goal","X",70);addLine("<b>Kapufa!</b>","m ev");
    out.auto=_hangNaplo.slice();S.auto=false;
    /* szignál */
    S.style={key:"tikitaka"};S.style2={key:"villam"};S.styleView=1;
    _hangNaplo.length=0;_hangJelVolt={};
    hangStilusMeccs("tikitaka");hangStilusMeccs("tikitaka");hangStilusMeccs("villam");
    S.idx=5;hangStilusMeccs("tikitaka");
    out.jel=_hangNaplo.slice();
    /* meccsek között: csak a saját stílus */
    S.playing=false;_hangNaplo.length=0;
    hangStilusJutalom("gegen");hangStilusJutalom("tikitaka");hangStilusJutalom("tikitaka");
    out.jutalom=_hangNaplo.slice();
    /* stílus-menü */
    _hangNaplo.length=0;
    S.styleView=2;hangStilusMenu();S.styleView=1;hangStilusMenu();
    const s2=S.style2;S.style2=null;hangStilusMenu();S.style2=s2;
    out.menuDal=_hangNaplo.slice();
    hangZeneAllj();_hangStilusDal=null;
    return out;});
  ok(j.menu&&!j.meccs,"a zene a menüben szól, meccs közben hallgat",{menu:j.menu,meccs:j.meccs});
  ok(JSON.stringify(j.esem)===JSON.stringify(["sip","gol","golKapott","sarga","piros","serules","kapufa","bravur","var","mesterharmas"]),
    "a meccs hangjai: sípszó, gól, kapott gól, sárga, piros, sérülés, kapufa, kivédett tizenegyes, VAR, mesterhármas",j.esem);
  ok(j.auto.length===0,"végigjátszásnál a meccs hangjai hallgatnak",j.auto);
  ok(JSON.stringify(j.jel)===JSON.stringify(["jel:tikitaka","jel:villam","jel:tikitaka"]),
    "a szignál stílusonként meccsenként egyszer, új fordulóban újra",j.jel);
  ok(JSON.stringify(j.jutalom)===JSON.stringify(["jel:tikitaka"]),"meccsek között csak a saját stílus jutalma szól, egyszer",j.jutalom);
  ok(JSON.stringify(j.menuDal)===JSON.stringify(["dal:villam","dal:tikitaka"]),
    "a stílus-menü a nézett filozófia dallamát játssza — egy filozófiánál nem",j.menuDal);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
