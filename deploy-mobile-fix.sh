#!/bin/bash
set -e

echo "=== Critical Mobile Browser Fix Deployment ==="
echo ""

echo "Step 1: Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
echo "✓ Caches cleared"
echo ""

echo "Step 2: Rebuilding assets..."
npm run build
echo "✓ Assets rebuilt"
echo ""

echo "Step 3: Optimizing Laravel..."
php artisan optimize
echo "✓ Laravel optimized"
echo ""

echo "=== Deployment Complete ==="
echo ""
echo "IMPORTANT: Tell mobile users to:"
echo "1. Clear browser data (Settings → Clear History and Website Data)"
echo "2. Refresh the site"
echo ""
echo "The old service worker will be automatically unregistered."
echo ""
echo "Test on mobile browser:"
echo "- Login should work"
echo "- Dashboard should load (no white screen)"
echo "- No infinite loop"
echo "- Check console for '[Browser] Unregistering service worker'"
echo ""
