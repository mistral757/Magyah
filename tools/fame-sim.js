#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
   MAGYAH — HÍRESSÉG-SZIMULÁCIÓ  („Sztárom a párom")

   MIÉRT VAN. A hírességpont három forrásból jön (kommentátori megjegyzés, MVP,
   egyéni díj), és a három NEM ugyanabban a nagyságrendben termel. A mérföldkő-
   lépcsőt nem lehet találomra beállítani: előbb tudni kell, MILYEN TEMPÓBAN
   jönnek a pontok egy tipikus sztár-karrierben. Ez a szkript pontosan ezt méri.

   HOGYAN. Nem képletet becsül, hanem LEJÁTSSZA a szezont ugyanazokkal a
   számokkal, amikkel a játék motorja dolgozik:
     · gólvárhatóság      lam = clamp(1,3 · e^(0,09·diff), 0,15 … 4,5)   (SIM)
     · gólszerző-súlyok   GOALW × max(1, Rating−58)
     · gólpassz-súlyok    ASSTW × max(1, Rating−58), 75%-os gólpassz-arány
     · a meccs embere     gól·3 + gólpassz·2 (+2,5 a kapusnak tiszta lapos
                          győzelemnél) + véletlen·0,6
   A mezőny AI-csapatai ugyanezzel a modellel termelik a saját góllövőlistájukat,
   tehát a gólkirályi cím esélye is MÉRT szám, nem feltevés.

   AMI FELTEVÉS (és ezért külön áll, hangolható konstansként):
     · COMMENT_DIST — hány „ízesítő" kommentátori megjegyzés jut egy gólra.
       A motorban ezt a gólonkénti jegyzet-keret (GOAL_NOTE_BUDGET = 3) fogja
       be, a megszólalás esélye viszont a játékos képességeitől függ. A
       megoszlás egy KIÉPÜLT sztárra van szabva (skillek, párkémia, díjak).
     · a kupa-menetelés köreinek továbbjutási esélye (CUP_ADVANCE).

   Használat:  node tools/fame-sim.js [szezonszám]
   ───────────────────────────────────────────────────────────────────────────── */

"use strict";

/* ---- A MOTOR SZÁMAI (index.html) ---- */
const SIM = { K: 0.09, BASE: 1.3, HOME: 1.2, AWAY: -0.4 };
const GOALW = { CS: 5, "ÁÉ": 3.5, JSZ: 3, BSZ: 3, TKP: 3, KKP: 1.6, VKP: 0.8, JV: 0.6, BV: 0.6, KV: 0.5, KP: 0.02 };
const ASSTW = { CS: 2.5, "ÁÉ": 5, JSZ: 4, BSZ: 4, TKP: 4.5, KKP: 2.5, VKP: 1.2, JV: 1, BV: 1, KV: 0.4, KP: 0.05 };
const ASSIST_CHANCE = 0.75;

/* ---- A HÍRESSÉG SZABÁLYAI (a bejelentésből) ---- */
const FAME_COMMENT = 1;          /* egy róla szóló kommentátori megjegyzés */
const FAME_HAUL = 3;             /* a 3., 4., 5. és 6+. gól alap-jutalma */
const FAME_MVP = { LIGA: 1, DERBY: 2, MK: 2, KL: 3, EL: 4, BL: 5 };
const FAME_MVP_KO = 1.5;         /* kieséses szakasz, európai kupában */
const FAME_MVP_FINAL = 4;        /* döntő (a kieséses szorzó HELYETT, nem mellé) */
const FAME_AWARD = { LIGA: 1, MK: 1, KL: 1.5, EL: 3, BL: 10, BALLON: 15 };
const FAME_DIFF_DIV = 5;         /* × nehézségi szint / 5 — a bejelentés szerinti szorzó */

/* ---- FELTEVÉSEK ---- */
/* Hány ízesítő megjegyzés jut egy gólra? (0/1/2/3 — a keret 3-nál elvágja.) */
const COMMENT_DIST = [0.42, 0.36, 0.16, 0.06];
/* Továbbjutási esély körönként egy erős klubnál, sorozat szerint. */
const CUP_ADVANCE = { MK: 0.82, KL: 0.78, EL: 0.70, BL: 0.62 };

/* ---- A KERET ---- 4-2-3-1, a sztár a csatár. */
const FORMATION = ["KP", "JV", "KV", "KV", "BV", "VKP", "KKP", "JSZ", "TKP", "BSZ", "CS"];

function rnd() { return Math.random(); }
function poisson(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; }
function lam(d) { return Math.max(0.15, Math.min(4.5, SIM.BASE * Math.exp(SIM.K * d))); }
function weightedPick(w) {
  const tot = w.reduce((a, b) => a + b, 0);
  let r = rnd() * tot;
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; }
  return w.length - 1;
}

