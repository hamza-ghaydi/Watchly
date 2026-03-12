#!/bin/bash
set -e

# Clear cached config so env vars are always fresh
php artisan config:clear
php artisan cache:clear

echo "Creating database if not exists..."
php artisan db:create 2>/dev/null || true

# Wait loop using raw PHP PDO — no mysql binary needed
echo "Waiting for database..."
until php -r "
try {
    \$pdo = new PDO(
        'mysql:host={$DB_HOST};port={$DB_PORT}',
        '{$DB_USERNAME}',
        '{$DB_PASSWORD}'
    );
    \$pdo->exec('CREATE DATABASE IF NOT EXISTS \`{$DB_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo 'Connected and database ensured.' . PHP_EOL;
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "Database unavailable - retrying in 2s..."
    sleep 2
done

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