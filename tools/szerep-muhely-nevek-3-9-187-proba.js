/* 🪓⚡ 3.9.187 — PANZER SZEREP-ERŐSÍTŐ, GEGENPRESSING STÁB-MŰHELY, ÖT NÉVKÖTEG.

   BEJELENTETT HIÁNY: „Panzerkampfwagennél nincsen kiosztott szerepek erősítő
   képesség, Gegenpressingnél stábtag erősítő képesség." És: „A névjavaslatok
   mehetnek."

   Amit mér:
     1. PANZER — a „Kiosztott szerepek" a fában áll; a szintje a három szerep
        (Mészáros, Vezér, Falka) szintje, és a hatásuk PONTOSAN a ROLE_DEFS
        szintenkénti értéke; képesség nélkül a 0. (alap) szint marad; a kártya
        szövege ugyanazt a számot írja, amivel a játék számol;
     2. GEGENPRESSING — a „Letámadás-műhely" a fában áll; a Sprintmester és a
        Bástya hatékonysága ×1,20 / ×1,32 / ×1,45, a tapasztalat-tempója
        +1 / +2 / +3; más stábtag-típusra nem hat; képesség nélkül ×1;
     3. A TELJES KÉP — a sztáron kívül minden stílusnak van szerep-erősítője,
        és mindnek van stábtag-erősítő műhelye (a sztárét a próba kiírja);
     4. NEVEK — mind a 49 jóváhagyott név a táblában van, a megjelenítés is
        azt írja ki; nincs két különböző emberen azonos teljes név;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9230;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const NEVEK={
 "Xabi Alonso":"Álomszó Csabi","Kostas Manolas":"Mandolás Kostás","Theodoros Zagorakis":"Zagyva Teó",
 "Mark Viduka":"Vidámka Márk","Gabriel Milito":"Miliméteres Gábor","Julian Brandt":"Pálinkás Gyula",
 "Wolfgang Overath":"Óvárosi Farkas","Danilo D'Ambrosio":"Dámvadas Dani",
 "Julio Baptista":"Keresztelő Gyula","Mikaël Silvestre":"Szilveszter Mihály","Anthony Modeste":"Módos Antal",
 "Wayne Bridge":"Hidas Vendel","Phil Barber":"Borbély Fülöp","Mario Kempes":"Kemence Márió",
 "Carsten Ramelow":"Rámolós Krisztián","Youri Mulder":"Mulató Jenő","Wolfgang Kraus":"Káosz Farkas",
 "Mauricio Pochettino":"Pocsolyás Móric",
 "Pablo Armero":"Ármány Pál","Paolo Vanoli":"Vaníliás Pál","Esteban Granero":"Gránátos István",
 "Eric Young":"Ifjú Erik","John Mahoney":"Mahagóni János","Holger Badstuber":"Fürdőszobás Huba",
 "Simone Bastoni":"Bástyás Simon","Eric Remedi":"Remete Erik","Kevin Davies":"Dévényi Kelemen",
 "Erik Pieters":"Péterfi Erik",
 "Colin Todd":"Tudós Kolos","Alexandre Pato":"Kacsa Sándor","Paul Parker":"Parkoló Pál",
 "Massimo Oddo":"Odú Miksa","Mark Flekken":"Foltos Márk","Romain Danzé":"Táncos Román",
 "Christopher Operi":"Operettes Kristóf","Mattia Perin":"Peres Máté","Andreas Buck":"Bakos András",
 "Mark Fish":"Halas Márk",
 "Germán Burgos":"Burgonya Rezső","Gary Medel":"Medve Geri","Franck Sauzée":"Szósz Ferkó",
 "Manuel Lazzari":"Lazsáló Manó","Gianfranco Bedin":"Bödön Bertalan","Carlos Augusto":"Augusztus Károly",
 "Markus Babbel":"Bábel Márk","David Jemmali":"Zsemle Dávid","Fernando Vega":"Vége Nándor",
 "Bernd Dürnberger":"Dörmögő Bernát","André Alves":"Álmos András"};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof styleTraitList==="function"&&typeof roleLevel==="function",null,{timeout:15000});

  const r=await p.evaluate((NEVEK)=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    phase="season";
    const szint=(key,traits)=>{S.style={key,traits:traits||{}};S.style2=null;};

    /* ---- 1. PANZER ---- */
    const pt=styleTraitList("panzer").find(t=>t.key==="szerepek");
    ki.pVan=!!pt&&pt.lv.length===3&&pt.lv.every((L,i)=>L.fx&&L.fx.roleLvl===i+1);
    ki.pSzint=[];ki.pErtek=[];
    for(let lv=0;lv<=3;lv++){
      szint("panzer",lv?{szerepek:lv}:{});
      ki.pSzint.push(["meszaros","vezer","falka"].map(k=>roleLevel(k)));
      ki.pErtek.push(["meszaros","vezer","falka"].map(k=>roleVal(k)).concat([roleVal("meszaros","v2")]));}
    ki.pVart=[0,1,2,3].map(lv=>[ROLE_DEFS.meszaros.v[lv],ROLE_DEFS.vezer.v[lv],ROLE_DEFS.falka.v[lv],ROLE_DEFS.meszaros.v2[lv]]);
    /* a kártya számai a ROLE_DEFS-ből: −5,5% / −32% / −7% az 1. szinten … */
    const pct=x=>String(Math.round(Math.abs(1-x)*1000)/10).replace(".",",");
    ki.pNote=pt?pt.lv.map(L=>L.note):[];
    ki.pNoteOk=pt&&[1,2,3].every(lv=>{
      const n=pt.lv[lv-1].note;
      return n.indexOf(pct(ROLE_DEFS.meszaros.v[lv]))>=0&&n.indexOf(pct(ROLE_DEFS.vezer.v[lv]))>=0
        &&n.indexOf(pct(ROLE_DEFS.falka.v[lv]))>=0;});
    /* a másik stílus szintje nem szivárog át: Beton szerepek 3 mellett a Panzer szerepe 0 */
    S.style={key:"beton",traits:{szerepek:3}};S.style2={key:"panzer",traits:{}};
    ki.pAtszivarog=roleLevel("meszaros");
    S.style2={key:"panzer",traits:{szerepek:2}};
    ki.pMasodlagos=roleLevel("falka");

    /* ---- 2. GEGENPRESSING ---- */
    const gt=styleTraitList("gegen").find(t=>t.key==="letamadas_muhely");
    ki.gVan=!!gt;
    ki.gPow=[];ki.gXp=[];
    for(let lv=0;lv<=3;lv++){
      szint("gegen",lv?{letamadas_muhely:lv}:{});
      ki.gPow.push(["attr:seb","attr:ved","attr:gol","attr:passz","morale"].map(t=>styleCoachPowerMult(t)));
      ki.gXp.push(["attr:seb","attr:ved","attr:gol"].map(t=>styleCoachXp(t)));}
    ki.gCond=gt&&typeof gt.cond==="function"?String(gt.cond()):"";

    /* ---- 3. A TELJES KÉP ---- */
    ki.kep={};
    STYLES.forEach(st=>{
      const L=styleTraitList(st.key);
      ki.kep[st.key]={szerep:L.some(t=>t.lv.some(x=>x.fx&&x.fx.roleLvl)),
        muhely:L.some(t=>t.lv.some(x=>x.fx&&x.fx.coachPow))};});

    /* ---- 4. NEVEK ---- */
    ki.nevHiany=[];ki.megjelen=[];
    Object.keys(NEVEK).forEach(real=>{
      const e=HU_NAME_TABLE[real];
      if(!e||e[0]!==NEVEK[real])ki.nevHiany.push([real,e]);
      let f="";try{f=fullName(real);}catch(x){f="";}
      if(f!==NEVEK[real])ki.megjelen.push([real,f]);});
    const by={};Object.keys(HU_NAME_TABLE).forEach(k=>{const f=HU_NAME_TABLE[k][0];(by[f]=by[f]||[]).push(k);});
    ki.dupla=Object.keys(NEVEK).map(r=>NEVEK[r]).filter(f=>(by[f]||[]).length>1);
    return ki;},NEVEK);

  console.log("\n— 1. PANZER: KIOSZTOTT SZEREPEK —");
  ok(r.pVan,"a Panzer fáján ott a „Kiosztott szerepek”, három szinttel");
  ok(JSON.stringify(r.pSzint)==="[[0,0,0],[1,1,1],[2,2,2],[3,3,3]]","a képesség szintje a három szerep szintje (képesség nélkül 0)",r.pSzint);
  ok(JSON.stringify(r.pErtek)===JSON.stringify(r.pVart),"a hatás pontosan a ROLE_DEFS szintenkénti értéke (Mészáros, Vezér, Falka, a Mészáros lap-szorzója)",{mert:r.pErtek,vart:r.pVart});
  ok(r.pNoteOk,"a kártya szövege ugyanazt a számot írja, amivel a játék számol",r.pNote);
  ok(r.pAtszivarog===0&&r.pMasodlagos===2,"a szint a szerep SAJÁT stílusáé: a Beton képessége nem emeli, másodlagos Panzerként a saját szintje él",{at:r.pAtszivarog,masod:r.pMasodlagos});
  console.log("\n— 2. GEGENPRESSING: LETÁMADÁS-MŰHELY —");
  ok(r.gVan,"a Gegenpressing fáján ott a „Letámadás-műhely”");
  ok(JSON.stringify(r.gPow)==="[[1,1,1,1,1],[1.2,1.2,1,1,1],[1.32,1.32,1,1,1],[1.45,1.45,1,1,1]]",
     "a Sprintmester és a Bástya hatékonysága ×1,20 / ×1,32 / ×1,45 — más stábtagra nem hat, képesség nélkül ×1",r.gPow);
  ok(JSON.stringify(r.gXp)==="[[0,0,0],[1,1,0],[2,2,0],[3,3,0]]","a tapasztalat-tempó +1 / +2 / +3 a két típusra",r.gXp);
  ok(/Sprintmester/.test(r.gCond)&&/Bástya/.test(r.gCond),"a kártya élő sora megnevezi a két stábtag-típust",r.gCond);
  console.log("\n— 3. A TELJES KÉP —");
  const k=r.kep,nincsSzerep=Object.keys(k).filter(x=>!k[x].szerep),nincsMuhely=Object.keys(k).filter(x=>!k[x].muhely);
  ok(k.panzer.szerep&&k.gegen.muhely,"a Panzernek van szerep-erősítője, a Gegenpressingnek stábtag-műhelye");
  ok(nincsSzerep.every(x=>x==="sztar"),"a sztáron kívül minden stílusnak van szerep-erősítője",nincsSzerep);
  ok(nincsMuhely.every(x=>x==="sztar"),"a sztáron kívül minden stílusnak van stábtag-erősítő műhelye",nincsMuhely);
  console.log("\n— 4. NEVEK —");
  ok(r.nevHiany.length===0,"mind a 49 jóváhagyott név a táblában van",r.nevHiany.slice(0,5));
  ok(r.megjelen.length===0,"a megjelenítés (fullName) is az új nevet írja ki",r.megjelen.slice(0,5));
  ok(r.dupla.length===0,"egyik új név sem áll két különböző emberen",r.dupla);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
