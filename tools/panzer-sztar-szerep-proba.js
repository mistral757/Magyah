/* 🛡️⭐ SZEZON-SZEREPEK A PANZERNEK ÉS A SZTÁRNAK (3.9.109).

   KIMONDOTT KÉRÉS: „Ennek megfelelően kell mindegyik csapatnak szezon
   szerepes rendszer is: panzernek és sztárom a páromnak jelenleg nincsen."

   A két hármas szerkezetileg MÁS, mint a többi öté:

     · a PANZERÉ mind a három ugyanarra az egy mondatra épül („a piros lap
       minket nem rettent el"), de HÁROM KÜLÖN CSATORNÁN: a Mészáros az
       ellenfél gólesélyét viszi le és lappal fizet (ami a Panzernél
       BEVÉTEL), a Vezér a kiállítás MECCSERŐ-ÁRÁT fogja vissza, a Falka
       pedig emberhátrányban tovább csökkenti az ellenfél gólesélyét;
     · a SZTÁRÉ az egyetlen hármas a játékban, ahol a hatás NEM azon az
       emberen jelenik meg, akit kijelöltél — mind a három a sztárról szól.

   Amit mér:
     1. a hat szerep regisztrációja (kulcsok, attribútum-gazdák, belépők);
     2. A Mészáros: ellenfél-gólesély le, saját kockázat fel, csapat-kockázat fel;
     3. A Vezér: a kiállítás meccserő-ára — és hogy ŐT kiállítva nem véd;
     4. A Falka: CSAK emberhátrányban;
     5. A Szolgáló: gólpassz fel, saját gólsúly LE (az egyetlen szerep, ami elvesz);
     6. A Testőr: a SZTÁR kockázatát viszi le, és csak amíg ő a pályán van;
     7. Az Örökös: fejlődés-szorzó, amíg a sztár a klubnál van;
     8. és hogy a sztár egyik szerepre sem jelölhető. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9079;
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
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof ROLE_KEYS_OF!=="undefined"
    &&typeof roleRedCostMult==="function"&&typeof roleHeirDevMult==="function",
    null,{timeout:30000});

  /* ================= 1. A REGISZTRÁCIÓ ================= */
  const reg=await p.evaluate(()=>({
    panzer:(ROLE_KEYS_OF.panzer||[]).slice(),
    sztar:(ROLE_KEYS_OF.sztar||[]).slice(),
    defs:["meszaros","vezer","falka","szolgalo","testor","orokos"]
      .map(k=>({k,van:!!ROLE_DEFS[k],style:(ROLE_DEFS[k]||{}).style,
        n:(ROLE_DEFS[k]||{}).n,v:!!(ROLE_DEFS[k]||{}).v})),
    attr:["meszaros","vezer","falka","szolgalo","testor"]
      .map(k=>({k,gazda:(ROLE_ATTR_OF[k]||{}).v})),
    orokosNincsGazda:!ROLE_ATTR_OF.orokos}));
  console.log("=== 1. a hat szerep regisztrációja ===");
  ok(reg.panzer.join()==="meszaros,vezer,falka","a Panzer hármasa a helyén",reg.panzer);
  ok(reg.sztar.join()==="szolgalo,testor,orokos","a Sztár hármasa a helyén",reg.sztar);
  ok(reg.defs.every(d=>d.van&&d.v),"mindegyiknek van definíciója és hatás-létrája",
    reg.defs.map(d=>d.k+":"+(d.van?"ok":"NINCS")));
  ok(reg.defs.filter(d=>d.style==="panzer").length===3
     &&reg.defs.filter(d=>d.style==="sztar").length===3,
    "és a stílus-hovatartozásuk stimmel");
  ok(reg.attr.every(a=>!!a.gazda),"az attribútum-gazdák megvannak",reg.attr);
  ok(reg.orokosNincsGazda,"az Örökösnél SZÁNDÉKOSAN nincs (ott a kor a mérce)");

  /* ================= 2-8. ÉLŐ KARRIER ================= */
  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";buildSeasonFixtures();
    const R=fullCareerRoster()||[];
    const A=R[0].n,B=R[1].n,C=R[2].n,D=R[3].n;
    const act=nev=>nev.map(n=>({p:{n},bus:0}));
    const mind=act([A,B,C,D]);

    /* ---------- PANZER ---------- */
    S.style={key:"panzer",traits:{}};S.style2=null;
    S.roles={season:S.seasonNumber||1,map:{meszaros:A,vezer:B,falka:C}};
    ki.aktiv=roleStyleActive();
    ki.kulcsok=roleKeysForStyle().slice();
    /* A Mészáros */
    ki.meszaros={
      pályán:Math.round(roleOppGoalMult(mind,new Set(),50,0)*10000)/10000,
      nincsOtt:Math.round(roleOppGoalMult(act([B,C,D]),new Set(),50,0)*10000)/10000,
      sajatRizik:Math.round(roleRiskMult(A)*1000)/1000,
      masRizik:roleRiskMult(D),
      csapatRizik:Math.round(roleRiskTeamP(mind,new Set())*10000)/10000};
    /* A Vezér */
    ki.vezer={
      pályán:Math.round(roleRedCostMult(mind,new Set())*1000)/1000,
      otKiallitva:Math.round(roleRedCostMult(mind,new Set([1]))*1000)/1000,
      nincsOtt:Math.round(roleRedCostMult(act([A,C,D]),new Set())*1000)/1000};
    /* A Falka — csak emberhátrányban */
    {const teljes=roleOppGoalMult(mind,new Set(),50,0);
     const hatranyban=roleOppGoalMult(mind,new Set([3]),50,0);
     ki.falka={teljes:Math.round(teljes*10000)/10000,
       hatranyban:Math.round(hatranyban*10000)/10000,
       /* a Falka maga NEM lehet a kiállított — ott a C (index 2) marad pályán */
       csokken:hatranyban<teljes};}

    /* ---------- SZTÁR ---------- */
    S.style={key:"sztar",traits:{},star:D};S.style2=null;
    S.roles={season:S.seasonNumber||1,map:{szolgalo:A,testor:B,orokos:C}};
    ki.sztarKulcsok=roleKeysForStyle().slice();
    ki.sztarNev=fameStarName();
    /* A Szolgáló */
    ki.szolgalo={
      assist:Math.round(roleAssistMult(A)*1000)/1000,
      sajatGol:Math.round(roleGoalMult(A,50,1,0)*1000)/1000,
      masGol:Math.round(roleGoalMult(D,50,1,0)*1000)/1000};
    /* A Testőr — a SZTÁR kockázatát viszi le */
    ki.testor={
      sztarVedve:Math.round(roleRiskMult(D,mind,new Set())*1000)/1000,
      sztarOrNelkul:Math.round(roleRiskMult(D,act([A,C,D]),new Set())*1000)/1000,
      sztarKontextusNelkul:roleRiskMult(D),
      masVedve:roleRiskMult(A,mind,new Set()),
      testorMaga:roleRiskMult(B,mind,new Set())};
    /* Az Örökös */
    ki.orokos={
      sztarItt:Math.round(roleHeirDevMult(C)*1000)/1000,
      mas:roleHeirDevMult(A)};
    /* …és ha a sztár elhagyja a klubot, a tanulás véget ér */
    {const _f=fullCareerRoster;
     window.fullCareerRoster=()=>R.filter(x=>x.n!==D);
     ki.orokos.sztarElment=roleHeirDevMult(C);
     window.fullCareerRoster=_f;}
    /* A SZTÁR maga egyik szerepre sem jelölhető */
    const pD={n:D,pos:(careerPool[D]&&careerPool[D].pos)||["CS"],age:26};
    ki.sztarNemJelolheto=["szolgalo","testor","orokos"]
      .map(k=>({k,ok:roleEligible(k,pD)}));
    /* Az Örökös kora */
    {const pC=Object.assign({},{n:C,pos:["KKP"]});
     careerPool[C].age=20; const fiatal=roleEligible("orokos",pC);
     careerPool[C].age=30; const oreg=roleEligible("orokos",pC);
     careerPool[C].age=26;
     ki.orokosKor={fiatal,oreg};}
    /* ---------- ÉS A KIHÍVÁS-BÜNTETÉS MINDKETTŐRE ÁLL ---------- */
    S.chRoleFreeze=3;
    ki.fagyasztva={aktiv:roleStyleActive(),
      meszaros:roleOppGoalMult(mind,new Set(),50,0),
      vezer:roleRedCostMult(mind,new Set()),
      orokos:roleHeirDevMult(C)};
    S.chRoleFreeze=0;
    return ki;});

  console.log("=== 2. A Mészáros ===");
  ok(t.aktiv===true&&t.kulcsok.join()==="meszaros,vezer,falka",
    "Panzernél MOSTANTÓL aktív a szerep-rendszer",{kulcsok:t.kulcsok});
  ok(t.meszaros.pályán<1,"a pályán csökkenti az ellenfél gólesélyét",t.meszaros);
  ok(t.meszaros.nincsOtt===1,"ha nincs ott, semmi");
  ok(t.meszaros.sajatRizik>1,"a SAJÁT lap- és sérülés-kockázata nő",
    {v:t.meszaros.sajatRizik});
  ok(t.meszaros.masRizik===1,"máséra nem hat");
  ok(t.meszaros.csapatRizik>1,"és a csapat össz-kockázata is nő (egy a tizenegyből)",
    {v:t.meszaros.csapatRizik});
  console.log("=== 3. A Vezér ===");
  ok(t.vezer.pályán<1,"a pályán csökkenti a kiállítás meccserő-árát",t.vezer);
  ok(t.vezer.otKiallitva===1,"de ha ŐT állítják ki, nem véd",{v:t.vezer.otKiallitva});
  ok(t.vezer.nincsOtt===1,"és ha nincs a pályán, sem");
  console.log("=== 4. A Falka ===");
  ok(t.falka.csokken===true,"emberhátrányban tovább esik az ellenfél gólesélye",t.falka);
  console.log("=== 5. A Szolgáló ===");
  ok(t.sztarKulcsok.join()==="szolgalo,testor,orokos",
    "Sztárnál is aktív a szerep-rendszer",{k:t.sztarKulcsok});
  ok(t.szolgalo.assist>1,"nő a gólpassz-súlya",t.szolgalo);
  ok(t.szolgalo.sajatGol<1,"és ESIK a saját gólsúlya — az egyetlen szerep, ami elvesz",
    {v:t.szolgalo.sajatGol});
  ok(t.szolgalo.masGol===1,"máséra nem hat");
  console.log("=== 6. A Testőr ===");
  ok(t.sztarNev,"van kijelölt sztár",{n:t.sztarNev});
  ok(t.testor.sztarVedve<1,"a SZTÁR kockázata csökken, amíg a Testőr a pályán van",
    t.testor);
  ok(t.testor.sztarOrNelkul===1,"a Testőr nélkül nem");
  ok(t.testor.sztarKontextusNelkul===1,
    "és kontextus nélküli hívásnál a régi viselkedés marad (visszafelé kompatibilis)");
  ok(t.testor.masVedve===1&&t.testor.testorMaga===1,"másra — és magára — nem hat");
  console.log("=== 7. Az Örökös ===");
  ok(t.orokos.sztarItt>1,"gyorsabban fejlődik, amíg a sztár a klubnál van",t.orokos);
  ok(t.orokos.mas===1,"máséra nem hat");
  ok(t.orokos.sztarElment===1,"és ha a sztár elment, a tanulás véget ér");
  ok(t.orokosKor.fiatal===true&&t.orokosKor.oreg===false,
    "a belépő a KOR (legfeljebb 23 év)",t.orokosKor);
  console.log("=== 8. a sztár maga nem jelölhető, és a fagyasztás mindenre áll ===");
  ok(t.sztarNemJelolheto.every(x=>x.ok===false),
    "a sztár egyik szerepére sem jelölhető",t.sztarNemJelolheto);
  ok(t.fagyasztva.aktiv===false&&t.fagyasztva.meszaros===1
     &&t.fagyasztva.vezer===1&&t.fagyasztva.orokos===1,
    "a kihívás-büntetés (3 meccsig nem működnek a szerepek) az új hatra is áll",t.fagyasztva);

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
