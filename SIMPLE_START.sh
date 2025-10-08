#!/bin/bash

echo "🚀 Simple Expo Start (No Fancy Stuff)"
echo "====================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill everything
echo "Killing old processes..."
pkill -9 -f expo 2>/dev/null
pkill -9 -f metro 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 3

# Check server
echo ""
echo "Checking server..."
if curl -s http://192.168.1.250:4000/api/login > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server not running!"
    echo ""
    echo "Start server in another terminal:"
    echo "cd /Users/emile/sprint100-1/server && npm run dev"
    echo ""
    read -p "Press Enter when server is running..."
fi

cd client

echo ""
echo "Starting Expo (basic mode)..."
echo "=============================="
echo ""
echo "After it starts:"
echo "1. Look for QR code in terminal"
echo "2. Open Expo Go on iPhone"  
echo "3. Scan QR code"
echo "4. WAIT 30 seconds for first load"
echo ""

# Start Expo in basic LAN mode
npx expo start --lan

