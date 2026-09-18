/* 🎓 A SAJÁT NEVELÉSŰ STÁBTAG: OLCSÓBB ÉS GYORSABBAN ÉRIK (3.9.92).

   KIMONDOTT KÉRÉS: „Jelentősen olcsóbbá és erősebbé kellene tenni a saját
   játékosból nevelt stábtagokat. Az ár a teljes skálán legyen feleannyi, mint
   eddig. Az értékelés, amivel felveszed, 50%-kal gyorsabban emelkedjen mint
   eddig, és a saját pozíciójához tartozó segédedzői területen kapjon még
   további 25% gyorsítást. Azon a területen, ahol pedig ténylegesen a
   többiekhez képest kiemelkedő statisztikái vannak, ott további 33% boostot
   kapjon."

   A GYORSÍTÁS A NYERS TÍPUS-PONTSZÁMON megy (0…1), nem a kész Szakértelmen:
   így a 20-99-es skála teteje, az ALAP (kor + rutin) súlya és a
   csillag-fokozatok jelentése a helyén marad — ugyanaz a pályafutás csak
   ELŐBB ér fel ugyanoda.

   Amit mér:
     1. az ár a teljes skálán pontosan feleannyi (a görbe ALAKJA is);
     2. a három szorzó külön-külön és együtt (1,5 · 1,25 · 1,33);
     3. a poszt-szorzó CSAK a kapuval védett területeken jár (a Bástya a
        védőnek, a Kesztyűs mester a kapusnak) — a mindenkinek nyitott
        típusoknál nincs „saját poszt";
     4. a „kiemelkedő" küszöb a NYERS pontszámot méri, a szorzók ELŐTT;
     5. hogy a STÁBPIAC külsőseit egyik szorzó sem érinti — ott a generátor
        visszafelé számol a Szakértelemből, egy szorzó ott a sávot borítaná;
     6. hogy a Szakértelem PLAFONJA és a SZAK maximuma változatlan;
     7. és élesben: egy valódi mezőnyön mennyit mozdul a legjobb ajánlat. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9039'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9039/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof coachGrowMult==="function"&&typeof coachSzFor==="function"
    &&typeof coachOfferPct==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    careerPool=initCareerPlayerPool({stars:2.5});

    /* ---- 1. AZ ÁR ---- */
    ki.ar={min:COACH_OFFER_PCT_MIN,max:COACH_OFFER_PCT_MAX,
      gorbe:[32,33,34,35,36,37,38,40].map(a=>+(coachOfferPct(a)).toFixed(5))};

    /* ---- A TEREP: egy kézzel írt lenyomat ---- */
    const alap=(o)=>Object.assign({
      n:"Teszt Elek",age:35,matches:300,min:24000,peak:85,
      pos:["KV"],attrs:{gol:60,passz:70,ved:88,kapus:40,seb:70},
      karI:3,kapI:5,verI:2,skillsEver:["a","b"],bond:60,noise:0,sebBase:66,
      goals:10,assists:20,saves:0,cleans:90,mvp:30,inj:2,reds:1,own:1},o||{});

    /* ---- 2-4. A SZORZÓK ---- */
    ki.konst={grow:COACH_GROW_MULT,pos:COACH_POS_MULT,star:COACH_STAR_MULT};
    /* A szorzót NEM kerekítjük: az összehasonlítás pontos számra megy. */
    const m=(typeKey,fp)=>{
      const T=coachTypeByKey(typeKey);
      const raw=Math.max(0,Math.min(1,T.score(fp)));
      return {raw:+raw.toFixed(4),mult:coachGrowMult(T,fp,raw),
        star:coachIsStar(typeKey,raw)};};
    /* egy VÉDŐ: a Bástya a saját területe (gate: JV/BV/KV/VKP) */
    const vedo=alap({pos:["KV"]});
    ki.vedo={bastya:m("attr:ved",vedo),   /* poszt-egyezés */
             morale:m("morale",vedo),     /* kapu nélküli — nincs poszt-szorzó */
             golvago:m("attr:gol",vedo)}; /* nem az ő posztja → nem is jogosult */
    /* ugyanő KÜLSŐSKÉNT (nincs own) */
    const kulsos=alap({pos:["KV"]});delete kulsos.own;
    ki.kulsos={bastya:m("attr:ved",kulsos),morale:m("morale",kulsos)};

    /* a három szorzó külön: gyenge (nincs csillag) vs erős (van) a SAJÁT poszton */
    const gyenge=alap({pos:["KV"],attrs:{gol:60,passz:70,ved:60,kapus:40,seb:70},cleans:20});
    const eros  =alap({pos:["KV"],attrs:{gol:60,passz:70,ved:99,kapus:40,seb:70},cleans:200});
    ki.szetszedve={
      gyenge_sajatPoszt:m("attr:ved",gyenge),
      eros_sajatPoszt:m("attr:ved",eros),
      /* kapu nélküli típus, ahol csillagos: csak grow × star */
      kapuNelkul:(()=>{const f=alap({karI:KAR_LEVELS.length-1,peak:110});return m("morale",f);})()};

    /* ---- 4b. A KÜSZÖB A NYERS PONTSZÁMOT MÉRI ---- */
    ki.kuszob={tabla:Object.assign({},COACH_STAR_MIN),
      /* pont a küszöb alatt / fölött */
      alatta:coachIsStar("attr:ved",COACH_STAR_MIN["attr:ved"]-0.001),
      rajta:coachIsStar("attr:ved",COACH_STAR_MIN["attr:ved"]),
      /* és hogy a szorzott érték NEM billenti át: a nyerset kapja */
      nyersElott:(()=>{
        const raw=COACH_STAR_MIN["attr:ved"]-0.05;
        return {nyers:coachIsStar("attr:ved",raw),
                szorzott:coachIsStar("attr:ved",raw*COACH_GROW_MULT)};})()};

    /* ---- 5. A STÁBPIAC ÉRINTETLEN ---- */
    let seed=99;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
    /* A RÉGI képlet, szó szerint — a gyorsítás előtti coachSzFor törzse. A piaci
       ajánlatnak BETŰRE ezt kell adnia, nem csak „körülbelül ennyit". */
    const regiSz=(typeKey,fp)=>{
      const T=coachTypeByKey(typeKey);
      const base=coachAgePts(fp.age)+coachRoutinePts(fpMinutes(fp));
      const spec=Math.max(0,Math.min(1,T.score(fp)))*COACH_SPEC_WEIGHT;
      return Math.round(Math.max(COACH_SZ_MIN,Math.min(COACH_SZ_MAX,base+spec+(fp.noise||0))));};
    const piac=[];
    for(let i=0;i<300;i++){
      const T=COACH_TYPES[Math.floor(rnd()*COACH_TYPES.length)];
      const cel=Math.round(35+rnd()*55);
      const fp=staffMakeFp("Piaci "+i,T.key,cel,rnd);
      if(!fp)continue;
      piac.push({own:!!fp.own,
        egyezik:coachSzFor(T.key,fp)===regiSz(T.key,fp),
        mult:coachGrowMult(T,fp,Math.max(0,Math.min(1,T.score(fp))))});}
    ki.piac={db:piac.length,
      vanOwn:piac.some(x=>x.own),
      mindEgy:piac.every(x=>x.mult===1),
      mindEgyezik:piac.every(x=>x.egyezik),
      elter:piac.filter(x=>!x.egyezik).length};
    /* …és fordítva: a SAJÁT nevelésnek el KELL térnie a régi képlettől,
       különben a próba egy néma no-opot igazolna. */
    ki.sajatElter=(()=>{
      const f=alap({pos:["KV"],attrs:{gol:60,passz:70,ved:99,kapus:40,seb:70},cleans:200});
      return {uj:coachSzFor("attr:ved",f),regi:regiSz("attr:ved",f)};})();

    /* ---- 6. A PLAFON ---- */
    const csucs=alap({age:60,matches:900,min:200000,peak:110,
      attrs:{gol:99,passz:99,ved:99,kapus:99,seb:99},cleans:900,karI:6,kapI:8});
    ki.plafon={sz:coachSzFor("attr:ved",csucs),max:COACH_SZ_MAX,spec:COACH_SPEC_WEIGHT};

    /* ---- 7. ÉLESBEN ---- */
    seed=12345;
    const R=(lo,hi)=>lo+(hi-lo)*rnd();
    const nevek=Object.keys(careerPool);
    const regi=[],uj=[];
    for(let i=0;i<900;i++){
      const e=careerPool[nevek[Math.floor(rnd()*nevek.length)]];
      if(!e||!e.attrs)continue;
      const mm=Math.round(R(90,520));
      const fp={n:e.n+"#"+i,age:Math.round(R(32,39)),matches:mm,min:Math.round(mm*R(55,90)),
        peak:e.peak||80,pos:(e.pos||["KKP"]).slice(),attrs:Object.assign({},e.attrs),
        karI:e.karI,kapI:e.kapI,verI:e.verI,skillsEver:new Array(Math.floor(R(0,5))).fill("x"),
        bond:null,noise:0,sebBase:(e.attrs.seb||60)-Math.round(R(0,8)),own:1};
      staffRealismPass(fp,"none",rnd);
      const best=(own)=>{const f=Object.assign({},fp);if(!own)delete f.own;
        let b=0;COACH_TYPES.forEach(T=>{if(coachTypeAllowed(T,f))b=Math.max(b,coachSzFor(T.key,f));});
        return b;};
      regi.push(best(false));uj.push(best(true));}
    const avg=a=>+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
    ki.eles={n:regi.length,regi:avg(regi),uj:avg(uj),
      regiMax:Math.max(...regi),ujMax:Math.max(...uj),
      maxolt:uj.filter(x=>x>=COACH_SZ_MAX).length};
    return ki;});

  console.log("=== 1. az ár a teljes skálán feleannyi ===");
  console.log("  "+t.ar.gorbe.map((x,i)=>`${[32,33,34,35,36,37,38,40][i]}é: ${(x*100).toFixed(2)}%`).join(" · "));
  ok(t.ar.max===0.30&&t.ar.min===0.20,"a két végpont a régi 60/40% fele",[t.ar.max,t.ar.min]);
  ok(Math.abs(t.ar.gorbe[0]-0.30)<1e-9&&Math.abs(t.ar.gorbe[6]-0.20)<1e-4,
     "32 évesen 30%, 38 évesen 20%",[t.ar.gorbe[0],t.ar.gorbe[6]]);
  ok(t.ar.gorbe.every((x,i)=>i===0||x<=t.ar.gorbe[i-1]+1e-9),
     "a görbe monoton csökken, ahogy eddig is",t.ar.gorbe);

  console.log("=== 2-3. a három szorzó ===");
  console.log("  "+JSON.stringify(t.konst));
  ok(t.konst.grow===1.5&&t.konst.pos===1.25&&t.konst.star===1.33,
     "a kért három szám: +50% · +25% · +33%",t.konst);
  ok(t.vedo.bastya.mult>t.vedo.morale.mult,
     "a védő a BÁSTYÁN többet kap, mint egy kapu nélküli típuson",
     {bastya:t.vedo.bastya.mult,morale:t.vedo.morale.mult});
  ok(Math.abs(t.szetszedve.gyenge_sajatPoszt.mult-1.5*1.25)<1e-9
     &&t.szetszedve.gyenge_sajatPoszt.star===false,
     "csillag nélkül, saját poszton: 1,5 × 1,25 = 1,875",t.szetszedve.gyenge_sajatPoszt);
  ok(Math.abs(t.szetszedve.eros_sajatPoszt.mult-1.5*1.25*1.33)<1e-9
     &&t.szetszedve.eros_sajatPoszt.star===true,
     "csillaggal, saját poszton: 1,5 × 1,25 × 1,33 ≈ 2,494",t.szetszedve.eros_sajatPoszt);
  ok(Math.abs(t.szetszedve.kapuNelkul.mult-1.5*1.33)<1e-9,
     "kapu nélküli típuson csillaggal: 1,5 × 1,33 — poszt-szorzó NINCS",
     t.szetszedve.kapuNelkul);

  console.log("=== 4. a küszöb a NYERS pontszámot méri ===");
  ok(t.kuszob.alatta===false&&t.kuszob.rajta===true,"a küszöb pontosan ott vált",
     {alatta:t.kuszob.alatta,rajta:t.kuszob.rajta});
  ok(t.kuszob.nyersElott.nyers===false&&t.kuszob.nyersElott.szorzott===true,
     "a szorzott érték ÁTBILLENTENÉ — ezért kapja a nyerset",t.kuszob.nyersElott);
  ok(Object.keys(t.kuszob.tabla).length===10,
     "mind a tíz típusnak saját, mért küszöbe van",Object.keys(t.kuszob.tabla).length);

  console.log("=== 5. a stábpiac érintetlen ===");
  ok(t.piac.vanOwn===false,"a piaci lenyomatokon nincs `own` jelző");
  ok(t.piac.mindEgy===true,`mind a ${t.piac.db} piaci ajánlat szorzója 1`);
  ok(t.piac.mindEgyezik===true,
     `mind a ${t.piac.db} piaci ajánlat Szakértelme BETŰRE a régi képlet`,
     {elter:t.piac.elter});
  ok(t.sajatElter.uj>t.sajatElter.regi,
     "…a saját nevelésé viszont tényleg magasabb — a próba nem no-opot igazol",
     t.sajatElter);

  console.log("=== 6. a plafon a helyén ===");
  ok(t.plafon.sz<=t.plafon.max,"a Szakértelem nem lóg ki a 99-es skálából",t.plafon);
  ok(t.plafon.spec===55,"a SZAK maximuma változatlan 55 pont",t.plafon.spec);

  console.log("=== 7. élesben, egy valódi mezőnyön ===");
  console.log(`  a legjobb ajánlat átlagos Szakértelme: ${t.eles.regi} → ${t.eles.uj} `
    +`(max ${t.eles.regiMax} → ${t.eles.ujMax}, N=${t.eles.n})`);
  ok(t.eles.uj>t.eles.regi+8,"érdemben erősebb lett",{regi:t.eles.regi,uj:t.eles.uj});
  ok(t.eles.maxolt===0,"senki nem tapad a 99-es plafonra — maradt hova nőni",t.eles.maxolt);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
