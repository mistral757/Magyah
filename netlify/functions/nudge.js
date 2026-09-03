/* ─────────────────────────────────────────────────────────────────────────────
 *  MAGYAH — BÖKÉS (Web Push)
 *
 *  MIÉRT VAN SZERVEROLDAL. Egy push-üzenetet alá kell írni, és az aláíró
 *  kulcsot NEM lehet a kliensbe tenni: pár perc alatt kiolvassák a JS-ből, és
 *  onnantól bárki küldhet bárkinek a te neveddel. Ez a függvény őrzi a titkos
 *  felét; a kliens csak megkéri, hogy küldjön.
 *
 *  MIÉRT NETLIFY ÉS NEM FIREBASE CLOUD FUNCTION. Ugyanezt tudja, de a
 *  Firebase-út Blaze-csomagot (bankkártyát) kívánna. A Netlify ingyenes
 *  csomagjában ez elfér, és a játék amúgy is ott van kiadva.
 *
 *  MIT NEM KAP MEG A KLIENS. A hívó CSAK a szobakódot küldi. A társ
 *  feliratkozását EZ a függvény olvassa ki a szobából — tehát innen nem lehet
 *  tetszőleges címre üzenetet küldeni, csak annak, aki veled egy szobában van.
 *  A szobakód eleve a hozzáférés határa (aki ismeri, az látja a szobát).
 *
 *  KÖRNYEZETI VÁLTOZÓK (Netlify → Site settings → Environment variables):
 *    VAPID_PUBLIC   a publikus kulcs (ugyanaz, mint az index.html-ben)
 *    VAPID_PRIVATE  a TITKOS kulcs — soha, sehol máshol
 *    VAPID_SUBJECT  "mailto:valaki@pelda.hu" (a push-szolgáltatás ezt kéri)
 *    RTDB_URL       https://<projekt>-default-rtdb.<régió>.firebasedatabase.app
 * ───────────────────────────────────────────────────────────────────────────── */
"use strict";
const webpush = require("web-push");

/* KÉT FÉK, ÉS MINDKETTŐ KELL.
   A percenkénti a normál használat udvariassága; a szoba-szintű az, ami a
   visszaélést fogja. A kliens is fékez, de az csak illem — a védelem itt van,
   mert a klienst bárki megkerülheti. */
const MIN_KOZ_MS = 120000;   /* két bökés közt egy szobában */

function valasz(kod, obj) {
  return { statusCode: kod, headers: { "content-type": "application/json" },
           body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return valasz(405, { error: "csak POST" });

  const PUB = process.env.VAPID_PUBLIC;
  const PRIV = process.env.VAPID_PRIVATE;
  const SUBJ = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  const RTDB = (process.env.RTDB_URL || "").replace(/\/+$/, "");
  if (!PUB || !PRIV || !RTDB)
    return valasz(500, { error: "a szerver nincs beállítva (hiányzó kulcs vagy adatbázis-cím)" });

  let be = {};
  try { be = JSON.parse(event.body || "{}"); } catch (e) { return valasz(400, { error: "hibás kérés" }); }
  const code = String(be.code || "").toUpperCase();
  const from = String(be.from || "").slice(0, 40);
  const team = String(be.team || "").slice(0, 24);
  /* A KÓD ALAKJA A ZÁR ELSŐ FOKA: ami nem szobakód, azzal nem is próbálkozunk. */
  if (!/^[A-Z0-9]{4}$|^[A-Z0-9]{6}$/.test(code)) return valasz(400, { error: "hibás szobakód" });

  /* A SZOBA KIOLVASÁSA. Ugyanazon a nyilvános REST-úton, amit a játék is
     használ — nincs szükség rendszergazdai kulcsra, és nem is adunk neki. */
  let room = null;
  try {
    const r = await fetch(`${RTDB}/mp/rooms/${encodeURIComponent(code)}.json`);
    if (r.ok) room = await r.json();
  } catch (e) { /* lent kezeljük */ }
  if (!room || !room.players) return valasz(404, { error: "nincs ilyen szoba" });

  /* A CÉLPONT: a szoba MÁSIK játékosa. Ha a hívó nincs a szobában, nincs kit
     megböknie — ez zárja ki, hogy egy idegen a kódból mást bökdössön. */
  if (!room.players[from]) return valasz(403, { error: "nem vagy ebben a szobában" });
  const celId = Object.keys(room.players).find((k) => k !== from);
  if (!celId) return valasz(404, { error: "a társad még nem csatlakozott" });

  const nyers = room.players[celId] && room.players[celId].push;
  if (!nyers) return valasz(404, { error: "a társad nem kapcsolta be az értesítést" });
  let sub = null;
  try { sub = typeof nyers === "string" ? JSON.parse(nyers) : nyers; } catch (e) {}
  if (!sub || !sub.endpoint) return valasz(404, { error: "a társad feliratkozása hibás" });

  /* A FÉK, SZERVEROLDALON. A szoba `nudgeAt` mezőjét nézzük — ezt a kliens is
     látja, de nem ő tartja be: ide bárki hívhat, ezért itt kell dönteni. */
  const most = Date.now();
  const utolso = Number(room.nudgeAt || 0);
  if (utolso && most - utolso < MIN_KOZ_MS)
    return valasz(429, { error: "túl gyakori — várj pár percet" });

  webpush.setVapidDetails(SUBJ, PUB, PRIV);
  const teher = JSON.stringify({
    title: "MAGYAH — várnak rád",
    body: (team ? `${team}: ` : "") + `a társad arra vár, hogy továbblépj (${code}).`,
    tag: "magyah-" + code,
    url: "/"
  });

  try {
    await webpush.sendNotification(sub, teher, { TTL: 3600 });
  } catch (e) {
    /* 404/410 = a feliratkozás megszűnt (törölte az appot, más böngésző).
       Ilyenkor TAKARÍTUNK: a halott feliratkozás különben örökre ott ülne, és
       minden bökés csendben elbukna rajta. */
    const st = (e && e.statusCode) || 0;
    if (st === 404 || st === 410) {
      try {
        await fetch(`${RTDB}/mp/rooms/${encodeURIComponent(code)}/players/${encodeURIComponent(celId)}/push.json`,
          { method: "DELETE" });
      } catch (_) {}
      return valasz(410, { error: "a társad feliratkozása lejárt — újra be kell kapcsolnia" });
    }
    return valasz(502, { error: "a push-szolgáltatás nem vette át (" + st + ")" });
  }

  /* A FÉK ÓRÁJÁT CSAK SIKERES KÜLDÉS UTÁN indítjuk: egy elbukott kísérlet ne
     zárja ki a következő, jogos próbálkozást. */
  try {
    await fetch(`${RTDB}/mp/rooms/${encodeURIComponent(code)}/nudgeAt.json`,
      { method: "PUT", body: JSON.stringify(most) });
  } catch (e) {}

  return valasz(200, { ok: true });
};
