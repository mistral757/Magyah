/* 🧿 TALIZMÁNOK F4b — A JOKER ESEMÉNYCSOMAGJAINAK ESEMÉNYEI (3.9.145).

   KIMONDOTT KÉRÉS: „új események, amik bekerülhetnek az átigazolási esemény
   pakliban […] mindig van benne 2 új jó és egy új rossz."

   Amit mér:
     1. SEMLEGES: talizmán (és csomag) nélkül a pakli üres, a bér-, fejlődés-
        és pályazár-olvasó semleges;
     2. A PAKLI: csak a működő, idén még ki nem jött események, a ritkaság
        súlyával; a még nem működő (Igazgatósági ülés) nem húzható;
     3. A VALÓDI SORSOLÁS (twResolvePhase2) kilenc azonnali eseménnyel —
        mindegyik a várt nyomot hagyja (kor, forma, új ifi, pénz, tábor,
        fáradtság, mámor, bírság, sérülés, pályazár, botrány → elvágyódás-alku);
        egy esemény idényenként egyszer; ha nincs kire lesújtania, nem ég el;
     4. A HÍRNÉV-MÁMOR a meccsek során: −30% fejlődés, 3 meccs a padon kigyógyít;
     5. A PÁLYAZÁR: zárt kapus meccsen nincs lelátó-bevétel, és fogy;
     6. DÖNTÉSEK a valódi képernyőn (showTalEsemeny): legenda, tékozló fiú,
        csábítás (mindkét ág), ügynökháború (mindkét ág); a nem választható
        gomb tiltva, az ok kiírva;
     7. A KÉZI ABLAK (twStartPhase2 → land) és az AUTOMATIKUS ABLAK
        (autoResolveCheckpoint) is a talizmán-eseményt adja;
     8. A MENÜ és a LAP: ✓ idén már kijött, ⏳ később kapcsol be, a futó
        hatások (mámor, pályazár, bér);
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9169;
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
  await p.waitForFunction(()=>typeof talEsemenyPakli==="function",null,{timeout:15000});

  await p.evaluate(()=>{
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
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);
      e.age=26;sl.player.age=26;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;
    addLine=()=>{};   /* a napló itt zaj — a próba az állapotot méri */
    window._pakli=ids=>{
      S.tal=null;const T=talState();
      ids.forEach(id=>{T.esemenyek[id]={szezon:3,suly:1,uid:1};});
      return T;};
    /* a valódi sorsolás, a hátsó sávra kényszerítve: a TRANSFER_TYPES súlya
       nulla, a véletlen 0,99 — így a pakli egyetlen eseménye jön ki */
    window._sorsol=()=>{
      const regi=TRANSFER_TYPES.map(t=>t.weight),_r=Math.random;
      TRANSFER_TYPES.forEach(t=>{t.weight=0;});
      Math.random=()=>0.99;
      try{return twResolvePhase2();}
      finally{Math.random=_r;TRANSFER_TYPES.forEach((t,i)=>{t.weight=regi[i];});}};
    window._xi=()=>slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);});

  /* ---- 1. SEMLEGES ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    S.tal=null;
    ki.ures=talEsemenyPakli().length;
    ki.talNincs=!S.tal;           /* a pakli-olvasó NEM hozza létre az állapotot */
    talState();                    /* talizmán-állapot, de csomag nélkül */
    ki.csomagNelkul=talEsemenyPakli().length;
    const x=_xi()[1];
    ki.olvasok=[talMamorDev(x.n),talBerSzorzo(x.n),talPalyazarAktiv()];
    ki.forras=/\.concat\(_talEs\)\);/.test(twResolvePhase2.toString());
    return ki;});
  console.log("\n— 1. SEMLEGES —");
  ok(n.ures===0&&n.talNincs&&n.csomagNelkul===0,"talizmán és csomag nélkül a pakli üres, és az olvasás nem hoz létre állapotot",n);
  ok(n.olvasok.join()==="1,1,false","a fejlődés-, a bér- és a pályazár-olvasó semleges",n.olvasok);
  ok(n.forras,"a pakli a hátsó sáv tömbjének VÉGÉRE fűződik (üresen a sorsolás betűre a régi)");

  /* ---- 2. A PAKLI ---- */
  const pk=await p.evaluate(()=>{
    const ki={};
    const T=_pakli(["fiatalodas","hirnevmamor","igazgatosag"]);
    T.esemenyek.fiatalodas.suly=2;
    ki.elotte=talEsemenyPakli().map(x=>x.tal+":"+x.weight);
    T.esemenyek.fiatalodas.utolso=3;
    ki.utana=talEsemenyPakli().map(x=>x.tal);
    ki.mukodik=["igazgatosag","szponzor","sztarvilag"].map(talEsemenyMukodik)
      .concat(["fiatalodas","edzotabor","nyiltnap","turne","legendakopog","tekozlo","hirnevmamor","botrany",
               "csabitas","ado","ugynokhaboru","edzessereules","palyazar"].map(talEsemenyMukodik));
    return ki;});
  console.log("\n— 2. A PAKLI —");
  ok(pk.elotte.join()==="fiatalodas:2,hirnevmamor:1","a működő események a súlyukkal; az Igazgatósági ülés (még nem működik) kimarad",pk.elotte);
  ok(pk.utana.join()==="hirnevmamor","ami idén már kijött, az idényre kiesik",pk.utana);
  ok(pk.mukodik.slice(0,3).every(x=>!x)&&pk.mukodik.slice(3).every(x=>x),"13 esemény működik, 3 (igazgatóság, szponzor, sztárvilág) az F4c-ben",pk.mukodik);

  /* ---- 3. A VALÓDI SORSOLÁS — AZONNALI ESEMÉNYEK ---- */
  const az=await p.evaluate(()=>{
    const ki={};
    const xi=_xi();
    /* ⏳ fiatalodás: nincs 32 fölötti → nem jön ki, és nem ég el */
    let T=_pakli(["fiatalodas"]);
    const r0=_sorsol();
    ki.nincsJelolt={cim:r0.title,utolso:T.esemenyek.fiatalodas.utolso||null};
    const leg=xi[2],e=careerPool[leg.n];
    e.age=34;leg.age=34;e.startRating=80;e.peak=84;e.retirePlan=4;
    S.careerStats=S.careerStats||{};S.careerStats[leg.n]={matches:20,min:1500};
    const r1=_sorsol();
    ki.fiatal={cim:r1.title,kor:e.age,roster:leg.age,rating:e.startRating,terv:e.retirePlan||null,
      utolso:T.esemenyek.fiatalodas.utolso,
      kovRating:(()=>{const c=JSON.parse(JSON.stringify(e));careerAgeStepCore(c,false);return c.startRating;})()};
    /* ⛰️ edzőtábor */
    S.nextMatchOvr={};_pakli(["edzotabor"]);
    const r2=_sorsol();
    ki.tabor={cim:r2.title,forma:xi.map(p=>(S.nextMatchOvr[p.n]||{}).amt+"/"+(S.nextMatchOvr[p.n]||{}).matches)};
    /* 🚪 nyílt nap */
    const ifi=xi[5],ie=careerPool[ifi.n];ie.age=18;ifi.age=18;ie.pot=5000;
    const maxPot=Math.max(0,...fullCareerRoster().filter(p=>careerPool[p.n]&&careerPool[p.n].age<=19).map(p=>careerPool[p.n].pot||0));
    const db0=extraRoster.length;_pakli(["nyiltnap"]);
    const r3=_sorsol();
    const uj=extraRoster[extraRoster.length-1];
    ki.nyilt={cim:r3.title,db:extraRoster.length-db0,kor:uj&&careerPool[uj.n].age,pot:uj&&careerPool[uj.n].pot,maxPot};
    /* ✈️ túra */
    S.transferBudget=1000;S.teamMomentum=null;
    const fb=fanBase(),het=fanWeeklyIncome();_pakli(["turne"]);
    const r4=_sorsol();
    ki.turne={cim:r4.title,penz:S.transferBudget-1000,het,fb,fbUtana:fanBase(),lendulet:S.teamMomentum};
    /* 🥂 hírnév-mámor */
    const fi=xi[3],fe=careerPool[fi.n];fe.age=19;fi.age=19;fe.pot=9999;
    _pakli(["hirnevmamor"]);
    const r5=_sorsol();
    ki.mamor={cim:r5.title,n:(talState().esHat.mamor||{}).n===fi.n,dev:talMamorDev(fi.n),mas:talMamorDev(xi[4].n)};
    /* 🧾 adó */
    S.transferBudget=10000;_pakli(["ado"]);
    const r6=_sorsol();
    ki.ado={cim:r6.title,budzse:S.transferBudget,ledger:(ledgerSum().rows.find(x=>x.k==="talEsemenyKi")||{}).v||0};
    /* 🩹 edzés-sérülés */
    const best=xi.slice().sort((a,b)=>pOvr(b)-pOvr(a))[0];
    delete S.unavailable[best.n];_pakli(["edzessereules"]);
    const r7=_sorsol();
    ki.serules={cim:r7.title,u:S.unavailable[best.n]||null};
    delete S.unavailable[best.n];
    /* 🔒 pályazár */
    _pakli(["palyazar"]);
    const r8=_sorsol();
    ki.palya={cim:r8.title,db:talState().esHat.palyazar,aktiv:talPalyazarAktiv()};
    /* 📸 botrány → az elvágyódás alkuja */
    S.morale=60;_pakli(["botrany"]);
    const r9=_sorsol();
    ki.botrany={cim:r9.title,pre:!!(r9.pre&&/Kiszivárgott/.test(r9.pre.txt)),cand:!!r9.cand,morale:S.morale};
    return ki;});
  console.log("\n— 3. A VALÓDI SORSOLÁS — AZONNALI ESEMÉNYEK —");
  ok(/Csendes/.test(az.nincsJelolt.cim)&&az.nincsJelolt.utolso===null,"ha nincs kire lesújtania, nem jön ki, és nem ég el az idényre",az.nincsJelolt);
  ok(/ifjúság forrása/.test(az.fiatal.cim)&&az.fiatal.kor===24&&az.fiatal.roster===24&&az.fiatal.rating===80&&az.fiatal.terv===null&&az.fiatal.utolso===3,
     "⏳ a 34 éves legenda 24 éves lesz (a keretben is), a Rating marad, a visszavonulási terv elszáll",az.fiatal);
  ok(az.fiatal.kovRating>=80,"…és a következő szezonváltásnál sem esik: a görbe 24 évesen újra a csúcs felé visz (a youthBonus fogja az átmenetet)",az.fiatal.kovRating);
  ok(/Edzőtábor/.test(az.tabor.cim)&&az.tabor.forma.every(x=>x==="2/5"),"⛰️ a kezdő 11 mind +2 Rating formában, 5 meccsre",az.tabor.forma);
  ok(/Nyílt nap/.test(az.nyilt.cim)&&az.nyilt.db===1&&az.nyilt.kor===16&&az.nyilt.maxPot>=5000&&az.nyilt.pot>az.nyilt.maxPot,"🚪 egy 16 éves érkezik ingyen, nagyobb POT-tal, mint bárki a fiatalok közt",az.nyilt);
  ok(/túra/.test(az.turne.cim)&&az.turne.penz>=Math.round(az.turne.het*4)-1&&az.turne.penz<=Math.round(az.turne.het*9*1.2)+1
     &&az.turne.fbUtana===az.turne.fb+Math.max(1,Math.round(az.turne.fb*0.05))&&az.turne.lendulet&&az.turne.lendulet.amt===-1&&az.turne.lendulet.matches===2,
     "✈️ a heti lelátó 4–9-szerese, +5% szurkoló, 2 meccs −1 csapaterő",az.turne);
  ok(/Hírnév/.test(az.mamor.cim)&&az.mamor.n&&az.mamor.dev===0.7&&az.mamor.mas===1,"🥂 a legnagyobb POT-ú 21 alatti fejlődése ×0,7 — másé nem",az.mamor);
  ok(/Adó/.test(az.ado.cim)&&az.ado.budzse>=9000&&az.ado.budzse<=9600&&az.ado.ledger===10000-az.ado.budzse,"🧾 a büdzsé 4–10%-a bírság, a könyvelésben is",az.ado);
  ok(/edzés/.test(az.serules.cim)&&az.serules.u&&az.serules.u.reason==="injury"&&az.serules.u.matchesLeft>=1&&az.serules.u.matchesLeft<=5,"🩹 a legjobb embered 2–5 meccsre kidől",az.serules);
  ok(/Pályazár/.test(az.palya.cim)&&az.palya.db===2&&az.palya.aktiv,"🔒 két hazai meccs zárt kapuk mögött",az.palya);
  ok(az.botrany.cim==="__LEAVE_PENDING__"&&az.botrany.pre&&az.botrany.cand&&az.botrany.morale===52,"📸 −8 morál, és az elvágyódás alkuja következik (a botrány szövegével)",az.botrany);

  /* ---- 4. HÍRNÉV-MÁMOR A MECCSEK SORÁN ---- */
  const mm=await p.evaluate(()=>{
    const ki={};
    const n=_xi()[3].n;
    _pakli(["hirnevmamor"]);
    talEsFut().mamor={n,hatra:10,pad:0,m:0};
    const M=talState().esHat.mamor;
    S.careerStats[n]=S.careerStats[n]||{matches:0};
    /* két meccs pályán (formaingadozás), aztán három a padon */
    S.nextMatchOvr={};
    S.careerStats[n].matches=1;talEsemenyTick();
    ki.jatszott={pad:M.pad,hatra:M.hatra};
    S.careerStats[n].matches++;talEsemenyTick();
    for(let i=0;i<2;i++)talEsemenyTick();
    ki.ketPad={pad:M.pad,el:!!talState().esHat.mamor};
    talEsemenyTick();
    ki.gyogyult=!talState().esHat.mamor;ki.dev=talMamorDev(n);
    /* a tíz meccs magától is lejár */
    talState().esHat.mamor={n,hatra:2,pad:0,m:S.careerStats[n].matches};
    S.careerStats[n].matches++;talEsemenyTick();
    S.careerStats[n].matches++;talEsemenyTick();
    ki.lejart=!talState().esHat.mamor;
    return ki;});
  console.log("\n— 4. HÍRNÉV-MÁMOR A MECCSEK SORÁN —");
  ok(mm.jatszott.pad===0&&mm.jatszott.hatra===9,"pályára lépve a számláló fogy, a pad-sorozat nulla",mm.jatszott);
  ok(mm.ketPad.pad===2&&mm.ketPad.el,"két meccs a padon még kevés",mm.ketPad);
  ok(mm.gyogyult&&mm.dev===1,"a harmadik padon töltött meccs után magához tér — a fejlődése újra teljes",mm);
  ok(mm.lejart,"a hossza végén magától is elmúlik",mm.lejart);

  /* ---- 5. PÁLYAZÁR ---- */
  const pz=await p.evaluate(()=>{
    const ki={};
    S.transferBudget=0;talEsFut().palyazar=2;
    const b0=S.transferBudget;
    fanMatchTick({win:true,zart:true});
    ki.zart=S.transferBudget-b0;
    fanMatchTick({win:true});
    ki.nyitott=S.transferBudget-b0;
    talPalyazarFogy();ki.egy=talState().esHat.palyazar;
    talPalyazarFogy();ki.nulla=talState().esHat.palyazar;ki.aktiv=talPalyazarAktiv();
    ki.motor=/const _talZart=!DUEL&&!fx\.neutral&&!!fx\.home&&talPalyazarAktiv\(\);/.test(playMatch.toString())
      &&/\(fx\.neutral\|\|_talZart\)\?0:/.test(playMatch.toString())
      &&/zart:_talZart/.test(playMatch.toString());
    return ki;});
  console.log("\n— 5. PÁLYAZÁR —");
  ok(pz.zart===0&&pz.nyitott>0,"zárt kapus meccsen nincs lelátó-bevétel, nyitott kapusnál van",pz);
  ok(pz.egy===1&&pz.nulla===0&&!pz.aktiv,"hazai meccsenként fogy, a végén lejár",pz);
  ok(pz.motor,"a meccsmotor: nincs hazai előny, a lelátó zárva — a párharcban nem hat");

  /* ---- 6. DÖNTÉSEK A VALÓDI KÉPERNYŐN ---- */
  const dn=await p.evaluate(()=>{
    const ki={};
    const gombok=()=>[...document.querySelectorAll("#twActions .talEsGomb")];
    const nyom=(h,k)=>{showTalEsemeny(h);const g=gombok().find(b=>b.dataset.k===k);const t=!!(g&&g.disabled);if(g&&!g.disabled)g.click();return t;};
    /* 🎩 legenda */
    _pakli(["legendakopog"]);
    S.transferBudget=0;
    let h=talEsemenyElo("legendakopog");
    showTalEsemeny(h);
    ki.legTilt=gombok().map(b=>b.dataset.k+":"+b.disabled);
    ki.legOk=/nincs rá keret/.test($("twActions").textContent);
    S.transferBudget=h.ar*3;
    h=talEsemenyElo("legendakopog");
    const st0=staff().length,b0=S.transferBudget;
    nyom(h,"igen");
    ki.leg={stab:staff().length-st0,fizet:b0-S.transferBudget,ar:h.ar,piaci:staffPrice(h.o.sz),
      tovabb:!!document.querySelector("#twActions .btn-p")&&/Tovább/.test($("twActions").textContent)};
    /* 🔁 tékozló fiú */
    const volt=Object.values(careerPool).find(e=>!findRosterPlayerByName(e.n)&&e.startRating>60&&e.age<=35&&!e.retired);
    S.transferLog={sells:[{n:volt.n,credit:4000,season:2}]};
    S.transferBudget=5000;_pakli(["tekozlo"]);
    h=talEsemenyElo("tekozlo");
    nyom(h,"igen");
    ki.tek={ar:h.ar,budzse:S.transferBudget,bent:!!findRosterPlayerByName(volt.n)};
    /* 🧲 csábítás — megtartás */
    _pakli(["csabitas"]);S.transferBudget=1e9;
    h=talEsemenyElo("csabitas");
    const b1=S.transferBudget;
    nyom(h,"tart");
    ki.tart={fizet:b1-S.transferBudget,dij:h.dij,bent:!!findRosterPlayerByName(h.n),kap:h.n!==slots[captainIdx].player.n};
    /* 🧲 csábítás — elengedés */
    h=talEsemenyElo("csabitas");
    const b2=S.transferBudget;
    nyom(h,"enged");
    ki.enged={kap:b2+h.ar===S.transferBudget,bent:!!findRosterPlayerByName(h.n),xi:slots.every(sl=>sl&&sl.player)};
    /* 🧲 automatikus döntés üres kasszával: elenged */
    S.transferBudget=0;
    h=talEsemenyElo("csabitas");
    ki.autoCsab=(typeof h.auto==="function"?h.auto():h.auto);
    /* 💼 ügynökháború — igen */
    _pakli(["ugynokhaboru"]);
    h=talEsemenyElo("ugynokhaboru");
    const pl=findRosterPlayerByName(h.n);
    const w0=playerMatchWage(pl);
    nyom(h,"igen");
    ki.ugyIgen={szorzo:talBerSzorzo(h.n),arany:Math.round(playerMatchWage(pl)/w0*100)/100};
    /* 💼 ügynökháború — nem */
    h=talEsemenyElo("ugynokhaboru");
    S.nextMatchOvr={};
    nyom(h,"nem");
    ki.ugyNem=S.nextMatchOvr[h.n]||null;
    ki.autoUgy=h.auto;
    return ki;});
  console.log("\n— 6. DÖNTÉSEK A VALÓDI KÉPERNYŐN —");
  ok(dn.legTilt.join()==="igen:true,nem:false"&&dn.legOk,"🎩 üres kasszánál a „Felveszem” tiltva, az ok kiírva",dn.legTilt);
  ok(dn.leg.stab===1&&dn.leg.fizet===dn.leg.ar&&Math.abs(dn.leg.ar*2-dn.leg.piaci)<=1&&dn.leg.tovabb,"🎩 a legenda a stábba kerül, fél áron — utána „Tovább”",dn.leg);
  ok(dn.tek.ar===2000&&dn.tek.budzse===3000&&dn.tek.bent,"🔁 a tékozló fiú az eladási ára feléért hazatér",dn.tek);
  ok(dn.tart.fizet===dn.tart.dij&&dn.tart.bent&&dn.tart.kap,"🧲 megtartás: a díj (15%) levonva, a játékos marad — a kapitányt nem csábítják",dn.tart);
  ok(dn.enged.kap&&!dn.enged.bent&&dn.enged.xi,"🧲 elengedés: a kikiáltási ár a kasszába, a játékos megy, a kezdő 11 teljes marad",dn.enged);
  ok(dn.autoCsab==="enged","🧲 a gép üres kasszánál elengedi",dn.autoCsab);
  ok(dn.ugyIgen.szorzo===1.5&&dn.ugyIgen.arany===1.5,"💼 igen: a bére +50% — a valódi bérszámításban is",dn.ugyIgen);
  ok(dn.ugyNem&&dn.ugyNem.amt===-1&&dn.ugyNem.matches===10&&dn.autoUgy==="igen","💼 nem: 10 meccs −1 Rating; a gép igent mond",{nem:dn.ugyNem,auto:dn.autoUgy});

  /* ---- 7. A KÉZI ÉS AZ AUTOMATIKUS ABLAK ---- */
  const kezi=await p.evaluate(async()=>{
    const ki={};
    _pakli(["ugynokhaboru"]);
    const regi=TRANSFER_TYPES.map(t=>t.weight),_r=Math.random;
    TRANSFER_TYPES.forEach(t=>{t.weight=0;});
    Math.random=()=>0.99;
    try{
      TW={cycle:1,category:null,candidates:[],retries:0,maxCycles:1,label:"Próba-ablak"};
      twStartPhase2();
      await new Promise(r=>setTimeout(r,2500));
      ki.cim=$("twTitle").textContent;
      ki.gombok=document.querySelectorAll("#twActions .talEsGomb").length;
      /* automatikus rövid ablak */
      _pakli(["csabitas"]);S.transferBudget=1e9;
      const nap=[];const _a=addLine;addLine=x=>nap.push(String(x));
      S.auto=true;
      try{autoResolveCheckpoint(8);}finally{S.auto=false;addLine=_a;}
      ki.auto=nap.filter(x=>/RÖVID ABLAK/.test(x));
    }finally{Math.random=_r;TRANSFER_TYPES.forEach((t,i)=>{t.weight=regi[i];});if(TW){TW.busy=false;}}
    return ki;});
  console.log("\n— 7. A KÉZI ÉS AZ AUTOMATIKUS ABLAK —");
  ok(/Ügynökháború/.test(kezi.cim)&&kezi.gombok===2,"a kézi ablak (twStartPhase2 → land) a döntés-képernyőt mutatja",kezi);
  ok(kezi.auto.length===1&&/Rivális csábítás/.test(kezi.auto[0])&&/Aláírtad/.test(kezi.auto[0]),"az automatikus ablakban a gép dönt, és a napló kimondja",kezi.auto);

  /* ---- 8. MENÜ ÉS LAP ---- */
  const mn=await p.evaluate(()=>{
    const ki={};
    const T=_pakli(["hirnevmamor","igazgatosag","ado"]);
    T.esemenyek.ado.utolso=3;
    T.esHat={mamor:{n:_xi()[3].n,hatra:7,pad:1,m:0},palyazar:1,ber:{[_xi()[4].n]:{m:1.5,szezon:3}}};
    talMenuOpen();
    ki.t=$("talHatas").textContent;
    talMenuClose();
    const L={uid:9,kat:"joker",valt:"csomag",rang:2,dobas:0.5,spec:null,csomag:["tekozlo","turne","szponzor"]};
    ki.lap=talAlapSzoveg(L);
    ki.aktiv=talAlapAktiv(L);
    return ki;});
  console.log("\n— 8. MENÜ ÉS LAP —");
  ok(/Igazgatósági ülés ⏳/.test(mn.t)&&/Adóellenőrzés ✓/.test(mn.t)&&/idén már kijött/.test(mn.t),"a menüben: ✓ idén már kijött, ⏳ később kapcsol be",mn.t.slice(0,300));
  ok(/Hírnév-mámor/.test(mn.t)&&/1\/3/.test(mn.t)&&/Pályazár: még 1/.test(mn.t)&&/bére \+50%/.test(mn.t),"a futó hatások a menüben: mámor (pad 1/3), pályazár, béremelés",mn.t.slice(-400));
  ok(/Mezszponzor ⏳/.test(mn.lap)&&!/tékozló fiú ⏳/.test(mn.lap)&&mn.aktiv,"a lapon a még nem működő esemény ⏳ — és az Eseménycsomag alaphatása él",mn.lap);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
