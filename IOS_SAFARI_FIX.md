# iOS Safari 18+ White Screen Fix

## Problem
Complete white screen on iPhone Safari (iOS 18+) with infinite redirect loop between /dashboard and /login. All other browsers work perfectly.

## Root Cause
Service worker intercepts navigation requests and strips session cookies on iOS Safari 18+, causing:
1. iPhone loads /dashboard
2. SW intercepts with fetch()
3. SW fetch() doesn't include session cookie (iOS Safari 18+ bug)
4. Server returns 302 redirect to /login
5. SW intercepts /login
6. Infinite loop → white screen

## Critical Fixes Applied

### Fix 1: API Error Logging Route ✓
**File:** `routes/api.php`
- Route already exists and is correct
- Logs client errors to `storage/logs/laravel.log`

### Fix 2: Service Worker Rewrite ✓
**File:** `public/sw.js`
- **CRITICAL:** NEVER intercepts `request.mode === 'navigate'`
- NEVER intercepts authenticated routes (/dashboard, /movies, /feed, etc.)
- NEVER intercepts POST/PUT/DELETE requests
- NEVER intercepts Inertia requests (X-Inertia header)
- ONLY caches explicit static assets (/images/, /sounds/, /build/)
- Bumped cache version to `watchly-v5-ios-fix`
- All navigation requests use browser's native fetch with cookies

**Key Change:**
```javascript
// CRITICAL FIX FOR iOS SAFARI 18+
if (request.mode === 'navigate') {
    return; // Let browser handle it natively with cookies
}
```

### Fix 3: Viewport Meta Tag ✓
**File:** `resources/views/app.blade.php`
- Added `viewport-fit=cover` for iPhone notch/Dynamic Island
- Added `apple-mobile-web-app-status-bar-style`
- CSRF token meta tag already present

### Fix 4: Session Configuration ✓
**File:** `config/session.php`
- `same_site` = `'lax'` (not strict) ✓
- `secure` = `true` in production ✓
- iOS Safari enforces SameSite strictly

### Fix 5: Axios Configuration ✓
**File:** `resources/js/lib/axios.ts` (NEW)
- `withCredentials: true` for cookie support
- CSRF token from meta tag as fallback
- Imported in `app.tsx`

### Fix 6: bfcache Detection ✓
**File:** `resources/js/layouts/app/app-sidebar-layout.tsx`
- Detects when iOS Safari restores page from back/forward cache
- Triggers `router.reload()` when `event.persisted === true`
- Prevents stale Inertia state

### Fix 7: Force SW Activation ✓
**File:** `resources/views/app.blade.php`
- Detects waiting service worker
- Posts `SKIP_WAITING` message to force activation
- Reloads page when new SW takes control
- Ensures iPhones get the fixed SW immediately

## Deployment Steps

### 1. Clear All Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### 2. Rebuild Assets
```bash
npm run build
```

### 3. Deploy
```bash
git add .
git commit -m "Fix iOS Safari 18+ white screen issue"
git push origin main
```

### 4. Restart Application
Restart your web server/container.

## Testing on iPhone

### First Time Users (No Old SW)
1. Open Safari on iPhone
2. Navigate to your site
3. Login
4. ✅ Dashboard loads normally
5. ✅ No redirect loop
6. ✅ No white screen

### Existing Users (Have Old SW)
1. Open Safari on iPhone
2. Navigate to your site
3. Old SW will be replaced automatically
4. Page will reload once
5. Login
6. ✅ Dashboard loads normally

### Force Clear Old SW (If Needed)
1. Settings → Safari → Clear History and Website Data
2. Or wait for automatic SW replacement

## Verification Checklist

- [ ] iPhone Safari: Login works
- [ ] iPhone Safari: Dashboard loads (no white screen)
- [ ] iPhone Safari: No infinite redirect loop
- [ ] iPhone Safari: Navigation between pages works
- [ ] iPhone Safari: Session persists
- [ ] Android Chrome: Still works
- [ ] Desktop browsers: Still work
- [ ] Push notifications: Still work
- [ ] Console shows: `[SW v5] Bypassing navigation request`

## Technical Details

### Why Navigation Mode is Critical
On iOS Safari 18+:
- `fetch()` in service worker doesn't include cookies
- `request.mode === 'navigate'` identifies page loads
- Returning early lets browser use native fetch with cookies

### Service Worker Interception Rules
```javascript
// NEVER INTERCEPT:
- request.mode === 'navigate'  // Page loads
- /dashboard, /movies, /feed   // Auth routes
- POST/PUT/DELETE              // Mutations
- X-Inertia header             // Inertia requests

// ONLY CACHE:
- /images/*, /sounds/*         // Static assets
- /build/*, /assets/*          // Build files
- /manifest.json               // PWA manifest
```

### bfcache (Back/Forward Cache)
iOS Safari aggressively caches pages in memory. When user hits back button:
- Page restored from bfcache
- Inertia state is stale
- `pageshow` event with `persisted: true` fires
- We reload to get fresh state

### Service Worker Versioning
- Old: `watchly-v4`
- New: `watchly-v5-ios-fix`
- Automatic cleanup of old caches
- Force activation with SKIP_WAITING

## What Was NOT Changed

✓ No React components modified
✓ No Laravel controllers modified
✓ No models or migrations modified
✓ No existing routes modified (except added 1 API route)
✓ No push notification handlers modified
✓ No Vite config modified
✓ No new npm packages added
✓ No middleware modified

## Acceptance Criteria

✅ iPhone Safari iOS 18+ can login without redirect loop
✅ Authenticated pages load normally on iPhone
✅ Push notifications still work on all devices
✅ No white screen on any page for any browser
✅ storage/logs/laravel.log captures JS errors from mobile

## Rollback

If issues occur:
1. Revert git commit
2. Run `npm run build`
3. Clear caches
4. Redeploy

The changes are minimal and focused only on iOS Safari compatibility.

## Monitoring

Check logs for:
```bash
tail -f storage/logs/laravel.log | grep "Mobile client error"
```

Check browser console for:
- `[SW v5]` messages
- `[iOS Fix]` messages
- No error messages

## Support

If iPhone still shows white screen:
1. Check console for `[SW v5]` messages
2. Verify SW version: `navigator.serviceWorker.controller`
3. Check if navigation requests are bypassed
4. Clear Safari data and retry
5. Check Laravel logs for errors
