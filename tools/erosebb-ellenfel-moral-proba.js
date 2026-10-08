/* 💪 ERŐSEBB ELLENFÉL — A MORÁL MÉLTÁNYOSSÁGA (3.9.223)

   KIMONDOTT KÉRÉS: „Amikor nálad erősebb meccserővel rendelkező ellenfél
   fordít ellened olyankor ne legyen morál büntetés. Sőt, 2%tól +3 a
   döntetlenért is járjon morál jutalom, fokozatosan növekedő, egészen +12ig
   7%tól, és a szoros meccsért is járjon 4%tól +3, +12ig 10%tól"

   Amit mér:
     1. a skála: döntetlen 2% → +3, 7% → +12 (fölötte is 12), alatta 0;
        egygólos vereség 4% → +3, 10% → +12; győzelem és nagyobb vereség 0;
        fokozatos (monoton, lépésenként legfeljebb +2);
     2. a mérce a kezdőrúgáskori ⚡ meccs-erő (SB.msBase / SB.oppMsBase), a
        tábla nélkül a papírforma a tartalék;
     3. VALÓDI IDÉNY végigjátszással, változó erejű ellenfelekkel: minden
        döntetlen és egygólos vereség pontosan a skála szerinti jutalmat
        kapja (vagy semmit), és erősebb ellenfél fordításánál nincs „😤
        Elveszett előny" büntetés;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9394;
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
  await p.waitForFunction(()=>typeof moralErosebbJutalom==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
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
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  /* ---- 1-2. A SKÁLA ÉS A MÉRCE ---- */
  const u=await p.evaluate(()=>{
    const j=moralErosebbJutalom;
    const o={d:[1.9,2,4.5,7,9].map(g=>j(g,1,1)),s:[3.9,4,7,10,15].map(g=>j(g,1,2)),
      gy:j(20,2,1),nagy:j(20,0,2),neg:j(-5,1,1)};
    let mono=true,lepes=0;
    for(const [ab,gf,ga] of [[[2,7],1,1],[[4,10],0,1]]){let el=0;
      for(let g=0;g<=12;g+=0.05){const v=j(g,gf,ga);if(v<el)mono=false;if(el&&v-el>lepes)lepes=v-el;el=v;}}
    o.mono=mono;o.lepes=lepes;
    SB.msBase=100;SB.oppMsBase=105;o.gapSB=moralMsGapPct({o:{ovr:50}});
    SB.msBase=null;o.gapTartalek=moralMsGapPct({o:{ovr:80}})===giantPctOf({ovr:80});
    return o;});
  ok(JSON.stringify(u.d)==="[0,3,8,12,12]","döntetlen: 2% → +3, 4,5% → +8, 7% → +12, fölötte 12, alatta 0",u.d);
  ok(JSON.stringify(u.s)==="[0,3,8,12,12]","egygólos vereség: 4% → +3, 7% → +8, 10% → +12, fölötte 12, alatta 0",u.s);
  ok(u.gy===0&&u.nagy===0&&u.neg===0,"győzelem, kétgólos vereség és gyengébb ellenfél: nincs jutalom",u);
  ok(u.mono&&u.lepes<=2,"fokozatos: monoton, lépésenként legfeljebb +2",{mono:u.mono,lepes:u.lepes});
  ok(Math.abs(u.gapSB-5)<1e-9&&u.gapTartalek,"a mérce a kezdőrúgáskori ⚡; tábla nélkül a papírforma",u);

  /* ---- 3. VALÓDI IDÉNY ---- */
  const r=await p.evaluate(async()=>{
    try{utoLancVege();mEloTorol();}catch(e){}
    const rek=[];let cur=null;
    const _sb=sbStart;
    sbStart=function(){const v=_sb.apply(this,arguments);
      cur={my:SB.msBase,op:SB.oppMsBase,sorok:[]};rek.push(cur);return v;};
    const _add=addLine;
    addLine=function(t){if(cur&&/💪|😤 Elveszett|🙂 Elveszett|🛡️ Elveszett/.test(String(t)))cur.sorok.push(String(t));return _add.apply(this,arguments);};
    /* változó erejű mezőny: meccsenként −8 … +16 pont kiegyenlítés */
    let k=0;const _buff=matchHiddenOppBuff;
    matchHiddenOppBuff=function(){return [-8,0,4,6,8,10,12,16][(k++>>1)%8];};
    S.auto=true;S.idx=0;buildSeasonFixtures();
    let futott=0;const o={allapot:[]};
    for(let kor=0;kor<3;kor++){
      /* az előző idény vége (szezonzárás, lánc) lezárva — új idény ugyanazzal a kerettel */
      try{utoLancVege();mEloTorol();}catch(e){}
      S.playing=false;phase="season";S.auto=true;
      ["scEuro","scUnlock","scSkill","scSeasonEnd"].forEach(id=>{try{$(id).classList.add("hide");}catch(e){}});
      S.idx=0;buildSeasonFixtures();playMatch();
      for(let i=0;i<500&&S.idx<30;i++)await new Promise(r=>setTimeout(r,50));
      o.allapot.push({idx:S.idx,playing:S.playing,phase,uto:!!S.utoMeccs});
      futott+=S.idx;}
    S.auto=false;sbStart=_sb;addLine=_add;matchHiddenOppBuff=_buff;
    return {allapot:o.allapot,rek:rek.map(x=>Object.assign(x,{gf:null})),res:S.fixtureResults.slice(-90).map(f=>({gf:f.gf,ga:f.ga})),futott};});
  /* a meccsek és az eredmények párosítása: a rekord a kezdőrúgáskor nyílik */
  const n=Math.min(r.rek.length,r.res.length);
  let hibas=[],dDb=0,sDb=0,jDb=0,fordErosebb=0,fordGyengebb=0,buntetesErosebb=0;
  const rek=r.rek.slice(-n),res=r.res.slice(-n);
  for(let i=0;i<n;i++){
    const R=rek[i],E=res[i];if(R.my==null||R.op==null)continue;
    const g=(R.op-R.my)/R.my*100;
    const vart=E.gf===E.ga?(g>=2?Math.round(3+9*Math.min(1,(g-2)/5)):0)
      :(E.ga-E.gf===1?(g>=4?Math.round(3+9*Math.min(1,(g-4)/6)):0):0);
    const l=R.sorok.find(s=>/💪/.test(s));
    const kapott=l?+(/Morál \+(\d+)/.exec(l)||[0,0])[1]:0;
    if(E.gf===E.ga)dDb++;if(E.ga-E.gf===1)sDb++;if(kapott)jDb++;
    if(kapott!==vart)hibas.push({i,g:+g.toFixed(2),eredm:`${E.gf}:${E.ga}`,vart,kapott});
    if(R.sorok.some(s=>/Elveszett/.test(s))){
      if(g>0){fordErosebb++;if(R.sorok.some(s=>/😤/.test(s)))buntetesErosebb++;}
      else if(R.sorok.some(s=>/😤/.test(s)))fordGyengebb++;}}
  ok(r.futott>=60&&n>=60,"valódi idények lefutottak",{futott:r.futott,parositott:n,allapot:r.allapot});
  ok(!hibas.length&&dDb>0&&sDb>0&&jDb>0,"minden döntetlen és egygólos vereség pontosan a skála szerinti jutalmat kapja",{dontetlen:dDb,szoros:sDb,jutalom:jDb,hibas:hibas.slice(0,5)});
  ok(buntetesErosebb===0,"erősebb ellenfél fordításánál nincs morál-büntetés",{fordErosebb,buntetesErosebb,fordGyengebb});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
