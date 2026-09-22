/* 🛒 A BONTOTT ÁLLAPOT ÉS A STÍLUSBOLT (3.9.127).

   KIMONDOTT KÉRÉS: „Tegyük mindegyik csapatstílusnál kidolgozottabbá ezt a
   részt… Legyen jobban elmagyarázva, milyen tényezők adják ki a fő guiding
   pontszámot (esetünkben a viharszint) — itt ötletem: a top 3 leggyorsabb
   sebességattribútumainak összereje az egyik faktor, másik a szélsők
   (védők, középpályások, csatárok) közötti összjáték értékek, sebesség
   skillek… És lehessen mindegyik ilyen stílusnál vásárolni mást is, ne csak
   csapaterőt. Pl itt a villámoknál: sprint mester stábtagnak konkrét
   tapasztalati szintlépést, leglassabb kezdő 11-ben lévő játékosnak extra
   gyorsítást a sebesség edzésre, 1 meccsre szóló sebesség növelő tokent
   (legolcsóbb), ami egy adott posztcsoportban minden játékos sebesség
   attribútumát 5%-kal növeli egy meccs erejéig."

   Amit mér:
     A) A BONTÁS
      1. mind a hat motoros stílusnak négy tényezője van, és az összegük
         betűre az engBaseRaw;
      2. a MÉLYSÉG a régi képlet — külön újraszámolva ugyanaz jön ki;
      3. az ÉL a 85-ös küszöbtől mér, és emberenként/összesen tetőzött;
      4. az ÖSSZJÁTÉK CSAK a stílus kulcsposztjain álló embereket nézi
         (a Villámnál: JV · BV · JSZ · BSZ), és legfeljebb ötöt;
      5. a KÉPESSÉG-tétel a tengely-térképet követi és tetőzött;
      6. ☯️ a Harmónia éle FORDÍTOTT (a rés szűkülése fizet);
      7. EGYIK TÉNYEZŐ SEM FÜGG A FELÁLLÁSTÓL — a slotok felforgatása után
         bitre ugyanaz a szám (ezen áll vagy bukik a keresés gyorsítótára);
     B) A BOLT
      8. mind a hat stílusnak van mind a három tétele, mindnek pozitív árral;
      9. az árak az engScaleT-tel nőnek (a szint ára viszont NEM);
     10. 🎓 a stábtag-szintlépés a MEGFELELŐ típusnak jár, és pontosan egy
         lépcsőt ad (COACH_XP_PER_STEP), a plafonját tiszteletben tartva;
     11. rossz típusú stábtagra nem fizet;
     12. 🏃 az edzés-gyorsítás a kezdő 11 LEGLASSABB emberét találja meg
         (a kapust a Villámnál kihagyva), és a szorzó csak RÁ és csak a
         saját tengelyén él;
     13. a fokozatok tetőznek (ENG_TRAIN_MAX), fölötte a gomb megmondja, miért nem;
     14. ⏱️ a token a VÁLASZTOTT posztcsoportot emeli, mást nem, más tengelyt
         nem — és tényleg átjön a csapat tengelyére (teamAttrStrengths);
     15. egyszerre egy token él, és a lefújás elfogyasztja;
     16. a pontok könyvelése (pts / spent) mindhárom tételnél stimmel;
     17. a panel kirajzolja a négy tényezőt és a három tételt;
     18. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9101;
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
  try{await p.waitForFunction(()=>typeof engBaseParts==="function"
      &&typeof engBuyCoach==="function"&&typeof engBuyTrain==="function"
      &&typeof engBuyToken==="function"&&typeof engTokenMult==="function"
      &&typeof engTrainMult==="function"&&typeof engShopPrice==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a bontás és a bolt függvényei léteznek");
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
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=80;
    try{buildSeasonFixtures();}catch(e){}
    /* A KERET a careerPool-ban: minden kiállított embernek legyen bejegyzése,
       hogy a tengelyértékek valódiak legyenek. */
    slots.forEach(sl=>{
      if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26};
      const e=careerPool[sl.player.n];
      if(!e.pos)e.pos=sl.player.pos.slice();
      if(!e.attrs)initPlayerAttrs(e);});
    /* ---- A FILOZÓFIA: ⚡ VILLÁM ---- */
    S.style={key:"villam",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2=null;
    ki.engKey=engKey();

    /* ---- 1-2. A NÉGY TÉNYEZŐ ÉS A MÉLYSÉG ---- */
    const P=engBaseParts("villam");
    ki.partIds=P.map(x=>x.id);
    ki.osszeg=n1(P.reduce((a,x)=>a+x.v,0));
    ki.baseRaw=engBaseRaw("villam");
    {/* a régi képlet újraszámolva */
     const d=ENG_DEFS.villam,v=[];
     fullCareerRoster().forEach(pl=>{
       const e=careerPool[pl.n];if(!e)return;
       v.push((e.attrs&&e.attrs.seb)||0);});
     v.sort((a,b)=>b-a);
     let s=0;
     v.slice(0,d.men).forEach(sp=>{s+=Math.max(0,Math.min(d.perMan,(sp-d.scaleFrom)/d.perStep));});
     ki.regiMelyseg=n1(s*d.baseScale);
     ki.ujMelyseg=P[0].v;}

    /* ---- 3. AZ ÉL ---- */
    {const nev=fullCareerRoster().map(x=>x.n);
     const ment={};nev.forEach(n=>{ment[n]=careerPool[n].attrs.seb;});
     nev.forEach(n=>{careerPool[n].attrs.seb=80;});
     ki.elNulla=engElRaw("villam");                 /* 85 alatt mindenki → 0 */
     nev.slice(0,3).forEach(n=>{careerPool[n].attrs.seb=200;});
     ki.elTeto=engElRaw("villam");                  /* emberenként 10, hárman → 30 */
     nev.forEach(n=>{careerPool[n].attrs.seb=ment[n];});
     ki.elVissza=engElRaw("villam");}

    /* ---- 4. AZ ÖSSZJÁTÉK KULCSPOSZTJAI ---- */
    {const nevek=engChemNames("villam");
     ki.chemN=nevek.length;
     ki.chemPosztok=nevek.map(n=>((careerPool[n]&&careerPool[n].pos)||[])[0]||"?");
     ki.chemMax=ENG_CHEM_MAX;
     ki.chemErtek=engChemRaw("villam");}

    /* ---- 5. A KÉPESSÉG-TÉTEL ---- */
    {const nev=fullCareerRoster().map(x=>x.n);
     ki.skillNulla=engSkillRaw("villam");
     /* tíz kész sebesség-képesség: a tengely-térkép szerint "pace" → seb */
     const pace=SKILLS.filter(sk=>sk.type==="pace"
       ||(sk.combo||[]).some(c=>c.type==="pace"))[0];
     ki.paceVan=!!pace;
     if(pace)nev.slice(0,10).forEach(n=>{S.skills[n]=[{skillId:pace.id,skill:pace}];});
     ki.skillTeto=engSkillRaw("villam");
     /* és egy MÁSIK tengelyé nem számít bele */
     nev.slice(0,10).forEach(n=>{delete S.skills[n];});
     const gol=SKILLS.filter(sk=>sk.type==="goalw")[0];
     if(gol)nev.slice(0,10).forEach(n=>{S.skills[n]=[{skillId:gol.id,skill:gol}];});
     ki.skillIdegen=engSkillRaw("villam");
     nev.slice(0,10).forEach(n=>{delete S.skills[n];});}

    /* ---- 6. ☯️ A HARMÓNIA FORDÍTOTT ÉLE ---- */
    ki.harmEl=(typeof harmoniaEngEl==="function")?harmoniaEngEl():null;
    ki.harmElFv=(typeof ENG_DEFS.harmonia.el==="function");
    ki.harmSkillAxis=ENG_DEFS.harmonia.skillAxis;

    /* ---- 7. FELÁLLÁS-FÜGGETLENSÉG ---- */
    {const elotte=engBaseRaw("villam");
     const ment=slots.map(sl=>sl.player);
     slots.forEach((sl,i)=>{sl.player=ment[(i+5)%ment.length];});
     const kozben=engBaseRaw("villam");
     slots.forEach((sl,i)=>{sl.player=ment[i];});
     const utana=engBaseRaw("villam");
     ki.fuggetlen=[elotte,kozben,utana];}

    /* ---- 8-9. A BOLT TÉTELEI ÉS AZ ÁRAK ---- */
    ki.boltok={};
    Object.keys(ENG_DEFS).forEach(kk=>{
      const B=ENG_DEFS[kk].buy||{};
      ki.boltok[kk]={coach:!!(B.coach&&B.coach.length),train:!!B.trainN,tok:!!B.tokN,
        part:!!ENG_DEFS[kk].partD};});
    ki.arSorrend=[engShopPrice("villam","token"),engShopPrice("villam","train"),
                  engShopPrice("villam","coach")];
    {/* az ár a tarifával nő: az állapot-szintet megemelve újramérünk */
     const elotte=engShopPrice("villam","token"),sc0=engScaleT("villam");
     const ment=ENG_DEFS.villam.baseScale;
     ENG_DEFS.villam.baseScale=ment*4;
     const utana=engShopPrice("villam","token"),sc1=engScaleT("villam");
     ENG_DEFS.villam.baseScale=ment;
     ki.arSkala=[elotte,utana,n1(sc0),n1(sc1)];
     ki.szintArFix=[ENG_PRICE[1],engNextPrice("villam")];}

    /* ---- 10-11. 🎓 A STÁBTAG-SZINTLÉPÉS ---- */
    const E=engState("villam");
    E.pts=100000;E.spent=0;
    S.staff=[{n:"Gyors Géza",type:"attr:seb",sz:50,szBase:50,xp:0,age:40,since:1,attrKey:"seb"},
             {n:"Kapus Kázmér",type:"attr:kapus",sz:50,szBase:50,xp:0,age:40,since:1,attrKey:"kapus"}];
    ki.coachLista=engCoachList("villam").map(x=>x.c.n);
    {const elottePts=E.pts,ar=engShopPrice("villam","coach");
     const r=engBuyCoach("villam",0);
     ki.coachVesz={n:r&&r.n,elotte:r&&r.elotte,utana:r&&r.utana,
       xp:S.staff[0].xp,koltseg:n1(elottePts-E.pts),ar:ar,spent:E.spent};}
    {const elottePts=E.pts;
     const r=engBuyCoach("villam",1);     /* rossz típus */
     ki.coachRossz={r:r,valtozatlan:E.pts===elottePts,sz:S.staff[1].sz};}
    {/* a plafon: annyi lépcsőt veszünk, hogy elérje */
     for(let i=0;i<40;i++)engBuyCoach("villam",0);
     ki.coachTeto=[S.staff[0].sz,coachSzCap(S.staff[0])];}

    /* ---- 12-13. 🏃 AZ EDZÉS-GYORSÍTÁS ---- */
    E.pts=100000;E.spent=0;delete E.tb;
    {/* a kapust tesszük a leglassabbá — a Villámnál mégsem őt kell választania */
     slots.forEach(sl=>{if(sl.player&&careerPool[sl.player.n])careerPool[sl.player.n].attrs.seb=90;});
     const gk=slots.find(sl=>sl.pos==="KP");
     if(gk&&gk.player)careerPool[gk.player.n].attrs.seb=10;
     const lassu=slots.filter(sl=>sl.player&&sl.pos!=="KP")[3];
     if(lassu)careerPool[lassu.player.n].attrs.seb=55;
     const cel=engTrainTarget("villam");
     ki.trainCel={cel:cel&&cel.n,kell:lassu&&lassu.player.n,key:cel&&cel.key,
       kapus:gk&&gk.player.n};
     const r=engBuyTrain("villam");
     ki.trainVesz={n:r&&r.n,lvl:r&&r.lvl,spent:E.spent,ar:r&&r.ar};
     ki.trainSzorzo=[
       engTrainMult(cel.n,"seb"),                       /* 1.25 */
       engTrainMult(cel.n,"gol"),                       /* 1 — más tengely */
       engTrainMult(gk&&gk.player.n,"seb")];            /* 1 — más ember */
     for(let i=0;i<6;i++)engBuyTrain("villam");
     ki.trainTeto=[E.tb.lvl,ENG_TRAIN_MAX,engTrainMult(cel.n,"seb")];
     ki.trainBaj=engTrainWhy("villam");}

    /* ---- 14-15. ⏱️ A TOKEN ---- */
    E.pts=100000;E.spent=0;delete E.tok;
    {const csop=ENG_TOKEN_GROUPS.map(g=>g.k);
     ki.tokCsoportok=csop;
     const r=engBuyToken("villam","VEDO");
     ki.tokVesz={g:r&&r.g,ar:r&&r.ar,spent:E.spent};
     ki.tokSzorzo={
       vedoSeb:engTokenMult("JV","seb"),        /* 1.05 */
       vedoGol:engTokenMult("JV","gol"),        /* 1 — nem a stílus tengelye */
       csatarSeb:engTokenMult("CS","seb"),      /* 1 — más posztcsoport */
       kapusSeb:engTokenMult("KP","seb")};      /* 1 — a kapus nem védő-csoport */
     ki.tokMasodik=engBuyToken("villam","CSATAR");   /* null: egyszerre egy */
     ki.tokBaj=engTokenWhy("villam","CSATAR");
     /* a csapat tengelyére tényleg átjön */
     delete E.tok;
     const nelkul=teamAttrStrengths().seb;
     engBuyToken("villam","VEDO");
     const vele=teamAttrStrengths().seb;
     ki.tengely=[n1(nelkul),n1(vele),vele>nelkul];
     /* a lefújás elfogyasztja */
     ki.tokElfogy=[engTokenSpend(),engTokenSpend(),!!engTokenState()];}

    /* ---- 16. A PANEL ---- */
    {const html=engSectionHtml();
     ki.panel={melyseg:html.indexOf("Mélység")>=0,
       el:html.indexOf(ENG_DEFS.villam.elN)>=0,
       chem:html.indexOf(ENG_DEFS.villam.chemN)>=0,
       skill:html.indexOf(ENG_DEFS.villam.skillN)>=0,
       coach:html.indexOf(ENG_DEFS.villam.buy.coachN)>=0,
       train:html.indexOf(ENG_DEFS.villam.buy.trainN)>=0,
       tok:html.indexOf(ENG_DEFS.villam.buy.tokN)>=0,
       gomb:html.indexOf('data-engshop="train"')>=0};}
    return ki;});

  console.log("\n— A BONTÁS —");
  ok(t.engKey==="villam","a ⚡ Villám motorja fut",t.engKey);
  ok(JSON.stringify(t.partIds)===JSON.stringify(["melyseg","el","chem","skill"]),
     "négy nevesített tényező, ebben a sorrendben",t.partIds);
  ok(kozel(t.osszeg,t.baseRaw,0.11),"a négy tényező összege = engBaseRaw",[t.osszeg,t.baseRaw]);
  ok(kozel(t.ujMelyseg,t.regiMelyseg,0.11),"a MÉLYSÉG betűre a régi képlet",[t.ujMelyseg,t.regiMelyseg]);
  ok(t.elNulla===0,"az ÉL nulla, ha senki sincs 85 fölött",t.elNulla);
  ok(kozel(t.elTeto,30,0.01),"az ÉL tetőzött: 3 ember × 10 egység",t.elTeto);
  ok(t.chemN>0&&t.chemN<=5,"az ÖSSZJÁTÉK legfeljebb öt embert néz",t.chemN);
  ok(t.chemPosztok.every(x=>["JV","BV","JSZ","BSZ"].indexOf(x)>=0),
     "…és CSAK a Villám kulcsposztjairól",t.chemPosztok);
  ok(t.chemErtek>=0&&t.chemErtek<=t.chemMax,"az ÖSSZJÁTÉK a saját plafonján belül",[t.chemErtek,t.chemMax]);
  ok(t.paceVan&&t.skillTeto>t.skillNulla,"a KÉPESSÉG-tétel nő a tengelyre eső skillektől",
     [t.skillNulla,t.skillTeto]);
  ok(t.skillTeto<=18.01,"…és tetőzött (ENG_SKILL_MAX)",t.skillTeto);
  ok(t.skillIdegen===t.skillNulla,"…idegen tengely skilljei nem számítanak",
     [t.skillNulla,t.skillIdegen]);
  ok(t.harmElFv&&t.harmEl!==null,"☯️ a Harmóniának saját, fordított éle van",t.harmEl);
  ok(t.harmSkillAxis==="*","☯️ …és nem válogat tengelyt a képességeknél",t.harmSkillAxis);
  ok(t.fuggetlen[0]===t.fuggetlen[1]&&t.fuggetlen[1]===t.fuggetlen[2],
     "EGYIK tényező sem függ a felállástól",t.fuggetlen);

  console.log("\n— A BOLT —");
  {const hianyzo=Object.keys(t.boltok).filter(k=>!(t.boltok[k].coach&&t.boltok[k].train
      &&t.boltok[k].tok&&t.boltok[k].part));
   ok(hianyzo.length===0,"mind a hat stílusnak megvan a bontása és a három tétele",hianyzo);}
  ok(t.arSorrend[0]<t.arSorrend[1]&&t.arSorrend[1]<t.arSorrend[2],
     "a token a legolcsóbb, a stábtag a legdrágább",t.arSorrend);
  ok(t.arSkala[1]>t.arSkala[0]&&t.arSkala[3]>t.arSkala[2],
     "a bolt ára a tarifával együtt nő (engScaleT)",t.arSkala);
  ok(t.szintArFix[0]===t.szintArFix[1],"…a SZINT ára viszont fix marad",t.szintArFix);

  console.log("\n— 🎓 STÁBTAG-SZINTLÉPÉS —");
  ok(t.coachLista.length===1&&t.coachLista[0]==="Gyors Géza",
     "csak a stílushoz illő típus kerül a listára",t.coachLista);
  ok(t.coachVesz.utana===t.coachVesz.elotte+1&&t.coachVesz.xp===2,
     "egy vásárlás = egy Szakértelem-lépcső (COACH_XP_PER_STEP)",t.coachVesz);
  ok(kozel(t.coachVesz.koltseg,t.coachVesz.ar,0.01)&&kozel(t.coachVesz.spent,t.coachVesz.ar,0.01),
     "…és pontosan az ára fogy, könyvelve",t.coachVesz);
  ok(t.coachRossz.r===null&&t.coachRossz.valtozatlan&&t.coachRossz.sz===50,
     "rossz típusú stábtagra nem fizet",t.coachRossz);
  ok(t.coachTeto[0]===t.coachTeto[1],"…és a belépéskori plafont tiszteletben tartja",t.coachTeto);

  console.log("\n— 🏃 EDZÉS-GYORSÍTÁS —");
  ok(t.trainCel.cel===t.trainCel.kell,"a kezdő 11 LEGLASSABB emberét találja meg",t.trainCel);
  ok(t.trainCel.cel!==t.trainCel.kapus&&t.trainCel.key==="seb",
     "…a kapust kihagyva, a stílus tengelyén",t.trainCel);
  ok(kozel(t.trainSzorzo[0],1.25,0.001),"egy fokozat = +25% fejlődés",t.trainSzorzo[0]);
  ok(t.trainSzorzo[1]===1&&t.trainSzorzo[2]===1,
     "…és CSAK rá, CSAK a saját tengelyén",t.trainSzorzo);
  ok(t.trainTeto[0]===t.trainTeto[1]&&kozel(t.trainTeto[2],2,0.001),
     "a fokozatok tetőznek (ENG_TRAIN_MAX)",t.trainTeto);
  ok(!!t.trainBaj,"…és a gomb megmondja, miért nem megy tovább",t.trainBaj);

  console.log("\n— ⏱️ AZ EGY MECCSRE SZÓLÓ TOKEN —");
  ok(JSON.stringify(t.tokCsoportok)===JSON.stringify(["KAPUS","VEDO","KOZEPPALYAS","CSATAR"]),
     "négy posztcsoport választható",t.tokCsoportok);
  ok(t.tokVesz.g==="VEDO"&&kozel(t.tokVesz.spent,t.tokVesz.ar,0.01),
     "a vétel könyvelve",t.tokVesz);
  ok(kozel(t.tokSzorzo.vedoSeb,1.05,0.001),"a választott csoport sebessége +5%",t.tokSzorzo.vedoSeb);
  ok(t.tokSzorzo.vedoGol===1&&t.tokSzorzo.csatarSeb===1&&t.tokSzorzo.kapusSeb===1,
     "…más tengelyre és más csoportra nem hat",t.tokSzorzo);
  ok(t.tokMasodik===null&&!!t.tokBaj,"egyszerre EGY token él",t.tokBaj);
  ok(t.tengely[2],"a token tényleg átjön a csapat sebesség-tengelyére",t.tengely);
  ok(t.tokElfogy[0]==="VEDO"&&t.tokElfogy[1]===null&&t.tokElfogy[2]===false,
     "a lefújás elfogyasztja, és csak egyszer",t.tokElfogy);

  console.log("\n— A PANEL —");
  {const h=Object.keys(t.panel).filter(k=>!t.panel[k]);
   ok(h.length===0,"a panel kirajzolja a négy tényezőt és a három tételt",h);}
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
