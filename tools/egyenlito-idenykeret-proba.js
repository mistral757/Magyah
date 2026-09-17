/* ⚖️ AZ EGYENLÍTŐ ALAPÁRAS KERETE IDÉNYENKÉNT TÖLTŐDIK (3.9.91).

   BEJELENTETT HIBA (tesztelőtől): „Úgy tűnik a béke és harmónia féle boost ára
   nem nullázódik szezonról szezonra. A szezon előtt már dupla áru volt, és a
   szezon kezdetén is ugyanúgy az maradt."

   AZ OK. Az `S.eqBoostsUsed` CSAK nőtt (minden vásárlásnál +1), a mentés vitte
   — és SEHOL nem nullázódott. A szintenkénti 5/4/3 alapáras darab tehát nem
   idényes keret volt, hanem EGY EGÉSZ KARRIERRE szóló; utána az ár
   duplázódott (×2, ×4, ×8…). Egy hosszú karrierben ez a Béke és harmónia fő
   eszközét ellehetetlenítette.

   A TÖLTÉS HELYE A NYÁR NYÍLÁSA (twRefillSummerQuotas), nem a szezon
   indulása — ugyanazért, amiért a nyári átigazolási keretek töltése is oda
   került: a boost-központ NYÁRI szerszám, és egy szezonkezdetkor érkező keret
   pont a legfontosabb ablakot hagyná ki.

   Amit mér:
     1. a keret szintenként 5/4/3, és a szorzó utána duplázódik (a régi,
        idényen BELÜLI viselkedés változatlan);
     2. a nyár nyílása NULLÁZ — a szorzó visszaáll 1-re;
     3. a nyári keretek töltésével EGYÜTT megy, egy hívásban;
     4. a mentés viszi a számlálót és az egyszeri pótlás jelzőjét;
     5. az EGYSZERI PÓTLÁS: a régi mentés (jelző nélkül) egyszer visszakapja a
        keretét, egy mai mentést viszont nem nyúl meg;
     6. és hogy a felület MINDEN ára-sora kimondja: idényenként. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9033'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9033/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof eqPriceMult==="function"
    &&typeof twRefillSummerQuotas==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    /* Az Egyenlítő szintjét a filozófia-fán át állítjuk — az eqLevel ezen olvas. */
    const szint=(lv)=>{S.style={key:"harmonia",traits:lv?{egyenlito:lv}:{}};S.style2=null;};

    /* ---- 1. AZ IDÉNYEN BELÜLI LÉTRA (a régi viselkedés) ---- */
    ki.keret=EQ_FREE.slice();
    ki.letra={};
    [1,2,3].forEach(lv=>{
      szint(lv);
      const sor=[];
      for(let n=0;n<EQ_FREE[lv-1]+4;n++){
        S.eqBoostsUsed=n;
        sor.push({n,mult:eqPriceMult(),marad:eqFreeLeft()});}
      ki.letra[lv]=sor;});

    /* ---- 2-3. A NYÁR NYÍLÁSA NULLÁZ ---- */
    szint(2);
    S.eqBoostsUsed=7;
    S.twEventUsed=9;S.clubScoutSpinsUsed=9;S.seasonNumber=4;
    const elotte={used:eqUsed(),mult:eqPriceMult(),marad:eqFreeLeft()};
    twRefillSummerQuotas();
    ki.nyar={elotte,utana:{used:eqUsed(),mult:eqPriceMult(),marad:eqFreeLeft()},
      /* a nyári keretek is töltődtek — egy hívás, egy pillanat */
      twEvent:S.twEventUsed,scout:S.clubScoutSpinsUsed,
      stempli:S.summerQuotaSeason};

    /* ---- 4-5. A MENTÉS ÉS AZ EGYSZERI PÓTLÁS ---- */
    /* A pótlás a betöltés útján fut. A stub UGYANAZT a két lépést járja, mint
       a loadGame: előbb a bulk visszatöltés (Object.assign(S,d.S)), utána a
       jelző-vizsgálat. Hogy a stub ne csúszhasson el a valóditól, a próba a
       FORRÁSSORT is ellenőrzi (lásd `potlasSor`). */
    const potlas=(mentes)=>{
      const S2=Object.assign({},mentes);
      if(!mentes.eqSeasonMig){S2.eqBoostsUsed=0;S2.eqSeasonMig=1;}
      return S2;};
    ki.regiMentes=potlas({eqBoostsUsed:9});                 /* 3.9.91 előtti */
    ki.ujMentes=potlas({eqBoostsUsed:2,eqSeasonMig:1});     /* mai */

    /* a mentés tényleg viszi mindkét mezőt? */
    S.eqBoostsUsed=3;S.eqSeasonMig=1;
    let mentve=null;
    try{mentve=JSON.parse(JSON.stringify(buildSaveObject?buildSaveObject():{}));}catch(e){}
    ki.mentesMezok=(()=>{
      try{
        const src=document.documentElement.innerHTML;
        return /eqBoostsUsed:S\.eqBoostsUsed,eqSeasonMig:S\.eqSeasonMig/.test(src);
      }catch(e){return null;}})();
    /* A VALÓDI pótlás-sor a betöltésben — a stub ezt tükrözi. */
    ki.potlasSor=(()=>{
      try{
        const src=document.documentElement.innerHTML;
        return /if\(!d\.S\.eqSeasonMig\)\{S\.eqBoostsUsed=0;S\.eqSeasonMig=1;\}/.test(src);
      }catch(e){return null;}})();

    /* ---- 6. A FELÜLET SZÖVEGEI ---- */
    szint(2);S.eqBoostsUsed=0;
    const def=STYLE_TRAITS.find?null:null;
    ki.szovegek=(()=>{
      const src=document.documentElement.innerHTML;
      return {
        kepesseg:/megy ALAPÁRON <b>idényenként<\/b>/.test(src),
        katalogus:/még \$\{eqFreeLeft\(\)\} alapáron ebben az idényben/.test(src),
        megerosito:/egyenlítőd ebben az idényben, alapáron/.test(src),
        elfogyott:/az idény alapáras darabjai elfogytak/i.test(src),
        mero:/egyenlítő ebben az idényben/.test(src)};})();
    return ki;});

  console.log("=== 1. az idényen belüli létra (a régi viselkedés) ===");
  console.log("  keret szintenként: "+t.keret.join(" / "));
  [1,2,3].forEach(lv=>{
    const sor=t.letra[lv],free=t.keret[lv-1];
    const alapar=sor.filter(x=>x.n<free).every(x=>x.mult===1);
    const duplaz=sor.filter(x=>x.n>=free)
      .every((x,i)=>x.mult===Math.pow(2,i+1));
    ok(alapar&&duplaz,
       `${lv}. szint: ${free} db alapáron, utána ×2 ×4 ×8…`,
       sor.map(x=>x.mult));});

  console.log("=== 2. a nyár nyílása nulláz ===");
  console.log(`  előtte: ${t.nyar.elotte.used} elment · ×${t.nyar.elotte.mult}`);
  console.log(`  utána:  ${t.nyar.utana.used} elment · ×${t.nyar.utana.mult} · még ${t.nyar.utana.marad} alapáron`);
  ok(t.nyar.elotte.mult>1,"a nyár előtt tényleg drágább volt",t.nyar.elotte);
  ok(t.nyar.utana.used===0&&t.nyar.utana.mult===1,
     "a nyár nyílásakor a számláló nullázódik, az ár visszaáll alapárra",t.nyar.utana);
  ok(t.nyar.utana.marad===t.keret[1],"a teljes idényes keret visszajár",t.nyar.utana.marad);

  console.log("=== 3. a nyári keretekkel EGYÜTT megy ===");
  ok(t.nyar.twEvent===0&&t.nyar.scout===0&&t.nyar.stempli===4,
     "egy hívás tölti a nyári eseményt, a klub-szemlét és az egyenlítőt is",
     {twEvent:t.nyar.twEvent,scout:t.nyar.scout,stempli:t.nyar.stempli});

  console.log("=== 4-5. a mentés és az egyszeri pótlás ===");
  ok(t.mentesMezok===true,"a mentés viszi a számlálót ÉS a pótlás jelzőjét");
  ok(t.potlasSor===true,"a betöltésben ott áll a pótlás sora — a stub ezt tükrözi");
  ok(t.regiMentes.eqBoostsUsed===0&&t.regiMentes.eqSeasonMig===1,
     "régi mentés (jelző nélkül): a keret egyszer visszajár",t.regiMentes);
  ok(t.ujMentes.eqBoostsUsed===2&&t.ujMentes.eqSeasonMig===1,
     "mai mentés: a pótlás NEM nyúl hozzá",t.ujMentes);

  console.log("=== 6. minden ára-sor kimondja, hogy idényenként ===");
  ok(t.szovegek.kepesseg,"a képesség leírása");
  ok(t.szovegek.katalogus,"a boost-katalógus sora");
  ok(t.szovegek.megerosito,"a megerősítő ablak");
  ok(t.szovegek.elfogyott,"…és az „elfogytak” ág is");
  ok(t.szovegek.mero,"a képesség élő mérősora");

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
