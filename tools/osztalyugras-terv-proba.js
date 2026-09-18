/* 🎲 OSZTÁLYUGRÁS-TERV A NYÁR ELEJÉN (3.9.96).

   KIMONDOTT KÉRÉS: „Ha lehetséges a játékos számára következő szezonban a
   szintugrás (hagyományos mód pl. D4ről egyből d2), akkor nyár végén legyen
   felül egy jól látható boxban egy leírás arról, hogy mennyibe kerülne
   minimum, és mekkora lenne a várható szint, amit el kellene majd érni. Hogy
   lehessen ezzel számolni a nyár végi költések szempontjából."

   A HIBA IDŐZÍTÉSI. Az all-in ajánlat (pyrLeapOffer) a nyár LEGVÉGÉN jön, a
   fel-/kiesés eldőlte után — vagyis akkor, amikor az átigazolásaid MÁR
   lementek. Aki nem tudta előre, hogy létezik, az a nyarat végigköltötte, és
   az ajánlat egy üres kasszát ért.

   A NEHÉZ RÉSZ, amit a próba főleg mér: a piramis fordulója a nyár UTÁN fut,
   tehát a nyári HUB-ban a pyrMyDivId() még a MOSTANI osztályod — az ugrás
   árát viszont a KÖVETKEZŐ osztályod szabja. A doboznak ezért ELŐRE kell
   vezetnie az osztályt a végtabellából, ugyanazzal a három szabállyal, amit
   a pyrRollover alkalmaz.

   Amit mér:
     1. a bajnok ága: D4-ben zárva a következő idény D3, az ugrás a D2-be visz
        — pontosan a kérésben szereplő „D4-ről egyből D2";
     2. az osztályozós helyezés MINDKÉT ágat kiírja, nem tippel;
     3. a középmezőny ága: marad, és az ugrás egy szintet visz;
     4. a kieső ág: lefelé vezet, és onnan olcsóbb az ugrás;
     5. a félretendő összeg a LEGDRÁGÁBB ág ára, és a költhető keret ebből jön;
     6. a doboz tényleg megjelenik a nyári HUB-ban, a Run-mérő FÖLÖTT — és
        eltűnik szezon közben, élő vállalásnál, illetve ha nincs mit ugrani. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9047'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9047/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof pyrLeapPlan==="function"
    &&typeof renderLeapPlan==="function"&&typeof pyrLeapTargetFrom==="function",
    null,{timeout:30000});

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

    /* NYÁR: a szezon lezárult, az ablak nyitva, nincs élő vállalás. */
    S.seasonClosed=true;S.pyrLeap=null;S.auto=false;
    hubMidSeasonMode=false;preSeasonHubMode=false;
    seasonInProgress=()=>false;

    /* A végtabellát KÉZZEL állítjuk: pontosan a helyezés a független
       változó, minden más változatlan. 16 sor, ahogy a piramis osztálya. */
    const tabla=hely=>{
      const r=[];
      for(let i=1;i<=PYR_TEAMS;i++)r.push({n:"AI "+i,you:false});
      r[hely-1]={n:teamName,you:true,player:true};
      return r;};
    const allit=(div,hely,budget)=>{
      S.pyr.my=div;S.finalTable=tabla(hely);
      S.transferBudget=(budget==null?100000:budget);};

    /* ---- 1. A BAJNOK ÁGA: D4 → D3, és az ugrás a D2-be ---- */
    allit(4,1);
    ki.bajnok=pyrLeapPlan();

    /* ---- 2. OSZTÁLYOZÓS HELYEZÉS: MINDKÉT ÁG ---- */
    allit(4,2);
    ki.playoff=pyrLeapPlan();

    /* ---- 3. KÖZÉPMEZŐNY: MARAD ---- */
    allit(4,8);
    ki.kozep=pyrLeapPlan();

    /* ---- 4. A KIESŐ ÁG ---- */
    allit(4,PYR_TEAMS);
    ki.kieso=pyrLeapPlan();

    /* ---- 5. A FÉLRETEENDŐ ÖSSZEG ÉS A KÖLTHETŐ KERET ---- */
    allit(4,2,50000);
    {const P=pyrLeapPlan();
     ki.penz={tarts:P.tarts,budget:P.budget,
       arak:P.agak.map(a=>a.price),
       max:Math.max.apply(null,P.agak.map(a=>a.price))};}

    /* ---- 6. A DOBOZ A NYÁRI HUB-BAN ---- */
    const doboz=()=>{const el=document.getElementById("hubLeapPlan");
      return {rejtve:el.classList.contains("hide"),szoveg:el.textContent||""};};
    allit(4,1,100000);
    renderLeapPlan();
    ki.hub={nyaron:doboz()};
    /* a DOM-sorrend: a doboznak a Run-mérő ELŐTT kell állnia */
    {const a=document.getElementById("hubLeapPlan"),r=document.getElementById("hubRunMeter");
     ki.hub.runElott=!!(a&&r&&(a.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING));}
    /* szezon közben nincs doboz */
    seasonInProgress=()=>true;
    renderLeapPlan();ki.hub.szezonKozben=doboz().rejtve;
    seasonInProgress=()=>false;
    /* élő vállalásnál sincs */
    S.pyrLeap={season:2,stake:1000,from:4,to:3,done:false};
    renderLeapPlan();ki.hub.eloVallalas=doboz().rejtve;
    S.pyrLeap=null;
    /* és ha nincs mit ugrani (a legfelső osztályban) */
    allit(1,8);
    renderLeapPlan();ki.hub.elvonalban=doboz().rejtve;
    /* …de utána visszatér */
    allit(4,1,100000);
    renderLeapPlan();ki.hub.visszater=!doboz().rejtve;
    return ki;});

  const agS=P=>P&&P.agak.map(a=>`${a.start}>${a.to}@${a.price}`).join(",");

  console.log("=== 1. a bajnok ága — „D4-ről egyből D2” ===");
  ok(t.bajnok&&t.bajnok.agak.length===1,"egyetlen, BIZTOS ág",agS(t.bajnok));
  ok(t.bajnok&&t.bajnok.agak[0].start===3&&t.bajnok.agak[0].to===2,
     "a következő idény D3, az ugrás a D2-be visz",agS(t.bajnok));
  ok(t.bajnok&&t.bajnok.agak[0].mikor==="biztos","…és ez nem osztályozón múlik",
     t.bajnok&&t.bajnok.agak[0].mikor);
  ok(t.bajnok&&t.bajnok.agak[0].mean!=null,"a cél-osztály ereje is ki van írva",
     t.bajnok&&t.bajnok.agak[0].mean);

  console.log("=== 2. osztályozós helyezés: MINDKÉT ág ===");
  ok(t.playoff&&t.playoff.agak.length===2,"két ág, nem tipp",agS(t.playoff));
  ok(t.playoff&&t.playoff.agak.some(a=>a.start===3)&&t.playoff.agak.some(a=>a.start===4),
     "a feljutás és a maradás ága is szerepel",agS(t.playoff));
  ok(t.playoff&&t.playoff.agak.every(a=>a.mikor!=="biztos"),
     "…és mindkettő meg van jelölve, hogy mitől függ",
     t.playoff&&t.playoff.agak.map(a=>a.mikor));

  console.log("=== 3. középmezőny: marad ===");
  ok(t.kozep&&t.kozep.agak.length===1&&t.kozep.agak[0].start===4&&t.kozep.agak[0].to===3,
     "D4-ben marad, az ugrás a D3-ba visz",agS(t.kozep));

  console.log("=== 4. a kieső ág ===");
  ok(t.kieso&&t.kieso.agak.length===1&&t.kieso.agak[0].start===5,
     "az utolsó hely a D5-be vezet",agS(t.kieso));
  ok(t.kieso&&t.kieso.agak[0].to===4&&t.kieso.agak[0].price<t.kozep.agak[0].price,
     "…és onnan OLCSÓBB az ugrás",{kieso:agS(t.kieso),kozep:agS(t.kozep)});

  console.log("=== 5. a félretendő összeg ===");
  ok(t.penz.tarts===t.penz.max,
     "a félretendő a LEGDRÁGÁBB ág ára — aki minden kimenetelre készül, ennyit nem költhet el",
     t.penz);
  ok(t.penz.arak.length===2&&t.penz.arak[0]!==t.penz.arak[1],
     "…és a két ág ára tényleg különbözik (különben a mérés semmit sem mondana)",
     t.penz.arak);

  console.log("=== 6. a doboz a nyári HUB-ban ===");
  ok(t.hub.nyaron.rejtve===false,"nyáron látszik",t.hub.nyaron.rejtve);
  ok(/Osztályugrás/.test(t.hub.nyaron.szoveg)&&/minimum/.test(t.hub.nyaron.szoveg),
     "…és kiírja, hogy mennyi a minimum",t.hub.nyaron.szoveg.slice(0,90));
  ok(/költhető el/.test(t.hub.nyaron.szoveg),
     "…meg azt is, mennyi költhető el mellette",/költhető el/.test(t.hub.nyaron.szoveg));
  ok(t.hub.runElott===true,"a Run-mérő FÖLÖTT áll — tényleg felül",t.hub.runElott);
  ok(/átlagereje \d+,\d/.test(t.hub.nyaron.szoveg)
     &&!/átlagereje \d+\.\d/.test(t.hub.nyaron.szoveg),
     "a mezőnyerő MAGYAR tizedesvesszővel áll (pyrN1), nem ponttal",
     (t.hub.nyaron.szoveg.match(/átlagereje [\d.,]+/g)||[]).slice(0,2));
  ok(t.hub.szezonKozben===true,"szezon közben elbújik",t.hub.szezonKozben);
  ok(t.hub.eloVallalas===true,"élő vállalásnál elbújik",t.hub.eloVallalas);
  ok(t.hub.elvonalban===true,"az élvonalban elbújik (nincs hova ugrani)",t.hub.elvonalban);
  ok(t.hub.visszater===true,"…és utána visszatér",t.hub.visszater);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
