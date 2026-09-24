/* 🎯 CSUPA ÉK + A 4-2-4 KINYITÁSA A BOMBÁZÓKNÁL (3.9.136).

   KIMONDOTT KÉRÉS:
     „A 4-2-4 kinyitás képességét a bombázók csapatstílushoz tegyük át.
      És legyen egy új képesség a bombázóknál, ami lvl1 lehetővé teszi, hogy
      3 támadóból 2 középcsatár legyen, 4-ből pedig 3, lvl2 3-ból 3 és 4-ből 4,
      lvl3 kinyílik az ultra csatár pozíció: 1 csatárod lehet ilyen pozícióban,
      gólesély jelentősen nő neki, de a csapat elleni gólesély is nő, minél
      magasabb annak a játékosnak a védekezési attribútuma (arányaiban a
      többiekhez képest) annál jobban […] Max +10% min. +3%"

   Amit mér:
     1. az „Olcsó totális futball" a Bombázóké, a Villámé már nem — és hat;
     2. a Villámban megvett szintek pontja betöltéskor egyszer visszajár;
     3. 4-3-3 (3 támadó): képesség nélkül a szélső nem lehet középcsatár; 1.
        szinten egy igen, a második nem; 2. szinten mind a három;
     4. 4-2-4 (4 támadó): 1. szinten 3, 2. szinten 4 középcsatár;
     5. a képesség elvesztésével a megbízás némán visszaáll;
     6. ultra csatár: csak 3. szinten és csak középcsatár-helyen él; a
        gólsúlya ×1,8; az ára +3%…+10% a Védekezés-arány szerint, és benne
        van az alakzat árában (a motor ebből számol);
     7. a választó felkínálja a középcsatárt és az ultra kapcsolót;
     8. VALÓDI MECCSEKEN az ultra csatár a csapat góljainak nagyobb részét
        szerzi, mint ugyanaz az ember ultra nélkül;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9139;
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
  try{await p.waitForFunction(()=>typeof atkCsMax==="function"&&typeof ultraCost==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a Csupa ék függvényei léteznek");
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
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";
    const mk=(k,tr)=>({key:k,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});

    /* ---- 1. A KÖLTÖZÉS ---- */
    ki.fa={bomb:styleTraitList("bombazok").some(x=>x.key==="olcso_totalis"),
      villam:styleTraitList("villam").some(x=>x.key==="olcso_totalis"),
      csupa:styleTraitList("bombazok").some(x=>x.key==="csupa_ek")};
    S.style=mk("bombazok",{olcso_totalis:3});S.style2=null;
    ki.fa.kedv=styleFormDiscount();
    S.style=mk("villam",{olcso_totalis:3});
    ki.fa.villamKedv=styleFormDiscount();

    /* ---- 2. A VISSZATÉRÍTÉS ---- */
    S.style=mk("villam",{olcso_totalis:2,gyorsabb_izomzat:1});
    const W=msState();W.sp=5;S.traitMoveDone=null;
    const _add=addLine;const naplo=[];addLine=(h)=>naplo.push(String(h));
    try{styleTraitMoveMigrate();ki.vissza={sp:W.sp,maradt:S.style.traits.olcso_totalis,masik:S.style.traits.gyorsabb_izomzat};
      styleTraitMoveMigrate();ki.vissza.masodszor=W.sp;}finally{addLine=_add;}
    ki.vissza.naplo=naplo.length;
    ki.vissza.varas=5+STYLE_TRAIT_PRICE[2][0]+STYLE_TRAIT_PRICE[2][1];

    /* ---- a keret: felállás beállítása ---- */
    const allit=f=>{
      form=f;slotRoles={};S.ultraSlot=null;
      slots=FORMS[f].slots.map((pp,i)=>({pos:effectiveSlotPos(f,i),xy:slotXY(f,i),player:null,fit:1,origin:null}));
      slots.forEach((sl,i)=>{
        const src=sq.players[i%sq.players.length];
        const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};
        sl.player=pl;sl.fit=1;
        if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
        const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});};
    const szelsok=f=>atkLineSlots(f).filter(i=>FORMS[f].slots[i]!=="CS");

    /* ---- 3. 4-3-3 ---- */
    allit("433");
    const w433=szelsok("433");
    S.style=mk("bombazok",{});
    ki.f433={szelsok:w433.length,max0:atkCsMax("433"),opt0:slotRoleOptions("433",w433[0]).includes("CS"),
      set0:setSlotRole("433",w433[0],"CS")};
    S.style=mk("bombazok",{csupa_ek:1});
    ki.f433.max1=atkCsMax("433");
    ki.f433.elso=setSlotRole("433",w433[0],"CS");
    ki.f433.masodik=setSlotRole("433",w433[1],"CS");
    ki.f433.cs1=atkCsNow("433");
    ki.f433.eff=effectiveSlotPos("433",w433[0]);
    S.style=mk("bombazok",{csupa_ek:2});
    ki.f433.max2=atkCsMax("433");
    ki.f433.masodik2=setSlotRole("433",w433[1],"CS");
    ki.f433.cs2=atkCsNow("433");
    /* ---- 5. képesség nélkül visszaáll ---- */
    S.style=mk("villam",{});
    ki.f433.nelkul={eff:effectiveSlotPos("433",w433[0]),cs:atkCsNow("433")};

    /* ---- 4. 4-2-4 ---- */
    allit("424");
    const w424=szelsok("424");
    S.style=mk("bombazok",{csupa_ek:1});
    ki.f424={max1:atkCsMax("424"),a:setSlotRole("424",w424[0],"CS"),b:setSlotRole("424",w424[1],"CS"),cs1:atkCsNow("424")};
    S.style=mk("bombazok",{csupa_ek:2});
    ki.f424.max2=atkCsMax("424");ki.f424.b2=setSlotRole("424",w424[1],"CS");ki.f424.cs2=atkCsNow("424");

    /* ---- 6. ULTRA ---- */
    allit("433");
    const csI=atkLineSlots("433").find(i=>FORMS["433"].slots[i]==="CS");
    const vedI=slots.findIndex(sl=>sl.pos==="KV");
    S.style=mk("bombazok",{csupa_ek:2});
    S.ultraSlot={f:"433",i:csI};
    ki.ultra={lv2:ultraIdx("433")};
    S.style=mk("bombazok",{csupa_ek:3});
    ki.ultra.lv3=ultraIdx("433");ki.ultra.csI=csI;
    ki.ultra.suly=ultraGoalMult(csI);ki.ultra.masik=ultraGoalMult(vedI);
    const ae=careerPool[slots[csI].player.n];
    const setVed=v=>{ae.attrs.ved=v;};
    const alak0=(()=>{const r=S.ultraSlot;S.ultraSlot=null;const m=shapeOppMult();S.ultraSlot=r;return m;})();
    setVed(10);const lo=ultraCost("433");const mLo=shapeOppMult();
    /* a sáv teteje: a többiek gyenge védekezők (arány ≥ 1,5) */
    const regiVed={};
    slots.forEach((sl,j)=>{if(j===csI||!sl.player)return;const e=careerPool[sl.player.n];regiVed[j]=e.attrs.ved;e.attrs.ved=40;});
    setVed(99);const hi=ultraCost("433");const mHi=shapeOppMult();
    slots.forEach((sl,j)=>{if(regiVed[j]!=null)careerPool[sl.player.n].attrs.ved=regiVed[j];});
    ki.ultra.ar={lo:Math.round(lo.cost*1000)/1000,loR:Math.round(lo.ratio*100)/100,
      hi:Math.round(hi.cost*1000)/1000,hiR:Math.round(hi.ratio*100)/100,
      alak:{nelkul:alak0,lo:mLo,hi:mHi}};
    setVed(50);
    /* nem középcsatár-helyen nem él */
    S.ultraSlot={f:"433",i:vedI};ki.ultra.vedon=ultraIdx("433");
    S.ultraSlot={f:"433",i:csI};

    /* ---- 7. A VÁLASZTÓ ---- */
    try{
      _midRoleSlotIdx=csI;renderHubMidRolePicker();
      ki.ui={ultraGomb:/Ultra csatár/.test(document.getElementById("hubMidRoleBody").innerHTML)};
      _midRoleSlotIdx=szelsok("433")[0];renderHubMidRolePicker();
      ki.ui.csOpcio=/Középcsatár/.test(document.getElementById("hubMidRoleBody").innerHTML);
    }catch(e){ki.ui={hiba:e.message};}
    return ki;});

  console.log("\n— 1-2. A KÖLTÖZÉS —");
  ok(t.fa.bomb&&!t.fa.villam&&t.fa.csupa,"az Olcsó totális futball és a Csupa ék a Bombázók fáján, a Villámén már nincs",t.fa);
  ok(Math.abs(t.fa.kedv-0.5)<1e-9&&t.fa.villamKedv===1,"a Bombázóknál −50%-ot ad, a Villám régi szintje már semmit",t.fa);
  ok(t.vissza.sp===t.vissza.varas&&t.vissza.maradt===undefined&&t.vissza.masik===1,
     "a Villámban megvett 2 szint pontja visszajár, a többi képesség érintetlen",t.vissza);
  ok(t.vissza.masodszor===t.vissza.sp&&t.vissza.naplo===1,"egyszer fut, és a napló szól",t.vissza);

  console.log("\n— 3-5. KÖZÉPCSATÁROK —");
  const a=t.f433;
  ok(a.szelsok===2&&a.max0===1&&!a.opt0&&!a.set0,"4-3-3, képesség nélkül: a szélső nem lehet középcsatár",a);
  ok(a.max1===2&&a.elso&&!a.masodik&&a.cs1===2&&a.eff==="CS","1. szint: 3 támadóból 2 középcsatár, a harmadik nem",a);
  ok(a.max2===3&&a.masodik2&&a.cs2===3,"2. szint: 3-ból 3",a);
  ok(a.nelkul.eff!=="CS"&&a.nelkul.cs===1,"a képesség nélkül a megbízás visszaáll",a.nelkul);
  const c=t.f424;
  ok(c.max1===3&&c.a&&!c.b&&c.cs1===3,"4-2-4, 1. szint: 4-ből 3",c);
  ok(c.max2===4&&c.b2&&c.cs2===4,"4-2-4, 2. szint: 4-ből 4",c);

  console.log("\n— 6-7. ULTRA CSATÁR —");
  const u=t.ultra;
  ok(u.lv2===-1&&u.lv3===u.csI,"csak a 3. szinten él",u);
  ok(u.suly===1.8&&u.masik===1,"az ő gólsúlya ×1,8, a többieké változatlan",u);
  ok(Math.abs(u.ar.lo-0.03)<1e-9&&Math.abs(u.ar.hi-0.10)<1e-9,"az ára +3% (gyenge védekező) … +10% (erős védekező)",u.ar);
  ok(u.ar.alak.hi>u.ar.alak.lo&&u.ar.alak.lo>u.ar.alak.nelkul,"az ár benne van az alakzat szorzójában (a motor ebből számol)",u.ar.alak);
  ok(u.vedon===-1,"nem középcsatár-helyen nem kapcsol be",u.vedon);
  ok(t.ui&&t.ui.ultraGomb&&t.ui.csOpcio,"a választó felkínálja a középcsatárt és az ultra kapcsolót",t.ui);

  /* ---- 8. VALÓDI MECCSEK ---- */
  const m=await p.evaluate(async()=>{
    S.auto=false;matchSpeed=20;S.halftimeSubs=false;
    phase="season";S.idx=0;buildSeasonFixtures();
    const csI=S.ultraSlot.i,nev=slots[csI].player.n;
    const _add=addLine;addLine=()=>{};
    /* A MOTOR KÉRDEZI-E? A gólszerző-választás minden jelöltre meghívja az
       ultraGoalMult-ot — megszámoljuk, hányszor adott ×1,8-at, és kinek. */
    const ug={hivas:0,ultra:0,rossz:0};
    const _ugm=ultraGoalMult;
    ultraGoalMult=function(i){const r=_ugm(i);ug.hivas++;if(r>1){ug.ultra++;if(i!==csI)ug.rossz++;}return r;};
    /* a saját gólok EGYETLEN csatornája a recordScorer — azt számoljuk */
    let osszes=0,ove=0;
    const _rs=recordScorer;
    recordScorer=function(n){osszes++;if(n===nev)ove++;return _rs.apply(this,arguments);};
    const lejatsz=async(N)=>{
      osszes=0;ove=0;
      for(let k=0;k<N;k++){
        S.unavailable={};S.lastMatch=null;S.idx=k%10;
        playMatch();
        for(let i=0;i<200&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));}
      return {osszes,ove,arany:osszes?ove/osszes:0,vegig:!!S.lastMatch};};
    let res={};
    try{
      const reg=S.ultraSlot;
      S.ultraSlot=null;res.nelkul=await lejatsz(40);
      const u0=ug.ultra;
      S.ultraSlot=reg;res.vele=await lejatsz(40);
      res.ultraNelkul=u0;
    }finally{addLine=_add;recordScorer=_rs;ultraGoalMult=_ugm;}
    res.ug=ug;
    return res;});
  console.log("\n— 8. VALÓDI MECCSEK —");
  ok(m.nelkul.osszes>0&&m.vele.osszes>0,"a meccsek lementek, gólokkal",m);
  ok(m.ultraNelkul===0&&m.ug.ultra>0&&m.ug.rossz===0,
     "a meccsmotor gólszerző-választása az ultra helyre ×1,8-at kap — csak arra, és csak ha él",m.ug);
  /* TÁJÉKOZTATÓ, nem bukó állítás: 40 meccsnyi minta szórása még nagy (egy
     próbafutásban ugyanaz a csatár ultra nélkül 21% és 44% között szórt). */
  console.log(`  ℹ️  gólarány 40-40 meccsen: ultra nélkül ${Math.round(m.nelkul.arany*100)}% (${m.nelkul.ove}/${m.nelkul.osszes}), `
    +`ultraként ${Math.round(m.vele.arany*100)}% (${m.vele.ove}/${m.vele.osszes})`);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
