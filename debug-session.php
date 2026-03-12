<?php
// Debug script to check session configuration
// Run this via: php debug-session.php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Session Configuration Debug ===\n\n";

echo "Environment:\n";
echo "  APP_ENV: " . env('APP_ENV') . "\n";
echo "  APP_URL: " . env('APP_URL') . "\n\n";

echo "Session Config:\n";
echo "  Driver: " . config('session.driver') . "\n";
echo "  Lifetime: " . config('session.lifetime') . " minutes\n";
echo "  Secure: " . (config('session.secure') ? 'true' : 'false') . "\n";
echo "  HTTP Only: " . (config('session.http_only') ? 'true' : 'false') . "\n";
echo "  Same Site: " . (config('session.same_site') ?? 'null') . "\n";
echo "  Domain: " . (config('session.domain') ?? 'null') . "\n";
echo "  Path: " . config('session.path') . "\n";
echo "  Cookie Name: " . config('session.cookie') . "\n\n";

echo "Database:\n";
echo "  Connection: " . config('database.default') . "\n";
echo "  Host: " . config('database.connections.mysql.host') . "\n";
echo "  Database: " . config('database.connections.mysql.database') . "\n\n";

// Check if sessions table exists
try {
    $tables = DB::select('SHOW TABLES');
    $tableNames = array_map(fn($t) => array_values((array)$t)[0], $tables);
    echo "Sessions table exists: " . (in_array('sessions', $tableNames) ? 'YES' : 'NO') . "\n";
    
    if (in_array('sessions', $tableNames)) {
        $count = DB::table('sessions')->count();
        echo "Sessions in database: $count\n";
    }
} catch (\Exception $e) {
    echo "Error checking sessions table: " . $e->getMessage() . "\n";
}

echo "\n=== End Debug ===\n";
