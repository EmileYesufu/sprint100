#!/bin/bash

echo "⚡ Fast Starting Sprint100 Expo..."
echo "==================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill any existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "expo start" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

# Navigate to client
cd client

# Start with cleared cache for first run
echo "🚀 Starting Expo with optimized settings..."
echo "📱 QR code will appear below..."
echo "==================================="
echo ""

npx expo start --tunnel --clear

