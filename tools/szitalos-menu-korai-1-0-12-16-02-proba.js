/* 🎯↩️🎓 1.0.12.16.02 — SZITÁLÓS EGY KAMERÁBÓL · VISSZA A MENÜBE AZ ÁTIGAZOLÁSI ESEMÉNY UTÁN · KORAI STÍLUS-LECKE
   KIMONDOTT KÉRÉS (🐞 jmwyl7uwa5ajb): „Nem igazán lehetett látni a szitálós gól animációját. Túl gyors volt és
   valahogy a kamera pont lövés közben váltott […] Legyen rögzített ennél a gól fajtánál, hogy vagy a kapu mögül,
   vagy a játékos mögül látszik a gól végig, 1 kameraállásból, hogy jól látszódjon a szitálás."
   KIMONDOTT KÉRÉS (🐞 jmwy8icxp8q2v): „Átigazolási esemény animáció és kipörgetés után nem a menübe kerülünk
   vissza, hanem a HUBba. […] ugyanoda kell visszakerülünk, ahol előtte voltunk. Átigazolás fül lenyitva, Menü"
   KIMONDOTT KÉRÉS (🐞 jmwz1nhpk6unb): „Nincs tanítás arra, hogy mi van akkor, ha beköszönt a mennydörgés vagy a
   panzer idő előtt."
   Amit mér:
     1. Szitálós (3D): a labda átvételétől a végéig EGY rögzített kamera (a lövő mögül), a labda ≥ 0,9 mp-ig repül;
        a többi skill (Ágyúgolyó) vágása változatlan (két felvétel);
     2. a menüből (nyitott Átigazolás füllel) indított átigazolási esemény után — sima kimenetel, álomigazolás,
        ikon — a menü nyitva, a fül lenyitva, a lap ugyanott;
     3. a visszatérés után egy HUB-ra horgonyzó tipp nem rántja ki a menüből: vár, és a menüből kilépve jön;
     4. a Kezdő úton a korai Mennydörgés-ajánlatnál magától indul a 4 lépéses lecke a felugró ablak részein,
        a végén az ablak nyitva marad (a döntés a tiéd); a stíluspanel kártyáján „📖 Mi ez?" gomb;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9673;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
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
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  const w=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{kutLeckeZar();}catch(e){}
    document.querySelectorAll("#chPop").forEach(e=>e.remove());try{$("guideTip").classList.add("hide");}catch(e){}
    _oeTok++;clearTimeout(_oeT);oeTorol();oeAllit(false);mevKezd({});_mev.keret=8;_mev.anim=true;});
  await w(400);
  /* 1. */
  const r1=await p.evaluate(()=>{const o={};
    const fut=(sk,t,seq)=>{const ev={t,side:"us",p:slots[9].player.n,min:30,seq};const c=evaKontextus(ev);const F0=kamForgatokonyv(c,ev,sk);
      const k=F0.ms;const F=kamKimenetel(F0,c,ev,sk);const kk=k/F.ms;
      const utan=F.vagas.filter(v=>v.ig>kk+1e-6);return {utan:utan.map(v=>v.n+(v.fix?"*":"")),repul:Math.round((F.csucs-F.lovesT)*F.ms),kim:F.kim};};
    o.szit=[1,2,3,4].map(i=>fut("skSzitalos","gol",i));o.szitV=fut("skSzitalos","bravur",7);o.agyu=fut("skAgyu","gol",5);return o;});
  ok(r1.szit.every(x=>x.utan.length===1&&x.utan[0]==="mogul*"&&x.repul>=900)&&r1.szitV.utan.length===1&&r1.agyu.utan.length===2,
    "1. Szitálós: egy rögzített kamera a lövő mögül, a labda ≥ 0,9 mp-ig repül; az Ágyúgolyó két felvétel marad",r1);
  /* 4. — a korai lecke (Kezdő út) */
  await p.evaluate(()=>{if(S.kut){S.kut.lecke=S.kut.lecke||{};S.kut.lecke.elso11=1;}
    window.__vl=vl0Szamol;window.__us=unlockStyleOk;window.vl0Szamol=()=>({n95:4,n99:1});window.unlockStyleOk=()=>true;S.vl0Asked=0;vl0Tick();});
  await w(1500);
  const lepes=[];
  for(let i=0;i<6;i++){const o=await p.evaluate(()=>({l:_kutL&&_kutL.id,i:_kutL?_kutL.i:-1,m:korAjanlatNyitva(),cel:!!document.querySelector(".kutLVillog,.kutCel,[data-kutcel]")}));
    lepes.push(o);if(!o.l)break;
    await p.evaluate(()=>{const b=[...document.querySelectorAll("#kutLecke button")].find(x=>/Tovább|Kész/.test(x.textContent));b&&b.click();});await w(600);}
  const r4=await p.evaluate(()=>{const o={modal:korAjanlatNyitva(),elerheto:kutLeckeElerheto("korai"),sor:KUT_LECKE_SOR.indexOf("korai")>=0};
    o.kartya=/korMiEz/.test(vl0OfferCardHtml());hubConfirmNem();
    window.vl0Szamol=__vl;window.unlockStyleOk=__us;return o;});
  ok(lepes.length===5&&lepes.slice(0,4).every((x,i)=>x.l==="korai"&&x.i===i&&x.m)&&!lepes[4].l&&r4.modal&&r4.elerheto&&r4.sor&&r4.kartya,
    "4. korai Mennydörgés-ajánlat: magától induló 4 lépéses lecke az ablakon, utána az ablak nyitva; „Mi ez?” a kártyán",{lepes,r4});
  /* 2. — vissza a menübe */
  const allapot=()=>p.evaluate(()=>{const g=document.querySelector('#hubActions .hubGroup[data-acc="transfer"]');
    return {menu:_inHubMenu&&!$("hubActions").classList.contains("hide")&&!$("scHub").classList.contains("hide")&&$("scHub").classList.contains("menuMode"),
      win:!$("scWindow").classList.contains("hide"),fulNyitva:!!(g&&g.classList.contains("open")),y:Math.round(scrollY)};});
  const esemeny=async kim=>{
    await p.evaluate(kim=>{try{kutLeckeZar();}catch(e){}window.kutAktiv=()=>false;
      if(!window.__eredeti)window.__eredeti={r:twResolvePhase2,i:iconEventOK,c:scoutIconChance};
      window.twResolvePhase2=kim==="alom"?()=>({title:"__DREAM_PENDING__"}):kim==="ikon"?__eredeti.r:()=>({title:"Teszt",text:"semmi"});
      window.iconEventOK=kim==="ikon"?()=>true:()=>false;window.scoutIconChance=kim==="ikon"?()=>1:__eredeti.c;
      if(!twWindowOpen())twOpenCheckpointWindow(8,()=>{});
      if(twEventLeft()<=0&&S.twWindow)S.twWindow.eventLeft=3;
      renderHub();hubMenuToggle(true,true);
      const g=document.querySelector('#hubActions .hubGroup[data-acc="transfer"]');if(g&&!g.classList.contains("open"))hubAccToggle(g);
      window.scrollTo(0,300);_hubMenuY=null;},kim);
    await w(400);const elotte=await allapot();
    await p.evaluate(()=>$("hubTransferEventBtn").click());await w(300);
    await p.evaluate(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/Igen, pörgessünk/.test(x.textContent));b&&b.click();});
    const katt=[];
    for(let i=0;i<40;i++){await w(400);const k=await p.evaluate(()=>{const b=[...document.querySelectorAll("#twActions button, #igazJel .ijOk")].find(x=>x.offsetParent);if(b){b.click();return b.textContent.slice(0,20);}return null;});
      if(k)katt.push(k);const a=await allapot();if(!a.win&&katt.length)break;}
    await w(700);return {kim,elotte,utana:await allapot(),katt};};
  const r2=[];for(const k of ["sima","alom","ikon"])r2.push(await esemeny(k));
  ok(r2.every(x=>x.elotte.menu&&x.elotte.fulNyitva&&x.utana.menu&&x.utana.fulNyitva&&!x.utana.win&&Math.abs(x.utana.y-x.elotte.y)<=40),
    "2. az átigazolási esemény után (sima, álomigazolás, ikon) vissza a menübe, nyitott Átigazolás füllel, ugyanott",r2);
  /* 3. */
  const r3=await p.evaluate(async()=>{const o={};
    const id=Object.keys(GUIDE_TIPS).find(k=>{const t=GUIDE_TIPS[k];if(!t.a||t.pre)return false;const e=$(t.a);return e&&e.closest("#scHub")&&!e.closest("#hubActions")&&e.offsetParent&&!/hubMenu/.test(t.a);});
    o.id=id;if(!id)return o;
    if(S.guideSeen)delete S.guideSeen[id];window._twMenuVisszaT=Date.now();S.guideOn=true;
    try{kutLeckeZar();}catch(e){}_guideQ.length=0;_guideCur=null;$("guideTip").classList.add("hide");o.fire=guideFire(id);o.cur=_guideCur;await new Promise(r=>setTimeout(r,300));
    o.menuMarad=_inHubMenu&&!$("hubActions").classList.contains("hide");o.felre=(_guideHalasztott||[]).indexOf(id)>=0;
    hubMenuExit();await new Promise(r=>setTimeout(r,900));
    o.utanaJott=_guideCur===id||(S.guideSeen&&!!S.guideSeen[id]);return o;});
  ok(!r3.id||(r3.menuMarad&&r3.felre&&r3.utanaJott),"3. a visszatérés utáni HUB-tipp vár, és a menüből kilépve jön",r3);
  ok(errs.length===0,"5. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?"✗ "+hiba+" hiba":"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
