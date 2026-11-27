/* 📉 1.0.12.17.00 — KEZDŐ ÚT: AZ ELLENFÉL VISSZAFOGÁSA AZ ELSŐ IDÉNY FELOLDÁSAIIG
   KIMONDOTT KÉRÉS: „Nehézségi szint problémák vannak akkor, ha 5.1 fölött indul egy karrier tanítós üzemmódban,
   mivel nincsenek eszközei a feloldásokig a csapata fejlesztésére. […] visszafogni az ellenfél fejlődését az egyes
   feloldásokig különböző százalékokban. Erre kéne számításokat csinálnod és nehézségi szintekre scalelve
   elkészítened a visszafogás mértékét."
   Amit mér:
     1. a nehézségi szorzó: 4.5 → 0 · 5.1 → 1 · 7.1 → 1,44 · 9.1 → 2,06 · 10.5 → 2,63;
     2. a játékbeli alap-táblázat betűre a számítás (tools/kut-visszafogas/szamitas.js) eredménye;
     3. a százalék szakaszonként (5.1 és 10.5), és 0, ha: nincs Kezdő út · „Mindent kinyitok" · 2. idény · 4.x;
     4. a fordulónkénti gyűjtés: Σ százalék × a mezőny fordulónkénti üteme; ugyanarra a fordulóra kétszer hívva
        nem nő; a pyrGrowNow pontosan ennyivel kisebb; egy feloldás nem írja át a korábbi fordulókat;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9674;
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
  const szamitas=require(path.join(ROOT,"tools/kut-visszafogas/szamitas.js"));
  const r=await p.evaluate(()=>{const o={};
    const fok=(nf,s)=>{S.pyr.fok=Object.assign({},S.pyr.fok||{},{nf,s});};
    o.k={};for(const [nf,s] of [[4,5],[5,1],[7,1],[9,1],[10,5]]){fok(nf,s);o.k[nf+"."+s]=Math.round(kutFekK()*100)/100;}
    o.alap=KUT_FEK.alap.slice();
    S.kut.mind=0;S.kut.kesz_ut=0;
    const pct=(nf,s)=>{fok(nf,s);return [0,1,2,3,4,5,6].map(sz=>{S.kut.sz=sz;return Math.round(kutFekPct()*1000)/1000;});};
    o.p51=pct(5,1);o.p105=pct(10,5);o.p45=pct(4,5);
    fok(5,1);S.kut.sz=0;
    const sn0=S.seasonNumber;S.seasonNumber=2;o.sn2=kutFekPct();S.seasonNumber=sn0;
    S.kut.mind=1;o.mind=kutFekPct();S.kut.mind=0;
    /* 4. gyűjtés */
    fok(7,1);delete S.pyr.kutFek;
    const g=pyrGrowStep();const i0=S.idx;
    S.idx=0;S.kut.sz=0;
    const le=[];let elv=0;
    for(let i=1;i<=14;i++){S.kut.sz=i<=5?1:i<=12?2:3;const p0=kutFekPct();S.idx=i;kutFekTick();elv+=p0*g;le.push(p0);}
    o.acc=kutFekAcc();o.elv=Math.round(elv*1000)/1000;
    kutFekTick();o.acc2=kutFekAcc();
    const nyers=pyrGrowStep()*S.idx+pyrMidLiftNow()+nfGyorsAcc();o.kul=Math.round((nyers-pyrGrowNow())*1000)/1000;
    const elotte=kutFekAcc();S.kut.sz=6;S.idx=15;kutFekTick();o.feloldasUtan=kutFekAcc()-elotte;
    o.le=le;o.log=S.pyr.kutFek.log;S.idx=i0;delete S.pyr.kutFek;
    return o;});
  ok(r.k["4.5"]===0&&r.k["5.1"]===1&&r.k["7.1"]===1.44&&r.k["9.1"]===2.06&&r.k["10.5"]===2.63,"1. a nehézségi szorzó: 4.5 → 0 · 5.1 → 1 · 7.1 → 1,44 · 9.1 → 2,06 · 10.5 → 2,63",r.k);
  ok(JSON.stringify(r.alap)===JSON.stringify(szamitas.kerek),"2. a játék alap-táblázata = a számítás eredménye",{jatek:r.alap,szamitas:szamitas.kerek});
  ok(JSON.stringify(r.p51)===JSON.stringify([0.22,0.22,0.15,0.15,0.14,0.08,0])&&r.p105[0]===0.578&&r.p105[5]===0.21&&r.p105[6]===0
     &&r.p45.every(v=>v===0)&&r.sn2===0&&r.mind===0,"3. szakaszonként (5.1: 22-22-15-15-14-8-0 · 10.5: 58% → 21%), és 0 a 4.x-en, a 2. idényben, „Mindent kinyitok” után",{p51:r.p51,p105:r.p105,p45:r.p45,sn2:r.sn2,mind:r.mind});
  ok(Math.abs(r.acc-r.elv)<0.005&&r.acc2===r.acc&&Math.abs(r.kul-r.acc)<0.005&&Math.abs(r.feloldasUtan)<1e-9&&r.log.length===3,
    "4. fordulónként gyűlik, kétszer hívva nem nő, a pyrGrowNow ennyivel kisebb, a feloldás nem ír vissza",{acc:r.acc,elv:r.elv,acc2:r.acc2,kul:r.kul,feloldasUtan:r.feloldasUtan,log:r.log});
  ok(errs.length===0,"5. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?"✗ "+hiba+" hiba":"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
