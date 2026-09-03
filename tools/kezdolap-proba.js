/* A KEZDŐLAP — mérés mindhárom témában.
   Amit néz: kilóg-e a lap vízszintesen, megvan-e minden vezérlő, működik-e a
   témaváltás (a színek TÉNYLEG változnak-e), és él-e a két karrierút. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8981'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[]; const out={};
  for(const [tema,cimke] of [["dark","Sötét-arany"],["paper","Törtfehér"],["noir","Noir"]]){
    out[cimke]={};
    for(const w of [320,360,430]){
      const p=await b.newPage({viewport:{width:w,height:860}});
      p.on('pageerror',e=>hiba.push(`${cimke}/${w}: ${e.message}`));
      p.on('console',m=>{if(m.type()==='error')hiba.push(`${cimke}/${w}: ${m.text()}`)});
      await p.goto('http://localhost:8981/index.html',{waitUntil:'networkidle'});
      await p.evaluate(t=>{try{localStorage.setItem("theme30_0",t);}catch(e){}},tema);
      await p.reload({waitUntil:'networkidle'});
      await p.evaluate(()=>document.fonts.ready);
      await p.waitForTimeout(2600);   /* az animációk kifutása: a lap 1,35 mp-ig még halványul */
      const r=await p.evaluate(()=>{
        const cs=getComputedStyle(document.documentElement);
        const e=document.getElementById("mpEntry");
        const van=id=>{const x=document.getElementById(id);return !!x&&!x.classList.contains("hide");};
        return {
          tulcsordul:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          entryTul:e.scrollWidth-e.clientWidth,
          bg:cs.getPropertyValue("--bg").trim(),
          gold:cs.getPropertyValue("--gold").trim(),
          hatter:getComputedStyle(e).backgroundColor,
          cim:(document.querySelector(".heTitle")||{}).textContent,
          idezet:((document.getElementById("heQuote")||{}).textContent||"").slice(0,80),
          gombok:{cta:van("mpSoloBtn"),duel:van("mpDuelBtn"),utak:document.querySelectorAll(".heWay").length,
                  labjegyzet:!!document.querySelector(".heFootNote"),
                  labLinkek:document.querySelectorAll(".heFootLinks button").length},
          maradt30:(document.body.innerText.match(/30\s*[-–]\s*0/g)||[]).length};
      });
      out[cimke][w+"px"]=r;
      if(w===360){
        await p.screenshot({path:`/home/user/Magyah/tools/ikon/kezdo-${tema}.png`,fullPage:true});}
      await p.close();
    }
  }
  console.log(JSON.stringify(out,null,1));
  console.log("hibák:",hiba.length?hiba:"nincs");
  await b.close(); srv.kill();
})();
