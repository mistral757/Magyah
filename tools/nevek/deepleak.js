/* MÉLY szivárgás-próba.
 *
 * A leak.js a draftig jut el. A kupaképernyők, az eredményjelző, a
 * csoporttábla és a szezonzáró viszont csak egy LEJÁTSZOTT szezon után
 * látszanak — és pont ott maradtak lefordítatlan nevek, amiket a felhasználó
 * vett észre, nem a tesztem.
 *
 * Ez a próba a klub-starttal indul (nincs draft), majd a játék saját
 * „Szezon végigjátszása" gombjával megy végig, és MINDEN lépés után
 * végigpásztázza a DOM-ot valós név után.
 *
 *   node tools/nevek/deepleak.js [fájl]      (alapértelmezés: dist/index.html)
 */
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const TARGET = process.argv[2] || path.join(ROOT, 'dist', 'index.html');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await p.goto('file://' + TARGET);
  await p.waitForTimeout(1800);

  /* A vizsgált névhalmazt a JÁTÉK SAJÁT tábláiból vesszük: így a kiadott
     buildre (ahol azonosítók a kulcsok) és a családira is ugyanez fut. */
  await p.evaluate(() => {
    window.__nev = [
      ...Object.keys(HU_NAME_TABLE),
      ...Object.keys(HU_CLUB_TABLE),
    ].filter(n => n.length > 6 && /[ .]/.test(n));
    window.__hun = new Set([
      ...Object.values(HU_NAME_TABLE).map(v => v[0]),
      ...Object.values(HU_CLUB_TABLE).map(v => v[0]),
    ]);
    window.__talalt = {};
  });

  const scan = async (hol) => {
    await p.evaluate(h => {
      const t = document.body.innerText || '';
      window.__nev.forEach(n => {
        if (!t.includes(n)) return;
        /* Ha a találat egy MAGYARÍTOTT néven belül van (pl. „Aston Villa" az
           „Aston Villany"-ban), az nem szivárgás. */
        let valos = false;
        let i = -1;
        while ((i = t.indexOf(n, i + 1)) >= 0) {
          const koz = t.slice(Math.max(0, i - 60), i + n.length + 40);
          if ([...window.__hun].some(x => x !== n && x.includes(n) && koz.includes(x))) continue;
          valos = true; break;
        }
        if (valos && !window.__talalt[n]) window.__talalt[n] = h;
      });
    }, hol);
  };

  /* Kattintás felirat alapján; visszaadja, sikerült-e. */
  const tap = (txt) => p.evaluate(t => {
    const b = [...document.querySelectorAll('button')]
      .find(e => e.offsetParent && !e.disabled && (e.innerText || '').includes(t));
    if (b) { b.click(); return true; }
    return false;
  }, txt);

  await tap('Egyedül játszom'); await p.waitForTimeout(700);
  await p.click('#modeCareerDynBtn').catch(() => {}); await p.waitForTimeout(800);
  await scan('mód');

  /* végig a beállítón */
  for (let i = 0; i < 16; i++) {
    for (const sel of ['#setupNextBtn', '#startBtn']) {
      const e = await p.$(sel);
      if (e && await e.isVisible()) { await e.click().catch(() => {}); await p.waitForTimeout(500); break; }
    }
  }
  await scan('beállító');

  /* KLUB-START: ha van, azzal indulunk — így nincs 11 körös draft. */
  for (const t of ['Kész klub', 'kész klub', 'Klub kerete', 'Sorsolás',
                   'Irány az ellenfél', 'Irány a draft', 'Tovább', 'Kezdjük', 'Rendben']) {
    for (let k = 0; k < 3; k++) if (await tap(t)) await p.waitForTimeout(800);
  }
  await scan('indulás');

  /* Ami a képernyőn a legkézenfekvőbb továbblépés — sokszor egymás után.
     Minden kör után pásztázunk, tehát a köztes képernyők sem maradnak ki. */
  const LEPES = ['Pörgetés', 'Szezon végigjátszása', 'Kezdőrúgás', 'Tovább',
                 'Folytatás', 'Rendben', 'Mehet', 'Ugrás a kupa HUB-ba',
                 'Menetrend és tabella', 'A meccs statisztikája', 'Bezár'];
  for (let kor = 0; kor < 40; kor++) {
    let lepett = false;
    for (const t of LEPES) {
      if (await tap(t)) { lepett = true; await p.waitForTimeout(t === 'Szezon végigjátszása' ? 6000 : 1200); break; }
    }
    await scan('kör' + kor);
    if (!lepett) break;
  }

  const r = await p.evaluate(() => ({
    talalt: window.__talalt,
    db: Object.keys(window.__talalt).length,
    kepernyo: (document.body.innerText || '').slice(0, 150).replace(/\n/g, ' / '),
  }));

  console.log('fájl:', path.relative(ROOT, TARGET));
  console.log('utolsó képernyő:', r.kepernyo);
  console.log('\nVALÓS NÉV A KÉPERNYŐN:', r.db);
  Object.entries(r.talalt).forEach(([n, hol]) => console.log(`   [${hol}] ${n}`));
  console.log('oldalhiba:', errs.length ? errs.slice(0, 5) : 'nincs');
  await p.screenshot({ path: path.join(__dirname, 'deepleak.png') });
  await b.close();
  process.exit(r.db || errs.length ? 1 : 0);
})();
