const CACHE_NAME = 'zen-gantt-v1';
const ASSETS_TO_CACHE = ['/', '/index.html', './index.html'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.hostname.includes('supabase.co')) {
        return event.respondWith(fetch(event.request));
    }
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                return response;
            });
        })
    );
});