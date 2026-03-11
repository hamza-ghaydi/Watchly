import { useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { notificationService } from '@/services/notificationService';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface Notification {
    id: number;
    type: string;
    message: string;
    url: string;
    read_at: string | null;
    created_at: string;
}

export function useNotifications() {
    const { auth } = usePage().props as any;
    const lastCheckRef = useRef<Date>(new Date());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { incrementUnreadCount, triggerRefresh } = useNotificationContext();

    useEffect(() => {
        if (!auth?.user) return;

        // Request notification permission on mount
        notificationService.requestPermission();

        // Poll for new notifications every 30 seconds
        const checkForNewNotifications = async () => {
            try {
                const response = await axios.get('/notifications');
                const notifications: Notification[] = response.data.notifications;

                // Filter notifications created after last check
                const newNotifications = notifications.filter(n => {
                    const createdAt = new Date(n.created_at);
                    return createdAt > lastCheckRef.current && !n.read_at;
                });

                // Show browser notifications for new items
                for (const notification of newNotifications) {
                    const browserNotification = await notificationService.showNotification('Watchly', {
                        body: notification.message,
                        tag: `notification-${notification.id}`,
                        data: { url: notification.url, id: notification.id },
                    });

                    // Handle notification click
                    if (browserNotification) {
                        browserNotification.onclick = () => {
                            window.focus();
                            router.visit(notification.url);
                            browserNotification.close();
                        };
                    }

                    // Update unread count in the bell icon
                    incrementUnreadCount();
                }

                // Trigger refresh of notification bell if there are new notifications
                if (newNotifications.length > 0) {
                    triggerRefresh();
                }

                lastCheckRef.current = new Date();
            } catch (error) {
                console.error('Failed to check notifications:', error);
            }
        };

        // Initial check after 5 seconds
        const initialTimeout = setTimeout(checkForNewNotifications, 5000);

        // Then check every 30 seconds
        intervalRef.current = setInterval(checkForNewNotifications, 30000);

        return () => {
            clearTimeout(initialTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [auth?.user, incrementUnreadCount, triggerRefresh]);
}

