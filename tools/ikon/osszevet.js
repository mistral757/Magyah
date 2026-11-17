/* AZ IKON ELŐTTE / UTÁNA KÉPE (1.0.11.2.01).
   node tools/ikon/osszevet.js → docs/kepek/ikon-1-0-11-2-01.jpg
   A régi készlet a tools/ikon/regi/ alatt, az új az icons/ alatt. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const GYOKER = require('path').join(__dirname, '..', '..');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', '8972'], { cwd: GYOKER, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8972/tools/ikon/osszevet.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: GYOKER + '/docs/kepek/ikon-1-0-11-2-01.jpg', type: 'jpeg', quality: 85, fullPage: true });
  await b.close(); srv.kill();
  console.log('✓ docs/kepek/ikon-1-0-11-2-01.jpg');
})();
