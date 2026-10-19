/* 🎚 3.9.257 — A CSAPATSTÍLUS-RENDSZER EGYSÉGESÍTÉSE, FELFELÉ.

   KIMONDOTT KÉRÉS: „Nézd át az egész csapatstílus rendszert, hogy legyen
   következetes, egy egyenletes az egyes stílusok működése. És semmiképp ne
   nehezíts rajtuk. Ha kiegyenlítesz, akkor felfelé."

   Amit mér (valódi függvények, valódi karrier-keret):
     1. AZ ÁRLÉTRA: a 10. szintig 2 500 pont (régen 13 870), a motor és a
        Panzer ugyanazt a táblát használja; a kapu 2+n (3.-tól 12.-ig);
     2. A MEZŐNY-SKÁLA: 100-as mezőnyig betűre a régi hozam, 350-esnél a plafon,
        az ív és a hozam ×3,5 — Panzerben és a motorban egyaránt;
     3. A PANZER BONTÁSA: négy tényező, a mélység betűre a régi bázis, a
        félelem szint sosem kisebb a réginél, és a panel kiírja;
     4. A TIKI-TAKA SZEREPEI: mind a három kap attribútum-gazdát, a kártyán
        megjelenik az „EMBER is számít" sor, és a Látnok darabszáma nem
        torzul;
     5. A SZTÁR MOTORJA: él, négy tényezőből áll, a sztár gólja és gólpassza
        fizet, a bolt három tétele él, a panel kirajzolódik;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9257;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof fearParts==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xs=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    const uj=(k)=>{S.style={key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
      try{styleLvlCacheClear();}catch(e){}};

    /* ── 1. AZ ÁRLÉTRA ── */
    ki.ar={osszeg:ENG_PRICE.reduce((a,x)=>a+x,0),egyTabla:ENG_PRICE===RETTEGES_PRICE,
      kapu:[1,2,3,4,5,6,7,8,9,10].map(n=>engNeedLevel(n)),kapuP:[1,10].map(n=>rettegesNeedLevel(n))};

    /* ── 2. A MEZŐNY-SKÁLA ── */
    const _sl=window.styleLevel;
    window.styleLevel=()=>14;
    uj("villam");
    const E=engState("villam");E.lvl=5;
    const mezo=(f)=>{oppTargetRating=f;return {bon:engOvrBonusK("villam"),cap:engOvrCapK("villam"),
      iv:styleRampCap(ENG_OVR_CAP,5,false),allapot:engLevel("villam"),fs:styleFieldScale()};};
    const _el=window.engLevel;
    window.engLevel=()=>500;   /* nagy állapot: az ív dönt */
    ki.m85=mezo(85);ki.m100=mezo(100);ki.m350=mezo(350);
    window.engLevel=()=>40;    /* kis állapot: a nyers hozam dönt */
    ki.k85=mezo(85);ki.k350=mezo(350);
    window.engLevel=_el;
    /* a régi képlet 100-as mezőnyben, betűre */
    ki.regi85=Math.round(Math.min(ENG_OVR_CAP,ENG_OVR_CAP*5/10,500*ENG_PCT[5])*10)/10;
    /* Panzer ugyanúgy */
    uj("panzer");S.style.fear={pts:0,earned:0,spent:0,retteges:5,mods:0};
    const _fl=window.fearLevel;window.fearLevel=()=>500;
    oppTargetRating=85;ki.p85=fearOvrBonus();
    oppTargetRating=350;ki.p350=fearOvrBonus();ki.pcap350=fearOvrCap();
    ki.panelP=fearSectionHtml();
    window.fearLevel=_fl;
    oppTargetRating=85;

    /* ── 3. A PANZER BONTÁSA ── */
    window.styleLevel=()=>10;
    uj("panzer");S.style.fear={pts:0,earned:0,spent:0,retteges:0,mods:0};
    /* két vadállat, hogy a csúcs és a kötés is mérhető legyen */
    [xs[1],xs[2],xs[3]].forEach(pl=>{const e=careerPool[pl.n];e.kapI=0;e.verI=VER_LEVELS.length-1;e.karI=0;});
    const P=fearParts();
    ki.panzer={ids:P.map(x=>x.id),mely:P[0].v,regiBazis:Math.round(fearBase()*10)/10,
      el:P[1].v,chem:P[2].v,skill:P[3].v,
      szint:fearLevel(),regiSzint:Math.round(fearBase()*fearScale()),
      maxok:P.map(x=>x.max)};
    ki.panzerPanel=/A legfélelmetesebb három/.test(fearSectionHtml())&&/négy tényezőből/.test(fearSectionHtml());

    /* ── 4. A TIKI-TAKA SZEREPEI ── */
    uj("tikitaka");
    S.roles={season:S.seasonNumber||1,map:{stabil:xs[3].n,latnok:xs[6].n,aura:xs[9].n}};
    try{roleAttrCacheClear();}catch(e){}
    ki.tiki={stabil:roleAttrInfo("stabil","v"),stabil2:roleAttrInfo("stabil","v2"),
      latnok:roleAttrInfo("latnok","v"),latnok2:roleAttrInfo("latnok","v2"),
      aura:roleAttrInfo("aura","v"),cimke:roleAttrLabel("golpassz"),
      latnokDb:Math.round(roleVal("latnok","v2")),
      latnokGyenge:roleVal("latnok","v"),latnokRegi:ROLE_DEFS.latnok.v[roleLevel("latnok")]};
    {const w=document.createElement("div");w.innerHTML=roleSectionHtml();
     const t=w.textContent.replace(/\s+/g," ");
     ki.tiki.kartya=(t.match(/Az EMBER is számít/g)||[]).length;
     ki.tiki.lejto=/×1-től ×1,45-ig/.test(t);
     ki.tiki.nyers=/golpassz/.test(t);}
    S.roles=null;

    /* ── 5. A SZTÁR MOTORJA ── */
    uj("sztar");
    const csillag=xs[9].n;
    S.style.star=csillag;
    ki.sztar={kulcsok:engKeys(),reszek:engBaseParts("sztar").map(x=>[x.id,x.n,x.v,x.max]),
      allapot:engLevel("sztar"),bolt:engShopList("sztar").map(x=>x.kind)};
    /* a tarifa: a sztár gólja és gólpassza fizet, a többieké csak a „gól" */
    engMatchStart();
    _engAcc={};engGoalNote(csillag);ki.sztar.sajatGol=Math.round(engAcc("sztar").raw*100)/100;
    _engAcc={};engGoalNote(xs[2].n);ki.sztar.masGol=Math.round(engAcc("sztar").raw*100)/100;
    _engAcc={};engAssistNote(csillag);ki.sztar.sajatPassz=Math.round(engAcc("sztar").raw*100)/100;
    _engAcc={};engAssistNote(xs[2].n);ki.sztar.masPassz=Math.round(engAcc("sztar").raw*100)/100;
    ki.sztar.scaleT=engScaleT("sztar");
    _engAcc={};engFullTimeNote({},0,1,{});ki.sztar.palyan=Math.round(engAcc("sztar").raw*100)/100;
    {const sl=slots.find(x=>x&&x.player&&x.player.n===csillag),ment=sl.player;sl.player=null;
     _engAcc={};engFullTimeNote({},0,1,{});ki.sztar.padon=Math.round(engAcc("sztar").raw*100)/100;sl.player=ment;}
    _engAcc={};
    /* a szint megvehető és meccserőt ad */
    const ES=engState("sztar");ES.pts=1000;
    ki.sztar.miert=engNextWhy("sztar");
    try{engBuyLevel("sztar");}catch(e){ki.sztar.vetelHiba=String(e);}
    ki.sztar.lvl=engLvl("sztar");ki.sztar.bonusz=engOvrBonusK("sztar");
    ki.sztar.panel=/Ragyogás|ragyogás/.test(engSectionHtml("sztar"))&&/Kiemelkedés/.test(engSectionHtml("sztar"))
      &&/Az öltöző/.test(engSectionHtml("sztar"));
    /* sztár nélkül néma, de nem dől el */
    S.style.star=null;
    ki.sztar.nincsSztar=engBaseParts("sztar").map(x=>x.v);
    window.styleLevel=_sl;
    S.style=null;S.style2=null;
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("=== 1. az árlétra ===");
  ok(r.ar.osszeg===2500,"a 10. szintig összesen 2 500 pont (régen 13 870)",r.ar.osszeg);
  ok(r.ar.egyTabla,"a motor és a Panzer EGY árlétrát használ");
  ok(r.ar.kapu.join()==="3,4,5,6,7,8,9,10,11,12"&&r.ar.kapuP.join()==="3,12","a kapu 2+n: az 1. szint a 3., a 10. a 12. csapatstílus-szinten",r.ar);

  console.log("=== 2. a mezőny-skála ===");
  ok(r.m85.fs===1&&r.m100.fs===1&&Math.abs(r.m350.fs-3.5)<1e-9,"a szorzó: 85 → 1, 100 → 1, 350 → 3,5",[r.m85.fs,r.m100.fs,r.m350.fs]);
  ok(r.m85.bon===r.regi85&&r.m100.bon===r.regi85,"100-as mezőnyig betűre a régi hozam",{most:r.m85.bon,regi:r.regi85});
  ok(Math.abs(r.m350.bon-r.m85.bon*3.5)<0.11&&Math.abs(r.m350.cap-r.m85.cap*3.5)<0.11,"350-es mezőnyben a hozam és a plafon ×3,5",{b85:r.m85.bon,b350:r.m350.bon,c85:r.m85.cap,c350:r.m350.cap});
  ok(Math.abs(r.k350.bon-r.k85.bon*3.5)<0.11,"kis állapotnál is (a nyers hozam is skálázódik)",{k85:r.k85.bon,k350:r.k350.bon});
  ok(Math.abs(r.p350-r.p85*3.5)<0.11&&r.pcap350===70,"Panzer: a hozam ×3,5, a +20-as tető 350-es mezőnyben +70",{p85:r.p85,p350:r.p350,cap:r.pcap350});
  ok(/mezőnnyel nő/.test(r.panelP),"a Panzer panelje kimondja a mezőny-szorzót");

  console.log("=== 3. a Panzer bontása ===");
  ok(r.panzer.ids.join()==="melyseg,el,chem,skill","négy tényező, ugyanaz a négy, mint a motornál",r.panzer.ids);
  ok(r.panzer.mely===r.panzer.regiBazis,"a mélység betűre a régi bázis",r.panzer);
  ok(r.panzer.el>0&&r.panzer.el<=30,"a legfélelmetesebb három adja az élt (≤ 30)",r.panzer.el);
  ok(r.panzer.maxok.slice(1).join()==="30,24,18","a tetők a motoréi: 30 · 24 · 18",r.panzer.maxok);
  ok(r.panzer.szint>=r.panzer.regiSzint,"a félelem szint sosem kisebb a réginél",{most:r.panzer.szint,regi:r.panzer.regiSzint});
  ok(r.panzerPanel,"a panel kiírja a négy tényezőt");

  console.log("=== 4. a Tiki-taka szerepei ===");
  ok(r.tiki.stabil&&r.tiki.stabil.a==="passz"&&r.tiki.stabil2&&r.tiki.stabil2.a==="passz","Stabil kezdés: a Passz a gazda (mindkét fele)",[r.tiki.stabil,r.tiki.stabil2]);
  ok(r.tiki.latnok&&r.tiki.latnok.a==="passz"&&r.tiki.latnok2===null,"Lát a pályán: a Passz a gazda, a darabszám (v2) nem torzul",[r.tiki.latnok,r.tiki.latnok2]);
  ok([r.tiki.stabil,r.tiki.latnok,r.tiki.aura].every(x=>x&&x.k>=1),"felfelé: a szorzó ×1 alá nem mehet (a régi szám a padló)",[r.tiki.stabil.k,r.tiki.latnok.k,r.tiki.aura.k]);
  ok(r.tiki.latnokGyenge>=r.tiki.latnokRegi,"egy átlag alatti Látnok is legalább a régi számot hozza",{most:r.tiki.latnokGyenge,regi:r.tiki.latnokRegi});
  ok(r.tiki.aura&&r.tiki.aura.a==="golpassz"&&r.tiki.cimke==="Jegyzőkönyv-erő","Aurafarmer: a Gól és a Passz átlaga („Jegyzőkönyv-erő”)",[r.tiki.aura,r.tiki.cimke]);
  ok(r.tiki.lejto,"a kártya a ×1-es padlót írja ki");
  ok(r.tiki.kartya===3&&!r.tiki.nyers,"a kártyán mind a háromnál ott az „EMBER is számít” sor, nyers kulcs nélkül",r.tiki.kartya);

  console.log("=== 5. a Sztár motorja ===");
  ok(r.sztar.kulcsok.indexOf("sztar")>=0,"a Sztárnak is fut a gazdasága",r.sztar.kulcsok);
  ok(r.sztar.reszek.map(x=>x[0]).join()==="melyseg,el,chem,skill"&&r.sztar.reszek[0][1]==="Kiemelkedés","négy tényező, a törzs neve Kiemelkedés",r.sztar.reszek);
  ok(r.sztar.allapot>0,"a ragyogás él (> 0)",r.sztar.allapot);
  ok(r.sztar.bolt.join()==="fx1,bond,train","a bolt három tétele: egy meccs · kötés · edzés",r.sztar.bolt);
  {const T=r.sztar.scaleT;
   ok(Math.abs(r.sztar.sajatGol-(1.2+0.3)*T)<0.02&&Math.abs(r.sztar.masGol-0.3*T)<0.02,"a sztár gólja 1,2 + 0,3, másé 0,3",{s:r.sztar.sajatGol,m:r.sztar.masGol,T});
   ok(Math.abs(r.sztar.sajatPassz-0.8*T)<0.02&&r.sztar.masPassz===0,"a sztár gólpassza 0,8, másé semmi",{s:r.sztar.sajatPassz,m:r.sztar.masPassz});
   ok(Math.abs(r.sztar.palyan-1.0*T)<0.02&&r.sztar.padon===0,"a sztár a pályán: 1,0 a lefújáskor, padon semmi",{be:r.sztar.palyan,ki:r.sztar.padon});}
  ok(r.sztar.miert===""&&r.sztar.lvl===1&&r.sztar.bonusz>0,"a Reflektorfény megvehető és meccserőt ad",r.sztar);
  ok(r.sztar.panel,"a panel kirajzolódik (ragyogás · Kiemelkedés · Az öltöző)");
  ok(r.sztar.nincsSztar.every(x=>x===0),"kijelölt sztár nélkül nulla, nem hiba",r.sztar.nincsSztar);

  ok(String(r.verzio).localeCompare("3.9.257",undefined,{numeric:true})>=0,"verzió legalább 3.9.257",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
