/* ⚖️ 1.0.12.12.00 — AZ EGYENSÚLY-GÓL 3D-BEN (libikóka a stadionban)
   KIMONDOTT KÉRÉS: „Az egyensúly gólt nem tudnád megcsinálni 3d új animációval? Olyan gagyi így a régivel. Nagyon kilóg"
   Amit mér:
     1. a skEgyens saját 3D forgatókönyvet kap („egyensuly"): libikóka, öt csapattárs (saját figurával, nem a
        befejező klónjai), a kimenetel fejes gól;
     2. a palló kileng és megnyugszik, majd a lecsapódáskor a kapu felőli vég felcsap; a labda felpattan;
     3. „Új" módban a teljes jelenet a 3D vásznon fut, a rajzolt libikóka nem jön utána;
     4. a fő szereplő minden vágásban a képen, és nem pötty;
     5. nincs oldalhiba.  KEP=1 → képek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9613;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
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
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben, vágjunk/.test(x.textContent)).forEach(x=>x.click());});await p.waitForTimeout(600);
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  await p.evaluate(()=>{[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/Ne mutass több/.test(x.textContent)).forEach(x=>x.click());
    mevKezd({});_mev.keret=8;_mev.anim=true;});
  const KEPDIR=process.env.KEPDIR||"/tmp/egyensuly3d";if(process.env.KEP)require("fs").mkdirSync(KEPDIR,{recursive:true});
  const EV=`({t:"gol",side:"us",p:slots[9].player.n,min:57,seq:4,skill:"akc_egyens",skillP:slots[9].player.n,
    akc:{k:"egyens",crew:slots.filter(s=>s.player).slice(2,8).map(s=>s.player.n).concat([slots[9].player.n]),sc:slots[9].player.n,mp:44}})`;
  const r1=await p.evaluate(EV=>{const ev=eval(EV);const c=evaKontextus(ev);try{EVA_SABLON.skEgyens.svg(c);}catch(e){}
    const F=kamForgatokonyv(c,ev,"skEgyens");const e=["e0","e1","e2","e3","e4"].filter(k=>F.sz[k]);
    const klon=e.filter(k=>F.sz[k].fig===F.sz.lo.fig).length;
    const szog=F.libiko&&F.libiko.sz.map(x=>x[1]);
    const zVeg=k=>kamUt(F.sz[k].ut,.8)[4];
    const K=kamKimenetel(kamForgatokonyv(c,ev,"skEgyens"),c,ev,"skEgyens");
    return {arch:F.arch,e:e.length,klon,szogMax:Math.max(...szog.slice(0,8).map(Math.abs)),nyug:kamUt(F.libiko.sz,.55)[1],
      csap:kamUt(F.libiko.sz,.9)[1],e0fel:zVeg("e0"),e4fel:zVeg("e4"),labdaMax:Math.max(...F.labda.map(l=>l[3])),
      kim:K.kim,halo:!!K.halo,libiK:!!K.libiko,info:(c._info||[]).length};},EV);
  ok(r1.arch==="egyensuly"&&r1.e===5&&r1.klon===0,"1. saját forgatókönyv, öt csapattárs a palló-n (nem a befejező klónjai)",r1);
  ok(r1.szogMax>4&&Math.abs(r1.nyug)<.01&&r1.csap>4&&r1.e0fel<.4&&r1.e4fel>1.5&&r1.labdaMax>3,"2. kileng, megnyugszik; a lecsapódáskor a túlsó vég a földön, a kapu felőli fent, a labda felpattan",r1);
  ok(r1.kim==="gol"&&r1.halo&&r1.libiK,"2b. a kimenetel gól (a háló megmozdul), a libikóka a teljes jelenetben is ott van",r1);
  /* 3. Új mód: csak a 3D */
  const r3=await p.evaluate(async([EV,KEP])=>{kamModAllit("uj");const ev=eval(EV);
    _kamNaplo.length=0;window.__kamMer=[];const T=[];let elozo="";const t0=performance.now();
    const el=evaElem();evaKer(Object.assign({sor:"x"},ev));
    await new Promise(r=>setTimeout(r,60));
    await new Promise(res=>{const lep=()=>{const cv=el.querySelector(".evaKamVaszon");
      const fut=!!_evaFut,vasz=cv&&!cv.classList.contains("hide");const all=!fut?"vege":vasz?"vaszon":"szinpad";
      if(all!==elozo){T.push(all);elozo=all;}
      if(!fut||performance.now()-t0>20000){res();return;}setTimeout(lep,40);};lep();});
    const M=window.__kamMer;window.__kamMer=null;
    const e=M.filter(m=>m.arch==="egyensuly");
    return {T,naplo:_kamNaplo.slice(),n:e.length,ki:e.filter(m=>!m.bent).length,kicsi:e.filter(m=>m.h<.11).length,min:Math.min(...e.map(m=>m.h))};},[EV,!!process.env.KEP]);
  ok(r3.T.includes("vaszon")&&!r3.T.slice(r3.T.indexOf("vaszon")).includes("szinpad"),"3. „Új” módban a 3D vásznon fut, a rajzolt libikóka nem jön utána",r3);
  ok(r3.n>10&&(r3.ki+r3.kicsi)/r3.n<=.05,"4. a fő szereplő a képen, nem pötty",r3);
  if(process.env.KEP){
    await p.evaluate(EV=>{kamModAllit("uj");evaKer(Object.assign({sor:"x"},eval(EV)));},EV);
    for(const t of [700,1500,2300,3000,3500,3900,4400,5000,5600]){await p.waitForTimeout(t-(t>700?[700,1500,2300,3000,3500,3900,4400,5000,5600][[700,1500,2300,3000,3500,3900,4400,5000,5600].indexOf(t)-1]:0));
      await p.screenshot({path:`${KEPDIR}/e-${t}.png`});}}
  ok(errs.length===0,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
