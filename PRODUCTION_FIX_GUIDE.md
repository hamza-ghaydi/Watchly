# Production Fix Guide

## Current Issues

1. **Profile picture upload fails** - `/tmp` directory doesn't exist or has wrong permissions
2. **Bio update fails** - `bio` column missing (migrations not run on production)

## Quick Fix (Recommended)

### Step 1: SSH into your CapRover container

1. Go to CapRover dashboard
2. Click on your `watchly` app
3. Go to **Deployment** tab
4. Scroll down and click **View Logs**
5. Click **SSH to Container** button

### Step 2: Run the fix script

Copy and paste this entire command:

```bash
bash -c '
echo "=== Watchly Production Fix Script ==="
echo ""

# Fix /tmp directory
echo "1. Fixing /tmp directory..."
mkdir -p /tmp
chmod 1777 /tmp
chown root:root /tmp
echo "   ✓ /tmp directory fixed"
echo ""

# Fix avatars directory
echo "2. Fixing avatars directory..."
mkdir -p /var/www/html/public/avatars
chown -R www-data:www-data /var/www/html/public/avatars
chmod -R 775 /var/www/html/public/avatars
echo "   ✓ Avatars directory fixed"
echo ""

# Fix storage permissions
echo "3. Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage
echo "   ✓ Storage permissions fixed"
echo ""

# Run migrations
echo "4. Running database migrations..."
php artisan migrate --force
echo "   ✓ Migrations completed"
echo ""

# Clear and rebuild caches
echo "5. Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
echo "   ✓ Caches cleared"
echo ""

echo "6. Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "   ✓ Caches rebuilt"
echo ""

echo "=== All fixes applied successfully! ==="
'
```

### Step 3: Test

1. Try uploading a profile picture
2. Try updating your bio
3. Both should work now!

## Permanent Fix (For Future Deployments)

The Dockerfile and docker-entrypoint.sh have been updated to fix these issues automatically. To apply:

```bash
./deploy.sh
```

This will:
- Create `/tmp` directory with correct permissions
- Ensure avatars directory exists
- Run migrations automatically on deployment
- Set up all permissions correctly

## Manual Fix (Alternative)

If you prefer to run commands individually:

### Fix /tmp directory:
```bash
mkdir -p /tmp
chmod 1777 /tmp
chown root:root /tmp
```

### Fix avatars directory:
```bash
mkdir -p /var/www/html/public/avatars
chown -R www-data:www-data /var/www/html/public/avatars
chmod -R 775 /var/www/html/public/avatars
```

### Run migrations:
```bash
cd /var/www/html
php artisan migrate --force
```

### Clear caches:
```bash
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

## Verify Fixes

### Check /tmp directory:
```bash
ls -la /tmp
# Should show: drwxrwxrwt (permissions 1777)
```

### Check migrations:
```bash
php artisan migrate:status
# Should show all migrations as "Ran"
```

### Check avatars directory:
```bash
ls -la /var/www/html/public/avatars
# Should show: drwxrwxr-x owned by www-data
```

## What Was Fixed

### Dockerfile Changes:
- Added proper `/tmp` directory creation with 1777 permissions
- Added PHP upload configuration
- Separated /tmp creation from other directories

### docker-entrypoint.sh Changes:
- Ensures /tmp exists on every container start
- Sets correct ownership (root:root for /tmp)
- Ensures storage and avatars directories have proper permissions
- Runs migrations automatically

### ProfileController Changes:
- Added error handling for file uploads
- Creates avatars directory if it doesn't exist
- Better logging for debugging

## Future Deployments

After running the fix script once, future deployments will work correctly because:

1. The updated Dockerfile creates /tmp properly
2. The entrypoint script ensures permissions on every start
3. Migrations run automatically on deployment

Just use `./deploy.sh` for all future updates!
