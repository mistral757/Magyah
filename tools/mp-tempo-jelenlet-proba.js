/* PvP TEMPÓ, JELENLÉT ÉS BÖKÉS (3.9.41).

   Négy bejelentett tünet, és a próba mind a négy GYÖKERÉT méri:

     1. „PvP villám és gyorsított módban … jelenleg nem történik semmi."
        Két oka volt. (a) A szoba létrehozásakor, ha a `tempo` mező írása
        elbukott (régi Firebase-szabályfájl), a kód NÉMÁN újrapróbálta
        nélküle — a szoba Kényelmes módban jött létre, ms:0, tehát a 3 perces
        ablak sosem indult el. (b) Az mpDeadlineLeft `null`-t adott, ha a
        társ ONLINE volt — vagyis a tipikus esetben (mindketten a képernyő
        előtt) a fokozat TELJESEN inert volt.
     2. „nem lehet megbökni a társat, hiába van bekapcsolva mindkét oldalon."
        A bökés-gomb CSAK akkor jelent meg, ha biztosan tudtuk, hogy a társ
        offline — a „nem tudjuk" állapotban néma maradt.
     3. „társad jelenléte nem ismert (régi szoba) … friss test-szoba."
        A jelenlét-bejelentkezés szobánként EGYSZER futott le; az
        onDisconnect viszont minden szakadásnál offline-ra írja a mezőt.
     4. A kért SZÁMLÁLÓ és a túloldali JELZÉS.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8971;
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
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1400);

  const r=await p.evaluate(()=>{
    const out={};
    const EN="en",TARS="tars";
    /* egy szoba-pillanatkép, ahogy a jelenlét-lekérdezés adja */
    const szoba=(tempo,tarsMezok)=>({code:"ABCD",tempo,
      players:{[EN]:{role:"host",ready:true,online:true},
               [TARS]:Object.assign({role:"guest",ready:false},tarsMezok||{})}});
    /* a saját azonosító rögzítése, hogy a „társ" tényleg a másik legyen */
    mpMyId=()=>EN;

    /* ---- 1/a. A TEMPÓ NEM VESZHET EL NÉMÁN ---- */
    out.tempo_ujraproba=/tempoErr/.test(mpBackendFb.create.toString())
      &&/F\.update\(F\.ref\(mpNet\.db,"mp\/rooms\/"\+code\),\{tempo:rec\.tempo\}\)/.test(mpBackendFb.create.toString());

    /* ---- 1/b. A SZÁMLÁLÓ ONLINE TÁRS MELLETT IS FUT ---- */
    _mpPresRoom=szoba("villam",{online:true});
    const most=Date.now();
    out.szamlalo_online=mpDeadlineLeft(most-60000,false);
    out.auto_online=mpAutoMehet();
    _mpPresRoom=szoba("villam",{online:false});
    out.szamlalo_offline=mpDeadlineLeft(most-60000,false);
    out.auto_offline=mpAutoMehet();
    _mpPresRoom=szoba("nyugodt",{online:false});
    out.szamlalo_nyugodt=mpDeadlineLeft(most-60000,false);
    out.szamlalo_fut_online=(out.szamlalo_online!==null&&out.szamlalo_online>110000&&out.szamlalo_online<=120000);
    out.auto_csak_offline=(out.auto_online===false&&out.auto_offline===true);
    out.nyugodtban_nincs=(out.szamlalo_nyugodt===null);

    /* ---- 2. A BÖKÉS-GOMB a „nem tudjuk" állapotban is látszik ---- */
    const src=mpNudgePaint.toString();
    out.bokes_kapu=/mpMateOnline\(_mpPresRoom\)===true\|\|!pushBeallitva\(\)/.test(src);

    /* ---- 3. A JELENLÉT SZÍVVERÉSE ---- */
    const arm=mpPresenceArm.toString();
    out.szivveres=/function mpPresenceArm\(code,force\)/.test(arm)
      &&/if\(!all&&!force\)return;/.test(arm)
      &&/if\(all\)\{/.test(arm);
    out.tick_hiv=/mpPresenceArm\(MP\.activeRoom,kellPush\?"push":true\)/.test(mpPresenceTick.toString());
    out.nyitas_hiv=/mpPresenceArm\(MP\.activeRoom,"push"\)/.test(h2hWaitShow.toString());

    /* ---- 4. A TÚLOLDALI JELZÉS ---- */
    const T=MP_TEMPO.villam.ms;
    _mpPresRoom=szoba("villam",{online:false,waitAt:mpNow()-45000});
    out.tars_var=mpMateWaitLeft(_mpPresRoom);
    out.tars_var_jo=(out.tars_var!==null&&out.tars_var>T-50000&&out.tars_var<=T-40000);
    _mpPresRoom=szoba("villam",{online:false});
    out.nincs_jelzes=(mpMateWaitLeft(_mpPresRoom)===null);
    _mpPresRoom=szoba("villam",{online:false,waitAt:mpNow()-10*T});
    out.regi_jelzes_elnemul=(mpMateWaitLeft(_mpPresRoom)===null);
    _mpPresRoom=szoba("nyugodt",{online:false,waitAt:mpNow()-1000});
    out.nyugodtban_nincs_jelzes=(mpMateWaitLeft(_mpPresRoom)===null);

    /* ---- 4/b. A KIÍRÁS ---- */
    const el=document.getElementById("h2hWaitMate");
    const fest=(room)=>{_mpPresRoom=room;el.innerHTML="";mpPresencePaint();return el.innerHTML;};
    out.szoveg={};
    out.szoveg.tars_var=fest(szoba("villam",{online:false,waitAt:mpNow()-30000}));
    out.kiirja_a_tars_orajat=/A társad rád vár/.test(out.szoveg.tars_var)
      &&/2:\d\d/.test(out.szoveg.tars_var);
    /* nem csatlakozott vs. nem ismert */
    mpNet.presErr=null;
    out.szoveg.nincs_tars=fest({code:"ABCD",tempo:"villam",players:{[EN]:{online:true}}});
    out.szoveg.nem_ismert=fest(szoba("villam",{}));
    out.diagnozis_elvalik=/még nem csatlakozott/.test(out.szoveg.nincs_tars)
      &&/jelenléte nem ismert/.test(out.szoveg.nem_ismert)
      &&!/régebbi szoba\)/.test(out.szoveg.nem_ismert);

    /* ---- 5. A BEVÁRÓ FEJLÉC KUPÁBAN (3.9.42) ----
       A bajnokság lezárult (S.idx=30), tehát a párharc a fejlécnek 31-et ad
       át — a képernyő eddig „31. FORDULÓ"-t írt ki. A sorozat RÖVIDÍTÉSE nem
       kerülhet ki (jogi ok), és nem is mindig ugyanaz a sorozat: „KUPA" áll
       ott, a kör neve pedig úgyis megmondja, hol tartasz. */
    S.idx=30;S.seasonNumber=1;
    S.euro=null;
    out.cim_bajnoki=h2hWaitTitle(15);
    out.cim_szoveges=h2hWaitTitle("SZEZONZÁRÁS");
    /* kupa-párharc: odavágó és visszavágó */
    MP.active=true;MP.activeRoom="ABCD";
    /* az mpCup() a SZEZONSZÁMOT is nézi — enélkül a kupa „nem fut" */
    S.mpCup={comp:"BL",mateIdx:3,season:(S.seasonNumber||1)};
    S.euro={comp:"BL",stage:"qf",idx:0,mateIdx:3,userTie:0,
      ties:[{a:3,b:7,legs:[[0,0],[0,0]]}]};
    out.kupa_most=mpCupDuelNow();
    out.cim_oda=h2hWaitTitle(31);
    S.euro.idx=1;
    out.cim_vissza=h2hWaitTitle(31);
    S.euro.stage="final";S.euro.idx=0;
    out.cim_donto=h2hWaitTitle(31);
    /* NEM kupa-párharc (a társ nincs az ágon) → marad a fordulószám */
    S.euro.userTie=null;
    out.cim_nem_kupaparharc=h2hWaitTitle(31);
    S.euro=null;S.mpCup=null;MP.active=false;

    /* ---- 6. A SZABÁLYFÁJL ---- */
    out.mark_forras=/waitAt:on\?mpStamp\(\):0/.test(mpWaitMark.toString());
    return out;});

  const szabaly=JSON.parse(fs.readFileSync(path.join(ROOT,"tools/firebase-rules.json"),"utf8"));
  const pid=szabaly.rules.mp.rooms["$code"].players["$pid"];
  const szabalyOk=!!(pid.waitAt&&pid.waitAt[".validate"]==="newData.isNumber()"
    &&pid.online&&pid.push&&pid.seenAt);

  const T=[
    ["a tempó írása külön újrapróbát kap, a hibát megjegyzi",r.tempo_ujraproba===true],
    ["a SZÁMLÁLÓ online társ mellett is fut",r.szamlalo_fut_online===true],
    ["az AUTOMATIKA viszont csak offline társnál sül el",r.auto_csak_offline===true],
    ["Kényelmes módban nincs határidő (változatlan)",r.nyugodtban_nincs===true],
    ["a bökés-gomb csak BIZTOSAN online társnál tűnik el",r.bokes_kapu===true],
    ["a jelenlét-bejelentkezés szívveréssé vált",r.szivveres===true],
    ["…a jelenlét-kör hívja",r.tick_hiv===true],
    ["…és a beváró képernyő nyitása is",r.nyitas_hiv===true],
    ["a társ várakozásából látszik a hátralévő idő",r.tars_var_jo===true],
    ["jelzés nélkül nincs számláló",r.nincs_jelzes===true],
    ["egy régen otthagyott jelzés elnémul",r.regi_jelzes_elnemul===true],
    ["Kényelmes módban nincs túloldali jelzés",r.nyugodtban_nincs_jelzes===true],
    ["a képernyő kiírja a társ óráját, perc:mp alakban",r.kiirja_a_tars_orajat===true],
    ["a diagnózis elválik: nem csatlakozott vs. nem ismert",r.diagnozis_elvalik===true],
    ["a bajnoki forduló fejléce változatlan",r.cim_bajnoki==="15. FORDULÓ"],
    ["a szöveges fejléc változatlan",r.cim_szoveges==="SZEZONZÁRÁS"],
    ["kupa-párharcban KUPA + a kör áll ott, nem a 31. forduló",
      r.kupa_most===true&&r.cim_oda==="KUPA · NEGYEDDÖNTŐ"],
    ["a visszavágó meg is van jelölve",r.cim_vissza==="KUPA · NEGYEDDÖNTŐ · VISSZAVÁGÓ"],
    ["a döntő is a saját nevén szerepel",r.cim_donto==="KUPA · DÖNTŐ"],
    ["ha nem kupa-párharc, marad a fordulószám",r.cim_nem_kupaparharc==="31. FORDULÓ"],
    ["a szabályfájl engedi a waitAt / online / push / seenAt mezőket",szabalyOk===true],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  számláló (online / offline / kényelmes):",
    r.szamlalo_online,"/",r.szamlalo_offline,"/",r.szamlalo_nyugodt);
  console.log("  a társ hátralévő ideje:",r.tars_var);
  console.log("  fejlécek:",JSON.stringify([r.cim_bajnoki,r.cim_oda,r.cim_vissza,r.cim_donto,r.cim_nem_kupaparharc]));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
