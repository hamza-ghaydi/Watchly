import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initializeTheme } from '@/hooks/use-appearance';
import '../css/app.css';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./pages/**/*.tsx', { eager: false });

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const importer = pages[`./pages/${name}.tsx`];
        
        if (!importer) {
            console.error(`Inertia page not found: ${name}`);
            // Return a fallback page instead of crashing
            return {
                default: () => (
                    <div
                        style={{
                            padding: 40,
                            textAlign: 'center',
                            color: '#F5C518',
                            background: '#070B14',
                            minHeight: '100vh',
                        }}
                    >
                        <h2>Page not found</h2>
                        <a href="/" style={{ color: '#9CA3AF' }}>
                            Go home
                        </a>
                    </div>
                ),
            };
        }

        const page = (await importer()) as any;
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ErrorBoundary>
                <App {...props} />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#F5C518',
        showSpinner: false,
    },
});

// This will set light / dark mode on load...
initializeTheme();
