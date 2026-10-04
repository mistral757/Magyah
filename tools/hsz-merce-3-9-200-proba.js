/* ⚖ 3.9.200 — A HSZ FORDULÓSZÁMA ÉS A MEZŐNY TÉNYLEGES SZÁMAI.

   BEJELENTÉS: „Hiper szuper kupa csoportköre 8 meccses. Legyen 7/8 egy ilyen
   állásnál a meccsek száma. Másrészt a mezőny ereje legyen a tényleges
   számokkal kiírva. A számítás is a tényleges számítás legyen és a
   csapaterő is. Mert a 184 az nem igaz, mert azon van még egy kiegyenlítő
   extra meccserő az én meccserőmhöz igazítva. Ezt jelezze a game!"

   Amit mér:
     1. A FORDULÓ: a HSZ fejléce „Ligaszakasz · 7/8. forduló" (nem a BL 6-os
        menetrendje), a meccs-cím is /8; a BL marad „Csoportkör · x/6";
     2. A MEZŐNY: a HSZ valódi képlete (nevezéskori ⚡ + osztály-eltolás =
        a kiírt mezőny), a ⚖ kiegyenlítés a motor saját függvényéből, a
        tényleges ⚡ = mezőny + kiegyenlítés; csapaterő és ⚡ meccs-erő is;
        kiegyenlítés nélkül nincs ⚖ sor;
     3. A KÖVETKEZŐ MECCS: az ellenfél ⚡-ja = saját + ⚖ (ezzel számol a
        motor), a tiéd = az eredményjelző ⚡-ja;
     4. A TABELLA ÉS AZ ÖSSZEGZŐ: „Ligaszakasz" címke, a valódi továbbjutási
        szabály (1–8 · 9–24 · 25–32), két sávhatár; a meccs utáni összegző
        „ligaszakasz", „Még N forduló" a 8-ból. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9243;
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
  await p.waitForFunction(()=>typeof euroCampaignEndNow==="function"&&typeof SKILLS!=="undefined",null,{timeout:15000});

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
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    const hu=v=>(Math.round(v*10)/10).toFixed(1).replace(".",",");
    const txtOf=id=>(document.getElementById(id)||{}).textContent||"";
    S.oppBuffH=10;   /* rejtett meccs-bónusz → a kiegyenlítés ennek a fele */
    S.euroCurrent="HSZ";S.euroCurrentQual=null;
    try{startEuroCampaign({skipQual:true});}catch(e){ki.startErr=String(e);}
    const E=S.euro;
    ki.comp=E.comp;ki.calc=E.hszCalc||null;ki.target=E.target;
    ki.kieg=matchHiddenOppBuff();
    /* ---- 1. A FORDULÓ ---- */
    E.md=6;
    try{renderEuroScreen();}catch(e){ki.rendErr=String(e)+" @ "+String(e.stack).split("\n").slice(1,4).join(" | ");}
    ki.head=txtOf("euroHead");
    ki.cim=euroMatchTitleFor(E);
    /* ---- 2. A MEZŐNY ---- */
    ki.vart={tenyl:hu(E.target+ki.kieg),kieg:hu(ki.kieg),ts:hu(teamStrength()),
      ms:hu(teamMatchStrength()+(pformTeamOvr()||0)),base:E.hszCalc?hu(E.hszCalc.base):null};
    /* ---- 3. A KÖVETKEZŐ MECCS ---- */
    const fxN=E.fixtures[E.idx];
    ki.next=txtOf("euroNext");
    ki.vartN=fxN&&fxN.o?{oMs:hu(fxN.o.ovr+ki.kieg),oOvr:hu(fxN.o.ovr)}:null;
    /* ---- 4. A TABELLA ÉS AZ ÖSSZEGZŐ ---- */
    ki.lbl=txtOf("euroTableLbl");
    ki.tabla=txtOf("euroTable");
    ki.vagas=document.querySelectorAll("#euroTable tr.hszCut").length;
    ki.sorok=document.querySelectorAll("#euroTable tr").length-1;
    E.path=(E.path||[]).concat([{k:"g",round:"group",md:5,opp:fxN.o.n,mine:2,theirs:1,home:true,neutral:false,oovr:fxN.o.ovr}]);
    try{ki.lab=euroLogFooterHtml().replace(/<[^>]+>/g,"");}catch(e){ki.labErr=String(e);}
    /* ---- kiegyenlítés nélkül ---- */
    S.oppBuffH=0;
    try{renderEuroScreen();}catch(e){ki.rendErr0=String(e);}
    ki.head0=txtOf("euroHead");ki.next0=txtOf("euroNext");
    /* ---- A BL VÁLTOZATLAN ---- */
    S.oppBuffH=10;
    S.euro=null;S.euroCurrent="BL";S.euroCurrentQual=null;
    try{startEuroCampaign({skipQual:true});}catch(e){ki.startErr2=String(e);}
    try{renderEuroScreen();}catch(e){ki.rendErr2=String(e);}
    ki.blHead=txtOf("euroHead");ki.blLbl=txtOf("euroTableLbl");ki.blTabla=txtOf("euroTable");
    ki.blCalc=S.euro.hszCalc||null;ki.blSorok=document.querySelectorAll("#euroTable tr").length-1;
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. A FORDULÓ —");
  ok(!r.startErr&&!r.rendErr&&r.comp==="HSZ","a HSZ-menetelés elindul, a képernyő kirajzolódik",{s:r.startErr,e:r.rendErr});
  ok(/Ligaszakasz · 7\/8\. forduló/.test(r.head)&&!/7\/6/.test(r.head),"a fejléc: „Ligaszakasz · 7/8. forduló”",r.head.slice(0,140));
  ok(/^Ligaszakasz · 7\/8\. forduló — /.test(r.cim),"a meccs-cím is /8",r.cim);
  ok(/Csoportkör · 1\/6\. forduló/.test(r.blHead),"a BL marad: „Csoportkör · 1/6. forduló”",r.blHead.slice(0,120));
  console.log("\n— 2. A MEZŐNY —");
  ok(r.calc&&r.calc.mid===r.target&&r.calc.base>0&&r.calc.src==="meres","a HSZ-számítás eltéve: a mérésből, és pontosan a kiírt mezőny",{c:r.calc,t:r.target});
  ok(new RegExp("A sorozat mezőnye: "+Math.round(r.target)+" — a nevezéskori meccs-erőd \\(⚡"+r.vart.base+"\\) [+−±]").test(r.head),"a képlet a valódi bemenettel: a nevezéskori ⚡ és az osztály-eltolás",r.head.match(/A sorozat mezőnye:[^.]*\./));
  ok(!/bajnoki szinted|élvonal szintje/.test(r.head),"a HSZ-nél nincs BL-képlet");
  ok(Math.abs(r.kieg-5)<1e-9&&r.head.includes("Nehézségi kiegyenlítés: +"+r.vart.kieg),"⚖ +5,0 — a motor saját matchHiddenOppBuff-jából (rejtett 10 fele)",{k:r.kieg});
  ok(r.head.includes("tényleges meccs-ereje tehát ⚡"+r.vart.tenyl+", nem "+Math.round(r.target)),"a tényleges ⚡ = mezőny + kiegyenlítés",{v:r.vart.tenyl});
  ok(r.head.includes("A ti csapaterőtök: "+r.vart.ts)&&r.head.includes("meccs-erőtök most: ⚡"+r.vart.ms),"a csapaterő és a meccs-erő (⚡ + 📈) is ott van",r.vart);
  ok(!/Nehézségi kiegyenlítés/.test(r.head0)&&!/⚖/.test(r.next0)&&/A sorozat mezőnye/.test(r.head0)&&!r.rendErr0,"kiegyenlítés nélkül nincs ⚖ sor");
  console.log("\n— 3. A KÖVETKEZŐ MECCS —");
  ok(r.vartN&&r.next.includes("⚡"+r.vartN.oMs+" (saját "+r.vartN.oOvr+" ⚖+"+r.vart.kieg+")"),"az ellenfél ⚡-ja = saját + ⚖",{n:r.next.slice(0,260),v:r.vartN});
  ok(r.next.includes("Ti: csapaterő "+r.vart.ts+" · ⚡"+r.vart.ms)&&/a motor a két ⚡-val számol/.test(r.next),"a tiéd: csapaterő és az eredményjelző ⚡-ja",r.next.slice(0,260));
  console.log("\n— 4. A TABELLA ÉS AZ ÖSSZEGZŐ —");
  ok(r.lbl==="Ligaszakasz"&&r.sorok===32,"32-es tabella, „Ligaszakasz” címkével",{l:r.lbl,n:r.sorok});
  ok(r.tabla.includes("1–8. egyenesen a nyolcaddöntőbe · 9–24. rájátszás · 25–32. kiesik.")&&!/első két helyezett/.test(r.tabla),"a valódi továbbjutási szabály, nem „az első két helyezett”");
  ok(r.vagas===2,"két sávhatár (8. és 24. után)",r.vagas);
  ok(/A ligaszakaszban \d+\. hely/.test(r.lab||"")&&/Még 2 forduló a ligaszakaszból\. 1–8\./.test(r.lab||""),"a meccs utáni összegző: ligaszakasz, „Még 2 forduló” a 8-ból",r.lab||r.labErr);
  ok(r.blLbl==="Csoport"&&r.blSorok===4&&/Az első két helyezett jut tovább/.test(r.blTabla)&&!r.blCalc,"a BL-tabella változatlan",{l:r.blLbl,n:r.blSorok});
  ok(/Nehézségi kiegyenlítés: \+5,0/.test(r.blHead)&&/bajnoki szinted|élvonal szintje/.test(r.blHead),"a BL is kiírja a ⚖-t, a saját képletével",r.blHead.slice(0,300));
  ok(String(r.verzio).localeCompare("3.9.200",undefined,{numeric:true})>=0,"verzió legalább 3.9.200",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
