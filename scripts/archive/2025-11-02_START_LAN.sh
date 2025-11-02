#!/bin/bash

echo "⚡ Starting Sprint100 in LAN Mode (Faster & More Reliable)"
echo "=========================================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill any existing processes
echo "🧹 Cleaning up..."
pkill -f "expo start" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

cd client

echo "✅ Starting Expo in LAN mode..."
echo "📱 Make sure your iPhone is on the SAME WiFi network!"
echo "=========================================================="
echo ""

npx expo start --lan

