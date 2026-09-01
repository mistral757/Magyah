/* A KIADOTT verzió szimulációja: a klubleírások kiürítve (azok kimaradnak a
   kiadásból). Kérdés: marad-e BÁRMILYEN valós név a képernyőn. */
const { chromium } = require('playwright');
const F = 'file://' + require('path').resolve(__dirname, 'release-sim.html') + '';

async function run(b) {
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(F); await p.waitForTimeout(1500);
  const tap = async (txt) => {
    const h = await p.evaluateHandle(t => {
      const b = [...document.querySelectorAll('button')]
        .find(e => e.offsetParent && (e.innerText || '').includes(t));
      if (b) b.click(); return !!b;
    }, txt);
    await h.dispose(); await p.waitForTimeout(500);
  };
  await tap('Egyedül játszom');
  await p.click('#modeCareerDynBtn').catch(() => {});
  await p.waitForTimeout(700);
  for (let i = 0; i < 14; i++) {
    for (const s of ['#setupNextBtn', '#startBtn']) {
      const e = await p.$(s);
      if (e && await e.isVisible()) { await e.click().catch(() => {}); await p.waitForTimeout(450); break; }
    }
  }
  // A feliratok ismétlődnek (a scoutnál is „Sorsolás", az ellenfél-táblánál is),
  // és mindegyik animál. Ezért addig próbálkozunk, amíg a keretlista megjelenik.
  for (let step = 0; step < 22; step++) {
    const done = await p.evaluate(() => document.querySelectorAll('.nm').length > 3);
    if (done) break;
    for (const t of ['Sorsolás', 'Irány az ellenfél', 'Irány a draft', 'Pörgetés']) {
      const hit = await p.evaluate(txt => {
        const b = [...document.querySelectorAll('button')]
          .find(e => e.offsetParent && !e.disabled && (e.innerText || '').includes(txt));
        if (b) b.click(); return !!b;
      }, t);
      if (hit) { await p.waitForTimeout(t === 'Pörgetés' ? 3200 : 900); break; }
    }
  }
  await p.screenshot({ path: require('path').resolve(__dirname, 'leak-end.png') });
  const r = await p.evaluate(() => {
    const t = document.body.innerText;
    return { leak: Object.keys(HU_NAME_TABLE).filter(n => n.length > 6 && t.includes(n)),
             rows: [...document.querySelectorAll('.nm')].map(e => e.innerText.trim().split('\n')[0]).slice(0, 5),
             where: (document.body.innerText || '').slice(0, 120).replace(/\n/g, ' / ') };
  });
  await p.close();
  return { ...r, errs };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const all = new Set(); let errs = [], rows = [];
  for (let i = 0; i < 3; i++) {
    const r = await run(b);
    r.leak.forEach(x => all.add(x)); errs = errs.concat(r.errs);
    if (r.rows.length) rows = r.rows;
    console.log('  futás', i, '· hol:', r.where);
  }
  console.log('minta a keretlistából:', rows.join(' · ') || '(üres)');
  console.log('KANONIKUS név a képernyőn 3 futás alatt:', all.size, [...all]);
  console.log('oldalhiba:', errs.length ? errs.slice(0, 4) : 'nincs');
  await b.close();
  process.exit(all.size || errs.length ? 1 : 0);
})();
