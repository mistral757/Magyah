/* 🧿 TALIZMÁNOK F9 — A KAPCSOLÓ, A PÁRHARC-TISZTÍTÁS, A HUB, A SÚGÓ (3.9.161).

   Amit mér:
     1. „Talizmánok: be / ki": kikapcsolva nincs húzás és nincs hatás, a
        gyűjtemény megmarad; visszakapcsolva ugyanott folytatódik; a menü és a
        HUB-gomb kikapcsolva is elérhető;
     2. „a párharcban is": kikapcsolva a valódi h2hWireSnapshot-ból a talizmán-
        mezők kikerülnek (a helyi meccs-pillanatkép marad);
     3. a HUB-gomb a bomba-ajánlatot is jelzi;
     4. a súgó a speciálokról, a rezonanciáról, az égetésről és a Kártyatárról
        szól, és a „később jönnek" mondat eltűnt; a Lojális stáb szövege;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9192;
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
  await p.waitForFunction(()=>typeof talKapcsol==="function",null,{timeout:15000});
  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;S.transferBudget=5e9;S.morale=60;
    addLine=()=>{};saveGame=()=>{};
    const T=talState();
    T.lapok=[{kat:"meccs",rang:4,dobas:0.5,spec:"betonfal",al:"gol",uid:1,szezon:3},
             {kat:"fejlodes",rang:2,dobas:0.5,spec:"specialista",valt:"tempo",uid:2,szezon:3}];
    T.seq=2;T.huzas=4;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;});

  /* ---- 1. BE / KI ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    ki.be={fo:talFoEdzMult(),lam:talMeccsLam().own};
    talKapcsol("on",false);
    ki.ki={on:talOn(),fo:talFoEdzMult(),lam:talMeccsLam().own,lapok:S.tal.lapok.length};
    S.idx=30;ki.huzas=talEsedekes();
    renderHub();ki.hub=$("hubTalBtn").textContent;ki.hubLatszik=!$("hubTalBtn").classList.contains("hide");
    talMenuOpen();ki.menu=!$("talModal").classList.contains("hide");
    const cb=document.querySelector("[data-talk='on']");cb.checked=true;cb.dispatchEvent(new Event("change",{bubbles:true}));
    ki.vissza={on:talOn(),fo:talFoEdzMult()};
    talMenuClose();S.idx=5;
    return ki;});
  console.log("\n— 1. BE / KI —");
  ok(k.be.fo>1&&!k.ki.on&&k.ki.fo===1&&k.ki.lam===1&&k.ki.lapok===2&&k.huzas===0,"kikapcsolva nincs hatás és nincs húzás, a gyűjtemény megmarad",k);
  ok(k.hubLatszik&&/kikapcsolva/.test(k.hub)&&k.menu&&k.vissza.on&&k.vissza.fo===k.be.fo,"a HUB-gomb és a menü kikapcsolva is elérhető; a menü kapcsolójával visszakapcsolva ugyanott folytatódik",k);

  /* ---- 2. A PÁRHARCBAN IS ---- */
  const d=await p.evaluate(()=>{
    const ki={};
    let w=h2hWireSnapshot();ki.be=["talOwn","talSpOwnM","talSpOpp"].filter(x=>x in w);
    talKapcsol("duel",false);
    w=h2hWireSnapshot();ki.ki=TAL_SNAP_MEZOK.filter(x=>x in w);ki.flag="_talKi" in w;
    ki.helyi="talSpOpp" in buildMatchSnapshot();
    talKapcsol("duel",true);
    return ki;});
  console.log("\n— 2. A PÁRHARCBAN IS —");
  ok(d.be.length>=2&&d.ki.length===0&&!d.flag&&d.helyi,"kikapcsolva a társhoz menő pillanatképből a talizmán-mezők kikerülnek, a helyi meccs-pillanatkép marad",d);

  /* ---- 3. A HUB: a bomba ---- */
  const h=await p.evaluate(()=>{
    const _b=talBombaAjanlat;talBombaAjanlat=()=>({n:"x",e:{},ar:1});
    renderHub();const t=$("hubTalBtn").textContent;talBombaAjanlat=_b;renderHub();
    return t;});
  console.log("\n— 3. A HUB —");
  ok(/💣 ajánlat vár/.test(h),"a HUB-gomb jelzi a várakozó bomba-ajánlatot",h);

  /* ---- 4. A SÚGÓ ---- */
  const s=await p.evaluate(()=>{
    const src=document.documentElement.innerHTML;
    const i=src.indexOf('talizman:{title:"Talizmánok"');const t=src.slice(i,src.indexOf('"},',i));
    return {spec:/A SPECIALOK — mind a 82 él/.test(t),rez:/REZONANCIA/.test(t),eget:/ÉGETÉS/.test(t),tar:/KÁRTYATÁR/.test(t),
      kapcs:/ki is kapcsolhatók/.test(t),kesobb:/A specialok később jönnek/.test(t),
      loj:talSpecOldal(TAL_SPEC_BY.lojalis,"pro",1,null)};});
  console.log("\n— 4. A SÚGÓ —");
  ok(s.spec&&s.rez&&s.eget&&s.tar&&s.kapcs&&!s.kesobb,"a súgó a speciálokról, a rezonanciáról, az égetésről, a Kártyatárról és a kapcsolóról szól",s);
  ok(!/büntetés/.test(s.loj)&&/3 évvel/.test(s.loj),"a Lojális stáb szövegéből kikerült a fedezet nélküli ígéret",s.loj);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
