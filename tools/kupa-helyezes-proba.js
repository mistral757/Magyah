/* 🏆 AZ EREDMÉNYJELZŐ HELYEZÉSE KUPÁBAN (3.9.224)

   BEJELENTÉS: „Kupa idejére is ott szokott ragadni a bajnoki helyezés a
   csapat neve mellett. Ilyenkor, ha van csoport, akkor a csoportbeli helyezés
   legyen a két csapat mellett, ha nincs csoport épp (vagy egyáltalán MK és
   FA) akkor ne legyen ott semmi."

   Amit mér: bajnokiban a régi út; csoportkörben mindkét csapat csoport-
   helyezése (az eredményjelzőn is); az első csoportforduló előtt, a
   selejtezőben, a kieséses ágon és a csoport nélküli kupában semmi; a kupa
   lezárulta után megint a bajnoki; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9469;
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
  await p.waitForFunction(()=>typeof sbTablePos==="function",null,{timeout:15000});

  /* karrier-fixture: a 30. forduló után, lezárt szezon (a nyár) */
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
      const pl={n:src.n,ovr:src.ovr,pot:Math.max(src.ovr||70,src.pot||0)+3,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    slots.forEach(sl=>{if(sl.player){if(!sl.player.pot)sl.player.pot=(sl.player.ovr||70)+3;if(!sl.player.age)sl.player.age=26;}});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    addLine=()=>{};
    window._nyar=()=>{phase="hubreport";S.seasonClosed=true;S.seasonNumber=2;S.idx=30;
      hubMidSeasonMode=false;if(S.twWindow)S.twWindow=null;};
    window._nevek=()=>slots.filter(sl=>sl.player).map(sl=>sl.player.n);
    window._kitesz=(n,x)=>{const now=saleCareerRound();
      const rec=Object.assign({n,since:now,due:now+12,rejects:0,offer:null,winKey:null,inWindow:0,pending:true},x||{});
      saleMarketState().list.push(rec);return rec;};});

  const r=await p.evaluate(()=>{
    const ki={};
    phase="season";S.seasonClosed=false;S.idx=5;S.euro=null;
    /* bajnokiban: a régi út */
    const t=liveLeagueTable();ki.ligaVart=t.findIndex(x=>x&&x.you)+1;ki.liga=sbTablePos(null);
    /* kupa, csoportkör: négyes csoport, mi a 3. helyen */
    const teams=[{n:"Kupa Alfa"},{n:"Kupa Béta"},{n:teamName,you:true},{n:"Kupa Delta"},{n:"Másik Csop"}];
    const row=(pts,gf,ga)=>({w:0,d:0,l:0,gf,ga,pts});
    S.euro={comp:"EL",stage:"group",md:2,idx:0,teams,groups:[[0,1,2,3],[4]],userG:0,
      table:[row(6,4,0),row(3,2,2),row(1,1,3),row(1,0,2),row(9,9,0)],fixtures:[]};
    ki.euroAktiv=euroActive();
    ki.csopEn=sbTablePos(null);ki.csopEll=sbTablePos("Kupa Alfa");ki.csopEll4=sbTablePos("Kupa Delta");
    ki.masikCsop=sbTablePos("Másik Csop");
    /* az eredményjelző maga */
    sbPaintTeams({home:true,o:{n:"Kupa Alfa",ovr:80}});
    ki.sbEn=SB.teams.home.pos;ki.sbEll=SB.teams.away.pos;
    /* az első forduló előtt */
    S.euro.md=0;ki.md0=sbTablePos(null);
    /* kieséses ág, selejtező */
    S.euro.md=6;S.euro.stage="qf";ki.ko=sbTablePos(null);ki.koEll=sbTablePos("Kupa Alfa");
    sbPaintTeams({home:false,o:{n:"Kupa Alfa",ovr:80}});ki.sbKo=[SB.teams.home.pos,SB.teams.away.pos];
    S.euro.stage="qual";ki.qual=sbTablePos(null);
    /* csoport nélküli kupa (MK/FA-szerű: rögtön kieséses) */
    S.euro={comp:"MK",stage:"r16",md:0,idx:0,teams,groups:[],userG:null,table:[],fixtures:[]};
    ki.mk=sbTablePos(null);
    /* hazai kupa akkor sem, ha valamiért „group" szakaszban állna */
    S.euro.stage="group";S.euro.md=2;S.euro.groups=[[0,1,2,3]];S.euro.userG=0;
    S.euro.table=[row(6,4,0),row(3,2,2),row(1,1,3),row(1,0,2),row(9,9,0)];
    ki.mkCsop=sbTablePos(null);S.euro.comp="FA";ki.faCsop=sbTablePos(null);
    /* a kupa vége után megint a bajnoki */
    S.euro.stage="done";ki.vege=sbTablePos(null);
    S.euro=null;
    return ki;});
  ok(r.liga===r.ligaVart&&r.liga>0,"bajnokiban a bajnoki helyezés (változatlan)",r.liga);
  ok(r.euroAktiv,"a kupa fut");
  ok(r.csopEn===3,"csoportkörben a saját csoporthelyezés",r.csopEn);
  ok(r.csopEll===1&&r.csopEll4===4,"…és az ellenfélé is a csoportból",[r.csopEll,r.csopEll4]);
  ok(r.masikCsop===null,"más csoportbeli csapatnak nincs helyezése a mi csoportunkban",r.masikCsop);
  ok(r.sbEn===3&&r.sbEll===1,"az eredményjelző mindkét csapat mellé a csoporthelyezést írja",[r.sbEn,r.sbEll]);
  ok(r.md0===null,"az első csoportforduló előtt nincs helyezés",r.md0);
  ok(r.ko===null&&r.koEll===null&&r.sbKo.every(x=>x==null),"kieséses ágon semmi (a bajnoki sem)",r.sbKo);
  ok(r.qual===null,"selejtezőben semmi",r.qual);
  ok(r.mk===null,"csoport nélküli kupában semmi",r.mk);
  ok(r.mkCsop===null&&r.faCsop===null,"az MK-ban és az FA-ban soha nincs helyezés",[r.mkCsop,r.faCsop]);
  ok(r.vege===r.ligaVart,"a kupa lezárulta után a bajnoki tabella",r.vege);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
