/* 💸 AZ ELADÓS KIHÍVÁS HATÁRIDEJE A LEGELSŐ LICIT (3.9.94).

   KIMONDOTT KÉRÉS: „Csak azzal a kitétellel, hogy az első adandó alkalommal el
   kell adja. És csak akkor kapja meg a teljesített kihívás jutalmat, amikor már
   ténylegesen eladta. És akkor a határidő ilyenkor nem a 8 meccs, hanem a
   legelső licit pillanata. (Persze ha azonnal eladod, akkor is teljesítve van)"

   MIÉRT VOLT ROSSZ A NYOLC MECCS. Eladni nem rajtad múlik: a licit akkor jön,
   amikor jön, és szezonközben ablakonként EGY érkezik (saleMarketTick). Nyolc
   meccs alatt simán előfordul, hogy EGYETLEN ajánlat sem születik — ilyenkor a
   kihívás nem nehéz volt, hanem teljesíthetetlen, és az egyetlen kiút az
   INGYEN elengedés maradt. Az pedig nem eladás, hanem veszteség.

   Amit mér:
     1. a „leggyengébb láncszem" kihívás határideje `firstBid`, nem `round`;
     2. ezért az idő MÚLÁSA nem viszi el: sem a fordulós, sem a szezonos
        lejárat-kiértékelő nem nyúl hozzá;
     3. a jutalom az ELADÁS pillanatában érkezik (challengeEarlyPayable), és a
        felület is ezt írja ki (ezt az 1. szakasz méri, egy helyen a többi
        szöveggel);
     4. az ELSŐ licit visszautasítása BUKÁS — és pontosan az elsőé;
     5. a piacról levétel VÁRÓ licittel ugyanaz a bukás;
     6. …de egy sikeres ELADÁS nem büntet (a saleAcceptOffer belső levétele);
     7. és a többi kihívás határideje változatlanul meccsszám. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9043'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9043/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof chSaleRefused==="function"
    &&typeof challengeDeadlineText==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
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
    addLine=()=>{};

    /* ---- A KIHÍVÁS, KÉZZEL FELÉPÍTVE ---- */
    const cel=slots[5].player.n;
    const mk=()=>({type:"replaceWorst",target:1,targetName:cel,
      desc:`Add el ${shortName(cel)}-t az első adandó alkalommal`,
      scope:"short",startProgress:0,
      deadline:{kind:"firstBid"},
      reward:{kind:"stylePoints",amount:5,desc:"+5 pont"},
      punishment:{kind:"none",desc:"semmi"}});

    /* ---- 1. A HATÁRIDŐ FAJTÁJA ---- */
    const ch=mk();
    ki.hatarido={kind:ch.deadline.kind,
      szoveg:challengeDeadlineText(ch),
      fizetes:challengePayoutText(ch),
      korai:challengeEarlyPayable(ch)};

    /* ---- 2. AZ IDŐ MÚLÁSA NEM VISZI EL ---- */
    S.activeChallenges=[mk()];
    S.idx=29;S.seasonNumber=3;
    try{evaluateDueChallenges("round",99);}catch(e){}
    const roundUtan=S.activeChallenges.length;
    try{evaluateDueChallenges("season",99);}catch(e){}
    ki.idoMulas={roundUtan,seasonUtan:S.activeChallenges.length};

    /* ---- 4. AZ ELSŐ LICIT VISSZAUTASÍTÁSA ---- */
    S.activeChallenges=[mk()];
    S.resolvedChallenges=[];
    const rec1={n:cel,rejects:0,offer:{amount:1000},pending:true};
    saleRejectOffer(rec1);
    ki.elsoNem={marad:S.activeChallenges.length,
      lezart:(S.resolvedChallenges||[]).length,
      met:((S.resolvedChallenges||[])[0]||{}).met};
    /* …és a MÁSODIK licit visszautasítása már nem bánt (más kihívásra) */
    S.activeChallenges=[mk()];
    const rec2={n:cel,rejects:1,offer:{amount:1000},pending:true};
    saleRejectOffer(rec2);
    ki.masodikNem={marad:S.activeChallenges.length};
    /* más játékos licitje sem bánt */
    S.activeChallenges=[mk()];
    saleRejectOffer({n:slots[7].player.n,rejects:0,offer:{amount:1},pending:true});
    ki.masEmber={marad:S.activeChallenges.length};

    /* ---- 5. A PIACRÓL LEVÉTEL VÁRÓ LICITTEL UGYANAZ A BUKÁS ---- */
    /* A megerősítő maga mondja ki, hogy „az is elszáll vele" — a kihívás
       szempontjából tehát nem különbözik a nemtől. Az askConfirm-ot a próba
       kicseréli egy azonnali igenre, így a VALÓDI onYes ága fut le. */
    {const _ac=askConfirm;
     askConfirm=o=>{try{o.onYes&&o.onYes();}catch(e){}};
     /* a) VÁRÓ első licittel: bukás */
     S.activeChallenges=[mk()];S.resolvedChallenges=[];
     saleMarketState().list=[{n:cel,rejects:0,offer:{amount:5000,base:5000},
       pending:true,since:0,due:saleCareerRound()}];
     askSaleUnlist(cel);
     ki.levetelLicittel={marad:S.activeChallenges.length,
       lezart:(S.resolvedChallenges||[]).length,
       met:((S.resolvedChallenges||[])[0]||{}).met};
     /* b) licit NÉLKÜL: a levétel önmagában nem bukás — a határidő a LICIT */
     S.activeChallenges=[mk()];S.resolvedChallenges=[];
     saleMarketState().list=[{n:cel,rejects:0,offer:null,pending:true,
       since:0,due:saleCareerRound()+3}];
     askSaleUnlist(cel);
     ki.levetelLicitNelkul={marad:S.activeChallenges.length};
     askConfirm=_ac;}

    /* ---- 6. A SIKERES ELADÁS NEM BÜNTET, HANEM FIZET ---- */
    /* A VALÓDI ÚTON megy: a piaci rekordot elfogadjuk (saleAcceptOffer), az
       hívja a releasePlayer-t, az pedig a settleEarlyChallenges-t. A kezdő
       tizenegyből eladni csak PÓTLÁSSAL lehet, ezért előbb a tartalék-keretbe
       teszünk valakit, aki a posztra való — enélkül a motor (helyesen)
       „noreplacement"-tel visszautasítaná az eladást, és nem az eladást,
       hanem a keret-szabályt mérnénk. */
    S.activeChallenges=[mk()];
    S.resolvedChallenges=[];
    {const kodok=roleCodes(getCategoryFor(slots[5].pos));
     extraRoster.push({n:"Pót Elemér",ovr:70,pos:kodok.slice(0,2),age:24});}
    const st=saleMarketState();
    st.list=[{n:cel,rejects:0,offer:{amount:9000,base:9000},pending:true,
             due:saleCareerRound()}];
    const elotte=fullCareerRoster().some(x=>x.n===cel);
    let _acc=null;
    try{_acc=saleAcceptOffer(st.list[0]);}catch(e){_acc={err:String(e&&e.message||e)};}
    ki.eladas={elotte,acc:_acc,utana:fullCareerRoster().some(x=>x.n===cel),
      marad:S.activeChallenges.length,
      lezart:(S.resolvedChallenges||[]).length,
      met:((S.resolvedChallenges||[])[0]||{}).met};

    /* ---- 7. A TÖBBI KIHÍVÁS VÁLTOZATLAN ---- */
    const mas={type:"teamWins",target:3,scope:"short",startProgress:0,
      deadline:{kind:"round",value:(S.idx||0)+8},
      reward:{kind:"stylePoints",amount:1,desc:"x"},punishment:{kind:"none",desc:"y"}};
    ki.masKihivas={kind:mas.deadline.kind,szoveg:challengeDeadlineText(mas)};
    return ki;});

  console.log("=== 1. a határidő fajtája és a kiírt szövegek (1.+3.) ===");
  ok(t.hatarido.kind==="firstBid","a határidő `firstBid`, nem meccsszám",t.hatarido.kind);
  ok(t.hatarido.szoveg==="az első licitig","a felület „az első licitig”-et ír",t.hatarido.szoveg);
  ok(/ELADÁS pillanatában/.test(t.hatarido.fizetes),
     "…és hogy a jutalom az ELADÁS pillanatában érkezik",t.hatarido.fizetes);
  ok(t.hatarido.korai===true,"a korai kifizetés engedélyezett");

  console.log("=== 2. az idő múlása nem viszi el ===");
  ok(t.idoMulas.roundUtan===1&&t.idoMulas.seasonUtan===1,
     "sem a fordulós, sem a szezonos lejárat-kiértékelő nem nyúl hozzá",t.idoMulas);

  console.log("=== 4. az ELSŐ licit visszautasítása bukás ===");
  ok(t.elsoNem.marad===0&&t.elsoNem.lezart===1&&t.elsoNem.met===false,
     "az első nemre a kihívás elbukik",t.elsoNem);
  ok(t.masodikNem.marad===1,
     "a MÁSODIK licit visszautasítása már nem bánt — a határidő az ELSŐ volt",t.masodikNem);
  ok(t.masEmber.marad===1,"más játékos licitje nem érinti",t.masEmber);

  console.log("=== 5. a piacról levétel váró licittel ===");
  ok(t.levetelLicittel.marad===0&&t.levetelLicittel.lezart===1
     &&t.levetelLicittel.met===false,
     "váró ELSŐ licitnél a levétel ugyanaz a bukás, mint a nem",t.levetelLicittel);
  ok(t.levetelLicitNelkul.marad===1,
     "licit NÉLKÜL a levétel nem bukás — a határidő maga a licit",t.levetelLicitNelkul);

  console.log("=== 6. a sikeres eladás nem büntet, hanem fizet ===");
  ok(t.eladas.elotte===true&&t.eladas.utana===false,"a játékos tényleg elment",t.eladas);
  ok(t.eladas.marad===0,"a kihívás lezárult");
  ok(t.eladas.met===true,"…TELJESÍTETTKÉNT, nem bukásként",t.eladas);

  console.log("=== 7. a többi kihívás változatlan ===");
  ok(t.masKihivas.kind==="round"&&/meccs|utolsó/.test(t.masKihivas.szoveg),
     "a meccsszámos határidő a régi",t.masKihivas);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
