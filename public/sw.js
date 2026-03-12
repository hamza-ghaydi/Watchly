// Service Worker for Watchly PWA - Minimal, Non-Intercepting Version
const CACHE_NAME = 'watchly-v4';
const STATIC_ASSETS = [
    '/images/icon.png',
    '/images/logowatchly.png',
    '/sounds/notification.mp3',
];

// Install event - cache static resources only
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS).catch(err => {
                    console.error('[SW] Failed to cache assets:', err);
                });
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    clients.claim();
});

// Fetch event - CRITICAL: DO NOT INTERCEPT ANYTHING EXCEPT EXPLICIT STATIC ASSETS
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // NEVER INTERCEPT:
    // 1. Any HTML pages (navigation)
    // 2. Any API calls
    // 3. Any authenticated routes
    // 4. Any POST/PUT/DELETE requests
    // 5. Any Inertia requests
    
    // Only intercept explicit static assets we cached
    const isExplicitStaticAsset = STATIC_ASSETS.some(asset => url.pathname === asset);
    
    if (!isExplicitStaticAsset) {
        // Let the browser handle it normally - DO NOT INTERCEPT
        return;
    }

    // Only for our explicit static assets, try cache first
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    console.log('[SW] Serving from cache:', url.pathname);
                    return response;
                }
                console.log('[SW] Fetching from network:', url.pathname);
                return fetch(request);
            })
            .catch((error) => {
                console.error('[SW] Fetch failed:', error);
                return fetch(request);
            })
    );
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Watchly';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/images/icon.png',
        badge: '/images/icon.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'watchly-notification',
        requireInteraction: false,
        silent: true,
        data: data.url ? { url: data.url } : {},
        actions: data.url ? [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ] : [],
    };
    
    event.waitUntil(
        Promise.all([
            self.registration.showNotification(title, options),
            playNotificationSound()
        ])
    );
});

// Function to play notification sound
async function playNotificationSound() {
    try {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clients.forEach(client => {
            client.postMessage({
                type: 'PLAY_NOTIFICATION_SOUND'
            });
        });
    } catch (error) {
        console.error('[SW] Failed to play notification sound:', error);
    }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Skip waiting requested');
        self.skipWaiting();
    }
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
