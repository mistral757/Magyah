/* 🧭 1.0.11.22.01 — AZ ELSŐ MECCSIG: KIJELÖLÉS, TALIZMÁN-HÚZÁS, KLUBARCULAT
   KÉRÉS (képekkel): „1. itt van valami glitchelés a kijelzőn, amikor ez a kijelölés van
   2. a talizmánt mikor kapom, nincs semmi tanító felület, hogy ez mi.
   3. A klub arculatát még be kéne vezetni, hogy az első meccs előtt ajánlott legyen megcsinálni."
   Amit mér:
     1. „Az első tizenegy” 1–2. lépése EGY sort jelöl ki (nem a teljes keretlistát), és az
        arany keret a képernyőn belül marad;
     2. az első talizmán-húzásnál magától indul a vezetett lecke (mi ez → a lap olvasása →
        válassz → a gyűjteménybe), a lap a húzás-ablak FÖLÖTT; a választás és a gomb léptet;
        a második húzásnál már nem jön; a lecke a listában újranézhető;
     3. a klub arculata kezdőként az első meccs előtt is elérhető (nem zárt), a Kezdő út első
        szakaszában ajánlott feladat (a szakaszhoz 3 a 4-ből kell), a gombja kipipálja, és
        „Az első tizenegy” lecke végén vezetett lépés mutatja;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9401;
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
    openPreSeasonHub();});
  await p.waitForTimeout(800);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{_guideQ.length=0;guideShowNext();}catch(e){}});
  await p.waitForTimeout(2500);
  /* 1. a kijelölés egy sor, a keret a képernyőn belül */
  const r1=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    if(!_kutL)kutLeckeIndit("elso11");await w(1200);
    const meres=()=>{const el=kutLeckeCel(KUT_LECKE.elso11.l[_kutL.i]);const r=el.getBoundingClientRect(),k=document.querySelector("#kutLDim b").getBoundingClientRect();
      return {sor:!!el.closest("#hubRoster")&&el.getAttribute("data-hubkey")!=null,mag:Math.round(r.height),
        bent:k.top>=0&&k.bottom<=window.innerHeight&&k.left>=0&&k.right<=window.innerWidth,lapAtfed:(()=>{const L=document.querySelector("#kutLecke .kutLLap").getBoundingClientRect();return L.bottom>r.top&&L.top<r.bottom;})()};};
    const a=meres();document.querySelector('#kutLecke [data-kl="tovabb"]').click();await w(1200);const b2=meres();
    kutLeckeZar();return {elso:a,masodik:b2};});
  ok(r1.elso.sor&&r1.elso.mag<220&&r1.elso.bent&&!r1.elso.lapAtfed&&r1.masodik.sor&&r1.masodik.bent&&!r1.masodik.lapAtfed,
    "1. az 1–2. lépés egy sort jelöl ki (nem a teljes listát); a keret a képernyőn belül, a lecke lapja nem takarja",r1);
  /* 3. a klub arculata */
  const r3=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    const o={sz:S.kut.sz,nyitva:!$("hubIdentityBtn").classList.contains("kutZar"),fel:KUT_SZAKASZ[0].fel.map(f=>f.id),kell:KUT_SZAKASZ[0].kell,
      leckeben:KUT_LECKE.elso11.l.some(st=>st.el==="hubIdentityBtn")};
    hubMenuToggle(true,true);const g=$("hubIdentityBtn").closest(".hubGroup");if(g&&g.querySelector(".accBody").classList.contains("hide"))hubAccToggle(g);await w(200);
    o.latszik=teachShown($("hubIdentityBtn"));
    $("hubIdentityBtn").click();await w(500);o.panel=kutTw();o.pipa=!!S.kut.kesz["elso11:arculat"];
    try{identCloseNoSave&&identCloseNoSave();}catch(e){}
    $("scWindow").classList.add("hide");$("scHub").classList.remove("hide");hubMenuExit();
    return o;});
  ok(r3.sz===0&&r3.nyitva&&r3.latszik&&r3.fel.includes("arculat")&&r3.kell===3&&r3.leckeben&&r3.panel&&r3.pipa,
    "3. a klub arculata az első meccs előtt elérhető, ajánlott feladat (3 a 4-ből), a gombja kipipálja, és az első lecke végigvezet rajta",r3);
  /* 2. a talizmán-húzás leckéje */
  const r2=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    kutLeckeZar();
    talSor({forras:"ch",szezon:S.seasonNumber||1,fordulo:1});talSor({forras:"ch",szezon:S.seasonNumber||1,fordulo:2});
    talDrawOpen(()=>{});await w(1600);
    const o={lecke:_kutL&&_kutL.id,cim:(document.querySelector("#kutLecke .kutLCim")||{}).textContent,
      fole:+getComputedStyle($("kutLecke")).zIndex>+getComputedStyle($("talDrawModal")).zIndex,
      sav:$("kutLecke").classList.contains("var")};
    const lepesek=[o.cim];
    for(let k=0;k<12&&_kutL;k++){
      const st=KUT_LECKE.talhuzas.l[_kutL.i];
      if(st.t==="katt"){const v=document.querySelector(".kutCelVillog");if(st.el==="talDrawCards")document.querySelector("#talDrawCards .talPickBtn").click();else if(v)v.click();}
      else{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();}
      await w(700);
      if(_kutL)lepesek.push((document.querySelector("#kutLecke .kutLCim")||{}).textContent);}
    o.lepesek=lepesek;o.vege=!_kutL;o.latott=!!S.kut.lecke.talhuzas;o.gyujt=talState().lapok.length;
    /* a második húzás: a lecke már nem jön */
    await w(400);if($("talDrawModal").classList.contains("hide"))talDrawOpen(()=>{});await w(1500);
    o.masodikLecke=_kutL&&_kutL.id;
    $("talDrawLater").click();await w(300);
    o.listaban=kutLeckeElerheto("talhuzas");
    return o;});
  ok(r2.lecke==="talhuzas"&&r2.fole&&!r2.sav&&r2.lepesek.some(x=>/Mi ez/.test(x))&&r2.lepesek.some(x=>/olvasd/.test(x))&&r2.lepesek.some(x=>/Válassz/.test(x))
     &&r2.lepesek.some(x=>/gyűjteménybe/.test(x))&&r2.vege&&r2.latott&&r2.gyujt>=1&&!r2.masodikLecke&&r2.listaban,
    "2. az első talizmán-húzásnál vezetett lecke (mi ez → lap → válassz → gyűjtemény) a húzás-ablak fölött; a másodiknál már nem; újranézhető",r2);
  ok(!errs.length,"4. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
