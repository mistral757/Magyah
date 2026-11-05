/* 📣 A KERET KIHIRDETÉSE A PÁRHARC ELŐTT (3.9.366).

   KÉRÉS: „Amikor a felkészültem gombra rányomsz, akkor legyen egy felugró
   ablak: a keret kihirdetése, 1. igen, és mehet a meccs, 2. Igen, de még
   lehet, hogy változtatok, 3. Nem, még módosítanom kell. […] amint mindketten
   rányomnak az igenre, mindketten kapnak egy elemzést […] Aki az 1.
   választotta, az megnézheti az elemzést, majd ha azt bezárta, automatikusan
   indul neki a meccs. […] Aki a 2.-t választotta, az visszaléphet, módosíthat
   a csapaton, és kérhet még edzői elemzést, annyit, ahány az edzőnek van
   alapból. Ilyenkor az első, mindenkinek járó elemzés ingyen van."

   Amit mér (két kliens, saját bajnokság, a 15. forduló utáni párharc-nap):
     1. a felkészülés után a gomb „✅ Felkészültem", és az ablak három választást ad;
     2. a 3. bezár, nem küld semmit;
     3. az 1. kihirdeti a lapot (kesz: 1), várakozás; a „Visszalépek" leveszi (kesz: 0);
     4. újra 1. → várakozás; a társ 2.-t választ → a társ AZONNAL ingyenes
        elemzést kap, az edző elemzései nem fogynak, a gomb „📣 Kihirdetve";
     5. az 1.-es oldal is megkapja az elemzést, és az „Értem" indítja a párharcot;
     6. a 2.-es oldal újra nyom → az ablak, 1. → elemzés nélkül indul;
     7. a párharc lefut mindkét gépen, tükörben;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9366;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  const setup=async(p,role,vilag)=>p.evaluate(([role,vilag])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=true;MP.role=role;MP.activeRoom="SV01";
    {const r=mpLRooms();if(!r.SV01){const rec=mpNewRoomRecord();rec.code="SV01";r.SV01=rec;mpLSave(r);}}
    _mpVilagWanted=vilag;_mpSzigorWanted="konnyed";
    gameMode="career";enterCareerSetupFromHome(true);
    pendingWorldSeed=mpLRooms().SV01.seed;   /* a szoba közös seedje, mint a valódi indulásnál */
    beginNewGame();
    const vilagMentve=S.mpVilag;
    /* a fokozat-választó az egyjátékos úton (a szoba fokozatát nem szimuláljuk) */
    MP.active=false;
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[role==="host"?1:2];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    MP.active=true;S.mpVilag=vilagMentve;
    window.saveGame=()=>{};
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){try{window._nlog.push(String(t));}catch(e){}return al.apply(this,arguments);};
    return true;},[role,vilag]);

  const ctx2=ctx;
  const g=await ctx2.newPage();
  g.on("pageerror",e=>errs.push("G: "+String(e)));
  await g.addInitScript(()=>{window.HANG_TESZT=true;});
  await g.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await g.waitForTimeout(1200);

  await setup(p,"host","sajat");await setup(g,"guest","sajat");
  const prep=pp=>pp.evaluate(()=>{
    S.seasonNumber=2;S.idx=15;S.seasonClosed=false;S.svPh=null;S.playing=false;S.auto=false;S.h2hPending=null;
    phase="season";$("scSim").classList.remove("hide");matchSpeed=3;
    utoLancIndit=function(){};window.saveGame=()=>{};
    if(!window.__gyors){window.__gyors=1;const _st=window.setTimeout,_si=window.setInterval;
      window.setTimeout=function(f,ms,...a){return _st.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};
      window.setInterval=function(f,ms,...a){return _si.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};}
    S.subPlanAsked=h2hKey();
    _duelPrep=duelKulcs();   /* a felkészülést (lapcsere) itt átugorjuk */
    const E=S.edzo||(edzoAll(),S.edzo);
    return {label:kickBtnLabel(),esed:svPhEsedekes(),marad:edzoElemzesMarad(),key:h2hKey()};});
  const vis=id=>`(()=>{const e=document.getElementById(${JSON.stringify(id)});return !!(e&&!e.classList.contains("hide"));})()`;
  const gombok=pp=>pp.evaluate(()=>[...document.querySelectorAll("#dkGombok button")].map(b=>b.textContent));
  const nyom=(pp,re)=>pp.evaluate(src=>{const r=new RegExp(src);const b=[...document.querySelectorAll("#dkGombok button")].find(x=>r.test(x.textContent));if(b)b.click();return !!b;},re);
  const rek=(pp,fld)=>pp.evaluate(async f=>{const n=await mpBk().h2hGet(MP.activeRoom,duelKulcs());return n&&n[f]?{kesz:n[f].kesz,dkv:n[f].dkv,lap:!!n[f].card}:null;},fld);
  const pa=await prep(p),pg=await prep(g);
  console.log("— 1. az ablak —");
  ok(/^✅ Felkészültem — ⚔ PÁRHARC-NAP I$/.test(pa.label)&&pa.esed===1,"a felkészülés után a gomb: ✅ Felkészültem — ⚔ PÁRHARC-NAP I",pa);
  await p.evaluate(()=>$("kickBtn").click());await p.waitForTimeout(200);
  const g1=await gombok(p);
  ok(await p.evaluate(vis("dkModal"))&&g1.length===3&&/1\. Igen — mehet/.test(g1[0])&&/2\. Igen, de még/.test(g1[1])&&/3\. Nem/.test(g1[2]),"az ablak három választást ad",g1);
  ok(await p.evaluate(()=>/nem változtathatod/.test($("dkBody").textContent)&&/visszaléphetsz/.test($("dkBody").textContent)),"az 1. kimondja: utána nincs változtatás, csak a várakozásból lehet visszalépni");
  console.log("— 2. a 3. választás —");
  await nyom(p,"^✋");await p.waitForTimeout(200);
  ok(!(await p.evaluate(vis("dkModal")))&&!(await rek(g,"host")),"a 3. bezár, és nem küld kihirdetést",await rek(g,"host"));
  console.log("— 3. az 1. és a visszalépés —");
  await p.evaluate(()=>$("kickBtn").click());await p.waitForTimeout(150);
  await nyom(p,"^✅ 1\\.");await p.waitForTimeout(500);
  const k1=await rek(g,"host");
  ok(k1&&k1.kesz===1&&k1.lap&&await p.evaluate(()=>/várjuk a társadat/.test($("dkCim").textContent)),"az 1. kihirdeti a lapot (kesz 1), és vár a társra",k1);
  await nyom(p,"Visszalépek");await p.waitForTimeout(500);
  const k0=await rek(g,"host");
  ok(k0&&k0.kesz===0&&!(await p.evaluate(vis("dkModal")))&&!(await p.evaluate(()=>!!S.h2hPending)),"a visszalépés leveszi a jelzést, a párharc nem indult",k0);
  console.log("— 4. a társ 2.-t választ —");
  await p.evaluate(()=>$("kickBtn").click());await p.waitForTimeout(150);
  await nyom(p,"^✅ 1\\.");await p.waitForTimeout(400);
  await g.evaluate(()=>$("kickBtn").click());await g.waitForTimeout(150);
  await nyom(g,"^📝 2\\.");await g.waitForTimeout(1500);
  const ge=await g.evaluate(()=>({modal:!$("edzoElemModal").classList.contains("hide"),tx:$("edzoElemBody").textContent,
    marad:edzoElemzesMarad(),ujra:$("edzoElemUjra").classList.contains("hide")}));
  ok(ge.modal&&/ingyenes/.test(ge.tx)&&/A párharc ellenfele/.test(ge.tx)&&ge.marad===pg.marad&&ge.ujra,"a 2.-es oldal azonnal megkapja az ingyenes elemzést a társ kihirdetett lapjával; az edző elemzései nem fogynak",{marad:[pg.marad,ge.marad],tx:ge.tx.slice(0,160)});
  await g.evaluate(()=>$("edzoElemOk").click());await g.waitForTimeout(200);
  const gl=await g.evaluate(()=>({label:kickBtnLabel(),pend:!!S.h2hPending,playing:S.playing}));
  ok(/^📣 Kihirdetve — ⚔ PÁRHARC-NAP I$/.test(gl.label)&&!gl.pend&&!gl.playing,"a 2.-es oldalon az „Értem” után nem indul a meccs; a gomb: 📣 Kihirdetve",gl);
  console.log("— 5. az 1.-es oldal —");
  let pe=null;for(let i=0;i<20&&!(pe&&pe.modal);i++){await p.waitForTimeout(300);pe=await p.evaluate(()=>({modal:!$("edzoElemModal").classList.contains("hide"),tx:$("edzoElemBody").textContent}));}
  ok(pe&&pe.modal&&/ingyenes/.test(pe.tx)&&/Értem" gombbal indul a párharc/.test(pe.tx),"az 1.-es oldal is megkapja az elemzést; kimondja, hogy az Értem indít",pe&&pe.tx.slice(0,120));
  await p.evaluate(()=>$("edzoElemOk").click());await p.waitForTimeout(1200);
  const pp1=await p.evaluate(()=>({pend:!!(S.h2hPending&&S.h2hPending.key===h2hKey()),wait:!!($("h2hWait")&&!$("h2hWait").classList.contains("hide")),playing:S.playing}));
  ok(pp1.pend||pp1.playing,"az „Értem” elindítja a párharcot (a keret felment, várakozás a társ keretére)",pp1);
  console.log("— 6. a 2.-es oldal indít —");
  await g.evaluate(()=>$("kickBtn").click());await g.waitForTimeout(200);
  const g2=await g.evaluate(()=>$("dkBody").textContent);
  ok(/már megkaptad/.test(g2),"újranyomásra ugyanaz az ablak — az ingyenes elemzés már megvolt",g2.slice(0,120));
  await nyom(g,"^✅ 1\\.");await g.waitForTimeout(800);
  const gElem=await g.evaluate(()=>!$("edzoElemModal").classList.contains("hide"));
  ok(!gElem,"az 1. most elemzés nélkül indít");
  console.log("— 7. a párharc —");
  let kesz=false;
  for(let i=0;i<180&&!kesz;i++){await p.waitForTimeout(1000);
    kesz=await p.evaluate(()=>!!(S.svPh&&S.svPh.m["2:1"]))&&await g.evaluate(()=>!!(S.svPh&&S.svPh.m["2:1"]));}
  const ma=await p.evaluate(()=>S.svPh&&S.svPh.m["2:1"]),mg=await g.evaluate(()=>S.svPh&&S.svPh.m["2:1"]);
  ok(kesz&&ma.gf===mg.ga&&ma.ga===mg.gf,"a párharc lefut mindkét gépen, tükörben",{a:ma,g:mg});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
