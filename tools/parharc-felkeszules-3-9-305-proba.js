/* ⚔ 3.9.305 — PÁRHARC-FELKÉSZÜLÉS ÉS RÉSZLETES ELLENFÉL-ELEMZÉS.

   KÉRÉS: „Legyen felkészülés a PvP egymás elleni meccsei előtt is. És ott is
   legyen lehetőség elemzést kérni az edzőtől. És itt az ellenfél elemzés
   legyen részletesebb."

   KÉT LAP, a játék helyi szoba-hátterén (mint a 3.9.288). Amit mér:
     1. a párharc-forduló kezdőrúgás-gombja előbb „🔍 Felkészülés", és az
        első koppintás NEM indítja a párharcot;
     2. a felkészülés kicseréli a két gép friss csapatlapját (a bővítéssel:
        stílus, forma, morál, csúcs/mélypont, skillek);
     3. a második koppintás már a párharc;
     4. az edzői elemzés a párharcra szól: a társ ⚡-jával, ⚖ nélkül, és a
        részletes ellenfél-blokkal (a két csapat egymás mellett, az ő
        legerősebbjei, a sorok párharca, az előzmények);
     5. a kártya bővítése a tisztítón át jön (hossz, sáv);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9305;
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
  const A=await lap(),B=await lap();
  /* a két karrier: ugyanaz a világ-seed, más keret; hardcore közös szoba */
  const karrier=(p,role,sqi,szigor)=>p.evaluate(([role,sqi,szigor])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=false;
    pendingWorldSeed="HCSEED01";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[sqi];
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
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;S.seasonNumber=1;S.idx=0;
    /* a közös szoba és a szigorúság a felállás után */
    MP.active=true;MP.role=role;MP.activeRoom="HCPR";S.mpSzigor=szigor;S.tal=null;S.hc=null;
    return {seed:worldSeed,szigor:S.mpSzigor,hc:mpHardcore(),keret:slots.map(s=>s.player&&s.player.n).filter(Boolean).slice(0,3)};},[role,sqi,szigor]);
  const kA=await karrier(A,"host",0,"hardcore"),kB=await karrier(B,"guest",1,"hardcore");
  await A.evaluate(()=>{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="HCPR";r.HCPR=rec;mpLSave(r);});
  const elo=p=>p.evaluate(()=>{
    S.idx=H2H_ROUNDS[0]-1;S.playing=false;S.auto=false;S.euro=null;S.mpDuelLog=[{season:1,round:5,gf:2,ga:1,home:true}];
    window._sr=0;window.startRound=function(){window._sr++;};
    if(!coach)coach=COACHES[0];S.edzo=null;
    return {duel:h2hIsDuelRound(),label:kickBtnLabel()};});
  console.log("— 1. a gomb —");
  const a0=await elo(A),b0=await elo(B);
  ok(a0.duel&&/Felkészülés/.test(a0.label)&&/párharc/.test(a0.label),"a párharc-forduló gombja: 🔍 Felkészülés — ⚔ párharc",a0);

  console.log("\n— 2. a felkészülés: csapatlap-csere —");
  await A.evaluate(()=>{kickoffTap();});await A.waitForTimeout(600);
  await B.evaluate(()=>{kickoffTap();});await B.waitForTimeout(800);
  const pb=await B.evaluate(()=>{const T=duelTarsLap();return {sr:window._sr,friss:!!(T&&T.friss),team:T&&T.card&&T.card.team,
    ext:T&&T.card&&T.card.ext,label:kickBtnLabel(),
    naplo:[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).filter(t=>/FELKÉSZÜLÉS · ⚔ PÁRHARC|Az ellenfeled/.test(t)).length};});
  ok(pb.sr===0&&pb.friss&&pb.team&&pb.naplo>=2,"B: a felkészülés nem indít párharcot, és a friss lapot kapja (napló)",pb);
  ok(pb.ext&&pb.ext.moral!=null&&Array.isArray(pb.ext.sk),"a lap bővítése megjön (stílus, forma, morál, skillek)",pb.ext);
  ok(/PÁRHARC/.test(pb.label)&&!/Felkészülés/.test(pb.label),"utána a gomb: ⚔ PÁRHARC",pb.label);

  console.log("\n— 3. a második koppintás —");
  const k2=await B.evaluate(()=>{kickoffTap();return window._sr;});
  ok(k2===1,"a második koppintás a párharc",k2);

  console.log("\n— 4. az edzői elemzés a párharcra —");
  const e=await A.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    edzoElemzesKer();await varj(150);$("hubTacticConfirmYes").click();await varj(900);
    const tx=$("edzoElemBody").textContent;
    const o=edzoElemzesSzamol(edzoKovetkezoMeccs().fx);
    return {nyitva:!$("edzoElemModal").classList.contains("hide"),
      blokk:/A párharc ellenfele/.test(tx),forras:/friss csapatlap/.test(tx),tabla:/meccs-erő/.test(tx)&&/kezdő tizenegy/.test(tx),
      sorok:/A sorok párharca/.test(tx),legerosebb:/Legerősebbek/.test(tx),elozmeny:/Egymás ellen eddig/.test(tx),
      duel:o.duel,kieg:o.kieg,opp:o.opp,tars:o.tarsNev,fej:/⚔ párharc/.test(tx)};});
  ok(e.nyitva&&e.duel&&e.kieg===0&&e.opp>0&&e.fej,"a párharc-elemzés: a társ ⚡-jával, ⚖ nélkül",e);
  ok(e.blokk&&e.forras&&e.tabla&&e.legerosebb&&e.sorok&&e.elozmeny,"a részletes ellenfél-blokk: friss lap, a két csapat egymás mellett, legerősebbek, sorok párharca, előzmények",e);
  if(process.argv[2]){fs.mkdirSync(process.argv[2],{recursive:true});
    await A.evaluate(()=>{document.querySelectorAll("body *").forEach(el=>{const m=document.getElementById("edzoElemModal");if(getComputedStyle(el).position==="fixed"&&el!==m&&!m.contains(el)&&!el.contains(m))el.style.display="none";});
      const d=[...document.querySelectorAll("#edzoElemBody .chmSection")].find(x=>/párharc ellenfele/.test(x.textContent));if(d)d.scrollIntoView();});
    await A.locator("#edzoElemModal .card").screenshot({path:path.join(process.argv[2],"parharc-elemzes.png")});}

  console.log("\n— 5. a tisztító —");
  const t=await A.evaluate(()=>{const c=mpCardClean({team:"X",ovr:80,str:80,players:[{n:"Valaki",pos:"CS",r:90,xy:[1,1]}],
    ext:{style:"<b>"+"a".repeat(80),forma:999,moral:-5,hot:["a","b","c","d","e","f","g"],sk:Array(20).fill({n:"N",s:"S"}),shape:9}});
    return c.ext;});
  ok(t&&t.style.length<=30&&!/[<>]/.test(t.style)&&t.forma===50&&t.moral===0&&t.hot.length===5&&t.sk.length===10&&t.shape===2,"a bővítés hosszra és sávra vágva",t);

  console.log("\n— 6. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
