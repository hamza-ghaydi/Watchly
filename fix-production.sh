#!/bin/bash
# Quick fix script for production issues
# Run this inside the Docker container via SSH

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

# Clear caches
echo "5. Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
echo "   ✓ Caches cleared"
echo ""

# Rebuild caches
echo "6. Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "   ✓ Caches rebuilt"
echo ""

echo "=== All fixes applied successfully! ==="
echo ""
echo "You can now:"
echo "  - Upload profile pictures"
echo "  - Update bio"
echo "  - All features should work properly"
echo ""
