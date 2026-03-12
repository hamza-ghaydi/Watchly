# Avatar Fix Guide - Persistent Storage

## Problem
Avatars don't show in incognito mode because they're stored in `public/avatars/` which is lost on container restarts (Docker containers are ephemeral).

## Solution
Use Laravel's storage system with persistent volumes in CapRover.

## What Changed

### 1. Storage Location
- **Before**: `public/avatars/` (ephemeral, lost on restart)
- **After**: `storage/app/public/avatars/` (persistent with CapRover volume)

### 2. Avatar URLs
- **Before**: `/avatars/filename.jpg`
- **After**: `/storage/avatars/filename.jpg`

### 3. Files Modified
- `app/Http/Controllers/Settings/ProfileController.php` - Uses Laravel Storage
- `Dockerfile` - Creates storage directories
- `docker-entrypoint.sh` - Ensures storage link exists
- `CAPROVER_DEPLOYMENT.md` - Added persistent storage setup

## Deployment Steps

### Step 1: Configure Persistent Storage in CapRover

**CRITICAL**: Do this BEFORE deploying the new code!

1. Go to CapRover dashboard → Your `watchly` app
2. Click **App Configs** tab
3. Scroll to **Persistent Directories** section
4. Click **Add Persistent Directory**
5. Enter:
   - **Path in App**: `/var/www/html/storage/app/public`
   - **Label**: `storage-public`
6. Click **Save & Update**

### Step 2: Deploy the New Code

```bash
git add .
git commit -m "Fix: Use persistent storage for avatars"
git push
./deploy.sh
```

### Step 3: Migrate Existing Avatars (If Any)

SSH into your CapRover container and run:

```bash
bash -c '
# Create storage directory
mkdir -p /var/www/html/storage/app/public/avatars
chown -R www-data:www-data /var/www/html/storage/app/public/avatars

# Ensure storage link exists
php artisan storage:link

# Copy existing avatars if they exist
if [ -d "/var/www/html/public/avatars" ] && [ "$(ls -A /var/www/html/public/avatars 2>/dev/null)" ]; then
    cp -r /var/www/html/public/avatars/* /var/www/html/storage/app/public/avatars/
    chown -R www-data:www-data /var/www/html/storage/app/public/avatars
    echo "Avatars copied"
fi

# Update database paths
php artisan tinker --execute="
    \$users = App\Models\User::whereNotNull(\"avatar\")->where(\"avatar\", \"like\", \"/avatars/%\")->get();
    foreach (\$users as \$user) {
        \$filename = basename(\$user->avatar);
        \$user->avatar = \"/storage/avatars/\" . \$filename;
        \$user->save();
    }
    echo \"Updated \" . \$users->count() . \" user avatars\n\";
"

echo "Migration complete!"
'
```

### Step 4: Test

1. Upload a new avatar
2. Refresh the page (Ctrl+F5)
3. Open in incognito mode
4. Avatar should load correctly

## How It Works

### Storage Link
Laravel creates a symlink: `public/storage` → `storage/app/public`

This allows files in `storage/app/public/avatars/` to be accessed via `/storage/avatars/`

### Persistent Volume
CapRover mounts `/var/www/html/storage/app/public` as a persistent volume, so files survive:
- Container restarts
- Deployments
- Updates

### Upload Flow
1. User uploads avatar
2. Stored in `storage/app/public/avatars/filename.jpg`
3. Database saves `/storage/avatars/filename.jpg`
4. Browser accesses via `https://yoursite.com/storage/avatars/filename.jpg`
5. Apache serves from `public/storage/avatars/filename.jpg` (symlink)
6. File persists across deployments

## Troubleshooting

### Avatars still not showing

1. **Check storage link exists**:
   ```bash
   ls -la /var/www/html/public/storage
   # Should show: storage -> ../storage/app/public
   ```

2. **Recreate storage link**:
   ```bash
   rm -f /var/www/html/public/storage
   php artisan storage:link
   ```

3. **Check permissions**:
   ```bash
   ls -la /var/www/html/storage/app/public/avatars
   # Should be owned by www-data
   ```

4. **Fix permissions**:
   ```bash
   chown -R www-data:www-data /var/www/html/storage
   chmod -R 775 /var/www/html/storage
   ```

### Persistent volume not working

1. Verify in CapRover:
   - App Configs → Persistent Directories
   - Should show: `/var/www/html/storage/app/public`

2. Redeploy after adding persistent directory

3. Check volume is mounted:
   ```bash
   df -h | grep storage
   ```

### Old avatars not migrated

Run the migration script again:
```bash
bash migrate-avatars.sh
```

## Benefits

✅ Avatars persist across deployments
✅ Works in incognito mode (no cache needed)
✅ Proper Laravel storage conventions
✅ Easy backup (just backup the volume)
✅ Scalable for future file uploads

## Future File Uploads

For any future file uploads (documents, images, etc.), use the same pattern:

```php
// Store file
$path = $file->store('folder-name', 'public');

// Save to database
$model->file_path = '/storage/' . $path;

// Access in browser
// https://yoursite.com/storage/folder-name/filename.ext
```

All files in `storage/app/public/` are automatically persistent!
