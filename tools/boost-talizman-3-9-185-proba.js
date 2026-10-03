/* ⚡ 3.9.185 — A BOOST-KEDVEZMÉNY JUTALOM ÉS A ⚡ BOOST TALIZMÁN-SZÍN.

   KIMONDOTT KÉRÉS: „A boost ár csökkentő kihívás jutalom legyen gyakoribb és
   legyen a mérték egy sávon belül random: 10-45 % között. Legyen egy új
   talizmángyűjtő csoport. Ennek kifejezetten a boostok lesz a specialitása.
   Szerencse alapon szerezhet random ingyen boostot, bármely típusból (esély
   max 50%/szezon és max 2 db / szezon), […] összesen max 20%kal
   csökkentheti az egész boost csomag alapárát, és vannak boostfajtára
   leosztott plusz kedvezmények, amiből szintén meg 20-20%ot gyűjthet össze.
   És növelheti a boost jutalommal díjazó kihívások esélyét max 40%kal."

   Amit mér:
     1. TALIZMÁN NÉLKÜL a boost-árak és a jutalom-húzás betűre a régi;
     2. A JUTALOM: a kalapban 3 példányban áll, mindegyik 10–45% közti
        sorsolt számmal, a leírás pontosan azt mondja, amit a kifizetés ad;
        a kifizetés szorzódva halmoz, a teteje 75%, a régi (szám nélküli)
        ajánlat 10%-ot ad;
     3. A SZÍN: a TAL_KAT tizenegyedik eleme, négy változat, a plafonok
        (50 / 20 / fajtánként 20 / 40) fognak, a fajta-kedvezmény fajtánként
        külön gyűlik;
     4. AZ ÁRAK: a csomag-kedvezmény minden fajtát, a fajta-kedvezmény csak a
        sajátját viszi le (az egyenlítőét is);
     5. A KIHÍVÁS-ESÉLY: +40%-nál a boost-jutalmak aránya pontosan ×1,4;
     6. A SZERENCSE-BOOST: idényenként két dobás, 50%-on átlag ~1 ingyen
        boost, sosem több kettőnél; a visszatöltés nem dob újra; a nyeremény
        ingyen-zseton egy épp elsüthető fajtára (a rezonancia a legnagyobb
        fajta-kedvezményre teszi);
     7. A HÉT SPECIÁL: a pro-k (sorrend-kedvezmény a budgetPay számlálójával,
        hatás-szorzók, zseton-dupla, Árfigyelő) és a kontrák a kapaszkodóikon;
     8. A FELÜLET: a lap, a menü és a Boost-központ kiírja; 2000 generált
        Boost-lapon nincs NaN/undefined; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9228;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talAlapMind==="function",null,{timeout:15000});

  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=4;S.idx=0;S.tal=null;S.boostDiscount=0;S.chFreeBoost={};S.boostTokens=0;
    window.saveGame=()=>{};
    window._lap=(kat,valt,rang,dobas,spec,extra)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},extra||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length;
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};
  });

  /* ---- 1. SEMLEGES ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    const kep=()=>({unit:boostUnitPrice(),mult:boostDiscountMult(),
      ar:TAL_BOOST_FAJTAK.map(k=>boostPriceOf(k)),
      jel:[talBoostSzerencseP(),talBoostCsomagMult(),talBoostFajtaPct("plain"),talBoostKihivasP(),talBoostSorMult(),
        talBoostHatasMult("plain"),talBoostHatasMult("attr"),talBoostHatasMult("youth")]});
    S.tal=null;_talAlapMemo=null;ki.ures=kep();
    _pakli([_lap("bank","bevetel",4,1),_lap("taktika","fit",4,1)]);
    ki.masik=kep();
    ki.azonos=JSON.stringify(ki.ures)===JSON.stringify(ki.masik);
    ki.semleges=ki.ures.jel.join(",")==="0,1,0,0,1,1,1,1";
    /* a régi képlet: (1−kihívás)·(1−kezdő) — a 4. idényben a kezdő 0 */
    ki.regiMult=Math.abs(ki.ures.mult-1)<1e-12;
    /* a jutalom-húzás: talizmán nélkül a pick() egyszer fut, ugyanazzal a véletlennel */
    const pool=[{kind:"a"},{kind:"boostToken"},{kind:"b"}];
    const r0=Math.random;let i=0;const sor=[0.1,0.5,0.9];
    Math.random=()=>sor[(i++)%3];
    ki.huzas=[chRewardPick(pool).kind,chRewardPick(pool).kind,chRewardPick(pool).kind];
    Math.random=r0;
    return ki;});
  console.log("\n— 1. TALIZMÁN NÉLKÜL SEMMI NEM MOZDUL —");
  ok(n.semleges,"üres gyűjteménnyel minden Boost-olvasó semleges (0 / ×1)",n.ures.jel);
  ok(n.azonos,"más színek talizmánjaival a boost-árak és -szorzók bitre ugyanazok",{ures:n.ures,masik:n.masik});
  ok(n.regiMult,"a kedvezmény-szorzó talizmán és jutalom nélkül 1 (a 4. idényben)",n.ures.mult);
  ok(n.huzas.join(",")==="a,boostToken,b","talizmán nélkül a jutalom-húzás az egyenletes pick()",n.huzas);

  /* ---- 2. A JUTALOM ---- */
  const j=await p.evaluate(()=>{
    const ki={};
    S.tal=null;_talAlapMemo=null;
    let db=0,ossz=0,rossz=0,min=99,max=0,leirasJo=0,poolMeret=0;
    for(let i=0;i<400;i++){
      const pool=[];const r0=pick;
      window.pick=a=>{pool.push(...a);return a[0];};
      genReward("short","medium",challengeContext());
      window.pick=r0;
      poolMeret+=pool.length;
      pool.filter(r=>r.kind==="boostDiscount").forEach(r=>{db++;ossz++;
        if(!(r.amount>=10&&r.amount<=45))rossz++;
        min=Math.min(min,r.amount);max=Math.max(max,r.amount);
        if(r.desc.indexOf(`MINDEN boost ${r.amount}%-kal olcsóbb`)===0)leirasJo++;});}
    ki.perKalap=db/400;ki.rossz=rossz;ki.min=min;ki.max=max;ki.leirasJo=leirasJo===ossz;
    ki.arany=Math.round(db/poolMeret*1000)/10;
    /* kifizetés */
    S.boostDiscount=0;
    ki.t1=applyChallengeReward({kind:"boostDiscount",amount:30});
    ki.d1=S.boostDiscount;
    applyChallengeReward({kind:"boostDiscount",amount:30});
    ki.d2=S.boostDiscount;
    S.boostDiscount=0;applyChallengeReward({kind:"boostDiscount",desc:"régi"});
    ki.regi=S.boostDiscount;
    S.boostDiscount=0;for(let i=0;i<6;i++)applyChallengeReward({kind:"boostDiscount",amount:45});
    ki.plafon=S.boostDiscount;
    ki.mult=boostDiscountMult();
    S.boostDiscount=0;
    return ki;});
  console.log("\n— 2. A BOOST-KEDVEZMÉNY JUTALOM —");
  ok(j.perKalap===3,"a jutalom-kalapban 3 példányban áll (eddig 1)",j.perKalap);
  ok(j.rossz===0&&j.min>=10&&j.max<=45&&j.max-j.min>=25,"a mérték 10–45% közti sorsolt szám (1200 mintán a teljes sáv)",{min:j.min,max:j.max});
  ok(j.leirasJo,"a kártya leírása pontosan a sorsolt számot mondja");
  ok(j.arany>7&&j.arany<13,"a kalapban ~10% az aránya (eddig ~3%)",j.arany+"%");
  ok(Math.abs(j.d1-0.30)<1e-9&&Math.abs(j.d2-0.51)<1e-9,"a kifizetés a saját számát adja, és szorzódva halmoz (30% + 30% = 51%)",{d1:j.d1,d2:j.d2,txt:j.t1});
  ok(Math.abs(j.regi-0.10)<1e-9,"a régi, szám nélküli ajánlat a megígért 10%-ot adja",j.regi);
  ok(Math.abs(j.plafon-0.75)<1e-9&&Math.abs(j.mult-0.25)<1e-9,"a halmozott kihívás-kedvezmény teteje 75%",{plafon:j.plafon,mult:j.mult});

  /* ---- 3. A SZÍN ---- */
  const c=await p.evaluate(()=>{
    const ki={};
    const K=talKat("boost");
    ki.van=!!K&&TAL_KAT.length===11&&TAL_KAT[10].k==="boost";
    ki.valt=K?K.valt.map(v=>v.k+":"+v.cap):[];
    ki.spec=TAL_SPEC.filter(s=>s.k==="boost").map(s=>s.id);
    ki.specKesz=ki.spec.every(id=>talSpecMukodik(id));
    ki.min1=TAL_SPEC.some(s=>s.k==="boost"&&s.min===1);
    ki.kontraMas=TAL_SPEC.filter(s=>s.k==="boost").every(s=>s.con.k!=="boost"&&!!talKat(s.con.k));
    ki.rez=!!TAL_REZ.boost;
    /* plafonok: 10 legendás, maximális dobás, Tiszta */
    const tiz=v=>Array.from({length:10},()=>_lap("boost",v,4,1));
    _pakli(tiz("szerencse"));ki.szer=talAlap("boost","szerencse");ki.szerP=talBoostSzerencseP();
    _pakli(tiz("csomag"));ki.csom=talAlap("boost","csomag");
    _pakli(tiz("kihivas"));ki.kih=talAlap("boost","kihivas");
    _pakli(Array.from({length:10},()=>_lap("boost","fajta",4,1,null,{bf:"youth"})).concat([_lap("boost","fajta",1,0.5,null,{bf:"attr"})]));
    ki.fajtaY=talBoostFajtaPct("youth");ki.fajtaA=talBoostFajtaPct("attr");ki.fajtaP=talBoostFajtaPct("plain");
    /* egy átlagos (E=1,25 Tiszta), egy fajta-lap: 4·1,25 = 5% */
    _pakli([_lap("boost","fajta",1,0.5,null,{bf:"bond"})]);
    ki.egy=talBoostFajtaPct("bond");
    /* a generátor: a fajta-lapon mindig van elsüthető fajta */
    const rnd=talRng("proba-boost");let nincs=0,rossz=0,fajtak={};
    for(let i=0;i<2000;i++){
      const L=talUjLap(rnd,"boost",talRollRang(rnd));
      if(L.valt==="fajta"){if(!L.bf||TAL_BOOST_FAJTAK.indexOf(L.bf)<0)nincs++;else fajtak[L.bf]=(fajtak[L.bf]||0)+1;}
      const t=talAlapSzoveg(L)+"|"+talLapNev(L)+"|"+talSav(L);
      if(/NaN|undefined|null|\{v\}/.test(t))rossz++;}
    ki.nincs=nincs;ki.rossz=rossz;ki.fajtak=fajtak;
    ki.skillNincs=!skillRealOn()?!fajtak.skill:true;
    ki.equalNincs=!eqOn()?!fajtak.equal:true;
    return ki;});
  console.log("\n— 3. A ⚡ BOOST SZÍN —");
  ok(c.van,"a TAL_KAT tizenegyedik eleme a ⚡ Boost");
  ok(c.valt.join(",")==="szerencse:50,csomag:20,fajta:20,kihivas:40","négy változat, a kért plafonokkal (50 / 20 / 20 / 40)",c.valt);
  ok(c.spec.length>=6&&c.specKesz&&c.min1&&c.kontraMas&&c.rez,"saját speciálok (mind él, van átlagos szinten is, a kontra MÁSIK területet üt) és rezonancia",c.spec);
  ok(Math.abs(c.szer-50)<1e-9&&Math.abs(c.szerP-0.5)<1e-9,"a szerencse-esély plafonja 50%",c.szer);
  ok(Math.abs(c.csom-20)<1e-9,"a csomag-kedvezmény plafonja 20%",c.csom);
  ok(Math.abs(c.kih-40)<1e-9,"a kihívás-esély plafonja +40%",c.kih);
  ok(Math.abs(c.fajtaY-20)<1e-9&&c.fajtaA>0&&c.fajtaA<20&&c.fajtaP===0,"a fajta-kedvezmény fajtánként külön gyűlik, fajtánként 20%-os plafonnal",{youth:c.fajtaY,attr:c.fajtaA,plain:c.fajtaP});
  ok(Math.abs(c.egy-5)<1e-9,"egy átlagos Tiszta fajta-lap 4 × 1,25 = 5%",c.egy);
  ok(c.nincs===0&&c.rossz===0,"2000 generált Boost-lap: mindegyik fajta-lapnak van célpontja, és egyik szövegében sincs NaN/undefined",{nincs:c.nincs,rossz:c.rossz});
  ok(c.skillNincs&&c.equalNincs,"a fajta-lap nem céloz olyan fajtát, ami ebben a karrierben nem létezik (skill laza módban, egyenlítő képesség nélkül)",c.fajtak);

  /* ---- 4. AZ ÁRAK ---- */
  const a=await p.evaluate(()=>{
    const ki={};
    S.tal=null;_talAlapMemo=null;S.chFreeBoost={};S.boostTokens=0;
    const ar0=TAL_BOOST_FAJTAK.reduce((o,k)=>{o[k]=boostPriceOf(k);return o;},{});
    const u0=boostUnitPrice();
    _pakli(Array.from({length:10},()=>_lap("boost","csomag",4,1)));
    ki.uArany=boostUnitPrice()/u0;
    _pakli(Array.from({length:10},()=>_lap("boost","fajta",4,1,null,{bf:"bond"})));
    const ar1=TAL_BOOST_FAJTAK.reduce((o,k)=>{o[k]=boostPriceOf(k);return o;},{});
    ki.bond=ar1.bond/ar0.bond;
    ki.tobbi=TAL_BOOST_FAJTAK.filter(k=>k!=="bond").every(k=>ar1[k]===ar0[k]);
    /* az egyenlítő a boostPriceOf-on át követi */
    window.eqLevel=()=>1;S.eqBoostsUsed=0;
    S.tal=null;_talAlapMemo=null;const eq0=eqPrice();
    _pakli(Array.from({length:10},()=>_lap("boost","fajta",4,1,null,{bf:"equal"})));
    ki.eq=eqPrice()/eq0;
    S.chFreeBoost={equal:1};ki.eqIngyen=eqPrice();S.chFreeBoost={};
    return ki;});
  console.log("\n— 4. AZ ÁRAK —");
  ok(Math.abs(a.uArany-0.8)<0.02,"a csomag-kedvezmény (20%) az egység árát — vele mind a nyolc fajtát — 20%-kal viszi le",a.uArany);
  ok(Math.abs(a.bond-0.8)<0.03&&a.tobbi,"a fajta-kedvezmény csak a saját fajtáját vágja (a többi ára bitre ugyanaz)",{bond:a.bond,tobbi:a.tobbi});
  ok(Math.abs(a.eq-0.8)<0.03&&a.eqIngyen===0,"az egyenlítő is követi; zsetonnál továbbra is 0",{eq:a.eq,ingyen:a.eqIngyen});

  /* ---- 5. A KIHÍVÁS-ESÉLY ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    const pool=[];const r0=pick;
    window.pick=x=>{pool.push(...x);return x[0];};
    S.tal=null;_talAlapMemo=null;genReward("short","medium",challengeContext());
    window.pick=r0;
    ki.alap=chRewardBoostShare(pool);
    const meres=()=>{let b=0;const N=40000;for(let i=0;i<N;i++)if(CH_BOOST_REW[chRewardPick(pool).kind])b++;return b/N;};
    ki.m0=meres();
    _pakli(Array.from({length:10},()=>_lap("boost","kihivas",4,1)));
    ki.t=talBoostKihivasP();
    ki.m1=meres();
    return ki;});
  console.log("\n— 5. A BOOST-JUTALOM ESÉLYE —");
  ok(Math.abs(k.m0-k.alap)<0.01,"talizmán nélkül a boost-jutalmak aránya a kalapbeli arány",{alap:k.alap,mert:k.m0});
  ok(Math.abs(k.t-0.4)<1e-9&&Math.abs(k.m1-k.alap*1.4)<0.012,"+40%-nál a boost-jutalom esélye pontosan ×1,4",{vart:k.alap*1.4,mert:k.m1});

  /* ---- 6. A SZERENCSE-BOOST ---- */
  const s=await p.evaluate(()=>{
    const ki={};
    let ossz=0,max=0,tul=0,dobas=0;
    for(let sz=1;sz<=400;sz++){
      _pakli(Array.from({length:10},()=>_lap("boost","szerencse",4,1)));
      talState().seed=1000+sz;
      S.seasonNumber=sz;S.chFreeBoost={};
      let db=0;
      for(let r=1;r<=30;r++){S.idx=r;db+=talBoostSzerencseTick();}
      const B=talBoostSzAll();dobas+=B.done;
      ossz+=db;max=Math.max(max,db);if(db>2)tul++;
      const zs=Object.values(S.chFreeBoost).reduce((x,y)=>x+y,0);
      if(zs!==db)tul++;}
    ki.atlag=ossz/400;ki.max=max;ki.tul=tul;ki.dobas=dobas/400;
    /* a visszatöltés nem dob újra */
    _pakli(Array.from({length:10},()=>_lap("boost","szerencse",4,1)));
    S.seasonNumber=7;S.chFreeBoost={};S.idx=30;talBoostSzerencseTick();
    const elso=JSON.stringify(S.chFreeBoost);
    const T=JSON.parse(JSON.stringify(S.tal));
    S.chFreeBoost={};S.tal=T;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;
    const masod=talBoostSzerencseTick();
    ki.ujraNincs=masod===0&&Object.keys(S.chFreeBoost).length===0;
    /* ugyanaz a seed ugyanazt dobja */
    S.tal.bsz=null;S.chFreeBoost={};talBoostSzerencseTick();
    ki.seedelt=JSON.stringify(S.chFreeBoost)===elso;
    /* esély nélkül csak lefut, nem nyer */
    _pakli([_lap("bank","bevetel",2,0.5)]);S.chFreeBoost={};
    S.idx=30;ki.nulla=talBoostSzerencseTick();
    /* a nyeremény elsüthető fajtára esik; a rezonancia a legnagyobb fajta-kedvezményre */
    const rnd=talRng("p");let rossz=0;
    _pakli([_lap("boost","szerencse",4,1)]);
    for(let i=0;i<300;i++){const f=talBoostSzerencseFajta(rnd);if(!boostKindReady(f))rossz++;}
    ki.keszRossz=rossz;
    _pakli(Array.from({length:5},(x,i)=>_lap("boost","fajta",2,0.5,null,{bf:"attr"})).concat([_lap("boost","fajta",1,0.5,null,{bf:"pot"})]));
    ki.rezon=talRez("boost");
    const fs=[];for(let i=0;i<20;i++)fs.push(talBoostSzerencseFajta(rnd));
    ki.rezFajta=[...new Set(fs)];
    ki.potPct=talBoostFajtaPct("pot");ki.attrPct=talBoostFajtaPct("attr");
    S.seasonNumber=4;S.idx=0;S.chFreeBoost={};
    return ki;});
  console.log("\n— 6. A SZERENCSE-BOOST —");
  ok(Math.abs(s.dobas-2)<1e-9,"idényenként pontosan két dobás",s.dobas);
  ok(s.max<=2&&s.tul===0,"idényenként legfeljebb 2 ingyen boost, és mindegyik ingyen-zsetonként érkezik",{max:s.max,hibas:s.tul});
  ok(Math.abs(s.atlag-1.0)<0.12,"50%-os dobásokkal idényenként átlag ~1 ingyen boost (400 idény)",s.atlag);
  ok(s.ujraNincs&&s.seedelt,"a visszatöltés nem dob újra, és ugyanaz a seed ugyanazt adja",{ujra:s.ujraNincs,seed:s.seedelt});
  ok(s.nulla===0,"szerencse-talizmán nélkül nincs nyeremény",s.nulla);
  ok(s.keszRossz===0,"a nyeremény mindig ÉPP ELSÜTHETŐ fajtára esik",s.keszRossz);
  ok(s.rezon&&s.rezFajta.length===1&&s.rezFajta[0]==="attr"&&s.attrPct>s.potPct&&s.potPct>0,"a ⚡ rezonancia (Célzott szerencse) a legnagyobb fajta-kedvezményre teszi",{fajta:s.rezFajta,attr:s.attrPct,pot:s.potPct});

  /* ---- 7. A SPECIÁLOK ---- */
  const sp=await p.evaluate(()=>{
    const ki={};
    S.chFreeBoost={};S.boostTokens=0;S.transferBudget=1e12;S.boostDiscount=0;
    /* Törzsvásárló (átlagos: −20%) és Mennyiségi kedvezmény (legendás: −15%) */
    S.tal=null;_talAlapMemo=null;_talSpecMemo=null;
    const alap=boostPriceOf("plain");
    _pakli([_lap("boost","csomag",1,0.5,"torzsvasarlo"),_lap("boost","szerencse",4,0.5,"mennyisegi")]);
    /* a csomag-lap is hat — a sorrend-szorzót külön mérjük */
    ki.sor=[];
    for(let i=0;i<4;i++){ki.sor.push(Math.round(talBoostSorMult()*1000)/1000);budgetPay(boostPriceOf("plain"),"boost","X");}
    ki.szamlalo=talBoostSzDb();
    S.seasonNumber=5;ki.ujIdeny=talBoostSorMult();S.seasonNumber=4;
    budgetPay(0,"boost","X");ki.nullaNemSzamit=talBoostSzDb()===4;
    ki.tag=boostTalTag("plain");
    /* hatás-szorzók */
    _pakli([_lap("boost","csomag",1,0.5,"erocsomag"),_lap("boost","csomag",2,0.5,"celzott"),_lap("boost","csomag",3,0.5,"csodaszer")]);
    ki.hatas=[talBoostHatasMult("plain"),talBoostHatasMult("attr"),talBoostHatasMult("youth"),talBoostHatasMult("old"),talBoostHatasMult("bond")];
    const r0=Math.random;Math.random=()=>0.5;
    const e={startRating:80,pot:5000};
    const pl1=plainBoostPlan(e);S.tal=null;_talAlapMemo=null;_talSpecMemo=null;const pl0=plainBoostPlan(e);
    Math.random=r0;
    ki.plain={vel:pl1,nelkul:pl0};
    /* Zsetongyűjtő: Math.random < v/100 → dupla */
    _pakli([_lap("boost","csomag",2,0.5,"zsetongyujto")]);
    Math.random=()=>0.01;S.chFreeBoost={};
    applyChallengeReward({kind:"freeBoost",boost:"bond"});
    applyChallengeReward({kind:"boostToken"});
    ki.zseton=[S.chFreeBoost.bond,S.boostTokens];
    Math.random=()=>0.99;S.chFreeBoost={};S.boostTokens=0;
    applyChallengeReward({kind:"freeBoost",boost:"bond"});
    ki.zsetonNem=S.chFreeBoost.bond;
    Math.random=r0;S.chFreeBoost={};S.boostTokens=0;
    /* Árfigyelő: a sáv +v pp */
    _pakli([_lap("boost","csomag",1,0.5,"arfigyelo")]);
    Math.random=()=>0;ki.arf=chBoostDiscPct();Math.random=()=>0.999999;ki.arfMax=chBoostDiscPct();Math.random=r0;
    /* kontrák */
    S.tal=null;_talAlapMemo=null;_talSpecMemo=null;
    const k0={ar:talSpecArMult(null),dev:talSpecDevMult(),tan:talSpecTanulMult(80),kret:talSzezonkeretMult(),
      mor:talMoralCelMinusz(),stab:talSpecStabMult(),sp:talSpKontraMult()};
    _pakli([_lap("boost","csomag",1,0.5,"torzsvasarlo"),_lap("boost","csomag",1,0.5,"erocsomag"),_lap("boost","csomag",1,0.5,"arfigyelo"),
      _lap("boost","csomag",2,0.5,"celzott"),_lap("boost","csomag",2,0.5,"zsetongyujto"),_lap("boost","csomag",3,0.5,"csodaszer"),
      _lap("boost","csomag",4,0.5,"mennyisegi")]);
    const k1={ar:talSpecArMult(null),dev:talSpecDevMult(),tan:talSpecTanulMult(80),kret:talSzezonkeretMult(),
      mor:talMoralCelMinusz(),stab:talSpecStabMult(),sp:talSpKontraMult()};
    ki.kontra={k0,k1};
    return ki;});
  console.log("\n— 7. A SPECIÁLOK —");
  ok(sp.sor[0]===0.8&&sp.sor[1]===1&&sp.sor[2]===0.85&&sp.sor[3]===0.85,"Törzsvásárló: az idény első fizetős boostja −20%; Mennyiségi kedvezmény (legendás): a harmadiktól −15%",sp.sor);
  ok(sp.szamlalo===4&&sp.ujIdeny===0.8&&sp.nullaNemSzamit,"a számláló a budgetPay boost-kapuján nő, idényenként nullázódik, a 0 Ft-os (zsetonos) boost nem számít",{db:sp.szamlalo,uj:sp.ujIdeny});
  ok(/Mennyiségi kedvezmény/.test(sp.tag),"a Boost-központ sora kiírja az élő sorrend-kedvezményt",sp.tag);
  ok(sp.hatas[0]===1.1&&Math.abs(sp.hatas[1]-1.15)<1e-9&&Math.abs(sp.hatas[2]-1.08)<1e-9&&sp.hatas[2]===sp.hatas[3]&&sp.hatas[4]===1,
     "hatás-szorzók: Erőcsomag a sima, Célzott tréning az attribútum, Csodaszer az ifi- és az öreg-boostra (a többire semmi)",sp.hatas);
  ok(sp.plain.vel.r>=sp.plain.nelkul.r&&sp.plain.vel.t>sp.plain.nelkul.t,"az Erőcsomag a sima boost tervét valóban megemeli",sp.plain);
  ok(sp.zseton[0]===2&&sp.zseton[1]===2&&sp.zsetonNem===1,"Zsetongyűjtő: találatnál az ingyen boost és a token is duplán jön, különben egyszer",{dupla:sp.zseton,nem:sp.zsetonNem});
  ok(sp.arf===14&&sp.arfMax===49,"Árfigyelő: a kihívás-jutalom sávja +4 pp (10–45 → 14–49)",{min:sp.arf,max:sp.arfMax});
  {const a=sp.kontra.k0,b=sp.kontra.k1;
   ok(b.ar>a.ar&&b.dev<a.dev&&b.tan<a.tan&&b.kret<a.kret&&b.mor>a.mor&&b.stab<a.stab&&b.sp<a.sp,
     "mind a hét kontra a saját (MÁSIK) területén hat: vételár, fejlődés, begyakorlás, szezonkeret, morál-cél, stábhatás, stíluspont",sp.kontra);}

  /* ---- 8. A FELÜLET ---- */
  const f=await p.evaluate(()=>{
    const ki={};
    _pakli([_lap("boost","szerencse",3,0.7),_lap("boost","fajta",2,0.5,"torzsvasarlo",{bf:"attr"}),_lap("boost","csomag",1,0.5),_lap("boost","kihivas",1,0.5)]);
    S.idx=0;
    const h=talLapHtml(talState().lapok[1]);
    ki.lap=/attribútum-boost ára −/.test(h.replace(/<[^>]+>/g,""))&&!/NaN|undefined/.test(h);
    talMenuOpen();
    const box=($("talHatas")&&$("talHatas").innerText)||"";
    ki.menu=/Attribútum boost ára/.test(box)&&/Szerencse-boost idén/.test(box)&&/boost-csomag alapára/.test(box)&&/kihívások esélye/.test(box);
    ki.menuSzoveg=box.slice(0,400);
    ki.ossz=/Fajta-kedvezmény — az attribútum-boost/.test(talOsszhatasHtml().replace(/<[^>]+>/g,""));
    talMenuClose();
    boostOpenPanel();
    const body=$("twBody").innerText||"",act=$("twActions").innerText||"";
    ki.panel=/talizmánból/.test(body)&&/fajta-kedvezmény/.test(act)&&/Törzsvásárló/.test(act);
    ki.panelSzoveg=act.slice(0,300);
    ki.sugo=/⚡ BOOST talizmán/.test(GLOSSARY.talizman.text)&&/tizenegy szín/.test(GLOSSARY.talizman.text)
      &&GLOSSARY.talizman.text.indexOf("mind a "+TAL_SPEC.length+" él")>=0;
    return ki;});
  console.log("\n— 8. A FELÜLET —");
  ok(f.lap,"a fajta-lap kiírja, melyik fajtára szól");
  ok(f.menu,"a Talizmánok menü aktív hatásai: fajtánkénti kedvezmény, csomag, kihívás-esély, az idei szerencse-dobások",f.menuSzoveg);
  ok(f.ossz,"az összhatás-panel a fajta-kedvezményt is listázza");
  ok(f.panel,"a Boost-központ kiírja a talizmán-kedvezményeket (csomag a fejlécben, fajta és sorrend a sorban)",f.panelSzoveg);
  ok(f.sugo,"a súgó a tizenegy színről és a Boost talizmánról szól, a speciálok száma stimmel");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
