const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');const fs=require('fs');
/* 🧑 ARCKÉP-GALÉRIA (3.9.267) — szemre ellenőrzéshez, nem pass/fail próba.
   100 valódi játékos sima és pixeles arca, plusz öregedés- és morál-sorok.
   Használat: node tools/arckep-galeria.js <kimeneti-mappa>
   Kimenet: g1.png (sima), g2.png (pixeles), g3.png (kor és morál),
            g4/g5.png (15-ös kivágás, sima/pixeles). */
const OUT=process.argv[2]||'.', FACE=process.argv[3];
(async()=>{
  const srv=spawn('python3',['-m','http.server','8973'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:1200,height:900}});
  const hiba=[];p.on('pageerror',e=>hiba.push(e.message));
  await p.goto('http://localhost:8973/index.html',{waitUntil:'networkidle'});
  if(FACE)await p.addScriptTag({content:fs.readFileSync(FACE,'utf8')});
  await p.waitForTimeout(800);
  const html=await p.evaluate(async()=>{
    const all=[],volt=new Set();SQUADS.forEach(s=>s.players.forEach(x=>{if(!volt.has(x.n)){volt.add(x.n);all.push({x,col:s.col});}}));
    const pick=[];const step=Math.floor(all.length/100);
    for(let i=0;i<100;i++){const e=all[i*step+7];
      const age=17+(faceHash(e.x.n+"kor")%22);
      const pat=KIT_PATTERNS[faceHash(e.x.n+"m")%KIT_PATTERNS.length].k;
      pick.push({p:{n:e.x.n,nat:e.x.nat,age},kit:{c1:e.col[0],c2:e.col[1]||"#fff",pat,collar:["crew","v","polo"][faceHash(e.x.n)%3],ink:"#fff"}});}
    const cell=(q,pix)=>`<div style="width:112px;text-align:center;font:10px sans-serif;color:#ccc">${faceImgHtml(q.p,104,{kit:q.kit,pix,mood:((faceHash(q.p.n+"md")%9)-4)/4.5})}<div style="height:24px;overflow:hidden">${q.p.n}<br>${q.p.nat||""}, ${q.p.age}</div></div>`;
    const grid=(pix,n,w)=>`<div style="display:flex;flex-wrap:wrap;gap:4px;width:${w||1180}px">${pick.slice(0,n||100).map(q=>cell(q,pix)).join("")}</div>`;
    const aging=["Lionel Messi","Kevin Trapp","David Abraham","Alexander Isak","Timmy Chandler","Jetro Willems"].map(n=>{
      const e=all.find(z=>z.x.n===n)||all[3];
      return `<div style="display:flex;gap:6px;margin:4px 0">`+[18,23,28,32,35,38].map(a=>`<div style="text-align:center;font:10px sans-serif;color:#ccc">${faceImgHtml({n:e.x.n,nat:e.x.nat,age:a},96,{kit:{c1:e.col[0],c2:e.col[1],pat:"plain",collar:"crew",ink:"#fff"},mood:0})}${a}</div>`).join("")
        +`<div style="width:30px"></div>`+[-1,-.5,0,.5,1].map(m=>`<div style="text-align:center;font:10px sans-serif;color:#ccc">${faceImgHtml({n:e.x.n,nat:e.x.nat,age:27},96,{kit:{c1:e.col[0],c2:e.col[1],pat:"plain",collar:"crew",ink:"#fff"},mood:m})}m ${m}</div>`).join("")+`</div>`;}).join("");
    document.body.innerHTML=`<div id="g1" style="background:#15181e;padding:10px">${grid(false)}</div><div id="g2" style="background:#15181e;padding:10px">${grid(true)}</div><div id="g4" style="background:#15181e;padding:10px;width:600px">${grid(false,15,600)}</div><div id="g5" style="background:#15181e;padding:10px;width:600px">${grid(true,15,600)}</div><div id="g3" style="background:#15181e;padding:10px">${aging}</div>`;
    document.body.style.background="#15181e";document.body.style.maxWidth="none";document.body.style.width="1300px";document.body.style.margin="0";
    await new Promise(r=>setTimeout(r,2500));
    return document.querySelectorAll("img[data-facepix]").length;});
  console.log("várakozó pix:",html,"hibák:",hiba.slice(0,3));
  for(const id of ["g1","g2","g3","g4","g5"])await (await p.$("#"+id)).screenshot({path:`${OUT}/${id}.png`});
  await b.close();srv.kill();
})();
