/* 🧲 A MÁSODLAGOS FILOZÓFIA MECCSERŐ-SZINTJE MEGVEHETŐ (3.9.143).

   BEJELENTETT HIBA: „nem lehet megvenni továbbra sem a másodlagos meccserő
   növelőjét. Rányomok és nem veszi el a pénzt. Pedig meg van a keret."

   AZ OK: a motor-szakasz „Megveszem" gombja paraméter nélkül hívta az
   engBuyLevel()-t, az pedig az ELSŐDLEGES motorra (engKey) nézett. A piac
   gombjai 3.9.131 óta a NÉZETT stílus gazdaságából fizetnek — a szintvásárló
   gomb ebből kimaradt.

   Amit mér — a VALÓDI szakaszt rajzolja ki és köti be, a VALÓDI gombot nyomja:
     1. másodlagos Gegen nézetében a gomb a GEGEN szintjét veszi meg, a GEGEN
        pontjaiból — ha az elsődlegesnek (Villám) nincs pontja;
     2. …és akkor is, ha az elsődlegesnek VAN pontja: a Villám szintje és
        pontja érintetlen marad (a régi kód ilyenkor a rosszat vette volna);
     3. az elsődleges nézetében a gomb továbbra is az elsődlegest veszi;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9163;
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
  await p.waitForFunction(()=>typeof engSectionBind==="function",null,{timeout:15000});

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
    phase="season";S.seasonNumber=3;
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("villam");S.style2=mk("gegen");
    const _sl=styleLevel;window.styleLevel=()=>10;
    const _rsp=renderStylePanel;window.renderStylePanel=()=>{};
    const Eg=engState("gegen"),Ev=engState("villam");
    const ar=engNextPrice("gegen");
    /* a valódi szakasz, a valódi bekötéssel, a valódi gombbal */
    const nyom=(nezet,kulcs)=>{
      styleViewSet(nezet);
      const div=document.createElement("div");
      div.innerHTML=engSectionHtml(kulcs);
      document.body.appendChild(div);
      engSectionBind(div);
      const btn=div.querySelector("#engBuyLvl");
      const allapot={van:!!btn,tiltott:btn?btn.disabled:null,szoveg:btn?btn.textContent:""};
      if(btn&&!btn.disabled)btn.click();
      div.remove();
      return allapot;};
    try{
      /* 1. az elsődlegesnek nincs pontja */
      Eg.pts=ar+50;Eg.lvl=0;Ev.pts=0;Ev.lvl=0;
      ki.gomb1=nyom(2,"gegen");
      ki.eset1={gLvl:Eg.lvl,gPts:Eg.pts,vLvl:Ev.lvl,vPts:Ev.pts,ar};
      /* 2. az elsődlegesnek VAN pontja: a régi kód azt vette volna meg */
      Eg.pts=ar+50;Eg.lvl=0;Ev.pts=5000;Ev.lvl=0;
      ki.gomb2=nyom(2,"gegen");
      ki.eset2={gLvl:Eg.lvl,gPts:Eg.pts,vLvl:Ev.lvl,vPts:Ev.pts};
      /* 3. az elsődleges nézetében az elsődleges */
      Eg.pts=ar+50;Eg.lvl=0;Ev.pts=5000;Ev.lvl=0;
      nyom(1,"villam");
      ki.eset3={gLvl:Eg.lvl,vLvl:Ev.lvl,vPts:Ev.pts,var:5000-engNextPrice("villam")};
    }finally{window.styleLevel=_sl;window.renderStylePanel=_rsp;}
    return ki;});
  console.log("\n— A MÁSODLAGOS MOTOR SZINTVÁSÁRLÁSA —");
  ok(r.gomb1.van&&!r.gomb1.tiltott,"a másodlagos Gegen szakaszában a gomb aktív (van keret)",r.gomb1);
  ok(r.eset1.gLvl===1&&r.eset1.gPts===50&&r.eset1.vLvl===0,"a koppintás a GEGEN szintjét veszi meg, a GEGEN pontjaiból",r.eset1);
  ok(r.eset2.gLvl===1&&r.eset2.vLvl===0&&r.eset2.vPts===5000,"akkor is, ha az elsődlegesnek van pontja — a Villám érintetlen",r.eset2);
  ok(r.eset3.vLvl===1&&r.eset3.gLvl===0,"az elsődleges nézetében a gomb az elsődlegest veszi",r.eset3);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
