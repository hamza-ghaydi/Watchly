// Service Worker for Watchly PWA - iOS Safari 18+ Compatible
const CACHE_NAME = 'watchly-v5-ios-fix';
const STATIC_ASSETS = [
    '/images/icon.png',
    '/images/logowatchly.png',
    '/sounds/notification.mp3',
];

// Install event - cache static resources only
self.addEventListener('install', (event) => {
    console.log('[SW v5] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW v5] Caching static assets');
                return cache.addAll(STATIC_ASSETS).catch(err => {
                    console.error('[SW v5] Failed to cache assets:', err);
                });
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW v5] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('[SW v5] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    clients.claim();
});

// Fetch event - CRITICAL: NEVER INTERCEPT NAVIGATION OR AUTHENTICATED REQUESTS
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // CRITICAL FIX FOR iOS SAFARI 18+:
    // NEVER intercept navigation requests - they must use browser's native fetch
    // which includes session cookies. SW fetch() strips cookies on iOS Safari 18+.
    if (request.mode === 'navigate') {
        console.log('[SW v5] Bypassing navigation request:', url.pathname);
        return; // Let browser handle it natively
    }

    // NEVER intercept authenticated routes - they need session cookies
    const authRoutes = [
        '/dashboard',
        '/movies',
        '/feed',
        '/recommendations',
        '/watch-together',
        '/notifications',
        '/users',
        '/admin',
        '/settings',
        '/api/',
    ];
    
    if (authRoutes.some(route => url.pathname.startsWith(route))) {
        console.log('[SW v5] Bypassing authenticated route:', url.pathname);
        return; // Let browser handle it natively
    }

    // NEVER intercept POST/PUT/DELETE - they need CSRF tokens and session
    if (request.method !== 'GET') {
        console.log('[SW v5] Bypassing non-GET request:', request.method, url.pathname);
        return; // Let browser handle it natively
    }

    // NEVER intercept Inertia requests - they need session state
    if (request.headers.get('X-Inertia')) {
        console.log('[SW v5] Bypassing Inertia request:', url.pathname);
        return; // Let browser handle it natively
    }

    // Only cache explicit static assets we listed
    const isExplicitStaticAsset = STATIC_ASSETS.some(asset => url.pathname === asset);
    
    // Also cache build assets and manifest
    const isBuildAsset = url.pathname.startsWith('/build/') || 
                         url.pathname.startsWith('/assets/') ||
                         url.pathname === '/manifest.json';
    
    if (isExplicitStaticAsset || isBuildAsset) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('[SW v5] Serving from cache:', url.pathname);
                        return response;
                    }
                    console.log('[SW v5] Fetching and caching:', url.pathname);
                    return fetch(request).then(fetchResponse => {
                        // Cache successful responses
                        if (fetchResponse && fetchResponse.status === 200) {
                            const responseToCache = fetchResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseToCache);
                            });
                        }
                        return fetchResponse;
                    });
                })
                .catch((error) => {
                    console.error('[SW v5] Fetch failed:', error);
                    return fetch(request);
                })
        );
        return;
    }

    // Everything else: let browser handle it natively (no interception)
    console.log('[SW v5] Bypassing other request:', url.pathname);
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
