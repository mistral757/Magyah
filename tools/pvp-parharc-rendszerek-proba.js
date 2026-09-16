/* ⚔ PVP: AMI EDDIG KI VOLT VÉVE A PÁRHARCBÓL (3.9.86).

   KIMONDOTT KÉRÉS: „PvP-ben az egymás elleni meccsekre legyen jobban kidolgozva
   a már működő rendszerekből az, ami innen jelenleg ki van véve: bizonyos
   csapatstílus képességek, sárga lapok, stb."

   MI VOLT KIVÉVE, ÉS MIÉRT. A párharc eredményét a KÖZÖS, seedelt eseménylista
   adja, hogy a két kliens bitre ugyanazt a mérkőzést lássa. Ami helyben
   sorsolódott volna, azt ezért kikapcsolták — a sárga lapot teljesen. A piros
   lapnál ugyanez a gond állt fenn, és a v2-es lista már megoldotta: a súlyok és
   az esély a pillanatképpel utaznak, a DOBÁS a közös szimulációba költözik.
   Ez a kör ugyanezt csinálja a maradékkal.

   Amit mér:
     1. SÁRGA LAP (v3): a közös listában van, a második sárga kiállítás, és a
        kiállításnak külön `red` eseménye is van (y2) — hogy egy RÉGEBBI kliens,
        ami a sárgát nem ismeri, ugyanúgy tízre fogyjon;
     2. VISSZAFELÉ KOMPATIBILITÁS: régi (yellowP nélküli) pillanatképnél EGYETLEN
        R() hívás sem történik többletként — az eseménylista betűre ugyanaz,
        mintha a semleges mezők ki lennének töltve. A véletlen-folyam a
        szerződés része;
     3. MEGFÉLEMLÍTÉS (redOppMult): eddig a párharcban NÉMA volt — a naplósor
        megjelent, a gólráta nem mozdult. Most az ellenfél tényleg kevesebbet lő
        a kiállítás után;
     4. AZ EMBERHÁTRÁNY TÉTELE oldalanként a sajátja (a „tízzel is támadunk"
        csúszka a saját büntetésedet enyhíti, nem a társadét);
     5. HANGSÚLY-CSÚSZKÁK: az own/opp csatorna a percre, az állásra és az
        emberhátrányra ugyanúgy szűr, mint a helyi motorban (h2hDialMul);
     6. a pillanatkép tényleg VISZI mind az öt új mezőt, és a gólsúlyokba
        beleszorozza a goalw-csúszkát és az Osztott dicsőséget;
     7. DETERMINIZMUS: ugyanabból a magból ugyanaz a lista. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9019'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9019/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof h2hSimulate==="function"&&typeof h2hDialMul==="function"
    &&typeof mpWireYellowWeights==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    /* ---- A TEREP: két szintetikus pillanatkép ----
       Csak azokat a mezőket adjuk meg, amikre a szimulációnak szüksége van —
       így a mérés a LAPOKRÓL és a SZORZÓKRÓL szól, nem a keretépítésről. */
    const nev=(o,i)=>o+" Játékos "+i;
    const csapat=(o,extra)=>Object.assign({
      teamName:o,ovr:80,defMult:1,famSp:null,tacticEffect:0,tacticStyle:null,
      chemPairs:0,ownGoalMult:1,oppGoalMult:1,plan:[],roles:null,
      players:Array.from({length:11},(_,i)=>({n:nev(o,i),pos:i===0?"KP":"KKP",
        gw:i===0?0.02:5,aw:i===0?0.02:4,rw:1,yw:1})),
      redP:0,yellowP:0},extra||{});
    const mag=s=>rngFor("proba:"+s);
    const fut=(H,A,s)=>h2hSimulate(H,A,mag(s),false);
    const lapok=(ev,tip)=>ev.filter(e=>e.type===tip);

    /* ---- 1. A SÁRGA LAP A KÖZÖS LISTÁBAN ---- */
    const yP=YELLOW_PER_MATCH/18;
    let sargaOssz=0,pirosY2=0,pirosSima=0,meccs=400,sargasMeccs=0;
    const parok=[];
    for(let i=0;i<meccs;i++){
      const sim=fut(csapat("Hazai",{yellowP:yP}),csapat("Vendég",{yellowP:yP}),"y"+i);
      const y=lapok(sim.events,"yellow"),r=lapok(sim.events,"red");
      sargaOssz+=y.length;
      if(y.length)sargasMeccs++;
      r.forEach(e=>{if(e.y2)pirosY2++;else pirosSima++;});
      /* minden y2-es sárgához KELL egy y2-es piros, ugyanarra a névre és percre */
      y.filter(e=>e.y2).forEach(e=>{
        parok.push(r.some(x=>x.y2&&x.who===e.who&&x.side===e.side&&x.min===e.min));});
      ki.v=sim.v;}
    ki.sarga={ossz:sargaOssz,meccsenkentCsapatra:+(sargaOssz/meccs/2).toFixed(3),
      varhato:+YELLOW_PER_MATCH.toFixed(2),volt:sargasMeccs,
      pirosY2,pirosSima,parokOk:parok.length&&parok.every(Boolean),parokDb:parok.length};
    /* oldalanként LEGFELJEBB egy kiállítás, és a sárgák sorrendje monoton */
    {let baj=0,rend=0;
     for(let i=0;i<120;i++){
       const sim=fut(csapat("Hazai",{yellowP:yP*3}),csapat("Vendég",{yellowP:yP*3}),"z"+i);
       ["home","away"].forEach(sd=>{
         if(lapok(sim.events,"red").filter(e=>e.side===sd).length>1)baj++;});
       let last=-1;
       sim.events.forEach(e=>{if(e.min<last)rend++;last=e.min;});}
     ki.egyPiros=baj;ki.idorend=rend;}

    /* ---- 2. VISSZAFELÉ KOMPATIBILITÁS ---- */
    {
      const regi=()=>{const c=csapat("Hazai",{redP:SIM.REDP/18});
        delete c.yellowP;delete c.redOppMult;delete c.redMatch;delete c.dials;
        c.players.forEach(pl=>{delete pl.yw;});return c;};
      const semleges=()=>csapat("Hazai",{redP:SIM.REDP/18,yellowP:0,
        redOppMult:1,redMatch:SIM.REDMATCH,dials:{own:[],opp:[]}});
      let elter=0;
      for(let i=0;i<200;i++){
        const a=JSON.stringify(fut(regi(),regi(),"k"+i).events);
        const b=JSON.stringify(fut(semleges(),semleges(),"k"+i).events);
        if(a!==b)elter++;}
      ki.kompat={elter,
        sargaRegin:fut(regi(),regi(),"k0").events.filter(e=>e.type==="yellow").length};}

    /* ---- 3. MEGFÉLEMLÍTÉS ---- */
    {
      /* A hazai MINDIG kiállítást kap (redP=1), a vendég soha. A kérdés: a
         vendég gólrátája lemegy-e a hazai megfélemlítés-szorzójától. */
      const H=e=>csapat("Hazai",Object.assign({redP:1},e||{}));
      const A=()=>csapat("Vendég");
      let nelkul=0,vele=0,n=600;
      for(let i=0;i<n;i++){
        nelkul+=fut(H(),A(),"m"+i).ag;
        vele  +=fut(H({redOppMult:0.5}),A(),"m"+i).ag;}
      ki.megfelemlites={nelkul:+(nelkul/n).toFixed(3),vele:+(vele/n).toFixed(3)};
      /* és hogy a SAJÁT gólrátánkat NEM bántja */
      let sn=0,sv=0;
      for(let i=0;i<n;i++){
        sn+=fut(H(),A(),"m"+i).hg;
        sv+=fut(H({redOppMult:0.5}),A(),"m"+i).hg;}
      ki.megfelemlitesSajat={nelkul:+(sn/n).toFixed(3),vele:+(sv/n).toFixed(3)};}

    /* ---- 4. AZ EMBERHÁTRÁNY TÉTELE OLDALANKÉNT ---- */
    {
      const n=600;let szigoru=0,enyhe=0;
      for(let i=0;i<n;i++){
        szigoru+=fut(csapat("Hazai",{redP:1,redMatch:SIM.REDMATCH}),csapat("Vendég"),"r"+i).hg;
        enyhe  +=fut(csapat("Hazai",{redP:1,redMatch:SIM.REDMATCH/2}),csapat("Vendég"),"r"+i).hg;}
      ki.emberhatrany={szigoru:+(szigoru/n).toFixed(3),enyhe:+(enyhe/n).toFixed(3)};}

    /* ---- 5. A CSÚSZKÁK ---- */
    {
      ki.dialSzuro={
        ures:h2hDialMul([],{min:50}),
        nincsLista:h2hDialMul(null,{min:50}),
        sima:h2hDialMul([{f:1.2}],{min:50}),
        ketto:+h2hDialMul([{f:1.2},{f:0.9}],{min:50}).toFixed(6),
        minFromAlatt:h2hDialMul([{f:1.5,mf:70}],{min:50}),
        minFromFolott:h2hDialMul([{f:1.5,mf:70}],{min:70}),
        minToAlatt:h2hDialMul([{f:1.5,mt:30}],{min:30}),
        minToFolott:h2hDialMul([{f:1.5,mt:30}],{min:35}),
        vezetve:h2hDialMul([{f:1.5,ld:"up"}],{min:50,gf:2,ga:1}),
        nemVezetve:h2hDialMul([{f:1.5,ld:"up"}],{min:50,gf:1,ga:1}),
        hatranyban:h2hDialMul([{f:1.5,ld:"down"}],{min:50,gf:0,ga:1}),
        pirosNelkul:h2hDialMul([{f:1.5,rd:1}],{min:50,red:false}),
        pirossal:h2hDialMul([{f:1.5,rd:1}],{min:50,red:true}),
        gaMin:[h2hDialMul([{f:1.5,gmin:2}],{ga:1}),h2hDialMul([{f:1.5,gmin:2}],{ga:2})],
        gaMax:[h2hDialMul([{f:1.5,gmax:0}],{ga:0}),h2hDialMul([{f:1.5,gmax:0}],{ga:1})]};
      const n=600;let alap=0,tolva=0,keso=0,keso2=0;
      for(let i=0;i<n;i++){
        alap +=fut(csapat("Hazai"),csapat("Vendég"),"d"+i).hg;
        tolva+=fut(csapat("Hazai",{dials:{own:[{f:1.4}],opp:[]}}),csapat("Vendég"),"d"+i).hg;
        keso +=fut(csapat("Hazai",{dials:{own:[{f:1.4,mf:70}],opp:[]}}),csapat("Vendég"),"d"+i).hg;
        /* a VÉDEKEZŐ fél „opp" csúszkája a TÁMADÓ gólrátáján ül */
        keso2+=fut(csapat("Hazai"),csapat("Vendég",{dials:{own:[],opp:[{f:0.6}]}}),"d"+i).hg;}
      ki.csuszka={alap:+(alap/n).toFixed(3),tolva:+(tolva/n).toFixed(3),
        csakHajra:+(keso/n).toFixed(3),ellenfelZar:+(keso2/n).toFixed(3)};}

    /* ---- 7. DETERMINIZMUS ---- */
    {
      const A1=JSON.stringify(fut(csapat("Hazai",{yellowP:yP,redP:SIM.REDP/18}),
                                  csapat("Vendég",{yellowP:yP,redP:SIM.REDP/18}),"det").events);
      const A2=JSON.stringify(fut(csapat("Hazai",{yellowP:yP,redP:SIM.REDP/18}),
                                  csapat("Vendég",{yellowP:yP,redP:SIM.REDP/18}),"det").events);
      ki.determinizmus=(A1===A2);}
    return ki;});

  console.log("=== 1. a sárga lap a közös listában ===");
  ok(t.v===3,"a lista verziója 3",t.v);
  ok(t.sarga.ossz>0,"vannak sárga lapok a párharcban",t.sarga);
  ok(Math.abs(t.sarga.meccsenkentCsapatra-t.sarga.varhato)<0.15,
     "csapatonként ~YELLOW_PER_MATCH lap egy mérkőzésen",
     {mert:t.sarga.meccsenkentCsapatra,vart:t.sarga.varhato});
  ok(t.sarga.pirosY2>0,"van második sárgából született kiállítás",t.sarga.pirosY2);
  ok(t.sarga.parokOk,"MINDEN y2-es sárgához tartozik y2-es piros (régi kliens is tízre fogy)",
     {db:t.sarga.parokDb});
  ok(t.egyPiros===0,"oldalanként legfeljebb EGY kiállítás",t.egyPiros);
  ok(t.idorend===0,"az idővonal monoton — a lap nem ugrik vissza",t.idorend);

  console.log("=== 2. régi kliens: a véletlen-folyam nem mozdul ===");
  ok(t.kompat.sargaRegin===0,"régi pillanatképnél nincs sárga lap",t.kompat.sargaRegin);
  ok(t.kompat.elter===0,
     "200 magból 0 eltérés a semleges mezőkkel kitöltött listához képest",t.kompat.elter);

  console.log("=== 3. megfélemlítés ===");
  ok(t.megfelemlites.vele<t.megfelemlites.nelkul,
     "a kiállítás UTÁN az ellenfél kevesebbet lő",t.megfelemlites);
  ok(t.megfelemlitesSajat.vele===t.megfelemlitesSajat.nelkul
     ||Math.abs(t.megfelemlitesSajat.vele-t.megfelemlitesSajat.nelkul)<0.12,
     "a saját gólrátánkat nem bántja",t.megfelemlitesSajat);

  console.log("=== 4. az emberhátrány tétele a sajátod ===");
  ok(t.emberhatrany.enyhe>t.emberhatrany.szigoru,
     "enyhébb tétellel tízzel is többet támadsz",t.emberhatrany);

  console.log("=== 5. a csúszka-szűrők ===");
  const d=t.dialSzuro;
  ok(d.ures===1&&d.nincsLista===1,"üres lista = semleges",[d.ures,d.nincsLista]);
  ok(d.sima===1.2&&d.ketto===1.08,"a szorzók összeszorzódnak",[d.sima,d.ketto]);
  ok(d.minFromAlatt===1&&d.minFromFolott===1.5,"minFrom",[d.minFromAlatt,d.minFromFolott]);
  ok(d.minToAlatt===1.5&&d.minToFolott===1,"minTo",[d.minToAlatt,d.minToFolott]);
  ok(d.vezetve===1.5&&d.nemVezetve===1&&d.hatranyban===1.5,"lead",
     [d.vezetve,d.nemVezetve,d.hatranyban]);
  ok(d.pirosNelkul===1&&d.pirossal===1.5,"red",[d.pirosNelkul,d.pirossal]);
  ok(d.gaMin[0]===1&&d.gaMin[1]===1.5&&d.gaMax[0]===1.5&&d.gaMax[1]===1,
     "gaMin / gaMax",[d.gaMin,d.gaMax]);
  ok(t.csuszka.tolva>t.csuszka.alap,"az own csúszka emeli a saját gólrátát",t.csuszka);
  ok(t.csuszka.csakHajra>t.csuszka.alap&&t.csuszka.csakHajra<t.csuszka.tolva,
     "a 70. perctől szólóé a kettő között van",t.csuszka);
  ok(t.csuszka.ellenfelZar<t.csuszka.alap,
     "az ELLENFÉL opp csúszkája a te gólrátádat fogja vissza",t.csuszka);

  console.log("=== 7. determinizmus ===");
  ok(t.determinizmus===true,"ugyanabból a magból bitre ugyanaz a lista");

  /* ---- 6. ÉS ÉLESBEN: A PILLANATKÉP ---- */
  console.log("=== 6. a pillanatkép élesben ===");
  const snap=await p.evaluate(()=>{
    const out={};
    try{
      /* Egy valódi karrier a rendes úton — a pillanatkép-építőnek keret,
         felállás, edző és filozófia kell. */
      enterCareerSetupFromHome(true);
      beginNewGame();
      const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
      showChemistry=()=>{};
      S.pyr=null;S.idx=0;
      pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
      pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
      renderPyrDivPick();
      pyrConfirmDiv();
      /* A KEZDŐ TIZENEGY. A draft-ág üresen hagyná a slotokat, a pillanatkép
         viszont abból dolgozik — poszt-hű ifi-játékosokkal töltjük fel. */
      /* A KARRIER-POOL: a lefújás utáni fejlődés (processCareerDevelopment)
         ebből dolgozik, tehát a párharc lejátszásához is kell. */
      if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
      const _kesz=sq.players.slice();
      slots.forEach((sl,i)=>{
        if(sl.player)return;
        const src=_kesz[i%_kesz.length];
        const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
        sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});
      if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
      if(!coach)coach=COACHES[0];
      const sn=h2hWireSnapshot();
      out.mezok={yellowP:typeof sn.yellowP,redOppMult:typeof sn.redOppMult,
        redMatch:typeof sn.redMatch,dials:!!(sn.dials&&sn.dials.own&&sn.dials.opp),
        yw:sn.players&&sn.players.length?typeof sn.players[0].yw:"nincs"};
      out.ertek={yellowP:+(sn.yellowP||0).toFixed(5),redOppMult:sn.redOppMult,
        redMatch:sn.redMatch,
        ywOssz:+(sn.players||[]).reduce((a,x)=>a+(x.yw||0),0).toFixed(3),
        ywNulla:(sn.players||[]).filter(x=>!(x.yw>0)).length,
        players:(sn.players||[]).length};
      /* A KAPUS gólsúlya érintetlen marad az Osztott dicsőség lapítása után is
         (a lapítás átlaga őt kihagyja) — ezt a semleges eset is mutatja. */
      const kp=(sn.players||[]).find(x=>x.pos==="KP");
      out.kapus=kp?+kp.gw.toFixed(4):null;
      /* …és a lista LEFUT a szimuláción, két valódi kerettel. */
      const sim=h2hSimulate(sn,sn,rngFor("proba:eles"),false);
      out.sim={v:sim.v,ev:sim.events.length,hg:sim.hg,ag:sim.ag};
    }catch(e){out.err=String(e&&e.stack||e.message||e);}
    return out;});
  if(snap.err){
    ok(false,"a pillanatkép nem épült fel",snap.err);
  }else{
    ok(snap.mezok.yellowP==="number"&&snap.mezok.redOppMult==="number"
       &&snap.mezok.redMatch==="number"&&snap.mezok.dials&&snap.mezok.yw==="number",
       "mind az öt új mező ott van a pillanatképben",snap.mezok);
    ok(snap.ertek.yellowP>0,"a sárgalap-esély pozitív",snap.ertek.yellowP);
    ok(snap.ertek.ywOssz>0&&snap.ertek.ywNulla===0,
       "minden pályán lévő játékosnak van sárgalap-súlya",snap.ertek);
    ok(snap.ertek.redMatch>0,"az emberhátrány tétele értelmes",snap.ertek.redMatch);
    ok(snap.kapus!=null&&snap.kapus<0.5,
       "a kapus gólsúlya elenyésző marad (az Osztott dicsőség kihagyja)",snap.kapus);
    ok(snap.sim&&snap.sim.v===3&&snap.sim.ev>2,
       "a valódi pillanatkép végigfut a szimuláción",snap.sim);}

  /* ---- 8. ÉS A LEJÁTSZÁS: EGY VALÓDI PÁRHARC ----
     A szimuláció még csak a listát írja meg; a sárga lap ÚTJA a naplóig és a
     lapgyűjtés-számlálóig a playMatch-ben van. Ezt csak élesben lehet mérni:
     beültetünk egy kézzel írt eseménylistát (két sárga ugyanannak az embernek,
     plusz egy harmadik valaki másnak), és megnézzük, mi lett belőle. */
  console.log("=== 8. a lejátszás: egy valódi párharc ===");
  const jat=await p.evaluate(()=>new Promise(res=>{
    const out={};
    try{
      const nevek=slots.map(sl=>sl.player&&sl.player.n).filter(Boolean);
      const A=nevek[3],B=nevek[6];
      out.kik={A,B};
      const ev=[{min:0,type:"start",home:"Mi",away:"Ők"},
        {min:20,type:"yellow",side:"home",who:A,y2:false},
        {min:35,type:"yellow",side:"home",who:B,y2:false},
        {min:45,type:"half",hg:0,ag:0},
        {min:60,type:"yellow",side:"home",who:B,y2:true},
        {min:60,type:"red",side:"home",who:B,y2:true},
        {min:90,type:"end",hg:0,ag:0}];
      h2hScript={sim:{v:3,events:ev,hg:0,ag:0},round:15,iAmHome:true,
        neutral:false,oppName:"Társ FC",oppOvr:80,oppShown:80};
      S.seasonYellows={};S.yellows={};S.reds=0;
      const elotte=S.reds;
      S.auto=true;
      playMatch();
      const t0=Date.now();
      const iv=setInterval(()=>{
        if(!S.playing||Date.now()-t0>120000){
          clearInterval(iv);
          out.reds=S.reds-elotte;
          out.seasonYellows=Object.assign({},S.seasonYellows);
          out.gyujtes=Object.assign({},S.yellows||{});
          out.naplo=Array.from(document.querySelectorAll("#ttLines .rc"))
            .map(x=>x.textContent.trim()).slice(0,8);
          res(out);}},400);
    }catch(e){out.err=String(e&&e.stack||e.message||e);res(out);}}));
  if(jat.err){
    ok(false,"a párharc nem futott le",jat.err);
  }else{
    ok(jat.seasonYellows[jat.kik.A]===1,
       "az EGY sárgás ember lapja a szezon-számlálóba került",jat.seasonYellows);
    ok(jat.seasonYellows[jat.kik.B]===2,
       "a KÉT sárgás emberé statisztikában mind a kettő megvan",jat.seasonYellows);
    ok(jat.gyujtes[jat.kik.B]===undefined||jat.gyujtes[jat.kik.B]===0,
       "…de a GYŰJTÉSBE nem: azokat a piros lap elhasználta",jat.gyujtes);
    ok(jat.gyujtes[jat.kik.A]===1,"az egy sárgás emberé viszont gyűlik",jat.gyujtes);
    ok(jat.reds===1,"pontosan egy kiállítás született",jat.reds);
    ok(jat.naplo.some(x=>x.indexOf("MÁSODIK SÁRGA")>=0),
       "a napló MÁSODIK SÁRGÁT ír, nem a semmiből jött pirosat",jat.naplo);}

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,3));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
