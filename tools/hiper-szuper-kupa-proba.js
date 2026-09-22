/* 🟣 HIPER SZUPER KUPA (3.9.123).

   KIMONDOTT KÉRÉS: „D0-tól kezdve a kupasorozat egy egyre nehezedő Hiper
   Szuper Kupa nevű sorozat legyen. D0-n a mezőny ereje a kezdő meccs-erő −1,
   D−1-en 0, D−2-n +1 és így tovább. A lefolytatása pedig úgy legyen, mint a
   mostani BL-é. Nagy mezőny, 8 meccs, nagy liga tábla, top 8 egyből tovább,
   többiek még tovább harcolnak a bejutásért, utolsó 8 egyből kiesik."

   Amit mér:
     1. a kvalifikáció: D1-ig a régi rendszer, D0-tól MINDENKINEK a HSZ —
        és a régi, néma hiba (D0-ban a legalsó osztály kupája futott) eltűnt;
     2. a mezőny ereje: D0 = kezdő meccs-erő −1, D−1 = 0, D−2 = +1 …;
     3. a ligaszakasz alakja: EGY 32-es tabella, nyolc forduló;
     4. a menetrend valódi: mindenki 8 KÜLÖNBÖZŐ ellenféllel, 4 hazai / 4 idegen,
        és senki nem játszik önmagával;
     5. a user nyolc meccse tényleg nyolc, és a tabella 32 soros;
     6. a három sáv: 1–8 · 9–24 · 25–32 pontosan lefedi a mezőnyt;
     7. a rájátszás párosítása helyezés szerinti (9–24, 10–23, … 16–17);
     8. a nyolcaddöntő 16 csapatos: 8 közvetlen + 8 rájátszás-győztes;
     9. a top 8 kihagyja a rájátszást (a háttérben lefut, a user r16-ban kezd);
    10. a körök lánca: hszpo → r16 → qf → sf → döntő;
    11. a klasszikus kupa (KK) BITRE változatlan: 8 csoport, 6 forduló. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9089;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof hszSchedule==="function"
      &&typeof hszSplit==="function"&&typeof hszMid==="function"
      &&!!(typeof EURO_COMPS==="object"&&EURO_COMPS.HSZ),null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a Hiper Szuper Kupa létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="T";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=80;S.seasonNumber=1;S.seasonHistory=[];
    {const lv={};Object.keys(TACTICS).forEach(k=>{lv[k]=90;});S.tactics={levels:lv,active:"totalis"};}
    h2hRoomActive=()=>false;

    /* ---- 3-4. A MENETREND ---- */
    const sch=hszSchedule();
    ki.sched={fordulok:sch.length,parok:sch[0].length};
    {const cnt={},opp={},home={},onmaga=[];
     sch.forEach(md=>md.forEach(([h,a])=>{
       if(h===a)onmaga.push(h);
       cnt[h]=(cnt[h]||0)+1;cnt[a]=(cnt[a]||0)+1;
       (opp[h]=opp[h]||new Set()).add(a);(opp[a]=opp[a]||new Set()).add(h);
       home[h]=(home[h]||0)+1;}));
     const n=Object.keys(cnt).length;
     ki.sanity={csapat:n,onmaga:onmaga.length,
       mindenki8:Object.values(cnt).every(v=>v===8),
       mind8kulonbozo:Object.values(opp).every(sSet=>sSet.size===8),
       hazaiElosztas:[...new Set(Object.values(home))].sort()};}

    /* ---- 1. A KVALIFIKÁCIÓ ---- */
    const compAt=()=>{const e=cupEntryFor(1,pyrMyDiv()?pyrMyDiv().mean:null);return e?e.comp:null;};
    ki.d1Comp=(()=>{S.pyr.my=1;return compAt();})();
    ki.d6Comp=(()=>{S.pyr.my=6;return compAt();})();
    /* megnyitjuk a szuperligát */
    S.pyr.my=1;
    ki.nyitas=pyrOpenTopDiv(rngFor("hsz:proba"));
    S.pyr.my=0;
    ki.d0Comp=compAt();
    ki.d0Qual=(()=>{const tt=cupTierFor(pyrMyDiv()?pyrMyDiv().mean:null);return !!tt.qual;})();
    ki.d0Min=(()=>{const e=cupEntryFor(16,pyrMyDiv()?pyrMyDiv().mean:null);return e?e.comp:null;})();

    /* ---- 2. A MEZŐNY ERŐSSÉGE ---- */
    S.pyr.msKick=100;
    ki.mid={d0:hszMid()};
    S.pyr.above=2;ki.mid.dm1=hszMid();
    S.pyr.above=3;ki.mid.dm2=hszMid();
    S.pyr.above=6;ki.mid.dm5=hszMid();
    S.pyr.above=1;

    /* ---- A KAMPÁNY FELÉPÍTÉSE ---- */
    S.euroCurrent="HSZ";S.euroCurrentQual=false;
    startEuroCampaign("HSZ",{});
    const E=S.euro;
    ki.mezony={teams:E.teams.length,groups:E.groups.length,
               groupSize:E.groups[0].length,userG:E.userG,
               tabla:euroGroupTable(0).length};
    ki.userFx=E.fixtures.length;
    ki.userHome=E.fixtures.filter(f=>f.home).length;
    ki.userOppEgyedi=new Set(E.fixtures.map(f=>f.oi)).size;
    ki.userNemOnmaga=E.fixtures.every(f=>f.oi!==E.userIdx);

    /* ---- A LIGASZAKASZ LEJÁTSZÁSA (szimulálva) ---- */
    for(let md=0;md<8;md++)euroSimMatchday(md);
    /* a user meccseit is le kell könyvelni, különben 0 ponttal zár */
    E.fixtures.forEach((f,i)=>{
      const r=euroSimResult(E.teams[E.userIdx].ovr,E.teams[f.oi].ovr,`u${i}`);
      euroApplyResult(f.home?E.userIdx:f.oi,f.home?f.oi:E.userIdx,r.h,r.a);});
    const sp=hszSplit();
    ki.split={direct:sp.direct.length,po:sp.po.length,out:sp.out.length,
              osszes:sp.direct.length+sp.po.length+sp.out.length,
              nincsAtfedes:new Set(sp.direct.concat(sp.po,sp.out)).size===32};

    /* ---- 7. A RÁJÁTSZÁS PÁROSÍTÁSA ---- */
    const poTies=euroDrawRound("hszpo",null);
    const rank={};sp.all.forEach((ix,r)=>{rank[ix]=r+1;});
    ki.po={parok:poTies.length,
           parositas:poTies.map(x=>[rank[x.b],rank[x.a]]),
           helyesSzerpar:poTies.every(x=>rank[x.a]+rank[x.b]===33)};

    /* ---- 8-9. A NYOLCADDÖNTŐ ---- */
    const w=hszSimPlayoff();
    const r16=euroDrawRound("r16",w);
    ki.r16={parok:r16.length,
            csapatok:new Set(r16.flatMap(x=>[x.a,x.b])).size,
            topNyolcBenne:sp.direct.every(ix=>r16.some(x=>x.a===ix||x.b===ix)),
            kiesoNincs:sp.out.every(ix=>!r16.some(x=>x.a===ix||x.b===ix))};

    /* ---- 10. A KÖRÖK LÁNCA ---- */
    ki.rounds=compRounds("HSZ");
    ki.roundNames=ki.rounds.map(r=>EURO_ROUND_NAMES[r]||null);

    /* ---- 12. A HÁROM ÚT VÉGIGJÁRVA ----
       Ez a legkockázatosabb ág: a legjobb nyolc KIHAGYJA a rájátszást, de
       annak akkor is le kell futnia, különben nincs 8 ellenfél a
       nyolcaddöntőre. A user tabella-helyét a pontjaival állítjuk be. */
    const ut=(hely)=>{
      /* mindenki kap egy fix pontszámot, a user annyit, hogy a kívánt
         helyre kerüljön; a döntetlent a gólkülönbség bontja */
      E.teams.forEach((tm,i)=>{E.table[i]={w:0,d:0,l:0,gf:100-i,ga:0,pts:100-i};});
      const cel=100-(hely-1);
      E.table[E.userIdx]={w:0,d:0,l:0,gf:cel,ga:0,pts:cel};
      /* a helyére szorult csapatot lejjebb toljuk */
      E.teams.forEach((tm,i)=>{if(i!==E.userIdx&&E.table[i].pts>=cel&&(100-i)>=cel&&i>=hely-1)
        E.table[i]={w:0,d:0,l:0,gf:cel-1-i,ga:0,pts:cel-1-i};});
      E.stage="group";E.md=8;E.ties=null;E.userTie=null;
      const naplo=[];const _al=addLine;addLine=(x)=>naplo.push(String(x));
      try{euroFinishGroupStage();}finally{addLine=_al;}
      return {rank:E.groupRank,adv:E.advanced,stage:E.stage,
              ties:E.ties?E.ties.length:0,
              userBenne:E.userTie!=null&&E.userTie>=0,
              naplo:naplo.join(" | ").slice(0,160)};};
    ki.ut1=ut(3);       /* top 8  → egyenesen r16 */
    ki.ut2=ut(15);      /* 9–24   → rájátszás */
    ki.ut3=ut(30);      /* 25–32  → kiesés */

    /* ---- 11. A KLASSZIKUS KUPA VÁLTOZATLAN ---- */
    ki.klasszikus={groups:compGroups("BL"),size:compGroupSize("BL"),
                   fordulok:compSchedule("BL").length,
                   rounds:compRounds("BL"),swiss:compSwiss("BL")};
    return ki;});

  console.log("\n1. A KVALIFIKÁCIÓ");
  ok(t.d1Comp==="BL","D1-ben marad a régi rendszer",t.d1Comp);
  /* A D6-ban SZÁNDÉKOSAN nincs kupa (PYR_CUPS: entries:[]) — a lényeg, hogy
     a HSZ nem szivárog le a piramis aljára. */
  ok(t.d6Comp!=="HSZ","a HSZ nem szivárog le a piramis aljára (D6: nincs kupa)",t.d6Comp);
  ok(t.nyitas===0,"a szuperliga megnyílt (D0)",t.nyitas);
  ok(t.d0Comp==="HSZ","D0-ban a Hiper Szuper Kupa jár",t.d0Comp);
  ok(t.d0Min==="HSZ","…a 16. helyezettnek is (mindenki nevez)",t.d0Min);
  ok(t.d0Qual===false,"…és nincs selejtező");

  console.log("\n2. A MEZŐNY ERŐSSÉGE (kezdő meccs-erő = 100)");
  ok(t.mid.d0===99,"D0: kezdő meccs-erő −1",t.mid.d0);
  ok(t.mid.dm1===100,"D−1: ±0",t.mid.dm1);
  ok(t.mid.dm2===101,"D−2: +1",t.mid.dm2);
  ok(t.mid.dm5===104,"D−5: +4 (a sorozat magától nő föléd)",t.mid.dm5);

  console.log("\n3-4. A LIGASZAKASZ MENETRENDJE");
  ok(t.sched.fordulok===8&&t.sched.parok===16,"nyolc forduló, fordulónként 16 pár",t.sched);
  ok(t.sanity.csapat===32,"32 csapat",t.sanity.csapat);
  ok(t.sanity.onmaga===0,"senki nem játszik önmagával");
  ok(t.sanity.mindenki8===true,"mindenki pontosan 8 meccset játszik");
  ok(t.sanity.mind8kulonbozo===true,"…és mind a 8 KÜLÖNBÖZŐ ellenfél ellen");
  ok(JSON.stringify(t.sanity.hazaiElosztas)==="[4]","mindenkinek 4 hazai és 4 idegenbeli",t.sanity.hazaiElosztas);

  console.log("\n5. A MEZŐNY ÉS A TABELLA");
  ok(t.mezony.teams===32&&t.mezony.groups===1&&t.mezony.groupSize===32,
     "EGY 32-es csoport, nem nyolc négyes",t.mezony);
  ok(t.mezony.tabla===32,"a tabella 32 soros",t.mezony.tabla);
  ok(t.userFx===8,"a user nyolc meccset kap",t.userFx);
  ok(t.userHome===4,"…négy hazait",t.userHome);
  ok(t.userOppEgyedi===8,"…nyolc különböző ellenfél ellen",t.userOppEgyedi);
  ok(t.userNemOnmaga===true,"…és sosem önmaga ellen");

  console.log("\n6. A HÁROM SÁV");
  ok(t.split.direct===8,"1–8. egyenesen tovább",t.split.direct);
  ok(t.split.po===16,"9–24. rájátszás",t.split.po);
  ok(t.split.out===8,"25–32. kiesik",t.split.out);
  ok(t.split.osszes===32&&t.split.nincsAtfedes===true,"a három sáv pontosan lefedi a mezőnyt");

  console.log("\n7. A RÁJÁTSZÁS PÁROSÍTÁSA");
  ok(t.po.parok===8,"nyolc párharc",t.po.parok);
  ok(t.po.helyesSzerpar===true,"helyezés szerint: 9–24, 10–23, … 16–17",t.po.parositas);

  console.log("\n8-9. A NYOLCADDÖNTŐ");
  ok(t.r16.parok===8&&t.r16.csapatok===16,"16 csapat, nyolc párharc",t.r16);
  ok(t.r16.topNyolcBenne===true,"a legjobb nyolc mind ott van (rájátszás nélkül)");
  ok(t.r16.kiesoNincs===true,"a kieső nyolc közül senki");

  console.log("\n10. A KÖRÖK LÁNCA");
  ok(JSON.stringify(t.rounds)==='["hszpo","r16","qf","sf","final"]',"öt kör",t.rounds);
  ok(t.roundNames.every(Boolean),"mindegyiknek van magyar neve",t.roundNames);

  console.log("\n12. A HÁROM ÚT");
  ok(t.ut1.rank<=8&&t.ut1.stage==="r16"&&t.ut1.ties===8&&t.ut1.userBenne===true,
     "1–8. hely: a rájátszás a háttérben lefut, a user EGYENESEN a nyolcaddöntőben",t.ut1);
  ok(t.ut2.rank>8&&t.ut2.rank<=24&&t.ut2.stage==="hszpo"&&t.ut2.ties===8&&t.ut2.userBenne===true,
     "9–24. hely: a user a rájátszást játssza",t.ut2);
  ok(t.ut3.rank>24&&t.ut3.adv===false,"25–32. hely: kiesés",t.ut3);
  ok(/ligaszakasz vége/i.test(t.ut1.naplo),"a napló a ligaszakaszról beszél, nem csoportkörről",
     t.ut1.naplo.slice(0,90));

  console.log("\n11. A KLASSZIKUS KUPA VÁLTOZATLAN");
  ok(t.klasszikus.groups===8&&t.klasszikus.size===4&&t.klasszikus.fordulok===6,
     "a KK továbbra is 8 csoport × 4 csapat, 6 forduló",t.klasszikus);
  ok(t.klasszikus.swiss===false,"…és nem svájci rendszerű");

  const zaj=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(zaj.length===0,"nincs konzolhiba",zaj.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
