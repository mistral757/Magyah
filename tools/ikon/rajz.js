/* MAGYAH — az ikon RAJZA, egyetlen helyen.
   Ebből készül mind a 19 fájl; kézzel egyiket sem szerkesztjük.

   HÁROM VÁLTOZAT, ÉS MIND A HÁROM KELL:
     · "teljes"   — szóvédjegy + aranyvonal + labda. 72 pixeltől fölfelé.
     · "mini"     — CSAK a labda, nagyban. 48 pixel alatt a hétbetűs szó
                    elmosódott folt: ott a labda többet mond, mint egy
                    olvashatatlan felirat. (Mérve: lásd tools/ikon/meret.html)
     · "maskable" — teljes széltében krém, a rajz a KÖZÉPSŐ 80%-os körbe
                    húzva. Az Android launcher körre vág; ami azon kívül van,
                    arra nincs garancia. Ez NEM ugyanaz a kép kicsinyítve. */
const IKON = (() => {
  const CREAM = "#F2EDE1", INK = "#1B1815", GOLD = "#C9A227";

  /* A LABDA — VILÁGOS GÖMB, SÖTÉT FOLTOKKAL.
     KÉT ROSSZ VÁLTOZAT UTÁN JUTOTTAM IDE, és érdemes leírni, miért:
       1. sötét korong + krém ötszög + krém küllők a csúcsokból → a küllők és
          az ötszög EGYETLEN alakzattá olvadtak: csillag lett, nem labda.
       2. ugyanez rövidebb küllőkkel → a csillag csak HATÁROZOTTABB lett.
     A felismerhető futball-jel a fordítottja (gondolj a ⚽-re): VILÁGOS gömb,
     rajta sötét ötszög-foltok. A középső folt és a peremen körbefutó öt
     részfolt együtt még 32 pixelen is labdának olvas — mérve.
     A körvonal nem díszítés: krém alapon a krém gömbnek nincs széle nélküle. */
  let _lb = 0;
  function labda(cx, cy, r) {
    const id = "lb" + (++_lb);
    const otszog = (x, y, m, forg) => {
      const P = [];
      for (let i = 0; i < 5; i++) {
        const a = (-90 + i * 72 + forg) * Math.PI / 180;
        P.push(`${(x + m * Math.cos(a)).toFixed(1)},${(y + m * Math.sin(a)).toFixed(1)}`);
      }
      return `<polygon points="${P.join(" ")}" fill="${INK}"/>`;
    };
    let d = `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>`
          + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${CREAM}" stroke="${INK}"`
          + ` stroke-width="${(r * 0.12).toFixed(1)}"/>`
          + `<g clip-path="url(#${id})">` + otszog(cx, cy, r * 0.37, 0);
    /* A peremi foltok az ÉLEK irányában ülnek (+36°), és félig kilógnak a
       gömbből — a vágás metszi el őket, pont ahogy a valódi varrás mutatja. */
    for (let i = 0; i < 5; i++) {
      const a = (-90 + i * 72 + 36) * Math.PI / 180;
      d += otszog(cx + r * 0.90 * Math.cos(a), cy + r * 0.90 * Math.sin(a), r * 0.34, 180);
    }
    return d + `</g>`;
  }

  /* A BECSAPÓDÁS VONALA: hátrafelé rövidülő, vékonyodó sávok. */
  function ivek(x, y, r) {
    return [0, 1, 2].map(i => {
      const dy = (i - 1) * r * 0.70, h = r * (2.45 - i * 0.60), v = r * (0.30 - i * 0.055);
      return `<path d="M${(x - r * 0.92).toFixed(1)} ${(y + dy).toFixed(1)} h-${h.toFixed(1)}"`
           + ` stroke="${INK}" stroke-width="${v.toFixed(1)}" stroke-linecap="round" fill="none"`
           + ` opacity="${(0.95 - i * 0.24).toFixed(2)}"/>`;
    }).join("");
  }

  const TELJES =
      `<text x="256" y="196" text-anchor="middle" font-family="Anton" font-size="104"`
    + ` letter-spacing="2" fill="${INK}">MAGYAH</text>`
    + `<rect x="196" y="226" width="120" height="9" rx="4.5" fill="${GOLD}"/>`
    + ivek(330, 364, 64) + labda(330, 364, 64);

  const MINI = ivek(322, 256, 132) + labda(322, 256, 132);
  /* 32 PIXEL ALATT A MOZGÁSVONAL IS ZAJ. Ott egyetlen dolog fér el olvashatóan:
     maga a labda, teljes szélességben. Mérve: a vonalakkal a 16-os favicon
     határozatlan folt lett, nélkülük tiszta, felismerhető korong. */
  const APRO = labda(256, 256, 196);

  /* A lekerekítés SUGARA a méret 22%-a — ugyanaz az arány minden méretben. */
  function svg(valtozat) {
    if (valtozat === "maskable")
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`
        + `<rect width="512" height="512" fill="${CREAM}"/>`
        + `<g transform="translate(256 256) scale(0.76) translate(-256 -256)">${TELJES}</g></svg>`;
    const tart = (valtozat === "apro") ? APRO : (valtozat === "mini") ? MINI : TELJES;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">`
      + `<rect width="512" height="512" rx="112" fill="${CREAM}"/>${tart}</svg>`;
  }
  return { svg, CREAM, INK, GOLD };
})();
if (typeof module !== "undefined") module.exports = IKON;
