#!/bin/bash
set -e

echo "Setting up directories and permissions..."

# Ensure /tmp directory exists with proper permissions
mkdir -p /tmp
chmod 1777 /tmp
chown root:root /tmp

# Ensure storage directories exist
mkdir -p /var/www/html/storage/app/public/avatars
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

# Ensure storage link exists
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
fi

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

# Ensure sessions table exists for database driver
echo "Ensuring sessions table exists..."
php artisan session:table 2>/dev/null || true
php artisan migrate --force

echo "Ensuring schema is in sync with migrations..."
php -r "
    \$pdo = new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );

    \$required = [
        'users' => [
            'username' => 'VARCHAR(255) NULL',
            'avatar'   => 'VARCHAR(255) NULL',
            'bio'      => 'TEXT NULL',
            'role'     => \"VARCHAR(255) NOT NULL DEFAULT 'user'\",
            'two_factor_secret'         => 'TEXT NULL',
            'two_factor_recovery_codes' => 'TEXT NULL',
            'two_factor_confirmed_at'   => 'TIMESTAMP NULL',
        ],
    ];

    foreach (\$required as \$table => \$columns) {
        foreach (\$columns as \$col => \$def) {
            \$exists = \$pdo->query(\"SHOW COLUMNS FROM \$table LIKE '\$col'\")->fetchAll();
            if (empty(\$exists)) {
                \$pdo->exec(\"ALTER TABLE \$table ADD COLUMN \$col \$def\");
                echo \"Added missing column: \$table.\$col\n\";
            }
        }
    }
    echo \"Schema sync complete.\n\";
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