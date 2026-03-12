// Push Notification Service for Web Push API
import axios from 'axios';

export class PushNotificationService {
    private static instance: PushNotificationService;
    private registration: ServiceWorkerRegistration | null = null;
    private subscription: PushSubscription | null = null;

    private constructor() {}

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    async initialize(): Promise<boolean> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications not supported');
            return false;
        }

        try {
            // Register service worker
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    async subscribe(): Promise<boolean> {
        if (!this.registration) {
            const initialized = await this.initialize();
            if (!initialized) return false;
        }

        try {
            // Check if already subscribed
            const existingSubscription = await this.registration!.pushManager.getSubscription();
            if (existingSubscription) {
                this.subscription = existingSubscription;
                // Send to backend to ensure it's stored
                await this.sendSubscriptionToBackend(existingSubscription);
                return true;
            }

            // Get VAPID public key from backend
            const { data } = await axios.get('/push/public-key');
            const publicKey = data.publicKey;

            if (!publicKey) {
                console.error('VAPID public key not configured');
                return false;
            }

            // Subscribe to push notifications
            const subscription = await this.registration!.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey),
            });

            this.subscription = subscription;

            // Send subscription to backend
            await this.sendSubscriptionToBackend(subscription);

            console.log('Push notification subscription successful');
            return true;
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            return false;
        }
    }

    async unsubscribe(): Promise<boolean> {
        if (!this.subscription) {
            return true;
        }

        try {
            // Unsubscribe from push manager
            await this.subscription.unsubscribe();

            // Remove from backend
            await axios.post('/push/unsubscribe', {
                endpoint: this.subscription.endpoint,
            });

            this.subscription = null;
            console.log('Push notification unsubscription successful');
            return true;
        } catch (error) {
            console.error('Failed to unsubscribe from push notifications:', error);
            return false;
        }
    }

    private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
        const subscriptionJson = subscription.toJSON();
        
        await axios.post('/push/subscribe', {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscriptionJson.keys?.p256dh,
                auth: subscriptionJson.keys?.auth,
            },
            contentEncoding: (PushManager as any).supportedContentEncodings?.[0] || 'aesgcm',
        });
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    isSubscribed(): boolean {
        return this.subscription !== null;
    }

    async getSubscription(): Promise<PushSubscription | null> {
        if (!this.registration) {
            await this.initialize();
        }
        
        if (!this.registration) return null;

        return await this.registration.pushManager.getSubscription();
    }
}

export const pushNotificationService = PushNotificationService.getInstance();
