#!/bin/bash
# Complete workflow to run iOS app
# This ensures Metro bundler is running before launching the app

set -e

echo "============================================"
echo "🚀 Starting Sprint100 iOS App"
echo "============================================"
echo ""

cd "$(dirname "$0")/client"

# Load nvm to get node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Step 1: Starting Metro Bundler..."
echo ""

# Kill any existing Metro bundlers
pkill -f "react-native.*start" || true
pkill -f "expo.*start" || true

# Start Metro in the background
npx expo start &
METRO_PID=$!

echo "Metro bundler starting (PID: $METRO_PID)..."
echo ""
echo "⏳ Waiting 15 seconds for Metro to fully start..."
sleep 15

echo ""
echo "============================================"
echo "✅ Metro Bundler is Ready!"
echo "============================================"
echo ""
echo "Now you can:"
echo ""
echo "Option 1 - Run from Xcode:"
echo "  1. Open: client/ios/Sprint100.xcworkspace"
echo "  2. Click ▶️ Play button in Xcode"
echo ""
echo "Option 2 - Run from Terminal:"
echo "  cd client"
echo "  npx expo run:ios"
echo ""
echo "Option 3 - Use Expo Go:"
echo "  1. Open Expo Go app on your iPhone"
echo "  2. Scan the QR code shown above"
echo ""
echo "💡 Keep this terminal open while using the app!"
echo "   (Metro bundler must stay running)"
echo ""
echo "Press Ctrl+C to stop Metro when done"
echo ""

# Wait for user to stop
wait $METRO_PID


