/* 📐 MÉRÉS: mennyivel nehezedne a kupa, ha a mezőny a MECCS-ERŐHÖZ mérne?

   Nem próba, hanem MÉRŐESZKÖZ — kilépési kódja mindig 0. A kupamezőny ma
   `max(nyers, mezőnyszint) + befagyasztott_rejtett/2 − edge` alapon épül;
   a javasolt képlet `meccs-erő − edge`. A különbség nagyjából a rejtett
   bónusz FELE, ami a karrier elején +2, a végén +30 fölött is lehet.

   Kimenet: karrier-szakaszonként és sorozatonként a mai mezőny, a javasolt
   mezőny, a különbség, és — ami igazán számít — a RÉS (meccs-erő − mezőny)
   mindkét változatban. A rés a játszhatóság mércéje. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9095;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type","text/html; charset=utf-8");
  fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext()).newPage();
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const out=await p.evaluate(()=>{
    const R=[];
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
    {const k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const s2=k[i%k.length];
       const pl={n:"M "+i+" "+s2.n,ovr:90,pos:(s2.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);try{drafted.add(pl.n);}catch(e){}});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;infinityMode=true;
    {const lv={};Object.keys(TACTICS).forEach(k=>{lv[k]=95;});S.tactics={levels:lv,active:"totalis"};}
    S.seasonHistory=[{season:1,oppRating:84,rank:3}];

    /* OPTIMÁLIS KEZDŐ 11: a beépített képlet a NEVEZÉSI (lebutítás-védett)
       meccs-erőre horgonyoz, tehát egy rosszul összeállított teszt-tizenegynél
       a mért rés zajos lenne. Előbb kiállítjuk a motor saját optimumát.
       A REJTETT BÓNUSZ VEZÉRELVE. A szintetikus karrieré csak +6; a valódi
       (beküldött képernyő) +30,1. A képlet lineáris benne, tehát a becslés
       akkor tisztességes, ha a teljes tartományt végigmérjük. */
    const _hid=hiddenMatchBonus;
    let HID=0;
    hiddenMatchBonus=()=>HID;

    const COMPS=["BL","EL","KL","MK"];
    /* Az edge-et MAGUNK számoljuk (az EURO_BASE_EDGE const), a játék saját
       képletével: min(base + DOM*dom + add, cap). */
    const EDGE=(c,dom,base,capMul)=>
      Math.min(base+EURO_DOM_EDGE*dom+EURO_EDGE[c].add, EURO_EDGE[c].cap*capMul);
    /* A „BEÉPÍTVE" oszlop a MOSTANI kódot futtatja (euroMidRating), a többi
       összehasonlító változat. A „RÉGI" a 3.9.126 előtti képlet. */
    const VAR=[{n:"BEÉPÍTVE",live:true},
               {n:"base6.2",base:6.2,cap:1.0}];
    const SZAK=[{n:"korai",ovr:88,lvl:84},{n:"közép",ovr:110,lvl:105},
                {n:"kései",ovr:140,lvl:135},{n:"szuper",ovr:178,lvl:170}];
    const HIDS=[4,10,20,30];

    SZAK.forEach(sz=>{
      slots.forEach(sl=>{if(sl.player)sl.player.ovr=sz.ovr;});
      oppTargetRating=sz.lvl;
      {const bc=msWithRestore(msBestConfig);
       if(bc){const pool=fullCareerRoster().filter(Boolean);
         const arr=arrangeSlotsFor(bc.form,pool);form=bc.form;slots=arr.slots;captainIdx=bc.cap;
         if(S.tactics)S.tactics.active=bc.tac;
         bc.xi.forEach((nm,i)=>{const pl=pool.find(x=>x.n===nm);
           if(pl&&slots[i]){slots[i].player=pl;slots[i].fit=fitFor(pl,slots[i]);}});}}
      const ts=teamStrength();
      HIDS.forEach(h=>{
        HID=h;S.oppBuffH=null;freezeSeasonHiddenBonus();
        const hidF=seasonHiddenBonus(),ms=ts+h;
        const dom=euroDominance();
        const sor={};
        COMPS.forEach(c=>{
          const dd=(EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0;
          const e0=Math.min(1.2+EURO_DOM_EDGE*dom+({BL:0,EL:1,KL:2,MK:3}[c]),
                            {BL:4.5,EL:6,KL:7.5,MK:9}[c]);
          /* A RÉGI KÉPLET pontosan: round(f − d) a hívónál + d — a kettő
             kiejti egymást, tehát a mezőny maga `f`. Az első változatom
             itt kétszer alkalmazta az oppDelta-t, és hamis lépcsőt adott. */
          const most=Math.round(Math.max(ts,sz.lvl)+hidF*(1-OPP_BUFF_MEASURED)-e0-dd)+dd;
          sor[c]={most:Math.round((ms-most)*10)/10};
          VAR.forEach(v=>{
            let uj;
            if(v.live){uj=euroMidRating(c)+dd;}
            else{const e=EDGE(c,dom,v.base,v.cap);
                 uj=Math.round(Math.max(ms,sz.lvl)-e-dd)+dd;}
            sor[c][v.n]=Math.round((ms-uj)*10)/10;});});
        R.push({szak:sz.n,hid:h,ts:Math.round(ts*10)/10,ms:Math.round(ms*10)/10,
                dom:Math.round(dom*100)/100,sor,vars:["most"].concat(VAR.map(v=>v.n))});});});
    hiddenMatchBonus=_hid;
    return R;});

  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  MENNYIVEL NEHEZEDNE A KUPA A MECCS-ERŐS MÉRÉSTŐL?                  ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  const vars=out[0].vars.slice(1);
  console.log("\nA RES (meccs-ero - mezony). Kisebb = nehezebb. REGI = a 3.9.126 elotti keplet.\n");
  let last="";
  out.forEach(r=>{
    if(r.szak!==last){console.log(`\n▸ ${r.szak.toUpperCase()}  (nyers ${r.ts})`);last=r.szak;}
    console.log(`  rejtett +${String(r.hid).padStart(2)}  meccs-ero ${String(r.ms).padStart(5)}  dom ${r.dom}`);
    console.log("     sor   REGI "+vars.map(v=>v.padStart(10)).join(""));
    Object.keys(r.sor).forEach(c=>{
      const s=r.sor[c];
      console.log(`     ${c.padEnd(4)} ${String(s.most).padStart(6)}`
        +vars.map(v=>String(s[v]).padStart(10)).join(""));});});
  console.log("\nres = meccs-ero - mezony. Ez a jatszhatosag mercéje: pozitiv = te vagy erosebb.");
  await b.close();srv.close();process.exit(0);})();
