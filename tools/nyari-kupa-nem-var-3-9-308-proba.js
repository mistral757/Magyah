/* 🟠 3.9.308 — A NYÁRI KUPA NEM VÁR A TÁRSRA, HA NEKI NINCS NYÁRI KUPÁJA.

   KÉRÉS: „Amikor csak egyik játékosnak van nyári kupa, akkor ne kelljen
   várakoznia a másik játékosra a kupa előtti screenen."

   Egy lap, a játék helyi szoba-hátterén (mpNet.mode="local"); a társ
   bejegyzéseit közvetlenül a szobába írjuk. Amit mér:
     1. a társ kupába nevezett (a kupanevezés bejegyzése) → igen: AZONNAL
        egyedül indul a torna, várakozó képernyő nélkül, naplósorral;
        a szobában `kulon` jelölés;
     2. ugyanez nemmel → azonnal kihagyja, várakozás nélkül;
     3. a társ épp egy másik sorozatot játszik (🛰 helyzetjelző) → azonnal;
     4. nincs semmi jel → a régi út: a várakozó képernyő megjelenik; és ha
        közben a társ kupát kezd, a kapu a következő körben magától továbbenged;
     5. a társ nyári nevezése már fent van → a rendes közös út (nem „külön");
     6. a később érkező társ: a `kulon` jelölés mellett ő is egyedül indul
        (igennél), nemnél kihagy — senki nem vár senkire;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9308;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
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
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  /* közös karrier a helyi szobában; a torna indítását és a mentést elkapjuk */
  await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[1];
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
    window.saveGame=()=>{};phase="season";S.seasonClosed=true;S.seasonNumber=3;
    S.finalTable=[{you:true,n:"MAGYAH XI"}];   /* a felajánlhatósághoz: lezárt idény */
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){try{window._nlog.push(String(t));}catch(e){}return al.apply(this,arguments);};
    MP.active=true;MP.role="host";
    window.startEuroCampaign=()=>{window._indult=(window._indult||0)+1;};
    window._next=0;});

  /* egy forgatókönyv: új szoba, a társ bejegyzései, aztán a döntés */
  const fut=(nev,yes,tars)=>p.evaluate(async([nev,yes,tars])=>{
    try{mpGateAbort("nyk");}catch(e){}try{h2hWaitHide();}catch(e){}
    MP.activeRoom="NYK"+nev;S.friendlyCupSeason=0;S.friendlySolo=0;S.euroCurrent=null;S.euro=null;
    {const r=mpLRooms();const rec=mpNewRoomRecord();rec.code=MP.activeRoom;r[MP.activeRoom]=rec;mpLSave(r);}
    window._indult=0;window._next=0;
    const sn=S.seasonNumber;
    for(const [k,v] of Object.entries(tars||{}))await mpBk().h2hPut(MP.activeRoom,"s"+sn+k,"guest",v);
    window._nlog=[];
    friendlyCupSettle(yes,()=>{window._next++;});
    await new Promise(r=>setTimeout(r,700));
    const w=$("h2hWait");
    const varo=!!(w&&!w.classList.contains("hide"));
    const node=await mpBk().h2hGet(MP.activeRoom,"s"+sn+"nyk");
    const sorok=window._nlog.map(t=>t.replace(/<[^>]+>/g,""));
    return {varo,indult:window._indult,next:window._next,solo:S.friendlySolo,nyk:S.euroCurrent,
      sajat:node&&node.host,napló:sorok.find(t=>/Nem kell a társadra várnod/.test(t))||null};},[nev,yes,tars]);

  console.log("— 1. a társ kupába nevezett · igen —");
  const r1=await fut("A",true,{cup:{comp:"EL",qual:false,at:1,v:"x"}});
  ok(!r1.varo,"nincs várakozó képernyő",r1.varo);
  ok(r1.indult===1&&r1.nyk==="NYK"&&r1.solo===3,"a torna azonnal, egyedül indul (S.friendlySolo)",{indult:r1.indult,nyk:r1.nyk,solo:r1.solo});
  ok(r1.sajat&&r1.sajat.kulon&&r1.sajat.solo&&r1.sajat.yes,"a szobában „külön nyár” jelölés (igen, egyedül)",r1.sajat);
  ok(r1.napló&&/Ojrópai|Európa|EL|indulója/.test(r1.napló),"a napló kimondja, miért nem várunk",r1.napló);

  console.log("— 2. ugyanez · nem —");
  const r2=await fut("B",false,{cup:{comp:"BL",qual:true,at:1,v:"x"}});
  ok(!r2.varo&&r2.indult===0&&r2.next===1,"azonnal kihagyja és továbblép, várakozás nélkül",r2);
  ok(r2.sajat&&r2.sajat.kulon&&!r2.sajat.yes,"a szobában „külön nyár” jelölés (nem)",r2.sajat);

  console.log("— 3. a társ épp másik sorozatot játszik —");
  const r3=await fut("C",true,{pos:{comp:"KL",pi:0,at:1,v:"x"}});
  ok(!r3.varo&&r3.indult===1,"a 🛰 helyzetjelzőből: azonnal indul",r3);
  ok(/Konf|KL|meccseit/.test(r3.napló||""),"…és a napló a sorozatot nevezi meg",r3.napló);

  console.log("— 4. nincs jel → a régi várakozás; közben a társ kupát kezd —");
  const r4=await fut("D",true,{});
  ok(r4.varo&&r4.indult===0,"jel nélkül a várakozó képernyő megjelenik (a régi út)",r4);
  const r4b=await p.evaluate(async()=>{
    await mpBk().h2hPut(MP.activeRoom,"s"+S.seasonNumber+"pos","guest",{comp:"BL",pi:0,at:Date.now(),v:"x"});
    await new Promise(r=>setTimeout(r,4200));
    const w=$("h2hWait");
    const node=await mpBk().h2hGet(MP.activeRoom,"s"+S.seasonNumber+"nyk");
    return {varo:!!(w&&!w.classList.contains("hide")),indult:window._indult,kulon:!!(node&&node.host&&node.host.kulon)};});
  ok(!r4b.varo&&r4b.indult===1&&r4b.kulon,"a kapu a következő körben magától továbbenged (külön nyár)",r4b);

  console.log("— 5. a társ nyári nevezése már fent → közös út —");
  const r5=await fut("E",true,{nyk:{yes:true,offer:true,at:1,teamName:"Társ FC",ovr:80,str:80,v:"x"},cup:{comp:"EL",at:1}});
  ok(r5.indult===1&&r5.solo===0&&!(r5.sajat&&r5.sajat.kulon),"a már fent lévő nevezésnél nem „külön” — a rendes közös döntés",{solo:r5.solo,sajat:r5.sajat});

  console.log("— 6. a később érkező társ —");
  const r6=await p.evaluate(()=>({
    igen:mpNykResolve({yes:true,offer:true},{yes:false,kulon:true}),
    nem:mpNykResolve({yes:false,offer:true},{yes:true,kulon:true,solo:true}),
    regi:mpNykResolve({yes:true,offer:true},{yes:true,offer:true})}));
  ok(r6.igen&&r6.igen.solo&&r6.nem===null&&r6.regi&&r6.regi.yes,"a „külön” jelölés mellett a későn jövő igen → egyedül, nem → kihagy; a régi közös út változatlan",r6);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
