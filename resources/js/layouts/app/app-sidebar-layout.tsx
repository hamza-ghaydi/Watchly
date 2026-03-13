import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { ToastNotifications } from '@/components/toast-notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <NotificationProvider>
            <AppSidebarLayoutContent breadcrumbs={breadcrumbs}>
                {children}
            </AppSidebarLayoutContent>
        </NotificationProvider>
    );
}

function AppSidebarLayoutContent({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    // Initialize browser notifications
    useNotifications();

    // Fix for iOS Safari bfcache (back/forward cache)
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            // If page is restored from bfcache, reload to get fresh state
            if (event.persisted) {
                console.log('[iOS Fix] Page restored from bfcache, reloading...');
                router.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <ToastNotifications />
        </AppShell>
    );
}
