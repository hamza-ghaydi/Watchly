# iOS Safari 18+ Fix - Deployment Checklist

## Pre-Deployment Verification

### 1. Files Modified ✓
- [x] `public/sw.js` - Rewritten to never intercept navigation/auth routes
- [x] `resources/views/app.blade.php` - SW registration with SKIP_WAITING
- [x] `resources/js/lib/axios.ts` - Created with withCredentials
- [x] `resources/js/app.tsx` - Imports axios config
- [x] `resources/js/layouts/app/app-sidebar-layout.tsx` - bfcache detection
- [x] `config/session.php` - same_site: lax, secure: true
- [x] `routes/api.php` - POST /api/client-error endpoint
- [x] `resources/js/components/ErrorBoundary.tsx` - Logs to API

### 2. Critical Changes Summary

**Service Worker (public/sw.js)**
- Cache version: `watchly-v5-ios-fix`
- NEVER intercepts: navigation, auth routes, POST/PUT/DELETE, Inertia requests
- Only caches: explicit static assets, /build/, /assets/, /manifest.json
- Push notifications still work

**Session Config**
- `same_site: lax` (not strict - iOS Safari requirement)
- `secure: true` (HTTPS only)
- `lifetime: 10080` (7 days for mobile)

**Axios Config**
- `withCredentials: true` (sends cookies)
- CSRF token from meta tag fallback

**iOS Fixes**
- bfcache reload on pageshow
- Force waiting SW to activate immediately
- SW only registers in PWA mode

## Deployment Steps

### Step 1: Build Assets
```bash
npm run build
```

### Step 2: Deploy to Server
```bash
# Your deployment command here
git push origin main
# or
./deploy.sh
```

### Step 3: Clear Caches
```bash
# On server
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 4: Verify Files on Server
Check these files exist and have correct content:
- `/public/sw.js` - Should have `watchly-v5-ios-fix`
- `/public/build/assets/app-*.js` - New build hash
- `/api/client-error` - Should return 200 OK

## Testing on iPhone Safari iOS 18+

### Test 1: Browser Mode (No PWA)
1. Open Safari on iPhone
2. Navigate to your site
3. Login with credentials
4. Should see dashboard immediately (no white screen)
5. Navigate to different pages
6. Should NOT see any redirect loops
7. Check Safari console for errors

### Test 2: PWA Mode
1. Add to Home Screen
2. Open from home screen
3. Login with credentials
4. Should see dashboard immediately
5. Check for `[SW v5]` logs in console
6. Check for `[iOS Fix]` logs in console
7. Push notifications should still work

### Test 3: Session Persistence
1. Login on iPhone Safari
2. Close browser completely
3. Reopen browser
4. Navigate to site
5. Should still be logged in (no redirect to /login)

### Test 4: Back/Forward Navigation
1. Login and navigate to dashboard
2. Go to another page (e.g., /movies)
3. Press back button
4. Should see dashboard without reload loop
5. Check console for `[iOS Fix] Page restored from bfcache`

## Monitoring

### Check Server Logs
```bash
tail -f storage/logs/laravel.log
```

Look for:
- `Mobile client error` entries (from ErrorBoundary)
- Any 302 redirect loops
- Any session errors

### Check Browser Console
Look for:
- `[SW v5]` messages (service worker activity)
- `[iOS Fix]` messages (bfcache detection)
- `[PWA]` messages (PWA mode detection)
- No infinite fetch loops
- No CSRF token errors

## Rollback Plan

If issues occur, rollback service worker:

1. Edit `public/sw.js` and change cache name to `watchly-v6-rollback`
2. Remove all fetch event logic (keep only push notification handlers)
3. Deploy immediately
4. Old SWs will be replaced on next visit

## Success Criteria

- ✓ iPhone Safari can login without white screen
- ✓ No redirect loops between /dashboard and /login
- ✓ Sessions persist across browser restarts
- ✓ Back/forward navigation works correctly
- ✓ Push notifications still work in PWA mode
- ✓ No errors in storage/logs/laravel.log
- ✓ Desktop browsers unaffected

## Common Issues

### Issue: Still seeing white screen
**Solution**: Clear iPhone Safari cache completely
1. Settings > Safari > Clear History and Website Data
2. Force close Safari app
3. Reopen and test

### Issue: Service worker not updating
**Solution**: The SKIP_WAITING logic should handle this, but if needed:
1. Unregister SW manually in console: `navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))`
2. Hard refresh page
3. SW will re-register with new version

### Issue: Session still lost
**Solution**: Check session config
1. Verify `SESSION_SAME_SITE=lax` in .env
2. Verify `SESSION_SECURE_COOKIE=true` in .env
3. Verify site is on HTTPS
4. Check `storage/logs/laravel.log` for session errors

## Notes

- Service worker only registers in PWA mode (display-mode: standalone)
- Regular browser mode has no service worker interference
- All navigation requests bypass service worker completely
- Session cookies are handled by browser's native fetch
- This fix is specifically for iOS Safari 18+ cookie handling changes
