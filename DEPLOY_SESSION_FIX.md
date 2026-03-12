# Quick Deployment Guide - Session Fix V2

## Critical: Check APP_ENV First!

The fix only works if `APP_ENV=production`. Check this first in CapRover!

## Step 1: Update CapRover Environment Variables

1. Go to CapRover dashboard: `https://captain.your-domain.com`
2. Click on your app (watchly)
3. Go to "App Configs" tab
4. Scroll to "Environmental Variables" section
5. Add/Update these variables:
   ```
   APP_ENV=production
   SESSION_LIFETIME=10080
   SESSION_SECURE_COOKIE=true
   SESSION_SAME_SITE=none
   ```
6. Click "Save & Update"

## Step 2: Deploy Updated Code

```bash
git add .
git commit -m "Fix mobile session persistence v2"
git push origin main
```

Wait for CapRover to automatically deploy (if auto-deploy is enabled).

OR manually deploy:
```bash
bash deploy.sh
```

## Step 3: Run Fix Script

SSH into your CapRover container:

```bash
# From CapRover dashboard, click "SSH" button on your app
# OR use CLI:
caprover ssh --appName watchly
```

Inside the container, run:
```bash
cd /var/www/html
bash fix-production.sh
```

## Step 4: Verify Configuration

Still in the container:
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

If any value is wrong, check your environment variables in CapRover!

## Step 5: Restart Application

In CapRover dashboard:
1. Go to your app
2. Click "Save & Update" button
3. Wait for restart to complete

## Step 6: Test on Mobile

On your mobile device:
1. **Clear browser data completely** (Settings → Safari/Chrome → Clear History and Website Data)
2. Navigate to your app
3. Login
4. Navigate around the app
5. **Close browser completely** (swipe up and close)
6. Wait 30 seconds
7. Reopen browser and navigate to your app
8. Should still be logged in ✓

## Troubleshooting

### Still not working?

1. **Check APP_ENV**
   ```bash
   # In container
   echo $APP_ENV
   # Should output: production
   ```

2. **Check session config**
   ```bash
   php artisan tinker
   config('session.secure');  // Should be true
   config('session.same_site');  // Should be 'none'
   ```

3. **Clear all caches**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan config:cache
   service apache2 restart
   ```

4. **Check browser cookies**
   - Open DevTools on mobile (use desktop Safari → Develop → Your iPhone)
   - Go to Storage/Application → Cookies
   - Look for `watchly-session` cookie
   - Should have: Secure ✓, SameSite: None, HttpOnly ✓

5. **Check Laravel logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Common Issues

**Issue**: Config shows `secure: false`
**Fix**: `APP_ENV` is not set to `production`. Update in CapRover and restart.

**Issue**: Sessions table doesn't exist
**Fix**: Run `php artisan session:table && php artisan migrate --force`

**Issue**: Cookie not being set
**Fix**: Check CapRover has HTTPS enabled and Force HTTPS is on.

**Issue**: Works on desktop but not mobile
**Fix**: Clear mobile browser data completely, not just cache.

## What Changed in V2

1. Added `EnsureSessionCookie` middleware to force correct cookie settings
2. Updated `AppServiceProvider` to force config in production
3. Increased session lifetime to 7 days (10080 minutes)
4. Added `debug-session.php` script for troubleshooting

## Next Steps

After successful deployment:
- Test on multiple mobile browsers (Safari, Chrome)
- Test in PWA mode
- Test after closing browser
- Test after 24 hours

See `MOBILE_SESSION_FIX_V2.md` for complete technical details.
