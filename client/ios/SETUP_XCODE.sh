#!/bin/bash

# Sprint100 iOS Setup Script
# This script fixes Xcode developer directory and installs CocoaPods dependencies

set -e

echo "🔧 Sprint100 iOS Setup"
echo "======================"
echo ""

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app/Contents/Developer" ]; then
    echo "❌ ERROR: Xcode not found at /Applications/Xcode.app"
    echo ""
    echo "Please install Xcode from the App Store first."
    exit 1
fi

echo "✅ Xcode found at /Applications/Xcode.app"
echo ""

# Check current xcode-select path
CURRENT_PATH=$(xcode-select -p)
echo "Current developer directory: $CURRENT_PATH"

if [ "$CURRENT_PATH" != "/Applications/Xcode.app/Contents/Developer" ]; then
    echo ""
    echo "⚠️  Xcode developer directory needs to be updated"
    echo "   This requires your password (for sudo)"
    echo ""
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    
    # Verify it worked
    NEW_PATH=$(xcode-select -p)
    if [ "$NEW_PATH" == "/Applications/Xcode.app/Contents/Developer" ]; then
        echo "✅ Xcode developer directory updated successfully"
    else
        echo "❌ Failed to update Xcode developer directory"
        exit 1
    fi
else
    echo "✅ Xcode developer directory is already set correctly"
fi

echo ""
echo "📦 Installing CocoaPods dependencies..."
echo "   This may take 5-10 minutes..."
echo ""

# Navigate to ios directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Run pod install
pod install

echo ""
echo "✅ CocoaPods dependencies installed successfully!"
echo ""
echo "📱 Opening Xcode workspace..."
echo ""

# Open the workspace file
if [ -f "Sprint100Dev.xcworkspace" ]; then
    open Sprint100Dev.xcworkspace
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Always open Sprint100Dev.xcworkspace, NOT Sprint100Dev.xcodeproj"
else
    echo "❌ ERROR: Workspace file not found after pod install"
    echo "   Please run 'pod install' manually and check for errors"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your project is ready in Xcode."
echo ""

