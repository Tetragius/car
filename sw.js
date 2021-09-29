self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v3').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/icon.png',
                '/car.webmanifest',
                '/sw.js',
                '/js/index.js',
                '/js/components/range.js',
                '/js/components/stick.js',
                '/js/containers/app.js',
                '/js/services/BaseElement.js',
                '/js/services/BLE.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith((async () => {
        const request = await caches.match(event.request);
        if (request) {
            return request;
        }
        return new Response('Ooops!');
    })());
});