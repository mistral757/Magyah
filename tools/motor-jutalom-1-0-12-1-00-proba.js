/* ⚖️🎁 1.0.12.1.00 — A MOTOR RÉSZREHAJLÁSA ALACSONY NEHÉZSÉGEN + A JUTALOM-KÉPERNYŐK MAGYARÁZATA
   KÉRÉS: „Ezen a képernyőn sincs magyarázat, hogy ez micsoda. [Kémia-építés] Plusz […] a
   meccsmotort is kicsit részrehajlóbbá tenni minél lejjebb vagyunk nehézségi szintben. A mostani
   meccsmotor 7.1-től legyen az alap. Onnan nem kell nehezíteni. Lefelé viszont könnyíteni kell
   szépen fokozatosan, hogy a végére már egyértelmű győzelmet jelentsen ha meccserőd magasabb.
   És kevesebb meccserővel is lehessen akár nyerni meccseket"
   Amit mér:
     1. 7.1-en és fölötte (8.3, 10.5) a motor bitre a régi; lefelé fokozatosan könnyebb
        (5.1 < 3.1 < 1.1), +3-as fölénnyel 1.1-en ≥ 75% győzelem, −3-mal ≥ 25%;
     2. a párharcban (noBias) és közös karrierben nincs részrehajlás;
     3. az első kémia-építésnél vezetett lecke (mi ez → mire jó → ajánlat → válassz → hol látod),
        a választás léptet; a másodiknál már nem jön; újranézhető;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9405;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
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
    window.saveGame=()=>{};S.guideOn=false;
    openPreSeasonHub();try{drawPitch();}catch(e){}});
  await p.waitForTimeout(800);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{_guideQ.length=0;guideShowNext();}catch(e){}kutLeckeZar();S.kut.lecke=Object.assign(S.kut.lecke||{},{elso11:1});});
  await p.waitForTimeout(800);
  /* 1–2. a motor */
  const r1=await p.evaluate(()=>{
    const eredeti=window.styleXNfMost;
    const pois=(l,n)=>{let q=Math.exp(-l);for(let i=1;i<=n;i++)q*=l/i;return q;};
    const gy=(lf,la)=>{let w=0;for(let a=0;a<12;a++)for(let c=0;c<a;c++)w+=pois(lf,a)*pois(la,c);return Math.round(w*100);};
    const mine=d=>({ovr:80+d,tacticEffect:0,defMult:1,ownGoalMult:1,oppGoalMult:1});
    const fok=(nf,s2)=>{window.styleXNfMost=()=>({nf,s:s2});};
    const meres=(nf,s2,d,extra)=>{fok(nf,s2);const L=matchLambdas(Object.assign(mine(d),extra||{}),80,0);return {lf:L.lf,la:L.la,gy:gy(L.lf,L.la)};};
    window.styleXNfMost=()=>null;const nyers=d=>{const L=matchLambdas(mine(d),80,0);return {lf:L.lf,la:L.la};};
    const o={};
    const r3=nyers(3),rm3=nyers(-3),r0=nyers(0);
    const egyezik=(a,b)=>Math.abs(a.lf-b.lf)<1e-9&&Math.abs(a.la-b.la)<1e-9;
    o.fent=[[7,1],[8,3],[10,5]].every(([n,s2])=>egyezik(meres(n,s2,3),r3)&&egyezik(meres(n,s2,-3),rm3)&&egyezik(meres(n,s2,0),r0));
    o.p3={"1.1":meres(1,1,3).gy,"3.1":meres(3,1,3).gy,"5.1":meres(5,1,3).gy,"7.1":meres(7,1,3).gy};
    o.m3={"1.1":meres(1,1,-3).gy,"3.1":meres(3,1,-3).gy,"5.1":meres(5,1,-3).gy,"7.1":meres(7,1,-3).gy};
    o.n0={"1.1":meres(1,1,0).gy,"3.1":meres(3,1,0).gy,"5.1":meres(5,1,0).gy,"7.1":meres(7,1,0).gy};
    o.p6={"1.1":meres(1,1,6).gy,"7.1":meres(7,1,6).gy};
    o.parharc=egyezik(meres(1,1,3,{noBias:true}),r3);
    const mpRegi=MP.active;MP.active=true;o.mp=egyezik(meres(1,1,3),r3);MP.active=mpRegi;
    window.styleXNfMost=eredeti;return o;});
  const nov=(o)=>o["1.1"]>o["3.1"]&&o["3.1"]>o["5.1"]&&o["5.1"]>o["7.1"];
  ok(r1.fent&&nov(r1.p3)&&nov(r1.m3)&&r1.p3["1.1"]>=75&&r1.m3["1.1"]>=25,
    "1. 7.1-en és fölötte bitre a régi motor; lefelé fokozatosan könnyebb (+3: győzelem %, −3: győzelem %)",r1);
  ok(r1.parharc&&r1.mp,"2. a párharcban és a közös karrierben nincs részrehajlás",{parharc:r1.parharc,mp:r1.mp});
  /* 3. a kémia-építés leckéje */
  const r3=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    S.chemInProgress=null;let vissza=0;
    showChemBuild(()=>{vissza++;});await w(1500);
    const o={lecke:_kutL&&_kutL.id,lepesek:[]};
    for(let k=0;k<12&&_kutL;k++){
      o.lepesek.push((document.querySelector("#kutLecke .kutLCim")||{}).textContent);
      if(/ajánlata/.test(o.lepesek[o.lepesek.length-1])){const R=kutJutAjanlottSor(),k=$("kutLDim");
        o.keret=!!(R&&k&&!k.classList.contains("hide")&&teachShown(R));}
      const st=KUT_LECKE[_kutL.id].l[_kutL.i];
      if(st.t==="katt"){const v=document.querySelector(".kutCelVillog");if(v)v.click();await w(400);
        if(!$("hubTacticConfirmModal").classList.contains("hide"))$("hubTacticConfirmYes").click();}
      else{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();}
      await w(700);}
    o.vege=!_kutL;o.latott=!!S.kut.lecke.jut_kemia;o.par=!!S.chemInProgress||Object.keys(S.chemPairs||{}).length>0;o.vissza=vissza;
    /* második alkalom: nincs lecke */
    S.chemInProgress=null;showChemBuild(()=>{});await w(1300);o.masodik=_kutL&&_kutL.id;
    $("scSkill").classList.add("hide");kutLeckeZar();
    o.listaban=kutLeckeElerheto("jut_kemia");
    return o;});
  const r5=await p.evaluate(()=>{
    const cimek={kemia:"Kémia-építés — válassz párost!",passz:"Passzkémia — válassz párost!",gyilkos:"Gyilkos páros — válassz párost!",
      szarny:"Szárny-kémia — válassz szárnyat!",fejl:"Fejlesztés — jutalom!"};
    Object.values(SKILL_REASON_TXT).forEach((t,i)=>cimek["skill"+i]=t);cimek.skillX="Jutalom-skill!";
    const o={};
    for(const [k,c] of Object.entries(cimek)){const kind=Object.keys(KUT_JUT).find(j=>KUT_JUT[j].minta.test(c));
      o[k]=kind===(k.startsWith("skill")?"skill":k)?"ok":String(kind);}
    o.leckek=Object.keys(KUT_JUT).every(k=>KUT_LECKE["jut_"+k]&&KUT_LECKE["jut_"+k].l.length===5&&KUT_LECKE_SOR.includes("jut_"+k));
    return o;});
  ok(Object.entries(r5).every(([k,v])=>v===true||v==="ok"),"5. mind a hat jutalom-képernyő címe a saját leckéjét indítja",r5);
  ok(r3.lecke==="jut_kemia"&&r3.lepesek.some(x=>/Mi ez/.test(x))&&r3.lepesek.some(x=>/Mire jó/.test(x))&&r3.lepesek.some(x=>/ajánlata/.test(x))
     &&r3.lepesek.some(x=>/Válassz/.test(x))&&r3.lepesek.some(x=>/Hol látod/.test(x))&&r3.keret&&r3.vege&&r3.latott&&r3.par&&r3.vissza===1&&!r3.masodik&&r3.listaban,
    "3. az első kémia-építésnél vezetett lecke (mi ez → mire jó → ajánlat → válassz → hol látod); a választás léptet; másodszor nem jön; újranézhető",r3);
  ok(!errs.length,"4. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
