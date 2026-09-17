/* 🗺️ A KIHÍVÁS-JUTALOM EGY EGÉSZ KATEGÓRIÁT OLD FEL (3.9.89).

   KIMONDOTT KÉRÉS: „Az a jutalom ami egy beragadt mérföldkő jutalmát oldja fel
   az változzon meg arra hogy az egyik stílusmérföldkő csoportot amelyikben ugye
   beragadt mérföldkő is lehetne egy az egyben feloldja."

   A RÉGI JUTALOM egyetlen beragadt fokozatot fizetett ki. Az új egy EGÉSZ
   kategóriát nyit meg — azt, amelyik a legtöbbet éri —, és ami benne áll, az
   nem ragad be, hanem azonnal fizet.

   A KÉT ÁG. „Beragadt fokozat" csak MÁR NYITOTT kategóriában létezik: a zárás
   alatt teljesült fokozat a MEGNYITÁS pillanatában ragad be (msUnlockCat).
   Ezért:
     1. ha van még zárt kategória → azt nyitjuk meg ingyen, azonnali fizetéssel;
     2. ha már minden nyitva → a legtöbb beragadt fokozatot tartó kategória
        ÖSSZES beragadt jutalma egyszerre folyik be.

   Amit mér:
     1. a jutalom leírása tényleg a kategóriáról szól;
     2. az 1. ág: ingyen nyílik (a büdzsé nem mozdul), a kész fokozatok
        AZONNAL fizetnek, és EGY SEM ragad be;
     3. a választás: a legtöbb kész fokozatot tartó kategóriát viszi, döntetlennél
        a drágábbat;
     4. a 2. ág: minden nyitva → a legtöbb beragadtat tartó kategória ÜRÜL KI,
        a többi kategória beragadt jutalma érintetlen marad;
     5. hogy a stíluspont tényleg megérkezik, és a napló is írja;
     6. az üres eset: nincs zárt kategória és nincs beragadt jutalom;
     7. és hogy a fizetős megnyitás (msUnlockCat) VÁLTOZATLAN — az továbbra is
        beragaszt, és továbbra is fizet a büdzséből. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9029'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9029/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof msGrantCat==="function"&&typeof applyChallengeReward==="function"
    &&typeof MS_STYLE_CATS!=="undefined",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    S.style={key:"panzer",traits:{}};

    /* A jutalom szövege a listából. */
    ki.leiras=(()=>{
      for(let i=0;i<4000;i++){
        const r=genReward("long","hard",{});
        if(r&&r.kind==="msUnstick")return r.desc;}
      return null;})();

    /* ---- A TEREP ----
       Minden kategóriát zárunk, a mérföldkövek haladását pedig kézzel
       állítjuk: a p() függvényt cseréljük, hogy pontosan tudjuk, mi „kész". */
    const M=msState();
    const eredetiP={};
    MILESTONES.forEach(d=>{eredetiP[d.id]=d.p;});
    /* A NEM KÉSZ fokozatot BIZTOSAN a küszöb alá kell vinni: a táblában van
       0-s és negatív küszöb is (a nehézség-lépcsők miatt), ott a puszta 0
       már teljesítésnek számítana. */
    const allits=(keszCatok)=>{
      const maradt=Object.assign({},keszCatok);
      MILESTONES.forEach(d=>{
        if((maradt[d.cat]||0)>0){maradt[d.cat]--;d.p=()=>d.n;}
        else d.p=()=>d.n-1e9;});};
    const tiszta=()=>{
      M.cats={};M.pend={};M.done={};M.missed={};M.log=[];
      M.sp=0;M.spEarned=0;};

    /* ---- 2-3. AZ ELSŐ ÁG ---- */
    tiszta();
    /* „piac"-ban 3 kész fokozat, „vagyon"-ban 1 — a piacot kell vinnie. */
    allits({piac:3,vagyon:1});
    S.transferBudget=50000000;
    const budzse0=S.transferBudget;
    const sp0=M.sp;
    const uzenet=applyChallengeReward({kind:"msUnstick"});
    ki.ag1={uzenet,
      budzseValtozott:S.transferBudget!==budzse0,
      piacNyitva:msCatUnlocked("piac"),
      vagyonNyitva:msCatUnlocked("vagyon"),
      beragadt:Object.keys(M.pend||{}).filter(x=>M.pend[x]).length,
      kifizetve:Object.keys(M.done||{}).length,
      spNott:M.sp>sp0,
      naploVanMegnyitas:(M.log||[]).length>0};

    /* döntetlennél a drágább: két kategória 2-2 kész fokozattal */
    tiszta();
    allits({vagyon:2,trofeak:2});
    const arVagyon=msCatPrice("vagyon"),arTrofeak=msCatPrice("trofeak");
    applyChallengeReward({kind:"msUnstick"});
    ki.dontetlen={vagyon:arVagyon,trofeak:arTrofeak,
      vagyonNyitva:msCatUnlocked("vagyon"),trofeakNyitva:msCatUnlocked("trofeak")};

    /* ---- 7. A FIZETŐS ÚT VÁLTOZATLAN ---- */
    tiszta();
    allits({piac:3});
    S.transferBudget=50000000;
    const b0=S.transferBudget;
    const res=msUnlockCat("piac");
    ki.fizetos={ok:res.ok,fizetett:b0-S.transferBudget>0,
      beragadt:Object.keys(M.pend||{}).filter(x=>M.pend[x]).length,
      kifizetve:Object.keys(M.done||{}).length};

    /* ---- 4. A MÁSODIK ÁG: minden nyitva ---- */
    tiszta();
    /* nyissunk ki MINDENT fizetősen, úgy hogy beragadjon a cucc */
    allits({piac:3,vagyon:2,trofeak:1});
    S.transferBudget=900000000;
    MS_STYLE_CATS.forEach(c=>{msUnlockCat(c.key);});
    const beragadtOssz=Object.keys(M.pend||{}).filter(x=>M.pend[x]).length;
    const perCat0={};
    Object.keys(M.pend||{}).forEach(id=>{if(!M.pend[id])return;
      const d=MILESTONES.find(x=>x&&x.id===id);if(d)perCat0[d.cat]=(perCat0[d.cat]||0)+1;});
    const sp1=M.sp;
    const uz2=applyChallengeReward({kind:"msUnstick"});
    const perCat1={};
    Object.keys(M.pend||{}).forEach(id=>{if(!M.pend[id])return;
      const d=MILESTONES.find(x=>x&&x.id===id);if(d)perCat1[d.cat]=(perCat1[d.cat]||0)+1;});
    ki.ag2={uzenet:uz2,elotte:perCat0,utana:perCat1,
      ossz:beragadtOssz,maradt:Object.keys(M.pend||{}).filter(x=>M.pend[x]).length,
      spNott:M.sp>sp1};

    /* ---- 6. AZ ÜRES ESET ---- */
    tiszta();
    allits({});
    S.transferBudget=900000000;
    MS_STYLE_CATS.forEach(c=>{msUnlockCat(c.key);});
    ki.ures=applyChallengeReward({kind:"msUnstick"});

    MILESTONES.forEach(d=>{d.p=eredetiP[d.id];});
    tiszta();
    return ki;});

  if(t.leiras==null){ok(false,"a jutalom nincs a listában");}
  else{
    console.log("=== 1. a jutalom leírása ===");
    console.log("  "+t.leiras);
    ok(/kategória/.test(t.leiras)&&!/egy beragadt mérföldkő/.test(t.leiras),
       "a szöveg a kategóriáról szól, nem egyetlen fokozatról");}

  console.log("=== 2. az első ág: zárt kategória, ingyen ===");
  console.log("  "+t.ag1.uzenet);
  ok(t.ag1.piacNyitva,"a legtöbb kész fokozatot tartó kategória nyílt meg");
  ok(!t.ag1.vagyonNyitva,"a másik zárva maradt — egyszerre EGYET old fel");
  ok(!t.ag1.budzseValtozott,"a büdzséből semmi nem ment el");
  ok(t.ag1.beragadt===0,"EGY fokozat sem ragadt be");
  ok(t.ag1.kifizetve===3,"mind a 3 kész fokozat azonnal kifizetődött",t.ag1.kifizetve);
  ok(t.ag1.spNott,"a csapatstílus-pont megérkezett");
  ok(t.ag1.naploVanMegnyitas,"a napló is jegyzi");

  console.log("=== 3. döntetlennél a drágább ===");
  const d=t.dontetlen;
  const dragabb=d.vagyon>d.trofeak?"vagyon":"trofeak";
  ok((dragabb==="vagyon")?d.vagyonNyitva:d.trofeakNyitva,
     "azonos kész-szám mellett a drágább kategóriát viszi",d);

  console.log("=== 7. a fizetős megnyitás változatlan ===");
  ok(t.fizetos.ok&&t.fizetos.fizetett,"továbbra is a büdzséből megy",t.fizetos);
  ok(t.fizetos.beragadt===3&&t.fizetos.kifizetve===0,
     "…és továbbra is BERAGASZT, nem fizet azonnal",t.fizetos);

  console.log("=== 4. a második ág: minden nyitva ===");
  console.log("  "+t.ag2.uzenet);
  const legtobb=Object.keys(t.ag2.elotte).sort((a,b)=>t.ag2.elotte[b]-t.ag2.elotte[a])[0];
  ok(t.ag2.utana[legtobb]===undefined,
     `a legtöbb beragadtat tartó kategória (${legtobb}) teljesen kiürült`,
     {elotte:t.ag2.elotte,utana:t.ag2.utana});
  ok(t.ag2.maradt>0&&t.ag2.maradt===t.ag2.ossz-t.ag2.elotte[legtobb],
     "a többi kategória beragadt jutalma ÉRINTETLEN",
     {ossz:t.ag2.ossz,maradt:t.ag2.maradt});
  ok(t.ag2.spNott,"a stíluspont itt is megérkezett");

  console.log("=== 6. az üres eset ===");
  console.log("  "+t.ures);
  ok(/elveszett|nincs/.test(t.ures||""),"őszintén megmondja, ha nincs mit feloldani",t.ures);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
