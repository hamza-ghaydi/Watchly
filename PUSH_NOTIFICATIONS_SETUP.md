# Push Notifications Setup Guide

This guide explains how to set up Web Push notifications for Watchly.

## Features

- Real-time browser notifications with sound
- PWA support for mobile devices
- Background notifications when app is closed
- Automatic notification polling (every 10 seconds)
- Custom notification sound (`/sounds/notification.mp3`)

## Setup Instructions

### 1. Install Dependencies

```bash
composer require minishlink/web-push
npm install
```

### 2. Generate VAPID Keys

VAPID keys are required for Web Push API authentication:

```bash
php artisan webpush:vapid
```

This will output something like:
```
VAPID_PUBLIC_KEY=BKxT...
VAPID_PRIVATE_KEY=5K3...
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Add Keys to .env

Add the generated keys to your `.env` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 4. Run Migrations

```bash
php artisan migrate
```

This creates the `push_subscriptions` table to store user subscriptions.

### 5. Add Notification Sound

Place your notification sound file at:
```
public/sounds/notification.mp3
```

If the file doesn't exist, the system will use a fallback beep sound.

### 6. Test Push Notifications

1. Open Watchly in your browser
2. Allow notifications when prompted
3. Have another user follow you or invite you to a Watch Together room
4. You should receive a browser notification with sound

## How It Works

### Frontend

1. **Service Worker** (`public/sw.js`): Handles push notifications in the background
2. **Push Notification Service** (`resources/js/services/pushNotificationService.ts`): Manages subscriptions
3. **Notification Service** (`resources/js/services/notificationService.ts`): Handles browser notifications and sound
4. **useNotifications Hook** (`resources/js/hooks/useNotifications.ts`): Polls for new notifications every 10 seconds

### Backend

1. **PushSubscription Model**: Stores user push subscriptions
2. **WebPushService**: Sends push notifications to subscribed users
3. **Controllers**: Automatically send push notifications when creating notifications

## Notification Flow

1. User allows notifications in browser
2. Service worker registers and subscribes to push notifications
3. Subscription is sent to backend and stored in database
4. When a notification is created (follow, invite, etc.):
   - Notification is saved to database
   - Push notification is sent to all user's subscribed devices
   - Service worker receives push and shows notification
   - Sound plays via message to active tabs
5. Frontend polls every 10 seconds for new notifications
6. Unread count updates in real-time

## PWA Support

The app works as a Progressive Web App:

1. **Manifest** (`public/manifest.json`): Defines app metadata
2. **Service Worker**: Enables offline support and push notifications
3. **Install Prompt**: Users can install the app on mobile devices

### Installing as PWA

**Android:**
1. Open Watchly in Chrome
2. Tap the menu (⋮) → "Install app" or "Add to Home screen"

**iOS:**
1. Open Watchly in Safari
2. Tap Share button → "Add to Home Screen"

## Troubleshooting

### Notifications not working

1. Check browser permissions: Settings → Site Settings → Notifications
2. Verify VAPID keys are set in `.env`
3. Check browser console for errors
4. Ensure HTTPS is enabled (required for push notifications)

### Sound not playing

1. Verify `/sounds/notification.mp3` exists
2. Check browser audio permissions
3. Ensure volume is not muted
4. Fallback beep should play if MP3 is missing

### PWA not installing

1. Ensure HTTPS is enabled
2. Check `manifest.json` is accessible
3. Verify service worker is registered
4. Check browser console for manifest errors

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (iOS 16.4+)
- Opera: Full support

## Security Notes

- VAPID keys should be kept secret
- Never commit `.env` file to version control
- Use HTTPS in production (required for push notifications)
- Subscriptions are tied to specific devices/browsers
