/* KLUBNEVEK — a visszaállítás ellenőrzése ÉLŐ JÁTÉKBAN.
   Nem a táblát olvassa vissza (azt a build már megtette), hanem a
   MEGJELENÍTÉSI RÉTEGET hívja: teamLabel / clubLabel / leagueLabel.
   Amit mér:
     · a visszaállított nevek tényleg kimennek-e a képernyőre,
     · maradt-e FONETIZÁLATLAN rövidítés bárhol a rétegen át,
     · a hárombetűs kódok egyediek-e (az eredményjelző ezen múlik),
     · a ligák (köztük a „Magyar Bajnokok") sértetlenek-e. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8951'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8951/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);

  const out=await p.evaluate(()=>{
    const o={};
    const kulcsok=Object.keys(HU_CLUB_TABLE);
    o.klubok=kulcsok.length;
    /* 1) A RÉTEGEN ÁT jönnek-e ki a visszaállított nevek? */
    const minta=["Liverpool FC","FC Barcelona","Real Madrid CF","Juventus FC","Inter Milan",
                 "Arsenal FC","Aberdeen FC","Al Ahly SC","Al Nassr FC","Ferencvárosi TC",
                 "Nottingham Forest","Norwich City","Panathinaikos","Leicester City"];
    o.reteg={};
    minta.forEach(k=>{o.reteg[k]=[teamLabel(k),clubLabel(k)];});
    /* 2) Maradt-e fonetizálatlan rövidítés a KIMENETEN? */
    const ROV=/\b(FC|SC|AC|BC|AS|AJ|CA|CR|KV|SK|SV|JK|SCO|FR|RB|RC|CF|CFC|CP|HSC|BSC|VfB|VfL|TC|VSC|US|EA|OGC|RSC|SSC|SS|SL|IFK|PSV|AFC)\b/;
    o.rovid_maradt=kulcsok.map(k=>teamLabel(k)).filter(n=>ROV.test(n));
    /* 3) NYERS név nem szivároghat ki: a kanonikus nevek egyike sem lehet a kimenet. */
    o.nyers_kiment=kulcsok.filter(k=>teamLabel(k)===k);
    /* 4) A kódok egyedisége — az eredményjelzőn két azonos kód olvashatatlan. */
    const kodok=kulcsok.map(k=>HU_CLUB_TABLE[k][1]);
    const szam={}; kodok.forEach(c=>szam[c]=(szam[c]||0)+1);
    o.ismetlodo_kod=Object.entries(szam).filter(([,n])=>n>1);
    o.kod_hossz_hiba=kodok.filter(c=>c.length!==3);
    /* 5) Ligák */
    o.ligak=Object.keys(HU_LEAGUE_TABLE).length;
    o.nbi=leagueLabel("NB I");
    /* 6) IDEMPOTENCIA: a réteg kétszer alkalmazva sem ronthat el semmit. */
    o.nem_idempotens=kulcsok.filter(k=>teamLabel(teamLabel(k))!==teamLabel(k));
    /* 7) eFCé-számláló a KIMENETEN */
    o.eFCe=kulcsok.filter(k=>teamLabel(k).includes("eFCé")).length;
    return o;});

  console.log(JSON.stringify(out,null,1));
  console.log("hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
