/* 🏆 1.0.7.3.00 — A KUPA A CÍMLAPON.
   Amit mér:
     1. minden sorozat × minden helyzet (selejtező, csoport / ligaszakasz,
        oda-visszavágó, továbbjutás, tizenegyesek, kiesés, döntő) × 30
        sorsolás: egyetlen hibás cím sincs; a döntő hype-fokozatai; a KK- és a
        Hiper-döntő különszáma; bajnoki meccsen nincs kupacím; egy erős esti
        esemény mellett a kupa a rovatba kerül;
     2. a kupa az este extrái között, a cikk szurkolót hoz, a nagy döntő többet;
        a szezontörténet nem írja felül;
     3. az előzetesek (különkiadás a nagy döntő előtt) és a kampány vége;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9437;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
let HTMLSRC=null;   /* a 6. lépésben a beépített másolatot szolgáljuk ki */
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/index.html"&&HTMLSRC){rp.setHeader("content-type",TYPES[".html"]);rp.end(HTMLSRC);return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
const karrier=()=>{
  window.mgmtNyit=()=>false;
  gameMode="career";
  enterCareerSetupFromHome(true);
  beginNewGame();
  const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
  showChemistry=()=>{};
  S.pyr=null;S.idx=0;
  pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
  pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
  renderPyrDivPick();pyrConfirmDiv();
  if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
  slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
    const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
  if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
  phase="season";S.seasonClosed=false;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  let p=await ctx.newPage();
  const errs=[];const figyel=pg=>{pg.on("pageerror",e=>errs.push(String(e)));
    pg.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});};
  figyel(p);
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof pressKupaCim==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});


  const r=await p.evaluate(karrier=>{
    try{localStorage.clear();}catch(e){}
    (0,eval)("("+karrier+")")();
    const out={sorok:[],hibas:[]};
    const ellenoriz=(t,hol)=>{if(!t||/undefined|null|NaN|\$\{|\[object/.test(t))out.hibas.push({hol,t});};
    const naplo=[];const al=window.addLine;window.addLine=(t,c)=>{naplo.push({t:String(t),c});};
    const V0=()=>({mvp:{n:slots[9].player.n,grade:"remek",gi:3},score:72});
    const cim=(comp,stage,gf,ga,x)=>{
      const cup=Object.assign({comp,stage,leg:0,legs:2,md:2,mdLast:6,opp:"Ellenfél FC",home:true,neutral:false,tie:null,pens:null},x||{});
      const o={gf,ga,last:{us:teamName,them:"Ellenfél FC",players:[]},cup};
      const V=V0();V.extras=[];
      const H=pressHeadline(V,o);ellenoriz(H.t,comp+stage);if(H.lead)ellenoriz(H.lead,comp+stage+"L");if(H.rovat)ellenoriz(H.rovat,comp+stage+"R");
      return H;};
    /* minden helyzet minden sorozatban, sokszor (a sablonok véletlenek) */
    const COMPS=["BL","HSZ","EL","KL","MK","FA","NYK"];
    for(const comp of COMPS)for(let i=0;i<30;i++){
      cim(comp,"qual",1,0);cim(comp,"qual",0,2,{leg:1,tie:{mine:1,theirs:3,diff:-2,advanced:false,byPens:false}});
      cim(comp,"qual",2,0,{leg:1,tie:{mine:3,theirs:1,diff:2,advanced:true,byPens:false}});
      cim(comp,"group",2,1,{md:0});cim(comp,"group",1,1,{md:3});cim(comp,"group",0,1,{md:5});cim(comp,"group",3,0,{md:5});
      const RS=compRounds(comp);
      for(const st of RS.filter(x=>x!=="final")){
        cim(comp,st,1,0);cim(comp,st,1,1);cim(comp,st,0,2);
        cim(comp,st,2,1,{leg:1,tie:{mine:3,theirs:2,diff:1,advanced:true,byPens:false}});
        cim(comp,st,1,1,{leg:1,tie:{mine:2,theirs:2,diff:0,advanced:true,byPens:true}});
        cim(comp,st,0,1,{leg:1,tie:{mine:1,theirs:2,diff:-1,advanced:false,byPens:false}});
        cim(comp,st,1,1,{leg:1,tie:{mine:2,theirs:2,diff:0,advanced:false,byPens:true}});}
      for(const [gf,ga,pens] of [[2,1,null],[0,1,null],[1,1,true],[1,1,false]])
        cim(comp,"final",gf,ga,{legs:1,neutral:true,pens});}
    /* jellemző címek a jelentéshez */
    const M=(comp,st,gf,ga,x)=>{const H=cim(comp,st,gf,ga,x);return {comp,st,t:H.t,lead:H.lead,rovat:H.rovat,storyCim:H.storyCim,hype:H.hype,key:H.key};};
    out.pelda=[M("KL","group",2,0,{md:1}),M("EL","r16",1,0),M("EL","qf",2,1,{leg:1,tie:{mine:4,theirs:2,diff:2,advanced:true}}),
      M("BL","sf",1,1,{leg:1,tie:{mine:3,theirs:2,diff:1,advanced:true}}),M("KL","final",2,0,{legs:1}),
      M("BL","final",3,1,{legs:1}),M("HSZ","final",1,1,{legs:1,pens:true}),M("HSZ","final",0,1,{legs:1})];
    /* a döntő hype-fokozatai */
    out.hype={bl:cim("BL","final",2,1,{legs:1}).hype,hsz:cim("HSZ","final",2,1,{legs:1}).hype,el:cim("EL","final",2,1,{legs:1}).hype,
      kl:cim("KL","final",2,1,{legs:1}).hype,elR16:cim("EL","r16",2,1).hype};
    out.donto={lead:!!cim("KL","final",2,1,{legs:1}).lead,rovat:!!cim("KL","final",2,1,{legs:1}).rovat,
      blKul:/KÜLÖNSZÁM/.test(cim("BL","final",2,1,{legs:1}).storyCim||""),blLead:/KÜLÖNSZÁM/.test(cim("BL","final",2,1,{legs:1}).lead||"")};
    /* bajnoki meccsen nincs kupa */
    {const o={gf:1,ga:0,last:{us:teamName,them:"X FC",players:[]}};const V=V0();V.extras=[];out.liga=pressHeadline(V,o).kupa||null;}
    /* egy erős esti esemény (mesterhármas) egy csoportmeccsen: a cím marad, a kupa a rovatba */
    {const o={gf:4,ga:0,last:{us:teamName,them:"X FC",players:[{n:slots[9].player.n,g:3}]},cup:{comp:"EL",stage:"group",leg:0,legs:6,md:1,mdLast:6,opp:"X FC"}};
     const V=V0();V.extras=[{k:"hat",ic:"⚽",t:"Mesterhármas",w:1,n:slots[9].player.n}];
     const H=pressHeadline(V,o);out.eros={key:H.key,rovatCim:H.rovatCim,van:!!H.rovat};}
    /* ---- a meccsértékelés: az extrák és a cikk ---- */
    const enrich=(comp,stage,gf,ga,x)=>{const V={score:70,txt:"x"};
      mVerdictEnrich(V,{M:{},last:{us:teamName,them:"Ellenfél FC",players:[]},gf,ga,cls:"w",maxDeficit:0,goalJub:[],
        cup:Object.assign({comp,stage,leg:0,legs:1,md:0,mdLast:6,opp:"Ellenfél FC",tie:null,pens:null},x||{})});return V;};
    pressState();
    const fan0=(()=>{try{return fanBase();}catch(e){return 0;}})();
    const Vbl=enrich("BL","final",2,1),Vkl=enrich("KL","final",2,1),Vsf=enrich("HSZ","sf",1,0,{leg:1,legs:2,tie:{mine:3,theirs:1,diff:2,advanced:true}});
    out.extra={bl:(Vbl.extras||[]).map(x=>x.k),kl:(Vkl.extras||[]).map(x=>x.k),sf:(Vsf.extras||[]).map(x=>x.k)};
    out.cikk={bl:Vbl.press&&Vbl.press.fans,kl:Vkl.press&&Vkl.press.fans,sf:Vsf.press&&Vsf.press.fans,hBL:Vbl.head&&Vbl.head.hype};
    /* a szezontörténet nem írja felül */
    {const V=enrich("EL","group",1,0,{md:2,legs:6});const t=V.head.t;pressStoryApply(V,{gf:1,ga:0,home:true});out.story=V.head.t===t;}
    /* ---- előzetesek és zárás ---- */
    naplo.length=0;
    S.euro={comp:"HSZ",stage:"final",fixtures:[{o:{n:"Nagy Ellenfél FC",ovr:120},neutral:true}],E:0};
    out.eloM=pressKupaElozetes("final");out.eloMsor=naplo.map(x=>x.t);naplo.length=0;
    S.euro.comp="KL";out.eloK=pressKupaElozetes("final");out.eloKsor=naplo.map(x=>x.t);naplo.length=0;
    S.euro.comp="EL";S.euro.stage="group";out.eloG=pressKupaElozetes("group");naplo.length=0;
    S.euro.comp="NYK";out.eloNyk=pressKupaElozetes("group");naplo.length=0;
    S.euro.comp="BL";S.euro.outAt="final";out.zarW=pressKupaZaras("win");
    S.euro.outAt="group";S.euro.comp="HSZ";out.zarG=pressKupaZaras("out");
    S.euro.outAt="qf";out.zarQ=pressKupaZaras("out");
    [out.eloMsor,out.eloKsor].flat().concat([out.zarW,out.zarG]).forEach(t=>ellenoriz(String(t||"").replace(/<[^>]+>/g,""),"elo/zar"));
    window.addLine=al;S.euro=null;
    return out;},String(karrier));
  console.log("— 1. a kupameccsek címei —");
  ok(!r.hibas.length,"minden sorozat × minden helyzet × 30 sorsolás: egyetlen hibás (undefined/üres helyőrző) cím sincs",r.hibas.slice(0,3));
  r.pelda.forEach(x=>console.log(`     ${x.comp} ${x.st}: [${x.storyCim}] „${x.t}”${x.lead?` — ${x.lead}`:""}${x.rovat?` · ${x.rovat}`:""}`));
  ok(r.hype.bl===3&&r.hype.hsz===3&&r.hype.el===2&&r.hype.kl===1&&r.hype.elR16===0,"a döntő hype-fokozata: KK és Hiper 3, OJK 2, a kisebbek 1; nem döntőn 0",r.hype);
  ok(r.donto.lead&&r.donto.rovat,"a döntő minden sorozatban kap alcímet és rovatot",r.donto);
  ok(r.donto.blKul&&r.donto.blLead,"a KK-döntő: KÜLÖNSZÁM a rovatcímben és az alcímben",r.donto);
  ok(r.liga===null,"bajnoki meccsen nincs kupacím");
  ok(r.eros.key==="hat"&&r.eros.van&&/Kupaláz/.test(r.eros.rovatCim),"csoportmeccsen a mesterhármas marad a cím, a kupa a rovatba kerül",r.eros);
  console.log("\n— 2. az extrák és a cikk —");
  ok(r.extra.bl.includes("kupaGyoz")&&r.extra.kl.includes("kupaGyoz")&&r.extra.sf.includes("kupaTovabb"),"a kupagyőzelem és a döntőbe jutás az este extrái között",r.extra);
  ok(r.cikk.bl>0&&r.cikk.kl>0&&r.cikk.bl>r.cikk.kl,"a döntő cikke szurkolót hoz, a KK-döntő különszáma többet, mint a KONF-é",r.cikk);
  ok(r.story,"a bajnoki szezontörténet nem írja felül a kupacímet");
  console.log("\n— 3. előzetesek és zárás —");
  ok(r.eloM&&r.eloM.key==="finalM"&&r.eloMsor.length===3&&/KÜLÖNKIADÁS/.test(r.eloMsor[0]),"a Hiper-döntő előtt különkiadás, három sor",r.eloMsor);
  ok(r.eloK&&r.eloK.key==="final"&&r.eloKsor.length===2,"a KONF-döntő előtt két sor",r.eloKsor);
  ok(r.eloG&&r.eloG.key==="group","a csoportkör indulása előtt előzetes",r.eloG);
  ok(r.eloNyk===null,"a felkészülési kupa csoportja előtt nincs előzetes");
  ok(/ÜNNEPI KÜLÖNSZÁM/.test(r.zarW||"")&&/ligaszakasz/.test(r.zarG||"")&&r.zarQ===null,"a kampány vége: KK-győzelem különszám, ligaszakaszos búcsú; kieséses kiesésnél a meccscikk elég",[r.zarW,r.zarG,r.zarQ]);
  console.log("\n— 4. —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
