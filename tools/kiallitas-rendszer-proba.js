/* 🟥 A KIÁLLÍTÁS NÉGY ÜGYE (3.9.97).

   NÉGY KIMONDOTT KÉRÉS, egy tőről:
     1. „Akit kiállítanak, annak a játszott percei a kiállításig számítsanak,
        de maga az értékelés legyen hasonlóan magas panzerkampfwagen mellett,
        ha kiállítás volt… Ott jutalmazni kell azt aki ilyen kemény."
     2. „A második kiállítás kommentárjánál már ne azt írja, hogy 10en
        maradtunk. Harmadik kiállításnál se."
     3. „Legyen külön mérföldkő az egy meccsen kapott kiállítások számára és
        arra, hogy hány emberrel a pályán tudtunk meccset nyerni."
     4. „Az 5. kiállítás után elvesztjük a meccset automatikusan."

   A KÖZÖS GYÖKÉR: a motor EGYETLEN kiállítást ismert egy mérkőzésen. A
   `redIdx` egy szám volt, és a második kiállítás FELÜLÍRTA az elsőt — emiatt
   a napló a második lapnál is „tízen maradtunk"-at írt, az első kiállított
   visszakerült a sorsolásokba (a 24. percben lement ember a 80.-ban gólt
   lőhetett), az eltiltását sem könyvelte el senki, és azt sem lehetett
   megmondani, hány kiállítást kaptunk — tehát mérföldkövet sem lehetett rá
   építeni. A javítás gerince ezért egy kiállítás-HALMAZ.

   Amit mér:
     1. a kiállított percei a kiállításig számítanak (a lapján is);
     2. …de Panzer lap-építésénél az ÉRTÉKELÉSÉT ez nem húzza le;
     3. a létszám-szöveg a tényleges létszámot mondja (tízen · kilencen · …);
     4. MINDEN kiállított eltiltást kap, nem csak az utolsó;
     5. a két új mérföldkő-család méri a meccs kiállításait és azt, hányan
        nyertük meg;
     6. az ötödik kiállításnál a mérkőzés lefújva, és bemondott vereség;
     7. …de párharcban sosem (ott a közös eseménylista a szerződés). */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9051'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9051/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof redHas==="function"&&typeof menLeftWord==="function"
    &&typeof mstatRedFullMin==="function"&&typeof redCardLine==="function",
    null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";

    /* ---- 1-2. A PERCEK ÉS AZ ÉRTÉKELÉS ---- */
    /* Ugyanaz a sor kétszer: egyszer Panzer lap-építéssel, egyszer anélkül.
       Így a mérés a KÜLÖNBSÉGRŐL szól, nem egy abszolút számról. */
    const sor=(share,redMin)=>({
      pl:{n:"Kemény Kálmán",ovr:80,pos:["KV"]},pos:"KV",defPos:"KV",
      share,red:true,redMin,yc:1,g:0,a:0,mvp:false,
      sv:0,svBig:0,svSolo:0,svPen:0,bl:0,lc:0,cl:0,ct:0,sp:0,pr:0,
      sh:0,son:0,sbk:0,kp:0,spt:0});
    const ctx={gf:1,ga:0,cls:"win",home:true,teamAvg:80,oppOvr:78,
      saveCount:0,tacticKey:null,styleKey:"panzer",styleStar:null};
    const mer=(pz)=>{
      S.style=pz?{key:"panzer",traits:{pz_abs:3}}:{key:"beton",traits:{}};
      S.style2=null;
      const teljes=mstatRate(sor(1,52),ctx);
      const vagott=mstatRate(sor(52/90,52),ctx);
      const korai=mstatRate(sor(10/90,10),ctx);
      return {epit:pzCardsBuild(),alap:MSTAT_BASE,
        teljes:teljes.v,vagott:vagott.v,
        korai:korai.v,koraiRated:korai.rated,
        perc90:mstatMinutes(1),perc52:mstatMinutes(52/90)};};
    ki.pz=mer(true);
    ki.nem=mer(false);
    S.style={key:"panzer",traits:{pz_abs:3}};

    /* ---- 3. A LÉTSZÁM-SZÖVEG ---- */
    ki.szo={t11:menLeftWord(11),t10:menLeftWord(10),t9:menLeftWord(9),
      t8:menLeftWord(8),t7:menLeftWord(7)};
    /* A piroslap-sor tíz emberrel a klasszikus, kilenccel MÁS készletből jön. */
    const sorok=n=>{const o=new Set();
      for(let i=0;i<60;i++)o.add(redCardLine("Kemény Kálmán",n));
      return [...o];};
    const s10=sorok(10),s9=sorok(9),s8=sorok(8);
    ki.lap={
      tizNemMondKilencet:!s10.some(x=>/kilencen|nyolcan|heten/.test(x)),
      kilencNemMondTizet:!s9.some(x=>/[Tt]ízen/.test(x)),
      kilencMondKilencet:s9.some(x=>/kilencen|Kilencen/.test(x)),
      nyolcMondNyolcat:s8.some(x=>/nyolcan|Nyolcan/.test(x))};

    /* ---- 4. A redHas MINDKÉT ALAKOT ÉRTI ---- */
    ki.redHas={szam:[redHas(3,3),redHas(3,4),redHas(-1,0)],
      halmaz:[redHas(new Set([1,5]),5),redHas(new Set([1,5]),2)],
      ures:redHas(null,0)};

    /* ---- 5. A KÉT ÚJ MÉRFÖLDKŐ-CSALÁD ---- */
    const csal=k=>(STYLE_MILESTONES.panzer||[]).filter(d=>d.fam===k);
    const rc=csal("pz_rcmatch"),wm=csal("pz_winmen");
    S.msTrack=S.msTrack||{};
    const T=msT();
    T.maxMatchRed=0;T.maxWinShort=0;
    const ert=d=>d.p();
    const nulla={rc:rc.map(ert),wm:wm.map(ert)};
    T.maxMatchRed=3;T.maxWinShort=2;
    ki.mk={rcDb:rc.length,wmDb:wm.length,
      rcCim:rc.map(d=>d.t),wmCim:wm.map(d=>d.t),
      rcKuszob:rc.map(d=>d.n),wmKuszob:wm.map(d=>d.n),
      nulla,
      utana:{rc:rc.map(ert),wm:wm.map(ert)}};
    return ki;});

  /* ================= ÉLŐ MECCSEK =================
     A fenti szakaszok egységeket mérnek; a refaktor kockázata viszont a
     MOTORBAN van — ott, ahol a `redIdx` egyetlen számából halmaz lett. Ez a
     rész ezért VALÓDI mérkőzéseket játszik le, garantált kiállításokkal. */
  const elo=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
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
    if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    /* EGY meccset akarunk, nem egy szezont: az auto mód végigjátszaná az
       egészet. A tempó-csúszka viszont felhúzható, tehát a tick így is
       néhány ezredmásodperc. */
    S.auto=false;matchSpeed=20;
    phase="season";
    buildSeasonFixtures();
    S.style={key:"panzer",traits:{pz_abs:3}};S.style2=null;

    const naplo=[];
    const _add=addLine;
    addLine=(t,c)=>{naplo.push(String(t));};

    /* EGY MECCS LEJÁTSZÁSA, `db` garantált kiállítással. A kiállítást nem
       véletlenre bízzuk: a piroslap-esélyt tekerjük fel, és a `kiallit`
       hívásait számoljuk — így a mérés determinisztikus. */
    const meccs=async()=>{
      const _redp=SIM.REDP;
      SIM.REDP=40;                      /* minden vödörben biztos lap, amíg lehet */
      S.unavailable={};S.playerReds={};
      S.lastMatch=null;
      playMatch();
      /* 18 tick × ~17 ms; bőven hagyunk rá időt (a lefújás utáni lánc is fut) */
      for(let i=0;i<120&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,60));
      SIM.REDP=_redp;
      return S.lastMatch;};

    /* ---- SOK KIÁLLÍTÁS EGY MECCSEN ---- */
    const M=await meccs();
    const kiall=(M&&M.players||[]).filter(x=>x&&x.red);
    ki.sok={
      lap:(M&&M.players||[]).length,
      kiallDb:kiall.length,
      percek:kiall.map(x=>x.min),
      mind90:kiall.length>0&&kiall.every(x=>x.min===90),
      eltiltva:Object.keys(S.unavailable||{}).length,
      redsKonyvelve:Object.keys(S.playerReds||{}).length,
      maxMatchRed:msT().maxMatchRed||0,
      lefujva:naplo.some(x=>/LEFÚJJA A MÉRKŐZÉST/.test(x)),
      /* A LÉTSZÁM-SZAVAK A NAPLÓ SORRENDJÉBEN. Nem minden piroslap-sor mond
         létszámot (a Panzer-készlet például sosem), ezért nem a DARABSZÁM a
         mérce, hanem hogy amelyik mond, az JÓT mondjon: az i-edik kiállítás
         után 10−i embernek kell maradnia. */
      letszamok:naplo.filter(x=>/marad(tunk|tatok)/.test(x))
        .map(x=>(x.match(/(tizenegyen|tízen|kilencen|nyolcan|heten|hatan)/i)||[])[0])
        .filter(Boolean).map(w=>w.toLowerCase()),
      eredmeny:M?`${M.gf}:${M.ga}`:null};
    /* ---- A BALANSZ ÁRA, MEGMÉRVE ----
       A régi kapu („egy közvetlen piros meccsenként") eltávolítása valódi
       balansz-változás, tehát nem tippelni kell, hanem megmérni: mennyivel
       lett gyakoribb a kiállítás egy RENDES szezonban. Az auto mód a játék
       saját „szezon végigjátszása" útja, tehát reprezentatív. */
    S.auto=true;
    const _idx0=S.idx,_reds0=S.reds||0;
    msT().maxMatchRed=0;
    S.idx=0;S.reds=0;buildSeasonFixtures();
    playMatch();
    for(let i=0;i<400&&S.idx<30;i++)await new Promise(r=>setTimeout(r,60));
    ki.szezon={meccs:S.idx,reds:S.reds||0,
      meccsenként:S.idx?Math.round((S.reds||0)/S.idx*1000)/1000:null,
      maxEgyMeccsen:msT().maxMatchRed||0};
    S.auto=false;S.idx=_idx0;S.reds=_reds0;

    addLine=_add;
    return ki;});

  console.log("=== 6. ÉLŐ MECCS: több kiállítás egy mérkőzésen ===");
  ok(elo.sok.kiallDb>=2,"tényleg több embert állítottak ki",elo.sok);
  ok(elo.sok.mind90===false,
     "…és EGYIKÜK SEM 90 percet játszott: a percek a kiállításig számítanak",
     elo.sok.percek);
  ok(elo.sok.redsKonyvelve===elo.sok.kiallDb,
     "MINDEN kiállítás el van könyvelve, nem csak az utolsó",elo.sok);
  ok(elo.sok.eltiltva===elo.sok.kiallDb,
     "…és mindegyikük eltiltást kapott",elo.sok);
  ok(elo.sok.maxMatchRed===elo.sok.kiallDb,
     "a mérföldkő-tracker a meccs kiállítás-számát látja",elo.sok);
  {const R=["tizenegyen","tízen","kilencen","nyolcan","heten","hatan"];
   /* A LÉTSZÁM SOSEM NŐHET VISSZA — ez a valódi invariáns, nem a szigorú
      csökkenés. Két oka van, és mindkettő szándékos:
        · nem minden piroslap-sor mond létszámot (a Panzer-készlet például
          sosem), tehát a sorozat UGORHAT: tízen → nyolcan;
        · a LEFÚJÁS sora megismétli az ötödik kiállításét („hatan maradtatok"),
          tehát ugyanaz a szám kétszer is szerepelhet egymás után. */
   const idx=elo.sok.letszamok.map(w=>R.indexOf(w));
   ok(idx.every((v,i)=>v>0&&(i===0||v>=idx[i-1])),
      "a napló létszám-szavai SOSEM nőnek vissza (tízen → kilencen → …)",
      elo.sok.letszamok);
   ok(elo.sok.letszamok.filter(w=>w==="tízen").length<=1,
      "a „tízen” legfeljebb EGYSZER hangzik el — az első lapnál",elo.sok.letszamok);}

  console.log("=== 7. az ötödik kiállítás lefújja a meccset ===");
  ok(elo.sok.kiallDb<=5,
     "ötnél több kiállítás nem születhet: az ötödik UTÁN már nincs meccs",elo.sok.kiallDb);
  if(elo.sok.kiallDb>=5){
    ok(elo.sok.lefujva===true,"a napló kimondja a lefújást",elo.sok.lefujva);
    ok(elo.sok.eredmeny==="0:3",
       "a hivatalos eredmény a bemondott vereség: 0:3",elo.sok.eredmeny);
    ok(elo.sok.letszamok[elo.sok.letszamok.length-1]==="hatan",
       "…és a lefújás előtti utolsó sor hatan-t mond",elo.sok.letszamok);}
  else console.log("  ⚠ ebben a futásban nem jött össze öt kiállítás — a lefújás ága nem mérhető");

  console.log("=== 1. a kiállított percei a kiállításig ===");
  ok(t.pz.perc90===90&&t.pz.perc52===52,
     "a 90 perces arány 90', a kiállításig tartó 52'",{p90:t.pz.perc90,p52:t.pz.perc52});

  console.log("=== 2. …de Panzernél az ÉRTÉKELÉS nem esik tőle ===");
  ok(t.pz.epit===true&&t.nem.epit===false,
     "a lap-építés tényleg csak az egyik mérésben él",{pz:t.pz.epit,nem:t.nem.epit});
  ok(t.pz.vagott===t.pz.teljes,
     "Panzernél a levágott perc UGYANAZT az értékelést adja, mint a teljes",t.pz);
  /* A PERCSÚLY AZ ALAP FELÉ HÚZ (MSTAT_PULL_FLOOR), nem lefelé — egy
     kiállított ember értékelése mélyen az alap ALATT van, tehát nála a
     rövidebb játékidő FELFELÉ mozdít. A helyes állítás ezért nem az, hogy
     „kevesebb", hanem hogy a súly ÉL, és az alaphoz KÖZELEBB visz. */
  ok(t.nem.vagott!==null&&t.nem.teljes!==null&&t.nem.vagott!==t.nem.teljes
     &&Math.abs(t.nem.vagott-t.nem.alap)<Math.abs(t.nem.teljes-t.nem.alap),
     "Panzer NÉLKÜL a percsúly ÉL: a rövidebb játékidő az alap felé húz",t.nem);
  /* AZ ELŐJEL A LÉNYEG, nem egy önkényes arány: Panzernél a kiállítás az
     alap FÖLÉ viszi (jutalom), máshol alá (büntetés). Pont ez a kérés:
     „Ott jutalmazni kell azt aki ilyen kemény." */
  ok(t.pz.vagott>t.pz.alap&&t.nem.vagott<t.nem.alap,
     "…a Panzeres kiállított az ALAP FÖLÉ kerül, a másik alá: jutalom vs. büntetés",
     {pz:t.pz.vagott,nem:t.nem.vagott,alap:t.pz.alap});
  ok(t.pz.koraiRated===true,
     "a 10. percben kiállított Panzernél IS kap értékelést (a 15 perces kapu nem zárja ki)",
     {korai:t.pz.korai,rated:t.pz.koraiRated});
  ok(t.nem.koraiRated===false,
     "…Panzer nélkül viszont 10 perc alatt továbbra sincs ítélet",t.nem.koraiRated);
  ok(t.pz.korai>t.pz.vagott,
     "és a KORAI kiállítás ér a legtöbbet — ez a filozófia lényege",
     {korai:t.pz.korai,k52:t.pz.vagott});

  console.log("=== 3. a létszám-szöveg ===");
  ok(t.szo.t10==="tízen"&&t.szo.t9==="kilencen"&&t.szo.t8==="nyolcan"&&t.szo.t7==="heten",
     "tízen · kilencen · nyolcan · heten",t.szo);
  ok(t.lap.kilencNemMondTizet===true,
     "a MÁSODIK kiállítás sora már nem mond tízet",t.lap);
  ok(t.lap.kilencMondKilencet===true&&t.lap.nyolcMondNyolcat===true,
     "…hanem a tényleges létszámot",t.lap);
  ok(t.lap.tizNemMondKilencet===true,
     "az ELSŐ kiállítás sora viszont változatlanul tízet mond",t.lap);

  console.log("=== 4. a redHas mindkét alakot érti ===");
  ok(t.redHas.szam[0]===true&&t.redHas.szam[1]===false&&t.redHas.szam[2]===false,
     "a régi, SZÁM alakú hívás betűre a régi",t.redHas.szam);
  ok(t.redHas.halmaz[0]===true&&t.redHas.halmaz[1]===false,
     "a HALMAZ alak is működik",t.redHas.halmaz);
  ok(t.redHas.ures===false,"null = senki nincs kiállítva",t.redHas.ures);

  console.log("=== 5. a két új mérföldkő-család ===");
  ok(t.mk.rcDb===5,"a „kiállítás egy mérkőzésen” öt fokozat",t.mk.rcDb);
  ok(JSON.stringify(t.mk.rcKuszob)==="[1,2,3,4,5]",
     "…1-től 5-ig: az ÖTÖDIK lap még megszületik — épp ő fújja le a meccset",t.mk.rcKuszob);
  ok(t.mk.wmDb===4,"a „hányan nyertük meg” szintén négy",t.mk.wmDb);
  ok(t.mk.wmCim[0]==="Győzelem tízen"&&t.mk.wmCim[3]==="Győzelem heten",
     "…és a címe a pályán látott létszámot mondja",t.mk.wmCim);
  ok(t.mk.nulla.rc.every(v=>v===0)&&t.mk.nulla.wm.every(v=>v===0),
     "nulla mérleggel egyik sem áll",t.mk.nulla);
  ok(t.mk.utana.rc.every(v=>v===3)&&t.mk.utana.wm.every(v=>v===2),
     "a mérők a trackerből olvasnak",t.mk.utana);

  console.log("=== 8. mibe kerül a kapu eltávolítása (mérés) ===");
  console.log(`  ↳ ${elo.szezon.meccs} meccs · ${elo.szezon.reds} kiállítás `
    +`· ${elo.szezon.meccsenként}/meccs · a legtöbb egy meccsen: ${elo.szezon.maxEgyMeccsen}`);
  ok(elo.szezon.meccs>=25,"a mérés tényleg egy egész szezont járt végig",elo.szezon.meccs);
  /* A LAZA HATÁR AZ, AMI ÉRTELMES: a piroslap ritka esemény, a kapu
     eltávolítása csak a ránézésre sem látszó farkat engedi el. Ha ez a szám
     valaha 0,5 fölé megy, az nem finomhangolás, hanem elrontott balansz. */
  ok(elo.szezon.meccsenként<0.5,
     "…és a kiállítás RITKA maradt: meccsenként jóval 0,5 alatt",elo.szezon.meccsenként);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
