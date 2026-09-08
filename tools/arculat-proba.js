/* 🛡️ AZ ARCULAT LÁTHATÓSÁGA + A MECCS ALAPTEMPÓJA — élő mérés.
   Amit néz:
     1. a meccs alap-tempója 0,25× friss telepítésen,
     2. …de a MÁR BEÁLLÍTOTT érték túléli (a kapcsoló nem írja felül senkiét),
     3. a címer-SVG kap fényt, mélységet és belső keretet (flat:false),
     4. a `flat:true` ezeket elhagyja — apró jelnél a csillanás zaj volna,
     5. a klub-banner kiírja a nevet, a stadiont és a két klubszínt,
     6. …és a HUB tetején tényleg ott van,
     7. a bajnokavatás képernyőjén ott a klub jelvénye,
     8. az eredményjelzőn CSAK a te oldaladon van jelvény,
     9. …és oldalt váltva átkerül a másikra (a gyorsító nem ragasztja oda),
    10. semmi nem szólal meg csapatnév nélkül.
   Használat: node tools/arculat-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8952'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};

  async function lap(elo){
    const p=await b.newPage({viewport:{width:390,height:900}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8952/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(v=>{
      try{localStorage.clear();}catch(e){}
      if(v!=null)try{localStorage.setItem("harminc_nulla_matchspeed_v1",String(v));}catch(e){}
    },elo==null?null:elo);
    await p.goto('http://localhost:8952/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p;}

  /* ── 1-2. A MECCS ALAPTEMPÓJA ── */
  {const p=await lap(null);
   out.tempo_friss=await p.evaluate(()=>({
     ertek:matchSpeed, alap:MATCH_SPEED_DEFAULT,
     csuszka:parseFloat(document.getElementById("matchSpeedRange").value),
     kupa:parseFloat(document.getElementById("euroSpeedRange").value),
     felirat:document.getElementById("matchSpeedVal").textContent,
     /* a tényleges ütem: alacsonyabb szorzó = lassabb közvetítés */
     tickMs:Math.round(330/matchSpeed)}));
   await p.close();}
  {const p=await lap(1.5);
   out.tempo_orzott=await p.evaluate(()=>({ertek:matchSpeed}));
   await p.close();}

  /* ── 3-10. AZ ARCULAT ── */
  {const p=await lap(null);
   out.arculat=await p.evaluate(()=>{
     const o={};
     gameMode="career";teamName="Bakonyi Vadkanok FC";
     S.ident={crest:{shape:"shield",div:"stripes",sym:"star",ink:"#ffffff",mono:"BV"},
              stadium:"Vadkan Aréna",colorsOwn:true,kit:null,kitView:false};
     S.teamCol=["#0b6b3a","#f2c200"];S.seasonNumber=3;
     /* --- 3-4. a címer rétegei --- */
     const teli=crestSVG(identCrestOrDefault(),96,{colors:teamColors()});
     const lapos=crestSVG(identCrestOrDefault(),22,{colors:teamColors(),flat:true});
     o.cimer={
       teli:{grad:(teli.match(/<linearGradient/g)||[]).length,
             arnyek:teli.indexOf("drop-shadow")>=0,
             belsoKeret:teli.indexOf('stroke="#fff"')>=0},
       lapos:{grad:(lapos.match(/<linearGradient/g)||[]).length,
              arnyek:lapos.indexOf("drop-shadow")>=0,
              belsoKeret:lapos.indexOf('stroke="#fff"')>=0},
       /* a FORMA mindkettőnél ugyanaz — a fény nem rajzol át semmit */
       ugyanazForma:(teli.match(/clipPath/g)||[]).length===(lapos.match(/clipPath/g)||[]).length};
     /* --- 5. a banner --- */
     const ban=identBannerHtml({size:56});
     o.banner={nev:ban.indexOf("Bakonyi Vadkanok FC")>=0,
       stadion:ban.indexOf("Vadkan Aréna")>=0,
       idany:ban.indexOf("3. idény")>=0,
       szin1:ban.indexOf("#0b6b3a")>=0, szin2:ban.indexOf("#f2c200")>=0,
       svg:ban.indexOf("<svg")>=0, sav:ban.indexOf("ibBar")>=0};
     /* --- 6. a HUB tetején --- */
     renderIdentBanner();
     {const el=document.getElementById("hubIdentBanner");
      o.hub={rejtve:el.classList.contains("hide"),
             tartalom:el.innerHTML.indexOf("identBanner")>=0};}
     /* --- 7. a bajnokavatás --- */
     showTrophyScreen({theme:"LEAGUE",sub:"teszt"});
     o.champ={svg:document.getElementById("champCrest").innerHTML.indexOf("<svg")>=0};
     document.getElementById("championModal").classList.add("hide");
     /* --- 8-9. az eredményjelző --- */
     const oldal=()=>({h:document.getElementById("sbHomeName").innerHTML.indexOf("sbCrest")>=0,
                       a:document.getElementById("sbAwayName").innerHTML.indexOf("sbCrest")>=0});
     SB.teams={home:{side:"hazai",full:"Bakonyi Vadkanok FC",abbr:"BVF",ovr:84.2,pos:2},
               away:{side:"vendég",full:"Debreceni Csillagok",abbr:"DCS",ovr:81.7,pos:6}};
     document.getElementById("sbHomeName").classList.add("me");
     document.getElementById("sbAwayName").classList.remove("me");
     sbFitTeams(true);
     o.sb_hazai=oldal();
     /* OLDALCSERE: ugyanaz a két csapat, de most idegenben vagyunk. A név, az
        erő és a helyezés VÁLTOZATLAN — a gyorsító kulcsa tehát ugyanaz volna. */
     document.getElementById("sbHomeName").classList.remove("me");
     document.getElementById("sbAwayName").classList.add("me");
     sbFitTeams(true);
     o.sb_vendeg=oldal();
     /* --- 10. csapatnév nélkül néma --- */
     teamName="";
     renderIdentBanner();
     o.nevtelen={rejtve:document.getElementById("hubIdentBanner").classList.contains("hide")};
     showTrophyScreen({theme:"LEAGUE"});
     o.nevtelen.champ_ures=document.getElementById("champCrest").innerHTML==="";
     document.getElementById("championModal").classList.add("hide");
     return o;});
   await p.close();}

  await b.close();srv.kill();

  const A=[],ok=(n,f)=>A.push({n,ok:!!f});
  const T=out.tempo_friss;
  ok("friss telepítésen a meccs alap-tempója 0,25×",
     T.ertek===0.25&&T.alap===0.25&&T.csuszka===0.25&&T.kupa===0.25);
  ok("a felirat és a tényleges ütem is ezt mondja",
     T.felirat==="0.25×"&&T.tickMs===1320);
  ok("aki már állította, azt nem írjuk felül", out.tempo_orzott.ertek===1.5);
  const C=out.arculat.cimer;
  ok("a címer kap fényt, mélységet és belső keretet",
     C.teli.grad===2&&C.teli.arnyek&&C.teli.belsoKeret);
  ok("a lapos változat MINDHÁRMAT elhagyja",
     C.lapos.grad===0&&!C.lapos.arnyek&&!C.lapos.belsoKeret);
  ok("a forma mindkét változatban ugyanaz", C.ugyanazForma===true);
  const B=out.arculat.banner;
  ok("a banner kiírja a nevet, a stadiont és az idényt", B.nev&&B.stadion&&B.idany);
  ok("a banner a KÉT KLUBSZÍNT viseli, és van benne címer meg színsáv",
     B.szin1&&B.szin2&&B.svg&&B.sav);
  ok("a banner ott van a HUB tetején",
     out.arculat.hub.rejtve===false&&out.arculat.hub.tartalom===true);
  ok("a bajnokavatáson ott a klub jelvénye", out.arculat.champ.svg===true);
  ok("az eredményjelzőn CSAK a te oldaladon van jelvény (hazai)",
     out.arculat.sb_hazai.h===true&&out.arculat.sb_hazai.a===false);
  ok("…és oldalt váltva átkerül a másikra (a gyorsító nem ragasztja oda)",
     out.arculat.sb_vendeg.h===false&&out.arculat.sb_vendeg.a===true);
  ok("csapatnév nélkül minden néma",
     out.arculat.nevtelen.rejtve===true&&out.arculat.nevtelen.champ_ures===true);
  ok("nincs futásidejű hiba", hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  console.log("\n=== 🛡️ ARCULAT ÉS MECCSTEMPÓ ===");
  A.forEach(x=>console.log(`${x.ok?"✅":"❌"} ${x.n}`));
  if(hiba.length)console.log("\nHIBÁK:\n"+hiba.slice(0,8).join("\n"));
  const bukott=A.filter(x=>!x.ok).length;
  console.log(`\n${A.length-bukott}/${A.length} rendben`);
  process.exit(bukott?1:0);
})();