/* Egy keret: a sztár a starIdx-en, a többi egyforma. */
function makeSquad(starRating, restRating) {
  return FORMATION.map((pos, i) => ({
    pos, star: i === 10,
    ovr: i === 10 ? starRating : (pos === "KP" ? restRating - 2 : restRating)
  }));
}
function goalWeights(sq) { return sq.map(p => (GOALW[p.pos] || 1) * Math.max(1, p.ovr - 58)); }
function assistWeights(sq) { return sq.map(p => (ASSTW[p.pos] || 1) * Math.max(1, p.ovr - 58)); }

/* ---- EGY MÉRKŐZÉS ---- visszaadja a sztár termelését és a hírességpontját. */
function playMatch(sq, gw, aw, diff, comp, opts) {
  opts = opts || {};
  const lf = lam(diff), la = lam(-diff);
  const gf = poisson(lf), ga = poisson(la);
  const g = new Array(sq.length).fill(0), a = new Array(sq.length).fill(0);
  for (let i = 0; i < gf; i++) {
    const si = weightedPick(gw);
    g[si]++;
    if (rnd() < ASSIST_CHANCE) {
      let ai; do { ai = weightedPick(aw); } while (ai === si);
      a[ai]++;
    }
  }
  /* A meccs embere — a motor képlete. */
  let best = -1, bestSc = -1;
  if (gf >= ga) {
    sq.forEach((p, k) => {
      let sc = g[k] * 3 + a[k] * 2 + rnd() * 0.6;
      if (p.pos === "KP" && ga === 0 && gf > ga) sc += 2.5;
      if (sc > bestSc) { bestSc = sc; best = k; }
    });
  }
  const starIdx = 10;
  const sg = g[starIdx], sa = a[starIdx];

  /* ---- HÍRESSÉG ---- */
  let fame = 0, fComment = 0, fMvp = 0;
  /* A) kommentátori megjegyzések — gólonként, a jegyzet-keret határáig. */
  for (let i = 0; i < sg; i++) {
    fComment += FAME_COMMENT * weightedPick(COMMENT_DIST);
    /* a 3., 4., 5. és 6+. gól saját, hangsúlyos kommentárt kap */
    if (i + 1 >= 3) fComment += FAME_HAUL;
  }
  /* B) MVP */
  if (best === starIdx) {
    let base = FAME_MVP[comp === "LIGA" && opts.derby ? "DERBY" : comp] || 1;
    let mult = 1;
    if (opts.final) mult = FAME_MVP_FINAL;
    else if (opts.ko && comp !== "MK" && comp !== "LIGA") mult = FAME_MVP_KO;
    fMvp = base * mult;
  }
  fame = fComment + fMvp;
  return { gf, ga, sg, sa, fame, fComment, fMvp, mvp: best === starIdx };
}

/* ---- EGY AI-CSAPAT GÓLLÖVŐJE egy szezonban ---- */
function aiTopScorer(matches, lamTeam, rating) {
  const sq = makeSquad(rating, rating);
  const gw = goalWeights(sq);
  const g = new Array(sq.length).fill(0), a = new Array(sq.length).fill(0);
  for (let m = 0; m < matches; m++) {
    const gf = poisson(lamTeam);
    for (let i = 0; i < gf; i++) {
      const si = weightedPick(gw);
      g[si]++;
      if (rnd() < ASSIST_CHANCE) { let ai; do { ai = weightedPick(gw); } while (ai === si); a[ai]++; }
    }
  }
  return { g: Math.max(...g), a: Math.max(...a) };
}

