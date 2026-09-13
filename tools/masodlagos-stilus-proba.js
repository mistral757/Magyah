/* 🎯 A MÁSODLAGOS CSAPATSTÍLUS (3.9.64)

   KIMONDOTT KÉRÉS: „3. szezon végétől nyíljon ki a secondary csapatstílus
   választás. […] szintén kimaxolhatod, szintén érvényesek a szerepei,
   hangolásai, képességei, mérföldkövei. 1 nehezítés van: a secondary
   csapatstílus mérföldkövei 3x lassabban gyűlnek. […] A csapatstílus pontot
   egyetlen nagy poolba gyűjti a két stílus."

   MIÉRT EZ A LEGVESZÉLYESEBB VÁLTOZTATÁS. A rendszer eddig EGY függvénnyel
   (styleState) válaszolt három különböző kérdésre: mi hat a pályán, melyiket
   nézem, és melyik stílusé ez az adat. Egy stílusnál a három egybeesett —
   kettőnél szétválik, és minden hívási hely eldöntheti magát rosszul.

   A PRÓBA EZT A HÁRMAT MÉRI KÜLÖN-KÜLÖN: a hatások UNIÓJÁT (képesség,
   szerep, hangsúly), a NÉZET függetlenségét a játékmenettől, és az ADAT
   gazdáját (a sztár akkor is a sztáros filozófiáé, ha az a másodlagos).

   Használat: node tools/masodlagos-stilus-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8917'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8917/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";
    phase="hub";            /* a pásztázás draftban szándékosan néma */
    S.seasonNumber=4;S.seasonClosed=true;
    S.ms={done:{},seen:{},sp:0,spEarned:0,cash:0,log:[],t:{},cats:{},missed:{},pend:{}};
    S.style=null;S.style2=null;S.styleView=1;

    /* ── 1. A KAPU ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    const kapuk=[];
    [1,2,3,4].forEach(n=>{
      S.seasonNumber=n;S.seasonClosed=true;
      kapuk.push({szezon:n,zart:styleSeasonsClosed(),lehet:style2CanChoose()});});
    o.kapu=kapuk;
    S.seasonNumber=4;S.seasonClosed=true;

    /* ── 2. A VÁLASZTÁS ── */
    o.ugyanaz=chooseStyle2("beton");
    o.valasztas=chooseStyle2("bombazok");
    o.masodik=chooseStyle2("villam");     /* harmadik már nincs */
    o.allapot={kulcs1:styleKey(),kulcs2:styleState2()&&styleState2().key,
      slotok:styleSlots().map(x=>x.key),nezet:styleViewIdx()};

    /* ── 3. A HATÁSOK UNIÓJA ── */
    /* képesség: mindkét fában veszünk egyet, és mindkettőnek élnie kell */
    S.ms.sp=100000;
    styleViewSet(1);const v1=styleBuyTrait("fogd_meg_a_serem")||{};
    const betonKepessegek=styleTraitList("beton").map(t=>t.key);
    const bombaKepessegek=styleTraitList("bombazok").map(t=>t.key);
    styleViewSet(1);const b1=styleBuyTrait(betonKepessegek[0]);
    styleViewSet(2);const b2=styleBuyTrait(bombaKepessegek[0]);
    o.vasarlas={elso:b1.ok,masodik:b2.ok,
      elsoSzint:styleTraitLevelIn(S.style,betonKepessegek[0]),
      masodikSzint:styleTraitLevelIn(S.style2,bombaKepessegek[0]),
      /* a motor mindkettőt látja */
      unioElso:styleTraitLevel(betonKepessegek[0]),
      unioMasodik:styleTraitLevel(bombaKepessegek[0]),
      /* és NEM szivárog át a másik tárába */
      keresztElso:styleTraitLevelIn(S.style2,betonKepessegek[0]),
      keresztMasodik:styleTraitLevelIn(S.style,bombaKepessegek[0])};
    o.fxDb=styleActiveFx().length;

    /* szerepek: mind a hat kulcs él */
    o.szerepek={mind:roleKeysForStyle(),
      nezet1:(styleViewSet(1),roleKeysOfView()),
      nezet2:(styleViewSet(2),roleKeysOfView()),
      gazda:{fal:roleStyleOf("fal"),nyito:roleStyleOf("nyito")}};
    styleViewSet(1);

    /* a „szerepek" képesség kulcsütközése: NÉGY stílusban is szerepel */
    S.style.traits.szerepek=3;
    o.szerepSzint={betonSzerep:roleLevel("fal"),bombaSzerep:roleLevel("nyito")};
    delete S.style.traits.szerepek;

    /* hangsúlyok: külön tár, külön hármas keret */
    styleViewSet(1);
    const d1k=dialList().map(d=>d.k);
    dialSet(d1k[0],10);
    styleViewSet(2);
    const d2k=dialList().map(d=>d.k);
    o.hangsuly={
      lista1:d1k.length,lista2:d2k.length,
      ertek2elotte:dialValue(d1k[0]),      /* a másik stílus csúszkája itt nem látszik */
      allit2:dialSet(d2k[0],10),
      keret1:(styleViewSet(1),dialActiveCount()),
      keret2:(styleViewSet(2),dialActiveCount())};
    styleViewSet(1);

    /* ── 4. A MÉRFÖLDKŐ-JUTALOM ── */
    o.jutalom={};
    [3,10,32,1].forEach(v=>{
      o.jutalom[v]={elso:styleMsRewardFor(S.style,v),masodik:styleMsRewardFor(S.style2,v)};});

    /* és a pásztázás tényleg MINDKÉT táblát futtatja, EGY tárcába. Két
       beültetett, biztosan teljesülő mérföldkővel mérjük — így a szám
       kiszámítható, nem a véletlenen múlik. */
    S.ms.sp=0;S.ms.spEarned=0;S.ms.log=[];
    S.style.ms={done:{},seen:{},t:{}};S.style2.ms={done:{},seen:{},t:{}};
    const proba=(t)=>({id:"__proba_"+t,t:"Próba ("+t+")",d:"próba",val:30,p:()=>1,n:1});
    STYLE_MILESTONES.beton.push(proba("beton"));
    STYLE_MILESTONES.bombazok.push(proba("bombazok"));
    const varhato={elso:msSpReward(30),masodik:Math.max(1,Math.round(msSpReward(30)/3))};
    styleScan();
    o.pasztazas={sp:S.ms.sp,varhato,osszeg:varhato.elso+varhato.masodik,
      naploban:(msState().log||[]).length,
      elsoKesz:!!S.style.ms.done.__proba_beton,
      masodikKesz:!!S.style2.ms.done.__proba_bombazok,
      cimkek:(msState().log||[]).map(x=>x.grp)};
    STYLE_MILESTONES.beton.pop();STYLE_MILESTONES.bombazok.pop();

    /* ── 5. A NÉZET NEM JÁTÉKMENET ── */
    const fx1=styleActiveFx().length,role1=roleKeysForStyle().length;
    styleViewSet(2);
    const fx2=styleActiveFx().length,role2=roleKeysForStyle().length;
    o.nezetSemleges={fx:[fx1,fx2],szerep:[role1,role2]};
    /* a felület viszont VÁLT */
    o.felulet={
      nezet2Cim:(styleViewKey()),
      msLista2:styleMsList().length===(STYLE_MILESTONES.bombazok||[]).length,
      fa2:styleTraitList(styleViewKey()).length===styleTraitList("bombazok").length,
      gombVan:/Ugrás az elsődleges/.test(style2BarHtml()),
      nezet1Gomb:(styleViewSet(1),/Ugrás a másodlagos/.test(style2BarHtml()))};

    /* ── 6. A SZTÁR AKKOR IS A SZTÁROSÉ, HA MÁSODLAGOS ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2={key:"sztar",chosenSeason:4,traits:{},ms:{done:{},seen:{},t:{}},star:"Teszt Tamás"};
    S.careerStats={"Teszt Tamás":{matches:50,g:30,a:10}};
    window.fullCareerRoster=()=>[{n:"Teszt Tamás",pos:["CS"],ovr:88,age:26,pot:4000}];
    window.msRoster=()=>fullCareerRoster();
    styleViewSet(1);                        /* a BETONT nézzük, mégis él a sztár */
    o.sztar={nev:fameStarName(),alku:starDealOn(),ures:starVacant(),
      meccsek:stStarMatches(),
      fameVan:!!fameState()};

    /* ── 7. MENTÉS (még a sztáros díszlettel) ── */
    o.mentes=(()=>{try{
      const d=JSON.parse(JSON.stringify({S:{style:S.style,style2:S.style2,styleView:S.styleView}}));
      return !!(d.S.style2&&d.S.style2.key==="sztar"&&d.S.style2.star==="Teszt Tamás");
    }catch(e){return false;}})();
    /* ── 6b. A FEJLÉC A SAJÁT FILOZÓFIÁJÁRÓL BESZÉL ──
       (Ezt a képernyőkép találta meg: a rang a nézett stílus RANGSORÁBÓL kell
       jöjjön, különben a Beton 1. szintje „Első passzok" — a Tiki-Taka rangja.) */
    S.style={key:"tikitaka",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    S.style2={key:"beton",chosenSeason:4,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    styleLvlCacheClear();
    o.fejlec={
      rang1:styleRankName(1,"tikitaka"),rang2:styleRankName(1,"beton"),
      hero2:(styleViewSet(2),styleHeroHtml(styleView(),styleViewDef())),
      hero1:(styleViewSet(1),styleHeroHtml(styleView(),styleViewDef()))};
    o.fejlec.hero2Rang=/Alapoz\u00e1s/.test(o.fejlec.hero2);
    o.fejlec.hero2Jelolt=/m\u00e1sodlagos/.test(o.fejlec.hero2);
    o.fejlec.hero1Rang=/Els\u0151 passzok/.test(o.fejlec.hero1);
    o.fejlec.hero1Jelolt=/m\u00e1sodlagos/.test(o.fejlec.hero1);
    delete o.fejlec.hero1;delete o.fejlec.hero2;

    /* ── 7. A SZINT SLOTONKÉNT ── */
    styleLvlCacheClear();
    o.szint={elso:styleLevel(S.style),masodik:styleLevel(S.style2),
      alap:styleLevel()};

    return o;});

  console.log("=== a kapu ===");
  ok("a 3. lezárt szezon előtt zárva, attól kezdve nyitva",
     r.kapu[0].lehet===false&&r.kapu[1].lehet===false&&r.kapu[2].lehet===true
     &&r.kapu[3].lehet===true,r.kapu);

  console.log("\n=== a választás ===");
  ok("ugyanazt a filozófiát nem lehet kétszer felvenni",r.ugyanaz.ok===false,r.ugyanaz);
  ok("a második felvétele sikerül",r.valasztas.ok===true,r.valasztas);
  ok("harmadik nincs",r.masodik.ok===false,r.masodik);
  ok("két slot él, és a nézet a frissen választottra ugrik",
     r.allapot.slotok.join("+")==="beton+bombazok"&&r.allapot.nezet===2,r.allapot);

  console.log("\n=== a hatások uniója ===");
  ok("mindkét fába lehet venni (a KÖZÖS tárcából)",
     r.vasarlas.elso===true&&r.vasarlas.masodik===true,r.vasarlas);
  ok("a motor MINDKETTŐ képességét látja",
     r.vasarlas.unioElso===1&&r.vasarlas.unioMasodik===1,r.vasarlas);
  ok("de a két tár nem keveredik",
     r.vasarlas.keresztElso===0&&r.vasarlas.keresztMasodik===0,r.vasarlas);
  ok("a hatás-lista mindkét fából merít",r.fxDb>=2,r.fxDb);
  ok("mind a hat szezon-szerep él",r.szerepek.mind.length===6,r.szerepek);
  ok("a kiosztó viszont mindig a NÉZETT filozófia hármasát mutatja",
     r.szerepek.nezet1.length===3&&r.szerepek.nezet2.length===3
     &&r.szerepek.nezet1[0]!==r.szerepek.nezet2[0],r.szerepek);
  ok("a szerepek-képesség NÉGY stílusban is szerepel — a szint mégis a sajátjáé",
     r.szerepSzint.betonSzerep===3&&r.szerepSzint.bombaSzerep===0,r.szerepSzint);
  ok("a hangsúlyoknak külön táruk és külön hármas keretük van",
     r.hangsuly.ertek2elotte===0&&r.hangsuly.allit2===true
     &&r.hangsuly.keret1===1&&r.hangsuly.keret2===1,r.hangsuly);

  console.log("\n=== a mérföldkő-jutalom ===");
  {const harmad=o=>o.masodik===Math.max(1,Math.round(o.elso/3));
   ok("a másodlagos mérföldköve HARMADANNYIT fizet (a tempó-szorzó UTÁN)",
      harmad(r.jutalom[3])&&harmad(r.jutalom[10])&&harmad(r.jutalom[32]),r.jutalom);}
  ok("de sosem nullát (a padló 1 pont)",r.jutalom[1].masodik===1,r.jutalom[1]);
  ok("a pásztázás MINDKÉT táblát futtatja, és egy KÖZÖS tárcába fizet",
     r.pasztazas.elsoKesz===true&&r.pasztazas.masodikKesz===true
     &&r.pasztazas.sp===r.pasztazas.osszeg&&r.pasztazas.naploban===2,r.pasztazas);
  ok("a napló megkülönbözteti, melyik filozófiáé volt",
     r.pasztazas.cimkek.some(x=>/másodlagos/.test(x)),r.pasztazas.cimkek);

  console.log("\n=== a nézet nem játékmenet ===");
  ok("a nézetváltás NEM mozdít a hatásokon",
     r.nezetSemleges.fx[0]===r.nezetSemleges.fx[1]
     &&r.nezetSemleges.szerep[0]===r.nezetSemleges.szerep[1],r.nezetSemleges);
  ok("a felület viszont teljesen átáll a másodlagosra",
     r.felulet.nezet2Cim==="bombazok"&&r.felulet.msLista2===true&&r.felulet.fa2===true,r.felulet);
  ok("és a váltó gomb mindkét irányba kiírja, hova visz",
     r.felulet.gombVan===true&&r.felulet.nezet1Gomb===true,r.felulet);

  console.log("\n=== a sztár a SAJÁT filozófiájáé ===");
  ok("másodlagos sztáros filozófiánál is él a sztár, az alku és a híresség",
     r.sztar.nev==="Teszt Tamás"&&r.sztar.alku===true&&r.sztar.ures===false
     &&r.sztar.meccsek===50&&r.sztar.fameVan===true,r.sztar);

  console.log("\n=== a fejléc ===");
  ok("a rang a SAJÁT filozófia rangsorából jön, nem az elsődlegeséből",
     r.fejlec.hero2Rang===true&&r.fejlec.hero1Rang===true,r.fejlec);
  ok("és a másodlagos fejléce kimondja, hogy az",
     r.fejlec.hero2Jelolt===true&&r.fejlec.hero1Jelolt===false,r.fejlec);

  console.log("\n=== a szint ===");
  ok("mindkét filozófiának SAJÁT szintje van",
     r.szint.elso>=1&&r.szint.masodik>=1&&r.szint.alap===r.szint.elso,r.szint);

  console.log("\n=== a mentés ===");
  ok("a másodlagos filozófia (a sztárjával együtt) mentésbe kerül",r.mentes===true);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
