/* ORSZÁGNEVEK, VÁLOGATOTT-CÍMKÉK ÉS A KEZDŐLAP SZÁMAI — élő mérés.
   Amit néz:
     · a válogatott-keretek neve és évszáma (a kitüntető jelző eltűnt-e),
     · a nemzetiség ugyanabból a táblából megy-e ki,
     · a kanonikus `season` VÁLTOZATLAN maradt-e (a mentések ezt tárolják),
     · a kezdőlap három száma az adatbázisból jön-e,
     · a fejléc alcíme nem tartalmaz-e elavult klubnevet. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8991'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const h=[]; p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8991/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2800);
  const o=await p.evaluate(()=>{
    const r={};
    const val=SQUADS.filter(x=>x.wc);
    r.valogatott_db=val.length;
    r.minta=val.slice(0,6).concat(val.filter(x=>/·/.test(x.season)).slice(0,6))
      .map(sq=>({nyers:`${sq.club} (${sq.season})`,
                 kiirt:teamLabel(`${sq.club} (${sq.season})`)}));
    /* a kanonikus adat NEM változhat — a mentések erre hivatkoznak */
    r.kanonikus_erintetlen=val.every(sq=>/^(19|20)\d{2}\s+(VB|EB)/.test(sq.season));
    r.nev_maradt=!!findSquadByOppName("Brazília (1970 VB · a világbajnok)");
    /* maradt-e bárhol kitüntető jelző a KIÍRÁSBAN */
    r.jelzo_maradt=val.map(sq=>teamLabel(`${sq.club} (${sq.season})`)).filter(x=>/·|VB|EB/.test(x));
    /* nemzetiség */
    r.nat={magyar:natLabel("Magyarország"),olasz:natLabel("Olaszország"),
           spanyol:natLabel("Spanyolország"),ismeretlen:natLabel("Atlantisz")};
    r.nat_tabla=Object.keys(HU_NAT_TABLE).length;
    /* klubszezon marad */
    r.klubszezon_erintetlen=teamLabel("Real Madrid CF (1959/60)");
    /* a kezdőlap számai */
    r.szamok={bajnoksag:$("heStatLig").textContent,klubszezon:$("heStatSquads").textContent,
              jatekos:$("heStatPlayers").textContent};
    r.fejlec=hdrSubText();
    return r;});
  console.log(JSON.stringify(o,null,1));
  console.log("hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
