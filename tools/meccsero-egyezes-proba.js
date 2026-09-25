/* ⚡ UGYANANNAK A CSAPATNAK UGYANAZ A MECCS-EREJE MINDKÉT GÉPEN (3.9.149).

   BEJELENTETT HIBA (párharc, képernyőképpel): a te eredményjelződön a saját
   meccs-erőd ⚡95,2 volt, a társadén ugyanerre a csapatra ⚡98 („Nálam azt
   mutatta, hogy a meccs erőd 98").

   AZ OK: a társ gépe a te ⚡-odat a te pillanatképedből számolta (ovr +
   taktika — pontosan amivel a szimuláció is számol), a te géped viszont a
   helyi BECSLÉSBŐL (teamMatchStrength), ami a napi és a tartós formát, az
   egyensúly-bónuszt és a stílus csapaterő-traitjét nem tartalmazza.
   KÖZBEN ELŐKERÜLT EGY MOTORHIBA IS: a morál-csúszka (pl. „Hagyd a
   legjobbat", „Béke") csak a becslésben hatott, a motorban nem.

   Amit mér:
     1. a motor (buildMatchSnapshot) a morál-csúszkát is alkalmazza —
        csúszka nélkül bitre a régi képlet;
     2. a VALÓDI h2hStart mindkét szerepből (host / guest) ugyanazt a
        számpárt adja: a te ⚡-od nálad = a te ⚡-od a társnál, és fordítva;
     3. a valódi eredményjelző (sbPaintTeams) párharcban ezt írja ki;
     4. a papírforma párharcban szimmetrikus: a sajátod ugyanabból a
        számból, amiből a társad a tiédet számolja;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9177;
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
  await p.waitForFunction(()=>typeof h2hStart==="function"&&typeof sbPaintTeams==="function",null,{timeout:15000});

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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;
    addLine=()=>{};

    /* ---- 1. A MORÁL-CSÚSZKA A MOTORBAN ---- */
    S.morale=70;
    const MS0=buildMatchSnapshot();
    ki.semleges={mod:MS0.moraleMod,regi:(70-50)/50*2.5};
    const _dm=dialMul;
    dialMul=(ch,ctx)=>ch==="morale"?1.5:_dm(ch,ctx);
    try{const MS1=buildMatchSnapshot();ki.csuszka={mod:MS1.moraleMod,vart:(70-50)/50*2.5*1.5,becsles:moraleToOvr(70)};}
    finally{dialMul=_dm;}

    /* ---- 2. A VALÓDI h2hStart MINDKÉT SZEREPBŐL ---- */
    const node={host:{teamName:"Megérkezés",ovr:96.1,tacticEffect:1.9,shownOvr:89.7,dispOvr:89},
                guest:{teamName:"MIE",ovr:93.3,tacticEffect:1.3,shownOvr:88.0,dispOvr:87}};
    const _pm=playMatch;let lat=null;
    playMatch=()=>{lat=h2hScript;};
    const kerd=szerep=>{
      MP.role=szerep;lat=null;
      try{h2hStart(node,[],5);}catch(e){return {hiba:String(e)};}
      return lat?{sajat:lat.myMatch,tars:lat.oppMatch}:null;};
    try{ki.host=kerd("host");ki.guest=kerd("guest");}
    finally{playMatch=_pm;h2hScript=null;}

    /* ---- 3. A VALÓDI EREDMÉNYJELZŐ ---- */
    const _tms=teamMatchStrength;
    try{
      teamMatchStrength=()=>95.2;     /* a helyi becslés — ennek NEM szabad kiíródnia */
      sbPaintTeams({duel:true,home:true,myMatch:98,o:{n:"MIE",ovr:87,dispOvr:88,matchOvr:94.6}});
      const sajat=SB.teams&&SB.teams.home,tars=SB.teams&&SB.teams.away;
      ki.sb={sajat:sajat&&sajat.ms,tars:tars&&tars.ms,base:SB.msBase};
    }finally{teamMatchStrength=_tms;}

    /* ---- 4. A PAPÍRFORMA SZIMMETRIKUS ---- */
    _duelMyMs=98;
    try{
      const raw=teamStrength();
      ki.papir={sajat:paperRefNow(),vart:(raw+98)/2,
        /* a társ gépén a te papírformád: (kijelzett erőd + a pillanatképed meccsereje)/2 */
        tarsNalad:paperOppOf({dispOvr:raw,matchOvr:98})};
    }finally{_duelMyMs=null;}
    ki.papirNelkul=paperRefNow()===(teamStrength()+teamMatchStrength())/2;
    return ki;});

  console.log("\n— 1. A MORÁL-CSÚSZKA A MOTORBAN —");
  ok(r.semleges.mod===r.semleges.regi,"csúszka nélkül a motor bitre a régi képlettel számol",r.semleges);
  ok(Math.abs(r.csuszka.mod-r.csuszka.vart)<1e-12&&r.csuszka.mod===r.csuszka.becsles,"a morál-csúszka a motorban is hat — pontosan úgy, ahogy a kijelzett meccserőben",r.csuszka);
  console.log("\n— 2. A VALÓDI h2hStart MINDKÉT SZEREPBŐL —");
  ok(r.host&&r.host.sajat===98&&r.host.tars===94.6,"a gazda gépén: a saját ⚡98 (96,1+1,9), a társé ⚡94,6 (93,3+1,3)",r.host);
  ok(r.guest&&r.guest.sajat===94.6&&r.guest.tars===98,"a vendég gépén ugyanez a két szám, fordítva — a két képernyő egyezik",r.guest);
  console.log("\n— 3. A VALÓDI EREDMÉNYJELZŐ —");
  ok(r.sb.sajat===98&&r.sb.tars===94.6&&r.sb.base===98,"párharcban a saját ⚡ a pillanatképből jön (98), nem a helyi becslésből (95,2) — az élő frissítés is erről indul",r.sb);
  console.log("\n— 4. A PAPÍRFORMA —");
  ok(Math.abs(r.papir.sajat-r.papir.vart)<1e-9&&Math.abs(r.papir.sajat-r.papir.tarsNalad)<1e-9,"párharcban a saját papírformád ugyanaz, amit a társad gépe számol rólad",r.papir);
  ok(r.papirNelkul,"párharcon kívül a papírforma a régi (a helyi meccserővel)");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
