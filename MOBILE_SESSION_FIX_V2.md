# Mobile Session Fix V2 - Complete Solution

## Problem
Sessions not persisting on mobile browsers (Safari, Chrome) but working fine on desktop.

## Root Causes Identified

1. **Cookie Settings**: Mobile browsers require `secure=true` and `same_site=none`
2. **Session Lifetime**: Short session lifetime (2 hours) causes issues on mobile
3. **Cookie Not Being Set**: Session cookie not properly configured in responses
4. **Trusted Proxies**: CapRover proxy needs proper header forwarding

## Complete Solution

### 1. Session Configuration (`config/session.php`)
- Set `secure=true` for HTTPS
- Set `same_site=none` for mobile compatibility
- Increased lifetime to 7 days (10080 minutes)

### 2. AppServiceProvider (`app/Providers/AppServiceProvider.php`)
Forces session configuration in production:
```php
config([
    'session.secure' => true,
    'session.same_site' => 'none',
    'session.http_only' => true,
]);
```

### 3. EnsureSessionCookie Middleware
New middleware that forces correct cookie settings on every response.

### 4. Trusted Proxies
Already configured in `bootstrap/app.php` to trust CapRover proxy.

## Deployment Steps

### Step 1: Update CapRover Environment Variables

In CapRover dashboard → Your app → App Configs → Environmental Variables:

```env
SESSION_LIFETIME=10080
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
APP_ENV=production
```

**IMPORTANT**: Make sure `APP_ENV=production` is set!

### Step 2: Deploy Code

```bash
git add .
git commit -m "Fix mobile session persistence v2"
git push origin main
```

Or use deploy script:
```bash
bash deploy.sh
```

### Step 3: SSH into Container and Run Fix Script

```bash
# From CapRover dashboard, click SSH button
cd /var/www/html
bash fix-production.sh
```

### Step 4: Verify Environment Variables

Inside the container, run:
```bash
php debug-session.php
```

Expected output:
```
Environment:
  APP_ENV: production
  
Session Config:
  Secure: true
  Same Site: none
  Lifetime: 10080 minutes
  Sessions table exists: YES
```

### Step 5: Clear Browser Data and Test

On mobile device:
1. Clear all browser data (cookies, cache)
2. Navigate to your app
3. Login
4. Navigate around
5. Close browser completely
6. Reopen and check if still logged in

## Troubleshooting

### Check if environment variables are applied:

```bash
# SSH into container
php artisan tinker
```

Then run:
```php
config('session.secure');  // Should be true
config('session.same_site');  // Should be 'none'
config('session.lifetime');  // Should be 10080
env('APP_ENV');  // Should be 'production'
```

### Check sessions table:

```bash
php artisan tinker
```

```php
DB::table('sessions')->count();  // Should show number of sessions
DB::table('sessions')->latest('last_activity')->first();  // Show latest session
```

### Check Laravel logs:

```bash
tail -f storage/logs/laravel.log
```

Look for:
- Session errors
- Cookie errors
- Authentication errors

### Test cookie in browser:

Open browser DevTools → Application/Storage → Cookies

Look for cookie named `watchly-session`:
- Secure: ✓
- SameSite: None
- HttpOnly: ✓
- Path: /
- Expires: Should be 7 days from now

### If still not working:

1. **Verify APP_ENV is production**
   ```bash
   echo $APP_ENV
   ```

2. **Clear all caches**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan config:cache
   ```

3. **Restart Apache**
   ```bash
   service apache2 restart
   ```

4. **Check CapRover proxy settings**
   - Ensure HTTPS is enabled
   - Check if Force HTTPS is enabled

5. **Test with curl**
   ```bash
   curl -I https://your-domain.com/login
   ```
   Look for `Set-Cookie` header with `Secure; SameSite=None`

## Why This Works

### Desktop vs Mobile Difference

Desktop browsers are more lenient with cookie settings. Mobile browsers (especially Safari) are stricter:

- **Safari ITP (Intelligent Tracking Prevention)**: Blocks cookies without proper settings
- **Chrome Mobile**: Requires `SameSite=None` with `Secure` flag
- **PWA Mode**: Treated as cross-site context, needs `SameSite=None`

### The Fix

1. **`secure=true`**: Ensures cookies only sent over HTTPS
2. **`same_site=none`**: Allows cookies in all contexts (required for mobile)
3. **Long lifetime**: Prevents premature expiration on mobile
4. **EnsureSessionCookie middleware**: Forces correct settings on every response
5. **AppServiceProvider config**: Ensures settings applied before any request

## Testing Checklist

- [ ] Environment variables set in CapRover
- [ ] Code deployed
- [ ] Fix script run
- [ ] App restarted
- [ ] `debug-session.php` shows correct config
- [ ] Browser cookies cleared
- [ ] Login works on mobile
- [ ] Session persists after closing browser
- [ ] Session persists after navigating away
- [ ] Works in Safari
- [ ] Works in Chrome mobile
- [ ] PWA mode works

## Files Modified

- `config/session.php` - Session configuration
- `app/Providers/AppServiceProvider.php` - Force session config in production
- `app/Http/Middleware/EnsureSessionCookie.php` - New middleware
- `bootstrap/app.php` - Register middleware
- `.env.example` - Updated session settings
- `docker-entrypoint.sh` - Ensure sessions table
- `fix-production.sh` - Updated fix script
- `debug-session.php` - New debug script
