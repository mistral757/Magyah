/* ⚽ MENTÉS-VISSZAJÁTSZÁS — egy feltöltött karrier meccseinek újrajátszása (3.9.255)

   Egy „magyah-mentes" exportot tölt be (applySavedGame, a közös szoba
   hálózata nélkül), és a megadott fordulók meccseit N-szer lejátssza a
   VALÓDI motoron, minden meccs előtt a mentés pontos állapotából. Rögzíti a
   kezdőrúgáskori különbséget és a két gólvárhatóságot, és az eredményt.

   HASZNÁLAT:
     N=150 FS=8,9,10,11,12,13 OUT=ki.jsonl node tools/meccsmotor/mentes-visszajatszas.js <mentés.json>
     MOD=novad    — a Joker „Vad idény" lapjai nélkül
     MOD=notal    — talizmánok nélkül
     MOD=nobond   — beilleszkedés nélkül
   A mentés NEM kerül a repóba (személyes adat). */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah",PORT=+process.env.PORT||9491,N=+process.env.N||100;
const SAVE=process.argv[2];
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((q,r)=>{let f=q.url.split("?")[0];if(f==="/")f="/index.html";const a=path.join(ROOT,decodeURIComponent(f));if(!a.startsWith(ROOT)||!fs.existsSync(a)||fs.statSync(a).isDirectory()){r.statusCode=404;return r.end();}fs.createReadStream(a).pipe(r);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1500);
  const m=JSON.parse(fs.readFileSync(SAVE,"utf8")).mentes;
  m.mp=null;   /* hálózat nélkül */
  const MOD=(process.env.MOD||"").split(",");
  if(MOD.includes("novad")&&m.S.tal)m.S.tal.lapok=m.S.tal.lapok.filter(L=>!(L.kat==="joker"&&L.valt==="vad"));
  if(MOD.includes("notal")&&m.S.tal)m.S.tal.lapok=[];
  if(MOD.includes("nobond"))m.S.bondNew={};
  const info=await p.evaluate(ms=>{
    window.__save=JSON.stringify(ms);
    applySavedGame(JSON.parse(window.__save));
    try{hubMidSeasonReturn();}catch(e){}
    window.__rec=[];window.__allow=false;window.__cur=null;
    const _ml=matchLambdas;
    matchLambdas=function(mine,oppOvr,venue){const L=_ml.apply(this,arguments);
      if(window.__cur&&window.__cur.d==null){window.__cur.d=L.diff;window.__cur.lf=L.lf;window.__cur.la=L.la;window.__cur.ms=mine.ovr;window.__cur.opp=oppOvr;window.__cur.tac=mine.tacticEffect;}
      return L;};
    const _pm=playMatchMotor;
    playMatchMotor=function(){if(!window.__allow){S.playing=false;S.auto=false;return;}window.__allow=false;return _pm.apply(this,arguments);};
    return {idx:S.idx,res:S.fixtureResults.length,morale:S.morale,form,xi:slots.map(s=>s.player&&(s.pos+":"+shortName(s.player.n)+":"+Math.round(pOvrDisplay(s.player)))).join(" ")};},m);
  console.log("betöltve",JSON.stringify(info));
  await p.clock.install();
  for(const F of (process.env.FS||"8,9,10,11,12,13").split(",").map(Number)){
    for(let i=0;i<N;i++){
      await p.evaluate(F=>{
        document.querySelectorAll("[id$=Modal]:not(.hide)").forEach(x=>x.classList.add("hide"));
        applySavedGame(JSON.parse(window.__save));try{hubMidSeasonReturn();}catch(e){}
        S.idx=F;S.fixtureResults.length=F;S.playing=false;
        window.__cur={F};window.__allow=true;S.auto=true;
        try{playMatch();}catch(e){window.__perr=String(e);}},F);
      let ok=false;
      for(let t=0;t<60&&!ok;t++){await p.clock.runFor(3000);
        ok=await p.evaluate(F=>S.fixtureResults.length>F,F);}
      const r=await p.evaluate(F=>{const x=S.fixtureResults[F];const c=window.__cur;S.auto=false;
        return x?Object.assign({},c,{gf:x.gf,ga:x.ga,o:x.o&&x.o.n}):Object.assign({},c,{fail:true,perr:window.__perr||null});},F);
      fs.appendFileSync(process.env.OUT||"/dev/null",JSON.stringify(r)+"\n");
      if(r.fail){console.log("ELAKADT",JSON.stringify(r));break;}
    }
    console.log("kész",F);
  }
  console.log("hibák",errs.slice(0,3));
  await b.close();srv.close();process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
