/* 🎬 3.9.270 — ESEMÉNY-ANIMÁCIÓK (F4) — élő mérés valódi meccseken.
   Amit néz:
     1. minden sablon kirajzolódik (minden animálható típusnak van jelenete);
        3.9.271: a figura a portréból csak a fejet kapja, a teste saját,
     2. lassú tempón a kiválasztott események jelenetet kapnak, a jelenet
        alatt a meccsóra ÁLL, utána megy tovább, és a meccs rendben lefut;
     3. koppintásra továbblép; a vissza gomb is; a „Ne mutasd többet" a meccs
        hátralevő részére kikapcsolja;
     4. gyors tempón és kikapcsolva nincs jelenet;
     5. a lejátszó nem húz véletlent;
     6. nincs oldalhiba.
   Használat: node tools/esemeny-animacio-3-9-270-proba.js   (MROOT=… másik mappára) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9215;
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
  /* egy valódi egyjátékos karrier (mentési zárral), szezonban, nyitott HUB-bal */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();});
  await p.waitForTimeout(1500);   /* a nyitáskori összevont mentés is lefusson */


  console.log("\n— 1. A SABLONOK —");
  const s1=await p.evaluate(()=>{
    const hiany=Object.keys(MEV_TIPUS).filter(t=>MEV_TIPUS[t].anim!==false&&!EVA_SABLON[EVA_TIPUS_SABLON[t]]);
    const rossz=[];
    Object.keys(EVA_TIPUS_SABLON).forEach(t=>{
      try{const c=evaKontextus({t,side:"us",p:"Teszt Elek",min:30,seq:1,alt:t==="szoglet"?"tisztazas":null});
        const T=EVA_SABLON[EVA_TIPUS_SABLON[t]];const svg=T.svg(c);
        if(!/<g id=/.test(svg)||!T.cim(c))rossz.push(t);}catch(e){rossz.push(t+": "+e.message);}});
    /* 3.9.271: a figura a portréból CSAK A FEJET kapja, a teste saját (mezes
       törzs a klub mintájával) — nem a portré válla két vékony lábon */
    const c=evaKontextus({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:1});
    const g=EVA_SABLON.gol.svg(c);
    const fejSvg=decodeURIComponent(String(c.loUrl.fej).split(",")[1]||"");
    const test={torzs:/clip-path="url\(#evaLovoT\)"/.test(g),fejViewBox:/viewBox="16 -8 68 84"/.test(fejSvg)||String(c.loUrl.fej).indexOf("data:image/png")===0,
      nincsVall:!/clip-path="url\(#fc\d+v\)"/.test(fejSvg),bor:/^#[0-9a-f]{6}$/i.test(c.loUrl.bor)};
    return {test,hiany,rossz,random:[evaKer,evaKov,evaLezar,evaKontextus,evaFolytat].some(f=>/Math\.random/.test(String(f)))};});
  ok(s1.hiany.length===0,"minden animálható típusnak van jelenete",s1.hiany);
  ok(s1.rossz.length===0,"minden jelenet kirajzolható, felirattal",s1.rossz);
  ok(!s1.random,"a lejátszó nem húz véletlent");
  /* 3.9.276: a gólszám a listából (nem a közvetítés „HAT GÓL — VAGY MÉG
     TÖBB?!" sorából), és a pixel-téma felugrója nem lóg a jelenetbe */
  const s276=await p.evaluate(async()=>{
    mevKezd({});_mev.keret=8;_mev.anim=true;
    const L=[];for(let i=1;i<=7;i++){const ev={t:"gol",side:"us",p:"Gólgép Géza",min:i*10,seq:i,extra:i>=6?"hat":null};_mev.lista.push(ev);L.push(ev);}
    const cim=n=>EVA_SABLON.gol.cim({ev:L[n-1],sajat:true});
    const r={c3:cim(3),c6:cim(6),c7:cim(7),c2:cim(2)};
    try{applyTheme("pixel");}catch(e){}
    evaIdoSzorzo=3;evaKer(L[6]);await new Promise(x=>setTimeout(x,120));
    try{pixFx("gol");}catch(e){}
    const fx=document.getElementById("pixFx");
    r.fut=document.body.classList.contains("evaFut");
    r.pixVolt=!!fx&&fx.classList.contains("on");r.pixRejtve=!!fx&&getComputedStyle(fx).display==="none";
    _evaSor.length=0;evaLezar();await new Promise(x=>setTimeout(x,60));
    r.utana=!document.body.classList.contains("evaFut");
    evaIdoSzorzo=1;try{applyTheme("dark");}catch(e){}
    return r;});
  ok(s276.c3==="MESTERHÁRMAS!"&&s276.c6==="HAT GÓL!"&&s276.c7==="HÉT GÓL!"&&s276.c2==="GÓÓÓL!","a gólszám a játékos meccsbeli góljaiból (7 → HÉT GÓL!)",s276);
  ok(s276.fut&&s276.pixVolt&&s276.pixRejtve&&s276.utana,"jelenet közben a pixel-téma felugrója rejtve, utána újra él",s276);
  /* 3.9.278: a SKILL-jelenetek — a skill a gólra kerül, és a gól a skill
     jelenetét kapja */
  const sk=await p.evaluate(()=>{
    const r={};
    mevKezd({});_mev.keret=8;_mev.anim=false;
    /* a skill-sorok a gólonkénti kommentár-keretből fogynak — ha nem férnek
       bele, a közvetítésben sem látszanak, jelenet sem jár hozzájuk */
    goalNoteLeft=10;
    /* a sor ELŐBB, aztán az sbEv, aztán a skill ízesítő-sora */
    addLine(`12'  GÓL! Bomba  1:0`,"m goal");sbEv("us","goal","Bomba Béla",12);
    addLine(`→ BOMBAGÓL! Bomba húsz méterről — Szitálós!`,"m skillnote",true,{skill:"fw_cannon"});
    addLine(`→ Ágyúgolyó is`,"m skillnote",true,{skill:"df_cannon"});   /* a második nem írja felül */
    /* sebesség-skill: a GÓLPASSZADÓÉ */
    sbEv("us","goal","Klose Miró",20);addLine(`20'  GÓL! Klose  2:0`,"m goal");
    addLine(`→ Robben elhúzott a szélen`,"m skillnote",true,{skill:"sp_flank",skillP:"Arjen Robben"});
    /* szabadrúgásgól: a skill a GÓL SORÁN jön */
    addLine(`30'  SZABADRÚGÁSGÓL! Juni a sorfal fölött — Szabadrúgás-mester is közrejátszott  3:0`,"m goal",false,{skill:"mf_fk"});sbEv("us","goal","Juni Pernambuco",30);
    /* ellenfél gólja után a skill-sor nem tapad rá */
    sbEv("them","goal","Ellen Fél",40);addLine(`→ Elastico`,"m skillnote",true,{skill:"mf_elastico"});
    const L=mevLista().filter(e=>e.t==="gol"||e.t==="golKapott");
    r.g=L.map(e=>[e.t,e.p,e.skill||null,e.skillP||null]);
    /* a hat jelenet kirajzolódik, a saját feliratával */
    r.jelenet=Object.keys(EVA_SKILL_SABLON).map(id=>{
      const t=(EVA_SKILL_TIPUS[id]||["gol"])[0];
      const asst=["sp_flank","mf_surgeon","mf_cross","sp_queen","chem_pair","fw_dribble","fw_firsttouch","df_calm_buildup","gk_assist","df_launch"].indexOf(id)>=0;
      const altT=id==="fw_clutch"||id==="fw_coolclose"?"tizenegyes":null;
      const ev={t,side:"us",p:"Teszt Elek",min:30,seq:99,skill:id,skillP:asst?"Szél Elek":"Teszt Elek",alt:altT};
      const T=EVA_SABLON[evaSkillSablon(ev)];
      try{const c=evaKontextus(ev);const svg=T.svg(c);
        const A=()=>({});T.mozgas(A,c);
        return {id,ok:/evaLabda/.test(svg)&&(t==="szereles"||/evaKapus/.test(svg)),cim:T.cim(c),
          kulon:asst?(/evaBefejezo|evaPasszolo|evaBeado|evaTars1|evaKirugoF/.test(svg)
          /* a Katapult kapusa a saját kapusmezében */
          &&svg.indexOf(id==="gk_assist"?evaFig(evaJatekos(ev.skillP,"us"),kapusKitNow(),1).fej:c.skFig.fej)>=0):null};}
      catch(e){return {id,hiba:e.message};}});
    /* 3.9.279 — a második kör */
    sbEv("us","goal","Hős Huba",88);addLine(`88'  GÓL! Hős  4:1`,"m goal");
    addLine(`→ Motor — pontos volt az indítás`,"m skillnote",true,{skill:"mf_engine",skillP:"Indító Iván"});   /* jelenet nélküli: nem foglal */
    addLine(`→ BOMBAGÓL!`,"m skillnote",true,{skill:"fw_cannon"});
    addLine(`→ 🍺 Mindenki a lefújást várta`,"m mvp",false,{skill:"clutch_hero"});   /* felülír */
    sbEv("us","goal","Csatár Csaba",89);addLine(`89'  GÓL! Csatár  5:1`,"m goal");
    addLine(`→ Sebészi passz — pontos volt az indítás`,"m skillnote",true,{skill:"mf_surgeon",skillP:"Sebész Sebő"});
    sbEv("us","goal","Gól Gábor",90);addLine(`90'  GÓL! Gól  6:1`,"m goal");
    addLine(`→ Motor`,"m skillnote",true,{skill:"mf_engine",skillP:"Indító Iván"});
    /* „Fogd meg a söröm!": a skill sora ELŐBB, a védés sora ráolvad */
    addLine(`→ 🍺 Fogd meg a söröm!`,"m mvp",false,{t:"bravur",side:"us",p:"Kapus Kálmán",skill:"clutch_wall"});
    addLine(`70'  ZICCER! Kettesben a kapussal… Kapus kifut és hárít!`,"m ev",false,{t:"bravur",side:"us",p:"Kapus Kálmán",alt:"ziccer"});
    /* Torghelle: a kemény belépő sora maga az esemény */
    addLine(`72'  🦵 Szerelő beleszáll — Torghelle Sanyitól tanultam tisztán szerelni`,"m ev",false,{t:"szereles",side:"us",p:"Szerelő Szilárd",skill:"df_torghelle"});
    addLine(`74'  🦵 Más becsúszik — Labda vót spori!`,"m ev",false,{t:"szereles",side:"us",p:"Más Máté",skill:"df_clean"});
    const L2=mevLista();
    const g2=L2.filter(e=>e.t==="gol").slice(3).map(e=>[e.p,e.skill||null,e.skillP||null]);
    r.g2=g2;
    r.bravur=L2.filter(e=>e.t==="bravur").map(e=>[e.p,e.skill,e.alt]);
    r.szer=L2.filter(e=>e.t==="szereles").map(e=>[e.p,e.skill,evaSkillSablon(e)]);
    r.tipus=[evaSkillSablon({t:"gol",skill:"clutch_wall"}),evaSkillSablon({t:"bravur",skill:"clutch_wall"}),evaSkillSablon({t:"gol",skill:"df_torghelle"})];
    mevVege();
    /* a skill-pillanat a keret fölött is jelenetet kap; a sima szerelés nem */
    mevKezd({});_mev.anim=true;_mev.keret=3;_mev.hasznalt=3;
    r.keretSkill=mevValaszt({t:"szereles",side:"us",p:"X",skill:"df_torghelle",min:20});
    r.keretSima=mevValaszt({t:"szereles",side:"us",p:"Y",min:20});
    mevVege();_evaSor.length=0;
    /* 3.9.280 — a harmadik kör: a tizenegyes skillje a gólra, a szöcske a bravúrra */
    mevKezd({});_mev.keret=8;_mev.anim=false;goalNoteLeft=10;
    addLine(`60'  TIZENEGYES! Jég magabiztosan értékesíti  1:0`,"m goal");sbEv("us","goal","Jég Elek",60);
    addLine(`→ Jéghideg a legnagyobb pillanatban — ICE COLD`,"m skillnote",false,{skill:"fw_clutch"});
    addLine(`62'  BRAVÚR! Szöcske hihetetlen vetődéssel fogja a labdát — A szöcske!`,"m ev",false,{t:"bravur",side:"us",p:"Szöcske Szilárd",skill:"gk_grasshopper"});
    addLine(`64'  Öngól — ÖNGÓL! A védő a saját kapujába  2:0`,"m goal");sbEv("us","goal","öngól",64);
    addLine(`66'  🔥 A PADRÓL! Csere beugrik  3:0`,"m goal");sbEv("us","goal","Csere Csaba",66);
    const L3=mevLista();
    r.h3={pen:L3.filter(e=>e.t==="gol").map(e=>[e.p,e.alt||null,e.skill||null]),
      szocske:L3.filter(e=>e.t==="bravur").map(e=>[e.p,e.skill,evaSkillSablon(e)])};
    r.h3.sablon=L3.filter(e=>e.t==="gol").map(e=>evaSkillSablon(e)||evaAltSablon(e)||EVA_TIPUS_SABLON[e.t]);
    mevVege();
    /* skillenként egyszer a keret fölött */
    mevKezd({});_mev.anim=true;_mev.keret=3;_mev.hasznalt=3;
    r.egyszer=[mevValaszt({t:"bravur",side:"us",p:"Sz",skill:"gk_grasshopper",min:20}),mevValaszt({t:"bravur",side:"us",p:"Sz",skill:"gk_grasshopper",min:60})];
    mevVege();_evaSor.length=0;
    /* a gól fajtája szerinti jelenetek */
    r.alt=[["gol","ongol"],["golKapott","ongol"],["gol","potya"],["golKapott","potya"],["gol","csere"],["golKapott","csere"]].map(([t,alt])=>{
      const ev={t,side:t==="gol"?"us":"them",p:null,min:30,seq:5,alt};const sk=evaAltSablon(ev);
      if(!sk)return [t,alt,null];
      try{const T=EVA_SABLON[sk],c=evaKontextus(ev),svg=T.svg(c);T.mozgas(()=>({}),c);return [t,alt,sk,/evaLabda/.test(svg),T.cim(c)];}catch(e){return [t,alt,sk,"HIBA "+e.message];}});
    /* 3.9.283 — A KAPU RÁCSA */
    {const rnd=faceRnd("racs","proba");
     const sarok=s=>{let n=0;for(let i=0;i<3000;i++){const c=evaRacsValaszt(rnd,s);if(evaRacsSarok(c.col,c.row)>=.75)n++;}return n/3000;};
     r.racs={s:[0,.25,.5,.75,1].map(sarok),skala:[evaRacsS(40),evaRacsS(220),evaRacsS(400),evaRacsS(600)]};}
    /* minden gól- és védés-jelenet: a labda a cellába megy, a cella villan */
    {const ered=[];
     const proba=(sk,ev)=>{try{const c=evaKontextus(ev);_evaCel=c.cel;const T=EVA_SABLON[sk];const svg=T.svg(c);
       const hiv=[];T.mozgas((sel,fr,o)=>{hiv.push({sel,fr,o});return {};},c);
       const lab=hiv.filter(h=>h.sel==="#evaLabda").flatMap(h=>h.fr);
       const talal=lab.some(f=>{const m=/translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(f.transform||"");return m&&Math.abs(+m[1]-c.cel.x)<.6&&Math.abs(+m[2]-c.cel.y)<.6;});
       const villan=hiv.some(h=>h.sel==="#evaCella");
       const kap=hiv.filter(h=>h.sel==="#evaKapus").flatMap(h=>h.fr).map(f=>{const m=/rotate\(([-\d.]+)deg\)/.exec(f.transform||"");return m?+m[1]:0;});
       return {sk,cel:[c.cel.col,c.cel.row],talal,villan,rect:/id="evaCella"/.test(evaCellaRect()),fajta:c.cel.fajta,maxRot:kap.reduce((a,b)=>Math.abs(b)>Math.abs(a)?b:a,0),jobb:c.cel.x>=60};}
       catch(e){return {sk,hiba:e.message};}};
     const gol={t:"gol",side:"us",p:"Teszt Elek",min:30};
     Object.keys(EVA_SKILL_SABLON).forEach(id=>{const t=(EVA_SKILL_TIPUS[id]||["gol"])[0];
       ered.push(proba(EVA_SKILL_SABLON[id],Object.assign({},gol,{t,skill:id,skillP:"Teszt Elek",seq:ered.length})));});
     ["gol"].forEach(sk=>[null,"fejes","szabadrugas","tizenegyes"].forEach(alt=>ered.push(proba(sk,Object.assign({},gol,{alt,seq:ered.length})))));
     ered.push(proba("gol",{t:"golKapott",side:"them",p:"Ellen Fél",min:40,seq:90}));
     ["ongol","potya","csere","letamadas"].forEach(alt=>ered.push(proba(evaAltSablon({t:"gol",alt}),Object.assign({},gol,{alt,seq:ered.length}))));
     for(let i=0;i<8;i++)ered.push(proba("bravur",{t:"bravur",side:"us",p:"Kapus",min:50,seq:100+i}));
     ered.push(proba("tizenegyes",{t:"tizenegyes",side:"us",p:"Kapus",alt:"kivedve",min:50,seq:120}));
     ered.push(proba("tizenegyes",{t:"tizenegyes",side:"us",p:"Lövő",alt:"gol",min:50,seq:121}));
     ered.push(proba("loves",{t:"loves",side:"us",p:"Lövő",alt:"vedve",min:50,seq:122}));
     r.cel=ered.filter(x=>x.fajta==="gol"||x.fajta==="ved");
     r.celHiba=ered.filter(x=>x.hiba);
     r.bravurIrany=ered.filter(x=>x.sk==="bravur").map(x=>[x.jobb,x.maxRot]);}
    /* a szöglet a kapu előtt */
    {const c=evaKontextus({t:"szoglet",side:"us",p:"Teszt Elek",min:20,seq:3});const svg=EVA_SABLON.szoglet.svg(c);
     r.szoglet={kapu:/id="evaKapu"/.test(svg),kapus:/id="evaKapus"/.test(svg),vedo:/id="evaVedo"/.test(svg),lovo:/id="evaLovo"/.test(svg)};}
    /* új horgok: párkémia, tiki-taka (passzszám), buszsofőr */
    mevKezd({});_mev.keret=8;_mev.anim=false;goalNoteLeft=10;
    sbEv("us","goal","Kém Ia",30);addLine(`30'  GÓL! Kém  1:0`,"m goal");
    addLine(`→ 🤝 Nagyon összeszokottan játszanak`,"m skillnote",true,{skill:"chem_pair",skillP:"Pár Társ"});
    sbEv("us","goal","Tiki Taka",40);addLine(`40'  GÓL! Tiki  2:0`,"m goal");
    addLine(`→ 🌀 23 PASSZ!`,"m skillnote",false,{skill:"tikitaka",skillN:23});
    addLine(`🚌 JÖHET A BUSZSOFŐR!`,"m rc",false,{t:"busz",side:"us",p:null});
    {const L=mevLista();r.uj={kemia:L.filter(e=>e.p==="Kém Ia").map(e=>[e.skill,e.skillP]),tiki:L.filter(e=>e.p==="Tiki Taka").map(e=>[e.skill,e.skillN]),
      busz:L.filter(e=>e.t==="busz").map(e=>evaSkillSablon(e)||evaAltSablon(e)||EVA_TIPUS_SABLON[e.t])};}
    mevVege();
    mevKezd({});_mev.anim=true;_mev.keret=3;_mev.hasznalt=3;r.buszMindig=mevValaszt({t:"busz",side:"us",min:70});mevVege();_evaSor.length=0;
    /* a kapusmez: a klasszik párból, a csapat színeitől elütve */
    {const K=kapusKitNow(),H=kitForNow();r.kapus={k:K.c1,h:H.c1,tav:kapusMezTav(K.c1,H.c1),ajanlat:KAPUS_MEZ_AJANLAT.some(a=>a.c1===K.c1)};
     const c=evaKontextus({t:"bravur",side:"us",p:"Kapus",min:5,seq:7});r.kapus.jelenet=c.kapusKit&&c.kapusKit.c1===K.c1;
     const c2=evaKontextus({t:"gol",side:"us",p:"Teszt Elek",min:5,seq:8});r.kapus.ellen=c2.kapusKit&&c2.kapusKit.c1!==c2.vedoKit.c1;}
    /* 3.9.280 — BEJELENTETT HIBA: az ellenfél csapatneve a jelenetben a
       megjelenítési rétegen megy át (a valós név csak kalóz módban) */
    {const nyers="Real Madrid CF (2010/11)";const volt=huNamesOn();
     setHuNames(true);const hu=evaEllenfelCimke(nyers);
     setHuNames(false);const valos=evaEllenfelCimke(nyers);
     setHuNames(volt);
     r.cimke={hu,valos,tabla:clubLabel("Real Madrid CF")};}
    /* 3.9.284 — A MÉRÉS: a jelenet ugyanazt a számot mutatja, mint a feed */
    {const meresSor=()=>{const L=[...lines().children].reverse().find(d=>/📡/.test(d.textContent));const m=L&&/([\d.,]+) km\/h/.exec(L.textContent);return m?m[1]:null;};
     const nev="Mérő Márk "+Date.now();
     mevKezd({});_mev.keret=8;_mev.anim=false;goalNoteLeft=10;
     sbEv("us","goal",nev,10);addLine(`10'  GÓL! Mérő  1:0`,"m goal");
     emitMeasure("shot",nev,111.7,"10' ",true);
     const e1=mevLista().find(e=>e.t==="gol"&&e.p===nev);const f1=meresSor();
     sbEv("us","goal",nev,20);addLine(`20'  GÓL! Mérő  2:0`,"m goal");
     emitMeasure("shot",nev,124.3,"20' ",true);
     const e2=mevLista().filter(e=>e.t==="gol"&&e.p===nev)[1];const f2=meresSor();
     sbEv("us","goal",nev,30);addLine(`30'  GÓL! Mérő  3:0`,"m goal");
     emitMeasure("shot",nev,98.2,"30' ",true);
     const e3=mevLista().filter(e=>e.t==="gol"&&e.p===nev)[2];const f3=meresSor();
     sbEv("us","goal","Mérés Nélkül",40);addLine(`40'  GÓL! Nélkül  4:0`,"m goal");
     const e4=mevLista().find(e=>e.p==="Mérés Nélkül");
     const kij=m=>{const h=evaMeresKijelzo(m);const x=/>([\d.,]+) km\/h</.exec(h);return {szam:x?x[1]:null,rek:/ÚJ REKORD/.test(h),elso:/ELSŐ MÉRÉS/.test(h),eddig:(/eddig ([\d.,]+) km/.exec(h)||[])[1]||null};};
     r.meres={f:[f1,f2,f3],m:[e1&&e1.meres,e2&&e2.meres,e3&&e3.meres].map(m=>m&&m.ert),k:[kij(e1&&e1.meres),kij(e2&&e2.meres),kij(e3&&e3.meres)],
       nincs:evaMeresKijelzo(e4&&e4.meres)==="",
       /* a régi, sorsolt mérőórák eltűntek a skill-jelenetekből */
       regi:["skBolt","skAgyu","skSzitalos"].some(k=>{const c=evaKontextus({t:"gol",side:"us",p:"T",min:5,seq:1,skill:"sp_bolt"});_evaCel=c.cel;return /evaKmh|evaEro"/.test(EVA_SABLON[k].svg(c));})};
     /* a jelenetben: a kijelző a kamerán kívül, és animálódik */
     {const ev=Object.assign({},e2);const c=evaKontextus(ev);const hiv=[];evaMeresMozgas((sel)=>{hiv.push(sel);return {};},ev.meres,2000);r.meres.mozog=hiv;}
     mevVege();}
    /* 3.9.284 — A BLOKKOLT LÖVÉS: van védő, a labda belé vágódik és kipattan */
    {const ev={t:"loves",side:"us",p:"Lövő Lajos",alt:"blokkolva",min:33,seq:44};
     const c=evaKontextus(ev);_evaCel=c.cel;const T=EVA_SABLON.loves;const svg=T.svg(c);const hiv=[];
     T.mozgas((sel,fr,o)=>{hiv.push({sel,fr,o});return {};},c);
     const pos=f=>{const m=/translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(f.transform||"");return m?[+m[1],+m[2]]:null;};
     const lab=(hiv.find(h=>h.sel==="#evaLabda")||{fr:[]}).fr.map(pos);
     const ved=(hiv.find(h=>h.sel==="#evaVedo")||{fr:[]}).fr.map(pos);
     const lov=hiv.some(h=>h.sel==="#evaLovo");
     const talal=lab.some(p=>p&&Math.abs(p[0]-60)<2&&Math.abs(p[1]-73)<2);
     const vegLab=lab[lab.length-1],vegVed=ved[ved.length-1];
     r.blokk={vedo:/id="evaVedo"/.test(svg),vedoKit:svg.indexOf(c.vedoKit.c1)>=0,csatt:hiv.some(h=>h.sel==="#evaCsatt"),lov,talal,
       vedoUtban:!!vegVed&&(Math.abs(vegVed[0]-52)<1||Math.abs(vegVed[0]-68)<1)&&Math.abs(vegVed[1]-74)<1,kipattan:!!vegLab&&vegLab[1]>90,nincsCella:!hiv.some(h=>h.sel==="#evaCella"),cim:T.cim(c)};
     /* a mellé-lövésnél is ott a védő */
     const c2=evaKontextus({t:"loves",side:"us",p:"Lövő Lajos",alt:"melle",min:34,seq:45});r.blokk.mellevedo=/id="evaVedo"/.test(T.svg(c2));}
    /* 3.9.284 — IFI-BOOST: 23 éves korig bárki, az ikon nem */
    r.ifi={k23:canYouthBoost({n:"Ifi Huszonhárom",age:23,youthBonus:0}),k18:canYouthBoost({n:"Ifi Tizennyolc",age:18}),
      k24:canYouthBoost({n:"Nem Ifi",age:24,youthBonus:0}),ikon:canYouthBoost({n:"Ikon Ifi",age:20,isIcon:true}),
      regi:canYouthBoost({n:"Régi Bejegyzés",youthBonus:3}),plafon:potCapFor({n:"Ifi Huszonhárom",age:23})===potHardCap()};
    return r;});
  ok(JSON.stringify(sk.g[0])===JSON.stringify(["gol","Bomba Béla","fw_cannon","Bomba Béla"]),"a skill a gólra kerül (az első nyer)",sk.g[0]);
  ok(JSON.stringify(sk.g[1])===JSON.stringify(["gol","Klose Miró","sp_flank","Arjen Robben"]),"sebesség-skill: a gólpasszadó a gazdája",sk.g[1]);
  ok(JSON.stringify(sk.g[2])===JSON.stringify(["gol","Juni Pernambuco","mf_fk","Juni Pernambuco"]),"szabadrúgásgól: a skill a gól sorából",sk.g[2]);
  ok(sk.g[3]&&sk.g[3][0]==="golKapott"&&sk.g[3][2]===null,"az ellenfél gólja nem kap skillt",sk.g[3]);
  ok(sk.jelenet.length===26&&sk.jelenet.every(j=>j.ok&&/!$/.test(j.cim)&&j.kulon!==false),"mind a 26 skill-jelenet kirajzolódik és lefut, a saját feliratával (a gólpasszadó skillesek a saját figurájukkal)",sk.jelenet.filter(j=>!(j.ok&&/!$/.test(j.cim)&&j.kulon!==false)).map(j=>j.id+":"+(j.cim||j.hiba)+(j.kulon===false?"(!kulon)":"")+(j.ok?"":"(!ok)")));
  ok(JSON.stringify(sk.g2)===JSON.stringify([["Hős Huba","clutch_hero","Hős Huba"],["Csatár Csaba","mf_surgeon","Sebész Sebő"],["Gól Gábor",null,null]]),"3.9.279: a hős felülír, a jelenet nélküli skill nem foglal, a Sebészi passz a gólpasszadóé",sk.g2);
  ok(JSON.stringify(sk.bravur)===JSON.stringify([["Kapus Kálmán","clutch_wall","ziccer"]]),"„Fogd meg a söröm!”: egy bravúr-esemény, a védés sora ráolvad",sk.bravur);
  ok(JSON.stringify(sk.szer)===JSON.stringify([["Szerelő Szilárd","df_torghelle","skTorghelle"],["Más Máté","df_clean",null]]),"Torghelle: a becsúszás névvel, a saját jelenetével (a többi szerelés sima)",sk.szer);
  ok(JSON.stringify(sk.tipus)===JSON.stringify([null,"skSor",null]),"a skill-jelenet csak a saját eseménytípusán",sk.tipus);
  ok(JSON.stringify(sk.h3.pen)===JSON.stringify([["Jég Elek","tizenegyes","fw_clutch"],[null,"ongol",null],["Csere Csaba","csere",null]]),"3.9.280: a tizenegyes skillje a gólra kerül; öngól, a padról",sk.h3.pen);
  ok(JSON.stringify(sk.h3.sablon)===JSON.stringify(["skJeg","evOngol","evCsere"])&&JSON.stringify(sk.h3.szocske)===JSON.stringify([["Szöcske Szilárd","gk_grasshopper","skSzocske"]]),"ICE COLD, öngól, a padról, a szöcske: a saját jelenetük",[sk.h3.sablon,sk.h3.szocske]);
  ok(sk.egyszer[0]===true&&sk.egyszer[1]===false,"a skill-pillanat keret fölött meccsenként egyszer",sk.egyszer);
  ok(sk.alt.filter(a=>a[2]).length===5&&sk.alt.every(a=>a[2]===null?a[0]==="golKapott"&&a[1]==="csere":a[3]===true&&/!|…/.test(a[4])),"öngól, potyagól (mindkét oldalon), a padról (csak a miénk): kirajzolódik, lefut",sk.alt);
  console.log("— 3.9.283 —");
  {const v=sk.racs.s;ok(v.every((x,i)=>i===0||x>v[i-1])&&v[0]<.12&&v[4]>.6,"a rács: minél jobb a képesség, annál inkább a sarok (40→400 folyamatosan)",v.map(x=>Math.round(x*100)+"%"));
   ok(JSON.stringify(sk.racs.skala)===JSON.stringify([0,.5,1,1]),"a skála 40-től 400-ig",sk.racs.skala);}
  ok(sk.celHiba.length===0&&sk.cel.length>=30&&sk.cel.every(x=>x.talal&&x.villan&&x.rect),"minden gól- és védés-jelenetben a labda a célzott cellába megy, és az villan",sk.cel.filter(x=>!(x.talal&&x.villan&&x.rect)).map(x=>x.sk).concat(sk.celHiba.map(x=>x.sk+":"+x.hiba)));
  ok(sk.bravurIrany.every(([j,r])=>r===0||(j?r>0:r<0)),"a bravúr vetődése mindig a lövés felé (a forgatás előjele)",sk.bravurIrany);
  ok(Object.values(sk.szoglet).every(Boolean),"a szöglet a kapu előtt: kapu, kapus, védő, támadó",sk.szoglet);
  ok(JSON.stringify(sk.uj)===JSON.stringify({kemia:[["chem_pair","Pár Társ"]],tiki:[["tikitaka",23]],busz:["evBusz"]})&&sk.buszMindig===true,"párkémia, tiki-taka (a passzszámmal), buszsofőr: a saját jelenetük",[sk.uj,sk.buszMindig]);
  ok(sk.kapus.ajanlat&&sk.kapus.tav>120&&sk.kapus.jelenet&&sk.kapus.ellen,"a kapusmez: klasszik pár, elüt a mezünktől; a jelenetben a mi kapusunk abban, az övék egy elütőben",sk.kapus);
  ok(sk.cimke.hu===sk.cimke.tabla&&!/Real Madrid/.test(sk.cimke.hu)&&sk.cimke.valos==="Real Madrid CF","az ellenfél neve: magyar módban az átírt, kalóz módban a valós (szezon nélkül)",sk.cimke);
  ok(sk.keretSkill===true&&sk.keretSima===false,"a skill-pillanat a keret fölött is jelenetet kap",[sk.keretSkill,sk.keretSima]);
  console.log("— 3.9.284 —");
  {const M=sk.meres;
   ok(M.f.every(Boolean)&&M.f.every((x,i)=>x===String(M.m[i])&&x===M.k[i].szam),"a jelenet mérő-kijelzője pontosan a feed számát mutatja",M);
   ok(M.k[0].elso&&!M.k[0].rek&&M.k[1].rek&&M.k[1].eddig==="111.7"&&!M.k[2].rek&&!M.k[2].elso,"első mérés / új rekord (az eddigi csúccsal) / sima mérés",M.k);
   ok(M.nincs&&!M.regi,"mérés nélkül nincs kijelző; a régi, sorsolt mérőórák eltűntek",[M.nincs,M.regi]);
   ok(M.mozog.indexOf("#evaMeres")>=0&&M.mozog.indexOf("#evaRekord")>=0,"a kijelző és a rekord-jelvény animálódik",M.mozog);}
  {const B=sk.blokk;ok(B.vedo&&B.vedoKit&&B.csatt&&B.lov&&B.talal&&B.vedoUtban&&B.kipattan&&B.nincsCella&&B.cim==="Blokk!"&&B.mellevedo,
    "a blokkolt lövés: a lövő rúg, az ellenfél védője a lövés útjába csúszik, a labda belé vágódik és kipattan",B);}
  {const I=sk.ifi;ok(I.k23&&I.k18&&!I.k24&&!I.ikon&&I.regi&&I.plafon,"ifi-boost: 23 éves korig bárki (ifi-bónusz nélkül is), 24 évesen nem, ikon nem",I);}
  ok(s1.test.torzs&&s1.test.fejViewBox&&s1.test.nincsVall&&s1.test.bor,"a figura: csak-fej kép + saját mezes törzs, a bőrszínnel",s1.test);

  const meccs=async(seb,opt)=>p.evaluate(async([seb,opt])=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const _tm=matchSpeedTickMs;matchSpeedTickMs=()=>40;
    const regi=matchSpeed;matchSpeed=seb;evaIdoSzorzo=0.12;
    if(opt&&opt.ki)try{localStorage.setItem(MEV_ANIM_KEY,"1");}catch(e){}
    const r={jelenet:0,orasAll:0,oraJar:0,tovabb:0,vissza:0,kiGomb:false,utanaKi:0};
    let lattam=null;
    try{
      for(let i=0;i<400&&S.playing;i++)await varj(40);
      for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
      try{utoLancVege();mEloTorol();}catch(e){}
      if(S.idx>=28)S.idx=0;
      S.auto=false;S.lastMatch=null;
      playMatch();
      for(let i=0;i<2500&&!S.lastMatch;i++){
        await varj(20);
        const el=document.getElementById("evAnim");
        const lat=!!el&&!el.classList.contains("hide");
        if(lat&&_evaFut&&_evaFut!==lattam){
          lattam=_evaFut;r.jelenet++;
          /* az óra áll? */
          if(MATCH_CTL&&!MATCH_CTL.canPause())r.orasAll++;else r.oraJar++;
          if(opt&&opt.tovabb&&r.jelenet===2){el.click();r.tovabb++;}
          if(opt&&opt.vissza&&r.jelenet===3){if(gameBackStep())r.vissza++;}
          if(opt&&opt.kiGomb&&r.jelenet===2){document.getElementById("evaKi").click();r.kiGomb=true;}}
        if(r.kiGomb&&lat&&_evaFut&&_evaFut!==lattam)r.utanaKi++;}
      await varj(300);
      r.vege=!!S.lastMatch;r.kivalasztott=mevLista().filter(e=>e.anim).length;
      r.keret=(_mev||_mevUtolso||{}).keret;r.rejtve=document.getElementById("evAnim")?document.getElementById("evAnim").classList.contains("hide"):true;
      r.sor=_evaSor.length;
    }finally{matchSpeedTickMs=_tm;matchSpeed=regi;evaIdoSzorzo=1;try{localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}}
    return r;},[seb,opt||null]);

  console.log("\n— 2. VALÓDI MECCS, 0,1× —");
  const m1=await meccs(0.1,{tovabb:true,vissza:true});
  ok(m1.vege,"a meccs lefut",m1);
  ok(m1.jelenet>=3,"jelenetek futnak",{jelenet:m1.jelenet,kivalasztott:m1.kivalasztott});
  ok(m1.jelenet<=m1.kivalasztott,"nem több jelenet, mint kiválasztott esemény",m1);
  ok(m1.orasAll===m1.jelenet&&m1.oraJar===0,"minden jelenet alatt ÁLL az óra",{all:m1.orasAll,jar:m1.oraJar});
  ok(m1.tovabb===1&&m1.vissza===1,"koppintás és vissza gomb továbblép",m1);
  ok(m1.rejtve&&m1.sor===0,"a végén nincs nyitott jelenet és sor",m1);

  console.log("\n— 3. „NE MUTASD TÖBBET” —");
  const m2=await meccs(0.1,{kiGomb:true});
  ok(m2.vege&&m2.kiGomb&&m2.utanaKi===0,"a gomb után a meccs hátralevő részében nincs jelenet",m2);

  console.log("\n— 4. GYORS TEMPÓ ÉS KIKAPCSOLVA —");
  const m3=await meccs(0.5);
  ok(m3.vege&&m3.jelenet===0,"0,5×: nincs jelenet",m3);
  const m4=await meccs(0.1,{ki:true});
  ok(m4.vege&&m4.jelenet===0,"kikapcsolva: nincs jelenet",m4);

  console.log("\n— 6. HIBÁK —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
