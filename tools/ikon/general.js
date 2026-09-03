/* A TELJES IKONKÉSZLET LEGYÁRTÁSA.  node tools/ikon/general.js
   Egyetlen rajzból (rajz.js) írja ki mind a 19 fájlt az icons/ alá, majd
   ELLENŐRZI, hogy tényleg az lett-e, aminek lennie kell.

   MIÉRT BÖNGÉSZŐVEL. A szóvédjegy Anton betűvel készül, és az önhosztolt
   .woff2-t a Chromium tudja kirajzolni. A betűt görbévé alakítani itt
   fölösleges bonyolítás volna: a végtermék PNG, abban már nincs betű. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');

const GYOKER = '/home/user/Magyah';
const PORT = 8971;

/* A KÉSZLET. A méretek a meglévő icons/ mappából valók — egyet sem hagyunk
   ki, mert a site.webmanifest és az apple-touch hivatkozik rájuk. */
const MERETEK = [16, 32, 48, 72, 96, 120, 128, 144, 152, 167, 180, 192, 256, 384, 512];
/* HÁROM SÁV, MÉRÉSSEL MEGHÚZVA:
     ≤32  „apro"   — csak a labda, teljes szélességben (a vonal is zaj volna),
     ≤48  „mini"   — labda + becsapódás-vonal, felirat nélkül,
     ≥72  „teljes" — a szóvédjegy is olvasható. */
const APRO_HATAR = 32, MINI_HATAR = 48;

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: GYOKER, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const hiba = [];

  async function rajzol(meret, valtozat, cel) {
    const p = await b.newPage({ viewport: { width: meret, height: meret }, deviceScaleFactor: 1 });
    p.on('pageerror', e => hiba.push(cel + ': ' + e.message));
    await p.goto(`http://localhost:${PORT}/tools/ikon/egy.html?m=${meret}&v=${valtozat}`,
                 { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(120);
    /* omitBackground: a lekerekített sarkon KÍVÜL átlátszó marad — a maskable
       ágnál ez nem számít, ott a krém négyzet széltében kitölti a lapot. */
    await p.screenshot({ path: cel, omitBackground: valtozat !== 'maskable' });
    await p.close();
    return cel;
  }

  const kesz = [];
  for (const m of MERETEK) {
    const v = m <= APRO_HATAR ? 'apro' : m <= MINI_HATAR ? 'mini' : 'teljes';
    kesz.push([await rajzol(m, v, `${GYOKER}/icons/icon-${m}x${m}.png`), v]);
  }
  /* Az apple-touch a 180-as ikon MÁSOLATA — az iOS ezt a nevet keresi. */
  fs.copyFileSync(`${GYOKER}/icons/icon-180x180.png`, `${GYOKER}/icons/apple-touch-icon.png`);
  kesz.push([`${GYOKER}/icons/apple-touch-icon.png`, 'teljes (180 másolata)']);

  for (const m of [192, 512])
    kesz.push([await rajzol(m, 'maskable', `${GYOKER}/icons/icon-maskable-${m}x${m}.png`), 'maskable']);

  await b.close(); srv.kill();

  /* ── favicon.ico: 16 + 32 + 48 egy fájlban ─────────────────────────────── */
  execFileSync('python3', ['-c', `
from PIL import Image
k=[Image.open("${GYOKER}/icons/icon-%dx%d.png"%(m,m)).convert("RGBA") for m in (16,32,48)]
k[2].save("${GYOKER}/icons/favicon.ico", format="ICO", sizes=[(16,16),(32,32),(48,48)])
`], { stdio: 'inherit' });
  kesz.push([`${GYOKER}/icons/favicon.ico`, 'ico (16+32+48)']);

  console.log('— legyártva —');
  kesz.forEach(([f, v]) => {
    const s = fs.statSync(f);
    console.log(`  ${f.split('/').pop().padEnd(28)} ${String(s.size).padStart(7)} B   ${v}`);
  });
  console.log(hiba.length ? '\nHIBÁK: ' + hiba.join(' | ') : '\nrajzolási hiba: nincs');
})();
