/* MAGYAH · Service Worker
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
/* v5: ÚJ IKONKÉSZLET (3.9.25). A statikus ág „cache-first”, tehát a régi
   telepítéseken a RÉGI ikonok maradnának örökre — pont az a rajz, amit
   jogtisztasági okból cserélni kellett. A név léptetése az egyetlen dolog,
   ami ezt kikényszeríti. */
const CACHE_NAME = "harminc-nulla-cache-v5";
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
  "/icons/icon-512x512.png",
  /* Maskable ikonok: az Android launcher ezeket vágja körre/squircle-re. */
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png"
];

/* MIÉRT NEM addAll.
   MÉRVE: az `addAll` ATOMI — ha a listából EGYETLEN fájl 404-et ad, az egész
   ígéret elbukik, és a cache-be SEMMI nem kerül be. A régi `.catch(() => {})`
   pedig ezt némán elnyelte, tehát a hiba még csak nem is látszott: a mérés
   szerint egyetlen hiányzó ikontól a 24 bejegyzésből 0 lett, és onnantól az
   offline indulás nem működött volna — miközben a telepítés „sikeresnek”
   látszik.

   Ezért fájlonként tesszük el őket. Egy hiányzó darab így csak önmagát viszi,
   a többi huszonhárom a helyén marad. Ami tényleg nem ment be, azt a fetch
   `cache-first` ága úgyis pótolja az első online használatkor. */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null))))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ================= P2b — ÉRTESÍTÉS =================
   EZ AZ EGYETLEN RÉSZ, AMI BEZÁRT JÁTÉK MELLETT IS FUT. A lap ilyenkor nem
   létezik; a böngésző a service workert ébreszti fel, és ő rajzolja ki az
   értesítést. Ezért van itt, és nem az index.html-ben.

   SZABVÁNYOS WEB PUSH, NEM FCM-SDK. A hasznos teher egy sima JSON, amit
   bármelyik szerver küldhet a VAPID-kulccsal — nem kell hozzá Firebase
   Cloud Function, és vele Blaze-csomag sem.

   A `waitUntil` NEM formalitás: az értesítés kirajzolása aszinkron, és
   nélküle a böngésző elaltathatná a workert, mielőtt megjelenne. */
self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = {}; }
  const cim = d.title || "MAGYAH";
  const opts = {
    body: d.body || "A társad vár rád.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    /* A CÍMKE ÖSSZEVONJA a szoba korábbi értesítéseit: három bökésből nem
       lesz három sor az értesítési sávban, hanem egy, a legfrissebbel. */
    tag: d.tag || "magyah-nudge",
    renotify: true,
    data: { url: d.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(cim, opts));
});

/* KOPPINTÁS AZ ÉRTESÍTÉSRE. Ha a játék MÁR nyitva van valahol, azt hozzuk
   előre — új lapot nyitni ilyenkor a legrosszabb, amit tehetünk: a
   felhasználó két példányban találná magát, és a mentés két helyen élne.
   Csak ha egyetlen ablak sincs, akkor nyitunk újat. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const cel = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((lista) => {
        for (const c of lista) {
          if ("focus" in c) return c.focus();
        }
        return self.clients.openWindow ? self.clients.openWindow(cel) : null;
      })
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
