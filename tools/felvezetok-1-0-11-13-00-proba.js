/* 🎬 1.0.11.13.00 — FELVEZETŐ-FORGATÓKÖNYVEK + ÉLŐ 3D / VISSZAJÁTSZÁS
   KÉRÉS: „Vannak bizonyos gól előtti jelenetek, amik se a passzoló, se a
   góllövő nem látszik a kijelzőn rendesen. A letámadásgól előtt nem jó […]
   Itt épp az a lényeg, hogy alapból az ellenfélnél van a labda. […] gondold
   végig az összes eddig meglévő animációt, és építs hozzájuk felvezető
   animációkat […] Plusz érdekelne, hogy ha a mostani gól animációk végei azok
   csak replay-ek (valamelyik sarokban villogó R jelezné …)".
   Amit mér:
     1. MINDEN jelenet-sablonnak (EVA_SABLON) van illő archetípusa, és az létezik;
     2. a jellegzetes párosítások: letámadás → a labda az ELLENFÉLNÉL kezd;
        csukafejes → beadás a szögletzászlótól; fejes gól → beadás; kontra →
        a labda a saját térfelünkön kezd; lap → becsúszás + játékvezető;
        szabadrúgás → 4 fős sorfal;
     3. AZ AUTOMATIKUS KÉPKIVÁGÁS: minden archetípus minden vágásában a fő
        szereplő a képen van, és nem pötty (≥ 11% képmagasság a képkockák
        95%-ában);
     4. determinizmus: ugyanaz az esemény → ugyanaz a felvezetés és vágás;
     5. visszajátszás-mód, gól: élő 3D (lövés + háló) → gólöröm → a jelenet
        villogó R-rel, utána NINCS második reakció; egy esemény = egy _evaFut;
     6. visszajátszás-mód, nem gól: nincs R;
     7. a beállítás három állású (Felvezetés → Élő + ismétlés → Ki);
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9266;
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
  /* 1–2. az archetípusok */
  const r1=await p.evaluate(()=>{
    const c0=evaKontextus({t:"gol",side:"us",p:slots[9].player.n,min:30,seq:1});
    const hiany=[];
    Object.keys(EVA_SABLON).forEach(sk=>{const ev={t:"gol",side:"us",p:slots[9].player.n,min:30,seq:1};
      const a=kamArchetipus(sk,ev,c0);if(!KAM_FORGATO[a])hiany.push(sk+"→"+a);});
    const fk=(sk,t,alt)=>{const ev={t,side:"us",p:slots[9].player.n,min:30,seq:7,alt};return kamForgatokonyv(evaKontextus(ev),ev,sk);};
    /* ki van a labdánál az elején */
    const elso=F=>{const L=F.labda[0];let best=null,bd=1e9;
      Object.keys(F.sz).forEach(k=>{const p=kamUt(F.sz[k].ut,0);const d=Math.hypot(p[1]-L[1],p[2]-L[2]);if(d<bd){bd=d;best=k;}});return best;};
    const le=fk("letamadas","letamadas"),pg=fk("evPresGol","gol"),cs=fk("skCsuka","gol"),fe=fk("gol","gol","fejes"),ko=fk("skKontra","gol"),
      lap=fk("lap","sarga"),szr=fk("szabadrugas","szabadrugas");
    const csP=kamUt(cs.sz.pa.ut,.8);
    return {n:Object.keys(EVA_SABLON).length,hiany,
      le:[le.arch,elso(le)],pg:[pg.arch,elso(pg)],cs:[cs.arch,+csP[1].toFixed(1),+Math.abs(csP[2]).toFixed(1)],fe:fe.arch,
      ko:[ko.arch,ko.labda[0][1]],lap:[lap.arch,!!lap.sz.biro,!!(lap.sz.biro&&lap.sz.biro.fig)],szr:[szr.arch,["v1","v2","v3","v4"].filter(k=>szr.sz[k]).length]};});
  ok(r1.n>=45&&!r1.hiany.length,"1. minden jelenet-sablonnak van illő, létező felvezetése",{sablon:r1.n,hiany:r1.hiany});
  /* 1.0.12.10.00: a gól nélküli letámadás saját felvezetése a 16-oson kívül (letamadasKozep) */
  ok(r1.le[0]==="letamadasKozep"&&/^v/.test(r1.le[1])&&r1.pg[0]==="letamadas"&&/^v/.test(r1.pg[1]),"2a. letámadás(-gól): a labda az ELLENFÉL védőjénél kezd",{le:r1.le,pg:r1.pg});
  ok(r1.cs[0]==="beadasSarok"&&r1.cs[1]>50&&r1.cs[2]>30&&r1.fe==="beadas","2b. csukafejes: beadás a szögletzászlótól; fejes gól: beadás",{cs:r1.cs,fe:r1.fe});
  ok(r1.ko[0]==="kontra"&&r1.ko[1]<0,"2c. kontra: a labda a saját térfelünkön kezd",r1.ko);
  ok(r1.lap[0]==="szabalytalan"&&r1.lap[2]&&r1.szr[0]==="szabad"&&r1.szr[1]===4,"2d. lap: becsúszás + játékvezető (saját figura); szabadrúgás: 4 fős sorfal",{lap:r1.lap,szr:r1.szr});
  /* 3. a képkivágás: minden archetípus végigjátszva, mérőhoroggal (a labdára
     nyitó vágásokban — kontra-ív, katapult — a fő „szereplő" a labda, azt nem mérjük) */
  const r3=await p.evaluate(async()=>{
    const archs=Object.keys(KAM_FORGATO);evaIdoSzorzo=.5;window.__kamMer=[];
    const el=evaElem();el.classList.remove("hide");const cv=el.querySelector(".evaKamVaszon");cv.classList.remove("hide");el.querySelector(".evaSzinpad").style.visibility="hidden";
    const sk0={passz:"kapufa",csel:"skElastico",beadas:"skBeadas",beadasSarok:"skCsuka",tizi:"tizenegyes",szabad:"szabadrugas",egyedul:"bravur",kiugratas:"skSebesz",
      tavoli:"skAgyu",sortuz:"skSortuz",egyensuly:"skEgyens",szinergia:"skSzin",tank:"skTank",phalanx:"skPhalanx",szaguld:"skSzaguld",tiki:"skTiki",egyketto:"skKemia",letamadas:"evPresGol",letamadasKozep:"letamadas",kontra:"skKontra",
      nagylabda:"skNagylabda",katapult:"skKatapult",vagta:"skBolt",szoglet:"szoglet",bedobas:"bedobas",busz:"evBusz",csere:"evCsere",szabalytalan:"lap",
      utkozes:"serules",var:"var",kidolgozas:"kidolgozas",vedekezes:"blokk"};
    const nincs=archs.filter(a=>!sk0[a]);
    for(const a of archs){if(!sk0[a])continue;
      const ev={t:"gol",side:"us",p:slots[9].player.n,min:30,seq:3,alt:a==="egyedul"?"ziccer":undefined};const c=evaKontextus(ev);   /* a Jéghideg 1.0.11.14.00 óta tizenegyes; az „egyedül" a ziccer-bravúré */
      if(kamArchetipus(sk0[a],ev,c)!==a&&a!=="passz"){nincs.push(a+"?");continue;}
      await new Promise(r=>kamFelvetel(cv,c,ev,"elo",r,{sk:sk0[a]}));}
    evaIdoSzorzo=1;const M=window.__kamMer;window.__kamMer=null;el.classList.add("hide");
    const per={};M.forEach(m=>{const o=per[m.arch]||(per[m.arch]={n:0,ki:0,kicsi:0,min:9});o.n++;if(!m.bent)o.ki++;if(m.h<.11)o.kicsi++;o.min=Math.min(o.min,m.h);});
    const rossz=Object.keys(per).filter(a=>(per[a].ki+per[a].kicsi)/per[a].n>.05).map(a=>a+":"+JSON.stringify(per[a]));
    return {db:Object.keys(per).length,minta:M.length,nincs,rossz,legkisebb:Object.keys(per).map(a=>a+" "+per[a].min).sort((x,y)=>parseFloat(x.split(" ")[1])-parseFloat(y.split(" ")[1])).slice(0,4)};});
  ok(r3.db>=24&&!r3.nincs.length&&!r3.rossz.length,"3. minden felvezetés minden vágásában a fő szereplő a képen, és nem pötty",r3);
  /* 4. determinizmus */
  const r4=await p.evaluate(()=>{const ev={t:"gol",side:"us",p:slots[9].player.n,min:41,seq:9};
    const a=kamForgatokonyv(evaKontextus(ev),ev,"gol"),b=kamForgatokonyv(evaKontextus(ev),ev,"gol");
    return {a:a.arch+a.tukor+JSON.stringify(a.vagas),b:b.arch+b.tukor+JSON.stringify(b.vagas)};});
  ok(r4.a===r4.b,"4. ugyanaz az esemény → ugyanaz a felvezetés és vágás",r4.a.slice(0,80));
  /* 5. visszajátszás-mód, gól */
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
  await p.evaluate(()=>kamModAllit("mindketto"));   /* 1.0.11.14.00: a régi „visszajátszás" mód = Mindkettő */
  const r5=await futas({t:"gol",side:"us",p:await p.evaluate(()=>slots[9].player.n),min:55,seq:11},15000);
  ok(JSON.stringify(r5.T)===JSON.stringify(["vaszon","szinpadR","vege"])&&r5.naplo.length===2&&/^elo:/.test(r5.naplo[0])&&r5.naplo[1]==="uto:reakcio"&&r5.egy===1,
    "5. visszajátszás-mód, gól: élő 3D → gólöröm (egy vásznon) → a jelenet R-rel → vége; nincs második reakció",r5);
  const r5b=await p.evaluate(()=>{const ev={t:"gol",side:"us",p:slots[9].player.n,min:55,seq:11};const c=evaKontextus(ev);
    const F=kamBefejezes(kamForgatokonyv(c,ev,"gol"),c,ev);const L=F.labda[F.labda.length-2];
    return {halo:!!F.halo,hang:F.hang.map(h=>h[1]),cel:[+L[1].toFixed(1),+L[2].toFixed(1),+L[3].toFixed(1)],elo3d:F.elo3d};});
  ok(r5b.halo&&r5b.hang.includes("aHalo")&&r5b.cel[0]>52&&Math.abs(r5b.cel[1])<=3.66&&r5b.cel[2]<=2.44,"5b. az élő befejezés: a labda a kapuba (a célzott cellába), háló-hang",r5b);
  /* 6. nem gól: nincs R */
  const r6=await futas({t:"kapufa",side:"us",p:await p.evaluate(()=>slots[9].player.n),min:60,seq:12},12000);
  /* 1.0.11.14.00 óta a Mindkettő minden jelenetnél ismétel (a kérés: „a régi … a teljes jelenet után jön be villogó R felirattal") */
  ok(JSON.stringify(r6.T)===JSON.stringify(["vaszon","szinpadR","vege"]),"6. Mindkettő, nem gól: 3D jelenet → a rajz R-rel",r6.T);
  /* 7. a beállítás három állása */
  const r7=await p.evaluate(()=>{const o=[];kamModAllit("mindketto");o.push(kamMod());
    kamModAllit("uj");o.push(kamMod());kamModAllit("regi");o.push(kamMod(),kamAktiv({t:"gol",side:"us",p:"X",min:1,seq:1}));
    kamModAllit("mindketto");o.push(kamMod());return o;});
  ok(JSON.stringify(r7)===JSON.stringify(["mindketto","uj","regi",false,"mindketto"]),"7. a mód: mindkettő → új → régi",r7);
  ok(!errs.length,"8. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
