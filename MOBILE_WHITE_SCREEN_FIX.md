# Mobile White Screen Fix

## Problem
Website works perfectly on desktop but shows white screen on mobile browsers for authenticated pages (dashboard, movies, feed, etc.) while public pages (home, login, register) work fine.

## Changes Applied

### 1. Error Boundary (`resources/js/components/ErrorBoundary.tsx`)
- Added global error boundary to catch and display errors instead of white screen
- Logs errors to server for debugging
- Shows user-friendly error message with refresh button

### 2. Client Error Logging (`routes/api.php`)
- Added `/api/client-error` endpoint to log mobile errors
- Errors logged to `storage/logs/laravel.log`

### 3. App.tsx Updates (`resources/js/app.tsx`)
- Wrapped app in ErrorBoundary
- Changed from eager to lazy loading (`eager: false`) to reduce initial bundle size
- Added fallback page for missing routes
- Removed StrictMode (can cause issues on mobile)

### 4. Session Configuration (`config/session.php`)
- Changed `same_site` from `none` to `lax` for better mobile compatibility
- Keeps `secure` true for production HTTPS

### 5. App Blade Template (`resources/views/app.blade.php`)
- Added CSRF token meta tag
- Added mobile-web-app-capable meta tags
- Added @routes directive BEFORE @vite (critical for Ziggy/route helper)

### 6. Vite Configuration (`vite.config.ts`)
- Added chunk splitting to reduce bundle size for mobile
- Splits vendor libraries into separate chunks
- Reduces memory usage on mobile browsers

### 7. Service Worker (`public/sw.js`)
- Updated to NEVER intercept authenticated routes
- Never caches Inertia requests
- Never caches API requests
- Never caches POST requests
- Only caches static assets

## Deployment Steps

### 1. Clear All Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### 2. Update Environment Variables
In production `.env`, ensure:
```env
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=true
```

### 3. Rebuild Assets
```bash
npm run build
```

### 4. Optimize Laravel
```bash
php artisan optimize
```

### 5. Deploy
Push changes to production and restart the application.

## Testing

### 1. Check Error Logs
After deploying, if still seeing white screen:
```bash
tail -f storage/logs/laravel.log
```

Look for entries with "Mobile client error" - this will show the exact JavaScript error.

### 2. Mobile Browser Testing
1. Clear browser cache completely on mobile
2. Open site in mobile Safari/Chrome
3. Login
4. Navigate to dashboard
5. Should see content (not white screen)

### 3. Remote Debugging
For detailed debugging:
- Chrome: chrome://inspect → Remote Devices
- Safari: Develop → [Your iPhone] → [Your Site]

## Common Issues and Solutions

### Issue: Still White Screen
**Solution**: Check `storage/logs/laravel.log` for the exact error from ErrorBoundary

### Issue: "route is not defined"
**Solution**: Ensure `@routes` is before `@vite` in `app.blade.php`

### Issue: Large Bundle Size
**Solution**: The chunk splitting should help, but you can add more chunks in `vite.config.ts`

### Issue: Service Worker Caching Old Version
**Solution**: 
1. Increment CACHE_NAME in `public/sw.js` (already changed to v3)
2. Hard refresh on mobile (hold reload button)
3. Or unregister SW in DevTools

### Issue: Session Not Persisting
**Solution**: Verify `SESSION_SAME_SITE=lax` in production `.env`

## What Each Fix Addresses

1. **Error Boundary**: Shows errors instead of white screen, logs to server
2. **Lazy Loading**: Reduces initial bundle size for mobile memory limits
3. **Session Fix**: Ensures cookies work on mobile browsers
4. **@routes Fix**: Ensures route helper is available before app loads
5. **Chunk Splitting**: Prevents mobile memory crashes from large bundles
6. **Service Worker Fix**: Prevents stale cached pages on authenticated routes

## Verification

After deployment, the mobile browser should:
- ✅ Show login page
- ✅ Successfully login
- ✅ Show dashboard (not white screen)
- ✅ Navigate between pages
- ✅ Show error message if something crashes (not white screen)

If you see the error boundary message, check the logs for the specific error.

## Rollback

If issues occur, you can rollback by:
1. Reverting the git commit
2. Running `npm run build`
3. Clearing caches
4. Redeploying

The changes are minimal and focused on fixing the mobile issue without affecting desktop functionality.
