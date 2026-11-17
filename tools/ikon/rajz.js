/* MAGYAH — az ikon RAJZA, egyetlen helyen (1.0.11.2.01).
   Ebből készül mind a 19 fájl; kézzel egyiket sem szerkesztjük.
   (A régi, labdás ikon rajza: tools/ikon/regi/rajz-regi.js, a régi fájlok
   ugyanott — az új készlet ellenőrzött átvételéig, és összevetéshez.)

   A JEL: A TAKTIKAI M.
   Az M öt töréspontja öt JÁTÉKOS a taktikai táblán, a szárai a köztük futó
   passz- és KÉMIA-vonalak. Egyetlen jel mondja el, hogy ez MAGYAH, hogy
   felállás, és hogy a játékosok össze vannak kötve. A középső játékos a
   csapatkapitány: piros–fehér–zöld karszalag-csíkos pont — a magyar szál.
   (Egy korábbi változatban a szalag a jel ALATT ült: a két felső ponttal
   együtt arcnak olvasott — „szem" és „száj". Ezért került a kapitányra.) Az alap a Reflektor téma
   petróleum-éjszakája, bal felülről reflektorfénnyel és a kezdőkör ívével.

   MIÉRT NEM LABDA (a régi ikon): a labda klipart, és semmit nem mond arról,
   hogy ez MENEDZSER-játék. MIÉRT NINCS FELIRAT: 72 pixel alatt egy hétbetűs
   szó olvashatatlan folt, fölötte pedig a jel maga a név (M).

   HÁROM VÁLTOZAT + A MASKABLE:
     · "teljes"   — ≥72 px: jel árnyékkal, kezdőkör-ív, reflektorfény;
     · "mini"     — 48 px: ív és árnyék nélkül, vastagabb vonal;
     · "apro"     — ≤32 px: csak a kövér M és a kapitány, pontok nélkül;
     · "maskable" — teljes széltében az alap, a jel a KÖZÉPSŐ 80%-os körben
                    (sugara 204,8 px a 512-es lapon); az Android launcher
                    körre vág, ami azon kívül van, arra nincs garancia. */
