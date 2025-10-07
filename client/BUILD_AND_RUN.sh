#!/bin/bash
# Build and Run iOS App using Expo CLI
# This automatically handles node environment and CocoaPods

set -e

echo "============================================"
echo "Building and Running Sprint100 iOS App"
echo "============================================"
echo ""

cd "$(dirname "$0")"

# Load nvm to get node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📱 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"
echo ""

echo "🔧 Adding CocoaPods to PATH..."
export PATH="/opt/homebrew/bin:$PATH"

echo "🏗️  Building and launching iOS app..."
echo "This will:"
echo "  1. Build the native iOS app"
echo "  2. Launch the iOS simulator"
echo "  3. Start Metro bundler"
echo "  4. Install and run the app"
echo ""
echo "⏳ This may take 2-5 minutes on first build..."
echo ""

# Run expo build
npx expo run:ios --device

echo ""
echo "============================================"
echo "✅ Build Complete!"
echo "============================================"
echo ""
echo "The app should now be running in the simulator."
echo ""
echo "📝 Next steps:"
echo "1. Make sure the server is running:"
echo "   cd ../server && npm run dev"
echo ""
echo "2. Test the app features:"
echo "   - Register/Login"
echo "   - Join queue"
echo "   - Race functionality"
echo ""

