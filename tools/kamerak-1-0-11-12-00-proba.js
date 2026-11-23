/* 🎥 1.0.11.12.00 — KAMERÁK, 1. FÁZIS
   KÉRÉS: „kezdjünk bele a kameraállásos tervbe. Az állások mindegyike hozza az
   eddigi feelinget […] A játékosarcok is maradjanak meg, a mozgás, stb. Csak
   új kamerákkal."
   Amit mér:
     1. a kapcsoló: alapból BE a lövés jellegű eseményeknél; lapnál, párharcban
        és kikapcsolva nincs kamera;
     2. a sorrend egy gólnál: nyitó vágás a 3D vásznon (a színpad rejtve) →
        a jelenet a rendezővel (követő közeli, majd totál) → reakció-vágás a
        lelátóról → vége; egy esemény = egy lejátszás (_evaFut);
     3. a jelenet mozgása betűre a régi: ugyanazok az animációk (a rendező
        csak a #evaRendezo csoportot nagyítja/mozgatja);
     4. a 3D figurák UGYANAZ a rajz (evaFigura, az arc képe benne);
     5. a stadion az adatokból: nagyobb stadion = több néző, a vendégszektor
        az ellenfél színében; a közelsík-vágás a pályán álló kameránál is
        megtartja a gyepet;
     6. koppintás a nyitó vágás alatt: vége, a jelenet nem indul el később;
     7. kikapcsolva a régi: nincs vászon, nincs rendező-transzform;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9265;
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
  const w=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>{[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/Ne mutass több/.test(x.textContent)).forEach(x=>x.click());});
  const r1=await p.evaluate(()=>{
    const g={t:"gol",side:"us",p:slots[9].player.n,min:30,seq:1};
    const o={gol:kamAktiv(g),lap:kamAktiv({t:"sarga",side:"us",p:"X",min:3,seq:2}),bravur:kamAktiv({t:"bravur",side:"us",p:"X",min:4,seq:3})};
    mevKezd({});_mev.duel=true;o.duel=kamAktiv(g);_mev.duel=false;
    kamAllit(false);o.ki=kamAktiv(g);kamAllit(true);
    return o;});
  /* 1.0.11.13.00 óta minden jelenetnek van felvezetése (a lapnak is) */
  ok(r1.gol&&r1.bravur&&r1.lap&&!r1.duel&&!r1.ki,"1. alapból BE minden jelenetnél (a lapnál is); párharcban és kikapcsolva nincs",r1);
  /* 2–4. egy gól végig */
  await p.evaluate(()=>{window._kamT=[];evaIdoSzorzo=1;mevKezd({});_mev.keret=8;_mev.anim=true;_kamNaplo.length=0;
    const ev={t:"gol",side:"us",p:slots[9].player.n,min:31,seq:5,sor:"31'  GÓL! X (Y)  1:0"};window._kamEv=ev;_mev.lista.push(ev);evaKer(ev);
    const el=()=>document.getElementById("evAnim");
    const t0=performance.now();
    const minta=()=>{const e=el();if(!e){setTimeout(minta,50);return;}const cv=e.querySelector(".evaKamVaszon"),svg=e.querySelector(".evaSzinpad"),R=e.querySelector("#evaRendezo");
      _kamT.push({t:Math.round(performance.now()-t0),vaszon:cv&&!cv.classList.contains("hide"),szin:svg&&svg.style.visibility!=="hidden",
        tr:R&&R.getAttribute("transform")||"",fut:!!_evaFut,F:_evaFut,anims:_evaFut?(_evaFut.anims||[]).length:0});
      if(performance.now()-t0<10500)setTimeout(minta,100);};
    minta();});
  await w(10700);
  const r2=await p.evaluate(()=>{
    const T=_kamT,szakasz=[];let elozo=null;
    T.forEach(x=>{const s=!x.fut?"vege":x.vaszon?"vaszon":x.szin?"szinpad":"?";if(s!==elozo){szakasz.push(s);elozo=s;}});
    const Fs=new Set(T.filter(x=>x.F).map(x=>x.F));
    const nagyit=T.filter(x=>/scale\((1\.[1-9]|1\.[0-9][1-9])/.test(x.tr)).length,total=T.filter(x=>/scale\(1(\.0+)?\)|scale\(1\.06/.test(x.tr)).length;
    const anim=Math.max(...T.map(x=>x.anims));
    /* 4. a 3D figura ugyanaz a rajz */
    const c=evaKontextus(window._kamEv);const img=kamFigKep(c.loUrl,c.loKit);
    const svgSzoveg=decodeURIComponent(img.src.split(",")[1]||"");
    const fig={azonosRajz:svgSzoveg.indexOf(evaFigura("kamF",c.loUrl,c.loKit,0,0,1/0.82))>=0,arc:svgSzoveg.indexOf(c.loUrl.fej.slice(0,60))>=0};
    return {szakasz,egyFut:Fs.size,naplo:_kamNaplo.slice(),nagyit,total,anim,fig,vege:T.filter(x=>!x.fut).length?T.find(x=>!x.fut).t:null};});
  /* 1.0.11.14.00 óta az alap a „Mindkettő": a teljes 3D jelenet és a gólöröm (vászon), utána a rajz visszajátszásként */
  ok(r2.szakasz.join(">")==="vaszon>szinpad>vege","2a. sorrend: 3D jelenet + gólöröm (vászon) → a rajzolt jelenet ismétlésként (színpad) → vége",r2.szakasz);
  ok(r2.egyFut===1&&/^elo:[a-zA-Z]+$/.test(r2.naplo[0])&&r2.naplo[1]==="uto:reakcio","2b. egy esemény = egy lejátszás; a nyitó és a reakció-kamera",{egy:r2.egyFut,naplo:r2.naplo});
  ok(r2.nagyit>=3&&r2.total>=3&&r2.anim>=5,"3. a jelenetben a rendező követ (nagyítás) és vág (totál); a jelenet animációi futnak",{nagyit:r2.nagyit,total:r2.total,anim:r2.anim});
  ok(r2.fig.azonosRajz&&r2.fig.arc,"4. a 3D figura ugyanaz a rajz (evaFigura), benne az arc",r2.fig);
  /* 5. stadion */
  const r5=await p.evaluate(()=>{
    const c=evaKontextus(window._kamEv);
    const A=kamStadionAdat(c);
    const kicsi=kamLelatoEpit(Object.assign({},A,{kap:5000}),1).filter(x=>x.p).length;
    const nagy=kamLelatoEpit(Object.assign({},A,{kap:85000}),1).filter(x=>x.p).length;
    const vend=kamLelatoEpit(A,1).filter(x=>x.vendeg&&!x.ures).map(x=>x.col);
    const ok=evaEllenfelKit(c.oppNev,{c1:teamColors()[0]});
    const K=kamKamera([40,-20,5],[45,-30,3],48,400,400);
    const gyep=kamVagSokszog(K,[[-58,-38,0],[58,-38,0],[58,38,0],[-58,38,0]]);
    return {kap:A.kap,stadionKap:stadionKap(),kicsi,nagy,vendSzin:vend.length&&vend.every(x=>x===ok.c1||x===(ok.c2||"#fff")),gyep:!!gyep&&gyep.length>=3};});
  ok(r5.kap===r5.stadionKap&&r5.nagy>r5.kicsi*1.8&&r5.vendSzin&&r5.gyep,"5. a stadion az adatokból: méret, több néző a nagyobb stadionban, vendégszektor az ellenfél színében; a közelsík-vágás megtartja a gyepet",r5);
  /* 6. koppintás a nyitó vágás alatt */
  const r6=await p.evaluate(async()=>{
    const ev={t:"gol",side:"us",p:slots[9].player.n,min:40,seq:9,sor:"40'  GÓL! X  2:0"};_mev.lista.push(ev);evaKer(ev);
    await new Promise(x=>setTimeout(x,300));
    const elotte=!!_evaFut;document.getElementById("evAnim").click();
    await new Promise(x=>setTimeout(x,1800));
    return {elotte,utana:!!_evaFut,rejtve:document.getElementById("evAnim").classList.contains("hide")};});
  ok(r6.elotte&&!r6.utana&&r6.rejtve,"6. koppintás a nyitó vágás alatt: vége, a jelenet nem indul el utólag",r6);
  /* 7. kikapcsolva */
  const r7=await p.evaluate(async()=>{
    kamAllit(false);
    const ev={t:"gol",side:"us",p:slots[9].player.n,min:50,seq:11,sor:"50'  GÓL! X  3:0"};_mev.lista.push(ev);evaKer(ev);
    await new Promise(x=>setTimeout(x,700));
    const e=document.getElementById("evAnim");
    const o={vaszon:!e.querySelector(".evaKamVaszon").classList.contains("hide"),tr:e.querySelector("#evaRendezo").getAttribute("transform"),anims:(_evaFut&&_evaFut.anims||[]).length};
    evaLezar();kamAllit(true);return o;});
  ok(!r7.vaszon&&!r7.tr&&r7.anims>=5,"7. kikapcsolva a régi: nincs vászon, nincs rendező, a jelenet azonnal indul",r7);
  ok(!errs.length,"8. nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
