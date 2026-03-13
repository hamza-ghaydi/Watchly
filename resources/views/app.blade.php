<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Fix mobile navigation black page */
            body {
                background-color: oklch(1 0 0);
            }

            body.dark {
                background-color: oklch(0.145 0 0);
            }

            /* Ensure smooth transitions */
            html, body {
                min-height: 100vh;
                min-height: -webkit-fill-available;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- PWA Manifest --}}
        <link rel="manifest" href="{{ asset('manifest.json') }}">
        <meta name="theme-color" content="#0D1117">
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0D1117">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="Watchly">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">

        <link rel="icon" href="{{ asset('images/icon.png') }}" sizes="any">
        <link rel="icon" href="{{ asset('images/icon.png') }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ asset('images/icon.png') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased ">
        @inertia

        {{-- Service Worker Registration - Only in PWA mode --}}
        <script>
            // Detect PWA mode
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
            
            if (isPWA) {
                document.cookie = 'pwa_mode=true; path=/; max-age=31536000';
                
                // Only register service worker in PWA mode
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js')
                            .then(registration => {
                                console.log('[PWA] Service Worker registered');
                                
                                // CRITICAL iOS FIX: Force waiting SW to activate immediately
                                if (registration.waiting) {
                                    console.log('[iOS Fix] Forcing waiting SW to activate');
                                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                                    // Reload page when new SW activates
                                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                                        console.log('[iOS Fix] New SW activated, reloading...');
                                        window.location.reload();
                                    });
                                }
                                
                                // Check for updates every 60 seconds
                                setInterval(() => {
                                    registration.update();
                                }, 60000);

                                // Handle service worker updates
                                registration.addEventListener('updatefound', () => {
                                    const newWorker = registration.installing;
                                    newWorker.addEventListener('statechange', () => {
                                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                            console.log('[PWA] New service worker available');
                                            // Force new SW to activate
                                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                                        }
                                    });
                                });
                            })
                            .catch(error => {
                                console.error('[PWA] Service Worker registration failed:', error);
                            });
                    });
                }
            } else {
                // In regular browser mode, unregister any existing service worker
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                        registrations.forEach(registration => {
                            console.log('[Browser] Unregistering service worker');
                            registration.unregister();
                        });
                    });
                }
            }
        </script>
    </body>
</html>
