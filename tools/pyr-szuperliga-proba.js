/* A PIRAMIS FÖLFELÉ IS NŐ (3.9.39) — D0, D−1, D−2 … a végtelenbe.

   Bejelentett kérés: „hagyományos módban d1 győzelem után nyíljon ki a d0 és
   d-1, d-2 stb. a végtelenbe, mint dinamikusan az Infinity."

   Amit mér:
     1. A KAPU: csak a LEGFELSŐ osztály MEGNYERÉSE nyit újat. Második hely,
        alsóbb osztály bajnoksága → nincs nyitás.
     2. AZ AZONOSÍTÓK NEM CSÚSZNAK: a D1 marad D1, a te osztályod azonosítója
        változatlan, csak az indexe. Ez a naplód és a mérőd visszamenőleges
        érvényessége.
     3. A SZINT: az új osztály egy teljes lépcsővel (PYR_STEP) a régi élvonal
        fölött áll, és a lépcső végig szabályos marad.
     4. A MEZŐNY ÉP: 16 csapat, EGY osztályon belül nincs névazonosság.
     5. VÉGTELEN: egymás után többször is nyílik, D0 → D−1 → D−2.
     6. AZ ÜTEM NEM SZALAD EL: a pyrAiRate a szuperligákban sem extrapolál az
        élvonali `top` fölé (a nehézséget ott a SZINT adja).
     7. RÉGI MENTÉS: `above` nélkül minden betűre a régi.
     8. A BL PADLÓJA (3.9.39): amíg nem vagy az élvonalban, a BL mezőnye
        legalább D1+2; ha a kereted már túlnőtt rajta, a SZÁMÍTOTT érték
        veszi át — „d1-től kezdve pedig számított". Csak a BL kap padlót.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8975;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1400);

  const r=await p.evaluate(()=>{
    const out={};
    gameMode="career";teamName="Teszt FC";
    const vilag=()=>{
      const w=pyrBuildWorld(rngFor("pyr:proba"),0);
      return w.divs;};
    const alap=()=>{
      const divs=vilag();
      /* A HELYEDET EGY KLUBTÓL VETTED EL — pontosan úgy, ahogy a pyrStart is
         teszi (`spare`). Enélkül a saját osztályod 17 entitást tartana, és a
         létszám-ellenőrzés a FIXTÚRA hibáját mérné, nem a kódét. */
      divs[0].teams.sort((a,b)=>b.ovr-a.ovr);
      const spare=divs[0].teams.pop();
      S.pyr={on:true,my:1,startDiv:6,aiSpeed:"tarto",divs,spare,
        gapWant:0,gap0:0,log:[],meas:null,upAmt:0,up:0,v:1,sv:2};
      S.seasonNumber=5;S.run={};};

    /* --- 7. RÉGI MENTÉS: above nélkül minden a régi --- */
    alap();
    out.regi={above:pyrAbove(),top:pyrTopId(),
      idx1:pyrDivIdx(1),id0:pyrDivIdAt(0),
      enyem:pyrMyDiv()&&pyrMyDiv().id};

    /* --- 1. A KAPU --- */
    alap();
    const elottiDb=S.pyr.divs.length;
    /* nem a legfelsőben állsz → nincs nyitás (a kapu a pyrSeasonTurn-ben van,
       ezt a feltételt közvetlenül mérjük) */
    S.pyr.my=3;
    out.kapu_nem_top=!pyrAtTop();
    S.pyr.my=1;
    out.kapu_top=pyrAtTop();

    /* --- 2-4. AZ ELSŐ NYITÁS --- */
    alap();
    const regiElvonal=S.pyr.divs[0].mean;
    const regiIdk=S.pyr.divs.map(d=>d.id);
    const regiLepcsok=S.pyr.divs.slice(1).map((d,i)=>Math.round((S.pyr.divs[i].mean-d.mean)*10)/10);
    const ujId=pyrOpenTopDiv(rngFor("pyr:proba:super1"));
    out.uj_id=ujId;
    out.above=pyrAbove();
    out.db=S.pyr.divs.length;
    out.uj_db_jo=(S.pyr.divs.length===elottiDb+1);
    /* az azonosítók nem csúsztak: a régi hat a helyén, elöl az új */
    out.idk=S.pyr.divs.map(d=>d.id);
    out.idk_nem_csusztak=JSON.stringify(out.idk.slice(1))===JSON.stringify(regiIdk);
    /* a TE osztályod azonosítója változatlan, az indexe csúszott */
    out.enyem_id=pyrMyDivId();
    out.enyem_idx=pyrDivIdx(pyrMyDivId());
    out.enyem_ugyanaz=(pyrMyDiv()&&pyrMyDiv().id===1);
    /* 3. a szint: egy teljes lépcsővel feljebb */
    out.lepcso=Math.round((S.pyr.divs[0].mean-regiElvonal)*10)/10;
    out.lepcso_jo=Math.abs(out.lepcso-PYR_STEP)<0.35;
    /* A MEGLÉVŐ LÉPCSŐ NEM MOZDULHAT. Nem azt mérjük, hogy minden fok pontosan
       PYR_STEP (a világ generátora a klubok VALÓS szórásából épít, tehát az
       osztályközepek eleve ±0,5-öt ingadoznak a névleges lépcső körül) —
       hanem azt, hogy a nyitás a MÁR MEGLÉVŐ fokokhoz nem nyúlt hozzá. */
    out.lepcsok=S.pyr.divs.slice(1).map((d,i)=>Math.round((S.pyr.divs[i].mean-d.mean)*10)/10);
    out.lepcso_szabalyos=JSON.stringify(out.lepcsok.slice(1))===JSON.stringify(regiLepcsok);
    /* 4. a mezőny ép */
    const t0=S.pyr.divs[0].teams;
    out.csapatszam=t0.length;
    out.nevek_egyediek=(new Set(t0.map(t=>t.n))).size===t0.length;
    out.pyrTopLevel_koveti=Math.abs(pyrTopLevel()-Math.round(S.pyr.divs[0].mean))<=1;

    /* --- 5. VÉGTELEN: még kétszer --- */
    S.pyr.my=0;
    const b2=pyrOpenTopDiv(rngFor("pyr:proba:super2"));
    S.pyr.my=-1;
    const b3=pyrOpenTopDiv(rngFor("pyr:proba:super3"));
    out.sorozat=[ujId,b2,b3];
    out.vegtelen=(JSON.stringify(out.sorozat)==="[0,-1,-2]");
    out.nevek=out.sorozat.map(i=>pyrDivName(i));
    /* Ez a szakasz KÉZZEL lépteti a `my`-t (a feljutást a 5/b méri), tehát a
       „egy hely a tiéd" könyvelés itt nem áll. Amit ellenőrizni érdemes:
       minden osztály tele van egy kivétellel (ahonnan a helyedet elvetted),
       és EGY osztályon belül sosincs névazonosság. */
    out.letszamok_sorozat=S.pyr.divs.map(d=>(d.teams||[]).length);
    out.mind_ep=S.pyr.divs.every(d=>{
      const L=(d.teams||[]).length;
      return (L===PYR_TEAMS||L===PYR_TEAMS-1)
        &&(new Set(d.teams.map(t=>t.n))).size===L;})
      &&out.letszamok_sorozat.filter(x=>x===PYR_TEAMS-1).length<=1;
    out.top_id=pyrTopId();
    /* az indexelés a mélyben is helyes */
    out.terkep_ep=S.pyr.divs.every((d,i)=>pyrDivIdAt(i)===d.id&&pyrDivIdx(d.id)===i);

    /* --- 5/b. A FELJUTÁS ODA IS A SZOKÁSOS ÚTON MEGY ---
       A nyitás után a rollover a bajnokot feljuttatja az ÚJ osztályba: ezért
       nincs külön léptetés a nyitásban. Egy teljes fordulót futtatunk. */
    alap();
    S.pyr.my=1;
    const sorrend=[teamName].concat(S.pyr.divs[0].teams.map(t=>t.n));
    const nyitott=pyrOpenTopDiv(rngFor("pyr:proba:fel"));
    const pr=pyrRollover(sorrend,rngFor("pyr:proba:roll"));
    out.feljutas={nyitott,from:pr&&pr.from,to:pr&&pr.to,kind:pr&&pr.kind,
      most:pyrMyDivId()};
    out.feljutott=(nyitott===0&&pr&&pr.from===1&&pr.to===0&&pr.kind==="up"
      &&pyrMyDivId()===0);
    /* és a világ létszáma nem változott a cserétől */
    /* minden osztály tele van; a sajátodban te foglalod a 16. helyet */
    out.letszamok=S.pyr.divs.map(d=>(d.teams||[]).length);
    out.letszam_ep=S.pyr.divs.every((d,i)=>
      (d.teams||[]).length===(i===pyrDivIdx(pyrMyDivId())?PYR_TEAMS-1:PYR_TEAMS));

    /* --- 8. A BL PADLÓJA: D1 + 2 --- */
    alap();
    careerPool=careerPool||{};        /* a piramis-szakaszok nem használtak keretet */
    S.pyr.my=4;                       /* jóval az élvonal alatt */
    S.morale=50;S.oppBuffH=null;
    oppTargetRating=pyrLevel();
    const top=pyrTopLevel();
    /* GYENGE KERET: itt a padlónak kell szólnia */
    slots.length=0;
    ["KP","JV","BV","BV","KV","VKP","KKP","TKP","JSZ","BSZ","CS"].forEach((pos,i)=>{
      const n=`Gyenge ${i+1}`;
      careerPool[n]={n,pos:[pos],ovr:70,age:26,tsi:2000,peak:71,startRating:70,
        nat:"Magyarorszag",conf:0,attrs:{}};
      drafted.add(n);
      slots.push({pos,player:{n,pos:[pos],ovr:70,age:26,tsi:2000,nat:"Magyarorszag"},fit:1});});
    out.bl={top,
      gyenge_BL:euroMidRating("BL"),
      gyenge_EL:euroMidRating("EL"),
      gyenge_MK:euroMidRating("MK"),
      keret:Math.round(teamStrength())};
    out.bl_padlo_szol=(out.bl.gyenge_BL===top+PYR_BL_OVER_TOP);
    /* a többi sorozat NEM kap padlót — a rangsorukat az oppDelta/EURO_EDGE adja */
    out.bl_csak_a_bl=(out.bl.gyenge_MK<top+PYR_BL_OVER_TOP);
    /* ERŐS KERET: a SZÁMÍTOTT érték veszi át */
    slots.length=0;
    ["KP","JV","BV","BV","KV","VKP","KKP","TKP","JSZ","BSZ","CS"].forEach((pos,i)=>{
      const n=`Eros ${i+1}`;
      careerPool[n]={n,pos:[pos],ovr:130,age:26,tsi:20000,peak:131,startRating:130,
        nat:"Magyarorszag",conf:0,attrs:{}};
      drafted.add(n);
      slots.push({pos,player:{n,pos:[pos],ovr:130,age:26,tsi:20000,nat:"Magyarorszag"},fit:1});});
    S.oppBuffH=null;
    out.bl.eros_BL=euroMidRating("BL");
    out.bl.eros_keret=Math.round(teamStrength());
    out.bl_szamitott_veszi_at=(out.bl.eros_BL>top+PYR_BL_OVER_TOP);

    /* --- 6. AZ ÜTEM NEM SZALAD EL --- */
    const sp=pyrSpeedDef(pyrSpeedKey());
    out.utem={d6:pyrAiRate(6),d1:pyrAiRate(1),d0:pyrAiRate(0),dm2:pyrAiRate(-2)};
    out.utem_nem_szalad=(Math.abs(out.utem.d0-out.utem.d1)<1e-9
      &&Math.abs(out.utem.dm2-out.utem.d1)<1e-9);
    return out;});

  const T=[
    ["régi mentés: above 0, a teteje D1",r.regi.above===0&&r.regi.top===1&&r.regi.idx1===0&&r.regi.enyem===1],
    ["a kapu csak a LEGFELSŐ osztályra nyílik",r.kapu_nem_top===true&&r.kapu_top===true],
    ["a nyitás D0-t ad",r.uj_id===0&&r.above===1],
    ["egy osztállyal több lett",r.uj_db_jo===true],
    ["a régi azonosítók NEM csúsztak el",r.idk_nem_csusztak===true],
    ["a te osztályod azonosítója változatlan (D1), az indexe csúszott",
      r.enyem_id===1&&r.enyem_idx===1&&r.enyem_ugyanaz===true],
    ["az új osztály egy teljes lépcsővel feljebb",r.lepcso_jo===true],
    ["a MEGLÉVŐ lépcső érintetlen maradt",r.lepcso_szabalyos===true],
    ["16 csapat, egyedi nevekkel",r.csapatszam===16&&r.nevek_egyediek===true],
    ["a pyrTopLevel az ÚJ tetőt méri",r.pyrTopLevel_koveti===true],
    ["végtelen: D0 → D−1 → D−2",r.vegtelen===true&&r.top_id===-2],
    ["minden osztály ép marad a mélyben is",r.mind_ep===true],
    ["az azonosító↔index térkép mindenhol helyes",r.terkep_ep===true],
    ["az AI-ütem a szuperligákban nem extrapolál",r.utem_nem_szalad===true],
    ["a bajnok a szokásos úton jut fel az ÚJ osztályba",r.feljutott===true],
    ["a világ létszáma ép marad a cserével",r.letszam_ep===true],
    ["gyenge kerettel a BL padlója szól: D1 + 2",r.bl_padlo_szol===true],
    ["…és a padló CSAK a BL-é",r.bl_csak_a_bl===true],
    ["erős kerettel a SZÁMÍTOTT érték veszi át",r.bl_szamitott_veszi_at===true],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  a nyitott osztályok:",JSON.stringify(r.sorozat),JSON.stringify(r.nevek));
  console.log("  azonosítók a nyitás után:",JSON.stringify(r.idk));
  console.log("  létszámok a sorozat után:",JSON.stringify(r.letszamok_sorozat));
  console.log("  lépcsők:",JSON.stringify(r.lepcsok),"· az új lépcső:",r.lepcso);
  console.log("  AI-ütem:",JSON.stringify(r.utem));
  console.log("  BL-padló:",JSON.stringify(r.bl));
  console.log("  feljutás:",JSON.stringify(r.feljutas),"· létszámok:",JSON.stringify(r.letszamok));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
