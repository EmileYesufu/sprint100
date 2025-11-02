#!/bin/bash

# Sprint100 iOS Setup Script - Run after fixing xcode-select manually

set -e

echo "🔧 Sprint100 iOS Setup"
echo "======================"
echo ""

# Check if Xcode developer directory is set correctly
CURRENT_XCODE=$(xcode-select -p)
EXPECTED_XCODE="/Applications/Xcode.app/Contents/Developer"

if [ "$CURRENT_XCODE" != "$EXPECTED_XCODE" ]; then
    echo "❌ ERROR: Xcode developer directory not set correctly"
    echo "   Current: $CURRENT_XCODE"
    echo "   Expected: $EXPECTED_XCODE"
    echo ""
    echo "Please run this command first (requires password):"
    echo "   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

echo "✅ Xcode developer directory is correct: $CURRENT_XCODE"
echo ""

# Check if we're in the right directory
if [ ! -f "Podfile" ]; then
    echo "❌ ERROR: Podfile not found"
    echo "   Please run this script from the client/ios directory"
    exit 1
fi

echo "📦 Installing CocoaPods dependencies..."
echo "   This may take 5-10 minutes..."
echo ""

# Run pod install
pod install

echo ""
echo "✅ CocoaPods dependencies installed successfully!"
echo ""

# Check if workspace file exists
if [ -f "Sprint100Dev.xcworkspace" ]; then
    echo "📱 Opening Xcode workspace..."
    open Sprint100Dev.xcworkspace
    echo ""
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Always open Sprint100Dev.xcworkspace, NOT Sprint100Dev.xcodeproj"
else
    echo "⚠️  WARNING: Workspace file not found after pod install"
    echo "   Please check for errors above"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your project is ready in Xcode."
echo ""

