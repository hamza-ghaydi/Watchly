# Watchly - CapRover Deployment Guide

This guide will help you deploy Watchly to CapRover with MySQL database.

## Prerequisites

1. A CapRover server set up and running
2. CapRover CLI installed: `npm install -g caprover`
3. Git repository with your code

## Step 1: Create MySQL Database App

1. Log in to your CapRover dashboard
2. Go to **Apps** → **One-Click Apps/Databases**
3. Search for **MySQL** and click on it
4. Configure:
   - **App Name**: `watchly-db`
   - **MySQL Root Password**: Choose a strong password
   - **MySQL Database**: `watchly`
   - **MySQL User**: `watchly_user`
   - **MySQL Password**: Choose a strong password
5. Click **Deploy**
6. Wait for the database to be ready

## Step 2: Create Watchly Application

1. In CapRover dashboard, go to **Apps**
2. Click **Create New App**
3. Enter app name: `watchly`
4. Click **Create New App**

## Step 3: Configure Environment Variables

1. Click on your `watchly` app
2. Go to **App Configs** tab
3. Scroll to **Environmental Variables** section
4. Add the following variables (click **Bulk Edit** for easier input):

```env
APP_NAME=Watchly
APP_ENV=production
APP_DEBUG=false
APP_URL=https://watchly.your-domain.com

DB_CONNECTION=mysql
DB_HOST=srv-captain--watchly-db
DB_PORT=3306
DB_DATABASE=watchly
DB_USERNAME=watchly_user
DB_PASSWORD=your_mysql_password_here

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

LOG_CHANNEL=stack
LOG_LEVEL=error

OMDB_API_KEY=your_omdb_api_key

# VAPID Keys for Push Notifications (generate with: php artisan webpush:vapid)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@example.com

RUN_SEEDS=false
```

5. Click **Add/Update** to save

## Step 4: Generate APP_KEY and VAPID Keys

1. On your local machine, generate APP_KEY:
   ```bash
   php artisan key:generate --show
   ```
2. Copy the generated key (including `base64:` prefix)

3. Generate VAPID keys for push notifications:
   ```bash
   composer require minishlink/web-push
   php artisan webpush:vapid
   ```
4. Copy the generated VAPID keys

