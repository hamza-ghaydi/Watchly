import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationContextType {
    unreadCount: number;
    setUnreadCount: (count: number | ((prev: number) => number)) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
    resetUnreadCount: () => void;
    triggerRefresh: () => void;
    refreshTrigger: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const incrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => prev + 1);
    }, []);

    const decrementUnreadCount = useCallback(() => {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const resetUnreadCount = useCallback(() => {
        setUnreadCount(0);
    }, []);

    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                setUnreadCount,
                incrementUnreadCount,
                decrementUnreadCount,
                resetUnreadCount,
                triggerRefresh,
                refreshTrigger,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
}
