/* 🎬 1.0.11.14.00 — A TELJES 3D JELENET (a régi jelenetek új változata) + RÉGI / ÚJ / MINDKETTŐ
   KÉRÉS: „Nagyon elütnek a régi animációk a mostani izgalmas újaktól.
   Próbáljuk már meg azt, hogy legyen mindegyik mostani fő régi animációnkra
   egy új verzió is. Amiben látszik minden infó, ami a régin, lehetőleg jól
   látható a gól, hova ment be, stb. És akkor legyen az, hogy az animációknak
   legyen egy beállítása, ahol ki lehet választani, hogy teljesen a régi,
   teljesen az új, vagy egyszerre a kettő, amiben a régi mintegy
   visszajátszásként a teljes jelenet után jön be villogó R felirattal".
   Amit mér:
     1. a 3D kimenetel ugyanaz, amit a régi jelenet mutat (gól, kapufa, védés,
        megfogja, mellé, blokk, gólvonal, szerelés, tisztázás, lap színe,
        sérülés, VAR, busz) — eseménytípusonként és alváltozatonként;
     2. a gól a CÉLZOTT CELLÁBA megy: mind a 32 cellára az oszlop → oldal, a
        sor → magasság sorrendje egyezik a régi célrácséval, a labda a kapun belül;
     3. a régi jelenet infói a képen: a célrács a célzott cellával (piros), a
        mérés (sárga), a lap (sárga/piros) — a vászon pixeleiből;
     4. az „Új" mód: csak a 3D (vászon → vége, a rajz nem indul), a felirat
        a csúcsponton megjelenik; a döntő pillanat hangja egyszer szól (a 3D
        jelenet hálójánál), a Mindkettő ismétlése nem szólaltatja meg újra;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9267;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben, vágjunk/.test(x.textContent)).forEach(x=>x.click());});await p.waitForTimeout(600);
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  await p.evaluate(()=>{[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/Ne mutass több/.test(x.textContent)).forEach(x=>x.click());
    mevKezd({});_mev.keret=8;_mev.anim=true;});
  const futas=async(ev,ido)=>p.evaluate(async([ev,ido])=>{
    _kamNaplo.length=0;evaIdoSzorzo=.5;const T=[];let elozo="";const Fs=new Set();let t0=performance.now();
    const el=evaElem();
    evaKer(Object.assign({sor:"x"},ev));
    await new Promise(r=>setTimeout(r,60));
    await new Promise(res=>{const lep=()=>{const cv=el.querySelector(".evaKamVaszon"),svg=el.querySelector(".evaSzinpad");
      if(_evaFut)Fs.add(_evaFut);
      const fut=!!_evaFut;const vasz=cv&&!cv.classList.contains("hide");const R=el.classList.contains("evaReplayOn");
      const all=!fut?"vege":vasz?"vaszon":(R?"szinpadR":"szinpad");
      if(all!==elozo){T.push(all);elozo=all;}
      if(!fut||performance.now()-t0>ido){res();return;}setTimeout(lep,40);};lep();});
    evaIdoSzorzo=1;
    const Rlat=getComputedStyle(el.querySelector(".evaReplay")).display;
    return {T,naplo:_kamNaplo.slice(),egy:Fs.size,Rlat};},[ev,ido]);
  const nev=await p.evaluate(()=>slots[9].player.n);
  /* 1. kimenetelek */
  const r1=await p.evaluate(()=>{
    const E=[["gol","gol",""],["kapufa","kapufa",""],["bravur","bravur",""],["bravur","vedes",""],["tizenegyes","tizenegyes","kivedve"],["tizenegyes","tizenegyes","kapufa"],
      ["tizenegyes","tizenegyes","gol"],["loves","loves",""],["loves","loves","vedve"],["loves","loves","blokkolva"],["blokk","golvonal",""],["skTorghelle","szereles",""],
      ["szoglet","szoglet","tisztazas"],["lap","sarga",""],["lap","piros",""],["serules","serules",""],["var","var",""],["evBusz","busz",""],["evOngol","gol","ongol"],["letamadas","letamadas",""]];
    const o={};
    E.forEach(([sk,t,alt],i)=>{const ev={t,side:"us",p:slots[9].player.n,min:20+i,seq:i+1,alt:alt||undefined};const c=evaKontextus(ev);
      const F=kamKimenetel(kamForgatokonyv(c,ev,sk),c,ev,sk);const Lv=F.labda[F.labda.length-1];const h=F.hang.map(x=>x[1]);
      const jel=[];if(F.halo)jel.push("halo");if(F.kapufa)jel.push("fem");if(h.includes("aKesztyu"))jel.push("kesztyu");if(h.includes("aTompa"))jel.push("tompa");
      if(F.kartya)jel.push("lap:"+F.kartya.szin);if(F.orvos)jel.push("orvos");if(F.var&&F.monitor)jel.push("var");if(F.busz)jel.push("busz");
      if(F.racs)jel.push("racs:"+F.racs.fajta);
      const kint=Lv[1]<52.4||Math.abs(Lv[2])>3.66||Lv[3]>2.44;
      o[sk+"|"+t+"|"+alt]={kim:F.kim,jel:jel.join(","),kint,mono:F.labda.every((p,j)=>!j||p[0]>=F.labda[j-1][0]),vag:F.vagas.every((v,j)=>!j||v.ig>F.vagas[j-1].ig)};});
    return o;});
  const V={"gol|gol|":["gol","halo",false],"kapufa|kapufa|":["kapufa","fem",true],"bravur|bravur|":["vedes","kesztyu",true],"bravur|vedes|":["fog","racs:fog",true],
    "tizenegyes|tizenegyes|kivedve":["vedes","kesztyu",true],"tizenegyes|tizenegyes|kapufa":["kapufa","fem",true],"tizenegyes|tizenegyes|gol":["gol","halo",false],
    "loves|loves|":["melle","racs:melle",true],"loves|loves|vedve":["vedes","kesztyu",true],"loves|loves|blokkolva":["blokk","tompa",true],
    "blokk|golvonal|":["golvonal","tompa",true],"skTorghelle|szereles|":["szereles","tompa",true],"szoglet|szoglet|tisztazas":["tisztazas","",true],
    "lap|sarga|":["lap","lap:#ffd400",true],"lap|piros|":["lap","lap:#d0021b",true],"serules|serules|":["serules","orvos",true],"var|var|":["var","var",true],
    "evBusz|busz|":["busz","busz",true],"evOngol|gol|ongol":["ongol","halo",false],"letamadas|letamadas|":["labdaszerzes","",true]};
  const rossz=Object.keys(V).filter(k=>{const x=r1[k],v=V[k];return !x||x.kim!==v[0]||(v[1]&&x.jel.split(",").indexOf(v[1])<0)||(v[0]==="gol"||v[0]==="ongol"?x.kint:false)||!x.mono||!x.vag;});
  ok(!rossz.length,"1. a 3D kimenetel = a régi jelenet kimenetele (20 eset: gól, kapufa, védés, megfogja, mellé, blokk, gólvonal, szerelés, tisztázás, lap színe, sérülés, VAR, busz, öngól)",rossz.length?rossz.map(k=>k+"→"+JSON.stringify(r1[k])):Object.keys(r1).length);
  /* 2. a 32 cella */
  const r2=await p.evaluate(()=>{const ev={t:"gol",side:"us",p:slots[9].player.n,min:33,seq:4};const c=evaKontextus(ev);const o=[];
    for(let row=0;row<4;row++)for(let col=0;col<8;col++){c.cel=Object.assign(evaRacsKozep(col,row),{fajta:"gol"});
      const F=kamKimenetel(kamForgatokonyv(c,ev,"gol"),c,ev,"gol");const G=F.labda.find(p=>Math.abs(p[0]-F.halo.t)<1e-6);o.push({col,row,y:G&&G[2],z:G&&G[3],x:G&&G[1]});}
    return o;});
  const sorOk=[0,1,2,3].every(row=>{const s=r2.filter(x=>x.row===row);return s.every((x,i)=>!i||x.y<s[i-1].y);});
  const oszOk=[...Array(8).keys()].every(col=>{const s=r2.filter(x=>x.col===col);return s.every((x,i)=>!i||x.z<s[i-1].z);});
  const bent=r2.every(x=>x.x>52.4&&Math.abs(x.y)<3.66&&x.z>0&&x.z<2.44);
  ok(sorOk&&oszOk&&bent,"2. a gól a célzott cellába: oszlop → oldal, sor → magasság, mind a 32 a kapun belül",{sorOk,oszOk,bent,minta:r2.filter((x,i)=>i%9===0)});
  /* 3. a HUD a vásznon (pixelek) */
  const r3=await p.evaluate(async()=>{
    const el=evaElem();el.classList.remove("hide");const cv=el.querySelector(".evaKamVaszon");cv.classList.remove("hide");el.querySelector(".evaSzinpad").style.visibility="hidden";
    const szam=(fn)=>{const g=cv.getContext("2d"),W=cv.width,H=cv.height;const d=g.getImageData(0,0,W,H).data;const o={pirosJA:0,sargaJF:0,sarga:0,piros:0};
      for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4,r=d[i],gg=d[i+1],b=d[i+2];
        const piros=r>150&&gg<70&&b<70&&r>2.5*gg,sarga=r>200&&gg>170&&b<130;
        if(piros){o.piros++;if(x>W/2&&y>H/2)o.pirosJA++;}if(sarga){o.sarga++;if(x>W/2&&y<H/2)o.sargaJF++;}}return o;};
    const fut=(ev,sk)=>new Promise(r=>{const c=evaKontextus(ev);let k=null;k=kamFelvetel(cv,c,ev,"elo",()=>{},{sk,teljes:true});
      setTimeout(()=>{const o=szam();k.stop();r(o);},k.ms-60);});
    evaIdoSzorzo=.6;
    const gol=await fut({t:"gol",side:"us",p:slots[9].player.n,min:44,seq:8,meres:{fajta:"loves",ert:118}},"gol");
    const lap=await fut({t:"sarga",side:"us",p:slots[5].player.n,min:45,seq:9},"lap");
    const piros=await fut({t:"piros",side:"us",p:slots[5].player.n,min:46,seq:10},"lap");
    evaIdoSzorzo=1;el.classList.add("hide");
    return {gol,lap,piros};});
  ok(r3.gol.pirosJA>20&&r3.gol.sargaJF>20&&r3.lap.sarga>r3.piros.sarga&&r3.piros.piros>r3.lap.piros,"3. a képen: a célrács a piros cellával (jobb alsó), a mérés (jobb felső, sárga), a lap színe",r3);
  /* 4. az Új mód és a döntő pillanat hangja */
  /* a döntő pillanat hangja csak „nézett" meccsen szól — a próbában bekapcsoljuk, és számoljuk a gól-hangot */
  await p.evaluate(()=>{window.hangMeccsNezett=()=>true;const h0=window.hang;window._golHang=0;
    window.hang=function(id){if(id==="gol")window._golHang++;try{return h0.apply(this,arguments);}catch(e){}};kamModAllit("uj");});
  const r4=await futas({t:"gol",side:"us",p:nev,min:70,seq:21},14000);
  const g4=await p.evaluate(()=>{const n=window._golHang;window._golHang=0;return n;});
  ok(JSON.stringify(r4.T)===JSON.stringify(["vaszon","vege"])&&r4.naplo.length===2&&g4===1,"4a. Új: csak a 3D jelenet + gólöröm, a rajz nem indul; a gól hangja egyszer szól",{T:r4.T,naplo:r4.naplo,golHang:g4});
  await p.evaluate(()=>kamModAllit("mindketto"));
  const r4c=await futas({t:"gol",side:"us",p:nev,min:72,seq:22},16000);
  const g4c=await p.evaluate(()=>window._golHang);
  ok(JSON.stringify(r4c.T)===JSON.stringify(["vaszon","szinpadR","vege"])&&g4c===1,"4b. Mindkettő: 3D → a rajz R-rel; a gól hangja az ismétlésben nem szól újra (összesen egyszer)",{T:r4c.T,golHang:g4c});
  const r4d=await p.evaluate(()=>{kamModAllit("uj");const ev={t:"kapufa",side:"us",p:slots[9].player.n,min:73,seq:23};
    evaKer(ev);return new Promise(r=>setTimeout(()=>{const o=parseFloat(getComputedStyle(document.querySelector("#evAnim .evaCim")).opacity);evaLezar();kamModAllit("mindketto");r(o);},2600));});
  ok(r4d>.9,"4c. Új: a feliratsáv (a régi jelenet címe, perc, név) a 3D jelenet csúcspontján megjelenik",r4d);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
