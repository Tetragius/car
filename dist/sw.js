self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v3').then(cache => {
            return cache.addAll([
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

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        if (r) return r;
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        cache.put(e.request, response.clone());
        return response;
    })());
});
