/* 🔓 3.9.186 — A STÍLUS-KATEGÓRIA NEM VÁSÁROLHATÓ: AZ ELSŐ TELJESÍTÉS NYITJA.

   KIMONDOTT KÉRÉS: „Szüntessük meg azt, hogy pénzért lehessen megvenni a
   stíluskategóriákat. Amint bármelyikből teljesül 1 mérföldkő, dobja fel,
   hogy megkaptad, megnyílt, és a megnyitáskor vonjon le a büdzsédből egy
   átlagos mérföldkő-jutalom árát pénzben. És mind a 6 kategóriánál csak
   egyszer legyen ilyen pénzlevonás, amúgy szépen lehessen őket gyűjteni."

   Amit mér:
     1. A DÍJ: egy átlagos pénzjutalmas mérföldkő értéke (a jutalom saját
        képletén), mind a hat kategóriánál ugyanaz;
     2. ZÁRT, TELJESÍTÉS NÉLKÜL: a kiértékelés nem nyit, nem von le;
     3. AZ ELSŐ TELJESÍTÉS: a kategória megnyílik, a díj PONTOSAN egyszer megy
        le, a teljesült fokozatok azonnal fizetnek (semmi nem ragad be), a
        felugró ablak megjelenik, a napló jegyzi;
     4. UTÁNA szabadon gyűlik: a következő teljesítés nem von le;
     5. MIND A HAT: összesen pontosan 6 × díj, és egy újabb kör semmit;
     6. üres kasszánál annyi megy le, amennyi van, és a kategória akkor is nyílik;
     7. a kihívás-jutalom (msUnstick) díj nélkül nyit, és később sem von le;
     8. A FELÜLET: nincs „Megnyitom" gomb, a panel és a zárt sor elmondja a
        szabályt; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9229;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof msAutoOpenCat==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
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
    phase="season";S.seasonNumber=3;
    S.style={key:"panzer",traits:{}};
    window.saveGame=()=>{};
    const M=msState();
    /* a terep: MINDEN mérföldkő biztosan a küszöb alatt (a táblában van 0-s
       és negatív küszöb is), a kategóriák zárva */
    const eredetiP={};MILESTONES.forEach(d=>{eredetiP[d.id]=d.p;});
    const semmi=()=>MILESTONES.forEach(d=>{d.p=()=>d.n-1e9;});
    const kesz=(cat,db)=>{let n=db;MILESTONES.forEach(d=>{if(d.cat===cat&&n>0){n--;d.p=()=>d.n;}});};
    const tiszta=()=>{M.cats={};M.pend={};M.done={};M.missed={};M.log=[];M.sp=0;M.spEarned=0;semmi();
      _chPopQ=[];if(_chPopOn){_chPopOn=false;}};

    /* ---- 1. A DÍJ ---- */
    const cash=MILESTONES.filter(d=>d.kind==="cash");
    const atlag=cash.reduce((a,d)=>a+msCashReward(d.val)/talMsPremium(),0)/cash.length;
    ki.dij=MS_STYLE_CATS.map(c=>msCatPrice(c.key));
    ki.atlag=atlag;
    ki.egyforma=ki.dij.every(x=>x===ki.dij[0]);
    ki.pontos=Math.abs(ki.dij[0]-atlag)<=1;   /* a msCashReward egészre kerekít — fokozatonként ±0,5 */

    /* ---- 2. ZÁRT, TELJESÍTÉS NÉLKÜL ---- */
    tiszta();S.transferBudget=1e9;
    msScan();
    ki.zart={nyitott:MS_STYLE_CATS.filter(c=>msCatUnlocked(c.key)).length,budzse:S.transferBudget};

    /* ---- 3. AZ ELSŐ TELJESÍTÉS ---- */
    tiszta();S.transferBudget=1e9;
    kesz("piac",2);
    const dij=msCatPrice("piac");
    const sp0=M.sp;
    msScan();
    ki.elso={nyitva:msCatUnlocked("piac"),levont:1e9-S.transferBudget,dij,
      done:MILESTONES.filter(d=>d.cat==="piac"&&M.done[d.id]).length,
      pend:Object.keys(M.pend).filter(x=>M.pend[x]).length,
      sp:M.sp-sp0,info:M.cats.piac,
      naplo:/MEGNYÍLT — Transzferpiac/.test(($("log")&&$("log").innerHTML)||document.body.innerHTML)};
    const pop=document.getElementById("chPop");
    ki.pop={lat:!!pop&&!pop.classList.contains("hide"),
      szoveg:pop?pop.innerText.replace(/\s+/g," "):""};
    try{chPopClose();}catch(e){}

    /* ---- 4. UTÁNA SZABADON ---- */
    const b1=S.transferBudget;
    kesz("piac",3);
    msScan();
    ki.utana={levont:b1-S.transferBudget,done:MILESTONES.filter(d=>d.cat==="piac"&&M.done[d.id]).length};

    /* ---- 5. MIND A HAT ---- */
    tiszta();S.transferBudget=1e12;
    MS_STYLE_CATS.forEach(c=>kesz(c.key,1));
    const d6=msCatPrice("vagyon");
    msScan();
    const l1=1e12-S.transferBudget;
    MS_STYLE_CATS.forEach(c=>kesz(c.key,2));
    msScan();msScan();
    ki.hat={nyitott:MS_STYLE_CATS.filter(c=>msCatUnlocked(c.key)).length,levont:l1,vart:6*d6,
      utana:1e12-S.transferBudget-l1,sorban:_chPopQ.length};
    _chPopQ=[];try{chPopClose();}catch(e){}

    /* ---- 6. ÜRES KASSZA ---- */
    tiszta();S.transferBudget=100;
    kesz("trofeak",1);
    msScan();
    ki.ures={nyitva:msCatUnlocked("trofeak"),budzse:S.transferBudget,info:M.cats.trofeak};
    _chPopQ=[];try{chPopClose();}catch(e){}

    /* ---- 7. KIHÍVÁS-JUTALOM: DÍJ NÉLKÜL ---- */
    tiszta();S.transferBudget=1e9;
    kesz("ugras",1);
    applyChallengeReward({kind:"msUnstick"});
    const b7=S.transferBudget;
    MILESTONES.forEach(d=>{if(d.cat==="ugras")d.p=()=>d.n;});
    msScan();
    ki.ajandek={nyitva:msCatUnlocked("ugras"),levont:1e9-S.transferBudget,kesobb:b7-S.transferBudget,info:M.cats.ugras};

    /* ---- 8. A FELÜLET ---- */
    tiszta();S.transferBudget=1e9;kesz("vagyon",1);msScan();
    _chPopQ=[];try{chPopClose();}catch(e){}
    _msCatOpen=true;
    const h=msCatShopHtml();
    ki.panel={nincsGomb:!/Megnyitom|data-mscat/.test(h),szabaly:/Megvenni nem kell/.test(h)&&/csak egyszer/.test(h),
      zartSor:/magától nyílik/.test(h),nyitottSor:/nyitási díj:/.test(h)};
    renderMilestones();
    const box=($("hubMilestonesPanel")&&$("hubMilestonesPanel").innerHTML)||"";
    ki.lista={nincsLock:!/data-mslock|msLockBtn/.test(box),zartInfo:/magától nyílik/.test(box)};
    MILESTONES.forEach(d=>{d.p=eredetiP[d.id];});
    return ki;});

  console.log("\n— 1. A DÍJ —");
  ok(r.egyforma&&r.pontos,"a nyitási díj egy átlagos pénzjutalmas mérföldkő, mind a hat kategóriánál ugyanaz",{dij:r.dij[0],atlag:r.atlag});
  console.log("\n— 2. ZÁRT, TELJESÍTÉS NÉLKÜL —");
  ok(r.zart.nyitott===0&&r.zart.budzse===1e9,"teljesítés nélkül semmi nem nyílik, és semmi nem megy le",r.zart);
  console.log("\n— 3. AZ ELSŐ TELJESÍTÉS —");
  ok(r.elso.nyitva,"az első teljesült mérföldkő magától megnyitja a kategóriát");
  ok(r.elso.levont===r.elso.dij&&r.elso.info&&r.elso.info.auto===1&&r.elso.info.price===r.elso.dij,"a díj PONTOSAN egyszer megy le, és a mentésbe is beíródik",{levont:r.elso.levont,dij:r.elso.dij});
  ok(r.elso.done===2&&r.elso.pend===0&&r.elso.sp>0,"a teljesült fokozatok azonnal fizetnek — semmi nem ragad be",r.elso);
  ok(r.elso.naplo,"a napló jegyzi");
  ok(r.pop.lat&&/stílus-kategória megnyílt/i.test(r.pop.szoveg)&&/Transzferpiac/.test(r.pop.szoveg)&&/nyitási díj/i.test(r.pop.szoveg),"felugró ablak: megnyílt, melyik, mennyi ment le",r.pop.szoveg);
  console.log("\n— 4. UTÁNA SZABADON —");
  ok(r.utana.levont===0&&r.utana.done===3,"a következő teljesítés fizet, és nem von le semmit",r.utana);
  console.log("\n— 5. MIND A HAT —");
  ok(r.hat.nyitott===6&&r.hat.levont===r.hat.vart,"mind a hat megnyílt, összesen pontosan 6 × díj ment le",r.hat);
  ok(r.hat.utana===0,"az újabb teljesítések és kiértékelések már semmit nem vonnak le",r.hat.utana);
  ok(r.hat.sorban>=5,"a hat felugró sorba áll, nem egymásra",r.hat.sorban);
  console.log("\n— 6. ÜRES KASSZA —");
  ok(r.ures.nyitva&&r.ures.budzse===0&&r.ures.info.price===100,"üres kasszánál annyi megy le, amennyi van, és a kategória akkor is nyílik",r.ures);
  console.log("\n— 7. KIHÍVÁS-JUTALOM —");
  ok(r.ajandek.nyitva&&r.ajandek.levont===0&&r.ajandek.kesobb===0&&r.ajandek.info.granted===1,"a kihívás-jutalom díj nélkül nyit, és később sem von le",r.ajandek);
  console.log("\n— 8. A FELÜLET —");
  ok(r.panel.nincsGomb&&r.panel.szabaly&&r.panel.zartSor&&r.panel.nyitottSor,"az Infópult panelen nincs „Megnyitom”, a szabály és a díj ki van írva",r.panel);
  ok(r.lista.nincsLock&&r.lista.zartInfo,"a zárt mérföldkő sora nem gomb, hanem tájékoztat",r.lista);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
