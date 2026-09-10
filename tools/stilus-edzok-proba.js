/* 🎩 A FILOZÓFUS-EDZŐK — mind a hét stílusnak (3.9.61)

   BEJELENTETT KÉRÉS: „mindegyik csapatstílushoz kapcsoljunk olyan
   edzővásárlós csapatstílus képességet, mint amilyen a tikitakának és a
   betonvédelemnek van. funkcióban ugyanazt tudják az új edzők mint a másik
   kettőnél."

   A „FUNKCIÓBAN UGYANAZT" A PRÓBA TÁRGYA. Öt új képességet könnyű úgy
   hozzáadni, hogy háromból kettő működik: az egyiknél elmarad a plafon, a
   másiknál a kétszeres tempó, a harmadiknál az ingyen járó szint. Ezért a
   próba NEM egyenként ellenőriz, hanem VÉGIGMEGY mind a hét soron, és
   ugyanazt a négy dolgot kéri számon mindegyiken.

   Használat: node tools/stilus-edzok-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8910'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8910/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";
    const kulcsok=Object.keys(STYLE_COACHES);
    o.db=kulcsok.length;
    o.stilusDb=STYLES.length;
    /* MINDEN stílusnak van edzője? */
    o.hianyzo=STYLES.map(s=>s.key).filter(k=>!STYLE_COACHES[k]);

    o.sorok=kulcsok.map(k=>{
      const d=STYLE_COACHES[k];
      const t=(STYLE_TRAITS[k]||[]).find(x=>x.key===d.fx);
      /* a stílust ráállítjuk, és szintenként megnézzük, mit csinál */
      const mer=lv=>{
        S.style={key:k,traits:{[d.fx]:lv}};
        return {ceil:tacticCeil(d.tactic),tempo:styleCoachTrainMult(d.tactic),
                cap:Math.round(tacticEffectCap(d.tactic)*100)/100};};
      const m0=(S.style={key:k,traits:{}},{ceil:tacticCeil(d.tactic),
        tempo:styleCoachTrainMult(d.tactic)});
      const r1=mer(1),r2=mer(2),r3=mer(3);
      /* az INGYEN járó szint: ha eleve ő az edző */
      const eredeti=coach;
      coach=COACHES.find(c=>c.n===d.name)||null;
      S.style={key:k,traits:{}};
      const ingyen=styleTraitLevel(d.fx);
      const ingyenCeil=tacticCeil(d.tactic),ingyenTempo=styleCoachTrainMult(d.tactic);
      coach=eredeti;
      S.style=null;
      return {stilus:k,fx:d.fx,edzo:fullName(d.name),kepesseg:d.trait,
        taktika:d.tactic,taktikaNev:(TACTICS[d.tactic]||{}).n,tier:t&&t.tier,arak:t&&t.lv.map(L=>L.price),
        van:!!t,
        lv0:m0,lv1:r1,lv2:r2,lv3:r3,
        ingyen,ingyenCeil,ingyenTempo,
        acc:d.acc,leirasban_a_nev:!!(t&&t.d.indexOf(d.acc)>=0)};});

    /* A TAKTIKA-OSZTOZÁS: két stílus is hivatkozhat ugyanarra, de EGYSZERRE
       csak egy élhet. */
    const tak={};
    kulcsok.forEach(k=>{const t=STYLE_COACHES[k].tactic;(tak[t]=tak[t]||[]).push(k);});
    o.osztozas=Object.keys(tak).filter(t=>tak[t].length>1).map(t=>({taktika:t,stilusok:tak[t]}));
    /* …és tényleg csak egy: a Panzer szintje nem emeli a Bombázók plafonját */
    S.style={key:"panzer",traits:{dardai:3}};
    o.keresztbe={panzer_hosszu:tacticCeil("hosszu"),
      panzer_labdatartas:tacticCeil("labdatartas"),
      panzer_busz:tacticCeil("busz")};
    S.style=null;
    o.stilus_nelkul={hosszu:tacticCeil("hosszu"),labdatartas:tacticCeil("labdatartas")};

    /* A RÉGI KETTŐ VÁLTOZATLAN: kulcs, ár, és a nevesített olvasók. */
    S.style={key:"tikitaka",traits:{guardiola:2}};
    o.regi={guardiolaLevel:guardiolaLevel(),ceil:tacticCeil("labdatartas")};
    S.style={key:"beton",traits:{mourinho:3}};
    o.regi.mourinhoLevel=mourinhoLevel();
    o.regi.betonCeil=tacticCeil("busz");
    S.style=null;
    return o;});

  console.log(`=== ${r.db} filozófus-edző, ${r.stilusDb} stílus ===`);
  ok("MINDEN stílusnak van edző-képessége",r.hianyzo.length===0,r.hianyzo);

  console.log("\n=== soronként: ugyanazt tudja mind a hét? ===");
  const tier=[],arak=[],ceil=[],tempo=[],ingyen=[],nev=[];
  r.sorok.forEach(x=>{
    console.log(`  ${x.kepesseg.padEnd(12)} ${x.edzo.padEnd(18)} ${x.taktikaNev||x.taktika}`);
    console.log(`     plafon ${x.lv0.ceil} → ${x.lv1.ceil} → ${x.lv2.ceil} → ${x.lv3.ceil}`
      +` · tempó ${x.lv0.tempo}× → ${x.lv1.tempo}× · sapka ${x.lv3.cap}`);
    tier.push(x.tier);arak.push(JSON.stringify(x.arak));
    ceil.push([x.lv0.ceil,x.lv1.ceil,x.lv2.ceil,x.lv3.ceil].join("-"));
    tempo.push(x.lv0.tempo+"/"+x.lv1.tempo);
    ingyen.push(x.ingyen+"/"+x.ingyenCeil+"/"+x.ingyenTempo);
    nev.push(x.leirasban_a_nev);});
  const egy=a=>new Set(a).size===1;
  ok("mind III. sávos, azonos árakkal",egy(tier)&&egy(arak),{tier:tier[0],ar:arak[0]});
  ok("a plafon mindegyiknél 99 → 99 → 125 → 150",
     egy(ceil)&&ceil[0]==="99-99-125-150",ceil[0]);
  ok("a kétszeres tempó mindegyiknél az 1. szinttől él",
     egy(tempo)&&tempo[0]==="1/2",tempo[0]);
  ok("és az INGYEN járó 1. szint is mind a hétnél működik (szint 1, tempó 2×)",
     egy(ingyen)&&ingyen[0]==="1/99/2",ingyen[0]);
  ok("a leírásban a saját, helyes tárgyesetű neve áll",nev.every(Boolean),
     r.sorok.filter(x=>!x.leirasban_a_nev).map(x=>x.kepesseg));

  console.log("\n=== a taktika-osztozás ártalmatlan ===");
  console.log("  "+JSON.stringify(r.osztozas));
  ok("csak a Hosszú labdákon osztozik két stílus",
     r.osztozas.length===1&&r.osztozas[0].taktika==="hosszu",r.osztozas);
  ok("a Panzer 3. szintje CSAK a saját rendszerét emeli",
     r.keresztbe.panzer_hosszu===150&&r.keresztbe.panzer_labdatartas===99
     &&r.keresztbe.panzer_busz===99,r.keresztbe);
  ok("stílus nélkül minden plafon a régi 99",
     r.stilus_nelkul.hosszu===99&&r.stilus_nelkul.labdatartas===99,r.stilus_nelkul);

  console.log("\n=== a régi kettő érintetlen ===");
  ok("guardiolaLevel és mourinhoLevel a közös táblából is helyes",
     r.regi.guardiolaLevel===2&&r.regi.mourinhoLevel===3,r.regi);
  ok("és a plafonjuk a régi (125 a 2., 150 a 3. szinten)",
     r.regi.ceil===125&&r.regi.betonCeil===150,r.regi);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
