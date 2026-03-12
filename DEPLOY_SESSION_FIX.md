# Quick Deployment Guide - Session Fix

## Step 1: Update CapRover Environment Variables

1. Go to CapRover dashboard: `https://captain.your-domain.com`
2. Click on your app (watchly)
3. Go to "App Configs" tab
4. Scroll to "Environmental Variables" section
5. Add these two variables:
   ```
   SESSION_SECURE_COOKIE=true
   SESSION_SAME_SITE=none
   ```
6. Click "Save & Update"

## Step 2: Deploy Updated Code

```bash
git add .
git commit -m "Fix mobile session persistence"
git push origin main
```

Wait for CapRover to automatically deploy (if auto-deploy is enabled).

OR manually deploy:
```bash
bash deploy.sh
```

## Step 3: Run Fix Script (Optional but Recommended)

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

## Step 4: Restart Application

In CapRover dashboard:
1. Go to your app
2. Click "Save & Update" button (even without changes)
3. This will restart the app with new environment variables

## Step 5: Test

On your mobile device (Safari):
1. Clear browser cache and cookies
2. Navigate to your app
3. Login
4. Navigate around the app
5. Close browser completely
6. Reopen and check if still logged in

## Expected Result

✅ Sessions persist across page navigations
✅ Login works on mobile Safari
✅ No more immediate logout after login
✅ PWA mode works correctly

## If Still Not Working

Check Laravel logs in CapRover:
1. Go to your app in CapRover
2. Click "View Logs" tab
3. Look for session-related errors

Or SSH into container and check:
```bash
tail -f /var/www/html/storage/logs/laravel.log
```

Common issues:
- Environment variables not applied (restart app)
- Sessions table doesn't exist (run fix script)
- Config cache not cleared (run `php artisan config:clear`)
