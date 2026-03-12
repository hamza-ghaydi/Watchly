#!/bin/bash
# Script to migrate existing avatars from public/avatars to storage/app/public/avatars
# Run this ONCE after deploying the new code

echo "=== Avatar Migration Script ==="
echo ""

# Create storage directory
mkdir -p /var/www/html/storage/app/public/avatars
chown -R www-data:www-data /var/www/html/storage/app/public/avatars
chmod -R 775 /var/www/html/storage/app/public/avatars

# Ensure storage link exists
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
    echo "✓ Storage link created"
fi

# Copy existing avatars if they exist
if [ -d "/var/www/html/public/avatars" ] && [ "$(ls -A /var/www/html/public/avatars)" ]; then
    echo "Copying existing avatars..."
    cp -r /var/www/html/public/avatars/* /var/www/html/storage/app/public/avatars/
    chown -R www-data:www-data /var/www/html/storage/app/public/avatars
    echo "✓ Avatars copied"
fi

# Update database paths
echo "Updating database avatar paths..."
php artisan tinker --execute="
    \$users = App\Models\User::whereNotNull('avatar')->where('avatar', 'like', '/avatars/%')->get();
    foreach (\$users as \$user) {
        \$filename = basename(\$user->avatar);
        \$user->avatar = '/storage/avatars/' . \$filename;
        \$user->save();
    }
    echo 'Updated ' . \$users->count() . ' user avatars';
"

echo ""
echo "=== Migration Complete! ==="
echo ""
echo "Avatars are now stored in: storage/app/public/avatars"
echo "Accessible via: /storage/avatars/filename.jpg"
echo ""
