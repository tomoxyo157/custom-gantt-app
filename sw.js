/**
 * Zen Gantt Chart - Service Worker (sw.js)
 * Diperbarui untuk mencegah cache agresif pada data Supabase (Real-time sync)
 */

const CACHE_NAME = 'zen-gantt-v3'; // Ubah versi jika ada pembaruan aset statis
const ASSETS_TO_CACHE = [
    './',
    './index.html'
    // Tambahkan file pendukung lain di sini jika ada (contoh: './style.css', './app.js')
];

// 1. Install Event: Menyimpan aset statis dasar ke cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Mengunduh cache aset statis baru...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. Activate Event: Membersihkan cache versi lama yang sudah usang
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Menghapus cache versi lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch Event: Penanganan lalu lintas jaringan
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // KUNCI UTAMA: Jika request mengarah ke domain Supabase, langsung ambil dari server (Bypass Cache total)
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Untuk file aplikasi lokal, gunakan strategi Network First (utamakan jaringan, fallback ke cache jika offline)
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});