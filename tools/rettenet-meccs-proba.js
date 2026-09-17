/* ☠️ RETTENET: GYŐZELEM ERŐSEBB ELLEN + A MECCS MÉRLEGE A FEEDBEN (3.9.74)

   KIMONDOTT KÉRÉS: „Rettenet pont járjon azért is, ha magasabb nyers erővel
   rendelkező csapat ellen nyerünk. Max pont akkor, ha klasszikus óriás-ölés a
   meccs […] Itt a max pont az, hogy az egy meccsen kapható max rettenet pont
   legyen megadva, mindegy milyen eseményekre kapott még pontot a csapat. És
   legyen rettenet pontjelző a feedben. Az érintett események után
   közvetlenül, és a meccs végén egy összesítő."

   A PRÓBA GERINCE A „MINDEGY, MILYEN ESEMÉNYEKRE KAPOTT MÉG PONTOT" ÁLLÍTÁS:
   óriásölésnél a meccs pontosan a PLAFONT fizeti, akkor is, ha közben lapok,
   mesterhármas és szerelések is jöttek. A skála másik vége ugyanilyen fontos:
   vereségnél és gyengébb ellenfélnél NULLA.

   KÜLÖN ÁG A BETÖLTÉS. A tétel küszöbe az óriásölésé (MS_GIANT_GAP), ami a
   fájlban negyvenezer sorral LEJJEBB születik meg — egy modul-szintű
   `const` ott a saját TDZ-jébe futna, és a BETÖLTÉST állítaná meg (ezt se a
   node --check, se a no-undef nem látja). A próba méri, hogy a küszöb
   függvényen át jön, és hogy a két szám egyezik.

   Használat: node tools/rettenet-meccs-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8967'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8967/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";
    S.seasonNumber=6;
    /* a félelem szintet RÖGZÍTJÜK, hogy a plafon pontosan ismert legyen */
    window.fearLevel=()=>120;                 /* → fearMatchCap() = 12 */
    window.levelGap=()=>0;                    /* a régi fölény-tétel most nem szól bele */
    window.teamOVRbase=()=>70;
    const naplo=[];window.addLine=(t,c)=>naplo.push({t:String(t),c:String(c||"")});
    const ujStilus=()=>{S.style={key:"panzer",chosenSeason:1,traits:{},
      ms:{done:{},seen:{},t:{}},star:null,fear:{pts:0,earned:0,spent:0,retteges:0,mods:0}};
      S.style2=null;};
    ujStilus();
    o.alap={on:fearOn(),cap:fearMatchCap(),kuszob:dreadWinGiant(),
      /* a küszöb UGYANAZ a szám, amiből az óriásölés morálja és mérföldköve dolgozik */
      egyezik:dreadWinGiant()===MS_GIANT_GAP};

    /* ---- 1. A SKÁLA ---- */
    const meccs=(won,gap,extra)=>{
      ujStilus();naplo.length=0;
      fearMatchStart();
      (extra||[]).forEach(k=>fearNote(k));
      fearNoteWin(won,gap);
      const kap=fearMatchEnd();
      return {kap,naplo:naplo.slice()};};
    o.skala={
      vereseg:meccs(false,12,[]).kap,
      gyengebb:meccs(true,-5,[]).kap,
      egyenlo:meccs(true,0,[]).kap,
      gap2:meccs(true,2,[]).kap,
      gap4:meccs(true,4,[]).kap,
      gap8:meccs(true,8,[]).kap,
      gap20:meccs(true,20,[]).kap};

    /* ---- 2. ÓRIÁSÖLÉSNÉL A TELJES PLAFON, BÁRMI MÁS TÖRTÉNT ---- */
    const sok=["yellow","yellow","yellow","red","hat","hard","hard",
               "tackle","tackle","tackle","tackle","tackle"];
    const m1=meccs(true,8,sok);
    const m2=meccs(true,30,sok);
    o.orias={csakOlés:meccs(true,8,[]).kap,sokEsemeny:m1.kap,hatalmas:m2.kap,
      cap:fearMatchCap()};

    /* ---- 3. A FEED-JELZŐK ---- */
    const m3=meccs(true,4,["yellow","red","hat","hard","tackle","tackle"]);
    const sorok=m3.naplo.map(x=>x.t);
    const jelzo=sorok.filter(t=>/☠️ <b>\+/.test(t));
    o.feed={
      jelzok:jelzo.length,
      /* mind az öt HANGOS tétel kapott saját sort, a néma szerelés nem */
      sarga:jelzo.filter(t=>/sárga lap/.test(t)).length,
      piros:jelzo.filter(t=>/piros lap/.test(t)).length,
      mester:jelzo.filter(t=>/mesterhármas/.test(t)).length,
      kemeny:jelzo.filter(t=>/kemény belépő/.test(t)).length,
      gyozelem:jelzo.filter(t=>/erősebb csapat ellen/.test(t)).length,
      /* a védekező villanásnak NINCS saját sora — tucatnyi lenne meccsenként */
      szereles:jelzo.filter(t=>/védekező villanás/.test(t)).length,
      /* az értékek is kint vannak */
      pirosErtek:jelzo.some(t=>/\+2/.test(t)&&/piros lap/.test(t))};

    /* ---- 4. A MECCS VÉGI ÖSSZESÍTŐ ---- */
    const ossz=sorok.filter(t=>/RETTENET — a mérkőzés mérlege/.test(t));
    const bontas=sorok.filter(t=>/^→ /.test(t)&&/védekező villanás/.test(t));
    /* A VÁRT ÖSSZEG SZÁMOLVA, nem beírva: a tarifa a 100-as félelem szint
       fölött a szinttel arányos (3.9.90), és ez a jelenet 120-on fut. A
       győzelmi tétel NEM skálázódik — az eleve a plafonból számol. */
    const vartEsemeny=(DREAD_PTS.yellow+DREAD_PTS.red+DREAD_PTS.hat
      +DREAD_PTS.hard+2*DREAD_PTS.tackle)*dreadScale();
    const vartGyozelem=Math.round(fearMatchCap()*Math.min(1,4/dreadWinGiant())*10)/10;
    o.osszesito={
      van:ossz.length===1,
      vart:Math.round((vartEsemeny+vartGyozelem)*10)/10,
      skala:dreadScale(),
      szoveg:ossz[0]||"",
      /* a NÉMA tételek is benne vannak — ez az egyetlen hely, ahol a mérleg teljes */
      bontasVan:bontas.length===1,
      bontas:bontas[0]||"",
      /* és kimondja az egyenleget */
      egyenleg:sorok.some(t=>/rettenet-egyenlege/.test(t))};
    /* plafonos meccsnél kimondja, hogy a plafon fogott */
    const m4=meccs(true,30,sok);
    const s4=m4.naplo.map(x=>x.t);
    o.plafon={
      fogott:s4.some(t=>/félelem szinted/.test(t)&&/enged meccsenként/.test(t)),
      nemFogott:m3.naplo.map(x=>x.t).some(t=>/a plafon \(/.test(t)&&/nem fogott/.test(t))};

    /* ---- 5. A MÉRLEG NULLÁZÓDIK KÉT MECCS KÖZÖTT ---- */
    ujStilus();
    fearMatchStart();fearNote("red");fearNoteWin(true,8);
    const e1=fearMatchEnd();
    fearMatchStart();                       /* új meccs, semmi esemény */
    const e2=fearMatchEnd();
    o.nullaz={elso:e1,masodik:e2};

    /* ---- 6. PANZER NÉLKÜL SEMMI ---- */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    naplo.length=0;
    fearMatchStart();fearNote("red");
    const nw=fearNoteWin(true,20);
    o.nincsPanzer={on:fearOn(),win:nw,kap:fearMatchEnd(),sorok:naplo.length};

    /* ---- 7. A NULLADIK SZINTEN (3.9.70) SEM ---- */
    ujStilus();S.style.pre=1;
    naplo.length=0;
    fearMatchStart();fearNote("red");
    o.nulladik={on:fearOn(),win:fearNoteWin(true,20),kap:fearMatchEnd(),sorok:naplo.length};
    delete S.style.pre;
    return o;});

  console.log("=== az alap ===");
  ok("a küszöb az ÓRIÁSÖLÉSÉ, és függvényen át jön (nem modul-szintű const, ami a betöltést állítaná meg)",
     r.alap.kuszob===8&&r.alap.egyezik===true,r.alap);
  ok("a 120-as félelem szint 12-es meccsplafont ad",r.alap.on===true&&r.alap.cap===12,r.alap);

  console.log("\n=== a skála ===");
  ok("vereségnél és gyengébb (vagy egyenlő) ellenfélnél NULLA",
     r.skala.vereseg===0&&r.skala.gyengebb===0&&r.skala.egyenlo===0,r.skala);
  ok("a győzelem a nyers hátránnyal arányosan fizet: 2→3 · 4→6 a 12-es plafonból",
     r.skala.gap2===3&&r.skala.gap4===6,r.skala);
  ok("és a 8-as óriásölésnél a TELJES plafon — fölötte sem több",
     r.skala.gap8===12&&r.skala.gap20===12,r.skala);

  console.log("\n=== „mindegy, milyen eseményekre kapott még pontot” ===");
  ok("óriásölésnél a meccs a PLAFONT fizeti, üresen is és tizenkét eseménnyel is",
     r.orias.csakOlés===r.orias.cap&&r.orias.sokEsemeny===r.orias.cap
     &&r.orias.hatalmas===r.orias.cap,r.orias);

  console.log("\n=== a jelző a feedben ===");
  ok("minden HANGOS tétel saját sort kap az esemény után",
     r.feed.sarga===1&&r.feed.piros===1&&r.feed.mester===1
     &&r.feed.kemeny===1&&r.feed.gyozelem===1,r.feed);
  ok("a piros lap 2 pontja ki is van írva",r.feed.pirosErtek===true,r.feed);
  ok("a védekező villanásnak NINCS saját sora — tucatnyi lenne meccsenként",
     r.feed.szereles===0,r.feed);

  console.log("\n=== a meccs végi összesítő ===");
  /* Az esemény-tételek (0,5 + 2 + 1 + 0,5 + 2×0,1) a félelem szint szerint
     skálázódnak 100 fölött — ez a jelenet 120-on fut, tehát ×1,2 —, a
     győzelmi tétel (a plafon fele) viszont nem. Az összeg a plafon (12) alatt
     marad, tehát a teljes jár. Az összesítő a MECCS EGÉSZÉT mondja, nem egy
     tételt. */
  ok(`pontosan egy összesítő, és a meccs TELJES összegét mondja (${String(r.osszesito.vart).replace(".",",")}, a tarifa ×${r.osszesito.skala})`,
     r.osszesito.van===true
     &&new RegExp("\\+"+String(r.osszesito.vart).replace(".",",")+" pont").test(r.osszesito.szoveg),
     {szoveg:r.osszesito.szoveg});
  ok("a tételes bontásban a NÉMA tételek is ott vannak — ez az egyetlen teljes mérleg",
     r.osszesito.bontasVan===true&&/védekező villanás ×2/.test(r.osszesito.bontas),
     {bontas:r.osszesito.bontas});
  ok("és kimondja a klub rettenet-egyenlegét",r.osszesito.egyenleg===true,r.osszesito);
  ok("a plafon szerepét is kimondja — mindkét irányban",
     r.plafon.fogott===true&&r.plafon.nemFogott===true,r.plafon);

  console.log("\n=== a határok ===");
  ok("a mérleg nullázódik két mérkőzés között",
     r.nullaz.elso>0&&r.nullaz.masodik===0,r.nullaz);
  ok("Panzer nélkül nincs se pont, se sor",
     r.nincsPanzer.on===false&&r.nincsPanzer.win===0
     &&r.nincsPanzer.kap===0&&r.nincsPanzer.sorok===0,r.nincsPanzer);
  ok("és a NULLADIK SZINTEN (3.9.70) sem",
     r.nulladik.on===false&&r.nulladik.win===0
     &&r.nulladik.kap===0&&r.nulladik.sorok===0,r.nulladik);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
