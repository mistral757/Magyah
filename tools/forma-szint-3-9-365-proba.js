/* 📈 A TARTÓS FORMA NEM NŐ A SZINTTEL (3.9.365).

   BEJELENTÉS: „magasabb rating szinteken könnyebben előfordul már, hogy 3-4,
   akár +5 rating fölényben is jelentősen kikap" · „2-3 mezőny fölötti erővel
   egyértelmű vereségek jönnek."

   Amit mér (egyjátékos piramis, ugyanaz a keret két szinten):
     1. 100 alatti hozzájárulásnál a forma hatása BITRE a régi (c × (m−1));
     2. magas szinten (a kezdők +70 Rating) a hatás legfeljebb a 100-as szinté,
        és a motor pillanatképe (buildMatchSnapshot) pontosan annyival mozdul,
        amennyit a kijelzés (pformTeamOvr) mond;
     3. a HUB kiírja a formát és a pályán érvényes rést, ha érdemben eltér;
     4. nincs oldalhiba. */
/* ⚖️ 3.9.289 — A SÚLYOZOTT MEZŐNY ÉS A CÉLRÉS-BECSLÉS EGYJÁTÉKOSBAN.

   KÉRÉS: „Ebből a részből [idénynyitó célrés-ablak, súlyozott mezőny], amit
   lehet a single player karrierekre is vezessünk át."

   Amit mér (valódi, kétoldalú piramis-karrier a beállítón át):
     1. az új karrier a súlyozott képlettel fut (S.pyr.suly);
     2. az idény vége rögzíti a záró NEVEZÉSI meccs-erőt;
     3. a kezdőrúgás: a rés a SÚLYOZOTT meccs-erőből áll be a rajt-célra —
        nyári +12 mellett a mezőny ≈ 12/2,25 = 5,3-del gyengébb, mint a régi
        képlettel; a napló kimondja; az idény sora rögzíti a számokat;
     4. a futó (régi) karrier — suly nélkül — betűre a régi;
     5. a nyári célrés-ablak becsléssel: a mezőny várható szintje, az indító,
        a záró, a súlyozott meccs-erő, a rajt-rés, a várható kimenet, és hogy
        mit jelent a döntés; a léptetés újraszámol;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9365;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    unlockGatesOn=()=>false;pendingWorldSeed="FORMA001";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    const nevek=slots.map(sl=>sl.player&&sl.player.n).filter(Boolean);
    const formaz=v=>{const F=pformState();nevek.forEach(n=>{F[n]=v;});};
    /* a régi képlet: c × (m−1) a kezdőkön (pformTeamOvr tükre, az él-tag nélkül) */
    const regi=()=>{let s=0;slots.forEach((sl,idx)=>{const pl=sl&&sl.player;if(!pl)return;const ent=careerPool[pl.n];
      const c=(ent&&ent.attrs)?posEffectiveRating(ent,sl.pos)+(pOvr(pl)-pl.ovr):pOvr(pl)*(sl.fit||1);s+=c*(pformMult(pl.n)-1);});return s/11;};
    const el=()=>{let be=0,bn=0;slots.forEach(sl=>{const pl=sl&&sl.player;if(!pl)return;if(sl.pos==="KP"||roleInFormation(sl.pos)==="VEDO"){be+=pformEdge(pl.n);bn++;}});
      const m=1-be/Math.max(1,bn);return bn&&m!==1?lamEquivOvr(1,m):0;};
    const snap=()=>{try{buildMatchSubs();}catch(e){}const M=buildMatchSnapshot();return M.ovr;};
    const meres=()=>{formaz(PFORM_MID);const o0=snap();formaz(3);const o3=snap();
      const most=pformTeamOvr(),rg=regi()+el();formaz(3);
      let hub="";try{hub=pyrNowHtml(levelGap()).replace(/<[^>]+>/g," ").replace(/\s+/g," ");}catch(e){hub="hiba "+e;}
      formaz(PFORM_MID);
      return {ms:Math.round(teamMatchStrength()*10)/10,most:Math.round(most*100)/100,regi:Math.round(rg*100)/100,
        motor:Math.round((o3-o0)*100)/100,hub};};
    const o={};
    o.alacsony=meres();
    S.ratingAdj=S.ratingAdj||{};nevek.forEach(n=>{S.ratingAdj[n]=(S.ratingAdj[n]||0)+70;});
    o.magas=meres();
    return o;});
  const A=r.alacsony,M=r.magas;
  ok(Math.abs(A.most-A.regi)<0.01&&A.most<-1,"1. 100 alatti szinten a forma hatása bitre a régi",A);
  ok(M.ms>140&&M.regi<M.most-1.5&&M.most<0,"2a. magas szinten a forma hatása korlátos: a régi képlet jóval többet vont volna le",{most:M.most,regi:M.regi,ms:M.ms});
  ok(Math.abs(M.motor-(M.most-0))<0.6&&Math.abs(A.motor-A.most)<0.6,"2b. a motor pillanatképe annyival mozdul, amennyit a kijelzés mond (az él-tag a kapott gólokon ül)",{alacsony:[A.motor,A.most],magas:[M.motor,M.most]});
  ok(/tartós formája most/.test(M.hub)&&/a pályán a rés így/.test(M.hub),"3. a HUB kiírja a formát és a pályán érvényes rést",M.hub.slice(0,300));
  ok(!errs.length,"4. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
