#!/bin/bash

echo "🚀 Deploying iOS Safari CSRF Fix..."
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
git commit -m "Fix: iOS Safari 'Page expired' error on login

- Added bfcache detection to reload page when restored from cache
- Added no-cache headers to auth pages to prevent stale CSRF tokens
- Ensures fresh CSRF token on every auth page visit

Fixes 'Page expired' error when submitting login form on iPhone Safari"

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
echo "📋 Test on iPhone Safari:"
echo "1. Navigate to login page"
echo "2. Navigate away and press back button"
echo "3. Page should reload automatically"
echo "4. Submit login form"
echo "5. Should login without 'Page expired' error"
echo ""
echo "Check console for: [iOS Fix] Page restored from cache"
echo ""
