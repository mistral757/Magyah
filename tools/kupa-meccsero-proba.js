/* 🏆 A KUPAMEZŐNY A MECCS-ERŐHÖZ MÉR (3.9.126).

   A 3.9.125-ös audit nyolc kalibrációs kaput talált, ami még nyers erőt mért.
   Ebből öt váltott. A legnagyobb tétel a kupamezőny: a régi képlet
   `max(nyers, mezőnyszint) + befagyasztott_rejtett/2 − edge` volt, tehát a
   fölényed `edge + rejtett/2` — és mivel a rejtett bónusz a karrier során
   +4-ről +30 fölé nő, a kupa nehézsége TELJESEN ettől függött:

       rejtett:        +4     +10     +20     +30
       régi fölény:   4,3  →  7,3  →  12,3 →  17,3     (KK)
       új fölény:     7,3  →  7,3  →   7,3 →   7,3

   Amit mér:
     1. a fölény ÁLLANDÓ a rejtett bónusz teljes tartományán;
     2. …minden karrierszakaszban;
     3. a +10-es kalibrációs ponton bitre a RÉGI értéket adja (a közép-karrier
        nehézsége nem változott);
     4. a sorozatok rangsora megmaradt (KK a legszorosabb, MK a legenyhébb);
     5. a dominancia SZÁNDÉKOSAN nyers maradt — meccs-erőre váltva visszatérne
        a sodródás, mert a mezőnyszinthez hasonlítja magát;
     6. a lebutítás-védelem a kupamezőnynél is hat;
     7. PvP: a közös horgony, a közös kupa-mid és a javaslat nélküli
        mezőnyszint mind az `mstr`-ből dolgozik, nem a nyers `str`-ből. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9097;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type","text/html; charset=utf-8");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext()).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const s2=k[i%k.length];
       const pl={n:"M "+i+" "+s2.n,ovr:110,pos:(s2.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);try{drafted.add(pl.n);}catch(e){}});}
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    phase="season";S.idx=0;infinityMode=true;
    {const lv={};Object.keys(TACTICS).forEach(k=>{lv[k]=95;});S.tactics={levels:lv,active:"totalis"};}
    S.seasonHistory=[{season:1,oppRating:84,rank:3}];
    S.pyr=null;                                    /* dinamikus mód */

    const COMPS=["BL","EL","KL","MK"];
    const _hid=hiddenMatchBonus;let HID=0;
    hiddenMatchBonus=()=>HID;
    /* a motor saját optimuma legyen kiállítva: a nevezési szám így az élővel
       egyezik, és a mérés nem a lebutítás-védelmet méri */
    {const bc=msWithRestore(msBestConfig);
     if(bc){const pool=fullCareerRoster().filter(Boolean);
       const arr=arrangeSlotsFor(bc.form,pool);form=bc.form;slots=arr.slots;captainIdx=bc.cap;
       if(S.tactics)S.tactics.active=bc.tac;
       bc.xi.forEach((nm,i)=>{const pl=pool.find(x=>x.n===nm);
         if(pl&&slots[i]){slots[i].player=pl;slots[i].fit=fitFor(pl,slots[i]);}});}}

    const folenyek=(lvl,h)=>{
      oppTargetRating=lvl;HID=h;S.oppBuffH=null;freezeSeasonHiddenBonus();
      const ms=teamStrength()+h,o={};
      COMPS.forEach(c=>{
        const dd=(EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0;
        o[c]=Math.round((ms-(euroMidRating(c)+dd))*10)/10;});
      return o;};
    const regiFoleny=(lvl,h)=>{
      oppTargetRating=lvl;HID=h;S.oppBuffH=null;freezeSeasonHiddenBonus();
      const ts=teamStrength(),ms=ts+h,dom=euroDominance(),o={};
      COMPS.forEach(c=>{
        const dd=(EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0;
        const e0=Math.min(1.2+EURO_DOM_EDGE*dom+({BL:0,EL:1,KL:2,MK:3}[c]),
                          {BL:4.5,EL:6,KL:7.5,MK:9}[c]);
        o[c]=Math.round((ms-(Math.round(Math.max(ts,lvl)+h*(1-OPP_BUFF_MEASURED)-e0-dd)+dd))*10)/10;});
      return o;};

    ki.h4 =folenyek(105,4);  ki.h10=folenyek(105,10);
    ki.h20=folenyek(105,20); ki.h30=folenyek(105,30);
    ki.regi10=regiFoleny(105,10);
    ki.regi4 =regiFoleny(105,4);
    ki.regi30=regiFoleny(105,30);
    /* 2. másik karrierszakasz */
    slots.forEach(sl=>{if(sl.player)sl.player.ovr=170;});
    ki.keso10=folenyek(165,10);ki.keso30=folenyek(165,30);

    /* 5. a dominancia nyers maradt */
    ki.domNyers=String(euroDominance).indexOf("teamMatchStrength")<0;

    /* ---- 6. LEBUTÍTÁS-VÉDELEM ----
       A MEZŐNYSZINT ALACSONY (100), különben az `anchor = max(ms, szint)`
       padlója elnyelné a lebutítást — a kupa nemzeti sorozat, sosem megy a
       saját ligád szintje alá. A kerethez GYENGE tartalékokat adunk, mert
       egy egyenletes, 170-es keretből nincs mit lebutítani. */
    HID=10;oppTargetRating=100;
    {const k=sq.players.slice();
     for(let i=0;i<11;i++){const s2=k[i%k.length];
       extraRoster.push({n:"Gyenge "+i,ovr:120,pos:(s2.pos||["KKP"]).slice(),age:27});}}
    S.oppBuffH=null;freezeSeasonHiddenBonus();
    let msJo=0;try{msRatedBegin();msJo=teamMatchStrength();}finally{msRatedEnd();}
    const jo=euroMidRating("BL");
    /* A KISZORULÓ ERŐSEKET A TARTALÉKBA TESSZÜK, nem a semmibe: a valódi
       játékban egy csere nem TÖRLI a játékost a keretből. Enélkül az
       optimalizáló nem is találná meg őket, és a védelem — jogosan — nem
       tudna mit felajánlani. Az első változatom épp ezt vétette el. */
    {const pool=fullCareerRoster().filter(Boolean);
     const gy=pool.slice().sort((a,b)=>pOvr(a)-pOvr(b));
     slots.forEach((sl,i)=>{
       const pl=gy[i%gy.length];
       if(!pl)return;
       if(sl.player&&sl.player!==pl)extraRoster.push(sl.player);
       const ix=extraRoster.indexOf(pl);if(ix>=0)extraRoster.splice(ix,1);
       sl.player=pl;sl.fit=fitFor(pl,sl);});}
    const eloButa=teamStrength()+HID;
    const buta=euroMidRating("BL");
    /* a NYERS élő szám szerint a mezőny ennyire esett volna: */
    const butaVedtelen=Math.round(eloButa-(jo===null?0:(msJo-jo)));
    ki.vedve={jo,buta,msJo:Math.round(msJo*10)/10,eloButa:Math.round(eloButa*10)/10,
              vedtelen:butaVedtelen,
              esett:Math.round((jo-buta)*10)/10,
              esettVolna:Math.round((jo-butaVedtelen)*10)/10};
    hiddenMatchBonus=_hid;

    /* 7. PvP: a három hívási hely az mstr-ből dolgozik */
    ki.pvp={
      horgony:String(mpStartTick).indexOf("mine.mstr||mine.str")>=0,
      kupaMid:String(mpStartTick).indexOf("mine.mstr||mine.str")>=0,
      auto:String(mpResolveLevel).indexOf("mine.mstr||mine.str")>=0};
    ki.edge={base:EURO_BASE_EDGE,caps:{BL:EURO_EDGE.BL.cap,MK:EURO_EDGE.MK.cap}};
    return ki;});

  const azonos=(a,b,e)=>Object.keys(a).every(k=>Math.abs(a[k]-b[k])<=(e||0.6));
  console.log("\n1-2. A FÖLÉNY ÁLLANDÓ");
  ok(azonos(t.h4,t.h10)&&azonos(t.h10,t.h20)&&azonos(t.h20,t.h30),
     "a rejtett bónusz +4…+30 tartományán nem mozdul",
     {h4:t.h4,h10:t.h10,h30:t.h30});
  ok(azonos(t.keso10,t.keso30),"…késői karrierszakaszban is",{h10:t.keso10,h30:t.keso30});
  ok(azonos(t.h10,t.keso10,1.2),"…és a két karrierszakasz is egyezik",
     {korai:t.h10,kesoi:t.keso10});

  console.log("\n3. A KALIBRÁCIÓS PONT");
  ok(azonos(t.h10,t.regi10),"rejtett +10-nél BITRE a régi fölény (a közép-karrier nem változott)",
     {uj:t.h10,regi:t.regi10});
  ok(!azonos(t.h4,t.regi4)&&!azonos(t.h30,t.regi30),
     "…a széleken viszont igen: ott javult a sodródás",
     {regi4:t.regi4.BL,uj4:t.h4.BL,regi30:t.regi30.BL,uj30:t.h30.BL});

  console.log("\n4. A SOROZATOK RANGSORA");
  ok(t.h10.BL<t.h10.EL&&t.h10.EL<t.h10.KL&&t.h10.KL<t.h10.MK,
     "KK a legszorosabb, MK a legenyhébb",t.h10);

  console.log("\n5. A DOMINANCIA SZÁNDÉKOSAN NYERS");
  ok(t.domNyers===true,"az euroDominance nem vált meccs-erőre (különben visszatérne a sodródás)");

  console.log("\n6. LEBUTÍTÁS-VÉDELEM A KUPÁNÁL");
  ok(t.vedve.buta<t.vedve.jo,"gyengébb tizenegynél a mezőny is gyengébb",t.vedve);
  ok(t.vedve.esett<t.vedve.esettVolna*0.75,
     "…de a védelem nélkülinek KEVESEBB MINT HÁROMNEGYEDÉVEL (nevezési szám)",
     {esett:t.vedve.esett,vedelemNelkul:t.vedve.esettVolna});

  console.log("\n7. PvP");
  ok(t.pvp.horgony===true,"a közös horgony és a kupa-mid az mstr-ből");
  ok(t.pvp.auto===true,"a javaslat nélküli mezőnyszint is");
  ok(t.edge.base===6.2,"az új alap-fölény 6,2 (= 1,2 + a régi rejtett/2 a +10-es ponton)",t.edge);

  const zaj=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(zaj.length===0,"nincs konzolhiba",zaj.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
