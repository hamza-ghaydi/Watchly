#!/bin/bash
set -e

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

if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
fi

echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
exec "$@"