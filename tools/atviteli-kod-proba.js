/* ☁ ÁTVITELI KÓD — a mentés másik eszközre, fiók nélkül (3.9.65)

   MIÉRT NEM E-MAILES FIÓK. A kért funkció az ÁTVITEL, nem a bejelentkezés. A
   fiók három dolgot hozna magával, amiből egyik sem az átvitel: személyes
   adatot, Play-kötelezettséget (alkalmazáson belüli fióktörlés + nyilvános
   törlés-kérő URL) és egy jelszó-folyamatot.

   A PRÓBA MAGJA: a felhő NEM KAP KÜLÖN JOGOT. A lehozott mentés pontosan
   ugyanabba a kérdező folyamatba fut, mint a fájlból visszatöltött
   (openSaveImportFlow) — a kód nem írhat felül semmit némán. Mellette a kód
   ábécéje (nincs félreolvasható karakter), a tömörítés oda-vissza, a
   méretplafon EGYEZÉSE a szabályfájllal, és a 24 órás lejárat, amit az
   adatbázis-szabály tart be, nem a kliens.

   Használat: node tools/atviteli-kod-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const fs=require('fs');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8920'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  /* ---- A SZABÁLYFÁJL: a kliens és a szerver ugyanazt a számot mondja-e ---- */
  const rules=JSON.parse(fs.readFileSync('/home/user/Magyah/tools/firebase-rules.json','utf8'));
  const xr=rules.rules.mp.xfer&&rules.rules.mp.xfer["$code"];

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8920/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(async()=>{
    const o={};
    /* ── 1. A KÓD ── */
    const kodok=[];for(let i=0;i<400;i++)kodok.push(xferNewCode());
    o.kod={
      hossz:XFER_LEN,
      mindJo:kodok.every(k=>k.length===XFER_LEN&&xferCodeValid(k)),
      egyedi:new Set(kodok).size,
      abc:XFER_ALPHABET,
      /* a félreolvasható karakterek KIMARADNAK */
      tiltott:["0","O","1","I","L"].filter(c=>XFER_ALPHABET.indexOf(c)>=0),
      szep:xferPretty("ABCD2345"),
      /* beírás: kisbetű, kötőjel, szóköz mind jó */
      norm:[xferNormalize("abcd-2345"),xferNormalize("ABCD 2345"),xferNormalize("aBcD2345")],
      /* a plafon: hosszabb beírásból is 8 lesz */
      vagas:xferNormalize("ABCD2345XYZ")};
    o.rossz={
      ures:xferCodeWhy(""),
      rovid:xferCodeWhy("ABC"),
      tiltottBetu:xferCodeWhy("ABCD234O"),
      jo:xferCodeWhy("ABCD2345")};

    /* ── 2. A CSOMAG: oda-vissza ── */
    const minta=JSON.stringify({magyah:"x",tomb:Array.from({length:4000},(_,i)=>({i,n:"Teszt Név "+i,v:i*1.37}))});
    const pk=await xferPack(minta);
    const vissza=await xferUnpack(pk);
    o.csomag={
      tomoritve:pk.z===1,
      nyers:minta.length,
      csomagolt:pk.d.length,
      arany:Math.round(pk.d.length/minta.length*100)/100,
      azonos:vissza===minta,
      /* tömörítés nélküli ág is megáll a lábán */
      nyersAg:await (async()=>{const q={z:0,d:minta};return (await xferUnpack(q))===minta;})()};

    /* ── 3. A HÁLÓZAT NÉLKÜLI ÁG: kimondja, mi a baj ── */
    const eredetiInit=window.mpNetInit;
    window.mpNetInit=async()=>"local";
    o.halozatNelkul=await xferDownload("ABCD2345");
    window.mpNetInit=eredetiInit;

    /* ── 4. FELTÖLTÉS ÉS LEHOZATAL (utánzott adatbázissal) ── */
    const felho={};
    let torolve=null;
    window.mpNetInit=async()=>"fb";
    const F={
      ref:(db,path)=>({path}),
      set:async(r,v)=>{felho[r.path]=JSON.parse(JSON.stringify(v));felho[r.path].at=Date.now();},
      get:async(r)=>({exists:()=>!!felho[r.path],val:()=>felho[r.path]}),
      remove:async(r)=>{torolve=r.path;delete felho[r.path];},
      serverTimestamp:()=>Date.now()};
    mpNet.db={};mpNet.fns=F;
    /* egy valódi mentés-kulcs alá teszünk egy apró, de ÉRVÉNYES mentést */
    const kulcs=spSaveKeyFor(1);
    const mentes={teamName:"Próba FC",gameMode:"career",phase:"hub",
      S:{seasonNumber:7,idx:12},v:APP_VERSION};
    localStorage.setItem(kulcs,JSON.stringify(mentes));
    const up=await xferUpload(kulcs);
    o.fel={ok:up.ok,kodJo:up.ok&&xferCodeValid(up.kod),
      utak:Object.keys(felho),
      alatt:Object.keys(felho)[0]&&Object.keys(felho)[0].indexOf("mp/xfer/")===0};
    const le=await xferDownload(up.kod);
    o.le={ok:le.ok,miert:le.miert||null,
      csapat:le.ok&&le.env&&le.env.cimke&&le.env.cimke.team,
      szezon:le.ok&&le.env&&le.env.cimke&&le.env.cimke.season,
      kulcs:le.ok&&le.env&&le.env.kulcs===kulcs,
      /* a boríték a FÁJLOS formátum — ugyanaz a beolvasó fogadta el */
      jeloles:le.ok&&le.env&&le.env.magyah};
    /* kisbetűvel, kötőjellel is meg kell találnia */
    const le2=await xferDownload(xferPretty(up.kod).toLowerCase());
    o.le2=le2.ok;
    /* nem létező kód */
    const le3=await xferDownload("ZZZZ9999");
    o.nincs={ok:le3.ok,miert:le3.miert};
    /* behozatal után a kliens takarít */
    await xferBurn(up.kod);
    o.takaritas={torolve,maradt:Object.keys(felho).length};
    localStorage.removeItem(kulcs);
    window.mpNetInit=eredetiInit;

    /* ── 5. A FELÜLET ── */
    o.felulet={
      gomb:!!document.getElementById("storeXferBtn"),
      /* a lehozott mentés a FÁJLOS kérdező folyamatba fut */
      folyamat:typeof openSaveImportFlow==="function"};
    /* a doboz tényleg kiírja a kódot és a lejáratot */
    xferAskCode();
    o.kerdez={
      cim:document.getElementById("saveImpTitle").textContent,
      mezo:!!document.getElementById("xferIn"),
      mondja24:/24 ór/.test(document.getElementById("saveImpBody").textContent)};
    document.getElementById("saveImpModal").classList.add("hide");
    o.plafon=XFER_MAX_CHARS;
    o.ttl=XFER_TTL_MS;
    return o;});

  console.log("=== a kód ===");
  ok("8 karakter, mind érvényes, és gyakorlatilag sosem ismétlődik",
     r.kod.hossz===8&&r.kod.mindJo===true&&r.kod.egyedi>=398,r.kod);
  ok("a félreolvasható karakterek (0 O 1 I L) KIMARADNAK az ábécéből",
     r.kod.tiltott.length===0,r.kod.tiltott);
  ok("kiírva kötőjellel, beírva kötőjel/szóköz/kisbetű mind jó",
     r.kod.szep==="ABCD-2345"&&r.kod.norm.every(x=>x==="ABCD2345"),r.kod);
  ok("a túl hosszú beírás 8-ra vágódik",r.kod.vagas==="ABCD2345",r.kod.vagas);
  ok("és minden elutasítás MEGMONDJA, mi a baj",
     /Írd be/.test(r.rossz.ures)&&/8 karakter/.test(r.rossz.rovid)
     &&/nem szerepelhet/.test(r.rossz.tiltottBetu)&&r.rossz.jo==="",r.rossz);

  console.log("\n=== a csomag ===");
  ok("gzippel megy fel, és a kicsomagolás BITRE ugyanaz",
     r.csomag.tomoritve===true&&r.csomag.azonos===true,r.csomag);
  ok("és tényleg kisebb lesz (base64 után is)",r.csomag.arany<0.5,
     {nyers:r.csomag.nyers,csomagolt:r.csomag.csomagolt,arany:r.csomag.arany});
  ok("a tömörítés nélküli ág is működik (régi böngésző)",r.csomag.nyersAg===true);

  console.log("\n=== a szabályfájl és a kliens EGYÜTT mozdul ===");
  ok("az xfer ág benne van a közzéteendő szabályfájlban",!!xr,Object.keys(rules.rules.mp));
  ok("a méretplafon UGYANAZ a két oldalon",
     !!xr&&xr.d[".validate"].indexOf(String(r.plafon))>=0,
     {kliens:r.plafon,szabaly:xr&&xr.d[".validate"]});
  ok("a 24 órás lejáratot a SZABÁLY tartja be (az olvasás is lejár)",
     !!xr&&xr[".read"].indexOf("86400000")>=0&&xr[".read"].indexOf("now -")>=0
     &&r.ttl===86400000,{read:xr&&xr[".read"],kliens:r.ttl});
  ok("a lejárt bejegyzés felülírható, a friss nem",
     !!xr&&xr[".write"].indexOf("86400000")>=0&&xr[".write"].indexOf("!data.exists()")>=0,
     xr&&xr[".write"]);
  ok("és idegen mezőt nem enged be",
     !!xr&&xr.$other&&xr.$other[".validate"]===false);

  console.log("\n=== feltöltés és lehozatal ===");
  ok("a feltöltés kódot ad, és az mp/xfer ág alá ír",
     r.fel.ok===true&&r.fel.kodJo===true&&r.fel.alatt===true,r.fel);
  ok("a lehozott csomagból a FÁJLOS boríték jön vissza, hiánytalanul",
     r.le.ok===true&&r.le.csapat==="Próba FC"&&r.le.szezon===7
     &&r.le.kulcs===true&&r.le.jeloles==="magyah-mentes",r.le);
  ok("kisbetűs, kötőjeles kóddal is megtalálja",r.le2===true);
  ok("nem létező kódra kimondja, hogy elgépelés vagy lejárat",
     r.nincs.ok===false&&/lejárt/.test(r.nincs.miert),r.nincs);
  ok("behozatal után a kliens törli a bejegyzést",
     r.takaritas.maradt===0&&/mp\/xfer\//.test(r.takaritas.torolve||""),r.takaritas);
  ok("hálózat nélkül nem némán bukik, hanem kimondja",
     r.halozatNelkul.ok===false&&/kapcsolat/.test(r.halozatNelkul.miert),r.halozatNelkul);

  console.log("\n=== a felület ===");
  ok("a Mentések és tárhely ablakban ott a behozatal gombja",r.felulet.gomb===true);
  ok("a beíró doboz kimondja a 24 órás lejáratot",
     r.kerdez.mezo===true&&r.kerdez.mondja24===true&&/kód/i.test(r.kerdez.cim),r.kerdez);
  ok("és a lehozott mentés a FÁJLOS kérdező folyamatba fut (nem ír felül némán)",
     r.felulet.folyamat===true);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
