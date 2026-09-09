/* ⛔🏆 A SZEZONZÁRÁS ŐRE ÉS A KÉT KUPA EGY SZEZONBAN (3.9.59)

   KÉT BEJELENTETT HIBA, egy próbában — mert ugyanaz a rendszer sérült:

   1. „szezon 8. fordulója után bedobott az előző szezon záróképére … de úgy,
      mintha ez az aktuális szezon zárása lett volna, mert értékelte az első 8
      meccs alatt teljesített dolgokat, mindenkinek előrehaladt a fejlődése,
      elbuktam a szezonos kihívásokat, mindenki 1 évvel öregebb lett."

   2. „sokszor próbáltuk már beépíteni, hogy Fából készült Kupa után még jöjjön
      a BL ha azt megnyerte a csapat. ez még mindig nem működik. nem tud
      lefutni 2 kupa."

   Használat: node tools/szezonzaras-or-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8907'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8907/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── FIXTÚRA: a 2. szezon 8. fordulójánál állunk ── */
    const felallit=()=>{
      gameMode="career";
      S.seasonNumber=2;S.idx=8;S.seasonClosed=false;
      S.fixtures=new Array(30).fill(0).map(()=>({o:{n:"X",ovr:80}}));
      S.hubReportHtml=null;
      phase="hubreport";           /* EZ a beragadt állapot */
      return {kor:(careerPool&&Object.keys(careerPool).length)||0};};

    /* ── 1a. AZ ŐR LÉTEZIK ÉS HELYESEN FELEL ── */
    felallit();
    o.or={fut_szezonban:seasonCloseAllowed(),kozepen:seasonMidFlight()};
    S.seasonClosed=true;
    o.or.lezart_szezonban=seasonCloseAllowed();
    S.seasonClosed=false;

    /* ── 1b. A ROMBOLÓ MŰVELETEK VISSZAFORDULNAK ── */
    felallit();
    const elotte={szezon:S.seasonNumber,idx:S.idx};
    hubShowSeasonReport();
    o.jelentes={utana:{szezon:S.seasonNumber,idx:S.idx},valtozott:
      (S.seasonNumber!==elotte.szezon||S.idx!==elotte.idx)};

    felallit();
    beginNextSeasonWithChallenges();
    o.ujIdeny={utana:{szezon:S.seasonNumber,idx:S.idx},valtozott:
      (S.seasonNumber!==2||S.idx!==8)};

    felallit();
    S.euroCurrent=null;S.euro=null;
    startEuroCampaign();
    o.kupa={utana:{szezon:S.seasonNumber,idx:S.idx},valtozott:
      (S.seasonNumber!==2||S.idx!==8)};

    /* ── 1c. A BERAGADT FÁZIS MEGGYÓGYUL, ÉS A GOMB HELYES SZEREPET KAP ── */
    felallit();
    setHubNextSeasonBtn();
    const bt=document.getElementById("hubNextSeasonBtn");
    o.gyogyulas={fazis:phase,felirat:bt?bt.textContent:null,
      kezelo_nem_ideny:(bt&&bt.onclick!==beginNextSeasonWithChallenges)};

    /* ── 1d. LEZÁRT SZEZONBAN VISZONT ÁTENGED ── */
    S.seasonClosed=true;phase="hubreport";
    o.lezartan={engedi:seasonCloseAllowed(),gyogyit:seasonPhaseRepair()};
    S.seasonClosed=false;

    /* ── 2a. A LÁNC MINDEN OSZTÁLYON ── */
    const lanc=(divId,comp)=>{
      const e0=window.cupTierFor;
      window.cupTierFor=()=>({league:"D"+divId,qual:true,
        entries:(PYR_CUPS[divId-1]||{}).entries||[],
        cupWins:(PYR_CUPS[divId-1]||{}).cupWins,pyrDiv:divId});
      S.euro={comp,result:"win"};S.mkToKLDone=false;
      const c=cupChainNext();
      window.cupTierFor=e0;
      return c;};
    o.lancok={
      D1_FA:lanc(1,"FA"),D2_FA:lanc(2,"FA"),D3_MK:lanc(3,"MK"),
      D4_MK:lanc(4,"MK")};
    /* SÍK MÓD: a 80-84-es sáv MK→KL */
    {const e0=window.cupTierFor;
     window.cupTierFor=()=>CUP_TIERS[2];
     S.euro={comp:"MK",result:"win"};S.mkToKLDone=false;
     o.lancok.sik_MK=cupChainNext();
     window.cupTierFor=e0;}
    /* SZEZONONKÉNT EGYSZER */
    {const e0=window.cupTierFor;
     window.cupTierFor=()=>({cupWins:{comp:"FA",gives:"BL",qual:true}});
     S.euro={comp:"FA",result:"win"};S.mkToKLDone=true;
     o.lancok.mar_volt=cupChainNext();
     S.mkToKLDone=false;
     o.lancok.vesztes=(S.euro={comp:"FA",result:"out"},cupChainNext());
     window.cupTierFor=e0;}

    /* ── 2b. A MEGSZERZETT INDULÁST NEM ÍRJA FELÜL A HELYEZÉS ── */
    const RANK={BL:3,EL:2,KL:1,FA:0,MK:0};
    const felulir=(meglevo,ceComp)=>{
      /* a finish() belső logikájának pontos mása — a próba ezt méri, nem
         a teljes finish()-t (az 30 lejátszott fordulót kívánna) */
      const ce=ceComp?{comp:ceComp,qual:true}:null;
      const m=meglevo?{comp:meglevo,qual:true}:null;
      const ujJobb=!m||(ce&&(RANK[ce.comp]||0)>(RANK[m.comp]||0));
      return ujJobb?(ce?ce.comp:null):m.comp;};
    o.felulir={
      bl_marad_fa_ellen:felulir("BL","FA"),
      bl_marad_semmi_ellen:felulir("BL",null),
      bl_marad_kl_ellen:felulir("BL","KL"),
      bl_helyezesbol_is_bl:felulir("FA","BL")};
    return o;});

  console.log("=== 1. az őr: futó szezonban semmi nem zárulhat le ===");
  ok("az őr futó szezonban NEM enged, lezártban igen",
     r.or.fut_szezonban===false&&r.or.lezart_szezonban===true,r.or);
  ok("a 8. fordulónál a szezon félbehagyottnak látszik",r.or.kozepen===true);
  ok("a SZEZONJELENTÉS visszafordul — semmi nem változik",
     r.jelentes.valtozott===false,r.jelentes);
  ok("az ÚJ IDÉNY indítása visszafordul",r.ujIdeny.valtozott===false,r.ujIdeny);
  ok("a KUPAKAMPÁNY üres ága sem esik a szezonzárásba",
     r.kupa.valtozott===false,r.kupa);
  ok("a beragadt nyárzáró fázis meggyógyul (vissza a szezonra)",
     r.gyogyulas.fazis==="season",r.gyogyulas);
  ok("és a gomb nem az idényindító kezelőt kapja",
     r.gyogyulas.kezelo_nem_ideny===true,r.gyogyulas);
  ok("lezárt szezonban viszont átenged, és nincs mit gyógyítani",
     r.lezartan.engedi===true&&r.lezartan.gyogyit===false,r.lezartan);

  console.log("\n=== 2. két kupa egy szezonban ===");
  ok("D1: az Fából Készült Serleg megnyerése BL-t ad, SELEJTEZŐTŐL",
     r.lancok.D1_FA&&r.lancok.D1_FA.gives==="BL"&&r.lancok.D1_FA.qual===true,r.lancok.D1_FA);
  ok("D2: ugyanaz",r.lancok.D2_FA&&r.lancok.D2_FA.gives==="BL",r.lancok.D2_FA);
  ok("D3: a Magor Kupája is BL-t ad",
     r.lancok.D3_MK&&r.lancok.D3_MK.gives==="BL",r.lancok.D3_MK);
  ok("D4: ott nincs lánc (nincs cupWins)",r.lancok.D4_MK===null,r.lancok.D4_MK);
  ok("sík mód: a Magor Kupája továbbra is KL-t ad (a régi viselkedés)",
     r.lancok.sik_MK&&r.lancok.sik_MK.gives==="KL",r.lancok.sik_MK);
  ok("szezononként EGY lánc",r.lancok.mar_volt===null,r.lancok.mar_volt);
  ok("vesztes kupa nem indít láncot",r.lancok.vesztes===null,r.lancok.vesztes);

  console.log("\n=== 2b. a megszerzett indulás nem veszhet el ===");
  ok("a kiharcolt BL túléli a gyengébb helyezést",
     r.felulir.bl_marad_fa_ellen==="BL"&&r.felulir.bl_marad_semmi_ellen==="BL"
     &&r.felulir.bl_marad_kl_ellen==="BL",r.felulir);
  ok("de egy JOBB helyezés felülírhatja a gyengébbet",
     r.felulir.bl_helyezesbol_is_bl==="BL",r.felulir);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
