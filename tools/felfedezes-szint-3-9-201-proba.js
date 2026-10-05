/* 🔍 3.9.201 — A SCOUTHÁLÓZAT FELFEDEZÉSE A KERETHEZ MÉRT.

   BEJELENTÉS (képernyőképpel: 86,5-ös keret, az 1. idény 2. meccse után a
   3 csillagos scout ingyen hozott egy 97-es jobbhátvédet): „Ez jó így?
   Mekkora az esélye? Ha viszonylag normál esélye van […], akkor nem jó, mert
   azonnal megváltozik a teljes szezon egy ekkora igazolással, ingyen!"

   Amit mér:
     1. A SÁV: a felfedezés felső határa a piaci sáv közepe −2 (1★) … +1
        (5★), soha nem a piaci sáv fölött; az alja a sáv alja −8;
     2. A HÚZÁS: 600 húzásból egy sem lép a sáv fölé; a régi (egyenletes)
        húzásnál a pool jelentős része fölötte volt; a jobb scout átlagban
        magasabbat talál; a fiatalok gyakoribbak, mint a sávban;
     3. LEGENDÁS MAGYAHOK: a felfújt magyar pool-ból sem jön sztár;
     4. AZ ÚT: az unlockRandomPlayer a sávból ad, a keretbe teszi; ha a
        sávban és alatta nincs senki, nem lép felfelé (null). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9244;
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
  await p.waitForFunction(()=>typeof pickDiscoveryEntry==="function",null,{timeout:15000});

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
    const cands=()=>Object.values(careerPool).filter(e=>!drafted.has(e.n));
    /* A KERET A POOL KÖZEPÉN — ahogy egy draftolt keret (a bejelentett esetben
       a 86,5-ös keret a saját, eltolt világának a közepén állt) */
    {const rs=cands().map(e=>e.startRating).sort((a,b)=>a-b);const med=rs[Math.floor(rs.length/2)];
     const kozep=cands().filter(e=>Math.abs(e.startRating-med)<=1);
     slots.forEach((sl,i)=>{const e=kozep[i];if(!e)return;const pl=careerPlayerFromPoolEntry(e);
       pl.pos=[sl.pos];sl.player=pl;sl.fit=fitFor(pl,sl);drafted.add(e.n);});
     BENCH_KEYS.forEach(k=>{BENCH[k]=null;});extraRoster=[];
     ki.med=med;ki.keret=bandTeamRaw();}
    const huz=(stars,n)=>{scout={name:"Teszt Elek",stars};const d=discoveryBand();const rs=[];let fiatal=0;
      for(let i=0;i<n;i++){const e=pickDiscoveryEntry(cands());rs.push(e.startRating);if((e.age||26)<=24)fiatal++;}
      const sb=signingBand();
      return {d:{lo:+d.lo.toFixed(2),hi:+d.hi.toFixed(2),mode:+d.mode.toFixed(2),q:+d.q.toFixed(3)},
        sb:{lo:+sb.lo.toFixed(2),mid:+sb.mid.toFixed(2),hi:+sb.hi.toFixed(2)},
        max:Math.max(...rs),min:Math.min(...rs),atl:rs.reduce((a,b)=>a+b,0)/rs.length,
        fole:rs.filter(r=>r>d.hi+1e-9).length,fiatal:fiatal/n};};
    /* ---- 1–2. A SÁV ÉS A HÚZÁS ---- */
    ki.s1=huz(1,600);ki.s3=huz(3,600);ki.s5=huz(5,600);
    {scout={name:"Teszt Elek",stars:3};const d=discoveryBand();const c=cands();
     ki.regiFole=Math.round(1000*c.filter(e=>e.startRating>d.hi).length/c.length)/10;
     ki.tr=bandTeamRaw();ki.regiTiz=Math.round(1000*c.filter(e=>e.startRating>=ki.tr+10).length/c.length)/10;
     const sav=c.filter(e=>e.startRating>=d.lo&&e.startRating<=d.hi);
     ki.savFiatal=sav.filter(e=>(e.age||26)<=24).length/sav.length;}
    /* ---- 3. LEGENDÁS MAGYAHOK ---- */
    {const mentPool=careerPool;S.careerMagyah=true;
     careerPool=initCareerPlayerPool({stars:3});
     ki.magyarFent=Object.values(careerPool).filter(e=>e.nat==="Magyarország"&&!drafted.has(e.n)&&e.startRating>=bandTeamRaw()+10).length;
     ki.s3m=huz(3,600);
     /* ---- 4. AZ ÚT ---- */
     scout={name:"Teszt Elek",stars:3};
     const er=extraRoster.length;const np=unlockRandomPlayer();
     ki.ut={n:!!np,bent:extraRoster.length===er+1&&extraRoster.includes(np),draft:np&&drafted.has(np.n),
       ovr:np&&np.ovr,hi:discoveryBand().hi};
     ki.ures=pickDiscoveryEntry([{n:"X",startRating:discoveryBand().hi+5,age:20}]);
     careerPool=mentPool;S.careerMagyah=false;}
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. A SÁV —");
  const S1=r.s1,S3=r.s3,S5=r.s5;
  ok(Math.abs(S1.d.hi-(S1.sb.mid-2+3*S1.d.q))<0.02&&Math.abs(S5.d.hi-Math.min(S5.sb.hi,S5.sb.mid-2+3*S5.d.q))<0.02,"a felső határ: a sáv közepe −2 … +1, a scout minőségével",{s1:S1.d,s5:S5.d,sb:S1.sb});
  ok([S1,S3,S5].every(x=>x.d.hi<=x.sb.hi+1e-9&&x.d.hi<=x.sb.mid+1+1e-9),"soha nem a piaci sáv fölött, és legfeljebb a közép +1",[S1.d.hi,S3.d.hi,S5.d.hi,S1.sb]);
  ok(Math.abs(S3.d.lo-(S3.sb.lo-8))<0.02,"az alja: a piaci sáv alja −8",{lo:S3.d.lo,sb:S3.sb.lo});
  ok(S1.d.q<S3.d.q&&S3.d.q<S5.d.q&&S1.d.hi<S5.d.hi,"jobb scout → magasabb plafon",[S1.d,S5.d]);
  console.log("\n— 2. A HÚZÁS —");
  ok(S1.fole===0&&S3.fole===0&&S5.fole===0,"3×600 húzásból egy sem lépett a sáv fölé",{max:[S1.max,S3.max,S5.max],hi:[S1.d.hi,S3.d.hi,S5.d.hi]});
  ok(r.regiFole>=15&&r.regiTiz>=3&&Math.abs(r.keret-r.med)<3,"a régi, egyenletes húzásnál a pool jelentős része a sáv fölött volt, és a keret átlaga +10 fölött is",{fole:r.regiFole+"%",tiz:r.regiTiz+"%",keret:r.tr,med:r.med});
  ok(S5.atl>S1.atl+1,"az 5★ átlagban magasabbat talál, mint az 1★",{a1:+S1.atl.toFixed(2),a5:+S5.atl.toFixed(2)});
  ok(S3.min>=S3.d.lo-1e-9,"az alsó határ alá sem megy",{min:S3.min,lo:S3.d.lo});
  ok(S3.fiatal>r.savFiatal+0.05,"a fiatalok (≤24) gyakoribbak, mint a sávban",{huzott:+S3.fiatal.toFixed(3),savban:+r.savFiatal.toFixed(3)});
  console.log("\n— 3. LEGENDÁS MAGYAHOK —");
  ok(r.magyarFent>=10&&r.s3m.fole===0&&r.s3m.max<=r.s3m.d.hi,"a felfújt magyar poolból (sok magyar a keret átlaga +10 fölött) sem jön sztár",{fent:r.magyarFent,max:r.s3m.max,hi:r.s3m.d.hi});
  console.log("\n— 4. AZ ÚT —");
  ok(r.ut.n&&r.ut.bent&&r.ut.draft&&r.ut.ovr<=r.ut.hi+1e-9,"az unlockRandomPlayer a sávból ad, és a keretbe teszi",r.ut);
  ok(r.ures===null,"ha a sávban és alatta nincs senki, nem lép felfelé (nincs felfedezés)",r.ures);
  ok(String(r.verzio).localeCompare("3.9.201",undefined,{numeric:true})>=0,"verzió legalább 3.9.201",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
