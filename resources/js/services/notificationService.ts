// Notification Service for Browser Push Notifications
export class NotificationService {
    private static instance: NotificationService;
    private permission: NotificationPermission = 'default';
    private audio: HTMLAudioElement | null = null;
    private audioContext: AudioContext | null = null;

    private constructor() {
        this.permission = Notification.permission;
        // Create audio element for notification sound
        this.audio = new Audio('/sounds/notification.mp3');
        this.audio.volume = 0.5;
        
        // Handle audio load errors gracefully
        this.audio.addEventListener('error', () => {
            console.log('Notification sound not found. Using fallback beep.');
            this.audio = null;
        });

        // Initialize Web Audio API for fallback beep
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
            console.log('This browser does not support notifications');
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

        // Play sound
        this.playSound();

        // Show notification
        const notification = new Notification(title, {
            icon: '/images/icon.png',
            badge: '/images/icon.png',
            requireInteraction: false,
            ...options,
        });

        // Vibrate if supported (mobile devices)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
    }

    playSound(): void {
        // Try to play MP3 file first
        if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {
                // If MP3 fails, use fallback beep
                this.playFallbackBeep();
            });
        } else {
            // Use fallback beep if no audio file
            this.playFallbackBeep();
        }
    }

    private playFallbackBeep(): void {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (err) {
            console.log('Could not play fallback beep:', err);
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
