/* 🏋️ 1.0.11.4.03 — A STÁB ÉS AZ EDZÉS A MAGAS SZINTEN.
   BEJELENTÉS (370-es mezőnyön): „teljesen elfogadhatatlan, hogy milyen kevés a
   fejlődés, amit egy stábtag hozzáad… kb. 20× ennyi lenne a reális."
   A MÉRÉS: Játékmester Sz 70, 9 középpályás fókusz, 38 éves játékos: +0,36
   lépés 19 meccs alatt, 176-os, 300-as és 370-es Ratingen UGYANANNYI (a szint-
   szorzó 2,2-nél megállt).
   Amit mér:
     1. a szint-szorzó 480-as Ratingig követ (80 → 1 · 176 → 2,2 · 300 → 3,75 ·
        370 → 4,63 · 600 → 6);
     2. az attribútum-mesterek figyelme: 9 játékosnál 41,5 jut fejenként (volt
        20,6), egy főnél változatlanul a teljes; más stábtípus nem változott;
     3. a mért eset: 38 éves, 9 fős fókusz, 370-es szint → ≥ 15× a régi 0,36
        (a próba a mostani képletből számol, nem rögzített számot vár);
     4. az előrejelzés (stabElorePont) = amit a motor egy meccsen elkönyvel;
     5. az edzésterv főpontja a magas szinten is arányosan nő;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9205;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof coachAttrPower==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=3;S.idx=11;
    window.saveGame=()=>{};window.saveGameNow=()=>{};
    const ts=r=>+trainScale({startRating:r}).toFixed(3);
    ki.ts={r80:ts(80),r176:ts(176),r300:ts(300),r370:ts(370),r600:ts(600)};
    /* a stáb: egy attribútum-mester, 9 fős és 1 fős fókusszal */
    const roster=fullCareerRoster().filter(Boolean);
    const kozep=roster.filter(q=>getCategoryFor((q.pos&&q.pos[0])||"KKP")==="KOZEPPALYAS").map(q=>q.n);
    S.staff=[{type:"attr:passz",attrKey:"passz",n:"Teszt Mester",sz:70,focus:{mode:"players",names:kozep.slice(0,1)}}];
    const c=S.staff[0];
    const pw1=coachPower(c,kozep[0]),ap1=coachAttrPower(c,kozep[0]);
    c.focus={mode:"players",names:kozep.slice(0,9)};
    const n9=focusTargets(c).length;
    const pw9=coachPower(c,kozep[0]),ap9=coachAttrPower(c,kozep[0]);
    ki.fok={n9,egy:{pw:+pw1.toFixed(4),ap:+ap1.toFixed(4)},kilenc:{pw:+pw9.toFixed(4),ap:+ap9.toFixed(4),arany:+(ap9/pw9).toFixed(3),vart:+Math.pow(n9,FOCUS_EXP-COACH_ATTR_EXP).toFixed(3)},
      share:+(focusShare(n9)*Math.pow(n9,FOCUS_EXP-COACH_ATTR_EXP)).toFixed(1)};
    /* egy NEM attribútum-stábtag (forma) változatlan: coachPower szerint */
    S.staff.push({type:"form",n:"Teszt Forma",sz:70,focus:{mode:"players",names:kozep.slice(0,9)}});
    ki.forma={pw:+coachPower(S.staff[1],kozep[0]).toFixed(4),vart:+pw9.toFixed(4)};
    S.staff.pop();
    /* 3. a mért eset */
    const p0=roster.find(q=>q.n===kozep[0]),e0=careerPool[p0.n];
    const pos0=(p0.pos&&p0.pos[0])||"KKP";
    const lep=(rat,age)=>{const o={s:e0.startRating,a:e0.age};e0.startRating=rat;e0.age=age;
      const pt=stabElorePont(c,p0,e0,pos0);e0.startRating=o.s;e0.age=o.a;return +(pt*19/CAREER_DEV_THRESHOLD).toFixed(2);};
    ki.mert={r80:lep(80,38),r176:lep(176,38),r300:lep(300,38),r370:lep(370,38),r370f:lep(370,26)};
    ki.regi=0.36;
    /* 5. az edzésterv főpontja */
    const terv=rat=>{const o=e0.startRating;e0.startRating=rat;const v=TRAIN_PLAN_MAIN*trainScale(e0);e0.startRating=o;return +v.toFixed(2);};
    ki.terv={r80:terv(80),r300:terv(300),r370:terv(370)};
    /* 4. előrejelzés = motor: egy meccs, a log különbsége */
    c.focus={mode:"players",names:[kozep[0]]};
    S.training=null;
    const pt0=stabElorePont(c,p0,e0,pos0);
    const log0=Object.assign({},trainLogFor(e0).pts);
    const stab0=((trainLogFor(e0).stab||{}).passz)||0;
    const active=slots.map((sl,i)=>sl&&sl.player?{p:sl.player,idx:i}:null).filter(Boolean);
    const benn=active.some(a=>a.p.n===p0.n);
    try{processCareerDevelopment(active,{},{},-1,-1,-1,new Set(),null,1);}catch(e){ki.motorHiba=String(e);}
    const stab1=((trainLogFor(e0).stab||{}).passz)||0;
    ki.motor={benn,elore:+pt0.toFixed(4),mert:+(stab1-stab0).toFixed(4)};
    return ki;});
  console.log(JSON.stringify(r).slice(0,2200));
  ok(r.ts.r80===1&&Math.abs(r.ts.r176-2.2)<0.001&&Math.abs(r.ts.r300-3.75)<0.001&&Math.abs(r.ts.r370-4.625)<0.001&&r.ts.r600===6,"1. a szint-szorzó 480-as Ratingig követ (80→1 · 176→2,2 · 300→3,75 · 370→4,63 · plafon 6)",r.ts);
  const vartShare=100/Math.pow(r.fok.n9,0.40);
  ok(r.fok.n9>=4&&Math.abs(r.fok.kilenc.arany-r.fok.kilenc.vart)<0.01&&Math.abs(r.fok.share-vartShare)<0.3&&Math.abs(r.fok.egy.ap-r.fok.egy.pw)<1e-9&&r.fok.kilenc.ap>r.fok.kilenc.pw*1.3,
    `2. az attribútum-mester figyelme: ${r.fok.n9} fősnél ${vartShare.toFixed(1)} fejenként (a régi kitevővel kevesebb lenne), egy főnél a teljes`,r.fok);
  ok(r.forma.pw>0&&Math.abs(r.forma.pw-r.forma.vart)<1e-9,"2. a többi stábtípus (forma) a régi felosztással megy (coachPower változatlan)",r.forma);
  ok(r.mert.r370>=r.regi*15&&r.mert.r370>r.mert.r300&&r.mert.r300>r.mert.r176*1.5,"3. a mért eset: 38 éves, fókusz, 370-es szint ≥ 15× a régi",{mert:r.mert,regi:r.regi});
  ok(r.terv.r300>r.terv.r80*3.5&&r.terv.r370>r.terv.r300,"5. az edzésterv főpontja a magas szinten is arányosan nő",r.terv);
  ok(!r.motorHiba&&r.motor.benn&&r.motor.elore>0&&Math.abs(r.motor.mert-r.motor.elore)<=r.motor.elore*0.15+0.01,"4. az előrejelzés = amit a motor egy meccsen elkönyvel (±15%: a motor a meccs részesedésével szoroz)",r.motor);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
