/* 🗞️ 3.9.198 — A LAP A KIÁLLÍTÁSOK SZÁMÁT ÉS A GÓLOK SZÁMÁT IS TUDJA.

   BEJELENTÉS (képernyőképpel: 5:0, három kiállítás, a cím „Tízen is
   legyőzték", a lead csak kettőt említett): „Ezek az újság cikk leadek is
   legyenek javítva a kiállítások száma szerint. Amikor pedig valaki 3+ gólt
   lő, akkor az is már ne mesterhármasként legyen emlegetve, hanem rendesen,
   említve a konkrét gólszámot, magyar betűkkel kiírva, nem számmal. Akár
   lehet »mesterötös«, és hasonlók is"

   Amit mér (valódi mVerdictEnrich + pressHeadline):
     1. HÁROM KIÁLLÍTÁS: egy extra-sor mindhárom névvel („Három kiállítás:
        …"), a cím „Nyolcan is…" / „Három piros lap…", a lead (3★) is
        mindhármat említi; egy kiállításnál a régi „Tízen is" / „Kiállítás";
     2. ÖT GÓL: az extra „Mesterötös: X — öt gól", a cím minden sablonja a
        valódi számot mondja (mesterötös / Ötször / Öt gól), „hármas" nem;
     3. a szám-szavak és a mester-sorozat 3-tól 10-ig; két piros lap egy
        vereségben: „A két piros lap…"; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9241;
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
  await p.waitForFunction(()=>typeof pressMester==="function",null,{timeout:15000});

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
    tiszta();


    const xs=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player).map(p=>p.n);
    const _rnd=Math.random,_ps=pressStars;window.pressStars=()=>3.5;
    const fut=(players,gf,ga,rnd)=>{
      Math.random=()=>rnd;
      const V={txt:"x",score:35,label:"x",parts:""};
      try{mVerdictEnrich(V,{M:{},last:{us:"Lóverseny FC",them:"Mencseszteri Egyesültek",players,gf,ga},gf,ga,cls:gf>ga?"win":gf<ga?"loss":"draw",maxDeficit:0,goalJub:[]});}
      catch(e){return {err:String(e)};}
      Math.random=_rnd;
      return {extras:(V.extras||[]).map(x=>x.t),cim:V.head&&V.head.t,lead:V.head&&V.head.lead,key:V.head&&V.head.key};};
    /* 1. a bejelentő esete: 5:0, három kiállítás, a meccs embere két góllal */
    const P1=[{n:xs[9],g:2,mvp:1,star:9.9},{n:xs[3],red:1,star:5},{n:xs[4],red:1,star:5},{n:xs[5],red:1,star:5},{n:xs[8],g:1,star:7},{n:xs[7],g:2,star:7}];
    ki.harom=[0,0.6].map(r=>fut(P1,5,0,r));
    ki.egy=fut([{n:xs[9],g:1,mvp:1,star:8},{n:xs[3],red:1,star:5}],1,0,0);
    /* 2. öt gól */
    ki.ot=[0,0.3,0.55,0.8].map(r=>fut([{n:xs[9],g:5,mvp:1,star:10},{n:xs[8],g:1,star:7}],6,1,r));
    /* 3. szavak, sorozat, két piros vereségben */
    ki.szo=[3,4,5,6,7,8,9,10].map(g=>pressMester(g).n);
    ki.szam=[2,3,4,5,11].map(pressSzamSzo);
    ki.ketPiros=fut([{n:xs[9],star:6,mvp:0},{n:xs[3],red:1,star:4},{n:xs[4],red:1,star:4}],0,2,0);
    window.pressStars=_ps;
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. HÁROM KIÁLLÍTÁS —");
  const h0=r.harom[0];
  ok(h0.extras.filter(t=>/kiállítás/i.test(t)).length===1&&h0.extras.some(t=>/^Három kiállítás: .+, .+, .+$/.test(t)),"egy extra-sor, mindhárom névvel",h0.extras);
  ok(r.harom.every(x=>x.key==="redW")&&r.harom.some(x=>/^Nyolcan is legyőzték: .* háromemberes hátrányban is nyert$/.test(x.cim))&&r.harom.some(x=>/^Három piros lap ide vagy oda/.test(x.cim)),"a cím a valódi létszámmal: „Nyolcan is…” / „Három piros lap…”",r.harom.map(x=>x.cim));
  ok(/Három kiállítás: .+, .+, .+/.test(h0.lead||""),"a lead mindhármat említi",h0.lead);
  ok(!/[!?]\./.test(h0.lead||""),"a leadben nincs „!.” (a felkiáltójeles fokozat után nem jön pont)",h0.lead);
  ok(/^Tízen is legyőzték: .* emberhátrányban is nyert$/.test(r.egy.cim)&&r.egy.extras.some(t=>/^Kiállítás: /.test(t)),"egy kiállításnál „Tízen is” és „Kiállítás:”",{cim:r.egy.cim,ex:r.egy.extras});
  console.log("\n— 2. ÖT GÓL —");
  ok(r.ot[0].extras.some(t=>/^Mesterötös: .+ — öt gól$/.test(t)),"az extra: „Mesterötös: X — öt gól”",r.ot[0].extras);
  const cimek=r.ot.map(x=>x.cim);
  ok(cimek.every(t=>!/hármas|Háromszor|\b5\b gól/.test(t))&&cimek.every(t=>/mesterötös|Ötször|Öt gól/.test(t)),"minden cím-sablon a valódi számot mondja, betűvel",cimek);
  ok(new Set(cimek).size>=3,"több sablon is sorra kerül",cimek);
  console.log("\n— 3. SZAVAK, SOROZAT, KÉT PIROS —");
  ok(JSON.stringify(r.szo)===JSON.stringify(["mesterhármas","mesternégyes","mesterötös","mesterhatos","mesterhetes","mesternyolcas","mesterkilences","mestertízes"]),"a mester-sorozat 3-tól 10-ig",r.szo);
  ok(JSON.stringify(r.szam)===JSON.stringify(["két","három","négy","öt","tizenegy"]),"a szám-szavak",r.szam);
  ok(r.ketPiros.key==="redL"&&/^A két piros lap mindent elrontott/.test(r.ketPiros.cim),"két piros egy vereségben: „A két piros lap…”",r.ketPiros.cim);
  ok(String(r.verzio).localeCompare("3.9.198",undefined,{numeric:true})>=0,"verzió legalább 3.9.198",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
