/* 🧮 A CÉLRÉS-ABLAK: MIÉRT NEM A MOSTANI ⚡ − CÉLRÉS (3.9.358).

   BEJELENTÉS: „Ha én most -0.1et állítok, akkor a mezőny ereje 135.2-re
   kellene hogy álljon... Vagy itt a 126.1 az egy olyan érték, amihez majd még
   hozzájön az ellenfél kiegyenlítő erőnövelése? Ha igen, akkor oké, de ne ez
   legyen már kiírva..."

   Amit mér:
     1. a becslés mezőny-száma a VÉGSŐ (⚖-tel együtti) szám: a súlyozott ⚡ −
        a rajt-cél, a bejelentett számokkal (135,1 indító, 114,7 záró, −0,1);
     2. az ablak kiírja a súlyozás bontását (a 135,2-t, amit várnál, a
        súlyozott ⚡-ot, a nyári fejlődést és a megmaradó részt);
     3. záró ⚡ nélkül (nincs súlyozás) a magyarázat nem jelenik meg;
     4. nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9358;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi egyjátékos karrier, az 1. idény ELEJÉN ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  const alap=await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    return {idx:S.idx};});


  const r=await p.evaluate(()=>{const o={};
    const _pl=pyrLevel;pyrLevel=()=>60;   /* a természetes szint ne szóljon bele */
    const _r=mpCelresRajt;mpCelresRajt=c=>Math.round((c-(-0.1)/2)*100)/100;   /* rajt = cél − dg/2, dg = −0,1 */
    const en={ms:135.1,mz:114.7,hid:6.2};
    const T={ms:en.ms,mz:en.mz,hid:en.hid,rajt:mpCelresRajt(-0.1)};
    const b=mpCelresBecsles(en,T,-0.1,-0.1,{elore:false,rel:false});
    o.b=b;o.vart=Math.round((mpMsSuly(135.1,114.7)-T.rajt)*10)/10;
    o.html=celresLenyegHtml(b,en,null,"");
    const en2={ms:135.1,mz:null,hid:6.2};
    const b2=mpCelresBecsles(en2,Object.assign({},en2,{rajt:T.rajt}),-0.1,-0.1,{elore:false,rel:false});
    o.mezo2=b2.mezo;o.html2=celresLenyegHtml(b2,en2,null,"");
    pyrLevel=_pl;mpCelresRajt=_r;return o;});
  ok(Math.abs(r.b.mezo-r.vart)<0.06&&Math.abs(r.b.mezo-125)<0.11,"a mezőny-szám a súlyozott ⚡ − rajt-cél (3.9.358-ban a bejelentett 126,1; 3.9.359 óta fele-fele: ~125,0), a ⚖ már benne",{mezo:r.b.mezo,vart:r.vart,wE:r.b.wE});
  ok(/Miért nem ~135,2/.test(r.html)&&/\+20,4/.test(r.html)&&/50%/.test(r.html)&&/nyárzáró értékelés utáni/.test(r.html)&&/rá már nem jön semmi/.test(r.html),
    "az ablak kiírja a bontást: 135,2 helyett a súlyozott, a nyári +20,4 fele (50%) a tiéd",null);
  ok(Math.abs(r.mezo2-135.2)<0.06&&!/Miért nem/.test(r.html2),"záró ⚡ nélkül a mezőny a mostani ⚡ − célrés, magyarázat nélkül",{mezo2:r.mezo2});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
