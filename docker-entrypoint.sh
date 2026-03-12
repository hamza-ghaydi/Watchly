#!/bin/bash
set -e

echo "Setting up directories and permissions..."

# Ensure /tmp directory exists with proper permissions
mkdir -p /tmp/php_uploads
chmod 1777 /tmp/php_uploads
chown www-data:www-data /tmp/php_uploads

# Ensure avatars directory exists
mkdir -p /var/www/html/public/avatars
chown -R www-data:www-data /var/www/html/public/avatars
chmod -R 775 /var/www/html/public/avatars

# Ensure storage directories have proper permissions
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Only clear config cache (no DB needed for this)
php artisan config:clear

echo "Waiting for MySQL and creating database..."
until php -r "
    \$host = getenv('DB_HOST');
    \$port = getenv('DB_PORT') ?: '3306';
    \$user = getenv('DB_USERNAME');
    \$pass = getenv('DB_PASSWORD');
    \$db   = getenv('DB_DATABASE');
    try {
        \$pdo = new PDO(\"mysql:host=\$host;port=\$port\", \$user, \$pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        \$sql = 'CREATE DATABASE IF NOT EXISTS ' . chr(96) . \$db . chr(96) . ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci';
        \$pdo->exec(\$sql);
        echo \"Database ready.\n\";
        exit(0);
    } catch (Exception \$e) {
        echo \$e->getMessage() . \"\n\";
        exit(1);
    }
"; do
    echo "Database unavailable - retrying in 3s..."
    sleep 3
done

# Now safe to clear all caches (DB exists)
php artisan cache:clear

echo "Running migrations..."
php artisan migrate --force
echo "Ensuring bio column exists..."
php artisan db:statement "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NULL" 2>/dev/null || \
php -r "
    \$pdo = new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    \$cols = \$pdo->query('SHOW COLUMNS FROM users LIKE \'bio\'')->fetchAll();
    if (empty(\$cols)) {
        \$pdo->exec('ALTER TABLE users ADD COLUMN bio TEXT NULL');
        echo \"Added bio column.\n\";
    } else {
        echo \"bio column already exists.\n\";
    }
"

if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
fi

echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
# Tail Laravel log to stdout so it appears in CapRover logs
tail -f /var/www/html/storage/logs/laravel.log &
exec "$@"