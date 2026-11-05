/* 📣 KERETHIRDETÉS A PÁRHARC ELŐTT (1.0.4.9.00).

   KÉRÉS: „Meccs előtt. Nincs külön felkészülök a meccsre gomb. Hanem.
   Kerethirdetés. […] Két lehetőség, kerethirdetés és utána kezdődhet a meccs.
   Másik, kerethirdetés és megvárom a társam keretét és az elemzést. Harmadik
   egy mégsem hirdetek keretet gomb." — és a kért esetek (1–1, 2–1, 2–2).

   Amit mér (két kliens, saját bajnokság, három párharc-nap):
     A) 2–1 (2. idény, 15. forduló után):
        1. nincs külön felkészülés: a gomb „📣 Kerethirdetés", az ablak 3 választás;
        2. a 3. nem küld semmit;
        3. a 2. kihirdet (kesz 2), a szokásos várakozó jön a saját feliratával;
           a „vissza" kilép, a kihirdetés érvényes marad; újranyomásra csak
           „újra kihirdetem / mégse" (a meccs-várakozóra nem lehet átváltani);
        4. a társ 1.-et választ → a meccs-várakozóba megy (a keret fent);
        5. a 2.-es oldal a HÁTTÉRBEN megkapja az ingyenes elemzést; az edző
           elemzései nem fogynak; a gomb „⚔ Kezdőrúgás";
        6. a kezdőrúgás után a párharc lefut, tükörben; az 1.-es oldal mérlegén
           ott a meccs előtti elemzés gombja, és megnyitja;
     B) 2–2 a meccs-várakozóból visszahívott kerettel (6. idény, 8. forduló után):
        7. 1. → meccs-várakozó; a keret visszahívása után a gomb újra
           kerethirdetést kínál, és a 2. még választható;
        8. mindketten 2. → mindketten megkapják az elemzést; mindkét kezdőrúgás
           után lefut a párharc;
     C) 1–1 (6. idény, 15. forduló után):
        9. mindketten 1. → elemzés nélkül lefut; mindkét mérlegen ott az elemzés;
    10. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9367;
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
  const gyors=pp=>pp.evaluate(()=>{
    phase="season";$("scSim").classList.remove("hide");matchSpeed=3;
    utoLancIndit=function(){};window.saveGame=()=>{};
    if(!window.__gyors){window.__gyors=1;const _st=window.setTimeout,_si=window.setInterval;
      window.setTimeout=function(f,ms,...a){return _st.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};
      window.setInterval=function(f,ms,...a){return _si.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};}
    const E=S.edzo||(edzoAll(),S.edzo);return true;});
  const prep=(pp,sn,idx,rend)=>pp.evaluate(([sn,idx,rend])=>{
    S.seasonNumber=sn;S.idx=idx;S.seasonClosed=false;S.playing=false;S.auto=false;S.h2hPending=null;
    if(rend)S.svPh={v:1,m:{},merleg:{w:0,d:0,l:0,gf:0,ga:0,p:0},r:{[sn]:rend}};
    else if(!S.svPh)S.svPh=null;
    S.subPlanAsked=h2hKey();
    return {label:kickBtnLabel(),esed:svPhEsedekes(),marad:edzoElemzesMarad(),key:h2hKey()};},[sn,idx,rend]);
  const vis=id=>`(()=>{const e=document.getElementById(${JSON.stringify(id)});return !!(e&&!e.classList.contains("hide"));})()`;
  const gombok=pp=>pp.evaluate(()=>[...document.querySelectorAll("#dkGombok button")].map(b=>b.textContent));
  const nyom=(pp,re)=>pp.evaluate(src=>{const r=new RegExp(src);const b=[...document.querySelectorAll("#dkGombok button")].find(x=>r.test(x.textContent));if(b)b.click();return !!b;},re);
  /* a lefújás utáni lánc itt ki van kapcsolva — a valódi játékban a lánc végén a gomb újra él */
  const kick=pp=>pp.evaluate(()=>{const k=$("kickBtn");k.disabled=false;k.click();});
  const rek=(pp,fld)=>pp.evaluate(async f=>{const n=await mpBk().h2hGet(MP.activeRoom,duelKulcs());return n&&n[f]?{kesz:n[f].kesz,lap:!!n[f].card}:null;},fld);
  const all=pp=>pp.evaluate(()=>({label:kickBtnLabel(),pend:!!(S.h2hPending&&S.h2hPending.key===h2hKey()),
    wait:!$("h2hWait").classList.contains("hide"),waitTx:$("h2hWait").classList.contains("hide")?"":$("h2hWait").textContent.replace(/\s+/g," "),
    elem:!$("edzoElemModal").classList.contains("hide"),elemTx:$("edzoElemBody").textContent,marad:edzoElemzesMarad(),playing:S.playing}));
  const varj=async(pp,f,n)=>{let r=null;for(let i=0;i<(n||40);i++){await pp.waitForTimeout(250);r=await pp.evaluate(f);if(r)return r;}return r;};
  const lefut=async(kulcs)=>{let k=false;for(let i=0;i<180&&!k;i++){await p.waitForTimeout(1000);
      k=await p.evaluate(x=>!!(S.svPh&&S.svPh.m[x]),kulcs)&&await g.evaluate(x=>!!(S.svPh&&S.svPh.m[x]),kulcs);}
    const a=await p.evaluate(x=>S.svPh.m[x],kulcs),b2=await g.evaluate(x=>S.svPh.m[x],kulcs);return {k,a,b:b2};};
  const merleg=pp=>pp.evaluate(async()=>{const V=S.lastMatch&&S.lastMatch.verdict;const o={dk:!!(V&&V.dkElem)};
    try{mstatShow(null,"verdict");}catch(e){o.hiba=String(e);}
    const bt=document.getElementById("dkUtolagBtn");o.gomb=!!bt;
    if(bt){bt.click();await new Promise(r=>setTimeout(r,100));o.nyit=!$("edzoElemModal").classList.contains("hide");
      o.tx=$("edzoElemBody").textContent.slice(0,120);$("edzoElemOk").click();}
    try{mstatClose();}catch(e){}return o;});
  await gyors(p);await gyors(g);

  console.log("— A) 2–1 —");
  const pa=await prep(p,2,15,null),pg=await prep(g,2,15,null);
  ok(/^📣 Kerethirdetés — ⚔ PÁRHARC-NAP I$/.test(pa.label)&&pa.esed===1,"1. nincs külön felkészülés: a gomb „📣 Kerethirdetés”",pa);
  await kick(p);await p.waitForTimeout(150);
  const g1=await gombok(p);
  ok(await p.evaluate(vis("dkModal"))&&g1.length===3&&/^⚔ 1\. Kerethirdetés — utána kezdődhet/.test(g1[0])&&/^🧠 2\. Kerethirdetés — megvárom/.test(g1[1])&&/^✋ 3\. Mégsem/.test(g1[2]),"1. az ablak három választást ad",g1);
  ok(await p.evaluate(()=>/Felkészületlenül érkezel/.test($("dkBody").textContent)),"1. az 1. kimondja: felkészületlenül érkezel, az elemzés csak a meccs után");
  await nyom(p,"^✋");await p.waitForTimeout(150);
  ok(!(await p.evaluate(vis("dkModal")))&&!(await rek(g,"host")),"2. a 3. bezár, nem küld semmit");
  await kick(p);await p.waitForTimeout(150);await nyom(p,"^🧠 2\\.");
  const w1=await varj(p,()=>!$("h2hWait").classList.contains("hide"));
  const s1=await all(p),r1=await rek(g,"host");
  ok(w1&&/kerethirdetésed/.test(s1.waitTx)&&/Várjuk a társad kerethirdetését/.test(s1.waitTx)&&r1&&r1.kesz===2,"3. a 2.: kihirdet (kesz 2), a szokásos várakozó a saját feliratával",{r1,tx:s1.waitTx.slice(0,160)});
  await p.evaluate(()=>$("h2hWaitCancelBtn").click());await p.waitForTimeout(200);
  const s2=await all(p),r2=await rek(g,"host");
  ok(!s2.wait&&/^📣 Kihirdetve — /.test(s2.label)&&r2.kesz===2,"3. a „vissza” kilép, a kihirdetés érvényes marad",{label:s2.label,r2});
  await kick(p);await p.waitForTimeout(150);
  const g2=await gombok(p);
  ok(g2.length===2&&/Újra kihirdetem/.test(g2[0])&&/Mégsem/.test(g2[1]),"3. újranyomásra csak „újra kihirdetem / mégse” — a meccs-várakozóra nem lehet átváltani",g2);
  await nyom(p,"Mégsem");
  await kick(g);await g.waitForTimeout(150);await nyom(g,"^⚔ 1\\.");
  const gw=await varj(g,()=>!!(S.h2hPending&&S.h2hPending.key===h2hKey()));
  ok(!!gw,"4. a társ 1.-et választ → a meccs-várakozóba megy (a keret fent)",await all(g));
  const pe=await varj(p,()=>!$("edzoElemModal").classList.contains("hide"),60);
  const s3=await all(p);
  ok(pe&&/ingyenes/.test(s3.elemTx)&&/A párharc ellenfele/.test(s3.elemTx)&&s3.marad===pa.marad,"5. a 2.-es oldal a háttérben megkapja az ingyenes elemzést; az edző elemzései nem fogynak",{marad:[pa.marad,s3.marad]});
  await p.evaluate(()=>$("edzoElemOk").click());
  ok(/^⚔ Kezdőrúgás — PÁRHARC-NAP I$/.test((await all(p)).label),"5. utána a gomb: ⚔ Kezdőrúgás",(await all(p)).label);
  await kick(p);
  const LA=await lefut("2:1");
  ok(LA.k&&LA.a.gf===LA.b.ga&&LA.a.ga===LA.b.gf,"6. a kezdőrúgás után a párharc lefut, tükörben",LA);
  const mg=await merleg(g);
  ok(mg.dk&&mg.gomb&&mg.nyit&&/kihirdetett keretből/.test(mg.tx||""),"6. az 1.-es oldal mérlegén ott a meccs előtti elemzés, és megnyílik",mg);

  console.log("— B) 2–2, visszahívott kerettel —");
  const pb=await prep(p,6,8,[8,15,23,30]),gb=await prep(g,6,8,[8,15,23,30]);
  ok(/^📣 Kerethirdetés/.test(pb.label)&&pb.esed===1,"B: új párharc, a gomb kerethirdetés",pb);
  await kick(p);await p.waitForTimeout(150);await nyom(p,"^⚔ 1\\.");
  await varj(p,()=>!!(S.h2hPending&&S.h2hPending.key===h2hKey()));
  await p.evaluate(()=>$("h2hWaitUnreadyBtn").click());
  await varj(p,()=>!S.h2hPending);
  const s4=await all(p);
  /* a visszahívás a cseretervet is eldobja (a keretre épül) — a kezdőrúgás előbb azt kérdezi; itt átugorjuk */
  const terv=await p.evaluate(()=>({kerdez:S.subPlanAsked!==h2hKey()}));
  await p.evaluate(()=>{S.subPlanAsked=h2hKey();});
  await kick(p);await p.waitForTimeout(150);
  const g3=await gombok(p);
  ok(/^📣 Kerethirdetés/.test(s4.label)&&terv.kerdez&&g3.length===3&&/^🧠 2\./.test(g3[1]),"7. a meccs-várakozóból visszahívva újra kerethirdetés (a csereterv újra kérdez), és a 2. még választható",{label:s4.label,g3,terv});
  await nyom(p,"^🧠 2\\.");await p.waitForTimeout(300);
  await kick(g);await g.waitForTimeout(150);await nyom(g,"^🧠 2\\.");
  const ge=await varj(g,()=>!$("edzoElemModal").classList.contains("hide"),60);
  const pe2=await varj(p,()=>!$("edzoElemModal").classList.contains("hide"),60);
  ok(ge&&pe2,"8. mindketten megkapják az elemzést");
  await p.evaluate(()=>$("edzoElemOk").click());await g.evaluate(()=>$("edzoElemOk").click());
  await kick(p);await p.waitForTimeout(300);
  const pv=await all(p);
  await kick(g);
  const LB=await lefut("6:q1");
  ok(pv.pend&&LB.k&&LB.a.gf===LB.b.ga,"8. aki előbb nyom, vár (a szokásos felület); a második kezdőrúgás után lefut",{pend:pv.pend,LB});

  console.log("— C) 1–1 —");
  await prep(p,6,15,null);await prep(g,6,15,null);
  await kick(p);await p.waitForTimeout(150);await nyom(p,"^⚔ 1\\.");
  await kick(g);await g.waitForTimeout(150);await nyom(g,"^⚔ 1\\.");
  const LC=await lefut("6:q2");
  const ma=await merleg(p),mb=await merleg(g);
  ok(LC.k&&LC.a.gf===LC.b.ga&&ma.gomb&&mb.gomb&&ma.nyit&&mb.nyit,"9. 1–1: elemzés nélkül lefut; mindkét mérlegen ott a meccs előtti elemzés",{LC,ma,mb});
  ok(errs.length===0,"10. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
