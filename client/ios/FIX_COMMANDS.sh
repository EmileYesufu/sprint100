#!/bin/bash

# Copy and paste these commands into your Terminal

echo "🔧 Run these commands one at a time in Terminal:"
echo ""
echo "Step 1: Fix Xcode developer directory (requires password)"
echo "─────────────────────────────────────────────────────────"
echo "sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
echo ""
echo ""
echo "Step 2: Verify Xcode path"
echo "─────────────────────────────────────────────────────────"
echo "xcode-select -p"
echo "(Should show: /Applications/Xcode.app/Contents/Developer)"
echo ""
echo ""
echo "Step 3: Install CocoaPods dependencies"
echo "─────────────────────────────────────────────────────────"
echo "cd /Volumes/EmileDrive/sprint100/client/ios"
echo "pod install"
echo ""
echo ""
echo "Step 4: Open the workspace in Xcode"
echo "─────────────────────────────────────────────────────────"
echo "open Sprint100Dev.xcworkspace"
echo ""

