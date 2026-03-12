# Mobile Browser Session Fix

## Problem
Sessions not persisting on mobile Safari after login. Users get logged out immediately after successful authentication.

## Root Cause
Mobile Safari requires specific cookie settings for session persistence:
- `secure=true` for HTTPS connections
- `same_site=none` for cross-site compatibility
- Sessions table must exist in database

## Solution Applied

### 1. Session Configuration (`config/session.php`)
Updated to automatically set secure cookies in production:
```php
'secure' => env('SESSION_SECURE_COOKIE', env('APP_ENV') === 'production'),
'same_site' => env('SESSION_SAME_SITE', env('APP_ENV') === 'production' ? 'none' : 'lax'),
```

### 2. Environment Variables (`.env`)
Add these to your production `.env`:
```env
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
```

### 3. Docker Entrypoint (`docker-entrypoint.sh`)
Added sessions table creation:
```bash
php artisan session:table 2>/dev/null || true
php artisan migrate --force
```

## Deployment Steps

### For CapRover:

1. **Update Environment Variables**
   - Go to CapRover dashboard → Your app → App Configs
   - Add these environment variables:
     ```
     SESSION_SECURE_COOKIE=true
     SESSION_SAME_SITE=none
     ```

2. **Deploy Updated Code**
   ```bash
   git add .
   git commit -m "Fix mobile session persistence"
   git push origin main
   ```

3. **Run Fix Script** (SSH into container)
   ```bash
   caprover deploy
   # Wait for deployment to complete
   # Then SSH into the container and run:
   bash fix-production.sh
   ```

4. **Restart Application**
   - In CapRover dashboard, restart your app

## Verification

Test on mobile Safari:
1. Open your app in mobile Safari
2. Login with credentials
3. Navigate to dashboard
4. Close browser completely
5. Reopen browser and navigate to your app
6. Should still be logged in

## Technical Details

### Why `same_site=none`?
Mobile Safari treats PWA requests differently. Setting `same_site=none` allows cookies to be sent in all contexts, which is necessary for PWA and mobile browser compatibility.

### Why `secure=true`?
When using `same_site=none`, browsers require the `secure` flag. This ensures cookies are only sent over HTTPS.

### Session Driver
Using `database` driver instead of `file` ensures sessions persist across container restarts and work properly with Docker volumes.

## Troubleshooting

If sessions still don't persist:

1. **Check sessions table exists**
   ```bash
   php artisan tinker
   DB::table('sessions')->count();
   ```

2. **Verify environment variables**
   ```bash
   php artisan config:show session
   ```

3. **Check Apache/proxy headers**
   Ensure your reverse proxy (CapRover) is forwarding HTTPS headers correctly.

4. **Clear all caches**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan config:cache
   ```

5. **Check Laravel logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```
