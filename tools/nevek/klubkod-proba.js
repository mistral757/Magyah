/* 🛡 1.0.7.4.02 — A HÁROMBETŰS KLUBKÓD IS JOGTISZTA.
   KÉRÉS: „Keressük meg az olyan eseteket, ahol a csapatnév 3 betűs
   eredményjelzőre kiírt rövidítése is veszélyt jelenthet a jogtisztaságra.
   Pl.: PSV. Ezeket javítsuk."
   Az eredményjelző magyarított módban (ez az alap, és a kiadott verzió
   egyetlen módja) a HU_CLUB_TABLE kódját mutatja, ha nincs, a magyarított
   névből képzett kódot (makeClubAbbr). Amit mér, minden klubra:
     1. a kód NEM egyezik a klub VALÓDI kódjával (CLUB_ABBR);
     2. NEM egyezik MÁS klub valódi kódjával;
     3. NEM közismert klub-betűszó (PSV, PSG, BVB, FCB, HSV…) és nem ismert
        márka (KFC, MOL, OTP, BMW…);
     4. két különböző klubnak nincs ugyanaz a kódja;
     5. a kód pontosan három betű.
   Futtatás: node tools/nevek/klubkod-proba.js   (böngésző nem kell) */
"use strict";
const fs=require("fs"),path=require("path");
const SRC=fs.readFileSync(path.join(__dirname,"..","..","index.html"),"utf8");
const grab=(name,close)=>{const i=SRC.indexOf("const "+name+"=");if(i<0)throw new Error("nincs: "+name);
  const j=SRC.indexOf(close,i);return Function("return "+SRC.slice(i+("const "+name+"=").length,j+close.length-1))();};
const HU=grab("HU_CLUB_TABLE","\n};"),CA=grab("CLUB_ABBR","};");
const mk=(club)=>{const clean=club.replace(/\b(FC|AFC|AS|AC|SL|SV|SC|CF|SK|JK|KV|BC|CP|SSC|VfB|RB|CR|FBPA|OSC|United|City)\b/gi,"").trim();
  const w=clean.split(/[\s.-]+/).filter(Boolean);let ab;
  if(w.length>=3)ab=w.slice(0,3).map(x=>x[0]).join("");else if(w.length===2)ab=w[0].slice(0,2)+w[1][0];else ab=(w[0]||club).slice(0,3);
  return ab.toUpperCase().slice(0,3);};
/* közismert klub-betűszók és -kódok (a játékban nem szereplő klubokéi is), és
   magyar márkanevek, amik hárombetűsen egy klubkódnak látszanának */
const HIRES=("PSV PSG BVB FCB BAR RMA ATM JUV INT MIL ACM ROM LAZ NAP FIO ATA MUN MCI LIV ARS CHE TOT EVE NEW AVL WHU LEI "
  +"AJA AJX FEY AZA BEN POR SCP FCP SLB CEL RAN OLM OLY OGC LOS ASM REN NAN HSV SGE BMG RBL TSG KOE WOB SCF FCU BSC KSC VFB "
  +"GAL FEN BJK ZEN CSK SPA DYN SHA DIN RSB FTC MTK DVS ETO ZTE DVT UTE BVS PAF HON VID BOC FLA PAL SAN COR SAO GRE RIV QPR "
  +"WBA MKD NAC NEC ADO PEC RKC VVV FCK AIK IFK HJK CFR AEK PAO OSC BOL GEN SAM UDI SEV VIL VAL BET ESP RSO ATH OSA GET LEV "
  +"LEN LIL MAR MON NIC LYO STR TFC REI BRE"
  /* ismert márkák, amik egy klubkódnak álcázva is a márkát idéznék */
  +" MOL OTP KFC BMW IBM BBC CNN NBA NFL NHL UFC MTV DHL UPS HBO MÁV BKV RTL KSH NAV FBI CIA KGB NSA USA KIA AMD AMG AXA ING UBS BNP OBI BIC AOL CBS NBC ABC FOX SKY OMV MVM MKB CIB").split(" ");
let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined&&!c?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
const valodi=new Map();Object.entries(CA).forEach(([k,v])=>{const u=String(v).toUpperCase();(valodi.get(u)||valodi.set(u,[]).get(u)).push(k);});
const sajat=[],mas=[],hires=[],forma=[],kodja=new Map();
for(const [club,e] of Object.entries(HU)){
  if(!Array.isArray(e))continue;
  const ab=String(e[1]||mk(e[0])).toUpperCase();
  if(!/^\p{Lu}{3}$/u.test(ab))forma.push([club,ab]);
  if(CA[club]&&String(CA[club]).toUpperCase()===ab)sajat.push([club,ab]);
  else if(valodi.has(ab))mas.push([club,ab,valodi.get(ab)]);
  else if(HIRES.includes(ab))hires.push([club,ab]);
  (kodja.get(ab)||kodja.set(ab,[]).get(ab)).push(club);}
const dupla=[...kodja.entries()].filter(([k,v])=>v.length>1);
console.log(`— ${Object.keys(HU).length} magyarított klub —`);
ok(!sajat.length,"egyik kód sem a klub saját valódi kódja",sajat);
ok(!mas.length,"egyik kód sem MÁS klub valódi kódja",mas);
ok(!hires.length,"egyik kód sem közismert klub-betűszó",hires);
ok(!dupla.length,"két különböző klubnak nincs ugyanaz a kódja",dupla);
ok(!forma.length,"minden kód pontosan három betű",forma);
/* a játék saját tiltólistája (a képzett kódokhoz — saját csapatnév, tábla nélküli
   klub) ugyanazt tartalmazza, mint ez a próba */
{const m=/const KOD_TILOS_HIRES="([^"]*)"/.exec(SRC);const J=new Set(m?m[1].split(" "):[]);
 const hiany=HIRES.filter(x=>x&&!J.has(x));
 ok(m&&!hiany.length,"a játék tiltólistája (KOD_TILOS_HIRES) a próba listájával azonos",hiany);}
console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
process.exit(hiba?1:0);
