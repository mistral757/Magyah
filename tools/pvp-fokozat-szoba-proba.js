/* 🎚 PvP: A VÁLASZTOTT FOKOZAT A SZOBÁBAN (3.9.224)

   BEJELENTÉS: „PvP settingeket beállítottam, 5.1 nehézségi szintet
   választottam. Nem ajánlotta fel, hogy melyik divízióban kezdjünk, majd
   pedig a szezon kezdetekor azt írja már ki, hogy Simaliba a nehézségi
   szint." — a feedben: „a rés +5.8 → +1.8 (a vállalás +1.4)".
   AZ OK: a fokozat nem utazott a szobában, csak a régi rés-csúszka értéke;
   a karrier-indítás közös karrierben ebből számolta vissza a fokozatot.
   (Az osztály közös karrierben a szoba beállítása — a házigazda a szoba
   „közös osztály" csúszkáján választja, a draft után nincs külön kérdés.)

   Amit mér:
     1. a házigazda 5.1-et választ → a szobacsomag viszi (nf, s, tél,
        holtsáv), és a közös rés a fokozat rajt-réséből jön;
     2. a rés-csúszka ilyenkor csak kijelez (letiltva);
     3. a vendég átveszi, és a közös karrier indításakor a karrier fokozata
        5.1: S.pyr.nf, a célrés (+1,6), a hivatalos szint és a HUB-sáv is;
     4. RÉGI szoba (fokozat nélküli csomag): a régi út, a résből;
     5. 3.9.253: a HÁZIGAZDA útja — a közzétett csomagból indul (7.1), a
        vendéggel azonos fokozaton; üres csomag-fokozatnál a saját választása;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9464;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});


  const r=await p.evaluate(()=>{
    const ki={};
    const sq={club:"A drafton összeállított kereted",season:"",players:slots.filter(s=>s&&s.player).map(s=>s.player)};
    const e0={a:MP.active,r:MP.role};
    try{
      /* ---- a házigazda ---- */
      MP.active=true;MP.role="host";pyrWanted=true;pyrWantedDiv=3;pyrWantedSpeed="tarto";
      nfCsomagAlkalmaz(5,1);
      try{renderPyrMpAll();}catch(e){ki.renderHiba=String(e);}
      ki.csuszkaTiltva=!!($("pyrMpGap")&&$("pyrMpGap").disabled);
      const pk=mpCollectSettings();
      ki.csomag={nf:pk.pyr.nf,s:pk.pyr.s,tel:pk.pyr.tel,holt:pk.pyr.holt,gap:pk.pyr.gap,div:pk.pyr.div};
      ki.vartGap=Math.round(nfRajtCel(nfCel(5,1),pk.pyr.div,null,pk.pyr.speed)*100)/100;
      /* ---- a vendég ---- */
      MP.role="guest";
      mpApplySettings(JSON.parse(JSON.stringify(pk)));
      ki.atvett=_mpNfFok;
      pyrPickSq=sq;pyrPickDiv=3;pyrPendingDiv=3;pyrPendingSpeed="tarto";pyrPickFromDraft=true;
      const _sc=showChemistry;showChemistry=()=>{};
      try{pyrConfirmDiv();}finally{showChemistry=_sc;}
      ki.kar={nf:S.pyr.nf,nf0:S.pyr.nf0,cel:S.pyr.cel,fok:S.pyr.fok&&{nf:S.pyr.fok.nf,s:S.pyr.fok.s,mp:S.pyr.fok.mp},tel:S.pyr.tel,holt:S.pyr.holt};
      const h=nfKarrierHivatalos();ki.hiv=h&&{nf:h.nf,s:h.s};
      ki.sav=(nfHubSavHtml()||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
      ki.celFor=nfCelFor(pyrFloorUpcoming());
      /* ---- régi szoba: fokozat nélküli csomag ---- */
      const regi=JSON.parse(JSON.stringify(pk));delete regi.pyr.nf;delete regi.pyr.s;delete regi.pyr.tel;delete regi.pyr.holt;regi.pyr.gap=1.4;
      mpApplySettings(regi);
      ki.regiAtvett=_mpNfFok;
      pyrPickSq=sq;pyrPickDiv=3;pyrPendingDiv=3;pyrPendingSpeed="tarto";pyrPickGap=1.4;
      const _sc2=showChemistry;showChemistry=()=>{};
      try{pyrConfirmDiv();}finally{showChemistry=_sc2;}
      ki.regi={nf:S.pyr.nf,fok:!!S.pyr.fok,vart:nfNearest(nfCelFromRajt(1.4,3,"tarto")).nf};
    }finally{MP.active=e0.a;MP.role=e0.r;}
    return ki;});

  /* ---- 3.9.253: A HÁZIGAZDA ÚTJA (hagyományos indítás) ----
     BEJELENTÉS: „Hostként indítom a PvP hagyományos módot […] 7.1 […] 3.
     sima liba lesz a kezdő nehézség". A házigazda közzéteszi a csomagot, és
     a saját draftja végén indul — a csomagot sosem „veszi át". */
  const h=await p.evaluate(async()=>{
    const ki={};
    const sq={club:"A drafton összeállított kereted",season:"",players:slots.filter(s=>s&&s.player).map(s=>s.player)};
    const e0={a:MP.active,r:MP.role,room:MP.activeRoom,st:MP.started};
    const _bk=mpBk;
    try{
      MP.active=true;MP.role="host";MP.activeRoom="TESZT1";pyrWanted=true;pyrWantedDiv=3;pyrWantedSpeed="tarto";
      _mpNfFok=null;
      nfCsomagAlkalmaz(7,1);
      let kozzetett=null;
      mpBk=()=>({get:async()=>({seed:"proba-seed"}),publishStart:async(code,obj)=>{kozzetett=obj;}});
      ki.pub=await mpPublishStart();
      ki.csomagNf=kozzetett&&kozzetett.settings&&kozzetett.settings.pyr&&[kozzetett.settings.pyr.nf,kozzetett.settings.pyr.s];
      ki.hostFok=_mpNfFok;
      pyrPickSq=sq;pyrPickDiv=3;pyrPendingDiv=3;pyrPendingSpeed="tarto";pyrPickFromDraft=true;pyrPickGap=1.4;
      const _sc=showChemistry;showChemistry=()=>{};
      try{pyrConfirmDiv();}finally{showChemistry=_sc;}
      ki.kar={nf:S.pyr.nf,cel:S.pyr.cel,fok:S.pyr.fok&&{nf:S.pyr.fok.nf,s:S.pyr.fok.s,mp:S.pyr.fok.mp}};
      ki.vartCel=nfCel(7,1);
      ki.regiAg=nfNearest(nfCelFromRajt(1.4,3,"tarto")).nf;
      /* ugyanaz a csomag a vendégnél → ugyanaz a fokozat */
      MP.role="guest";_mpNfFok=null;
      mpApplySettings(JSON.parse(JSON.stringify(kozzetett.settings)));
      ki.vendegFok=_mpNfFok;
      /* tartalék: a házigazdánál üres csomag-fokozat (pl. újratöltés) → a saját választása */
      MP.role="host";_mpNfFok=null;nfCsomagAlkalmaz(7,1);
      pyrPickSq=sq;pyrPickDiv=3;pyrPendingDiv=3;pyrPendingSpeed="tarto";pyrPickFromDraft=true;pyrPickGap=1.4;
      const _sc2=showChemistry;showChemistry=()=>{};
      try{pyrConfirmDiv();}finally{showChemistry=_sc2;}
      ki.tartalek=S.pyr.nf;
    }finally{mpBk=_bk;MP.active=e0.a;MP.role=e0.r;MP.activeRoom=e0.room;MP.started=e0.st;}
    return ki;});
  ok(h.pub&&h.csomagNf&&h.csomagNf.join()==="7,1","a házigazda csomagja 7.1-et visz",h.csomagNf);
  ok(h.hostFok&&h.hostFok.nf===7&&h.hostFok.s===1,"a közzétételkor a házigazda is átveszi a saját csomagja fokozatát",h.hostFok);
  ok(h.kar.nf===7&&Math.abs(h.kar.cel-h.vartCel)<1e-9&&h.kar.fok&&h.kar.fok.nf===7&&h.kar.fok.s===1&&h.kar.fok.mp===1,
     "a házigazda karrierje 7.1-gyel indul — nem a résből visszaszámolt „"+"Simaliba”",{kar:h.kar,regiAg:h.regiAg});
  ok(h.regiAg!==7,"(a régi ág itt tényleg mást adott volna)",h.regiAg);
  ok(h.vendegFok&&h.vendegFok.nf===7&&h.vendegFok.s===1,"a vendég ugyanazt a fokozatot kapja",h.vendegFok);
  ok(h.tartalek===7,"üres csomag-fokozatnál a házigazda a saját választását használja, nem a rés-becslést",h.tartalek);
  ok(r.csomag.nf===5&&r.csomag.s===1&&r.csomag.tel&&r.csomag.holt&&Math.abs(r.csomag.gap-r.vartGap)<1e-9,
     "a házigazda 5.1-et választ: a szobacsomag viszi a fokozatot, és a közös rés a fokozat rajt-rése",{cs:r.csomag,vart:r.vartGap});
  ok(r.csuszkaTiltva&&!r.renderHiba,"a régi rés-csúszka ilyenkor csak kijelez (letiltva)",{t:r.csuszkaTiltva,h:r.renderHiba});
  ok(r.atvett&&r.atvett.nf===5&&r.atvett.s===1,"a vendég átveszi a szoba fokozatát",r.atvett);
  ok(r.kar.nf===5&&r.kar.nf0===5&&Math.abs(r.kar.cel-1.6)<1e-9&&r.kar.fok&&r.kar.fok.nf===5&&r.kar.fok.s===1&&r.kar.fok.mp===1,
     "a közös karrier fokozata 5.1 (célrés +1,6), a tél és a holtsáv a szobából",r.kar);
  ok(r.hiv&&r.hiv.nf===5&&r.hiv.s===1&&/5\.1/.test(r.sav)&&/Nehéz/.test(r.sav)&&/célrés \+1,6/.test(r.sav)&&!/Simaliba/.test(r.sav),
     "a HUB-sáv: „5.1 Nehéz · célrés +1,6”",{hiv:r.hiv,sav:r.sav});
  ok(Math.abs(r.celFor-1.6)<1e-9,"az idény célrése is a fokozaté",r.celFor);
  ok(r.regiAtvett===null&&r.regi.nf===r.regi.vart,"régi szoba (fokozat nélkül): a régi út, a résből",r.regi);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
