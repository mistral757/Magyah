/* 🛡️ A PANZER NULLADIK SZINTJE (3.9.70)

   KIMONDOTT KÉRÉS: ha a kezdő keretben 12+ negatív személyiségvonás van (a
   VEZETŐI KÉPESSÉGET nem számolva), a játék még a legelső szezon előtt
   felajánlja, hogy a klub 0. szinten elindítsa a Panzerkampfwagent. A
   nulladik szint HÁROM dolgot tud — pontot gyűjt, megfordítja a jellem
   hatását, és engedi fejleszteni a Fordított jellemet —, és „semmi mást".

   EZÉRT A PRÓBA GERINCE A TAGADÁS. Egy felvett filozófia a játékban eddig
   MINDIG teljes erővel hatott; a nulladik szint az egyetlen kivétel, tehát
   minden csatornát külön kell megmérni, hogy tényleg néma-e — a szintet, a
   hangolást, a képességfát, a filozófus-edző ingyen szintjét, a félelmet, a
   meccs-ujjlenyomatot és a barátságos torna Panzer-szabályát (ami HÁTRÁNY:
   azt sem szabad korán kiosztani).

   A másik fele az idényzárás: ott a felgyűlt mérföldköveknek EGYSZERRE kell
   életbe lépniük — a fejlődés nem veszhet el attól, hogy közben nem látszott.

   Használat: node tools/panzer-nulladik-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8937'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8937/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";
    S.seasonNumber=1;S.idx=0;S.seasonClosed=false;
    S.style=null;S.style2=null;S.styleView=1;S.pz0Offer=null;
    S.ms={done:{},seen:{},sp:0,spEarned:0,cash:0,log:[],t:{},cats:{},missed:{},pend:{}};
    careerPool={};S.careerStats={};
    /* a Panzer zárja nyitva — különben a kapu jogosan fog meg mindent */
    window.unlockStyleOk=()=>true;
    window.saveGame=()=>{};
    window.addLine=()=>{};

    /* ── 1. A SZÁMLÁLÓ: a vezetői képesség NEM számít ── */
    const mk=(kar,kap,ver)=>({n:"x",karI:kar,kapI:kap,verI:ver});
    o.szamlalo={
      /* csak gyenge karizma → 0 (a feloldás 14-es számlálója ezt még számolná) */
      csakKarizma:pz0BadTraits(mk(0,4,3)),
      csakKapcsolat:pz0BadTraits(mk(3,0,3)),
      csakVer:pz0BadTraits(mk(3,4,VER_LEVELS.length-1)),
      mindharom:pz0BadTraits(mk(0,0,VER_LEVELS.length-1)),
      /* ugyanez a feloldás régi számlálóján: ott a karizma IS számít */
      regiCsakKarizma:unlockBadTraits(mk(0,4,3)),
      regiMindharom:unlockBadTraits(mk(0,0,VER_LEVELS.length-1))};

    /* ── 2. A MÉRÉS: a kezdő 11 + 4 csere ── */
    const nehez=()=>({n:"n",karI:3,kapI:0,verI:VER_LEVELS.length-1});   /* 2 pont/fő */
    const konnyu=()=>({n:"k",karI:0,kapI:5,verI:1});                    /* 0 pont (karizma nem számít) */
    /* A `slots` modul-szintű `let`, a `BENCH` pedig `const` OBJEKTUM: egyiket
       sem lehet a window-on át kicserélni (a window.slots= néma mellékvágány
       volna, a valódi tömb pedig tovább gyűlne hívásról hívásra). Ezért a
       tömböt ÜRÍTJÜK, az objektumot pedig kulcsonként írjuk át. */
    const allit=(nehezDb)=>{
      slots.length=0;
      BENCH_KEYS.forEach(k=>{BENCH[k]=null;});
      for(let i=0;i<11;i++)slots.push({player:(i<nehezDb?nehez():konnyu())});
      DRAFT_BENCH_CATS.forEach((c,i)=>{BENCH[c.key]=((11+i)<nehezDb?nehez():konnyu());});};
    window.unlockNoteDraft=()=>{};    /* a feloldás külön próba tárgya */
    S.pz0Offer=null;allit(5);  o.mert5 ={db:pz0NoteStart(),van:!!S.pz0Offer};   /* 10 < 12 */
    S.pz0Offer=null;allit(6);  o.mert6 ={db:pz0NoteStart(),van:!!S.pz0Offer};   /* 12 = 12 */
    S.pz0Offer=null;allit(15); o.mert15={db:pz0NoteStart(),van:!!S.pz0Offer};   /* 30 */

    /* ── 3. AZ AJÁNLAT KAPUJA ── */
    S.pz0Offer={db:14,asked:0};
    const kapu=[];
    const pr=(cim,f)=>{const v=(()=>{try{return f();}catch(e){return "HIBA";}})();
      kapu.push({cim,lehet:v});};
    pr("1. idény, 0. forduló",()=>{S.seasonNumber=1;S.idx=0;return pz0CanOffer();});
    pr("1. idény, 1 forduló után",()=>{S.idx=1;return pz0CanOffer();});
    pr("2. idény",()=>{S.idx=0;S.seasonNumber=2;return pz0CanOffer();});
    pr("már van filozófia",()=>{S.seasonNumber=1;S.style={key:"beton"};return pz0CanOffer();});
    pr("a Panzer zárva",()=>{S.style=null;window.unlockStyleOk=(k)=>k!=="panzer";
      const v=pz0CanOffer();window.unlockStyleOk=()=>true;return v;});
    pr("kevés a negatív vonás",()=>{S.pz0Offer={db:11,asked:0};const v=pz0CanOffer();
      S.pz0Offer={db:14,asked:0};return v;});
    o.kapu=kapu;

    /* ── 4. AZ INDÍTÁS ── */
    S.seasonNumber=1;S.idx=0;S.style=null;
    window.renderStylePanel=()=>{};
    const ind=pz0Start();
    o.indit={ok:ind.ok,kulcs:S.style&&S.style.key,pre:!!(S.style&&S.style.pre),
      /* a filozófia MEGVAN — a jellem fordítása ezen múlik */
      hasKey:styleHasKey("panzer"),absOn:panzerAbsOn(),
      /* …de NEM hat teljes erővel */
      live:styleHasLive("panzer")};
    /* a második indítás már nem megy, és a rendes választás is elzárult */
    o.masodszor=pz0Start().ok;
    o.valasztasElzarult=(()=>{S.seasonClosed=true;const v=styleCanChoose();S.seasonClosed=false;return v;})();

    /* ── 5. AMIT A NULLADIK SZINT NEM TUD ── */
    const st=S.style;
    styleLvlCacheClear();
    o.nema={
      szint:styleLevel(st),
      hangolas:dialListIn(st).length,
      felelem:fearOn(),
      felelemSzint:fearLevel(),
      /* a barátságos torna Panzer-szabálya HÁTRÁNY — azt sem osztjuk ki korán */
      tornaSzabaly:styleHasLive("panzer")};
    /* a képességfa: EGYETLEN képesség vehető */
    S.ms.sp=100000;
    o.vasarlas={
      mas:styleBuyTrait("vasfegyelem"),
      az:styleBuyTrait("abs_jellem")};
    /* …és a hatásokban is csak az az egy jelenik meg — még akkor is, ha egy
       másikat kézzel beírunk a fába (a filozófus-edző ingyen szintje így jönne) */
    st.traits.vasfegyelem=3;
    styleLvlCacheClear();
    o.hatasok={
      /* a Fordított jellem hat: a 2. szinten a „jó fej" is átfordul */
      absSzint:panzerAbsLevel(),
      /* a becsempészett képesség viszont nem ad semmit */
      fxDb:styleActiveFx().length};
    delete st.traits.vasfegyelem;
    styleLvlCacheClear();

    /* ── 6. A PONT VISZONT GYŰLIK ── */
    /* egy Panzer-mérföldkövet teljesítettnek jelölünk a pásztázón keresztül */
    const lista=styleMsList(st)||[];
    o.msVan=lista.length>0;
    const spElotte=S.ms.sp;
    if(lista.length){
      const def=lista[0];
      const eredeti=def.p;def.p=()=>def.n;       /* teljesítve */
      styleScan();
      def.p=eredeti;}
    o.pontGyult=(S.ms.sp>spElotte);
    o.msDone=Object.keys(styleMsStateIn(st).done).length;

    /* ── 7. AZ IDÉNYZÁRÁS: MINDEN EGYSZERRE ÉLETBE LÉP ── */
    /* a felgyűlt SXP-t úgy hozzuk össze, hogy a fát félig kifizetjük */
    st.traits.abs_jellem=3;st.traits.vasfegyelem=3;st.traits.falka=2;
    styleLvlCacheClear();
    o.zarasElott={szint:styleLevel(st),hangolas:dialListIn(st).length,felelem:fearOn()};
    S.seasonClosed=true;                          /* az első idény lezárult */
    const grad=pz0Graduate();
    styleLvlCacheClear();
    o.zarasUtan={grad,pre:!!st.pre,szint:styleLevel(st),
      hangolas:dialListIn(st).length,felelem:fearOn(),
      live:styleHasLive("panzer"),
      /* a szint nem 1-ről indul: a nulladik szinten gyűjtött munka beszámít */
      rang:styleRankName(styleLevel(st),"panzer")};
    o.masodszorGrad=pz0Graduate();

    /* ── 8. MÁS FILOZÓFIÁBAN NINCS `pre` ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    styleLvlCacheClear();
    o.beton={szint:styleLevel(S.style)>0,hangolas:dialListIn(S.style).length>0,
      live:styleLive(S.style)};
    return o;});

  /* ── 9. A FELÜLET: a felugró ablak és a panel kártyája ── */
  const ui=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";
    S.seasonNumber=1;S.idx=0;S.seasonClosed=false;
    S.style=null;S.style2=null;S.pz0Offer={db:17,asked:0};
    window.unlockStyleOk=()=>true;
    window.saveGame=()=>{};
    /* a megerősítő modálisa */
    pz0Tick();
    const m=document.getElementById("hubTacticConfirmModal");
    o.ablak={nyitva:!!(m&&!m.classList.contains("hide")),
      cim:(document.getElementById("hubTacticConfirmTitle")||{}).textContent||"",
      szoveg:((document.getElementById("hubTacticConfirmBody")||{}).textContent||""),
      asked:!!S.pz0Offer.asked};
    /* másodszor már nem ugrik fel */
    m.classList.add("hide");
    pz0Tick();
    o.masodszor=!!(m&&!m.classList.contains("hide"));
    /* a panelen viszont OTT MARAD a gomb */
    const h=styleChooserHtml(null);
    o.panelGomb=/pz0StartBtn/.test(h)&&/nulladik szint/i.test(h);
    /* és a nulladik szintű filozófia sávja */
    S.style={key:"panzer",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,pre:1};
    o.sav=/Nulladik szint/.test(pz0BannerHtml(S.style));
    delete S.style.pre;
    o.savNelkul=pz0BannerHtml(S.style);
    return o;});

  console.log("=== a számláló: a vezetői képesség NEM számít ===");
  ok("csak gyenge karizma → 0 pont (a feloldás régi számlálója még 1-et adna)",
     r.szamlalo.csakKarizma===0&&r.szamlalo.regiCsakKarizma===1,r.szamlalo);
  ok("a kapcsolódás és a vérmérséklet viszont 1-1, együtt 2 a plafon fejenként",
     r.szamlalo.csakKapcsolat===1&&r.szamlalo.csakVer===1&&r.szamlalo.mindharom===2
     &&r.szamlalo.regiMindharom===3,r.szamlalo);

  console.log("\n=== a mérés: a kezdő 11 + 4 csere ===");
  ok("10 vonásnál még nincs ajánlat, 12-nél már van",
     r.mert5.db===10&&r.mert5.van===false&&r.mert6.db===12&&r.mert6.van===true,
     {m5:r.mert5,m6:r.mert6});
  ok("a tizenöt fős plafon 30",r.mert15.db===30&&r.mert15.van===true,r.mert15);

  console.log("\n=== az ajánlat kapuja ===");
  const K=(i)=>r.kapu[i]&&r.kapu[i].lehet;
  ok("csak a LEGELSŐ szezon előtt: az 1. forduló után és a 2. idényben már nem",
     K(0)===true&&K(1)===false&&K(2)===false,r.kapu);
  ok("meglévő filozófiánál, zárt Panzernél és 12 alatt sem",
     K(3)===false&&K(4)===false&&K(5)===false,r.kapu);

  console.log("\n=== az indítás ===");
  ok("a filozófia FEL VAN VÉVE, és a jellem hatása azonnal megfordul",
     r.indit.ok===true&&r.indit.kulcs==="panzer"&&r.indit.pre===true
     &&r.indit.hasKey===true&&r.indit.absOn===true,r.indit);
  ok("…de NEM hat teljes erővel",r.indit.live===false,r.indit);
  ok("és a döntés végleges: sem újraindítani, sem az idény végén választani nem lehet",
     r.masodszor===false&&r.valasztasElzarult===false,
     {masodszor:r.masodszor,valasztas:r.valasztasElzarult});

  console.log("\n=== amit a nulladik szint NEM tud ===");
  ok("a szint 0 marad",r.nema.szint===0,r.nema);
  ok("nincs hangolás",r.nema.hangolas===0,r.nema);
  ok("nincs félelem és nincs rettenet",r.nema.felelem===false&&r.nema.felelemSzint===0,r.nema);
  ok("a barátságos torna Panzer-HÁTRÁNYA sem jár még",r.nema.tornaSzabaly===false,r.nema);
  ok("a képességfából CSAK a Fordított jellem vehető meg",
     r.vasarlas.mas.ok===false&&/Fordított jellem/.test(r.vasarlas.mas.reason)
     &&r.vasarlas.az.ok===true,r.vasarlas);
  ok("és a fába kézzel beírt másik képesség sem ad hatást (a filozófus-edző ingyen szintje így jönne)",
     r.hatasok.absSzint===1&&r.hatasok.fxDb===1,r.hatasok);

  console.log("\n=== amit viszont igen ===");
  ok("a Panzernek vannak mérföldkövei, és a pont GYŰLIK a nulladik szinten is",
     r.msVan===true&&r.pontGyult===true&&r.msDone>=1,
     {msVan:r.msVan,gyult:r.pontGyult,done:r.msDone});

  console.log("\n=== az első idény lezárása ===");
  ok("lezárás előtt minden néma",
     r.zarasElott.szint===0&&r.zarasElott.hangolas===0&&r.zarasElott.felelem===false,r.zarasElott);
  ok("lezárás után a filozófia teljes értékű lesz",
     r.zarasUtan.grad===true&&r.zarasUtan.pre===false&&r.zarasUtan.live===true
     &&r.zarasUtan.hangolas>0&&r.zarasUtan.felelem===true,r.zarasUtan);
  ok("és a közben elvégzett munka EGYSZERRE lép életbe: a szint nem 1-ről indul",
     r.zarasUtan.szint>1&&!!r.zarasUtan.rang,r.zarasUtan);
  ok("a teljes értékűvé válás egyszeri",r.masodszorGrad===false);

  console.log("\n=== más filozófiában nincs nulladik szint ===");
  ok("a Beton az első pillanattól teljes értékű",
     r.beton.szint===true&&r.beton.hangolas===true&&r.beton.live===true,r.beton);

  console.log("\n=== a felület ===");
  ok("a felugró ablak megszólal, a saját címével és a végleges-figyelmeztetéssel",
     ui.ablak.nyitva===true&&/Panzerkampfwagen/.test(ui.ablak.cim)
     &&/VÉGLEGES/.test(ui.ablak.szoveg)&&ui.ablak.asked===true,
     {nyitva:ui.ablak.nyitva,cim:ui.ablak.cim,asked:ui.ablak.asked});
  ok("és karrierenként CSAK EGYSZER — másodszorra már nem",ui.masodszor===false);
  ok("a döntés helye viszont a panel: ott a gomb akkor is ott van",ui.panelGomb===true);
  ok("a nulladik szinten álló filozófia sávja kimondja, hol tart",
     ui.sav===true&&ui.savNelkul==="",{sav:ui.sav,nelkul:ui.savNelkul});

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
