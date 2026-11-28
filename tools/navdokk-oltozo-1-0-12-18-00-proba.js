/* 🧭 1.0.12.18.00 — HAT DEV JEGYZET: NAVIGÁCIÓS DOKK + ÖLTÖZŐ A MENÜBEN, A JELENETSÁV LETOLJA A FELÜLETET, VISSZA A
   MENÜBE (VÁSÁRLÁS, MEGERŐSÍTÉS), MÉRFÖLDKŐ-CSOMAG, A BENÉZŐ BUBORÉKJA
   KIMONDOTT KÉRÉSEK (🐞 jmwzapt9ae3u2, jmwzahwiw6lxn, jmwzaft1hx47, jmwzacxt539zx, jmwzabcow2vcq, jmwza7zdd87hj) —
   lásd docs/navdokk-oltozo-1-0-12-18-00.md.
   Amit mér:
     1. a dokk: a HUB-on a fő továbblépő gomb felirata, rákoppintva a meccsképernyő; ott „🏠 HUB", a régi HUB-gomb
        rejtve, rákoppintva vissza a HUB; lecke alatt rejtve;
     2. az Öltöző a menüben: a menüpont nyitja a naplót és a jelenetsávot; a meccsképernyőn a gomb rejtve; a Kezdő út
        feladata és „Hol?” leckéje a menün át vezet;
     3. a jelenetsáv alatt a felület a sáv magasságával lejjebb (body + a menü-ablak), bezáráskor vissza 0-ra;
     4. a vásárlásból (TW nélküli úton is) a menübe, nyitott Átigazolás füllel;
     5. a menüből nyitott megerősítés után, ha valami kitett, a menü és a nyitott fül visszaáll;
     6. 6 egyszerre teljesült mérföldkő = EGY felugró, 6 soros görgethető listával; egy = a régi;
     7. a benéző buborékja a fej fölött, a farka a fej felé mutat;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9676;
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
    _oeTok++;clearTimeout(_oeT);oeTorol();oeAllit(false);S.guideOn=false;if(S.kut)S.kut.mind=1;renderHub();});
  await w(700);
  /* 1. dokk */
  const d1=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    /* 🧭 1.0.12.18.02 (🐞 jmwzf2h7v8ypc) — menü-módban nincs dokk (a menülistára lógott): a HUB-ot menü nélkül mérjük */
    o.menuben=_inHubMenu;if(_inHubMenu)hubMenuExit();
    _navDock.tick();const d=$("navDock");o.hubLat=!d.classList.contains("hide");o.hubTx=d.textContent.trim();o.hubGomb=$("hubNextSeasonBtn").textContent.trim();
    $("navDockBtn").click();await v(900);_navDock.tick();
    o.meccsen=!$("scSim").classList.contains("hide");o.meccsTx=d.textContent.trim();o.meccsLat=!d.classList.contains("hide");
    o.regiRejt=getComputedStyle($("matchHubBtn")).display==="none";o.lockerRejt=$("lockerBtn").classList.contains("hide");
    $("navDockBtn").click();await v(900);_navDock.tick();o.vissza=!$("scHub").classList.contains("hide");
    const k=document.createElement("div");k.id="kutLecke";document.body.appendChild(k);_navDock.tick();o.leckeAlatt=d.classList.contains("hide");k.remove();_navDock.tick();
    return o;});
  ok(d1.hubLat&&d1.hubTx.includes(d1.hubGomb.replace(/^\S+\s+/,"").slice(0,10))&&d1.meccsen&&/HUB/.test(d1.meccsTx)&&d1.meccsLat&&d1.regiRejt&&d1.lockerRejt&&d1.vissza&&d1.leckeAlatt,
    "1. dokk: HUB → meccs („← Vissza a szezonhoz” felirattal), meccs → „🏠 HUB”, a régi HUB-gomb rejtve; lecke alatt rejtve",d1);
  /* 2. Öltöző a menüben */
  const d2=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    hubMenuToggle(true,true);const g=$("hubLockerBtn").closest(".hubGroup");if(g&&!g.classList.contains("open"))hubAccToggle(g);
    o.menuben=!!$("hubLockerBtn").closest("#hubActions");_jsavUtolso.oltozo=0;
    $("hubLockerBtn").click();await v(400);
    o.naplo=!$("lockerModal").classList.contains("hide");o.jsav=!!($("jsav")&&$("jsav").dataset.k==="oltozo");
    o.jsavSzoveg=$("jsav")?$("jsav").textContent.slice(0,60):"";
    $("lockerCloseBtn").click();
    const f=KUT_SZAKASZ.flatMap(x=>x.fel).find(x=>x.id==="oltozo");o.feladat=f.a+" | "+f.t;
    const L=kutHolLecke(KUT_SZAKASZ.findIndex(x=>x.fel.includes(f)),f);o.hol=(L.l||[]).map(x=>x.c);
    return o;});
  ok(d2.menuben&&d2.naplo&&d2.jsav&&/hubLockerBtn/.test(d2.feladat)&&/Menü/.test(d2.feladat)&&/menü/i.test(d2.hol[0]||"")&&d2.hol.includes("Az öltöző")&&d2.hol.includes("Mi újság az öltözőben?"),
    "2. Öltöző a menüben: megnyitja a naplót és a jelenetsávot; a feladat és a „Hol?” a menün át",d2);
  /* 3. jelenetsáv: a felület lejjebb */
  const d3=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    await v(100);const j=$("jsav");o.h=j?j.offsetHeight:0;
    o.var=getComputedStyle(document.documentElement).getPropertyValue("--jsavEltol").trim();
    o.body=document.body.classList.contains("jsavNyitva");await v(450);o.pad=parseFloat(getComputedStyle(document.body).paddingTop)-14;
    jsavZar();await v(500);o.pad2=parseFloat(getComputedStyle(document.body).paddingTop)-14;o.var2=getComputedStyle(document.documentElement).getPropertyValue("--jsavEltol").trim();
    return o;});
  ok(d3.h>0&&d3.var===d3.h+"px"&&d3.body&&Math.abs(d3.pad-d3.h)<2&&d3.pad2<1&&d3.var2==="0px","3. a jelenetsáv alatt a felület a sáv magasságával lejjebb, bezáráskor simán vissza",d3);
  /* 4. vásárlásból vissza a menübe (klub-szemle: TW nélküli út is) */
  const d4=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    try{jsavZar(true);}catch(e){}
    if(!twWindowOpen())twOpenCheckpointWindow(8,()=>{});renderHub();hubMenuToggle(true,true);
    const g=document.querySelector('#hubActions .hubGroup[data-acc="transfer"]');if(g&&!g.classList.contains("open"))hubAccToggle(g);
    window.scrollTo(0,250);await v(200);const y0=scrollY;
    $("hubBuyBtn").click();await v(600);o.ablak=!$("scWindow").classList.contains("hide");
    TW=null;csReturnToHub();await v(500);
    o.menu=_inHubMenu&&!$("hubActions").classList.contains("hide");o.ful=g.classList.contains("open");o.dy=Math.abs(scrollY-y0);
    return o;});
  ok(d4.ablak&&d4.menu&&d4.ful&&d4.dy<=40,"4. a vásárlásból (TW nélkül is) vissza a menübe, nyitott Átigazolás füllel, ugyanott",d4);
  /* 5. megerősítés a menüből: ha valami kitesz, visszaáll */
  const d5=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    const g=document.querySelector('#hubActions .hubGroup[data-acc="transfer"]');
    askConfirm({html:"teszt",onYes:()=>{hubMenuExit();}});await v(100);
    $("hubTacticConfirmYes").click();await v(1200);
    o.menu=_inHubMenu&&!$("hubActions").classList.contains("hide");o.ful=g.classList.contains("open");
    /* nem a menüből nyitva: nem nyúl hozzá */
    hubMenuExit();await v(100);askConfirm({html:"teszt2",onYes:()=>{}});$("hubTacticConfirmYes").click();await v(1200);o.kivul=!_inHubMenu;
    return o;});
  ok(d5.menu&&d5.ful&&d5.kivul,"5. a menüből nyitott megerősítés után a menü és a nyitott fül visszaáll; menün kívül nem nyúl hozzá",d5);
  /* 6. mérföldkő-csomag */
  const d6=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    try{localStorage.removeItem(MS_ERT_KEY);}catch(e){}_chPopQ=[];_chPopOn=false;
    for(let i=0;i<6;i++)msErtesitPop("style","🎯","Mérföldkő "+(i+1),"+"+(i+2)+" csapatstílus-pont","");
    await v(700);const el=$("chPop");
    o.kick=el.querySelector("#chPopKick").textContent;o.sor=el.querySelectorAll("#chPopLista .chPopLi").length;o.varo=_chPopQ.length;
    o.gorget=getComputedStyle(el.querySelector("#chPopLista")).overflowY;
    el.querySelector("#chPopBtn").click();await v(500);o.zarva=!_chPopOn;
    msErtesitPop("cash","💰","Egyetlen","+100","");await v(700);o.egy=el.querySelector("#chPopKick").textContent;o.listaRejt=el.querySelector("#chPopLista").classList.contains("hide");
    el.querySelector("#chPopBtn").click();await v(400);
    return o;});
  ok(/^6 mérföldkő/.test(d6.kick)&&d6.sor===6&&d6.varo===0&&d6.gorget==="auto"&&d6.zarva&&d6.egy==="Mérföldkő teljesítve"&&d6.listaRejt,
    "6. 6 egyszerre teljesült mérföldkő = egy felugró, görgethető 6 soros listával, egy gombbal elhajtható; egy = a régi",d6);
  /* 7. a benéző buborékja */
  const d7=await p.evaluate(async()=>{const v=ms=>new Promise(r=>setTimeout(r,ms));const o=[];
    for(const [rnd,nev] of [[0.1,"bal"],[0.5,"jobb"],[0.9,"fent"]]){
      _oeTok++;oeTorol();const r=Math.random;Math.random=()=>rnd;const t=++_oeTok;oeKukucs(t).catch(()=>{});Math.random=r;await v(1500);
      const st=$("oeIdle"),b=st&&st.querySelector(".oeBub.on"),g=st&&st.querySelector(".oeLog,.oeHajol");
      if(!b||!g){o.push({nev,hiba:1});continue;}
      const B=b.getBoundingClientRect(),G=g.getBoundingClientRect();
      const farok=parseFloat(b.style.getPropertyValue("--farok"));
      const fx=B.left+farok;
      o.push({nev,res:nev==="fent"?Math.round(B.top-G.bottom):Math.round(G.top-B.bottom),farokBenn:fx>=G.left-6&&fx<=G.right+6,benn:B.left>=0&&B.right<=innerWidth});}
    _oeTok++;oeTorol();return o;});
  ok(d7.every(x=>!x.hiba&&x.res>=4&&x.res<=40&&x.farokBenn&&x.benn),"7. a benéző buborékja a fej mellett (fölötte / felülről alatta), a farka a figurára mutat",d7);
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?"✗ "+hiba+" hiba":"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
