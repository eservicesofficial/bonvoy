/*
 * Bonvoy service worker — offline fallback + asset caching.
 *
 * Strategies (dev-server safe):
 *  - Navigations  : network-first, offline fallback page when unreachable.
 *  - /api/ GET    : network-first, last-good response served while offline.
 *  - /img/, /icons/, logo, manifest : cache-first (immutable static assets).
 *  - JS/CSS/fonts : network-first with cache fallback (keeps dev HMR fresh).
 */
const VERSION = "bonvoy-v11";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL_ASSETS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png?v=8",
  "/icons/icon-512.png?v=8",
  "/icons/maskable-192.png?v=8",
  "/icons/maskable-512.png?v=8",
  "/icons/apple-touch-icon.png?v=8",
  "/icons/favicon.png?v=8",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isImmutableAsset(url) {
  return (
    url.pathname.startsWith("/img/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never touch mutations
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1) Page navigations — network first, offline fallback screen.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches
          .match("/offline.html", { ignoreSearch: true })
          .then((hit) => hit || new Response("<h1>You are offline</h1>", { headers: { "Content-Type": "text/html" } }))
      )
    );
    return;
  }

  // 2) API reads — network first, last-good cached response while offline.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (hit) =>
              hit ||
              new Response(JSON.stringify({ error: "You are offline." }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              })
          )
        )
    );
    return;
  }

  // 3) Immutable assets — cache first for instant repeat loads.
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // 4) Everything else (chunks, fonts) — network first, cached fallback for offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || Response.error()))
  );
});
