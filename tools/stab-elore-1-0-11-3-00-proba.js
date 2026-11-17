/* 📈 1.0.11.3.00 — A SZAKMAI STÁB ELŐREJELZÉSE.

   KÉRÉS: „A scoutoknál is legyen olyan előrejelzési rendszer, mint amit
   mostanában építettünk be az edzéshez. Kire milyen mértékű lesz a hatása a
   szezonban." — tisztázva: a Szakmai stáb tagjairól van szó.

   A próba nem a képletet ismétli, hanem A MOTORT FUTTATJA:
     1. attribútum-mester (Gólvágó-mentor, teljes keret): egy végigjátszott meccs
        (processCareerDevelopment) után a stáb-mérlegbe (stabBy) könyvelt pont
        = az előrejelzés, a kezdő MINDEN fókuszált emberére — azokra is, akiknél
        az edzésterv lassítja a gólszerzést (védők, fő edzés: Védekezés);
     2. a nem kezdő fókuszált „ha kezd" értéket kap, és a motor a kispadon
        tényleg nem ad neki stáb-pontot;
     3. Kispad-mester: a processPadEdzo után a könyvelt perc és a fő tengely
        pontja = az előrejelzés, minden nem játszó fókuszáltnál;
     4. a hozam = pont × hátralévő forduló / 15, a sáv tetején 🔒;
     5. a többi típus (Iskolateremtő, Ritmusmester, Gyógyító kéz, Lélekemelő,
        Csapatkovács) is ad előrejelzést; az inaktív (második ugyanolyan)
        tag kimondja, hogy nem hat;
     6. a panel: minden kártyán ott a blokk, a fókusz módosítására újraszámol;
        430 px-en nincs vízszintes túlcsordulás;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9617;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const KEP=process.env.KEP||"";
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");localStorage.setItem("nyitoLatta30_0","1");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:20+(i%12)};sl.player=pl;sl.fit=1;
      careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:pl.age,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      initPlayerAttrs(careerPool[pl.n]);});
    if(!scout)scout=generateScout();
    startFirstSeason();phase="season";
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    S.idx=0;S.auto=false;window.saveGame=()=>{};window.saveGameNow=()=>{};window.mezKerdesKell=()=>false;
    document.getElementById("mpEntry").classList.add("hide");});
  await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{
    const ki={};
    /* kispad: három ember */
    const pad=[];
    {const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[1];
     Object.keys(BENCH).slice(0,3).forEach((k,i)=>{const src=sq.players[i+3];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||["KKP"]).slice(),age:19+i*5};
       BENCH[k]=pl;careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:pl.age,startRating:pl.ovr,peak:pl.ovr,pot:3000};
       initPlayerAttrs(careerPool[pl.n]);pad.push(pl.n);});}
    /* az edzésterv: fő Védekezés a védőkön → náluk a gólszerzés LASSÍTOTT */
    S.training={main:{stat:"ved",groups:["VEDO"]},sec:{stat:"passz",groups:["KOZEPPALYAS"]},setSeason:1};
    /* a stáb: Gólvágó-mentor (teljes keret), Kispad-mester (teljes pad),
       Ritmusmester, Gyógyító kéz, Lélekemelő, Csapatkovács, Iskolateremtő,
       és egy MÁSODIK Gólvágó (inaktív) */
    S.staff=[];S.coachSlots=9;
    const mk=(tip,nev,q)=>{const fp={n:nev,age:44,matches:320,pos:[tip==="attr:kapus"?"KP":"CS"],peak:115,attrs:{}};
      staffShapeFp(fp,tip,q);const c=makeCoach(fp,tip,1);S.staff.push(c);return c;};
    const gol=mk("attr:gol","Próba Gólvágó",.85),padm=mk("bench","Próba Kispad",.9);
    mk("form","Próba Ritmus",.7);mk("medic","Próba Orvos",.7);mk("morale","Próba Lélek",.7);
    const kov=mk("chem","Próba Kovács",.7);mk("skill","Próba Iskola",.7);
    const gol2=mk("attr:gol","Próba Gólvágó Kettő",.5);
    ki.tipusok=S.staff.map(c=>c.type);
    /* 1. attribútum-mester */
    const E=stabEloreSzamol(gol);
    ki.F=E.F;ki.kezdo=E.sorok.filter(x=>x.kezd).length;ki.nemKezdo=E.sorok.filter(x=>!x.kezd).length;
    const lassitott=E.sorok.filter(x=>x.kezd&&trainingFor(getCategoryFor(x.pos))&&trainingFor(getCategoryFor(x.pos)).slow.indexOf("gol")>=0).map(x=>x.n);
    ki.lassitott=lassitott.length;
    const stabPt=n=>{const e=careerPool[n],t=trainLogFor(e);return ((t.stabBy&&t.stabBy[gol.n]&&t.stabBy[gol.n].pts.gol)||0);};
    const elotte={};E.sorok.forEach(x=>elotte[x.n]=stabPt(x.n));
    const active=slots.map((sl,i)=>sl&&sl.player?{p:sl.player,idx:i}:null).filter(Boolean);
    try{processCareerDevelopment(active,{},{},-1,-1,-1,new Set(),null,1);}catch(e){ki.motorHiba=String(e);}
    try{processBenchDevelopment();}catch(e){ki.padMotorHiba=String(e);}
    ki.elt=0;ki.eltLassit=0;ki.padStab=0;ki.minta=[];
    E.sorok.forEach(x=>{const mert=stabPt(x.n)-elotte[x.n];
      if(x.kezd){const d=Math.abs(mert-x.pt);ki.elt=Math.max(ki.elt,d);if(lassitott.indexOf(x.n)>=0)ki.eltLassit=Math.max(ki.eltLassit,d);
        if(ki.minta.length<4)ki.minta.push([x.pos,+x.pt.toFixed(4),+mert.toFixed(4)]);}
      else ki.padStab=Math.max(ki.padStab,Math.abs(mert));});
    ki.haKezd=E.sorok.filter(x=>!x.kezd).every(x=>x.pt>0);
    /* 4. a képlet és a sáv */
    ki.keplet=E.sorok.every(x=>x.fal||x.blokk||Math.abs(x.lep-x.pt*E.F.n/CAREER_DEV_THRESHOLD)<1e-9);
    {const x=E.sorok.find(q=>q.kezd&&q.pt>0),e=careerPool[x.n];const bnd=attrBandOf(e,"gol");const mento=e.attrs.gol;
      e.attrs.gol=bnd.hi-0.5;const x2=stabEloreSzamol(gol).sorok.find(q=>q.n===x.n);
      ki.sav=[x2.fal,+x2.lep.toFixed(3)];e.attrs.gol=mento;}
    /* 3. Kispad-mester */
    const P=stabEloreSzamol(padm);
    ki.padSorok=P.sorok.length;
    const padPt=n=>{const e=careerPool[n],t=trainLogFor(e),k=attrTrainedBy((e.pos&&e.pos[0])||"KKP");
      return ((t.stabBy&&t.stabBy[padm.n]&&t.stabBy[padm.n].pts[k])||0);};
    const perc=n=>((S.careerStats&&S.careerStats[n]&&S.careerStats[n].minPad)||0);
    const pe={};P.sorok.forEach(x=>pe[x.n]=[padPt(x.n),perc(x.n)]);
    const J=new Set(active.map(a=>a.p.n));
    try{processPadEdzo(J);}catch(e){ki.padEdzoHiba=String(e);}
    ki.padElt=0;ki.percElt=0;ki.padMinta=[];
    P.sorok.forEach(x=>{const dp=padPt(x.n)-pe[x.n][0],dm=perc(x.n)-pe[x.n][1];
      ki.padElt=Math.max(ki.padElt,Math.abs(dp-x.pt));ki.percElt=Math.max(ki.percElt,Math.abs(dm-x.perc));
      if(ki.padMinta.length<3)ki.padMinta.push([x.n.slice(0,3),x.perc,dm,+x.pt.toFixed(4),+dp.toFixed(4)]);});
    ki.padPercOssz=P.sorok.every(x=>Math.abs(x.percOssz-x.perc*P.F.n)<1e-9);
    /* 5. a többi típus */
    ki.tobbi={};
    S.staff.forEach(c=>{if(c===gol||c===padm)return;const R=stabEloreSzamol(c);
      ki.tobbi[c.n]={tip:c.type,aktiv:R.aktiv,sorok:R.sorok.length,csapat:R.csapat.length,html:stabEloreHtml(c).replace(/<[^>]+>/g," ").replace(/\s+/g," ").slice(0,160)};});
    /* 6. a panel */
    openStaffPanel();
    const kart=[...document.querySelectorAll("#twBody .stElo")];
    ki.blokk=kart.length;ki.panelSzoveg=kart[0]?kart[0].innerText.slice(0,200):"";
    ki.sorDb=kart[0]?kart[0].querySelectorAll(".trEloSor").length:0;
    const elso=kart[0]?kart[0].innerText:"";
    /* fókusz: csak két ember */
    gol.focus={mode:"players",group:null,names:[slots[9].player.n,slots[10].player.n]};renderStaffPanel();
    const k2=document.querySelectorAll("#twBody .stElo")[0];
    ki.fokuszValt=!!k2&&k2.innerText!==elso&&k2.querySelectorAll(".trEloSor").length===2;
    ki.tul=[...document.querySelectorAll("#twPanel *")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    return ki;});
  console.log("     minta (poszt, előrejelzett pont/meccs, a motor könyvelése):");r.minta.forEach(m=>console.log("       "+JSON.stringify(m)));
  ok(r.kezdo===11&&r.nemKezdo>=3&&r.F.n===30,"1. a Gólvágó a teljes keretre: 11 kezdő + a kispad, 30 forduló van hátra",{kezdo:r.kezdo,nem:r.nemKezdo,F:r.F});
  ok(!r.motorHiba&&r.elt<1e-9,"1. kezdő: az előrejelzés = amit a motor a stáb-mérlegbe könyvel",{elteres:r.elt,hiba:r.motorHiba});
  ok(r.lassitott>=3&&r.eltLassit<1e-9,"1. az edzésterv lassítását is tükrözi (a védőknél a gólszerzés lassított)",{lassitott:r.lassitott,elteres:r.eltLassit});
  ok(r.haKezd&&r.padStab===0&&!r.padMotorHiba,"2. a nem kezdő „ha kezd” értéket kap, a motor a padon tényleg nem ad stáb-pontot",{padStab:r.padStab});
  console.log("     kispad-minta (név, előrejelzett perc, könyvelt perc, előrejelzett pont, könyvelt pont):");r.padMinta.forEach(m=>console.log("       "+JSON.stringify(m)));
  ok(r.padSorok===3&&!r.padEdzoHiba&&r.percElt===0&&r.padElt<1e-9&&r.padPercOssz,"3. Kispad-mester: a perc és a fő tengely pontja = a motor könyvelése, az idényre × 30",{sorok:r.padSorok,perc:r.percElt,pont:r.padElt,hiba:r.padEdzoHiba});
  ok(r.keplet&&r.sav[0]===true&&r.sav[1]<=0.5+1e-9,"4. hozam = pont × forduló / 15; a sáv tetején 🔒 és megáll",r.sav);
  {const T=Object.values(r.tobbi);
   const v=n=>T.find(x=>x.tip===n);
   ok(v("form").sorok>=11&&v("medic").sorok>=11&&v("morale").csapat===1&&v("skill").csapat===2&&v("chem").sorok>=10,
      "5. a többi típus is ad előrejelzést (Ritmus, Orvos: fejenként · Lélekemelő, Iskolateremtő: csapat · Kovács: párok)",T.map(x=>[x.tip,x.sorok,x.csapat]));
   const in2=T.find(x=>x.tip==="attr:gol");
   ok(in2&&in2.aktiv===false&&/Inaktív/.test(in2.html),"5. a második Gólvágó inaktív, és ezt mondja",in2);}
  ok(r.blokk===8&&r.sorDb===14&&/Várható hatás/.test(r.panelSzoveg)&&/még 30 bajnoki forduló/.test(r.panelSzoveg),"6. a panelen mind a nyolc kártyán ott a blokk (a Gólvágónál 11 kezdő + 3 lenyitható)",{blokk:r.blokk,sor:r.sorDb});
  ok(r.fokuszValt,"6. a fókusz módosítására azonnal újraszámol (két ember → két sor)");
  ok(r.tul===0,"6. 430 px: nincs vízszintes túlcsordulás",r.tul);
  if(KEP){await p.evaluate(()=>{const k=document.querySelectorAll("#twBody .stElo")[0];k.scrollIntoView({block:"start"});window.scrollBy(0,-260);});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,"stab-elore-utana.png")});}
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
