/* 🩹 3.9.296 — A KÖZÖS KARRIER NEHÉZSÉGI SZABÁLYA ÚJRATÖLTÉS UTÁN.

   BEJELENTETT HIBA (hardcore, 2. idény eleje): a házigazdánál „7.5 Mesteri,
   célrés +1”, osztályközép 116; a vendégnél nincs nehézségi szint, osztályközép
   95, meccs-erő 134 („Sétagalopp”), a Run a mélyben.
   OK: a szoba nehézségi szabálya (padlo) és fokozata csak modulváltozóban élt —
   a draft/klubválasztás közbeni újratöltés után a vendég karrierje nélkülük
   indult.

   Amit mér:
     1. a mentés (S.pyrMp) viszi a szabályt és a fokozatot, és a betöltés
        visszaállítja (a karrier-indítás így a szoba szerint fut);
     2. a már elindult, hibás vendég-karrier gyógyul: a szoba csomagjából
        visszakapja a szabályt és a fokozatot, megjelenik a nehézségi sáv, és
        ha megvan az idény közös kézfogás-párja, a mezőny-emelés azonnal
        lefut — a házigazdáéval azonos számokból;
     3. ép karriert nem bánt, régi (padló nélküli) szobát nem kapcsol át;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9296;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const errs=[];
  const lap=async()=>{const p=await ctx.newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);return p;};

  const A=await lap();
  await A.evaluate(()=>{unlockGatesOn=()=>false;mpNet.mode="local";window.mpNetInit=async()=>{};MP.active=false;
    pendingWorldSeed="HEAL296";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;S.seasonNumber=2;S.idx=0;});

  console.log("— 1. a mentés viszi a szabályt —");
  const t1=await A.evaluate(()=>{
    /* a betöltő a S.pyrMp-ből állítja vissza a modulváltozókat */
    _mpPadlo=0;_mpNfFok=null;
    const M={div:3,band:[60,90],upAmt:0,padlo:2,fok:{nf:7,s:5,tel:"normal",holt:"1.5"}};
    if(M&&typeof M.padlo==="number")_mpPadlo=M.padlo;
    if(M&&M.fok)_mpNfFok=mpNfFokCsomagbol(M.fok)||_mpNfFok;
    const o={padlo:_mpPadlo,fok:_mpNfFok&&_mpNfFok.nf+"."+_mpNfFok.s};
    /* a forrás: a S.pyrMp építése és visszatöltése a kódban */
    const src=document.documentElement.innerHTML;
    o.ment=/padlo:_mpPadlo,fok:_mpNfFok/.test(String(beginNewGame))||/padlo:_mpPadlo,fok:_mpNfFok/.test([...document.scripts].map(x=>x.text).join(""));
    o.tolt=/_mpPadlo=M\.padlo/.test([...document.scripts].map(x=>x.text).join(""));
    return o;});
  ok(t1.padlo===2&&t1.fok==="7.5"&&t1.ment&&t1.tolt,"a S.pyrMp a szabályt és a fokozatot is viszi, a betöltés visszaállítja",t1);

  console.log("\n— 2. a hibás vendég-karrier gyógyul —");
  const t2=await A.evaluate(()=>{
    const P=S.pyr,sn=S.seasonNumber;
    /* a hiba állapota: vendég, padló nélkül, a 2. idény rajtja nem a padló szerint */
    MP.active=true;MP.role="guest";MP.activeRoom="HEAL";window.h2hRoomActive=()=>true;
    P.padlo=0;delete P.nf;delete P.fok;delete P.cel;
    const H=pyrFloorHist();delete H[sn];
    const elotte={sav:!!nfHubSavHtml(),on:nfOn(),szint:Math.round(pyrLevel()*10)/10};
    /* a közös kézfogás párja: mindkét gépen ugyanaz — a pár átlaga jóval a mezőny fölött */
    const ms=teamMatchStrength();
    P.superPair={avg:pyrLevel()+12,hid:0,a:ms,b:ms+20,for:sn,vallA:1,vallB:1};
    const ok=mpPadloGyogyit({padlo:2,pyr:{on:true,nf:7,s:5,tel:"normal",holt:"1.5"}});
    const utana={sav:nfHubSavHtml().replace(/<[^>]+>/g,"").trim(),on:nfOn(),nf:P.nf,fok:P.fok&&P.fok.nf+"."+P.fok.s,
      szint:Math.round(pyrLevel()*10)/10,kesz:!!(H[sn]&&H[sn].done),lift:H[sn]&&H[sn].lift};
    /* másodszor nem fut */
    const masodszor=mpPadloGyogyit({padlo:2,pyr:{on:true,nf:3,s:1}});
    return {ok,elotte,utana,masodszor,nfMaradt:P.nf};});
  ok(t2.ok&&!t2.elotte.on&&!t2.elotte.sav&&t2.utana.on&&/7\.5/.test(t2.utana.sav)&&t2.utana.fok==="7.5","a szabály és a szoba fokozata visszakerül, megjelenik a nehézségi sáv (7.5)",t2);
  ok(t2.utana.kesz&&t2.utana.lift>0&&t2.utana.szint>t2.elotte.szint,"az idény rajtja most a padló szerint könyvelődik: a mezőny felzárkózik a közös párhoz",t2.utana);
  ok(t2.masodszor===false&&t2.nfMaradt===7,"ép (már gyógyult) karriert nem bánt",t2);

  console.log("\n— 3. régi szoba —");
  const t3=await A.evaluate(()=>{S.pyr.padlo=0;const r=mpPadloGyogyit({padlo:1});const r0=mpPadloGyogyit({});S.pyr.padlo=2;return {r,r0};});
  ok(t3.r===false&&t3.r0===false,"régi (egyoldalú vagy padló nélküli) szobát nem kapcsol át",t3);

  console.log("\n— 4. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