/* ---- EGY SZEZON ---- */
function playSeason(cfg) {
  const sq = makeSquad(cfg.starRating, cfg.teamRating);
  const gw = goalWeights(sq), aw = assistWeights(sq);
  const out = { g: 0, a: 0, mvp: 0, fame: 0, fComment: 0, fMvp: 0, fAward: 0, matches: 0 };
  const diffScale = cfg.level / FAME_DIFF_DIV;

  /* 30 bajnoki forduló, ebből 4 rangadó */
  for (let r = 0; r < 30; r++) {
    const home = r % 2 === 0;
    const d = cfg.edge + (home ? SIM.HOME : SIM.AWAY);
    const res = playMatch(sq, gw, aw, d, "LIGA", { derby: r < 4 });
    out.g += res.sg; out.a += res.sa; out.matches++;
    if (res.mvp) out.mvp++;
    out.fame += res.fame; out.fComment += res.fComment; out.fMvp += res.fMvp;
  }
  const leagueG = out.g, leagueA = out.a;

  /* KUPA — a sorozat rangja a bajnoki helyezésből jön; itt paraméter. */
  const comp = cfg.comp;
  const isEuro = comp === "KL" || comp === "EL" || comp === "BL";
  const cupEdge = cfg.edge - (comp === "BL" ? 6 : comp === "EL" ? 4 : comp === "KL" ? 2 : 0);
  let cupG = 0, cupA = 0, cupMatches = 0;
  let stage = 0, alive = true;
  const legs = isEuro ? [6, 2, 2, 2, 1] : [1, 1, 1, 1, 1];   /* csoportkör + kieséses körök */
  for (let s = 0; s < legs.length && alive; s++) {
    for (let l = 0; l < legs[s]; l++) {
      const home = l % 2 === 0;
      const d = cupEdge + (s === legs.length - 1 ? 0 : (home ? SIM.HOME : SIM.AWAY));
      const res = playMatch(sq, gw, aw, d, comp, {
        ko: isEuro ? s > 0 : true,
        final: s === legs.length - 1
      });
      cupG += res.sg; cupA += res.sa; cupMatches++;
      out.g += res.sg; out.a += res.sa; out.matches++;
      if (res.mvp) out.mvp++;
      out.fame += res.fame; out.fComment += res.fComment; out.fMvp += res.fMvp;
    }
    if (rnd() > CUP_ADVANCE[comp]) alive = false;
    stage = s;
  }

  /* ---- C) EGYÉNI DÍJAK ---- */
  /* Bajnoki gólkirály / gólpassz-király: a 15 AI-csapat legjobbjai ellen. */
  let bestAiG = 0, bestAiA = 0;
  for (let t = 0; t < 15; t++) {
    const top = aiTopScorer(30, lam(0), cfg.level);
    if (top.g > bestAiG) bestAiG = top.g;
    if (top.a > bestAiA) bestAiA = top.a;
  }
  const awards = [];
  if (leagueG > bestAiG) { out.fAward += FAME_AWARD.LIGA * diffScale; awards.push("liga-gólkirály"); }
  if (leagueA > bestAiA) { out.fAward += FAME_AWARD.LIGA * diffScale; awards.push("liga-gólpasszkirály"); }

  /* Kupa-gólkirály: 31 ellenfél, mindegyik annyi meccset játszott, ameddig jutott.
     Közelítés: az átlagos kupa-menetelés fele a mienknek. */
  let bestCupG = 0, bestCupA = 0;
  const rivalMatches = Math.max(2, Math.round(cupMatches * 0.6));
  for (let t = 0; t < 31; t++) {
    const top = aiTopScorer(rivalMatches, lam(0), cfg.level);
    if (top.g > bestCupG) bestCupG = top.g;
    if (top.a > bestCupA) bestCupA = top.a;
  }
  if (cupG > bestCupG) { out.fAward += FAME_AWARD[comp] * diffScale; awards.push(comp + "-gólkirály"); }
  if (cupA > bestCupA) { out.fAward += FAME_AWARD[comp] * diffScale; awards.push(comp + "-gólpasszkirály"); }

  /* ARANYLABDA — a motor mércéje: (g + 0,7·a) · Rating/100, trófea-szorzókkal,
     a képzelt 100-as mezőny legjobbja ellen (~28 gól, ~15 gólpassz, ×1,21).
     Kemény kapu: a mezőny szintje legalább 90. */
  if (cfg.level >= 90) {
    const rivalScore = (28 + 0.7 * 15) * 1.0 * 1.21;
    const mine = (out.g + 0.7 * out.a) * (cfg.starRating / 100)
      * Math.pow(1.08, awards.filter(x => /gól/.test(x)).length) * (alive ? 1.2 : 1.07);
    if (mine > rivalScore) { out.fAward += FAME_AWARD.BALLON * diffScale; awards.push("ARANYLABDA"); }
  }
  out.fame += out.fAward;
  out.awards = awards;
  return out;
}

