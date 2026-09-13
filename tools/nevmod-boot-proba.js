/* 🧨 A NÉVMÓD NEM TÖRHETI EL A BETÖLTÉST (3.9.66)

   BEJELENTETT HIBA: „ha beállítjuk, hogy ne legyen jogtiszta verzió (profil
   ablak alján a kulcsszó), akkor befagy a játék. Nem működik onnantól kezdve
   az app."

   MI TÖRTÉNT. A `careerPool` modul-szintű `let`, és a fájlban jóval LEJJEBB
   áll, mint a natOfName. Egy `let` a deklarációja előtt temporal dead
   zone-ban van, ahol a `typeof` is DOB — a natOfName védőfeltétele tehát
   pontosan azt a hibát nem fogta meg, amire íródott. A 3.9.61 filozófus-edző
   generátora MODUL-SZINTEN hívja a shortName()-et: magyarított módban a név a
   táblából jön és a hívás sosem jut idáig, VALÓS NEVEKRE viszont lefut, dob,
   és attól a ponttól a fájl hátralévő HATEZER SORA nem fut le. A játék nem
   „hibázik", hanem félig felépülve megáll — és mivel a névmód a
   localStorage-ban marad, újratöltés után is.

   EZÉRT EZ A PRÓBA NEM A NÉVMÓDOT MÉRI, HANEM A BETÖLTÉST: mindkét módban
   felhúzza az oldalt, és megnézi, hogy (1) nincs oldalhiba, és (2) a fájl
   VÉGÉN álló függvények is léteznek — ez az egyetlen jel, ami elárulja, hogy
   a script tényleg végigfutott. Egy „nincs hiba" önmagában nem elég: a TDZ
   csendben vágja el a maradékot.

   Használat: node tools/nevmod-boot-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

/* A fájl VÉGÉN definiált dolgok — ha ezek megvannak, a script végigfutott. */
const VEGE=["gameBackStep","pwaShowManual","xferNewCode","renderStoreModal",
            "enterCareerSetup","openSaveImportFlow"];

