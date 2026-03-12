// Service Worker for Watchly PWA
const CACHE_NAME = 'watchly-v3';
const urlsToCache = [
    '/images/icon.png',
    '/images/logowatchly.png',
    '/sounds/notification.mp3',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // CRITICAL: Never intercept these — let them go to the server always
    const isInertiaRequest = request.headers.get('X-Inertia');
    const isAPIRequest = url.pathname.startsWith('/api/');
    const isAuthRoute = [
        '/dashboard',
        '/movies',
        '/feed',
        '/recommendations',
        '/watch-together',
        '/notifications',
        '/users',
        '/admin',
        '/settings',
    ].some((p) => url.pathname.startsWith(p));
    const isPOST = request.method !== 'GET';

    if (isInertiaRequest || isAPIRequest || isAuthRoute || isPOST) {
        // Always fetch from network — never cache authenticated pages
        return;
    }

    // Don't intercept navigation requests (page loads, redirects)
    if (request.mode === 'navigate') {
        return;
    }

    // Only cache static assets
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico|mp3)$/);
    
    if (!isStaticAsset) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Watchly';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/images/icon.png',
        badge: '/images/icon.png',
        vibrate: [200, 100, 200],
        tag: data.tag || 'watchly-notification',
        requireInteraction: false,
        silent: true, // Prevent default sound - we play custom sound via message
        data: data.url ? { url: data.url } : {},
        actions: data.url ? [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ] : [],
    };
    
    event.waitUntil(
        Promise.all([
            self.registration.showNotification(title, options),
            // Play notification sound
            playNotificationSound()
        ])
    );
});

// Function to play notification sound
async function playNotificationSound() {
    try {
        // Get all clients (open tabs/windows)
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        // Send message to all clients to play sound
        clients.forEach(client => {
            client.postMessage({
                type: 'PLAY_NOTIFICATION_SOUND'
            });
        });
    } catch (error) {
    }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    // Handle action buttons
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
