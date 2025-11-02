#!/bin/bash
# Sync iOS Assets from Expo config to Native Project
# This ensures app icon and splash screen are properly copied to iOS native project

set -e

echo "🔄 Syncing iOS assets from Expo config..."
echo ""

cd "$(dirname "$0")"

# Copy app icon
if [ -f "assets/icon.png" ]; then
  echo "✅ Copying app icon..."
  cp assets/icon.png ios/Sprint100/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png
  echo "   assets/icon.png → ios/Sprint100/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
else
  echo "❌ assets/icon.png not found!"
  exit 1
fi

# Copy splash screen
if [ -f "assets/splash-icon.png" ]; then
  echo "✅ Copying splash screen..."
  cp assets/splash-icon.png ios/Sprint100/Images.xcassets/SplashScreen.imageset/image.png
  echo "   assets/splash-icon.png → ios/Sprint100/Images.xcassets/SplashScreen.imageset/image.png"
else
  echo "❌ assets/splash-icon.png not found!"
  exit 1
fi

# Copy splash background (optional)
if [ -f "assets/splash-icon.png" ]; then
  echo "✅ Copying splash background..."
  cp assets/splash-icon.png ios/Sprint100/Images.xcassets/SplashScreenBackground.imageset/image.png
  echo "   assets/splash-icon.png → ios/Sprint100/Images.xcassets/SplashScreenBackground.imageset/image.png"
fi

echo ""
echo "✅ Assets synced successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Rebuild the app: npx expo run:ios"
echo "2. Or open Xcode and build: open ios/Sprint100.xcworkspace"
echo "3. Clean build folder if needed (Cmd+Shift+K in Xcode)"
echo ""

