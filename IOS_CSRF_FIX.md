# iOS Safari "Page Expired" Fix

## Problem
iPhone Safari shows "Page expired" error when submitting the login form. This happens because iOS Safari aggressively caches pages in bfcache (back/forward cache), causing CSRF tokens to become stale.

## Root Cause
When a user navigates away from the login page and then returns (via back button or new navigation), iOS Safari restores the page from bfcache with the old CSRF token. When they submit the form, Laravel rejects it because the token is expired.

## Solution
Implemented 2 fixes:

### 1. Force Page Reload on bfcache Restoration
**File**: `resources/js/layouts/auth/auth-simple-layout.tsx`

Added `pageshow` event listener that detects when iOS Safari restores the page from bfcache and forces a full reload to get a fresh CSRF token.

```typescript
React.useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
        if (event.persisted) {
            console.log('[iOS Fix] Page restored from cache, reloading for fresh CSRF token');
            window.location.reload();
        }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
}, []);
```

### 2. Prevent Auth Page Caching
**File**: `app/Http/Middleware/RedirectIfAuthenticated.php`

Added cache control headers to prevent iOS Safari from caching auth pages:

```php
$response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
$response->headers->set('Pragma', 'no-cache');
$response->headers->set('Expires', '0');
```

## How It Works

### Before Fix
1. User visits login page (fresh CSRF token)
2. User navigates away
3. User presses back button
4. iOS Safari restores page from bfcache (stale CSRF token)
5. User submits form
6. Laravel rejects: "Page expired"

### After Fix
1. User visits login page (fresh CSRF token)
2. User navigates away
3. User presses back button
4. iOS Safari restores page from bfcache
5. **pageshow event fires, detects bfcache restoration**
6. **Page reloads with fresh CSRF token**
7. User submits form
8. Laravel accepts: Login successful

## Testing

### Test on iPhone Safari
1. Navigate to login page
2. Fill in credentials but DON'T submit
3. Navigate to another page (e.g., home)
4. Press back button
5. Page should reload automatically (check console for `[iOS Fix]` message)
6. Submit login form
7. Should login successfully without "Page expired" error

### Test on Desktop
1. Same steps as above
2. Page should NOT reload (bfcache not used on desktop)
3. Login should still work

## Files Modified

1. `resources/js/layouts/auth/auth-simple-layout.tsx` - Added bfcache detection
2. `app/Http/Middleware/RedirectIfAuthenticated.php` - Added no-cache headers

## Notes

- This fix is specifically for iOS Safari's aggressive bfcache behavior
- Desktop browsers are unaffected (they don't use bfcache as aggressively)
- The reload only happens when page is restored from cache, not on normal navigation
- Cache control headers prevent future caching issues
- Works for all auth pages (login, register, forgot password, etc.)

## Related Issues

This fix complements the previous iOS Safari 18+ white screen fix. Together they solve:
- White screen / redirect loop (service worker fix)
- Page expired on login (CSRF token / bfcache fix)
