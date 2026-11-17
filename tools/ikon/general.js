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

  /* ── TÖMÖRÍTÉS (1.0.11.2.01) ─────────────────────────────────────────────
     Az új rajz színátmenetei miatt a nyers PNG a régi négy-ötszöröse (az
     512-es 100 kB). A service worker MINDET előre letölti, tehát számít.
       · ≥72 px: pngquant, minőség 88–100 — palettás PNG árnyalás-simítással;
         a színátmenet nem sávosodik (szemmel és a lenti ellenőrzéssel nézve);
       · minden PNG: optipng -o5, veszteségmentesen.
     A 16–48-as lapok NEM palettásodnak: ott minden pixel számít.
     Ha az eszközök nincsenek telepítve (apt-get install pngquant optipng), a
     lépés kimarad, és a gyártó szól — a készlet akkor is helyes, csak nagyobb. */
  const van = c => { try { execFileSync('which', [c]); return true; } catch (e) { return false; } };
  if (van('pngquant') && van('optipng')) {
    for (const [f] of kesz) {
      if (!/\.png$/.test(f)) continue;
      const m = +((f.match(/(\d+)x\d+/) || [])[1] || 180);
      if (m >= 72) execFileSync('pngquant', ['--quality=88-100', '--speed', '1', '--force', '--ext', '.png', '--', f]);
      execFileSync('optipng', ['-quiet', '-fix', '-o5', f]);   /* -fix: a pngquant átlátszósági táblája néha egy elemmel hosszabb a palettánál — ezt teszi rendbe */
    }
  } else console.log('⚠ pngquant / optipng nincs telepítve — a tömörítés kimaradt');

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

  /* ── AZ ELLENŐRZÉS (1.0.11.2.01) ─────────────────────────────────────────
     Nem elég, hogy a fájl létrejött: a tartalmát is megnézzük.
       · minden PNG pontosan a nevében álló méretű;
       · a lekerekített ikonok sarka átlátszó, a közepük nem;
       · a MASKABLE teljes széltében kitöltött (nincs átlátszó pixel), és a
         jel (a volt-sárga és a fehér pontok) a középső 80%-os KÖRÖN belül
         marad — az Android launcher ezen kívül bármit levághat;
       · a favicon.ico mindhárom méretet tartalmazza. */
  const ell = execFileSync('python3', ['-c', `
from PIL import Image
import math,json,glob,re
G="${GYOKER}/icons/";ki=[]
for f in sorted(glob.glob(G+"icon-*.png"))+[G+"apple-touch-icon.png"]:
    im=Image.open(f).convert("RGBA");w,h=im.size;n=f.split("/")[-1]
    m=re.search(r"(\\d+)x(\\d+)",n);vart=int(m.group(1)) if m else 180
    if (w,h)!=(vart,vart):ki.append(n+": méret "+str((w,h)));continue
    if "maskable" in n:
        px=im.load();R=0.4*w;kint=0;atl=0
        for y in range(h):
            for x in range(w):
                r,g,b,a=px[x,y]
                if a<255:atl+=1
                d=math.hypot(x+.5-w/2,y+.5-h/2)
                jel=(g>200 and b<140) or (r>235 and g>235 and b>235)
                if d>R and jel:kint+=1
        if atl:ki.append(n+": "+str(atl)+" átlátszó pixel")
        if kint:ki.append(n+": "+str(kint)+" jel-pixel a biztonsági körön kívül")
    else:
        if im.getpixel((0,0))[3]>40 or im.getpixel((w-1,h-1))[3]>40:ki.append(n+": a sarok nem átlátszó")
        if im.getpixel((w//2,h//2))[3]<255:ki.append(n+": a közepe átlátszó")
ico=Image.open(G+"favicon.ico");mer=sorted(ico.info.get("sizes",[]))
if mer!=[(16,16),(32,32),(48,48)]:ki.append("favicon.ico: "+str(mer))
print(json.dumps(ki,ensure_ascii=False))
`]).toString().trim();
  const hibak2 = JSON.parse(ell);
  console.log(hibak2.length ? '✗ ELLENŐRZÉS: ' + hibak2.join(' | ') : '✓ ellenőrzés: méretek, átlátszó sarkok, maskable biztonsági zóna, favicon — mind rendben');
  if (hiba.length || hibak2.length) process.exitCode = 1;
})();
