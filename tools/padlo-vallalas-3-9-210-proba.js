/* ⛰ 3.9.210 — A MEZŐNY PADLÓJA ÉS AZ IDÉNYENKÉNTI VÁLLALÁS.

   BEJELENTÉS: „Szezonról szezonra mindig úgy állítja be magát a mezőny ereje,
   hogy minimum olyan erősnek kell lennie, hogy a kezdő nehézséget elérje a
   távolság […] Amennyiben pedig a mezőny alap fejlődése meghaladja ezt a
   minimum értéket, akkor természetesen a magasabbik szám él […] szezonról
   szezonra lehetne vállalást tenni […] max 0,2-vel nehezebbet […] PvP-ben
   […] azok átlagával indulnánk"

   Amit mér:
     1. AZ ÚJ KARRIER padlós, a régi nem (az a szuperliga-kalibrációval fut);
     2. A KEZDŐRÚGÁS: ha elhúztál, a mezőny felnő a vállalásodig; ha a mezőny
        magától erősebb, nem nyúl hozzá (egyoldalú);
     3. A VÁLLALÁS: könnyíteni a karrier eleji +2-ig, nehezíteni 0,2-vel és
        csak sikeres idény után; a választás a határok közé fogva rögzül;
     4. A TÉLI MÉRÉS: a fele azonnal, a másik fele a hátralévő fordulókra;
        idényenként egyszer; a téli ablak zárása indítja;
     5. NINCS szintugrás és hangolás;
     6. A RUN: a plafon a vállalások átlagából, új „Mezőny-emelés" sor, a
        játékos-tempóhoz mérve;
     7. A FELÜLET: a vállalás képernyője (határok, gombok), a HUB gombja nyáron;
     8. KÖZÖS KARRIER: a két meccs-erő és a két vállalás átlaga, a kézfogás
        viszi, a szoba csomagja dönt a szabályról;
     9. A MÉRŐ idényenként rögzíti a vállalást és az emelést. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9252;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const kozel=(a,b,e)=>Math.abs(a-b)<=(e||0.25);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrPickGap=2;pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    phase="season";S.seasonClosed=false;
    return {v:APP_VERSION,padlo:S.pyr.padlo,on:pyrFloorOn(),g0:pyrFloorG0(),gapWant:S.pyr.gapWant,div:S.pyr.my};});
  console.log("\n— 1. az új karrier —");
  ok(String(r0.v).localeCompare("3.9.210",undefined,{numeric:true})>=0&&r0.padlo===1&&r0.on,"az új karrier padlós",r0);
  ok(typeof r0.g0==="number"&&kozel(r0.g0,r0.gapWant==null?r0.g0:r0.gapWant,0.05),"a karrier eleji vállalás a beállított rés",r0);

  console.log("\n— 2. a kezdőrúgás padlója —");
  const r2=await p.evaluate(()=>{
    const o={};
    const gap=()=>{msRatedBegin();try{return Math.round(levelGap()*10)/10;}finally{msRatedEnd();}};
    /* a 2. idény: tavaly bajnoki cím */
    S.seasonHistory=[{season:1,rank:1,pts:70,w:22,d:4,l:4,gf:60,ga:20,oppRating:oppTargetRating,teamAvg:85}];
    S.seasonNumber=2;S.idx=0;
    /* A) elhúztál: a világot 5-tel lejjebb toljuk */
    /* annyival lejjebb, hogy a rés 5-tel a vállalás fölé kerüljön */
    {const kell=(pyrFloorWantFor(2)+5)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.elotte=gap();o.szint0=pyrLevel();
    const h=pyrFloorKickoff();
    o.utana=gap();o.szint1=pyrLevel();o.h=h;
    /* idényenként egyszer */
    o.masodszor=pyrFloorKickoff();
    /* B) a 3. idény: a mezőny magától erősebb — nem nyúl hozzá */
    S.seasonHistory.push({season:2,rank:6,pts:45,w:12,d:9,l:9,gf:40,ga:38,oppRating:oppTargetRating,teamAvg:86});
    S.seasonNumber=3;
    {const kell=gap()-(pyrFloorWantFor(3)-6);pyrShiftWorld({divs:S.pyr.divs},-kell);oppTargetRating=pyrLevel();}
    o.b_elotte=gap();const szB=pyrLevel();
    const h3=pyrFloorKickoff();o.b_utana=gap();o.b_szint=pyrLevel()-szB;o.h3=h3;
    return o;});
  ok(r2.elotte>r2.h.want+3&&kozel(r2.utana,r2.h.want,0.3)&&r2.h.lift>3&&r2.szint1>r2.szint0,"elhúztál → a mezőny felnő a vállalásodig (és ez emelésként rögzül)",r2);
  ok(r2.masodszor===null,"idényenként egyszer fut");
  ok(r2.b_elotte<r2.h3.want-3&&r2.h3.lift===0&&Math.abs(r2.b_szint)<0.01&&kozel(r2.b_utana,r2.b_elotte,0.05),"a mezőny magától erősebb → nem nyúl hozzá (egyoldalú)",{e:r2.b_elotte,u:r2.b_utana,h:r2.h3});

  console.log("\n— 3. a vállalás határai —");
  const r3=await p.evaluate(()=>{
    const o={g0:pyrFloorG0()};
    /* a 2. idény bajnoki címmel zárult → a 3.-ra nehezíthető 0,2-vel (ez már lefutott);
       a 3. nem volt sikeres → a 4.-re nem nehezíthető */
    S.seasonHistory.push({season:3,rank:7,pts:44,w:12,d:8,l:10,gf:40,ga:40,oppRating:oppTargetRating,teamAvg:86});
    o.b4=pyrFloorBounds(4);
    S.seasonHistory[2].rank=1;o.b4ok=pyrFloorBounds(4);
    S.pyr.vallNext=-9;o.lent=pyrFloorWantFor(4);
    S.pyr.vallNext=99;o.fent=pyrFloorWantFor(4);
    S.pyr.vallNext=o.b4ok.prev-0.1;o.kozte=pyrFloorWantFor(4);
    delete S.pyr.vallNext;
    return o;});
  ok(r3.b4.lo===r3.b4.prev&&!r3.b4.ok,"sikertelen idény után nem lehet nehezíteni",r3.b4);
  ok(kozel(r3.b4ok.lo,r3.b4ok.prev-0.2,0.001)&&r3.b4ok.ok,"sikeres idény után 0,2-vel lehet",r3.b4ok);
  ok(kozel(r3.b4ok.hi,r3.g0+2,0.001),"könnyíteni a karrier eleji +2-ig",r3.b4ok);
  ok(kozel(r3.lent,r3.b4ok.lo,0.001)&&kozel(r3.fent,r3.b4ok.hi,0.001)&&kozel(r3.kozte,r3.b4ok.prev-0.1,0.001),"a választás a határok közé fogva",r3);

  console.log("\n— 4. a téli mérés —");
  const r4=await p.evaluate(()=>{
    const o={};
    const gap=()=>{msRatedBegin();try{return Math.round(levelGap()*10)/10;}finally{msRatedEnd();}};
    S.idx=15;
    /* a 3. idény közepére elhúztál: a rés 4-gyel a vállalás fölött */
    {const kell=(pyrFloorHist()[3].want+4)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    const g0=pyrGrowNow();
    o.elotte=gap();
    const m=pyrFloorMid();o.m=m;
    o.most=Math.round((pyrGrowNow()-g0)*10)/10;
    S.idx=30;o.vegen=Math.round((pyrGrowNow()-pyrGrowStep()*30)*10)/10;
    S.idx=15;
    o.masodszor=pyrFloorMid();
    o.hook=twCloseCheckpointWindow.toString().includes("pyrFloorMid");
    o.rec=pyrFloorHist()[3].mid;
    return o;});
  ok(r4.m&&kozel(r4.m.amt,4,0.3)&&kozel(r4.most,r4.m.amt/2,0.15)&&kozel(r4.vegen,r4.m.amt,0.15),"a téli emelés fele azonnal, a másik fele a hátralévő fordulókra",r4);
  ok(r4.masodszor===null&&r4.rec===r4.m.amt,"idényenként egyszer, és rögzül",r4);
  ok(r4.hook,"a téli ablak zárása indítja");

  console.log("\n— 5. nincs szintugrás és hangolás —");
  const r5=await p.evaluate(()=>({leap:pyrLeapOfferable(),retune:pyrRetuneOfferable()}));
  ok(r5.leap===false&&r5.retune===false,"a padló mellett nincs szintugrás és hangolás",r5);

  console.log("\n— 6. a Run —");
  const r6=await p.evaluate(()=>{
    S.run=null;runInit();runCaptureStart();
    const cap=pyrRunCap();const sor=(cap.parts||[]).find(x=>/nehézség/i.test(x.n));
    const avg=pyrFloorAvgG();
    const rb=runBreakdown();const row=rb.rows.find(x=>x.k==="padlo");
    /* gyorsabb játékos-tempón ugyanaz az emelés kevesebbet ér */
    S.run.tempoAx=Object.assign({},S.run.tempoAx||{},{jatekos:"turbo"});
    const rowGyors=pyrFloorRunRow();
    S.run.tempoAx.jatekos="normal";
    return {sor,avg,vart:diffRunFactor(diffSnapT(avg)),row,rowGyors};});
  ok(r6.sor&&kozel(r6.sor.v,r6.vart,0.001),"a plafon nehézség-tényezője a vállalások átlagából",r6);
  ok(r6.row&&r6.row.s>50&&/idény/.test(r6.row.d),"a „Mezőny-emelés” sor a Run-ban",r6.row);
  ok(r6.rowGyors&&r6.rowGyors.s<r6.row.s,"gyorsabb játékos-tempón ugyanaz az emelés kevesebbet ér",{a:r6.row.s,gy:r6.rowGyors.s});

  console.log("\n— 7. a felület —");
  const r7=await p.evaluate(()=>{
    const o={};
    /* nyár: lezárt 3. idény, a 4. előtt */
    S.idx=30;S.seasonClosed=true;phase="hub";hubMidSeasonMode=false;preSeasonHubMode=false;S.twWindow=null;
    o.nyar=pyrFloorSummer();o.up=pyrFloorUpcoming();
    try{renderHub();}catch(e){o.hubErr=e.message;}
    const vb=document.getElementById("hubVallBtn");o.gomb=!vb.classList.contains("hide");o.gombTxt=vb.textContent;
    vb.click();
    o.kepernyo=!document.getElementById("scUnlock").classList.contains("hide");
    o.cim=document.getElementById("unlockTitle").textContent;
    const minus=document.getElementById("pyrVallMinus");
    const b=pyrFloorBounds(o.up);
    for(let i=0;i<5;i++){const m=document.getElementById("pyrVallMinus");if(m&&!m.disabled)m.click();}
    o.minusLe=document.getElementById("pyrVallMinus").disabled;
    document.querySelector("#unlockActions button").click();
    o.next=S.pyr.vallNext;o.lo=b.lo;
    return o;});
  ok(r7.nyar&&r7.up===4&&r7.gomb&&/4\. idény vállalása/.test(r7.gombTxt),"nyáron a HUB-on a következő idény vállalása",r7);
  ok(r7.kepernyo&&/Vállalás/.test(r7.cim),"a gomb a vállalás képernyőjét nyitja",r7.cim);
  ok(r7.minusLe&&kozel(r7.next,r7.lo,0.001),"a nehezítés a határig mehet, a választás rögzül",r7);
  const r7b=await p.evaluate(()=>{const s=document.body.innerHTML;
    const f=String(Function.prototype.toString.call(startNextCareerSeason));
    return {lanc:/pyrFloorOffer\(_offerMp\)/.test(s)||/_vall/.test(document.documentElement.outerHTML),
      kick:f.includes("pyrFloorKickoff")};});
  ok(r7b.kick,"a kezdőrúgás a padlót futtatja (a régi karrier a szuperliga-kalibrációt)",r7b);

  console.log("\n— 8. közös karrier —");
  const r8=await p.evaluate(()=>{
    const o={};
    o.csomag=mpCollectSettings().padlo;
    const s=mpCollectSettings();s.padlo=false;mpApplySettings(s);o.vendegRegi=_mpPadlo;
    s.padlo=1;mpApplySettings(s);o.vendegUj=_mpPadlo;
    const _h=h2hRoomActive;h2hRoomActive=()=>true;
    S.seasonNumber=5;S.idx=0;S.seasonHistory.push({season:4,rank:2,pts:60,w:18,d:6,l:6,gf:50,ga:30,oppRating:oppTargetRating,teamAvg:90});
    const lvl=pyrLevel();
    S.pyr.superPair={for:5,avg:lvl+9,hid:0,a:lvl+10,b:lvl+8,vallA:1.0,vallB:3.0};
    const h=pyrFloorKickoff();
    o.h=h;o.res=Math.round((S.pyr.superPair.avg-pyrLevel())*10)/10;
    /* elmaradt kézfogás: nem találgat */
    S.seasonNumber=6;S.pyr.superPair={for:5,avg:0};
    o.elmaradt=pyrFloorKickoff();
    h2hRoomActive=_h;
    o.kezfogas=/vall:\(\(\)=>\{try\{return pyrFloorOn\(\)\?pyrFloorWantFor/.test(document.documentElement.outerHTML);
    o.stash=pyrSuperPairStash.toString().includes("vallB");
    return o;});
  ok(r8.csomag===1&&r8.vendegRegi===false&&r8.vendegUj===true,"a szabály a szoba csomagjával utazik (régi házigazda → régi szabály)",r8);
  ok(r8.h&&kozel(r8.h.want,2.0,0.001)&&r8.h.g===1.0&&kozel(r8.res,2.0,0.3),"a két meccs-erő és a két vállalás átlaga",r8);
  ok(r8.elmaradt&&r8.elmaradt.lift===0&&r8.elmaradt.elotte==null,"elmaradt kézfogásnál nem találgat",r8.elmaradt);
  ok(r8.kezfogas&&r8.stash,"a kézfogás viszi a vállalást, a pár elteszi",r8);

  console.log("\n— 9. a mérő és a régi karrier —");
  const r9=await p.evaluate(()=>{
    const o={};
    S.seasonNumber=2;
    try{meresSzezonZar();}catch(e){o.err=e.message;}
    const r=meresLoad();const z=r&&r.sz.find(x=>x.sz===2);
    o.padlo=z&&z.padlo;
    /* régi karrier: nincs padlo → a szuperliga-ág */
    delete S.pyr.padlo;o.regi=pyrFloorOn();
    return o;});
  ok(r9.padlo&&typeof r9.padlo.vall==="number"&&r9.padlo.emelesRajt>3,"a mérő rögzíti a vállalást és az emelést",r9.padlo);
  ok(r9.regi===false,"a régi karrier (nincs jelző) nem padlós");

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
