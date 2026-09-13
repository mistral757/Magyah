/* 🔍 A „HASZNÁLD FEL MINDEN FELDERÍTÉSEDET" KIHÍVÁS (3.9.60)

   BEJELENTETT HIBA: „nem működik a használd fel minden felderítésedet kihívás.
   abban a pillanatban, hogy teljesítetté válik, azonnal le kéne zárjon. most
   nem zár le és mindig elbukod, hiába teljesítetted, mert a következő meccs
   elindítása idejére már feltöltődik a lehetőségek slot és azt érzékeli hogy
   egyet sem használtál el."

   A GYÖKÉR EGY BESOROLÁS VOLT. A `looksSpent` a CH_STATE_TYPES listán ült —
   az „állapot-kihívások" között, amik a MOSTANI helyzetet kérdezik. Csakhogy
   az „elfogyott a felderítési keret" nem tartós állapot, hanem PILLANATNYI
   ESEMÉNY, amit a következő ablak feltöltése visszacsinál. A besorolásnak két
   következménye volt, és együtt garantálták a bukást:
     · a latchChallengeIfMet nem tehetett rá reteszt,
     · a challengeEarlyPayable nem engedte korán kifizetni.
   Vagyis a kihívás CSAK a határidőnél dőlt el — amikorra a keret újratelt.

   A próba ezért nem azt méri, hogy „egyszer igaz volt-e", hanem pontosan azt
   a sorrendet, ami a bejelentésben szerepel: elfogy a keret → LEZÁR →
   feltöltődik → és a lezárt kihívás teljesített MARAD.

   Használat: node tools/felderites-kihivas-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8908'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8908/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";S.seasonNumber=2;S.idx=8;
    /* egy vállalt kihívás, üres napló */
    const ujKihivas=()=>{
      const ch={type:"looksSpent",target:1,startProgress:0,
        desc:"Használd fel az összes rendelkezésre álló felderítést",
        scope:"round",
        reward:{desc:"jutalom",kind:"buyDiscountNext"},
        punishment:{desc:"büntetés",kind:"none"}};
      S.activeChallenges=[ch];S.resolvedChallenges=[];
      return ch;};
    /* egy nyitott ablak, 3 felderítéssel */
    const ablak=(left)=>{S.twWindow={round:1,label:"proba",max:3,left,pos:{}};};

    /* ── 1. A BESOROLÁS ── */
    o.besorolas={
      allapot_e:CH_STATE_TYPES.includes("looksSpent"),
      korai_fizetes:challengeEarlyPayable({type:"looksSpent"}),
      reteszelheto:(()=>{const c=ujKihivas();ablak(0);
        latchChallengeIfMet(c);return !!c.metLatched;})()};

    /* ── 2. A BEJELENTETT SORREND ── */
    {const ch=ujKihivas();ablak(3);
     const lepesek=[];
     const sess=S.twWindow;
     lepesek.push({mit:"vállalva",progress:challengeProgress(ch),kesz:challengeSatisfied(ch)});
     twSpendLook(sess,"CS");
     lepesek.push({mit:"1/3",progress:challengeProgress(ch),kesz:challengeSatisfied(ch)});
     twSpendLook(sess,"KV");
     lepesek.push({mit:"2/3",progress:challengeProgress(ch),kesz:challengeSatisfied(ch)});
     twSpendLook(sess,"KP");
     lepesek.push({mit:"3/3 — elfogyott",progress:challengeProgress(ch),
       kesz:challengeSatisfied(ch),jel:!!ch.looksSpentDone});
     /* a felhasználói művelet lezárul → AZONNALI beváltás */
     chLooksSettle();
     lepesek.push({mit:"lezárás után",aktivban:(S.activeChallenges||[]).length,
       lezartban:(S.resolvedChallenges||[]).length,
       teljesult:!!(S.resolvedChallenges||[])[0]&&S.resolvedChallenges[0].met});
     /* ÉS MOST JÖN A BEJELENTÉS LÉNYEGE: feltöltődik a keret */
     ablak(3);
     lepesek.push({mit:"a keret újratelt",elo_allapot:chLooksAllSpent(),
       lezartban:(S.resolvedChallenges||[]).length,
       teljesult:!!(S.resolvedChallenges||[])[0]&&S.resolvedChallenges[0].met});
     o.sorrend=lepesek;}

    /* ── 3. A RÉGI VISELKEDÉS: ha NEM zárnánk le, akkor is teljesítettnek
           kell látszania a feltöltés után (a retesz miatt) ── */
    {const ch=ujKihivas();ablak(1);
     twSpendLook(S.twWindow,"CS");
     const azonnal=challengeSatisfied(ch);
     ablak(3);                       /* feltöltés lezárás NÉLKÜL */
     o.retesz={azonnal,feltoltes_utan:challengeSatisfied(ch),
       elo_allapot:chLooksAllSpent()};}

    /* ── 4. VISSZATÉRÍTÉS: egy elszállt keresés NEM teljesíti ── */
    {const ch=ujKihivas();ablak(1);
     const before=twSpendLook(S.twWindow,"CS");
     const elfogyott=!!ch.looksSpentDone;
     twRefundLook(S.twWindow,"CS",before);
     o.visszateritt={elfogyott,vissza_utan:!!ch.looksSpentDone,
       kesz:challengeSatisfied(ch),left:S.twWindow.left};}

    /* ── 5. A HALADÁS-SZÖVEG ── */
    {const ch=ujKihivas();ablak(2);
     /* a KIÍRT magyarázat a challengeLiveNote (a challengeProgressText csak
        a nyers „x/y" számpár) */
     o.szoveg={kozben:challengeLiveNote(ch),szamok_kozben:challengeProgressText(ch)};
     twSpendLook(S.twWindow,"CS");twSpendLook(S.twWindow,"KV");
     o.szoveg.kesz=challengeLiveNote(ch);
     ablak(3);
     o.szoveg.feltoltes_utan=challengeLiveNote(ch);
     o.szoveg.szamok_utan=challengeProgressText(ch);}
    return o;});

  console.log("=== 1. a besorolás ===");
  ok("a looksSpent MÁR NEM állapot-kihívás",r.besorolas.allapot_e===false);
  ok("ezért korán kifizethető",r.besorolas.korai_fizetes===true);
  ok("és reteszelhető (a teljesítést nem lehet elvenni)",r.besorolas.reteszelheto===true);

  console.log("\n=== 2. a bejelentett sorrend ===");
  r.sorrend.forEach(x=>console.log("    "+JSON.stringify(x)));
  const S3=r.sorrend[3],S4=r.sorrend[4],S5=r.sorrend[5];
  ok("az utolsó felderítés pillanatában teljesül",S3.kesz===true&&S3.jel===true,S3);
  ok("és AZONNAL le is zár (kikerül az aktív listából, jutalommal)",
     S4.aktivban===0&&S4.lezartban===1&&S4.teljesult===true,S4);
  ok("a keret újratelik — a lezárt kihívás TELJESÍTETT marad",
     S5.elo_allapot===false&&S5.teljesult===true,S5);

  console.log("\n=== 3. a retesz lezárás nélkül is tart ===");
  ok("az elfogyás pillanatában kész, és a feltöltés után is az",
     r.retesz.azonnal===true&&r.retesz.feltoltes_utan===true
     &&r.retesz.elo_allapot===false,r.retesz);

  console.log("\n=== 4. visszatérítés ===");
  ok("egy elszállt keresés visszaadja a keretet, és a jelet is leveszi",
     r.visszateritt.elfogyott===true&&r.visszateritt.vissza_utan===false
     &&r.visszateritt.kesz===false&&r.visszateritt.left===1,r.visszateritt);

  console.log("\n=== 5. a haladás szövege ===");
  ok("közben a maradékot mondja",/maradt/.test(r.szoveg.kozben),r.szoveg.kozben);
  ok("a nyers számpár is helyes végig (0/1 → 1/1)",
     r.szoveg.szamok_kozben==="0/1"&&r.szoveg.szamok_utan==="1/1",
     {kozben:r.szoveg.szamok_kozben,utan:r.szoveg.szamok_utan});
  ok("készen kimondja, hogy teljesült",/teljesült/.test(r.szoveg.kesz),r.szoveg.kesz);
  ok("és a feltöltés után is azt mondja",/teljesült/.test(r.szoveg.feltoltes_utan),
     r.szoveg.feltoltes_utan);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
