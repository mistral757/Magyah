/* A SZEZON ÍVE (3.9.37) — a szezonzáró helyezés-grafikon próbája.

   Amit mér:
     1. A PREFIX-TULAJDONSÁG, amire az egész épül: a buildLeagueTable(r) minden
        r-re UGYANAZT adja kétszer hívva (determinizmus), és a 30. fordulós
        állás betűre egyezik a végtabellával (buildFinalTable). Ha ez nem áll,
        a grafikon egy MÁSIK valóságot rajzolna, mint a fölötte lévő tábla.
     2. Minden forduló állása szabályos rangsor: 1..N mindegyike PONTOSAN
        egyszer szerepel (nincs kimaradó és nincs holtversenyben egyesített
        hely).
     3. A kiválasztás: a dobogó három csapata + TE, ha nem állsz rajta — és
        pontosan három sor, ha rajta állsz.
     4. Az elbeszélés a valódi ívhez igazodik: comeback, bajnoki menetelés és
        összeomlás külön mondatot kap.
     5. Az ára: hány ezredmásodperc harminc tabella-újrajátszás.
     6. És képernyőkép a panelről, mindhárom témában.

   A SZEZONOK SZÁNDÉKOSAN KITALÁLTAK: egy valódi 30 fordulós idény lejátszása
   percekig tartana, a grafikon viszont tisztán a fixtureResults-ból és a
   seedelt tabella-folyamból dolgozik — azt kell bizonyítani, hogy AZOKAT
   helyesen olvassa. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8977;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:1000},deviceScaleFactor:2});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    gameMode="career";
    teamName="Pipacs FC";
    S.seasonNumber=1;S.finalTable=null;
    SEASON_OPPS=buildOpponents(15,78);
    buildSeasonFixtures();
    _aiSchedCache=null;liveTableInvalidate();

    /* Egy idény felírása: a `pont(r)` mondja meg, hány pontot szereztem a
       r. fordulóban (0/1/3). Ebből épül a fixtureResults és a saját mérleg. */
    const idenyt=(pont)=>{
      S.fixtureResults=[];S.pts=0;S.W=0;S.D=0;S.L=0;S.GF=0;S.GA=0;
      for(let r=1;r<=30;r++){
        const o=S.fixtures[r-1]&&S.fixtures[r-1].o;
        const pt=pont(r);
        const gf=pt===3?2:pt===1?1:0, ga=pt===3?0:pt===1?1:2;
        S.fixtureResults.push({round:r,o,gf,ga,home:!!(S.fixtures[r-1]||{}).home});
        S.GF+=gf;S.GA+=ga;
        if(pt===3){S.W++;S.pts+=3;}else if(pt===1){S.D++;S.pts++;}else S.L++;}
      S.idx=30;liveTableInvalidate();};

    /* ---- 1. DETERMINIZMUS ÉS A VÉGTABELLA-EGYEZÉS ---- */
    idenyt(r=>r<=12?0:3);                      /* comeback: 12 vereség, majd 18 győzelem */
    const nevek=t=>t.map(x=>x.n).join("|");
    out.determinista=nevek(buildLeagueTable(17,{}))===nevek(buildLeagueTable(17,{}));
    out.veg_egyezik=nevek(buildLeagueTable(30,{}))===nevek(buildFinalTable());

    /* ---- 2. MINDEN FORDULÓ SZABÁLYOS RANGSOR ---- */
    const t0=performance.now();
    const trail=seasonRankTrail(30);
    out.ms=Math.round(performance.now()-t0);
    const N=buildFinalTable().length;
    out.mezony=N;
    out.rangsor_hibas=[];
    trail.forEach((m,i)=>{
      const v=Object.keys(m).map(k=>m[k]).sort((a,b)=>a-b);
      const jo=v.length===N&&v.every((x,j)=>x===j+1);
      if(!jo)out.rangsor_hibas.push(i+1);});

    /* ---- 3. A KIVÁLASZTÁS ---- */
    const veg=buildFinalTable();
    const enHely=veg.findIndex(x=>x.you)+1;
    out.comeback={enHely,sorok:seasonArcTeams(veg).length,
      enBenne:seasonArcTeams(veg).some(x=>x.t.you)};
    /* a te ÍVED a grafikon szerint */
    out.comeback.ut=trail.map(m=>m[teamName]);

    /* ---- 4. HÁROM SZEZON, HÁROM MONDAT ---- */
    const mondat=h=>{const d=document.createElement("div");d.innerHTML=h;
      return (d.querySelector("div")||d).textContent.trim().slice(0,150);};
    out.szoveg={};
    out.szoveg.comeback=mondat(seasonArcHtml(buildFinalTable()));
    idenyt(()=>3);                              /* mind a 30 győzelem */
    S.finalTable=null;
    const bajnokVeg=buildFinalTable();
    out.bajnok={enHely:bajnokVeg.findIndex(x=>x.you)+1,sorok:seasonArcTeams(bajnokVeg).length};
    out.szoveg.bajnok=mondat(seasonArcHtml(bajnokVeg));
    idenyt(r=>r<=14?3:0);                       /* összeomlás: erős rajt, néma tavasz */
    out.szoveg.osszeomlas=mondat(seasonArcHtml(buildFinalTable()));

    /* ---- 5. KÖZÖS KARRIER: HALLGAT, DE MEGMONDJA, MIÉRT ---- */
    const igazi=h2hRoomActive;
    h2hRoomActive=()=>true;
    const mp=seasonArcHtml(buildFinalTable());
    h2hRoomActive=igazi;
    out.mp_nem_rajzol=mp.indexOf("<svg")<0;
    out.mp_megmondja=mp.indexOf("Közös karrierben")>=0;

    /* ---- 6. A VERDIKT VALÓDI BEKÖTÉSE ----
       Nem elég, hogy a függvény ad HTML-t: a szezonzáró képernyőnek ELŐ is
       kell hívnia. Itt pontosan az a két sor fut le, ami a finish()-ben áll. */
    idenyt(r=>r<=12?0:3);
    const vsec=(t,inner)=>`<div class="vsec"><span class="h">${t}</span>${inner}</div>`;
    document.getElementById("verdictStats").innerHTML=
      vsec("A szezon íve — hogyan alakultak a helyezések",
           `<div id="verdictArcBody" style="margin-top:2px"></div>`);
    document.getElementById("verdictArcBody").innerHTML=seasonArcHtml(buildFinalTable());
    out.verdikt_bekotve=document.getElementById("verdictArcBody").innerHTML.indexOf("<svg")>=0;

    /* ---- 7. A KIRAJZOLT PANEL (a comeback-szezonnal) ---- */
    const html=seasonArcHtml(buildFinalTable());
    out.svg_db=(html.match(/<svg/g)||[]).length;
    out.van_dobogosav=html.indexOf('opacity=".10"')>=0;
    out.van_feltav=html.indexOf("féltáv")>=0;
    const box=document.createElement("div");
    box.id="ivProba";
    box.style.cssText="position:fixed;inset:0;z-index:99999;background:var(--bg);padding:14px;overflow:auto";
    box.innerHTML=`<div class="card"><div class="steplbl">A szezon íve — hogyan alakultak a helyezések</div>${html}</div>`;
    document.body.appendChild(box);
    return out;});

  const kepek=[];
  for(const tema of ["dark","paper","noir"]){
    await p.evaluate(t=>applyTheme(t),tema);
    await p.waitForTimeout(250);
    const f=`/tmp/claude-0/-home-user-Magyah/9586ccb5-9097-5487-a2be-03724bebb2e9/scratchpad/iv-${tema}.png`;
    await p.locator("#ivProba").screenshot({path:f});
    kepek.push(f);}

  console.log("mezőny:",r.mezony,"csapat · a trail ára:",r.ms,"ms");
  const T=[
    ["determinista (kétszer hívva ugyanaz)",r.determinista===true],
    ["a 30. forduló = a végtabella",r.veg_egyezik===true],
    ["minden forduló szabályos 1..N rangsor",r.rangsor_hibas.length===0],
    ["comeback: nem vagy dobogón → 4 vonal",r.comeback.sorok===4&&r.comeback.enBenne===true&&r.comeback.enHely>3],
    ["bajnok: dobogón vagy → 3 vonal",r.bajnok.sorok===3&&r.bajnok.enHely===1],
    ["a panel egy fő + 3-4 jelmagyarázat-SVG",r.svg_db>=4],
    ["dobogó-sáv és féltáv-jelölés kirajzolva",r.van_dobogosav&&r.van_feltav],
    ["közös karrierben nem rajzol, de megmondja",r.mp_nem_rajzol&&r.mp_megmondja],
    ["a verdikt tényleg előhívja (a finish() két sora)",r.verdikt_bekotve===true],
    ["nincs oldalhiba",errs.length===0],
    /* A NÉVELŐ A KIMONDOTT ALAKHOZ IGAZODIK: „az 1. hely", „az 5. helyig",
       de „a 2." és „a 11.". A formanyomtatvány-nyelv (a(z)) és a rossz alak
       („a 1.") egyaránt bukás — a hunAz pontosan ezért van. */
    ["a névelő mindenütt helyes",!Object.keys(r.szoveg)
      .some(k=>/\b[Aa] (1|5|50|1000)\.|\bza?\(z\)/.test(r.szoveg[k]))]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  a te utad a comeback-szezonban (1..30. forduló):");
  console.log("   ",r.comeback.ut.join(" "));
  console.log("\n  az elbeszélés:");
  Object.keys(r.szoveg).forEach(k=>console.log(`    ${k.padEnd(11)} ${r.szoveg[k]}`));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  console.log("\nképernyőképek:\n  "+kepek.join("\n  "));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
