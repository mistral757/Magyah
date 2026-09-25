/* 📈 A STÍLUS-MECCSERŐ ÍVE ÉS TETEJE + A PIRAMIS MÉRCÉI (3.9.139).

   KIMONDOTT KÉRÉSEK:
     „A csapatstílusok saját speciális meccserő-boostjai túl gyorsan
      kiépíthetők maxra (12 és 20), már kb. lvl 4-5 körül elérjük velük a
      maxot. Ezt át kell scalelni."
     „Ugyanezeknek a teteje nyíljon ki … lvl15-től: 12 ⇒ 15, 18, 21, 24, 27,
      30; 20-ról 24, 28, 32, 36, 40, 44."
     „Az ALL-IN képen nem a meccs erőmmel hasonlítja össze az ellenfél erejét."
     „Nem updatelődik folyamatosan az osztályok erőssége."
     „Az ultra csatár enyhe csapatszintűt is adjon."

   Amit mér:
     1. a bejelentett eset: 329-es állapot, 4. szint → +4,8 (nem +12);
     2. az ív: n. szint legfeljebb n/10 × 12 (Panzer: × 20), a 10.-en a teljes;
     3. a tető: 14-es stílusszintig 12/20, a 15.-től 15…30 / 24…44;
     4. a másodlagos mindkettő felét kapja;
     5. az állapot továbbra is korlátoz: kis állapot, kis hozam;
     6. az ultra csatár a csapat saját gólesélyét +5%-kal emeli;
     7. az All-in panel meccs-erőt mér meccs-erőhöz;
     8. a létra fokai a mezőny MOSTANI meccs-erejét mutatják — a saját
        osztályé betűre az, ami a „mezőny most" dobozban áll;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9147;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof styleRampCap==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"az ív és a tető függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});

    /* ---- MOTOROS STÍLUS (Gegen) — az állapotot és a stílusszintet rögzítjük ---- */
    const _el=engLevel,_sl=styleLevel;
    let ALL=329,SZINT=6;
    engLevel=()=>ALL;styleLevel=()=>SZINT;
    const eng=(lv,sec)=>{
      S.style=mk(sec?"villam":"gegen");S.style2=sec?mk("gegen"):null;
      engState("gegen").lvl=lv;return engOvrBonusK("gegen");};
    ki.bejelentett=eng(4,false);
    ki.iv=[1,2,4,6,8,9,10].map(lv=>({lv,b:eng(lv,false)}));
    ALL=900;
    ki.teto=[14,15,16,17,18,19,20].map(L=>{SZINT=L;return {L,b:eng(10,false),cap:engOvrCapK("gegen")};});
    SZINT=20;ki.masod={b:eng(10,true),cap:engOvrCapK("gegen"),iv4:eng(4,true)};
    SZINT=14;ALL=100;ki.kicsi=eng(10,false);   /* 100 × 9% = 9 < 12 */
    engLevel=_el;

    /* ---- PANZER ---- */
    const _fl=fearLevel;
    let FEL=329;
    fearLevel=()=>FEL;
    const pz=(lv,sec)=>{
      S.style=mk(sec?"gegen":"panzer");S.style2=sec?mk("panzer"):null;
      fearState().retteges=lv;return fearOvrBonus();};
    SZINT=6;ki.pzIv=[1,4,8,10].map(lv=>({lv,b:pz(lv,false)}));
    FEL=900;
    ki.pzTeto=[14,15,17,20].map(L=>{SZINT=L;return {L,b:pz(10,false),cap:fearOvrCap()};});
    SZINT=20;ki.pzMasod={b:pz(10,true),cap:fearOvrCap()};
    fearLevel=_fl;styleLevel=_sl;

    /* ---- ULTRA: a csapat enyhe ráadása ---- */
    S.style=mk("bombazok");S.style.traits={csupa_ek:3};S.style2=null;
    const csI=slots.findIndex(sl=>sl.pos==="CS");
    S.ultraSlot=null;const o0=buildMatchSnapshot().ownGoalMult;
    S.ultraSlot=csI>=0?{f:form,i:csI}:null;const o1=buildMatchSnapshot().ownGoalMult;
    ki.ultra={van:csI>=0,nelkul:o0,vele:o1};
    S.ultraSlot=null;

    /* ---- A PIRAMIS: a létra és az All-in ---- */
    S.style=mk("gegen");S.style2=null;
    S.idx=12;
    const html=pyrLadderHtml();
    const box=document.createElement("div");box.innerHTML=html;
    const fokok=[...box.querySelectorAll(".pyrRung")].map(r=>{
      const b=r.querySelector("span:last-child b");return {here:r.classList.contains("here"),v:b?parseFloat(b.textContent.replace(",",".")):null};});
    const itt=fokok.find(x=>x.here);
    ki.letra={db:fokok.length,itt:itt&&itt.v,mezonyMost:Math.round(oppMatchStrength()*10)/10,
      kozep:oppTargetRating,monoton:fokok.every((x,i)=>i===0||x.v<=fokok[i-1].v)};

    /* All-in: a cél és a tét rögzítve, a panel valódi */
    const _o=pyrLeapOfferable,_t=pyrLeapTarget,_s=pyrLeapStakes;
    const my=pyrMyDivId();
    pyrLeapOfferable=()=>true;
    pyrLeapTarget=()=>({from:my,to:Math.max(1,my-1),price:15000});
    pyrLeapStakes=()=>[{amount:40000,pct:100}];
    try{pyrLeapOffer(()=>{});}finally{pyrLeapOfferable=_o;pyrLeapTarget=_t;pyrLeapStakes=_s;}
    const txt=document.getElementById("unlockBody").innerText;
    const cel=pyrDivs()[Math.max(1,my-1)-1];
    ki.allin={meccsero:/a te meccs-erőd/.test(txt),nyersZarojel:/nyers kereted/.test(txt),
      szam:(txt.match(/meccs-erőd ([\d,]+)/)||[])[1],
      vart:pyrN1(teamMatchStrength()),
      celMs:(txt.match(/meccs-ereje ([\d,]+)/)||[])[1],
      celVart:pyrN1(oppMatchStrength(cel.mean))};
    document.getElementById("scUnlock").classList.add("hide");
    return ki;});

  console.log("\n— 1-2. AZ ÍV (motoros stílus, 329-es állapot) —");
  ok(kozel(t.bejelentett,4.8,0.05),"a bejelentett eset: 4. szint → +4,8 (nem +12)",t.bejelentett);
  ok(t.iv.every(x=>x.lv>=10||kozel(x.b,Math.min(12*x.lv/10,329*[0,0.012,0.021,0.030,0.039,0.048,0.057,0.066,0.075,0.084,0.090][x.lv]),0.06)),
     "szintenként legfeljebb +1,2 — a 10. szinten a teljes +12",t.iv);
  ok(t.iv.find(x=>x.lv===10).b===12,"a 10. szinten +12",t.iv.find(x=>x.lv===10));

  console.log("\n— 3-5. A TETŐ —");
  ok(JSON.stringify(t.teto.map(x=>x.cap))===JSON.stringify([12,15,18,21,24,27,30]),"a tető: 14-ig 12, onnan 15, 18 … 30",t.teto);
  ok(t.teto.every(x=>x.b===x.cap),"nagy állapotnál a hozam eléri a tetőt",t.teto);
  ok(t.masod.cap===15&&t.masod.b===15&&kozel(t.masod.iv4,2.4,0.05),"a másodlagos mindkettő felét kapja (20-as szinten +15, a 4. szinten +2,4)",t.masod);
  ok(kozel(t.kicsi,9,0.05),"kis állapot, kis hozam: 100 × 9% = +9 (nem +12)",t.kicsi);
  ok(kozel(t.pzIv.find(x=>x.lv===4).b,8,0.05)&&t.pzIv.find(x=>x.lv===10).b===20,"Panzer: a 4. szinten +8, a 10.-en +20",t.pzIv);
  ok(JSON.stringify(t.pzTeto.map(x=>x.cap))===JSON.stringify([20,24,32,44]),"Panzer tető: 20, 24 … 44",t.pzTeto);
  ok(t.pzMasod.cap===22&&t.pzMasod.b===22,"Panzer másodlagosként a fele (+22)",t.pzMasod);

  console.log("\n— 6. ULTRA —");
  ok(t.ultra.van&&kozel(t.ultra.vele/t.ultra.nelkul,1.05,1e-9),"az ultra csatár a csapat gólesélyét +5%-kal emeli",t.ultra);

  console.log("\n— 7-8. A PIRAMIS MÉRCÉI —");
  ok(t.allin.meccsero&&t.allin.nyersZarojel&&t.allin.szam===t.allin.vart,"az All-in a te MECCS-ERŐDET írja ki (a nyers zárójelben)",t.allin);
  ok(t.allin.celMs===t.allin.celVart,"…és a cél-osztály mezőnyének meccs-erejét",t.allin);
  ok(t.letra.db>=5&&kozel(t.letra.itt,t.letra.mezonyMost,0.051),"a létra saját foka betűre a „mezőny most\" szám",t.letra);
  ok(t.letra.itt>t.letra.kozep+1,"…és nem az osztályközép",t.letra);
  ok(t.letra.monoton,"a fokok fentről lefelé csökkennek",t.letra);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
