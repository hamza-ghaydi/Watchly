#!/bin/bash

# Watchly CapRover Deployment Script
# This script helps deploy Watchly to CapRover

set -e

echo "🚀 Watchly CapRover Deployment"
echo "=============================="
echo ""

# Check if caprover CLI is installed
if ! command -v caprover &> /dev/null; then
    echo "❌ CapRover CLI is not installed."
    echo "Install it with: npm install -g caprover"
    exit 1
fi

echo "✅ CapRover CLI found"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository found"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Deploying with uncommitted changes (they won't be deployed)"
    fi
fi

echo ""
echo "📦 Building assets..."
npm run build

echo ""
echo "🔍 Checking Dockerfile..."
if [ ! -f Dockerfile ]; then
    echo "❌ Dockerfile not found!"
    exit 1
fi

if [ ! -f captain-definition ]; then
    echo "❌ captain-definition not found!"
    exit 1
fi

echo "✅ Deployment files ready"
echo ""

# Deploy
echo "🚀 Deploying to CapRover..."
caprover deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check your app logs in CapRover dashboard"
echo "2. Verify the app is running at your domain"
echo "3. Create an admin user if this is first deployment"
echo ""
echo "For more information, see CAPROVER_DEPLOYMENT.md"
