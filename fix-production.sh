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
mkdir -p /var/www/html/storage/app/public/avatars
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage
echo "   ✓ Avatars directory fixed"
echo ""

# Ensure storage link exists
echo "3. Creating storage link..."
php artisan storage:link
echo "   ✓ Storage link created"
echo ""

# Create sessions table
echo "4. Creating sessions table..."
php artisan session:table 2>/dev/null || echo "   (migration already exists)"
echo "   ✓ Sessions table migration created"
echo ""

# Run migrations
echo "5. Running database migrations..."
php artisan migrate --force
echo "   ✓ Migrations completed"
echo ""

# Clear caches
echo "6. Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
echo "   ✓ Caches cleared"
echo ""

# Rebuild caches
echo "7. Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "   ✓ Caches rebuilt"
echo ""

echo "=== All fixes applied successfully! ==="
echo ""
echo "IMPORTANT: Update your .env file with these settings:"
echo "  SESSION_SECURE_COOKIE=true"
echo "  SESSION_SAME_SITE=none"
echo ""
echo "Then restart your application for session fixes to take effect."
echo ""
