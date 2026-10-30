/* Cache-first offline strategy. Bump VERSION to force clients to refresh. */
var VERSION = "djp-v1.0.0";
var CACHE = "djp-cache-" + VERSION;
var ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./assets/tips-data.js",
  "./manifest.json",
  "./offline.html",
  "./favicon.ico",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/og-image.png",
  "./browserconfig.xml"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function () { /* skip missing optional asset */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === "basic") {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./offline.html");
        return new Response("", { status: 504, statusText: "Offline" });
      });
    })
  );
});
