const CACHE_NAME = "otopos-v1.0";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./gambarotopos192.png",
  "./gambarotopos512.png"
];

// Install - simpan file ke cache biar bisa offline
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch - kalau offline ambil dari cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate - hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});