5. Add both to CapRover environment variables:
   ```
   APP_KEY=base64:your_generated_key_here
   VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

## Step 5: Enable HTTPS

1. In your app settings, go to **HTTP Settings**
2. Enable **HTTPS**
3. Check **Force HTTPS by redirecting all HTTP traffic to HTTPS**
4. Enable **Websocket Support** (optional, for future features)
5. Click **Save & Update**

## Step 6: Configure Custom Domain (Optional)

1. Go to **HTTP Settings**
2. Under **Custom Domains**, add your domain
3. Click **Connect New Domain**
4. Follow the instructions to point your domain to CapRover

## Step 7: Deploy the Application

### Option A: Deploy via Git (Recommended)

1. Initialize CapRover in your project (if not done):
   ```bash
   caprover login
   ```
   Follow the prompts to connect to your CapRover server

2. Deploy:
   ```bash
   caprover deploy
   ```
   - Select your app: `watchly`
   - Confirm deployment

### Option B: Deploy via GitHub/GitLab

1. In CapRover app settings, go to **Deployment** tab
2. Connect your Git repository
3. Set branch to deploy (e.g., `main`)
4. Enable **Auto Deploy** if desired
5. Click **Save & Update**

## Step 8: First Deployment - Seed Database

If this is your first deployment and you want to seed the database with sample data:

1. Set `RUN_SEEDS=true` in environment variables
2. Deploy the app
3. After successful deployment, set `RUN_SEEDS=false` to prevent re-seeding on future deployments

## Step 9: Create Admin User

After deployment, create an admin user:

1. Go to your app in CapRover
2. Click on **App Configs** → **Deployment** tab
3. Scroll to **Run Command** section
4. Enter:
   ```bash
   php artisan tinker --execute="$user = App\Models\User::create(['name' => 'Admin', 'email' => 'admin@watchly.com', 'username' => 'admin', 'password' => bcrypt('your_password'), 'role' => 'admin', 'email_verified_at' => now()]); echo 'Admin created!';"
   ```
5. Click **Run**

Or SSH into the container:
```bash
# In CapRover dashboard, go to your app → Deployment → View Logs
# Click on "SSH to Container"
php artisan tinker
```

Then run:
```php
$user = App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@watchly.com',
    'username' => 'admin',
    'password' => bcrypt('your_secure_password'),
    'role' => 'admin',
    'email_verified_at' => now()
]);
echo "Admin user created!";
exit;
```

## Step 10: Configure File Storage

For persistent file storage (avatars, etc.):

1. In CapRover app settings, go to **App Configs**
2. Scroll to **Persistent Directories**
3. Add:
   - Path in App: `/var/www/html/storage/app/public`
   - Label: `storage`
4. Add another:
   - Path in App: `/var/www/html/public/avatars`
   - Label: `avatars`
5. Click **Save & Update**

## Troubleshooting

### Missing Database Columns (bio, etc.)

If you see errors like "Unknown column 'bio' in 'field list'":

1. SSH into your container:
   - Go to CapRover dashboard → Your app → Deployment tab
   - Scroll down and click "View Logs"
   - Click "SSH to Container" button
   
2. Run migrations manually:
   ```bash
   php artisan migrate --force
   ```

3. Verify migrations ran:
   ```bash
   php artisan migrate:status
   ```

### File Upload Issues (/tmp directory)

If you see errors like "The file '/tmp/phpXXXXXX' does not exist":

1. Redeploy the application to ensure latest Dockerfile changes are applied
2. SSH into container and verify /tmp exists:
   ```bash
   ls -la /tmp
   # Should show: drwxrwxrwt (permissions 1777)
   ```

3. If /tmp doesn't exist or has wrong permissions:
   ```bash
   mkdir -p /tmp
   chmod 1777 /tmp
   chown root:root /tmp
   ```

4. Restart Apache:
   ```bash
   apache2ctl restart
   ```

### Database Connection Issues

If you see database connection errors:

1. Check that `DB_HOST` is set to `srv-captain--watchly-db`
2. Verify database credentials match what you set in MySQL app
3. Check MySQL app is running in CapRover dashboard

### Permission Issues

If you see permission errors:

1. SSH into the container
2. Run:
   ```bash
   chown -R www-data:www-data /var/www/html/storage
   chown -R www-data:www-data /var/www/html/bootstrap/cache
   chmod -R 775 /var/www/html/storage
   chmod -R 775 /var/www/html/bootstrap/cache
   ```

### Clear Cache

If you need to clear cache after updates:

1. SSH into container or use Run Command
2. Execute:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   ```

### View Logs

1. Go to your app in CapRover
2. Click **Deployment** tab
3. Click **View Logs**
4. Or check Laravel logs in `/var/www/html/storage/logs/laravel.log`

## Updating the Application

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
caprover deploy
```

Or if using auto-deploy, just push to your repository.

## Performance Optimization

### Enable OPcache

Add to environment variables:
```env
PHP_OPCACHE_ENABLE=1
PHP_OPCACHE_MEMORY_CONSUMPTION=256
```

### Increase PHP Memory

Add to environment variables:
```env
PHP_MEMORY_LIMIT=512M
```

## Backup Strategy

### Database Backup

1. In CapRover, go to your MySQL app
2. Use the backup features or set up automated backups
3. Or manually backup:
   ```bash
   docker exec srv-captain--watchly-db mysqldump -u watchly_user -p watchly > backup.sql
   ```

### File Storage Backup

Backup the persistent directories regularly:
- `/var/www/html/storage/app/public`
- `/var/www/html/public/avatars`

## Security Checklist

- ✅ Set `APP_DEBUG=false` in production
- ✅ Use strong passwords for database
- ✅ Enable HTTPS
- ✅ Set `APP_ENV=production`
- ✅ Keep `APP_KEY` secret
- ✅ Regularly update dependencies
- ✅ Monitor logs for suspicious activity

## Support

For issues specific to:
- **CapRover**: https://caprover.com/docs/
- **Laravel**: https://laravel.com/docs
- **Watchly**: Check your repository issues

## Quick Reference

### Important URLs
- CapRover Dashboard: `https://captain.your-domain.com`
- Your App: `https://watchly.your-domain.com`
- MySQL App: `srv-captain--watchly-db:3306`

### Important Commands
```bash
# Deploy
caprover deploy

# View logs
caprover logs -a watchly

# SSH into container
# Use CapRover dashboard → App → Deployment → View Logs → SSH

# Run artisan commands
php artisan migrate
php artisan cache:clear
php artisan config:cache
```
