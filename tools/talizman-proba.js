/* 🧿 TALIZMÁNOK — F0–F2 (3.9.141): a váz próbája.

   KIMONDOTT DÖNTÉSEK: „Talizmán név jó, 3-ból 1, nem vak, minden másban is
   egyet értek veled. Joker erősíti a negatív alacsony eséllyel dolgokat is.
   kezdd az F0-F2 fázissal."

   Amit mér:
     1. A KATALÓGUS: tíz kategória, mindegyiknek van átlagos szinten is
        elérhető speciálja, minden kontra MÁSIK területet üt (a Meccs a saját
        másik tengelyét), és egyik szöveg sem hagy benne {v}-t, NaN-t,
        undefined-ot — egyik ritkaságon sem;
     2. A GENERÁTOR 10 000 talizmánon: a ritkaság 58/28/11/3%, a special
        ~67%, a dobás a sávon belül marad, a Tiszta talizmán ×1,25;
     3. A KÍNÁLAT: három különböző kategória; az ismerős a domináns színből, az
        „új irány" olyanból, amiből 0–1 van; az első húzás tanít (legfeljebb
        ritka, két Tiszta, egy speciális); a szerencse-számláló 16-nál
        legendást tesz be; birtokolt special nem jön újra; SEEDELT — kétszer
        kérve, és a mentés oda-vissza útja után is ugyanaz;
     4. AZ ÜTEMEZÉS: az első idény 3–5., 11–20., 21–30. fordulóban, a többi
        1–10.-től; a 30. fordulóra pontosan 3 ütemezett húzás áll sorba;
     5. A MÉRFÖLDKŐ-CSERE: a nyertes dobásnál a pénz NEM folyik be, a napló
        kimondja; egy kiértékelésből legfeljebb egy, idényenként legfeljebb
        kettő; a beragadt jutalom sosem cserél; a 6-os plafon fog;
     6. A FELÜLET: a húzás-ablak három gombbal, választás nélkül tiltott
        megerősítéssel; a választás a gyűjteménybe tesz, a passz fizet és
        szerencsét ad, a „Később" semmit nem dob el; a menü és a HUB-gomb;
     7. A MENTÉS: a talizmán-állapot a mentésben utazik; a régi mentés futó
        idénye nem kap visszamenőleg húzást, a nyári igen;
     8. VALÓDI IDÉNY végigjátszással: 3 ütemezett + legfeljebb 2 csere, és a
        gép NEM dönt helyetted (a húzás vár); a kézi lánc a mérkőzés után
        elénk teszi az ablakot;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9153, TAL_PLAFON_PROBA=6;
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

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
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
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});

  /* ---- 1-2. KATALÓGUS ÉS GENERÁTOR ---- */
  const g=await p.evaluate(()=>{
    const ki={};
    const rossz=s=>/\{v\}|NaN|undefined|null/.test(String(s));
    ki.katDb=TAL_KAT.length;
    ki.katMin1=TAL_KAT.every(K=>TAL_SPEC.some(s=>s.k===K.k&&s.min===1));
    ki.specDb=TAL_SPEC.length;
    ki.specPerKat=TAL_KAT.map(K=>TAL_SPEC.filter(s=>s.k===K.k).length);
    ki.masikTerulet=TAL_SPEC.filter(s=>s.k!=="meccs"&&s.con.k===s.k).map(s=>s.id);
    ki.ervenyesKontra=TAL_SPEC.every(s=>s.con.k==="pakli"||!!talKat(s.con.k));
    ki.egyediId=new Set(TAL_SPEC.map(s=>s.id)).size===TAL_SPEC.length;
    ki.rosszSzoveg=[];
    TAL_SPEC.forEach(s=>{for(let r=s.min;r<=5;r++){
      const a=talSpecOldal(s,"pro",r),c=talSpecOldal(s,"con",r);
      if(!a||!c||rossz(a)||rossz(c))ki.rosszSzoveg.push(s.id+"@"+r);}});
    /* 10 000 talizmán, a valódi generátorral */
    const rnd=talRng("proba-gen");
    const N=10000,rang=[0,0,0,0,0];let spec=0,rosszAlap=0,eKint=0,tiszta=0,tisztaOk=0;
    for(let i=0;i<N;i++){
      const k=TAL_KAT[i%TAL_KAT.length].k;
      const L=talUjLap(rnd,k,talRollRang(rnd));
      rang[L.rang]++;if(L.spec)spec++;
      const alap=talAlapSzoveg(L),sav=talSav(L),nev=talLapNev(L);
      if(!alap||!nev||rossz(alap)||rossz(sav)||rossz(nev))rosszAlap++;
      const E=talLapE(L),R=TAL_RANG[L.rang].e*(L.spec?1:TAL_TISZTA_MULT);
      if(E<R*0.85-1e-9||E>R*1.15+1e-9)eKint++;
      if(!L.spec){tiszta++;const L2=Object.assign({},L,{spec:"egyur"});
        if(Math.abs(talLapE(L)/talLapE(L2)-TAL_TISZTA_MULT)<1e-9)tisztaOk++;}}
    ki.rang=rang.slice(1).map(x=>Math.round(x/N*1000)/10);
    ki.spec=Math.round(spec/N*1000)/10;
    ki.rosszAlap=rosszAlap;ki.eKint=eKint;ki.tisztaOk=tisztaOk===tiszta;
    /* a lap HTML-je minden ritkaságon és a Mítoszon is kirajzolható */
    ki.html=[1,2,3,4,5].every(r=>{const h=talLapHtml({kat:"bank",valt:"bevetel",rang:r,dobas:0.5,spec:"aranytojas"});
      return h.indexOf("talCard r"+r)>=0&&!rossz(h.replace(/null/g,""));});
    return ki;});
  console.log("\n— 1. A KATALÓGUS —");
  ok(g.katDb===10,"tíz kategória",g.katDb);
  ok(g.katMin1,"minden kategóriának van átlagos szinten is elérhető speciálja");
  ok(g.specDb>=60&&g.specPerKat.every(n=>n>=6),"60+ special, kategóriánként legalább 6",{db:g.specDb,kat:g.specPerKat});
  ok(g.masikTerulet.length===0&&g.ervenyesKontra,"minden kontra MÁSIK területet üt, és létező területet",g.masikTerulet);
  ok(g.egyediId,"a special-azonosítók egyediek");
  ok(g.rosszSzoveg.length===0,"egyik special szövege sem hagy benne {v}/NaN/undefined-ot, egyik ritkaságon sem",g.rosszSzoveg.slice(0,5));
  console.log("\n— 2. A GENERÁTOR (10 000 talizmán) —");
  /* A TŰRÉS ~4,2 σ (3.9.145). A minta a karrier VÉLETLEN seedjéből jön, tehát
     futásonként más: 10 000 lapnál a binomiális szórás 58%-nál 0,49, 28%-nál
     0,45, 11%-nál 0,31, 3%-nál 0,17, 67%-nál 0,47 pont — 300 seeden MÉRVE a
     special-arány átlaga 67,00, szórása 0,48 (a generátor és a talRng rendben).
     A régi ±1,5 / ±1 / ±0,6 csak ~3 σ volt: a próba nagyjából minden 200–300.
     futáson ok nélkül bukott (egyszer mérve: 65,2%). A 4,2 σ egy valódi,
     1-2 pontos eltolódást továbbra is azonnal jelez. */
  ok(Math.abs(g.rang[0]-58)<2.1&&Math.abs(g.rang[1]-28)<1.9&&Math.abs(g.rang[2]-11)<1.3&&Math.abs(g.rang[3]-3)<0.75,
     "a ritkaság 58 / 28 / 11 / 3%",g.rang);
  ok(Math.abs(g.spec-67)<2.0,"a talizmánok ~67%-án van special",g.spec);
  ok(g.rosszAlap===0,"minden alapszöveg, sáv és név ép",g.rosszAlap);
  ok(g.eKint===0,"az erő a ritkaság sávjának 85–115%-án belül marad",g.eKint);
  ok(g.tisztaOk,"a Tiszta talizmán alapja pontosan ×1,25");
  ok(g.html,"a talizmán kirajzolható mind az öt fokozaton");

  /* ---- 3. A KÍNÁLAT ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    S.tal=null;const T=talState();
    const kat=L=>L.kat;
    const elso=talKinalat("proba-elso");
    ki.elso={rang:elso.map(L=>L.rang),spec:elso.map(L=>!!L.spec),kat:new Set(elso.map(kat)).size};
    /* egy Bank-irányú pakli */
    T.huzas=5;
    T.lapok=[1,2,3,4].map(i=>({uid:i,kat:"bank",valt:"bevetel",rang:1,dobas:0.5,spec:i===1?"berplafon":null}))
      .concat([{uid:5,kat:"taktika",valt:"fit",rang:1,dobas:0.5,spec:null},
               {uid:6,kat:"taktika",valt:"fit",rang:1,dobas:0.5,spec:null}]);
    T.seq=6;
    const el=talEloszlas();
    let ismOk=0,ujOk=0,kulonb=0,birtok=0;const N=200;
    for(let i=0;i<N;i++){
      const kin=talKinalat("proba-"+i);
      if(kin[0].kat==="bank")ismOk++;
      if(el[kin[1].kat]<=1)ujOk++;
      if(new Set(kin.map(kat)).size===3)kulonb++;
      if(kin.some(L=>L.spec==="berplafon"))birtok++;}
    ki.ismOk=ismOk;ki.ujOk=ujOk;ki.kulonb=kulonb;ki.birtok=birtok;ki.N=N;
    ki.dom=talDominans();
    /* szerencse-számláló */
    T.szerencse=TAL_PITY;
    let leg=0;for(let i=0;i<50;i++)if(talKinalat("pity-"+i).some(L=>L.rang===4))leg++;
    ki.pity=leg;
    T.szerencse=0;
    let leg0=0;for(let i=0;i<50;i++)if(talKinalat("pity-"+i).some(L=>L.rang===4))leg0++;
    ki.pity0=leg0;
    /* determinizmus: kétszer ugyanaz, és a JSON oda-vissza út után is */
    const a=JSON.stringify(talKinalat("det"));
    const b2=JSON.stringify(talKinalat("det"));
    const mentett=JSON.stringify(S.tal);S.tal=JSON.parse(mentett);
    const c=JSON.stringify(talKinalat("det"));
    ki.det=a===b2&&a===c;
    ki.masSeed=(()=>{const s0=S.tal.seed;S.tal.seed=s0+1;const d=JSON.stringify(talKinalat("det"));S.tal.seed=s0;return d!==a;})();
    return ki;});
  console.log("\n— 3. A KÍNÁLAT —");
  ok(k.elso.rang.every(r=>r<=2)&&k.elso.spec[0]===false&&k.elso.spec[1]===false&&k.elso.spec[2]===true&&k.elso.kat===3,
     "az első húzás tanít: legfeljebb ritka, két Tiszta és egy speciális, három különböző területről",k.elso);
  ok(k.ismOk===k.N,"az ismerős hely mindig a domináns színből jön (itt: Bank)",{ism:k.ismOk,N:k.N});
  ok(k.ujOk===k.N,"az „új irány” olyan területről jön, amiből 0–1 talizmánod van",{uj:k.ujOk,N:k.N});
  ok(k.kulonb===k.N,"mindig három különböző kategória",k.kulonb);
  ok(k.birtok===0,"birtokolt special nem jön újra (a duplikátum a fúzióé lesz)",k.birtok);
  ok(k.dom.k==="bank"&&k.dom.cim==="A Bankár","a domináns szín címet ad",k.dom);
  ok(k.pity===50,"16 legendás nélküli húzás után a kínálatban mindig van legendás",k.pity);
  ok(k.pity0<50,"…nélküle nem mindig",k.pity0);
  ok(k.det&&k.masSeed,"a kínálat seedelt: kétszer kérve és a mentés útja után is ugyanaz, más seeddel más",{det:k.det,mas:k.masSeed});

  /* ---- 4. AZ ÜTEMEZÉS ---- */
  const u=await p.evaluate(()=>{
    const ki={};
    const minta=[];
    for(let i=0;i<60;i++){S.tal=null;S.seasonNumber=1;const sz=talSzezon();minta.push(sz.due.slice());}
    ki.elso=minta.every(d=>d[0]>=3&&d[0]<=5&&d[1]>=11&&d[1]<=20&&d[2]>=21&&d[2]<=30);
    const masod=[];
    for(let i=0;i<60;i++){S.tal=null;S.seasonNumber=2;const T=talState();T.lapok=[{uid:1,kat:"bank",valt:"bevetel",rang:1,dobas:0.5}];
      const sz=talSzezon();masod.push(sz.due[0]);}
    ki.masodMin=Math.min(...masod);ki.masodMax=Math.max(...masod);
    S.tal=null;S.seasonNumber=1;talSzezon();
    S.idx=30;const a=talEsedekes();const b2=talEsedekes();
    ki.sor=a;ki.ujra=b2;ki.varo=talState().varo.map(v=>v.id);ki.db=talState().sz.db;
    S.idx=0;
    return ki;});
  console.log("\n— 4. AZ ÜTEMEZÉS —");
  ok(u.elso,"első idény: 3–5., 11–20., 21–30. forduló (60 próbaseeden)");
  ok(u.masodMin>=1&&u.masodMax<=10&&u.masodMax>5,"a többi idény első húzása az 1–10. fordulóban",{min:u.masodMin,max:u.masodMax});
  ok(u.sor===3&&u.ujra===0&&u.db===3,"a 30. fordulóra pontosan 3 ütemezett húzás áll sorba, és nem duplázódik",u);

  /* ---- 5. A MÉRFÖLDKŐ-CSERE ---- */
  const m=await p.evaluate(()=>{
    const ki={};
    S.tal=null;S.seasonNumber=1;S.idx=5;talSzezon();
    const M=msState();
    const cash=MILESTONES.filter(d=>d.kind==="cash");
    /* AZ ARÁNY 20 KARRIER-SEED ÁTLAGA: egyetlen seed a véges mérföldkő-listán
       (binomiális szórás) időnként a sávon kívülre esett — ez a mérés zaja
       volt, nem a szabályé. A többi állítás az utolsó seeden fut. */
    let _ossz=0;
    for(let i=0;i<20;i++){S.tal=null;talState();_ossz+=cash.filter(d=>talRng("ms",d.id)()<TAL_MS_P).length/cash.length;}
    S.tal=null;S.seasonNumber=1;S.idx=5;talSzezon();
    const nyer=cash.filter(d=>talRng("ms",d.id)()<TAL_MS_P);
    const veszt=cash.filter(d=>talRng("ms",d.id)()>=TAL_MS_P);
    ki.arany=Math.round(_ossz/20*100);
    const _add=addLine;const napl=[];addLine=h=>napl.push(String(h));
    try{
      S.transferBudget=100000;
      /* egy vesztes dobás: pénz jön, nincs húzás */
      talMsBatchNext();
      msPayout(veszt[0]);
      ki.vesztPenz=S.transferBudget>100000;ki.vesztVaro=talState().varo.length;
      /* egy nyertes dobás: nincs pénz, húzás áll sorba, a napló kimondja */
      talMsBatchNext();
      const b0=S.transferBudget;
      msPayout(nyer[0]);
      ki.nyerPenz=S.transferBudget-b0;ki.nyerVaro=talState().varo.length;
      ki.naplo=napl.some(h=>/talizmán-húzás \(a \+/.test(h));
      ki.log=(M.log[0]&&M.log[0].txt)||"";
      /* ugyanabból a kiértékelésből a második nyertes sem cserél */
      const b1=S.transferBudget;
      msPayout(nyer[1]);
      ki.batchPenz=S.transferBudget>b1;ki.batchVaro=talState().varo.length;
      /* új kiértékelés: a második csere megy, a harmadik már nem (max 2) */
      talMsBatchNext();msPayout(nyer[2]);
      talMsBatchNext();const b3=S.transferBudget;msPayout(nyer[3]);
      ki.max2=talState().sz.csere;ki.harmadikPenz=S.transferBudget>b3;
      /* a beragadt jutalom sosem cserél */
      talState().sz.csere=0;talMsBatchNext();
      const b4=S.transferBudget;msPayout(nyer[4],"held");
      ki.held=S.transferBudget>b4;
      /* a 6-os plafon */
      talState().sz.db=TAL_PLAFON;talState().sz.csere=0;talMsBatchNext();
      const b5=S.transferBudget;msPayout(nyer[5]);
      ki.plafon=S.transferBudget>b5;
    }finally{addLine=_add;}
    return ki;});
  console.log("\n— 5. A MÉRFÖLDKŐ-CSERE —");
  ok(m.arany>=15&&m.arany<=35,"a pénzes mérföldkövek ~25%-a nyerő dobás (seedelt)",m.arany);
  ok(m.vesztPenz&&m.vesztVaro===0,"vesztes dobásnál a pénz befolyik, húzás nincs",m);
  ok(m.nyerPenz===0&&m.nyerVaro===1&&m.naplo&&/talizmán-húzás/.test(m.log),"nyertes dobásnál NINCS pénz, húzás áll sorba, a napló és a mérföldkő-napló kimondja",{p:m.nyerPenz,v:m.nyerVaro,log:m.log});
  ok(m.batchPenz&&m.batchVaro===1,"egy kiértékelésből legfeljebb egy csere",m);
  ok(m.max2===2&&m.harmadikPenz,"idényenként legfeljebb két csere",m);
  ok(m.held,"a beragadt jutalom sosem cserél");
  ok(m.plafon,"a 6-os plafonnál a mérföldkő pénzt fizet");

  /* ---- 6. A FELÜLET ---- */
  const f=await p.evaluate(async()=>{
    const ki={};
    S.tal=null;S.seasonNumber=1;S.idx=4;const T=talState();talSzezon();
    T.varo=[];talSor({id:"ui-1",forras:"utem",n:1,szezon:1,fordulo:4});
    talSor({id:"ui-2",forras:"utem",n:2,szezon:1,fordulo:4});
    let visszahiv=0;
    talDrawOpen(()=>{visszahiv++;});
    const mod=$("talDrawModal");
    ki.lathato=!mod.classList.contains("hide");
    ki.gombok=document.querySelectorAll("#talDrawCards .talPickBtn").length;
    ki.okTiltva=$("talDrawOk").disabled;
    ki.forras=$("talDrawSrc").textContent;
    /* NEM Jellemhullám: annál az irányválasztó jön a második húzás előtt
       (3.9.144), és a lánc másik ágát ez a blokk nem méri */
    const _ki=T.varo[0].kinalat.findIndex(L=>!(L.kat==="moral"&&L.valt==="hullam"));
    document.querySelectorAll("#talDrawCards .talPickBtn")[_ki].click();
    ki.okEngedve=!$("talDrawOk").disabled;
    const valasztott=T.varo[0].kinalat[_ki];
    $("talDrawOk").click();
    ki.lapok=T.lapok.length;ki.uid=T.lapok[0]&&T.lapok[0].uid;
    ki.egyezik=T.lapok[0]&&T.lapok[0].kat===valasztott.kat&&T.lapok[0].rang===valasztott.rang&&(T.lapok[0].spec||null)===(valasztott.spec||null);
    /* a második húzás magától jön */
    ki.masodikNyitva=!mod.classList.contains("hide")&&T.varo.length===1;
    const _fwi=fanWeeklyIncome;fanWeeklyIncome=()=>23000;
    const b0=S.transferBudget,sz0=T.szerencse,leg=T.varo[0].kinalat.some(L=>L.rang>=4);
    const osszeg=talPasszOsszeg();
    $("talDrawPass").click();fanWeeklyIncome=_fwi;
    ki.passzPenz=S.transferBudget-b0;ki.passzVart=osszeg;
    ki.passzSzerencse=T.szerencse-(leg?0:sz0);ki.passzLeg=leg;
    ki.zarva=mod.classList.contains("hide")&&visszahiv===1&&T.varo.length===0&&T.huzas===2;
    /* „Később döntök": semmi nem vész el */
    talSor({id:"ui-3",forras:"utem",n:3,szezon:1,fordulo:4});
    talDrawOpen(null);const kin3=JSON.stringify(T.varo[0].kinalat);
    $("talDrawLater").click();
    ki.kesobb=mod.classList.contains("hide")&&T.varo.length===1;
    talDrawOpen(null);
    ki.kesobbUgyanaz=JSON.stringify(T.varo[0].kinalat)===kin3;
    $("talDrawLater").click();
    /* a menü */
    T.lapok.push({uid:9,kat:"bank",valt:"hitel",rang:4,dobas:0.3,spec:"aranytojas",forras:"ms",szezon:1,fordulo:9});
    T.lapok.push({uid:10,kat:"bank",valt:"bevetel",rang:1,dobas:0.3,spec:null,forras:"utem",szezon:1,fordulo:12});
    talMenuOpen();
    ki.menu=!$("talModal").classList.contains("hide");
    ki.racs=document.querySelectorAll("#talGrid .talCard").length;
    ki.cim=$("talHeadTitle").textContent;
    ki.sav=document.querySelectorAll("#talBar i").length;
    ki.huzzGomb=!$("talDrawNow").classList.contains("hide");
    ki.chipek=$("talChips").textContent;
    talMenuClose();
    /* a HUB-gomb */
    try{renderHub();}catch(e){ki.hubHiba=e.message;}
    const hb=$("hubTalBtn");
    ki.hub=hb&&!hb.classList.contains("hide")?hb.textContent:"(rejtett)";
    ki.jelzes=(TEACH_TOPICS["tal:draw"].due());
    return ki;});
  console.log("\n— 6. A FELÜLET —");
  ok(f.lathato&&f.gombok===3&&f.okTiltva,"a húzás-ablak három talizmánnal nyílik, választás nélkül a megerősítés tiltott",f);
  ok(/első ütemezett/.test(f.forras),"az ablak kimondja, honnan jött a húzás",f.forras);
  ok(f.okEngedve&&f.lapok===1&&f.uid===1&&f.egyezik,"a választott talizmán kerül a gyűjteménybe, sorszámmal",f);
  ok(f.masodikNyitva,"ha több húzás vár, a következő magától jön");
  ok(f.passzVart===11500&&f.passzPenz===f.passzVart&&(f.passzLeg?f.passzSzerencse===2:f.passzSzerencse===3),"a passz a heti lelátó felét fizeti, és +2 szerencsét ad",f);
  ok(f.zarva,"az utolsó húzás után az ablak bezár, és a lánc továbbmegy (egyszer)");
  ok(f.kesobb&&f.kesobbUgyanaz,"a „Később döntök” semmit nem dob el, és újranyitva ugyanaz a kínálat vár");
  ok(f.menu&&f.racs===3&&/Bankár/.test(f.cim)&&f.sav>=1&&f.huzzGomb,"a menü: irány-cím, színsáv, gyűjtemény és a várakozó húzás gombja",f);
  ok(!f.hubHiba&&/gyűjteményben/.test(f.hub)&&/húzás vár/.test(f.hub)&&f.jelzes,"a HUB-gomb mutatja a gyűjteményt és a várakozó húzást, a jelzés él",{hub:f.hub,j:f.jelzes,h:f.hubHiba});

  /* ---- 7. A MENTÉS ---- */
  const s=await p.evaluate(()=>{
    const ki={};
    const T=talState();
    try{saveGame();}catch(e){ki.hiba=e.message;}
    let d=null;
    try{
      Object.keys(localStorage).forEach(k=>{
        if(d)return;const v=localStorage.getItem(k);
        if(v&&v.indexOf('"tal":{')>=0&&v.indexOf('"careerPool"')>=0)d=JSON.parse(v);});
    }catch(e){}
    ki.benne=!!(d&&d.S&&d.S.tal&&d.S.tal.seed===T.seed&&d.S.tal.lapok.length===T.lapok.length);
    /* régi mentés: futó idény → kihagy, nyár → teljes */
    const reg=S.tal;
    S.tal=null;S.idx=12;S.seasonNumber=3;talLoadMigrate({S:{}});
    ki.futo={done:talState().sz.done,kihagy:!!talState().sz.kihagy};
    S.idx=20;ki.futoSor=talEsedekes();
    S.tal=null;S.idx=0;S.seasonNumber=3;talLoadMigrate({S:{}});talSzezon();
    ki.nyar={done:talState().sz.done,kihagy:!!talState().sz.kihagy};
    /* talizmános mentésre a migráció nem nyúl */
    S.tal=reg;const elotte=JSON.stringify(S.tal);talLoadMigrate({S:{tal:reg}});
    ki.nemNyul=JSON.stringify(S.tal)===elotte;
    S.idx=0;S.seasonNumber=1;
    return ki;});
  console.log("\n— 7. A MENTÉS —");
  ok(s.benne,"a talizmán-állapot (seed, gyűjtemény) a mentésben utazik",s);
  ok(s.futo.done===3&&s.futo.kihagy&&s.futoSor===0,"régi mentés futó idénye: nincs visszamenőleges húzás",s.futo);
  ok(s.nyar.done===0&&!s.nyar.kihagy,"régi mentés nyári állása: az idény teljes ütemezéssel indul",s.nyar);
  ok(s.nemNyul,"talizmános mentésre a migráció nem nyúl");

  /* ---- 8. VALÓDI IDÉNY ---- */
  const v=await p.evaluate(async()=>{
    const ki={};
    S.tal=null;S.seasonNumber=1;S.idx=0;
    const _add=addLine;addLine=()=>{};
    const _atg=autoTitleGate;autoTitleGate=()=>false;
    let csere=0;const _mc=talMsCsere;talMsCsere=function(){const r=_mc.apply(this,arguments);if(r)csere++;return r;};
    const t0=Date.now();
    try{
      S.auto=true;matchSpeed=20;buildSeasonFixtures();
      playMatch();
      let last=-1,stuck=0;
      for(let i=0;i<3000&&S.idx<30;i++){
        await new Promise(r=>setTimeout(r,50));
        if(S.idx===last){if(++stuck>200){if(!S.playing){S.auto=true;try{playMatch();}catch(e){}}stuck=0;}}
        else{stuck=0;last=S.idx;}}
    }finally{S.auto=false;addLine=_add;autoTitleGate=_atg;talMsCsere=_mc;}
    await new Promise(r=>setTimeout(r,500));
    const T=talState();
    ki.idx=S.idx;ki.mp=Date.now()-t0;
    ki.utem=T.varo.filter(x=>x.forras==="utem").length;
    ki.ms=T.varo.filter(x=>x.forras==="ms").length;ki.csere=csere;
    ki.db=T.sz.db;ki.lapok=T.lapok.length;
    ki.due=T.sz.due;
    /* a kézi lánc: az esedékes húzás a meccs után elénk kerül */
    S.tal=null;S.seasonNumber=2;S.idx=0;
    const sz=talSzezon();sz.due=[1,15,25];
    const _add2=addLine;addLine=()=>{};
    try{
      S.auto=false;S.unavailable={};S.lastMatch=null;buildSeasonFixtures();
      playMatch();
      /* a talizmán a lánc VÉGÉN jön: ami előtte döntést kér (jutalom-
         képesség, kémia), azt úgy léptetjük tovább, ahogy a játékos tenné */
      let lep=0;
      for(let i=0;i<800&&$("talDrawModal").classList.contains("hide");i++){
        await new Promise(r=>setTimeout(r,50));
        if(!$("scSkill").classList.contains("hide")&&typeof skillResumeCb==="function"){
          const c=skillResumeCb;skillResumeCb=null;$("scSkill").classList.add("hide");lep++;c();}
        if(!$("scUnlock").classList.contains("hide")){
          const ub=document.querySelector("#unlockActions button");if(ub){lep++;ub.click();}}}
      ki.lep=lep;
    }finally{addLine=_add2;}
    ki.keziAll={idx:S.idx,last:!!S.lastMatch,playing:!!S.playing,mstat:!$("mstatModal").classList.contains("hide"),
      nyitott:[...document.querySelectorAll("[id]")].filter(e=>/Modal$|^sc[A-Z]/.test(e.id)&&!e.classList.contains("hide")).map(e=>e.id).slice(0,8)};
    ki.kezi=!$("talDrawModal").classList.contains("hide");
    ki.keziVaro=talState().varo.length;
    try{$("talDrawLater").click();}catch(e){}
    return ki;});
  console.log("\n— 8. VALÓDI IDÉNY —");
  ok(v.idx===30&&v.utem===3,"végigjátszott idény: pontosan 3 ütemezett húzás áll sorba",v);
  ok(v.ms===v.csere&&v.ms<=2&&v.db===v.utem+v.ms&&v.db<=TAL_PLAFON_PROBA,"a mérföldkő-cserék: legfeljebb 2, és a plafonon belül",v);
  ok(v.lapok===0,"a végigjátszás nem dönt helyetted: a húzások várnak",v.lapok);
  ok(v.kezi&&v.keziVaro===1,"kézi játékban a mérkőzés után a húzás-ablak elénk kerül",v);
  console.log(`  ℹ️  egy idény ${Math.round(v.mp/1000)} mp; ütemezett fordulók: ${v.due.join(", ")}; mérföldkő-csere: ${v.ms}`);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
