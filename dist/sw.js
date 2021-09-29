self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/index.css',
                '/dist/',
                '/dist/boundle.js',
            ]);
        })
    );
});