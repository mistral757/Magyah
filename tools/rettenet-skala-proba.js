/* ☠️ A RETTENET-TARIFA A FÉLELEM SZINTTEL SKÁLÁZÓDIK 100 FÖLÖTT (3.9.90).

   KIMONDOTT KÉRÉS: „A meccsen kapható rettenet pontok is legyenek arányosítva
   a félelem szinttel 100as szint felett. Addig legyen a mostani rögzített
   tarifa."

   AZ ARÁNYTALANSÁG. A meccsenkénti PLAFON a félelem szint 10%-a
   (fearMatchCap), tehát a szinttel együtt nőtt — a TARIFA viszont fix volt
   (sárga 0,5, piros 2, mesterhármas 1, kemény belépő 0,5, védekező villanás
   0,1, meccserő-fölény max 5). Egy magas félelem szintnél a plafon
   elérhetetlenné vált, és a rettenet-gazdaság pont ott állt meg, ahol a
   legjobban kellett volna pörögnie.

   Amit mér:
     1. a szorzó: 1 a 100-as szintig, fölötte szint/100;
     2. hogy 100 ALATT a tarifa BETŰRE a régi — a régi fix számokkal;
     3. hogy fölötte minden tétel arányosan nő (a meccserő-fölény is);
     4. hogy a győzelem erősebb ellen NEM szorzódik kétszer: az már a
        plafonból számol, tehát a szinttel eleve együtt nő;
     5. és a lényeg: egy TIPIKUS mérkőzés hozama a plafonhoz mérve a hiba előtt
        összeomlott a magas szinteken, most viszont arányban marad. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9031'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9031/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof dreadScale==="function"&&typeof fearNote==="function"
    &&typeof fearMatchEnd==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    S.style={key:"panzer",traits:{}};S.style2=null;
    /* A félelem szintet kézzel vezéreljük: a bázis a keret jelleméből jönne,
       itt viszont pont a SZINT a független változó. A dreadScale ezen a
       kötésen át olvas, tehát az átírás a valódi úton hat. */
    let SZINT=0;
    fearLevel=()=>SZINT;
    addLine=()=>{};                      /* a napló itt csak zaj volna */
    const F=fearState();
    const nulla=()=>{F.pts=0;F.earned=0;};

    /* ---- 1. A SZORZÓ ---- */
    ki.honnan=DREAD_SCALE_FROM;
    ki.szorzo=[0,1,50,99,100,101,150,200,500,1000].map(L=>{
      SZINT=L;return {L,m:Math.round(dreadScale()*1e4)/1e4};});

    /* ---- 2-3. A TÉTELEK ---- */
    const tetel=(L,kind,db)=>{
      SZINT=L;nulla();
      fearMatchStart();
      _dreadRaw=0;_dreadGap=0;_dreadBy=null;   /* a fölény tételét külön mérjük */
      fearNote(kind,db);
      return Math.round(_dreadRaw*1e4)/1e4;};
    ki.regiTarifa=Object.assign({},DREAD_PTS);
    ki.tetelek={};
    [50,100,200,1000].forEach(L=>{
      ki.tetelek[L]={};
      ["yellow","red","hat","hard","tackle"].forEach(k=>{
        ki.tetelek[L][k]=tetel(L,k,1);});});

    /* a meccserő-fölény: a kezdőrúgáskor könyvelődik */
    const eredetiGap=levelGap;
    levelGap=()=>99;                      /* biztosan a teljes tétel jár */
    ki.folenye={};
    [50,100,200,1000].forEach(L=>{
      SZINT=L;nulla();fearMatchStart();
      ki.folenye[L]=Math.round(_dreadGap*1e4)/1e4;});
    levelGap=eredetiGap;

    /* ---- 4. A GYŐZELEM ERŐSEBB ELLEN nem szorzódik kétszer ---- */
    ki.gyozelem={};
    [100,200,1000].forEach(L=>{
      SZINT=L;nulla();
      _dreadRaw=0;_dreadGap=0;_dreadBy=null;
      const pont=fearNoteWin(true,dreadWinGiant());   /* teljes óriásölés */
      ki.gyozelem[L]={pont:Math.round(pont*10)/10,cap:fearMatchCap()};});

    /* ---- 5. EGY TIPIKUS MÉRKŐZÉS ----
       Egy hihető Panzer-est: 3 sárga, 1 piros, 1 mesterhármas, 2 kemény
       belépő, 8 védekező villanás, és +5 meccserő-fölény. Győzelmi tétel
       NÉLKÜL, mert az már eleve a plafonból számol. */
    levelGap=()=>5;
    const meccs=(L)=>{
      SZINT=L;nulla();
      fearMatchStart();
      fearNote("yellow",3);fearNote("red",1);fearNote("hat",1);
      fearNote("hard",2);fearNote("tackle",8);
      const nyers=Math.round((_dreadRaw+_dreadGap)*100)/100;
      const cap=fearMatchCap();
      const kap=fearMatchEnd();
      return {L,nyers,cap:Math.round(cap*10)/10,kap,
        aranya:Math.round(nyers/Math.max(0.01,cap)*100)/100};};
    ki.meccs=[50,100,200,500,1000,2000].map(meccs);
    levelGap=eredetiGap;

    /* A RÉGI viselkedés újraszámolva ugyanezekre a szintekre: a fix tarifa
       összege állandó, csak a plafon nőtt. Ez mutatja meg, mit javítunk. */
    const regiNyers=3*DREAD_PTS.yellow+1*DREAD_PTS.red+1*DREAD_PTS.hat
      +2*DREAD_PTS.hard+8*DREAD_PTS.tackle+DREAD_GAP_MAX;
    ki.regi=[50,100,200,500,1000,2000].map(L=>({L,
      nyers:Math.round(regiNyers*100)/100,
      cap:Math.round(L*FEAR_MATCH_PCT*10)/10,
      aranya:Math.round(regiNyers/Math.max(0.01,L*FEAR_MATCH_PCT)*100)/100}));
    return ki;});

  console.log("=== 1. a szorzó ===");
  console.log("  "+t.szorzo.map(x=>`${x.L}: ×${x.m}`).join(" · "));
  ok(t.honnan===100,"a határ a 100-as félelem szint",t.honnan);
  ok(t.szorzo.filter(x=>x.L<=100).every(x=>x.m===1),
     "a 100-as szintig pontosan 1 — rögzített tarifa",
     t.szorzo.filter(x=>x.L<=100).map(x=>x.m));
  ok(t.szorzo.filter(x=>x.L>100).every(x=>Math.abs(x.m-x.L/100)<1e-9),
     "fölötte pontosan szint/100",t.szorzo.filter(x=>x.L>100).map(x=>[x.L,x.m]));

  console.log("=== 2. a 100-as szintig BETŰRE a régi tarifa ===");
  ["yellow","red","hat","hard","tackle"].forEach(k=>{
    ok(t.tetelek[50][k]===t.regiTarifa[k]&&t.tetelek[100][k]===t.regiTarifa[k],
       `${k}: ${t.regiTarifa[k]} — 50-en és 100-on is`,
       [t.tetelek[50][k],t.tetelek[100][k]]);});
  ok(t.folenye[50]===5&&t.folenye[100]===5,"meccserő-fölény: 5 — 50-en és 100-on is",
     [t.folenye[50],t.folenye[100]]);

  console.log("=== 3. fölötte arányosan nő ===");
  ["yellow","red","hat","hard","tackle"].forEach(k=>{
    ok(Math.abs(t.tetelek[200][k]-t.regiTarifa[k]*2)<1e-6
     &&Math.abs(t.tetelek[1000][k]-t.regiTarifa[k]*10)<1e-6,
       `${k}: 200-on ×2, 1000-en ×10`,[t.tetelek[200][k],t.tetelek[1000][k]]);});
  ok(t.folenye[200]===10&&t.folenye[1000]===50,
     "a meccserő-fölény is skálázódik",[t.folenye[200],t.folenye[1000]]);

  console.log("=== 4. a győzelem erősebb ellen nem szorzódik kétszer ===");
  console.log("  "+Object.keys(t.gyozelem).map(L=>`${L}: ${t.gyozelem[L].pont} (plafon ${t.gyozelem[L].cap})`).join(" · "));
  ok(Object.keys(t.gyozelem).every(L=>t.gyozelem[L].pont===t.gyozelem[L].cap),
     "az óriásölés pontosan a plafont adja, se többet, se kevesebbet",t.gyozelem);

  console.log("=== 5. egy tipikus Panzer-est ===");
  console.log("  szint | nyers | plafon | jóváírva | nyers/plafon");
  t.meccs.forEach((x,i)=>{
    const r=t.regi[i];
    console.log(`  ${String(x.L).padStart(5)} | ${String(x.nyers).padStart(6)} | ${String(x.cap).padStart(6)} | `
      +`${String(x.kap).padStart(8)} | ${String(x.aranya).padStart(5)}   (régen: ${r.nyers} / ${r.cap} = ${r.aranya})`);});
  const regiArany=t.regi.map(x=>x.aranya),ujArany=t.meccs.map(x=>x.aranya);
  ok(regiArany[regiArany.length-1]<0.2,
     "a RÉGI rendszerben a magas szint plafonja elérhetetlen volt",regiArany);
  ok(ujArany.filter((_,i)=>t.meccs[i].L>=100).every(a=>Math.abs(a-ujArany[1])<1e-6),
     "most a 100-as szinttől az arány ÁLLANDÓ — a plafon ugyanúgy fog",ujArany);
  ok(t.meccs.every((x,i)=>i===0||x.kap>=t.meccs[i-1].kap),
     "a jóváírt pont a szinttel monoton nő",t.meccs.map(x=>x.kap));
  ok(t.meccs[0].kap===t.meccs[1].kap*0+t.meccs[0].kap
   &&t.meccs[0].nyers===t.regi[0].nyers,
     "50-es szinten a nyers hozam betűre a régi",{uj:t.meccs[0].nyers,regi:t.regi[0].nyers});

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
