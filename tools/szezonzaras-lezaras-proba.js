/* 🏆 A SZEZONZÁRÁS KAPUJA — nincs továbblépés, csak lezárás (3.9.58)

   KIMONDOTT KÉRÉS: „itt 3p után se lehessen továbblépni, csak az legyen
   bekapcsolva, hogy ha akarod itt 3p után lezárhatod a közös karriert azzal,
   hogy te nyertél, mert a másik játékos nem ért ide időben."

   MIÉRT KÜLÖN PRÓBA. A többi kapu kiútja LÁGY (a saját eredményemmel megyek
   tovább, a társad karrierje sértetlen), és ezek EGY közös rétegen
   (mpSoloArm/mpSoloOffer) osztoznak. A szezonzárásé most már NEM lágy: a te
   oldaladon LEZÁRJA a közös karriert. Egy ilyen kivételt könnyű elrontani a
   közös rétegen — a próba ezért mindkettőt méri: hogy a szezonzárás kapuja
   sosem lép magától, és hogy a TÖBBI kapu viselkedése nem változott.

   Használat: node tools/szezonzaras-lezaras-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8904'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8904/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── A KIÚT BEJELENTÉSE ── */
    mpSoloClear();
    let futott=0;
    const eredetiAsk=window.askConfirm;
    mpSoloArm("🏆 Lezárom a párharcot — én nyertem",()=>{futott++;},
              "final",false,null,"a párharc lezárását");
    o.kiut={cimke:_mpSoloOut.label,kapu:_mpSoloOut.gate,
            auto:_mpSoloOut.auto,ajanlat:_mpSoloOut.offer};

    /* ── SOSEM LÉP MAGÁTÓL: az auto-ág feltétele már a bejelentésnél elbukik ── */
    o.autoTilt=(_mpSoloOut.auto===false);

    /* ── A TÖBBI KAPU LÁGY MARADT ── */
    mpSoloClear();
    mpSoloArm("A társad nem jelentkezik — a saját döntésemmel megyek tovább",
              ()=>{},"gate:proba");
    o.lagyKapu={auto:_mpSoloOut.auto,ajanlat:_mpSoloOut.offer};

    /* ── A MEGERŐSÍTŐ PÁRBESZÉD ── */
    mpSoloClear();
    let kerdes=null;
    window.askConfirm=(x)=>{kerdes=x;};
    gameMode="career";
    MP.active=true;MP.activeRoom="TEST";MP.role="host";
    S.mpOrphan=false;S.mpForfeit=null;S.seasonNumber=3;
    mpFinalForfeitAsk(()=>{});
    window.askConfirm=eredetiAsk;
    o.kerdes=kerdes?{cim:kerdes.title,igen:kerdes.yes,nem:kerdes.no,
      vegleges:/végleges/i.test(kerdes.html),
      mondja_hogy_nyertel:/te nyered a párharcot/i.test(kerdes.html),
      mondja_hogy_veget_er:/közös karrier itt véget ér/i.test(kerdes.html)}:null;

    /* ── A TÉNYLEGES LEZÁRÁS ── */
    let tovabb=0;
    const elotte={orphan:S.mpOrphan,aktiv:h2hRoomActive()};
    /* a naplósorok ne omoljanak el a hiányzó DOM-on */
    try{mpFinalForfeitDo(()=>{tovabb++;});}catch(e){o.hiba=String(e);}
    o.lezaras={elotte,utana:{orphan:S.mpOrphan,aktiv:h2hRoomActive()},
      tovabb,forfeit:S.mpForfeit?{season:S.mpForfeit.season,van:true}:null};

    /* ── A KAPU TÖBBÉ NEM ÁLL ÚTBA ── */
    o.kapuNyitva=(h2hRoomActive()===false);

    /* ── A MENTÉS VISZI ── */
    o.mentheto=(()=>{try{return JSON.parse(JSON.stringify({mpForfeit:S.mpForfeit})).mpForfeit.season===3;}catch(e){return false;}})();
    return o;});

  console.log("=== a kiút ===");
  ok("a szezonzárás kapuja LEZÁRÁST kínál, nem továbblépést",
     /Lezárom a párharcot/.test(r.kiut.cimke)&&r.kiut.kapu==="final",r.kiut);
  ok("a visszaszámláló is a lezárást ígéri, nem továbblépést",
     r.kiut.ajanlat==="a párharc lezárását",r.kiut.ajanlat);
  ok("SOSEM fut le magától — Villám módban sem",r.autoTilt===true);

  console.log("\n=== a többi kapu érintetlen ===");
  ok("a lágy kapuk továbbra is automatikusak, és továbblépést kínálnak",
     r.lagyKapu.auto===true&&r.lagyKapu.ajanlat==="a továbblépést",r.lagyKapu);

  console.log("\n=== megerősítés ===");
  ok("megkérdezi, mielőtt lezárná",!!r.kerdes,r.kerdes);
  ok("és kimondja, mi történik: nyersz, véget ér, végleges",
     r.kerdes&&r.kerdes.mondja_hogy_nyertel&&r.kerdes.mondja_hogy_veget_er&&r.kerdes.vegleges,
     r.kerdes);

  console.log("\n=== a lezárás ===");
  ok("a közös karrier leválik (a tiéd egyjátékosként fut tovább)",
     r.lezaras.elotte.aktiv===true&&r.lezaras.utana.aktiv===false
     &&r.lezaras.utana.orphan===true,r.lezaras);
  ok("a győzelem KÖNYVELVE, a szezonra szólóan",
     !!r.lezaras.forfeit&&r.lezaras.forfeit.season===3,r.lezaras.forfeit);
  ok("és a szezonzárás folytatódik (a jelentés felé)",r.lezaras.tovabb===1,r.lezaras.tovabb);
  ok("a kapu többé nem áll útba",r.kapuNyitva===true);
  ok("a mentés viszi a győzelmet",r.mentheto===true);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