/* ---- FUTTATÁS ---- */
const RUNS = 400;
const SCENARIOS = [
  { name: "NB II · feltörekvő sztár", level: 84, teamRating: 84, starRating: 90, edge: 5, comp: "MK" },
  { name: "NB I · beérett sztár", level: 89, teamRating: 90, starRating: 97, edge: 7, comp: "KL" },
  { name: "másodosztály · kontinentális", level: 93, teamRating: 96, starRating: 104, edge: 8, comp: "EL" },
  { name: "premier líg · világklasszis", level: 98, teamRating: 102, starRating: 112, edge: 9, comp: "BL" },
  { name: "Infinity 120 · legenda", level: 120, teamRating: 124, starRating: 136, edge: 10, comp: "BL" }
];

function pct(arr, p) { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; }

const seasonsArg = parseInt(process.argv[2], 10);
const CAREER = isFinite(seasonsArg) && seasonsArg > 0 ? seasonsArg : 15;

console.log("HÍRESSÉG-SZIMULÁCIÓ — " + RUNS + " szezon forgatókönyvenként\n");
console.log("forgatókönyv".padEnd(34)
  + "gól".padStart(6) + "gp".padStart(6) + "MVP".padStart(6)
  + "komment".padStart(9) + "MVP-pt".padStart(8) + "díj-pt".padStart(9)
  + "ÖSSZ/idény".padStart(12) + "medián".padStart(9));
console.log("─".repeat(99));

const perScenario = {};
SCENARIOS.forEach(sc => {
  const rows = [];
  for (let i = 0; i < RUNS; i++) rows.push(playSeason(sc));
  const avg = k => rows.reduce((s, r) => s + r[k], 0) / rows.length;
  const fames = rows.map(r => r.fame);
  perScenario[sc.name] = { avg: avg("fame"), rows };
  console.log(sc.name.padEnd(34)
    + avg("g").toFixed(1).padStart(6)
    + avg("a").toFixed(1).padStart(6)
    + avg("mvp").toFixed(1).padStart(6)
    + avg("fComment").toFixed(1).padStart(9)
    + avg("fMvp").toFixed(1).padStart(8)
    + avg("fAward").toFixed(1).padStart(9)
    + avg("fame").toFixed(1).padStart(12)
    + pct(fames, 0.5).toFixed(0).padStart(9));
});

/* ---- A KARRIER ÍVE: egy sztár végigmegy a szinteken ---- */
console.log("\nEGY KARRIER ÍVE (" + CAREER + " idény, kétévente egy szint feljebb)\n");
console.log("idény".padStart(6) + "forgatókönyv".padEnd(30).padStart(32)
  + "idény-pt".padStart(10) + "összesen".padStart(11));
console.log("─".repeat(60));
let total = 0;
const cum = [];
for (let s = 1; s <= CAREER; s++) {
  const sc = SCENARIOS[Math.min(SCENARIOS.length - 1, Math.floor((s - 1) / 3))];
  /* a sztár maga is fejlődik: idényenként +1,5 Rating a saját szintje fölé */
  const cfg = Object.assign({}, sc, { starRating: sc.starRating + Math.min(8, (s % 3) * 2) });
  let sum = 0;
  for (let i = 0; i < 40; i++) sum += playSeason(cfg).fame;
  const v = sum / 40;
  total += v; cum.push(Math.round(total));
  console.log(String(s).padStart(6) + sc.name.padEnd(30).padStart(32)
    + v.toFixed(0).padStart(10) + Math.round(total).toString().padStart(11));
}

console.log("\nKUMULÁLT HÍRESSÉG idények szerint:");
console.log("  " + cum.map((v, i) => (i + 1) + ". idény: " + v).join(" · "));
