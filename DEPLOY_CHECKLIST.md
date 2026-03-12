# Mobile Session Fix - Deployment Checklist

## Before Deployment

- [ ] Read `MOBILE_SESSION_FIX_V2.md` for technical details
- [ ] Read `DEPLOY_SESSION_FIX.md` for step-by-step guide

## CapRover Environment Variables

Go to CapRover → Your App → App Configs → Environmental Variables

Add/Update these:
- [ ] `APP_ENV=production` ⚠️ **CRITICAL**
- [ ] `SESSION_LIFETIME=10080`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_SAME_SITE=none`
- [ ] Click "Save & Update"

## Deploy Code

- [ ] `git add .`
- [ ] `git commit -m "Fix mobile session persistence v2"`
- [ ] `git push origin main`
- [ ] Wait for deployment to complete

## Run Fix Script

SSH into container:
- [ ] `cd /var/www/html`
- [ ] `bash fix-production.sh`
- [ ] Check output for errors

## Verify Configuration

Still in container:
- [ ] `php debug-session.php`
- [ ] Verify `APP_ENV: production`
- [ ] Verify `Secure: true`
- [ ] Verify `Same Site: none`
- [ ] Verify `Lifetime: 10080 minutes`
- [ ] Verify `Sessions table exists: YES`

## Restart Application

- [ ] Go to CapRover dashboard
- [ ] Click "Save & Update" on your app
- [ ] Wait for restart

## Test on Mobile

### Safari
- [ ] Clear all browser data
- [ ] Navigate to app
- [ ] Login
- [ ] Navigate around
- [ ] Close browser completely
- [ ] Wait 30 seconds
- [ ] Reopen browser
- [ ] Navigate to app
- [ ] ✅ Should still be logged in

### Chrome Mobile
- [ ] Clear all browser data
- [ ] Navigate to app
- [ ] Login
- [ ] Navigate around
- [ ] Close browser completely
- [ ] Wait 30 seconds
- [ ] Reopen browser
- [ ] Navigate to app
- [ ] ✅ Should still be logged in

### PWA Mode
- [ ] Install PWA
- [ ] Login
- [ ] Close app
- [ ] Reopen app
- [ ] ✅ Should still be logged in

## If Not Working

- [ ] Check `APP_ENV` is `production` (run `echo $APP_ENV` in container)
- [ ] Clear all caches: `php artisan config:clear && php artisan cache:clear && php artisan config:cache`
- [ ] Restart Apache: `service apache2 restart`
- [ ] Check Laravel logs: `tail -f storage/logs/laravel.log`
- [ ] Check browser DevTools → Cookies for `watchly-session` cookie
- [ ] Verify cookie has: Secure ✓, SameSite: None, HttpOnly ✓

## Success Criteria

✅ Login works on mobile Safari
✅ Login works on mobile Chrome
✅ Session persists after closing browser
✅ Session persists after navigating away
✅ PWA mode works
✅ Desktop still works
✅ No errors in Laravel logs

## Files Changed

- `config/session.php`
- `app/Providers/AppServiceProvider.php`
- `app/Http/Middleware/EnsureSessionCookie.php` (new)
- `bootstrap/app.php`
- `.env.example`
- `docker-entrypoint.sh`
- `fix-production.sh`
- `debug-session.php` (new)

## Support

If still having issues after following all steps:
1. Run `php debug-session.php` and share output
2. Check browser DevTools → Network → Response Headers for login request
3. Share Laravel logs from `storage/logs/laravel.log`
