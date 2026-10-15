/* A 3.9.248-as hiddenMatchBonus, változatlanul (csak _hmbRegi néven) — a
   tools/meccsero-preset-proba.js ehhez méri a tételes változat összegét. */
function _hmbRegi(){
  if(gameMode!=="career")return 0;
  const _v=matchSlotsView();
  const xi=_v.xi;
  if(!xi.length)return 0;
  let b=(S.capMod||0)+(S.eventMod||0)+((coach&&coach.ovrMod)||0);
  b+=moraleToOvr(S.morale!=null?S.morale:50);
  /* aura-skillek a kezdő 11-en, plusz a család-specializáció egyszeri bónusza */
  let aura=0;
  xi.forEach(s=>{aura+=sumSkillEffect(s.player.n,"aura");});
  const fam=xi.find(s=>s.player.family);
  const famSp=fam?fam.player.familySpecialty:null;
  if(famSp==="200iq")aura+=1;
  if(famSp==="tank")aura+=1.3;
  if(famSp==="testver")aura+=1;
  b+=aura;
  /* kapitány-rutin — csak ha a kapitány tényleg a kezdő 11-ben van */
  if(captainIdx>=0&&slots[captainIdx]&&slots[captainIdx].player&&!_v.subs[captainIdx])
    b+=captainAgeExpBonus(slots[captainIdx].player.age)*0.15;
  if(S.teamFormMalus>0)b-=2.2;
  b+=teamMomentumAdj();   /* a buildMatchSnapshot chFormMalus utáni tagjának párja */
  b+=tacticEffect();
  /* VÉDEKEZŐ SKILLEK: ezek nem OVR-t adnak, hanem az ELLENFÉL gólesélyét
     SZOROZZÁK (la = lam(-diff) × m). Mivel lam = BASE·e^(K·d), egy m szorzó
     pontosan −ln(m)/K OVR-nek felel meg — de csak a KAPOTT gólok oldalán,
     míg egy igazi OVR mindkét oldalon hat. Ezért FÉL súllyal számoljuk be.
     A DEF_MULT_FLOOR padlót itt is alkalmazzuk, hogy a becslés ne szaladjon
     el a valódi meccs-hatás fölé. */
  let dm=1;
  xi.forEach(s=>{dm*=multSkillEffect(s.player.n,"defense");});
  dm=Math.max(0.80,dm);
  if(famSp==="200iq")dm*=0.97;
  if(famSp==="tank")dm*=0.92;
  if(dm>0&&dm<1)b+=(-Math.log(dm)/SIM.K)*0.5;
  /* ---- ÖSSZHANG (3.8.02) ----
     A meccs-erő a buildMatchSnapshot ovr-jének a TÜKRE: ami ott tag, annak itt
     is tagnak kell lennie. Enélkül az auto szintkövetés és a nehézség-tanácsadó
     egy olyan csapatot mért volna, ami nem létezik — és a hiba pont a rossz
     irányba nőtt: egy friss keret alá-, egy tíz éve együtt játszó fölébecsülve.
     EZ AZ EGY SOR teszi, hogy az automatika, a kézi tanácsadó, a levelWarnState
     és a kihívás-kalibráció mind ugyanazt az igazságot lássa. */
  b+=(typeof bondOvrMod==="function")?bondOvrMod():0;
  /* RETTEGÉS (3.9.68): a kijelzett meccserőben is benne kell lennie —
     különben a játékos egy +20-as hatást venne meg, ami sehol nem látszik.
     A motor NEM ezt a függvényt hívja (ott a styleOvrBonus áll), tehát ez
     nem kettőzi meg. */
  /* 3.9.153: a styleOvrBonus maga — benne a rettegés és a motor-bónusz, és a
     stílus-képességek csapaterő-tagja (ovrTeam) is, lásd lent. */
  b+=(typeof styleOvrBonus==="function")?styleOvrBonus():0;
  /* ⚽ TALIZMÁN — a Meccs tengelyei (3.9.148): a pakli nem rejtett erő — a
     meccserőben (és így az eredményjelző ⚡ számában) is ott van */
  b+=(typeof talMeccsOvr==="function")?talMeccsOvr():0;
  /* ---- A HIÁNYZÓ MOTOR-TAGOK (3.9.153) ----
     BEJELENTETT PANASZ: „Nem jó a nehézség belövés D0-tól kezdve. Én 180-as
     meccs erőn vagyok… az első D0 szezonon 30-0 lett."
     A GYÖKÉR: a meccs-erő a buildMatchSnapshot TÜKRE kellene legyen (lásd az
     összhang-tag fölötti indoklást), de NÉGY dolog, amivel a motor számol,
     kimaradt belőle:
       · a csapategyensúly csapaterő-bónusza (balBonus — a motor ovr-jében),
       · a stílus-képességek csapaterő-tagja (ovrTeam: A gépezet, Nincs gyenge
         láncszem, Kettős veszély… — a motorban a styleOvrBonus-on át),
       · a stílus és az ultra-csatár GÓLSZORZÓI, az alakzat ára,
       · a párkémia és a taktika-stílus λ-szorzói, a gólvágó család.
     Egy kiépült karrierben ez együtt 5-15 pont is lehet — a szuperliga-
     kalibráció ennyivel GYENGÉBB mezőnyt állított be, mint amit a vállalt rés
     kért, és a pályán a +2-es „kiegyenlített" rajtból +12 lett.
     A λ-szorzók ugyanazon a mércén jönnek be, mint a védekező skilleké:
     ln(m)/K, FÉL súllyal, mert csak az egyik oldalon hatnak. A feltételes
     szorzó (gyors kontra: csak ha gyengébb vagy) és a véletlen (pszichó
     család, napi forma) kimarad — azok nem a keret erejéről szólnak. */
  b+=(typeof teamBalanceBonus==="function")?teamBalanceBonus():0;
  {let own=1,opp=1;
   try{own*=styleOwnGoalMult()*ultraOwnMult();}catch(e){}
   try{opp*=styleOppGoalMult();}catch(e){}
   try{opp*=shapeOppMult();}catch(e){}
   if(famSp==="gol")own*=1.09;
   try{
     const tk=S.tactics&&S.tactics.active;
     const ts=(tk&&tacticLevel(tk)>=85)?TACTICS[tk].style:null;
     const T=ts&&MATCH_TAC_LAM[ts];
     if(T){own*=T[0];opp*=T[1];}
   }catch(e){}
   try{
     const cp=completeChemPairsOnPitch(new Set(xi.map(s=>s.player.n)));
     if(cp>0){const tch=(typeof talMeccsChem==="function")?Math.max(0,Math.min(0.05,talMeccsChem())):0;
       own*=1+Math.min(0.18,cp*(tch?0.03+tch:0.03));}
   }catch(e){}
   b+=lamEquivOvr(own,opp);}
  return b;}
