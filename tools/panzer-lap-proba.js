/* 🃏 PANZER: A LAP ÉPÍT, NEM ROMBOL (3.9.85).

   KIMONDOTT KÉRÉS: „Azzal is segítsük már a panzerkampfwagent, hogy a
   kiállítások, sárgalapok ellenkező módon hassanak a formára is (és ezt is a
   fordított jellem képesség erősítse). Ne az legyen már, hogy arra hajtunk,
   hogy folyton sárga és piros lap legyen, de ez elcseszi a formánkat full..."

   A LAP HÁROM HELYEN BÜNTETETT, és mind a három a FORMÁBA fut be:
     1. mstatRate → parts.red: −1,4 … −3,0 csillag a perce szerint;
     2. mstatUnratable: a 25. perc előtti piros lapnál NINCS értékelés (a
        forma pedig az értékelésekből él → a meccs kiesik a formából);
     3. applyDisciplineDip → S.discWatch → pOvr −2 Rating egy-két meccsre.
   A SÁRGA lapnak eddig SEMMILYEN formahatása nem volt — ott nincs mit
   megfordítani, ott nulláról indul egy pozitív tétel.

   Amit mér:
     1. a konstansok és a Fordított jellem lépcsője (1 / 1,35 / 1,70 / 2,10);
     2. hogy Panzerrel a piros lap POZITÍV csillagtétel, és a KORAI ér a
        legtöbbet — ugyanaz a görbe, mint a büntetésé, tükrözve;
     3. hogy a korai kiállítás Panzerrel már NEM minősíthetetlen;
     4. hogy a sárga lapok tétele darabonként PZ_CARD_YEL × lift;
     5. hogy a fegyelmi visszaesés LAPRA lendületté válik, ÖNGÓLRA viszont
        visszaesés marad;
     6. hogy a kész értékelés (az, ami a formát táplálja) tényleg FELMEGY a
        laptól, nem le;
     7. és a legfontosabb: hogy MINDEN MÁS filozófiában betűre a régi
        rendszer fut — a piros lap ugyanaz a negatív szám, a sárga nulla, a
        fegyelmi visszaesés −2. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
const kb=(x)=>Math.round(x*1e6)/1e6;
(async()=>{
  const srv=spawn('python3',['-m','http.server','9017'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9017/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof S!=="undefined"&&typeof mstatRate==="function"
    &&typeof pzCardsBuild==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    /* ---- A TEREP ----
       Egy „üres" játékos és egy semleges környezet: minden tétel nulla körül
       van, hogy a LAP tétele önmagában látszódjon. A `share:1` kell, különben
       a rövid beállás súlya elmosná a különbséget. */
    gameMode="career";
    const pl={n:"Teszt Elek",ovr:80,pos:["KKP"]};
    const ctx={oppOvr:80,teamAvg:80,tacticKey:null,styleKey:null,
      styleStar:null,cleanSheet:false,ga:1,cls:"draw",mod:null};
    const sor=(o)=>Object.assign({pl,pos:"KKP",share:1,g:0,a:0,
      red:false,redMin:null,yc:0},o);
    const ert=(o)=>mstatRate(sor(o),ctx);

    /* A filozófiát ugyanazon az úton kapcsoljuk, amit a motor olvas:
       S.style.key + a Fordított jellem megvett szintje. */
    const allit=(kulcs,szint)=>{
      S.style=kulcs?{key:kulcs,traits:szint?{abs_jellem:szint}:{}}:null;
      S.style2=null;};

    ki.allando={red:PZ_CARD_RED,yel:PZ_CARD_YEL,ovr:PZ_CARD_OVR,
      lift:PZ_CARD_LIFT.slice(),korai:MSTAT_EARLY_RED};

    /* ---- 1. A KAPCSOLÓ ---- */
    allit(null,0);      ki.ki_nelkul=pzCardsBuild();
    allit("beton",0);   ki.ki_beton=pzCardsBuild();
    allit("panzer",0);  ki.be_panzer=pzCardsBuild();
    ki.liftek=[0,1,2,3].map(lv=>{allit("panzer",lv);return pzCardLift();});
    /* a Fordított jellem MÁSODLAGOS slotban is számít */
    S.style={key:"beton",traits:{}};S.style2={key:"panzer",traits:{abs_jellem:3}};
    ki.masodlagos={be:pzCardsBuild(),lift:pzCardLift()};

    /* ---- 2-4. A TÉTELEK ---- */
    const percek=[5,24,25,26,45,80,89];
    ki.regi={};ki.uj={};
    allit("beton",0);
    percek.forEach(m=>{ki.regi[m]=ert({red:true,redMin:m}).parts.red;});
    ki.regi.nincsPerc=ert({red:true,redMin:null}).parts.red;
    ki.regi.sarga2=ert({yc:2}).parts.yellow;
    ki.regi.sargaVan=("yellow" in ert({yc:2}).parts);
    allit("panzer",0);
    percek.forEach(m=>{ki.uj[m]=ert({red:true,redMin:m}).parts.red;});
    ki.uj.nincsPerc=ert({red:true,redMin:null}).parts.red;
    ki.uj.sarga1=ert({yc:1}).parts.yellow;
    ki.uj.sarga2=ert({yc:2}).parts.yellow;
    ki.uj.sarga0=("yellow" in ert({yc:0}).parts);
    /* a lift végigüt mindkét tételen */
    ki.skala=[0,1,2,3].map(lv=>{allit("panzer",lv);
      return {red:ert({red:true,redMin:45}).parts.red,
              yel:ert({yc:3}).parts.yellow};});

    /* ---- A MINŐSÍTHETETLENSÉG ---- */
    const un=(m)=>mstatUnratable(sor({red:true,redMin:m}),ctx,"KOZEPPALYAS",false);
    allit("beton",0); ki.unRegi=percek.map(un);
    allit("panzer",0);ki.unUj=percek.map(un);

    /* ---- 6. A KÉSZ ÉRTÉKELÉS (ez táplálja a formát) ---- */
    const csillag=(o)=>{const r=ert(o);return r.rated?r.v:null;};
    allit("beton",0);
    ki.csRegi={tiszta:csillag({}),korai:csillag({red:true,redMin:10}),
      kesei:csillag({red:true,redMin:85}),sarga:csillag({yc:2})};
    allit("panzer",0);
    ki.csUj={tiszta:csillag({}),korai:csillag({red:true,redMin:10}),
      kesei:csillag({red:true,redMin:85}),sarga:csillag({yc:2})};
    allit("panzer",3);
    ki.csUj3={korai:csillag({red:true,redMin:10}),sarga:csillag({yc:2})};
    return ki;});

  console.log("=== a konstansok és a kapcsoló ===");
  console.log("  "+JSON.stringify(t.allando));
  ok(t.ki_nelkul===false,"filozófia nélkül nincs lap-fordítás");
  ok(t.ki_beton===false,"Beton: nincs lap-fordítás");
  ok(t.be_panzer===true,"Panzer: ÉL a lap-fordítás (alapból, képesség nélkül is)");
  ok(JSON.stringify(t.liftek)===JSON.stringify([1,1.35,1.7,2.1]),
     "a Fordított jellem lépcsője",t.liftek);
  ok(t.masodlagos.be===true&&t.masodlagos.lift===2.1,
     "MÁSODLAGOS filozófiaként is számít",t.masodlagos);

  console.log("=== a piros lap előjelet vált ===");
  const percek=[5,24,25,26,45,80,89];
  ok(percek.every(m=>t.regi[m]<0),"a régi tétel minden percben negatív",
     percek.map(m=>kb(t.regi[m])));
  ok(percek.every(m=>t.uj[m]>0),"Panzerrel minden percben POZITÍV",
     percek.map(m=>kb(t.uj[m])));
  ok(t.uj[5]>t.uj[89],"a KORAI lap ér a legtöbbet — ahogy a büntetés is",
     {p5:kb(t.uj[5]),p89:kb(t.uj[89])});
  ok(t.regi[5]<t.regi[89],"a régi görbe ugyanígy állt (tükör)",
     {p5:kb(t.regi[5]),p89:kb(t.regi[89])});
  ok(kb(t.uj.nincsPerc)===kb(t.uj[45]),"ismeretlen perc = a mérkőzés közepe",
     {nincs:kb(t.uj.nincsPerc),p45:kb(t.uj[45])});
  ok(kb(t.uj[5])===kb(1.10+1.10*(1-5/90)),"a képlet betűre",kb(t.uj[5]));

  console.log("=== a sárga lap: nulláról indul ===");
  ok(t.regi.sargaVan===false&&t.regi.sarga2===undefined,
     "a régi rendszerben a sárgának SEMMI formahatása nincs");
  ok(t.uj.sarga0===false,"nulla sárgánál Panzerrel sincs tétel");
  ok(kb(t.uj.sarga1)===0.3&&kb(t.uj.sarga2)===0.6,
     "Panzerrel darabonként +0,30",{egy:kb(t.uj.sarga1),ketto:kb(t.uj.sarga2)});

  console.log("=== a Fordított jellem mindkét tételt feszíti ===");
  [1,2,3].forEach(lv=>{
    const v=[1,1.35,1.7,2.1][lv];
    ok(kb(t.skala[lv].red)===kb(t.skala[0].red*v)
     &&kb(t.skala[lv].yel)===kb(t.skala[0].yel*v),
       `${lv}. szint: mindkét tétel ×${v}`,t.skala[lv]);});

  console.log("=== a korai kiállítás nem törli az estét ===");
  ok(t.unRegi[0]===true&&t.unRegi[1]===true&&t.unRegi[2]===true,
     "a régi rendszerben a 25. percig minősíthetetlen",t.unRegi);
  ok(t.unRegi[3]===false,"a 26. perctől már nem",t.unRegi[3]);
  ok(t.unUj.every(x=>x===false),"Panzerrel EGYIK perc sem az",t.unUj);

  console.log("=== a kész értékelés — ez megy a formába ===");
  ok(t.csRegi.korai<t.csRegi.tiszta&&t.csRegi.kesei<t.csRegi.tiszta,
     "régen a lap LEHÚZTA az értékelést",t.csRegi);
  ok(t.csUj.korai>t.csUj.tiszta&&t.csUj.kesei>t.csUj.tiszta,
     "Panzerrel FELHÚZZA",t.csUj);
  ok(t.csUj.sarga>t.csUj.tiszta,"a két sárga is fölfelé visz",
     {sarga:t.csUj.sarga,tiszta:t.csUj.tiszta});
  ok(t.csUj3.korai>=t.csUj.korai&&t.csUj3.sarga>=t.csUj.sarga,
     "a 3. szint még többet ad",{sz0:t.csUj.korai,sz3:t.csUj3.korai});
  ok(t.csRegi.tiszta===t.csUj.tiszta,
     "LAP NÉLKÜL a két filozófia értékelése azonos — nincs szivárgás",
     {regi:t.csRegi.tiszta,uj:t.csUj.tiszta});

  /* ---- 5. A FEGYELMI VISSZAESÉS ---- */
  console.log("=== fegyelmi: lapra lendület, öngólra visszaesés ===");
  const d=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    /* Az applyDisciplineDip a fullTime BELSŐ függvénye, tehát kívülről nem
       hívható — a viselkedését a két összetevőjén mérjük: a pzDiscBoost
       (lap-ág) és a S.discWatch → pOvr (öngól-ág). */
    const pl={n:"Fegyelmi Ferenc",ovr:80,pos:["KKP"]};
    const tiszta=()=>{S.discWatch={};S.nextMatchOvr={};};
    const alap=(()=>{tiszta();return pOvr(pl);})();
    tiszta();S.discWatch[pl.n]=2;             ki.ongol=pOvr(pl)-alap;
    S.style={key:"panzer",traits:{}};S.style2=null;
    tiszta();S.discWatch[pl.n]=2;             ki.ongolPanzer=pOvr(pl)-alap;
    ki.lift=[0,1,2,3].map(lv=>{
      S.style={key:"panzer",traits:lv?{abs_jellem:lv}:{}};
      tiszta();const n=pzDiscBoost(pl.n);
      return {ovr:pOvr(pl)-alap,meccs:n};});
    /* a lendület a MENTETT csatornán ül, tehát a mentés viszi */
    ki.mezo=JSON.parse(JSON.stringify(S.nextMatchOvr||{}));
    tiszta();
    return ki;});
  ok(d.ongol===-2,"öngól → −2 Rating (a régi viselkedés)",d.ongol);
  ok(d.ongolPanzer===-2,"öngól PANZERREL IS −2 — az öngól nem lap",d.ongolPanzer);
  ok(d.lift.every((x,i)=>x.ovr===Math.round(2*[1,1.35,1.7,2.1][i])),
     "a lap-lendület +2 … +4, a Fordított jellem szerint",d.lift.map(x=>x.ovr));
  ok(d.lift.every(x=>x.meccs>=1&&x.meccs<=2),"1-2 mérkőzésre szól, mint a dip",
     d.lift.map(x=>x.meccs));
  ok(!!d.mezo["Fegyelmi Ferenc"],"a MENTETT nextMatchOvr-csatornán ül",d.mezo);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,3));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
