/* 😴🧍 1.0.12.16.00 — HUB-FIGURÁK RITKÍTÁSA, KUKUCSKÁLÁS, SZUNDI, JÁTÉKOS A TÖLTŐN, IGAZOLÁS-JELENET GLITCH
   KIMONDOTT KÉRÉS (🐞 jegyzet jmwy4573jh1ss): „Túl sok a kis besétáló játékosok animáció a HUBban. […] Ne mindig
   5mp időközönként jöjjön. Hanem 7-11 mp, és legyen olyan animáció is, ami csak egy oldalról vagy felülről
   benézés […] minden 3. ilyen animációnál az egyik játékos úgy jöjjön be, hogy […] megkérdezi […] És ha erre
   rákattintasz, akkor be lehet állítani ott rögtön hogy mennyi szundi idő legyen […] Átvezető kijelzőn ezentúl
   nem a kis pixel figura legyen hanem valamelyik játékosunk dekázzon azon mindig."
   KIMONDOTT KÉRÉS (🐞 jegyzet jmwy3zuxxc79j): „Nagyon menő a legendás igazolás képernyő, de glitchel sajnos. […]"
   Amit mér:
     1. a jelenetek közti szünet 7–11 mp (véletlen);
     2. minden 3. jelenet a kérdező játékos, a többi a szokásos (benne a kukucskálás);
     3. a kukucskálás: felülről (fejjel lefelé, a buborék alatta) és oldalról;
     4. a kérdésre koppintva a szundi-választó nyílik; a választott idő alatt nem jön jelenet; „kikapcsolom" = kapcsoló ki;
     5. a töltőn a mi játékosunk (meccsfigura + labda + név), nem a pixel kisfiú;
     6. az igazolás-jelenet átugrása (koppintás) nem gyorsítja fel a végtelen animációkat (sugár, szikrák);
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9663;
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
    document.querySelectorAll("#chPop").forEach(e=>e.remove());try{const g=$("guideTip");if(g)g.classList.add("hide");}catch(e){}
    _oeTok++;clearTimeout(_oeT);oeTorol();try{localStorage.removeItem(OE_SZUNDI_KEY);}catch(e){}});
  await w(400);
  /* 1. */
  const g=await p.evaluate(()=>{const a=[];for(let i=0;i<400;i++)a.push(oeGap());return {min:Math.min(...a),max:Math.max(...a),kul:new Set(a.map(x=>Math.round(x/500))).size};});
  ok(g.min>=7000&&g.max<=11000&&g.kul>=6,"1. a szünet 7–11 mp között szór",g);
  /* 2. */
  const s=await p.evaluate(async()=>{const nap=[];const K=oeKerdes,J=oeJelenet,L=oeLehet;
    window.oeKerdes=async()=>{nap.push("K");};window.oeJelenet=async()=>{nap.push("J");};window.oeLehet=()=>true;
    _oeDb=0;_oeMehet=true;
    for(let i=0;i<9;i++){oeIndul();await new Promise(r=>setTimeout(r,20));clearTimeout(_oeT);}
    window.oeKerdes=K;window.oeJelenet=J;window.oeLehet=L;_oeTok++;oeTorol();return nap.join("");});
  ok(s==="JJKJJKJJK","2. minden 3. jelenet a kérdés",s);
  /* 3. */
  const k=await p.evaluate(async()=>{const o={};const r=Math.random;
    Math.random=()=>0.9;oeKukucs(++_oeTok).catch(()=>{});Math.random=r;await new Promise(x=>setTimeout(x,1300));
    o.fent=!!(_oeEl&&_oeEl.classList.contains("oeFent"));o.lent=!!document.querySelector("#oeIdle .oeBubLent");
    _oeTok++;oeTorol();await new Promise(x=>setTimeout(x,300));
    Math.random=()=>0.1;oeKukucs(++_oeTok).catch(()=>{});Math.random=r;await new Promise(x=>setTimeout(x,1300));
    o.oldal=!!(_oeEl&&!_oeEl.classList.contains("oeFent")&&_oeEl.querySelector("image,svg"));
    _oeTok++;oeTorol();return o;});
  ok(k.fent&&k.lent&&k.oldal,"3. kukucskálás felülről (buborék alatta) és oldalról",k);
  /* 4. */
  await p.evaluate(()=>{oeKerdes(++_oeTok).catch(()=>{});});await w(2600);
  const q=await p.evaluate(async()=>{const o={};const b=document.querySelector("#oeIdle .oeBub.on");
    o.szoveg=b?b.textContent:"";o.kerdes=/Mester/.test(o.szoveg);
    b.click();await new Promise(x=>setTimeout(x,300));
    o.valaszto=!!document.getElementById("oeSzundi");o.opc=document.querySelectorAll("#oeSzundi [data-oesz]").length;
    document.querySelector('#oeSzundi [data-oesz="15"]').click();await new Promise(x=>setTimeout(x,300));
    o.szundi=oeSzundiz();o.lehet=oeLehet();o.perc=Math.round((oeSzundiIg()-Date.now())/60000);
    localStorage.removeItem(OE_SZUNDI_KEY);_oeMunkamenetSzundi=false;o.ujra=oeLehet();
    oeSzundiAllit("ki");o.ki=!oeBe();oeAllit(true);
    return o;});
  ok(q.kerdes&&q.valaszto&&q.opc===7&&q.szundi&&!q.lehet&&q.perc===15&&q.ki,"4. kérdés → szundi-választó; 15 perc alatt nincs jelenet; a kikapcsolás a kapcsolót viszi",q);
  /* 5. */
  const t=await p.evaluate(async()=>{toltoMutat();await new Promise(x=>setTimeout(x,700));const o=document.getElementById("toltoRet");
    const r={sajat:o.classList.contains("toltoSajat"),svg:!!o.querySelector(".toltoJSvg image, .toltoJSvg .jsFigTest"),labda:!!o.querySelector("#toltoLb"),
      nev:(o.querySelector(".toltoNev")||{}).textContent||"",anim:o.getAnimations({subtree:true}).length};
    r.ourNev=slots.some(s=>s.player&&shortName(s.player.n)===r.nev)||Object.keys(careerPool||{}).some(n=>shortName(n)===r.nev);
    toltoRejt();return r;});
  ok(t.sajat&&t.svg&&t.labda&&t.ourNev&&t.anim>0,"5. a töltőn a mi játékosunk dekázik",t);
  /* 6. */
  const ij=await p.evaluate(async()=>{window.IGAZ_TESZT=true;const pl=slots.find(s=>s.player).player;
    igazJelenetMutat(igazAdat(pl,{legenda:true}),()=>{});await new Promise(x=>setTimeout(x,400));
    const ov=document.getElementById("igazJel");ov.click();await new Promise(x=>setTimeout(x,300));
    const o={kesz:ov.classList.contains("ijKesz")};
    const d=el=>{const a=el?el.getAnimations():[];return a.map(x=>x.effect.getTiming().duration);};
    o.sugar=d(ov.querySelector(".ijSugar"));o.szikra=d(ov.querySelector(".ijSzikra"));
    o.alakOp=getComputedStyle(ov.querySelector(".ijKartya")).opacity;o.teaser=getComputedStyle(ov.querySelector(".ijTeaser")).display;
    ov.querySelector(".ijOk").click();await new Promise(x=>setTimeout(x,500));o.zarva=!document.getElementById("igazJel");return o;});
  ok(ij.kesz&&ij.sugar[0]>=10000&&ij.szikra[0]>=1000&&ij.alakOp==="1"&&ij.teaser==="none"&&ij.zarva,"6. az átugrás után a sugár és a szikrák a rendes tempójukkal mennek",ij);
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?"✗ "+hiba+" hiba":"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
