/* 💸 3.9.189 — JÁTÉKOSSZINTŰ FIZETÉS, A VALÓDI LELÁTÓ-ÁRON.

   BEJELENTÉS: „A lelátói díjakat növeltük, de a fizetések irreálisan
   alacsonyak. Legyenek játékosspecifikusan szépen kiszámolva. Tartsuk
   továbbra is a sztárom a párom kivételével minden esetben a sikeres idény
   utáni max 50% limitet (a lelátó árához képest) de legyen szépen kiszámolva,
   kinek mennyi a fizetése. Legyen köze a csapatbeli szerepéhez, a
   potenciáljához, hogy mennyi ideje van nálunk, hogy mennyire sikeres, hogy
   friss sztárként igazoltuk-e stb."

   Amit mér:
     1. A LELÁTÓ-ÁR: a bér horgonya és a plafon a mai jegyáron (a 100 feletti
        jegyár-szorzóval) — a létszám a szerződéskori marad; a sztár
        hírnév-horgonya is;
     2. A HAT TÉNYEZŐ: szerep (perc/meccs, idény eleje: kezdő 11), kapitány,
        POT, hűség, siker (+ szezonkártya), friss sztár-igazolás (a „buy"
        kapun rögzítve, 3 idényen át csökkenő felár), ifi-szerződés — és a
        szorzó-sáv (×0,5–2,5);
     3. A SZÁMLA: a bér = Rating-alap × szorzó (+ top sztár felár); a plafon
        sikeres idény után a lelátó 50%-a, arányosan húz vissza; a sztár
        hírnév-bére a plafonon kívül;
     4. A FELÜLET: az adatlap (Statzone) kiírja a fizetést és a tényezőit, a
        napló a meccs legjobban fizetett embereit, a keret-bontás a
        legjobban fizetettet; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9232;
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
  await p.waitForFunction(()=>typeof wagePayParts==="function",null,{timeout:15000});

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

    /* ---- 1. A LELÁTÓ-ÁR ---- */
    let RAW=95;const _ob=teamOVRbase;window.teamOVRbase=()=>RAW;
    S.fanBase=100000;S.wageFans=80000;
    const w95=wageAnchorWeek(),f95=fameWageAnchor();
    RAW=117;const w117=wageAnchorWeek(),sc=fanTicketScale(),f117=fameWageAnchor();
    ki.jegy={arany:w117/w95,sc,fame:f117/f95,
      horgonyLetszam:Math.abs(w117-80000*FAN_TICKET*fanMult()*sc)<1e-6};
    const c117=wageContext();
    ki.plafon={cap:c117.cap,fanWeek:c117.fanWeek,share:c117.capShare};
    window.teamOVRbase=_ob;

    /* ---- 2. A HAT TÉNYEZŐ ---- */
    const c=()=>wageContext();
    /* szerep: perc/meccs */
    S.seasonMatches[A.n]=10;S.seasonMinutes[A.n]=880;
    S.seasonMatches[B.n]=10;S.seasonMinutes[B.n]=500;
    S.seasonMatches[C.n]=10;S.seasonMinutes[C.n]=200;
    ki.szerep=[fx(wagePayParts(A,c()),"szerep"),fx(wagePayParts(B,c()),"szerep"),fx(wagePayParts(C,c()),"szerep")];
    /* idény eleje: a kezdő 11 dönt */
    tiszta();
    const kint=fullCareerRoster().find(x=>!xi.some(y=>y.n===x.n));
    ki.korai=[fx(wagePayParts(A,c()),"szerep"),kint?fx(wagePayParts(kint,c()),"szerep"):0.85];
    /* kapitány */
    const kap=slots[captainIdx].player;
    ki.kapitany=[fx(wagePayParts(kap,c()),"kapitany"),fx(wagePayParts(A,c()),"kapitany")];
    /* POT */
    careerPool[A.n].pot=60000;const potHi=fx(wagePayParts(A,c()),"pot");
    careerPool[A.n].pot=100;const potLo=fx(wagePayParts(A,c()),"pot");
    careerPool[A.n].pot=3000;const potMid=fx(wagePayParts(A,c()),"pot");
    ki.pot=[potHi,potLo,potMid];
    /* hűség */
    S.careerStats[A.n]={g:0,a:0,mvp:0,matches:40,cs:0,saves:0};
    const h40=fx(wagePayParts(A,c()),"huseg");
    S.careerStats[A.n].matches=500;
    const h500=fx(wagePayParts(A,c()),"huseg");
    ki.huseg=[h40,h500];
    /* siker: a hozam a posztcsoport átlagához */
    tiszta();
    const mezo=xi.filter(x=>!(x.pos&&x.pos[0]==="KP"));
    mezo.forEach(x=>{S.careerStats[x.n]={g:2,a:1,mvp:0,matches:10,cs:0,saves:0};});
    S.careerStats[A.n]={g:20,a:10,mvp:5,matches:10,cs:0,saves:0};
    S.careerStats[B.n]={g:0,a:0,mvp:0,matches:10,cs:0,saves:0};
    ki.siker=[fx(wagePayParts(A,c()),"siker"),fx(wagePayParts(B,c()),"siker")];
    /* friss sztár-igazolás: a „buy" kapun */
    tiszta();
    S.transferBudget=1e12;
    const avg=fullCareerRoster().filter(x=>x.n!==A.n).map(x=>(marketValue(careerPool[x.n]||x)||0)*buyMarkup()).filter(x=>x>0);
    const avgV=avg.reduce((a,b)=>a+b,0)/avg.length;
    budgetPay(Math.round(avgV*2),"buy",A.n);
    budgetPay(Math.round(avgV*0.5),"buy",B.n);
    const sz=[];
    for(let k=0;k<4;k++){S.seasonNumber=3+k;sz.push(fx(wagePayParts(A,c()),"igazolas"));}
    S.seasonNumber=3;
    ki.igazolas={sor:sz,olcso:fx(wagePayParts(B,c()),"igazolas"),boughtFor:careerPool[A.n].boughtFor>0};
    /* ifi */
    const _y=isYouthProspect;window.isYouthProspect=e=>e&&e.n===A.n;
    ki.ifi=fx(wagePayParts(A,c()),"ifi");
    window.isYouthProspect=_y;
    /* szorzó-sáv */
    mezo.forEach(x=>{S.careerStats[x.n]={g:1,a:0,mvp:0,matches:10,cs:0,saves:0};});
    careerPool[A.n].pot=100000;S.careerStats[A.n]={g:999,a:999,mvp:999,matches:900,cs:0,saves:0};
    S.seasonMatches[A.n]=10;S.seasonMinutes[A.n]=900;
    budgetPay(Math.round(avgV*5),"buy",A.n);
    ki.plafonSzorzo=wagePayParts(A,c()).mult;
    tiszta();

    /* ---- 3. A SZÁMLA ---- */
    const C3=c();
    const P=wagePayParts(A,C3);
    ki.keplet=Math.abs(playerMatchWage(A,C3)-(P.alap*P.mult+(P.starFee||0)))<1e-6;
    /* plafon: sikeres idény után 50% */
    window.wageSuccessSeason=()=>true;
    const C4=c();
    /* 3.9.190 óta a bér dinamikus, egy átlagos keret a plafon alatt marad —
       itt szándékosan sok pályára lépés: biztosan plafon fölé */
    const nagy=[].concat(...Array(6).fill(0).map(()=>fullCareerRoster()));
    const bill=wageBill(nagy,C4);
    ki.szamla={capShare:C4.capShare,capped:bill.capped,due:bill.due,cap:C4.cap,raw:bill.raw,factor:bill.factor};
    /* sztár: plafonon kívül */
    const _fs=fameStarName;window.fameStarName=()=>A.n;
    const C5=c();const bill5=wageBill(nagy,C5);
    ki.sztar={stardom:bill5.stardom,due:bill5.due,cap:C5.cap};
    window.fameStarName=_fs;

    /* ---- 4. A FELÜLET ---- */
    S.careerStats[A.n]={g:3,a:2,mvp:1,matches:40,cs:0,saves:0};
    /* drága keret (sok trófea): a kezdő 11 számlája a plafon fölött */
    window.wageTitleCount=()=>12;
    let html="";try{html=hubStatZoneHtml(A);}catch(e){html="HIBA "+e;}
    ki.adatlap=html.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    const sorok=[];const _a=addLine;addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{S.transferBudget=1e12;chargeMatchWages(xi);}finally{addLine=_a;}
    ki.naplo=sorok.find(t=>/Fizetések:/.test(t))||"";
    let bont="";try{bont=budgetBreakdownHtml();}catch(e){bont="";}
    ki.bontas=/a legjobban fizetett/.test(bont);
    ki.szotar=/JÁTÉKOS SAJÁT SZORZÓJA/.test(GLOSSARY.fizetesek.text)&&/VALÓDI JEGYÁRON/.test(GLOSSARY.fizetesek.text);
    return ki;});

  console.log("\n— 1. A LELÁTÓ-ÁR —");
  ok(Math.abs(r.jegy.arany-r.jegy.sc)<1e-9&&r.jegy.sc>5,"a bér horgonya a jegyár-szorzóval nő (117-nél ×"+(r.jegy.sc||0).toFixed(1)+")",r.jegy);
  ok(r.jegy.horgonyLetszam,"a LÉTSZÁM a szerződéskori marad (80 000, nem a mai 100 000)");
  ok(Math.abs(r.jegy.fame-r.jegy.sc)<1e-9,"a sztár hírnév-horgonya is a mai jegyáron",r.jegy.fame);
  ok(Math.abs(r.plafon.cap-r.plafon.fanWeek*r.plafon.share)<1e-6,"a plafon a valódi árú lelátó része",r.plafon);
  console.log("\n— 2. A HAT TÉNYEZŐ —");
  ok(JSON.stringify(r.szerep)==="[1,0.85,0.7]","szerep: alapember ×1 · rotációs ×0,85 · csere/joker ×0,70 (perc/meccs)",r.szerep);
  ok(r.korai[0]===1&&r.korai[1]===0.85,"idény elején a kezdő 11-beli hely dönt",r.korai);
  ok(r.kapitany[0]===1.12&&r.kapitany[1]===null,"a kapitány ×1,12",r.kapitany);
  ok(r.pot[0]===1.3&&r.pot[1]===0.85&&r.pot[2]>0.95&&r.pot[2]<1.05,"POT: a keret átlagához, ×0,85–1,30",r.pot);
  ok(r.huseg[0]===1.1&&r.huseg[1]===1.3,"hűség: meccsenként +0,25%, legfeljebb +30%",r.huseg);
  ok(r.siker[0]===1.25&&r.siker[1]===0.9,"siker: a posztcsoport átlagához, −10% és +25% között",r.siker);
  ok(JSON.stringify(r.igazolas.sor)==="[1.35,1.2,1.1,null]"&&r.igazolas.olcso===null&&r.igazolas.boughtFor,
     "friss sztár-igazolás: +35% / +20% / +10%, utána semmi; olcsó igazolásnál nincs felár",r.igazolas);
  ok(r.ifi===0.75,"ifi-szerződés ×0,75",r.ifi);
  ok(r.plafonSzorzo===2.5,"a személyes szorzó legfeljebb ×2,5",r.plafonSzorzo);
  console.log("\n— 3. A SZÁMLA —");
  ok(r.keplet,"a bér = Rating-alap × személyes szorzó (+ top sztár felár)");
  ok(r.szamla.capShare===0.5&&r.szamla.capped&&Math.abs(r.szamla.due-r.szamla.cap)<1,"sikeres idény után a bérszámla a lelátó 50%-ánál megáll",r.szamla);
  ok(r.sztar.stardom>0&&r.sztar.due>r.sztar.cap,"a „Sztárom a párom” sztárjának bére a plafonon kívül áll",r.sztar);
  console.log("\n— 4. A FELÜLET —");
  ok(/Fizetés:/.test(r.adatlap)&&/szerep/.test(r.adatlap)&&/hűség/.test(r.adatlap)&&/plafon/.test(r.adatlap),"az adatlap kiírja a fizetést és a tényezőit",r.adatlap.slice(-400));
  ok(/a plafon után ténylegesen/.test(r.adatlap),"plafon fölötti keretnél az adatlap a ténylegesen kifizetett összeget is mutatja");
  ok(/legtöbbet:/.test(r.naplo),"a napló a meccs legjobban fizetett embereit is megnevezi",r.naplo);
  ok(r.bontas,"a keret-bontásban a legjobban fizetett sora");
  ok(r.szotar,"a súgó a játékos saját szorzójáról és a valódi jegyárról szól");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
