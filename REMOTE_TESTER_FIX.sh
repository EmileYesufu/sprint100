#!/bin/bash

echo "🌐 Setup for Remote Tester (Different Network)"
echo "================================================"
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

# Kill everything
echo "1. Cleaning up..."
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
    echo "   ✅ Server running!"
else
    echo "   ❌ Server failed - check /tmp/sprint-server.log"
    exit 1
fi

# Start localtunnel (simpler than ngrok)
echo "4. Starting public tunnel..."
cd ..
npx localtunnel --port 4000 > /tmp/tunnel.log 2>&1 &
sleep 5

# Get tunnel URL
TUNNEL_URL=$(grep -o 'https://[^[:space:]]*' /tmp/tunnel.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "   ❌ Tunnel failed to start"
    cat /tmp/tunnel.log
    exit 1
fi

echo "   ✅ Public URL: $TUNNEL_URL"
echo ""

# Update client .env
cd client
cat > .env << ENVEOF
# Sprint100 Client - Remote Tester Configuration
EXPO_PUBLIC_API_URL=${TUNNEL_URL}
APP_ENV=development
REACT_NATIVE_APP_VERBOSE=false
ENVEOF

echo "5. Updated client/.env with public URL"
echo ""

# Test tunnel from command line
echo "6. Testing public URL..."
if curl -s "${TUNNEL_URL}/health" | grep -q "ok"; then
    echo "   ✅ Public URL is working!"
else
    echo "   ⚠️  May need to visit URL in browser first (tunnel interstitial page)"
    echo "   Visit: ${TUNNEL_URL}"
fi

echo ""
echo "7. Starting Expo with tunnel mode..."
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            QR CODE FOR REMOTE TESTER                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📡 API URL: ${TUNNEL_URL}"
echo ""
echo "📱 Send this QR code to your remote tester:"
echo "   - Screenshot the QR code below"
echo "   - Tester scans with Camera app"
echo "   - Tester taps 'Open in Expo Go'"
echo "   - Wait 30 seconds"
echo ""
echo "⚠️  IMPORTANT: Tester should visit ${TUNNEL_URL}/health"
echo "   in Safari first to bypass tunnel interstitial page!"
echo ""

npx expo start --tunnel

