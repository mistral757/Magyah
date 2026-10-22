/* 🏟️ 3.9.264 — STADION + MERCH/PR.

   KÉRÉS: stadion (bővíthető, fenntartási költséggel, legfeljebb 120 ezer
   férőhely), a nézőszám a formától és az új szurkolóktól függ; mellette a
   merch és PR részleg a TELJES táborból hoz bevételt, az új szurkolók
   tagdíjat fizetnek. Első idénytől fejleszthető, nagyjából a régi bevételi
   ütemmel (de dolgozni kell érte), és eleinte sokkal olcsóbb, mint egy boost.

   Amit mér:
     1. átállás: futó karrierben a stadion a táborhoz épül, új karrierben kicsi;
     2. a férőhely legfeljebb 120 ezer, a tetején nincs tovább;
     3. a kereslet: győzelmek + új szurkolók → tele; vereségek, új nélkül → kevés;
        a néző sosem több a férőhelynél;
     4. kalibráció a régi bevételhez: korán ~90–100%, középen ~100–120%, a
        700 ezres táborral kiépítve ~60–80%;
     5. az árak korán könnyűek (stadion < 25%, merch < 5% egy ifi-boostnak);
     6. a fejlesztés fizet, növel, könyvel; a meccs-tick jegyre, merchre,
        tagdíjra és fenntartásra bontva könyvel; zárt kapunál nincs bevétel;
     7. a HUB-doboz kirajzolódik, a gomb működik;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9264;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    window._eredetiMentes=window._eredetiMentes||saveGame;   /* a 12. pont a valódit hívja */
    window.saveGame=()=>{};
    const _tm=window.fanTicketMult,_fm=window.fanMult;
    window.fanTicketMult=()=>1;window.fanMult=()=>1;
    /* 1. átállás */
    S.stadion=null;S.fanBase=700000;ki.atallNagy=JSON.parse(JSON.stringify(stadionState()));
    S.stadion=null;S.fanBase=8000;ki.atallKicsi=JSON.parse(JSON.stringify(stadionState()));
    /* 2. plafon */
    ki.max=STAD_KAP[STAD_KAP.length-1];
    S.stadion.kap=STAD_KAP.length-1;ki.maxAr=stadionKovAr();S.transferBudget=1e12;ki.maxBovit=stadionBovit();
    /* 3. kereslet */
    const T=stadionState();
    S.fanBase=100000;T.kap=STAD_KAP.length-1;
    T.forma=[3,3,3,3,3];T.uj=[2000,2000,2000,2000,2000];ki.jo={a:stadionKeresletArany(),n:stadionNezo()};
    T.forma=[0,0,0,0,0];T.uj=[0,0,0,0,0];ki.rossz={a:stadionKeresletArany(),n:stadionNezo()};
    T.kap=2;T.forma=[3,3,3,3,3];T.uj=[2000,2000,2000,2000,2000];ki.korlat={n:stadionNezo(),kap:stadionKap()};
    /* 4. kalibráció (közepes forma: 2 győzelem, 2 döntetlen, 1 vereség, mérsékelt beáramlás) */
    const kozep=()=>{T.forma=[3,1,3,1,0];T.uj=[1,1,1,1,1].map(()=>Math.round(fanBase()*0.004));};
    const arany=(fb,kap,m)=>{S.fanBase=fb;T.kap=STAD_KAP.indexOf(kap);T.merch=m;kozep();
      const regi=fb*FAN_TICKET;return Math.round((fanWeeklyIncome()-stadionFenntartas())/regi*100)/100;};
    ki.kal={korai:arany(8000,5000,0),kozep:arany(60000,35000,4),kesoi:arany(700000,120000,8)};
    /* 5. árak korán */
    window.fanTicketMult=_tm;window.fanMult=_fm;
    S.fanBase=8000;T.kap=1;T.merch=0;
    ki.arak={stadion:stadionKovAr(),merch:merchKovAr(),boost:boostUnitPrice()};
    /* 6. fejlesztés + könyvelés */
    S.transferBudget=1e9;const k0=T.kap,m0=T.merch;
    ki.bovit=stadionBovit();ki.fejl=merchFejleszt();ki.lep={kap:[k0,T.kap],merch:[m0,T.merch]};
    S.ledger={v:LEDGER_V,rows:{}};
    try{fanMatchTick({win:true,exc:60});}catch(e){ki.tickHiba=String(e);}
    const c1=JSON.parse(JSON.stringify((ledgerSum(S.seasonNumber||1).row||{}).cats||{}));
    ki.konyv=c1;
    S.ledger={v:LEDGER_V,rows:{}};
    try{fanMatchTick({loss:true,zart:true});}catch(e){ki.tickHiba2=String(e);}
    ki.zart=JSON.parse(JSON.stringify((ledgerSum(S.seasonNumber||1).row||{}).cats||{}));
    ki.kat=["stadion","fenntartas","merchFejl","merch","tagdij"].every(k=>!!LEDGER_CATS[k]);
    /* 7. HUB-doboz */
    const w=document.createElement("div");w.innerHTML=stadionBoxHtml();document.body.appendChild(w);
    ki.doboz=/Stadion/.test(w.textContent)&&/Merch és PR/.test(w.textContent)&&!!w.querySelector("#stadionBovitBtn")&&!!w.querySelector("#merchFejlBtn");
    const k1=T.kap;try{stadionBind();w.querySelector("#stadionBovitBtn").click();}catch(e){ki.gombHiba=String(e);}
    ki.gomb=T.kap===k1+1;w.remove();
    /* 8. a HUB menüje: saját kártya, saját ablak (3.9.264, a felhasználó nem találta) */
    try{renderHub();}catch(e){ki.hubHiba=String(e);}
    const hb=document.getElementById("hubStadionBtn");
    ki.kartya={van:!!hb,rejtett:!!(hb&&hb.classList.contains("hide")),ds:(document.getElementById("hubStadionDs")||{}).textContent||""};
    S.transferBudget=1e12;
    try{hb.click();}catch(e){ki.nyitHiba=String(e);}
    ki.ablak={cim:(document.getElementById("twTitle")||{}).textContent||"",gomb:!!document.getElementById("twstadionBovitBtn")};
    const kk=stadionState().kap;
    try{document.getElementById("twstadionBovitBtn").click();}catch(e){ki.ablakGombHiba=String(e);}
    ki.ablakBovit=stadionState().kap===kk+1&&!!document.getElementById("twstadionBovitBtn");
    /* 9. 🔔 3.9.265 — emlékeztetők: a vezetés témái és a felugró push */
    {const T9=stadionState();
     try{teachStateObj().mode="on";}catch(e){}
     const esed=()=>{let l=[];try{l=teachDueList(null);}catch(e){l=[];}return {st:l.indexOf("stadion:bovit")>=0,me:l.indexOf("merch:fejleszt")>=0};};
     /* kint maradnak és van pénz → mindkettő */
     S.fanBase=100000;T9.kap=3;T9.merch=2;T9.forma=[3,3,3,3,3];T9.uj=[2000,2000,2000,2000,2000];S.transferBudget=1e12;
     ki.em={mind:esed()};
     /* van hely (nincs kint senki) → stadion nem, merch igen */
     T9.kap=STAD_KAP.length-1;S.fanBase=50000;ki.em.vanHely=esed();
     /* nincs pénz → egyik sem */
     T9.kap=3;S.fanBase=100000;S.transferBudget=0;ki.em.nincsPenz=esed();
     /* a felugró emlékeztető: 8 forduló esedékesség után a „reg" sorban */
     S.transferBudget=1e12;
     ki.em.pushTip=[VEZ_PUSH["stadion:bovit"],VEZ_PUSH["merch:fejleszt"]];
     const _now=window.teachNow;let t0=1000;window.teachNow=()=>t0;
     /* forduló közben, nem a kezdőrúgás előtt: a „meccs" és a „szezon" témák
        itt nem versenyeznek a két helyért, csak a „reg" sor */
     S.idx=10;
     /* 3.9.277: a TÖBBI „reg" téma a mérés idejére nem esedékes. Enélkül a
        próba véletlenen múlt: ha épp a talizmán-húzás (prio 30) vagy más,
        magasabb rangú téma is esedékes volt, kiszorította a két helyről a
        stadiont — a teszt hol átment, hol nem (mérve). */
     const _dueMent={};
     Object.keys(VEZ_PUSH).forEach(k=>{if(VEZ_PUSH[k]==="reg"&&k!=="stadion:bovit"&&k!=="merch:fejleszt"&&TEACH_TOPICS[k]){
       _dueMent[k]=TEACH_TOPICS[k].due;TEACH_TOPICS[k].due=()=>false;}});
     try{vezPushJelolt(null);t0+=VEZ_PUSH_REG_KORAN;ki.em.push=vezPushJelolt(null);}catch(e){ki.em.pushHiba=String(e);}
     Object.keys(_dueMent).forEach(k=>{TEACH_TOPICS[k].due=_dueMent[k];});
     window.teachNow=_now;
     ki.em.horgony=TEACH_TOPICS["stadion:bovit"].a==="hubStadionBtn"&&TEACH_TOPICS["merch:fejleszt"].a==="hubStadionBtn";}
    /* 10. 💸 3.9.277 — az első idények ára: ötöd, harmad, fél, aztán a régi */
    {const T=stadionState();T.kap=8;T.merch=4;S.fanBase=700000;
     const sn0=S.seasonNumber,_sz=stadionIdenySzorzo;
     ki.idenyAr=[1,2,3,4,5].map(n=>{S.seasonNumber=n;
       const uj=[stadionKovAr(),merchKovAr()];
       stadionIdenySzorzo=()=>1;const regi=[stadionKovAr(),merchKovAr()];stadionIdenySzorzo=_sz;
       return {n,uj,regi,sz:Math.round(_sz()*1000)/1000,st:Math.round(uj[0]/regi[0]*100)/100,me:Math.round(uj[1]/regi[1]*100)/100};});
     S.seasonNumber=sn0;}
    /* 11. 🏟️ 3.9.280 — a hazai nézőszám: napló, a lap alja, a cikk */
    {const T=stadionState();T.hazai=[];T.rekord=0;T.hazaiKap=null;T.voltTelt=0;T.teltSor=0;T.kap=3;
     const kap0=STAD_KAP[3];
     const meccs=(nezo,o)=>{T.utolso={nezo};const E=stadionNezoJegyez(T,Object.assign({home:true},o||{}));return E?Object.assign({},E):null;};
     const L=[];
     L.push(meccs(8000));                 /* 0: az első — nem csúcs */
     L.push(meccs(9000));                 /* 1: csúcs (8000) */
     L.push(meccs(kap0));                 /* 2: első telt ház (+csúcs) */
     L.push(meccs(5000,{home:false}));    /* 3: idegenben — nincs */
     L.push(meccs(kap0));                 /* 4: telt ház, 2. sorban */
     L.push(meccs(kap0));                 /* 5: 3. sorban */
     T.kap=4;
     L.push(meccs(13000));                /* 6: a bővített stadion első meccse (+csúcs) */
     L.push(meccs(7000));                 /* 7: fogyás az átlaghoz képest */
     L.push(meccs(0,{zart:true}));        /* 8: zárt kapu */
     ki.nz=L.map(E=>E&&{z:E.zart||0,r:E.rekord,t:E.telt,te:E.teltElso,ts:E.teltSor,b:E.bovult,a:E.atlag,n:E.nezo});
     ki.nzKap0=kap0;
     /* a mérleg egyszer olvassa ki */
     T.nezoEsemeny={nezo:9000,kap:kap0,atlag:8000,telt:0,rekord:8000,teltElso:0,teltSor:0,bovult:null};
     const V={txt:"x"};try{mVerdictEnrich(V,{last:{players:[]},M:{},gf:2,ga:1});}catch(e){}
     ki.nzOlvas={v:!!V.nezo,ures:T.nezoEsemeny===null};
     /* a lap alja */
     ki.nzHtml=[mVerdictNezoHtml({nezo:L[2]}),mVerdictNezoHtml({nezo:L[6]}),mVerdictNezoHtml({nezo:L[7]}),mVerdictNezoHtml({nezo:L[8]}),mVerdictNezoHtml({})].map(h=>String(h).replace(/<[^>]+>/g,""));
     /* a cikk reagál */
     const cikk=E=>{let C=[];try{C=pressStoryCands({nezo:E},{gf:2,ga:1,home:true});}catch(e){return {hiba:String(e)};}
       const nz=C.filter(x=>/^nz/.test(x.key));
       return nz.map(x=>({k:x.key,t:(PRESS_ST[x.key]||[]).map(f=>f(x.c))}));};
     ki.nzCikk={rek:cikk(L[1]),telt:cikk(L[2]),sor:cikk(L[5]),bov:cikk(L[6]),fogy:cikk(L[7]),zart:cikk(L[8])};
     ki.nzRovat=pressRovatCim("nzRekord");}
    /* 12. 💾 3.9.281 — JAVÍTÁS: a stadion (és a kinézet karrier-rétege) a mentésben */
    {const T=stadionState();T.kap=6;T.merch=5;T.rekord=33333;
     S.faceMod={"Teszt Elek":{haj:3}};
     let hibaM=null;try{_eredetiMentes();}catch(e){hibaM=String(e);}
     const d=loadSavedGame();
     ki.mentes={hiba:hibaM,van:!!d,st:d&&d.S&&d.S.stadion,fm:d&&d.S&&d.S.faceMod};
     /* a betöltés: Object.assign(S,d.S) — a stadion nem épül újra a táborból */
     if(d&&d.S){delete S.stadion;delete S.faceMod;Object.assign(S,JSON.parse(JSON.stringify({stadion:d.S.stadion,faceMod:d.S.faceMod})));
       const T2=stadionState();ki.vissza={kap:T2.kap,merch:T2.merch,rek:T2.rekord,fm:faceTraits({n:"Teszt Elek",nat:"",age:26}).haj};}
     S.faceMod=null;}
    ki.verzio=APP_VERSION;
    return ki;});
  await p.screenshot({path:process.env.KEP||"/dev/null",fullPage:false}).catch(()=>{});
  console.log("=== 10. az első idények ára (3.9.277) ===");
  {const v=r.idenyAr||[];const varj=[0.2,0.33,0.5,1,1];
   /* az ár 100-ra kerekül, és legalább 100 — kis árnál ez a lépés látszik */
   ok(v.length===5&&v.every((x,i)=>Math.abs(x.sz-varj[i])<0.01&&[0,1].every(j=>Math.abs(x.uj[j]-Math.max(100,x.regi[j]*x.sz))<=100)),
     "stadion és merch: 1. idény ötöd, 2. harmad, 3. fél, 4-től a régi ár",v);}
  console.log("=== 11. a hazai nézőszám (3.9.280) ===");
  {const z=r.nz||[],K=r.nzKap0;
   ok(z[0]&&z[0].r===null&&!z[0].t&&z[0].n===8000,"az első hazai meccs: nézőszám, de még nem „csúcs”",z[0]);
   ok(z[1]&&z[1].r===8000,"új nézőcsúcs (az előző csúccsal)",z[1]);
   ok(z[2]&&z[2].t===1&&z[2].te===1&&z[2].r===9000,"az első telt ház (és csúcs)",z[2]);
   ok(z[3]===null,"idegenben nincs nézőszám a lapon",z[3]);
   ok(z[4]&&z[4].t&&!z[4].te&&z[4].ts===2&&z[4].r===null&&z[5].ts===3,"telt ház-sorozat számolva, az egyenlő nem csúcs",[z[4],z[5]]);
   ok(z[6]&&z[6].b===K&&z[6].r===K,"a bővített stadion első meccse (a régi férőhellyel)",z[6]);
   ok(z[7]&&z[7].a>0&&z[7].n<z[7].a*0.8&&z[7].r===null,"fogyás az utóbbi hazai meccsek átlagához képest",z[7]);
   ok(z[8]&&z[8].z===1,"zárt kapu",z[8]);}
  ok(r.nzOlvas&&r.nzOlvas.v&&r.nzOlvas.ures,"a mérleg egyszer olvassa ki (utána elfogy)",r.nzOlvas);
  {const h=r.nzHtml||[];
   ok(/Nézőszám: .*\/.*férőhely/.test(h[0])&&/TELT HÁZ/.test(h[0])&&/új nézőcsúcs/.test(h[0]),"a lap alja: nézőszám / férőhely, telt ház, csúcs",h[0]);
   ok(/bővített stadion első meccse/.test(h[1])&&/jóval kevesebben/.test(h[2])&&/Zárt kapus/.test(h[3])&&h[4]==="","bővítés, fogyás, zárt kapu; idegenben üres",h.slice(1));}
  {const C=r.nzCikk||{};const k=x=>(x||[]).map(y=>y.k);
   const mind=[].concat(...Object.values(C).filter(Array.isArray).map(a=>[].concat(...a.map(y=>y.t))));
   ok(k(C.rek).includes("nzRekord")&&k(C.telt).includes("nzTelt")&&k(C.sor).includes("nzTeltSor")&&k(C.bov).includes("nzBovit")&&k(C.fogy).includes("nzFogy")&&!k(C.zart).length,
     "a cikk reagál: csúcs, első telt ház, telt ház-sorozat, bővítés, fogyás (zárt kapunál nem)",Object.fromEntries(Object.entries(C).map(([a,b])=>[a,k(b)])));
   ok(mind.length>=12&&mind.every(t=>t&&!/undefined|NaN|null/.test(t)),"minden lelátó-cím kitöltött",mind.slice(0,4));
   ok(r.nzRovat==="Lelátói hangok","a rovat: Lelátói hangok",r.nzRovat);}
  console.log("=== 12. a mentés (3.9.281) ===");
  ok(r.mentes&&!r.mentes.hiba&&r.mentes.van&&r.mentes.st&&r.mentes.st.kap===6&&r.mentes.st.merch===5&&r.mentes.fm&&r.mentes.fm["Teszt Elek"],
    "a stadion (férőhely, merch-szint) és a kinézet karrier-rétege a mentésbe kerül",r.mentes);
  ok(r.vissza&&r.vissza.kap===6&&r.vissza.merch===5&&r.vissza.rek===33333&&r.vissza.fm===3,"betöltés után ugyanaz (nem épül újra a táborból)",r.vissza);
  console.log("=== 1. átállás ===");
  ok(r.atallNagy.kap===11&&r.atallNagy.merch===3,"700 ezres tábornál: a legnagyobb (120 ezres) stadion és 3. merch-szint",r.atallNagy);
  ok(r.atallKicsi.kap===1&&r.atallKicsi.merch===0,"új karrier (8 ezres tábor): 5 ezres stadion, 0. merch-szint",r.atallKicsi);
  console.log("=== 2. plafon ===");
  ok(r.max===120000&&r.maxAr===null&&r.maxBovit===false,"legfeljebb 120 ezer férőhely, a tetején nincs tovább",{max:r.max,ar:r.maxAr});
  console.log("=== 3. kereslet ===");
  ok(r.jo.a===1&&r.jo.n===100000,"5 győzelem + sok új szurkoló: a teljes tábor jönne (tele a stadion)",r.jo);
  ok(r.rossz.a<=0.31&&r.rossz.n<=31000,"5 vereség, új szurkoló nélkül: a tábornak csak ~30%-a",r.rossz);
  ok(r.korlat.n===r.korlat.kap,"a néző sosem több a férőhelynél",r.korlat);
  console.log("=== 4. kalibráció a régihez ===");
  ok(r.kal.korai>=0.85&&r.kal.korai<=1.05,"korán (8 ezres tábor, 5 ezres stadion, merch 0): ~90–100%",r.kal.korai);
  ok(r.kal.kozep>=0.95&&r.kal.kozep<=1.25,"középen (60 ezer, 35 ezres stadion, merch 4): ~100–120%",r.kal.kozep);
  ok(r.kal.kesoi>=0.55&&r.kal.kesoi<=0.8,"700 ezres tábor, kiépítve (120 ezer, merch 8): ~60–80% — „pozitív, de ne ennyire”",r.kal.kesoi);
  console.log("=== 5. árak korán ===");
  ok(r.arak.stadion<0.25*r.arak.boost&&r.arak.merch<0.05*r.arak.boost,"a stadion < 25%, a merch < 5% egy ifi-boostnak",r.arak);
  console.log("=== 6. fejlesztés és könyvelés ===");
  ok(r.bovit&&r.fejl&&r.lep.kap[1]===r.lep.kap[0]+1&&r.lep.merch[1]===r.lep.merch[0]+1,"a bővítés és a fejlesztés fizet és növel",r.lep);
  ok(!r.tickHiba&&r.konyv.fans>0&&r.konyv.merch>0&&r.konyv.fenntartas>0,"a meccs-tick jegyre, merchre és fenntartásra bontva könyvel",r.konyv);
  ok(!r.tickHiba2&&!(r.zart.fans>0)&&!(r.zart.merch>0)&&r.zart.fenntartas>0,"zárt kapunál nincs bevétel, a fenntartás marad",r.zart);
  ok(r.kat,"az öt új könyvelési kategória megvan");
  console.log("=== 7. HUB ===");
  ok(r.doboz&&r.gomb&&!r.gombHiba,"a doboz kirajzolódik, a bővítés gombja működik",{doboz:r.doboz,gomb:r.gomb,h:r.gombHiba});
  console.log("=== 8. a HUB menüje ===");
  ok(r.kartya.van&&!r.kartya.rejtett&&/férőhely/.test(r.kartya.ds),"a Csapatépítés menüben ott a „🏟️ Stadion, merch és PR” kártya, élő alsorral",r.kartya);
  ok(/Stadion, merch és PR/.test(r.ablak.cim)&&r.ablak.gomb&&!r.nyitHiba,"a kártya megnyitja a saját ablakát",r.ablak);
  ok(r.ablakBovit&&!r.ablakGombHiba,"az ablakban a bővítés működik, és az ablak frissül",{ok:r.ablakBovit,h:r.ablakGombHiba});
  console.log("=== 9. emlékeztetők (3.9.265) ===");
  ok(r.em.mind.st&&r.em.mind.me,"kint maradnak a szurkolók és van pénz: mindkét téma esedékes",r.em.mind);
  ok(!r.em.vanHely.st&&r.em.vanHely.me,"ha van szabad hely, a stadion nem szól (a merch igen)",r.em.vanHely);
  ok(!r.em.nincsPenz.st&&!r.em.nincsPenz.me,"pénz nélkül egyik sem szól",r.em.nincsPenz);
  ok(r.em.pushTip.join()==="reg,reg"&&!r.em.pushHiba&&(r.em.push||[]).some(k=>k==="stadion:bovit"||k==="merch:fejleszt"),"8 forduló után a „Rég nem foglalkoztál vele” felugró emlékeztetőben is ott vannak",{tip:r.em.pushTip,push:r.em.push,h:r.em.pushHiba});
  ok(r.em.horgony,"a „Mutasd” a HUB „🏟️ Stadion, merch és PR” kártyájára visz");
  ok(String(r.verzio).localeCompare("3.9.265",undefined,{numeric:true})>=0,"verzió legalább 3.9.265",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
