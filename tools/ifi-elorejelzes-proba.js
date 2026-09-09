/* 🔮 AZ AKADÉMIAI ELŐREJELZÉS + A SZEZONONKÉNTI EGYSZERI AJÁNLAT — élő mérés.
   Amit néz:
     1. az előrejelzés a KEZDŐ POT-t, a KORT és a KEZDŐ RATINGET is figyelembe
        veszi (más tehetség → más pálya),
     2. a jóslat DETERMINISZTIKUS — kétszer hívva bitre ugyanaz,
     3. nem ír bele az élő állapotba (a pool-bejegyzés érintetlen marad),
     4. a ballagásnál (21 év) megáll, és a sort meg is jelöli,
     5. a doboz a LEGJOBB 11-hez méri a számot (nem a felállított kezdőhöz),
     6. a ballagási ajánlaton NINCS jóslat (ott nincs „még egy szezon"),
     7. ugyanaz a játékos EGY SZEZONBAN CSAK EGYSZER jön vissza,
     8. …a következő szezonban viszont igen,
     9. a BALLAGÁS garantált marad (a szezon-fék nem érinti),
    10. a két számtani mag megegyezik a valódi játékéval (egy szezon
        előrejátszva = egy szezon lejátszva).
   Használat: node tools/ifi-elorejelzes-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8945'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};
  const p=await b.newPage({viewport:{width:390,height:900}});
  p.on('pageerror',e=>hiba.push(e.message));
  p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
  await p.goto('http://localhost:8945/index.html',{waitUntil:'domcontentloaded'});
  await p.evaluate(()=>{try{localStorage.clear();}catch(e){}});
  await p.goto('http://localhost:8945/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  Object.assign(out,await p.evaluate(()=>{
    const o={};
    gameMode="career";careerPool=careerPool||{};infinityMode=false;
    S.seasonNumber=3;
    const mk=(n,age,rating,pot)=>{
      careerPool[n]={n,pos:["CS"],nat:"Magyarország",conf:0,age,startRating:rating,
        peak:potToPeakOvr(pot),basePeak:potToPeakOvr(pot),pot,
        youthBonus:0,youthBonusStartAge:age,formPoints:0,estimatedPOT:pot};
      return careerPool[n];};

    /* ---- 1. A HÁROM BEMENET SZÁMÍT ---- */
    const alap=mk("Alap",17,66,5200);
    o.alap=academyProject(alap,3);
    o.tehetsegesebb=academyProject(mk("Tehets",17,66,7600),3);   /* csak a POT más */
    o.idosebb    =academyProject(mk("Idos",   20,66,5200),3);    /* csak a kor más */
    o.jobbRating =academyProject(mk("JobbR",  17,74,5200),3);    /* csak a Rating más */

    /* ---- 2. DETERMINISZTIKUS ---- */
    o.ketszer={a:JSON.stringify(academyProject(alap,3)),
               b:JSON.stringify(academyProject(alap,3))};

    /* ---- 3. NEM ÍR AZ ÉLŐ ÁLLAPOTBA ---- */
    const elotte=JSON.stringify({age:alap.age,r:alap.startRating,pot:alap.pot,
      peak:alap.peak,fp:alap.formPoints});
    academyProject(alap,3);
    o.tiszta=elotte===JSON.stringify({age:alap.age,r:alap.startRating,pot:alap.pot,
      peak:alap.peak,fp:alap.formPoints});

    /* ---- 4. A BALLAGÁS HATÁRA ---- */
    o.ballago=academyProject(mk("Ballag",19,71,3400),3);
    o.mar_ballagott=academyProject(mk("Kesz",21,74,4000),3);

    /* ---- 5. A LEGJOBB 11-HEZ MÉRVE, AZ AJÁNLAT PILLANATÁBAN ----
       A fixtúra SZÁNDÉKOSAN aszimmetrikus: a felállított kezdő 11 GYENGE (70),
       a padon és a tartalékban viszont ott a keret java (82-88). Ha a mérce a
       kezdő 11 volna, 70-et adna; a legjobb 11 viszont a valódi színvonalat
       mutatja. Pontosan ez a különbség a kérés lényege. */
    slots=FORMS["442"].slots.map((pp,i)=>({pos:pp,xy:[0,0],fit:1,origin:null,
      player:{n:"Gyenge "+i,pos:[pp],ovr:70,age:26}}));
    BENCH_KEYS.forEach((k,i)=>{BENCH[k]={n:"Pad "+i,pos:["CS"],ovr:86,age:26};});
    extraRoster=[{n:"Tart 1",pos:["CS"],ovr:88,age:26},
                 {n:"Tart 2",pos:["CS"],ovr:87,age:26},
                 {n:"Tart 3",pos:["CS"],ovr:84,age:26},
                 {n:"Tart 4",pos:["CS"],ovr:82,age:26}];
    o.legjobb11=academyBest11Avg();
    o.kezdo11_atlaga=70;
    const B=o.legjobb11;
    o.tagek={felette:academyProjTag(B+4,B).t,szinten:academyProjTag(B,B).t,
             alatta:academyProjTag(B-3,B).t,messze:academyProjTag(B-9,B).t,
             nincsXi:academyProjTag(80,null)};
    const html=academyProjHtml(alap);
    o.doboz={van:html.indexOf("acProj")>=0,
      xi_kiirva:/legjobb 11-ed átlaga/.test(html),
      sorok:(html.match(/apRow/g)||[]).length,          /* 1 „most" + 3 szezon */
      figyelmeztet:/nem ígéret/.test(html)};

    /* ---- 10. A MAG EGYEZIK A VALÓDI JÁTÉKKAL ---- */
    const e1=mk("Valos",17,66,5200), e2=mk("Jos",17,66,5200);
    /* „valódi": ugyanaz a két mag, de a LIVE úton (kockadobás nélkül nem
       hasonlítható, ezért a POT-ágat mindkettőnél a várható értékre kérjük) */
    for(let m=0;m<30;m++)academyMatchStep(e1,true);
    careerAgeStepCore(e1,false);
    const jos=academyProject(e2,1)[0];
    o.mag_egyezik={valos:{kor:e1.age,r:Math.round(e1.startRating),pot:Math.round(e1.pot)},
                   jos:{kor:jos.kor,r:jos.rating,pot:jos.pot}};
    return o;}));

  /* ---- 6-9. AZ AJÁNLAT-FÉK ---- */
  Object.assign(out,await p.evaluate(()=>{
    const o={};
    gameMode="career";S.seasonNumber=5;S.idx=0;S.auto=false;
    S.frozenAcademySeasons=0;
    const mk=(n,age)=>{careerPool[n]={n,pos:["CS"],nat:"Magyarország",conf:0,age,
      startRating:70,peak:potToPeakOvr(4000),basePeak:potToPeakOvr(4000),pot:4000,
      youthBonus:0,youthBonusStartAge:age,formPoints:0,estimatedPOT:4000};
      drafted.add(n);return careerPool[n];};
    mk("Ifi1",18);mk("Ifi2",18);mk("Ifi3",18);
    S.academy=[{n:"Ifi1",leftAge:17,leftRating:66,leftSeason:4,times:1},
               {n:"Ifi2",leftAge:17,leftRating:66,leftSeason:4,times:1},
               {n:"Ifi3",leftAge:17,leftRating:66,leftSeason:4,times:1}];
    /* a képernyőt nem nyitjuk meg — a JELÖLT-VÁLASZTÁST mérjük */
    const igazi=showAcademyReveal;
    let ajanlott=[];
    showAcademyReveal=(pr,cb,rec)=>{ajanlott.push(rec?rec.n:"ÚJ");cb&&cb();};
    /* sok kört futtatunk: aki már volt idén, nem jöhet vissza */
    for(let i=0;i<400;i++){S.idx=i*4;tryAcademyOpportunity(()=>{});}
    const idei={};ajanlott.filter(x=>x!=="ÚJ").forEach(n=>{idei[n]=(idei[n]||0)+1;});
    o.egy_szezon={ajanlatok:idei,max:Math.max(0,...Object.values(idei))};
    /* KÖVETKEZŐ SZEZON: ugyanazok újra jöhetnek */
    S.seasonNumber=6;ajanlott=[];
    for(let i=0;i<400;i++){S.idx=i*4;tryAcademyOpportunity(()=>{});}
    const jovo={};ajanlott.filter(x=>x!=="ÚJ").forEach(n=>{jovo[n]=(jovo[n]||0)+1;});
    o.kovetkezo={ajanlatok:jovo,osszes:Object.values(jovo).reduce((a,b)=>a+b,0)};
    /* BALLAGÁS: garantált marad, a szezon-fék nem érinti */
    S.seasonNumber=7;careerPool.Ifi1.age=21;
    S.academy=[{n:"Ifi1",leftAge:17,leftRating:66,leftSeason:4,times:1,offerSeason:7}];
    ajanlott=[];
    tryAcademyOpportunity(()=>{});
    o.ballagas_garantalt=ajanlott[0]==="Ifi1";
    showAcademyReveal=igazi;
    return o;}));

  /* ---- 6. A BALLAGÁSON NINCS JÓSLAT ---- */
  out.final_nincs_joslat=await p.evaluate(()=>{
    gameMode="career";S.seasonNumber=3;
    const n="Ballagó Béla";
    careerPool[n]={n,pos:["CS"],nat:"Magyarország",conf:0,age:21,startRating:74,
      peak:potToPeakOvr(4200),basePeak:potToPeakOvr(4200),pot:4200,
      youthBonus:0,youthBonusStartAge:21,formPoints:0,estimatedPOT:4200};
    const pr=careerPlayerFromPoolEntry(careerPool[n]);
    const rec={n,leftAge:17,leftRating:64,leftSeason:1,times:3};
    showAcademyReveal(pr,()=>{},rec,true);
    const h=document.getElementById("unlockBody").innerHTML;
    const van=h.indexOf("acProj")>=0;
    document.getElementById("scUnlock").classList.add("hide");
    return {joslat:van,cim:document.getElementById("unlockTitle").textContent};});

  await b.close();srv.kill();

  const A=[],ok=(n,f,mit)=>A.push({n,ok:!!f,mit:mit||""});
  const r=s=>s.map(x=>x.rating).join("→");
  ok("a TEHETSÉG (POT) számít — nagyobb POT, magasabb pálya",
     r(out.tehetsegesebb)!==r(out.alap),`${r(out.alap)} vs ${r(out.tehetsegesebb)}`);
  ok("a KOR számít — az idősebb kevesebb szezont kap",
     out.idosebb.length<out.alap.length,`${out.alap.length} vs ${out.idosebb.length} szezon`);
  ok("a KEZDŐ RATING számít", r(out.jobbRating)!==r(out.alap),
     `${r(out.alap)} vs ${r(out.jobbRating)}`);
  ok("a jóslat determinisztikus (kétszer hívva ugyanaz)",
     out.ketszer.a===out.ketszer.b);
  ok("a jóslat nem ír bele az élő állapotba", out.tiszta===true);
  ok("a 19 évesnél a 21-es ballagásnál megáll, és jelöli",
     out.ballago.length===2&&out.ballago[1].ballagas===true&&out.ballago[1].kor===21);
  ok("a már 21 évesnél nincs mit jósolni", out.mar_ballagott.length===0);
  /* A LEGJOBB 11 a teljes keretből: 4 tartalék (88,87,84,82) + 7 pad (86) =
     11 fő, mind a gyenge kezdő 11 (70) FÖLÖTT. Átlag = (88+87+84+82+7×86)/11. */
  ok("a mérce a LEGJOBB 11, nem a felállított kezdő 11",
     out.legjobb11!=null&&out.legjobb11>out.kezdo11_atlaga+10,
     `legjobb 11: ${out.legjobb11&&out.legjobb11.toFixed(2)} · kezdő 11: ${out.kezdo11_atlaga}`);
  ok("a besorolás négy fokozata helyes",
     /legjobb 11-ed fölött/.test(out.tagek.felette)&&/legjobb 11-es szint/.test(out.tagek.szinten)
     &&/legjobb 11-ed alatt/.test(out.tagek.alatta)&&/messze/.test(out.tagek.messze)
     &&out.tagek.nincsXi===null);
  ok("a doboz kirajzolódik: 1 mostani + 3 szezon sor, figyelmeztetéssel",
     out.doboz.van&&out.doboz.sorok===4&&out.doboz.figyelmeztet);
  ok("a doboz KIÍRJA a mércét, hogy a szám ne lógjon a levegőben",
     out.doboz.xi_kiirva===true);
  ok("egy szezon előrejátszva = egy szezon lejátszva (a két mag ugyanaz)",
     JSON.stringify(out.mag_egyezik.valos)===JSON.stringify(out.mag_egyezik.jos),
     JSON.stringify(out.mag_egyezik));
  ok("EGY SZEZONBAN egy játékos LEGFELJEBB EGYSZER jön vissza",
     out.egy_szezon.max<=1,JSON.stringify(out.egy_szezon.ajanlatok));
  ok("a következő szezonban viszont újra jöhetnek",
     out.kovetkezo.osszes>0,JSON.stringify(out.kovetkezo.ajanlatok));
  ok("a BALLAGÁS garantált marad — a szezon-fék nem érinti",
     out.ballagas_garantalt===true);
  ok("a ballagási ajánlaton NINCS jóslat",
     out.final_nincs_joslat.joslat===false&&/Ballagás/.test(out.final_nincs_joslat.cim));
  ok("nincs futásidejű hiba", hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  console.log("\n=== 🔮 AKADÉMIAI ELŐREJELZÉS ===");
  A.forEach(x=>console.log(`${x.ok?"✅":"❌"} ${x.n}${x.mit?`  · ${x.mit}`:""}`));
  if(hiba.length)console.log("\nHIBÁK:\n"+hiba.slice(0,8).join("\n"));
  const bukott=A.filter(x=>!x.ok).length;
  console.log(`\n${A.length-bukott}/${A.length} rendben`);
  process.exit(bukott?1:0);
})();
