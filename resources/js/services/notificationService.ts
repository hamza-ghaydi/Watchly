// Notification Service for Browser Push Notifications
export class NotificationService {
    private static instance: NotificationService;
    private permission: NotificationPermission = 'default';
    private audio: HTMLAudioElement | null = null;

    private constructor() {
        this.permission = Notification.permission;
        // Create audio element for notification sound
        this.audio = new Audio('/sounds/notification.mp3');
        this.audio.volume = 0.5;
        
        // Handle audio load errors gracefully
        this.audio.addEventListener('error', () => {
            this.audio = null;
        });

        // Listen for messages from service worker to play sound
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'PLAY_NOTIFICATION_SOUND') {
                    this.playSound();
                }
            });
        }
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    async showNotification(title: string, options?: NotificationOptions): Promise<Notification | null> {
        if (this.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) return null;
        }

        // Play sound (will only work after user interaction)
        this.playSound();

        // Check if service worker is available (PWA)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            // Use service worker notification for PWA - this prevents duplicates
            const registration = await navigator.serviceWorker.ready;
            const notificationOptions: NotificationOptions = {
                icon: '/images/icon.png',
                badge: '/images/icon.png',
                requireInteraction: false,
                silent: true, // Prevent default sound since we play custom sound
                ...options,
            };
            await registration.showNotification(title, notificationOptions);
            return null;
        } else {
            // Fallback to regular notification for web
            const notificationOptions: NotificationOptions = {
                icon: '/images/icon.png',
                badge: '/images/icon.png',
                requireInteraction: false,
                silent: true, // Prevent default sound since we play custom sound
                ...options,
            };
            const notification = new Notification(title, notificationOptions);

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);

            return notification;
        }
    }

    playSound(): void {
        // Only play MP3 file - no fallback beep
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch((error) => {
                // Silently fail if autoplay is blocked - this is expected on first load
                // Sound will work after user interacts with the page
            });
        }
    }

    hasPermission(): boolean {
        return this.permission === 'granted';
    }

    getPermission(): NotificationPermission {
        return this.permission;
    }
}

export const notificationService = NotificationService.getInstance();
