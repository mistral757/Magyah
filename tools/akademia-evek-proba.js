/* 🎓 AZ AKADÉMIAI ÉVEK MÉRCÉJE (3.9.134).

   KIMONDOTT TERV: „1 év után a meghívás pillanatában lévő kezdő 11 nyers
   ereje −8…−12, 2 év után −8…−5, 3 év után −4…−2, 4 év után −1/+1 az, amivel
   felhozható, és közben a POT is fejlődik […] mindig a felajánláskor
   vizsgáljuk meg, milyen a POT, és mennyi az aktuális nyers ereje a kezdő
   11-nek."

   A BEJELENTETT ESET: két év után 64 → 77, miközben a legjobb 11 átlaga 100,7.

   Amit mér:
     1. mind a négy évszámnál a felhozott Rating a sávban van, a kezdő 11
        nyers erejéhez (teamStrength) mérve;
     2. a POT dönt a sávon belül: gyenge POT az alján, erős a tetején;
     3. a szabály padló, nem plafon: aki már a cél fölött jár, nem esik vissza;
     4. a mérce a MAI kezdő 11: erősebb csapatnál a cél is feljebb van;
     5. a felhozott fiú tovább fejlődik, de NEM szalad el: öt szezonváltás
        után a csúcsa korlátos (nincs túlteljesítés-pumpa), és a Ratingje
        sosem esik a felhozott szint alá;
     6. a jóslat-doboz a sávot is mutatja (a +1 szezon sora legalább a
        következő év sávjának alja);
     7. VALÓDI felajánlás: a tryAcademyOpportunity alkalmazza, a képernyő
        kiírja a szabályt, a napló a lépést;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9131;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof academyReturnLift==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"az akadémiai évek mércéje létezik (academyReturnLift)");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=5;
    /* a bejelentett helyzet: a kezdő 11 jóval a 100 fölött */
    slots.forEach(sl=>{if(sl.player){sl.player.ovr=103;
      const e=careerPool[sl.player.n];if(e){e.startRating=103;e.peak=103;try{syncAttrsToRating(e);}catch(_){}}}});
    const X=teamStrength();
    ki.X=Math.round(X*10)/10;
    /* egy akadémista, adott korral, Ratinggel, POT-tal */
    const uj=(nev,kor,rating,pot,ev)=>{
      const e={n:nev,pos:["BSZ"],age:kor,startRating:rating,peak:88,basePeak:88,pot,
        youthBonus:6,youthBonusStartAge:kor-ev,formPoints:0};
      initPlayerAttrs(e);careerPool[nev]=e;
      S.academy=(S.academy||[]).filter(r=>r.n!==nev);
      S.academy.push({n:nev,leftAge:kor-ev,leftRating:64,leftSeason:1,offerSeason:1,times:1});
      return S.academy[S.academy.length-1];};

    /* ---- 1-2. A SÁVOK, A POT SZERINT ---- */
    const sav=[null,[-12,-8],[-8,-5],[-4,-2],[-1,1]];
    ki.savok=[];
    [1,2,3,4].forEach(ev=>{
      const gy=academyReturnLift(uj("Gyenge "+ev,17+ev,70,1500,ev));
      const er=academyReturnLift(uj("Erős "+ev,17+ev,70,99000,ev));
      ki.savok.push({ev,sav:sav[ev],gyenge:gy.after-X,eros:er.after-X,
        gyT:Math.round(gy.t*100)/100,erT:Math.round(er.t*100)/100});});
    /* a bejelentett eset: 2 év, POT 3025, 77 */
    const be=academyReturnLift(uj("ifj. Teszt",19,77,3025,2));
    ki.bejelentett={elotte:be.before,utana:be.after,kul:Math.round((be.after-X)*10)/10};

    /* ---- 3. PADLÓ, NEM PLAFON ---- */
    const fent=academyReturnLift(uj("Fenti",19,Math.round(X+3),3000,2));
    ki.fent={elotte:fent.before,utana:fent.after,lifted:fent.lifted};

    /* ---- 4. A MAI KEZDŐ 11 ---- */
    slots.forEach(sl=>{if(sl.player){sl.player.ovr=83;const e=careerPool[sl.player.n];
      if(e){e.startRating=83;e.peak=83;try{syncAttrsToRating(e);}catch(_){}}}});
    const X2=teamStrength();
    const gy2=academyReturnLift(uj("Gyengébb csapat",19,60,3025,2));
    ki.merce={X2:Math.round(X2*10)/10,kul:gy2.after-X2};
    slots.forEach(sl=>{if(sl.player){sl.player.ovr=103;const e=careerPool[sl.player.n];
      if(e){e.startRating=103;e.peak=103;try{syncAttrsToRating(e);}catch(_){}}}});

    /* ---- 5. A TOVÁBBI ÚT: öt szezonváltás ---- */
    const utak=[];
    [["alja",1500],["teteje",99000]].forEach(([cim,pot])=>{
      const r=uj("Út "+cim,19,70,pot,2);
      const L=academyReturnLift(r);
      const e=careerPool[r.n];
      const sor=[e.startRating];
      for(let i=0;i<5;i++){careerAgeStepCore(e,false);sor.push(Math.round(e.startRating));}
      utak.push({cim,felhozva:L.after,sor,peak:Math.round(e.peak),
        csokken:sor.some((v,i)=>i&&v<sor[i-1])});});
    ki.utak=utak;

    /* ---- 6. A JÓSLAT-DOBOZ ---- */
    const jr=uj("Jóslat",18,66,3025,1);
    const jh=academyProjHtml(careerPool[jr.n]);
    const m=[...jh.matchAll(/\+(\d) szezon<\/span><span class="apR">(\d+)/g)].map(x=>({sz:+x[1],r:+x[2]}));
    ki.joslat={sorok:m,also2:Math.round(X-8),merce:/kezdő 11-ed nyers ereje/.test(jh),sav:/−12…−8/.test(jh)};
    return ki;});

  console.log("\n— 1-2. A SÁVOK (kezdő 11 = "+t.X+") —");
  t.savok.forEach(s=>{
    ok(s.gyenge>=s.sav[0]-0.5&&s.gyenge<=s.sav[0]+0.5,`${s.ev} év, gyenge POT: a sáv ALJA (${s.sav[0]})`,s);
    ok(s.eros>=s.sav[1]-0.5&&s.eros<=s.sav[1]+0.5,`${s.ev} év, erős POT: a sáv TETEJE (${s.sav[1]})`,s);});
  ok(t.bejelentett.kul>=-8.5&&t.bejelentett.kul<=-4.5&&t.bejelentett.utana>t.bejelentett.elotte,
     "a bejelentett eset (2 év, POT 3025, 77): a −8…−5 sávba kerül",t.bejelentett);

  console.log("\n— 3-4. PADLÓ ÉS MÉRCE —");
  ok(!t.fent.lifted&&t.fent.utana===t.fent.elotte,"aki már a cél fölött jár, az marad",t.fent);
  ok(t.merce.kul>=-8.5&&t.merce.kul<=-4.5,"gyengébb kezdő 11 mellett a cél is lejjebb van (ugyanaz a sáv)",t.merce);

  console.log("\n— 5. A TOVÁBBI ÚT —");
  t.utak.forEach(u=>{
    ok(!u.csokken&&u.sor[5]>=u.felhozva,`${u.cim}: öt nyár alatt sosem esik a felhozott szint alá`,u.sor);
    ok(u.peak<=u.felhozva+16,`${u.cim}: a csúcs korlátos (nincs pumpa)`,{felhozva:u.felhozva,peak:u.peak,utolso:u.sor[5]});});
  ok(t.utak[1].sor[5]>t.utak[0].sor[5],"az erős POT-ú fiú feljebb ér be",t.utak.map(u=>u.sor[5]));
  ok(t.utak[0].sor[5]>t.utak[0].felhozva,"…és a gyenge is fejlődik még",t.utak[0].sor);

  console.log("\n— 6. A JÓSLAT —");
  ok(t.joslat.merce&&t.joslat.sav,"a doboz a kezdő 11-hez mér, és kimondja a sávokat",t.joslat);
  const s1=t.joslat.sorok.find(x=>x.sz===1);
  ok(s1&&s1.r>=t.joslat.also2-1,"a +1 szezon sora legalább a 2. év sávjának alja",{sorok:t.joslat.sorok,also:t.joslat.also2});

  /* ---- 7. VALÓDI FELAJÁNLÁS ---- */
  const v=await p.evaluate(()=>{
    const ki={};
    const e={n:"Valódi Visszatérő",pos:["BSZ"],age:19,startRating:77,peak:88,basePeak:88,pot:3025,
      youthBonus:6,youthBonusStartAge:17,formPoints:0};
    initPlayerAttrs(e);careerPool[e.n]=e;
    S.academy=[{n:e.n,leftAge:17,leftRating:64,leftSeason:3,offerSeason:3,times:1}];
    S.auto=false;S.idx=4;S.frozenAcademySeasons=0;
    const _r=Math.random;Math.random=()=>0.0;          /* a visszatérés biztos legyen */
    const _tm=tempoMult;tempoMult=()=>1;
    const naplo=[];const _add=addLine;addLine=(h)=>{naplo.push(String(h));};
    try{tryAcademyOpportunity(()=>{});}finally{Math.random=_r;tempoMult=_tm;addLine=_add;}
    const body=document.getElementById("unlockBody");
    ki.cim=(document.getElementById("unlockTitle")||{}).textContent;
    ki.szabaly=body?/kezdő 11-ed nyers erejéhez/.test(body.innerHTML):false;
    ki.rating=Math.round(careerPool[e.n].startRating);
    ki.X=Math.round(teamStrength()*10)/10;
    ki.naplo=naplo.filter(x=>/Akadémia:/.test(x));
    return ki;});
  console.log("\n— 7. VALÓDI FELAJÁNLÁS —");
  ok(/Vissza az akadémiáról/.test(v.cim||""),"a visszatérő felajánlás nyílt meg",v.cim);
  ok(v.rating-v.X>=-8.5&&v.rating-v.X<=-4.5,"a felajánlás pillanatában a sávba hozta",{rating:v.rating,X:v.X});
  ok(v.szabaly,"a képernyő kiírja a szabályt (évek, mérce, sáv)",v.szabaly);
  ok(v.naplo.length===1,"a napló egy sorban rögzíti",v.naplo);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
