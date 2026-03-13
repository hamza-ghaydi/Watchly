#!/bin/bash

echo "🚀 Deploying iOS Safari 18+ Fix..."
echo ""

# Build assets
echo "📦 Building assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Git operations
echo "📝 Committing changes..."
git add .
git commit -m "Fix: iOS Safari 18+ white screen and session persistence

- Rewrote service worker to never intercept navigation requests
- Added bfcache detection for iOS Safari back/forward navigation
- Configured axios with withCredentials for cookie handling
- Added client error logging endpoint
- Force waiting service workers to activate immediately
- Session config optimized for mobile (lax SameSite, 7 day lifetime)

Fixes infinite redirect loop and white screen on iPhone Safari iOS 18+"

echo ""
echo "🚢 Pushing to repository..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed!"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. SSH into your server and run:"
echo "   php artisan cache:clear"
echo "   php artisan config:clear"
echo "   php artisan route:clear"
echo "   php artisan view:clear"
echo ""
echo "2. Test on iPhone Safari iOS 18+:"
echo "   - Login should work without white screen"
echo "   - No redirect loops"
echo "   - Session persists across browser restarts"
echo ""
echo "3. Monitor logs:"
echo "   tail -f storage/logs/laravel.log"
echo ""
echo "4. Check browser console for:"
echo "   - [SW v5] messages"
echo "   - [iOS Fix] messages"
echo "   - No errors"
echo ""
