/* 🧱🙈🎯✨↩️ 1.0.12.18.01 — HÉT ÚJ JEGYZET
   KIMONDOTT KÉRÉS (🐞 jmwzb62fh55ir): „A blokk animációnál valami fura dolog történik a védővel. Javítsuk"
   KIMONDOTT KÉRÉS (🐞 jmwzaygxr5228): „Öngólnak nincs megcsinálva az animációja"
   KIMONDOTT KÉRÉS (🐞 jmwzbrugjb7rm): „Eltüntettük az öltöző gombot a kihívás gomb mellől de nem húztuk ki a kihívás
     gombot teljes szélességre. Gagyi"
   KIMONDOTT KÉRÉS (🐞 jmwzc2q8fjsm8): „A scout felfedezettek leigazolásakor is legyen az a menő animáció amivel
     megkapjuk a játékost (kártyával mindennel)"
   KIMONDOTT KÉRÉS (🐞 jmwzbup3z7nvf): „Továbbra is van egy csomó menün belüli almenupont, amit ha megnyitok, és utána
     bezárok, akkor utána nem a menü legutóbbi pontjához kerülök vissza, hanem bumm, vissza a HUB-ba"
   (A Szitálós visszaállítását — jmwzcbs1lavh0, jmwzbyohsfdnp — a szitalos-menu-korai-1-0-12-16-02 próba méri.)
   Amit mér:
     1. minden 3D jelenetben minden szereplő útja időrendben halad (a blokk hibája a felborult időrend volt);
     2. blokk: a védő a lövésig a lövő ELŐTT (a kapu felé) áll, és nem megy át rajta (≥ 0,8 m);
     3. öngól (nekünk): a beadásra a VÉDŐ ér oda, az ő fejéről megy a labda a kapuba, a csatár lekési, a kapus rossz
        irányba; az utolsó vágás a védőt mutatja;
     4. öngól (ellenünk): a vétkes a MI játékosunk, a mi mezünkben, a védő helyén (nem az ellenfél csatáraként);
     5. a Kihívások gomb az elrejtett Öltöző gomb mellett teljes szélességű;
     6. a felfedezett játékos ingyenes leigazolásakor jön az igazolás-jelenet (kártya);
     7. a HUB menü minden alpontja bezárás után — a gombbal ÉS a telefon vissza-gesztusával is — a menübe, a nyitott
        fülre, ugyanoda tér vissza (a hiba a vissza-gesztusnál volt: a rétegek listájából hiányzó ablakok nyitva
        maradtak, és a gesztus a menü fülét csukta be; a Klub arculatán a „Vissza a névből…" gombot nyomta meg);
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah",PORT=9681;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.IGAZ_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
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
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  await p.evaluate(()=>{document.querySelectorAll("#chPop").forEach(e=>e.remove());S.kut=null;window.saveGame=()=>{};mevKezd({});_mev.keret=8;_mev.anim=true;});
  /* 1–4. a 3D forgatókönyvek */
  const r=await p.evaluate(()=>{
    const fut=(sk,ev)=>{const c=evaKontextus(ev);const F0=kamForgatokonyv(c,ev,sk);const k=F0.ms;const F=kamKimenetel(F0,c,ev,sk);return {F,c,k:k/F.ms};};
    const p9=slots[9].player.n,p3=slots[3].player.n;
    const mono=[];
    const tipusok=[["gol",{t:"gol"}],["loves",{t:"loves",alt:"blokkolva"}],["bravur",{t:"bravur"}],["kapufa",{t:"kapufa"}],["vedes",{t:"vedes"}],
      ["skSzitalos",{t:"gol"}],["skAgyu",{t:"gol"}],["evOngol",{t:"gol",alt:"ongol",p:null}],["blokk",{t:"blokk"}],["golKapott",{t:"golKapott",side:"them"}]];
    for(const [sk0,e0] of tipusok)for(let seq=1;seq<=6;seq++){
      const ev=Object.assign({side:"us",p:p9,min:20+seq,seq},e0);let sk=sk0;
      try{sk=/^sk|^ev/.test(sk0)?sk0:(evaSkillSablon(ev)||evaAltSablon(ev)||EVA_TIPUS_SABLON[ev.t]);}catch(e){sk=sk0;}
      let o;try{o=fut(sk,ev);}catch(e){mono.push(sk0+":hiba "+e.message);continue;}
      for(const [n,s] of Object.entries(o.F.sz)){for(let i=1;i<s.ut.length;i++)if(s.ut[i][0]<s.ut[i-1][0]-1e-9){mono.push(sk0+"#"+seq+":"+n);break;}}}
    /* 2. blokk */
    const bl=[];
    for(let seq=1;seq<=8;seq++){const ev={t:"loves",alt:"blokkolva",side:"us",p:p9,min:30,seq};const sk=evaSkillSablon(ev)||evaAltSablon(ev)||EVA_TIPUS_SABLON[ev.t];
      const {F,k}=fut(sk,ev);if(F.kim!=="blokk")continue;
      const lo=F.sz.lo,v1=F.sz.v1;let dmin=99,elol=true;
      for(let t=k;t<=F.lovesT;t+=.01){const a=kamUt(lo.ut,t),b=kamUt(v1.ut,t);dmin=Math.min(dmin,Math.hypot(a[1]-b[1],a[2]-b[2]));}
      const a=kamUt(lo.ut,F.lovesT),b=kamUt(v1.ut,F.lovesT);if(!(b[1]>a[1]))elol=false;
      bl.push({seq,arch:F.arch,dmin:+dmin.toFixed(2),elol});}
    /* 3. öngól nekünk */
    const og=[];
    for(let seq=1;seq<=5;seq++){const ev={t:"gol",alt:"ongol",side:"us",p:null,min:40,seq};const {F}=fut("evOngol",ev);
      const t=F.lovesT,L=kamLabdaUt(F.labda,t),v=kamUt(F.sz.v1.ut,t),l=kamUt(F.sz.lo.ut,t);
      const dv=Math.hypot(L[0]-v[1],L[1]-v[2]),dl=Math.hypot(L[0]-l[1],L[1]-l[2]);
      const ut=F.vagas[F.vagas.length-1];
      og.push({kim:F.kim,dv:+dv.toFixed(2),dl:+dl.toFixed(2),ugrik:(v[4]||0)>.3,halo:!!F.halo,vag:ut.f.includes("v1"),kapus:kamUt(F.sz.kap.ut,1)[2]});}
    /* 4. öngól ellenünk */
    const ev4={t:"golKapott",alt:"ongol",side:"them",p:p3,min:50,seq:2};const c4=evaKontextus(ev4);
    const mi=kitForNow();
    const vart=evaFig(evaJatekos(p3,"us"),c4.vedoKit,-.2);
    const regi=evaFig(evaJatekos(p3,"them"),c4.loKit,.6,true);
    const o4={vedo:JSON.stringify(c4.vedoUrl)===JSON.stringify(vart),loNemO:JSON.stringify(c4.loUrl)!==JSON.stringify(regi),kitMi:JSON.stringify(c4.vedoKit)===JSON.stringify(mi)};
    return {mono,bl,og,o4};});
  ok(r.mono.length===0,"1. minden 3D jelenetben minden szereplő útja időrendben halad",r.mono.slice(0,8));
  ok(r.bl.length>=2&&r.bl.every(x=>x.elol&&x.dmin>=.8),"2. blokk: a védő a lövő előtt, nem megy át rajta",r.bl);
  ok(r.og.every(x=>x.kim==="ongol"&&x.dv<.6&&x.dl>1&&x.ugrik&&x.halo&&x.vag),"3. öngól (nekünk): a védő fejéről a kapuba, a csatár lekési, a vágás a védőn",r.og);
  ok(r.o4.vedo&&r.o4.loNemO&&r.o4.kitMi,"4. öngól (ellenünk): a vétkes a mi játékosunk, a mi mezünkben, a védő helyén",r.o4);
  /* 5. Kihívások gomb */
  const r5=await p.evaluate(()=>{const l=document.getElementById("lockerBtn"),c=document.getElementById("challengeViewBtn");l.classList.add("hide");
    const cs=getComputedStyle(c);return {gc:cs.gridColumnStart+"/"+cs.gridColumnEnd};});
  ok(r5.gc==="1/-1","5. a Kihívások gomb teljes szélességű, ha az Öltöző gomb rejtve",r5);
  /* 6. scout ingyenes leigazolás → jelenet */
  const r6=await p.evaluate(async()=>{
    const st=scoutRealState();const e=Object.values(careerPool).find(x=>!drafted.has(x.n));
    st.list.push({n:e.n,free:true,ok:"teszt"});
    const _w=scoutRealWindowOpen;window.scoutRealWindowOpen=()=>true;
    let res;try{res=scoutFreeSign(e.n);}finally{window.scoutRealWindowOpen=_w;}
    await new Promise(r=>setTimeout(r,700));
    const j=document.getElementById("igazJel");
    const o={ok:res.ok,jel:!!j,nev:j?j.textContent.includes(shortName(e.n))||j.innerHTML.length>200:false};
    try{if(j)j.remove();_igazFut=false;_igazSor.length=0;}catch(x){}
    return o;});
  ok(r6.ok&&r6.jel&&r6.nev,"6. a felfedezett játékos ingyenes leigazolásakor jön az igazolás-jelenet",r6);
  /* 7. menü-visszatérés minden első szintű alpontból */
  await p.evaluate(()=>{try{renderHub();}catch(e){}});
  const ids=await p.evaluate(()=>{hubMenuToggle(true);
    const o=[];document.querySelectorAll("#hubActions .hubGroup").forEach((g,gi)=>g.querySelectorAll(".accBody button[id]").forEach(b=>{
      if(!b.classList.contains("hide")&&b.style.display!=="none"&&!/EndCareer|kutBe|tch/.test(b.id))o.push({gi,id:b.id});}));return o;});
  const rossz=[];let nyilt=0;
  for(const it of ids){
    await p.evaluate(it=>{
      document.querySelectorAll("#guideDim,#guideTip,#mgmtModal").forEach(e=>e.classList.add("hide"));
      try{hubReturnToMenu();}catch(e){}
      hubMenuExit();hubMenuToggle(true,true);
      const g=document.querySelectorAll("#hubActions .hubGroup")[it.gi];const body=g.querySelector(".accBody");
      if(body.classList.contains("hide"))(g.querySelector(".accHead")||g.querySelector("button")).click();
      document.getElementById(it.id).scrollIntoView({block:"center"});},it);
    await p.waitForTimeout(350);
    await p.evaluate(it=>{window._preY=window.scrollY;document.getElementById(it.id).click();},it);
    await p.waitForTimeout(800);
    /* a bezárás: páros sorszámnál a TELEFON VISSZA-GESZTUSA (gameBackStep — mérve ez dobott ki), páratlannál a gomb */
    const zar=await p.evaluate(gesztus=>{
      const nyitva=!!hubOpenSubCard()||hubMenuOutsidePage()||[...document.querySelectorAll('[role="dialog"]')].some(d=>backVisible(d))
        ||["lockerModal","talModal"].some(id=>backVisible(document.getElementById(id)));
      if(!nyitva)return null;
      if(gesztus){const bs=[];const o=HTMLElement.prototype.click;HTMLElement.prototype.click=function(){bs.push(this.id||this.textContent.trim().slice(0,24));return o.call(this);};
        try{gameBackStep();}finally{HTMLElement.prototype.click=o;}return "vissza-gesztus → "+bs.join("|");}
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"&&!e.closest(".hide");};
      const bs=[...document.querySelectorAll("button")].filter(b=>vis(b)&&!b.closest("#hubActions")&&!b.closest("#navDock")&&!b.closest("#guideTip"));
      for(const re of [/Vissza a menübe/,/^\s*[✕×]\s*$|✕ Bezár|^Bezár/]){const b=bs.find(b=>re.test(b.textContent.trim()));if(b){b.click();return b.textContent.trim().slice(0,24);}}
      return null;},(nyilt%2)===0);
    if(!zar)continue;nyilt++;
    await p.waitForTimeout(800);
    const ut=await p.evaluate(it=>{const g=document.querySelectorAll("#hubActions .hubGroup")[it.gi];
      return {menu:_inHubMenu,acts:!document.getElementById("hubActions").classList.contains("hide"),hub:!document.getElementById("scHub").classList.contains("hide"),
        grp:!g.querySelector(".accBody").classList.contains("hide"),dy:Math.round(window.scrollY-window._preY)};},it);
    if(!(ut.menu&&ut.acts&&ut.hub&&ut.grp&&Math.abs(ut.dy)<=24))rossz.push(Object.assign({id:it.id,zar},ut));}
  ok(nyilt>=15&&rossz.length===0,`7. a menü ${nyilt} alpontja bezárás után (gomb és vissza-gesztus felváltva) a menübe, a nyitott fülre, ugyanoda tér vissza`,rossz);
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
