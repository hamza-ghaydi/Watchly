# Critical Mobile Browser Fix - Service Worker & Session Issues

## Problems Identified

1. **404 on /api/client-error** - API routes not registered
2. **Service Worker Infinite Loop** - SW intercepting dashboard and causing reload loop
3. **Session Lost** - SW dropping session cookies on intercepted requests
4. **ErrorBoundary Firing** - Real JS crash on mobile (now we can see it)

## Critical Changes Made

### 1. API Routes Registration (`bootstrap/app.php`)
Added `api: __DIR__.'/../routes/api.php'` to routing configuration.

### 2. Service Worker Complete Rewrite (`public/sw.js`)
**CRITICAL CHANGES:**
- Changed from intercepting everything to ONLY caching explicit static assets
- NEVER intercepts HTML pages, API calls, authenticated routes, or POST requests
- NEVER intercepts Inertia requests
- Bumped cache version to v4
- Added extensive logging for debugging

**Key principle:** The SW is now completely passive - it only serves from cache for the 3 static assets we explicitly list, everything else goes straight to the network.

### 3. Service Worker Registration (`resources/views/app.blade.php`)
**CRITICAL CHANGES:**
- Service worker ONLY registers in PWA mode (standalone)
- In regular mobile browser, it UNREGISTERS any existing service worker
- Removed auto-reload on SW update (was causing loops)

This is the key fix - the service worker was running in mobile browsers and causing all the issues.

### 4. Removed EnsureSessionCookie Middleware
This middleware was interfering with session cookies. Removed completely.

### 5. Removed Session Config Forcing (`app/Providers/AppServiceProvider.php`)
Removed the code that was forcing session config at runtime. Let config/session.php handle it.

### 6. Session Configuration (`config/session.php`)
Set `same_site` to `'lax'` (not `'none'`) for better mobile browser compatibility.

## Why This Fixes The Issues

### Service Worker Infinite Loop
**Before:** SW registered in mobile browser → intercepted /dashboard → tried to cache it → broke session → redirected to login → loop

**After:** SW only registers in PWA mode → mobile browser has no SW → no interception → no loop

### Session Lost
**Before:** SW intercepted requests → didn't properly forward cookies → session lost

**After:** No SW in mobile browser → all requests go directly to server → cookies preserved

### 404 on /api/client-error
**Before:** API routes not registered in bootstrap/app.php

**After:** API routes registered → ErrorBoundary can log errors → we can see the real crash

## Deployment Steps

### 1. Clear Service Worker on Mobile
**CRITICAL:** Users who already have the old SW need to clear it.

On mobile browser:
1. Go to Settings → Safari/Chrome → Clear History and Website Data
2. Or visit the site and the new code will unregister the old SW

### 2. Clear All Laravel Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### 3. Rebuild Assets
```bash
npm run build
```

### 4. Deploy
```bash
git add .
git commit -m "Fix mobile service worker infinite loop and session issues"
git push origin main
```

### 5. Restart Application
Restart your web server/container.

## Testing

### Mobile Browser (Primary Test)
1. **Clear browser data completely** (Settings → Clear History and Website Data)
2. Open site in mobile Safari/Chrome
3. Login
4. Navigate to dashboard
5. ✅ Should load normally (no white screen, no loop)
6. Check browser console - should see "[Browser] Unregistering service worker"

### PWA Mode (Secondary Test)
1. Install PWA from home screen
2. Open PWA
3. Login
4. Navigate to dashboard
5. ✅ Should load normally
6. Check console - should see "[PWA] Service Worker registered"

### Error Logging Test
If there's still a crash:
1. Check `storage/logs/laravel.log`
2. Look for "Mobile client error" entries
3. This will show the exact JavaScript error

## What Each Change Does

| Change | Problem It Fixes |
|--------|------------------|
| API routes registration | 404 on /api/client-error |
| SW rewrite (passive mode) | Infinite loop, session loss |
| SW only in PWA mode | Mobile browser issues |
| Remove EnsureSessionCookie | Session interference |
| Remove session forcing | Config conflicts |
| same_site = lax | Mobile cookie compatibility |

## Verification Checklist

- [ ] Mobile browser: No service worker registered
- [ ] Mobile browser: Login works
- [ ] Mobile browser: Dashboard loads (no white screen)
- [ ] Mobile browser: No infinite loop
- [ ] Mobile browser: Session persists
- [ ] PWA: Service worker registered
- [ ] PWA: Everything works
- [ ] Logs: No "Mobile client error" entries (or shows real error if crash)

## If Still Not Working

### Check Service Worker Status
In mobile browser console:
```javascript
navigator.serviceWorker.getRegistrations().then(r => console.log(r))
```
Should return empty array `[]` in mobile browser.

### Check Session Cookie
In mobile browser DevTools → Application → Cookies
Look for `watchly-session` cookie:
- Should exist after login
- Should have `SameSite=Lax`
- Should have `Secure=true` (if HTTPS)

### Check Logs
```bash
tail -f storage/logs/laravel.log
```
Look for any errors when accessing dashboard on mobile.

### Force Clear Service Worker
If SW still registered on mobile, run in console:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister())
})
```

## Key Differences from Previous Fix

| Previous | Now |
|----------|-----|
| SW always registered | SW only in PWA mode |
| SW intercepted everything | SW only caches 3 static files |
| SW tried to be smart | SW is completely passive |
| Session config forced at runtime | Session config from file only |
| EnsureSessionCookie middleware | Removed |
| same_site = none | same_site = lax |

## Expected Behavior

### Mobile Browser
- No service worker
- Direct network requests
- Session cookies work normally
- No caching (except browser cache)

### PWA Mode
- Service worker active
- Only caches icon, logo, notification sound
- Everything else goes to network
- Push notifications work

This separation ensures mobile browsers work like normal websites while PWAs get offline capabilities.
