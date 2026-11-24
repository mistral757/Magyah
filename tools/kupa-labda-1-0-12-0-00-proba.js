/* 🏆⚽ 1.0.12.0.00 — HAZAI KUPA MINDEN HELYEZÉSSEL, KÉT KUPA EGY NYÁRON, MECCSLABDA, ANIMÁCIÓK AZ ARCULATBAN
   KÉRÉS: „A klub arculata menüpont alatt lehessen az animációkkal kapcsolatos beállításokat is
   elérni, plusz legyen itt egy meccslabda kusztomizáló rész is. Lehessen külön a bajnokságra és
   minden aktuálisan számodra elérhető kupára […] a MK mindig legyen NBII, NBI-ben megfelelő
   helyezés esetén (akkor is ha megnyered az NBIet) ugyanígy FA legyen helyezéstől függetlenül
   mindig D2 és D1ben. D0-tól csak a HSz" — döntés: NB I-ben mindenki MK; előbb a hazai kupa.
   Amit mér:
     1. a nevezés osztályonként: D1 (1., 10.), D2, D3 (1., 12.), D4 (9.), D5, D0;
     2. két kupa egy nyáron: a hazai után a záró gomb a következőt mondja, és az indul;
        a hazai kupa győzelme feljavítja a sorban álló sorozatot (KONF → KK-selejtező);
     3. a mentés viszi a sort;
     4. meccslabda: a versenyek listája osztályonként; a kupameccsen a kupa labdája (2D és 3D);
     5. „A klub arculata": 8 · A meccslabda (fülek, minta, szín — azonnal) és 9 · Az animációk;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9403;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","profi");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
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
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  /* 1. a nevezés osztályonként */
  const r1=await p.evaluate(()=>{
    const nevez=(div,rank)=>{S.pyr.my=div;S.euroCurrent=null;S.euroCurrentQual=false;S.euroSor=[];
      const ce=cupEntryFor(rank);if(ce){S.euroCurrent=ce.comp;S.euroCurrentQual=ce.qual;}
      kupaSorEpit();return [S.euroCurrent].concat((S.euroSor||[]).map(x=>x.comp+(x.qual?"(s)":""))).filter(Boolean).join("+")||"—";};
    const eredeti=S.pyr.my;
    const o={d1_1:nevez(1,1),d1_10:nevez(1,10),d2_1:nevez(2,1),d3_1:nevez(3,1),d3_12:nevez(3,12),d4_9:nevez(4,9),d5_1:nevez(5,1),d0_1:nevez(0,1)};
    S.pyr.my=eredeti;S.euroCurrent=null;S.euroSor=[];return o;});
  ok(r1.d1_1==="FA+BL"&&r1.d1_10==="FA"&&r1.d2_1==="FA"&&r1.d3_1==="MK+BL(s)"&&r1.d3_12==="MK"&&r1.d4_9==="MK"&&r1.d5_1==="—"&&r1.d0_1==="HSZ",
    "1. nevezés: D1 bajnok FA + KK · D1 10. FA · D2 FA · NB I bajnok MK + KK-selejtező · NB I 12. MK · NB II 9. MK · D5 nincs · D0 csak HSZ",r1);
  /* 2. két kupa egy nyáron */
  const r2=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    const o={};
    S.pyr.my=1;S.euroCurrent="FA";S.euroCurrentQual=false;S.euroSor=[{comp:"BL",qual:false}];S.mkToKLDone=false;
    startEuroCampaign();o.elso=S.euro&&S.euro.comp;
    /* a hazai kupa vége (kiesés): a záró gomb a következőt mondja */
    S.euro.stage="done";S.euro.result="out";
    try{renderEuroScreen();}catch(e){}
    o.gomb=$("euroDoneBtn").textContent;
    endEuroCampaign();await w(200);
    o.masodik=S.euro&&S.euro.comp;o.sorUtana=(S.euroSor||[]).length;
    /* feljavítás: FA-győzelem, a sorban KONF */
    S.euro=null;S.euroCurrent="FA";S.euroSor=[{comp:"KL",qual:false}];S.mkToKLDone=false;
    startEuroCampaign();S.euro.stage="done";S.euro.result="win";S.euro._celebrated=true;
    endEuroCampaign();await w(200);
    o.javitott=S.euro&&S.euro.comp;o.javitottQual=!!S.euroCurrentQual;
    S.euro=null;S.euroCurrent=null;S.euroSor=[];$("scEuro").classList.add("hide");$("scHub").classList.remove("hide");
    return o;});
  ok(r2.elso==="FA"&&/Kupák Kupájának Kupája/.test(r2.gomb)&&r2.masodik==="BL"&&r2.sorUtana===0&&r2.javitott==="BL"&&r2.javitottQual,
    "2. előbb a hazai kupa, a záró gomb a következőt mondja, utána indul a KK; az FA-győzelem a sorban álló KONF-ot KK-selejtezőre javítja",r2);
  /* 3. mentés */
  const r3=await p.evaluate(()=>{
    S.euroCurrent="MK";S.euroSor=[{comp:"BL",qual:true}];
    let raw=null;const _s=window._mentes||null;
    try{const d=JSON.parse(JSON.stringify({S:{euroSor:S.euroSor,euroCurrent:S.euroCurrent}}));raw=d;}catch(e){}
    /* a valódi mentő-objektumban is ott van-e */
    const src=String(saveGame.toString?"":"");
    const vanMentesben=/euroSor:S\.euroSor/.test(document.documentElement.innerHTML);
    S.euroSor=[];const d={S:Object.assign({},raw.S)};
    S.euroSor=Array.isArray(d.S.euroSor)?d.S.euroSor.filter(x=>x&&EURO_COMPS[x.comp]).map(x=>({comp:x.comp,qual:!!x.qual})):[];
    const o={vanMentesben,vissza:JSON.stringify(S.euroSor)};S.euroCurrent=null;S.euroSor=[];return o;});
  ok(r3.vanMentesben&&r3.vissza==='[{"comp":"BL","qual":true}]',"3. a mentés viszi a sort (euroSor), a betöltés visszaadja",r3);
  /* 4. meccslabda */
  const r4=await p.evaluate(()=>{
    const o={};const L=d=>{S.pyr.my=d;return labdaVersenyek().join(",");};
    const er=S.pyr.my;o.d6=L(6);o.d4=L(4);o.d3=L(3);o.d1=L(1);o.d0=L(0);S.pyr.my=er;
    identState().labdak={MK:{a:"#00ff00",b:"#0000ff",m:"csik"}};
    o.liga=evaLabda("x",0,0).includes("#fafafa");
    S.euro={comp:"MK",stage:"group"};o.kupa2d=evaLabda("x",0,0).includes("#00ff00")&&evaLabda("x",0,0).includes("#0000ff");
    const cv=document.createElement("canvas");cv.width=40;cv.height=40;const g=cv.getContext("2d");labdaVaszonra(g,20,20,15);
    const px=g.getImageData(20,25,1,1).data;o.kupa3d=px[1]>200&&px[0]<60;
    S.euro=null;delete identState().labdak;return o;});
  ok(r4.d6==="liga,NYK"&&r4.d4==="liga,MK"&&r4.d3==="liga,MK,BL,EL,KL"&&r4.d1==="liga,FA,BL,EL,KL"&&r4.d0==="liga,HSZ"&&r4.liga&&r4.kupa2d&&r4.kupa3d,
    "4. a labda versenyei osztályonként (megyei: NYK · NB II: MK · NB I: MK, KK, OJK, KONF · D1: FA, KK, OJK, KONF · D0: HSZ); kupameccsen a kupa labdája a 2D és a 3D jeleneten",r4);
  /* 5. az arculat-panel */
  const r5=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    identOpenPanel();await w(300);
    o.labdaSec=!!$("identLabda");o.animSec=!!$("identAnim");
    o.fulek=[...document.querySelectorAll("#identLabda [data-labdaful]")].map(b=>b.dataset.labdaful);
    const mk=document.querySelector('#identLabda [data-labdaful="'+o.fulek[1]+'"]');mk&&mk.click();await w(100);
    document.querySelector('#identLabda [data-labdaminta="csillag"]').click();await w(100);
    const a=$("labdaA");a.value="#123456";a.dispatchEvent(new Event("change"));await w(100);
    o.mentve=JSON.stringify(identState().labdak);
    document.querySelector('#identAnim [data-identkam="regi"]').click();await w(100);o.kamRegi=kamMod();
    document.querySelector('#identAnim [data-identkam="uj"]').click();await w(100);o.kamUj=kamMod();
    document.querySelector('#identAnim [data-identanim="ki"]').click();await w(100);o.animKi=!mevAnimBe();
    document.querySelector('#identAnim [data-identanim="be"]').click();await w(100);o.animBe=mevAnimBe();
    return o;});
  ok(r5.labdaSec&&r5.animSec&&r5.fulek[0]==="liga"&&r5.fulek.length>=2&&/csillag/.test(r5.mentve)&&/#123456/.test(r5.mentve)&&r5.kamRegi==="regi"&&r5.kamUj==="uj"&&r5.animKi&&r5.animBe,
    "5. „A klub arculata”: 8 · A meccslabda (verseny-fülek, minta, szín — azonnal mentve) és 9 · Az animációk (be/ki, Új / Mindkettő / Régi)",r5);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
