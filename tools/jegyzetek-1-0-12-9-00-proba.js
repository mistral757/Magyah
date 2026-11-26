/* 🐞 1.0.12.9.00 — A FEJLESZTŐ 7 JEGYZETE + A KÉRT MUNKA (kaszinó, ablakok, menüpont-jelenetek)
   Amit mér:
     1. (jmww2opzrhlmr) a „MK + KK indulunk" gomb nincs a menüben; a gépi próbában nincs kérdés-ablak;
     2. (jmww2fclmac9b) a sztár kiválasztása azonnal a megerősítő ablakot nyitja;
     3. (jmww2kr7q4iob, jmww2cbx128tj) a Kezdő út: „Hosszú táv" 3 feladat, utána két új szakasz (kupák,
        szezon vége) leckével; a filozófia-lecke a szerepeken és egy ajánlott képességen is átvisz; a
        „Hol?" a választóig vezet; a stílus-döntés alatt a HUB-ra horgonyzó tipp vár; az idő előtt
        lezárult út a 3. idényig újranyílik;
     4. (jmww27ib4jnn1) a sárga lapot a bíró a saját (felemelt) kezében tartja; a háló rombusz-szövésű,
        gólnál kidomborodik;
     5. (jmww25gtm70ib) fekvő / PC nézetben a jelenet 16:9, állva négyzet;
     6. a Csapatépítés modálisai menüből ablakként (felülre igazítva, „← Vissza a menübe" sáv);
     7. a kaszinós pörgető: jelenet, a játékosunk a gépnél, a tárcsák a végén az esemény jelén állnak,
        alatta az eredmény és a Tovább gomb; a gépi próbában (KASZINO_TESZT nélkül) a régi pörgetés;
     8. hét új menüpont-jelenet a saját játékosainkkal;
     + nincs oldalhiba. (A talizmán-fúzió saját próbája: talizman-fuzio-ket-alap-1-0-12-9-00.) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9498;
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
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  const w=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{kutLeckeZar();}catch(e){}
    document.querySelectorAll("[role=dialog],.hubModal,#guideTip").forEach(e=>e.classList.add("hide"));});
  /* 1 */
  const r1=await p.evaluate(()=>{window.euroPendingComp=()=>({n:"Magyah Kupa",short:"MK",col:"#fff"});renderHub();
    const b=$("hubEuroBtn");return {rejtett:!b||b.classList.contains("hide"),kerdes:hubEuroKerdes()};});
  ok(r1.rejtett&&r1.kerdes===false,"1. a „… indulunk” gomb rejtve, akkor is, ha esedékes a kupa; gépi futásnál nincs kérdés-ablak",r1);
  /* 2 */
  const r2=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    const sd=STYLES.find(x=>x.star);const box=document.createElement("div");document.body.appendChild(box);
    box.innerHTML=styleStarPickerHtml(null);styleBindStarPicker(box,sd.key,null);
    const b=box.querySelector("[data-starpick]");b.click();await w(200);
    const m=$("hubTacticConfirmModal");const o={modal:!m.classList.contains("hide"),cim:$("hubTacticConfirmTitle").textContent};
    m.classList.add("hide");box.remove();return o;});
  ok(r2.modal,"2. a sztár kiválasztása azonnal a megerősítő ablakot nyitja",r2);
  /* 3 */
  const r3=await p.evaluate(()=>{const o={};
    o.ids=KUT_SZAKASZ.map(x=>x.id);const h=KUT_SZAKASZ.find(x=>x.id==="hosszu");o.hosszuKell=h.kell;o.hosszuFel=h.fel.length;
    o.leckek=!!(KUT_LECKE.kupa&&KUT_LECKE.zaras);o.filLep=KUT_LECKE.filozofia.l.map(x=>x.c);o.hol=!!KUT_HOL_BELUL.valaszt;
    o.sor=KUT_LECKE_SOR.includes("kupa")&&KUT_LECKE_SOR.includes("zaras");
    /* az idő előtt lezárult út újranyílik (egyszer) */
    const K=S.kut;const ment=JSON.stringify(K);
    K.sz=8;K.kesz_ut=1;K.mind=0;delete K.bov129;S.seasonNumber=2;o.ujra=kutAktiv()&&!K.kesz_ut&&K.bov129===1;
    K.kesz_ut=1;o.egyszer=!kutAktiv();
    S.kut=JSON.parse(ment);S.seasonNumber=1;
    /* a stílus-döntés alatt a HUB-ra horgonyzó tipp vár */
    const _sc=styleCanChoose,_ss=styleState;window.styleCanChoose=()=>true;window.styleState=()=>null;S.kut.mind=0;S.kut.kesz_ut=0;
    o.dontes=kutStilusDontes();
    window.styleCanChoose=_sc;window.styleState=_ss;o.utana=kutStilusDontes();S.kut.mind=1;
    return o;});
  ok(r3.ids.join(",").endsWith("filozofia,hosszu,kupa,zaras")&&r3.hosszuKell===5&&r3.hosszuFel===6&&r3.leckek&&r3.sor,"3. a „Hosszú táv” 5/6 feladat (1.0.12.15.00: + stadion, scout, keretbővítés), utána a kupák és a szezon vége, saját leckével",r3);
  ok(r3.filLep.some(c=>/szerep/i.test(c))&&r3.hol,"3. a filozófia-lecke a szezon-szerepeken is átvisz; a „Hol?” a választóig vezet",r3.filLep);
  ok(r3.ujra&&r3.egyszer,"3. az idő előtt lezárult Kezdő út egyszer újranyílik (a 3. idényig)",{ujra:r3.ujra,egyszer:r3.egyszer});
  ok(r3.dontes&&!r3.utana,"3. a stílus-döntés alatt a tippek és a nyitás-ünnep várnak; a döntés után nem",{dontes:r3.dontes,utana:r3.utana});
  /* 4 */
  const r4=await p.evaluate(()=>{const c=evaKontextus({t:"sarga",side:"us",p:"Teszt",min:3,seq:1});
    const box=document.createElement("div");box.innerHTML=`<svg class="evaSzinpad" viewBox="0 0 120 120">${EVA_SABLON.lap.svg(c)}${evaKapu()}</svg>`;document.body.appendChild(box);
    const biro=box.querySelector("#evaBiro");const o={kar:!!(biro&&biro.querySelector("#evaKarLe")&&biro.querySelector("#evaLap rect")),
      kez:!!(biro&&biro.querySelector("#evaLap circle")),regiLap:!!box.querySelector("svg>#evaLap"),
      halo:!!box.querySelector("#evaHaloDom")&&/L/.test(box.querySelector("#evaHalo path").getAttribute("d"))};box.remove();return o;});
  ok(r4.kar&&r4.kez&&!r4.regiLap,"4. a lap a bíró felemelt kezében (a kar a bíró figurájának része, a kéz fogja a lapot)",r4);
  ok(r4.halo,"4. a háló rombusz-szövésű, és van kidomborodó réteg",r4);
  /* 5 */
  await p.setViewportSize({width:1280,height:800});
  const r5a=await p.evaluate(()=>evaSzeles());
  await p.setViewportSize({width:390,height:844});
  const r5b=await p.evaluate(()=>evaSzeles());
  ok(r5a===true&&r5b===false,"5. PC / fekvő nézetben szélesvászon, állva négyzet",{pc:r5a,allo:r5b});
  /* 6 */
  const r6=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    hubMenuToggle(true,true);await w(200);talMenuOpen();await w(400);
    const m=$("talModal"),c=m.querySelector(":scope>.card"),v=c.querySelector(".modalVissza");
    const o={menu:document.body.classList.contains("inHubMenu"),vissza:!!(v&&getComputedStyle(v).display!=="none"),
      rad:getComputedStyle(c).borderTopLeftRadius,igazit:getComputedStyle(m).alignItems};
    v.click();await w(300);o.zarva=m.classList.contains("hide");o.menuMarad=document.body.classList.contains("inHubMenu");
    hubMenuExit();return o;});
  ok(r6.menu&&r6.vissza&&r6.rad==="18px"&&r6.igazit==="flex-start"&&r6.zarva&&r6.menuMarad,"6. a talizmán-ablak menüből a többi ablak stílusában, „← Vissza a menübe” sávval; bezárva a menü marad",r6);
  /* 7 */
  const r7a=await p.evaluate(()=>kasLehet());
  const r7=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));window.KASZINO_TESZT=true;
    TW={cycle:1,category:null,candidates:[],retries:0,maxCycles:1,label:"Nyári átigazolási esemény",isHubEvent:true};
    $("scHub").classList.add("hide");$("scWindow").classList.remove("hide");$("twPanel").classList.remove("hide");
    twStartPhase2();await w(300);
    const o={jelenet:!!$("twKaszino"),figura:!!document.querySelector("#twKaszino .kasJatekos [data-mely]"),rejtveAlatta:!$("twActions").textContent};
    for(let i=0;i<60&&($("twPanel").classList.contains("kasRejt")||!$("twActions").textContent);i++)await w(200);
    const sz=[0,1,2].map(i=>{const g=$("kasSzalag"+i);if(!g)return null;const y=-new DOMMatrix(getComputedStyle(g).transform).f;return g.children[Math.round(y/13)]&&g.children[Math.round(y/13)].textContent;});
    o.szalag=sz;o.egyforma=sz[0]&&sz.every(x=>x===sz[0]);o.jel=_kasJel;o.vart=KAS_JEL[_kasJel||"egyeb"];
    o.tovabb=!!$("twActions").textContent;o.felfedve=!$("twPanel").classList.contains("kasRejt");o.maradt=!!$("twKaszino");
    window.KASZINO_TESZT=false;return o;});
  ok(r7a===false,"7. gépi futásnál (KASZINO_TESZT nélkül) a régi, gyors pörgetés",r7a);
  ok(r7.jelenet&&r7.figura&&r7.rejtveAlatta,"7. a kaszinó-jelenet a saját játékosunkkal indul, az eredmény még nincs kint",r7);
  ok(r7.egyforma&&r7.szalag[0]===r7.vart&&r7.tovabb&&r7.felfedve&&r7.maradt,"7. a tárcsák az esemény jelén állnak meg, utána előjön az eredmény és a Tovább",r7);
  /* 8 */
  const r8=await p.evaluate(()=>["jsavFelallas","jsavTalizman","jsavBoost","jsavStadion","jsavStab","jsavMenedzsment","jsavLada"].map(f=>{
    let J=null;try{J=window[f](jsavSzin());}catch(e){return {f,hiba:String(e)};}
    return {f,ok:!!(J&&J.svg&&J.szoveg&&typeof J.anim==="function"&&/data-mely/.test(J.svg))};}));
  ok(r8.every(x=>x.ok),"8. hét új menüpont-jelenet, mind a saját játékosunk figurájával",r8);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
