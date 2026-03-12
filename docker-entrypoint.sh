#!/bin/bash
set -e

# Clear any cached config first
php artisan config:clear
php artisan cache:clear

echo "Waiting for database connection..."
until mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Creating database if not exists..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
    -e "CREATE DATABASE IF NOT EXISTS \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Database is ready!"

echo "Running migrations..."
php artisan migrate --force

if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
fi

echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
exec "$@"