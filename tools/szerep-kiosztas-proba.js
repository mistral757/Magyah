const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8977'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  await p.goto('http://localhost:8977/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={};
    // Valódi játékosok a névtáblából, hogy a fullName tényleg MÁST adjon.
    const L=activeSquads(); const klub=L.find(x=>x.players&&x.players.length>=11);
    const jeloltek=klub.players.slice(0,3);
    out.jeloltek=jeloltek.map(x=>({kanonikus:x.n,megjelenitve:fullName(x.n),
      elter:x.n!==fullName(x.n)}));
    // A kiosztó két bemenete stubolva — minden más a VALÓDI kód.
    const K0=window.roleKeysForStyle, C0=window.roleCandidates;
    window.roleKeysForStyle=()=>["b2b"];
    window.roleCandidates=()=>jeloltek;
    let html=""; try{html=roleSectionHtml();}catch(e){out.hiba=e.message;}
    if(out.hiba){window.roleKeysForStyle=K0;window.roleCandidates=C0;return out;}
    const d=document.createElement("div"); d.innerHTML=html;
    const sel=d.querySelector("select.roleSel");
    if(!sel){out.nincs_select=true;return out;}
    const o=[...sel.querySelectorAll("option")].filter(x=>x.value)[0];
    out.elso_opcio={value:o.value, felirat:o.textContent.trim().slice(0,44)};
    out.value_kanonikus = (o.value===jeloltek[0].n);
    out.felirat_magyaritott = o.textContent.includes(shortName(jeloltek[0].n));
    // A KÖR: kiosztás a menü útján → visszaolvasás
    roleAssign("b2b",o.value);
    out.terkepben=roleState().map.b2b;
    out.kor_bezarul = (roleState().map.b2b===jeloltek[0].n);
    roleAssign("b2b",null);
    window.roleKeysForStyle=K0; window.roleCandidates=C0;
    return out;});
  console.log(JSON.stringify(r,null,1));
  console.log("HIBAK:",h.length?h.slice(0,3):"nincs");
  await b.close(); srv.kill();
})();
