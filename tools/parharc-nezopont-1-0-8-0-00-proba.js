/* 🔁 1.0.8.0.00 — PÁRHARC: A NÉZŐPONT A TÁROLT ADATBÓL + A PÁRHARC ELEMZÉSE.
   BEJELENTETT HIBA: ⚡276,6 a ⚡261,3 ellen, 0:3 — a motor mindkét nézetben
   csak a saját taktika-tételt látta; a gólszorzók nem utaztak; a lap ⚡-ja a
   helyi becslés volt. Közben: a nézőpont a tárolt adatból (védőháló).
   Amit mér:
     1. h2hNezopont: a saját rekesz a `by` azonosítóból, a hazai oldal a
        lista jeléből (sim.hf); rossz szerepnél is helyes, és jelzi az eltérést;
     2. régi lista (nincs hf): a kezdő esemény csapatneve, majd a góllövők
        névsora dönt; azonos csapatnévnél is;
     3. a VALÓDI h2hStart rossz szereppel: iAmHome helyes, a ⚡ a saját
        pillanatképből, a szerep helyreáll;
     4. egy VALÓDI párharc (playMatch) rossz szereppel: az eredmény a
        lista szerinti, a mérlegben ott a párharc-elemzés (⚡, gólvárhatóság,
        nézőpont, névsor-próba), a napló kiírja a helyreállítást;
     5. a régi viselkedés változatlan, ha minden stimmel (nincs 🔁 sor);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9163;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404|net::/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof h2hNezopont==="function"&&typeof duelMxVege==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
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
      const pl={n:src.n,ovr:src.ovr+25,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=2;S.idx=14;
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const en=mpMyId();ki.en=en;
    const mine=JSON.parse(JSON.stringify(h2hWireSnapshot()));mine.by=en;
    const tars=JSON.parse(JSON.stringify(mine));
    tars.by="zz-tars-azonosito";tars.teamName="Társ FC";tars.ovr=mine.ovr-12;
    tars.players.forEach((q,i)=>{q.n="Társjátékos "+(i+1);});
    tars.plan=[];tars.card=null;
    window.__PROBA={mine,tars};
    const node={host:mine,guest:tars};
    const sim=h2hSimulate(node.host,node.guest,rngFor("proba:nezopont"),false);sim.hf="host";
    window.__PROBA.node=node;window.__PROBA.sim=sim;
    ki.sim={hg:sim.hg,ag:sim.ag};
    /* 1. a tiszta függvény */
    MP.role="host";ki.np1=h2hNezopont(node,sim,15);
    MP.role="guest";ki.np2=h2hNezopont(node,sim,15);
    /* 2. régi lista */
    const regi=Object.assign({},sim);delete regi.hf;
    ki.np3=h2hNezopont(node,regi,15);
    const nev1={host:Object.assign({},mine,{teamName:"Ugyanaz"}),guest:Object.assign({},tars,{teamName:"Ugyanaz",by:en})};
    /* azonos név és mindkettőn az én azonosítóm → a névsor dönt */
    nev1.host.by=en;
    const regi2=Object.assign({},sim,{events:sim.events.map(e=>e.type==="start"?Object.assign({},e,{home:"Ugyanaz",away:"Ugyanaz"}):e)});delete regi2.hf;
    ki.np4=h2hSimHazaiMezo(nev1,regi2,15);
    /* 3. a valódi h2hStart rossz szereppel */
    const _pm=playMatch;let lat=null;playMatch=()=>{lat=h2hScript;};
    try{MP.role="guest";_h2hIndult=null;h2hStart(node,sim,15,"s2r15");}catch(e){ki.h2hErr=String(e);}
    finally{playMatch=_pm;h2hScript=null;}
    ki.start=lat?{iAmHome:lat.iAmHome,my:lat.myMatch,op:lat.oppMatch,elter:lat.nezopont&&lat.nezopont.elter}:null;
    ki.vart={my:snapMatchStrength(mine),op:snapMatchStrength(tars)};
    ki.szerepUtana=MP.role;
    /* 7. a motor: mindkét nézet az ellenfél teljes erejével (nagy taktika-tételnél is) */
    const mk=(ovr,tac,nev)=>Object.assign(JSON.parse(JSON.stringify(mine)),{ovr,tacticEffect:tac,teamName:nev,ownGoalMult:1,oppGoalMult:1,defMult:1,
      talOwn:1,talOpp:1,chemPairs:0,famSp:null,tacticStyle:null,dials:null,roles:null,plan:[]});
    const vend=mk(276.6-25,25,"Vendég"),haz=mk(261.3-25,25,"Hazai");
    const sm=h2hSimulate(haz,vend,rngFor("proba:motor"),false);
    ki.motor={k0:sm.lamB[0],ms:{v:snapMatchStrength(vend),h:snapMatchStrength(haz)},mv:sm.mv};
    /* 8. a drót-pillanatkép viszi a gólszorzókat, a lap ⚡-ja a pillanatképé */
    const W=h2hWireSnapshot();
    ki.drot={own:W.ownGoalMult,opp:W.oppGoalMult,lap:W.card&&W.card.mstr,ms:Math.round(snapMatchStrength(W)*10)/10,
      lap2:mpTeamCard().mstr};
    /* 5. ha minden stimmel, nincs eltérés */
    MP.role="host";ki.np5=h2hNezopont(node,sim,15);
    return ki;});
  console.log("sim:",JSON.stringify(r.sim),"np2:",JSON.stringify(r.np2));
  ok(r.np1.iAmHome===true&&!r.np1.elter&&r.np1.myOk==="by"&&r.np1.homeOk==="lista","1. helyes szerep: hazai vagyok, eltérés nincs",r.np1);
  ok(r.np2.iAmHome===true&&r.np2.my==="host"&&r.np2.elter===true,"1. rossz szerep (guest): a `by` szerint mégis host/hazai — és az eltérés jelezve",r.np2);
  ok(r.np3.home==="host"&&r.np3.homeOk==="nev","2. régi lista: a kezdő esemény csapatneve dönt",r.np3);
  ok(r.np4.f==="host"&&r.np4.ok==="nevsor","2. azonos csapatnév: a góllövők/lapot kapók névsora dönt",r.np4);
  ok(r.start&&r.start.iAmHome===true&&r.start.elter===true,"3. valódi h2hStart rossz szereppel: a nézőpont helyes",r.start);
  ok(r.start&&r.start.my===r.vart.my&&r.start.op===r.vart.op&&r.start.my>r.start.op,"3. a ⚡ a SAJÁT pillanatképből (nem a társéból)",{start:r.start,vart:r.vart});
  ok(r.szerepUtana==="host","3. a szerep a pillanatkép azonosítója szerint helyreállt",r.szerepUtana);
  ok(r.motor.mv===2&&r.motor.k0[1]>=4.4&&r.motor.k0[0]<=0.3,"7. motor: ⚡276,6 (vendég) a ⚡261,3 (hazai) ellen, +25-ös taktikákkal is a ⚡ szerinti fölény (≈4,5 : 0,2), nem pénzfeldobás",r.motor);
  ok(typeof r.drot.own==="number"&&typeof r.drot.opp==="number","8. a drót-pillanatkép viszi a két gólszorzót",r.drot);
  ok(r.drot.lap===r.drot.ms&&r.drot.lap2===r.drot.ms,"8. a csapatlap ⚡-ja = a pillanatkép ⚡-ja (a kihirdetett lapon is)",r.drot);
  ok(r.np5.elter===false,"5. ha minden stimmel, nincs eltérés-jelzés",r.np5);

  /* 4. EGY VALÓDI PÁRHARC rossz szereppel */
  console.log("… valódi párharc lejátszása (≈2 perc)");
  const j=await p.evaluate(()=>new Promise(res=>{
    const out={};
    try{
      const P=window.__PROBA;
      const sorok=[];const _al=addLine;
      window.addLine=function(h){try{sorok.push(String(h).replace(/<[^>]+>/g,""));}catch(e){}return _al.apply(this,arguments);};
      MP.role="guest";_h2hIndult=null;S.auto=true;S.lastMatch=null;
      h2hStart(P.node,P.sim,15,"s2r15b");
      const t0=Date.now();
      const iv=setInterval(()=>{
        if((!S.playing&&S.lastMatch)||Date.now()-t0>200000){
          clearInterval(iv);window.addLine=_al;
          const M=S.lastMatch||{};
          out.gf=M.gf;out.ga=M.ga;out.sim={hg:P.sim.hg,ag:P.sim.ag};
          const X=M.mx;out.vanMx=!!X;out.duel=X&&X.duel?{my:X.duel.my,op:X.duel.op,np:X.duel.np,nevProba:X.duel.nevProba,golok:X.duel.golok.length,iAmHome:X.duel.iAmHome}:null;
          out.xg=X?X.xg:null;out.ex0=X?X.ex0:null;
          let html="";try{html=X?mxHtml(X):"";}catch(e){html="HIBA "+e;}
          out.html={ell:html.includes("A párharc ellenőrzése"),helyre:html.includes("helyreállítottuk"),proba:html.includes("Névsor-próba"),hossz:html.length};
          out.sor={helyre:sorok.some(s=>s.includes("🔁")&&s.includes("helyreállítottuk")),elemzes:sorok.some(s=>s.includes("a párharc elemzése"))};
          res(out);}},500);
    }catch(e){out.err=String(e&&e.stack||e);res(out);}}));
  console.log("párharc:",JSON.stringify(j).slice(0,900));
  ok(!j.err,"4. a párharc lefutott",j.err);
  ok(j.gf===j.sim.hg&&j.ga===j.sim.ag,"4. az eredmény a lista szerinti, a TE nézőpontodból (hazai = te)",{gf:j.gf,ga:j.ga,sim:j.sim});
  ok(j.vanMx&&j.duel&&j.duel.np&&j.duel.np.elter===true,"4. a mérlegben ott a párharc-elemzés, a nézőpont-helyreállítással",j.duel);
  ok(j.duel&&j.duel.nevProba.rossz===0&&(j.duel.nevProba.jo===j.duel.golok),"4. névsor-próba: minden gólt a saját oldala lőtte",j.duel&&j.duel.nevProba);
  ok(j.xg&&j.xg.o>j.xg.a&&j.ex0&&j.ex0.o>j.ex0.a,"4. a gólvárhatóság és a ⚡-ígéret is nekünk áll (mi vagyunk erősebbek)",{xg:j.xg,ex0:j.ex0});
  ok(j.html&&j.html.ell&&j.html.helyre&&j.html.proba,"4. az elemzés felülete: ellenőrző fül, helyreállítás, névsor-próba",j.html);
  ok(j.sor&&j.sor.helyre&&j.sor.elemzes,"4. a napló kiírja a helyreállítást és az elemzést",j.sor);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
