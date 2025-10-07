#!/bin/bash
# CocoaPods Installation Script for Xcode Setup
# Run this script in your terminal: bash INSTALL_COCOAPODS.sh

set -e

echo "============================================"
echo "CocoaPods Installation for Sprint100"
echo "============================================"
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew not found. Installing Homebrew first..."
    echo "You will be prompted for your password."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo "✅ Homebrew installed successfully"
else
    echo "✅ Homebrew already installed"
fi

# Install CocoaPods
if ! command -v pod &> /dev/null; then
    echo ""
    echo "🔧 Installing CocoaPods..."
    brew install cocoapods
    echo "✅ CocoaPods installed successfully"
else
    echo "✅ CocoaPods already installed"
fi

# Install pods for the project
echo ""
echo "📱 Installing iOS dependencies (this may take a few minutes)..."
cd "$(dirname "$0")/ios"
pod install

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Open the workspace in Xcode:"
echo "   open ios/Sprint100.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Select a simulator (iPhone 15 Pro recommended)"
echo "   - Press the ▶️ Play button or Cmd+R to build and run"
echo ""
echo "3. Make sure your server is running:"
echo "   cd ../server && npm run dev"
echo ""
echo "⚠️  Important: Use Sprint100.xcworkspace, NOT Sprint100.xcodeproj"
echo ""

