const CACHE_NAME = 'zen-gantt-v1';

// Install event (tidak menggunakan cache.addAll yang rawan error)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Fetch event opsional (biarkan aplikasi meload secara normal dari network/cache browser)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});