(async()=>{
  const srv=spawn('python3',['-m','http.server','8929'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  /* Egy teljes betöltés a megadott névmóddal. */
  const boot=async(mod)=>{
    const ctx=await b.newContext();
    const p=await ctx.newPage();
    const oldal=[];
    p.on('pageerror',e=>oldal.push(String(e.message).slice(0,120)));
    p.on('console',m=>{if(m.type()==='error')oldal.push(m.text().slice(0,120));});
    if(mod!==null)await p.addInitScript(([k,v])=>{try{localStorage.setItem(k,v);}catch(e){}},
      ["harminc_nulla_hunevek_v1",mod]);
    await p.goto('http://localhost:8929/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    let r={};
    try{
      r=await p.evaluate((vege)=>({
        ver:(typeof APP_VERSION!=="undefined")?APP_VERSION:null,
        hu:(typeof huNamesOn==="function")?huNamesOn():null,
        hianyzo:vege.filter(f=>typeof window[f]!=="function"),
        /* a hét edző rövid alakja — ez futott bele a hibába */
        edzok:(typeof STYLE_COACHES!=="undefined")
          ? Object.keys(STYLE_COACHES).map(k=>shortName(STYLE_COACHES[k].name)) : null,
        /* a generált képességek tényleg felépültek-e */
        fa:(typeof STYLE_TRAITS!=="undefined")
          ? Object.keys(STYLE_TRAITS).map(k=>(STYLE_TRAITS[k]||[]).length).join("/") : null,
        /* és a natOfName ismeretlen névre sem dob */
        nat:(()=>{try{natOfName("Nincs Ilyen Ember");return "ok";}catch(e){return String(e.message);}})(),
        kep:[...document.querySelectorAll('[id^="sc"]')].filter(e=>e.offsetParent).map(e=>e.id)
      }),VEGE);
    }catch(e){r={hiba:"az oldal nem válaszol: "+e.message};}
    r.oldal=oldal;
    await ctx.close();
    return r;};

  const magyar=await boot("be");
  const valos=await boot("ki");
  const alap=await boot(null);

  console.log("=== magyarított nevek (alapértelmezés) ===");
  ok("betölt, oldalhiba nélkül",magyar.oldal.length===0,magyar.oldal);
  ok("és a fájl VÉGÉN álló függvények is megvannak",
     magyar.hianyzo&&magyar.hianyzo.length===0,magyar.hianyzo);

  console.log("\n=== valós nevek (a bejelentett eset) ===");
  ok("betölt, oldalhiba nélkül",valos.oldal.length===0,valos.oldal);
  ok("A FÁJL VÉGIGFUT — a hátsó függvények is léteznek",
     valos.hianyzo&&valos.hianyzo.length===0,valos.hianyzo);
  ok("a névmód tényleg át is állt",valos.hu===false&&magyar.hu===true,
     {magyar:magyar.hu,valos:valos.hu});
  ok("a hét filozófus-edző fája mindkét módban ugyanúgy felépül",
     valos.fa===magyar.fa&&/\d/.test(String(valos.fa)),{magyar:magyar.fa,valos:valos.fa});
  ok("az edzők rövid neve mindkét módban értelmes (nem keresztnév)",
     Array.isArray(valos.edzok)&&valos.edzok.length===7
     &&valos.edzok.indexOf("János")<0&&valos.edzok.indexOf("Pál")<0
     &&valos.edzok.indexOf("Béla")<0&&valos.edzok.indexOf("József")<0,
     {magyar:magyar.edzok,valos:valos.edzok});
  ok("a natOfName ismeretlen névre sem dob (a TDZ elkapva)",
     valos.nat==="ok"&&magyar.nat==="ok",{magyar:magyar.nat,valos:valos.nat});

  console.log("\n=== beállítás nélkül (friss készülék) ===");
  ok("az alapértelmezés a magyarított mód",alap.hu===true,alap.hu);
  ok("és ott sincs oldalhiba",alap.oldal.length===0,alap.oldal);
  ok("a kezdőképernyő mindhárom esetben ugyanaz",
     JSON.stringify(alap.kep)===JSON.stringify(valos.kep)
     &&JSON.stringify(alap.kep)===JSON.stringify(magyar.kep),
     {alap:alap.kep,valos:valos.kep,magyar:magyar.kep});

  /* ---- ÉS A VÁLTÁS MAGA: a kulcsszó beírása után is él az app ---- */
  console.log("\n=== a váltás pillanata ===");
  {
    const ctx=await b.newContext();
    const p=await ctx.newPage();
    const oldal=[];
    p.on('pageerror',e=>oldal.push(String(e.message).slice(0,120)));
    await p.goto('http://localhost:8929/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2200);
    const r=await p.evaluate(()=>{
      renderProfileModal("");
      const inp=document.getElementById("huNamePass");
      if(!inp)return {mezo:false};
      inp.value="szutykoskutyus";
      inp.dispatchEvent(new Event("input",{bubbles:true}));
      return {mezo:true,hu:huNamesOn(),
        vissza:!document.getElementById("huNameBack").classList.contains("hide")};});
    ok("a kulcsszó átvált valós nevekre, és megjelenik a visszaút gombja",
       r.mezo===true&&r.hu===false&&r.vissza===true,r);
    /* ÚJRATÖLTÉS — ez az, ami eddig halott appot adott */
    await p.reload({waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    let ujra={};
    try{ujra=await p.evaluate((vege)=>({hu:huNamesOn(),
      hianyzo:vege.filter(f=>typeof window[f]!=="function")}),VEGE);}
    catch(e){ujra={hiba:e.message};}
    ok("és ÚJRATÖLTÉS után is teljes értékű az app",
       ujra.hu===false&&ujra.hianyzo&&ujra.hianyzo.length===0&&oldal.length===0,
       {ujra,oldal});
    await ctx.close();
  }

  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
