#!/bin/bash
# Fix Xcode Build Issues
# Run this script: bash FIX_XCODE_BUILD.sh

set -e

echo "============================================"
echo "Fixing Xcode Build Configuration"
echo "============================================"
echo ""

# Fix 1: Point xcode-select to Xcode.app
echo "1. Fixing xcode-select path..."
echo "   Current path: $(xcode-select -p)"
echo ""
echo "   Switching to Xcode.app (requires password)..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
echo "   ✅ New path: $(xcode-select -p)"
echo ""

# Fix 2: Accept Xcode license if needed
echo "2. Checking Xcode license..."
sudo xcodebuild -license accept 2>/dev/null || echo "   License already accepted"
echo "   ✅ Xcode license accepted"
echo ""

# Fix 3: Verify Xcode installation
echo "3. Verifying Xcode installation..."
xcodebuild -version
echo "   ✅ Xcode verified"
echo ""

# Fix 4: Clean CocoaPods cache and reinstall
echo "4. Cleaning and reinstalling pods..."
cd "$(dirname "$0")/ios"

echo "   Deintegrating existing pods..."
/opt/homebrew/bin/pod deintegrate

echo "   Removing Podfile.lock..."
rm -f Podfile.lock

echo "   Cleaning pod cache..."
/opt/homebrew/bin/pod cache clean --all

echo "   Installing fresh pods..."
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
/opt/homebrew/bin/pod install

echo "   ✅ Pods reinstalled"
echo ""

echo "============================================"
echo "✅ All Fixes Applied Successfully!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Close Xcode completely (Cmd+Q)"
echo "2. Reopen the workspace:"
echo "   open ios/Sprint100.xcworkspace"
echo "3. Clean build folder: Cmd+Shift+K"
echo "4. Build: Cmd+B"
echo ""
echo "If build still fails, check the error in Xcode and let me know!"
echo ""

