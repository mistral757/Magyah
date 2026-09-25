/* ⚖️ A PAPÍRFORMA ÉS AZ ÓRIÁSÖLÉS SKÁLÁJA (3.9.130).

   KIMONDOTT KÉRÉS: „Ezeknél a méréseknél a meccs erő és a nyers erő számtani
   közepéhez mérjük inkább az ellenfél erejét. És annak megfelelően legyen az
   óriásölés számítása is. És annak a skáláján változtassunk ennek fényében."

   A bejelentett képernyő: „Csapaterő: 164,7 — 191,6 · papíron 26,9-del
   gyengébb vagy" — miközben a meccs-erő 191 körül állt.

   Amit mér:
     1. a mérce a nyers csapaterő és a meccs-erő KÖZEPE;
     2. a kezdőrúgáskor BEFAGY: a lefújáskori állapot nem írja át;
     3. a 80-AS HORGONYON (3.9.140 óta) az óriásölés 5% = 4 pont; a
        morál-jutalom és a kínos-büntetés képlete ugyanazt adja;
     4. PÁRHARCBAN a társ is a saját középével szerepel;
     5. EGY VALÓDI KARRIER ELEJÉN (piramis, D3) mérve a régi és az új
        döntés közel azonos — ott a rejtett bónusz még kicsi;
     6. A KÉSŐI KARRIERBEN (+25 rejtett bónusz, a mezőny a meccs-erőhöz
        horgonyozva, mint a D0-ban) a RÉGI szabály szerint MINDEN ellenfél
        óriás volt (mérve: 15-ből 12) — az új szerint csak a kiugrók;
     7. a meccs előtti sor a középet írja ki, és kimondja az óriásölést;
     8. a mérföldkő az új, százalékos mezőbe ír (giantMaxPct), a régit nem
        piszkálja;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9113;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof paperRefNow==="function"&&typeof giantPct==="function"
      &&typeof paperOppOf==="function"&&typeof paperRefKickoff==="function"
      &&typeof MS_GIANT_PCT==="number",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a papírforma-mérce függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    const n1=x=>Math.round(x*10)/10;
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=3;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";
       try{drafted.add(pl.n);}catch(e){}});}
    /* VALÓSÁGHŰ FELÁLLÁS: a keret a saját posztjain, a játék saját kiosztási
       szabályával (arrangeSlotsFor). Enélkül a próba poszt-idegen tizenegyet
       mérne, ahol a kijelzett csapaterő 7-10 ponttal a csontváz-erő ALÁ esik —
       egy valódi karrierben ilyen nincs, és a régi-új összevetést elhamisítaná. */
    {const pool=sq.players.slice(0,18).map(x=>({n:x.n,ovr:x.ovr,pos:(x.pos||["KKP"]).slice(),age:26}));
     slots=arrangeSlotsFor(form,pool).slots;
     slots.forEach(sl=>{if(sl.player){sl.fit=fitFor(sl.player,sl);sl.origin="Teszt FC";
       try{drafted.add(sl.player.n);}catch(e){}}});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=70;
    try{buildSeasonFixtures();}catch(e){}

    /* ---- 1. A MÉRCE ---- */
    const raw=teamStrength(),ms=teamMatchStrength();
    ki.merce={raw:n1(raw),ms:n1(ms),ref:n1(paperRefNow()),kozep:n1((raw+ms)/2)};

    /* ---- 2. BEFAGY A KEZDŐRÚGÁSKOR ---- */
    paperRefKickoff();
    const r0=paperRef();
    const m0=S.morale;S.morale=5;            /* a meccs alatt összeomlik a morál */
    const rLive=paperRefNow();
    const rKick=paperRef();
    S.morale=m0;
    ki.befagy={kick:n1(r0),elo:n1(rLive),olvas:n1(rKick)};

    /* ---- 3. A 80-AS HORGONY: bitre a régi szabály ---- */
    /* 3.9.140: az óriásölés küszöbe a FELÉRE ment (10% → 5%), tehát a 80-as
       horgonyon 4 pont a régi 8 helyett — a „régi" szabály itt ezért a felezett
       pont-küszöb. A morál-jutalom képlete és a kínos eredmény (10 pont =
       12,5%) változatlan, azok BITRE a régiek maradnak. */
    {const regi=(gap)=>({giant:gap>=4,bonus:Math.min(18,Math.round(gap*1.3)),
        kinos:-gap>=10,pen:Math.min(14,Math.round(-gap*0.9))});
     const uj=(pct)=>({giant:pct>=MS_GIANT_PCT,bonus:Math.min(18,Math.round(pct*1.04)),
        kinos:-pct>=12.5,pen:Math.min(14,Math.round(-pct*0.72))});
     const elter=[];
     for(let gap=-20;gap<=20;gap+=0.5){
       const a=regi(gap),c=uj(giantPct(80+gap,80));
       if(a.giant!==c.giant||a.kinos!==c.kinos
          ||(a.giant&&a.bonus!==c.bonus)||(a.kinos&&a.pen!==c.pen))elter.push(gap);}
     ki.horgony={elter:elter,kuszob80:n1(giantNeedPts(80)),kuszob190:n1(giantNeedPts(190))};}

    /* ---- 4. PÁRHARC: a társ is a közepével ---- */
    ki.pvp={cpu:paperOppOf({n:"CPU",ovr:150}),
      tars:paperOppOf({n:"Társ",ovr:140,dispOvr:160,matchOvr:190,duel:true}),
      csakKijelzett:paperOppOf({n:"Kupa-társ",ovr:150,dispOvr:160})};

    /* ---- 5. A KARRIER ELEJE: régi és új döntés ----
       A mezőny a vállalt +2-es RÉSHEZ horgonyozva (nem a kezdő lépcső rögzített
       78-ához) — így az ellenfelek a kereted közelében állnak, és a mérésnek
       van tétje: a felső mezőny egy része mindkét szabály szerint óriás lehet. */
    try{delete S.pyr.fieldWant;S.pyr.gapWant=2;S.pyr.anchored=false;
        pyrAnchorAtKickoff();buildSeasonFixtures();}catch(e){ki.anchorHiba0=String(e);}
    const merj=(ref,base)=>{
      const ellen=(S.fixtures||[]).map(fx=>fx.o).filter(Boolean);
      const lat=new Set(),o=[];
      ellen.forEach(x=>{if(lat.has(x.n))return;lat.add(x.n);o.push(x);});
      let regiDb=0,ujDb=0;
      o.forEach(x=>{if(x.ovr-base>=8)regiDb++;if(giantPct(x.ovr,ref)>=MS_GIANT_PCT)ujDb++;});
      const ovrs=o.map(x=>x.ovr).sort((a,b)=>a-b);
      return {db:o.length,regi:regiDb,uj:ujDb,
        mezony:[n1(ovrs[0]),n1(ovrs[Math.floor(ovrs.length/2)]),n1(ovrs[ovrs.length-1])]};};
    ki.eleje=Object.assign({base:n1(teamOVRbase()),raw:n1(teamStrength()),
      ms:n1(teamMatchStrength()),ref:n1(paperRefNow())},
      merj(paperRefNow(),teamOVRbase()));

    /* ---- 6. A KÉSŐI KARRIER: +25 rejtett bónusz, a mezőny a meccs-erőhöz
       horgonyozva (ahogy a D0-tól minden szezonban) ---- */
    S.eventMod=(S.eventMod||0)+25;
    try{S.oppBuffH=null;}catch(e){}
    /* A FRISS PROFIL a kezdő lépcsőn áll, ahol a mezőny RÖGZÍTETT (fieldWant
       = 78) — a késői karrierben viszont a vállalt RÉS számít, ahhoz
       horgonyoz a D0-tól minden szezon. Ezt állítjuk be. */
    try{delete S.pyr.fieldWant;S.pyr.gapWant=2;S.pyr.anchored=false;
        pyrAnchorAtKickoff();}catch(e){ki.anchorHiba=String(e);}
    try{buildSeasonFixtures();}catch(e){}
    ki.keso=Object.assign({base:n1(teamOVRbase()),raw:n1(teamStrength()),
      ms:n1(teamMatchStrength()),ref:n1(paperRefNow()),gapWant:S.pyr.gapWant},
      merj(paperRefNow(),teamOVRbase()));

    /* ---- 7. A MECCS ELŐTTI SOR ---- */
    {const fx=S.fixtures[S.idx];
     const log=[];const orig=addLine;
     addLine=(h,c)=>{log.push(String(h));};
     try{
       /* a sor a kezdőrúgás előtti előnézetben születik — azt a részt
          hívjuk, ami a papírformát írja; a teljes előnézet függvényét
          név szerint keressük, hogy a próba ne törjön egy átnevezéstől */
       prepBriefing(fx);
     }catch(e){}
     addLine=orig;
     const sor=log.find(x=>x.indexOf("Papírforma")>=0)||null;
     ki.sor={van:!!sor,kozep:sor?sor.indexOf(String(n1(paperRefNow())).replace(".",","))>=0:false,
       szoveg:sor?sor.replace(/<[^>]+>/g,"").slice(0,220):null};}

    /* ---- 8. A MÉRFÖLDKŐ ---- */
    {const T=msT();T.giantMax=30;delete T.giantMaxPct;T.giantKills=0;
     msNoteGiantKill(MS_GIANT_PCT-0.1);const a=[T.giantKills,T.giantMaxPct||0];
     msNoteGiantKill(14.2);
     ki.ms={alatta:a,folotte:[T.giantKills,T.giantMaxPct],regiMarad:T.giantMax};
     /* 3.9.140: a régi lépcső-azonosítók (giantgap_12, _17) sorszám szerint
        az új értékekre költöznek — kétszer nem fizet */
     const M=msState();M.done.giantgap_12=3;M.done.giantgap_17=4;delete M.giantMig140;
     msState();
     ki.migr={uj6:M.done.giantgap_6,uj9:M.done.giantgap_9,regi12:M.done.giantgap_12,uj11:M.done.giantgap_11};}
    return ki;});

  console.log("\n— A MÉRCE —");
  ok(kozel(t.merce.ref,t.merce.kozep,0.05)&&t.merce.ms>=t.merce.raw,
     "a papírforma a nyers csapaterő és a meccs-erő KÖZEPE",t.merce);
  ok(kozel(t.befagy.olvas,t.befagy.kick,0.001)&&t.befagy.elo<t.befagy.kick,
     "a kezdőrúgáskor befagy — a meccs közbeni morál-zuhanás nem írja át",t.befagy);

  console.log("\n— A SKÁLA —");
  ok(t.horgony.elter.length===0,"a 80-as horgonyon: óriásölés 4 ponttól (a régi 8 fele, 3.9.140), a morál-képlet és a kínos eredmény bitre a régi (−20…+20, félpontonként)",t.horgony.elter);
  ok(kozel(t.horgony.kuszob80,4,0.01)&&kozel(t.horgony.kuszob190,9.5,0.01),
     "a küszöb a papírforma 5%-a: 80-on 4 pont, 190-en 9,5",[t.horgony.kuszob80,t.horgony.kuszob190]);

  console.log("\n— PÁRHARC —");
  ok(t.pvp.cpu===150&&t.pvp.tars===175&&t.pvp.csakKijelzett===150,
     "a CPU a tábla-Ratingjével, a társ a saját KÖZEPÉVEL (160 és 190 → 175)",t.pvp);

  console.log("\n— VALÓDI KARRIER —");
  ok(t.eleje.db>=10,"a karrier elején a teljes mezőny mérhető",t.eleje);
  ok(Math.abs(t.eleje.regi-t.eleje.uj)<=2,
     "a karrier ELEJÉN a régi és az új döntés közel azonos (kicsi a rejtett bónusz)",t.eleje);
  ok(t.keso.ms-t.keso.raw>=20,"a késői állapot: nagy rejtett bónusz",t.keso);
  /* MÉRVE (3.9.130): +28 rejtett bónusz mellett a régi szabály 15-ből 12
     ellenfelet tett óriássá, az új egyet sem. A bejelentett képernyőn
     (164,7 — 191,6, meccs-erő ~192) ugyanez: régi szerint óriás, új szerint
     7,4% — a küszöb 17,8 pont. */
  ok(t.keso.regi>=Math.ceil(t.keso.db*2/3),"…a RÉGI szabály szerint az ellenfelek zöme óriás",
     [t.keso.regi,t.keso.db]);
  ok(t.keso.uj<=Math.floor(t.keso.db/3),"…az ÚJ szerint legfeljebb a kiugrók",
     [t.keso.uj,t.keso.db,t.keso.mezony]);

  console.log("\n— A MECCS ELŐTTI SOR —");
  ok(t.sor.van&&t.sor.kozep,"a meccs előtti sor a KÖZEPET írja ki",t.sor.szoveg);

  console.log("\n— A MÉRFÖLDKŐ —");
  ok(t.ms.alatta[0]===0&&t.ms.alatta[1]===0,"a küszöb (5%) alatt nem számít óriásölésnek",t.ms.alatta);
  ok(t.ms.folotte[0]===1&&t.ms.folotte[1]===14.2,"fölötte az ÚJ, százalékos mezőbe ír",t.ms.folotte);
  ok(t.ms.regiMarad===30,"…a régi, pontos `giantMax`-hoz nem nyúl",t.ms.regiMarad);
  ok(t.migr.uj6===3&&t.migr.uj9===4&&t.migr.regi12===undefined&&t.migr.uj11===undefined,
     "a régi lépcsők (12%, 17%) sorszám szerint a 6%-ra és 9%-ra költöznek — kétszer nem fizetnek",t.migr);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
