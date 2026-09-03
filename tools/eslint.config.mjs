/* ─────────────────────────────────────────────────────────────────────────────
   MAGYAH 30-0 — ESLint konfiguráció

   EGYETLEN szabályt kapcsolunk be: a `no-undef`-et. Nem stílus-ellenőrzőnek
   szánjuk — a kód szándékosan tömör, saját formázási nyelve van, és egy
   „javítsd meg a stílust" futtatás több kárt okozna, mint hasznot. Amit
   viszont EL KELL kapni: a 33 000 sor EGY globális scope-on osztozik, ezért
   egy elgépelt függvény- vagy változónév (renderMilestone a renderMilestones
   helyett) semmilyen hibát nem ad betöltéskor — csak akkor derül ki, amikor a
   felhasználó pont arra a gombra kattint. A no-undef ezt fordítás-szerűen
   elkapja.

   A `globals` lista tudatosan KÉZZEL van felsorolva, nem a `globals` csomagból
   jön: így nincs függősége a repónak, és minden felvett név egy tudatos
   döntés — ha egy új böngésző-API-t használunk, azt ide is fel kell venni.

   Futtatás:  ./tools/check.sh   (ez vágja ki az inline blokkot és hívja meg)
   ───────────────────────────────────────────────────────────────────────── */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      /* KLASSZIKUS szkript, nem modul — a játék inline <script> blokkja az. */
      sourceType: "script",
      globals: {
        /* --- alap böngésző-környezet --- */
        window: "readonly", document: "readonly", navigator: "readonly",
        location: "readonly", history: "readonly", screen: "readonly",
        console: "readonly", performance: "readonly", crypto: "readonly",
        /* --- időzítés és animáció --- */
        setTimeout: "readonly", clearTimeout: "readonly",
        setInterval: "readonly", clearInterval: "readonly",
        requestAnimationFrame: "readonly", cancelAnimationFrame: "readonly",
        /* --- tárolás --- */
        localStorage: "readonly", sessionStorage: "readonly",
        /* --- értesítés (P2b): a Notification a böngésző globálisa, az atob
               pedig a VAPID-kulcs base64url → bájt fordításához kell --- */
        Notification: "readonly", atob: "readonly", btoa: "readonly",
        /* --- hálózat és adat --- */
        fetch: "readonly", XMLHttpRequest: "readonly", URL: "readonly",
        URLSearchParams: "readonly", Blob: "readonly", FileReader: "readonly",
        TextEncoder: "readonly", TextDecoder: "readonly",
        structuredClone: "readonly",
        /* --- párbeszédek (a játék használ néhányat) --- */
        alert: "readonly", confirm: "readonly", prompt: "readonly",
        /* --- DOM-kiegészítők --- */
        getComputedStyle: "readonly", matchMedia: "readonly",
        CustomEvent: "readonly", Image: "readonly", Event: "readonly",
        MutationObserver: "readonly", ResizeObserver: "readonly",
        IntersectionObserver: "readonly"
      }
    },
    rules: {
      "no-undef": "error"
    }
  }
];
