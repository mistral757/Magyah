/* ⭐ A SZTÁROS FILOZÓFIA MÁSODLAGOSKÉNT (3.9.99).

   BEJELENTETT HIBA: „Sztárom a párom másodlagos csapatstílusként megy nekem.
   És itt nem működik se a sztár jóga se az összhangot javító képesség.
   Mindkettő nullán áll. Ezt eddig máskor nem tapasztaltam."

   A GYÖKÉR: a 3.9.64-es másodlagos filozófia bevezetésekor megszületett a
   `starStyle()` — az a függvény, ami MEGTALÁLJA a sztáros stílust akármelyik
   slotban áll. A hívók átvezetése viszont FÉLBEMARADT: a sztár-család egy
   része továbbra is a `styleState()`-ből, vagyis az ELSŐDLEGES stílusból
   olvasott. Ott nincs `.star`, tehát minden ilyen mérő nullát adott.

   AMI EMIATT NÉMA VOLT (a kettőn túl, amit a bejelentés észrevett):
     · a sztár összhang-mérője és a három legerősebb kötése (két mérföldkő-család),
     · a bére és a piaci ára a keret átlagához mérve (két további család),
     · a karrier-statisztikái (gól, gólpassz, meccsember…),
     · a „nem öregszik" képesség évkihagyása,
     · a kijelölt attribútum fejlődés-gyorsítása,
     · és a képesség-sorsolás iránya (skrCat).
   A JÓGA HATÁSA IS HALOTT VOLT, nem csak a kijelzése: a styleYogaActive az
   elsődlegesből nézte, hogy van-e beállított eltolás.

   A MÉRÉS MÓDJA. Nem abszolút számokat állítunk — azok a balansz változásával
   elavulnának —, hanem azt, hogy UGYANAZ A FILOZÓFIA UGYANAZT ADJA, akárhol
   áll. Minden mérő kétszer fut le, elsődlegesként és másodlagosként, és a
   kettőnek egyeznie kell. Így a próba akkor sem hazudik zöldet, ha közben a
   számok maguk elmozdulnak. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9061'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9061/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof starStyle==="function"
    &&typeof styleYogaSkills==="function"&&typeof stStarBond==="function",
    null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    careerPool=careerPool||{};
    const SZ="Sztár Samu",T1="Társ Egy",T2="Társ Kettő";
    [[SZ,90],[T1,72],[T2,70]].forEach(([n,r])=>{
      careerPool[n]={n,pos:["CS"],startRating:r,age:25,peak:r+5};
      initPlayerAttrs(careerPool[n]);});
    /* A sztárnak legyen GÓLSZERZŐ képessége — ő a jóga alanya. */
    /* A KÉSZ SKILL-PÉLDÁNY alakja számít: a skillEffVal a fázisokból számol
       (stagesNeeded / stagesCompleted). Hiányos példánnyal NaN jönne ki, és a
       próba a saját hibáját mérné a termék helyett. */
    const gw=Object.values(SKILLS||{}).find(s=>s&&s.type==="goalw");
    S.skills={};S.skills[SZ]=gw?[{skill:gw,stagesNeeded:2,stagesCompleted:2,stars:0}]:[];
    /* Kötések és keret: a playerBond és a bér/ár-átlagok ebből dolgoznak. */
    bondRosterNames=()=>[SZ,T1,T2];
    bondOf=(a,b)=>60;
    fullCareerRoster=()=>[SZ,T1,T2].map(n=>({n,ovr:careerPool[n].startRating,pos:["CS"]}));
    S.careerStats={};S.careerStats[SZ]={g:11,a:7,mvp:3,rc:0,inj:0,saves:0,cs:0,matches:40,min:3200};

    const SZTAR=()=>({key:"sztar",star:SZ,
      traits:{kemia_gyorsito:3,sztar_joga:3,fejlodes_gyorsitas:3,nem_oregszik:3},
      starAttr:"gol",skrCat:"CSATAR",yoga:{}});
    const BETON=()=>({key:"beton",traits:{}});

    /* MINDEN SZTÁR-MÉRŐ EGY TÁBLÁZATBAN. Ami ide bekerül, azt a próba
       automatikusan mindkét sloton megméri — egy új sztár-mérőt elég ide
       felvenni, és máris védve van. */
    const MEROK={
      "starStyle megtalálja":      ()=>!!starStyle(),
      "stStarEntry":               ()=>!!stStarEntry(),
      "stStarBond":                ()=>stStarBond(),
      "stStarBondPairs":           ()=>stStarBondPairs(),
      "stStarCareer(g)":           ()=>stStarCareer("g"),
      "stStarCareer(mvp)":         ()=>stStarCareer("mvp"),
      "styleYogaSkills":           ()=>styleYogaSkills().length,
      "styleYogaMax":              ()=>styleYogaMax(),
      "styleFxMul(starBondMult)":  ()=>styleFxMul("starBondMult"),
      "styleStarAttrKey":          ()=>styleStarAttrKey(),
      "styleStarAttrMult(sztár)":  ()=>styleStarAttrMult(SZ,"gol"),
      "styleStarAgeEvery":         ()=>styleStarAgeEvery(),
      "fameStarName":              ()=>fameStarName(),
      "skillRealBias iránya":      ()=>{const x=skillRealBias();return x?"van":"nincs";}};

    const mer=()=>{
      const o={};
      Object.keys(MEROK).forEach(k=>{
        try{o[k]=MEROK[k]();}catch(e){o[k]="HIBA:"+(e&&e.message);}});
      return o;};

    /* A) ELSŐDLEGESKÉNT */
    S.style=SZTAR();S.style2=null;
    ki.elso=mer();
    /* B) MÁSODLAGOSKÉNT — ugyanaz a filozófia, másik slot */
    S.style=BETON();S.style2=SZTAR();
    ki.masodik=mer();

    /* ---- A JÓGA HATÁSA, NEM CSAK A KIJELZÉSE ---- */
    const jogaMer=()=>{
      const st=starStyle();
      const sk=(styleYogaSkills()[0]||{}).skill;
      if(!sk)return {nincsSkill:true};
      styleYogaSet(sk.id,0);
      const g0=multSkillEffect(SZ,"goalw"),a0=multSkillEffect(SZ,"assistw");
      styleYogaSet(sk.id,0.75);          /* tolás a GÓLPASSZ felé */
      return {aktiv:styleYogaActive(SZ),
        eltolas:styleYogaShift(sk.id),
        golElotte:Math.round(g0*1000)/1000,golUtana:Math.round(multSkillEffect(SZ,"goalw")*1000)/1000,
        passzElotte:Math.round(a0*1000)/1000,passzUtana:Math.round(multSkillEffect(SZ,"assistw")*1000)/1000};};
    S.style=SZTAR();S.style2=null;
    ki.jogaElso=jogaMer();
    S.style=BETON();S.style2=SZTAR();
    ki.jogaMasodik=jogaMer();

    /* ---- AZ ÖSSZESZOKÁS HATÁSA (bondBoostMult) ---- */
    const bondMer=()=>({sztarral:bondBoostMult(SZ,T1),nelkule:bondBoostMult(T1,T2)});
    S.style=SZTAR();S.style2=null;
    ki.bondElso=bondMer();
    S.style=BETON();S.style2=SZTAR();
    ki.bondMasodik=bondMer();

    /* ---- ÉS EGY ELLENPRÓBA: sztár NÉLKÜL minden néma ---- */
    S.style=BETON();S.style2=null;
    ki.nincsSztar={bond:stStarBond(),yoga:styleYogaSkills().length,
      star:!!starStyle(),bondMult:bondBoostMult(SZ,T1)};

    ki.nevek=Object.keys(MEROK);
    return ki;});

  console.log("=== 1. minden sztár-mérő ugyanazt adja mindkét sloton ===");
  {let el=0;
   t.nevek.forEach(k=>{
     const a=t.elso[k],bb=t.masodik[k];
     const jo=JSON.stringify(a)===JSON.stringify(bb);
     if(!jo){ok(false,`„${k}” elsődlegesként ≠ másodlagosként`,{elso:a,masodik:bb});el++;}});
   ok(el===0,`mind a ${t.nevek.length} mérő egyezik a két sloton`,
      el?undefined:{pelda:{bond:t.masodik["stStarBond"],yoga:t.masodik["styleYogaSkills"]}});}
  console.log("=== 2. …és nem úgy, hogy MINDKETTŐ nulla ===");
  ok(t.elso["stStarBond"]>0,"a sztár összhangja valódi szám",t.elso["stStarBond"]);
  ok(t.elso["styleYogaSkills"]>0,"van átalakítható képessége",t.elso["styleYogaSkills"]);
  ok(t.elso["stStarCareer(g)"]>0,"a karrier-statisztikái megvannak",t.elso["stStarCareer(g)"]);
  ok(t.elso["styleStarAttrMult(sztár)"]>1,
     "az attribútum-gyorsítás tényleg hat rá",t.elso["styleStarAttrMult(sztár)"]);

  console.log("=== 3. a jóga HATÁSA (nem csak a kijelzése) ===");
  ok(t.jogaMasodik.aktiv===true,
     "másodlagosként is aktív a beállított eltolás",t.jogaMasodik);
  ok(t.jogaMasodik.eltolas===0.75,"…és az eltolás értéke megmarad",t.jogaMasodik.eltolas);
  ok(t.jogaMasodik.golUtana<t.jogaMasodik.golElotte
     &&t.jogaMasodik.passzUtana>t.jogaMasodik.passzElotte,
     "a gólesély csökken, a gólpassz-esély nő — az átalakítás megtörtént",t.jogaMasodik);
  ok(JSON.stringify(t.jogaElso)===JSON.stringify(t.jogaMasodik),
     "és a két slot betűre ugyanazt adja",{elso:t.jogaElso,masodik:t.jogaMasodik});

  console.log("=== 4. az Összeszokás hatása ===");
  ok(t.bondMasodik.sztarral>1,
     "a sztár kötései másodlagosként is gyorsabban épülnek",t.bondMasodik);
  ok(t.bondMasodik.nelkule===1,
     "…a sztár NÉLKÜLI pároké viszont nem — a szorzó tényleg rá szól",t.bondMasodik);
  ok(t.bondElso.sztarral===t.bondMasodik.sztarral,
     "és a két slot ugyanannyit ad",{elso:t.bondElso,masodik:t.bondMasodik});

  console.log("=== 5. ellenpróba: sztáros filozófia nélkül minden néma ===");
  ok(t.nincsSztar.star===false&&t.nincsSztar.bond===0
     &&t.nincsSztar.yoga===0&&t.nincsSztar.bondMult===1,
     "a mérők nem „mindig igazat” mondanak — sztár nélkül nullák",t.nincsSztar);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