const IKON = (() => {
  const EJ = "#06141a", EJ2 = "#0e3140", VOLT = "#d6ff3f", FEHER = "#f4fffb";
  const PIROS = "#ce2939", ZOLD = "#3a9a50";
  /* az öt játékos (512-es rács) */
  const M = [[112, 360], [168, 148], [256, 282], [344, 148], [400, 360]];

  function hatter(kerek) {
    return `<defs>`
      + `<linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${EJ2}"/><stop offset="1" stop-color="${EJ}"/></linearGradient>`
      + `<radialGradient id="rf" cx=".18" cy="-.05" r=".85"><stop offset="0" stop-color="#a8f0ff" stop-opacity=".30"/><stop offset=".55" stop-color="#a8f0ff" stop-opacity="0"/></radialGradient>`
      + `<radialGradient id="rf2" cx=".9" cy="-.05" r=".6"><stop offset="0" stop-color="${VOLT}" stop-opacity=".16"/><stop offset="1" stop-color="${VOLT}" stop-opacity="0"/></radialGradient>`
      + `</defs>`
      + `<rect width="512" height="512" ${kerek ? 'rx="112"' : ""} fill="url(#hg)"/>`
      + `<rect width="512" height="512" ${kerek ? 'rx="112"' : ""} fill="url(#rf)"/>`
      + `<rect width="512" height="512" ${kerek ? 'rx="112"' : ""} fill="url(#rf2)"/>`;
  }
  /* a kezdőkör íve és a felezővonal — halványan, hogy a lapnak legyen tárgya */
  const IV = `<g fill="none" stroke="${VOLT}" stroke-opacity=".13" stroke-width="6">`
    + `<circle cx="256" cy="300" r="150"/><path d="M0 300H512"/></g>`;

  function jel(o) {
    const vas = o.vas, pr = o.pont;
    const d = "M" + M.map(p => p.join(" ")).join("L");
    /* MÉLYSÉG: alatta sötét árnyék-vonal (nem filter — kis méretben a filter
       elmosná az élt), a vonal maga felülről világosodó volt */
    let s = `<defs><linearGradient id="vg${o.id}" x1="0" y1="140" x2="0" y2="380" gradientUnits="userSpaceOnUse">`
      + `<stop offset="0" stop-color="#ecff8c"/><stop offset="1" stop-color="#c6ee22"/></linearGradient></defs>`;
    if (o.arnyek) s += `<path d="${d}" transform="translate(0 ${o.arnyek})" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="${vas}" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<path d="${d}" fill="none" stroke="url(#vg${o.id})" stroke-width="${vas}" stroke-linejoin="round" stroke-linecap="round"/>`;
    /* a játékosok: fehér pont, sötét gyűrűvel kivágva a vonalból — így a
       pont kis méretben is külön folt marad, nem olvad a vonalba.
       A KÖZÉPSŐ a csapatkapitány: piros–fehér–zöld karszalag-csíkos pont,
       egy kicsit nagyobb — a magyar szál, a jel közepén. */
    M.forEach(([x, y], i) => {
      const r = i === 2 ? pr * 1.18 : pr;
      if (o.arnyek) s += `<circle cx="${x}" cy="${y + o.arnyek}" r="${r + o.gyuru}" fill="#000" fill-opacity=".35"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${r + o.gyuru}" fill="${EJ}"/>`;
      if (i !== 2) { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${FEHER}"/>`; return; }
      const h = 2 * r / 3;
      s += `<clipPath id="kp${o.id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><g clip-path="url(#kp${o.id})">`
        + `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${h + 1}" fill="${PIROS}"/>`
        + `<rect x="${x - r}" y="${y - r + h}" width="${2 * r}" height="${h + 1}" fill="#ffffff"/>`
        + `<rect x="${x - r}" y="${y - r + 2 * h}" width="${2 * r}" height="${h}" fill="${ZOLD}"/></g>`;
    });
    return s;
  }

  const TELJES = IV + jel({ id: "t", vas: 40, pont: 33, gyuru: 11, arnyek: 9 });
  const MINI = jel({ id: "m", vas: 50, pont: 38, gyuru: 12, arnyek: 0 });
  /* ≤32 PX: A PONTOK ELTŰNNEK. Mérve (×4 nagyítással): a négy fehér pont 32 és
     16 pixelen a lap sarkaiba nyomódott, és elmosta az M-et. Itt csak a kövér
     M marad, és a közepén a kapitány — a jel két leglényegesebb eleme. */
  const dA = "M" + M.map(p => p.join(" ")).join("L");
  const APRO = `<g transform="translate(256 268) scale(1.02) translate(-256 -254)">`
    + `<path d="${dA}" fill="none" stroke="${VOLT}" stroke-width="84" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<circle cx="256" cy="282" r="70" fill="${EJ}"/>`
    + `<clipPath id="kpa"><circle cx="256" cy="282" r="56"/></clipPath><g clip-path="url(#kpa)">`
    + `<rect x="200" y="226" width="112" height="38" fill="${PIROS}"/><rect x="200" y="263" width="112" height="38" fill="#fff"/>`
    + `<rect x="200" y="300" width="112" height="38" fill="${ZOLD}"/></g></g>`;

  function svg(valtozat) {
    if (valtozat === "maskable")
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">` + hatter(false)
        + `<g transform="translate(256 256) scale(0.84) translate(-256 -262)">${TELJES}</g></svg>`;
    const tart = (valtozat === "apro") ? APRO : (valtozat === "mini") ? MINI : TELJES;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">` + hatter(true) + tart + `</svg>`;
  }
  return { svg, EJ, VOLT, M };
})();
if (typeof module !== "undefined") module.exports = IKON;
