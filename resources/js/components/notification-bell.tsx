import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationContext } from '@/contexts/NotificationContext';

interface Notification {
    id: number;
    type: string;
    message: string;
    url: string;
    read_at: string | null;
    created_at: string;
}

export function NotificationBell({ initialUnreadCount }: { initialUnreadCount: number }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const { unreadCount, setUnreadCount, refreshTrigger } = useNotificationContext();

    // Initialize unread count from props
    useEffect(() => {
        setUnreadCount(initialUnreadCount);
    }, [initialUnreadCount, setUnreadCount]);

    const fetchNotifications = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications when opened or when refresh is triggered
    useEffect(() => {
        if (open || refreshTrigger > 0) {
            fetchNotifications();
        }
    }, [open, refreshTrigger]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read_at) {
            try {
                await axios.post(`/notifications/${notification.id}/read`);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(notifications.map(n => 
                    n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                ));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        setOpen(false);
        router.visit(notification.url);
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center"
                            style={{ background: 'var(--gold)', color: '#0D1117' }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs"
                            style={{ color: 'var(--gold)' }}
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                            No notifications
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="w-full p-4 text-left hover:bg-opacity-50 transition-colors border-b"
                                style={{
                                    background: notification.read_at ? 'transparent' : 'var(--gold-bg)',
                                    borderColor: 'var(--card-border)',
                                }}
                            >
                                <p
                                    className="text-sm mb-1"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {notification.message}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {formatTime(notification.created_at)}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
