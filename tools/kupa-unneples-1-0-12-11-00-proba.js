/* 🏆 1.0.12.11.00 — KUPA-ÜNNEPLÉS A DÖNTŐ UTÁN + KARRIERENKÉNT RÖGZÍTETT IKON-SŰRŰSÉG

   KIMONDOTT KÉRÉS (🐞 jmww86laydqkd): „Nem volt ünneplés a BL döntő győzelem
   után. […] Minden kupa végén legyen. És utána legyen a konfettis screen. És
   csak utána minden szokásos meccs utáni értesítés"
   KIMONDOTT KÉRÉS (🐞 jmww8z554g4aw): „9.5 nehézségen átigazolási eseményben
   pörgettem egy legendás igazolást. […] 0%ra van állítva ennek az esélye"

   Amit mér:
     1. VALÓDI döntő a felületről (nyári kupa, felturbózott keret): a lefújás
        után a jelenet jön — a meccs utáni lánc (utoLancIndit) MÉG NEM indult;
     2. a jelenet felvonásai sorra jönnek (a felirat és az SVG változik), van
        benne figura;
     3. „Átugrom" → a konfettis trófea-képernyő, a lánc még mindig áll;
     4. a trófea-képernyő „Tovább" → a lánc elindul (pontosan egyszer);
     5. a kupa lezárásakor a trófea-képernyő NEM jön másodszor;
     6. az ünneplés mind a 7 szinten felépül (HSZ, BL … NYK), képek;
     7. ikon: a futó karrier rögzített „ki" értéke szól, akármit mond a
        böngésző közös beállítása; a scoutIconChance 0; a végigjátszás ága is
        a kapcsolón át dob;
     8. nincs oldalhiba.
   Használat: node tools/kupa-unneples-1-0-12-11-00-proba.js  (KEP=1 → képek a scratchpadba) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9611;
const KEPDIR=process.env.KEPDIR||"/tmp/kupa-unneples-kepek";
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
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
  if(process.env.KEP)fs.mkdirSync(KEPDIR,{recursive:true});
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e.stack||e).split("\n").slice(0,2).join(" ")));
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.KUPAUNNEP_TESZT=true;try{localStorage.setItem("magyah_match_speed","3");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);
  const fej=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[2];
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
    $("mpEntry").classList.add("hide");
    phase="season";S.seasonClosed=true;S.seasonNumber=1;S.idx=30;S.finalTable=[{you:true,n:"x"}];
    setMatchSpeed(3);try{teachSetMode("off");}catch(e){}
    mevAnimBe=()=>false;window.saveGame=()=>{};
    friendlyCupStart(true);
    let n=0;
    while(S.euro&&S.euro.stage!=="final"&&n<30){euroFinishUserMatch(4,0);euroAfterUserMatch();n++;}
    /* a döntőt biztosan nyerjük: a saját keret a mezőny fölé */
    slots.forEach(sl=>{if(sl.player){sl.player.ovr=250;const e=careerPool[sl.player.n];if(e){e.startRating=250;e.peak=250;}}});
    unavailableStarters=()=>[];
    window._lanc=0;const ul=utoLancIndit;utoLancIndit=function(){window._lanc++;return ul.apply(this,arguments);};
    window._sorok=[];const al=addLine;addLine=function(t){try{window._sorok.push(String(t).replace(/<[^>]+>/g,""));}catch(e){}return al.apply(this,arguments);};
    return S.euro?`${S.euro.comp} ${S.euro.stage}/${S.euro.idx}`:"nincs kupa";});
  console.log("  felállás: "+fej);
  ok(/final/.test(fej),"a nyári kupa a döntőnél áll",fej);

  /* 1. a döntő a felületről */
  await p.evaluate(()=>{document.querySelectorAll("section").forEach(x=>x.classList.add("hide"));showEuroScreen();
    const x=$("euroKickBtn");if(x)x.click();});
  await p.waitForTimeout(300);
  for(let k=0;k<12;k++){
    const all=await p.evaluate(()=>{
      if(S.playing||window._sorok.some(t=>/^VÉGE/.test(t)))return "fut";
      const kb=$("kickBtn");if(kb&&!kb.disabled)kb.click();return "-";});
    if(all==="fut")break;await p.waitForTimeout(350);}
  let r=null;const t0=Date.now();
  while(Date.now()-t0<60000){
    await p.waitForTimeout(300);
    r=await p.evaluate(()=>({vege:window._sorok.some(t=>/^VÉGE/.test(t)),eredm:(window._sorok.find(t=>/^VÉGE/.test(t))||""),
      unnep:!!document.getElementById("kupaUnnep"),lanc:window._lanc,playing:S.playing}));
    if(r.unnep||(r.vege&&r.lanc>0))break;}
  ok(r&&r.unnep,"a megnyert döntő után elindul az ünneplés",r);
  ok(r&&r.lanc===0,"az ünneplés alatt a meccs utáni lánc MÉG NEM indult",r);

  /* 2. a felvonások */
  const lepesek=[];
  for(let k=0;k<5;k++){
    const s=await p.evaluate(()=>({f:($("kuFelirat")||{}).textContent||"",fig:document.querySelectorAll("#kuSvg [data-mely]").length,
      svg:($("kuSvg")||{innerHTML:""}).innerHTML.length}));
    lepesek.push(s);
    if(process.env.KEP)await p.screenshot({path:`${KEPDIR}/donto-${k}.png`});
    await p.waitForTimeout(3600);}
  const kul=new Set(lepesek.map(x=>x.f)).size;
  ok(kul>=3,"a felvonások sorra jönnek (eltérő feliratok)",lepesek.map(x=>x.f.slice(0,60)));
  ok(lepesek.every(x=>x.fig>0&&x.svg>500),"minden felvonásban van figura",lepesek.map(x=>x.fig));
  const lanc2=await p.evaluate(()=>window._lanc);
  ok(lanc2===0,"18 mp-nél a lánc még mindig áll",lanc2);

  /* 3. átugrás → trófea-képernyő */
  await p.evaluate(()=>$("kuSkip").click());
  await p.waitForTimeout(1200);
  const tr=await p.evaluate(()=>({modal:!$("championModal").classList.contains("hide"),cim:$("champTitle").textContent,
    gomb:$("champCloseBtn").textContent,unnep:!!document.getElementById("kupaUnnep"),lanc:window._lanc,konf:$("champConfetti").children.length}));
  ok(tr.modal&&/NYÁRI|KUPA/i.test(tr.cim)&&!tr.unnep,"„Átugrom” → a konfettis trófea-képernyő, a jelenet eltűnt",tr);
  ok(tr.konf>0,"a trófea-képernyőn konfetti hull",tr.konf);
  ok(tr.lanc===0,"a trófea-képernyő alatt a lánc még áll",tr.lanc);
  if(process.env.KEP)await p.screenshot({path:`${KEPDIR}/trofea.png`});

  /* 4. Tovább → a lánc */
  await p.evaluate(()=>$("champCloseBtn").click());
  await p.waitForTimeout(800);
  const l3=await p.evaluate(()=>({lanc:window._lanc,elo:!!(S.euro&&S.euro._unnepElo)}));
  ok(l3.lanc===1,"a trófea-képernyő „Tovább” gombja indítja a meccs utáni láncot (egyszer)",l3);
  ok(l3.elo,"a kupa megjegyzi, hogy a trófea-képernyő már megvolt",l3);

  /* 5. a kupa lezárásakor nem jön másodszor */
  const m5=await p.evaluate(()=>{
    $("championModal").classList.add("hide");
    try{proceedAfterMatch=proceedAfterMatch;}catch(e){}
    try{euroHoldStop();}catch(e){}
    try{if(S.euro&&S.euro.stage==="final")euroAfterUserMatch();}catch(e){return "hiba: "+e;}
    try{showEuroScreen();}catch(e){}
    return {eredmeny:S.euro&&S.euro.result,modal:!$("championModal").classList.contains("hide")};});
  ok(m5&&m5.eredmeny==="win"&&!m5.modal,"a kupa lezárásakor a trófea-képernyő nem jön másodszor",m5);

  /* 6. minden szint felépül */
  const szintek=await p.evaluate(async()=>{
    const o=[];
    for(const [comp,st] of [["HSZ","tikitaka"],["BL","villam"],["EL","beton"],["KL","sztar"],["FA","panzer"],["MK","bombazok"],["NYK","harmonia"]]){
      try{S.style=Object.assign({},S.style||{},{key:st});}catch(e){}
      const A=kuAdat(comp,2,1,null,"Próba FC",slots[9].player.n,{[slots[9].player.n]:2});
      const akt=kuAktusok(Object.assign({este:true},A));
      let hibas=0,hossz=0;akt.forEach(a=>{try{const s=a.svg();if(!s||/undefined|NaN/.test(s))hibas++;}catch(e){hibas++;}hossz+=a.dur;});
      o.push({comp,szint:A.szint,db:akt.length,hibas,mp:Math.round(hossz/1000),hos:A.hosok.length,
        felirat:akt.some(a=>/undefined|NaN|\$\{/.test(a.felirat))});}
    return o;});
  ok(szintek.every(x=>x.hibas===0&&!x.felirat&&x.db>=8),"mind a 7 szinten minden felvonás hibátlanul felépül",szintek);
  ok(szintek[0].mp>szintek[6].mp&&szintek[6].mp>=40&&szintek[0].mp<=70,"a szint a hosszt is adja (40–70 mp)",szintek.map(x=>x.comp+":"+x.mp));

  if(process.env.KEP){
    for(const [comp,st] of [["HSZ","tikitaka"],["MK","bombazok"]]){
      await p.evaluate(([comp,st])=>{S.style=Object.assign({},S.style||{},{key:st});
        window._kuKesz=0;kupaUnnepIndit(kuAdat(comp,3,2,null,"Próba FC",slots[9].player.n,{[slots[9].player.n]:2}),()=>{window._kuKesz=1;});},[comp,st]);
      const A=await p.evaluate(()=>kuAktusok(Object.assign({este:true},_kuFut.A)).map(a=>a.dur));
      let t=900;
      for(let i=0;i<A.length;i++){await p.waitForTimeout(i===0?900:A[i-1]);
        await p.screenshot({path:`${KEPDIR}/${comp}-${i}.png`});}
      await p.evaluate(()=>{if(_kuFut)_kuFut.vege(true);});await p.waitForTimeout(700);}}

  /* 7. ikon-sűrűség */
  const ik=await p.evaluate(()=>{
    S.pyr=S.pyr||{};S.pyr.fok={nf:9,s:5,egyeni:false,cfg:{icons:"ki"}};
    setIconRate("teljes");
    const o={most:iconRateNow(),esely:scoutIconChance(),pref:iconRatePref()};
    S.pyr.fok.cfg.icons="nagyonritka";o.nr=iconRateNow();
    delete S.pyr.fok;o.nincs=iconRateNow();
    return o;});
  ok(ik.most==="ki"&&ik.esely===0&&ik.pref==="teljes","a futó karrier rögzített „ki” értéke szól (a közös beállítás „teljes”) — az esély 0",ik);
  ok(ik.nr==="nagyonritka"&&ik.nincs==="teljes","más rögzített érték is, és rögzítés nélkül a közös beállítás",ik);
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(!/iconEventOK\(\)&&Math\.random\(\)<0\.16/.test(src),"a végigjátszás ikon-dobása is a kapcsolón át megy (nincs fix 16%)");

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
