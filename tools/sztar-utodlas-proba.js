/* ⭐ HA A SZTÁR ELMEGY — a trón és az utódlás (3.9.63)

   BEJELENTETT KÉRDÉS: „Ha a sztárom el akar menni, akkor a helyére jövő
   játékos veszi át a sztár szerepet vagy senki nem lesz sztár? Vagy újra tudok
   választani?" — és a válasz eddig az volt, hogy EGYIK SEM. A név be volt
   égetve, a szerep pedig némán meghalt vele: a mérföldkövek nullán álltak, a
   hírességpont nem gyűlt tovább, a sztárhoz kötött képességek sosem
   teljesültek — és minderről a játék egy szót sem szólt.

   A PRÓBA MAGJA NEM A GOMB, HANEM A NÉMA HALÁL: azt méri, hogy a hiány
   KIDERÜL-E (az őr minden távozási úton lecsap), hogy a stílus a hiány alatt
   is ÁLL (a fa és a teljesített mérföldkövek megmaradnak), és hogy az utód
   tényleg ÁTVESZI a szerepet — a hírnév ára pedig a TÁVOZÁSKOR dől el, nem a
   kinevezéskor.

   Használat: node tools/sztar-utodlas-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8915'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8915/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── A DÍSZLET. Nem teljes karrier: a szerep állapotgépét mérjük, és ahhoz
       a keret + a stílus-állapot elég. ── */
    gameMode="career";
    S.seasonNumber=5;S.morale=70;
    S.careerStats=S.careerStats||{};
    const keret=[];
    const csinal=(n,ovr)=>{const x={n,pos:["CS"],ovr,age:27,pot:4000};keret.push(x);return x;};
    csinal("Első Sztár",88);csinal("Örökös Ödön",84);csinal("Padon Pál",70);
    window.fullCareerRoster=()=>keret.slice();
    window.msRoster=()=>keret.slice();
    S.careerStats["Első Sztár"]={matches:120,g:90,a:40};
    S.careerStats["Örökös Ödön"]={matches:30,g:8,a:6};
    S.style={key:"sztar",chosenSeason:1,traits:{},ms:{done:{sz_s_prod:1},seen:{},t:{}},star:"Első Sztár"};
    const F=fameState();
    F.pts=2000;F.season=140;F.startSeason=1;
    F.goalPct=0.07;F.wageMult=3.5;F.snub=2;F.numWant={num:10};

    /* ── 1. AMÍG ITT VAN, NEM CSERÉLHETŐ ── */
    o.amigItt={
      sztar:fameStarName(),
      ures:starVacant(),
      alku:starDealOn(),
      csereProba:starHeirName("Örökös Ödön")};
    /* és az őr sem csinál semmit */
    starWatch();
    o.orNyugton={sztar:fameStarName(),pts:Math.round(fameState().pts)};

    /* ── 2. A TÁVOZÁS: az őr lecsap, bármelyik úton ment el ── */
    const kiesik=(n)=>{const i=keret.findIndex(x=>x.n===n);if(i>=0)keret.splice(i,1);};
    kiesik("Első Sztár");
    const moralElotte=S.morale;
    starWatch();
    o.tavozas={
      sztar:fameStarName(),
      ures:starVacant(),
      pts:Math.round(fameState().pts),
      moralEsett:moralElotte-S.morale,
      /* a személyhez szólt alkuk elévülnek */
      goalPct:fameState().goalPct,wageMult:fameState().wageMult,
      snub:fameState().snub,numWant:fameState().numWant,
      /* a szorzó is visszaáll: halott sztár nem emeli az elvágyódást */
      leaveMult:starLeaveMult(),
      /* a fa és a teljesített mérföldkő MEGMARAD */
      fa:JSON.stringify(S.style.traits),msDone:S.style.ms.done.sz_s_prod||0,
      csarnok:starHist().map(x=>({n:x.n,how:x.how,pts:x.pts,matches:x.matches}))};

    /* ── 3. A HIÁNY LÁTSZIK ── */
    o.felulet={
      kartya:/Kinevezem az ut/.test(starVacantHtml()),
      csarnokHtml:/Első Sztár/.test(starHallHtml()),
      valaszto:/Ki legyen a klub új arca/.test(styleStarPickerHtml("heir")),
      /* a régi szöveg nem szivárog át az utódlásba */
      nemVegleges:!/végleges/.test(styleStarPickerHtml("heir")),
      elsoValasztas:/Ki lesz a sztár/.test(styleStarPickerHtml(null))};

    /* ── 4. AZ UTÓDLÁS ── */
    o.rossz={
      kivulrol:starHeirName("Idegen Imre"),
      ures:starHeirName(null)};
    const moral2=S.morale;
    o.kinevez=starHeirName("Örökös Ödön");
    o.utana={
      sztar:fameStarName(),
      ures:starVacant(),
      alku:starDealOn(),
      pts:Math.round(fameState().pts),      /* a kinevezés NEM kerül pontba */
      startSeason:fameState().startSeason,  /* az ő ideje most kezdődik */
      moralVissza:S.morale-moral2,
      msDone:S.style.ms.done.sz_s_prod||0};
    /* és ő sem cserélhető, amíg a keretben van */
    o.ujCsere=starHeirName("Padon Pál");

    /* ── 5. A VISSZAVONULÁS DRÁGÁBB VAGY OLCSÓBB? ── */
    fameState().pts=1000;
    starMarkRetired("Örökös Ödön");
    kiesik("Örökös Ödön");
    starWatch();
    o.nyugdij={pts:Math.round(fameState().pts),
      how:starHist()[starHist().length-1].how};

    /* ── 6. RÉGI MENTÉS: az első őrjárat ingyenes ── */
    S.style={key:"sztar",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:"Rég Elment"};
    fameState().pts=1500;
    const moral3=S.morale;
    _starLoadCheck=true;
    starWatch();
    o.regiMentes={pts:Math.round(fameState().pts),ures:starVacant(),
      moralValtozas:S.morale-moral3,
      how:starHist()[starHist().length-1].how};

    /* ── 7. A FIGYELMEZTETÉS ── */
    S.style={key:"sztar",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:"Örökös Ödön"};
    keret.push({n:"Örökös Ödön",pos:["CS"],ovr:84,age:27,pot:4000});
    fameState().pts=2000;
    o.figyelmeztetes={
      sztarra:/klub arca/.test(starLossWarnHtml("Örökös Ödön")),
      szamokkal:/1\s?200|1200/.test(starLossWarnHtml("Örökös Ödön").replace(/\s/g,"")),
      masra:starLossWarnHtml("Padon Pál")};
    return o;});

  console.log("=== amíg a sztár a keretben van ===");
  ok("ő a sztár, a trón nem üres, az alku él",
     r.amigItt.sztar==="Első Sztár"&&r.amigItt.ures===false&&r.amigItt.alku===true,r.amigItt);
  ok("és NEM cserélhető le egy jobb ötletre",
     r.amigItt.csereProba.ok===false&&/nem cser/.test(r.amigItt.csereProba.reason),r.amigItt.csereProba);
  ok("az őr nyugton hagyja (nem büntet a semmiért)",
     r.orNyugton.sztar==="Első Sztár"&&r.orNyugton.pts===2000,r.orNyugton);

  console.log("\n=== a távozás ===");
  ok("az őr LECSAP: a trón megüresedik",
     r.tavozas.sztar===null&&r.tavozas.ures===true,r.tavozas);
  ok("a hírességpont 60%-a marad (eladás/elengedés)",r.tavozas.pts===1200,r.tavozas.pts);
  ok("a klub morált veszít",r.tavozas.moralEsett===8,r.tavozas.moralEsett);
  ok("a személyhez szólt alkuk mind elévülnek",
     r.tavozas.goalPct===0&&r.tavozas.wageMult===1&&r.tavozas.snub===0&&!r.tavozas.numWant,r.tavozas);
  ok("és a halott sztár nem emeli tovább az elvágyódást",r.tavozas.leaveMult===1,r.tavozas.leaveMult);
  ok("a képességfa és a teljesített mérföldkő MEGMARAD",
     r.tavozas.msDone===1,r.tavozas);
  ok("a távozó bekerül a klub arcai közé, a saját számaival",
     r.tavozas.csarnok.length===1&&r.tavozas.csarnok[0].n==="Első Sztár"
     &&r.tavozas.csarnok[0].how==="gone"&&r.tavozas.csarnok[0].pts===2000
     &&r.tavozas.csarnok[0].matches===120,r.tavozas.csarnok);

  console.log("\n=== a hiány látszik ===");
  ok("az üres trón kártyája cselekvésre hív",r.felulet.kartya===true,r.felulet);
  ok("a csarnok kiírja a volt arcot",r.felulet.csarnokHtml===true);
  ok("a választó utódlás-üzemmódban más szöveget mond",
     r.felulet.valaszto===true&&r.felulet.elsoValasztas===true,r.felulet);
  ok("és NEM ígér véglegességet ott, ahol a filozófia már megvan",
     r.felulet.nemVegleges===true);

  console.log("\n=== az utódlás ===");
  ok("kívülálló nem nevezhető ki",r.rossz.kivulrol.ok===false,r.rossz.kivulrol);
  ok("üres névre sem",r.rossz.ures.ok===false,r.rossz.ures);
  ok("a kerettag kinevezése sikerül",r.kinevez.ok===true,r.kinevez);
  ok("ő az új sztár, a trón betelt, az alku újraindul",
     r.utana.sztar==="Örökös Ödön"&&r.utana.ures===false&&r.utana.alku===true,r.utana);
  ok("a kinevezés NEM kerül hírességpontba (az ár a távozáskor ment le)",
     r.utana.pts===1200,r.utana.pts);
  ok("az ő ideje a mostani idénytől számít",r.utana.startSeason===5,r.utana.startSeason);
  ok("a klub visszakap a morálból",r.utana.moralVissza===4,r.utana.moralVissza);
  ok("a korábban teljesített mérföldkő nem vész el",r.utana.msDone===1,r.utana.msDone);
  ok("és az ÚJ sztár sem cserélhető, amíg a keretben van",
     r.ujCsere.ok===false,r.ujCsere);

  console.log("\n=== a hűség ára ===");
  ok("aki NÁLAD vonult vissza, azzal a hírnév 85%-a marad",
     r.nyugdij.pts===850&&r.nyugdij.how==="retired",r.nyugdij);

  console.log("\n=== régi mentés ===");
  ok("a betöltés utáni első őrjárat INGYENES (nincs hírnév-veszteség)",
     r.regiMentes.pts===1500&&r.regiMentes.ures===true,r.regiMentes);
  ok("és morált sem visz — egy régi kárért nem büntetünk utólag",
     r.regiMentes.moralValtozas===0,r.regiMentes.moralValtozas);

  console.log("\n=== a figyelmeztetés ===");
  ok("az eladási/elvágyódási képernyő kimondja, hogy ő a klub arca",
     r.figyelmeztetes.sztarra===true,r.figyelmeztetes);
  ok("és SZÁMMAL mondja meg, mennyi hírnév marad",
     r.figyelmeztetes.szamokkal===true,r.figyelmeztetes);
  ok("másnál néma (nem ijesztget feleslegesen)",
     r.figyelmeztetes.masra==="",r.figyelmeztetes.masra);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
