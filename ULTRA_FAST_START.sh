#!/bin/bash

echo "🚀 Ultra-Fast Expo Start"
echo "======================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Clean up
echo "🧹 Cleaning up old processes..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null  
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

cd client

echo "⚡ Starting with optimized settings..."
echo "📱 Scan QR code when it appears!"
echo ""

# Start with production optimizations
npx expo start --lan --no-dev --minify

