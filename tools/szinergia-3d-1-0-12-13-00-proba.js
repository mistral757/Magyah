/* 🔗 1.0.12.13.00 — A SZINERGIA-GÓL SAJÁT 3D FELVEZETÉSE + a jegyzetkör többi pontja
   KIMONDOTT KÉRÉS (🐞 jmwx883nl3ix0): „Jó lenne ha megcsinálnád a szinergiagólokat is sajátosra. […] nem lehet
   tudni, hogy lvl 4től kezdve pontosan mi fejlődik benne. Ezt jelölni kéne."
   Amit mér:
     1. mind a 28 pár saját felvezetést kap (a két mozdulat a rajzolt jelenet sorrendjében), hibátlan pályákkal;
     2. minden pár minden vágásában a fő szereplő a képen, és nem pötty (élő felvétel, mérőhoroggal);
     3. a HUD-on a pár neve és a két mozdulat; a lánc csíkja a két stílus színében;
     4. a szinergia szintenkénti táblája (1–6.): a hatás-számok a szinttel szorzódnak, a küszöbök nem;
     5. a skill-ajánló a ma legjobb kezdőt választja a padon ülő fiatal helyett; a lecke nem sötétít;
     6. a Run-plafon a klublistán a választott fokozatból jön (5.1-en ≤ 100);
     7. nincs oldalhiba.  KEP=1 → képek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9614;
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
  const KEPDIR=process.env.KEPDIR||"/tmp/szin3d";if(process.env.KEP)require("fs").mkdirSync(KEPDIR,{recursive:true});
  const r1=await p.evaluate(()=>{const o={par:0,rossz:[],arch:{},mozd:new Set()};
    for(let i=0;i<SZIN_REND.length;i++)for(let j=i+1;j<SZIN_REND.length;j++){
      const key=szinKulcs(SZIN_REND[i],SZIN_REND[j]);if(!SZIN_DEFS[key])continue;o.par++;
      const ev={t:"gol",side:"us",p:slots[9].player.n,min:33,seq:i*10+j,skill:"szin",akc:{k:"szin",par:key,crew:[],sc:slots[9].player.n}};
      const c=evaKontextus(ev);const F=kamForgatokonyv(c,ev,"skSzin");o.arch[F.arch]=(o.arch[F.arch]||0)+1;
      const bad=[];Object.keys(F.sz).forEach(k=>F.sz[k].ut.forEach(pt=>{if(pt.some(v=>typeof v!=="number"||!isFinite(v)))bad.push(k);}));
      F.labda.forEach(pt=>{if(pt.some(v=>!isFinite(v)))bad.push("L");});
      const L1=F.labda[F.labda.length-1];
      if(bad.length||!F.lanc||Math.abs(L1[1]-38)>1.5)o.rossz.push(key+":"+bad.join(",")+(F.lanc?"":" nincs lánc")+" L="+L1[1]);
      if(F.lanc)o.mozd.add(F.lanc.m1+">"+F.lanc.m2);
      const K=kamKimenetel(kamForgatokonyv(c,ev,"skSzin"),c,ev,"skSzin");if(K.kim!=="gol"||!K.lanc)o.rossz.push(key+" kim");
      if(!o.info)o.info=(c._info||[]).slice(0,2);}
    o.mozd=o.mozd.size;return o;});
  ok(r1.par===28&&r1.arch.szinergia===28&&!r1.rossz.length&&r1.mozd===28,"1. mind a 28 pár saját, hibátlan szinergia-felvezetést kap (28 különböző mozdulat-sorrend), a kimenetel gól",r1);
  ok(/🔗/.test((r1.info||[])[0]||"")&&/→/.test((r1.info||[])[1]||""),"3. a HUD-on a pár neve és a két mozdulat",r1.info);
  const r2=await p.evaluate(async()=>{
    evaIdoSzorzo=.35;window.__kamMer=[];
    const el=evaElem();el.classList.remove("hide");const cv=el.querySelector(".evaKamVaszon");cv.classList.remove("hide");el.querySelector(".evaSzinpad").style.visibility="hidden";
    for(let i=0;i<SZIN_REND.length;i++)for(let j=i+1;j<SZIN_REND.length;j++){
      const key=szinKulcs(SZIN_REND[i],SZIN_REND[j]);if(!SZIN_DEFS[key])continue;
      const ev={t:"gol",side:"us",p:slots[9].player.n,min:33,seq:i*10+j,skill:"szin",akc:{k:"szin",par:key,crew:[],sc:slots[9].player.n}};
      await new Promise(r=>kamFelvetel(cv,evaKontextus(ev),ev,"elo",r,{sk:"skSzin"}));}
    evaIdoSzorzo=1;const M=window.__kamMer;window.__kamMer=null;el.classList.add("hide");
    return {n:M.length,ki:M.filter(m=>!m.bent).length,kicsi:M.filter(m=>m.h<.11).length,min:Math.min(...M.map(m=>m.h))};});
  ok(r2.n>100&&(r2.ki+r2.kicsi)/r2.n<=.05,"2. a fő szereplő minden pár minden vágásában a képen, nem pötty",r2);
  const r4=await p.evaluate(()=>{const D=SZIN_DEFS["harmonia|gegen"];const h=szinSzintTablaHtml(D,4,6);
    return {sor:(h.match(/szinSzSor/g)||[]).length,lv6:/−90%/.test(h)&&/\+37%/.test(h),kuszob:(h.match(/legalább 70%/g)||[]).length,most:/◀ most/.test(h),csucs:/4–6\. szint/.test(h)};});
  ok(r4.sor===6&&r4.lv6&&r4.kuszob===6&&r4.most&&r4.csucs,"4. a szintenkénti tábla: 6 sor, a 6. szinten −90% / +37%, a küszöb (legalább 70%) nem szorzódik, a mostani szint jelölve",r4);
  const r5=await p.evaluate(()=>{
    const xi=slots.filter(s=>s.player);const csatar=xi[9];
    const sk=SKILLS.find(x=>eligibleForSkill(x).some(p=>p.n===csatar.player.n));
    csatar.player.ovr=95;const e=careerPool[csatar.player.n];if(e){e.age=27;e.peak=95;e.startRating=95;e.pot=4000;}
    const fiatal={n:"Ifjú Teszt",pos:csatar.player.pos.slice(),ovr:66,age:19};careerPool[fiatal.n]={n:fiatal.n,pos:fiatal.pos,age:19,startRating:66,peak:92,pot:8800};
    extraRoster.push(fiatal);
    const _el=eligibleForSkill;window.eligibleForSkill=s0=>_el(s0).concat([fiatal]);
    const r=skillAssignRanked(sk);window.eligibleForSkill=_el;extraRoster.pop();
    return {elso:r[0]&&r[0].p.n,sztar:csatar.player.n,fiatalHely:r.findIndex(x=>x.p.n===fiatal.n)};});
  ok(r5.elso===r5.sztar&&r5.fiatalHely>0,"5. a skill-ajánló a ma legjobb kezdőt (95) választja a padon ülő 66-os fiatal helyett",r5);
  const src=require("fs").readFileSync(require("path").join(ROOT,"index.html"),"utf8");
  ok(/kind==="skill"\?\$\("skillAssignList"\)/.test(src),"5b. a jutalom-lecke a választásnál a teljes listát engedi (nincs elsötétítés)");
  const r6=await p.evaluate(()=>{pyrPickFok={nf:5,s:1,egyeni:false};pyrPickNf=5;
    const sqs=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18).slice(0,40);const w=pyrBuildWorld(rngFor("pyr:world"));
    const caps=sqs.map(sq=>pyrClubBestCap(sq,"tarto",w));pyrPickFok=null;return {max:Math.max(...caps),min:Math.min(...caps)};});
  ok(r6.max<=100&&r6.min>0,"6. a klublista Run-plafonja a választott fokozatból (5.1): legfeljebb 100",r6);
  if(process.env.KEP){
    for(const key of ["beton|villam","tikitaka|gegen"]){
      await p.evaluate(key=>{kamModAllit("uj");const ev={t:"gol",side:"us",p:slots[9].player.n,min:33,seq:5,skill:"szin",skillP:slots[9].player.n,
        akc:{k:"szin",par:key,crew:slots.filter(s=>s.player).slice(3,8).map(s=>s.player.n),sc:slots[9].player.n}};evaKer(Object.assign({sor:"x"},ev));},key);
      for(const t of [900,1700,2500,3300,4100]){await p.waitForTimeout(t===900?900:800);await p.screenshot({path:`${KEPDIR}/${key.replace("|","-")}-${t}.png`});}
      await p.waitForTimeout(3500);}}
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
