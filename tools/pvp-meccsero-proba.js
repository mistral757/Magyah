/* ⚡ A MECCS-ERŐ A PvP REPREZENTATÍV SZÁMA (3.9.104).

   KIMONDOTT KÉRÉS: „Meccs erő legyen a PvP-ben a reprezentatív. Az mérje
   egymáshoz a játékosokat. Az látszódjon az eredményjelzőn meccs előtt,
   közben. Annak megfelelően legyenek összehasonlítva a hangolási pontokon."

   AMI EDDIG VOLT. A párharcot a motor MÁR a meccs-erőből számolta (a
   pillanatkép `ovr`-jéből), a felület viszont másik két számot mutatott: az
   eredményjelzőn a nyers keretet (teamStrength / dispOvr), a csapatlapon a
   kirajzolt tizenegyet és a top-14 keretet. Vagyis a két menedzser NEM azon
   mérte magát, amiből a mérkőzés eldőlt — a beküldött beszélgetésben 173,3
   vs 158,5 volt a meccs-erő, miközben a képernyőn másik számpár állt.

   Amit mér:
     1. a csapatlap viszi a meccs-erőt (mstr), és az a teamMatchStrength();
     2. a hálózati tisztítás megtartja, tág sávval — a meccs-erő 120 fölé megy;
     3. régi kliens kártyáján nincs → null, és a felület nem hazudik nullát;
     4. az EREDMÉNYJELZŐ párharcban a meccs-erőt mutatja, villám-jelöléssel;
     5. …bajnokiban és kupában viszont betűre a régi számot;
     6. és ha a társ kliense régi (nincs matchOvr), MINDKÉT oldal a régi
        számon marad — sosem kerül két KÜLÖNBÖZŐ skálájú szám egymás mellé. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9075;
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
  await p.waitForFunction(()=>typeof mpTeamCard==="function"
    &&typeof sbPaintTeams==="function"&&typeof teamMatchStrength==="function",
    null,{timeout:30000});

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
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";buildSeasonFixtures();
    /* A rejtett tag legyen ÉRZÉKELHETŐ: így a két szám biztosan elválik. */
    S.morale=95;

    /* ---- 1. A KÁRTYA ---- */
    const card=mpTeamCard();
    ki.card={mstr:card.mstr,str:card.str,ovr:card.ovr,squad:card.squad};
    ki.elo=Math.round(teamMatchStrength()*10)/10;
    ki.nyers=Math.round(teamStrength()*10)/10;

    /* ---- 2-3. A HÁLÓZATI TISZTÍTÁS ---- */
    ki.clean={
      nagy:(mpCardClean(Object.assign({},card,{mstr:173.3}))||{}).mstr,
      regi:(mpCardClean(Object.assign({},card,{mstr:undefined}))||{}).mstr,
      nulla:(mpCardClean(Object.assign({},card,{mstr:0}))||{}).mstr,
      tulnagy:(mpCardClean(Object.assign({},card,{mstr:9999}))||{}).mstr};

    /* ---- 4-6. AZ EREDMÉNYJELZŐ ---- */
    const kep=()=>{
      const h=SB.teams&&SB.teams.home,a=SB.teams&&SB.teams.away;
      const me=(h&&h.full===sbCleanClub(teamName))?h:a;
      const opp=(me===h)?a:h;
      return {enSzam:me&&me.ovr==null?null:Math.round(me.ovr*10)/10,enMs:!!(me&&me.ms),
              oSzam:opp&&opp.ovr==null?null:Math.round(opp.ovr*10)/10,oMs:!!(opp&&opp.ms)};};
    SB.usIsHome=true;
    /* PÁRHARC, új kliens: a társ pillanatképéből jött matchOvr */
    sbPaintTeams({duel:true,home:true,o:{n:"Társ FC",ovr:101.5,dispOvr:112.2,matchOvr:158.5}});
    ki.parharc=kep();
    /* PÁRHARC, RÉGI kliens: nincs matchOvr */
    sbPaintTeams({duel:true,home:true,o:{n:"Társ FC",ovr:101.5,dispOvr:112.2}});
    ki.regiTars=kep();
    /* BAJNOKI: itt semmi nem változhat */
    sbPaintTeams({home:true,o:{n:"CPU FC",ovr:104.7}});
    ki.bajnoki=kep();
    /* KUPA (dispOvr-rel): szintén a régi */
    sbPaintTeams({home:false,o:{n:"Kupa FC",ovr:100.1,dispOvr:118.4}});
    ki.kupa=kep();
    return ki;});

  console.log("=== 1. a csapatlap viszi a meccs-erőt ===");
  ok(t.card.mstr===t.elo,"a kártya mstr-je PONTOSAN a teamMatchStrength()",
    {mstr:t.card.mstr,elo:t.elo});
  ok(t.elo>t.nyers,"és tényleg elválik a nyers kerettől",{meccs:t.elo,nyers:t.nyers});
  ok(t.card.str>0&&t.card.ovr>0,"a másik három szám megmaradt",t.card);

  console.log("=== 2-3. a hálózati tisztítás ===");
  ok(t.clean.nagy===173.3,"a 120 fölötti meccs-erő átmegy (a beküldött 173,3)",t.clean.nagy);
  ok(t.clean.regi===null,"régi kliens kártyáján null, nem 0",{v:t.clean.regi});
  ok(t.clean.nulla===null,"a 0 sem hazudik számot",{v:t.clean.nulla});
  ok(t.clean.tulnagy===400,"az irreális érték a felső korlátra vágódik",{v:t.clean.tulnagy});

  console.log("=== 4. párharc: a meccs-erő áll az eredményjelzőn ===");
  ok(t.parharc.enSzam===t.elo,"a te oldaladon a meccs-erőd",
    {kiirt:t.parharc.enSzam,elo:t.elo});
  ok(t.parharc.oSzam===158.5,"a társ oldalán az ő meccs-ereje",{kiirt:t.parharc.oSzam});
  ok(t.parharc.enMs&&t.parharc.oMs,"és MINDKÉT oldal villám-jelölést kap");

  console.log("=== 5-6. és ahol nem szabad változnia ===");
  ok(t.regiTars.enSzam===t.nyers&&t.regiTars.oSzam===112.2
     &&!t.regiTars.enMs&&!t.regiTars.oMs,
    "régi kliens ellen MINDKÉT oldal a régi számon marad (nincs kevert skála)",t.regiTars);
  ok(t.bajnoki.enSzam===t.nyers&&t.bajnoki.oSzam===104.7&&!t.bajnoki.enMs,
    "bajnoki: betűre a régi",t.bajnoki);
  ok(t.kupa.enSzam===t.nyers&&t.kupa.oSzam===118.4&&!t.kupa.enMs,
    "kupa: betűre a régi",t.kupa);

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
