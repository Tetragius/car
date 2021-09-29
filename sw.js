self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v3').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/icon.png',
                '/car.webmanifest',
                '/sw.js',
                '/dist/boundle.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(async () => {
        const request = await caches.match(event.request);
        console.log(request);
        if (request) {
            return request;
        }
    });
});