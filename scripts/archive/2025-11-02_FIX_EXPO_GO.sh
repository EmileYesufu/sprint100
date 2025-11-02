#!/bin/bash

echo "🔧 Fixing Expo Go Connection"
echo "============================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Step 1: Kill everything
echo "1. Stopping all processes..."
pkill -9 -f "ts-node-dev" 2>/dev/null
pkill -9 -f "expo start" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 3

# Step 2: Start server fresh
echo "2. Starting server on 0.0.0.0..."
cd server
npm run dev &
SERVER_PID=$!
sleep 5

# Step 3: Verify server
echo "3. Verifying server..."
if curl -s http://192.168.1.250:4000/api/login | grep -q "error"; then
    echo "   ✅ Server is working!"
else
    echo "   ❌ Server issue detected"
fi

# Step 4: Start Expo with tunnel (more reliable for iPhone)
echo "4. Starting Expo with tunnel mode..."
cd ../client

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  QR CODE WILL APPEAR BELOW - USE EXPO GO!   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📱 On your iPhone:"
echo "   1. Open EXPO GO app"
echo "   2. Tap 'Scan QR code'"
echo "   3. Point at QR code below"
echo "   4. Wait 30 seconds (first load is slow)"
echo ""

npx expo start --tunnel

