self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v3').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/icon.png',
                '/dist/car.webmanifest',
                '/dist/sw.js',
                '/dist/boundle.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
    );
  });