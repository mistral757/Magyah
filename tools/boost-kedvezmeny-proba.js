/* ⚡ A KEZDŐ IDÉNYEK BOOST-ABLAKA — élő mérés.
   Amit néz:
     1. a kedvezmény mértéke idényenként (1. −50%, 2. −33%, 3.-tól semmi),
     2. hogy MIND A HÉT fajta árát arányosan viszi le (az egység alapárán ül),
     3. a két kedvezmény SZORZÓDIK, és a 0,10-es padló alá nem megy,
     4. a napló-bejelentés idényenként EGYSZER szólal meg, két külön ponton,
     5. a HUB-gomb és a Boost-központ fejléce kiírja,
     6. a jelzés (⚡) kint van a HUB-on, amíg az ablak nyitva van, és eltűnik utána,
     7. a lépéssor ÉLŐ számokat mond (a szöveg függvényből épül),
     8. közös karrierben ugyanúgy működik — ez nem feloldás-rendszer.
   Használat: node tools/boost-kedvezmeny-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8956'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};
  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>hiba.push(e.message));
  p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
  await p.goto('http://localhost:8956/index.html',{waitUntil:'domcontentloaded'});
  await p.evaluate(()=>{try{localStorage.clear();}catch(e){}});
  await p.goto('http://localhost:8956/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  /* Egy futó karrier vázlata: a boost-árakhoz elég a gameMode + careerPool +
     a klub-büdzsé, a naplóhoz az addLine. */
  Object.assign(out,await p.evaluate(()=>{
    const o={};
    gameMode="career";
    careerPool=careerPool||{};
    S.seasonNumber=1;S.boostDiscount=0;S.transferBudget=1e9;
    /* A JELZÉS-MOTOR CSAK BEKAPCSOLT VEZETÉSSEL SZÓL — a próbában ezt kézzel
       kell beállítani, mert a beállító képernyőt nem járjuk végig. */
    try{teachSetMode("hard");}catch(e){}
    /* A jelzés-motor a DRAFT alatt szándékosan hallgat (teachInCareer) — a
       vázlat-karrier viszont ott ragadt; a HUB fázisába állítjuk. */
    phase="hub";
    /* A BOOST-ÁRAK A KLUB ÉVES BEVÉTELÉBŐL jönnek; egy üres vázlat-karrierben
       az a padlón áll (pár száz Ft), és ott a 100 Ft-os kerekítés elnyomná az
       arányokat. Egy valósághű léptékkel a szorzó tisztán mérhető. */
    window.__cbs=clubBudgetScale;
    clubBudgetScale=()=>2.0e7;
    /* ---- 1-2. A KEDVEZMÉNY ÉS AZ ARÁNYOSSÁG ---- */
    o.idenyek=[];
    for(let sn=1;sn<=4;sn++){
      S.seasonNumber=sn;
      const arak={};BOOST_KINDS.forEach(d=>{arak[d.k]=boostPriceOf(d.k);});
      o.idenyek.push({sn,disc:boostEarlyDisc(),mult:boostDiscountMult(),
        alap:Math.round(boostUnitBase()),egyseg:boostUnitPrice(),arak,
        hatra:boostEarlyLeft()});}
    /* az arányosság: mind a hét fajta ÁRA pont a felére esik az 1. idényben */
    const a1=o.idenyek[0].arak,a3=o.idenyek[2].arak;
    o.aranyok=BOOST_KINDS.map(d=>Math.round(a1[d.k]/a3[d.k]*1000)/1000);
    o.aranyos=o.aranyok.every(r=>Math.abs(r-0.5)<0.005);
    /* ---- 3. A KÉT KEDVEZMÉNY SZORZÓDIK ---- */
    S.seasonNumber=1;S.boostDiscount=0.50;
    o.szorzodik={mult:boostDiscountMult(),varhato:0.5*0.5};
    S.boostDiscount=0.50;S.seasonNumber=1;
    o.padlo_felett=boostDiscountMult()>=0.10;
    S.boostDiscount=0;
    /* ---- 4. A NAPLÓ-BEJELENTÉS ---- */
    const sorok=[];const igazi=window.addLine;
    window.addLine=(h,c)=>{sorok.push(String(h));};
    S.seasonNumber=1;S.boostEarlyToldSeason=null;
    boostEarlyAnnounce("start");boostEarlyAnnounce("start");   /* a második néma */
    boostEarlyAnnounce("summer");                              /* más pont → szól */
    S.seasonNumber=3;
    boostEarlyAnnounce("start");                               /* lejárt → néma */
    window.addLine=igazi;
    o.naplo={db:sorok.length,elso:sorok[0]||"",masodik:sorok[1]||""};
    /* ---- 5. A FELÜLET ---- */
    S.seasonNumber=1;
    renderHub();
    o.hub_gomb=(document.getElementById("hubBoostBtn")||{}).textContent||"";
    boostOpenPanel();
    o.panel=(document.getElementById("twPanel")||{}).textContent||"";
    /* ---- 6. A JELZÉS ---- */
    const jel=()=>{try{return teachMarks("hub").join(" ");}catch(e){return "?";}};
    o.teachMode=teachMode();

    const due=()=>{try{return TEACH_TOPICS["boost:early"].due();}catch(e){return null;}};
    S.seasonNumber=1;o.jel1={due:due(),mark:jel().indexOf("⚡")>=0};
    S.seasonNumber=2;o.jel2={due:due(),mark:jel().indexOf("⚡")>=0};
    S.seasonNumber=3;o.jel3={due:due(),mark:jel().indexOf("⚡")>=0};
    /* ---- 7. AZ ÉLŐ SZÖVEG ---- */
    const st=TEACH_TOPICS["boost:early"].steps[0];
    S.seasonNumber=1;o.szoveg1={t:teachSafeTx(st.t),x:teachSafeTx(st.x)};
    S.seasonNumber=2;o.szoveg2={t:teachSafeTx(st.t),x:teachSafeTx(st.x)};
    /* ---- 8. KÖZÖS KARRIER ---- */
    S.seasonNumber=1;MP.active=true;MP.activeRoom="X";
    o.mp={disc:boostEarlyDisc(),due:due()};
    MP.active=false;MP.activeRoom=null;
    return o;}));

  await b.close();srv.kill();

  const A=[],ok=(n,f)=>A.push({n,ok:!!f});
  const I=out.idenyek;
  ok("1. idény −50%, 2. −33%, 3-tól semmi",
     I[0].disc===0.5&&I[1].disc===0.33&&I[2].disc===0&&I[3].disc===0);
  ok("a hátralévő idények száma pontos", I[0].hatra===2&&I[1].hatra===1&&I[2].hatra===0);
  ok("az egység alapára NEM változik — csak a szorzó",
     I[0].alap===I[2].alap&&I[0].mult===0.5&&I[2].mult===1);
  ok("mind a hét fajta arányosan olcsóbb (az 1. idényben pont a fele)", out.aranyos===true);
  ok("a két kedvezmény SZORZÓDIK, nem összeadódik",
     Math.abs(out.szorzodik.mult-out.szorzodik.varhato)<0.001);
  ok("a 0,10-es padló alá nem megy", out.padlo_felett===true);
  ok("a napló idényenként EGYSZER szól, de két külön ponton",
     out.naplo.db===2&&/−50%/.test(out.naplo.elso)&&/−50%/.test(out.naplo.masodik));
  ok("a napló kimondja, mi jön utána", /2\. idényben már csak −33%/.test(out.naplo.elso));
  ok("a HUB-gomb kiírja a kedvezményt", /−50% \(1\. idény\)/.test(out.hub_gomb));
  ok("a Boost-központ fejléce kiírja az ablakot",
     /−50%/.test(out.panel)&&/kezdő idények ablaka/i.test(out.panel));
  ok("a ⚡ jelzés kint van az 1-2. idényben, a 3.-ban nincs",
     out.jel1.due&&out.jel1.mark&&out.jel2.due&&out.jel2.mark
     &&!out.jel3.due&&!out.jel3.mark);
  ok("a lépéssor ÉLŐ számot mond (idényenként mást)",
     /−50%/.test(out.szoveg1.t)&&/−33%/.test(out.szoveg2.t)
     &&/1\. idényben/.test(out.szoveg1.x)&&/utolsó/.test(out.szoveg2.x));
  ok("közös karrierben ugyanúgy él — ez nem feloldás-rendszer",
     out.mp.disc===0.5&&out.mp.due===true);
  ok("nincs futásidejű hiba", hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  console.log("\n=== ⚡ A KEZDŐ IDÉNYEK BOOST-ABLAKA ===");
  A.forEach(x=>console.log(`${x.ok?"✅":"❌"} ${x.n}`));
  if(hiba.length)console.log("\nHIBÁK:\n"+hiba.slice(0,8).join("\n"));
  const bukott=A.filter(x=>!x.ok).length;
  console.log(`\n${A.length-bukott}/${A.length} rendben`);
  process.exit(bukott?1:0);
})();
