#!/bin/bash

echo "🚀 Starting Expo with QR Code..."
echo "================================"
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill any existing processes
pkill -f "expo start" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

# Navigate to client directory
cd client

echo "✅ Starting Expo with tunnel mode..."
echo "📱 The QR code will appear below!"
echo "================================"
echo ""

# Start Expo with tunnel
npx expo start --tunnel

