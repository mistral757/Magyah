/* OSZTÁLYNEVEK — a két mód nehézségi/osztály-létrája.
   AMIT ŐRIZ: a CUP_TIERS egyetlen sávja se NYERS liga-kulcs legyen. Ez nem
   elméleti: a „NB I" sáv éveken át nyersen ment ki a képernyőre, mert a
   diffTierLabel nem megy át a névrétegen — és nem is mehet át, mert ez a lánc
   BETÖLTÉSKOR fut, a névréteg állapota előtt. A védelem tehát csak a forrásban
   lehet, és itt mérjük. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8993'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8993/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  const o=await p.evaluate(()=>({
    dinamikus:[72,77,82,87,92,97,120].map(r=>`${r} → ${diffTierLabel(r)}`),
    hagyomanyos:PYR_LEAGUES.map((n,i)=>`D${i+1} → ${n}`),
    /* A DÖNTŐ ELLENŐRZÉS: egyik sávnév se legyen a liganév-tábla KULCSA
       (az nyers, valós liganevet jelentene). */
    nyers_kulcs_a_savokban:CUP_TIERS.map(t=>t.league).filter(l=>HU_LEAGUE_TABLE[l]),
    nyers_kulcs_a_piramisban:PYR_LEAGUES.filter(l=>HU_LEAGUE_TABLE[l]),
    /* és sehol ne maradjon NB-hivatkozás a sávnevekben */
    nb_a_savokban:CUP_TIERS.map(t=>t.league).concat(PYR_LEAGUES).filter(l=>/\bNB\s*I{1,3}\b/.test(l)),
  }));
  console.log(JSON.stringify(o,null,1));
  console.log("betöltési hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
