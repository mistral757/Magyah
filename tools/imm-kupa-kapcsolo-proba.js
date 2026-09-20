/* 🎬 A MECCSRŐL MECCSRE KAPCSOLÓJA A KUPASOROZATBAN (3.9.98).

   BEJELENTETT HIBA: „A meccsről meccsre módnak nincsen látható kapcsológombja
   kupasorozatban. Lehetne a kupa HUB-ban egy jól látható helyen. És a szokásos
   helyen is. Jelenleg nem lehet bekapcsolni pedig useful lenne."

   HÁROM HIÁNY VOLT, nem egy:
     1. A MEGSZOKOTT SÁV (az eredményjelző alatt) `phase==="season"`-re volt
        kapuzva — a kupasorozat viszont a szezon LEZÁRÁSA után fut, ott a
        fázis már nem "season". A sáv tehát pont ott tűnt el, ahol a
        mérkőzések a leggyorsabban jönnek egymás után.
     2. A KUPA HUB-ban (scEuro) egyáltalán nem volt kapcsoló — pedig a
        sorozat mérkőzései között ez a képernyő az otthonod.
     3. ÉS HA VALAKI MÉGIS BEKAPCSOLTA, a lánc nem indult el: az immStep
        hurka MINDIG a bajnoki ágon zárult (immAfterLeagueMatch), az pedig a
        kupában azonnal megáll („a lánc megáll: kupasorozat"). A mód
        bekapcsolt, a sorozat állt.

   Amit mér:
     1. a kupa HUB sávja létezik, és a Kezdőrúgás FÖLÖTT áll;
     2. futó sorozatban látszik, azon kívül nem;
     3. a gomb tényleg kapcsol, és a két sáv EGYÜTT mozog;
     4. a szövege a kupa ritmusát mondja, nem a bajnokiét;
     5. a megszokott sáv is előjön a kupában;
     6. és a lényeg: bekapcsolva a kupa-nézetben ELINDUL a lánc. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9055;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof immSyncEuroRow==="function"
    &&typeof immPaintToggle==="function"&&typeof immNoteText==="function",
    null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    careerPool=careerPool||{};
    S.playing=false;S.auto=false;S.immersion=false;

    /* ---- 1. A SÁV HELYE A DOM-BAN ---- */
    const row=document.getElementById("immRowEuro");
    const kick=document.getElementById("euroKickBtn");
    ki.hely={letezik:!!row,
      /* a Kezdőrúgás gomb a sáv UTÁN következik a dokumentumban */
      kickUtana:!!(row&&kick&&(row.compareDocumentPosition(kick)
        &Node.DOCUMENT_POSITION_FOLLOWING)),
      scEuroBan:!!(row&&row.closest("#scEuro")),
      /* ugyanazt a CSS-osztályt viseli, mint a megszokott sáv */
      kozosOsztaly:!!(row&&row.classList.contains("immRow")
        &&document.getElementById("immRow").classList.contains("immRow"))};

    const lathato=id=>{const e=document.getElementById(id);
      return !!(e&&!e.classList.contains("hide"));};

    /* ---- 2. LÁTHATÓSÁG ---- */
    S.euro=null;
    immSyncRow();
    ki.nincsSorozat={euro:lathato("immRowEuro")};
    /* FUTÓ SOROZAT: csoportkör, van soron következő mérkőzés */
    S.euro={stage:"group",comp:"BL",idx:0,md:0,userG:0,userIdx:0,
      fixtures:[{o:{n:"Teszt FC",ovr:80},home:true}],path:[],teams:[]};
    immSyncRow();
    ki.sorozatban={euro:lathato("immRowEuro"),szokasos:lathato("immRow")};
    /* ÉLŐ MÉRKŐZÉS ALATT egyik sem */
    S.playing=true;immSyncRow();
    ki.meccsKozben={euro:lathato("immRowEuro"),szokasos:lathato("immRow")};
    S.playing=false;
    /* A GÉP JÁTSSZA VÉGIG A SZEZONT: ott sincs mit kapcsolni */
    S.auto=true;immSyncRow();
    ki.autoban={euro:lathato("immRowEuro")};
    S.auto=false;
    /* LEZÁRULT SOROZAT */
    S.euro.stage="done";immSyncRow();
    ki.lezarult={euro:lathato("immRowEuro")};
    S.euro.stage="group";immSyncRow();

    /* ---- 3. A GOMB KAPCSOL, ÉS A KETTŐ EGYÜTT MOZOG ---- */
    const _add=addLine;addLine=()=>{};
    const _save=saveGame;saveGame=()=>{};
    const _step=immStep;immStep=()=>{};      /* a láncot külön ágon mérjük */
    const be=document.getElementById("immBtnEuro");
    const szo=document.getElementById("immBtn");
    ki.kapcsolo={elotte:immOn(),
      feliratKi:be.textContent,szokasosKi:szo.textContent};
    be.click();
    ki.kapcsolo.utana=immOn();
    ki.kapcsolo.feliratBe=be.textContent;
    ki.kapcsolo.szokasosBe=szo.textContent;
    ki.kapcsolo.sargaBe=be.classList.contains("btn-y");
    be.click();
    ki.kapcsolo.vissza=immOn();
    ki.kapcsolo.feliratVissza=be.textContent;
    immStep=_step;

    /* ---- 4. A SZÖVEG A KUPA RITMUSÁT MONDJA ---- */
    S.immersion=true;immSyncRow();
    ki.szoveg={kupaBe:document.getElementById("immNoteEuro").textContent,
      ligaBe:document.getElementById("immNote").textContent};
    S.immersion=false;immSyncRow();
    ki.szoveg.kupaKi=document.getElementById("immNoteEuro").textContent;

    /* ---- 5. A ⚙ BEÁLLÍTÁS IS ELÉRHETŐ INNEN ---- */
    ki.beallitas={gomb:!!document.getElementById("immSetBtnEuro"),
      kotve:typeof document.getElementById("immSetBtnEuro").onclick==="function"};

    addLine=_add;saveGame=_save;
    return ki;});

  /* ---- 6. A LÁNC TÉNYLEG ELINDUL A KUPA-NÉZETBŐL ---- */
  const lanc=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    S.playing=false;S.auto=false;S.immersion=false;
    S.euro={stage:"group",comp:"BL",idx:0,md:0,userG:0,userIdx:0,
      fixtures:[{o:{n:"Teszt FC",ovr:80},home:true}],path:[],teams:[]};
    /* A kupa-nézet legyen tényleg az, ami áll a képernyőn — az immStep
       a LÁTHATÓ képernyőből dolgozik (immVis), nem egy jelzőből. */
    document.querySelectorAll("section").forEach(x=>x.classList.add("hide"));
    document.getElementById("scEuro").classList.remove("hide");
    const _add=addLine;addLine=()=>{};
    const _save=saveGame;saveGame=()=>{};
    /* A visszaszámlálót nem futtatjuk le: azt mérjük, ELINDUL-e, és MIRE. */
    immCancel();
    immToggle();                      /* ez a felhasználó koppintása */
    ki.be=immOn();
    ki.pirulaLatszik=!document.getElementById("immPill").classList.contains("hide");
    ki.pirulaSzoveg=document.getElementById("immPillTx").textContent;
    /* …és ha NEM a kupa-nézeten állunk, a régi viselkedés marad */
    immStopAll(true);immCancel();
    document.getElementById("scEuro").classList.add("hide");
    immToggle();
    ki.masholPirula=!document.getElementById("immPill").classList.contains("hide");
    immStopAll(true);immCancel();
    addLine=_add;saveGame=_save;
    return ki;});

  console.log("=== 1. a sáv helye a kupa HUB-ban ===");
  ok(t.hely.letezik,"létezik a kupa HUB kapcsolósávja",t.hely.letezik);
  ok(t.hely.scEuroBan,"…a kupa-nézeten belül",t.hely.scEuroBan);
  ok(t.hely.kickUtana,"…és a Kezdőrúgás gomb FÖLÖTT — arra hat",t.hely.kickUtana);
  ok(t.hely.kozosOsztaly,
     "a két sáv KÖZÖS CSS-osztályt visel, tehát nem tud szétcsúszni",t.hely.kozosOsztaly);

  console.log("=== 2. láthatóság ===");
  ok(t.sorozatban.euro===true,"futó kupasorozatban látszik",t.sorozatban);
  ok(t.sorozatban.szokasos===true,
     "…és a MEGSZOKOTT sáv is előjön a kupában (ez volt a bejelentés másik fele)",
     t.sorozatban);
  ok(t.nincsSorozat.euro===false,"sorozat nélkül elbújik",t.nincsSorozat);
  ok(t.meccsKozben.euro===false&&t.meccsKozben.szokasos===false,
     "élő mérkőzés alatt egyik sem látszik",t.meccsKozben);
  ok(t.autoban.euro===false,"a szezon végigjátszása alatt sem",t.autoban);
  ok(t.lezarult.euro===false,"lezárult sorozatnál sem",t.lezarult);

  console.log("=== 3. a gomb kapcsol, és a kettő együtt mozog ===");
  ok(t.kapcsolo.elotte===false&&t.kapcsolo.utana===true&&t.kapcsolo.vissza===false,
     "be- és kikapcsol",t.kapcsolo);
  ok(/^🎬/.test(t.kapcsolo.feliratKi)&&/BE$/.test(t.kapcsolo.feliratBe)
     &&/^🎬/.test(t.kapcsolo.feliratVissza),
     "a felirat az állapotot mondja",t.kapcsolo);
  ok(t.kapcsolo.sargaBe===true,"bekapcsolva sárga (btn-y)",t.kapcsolo.sargaBe);
  ok(t.kapcsolo.szokasosKi===t.kapcsolo.feliratKi
     &&t.kapcsolo.szokasosBe===t.kapcsolo.feliratBe,
     "a MEGSZOKOTT sáv gombja ugyanazt írja — egy hívás tartja szinkronban",t.kapcsolo);

  console.log("=== 4. a szöveg a kupa ritmusát mondja ===");
  ok(/kupamérkőzés/.test(t.szoveg.kupaBe)&&/szakasz/.test(t.szoveg.kupaBe),
     "bekapcsolva a kupa-láncot írja le (szakasz-határral)",t.szoveg.kupaBe);
  ok(!/forduló/.test(t.szoveg.kupaBe),
     "…és nem a bajnoki fordulókról beszél",t.szoveg.kupaBe);
  ok(t.szoveg.ligaBe!==t.szoveg.kupaBe,
     "a két sáv szövege tényleg különbözik",{liga:t.szoveg.ligaBe.slice(0,40)});
  ok(/sorozat/.test(t.szoveg.kupaKi),"kikapcsolva is a sorozatról beszél",t.szoveg.kupaKi);

  console.log("=== 5. a ⚙ beállítás innen is elérhető ===");
  ok(t.beallitas.gomb&&t.beallitas.kotve,"a fogaskerék ott van, és kötve van",t.beallitas);

  console.log("=== 6. a lánc TÉNYLEG elindul a kupa-nézetből ===");
  ok(lanc.be===true,"a kapcsoló bekapcsolta a módot",lanc.be);
  ok(lanc.pirulaLatszik===true,
     "…és azonnal elindult a visszaszámlálás (ez hiányzott teljesen)",lanc);
  ok(/Kupa/.test(lanc.pirulaSzoveg),
     "…méghozzá a KUPA-lánc, nem a bajnoki",lanc.pirulaSzoveg);
  ok(lanc.masholPirula===false,
     "más képernyőről viszont nem indít kupa-láncot — a feltétel szűk",lanc.masholPirula);

  console.log("=== hibák a konzolon ===");
  ok(errs.length===0,"nincs futásidejű hiba",errs.slice(0,2));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
