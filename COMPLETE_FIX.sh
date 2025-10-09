#!/bin/bash

echo "🔧 Complete Fix for Expo Go Issues"
echo "===================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill everything
echo "1. Cleaning up all processes..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
pkill -9 -f "ngrok" 2>/dev/null
pkill -9 -f "localtunnel" 2>/dev/null
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 3

# Start server
echo "2. Starting server..."
cd server
npm run dev > /tmp/sprint-server.log 2>&1 &
sleep 4

# Verify server
echo "3. Verifying server..."
if curl -s http://localhost:4000/health | grep -q "ok"; then
    echo "   ✅ Server is working!"
else
    echo "   ❌ Server failed to start - check /tmp/sprint-server.log"
    exit 1
fi

# Get local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "192.168.1.250")
echo "   Local IP: $LOCAL_IP"

# Update client .env for local testing
cd ../client
cat > .env << ENVEOF
# Sprint100 Client - Local Network Testing
EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:4000
APP_ENV=development
REACT_NATIVE_APP_VERBOSE=false
ENVEOF

echo "4. Updated client/.env with local IP: http://${LOCAL_IP}:4000"

# Start Expo
echo "5. Starting Expo (this will show QR code)..."
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  QR CODE WILL APPEAR BELOW - SCAN WITH CAMERA APP      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📱 On your iPhone:"
echo "   1. Open Camera app"
echo "   2. Point at QR code below"
echo "   3. Tap 'Open in Expo Go'"
echo "   4. Wait 30 seconds"
echo ""

npx expo start --lan

