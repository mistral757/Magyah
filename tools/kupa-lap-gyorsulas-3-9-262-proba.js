/* 🏆 3.9.262 — KUPA-MEZŐNY, TISZTA LAP, KORÁBBI MEZŐNY-GYORSULÁS.

   KIMONDOTT KÉRÉSEK:
     1. „A nyári kupa úgy számol, hogy gyakorlatilag mindenképp szoros a
        mezőny, mindegy mennyire vagy túlnőve saját mezőnyödön. Ezt kéne
        alapul venni, és a különböző kupák nehézségi szintje szerint tovább
        pontosítani."
     2. „A kupasorozatok kezdete előtt törlődjenek a lapok, eltiltások. A
        kupasorozaton belül pedig, a csoportkörről a kieséses szakaszra
        váltva, valamint a döntő előtt szintén törlődjenek a lapok."
     3. „A nehézségi szintek előrehaladásával egyre korábbra kerüljön […]
        amikor fokozatosan elkezdünk pluszban rátenni az ellenfelek szezon
        közbeni fejlődésének tempójára."

   Amit mér:
     1. a kupa-mezőny a nyári kupa bázisa + fix eltolás (MK −1 … KK +2),
        akármilyen erős a bajnokság / a D1; a tartós forma is beleszámít;
        a kiírás a nyári kupa mércéjét mondja;
     2. a sorozat indulásakor, a csoportkör → kieséses szakasz lépésnél és a
        döntő előtt törlődnek a kupa-sárgák és a lapos eltiltások — a
        sérülés marad, a köztes körváltásoknál nincs törlés;
     3. a mezőny-gyorsulás kezdő idénye a fokozattal korábbra jön
        (1–4. → 4. · 5–6. → 3. · 7–8. → 2. · 9–10. → 1.), a görbe
        változatlan; tízfokozatú rendszer nélkül marad a 4.;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9262;
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
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    window.saveGame=()=>{};
    /* ── 1. KUPA-MEZŐNY ── */
    const C=["MK","FA","KL","EL","BL"];
    const palya=c=>euroMidRating(c)+((EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0);
    const _pf=window.pformTeamOvr;window.pformTeamOvr=()=>0;
    const nyk=nykMidMine();
    const ot=oppTargetRating,_top=pyrTopLevel,_g=pyrGrowNow;pyrGrowNow=()=>0;
    const meres=()=>{const o={};C.forEach(c=>{o[c]=palya(c)-nyk;});return o;};
    oppTargetRating=nyk-40;pyrTopLevel=()=>nyk-40;ki.tulno=meres();      /* a bejelentett eset: messze a liga fölött */
    oppTargetRating=nyk+40;pyrTopLevel=()=>nyk+40;ki.alatta=meres();
    oppTargetRating=nyk;pyrTopLevel=()=>nyk;ki.egyenrangu=meres();
    window.pformTeamOvr=()=>5;
    ki.formaval=palya("BL")-palya("BL");   /* placeholder, felülírva lent */
    {window.pformTeamOvr=()=>0;const a=palya("BL");window.pformTeamOvr=()=>5;const b=palya("BL");ki.formaval=b-a;}
    window.pformTeamOvr=_pf;
    oppTargetRating=ot;pyrTopLevel=_top;pyrGrowNow=_g;
    ki.nykValtozatlan=(nykMidFor(150,10)===Math.round(150-1-10*OPP_BUFF_MEASURED));
    {const E={comp:"BL",target:170};ki.kiiras=euroFieldHtml(E,EURO_COMPS.BL).replace(/<[^>]+>/g,"");}
    /* ── 2. TISZTA LAP ── */
    const nevek=fullCareerRoster().filter(Boolean).map(x=>x.n);
    const A=nevek[0],B=nevek[1],Cn=nevek[2];
    const beallit=()=>{S.cupYellows={[A]:1,[Cn]:1};S.unavailable={[A]:{reason:"suspension",matchesLeft:1},[B]:{reason:"injury",matchesLeft:3}};S.replacementChoice={};};
    const _dr=window.euroDrawRound;window.euroDrawRound=()=>[];
    const lepes=(elozo,kov)=>{beallit();S.euro={comp:"BL",stage:elozo,teams:[],userIdx:0};euroStartRound(kov,[]);
      return {sarga:Object.keys(S.cupYellows).length,elt:!!S.unavailable[A],ser:!!S.unavailable[B]};};
    ki.lap={
      csoportbolKO:lepes("group","r16"),
      ligabolRajatszas:lepes("group","hszpo"),
      rajatszasbolKO:lepes("hszpo","r16"),
      koztes:lepes("r16","qf"),
      dontoElott:lepes("sf","final")};
    window.euroDrawRound=_dr;
    ki.indulaskor=/S\.cupYellows=\{\};\s*cupLapTorles\(/.test(String(startEuroCampaign));
    beallit();ki.direkt=cupLapTorles("teszt");ki.direktUtan={sarga:Object.keys(S.cupYellows).length,elt:!!S.unavailable[A],ser:!!S.unavailable[B]};
    S.euro=null;
    /* ── 3. MEZŐNY-GYORSULÁS ── */
    const _on=window.nfOn,_lv=window.nfLevelFor;
    window.nfOn=()=>true;
    ki.kezd={};
    for(let nf=1;nf<=10;nf++){window.nfLevelFor=()=>nf;ki.kezd[nf]=nfGyorsKezd(5);}
    window.nfLevelFor=()=>4;ki.gorbe4=[1,2,3,4,5].map(s=>Math.round(nfGyorsIdeny(s)*100)/100);
    window.nfLevelFor=()=>7;ki.gorbe7=[1,2,3,4,5].map(s=>Math.round(nfGyorsIdeny(s)*100)/100);
    window.nfLevelFor=()=>10;ki.gorbe10=[1,2,3,4,5].map(s=>Math.round(nfGyorsIdeny(s)*100)/100);
    window.nfOn=()=>false;ki.nfNelkul=nfGyorsKezd(5);
    window.nfOn=_on;window.nfLevelFor=_lv;
    ki.verzio=APP_VERSION;
    return ki;});
  console.log("=== 1. kupa-mezőny ===");
  const vart={MK:-1,FA:0,KL:0,EL:1,BL:2};
  ok(JSON.stringify(r.tulno)===JSON.stringify(vart),"messze a liga (és a D1) fölött: KK +2 a nyári kupához (régen −2: könnyebb volt)",r.tulno);
  ok(JSON.stringify(r.alatta)===JSON.stringify(vart)&&JSON.stringify(r.egyenrangu)===JSON.stringify(vart),"erősebb és egyenrangú bajnokságnál is ugyanaz",{alatta:r.alatta,egy:r.egyenrangu});
  ok(r.formaval===5,"a tartós forma (+5) a kupa-mezőnyt is +5-tel emeli",r.formaval);
  ok(r.nykValtozatlan,"a nyári kupa saját képlete változatlan");
  ok(/nyári kupa mércéje/.test(r.kiiras)&&/\+2 KK-eltolással/.test(r.kiiras),"a kiírás a nyári kupa mércéjét és a KK-eltolást mondja",r.kiiras.slice(0,220));
  console.log("=== 2. tiszta lap ===");
  const tiszta=x=>x.sarga===0&&!x.elt&&x.ser, marad=x=>x.sarga===2&&x.elt&&x.ser;
  ok(tiszta(r.lap.csoportbolKO),"csoportkör → kieséses szakasz: lapok és eltiltás törölve, a sérülés marad",r.lap.csoportbolKO);
  ok(tiszta(r.lap.ligabolRajatszas),"ligaszakasz → rájátszás: törölve",r.lap.ligabolRajatszas);
  ok(tiszta(r.lap.dontoElott),"a döntő előtt: törölve",r.lap.dontoElott);
  ok(marad(r.lap.koztes)&&marad(r.lap.rajatszasbolKO),"köztes körváltásnál (nyolcad → negyed, rájátszás → nyolcad) nincs törlés",{koz:r.lap.koztes,raj:r.lap.rajatszasbolKO});
  ok(r.indulaskor,"a sorozat indulásakor (startEuroCampaign) is lefut");
  ok(r.direkt.lap===2&&r.direkt.elt===1&&tiszta(r.direktUtan),"a törlés megszámolja és kiírja, amit töröl",r.direkt);
  console.log("=== 3. mezőny-gyorsulás ===");
  ok(JSON.stringify(Object.values(r.kezd))===JSON.stringify([4,4,4,4,3,3,2,2,1,1]),"a kezdő idény a fokozattal: 1–4. → 4. · 5–6. → 3. · 7–8. → 2. · 9–10. → 1.",r.kezd);
  ok(JSON.stringify(r.gorbe4)===JSON.stringify([0,0,0,4.05,5.4]),"4. fokozat: a régi görbe, betűre (4. idény +4,05)",r.gorbe4);
  ok(JSON.stringify(r.gorbe7)===JSON.stringify([0,1.35,2.7,4.05,5.4]),"7. fokozat: a 2. idénytől, ugyanazon a görbén",r.gorbe7);
  ok(r.gorbe10[0]>0&&r.gorbe10[0]<r.gorbe10[1]&&r.gorbe10[1]===1.35,"10. fokozat: már az 1. idényben (a 2. idény fele)",r.gorbe10);
  ok(r.nfNelkul===4,"tízfokozatú rendszer nélkül marad a 4. idény");
  ok(String(r.verzio).localeCompare("3.9.262",undefined,{numeric:true})>=0,"verzió legalább 3.9.262",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
