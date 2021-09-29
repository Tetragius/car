self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v2').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/icon.png',
                '/dist/',
                '/dist/boundle.js',
                '/js/',
                '/js/index.js',
                '/js/components/',
                '/js/components/range.js',
                '/js/components/stick.js',
                '/js/containers/',
                '/js/containers/app.js',
                '/js/services/',
                '/js/services/BaseElement.js',
                '/js/services/BLE.js'
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
