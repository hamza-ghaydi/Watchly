# Mobile Session Fix - Quick Start

## The Problem
Sessions not persisting on mobile browsers (Safari, Chrome) but working fine on desktop.

## The Solution
Complete session configuration fix with middleware, proper cookie settings, and extended lifetime.

## Quick Deploy (5 minutes)

### 1. Update CapRover Environment Variables
```
APP_ENV=production
SESSION_LIFETIME=10080
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
```

### 2. Deploy
```bash
git add .
git commit -m "Fix mobile session persistence v2"
git push origin main
```

### 3. Run Fix Script (SSH into container)
```bash
cd /var/www/html
bash fix-production.sh
```

### 4. Verify
```bash
php debug-session.php
```

### 5. Restart App
Click "Save & Update" in CapRover dashboard

### 6. Test
Clear mobile browser data, login, close browser, reopen → should still be logged in ✓

## Documentation

- **`DEPLOY_CHECKLIST.md`** - Step-by-step checklist ⭐ START HERE
- **`DEPLOY_SESSION_FIX.md`** - Detailed deployment guide
- **`MOBILE_SESSION_FIX_V2.md`** - Complete technical documentation
- **`debug-session.php`** - Debug script to verify configuration

## What Changed

1. **New Middleware**: `EnsureSessionCookie` forces correct cookie settings
2. **AppServiceProvider**: Forces session config in production
3. **Session Lifetime**: Extended to 7 days (10080 minutes)
4. **Cookie Settings**: `secure=true`, `same_site=none` for mobile compatibility

## Critical Requirements

⚠️ **`APP_ENV=production` must be set** - The fix only works in production mode!

✅ HTTPS must be enabled in CapRover
✅ Sessions table must exist in database
✅ Trusted proxies configured (already done)

## Testing

Test on:
- [ ] Mobile Safari
- [ ] Mobile Chrome
- [ ] PWA mode
- [ ] Desktop (should still work)

## Troubleshooting

**Not working?**
1. Check `APP_ENV=production` in CapRover
2. Run `php debug-session.php` to verify config
3. Clear all browser data on mobile (not just cache)
4. Check Laravel logs: `tail -f storage/logs/laravel.log`

**Still not working?**
See `MOBILE_SESSION_FIX_V2.md` → Troubleshooting section

## Support Files

- `fix-production.sh` - Automated fix script
- `debug-session.php` - Configuration verification
- `DEPLOY_CHECKLIST.md` - Complete checklist

## Success Criteria

✅ Login works on mobile
✅ Session persists after closing browser
✅ PWA mode works
✅ No errors in logs

---

**Start with `DEPLOY_CHECKLIST.md` for step-by-step instructions!**
