// Service Worker for Watchly PWA
const CACHE_NAME = 'watchly-v2';
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
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    // Don't intercept navigation requests (page loads, redirects)
    if (event.request.mode === 'navigate') {
        return;
    }

    // Don't intercept POST requests or other mutations
    if (event.request.method !== 'GET') {
        return;
    }

    // Only cache static assets
    const url = new URL(event.request.url);
    const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico|mp3)$/);
    
    if (!isStaticAsset) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
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
