#!/bin/bash

# Script to publish react-native-google-one-tap to npm

set -e

echo "🚀 Publishing react-native-google-one-tap to npm..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the package directory."
    exit 1
fi

# Check if npm is logged in
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Error: You must be logged in to npm. Run 'npm login' first."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/
npm install

# Build the package
echo "🔨 Building package..."
npm run build

# Run tests (if any)
echo "🧪 Running tests..."
npm test || echo "⚠️  No tests found or tests failed"

# Check if package is ready to publish
echo "📋 Checking package..."
npm pack --dry-run

# Ask for confirmation
read -p "📦 Ready to publish? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled."
    exit 1
fi

# Publish to npm
echo "📤 Publishing to npm..."
npm publish

echo "✅ Package published successfully!"
echo "🎉 react-native-google-one-tap is now available on npm!"
echo ""
echo "Install it with:"
echo "npm install react-native-google-one-tap"
echo ""
echo "or"
echo ""
echo "yarn add react-native-google-one-tap"
