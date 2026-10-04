/* 🌱 3.9.193 — AZ AKADÉMIAI ABLAKOK ÉS A GARANTÁLT VISSZATÉRÉS.

   BEJELENTÉS: „eléggé az idény vége felé dobálja mostanában az ifiakadémia
   jelöltjeit, és az is előfordul, hogy valakit szezonokon keresztül az
   akadémián tart, akit egyszer odaküldtem. Szerintem itt van valami számítási
   elcsúszás."

   Amit mér (a valódi tryAcademyOpportunity, végigjátszás-módban):
     1. KUPÁBAN NINCS ABLAK: euroFrozen alatt (kupa, nyári torna, osztályozó)
        semmi nem jön — a „Nyitott kapu" talizmánnal a 30. fordulón sem;
        egy fordulóhoz legfeljebb egy ablak;
     2. A GARANTÁLT VISSZATÉRÉS: három visszaküldött tehetség egy idény alatt
        mind pontosan egyszer jelentkezik, KÜLÖNBÖZŐ fordulókban; a
        beosztás a hátralévő ablakokra esik;
     3. TELE KERET: a beosztott visszatérés nem vész el, a következő
        ablakban jön;
     4. 200 IDÉNY: az új felfedezések fordulónkénti eloszlása egyenletes
        (nincs késői torlódás), a „Zsákbamacska" kihagyása is egyenletes, és
        idényenként pontosan egy;
     5. A PANEL: a beosztott forduló kiírva; a hátralévő ablakok száma
        pontos (a 0. és a már lezajlott ablak nem számít);
     6. verzió, nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9236;
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
  await p.waitForFunction(()=>typeof acadPlanReturns==="function",null,{timeout:15000});

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
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    tiszta();


    window.saveGame=()=>{};
    const _al=addLine;window.addLine=()=>{};
    const mkProspect=(n,age)=>{const p=generateAcademyPlayer();const e=careerPool[p.n];
      e.age=age;return p;};
    const ablakok=()=>{const o=[];for(let i=1;i<=30;i++)o.push(i);return o;};
    /* egy idény lejátszása: minden bajnoki forduló utáni lánc-hívás */
    const idenyFut=(sz,opt)=>{opt=opt||{};
      S.seasonNumber=sz;const ki=[];
      for(const i of ablakok()){
        S.idx=i;
        const er=extraRoster.slice(),ac=(S.academy||[]).map(r=>r.n);
        tryAcademyOpportunity(()=>{});
        const uj=extraRoster.filter(p=>!er.includes(p));
        uj.forEach(p=>ki.push({idx:i,n:p.n,vissza:ac.includes(p.n)}));
        if(opt.utan)opt.utan(i);
        /* a keret ne teljen meg: az új felfedezést azonnal elengedjük */
        if(!opt.tele)extraRoster=extraRoster.filter(p=>!uj.includes(p)||ac.includes(p.n)?!uj.includes(p):false);}
      return ki;};
    S.auto=true;S.frozenAcademySeasons=0;S.acadAblak=null;
    const _tm=tempoMult;window.tempoMult=()=>1;
    /* ---- 1. KUPÁBAN NINCS ABLAK ---- */
    {const _ef=euroFrozen,_kp=talAkadKapuP;
     window.euroFrozen=()=>true;window.talAkadKapuP=()=>1;
     S.idx=8;S.acadAblak=null;const er=extraRoster.length;
     tryAcademyOpportunity(()=>{});ki.kupa={uj:extraRoster.length-er,ablak:S.acadAblak};
     window.euroFrozen=_ef;
     S.idx=30;S.acadAblak=null;S.seasonNumber=5;const er2=extraRoster.length;
     tryAcademyOpportunity(()=>{});const elso=extraRoster.length-er2;
     const er3=extraRoster.length;tryAcademyOpportunity(()=>{});tryAcademyOpportunity(()=>{});
     ki.kapu30={elso,tobb:extraRoster.length-er3};
     window.talAkadKapuP=_kp;extraRoster=[];}
    /* ---- 2. A GARANTÁLT VISSZATÉRÉS ---- */
    S.academy=[];
    const kept=[mkProspect(0,16),mkProspect(0,17),mkProspect(0,18)];
    S.seasonNumber=6;kept.forEach(p=>academyKeep(p,null));   /* a 6. idényben mutatkoztak be */
    extraRoster=[];S.acadAblak=null;
    const s7=idenyFut(7);
    const vissza7=s7.filter(x=>x.vissza);
    ki.vissza={db:vissza7.length,kulon:new Set(vissza7.map(x=>x.idx)).size,nevek:new Set(vissza7.map(x=>x.n)).size,
      idx:vissza7.map(x=>x.idx),ujDb:s7.filter(x=>!x.vissza).length};
    /* visszaküldjük őket (a következő idényben megint jönnek) */
    vissza7.forEach(x=>{const r=S.academy.find(q=>q.n===x.n);});
    /* ---- 3. TELE KERET ---- */
    {S.academy=[];extraRoster=[];
     const p=mkProspect(0,17);S.seasonNumber=8;academyKeep(p,null);
     S.seasonNumber=9;S.acadAblak=null;S.idx=4;acadPlanReturns(4);
     const r=S.academy[0];r.planIdx=4;
     /* tele keret: dummy tartalékokkal a sapkáig */
     let d=0;while(fullCareerRoster().length<MAX_CAREER_ROSTER)extraRoster.push({n:"Töltelék "+(d++),ovr:60,pos:["KV"],age:25});
     S.idx=4;tryAcademyOpportunity(()=>{});
     const utana={off:r.offerSeason,bent:S.academy.some(q=>q.n===p.n),nemJott:!extraRoster.some(q=>q.n===p.n)};
     extraRoster=extraRoster.filter(q=>!/^Töltelék /.test(q.n));
     S.idx=8;tryAcademyOpportunity(()=>{});
     ki.tele={utana,kovetkezo:extraRoster.some(q=>q.n===p.n),off:r.offerSeason};}
    /* ---- 4. 200 IDÉNY ---- */
    {S.academy=[];extraRoster=[];
     const hist={};let osszes=0;
     for(let sz=100;sz<300;sz++){
       S.acadAblak=null;
       const k=idenyFut(sz);k.forEach(x=>{hist[x.idx]=(hist[x.idx]||0)+1;osszes++;});
       extraRoster=[];}
     ki.eloszlas={hist,osszes};
     /* Zsákbamacska: idényenként 1 kihagyás */
     const _m=talAkadMinusz;window.talAkadMinusz=()=>1;
     const kih={};let idenyKih=[];
     for(let sz=300;sz<500;sz++){
       S.acadAblak=null;let db=0;
       for(const i of ablakok()){S.idx=i;const er=extraRoster.length;
         const A=talSpAll();const elotte=A.akadMin&&A.akadMin.sz===sz?A.akadMin.db:0;
         S.seasonNumber=sz;tryAcademyOpportunity(()=>{});
         const most=(A.akadMin&&A.akadMin.sz===sz)?A.akadMin.db:0;
         if(most>elotte){kih[i]=(kih[i]||0)+1;db++;}
         extraRoster=[];}
       idenyKih.push(db);}
     window.talAkadMinusz=_m;
     ki.zsak={kih,egy:idenyKih.every(x=>x===1)};}
    /* ---- 5. A PANEL ---- */
    {S.academy=[];const p=mkProspect(0,17);S.seasonNumber=10;academyKeep(p,null);
     S.seasonNumber=11;S.idx=4;S.acadAblak=null;acadPlanReturns(5);
     const r=S.academy[0];const e=careerPool[r.n];
     ki.panel={szoveg:acadVisszaterVarhato(r,e).sz,plan:r.planIdx};
     S.idx=0;const h0=acadAblakHatra();S.idx=4;const h4=acadAblakHatra();S.idx=28;const h28=acadAblakHatra();
     ki.hatra=[h0,h4,h28];}
    window.tempoMult=_tm;window.addLine=_al;S.auto=false;
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. KUPÁBAN NINCS ABLAK —");
  ok(r.kupa.uj===0&&!r.kupa.ablak,"kupa / nyári torna / osztályozó alatt nem jön ajánlat",r.kupa);
  ok(r.kapu30.elso===1&&r.kapu30.tobb===0,"egy fordulóhoz legfeljebb egy ablak (a talizmánnal is)",r.kapu30);
  console.log("\n— 2. A GARANTÁLT VISSZATÉRÉS —");
  ok(r.vissza.db===3&&r.vissza.nevek===3,"mindhárom visszaküldött tehetség pontosan egyszer jelentkezik az idényben",r.vissza);
  ok(r.vissza.kulon===3,"különböző fordulókban",r.vissza.idx);
  ok(r.vissza.idx.every(i=>i%4===0&&i>=4&&i<=28),"csak bajnoki akadémiai ablakban (4…28)",r.vissza.idx);
  console.log("\n— 3. TELE KERET —");
  ok(r.tele.utana.bent&&r.tele.utana.nemJott&&r.tele.utana.off!==9&&r.tele.kovetkezo,"tele keretnél nem vész el: a következő ablakban jön",r.tele);
  console.log("\n— 4. 200 IDÉNY —");
  const h=r.eloszlas.hist,ws=[4,8,12,16,20,24,28],atl=r.eloszlas.osszes/ws.length;
  ok(ws.every(i=>Math.abs((h[i]||0)-atl)<atl*0.12)&&Object.keys(h).every(k=>ws.includes(+k)),"az ajánlatok egyenletesen oszlanak a 7 ablak között",h);
  const kk=r.zsak.kih,ka=200/7;
  ok(r.zsak.egy,"Zsákbamacska: idényenként pontosan egy kihagyás",kk);
  ok(ws.every(i=>(kk[i]||0)>ka*0.55&&(kk[i]||0)<ka*1.45),"…egyenletesen az ablakok között (nem az elején)",kk);
  console.log("\n— 5. A PANEL —");
  ok(new RegExp("idén a "+r.panel.plan+"\\. forduló után garantáltan").test(r.panel.szoveg),"a beosztott forduló kiírva",r.panel);
  ok(JSON.stringify(r.hatra)==="[7,6,0]","a hátralévő ablakok száma pontos",r.hatra);
  ok(String(r.verzio).localeCompare("3.9.193",undefined,{numeric:true})>=0,"verzió legalább 3.9.193",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
