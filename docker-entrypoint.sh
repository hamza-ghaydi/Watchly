#!/bin/bash
set -e

# Clear any cached config first so env vars are always fresh
php artisan config:clear
php artisan cache:clear

echo "Waiting for database connection..."
# Wait for database to be ready
until php artisan db:show 2>/dev/null; do
    echo "Database is unavailable - sleeping"
    sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed database if needed (only on first deploy)
if [ "$RUN_SEEDS" = "true" ]; then
    echo "Running seeders..."
    php artisan db:seed --force
fi

# Clear and cache config
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting Apache..."
exec "$@"