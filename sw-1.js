/* 30-0 · Service Worker
   Stratégia:
   - a FŐ HTML-oldalnál "network-first": amikor van net, mindig a legfrissebb
     verziót tölti le és menti cache-be — így egy új verzió feltöltése után
     a felhasználó azonnal a friss játékot kapja, nem kell külön verziószámot
     szinkronban tartani a Service Worker és az APP_VERSION között.
   - statikus fájloknál (ikonok, manifest) "cache-first": ezek ritkán
     változnak, gyorsabb betöltést ad, és offline is biztosan elérhetők.
   - ha nincs net ÉS nincs cache-elt HTML sem (első látogatás offline), az
     esemény simán elbukik — ez elkerülhetetlen, első betöltéshez net kell. */
/* A CACHE NEVÉT AKKOR KELL LÉPTETNI, ha egy STATIKUS fájl tartalma változik.
   A statikus ág "cache-first": amit egyszer eltett, azt onnantól a cache-ből
   adja, hálózat nélkül. A manifest teljes képernyőre állítása (display:
   fullscreen) így a régi telepítéseknél sosem érne el — hacsak a cache neve nem
   változik. Új név = új install = friss addAll, az activate pedig kitakarítja a
   régit. A FŐ HTML nem érintett: az mindig "network-first". */
const CACHE_NAME = "harminc-nulla-cache-v3";
const STATIC_ASSETS = [
  "/",
  /* A betűk önhosztoltak (lásd az index.html @font-face blokkját). Itt kell
     lenniük, különben offline a tipográfia szétesne: a HTML megjön a
     cache-ből, a betűk viszont a hálózatról jönnének. Az `addAll` mind a tíz
     szeletet előre letölti, tehát a latin-ext (magyar ő/ű) is offline van. */
  "/fonts/archivo-latin.woff2",
  "/fonts/archivo-latin-ext.woff2",
  "/fonts/archivo-black-latin.woff2",
  "/fonts/archivo-black-latin-ext.woff2",
  "/fonts/anton-latin.woff2",
  "/fonts/anton-latin-ext.woff2",
  "/fonts/oswald-latin.woff2",
  "/fonts/oswald-latin-ext.woff2",
  "/fonts/cormorant-garamond-latin.woff2",
  "/fonts/cormorant-garamond-latin-ext.woff2",
  "/icons/site.webmanifest",
  "/icons/favicon.ico",
  "/icons/apple-touch-icon.png",
  "/icons/kick-line.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {}) // ha egy asset épp nem elérhető, ne akadjon el a teljes telepítés
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const isHTML = req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
    })
  );
});
